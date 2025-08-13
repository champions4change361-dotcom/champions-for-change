// AI Usage Reminder System Integration
// Smart, helpful AI that guides users about their usage and upgrade options

import { UsageLimitService } from './usageLimits';
import { AIContextService } from './ai-context';

export class AIUsageAwarenessService extends AIContextService {
  
  // Generate usage-aware AI responses
  async generateUsageAwareResponse(context: any, userQuestion: string): Promise<{
    response: string;
    usageAlert?: {
      type: 'info' | 'warning' | 'limit_reached';
      message: string;
      actionSuggested?: string;
    };
    proactiveHelp?: string[];
  }> {
    const { user, currentTournament, history } = context;
    const usageStatus = await this.analyzeUsageStatus(user);
    
    // Base response generation
    let response = await this.generateContextualResponse(context, userQuestion);
    
    // Add usage awareness if appropriate
    const usageAlert = this.generateUsageAlert(usageStatus, user);
    const proactiveHelp = await this.generateProactiveHelp(usageStatus, user, history);
    
    // Enhance response with usage context if relevant
    if (this.shouldMentionUsage(userQuestion, usageStatus)) {
      response = this.enhanceResponseWithUsage(response, usageStatus, user);
    }
    
    return {
      response,
      usageAlert,
      proactiveHelp
    };
  }
  
  // Analyze user's current usage status
  async analyzeUsageStatus(user: any): Promise<{
    planType: string;
    remainingTournaments: number;
    totalAvailable: number;
    usagePercentage: number;
    creditsAvailable: number;
    status: 'plenty' | 'moderate' | 'warning' | 'critical' | 'unlimited';
    recommendedAction?: string;
  }> {
    const remaining = user.monthlyTournamentLimit - user.currentMonthTournaments;
    const percentage = (user.currentMonthTournaments / user.monthlyTournamentLimit) * 100;
    const total = remaining + user.tournamentCredits;
    
    let status: 'plenty' | 'moderate' | 'warning' | 'critical' | 'unlimited';
    let recommendedAction: string | undefined;
    
    if (user.subscriptionPlan !== 'foundation' && user.subscriptionPlan !== 'starter') {
      status = 'unlimited';
    } else if (total <= 0) {
      status = 'critical';
      recommendedAction = 'upgrade_or_purchase';
    } else if (percentage >= 80) {
      status = 'warning';
      recommendedAction = 'consider_upgrade';
    } else if (percentage >= 60) {
      status = 'moderate';
      recommendedAction = 'plan_ahead';
    } else {
      status = 'plenty';
    }
    
    return {
      planType: user.subscriptionPlan,
      remainingTournaments: remaining,
      totalAvailable: total,
      usagePercentage: percentage,
      creditsAvailable: user.tournamentCredits,
      status,
      recommendedAction
    };
  }
  
  // Generate appropriate usage alerts
  private generateUsageAlert(usageStatus: any, user: any): any {
    if (usageStatus.status === 'unlimited') return null;
    
    switch (usageStatus.status) {
      case 'critical':
        return {
          type: 'limit_reached',
          message: `You've reached your monthly limit! You have ${usageStatus.creditsAvailable} credits remaining.`,
          actionSuggested: 'upgrade_or_purchase'
        };
        
      case 'warning':
        return {
          type: 'warning',
          message: `You're using ${Math.round(usageStatus.usagePercentage)}% of your monthly tournaments (${usageStatus.totalAvailable} remaining).`,
          actionSuggested: 'consider_options'
        };
        
      case 'moderate':
        return {
          type: 'info',
          message: `You have ${usageStatus.totalAvailable} tournaments remaining this month.`
        };
        
      default:
        return null;
    }
  }
  
  // Generate proactive help suggestions
  private async generateProactiveHelp(usageStatus: any, user: any, history: any): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Don't overwhelm users who've dismissed suggestions
    const dismissed = user.aiPreferences?.dismissedUpgradePrompts || [];
    
    if (usageStatus.status === 'critical' && !dismissed.includes('critical_upgrade')) {
      suggestions.push("Need more tournaments? I can help you upgrade to unlimited or purchase additional credits.");
    }
    
    if (usageStatus.status === 'warning' && !dismissed.includes('warning_upgrade')) {
      suggestions.push("Getting close to your limit! Want me to show you expansion options?");
    }
    
    if (history.averageDonationGoal > 300 && user.subscriptionPlan === 'foundation') {
      suggestions.push("Your tournaments are raising good money! Professional plan includes advanced features for serious organizers.");
    }
    
    if (history.totalTournaments > 10 && user.subscriptionPlan === 'foundation') {
      suggestions.push("You're an experienced organizer! Unlimited plans eliminate usage worries completely.");
    }
    
    return suggestions;
  }
  
  // Determine if usage should be mentioned in response
  private shouldMentionUsage(question: string, usageStatus: any): boolean {
    const usageKeywords = ['tournament', 'create', 'setup', 'limit', 'more', 'additional'];
    const hasUsageKeyword = usageKeywords.some(keyword => 
      question.toLowerCase().includes(keyword)
    );
    
    return hasUsageKeyword && (usageStatus.status === 'warning' || usageStatus.status === 'critical');
  }
  
  // Enhance response with usage context
  private enhanceResponseWithUsage(response: string, usageStatus: any, user: any): string {
    if (usageStatus.status === 'critical') {
      return `${response}\n\nBy the way, you've reached your monthly tournament limit, but you have ${usageStatus.creditsAvailable} credits available. Would you like me to help you use those or explore upgrade options?`;
    }
    
    if (usageStatus.status === 'warning') {
      return `${response}\n\nQuick note: You have ${usageStatus.totalAvailable} tournaments remaining this month. Planning any more events?`;
    }
    
    return response;
  }
}

// Proactive Usage Reminder System
export class UsageReminderSystem {
  
  // Check if user needs usage reminders
  static async shouldSendUsageReminder(userId: string, storage: any): Promise<{
    shouldSend: boolean;
    reminderType: 'milestone' | 'warning' | 'critical' | 'upgrade_suggestion';
    message: string;
    actionItems?: string[];
  }> {
    const user = await storage.getUser(userId);
    const usageService = new AIUsageAwarenessService(storage);
    const usageStatus = await usageService.analyzeUsageStatus(user);
    
    // Check user preferences
    if (!user.aiPreferences?.usageRemindersEnabled) {
      return { shouldSend: false, reminderType: 'milestone', message: '' };
    }
    
    // Check if recently reminded
    const lastReminder = user.aiPreferences?.lastUsageReminderSent;
    if (lastReminder) {
      const hoursSinceReminder = (Date.now() - new Date(lastReminder).getTime()) / (1000 * 60 * 60);
      if (hoursSinceReminder < 24) {
        return { shouldSend: false, reminderType: 'milestone', message: '' };
      }
    }
    
    // Generate appropriate reminder
    return this.generateUsageReminder(usageStatus, user);
  }
  
  // Generate contextual usage reminders
  private static generateUsageReminder(usageStatus: any, user: any): {
    shouldSend: boolean;
    reminderType: 'milestone' | 'warning' | 'critical' | 'upgrade_suggestion';
    message: string;
    actionItems?: string[];
  } {
    const friendlyStyle = user.aiPreferences?.communicationStyle === 'friendly';
    const greeting = friendlyStyle ? "Hey there! 👋" : "Hello!";
    
    switch (usageStatus.status) {
      case 'critical':
        return {
          shouldSend: true,
          reminderType: 'critical',
          message: `${greeting} You've reached your monthly tournament limit, but I noticed you have ${usageStatus.creditsAvailable} credits available. Want me to help you use those or explore unlimited options?`,
          actionItems: [
            'Use available credits',
            'Purchase more credits',
            'Upgrade to unlimited plan',
            'View usage history'
          ]
        };
        
      case 'warning':
        return {
          shouldSend: true,
          reminderType: 'warning',
          message: `${greeting} Quick heads up - you've used ${Math.round(usageStatus.usagePercentage)}% of your monthly tournaments. You have ${usageStatus.totalAvailable} remaining. Planning any more events this month?`,
          actionItems: [
            'Plan remaining tournaments',
            'Consider credit pack',
            'Explore unlimited plans'
          ]
        };
        
      case 'moderate':
        if (user.totalTournamentsCreated > 15) {
          return {
            shouldSend: true,
            reminderType: 'upgrade_suggestion',
            message: `${greeting} I noticed you're a regular tournament organizer (${user.totalTournamentsCreated} tournaments created)! Have you considered our unlimited plans? They eliminate usage worries completely.`,
            actionItems: [
              'View unlimited plans',
              'Calculate potential savings',
              'See plan comparison'
            ]
          };
        }
        break;
    }
    
    return { shouldSend: false, reminderType: 'milestone', message: '' };
  }
  
  // Send usage reminder through appropriate channel
  static async sendUsageReminder(userId: string, reminderData: any, storage: any): Promise<void> {
    // Update last reminder timestamp
    await storage.updateUserAIPreferences(userId, {
      lastUsageReminderSent: new Date().toISOString()
    });
    
    // Log the reminder for analytics
    await storage.createUsageLog({
      userId,
      actionType: 'usage_reminder_sent',
      metadata: {
        reminderType: reminderData.reminderType,
        usageStatus: reminderData.message
      },
      timestamp: new Date()
    });
    
    // In a real implementation, you might:
    // - Send email notification
    // - Create in-app notification
    // - Add to dashboard alert queue
    // - Trigger push notification
  }
}

// Keystone AI Avatar System
export class KeystoneAvatarService {
  
  // Get domain-appropriate avatar defaults
  static getDomainAvatarDefaults(domain: string): {
    enabled: boolean;
    style: string;
    reason: string;
  } {
    switch (domain) {
      case 'tournaments.trantortournaments.org':
        return {
          enabled: false, // Professional default for education
          style: 'professional_coach',
          reason: 'Educational districts prefer professional interfaces'
        };
        
      case 'pro.trantortournaments.org':
        return {
          enabled: true, // Business users like personality
          style: 'friendly_advisor',
          reason: 'Business users appreciate helpful guidance'
        };
        
      case 'coaches.trantortournaments.org':
        return {
          enabled: true, // Community wants fun
          style: 'sports_mascot', 
          reason: 'Community platform encourages personality'
        };
        
      default:
        return {
          enabled: false,
          style: 'minimalist_icon',
          reason: 'Conservative default'
        };
    }
  }
  
  // Avatar preference setup during onboarding
  static async setupAvatarPreferences(userId: string, domain: string, storage: any): Promise<void> {
    const defaults = this.getDomainAvatarDefaults(domain);
    
    await storage.updateUserAIPreferences(userId, {
      avatarEnabled: defaults.enabled,
      avatarStyle: defaults.style
    });
  }
  
  // Generate avatar introduction message
  static generateAvatarIntroduction(domain: string, userPreferences: any): string {
    const defaults = this.getDomainAvatarDefaults(domain);
    
    if (defaults.enabled && !userPreferences.hasCompletedOnboarding) {
      return `Hi! I'm Keystone AI, your tournament assistant. I'm here to help you create amazing tournaments and manage everything smoothly. Would you like me to have a visual avatar, or prefer text-only interactions? You can change this anytime in settings.`;
    }
    
    return `Hi! I'm Keystone AI. I'm here to help you with tournament setup, donations, and anything else you need. Ready to get started?`;
  }
}