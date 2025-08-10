import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Leaderboard entries for individual performance tracking
export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  participantName: text("participant_name").notNull(),
  score: decimal("score", { precision: 10, scale: 3 }), // For times, distances, points
  placement: integer("placement"), // Final ranking
  eventName: text("event_name"), // For multi-event competitions
  attempt: integer("attempt").default(1), // For sports with multiple attempts
  measurement: text("measurement"), // "time", "distance", "points"
  unit: text("unit"), // "seconds", "meters", "points"
  status: text("status", { enum: ["active", "completed", "disqualified"] }).notNull().default("active"),
  notes: text("notes"), // Additional performance notes
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Events within a tournament (for track meets, swim meets, etc.)
export const tournamentEvents = pgTable("tournament_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  eventName: text("event_name").notNull(),
  eventCategory: text("event_category"), // "Track", "Field", "Distance", etc.
  scoringMethod: text("scoring_method").notNull(), // "time", "distance", "points"
  unit: text("unit"), // "seconds", "meters", "points"
  maxAttempts: integer("max_attempts").default(1),
  isCompleted: integer("is_completed").default(0), // Use integer for SQLite compatibility
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertLeaderboardEntrySchema = createInsertSchema(leaderboardEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentEventSchema = createInsertSchema(tournamentEvents, {
  eventName: z.string().min(1),
  scoringMethod: z.enum(["time", "distance", "points"]),
}).omit({
  id: true,
});

export const updateLeaderboardEntrySchema = insertLeaderboardEntrySchema.partial();

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardEntrySchema>;
export type UpdateLeaderboardEntry = z.infer<typeof updateLeaderboardEntrySchema>;
export type TournamentEvent = typeof tournamentEvents.$inferSelect;
export type InsertTournamentEvent = z.infer<typeof insertTournamentEventSchema>;