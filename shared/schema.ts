import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamSize: integer("team_size").notNull(),
  tournamentType: text("tournament_type", { enum: ["single", "double", "pool-play", "round-robin", "swiss-system"] }).notNull().default("single"),
  competitionFormat: text("competition_format", { enum: ["bracket", "leaderboard", "multi-stage"] }).notNull().default("bracket"),
  status: text("status", { enum: ["upcoming", "stage-1", "stage-2", "stage-3", "completed"] }).notNull().default("upcoming"),
  currentStage: integer("current_stage").default(1),
  totalStages: integer("total_stages").default(1),
  stageConfiguration: jsonb("stage_configuration"), // Defines each stage structure
  bracket: jsonb("bracket").notNull(),
  sport: text("sport"), // From Bubble SportOptions
  sportCategory: text("sport_category"), // From Bubble SportCategories
  tournamentStructure: text("tournament_structure"), // From Bubble TournamentStructures
  ageGroup: text("age_group").default("All Ages"),
  genderDivision: text("gender_division").default("Mixed"),
  scoringMethod: text("scoring_method").default("wins"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Bubble data tables
export const sportOptions = pgTable("sport_options", {
  id: varchar("id").primaryKey(),
  sportName: text("sport_name").notNull(),
  sportCategory: text("sport_category").notNull(),
  sportSubcategory: text("sport_subcategory"),
  sortOrder: integer("sport_sort_order"),
  competitionType: text("competition_type", { enum: ["bracket", "leaderboard", "both"] }).notNull().default("bracket"),
  scoringMethod: text("scoring_method", { enum: ["wins", "time", "distance", "points", "placement"] }).default("wins"),
  measurementUnit: text("measurement_unit"), // seconds, meters, points, etc.
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const tournamentStructures = pgTable("tournament_structures", {
  id: varchar("id").primaryKey(),
  formatName: text("format_name").notNull(),
  formatDescription: text("format_description"),
  formatType: text("format_type"),
  applicableSports: text("applicable_sports"),
  sortOrder: integer("format_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const trackEvents = pgTable("track_events", {
  id: varchar("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventCategory: text("event_category"),
  measurementType: text("measurement_type"),
  maxAttempts: integer("max_attempt"),
  ribbonPlaces: integer("ribbon_places"),
  usesStakes: text("uses_stakes"),
  sortOrder: integer("event_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  position: integer("position").notNull(),
  team1: text("team1"),
  team2: text("team2"),
  team1Score: integer("team1_score").default(0),
  team2Score: integer("team2_score").default(0),
  winner: text("winner"),
  status: text("status", { enum: ["upcoming", "in-progress", "completed"] }).notNull().default("upcoming"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSportOptionSchema = createInsertSchema(sportOptions).omit({
  createdAt: true,
});

export const insertTournamentStructureSchema = createInsertSchema(tournamentStructures).omit({
  createdAt: true,
});

export const insertTrackEventSchema = createInsertSchema(trackEvents).omit({
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMatchSchema = createInsertSchema(matches).omit({
  id: true,
  tournamentId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type UpdateMatch = z.infer<typeof updateMatchSchema>;

export type SportOption = typeof sportOptions.$inferSelect;
export type InsertSportOption = z.infer<typeof insertSportOptionSchema>;
export type TournamentStructure = typeof tournamentStructures.$inferSelect;
export type InsertTournamentStructure = z.infer<typeof insertTournamentStructureSchema>;
export type TrackEvent = typeof trackEvents.$inferSelect;
export type InsertTrackEvent = z.infer<typeof insertTrackEventSchema>;
