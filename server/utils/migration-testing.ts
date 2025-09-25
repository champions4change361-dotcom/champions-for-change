/**
 * Migration Testing Utilities
 * 
 * Comprehensive testing suite for validating tournament migration success
 * and ensuring backward compatibility is maintained.
 */

import { 
  migrateSingleTournament, 
  migrateLegacyTournamentToConfig,
  validateMigratedConfig,
  type LegacyTournament,
  type MigrationResult
} from './tournament-migration';
import { type TournamentConfig, type Tournament } from '@shared/schema';
import { storage } from '../storage';
import { BracketGenerator } from './bracket-generator';

export interface MigrationTestResult {
  tournamentId: string;
  testsPassed: number;
  testsTotal: number;
  success: boolean;
  errors: string[];
  warnings: string[];
  details: {
    configValidation: boolean;
    bracketGeneration: boolean;
    dataIntegrity: boolean;
    functionalityTest: boolean;
  };
}

export interface MigrationTestSuite {
  suiteName: string;
  testResults: MigrationTestResult[];
  overallSuccess: boolean;
  successRate: number;
  totalTests: number;
  passedTests: number;
  executionTime: number;
}

/**
 * Test configuration validation for migrated tournament
 */
export async function testConfigValidation(tournament: Tournament): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    if (!tournament.config) {
      errors.push('Tournament config is null after migration');
      return { passed: false, errors };
    }
    
    const validation = validateMigratedConfig(tournament.config as TournamentConfig);
    if (!validation.valid) {
      errors.push(...validation.errors);
      return { passed: false, errors };
    }
    
    // Additional structural validation
    const config = tournament.config as TournamentConfig;
    
    if (!config.meta) {
      errors.push('Config missing meta section');
    }
    
    if (!config.divisions || config.divisions.length === 0) {
      errors.push('Config missing divisions');
    }
    
    if (!config.stages || config.stages.length === 0) {
      errors.push('Config missing stages');
    }
    
    return { passed: errors.length === 0, errors };
  } catch (error: any) {
    errors.push(`Config validation failed: ${error.message}`);
    return { passed: false, errors };
  }
}

/**
 * Test bracket generation compatibility
 */
export async function testBracketGeneration(tournament: Tournament): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    if (!tournament.config) {
      errors.push('Cannot test bracket generation without config');
      return { passed: false, errors };
    }
    
    const config = tournament.config as TournamentConfig;
    
    // Test bracket generation from config
    const participantNames = Array.isArray(tournament.teams) 
      ? tournament.teams.map((team: any) => typeof team === 'string' ? team : team.name || 'Team') 
      : [];
    const bracket = await BracketGenerator.generateFromConfig(
      config,
      participantNames,
      tournament.id || 'test'
    );
    
    if (!bracket) {
      errors.push('Bracket generation returned null');
      return { passed: false, errors };
    }
    
    // Validate bracket structure exists
    if (!bracket) {
      errors.push('Generated bracket is null');
    }
    
    if (!bracket.matches || !Array.isArray(bracket.matches)) {
      errors.push('Generated bracket missing or invalid matches array');
    }
    
    // Engine-specific validations
    const stage = config.stages[0];
    if (stage.engine === 'single' || stage.engine === 'double') {
      if (bracket.matches.length === 0) {
        errors.push('Elimination bracket should have matches');
      }
    }
    
    return { passed: errors.length === 0, errors };
  } catch (error: any) {
    errors.push(`Bracket generation failed: ${error.message}`);
    return { passed: false, errors };
  }
}

/**
 * Test data integrity after migration
 */
export async function testDataIntegrity(originalTournament: LegacyTournament, migratedTournament: Tournament): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    // Verify core data preservation
    if (originalTournament.name !== migratedTournament.name) {
      errors.push('Tournament name changed during migration');
    }
    
    if (originalTournament.userId !== migratedTournament.userId) {
      errors.push('Tournament owner changed during migration');
    }
    
    if (originalTournament.status !== migratedTournament.status) {
      errors.push('Tournament status changed during migration');
    }
    
    // Verify participant count preservation
    const config = migratedTournament.config as TournamentConfig;
    const originalParticipants = originalTournament.maxParticipants || originalTournament.teamsCount || 16;
    const migratedParticipants = config.meta.participantCount || 16;
    
    if (originalParticipants !== migratedParticipants) {
      errors.push(`Participant count changed: ${originalParticipants} -> ${migratedParticipants}`);
    }
    
    // Verify team size preservation for team tournaments
    if (originalTournament.teamSize && originalTournament.teamSize !== config.meta.teamSize) {
      errors.push(`Team size changed: ${originalTournament.teamSize} -> ${config.meta.teamSize}`);
    }
    
    // Sport information is no longer stored in meta object in the new config format
    // Legacy sport field is preserved at the tournament level for backward compatibility
    
    // Verify legacy fields are still present for backward compatibility
    if (!migratedTournament.sport && originalTournament.sport) {
      errors.push('Legacy sport field was removed');
    }
    
    if (!migratedTournament.tournamentType && originalTournament.tournamentType) {
      errors.push('Legacy tournamentType field was removed');
    }
    
    return { passed: errors.length === 0, errors };
  } catch (error: any) {
    errors.push(`Data integrity check failed: ${error.message}`);
    return { passed: false, errors };
  }
}

/**
 * Test functionality after migration (simulated operations)
 */
export async function testFunctionality(tournament: Tournament): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  try {
    if (!tournament.config) {
      errors.push('Cannot test functionality without config');
      return { passed: false, errors };
    }
    
    const config = tournament.config as TournamentConfig;
    
    // Test participant type detection
    if (config.meta.participantType !== 'individual' && config.meta.participantType !== 'team') {
      errors.push('Invalid participant type in config');
    }
    
    // Test division structure
    for (const division of config.divisions) {
      if (!division.name) {
        errors.push('Division missing name');
      }
      
      if (!division.genderPolicy || !['male', 'female', 'mixed', 'coed', 'open'].includes(division.genderPolicy)) {
        errors.push(`Invalid gender policy: ${division.genderPolicy}`);
      }
    }
    
    // Test stage configuration
    for (const stage of config.stages) {
      if (!stage.engine || !['single', 'double', 'round_robin', 'swiss', 'leaderboard'].includes(stage.engine)) {
        errors.push(`Invalid stage engine: ${stage.engine}`);
      }
      
      // Engine-specific tests
      if (stage.engine === 'single' || stage.engine === 'double') {
        if (!('size' in stage) || typeof stage.size !== 'number' || stage.size <= 0) {
          errors.push(`Invalid size for ${stage.engine} stage: ${(stage as any).size}`);
        }
      }
      
      if (stage.engine === 'round_robin') {
        if (!('groups' in stage) || typeof stage.groups !== 'number' || stage.groups <= 0) {
          errors.push('Invalid groups for round_robin stage');
        }
        if (!('points' in stage) || !stage.points.win) {
          errors.push('Missing points configuration for round_robin stage');
        }
      }
      
      if (stage.engine === 'swiss') {
        if (!('rounds' in stage) || typeof stage.rounds !== 'number' || stage.rounds <= 0) {
          errors.push('Invalid rounds for swiss stage');
        }
      }
      
      if (stage.engine === 'leaderboard') {
        if (!('events' in stage) || !Array.isArray(stage.events) || stage.events.length === 0) {
          errors.push('Missing events for leaderboard stage');
        }
      }
    }
    
    // Test seeding configuration
    if (!config.seeding || !config.seeding.method) {
      errors.push('Missing seeding configuration');
    }
    
    return { passed: errors.length === 0, errors };
  } catch (error: any) {
    errors.push(`Functionality test failed: ${error.message}`);
    return { passed: false, errors };
  }
}

/**
 * Run comprehensive test suite for a single tournament migration
 */
export async function runMigrationTest(tournamentId: string, dryRun: boolean = true): Promise<MigrationTestResult> {
  const result: MigrationTestResult = {
    tournamentId,
    testsPassed: 0,
    testsTotal: 4,
    success: false,
    errors: [],
    warnings: [],
    details: {
      configValidation: false,
      bracketGeneration: false,
      dataIntegrity: false,
      functionalityTest: false,
    },
  };
  
  try {
    // Get original tournament data
    const originalTournament = await storage.getTournament(tournamentId);
    if (!originalTournament) {
      result.errors.push('Tournament not found');
      return result;
    }
    
    // Perform migration (dry run by default)
    const migrationResult = await migrateSingleTournament(tournamentId, dryRun);
    if (!migrationResult.success) {
      result.errors.push(`Migration failed: ${migrationResult.error}`);
      return result;
    }
    
    result.warnings.push(...migrationResult.warnings);
    
    // For testing purposes, create a tournament object with the migrated config
    const testTournament: Tournament = {
      ...originalTournament,
      config: migrationResult.migratedConfig,
    };
    
    // Test 1: Configuration Validation
    const configTest = await testConfigValidation(testTournament);
    result.details.configValidation = configTest.passed;
    if (configTest.passed) {
      result.testsPassed++;
    } else {
      result.errors.push(...configTest.errors);
    }
    
    // Test 2: Bracket Generation
    const bracketTest = await testBracketGeneration(testTournament);
    result.details.bracketGeneration = bracketTest.passed;
    if (bracketTest.passed) {
      result.testsPassed++;
    } else {
      result.errors.push(...bracketTest.errors);
    }
    
    // Test 3: Data Integrity
    const integrityTest = await testDataIntegrity(originalTournament as LegacyTournament, testTournament);
    result.details.dataIntegrity = integrityTest.passed;
    if (integrityTest.passed) {
      result.testsPassed++;
    } else {
      result.errors.push(...integrityTest.errors);
    }
    
    // Test 4: Functionality
    const functionalityTest = await testFunctionality(testTournament);
    result.details.functionalityTest = functionalityTest.passed;
    if (functionalityTest.passed) {
      result.testsPassed++;
    } else {
      result.errors.push(...functionalityTest.errors);
    }
    
    result.success = result.testsPassed === result.testsTotal;
    
  } catch (error: any) {
    result.errors.push(`Test execution failed: ${error.message}`);
  }
  
  return result;
}

/**
 * Run migration tests for multiple tournaments
 */
export async function runMigrationTestSuite(tournamentIds: string[], dryRun: boolean = true): Promise<MigrationTestSuite> {
  const startTime = Date.now();
  const suite: MigrationTestSuite = {
    suiteName: `Migration Test Suite (${dryRun ? 'Dry Run' : 'Live'})`,
    testResults: [],
    overallSuccess: false,
    successRate: 0,
    totalTests: 0,
    passedTests: 0,
    executionTime: 0,
  };
  
  console.log(`🧪 Running migration test suite for ${tournamentIds.length} tournaments`);
  
  // Run tests for each tournament
  for (const tournamentId of tournamentIds) {
    console.log(`   Testing tournament ${tournamentId}...`);
    const testResult = await runMigrationTest(tournamentId, dryRun);
    suite.testResults.push(testResult);
    
    suite.totalTests += testResult.testsTotal;
    suite.passedTests += testResult.testsPassed;
    
    if (testResult.success) {
      console.log(`   ✅ All tests passed`);
    } else {
      console.log(`   ❌ ${testResult.testsPassed}/${testResult.testsTotal} tests passed`);
    }
  }
  
  suite.successRate = suite.totalTests > 0 ? Math.round((suite.passedTests / suite.totalTests) * 100) : 0;
  suite.overallSuccess = suite.successRate === 100;
  suite.executionTime = Date.now() - startTime;
  
  console.log(`🏁 Test suite completed in ${suite.executionTime}ms`);
  console.log(`   Overall success rate: ${suite.successRate}%`);
  console.log(`   Tests passed: ${suite.passedTests}/${suite.totalTests}`);
  
  return suite;
}

/**
 * Generate migration readiness report
 */
export async function generateMigrationReadinessReport(): Promise<{
  totalLegacyTournaments: number;
  readyToMigrate: number;
  requiresReview: number;
  problemTournaments: Array<{
    id: string;
    name: string;
    issues: string[];
  }>;
  estimatedMigrationTime: number;
}> {
  console.log('🔍 Generating migration readiness report...');
  
  const allTournaments = await storage.getTournaments();
  const legacyTournaments = allTournaments.filter(t => t.config === null);
  
  let readyToMigrate = 0;
  let requiresReview = 0;
  const problemTournaments: Array<{ id: string; name: string; issues: string[] }> = [];
  
  for (const tournament of legacyTournaments) {
    const issues: string[] = [];
    
    // Check for potential migration issues
    if (!tournament.tournamentType) {
      issues.push('Missing tournament type');
    }
    
    if (!tournament.sport) {
      issues.push('Missing sport information');
    }
    
    if (!tournament.maxParticipants && !tournament.teamsCount) {
      issues.push('Missing participant count');
    }
    
    if (tournament.status === 'completed' && tournament.bracket) {
      issues.push('Completed tournament with existing bracket data');
    }
    
    if (issues.length === 0) {
      readyToMigrate++;
    } else if (issues.length <= 2) {
      requiresReview++;
    } else {
      problemTournaments.push({
        id: tournament.id,
        name: tournament.name,
        issues,
      });
    }
  }
  
  // Estimate migration time (assume 100ms per tournament + overhead)
  const estimatedMigrationTime = legacyTournaments.length * 100 + 1000;
  
  console.log(`📊 Migration readiness report complete:`);
  console.log(`   Total legacy tournaments: ${legacyTournaments.length}`);
  console.log(`   Ready to migrate: ${readyToMigrate}`);
  console.log(`   Requires review: ${requiresReview}`);
  console.log(`   Problem tournaments: ${problemTournaments.length}`);
  console.log(`   Estimated migration time: ${estimatedMigrationTime}ms`);
  
  return {
    totalLegacyTournaments: legacyTournaments.length,
    readyToMigrate,
    requiresReview,
    problemTournaments,
    estimatedMigrationTime,
  };
}