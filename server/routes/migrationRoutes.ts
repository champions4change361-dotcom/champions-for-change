/**
 * Migration API Routes
 * 
 * Provides secure endpoints for executing tournament migrations
 * from legacy format to TournamentConfig format.
 */

import type { Express } from "express";
import { 
  migrateSingleTournament, 
  migrateTournamentsBatch, 
  rollbackTournamentMigration,
  getMigrationStats,
  type MigrationBatch,
  type MigrationResult
} from "../utils/tournament-migration";
import { storage } from "../storage";

export function registerMigrationRoutes(app: Express) {
  
  // Get migration statistics
  app.get("/api/migration/stats", async (req: any, res) => {
    try {
      // Authentication check
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user to check permissions (only allow admins or specific roles)
      const user = await storage.getUser(userId);
      if (!user || !['tournament_manager', 'district_athletic_director'].includes(user.userRole || '')) {
        return res.status(403).json({ message: "Insufficient permissions for migration operations" });
      }

      const stats = await getMigrationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching migration stats:", error);
      res.status(500).json({ message: "Failed to fetch migration statistics" });
    }
  });

  // Get legacy tournaments that need migration
  app.get("/api/migration/legacy-tournaments", async (req: any, res) => {
    try {
      // Authentication check
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user to check permissions
      const user = await storage.getUser(userId);
      if (!user || !['tournament_manager', 'district_athletic_director'].includes(user.userRole || '')) {
        return res.status(403).json({ message: "Insufficient permissions for migration operations" });
      }

      // Get tournaments with null config (legacy format)
      const allTournaments = await storage.getTournaments();
      const legacyTournaments = allTournaments
        .filter(t => t.config === null)
        .map(t => ({
          id: t.id,
          name: t.name,
          sport: t.sport,
          tournamentType: t.tournamentType,
          teamSize: t.teamSize,
          maxParticipants: t.maxParticipants,
          teamsCount: t.teamsCount,
          status: t.status,
          createdAt: t.createdAt,
        }));

      res.json({
        tournaments: legacyTournaments,
        count: legacyTournaments.length,
      });
    } catch (error) {
      console.error("Error fetching legacy tournaments:", error);
      res.status(500).json({ message: "Failed to fetch legacy tournaments" });
    }
  });

  // Migrate single tournament (with dry-run support)
  app.post("/api/migration/tournament/:id", async (req: any, res) => {
    try {
      // Authentication check
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user to check permissions
      const user = await storage.getUser(userId);
      if (!user || !['tournament_manager', 'district_athletic_director'].includes(user.userRole || '')) {
        return res.status(403).json({ message: "Insufficient permissions for migration operations" });
      }

      const { id: tournamentId } = req.params;
      const { dryRun = true } = req.body; // Default to dry run for safety

      if (!tournamentId) {
        return res.status(400).json({ message: "Tournament ID required" });
      }

      console.log(`🚀 ${dryRun ? 'DRY RUN' : 'LIVE'} migration requested for tournament ${tournamentId} by user ${userId}`);

      const result = await migrateSingleTournament(tournamentId, dryRun);
      
      if (result.success) {
        console.log(`✅ Migration ${dryRun ? 'simulation' : 'execution'} successful for tournament ${tournamentId}`);
      } else {
        console.log(`❌ Migration ${dryRun ? 'simulation' : 'execution'} failed for tournament ${tournamentId}: ${result.error}`);
      }

      res.json(result);
    } catch (error) {
      console.error("Error in single tournament migration:", error);
      res.status(500).json({ 
        message: "Migration failed", 
        error: (error as Error).message 
      });
    }
  });

  // Migrate multiple tournaments in batch
  app.post("/api/migration/batch", async (req: any, res) => {
    try {
      // Authentication check
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user to check permissions
      const user = await storage.getUser(userId);
      if (!user || !['tournament_manager', 'district_athletic_director'].includes(user.userRole || '')) {
        return res.status(403).json({ message: "Insufficient permissions for migration operations" });
      }

      const { 
        tournamentIds = [], 
        batchSize = 10, 
        dryRun = true 
      } = req.body;

      if (!Array.isArray(tournamentIds) || tournamentIds.length === 0) {
        return res.status(400).json({ message: "Tournament IDs array required" });
      }

      if (tournamentIds.length > 100) {
        return res.status(400).json({ message: "Maximum 100 tournaments per batch" });
      }

      console.log(`🚀 ${dryRun ? 'DRY RUN' : 'LIVE'} batch migration requested by user ${userId}`);
      console.log(`   Tournaments: ${tournamentIds.length}`);
      console.log(`   Batch size: ${batchSize}`);

      const batch = await migrateTournamentsBatch(tournamentIds, batchSize, dryRun);

      console.log(`🏁 Batch migration completed: ${batch.successCount}/${batch.totalCount} successful`);

      res.json(batch);
    } catch (error) {
      console.error("Error in batch tournament migration:", error);
      res.status(500).json({ 
        message: "Batch migration failed", 
        error: (error as Error).message 
      });
    }
  });

  // Migrate ALL legacy tournaments (with extra safety checks)
  app.post("/api/migration/all", async (req: any, res) => {
    try {
      // Authentication check
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user to check permissions (stricter check for full migration)
      const user = await storage.getUser(userId);
      if (!user || user.userRole !== 'district_athletic_director') {
        return res.status(403).json({ 
          message: "Only district athletic directors can perform full migrations" 
        });
      }

      const { 
        batchSize = 10, 
        dryRun = true,
        confirmationToken 
      } = req.body;

      // Require confirmation token for live migrations
      if (!dryRun && confirmationToken !== `MIGRATE_ALL_${userId}`) {
        return res.status(400).json({ 
          message: "Invalid confirmation token for live migration", 
          requiredToken: `MIGRATE_ALL_${userId}`
        });
      }

      // Get all legacy tournaments
      const allTournaments = await storage.getTournaments();
      const legacyTournamentIds = allTournaments
        .filter(t => t.config === null)
        .map(t => t.id);

      if (legacyTournamentIds.length === 0) {
        return res.json({ message: "No legacy tournaments found to migrate" });
      }

      console.log(`🚀 ${dryRun ? 'DRY RUN' : 'LIVE'} FULL migration requested by user ${userId}`);
      console.log(`   Legacy tournaments found: ${legacyTournamentIds.length}`);

      const batch = await migrateTournamentsBatch(legacyTournamentIds, batchSize, dryRun);

      console.log(`🏁 Full migration completed: ${batch.successCount}/${batch.totalCount} successful`);

      res.json(batch);
    } catch (error) {
      console.error("Error in full tournament migration:", error);
      res.status(500).json({ 
        message: "Full migration failed", 
        error: (error as Error).message 
      });
    }
  });

  // Rollback migration for a specific tournament
  app.delete("/api/migration/tournament/:id", async (req: any, res) => {
    try {
      // Authentication check
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user to check permissions
      const user = await storage.getUser(userId);
      if (!user || !['tournament_manager', 'district_athletic_director'].includes(user.userRole || '')) {
        return res.status(403).json({ message: "Insufficient permissions for migration operations" });
      }

      const { id: tournamentId } = req.params;
      const { confirmationToken } = req.body;

      if (!tournamentId) {
        return res.status(400).json({ message: "Tournament ID required" });
      }

      // Require confirmation for rollback
      if (confirmationToken !== `ROLLBACK_${tournamentId}`) {
        return res.status(400).json({ 
          message: "Invalid confirmation token for rollback", 
          requiredToken: `ROLLBACK_${tournamentId}`
        });
      }

      console.log(`🔄 Rollback requested for tournament ${tournamentId} by user ${userId}`);

      const success = await rollbackTournamentMigration(tournamentId);

      if (success) {
        console.log(`✅ Rollback successful for tournament ${tournamentId}`);
        res.json({ success: true, message: "Tournament migration rolled back successfully" });
      } else {
        console.log(`❌ Rollback failed for tournament ${tournamentId}`);
        res.status(500).json({ success: false, message: "Failed to rollback tournament migration" });
      }
    } catch (error) {
      console.error("Error in tournament migration rollback:", error);
      res.status(500).json({ 
        message: "Rollback failed", 
        error: (error as Error).message 
      });
    }
  });

  // Preview migration for a tournament (always dry-run)
  app.get("/api/migration/preview/:id", async (req: any, res) => {
    try {
      // Authentication check
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user to check permissions
      const user = await storage.getUser(userId);
      if (!user || !['tournament_manager', 'district_athletic_director'].includes(user.userRole || '')) {
        return res.status(403).json({ message: "Insufficient permissions for migration operations" });
      }

      const { id: tournamentId } = req.params;

      if (!tournamentId) {
        return res.status(400).json({ message: "Tournament ID required" });
      }

      // Always dry run for preview
      const result = await migrateSingleTournament(tournamentId, true);
      
      res.json({
        ...result,
        preview: true,
        note: "This is a preview - no changes have been made to the database"
      });
    } catch (error) {
      console.error("Error in migration preview:", error);
      res.status(500).json({ 
        message: "Preview failed", 
        error: (error as Error).message 
      });
    }
  });
}