// Server-side bracket generation for tournament creation
export interface MatchData {
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
  bracket: 'winners' | 'losers' | 'championship';
}

export interface LoserRoutingInfo {
  losersRound: number;
  losersMatch: number;
  side: 'left' | 'right';
}

export interface DoubleElimStructure extends BracketStructure {
  winnersMatches: MatchData[];
  losersMatches: MatchData[];
  championshipMatches: MatchData[];
  routingMap: Map<string, LoserRoutingInfo>;
  totalWinnersRounds: number;
  totalLosersRounds: number;
}

export interface BracketStructure {
  matches: MatchData[];
  totalRounds: number;
  totalMatches: number;
  format: string;
}

export class BracketGenerator {
  
  /**
   * Route a team that lost from the winners bracket to the correct position in the losers bracket
   * @param winnerRound - The round in winners bracket where team lost (1-6 for 64-team)
   * @param matchIndex - The position within that winners round (0-based)
   * @returns LoserRoutingInfo - Where the loser should be placed in losers bracket
   */
  static routeLoser(winnerRound: number, matchIndex: number): LoserRoutingInfo {
    // 64-team double elimination losers bracket routing mathematics
    switch (winnerRound) {
      case 1: // W1 losers (32 teams) → L1 (16 matches)
        return {
          losersRound: 1,
          losersMatch: Math.floor(matchIndex / 2),
          side: matchIndex % 2 === 0 ? 'left' : 'right'
        };
        
      case 2: // W2 losers (16 teams) → L2, then advance internally to L3
        return {
          losersRound: 2,
          losersMatch: matchIndex,
          side: 'right' // W2 losers enter on right side to meet L1 winners
        };
        
      case 3: // W3 losers (8 teams) → L4, then advance internally to L5  
        return {
          losersRound: 4,
          losersMatch: matchIndex,
          side: 'right' // W3 losers enter on right side to meet L3 winners
        };
        
      case 4: // W4 losers (4 teams) → L6, then advance internally to L7
        return {
          losersRound: 6,
          losersMatch: matchIndex,
          side: 'right' // W4 losers enter on right side to meet L5 winners
        };
        
      case 5: // W5 losers (2 teams) → L8, then advance internally to L9
        return {
          losersRound: 8,
          losersMatch: matchIndex,
          side: 'right' // W5 losers enter on right side to meet L7 winners
        };
        
      case 6: // W6 loser (1 team) → L10, then advance internally to L11 (losers final)
        return {
          losersRound: 10,
          losersMatch: 0,
          side: 'right' // W6 loser enters on right side to meet L9 winner
        };
        
      default:
        throw new Error(`Invalid winner round: ${winnerRound}. Must be 1-6 for 64-team bracket.`);
    }
  }

  /**
   * Build a complete 64-team double elimination bracket with proper losers routing
   */
  static buildDoubleElim64(teams: string[], tournamentId: string): DoubleElimStructure {
    if (teams.length !== 64) {
      throw new Error(`Expected exactly 64 teams, got ${teams.length}`);
    }

    const winnersMatches: MatchData[] = [];
    const losersMatches: MatchData[] = [];
    const championshipMatches: MatchData[] = [];
    const routingMap = new Map<string, LoserRoutingInfo>();
    
    let matchIdCounter = 1;
    
    // Build Winners Bracket (6 rounds: 64→32→16→8→4→2→1)
    const winnersRounds = 6;
    let currentTeams = [...teams];
    
    for (let round = 1; round <= winnersRounds; round++) {
      const matchesInRound = currentTeams.length / 2;
      const nextRoundTeams: string[] = [];
      
      for (let position = 0; position < matchesInRound; position++) {
        const team1 = currentTeams[position * 2];
        const team2 = currentTeams[position * 2 + 1];
        
        const match: MatchData = {
          id: `W${round}-${position + 1}`,
          tournamentId,
          round,
          position: position + 1,
          team1: team1 || undefined,
          team2: team2 || undefined,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'winners'
        };
        
        winnersMatches.push(match);
        
        // Store routing info for losers
        const routingInfo = this.routeLoser(round, position);
        routingMap.set(`W${round}-${position}`, routingInfo);
        
        // Placeholder for winner (will be filled during actual tournament)
        nextRoundTeams.push('TBD');
      }
      
      currentTeams = nextRoundTeams;
    }
    
    // Build Losers Bracket (11 rounds with specific routing)
    this.buildLosersBracket(losersMatches, tournamentId, matchIdCounter);
    
    // Build Championship Bracket
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
    
    // Optional championship reset match if losers bracket winner wins first championship
    const resetMatch: MatchData = {
      id: 'Championship-Reset',
      tournamentId,
      round: 2,
      position: 1,
      team1: 'Reset TBD',
      team2: 'Reset TBD',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'championship'
    };
    championshipMatches.push(resetMatch);
    
    const allMatches = [...winnersMatches, ...losersMatches, ...championshipMatches];
    
    return {
      matches: allMatches,
      winnersMatches,
      losersMatches,
      championshipMatches,
      routingMap,
      totalRounds: Math.max(winnersRounds, 11, 2), // Max of all bracket rounds
      totalMatches: allMatches.length,
      totalWinnersRounds: winnersRounds,
      totalLosersRounds: 11,
      format: 'double-elimination-64'
    };
  }

  /**
   * Build the complete losers bracket structure for 64-team double elimination
   */
  private static buildLosersBracket(losersMatches: MatchData[], tournamentId: string, startId: number): void {
    let matchIdCounter = startId;
    
    // L1: 16 matches (32 teams from W1 losers)
    for (let i = 0; i < 16; i++) {
      losersMatches.push({
        id: `L1-${i + 1}`,
        tournamentId,
        round: 1,
        position: i + 1,
        team1: 'W1 Loser A',
        team2: 'W1 Loser B',
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // L2: 8 matches (16 W2 losers vs 16 L1 winners)
    for (let i = 0; i < 8; i++) {
      losersMatches.push({
        id: `L2-${i + 1}`,
        tournamentId,
        round: 2,
        position: i + 1,
        team1: `L1-${(i * 2) + 1} Winner`,
        team2: `W2-${i + 1} Loser`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // L3: 8 matches (8 L2 winners play each other)
    for (let i = 0; i < 4; i++) {
      losersMatches.push({
        id: `L3-${i + 1}`,
        tournamentId,
        round: 3,
        position: i + 1,
        team1: `L2-${(i * 2) + 1} Winner`,
        team2: `L2-${(i * 2) + 2} Winner`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // L4: 4 matches (4 W3 losers vs 4 L3 winners)
    for (let i = 0; i < 4; i++) {
      losersMatches.push({
        id: `L4-${i + 1}`,
        tournamentId,
        round: 4,
        position: i + 1,
        team1: `L3-${i + 1} Winner`,
        team2: `W3-${i + 1} Loser`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // L5: 2 matches (4 L4 winners play each other)
    for (let i = 0; i < 2; i++) {
      losersMatches.push({
        id: `L5-${i + 1}`,
        tournamentId,
        round: 5,
        position: i + 1,
        team1: `L4-${(i * 2) + 1} Winner`,
        team2: `L4-${(i * 2) + 2} Winner`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // L6: 2 matches (2 W4 losers vs 2 L5 winners)
    for (let i = 0; i < 2; i++) {
      losersMatches.push({
        id: `L6-${i + 1}`,
        tournamentId,
        round: 6,
        position: i + 1,
        team1: `L5-${i + 1} Winner`,
        team2: `W4-${i + 1} Loser`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // L7: 1 match (2 L6 winners play each other)
    losersMatches.push({
      id: 'L7-1',
      tournamentId,
      round: 7,
      position: 1,
      team1: 'L6-1 Winner',
      team2: 'L6-2 Winner',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'losers'
    });
    
    // L8: 1 match (W5 loser vs L7 winner)
    losersMatches.push({
      id: 'L8-1',
      tournamentId,
      round: 8,
      position: 1,
      team1: 'L7-1 Winner',
      team2: 'W5-1 Loser',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'losers'
    });
    
    // L9: 1 match (L8 winner advances)
    losersMatches.push({
      id: 'L9-1',
      tournamentId,
      round: 9,
      position: 1,
      team1: 'L8-1 Winner',
      team2: 'W5-2 Loser',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'losers'
    });
    
    // L10: 1 match (L9 winner vs W6 loser)
    losersMatches.push({
      id: 'L10-1',
      tournamentId,
      round: 10,
      position: 1,
      team1: 'L9-1 Winner',
      team2: 'W6-1 Loser',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'losers'
    });
    
    // L11: 1 match (Losers Final)
    losersMatches.push({
      id: 'L11-1',
      tournamentId,
      round: 11,
      position: 1,
      team1: 'L10-1 Winner',
      team2: 'TBD',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'losers'
    });
  }
  
  // Single Elimination Tournament Generator
  static generateSingleElimination(teams: string[], tournamentId: string): BracketStructure {
    if (teams.length < 2) {
      return {
        matches: [],
        totalRounds: 0,
        totalMatches: 0,
        format: 'single-elimination'
      };
    }

    const matches: MatchData[] = [];
    let matchIdCounter = 1;
    
    // Calculate rounds needed
    const totalRounds = Math.ceil(Math.log2(teams.length));
    
    // Create a list that includes byes if needed
    const nextPowerOfTwo = Math.pow(2, totalRounds);
    const paddedTeams = [...teams];
    
    // Add byes for first round if needed
    while (paddedTeams.length < nextPowerOfTwo) {
      paddedTeams.push(''); // Empty string represents a bye
    }
    
    // Generate Round 1 matches
    let currentRoundTeams = [...paddedTeams];
    
    for (let round = 1; round <= totalRounds; round++) {
      const roundMatches: MatchData[] = [];
      const nextRoundTeams: string[] = [];
      
      // Create matches for this round
      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        const team1 = currentRoundTeams[i];
        const team2 = currentRoundTeams[i + 1];
        
        // Skip if both teams are byes
        if (!team1 && !team2) continue;
        
        // Handle byes - team advances automatically
        if (!team1 && team2) {
          nextRoundTeams.push(team2);
          continue;
        }
        if (team1 && !team2) {
          nextRoundTeams.push(team1);
          continue;
        }
        
        const match: MatchData = {
          id: `match-${matchIdCounter++}`,
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
        
        roundMatches.push(match);
        // Winner TBD - will be determined when match is played
        nextRoundTeams.push(''); // Placeholder for winner
      }
      
      matches.push(...roundMatches);
      currentRoundTeams = nextRoundTeams;
    }
    
    return {
      matches,
      totalRounds,
      totalMatches: matches.length,
      format: 'single-elimination'
    };
  }

  // Main bracket generation method
  static generateBracket(
    teams: string[], 
    tournamentId: string, 
    tournamentType: string = 'single', 
    sport: string = 'Basketball'
  ): BracketStructure | DoubleElimStructure {
    
    // Filter out empty team names
    const validTeams = teams.filter(team => team && team.trim() !== '');
    
    switch (tournamentType) {
      case 'double':
        if (validTeams.length === 64) {
          return this.buildDoubleElim64(validTeams, tournamentId);
        } else {
          throw new Error(`Double elimination currently only supports exactly 64 teams. Got ${validTeams.length} teams.`);
        }
      case 'single':
      default:
        return this.generateSingleElimination(validTeams, tournamentId);
    }
  }
}