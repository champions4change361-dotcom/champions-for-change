import { Router } from 'express';
import { stripe } from '../nonprofitStripeConfig';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { emailService } from '../emailService';
import { SubscriptionAccessService, OrganizationType } from '../services/subscriptionAccessService';

const router = Router();

// Stripe webhook endpoint for subscription events
router.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle subscription creation
async function handleSubscriptionCreated(subscription: any) {
  console.log('🎉 New subscription created:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  const organizationType = subscription.metadata?.organization_type || 'fantasy';
  const organizationName = subscription.metadata?.organization_name;
  const billingCycle = subscription.metadata?.billing_cycle;
  
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  console.log(`📊 Subscription type: ${organizationType}, billing: ${billingCycle}`);

  // Determine the correct subscription plan based on organization type and billing cycle
  let subscriptionPlan: string;
  let pricingTier: string;
  
  switch (organizationType) {
    case 'fantasy':
    case 'fantasy_sports':
      subscriptionPlan = 'fantasy_sports_donation'; // This is for optional donations, not required access
      pricingTier = 'fantasy_sports_free'; // User still has free access regardless
      break;
      
    case 'youth_organization':
      subscriptionPlan = billingCycle === 'annual' ? 'youth_organization_annual' : 'youth_organization_monthly';
      pricingTier = subscriptionPlan;
      break;
      
    case 'private_school':
      subscriptionPlan = 'private_school_annual';
      pricingTier = 'private_school_annual';
      break;
      
    default:
      console.warn(`Unknown organization type: ${organizationType}, defaulting to youth organization`);
      subscriptionPlan = billingCycle === 'annual' ? 'youth_organization_annual' : 'youth_organization_monthly';
      pricingTier = subscriptionPlan;
  }

  // Calculate annual discount information for youth organizations
  const isYouthOrgAnnual = organizationType === 'youth_organization' && billingCycle === 'annual';
  const discountInfo = isYouthOrgAnnual ? SubscriptionAccessService.calculateAnnualDiscount('youth_organization' as OrganizationType) : null;

  // Update user subscription status with comprehensive pricing tier information
  await db.update(users)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan,
      pricingTier,
      organizationType: organizationType as any,
      organizationName: organizationName || undefined,
      // Annual discount tracking
      annualDiscountApplied: isYouthOrgAnnual && discountInfo?.hasDiscount,
      annualDiscountPercentage: isYouthOrgAnnual && discountInfo?.hasDiscount ? discountInfo.discountPercentage.toString() : '0',
      annualDiscountAmount: isYouthOrgAnnual && discountInfo?.hasDiscount ? (discountInfo.originalAnnualPrice - discountInfo.discountedAnnualPrice).toString() : '0',
      originalAnnualPrice: isYouthOrgAnnual && discountInfo ? discountInfo.originalAnnualPrice.toString() : '0',
      effectiveAnnualPrice: isYouthOrgAnnual && discountInfo ? discountInfo.discountedAnnualPrice.toString() : '0',
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));

  // Send appropriate welcome email based on organization type
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    await sendWelcomeEmail(user, organizationType, subscription);
  }

  console.log(`✅ User ${userId} subscription configured: ${subscriptionPlan} (${organizationType})`);
}

// Handle subscription updates (status changes, amount changes, etc.)
async function handleSubscriptionUpdated(subscription: any) {
  console.log('📱 Subscription updated:', subscription.id, 'Status:', subscription.status);
  
  const userId = subscription.metadata?.user_id;
  const organizationType = subscription.metadata?.organization_type || 'fantasy';
  
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  // Update user subscription status
  await db.update(users)
    .set({
      subscriptionStatus: subscription.status,
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));

  // Get updated user information
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  // Get subscription access to determine impact of status change
  const subscriptionAccess = user ? SubscriptionAccessService.getSubscriptionAccess(user) : null;
  
  console.log(`📊 Subscription ${subscription.id} status: ${subscription.status} (${organizationType}), Access: ${subscriptionAccess?.hasValidAccess ? 'Valid' : 'Invalid'}`);

  // Send appropriate notifications based on status and organization type
  if (user?.email) {
    switch (subscription.status) {
      case 'active':
        await sendSubscriptionReactivatedEmail(user, subscription);
        break;
      case 'past_due':
        await sendPaymentRetryEmail(user, subscription);
        break;
      case 'canceled':
        await sendCancellationConfirmationEmail(user, subscription);
        break;
      case 'unpaid':
        await sendSubscriptionSuspendedEmail(user, subscription);
        break;
    }
  }
}

// Handle subscription deletion/cancellation
async function handleSubscriptionDeleted(subscription: any) {
  console.log('❌ Subscription deleted:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  const organizationType = subscription.metadata?.organization_type || 'fantasy';
  
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  // For fantasy sports, deletion of donation subscription doesn't affect access
  if (organizationType === 'fantasy' || organizationType === 'fantasy_sports') {
    console.log('📝 Fantasy sports donation subscription deleted - maintaining free access');
    
    // Clear the Stripe subscription but maintain free access
    await db.update(users)
      .set({
        stripeSubscriptionId: null, // Remove Stripe subscription reference
        subscriptionStatus: 'active', // Maintain active status for free tier
        subscriptionPlan: 'fantasy_sports_free', // Ensure free plan is set
        pricingTier: 'fantasy_sports_free',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  } else {
    // For paid tiers, subscription deletion affects access
    await db.update(users)
      .set({
        stripeSubscriptionId: null,
        subscriptionStatus: 'canceled',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Send appropriate farewell email based on organization type
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    await sendFarewellEmail(user);
  }
}

// Handle successful payment (generates receipt)
async function handlePaymentSucceeded(invoice: any) {
  console.log('💰 Payment succeeded for invoice:', invoice.id);
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.user_id;
  const organizationType = subscription.metadata?.organization_type || 'fantasy';
  
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    // Send payment confirmation and receipt (tax deductible for fantasy donations, regular receipt for others)
    await sendPaymentReceiptEmail(user, invoice);
  }

  console.log(`✅ Payment processed for ${organizationType} subscription: ${invoice.amount_paid / 100}`);
}

// Handle failed payment
async function handlePaymentFailed(invoice: any) {
  console.log('💳 Payment failed for invoice:', invoice.id);
  
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const userId = subscription.metadata?.user_id;
  
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    // Send payment failure notification
    await sendPaymentFailedEmail(user, invoice);
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription: any) {
  console.log('⏰ Trial ending soon for subscription:', subscription.id);
  
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    await sendTrialEndingEmail(user, subscription);
  }
}

// Email notification functions
async function sendWelcomeEmail(user: any, organizationType: string = 'fantasy', subscription: any = null) {
  let emailContent: string;
  let subject: string;
  
  if (organizationType === 'fantasy') {
    // Fantasy Sports (Donation-based) welcome email
    emailContent = `
      <h2>🎉 Welcome to Champions for Change!</h2>
      <p>Dear ${user.firstName || 'Supporter'},</p>
      
      <p>Thank you for joining our mission to support student educational opportunities! Your monthly donation will directly fund:</p>
      
      <ul>
        <li>🎓 Student educational trips and competitions</li>
        <li>🏆 Tournament participation opportunities</li>
        <li>📚 Academic support programs</li>
        <li>🚌 Transportation for educational events</li>
      </ul>
      
      <p><strong>Your Impact:</strong> Every dollar you contribute goes directly toward helping students access educational opportunities they might not otherwise have.</p>
      
      <p><strong>Platform Access:</strong> As a Champions for Change supporter, you now have unlimited access to all tournament management features.</p>
      
      <p><strong>Tax Deductibility:</strong> Your donations are 100% tax-deductible. We'll send you monthly receipts automatically.</p>
      
      <p>Ready to create your first tournament? <a href="${process.env.FRONTEND_URL}/tournament-design">Get started here</a></p>
      
      <p>Thank you for making a difference in students' lives!</p>
      
      <p>The Champions for Change Team<br>
      <small>EIN: 81-3834471 | 501(c)(3) Nonprofit Organization</small></p>
    `;
    subject = '🎉 Welcome to Champions for Change - Thank You for Supporting Students!';
  } else if (organizationType === 'youth_organization') {
    // Youth Organization welcome email
    const billingCycle = subscription?.metadata?.billing_cycle || 'monthly';
    const price = billingCycle === 'annual' ? '$480/year' : '$50/month';
    
    emailContent = `
      <h2>🏆 Welcome to Champions for Change - Youth Organization Access!</h2>
      <p>Dear ${user.firstName || 'Organization Administrator'},</p>
      
      <p>Congratulations! Your youth organization now has full access to our comprehensive tournament management platform.</p>
      
      <p><strong>Your Subscription Details:</strong></p>
      <ul>
        <li>📋 Plan: Youth Organization Platform Access</li>
        <li>💰 Pricing: ${price}${billingCycle === 'annual' ? ' (20% discount applied)' : ''}</li>
        <li>🔄 Billing: ${billingCycle}</li>
        <li>🏢 Organization: ${subscription?.metadata?.organization_name || user.organizationName}</li>
      </ul>
      
      <p><strong>What You Get:</strong></p>
      <ul>
        <li>🏆 Unlimited tournament creation and management</li>
        <li>👥 Unlimited participant registration</li>
        <li>📊 Advanced analytics and reporting</li>
        <li>🎨 Custom organization branding</li>
        <li>📞 Priority customer support</li>
        <li>📱 Mobile-friendly management tools</li>
      </ul>
      
      <p><strong>Get Started:</strong> <a href="${process.env.FRONTEND_URL}/dashboard">Access your dashboard</a> to create your first tournament!</p>
      
      <p>Perfect for YMCA, Boys & Girls Clubs, Pop Warner, and sports leagues of all sizes.</p>
      
      <p>Need help getting started? Our support team is here to assist you!</p>
      
      <p>The Champions for Change Team<br>
      <small>EIN: 81-3834471 | Supporting Youth Organizations Nationwide</small></p>
    `;
    subject = '🏆 Welcome to Champions for Change - Youth Organization Access Activated!';
  } else if (organizationType === 'private_school') {
    // Private School welcome email
    emailContent = `
      <h2>🎓 Welcome to Champions for Change - Private School Enterprise Access!</h2>
      <p>Dear ${user.firstName || 'School Administrator'},</p>
      
      <p>Welcome to Champions for Change! Your private school now has enterprise-level access to our comprehensive tournament and competition management platform.</p>
      
      <p><strong>Your Subscription Details:</strong></p>
      <ul>
        <li>📋 Plan: Private School Platform Access</li>
        <li>💰 Pricing: $2,000/year</li>
        <li>🔄 Billing: Annual</li>
        <li>🏫 School: ${subscription?.metadata?.organization_name || user.organizationName}</li>
      </ul>
      
      <p><strong>Enterprise Features Include:</strong></p>
      <ul>
        <li>🏆 Unlimited tournaments and competitions</li>
        <li>👥 Unlimited student and staff access</li>
        <li>📊 Advanced analytics and performance tracking</li>
        <li>🎨 Custom school branding and white-label options</li>
        <li>🔗 Custom integrations with school systems</li>
        <li>📞 Dedicated account manager and priority support</li>
        <li>📈 Advanced reporting and insights</li>
        <li>🔒 Enhanced security and compliance features</li>
      </ul>
      
      <p><strong>Get Started:</strong> <a href="${process.env.FRONTEND_URL}/dashboard">Access your enterprise dashboard</a> to begin setting up tournaments for your school!</p>
      
      <p>Your dedicated account manager will be in touch within 24 hours to help with onboarding and custom setup.</p>
      
      <p>The Champions for Change Team<br>
      <small>EIN: 81-3834471 | Enterprise Solutions for Educational Excellence</small></p>
    `;
    subject = '🎓 Welcome to Champions for Change - Private School Enterprise Access!';
  } else {
    // Fallback for unknown organization types
    emailContent = `
      <h2>🎉 Welcome to Champions for Change!</h2>
      <p>Dear ${user.firstName || 'User'},</p>
      
      <p>Thank you for joining Champions for Change! Your subscription is now active and you have access to our tournament management platform.</p>
      
      <p><a href="${process.env.FRONTEND_URL}/dashboard">Access your dashboard</a> to get started!</p>
      
      <p>The Champions for Change Team</p>
    `;
    subject = '🎉 Welcome to Champions for Change!';
  }

  await emailService.send({
    to: user.email,
    subject,
    html: emailContent
  });
}

async function sendSubscriptionReactivatedEmail(user: any, subscription: any) {
  const emailContent = `
    <h2>✅ Your Champions for Change Support is Active!</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>Great news! Your monthly support for Champions for Change has been reactivated.</p>
    
    <p>Your donations continue to fund student educational opportunities and your platform access is fully restored.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/dashboard">Access your dashboard</a></p>
    
    <p>Thank you for your continued support!</p>
    
    <p>The Champions for Change Team</p>
  `;

  await emailService.send({
    to: user.email,
    subject: '✅ Champions for Change Support Reactivated',
    html: emailContent
  });
}

async function sendPaymentRetryEmail(user: any, subscription: any) {
  const emailContent = `
    <h2>⚠️ Payment Issue - We'll Retry Soon</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>We had trouble processing your Champions for Change donation this month. No worries - we'll automatically retry in a few days.</p>
    
    <p>If you need to update your payment method, you can do so in your <a href="${process.env.FRONTEND_URL}/account/billing">billing settings</a>.</p>
    
    <p>Your support means the world to our students, and we appreciate your patience!</p>
    
    <p>The Champions for Change Team</p>
  `;

  await emailService.send({
    to: user.email,
    subject: '⚠️ Payment Retry - Champions for Change',
    html: emailContent
  });
}

async function sendPaymentReceiptEmail(user: any, invoice: any) {
  const donationAmount = invoice.amount_paid / 100;
  const donationDate = new Date(invoice.created * 1000).toLocaleDateString();
  
  const emailContent = `
    <h2>📧 Your Champions for Change Tax Receipt</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>Thank you for your donation! Here are your tax receipt details:</p>
    
    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
      <strong>Tax Receipt Information:</strong><br>
      <strong>Amount:</strong> $${donationAmount.toFixed(2)}<br>
      <strong>Date:</strong> ${donationDate}<br>
      <strong>Receipt Number:</strong> CFC-${invoice.id}<br>
      <strong>EIN:</strong> 81-3834471<br>
      <strong>Organization:</strong> Champions for Change<br>
      <strong>Tax Deductible:</strong> 100% (No goods or services provided)
    </div>
    
    <p><strong>Your Impact This Month:</strong> Your $${donationAmount.toFixed(2)} donation helps fund student educational opportunities including academic competitions, field trips, and tournament participation.</p>
    
    <p>Keep this email for your tax records. Need additional documentation? <a href="${process.env.FRONTEND_URL}/account/receipts">View all receipts</a></p>
    
    <p>Thank you for making a difference!</p>
    
    <p>The Champions for Change Team<br>
    <small>501 N Water St, Corpus Christi, TX 78401</small></p>
  `;

  await emailService.send({
    to: user.email,
    subject: `📧 Tax Receipt - $${donationAmount.toFixed(2)} Champions for Change Donation`,
    html: emailContent
  });
}

async function sendPaymentFailedEmail(user: any, invoice: any) {
  const emailContent = `
    <h2>💳 Payment Issue - Action Needed</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>We weren't able to process your Champions for Change donation this month. To continue supporting students, please update your payment method.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/account/billing" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Method</a></p>
    
    <p>Your support helps students access educational opportunities they wouldn't have otherwise.</p>
    
    <p>Questions? Reply to this email and we'll help!</p>
    
    <p>The Champions for Change Team</p>
  `;

  await emailService.send({
    to: user.email,
    subject: '💳 Payment Update Needed - Champions for Change',
    html: emailContent
  });
}

async function sendCancellationConfirmationEmail(user: any, subscription: any) {
  const emailContent = `
    <h2>😢 We'll Miss You - Cancellation Confirmed</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>Your Champions for Change subscription has been cancelled as requested. Your support up until now has made a real difference in students' lives.</p>
    
    <p><strong>Your Impact:</strong> Thanks to supporters like you, we've helped fund countless educational opportunities for students who needed them most.</p>
    
    <p>You'll continue to have access to your account and any tournaments you've created.</p>
    
    <p>If you change your mind, you can always <a href="${process.env.FRONTEND_URL}/pricing">restart your support</a> anytime.</p>
    
    <p>Thank you for everything you've done for our students!</p>
    
    <p>The Champions for Change Team</p>
  `;

  await emailService.send({
    to: user.email,
    subject: 'Cancellation Confirmed - Thank You for Your Support',
    html: emailContent
  });
}

async function sendSubscriptionSuspendedEmail(user: any, subscription: any) {
  const emailContent = `
    <h2>⏸️ Account Temporarily Suspended</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>Your Champions for Change account has been temporarily suspended due to payment issues.</p>
    
    <p>To reactivate your support and regain full access, please update your payment method:</p>
    
    <p><a href="${process.env.FRONTEND_URL}/account/billing" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Update Payment Method</a></p>
    
    <p>We understand that payment issues happen - we're here to help get you back to supporting students!</p>
    
    <p>The Champions for Change Team</p>
  `;

  await emailService.send({
    to: user.email,
    subject: '⏸️ Account Suspended - Payment Update Needed',
    html: emailContent
  });
}

async function sendFarewellEmail(user: any) {
  const emailContent = `
    <h2>🙏 Thank You for Your Support</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>Your Champions for Change subscription has ended, but your impact on students' lives will continue forever.</p>
    
    <p><strong>Your Legacy:</strong> Every dollar you contributed went directly to funding educational opportunities for students who needed them most.</p>
    
    <p>While your recurring support has ended, you can still:</p>
    <ul>
      <li>Make one-time donations anytime</li>
      <li>Access any tournaments you've already created</li>
      <li>Return as a supporter whenever you're ready</li>
    </ul>
    
    <p>If you ever want to restart your support: <a href="${process.env.FRONTEND_URL}/pricing">We'd love to have you back</a></p>
    
    <p>Thank you for believing in the power of education and opportunity!</p>
    
    <p>The Champions for Change Team</p>
  `;

  await emailService.send({
    to: user.email,
    subject: '🙏 Thank You for Supporting Champions for Change',
    html: emailContent
  });
}

async function sendTrialEndingEmail(user: any, subscription: any) {
  const emailContent = `
    <h2>⏰ Your Trial Ends Soon</h2>
    <p>Dear ${user.firstName || 'Supporter'},</p>
    
    <p>Your Champions for Change trial period is ending soon. To continue supporting students and accessing unlimited tournament features, please update your payment method.</p>
    
    <p><a href="${process.env.FRONTEND_URL}/account/billing" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Complete Setup</a></p>
    
    <p>Your support directly funds student educational opportunities including academic competitions and field trips.</p>
    
    <p>The Champions for Change Team</p>
  `;

  await emailService.send({
    to: user.email,
    subject: '⏰ Trial Ending - Complete Your Champions for Change Setup',
    html: emailContent
  });
}

export default router;