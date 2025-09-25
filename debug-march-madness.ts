/**
 * Debug script to examine March Madness bracket generation in detail
 */
import { BracketGenerator } from './server/utils/bracket-generator';

console.log("🔍 DEBUGGING MARCH MADNESS BRACKET GENERATION\n");

// Generate 68 teams for March Madness
const teams = Array.from({ length: 68 }, (_, i) => `Team ${i + 1}`);

console.log(`📊 Input: ${teams.length} teams`);

try {
  // Generate the bracket and capture detailed information
  const bracket = BracketGenerator.buildMarchMadnessBracket(teams, "debug-tournament");
  
  console.log(`\n🏆 BRACKET RESULTS:`);
  console.log(`   Total matches: ${bracket.matches.length}`);
  console.log(`   Expected matches: 67`);
  console.log(`   Match difference: ${67 - bracket.matches.length}`);
  console.log(`   Total rounds: ${bracket.totalRounds}`);
  console.log(`   Format: ${bracket.format}`);
  
  // Analyze match breakdown
  console.log(`\n📈 MATCH BREAKDOWN:`);
  console.log(`   First Four matches: ${bracket.firstFourMatches.length}`);
  console.log(`   Regional bracket matches: ${bracket.regionalBrackets.reduce((sum, rb) => sum + rb.matches.length, 0)}`);
  console.log(`   Final Four matches: ${bracket.finalFourMatches.length}`);
  console.log(`   Championship matches: 1`);
  
  const totalCalculated = bracket.firstFourMatches.length + 
                         bracket.regionalBrackets.reduce((sum, rb) => sum + rb.matches.length, 0) + 
                         bracket.finalFourMatches.length + 1;
  console.log(`   Calculated total: ${totalCalculated}`);
  
  // Analyze team distribution
  console.log(`\n👥 TEAM ANALYSIS:`);
  console.log(`   Total teams: ${bracket.allTeams.length}`);
  console.log(`   First Four teams: ${bracket.allTeams.filter(t => t.isFirstFourTeam).length}`);
  console.log(`   Regular teams: ${bracket.allTeams.filter(t => !t.isFirstFourTeam).length}`);
  
  // Analyze First Four teams by seed
  const firstFourTeams = bracket.allTeams.filter(t => t.isFirstFourTeam);
  const sixteenSeeds = firstFourTeams.filter(t => t.seed === 16);
  const elevenSeeds = firstFourTeams.filter(t => t.seed === 11);
  
  console.log(`\n🎲 FIRST FOUR TEAMS BY SEED:`);
  console.log(`   16-seed teams: ${sixteenSeeds.length}`);
  console.log(`   11-seed teams: ${elevenSeeds.length}`);
  
  sixteenSeeds.forEach((team, i) => {
    console.log(`     16-seed ${i+1}: ${team.name} (${team.firstFourSlot})`);
  });
  
  elevenSeeds.forEach((team, i) => {
    console.log(`     11-seed ${i+1}: ${team.name} (${team.firstFourSlot})`);
  });
  
  // Analyze regional distribution
  console.log(`\n🗺️  REGIONAL DISTRIBUTION:`);
  bracket.regionalBrackets.forEach(rb => {
    console.log(`   ${rb.region}: ${rb.teams.length} teams, ${rb.matches.length} matches`);
  });
  
  // Detail First Four matches
  console.log(`\n🎯 FIRST FOUR MATCHES:`);
  bracket.firstFourMatches.forEach((match, i) => {
    console.log(`   ${i+1}. ${match.id}: ${match.team1} vs ${match.team2} (${match.region}, Seeds ${match.seed1} vs ${match.seed2})`);
  });
  
  // Expected match breakdown for 68-team March Madness:
  // 4 First Four + 32 Round of 64 + 16 Round of 32 + 8 Sweet 16 + 4 Elite 8 + 2 Final Four + 1 Championship = 67
  console.log(`\n🧮 EXPECTED MARCH MADNESS BREAKDOWN:`);
  console.log(`   First Four: 4 matches`);
  console.log(`   Round of 64: 32 matches (64 teams → 32 winners)`);
  console.log(`   Round of 32: 16 matches (32 teams → 16 winners)`);
  console.log(`   Sweet 16: 8 matches (16 teams → 8 winners)`);
  console.log(`   Elite 8: 4 matches (8 teams → 4 winners)`);
  console.log(`   Final Four: 2 matches (4 teams → 2 winners)`);
  console.log(`   Championship: 1 match (2 teams → 1 winner)`);
  console.log(`   TOTAL: 67 matches`);
  
} catch (error: any) {
  console.error(`❌ Error: ${error.message}`);
  console.error(error.stack);
}