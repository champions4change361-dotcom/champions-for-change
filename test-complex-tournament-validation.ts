/**
 * Comprehensive validation test for complex tournament formats
 * Tests the complete TournamentConfig system with actual bracket generation
 */
import { BracketGenerator } from './server/utils/bracket-generator';
import { type TournamentConfig, tournamentConfigSchema } from './shared/schema';

// Complex tournament configurations
const complexTournamentConfigs = {
  marchMadness68: {
    meta: {
      name: "March Madness 68-Team Tournament",
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

  largeSingleElim128: {
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

  largeSingleElim256: {
    meta: {
      name: "256-Team Single Elimination",
      participantType: "team" as const,
      participantCount: 256,
      teamSize: 5
    },
    divisions: [{
      name: "Main Division",
      eligibility: {},
      genderPolicy: "open" as const
    }],
    stages: [{
      engine: "single" as const,
      size: 256,
      thirdPlace: false
    }],
    seeding: {
      method: "random" as const
    }
  } satisfies TournamentConfig,

  swissSystem50: {
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
  } satisfies TournamentConfig,

  swissSystem100: {
    meta: {
      name: "100-Player Swiss System",
      participantType: "individual" as const,
      participantCount: 100
    },
    divisions: [{
      name: "Open Section",
      eligibility: {},
      genderPolicy: "open" as const
    }],
    stages: [{
      engine: "swiss" as const,
      rounds: 8,
      pairing: "seed" as const,
      tiebreakers: ["head-to-head", "tie-break-score", "sonneborn-berger"]
    }],
    seeding: {
      method: "rating" as const,
      ratingField: "elo"
    }
  } satisfies TournamentConfig
};

// Expected mathematical results for validation
const expectedResults = {
  marchMadness68: { matches: 67, rounds: 7 },
  doubleElim64: { matches: 126, rounds: 12 }, // 63 winners + 62 losers + 1 grand final
  largeSingleElim128: { matches: 127, rounds: 7 },
  largeSingleElim256: { matches: 255, rounds: 8 },
  swissSystem50: { matches: 175, rounds: 7 }, // 50/2 * 7 = 175 pairings
  swissSystem100: { matches: 400, rounds: 8 } // 100/2 * 8 = 400 pairings
};

function generateParticipants(count: number, prefix: string = "Team"): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix} ${i + 1}`);
}

function testComplexTournament(
  name: string, 
  config: TournamentConfig, 
  expected: { matches: number; rounds: number },
  useSpecializedFormat: boolean = false
) {
  console.log(`\n🏆 Testing ${name}:`);
  console.log(`   Expected: ${expected.matches} matches, ${expected.rounds} rounds`);
  
  try {
    // 1. Validate TournamentConfig
    const validatedConfig = tournamentConfigSchema.parse(config);
    console.log(`   ✅ Config validation: PASSED`);
    
    // 2. Generate participants
    const participantCount = config.meta.participantCount || 0;
    const participants = generateParticipants(participantCount, config.meta.participantType === 'individual' ? 'Player' : 'Team');
    
    // 3. Test bracket generation
    const startTime = Date.now();
    
    let bracket;
    if (useSpecializedFormat) {
      // Use specialized March Madness format
      bracket = BracketGenerator.generateFromConfig(
        validatedConfig,
        participants,
        `test-${name.toLowerCase().replace(/\s+/g, '-')}`,
        { formatConfig: { tournamentType: 'march-madness' } }
      );
    } else {
      // Use standard config-driven generation
      bracket = BracketGenerator.generateFromConfig(
        validatedConfig,
        participants,
        `test-${name.toLowerCase().replace(/\s+/g, '-')}`
      );
    }
    
    const generationTime = Date.now() - startTime;
    
    // 4. Validate results
    const actualMatches = bracket.matches.length;
    const actualRounds = bracket.totalRounds;
    
    const matchesCorrect = actualMatches === expected.matches;
    const roundsCorrect = actualRounds === expected.rounds;
    
    console.log(`   📊 Bracket generation: ${generationTime}ms`);
    console.log(`   🔢 Matches: ${actualMatches} ${matchesCorrect ? '✅' : '❌'} (expected ${expected.matches})`);
    console.log(`   🔄 Rounds: ${actualRounds} ${roundsCorrect ? '✅' : '❌'} (expected ${expected.rounds})`);
    console.log(`   🎯 Format: ${bracket.format}`);
    
    // Performance check
    if (generationTime > 5000) {
      console.log(`   ⚠️  PERFORMANCE WARNING: Generation took ${generationTime}ms (>5s)`);
    } else if (generationTime > 1000) {
      console.log(`   ⏱️  Performance: ${generationTime}ms (acceptable)`);
    } else {
      console.log(`   ⚡ Performance: ${generationTime}ms (excellent)`);
    }
    
    // Mathematical accuracy check
    if (matchesCorrect && roundsCorrect) {
      console.log(`   ✅ OVERALL: PASSED - Mathematical accuracy confirmed`);
      return true;
    } else {
      console.log(`   ❌ OVERALL: FAILED - Mathematical errors detected`);
      return false;
    }
    
  } catch (error: any) {
    console.error(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

// Run comprehensive validation tests
console.log("🚀 COMPLEX TOURNAMENT FORMAT VALIDATION");
console.log("=" .repeat(60));

let passedTests = 0;
let totalTests = 0;

// Test 1: March Madness (68 teams, specialized format)
totalTests++;
if (testComplexTournament(
  "March Madness 68-Team Tournament", 
  complexTournamentConfigs.marchMadness68, 
  expectedResults.marchMadness68,
  true // Use specialized March Madness format
)) {
  passedTests++;
}

// Test 2: 64-Team Double Elimination
totalTests++;
if (testComplexTournament(
  "64-Team Double Elimination", 
  complexTournamentConfigs.doubleElim64, 
  expectedResults.doubleElim64
)) {
  passedTests++;
}

// Test 3: Large Single Elimination (128 teams)
totalTests++;
if (testComplexTournament(
  "128-Team Single Elimination", 
  complexTournamentConfigs.largeSingleElim128, 
  expectedResults.largeSingleElim128
)) {
  passedTests++;
}

// Test 4: Very Large Single Elimination (256 teams)
totalTests++;
if (testComplexTournament(
  "256-Team Single Elimination", 
  complexTournamentConfigs.largeSingleElim256, 
  expectedResults.largeSingleElim256
)) {
  passedTests++;
}

// Test 5: Swiss System (50 players)
totalTests++;
if (testComplexTournament(
  "50-Player Swiss System", 
  complexTournamentConfigs.swissSystem50, 
  expectedResults.swissSystem50
)) {
  passedTests++;
}

// Test 6: Large Swiss System (100 players)
totalTests++;
if (testComplexTournament(
  "100-Player Swiss System", 
  complexTournamentConfigs.swissSystem100, 
  expectedResults.swissSystem100
)) {
  passedTests++;
}

// Summary
console.log("\n" + "=" .repeat(60));
console.log(`📋 VALIDATION SUMMARY: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log("🎉 ALL COMPLEX TOURNAMENT FORMATS VALIDATED SUCCESSFULLY!");
  console.log("✅ TournamentConfig system is working correctly for all formats");
  console.log("✅ Mathematical accuracy confirmed for all bracket types");
  console.log("✅ Performance is acceptable for large tournaments");
} else {
  console.log(`❌ ${totalTests - passedTests} test(s) failed - system needs fixes`);
  console.log("❗ Complex tournament formats have issues that need to be addressed");
}

console.log("\n🔍 TESTING COMPLETE");

export { complexTournamentConfigs, expectedResults };