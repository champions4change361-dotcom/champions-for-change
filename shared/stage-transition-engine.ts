// Professional Stage Transition Engine for Multi-Stage Tournaments
// Handles advancement calculations, seeding, and bracket generation

import { 
  Pool, 
  SwissRound, 
  StageResults, 
  StageTransition, 
  TournamentState,
  TiebreakerRule,
  professionalTournamentFormats 
} from './multi-stage-schema';

export interface TeamStanding {
  team: string;
  teamId?: string;
  wins: number;
  losses: number;
  draws: number;
  points: number; // Tournament points
  gamePoints: number; // Actual game points scored
  pointsAllowed: number;
  pointDifferential: number;
  winPercentage: number;
  strengthOfSchedule: number;
  headToHeadResults: Record<string, any>;
  tiebreakerValues: Record<string, number>;
  matchesPlayed: number;
  poolId?: string;
  poolPlacement?: number;
}

export interface AdvancementResult {
  advancingTeams: TeamStanding[];
  eliminatedTeams: TeamStanding[];
  seedingOrder: Array<{
    team: string;
    seed: number;
    advancementReason: string;
    bracketPosition: number;
  }>;
  tiebreakersUsed: string[];
  wildcardSelections?: TeamStanding[];
}

export class StageTransitionEngine {

  /**
   * Calculate comprehensive pool standings with professional tiebreaking
   */
  static calculatePoolStandings(
    pool: Pool, 
    tiebreakers: TiebreakerRule[] = []
  ): TeamStanding[] {
    const standings: TeamStanding[] = pool.teams.map(team => {
      const teamMatches = pool.matches.filter(m => 
        (m.team1 === team || m.team2 === team) && m.completed
      );
      
      let wins = 0, losses = 0, draws = 0;
      let gamePoints = 0, pointsAllowed = 0;
      const headToHeadResults: Record<string, any> = {};
      
      // Calculate basic statistics
      teamMatches.forEach(match => {
        const isTeam1 = match.team1 === team;
        const teamScore = isTeam1 ? (match.team1Score || 0) : (match.team2Score || 0);
        const opponentScore = isTeam1 ? (match.team2Score || 0) : (match.team1Score || 0);
        const opponent = isTeam1 ? match.team2 : match.team1;
        
        gamePoints += teamScore;
        pointsAllowed += opponentScore;
        
        if (match.isDraw) {
          draws++;
        } else if (match.winner === team) {
          wins++;
        } else if (match.winner && match.winner !== team) {
          losses++;
        }
        
        // Track head-to-head results
        if (!headToHeadResults[opponent]) {
          headToHeadResults[opponent] = { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 };
        }
        
        if (match.winner === team) {
          headToHeadResults[opponent].wins++;
        } else if (match.winner === opponent) {
          headToHeadResults[opponent].losses++;
        }
        
        headToHeadResults[opponent].pointsFor += teamScore;
        headToHeadResults[opponent].pointsAgainst += opponentScore;
      });
      
      const matchesPlayed = wins + losses + draws;
      const pointDifferential = gamePoints - pointsAllowed;
      const winPercentage = matchesPlayed > 0 ? wins / matchesPlayed : 0;
      
      // Calculate tournament points (typically 3 for win, 1 for draw, 0 for loss)
      const pointsPerWin = pool.poolSettings?.pointsPerWin || 3;
      const pointsPerDraw = pool.poolSettings?.pointsPerDraw || 1;
      const tournamentPoints = (wins * pointsPerWin) + (draws * pointsPerDraw);
      
      // Calculate strength of schedule (average opponent win percentage)
      const strengthOfSchedule = this.calculateStrengthOfSchedule(team, pool);
      
      return {
        team,
        wins,
        losses,
        draws,
        points: tournamentPoints,
        gamePoints,
        pointsAllowed,
        pointDifferential,
        winPercentage,
        strengthOfSchedule,
        headToHeadResults,
        tiebreakerValues: {},
        matchesPlayed,
        poolId: pool.poolId,
      };
    });
    
    // Apply professional tiebreaking
    return this.applyTiebreakers(standings, tiebreakers);
  }

  /**
   * Apply professional tiebreaker system to standings
   */
  static applyTiebreakers(
    standings: TeamStanding[], 
    tiebreakers: TiebreakerRule[]
  ): TeamStanding[] {
    return standings.sort((a, b) => {
      // Primary sort: Tournament points (descending)
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      
      // Apply tiebreakers in order of priority
      const sortedTiebreakers = [...tiebreakers].sort((x, y) => x.priority - y.priority);
      
      for (const tiebreaker of sortedTiebreakers) {
        const result = this.applyTiebreaker(a, b, tiebreaker.method);
        if (result !== 0) return result;
      }
      
      // Final fallback: alphabetical by team name
      return a.team.localeCompare(b.team);
    });
  }

  /**
   * Apply a specific tiebreaker method
   */
  private static applyTiebreaker(
    teamA: TeamStanding, 
    teamB: TeamStanding, 
    method: string
  ): number {
    switch (method) {
      case "head-to-head-record":
        return this.headToHeadTiebreaker(teamA, teamB);
        
      case "point-differential":
        return teamB.pointDifferential - teamA.pointDifferential;
        
      case "total-points-scored":
        return teamB.gamePoints - teamA.gamePoints;
        
      case "total-points-allowed":
        return teamA.pointsAllowed - teamB.pointsAllowed; // Lower is better
        
      case "wins-vs-common-opponents":
        return this.commonOpponentsTiebreaker(teamA, teamB);
        
      case "strength-of-schedule":
        return teamB.strengthOfSchedule - teamA.strengthOfSchedule;
        
      case "random-draw":
      case "coin-flip":
        return Math.random() - 0.5;
        
      default:
        return 0;
    }
  }

  /**
   * Head-to-head tiebreaker
   */
  private static headToHeadTiebreaker(teamA: TeamStanding, teamB: TeamStanding): number {
    const aVsB = teamA.headToHeadResults[teamB.team];
    if (!aVsB) return 0;
    
    // Compare head-to-head record
    if (aVsB.wins !== aVsB.losses) {
      return aVsB.wins - aVsB.losses;
    }
    
    // If tied, compare head-to-head point differential
    const h2hDiff = aVsB.pointsFor - aVsB.pointsAgainst;
    return h2hDiff;
  }

  /**
   * Common opponents tiebreaker
   */
  private static commonOpponentsTiebreaker(teamA: TeamStanding, teamB: TeamStanding): number {
    const commonOpponents = Object.keys(teamA.headToHeadResults).filter(
      opponent => teamB.headToHeadResults[opponent]
    );
    
    if (commonOpponents.length === 0) return 0;
    
    let aWins = 0, bWins = 0;
    commonOpponents.forEach(opponent => {
      aWins += teamA.headToHeadResults[opponent].wins;
      bWins += teamB.headToHeadResults[opponent].wins;
    });
    
    return bWins - aWins; // Higher wins against common opponents is better
  }

  /**
   * Calculate strength of schedule
   */
  private static calculateStrengthOfSchedule(team: string, pool: Pool): number {
    const teamMatches = pool.matches.filter(m => 
      (m.team1 === team || m.team2 === team) && m.completed
    );
    
    if (teamMatches.length === 0) return 0;
    
    // Get all opponents and their win percentages
    const opponents = teamMatches.map(match => 
      match.team1 === team ? match.team2 : match.team1
    );
    
    // Calculate average opponent win percentage
    // This is a simplified version - in practice, you'd calculate each opponent's full record
    let totalOpponentWinPercentage = 0;
    opponents.forEach(opponent => {
      const opponentMatches = pool.matches.filter(m => 
        (m.team1 === opponent || m.team2 === opponent) && m.completed
      );
      
      const opponentWins = opponentMatches.filter(m => m.winner === opponent).length;
      const opponentWinPct = opponentMatches.length > 0 ? opponentWins / opponentMatches.length : 0;
      totalOpponentWinPercentage += opponentWinPct;
    });
    
    return opponents.length > 0 ? totalOpponentWinPercentage / opponents.length : 0;
  }

  /**
   * Determine advancing teams from pools with professional advancement logic
   */
  static calculatePoolAdvancement(
    pools: Pool[],
    advancementRules: {
      advancementType: string;
      teamsAdvancingPerPool?: number;
      totalTeamsAdvancing?: number;
      wildcardSpots?: number;
      wildcardCriteria?: string;
    },
    tiebreakers: TiebreakerRule[] = []
  ): AdvancementResult {
    const allStandings: TeamStanding[] = [];
    const poolStandings: Record<string, TeamStanding[]> = {};
    
    // Calculate standings for each pool
    pools.forEach(pool => {
      const standings = this.calculatePoolStandings(pool, tiebreakers);
      poolStandings[pool.poolId] = standings;
      allStandings.push(...standings.map((s, index) => ({
        ...s,
        poolPlacement: index + 1
      })));
    });
    
    let advancingTeams: TeamStanding[] = [];
    let tiebreakersUsed: string[] = [];
    
    // Handle different advancement types
    switch (advancementRules.advancementType) {
      case "top-n-per-pool":
        advancingTeams = this.advanceTopNPerPool(
          poolStandings, 
          advancementRules.teamsAdvancingPerPool || 2
        );
        break;
        
      case "top-n-overall":
        advancingTeams = this.advanceTopNOverall(
          allStandings, 
          advancementRules.totalTeamsAdvancing || 8,
          tiebreakers
        );
        tiebreakersUsed = tiebreakers.map(t => t.method);
        break;
        
      case "percentage":
        // Advance top percentage of teams
        const totalTeams = allStandings.length;
        const advanceCount = Math.floor(totalTeams * 0.5); // Default 50%
        advancingTeams = allStandings
          .sort((a, b) => b.points - a.points)
          .slice(0, advanceCount);
        break;
    }
    
    // Handle wildcards if specified
    let wildcardSelections: TeamStanding[] = [];
    if (advancementRules.wildcardSpots && advancementRules.wildcardSpots > 0) {
      wildcardSelections = this.selectWildcards(
        allStandings,
        advancingTeams,
        advancementRules.wildcardSpots,
        advancementRules.wildcardCriteria || "best-record",
        tiebreakers
      );
      advancingTeams = [...advancingTeams, ...wildcardSelections];
    }
    
    const eliminatedTeams = allStandings.filter(
      team => !advancingTeams.find(at => at.team === team.team)
    );
    
    // Generate seeding order
    const seedingOrder = this.generateSeedingOrder(advancingTeams, poolStandings);
    
    return {
      advancingTeams,
      eliminatedTeams,
      seedingOrder,
      tiebreakersUsed,
      wildcardSelections: wildcardSelections.length > 0 ? wildcardSelections : undefined,
    };
  }

  /**
   * Advance top N teams from each pool
   */
  private static advanceTopNPerPool(
    poolStandings: Record<string, TeamStanding[]>,
    teamsPerPool: number
  ): TeamStanding[] {
    const advancing: TeamStanding[] = [];
    
    Object.values(poolStandings).forEach(standings => {
      const poolAdvancers = standings.slice(0, teamsPerPool).map(team => ({
        ...team,
        advancementReason: team.poolPlacement === 1 ? "Pool Winner" : `Pool ${this.getOrdinal(team.poolPlacement || 1)}`
      }));
      advancing.push(...poolAdvancers);
    });
    
    return advancing;
  }

  /**
   * Advance top N teams overall across all pools
   */
  private static advanceTopNOverall(
    allStandings: TeamStanding[],
    totalAdvancing: number,
    tiebreakers: TiebreakerRule[]
  ): TeamStanding[] {
    const sortedStandings = this.applyTiebreakers(allStandings, tiebreakers);
    return sortedStandings.slice(0, totalAdvancing);
  }

  /**
   * Select wildcard teams
   */
  private static selectWildcards(
    allStandings: TeamStanding[],
    alreadyAdvancing: TeamStanding[],
    wildcardSpots: number,
    criteria: string,
    tiebreakers: TiebreakerRule[]
  ): TeamStanding[] {
    // Filter out teams that already advanced
    const eligibleTeams = allStandings.filter(
      team => !alreadyAdvancing.find(at => at.team === team.team)
    );
    
    // Sort by wildcard criteria
    let sortedEligible: TeamStanding[];
    
    switch (criteria) {
      case "best-record":
        sortedEligible = this.applyTiebreakers(eligibleTeams, tiebreakers);
        break;
        
      case "best-point-differential":
        sortedEligible = eligibleTeams.sort((a, b) => b.pointDifferential - a.pointDifferential);
        break;
        
      case "best-strength-of-schedule":
        sortedEligible = eligibleTeams.sort((a, b) => b.strengthOfSchedule - a.strengthOfSchedule);
        break;
        
      default:
        sortedEligible = this.applyTiebreakers(eligibleTeams, tiebreakers);
        break;
    }
    
    return sortedEligible.slice(0, wildcardSpots).map(team => ({
      ...team,
      advancementReason: "Wildcard"
    }));
  }

  /**
   * Generate seeding order for next stage with professional cross-pool seeding
   */
  private static generateSeedingOrder(
    advancingTeams: TeamStanding[],
    poolStandings: Record<string, TeamStanding[]>
  ): Array<{ team: string; seed: number; advancementReason: string; bracketPosition: number }> {
    // Group teams by pool placement
    const poolWinners: TeamStanding[] = [];
    const runnerUps: TeamStanding[] = [];
    const thirdPlace: TeamStanding[] = [];
    const wildcards: TeamStanding[] = [];
    
    advancingTeams.forEach(team => {
      switch (team.poolPlacement) {
        case 1:
          poolWinners.push(team);
          break;
        case 2:
          runnerUps.push(team);
          break;
        case 3:
          thirdPlace.push(team);
          break;
        default:
          if (team.advancementReason === "Wildcard") {
            wildcards.push(team);
          } else {
            thirdPlace.push(team); // Fallback
          }
          break;
      }
    });
    
    // Sort each group by performance
    const sortedPoolWinners = poolWinners.sort((a, b) => b.points - a.points || b.pointDifferential - a.pointDifferential);
    const sortedRunnerUps = runnerUps.sort((a, b) => b.points - a.points || b.pointDifferential - a.pointDifferential);
    const sortedThirdPlace = thirdPlace.sort((a, b) => b.points - a.points || b.pointDifferential - a.pointDifferential);
    const sortedWildcards = wildcards.sort((a, b) => b.points - a.points || b.pointDifferential - a.pointDifferential);
    
    // Create snake seeding pattern (best pool winners face worst advancing teams)
    const seedingOrder: Array<{ team: string; seed: number; advancementReason: string; bracketPosition: number }> = [];
    const allAdvancing = [...sortedPoolWinners, ...sortedRunnerUps, ...sortedThirdPlace, ...sortedWildcards];
    
    allAdvancing.forEach((team, index) => {
      seedingOrder.push({
        team: team.team,
        seed: index + 1,
        advancementReason: team.advancementReason || `Pool ${this.getOrdinal(team.poolPlacement || 1)}`,
        bracketPosition: this.calculateBracketPosition(index + 1, allAdvancing.length)
      });
    });
    
    return seedingOrder;
  }

  /**
   * Calculate bracket position using tournament seeding principles
   */
  private static calculateBracketPosition(seed: number, totalTeams: number): number {
    // Standard tournament bracket seeding
    // Seed 1 vs Seed N, Seed 2 vs Seed N-1, etc.
    if (seed <= totalTeams / 2) {
      return seed;
    } else {
      return totalTeams - seed + 1;
    }
  }

  /**
   * Handle Swiss system advancement to elimination brackets
   */
  static calculateSwissAdvancement(
    swissRounds: SwissRound[],
    advancementRules: {
      totalTeamsAdvancing: number;
      pointsThreshold?: number;
      minimumWinPercentage?: number;
    }
  ): AdvancementResult {
    if (swissRounds.length === 0) {
      return {
        advancingTeams: [],
        eliminatedTeams: [],
        seedingOrder: [],
        tiebreakersUsed: []
      };
    }
    
    // Get final standings from last completed round
    const finalRound = swissRounds[swissRounds.length - 1];
    const standings = finalRound.standings || [];
    
    // Apply advancement criteria
    let qualifiedTeams = standings.filter(team => {
      const meetsThreshold = !advancementRules.pointsThreshold || 
        team.tournamentPoints >= advancementRules.pointsThreshold;
      const meetsWinRate = !advancementRules.minimumWinPercentage || 
        (team.wins / (team.wins + team.losses + team.draws)) >= (advancementRules.minimumWinPercentage / 100);
      
      return meetsThreshold && meetsWinRate;
    });
    
    // Take top N if we have more qualified teams than spots
    qualifiedTeams = qualifiedTeams
      .sort((a, b) => {
        if (b.tournamentPoints !== a.tournamentPoints) {
          return b.tournamentPoints - a.tournamentPoints;
        }
        // Tiebreaker: Buchholz (sum of opponent scores)
        return b.opponentPoints - a.opponentPoints;
      })
      .slice(0, advancementRules.totalTeamsAdvancing);
    
    const advancingTeams: TeamStanding[] = qualifiedTeams.map(team => ({
      team: team.team,
      wins: team.wins,
      losses: team.losses,
      draws: team.draws,
      points: team.tournamentPoints,
      gamePoints: team.gamePoints,
      pointsAllowed: 0, // Not tracked in Swiss
      pointDifferential: team.gamePoints,
      winPercentage: team.wins / (team.wins + team.losses + team.draws),
      strengthOfSchedule: team.strengthOfSchedule,
      headToHeadResults: {},
      tiebreakerValues: { buchholz: team.opponentPoints },
      matchesPlayed: team.wins + team.losses + team.draws,
    }));
    
    const eliminatedTeams = standings
      .filter(team => !qualifiedTeams.find(qt => qt.team === team.team))
      .map(team => ({
        team: team.team,
        wins: team.wins,
        losses: team.losses,
        draws: team.draws,
        points: team.tournamentPoints,
        gamePoints: team.gamePoints,
        pointsAllowed: 0,
        pointDifferential: team.gamePoints,
        winPercentage: team.wins / (team.wins + team.losses + team.draws),
        strengthOfSchedule: team.strengthOfSchedule,
        headToHeadResults: {},
        tiebreakerValues: { buchholz: team.opponentPoints },
        matchesPlayed: team.wins + team.losses + team.draws,
      }));
    
    const seedingOrder = advancingTeams.map((team, index) => ({
      team: team.team,
      seed: index + 1,
      advancementReason: "Swiss Qualifier",
      bracketPosition: this.calculateBracketPosition(index + 1, advancingTeams.length)
    }));
    
    return {
      advancingTeams,
      eliminatedTeams,
      seedingOrder,
      tiebreakersUsed: ["tournament-points", "buchholz-tiebreaker"]
    };
  }

  /**
   * Execute complete stage transition
   */
  static executeStageTransition(
    currentStageData: Pool[] | SwissRound[],
    transition: StageTransition,
    tiebreakers: TiebreakerRule[] = []
  ): StageResults {
    let advancement: AdvancementResult;
    
    // Determine if we're transitioning from pools or Swiss
    if (currentStageData.length > 0 && 'poolId' in currentStageData[0]) {
      // Pool transition
      const pools = currentStageData as Pool[];
      const advancementRules = {
        advancementType: transition.seedingRules.method === "pool-rankings" ? "top-n-per-pool" : "top-n-overall",
        teamsAdvancingPerPool: 2, // Default
        wildcardSpots: transition.seedingRules.wildcardSeeding.enabled ? 
          transition.seedingRules.wildcardSeeding.wildcardCount : 0,
        wildcardCriteria: transition.seedingRules.wildcardSeeding.wildcardCriteria,
      };
      
      advancement = this.calculatePoolAdvancement(pools, advancementRules, tiebreakers);
    } else {
      // Swiss transition
      const swissRounds = currentStageData as SwissRound[];
      const advancementRules = {
        totalTeamsAdvancing: 8, // Default
        pointsThreshold: 4, // Default Swiss points needed
      };
      
      advancement = this.calculateSwissAdvancement(swissRounds, advancementRules);
    }
    
    // Build comprehensive stage results
    const stageResults: StageResults = {
      stageNumber: transition.fromStage,
      stageName: "Stage Transition", // Should be provided by caller
      stageType: "transition",
      results: advancement.advancingTeams.map(team => ({
        team: team.team,
        teamId: team.teamId,
        finalPlacement: advancement.seedingOrder.find(s => s.team === team.team)?.seed || 0,
        record: {
          wins: team.wins,
          losses: team.losses,
          draws: team.draws,
          totalMatches: team.matchesPlayed,
          winPercentage: team.winPercentage,
        },
        scoring: {
          tournamentPoints: team.points,
          gamePointsFor: team.gamePoints,
          gamePointsAgainst: team.pointsAllowed,
          pointDifferential: team.pointDifferential,
          averageScore: team.matchesPlayed > 0 ? team.gamePoints / team.matchesPlayed : 0,
        },
        strengthOfSchedule: team.strengthOfSchedule,
        qualified: true,
        advancementMethod: team.advancementReason === "Pool Winner" ? "pool-winner" :
                          team.advancementReason === "Wildcard" ? "wildcard" : "runner-up",
        seedForNextStage: advancement.seedingOrder.find(s => s.team === team.team)?.seed,
        nextStageBracketPosition: advancement.seedingOrder.find(s => s.team === team.team)?.bracketPosition,
      })),
      advancementSummary: {
        totalTeamsAdvancing: advancement.advancingTeams.length,
        advancementByMethod: {},
        tiebreadersRequired: advancement.tiebreakersUsed.length > 0,
        controversialAdvancement: false, // Could be enhanced with close margin detection
      },
      advancingTeams: advancement.advancingTeams.map(t => t.team),
      eliminatedTeams: advancement.eliminatedTeams.map(t => t.team),
      nextStageSeeding: advancement.seedingOrder.map(s => ({
        team: s.team,
        seed: s.seed,
        bracketPosition: s.bracketPosition,
        seedingJustification: s.advancementReason,
      })),
      completedAt: new Date().toISOString(),
      nextStageReady: true,
    };
    
    return stageResults;
  }

  /**
   * Utility function to get ordinal numbers (1st, 2nd, 3rd, etc.)
   */
  private static getOrdinal(n: number): string {
    const suffix = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
  }
}

// Export utility functions for use in components
export const StageTransitionUtils = {
  validateAdvancement: (pools: Pool[], rules: any) => {
    // Validate that advancement rules are feasible
    return true;
  },
  
  estimateTransitionTime: (teams: number, bracketType: string) => {
    // Estimate time needed for stage transition based on team count and bracket type
    const baseTime = 15; // 15 minutes base
    const teamFactor = Math.ceil(teams / 16) * 5; // 5 minutes per 16 teams
    return baseTime + teamFactor;
  },
  
  generateTransitionReport: (results: StageResults) => {
    // Generate human-readable transition report
    return {
      summary: `${results.advancingTeams.length} teams advanced to the next stage`,
      details: results.nextStageSeeding?.map(s => 
        `${s.seed}. ${s.team} (${s.seedingJustification})`
      ).join('\n') || '',
      tiebreakersUsed: results.advancementSummary.tiebreadersRequired,
    };
  }
};