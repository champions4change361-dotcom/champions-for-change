#!/usr/bin/env tsx
/**
 * Command-Line Tournament Migration Script
 * 
 * Provides easy command-line interface for migrating tournaments
 * from legacy format to TournamentConfig format.
 * 
 * Usage:
 *   npm run migrate:tournaments --dry-run                  # Preview all migrations
 *   npm run migrate:tournaments                           # Migrate all tournaments
 *   npm run migrate:tournaments --tournament-id=<id>      # Migrate specific tournament
 *   npm run migrate:tournaments --test                    # Run migration tests
 *   npm run migrate:tournaments --rollback=<id>           # Rollback specific tournament
 *   npm run migrate:tournaments --stats                   # Show migration statistics
 */

import { 
  migrateSingleTournament,
  migrateTournamentsBatch,
  rollbackTournamentMigration,
  getMigrationStats,
  type MigrationBatch
} from '../server/utils/tournament-migration';
import { 
  runMigrationTest,
  runMigrationTestSuite,
  generateMigrationReadinessReport
} from '../server/utils/migration-testing';
import { storage } from '../server/storage';

// Command line argument parsing
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isTest = args.includes('--test');
const showStats = args.includes('--stats');
const showHelp = args.includes('--help') || args.includes('-h');

const tournamentId = args.find(arg => arg.startsWith('--tournament-id='))?.split('=')[1];
const rollbackId = args.find(arg => arg.startsWith('--rollback='))?.split('=')[1];
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='))?.split('=')[1];
const batchSize = batchSizeArg ? parseInt(batchSizeArg) : 10;

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function showUsage(): void {
  console.log(`
${colorize('🏆 Tournament Migration Tool', 'bold')}

${colorize('Usage:', 'cyan')}
  npm run migrate:tournaments [options]

${colorize('Options:', 'cyan')}
  --help, -h                      Show this help message
  --dry-run                       Preview migrations without applying changes
  --tournament-id=<id>           Migrate specific tournament by ID
  --test                         Run migration tests
  --rollback=<id>                Rollback migration for specific tournament
  --stats                        Show migration statistics
  --batch-size=<n>               Set batch size for migrations (default: 10)

${colorize('Examples:', 'cyan')}
  npm run migrate:tournaments --dry-run           # Preview all migrations
  npm run migrate:tournaments                     # Migrate all tournaments
  npm run migrate:tournaments --tournament-id=abc123   # Migrate specific tournament
  npm run migrate:tournaments --test              # Run comprehensive tests
  npm run migrate:tournaments --rollback=abc123   # Rollback specific tournament
  npm run migrate:tournaments --stats             # Show current statistics

${colorize('Safety Features:', 'yellow')}
  • Dry-run mode enabled by default for testing
  • Comprehensive validation before applying changes
  • Rollback capability for all migrations
  • Batch processing with progress tracking
  • Data integrity verification

${colorize('Before running live migrations:', 'red')}
  1. Always test with --dry-run first
  2. Run --test to verify system compatibility
  3. Check --stats to understand scope
  4. Consider backing up the database
`);
}

async function showMigrationStats(): Promise<void> {
  console.log(`\n${colorize('📊 Migration Statistics', 'bold')}`);
  console.log(colorize('═'.repeat(50), 'cyan'));
  
  try {
    const stats = await getMigrationStats();
    
    console.log(`${colorize('Total tournaments:', 'white')} ${stats.total}`);
    console.log(`${colorize('Migrated:', 'green')} ${stats.migrated}`);
    console.log(`${colorize('Legacy (need migration):', 'yellow')} ${stats.legacy}`);
    console.log(`${colorize('Migration completion:', 'blue')} ${stats.migrationPercentage}%`);
    
    if (stats.legacy > 0) {
      console.log(`\n${colorize('⚠️  Migration needed for', 'yellow')} ${colorize(stats.legacy.toString(), 'bold')} ${colorize('tournaments', 'yellow')}`);
      console.log(`${colorize('Run with --dry-run to preview migrations', 'cyan')}`);
    } else {
      console.log(`\n${colorize('✅ All tournaments are migrated!', 'green')}`);
    }
    
  } catch (error: any) {
    console.error(`${colorize('❌ Error fetching statistics:', 'red')} ${error.message}`);
    process.exit(1);
  }
}

async function runMigrationTests(): Promise<void> {
  console.log(`\n${colorize('🧪 Running Migration Tests', 'bold')}`);
  console.log(colorize('═'.repeat(50), 'cyan'));
  
  try {
    // Generate readiness report
    console.log(`${colorize('Generating migration readiness report...', 'blue')}`);
    const readinessReport = await generateMigrationReadinessReport();
    
    console.log(`\n${colorize('📋 Migration Readiness Report:', 'bold')}`);
    console.log(`${colorize('Total legacy tournaments:', 'white')} ${readinessReport.totalLegacyTournaments}`);
    console.log(`${colorize('Ready to migrate:', 'green')} ${readinessReport.readyToMigrate}`);
    console.log(`${colorize('Requires review:', 'yellow')} ${readinessReport.requiresReview}`);
    console.log(`${colorize('Problem tournaments:', 'red')} ${readinessReport.problemTournaments.length}`);
    console.log(`${colorize('Estimated time:', 'blue')} ${readinessReport.estimatedMigrationTime}ms`);
    
    if (readinessReport.problemTournaments.length > 0) {
      console.log(`\n${colorize('⚠️  Problem tournaments:', 'yellow')}`);
      readinessReport.problemTournaments.forEach(tournament => {
        console.log(`   ${colorize('•', 'red')} ${tournament.name} (${tournament.id})`);
        tournament.issues.forEach(issue => {
          console.log(`     ${colorize('–', 'yellow')} ${issue}`);
        });
      });
    }
    
    // Run test suite if there are tournaments to test
    if (readinessReport.totalLegacyTournaments > 0) {
      const tournaments = await storage.getTournaments();
      const legacyTournaments = tournaments.filter(t => t.config === null);
      const testIds = legacyTournaments.slice(0, Math.min(5, legacyTournaments.length)).map(t => t.id);
      
      console.log(`\n${colorize('Running migration test suite on', 'blue')} ${colorize(testIds.length.toString(), 'bold')} ${colorize('sample tournaments...', 'blue')}`);
      
      const testSuite = await runMigrationTestSuite(testIds, true);
      
      console.log(`\n${colorize('🧪 Test Results:', 'bold')}`);
      console.log(`${colorize('Overall success:', 'white')} ${testSuite.overallSuccess ? colorize('✅ PASS', 'green') : colorize('❌ FAIL', 'red')}`);
      console.log(`${colorize('Success rate:', 'white')} ${testSuite.successRate}%`);
      console.log(`${colorize('Tests passed:', 'white')} ${testSuite.passedTests}/${testSuite.totalTests}`);
      console.log(`${colorize('Execution time:', 'white')} ${testSuite.executionTime}ms`);
      
      // Show detailed results for failed tournaments
      const failedTests = testSuite.testResults.filter(t => !t.success);
      if (failedTests.length > 0) {
        console.log(`\n${colorize('❌ Failed Tests:', 'red')}`);
        failedTests.forEach(test => {
          console.log(`   ${colorize('Tournament:', 'white')} ${test.tournamentId}`);
          console.log(`   ${colorize('Tests passed:', 'white')} ${test.testsPassed}/${test.testsTotal}`);
          test.errors.forEach(error => {
            console.log(`   ${colorize('•', 'red')} ${error}`);
          });
        });
      }
      
      if (testSuite.overallSuccess) {
        console.log(`\n${colorize('✅ All tests passed! Migration system is ready.', 'green')}`);
      } else {
        console.log(`\n${colorize('⚠️  Some tests failed. Review issues before proceeding.', 'yellow')}`);
      }
    } else {
      console.log(`\n${colorize('ℹ️  No legacy tournaments found to test.', 'blue')}`);
    }
    
  } catch (error: any) {
    console.error(`${colorize('❌ Test execution failed:', 'red')} ${error.message}`);
    process.exit(1);
  }
}

async function migrateSingleTournamentCLI(tournamentId: string, dryRun: boolean): Promise<void> {
  console.log(`\n${colorize('🚀 Single Tournament Migration', 'bold')}`);
  console.log(colorize('═'.repeat(50), 'cyan'));
  console.log(`${colorize('Mode:', 'white')} ${dryRun ? colorize('DRY RUN', 'yellow') : colorize('LIVE MIGRATION', 'red')}`);
  console.log(`${colorize('Tournament ID:', 'white')} ${tournamentId}`);
  
  try {
    const result = await migrateSingleTournament(tournamentId, dryRun);
    
    if (result.success) {
      console.log(`\n${colorize('✅ Migration successful!', 'green')}`);
      console.log(`${colorize('Tournament:', 'white')} ${result.originalData.name}`);
      console.log(`${colorize('Sport:', 'white')} ${result.originalData.sport}`);
      console.log(`${colorize('Type:', 'white')} ${result.originalData.tournamentType}`);
      
      if (result.migratedConfig) {
        console.log(`${colorize('Engine:', 'white')} ${result.migratedConfig.stages[0].engine}`);
        console.log(`${colorize('Participant Type:', 'white')} ${result.migratedConfig.meta.participantType}`);
        console.log(`${colorize('Max Participants:', 'white')} ${result.migratedConfig.meta.maxParticipants}`);
      }
      
      if (result.warnings.length > 0) {
        console.log(`\n${colorize('⚠️  Warnings:', 'yellow')}`);
        result.warnings.forEach(warning => {
          console.log(`   ${colorize('•', 'yellow')} ${warning}`);
        });
      }
      
      if (!dryRun) {
        console.log(`\n${colorize('💾 Changes have been saved to the database.', 'green')}`);
      } else {
        console.log(`\n${colorize('👀 This was a preview - no changes made.', 'blue')}`);
        console.log(`${colorize('Run without --dry-run to apply changes.', 'cyan')}`);
      }
    } else {
      console.log(`\n${colorize('❌ Migration failed!', 'red')}`);
      console.log(`${colorize('Error:', 'red')} ${result.error}`);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error(`${colorize('❌ Migration execution failed:', 'red')} ${error.message}`);
    process.exit(1);
  }
}

async function migrateAllTournamentsCLI(dryRun: boolean): Promise<void> {
  console.log(`\n${colorize('🚀 Batch Tournament Migration', 'bold')}`);
  console.log(colorize('═'.repeat(50), 'cyan'));
  console.log(`${colorize('Mode:', 'white')} ${dryRun ? colorize('DRY RUN', 'yellow') : colorize('LIVE MIGRATION', 'red')}`);
  console.log(`${colorize('Batch size:', 'white')} ${batchSize}`);
  
  try {
    // Get legacy tournaments
    const tournaments = await storage.getTournaments();
    const legacyTournaments = tournaments.filter(t => t.config === null);
    
    if (legacyTournaments.length === 0) {
      console.log(`\n${colorize('ℹ️  No legacy tournaments found to migrate.', 'blue')}`);
      console.log(`${colorize('All tournaments are already using the new format!', 'green')}`);
      return;
    }
    
    console.log(`${colorize('Legacy tournaments found:', 'white')} ${legacyTournaments.length}`);
    
    if (!dryRun) {
      console.log(`\n${colorize('⚠️  WARNING: This will modify the database!', 'red')}`);
      console.log(`${colorize('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow')}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    const tournamentIds = legacyTournaments.map(t => t.id);
    const batch = await migrateTournamentsBatch(tournamentIds, batchSize, dryRun);
    
    console.log(`\n${colorize('🏁 Migration batch completed!', 'bold')}`);
    console.log(`${colorize('Batch ID:', 'white')} ${batch.batchId}`);
    console.log(`${colorize('Total tournaments:', 'white')} ${batch.totalCount}`);
    console.log(`${colorize('Successful:', 'green')} ${batch.successCount}`);
    console.log(`${colorize('Failed:', 'red')} ${batch.failureCount}`);
    console.log(`${colorize('Success rate:', 'blue')} ${Math.round((batch.successCount / batch.totalCount) * 100)}%`);
    console.log(`${colorize('Duration:', 'white')} ${batch.endTime ? batch.endTime.getTime() - batch.startTime.getTime() : 0}ms`);
    
    // Show failures if any
    const failures = batch.tournaments.filter(t => !t.success);
    if (failures.length > 0) {
      console.log(`\n${colorize('❌ Failed Migrations:', 'red')}`);
      failures.forEach(failure => {
        console.log(`   ${colorize('Tournament:', 'white')} ${failure.tournamentId}`);
        console.log(`   ${colorize('Error:', 'red')} ${failure.error}`);
      });
    }
    
    if (!dryRun && batch.successCount > 0) {
      console.log(`\n${colorize('💾 Successfully migrated', 'green')} ${colorize(batch.successCount.toString(), 'bold')} ${colorize('tournaments!', 'green')}`);
    } else if (dryRun) {
      console.log(`\n${colorize('👀 This was a preview - no changes made.', 'blue')}`);
      console.log(`${colorize('Run without --dry-run to apply changes.', 'cyan')}`);
    }
    
  } catch (error: any) {
    console.error(`${colorize('❌ Batch migration failed:', 'red')} ${error.message}`);
    process.exit(1);
  }
}

async function rollbackTournamentCLI(tournamentId: string): Promise<void> {
  console.log(`\n${colorize('🔄 Tournament Migration Rollback', 'bold')}`);
  console.log(colorize('═'.repeat(50), 'cyan'));
  console.log(`${colorize('Tournament ID:', 'white')} ${tournamentId}`);
  
  try {
    console.log(`\n${colorize('⚠️  WARNING: This will remove the TournamentConfig and restore legacy format!', 'red')}`);
    console.log(`${colorize('Press Ctrl+C to cancel, or wait 3 seconds to continue...', 'yellow')}`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = await rollbackTournamentMigration(tournamentId);
    
    if (success) {
      console.log(`\n${colorize('✅ Rollback successful!', 'green')}`);
      console.log(`${colorize('Tournament has been restored to legacy format.', 'white')}`);
    } else {
      console.log(`\n${colorize('❌ Rollback failed!', 'red')}`);
      console.log(`${colorize('Check the logs for details.', 'yellow')}`);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error(`${colorize('❌ Rollback execution failed:', 'red')} ${error.message}`);
    process.exit(1);
  }
}

// Main execution
async function main(): Promise<void> {
  console.log(`${colorize('🏆 Tournament Migration Tool', 'bold')}`);
  console.log(`${colorize('Version 1.0.0 - Safe Legacy to TournamentConfig Migration', 'cyan')}\n`);
  
  if (showHelp) {
    showUsage();
    return;
  }
  
  if (showStats) {
    await showMigrationStats();
    return;
  }
  
  if (isTest) {
    await runMigrationTests();
    return;
  }
  
  if (rollbackId) {
    await rollbackTournamentCLI(rollbackId);
    return;
  }
  
  if (tournamentId) {
    await migrateSingleTournamentCLI(tournamentId, isDryRun);
    return;
  }
  
  // Default: migrate all tournaments
  await migrateAllTournamentsCLI(isDryRun);
}

// Error handling
process.on('unhandledRejection', (error: any) => {
  console.error(`${colorize('💥 Unhandled error:', 'red')} ${error.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(`\n${colorize('🛑 Migration cancelled by user.', 'yellow')}`);
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error(`${colorize('💥 Script execution failed:', 'red')} ${error.message}`);
    process.exit(1);
  });
}