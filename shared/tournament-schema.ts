import { pgTable, varchar, text, integer, decimal, boolean, timestamp, date, jsonb, numeric, index, unique } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================================================
// TOURNAMENT SPORTS DATABASE SCHEMA
// =============================================================================
// This schema is isolated in a separate database (DATABASE_URL_TOURNAMENT)
// to separate high-volume tournament data from HIPAA/FERPA protected district data
//
// NOTE: User, District, School, and Student references are "soft" (varchar only, no foreign keys)
// since those tables live in the main District database
// =============================================================================

// =============================================================================
// SPORT CONFIGURATION TABLES
// =============================================================================

// Sport Categories table
export const sportCategories = pgTable("sport_categories", {
  id: varchar("id").primaryKey(),
  categoryName: text("category_name").notNull(),
  categoryDescription: text("category_description"),
  sortOrder: integer("category_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Sport Options table  
export const sportOptions = pgTable("sport_options", {
  id: varchar("id").primaryKey(),
  sportName: text("sport_name").notNull(),
  sportCategory: text("sport_category").notNull(),
  sportSubcategory: text("sport_subcategory"),
  sortOrder: integer("sport_sort_order"),
  competitionType: text("competition_type", { enum: ["bracket", "leaderboard", "series", "bracket-to-series", "both"] }).notNull().default("bracket"),
  scoringMethod: text("scoring_method", { enum: ["wins", "time", "distance", "points", "placement"] }).default("wins"),
  measurementUnit: text("measurement_unit"),
  hasSubEvents: boolean("has_sub_events").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  categoryIdx: index("idx_sport_options_category").on(table.sportCategory),
}));

// Sport Events Schema (sub-events within sports like Track & Field events)
export const sportEvents = pgTable("sport_events", {
  id: varchar("id").primaryKey(),
  eventName: text("event_name").notNull(),
  sportId: varchar("sport_id").notNull().references(() => sportOptions.id),
  eventType: text("event_type").notNull(),
  scoringMethod: text("scoring_method", { enum: ["time", "distance", "height", "points"] }).notNull(),
  measurementUnit: text("measurement_unit").notNull(),
  supportsMetric: boolean("supports_metric").default(true),
  supportsImperial: boolean("supports_imperial").default(true),
  gender: text("gender", { enum: ["men", "women", "boys", "girls", "mixed", "co-ed"] }).default("mixed"),
  ageGroup: text("age_group", { 
    enum: ["elementary", "middle-school", "high-school", "college", "adult", "masters", "senior"] 
  }),
  sortOrder: integer("sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  sportIdx: index("idx_sport_events_sport_id").on(table.sportId),
  sportTypeIdx: index("idx_events_sport_type").on(table.sportId, table.eventType),
}));

// Tournament Structures table
export const tournamentStructures = pgTable("tournament_structures", {
  id: varchar("id").primaryKey(),
  formatName: text("format_name").notNull(),
  formatDescription: text("format_description"),
  formatType: text("format_type"),
  applicableSports: text("applicable_sports"),
  sortOrder: integer("format_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Track Events table
export const trackEvents = pgTable("track_events", {
  id: varchar("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventCategory: text("event_category"),
  measurementType: text("measurement_type"),
  maxAttempt: integer("max_attempt"),
  ribbonPlaces: integer("ribbon_places").default(8),
  usesStakes: text("uses_stakes"),
  eventSortOrder: integer("event_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Track Event Timing Configuration
export const trackEventTiming = pgTable("track_event_timing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackEventId: varchar("track_event_id").notNull().references(() => trackEvents.id),
  timingMethod: text("timing_method").notNull(),
  precisionLevel: text("precision_level").notNull(),
  windMeasurement: boolean("wind_measurement").default(false),
  photoFinish: boolean("photo_finish").default(false),
  reactionTimeTracking: boolean("reaction_time_tracking").default(false),
  intermediateSplits: jsonb("intermediate_splits"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tournament format configurations table
export const tournamentFormatConfigs = pgTable("tournament_format_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentStructureId: varchar("tournament_structure_id").references(() => tournamentStructures.id),
  sportCategory: varchar("sport_category").references(() => sportCategories.id),
  minParticipants: integer("min_participants").notNull().default(2),
  maxParticipants: integer("max_participants"),
  idealParticipants: integer("ideal_participants"),
  bracketGenerationRules: jsonb("bracket_generation_rules"),
  advancementRules: jsonb("advancement_rules"),
  tiebreakerRules: jsonb("tiebreaker_rules"),
  schedulingRequirements: jsonb("scheduling_requirements"),
  venueRequirements: jsonb("venue_requirements"),
  officiatingRequirements: jsonb("officiating_requirements"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Bracket templates table
export const bracketTemplates = pgTable("bracket_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentStructureId: varchar("tournament_structure_id").references(() => tournamentStructures.id),
  participantCount: integer("participant_count").notNull(),
  bracketStructure: jsonb("bracket_structure").notNull(),
  matchSequence: jsonb("match_sequence").notNull(),
  advancementMap: jsonb("advancement_map").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Competition format templates table
export const competitionFormatTemplates = pgTable("competition_format_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").references(() => sportOptions.id),
  templateName: varchar("template_name").notNull(),
  templateDescription: text("template_description"),
  isDefault: boolean("is_default").default(false),
  ageGroupConfig: jsonb("age_group_config"),
  genderDivisionConfig: jsonb("gender_division_config"),
  teamSizeConfig: jsonb("team_size_config"),
  equipmentSpecifications: jsonb("equipment_specifications"),
  gameFormatConfig: jsonb("game_format_config"),
  scoringSystemConfig: jsonb("scoring_system_config"),
  seriesConfig: jsonb("series_config"),
  venueRequirements: jsonb("venue_requirements"),
  officiatingConfig: jsonb("officiating_config"),
  timingConfig: jsonb("timing_config"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Game length templates table
export const gameLengthTemplates = pgTable("game_length_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").references(() => sportOptions.id),
  ageGroup: varchar("age_group").notNull(),
  regulationTime: jsonb("regulation_time").notNull(),
  overtimeRules: jsonb("overtime_rules"),
  breakIntervals: jsonb("break_intervals"),
  timeoutRules: jsonb("timeout_rules"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Series templates table
export const seriesTemplates = pgTable("series_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").references(() => sportOptions.id),
  seriesName: varchar("series_name").notNull(),
  gamesToWin: integer("games_to_win").notNull(),
  maximumGames: integer("maximum_games").notNull(),
  homeFieldAdvantage: boolean("home_field_advantage").default(false),
  gameIntervals: jsonb("game_intervals"),
  tiebreakerRules: jsonb("tiebreaker_rules"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// =============================================================================
// MAIN TOURNAMENT TABLES
// =============================================================================

// Main tournaments table
export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamSize: integer("team_size"),
  competitionFormat: text("competition_format", { enum: ["bracket", "leaderboard", "series", "bracket-to-series", "multi-stage", "round-robin-pools", "elimination-pools", "consolation-bracket", "team-vs-individual", "portfolio-review", "oral-competition", "written-test", "judged-performance", "timed-competition", "scoring-average", "advancement-ladder", "rating-system", "prediction-scoring", "multiple-bracket-system", "three-bracket-system", "guarantee-system", "regional-bracket", "individual-leaderboard", "heat-progression", "elimination-rounds", "performance-ranking", "cumulative-scoring", "time-based-ranking"] }).notNull().default("bracket"),
  status: text("status", { enum: ["draft", "upcoming", "stage-1", "stage-2", "stage-3", "completed"] }).notNull().default("draft"),
  currentStage: integer("current_stage").default(1),
  totalStages: integer("total_stages").default(1),
  stageConfiguration: jsonb("stage_configuration"),
  seriesLength: integer("series_length").default(7),
  bracket: jsonb("bracket").notNull(),
  teams: jsonb("teams").default([]),
  sport: text("sport"),
  sportCategory: text("sport_category"),
  tournamentStructure: text("tournament_structure"),
  ageGroup: text("age_group", { 
    enum: ["Elementary", "Middle School", "High School", "College", "Adult", "Masters", "Senior", "All Ages"] 
  }).default("All Ages"),
  genderDivision: text("gender_division", { 
    enum: ["Men", "Women", "Mixed", "Boys", "Girls", "Co-Ed"] 
  }).default("Mixed"),
  divisions: jsonb("divisions"),
  scoringMethod: text("scoring_method").default("wins"),
  userId: varchar("user_id"), // SOFT REFERENCE to users table in District DB
  whitelabelConfigId: varchar("whitelabel_config_id"), // SOFT REFERENCE to whitelabel configs
  entryFee: numeric("entry_fee").default("0"),
  maxParticipants: integer("max_participants"),
  registrationDeadline: timestamp("registration_deadline"),
  tournamentDate: timestamp("tournament_date", { mode: 'string' }),
  location: text("location"),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  isPublicCalendarVisible: boolean("is_public_calendar_visible").default(false),
  calendarApprovalStatus: text("calendar_approval_status", {
    enum: ["pending", "approved", "rejected", "auto_approved"]
  }).default("pending"),
  calendarRegion: varchar("calendar_region"),
  calendarCity: varchar("calendar_city"),
  calendarStateCode: varchar("calendar_state_code", { length: 2 }),
  calendarCoordinates: jsonb("calendar_coordinates").$type<{
    latitude: number;
    longitude: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("tournaments_user_idx").on(table.userId),
  statusIdx: index("tournaments_status_idx").on(table.status),
  sportIdx: index("tournaments_sport_idx").on(table.sport),
  dateIdx: index("tournaments_date_idx").on(table.tournamentDate),
}));

// Tournament generation log table
export const tournamentGenerationLog = pgTable("tournament_generation_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  generationStep: varchar("generation_step").notNull(),
  stepData: jsonb("step_data"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Matches table
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
  matchDate: timestamp("match_date"),
  venue: text("venue"),
  status: text("status", { enum: ["upcoming", "in-progress", "completed"] }).default("upcoming"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("matches_tournament_idx").on(table.tournamentId),
  roundIdx: index("matches_round_idx").on(table.tournamentId, table.round),
}));

// =============================================================================
// TOURNAMENT DIVISIONS SYSTEM (Multi-Division Kraken)
// =============================================================================

// Tournament divisions table
export const tournamentDivisions = pgTable("tournament_divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  divisionName: varchar("division_name").notNull(),
  divisionType: varchar("division_type").notNull(),
  divisionConfig: jsonb("division_config").notNull(),
  participantCount: integer("participant_count").default(0),
  maxParticipants: integer("max_participants"),
  registrationDeadline: timestamp("registration_deadline"),
  divisionStatus: varchar("division_status").default("open"),
  bracketStructure: jsonb("bracket_structure"),
  advancementRules: jsonb("advancement_rules"),
  prizeStructure: jsonb("prize_structure"),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  tournamentIdx: index("tournament_divisions_tournament_idx").on(table.tournamentId),
}));

// Division participants table
export const divisionParticipants = pgTable("division_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  divisionId: varchar("division_id").references(() => tournamentDivisions.id),
  participantId: varchar("participant_id").notNull(),
  participantName: varchar("participant_name").notNull(),
  participantType: varchar("participant_type").notNull(),
  seedNumber: integer("seed_number"),
  qualificationData: jsonb("qualification_data"),
  registrationTime: timestamp("registration_time").default(sql`now()`),
  status: varchar("status").default("registered"),
}, (table) => ({
  divisionIdx: index("division_participants_division_idx").on(table.divisionId),
}));

// Division templates table
export const divisionTemplates = pgTable("division_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: varchar("template_name").notNull(),
  templateDescription: text("template_description"),
  sportCategory: varchar("sport_category").references(() => sportCategories.id),
  divisionStructure: jsonb("division_structure").notNull(),
  autoGenerationRules: jsonb("auto_generation_rules"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division generation rules table
export const divisionGenerationRules = pgTable("division_generation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  templateId: varchar("template_id").references(() => divisionTemplates.id),
  generationConfig: jsonb("generation_config").notNull(),
  status: varchar("status").default("pending"),
  generatedDivisions: jsonb("generated_divisions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division scheduling table
export const divisionScheduling = pgTable("division_scheduling", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  divisionId: varchar("division_id").references(() => tournamentDivisions.id),
  schedulingConfig: jsonb("scheduling_config").notNull(),
  venueAssignments: jsonb("venue_assignments"),
  timeSlots: jsonb("time_slots"),
  conflictResolution: jsonb("conflict_resolution"),
  optimizationScore: numeric("optimization_score"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division-specific matches
export const divisionMatches = pgTable("division_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  divisionId: varchar("division_id").notNull().references(() => tournamentDivisions.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  round: integer("round").notNull(),
  position: integer("position").notNull(),
  participant1Id: varchar("participant1_id"),
  participant2Id: varchar("participant2_id"),
  participant1Score: integer("participant1_score").default(0),
  participant2Score: integer("participant2_score").default(0),
  winnerId: varchar("winner_id"),
  matchStatus: text("match_status", { enum: ["scheduled", "in_progress", "completed", "cancelled"] }).default("scheduled"),
  matchDate: timestamp("match_date"),
  venue: text("venue"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  divisionIdx: index("division_matches_division_idx").on(table.divisionId),
  tournamentIdx: index("division_matches_tournament_idx").on(table.tournamentId),
}));

// =============================================================================
// TOURNAMENT EVENTS SYSTEM (Track & Field, Swimming, etc.)
// =============================================================================

// Tournament Events Schema (selected events for a tournament)
export const tournamentEvents = pgTable("tournament_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  sportEventId: varchar("sport_event_id").notNull().references(() => sportEvents.id),
  measurementSystem: text("measurement_system", { enum: ["metric", "imperial"] }).default("metric"),
  resultsRecorderId: varchar("results_recorder_id"), // SOFT REFERENCE to users
  resultsRecorderName: varchar("results_recorder_name"),
  resultsRecorderEmail: varchar("results_recorder_email"),
  eventStatus: text("event_status", {
    enum: ["upcoming", "in_progress", "completed", "canceled"]
  }).default("upcoming"),
  eventDateTime: timestamp("event_date_time"),
  eventOrder: integer("event_order").default(1),
  maxParticipants: integer("max_participants"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
}, (table) => ({
  tournamentIdx: index("tournament_events_tournament_idx").on(table.tournamentId),
}));

// Participant Events Schema (individual registrations for events)
export const participantEvents = pgTable("participant_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull().references(() => tournamentEvents.id),
  participantName: text("participant_name").notNull(),
  teamName: text("team_name"),
  bibNumber: text("bib_number"),
  preliminaryResult: numeric("preliminary_result"),
  finalResult: numeric("final_result"),
  placement: integer("placement"),
  isDisqualified: boolean("is_disqualified").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => ({
  eventIdx: index("participant_events_event_idx").on(table.tournamentEventId),
}));

// Event Schools - Schools participating in tournament events
export const eventSchools = pgTable("event_schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull(),
  schoolId: varchar("school_id").notNull(), // SOFT REFERENCE to schools in District DB
  schoolName: varchar("school_name").notNull(),
  division: text("division", {
    enum: ["north", "south", "visiting"]
  }),
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  addedBy: varchar("added_by").notNull(), // SOFT REFERENCE to users
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  eventIdx: index("event_schools_event_idx").on(table.tournamentEventId),
  schoolIdx: index("event_schools_school_idx").on(table.schoolId),
}));

// Event Participants - Individual athletes in events (live roster management)
export const eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull(),
  eventSchoolId: varchar("event_school_id").notNull(),
  athleteName: varchar("athlete_name").notNull(),
  grade: varchar("grade"),
  division: text("division", {
    enum: ["north", "south", "visiting"]
  }),
  participantOrder: integer("participant_order"),
  addedBy: varchar("added_by").notNull(), // SOFT REFERENCE to users
  addedAt: timestamp("added_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  eventIdx: index("event_participants_event_idx").on(table.tournamentEventId),
  schoolIdx: index("event_participants_school_idx").on(table.eventSchoolId),
}));

// Event Results - Individual attempt/performance tracking
export const eventResults = pgTable("event_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").notNull(),
  tournamentEventId: varchar("tournament_event_id").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  resultValue: numeric("result_value"),
  resultUnit: varchar("result_unit").notNull(),
  isFoul: boolean("is_foul").default(false),
  isPersonalBest: boolean("is_personal_best").default(false),
  notes: text("notes"),
  recordedBy: varchar("recorded_by").notNull(), // SOFT REFERENCE to users
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  participantIdx: index("event_results_participant_idx").on(table.participantId),
  eventIdx: index("event_results_event_idx").on(table.tournamentEventId),
}));

// Event Assignments - CCISD-style event assignments
export const eventAssignments = pgTable("event_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull(),
  assignedById: varchar("assigned_by_id").notNull(), // SOFT REFERENCE to users
  assignedToId: varchar("assigned_to_id").notNull(), // SOFT REFERENCE to users (school AD or coach)
  assignmentType: text("assignment_type", {
    enum: ["school_assignment", "coach_assignment"]
  }).notNull(),
  schoolId: varchar("school_id"), // SOFT REFERENCE to schools in District DB
  eventName: varchar("event_name").notNull(),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  eventIdx: index("event_assignments_event_idx").on(table.tournamentEventId),
  assignedToIdx: index("event_assignments_assigned_to_idx").on(table.assignedToId),
}));

// School Event Assignments - district ADs assign schools to events
export const schoolEventAssignments = pgTable("school_event_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  schoolId: varchar("school_id").notNull(), // SOFT REFERENCE to schools in District DB
  assignedById: varchar("assigned_by_id").notNull(), // SOFT REFERENCE to users (District AD)
  eventNames: jsonb("event_names").notNull(),
  schoolAthleticDirectorId: varchar("school_athletic_director_id"), // SOFT REFERENCE to users
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("school_event_assignments_tournament_idx").on(table.tournamentId),
  schoolIdx: index("school_event_assignments_school_idx").on(table.schoolId),
}));

// Coach Event Assignments - school ADs assign coaches to specific events
export const coachEventAssignments = pgTable("coach_event_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolAssignmentId: varchar("school_assignment_id").notNull().references(() => schoolEventAssignments.id),
  coachId: varchar("coach_id").notNull(), // SOFT REFERENCE to users
  assignedById: varchar("assigned_by_id").notNull(), // SOFT REFERENCE to users (School AD)
  eventName: varchar("event_name").notNull(),
  role: text("role", {
    enum: ["head_coach", "assistant_coach", "volunteer_coach"]
  }).default("assistant_coach"),
  responsibilities: text("responsibilities"),
  isActive: boolean("is_active").default(true),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  schoolAssignmentIdx: index("coach_event_assignments_school_idx").on(table.schoolAssignmentId),
  coachIdx: index("coach_event_assignments_coach_idx").on(table.coachId),
}));

// =============================================================================
// LIVE SCORING SYSTEM
// =============================================================================

// Live scoring system with strict access control
export const liveScores = pgTable("live_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  matchId: varchar("match_id").notNull(),
  eventName: varchar("event_name"),
  participant1Id: varchar("participant1_id"),
  participant1Name: varchar("participant1_name").notNull(),
  participant1Score: numeric("participant1_score").default("0"),
  participant2Id: varchar("participant2_id"),
  participant2Name: varchar("participant2_name"),
  participant2Score: numeric("participant2_score").default("0"),
  scoreType: text("score_type", {
    enum: ["points", "time", "distance", "games", "sets", "goals", "runs", "custom"]
  }).default("points"),
  scoreUnit: varchar("score_unit"),
  matchStatus: text("match_status", {
    enum: ["scheduled", "in_progress", "completed", "cancelled", "postponed"]
  }).default("scheduled"),
  winnerId: varchar("winner_id"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  venue: varchar("venue"),
  field: varchar("field"),
  assignedScorekeeperId: varchar("assigned_scorekeeper_id").notNull(), // SOFT REFERENCE to users
  lastUpdatedBy: varchar("last_updated_by"), // SOFT REFERENCE to users
  isLive: boolean("is_live").default(false),
  liveUpdateCount: integer("live_update_count").default(0),
  lastScoreUpdate: timestamp("last_score_update"),
  additionalData: jsonb("additional_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("live_scores_tournament_idx").on(table.tournamentId),
  scorekeeperIdx: index("live_scores_scorekeeper_idx").on(table.assignedScorekeeperId),
}));

// Scorekeeper assignments - WHO can update which events
export const scorekeeperAssignments = pgTable("scorekeeper_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  scorekeeperId: varchar("scorekeeper_id").notNull(), // SOFT REFERENCE to users
  assignedBy: varchar("assigned_by").notNull(), // SOFT REFERENCE to users (Tournament/Athletic Director)
  eventNames: jsonb("event_names").notNull(),
  permissions: jsonb("permissions").$type<{
    canCreateLiveScores: boolean;
    canUpdateScores: boolean;
    canFinalizeResults: boolean;
  }>().default({
    canCreateLiveScores: true,
    canUpdateScores: true,
    canFinalizeResults: false
  }),
  assignmentStatus: text("assignment_status", {
    enum: ["active", "inactive", "revoked"]
  }).default("active"),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("scorekeeper_assignments_tournament_idx").on(table.tournamentId),
  scorekeeperIdx: index("scorekeeper_assignments_scorekeeper_idx").on(table.scorekeeperId),
}));

// Live score messages - Communication between scorekeepers and tournament managers
export const liveScoreMessages = pgTable("live_score_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  liveScoreId: varchar("live_score_id").notNull().references(() => liveScores.id),
  senderId: varchar("sender_id").notNull(), // SOFT REFERENCE to users
  messageType: text("message_type", {
    enum: ["score_question", "rules_clarification", "technical_issue", "update_notification", "general"]
  }).default("general"),
  messageContent: text("message_content").notNull(),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"), // SOFT REFERENCE to users
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  liveScoreIdx: index("live_score_messages_live_score_idx").on(table.liveScoreId),
}));

// Score update log - Track all scoring changes for audit trail
export const scoreUpdateLog = pgTable("score_update_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  liveScoreId: varchar("live_score_id").notNull().references(() => liveScores.id),
  updatedBy: varchar("updated_by").notNull(), // SOFT REFERENCE to users
  previousScore: jsonb("previous_score").notNull(),
  newScore: jsonb("new_score").notNull(),
  updateReason: text("update_reason"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  liveScoreIdx: index("score_update_log_live_score_idx").on(table.liveScoreId),
}));

// Event scores - scorekeepers update scores for their assigned events
export const eventScores = pgTable("event_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  assignmentId: varchar("assignment_id").notNull().references(() => scorekeeperAssignments.id),
  teamId: varchar("team_id"),
  participantName: varchar("participant_name").notNull(),
  eventName: varchar("event_name").notNull(),
  scoreValue: numeric("score_value"),
  scoreUnit: varchar("score_unit"),
  placement: integer("placement"),
  notes: text("notes"),
  scoredAt: timestamp("scored_at").defaultNow(),
  scoredById: varchar("scored_by_id").notNull(), // SOFT REFERENCE to users
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("event_scores_tournament_idx").on(table.tournamentId),
}));

// =============================================================================
// GEOLOCATION & VENUE MANAGEMENT
// =============================================================================

// Geolocation-based event tracking
export const eventLocations = pgTable("event_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  eventName: varchar("event_name").notNull(),
  venueName: varchar("venue_name").notNull(),
  address: text("address").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  geofenceRadius: integer("geofence_radius").default(100),
  allowRemoteScoring: boolean("allow_remote_scoring").default(false),
  requireLocationVerification: boolean("require_location_verification").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("event_locations_tournament_idx").on(table.tournamentId),
}));

// Location check-ins for participants and scorekeepers
export const locationCheckIns = pgTable("location_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // SOFT REFERENCE to users
  eventLocationId: varchar("event_location_id").notNull().references(() => eventLocations.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  checkInLatitude: numeric("check_in_latitude", { precision: 10, scale: 8 }).notNull(),
  checkInLongitude: numeric("check_in_longitude", { precision: 11, scale: 8 }).notNull(),
  distanceFromVenue: integer("distance_from_venue"),
  checkInType: text("check_in_type", {
    enum: ["participant_arrival", "scorekeeper_arrival", "event_start", "event_end", "score_update"]
  }).notNull(),
  verificationStatus: text("verification_status", {
    enum: ["verified", "outside_range", "manual_override", "failed"]
  }).default("verified"),
  checkInTime: timestamp("check_in_time").defaultNow(),
  notes: text("notes"),
}, (table) => ({
  eventLocationIdx: index("location_check_ins_event_location_idx").on(table.eventLocationId),
  userIdx: index("location_check_ins_user_idx").on(table.userId),
}));

// Location-based scoring permissions
export const locationScoringPermissions = pgTable("location_scoring_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scorekeeperId: varchar("scorekeeper_id").notNull(), // SOFT REFERENCE to users
  eventLocationId: varchar("event_location_id").notNull().references(() => eventLocations.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  isLocationVerified: boolean("is_location_verified").default(false),
  lastLocationCheck: timestamp("last_location_check"),
  locationCheckLatitude: numeric("location_check_latitude", { precision: 10, scale: 8 }),
  locationCheckLongitude: numeric("location_check_longitude", { precision: 11, scale: 8 }),
  distanceFromVenue: integer("distance_from_venue"),
  canScoreRemotely: boolean("can_score_remotely").default(false),
  permissionGrantedBy: varchar("permission_granted_by"), // SOFT REFERENCE to users
  permissionNotes: text("permission_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  scorekeeperIdx: index("location_scoring_permissions_scorekeeper_idx").on(table.scorekeeperId),
}));

// =============================================================================
// TOURNAMENT SUBSCRIPTIONS & NOTIFICATIONS
// =============================================================================

// Tournament notification subscriptions
export const tournamentSubscriptions = pgTable("tournament_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  sports: jsonb("sports").$type<string[]>().default([]),
  location: varchar("location"),
  frequency: text("frequency", {
    enum: ["immediate", "daily", "weekly"]
  }).default("weekly"),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  lastNotified: timestamp("last_notified"),
  unsubscribeToken: varchar("unsubscribe_token").unique().default(sql`gen_random_uuid()`),
  source: varchar("source").default("landing_page"),
}, (table) => ({
  emailIdx: index("tournament_subscriptions_email_idx").on(table.email),
}));

// Tournament Coordination Intelligence System
export const tournamentCoordinationData = pgTable("tournament_coordination_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  coordinationRegion: varchar("coordination_region"),
  coordinationRadius: integer("coordination_radius").default(50),
  nearbyTournaments: jsonb("nearby_tournaments").$type<string[]>().default([]),
  dateConflictLevel: text("date_conflict_level", {
    enum: ["none", "low", "medium", "high", "critical"]
  }).default("none"),
  conflictingTournaments: jsonb("conflicting_tournaments").$type<{
    tournamentId: string;
    conflictType: "same_date" | "same_weekend" | "same_sport_same_date" | "nearby_same_sport";
    impactLevel: "low" | "medium" | "high";
    distance?: number;
  }[]>().default([]),
  collaborationOpportunities: jsonb("collaboration_opportunities").$type<{
    tournamentId: string;
    opportunityType: "feeder_event" | "cross_promotion" | "shared_resources" | "sequential_dates";
    description: string;
    potentialBenefit: "low" | "medium" | "high";
  }[]>().default([]),
  recommendedDates: jsonb("recommended_dates").$type<{
    date: string;
    reason: string;
    participationBoost: number;
    conflictReduction: number;
  }[]>().default([]),
  circuitData: jsonb("circuit_data").$type<{
    isPartOfCircuit: boolean;
    circuitName?: string;
    circuitPosition?: "entry" | "intermediate" | "championship" | "standalone";
    feederEvents?: string[];
    advancementEvents?: string[];
  }>().default({
    isPartOfCircuit: false
  }),
  participationForecast: integer("participation_forecast"),
  marketGapAnalysis: jsonb("market_gap_analysis").$type<{
    underservedAgeGroups: string[];
    underservedSports: string[];
    optimalNewTournamentDates: string[];
    growthOpportunities: string[];
  }>(),
  coordinationScore: decimal("coordination_score", { precision: 5, scale: 2 }),
  lastAnalysisDate: timestamp("last_analysis_date").defaultNow(),
  analysisVersion: varchar("analysis_version").default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("tournament_coordination_data_tournament_idx").on(table.tournamentId),
}));

// Tournament Organizer Network for collaboration
export const tournamentOrganizerNetwork = pgTable("tournament_organizer_network", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull(), // SOFT REFERENCE to users
  organizerName: varchar("organizer_name").notNull(),
  organizerEmail: varchar("organizer_email").notNull(),
  organization: varchar("organization"),
  primarySports: jsonb("primary_sports").$type<string[]>().default([]),
  serviceArea: varchar("service_area"),
  serviceRadius: integer("service_radius").default(25),
  openToCollaboration: boolean("open_to_collaboration").default(true),
  collaborationTypes: jsonb("collaboration_types").$type<string[]>().default([]),
  resourcesAvailable: jsonb("resources_available").$type<{
    equipment?: string[];
    venues?: string[];
    volunteers?: number;
    expertise?: string[];
  }>().default({}),
  totalTournamentsOrganized: integer("total_tournaments_organized").default(0),
  averageParticipation: integer("average_participation"),
  collaborationHistory: jsonb("collaboration_history").$type<{
    partnerId: string;
    tournamentId: string;
    collaborationType: string;
    outcome: "successful" | "neutral" | "unsuccessful";
    date: string;
  }[]>().default([]),
  networkRating: decimal("network_rating", { precision: 3, scale: 2 }).default("0.00"),
  collaborationCount: integer("collaboration_count").default(0),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  organizerIdx: index("tournament_organizer_network_organizer_idx").on(table.organizerId),
}));

// Regional Tournament Circuits for strategic coordination
export const regionalTournamentCircuits = pgTable("regional_tournament_circuits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circuitName: varchar("circuit_name").notNull(),
  region: varchar("region").notNull(),
  primarySport: varchar("primary_sport").notNull(),
  seasonStartDate: date("season_start_date"),
  seasonEndDate: date("season_end_date"),
  circuitType: text("circuit_type", {
    enum: ["progression", "championship_series", "league", "tournament_trail"]
  }).default("progression"),
  entryLevelEvents: jsonb("entry_level_events").$type<string[]>().default([]),
  intermediateEvents: jsonb("intermediate_events").$type<string[]>().default([]),
  championshipEvents: jsonb("championship_events").$type<string[]>().default([]),
  minimumDaysBetweenEvents: integer("minimum_days_between_events").default(7),
  maximumRadius: integer("maximum_radius").default(100),
  participationRequirements: jsonb("participation_requirements").$type<{
    minimumEvents?: number;
    qualificationCriteria?: string[];
    ageRestrictions?: string[];
  }>().default({}),
  totalParticipants: integer("total_participants").default(0),
  averageParticipantsPerEvent: integer("average_participants_per_event").default(0),
  participationGrowth: decimal("participation_growth", { precision: 5, scale: 2 }).default("0.00"),
  circuitCoordinatorId: varchar("circuit_coordinator_id"), // SOFT REFERENCE to users
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  regionIdx: index("regional_tournament_circuits_region_idx").on(table.region),
}));

// =============================================================================
// MESSAGING & COMMUNICATION SYSTEM
// =============================================================================

// Email campaigns for marketing
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // SOFT REFERENCE to users
  name: varchar("name").notNull(),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  status: text("status", {
    enum: ["draft", "scheduled", "sent", "cancelled"]
  }).default("draft"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("email_campaigns_user_idx").on(table.userId),
}));

// Campaign recipients tracking
export const campaignRecipients = pgTable("campaign_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => emailCampaigns.id),
  contactId: varchar("contact_id").notNull(),
  status: text("status", {
    enum: ["pending", "sent", "delivered", "opened", "clicked", "bounced", "failed"]
  }).default("pending"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  campaignIdx: index("campaign_recipients_campaign_idx").on(table.campaignId),
}));

// Internal messaging system for tournaments and teams
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull(), // SOFT REFERENCE to users
  messageType: text("message_type", {
    enum: ["tournament_update", "team_notification", "payment_reminder", "document_deadline", "game_schedule", "broadcast", "direct_message", "fantasy_smack_talk", "business_announcement", "league_update"]
  }).notNull(),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  priority: text("priority", {
    enum: ["low", "normal", "high", "urgent"]
  }).default("normal"),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  teamId: varchar("team_id"),
  fantasyLeagueId: varchar("fantasy_league_id"),
  businessOrgId: varchar("business_org_id"),
  targetRoles: jsonb("target_roles").$type<string[]>().default([]),
  domainType: text("domain_type", {
    enum: ["tournament", "fantasy", "business"]
  }).default("tournament"),
  isDirectorBlast: boolean("is_director_blast").default(false),
  totalRecipients: integer("total_recipients").default(0),
  deliveredCount: integer("delivered_count").default(0),
  readCount: integer("read_count").default(0),
  pushNotificationSent: boolean("push_notification_sent").default(false),
  pushNotificationData: jsonb("push_notification_data").$type<{
    title: string;
    body: string;
    icon?: string;
    badge?: number;
    sound?: string;
    clickAction?: string;
  }>(),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  senderIdx: index("messages_sender_idx").on(table.senderId),
  tournamentIdx: index("messages_tournament_idx").on(table.tournamentId),
}));

// Message recipients tracking for mobile app notifications
export const messageRecipients = pgTable("message_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(), // SOFT REFERENCE to users
  userRole: text("user_role", {
    enum: ["tournament_manager", "coach", "parent", "player", "scorekeeper"]
  }).notNull(),
  deliveryStatus: text("delivery_status", {
    enum: ["pending", "delivered", "read", "failed"]
  }).default("pending"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  pushTokens: jsonb("push_tokens").$type<string[]>().default([]),
  pushDeliveryStatus: text("push_delivery_status", {
    enum: ["not_sent", "sent", "delivered", "failed"]
  }).default("not_sent"),
  pushDeliveredAt: timestamp("push_delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageIdx: index("message_recipients_message_idx").on(table.messageId),
  userIdx: index("message_recipients_user_idx").on(table.userId),
}));

// Mobile app device registration for push notifications
export const mobileDevices = pgTable("mobile_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // SOFT REFERENCE to users
  deviceId: varchar("device_id").notNull(),
  platform: text("platform", {
    enum: ["ios", "android", "web"]
  }).notNull(),
  fcmToken: varchar("fcm_token"),
  apnsToken: varchar("apns_token"),
  appVersion: varchar("app_version"),
  osVersion: varchar("os_version"),
  deviceModel: varchar("device_model"),
  notificationSettings: jsonb("notification_settings").$type<{
    tournamentUpdates: boolean;
    teamNotifications: boolean;
    paymentReminders: boolean;
    gameSchedules: boolean;
    generalAnnouncements: boolean;
    quietHours?: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  }>().default({
    tournamentUpdates: true,
    teamNotifications: true,
    paymentReminders: true,
    gameSchedules: true,
    generalAnnouncements: true
  }),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("mobile_devices_user_idx").on(table.userId),
}));

// Message usage tracking for tier limits
export const messageUsage = pgTable("message_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // SOFT REFERENCE to users
  month: varchar("month").notNull(),
  messagesUsed: integer("messages_used").default(0),
  messageLimit: integer("message_limit").default(50),
  tournamentUpdates: integer("tournament_updates").default(0),
  teamNotifications: integer("team_notifications").default(0),
  paymentReminders: integer("payment_reminders").default(0),
  broadcasts: integer("broadcasts").default(0),
  directMessages: integer("direct_messages").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("message_usage_user_idx").on(table.userId),
}));

// =============================================================================
// CORPORATE COMPETITION SYSTEM
// =============================================================================

// Company Management
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  industry: varchar("industry"),
  contactEmail: varchar("contact_email").notNull(),
  estimatedEmployees: varchar("estimated_employees"),
  subscriptionTier: varchar("subscription_tier").default("starter"),
  codePrefix: varchar("code_prefix").notNull(),
  activeCompetitions: integer("active_competitions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Corporate Competition Types - Sales, Production, Corporate Events
export const corporateCompetitions = pgTable("corporate_competitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: varchar("name").notNull(),
  competitionType: varchar("competition_type").notNull(),
  trackingMetric: varchar("tracking_metric").notNull(),
  competitionFormat: varchar("competition_format").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status").notNull().default("planning"),
  revenueGoal: numeric("revenue_goal"),
  unitsSoldGoal: integer("units_sold_goal"),
  salesTargets: jsonb("sales_targets").$type<{
    individual?: number;
    team?: number;
    department?: number;
    territory?: string[];
  }>(),
  productionTarget: integer("production_target"),
  qualityThreshold: integer("quality_threshold"),
  efficiencyMetric: varchar("efficiency_metric"),
  productionGoals: jsonb("production_goals").$type<{
    dailyTarget?: number;
    weeklyTarget?: number;
    monthlyTarget?: number;
    qualityStandard?: number;
  }>(),
  customMetrics: jsonb("custom_metrics").$type<Array<{
    name: string;
    type: 'number' | 'percentage' | 'time' | 'boolean';
    target?: number;
    description?: string;
  }>>(),
  departments: text("departments").array(),
  registrationCodes: jsonb("registration_codes").$type<Record<string, {
    department: string;
    maxParticipants?: number;
    isActive: boolean;
    generatedAt: string;
  }>>(),
  prizeStructure: jsonb("prize_structure").$type<{
    firstPlace?: string;
    topThree?: string[];
    departmentWinner?: string;
    participationReward?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyIdx: index("corporate_competitions_company_idx").on(table.companyId),
}));

// Corporate Participants
export const corporateParticipants = pgTable("corporate_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  userId: varchar("user_id").notNull(), // SOFT REFERENCE to users
  employeeId: varchar("employee_id"),
  department: varchar("department").notNull(),
  role: varchar("role").notNull(),
  teamName: varchar("team_name"),
  registrationCode: varchar("registration_code").notNull(),
  currentScore: numeric("current_score").default("0"),
  currentRank: integer("current_rank"),
  personalGoal: numeric("personal_goal"),
  territory: varchar("territory"),
  shift: varchar("shift"),
  startDate: timestamp("start_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  competitionIdx: index("corporate_participants_competition_idx").on(table.competitionId),
}));

// Performance Metrics Tracking
export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  participantId: varchar("participant_id").notNull().references(() => corporateParticipants.id),
  metricType: varchar("metric_type").notNull(),
  metricValue: numeric("metric_value").notNull(),
  recordedDate: timestamp("recorded_date").notNull(),
  shift: varchar("shift"),
  productType: varchar("product_type"),
  territory: varchar("territory"),
  customerType: varchar("customer_type"),
  qualityScore: integer("quality_score"),
  defectCount: integer("defect_count").default(0),
  verifiedBy: varchar("verified_by"),
  verificationStatus: varchar("verification_status").default("pending"),
  verificationNotes: text("verification_notes"),
  source: varchar("source").default("manual"),
  batchId: varchar("batch_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  competitionIdx: index("performance_metrics_competition_idx").on(table.competitionId),
}));

// Competition Leaderboards - Real-time rankings
export const competitionLeaderboards = pgTable("competition_leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  participantId: varchar("participant_id").notNull().references(() => corporateParticipants.id),
  currentRank: integer("current_rank").notNull(),
  previousRank: integer("previous_rank"),
  totalScore: numeric("total_score").notNull(),
  dailyAverage: numeric("daily_average"),
  weeklyTotal: numeric("weekly_total"),
  monthlyTotal: numeric("monthly_total"),
  goalProgress: numeric("goal_progress"),
  streakDays: integer("streak_days").default(0),
  personalBest: numeric("personal_best"),
  departmentRank: integer("department_rank"),
  teamRank: integer("team_rank"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  competitionIdx: index("competition_leaderboards_competition_idx").on(table.competitionId),
}));

// =============================================================================
// PAYMENT & FINANCIAL SYSTEM
// =============================================================================

// Discount codes - Tournament-specific discount codes
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  code: varchar("code").notNull().unique(),
  description: varchar("description"),
  discountType: text("discount_type", {
    enum: ["percentage", "fixed_amount"]
  }).notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(), // SOFT REFERENCE to users
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("discount_codes_tournament_idx").on(table.tournamentId),
  codeIdx: index("discount_codes_code_idx").on(table.code),
}));

// Payment Plans for Registration Forms (Jersey Watch-style installment payments)
export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  planName: varchar("plan_name").notNull(),
  planType: text("plan_type", {
    enum: ["monthly", "quarterly", "custom"]
  }).notNull(),
  minimumAmount: numeric("minimum_amount", { precision: 10, scale: 2 }).notNull(),
  installmentCount: integer("installment_count").notNull(),
  firstPaymentPercentage: numeric("first_payment_percentage", { precision: 5, scale: 2 }).default("50.00"),
  processingFeePercentage: numeric("processing_fee_percentage", { precision: 5, scale: 2 }).default("2.50"),
  cutoffDaysBeforeTournament: integer("cutoff_days_before_tournament").default(14),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("payment_plans_tournament_idx").on(table.tournamentId),
}));

// Payment Plan Enrollments - Track who enrolled in payment plans
export const paymentPlanEnrollments = pgTable("payment_plan_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationId: varchar("registration_id").notNull(),
  paymentPlanId: varchar("payment_plan_id").notNull().references(() => paymentPlans.id),
  participantEmail: varchar("participant_email").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  processingFee: numeric("processing_fee", { precision: 10, scale: 2 }).notNull(),
  firstPaymentAmount: numeric("first_payment_amount", { precision: 10, scale: 2 }).notNull(),
  remainingPaymentAmount: numeric("remaining_payment_amount", { precision: 10, scale: 2 }).notNull(),
  enrollmentStatus: text("enrollment_status", {
    enum: ["active", "completed", "defaulted", "canceled"]
  }).default("active"),
  stripeCustomerId: varchar("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  paymentPlanIdx: index("payment_plan_enrollments_plan_idx").on(table.paymentPlanId),
}));

// Payment Plan Installments - Individual payment schedule
export const paymentPlanInstallments = pgTable("payment_plan_installments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull().references(() => paymentPlanEnrollments.id),
  installmentNumber: integer("installment_number").notNull(),
  dueDate: date("due_date").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "failed", "overdue"]
  }).default("pending"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  paidDate: timestamp("paid_date"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  enrollmentIdx: index("payment_plan_installments_enrollment_idx").on(table.enrollmentId),
}));

// Tournament credits purchases tracking
export const tournamentCredits = pgTable("tournament_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // SOFT REFERENCE to users
  packageType: text("package_type", {
    enum: ["single_tournament", "tournament_5_pack", "tournament_10_pack", "monthly_boost"]
  }).notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  priceAmount: decimal("price_amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripe_payment_id"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  expiresAt: timestamp("expires_at"),
  status: text("status", {
    enum: ["pending", "completed", "failed", "refunded"]
  }).default("pending"),
}, (table) => ({
  userIdx: index("tournament_credits_user_idx").on(table.userId),
}));

// =============================================================================
// MERCHANDISE & WEBSTORE SYSTEM
// =============================================================================

// Merchandise products table
export const merchandiseProducts = pgTable("merchandise_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  tournamentId: varchar("tournament_id"),
  name: varchar("name").notNull(),
  description: text("description"),
  category: text("category", { 
    enum: ["apparel", "accessories", "equipment", "digital", "food_beverage", "custom"] 
  }).notNull(),
  subCategory: varchar("sub_category"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  variants: jsonb("variants").$type<Array<{
    id: string;
    name: string;
    type: "size" | "color" | "style" | "custom";
    priceAdjustment: number;
    inventory: number;
    sku?: string;
  }>>().default([]),
  images: jsonb("images").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  inventory: integer("inventory").default(0),
  maxQuantityPerOrder: integer("max_quantity_per_order").default(10),
  customizationOptions: jsonb("customization_options").$type<{
    allowNamePersonalization?: boolean;
    allowNumberPersonalization?: boolean;
    personalizationFee?: number;
    customFields?: Array<{
      fieldName: string;
      fieldType: "text" | "number" | "select" | "multiselect";
      required: boolean;
      options?: string[];
    }>;
  }>(),
  shippingInfo: jsonb("shipping_info").$type<{
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    shippingClass?: "standard" | "expedited" | "digital" | "pickup_only";
  }>(),
  availabilityWindow: jsonb("availability_window").$type<{
    startDate?: string;
    endDate?: string;
    preOrderOnly?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  tournamentIdx: index("merchandise_products_tournament_idx").on(table.tournamentId),
}));

// Merchandise orders table
export const merchandiseOrders = pgTable("merchandise_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  tournamentId: varchar("tournament_id"),
  customerId: varchar("customer_id").notNull(),
  customerInfo: jsonb("customer_info").$type<{
    name: string;
    email: string;
    phone?: string;
    participantName?: string;
    teamName?: string;
  }>().notNull(),
  items: jsonb("items").$type<Array<{
    productId: string;
    productName: string;
    variantId?: string;
    variantName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customization?: {
      playerName?: string;
      playerNumber?: string;
      customFields?: Record<string, string>;
    };
  }>>().notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }).default("0"),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: jsonb("shipping_address").$type<{
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  paymentInfo: jsonb("payment_info").$type<{
    paymentMethod: string;
    paymentId: string;
    paymentStatus: "pending" | "completed" | "failed" | "refunded";
    transactionDate: string;
  }>().notNull(),
  fulfillmentStatus: text("fulfillment_status", {
    enum: ["pending", "processing", "shipped", "delivered", "pickup_ready", "completed", "cancelled"]
  }).default("pending"),
  trackingInfo: jsonb("tracking_info").$type<{
    carrier?: string;
    trackingNumber?: string;
    shippedDate?: string;
    estimatedDelivery?: string;
  }>(),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  tournamentIdx: index("merchandise_orders_tournament_idx").on(table.tournamentId),
}));

// Event tickets table for webstore
export const eventTickets = pgTable("event_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  tournamentId: varchar("tournament_id"),
  eventId: varchar("event_id"),
  name: varchar("name").notNull(),
  description: text("description"),
  ticketType: text("ticket_type", {
    enum: ["general_admission", "reserved_seating", "vip", "season_pass", "day_pass", "group"]
  }).notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  maxQuantityPerOrder: integer("max_quantity_per_order").default(10),
  totalAvailable: integer("total_available"),
  sold: integer("sold").default(0),
  salesStartDate: timestamp("sales_start_date"),
  salesEndDate: timestamp("sales_end_date"),
  eventDate: timestamp("event_date"),
  isActive: boolean("is_active").default(true),
  ticketBenefits: jsonb("ticket_benefits").$type<string[]>().default([]),
  accessLevel: text("access_level", {
    enum: ["basic", "premium", "vip", "all_access"]
  }).default("basic"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  tournamentIdx: index("event_tickets_tournament_idx").on(table.tournamentId),
}));

// Ticket sales/orders table
export const ticketOrders = pgTable("ticket_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  tournamentId: varchar("tournament_id"),
  customerId: varchar("customer_id").notNull(),
  customerInfo: jsonb("customer_info").$type<{
    name: string;
    email: string;
    phone?: string;
  }>().notNull(),
  tickets: jsonb("tickets").$type<Array<{
    ticketId: string;
    ticketName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>>().notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentInfo: jsonb("payment_info").$type<{
    paymentMethod: string;
    paymentId: string;
    paymentStatus: "pending" | "completed" | "failed" | "refunded";
    transactionDate: string;
  }>().notNull(),
  deliveryMethod: text("delivery_method", {
    enum: ["email", "pickup", "mobile"]
  }).default("email"),
  ticketStatus: text("ticket_status", {
    enum: ["active", "used", "cancelled", "refunded"]
  }).default("active"),
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  tournamentIdx: index("ticket_orders_tournament_idx").on(table.tournamentId),
}));

// =============================================================================
// TOURNAMENT REGISTRATION SYSTEM
// =============================================================================

// Tournament Registration Forms - Define what data to collect for tournament registration
export const tournamentRegistrationForms = pgTable("tournament_registration_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  organizerId: varchar("organizer_id").notNull(), // SOFT REFERENCE to users
  formName: varchar("form_name").notNull(),
  formDescription: text("form_description"),
  targetDivisions: jsonb("target_divisions").$type<string[]>(),
  targetEvents: jsonb("target_events").$type<string[]>(),
  participantCriteria: jsonb("participant_criteria").$type<{
    ageRange?: { min: number; max: number };
    gender?: "men" | "women" | "boys" | "girls" | "mixed" | "co-ed";
    skillLevel?: "beginner" | "intermediate" | "advanced" | "expert";
    sport?: string;
    participantType?: "individual" | "team";
  }>(),
  collectsContactInfo: boolean("collects_contact_info").default(true),
  collectsEmergencyContact: boolean("collects_emergency_contact").default(false),
  collectsMedicalInfo: boolean("collects_medical_info").default(false),
  requiresPayment: boolean("requires_payment").default(false),
  entryFee: numeric("entry_fee").default("0"),
  isActive: boolean("is_active").default(true),
  registrationDeadline: timestamp("registration_deadline"),
  maxRegistrations: integer("max_registrations"),
  currentRegistrations: integer("current_registrations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("tournament_registration_forms_tournament_idx").on(table.tournamentId),
}));

// Registration Submissions - Individual participant submissions
export const registrationSubmissions = pgTable("registration_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull().references(() => tournamentRegistrationForms.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  participantName: varchar("participant_name").notNull(),
  participantType: text("participant_type", { enum: ["individual", "team"] }).notNull(),
  teamName: varchar("team_name"),
  teamMembers: jsonb("team_members").$type<Array<{
    name: string;
    position?: string;
    grade?: string;
  }>>(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  emergencyContact: jsonb("emergency_contact").$type<{
    name: string;
    phone: string;
    relationship: string;
  }>(),
  age: integer("age"),
  grade: varchar("grade"),
  gender: text("gender", { enum: ["men", "women", "boys", "girls", "mixed", "co-ed", "other"] }),
  skillLevel: text("skill_level", { enum: ["beginner", "intermediate", "advanced", "expert"] }),
  requestedEventIds: jsonb("requested_event_ids").$type<string[]>(),
  eventPreferences: jsonb("event_preferences").$type<{
    priority: 'high' | 'medium' | 'low';
    notes?: string;
  }[]>(),
  assignedDivisionId: varchar("assigned_division_id").references(() => tournamentDivisions.id),
  assignedEventIds: jsonb("assigned_event_ids").$type<string[]>(),
  assignmentStatus: text("assignment_status", {
    enum: ["pending", "assigned", "confirmed", "waitlisted", "rejected"]
  }).default("pending"),
  seedNumber: integer("seed_number"),
  registrationStatus: text("registration_status", {
    enum: ["draft", "submitted", "approved", "rejected", "withdrawn"]
  }).default("draft"),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "pending", "paid", "refunded"]
  }).default("unpaid"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  submittedAt: timestamp("submitted_at"),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by"), // SOFT REFERENCE to users
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  formIdx: index("registration_submissions_form_idx").on(table.formId),
  tournamentIdx: index("registration_submissions_tournament_idx").on(table.tournamentId),
}));

// Registration Assignment Log - Track smart matching decisions
export const registrationAssignmentLog = pgTable("registration_assignment_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull().references(() => registrationSubmissions.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  matchingCriteria: jsonb("matching_criteria").notNull(),
  availableTargets: jsonb("available_targets").notNull(),
  selectedTarget: jsonb("selected_target").notNull(),
  capacitySnapshot: jsonb("capacity_snapshot").$type<{
    divisionId?: string;
    eventId?: string;
    currentCount: number;
    maxCapacity: number;
    waitlistCount: number;
  }>(),
  assignmentReason: text("assignment_reason").notNull(),
  wasAutomaticAssignment: boolean("was_automatic_assignment").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  submissionIdx: index("registration_assignment_log_submission_idx").on(table.submissionId),
}));

// Team registrations - Jersey Watch-style team creation with shareable codes
export const teamRegistrations = pgTable("team_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  coachId: varchar("coach_id"), // SOFT REFERENCE to users (Optional - for logged in users)
  teamName: varchar("team_name").notNull(),
  organizationName: varchar("organization_name"),
  teamCode: varchar("team_code").notNull().unique(),
  captainName: varchar("captain_name").notNull(),
  captainEmail: varchar("captain_email").notNull(),
  captainPhone: varchar("captain_phone"),
  paymentMethod: text("payment_method", {
    enum: ["captain_pays_all", "individual_payments", "mixed"]
  }).default("individual_payments"),
  playerList: jsonb("player_list"),
  registeredEvents: jsonb("registered_events"),
  registrationStatus: text("registration_status", {
    enum: ["draft", "pending_approval", "approved", "rejected", "payment_pending", "active"]
  }).default("draft"),
  totalFee: numeric("total_fee", { precision: 10, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default("0"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  requiredDocuments: jsonb("required_documents").$type<Array<{
    type: string;
    name: string;
    required: boolean;
    description?: string;
  }>>().default([]),
  documentComplianceStatus: text("document_compliance_status", {
    enum: ["incomplete", "pending_review", "complete", "issues"]
  }).default("incomplete"),
  registrationDate: timestamp("registration_date").defaultNow(),
  notes: text("notes"),
  approvalNotes: text("approval_notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  tournamentIdx: index("team_registrations_tournament_idx").on(table.tournamentId),
  teamCodeIdx: index("team_registrations_team_code_idx").on(table.teamCode),
}));

// Jersey Watch-style team members within a team registration
export const jerseyTeamMembers = pgTable("jersey_team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamRegistrationId: varchar("team_registration_id").notNull().references(() => teamRegistrations.id),
  playerName: varchar("player_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  jerseyNumber: varchar("jersey_number"),
  position: varchar("position"),
  parentName: varchar("parent_name").notNull(),
  parentEmail: varchar("parent_email").notNull(),
  parentPhone: varchar("parent_phone"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  memberStatus: text("member_status", {
    enum: ["invited", "registered", "payment_pending", "complete"]
  }).default("invited"),
  registrationFee: numeric("registration_fee", { precision: 10, scale: 2 }).default("0"),
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default("0"),
  paymentDate: timestamp("payment_date"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  documentsSubmitted: jsonb("documents_submitted").$type<Array<{
    documentType: string;
    documentUrl: string;
    uploadedAt: string;
  }>>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  teamIdx: index("jersey_team_members_team_idx").on(table.teamRegistrationId),
}));

// Jersey team payments tracking
export const jerseyTeamPayments = pgTable("jersey_team_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamRegistrationId: varchar("team_registration_id").notNull().references(() => teamRegistrations.id),
  memberId: varchar("member_id").references(() => jerseyTeamMembers.id),
  payerEmail: varchar("payer_email").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: text("payment_type", {
    enum: ["team_captain_payment", "individual_payment", "partial_payment"]
  }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  paymentStatus: text("payment_status", {
    enum: ["pending", "processing", "completed", "failed", "refunded"]
  }).default("pending"),
  paymentDate: timestamp("payment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  teamIdx: index("jersey_team_payments_team_idx").on(table.teamRegistrationId),
}));

// =============================================================================
// INSERT SCHEMAS & TYPE EXPORTS
// =============================================================================

// Sport configuration types and schemas
export type SportCategory = typeof sportCategories.$inferSelect;
export type InsertSportCategory = typeof sportCategories.$inferInsert;
export type SportOption = typeof sportOptions.$inferSelect;
export type InsertSportOption = typeof sportOptions.$inferInsert;
export type SportEvent = typeof sportEvents.$inferSelect;
export type InsertSportEvent = typeof sportEvents.$inferInsert;

export const insertSportCategorySchema = createInsertSchema(sportCategories);
export const insertSportOptionSchema = createInsertSchema(sportOptions);
export const insertSportEventSchema = createInsertSchema(sportEvents);

// Tournament types and schemas
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;
export type TournamentDivision = typeof tournamentDivisions.$inferSelect;
export type InsertTournamentDivision = typeof tournamentDivisions.$inferInsert;

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

export const insertTournamentDivisionSchema = createInsertSchema(tournamentDivisions).omit({
  id: true,
  createdAt: true,
});

// Live scoring types and schemas
export type LiveScore = typeof liveScores.$inferSelect;
export type InsertLiveScore = typeof liveScores.$inferInsert;
export type ScorekeeperAssignment = typeof scorekeeperAssignments.$inferSelect;
export type InsertScorekeeperAssignment = typeof scorekeeperAssignments.$inferInsert;

export const insertLiveScoreSchema = createInsertSchema(liveScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScorekeeperAssignmentSchema = createInsertSchema(scorekeeperAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Registration types and schemas
export type TournamentRegistrationForm = typeof tournamentRegistrationForms.$inferSelect;
export type InsertTournamentRegistrationForm = typeof tournamentRegistrationForms.$inferInsert;
export type RegistrationSubmission = typeof registrationSubmissions.$inferSelect;
export type InsertRegistrationSubmission = typeof registrationSubmissions.$inferInsert;
export type TeamRegistration = typeof teamRegistrations.$inferSelect;
export type InsertTeamRegistration = typeof teamRegistrations.$inferInsert;

export const insertTournamentRegistrationFormSchema = createInsertSchema(tournamentRegistrationForms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRegistrationSubmissionSchema = createInsertSchema(registrationSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamRegistrationSchema = createInsertSchema(teamRegistrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Merchandise & tickets types and schemas
export type MerchandiseProduct = typeof merchandiseProducts.$inferSelect;
export type InsertMerchandiseProduct = typeof merchandiseProducts.$inferInsert;
export type MerchandiseOrder = typeof merchandiseOrders.$inferSelect;
export type InsertMerchandiseOrder = typeof merchandiseOrders.$inferInsert;
export type EventTicket = typeof eventTickets.$inferSelect;
export type InsertEventTicket = typeof eventTickets.$inferInsert;
export type TicketOrder = typeof ticketOrders.$inferSelect;
export type InsertTicketOrder = typeof ticketOrders.$inferInsert;

export const insertMerchandiseProductSchema = createInsertSchema(merchandiseProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMerchandiseOrderSchema = createInsertSchema(merchandiseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventTicketSchema = createInsertSchema(eventTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketOrderSchema = createInsertSchema(ticketOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Corporate competition types and schemas
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type CorporateCompetition = typeof corporateCompetitions.$inferSelect;
export type InsertCorporateCompetition = typeof corporateCompetitions.$inferInsert;
export type CorporateParticipant = typeof corporateParticipants.$inferSelect;
export type InsertCorporateParticipant = typeof corporateParticipants.$inferInsert;

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorporateCompetitionSchema = createInsertSchema(corporateCompetitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorporateParticipantSchema = createInsertSchema(corporateParticipants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Payment & discount types and schemas
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = typeof paymentPlans.$inferInsert;

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tournament subscription types and schemas
export type TournamentSubscription = typeof tournamentSubscriptions.$inferSelect;
export type InsertTournamentSubscription = typeof tournamentSubscriptions.$inferInsert;

export const insertTournamentSubscriptionSchema = createInsertSchema(tournamentSubscriptions).omit({
  id: true,
  subscribedAt: true,
  unsubscribeToken: true,
});

// Message types and schemas
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type InsertMessageRecipient = typeof messageRecipients.$inferInsert;

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageRecipientSchema = createInsertSchema(messageRecipients).omit({
  id: true,
  createdAt: true,
});
