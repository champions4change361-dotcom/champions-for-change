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
function generateTier1Suggestions(sport: string, format: string, ageGroup: string, genderDivision: string): string[] {
  const suggestions = [];
  
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
  
  // Format-specific advice
  if (format === 'bracket') {
    suggestions.push("Seed teams based on recent performance data");
    suggestions.push("Plan bye rounds strategically for balanced competition");
  } else if (format === 'leaderboard') {
    suggestions.push("Consider multiple scoring categories for comprehensive ranking");
    suggestions.push("Plan real-time score updates for spectator engagement");
  }
  
  // Champions for Change specific suggestions
  suggestions.push("Partner with local educational tour companies for trip planning");
  suggestions.push("Create fundraising opportunities during tournament breaks");
  suggestions.push("Highlight student success stories from previous funded trips");
  
  return suggestions;
}

function getEstimatedParticipants(sport: string, ageGroup: string, format: string): number {
  let base = 16; // Default tournament size
  
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
  
  // Corpus Christi specific venues for Champions for Change
  if (ageGroup === 'Middle School' || ageGroup === 'High School') {
    venues.push("Robert Driscoll Middle School (Champions for Change home base)");
    venues.push("Corpus Christi ISD athletic facilities");
    venues.push("Texas A&M University-Corpus Christi facilities");
  }
  
  return venues;
}

function generateScheduleTemplate(sport: string, format: string, participants: number): any {
  const template = {
    duration_days: 1,
    sessions: [],
    breaks: [],
    ceremonies: []
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

function generateWebpageTemplate(sport: string, ageGroup: string, format: string): string {
  return `
    <tournament-webpage theme="champions-for-change">
      <header>
        <title>${sport} ${ageGroup} ${format.charAt(0).toUpperCase() + format.slice(1)} Tournament</title>
        <subtitle>Supporting Educational Opportunities for Corpus Christi Youth</subtitle>
      </header>
      
      <hero-section>
        <championship-banner sport="${sport}" />
        <mission-statement>
          Every tournament entry helps fund $2,600+ educational trips for underprivileged students
        </mission-statement>
      </hero-section>
      
      <tournament-info>
        <format>${format}</format>
        <age-group>${ageGroup}</age-group>
        <registration-status>Open</registration-status>
      </tournament-info>
      
      <live-updates-section>
        <bracket-display format="${format}" />
        <leaderboard-display />
        <live-scoring />
      </live-updates-section>
      
      <impact-tracker>
        <students-funded-counter />
        <next-trip-goal />
        <success-stories />
      </impact-tracker>
      
      <footer>
        <champions-for-change-branding />
        <contact-info>Daniel Thornton: Champions4change361@gmail.com</contact-info>
      </footer>
    </tournament-webpage>
  `;
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

export function analyzeTournamentQuery(text: string): KeystoneConsultationResult {
  const textLower = text.toLowerCase();
  
  // Sport detection with comprehensive list
  let sport = 'Basketball'; // default
  let confidence = 40; // Lower base confidence
  
  // Team Sports - Enhanced detection
  if (textLower.includes('basketball') || textLower.includes('hoops')) { 
    sport = 'Basketball'; confidence += 35; 
    if (textLower.includes('nba') || textLower.includes('college basketball')) confidence += 10;
  }
  else if (textLower.includes('soccer') || textLower.includes('football') && !textLower.includes('american')) { 
    sport = 'Soccer'; confidence += 35; 
    if (textLower.includes('fifa') || textLower.includes('world cup')) confidence += 10;
  }
  else if (textLower.includes('volleyball') || textLower.includes('vball')) { 
    sport = 'Volleyball'; confidence += 35; 
  }
  else if (textLower.includes('baseball') || textLower.includes('mlb')) { 
    sport = 'Baseball'; confidence += 35; 
  }
  else if (textLower.includes('softball')) { 
    sport = 'Softball'; confidence += 35; 
  }
  else if (textLower.includes('hockey') || textLower.includes('nhl')) { 
    sport = 'Ice Hockey'; confidence += 35; 
  }
  
  // Individual Sports - Enhanced detection
  else if (textLower.includes('swimming') || textLower.includes('swim meet') || textLower.includes('aquatic')) { 
    sport = 'Swimming'; confidence += 35; 
    if (textLower.includes('olympics') || textLower.includes('freestyle') || textLower.includes('backstroke')) confidence += 10;
  }
  else if (textLower.includes('track') || textLower.includes('field') || textLower.includes('running') || textLower.includes('athletics')) { 
    sport = 'Track & Field'; confidence += 35; 
    if (textLower.includes('sprint') || textLower.includes('distance') || textLower.includes('hurdles')) confidence += 10;
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
  
  // Sport-specific format defaults
  if (sport === 'Track & Field' || sport === 'Swimming & Diving' || sport === 'Golf' || sport === 'Cross Country') {
    format = 'leaderboard';
    confidence += 20;
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

  // Generate AI recommendation
  let recommendation = `I recommend creating a ${format} tournament for ${sport}`;
  
  if (age_group !== 'All Ages' || gender_division !== 'Mixed') {
    recommendation += ` with ${gender_division} ${age_group} divisions`;
  }
  
  // Add format-specific advice
  if (format === 'leaderboard') {
    recommendation += '. This individual performance format works great for timed events, scoring competitions, and skill demonstrations.';
  } else if (format === 'series') {
    recommendation += '. Best-of series format ensures the better team wins and creates exciting multi-game matchups.';
  } else if (format === 'bracket-to-series') {
    recommendation += '. Bracket elimination leading to championship series combines the excitement of playoffs with decisive final competition.';
  } else {
    recommendation += '. Single or double elimination brackets create clear head-to-head competition with definitive winners.';
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

  // Determine estimated participants based on sport and age group
  const estimated_participants = getEstimatedParticipants(sport, age_group, format);
  
  // Generate tier-specific content
  const tier1_suggestions = generateTier1Suggestions(sport, format, age_group, gender_division);
  const tier2_structure = format !== 'bracket' ? generateTournamentStructure(sport, format, estimated_participants, age_group, gender_division) : null;
  const tier3_webpage_template = generateWebpageTemplate(sport, age_group, format);
  const venue_suggestions = generateVenueSuggestions(sport, age_group);
  const schedule_template = generateScheduleTemplate(sport, format, estimated_participants);

  return {
    tier: 'consultation', // Default tier - can be upgraded based on subscription
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