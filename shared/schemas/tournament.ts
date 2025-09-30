import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// References to other domain tables
import { users, organizations, sports } from "./core";
import { schools, districts, athletes } from "./district";

// =============================================================================
// TOURNAMENT DOMAIN SCHEMA
// =============================================================================
// Tournament Management, Team Registration, Event Scheduling & Scoring
//
// 74 tournament tables for event management:
// - Tournament Structure & Configuration
// - Team & Player Registration
// - Event Scheduling & Assignments
// - Live Scoring & Results
// - Corporate Competitions
// - Merchandise & Ticketing
// - Organizer Network
// =============================================================================

// =============================================================================
// TABLE DEFINITIONS
// =============================================================================

export const registrationRequests = pgTable("registration_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestType: text("request_type", {
    enum: ["district_admin", "school_admin", "coach", "scorekeeper"]
  }).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  position: varchar("position"),
  organizationName: varchar("organization_name").notNull(),
  organizationType: text("organization_type", {
    enum: ["school_district", "school", "club", "nonprofit"]
  }).notNull(),
  parentOrganization: varchar("parent_organization"),
  yearsExperience: integer("years_experience"),
  sportsInvolved: jsonb("sports_involved"),
  certifications: text("certifications"),
  references: jsonb("references"),
  requestReason: text("request_reason"),
  selectedTier: text("selected_tier", {
    enum: ["starter", "champion", "enterprise"]
  }).default("starter"),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "check", "pending"]
  }).default("pending"),
  stripeSessionId: varchar("stripe_session_id"),
  status: text("status", {
    enum: ["pending", "approved", "rejected", "needs_info", "payment_pending"]
  }).default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Registration form schemas
export const insertRegistrationRequestSchema = createInsertSchema(registrationRequests).omit({
  id: true,
  status: true,
  reviewNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  isVerified: true,
  verificationNotes: true,
  registrationStatus: true,
  createdAt: true,
  updatedAt: true,
});

export type RegistrationRequest = typeof registrationRequests.$inferSelect;
export type InsertRegistrationRequest = z.infer<typeof insertRegistrationRequestSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

// District schema and types
export const insertDistrictSchema = createInsertSchema(districts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// School schema and types
export const insertSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Athletic Venue schema and types
export const insertAthleticVenueSchema = createInsertSchema(athleticVenues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// School Asset schema and types
export const insertSchoolAssetSchema = createInsertSchema(schoolAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type District = typeof districts.$inferSelect;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type AthleticVenue = typeof athleticVenues.$inferSelect;
export type InsertAthleticVenue = z.infer<typeof insertAthleticVenueSchema>;
export type SchoolAsset = typeof schoolAssets.$inferSelect;
export type InsertSchoolAsset = z.infer<typeof insertSchoolAssetSchema>;

export const tournamentSubscriptions = pgTable("tournament_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  sports: jsonb("sports").$type<string[]>().default([]), // Array of sports they're interested in
  location: varchar("location"), // City/region for local tournaments
  frequency: text("frequency", {
    enum: ["immediate", "daily", "weekly"]
  }).default("weekly"),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  lastNotified: timestamp("last_notified"),
  unsubscribeToken: varchar("unsubscribe_token").unique().default(sql`gen_random_uuid()`),
  source: varchar("source").default("landing_page"), // Where they subscribed from
});

export const tournamentCoordinationData = pgTable("tournament_coordination_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  
  // Geographic coordination
  coordinationRegion: varchar("coordination_region"), // "Texas Coastal Bend", "California Bay Area"
  coordinationRadius: integer("coordination_radius").default(50), // Miles for coordination analysis
  nearbyTournaments: jsonb("nearby_tournaments").$type<string[]>().default([]), // Tournament IDs within radius
  
  // Conflict detection
  dateConflictLevel: text("date_conflict_level", {
    enum: ["none", "low", "medium", "high", "critical"]
  }).default("none"),
  conflictingTournaments: jsonb("conflicting_tournaments").$type<{
    tournamentId: string;
    conflictType: "same_date" | "same_weekend" | "same_sport_same_date" | "nearby_same_sport";
    impactLevel: "low" | "medium" | "high";
    distance?: number; // Miles away
  }[]>().default([]),
  
  // Collaboration opportunities
  collaborationOpportunities: jsonb("collaboration_opportunities").$type<{
    tournamentId: string;
    opportunityType: "feeder_event" | "cross_promotion" | "shared_resources" | "sequential_dates";
    description: string;
    potentialBenefit: "low" | "medium" | "high";
  }[]>().default([]),
  
  // Optimal scheduling analysis
  recommendedDates: jsonb("recommended_dates").$type<{
    date: string;
    reason: string;
    participationBoost: number; // Estimated % increase in participation
    conflictReduction: number; // Estimated % reduction in conflicts
  }[]>().default([]),
  
  // Regional circuit information
  circuitData: jsonb("circuit_data").$type<{
    isPartOfCircuit: boolean;
    circuitName?: string;
    circuitPosition?: "entry" | "intermediate" | "championship" | "standalone";
    feederEvents?: string[]; // Tournament IDs that feed into this one
    advancementEvents?: string[]; // Tournament IDs this feeds into
  }>().default({
    isPartOfCircuit: false
  }),
  
  // Analytics and insights
  participationForecast: integer("participation_forecast"), // Predicted number of participants
  marketGapAnalysis: jsonb("market_gap_analysis").$type<{
    underservedAgeGroups: string[];
    underservedSports: string[];
    optimalNewTournamentDates: string[];
    growthOpportunities: string[];
  }>(),
  
  // Coordination metrics
  coordinationScore: decimal("coordination_score", { precision: 5, scale: 2 }), // 0-100 score
  lastAnalysisDate: timestamp("last_analysis_date").defaultNow(),
  analysisVersion: varchar("analysis_version").default("1.0"), // For tracking algorithm improvements
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tournamentOrganizerNetwork = pgTable("tournament_organizer_network", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  
  // Network profile
  organizerName: varchar("organizer_name").notNull(),
  organizerEmail: varchar("organizer_email").notNull(),
  organization: varchar("organization"),
  primarySports: jsonb("primary_sports").$type<string[]>().default([]),
  serviceArea: varchar("service_area"), // Geographic area they serve
  serviceRadius: integer("service_radius").default(25), // Miles
  
  // Collaboration preferences  
  openToCollaboration: boolean("open_to_collaboration").default(true),
  collaborationTypes: jsonb("collaboration_types").$type<string[]>().default([]), // ["cross_promotion", "resource_sharing", "joint_events"]
  resourcesAvailable: jsonb("resources_available").$type<{
    equipment?: string[];
    venues?: string[];
    volunteers?: number;
    expertise?: string[];
  }>().default({}),
  
  // Network metrics
  totalTournamentsOrganized: integer("total_tournaments_organized").default(0),
  averageParticipation: integer("average_participation"),
  collaborationHistory: jsonb("collaboration_history").$type<{
    partnerId: string;
    tournamentId: string;
    collaborationType: string;
    outcome: "successful" | "neutral" | "unsuccessful";
    date: string;
  }[]>().default([]),
  
  // Reputation and trust metrics
  networkRating: decimal("network_rating", { precision: 3, scale: 2 }).default("0.00"), // 0-5.00
  collaborationCount: integer("collaboration_count").default(0),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const regionalTournamentCircuits = pgTable("regional_tournament_circuits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circuitName: varchar("circuit_name").notNull(), // "Texas Coastal Bend Basketball Circuit"
  region: varchar("region").notNull(), // "Texas Coastal Bend"
  primarySport: varchar("primary_sport").notNull(),
  
  // Circuit structure
  seasonStartDate: date("season_start_date"),
  seasonEndDate: date("season_end_date"),
  circuitType: text("circuit_type", {
    enum: ["progression", "championship_series", "league", "tournament_trail"]
  }).default("progression"),
  
  // Tournament pathway
  entryLevelEvents: jsonb("entry_level_events").$type<string[]>().default([]), // Tournament IDs
  intermediateEvents: jsonb("intermediate_events").$type<string[]>().default([]),
  championshipEvents: jsonb("championship_events").$type<string[]>().default([]),
  
  // Coordination rules
  minimumDaysBetweenEvents: integer("minimum_days_between_events").default(7),
  maximumRadius: integer("maximum_radius").default(100), // Miles
  participationRequirements: jsonb("participation_requirements").$type<{
    minimumEvents?: number;
    qualificationCriteria?: string[];
    ageRestrictions?: string[];
  }>().default({}),
  
  // Circuit metrics
  totalParticipants: integer("total_participants").default(0),
  averageParticipantsPerEvent: integer("average_participants_per_event").default(0),
  participationGrowth: decimal("participation_growth", { precision: 5, scale: 2 }).default("0.00"), // Percentage
  
  // Management
  circuitCoordinatorId: varchar("circuit_coordinator_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tournament subscription schema and types
export const insertTournamentSubscriptionSchema = createInsertSchema(tournamentSubscriptions).omit({
  id: true,
  subscribedAt: true,
  unsubscribeToken: true,
});

export type TournamentSubscription = typeof tournamentSubscriptions.$inferSelect;
export type InsertTournamentSubscription = z.infer<typeof insertTournamentSubscriptionSchema>;

export const liveScores = pgTable("live_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  matchId: varchar("match_id").notNull(), // Reference to specific bracket match
  eventName: varchar("event_name"), // For track & field: "Shot Put", "100m Dash", etc.
  
  // Participant info
  participant1Id: varchar("participant1_id"), // Team or individual athlete
  participant1Name: varchar("participant1_name").notNull(),
  participant1Score: numeric("participant1_score").default("0"),
  
  participant2Id: varchar("participant2_id"), // Team or individual athlete  
  participant2Name: varchar("participant2_name"),
  participant2Score: numeric("participant2_score").default("0"),
  
  // Score details for different sports
  scoreType: text("score_type", {
    enum: ["points", "time", "distance", "games", "sets", "goals", "runs", "custom"]
  }).default("points"),
  scoreUnit: varchar("score_unit"), // "seconds", "feet", "meters", "points"
  
  // Match status
  matchStatus: text("match_status", {
    enum: ["scheduled", "in_progress", "completed", "cancelled", "postponed"]
  }).default("scheduled"),
  winnerId: varchar("winner_id"), // ID of winning participant
  
  // Timing and location
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  venue: varchar("venue"),
  field: varchar("field"), // "Field 1", "Court A", "Track Lane 3"
  
  // Access control - WHO CAN UPDATE SCORES
  assignedScorekeeperId: varchar("assigned_scorekeeper_id").notNull().references(() => users.id),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  
  // Real-time features
  isLive: boolean("is_live").default(false), // Currently happening
  liveUpdateCount: integer("live_update_count").default(0),
  lastScoreUpdate: timestamp("last_score_update"),
  
  // Additional match data (for complex scoring)
  additionalData: jsonb("additional_data").$type<{
    sets?: Array<{setNumber: number; participant1Score: number; participant2Score: number}>;
    periods?: Array<{period: number; participant1Score: number; participant2Score: number}>;
    attempts?: Array<{participantId: string; attempt: number; result: string; distance?: number; time?: number}>;
    notes?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scorekeeperAssignments = pgTable("scorekeeper_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  scorekeeperId: varchar("scorekeeper_id").notNull().references(() => users.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id), // Tournament/Athletic Director
  
  // What they can score
  assignedEvents: jsonb("assigned_events").$type<string[]>().default([]), // Event names or IDs
  assignedVenues: jsonb("assigned_venues").$type<string[]>().default([]), // "Field 1", "Court A"
  
  // Permission level
  canUpdateScores: boolean("can_update_scores").default(true),
  canMarkMatchComplete: boolean("can_mark_match_complete").default(true),
  canSendMessages: boolean("can_send_messages").default(false), // Send live updates to coaches/parents
  
  // Status
  isActive: boolean("is_active").default(true),
  assignmentNotes: text("assignment_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scoreUpdateLog = pgTable("score_update_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  liveScoreId: varchar("live_score_id").notNull().references(() => liveScores.id),
  updatedBy: varchar("updated_by").notNull().references(() => users.id),
  
  // What changed
  updateType: text("update_type", {
    enum: ["score_change", "status_change", "participant_change", "match_start", "match_end", "manual_correction"]
  }).notNull(),
  previousData: jsonb("previous_data"), // What it was before
  newData: jsonb("new_data"), // What it is now
  updateReason: varchar("update_reason"), // "Corrected scoring error", "Match completed"
  
  // Automatic bracket progression
  triggeredBracketUpdate: boolean("triggered_bracket_update").default(false),
  bracketUpdateDetails: jsonb("bracket_update_details").$type<{
    nextMatchId?: string;
    advancedParticipant?: string;
    eliminatedParticipant?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const liveScoreMessages = pgTable("live_score_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  liveScoreId: varchar("live_score_id").notNull().references(() => liveScores.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").references(() => users.id), // If direct message
  
  // Message details
  messageType: text("message_type", {
    enum: ["encouragement", "congratulations", "technique_tip", "performance_update", "coaching_note"]
  }).notNull(),
  content: text("content").notNull(),
  
  // Context from score
  relatedParticipantId: varchar("related_participant_id"), // Which athlete/team
  performanceContext: jsonb("performance_context").$type<{
    eventName: string;
    result?: string;
    isPersonalBest?: boolean;
    placement?: number;
    improvement?: string;
  }>(),
  
  // Auto-generation (AI coaching messages)
  isAutoGenerated: boolean("is_auto_generated").default(false),
  autoMessageTrigger: text("auto_message_trigger"), // "personal_best", "first_place", "improvement"
  
  // Delivery
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  deliveredViaPush: boolean("delivered_via_push").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamSize: integer("team_size"), // Optional - only for team competitions where players per team matters
  tournamentType: text("tournament_type", { enum: ["single", "double", "pool-play", "round-robin", "swiss-system", "double-stage", "match-play", "stroke-play", "scramble", "best-ball", "alternate-shot", "modified-stableford", "playoff-bracket", "conference-championship", "dual-meet", "triangular-meet", "weight-class-bracket", "multi-event-scoring", "preliminary-finals", "heat-management", "skills-competition", "draw-management", "group-stage-knockout", "home-away-series", "prediction-bracket", "compass-draw", "triple-elimination", "game-guarantee", "march-madness", "free-for-all", "multi-heat-racing", "battle-royale", "point-accumulation", "time-trials", "survival-elimination"] }).notNull().default("single"),
  competitionFormat: text("competition_format", { enum: ["bracket", "leaderboard", "series", "bracket-to-series", "multi-stage", "round-robin-pools", "elimination-pools", "consolation-bracket", "team-vs-individual", "portfolio-review", "oral-competition", "written-test", "judged-performance", "timed-competition", "scoring-average", "advancement-ladder", "rating-system", "prediction-scoring", "multiple-bracket-system", "three-bracket-system", "guarantee-system", "regional-bracket", "individual-leaderboard", "heat-progression", "elimination-rounds", "performance-ranking", "cumulative-scoring", "time-based-ranking"] }).notNull().default("bracket"),
  status: text("status", { enum: ["draft", "upcoming", "stage-1", "stage-2", "stage-3", "completed"] }).notNull().default("draft"),
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
  maxParticipants: integer("max_participants"), // Total number of individual participants
  // teamsCount: integer("teams_count"), // Number of teams (for team-based tournaments) - Removed to fix database compatibility
  registrationDeadline: timestamp("registration_deadline"),
  tournamentDate: timestamp("tournament_date", { mode: 'string' }),
  location: text("location"),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  
  // CALENDAR DISCOVERABILITY FIELDS
  isPublicCalendarVisible: boolean("is_public_calendar_visible").default(false),
  calendarApprovalStatus: text("calendar_approval_status", {
    enum: ["pending", "approved", "rejected", "auto_approved"]
  }).default("pending"),
  calendarRegion: varchar("calendar_region"), // "Texas", "California", etc. for regional filtering
  calendarCity: varchar("calendar_city"), // City for local discovery
  calendarStateCode: varchar("calendar_state_code", { length: 2 }), // "TX", "CA" for state filtering
  calendarCoordinates: jsonb("calendar_coordinates").$type<{
    latitude: number;
    longitude: number;
  }>(), // For proximity-based discovery
  calendarTags: jsonb("calendar_tags").$type<string[]>(), // ["competitive", "youth", "recreational"] for filtering
  calendarSubmittedAt: timestamp("calendar_submitted_at"),
  calendarApprovedAt: timestamp("calendar_approved_at"),
  calendarApprovedBy: varchar("calendar_approved_by").references(() => users.id),
  calendarRejectionReason: text("calendar_rejection_reason"),
  calendarFeatured: boolean("calendar_featured").default(false), // Premium placement
  calendarViewCount: integer("calendar_view_count").default(0), // Analytics
  calendarClickCount: integer("calendar_click_count").default(0), // Analytics
  
  // DONATION MODULE FIELDS
  donationsEnabled: boolean("donations_enabled").default(false),
  donationGoal: numeric("donation_goal").default("0"),
  donationDescription: text("donation_description"),
  stripeAccountId: varchar("stripe_account_id"),
  registrationFeeEnabled: boolean("registration_fee_enabled").default(false),
  
  // AI CONTEXT FIELDS
  aiSetupProgress: jsonb("ai_setup_progress").$type<{
    donationModuleStep: 'not_started' | 'suggested' | 'creating' | 'stripe_setup' | 'testing' | 'complete';
    stripeAccountStatus: 'unknown' | 'none' | 'creating' | 'has_account' | 'keys_added' | 'validated';
    lastAIInteraction: string;
    completedSteps: string[];
    userResponses: Record<string, any>;
  }>(),
  
  aiContext: jsonb("ai_context").$type<{
    userTechLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredCommunicationStyle: 'detailed' | 'concise' | 'visual';
    hasAskedForHelp: boolean;
    previousQuestions: string[];
    successfulSetups: number;
  }>(),
  
  setupAssistanceLevel: text("setup_assistance_level", {
    enum: ["minimal", "standard", "full_guidance", "expert_mode"]
  }).default("standard"),
  
  donationSetupData: jsonb("donation_setup_data").$type<{
    goal: number;
    purpose: string;
    description: string;
    suggestedAmounts: number[];
    stripePublicKey?: string;
    stripeAccountId?: string;
    setupStartedAt?: string;
    setupCompletedAt?: string;
  }>(),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  
  // JERSEY WATCH-STYLE TEAM REGISTRATION FIELDS
  registrationType: text("registration_type", { 
    enum: ["individual", "team"] 
  }).default("individual"),
  allowPartialTeamPayments: boolean("allow_partial_team_payments").default(true),
  maxTeamSize: integer("max_team_size"), // For team tournaments
  minTeamSize: integer("min_team_size"), // Minimum players required
  
  // FREE FOR ALL TOURNAMENT SPECIFIC FIELDS
  ffaConfig: jsonb("ffa_config").$type<{
    // Participant structure for individual competition
    participantStructure: 'individual' | 'team';
    maxParticipants: number;
    minParticipants: number;
    
    // Heat and round configuration
    heatConfiguration?: {
      numberOfHeats: number;
      participantsPerHeat: number;
      qualificationMethod: 'top-n' | 'percentage' | 'time-based' | 'score-based';
      qualificationCount: number; // How many advance from each heat
      heatAdvancementRules: string[];
    };
    
    // Scoring and ranking methodology
    scoringMethodology: 'time-based' | 'points-based' | 'elimination-based' | 'cumulative-scoring' | 'ranking-based';
    rankingCriteria: string[]; // ["time", "score", "placement"] etc
    tieBreakingRules: string[];
    
    // Elimination rules for Battle Royale and Survival formats
    eliminationRules?: {
      eliminationMethod: 'percentage' | 'fixed-number' | 'score-threshold';
      eliminationCriteria: number;
      roundsToElimination: number;
      finalFieldSize: number;
    };
    
    // Performance tracking
    performanceTracking: {
      trackIndividualStats: boolean;
      recordPersonalBests: boolean;
      performanceMetrics: string[]; // ["time", "distance", "score", "accuracy"] etc
      allowMultipleAttempts: boolean;
      attemptsPerRound?: number;
    };
    
    // Advancement criteria for multi-stage tournaments
    advancementCriteria?: {
      stagesToAdvancement: Record<string, {
        advancementMethod: 'top-n' | 'percentage' | 'qualifying-score';
        advancementCount: number;
        requirementThreshold?: number;
      }>;
    };
  }>(),

  // ACTIVITY STATUS
  isActive: boolean("is_active").default(true),

  // FLEXIBLE TOURNAMENT CONFIGURATION SYSTEM
  // Uses a generic JSON type here, will be validated with TournamentConfig schema
  config: jsonb("config"),

  // NOTE: Sport-specific fields have been moved to separate config tables:
  // - athletic_configs (basketball, soccer, tennis, golf, etc.)
  // - academic_configs (UIL academic competitions, debate, etc.)  
  // - fine_arts_configs (band, choir, theater, art competitions, etc.)
  // This eliminates the "god table" antipattern and enables clean architecture
  //
  // Legacy fields are kept temporarily for migration. New tournaments should use
  // the config JSONB field with the TournamentConfig schema instead.
});

// ENHANCED EVENT MANAGEMENT SYSTEM 
// Based on real-world track meet experience where coaches sign up for event assignments

export const eventAssignments = pgTable("event_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull(), // Will reference tournamentEvents table when it exists
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  scorekeeperId: varchar("scorekeeper_id").references(() => users.id), // Null if open assignment
  assignmentStatus: text("assignment_status", {
    enum: ["open", "assigned", "accepted", "declined", "completed"]
  }).default("open"),
  assignmentType: text("assignment_type", {
    enum: ["self_selected", "manager_assigned"]
  }).default("self_selected"),
  assignedAt: timestamp("assigned_at"),
  acceptedAt: timestamp("accepted_at"),
  declinedAt: timestamp("declined_at"),
  assignmentNotes: text("assignment_notes"), // "I always do discus", preferences, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventSchools = pgTable("event_schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull(), // References tournament_events table
  schoolName: varchar("school_name").notNull(), // "CCISD North", "London ISD", "Homeschool Association"
  schoolType: text("school_type", {
    enum: ["district_north", "district_south", "visiting", "homeschool", "charter", "private"]
  }).default("visiting"),
  isPreRegistered: boolean("is_pre_registered").default(false), // vs walk-up
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  addedBy: varchar("added_by").notNull().references(() => users.id), // Which scorekeeper added them
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventParticipants = pgTable("event_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull(), // References tournament_events table
  eventSchoolId: varchar("event_school_id").notNull(), // References event_schools table
  athleteName: varchar("athlete_name").notNull(),
  grade: varchar("grade"), // "8th", "7th", etc.
  division: text("division", {
    enum: ["north", "south", "visiting"]
  }), // For CCISD north/south division tracking
  participantOrder: integer("participant_order"), // Order in line/heat
  addedBy: varchar("added_by").notNull().references(() => users.id), // Which scorekeeper added them
  addedAt: timestamp("added_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventResults = pgTable("event_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participantId: varchar("participant_id").notNull(), // References event_participants table
  tournamentEventId: varchar("tournament_event_id").notNull(), // References tournament_events table
  attemptNumber: integer("attempt_number").notNull(), // 1, 2, 3 for field events
  resultValue: numeric("result_value"), // Distance, time, points
  resultUnit: varchar("result_unit").notNull(), // "meters", "seconds", "feet"
  isFoul: boolean("is_foul").default(false),
  isPersonalBest: boolean("is_personal_best").default(false),
  notes: text("notes"), // "Wind assisted", "New school record", etc.
  recordedBy: varchar("recorded_by").notNull().references(() => users.id),
  recordedAt: timestamp("recorded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});


// CORPORATE COMPETITION DATABASE SYSTEM
// Comprehensive database for sales, production, and corporate tournaments

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  industry: varchar("industry"), // retail, manufacturing, tech, healthcare
  contactEmail: varchar("contact_email").notNull(),
  estimatedEmployees: varchar("estimated_employees"),
  subscriptionTier: varchar("subscription_tier").default("starter"), // starter, professional, enterprise
  
  // Registration code generation
  codePrefix: varchar("code_prefix").notNull(), // WALMART2024, AMAZON2024
  activeCompetitions: integer("active_competitions").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const corporateCompetitions = pgTable("corporate_competitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: varchar("name").notNull(),
  competitionType: varchar("competition_type").notNull(), // sales, production, corporate
  trackingMetric: varchar("tracking_metric").notNull(), // revenue, units_sold, efficiency, quality, custom
  competitionFormat: varchar("competition_format").notNull(), // individual, team, department
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status").notNull().default("planning"), // planning, active, completed
  
  // Sales-specific fields
  revenueGoal: numeric("revenue_goal"), // Target revenue for competition
  unitsSoldGoal: integer("units_sold_goal"), // Target units to sell
  salesTargets: jsonb("sales_targets").$type<{
    individual?: number;
    team?: number;
    department?: number;
    territory?: string[];
  }>(),
  
  // Production-specific fields
  productionTarget: integer("production_target"), // Units to produce
  qualityThreshold: integer("quality_threshold"), // Quality percentage
  efficiencyMetric: varchar("efficiency_metric"), // per_hour, per_day, per_unit
  productionGoals: jsonb("production_goals").$type<{
    dailyTarget?: number;
    weeklyTarget?: number;
    monthlyTarget?: number;
    qualityStandard?: number;
  }>(),
  
  // Corporate-specific fields
  customMetrics: jsonb("custom_metrics").$type<Array<{
    name: string;
    type: 'number' | 'percentage' | 'time' | 'boolean';
    target?: number;
    description?: string;
  }>>(),
  
  // Competition settings
  departments: text("departments").array(), // ["Sales", "Manufacturing", "Quality Control"]
  registrationCodes: jsonb("registration_codes").$type<Record<string, {
    department: string;
    maxParticipants?: number;
    isActive: boolean;
    generatedAt: string;
  }>>(), // {"WALMART2024-SALES": {...}, "WALMART2024-PROD": {...}}
  
  // Prize structure
  prizeStructure: jsonb("prize_structure").$type<{
    firstPlace?: string;
    topThree?: string[];
    departmentWinner?: string;
    participationReward?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const corporateParticipants = pgTable("corporate_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  employeeId: varchar("employee_id"), // company's internal employee ID
  department: varchar("department").notNull(),
  role: varchar("role").notNull(), // participant, supervisor, manager
  teamName: varchar("team_name"), // for team-based competitions
  registrationCode: varchar("registration_code").notNull(), // which code they used to join
  
  // Performance tracking
  currentScore: numeric("current_score").default("0"),
  currentRank: integer("current_rank"),
  personalGoal: numeric("personal_goal"), // Individual target
  
  // Additional participant data
  territory: varchar("territory"), // for sales competitions
  shift: varchar("shift"), // for production competitions
  startDate: timestamp("start_date"), // when they joined competition
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  participantId: varchar("participant_id").notNull().references(() => corporateParticipants.id),
  
  metricType: varchar("metric_type").notNull(), // revenue, units_sold, production_count, quality_score
  metricValue: numeric("metric_value").notNull(),
  recordedDate: timestamp("recorded_date").notNull(),
  
  // Additional context
  shift: varchar("shift"), // for production competitions
  productType: varchar("product_type"), // for sales/production specificity
  territory: varchar("territory"), // for sales competitions
  customerType: varchar("customer_type"), // new, existing, premium
  
  // Quality metrics for production
  qualityScore: integer("quality_score"), // percentage
  defectCount: integer("defect_count").default(0),
  
  // Verification
  verifiedBy: varchar("verified_by"), // supervisor/manager who verified
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, disputed
  verificationNotes: text("verification_notes"),
  
  // Metadata
  source: varchar("source").default("manual"), // manual, system, integration
  batchId: varchar("batch_id"), // for bulk imports
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const competitionLeaderboards = pgTable("competition_leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  participantId: varchar("participant_id").notNull().references(() => corporateParticipants.id),
  
  // Ranking data
  currentRank: integer("current_rank").notNull(),
  previousRank: integer("previous_rank"),
  totalScore: numeric("total_score").notNull(),
  
  // Performance breakdowns
  dailyAverage: numeric("daily_average"),
  weeklyTotal: numeric("weekly_total"),
  monthlyTotal: numeric("monthly_total"),
  
  // Achievement tracking
  goalProgress: numeric("goal_progress"), // percentage toward goal
  streakDays: integer("streak_days").default(0), // consecutive days meeting target
  personalBest: numeric("personal_best"),
  
  // Department/team context
  departmentRank: integer("department_rank"),
  teamRank: integer("team_rank"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

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
}, (table) => [
  // Index for sport association queries
  index("idx_sport_events_sport_id").on(table.sportId),
  // Composite index for sport + event type queries
  index("idx_events_sport_type").on(table.sportId, table.eventType),
]);

export const tournamentEvents = pgTable("tournament_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  sportEventId: varchar("sport_event_id").notNull().references(() => sportEvents.id),
  measurementSystem: text("measurement_system", { enum: ["metric", "imperial"] }).default("metric"),
  
  // RESULTS RECORDER SYSTEM
  resultsRecorderId: varchar("results_recorder_id").references(() => users.id), // Assigned Results Recorder
  resultsRecorderName: varchar("results_recorder_name"), // Name for display
  resultsRecorderEmail: varchar("results_recorder_email"), // Contact info
  
  // EVENT MANAGEMENT  
  eventStatus: text("event_status", {
    enum: ["upcoming", "in_progress", "completed", "canceled"]
  }).default("upcoming"),
  eventDateTime: timestamp("event_date_time"),
  eventOrder: integer("event_order").default(1), // Display order in tournament
  maxParticipants: integer("max_participants"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

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

export const tournamentStructures = pgTable("tournament_structures", {
  id: varchar("id").primaryKey(),
  formatName: text("format_name").notNull(),
  formatDescription: text("format_description"),
  formatType: text("format_type"),
  applicableSports: text("applicable_sports"),
  sortOrder: integer("format_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),

export const trackEvents = pgTable("track_events", {
  id: varchar("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventCategory: text("event_category"),
  measurementType: text("measurement_type"),
  maxAttempt: integer("max_attempt"), // Match actual database column name
  ribbonPlaces: integer("ribbon_places").default(8),
  usesStakes: text("uses_stakes"),
  eventSortOrder: integer("event_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const trackEventTiming = pgTable("track_event_timing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackEventId: varchar("track_event_id").notNull().references(() => trackEvents.id),
  timingMethod: text("timing_method").notNull(), // manual, FAT, electronic
  precisionLevel: text("precision_level").notNull(), // tenth, hundredth, thousandth
  windMeasurement: boolean("wind_measurement").default(false),
  photoFinish: boolean("photo_finish").default(false),
  reactionTimeTracking: boolean("reaction_time_tracking").default(false),
  intermediateSplits: jsonb("intermediate_splits"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

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

export const bracketTemplates = pgTable("bracket_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentStructureId: varchar("tournament_structure_id").references(() => tournamentStructures.id),
  participantCount: integer("participant_count").notNull(),
  bracketStructure: jsonb("bracket_structure").notNull(),
  matchSequence: jsonb("match_sequence").notNull(),
  advancementMap: jsonb("advancement_map").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const tournamentGenerationLog = pgTable("tournament_generation_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  generationStep: varchar("generation_step").notNull(),
  stepData: jsonb("step_data"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

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

// KRAKEN MULTI-DIVISION SYSTEM - THE TENTACLES OF TOURNAMENT POWER! 🐙💥

export const tournamentDivisions = pgTable("tournament_divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  divisionName: varchar("division_name").notNull(),
  divisionType: varchar("division_type").notNull(), // age, gender, skill, regional, custom
  divisionConfig: jsonb("division_config").notNull(),
  participantCount: integer("participant_count").default(0),
  maxParticipants: integer("max_participants"),
  registrationDeadline: timestamp("registration_deadline"),
  divisionStatus: varchar("division_status").default("open"), // open, closed, active, completed
  bracketStructure: jsonb("bracket_structure"),
  advancementRules: jsonb("advancement_rules"),
  prizeStructure: jsonb("prize_structure"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const divisionParticipants = pgTable("division_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  divisionId: varchar("division_id").references(() => tournamentDivisions.id),
  participantId: varchar("participant_id").notNull(), // Could be team or individual
  participantName: varchar("participant_name").notNull(),
  participantType: varchar("participant_type").notNull(), // individual, team
  seedNumber: integer("seed_number"),
  qualificationData: jsonb("qualification_data"),
  registrationTime: timestamp("registration_time").default(sql`now()`),
  status: varchar("status").default("registered"), // registered, confirmed, withdrawn, disqualified
});

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

export const divisionGenerationRules = pgTable("division_generation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  templateId: varchar("template_id").references(() => divisionTemplates.id),
  generationConfig: jsonb("generation_config").notNull(),
  status: varchar("status").default("pending"), // pending, generated, active, completed
  generatedDivisions: jsonb("generated_divisions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

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
  status: text("status", { enum: ["upcoming", "in-progress", "completed", "cancelled"] }).notNull().default("upcoming"),
  bracket: text("bracket", { enum: ["winners", "losers", "championship"] }).default("winners"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [
  // High-frequency single-column indexes
  index("idx_matches_tournament_id").on(table.tournamentId),
  index("idx_matches_status").on(table.status),
  // Composite index for bracket queries
  index("idx_matches_tournament_round").on(table.tournamentId, table.round),
  // Data integrity constraints
  check("check_valid_scores", sql`${table.team1Score} >= 0 AND ${table.team2Score} >= 0`),
  check("check_valid_position", sql`${table.round} > 0 AND ${table.position} > 0`),
  check("check_winner_logic", sql`
    (${table.winner} IS NULL) OR 
    (${table.winner} = 'team1' AND ${table.team1Score} > ${table.team2Score}) OR 
    (${table.winner} = 'team2' AND ${table.team2Score} > ${table.team1Score}) OR
    (${table.winner} = 'tie' AND ${table.team1Score} = ${table.team2Score})
  `),
]);

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

export const scoringAutomations = pgTable("scoring_automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  automationType: varchar("automation_type").notNull(), // weekly_update, daily_update, real_time
  dataSource: varchar("data_source").notNull(),
  lastRun: timestamp("last_run"),
  nextScheduledRun: timestamp("next_scheduled_run"),
  automationStatus: varchar("automation_status").default("active"),
  errorLog: jsonb("error_log"),
});

// Fantasy system relations
export const fantasyLeaguesRelations = relations(fantasyLeagues, ({ many }) => ({
  participants: many(fantasyParticipants),
  picks: many(fantasyPicks),
  lineups: many(fantasyLineups),
}));

export const fantasyParticipantsRelations = relations(fantasyParticipants, ({ one, many }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyParticipants.leagueId],
    references: [fantasyLeagues.id],
  }),
  picks: many(fantasyPicks),
  lineups: many(fantasyLineups),
}));

export const professionalPlayersRelations = relations(professionalPlayers, ({ many }) => ({
  picks: many(fantasyPicks),
  performances: many(playerPerformances),
}));

export const fantasyPicksRelations = relations(fantasyPicks, ({ one }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyPicks.leagueId],
    references: [fantasyLeagues.id],
  }),
  participant: one(fantasyParticipants, {
    fields: [fantasyPicks.participantId],
    references: [fantasyParticipants.id],
  }),
  player: one(professionalPlayers, {
    fields: [fantasyPicks.selectedPlayerId],
    references: [professionalPlayers.id],
  }),
}));

// Fantasy system types (moved to end of file to avoid duplicates)
export type FantasyParticipant = typeof fantasyParticipants.$inferSelect;
export type InsertFantasyParticipant = typeof fantasyParticipants.$inferInsert;
export type ProfessionalPlayer = typeof professionalPlayers.$inferSelect;
export type InsertProfessionalPlayer = typeof professionalPlayers.$inferInsert;
export type FantasyPick = typeof fantasyPicks.$inferSelect;
export type InsertFantasyPick = typeof fantasyPicks.$inferInsert;
export type FantasyLineup = typeof fantasyLineups.$inferSelect;
export type InsertFantasyLineup = typeof fantasyLineups.$inferInsert;

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

export const modularPages = pgTable("modular_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull(),
  description: text("description"),
  pageBackground: jsonb("page_background").$type<{
    type: 'color' | 'gradient' | 'image';
    value: string; // hex color, gradient CSS, or image URL
    opacity?: number;
  }>(),
  modules: jsonb("modules").$type<Array<{
    id: string;
    type: 'registration' | 'donation' | 'sponsors' | 'schedule' | 'brackets' | 'info' | 'contact';
    position: number; // for ordering
    config: any; // module-specific configuration
    styling: {
      background?: {
        type: 'color' | 'gradient' | 'image';
        value: string;
        opacity?: number;
      };
      textColor?: string;
      borderColor?: string;
      borderRadius?: number;
      padding?: number;
      margin?: number;
    };
  }>>().default([]),
  isPublished: boolean("is_published").default(false),
  isRegistrationOpen: boolean("is_registration_open").default(false),
  customDomain: varchar("custom_domain"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const modularPagesRelations = relations(modularPages, ({ one, many }) => ({
  user: one(users, {
    fields: [modularPages.userId],
    references: [users.id],
  }),
}));

export type ModularPage = typeof modularPages.$inferSelect;
export type InsertModularPage = typeof modularPages.$inferInsert;

export const registrationFormFields = pgTable("registration_form_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull().references(() => modularPages.id),
  moduleId: varchar("module_id").notNull(), // corresponds to module.id in modularPages.modules
  fieldType: text("field_type", {
    enum: ["text", "email", "phone", "number", "textarea", "select", "checkbox", "radio", "date", "file"]
  }).notNull(),
  label: varchar("label").notNull(),
  placeholder: varchar("placeholder"),
  isRequired: boolean("is_required").default(false),
  position: integer("position").notNull(),
  options: jsonb("options").$type<string[]>(), // for select, radio, checkbox
  validation: jsonb("validation").$type<{
    minLength?: number;
    maxLength?: number;
    pattern?: string; // regex pattern
    min?: number; // for number/date
    max?: number; // for number/date
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const registrationResponses = pgTable("registration_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: varchar("page_id").notNull().references(() => modularPages.id),
  moduleId: varchar("module_id").notNull(),
  participantEmail: varchar("participant_email"),
  participantName: varchar("participant_name"),
  formData: jsonb("form_data").$type<Record<string, any>>(), // field_id -> value mapping
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "failed", "refunded"]
  }).default("pending"),
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  approvalStatus: text("approval_status", {
    enum: ["pending", "approved", "rejected"]
  }).default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow(),

export const teamRegistrations = pgTable("team_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  coachId: varchar("coach_id").references(() => users.id), // Optional - for logged in users
  teamName: varchar("team_name").notNull(),
  organizationName: varchar("organization_name"), // School/club name
  
  // JERSEY WATCH-STYLE TEAM CAPTAIN FEATURES
  teamCode: varchar("team_code").notNull().unique(), // Shareable 8-character code
  captainName: varchar("captain_name").notNull(),
  captainEmail: varchar("captain_email").notNull(),
  captainPhone: varchar("captain_phone"),
  
  // FLEXIBLE PAYMENT CONFIGURATION
  paymentMethod: text("payment_method", {
    enum: ["captain_pays_all", "individual_payments", "mixed"]
  }).default("individual_payments"),
  
  playerList: jsonb("player_list"), // Array of player details
  registeredEvents: jsonb("registered_events"), // Which events this team is competing in
  registrationStatus: text("registration_status", {
    enum: ["incomplete", "pending_approval", "approved", "rejected", "waitlisted", "partial", "complete", "tournament_ready"]
  }).default("incomplete"),
  
  // Enhanced payment tracking
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "partial", "paid", "refunded"]
  }).default("unpaid"),
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  paymentBreakdown: jsonb("payment_breakdown").$type<Array<{
    playerId: string;
    playerName: string;
    amount: number;
    paidBy: string; // parent email or name
    paidAt?: string;
    paymentMethod?: string;
    transactionId?: string;
  }>>().default([]),
  
  // TEAM REQUIREMENTS
  requiredPlayers: integer("required_players"),
  currentPlayers: integer("current_players").default(0),
  maxPlayers: integer("max_players"),
  
  // DISCOUNT & PAYMENT PLAN INTEGRATION
  appliedDiscountCode: varchar("applied_discount_code"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  paymentPlanId: varchar("payment_plan_id").references(() => paymentPlans.id),
  
  // Document compliance tracking
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
});

export const jerseyTeamMembers = pgTable("jersey_team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamRegistrationId: varchar("team_registration_id").notNull().references(() => teamRegistrations.id),
  
  // PLAYER INFORMATION
  playerName: varchar("player_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  jerseyNumber: varchar("jersey_number"),
  position: varchar("position"),
  
  // PARENT/GUARDIAN INFORMATION
  parentName: varchar("parent_name").notNull(),
  parentEmail: varchar("parent_email").notNull(),
  parentPhone: varchar("parent_phone"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  
  // REGISTRATION STATUS
  memberStatus: text("member_status", {
    enum: ["invited", "registered", "payment_pending", "complete"]
  }).default("invited"),
  
  // PAYMENT TRACKING (for individual payments)
  individualFee: decimal("individual_fee", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "paid", "refunded"]
  }).default("unpaid"),
  paymentDate: timestamp("payment_date"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  
  // DOCUMENTS & FORMS
  documentsRequired: jsonb("documents_required").$type<{
    birthCertificate: boolean;
    medicalForm: boolean;
    photoConsent: boolean;
    liabilityWaiver: boolean;
  }>(),
  documentsComplete: boolean("documents_complete").default(false),
  
  // REGISTRATION FORM DATA (JotForm-style fields)
  customFormData: jsonb("custom_form_data"),
  
  joinedAt: timestamp("joined_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jerseyTeamPayments = pgTable("jersey_team_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamRegistrationId: varchar("team_registration_id").notNull().references(() => teamRegistrations.id),
  payerName: varchar("payer_name").notNull(), // Who made the payment
  payerEmail: varchar("payer_email").notNull(),
  
  // PAYMENT DETAILS
  paymentAmount: decimal("payment_amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: text("payment_type", {
    enum: ["team_captain", "individual_member", "parent_guardian", "sponsor"]
  }).notNull(),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "check", "cash", "payment_plan"]
  }).notNull(),
  
  // STRIPE INTEGRATION
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeCustomerId: varchar("stripe_customer_id"),
  
  // PAYMENT PLAN INTEGRATION
  paymentPlanEnrollmentId: varchar("payment_plan_enrollment_id").references(() => paymentPlanEnrollments.id),
  
  // ALLOCATION (which team members this payment covers)
  coversMembers: jsonb("covers_members").$type<string[]>(), // Array of team member IDs
  allocationNotes: text("allocation_notes"),
  
  paymentDate: timestamp("payment_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamName: varchar("team_name").notNull(),
  organizationName: varchar("organization_name"),
  coachName: varchar("coach_name").notNull(),
  coachEmail: varchar("coach_email").notNull(),
  coachPhone: varchar("coach_phone"),
  coachId: varchar("coach_id").references(() => users.id),
  assistantCoaches: jsonb("assistant_coaches").$type<Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }>>().default([]),
  teamColor: varchar("team_color"),
  homeVenue: varchar("home_venue"),
  ageGroup: varchar("age_group"), // U12, U14, JV, Varsity, etc.
  division: varchar("division"), // A, B, Recreational, etc.
  
  // Critical fields for billing and team management
  sport: varchar("sport").notNull(), // basketball, football, soccer, volleyball, baseball, etc.
  teamSize: integer("team_size").notNull(), // Number of players for billing calculations
  
  status: text("status", { 
    enum: ["active", "inactive", "suspended"] 
  }).default("active"),
  
  // Team subscription management
  subscriptionStatus: text("subscription_status", {
    enum: ["free", "active", "past_due", "canceled", "unpaid"]
  }).default("free"),
  subscriptionTier: text("subscription_tier", {
    enum: ["basic", "premium", "enterprise"]
  }).default("basic"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  
  // Secure team linking system (fixes IDOR vulnerability)
  linkTokenHash: varchar("link_token_hash"), // Hashed secure token for linking
  linkTokenExpiresAt: timestamp("link_token_expires_at"), // Token expiration (24 hours)
  linkTokenUsed: boolean("link_token_used").default(false), // Single-use token flag
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamPlayers = pgTable("team_players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  playerName: varchar("player_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  jerseyNumber: varchar("jersey_number"),
  position: varchar("position"),
  parentGuardianName: varchar("parent_guardian_name"),
  parentGuardianEmail: varchar("parent_guardian_email"),
  parentGuardianPhone: varchar("parent_guardian_phone"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  medicalNotes: text("medical_notes"),
  allergies: text("allergies"),
  medications: text("medications"),
  physicianName: varchar("physician_name"),
  physicianPhone: varchar("physician_phone"),
  homeAddress: text("home_address"),
  profilePicture: varchar("profile_picture"),
  medicalClearanceDoc: varchar("medical_clearance_doc"),
  birthCertificateDoc: varchar("birth_certificate_doc"),
  physicalFormDoc: varchar("physical_form_doc"),
  status: text("status", { 
    enum: ["active", "inactive", "injured", "suspended"] 
  }).default("active"),
  
  // Health & Safety Analytics
  healthAlerts: jsonb("health_alerts").$type<{
    alertId: string;
    alertType: 'performance_decline' | 'injury_risk' | 'fatigue_pattern' | 'unusual_behavior';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendedActions: string[];
    triggeredDate: string;
    resolvedDate?: string;
    resolvedBy?: string;
    notes?: string;
  }[]>(),
  
  performanceTrends: jsonb("performance_trends").$type<{
    eventType: string;
    sport: string;
    measurements: {
      date: string;
      value: number;
      unit: string;
      conditions?: string; // weather, venue, etc.
      notes?: string;
    }[];
    trendAnalysis: {
      direction: 'improving' | 'declining' | 'stable' | 'inconsistent';
      confidenceLevel: number; // 0-100
      lastAnalyzedDate: string;
      concernLevel: 'none' | 'minor' | 'moderate' | 'significant';
      autoGeneratedRecommendations?: string[];
    };
  }[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventLocations = pgTable("event_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  eventName: varchar("event_name").notNull(),
  venueName: varchar("venue_name").notNull(),
  address: text("address").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  geofenceRadius: integer("geofence_radius").default(100), // meters
  allowRemoteScoring: boolean("allow_remote_scoring").default(false),
  requireLocationVerification: boolean("require_location_verification").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const locationCheckIns = pgTable("location_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventLocationId: varchar("event_location_id").notNull().references(() => eventLocations.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  checkInLatitude: numeric("check_in_latitude", { precision: 10, scale: 8 }).notNull(),
  checkInLongitude: numeric("check_in_longitude", { precision: 11, scale: 8 }).notNull(),
  distanceFromVenue: integer("distance_from_venue"), // meters
  checkInType: text("check_in_type", {
    enum: ["participant_arrival", "scorekeeper_arrival", "event_start", "event_end", "score_update"]
  }).notNull(),
  verificationStatus: text("verification_status", {
    enum: ["verified", "outside_range", "manual_override", "failed"]
  }).default("verified"),
  checkInTime: timestamp("check_in_time").defaultNow(),
  notes: text("notes"),
});

export const locationScoringPermissions = pgTable("location_scoring_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scorekeeperId: varchar("scorekeeper_id").notNull().references(() => users.id),
  eventLocationId: varchar("event_location_id").notNull().references(() => eventLocations.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  isLocationVerified: boolean("is_location_verified").default(false),
  lastLocationCheck: timestamp("last_location_check"),
  locationCheckLatitude: numeric("location_check_latitude", { precision: 10, scale: 8 }),
  locationCheckLongitude: numeric("location_check_longitude", { precision: 11, scale: 8 }),
  distanceFromVenue: integer("distance_from_venue"), // meters
  canScoreRemotely: boolean("can_score_remotely").default(false),
  permissionGrantedBy: varchar("permission_granted_by").references(() => users.id),
  permissionNotes: text("permission_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EventLocation = typeof eventLocations.$inferSelect;
export type InsertEventLocation = typeof eventLocations.$inferInsert;

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

export type EventScore = typeof eventScores.$inferSelect;
export type InsertEventScore = typeof eventScores.$inferInsert;

export const tournamentCredits = pgTable("tournament_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  packageType: text("package_type", {
    enum: ["single_tournament", "tournament_5_pack", "tournament_10_pack", "monthly_boost"]
  }).notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  priceAmount: decimal("price_amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripe_payment_id"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  expiresAt: timestamp("expires_at"), // Credits can expire
  status: text("status", {
    enum: ["pending", "completed", "failed", "refunded"]
  }).default("pending"),
});

export const registrationCodes = pgTable("registration_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(), // The actual registration code
  type: text("type", {
    enum: ["tournament_manager", "district_admin", "business_user", "fantasy_commissioner", "gaming_commissioner"]
  }).notNull(),
  createdBy: varchar("created_by").notNull(), // User ID who created the code
  organizationId: varchar("organization_id"), // Associated organization
  leagueId: varchar("league_id"), // Associated league/tournament
  permissions: jsonb("permissions").$type<string[]>().notNull(),
  maxUses: integer("max_uses").default(1), // How many people can use this code
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leagues = pgTable("leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["fantasy-sports", "gaming", "office", "custom", "general"]
  }).notNull(),
  commissionerId: varchar("commissioner_id").references(() => users.id).notNull(),
  registrationCode: varchar("registration_code").unique().notNull(),
  settings: jsonb("settings").$type<{
    isPrivate: boolean;
    maxParticipants: number;
    season: string;
    sport?: string;
    game?: string;
    rules: string;
  }>(),
  participants: jsonb("participants").$type<Array<{
    userId: string;
    joinedAt: string;
    status: 'active' | 'inactive';
  }>>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type RegistrationCode = typeof registrationCodes.$inferSelect;
export type InsertRegistrationCode = typeof registrationCodes.$inferInsert;
export type League = typeof leagues.$inferSelect;
export type InsertLeague = typeof leagues.$inferInsert;

// Corporate competition types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type CorporateCompetition = typeof corporateCompetitions.$inferSelect;
export type InsertCorporateCompetition = typeof corporateCompetitions.$inferInsert;
export type CorporateParticipant = typeof corporateParticipants.$inferSelect;
export type InsertCorporateParticipant = typeof corporateParticipants.$inferInsert;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;
export type CompetitionLeaderboard = typeof competitionLeaderboards.$inferSelect;
export type InsertCompetitionLeaderboard = typeof competitionLeaderboards.$inferInsert;

// Create insert schemas for corporate tables
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  activeCompetitions: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorporateCompetitionSchema = createInsertSchema(corporateCompetitions).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorporateParticipantSchema = createInsertSchema(corporateParticipants).omit({
  id: true,
  currentScore: true,
  currentRank: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  verificationStatus: true,
  createdAt: true,
});

// Corporate relations
export const companiesRelations = relations(companies, ({ many }) => ({
  competitions: many(corporateCompetitions),
}));

export const corporateCompetitionsRelations = relations(corporateCompetitions, ({ one, many }) => ({
  company: one(companies, {
    fields: [corporateCompetitions.companyId],
    references: [companies.id],
  }),
  participants: many(corporateParticipants),
  metrics: many(performanceMetrics),
  leaderboards: many(competitionLeaderboards),
}));

export const corporateParticipantsRelations = relations(corporateParticipants, ({ one, many }) => ({
  competition: one(corporateCompetitions, {
    fields: [corporateParticipants.competitionId],
    references: [corporateCompetitions.id],
  }),
  user: one(users, {
    fields: [corporateParticipants.userId],
    references: [users.id],
  }),
  metrics: many(performanceMetrics),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({

export const organizerPageViews = pgTable("organizer_page_views", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  
  // PAGE VIEW DETAILS
  pageUrl: varchar("page_url").notNull(),
  pageTitle: varchar("page_title"),
  pageType: varchar("page_type").notNull(), // tournament_home, registration, teams, brackets, etc.
  
  // VISITOR INFORMATION
  visitorId: varchar("visitor_id"), // Anonymous visitor tracking
  visitorIp: varchar("visitor_ip"),
  userAgent: text("user_agent"),
  referrer: varchar("referrer"),
  
  // LOCATION & DEVICE
  country: varchar("country"),
  city: varchar("city"),
  deviceType: varchar("device_type"), // mobile, desktop, tablet
  browserName: varchar("browser_name"),
  
  // SESSION TRACKING
  sessionId: varchar("session_id"),
  sessionDuration: integer("session_duration"), // seconds on page
  isNewVisitor: boolean("is_new_visitor").default(true),
  
  viewedAt: timestamp("viewed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const organizerContacts = pgTable("organizer_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  
  // CONTACT INFORMATION
  contactName: varchar("contact_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  
  // CONTACT SOURCE
  contactSource: varchar("contact_source").notNull(), // registration, team_captain, parent, spectator, volunteer
  contactRole: varchar("contact_role"), // player, parent, coach, official, volunteer
  
  // ORGANIZATION DETAILS
  organizationName: varchar("organization_name"),
  teamName: varchar("team_name"),
  
  // CONTACT PREFERENCES
  emailOptIn: boolean("email_opt_in").default(false),
  smsOptIn: boolean("sms_opt_in").default(false),
  marketingOptIn: boolean("marketing_opt_in").default(false),
  
  // ENGAGEMENT TRACKING
  lastEmailSent: timestamp("last_email_sent"),
  lastEmailOpened: timestamp("last_email_opened"),
  emailOpenCount: integer("email_open_count").default(0),
  totalTournaments: integer("total_tournaments").default(1), // How many tournaments they've participated in
  
  // GEOGRAPHIC INFO
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  
  collectedAt: timestamp("collected_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const organizerMetrics = pgTable("organizer_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  
  // METRICS DATE
  metricDate: date("metric_date").notNull(), // Daily aggregation
  
  // PAGE VIEW METRICS
  totalPageViews: integer("total_page_views").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  newVisitors: integer("new_visitors").default(0),
  avgSessionDuration: integer("avg_session_duration").default(0),
  
  // CONTACT METRICS
  totalContacts: integer("total_contacts").default(0),
  newContactsToday: integer("new_contacts_today").default(0),
  emailOptIns: integer("email_opt_ins").default(0),
  smsOptIns: integer("sms_opt_ins").default(0),
  
  // TOURNAMENT METRICS
  activeTournaments: integer("active_tournaments").default(0),
  totalRegistrations: integer("total_registrations").default(0),
  newRegistrationsToday: integer("new_registrations_today").default(0),
  
  // GEOGRAPHIC DISTRIBUTION
  topCities: jsonb("top_cities").$type<Array<{city: string, count: number}>>().default([]),
  topStates: jsonb("top_states").$type<Array<{state: string, count: number}>>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const guestParticipants = pgTable("guest_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  
  // PARTICIPANT INFORMATION (required for guest registration)
  participantName: varchar("participant_name").notNull(),
  participantEmail: varchar("participant_email").notNull(),
  participantPhone: varchar("participant_phone"),
  dateOfBirth: date("date_of_birth"),
  
  // PARENT/GUARDIAN INFO (for minors)
  parentName: varchar("parent_name"),
  parentEmail: varchar("parent_email"),
  parentPhone: varchar("parent_phone"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  
  // REGISTRATION DETAILS
  registrationType: text("registration_type", {
    enum: ["individual", "team_member", "group_registration"]
  }).default("individual"),
  selectedEvents: jsonb("selected_events").$type<Array<{
    eventId: string;
    eventName: string;
    fee: number;
  }>>().default([]),
  
  // PAYMENT INFORMATION
  registrationFee: decimal("registration_fee", { precision: 10, scale: 2 }).default("0"),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "paid", "refunded", "partial"]
  }).default("unpaid"),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "cash", "check", "comp"]
  }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  
  // STATUS TRACKING
  registrationStatus: text("registration_status", {
    enum: ["incomplete", "pending_approval", "approved", "checked_in", "competed", "complete"]
  }).default("incomplete"),
  
  // OPTIONAL ACCOUNT CREATION
  hasCreatedAccount: boolean("has_created_account").default(false),
  linkedUserId: varchar("linked_user_id").references(() => users.id), // If they create an account later
  accountCreatedAt: timestamp("account_created_at"),
  
  // TOURNAMENT ORGANIZER RELATIONSHIP
  organizerId: varchar("organizer_id").notNull().references(() => users.id), // Tournament organizer
  
  // WAIVERS & DOCUMENTS
  waiversSigned: jsonb("waivers_signed").$type<{
    liability: boolean;
    photo: boolean;
    medical: boolean;
    emergency: boolean;
  }>().default({
    liability: false,
    photo: false,
    medical: false,
    emergency: false
  }),
  
  // CUSTOM FORM DATA
  customFormData: jsonb("custom_form_data"), // Tournament-specific registration fields
  
  // COMMUNICATION PREFERENCES
  emailUpdates: boolean("email_updates").default(true),
  smsUpdates: boolean("sms_updates").default(false),
  
  // METADATA
  registrationSource: varchar("registration_source").default("direct"), // direct, referral, social
  notes: text("notes"),
  organizerNotes: text("organizer_notes"), // Private notes for tournament organizer
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Password reset tokens for tournament organizers

// Relations for guest participants
export const guestParticipantsRelations = relations(guestParticipants, ({ one }) => ({

export const merchandiseProducts = pgTable("merchandise_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  tournamentId: varchar("tournament_id"), // Optional - can be tournament-specific or organization-wide
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
});

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
});

export const eventTickets = pgTable("event_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  tournamentId: varchar("tournament_id"),
  eventId: varchar("event_id"), // Links to specific tournament events/matches
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
});

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

export const tournamentRegistrationForms = pgTable("tournament_registration_forms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  formName: varchar("form_name").notNull(),
  formDescription: text("form_description"),
  
  // Smart targeting configuration
  targetDivisions: jsonb("target_divisions").$type<string[]>(), // tournamentDivisions.id references
  targetEvents: jsonb("target_events").$type<string[]>(), // tournamentEvents.id references
  
  // Participant criteria for smart matching
  participantCriteria: jsonb("participant_criteria").$type<{
    ageRange?: { min: number; max: number };
    gender?: "men" | "women" | "boys" | "girls" | "mixed" | "co-ed";
    skillLevel?: "beginner" | "intermediate" | "advanced" | "expert";
    sport?: string;
    participantType?: "individual" | "team";
  }>(),
  
  // Form configuration
  collectsContactInfo: boolean("collects_contact_info").default(true),
  collectsEmergencyContact: boolean("collects_emergency_contact").default(false),
  collectsMedicalInfo: boolean("collects_medical_info").default(false),
  requiresPayment: boolean("requires_payment").default(false),
  entryFee: numeric("entry_fee").default("0"),
  
  // Form status and capacity
  isActive: boolean("is_active").default(true),
  registrationDeadline: timestamp("registration_deadline"),
  maxRegistrations: integer("max_registrations"),
  currentRegistrations: integer("current_registrations").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const registrationSubmissions = pgTable("registration_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  formId: varchar("form_id").notNull().references(() => tournamentRegistrationForms.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  
  // Participant information
  participantName: varchar("participant_name").notNull(),
  participantType: text("participant_type", { enum: ["individual", "team"] }).notNull(),
  teamName: varchar("team_name"), // For team registrations
  teamMembers: jsonb("team_members").$type<Array<{
    name: string;
    position?: string;
    grade?: string;
  }>>(), // For team registrations
  
  // Contact information
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  emergencyContact: jsonb("emergency_contact").$type<{
    name: string;
    phone: string;
    relationship: string;
  }>(),
  
  // Participant criteria (for smart matching)
  age: integer("age"),
  grade: varchar("grade"),
  gender: text("gender", { enum: ["men", "women", "boys", "girls", "mixed", "co-ed", "other"] }), // Aligned with form criteria
  skillLevel: text("skill_level", { enum: ["beginner", "intermediate", "advanced", "expert"] }),
  
  // Event selections for multi-event tournaments (Track & Field, Swimming, etc.)
  requestedEventIds: jsonb("requested_event_ids").$type<string[]>(), // Events participant wants to compete in
  eventPreferences: jsonb("event_preferences").$type<{
    priority: 'high' | 'medium' | 'low';
    notes?: string;
  }[]>(), // Optional preferences for event assignment
  
  // Smart assignment results
  assignedDivisionId: varchar("assigned_division_id").references(() => tournamentDivisions.id),
  assignedEventIds: jsonb("assigned_event_ids").$type<string[]>(),
  assignmentStatus: text("assignment_status", {
    enum: ["pending", "assigned", "confirmed", "waitlisted", "rejected"]
  }).default("pending"),
  seedNumber: integer("seed_number"), // Assigned seed in division
  
  // Payment and status
  registrationStatus: text("registration_status", {
    enum: ["draft", "submitted", "approved", "rejected", "withdrawn"]
  }).default("draft"),
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "pending", "paid", "refunded"]
  }).default("unpaid"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  
  // Metadata
  submittedAt: timestamp("submitted_at"),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id),
  notes: text("notes"), // Admin notes about assignment
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const registrationAssignmentLog = pgTable("registration_assignment_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull().references(() => registrationSubmissions.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  
  // Assignment decision data
  matchingCriteria: jsonb("matching_criteria").notNull(), // What criteria were used
  availableTargets: jsonb("available_targets").notNull(), // What divisions/events were considered
  selectedTarget: jsonb("selected_target").notNull(), // What was chosen and why
  
  // Capacity tracking at time of assignment
  capacitySnapshot: jsonb("capacity_snapshot").$type<{
    divisionId?: string;
    eventId?: string;
    currentCount: number;
    maxCapacity: number;
    waitlistCount: number;
  }>(),
  
  assignmentReason: text("assignment_reason").notNull(), // "Best age/gender match", "Only available slot", etc.
  wasAutomaticAssignment: boolean("was_automatic_assignment").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for smart tournament-registration linking
export type TournamentRegistrationForm = typeof tournamentRegistrationForms.$inferSelect;
export type InsertTournamentRegistrationForm = typeof tournamentRegistrationForms.$inferInsert;
export type RegistrationSubmission = typeof registrationSubmissions.$inferSelect;
export type InsertRegistrationSubmission = typeof registrationSubmissions.$inferInsert;
export type RegistrationAssignmentLog = typeof registrationAssignmentLog.$inferSelect;
export type InsertRegistrationAssignmentLog = typeof registrationAssignmentLog.$inferInsert;

export const rosters = pgTable("rosters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolSportsProgramId: varchar("school_sports_program_id").notNull().references(() => schoolSportsPrograms.id),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id),
  seasonId: varchar("season_id").notNull().references(() => athleticSeasons.id),
  
  // Roster Details
  jerseyNumber: integer("jersey_number"),
  position: varchar("position"),
  captainRole: text("captain_role", { 
    enum: ["captain", "co_captain", "team_leader", "none"] 
  }).default("none"),
  
  // Participation Tracking
  rosterStatus: text("roster_status", {
    enum: ["active", "injured_reserve", "academic_hold", "suspended", "quit", "cut"]
  }).default("active"),
  joinDate: date("join_date"),
  leaveDate: date("leave_date"),
  leaveReason: text("leave_reason"),
  
  // Performance Metrics
  gamesPlayed: integer("games_played").default(0),
  gamesStarted: integer("games_started").default(0),
  totalPractices: integer("total_practices").default(0),
  practicesAttended: integer("practices_attended").default(0),
  
  // Academic Eligibility Tracking
  gradeChecksPassed: integer("grade_checks_passed").default(0),
  gradeChecksTotal: integer("grade_checks_total").default(0),
  currentGPA: decimal("current_gpa", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// INJURY & HEALTH TRACKING SYSTEM
// =============================================================================

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seasonId: varchar("season_id").notNull().references(() => athleticSeasons.id),
  homeSchoolSportsProgramId: varchar("home_school_sports_program_id").notNull().references(() => schoolSportsPrograms.id),
  awaySchoolSportsProgramId: varchar("away_school_sports_program_id").references(() => schoolSportsPrograms.id),
  opponentName: varchar("opponent_name"), // For non-school opponents
  
  // Game Details
  gameDate: date("game_date").notNull(),
  gameTime: varchar("game_time"), // "7:00 PM"
  gameType: text("game_type", {
    enum: ["regular_season", "playoff", "tournament", "scrimmage", "jamboree", "exhibition"]
  }).notNull(),
  competitionLevel: text("competition_level", {
    enum: ["freshman", "junior_varsity", "varsity", "mixed"]
  }).notNull(),
  
  // Location
  venueId: varchar("venue_id").references(() => athleticVenues.id),
  venueName: varchar("venue_name"), // For away games at other venues
  isHomeGame: boolean("is_home_game").default(true),
  
  // Game Management
  gameStatus: text("game_status", {
    enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "postponed", "forfeit"]
  }).default("scheduled"),
  weather: varchar("weather"),
  weatherStatus: text("weather_status", {
    enum: ["normal", "watch", "warning", "cancelled"]
  }).default("normal"),
  
  // Officiating
  officialsNeeded: integer("officials_needed").default(3),
  officialsConfirmed: integer("officials_confirmed").default(0),
  officiatingCost: decimal("officiating_cost", { precision: 8, scale: 2 }),
  
  // Results
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  winner: text("winner", { enum: ["home", "away", "tie"] }),
  gameLength: integer("game_length"), // minutes
  attendance: integer("attendance"),
  
  // Administrative
  transportationArranged: boolean("transportation_arranged").default(false),
  transportationCost: decimal("transportation_cost", { precision: 8, scale: 2 }),
  gameNotes: text("game_notes"),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const practices = pgTable("practices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolSportsProgramId: varchar("school_sports_program_id").notNull().references(() => schoolSportsPrograms.id),
  seasonId: varchar("season_id").notNull().references(() => athleticSeasons.id),
  
  // Practice Details
  practiceDate: date("practice_date").notNull(),
  startTime: varchar("start_time").notNull(), // "3:30 PM"
  endTime: varchar("end_time").notNull(), // "5:30 PM"
  duration: integer("duration"), // minutes
  
  // Location and Type
  venueId: varchar("venue_id").references(() => athleticVenues.id),
  practiceType: text("practice_type", {
    enum: ["regular", "conditioning", "film_study", "scrimmage", "team_meeting", "individual_work"]
  }).default("regular"),
  
  // Practice Focus
  practiceObjectives: jsonb("practice_objectives").$type<string[]>().default([]),
  drillsPlanned: jsonb("drills_planned").$type<{
    drillName: string;
    duration: number;
    focus: string;
  }[]>().default([]),
  
  // Attendance and Status
  practiceStatus: text("practice_status", {
    enum: ["scheduled", "in_progress", "completed", "cancelled", "moved"]
  }).default("scheduled"),
  attendanceRequired: boolean("attendance_required").default(true),
  playersPresent: integer("players_present"),
  playersAbsent: integer("players_absent"),
  
  // Weather and Conditions
  weather: varchar("weather"),
  indoorAlternativeId: varchar("indoor_alternative_id").references(() => athleticVenues.id),
  
  // Notes and Follow-up
  practiceNotes: text("practice_notes"),
  equipmentNeeded: jsonb("equipment_needed").$type<string[]>().default([]),
  injuriesOccurred: boolean("injuries_occurred").default(false),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventTemplates = pgTable("event_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  measureType: varchar("measure_type").notNull(), // "time", "distance", "score", etc.
  unit: varchar("unit").notNull(), // "seconds", "meters", "points", etc.
  category: varchar("category"), // "track", "field", "academic", etc.
  defaultMaxParticipants: integer("default_max_participants"),
  defaultMinParticipants: integer("default_min_participants"),
  isPublic: boolean("is_public").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  configuration: jsonb("configuration").$type<{
    judging?: {
      judgeCount: number;
      scoringCriteria: Array<{
        criterion: string;
        weight: number;
        maxScore: number;
      }>;
    };
    timing?: {
      precision: 'millisecond' | 'second' | 'minute';
      laps?: number;
      splits?: boolean;
    };
    equipment?: string[];
    rules?: string[];
    customFields?: Array<{
      name: string;
      type: 'string' | 'number' | 'boolean';
      required: boolean;
    }>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scoringPolicies = pgTable("scoring_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  policyType: varchar("policy_type").notNull(), // "tournament", "stage", "event"
  scoringRules: jsonb("scoring_rules").$type<{
    pointsSystem?: {
      win: number;
      draw?: number;
      loss?: number;
      bonus?: Array<{
        condition: string;
        points: number;
      }>;
    };
    rankingSystem?: {
      method: 'points' | 'wins' | 'rating' | 'time' | 'score';
      direction: 'ascending' | 'descending';
      tiebreakers: Array<{
        field: string;
        direction: 'ascending' | 'descending';
      }>;
    };
    advancementRules?: {
      method: 'top_n' | 'percentage' | 'threshold';
      value: number;
      stage?: string;
    };
  }>(),
  applicableEngines: jsonb("applicable_engines").$type<string[]>(), // ["single", "double", "round_robin", etc.]
  isPublic: boolean("is_public").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),


// =============================================================================

export const tournamentOrganizations: any = pgTable("tournament_organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationName: varchar("organization_name").notNull(),
  organizationType: varchar("organization_type").notNull(), // district, school, club, community
  parentOrganizationId: varchar("parent_organization_id"),
  subscriptionTier: varchar("subscription_tier").notNull(),
  whiteLabelConfig: jsonb("white_label_config"),
  brandingConfig: jsonb("branding_config"),
  customDomain: varchar("custom_domain"),
  organizationSettings: jsonb("organization_settings"),
  billingConfig: jsonb("billing_config"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});
// INSERT SCHEMAS & TYPES
// =============================================================================

// Key tournament insert schemas
export const insertTournamentSchema = createInsertSchema(tournaments).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTeamSchema = createInsertSchema(teams).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertTeamRegistrationSchema = createInsertSchema(teamRegistrations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertGameSchema = createInsertSchema(games).omit({ 
  id: true, 
  createdAt: true 
});

export const insertMatchSchema = createInsertSchema(matches).omit({ 
  id: true, 
  createdAt: true 
});

export const insertEventResultSchema = createInsertSchema(eventResults).omit({ 
  id: true, 
  createdAt: true 
});

// Type exports for all tournament tables
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type TeamRegistration = typeof teamRegistrations.$inferSelect;
export type TeamPlayer = typeof teamPlayers.$inferSelect;
export type Roster = typeof rosters.$inferSelect;
export type Game = typeof games.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type EventResult = typeof eventResults.$inferSelect;
export type TournamentEvent = typeof tournamentEvents.$inferSelect;
export type SportEvent = typeof sportEvents.$inferSelect;
export type League = typeof leagues.$inferSelect;
export type TournamentDivision = typeof tournamentDivisions.$inferSelect;
export type RegistrationRequest = typeof registrationRequests.$inferSelect;
export type LiveScore = typeof liveScores.$inferSelect;
export type CorporateCompetition = typeof corporateCompetitions.$inferSelect;
export type MerchandiseProduct = typeof merchandiseProducts.$inferSelect;
export type MerchandiseOrder = typeof merchandiseOrders.$inferSelect;
export type EventTicket = typeof eventTickets.$inferSelect;
export type TicketOrder = typeof ticketOrders.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type ModularPage = typeof modularPages.$inferSelect;

// Relations defined in domain-specific files to avoid circular dependencies
