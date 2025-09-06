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

    // Competitive Education Hub - School Athletics Domain
    if (hostname === 'competitiveeducationhub.com' || hostname === 'www.competitiveeducationhub.com') {
      config = {
        type: 'school',
        brand: 'COMPETITIVE_EDUCATION_HUB',
        theme: 'educational',
        allowFantasyPromo: false, // Pure educational focus
        allowProPromo: false,
        allowSchoolPromo: false,
        primaryColor: 'blue',
        features: {
          fantasyLeagues: false,  // No fantasy in education domain
          ageVerification: false,
          crossSelling: false,    // Keep education separate
          guestAccess: true,
          registration: true
        }
      };
    }
    // Trantor Tournaments - Commercial Tournament Management
    else if (hostname === 'trantortournaments.org' || hostname === 'www.trantortournaments.org') {
      config = {
        type: 'pro',
        brand: 'TRANTOR_TOURNAMENTS',
        theme: 'professional',
        allowFantasyPromo: true,
        allowProPromo: false,    // Already on pro domain
        allowSchoolPromo: true,  // Can promote school services
        primaryColor: 'orange',
        features: {
          fantasyLeagues: true,   // Commercial fantasy leagues
          ageVerification: true,  // Professional tournaments
          crossSelling: true,
          guestAccess: true,
          registration: true
        }
      };
    } else {
      // Default for development - Trantor commercial platform
      config = {
        type: 'pro',
        brand: 'TRANTOR_TOURNAMENTS',
        theme: 'professional',
        allowFantasyPromo: true,
        allowProPromo: false,    // Already on pro domain
        allowSchoolPromo: true,  // Can promote school services
        primaryColor: 'orange',
        features: {
          fantasyLeagues: true,   // Commercial fantasy leagues
          ageVerification: true,  // Professional tournaments
          crossSelling: true,
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