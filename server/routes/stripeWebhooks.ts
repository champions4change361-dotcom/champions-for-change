import { Router } from 'express';
import { stripe } from '../nonprofitStripeConfig';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { emailService } from '../emailService';

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
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  // Update user subscription status
  await db.update(users)
    .set({
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      subscriptionPlan: 'champion',
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));

  // Send welcome email
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    await sendWelcomeEmail(user);
  }
}

// Handle subscription updates (status changes, amount changes, etc.)
async function handleSubscriptionUpdated(subscription: any) {
  console.log('📱 Subscription updated:', subscription.id, 'Status:', subscription.status);
  
  const userId = subscription.metadata?.user_id;
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

  // Send appropriate notifications based on status
  const [user] = await db.select().from(users).where(eq(users.id, userId));
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
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  // Update user to remove subscription
  await db.update(users)
    .set({
      subscriptionStatus: 'canceled',
      updatedAt: new Date()
    })
    .where(eq(users.id, userId));

  // Send farewell email with option to re-subscribe
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
  
  if (!userId) {
    console.error('No user_id found in subscription metadata');
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (user?.email) {
    // Send payment confirmation and tax receipt
    await sendPaymentReceiptEmail(user, invoice);
  }
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
async function sendWelcomeEmail(user: any) {
  const emailContent = `
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

  await emailService.send({
    to: user.email,
    subject: '🎉 Welcome to Champions for Change - Thank You for Supporting Students!',
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