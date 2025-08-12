import { useState, useEffect } from 'react';
import { domainManager, componentRenderer, databaseFilter } from '@shared/domainConfig';

export function useDomain() {
  const [domain, setDomain] = useState(domainManager);
  const [config, setConfig] = useState(domainManager.config);

  useEffect(() => {
    // Re-detect domain on client side if needed
    const currentDomain = window.location.hostname;
    if (currentDomain !== domain.detectDomain()) {
      const newDomain = new (domainManager.constructor as any)();
      setDomain(newDomain);
      setConfig(newDomain.config);
    }
  }, []);

  return {
    domain,
    config,
    isFeatureEnabled: (feature: string) => domain.isFeatureEnabled(feature as any),
    getBrandConfig: () => componentRenderer.renderNavigation(),
    isSchoolSafe: () => domain.isSchoolSafe(),
    isFantasyDomain: () => domain.isFantasyDomain(),
    isProDomain: () => domain.isProDomain(),
    filterTournaments: (tournaments: any[]) => databaseFilter.filterTournaments(tournaments),
    filterSports: (sports: any[]) => databaseFilter.filterSports(sports)
  };
}