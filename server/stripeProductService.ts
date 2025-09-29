import { stripe } from './nonprofitStripeConfig';

export interface StripeProductConfig {
  productId: string;
  priceIds: {
    monthly?: string;
    annual?: string;
  };
}

export interface TierPricing {
  fantasy: StripeProductConfig;
  youthOrganization: StripeProductConfig;
  privateSchool: StripeProductConfig;
}

/**
 * Service to manage Stripe products and prices for the three-tier subscription model
 */
export class StripeProductService {
  private static tierPricing: TierPricing | null = null;

  /**
   * Initialize and create all Stripe products and prices for the new tier structure
   */
  static async initializeProducts(): Promise<TierPricing> {
    console.log('🔧 Initializing Stripe products for three-tier structure...');

    try {
      // Create Youth Organization Product
      const youthOrgProduct = await stripe.products.create({
        id: 'youth_organization_platform_access', // Fixed ID for consistency
        name: 'Youth Organization Platform Access',
        description: 'Complete platform access for YMCA, Boys & Girls Clubs, Pop Warner, and similar organizations',
        metadata: {
          tier: 'youth_organization',
          nonprofit: 'true',
          tax_deductible: 'false', // Program fees, not donations
          ein: '81-3834471',
          organization: 'Champions for Change',
          target_organizations: 'YMCA, Boys & Girls Clubs, Pop Warner, sports leagues'
        }
      });

      // Create Youth Organization Prices
      const youthOrgMonthlyPrice = await stripe.prices.create({
        product: youthOrgProduct.id,
        unit_amount: 5000, // $50.00
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          tier: 'youth_organization',
          billing_cycle: 'monthly',
          price_description: '$50/month for youth organizations'
        }
      });

      const youthOrgAnnualPrice = await stripe.prices.create({
        product: youthOrgProduct.id,
        unit_amount: 48000, // $480.00 (20% discount from $600)
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        metadata: {
          tier: 'youth_organization',
          billing_cycle: 'annual',
          discount_percentage: '20',
          original_price: '600',
          price_description: '$480/year for youth organizations (20% discount)'
        }
      });

      console.log('✅ Youth Organization product created:', youthOrgProduct.id);

      // Create Private School Product
      const privateSchoolProduct = await stripe.products.create({
        id: 'private_school_platform_access', // Fixed ID for consistency
        name: 'Private School Platform Access',
        description: 'Enterprise platform access for private schools and charter schools',
        metadata: {
          tier: 'private_school',
          nonprofit: 'false', // Private schools may not be nonprofits
          tax_deductible: 'false', // Program fees, not donations
          ein: '81-3834471',
          organization: 'Champions for Change',
          target_organizations: 'Private schools, charter schools'
        }
      });

      // Create Private School Price (Annual only)
      const privateSchoolAnnualPrice = await stripe.prices.create({
        product: privateSchoolProduct.id,
        unit_amount: 200000, // $2,000.00
        currency: 'usd',
        recurring: {
          interval: 'year',
        },
        metadata: {
          tier: 'private_school',
          billing_cycle: 'annual',
          price_description: '$2,000/year for private schools'
        }
      });

      console.log('✅ Private School product created:', privateSchoolProduct.id);

      // Return the tier pricing configuration
      this.tierPricing = {
        fantasy: {
          productId: 'dynamic', // Fantasy sports continue to use dynamic product creation
          priceIds: {
            monthly: 'dynamic' // Indicates this uses the existing donation-based system
          }
        },
        youthOrganization: {
          productId: youthOrgProduct.id,
          priceIds: {
            monthly: youthOrgMonthlyPrice.id,
            annual: youthOrgAnnualPrice.id
          }
        },
        privateSchool: {
          productId: privateSchoolProduct.id,
          priceIds: {
            annual: privateSchoolAnnualPrice.id
          }
        }
      };

      console.log('🎉 All Stripe products and prices created successfully!');
      console.log('💰 Pricing structure:');
      console.log('  - Youth Organizations: $50/month or $480/year');
      console.log('  - Private Schools: $2,000/year');
      console.log('  - Fantasy Sports: Donation-based (unchanged)');

      return this.tierPricing;

    } catch (error: any) {
      // Handle the case where products already exist
      if (error.code === 'resource_already_exists') {
        console.log('ℹ️ Products already exist, retrieving existing configuration...');
        return await this.getExistingProducts();
      }
      
      console.error('❌ Error creating Stripe products:', error);
      throw error;
    }
  }

  /**
   * Get existing products and prices if they were already created
   */
  static async getExistingProducts(): Promise<TierPricing> {
    try {
      // Retrieve existing products by their fixed IDs
      const youthOrgProduct = await stripe.products.retrieve('youth_organization_platform_access');
      const privateSchoolProduct = await stripe.products.retrieve('private_school_platform_access');

      // Get prices for these products
      const youthOrgPrices = await stripe.prices.list({ product: youthOrgProduct.id });
      const privateSchoolPrices = await stripe.prices.list({ product: privateSchoolProduct.id });

      // Find monthly and annual prices for youth org
      const youthOrgMonthlyPrice = youthOrgPrices.data.find(p => p.recurring?.interval === 'month');
      const youthOrgAnnualPrice = youthOrgPrices.data.find(p => p.recurring?.interval === 'year');
      const privateSchoolAnnualPrice = privateSchoolPrices.data.find(p => p.recurring?.interval === 'year');

      this.tierPricing = {
        fantasy: {
          productId: 'dynamic',
          priceIds: {
            monthly: 'dynamic'
          }
        },
        youthOrganization: {
          productId: youthOrgProduct.id,
          priceIds: {
            monthly: youthOrgMonthlyPrice?.id || '',
            annual: youthOrgAnnualPrice?.id || ''
          }
        },
        privateSchool: {
          productId: privateSchoolProduct.id,
          priceIds: {
            annual: privateSchoolAnnualPrice?.id || ''
          }
        }
      };

      console.log('✅ Retrieved existing Stripe products and prices');
      return this.tierPricing;

    } catch (error: any) {
      console.error('❌ Error retrieving existing products:', error);
      throw error;
    }
  }

  /**
   * Get the current tier pricing configuration
   */
  static async getTierPricing(): Promise<TierPricing> {
    if (!this.tierPricing) {
      return await this.initializeProducts();
    }
    return this.tierPricing;
  }

  /**
   * Get price ID based on organization type and billing frequency
   */
  static async getPriceId(organizationType: 'fantasy' | 'youth_organization' | 'private_school', billingCycle: 'monthly' | 'annual'): Promise<string | null> {
    const pricing = await this.getTierPricing();
    
    switch (organizationType) {
      case 'fantasy':
        return 'dynamic'; // Fantasy sports use dynamic pricing
      
      case 'youth_organization':
        if (billingCycle === 'monthly') {
          return pricing.youthOrganization.priceIds.monthly || null;
        } else if (billingCycle === 'annual') {
          return pricing.youthOrganization.priceIds.annual || null;
        }
        break;
      
      case 'private_school':
        if (billingCycle === 'annual') {
          return pricing.privateSchool.priceIds.annual || null;
        }
        // Private schools only support annual billing
        return null;
    }
    
    return null;
  }

  /**
   * Get product ID based on organization type
   */
  static async getProductId(organizationType: 'fantasy' | 'youth_organization' | 'private_school'): Promise<string | null> {
    const pricing = await this.getTierPricing();
    
    switch (organizationType) {
      case 'fantasy':
        return 'dynamic'; // Fantasy sports use dynamic product creation
      case 'youth_organization':
        return pricing.youthOrganization.productId;
      case 'private_school':
        return pricing.privateSchool.productId;
    }
    
    return null;
  }

  /**
   * Validate if a billing cycle is supported for an organization type
   */
  static isBillingCycleSupported(organizationType: 'fantasy' | 'youth_organization' | 'private_school', billingCycle: 'monthly' | 'annual'): boolean {
    switch (organizationType) {
      case 'fantasy':
        return billingCycle === 'monthly'; // Fantasy sports only support monthly donations
      case 'youth_organization':
        return billingCycle === 'monthly' || billingCycle === 'annual'; // Both supported
      case 'private_school':
        return billingCycle === 'annual'; // Only annual supported
    }
    
    return false;
  }

  /**
   * Get pricing information for display purposes
   */
  static getPricingInfo() {
    return {
      fantasy: {
        name: 'Fantasy Sports',
        description: 'Donation-based support for Champions for Change',
        pricing: 'Pay-what-feels-right ($5-$10,000/month)',
        billingCycles: ['monthly'],
        features: ['Tournament access', 'Tax-deductible donations', 'Educational mission support']
      },
      youthOrganization: {
        name: 'Youth Organization',
        description: 'Complete platform access for youth organizations',
        pricing: '$50/month or $480/year (20% discount)',
        billingCycles: ['monthly', 'annual'],
        features: ['Full tournament management', 'Unlimited participants', 'Organization branding', 'Priority support']
      },
      privateSchool: {
        name: 'Private School',
        description: 'Enterprise platform access for private schools',
        pricing: '$2,000/year',
        billingCycles: ['annual'],
        features: ['Enterprise features', 'Advanced analytics', 'Custom integrations', 'Dedicated support']
      }
    };
  }
}