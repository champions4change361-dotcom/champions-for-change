import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User authentication table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status", { 
    enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid"] 
  }).default("inactive"),
  subscriptionPlan: text("subscription_plan", { 
    enum: ["free", "foundation", "champion", "enterprise", "district_enterprise"] 
  }).default("free"),
  userRole: text("user_role", {
    enum: ["tournament_manager", "district_athletic_director", "school_athletic_director", "coach", "scorekeeper", "athlete", "fan"]
  }).default("fan"),
  organizationId: varchar("organization_id"), // School district, club, etc.
  organizationName: varchar("organization_name"), // Name of school/club they represent
  isWhitelabelClient: boolean("is_whitelabel_client").default(false),
  whitelabelDomain: varchar("whitelabel_domain"),
  whitelabelBranding: jsonb("whitelabel_branding"), // Custom colors, logos, etc
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// White-label client configurations
export const whitelabelConfigs = pgTable("whitelabel_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  domain: varchar("domain").notNull().unique(),
  companyName: varchar("company_name").notNull(),
  primaryColor: varchar("primary_color").default("#3b82f6"),
  secondaryColor: varchar("secondary_color").default("#1e40af"),
  logoUrl: varchar("logo_url"),
  faviconUrl: varchar("favicon_url"),
  customCss: text("custom_css"),
  allowedFeatures: jsonb("allowed_features"), // Feature toggles
  revenueSharePercentage: numeric("revenue_share_percentage").default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact database for marketing and outreach
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id), // Owner of the contact
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  organization: varchar("organization"), // School, club, district, etc.
  organizationType: text("organization_type", {
    enum: ["school_district", "school", "club", "nonprofit", "business", "other"]
  }),
  position: varchar("position"), // Title/role
  sport: varchar("sport"), // Primary sport they're involved with
  state: varchar("state"),
  city: varchar("city"),
  zipCode: varchar("zip_code"),
  source: text("source", {
    enum: ["jersey_watch", "manual_entry", "referral", "website", "event", "other"]
  }).default("manual_entry"),
  status: text("status", {
    enum: ["active", "inactive", "do_not_contact", "bounced"]
  }).default("active"),
  tags: text("tags").array(), // Searchable tags
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  subscriptionInterest: text("subscription_interest", {
    enum: ["foundation", "champion", "enterprise", "district_enterprise", "unknown"]
  }),
  isProspect: boolean("is_prospect").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email campaigns for marketing
export const emailCampaigns = pgTable("email_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
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
});

// Campaign recipients tracking
export const campaignRecipients = pgTable("campaign_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => emailCampaigns.id),
  contactId: varchar("contact_id").notNull().references(() => contacts.id),
  status: text("status", {
    enum: ["pending", "sent", "delivered", "opened", "clicked", "bounced", "failed"]
  }).default("pending"),
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamSize: integer("team_size").notNull(),
  tournamentType: text("tournament_type", { enum: ["single", "double", "pool-play", "round-robin", "swiss-system"] }).notNull().default("single"),
  competitionFormat: text("competition_format", { enum: ["bracket", "leaderboard", "series", "bracket-to-series", "multi-stage"] }).notNull().default("bracket"),
  status: text("status", { enum: ["upcoming", "stage-1", "stage-2", "stage-3", "completed"] }).notNull().default("upcoming"),
  currentStage: integer("current_stage").default(1),
  totalStages: integer("total_stages").default(1),
  stageConfiguration: jsonb("stage_configuration"), // Defines each stage structure
  seriesLength: integer("series_length").default(7), // For series and bracket-to-series formats
  bracket: jsonb("bracket").notNull(),
  teams: jsonb("teams").default([]), // Tournament participants/teams - renamed from participants
  sport: text("sport"), // From Bubble SportOptions
  sportCategory: text("sport_category"), // From Bubble SportCategories
  tournamentStructure: text("tournament_structure"), // From Bubble TournamentStructures
  ageGroup: text("age_group", { 
    enum: ["Elementary", "Middle School", "High School", "College", "Adult", "Masters", "Senior", "All Ages"] 
  }).default("All Ages"),
  genderDivision: text("gender_division", { 
    enum: ["Men", "Women", "Mixed", "Boys", "Girls", "Co-Ed"] 
  }).default("Mixed"),
  divisions: jsonb("divisions"), // Multiple division categories within one tournament
  scoringMethod: text("scoring_method").default("wins"),
  userId: varchar("user_id").references(() => users.id), // Tournament owner
  whitelabelConfigId: varchar("whitelabel_config_id").references(() => whitelabelConfigs.id), // White-label client
  entryFee: numeric("entry_fee").default("0"), // Tournament entry fee
  maxParticipants: integer("max_participants"),
  registrationDeadline: timestamp("registration_deadline"),
  tournamentDate: timestamp("tournament_date"),
  location: text("location"),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Sport Categories table
export const sportCategories = pgTable("sport_categories", {
  id: varchar("id").primaryKey(),
  categoryName: text("category_name").notNull(),
  categoryDescription: text("category_description"),
  sortOrder: integer("category_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Bubble data tables
export const sportOptions = pgTable("sport_options", {
  id: varchar("id").primaryKey(),
  sportName: text("sport_name").notNull(),
  sportCategory: text("sport_category").notNull(),
  sportSubcategory: text("sport_subcategory"),
  sortOrder: integer("sport_sort_order"),
  competitionType: text("competition_type", { enum: ["bracket", "leaderboard", "series", "bracket-to-series", "both"] }).notNull().default("bracket"),
  scoringMethod: text("scoring_method", { enum: ["wins", "time", "distance", "points", "placement"] }).default("wins"),
  measurementUnit: text("measurement_unit"), // seconds, meters, points, etc.
  hasSubEvents: boolean("has_sub_events").default(false), // Track & Field, Swimming have sub-events
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Sport Events Schema (sub-events within sports like Track & Field events)
export const sportEvents = pgTable("sport_events", {
  id: varchar("id").primaryKey(),
  eventName: text("event_name").notNull(),
  sportId: varchar("sport_id").notNull().references(() => sportOptions.id),
  eventType: text("event_type").notNull(), // "running", "jumping", "throwing", "swimming"
  scoringMethod: text("scoring_method", { enum: ["time", "distance", "height", "points"] }).notNull(),
  measurementUnit: text("measurement_unit").notNull(), // "seconds", "meters", "feet", etc.
  supportsMetric: boolean("supports_metric").default(true),
  supportsImperial: boolean("supports_imperial").default(true),
  gender: text("gender", { enum: ["men", "women", "boys", "girls", "mixed", "co-ed"] }).default("mixed"),
  ageGroup: text("age_group", { 
    enum: ["elementary", "middle-school", "high-school", "college", "adult", "masters", "senior"] 
  }),
  sortOrder: integer("sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tournament Events Schema (selected events for a tournament)
export const tournamentEvents = pgTable("tournament_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  sportEventId: varchar("sport_event_id").notNull().references(() => sportEvents.id),
  measurementSystem: text("measurement_system", { enum: ["metric", "imperial"] }).default("metric"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Participant Events Schema (individual registrations for events)
export const participantEvents = pgTable("participant_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull().references(() => tournamentEvents.id),
  participantName: text("participant_name").notNull(),
  teamName: text("team_name"), // Optional team affiliation
  bibNumber: text("bib_number"), // Race number
  preliminaryResult: numeric("preliminary_result"), // Qualifying round result
  finalResult: numeric("final_result"), // Final result
  placement: integer("placement"), // 1st, 2nd, 3rd, etc.
  isDisqualified: boolean("is_disqualified").default(false),
  notes: text("notes"), // DQ reason, wind conditions, etc.
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

// Sport-specific division rules
export const sportDivisionRules = pgTable("sport_division_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").notNull().references(() => sportOptions.id),
  requiredDivisions: jsonb("required_divisions"), // Array of required divisions
  allowedCombinations: jsonb("allowed_combinations"), // Valid age/gender combos
  ageGroupRules: jsonb("age_group_rules"), // Age cutoffs, grade requirements
  genderRules: jsonb("gender_rules"), // Gender-specific rules
  performanceStandards: jsonb("performance_standards"), // Different standards by division
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division-specific matches for tournaments with multiple divisions
export const divisionMatches = pgTable("division_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  division: text("division").notNull(), // "Men's Varsity", "Women's JV", etc.
  ageGroup: text("age_group"),
  gender: text("gender"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// White-label schemas
export const insertWhitelabelConfigSchema = createInsertSchema(whitelabelConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSportCategorySchema = createInsertSchema(sportCategories).omit({
  createdAt: true,
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

export const insertSportEventSchema = createInsertSchema(sportEvents).omit({
  createdAt: true,
});

export const insertTournamentEventSchema = createInsertSchema(tournamentEvents).omit({
  id: true,
  createdAt: true,
});

export const insertParticipantEventSchema = createInsertSchema(participantEvents).omit({
  id: true,
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

// User types
export type User = typeof users.$inferSelect;

// White-label pages schema
export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull(),
  content: text("content").notNull(),
  metaDescription: varchar("meta_description"),
  isPublished: boolean("is_published").default(false),
  pageType: text("page_type", { enum: ["landing", "about", "contact", "custom"] }).default("custom"),
  templateId: varchar("template_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pagesRelations = relations(pages, ({ one }) => ({
  user: one(users, {
    fields: [pages.userId],
    references: [users.id],
  }),
}));

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

// Update white-label configs with relations
export const whitelabelConfigsRelations = relations(whitelabelConfigs, ({ one }) => ({
  user: one(users, {
    fields: [whitelabelConfigs.userId],
    references: [users.id],
  }),
}));

export type WhitelabelConfig = typeof whitelabelConfigs.$inferSelect;
export type InsertWhitelabelConfig = typeof whitelabelConfigs.$inferInsert;

// Team registrations - coaches register their teams for tournaments
export const teamRegistrations = pgTable("team_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  teamName: varchar("team_name").notNull(),
  organizationName: varchar("organization_name"), // School/club name
  playerList: jsonb("player_list"), // Array of player details
  registeredEvents: jsonb("registered_events"), // Which events this team is competing in
  registrationStatus: text("registration_status", {
    enum: ["pending", "approved", "rejected", "waitlisted"]
  }).default("pending"),
  registrationDate: timestamp("registration_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamRegistrationsRelations = relations(teamRegistrations, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [teamRegistrations.tournamentId],
    references: [tournaments.id],
  }),
  coach: one(users, {
    fields: [teamRegistrations.coachId],
    references: [users.id],
  }),
}));

// Organizations - school districts, clubs, etc.
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: text("type", {
    enum: ["school_district", "high_school", "middle_school", "elementary_school", "club", "recreation_center", "other"]
  }).notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),
  districtAthleticDirectorId: varchar("district_athletic_director_id").references(() => users.id),
  schoolAthleticDirectorId: varchar("school_athletic_director_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  districtAthleticDirector: one(users, {
    fields: [organizations.districtAthleticDirectorId],
    references: [users.id],
  }),
  schoolAthleticDirector: one(users, {
    fields: [organizations.schoolAthleticDirectorId],
    references: [users.id],
  }),
  members: many(users),
}));

// Update users relations to include organization
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  ownedTournaments: many(tournaments),
  teamRegistrations: many(teamRegistrations),
}));

export type TeamRegistration = typeof teamRegistrations.$inferSelect;
export type InsertTeamRegistration = typeof teamRegistrations.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
// Scorekeeper assignments - tournament managers assign scorekeepers to specific events
export const scorekeeperAssignments = pgTable("scorekeeper_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  scorekeeperId: varchar("scorekeeper_id").notNull().references(() => users.id),
  assignedById: varchar("assigned_by_id").notNull().references(() => users.id), // Tournament manager who made assignment
  eventName: varchar("event_name").notNull(), // Specific event/competition within tournament
  eventDescription: text("event_description"),
  canUpdateScores: boolean("can_update_scores").default(true),
  isActive: boolean("is_active").default(true),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scorekeeperAssignmentsRelations = relations(scorekeeperAssignments, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [scorekeeperAssignments.tournamentId],
    references: [tournaments.id],
  }),
  scorekeeper: one(users, {
    fields: [scorekeeperAssignments.scorekeeperId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [scorekeeperAssignments.assignedById],
    references: [users.id],
  }),
}));

// Event scores - scorekeepers update scores for their assigned events
export const eventScores = pgTable("event_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  assignmentId: varchar("assignment_id").notNull().references(() => scorekeeperAssignments.id),
  teamId: varchar("team_id"), // Reference to team registration or participant
  participantName: varchar("participant_name").notNull(),
  eventName: varchar("event_name").notNull(),
  scoreValue: numeric("score_value"), // Numeric score (time, distance, points)
  scoreUnit: varchar("score_unit"), // Unit: seconds, meters, points, etc.
  placement: integer("placement"), // 1st, 2nd, 3rd place
  notes: text("notes"), // Judge notes, penalties, etc.
  scoredAt: timestamp("scored_at").defaultNow(),
  scoredById: varchar("scored_by_id").notNull().references(() => users.id), // Scorekeeper who entered score
  isVerified: boolean("is_verified").default(false), // Tournament manager can verify scores
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventScoresRelations = relations(eventScores, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [eventScores.tournamentId],
    references: [tournaments.id],
  }),
  assignment: one(scorekeeperAssignments, {
    fields: [eventScores.assignmentId],
    references: [scorekeeperAssignments.id],
  }),
  scoredBy: one(users, {
    fields: [eventScores.scoredById],
    references: [users.id],
  }),
}));

export type ScorekeeperAssignment = typeof scorekeeperAssignments.$inferSelect;
export type InsertScorekeeperAssignment = typeof scorekeeperAssignments.$inferInsert;
export type EventScore = typeof eventScores.$inferSelect;
export type InsertEventScore = typeof eventScores.$inferInsert;

// School assignments - district ADs assign schools to events, school ADs assign coaches
export const schoolEventAssignments = pgTable("school_event_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  schoolId: varchar("school_id").notNull().references(() => organizations.id),
  assignedById: varchar("assigned_by_id").notNull().references(() => users.id), // District AD who made assignment
  eventNames: jsonb("event_names").notNull(), // Array of events this school is assigned to
  schoolAthleticDirectorId: varchar("school_athletic_director_id").references(() => users.id),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schoolEventAssignmentsRelations = relations(schoolEventAssignments, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [schoolEventAssignments.tournamentId],
    references: [tournaments.id],
  }),
  school: one(organizations, {
    fields: [schoolEventAssignments.schoolId],
    references: [organizations.id],
  }),
  assignedBy: one(users, {
    fields: [schoolEventAssignments.assignedById],
    references: [users.id],
  }),
  schoolAthleticDirector: one(users, {
    fields: [schoolEventAssignments.schoolAthleticDirectorId],
    references: [users.id],
  }),
}));

// Coach assignments - school ADs assign coaches to specific events within their school's assignment
export const coachEventAssignments = pgTable("coach_event_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolAssignmentId: varchar("school_assignment_id").notNull().references(() => schoolEventAssignments.id),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  assignedById: varchar("assigned_by_id").notNull().references(() => users.id), // School AD who made assignment
  eventName: varchar("event_name").notNull(),
  role: text("role", {
    enum: ["head_coach", "assistant_coach", "volunteer_coach"]
  }).default("assistant_coach"),
  responsibilities: text("responsibilities"), // What the coach is responsible for
  isActive: boolean("is_active").default(true),
  assignmentDate: timestamp("assignment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const coachEventAssignmentsRelations = relations(coachEventAssignments, ({ one }) => ({
  schoolAssignment: one(schoolEventAssignments, {
    fields: [coachEventAssignments.schoolAssignmentId],
    references: [schoolEventAssignments.id],
  }),
  coach: one(users, {
    fields: [coachEventAssignments.coachId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [coachEventAssignments.assignedById],
    references: [users.id],
  }),
}));

export type SchoolEventAssignment = typeof schoolEventAssignments.$inferSelect;
export type InsertSchoolEventAssignment = typeof schoolEventAssignments.$inferInsert;
export type CoachEventAssignment = typeof coachEventAssignments.$inferSelect;
export type InsertCoachEventAssignment = typeof coachEventAssignments.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

// White-label types
export type WhitelabelConfig = typeof whitelabelConfigs.$inferSelect;
export type InsertWhitelabelConfig = z.infer<typeof insertWhitelabelConfigSchema>;

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

export type SportEvent = typeof sportEvents.$inferSelect;
export type InsertSportEvent = z.infer<typeof insertSportEventSchema>;
export type TournamentEvent = typeof tournamentEvents.$inferSelect;
export type InsertTournamentEvent = z.infer<typeof insertTournamentEventSchema>;
export type ParticipantEvent = typeof participantEvents.$inferSelect;
export type InsertParticipantEvent = z.infer<typeof insertParticipantEventSchema>;

// Contact types
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContactType = z.infer<typeof insertContactSchema>;

// Email campaign types
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;
export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailCampaignType = z.infer<typeof insertEmailCampaignSchema>;

// Campaign recipient types  
export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaignRecipients.$inferInsert;
