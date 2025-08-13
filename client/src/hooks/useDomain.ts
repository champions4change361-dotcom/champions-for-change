import { useState, useEffect } from 'react';
import { domainManager, componentRenderer, databaseFilter } from '@shared/domainConfig';

type DomainType = 'school' | 'fantasy' | 'pro';

interface DomainConfig {
  type: DomainType;
  brand: string;
  theme: string;
  allowFantasyPromo: boolean;
  allowProPromo: boolean;
  allowSchoolPromo: boolean;
  primaryColor: string;
  features: {
    fantasyLeagues: boolean;
    ageVerification: boolean;
    crossSelling: boolean;
    guestAccess: boolean;
    registration: boolean;
  };
}

export function useDomain() {
  const [domainConfig, setDomainConfig] = useState<DomainConfig | null>(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    console.log('Domain detection - hostname:', hostname); // Debug logging
    let config: DomainConfig;

    if (hostname.includes('fantasy') || hostname.includes('coaches')) {
      config = {
        type: 'fantasy',
        brand: 'COACHES_LOUNGE',
        theme: 'entertainment',
        allowFantasyPromo: false, // Already on fantasy
        allowProPromo: true,      // Can promote pro tournaments
        allowSchoolPromo: false,  // No school content on fantasy
        primaryColor: 'purple',
        features: {
          fantasyLeagues: true,
          ageVerification: true,
          crossSelling: true,
          guestAccess: true,
          registration: true
        }
      };
    } else if (hostname.includes('pro') || hostname.includes('business')) {
      config = {
        type: 'pro',
        brand: 'TOURNAMENT_PRO',
        theme: 'professional',
        allowFantasyPromo: true,  // KEY: Business users can see fantasy
        allowProPromo: false,     // Already on pro
        allowSchoolPromo: false,  // Keep business separate from schools
        primaryColor: 'blue',
        features: {
          fantasyLeagues: false,  // Not directly, but can promote
          ageVerification: false,
          crossSelling: true,     // KEY: Enable cross-selling
          guestAccess: true,
          registration: true
        }
      };
    } else if (hostname.includes('trantortournaments.org') || hostname.includes('tournaments')) {
      // Main Champions for Change domain - educational focus
      config = {
        type: 'school',
        brand: 'CHAMPIONS_FOR_CHANGE',
        theme: 'educational',
        allowFantasyPromo: false, // NEVER show fantasy to schools
        allowProPromo: false,     // NEVER show pro to schools
        allowSchoolPromo: false,  // Already on main domain
        primaryColor: 'green',
        features: {
          fantasyLeagues: false,
          ageVerification: false,
          crossSelling: false,    // NO cross-selling on main domain
          guestAccess: true,
          registration: true
        }
      };
    } else {
      // Default to main Champions for Change brand for development/unknown domains
      config = {
        type: 'school',
        brand: 'CHAMPIONS_FOR_CHANGE',
        theme: 'educational',
        allowFantasyPromo: false,
        allowProPromo: false,
        allowSchoolPromo: false,
        primaryColor: 'green',
        features: {
          fantasyLeagues: false,
          ageVerification: false,
          crossSelling: false,
          guestAccess: true,
          registration: true
        }
      };
    }

    console.log('Domain config set:', config); // Debug logging
    setDomainConfig(config);
  }, []);

  return {
    config: domainConfig,
    isSchoolDomain: () => domainConfig?.type === 'school',
    isFantasyDomain: () => domainConfig?.type === 'fantasy',
    isProDomain: () => domainConfig?.type === 'pro',
    canShowFantasyPromo: () => domainConfig?.allowFantasyPromo || false,
    canShowProPromo: () => domainConfig?.allowProPromo || false,
    canCrossSell: () => domainConfig?.features.crossSelling || false,
    // Legacy compatibility
    isFeatureEnabled: (feature: string) => domainConfig?.features[feature as keyof typeof domainConfig.features] || false,
    isSchoolSafe: () => domainConfig?.type === 'school',
    filterTournaments: (tournaments: any[]) => tournaments,
    filterSports: (sports: any[]) => sports
  };
}