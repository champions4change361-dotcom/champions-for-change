import { db } from "./db";
import { taxExemptionDocuments, nonprofitSubscriptions, nonprofitInvoices, organizations } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export class NonprofitBillingService {
  
  // Tax Exemption Document methods
  async uploadTaxExemptionDocument(documentData: {
    organizationId: string;
    uploaderUserId: string;
    documentType: 'federal_501c3' | 'state_sales_tax' | 'other';
    documentName: string;
    documentPath: string;
    fileSize: number;
    mimeType: string;
    federalEIN?: string;
    taxExemptNumber?: string;
    issuingState?: string;
  }) {
    const [document] = await db.insert(taxExemptionDocuments).values({
      id: randomUUID(),
      organizationId: documentData.organizationId,
      uploaderUserId: documentData.uploaderUserId,
      documentType: documentData.documentType === 'federal_501c3' ? '501c3_determination_letter' : 
                   documentData.documentType === 'state_sales_tax' ? 'sales_tax_exemption' : 'other',
      documentName: documentData.documentName,
      documentPath: documentData.documentPath,
      fileSize: documentData.fileSize,
      mimeType: documentData.mimeType,
      federalEIN: documentData.federalEIN,
      taxExemptNumber: documentData.taxExemptNumber,
      issuingState: documentData.issuingState,
      verificationStatus: 'pending',
    }).returning();
    
    return document;
  }

  async verifyTaxExemptionDocument(documentId: string, verifierId: string, status: 'verified' | 'rejected', notes?: string) {
    const [document] = await db.update(taxExemptionDocuments)
      .set({
        verificationStatus: status,
        verificationNotes: notes,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
      })
      .where(eq(taxExemptionDocuments.id, documentId))
      .returning();
    
    return document;
  }

  async getTaxExemptionDocuments(organizationId: string) {
    return await db.select()
      .from(taxExemptionDocuments)
      .where(eq(taxExemptionDocuments.organizationId, organizationId))
      .orderBy(desc(taxExemptionDocuments.createdAt));
  }

  // Nonprofit Subscription methods
  async createNonprofitSubscription(subscriptionData: {
    organizationId: string;
    billingContactUserId: string;
    subscriptionTier: 'foundation' | 'champion' | 'enterprise' | 'district_enterprise';
    flatRateAmount: number;
    billingCycle: 'monthly' | 'quarterly' | 'annual';
    paymentMethod: 'check' | 'ach' | 'wire' | 'stripe';
    paymentInstructions?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }) {
    // Calculate next billing date based on cycle
    const nextBillingDate = this.calculateNextBillingDate(subscriptionData.billingCycle);
    
    const [subscription] = await db.insert(nonprofitSubscriptions).values({
      id: randomUUID(),
      organizationId: subscriptionData.organizationId,
      billingContactUserId: subscriptionData.billingContactUserId,
      subscriptionTier: subscriptionData.subscriptionTier,
      flatRateAmount: subscriptionData.flatRateAmount.toString(),
      billingCycle: subscriptionData.billingCycle,
      subscriptionStatus: 'active',
      taxExemptStatus: 'pending_verification',
      nextBillingDate,
      paymentMethod: subscriptionData.paymentMethod,
      paymentInstructions: subscriptionData.paymentInstructions,
      billingAddress: subscriptionData.billingAddress,
    }).returning();
    
    return subscription;
  }

  async getNonprofitSubscription(organizationId: string) {
    const [subscription] = await db.select()
      .from(nonprofitSubscriptions)
      .where(eq(nonprofitSubscriptions.organizationId, organizationId));
    
    return subscription;
  }

  async updateTaxExemptStatus(subscriptionId: string, exemptionDocumentId?: string) {
    let status: 'exempt' | 'pending_verification' | 'not_exempt' = 'pending_verification';
    
    if (exemptionDocumentId) {
      // Check if the exemption document is verified
      const [doc] = await db.select()
        .from(taxExemptionDocuments)
        .where(eq(taxExemptionDocuments.id, exemptionDocumentId));
      
      if (doc?.verificationStatus === 'verified') {
        status = 'exempt';
      }
    }

    const [subscription] = await db.update(nonprofitSubscriptions)
      .set({
        taxExemptStatus: status,
        exemptionDocumentId,
      })
      .where(eq(nonprofitSubscriptions.id, subscriptionId))
      .returning();
    
    return subscription;
  }

  // Invoice generation and management
  async generateInvoice(subscriptionId: string) {
    const [subscription] = await db.select()
      .from(nonprofitSubscriptions)
      .where(eq(nonprofitSubscriptions.id, subscriptionId));
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const invoiceNumber = this.generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days to pay

    const billingPeriodStart = new Date();
    const billingPeriodEnd = subscription.billingCycle ? this.calculateBillingPeriodEnd(billingPeriodStart, subscription.billingCycle) : new Date();

    const [invoice] = await db.insert(nonprofitInvoices).values({
      id: randomUUID(),
      subscriptionId,
      invoiceNumber,
      dueDate,
      billingPeriodStart: billingPeriodStart.toISOString().split('T')[0] as any,
      billingPeriodEnd: billingPeriodEnd.toISOString().split('T')[0] as any,
      subtotal: subscription.flatRateAmount,
      taxAmount: "0.00", // Always $0 for tax-exempt nonprofits
      totalAmount: subscription.flatRateAmount,
      paymentStatus: 'pending',
    }).returning();

    // Update subscription with next billing date
    if (subscription.billingCycle) {
      const nextBillingDate = this.calculateNextBillingDate(subscription.billingCycle);
      await db.update(nonprofitSubscriptions)
        .set({
          nextBillingDate,
          lastBillingDate: new Date(),
        })
        .where(eq(nonprofitSubscriptions.id, subscriptionId));
    }

    return invoice;
  }

  async markInvoiceAsPaid(invoiceId: string, paymentMethod: 'check' | 'ach' | 'wire' | 'stripe', paymentReference?: string) {
    const [invoice] = await db.update(nonprofitInvoices)
      .set({
        paymentStatus: 'paid',
        paymentDate: new Date(),
        paymentMethod,
        paymentReference,
      })
      .where(eq(nonprofitInvoices.id, invoiceId))
      .returning();
    
    return invoice;
  }

  async getInvoicesBySubscription(subscriptionId: string) {
    return await db.select()
      .from(nonprofitInvoices)
      .where(eq(nonprofitInvoices.subscriptionId, subscriptionId))
      .orderBy(desc(nonprofitInvoices.invoiceDate));
  }

  // Helper methods
  private calculateNextBillingDate(billingCycle: 'monthly' | 'quarterly' | 'annual'): Date {
    const now = new Date();
    const nextBilling = new Date(now);
    
    switch (billingCycle) {
      case 'monthly':
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      case 'quarterly':
        nextBilling.setMonth(nextBilling.getMonth() + 3);
        break;
      case 'annual':
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        break;
    }
    
    return nextBilling;
  }

  private calculateBillingPeriodEnd(startDate: Date, billingCycle: 'monthly' | 'quarterly' | 'annual'): Date {
    const endDate = new Date(startDate);
    
    switch (billingCycle) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        endDate.setDate(endDate.getDate() - 1);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        endDate.setDate(endDate.getDate() - 1);
        break;
    }
    
    return endDate;
  }

  private generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(now.getTime()).slice(-6); // Last 6 digits of timestamp
    
    return `INV-${year}${month}${day}-${time}`;
  }

  // Pricing configuration for different tiers
  static getFlatRatePricing() {
    return {
      foundation: {
        monthly: 29,
        quarterly: 75, // ~17% discount
        annual: 290,   // ~20% discount
      },
      champion: {
        monthly: 199,
        quarterly: 549, // ~8% discount  
        annual: 2490,   // Current $2,490/year as specified
      },
      enterprise: {
        monthly: 399,
        quarterly: 1149, // ~5% discount
        annual: 4590,    // ~5% discount
      },
      district_enterprise: {
        monthly: 799,
        quarterly: 2299, // ~5% discount
        annual: 9190,    // ~5% discount
      },
    };
  }
}