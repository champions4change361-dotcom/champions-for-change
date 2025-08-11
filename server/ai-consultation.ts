// AI Consultation System for Tournament Platform
export function analyzeTournamentQuery(text: string) {
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
  if (textLower.includes('leaderboard') || textLower.includes('ranking') || textLower.includes('time trial') || textLower.includes('scoring event')) {
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

  return {
    sport,
    format,
    age_group,
    gender_division,
    confidence: Math.min(confidence, 95),
    recommendation
  };
}