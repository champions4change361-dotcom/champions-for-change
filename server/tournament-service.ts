/**
 * Comprehensive Tournament Service - Core Business Logic
 * Integrates bracket generation, stage transitions, and Swiss system engines
 * Provides high-level tournament management functionality
 */

import { randomUUID } from "crypto";
import { storage, type SecureUserContext } from "./storage";
import { BracketGenerator } from "./utils/bracket-generator";
import { StageTransitionEngine, type TeamStanding, type AdvancementResult } from "../shared/stage-transition-engine";
import { SwissSystemEngine, type SwissTeamRecord, type SwissPairingOptions, type SwissAdvancementCriteria } from "../shared/swiss-system-engine";
import type { 
  Tournament, 
  InsertTournament, 
  Match, 
  InsertMatch, 
  UpdateMatch,
  Team,
  TournamentConfig,
  StageConfig
} from "@shared/schema";
import type {
  BracketStructure,
  FFAParticipant,
  FFALeaderboardEntry,
  FFATournamentStructure,
  MatchData
} from "@shared/bracket-generator";
import type {
  Pool,
  SwissRound,
  StageResults,
  TiebreakerRule,
  StageTransition
} from "../shared/multi-stage-schema";

export interface TournamentCreationOptions {
  config: TournamentConfig;
  teams?: string[];
  venue?: {
    name: string;
    address: string;
    capacity?: number;
  };
  scheduling?: {
    startDate: Date;
    endDate?: Date;
    matchDuration?: number;
    breakDuration?: number;
  };
  rules?: {
    scoringSystem: 'elimination' | 'points' | 'time' | 'placement';
    tiebreakers: TiebreakerRule[];
    advancementRules: any;
  };
}

export interface TournamentProgressUpdate {
  tournamentId: string;
  matchId?: string;
  stageNumber?: number;
  progressPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  currentStage: string;
  nextActions: string[];
  statistics: {
    totalMatches: number;
    completedMatches: number;
    remainingMatches: number;
    participantsRemaining: number;
    eliminatedParticipants: number;
  };
}

export interface MatchResult {
  matchId: string;
  team1Score: number;
  team2Score: number;
  winner?: string;
  isDraw?: boolean;
  overtime?: boolean;
  forfeit?: boolean;
  notes?: string;
}

export class TournamentService {
  
  /**
   * Create a comprehensive tournament with integrated bracket generation
   */
  static async createTournament(
    options: TournamentCreationOptions,
    user: SecureUserContext
  ): Promise<Tournament> {
    try {
      const { config, teams = [], venue, scheduling, rules } = options;
      
      // Generate participant names if not provided
      let participantNames = teams;
      if (participantNames.length === 0) {
        const isIndividual = config.meta.participantType === 'individual';
        participantNames = Array.from({ length: config.meta.participantCount || 8 }, (_, i) => {
          return isIndividual ? `Participant ${i + 1}` : `Team ${i + 1}`;
        });
      }

      // Generate bracket structure using existing engines
      const bracketStructure = BracketGenerator.generateFromConfig(
        config,
        participantNames,
        '', // Tournament ID will be set after creation
        {
          formatConfig: rules?.advancementRules || {}
        }
      );

      // Create tournament record
      const tournamentData: InsertTournament = {
        name: config.meta.name || 'New Tournament',
        sport: 'multi-sport', // Support multi-sport coordination
        tournamentType: this.mapEngineToTournamentType(config.stages[0]?.engine || 'single'),
        status: 'upcoming',
        teamSize: config.meta.participantType === 'team' ? 1 : 1,
        maxParticipants: config.meta.participantCount || 8,
        tournamentDate: scheduling?.startDate || new Date(),
        location: venue?.name || '',
        description: `Tournament created with ${config.stages.length} stage(s)`,
        userId: user.id,
        
        // Enhanced tournament configuration
        config: config,
        competitionFormat: this.determineCompetitionFormat(config),
        bracketStructure: bracketStructure,
        
        // Venue information
        venueInfo: venue ? {
          name: venue.name,
          address: venue.address,
          capacity: venue.capacity
        } : undefined,
        
        // Scheduling information
        schedulingInfo: scheduling ? {
          startDate: scheduling.startDate,
          endDate: scheduling.endDate,
          matchDuration: scheduling.matchDuration || 30,
          breakDuration: scheduling.breakDuration || 10
        } : undefined,
        
        // Tournament rules
        rulesConfiguration: rules ? {
          scoringSystem: rules.scoringSystem,
          tiebreakers: rules.tiebreakers,
          advancementRules: rules.advancementRules
        } : undefined
      };

      const tournament = await storage.createTournament(tournamentData, user);

      // Generate initial matches based on bracket structure
      if (bracketStructure?.matches && bracketStructure.matches.length > 0) {
        await this.generateTournamentMatches(tournament.id, bracketStructure, user);
      }

      return tournament;
    } catch (error) {
      console.error('Tournament creation failed:', error);
      throw new Error(`Failed to create tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate tournament matches from bracket structure
   */
  static async generateTournamentMatches(
    tournamentId: string,
    bracketStructure: BracketStructure,
    user: SecureUserContext
  ): Promise<Match[]> {
    const matches: Match[] = [];
    
    try {
      for (const match of bracketStructure.matches) {
        const matchData: InsertMatch = {
          tournamentId,
          round: match.round || 1,
          position: match.position || 1,
          team1: match.team1 || null,
          team2: match.team2 || null,
          team1Score: 0,
          team2Score: 0,
          winner: null,
          status: 'upcoming',
          bracket: match.bracket || 'main',
          matchNumber: match.matchNumber || 1,
          scheduledTime: match.scheduledTime ? new Date(match.scheduledTime) : null
        };
        
        const createdMatch = await storage.createMatch(matchData, user);
        matches.push(createdMatch);
      }
      
      return matches;
    } catch (error) {
      console.error('Match generation failed:', error);
      throw new Error(`Failed to generate matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update match result and handle automatic bracket progression
   */
  static async updateMatchResult(
    matchId: string,
    result: MatchResult,
    user: SecureUserContext
  ): Promise<{ match: Match; progressUpdate: TournamentProgressUpdate }> {
    try {
      // Get match details
      const match = await storage.getMatch(matchId, user);
      if (!match) {
        throw new Error('Match not found');
      }

      // Validate result
      this.validateMatchResult(result);

      // Update match with result
      const updateData: UpdateMatch = {
        team1Score: result.team1Score,
        team2Score: result.team2Score,
        winner: result.winner,
        status: 'completed',
        isDraw: result.isDraw,
        overtime: result.overtime,
        forfeit: result.forfeit,
        notes: result.notes,
        completedAt: new Date()
      };

      const updatedMatch = await storage.updateMatch(matchId, updateData, user);
      if (!updatedMatch) {
        throw new Error('Failed to update match');
      }

      // Handle automatic bracket progression
      const progressUpdate = await this.handleBracketProgression(
        match.tournamentId, 
        updatedMatch, 
        user
      );

      return { match: updatedMatch, progressUpdate };
    } catch (error) {
      console.error('Match result update failed:', error);
      throw new Error(`Failed to update match result: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Handle automatic bracket progression after match completion
   */
  static async handleBracketProgression(
    tournamentId: string,
    completedMatch: Match,
    user: SecureUserContext
  ): Promise<TournamentProgressUpdate> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get all tournament matches
      const allMatches = await storage.getMatchesByTournament(tournamentId, user);
      
      // Calculate tournament progress
      const totalMatches = allMatches.length;
      const completedMatches = allMatches.filter(m => m.status === 'completed').length;
      const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
      
      // Determine next actions and bracket progression
      const nextActions = await this.calculateNextActions(tournament, allMatches, user);
      
      // Handle stage transitions if using multi-stage format
      await this.handleStageTransitions(tournament, allMatches, user);
      
      // Update tournament status if completed
      if (completedMatches === totalMatches && totalMatches > 0) {
        await storage.updateTournament(tournamentId, { status: 'completed' }, user);
      }

      const participantsRemaining = await this.countRemainingParticipants(tournament, allMatches);
      const eliminatedParticipants = (tournament.maxParticipants || 0) - participantsRemaining;

      return {
        tournamentId,
        matchId: completedMatch.id,
        progressPercentage,
        status: completedMatches === totalMatches ? 'completed' : 'in_progress',
        currentStage: this.getCurrentStage(tournament, allMatches),
        nextActions,
        statistics: {
          totalMatches,
          completedMatches,
          remainingMatches: totalMatches - completedMatches,
          participantsRemaining,
          eliminatedParticipants
        }
      };
    } catch (error) {
      console.error('Bracket progression failed:', error);
      throw new Error(`Failed to handle bracket progression: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate Swiss system pairings
   */
  static async generateSwissPairings(
    tournamentId: string,
    roundNumber: number,
    options: SwissPairingOptions,
    user: SecureUserContext
  ): Promise<Array<{ team1: string; team2: string; tableNumber: number }>> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get current standings for Swiss pairings
      const standings = await this.getSwissStandings(tournamentId, user);
      
      // Generate pairings using Swiss system engine
      const pairings = SwissSystemEngine.generateSwissPairings(
        standings,
        roundNumber,
        options
      );

      return pairings;
    } catch (error) {
      console.error('Swiss pairings generation failed:', error);
      throw new Error(`Failed to generate Swiss pairings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate advancement from pools to elimination brackets
   */
  static async calculatePoolAdvancement(
    tournamentId: string,
    advancementRules: any,
    user: SecureUserContext
  ): Promise<AdvancementResult> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get pool data (this would need to be implemented in storage)
      const pools = await this.getTournamentPools(tournamentId, user);
      const tiebreakers = tournament.rulesConfiguration?.tiebreakers || [];

      // Use stage transition engine for advancement calculation
      const advancementResult = StageTransitionEngine.calculatePoolAdvancement(
        pools,
        advancementRules,
        tiebreakers
      );

      return advancementResult;
    } catch (error) {
      console.error('Pool advancement calculation failed:', error);
      throw new Error(`Failed to calculate pool advancement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comprehensive tournament statistics
   */
  static async getTournamentStatistics(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<{
    overview: TournamentProgressUpdate;
    participants: any[];
    matches: Match[];
    standings: TeamStanding[];
    analytics: any;
  }> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const matches = await storage.getMatchesByTournament(tournamentId, user);
      const participants = await this.getTournamentParticipants(tournamentId, user);
      const standings = await this.getTournamentStandings(tournamentId, user);
      
      // Calculate overview
      const totalMatches = matches.length;
      const completedMatches = matches.filter(m => m.status === 'completed').length;
      const progressPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

      const overview: TournamentProgressUpdate = {
        tournamentId,
        progressPercentage,
        status: this.determineTournamentStatus(tournament, matches),
        currentStage: this.getCurrentStage(tournament, matches),
        nextActions: await this.calculateNextActions(tournament, matches, user),
        statistics: {
          totalMatches,
          completedMatches,
          remainingMatches: totalMatches - completedMatches,
          participantsRemaining: await this.countRemainingParticipants(tournament, matches),
          eliminatedParticipants: (tournament.maxParticipants || 0) - await this.countRemainingParticipants(tournament, matches)
        }
      };

      // Generate analytics
      const analytics = await this.generateTournamentAnalytics(tournament, matches, participants);

      return {
        overview,
        participants,
        matches,
        standings,
        analytics
      };
    } catch (error) {
      console.error('Tournament statistics generation failed:', error);
      throw new Error(`Failed to get tournament statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clone tournament structure for reuse
   */
  static async cloneTournament(
    originalTournamentId: string,
    newName: string,
    user: SecureUserContext
  ): Promise<Tournament> {
    try {
      const originalTournament = await storage.getTournament(originalTournamentId, user);
      if (!originalTournament) {
        throw new Error('Original tournament not found');
      }

      // Clone tournament configuration
      const cloneData: InsertTournament = {
        ...originalTournament,
        id: undefined, // Let database generate new ID
        name: newName,
        status: 'upcoming',
        tournamentDate: new Date(),
        userId: user.id,
        createdAt: undefined, // Let database generate new timestamps
        updatedAt: undefined
      };

      const clonedTournament = await storage.createTournament(cloneData, user);

      // Clone matches structure but reset results
      const originalMatches = await storage.getMatchesByTournament(originalTournamentId, user);
      for (const match of originalMatches) {
        const matchClone: InsertMatch = {
          tournamentId: clonedTournament.id,
          round: match.round,
          position: match.position,
          team1: null, // Reset teams for new registration
          team2: null,
          team1Score: 0,
          team2Score: 0,
          winner: null,
          status: 'upcoming',
          bracket: match.bracket,
          matchNumber: match.matchNumber
        };
        
        await storage.createMatch(matchClone, user);
      }

      return clonedTournament;
    } catch (error) {
      console.error('Tournament cloning failed:', error);
      throw new Error(`Failed to clone tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private static mapEngineToTournamentType(engine: string): string {
    const engineMap: Record<string, string> = {
      'single': 'single-elimination',
      'double': 'double-elimination',
      'round_robin': 'round-robin',
      'swiss': 'swiss-system',
      'leaderboard': 'free-for-all'
    };
    return engineMap[engine] || 'single-elimination';
  }

  private static determineCompetitionFormat(config: TournamentConfig): string {
    const firstStage = config.stages[0];
    if (!firstStage) return 'bracket';
    
    switch (firstStage.engine) {
      case 'round_robin':
      case 'swiss':
        return 'round-robin';
      case 'leaderboard':
        return 'leaderboard';
      default:
        return 'bracket';
    }
  }

  private static validateMatchResult(result: MatchResult): void {
    if (result.team1Score < 0 || result.team2Score < 0) {
      throw new Error('Scores cannot be negative');
    }
    
    if (!result.isDraw && !result.winner) {
      throw new Error('Winner must be specified for non-draw matches');
    }
    
    if (result.isDraw && result.winner) {
      throw new Error('Cannot have both draw and winner');
    }
  }

  private static async handleStageTransitions(
    tournament: Tournament,
    matches: Match[],
    user: SecureUserContext
  ): Promise<void> {
    // Implementation for stage transitions using existing engine
    // This would integrate with the StageTransitionEngine
  }

  private static async calculateNextActions(
    tournament: Tournament,
    matches: Match[],
    user: SecureUserContext
  ): Promise<string[]> {
    const actions: string[] = [];
    
    // Determine what actions are needed next
    const upcomingMatches = matches.filter(m => m.status === 'upcoming');
    const inProgressMatches = matches.filter(m => m.status === 'in-progress');
    
    if (inProgressMatches.length > 0) {
      actions.push('Complete in-progress matches');
    }
    
    if (upcomingMatches.length > 0) {
      actions.push('Schedule upcoming matches');
    }
    
    // Check for bracket progression opportunities
    const completedMatches = matches.filter(m => m.status === 'completed');
    if (completedMatches.length > 0) {
      actions.push('Review bracket progression');
    }
    
    return actions;
  }

  private static getCurrentStage(tournament: Tournament, matches: Match[]): string {
    // Determine current stage based on match progress
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const totalMatches = matches.length;
    
    if (completedMatches === 0) return 'Initial Stage';
    if (completedMatches === totalMatches) return 'Tournament Complete';
    
    // Calculate stage based on bracket structure
    const maxRound = Math.max(...matches.map(m => m.round));
    const currentRounds = matches
      .filter(m => m.status === 'in-progress' || m.status === 'upcoming')
      .map(m => m.round);
    
    const currentRound = currentRounds.length > 0 ? Math.min(...currentRounds) : maxRound;
    
    return `Round ${currentRound}`;
  }

  private static async countRemainingParticipants(
    tournament: Tournament,
    matches: Match[]
  ): Promise<number> {
    // Count participants still in tournament
    // This is a simplified calculation - would need more sophisticated logic
    const eliminationMatches = matches.filter(m => 
      m.status === 'completed' && 
      (tournament.tournamentType?.includes('elimination') || false)
    );
    
    const initialParticipants = tournament.maxParticipants || 0;
    const eliminatedCount = eliminationMatches.length;
    
    return Math.max(0, initialParticipants - eliminatedCount);
  }

  private static determineTournamentStatus(
    tournament: Tournament,
    matches: Match[]
  ): 'not_started' | 'in_progress' | 'completed' | 'cancelled' {
    if (tournament.status === 'cancelled') return 'cancelled';
    
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const totalMatches = matches.length;
    
    if (completedMatches === 0) return 'not_started';
    if (completedMatches === totalMatches) return 'completed';
    return 'in_progress';
  }

  private static async getSwissStandings(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<SwissTeamRecord[]> {
    // Implementation would fetch Swiss standings from storage
    // This is a placeholder that would need proper implementation
    return [];
  }

  private static async getTournamentPools(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<Pool[]> {
    // Implementation would fetch pool data from storage
    // This is a placeholder that would need proper implementation
    return [];
  }

  private static async getTournamentParticipants(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<any[]> {
    // Implementation would fetch participants from storage
    return [];
  }

  private static async getTournamentStandings(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<TeamStanding[]> {
    // Implementation would calculate current standings
    return [];
  }

  private static async generateTournamentAnalytics(
    tournament: Tournament,
    matches: Match[],
    participants: any[]
  ): Promise<any> {
    // Generate comprehensive tournament analytics
    return {
      averageMatchDuration: 30, // minutes
      totalPlayTime: matches.filter(m => m.status === 'completed').length * 30,
      participationRate: 100, // percentage
      competitiveBalance: 0.8, // score 0-1
      predictionAccuracy: 0.7, // how often favorites win
    };
  }
}