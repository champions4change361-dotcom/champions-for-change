/**
 * Comprehensive test script for validating complex tournament formats
 * with the new TournamentConfig system
 */
import { type TournamentConfig, tournamentConfigSchema } from './shared/schema';

// Test data for complex tournament formats
const testConfigs = {
  marchMadness: {
    meta: {
      name: "March Madness Test Tournament",
      participantType: "team" as const,
      participantCount: 68,
      teamSize: 12
    },
    divisions: [{
      name: "Division I Men's Basketball",
      eligibility: {
        ageBand: { min: 18, max: 23 }
      },
      genderPolicy: "male" as const
    }],
    stages: [{
      engine: "single" as const,
      size: 68,
      thirdPlace: false
    }],
    seeding: {
      method: "manual" as const
    }
  } satisfies TournamentConfig,

  doubleElim64: {
    meta: {
      name: "64-Team Double Elimination",
      participantType: "team" as const,
      participantCount: 64,
      teamSize: 8
    },
    divisions: [{
      name: "Open Division",
      eligibility: {},
      genderPolicy: "open" as const
    }],
    stages: [{
      engine: "double" as const,
      size: 64,
      finals: "if_necessary" as const,
      minGamesGuaranteed: 2
    }],
    seeding: {
      method: "random" as const
    }
  } satisfies TournamentConfig,

  largeSingleElim: {
    meta: {
      name: "128-Team Single Elimination",
      participantType: "team" as const,
      participantCount: 128,
      teamSize: 5
    },
    divisions: [{
      name: "Main Division",
      eligibility: {},
      genderPolicy: "open" as const
    }],
    stages: [{
      engine: "single" as const,
      size: 128,
      thirdPlace: false
    }],
    seeding: {
      method: "random" as const
    }
  } satisfies TournamentConfig,

  swissSystem: {
    meta: {
      name: "50-Player Swiss System",
      participantType: "individual" as const,
      participantCount: 50
    },
    divisions: [{
      name: "Open Section",
      eligibility: {},
      genderPolicy: "open" as const
    }],
    stages: [{
      engine: "swiss" as const,
      rounds: 7,
      pairing: "seed" as const,
      tiebreakers: ["head-to-head", "tie-break-score", "sonneborn-berger"]
    }],
    seeding: {
      method: "rating" as const,
      ratingField: "elo"
    }
  } satisfies TournamentConfig
};

// Generate test participants
function generateParticipants(count: number, prefix: string = "Team"): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`);
}

// Expected match calculations for validation
const expectedMatches = {
  marchMadness: 67, // 4 First Four + 32 R64 + 16 R32 + 8 Sweet16 + 4 Elite8 + 2 Final4 + 1 Championship
  doubleElim64: 126, // 63 winners bracket + 62 losers bracket + 1 grand final
  singleElim128: 127, // n-1 matches for n teams
  singleElim4: 3, // Simple 4-team bracket should have 3 matches (2 semis + 1 final)
  swissSystem: 175 // 50 players, 7 rounds = (50/2) * 7 = 175 pairings
};

// Test configuration validation
console.log("🔍 Testing TournamentConfig Schema Validation...\n");

for (const [name, config] of Object.entries(testConfigs)) {
  try {
    const validated = tournamentConfigSchema.parse(config);
    console.log(`✅ ${name}: Configuration valid`);
    console.log(`   Participants: ${config.meta.participantCount}`);
    console.log(`   Engine: ${config.stages[0].engine}`);
    console.log(`   Expected matches: ${expectedMatches[name as keyof typeof expectedMatches] || 'TBD'}\n`);
  } catch (error: any) {
    console.error(`❌ ${name}: Configuration invalid`);
    console.error(`   Error: ${error.message}\n`);
  }
}

// Test basic math validation for single elimination
console.log("🧮 Testing Single Elimination Math...\n");

function calculateSingleElimMatches(teams: number): number {
  return teams - 1; // Mathematical formula: n teams = n-1 matches
}

const testSizes = [4, 8, 16, 32, 64, 68, 128];
for (const size of testSizes) {
  const expected = calculateSingleElimMatches(size);
  console.log(`${size} teams → ${expected} matches`);
}

console.log("\n🎯 Ready to test with actual bracket generation...");

// Export for use in other files
export { testConfigs, generateParticipants, expectedMatches };