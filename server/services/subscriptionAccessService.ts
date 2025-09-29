import { User } from '@shared/schema';

export type OrganizationType = 'fantasy_sports' | 'youth_organization' | 'private_school';
export type SubscriptionStatus = 'active' | 'inactive' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'pending' | 'pending_approval' | 'free';
export type AccessLevel = 'basic' | 'standard' | 'enterprise' | 'free';

export interface SubscriptionPlan {
  id: string;
  name: string;
  organizationType: OrganizationType;
  stripePrice: string | null;
  monthlyPrice?: number;
  annualPrice?: number;
  monthlyEquivalent?: number;
  discountPercent?: number;
  billingCycleRestriction?: 'monthly-only' | 'annual-only' | 'both';
  features: string[];
  accessLevel: AccessLevel;
}

export interface SubscriptionAccess {
  organizationType: OrganizationType;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: string;
  availableFeatures: string[];
  accessLevel: AccessLevel;
  hasValidAccess: boolean;
  isFreeTier: boolean;
  billingCycle?: 'monthly' | 'annual';
  annualDiscountApplied?: boolean;
  annualDiscountPercentage?: number;
}

/**
 * Service to manage subscription access and feature restrictions based on organization type
 */
export class SubscriptionAccessService {
  
  /**
   * Subscription plan definitions based on the three-tier model
   */
  private static readonly SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
    // Tier 1: Fantasy Sports - Free Access
    fantasy_sports_free: {
      id: 'fantasy_sports_free',
      name: 'Fantasy Sports (Free)',
      organizationType: 'fantasy_sports',
      stripePrice: null, // No Stripe subscription required
      monthlyPrice: 0,
      features: [
        'fantasy_leagues',
        'basic_tournaments', 
        'tournament_creation',
        'participant_registration',
        'basic_scoring',
        'basic_analytics',
        'donation_processing' // Optional donations
      ],
      accessLevel: 'free',
      billingCycleRestriction: undefined // No billing restrictions for free tier
    },

    // Tier 2: Youth Organization - Monthly
    youth_organization_monthly: {
      id: 'youth_organization_monthly',
      name: 'Youth Organization (Monthly)',
      organizationType: 'youth_organization',
      stripePrice: 'price_youth_monthly_50',
      monthlyPrice: 50,
      features: [
        'full_tournament_management',
        'unlimited_tournaments',
        'unlimited_participants',
        'team_management',
        'advanced_scoring',
        'basic_analytics',
        'organization_branding',
        'email_notifications',
        'priority_support',
        'mobile_management'
      ],
      accessLevel: 'standard',
      billingCycleRestriction: 'both'
    },

    // Tier 2: Youth Organization - Annual (20% discount)
    youth_organization_annual: {
      id: 'youth_organization_annual',
      name: 'Youth Organization (Annual)',
      organizationType: 'youth_organization',
      stripePrice: 'price_youth_annual_480',
      annualPrice: 480,
      monthlyEquivalent: 40, // $480/12 = $40/month (vs $50 monthly)
      discountPercent: 20,
      features: [
        'full_tournament_management',
        'unlimited_tournaments',
        'unlimited_participants',
        'team_management',
        'advanced_scoring',
        'basic_analytics',
        'organization_branding',
        'email_notifications',
        'priority_support',
        'mobile_management'
      ],
      accessLevel: 'standard',
      billingCycleRestriction: 'both'
    },

    // Tier 3: Private School - Annual Only
    private_school_annual: {
      id: 'private_school_annual',
      name: 'Private School (Enterprise)',
      organizationType: 'private_school',
      stripePrice: 'price_private_school_annual_2000',
      annualPrice: 2000,
      features: [
        'enterprise_management',
        'unlimited_tournaments',
        'unlimited_participants',
        'advanced_team_management',
        'compliance_tools',
        'hipaa_ferpa_compliance',
        'advanced_analytics',
        'custom_reporting',
        'white_label_branding',
        'custom_integrations',
        'dedicated_support',
        'advanced_security',
        'audit_logging',
        'custom_domains'
      ],
      accessLevel: 'enterprise',
      billingCycleRestriction: 'annual-only'
    }
  };

  /**
   * Get subscription access information for a user
   */
  static getSubscriptionAccess(user: User): SubscriptionAccess {
    const organizationType = this.mapOrganizationType(user.organizationType);
    const subscriptionStatus = this.mapSubscriptionStatus(user.subscriptionStatus, organizationType);
    const subscriptionPlan = this.determineSubscriptionPlan(user, organizationType);
    const planConfig = this.SUBSCRIPTION_PLANS[subscriptionPlan];

    if (!planConfig) {
      // Fallback for unknown plans - provide basic access
      return {
        organizationType,
        subscriptionStatus: 'inactive',
        subscriptionPlan: 'fantasy_sports_free',
        availableFeatures: ['basic_tournaments'],
        accessLevel: 'basic',
        hasValidAccess: false,
        isFreeTier: true
      };
    }

    const hasValidAccess = this.hasValidSubscriptionAccess(subscriptionStatus, organizationType);
    const isFreeTier = organizationType === 'fantasy_sports';

    return {
      organizationType,
      subscriptionStatus,
      subscriptionPlan,
      availableFeatures: planConfig.features,
      accessLevel: planConfig.accessLevel,
      hasValidAccess,
      isFreeTier,
      billingCycle: this.getBillingCycle(user, subscriptionPlan),
      annualDiscountApplied: user.annualDiscountApplied || false,
      annualDiscountPercentage: parseFloat(user.annualDiscountPercentage || '0')
    };
  }

  /**
   * Check if user has access to a specific feature
   */
  static hasFeatureAccess(user: User, feature: string): boolean {
    const access = this.getSubscriptionAccess(user);
    
    // Fantasy sports get free access to their features
    if (access.isFreeTier) {
      return access.availableFeatures.includes(feature);
    }
    
    // Other tiers need active subscription
    return access.hasValidAccess && access.availableFeatures.includes(feature);
  }

  /**
   * Get subscription plan configuration
   */
  static getSubscriptionPlan(planId: string): SubscriptionPlan | null {
    return this.SUBSCRIPTION_PLANS[planId] || null;
  }

  /**
   * Get all available subscription plans for an organization type
   */
  static getAvailablePlans(organizationType: OrganizationType): SubscriptionPlan[] {
    return Object.values(this.SUBSCRIPTION_PLANS)
      .filter(plan => plan.organizationType === organizationType);
  }

  /**
   * Validate billing cycle for organization type
   */
  static isBillingCycleSupported(organizationType: OrganizationType, billingCycle: 'monthly' | 'annual'): boolean {
    const plans = this.getAvailablePlans(organizationType);
    
    for (const plan of plans) {
      if (plan.billingCycleRestriction === 'both' || 
          (plan.billingCycleRestriction === 'monthly-only' && billingCycle === 'monthly') ||
          (plan.billingCycleRestriction === 'annual-only' && billingCycle === 'annual')) {
        return true;
      }
    }
    
    // Fantasy sports don't have billing restrictions (they're free)
    return organizationType === 'fantasy_sports';
  }

  /**
   * Calculate annual discount information
   */
  static calculateAnnualDiscount(organizationType: OrganizationType): {
    hasDiscount: boolean;
    discountPercentage: number;
    originalAnnualPrice: number;
    discountedAnnualPrice: number;
    monthlyEquivalent: number;
  } {
    if (organizationType !== 'youth_organization') {
      return {
        hasDiscount: false,
        discountPercentage: 0,
        originalAnnualPrice: 0,
        discountedAnnualPrice: 0,
        monthlyEquivalent: 0
      };
    }

    const monthlyPlan = this.SUBSCRIPTION_PLANS.youth_organization_monthly;
    const annualPlan = this.SUBSCRIPTION_PLANS.youth_organization_annual;
    
    const originalAnnualPrice = (monthlyPlan.monthlyPrice || 50) * 12; // $600
    const discountedAnnualPrice = annualPlan.annualPrice || 480;
    const discountPercentage = 20;
    const monthlyEquivalent = discountedAnnualPrice / 12;

    return {
      hasDiscount: true,
      discountPercentage,
      originalAnnualPrice,
      discountedAnnualPrice,
      monthlyEquivalent
    };
  }

  /**
   * Get pricing information for display
   */
  static getPricingInfo() {
    return {
      fantasy_sports: {
        name: 'Fantasy Sports',
        description: 'Free access with optional donations',
        pricing: 'Free (donations welcome)',
        monthlyPrice: 0,
        annualPrice: 0,
        billingCycles: [],
        features: this.SUBSCRIPTION_PLANS.fantasy_sports_free.features,
        accessLevel: 'free',
        requiresSubscription: false
      },
      youth_organization: {
        name: 'Youth Organization',
        description: 'Complete platform access for YMCA, Boys & Girls Clubs, Pop Warner, etc.',
        pricing: '$50/month or $480/year',
        monthlyPrice: 50,
        annualPrice: 480,
        originalAnnualPrice: 600,
        discount: '20% annual discount',
        billingCycles: ['monthly', 'annual'],
        features: this.SUBSCRIPTION_PLANS.youth_organization_monthly.features,
        accessLevel: 'standard',
        requiresSubscription: true
      },
      private_school: {
        name: 'Private School',
        description: 'Enterprise platform access for private schools',
        pricing: '$2,000/year',
        monthlyPrice: null,
        annualPrice: 2000,
        billingCycles: ['annual'],
        features: this.SUBSCRIPTION_PLANS.private_school_annual.features,
        accessLevel: 'enterprise',
        requiresSubscription: true
      }
    };
  }

  // Helper methods

  private static mapOrganizationType(dbOrganizationType: string | null): OrganizationType {
    switch (dbOrganizationType) {
      case 'fantasy_sports':
        return 'fantasy_sports';
      case 'youth_organization':
        return 'youth_organization';
      case 'private_school':
        return 'private_school';
      // Legacy mappings
      case 'business':
      case 'sports_club':
      case 'club':
        return 'youth_organization';
      case 'school':
        return 'private_school';
      default:
        return 'fantasy_sports'; // Default to free tier
    }
  }

  private static mapSubscriptionStatus(dbStatus: string | null, organizationType: OrganizationType): SubscriptionStatus {
    // Fantasy sports are always considered "free" status
    if (organizationType === 'fantasy_sports') {
      return 'free';
    }

    switch (dbStatus) {
      case 'active':
        return 'active';
      case 'trialing':
        return 'trialing';
      case 'past_due':
        return 'past_due';
      case 'canceled':
        return 'canceled';
      case 'unpaid':
        return 'unpaid';
      case 'pending':
        return 'pending';
      case 'pending_approval':
        return 'pending_approval';
      default:
        return 'inactive';
    }
  }

  private static determineSubscriptionPlan(user: User, organizationType: OrganizationType): string {
    // Fantasy sports always use free plan
    if (organizationType === 'fantasy_sports') {
      return 'fantasy_sports_free';
    }

    // Check explicit pricing tier first
    if (user.pricingTier) {
      return user.pricingTier;
    }

    // Fall back to subscription plan field
    if (user.subscriptionPlan) {
      // Map legacy plan names to new tier system
      switch (user.subscriptionPlan) {
        case 'supporter':
        case 'professional':
          return organizationType === 'youth_organization' 
            ? 'youth_organization_monthly' 
            : 'private_school_annual';
        case 'champion':
        case 'enterprise':
          return 'private_school_annual';
        default:
          if (this.SUBSCRIPTION_PLANS[user.subscriptionPlan]) {
            return user.subscriptionPlan;
          }
      }
    }

    // Default plan based on organization type
    switch (organizationType) {
      case 'youth_organization':
        return 'youth_organization_monthly';
      case 'private_school':
        return 'private_school_annual';
      default:
        return 'fantasy_sports_free';
    }
  }

  private static hasValidSubscriptionAccess(status: SubscriptionStatus, organizationType: OrganizationType): boolean {
    // Fantasy sports always have valid access (free tier)
    if (organizationType === 'fantasy_sports') {
      return true;
    }

    // Other tiers need active or trialing status
    return ['active', 'trialing'].includes(status);
  }

  private static getBillingCycle(user: User, subscriptionPlan: string): 'monthly' | 'annual' | undefined {
    if (subscriptionPlan.includes('monthly')) {
      return 'monthly';
    }
    if (subscriptionPlan.includes('annual')) {
      return 'annual';
    }
    return undefined;
  }
}