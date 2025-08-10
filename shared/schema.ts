import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamSize: integer("team_size").notNull(),
  status: text("status", { enum: ["upcoming", "in-progress", "completed"] }).notNull().default("upcoming"),
  bracket: jsonb("bracket").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
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
