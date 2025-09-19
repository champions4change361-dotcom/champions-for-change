// Smart Usage Limits & Pay-Per-Tournament System
// Prevent abuse while offering flexible upgrade options

import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from './db';
import { users, usageAnalytics, tournamentCredits } from '@shared/schema';

// Tournament credit packages configuration
export const TOURNAMENT_CREDIT_PACKAGES = {
  single: {
    id: 'single_tournament',
    name: 'Single Tournament',
    credits: 1,
    price: 10,
    pricePerTournament: 10,
    description: 'Perfect for one-time events',
    popular: false
  },
  small_pack: {
    id: 'tournament_5_pack',
    name: '5-Tournament Pack',
    credits: 5,
    price: 40,
    pricePerTournament: 8,
    description: 'Save $10 vs individual purchases',
    savings: 10,
    popular: true
  },
  large_pack: {
    id: 'tournament_10_pack',
    name: '10-Tournament Pack',
    credits: 10,
    price: 70,
    pricePerTournament: 7,
    description: 'Best value for active organizers',
    savings: 30,
    popular: false
  },
  monthly_boost: {
    id: 'monthly_boost',
    name: 'Monthly Boost',
    credits: 15,
    price: 90,
    pricePerTournament: 6,
    description: '15 extra tournaments this month',
    expiresInDays: 31,
    popular: false
  }
} as const;

export class UsageLimitService {
  
  // Check if user can create a tournament based on hybrid subscription
  static async canCreateTournament(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    suggestedAction?: string;
    creditsAvailable?: number;
    requiresPerEventCharge?: boolean;
    perEventCharge?: number;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }
    
    // Reset monthly counter if needed
    await this.resetMonthlyCounterIfNeeded(user);
    
    // Get updated user data after potential reset
    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
    
    // Get hybrid subscription limits
    const limits = this.getHybridSubscriptionLimits(updatedUser);
    
    // If unlimited subscription, allow creation
    if (limits.unlimited) {
      return { allowed: true };
    }
    
    // Check if creating tournament requires per-event charge
    const requiresPerEventCharge = limits.requiresPerEventCharge;
    const perEventCharge = requiresPerEventCharge ? 50 : 0; // $50 per tournament for team subscribers hosting tournaments
    
    // Check monthly limit
    if (updatedUser.currentMonthTournaments < limits.monthlyLimit) {
      return { 
        allowed: true,
        requiresPerEventCharge,
        perEventCharge 
      };
    }
    
    // Check if they have credits
    if (updatedUser.tournamentCredits > 0) {
      return { 
        allowed: true, 
        creditsAvailable: updatedUser.tournamentCredits,
        requiresPerEventCharge,
        perEventCharge
      };
    }
    
    // Limit reached - suggest upgrade options
    return {
      allowed: false,
      reason: `You've reached your monthly limit of ${limits.monthlyLimit} tournaments`,
      suggestedAction: this.getSuggestedAction(updatedUser),
      requiresPerEventCharge,
      perEventCharge
    };
  }

  // Get tournament limits based on hybrid subscription
  static getHybridSubscriptionLimits(user: any): {
    monthlyLimit: number;
    unlimited: boolean;
    requiresPerEventCharge: boolean;
    subscriptionType: string;
  } {
    // Check if user has hybrid subscription
    if (user.hybridSubscription) {
      const { baseType, teamTier, organizerPlan, addons } = user.hybridSubscription;
      
      // Team subscribers
      if (baseType === 'team') {
        const requiresPerEventCharge = addons?.tournamentPerEvent === true;
        
        switch (teamTier) {
          case 'starter':
            return { monthlyLimit: 5, unlimited: false, requiresPerEventCharge, subscriptionType: 'team-starter' };
          case 'growing':
            return { monthlyLimit: 15, unlimited: false, requiresPerEventCharge, subscriptionType: 'team-growing' };
          case 'elite':
            return { monthlyLimit: 50, unlimited: false, requiresPerEventCharge, subscriptionType: 'team-elite' };
        }
      }
      
      // Tournament organizers
      if (baseType === 'organizer') {
        switch (organizerPlan) {
          case 'monthly':
            return { monthlyLimit: 25, unlimited: false, requiresPerEventCharge: false, subscriptionType: 'organizer-monthly' };
          case 'annual':
            return { monthlyLimit: -1, unlimited: true, requiresPerEventCharge: false, subscriptionType: 'organizer-annual' };
        }
      }
      
      // District subscriptions
      if (baseType === 'district') {
        return { monthlyLimit: -1, unlimited: true, requiresPerEventCharge: false, subscriptionType: 'district' };
      }
    }
    
    // Legacy subscription plan fallback
    const legacyLimits = this.getLegacySubscriptionLimits(user.subscriptionPlan);
    return legacyLimits;
  }

  // Legacy subscription limits for backward compatibility
  static getLegacySubscriptionLimits(subscriptionPlan: string): {
    monthlyLimit: number;
    unlimited: boolean;
    requiresPerEventCharge: boolean;
    subscriptionType: string;
  } {
    switch (subscriptionPlan) {
      case 'starter':
      case 'free':
        return { monthlyLimit: 3, unlimited: false, requiresPerEventCharge: false, subscriptionType: 'legacy-starter' };
      case 'growing':
        return { monthlyLimit: 15, unlimited: false, requiresPerEventCharge: false, subscriptionType: 'legacy-growing' };
      case 'elite':
        return { monthlyLimit: 50, unlimited: false, requiresPerEventCharge: false, subscriptionType: 'legacy-elite' };
      case 'tournament-organizer':
        return { monthlyLimit: 25, unlimited: false, requiresPerEventCharge: false, subscriptionType: 'legacy-organizer' };
      case 'business-enterprise':
      case 'district-enterprise':
      case 'enterprise':
      case 'annual-pro':
        return { monthlyLimit: -1, unlimited: true, requiresPerEventCharge: false, subscriptionType: 'legacy-enterprise' };
      default:
        return { monthlyLimit: 2, unlimited: false, requiresPerEventCharge: false, subscriptionType: 'legacy-default' };
    }
  }

  // Get suggested action based on subscription
  static getSuggestedAction(user: any): string {
    if (user.hybridSubscription?.baseType === 'team') {
      return 'upgrade_team_tier_or_buy_credits';
    } else if (user.hybridSubscription?.baseType === 'organizer') {
      return 'upgrade_to_annual_or_buy_credits';
    }
    return 'upgrade_or_buy_credits';
  }
  
  // Use a tournament slot (monthly limit or credit)
  static async useTournamentSlot(userId: string, ipAddress?: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User not found');
    
    if (user.tournamentCredits > 0) {
      // Use credit first
      await db.update(users)
        .set({
          tournamentCredits: user.tournamentCredits - 1,
          totalTournamentsCreated: user.totalTournamentsCreated + 1,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    } else {
      // Use monthly allowance
      await db.update(users)
        .set({
          currentMonthTournaments: user.currentMonthTournaments + 1,
          totalTournamentsCreated: user.totalTournamentsCreated + 1,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
    }
    
    // Log usage for analytics
    await db.insert(usageAnalytics).values({
      userId,
      actionType: 'tournament_created',
      ipAddress,
      timestamp: new Date()
    });
  }
  
  // Reset monthly counter when new month starts
  static async resetMonthlyCounterIfNeeded(user: any): Promise<void> {
    const now = new Date();
    const lastReset = new Date(user.lastMonthReset);
    
    // Check if we're in a new month
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await db.update(users)
        .set({
          currentMonthTournaments: 0,
          lastMonthReset: now,
          updatedAt: now
        })
        .where(eq(users.id, user.id));
    }
  }
  
  // Detect potential abuse patterns
  static async detectAbusePatterns(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
    confidence: number;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { suspicious: false, reasons: [], confidence: 0 };
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentLogs = await db.select()
      .from(usageAnalytics)
      .where(and(
        eq(usageAnalytics.userId, userId),
        gte(usageAnalytics.timestamp, thirtyDaysAgo)
      ))
      .orderBy(desc(usageAnalytics.timestamp));
    
    const suspiciousIndicators = [];
    let confidence = 0;
    
    // Check for multiple accounts from same IP (if we have IP data)
    if (user.registrationIP) {
      const sameIPUsers = await db.select()
        .from(users)
        .where(eq(users.registrationIP, user.registrationIP));
      
      if (sameIPUsers.length > 3) {
        suspiciousIndicators.push('Multiple accounts from same IP');
        confidence += 0.3;
      }
    }
    
    // Check for rapid account creation and tournament usage
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 7 && user.totalTournamentsCreated >= 5) {
      suspiciousIndicators.push('High usage on new account');
      confidence += 0.4;
    }
    
    // Check for suspicious email patterns
    if (user.email?.includes('+') || user.email?.match(/\d{4,}/)) {
      suspiciousIndicators.push('Suspicious email format');
      confidence += 0.2;
    }
    
    // Check for unusual usage patterns
    const tournamentCreations = recentLogs.filter(log => log.actionType === 'tournament_created');
    if (tournamentCreations.length > 20) {
      suspiciousIndicators.push('Unusually high tournament creation rate');
      confidence += 0.3;
    }
    
    return {
      suspicious: confidence > 0.5,
      reasons: suspiciousIndicators,
      confidence
    };
  }
  
  // Get user usage statistics
  static async getUserUsageStats(userId: string): Promise<{
    currentMonthTournaments: number;
    monthlyLimit: number;
    creditsAvailable: number;
    totalTournamentsCreated: number;
    subscriptionPlan: string;
    usagePercentage: number;
    remainingTournaments: number;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User not found');
    
    // Reset monthly counter if needed
    await this.resetMonthlyCounterIfNeeded(user);
    
    // Get updated user data
    const [updatedUser] = await db.select().from(users).where(eq(users.id, userId));
    
    const remainingTournaments = updatedUser.monthlyTournamentLimit - updatedUser.currentMonthTournaments;
    const usagePercentage = (updatedUser.currentMonthTournaments / updatedUser.monthlyTournamentLimit) * 100;
    
    return {
      currentMonthTournaments: updatedUser.currentMonthTournaments,
      monthlyLimit: updatedUser.monthlyTournamentLimit,
      creditsAvailable: updatedUser.tournamentCredits,
      totalTournamentsCreated: updatedUser.totalTournamentsCreated,
      subscriptionPlan: updatedUser.subscriptionPlan,
      usagePercentage,
      remainingTournaments: Math.max(0, remainingTournaments)
    };
  }
  
  // Add credits to user account (called by Stripe webhook)
  static async addCreditsToUser(
    userId: string,
    credits: number,
    packageType: string,
    paymentAmount: number,
    stripePaymentId?: string
  ): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User not found');
    
    // Update user credits
    await db.update(users)
      .set({
        tournamentCredits: user.tournamentCredits + credits,
        creditsPurchased: Number(user.creditsPurchased) + paymentAmount,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Record the purchase
    await db.insert(tournamentCredits).values({
      userId,
      packageType: packageType as any,
      creditsAmount: credits,
      priceAmount: paymentAmount.toString(),
      stripePaymentId,
      status: 'completed'
    });
    
    // Log the purchase
    await db.insert(usageAnalytics).values({
      userId,
      actionType: 'credit_purchased',
      timestamp: new Date(),
      metadata: { credits, packageType, amount: paymentAmount }
    });
  }
}