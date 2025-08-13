import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
  uuid,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Commissioner Management Tables

// Fantasy Leagues - Core league management
export const fantasyLeagues = pgTable("fantasy_leagues", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  leagueType: text("league_type", { 
    enum: ["ppr_league", "knockout_pool", "dynasty", "redraft"] 
  }).notNull(),
  
  // Commissioner Info
  commissionerId: varchar("commissioner_id").notNull(), // User ID who created league
  commissionerName: varchar("commissioner_name"),
  registrationCode: varchar("registration_code", { length: 20 }).unique().notNull(),
  
  // League Settings
  maxParticipants: integer("max_participants").default(12),
  currentParticipants: integer("current_participants").default(0),
  entryFee: decimal("entry_fee", { precision: 10, scale: 2 }).default("0"),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).default("0"),
  
  // League Configuration
  settings: jsonb("settings").$type<{
    scoringSystem: 'ppr' | 'standard' | 'half_ppr';
    rosterSize: number;
    startingLineup: {
      qb: number;
      rb: number;
      wr: number;
      te: number;
      flex: number;
      k: number;
      def: number;
      bench: number;
    };
    waiverSettings: {
      type: 'faab' | 'rolling' | 'reverse_standings';
      budget?: number;
    };
    tradeDeadline: string;
    playoffWeeks: number[];
    championshipWeek: number;
  }>(),
  
  // Status and Metadata
  status: text("status", { 
    enum: ["draft", "active", "completed", "cancelled"] 
  }).default("draft"),
  season: integer("season").default(2024),
  isPublic: boolean("is_public").default(false),
  allowLateJoins: boolean("allow_late_joins").default(true),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  draftDate: timestamp("draft_date"),
  seasonStart: timestamp("season_start"),
  seasonEnd: timestamp("season_end")
});

// League Participants - Who's in each league
export const leagueParticipants = pgTable("league_participants", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: uuid("league_id").references(() => fantasyLeagues.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").notNull(),
  userEmail: varchar("user_email"),
  userName: varchar("user_name"),
  
  // Participant Status
  status: text("status", { 
    enum: ["pending", "active", "inactive", "removed"] 
  }).default("pending"),
  isCommissioner: boolean("is_commissioner").default(false),
  isCoCommissioner: boolean("is_co_commissioner").default(false),
  
  // Team Info
  teamName: varchar("team_name"),
  teamLogo: text("team_logo"),
  draftPosition: integer("draft_position"),
  
  // Performance Tracking
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  ties: integer("ties").default(0),
  pointsFor: decimal("points_for", { precision: 10, scale: 2 }).default("0"),
  pointsAgainst: decimal("points_against", { precision: 10, scale: 2 }).default("0"),
  
  // Engagement Metrics
  loginCount: integer("login_count").default(0),
  lastActive: timestamp("last_active"),
  tradeCount: integer("trade_count").default(0),
  waiversClaimed: integer("waivers_claimed").default(0),
  
  joinedAt: timestamp("joined_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Player Database - Commissioner-verified player data
export const fantasyPlayers = pgTable("fantasy_players", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Player Identity
  espnId: varchar("espn_id").unique(),
  name: varchar("name", { length: 255 }).notNull(),
  position: text("position", { 
    enum: ["QB", "RB", "WR", "TE", "K", "DEF"] 
  }).notNull(),
  team: varchar("team", { length: 10 }).notNull(),
  
  // Player Details
  jerseyNumber: integer("jersey_number"),
  height: varchar("height"),
  weight: integer("weight"),
  age: integer("age"),
  experience: integer("experience"),
  college: varchar("college"),
  
  // Status and Availability
  status: text("status", { 
    enum: ["active", "injured", "suspended", "retired", "practice_squad"] 
  }).default("active"),
  injuryStatus: varchar("injury_status"),
  injuryDesignation: text("injury_designation", { 
    enum: ["healthy", "questionable", "doubtful", "out", "ir", "pup"] 
  }).default("healthy"),
  
  // Performance Data (Commissioner Input)
  currentSeasonStats: jsonb("current_season_stats").$type<{
    games: number;
    passingYards?: number;
    passingTDs?: number;
    interceptions?: number;
    rushingYards?: number;
    rushingTDs?: number;
    receptions?: number;
    receivingYards?: number;
    receivingTDs?: number;
    fumbles?: number;
    fantasyPoints?: number;
  }>(),
  
  // AI Coaching Data
  tendencyAnalysis: jsonb("tendency_analysis").$type<{
    rushingDirection: { left: number; right: number; center: number };
    redZoneTargets: number;
    thirdDownConversions: number;
    goalLineCarries: number;
    averageDepthOfTarget: number;
    snapCount: number;
    targetShare: number;
  }>(),
  
  // Metadata
  lastUpdated: timestamp("last_updated").defaultNow(),
  verifiedBy: varchar("verified_by"), // Commissioner who last verified data
  dataSource: text("data_source", { 
    enum: ["commissioner", "espn_api", "manual"] 
  }).default("commissioner"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Commissioner Analytics - Track commissioner performance
export const commissionerAnalytics = pgTable("commissioner_analytics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  commissionerId: varchar("commissioner_id").notNull(),
  
  // League Management Stats
  totalLeaguesCreated: integer("total_leagues_created").default(0),
  activeLeagues: integer("active_leagues").default(0),
  totalParticipantsManaged: integer("total_participants_managed").default(0),
  
  // Data Quality Metrics
  playersDataEntered: integer("players_data_entered").default(0),
  dataAccuracyScore: decimal("data_accuracy_score", { precision: 5, scale: 2 }).default("0"),
  lastDataUpdate: timestamp("last_data_update"),
  
  // Engagement Metrics
  loginStreak: integer("login_streak").default(0),
  totalLogins: integer("total_logins").default(0),
  averageSessionTime: integer("average_session_time").default(0), // minutes
  
  // Community Metrics
  helpfulVotes: integer("helpful_votes").default(0),
  dataVerifications: integer("data_verifications").default(0),
  disputesResolved: integer("disputes_resolved").default(0),
  
  // Financial Tracking
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0"),
  donationsToChampions: decimal("donations_to_champions", { precision: 12, scale: 2 }).default("0"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// League Activities - Audit log for commissioner actions
export const leagueActivities = pgTable("league_activities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: uuid("league_id").references(() => fantasyLeagues.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").notNull(),
  
  // Activity Details
  actionType: text("action_type", { 
    enum: [
      "league_created", "participant_added", "participant_removed",
      "settings_updated", "player_data_updated", "trade_processed",
      "waiver_processed", "lineup_set", "score_updated"
    ] 
  }).notNull(),
  
  description: text("description").notNull(),
  details: jsonb("details").$type<Record<string, any>>(),
  
  // Metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Registration Codes - Track code usage
export const registrationCodes = pgTable("registration_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 20 }).unique().notNull(),
  leagueId: uuid("league_id").references(() => fantasyLeagues.id, { onDelete: "cascade" }).notNull(),
  
  // Code Settings
  maxUses: integer("max_uses").default(1),
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  
  // Usage Tracking
  lastUsed: timestamp("last_used"),
  usedBy: jsonb("used_by").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by").notNull()
});

// Insert schemas for form validation
export const insertFantasyLeague = createInsertSchema(fantasyLeagues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentParticipants: true
});

export const insertLeagueParticipant = createInsertSchema(leagueParticipants).omit({
  id: true,
  joinedAt: true,
  updatedAt: true,
  wins: true,
  losses: true,
  ties: true,
  pointsFor: true,
  pointsAgainst: true
});

export const insertFantasyPlayer = createInsertSchema(fantasyPlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastUpdated: true
});

export const insertCommissionerAnalytics = createInsertSchema(commissionerAnalytics).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertLeagueActivity = createInsertSchema(leagueActivities).omit({
  id: true,
  createdAt: true
});

export const insertRegistrationCode = createInsertSchema(registrationCodes).omit({
  id: true,
  createdAt: true,
  currentUses: true,
  lastUsed: true,
  usedBy: true
});

// Type exports
export type FantasyLeague = typeof fantasyLeagues.$inferSelect;
export type InsertFantasyLeague = z.infer<typeof insertFantasyLeague>;

export type LeagueParticipant = typeof leagueParticipants.$inferSelect;
export type InsertLeagueParticipant = z.infer<typeof insertLeagueParticipant>;

export type FantasyPlayer = typeof fantasyPlayers.$inferSelect;
export type InsertFantasyPlayer = z.infer<typeof insertFantasyPlayer>;

export type CommissionerAnalytics = typeof commissionerAnalytics.$inferSelect;
export type InsertCommissionerAnalytics = z.infer<typeof insertCommissionerAnalytics>;

export type LeagueActivity = typeof leagueActivities.$inferSelect;
export type InsertLeagueActivity = z.infer<typeof insertLeagueActivity>;

export type RegistrationCode = typeof registrationCodes.$inferSelect;
export type InsertRegistrationCode = z.infer<typeof insertRegistrationCode>;