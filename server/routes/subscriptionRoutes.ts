import { Router } from 'express';
import { z } from 'zod';
import { stripe } from '../nonprofitStripeConfig';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { emailService } from '../emailService';
import { StripeProductService } from '../stripeProductService';

const router = Router();

// Schema for legacy donation subscription creation (Fantasy Sports)
const createDonationSubscriptionSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  organizationName: z.string().min(1),
  donationAmount: z.number().min(5).max(10000).default(50), // $5 to $10,000 monthly
  customDonationAmount: z.number().min(5).max(10000).optional(), // CRITICAL FIX: Same bounds as donationAmount
});

// Schema for new tier-based subscription creation
const createTierSubscriptionSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  organizationName: z.string().min(1),
  organizationType: z.enum(['youth_organization', 'private_school']),
  billingCycle: z.enum(['monthly', 'annual']),
});

// Create Stripe subscription for Champions for Change donation (Fantasy Sports - Tier 1)
router.post('/api/subscriptions/create-donation-subscription', isAuthenticated, async (req, res) => {
  try {
    // CRITICAL SECURITY: Validate input data with proper bounds checking
    const validationResult = createDonationSubscriptionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: validationResult.error.errors 
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      organizationName, 
      donationAmount, 
      customDonationAmount 
    } = validationResult.data;

    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // SECURITY CRITICAL: Use custom amount if explicitly provided (including 0), otherwise use default
    // Previous logic was vulnerable: customDonationAmount || donationAmount treats 0 as falsy
    const finalAmount = customDonationAmount !== undefined ? customDonationAmount : donationAmount;

    // Get or create Stripe customer
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        name: `${firstName} ${lastName}`,
        metadata: {
          user_id: userId,
          organization: organizationName,
          nonprofit_supporter: 'true',
          champions_for_change: 'true'
        }
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: stripeCustomerId })
        .where(eq(users.id, userId));
    }

    // Create the subscription product and price (or use existing)
    const product = await stripe.products.create({
      name: 'Champions for Change Educational Support',
      description: 'Monthly donation to support student educational opportunities and tournaments',
      metadata: {
        nonprofit: 'true',
        tax_deductible: 'true',
        ein: '81-3834471',
        organization: 'Champions for Change'
      }
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(finalAmount * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        donation_amount: finalAmount.toString(),
        tax_deductible: 'true'
      }
    });

    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{
        price: price.id,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId,
        organization_name: organizationName,
        organization_type: 'fantasy',
        subscription_tier: 'fantasy_sports',
        donation_type: 'educational_support',
        nonprofit: 'true',
        tax_deductible: 'true',
        ein: '81-3834471'
      }
    });

    // Update user with subscription details
    await db.update(users)
      .set({
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status as "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid" | "pending" | "pending_approval",
        subscriptionPlan: 'fantasy_sports',
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Extract client secret for frontend
    const clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;

    res.json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
      message: 'Subscription created successfully. Complete payment to activate your Champions for Change support.',
      donationAmount: finalAmount
    });

  } catch (error: any) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error.message 
    });
  }
});

// Create Stripe subscription for tier-based organizations (Youth Organizations - Tier 2, Private Schools - Tier 3)
router.post('/api/subscriptions/create-tier-subscription', isAuthenticated, async (req, res) => {
  try {
    const validationResult = createTierSubscriptionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: validationResult.error.errors 
      });
    }

    const { 
      firstName, 
      lastName, 
      email, 
      organizationName, 
      organizationType,
      billingCycle
    } = validationResult.data;

    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Validate billing cycle is supported for organization type
    if (!StripeProductService.isBillingCycleSupported(organizationType, billingCycle)) {
      return res.status(400).json({ 
        error: `${billingCycle} billing is not supported for ${organizationType}. Private schools only support annual billing.` 
      });
    }

    // Initialize Stripe products if not already done
    await StripeProductService.initializeProducts();

    // Get appropriate price ID for organization type and billing cycle
    const priceId = await StripeProductService.getPriceId(organizationType, billingCycle);
    if (!priceId) {
      return res.status(400).json({ 
        error: `No pricing available for ${organizationType} with ${billingCycle} billing` 
      });
    }

    // Get or create Stripe customer
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        name: `${firstName} ${lastName}`,
        metadata: {
          user_id: userId,
          organization: organizationName,
          organization_type: organizationType,
          billing_cycle: billingCycle,
          nonprofit_supporter: organizationType === 'youth_organization' ? 'true' : 'false',
          champions_for_change: 'true'
        }
      });
      stripeCustomerId = customer.id;

      // Update user with Stripe customer ID
      await db.update(users)
        .set({ stripeCustomerId: stripeCustomerId })
        .where(eq(users.id, userId));
    }

    // Create the subscription using predefined price
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{
        price: priceId,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: userId,
        organization_name: organizationName,
        organization_type: organizationType,
        subscription_tier: organizationType,
        billing_cycle: billingCycle,
        nonprofit: organizationType === 'youth_organization' ? 'true' : 'false',
        tax_deductible: 'false', // These are program fees, not donations
        ein: '81-3834471'
      }
    });

    // Update user with subscription details
    await db.update(users)
      .set({
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status as "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid" | "pending" | "pending_approval",
        subscriptionPlan: organizationType,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Extract client secret for frontend
    const clientSecret = (subscription.latest_invoice as any)?.payment_intent?.client_secret;

    // Get pricing info for response
    const pricingInfoMap = StripeProductService.getPricingInfo();
    const pricingInfo = organizationType === 'youth_organization' ? pricingInfoMap.youthOrganization : pricingInfoMap.privateSchool;
    
    res.json({
      subscriptionId: subscription.id,
      clientSecret,
      status: subscription.status,
      organizationType,
      billingCycle,
      message: `${pricingInfo.name} subscription created successfully. Complete payment to activate your platform access.`,
      pricing: pricingInfo.pricing
    });

  } catch (error: any) {
    console.error('Tier subscription creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error.message 
    });
  }
});

// Get subscription status
router.get('/api/subscriptions/status', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.stripeSubscriptionId) {
      return res.json({
        hasSubscription: false,
        status: 'none',
        message: 'No active subscription found'
      });
    }

    // Get current subscription status from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    
    // Update local database with current status
    await db.update(users)
      .set({
        subscriptionStatus: subscription.status as "active" | "inactive" | "trialing" | "past_due" | "canceled" | "unpaid" | "pending" | "pending_approval",
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    // Get the donation amount from subscription
    const donationAmount = subscription.items.data[0]?.price?.unit_amount 
      ? subscription.items.data[0].price.unit_amount / 100 
      : 50;

    res.json({
      hasSubscription: true,
      subscriptionId: subscription.id,
      status: subscription.status,
      donationAmount,
      currentPeriodStart: (subscription as any).current_period_start,
      currentPeriodEnd: (subscription as any).current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      message: subscription.status === 'active' 
        ? 'Thank you for supporting Champions for Change!' 
        : 'Subscription needs attention'
    });

  } catch (error: any) {
    console.error('Subscription status error:', error);
    res.status(500).json({ 
      error: 'Failed to get subscription status',
      details: error.message 
    });
  }
});

// Update subscription amount (for pay-what-feels-right flexibility)
router.patch('/api/subscriptions/update-amount', isAuthenticated, async (req, res) => {
  try {
    const { newAmount } = req.body;
    
    // ENHANCED VALIDATION: Comprehensive input sanitization and type checking
    if (newAmount === undefined || newAmount === null) {
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: [{ message: 'newAmount is required', path: ['newAmount'] }]
      });
    }
    
    if (typeof newAmount !== 'number' || isNaN(newAmount) || !isFinite(newAmount)) {
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: [{ message: 'newAmount must be a valid number', path: ['newAmount'] }]
      });
    }
    
    if (newAmount < 5 || newAmount > 10000) {
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: [{ message: 'Donation amount must be between $5 and $10,000', path: ['newAmount'] }]
      });
    }
    
    // Validate decimal precision (max 2 decimal places for currency)
    if (Math.round(newAmount * 100) !== newAmount * 100) {
      return res.status(400).json({ 
        error: 'Invalid subscription data', 
        details: [{ message: 'Amount cannot have more than 2 decimal places', path: ['newAmount'] }]
      });
    }

    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    
    // Create new price for the updated amount
    const product = await stripe.products.create({
      name: 'Champions for Change Educational Support',
      description: 'Monthly donation to support student educational opportunities and tournaments',
      metadata: {
        nonprofit: 'true',
        tax_deductible: 'true',
        ein: '81-3834471',
        organization: 'Champions for Change'
      }
    });

    const newPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(newAmount * 100),
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        donation_amount: newAmount.toString(),
        tax_deductible: 'true'
      }
    });

    // Update subscription with new price
    await stripe.subscriptions.update(subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPrice.id,
      }],
      proration_behavior: 'always_invoice'
    });

    res.json({
      success: true,
      newAmount,
      message: `Donation amount updated to $${newAmount}/month. Thank you for your continued support!`
    });

  } catch (error: any) {
    console.error('Subscription update error:', error);
    res.status(500).json({ 
      error: 'Failed to update subscription amount',
      details: error.message 
    });
  }
});

// Cancel subscription
router.delete('/api/subscriptions/cancel', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // Cancel the subscription at period end (don't immediately cut off access)
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      message: 'Subscription will cancel at the end of the current billing period. Thank you for supporting Champions for Change!'
    });

  } catch (error: any) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ 
      error: 'Failed to cancel subscription',
      details: error.message 
    });
  }
});

// Generate tax-deductible receipt
router.get('/api/subscriptions/receipt/:year/:month', isAuthenticated, async (req, res) => {
  try {
    const { year, month } = req.params;
    const userId = req.user?.claims?.sub;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // Get invoices for the specified month/year
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId!,
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
      status: 'paid'
    });

    if (invoices.data.length === 0) {
      return res.status(404).json({ error: 'No paid invoices found for this period' });
    }

    const invoice = invoices.data[0];
    const donationAmount = invoice.amount_paid / 100;

    // Generate receipt data
    const receiptData = {
      receiptNumber: `CFC-${year}-${month.padStart(2, '0')}-${user.id.slice(-6)}`,
      donorName: `${user.firstName} ${user.lastName}`,
      donorEmail: user.email,
      organizationName: user.organizationName,
      donationAmount,
      donationDate: new Date(invoice.created * 1000).toISOString().split('T')[0],
      taxYear: year,
      ein: '81-3834471',
      nonprofitName: 'Champions for Change',
      nonprofitAddress: '501 N Water St, Corpus Christi, TX 78401',
      description: 'Educational opportunity support donation',
      isFullyDeductible: true,
      goodsOrServicesProvided: false,
      message: 'Thank you for supporting student educational opportunities!'
    };

    res.json({
      receipt: receiptData,
      message: 'Receipt generated successfully'
    });

  } catch (error: any) {
    console.error('Receipt generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate receipt',
      details: error.message 
    });
  }
});

export default router;