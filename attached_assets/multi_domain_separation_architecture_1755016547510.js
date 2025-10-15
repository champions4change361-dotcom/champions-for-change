// ===================================================================
// MULTI-DOMAIN SEPARATION ARCHITECTURE 🚢⚡
// DISTRICT-SAFE EMPIRE + FANTASY PLAYGROUND
// REPLIT DEPLOYMENT STRATEGY FOR MAXIMUM PROTECTION!
// ===================================================================

// DOMAIN CONFIGURATION SYSTEM
const DOMAIN_CONFIGS = {
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

  // FANTASY PLAYGROUND DOMAIN (Your Personal Fun!)
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
    subscriptionTiers: ['Free', 'Fantasy Pro'] // Keep it simple for personal use
  },

  // PROFESSIONAL/CLUB DOMAIN (Middle Tier)
  'pro.trantortournaments.org': {
    brand: 'TOURNAMENT_PRO',
    theme: 'professional',
    features: {
      fantasyLeagues: true, // Optional for adult leagues
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
  }
};

// ===================================================================
// DOMAIN DETECTION & ROUTING SYSTEM 🎯
// ===================================================================

class DomainManager {
  constructor() {
    this.currentDomain = this.detectDomain();
    this.config = this.loadDomainConfig();
  }

  detectDomain() {
    // In production, use actual domain
    if (typeof window !== 'undefined') {
      return window.location.hostname;
    }
    
    // For development/testing
    return process.env.DOMAIN_OVERRIDE || 'tournaments.trantortournaments.org';
  }

  loadDomainConfig() {
    const config = DOMAIN_CONFIGS[this.currentDomain];
    
    if (!config) {
      // Default to safe district version if domain not recognized
      console.warn(`Unknown domain: ${this.currentDomain}, defaulting to district-safe mode`);
      return DOMAIN_CONFIGS['tournaments.trantortournaments.org'];
    }
    
    return config;
  }

  // FEATURE GATE SYSTEM
  isFeatureEnabled(featureName) {
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
  getAllowedUserRoles() {
    return this.config.userRoles;
  }

  // SPORT FILTERING
  getAllowedSports() {
    return this.config.allowedSports;
  }

  // SUBSCRIPTION TIER FILTERING
  getAvailableSubscriptionTiers() {
    return this.config.subscriptionTiers;
  }
}

// ===================================================================
// COMPONENT RENDERING SYSTEM 🎨
// ===================================================================

class ComponentRenderer {
  constructor(domainManager) {
    this.domain = domainManager;
  }

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

  filterSportsBySafety(allowedSports) {
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

  getFilteredTournamentTypes() {
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

class DatabaseFilter {
  constructor(domainManager) {
    this.domain = domainManager;
  }

  // FILTER TOURNAMENTS BY DOMAIN
  filterTournaments(tournaments) {
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
  filterUserRoles(userRoles) {
    const allowedRoles = this.domain.getAllowedUserRoles();
    return userRoles.filter(role => allowedRoles.includes(role.role_name));
  }

  // FILTER SPORTS BY DOMAIN SAFETY
  filterSports(sports) {
    const allowedSports = this.domain.getAllowedSports();
    
    if (allowedSports.includes('all_youth_safe')) {
      return sports.filter(sport => sport.youth_safe === true);
    }
    
    if (allowedSports.includes('all_adult_sports')) {
      return sports; // All sports allowed
    }
    
    return sports.filter(sport => allowedSports.includes(sport.sport_name.toLowerCase()));
  }
}

// ===================================================================
// REPLIT DEPLOYMENT CONFIGURATION 🚀
// ===================================================================

const REPLIT_DEPLOYMENT_CONFIG = {
  // ENVIRONMENT VARIABLES FOR EACH DOMAIN
  environments: {
    'tournaments': {
      DOMAIN_TYPE: 'SCHOLASTIC_TOURNAMENTS',
      ENABLE_FANTASY: 'false',
      ENABLE_DONATIONS: 'false',
      AGE_VERIFICATION: 'false',
      THEME: 'educational',
      CUSTOM_DOMAIN: 'tournaments.trantortournaments.org'
    },
    
    'fantasy': {
      DOMAIN_TYPE: 'FANTASY_LEAGUE_CENTRAL', 
      ENABLE_FANTASY: 'true',
      ENABLE_DONATIONS: 'true',
      AGE_VERIFICATION: 'true',
      THEME: 'entertainment',
      CUSTOM_DOMAIN: 'fantasy.trantortournaments.org'
    },
    
    'pro': {
      DOMAIN_TYPE: 'TOURNAMENT_PRO',
      ENABLE_FANTASY: 'true',
      ENABLE_DONATIONS: 'false',
      AGE_VERIFICATION: 'true', 
      THEME: 'professional',
      CUSTOM_DOMAIN: 'pro.trantortournaments.org'
    }
  },

  // DATABASE CONNECTION (SHARED ACROSS ALL DOMAINS)
  sharedDatabase: {
    connectionString: process.env.DATABASE_URL,
    sharedTables: [
      'sport_categories', 'sport_options', 'tournament_structures',
      'competition_format_templates', 'track_events', 'users'
    ],
    domainSpecificTables: [
      'fantasy_leagues', 'fantasy_participants', 'professional_players'
    ]
  },

  // ROUTING CONFIGURATION
  routing: {
    '/fantasy/*': 'FANTASY_LEAGUE_CENTRAL',
    '/admin/*': 'SCHOLASTIC_TOURNAMENTS', 
    '/pro/*': 'TOURNAMENT_PRO',
    '/*': 'SCHOLASTIC_TOURNAMENTS' // Default safe mode
  }
};

// ===================================================================
// USAGE EXAMPLE - HOW TO IMPLEMENT 💡
// ===================================================================

// Initialize domain-aware system
const domainManager = new DomainManager();
const componentRenderer = new ComponentRenderer(domainManager);
const dbFilter = new DatabaseFilter(domainManager);

// Example: Render navigation based on domain
function renderNavigation() {
  const navConfig = componentRenderer.renderNavigation();
  
  return `
    <nav style="background-color: ${navConfig.primaryColor}">
      <img src="${navConfig.logo}" alt="${navConfig.brand}" />
      <h1>${navConfig.brand}</h1>
      <ul>
        ${navConfig.menuItems.map(item => `<li><a href="/${item.toLowerCase()}">${item}</a></li>`).join('')}
        ${navConfig.showDonateButton ? '<li><a href="/donate" class="donate-btn">Donate ❤️</a></li>' : ''}
      </ul>
    </nav>
  `;
}

// Example: Filter tournaments for current domain
async function getTournaments() {
  const allTournaments = await database.tournaments.findAll();
  const filteredTournaments = dbFilter.filterTournaments(allTournaments);
  return filteredTournaments;
}

// Example: Check if fantasy features should be shown
function showFantasySection() {
  return domainManager.isFeatureEnabled('fantasyLeagues');
}

// ===================================================================
// DEPLOYMENT INSTRUCTIONS FOR REPLIT 📋
// ===================================================================

const DEPLOYMENT_STEPS = `
REPLIT MULTI-DOMAIN DEPLOYMENT STEPS:

1. MAIN PROJECT SETUP:
   - Deploy main codebase to primary Replit project
   - Set environment variables for domain detection
   - Configure custom domain: tournaments.trantortournaments.org

2. FANTASY SUBDOMAIN:
   - Same codebase, different environment variables
   - Set DOMAIN_TYPE=FANTASY_LEAGUE_CENTRAL
   - Configure subdomain: fantasy.trantortournaments.org

3. DATABASE SHARING:
   - Both deployments use same PostgreSQL database
   - Feature flags control what data is shown
   - Shared user authentication system

4. ENVIRONMENT VARIABLES:
   - DOMAIN_TYPE: Controls which features are enabled
   - ENABLE_FANTASY: true/false flag
   - CUSTOM_DOMAIN: Domain-specific configuration

5. DNS CONFIGURATION:
   - Point tournaments.domain.com → Main Replit deployment
   - Point fantasy.domain.com → Fantasy Replit deployment
   - Both can be same project with different env vars!
`;

console.log('🚢⚡ MULTI-DOMAIN SEPARATION ARCHITECTURE READY FOR DEPLOYMENT!');

export { DomainManager, ComponentRenderer, DatabaseFilter, REPLIT_DEPLOYMENT_CONFIG };