/**
 * Test actual bracket generation to identify math errors
 */
import { BracketGenerator } from './server/utils/bracket-generator';

console.log("🧮 Testing Single Elimination Bracket Generation...\n");

// Test with 4 teams - should generate 3 matches
const fourTeams = ["Team A", "Team B", "Team C", "Team D"];
console.log("Testing 4 teams:");
try {
  const bracket = BracketGenerator.generateSingleElimination(fourTeams, "test-tournament");
  console.log(`- Teams: ${fourTeams.length}`);
  console.log(`- Expected matches: ${fourTeams.length - 1} (n-1 formula)`);
  console.log(`- Actual matches: ${bracket.matches.length}`);
  console.log(`- Total rounds: ${bracket.totalRounds}`);
  console.log(`- Math correct: ${bracket.matches.length === fourTeams.length - 1 ? '✅' : '❌'}`);
  
  if (bracket.matches.length !== fourTeams.length - 1) {
    console.log("❌ MATH ERROR DETECTED!");
    console.log("Match details:");
    bracket.matches.forEach((match, i) => {
      console.log(`  ${i+1}. Round ${match.round}: ${match.team1} vs ${match.team2}`);
    });
  }
} catch (error: any) {
  console.error(`❌ Error: ${error.message}`);
}

console.log("\n" + "=".repeat(50) + "\n");

// Test with 8 teams - should generate 7 matches
const eightTeams = Array.from({length: 8}, (_, i) => `Team ${i + 1}`);
console.log("Testing 8 teams:");
try {
  const bracket = BracketGenerator.generateSingleElimination(eightTeams, "test-tournament");
  console.log(`- Teams: ${eightTeams.length}`);
  console.log(`- Expected matches: ${eightTeams.length - 1} (n-1 formula)`);
  console.log(`- Actual matches: ${bracket.matches.length}`);
  console.log(`- Total rounds: ${bracket.totalRounds}`);
  console.log(`- Math correct: ${bracket.matches.length === eightTeams.length - 1 ? '✅' : '❌'}`);
  
  if (bracket.matches.length !== eightTeams.length - 1) {
    console.log("❌ MATH ERROR DETECTED!");
    console.log("Match details:");
    bracket.matches.forEach((match, i) => {
      console.log(`  ${i+1}. Round ${match.round}: ${match.team1} vs ${match.team2}`);
    });
  }
} catch (error: any) {
  console.error(`❌ Error: ${error.message}`);
}

console.log("\n" + "=".repeat(50) + "\n");

// Test edge cases
console.log("Testing edge cases:");

// 1 team
try {
  const oneTeam = ["Solo Team"];
  const bracket = BracketGenerator.generateSingleElimination(oneTeam, "test");
  console.log(`- 1 team: ${bracket.matches.length} matches (expected: 0)`);
} catch (error: any) {
  console.log(`- 1 team: Error - ${error.message}`);
}

// 2 teams
try {
  const twoTeams = ["Team A", "Team B"];
  const bracket = BracketGenerator.generateSingleElimination(twoTeams, "test");
  console.log(`- 2 teams: ${bracket.matches.length} matches (expected: 1)`);
} catch (error: any) {
  console.log(`- 2 teams: Error - ${error.message}`);
}

// 3 teams
try {
  const threeTeams = ["Team A", "Team B", "Team C"];
  const bracket = BracketGenerator.generateSingleElimination(threeTeams, "test");
  console.log(`- 3 teams: ${bracket.matches.length} matches (expected: 2)`);
} catch (error: any) {
  console.log(`- 3 teams: Error - ${error.message}`);
}