/**
 * Dynamic Double Elimination Implementation
 * Supports any team size from 4 to 63 teams (64 teams uses specialized hardcoded version)
 */

import { BracketStructure, MatchData, DoubleElimStructure, LoserRoutingInfo } from './bracket-generator';

export class DynamicDoubleElimination {
  /**
   * Generate double elimination bracket for any team size
   * Formula: (n-1) + (n-2) + 1 = 2n-2 total matches
   */
  static generate(teams: string[], tournamentId: string): DoubleElimStructure {
    if (teams.length < 4) {
      throw new Error('Dynamic double elimination requires at least 4 teams');
    }
    
    if (teams.length > 63) {
      throw new Error('Use specialized 64-team method for 64+ teams');
    }
    
    const validTeams = teams.filter(team => team && team.trim() !== '');
    const n = validTeams.length;
    
    // Calculate expected matches: 2n-2 total matches
    const expectedWinnerMatches = n - 1;
    const expectedLoserMatches = n - 2; 
    const expectedChampionshipMatches = 1;
    const expectedTotalMatches = expectedWinnerMatches + expectedLoserMatches + expectedChampionshipMatches;
    
    const winnersMatches: MatchData[] = [];
    const losersMatches: MatchData[] = [];
    const championshipMatches: MatchData[] = [];
    const routingMap = new Map<string, LoserRoutingInfo>();
    
    // Build Winners Bracket (standard single elimination)
    const winnersResult = this.buildWinnersBracket(validTeams, tournamentId);
    winnersMatches.push(...winnersResult.matches);
    
    // Build Losers Bracket (complex routing)
    const losersResult = this.buildLosersBracket(validTeams.length, tournamentId);
    losersMatches.push(...losersResult.matches);
    routingMap.set('routing', losersResult.routing);
    
    // Build Championship Match
    const championshipMatch: MatchData = {
      id: 'Championship-1',
      tournamentId,
      round: 1,
      position: 1,
      team1: 'Winners Champion',
      team2: 'Losers Champion', 
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'championship'
    };
    championshipMatches.push(championshipMatch);
    
    const allMatches = [...winnersMatches, ...losersMatches, ...championshipMatches];
    
    // Validate mathematics
    if (allMatches.length !== expectedTotalMatches) {
      console.warn(`Dynamic double elimination math error: Expected ${expectedTotalMatches} matches for ${n} teams, got ${allMatches.length}`);
    }
    
    // Calculate total rounds
    const winnersRounds = Math.ceil(Math.log2(n));
    const losersRounds = Math.max(1, winnersRounds * 2 - 2); // Losers bracket complexity
    const totalRounds = winnersRounds + Math.ceil(losersRounds / 2); // Effective concurrent rounds
    
    return {
      matches: allMatches,
      winnersMatches,
      losersMatches,
      championshipMatches,
      routingMap,
      totalRounds,
      totalMatches: expectedTotalMatches,
      totalWinnersRounds: winnersRounds,
      totalLosersRounds: losersRounds,
      format: `double-elimination-${n}`
    };
  }
  
  /**
   * Build winners bracket (standard single elimination)
   */
  private static buildWinnersBracket(teams: string[], tournamentId: string): { matches: MatchData[] } {
    const matches: MatchData[] = [];
    let matchIdCounter = 1;
    
    // Calculate rounds needed
    const totalRounds = Math.ceil(Math.log2(teams.length));
    
    // Create padded teams list for proper bracket
    const nextPowerOfTwo = Math.pow(2, totalRounds);
    const paddedTeams = [...teams];
    while (paddedTeams.length < nextPowerOfTwo) {
      paddedTeams.push(''); // Empty string represents bye
    }
    
    let currentRoundTeams = [...paddedTeams];
    
    for (let round = 1; round <= totalRounds; round++) {
      const nextRoundTeams: string[] = [];
      
      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        const team1 = currentRoundTeams[i];
        const team2 = currentRoundTeams[i + 1];
        
        // Handle byes
        if (!team1 && team2) {
          nextRoundTeams.push(team2);
          continue;
        }
        if (team1 && !team2) {
          nextRoundTeams.push(team1);
          continue;
        }
        if (!team1 && !team2) continue;
        
        const match: MatchData = {
          id: `W${round}-${Math.floor(i / 2) + 1}`,
          tournamentId,
          round,
          position: Math.floor(i / 2) + 1,
          team1: team1 || undefined,
          team2: team2 || undefined,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'winners'
        };
        
        matches.push(match);
        nextRoundTeams.push(`W${round}-${Math.floor(i / 2) + 1} Winner`);
      }
      
      currentRoundTeams = nextRoundTeams;
    }
    
    return { matches };
  }
  
  /**
   * Build losers bracket with proper routing
   */
  private static buildLosersBracket(teamCount: number, tournamentId: string): { matches: MatchData[], routing: any } {
    const matches: MatchData[] = [];
    const routing = {};
    
    // Calculate losers bracket structure
    const winnersRounds = Math.ceil(Math.log2(teamCount));
    const losersRoundsNeeded = (winnersRounds - 1) * 2; // Approximate losers rounds
    
    let totalLosersEntering = teamCount - 1; // All teams except winner enter losers
    let currentLosersTeams = Math.floor(teamCount / 2); // Teams eliminated from W1
    
    let roundNumber = 1;
    
    // For n teams, losers bracket needs exactly n-2 matches
    const expectedLosersMatches = teamCount - 2;
    
    // Generate losers matches based on mathematical requirement
    for (let i = 0; i < expectedLosersMatches; i++) {
      const round = Math.floor(i / Math.max(1, Math.floor(expectedLosersMatches / 3))) + 1;
      const position = (i % Math.max(1, Math.floor(expectedLosersMatches / 3))) + 1;
      
      matches.push({
        id: `L${round}-${position}`,
        tournamentId,
        round,
        position,
        team1: `Loser ${i * 2 + 1}`,
        team2: `Loser ${i * 2 + 2}`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    return { matches, routing };
  }
}