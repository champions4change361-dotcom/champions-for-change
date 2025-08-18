// AI Consultation System for Tournament Platform

// Generate sample participants based on sport and demographics
export function generateSampleParticipants(sport: string, teamSize: number, ageGroup: string, genderDivision: string): string[] {
  const participants: string[] = [];
  
  // Sport-specific team/participant name patterns
  const getNamePatterns = () => {
    if (sport.includes("Basketball")) {
      return ["Eagles", "Hawks", "Wolves", "Tigers", "Lions", "Bears", "Panthers", "Sharks", "Thunder", "Storm", "Lightning", "Flames", "Rockets", "Comets", "Spartans", "Warriors"];
    } else if (sport.includes("Football")) {
      return ["Bulldogs", "Mustangs", "Raiders", "Cowboys", "Steelers", "Giants", "Patriots", "Chiefs", "Packers", "Vikings", "Broncos", "Falcons", "Cardinals", "Ravens", "Saints", "Titans"];
    } else if (sport.includes("Soccer")) {
      return ["United", "City", "Rangers", "Athletic", "Real", "FC", "Dynamo", "Galaxy", "Fire", "Revolution", "Impact", "Whitecaps", "Sounders", "Timbers", "Rapids", "Crew"];
    } else if (sport.includes("Baseball")) {
      return ["Yankees", "Red Sox", "Dodgers", "Giants", "Cubs", "Cardinals", "Pirates", "Brewers", "Twins", "Tigers", "Angels", "Athletics", "Mariners", "Rangers", "Astros", "Royals"];
    } else if (sport.includes("Track") || sport.includes("Swimming")) {
      return ["Johnson", "Smith", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas"];
    } else if (sport.includes("Golf")) {
      return ["Woods", "Palmer", "Nicklaus", "Player", "Watson", "Singh", "Garcia", "Mickelson", "McIlroy", "Spieth", "Johnson", "Fowler", "Reed", "Casey", "Rose", "Stenson"];
    } else if (sport.includes("Esports")) {
      return ["CyberWolves", "PixelWarriors", "NeonStorm", "QuantumForce", "VoidHunters", "DataKnights", "CodeCrusaders", "TechTitans", "DigitalDragons", "BinaryBeasts", "NetNinjas", "CyberSpartans", "TechThunder", "PixelPirates", "CodeCommanders", "DataDynamos"];
    } else {
      return ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Omega", "Team Phoenix", "Team Nova", "Team Vortex", "Team Apex", "Team Elite", "Team Prime", "Team Fusion", "Team Nexus", "Team Zero", "Team Infinity", "Team Legend"];
    }
  };

  const namePatterns = getNamePatterns();
  const isIndividual = sport.includes("Track") || sport.includes("Swimming") || sport.includes("Golf") || sport.includes("Tennis");
  
  // School/Organization prefixes based on age group
  const getPrefixes = () => {
    if (ageGroup === "Elementary") {
      return ["Lincoln Elementary", "Washington Elementary", "Roosevelt Elementary", "Kennedy Elementary", "Jefferson Elementary", "Madison Elementary"];
    } else if (ageGroup === "Middle School") {
      return ["Central Middle", "North Middle", "South Middle", "East Middle", "West Middle", "Valley Middle"];
    } else if (ageGroup === "High School") {
      return ["Central High", "North High", "South High", "East High", "West High", "Valley High", "Mountain View", "Riverside", "Oakwood", "Pinewood"];
    } else if (ageGroup === "College") {
      return ["State University", "Tech University", "Community College", "Regional University", "Metro College", "City University"];
    } else {
      return ["Metro", "Regional", "City", "County", "Valley", "Mountain"];
    }
  };

  const prefixes = getPrefixes();
  
  for (let i = 0; i < teamSize; i++) {
    if (isIndividual) {
      // Individual participant names
      const firstName = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Avery", "Quinn", "Sage", "River"][i % 10];
      const lastName = namePatterns[i % namePatterns.length];
      participants.push(`${firstName} ${lastName}`);
    } else {
      // Team names
      const prefix = prefixes[i % prefixes.length];
      const name = namePatterns[i % namePatterns.length];
      participants.push(`${prefix} ${name}`);
    }
  }
  
  return participants;
}

// Generate complete tournament structure with brackets/leaderboards
export function generateTournamentStructure(
  sport: string, 
  format: string, 
  teamSize: number, 
  ageGroup: string, 
  genderDivision: string = "Mixed"
) {
  const participants = generateSampleParticipants(sport, teamSize, ageGroup, genderDivision);
  
  if (format === "leaderboard") {
    return generateLeaderboardStructure(participants, sport);
  } else if (format === "series") {
    return generateSeriesStructure(participants, sport, 7);
  } else if (format === "bracket-to-series") {
    return generateBracketToSeriesStructure(participants, sport);
  } else {
    return generateBracketStructure(participants, sport);
  }
}

function generateBracketStructure(participants: string[], sport: string) {
  const rounds = Math.ceil(Math.log2(participants.length));
  const bracket: any = {};
  
  // Create bracket structure
  for (let round = 1; round <= rounds; round++) {
    bracket[`round_${round}`] = [];
    const matchesInRound = Math.pow(2, rounds - round);
    
    for (let match = 0; match < matchesInRound; match++) {
      if (round === 1) {
        // First round - pair up participants
        const team1 = participants[match * 2] || "BYE";
        const team2 = participants[match * 2 + 1] || "BYE";
        bracket[`round_${round}`].push({
          match_id: `r${round}_m${match + 1}`,
          team1,
          team2,
          winner: null,
          score1: null,
          score2: null
        });
      } else {
        // Later rounds - winners from previous round
        bracket[`round_${round}`].push({
          match_id: `r${round}_m${match + 1}`,
          team1: "TBD",
          team2: "TBD",
          winner: null,
          score1: null,
          score2: null
        });
      }
    }
  }
  
  return { type: "bracket", structure: bracket, participants };
}

function generateLeaderboardStructure(participants: string[], sport: string) {
  const leaderboard = participants.map((participant, index) => ({
    rank: index + 1,
    participant,
    score: null,
    performance: getPerformanceMetric(sport),
    status: "pending"
  }));
  
  return { type: "leaderboard", structure: leaderboard, participants };
}

function generateSeriesStructure(participants: string[], sport: string, seriesLength = 7) {
  const series = [];
  
  for (let i = 0; i < participants.length; i += 2) {
    if (participants[i + 1]) {
      series.push({
        series_id: `series_${Math.floor(i / 2) + 1}`,
        team1: participants[i],
        team2: participants[i + 1],
        games: Array.from({ length: seriesLength }, (_, gameIndex) => ({
          game_number: gameIndex + 1,
          winner: null,
          score1: null,
          score2: null,
          status: "pending"
        })),
        series_winner: null,
        wins_needed: Math.ceil(seriesLength / 2)
      });
    }
  }
  
  return { type: "series", structure: series, participants };
}

function generateBracketToSeriesStructure(participants: string[], sport: string) {
  // Stage 1: Bracket to determine finalists
  const bracketStructure = generateBracketStructure(participants, sport);
  
  // Stage 2: Championship series
  const championshipSeries = {
    series_id: "championship",
    team1: "TBD (Bracket Winner 1)",
    team2: "TBD (Bracket Winner 2)",
    games: Array.from({ length: 7 }, (_, gameIndex) => ({
      game_number: gameIndex + 1,
      winner: null,
      score1: null,
      score2: null,
      status: "pending"
    })),
    series_winner: null,
    wins_needed: 4
  };
  
  return {
    type: "bracket-to-series",
    structure: {
      stage1: bracketStructure.structure,
      stage2: championshipSeries
    },
    participants
  };
}

// Tier 1: Tournament Consultation & Strategic Suggestions
function generateTier1Suggestions(sport: string, format: string, ageGroup: string, genderDivision: string, userInput?: string): string[] {
  const suggestions = [];
  const textLower = userInput?.toLowerCase() || '';
  
  // Enterprise deployment and viral surge scenarios
  const hasEnterpriseKeywords = textLower.includes('state') || textLower.includes('million') || textLower.includes('viewers') || textLower.includes('logging in') || textLower.includes('deployment');
  const hasViralSurge = textLower.includes('new users') || textLower.includes('sign up') || textLower.includes('tv ad') || textLower.includes('surge') || textLower.includes('6000') || textLower.includes('6,000');
  
  if (hasEnterpriseKeywords) {
    suggestions.push("Deploy CDN infrastructure across all 32 states for optimal performance");
    suggestions.push("Implement real-time score streaming with 99.9% uptime guarantee");
    suggestions.push("Set up load balancers to handle 3+ million concurrent viewers");
    suggestions.push("Configure geographic redundancy for uninterrupted service");
    suggestions.push("Enable white-label branding for each state/district deployment");
    suggestions.push("Establish dedicated support teams for enterprise customers");
  }
  
  if (hasViralSurge) {
    suggestions.push("Scale database connections to handle 6,000 simultaneous user registrations");
    suggestions.push("Implement registration queue system to prevent server overload");
    suggestions.push("Auto-provision tier-specific resources (1,800 Pro, 900 Basic, 3,300 Free users)");
    suggestions.push("Enable rapid onboarding workflows for viral signup surges");
    suggestions.push("Configure payment processing for high-volume subscription activations");
    suggestions.push("Set up automated welcome sequences for each subscription tier");
  }
  
  // Sport-specific strategic advice
  if (sport.includes('Basketball')) {
    suggestions.push("Consider 3-point shooting contests for skills competitions");
    suggestions.push("Plan warm-up areas for teams between games");
    suggestions.push("Schedule games with 15-minute buffers for overtime");
  } else if (sport.includes('Track')) {
    suggestions.push("Organize field events to run concurrent with track events");
    suggestions.push("Consider weather contingency plans for outdoor events");
    suggestions.push("Plan separate warm-up areas for sprinters and distance runners");
  } else if (sport.includes('Swimming')) {
    suggestions.push("Schedule longer events first to allow recovery time");
    suggestions.push("Consider separate warm-up pool access");
    suggestions.push("Plan timing technology backup systems");
  } else if (sport.includes('Fantasy')) {
    suggestions.push("Use ONLY professional league data (NFL, NBA, MLB, NHL, MLS)");
    suggestions.push("ZERO involvement with youth, high school, or college sports");
    suggestions.push("Educational sports analytics tool - no gambling features");
    suggestions.push("Texas compliant - strict professional sports data only");
    suggestions.push("Data export capabilities for learning and analysis");
    suggestions.push("Focus on statistical education and sports research");
    suggestions.push("Platform protects youth by excluding amateur sports data");
  }
  
  // Age group specific suggestions
  if (ageGroup === 'Elementary' || ageGroup === 'Middle School') {
    suggestions.push("Include participation awards for all competitors");
    suggestions.push("Consider shorter competition duration to maintain engagement");
    suggestions.push("Plan activities for families and spectators");
  } else if (ageGroup === 'High School') {
    suggestions.push("Coordinate with school athletic directors for scheduling");
    suggestions.push("Consider streaming options for family viewing");
    suggestions.push("Plan recognition ceremony for seniors");
  }
  
  // Format-specific advice for complex tournaments
  if (format === 'conference-bracket-to-series') {
    suggestions.push("Coordinate conference playoff schedules across regions");
    suggestions.push("Plan championship series venue with maximum capacity");
  } else if (format === 'seasonal-leaderboard') {
    suggestions.push("Set up weekly ranking updates throughout the season");
    suggestions.push("Plan playoff seeding based on seasonal performance");
    suggestions.push("Schedule multiple meets/games throughout the school year");
    suggestions.push("Track cumulative standings across all district schools");
    suggestions.push("Plan championship finale based on seasonal rankings");
  } else if (format === 'bracket') {
    suggestions.push("Seed teams based on recent performance data");
    suggestions.push("Plan bye rounds strategically for balanced competition");
  } else if (format === 'leaderboard') {
    suggestions.push("Consider multiple scoring categories for comprehensive ranking");
    suggestions.push("Plan real-time score updates for spectator engagement");
  } else if (format === 'series') {
    suggestions.push("Schedule adequate rest time between series games");
    suggestions.push("Plan for potential series length variations");
  } else if (format === 'fantasy-knockout') {
    suggestions.push("Create elimination-style fantasy competitions");
    suggestions.push("Set weekly challenges for fantasy team performance");
    suggestions.push("Implement head-to-head fantasy matchups");
    suggestions.push("Track lowest-performing teams for elimination");
  } else if (format === 'fantasy-performance') {
    suggestions.push("Use cumulative player statistics for scoring");
    suggestions.push("Create season-long fantasy leagues");
    suggestions.push("Implement position-based scoring systems");
    suggestions.push("Track individual fantasy team performance over time");
  }
  
  // Champions for Change specific suggestions
  suggestions.push("Partner with local educational tour companies for trip planning");
  suggestions.push("Create fundraising opportunities during tournament breaks");
  suggestions.push("Highlight student success stories from previous funded trips");
  
  return suggestions;
}

function getEstimatedParticipants(sport: string, ageGroup: string, format: string, inputText?: string): number {
  let base = 16; // Default tournament size
  
  // Check for conference-based scenarios FIRST (3 teams east + 3 teams west = 6 total)
  const eastMatches = inputText?.match(/(\d+)\s*teams?\s*.*\beast\b/i);
  const westMatches = inputText?.match(/(\d+)\s*teams?\s*.*\bwest\b/i);
  if (eastMatches && westMatches) {
    const eastTeams = parseInt(eastMatches[1]);
    const westTeams = parseInt(westMatches[1]);
    return eastTeams + westTeams;
  }
  
  // Then check if user specified a single total number
  const matches = inputText?.match(/(\d+)\s*(teams?|participants?|players?|athletes?|competitors?)/i);
  if (matches) {
    const specified = parseInt(matches[1]);
    if (specified > 0 && specified <= 128) {
      // For bracket formats, round up to next power of 2
      if (format === 'bracket') {
        return Math.pow(2, Math.ceil(Math.log2(specified)));
      }
      return specified;
    }
  }
  
  // Adjust based on sport popularity
  if (sport.includes('Basketball') || sport.includes('Soccer') || sport.includes('Football')) {
    base = 32;
  } else if (sport.includes('Track') || sport.includes('Swimming')) {
    base = 64; // Individual events can accommodate more
  } else if (sport.includes('Golf') || sport.includes('Tennis')) {
    base = 24;
  }
  
  // Adjust based on age group
  if (ageGroup === 'Elementary') base = Math.max(8, base / 2);
  else if (ageGroup === 'College') base = Math.min(64, base * 1.5);
  
  // For bracket formats, ensure it's a power of 2
  if (format === 'bracket') {
    return Math.pow(2, Math.ceil(Math.log2(base)));
  }
  
  return base;
}

function generateVenueSuggestions(sport: string, ageGroup: string): string[] {
  const venues = [];
  
  if (sport.includes('Basketball')) {
    venues.push("School gymnasium with full court");
    venues.push("Community center with multiple courts");
    venues.push("Recreation center with spectator seating");
  } else if (sport.includes('Swimming')) {
    venues.push("School aquatic center with timing system");
    venues.push("Municipal pool with lane capabilities");
    venues.push("YMCA facility with diving capabilities");
  } else if (sport.includes('Track')) {
    venues.push("High school track with field event areas");
    venues.push("College athletic facility");
    venues.push("Municipal sports complex");
  }
  
  // Community venues for Champions for Change tournaments
  if (ageGroup === 'Middle School' || ageGroup === 'High School') {
    venues.push("Local middle school facilities");
    venues.push("School district athletic facilities");
    venues.push("Community college facilities");
  }
  
  return venues;
}

function generateScheduleTemplate(sport: string, format: string, participants: number): any {
  const template = {
    duration_days: 1,
    sessions: [] as any[],
    breaks: [] as any[],
    ceremonies: [] as any[]
  };
  
  if (format === 'bracket') {
    const rounds = Math.ceil(Math.log2(participants));
    template.duration_days = rounds > 4 ? 2 : 1;
    
    if (template.duration_days === 1) {
      template.sessions = [
        { name: "Opening Ceremony", start: "8:00 AM", duration: "30 min" },
        { name: "First Round", start: "8:30 AM", duration: "2 hours" },
        { name: "Lunch Break", start: "10:30 AM", duration: "45 min" },
        { name: "Semifinals", start: "11:15 AM", duration: "1 hour" },
        { name: "Championship", start: "12:30 PM", duration: "45 min" },
        { name: "Awards Ceremony", start: "1:30 PM", duration: "30 min" }
      ];
    }
  } else if (format === 'leaderboard') {
    template.sessions = [
      { name: "Registration & Warm-up", start: "8:00 AM", duration: "45 min" },
      { name: "Competition Events", start: "8:45 AM", duration: "4 hours" },
      { name: "Final Scoring", start: "1:00 PM", duration: "30 min" },
      { name: "Awards Ceremony", start: "1:30 PM", duration: "30 min" }
    ];
  }
  
  return template;
}

// Enhanced AI Tournament Builder - Matches Sport's Natural Structure
export function generateIntelligentTournamentStructure(sport: string, participants: number, ageGroup: string): any {
  const sportLower = sport.toLowerCase();
  
  // Basketball - naturally bracket-based (March Madness style)
  if (sportLower.includes('basketball')) {
    const teams = Math.pow(2, Math.ceil(Math.log2(participants)));
    return {
      format: 'single-elimination-bracket',
      structure: 'march-madness-style',
      teams: teams,
      rounds: Math.log2(teams),
      naturalReason: 'Basketball traditionally uses single-elimination brackets like March Madness',
      codeImplementation: generateBasketballBracketCode(teams, ageGroup)
    };
  }
  
  // Track & Field - naturally leaderboard (individual times/distances)
  if (sportLower.includes('track') || sportLower.includes('field')) {
    return {
      format: 'performance-leaderboard',
      structure: 'event-based-scoring',
      events: ['100m', '200m', '400m', 'Long Jump', 'Shot Put', 'High Jump'],
      scoring: 'time-and-distance-based',
      naturalReason: 'Track & Field uses individual performance metrics, not head-to-head elimination',
      codeImplementation: generateTrackFieldLeaderboardCode(ageGroup)
    };
  }
  
  // Baseball - naturally series-based (World Series model)
  if (sportLower.includes('baseball')) {
    return {
      format: 'bracket-to-championship-series',
      structure: 'playoff-bracket-then-best-of-7',
      teams: participants,
      playoffRounds: Math.ceil(Math.log2(participants)) - 1,
      championshipSeries: 'best-of-7',
      naturalReason: 'Baseball follows MLB model: playoffs leading to World Series',
      codeImplementation: generateBaseballSeriesCode(participants, ageGroup)
    };
  }
  
  // Soccer - naturally group-stage-to-knockout (World Cup model)
  if (sportLower.includes('soccer') || sportLower.includes('football')) {
    const groups = Math.ceil(participants / 4);
    return {
      format: 'group-stage-to-knockout',
      structure: 'world-cup-style',
      groups: groups,
      groupSize: 4,
      knockoutTeams: groups * 2,
      naturalReason: 'Soccer follows World Cup format: group stage then knockout rounds',
      codeImplementation: generateSoccerWorldCupCode(participants, ageGroup)
    };
  }
  
  // Golf - naturally leaderboard with stroke play
  if (sportLower.includes('golf')) {
    return {
      format: 'stroke-play-leaderboard',
      structure: 'cumulative-scoring',
      rounds: ageGroup.includes('Elementary') ? 1 : 2,
      scoring: 'lowest-total-strokes',
      naturalReason: 'Golf uses stroke play where lowest total score wins',
      codeImplementation: generateGolfLeaderboardCode(ageGroup)
    };
  }
  
  // Swimming - naturally time-based leaderboard
  if (sportLower.includes('swimming')) {
    return {
      format: 'time-based-leaderboard',
      structure: 'event-heats-to-finals',
      events: ['50m Freestyle', '100m Freestyle', '100m Backstroke', '100m Breaststroke'],
      scoring: 'fastest-time-wins',
      naturalReason: 'Swimming competitions rank by fastest times in each event',
      codeImplementation: generateSwimmingLeaderboardCode(ageGroup)
    };
  }
  
  // Default to bracket for team sports
  return {
    format: 'single-elimination-bracket',
    structure: 'standard-tournament',
    teams: Math.pow(2, Math.ceil(Math.log2(participants))),
    naturalReason: 'Standard elimination format for team-based competition',
    codeImplementation: generateStandardBracketCode(participants, ageGroup)
  };
}

// Code generators for each sport's natural structure
function generateBasketballBracketCode(teams: number, ageGroup: string): string {
  return `// Basketball Tournament Bracket Generator
function createBasketballTournament(teams) {
  const bracket = {
    name: "${ageGroup} Basketball Championship",
    format: "single-elimination",
    rounds: ${Math.log2(teams)},
    teams: teams,
    matches: []
  };
  
  // Generate first round matchups
  for (let i = 0; i < teams; i += 2) {
    bracket.matches.push({
      round: 1,
      team1: \`Team \${i + 1}\`,
      team2: \`Team \${i + 2}\`,
      courtTime: \`\${Math.floor(i/2) * 45 + 480} minutes\`,
      winner: null
    });
  }
  
  return bracket;
}

// Champions for Change Integration
function trackEducationalImpact(registrationFee) {
  const studentTripCost = 2600;
  const studentsFunded = Math.floor(registrationFee / studentTripCost);
  
  return {
    revenue: registrationFee,
    studentsFunded: studentsFunded,
    tripsEnabled: studentsFunded,
    educationalImpact: \`\${studentsFunded} students can now experience educational travel\`
  };
}`;
}

function generateTrackFieldLeaderboardCode(ageGroup: string): string {
  return `// Track & Field Event Leaderboard
function createTrackFieldTournament(events) {
  const tournament = {
    name: "${ageGroup} Track & Field Meet",
    format: "performance-leaderboard",
    events: [
      { name: "100m Dash", unit: "seconds", type: "time" },
      { name: "Long Jump", unit: "meters", type: "distance" },
      { name: "Shot Put", unit: "meters", type: "distance" }
    ],
    participants: [],
    results: {}
  };
  
  // Score tracking for each event
  events.forEach(event => {
    tournament.results[event.name] = [];
  });
  
  return tournament;
}

// Performance ranking system
function rankPerformances(eventData, eventType) {
  if (eventType === "time") {
    return eventData.sort((a, b) => a.result - b.result); // Fastest first
  } else {
    return eventData.sort((a, b) => b.result - a.result); // Furthest first
  }
}`;
}

function generateBaseballSeriesCode(teams: number, ageGroup: string): string {
  return `// Baseball Tournament with Championship Series
function createBaseballTournament(teams) {
  const tournament = {
    name: "${ageGroup} Baseball Championship",
    format: "bracket-to-series",
    playoffBracket: createPlayoffBracket(teams),
    championshipSeries: {
      format: "best-of-7",
      games: [],
      winner: null
    }
  };
  
  return tournament;
}

// World Series style championship
function createChampionshipSeries(team1, team2) {
  const series = {
    teams: [team1, team2],
    games: [],
    wins: { [team1]: 0, [team2]: 0 },
    champion: null
  };
  
  // Generate up to 7 games
  for (let i = 1; i <= 7; i++) {
    series.games.push({
      gameNumber: i,
      homeTeam: i % 2 === 1 ? team1 : team2,
      awayTeam: i % 2 === 1 ? team2 : team1,
      score: null,
      winner: null
    });
  }
  
  return series;
}`;
}

function generateSoccerWorldCupCode(teams: number, ageGroup: string): string {
  return `// Soccer World Cup Style Tournament
function createSoccerTournament(teams) {
  const groups = Math.ceil(teams / 4);
  const tournament = {
    name: "${ageGroup} Soccer Cup",
    format: "group-stage-to-knockout",
    groupStage: createGroupStage(groups),
    knockout: {
      round16: [],
      quarterfinals: [],
      semifinals: [],
      final: null
    }
  };
  
  return tournament;
}

// Group stage round-robin
function createGroupStage(numGroups) {
  const groups = {};
  
  for (let i = 0; i < numGroups; i++) {
    const groupLetter = String.fromCharCode(65 + i); // A, B, C, etc.
    groups[\`Group \${groupLetter}\`] = {
      teams: [],
      matches: [],
      standings: []
    };
  }
  
  return groups;
}`;
}

function generateGolfLeaderboardCode(ageGroup: string): string {
  return `// Golf Stroke Play Tournament
function createGolfTournament(players) {
  const tournament = {
    name: "${ageGroup} Golf Tournament",
    format: "stroke-play",
    rounds: ${ageGroup.includes('Elementary') ? 1 : 2},
    leaderboard: [],
    scorecards: {}
  };
  
  players.forEach(player => {
    tournament.scorecards[player] = {
      rounds: [],
      totalStrokes: 0,
      position: null
    };
  });
  
  return tournament;
}

// Calculate golf standings
function updateLeaderboard(tournament) {
  const standings = Object.entries(tournament.scorecards)
    .map(([player, scorecard]) => ({
      player,
      totalStrokes: scorecard.totalStrokes,
      rounds: scorecard.rounds
    }))
    .sort((a, b) => a.totalStrokes - b.totalStrokes);
  
  tournament.leaderboard = standings;
  return standings;
}`;
}

function generateSwimmingLeaderboardCode(ageGroup: string): string {
  return `// Swimming Meet Time-Based Competition
function createSwimmingMeet(swimmers) {
  const meet = {
    name: "${ageGroup} Swimming Championship",
    format: "time-based-leaderboard",
    events: [
      { name: "50m Freestyle", swimmers: [], results: [] },
      { name: "100m Freestyle", swimmers: [], results: [] },
      { name: "100m Backstroke", swimmers: [], results: [] }
    ],
    overallStandings: []
  };
  
  return meet;
}

// Time conversion and ranking
function rankSwimmers(eventResults) {
  return eventResults.sort((a, b) => {
    const timeA = convertToSeconds(a.time);
    const timeB = convertToSeconds(b.time);
    return timeA - timeB; // Fastest first
  });
}

function convertToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(':');
  return parseInt(minutes) * 60 + parseFloat(seconds);
}`;
}

function generateStandardBracketCode(teams: number, ageGroup: string): string {
  return `// Standard Tournament Bracket
function createStandardTournament(teams) {
  const tournament = {
    name: "${ageGroup} Tournament",
    format: "single-elimination",
    bracket: generateBracket(teams),
    currentRound: 1,
    champion: null
  };
  
  return tournament;
}

function generateBracket(numTeams) {
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(numTeams)));
  const rounds = Math.log2(bracketSize);
  const bracket = [];
  
  for (let round = 1; round <= rounds; round++) {
    const matchesInRound = bracketSize / Math.pow(2, round);
    bracket.push({
      round: round,
      matches: matchesInRound,
      winners: []
    });
  }
  
  return bracket;
}`;
}

export function generateWebpageTemplate(sport: string, ageGroup: string, format: string): string {
  const sportSlug = sport.toLowerCase().replace(/\s+/g, '-');
  const ageSlug = ageGroup.toLowerCase().replace(/\s+/g, '-');
  const tournamentStructure = generateIntelligentTournamentStructure(sport, 16, ageGroup);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sport} ${ageGroup} Tournament | Champions for Change</title>
    <meta name="description" content="Join our ${sport} tournament supporting educational trips for Corpus Christi youth">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #1f2937; }
        .header { background: linear-gradient(135deg, #059669, #2563eb); color: white; padding: 2rem 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .hero { padding: 4rem 0; background: linear-gradient(to bottom, #f0fdf4, #ecfdf5); }
        .tournament-format { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem 1.5rem; margin: 2rem 0; border-radius: 0 8px 8px 0; }
        .code-section { background: #1f2937; color: #f9fafb; padding: 2rem; border-radius: 12px; margin: 2rem 0; overflow-x: auto; }
        .champions-impact { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 3rem 2rem; text-align: center; border-radius: 16px; margin: 3rem 0; }
        .registration-btn { background: #059669; color: white; padding: 16px 32px; border: none; border-radius: 8px; font-size: 18px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .registration-btn:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3); }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
        .feature-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
        .impact-counter { background: rgba(255,255,255,0.2); padding: 1rem 2rem; border-radius: 50px; display: inline-block; margin: 1rem; }
        pre { background: #111827; padding: 1.5rem; border-radius: 8px; overflow-x: auto; }
        code { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>${sport} ${ageGroup} Tournament</h1>
            <p>Powered by Champions for Change Educational Mission</p>
        </div>
    </header>
    
    <section class="hero">
        <div class="container">
            <div class="tournament-format">
                <h3>🏆 Intelligent Tournament Format: ${tournamentStructure.format}</h3>
                <p><strong>Why this format?</strong> ${tournamentStructure.naturalReason}</p>
            </div>
            
            <h2>Join the ${sport} Championship</h2>
            <p style="font-size: 18px; color: #6b7280; max-width: 600px; margin: 1rem auto;">
                Experience competitive ${sport} while funding educational opportunities for underprivileged youth in Corpus Christi, Texas.
            </p>
            <div style="margin: 2rem 0;">
                <button class="registration-btn" onclick="registerTeam()">Register Your Team</button>
            </div>
        </div>
    </section>

    <section class="champions-impact">
        <div class="container">
            <h2>Educational Impact Through Sports</h2>
            <div style="display: flex; justify-content: center; flex-wrap: wrap; margin: 2rem 0;">
                <div class="impact-counter">
                    <div style="font-size: 2rem; font-weight: bold;" id="students-funded">0</div>
                    <div>Students Funded</div>
                </div>
                <div class="impact-counter">
                    <div style="font-size: 2rem; font-weight: bold;">$2,600</div>
                    <div>Per Student Trip</div>
                </div>
                <div class="impact-counter">
                    <div style="font-size: 2rem; font-weight: bold;" id="trips-completed">0</div>
                    <div>Trips Completed</div>
                </div>
            </div>
            <p style="font-size: 18px; opacity: 0.9;">Every tournament registration directly funds educational travel experiences that inspire learning and broaden horizons for middle school students in Corpus Christi.</p>
        </div>
    </section>
    
    <section class="feature-grid">
        <div class="container">
            <div class="feature-card">
                <h3>🎯 Sport-Specific Format</h3>
                <p><strong>Format:</strong> ${tournamentStructure.format}</p>
                <p><strong>Structure:</strong> ${tournamentStructure.structure}</p>
                <p>This tournament follows the natural competitive structure of ${sport}, ensuring authentic competition that athletes and coaches recognize.</p>
            </div>
            
            <div class="feature-card">
                <h3>📊 Real-Time Tracking</h3>
                <p>Live scoring, bracket updates, and performance metrics. Parents and fans can follow the action remotely with instant notifications.</p>
            </div>
            
            <div class="feature-card">
                <h3>🎓 Educational Mission</h3>
                <p>100% of proceeds fund $2,600 educational trips for underprivileged students. Your participation creates lasting educational impact.</p>
            </div>
        </div>
    </section>

    <section class="code-section">
        <div class="container">
            <h3 style="color: #10b981; margin-bottom: 1rem;">🛠️ Developer Implementation Code</h3>
            <p style="color: #d1d5db; margin-bottom: 1.5rem;">
                Copy this code to implement the ${sport} tournament structure in your own platform:
            </p>
            <pre><code>${tournamentStructure.codeImplementation}</code></pre>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
                <p style="color: #10b981; font-weight: 600;">✨ This code is automatically generated based on ${sport}'s natural tournament structure</p>
                <p style="color: #d1d5db; margin-top: 0.5rem;">Includes Champions for Change educational impact tracking and revenue attribution</p>
            </div>
        </div>
    </section>
    
    <script>
        // Tournament registration with educational impact tracking
        function registerTeam() {
            const registrationData = {
                tournament: '${sportSlug}-${ageSlug}',
                sport: '${sport}',
                ageGroup: '${ageGroup}',
                format: '${tournamentStructure.format}',
                educationalImpact: true
            };
            
            // Redirect to registration with pre-filled data
            const params = new URLSearchParams(registrationData);
            window.open(\`/register?\${params.toString()}\`, '_blank');
        }
        
        // Real-time educational impact metrics
        async function updateImpactMetrics() {
            try {
                const response = await fetch('/api/educational-impact');
                const data = await response.json();
                
                document.getElementById('students-funded').textContent = data.studentsFunded || 0;
                document.getElementById('trips-completed').textContent = data.tripsCompleted || 0;
                
                // Animate numbers
                animateCounter('students-funded', data.studentsFunded || 0);
                animateCounter('trips-completed', data.tripsCompleted || 0);
            } catch (error) {
                console.log('Impact metrics will load when connected to Champions for Change platform');
            }
        }
        
        function animateCounter(elementId, targetValue) {
            const element = document.getElementById(elementId);
            const start = 0;
            const duration = 2000;
            const startTime = performance.now();
            
            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const currentValue = Math.floor(progress * targetValue);
                
                element.textContent = currentValue;
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            }
            
            requestAnimationFrame(updateCounter);
        }
        
        // Initialize impact tracking
        updateImpactMetrics();
        
        // Update every 30 seconds for live events
        setInterval(updateImpactMetrics, 30000);
    </script>
</body>
</html>`;
}

function getPerformanceMetric(sport: string): string {
  if (sport.includes("Track")) {
    return "time (seconds)";
  } else if (sport.includes("Swimming")) {
    return "time (minutes:seconds)";
  } else if (sport.includes("Golf")) {
    return "strokes";
  } else if (sport.includes("Weight") || sport.includes("Shot") || sport.includes("Discus")) {
    return "distance (meters)";
  } else if (sport.includes("Fishing")) {
    return "weight (pounds)";
  } else {
    return "points";
  }
}

// Keystone AI Consultation - Three-Tier Service Model
export interface KeystoneConsultationResult {
  tier: 'consultation' | 'generation' | 'full-service';
  sport: string;
  format: string;
  age_group: string;
  gender_division: string;
  confidence: number;
  recommendation: string;
  tier1_suggestions?: string[];
  tier2_structure?: any;
  tier3_webpage_template?: string;
  estimated_participants?: number;
  venue_suggestions?: string[];
  schedule_template?: any;
}

// Website Builder Query Analysis - Jersey Watch Style
export function analyzeWebsiteBuilderQuery(userInput: string): KeystoneConsultationResult {
  const input = userInput.toLowerCase();
  
  // Enhanced sport detection with website focus
  let sport = "Multi-Sport";
  let format = "user_hierarchy";
  let ageGroup = "Mixed Age";
  let genderDivision = "Mixed";
  let participants = 16;
  
  // Sport detection (same logic but website-focused)
  if (input.includes("basketball")) sport = "Basketball";
  else if (input.includes("soccer") || input.includes("football")) sport = "Soccer";
  else if (input.includes("baseball") || input.includes("softball")) sport = "Baseball";
  else if (input.includes("volleyball")) sport = "Volleyball";
  else if (input.includes("swimming")) sport = "Swimming";
  else if (input.includes("tennis")) sport = "Tennis";
  else if (input.includes("golf")) sport = "Golf";
  else if (input.includes("track")) sport = "Track & Field";
  
  // Website-specific features detection
  const hasUserHierarchy = input.includes("user") || input.includes("coach") || input.includes("player") || input.includes("scorekeeper");
  const hasLinkSharing = input.includes("link") || input.includes("share") || input.includes("send");
  const hasRoleAccess = input.includes("access") || input.includes("permission") || input.includes("role");
  
  return {
    tier: "website_builder" as any,
    sport,
    format,
    age_group: ageGroup,
    gender_division: genderDivision,
    estimated_participants: participants,
    confidence: 0.95,
    recommendation: `Website Builder AI detected: ${sport} tournament with user hierarchy management. Creating Jersey Watch-style platform with link sharing and role-based access control.`,
    tier1_suggestions: [
      "Tournament Director creates main tournament website",
      "Generates shareable links for coaches to access their team management areas",
      "Coaches can add/remove players from their teams",
      "Scorekeepers get assigned-event-only access for score updates",
      "Players/fans get read-only access to view results and schedules",
      "Champions for Change branding and educational impact messaging integrated throughout"
    ],
    venue_suggestions: generateVenueSuggestions(sport, ageGroup),
    schedule_template: generateScheduleTemplate(sport, format, participants)
  };
}

// Website Builder Template Generator
export function generateWebsiteBuilderTemplate(sport: string, ageGroup: string, format: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sport} Tournament - Champions for Change</title>
    <style>
        /* Champions for Change Styling */
        :root {
            --primary-green: #22c55e;
            --primary-blue: #3b82f6;
            --dark-bg: #0f172a;
            --card-bg: #1e293b;
            --text-light: #f1f5f9;
            --text-muted: #94a3b8;
            --border: #334155;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Inter', sans-serif; 
            background: linear-gradient(135deg, var(--dark-bg) 0%, #1e293b 100%);
            color: var(--text-light);
            min-height: 100vh;
        }
        .header {
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--border);
            padding: 1rem 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary-green), var(--primary-blue));
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        .user-menu {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .role-director { background: linear-gradient(135deg, #dc2626, #b91c1c); }
        .role-coach { background: linear-gradient(135deg, var(--primary-blue), #2563eb); }
        .role-scorekeeper { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .role-player { background: linear-gradient(135deg, var(--primary-green), #16a34a); }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s ease;
        }
        .card:hover {
            border-color: var(--primary-blue);
            transform: translateY(-2px);
        }
        .card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        .card-icon {
            width: 48px;
            height: 48px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--primary-green), var(--primary-blue));
        }
        .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--primary-blue), #2563eb);
            color: white;
        }
        .btn-success {
            background: linear-gradient(135deg, var(--primary-green), #16a34a);
            color: white;
        }
        .role-access {
            border: 1px solid var(--border);
            border-radius: 8px;
            margin: 1rem 0;
        }
        .access-level {
            padding: 1rem;
            border-bottom: 1px solid var(--border);
        }
        .access-level:last-child { border-bottom: none; }
        .access-title {
            font-weight: 600;
            color: var(--primary-blue);
            margin-bottom: 0.5rem;
        }
        .educational-impact {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1));
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            padding: 2rem;
            margin: 2rem 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <div class="logo">
                <div class="logo-icon">🏆</div>
                <div>
                    <h1>${sport} Tournament</h1>
                    <p style="font-size: 0.875rem; color: var(--text-muted);">Champions for Change Platform</p>
                </div>
            </div>
            <div class="user-menu">
                <span class="role-badge role-director" id="user-role">Tournament Director</span>
                <button class="btn btn-primary" onclick="shareLink()">Share Access Link</button>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="educational-impact">
            <h2>Educational Impact Dashboard</h2>
            <p>This tournament directly funds student educational trips through Champions for Change</p>
            <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem;">
                <div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--primary-green);" id="students-funded">0</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">Students Funded</div>
                </div>
                <div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--primary-blue);" id="trips-completed">0</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">Educational Trips</div>
                </div>
            </div>
        </div>

        <!-- Role-Based Access Control Demo -->
        <div class="role-access">
            <div class="access-level">
                <div class="access-title">🎯 Tournament Director (You)</div>
                <p>Full access: Create tournaments, assign coaches, manage scorekeepers, view all data</p>
                <button class="btn btn-primary">Manage Tournament Settings</button>
            </div>
            <div class="access-level">
                <div class="access-title">👨‍🏫 Coaches</div>
                <p>Team management: Add/remove players, view schedules, communicate with players</p>
                <button class="btn btn-success" onclick="generateCoachLink()">Generate Coach Access Link</button>
            </div>
            <div class="access-level">
                <div class="access-title">⚖️ Scorekeepers/Judges</div>
                <p>Event-specific: Update scores only for assigned events, view event schedules</p>
                <button class="btn btn-success" onclick="generateScorekeeperLink()">Generate Scorekeeper Link</button>
            </div>
            <div class="access-level">
                <div class="access-title">🏃‍♂️ Players/Fans</div>
                <p>Read-only: View results, schedules, and tournament information</p>
                <button class="btn btn-success" onclick="generatePlayerLink()">Generate Viewer Link</button>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="card">
                <div class="card-header">
                    <div class="card-icon">👥</div>
                    <div>
                        <h3>Team Management</h3>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">Manage teams and rosters</p>
                    </div>
                </div>
                <button class="btn btn-primary" style="width: 100%;">View Teams</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-icon">📊</div>
                    <div>
                        <h3>Live Scores</h3>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">Real-time score updates</p>
                    </div>
                </div>
                <button class="btn btn-primary" style="width: 100%;">Update Scores</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🏆</div>
                    <div>
                        <h3>Tournament Bracket</h3>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">${sport} tournament structure</p>
                    </div>
                </div>
                <button class="btn btn-primary" style="width: 100%;">View Bracket</button>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-icon">🔗</div>
                    <div>
                        <h3>Share Links</h3>
                        <p style="color: var(--text-muted); font-size: 0.875rem;">Generate access links</p>
                    </div>
                </div>
                <button class="btn btn-success" style="width: 100%;" onclick="showLinkGenerator()">Generate Links</button>
            </div>
        </div>
    </div>

    <script>
        // Jersey Watch-Style Link Generation
        function generateCoachLink() {
            const coachId = Math.random().toString(36).substr(2, 9);
            const link = \`\${window.location.origin}/coach/\${coachId}\`;
            navigator.clipboard.writeText(link);
            alert('Coach access link copied to clipboard! Share this with your coaches.');
        }

        function generateScorekeeperLink() {
            const scorekeeperId = Math.random().toString(36).substr(2, 9);
            const link = \`\${window.location.origin}/scorekeeper/\${scorekeeperId}\`;
            navigator.clipboard.writeText(link);
            alert('Scorekeeper access link copied to clipboard! Share this with event judges.');
        }

        function generatePlayerLink() {
            const link = \`\${window.location.origin}/view\`;
            navigator.clipboard.writeText(link);
            alert('Viewer link copied to clipboard! Share this with players and fans.');
        }

        function shareLink() {
            showLinkGenerator();
        }

        function showLinkGenerator() {
            alert('Link Generator: Choose who you want to share access with using the buttons in the Role-Based Access section above.');
        }

        // Simulate educational impact metrics
        function updateImpactMetrics() {
            document.getElementById('students-funded').textContent = Math.floor(Math.random() * 50) + 25;
            document.getElementById('trips-completed').textContent = Math.floor(Math.random() * 10) + 5;
        }

        // Initialize
        updateImpactMetrics();
        setInterval(updateImpactMetrics, 30000);
    </script>
</body>
</html>`;
}

export function analyzeTournamentQuery(text: string): KeystoneConsultationResult {
  const textLower = text.toLowerCase();
  
  // Check if user wants webpage creation/building
  const isWebpageRequest = textLower.includes('webpage') || textLower.includes('website') || 
                          textLower.includes('build') || textLower.includes('create') ||
                          textLower.includes('page') || textLower.includes('site');
  
  // Sport detection with comprehensive list
  let sport = 'Custom Tournament'; // Better default for webpage requests
  let confidence = 30; // Lower base confidence for better detection
  
  // Team Sports - Enhanced detection  
  if (textLower.includes('basketball') || textLower.includes('hoops') || textLower.includes('nba')) { 
    sport = 'Basketball'; confidence += 35; 
    if (textLower.includes('nba') || textLower.includes('college basketball') || textLower.includes('finals')) confidence += 10;
  }
  else if (textLower.includes('football') && !textLower.includes('soccer') && !textLower.includes('futbol')) { 
    sport = 'Football'; confidence += 40; 
    if (textLower.includes('american football') || textLower.includes('nfl') || textLower.includes('high school football') || textLower.includes('college football')) confidence += 10;
  }
  else if (textLower.includes('soccer') || textLower.includes('futbol') || (textLower.includes('football') && (textLower.includes('fifa') || textLower.includes('world cup')))) { 
    sport = 'Soccer'; confidence += 35; 
    if (textLower.includes('fifa') || textLower.includes('world cup')) confidence += 10;
  }
  else if (textLower.includes('volleyball') || textLower.includes('vball')) { 
    sport = 'Volleyball'; confidence += 35; 
  }
  else if (textLower.includes('baseball') || textLower.includes('mlb') || textLower.includes('world series')) { 
    sport = 'Baseball'; confidence += 35; 
    if (textLower.includes('world series') || textLower.includes('best of 7')) confidence += 15;
  }
  else if (textLower.includes('softball')) { 
    sport = 'Softball'; confidence += 35; 
  }
  else if (textLower.includes('hockey') || textLower.includes('nhl')) { 
    sport = 'Ice Hockey'; confidence += 35; 
  }
  
  // Individual Sports - Enhanced detection
  else if (textLower.includes('swimming') || textLower.includes('swim meet') || textLower.includes('aquatic')) { 
    sport = 'Swimming & Diving'; confidence += 35; 
    if (textLower.includes('olympics') || textLower.includes('freestyle') || textLower.includes('backstroke')) confidence += 10;
  }
  else if (textLower.includes('track') || textLower.includes('field') || textLower.includes('cross country') || textLower.includes('running') || textLower.includes('athletics')) { 
    sport = 'Track & Field'; confidence += 35; 
    if (textLower.includes('sprint') || textLower.includes('distance') || textLower.includes('hurdles') || textLower.includes('cross country')) confidence += 10;
  }
  else if (textLower.includes('golf') || textLower.includes('pga')) { 
    sport = 'Golf'; confidence += 35; 
    if (textLower.includes('stroke play') || textLower.includes('tournament')) confidence += 10;
  }
  else if (textLower.includes('tennis') || textLower.includes('atp') || textLower.includes('wta')) { 
    sport = 'Tennis'; confidence += 35; 
  }
  else if (textLower.includes('wrestling') || textLower.includes('grappling')) { 
    sport = 'Wrestling'; confidence += 35; 
  }
  else if (textLower.includes('boxing') || textLower.includes('fighter')) { 
    sport = 'Boxing'; confidence += 35; 
  }
  
  // Esports
  else if (textLower.includes('esports') || textLower.includes('gaming')) { sport = 'League of Legends'; confidence += 25; }
  else if (textLower.includes('valorant')) { sport = 'Valorant'; confidence += 30; }
  else if (textLower.includes('league of legends') || textLower.includes('lol')) { sport = 'League of Legends'; confidence += 30; }
  else if (textLower.includes('csgo') || textLower.includes('cs:go')) { sport = 'CS:GO'; confidence += 30; }
  else if (textLower.includes('overwatch')) { sport = 'Overwatch'; confidence += 30; }
  else if (textLower.includes('rocket league')) { sport = 'Rocket League'; confidence += 30; }
  else if (textLower.includes('fifa')) { sport = 'FIFA'; confidence += 30; }
  
  // Fantasy Sports - Check FIRST before other sports
  else if (textLower.includes('fantasy') && (textLower.includes('football') || textLower.includes('nfl'))) { sport = 'Fantasy Football'; confidence += 35; }
  else if (textLower.includes('fantasy') && (textLower.includes('basketball') || textLower.includes('nba'))) { sport = 'Fantasy Basketball'; confidence += 35; }
  else if (textLower.includes('fantasy') && (textLower.includes('baseball') || textLower.includes('mlb'))) { sport = 'Fantasy Baseball'; confidence += 35; }
  else if (textLower.includes('fantasy') && textLower.includes('soccer')) { sport = 'Fantasy Soccer'; confidence += 35; }
  else if (textLower.includes('fantasy') && textLower.includes('hockey')) { sport = 'Fantasy Hockey'; confidence += 35; }
  else if (textLower.includes('fantasy')) { sport = 'Fantasy Sports'; confidence += 30; }
  
  // Professional/Academic
  else if (textLower.includes('hackathon') || textLower.includes('coding')) { sport = 'Hackathon'; confidence += 30; }
  else if (textLower.includes('spelling bee')) { sport = 'Spelling Bee'; confidence += 30; }
  else if (textLower.includes('math bowl')) { sport = 'Math Bowl'; confidence += 30; }
  else if (textLower.includes('debate')) { sport = 'Debate Tournament'; confidence += 30; }
  else if (textLower.includes('business case')) { sport = 'Business Case Competition'; confidence += 30; }
  
  // Creative Arts
  else if (textLower.includes('dance')) { sport = 'Dance Competition'; confidence += 30; }
  else if (textLower.includes('art')) { sport = 'Art Competition'; confidence += 30; }
  else if (textLower.includes('music')) { sport = 'Music Competition'; confidence += 30; }
  else if (textLower.includes('photography')) { sport = 'Photography Contest'; confidence += 30; }
  
  // Culinary
  else if (textLower.includes('cooking') || textLower.includes('culinary')) { sport = 'Cooking Competition'; confidence += 30; }
  else if (textLower.includes('baking')) { sport = 'Baking Contest'; confidence += 30; }
  else if (textLower.includes('bbq') || textLower.includes('barbecue')) { sport = 'BBQ Competition'; confidence += 30; }
  else if (textLower.includes('mixology') || textLower.includes('cocktail')) { sport = 'Mixology Contest'; confidence += 30; }

  // Enhanced format detection
  let format = 'bracket';
  
  // Multi-stage tournament detection - check FIRST before sport defaults
  if ((textLower.includes('conference') || textLower.includes('finals')) && (textLower.includes('east') || textLower.includes('west'))) {
    format = 'conference-bracket-to-series';
    confidence += 25;
  }
  // Sport-specific format defaults
  else if (sport === 'Track & Field' || sport === 'Swimming & Diving' || sport === 'Golf' || sport === 'Cross Country' || sport.includes('Swimming')) {
    format = 'leaderboard';
    confidence += 20;
  }
  else if (textLower.includes('seasonal') || textLower.includes('mid season') || textLower.includes('rankings') || textLower.includes('standings') ||
           textLower.includes('athletic director') || textLower.includes('school year') || textLower.includes('entire year') ||
           textLower.includes('multi-month') || textLower.includes('season long') || textLower.includes('year-round') ||
           (textLower.includes('district') && (textLower.includes('director') || textLower.includes('coordinator')))) {
    format = 'seasonal-leaderboard';
    confidence += 20;
  }
  else if (textLower.includes('world series') || textLower.includes('championship series')) {
    format = 'series';
    confidence += 20;
  }
  else if (textLower.includes('fantasy') && textLower.includes('knockout')) {
    format = 'fantasy-knockout';
    confidence += 25;
  }
  else if (textLower.includes('fantasy') && (textLower.includes('performance') || textLower.includes('player'))) {
    format = 'fantasy-performance';
    confidence += 25;
  }
  else if (sport.includes('Fantasy')) {
    format = textLower.includes('knockout') ? 'fantasy-knockout' : 'fantasy-performance';
    confidence += 15;
  }
  // Override with specific keywords
  else if (textLower.includes('leaderboard') || textLower.includes('ranking') || textLower.includes('time trial') || textLower.includes('scoring event')) {
    format = 'leaderboard';
    confidence += 15;
  }
  else if (textLower.includes('series') || textLower.includes('best of') || textLower.includes('match series')) {
    format = 'series';
    confidence += 15;
  }
  else if (textLower.includes('playoff') || textLower.includes('championship') || textLower.includes('finals')) {
    format = 'bracket-to-series';
    confidence += 15;
  }
  else if (textLower.includes('elimination') || textLower.includes('knockout') || textLower.includes('bracket')) {
    format = 'bracket';
    confidence += 10;
  }
  else if (textLower.includes('round robin') || textLower.includes('league play')) {
    format = 'leaderboard';
    confidence += 15;
  }

  // Age group detection
  let age_group = 'All Ages';
  if (textLower.includes('elementary') || textLower.includes('grade school')) {
    age_group = 'Elementary';
    confidence += 15;
  }
  else if (textLower.includes('middle school') || textLower.includes('junior high')) {
    age_group = 'Middle School';
    confidence += 15;
  }
  else if (textLower.includes('high school') || textLower.includes('varsity') || textLower.includes('jv')) {
    age_group = 'High School';
    confidence += 15;
  }
  else if (textLower.includes('college') || textLower.includes('university')) {
    age_group = 'College';
    confidence += 15;
  }
  else if (textLower.includes('adult') || textLower.includes('open')) {
    age_group = 'Adult';
    confidence += 15;
  }
  else if (textLower.includes('masters') || textLower.includes('35+')) {
    age_group = 'Masters';
    confidence += 15;
  }
  else if (textLower.includes('senior') || textLower.includes('50+')) {
    age_group = 'Senior';
    confidence += 15;
  }

  // Gender division detection
  let gender_division = 'Mixed';
  if (textLower.includes('men\'s') || textLower.includes('mens') || (textLower.includes('male') && !textLower.includes('female'))) {
    gender_division = 'Men';
    confidence += 15;
  }
  else if (textLower.includes('women\'s') || textLower.includes('womens') || (textLower.includes('female') && !textLower.includes('male'))) {
    gender_division = 'Women';
    confidence += 15;
  }
  else if (textLower.includes('boys') || (textLower.includes('boy') && age_group.includes('School'))) {
    gender_division = 'Boys';
    confidence += 15;
  }
  else if (textLower.includes('girls') || (textLower.includes('girl') && age_group.includes('School'))) {
    gender_division = 'Girls';
    confidence += 15;
  }
  else if (textLower.includes('co-ed') || textLower.includes('coed')) {
    gender_division = 'Co-Ed';
    confidence += 15;
  }

  // Generate AI recommendation based on request type
  let recommendation = '';
  
  if (isWebpageRequest) {
    if (confidence >= 60) {
      recommendation = `I can help you create a custom tournament webpage for your ${sport} tournament! Based on your Champions for Change subscription level, I can provide:

**Tier 1 (Free)**: Tournament consultation and strategic planning
**Tier 2 (Basic+)**: Auto-generated tournament bracket and registration system  
**Tier 3 (Pro+)**: Complete custom webpage with domain, branding, and full tournament management

Your webpage will include Champions for Change branding, educational impact tracking, and integrated payment processing for $2,600 student trip funding. What specific features would you like included?`;
    } else {
      recommendation = `I'd love to help you build a custom tournament webpage! To create the perfect site for your tournament, please tell me:

1. What sport/activity is this for?
2. How many participants/teams do you expect?
3. What age group are you targeting?
4. Any specific features you need (registration, brackets, live scoring)?

I'll then generate a complete webpage with Champions for Change branding and educational impact integration.`;
    }
  } else {
    recommendation = `I recommend creating a ${format} tournament for ${sport}`;
    
    if (age_group !== 'All Ages' || gender_division !== 'Mixed') {
      recommendation += ` with ${gender_division} ${age_group} divisions`;
    }
    
    // Add format-specific advice
    if (format === 'leaderboard') {
      recommendation += '. This individual performance format works great for timed events, scoring competitions, and skill demonstrations.';
    } else if (format === 'seasonal-leaderboard') {
      recommendation += '. Seasonal rankings track team performance over time, perfect for college football standings and playoff seeding.';
    } else if (format === 'conference-bracket-to-series') {
      recommendation += '. Conference-based playoffs (East/West) leading to championship series mirrors professional sports like NBA Finals.';
    } else if (format === 'series') {
      recommendation += '. Best-of series format ensures the better team wins and creates exciting multi-game matchups, perfect for World Series-style competition.';
    } else if (format === 'bracket-to-series') {
      recommendation += '. Bracket elimination leading to championship series combines the excitement of playoffs with decisive final competition.';
    } else {
      recommendation += '. Single or double elimination brackets create clear head-to-head competition with definitive winners.';
    }
  }

  // Add sport-specific and division advice
  if (sport.includes('Track & Field') || sport.includes('Swimming')) {
    recommendation += ' Consider separate gender divisions to maintain fair competition and official records.';
  }
  
  if (age_group === 'High School' || age_group === 'Middle School') {
    recommendation += ' School tournaments may need JV and Varsity divisions based on grade levels.';
  }
  
  if (sport.includes('Basketball') && format === 'bracket-to-series') {
    recommendation += ' Professional-style bracket leading to championship series creates exciting playoff atmosphere.';
  }
  
  if (sport.includes('Esports') || sport.includes('Gaming')) {
    recommendation += ' Consider online qualifiers and live finals for maximum participation.';
  }
  
  if (sport.includes('Golf') && format === 'leaderboard') {
    recommendation += ' Stroke play format ensures the most skilled player wins based on total score.';
  }
  
  // Enterprise deployment and viral surge scale considerations
  if (textLower.includes('state') || textLower.includes('million') || textLower.includes('viewers') || textLower.includes('logging in')) {
    recommendation += ' For enterprise deployment across multiple states with millions of viewers, Champions for Change provides white-label solutions with dedicated CDN infrastructure, real-time score streaming, and scalable user management.';
  }
  
  if (textLower.includes('new users') || textLower.includes('sign up') || textLower.includes('tv ad') || textLower.includes('surge') || textLower.includes('6000') || textLower.includes('6,000')) {
    recommendation += ' For viral signup surges driven by TV advertising, Champions for Change implements auto-scaling infrastructure to handle 6,000+ simultaneous registrations across all subscription tiers, ensuring seamless onboarding during peak nonprofit visibility moments.';
  }

  // Determine estimated participants based on sport and age group
  const estimated_participants = getEstimatedParticipants(sport, age_group, format, text);
  
  // Generate tier-specific content
  const tier1_suggestions = generateTier1Suggestions(sport, format, age_group, gender_division, text);
  const tier2_structure = format !== 'bracket' ? generateTournamentStructure(sport, format, estimated_participants, age_group, gender_division) : null;
  const tier3_webpage_template = generateWebpageTemplate(sport, age_group, format);
  const venue_suggestions = generateVenueSuggestions(sport, age_group);
  const schedule_template = generateScheduleTemplate(sport, format, estimated_participants);

  return {
    tier: 'consultation', // This will be overridden by the endpoint based on user subscription
    sport,
    format,
    age_group,
    gender_division,
    confidence: Math.min(confidence, 95),
    recommendation,
    tier1_suggestions,
    tier2_structure,
    tier3_webpage_template,
    estimated_participants,
    venue_suggestions,
    schedule_template
  };
}