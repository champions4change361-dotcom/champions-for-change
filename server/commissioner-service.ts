// Commissioner Service - Core business logic for league management
import { 
  FantasyLeague, 
  InsertFantasyLeague,
  LeagueParticipant,
  InsertLeagueParticipant,
  FantasyPlayer,
  InsertFantasyPlayer,
  CommissionerAnalytics,
  LeagueActivity,
  RegistrationCode
} from "@shared/commissioner-schema";

export class CommissionerService {
  
  // Generate unique registration code for league
  static generateRegistrationCode(leagueName: string): string {
    const prefix = "COACH";
    const year = new Date().getFullYear();
    
    // Create readable code from league name
    const nameCode = leagueName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 6)
      .toUpperCase();
    
    // Add random suffix
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${prefix}${year}-${nameCode}${suffix}`;
  }
  
  // Create new fantasy league with commissioner setup
  static async createLeague(commissionerData: {
    userId: string;
    userName: string;
    leagueData: Omit<InsertFantasyLeague, 'commissionerId' | 'registrationCode'>;
  }): Promise<{
    league: FantasyLeague;
    registrationCode: string;
    commissionerParticipant: LeagueParticipant;
  }> {
    
    const registrationCode = this.generateRegistrationCode(commissionerData.leagueData.name);
    
    // Create league with commissioner info
    const league: FantasyLeague = {
      id: crypto.randomUUID(),
      ...commissionerData.leagueData,
      commissionerId: commissionerData.userId,
      commissionerName: commissionerData.userName,
      registrationCode,
      currentParticipants: 1, // Commissioner counts as first participant
      createdAt: new Date(),
      updatedAt: new Date(),
      draftDate: null,
      seasonStart: null,
      seasonEnd: null
    };
    
    // Add commissioner as first participant
    const commissionerParticipant: LeagueParticipant = {
      id: crypto.randomUUID(),
      leagueId: league.id,
      userId: commissionerData.userId,
      userEmail: null,
      userName: commissionerData.userName,
      status: "active",
      isCommissioner: true,
      isCoCommissioner: false,
      teamName: `${commissionerData.userName}'s Team`,
      teamLogo: null,
      draftPosition: null,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: "0",
      pointsAgainst: "0",
      loginCount: 0,
      lastActive: new Date(),
      tradeCount: 0,
      waiversClaimed: 0,
      joinedAt: new Date(),
      updatedAt: new Date()
    };
    
    return {
      league,
      registrationCode,
      commissionerParticipant
    };
  }
  
  // Join league using registration code
  static async joinLeague(joinData: {
    registrationCode: string;
    userId: string;
    userName: string;
    userEmail?: string;
  }): Promise<{
    success: boolean;
    league?: FantasyLeague;
    participant?: LeagueParticipant;
    error?: string;
  }> {
    
    // In real implementation, this would query database
    // For now, return mock success response
    
    if (!joinData.registrationCode || joinData.registrationCode.length < 8) {
      return {
        success: false,
        error: "Invalid registration code format"
      };
    }
    
    // Mock league data for demonstration
    const mockLeague: FantasyLeague = {
      id: crypto.randomUUID(),
      name: "Demo Fantasy League",
      leagueType: "ppr_league",
      commissionerId: "commissioner-123",
      commissionerName: "Demo Commissioner",
      registrationCode: joinData.registrationCode,
      maxParticipants: 12,
      currentParticipants: 3,
      entryFee: "25.00",
      prizePool: "300.00",
      settings: {
        scoringSystem: 'ppr',
        rosterSize: 16,
        startingLineup: {
          qb: 1,
          rb: 2,
          wr: 2,
          te: 1,
          flex: 1,
          k: 1,
          def: 1,
          bench: 6
        },
        waiverSettings: {
          type: 'faab',
          budget: 100
        },
        tradeDeadline: '2024-11-15',
        playoffWeeks: [15, 16, 17],
        championshipWeek: 17
      },
      status: "draft",
      season: 2024,
      isPublic: false,
      allowLateJoins: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      draftDate: null,
      seasonStart: null,
      seasonEnd: null
    };
    
    const participant: LeagueParticipant = {
      id: crypto.randomUUID(),
      leagueId: mockLeague.id,
      userId: joinData.userId,
      userEmail: joinData.userEmail || null,
      userName: joinData.userName,
      status: "active",
      isCommissioner: false,
      isCoCommissioner: false,
      teamName: `${joinData.userName}'s Team`,
      teamLogo: null,
      draftPosition: null,
      wins: 0,
      losses: 0,
      ties: 0,
      pointsFor: "0",
      pointsAgainst: "0",
      loginCount: 0,
      lastActive: new Date(),
      tradeCount: 0,
      waiversClaimed: 0,
      joinedAt: new Date(),
      updatedAt: new Date()
    };
    
    return {
      success: true,
      league: mockLeague,
      participant
    };
  }
  
  // Get commissioner dashboard data
  static async getCommissionerDashboard(commissionerId: string): Promise<{
    leagues: FantasyLeague[];
    analytics: CommissionerAnalytics;
    recentActivities: LeagueActivity[];
    totalParticipants: number;
  }> {
    
    // Mock data for demonstration
    const mockLeagues: FantasyLeague[] = [
      {
        id: crypto.randomUUID(),
        name: "Champions Fantasy Football",
        leagueType: "ppr_league",
        commissionerId,
        commissionerName: "Daniel Thornton",
        registrationCode: "COACH2024-CHAMP123",
        maxParticipants: 12,
        currentParticipants: 8,
        entryFee: "50.00",
        prizePool: "600.00",
        settings: {
          scoringSystem: 'ppr',
          rosterSize: 16,
          startingLineup: {
            qb: 1,
            rb: 2,
            wr: 2,
            te: 1,
            flex: 1,
            k: 1,
            def: 1,
            bench: 6
          },
          waiverSettings: {
            type: 'faab',
            budget: 100
          },
          tradeDeadline: '2024-11-15',
          playoffWeeks: [15, 16, 17],
          championshipWeek: 17
        },
        status: "active",
        season: 2024,
        isPublic: true,
        allowLateJoins: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        draftDate: new Date('2024-09-01'),
        seasonStart: new Date('2024-09-05'),
        seasonEnd: new Date('2024-12-30')
      }
    ];
    
    const mockAnalytics: CommissionerAnalytics = {
      id: crypto.randomUUID(),
      commissionerId,
      totalLeaguesCreated: 3,
      activeLeagues: 2,
      totalParticipantsManaged: 24,
      playersDataEntered: 156,
      dataAccuracyScore: "94.50",
      lastDataUpdate: new Date(),
      loginStreak: 7,
      totalLogins: 45,
      averageSessionTime: 25,
      helpfulVotes: 12,
      dataVerifications: 89,
      disputesResolved: 3,
      totalRevenue: "1250.00",
      donationsToChampions: "125.00",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const mockActivities: LeagueActivity[] = [
      {
        id: crypto.randomUUID(),
        leagueId: mockLeagues[0].id,
        userId: commissionerId,
        actionType: "player_data_updated",
        description: "Updated player stats for Jahmyr Gibbs",
        details: { 
          player: "Jahmyr Gibbs", 
          field: "rushing_tendencies", 
          newValue: "75% left side carries" 
        },
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0...",
        createdAt: new Date()
      }
    ];
    
    return {
      leagues: mockLeagues,
      analytics: mockAnalytics,
      recentActivities: mockActivities,
      totalParticipants: mockLeagues.reduce((sum, league) => sum + league.currentParticipants, 0)
    };
  }
  
  // Add player data with commissioner verification
  static async addPlayerData(playerData: InsertFantasyPlayer & {
    commissionerId: string;
  }): Promise<{
    success: boolean;
    player?: FantasyPlayer;
    error?: string;
  }> {
    
    if (!playerData.name || !playerData.position || !playerData.team) {
      return {
        success: false,
        error: "Player name, position, and team are required"
      };
    }
    
    const player: FantasyPlayer = {
      id: crypto.randomUUID(),
      ...playerData,
      verifiedBy: playerData.commissionerId,
      dataSource: "commissioner",
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return {
      success: true,
      player
    };
  }
  
  // Get league participants with stats
  static async getLeagueParticipants(leagueId: string): Promise<LeagueParticipant[]> {
    // Mock data - in real implementation would query database
    return [
      {
        id: crypto.randomUUID(),
        leagueId,
        userId: "user-1",
        userEmail: "coach1@example.com",
        userName: "Mike Thompson",
        status: "active",
        isCommissioner: true,
        isCoCommissioner: false,
        teamName: "Thompson's Titans",
        teamLogo: null,
        draftPosition: 1,
        wins: 7,
        losses: 4,
        ties: 0,
        pointsFor: "1456.75",
        pointsAgainst: "1312.25",
        loginCount: 23,
        lastActive: new Date(),
        tradeCount: 3,
        waiversClaimed: 8,
        joinedAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
  
  // Validate registration code
  static validateRegistrationCode(code: string): boolean {
    // Basic format validation
    const pattern = /^COACH\d{4}-[A-Z0-9]{6,10}$/;
    return pattern.test(code);
  }
  
  // Generate league analytics
  static async generateLeagueAnalytics(leagueId: string): Promise<{
    participantEngagement: number;
    averageScore: number;
    totalTrades: number;
    activeUsers: number;
    competitiveBalance: number;
  }> {
    
    // Mock analytics calculation
    return {
      participantEngagement: 87.5, // Percentage
      averageScore: 124.3,
      totalTrades: 15,
      activeUsers: 9,
      competitiveBalance: 8.2 // Out of 10
    };
  }
}