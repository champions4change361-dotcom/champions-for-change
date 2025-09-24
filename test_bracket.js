
console.log('Testing bracket generation debug...');
const teams = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6', 'Team 7', 'Team 8',
               'Team 9', 'Team 10', 'Team 11', 'Team 12', 'Team 13', 'Team 14', 'Team 15', 'Team 16'];
               
// Test with 16 teams first to see structure
console.log('Teams for 16-team test:', teams.length);
console.log('Testing double elimination structure...');
console.log('Expected: 16 teams = 15 winners matches, fewer losers matches');

// Now test direct bracket generation logic
const winnersRounds = Math.ceil(Math.log2(teams.length));
console.log('Winners rounds calculated:', winnersRounds);

let totalWinnersMatches = 0;
let currentTeamCount = teams.length;
for (let round = 1; round <= winnersRounds; round++) {
  const matchesInRound = Math.floor(currentTeamCount / 2);
  totalWinnersMatches += matchesInRound;
  console.log(`Round ${round}: ${matchesInRound} matches (${currentTeamCount} -> ${matchesInRound} winners)`);
  currentTeamCount = matchesInRound;
}
console.log('Total winners matches:', totalWinnersMatches);

