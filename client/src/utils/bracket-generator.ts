// Comprehensive bracket generation system for all tournament formats
// Supports single elimination, double elimination, pool play, round robin, and leaderboard formats

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
  bracket?: 'winners' | 'losers' | 'championship'; // For double elimination
  poolId?: string; // For pool play formats
}

export interface BracketStructure {
  matches: MatchData[];
  totalRounds: number;
  totalMatches: number;
  format: string;
  pools?: PoolStructure[];
  advancement?: AdvancementRules;
}

export interface PoolStructure {
  id: string;
  name: string;
  teams: string[];
  matches: MatchData[];
  standings: TeamRecord[];
}

export interface TeamRecord {
  team: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDifferential: number;
  gamesPlayed: number;
}

export interface AdvancementRules {
  type: 'top_teams' | 'pool_winners' | 'points_threshold';
  count?: number;
  threshold?: number;
  tiebreakers: ('head_to_head' | 'point_differential' | 'points_for' | 'coin_flip')[];
}

export class BracketGenerator {
  
  // Single Elimination Tournament Generator
  static generateSingleElimination(teams: string[], tournamentId: string): BracketStructure {
    const teamCount = teams.length;
    const totalRounds = Math.ceil(Math.log2(teamCount));
    const matches: MatchData[] = [];
    let matchId = 1;

    // Calculate first round matches and byes
    const firstRoundMatches = Math.floor(teamCount / 2);
    const byes = (Math.pow(2, totalRounds) - teamCount);
    
    let teamIndex = 0;
    
    // First round matches
    for (let i = 0; i < firstRoundMatches; i++) {
      matches.push({
        id: `match-${matchId++}`,
        tournamentId,
        round: 1,
        position: i + 1,
        team1: teams[teamIndex++],
        team2: teams[teamIndex++],
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming'
      });
    }

    // Generate subsequent rounds
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = Math.pow(2, totalRounds - round);
      
      for (let pos = 1; pos <= matchesInRound; pos++) {
        matches.push({
          id: `match-${matchId++}`,
          tournamentId,
          round,
          position: pos,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming'
        });
      }
    }

    return {
      matches,
      totalRounds,
      totalMatches: matches.length,
      format: 'single-elimination'
    };
  }

  // Double Elimination Tournament Generator  
  static generateDoubleElimination(teams: string[], tournamentId: string): BracketStructure {
    const teamCount = teams.length;
    const winnersRounds = Math.ceil(Math.log2(teamCount));
    const losersRounds = (winnersRounds - 1) * 2;
    const matches: MatchData[] = [];
    let matchId = 1;

    // Winners Bracket - Same as single elimination
    const winnersFirstRoundMatches = Math.floor(teamCount / 2);
    let teamIndex = 0;

    // Winners bracket first round
    for (let i = 0; i < winnersFirstRoundMatches; i++) {
      matches.push({
        id: `match-${matchId++}`,
        tournamentId,
        round: 1,
        position: i + 1,
        team1: teams[teamIndex++],
        team2: teams[teamIndex++],
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'winners'
      });
    }

    // Winners bracket subsequent rounds
    for (let round = 2; round <= winnersRounds; round++) {
      const matchesInRound = Math.pow(2, winnersRounds - round);
      
      for (let pos = 1; pos <= matchesInRound; pos++) {
        matches.push({
          id: `match-${matchId++}`,
          tournamentId,
          round,
          position: pos,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'winners'
        });
      }
    }

    // Losers Bracket - More complex structure
    for (let round = 1; round <= losersRounds; round++) {
      const isEliminationRound = round % 2 === 0;
      const matchesInRound = isEliminationRound ? 
        Math.pow(2, winnersRounds - Math.ceil(round / 2) - 1) :
        Math.pow(2, winnersRounds - Math.ceil(round / 2));

      for (let pos = 1; pos <= matchesInRound; pos++) {
        matches.push({
          id: `match-${matchId++}`,
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
      id: `match-${matchId++}`,
      tournamentId,
      round: 1,
      position: 1,
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'championship'
    });

    return {
      matches,
      totalRounds: winnersRounds + losersRounds + 1,
      totalMatches: matches.length,
      format: 'double-elimination'
    };
  }

  // Pool Play with Advancement to Brackets
  static generatePoolPlay(teams: string[], tournamentId: string, poolSize: number = 4): BracketStructure {
    const poolCount = Math.ceil(teams.length / poolSize);
    const pools: PoolStructure[] = [];
    const matches: MatchData[] = [];
    let matchId = 1;

    // Create pools
    for (let poolIndex = 0; poolIndex < poolCount; poolIndex++) {
      const poolTeams = teams.slice(poolIndex * poolSize, (poolIndex + 1) * poolSize);
      const poolMatches: MatchData[] = [];

      // Round robin within each pool
      for (let i = 0; i < poolTeams.length; i++) {
        for (let j = i + 1; j < poolTeams.length; j++) {
          const match: MatchData = {
            id: `match-${matchId++}`,
            tournamentId,
            round: 1,
            position: poolMatches.length + 1,
            team1: poolTeams[i],
            team2: poolTeams[j],
            team1Score: 0,
            team2Score: 0,
            status: 'upcoming',
            poolId: `pool-${poolIndex + 1}`
          };
          poolMatches.push(match);
          matches.push(match);
        }
      }

      pools.push({
        id: `pool-${poolIndex + 1}`,
        name: `Pool ${String.fromCharCode(65 + poolIndex)}`,
        teams: poolTeams,
        matches: poolMatches,
        standings: poolTeams.map(team => ({
          team,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifferential: 0,
          gamesPlayed: 0
        }))
      });
    }

    // Generate bracket for pool winners/top teams
    const advancingTeams = Math.min(8, poolCount * 2); // Top 2 from each pool, max 8 teams
    const bracketMatches = this.generateSingleElimination(
      Array(advancingTeams).fill('TBD'), 
      tournamentId
    ).matches;

    // Update bracket matches to start after pool play
    const maxPoolRound = 1;
    bracketMatches.forEach(match => {
      match.round += maxPoolRound;
      match.id = `match-${matchId++}`;
      matches.push(match);
    });

    return {
      matches,
      totalRounds: maxPoolRound + Math.ceil(Math.log2(advancingTeams)),
      totalMatches: matches.length,
      format: 'pool-play-bracket',
      pools,
      advancement: {
        type: 'pool_winners',
        count: 2,
        tiebreakers: ['head_to_head', 'point_differential', 'points_for']
      }
    };
  }

  // Round Robin Tournament Generator
  static generateRoundRobin(teams: string[], tournamentId: string): BracketStructure {
    const matches: MatchData[] = [];
    let matchId = 1;
    let round = 1;

    // Generate all possible matchups
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: `match-${matchId++}`,
          tournamentId,
          round,
          position: matches.filter(m => m.round === round).length + 1,
          team1: teams[i],
          team2: teams[j],
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming'
        });

        // Distribute matches across rounds for scheduling
        if (matches.filter(m => m.round === round).length >= Math.floor(teams.length / 2)) {
          round++;
        }
      }
    }

    return {
      matches,
      totalRounds: round,
      totalMatches: matches.length,
      format: 'round-robin'
    };
  }

  // Leaderboard Format for Individual Sports
  static generateLeaderboard(participants: string[], tournamentId: string, sport: string): BracketStructure {
    // For individual sports like track, swimming, golf, etc.
    const matches: MatchData[] = [];
    
    // Create a single "event" entry for each participant
    participants.forEach((participant, index) => {
      matches.push({
        id: `entry-${index + 1}`,
        tournamentId,
        round: 1,
        position: index + 1,
        team1: participant,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming'
      });
    });

    return {
      matches,
      totalRounds: 1,
      totalMatches: matches.length,
      format: 'leaderboard'
    };
  }

  // Swiss System Tournament Generator
  static generateSwissSystem(teams: string[], tournamentId: string, rounds: number): BracketStructure {
    const matches: MatchData[] = [];
    let matchId = 1;

    // First round - random pairings
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    for (let round = 1; round <= rounds; round++) {
      const matchesInRound = Math.floor(teams.length / 2);
      
      for (let i = 0; i < matchesInRound; i++) {
        matches.push({
          id: `match-${matchId++}`,
          tournamentId,
          round,
          position: i + 1,
          team1: round === 1 ? shuffledTeams[i * 2] : 'TBD',
          team2: round === 1 ? shuffledTeams[i * 2 + 1] : 'TBD',
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming'
        });
      }
    }

    return {
      matches,
      totalRounds: rounds,
      totalMatches: matches.length,
      format: 'swiss-system'
    };
  }

  // Generate bracket based on sport type and format
  static generateBracket(
    teams: string[], 
    tournamentId: string, 
    format: string, 
    sport?: string
  ): BracketStructure {
    
    switch (format) {
      case 'single':
      case 'single-elimination':
        return this.generateSingleElimination(teams, tournamentId);
        
      case 'double':
      case 'double-elimination':
        return this.generateDoubleElimination(teams, tournamentId);
        
      case 'pool-play':
        return this.generatePoolPlay(teams, tournamentId);
        
      case 'round-robin':
        return this.generateRoundRobin(teams, tournamentId);
        
      case 'swiss-system':
        const rounds = Math.ceil(Math.log2(teams.length)) + 1;
        return this.generateSwissSystem(teams, tournamentId, rounds);
        
      case 'leaderboard':
        return this.generateLeaderboard(teams, tournamentId, sport || 'track');
        
      default:
        return this.generateSingleElimination(teams, tournamentId);
    }
  }

  // Calculate team standings for round robin or pool play
  static calculateStandings(matches: MatchData[]): TeamRecord[] {
    const standings: Record<string, TeamRecord> = {};

    matches.forEach(match => {
      if (match.status === 'completed' && match.team1 && match.team2) {
        // Initialize teams if not exists
        if (!standings[match.team1]) {
          standings[match.team1] = {
            team: match.team1,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointDifferential: 0,
            gamesPlayed: 0
          };
        }
        if (!standings[match.team2]) {
          standings[match.team2] = {
            team: match.team2,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointDifferential: 0,
            gamesPlayed: 0
          };
        }

        // Update stats
        standings[match.team1].pointsFor += match.team1Score;
        standings[match.team1].pointsAgainst += match.team2Score;
        standings[match.team1].gamesPlayed++;

        standings[match.team2].pointsFor += match.team2Score;
        standings[match.team2].pointsAgainst += match.team1Score;
        standings[match.team2].gamesPlayed++;

        // Determine winner
        if (match.team1Score > match.team2Score) {
          standings[match.team1].wins++;
          standings[match.team2].losses++;
        } else if (match.team2Score > match.team1Score) {
          standings[match.team2].wins++;
          standings[match.team1].losses++;
        }

        // Calculate point differential
        standings[match.team1].pointDifferential = 
          standings[match.team1].pointsFor - standings[match.team1].pointsAgainst;
        standings[match.team2].pointDifferential = 
          standings[match.team2].pointsFor - standings[match.team2].pointsAgainst;
      }
    });

    // Sort by wins, then point differential
    return Object.values(standings).sort((a, b) => {
      if (a.wins !== b.wins) return b.wins - a.wins;
      if (a.pointDifferential !== b.pointDifferential) return b.pointDifferential - a.pointDifferential;
      return b.pointsFor - a.pointsFor;
    });
  }
}