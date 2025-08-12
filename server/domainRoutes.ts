import { Express, Request, Response } from "express";

// Simple domain configuration for now
const getDomainConfig = (hostname: string) => {
  if (hostname.includes('fantasy')) {
    return {
      brand: 'FANTASY_LEAGUE_CENTRAL',
      theme: 'entertainment',
      features: { fantasyLeagues: true, ageVerification: true, donationButtons: true }
    };
  }
  
  if (hostname.includes('pro')) {
    return {
      brand: 'TOURNAMENT_PRO',
      theme: 'professional',
      features: { fantasyLeagues: true, ageVerification: true, advancedAnalytics: true }
    };
  }
  
  // Default to school-safe
  return {
    brand: 'SCHOLASTIC_TOURNAMENTS',
    theme: 'educational',
    features: { fantasyLeagues: false, ageVerification: false, donationButtons: false }
  };
};

// Domain-aware middleware to filter data based on current domain
export function setupDomainRoutes(app: Express) {
  
  // Domain configuration endpoint
  app.get('/api/domain/config', (req: Request, res: Response) => {
    try {
      const hostname = req.hostname || 'localhost';
      const config = getDomainConfig(hostname);
      res.json(config);
    } catch (error) {
      console.error('Error fetching domain config:', error);
      res.status(500).json({ error: 'Failed to fetch domain configuration' });
    }
  });

  // Domain status endpoint
  app.get('/api/domain/status', (req: Request, res: Response) => {
    try {
      const hostname = req.hostname || 'localhost';
      const config = getDomainConfig(hostname);
      
      res.json({
        hostname,
        brand: config.brand,
        theme: config.theme,
        features: config.features,
        isSchoolSafe: config.brand === 'SCHOLASTIC_TOURNAMENTS',
        isFantasyDomain: config.brand === 'FANTASY_LEAGUE_CENTRAL',
        isProDomain: config.brand === 'TOURNAMENT_PRO',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching domain status:', error);
      res.status(500).json({ error: 'Failed to fetch domain status' });
    }
  });

  // Feature availability endpoint
  app.get('/api/domain/features/:feature', (req: Request, res: Response) => {
    try {
      const { feature } = req.params;
      const hostname = req.hostname || 'localhost';
      const config = getDomainConfig(hostname);
      const isEnabled = config.features[feature as keyof typeof config.features] || false;
      
      res.json({ 
        feature, 
        enabled: isEnabled,
        domain: config.brand 
      });
    } catch (error) {
      console.error('Error checking feature availability:', error);
      res.status(500).json({ error: 'Failed to check feature availability' });
    }
  });
}