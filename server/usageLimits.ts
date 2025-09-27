// Simplified Usage Limits for Unified Donation Model
// Champions for Change: Everyone gets the same unlimited access

import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from '@shared/schema';

// Simplified service for unified donation model
export class UsageLimitService {
  
  // Check if user can create a tournament - simplified for donation model
  static async canCreateTournament(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    suggestedAction?: string;
    unlimited: boolean;
    donationBased: boolean;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { 
        allowed: false, 
        reason: 'User not found',
        unlimited: false,
        donationBased: false
      };
    }
    
    // Check if user is a Champions for Change supporter (has any donation/subscription)
    const isSupporter = this.isChampionsForChangeSupporter(user);
    
    if (isSupporter) {
      // All supporters get unlimited access regardless of donation amount
      return { 
        allowed: true,
        unlimited: true,
        donationBased: true
      };
    }
    
    // Non-supporters get limited access to encourage joining the mission
    return {
      allowed: false,
      reason: 'Join Champions for Change to get unlimited tournament access',
      suggestedAction: 'Support our educational mission with a donation to unlock all features',
      unlimited: false,
      donationBased: true
    };
  }

  // Check if user supports Champions for Change educational mission
  static isChampionsForChangeSupporter(user: any): boolean {
    // User has any active subscription/donation
    if (user.subscriptionPlan && user.subscriptionPlan !== 'free') {
      return true;
    }
    
    // User has donation-based subscription
    if (user.donationSubscription && user.donationSubscription.active) {
      return true;
    }
    
    // User has hybrid subscription (legacy)
    if (user.hybridSubscription) {
      return true;
    }
    
    return false;
  }

  // Get access level for user - simplified
  static getUserAccessLevel(user: any): {
    level: 'supporter' | 'visitor';
    unlimited: boolean;
    features: string[];
    message: string;
  } {
    const isSupporter = this.isChampionsForChangeSupporter(user);
    
    if (isSupporter) {
      return {
        level: 'supporter',
        unlimited: true,
        features: [
          'Unlimited tournaments',
          'All tournament formats',
          'Complete white-label branding',
          'AI-powered tournament creation',
          'Unlimited teams and players',
          'Integrated payment processing',
          'Professional webstore',
          'Advanced analytics',
          'Priority support',
          'All enterprise features'
        ],
        message: 'Thank you for supporting Champions for Change! You have unlimited access to all platform features.'
      };
    }
    
    return {
      level: 'visitor',
      unlimited: false,
      features: [
        'Limited tournament viewing',
        'Basic tournament creation (1 tournament)',
        'Community features'
      ],
      message: 'Join Champions for Change to unlock unlimited tournament management and support student education!'
    };
  }

  // Reset monthly counters - no longer needed with unlimited model
  static async resetMonthlyCounterIfNeeded(user: any): Promise<void> {
    // No-op - unlimited model doesn't need monthly limits
    return;
  }

  // Legacy method for backwards compatibility
  static getSuggestedAction(user: any): string {
    return 'Join Champions for Change with a suggested $50/month donation (pay what feels right) to get unlimited access and support student education!';
  }

  // Check team creation limits - simplified
  static async canCreateTeam(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    unlimited: boolean;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { allowed: false, reason: 'User not found', unlimited: false };
    }
    
    const isSupporter = this.isChampionsForChangeSupporter(user);
    
    return {
      allowed: isSupporter,
      reason: isSupporter ? undefined : 'Join Champions for Change to create unlimited teams',
      unlimited: isSupporter
    };
  }

  // Check event participation limits - simplified
  static async canParticipateInEvent(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    unlimited: boolean;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      return { allowed: false, reason: 'User not found', unlimited: false };
    }
    
    const isSupporter = this.isChampionsForChangeSupporter(user);
    
    return {
      allowed: true, // Allow participation for everyone
      unlimited: isSupporter
    };
  }

  // Get donation suggestion based on organization type
  static getDonationSuggestion(organizationType?: string): {
    suggested: number;
    message: string;
    flexibility: string;
  } {
    const baseSuggestion = {
      suggested: 50,
      message: 'Suggested $50/month donation supports student educational opportunities',
      flexibility: 'Pay what feels right for your organization - every dollar helps students!'
    };

    switch (organizationType) {
      case 'school':
      case 'education':
        return {
          ...baseSuggestion,
          message: 'Education supporting education - your donation funds student opportunities'
        };
      case 'nonprofit':
        return {
          ...baseSuggestion,
          suggested: 25,
          message: 'Nonprofit rate - even small donations make a big impact on students'
        };
      case 'enterprise':
      case 'business':
        return {
          ...baseSuggestion,
          suggested: 100,
          message: 'Business supporters help us fund more student educational trips'
        };
      default:
        return baseSuggestion;
    }
  }

  // Use a tournament slot - simplified for unlimited model
  static async useTournamentSlot(userId: string, ipAddress?: string): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User not found');
    
    // Just update total tournaments created for analytics
    await db.update(users)
      .set({
        totalTournamentsCreated: user.totalTournamentsCreated + 1,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Get user usage statistics - simplified
  static async getUserUsageStats(userId: string): Promise<{
    unlimited: boolean;
    totalTournamentsCreated: number;
    supporterLevel: 'supporter' | 'visitor';
    message: string;
  }> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error('User not found');
    
    const isSupporter = this.isChampionsForChangeSupporter(user);
    const accessLevel = this.getUserAccessLevel(user);
    
    return {
      unlimited: isSupporter,
      totalTournamentsCreated: user.totalTournamentsCreated,
      supporterLevel: accessLevel.level,
      message: accessLevel.message
    };
  }
}

// Legacy exports for backwards compatibility
export const TOURNAMENT_CREDIT_PACKAGES = {
  // Simplified - no longer needed with unlimited model
  unlimited_support: {
    id: 'champions_for_change_support',
    name: 'Champions for Change Support',
    credits: -1, // Unlimited
    price: 50,
    description: 'Support student education, get unlimited tournament features',
    educational: true
  }
} as const;