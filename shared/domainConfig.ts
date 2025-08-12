// ===================================================================
// MULTI-DOMAIN SEPARATION ARCHITECTURE 🚢⚡
// DISTRICT-SAFE EMPIRE + FANTASY PLAYGROUND
// ===================================================================

export interface DomainFeatures {
  fantasyLeagues: boolean;
  adultContent: boolean;
  donationButtons: boolean;
  ageVerification: boolean;
  gambling: boolean;
  survivalLeagues: boolean;
  dailyFantasy?: boolean;
  professionalSports?: boolean;
  advancedAnalytics?: boolean;
}

export interface DomainBranding {
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  tagline: string;
  footerText: string;
}

export interface DomainConfig {
  brand: string;
  theme: string;
  features: DomainFeatures;
  userRoles: string[];
  allowedSports: string[];
  branding: DomainBranding;
  navigation: string[];
  subscriptionTiers: string[];
}

// DOMAIN CONFIGURATION SYSTEM
export const DOMAIN_CONFIGS: Record<string, DomainConfig> = {
  // DISTRICT-SAFE DOMAIN (Clean, Educational)
  'tournaments.trantortournaments.org': {
    brand: 'SCHOLASTIC_TOURNAMENTS',
    theme: 'educational',
    features: {
      fantasyLeagues: false,
      adultContent: false,
      donationButtons: false,
      ageVerification: false,
      gambling: false,
      survivalLeagues: false
    },
    userRoles: ['Tournament Manager', 'District Athletic Director', 'School Athletic Director', 'Coach', 'Scorekeeper/Judge', 'Athlete/Fan'],
    allowedSports: ['basketball', 'track_field', 'soccer', 'academic', 'all_youth_safe'],
    branding: {
      primaryColor: '#1f4e79', // Professional blue
      secondaryColor: '#f4d03f', // Academic gold
      logo: '/assets/scholastic-logo.png',
      tagline: 'Professional Tournament Management for Schools',
      footerText: 'Empowering Educational Athletics'
    },
    navigation: ['Tournaments', 'Teams', 'Results', 'Analytics', 'Admin'],
    subscriptionTiers: ['Free', 'Foundation', 'Champion', 'Enterprise', 'District Enterprise']
  },

  // FANTASY PLAYGROUND DOMAIN (Adult Entertainment)
  'fantasy.trantortournaments.org': {
    brand: 'FANTASY_LEAGUE_CENTRAL',
    theme: 'entertainment',
    features: {
      fantasyLeagues: true,
      adultContent: true,
      donationButtons: true,
      ageVerification: true,
      gambling: false, // Still no gambling, just fantasy fun
      survivalLeagues: true,
      dailyFantasy: true,
      professionalSports: true
    },
    userRoles: ['Fantasy Commissioner', 'Fantasy Participant'],
    allowedSports: ['nfl', 'nba', 'mlb', 'nhl', 'esports', 'college_sports'],
    branding: {
      primaryColor: '#6a0dad', // Fantasy purple
      secondaryColor: '#ffd700', // Gold highlights
      logo: '/assets/fantasy-logo.png',
      tagline: 'Free Fantasy Sports - Compete for Glory!',
      footerText: 'Support the platform - Donate if you enjoy!'
    },
    navigation: ['Fantasy Leagues', 'My Teams', 'Leaderboards', 'Player Stats', 'Donate'],
    subscriptionTiers: ['Free', 'Fantasy Pro']
  },

  // PROFESSIONAL/CLUB DOMAIN (Middle Tier)
  'pro.trantortournaments.org': {
    brand: 'TOURNAMENT_PRO',
    theme: 'professional',
    features: {
      fantasyLeagues: true,
      adultContent: true,
      donationButtons: false,
      ageVerification: true,
      gambling: false,
      survivalLeagues: true,
      advancedAnalytics: true
    },
    userRoles: ['Tournament Manager', 'League Commissioner', 'Team Manager', 'Player', 'Fantasy Commissioner'],
    allowedSports: ['all_adult_sports', 'esports', 'professional_leagues'],
    branding: {
      primaryColor: '#ff6b35', // Energy orange
      secondaryColor: '#004e98', // Professional navy
      logo: '/assets/pro-logo.png',
      tagline: 'Professional Tournament Management',
      footerText: 'Elevate Your Competition'
    },
    navigation: ['Tournaments', 'Fantasy', 'Teams', 'Analytics', 'Billing'],
    subscriptionTiers: ['Foundation', 'Champion', 'Enterprise']
  },

  // Default development domain
  'localhost:5000': {
    brand: 'SCHOLASTIC_TOURNAMENTS',
    theme: 'educational',
    features: {
      fantasyLeagues: false,
      adultContent: false,
      donationButtons: false,
      ageVerification: false,
      gambling: false,
      survivalLeagues: false
    },
    userRoles: ['Tournament Manager', 'District Athletic Director', 'School Athletic Director', 'Coach', 'Scorekeeper/Judge', 'Athlete/Fan'],
    allowedSports: ['basketball', 'track_field', 'soccer', 'academic', 'all_youth_safe'],
    branding: {
      primaryColor: '#1f4e79',
      secondaryColor: '#f4d03f',
      logo: '/assets/scholastic-logo.png',
      tagline: 'Professional Tournament Management for Schools',
      footerText: 'Empowering Educational Athletics'
    },
    navigation: ['Tournaments', 'Teams', 'Results', 'Analytics', 'Admin'],
    subscriptionTiers: ['Free', 'Foundation', 'Champion', 'Enterprise', 'District Enterprise']
  }
};

// ===================================================================
// DOMAIN DETECTION & ROUTING SYSTEM 🎯
// ===================================================================

export class DomainManager {
  private currentDomain: string;
  public config: DomainConfig;

  constructor() {
    this.currentDomain = this.detectDomain();
    this.config = this.loadDomainConfig();
  }

  detectDomain(): string {
    // In production, use actual domain
    if (typeof window !== 'undefined') {
      return window.location.hostname;
    }
    
    // For development/testing
    return process.env.DOMAIN_OVERRIDE || 'localhost:5000';
  }

  loadDomainConfig(): DomainConfig {
    const config = DOMAIN_CONFIGS[this.currentDomain];
    
    if (!config) {
      // Default to safe district version if domain not recognized
      console.warn(`Unknown domain: ${this.currentDomain}, defaulting to district-safe mode`);
      return DOMAIN_CONFIGS['tournaments.trantortournaments.org'];
    }
    
    return config;
  }

  // FEATURE GATE SYSTEM
  isFeatureEnabled(featureName: keyof DomainFeatures): boolean {
    return this.config.features[featureName] || false;
  }

  // BRAND CONFIGURATION
  getBrandConfig() {
    return {
      name: this.config.brand,
      theme: this.config.theme,
      branding: this.config.branding,
      navigation: this.config.navigation
    };
  }

  // USER ROLE FILTERING
  getAllowedUserRoles(): string[] {
    return this.config.userRoles;
  }

  // SPORT FILTERING
  getAllowedSports(): string[] {
    return this.config.allowedSports;
  }

  // SUBSCRIPTION TIER FILTERING
  getAvailableSubscriptionTiers(): string[] {
    return this.config.subscriptionTiers;
  }

  // DOMAIN TYPE CHECKING
  isSchoolSafe(): boolean {
    return this.config.brand === 'SCHOLASTIC_TOURNAMENTS';
  }

  isFantasyDomain(): boolean {
    return this.config.brand === 'FANTASY_LEAGUE_CENTRAL';
  }

  isProDomain(): boolean {
    return this.config.brand === 'TOURNAMENT_PRO';
  }
}

// ===================================================================
// COMPONENT RENDERING SYSTEM 🎨
// ===================================================================

export class ComponentRenderer {
  constructor(private domain: DomainManager) {}

  // NAVIGATION COMPONENT
  renderNavigation() {
    const config = this.domain.getBrandConfig();
    
    return {
      brand: config.branding.tagline,
      logo: config.branding.logo,
      primaryColor: config.branding.primaryColor,
      menuItems: config.navigation,
      showDonateButton: this.domain.isFeatureEnabled('donationButtons'),
      showFantasySection: this.domain.isFeatureEnabled('fantasyLeagues')
    };
  }

  // TOURNAMENT CREATION FORM
  renderTournamentCreation() {
    const allowedSports = this.domain.getAllowedSports();
    const showFantasy = this.domain.isFeatureEnabled('fantasyLeagues');
    
    return {
      availableSports: this.filterSportsBySafety(allowedSports),
      showFantasyOptions: showFantasy,
      showAgeVerification: this.domain.isFeatureEnabled('ageVerification'),
      tournamentTypes: this.getFilteredTournamentTypes()
    };
  }

  // USER REGISTRATION FORM
  renderUserRegistration() {
    return {
      requireAgeVerification: this.domain.isFeatureEnabled('ageVerification'),
      showFantasyAgreement: this.domain.isFeatureEnabled('fantasyLeagues'),
      availableRoles: this.domain.getAllowedUserRoles(),
      showDonationInfo: this.domain.isFeatureEnabled('donationButtons')
    };
  }

  private filterSportsBySafety(allowedSports: string[]) {
    const safeForDistricts = [
      'basketball', 'soccer', 'track_field', 'academic', 'baseball', 'volleyball'
    ];
    
    const adultSports = [
      'nfl', 'nba', 'mlb', 'nhl', 'esports', 'college_football', 'college_basketball'
    ];

    if (allowedSports.includes('all_youth_safe')) {
      return safeForDistricts;
    }
    
    if (allowedSports.includes('all_adult_sports')) {
      return [...safeForDistricts, ...adultSports];
    }
    
    return allowedSports;
  }

  private getFilteredTournamentTypes() {
    const basicTypes = [
      'Single Elimination', 'Double Elimination', 'Round Robin', 
      'Pool Play → Single Elimination', 'Swiss System'
    ];
    
    const fantasyTypes = [
      'Survivor League', 'Daily Fantasy', 'Season Fantasy', 'Pick Em League'
    ];
    
    if (this.domain.isFeatureEnabled('fantasyLeagues')) {
      return [...basicTypes, ...fantasyTypes];
    }
    
    return basicTypes;
  }
}

// ===================================================================
// DATABASE QUERY FILTERING SYSTEM 🗄️
// ===================================================================

export class DatabaseFilter {
  constructor(private domain: DomainManager) {}

  // FILTER TOURNAMENTS BY DOMAIN
  filterTournaments(tournaments: any[]) {
    return tournaments.filter(tournament => {
      // District domains: only show youth-safe tournaments
      if (this.domain.config.brand === 'SCHOLASTIC_TOURNAMENTS') {
        return !tournament.has_fantasy_elements && 
               !tournament.requires_age_verification &&
               tournament.sport_category !== 'professional_sports';
      }
      
      // Fantasy domains: only show adult/fantasy tournaments
      if (this.domain.config.brand === 'FANTASY_LEAGUE_CENTRAL') {
        return tournament.has_fantasy_elements || 
               tournament.sport_category === 'professional_sports';
      }
      
      // Pro domain: show all adult tournaments
      return tournament.requires_age_verification;
    });
  }

  // FILTER USER ROLES BY DOMAIN
  filterUserRoles(userRoles: any[]) {
    const allowedRoles = this.domain.getAllowedUserRoles();
    return userRoles.filter(role => allowedRoles.includes(role.role_name));
  }

  // FILTER SPORTS BY DOMAIN SAFETY
  filterSports(sports: any[]) {
    const allowedSports = this.domain.getAllowedSports();
    
    if (allowedSports.includes('all_youth_safe')) {
      return sports.filter(sport => sport.youth_safe === true);
    }
    
    if (allowedSports.includes('all_adult_sports')) {
      return sports; // All sports allowed
    }
    
    return sports.filter(sport => allowedSports.includes(sport.sport_name?.toLowerCase()));
  }
}

// Create singleton instances for use throughout the app
export const domainManager = new DomainManager();
export const componentRenderer = new ComponentRenderer(domainManager);
export const databaseFilter = new DatabaseFilter(domainManager);