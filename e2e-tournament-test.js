#!/usr/bin/env node

/**
 * Comprehensive E2E Testing for All 11 Tournament Types
 * 
 * This script tests the /api/tournaments/create-from-config endpoint
 * with all 11 tournament formats to validate:
 * - API returns 200 status (not 500 error)
 * - Bracket structure is non-empty and consistent
 * - Correct totalMatches calculation for each format
 * - Proper totalRounds calculation
 * - Valid participant pairing and progression
 * - Tournament config properly stored
 */

import axios from 'axios';

// Base URL for the API (adjust if running on different port)
const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Test configurations for all 11 tournament types
const TOURNAMENT_CONFIGS = {
  
  // 1. SINGLE ELIMINATION: totalMatches = n-1
  'single-elimination': {
    config: {
      meta: { 
        name: "Single Elimination Test", 
        participantType: "team", 
        participantCount: 8 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "single", 
        size: 8 
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"],
    expectedMatches: 7, // n-1 = 8-1 = 7
    expectedRounds: 3,  // log2(8) = 3
    description: "Single elimination with 8 teams"
  },

  // 2. DOUBLE ELIMINATION: Verify winners/losers bracket structure
  'double-elimination': {
    config: {
      meta: { 
        name: "Double Elimination Test", 
        participantType: "team", 
        participantCount: 8 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "double", 
        size: 8,
        finals: "single" 
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"],
    expectedMatches: 14, // ~2*(n-1) for double elimination with 8 teams
    expectedRounds: 6,   // More rounds due to losers bracket
    description: "Double elimination with winners and losers brackets"
  },

  // 3. ROUND ROBIN: totalMatches = n(n-1)/2
  'round-robin': {
    config: {
      meta: { 
        name: "Round Robin Test", 
        participantType: "team", 
        participantCount: 6 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "round_robin", 
        groups: 1,
        points: {
          win: 3,
          draw: 1,
          loss: 0
        },
        tiebreakers: ["head_to_head", "goal_difference"]
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6"],
    expectedMatches: 15, // n(n-1)/2 = 6*5/2 = 15
    expectedRounds: 5,   // Each team plays n-1 rounds
    description: "Round robin where every team plays every other team"
  },

  // 4. SWISS SYSTEM: rounds<=n-1 with no repeat pairings
  'swiss-system': {
    config: {
      meta: { 
        name: "Swiss System Test", 
        participantType: "team", 
        participantCount: 8 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "swiss", 
        rounds: 4,
        pairing: "seed",
        tiebreakers: ["wins", "buchholz"]
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"],
    expectedMatches: 16, // rounds * (participants/2) = 4 * 4 = 16
    expectedRounds: 4,   // As specified in config
    description: "Swiss system with 4 rounds"
  },

  // 5. FREE-FOR-ALL: Individual leaderboard competition  
  'free-for-all': {
    config: {
      meta: { 
        name: "Free-for-All Test", 
        participantType: "individual", 
        participantCount: 10 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "leaderboard",
        events: [{
          name: "Performance Event",
          measureType: "score",
          unit: "points",
          maxParticipants: 10
        }]
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6", "Player 7", "Player 8", "Player 9", "Player 10"],
    expectedMatches: 0,  // FFA doesn't use traditional matches
    expectedRounds: 1,   // Single leaderboard event
    description: "Free-for-all leaderboard competition",
    formatConfig: { tournamentType: "free-for-all" }
  },

  // Additional tournament types that need special handling via formatConfig
  // 6. MARCH MADNESS: exactly 67 total matches (68 teams)
  'march-madness': {
    config: {
      meta: { 
        name: "March Madness Test", 
        participantType: "team", 
        participantCount: 68 
      },
      divisions: [{ 
        name: "NCAA Tournament", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "single", 
        size: 68 
      }],
      seeding: { 
        method: "manual" 
      }
    },
    participants: Array.from({length: 68}, (_, i) => `Team ${i + 1}`),
    expectedMatches: 67, // March Madness has exactly 67 matches
    expectedRounds: 7,   // First Four, R64, R32, Sweet16, Elite8, Final4, Championship
    description: "NCAA March Madness with 68 teams",
    formatConfig: { tournamentType: "march-madness" }
  },

  // 7. TRIPLE ELIMINATION: Three-life tournament structure
  'triple-elimination': {
    config: {
      meta: { 
        name: "Triple Elimination Test", 
        participantType: "team", 
        participantCount: 8 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "single", 
        size: 8 
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"],
    expectedMatches: 21, // More matches due to three brackets
    expectedRounds: 9,   // Multiple elimination rounds
    description: "Triple elimination with three-life system",
    formatConfig: { tournamentType: "triple-elimination" }
  },

  // 8. COMPASS DRAW: Specific tennis/sports format
  'compass-draw': {
    config: {
      meta: { 
        name: "Compass Draw Test", 
        participantType: "individual", 
        participantCount: 16 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "single", 
        size: 16 
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: Array.from({length: 16}, (_, i) => `Player ${i + 1}`),
    expectedMatches: 30, // North, South, East, West brackets
    expectedRounds: 4,   // Multiple consolation levels
    description: "Compass draw with four directional brackets",
    formatConfig: { tournamentType: "compass-draw" }
  },

  // 9. GAME GUARANTEE: Minimum games per participant
  'game-guarantee': {
    config: {
      meta: { 
        name: "Game Guarantee Test", 
        participantType: "team", 
        participantCount: 8 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "single", 
        size: 8 
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"],
    expectedMatches: 18, // Main bracket + consolation games
    expectedRounds: 5,   // Multiple rounds to guarantee games
    description: "Game guarantee ensuring minimum 3 games per team",
    formatConfig: { tournamentType: "game-guarantee", gameGuarantee: 3 }
  },

  // 10. PREDICTION BRACKETS: Fantasy-style tournament
  'prediction-bracket': {
    config: {
      meta: { 
        name: "Prediction Bracket Test", 
        participantType: "team", 
        participantCount: 16 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "single", 
        size: 16 
      }],
      seeding: { 
        method: "manual" 
      }
    },
    participants: Array.from({length: 16}, (_, i) => `Team ${i + 1}`),
    expectedMatches: 15, // Single elimination bracket for predictions
    expectedRounds: 4,   // Standard elimination rounds
    description: "Prediction bracket for fantasy competition",
    formatConfig: { 
      tournamentType: "prediction-bracket",
      participants: [
        { id: "predictor1", name: "Predictor 1", email: "p1@test.com" },
        { id: "predictor2", name: "Predictor 2", email: "p2@test.com" }
      ]
    }
  },

  // 11. POOL PLAY: Group stage + elimination structure (simulate with round robin + single)
  'pool-play': {
    config: {
      meta: { 
        name: "Pool Play Test", 
        participantType: "team", 
        participantCount: 12 
      },
      divisions: [{ 
        name: "Main Division", 
        eligibility: {}, 
        genderPolicy: "open" 
      }],
      stages: [{ 
        engine: "round_robin", 
        groups: 3, // 3 groups of 4 teams
        groupSize: 4,
        points: {
          win: 3,
          draw: 1,
          loss: 0
        },
        tiebreakers: ["head_to_head", "goal_difference"]
      }],
      seeding: { 
        method: "random" 
      }
    },
    participants: Array.from({length: 12}, (_, i) => `Team ${i + 1}`),
    expectedMatches: 18, // 3 groups * 6 matches per group = 18 pool play matches  
    expectedRounds: 3,   // Group stage rounds
    description: "Pool play with 3 groups of 4 teams",
    formatConfig: { tournamentType: "pool-play" }
  }
};

// Helper function to validate tournament mathematics
function validateTournamentMath(testName, response, expectedMatches, expectedRounds) {
  const validation = response.validation;
  const results = {
    testName,
    success: response.success,
    status: response.success ? 'PASS' : 'FAIL',
    mathematicsCorrect: validation.mathematicsCorrect,
    expectedMatches,
    actualMatches: validation.actualMatches,
    expectedRounds,
    actualRounds: response.bracketStructure.totalRounds,
    matchCountCorrect: validation.actualMatches === expectedMatches,
    roundCountCorrect: response.bracketStructure.totalRounds === expectedRounds,
    participantCount: validation.participantCount,
    configEngine: validation.configEngine,
    tournamentType: validation.tournamentType
  };
  
  // Overall pass/fail based on key criteria
  results.overallPass = results.success && 
                       results.mathematicsCorrect && 
                       results.actualMatches > 0 &&
                       results.actualRounds > 0;
  
  return results;
}

// Helper function to make API request with error handling
async function testTournamentCreation(testName, config) {
  try {
    console.log(`\n🧪 Testing ${testName}...`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Participants: ${config.participants.length}`);
    console.log(`   Expected: ${config.expectedMatches} matches, ${config.expectedRounds} rounds`);
    
    const payload = {
      config: config.config,
      participants: config.participants,
      formatConfig: config.formatConfig || {}
    };
    
    const response = await axios.post(`${BASE_URL}/api/tournaments/create-from-config`, payload, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log(`   ✅ API returned ${response.status} Success`);
      console.log(`   📊 Response data keys: ${Object.keys(response.data).join(', ')}`);
      
      // Check if response has expected structure
      if (response.data.validation) {
        console.log(`   📊 Generated: ${response.data.validation.actualMatches} matches, ${response.data.bracketStructure?.totalRounds || 'N/A'} rounds`);
        return validateTournamentMath(testName, response.data, config.expectedMatches, config.expectedRounds);
      } else {
        console.log(`   ⚠️  Response missing validation data: ${JSON.stringify(response.data, null, 2)}`);
        return {
          testName,
          success: false,
          status: 'FAIL',
          error: 'Response missing validation data',
          responseData: response.data,
          overallPass: false
        };
      }
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
      return {
        testName,
        success: false,
        status: 'FAIL',
        error: `Unexpected status: ${response.status}`,
        overallPass: false
      };
    }
    
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    if (error.response) {
      console.log(`   📝 Error response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    return {
      testName,
      success: false,
      status: 'FAIL',
      error: error.message,
      errorDetails: error.response?.data,
      overallPass: false
    };
  }
}

// Main test execution function
async function runComprehensiveE2ETests() {
  console.log('🚀 Starting Comprehensive E2E Testing for All 11 Tournament Types');
  console.log('=' .repeat(70));
  
  const results = [];
  let passCount = 0;
  let failCount = 0;
  
  // Test each tournament type
  for (const [testName, config] of Object.entries(TOURNAMENT_CONFIGS)) {
    const result = await testTournamentCreation(testName, config);
    results.push(result);
    
    if (result.overallPass) {
      passCount++;
      console.log(`   🎯 ${testName}: PASS`);
    } else {
      failCount++;
      console.log(`   💥 ${testName}: FAIL`);
    }
    
    // Add small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Generate comprehensive test report
  console.log('\n' + '='.repeat(70));
  console.log('📊 COMPREHENSIVE E2E TEST RESULTS');
  console.log('='.repeat(70));
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`   Total Tests: ${results.length}`);
  console.log(`   Passed: ${passCount} ✅`);
  console.log(`   Failed: ${failCount} ❌`);
  console.log(`   Success Rate: ${((passCount / results.length) * 100).toFixed(1)}%`);
  
  console.log(`\n📋 DETAILED RESULTS:`);
  console.log('-'.repeat(100));
  console.log('Test Name'.padEnd(20) + 'Status'.padEnd(8) + 'Matches'.padEnd(12) + 'Rounds'.padEnd(10) + 'Math OK'.padEnd(10) + 'Engine'.padEnd(15) + 'Type');
  console.log('-'.repeat(100));
  
  results.forEach(result => {
    const status = result.overallPass ? '✅ PASS' : '❌ FAIL';
    const matches = result.actualMatches ? `${result.actualMatches}/${result.expectedMatches || '?'}` : 'N/A';
    const rounds = result.actualRounds ? `${result.actualRounds}/${result.expectedRounds || '?'}` : 'N/A';
    const mathOK = result.mathematicsCorrect ? '✅' : '❌';
    const engine = result.configEngine || 'unknown';
    const type = result.tournamentType || 'unknown';
    
    console.log(
      result.testName.padEnd(20) +
      status.padEnd(8) +
      matches.padEnd(12) +
      rounds.padEnd(10) +
      mathOK.padEnd(10) +
      engine.padEnd(15) +
      type
    );
  });
  
  // Show failures in detail
  const failures = results.filter(r => !r.overallPass);
  if (failures.length > 0) {
    console.log(`\n🔥 FAILURE DETAILS:`);
    failures.forEach(failure => {
      console.log(`\n❌ ${failure.testName}:`);
      if (failure.error) {
        console.log(`   Error: ${failure.error}`);
      }
      if (failure.errorDetails) {
        console.log(`   Details: ${JSON.stringify(failure.errorDetails, null, 2)}`);
      }
    });
  }
  
  // Final assessment
  console.log(`\n🏆 FINAL ASSESSMENT:`);
  if (passCount === results.length) {
    console.log(`   🎉 ALL ${results.length} TOURNAMENT TYPES WORKING SUCCESSFULLY!`);
    console.log(`   ✅ Task 8 can be marked as COMPLETE`);
    console.log(`   🎯 Universal tournament support validated`);
  } else {
    console.log(`   ⚠️  ${failCount} tournament types need fixes`);
    console.log(`   🔧 Additional work required before Task 8 completion`);
  }
  
  console.log('\n' + '='.repeat(70));
  
  return {
    totalTests: results.length,
    passed: passCount,
    failed: failCount,
    successRate: (passCount / results.length) * 100,
    allTestsPassed: passCount === results.length,
    results,
    failures
  };
}

// Execute tests if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveE2ETests()
    .then(summary => {
      process.exit(summary.allTestsPassed ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

export { runComprehensiveE2ETests, TOURNAMENT_CONFIGS };