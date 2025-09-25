/**
 * Debug script to examine 64-team Double Elimination bracket generation
 */
import { BracketGenerator } from './server/utils/bracket-generator';

console.log("🔍 DEBUGGING 64-TEAM DOUBLE ELIMINATION\n");

// Generate 64 teams
const teams = Array.from({ length: 64 }, (_, i) => `Team ${i + 1}`);

console.log(`📊 Input: ${teams.length} teams`);

try {
  // Generate the bracket
  const bracket = BracketGenerator.buildDoubleElim64(teams, "debug-tournament");
  
  console.log(`\n🏆 BRACKET RESULTS:`);
  console.log(`   Total matches: ${bracket.matches.length}`);
  console.log(`   Expected matches: 126`);
  console.log(`   Match difference: ${126 - bracket.matches.length}`);
  console.log(`   Total rounds: ${bracket.totalRounds}`);
  console.log(`   Format: ${bracket.format}`);
  
  // Analyze match breakdown
  console.log(`\n📈 MATCH BREAKDOWN:`);
  console.log(`   Winners bracket matches: ${bracket.winnersMatches.length}`);
  console.log(`   Losers bracket matches: ${bracket.losersMatches.length}`);
  console.log(`   Championship matches: ${bracket.championshipMatches.length}`);
  
  const totalCalculated = bracket.winnersMatches.length + 
                         bracket.losersMatches.length + 
                         bracket.championshipMatches.length;
  console.log(`   Calculated total: ${totalCalculated}`);
  
  // Analyze winners bracket (should be standard single elimination)
  console.log(`\n🏆 WINNERS BRACKET ANALYSIS:`);
  const winnersByRound = {};
  bracket.winnersMatches.forEach(match => {
    if (!winnersByRound[match.round]) winnersByRound[match.round] = 0;
    winnersByRound[match.round]++;
  });
  
  Object.entries(winnersByRound).forEach(([round, count]) => {
    console.log(`   Round ${round}: ${count} matches`);
  });
  
  // Analyze losers bracket
  console.log(`\n💀 LOSERS BRACKET ANALYSIS:`);
  const losersByRound = {};
  bracket.losersMatches.forEach(match => {
    if (!losersByRound[match.round]) losersByRound[match.round] = 0;
    losersByRound[match.round]++;
  });
  
  Object.entries(losersByRound).forEach(([round, count]) => {
    console.log(`   Losers Round ${round}: ${count} matches`);
  });
  
  // Analyze championship
  console.log(`\n🏅 CHAMPIONSHIP ANALYSIS:`);
  bracket.championshipMatches.forEach((match, i) => {
    console.log(`   ${i+1}. ${match.id} (Round ${match.round})`);
  });
  
  // Expected breakdown for 64-team double elimination
  console.log(`\n🧮 EXPECTED 64-TEAM DOUBLE ELIMINATION BREAKDOWN:`);
  console.log(`   Winners bracket: 63 matches (64→32→16→8→4→2→1)`);
  console.log(`   Losers bracket: 62 matches`);
  console.log(`     - L1-L2: Handle R1 & R2 losers`);
  console.log(`     - L3-L4: Handle R3 losers`);
  console.log(`     - L5-L6: Handle R4 losers`);
  console.log(`     - L7-L8: Handle R5 losers`);
  console.log(`     - L9-L10: Handle R6 losers`);
  console.log(`     - L11: Final`);
  console.log(`   Championship: 1-2 matches (reset if needed)`);
  console.log(`   TOTAL: 126 matches`);
  
  // Check for potential issues
  if (bracket.winnersMatches.length !== 63) {
    console.log(`\n❌ WINNERS BRACKET ERROR: Expected 63 matches, got ${bracket.winnersMatches.length}`);
  }
  
  if (bracket.losersMatches.length < 60) {
    console.log(`\n❌ LOSERS BRACKET ERROR: Expected ~62 matches, got ${bracket.losersMatches.length}`);
    console.log(`   Missing approximately ${62 - bracket.losersMatches.length} losers bracket matches`);
  }
  
} catch (error: any) {
  console.error(`❌ Error: ${error.message}`);
  console.error(error.stack);
}