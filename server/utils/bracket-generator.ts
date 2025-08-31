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
  bracket?: 'winners' | 'losers' | 'championship';
}

export interface BracketStructure {
  matches: MatchData[];
  totalRounds: number;
  totalMatches: number;
  format: string;
}

export class BracketGenerator {
  
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
          status: 'upcoming'
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
  ): BracketStructure {
    
    // Filter out empty team names
    const validTeams = teams.filter(team => team && team.trim() !== '');
    
    switch (tournamentType) {
      case 'single':
      default:
        return this.generateSingleElimination(validTeams, tournamentId);
    }
  }
}