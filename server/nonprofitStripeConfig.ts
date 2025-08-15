import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export interface NonprofitPaymentIntent {
  type: 'donation' | 'program_fee' | 'registration';
  amount: number;
  description: string;
  donorEmail?: string;
  isDeductible: boolean;
  programName?: string;
  championsCauseId?: string;
}

export class NonprofitStripeService {
  /**
   * Create payment intent specifically for nonprofit operations
   * Tracks donation vs program fees for Stripe nonprofit reporting
   */
  static async createNonprofitPaymentIntent(params: NonprofitPaymentIntent): Promise<Stripe.PaymentIntent> {
    const metadata: Record<string, string> = {
      payment_type: params.type,
      is_tax_deductible: params.isDeductible.toString(),
      nonprofit_ein: "81-3834471", // Champions for Change EIN
      organization: "Champions for Change",
      description: params.description,
    };

    if (params.donorEmail) {
      metadata.donor_email = params.donorEmail;
    }

    if (params.programName) {
      metadata.program_name = params.programName;
    }

    if (params.championsCauseId) {
      metadata.champions_cause_id = params.championsCauseId;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: "usd",
      metadata,
      description: `${params.description} - Champions for Change Educational Mission`,
      receipt_email: params.donorEmail,
      statement_descriptor: "CHAMPIONS4CHANGE", // Appears on bank statements
    });

    return paymentIntent;
  }

  /**
   * Create donation-specific payment intent for maximum Stripe nonprofit benefits
   * These transactions qualify for the 2.2% + $0.30 rate
   */
  static async createDonationPaymentIntent(
    amount: number,
    donorEmail: string,
    cause: string,
    targetProgram?: string
  ): Promise<Stripe.PaymentIntent> {
    return this.createNonprofitPaymentIntent({
      type: 'donation',
      amount,
      description: `Educational Opportunity Donation - ${cause}`,
      donorEmail,
      isDeductible: true,
      programName: targetProgram,
    });
  }

  /**
   * Create program fee payment intent (counts toward 20% non-donation allowance)
   * Still benefits from nonprofit rates but tracked separately
   */
  static async createProgramFeePaymentIntent(
    amount: number,
    studentEmail: string,
    programName: string,
    description: string
  ): Promise<Stripe.PaymentIntent> {
    return this.createNonprofitPaymentIntent({
      type: 'program_fee',
      amount,
      description: `${programName} - ${description}`,
      donorEmail: studentEmail,
      isDeductible: false,
      programName,
    });
  }

  /**
   * Get nonprofit payment analytics for Stripe reporting
   * Helps track the 80/20 donation/program split requirement
   */
  static async getNonprofitPaymentAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalVolume: number;
    donationVolume: number;
    programFeeVolume: number;
    donationPercentage: number;
    qualifiesForNonprofitRates: boolean;
  }> {
    const payments = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
      limit: 100,
    });

    let totalVolume = 0;
    let donationVolume = 0;
    let programFeeVolume = 0;

    for (const payment of payments.data) {
      if (payment.status === 'succeeded') {
        const amount = payment.amount / 100; // Convert from cents
        totalVolume += amount;

        if (payment.metadata.is_tax_deductible === 'true') {
          donationVolume += amount;
        } else {
          programFeeVolume += amount;
        }
      }
    }

    const donationPercentage = totalVolume > 0 ? (donationVolume / totalVolume) * 100 : 0;
    const qualifiesForNonprofitRates = donationPercentage >= 80;

    return {
      totalVolume,
      donationVolume,
      programFeeVolume,
      donationPercentage,
      qualifiesForNonprofitRates,
    };
  }

  /**
   * Generate nonprofit compliance report for Stripe
   * Use this for quarterly submissions to maintain nonprofit status
   */
  static async generateNonprofitComplianceReport(quarter: number, year: number): Promise<{
    period: string;
    totalTransactions: number;
    donationTransactions: number;
    complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
    recommendations: string[];
  }> {
    const startDate = new Date(year, (quarter - 1) * 3, 1);
    const endDate = new Date(year, quarter * 3, 0);
    
    const analytics = await this.getNonprofitPaymentAnalytics(startDate, endDate);
    
    let complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
    const recommendations: string[] = [];

    if (analytics.donationPercentage >= 85) {
      complianceStatus = 'compliant';
      recommendations.push("Excellent compliance with Stripe nonprofit requirements");
    } else if (analytics.donationPercentage >= 80) {
      complianceStatus = 'at_risk';
      recommendations.push("Meeting minimum requirement but consider increasing donation ratio");
      recommendations.push("Focus on donation campaigns over program fees");
    } else {
      complianceStatus = 'non_compliant';
      recommendations.push("URGENT: Below 80% donation threshold - risk losing nonprofit rates");
      recommendations.push("Immediately shift to donation-focused payment structure");
      recommendations.push("Contact Stripe nonprofit team to discuss compliance plan");
    }

    return {
      period: `Q${quarter} ${year}`,
      totalTransactions: Math.round(analytics.totalVolume),
      donationTransactions: Math.round(analytics.donationVolume),
      complianceStatus,
      recommendations,
    };
  }
}

export { stripe };