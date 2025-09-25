#!/usr/bin/env tsx
/**
 * Tournament Mathematics Validation Test Runner
 * 
 * This script runs comprehensive validation of all tournament engine mathematics
 * and bracket generation logic to ensure no regressions have occurred.
 * 
 * Usage: tsx server/test-tournament-validation.ts
 */

import { tournamentValidator } from './utils/tournament-validation';

async function main() {
  console.log('🚀 Starting Tournament Mathematics Validation Suite...');
  console.log('=' * 80);
  
  try {
    const summary = await tournamentValidator.runFullValidation();
    
    // Exit with appropriate code based on results
    process.exit(summary.overallResult === 'PASS' ? 0 : 1);
    
  } catch (error) {
    console.error('💥 Validation suite failed to run:', error);
    process.exit(1);
  }
}

main();