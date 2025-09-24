// Advanced Bracket Generation Utilities for Multi-Stage Tournaments
// Handles professional bracket generation with proper seeding from pool/Swiss results

import { 
  StageTransitionEngine, 
  type TeamStanding, 
  type AdvancementResult 
} from '@shared/stage-transition-engine';
import { 
  SwissSystemEngine,
  type SwissTeamRecord
} from '@shared/swiss-system-engine';
import { 
  type Pool, 
  type SwissRound, 
  type StageTransition,
  professionalTournamentFormats
} from '@shared/multi-stage-schema';

export interface BracketMatch {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  team1?: string;
  team2?: string;
  team1Score: number;
  team2Score: number;
  winner?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  bracket?: 'winners' | 'losers' | 'championship';
  seedInfo?: {
    team1Seed?: number;
    team2Seed?: number;
    team1Origin?: string;
    team2Origin?: string;
  };
}

export interface ProfessionalBracketStructure {
  matches: BracketMatch[];
  totalRounds: number;
  totalMatches: number;
  format: 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';
  seedingInfo: {
    seedingMethod: string;
    advancementSource: string;
    crossPoolSeeding: boolean;
  };
  advancementResults?: AdvancementResult;
}

export class AdvancedBracketGenerator {

  /**
   * Generate elimination bracket from pool play results with professional seeding
   */
  static generateBracketFromPools(
    pools: Pool[],
    transition: StageTransition,
    tournamentId: string
  ): ProfessionalBracketStructure {
    
    // Calculate advancement results using professional stage transition engine
    const advancementResults = StageTransitionEngine.calculatePoolAdvancement(
      pools,
      {
        advancementType: transition.seedingRules.method === "pool-rankings" ? "top-n-per-pool" : "top-n-overall",
        teamsAdvancingPerPool: 2, // Default, should be configurable
        wildcardSpots: transition.seedingRules.wildcardSeeding.enabled ? 
          transition.seedingRules.wildcardSeeding.wildcardCount : 0,
        wildcardCriteria: transition.seedingRules.wildcardSeeding.wildcardCriteria,
      }
    );

    // Generate bracket based on advancement results
    const supportedBracketType: 'single-elimination' | 'double-elimination' = 
      (transition.bracketGeneration.bracketType === 'single-elimination' || 
       transition.bracketGeneration.bracketType === 'double-elimination') 
        ? transition.bracketGeneration.bracketType 
        : 'single-elimination'; // Default to single elimination for unsupported types
        
    const bracketMatches = this.generateSeededEliminationBracket(
      advancementResults.seedingOrder,
      supportedBracketType,
      tournamentId
    );

    return {
      matches: bracketMatches,
      totalRounds: this.calculateTotalRounds(advancementResults.advancingTeams.length, transition.bracketGeneration.bracketType),
      totalMatches: bracketMatches.length,
      format: transition.bracketGeneration.bracketType,
      seedingInfo: {
        seedingMethod: transition.seedingRules.method,
        advancementSource: "pool-play",
        crossPoolSeeding: transition.seedingRules.crossPoolSeeding.enabled,
      },
      advancementResults,
    };
  }

  /**
   * Generate elimination bracket from Swiss system results
   */
  static generateBracketFromSwiss(
    swissRounds: SwissRound[],
    teams: string[],
    advancementCriteria: {
      totalTeamsAdvancing: number;
      pointsThreshold?: number;
      minimumWinPercentage?: number;
    },
    bracketType: 'single-elimination' | 'double-elimination',
    tournamentId: string
  ): ProfessionalBracketStructure {
    
    // Calculate Swiss advancement results
    const swissResults = SwissSystemEngine.executeSwissToElimination(
      swissRounds,
      {
        totalTeamsAdvancing: advancementCriteria.totalTeamsAdvancing,
        pointsThreshold: advancementCriteria.pointsThreshold,
        minimumWinPercentage: advancementCriteria.minimumWinPercentage,
        tiebreakers: [
          { method: 'buchholz', priority: 1 },
          { method: 'sonneborn-berger', priority: 2 },
        ],
      },
      teams
    );

    // Convert Swiss results to seeding format
    const seedingOrder = swissResults.nextStageSeeding || [];

    // Generate bracket
    const bracketMatches = this.generateSeededEliminationBracket(
      seedingOrder,
      bracketType,
      tournamentId
    );

    return {
      matches: bracketMatches,
      totalRounds: this.calculateTotalRounds(seedingOrder.length, bracketType),
      totalMatches: bracketMatches.length,
      format: bracketType,
      seedingInfo: {
        seedingMethod: "swiss-rankings",
        advancementSource: "swiss-system",
        crossPoolSeeding: false,
      },
    };
  }

  /**
   * Generate seeded elimination bracket with professional tournament seeding
   */
  private static generateSeededEliminationBracket(
    seedingOrder: Array<{
      team: string;
      seed: number;
      bracketPosition: number;
      seedingJustification?: string;
    }>,
    bracketType: 'single-elimination' | 'double-elimination',
    tournamentId: string
  ): BracketMatch[] {
    
    if (bracketType === 'double-elimination') {
      return this.generateDoubleEliminationBracket(seedingOrder, tournamentId);
    }
    
    return this.generateSingleEliminationBracket(seedingOrder, tournamentId);
  }

  /**
   * Generate single elimination bracket with proper seeding
   */
  private static generateSingleEliminationBracket(
    seedingOrder: Array<{
      team: string;
      seed: number;
      bracketPosition: number;
      seedingJustification?: string;
    }>,
    tournamentId: string
  ): BracketMatch[] {
    
    const teamCount = seedingOrder.length;
    const totalRounds = Math.ceil(Math.log2(teamCount));
    const bracketSize = Math.pow(2, totalRounds);
    const matches: BracketMatch[] = [];
    let matchId = 1;

    // Create bracket positions with proper seeding
    const bracketPositions = this.createProfessionalBracketPositions(seedingOrder, bracketSize);

    // First round matches
    const firstRoundMatches = Math.floor(bracketSize / 2);
    
    for (let i = 0; i < firstRoundMatches; i++) {
      const position1 = i * 2;
      const position2 = i * 2 + 1;
      
      const team1Data = bracketPositions[position1];
      const team2Data = bracketPositions[position2];
      
      if (team1Data || team2Data) {
        matches.push({
          id: `bracket-${matchId++}`,
          tournamentId,
          round: 1,
          position: i + 1,
          team1: team1Data?.team || 'BYE',
          team2: team2Data?.team || 'BYE',
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          winner: (team1Data && !team2Data) ? team1Data.team : 
                  (team2Data && !team1Data) ? team2Data.team : undefined,
          seedInfo: {
            team1Seed: team1Data?.seed,
            team2Seed: team2Data?.seed,
            team1Origin: team1Data?.seedingJustification || "Advanced",
            team2Origin: team2Data?.seedingJustification || "Advanced",
          },
        });
      }
    }

    // Generate subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      
      for (let pos = 1; pos <= matchesInRound; pos++) {
        matches.push({
          id: `bracket-${matchId++}`,
          tournamentId,
          round,
          position: pos,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
        });
      }
    }

    return matches;
  }

  /**
   * Generate double elimination bracket with winners and losers brackets
   */
  private static generateDoubleEliminationBracket(
    seedingOrder: Array<{
      team: string;
      seed: number;
      bracketPosition: number;
      seedingJustification?: string;
    }>,
    tournamentId: string
  ): BracketMatch[] {
    
    const matches: BracketMatch[] = [];
    let matchId = 1;
    const teamCount = seedingOrder.length;
    
    // Winners bracket
    const winnersMatches = this.generateSingleEliminationBracket(seedingOrder, tournamentId);
    winnersMatches.forEach(match => {
      matches.push({
        ...match,
        id: `winners-${matchId++}`,
        bracket: 'winners'
      });
    });

    // Losers bracket (more complex structure)
    const losersRounds = this.calculateLosersRounds(teamCount);
    for (let round = 1; round <= losersRounds; round++) {
      const matchesInRound = this.calculateLosersMatchesInRound(round, teamCount);
      
      for (let pos = 1; pos <= matchesInRound; pos++) {
        matches.push({
          id: `losers-${matchId++}`,
          tournamentId,
          round,
          position: pos,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'losers'
        });
      }
    }

    // Championship match(es)
    matches.push({
      id: `championship-${matchId++}`,
      tournamentId,
      round: 1,
      position: 1,
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'championship'
    });

    // Potential championship bracket reset
    matches.push({
      id: `championship-reset-${matchId++}`,
      tournamentId,
      round: 2,
      position: 1,
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'championship'
    });

    return matches;
  }

  /**
   * Create professional bracket positions using advanced seeding patterns
   */
  private static createProfessionalBracketPositions(
    seedingOrder: Array<{
      team: string;
      seed: number;
      bracketPosition: number;
      seedingJustification?: string;
    }>,
    bracketSize: number
  ): Array<{ team: string; seed: number; seedingJustification?: string } | null> {
    
    const positions: Array<{ team: string; seed: number; seedingJustification?: string } | null> = 
      new Array(bracketSize).fill(null);

    // Use professional tournament seeding pattern
    const seedingPattern = this.generateProfessionalSeedingOrder(bracketSize);
    
    seedingOrder.forEach((teamData, index) => {
      if (index < seedingPattern.length) {
        const position = seedingPattern[index] - 1; // Convert to 0-based
        positions[position] = teamData;
      }
    });

    return positions;
  }

  /**
   * Generate professional seeding order for any bracket size
   */
  private static generateProfessionalSeedingOrder(bracketSize: number): number[] {
    // Standard tournament seeding where #1 seed faces #N seed, #2 faces #(N-1), etc.
    if (bracketSize === 2) return [1, 2];
    if (bracketSize === 4) return [1, 4, 2, 3];
    if (bracketSize === 8) return [1, 8, 4, 5, 2, 7, 3, 6];
    if (bracketSize === 16) return [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11];
    if (bracketSize === 32) return [1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21, 2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22];

    // Generate dynamically for other sizes
    return this.generateDynamicSeedingOrder(bracketSize);
  }

  /**
   * Generate dynamic seeding order for any size
   */
  private static generateDynamicSeedingOrder(size: number): number[] {
    if (size <= 2) return [1, 2].slice(0, size);
    
    const halfSize = Math.floor(size / 2);
    const firstHalf = this.generateDynamicSeedingOrder(halfSize);
    const secondHalf = firstHalf.map(seed => size + 1 - seed);
    
    const result: number[] = [];
    for (let i = 0; i < halfSize; i++) {
      result.push(firstHalf[i]);
      if (secondHalf[i]) result.push(secondHalf[i]);
    }
    
    return result.slice(0, size);
  }

  /**
   * Calculate total rounds for bracket type and team count
   */
  private static calculateTotalRounds(teamCount: number, bracketType: string): number {
    if (bracketType === 'double-elimination') {
      return Math.ceil(Math.log2(teamCount)) + Math.ceil(Math.log2(teamCount)) - 1;
    }
    
    return Math.ceil(Math.log2(teamCount));
  }

  /**
   * Calculate losers bracket structure for double elimination
   */
  private static calculateLosersRounds(teamCount: number): number {
    return (Math.ceil(Math.log2(teamCount)) - 1) * 2;
  }

  private static calculateLosersMatchesInRound(round: number, teamCount: number): number {
    // Complex calculation for losers bracket matches per round
    // This is simplified - actual implementation depends on bracket structure
    const winnersRounds = Math.ceil(Math.log2(teamCount));
    
    if (round === 1) {
      return Math.floor(teamCount / 4);
    } else if (round % 2 === 0) {
      return Math.pow(2, winnersRounds - Math.floor(round / 2) - 1);
    } else {
      return Math.pow(2, winnersRounds - Math.floor((round + 1) / 2) - 1);
    }
  }

  /**
   * Generate round robin bracket from pool results
   */
  static generateRoundRobinFromPools(
    advancingTeams: string[],
    tournamentId: string
  ): ProfessionalBracketStructure {
    const matches: BracketMatch[] = [];
    let matchId = 1;

    // Generate all possible pairings
    for (let i = 0; i < advancingTeams.length; i++) {
      for (let j = i + 1; j < advancingTeams.length; j++) {
        matches.push({
          id: `rr-${matchId++}`,
          tournamentId,
          round: 1, // All matches are in "round 1" for round robin
          position: matchId - 1,
          team1: advancingTeams[i],
          team2: advancingTeams[j],
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
        });
      }
    }

    return {
      matches,
      totalRounds: 1,
      totalMatches: matches.length,
      format: 'round-robin',
      seedingInfo: {
        seedingMethod: "pool-advancement",
        advancementSource: "pool-play",
        crossPoolSeeding: true,
      },
    };
  }

  /**
   * Validate bracket generation parameters
   */
  static validateBracketGeneration(
    teamCount: number,
    bracketType: string,
    maxSize: number = 64
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (teamCount < 2) {
      errors.push("Need at least 2 teams for bracket generation");
    }

    if (teamCount > maxSize) {
      errors.push(`Maximum ${maxSize} teams supported`);
    }

    if (bracketType === 'double-elimination' && teamCount < 4) {
      errors.push("Double elimination requires at least 4 teams");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}