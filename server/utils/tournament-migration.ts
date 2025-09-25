/**
 * Tournament Migration Utility
 * 
 * Comprehensive migration strategy for converting legacy tournaments 
 * from sport-specific format to the new flexible TournamentConfig format.
 * 
 * Ensures backward compatibility and preserves all existing tournament data
 * while enabling universal tournament capabilities.
 */

import { type Tournament, type TournamentConfig, tournamentConfigSchema } from '@shared/schema';
import { storage } from '../storage';

export interface LegacyTournament {
  id: string;
  name: string;
  sport?: string;
  teamSize?: number;
  tournamentType: string;
  competitionFormat?: string;
  ageGroup?: string;
  genderDivision?: string;
  divisions?: any;
  maxParticipants?: number;
  teamsCount?: number;
  teams?: any[];
  userId?: string;
  status?: string;
  // ... other legacy fields
}

export interface MigrationResult {
  tournamentId: string;
  success: boolean;
  originalData: LegacyTournament;
  migratedConfig: TournamentConfig | null;
  error?: string;
  warnings: string[];
}

export interface MigrationBatch {
  batchId: string;
  tournaments: MigrationResult[];
  totalCount: number;
  successCount: number;
  failureCount: number;
  startTime: Date;
  endTime?: Date;
  dryRun: boolean;
}

/**
 * Map legacy tournament types to TournamentConfig engine types
 */
export function mapTournamentTypeToEngine(tournamentType: string): 'single' | 'double' | 'round_robin' | 'swiss' | 'leaderboard' {
  const typeMapping: Record<string, 'single' | 'double' | 'round_robin' | 'swiss' | 'leaderboard'> = {
    // Elimination Brackets
    'single': 'single',
    'single-elimination': 'single',
    'double': 'double',
    'double-elimination': 'double',
    
    // Round Robin and Pool Play
    'round-robin': 'round_robin',
    'pool-play': 'round_robin',
    'round-robin-pools': 'round_robin',
    
    // Swiss System
    'swiss-system': 'swiss',
    'swiss': 'swiss',
    
    // Leaderboard-based formats (FFA, Multi-event, Time-based)
    'free-for-all': 'leaderboard',
    'multi-heat-racing': 'leaderboard',
    'battle-royale': 'leaderboard',
    'point-accumulation': 'leaderboard',
    'time-trials': 'leaderboard',
    'survival-elimination': 'leaderboard',
    'stroke-play': 'leaderboard',
    'multi-event-scoring': 'leaderboard',
    'preliminary-finals': 'leaderboard',
    'heat-management': 'leaderboard',
    'skills-competition': 'leaderboard',
    
    // Advanced formats mapped to closest engine
    'march-madness': 'single', // March Madness is single elimination
    'triple-elimination': 'double', // Use double elimination as closest
    'compass-draw': 'single', // Tennis compass draw is elimination-based
    'game-guarantee': 'double', // Double elimination provides game guarantee
    'weight-class-bracket': 'single', // Wrestling brackets are single elimination
    'conference-championship': 'single',
    'prediction-bracket': 'single',
    'double-stage': 'single', // Map to single, can be enhanced later
    'match-play': 'single',
    'scramble': 'leaderboard',
    'best-ball': 'leaderboard',
    'alternate-shot': 'leaderboard',
    'modified-stableford': 'leaderboard',
    'playoff-bracket': 'single',
    'dual-meet': 'leaderboard',
    'triangular-meet': 'round_robin',
    'group-stage-knockout': 'single',
    'home-away-series': 'round_robin',
    'draw-management': 'single',
    'elimination-pools': 'single',
    'consolation-bracket': 'double',
    'team-vs-individual': 'leaderboard',
    'portfolio-review': 'leaderboard',
    'oral-competition': 'leaderboard',
    'written-test': 'leaderboard',
    'judged-performance': 'leaderboard',
    'timed-competition': 'leaderboard',
    'scoring-average': 'leaderboard',
    'advancement-ladder': 'single',
    'rating-system': 'swiss',
    'prediction-scoring': 'leaderboard',
    'multiple-bracket-system': 'single',
    'three-bracket-system': 'single',
    'guarantee-system': 'double',
    'regional-bracket': 'single',
    'individual-leaderboard': 'leaderboard',
    'heat-progression': 'leaderboard',
    'elimination-rounds': 'single',
    'performance-ranking': 'leaderboard',
    'cumulative-scoring': 'leaderboard',
    'time-based-ranking': 'leaderboard',
  };
  
  return typeMapping[tournamentType] || 'single'; // Default fallback
}

/**
 * Extract participant information from legacy tournament data
 */
export function extractParticipantInfo(tournament: LegacyTournament): TournamentConfig['meta'] {
  const participantType = tournament.teamSize && tournament.teamSize > 1 ? 'team' : 'individual';
  
  return {
    name: tournament.name,
    participantType,
    teamSize: tournament.teamSize || (participantType === 'team' ? 2 : undefined),
    participantCount: tournament.maxParticipants || tournament.teamsCount || 16,
  };
}

/**
 * Create divisions from legacy tournament data
 */
export function extractDivisions(tournament: LegacyTournament): TournamentConfig['divisions'] {
  const divisions: TournamentConfig['divisions'] = [];
  
  // Create primary division based on age group and gender
  const primaryDivision = {
    name: `${tournament.ageGroup || 'Open'} ${tournament.genderDivision || 'Mixed'}`.trim(),
    eligibility: {
      ageBand: tournament.ageGroup ? getAgeBandFromGroup(tournament.ageGroup) : undefined,
      gradeBand: tournament.ageGroup ? getGradeBandFromGroup(tournament.ageGroup) : undefined,
    },
    genderPolicy: mapGenderDivision(tournament.genderDivision || 'Mixed'),
  };
  
  divisions.push(primaryDivision);
  
  // Add additional divisions if they exist in legacy data
  if (tournament.divisions && Array.isArray(tournament.divisions)) {
    tournament.divisions.forEach((div: any) => {
      if (typeof div === 'object' && div.name) {
        divisions.push({
          name: div.name,
          eligibility: div.eligibility || {},
          genderPolicy: div.genderPolicy || 'open',
        });
      }
    });
  }
  
  return divisions;
}

/**
 * Helper function to map age groups to age bands
 */
function getAgeBandFromGroup(ageGroup: string): { min?: number; max?: number } | undefined {
  const ageMapping: Record<string, { min?: number; max?: number }> = {
    'Elementary': { min: 5, max: 11 },
    'Middle School': { min: 11, max: 14 },
    'High School': { min: 14, max: 18 },
    'College': { min: 18, max: 23 },
    'Adult': { min: 18 },
    'Masters': { min: 35 },
    'Senior': { min: 55 },
  };
  
  return ageMapping[ageGroup];
}

/**
 * Helper function to map age groups to grade bands
 */
function getGradeBandFromGroup(ageGroup: string): { min?: number; max?: number } | undefined {
  const gradeMapping: Record<string, { min?: number; max?: number }> = {
    'Elementary': { min: 1, max: 5 },
    'Middle School': { min: 6, max: 8 },
    'High School': { min: 9, max: 12 },
  };
  
  return gradeMapping[ageGroup];
}

/**
 * Helper function to map gender divisions
 */
function mapGenderDivision(genderDivision: string): 'male' | 'female' | 'mixed' | 'coed' | 'open' {
  const mapping: Record<string, 'male' | 'female' | 'mixed' | 'coed' | 'open'> = {
    'Men': 'male',
    'Boys': 'male',
    'Women': 'female',
    'Girls': 'female',
    'Mixed': 'mixed',
    'Co-Ed': 'coed',
    'CoEd': 'coed',
  };
  
  return mapping[genderDivision] || 'open';
}

/**
 * Create stage configuration based on tournament type and size
 */
export function createStageConfig(
  engine: 'single' | 'double' | 'round_robin' | 'swiss' | 'leaderboard',
  tournament: LegacyTournament
): TournamentConfig['stages'][0] {
  const participantCount = tournament.maxParticipants || tournament.teamsCount || 16;
  
  switch (engine) {
    case 'single':
      return {
        engine: 'single',
        size: participantCount,
        thirdPlace: ['march-madness', 'weight-class-bracket'].includes(tournament.tournamentType),
      };
      
    case 'double':
      return {
        engine: 'double',
        size: participantCount,
        finals: tournament.tournamentType === 'game-guarantee' ? 'if_necessary' : 'single',
        minGamesGuaranteed: tournament.tournamentType === 'game-guarantee' ? 2 : undefined,
      };
      
    case 'round_robin':
      const groupSize = Math.min(8, Math.max(3, Math.ceil(Math.sqrt(participantCount))));
      return {
        engine: 'round_robin',
        groups: Math.ceil(participantCount / groupSize),
        groupSize,
        points: { win: 3, draw: 1, loss: 0 },
        tiebreakers: ['points', 'head_to_head', 'goal_difference'],
      };
      
    case 'swiss':
      return {
        engine: 'swiss',
        rounds: Math.max(3, Math.ceil(Math.log2(participantCount))),
        pairing: 'seed',
        tiebreakers: ['points', 'opponents_score', 'buchholz'],
      };
      
    case 'leaderboard':
      return {
        engine: 'leaderboard',
        events: createLeaderboardEvents(tournament),
      };
      
    default:
      throw new Error(`Unsupported engine type: ${engine}`);
  }
}

/**
 * Create leaderboard events based on sport and tournament type
 */
function createLeaderboardEvents(tournament: LegacyTournament): Array<{
  name?: string;
  measureType: string;
  unit: string;
  maxParticipants?: number;
}> {
  const sport = tournament.sport || 'General';
  const tournamentType = tournament.tournamentType;
  
  // Sport-specific event configurations
  if (sport.includes('Track') || tournamentType === 'time-trials') {
    return [
      { name: 'Main Event', measureType: 'time', unit: 'seconds', maxParticipants: tournament.maxParticipants }
    ];
  }
  
  if (sport.includes('Golf') || tournamentType === 'stroke-play') {
    return [
      { name: 'Stroke Play', measureType: 'score', unit: 'strokes', maxParticipants: tournament.maxParticipants }
    ];
  }
  
  if (sport.includes('Swimming') || tournamentType === 'multi-heat-racing') {
    return [
      { name: 'Heat 1', measureType: 'time', unit: 'seconds', maxParticipants: 8 },
      { name: 'Heat 2', measureType: 'time', unit: 'seconds', maxParticipants: 8 },
    ];
  }
  
  if (tournamentType === 'multi-event-scoring') {
    return [
      { name: 'Event 1', measureType: 'score', unit: 'points', maxParticipants: tournament.maxParticipants },
      { name: 'Event 2', measureType: 'score', unit: 'points', maxParticipants: tournament.maxParticipants },
    ];
  }
  
  // Default leaderboard event
  return [
    { 
      name: 'Main Competition', 
      measureType: tournamentType.includes('time') ? 'time' : 'score',
      unit: tournamentType.includes('time') ? 'seconds' : 'points',
      maxParticipants: tournament.maxParticipants 
    }
  ];
}

/**
 * Main migration function - converts legacy tournament to TournamentConfig
 */
export function migrateLegacyTournamentToConfig(tournament: LegacyTournament): TournamentConfig {
  const engine = mapTournamentTypeToEngine(tournament.tournamentType);
  const meta = extractParticipantInfo(tournament);
  const divisions = extractDivisions(tournament);
  const stageConfig = createStageConfig(engine, tournament);
  
  const config: TournamentConfig = {
    meta,
    divisions,
    stages: [stageConfig],
    seeding: {
      method: 'random', // Default to random seeding for migrated tournaments
    },
    scheduling: {
      venues: [],
      timeWindows: [],
    },
  };
  
  return config;
}

/**
 * Validate migrated tournament config
 */
export function validateMigratedConfig(config: TournamentConfig): { valid: boolean; errors: string[] } {
  try {
    tournamentConfigSchema.parse(config);
    return { valid: true, errors: [] };
  } catch (error: any) {
    const errors = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [error.message];
    return { valid: false, errors };
  }
}

/**
 * Migrate a single tournament with validation and rollback capability
 */
export async function migrateSingleTournament(
  tournamentId: string, 
  dryRun: boolean = false
): Promise<MigrationResult> {
  const warnings: string[] = [];
  
  try {
    // Get tournament from database
    const tournament = await storage.getTournament(tournamentId);
    if (!tournament) {
      return {
        tournamentId,
        success: false,
        originalData: {} as LegacyTournament,
        migratedConfig: null,
        error: 'Tournament not found',
        warnings,
      };
    }
    
    // Check if already migrated
    if (tournament.config !== null) {
      warnings.push('Tournament already has config data - skipping migration');
      return {
        tournamentId,
        success: true,
        originalData: tournament as LegacyTournament,
        migratedConfig: tournament.config as TournamentConfig,
        warnings,
      };
    }
    
    // Perform migration
    const migratedConfig = migrateLegacyTournamentToConfig(tournament as LegacyTournament);
    
    // Validate migrated config
    const validation = validateMigratedConfig(migratedConfig);
    if (!validation.valid) {
      return {
        tournamentId,
        success: false,
        originalData: tournament as LegacyTournament,
        migratedConfig: null,
        error: `Config validation failed: ${validation.errors.join(', ')}`,
        warnings,
      };
    }
    
    // Apply migration if not dry run
    if (!dryRun) {
      await storage.updateTournament(tournamentId, { config: migratedConfig });
    }
    
    return {
      tournamentId,
      success: true,
      originalData: tournament as LegacyTournament,
      migratedConfig,
      warnings,
    };
    
  } catch (error: any) {
    return {
      tournamentId,
      success: false,
      originalData: {} as LegacyTournament,
      migratedConfig: null,
      error: error.message,
      warnings,
    };
  }
}

/**
 * Migrate tournaments in batches with progress tracking
 */
export async function migrateTournamentsBatch(
  tournamentIds: string[],
  batchSize: number = 10,
  dryRun: boolean = false
): Promise<MigrationBatch> {
  const batchId = `migration_${Date.now()}`;
  const batch: MigrationBatch = {
    batchId,
    tournaments: [],
    totalCount: tournamentIds.length,
    successCount: 0,
    failureCount: 0,
    startTime: new Date(),
    dryRun,
  };
  
  console.log(`🚀 Starting tournament migration batch ${batchId}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
  console.log(`   Tournaments: ${tournamentIds.length}`);
  console.log(`   Batch size: ${batchSize}`);
  
  // Process tournaments in batches
  for (let i = 0; i < tournamentIds.length; i += batchSize) {
    const batchIds = tournamentIds.slice(i, i + batchSize);
    console.log(`📋 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tournamentIds.length / batchSize)}`);
    
    // Process batch concurrently
    const batchPromises = batchIds.map(id => migrateSingleTournament(id, dryRun));
    const batchResults = await Promise.all(batchPromises);
    
    // Collect results
    batch.tournaments.push(...batchResults);
    batch.successCount += batchResults.filter(r => r.success).length;
    batch.failureCount += batchResults.filter(r => !r.success).length;
    
    // Log progress
    console.log(`   ✅ ${batchResults.filter(r => r.success).length} successful`);
    console.log(`   ❌ ${batchResults.filter(r => !r.success).length} failed`);
    
    // Brief pause between batches to avoid overwhelming the database
    if (i + batchSize < tournamentIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  batch.endTime = new Date();
  
  console.log(`🏁 Migration batch ${batchId} completed`);
  console.log(`   Duration: ${batch.endTime.getTime() - batch.startTime.getTime()}ms`);
  console.log(`   Success: ${batch.successCount}/${batch.totalCount}`);
  console.log(`   Failures: ${batch.failureCount}/${batch.totalCount}`);
  
  return batch;
}

/**
 * Rollback migration for a tournament (restore to legacy format)
 */
export async function rollbackTournamentMigration(tournamentId: string): Promise<boolean> {
  try {
    // Set config back to null to restore legacy behavior
    await storage.updateTournament(tournamentId, { config: null });
    console.log(`✅ Rolled back migration for tournament ${tournamentId}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to rollback tournament ${tournamentId}:`, error.message);
    return false;
  }
}

/**
 * Get migration statistics
 */
export async function getMigrationStats(): Promise<{
  total: number;
  migrated: number;
  legacy: number;
  migrationPercentage: number;
}> {
  const tournaments = await storage.getTournaments();
  const total = tournaments.length;
  const migrated = tournaments.filter(t => t.config !== null).length;
  const legacy = total - migrated;
  
  return {
    total,
    migrated,
    legacy,
    migrationPercentage: total > 0 ? Math.round((migrated / total) * 100) : 0,
  };
}