/**
 * Tournament Data Migration Script
 * 
 * Safely migrates tournament data from main DATABASE_URL to tournament DATABASE_URL_TOURNAMENT
 * Following architect guidance: dry-run copy → verify → cutover
 */

import { db } from "./db";
import { tournamentDb } from "./tournament-db";
import { tournaments as mainTournaments } from "../shared/schema";
import { tournaments as tourTournaments } from "../shared/tournament-schema";
import { eq } from "drizzle-orm";

async function migrateTournaments() {
  console.log("🚀 Starting tournament data migration...\n");

  try {
    // STEP 1: Read all tournaments from main DB
    console.log("📊 STEP 1: Reading tournaments from main database...");
    const sourceTournaments = await db
      .select()
      .from(mainTournaments);
    
    console.log(`✅ Found ${sourceTournaments.length} tournaments in main DB\n`);

    if (sourceTournaments.length === 0) {
      console.log("✅ No tournaments to migrate. Migration complete.");
      return;
    }

    // STEP 2: Check what's already in tournament DB (dry-run)
    console.log("📊 STEP 2: Checking tournament database...");
    const existingTournaments = await tournamentDb
      .select()
      .from(tourTournaments);
    
    console.log(`📌 Tournament DB currently has ${existingTournaments.length} tournaments\n`);

    // STEP 3: Copy tournaments to tournament DB
    console.log("📊 STEP 3: Copying tournaments to tournament database...");
    let migratedCount = 0;
    let skippedCount = 0;

    for (const tournament of sourceTournaments) {
      // Check if tournament already exists in destination
      const [existing] = await tournamentDb
        .select()
        .from(tourTournaments)
        .where(eq(tourTournaments.id, tournament.id));

      if (existing) {
        console.log(`⏭️  Skipping ${tournament.name} (already exists)`);
        skippedCount++;
        continue;
      }

      // Insert tournament into tournament DB
      await tournamentDb
        .insert(tourTournaments)
        .values(tournament);
      
      migratedCount++;
      console.log(`✅ Migrated: ${tournament.name}`);
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Migrated: ${migratedCount} tournaments`);
    console.log(`   - Skipped: ${skippedCount} tournaments (already existed)`);

    // STEP 4: Verify counts
    console.log("\n📊 STEP 4: Verifying migration...");
    const finalCount = await tournamentDb
      .select()
      .from(tourTournaments);
    
    console.log(`✅ Tournament DB now has ${finalCount.length} tournaments`);
    
    if (finalCount.length === sourceTournaments.length) {
      console.log("✅ SUCCESS: All tournaments migrated successfully!");
    } else {
      console.log(`⚠️  WARNING: Count mismatch! Source: ${sourceTournaments.length}, Destination: ${finalCount.length}`);
    }

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateTournaments()
    .then(() => {
      console.log("\n✅ Migration script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Migration script failed:", error);
      process.exit(1);
    });
}

export { migrateTournaments };
