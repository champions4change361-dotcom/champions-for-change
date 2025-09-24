// Swiss System Tournament Engine for Professional Multi-Stage Tournaments
// Handles Swiss pairings, scoring, and advancement to elimination brackets

import { 
  SwissRound, 
  StageResults,
  TiebreakerRule,
  type StageTransition 
} from './multi-stage-schema';
import { StageTransitionEngine, type TeamStanding } from './stage-transition-engine';

export interface SwissTeamRecord {
  team: string;
  teamId?: string;
  tournamentPoints: number; // Swiss points (1 point per win, 0.5 per draw)
  gamePoints: number; // Actual game points scored
  wins: number;
  losses: number;
  draws: number;
  opponentPoints: number; // Buchholz score (sum of opponent Swiss points)
  strengthOfSchedule: number;
  performance: number; // Performance rating based on opponents faced
  
  // Advanced Swiss metrics
  colorBalance: { white: number; black: number }; // For games with color assignments
  averageOpponentRating: number;
  matchHistory: Array<{
    round: number;
    opponent: string;
    result: 'win' | 'loss' | 'draw';
    gamePoints: number;
    opponentPoints: number;
  }>;
}

export interface SwissPairingOptions {
  pairingMethod: 'swiss' | 'accelerated' | 'dutch' | 'round-robin';
  avoidRematches: boolean;
  strengthPairing: boolean; // Pair teams with similar records
  acceleratedPairings: boolean; // For early rounds with large fields
  colorBalancing: boolean; // Balance color assignments (if applicable)
  upFloatProtection: boolean; // Protect against excessive upward floating
  avoidGeographicConflicts: boolean;
  
  // Pairing constraints
  maxPointSpread: number; // Maximum point difference in pairings
  minimumGamesForStrength: number; // Games needed before strength-based pairing
}

export interface SwissAdvancementCriteria {
  totalTeamsAdvancing: number;
  pointsThreshold?: number; // Minimum Swiss points to advance
  minimumWinPercentage?: number; // Minimum win percentage required
  performanceThreshold?: number; // Minimum performance rating
  
  // Tiebreaker priorities for advancement
  tiebreakers: Array<{
    method: 'buchholz' | 'sonneborn-berger' | 'cumulative' | 'most-blacks' | 'direct-encounter';
    priority: number;
  }>;
  
  // Advancement guarantees
  guaranteedSlots?: number; // Top N teams automatically advance regardless of threshold
  wildcardSlots?: number; // Additional spots for close calls
}

export class SwissSystemEngine {

  /**
   * Generate Swiss tournament pairings for a round
   */
  static generateSwissPairings(
    currentStandings: SwissTeamRecord[],
    roundNumber: number,
    options: SwissPairingOptions
  ): Array<{ team1: string; team2: string; tableNumber: number }> {
    
    if (options.pairingMethod === 'accelerated' && roundNumber <= 2) {
      return this.generateAcceleratedPairings(currentStandings, roundNumber);
    }
    
    // Sort teams by tournament points, then by tiebreakers
    const sortedTeams = this.sortTeamsBySwissStandings(currentStandings);
    const pairings: Array<{ team1: string; team2: string; tableNumber: number }> = [];
    const paired = new Set<string>();
    
    let tableNumber = 1;
    
    // Group teams by point totals for Swiss pairing
    const pointGroups = this.groupTeamsByPoints(sortedTeams);
    
    for (const [points, teams] of Array.from(pointGroups.entries())) {
      const availableTeams = teams.filter((team: SwissTeamRecord) => !paired.has(team.team));
      
      // Pair within point group first
      while (availableTeams.length >= 2) {
        const team1 = availableTeams.shift()!;
        let bestOpponent: SwissTeamRecord | null = null;
        let bestOpponentIndex = -1;
        
        // Find best opponent (avoiding rematches, considering color balance, etc.)
        for (let i = 0; i < availableTeams.length; i++) {
          const team2 = availableTeams[i];
          
          if (options.avoidRematches && this.hasPlayedBefore(team1, team2)) {
            continue;
          }
          
          if (!bestOpponent) {
            bestOpponent = team2;
            bestOpponentIndex = i;
          }
        }
        
        if (bestOpponent) {
          pairings.push({
            team1: team1.team,
            team2: bestOpponent.team,
            tableNumber: tableNumber++
          });
          
          paired.add(team1.team);
          paired.add(bestOpponent.team);
          availableTeams.splice(bestOpponentIndex, 1);
        } else {
          // No suitable opponent in same point group - will need to float
          break;
        }
      }
      
      // Handle floating to next point group if needed
      for (const unpaired of availableTeams) {
        if (!paired.has(unpaired.team)) {
          // Find opponent from different point group
          const floatingOpponent = this.findFloatingOpponent(unpaired, sortedTeams, paired, options);
          if (floatingOpponent) {
            pairings.push({
              team1: unpaired.team,
              team2: floatingOpponent.team,
              tableNumber: tableNumber++
            });
            
            paired.add(unpaired.team);
            paired.add(floatingOpponent.team);
          }
        }
      }
    }
    
    return pairings;
  }

  /**
   * Generate accelerated pairings for early rounds with large fields
   */
  private static generateAcceleratedPairings(
    teams: SwissTeamRecord[],
    round: number
  ): Array<{ team1: string; team2: string; tableNumber: number }> {
    // In accelerated Swiss, stronger teams get extra points early to reduce rounds
    // This is typically used in large tournaments to avoid having too many rounds
    
    const sortedTeams = teams.sort((a, b) => b.performance - a.performance);
    const pairings: Array<{ team1: string; team2: string; tableNumber: number }> = [];
    
    // Top half vs bottom half in round 1
    // Adjusted pairings in round 2 based on results
    const midpoint = Math.floor(sortedTeams.length / 2);
    
    for (let i = 0; i < midpoint; i++) {
      if (sortedTeams[i] && sortedTeams[i + midpoint]) {
        pairings.push({
          team1: sortedTeams[i].team,
          team2: sortedTeams[i + midpoint].team,
          tableNumber: i + 1
        });
      }
    }
    
    return pairings;
  }

  /**
   * Calculate comprehensive Swiss standings with all tiebreakers
   */
  static calculateSwissStandings(
    swissRounds: SwissRound[],
    teams: string[]
  ): SwissTeamRecord[] {
    const standings: SwissTeamRecord[] = teams.map(team => ({
      team,
      tournamentPoints: 0,
      gamePoints: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      opponentPoints: 0,
      strengthOfSchedule: 0,
      performance: 1000, // Default performance rating
      colorBalance: { white: 0, black: 0 },
      averageOpponentRating: 0,
      matchHistory: []
    }));
    
    // Process each completed round
    swissRounds.forEach((round, roundIndex) => {
      if (round.isComplete) {
        round.pairings.forEach(pairing => {
          const team1Standing = standings.find(s => s.team === pairing.team1);
          const team2Standing = standings.find(s => s.team === pairing.team2);
          
          if (team1Standing && team2Standing && pairing.result) {
            // Update basic statistics
            if (pairing.result === 'team1-wins') {
              team1Standing.wins++;
              team2Standing.losses++;
              team1Standing.tournamentPoints += 1;
            } else if (pairing.result === 'team2-wins') {
              team2Standing.wins++;
              team1Standing.losses++;
              team2Standing.tournamentPoints += 1;
            } else if (pairing.result === 'draw') {
              // Draw
              team1Standing.draws++;
              team2Standing.draws++;
              team1Standing.tournamentPoints += 0.5;
              team2Standing.tournamentPoints += 0.5;
            }
            
            // Update game points
            team1Standing.gamePoints += pairing.actualScore1 || 0;
            team2Standing.gamePoints += pairing.actualScore2 || 0;
            
            // Update match history
            team1Standing.matchHistory.push({
              round: roundIndex + 1,
              opponent: pairing.team2,
              result: pairing.result === 'team1-wins' ? 'win' :
                      pairing.result === 'team2-wins' ? 'loss' : 'draw',
              gamePoints: pairing.actualScore1 || 0,
              opponentPoints: pairing.actualScore2 || 0,
            });
            
            team2Standing.matchHistory.push({
              round: roundIndex + 1,
              opponent: pairing.team1,
              result: pairing.result === 'team2-wins' ? 'win' :
                      pairing.result === 'team1-wins' ? 'loss' : 'draw',
              gamePoints: pairing.actualScore2 || 0,
              opponentPoints: pairing.actualScore1 || 0,
            });
          }
        });
      }
    });
    
    // Calculate tiebreaker values
    standings.forEach(standing => {
      // Buchholz score (sum of opponent tournament points)
      standing.opponentPoints = standing.matchHistory.reduce((sum, match) => {
        const opponent = standings.find(s => s.team === match.opponent);
        return sum + (opponent?.tournamentPoints || 0);
      }, 0);
      
      // Strength of schedule (average opponent win percentage)
      const opponentRecords = standing.matchHistory.map(match => {
        const opponent = standings.find(s => s.team === match.opponent);
        if (!opponent) return 0;
        const totalGames = opponent.wins + opponent.losses + opponent.draws;
        return totalGames > 0 ? opponent.wins / totalGames : 0;
      });
      
      standing.strengthOfSchedule = opponentRecords.length > 0 ? 
        opponentRecords.reduce((sum, wr) => sum + wr, 0) / opponentRecords.length : 0;
      
      // Performance calculation based on opponents faced and results
      standing.performance = this.calculatePerformanceRating(standing, standings);
    });
    
    return this.sortTeamsBySwissStandings(standings);
  }

  /**
   * Execute Swiss to elimination bracket transition
   */
  static executeSwissToElimination(
    swissRounds: SwissRound[],
    advancementCriteria: SwissAdvancementCriteria,
    teams: string[]
  ): StageResults {
    
    const finalStandings = this.calculateSwissStandings(swissRounds, teams);
    
    // Apply advancement criteria
    let qualifiedTeams = finalStandings.filter(team => {
      const meetsPointThreshold = !advancementCriteria.pointsThreshold || 
        team.tournamentPoints >= advancementCriteria.pointsThreshold;
        
      const totalGames = team.wins + team.losses + team.draws;
      const winPercentage = totalGames > 0 ? team.wins / totalGames * 100 : 0;
      const meetsWinPercentage = !advancementCriteria.minimumWinPercentage || 
        winPercentage >= advancementCriteria.minimumWinPercentage;
        
      const meetsPerformance = !advancementCriteria.performanceThreshold ||
        team.performance >= advancementCriteria.performanceThreshold;
        
      return meetsPointThreshold && meetsWinPercentage && meetsPerformance;
    });
    
    // Take top N teams if more qualified than slots available
    qualifiedTeams = qualifiedTeams.slice(0, advancementCriteria.totalTeamsAdvancing);
    
    // Ensure guaranteed slots
    if (advancementCriteria.guaranteedSlots) {
      const guaranteedAdvancers = finalStandings.slice(0, advancementCriteria.guaranteedSlots);
      guaranteedAdvancers.forEach(team => {
        if (!qualifiedTeams.find(qt => qt.team === team.team)) {
          qualifiedTeams.push(team);
        }
      });
    }
    
    // Create stage results
    const stageResults: StageResults = {
      stageNumber: 1, // Swiss stage
      stageName: "Swiss Rounds",
      stageType: "swiss-system",
      results: finalStandings.map((team, index) => ({
        team: team.team,
        teamId: team.teamId,
        finalPlacement: index + 1,
        record: {
          wins: team.wins,
          losses: team.losses,
          draws: team.draws,
          totalMatches: team.wins + team.losses + team.draws,
          winPercentage: team.wins + team.losses + team.draws > 0 ? 
            team.wins / (team.wins + team.losses + team.draws) * 100 : 0,
        },
        scoring: {
          tournamentPoints: team.tournamentPoints,
          gamePointsFor: team.gamePoints,
          gamePointsAgainst: 0, // Calculate if needed
          pointDifferential: team.gamePoints,
          averageScore: team.matchHistory.length > 0 ? 
            team.gamePoints / team.matchHistory.length : 0,
        },
        strengthOfSchedule: team.strengthOfSchedule,
        qualified: qualifiedTeams.find(qt => qt.team === team.team) !== undefined,
        advancementMethod: index < (advancementCriteria.guaranteedSlots || 0) ? 
          "automatic" : "points-threshold",
        seedForNextStage: qualifiedTeams.findIndex(qt => qt.team === team.team) + 1 || undefined,
        nextStageBracketPosition: qualifiedTeams.findIndex(qt => qt.team === team.team) + 1 || undefined,
        qualityWins: team.matchHistory.filter(match => match.result === 'win').length,
        keyResults: team.matchHistory
          .filter(match => match.result === 'win' || match.gamePoints > 0)
          .map(match => `${match.result.toUpperCase()} vs ${match.opponent} (${match.gamePoints}-${match.opponentPoints})`),
      })),
      advancementSummary: {
        totalTeamsAdvancing: qualifiedTeams.length,
        advancementByMethod: {
          "qualified": qualifiedTeams.filter((_, i) => i >= (advancementCriteria.guaranteedSlots || 0)).length,
          "guaranteed": Math.min(qualifiedTeams.length, advancementCriteria.guaranteedSlots || 0),
        },
        tiebreadersRequired: advancementCriteria.tiebreakers.length > 0,
        controversialAdvancement: false,
      },
      advancingTeams: qualifiedTeams.map(t => t.team),
      eliminatedTeams: finalStandings.filter(t => !qualifiedTeams.find(qt => qt.team === t.team)).map(t => t.team),
      nextStageSeeding: qualifiedTeams.map((team, index) => ({
        team: team.team,
        seed: index + 1,
        bracketPosition: index + 1,
        seedingJustification: `Swiss Result: ${team.tournamentPoints} pts, ${team.wins}-${team.losses}-${team.draws}`,
      })),
      completedAt: new Date().toISOString(),
      nextStageReady: true,
    };
    
    return stageResults;
  }

  // Helper methods
  private static sortTeamsBySwissStandings(teams: SwissTeamRecord[]): SwissTeamRecord[] {
    return teams.sort((a, b) => {
      // Primary: Tournament points
      if (b.tournamentPoints !== a.tournamentPoints) {
        return b.tournamentPoints - a.tournamentPoints;
      }
      
      // Tiebreaker 1: Buchholz (opponent points)
      if (b.opponentPoints !== a.opponentPoints) {
        return b.opponentPoints - a.opponentPoints;
      }
      
      // Tiebreaker 2: Game points scored
      if (b.gamePoints !== a.gamePoints) {
        return b.gamePoints - a.gamePoints;
      }
      
      // Tiebreaker 3: Strength of schedule
      return b.strengthOfSchedule - a.strengthOfSchedule;
    });
  }
  
  private static groupTeamsByPoints(teams: SwissTeamRecord[]): Map<number, SwissTeamRecord[]> {
    const groups = new Map<number, SwissTeamRecord[]>();
    
    teams.forEach(team => {
      const points = team.tournamentPoints;
      if (!groups.has(points)) {
        groups.set(points, []);
      }
      groups.get(points)!.push(team);
    });
    
    return groups;
  }
  
  private static hasPlayedBefore(team1: SwissTeamRecord, team2: SwissTeamRecord): boolean {
    return team1.matchHistory.some(match => match.opponent === team2.team);
  }
  
  private static findFloatingOpponent(
    team: SwissTeamRecord,
    allTeams: SwissTeamRecord[],
    paired: Set<string>,
    options: SwissPairingOptions
  ): SwissTeamRecord | null {
    // Find closest unpaired opponent from different point group
    for (const candidate of allTeams) {
      if (!paired.has(candidate.team) && 
          candidate.team !== team.team &&
          (!options.avoidRematches || !this.hasPlayedBefore(team, candidate))) {
        return candidate;
      }
    }
    return null;
  }
  
  private static calculatePerformanceRating(
    team: SwissTeamRecord,
    allStandings: SwissTeamRecord[]
  ): number {
    // Simplified performance calculation
    // In practice, this would be more complex based on opponent ratings and results
    const baseRating = 1000;
    const pointsBonus = team.tournamentPoints * 100;
    const strengthBonus = team.strengthOfSchedule * 200;
    
    return baseRating + pointsBonus + strengthBonus;
  }
}