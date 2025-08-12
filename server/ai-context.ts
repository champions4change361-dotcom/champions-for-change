// 🤖 AI Database Integration Service
// Smart AI that references live tournament data for contextual help

import type { IStorage } from "./storage";
import type { User, Tournament } from "@shared/schema";

export interface AIContext {
  user: {
    id: string;
    subscriptionTier: string;
    techSkillLevel: string;
    aiPreferences: any;
    completedTutorials: string[];
    totalTournaments: number;
    successfulSetups: number;
  };
  currentTournament: {
    id: string;
    name: string;
    type: string;
    hasRegistrationFees: boolean;
    hasDonations: boolean;
    aiSetupProgress: any;
    donationSetupData: any;
  } | null;
  history: {
    totalTournaments: number;
    tournamentsWithDonations: number;
    averageDonationGoal: number;
    commonSports: string[];
  };
}

export interface AISuggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action: string;
}

export class AIContextService {
  constructor(private storage: IStorage) {}

  // Get comprehensive context for AI responses
  async getAIContext(userId: string, tournamentId?: string): Promise<AIContext> {
    const user = await this.storage.getUser(userId);
    let tournament = null;
    let userTournaments: Tournament[] = [];

    if (!user) {
      throw new Error('User not found');
    }

    if (tournamentId) {
      tournament = await this.storage.getTournament(tournamentId);
    }

    // Get user's tournament history for context
    userTournaments = await this.storage.getTournamentsByUser(userId);

    return {
      user: {
        id: userId,
        subscriptionTier: user.subscriptionPlan || 'foundation',
        techSkillLevel: user.techSkillLevel || 'intermediate',
        aiPreferences: user.aiPreferences || {},
        completedTutorials: user.completedAITutorials || [],
        totalTournaments: userTournaments.length,
        successfulSetups: userTournaments.filter(t => t.donationsEnabled).length,
      },
      currentTournament: tournament ? {
        id: tournament.id,
        name: tournament.name,
        type: tournament.tournamentType,
        hasRegistrationFees: tournament.registrationFeeEnabled || false,
        hasDonations: tournament.donationsEnabled || false,
        aiSetupProgress: tournament.aiSetupProgress || {},
        donationSetupData: tournament.donationSetupData || {},
      } : null,
      history: {
        totalTournaments: userTournaments.length,
        tournamentsWithDonations: userTournaments.filter(t => t.donationsEnabled).length,
        averageDonationGoal: this.calculateAverageDonationGoal(userTournaments),
        commonSports: this.getCommonSports(userTournaments),
      }
    };
  }

  // Update AI progress tracking
  async updateAIProgress(tournamentId: string, progress: any): Promise<void> {
    await this.storage.updateTournament(tournamentId, {
      aiSetupProgress: progress,
      updatedAt: new Date()
    });
  }

  // Smart AI response generation based on context
  async generateContextualResponse(context: AIContext, userQuestion: string): Promise<string> {
    const { user, currentTournament, history } = context;

    // Adjust response based on user's tech level
    const isBeginnerUser = user.techSkillLevel === 'beginner' || user.successfulSetups === 0;
    const isExperiencedUser = user.successfulSetups > 2;

    // Context-aware responses
    if (userQuestion.toLowerCase().includes('stripe')) {
      if (isBeginnerUser) {
        return `I'll walk you through Stripe step by step! Stripe is a payment processor that lets you accept donations safely. Since this is ${user.successfulSetups === 0 ? 'your first time' : 'still new to you'}, I'll give you detailed instructions with screenshots. Ready to start?`;
      } else if (isExperiencedUser) {
        return `I see you've set up donations ${user.successfulSetups} times before! Do you need your usual Stripe dashboard link, or are you running into a specific issue?`;
      }
    }

    if (userQuestion.toLowerCase().includes('donation goal')) {
      const avgGoal = context.history.averageDonationGoal;
      if (avgGoal > 0) {
        return `Based on your previous tournaments (average goal: $${avgGoal}), I'd suggest setting a goal between $${Math.round(avgGoal * 0.8)} and $${Math.round(avgGoal * 1.2)} for this ${currentTournament?.name || 'tournament'}. What are your main expenses this time?`;
      } else {
        return `For ${currentTournament?.type || 'this type of tournament'}, most organizers set goals between $250-500 for local events or $500-1500 for travel tournaments. What expenses are you trying to cover?`;
      }
    }

    if (userQuestion.toLowerCase().includes('help') || userQuestion.toLowerCase().includes('setup')) {
      if (currentTournament && !currentTournament.hasDonations) {
        return `I can help you set up donations for "${currentTournament.name}"! Based on your experience level (${user.successfulSetups} previous setups), I'll provide ${isBeginnerUser ? 'detailed step-by-step guidance' : 'streamlined instructions'}. Would you like to start with donation goals or Stripe setup?`;
      }
    }

    // Default helpful response
    return `I'm here to help with your ${currentTournament?.name || 'tournament'} setup! I can assist with donation goals, Stripe setup, or campaign strategies. What would you like to work on?`;
  }

  // Generate smart suggestions based on tournament state
  async generateSuggestions(context: AIContext, userQuestion: string): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    const { user, currentTournament, history } = context;

    // Smart suggestions based on tournament state
    if (currentTournament && !currentTournament.hasDonations) {
      suggestions.push({
        type: 'donation_setup',
        priority: 'high',
        title: 'Add Donation Module',
        message: `I noticed "${currentTournament.name}" doesn't have donations enabled yet. Most ${currentTournament.type} tournaments raise $${history.averageDonationGoal || 500}+ to help with expenses. Want me to set this up?`,
        action: 'setup_donations'
      });
    }

    if (currentTournament && !currentTournament.hasRegistrationFees && user.subscriptionTier === 'foundation') {
      suggestions.push({
        type: 'revenue_optimization',
        priority: 'medium',
        title: 'Consider Registration Fees',
        message: 'Adding a small registration fee ($10-25) can help cover tournament costs and reduce your donation goal.',
        action: 'setup_registration_fees'
      });
    }

    if (user.successfulSetups === 0 && currentTournament) {
      suggestions.push({
        type: 'onboarding',
        priority: 'medium',
        title: 'Tournament Setup Tutorial',
        message: 'Since this is your first tournament, would you like a guided tour of all the features?',
        action: 'start_tutorial'
      });
    }

    return suggestions.slice(0, 2); // Max 2 suggestions to avoid overwhelm
  }

  private calculateAverageDonationGoal(tournaments: Tournament[]): number {
    const tournamentsWithGoals = tournaments.filter(t => t.donationGoal && parseFloat(t.donationGoal.toString()) > 0);
    if (tournamentsWithGoals.length === 0) return 0;
    
    const total = tournamentsWithGoals.reduce((sum, t) => sum + parseFloat(t.donationGoal?.toString() || '0'), 0);
    return Math.round(total / tournamentsWithGoals.length);
  }

  private getCommonSports(tournaments: Tournament[]): string[] {
    const sports: Record<string, number> = {};
    tournaments.forEach(t => {
      if (t.sport) {
        sports[t.sport] = (sports[t.sport] || 0) + 1;
      }
    });
    
    return Object.entries(sports)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([sport]) => sport);
  }
}