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

export interface SwissSystemStructure extends BracketStructure {
  pairings: Round[];
  maxRounds: number;
  isComplete: boolean;
}

export interface PredictionBracketStructure extends BracketStructure {
  predictionMatches: PredictionMatch[];
  scoringRules: PredictionScoringRules;
  participants: PredictionParticipant[];
}

export interface CompassDrawStructure extends BracketStructure {
  northBracket: MatchData[]; // Winners bracket
  southBracket: MatchData[]; // First loss bracket  
  eastBracket: MatchData[];  // Second loss bracket
  westBracket: MatchData[];  // Third loss bracket
  consolationLevels: number;
}

export interface TripleEliminationStructure extends BracketStructure {
  upperBracket: MatchData[];   // Winners bracket
  lowerBracket1: MatchData[];  // First losers bracket
  lowerBracket2: MatchData[];  // Second losers bracket
  championshipBracket: MatchData[];
  tripleEliminationRouting: Map<string, TripleElimRoutingInfo>;
}

export interface GameGuaranteeStructure extends BracketStructure {
  mainBracket: MatchData[];
  consolationBrackets: MatchData[][];
  gameGuarantee: number;
  teamGameCounts: Map<string, number>;
}

export interface Round {
  roundNumber: number;
  pairings: Pairing[];
}

export interface Pairing {
  table: number;
  white: string;
  black: string;
  result?: '1-0' | '0-1' | '1/2-1/2';
}

export interface PredictionMatch {
  id: string;
  tournamentId: string;
  bracketMatchId: string;
  team1: string;
  team2: string;
  correctPrediction?: string;
  predictions: Map<string, string>; // participantId -> teamPrediction
}

export interface PredictionScoringRules {
  correctPrediction: number;
  championPrediction: number;
  roundMultipliers: number[];
}

export interface PredictionParticipant {
  id: string;
  name: string;
  email: string;
  totalScore: number;
  predictions: Map<string, string>;
}

export interface TripleElimRoutingInfo {
  bracket: 'upper' | 'lower1' | 'lower2';
  round: number;
  match: number;
  lossCount: number;
}

// MARCH MADNESS INTERFACES
export interface MarchMadnessTeam {
  name: string;
  seed: number; // 1-16 for main teams, 16-17 for First Four teams
  region: 'South' | 'West' | 'East' | 'Midwest';
  conference: string;
  geographicLocation: {
    state: string;
    region: string;
  };
  isFirstFourTeam: boolean;
  firstFourSlot?: 'at-large-1' | 'at-large-2' | '16-seed-1' | '16-seed-2';
}

export interface MarchMadnessMatchup extends MatchData {
  region: 'South' | 'West' | 'East' | 'Midwest' | 'Final Four';
  seed1: number;
  seed2: number;
  roundName: string; // "First Four", "Round of 64", "Round of 32", etc.
  isFirstFour?: boolean;
}

export interface RegionalBracket {
  region: 'South' | 'West' | 'East' | 'Midwest';
  teams: MarchMadnessTeam[];
  matches: MarchMadnessMatchup[];
  championMatch?: MarchMadnessMatchup;
}

export interface MarchMadnessBracket extends BracketStructure {
  firstFourMatches: MarchMadnessMatchup[];
  regionalBrackets: RegionalBracket[];
  finalFourMatches: MarchMadnessMatchup[];
  championshipMatch: MarchMadnessMatchup;
  allTeams: MarchMadnessTeam[];
  seedingMap: Map<number, MarchMadnessTeam[]>; // seed -> teams with that seed
  geographicBalance: {
    stateDistribution: Map<string, number>;
    conferenceDistribution: Map<string, number>;
    regionBalance: Map<string, number>;
  };
}

export class BracketGenerator {
  
  // MARCH MADNESS IMPLEMENTATION
  
  /**
   * Build a complete 68-team March Madness tournament bracket
   * @param teams - Array of 68 team names
   * @param tournamentId - Tournament identifier
   * @returns Complete March Madness bracket structure
   */
  static buildMarchMadnessBracket(teams: string[], tournamentId: string): MarchMadnessBracket {
    if (teams.length !== 68) {
      throw new Error(`March Madness requires exactly 68 teams, got ${teams.length}`);
    }

    // Step 1: Create team objects with seeding and regional assignment
    const seededTeams = this.createMarchMadnessTeams(teams);
    
    // Step 2: Balance teams across regions geographically and by conference
    const balancedTeams = this.balanceRegionalAssignments(seededTeams);
    
    // Step 3: Create First Four matches
    const firstFourMatches = this.buildFirstFourMatches(balancedTeams, tournamentId);
    
    // Step 4: Create regional brackets (4 regions × 16 teams each)
    const regionalBrackets = this.buildRegionalBrackets(balancedTeams, tournamentId);
    
    // Step 5: Create Final Four and Championship
    const finalFourMatches = this.buildFinalFourMatches(tournamentId);
    const championshipMatch = this.buildChampionshipMatch(tournamentId);
    
    // Step 6: Compile all matches
    const allMatches = [
      ...firstFourMatches,
      ...regionalBrackets.flatMap(rb => rb.matches),
      ...finalFourMatches,
      championshipMatch
    ];
    
    // Step 7: Calculate analytics
    const geographicBalance = this.calculateGeographicBalance(balancedTeams);
    const seedingMap = this.createSeedingMap(balancedTeams);
    
    return {
      matches: allMatches,
      totalRounds: 7, // First Four, R64, R32, Sweet 16, Elite 8, Final Four, Championship
      totalMatches: allMatches.length,
      format: 'march-madness',
      firstFourMatches,
      regionalBrackets,
      finalFourMatches,
      championshipMatch,
      allTeams: balancedTeams,
      seedingMap,
      geographicBalance
    };
  }

  /**
   * Create team objects with initial seeding and regional assignments
   */
  private static createMarchMadnessTeams(teamNames: string[]): MarchMadnessTeam[] {
    const teams: MarchMadnessTeam[] = [];
    const regions: ('South' | 'West' | 'East' | 'Midwest')[] = ['South', 'West', 'East', 'Midwest'];
    let regionIndex = 0;
    
    // Seeds 1-16, with 4 teams per seed line
    for (let seed = 1; seed <= 16; seed++) {
      for (let i = 0; i < 4; i++) {
        const teamIndex = (seed - 1) * 4 + i;
        if (teamIndex < 64) { // First 64 teams get main bracket spots
          teams.push({
            name: teamNames[teamIndex],
            seed,
            region: regions[regionIndex % 4],
            conference: this.generateConference(),
            geographicLocation: this.generateGeographicLocation(),
            isFirstFourTeam: false
          });
          regionIndex++;
        }
      }
    }
    
    // Remaining 4 teams are First Four teams
    for (let i = 64; i < 68; i++) {
      const isLastFourSeed = i < 66; // First 2 are 16-seeds, last 2 are at-large
      teams.push({
        name: teamNames[i],
        seed: isLastFourSeed ? 16 : 11, // 16-seeds or 11-seeds (at-large)
        region: 'South', // Will be reassigned during balancing
        conference: this.generateConference(),
        geographicLocation: this.generateGeographicLocation(),
        isFirstFourTeam: true,
        firstFourSlot: isLastFourSeed 
          ? (i === 64 ? '16-seed-1' : '16-seed-2')
          : (i === 66 ? 'at-large-1' : 'at-large-2')
      });
    }
    
    return teams;
  }

  /**
   * Build the First Four play-in games
   */
  private static buildFirstFourMatches(teams: MarchMadnessTeam[], tournamentId: string): MarchMadnessMatchup[] {
    const firstFourTeams = teams.filter(t => t.isFirstFourTeam);
    const matches: MarchMadnessMatchup[] = [];
    
    // Two 16-seed games
    const sixteenSeedTeams = firstFourTeams.filter(t => t.seed === 16);
    matches.push({
      id: `FF-16-1`,
      tournamentId,
      round: 0, // Round 0 for First Four
      position: 1,
      bracket: 'championship',
      region: 'South', // Will determine actual region during bracket building
      seed1: 16,
      seed2: 16,
      team1: sixteenSeedTeams[0]?.name,
      team2: sixteenSeedTeams[1]?.name,
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      roundName: 'First Four',
      isFirstFour: true
    });
    
    // Two at-large games (typically 11-seeds)
    const atLargeTeams = firstFourTeams.filter(t => t.seed === 11);
    matches.push({
      id: `FF-11-1`,
      tournamentId,
      round: 0,
      position: 2,
      bracket: 'championship',
      region: 'West',
      seed1: 11,
      seed2: 11,
      team1: atLargeTeams[0]?.name,
      team2: atLargeTeams[1]?.name,
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      roundName: 'First Four',
      isFirstFour: true
    });
    
    return matches;
  }

  /**
   * Build regional brackets with proper NCAA seeding
   */
  private static buildRegionalBrackets(teams: MarchMadnessTeam[], tournamentId: string): RegionalBracket[] {
    const regions: ('South' | 'West' | 'East' | 'Midwest')[] = ['South', 'West', 'East', 'Midwest'];
    const brackets: RegionalBracket[] = [];
    
    for (const region of regions) {
      const regionTeams = teams.filter(t => t.region === region && !t.isFirstFourTeam);
      const matches = this.buildRegionalMatches(regionTeams, region, tournamentId);
      
      brackets.push({
        region,
        teams: regionTeams,
        matches,
        championMatch: matches.find(m => m.round === 4) // Elite Eight winner
      });
    }
    
    return brackets;
  }

  /**
   * Build matches for a single region using standard NCAA bracket format
   */
  private static buildRegionalMatches(teams: MarchMadnessTeam[], region: string, tournamentId: string): MarchMadnessMatchup[] {
    const matches: MarchMadnessMatchup[] = [];
    const roundNames = ['', 'Round of 64', 'Round of 32', 'Sweet Sixteen', 'Elite Eight'];
    
    // Standard NCAA matchups: 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15
    const seedMatchups = [
      [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15]
    ];
    
    let matchId = 0;
    
    // Round 1 (Round of 64)
    for (let i = 0; i < seedMatchups.length; i++) {
      const [seed1, seed2] = seedMatchups[i];
      const team1 = teams.find(t => t.seed === seed1);
      const team2 = teams.find(t => t.seed === seed2);
      
      matches.push({
        id: `${region}-R1-${i + 1}`,
        tournamentId,
        round: 1,
        position: i + 1,
        bracket: 'championship',
        region: region as any,
        seed1,
        seed2,
        team1: team1?.name,
        team2: team2?.name,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        roundName: roundNames[1]
      });
    }
    
    // Build subsequent rounds (Round of 32, Sweet 16, Elite 8)
    for (let round = 2; round <= 4; round++) {
      const prevRoundMatches = matches.filter(m => m.round === round - 1);
      const numMatches = prevRoundMatches.length / 2;
      
      for (let i = 0; i < numMatches; i++) {
        matches.push({
          id: `${region}-R${round}-${i + 1}`,
          tournamentId,
          round,
          position: i + 1,
          bracket: 'championship',
          region: region as any,
          seed1: 0, // TBD based on previous round
          seed2: 0,
          team1: `${region} R${round-1} Game ${i*2 + 1} Winner`,
          team2: `${region} R${round-1} Game ${i*2 + 2} Winner`,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          roundName: roundNames[round]
        });
      }
    }
    
    return matches;
  }

  /**
   * Build Final Four matches
   */
  private static buildFinalFourMatches(tournamentId: string): MarchMadnessMatchup[] {
    return [
      {
        id: 'FF-Semifinal-1',
        tournamentId,
        round: 5,
        position: 1,
        bracket: 'championship',
        region: 'Final Four',
        seed1: 0,
        seed2: 0,
        team1: 'South Champion',
        team2: 'West Champion',
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        roundName: 'Final Four'
      },
      {
        id: 'FF-Semifinal-2',
        tournamentId,
        round: 5,
        position: 2,
        bracket: 'championship',
        region: 'Final Four',
        seed1: 0,
        seed2: 0,
        team1: 'East Champion',
        team2: 'Midwest Champion',
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        roundName: 'Final Four'
      }
    ];
  }

  /**
   * Build Championship match
   */
  private static buildChampionshipMatch(tournamentId: string): MarchMadnessMatchup {
    return {
      id: 'Championship',
      tournamentId,
      round: 6,
      position: 1,
      bracket: 'championship',
      region: 'Final Four',
      seed1: 0,
      seed2: 0,
      team1: 'Final Four Game 1 Winner',
      team2: 'Final Four Game 2 Winner',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      roundName: 'Championship'
    };
  }

  /**
   * Balance team assignments across regions for geographic diversity
   */
  private static balanceRegionalAssignments(teams: MarchMadnessTeam[]): MarchMadnessTeam[] {
    // In a real implementation, this would use actual geographic data
    // For now, we'll ensure balanced distribution
    const regions: ('South' | 'West' | 'East' | 'Midwest')[] = ['South', 'West', 'East', 'Midwest'];
    const mainBracketTeams = teams.filter(t => !t.isFirstFourTeam);
    
    // Redistribute teams across regions while maintaining seed line integrity
    const seededTeams = [...teams];
    let regionIndex = 0;
    
    for (let seed = 1; seed <= 16; seed++) {
      const seedTeams = mainBracketTeams.filter(t => t.seed === seed);
      seedTeams.forEach((team, index) => {
        team.region = regions[index % 4];
      });
    }
    
    return seededTeams;
  }

  /**
   * Generate mock conference data
   */
  private static generateConference(): string {
    const conferences = [
      'ACC', 'Big Ten', 'Big 12', 'SEC', 'Pac-12', 'Big East', 
      'American', 'Mountain West', 'WCC', 'A-10', 'Conference USA', 'MAC'
    ];
    return conferences[Math.floor(Math.random() * conferences.length)];
  }

  /**
   * Generate mock geographic location
   */
  private static generateGeographicLocation(): { state: string; region: string } {
    const locations = [
      { state: 'CA', region: 'West' },
      { state: 'TX', region: 'South' },
      { state: 'NY', region: 'East' },
      { state: 'IL', region: 'Midwest' },
      { state: 'FL', region: 'South' },
      { state: 'OH', region: 'Midwest' }
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  /**
   * Calculate geographic balance analytics
   */
  private static calculateGeographicBalance(teams: MarchMadnessTeam[]) {
    const stateDistribution = new Map<string, number>();
    const conferenceDistribution = new Map<string, number>();
    const regionBalance = new Map<string, number>();
    
    teams.forEach(team => {
      // State distribution
      const state = team.geographicLocation.state;
      stateDistribution.set(state, (stateDistribution.get(state) || 0) + 1);
      
      // Conference distribution
      conferenceDistribution.set(team.conference, (conferenceDistribution.get(team.conference) || 0) + 1);
      
      // Region balance
      regionBalance.set(team.region, (regionBalance.get(team.region) || 0) + 1);
    });
    
    return { stateDistribution, conferenceDistribution, regionBalance };
  }

  /**
   * Create seeding map for bracket analysis
   */
  private static createSeedingMap(teams: MarchMadnessTeam[]): Map<number, MarchMadnessTeam[]> {
    const seedingMap = new Map<number, MarchMadnessTeam[]>();
    
    teams.forEach(team => {
      if (!seedingMap.has(team.seed)) {
        seedingMap.set(team.seed, []);
      }
      seedingMap.get(team.seed)!.push(team);
    });
    
    return seedingMap;
  }

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

  /**
   * Generate Swiss System tournament structure
   * Popular in chess, esports, and academic competitions
   */
  static generateSwissSystem(teams: string[], tournamentId: string, maxRounds?: number): SwissSystemStructure {
    const validTeams = teams.filter(team => team && team.trim() !== '');
    
    if (validTeams.length < 2) {
      throw new Error('Swiss system requires at least 2 participants');
    }
    
    // Calculate recommended rounds (log2 of participants, rounded up)
    const recommendedRounds = Math.ceil(Math.log2(validTeams.length));
    const actualRounds = maxRounds || recommendedRounds;
    
    const matches: MatchData[] = [];
    const pairings: Round[] = [];
    
    // Generate Round 1 - random or seeded pairing
    const round1Pairings: Pairing[] = [];
    const shuffledTeams = [...validTeams].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (i + 1 < shuffledTeams.length) {
        round1Pairings.push({
          table: Math.floor(i / 2) + 1,
          white: shuffledTeams[i],
          black: shuffledTeams[i + 1]
        });
        
        // Create match data
        matches.push({
          id: `swiss-r1-t${Math.floor(i / 2) + 1}`,
          tournamentId,
          round: 1,
          position: Math.floor(i / 2) + 1,
          team1: shuffledTeams[i],
          team2: shuffledTeams[i + 1],
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'winners'
        });
      }
    }
    
    pairings.push({
      roundNumber: 1,
      pairings: round1Pairings
    });
    
    // Placeholder rounds 2-n (to be generated dynamically based on results)
    for (let round = 2; round <= actualRounds; round++) {
      pairings.push({
        roundNumber: round,
        pairings: [] // Will be filled when previous round completes
      });
    }
    
    return {
      matches,
      pairings,
      maxRounds: actualRounds,
      isComplete: false,
      totalRounds: actualRounds,
      totalMatches: matches.length,
      format: 'swiss-system'
    };
  }

  /**
   * Generate Prediction Bracket tournament structure
   * Users predict outcomes instead of playing
   */
  static generatePredictionBracket(teams: string[], tournamentId: string, participants: PredictionParticipant[]): PredictionBracketStructure {
    // Create underlying bracket structure
    const underlyingBracket = this.generateSingleElimination(teams, tournamentId);
    
    const predictionMatches: PredictionMatch[] = [];
    const scoringRules: PredictionScoringRules = {
      correctPrediction: 10,
      championPrediction: 50,
      roundMultipliers: [1, 2, 4, 8, 16, 32] // Multiply points by round importance
    };
    
    // Create prediction matches for each underlying match
    underlyingBracket.matches.forEach(match => {
      predictionMatches.push({
        id: `pred-${match.id}`,
        tournamentId,
        bracketMatchId: match.id,
        team1: match.team1 || 'TBD',
        team2: match.team2 || 'TBD',
        predictions: new Map()
      });
    });
    
    return {
      matches: underlyingBracket.matches,
      predictionMatches,
      scoringRules,
      participants,
      totalRounds: underlyingBracket.totalRounds,
      totalMatches: underlyingBracket.totalMatches,
      format: 'prediction-bracket'
    };
  }

  /**
   * Generate Compass Draw tournament structure
   * Used in tennis/golf for large fields with multiple consolation levels
   */
  static generateCompassDraw(teams: string[], tournamentId: string): CompassDrawStructure {
    const validTeams = teams.filter(team => team && team.trim() !== '');
    
    if (validTeams.length < 8) {
      throw new Error('Compass draw requires at least 8 participants');
    }
    
    const matches: MatchData[] = [];
    let matchIdCounter = 1;
    
    // North Bracket (Winners)
    const northBracket: MatchData[] = [];
    const quarterfinalTeams = validTeams.slice(0, 8); // Top 8 seeds
    
    // North quarterfinals
    for (let i = 0; i < 4; i++) {
      northBracket.push({
        id: `north-qf-${i + 1}`,
        tournamentId,
        round: 1,
        position: i + 1,
        team1: quarterfinalTeams[i * 2],
        team2: quarterfinalTeams[i * 2 + 1],
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'winners'
      });
    }
    
    // South Bracket (First Loss - Quarterfinal Losers)
    const southBracket: MatchData[] = [];
    for (let i = 0; i < 2; i++) {
      southBracket.push({
        id: `south-sf-${i + 1}`,
        tournamentId,
        round: 1,
        position: i + 1,
        team1: `North QF${i * 2 + 1} Loser`,
        team2: `North QF${i * 2 + 2} Loser`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // East Bracket (Second Loss - Semifinal Losers)
    const eastBracket: MatchData[] = [];
    eastBracket.push({
      id: 'east-final-1',
      tournamentId,
      round: 1,
      position: 1,
      team1: 'North SF1 Loser',
      team2: 'North SF2 Loser',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'losers'
    });
    
    // West Bracket (Third Loss - Final Loser)
    const westBracket: MatchData[] = [];
    westBracket.push({
      id: 'west-final-1',
      tournamentId,
      round: 1,
      position: 1,
      team1: 'North Final Loser',
      team2: 'East Final Winner',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'losers'
    });
    
    const allMatches = [...northBracket, ...southBracket, ...eastBracket, ...westBracket];
    
    return {
      matches: allMatches,
      northBracket,
      southBracket,
      eastBracket,
      westBracket,
      consolationLevels: 3,
      totalRounds: 3,
      totalMatches: allMatches.length,
      format: 'compass-draw'
    };
  }

  /**
   * Generate Triple Elimination tournament structure
   * Three losses required for elimination
   */
  static generateTripleElimination(teams: string[], tournamentId: string): TripleEliminationStructure {
    const validTeams = teams.filter(team => team && team.trim() !== '');
    
    if (validTeams.length < 4) {
      throw new Error('Triple elimination requires at least 4 participants');
    }
    
    const upperBracket: MatchData[] = [];
    const lowerBracket1: MatchData[] = [];
    const lowerBracket2: MatchData[] = [];
    const championshipBracket: MatchData[] = [];
    const tripleEliminationRouting = new Map<string, TripleElimRoutingInfo>();
    
    // Upper Bracket (Winners)
    const upperRounds = Math.ceil(Math.log2(validTeams.length));
    let currentTeams = [...validTeams];
    
    for (let round = 1; round <= upperRounds; round++) {
      const matchesInRound = Math.floor(currentTeams.length / 2);
      
      for (let match = 0; match < matchesInRound; match++) {
        const team1 = currentTeams[match * 2];
        const team2 = currentTeams[match * 2 + 1];
        
        upperBracket.push({
          id: `upper-r${round}-m${match + 1}`,
          tournamentId,
          round,
          position: match + 1,
          team1,
          team2,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'winners'
        });
        
        // Set routing for losers
        tripleEliminationRouting.set(`upper-r${round}-m${match + 1}`, {
          bracket: 'lower1',
          round: round,
          match: match + 1,
          lossCount: 1
        });
      }
      
      currentTeams = Array(matchesInRound).fill('TBD');
    }
    
    // Lower Bracket 1 (First Loss)
    for (let round = 1; round <= upperRounds; round++) {
      const matchesInRound = Math.ceil((validTeams.length / Math.pow(2, round)) / 2);
      
      for (let match = 0; match < matchesInRound; match++) {
        lowerBracket1.push({
          id: `lower1-r${round}-m${match + 1}`,
          tournamentId,
          round,
          position: match + 1,
          team1: `Upper R${round} Loser A`,
          team2: `Upper R${round} Loser B`,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'losers'
        });
      }
    }
    
    // Lower Bracket 2 (Second Loss)
    for (let round = 1; round <= Math.ceil(upperRounds / 2); round++) {
      lowerBracket2.push({
        id: `lower2-r${round}-m1`,
        tournamentId,
        round,
        position: 1,
        team1: `Lower1 R${round} Loser`,
        team2: `Lower1 R${round + 1} Loser`,
        team1Score: 0,
        team2Score: 0,
        status: 'upcoming',
        bracket: 'losers'
      });
    }
    
    // Championship Matches
    championshipBracket.push({
      id: 'championship-1',
      tournamentId,
      round: 1,
      position: 1,
      team1: 'Upper Bracket Winner',
      team2: 'Lower Bracket 2 Winner',
      team1Score: 0,
      team2Score: 0,
      status: 'upcoming',
      bracket: 'championship'
    });
    
    const allMatches = [...upperBracket, ...lowerBracket1, ...lowerBracket2, ...championshipBracket];
    
    return {
      matches: allMatches,
      upperBracket,
      lowerBracket1,
      lowerBracket2,
      championshipBracket,
      tripleEliminationRouting,
      totalRounds: Math.max(upperRounds, championshipBracket.length),
      totalMatches: allMatches.length,
      format: 'triple-elimination'
    };
  }

  /**
   * Generate Game Guarantee tournament structure
   * Ensures each team plays minimum number of games
   */
  static generateGameGuarantee(teams: string[], tournamentId: string, gameGuarantee: number = 3): GameGuaranteeStructure {
    const validTeams = teams.filter(team => team && team.trim() !== '');
    
    if (validTeams.length < 4) {
      throw new Error('Game guarantee tournaments require at least 4 participants');
    }
    
    const mainBracket: MatchData[] = [];
    const consolationBrackets: MatchData[][] = [];
    const teamGameCounts = new Map<string, number>();
    
    // Initialize game counts
    validTeams.forEach(team => teamGameCounts.set(team, 0));
    
    // Create main elimination bracket
    const mainElim = this.generateSingleElimination(validTeams, tournamentId);
    mainBracket.push(...mainElim.matches);
    
    // Create consolation brackets for teams that don't meet game guarantee
    const roundsNeeded = Math.ceil(Math.log2(validTeams.length));
    
    for (let consolationLevel = 1; consolationLevel <= gameGuarantee - 1; consolationLevel++) {
      const consolationMatches: MatchData[] = [];
      const teamsInConsolation = Math.floor(validTeams.length / Math.pow(2, consolationLevel));
      
      for (let match = 0; match < Math.floor(teamsInConsolation / 2); match++) {
        consolationMatches.push({
          id: `consolation-${consolationLevel}-m${match + 1}`,
          tournamentId,
          round: consolationLevel,
          position: match + 1,
          team1: `Round ${consolationLevel} Loser A`,
          team2: `Round ${consolationLevel} Loser B`,
          team1Score: 0,
          team2Score: 0,
          status: 'upcoming',
          bracket: 'losers'
        });
      }
      
      if (consolationMatches.length > 0) {
        consolationBrackets.push(consolationMatches);
      }
    }
    
    const allMatches = [...mainBracket, ...consolationBrackets.flat()];
    
    return {
      matches: allMatches,
      mainBracket,
      consolationBrackets,
      gameGuarantee,
      teamGameCounts,
      totalRounds: roundsNeeded + gameGuarantee - 1,
      totalMatches: allMatches.length,
      format: 'game-guarantee'
    };
  }

  // Main bracket generation method
  static generateBracket(
    teams: string[], 
    tournamentId: string, 
    tournamentType: string = 'single', 
    sport: string = 'Basketball',
    options: any = {}
  ): BracketStructure | DoubleElimStructure | SwissSystemStructure | PredictionBracketStructure | CompassDrawStructure | TripleEliminationStructure | GameGuaranteeStructure | MarchMadnessBracket {
    
    // Filter out empty team names
    const validTeams = teams.filter(team => team && team.trim() !== '');
    
    switch (tournamentType) {
      case 'march-madness':
        if (validTeams.length === 68) {
          return this.buildMarchMadnessBracket(validTeams, tournamentId);
        } else {
          throw new Error(`March Madness requires exactly 68 teams. Got ${validTeams.length} teams.`);
        }
        
      case 'double':
        if (validTeams.length === 64) {
          return this.buildDoubleElim64(validTeams, tournamentId);
        } else {
          throw new Error(`Double elimination currently only supports exactly 64 teams. Got ${validTeams.length} teams.`);
        }
        
      case 'swiss-system':
        return this.generateSwissSystem(validTeams, tournamentId, options.maxRounds);
        
      case 'prediction-bracket':
        const participants: PredictionParticipant[] = options.participants || [];
        return this.generatePredictionBracket(validTeams, tournamentId, participants);
        
      case 'compass-draw':
        return this.generateCompassDraw(validTeams, tournamentId);
        
      case 'triple-elimination':
        return this.generateTripleElimination(validTeams, tournamentId);
        
      case 'game-guarantee':
        const gameGuarantee = options.gameGuarantee || 3;
        return this.generateGameGuarantee(validTeams, tournamentId, gameGuarantee);
        
      case 'single':
      default:
        return this.generateSingleElimination(validTeams, tournamentId);
    }
  }
}