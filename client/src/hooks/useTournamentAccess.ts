import { useAuth } from './useAuth';
import { useDomain } from './useDomain';

interface TournamentLimits {
  maxTournaments: number;
  maxTeamsPerTournament: number;
  allowAdvancedFormats: boolean;
  allowCustomBranding: boolean;
  allowMultiStage: boolean;
  allowLeaderboards: boolean;
  allowDataExport: boolean;
  allowAPIAccess: boolean;
  allowWhiteLabel: boolean;
  allowDomainCustomization: boolean;
  supportLevel: 'basic' | 'standard' | 'priority' | 'dedicated';
}

export function useTournamentAccess() {
  const { user, isAuthenticated } = useAuth();
  const { config } = useDomain();

  const getTournamentLimits = (): TournamentLimits => {
    // Not authenticated - Free tier with reasonable limits for testing
    if (!isAuthenticated || !user) {
      return {
        maxTournaments: 10, // Increased from 1 for testing
        maxTeamsPerTournament: 32,
        allowAdvancedFormats: true,
        allowCustomBranding: false,
        allowMultiStage: true,
        allowLeaderboards: true,
        allowDataExport: true,
        allowAPIAccess: false,
        allowWhiteLabel: false,
        allowDomainCustomization: false,
        supportLevel: 'basic'
      };
    }

    const plan = user.subscriptionPlan || 'foundation';
    const status = user.subscriptionStatus || 'inactive';
    const role = user.userRole || 'fan';

    // Subscription-based access control
    switch (plan) {
      case 'foundation':
      case 'free':
        return {
          maxTournaments: status === 'active' ? 25 : 10, // Increased limits for testing
          maxTeamsPerTournament: 64,
          allowAdvancedFormats: true,
          allowCustomBranding: true,
          allowMultiStage: true,
          allowLeaderboards: true,
          allowDataExport: true,
          allowAPIAccess: false,
          allowWhiteLabel: false,
          allowDomainCustomization: false,
          supportLevel: 'basic'
        };

      case 'tournament-organizer':
        return {
          maxTournaments: status === 'active' ? 25 : 5,
          maxTeamsPerTournament: 64,
          allowAdvancedFormats: true,
          allowCustomBranding: true,
          allowMultiStage: true,
          allowLeaderboards: true,
          allowDataExport: true,
          allowAPIAccess: false,
          allowWhiteLabel: false,
          allowDomainCustomization: false,
          supportLevel: 'standard'
        };

      case 'business-enterprise':
        return {
          maxTournaments: status === 'active' ? 100 : 10,
          maxTeamsPerTournament: 256,
          allowAdvancedFormats: true,
          allowCustomBranding: true,
          allowMultiStage: true,
          allowLeaderboards: true,
          allowDataExport: true,
          allowAPIAccess: true,
          allowWhiteLabel: true,
          allowDomainCustomization: true,
          supportLevel: 'priority'
        };

      case 'annual-pro':
        return {
          maxTournaments: -1, // Unlimited
          maxTeamsPerTournament: -1, // Unlimited
          allowAdvancedFormats: true,
          allowCustomBranding: true,
          allowMultiStage: true,
          allowLeaderboards: true,
          allowDataExport: true,
          allowAPIAccess: true,
          allowWhiteLabel: true,
          allowDomainCustomization: true,
          supportLevel: 'dedicated'
        };

      case 'district_enterprise':
      case 'enterprise':
        // District-level enterprise features
        return {
          maxTournaments: -1, // Unlimited
          maxTeamsPerTournament: -1, // Unlimited
          allowAdvancedFormats: true,
          allowCustomBranding: true,
          allowMultiStage: true,
          allowLeaderboards: true,
          allowDataExport: true,
          allowAPIAccess: true,
          allowWhiteLabel: true,
          allowDomainCustomization: true,
          supportLevel: 'dedicated'
        };

      default:
        return {
          maxTournaments: 2,
          maxTeamsPerTournament: 16,
          allowAdvancedFormats: false,
          allowCustomBranding: false,
          allowMultiStage: false,
          allowLeaderboards: true,
          allowDataExport: false,
          allowAPIAccess: false,
          allowWhiteLabel: false,
          allowDomainCustomization: false,
          supportLevel: 'basic'
        };
    }
  };

  const isDistrictUser = () => {
    if (!user) return false;
    return user.userRole?.includes('district_') || 
           user.subscriptionPlan === 'district_enterprise';
  };

  const isTournamentManager = () => {
    if (!user) return false;
    return user.userRole?.includes('tournament_') || 
           user.userRole?.includes('coach') ||
           ['tournament-organizer', 'business-enterprise', 'annual-pro'].includes(user.subscriptionPlan || '');
  };

  const canCreateTournament = (currentCount: number) => {
    const limits = getTournamentLimits();
    return limits.maxTournaments === -1 || currentCount < limits.maxTournaments;
  };

  const canUseFormat = (format: string) => {
    const limits = getTournamentLimits();
    const advancedFormats = ['double', 'pool-play', 'swiss-system', 'multi-stage'];
    
    if (advancedFormats.includes(format)) {
      return limits.allowAdvancedFormats;
    }
    return true; // Single elimination always allowed
  };

  const getUpgradeMessage = (feature: string) => {
    const plan = user?.subscriptionPlan || 'foundation';
    
    if (!isAuthenticated) {
      return `Sign up for free to unlock ${feature}`;
    }

    switch (plan) {
      case 'foundation':
      case 'free':
        return `Upgrade to Tournament Organizer ($39/month) to unlock ${feature}`;
      case 'tournament-organizer':
        return `Upgrade to Business Enterprise ($149/month) to unlock ${feature}`;
      default:
        return `Contact support to unlock ${feature}`;
    }
  };

  const limits = getTournamentLimits();

  return {
    limits,
    isDistrictUser: isDistrictUser(),
    isTournamentManager: isTournamentManager(),
    canCreateTournament,
    canUseFormat,
    getUpgradeMessage,
    isAuthenticated,
    userPlan: user?.subscriptionPlan || 'foundation',
    userStatus: user?.subscriptionStatus || 'inactive',
    userRole: user?.userRole || 'fan'
  };
}