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

// Smart registration participant data for seeding
export interface SmartParticipant {
  id: string;
  participantName: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  age: number;
  gender: string;
  assignedDivisionId?: string;
  assignedEventIds?: string[];
  seed?: number;
  assignmentResult?: {
    success: boolean;
    divisionAssignments?: Array<{
      divisionId: string;
      divisionName: string;
      seed: number;
    }>;
    eventAssignments?: Array<{
      eventId: string;
      eventName: string;
      seed: number;
    }>;
  };
}

export class BracketGenerator {
  
  // Enhanced Single Elimination with Smart Seeding
  static generateSingleEliminationWithSeeding(participants: SmartParticipant[], tournamentId: string, divisionId?: string): BracketStructure {
    // Sort participants by skill level and seed for optimal bracket placement
    const seededParticipants = this.seedParticipants(participants, divisionId);
    
    if (seededParticipants.length < 2) {
      throw new Error('Need at least 2 participants for bracket generation');
    }
    
    // Generate bracket with proper seeding placement
    return this.generateSeededSingleElimination(seededParticipants, tournamentId);
  }
  
  // Generate single elimination with proper tournament seeding placement
  static generateSeededSingleElimination(participants: SmartParticipant[], tournamentId: string): BracketStructure {
    const participantCount = participants.length;
    const totalRounds = Math.ceil(Math.log2(participantCount));
    const bracketSize = Math.pow(2, totalRounds); // Next power of 2
    const byes = bracketSize - participantCount;
    
    // Create bracket positions with proper seeding
    const bracketPositions = this.createSeededBracketPositions(participants, bracketSize);
    
    const matches: MatchData[] = [];
    let matchId = 1;
    
    // First round matches (handle byes)
    const firstRoundMatches = Math.floor(bracketSize / 2);
    
    for (let i = 0; i < firstRoundMatches; i++) {
      const position1 = i * 2;
      const position2 = i * 2 + 1;
      
      const participant1 = bracketPositions[position1];
      const participant2 = bracketPositions[position2];
      
      // Only create match if both positions have participants (no bye)
      if (participant1 && participant2) {
        matches.push({
          id: `match-${matchId++}`,
          tournamentId,
          round: 1,
          position: i + 1,
          team1: `${participant1.participantName} (Seed ${participant1.seed})`,
          team2: `${participant2.participantName} (Seed ${participant2.seed})`,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming'
        });
      } else {
        // Handle bye - advance the participant automatically
        const advancingParticipant = participant1 || participant2;
        if (advancingParticipant) {
          matches.push({
            id: `match-${matchId++}`,
            tournamentId,
            round: 1,
            position: i + 1,
            team1: `${advancingParticipant.participantName} (Seed ${advancingParticipant.seed})`,
            team2: 'BYE',
            team1Score: 0,
            team2Score: 0,
            winner: `${advancingParticipant.participantName} (Seed ${advancingParticipant.seed})`,
            status: 'completed'
          });
        }
      }
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
      format: 'single-elimination-seeded'
    };
  }
  
  // Create proper seeded bracket positions (1 vs N, 2 vs N-1, etc.)
  static createSeededBracketPositions(participants: SmartParticipant[], bracketSize: number): (SmartParticipant | null)[] {
    const positions: (SmartParticipant | null)[] = new Array(bracketSize).fill(null);
    
    // Standard tournament seeding pattern for single elimination
    const seedingOrder = this.generateSeedingOrder(bracketSize);
    
    // Place participants according to seeding order
    for (let i = 0; i < participants.length && i < seedingOrder.length; i++) {
      const position = seedingOrder[i] - 1; // Convert to 0-based index
      positions[position] = participants[i];
    }
    
    return positions;
  }
  
  // Generate standard tournament seeding order for bracket positions
  static generateSeedingOrder(bracketSize: number): number[] {
    if (bracketSize === 2) return [1, 2];
    if (bracketSize === 4) return [1, 4, 2, 3];
    if (bracketSize === 8) return [1, 8, 4, 5, 2, 7, 3, 6];
    if (bracketSize === 16) return [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11];
    if (bracketSize === 32) return [1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21, 2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22];
    
    // For other sizes, generate dynamically
    return this.generateDynamicSeedingOrder(bracketSize);
  }
  
  // Dynamic seeding order generation for any bracket size
  static generateDynamicSeedingOrder(size: number): number[] {
    if (size <= 1) return [1];
    if (size === 2) return [1, 2];
    
    // Recursive generation based on tournament seeding principles
    const halfSize = size / 2;
    const firstHalf = this.generateDynamicSeedingOrder(halfSize);
    const secondHalf = firstHalf.map(seed => size + 1 - seed);
    
    const result: number[] = [];
    for (let i = 0; i < halfSize; i++) {
      result.push(firstHalf[i]);
      result.push(secondHalf[i]);
    }
    
    return result;
  }
  
  // Original method maintained for backward compatibility
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
  
  // Smart participant seeding algorithm
  static seedParticipants(participants: SmartParticipant[], divisionId?: string): SmartParticipant[] {
    // Filter participants for specific division if provided
    let filteredParticipants = participants;
    if (divisionId) {
      filteredParticipants = participants.filter(p => 
        p.assignedDivisionId === divisionId || 
        (p.assignmentResult?.divisionAssignments?.some(d => d.divisionId === divisionId))
      );
    }
    
    if (filteredParticipants.length === 0) return [];
    
    // Calculate skill scores for proper seeding (higher score = stronger = lower seed number)
    const participantsWithScores = filteredParticipants.map((participant) => {
      const skillScore = this.calculateSkillScore(participant);
      return { ...participant, skillScore };
    });
    
    // Sort by skill score descending (highest skill gets seed 1)
    participantsWithScores.sort((a, b) => b.skillScore - a.skillScore);
    
    // Assign sequential seeds (1 = strongest, 2 = second strongest, etc.)
    return participantsWithScores.map((participant, index) => ({
      ...participant,
      seed: participant.seed || (index + 1)
    }));
  }
  
  // Calculate skill score for seeding (higher score = stronger player)
  private static calculateSkillScore(participant: SmartParticipant): number {
    // Skill level weights (expert = strongest, beginner = weakest)
    const skillLevelScores = {
      'expert': 1000,
      'advanced': 750,
      'intermediate': 500,
      'beginner': 250
    };
    
    const baseScore = skillLevelScores[participant.skillLevel] || 0;
    
    // Age bonus for experience (slight bonus for older participants in same skill level)
    const ageBonus = participant.age >= 16 ? 25 : 0;
    
    return baseScore + ageBonus;
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

  // Round Robin Tournament Generator with Smart Seeding
  static generateRoundRobinWithSeeding(participants: SmartParticipant[], tournamentId: string, divisionId?: string): BracketStructure {
    const seededParticipants = this.seedParticipants(participants, divisionId);
    
    if (seededParticipants.length < 3) {
      throw new Error('Need at least 3 participants for round-robin generation');
    }
    
    return this.generateSeededRoundRobin(seededParticipants, tournamentId);
  }
  
  // Generate round-robin with optimal seeding-based scheduling
  static generateSeededRoundRobin(participants: SmartParticipant[], tournamentId: string): BracketStructure {
    const matches: MatchData[] = [];
    let matchId = 1;
    
    // Generate matches using round-robin tournament scheduling
    const schedule = this.generateRoundRobinSchedule(participants);
    
    schedule.forEach((round, roundIndex) => {
      round.forEach((match, matchIndex) => {
        matches.push({
          id: `match-${matchId++}`,
          tournamentId,
          round: roundIndex + 1,
          position: matchIndex + 1,
          team1: `${match.participant1.participantName} (Seed ${match.participant1.seed})`,
          team2: `${match.participant2.participantName} (Seed ${match.participant2.seed})`,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming'
        });
      });
    });
    
    return {
      matches,
      totalRounds: schedule.length,
      totalMatches: matches.length,
      format: 'round-robin-seeded'
    };
  }
  
  // Generate optimal round-robin schedule considering seeding
  static generateRoundRobinSchedule(participants: SmartParticipant[]): Array<Array<{participant1: SmartParticipant, participant2: SmartParticipant}>> {
    const n = participants.length;
    const rounds: Array<Array<{participant1: SmartParticipant, participant2: SmartParticipant}>> = [];
    
    // Use round-robin tournament algorithm
    // If odd number of participants, add a "bye" participant
    const players = [...participants];
    if (n % 2 === 1) {
      players.push({ 
        id: 'bye', 
        participantName: 'BYE', 
        skillLevel: 'beginner', 
        age: 0, 
        gender: 'none',
        seed: 999
      } as SmartParticipant);
    }
    
    const numRounds = players.length - 1;
    const matchesPerRound = players.length / 2;
    
    for (let round = 0; round < numRounds; round++) {
      const roundMatches: Array<{participant1: SmartParticipant, participant2: SmartParticipant}> = [];
      
      for (let match = 0; match < matchesPerRound; match++) {
        let home: number, away: number;
        
        if (match === 0) {
          home = 0; // First player stays fixed
          away = numRounds - round;
        } else {
          home = (round + match) % numRounds;
          away = (numRounds - match + round) % numRounds;
          
          // Adjust indices
          if (home === 0) home = numRounds;
          if (away === 0) away = numRounds;
        }
        
        const participant1 = players[home];
        const participant2 = players[away];
        
        // Skip bye matches
        if (participant1.id !== 'bye' && participant2.id !== 'bye') {
          roundMatches.push({ participant1, participant2 });
        }
      }
      
      if (roundMatches.length > 0) {
        rounds.push(roundMatches);
      }
    }
    
    return rounds;
  }
  
  // Original method maintained for backward compatibility
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

  // Generate seeded bracket based on participants, format, and sport
  static generateSeededBracket(
    participants: SmartParticipant[],
    tournamentId: string,
    format: string,
    sport?: string,
    divisionId?: string
  ): BracketStructure {
    
    switch (format) {
      case 'single':
      case 'single-elimination':
        return this.generateSingleEliminationWithSeeding(participants, tournamentId, divisionId);
        
      case 'double':
      case 'double-elimination':
        // TODO: Implement seeded double elimination
        const seededParticipants = this.seedParticipants(participants, divisionId);
        const teams = seededParticipants.map(p => `${p.participantName} (Seed ${p.seed})`);
        return this.generateDoubleElimination(teams, tournamentId);
        
      case 'pool-play':
        // TODO: Implement seeded pool play
        const poolParticipants = this.seedParticipants(participants, divisionId);
        const poolTeams = poolParticipants.map(p => `${p.participantName} (Seed ${p.seed})`);
        return this.generatePoolPlay(poolTeams, tournamentId);
        
      case 'round-robin':
        return this.generateRoundRobinWithSeeding(participants, tournamentId, divisionId);
        
      case 'swiss-system':
        const rounds = Math.ceil(Math.log2(participants.length)) + 1;
        const swissParticipants = this.seedParticipants(participants, divisionId);
        const swissTeams = swissParticipants.map(p => `${p.participantName} (Seed ${p.seed})`);
        return this.generateSwissSystem(swissTeams, tournamentId, rounds);
        
      case 'leaderboard':
        const leaderboardParticipants = this.seedParticipants(participants, divisionId);
        const leaderboardTeams = leaderboardParticipants.map(p => `${p.participantName} (Seed ${p.seed})`);
        return this.generateLeaderboard(leaderboardTeams, tournamentId, sport || 'track');
        
      default:
        return this.generateSingleEliminationWithSeeding(participants, tournamentId, divisionId);
    }
  }
  
  // Generate bracket based on sport type and format (legacy method)
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