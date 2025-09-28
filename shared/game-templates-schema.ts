import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pre-configured fantasy game templates that commissioners can deploy
export const gameTemplates = pgTable("game_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "Daily Fantasy Football"
  gameType: text("game_type", {
    enum: ["daily_fantasy", "weekly_league", "snake_draft", "head_to_head", "captain_mode", "best_ball"]
  }).notNull(),
  sport: varchar("sport").notNull().default("nfl"), // "nfl", "nba", "mlb"
  
  // Template Configuration (locked settings)
  templateConfig: jsonb("template_config").$type<{
    salaryCap: number;
    rosterFormat: {
      QB: number;
      RB: number;
      WR: number;
      TE: number;
      FLEX: number;
      DEF: number;
      K?: number;
    };
    scoringSystem: 'ppr' | 'standard' | 'half_ppr';
    maxEntries: number;
    contestDuration: 'daily' | 'weekly' | 'season';
    slateTime?: 'morning' | 'afternoon' | 'evening' | 'night';
    entryFee?: number;
    isPublic: boolean;
  }>(),
  
  // Template Metadata
  description: text("description"),
  difficulty: text("difficulty", {
    enum: ["beginner", "intermediate", "advanced"]
  }).default("beginner"),
  estimatedParticipants: integer("estimated_participants").default(100),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Live game instances created from templates
export const gameInstances = pgTable("game_instances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").references(() => gameTemplates.id).notNull(),
  commissionerId: varchar("commissioner_id").notNull(), // User who deployed template
  commissionerName: varchar("commissioner_name"),
  
  // Instance Info
  instanceName: varchar("instance_name"), // Custom name commissioner gives
  registrationCode: varchar("registration_code").unique(), // For users to join
  
  // Instance State
  status: text("status", {
    enum: ["draft", "open", "live", "scoring", "completed", "cancelled"]
  }).default("open"),
  
  // Live Configuration (inherited from template but can be customized)
  liveConfig: jsonb("live_config").$type<{
    salaryCap: number;
    rosterFormat: {
      QB: number;
      RB: number;
      WR: number;
      TE: number;
      FLEX: number;
      DEF: number;
      K?: number;
    };
    scoringSystem: 'ppr' | 'standard' | 'half_ppr';
    maxEntries: number;
    contestDuration: 'daily' | 'weekly' | 'season';
    slateTime?: 'morning' | 'afternoon' | 'evening' | 'night';
    entryFee?: number;
    isPublic: boolean;
  }>(),
  
  // Participation
  currentParticipants: integer("current_participants").default(0),
  maxParticipants: integer("max_participants"),
  
  // Timing
  contestStartTime: timestamp("contest_start_time"),
  contestEndTime: timestamp("contest_end_time"),
  lineupDeadline: timestamp("lineup_deadline"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User lineups for game instances
export const userLineups = pgTable("user_lineups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameInstanceId: varchar("game_instance_id").references(() => gameInstances.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name"),
  userEmail: varchar("user_email"),
  
  // Lineup Data  
  lineup: jsonb("lineup").$type<Array<{
    position: string; // "QB", "RB", "WR", "TE", "FLEX", "DEF"
    playerId: string;
    playerName: string;
    playerTeam: string;
    salary: number;
    projectedPoints?: number;
  }>>(),
  
  totalSalary: decimal("total_salary", { precision: 10, scale: 2 }),
  
  // Scoring
  currentScore: decimal("current_score", { precision: 10, scale: 2 }).default("0"),
  projectedScore: decimal("projected_score", { precision: 10, scale: 2 }).default("0"),
  
  // Status
  isSubmitted: boolean("is_submitted").default(false),
  isLocked: boolean("is_locked").default(false), // Locked when contest starts
  
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Real-time player performances for scoring
export const playerPerformances = pgTable("player_performances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull(),
  playerName: varchar("player_name").notNull(),
  team: varchar("team").notNull(),
  position: varchar("position").notNull(),
  
  // Game Context
  gameId: varchar("game_id"), // ESPN game ID
  week: integer("week"),
  season: integer("season").default(2024),
  gameDate: timestamp("game_date"),
  
  // Live Stats (updated from ESPN API)
  stats: jsonb("stats").$type<{
    // Passing
    passingYards?: number;
    passingTDs?: number;
    interceptions?: number;
    passingAttempts?: number;
    passingCompletions?: number;
    
    // Rushing
    rushingYards?: number;
    rushingTDs?: number;
    rushingAttempts?: number;
    
    // Receiving
    receivingYards?: number;
    receivingTDs?: number;
    receptions?: number;
    targets?: number;
    
    // Defense
    sacks?: number;
    defensiveInterceptions?: number;
    fumblesRecovered?: number;
    defensiveTDs?: number;
    pointsAllowed?: number;
    
    // Kicking
    fieldGoalsMade?: number;
    fieldGoalsAttempted?: number;
    extraPointsMade?: number;
    extraPointsAttempted?: number;
  }>(),
  
  // Fantasy Points
  fantasyPoints: decimal("fantasy_points", { precision: 10, scale: 2 }).default("0"),
  pprFantasyPoints: decimal("ppr_fantasy_points", { precision: 10, scale: 2 }).default("0"),
  halfPprFantasyPoints: decimal("half_ppr_fantasy_points", { precision: 10, scale: 2 }).default("0"),
  
  // Game Status
  gameStatus: text("game_status", {
    enum: ["scheduled", "live", "final", "postponed", "cancelled"]
  }).default("scheduled"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Zod schemas
export const insertGameTemplateSchema = createInsertSchema(gameTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertGameInstanceSchema = createInsertSchema(gameInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserLineupSchema = createInsertSchema(userLineups).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPlayerPerformanceSchema = createInsertSchema(playerPerformances).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});

// Type exports
export type GameTemplate = typeof gameTemplates.$inferSelect;
export type InsertGameTemplate = z.infer<typeof insertGameTemplateSchema>;
export type GameInstance = typeof gameInstances.$inferSelect;
export type InsertGameInstance = z.infer<typeof insertGameInstanceSchema>;
export type UserLineup = typeof userLineups.$inferSelect;
export type InsertUserLineup = z.infer<typeof insertUserLineupSchema>;
export type PlayerPerformance = typeof playerPerformances.$inferSelect;
export type InsertPlayerPerformance = z.infer<typeof insertPlayerPerformanceSchema>;