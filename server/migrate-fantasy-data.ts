import { db, pool } from "./db";
import { fantasyDb, fantasyPool } from "./fantasy-db";
import {
  fantasyProfiles,
  fantasyLeagues,
  fantasyTeams,
  fantasyRosters,
  fantasyDrafts,
  fantasyMatchups,
  fantasyWaiverClaims,
  fantasyTrades,
  fantasyLeagueMessages,
  fantasyParticipants,
  fantasyPicks,
  fantasyLineups,
  showdownContests,
  showdownEntries,
  showdownLeaderboards,
  professionalPlayers,
  playerPerformances,
  ageVerifications,
  fantasyEligibilityChecks,
  fantasySafetyRules,
} from "../shared/fantasy-schema";

/**
 * Migrate Fantasy Data Script
 * 
 * Safely copies all fantasy sports data from the main database to the
 * dedicated fantasy_sports database. This script:
 * 1. Counts records in source (main DB)
 * 2. Copies each table to fantasy DB
 * 3. Verifies record counts match
 * 4. Reports migration status
 */

interface MigrationResult {
  table: string;
  sourceCount: number;
  targetCount: number;
  success: boolean;
  error?: string;
}

async function getTableCount(tableName: string, isFantasyDb: boolean = false): Promise<number> {
  const query = `SELECT COUNT(*) as count FROM ${tableName}`;
  const result = isFantasyDb
    ? await fantasyDb.execute(query)
    : await db.execute(query);
  return parseInt(result.rows[0].count as string);
}

async function migrateTable(
  tableName: string,
  schema: any
): Promise<MigrationResult> {
  const result: MigrationResult = {
    table: tableName,
    sourceCount: 0,
    targetCount: 0,
    success: false,
  };

  try {
    // Get source count
    result.sourceCount = await getTableCount(tableName, false);
    
    if (result.sourceCount === 0) {
      console.log(`✅ ${tableName}: No data to migrate`);
      result.success = true;
      return result;
    }

    // Copy data from main DB to fantasy DB
    console.log(`🔄 Migrating ${tableName}: ${result.sourceCount} records...`);
    
    const sourceData = await db.select().from(schema);
    
    if (sourceData.length > 0) {
      // Insert in batches of 100 to avoid timeouts
      const batchSize = 100;
      for (let i = 0; i < sourceData.length; i += batchSize) {
        const batch = sourceData.slice(i, i + batchSize);
        await fantasyDb.insert(schema).values(batch);
        console.log(`  📦 Migrated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sourceData.length / batchSize)}`);
      }
    }

    // Verify target count
    result.targetCount = await getTableCount(tableName, true);
    
    if (result.sourceCount === result.targetCount) {
      console.log(`✅ ${tableName}: Migration successful (${result.targetCount} records)`);
      result.success = true;
    } else {
      console.error(`❌ ${tableName}: Count mismatch! Source: ${result.sourceCount}, Target: ${result.targetCount}`);
      result.success = false;
      result.error = `Count mismatch: ${result.sourceCount} != ${result.targetCount}`;
    }

  } catch (error) {
    console.error(`❌ ${tableName}: Migration failed`, error);
    result.success = false;
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

async function main() {
  console.log("🚀 Starting Fantasy Data Migration");
  console.log("=====================================");
  console.log("From: Main Database (DATABASE_URL)");
  console.log("To: Fantasy Database (DATABASE_URL_FANTASY)");
  console.log("");

  const migrations: Promise<MigrationResult>[] = [
    migrateTable("fantasy_profiles", fantasyProfiles),
    migrateTable("fantasy_leagues", fantasyLeagues),
    migrateTable("fantasy_teams", fantasyTeams),
    migrateTable("professional_players", professionalPlayers),
    migrateTable("fantasy_rosters", fantasyRosters),
    migrateTable("fantasy_drafts", fantasyDrafts),
    migrateTable("fantasy_matchups", fantasyMatchups),
    migrateTable("fantasy_waiver_claims", fantasyWaiverClaims),
    migrateTable("fantasy_trades", fantasyTrades),
    migrateTable("fantasy_league_messages", fantasyLeagueMessages),
    migrateTable("fantasy_participants", fantasyParticipants),
    migrateTable("fantasy_picks", fantasyPicks),
    migrateTable("fantasy_lineups", fantasyLineups),
    migrateTable("showdown_contests", showdownContests),
    migrateTable("showdown_entries", showdownEntries),
    migrateTable("showdown_leaderboards", showdownLeaderboards),
    migrateTable("player_performances", playerPerformances),
    migrateTable("age_verifications", ageVerifications),
    migrateTable("fantasy_eligibility_checks", fantasyEligibilityChecks),
    migrateTable("fantasy_safety_rules", fantasySafetyRules),
  ];

  const results = await Promise.all(migrations);

  console.log("");
  console.log("=====================================");
  console.log("📊 Migration Summary");
  console.log("=====================================");

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  console.log("");

  if (failed.length > 0) {
    console.log("Failed Tables:");
    failed.forEach(r => {
      console.log(`  ❌ ${r.table}: ${r.error}`);
    });
  }

  const totalRecords = results.reduce((sum, r) => sum + r.targetCount, 0);
  console.log(`📦 Total records migrated: ${totalRecords}`);
  console.log("");
  
  // Close connections
  await pool.end();
  await fantasyPool.end();

  if (failed.length > 0) {
    process.exit(1);
  }

  console.log("✅ Migration complete!");
}

main().catch((error) => {
  console.error("💥 Migration failed:", error);
  process.exit(1);
});
