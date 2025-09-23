import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import the tournaments table to reference
import { tournaments } from "./schema";

// =============================================================================
// SPORT-SPECIFIC CONFIGURATION TABLES
// =============================================================================
// This file contains sport-specific configuration tables that reference
// the main tournaments table, solving the "god table" antipattern where
// all sport-specific columns were mixed together.

// ATHLETIC SPORTS CONFIGURATIONS
// Covers: Basketball, Soccer, Tennis, Golf, Swimming, Track, Wrestling, etc.
export const athleticConfigs = pgTable("athletic_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: 'cascade' }).unique(),
  
  // Basketball-Specific Fields
  basketballFormat: text("basketball_format", {
    enum: ["5v5-bracket", "3v3-tournament", "skills-competition", "tournament-of-champions"]
  }),
  basketballSkillsEvents: jsonb("basketball_skills_events").$type<{
    threePointContest: boolean;
    dunkContest: boolean;
    shootingStars: boolean;
    skillsChallenge: boolean;
  }>(),
  basketballOvertimeRules: boolean("basketball_overtime_rules").default(true),
  basketballSeedingMethod: text("basketball_seeding_method", {
    enum: ["record-based", "rpi", "coach-poll", "manual", "random"]
  }),
  
  // Soccer-Specific Fields
  soccerFormat: text("soccer_format", {
    enum: ["11v11-tournament", "7v7-tournament", "5v5-tournament", "futsal", "penalty-shootout"]
  }),
  soccerExtraTime: boolean("soccer_extra_time").default(true),
  soccerPenaltyShootouts: boolean("soccer_penalty_shootouts").default(true),
  
  // Tennis-Specific Fields
  tennisFormat: text("tennis_format", {
    enum: ["single-elimination", "round-robin-to-knockout", "consolation-bracket", "doubles-tournament"]
  }),
  tennisDrawSize: integer("tennis_draw_size").default(32),
  tennisConsolationBracket: boolean("tennis_consolation_bracket").default(false),
  
  // Golf-Specific Fields
  golfFormat: text("golf_format", {
    enum: ["stroke-play", "match-play", "scramble", "best-ball", "alternate-shot", "modified-stableford"]
  }),
  golfCutSystem: text("golf_cut_system", {
    enum: ["no-cut", "36-hole-cut", "54-hole-cut", "top-and-ties", "percentage-cut"]
  }),
  golfHandicapSystem: boolean("golf_handicap_system").default(false),
  golfRounds: integer("golf_rounds").default(4),
  
  // Football-Specific Fields
  footballFormat: text("football_format", {
    enum: ["regular-season", "playoff-bracket", "conference-championship", "7v7", "pool-to-playoff"]
  }),
  footballSeedingMethod: text("football_seeding_method", {
    enum: ["record-based", "rpi", "conference-standings", "manual", "random"]
  }),
  footballTiebreakers: jsonb("football_tiebreakers").$type<{
    headToHead: boolean;
    pointDifferential: boolean;
    commonOpponents: boolean;
    strengthOfSchedule: boolean;
  }>(),
  
  // Swimming-Specific Fields
  swimmingFormat: text("swimming_format", {
    enum: ["dual-meet", "triangular", "invitational", "preliminary-finals", "time-trial"]
  }),
  swimmingHeatManagement: boolean("swimming_heat_management").default(true),
  swimmingTimeStandards: jsonb("swimming_time_standards").$type<{
    aStandard: number;
    bStandard: number;
    cStandard: number;
  }>(),
  swimmingScoring: text("swimming_scoring", {
    enum: ["individual-only", "team-scoring", "dual-meet-scoring", "championship-scoring"]
  }),
  
  // Track & Field-Specific Fields
  trackFormat: text("track_format", {
    enum: ["standard-meet", "multi-event", "relay-carnival", "field-event-only", "distance-carnival"]
  }),
  trackScoringSystem: text("track_scoring_system", {
    enum: ["individual-only", "team-scoring", "dual-meet", "invitational-scoring"]
  }),
  trackFieldEventManagement: boolean("track_field_event_management").default(true),
  trackQualifyingStandards: jsonb("track_qualifying_standards"),
  
  // Wrestling-Specific Fields
  wrestlingFormat: text("wrestling_format", {
    enum: ["weight-class-bracket", "dual-meet", "pool-tournament", "tournament-of-champions"]
  }),
  wrestlingWeightClasses: jsonb("wrestling_weight_classes").array(),
  wrestlingPoolFormat: boolean("wrestling_pool_format").default(false),
  
  // Volleyball-Specific Fields
  volleyballFormat: text("volleyball_format", {
    enum: ["6v6-indoor", "beach-volleyball", "grass-volleyball", "tournament-of-champions"]
  }),
  volleyballSeedingMethod: text("volleyball_seeding_method", {
    enum: ["record-based", "rpi", "manual", "random"]
  }),
  
  // Baseball/Softball-Specific Fields
  baseballFormat: text("baseball_format", {
    enum: ["single-elimination", "double-elimination", "pool-play", "round-robin"]
  }),
  
  // Universal Athletic Fields
  seedingMethod: text("seeding_method", {
    enum: ["random", "manual", "ranking-based", "previous-performance", "geographical"]
  }),
  tiebreakerRules: jsonb("tiebreaker_rules"),
  advancementCriteria: jsonb("advancement_criteria"),
  consolationBracket: boolean("consolation_bracket").default(false),
  wildcardSlots: integer("wildcard_slots").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ACADEMIC COMPETITIONS CONFIGURATIONS
// Covers: UIL Academic events, Debate, Math competitions, Science fairs, etc.
export const academicConfigs = pgTable("academic_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: 'cascade' }).unique(),
  
  academicFormat: text("academic_format", {
    enum: ["written-test", "oral-competition", "portfolio-review", "team-competition", "debate-bracket"]
  }),
  academicAdvancementRules: jsonb("academic_advancement_rules").$type<{
    individualAdvance: number;
    teamAdvance: number;
    wildcardSlots: number;
  }>(),
  academicJudgingCriteria: jsonb("academic_judging_criteria"),
  academicSubstitutionRules: boolean("academic_substitution_rules").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FINE ARTS COMPETITIONS CONFIGURATIONS
// Covers: Band, Choir, Theater, Art competitions, etc.
export const fineArtsConfigs = pgTable("fine_arts_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: 'cascade' }).unique(),
  
  fineArtsFormat: text("fine_arts_format", {
    enum: ["rating-system", "ranked-competition", "festival-format", "adjudicated-event"]
  }),
  fineArtsRatingScale: text("fine_arts_rating_scale", {
    enum: ["I-II-III-IV", "1-10-scale", "percentage", "letter-grade"]
  }),
  fineArtsCategories: jsonb("fine_arts_categories").array(),
  fineArtsScoringMethod: text("fine_arts_scoring_method"),
  fineArtsJudgingPanel: jsonb("fine_arts_judging_panel"),
  fineArtsScoringRubric: jsonb("fine_arts_scoring_rubric"),
  fineArtsAdjudicationMethod: text("fine_arts_adjudication_method"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// RELATIONS
// =============================================================================

export const athleticConfigsRelations = relations(athleticConfigs, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [athleticConfigs.tournamentId],
    references: [tournaments.id],
  }),
}));

export const academicConfigsRelations = relations(academicConfigs, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [academicConfigs.tournamentId],
    references: [tournaments.id],
  }),
}));

export const fineArtsConfigsRelations = relations(fineArtsConfigs, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [fineArtsConfigs.tournamentId],
    references: [tournaments.id],
  }),
}));

// =============================================================================
// ZOD SCHEMAS FOR VALIDATION
// =============================================================================

export const insertAthleticConfigSchema = createInsertSchema(athleticConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicConfigSchema = createInsertSchema(academicConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFineArtsConfigSchema = createInsertSchema(fineArtsConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAthleticConfigType = z.infer<typeof insertAthleticConfigSchema>;
export type InsertAcademicConfigType = z.infer<typeof insertAcademicConfigSchema>;
export type InsertFineArtsConfigType = z.infer<typeof insertFineArtsConfigSchema>;

export type AthleticConfigType = typeof athleticConfigs.$inferSelect;
export type AcademicConfigType = typeof academicConfigs.$inferSelect;
export type FineArtsConfigType = typeof fineArtsConfigs.$inferSelect;