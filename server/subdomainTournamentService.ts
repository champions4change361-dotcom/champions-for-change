// Subdomain-Based Tournament Database Separation Service
// Solves the architecture issue by creating separate tournament contexts for each subdomain

import { storage, getStorage } from "./storage";

export type SubdomainContext = 'enterprise' | 'district' | 'school';

export interface SubdomainTournamentConfig {
  context: SubdomainContext;
  allowedRoles: string[];
  tournamentPrefix: string;
  dataScope: 'full' | 'read-only' | 'limited';
}

const SUBDOMAIN_CONFIGS: Record<string, SubdomainTournamentConfig> = {
  // Enterprise subdomain - full tournament management for casual organizers
  'trantortournaments.org': {
    context: 'enterprise',
    allowedRoles: ['tournament_organizer', 'casual_user', 'business_user'],
    tournamentPrefix: 'ENT',
    dataScope: 'full'
  },
  
  // District subdomain - athletics administration
  'district': {
    context: 'district', 
    allowedRoles: ['district_athletic_director', 'district_head_athletic_trainer'],
    tournamentPrefix: 'DIST',
    dataScope: 'full'
  },
  
  // School subdomain - school-level athletics
  'school': {
    context: 'school',
    allowedRoles: ['school_athletic_director', 'school_athletic_trainer', 'school_principal', 'head_coach', 'assistant_coach'],
    tournamentPrefix: 'SCH',
    dataScope: 'limited'
  }
};

export class SubdomainTournamentService {
  private subdomainConfig: SubdomainTournamentConfig;
  private storageInstance: any;

  constructor(domain: string) {
    // Determine subdomain context from domain
    const config = this.determineSubdomainConfig(domain);
    this.subdomainConfig = config;
  }

  private determineSubdomainConfig(domain: string): SubdomainTournamentConfig {
    // Check for explicit domain matches
    if (SUBDOMAIN_CONFIGS[domain]) {
      return SUBDOMAIN_CONFIGS[domain];
    }
    
    // Check for partial matches or patterns
    if (domain.includes('district') || domain.includes('athletics')) {
      return SUBDOMAIN_CONFIGS['district'];
    }
    
    if (domain.includes('school') || domain.includes('miller') || domain.includes('vlc')) {
      return SUBDOMAIN_CONFIGS['school'];
    }
    
    // Default to enterprise for unknown domains
    return SUBDOMAIN_CONFIGS['trantortournaments.org'];
  }

  // Get tournaments scoped to this subdomain
  async getTournaments(userRole?: string): Promise<any[]> {
    const storage = await getStorage();
    
    // Apply role-based filtering
    if (!this.canUserAccessTournaments(userRole)) {
      return [];
    }

    // Get all tournaments and filter by subdomain context
    const allTournaments = await storage.getTournaments();
    
    return allTournaments.filter((tournament: any) => {
      // Filter based on subdomain context
      return this.isTournamentInScope(tournament);
    });
  }

  // Create tournament with subdomain-specific ID and context
  async createTournament(tournamentData: any, userId: string, userRole?: string): Promise<any> {
    if (!this.canUserCreateTournaments(userRole)) {
      throw new Error('Insufficient permissions to create tournaments in this context');
    }

    const storage = await getStorage();
    
    // Add subdomain-specific metadata
    const enhancedTournamentData = {
      ...tournamentData,
      id: `${this.subdomainConfig.tournamentPrefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: `${tournamentData.description || ''} [${this.subdomainConfig.context.toUpperCase()}]`,
      userId
    };

    return await storage.createTournament(enhancedTournamentData);
  }

  // Get matches for this subdomain's tournaments
  async getMatches(tournamentId: string, userRole?: string): Promise<any[]> {
    if (!this.canUserAccessMatches(userRole)) {
      return [];
    }

    const storage = await getStorage();
    try {
      return await storage.getMatch(tournamentId);
    } catch (error) {
      console.log('No matches found for tournament:', tournamentId);
      return [];
    }
  }

  // Get available sports for this subdomain context
  async getAvailableSports(userRole?: string): Promise<any[]> {
    const storage = await getStorage();
    try {
      const allSports = await storage.getSportOptions();
      
      // Filter sports based on subdomain context
      switch (this.subdomainConfig.context) {
        case 'district':
          // District gets all academic and traditional sports
          return allSports.filter((sport: any) => 
            sport.sportCategory === 'Academic' || 
            sport.sportCategory === 'Traditional' ||
            sport.sportCategory === 'Track & Field'
          );
          
        case 'school':
          // Schools get school-appropriate sports
          return allSports.filter((sport: any) => 
            sport.sportCategory === 'Traditional' ||
            sport.sportCategory === 'Track & Field'
          );
          
        case 'enterprise':
        default:
          // Enterprise gets all sports including esports, business competitions
          return allSports;
      }
    } catch (error) {
      console.log('Error fetching sports:', error);
      return [];
    }
  }

  // Permission checking methods
  private canUserAccessTournaments(userRole?: string): boolean {
    if (!userRole) return false;
    return this.subdomainConfig.allowedRoles.includes(userRole) || 
           this.subdomainConfig.dataScope === 'read-only';
  }

  private canUserCreateTournaments(userRole?: string): boolean {
    if (!userRole) return false;
    return this.subdomainConfig.allowedRoles.includes(userRole) && 
           this.subdomainConfig.dataScope === 'full';
  }

  private canUserAccessMatches(userRole?: string): boolean {
    // Coaches and athletic trainers can view matches for scheduling
    const viewOnlyRoles = ['head_coach', 'assistant_coach', 'school_athletic_trainer'];
    if (userRole && viewOnlyRoles.includes(userRole)) {
      return true;
    }
    
    return this.canUserAccessTournaments(userRole);
  }

  private isTournamentInScope(tournament: any): boolean {
    // Check by tournament prefix first
    if (tournament.id && tournament.id.startsWith(this.subdomainConfig.tournamentPrefix)) {
      return true;
    }
    
    // Check by description context marker
    if (tournament.description && tournament.description.includes(`[${this.subdomainConfig.context.toUpperCase()}]`)) {
      return true;
    }
    
    // For backward compatibility, include tournaments without specific context
    // but apply logic based on tournament characteristics
    return this.shouldIncludeLegacyTournament(tournament);
  }

  private shouldIncludeLegacyTournament(tournament: any): boolean {
    switch (this.subdomainConfig.context) {
      case 'district':
        // Include school sports tournaments
        return tournament.sport && this.isSchoolSport(tournament.sport);
        
      case 'school':
        // Include only tournaments for this school's sports
        return tournament.sport && this.isSchoolSport(tournament.sport);
        
      case 'enterprise':
        // Include all tournaments not specifically marked for districts
        return !tournament.sport || !this.isSchoolSport(tournament.sport);
        
      default:
        return false;
    }
  }

  private isSchoolSport(sport: string): boolean {
    const schoolSports = [
      'Basketball', 'Football', 'Soccer', 'Baseball', 'Softball',
      'Track & Field', 'Swimming', 'Tennis', 'Golf', 'Volleyball',
      'Cross Country', 'Wrestling', 'Gymnastics'
    ];
    return schoolSports.includes(sport);
  }

  // Get configuration for current subdomain
  getSubdomainConfig(): SubdomainTournamentConfig {
    return this.subdomainConfig;
  }

  // Data sharing methods for cross-subdomain visibility
  async getSharedTournamentInfo(tournamentId: string, requestingUserRole: string): Promise<any> {
    // Allow athletic trainers and coaches to see basic tournament schedules
    const sharedInfoRoles = [
      'school_athletic_trainer', 'head_coach', 'assistant_coach', 
      'district_head_athletic_trainer', 'school_athletic_director'
    ];
    
    if (!sharedInfoRoles.includes(requestingUserRole)) {
      return null;
    }

    const storage = await getStorage();
    const tournament = await storage.getTournament(tournamentId);
    
    if (!tournament) return null;

    // Return limited info for scheduling purposes
    return {
      id: tournament.id,
      name: tournament.name,
      sport: tournament.sport,
      tournamentDate: tournament.tournamentDate,
      location: tournament.location,
      status: tournament.status,
      // Don't include detailed bracket info or participant data
    };
  }
}

// Factory function to create service based on domain
export function createSubdomainTournamentService(domain: string): SubdomainTournamentService {
  return new SubdomainTournamentService(domain);
}

// Helper function to get the appropriate tournament service from request
export function getTournamentServiceFromRequest(req: any): SubdomainTournamentService {
  const domain = req.hostname || req.headers.host || 'trantortournaments.org';
  return createSubdomainTournamentService(domain);
}