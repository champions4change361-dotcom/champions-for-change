import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index } from "drizzle-orm/pg-core";
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
    enum: ["free", "foundation", "starter", "professional", "champion", "enterprise", "district_enterprise"] 
  }).default("foundation"),
  userRole: text("user_role", {
    enum: ["tournament_manager", "district_athletic_director", "school_athletic_director", "coach", "scorekeeper", "athlete", "fan"]
  }).default("fan"),
  organizationId: varchar("organization_id"), // School district, club, etc.
  organizationName: varchar("organization_name"), // Name of school/club they represent
  isWhitelabelClient: boolean("is_whitelabel_client").default(false),
  whitelabelDomain: varchar("whitelabel_domain"),
  whitelabelBranding: jsonb("whitelabel_branding"), // Custom colors, logos, etc
  
  // AI PREFERENCE FIELDS
  aiPreferences: jsonb("ai_preferences").$type<{
    wantsProactiveHelp: boolean;
    communicationStyle: 'friendly' | 'professional' | 'technical';
    helpLevel: 'minimal' | 'guided' | 'comprehensive';
    hasCompletedOnboarding: boolean;
  }>(),
  
  techSkillLevel: text("tech_skill_level", {
    enum: ["beginner", "intermediate", "advanced"]
  }).default("intermediate"),
  
  // LEARNING PROGRESS
  completedAITutorials: jsonb("completed_ai_tutorials").$type<string[]>(),
  aiInteractionCount: integer("ai_interaction_count").default(0),
  
  // ENHANCED AI USAGE PREFERENCES
  enhancedAiPreferences: jsonb("enhanced_ai_preferences").$type<{
    wantsProactiveHelp: boolean;
    communicationStyle: 'friendly' | 'professional' | 'technical';
    helpLevel: 'minimal' | 'guided' | 'comprehensive';
    hasCompletedOnboarding: boolean;
    
    // AVATAR PREFERENCES
    avatarEnabled: boolean;
    avatarStyle: 'professional_coach' | 'friendly_advisor' | 'minimalist_icon' | 'sports_mascot';
    
    // USAGE REMINDER PREFERENCES
    usageRemindersEnabled: boolean;
    reminderFrequency: 'immediate' | 'daily' | 'weekly';
    lastUsageReminderSent: string;
    dismissedUpgradePrompts: string[]; // Track what they've already seen
  }>(),
  
  // SMART USAGE LIMITS FIELDS
  monthlyTournamentLimit: integer("monthly_tournament_limit").default(5),
  currentMonthTournaments: integer("current_month_tournaments").default(0),
  lastMonthReset: timestamp("last_month_reset").defaultNow(),
  
  // ABUSE PREVENTION
  registrationFingerprint: varchar("registration_fingerprint"),
  registrationIP: varchar("registration_ip"),
  verifiedPhone: varchar("verified_phone"),
  organizationVerified: boolean("organization_verified").default(false),
  
  // USAGE TRACKING
  totalTournamentsCreated: integer("total_tournaments_created").default(0),
  lifetimeUsageValue: decimal("lifetime_usage_value", { precision: 10, scale: 2 }).default("0"),
  
  // PAY-PER-TOURNAMENT CREDITS
  tournamentCredits: integer("tournament_credits").default(0),
  creditsPurchased: decimal("credits_purchased", { precision: 10, scale: 2 }).default("0"),
  
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
  notes: text("notes"),
  source: text("source").default("manual_entry"),
  lastContactDate: timestamp("last_contact_date"),
  contactStatus: text("contact_status", {
    enum: ["active", "inactive", "do_not_contact"]
  }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Donor contacts for donation tracking and follow-up
export const donors = pgTable("donors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  totalDonated: numeric("total_donated").default("0"),
  donationCount: integer("donation_count").default(0),
  lastDonationDate: timestamp("last_donation_date"),
  preferredContactMethod: text("preferred_contact_method", {
    enum: ["email", "phone", "text"]
  }).default("email"),
  source: text("source").default("landing_page"), // How they found us
  notes: text("notes"), // Any additional information
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual donation records
export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  donorId: varchar("donor_id").notNull().references(() => donors.id),
  amount: numeric("amount").notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  paymentStatus: text("payment_status", {
    enum: ["pending", "succeeded", "failed", "canceled"]
  }).default("pending"),
  donationPurpose: text("donation_purpose").default("general_education"), // What they're supporting
  postDonationChoice: text("post_donation_choice", {
    enum: ["test_platform", "just_donate", "learn_more"]
  }), // What they chose to do after donating
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organization registration and management
export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: text("type", {
    enum: ["school_district", "school", "club", "nonprofit", "business"]
  }).notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  website: varchar("website"),
  parentOrganizationId: varchar("parent_organization_id"), // For schools under districts
  isVerified: boolean("is_verified").default(false),
  verificationNotes: text("verification_notes"),
  registrationStatus: text("registration_status", {
    enum: ["pending", "approved", "rejected", "inactive"]
  }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Self-registration requests for review - ENHANCED WITH PROFESSIONAL FEATURES
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
    enum: ["foundation", "champion", "enterprise"]
  }).default("foundation"),
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

// Educational Impact Tracking for Champions for Change Mission
export const educationalImpactMetrics = pgTable("educational_impact_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  metricType: text("metric_type", {
    enum: ["revenue_generated", "students_funded", "trips_completed", "schools_reached", "tournaments_hosted"]
  }).notNull(),
  value: numeric("value").notNull(),
  description: text("description"),
  dateRecorded: timestamp("date_recorded").defaultNow(),
  academicYear: varchar("academic_year"), // "2024-2025"
  createdAt: timestamp("created_at").defaultNow(),
});

// Platform Analytics for Daniel's Revenue Tracking
export const platformAnalytics = pgTable("platform_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: timestamp("date").notNull(),
  activeUsers: integer("active_users").default(0),
  newSignups: integer("new_signups").default(0),
  tournamentsCreated: integer("tournaments_created").default(0),
  revenueGenerated: numeric("revenue_generated").default("0"),
  subscriptionUpgrades: integer("subscription_upgrades").default(0),
  whitelabelClientsActive: integer("whitelabel_clients_active").default(0),
  studentTripsFunded: integer("student_trips_funded").default(0),
  championsCampaignProgress: numeric("champions_campaign_progress").default("0"), // Toward $2,600 goal
  createdAt: timestamp("created_at").defaultNow(),
});

// Role-Based Access Control for Five-Tier Hierarchy
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userRole: text("user_role", {
    enum: ["tournament_manager", "district_athletic_director", "school_athletic_director", "coach", "scorekeeper", "athlete", "fan"]
  }).notNull(),
  permission: text("permission", {
    enum: [
      "create_tournaments", "manage_all_tournaments", "assign_schools_to_events", 
      "assign_coaches_to_events", "register_teams", "update_scores", "view_results",
      "manage_organization", "access_analytics", "white_label_admin"
    ]
  }).notNull(),
  isAllowed: boolean("is_allowed").default(false),
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
  eventCategory: text("event_category"), // Track, Field, Relay, Combined
  distanceMeters: integer("distance_meters"), // null for field events
  measurementType: text("measurement_type"), // time, distance, height, points
  maxAttempts: integer("max_attempts").default(3),
  usesLanes: boolean("uses_lanes").default(false),
  usesStagger: boolean("uses_stagger").default(false),
  usesHurdles: boolean("uses_hurdles").default(false),
  hurdleHeightMen: numeric("hurdle_height_men"), // in meters
  hurdleHeightWomen: numeric("hurdle_height_women"), // in meters
  hurdleCount: integer("hurdle_count").default(0),
  implementsUsed: jsonb("implements_used"), // Array of required equipment
  windLegalDistance: integer("wind_legal_distance"), // Distance for wind measurement
  qualifyingStandards: jsonb("qualifying_standards"), // Performance standards by level
  equipmentSpecs: jsonb("equipment_specs"), // Equipment specifications
  scoringMethod: text("scoring_method"), // time_ascending, distance_descending, etc.
  ribbonPlaces: integer("ribbon_places").default(8),
  ageRestrictions: jsonb("age_restrictions"), // Minimum age requirements
  genderSpecific: boolean("gender_specific").default(false), // Male/female only events
  sortOrder: integer("event_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Track Event Timing Configuration
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

// Tournament format configurations table - connects tournament structures to sport-specific settings
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

// Bracket templates table - pre-built bracket structures for common participant counts
export const bracketTemplates = pgTable("bracket_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentStructureId: varchar("tournament_structure_id").references(() => tournamentStructures.id),
  participantCount: integer("participant_count").notNull(),
  bracketStructure: jsonb("bracket_structure").notNull(),
  matchSequence: jsonb("match_sequence").notNull(),
  advancementMap: jsonb("advancement_map").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tournament generation log table - tracks tournament creation process
export const tournamentGenerationLog = pgTable("tournament_generation_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  generationStep: varchar("generation_step").notNull(),
  stepData: jsonb("step_data"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Competition format templates table - sport-specific configurations
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

// Game length templates table - sport and age-specific timing configurations
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

// Series templates table - multi-game series configurations  
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

// Tournament divisions table - the first tentacle
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

// Division participants table - the second tentacle
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

// Division templates table - the fourth tentacle
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

// Division generation rules table - kraken automation
export const divisionGenerationRules = pgTable("division_generation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  templateId: varchar("template_id").references(() => divisionTemplates.id),
  generationConfig: jsonb("generation_config").notNull(),
  status: varchar("status").default("pending"), // pending, generated, active, completed
  generatedDivisions: jsonb("generated_divisions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division scheduling table - kraken optimization
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

export const insertTrackEventTimingSchema = createInsertSchema(trackEventTiming).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentFormatConfigSchema = createInsertSchema(tournamentFormatConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertBracketTemplateSchema = createInsertSchema(bracketTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentGenerationLogSchema = createInsertSchema(tournamentGenerationLog).omit({
  id: true,
  createdAt: true,
});

export const insertCompetitionFormatTemplateSchema = createInsertSchema(competitionFormatTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertGameLengthTemplateSchema = createInsertSchema(gameLengthTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertSeriesTemplateSchema = createInsertSchema(seriesTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentDivisionSchema = createInsertSchema(tournamentDivisions).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionParticipantSchema = createInsertSchema(divisionParticipants).omit({
  id: true,
  registrationTime: true,
});

export const insertDivisionTemplateSchema = createInsertSchema(divisionTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionGenerationRuleSchema = createInsertSchema(divisionGenerationRules).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionSchedulingSchema = createInsertSchema(divisionScheduling).omit({
  id: true,
  createdAt: true,
});

// Insert schemas moved after table definitions

// ===================================================================
// TOURNAMENT EMPIRE ROLE-BASED SYSTEM! 👑⚡
// ===================================================================

// Role-based dashboard configuration
export const userDashboardConfigs = pgTable("user_dashboard_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userRole: varchar("user_role").notNull(),
  subscriptionTier: varchar("subscription_tier").notNull(),
  dashboardLayout: jsonb("dashboard_layout").notNull(),
  availableFeatures: jsonb("available_features").notNull(),
  uiPermissions: jsonb("ui_permissions").notNull(),
  navigationConfig: jsonb("navigation_config").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Organization hierarchy management (Tournament Empire)
export const tournamentOrganizations = pgTable("tournament_organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationName: varchar("organization_name").notNull(),
  organizationType: varchar("organization_type").notNull(), // district, school, club, community
  parentOrganizationId: varchar("parent_organization_id").references(() => tournamentOrganizations.id),
  subscriptionTier: varchar("subscription_tier").notNull(),
  whiteLabelConfig: jsonb("white_label_config"),
  brandingConfig: jsonb("branding_config"),
  customDomain: varchar("custom_domain"),
  organizationSettings: jsonb("organization_settings"),
  billingConfig: jsonb("billing_config"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// User-organization assignments
export const userOrganizationRoles = pgTable("user_organization_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id").references(() => tournamentOrganizations.id),
  roleWithinOrg: varchar("role_within_org").notNull(),
  permissionsOverride: jsonb("permissions_override"),
  assignmentDate: timestamp("assignment_date").default(sql`now()`),
  status: varchar("status").default("active"), // active, suspended, terminated
});

// Granular permission system
export const permissionAssignments = pgTable("permission_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  permissionType: varchar("permission_type").notNull(),
  resourceId: varchar("resource_id"), // tournament_id, event_id, organization_id
  resourceType: varchar("resource_type"), // tournament, event, organization, global
  permissionScope: jsonb("permission_scope"), // specific limitations like "discus_pit_only"
  grantedBy: varchar("granted_by").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Permission templates for common role assignments
export const permissionTemplates = pgTable("permission_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: varchar("template_name").notNull(),
  roleType: varchar("role_type").notNull(),
  subscriptionTier: varchar("subscription_tier").notNull(),
  permissions: jsonb("permissions").notNull(),
  restrictions: jsonb("restrictions"),
  createdAt: timestamp("created_at").default(sql`now()`),
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

// Import commissioner schema for fantasy league management
export * from './commissioner-schema';

// Track Events types
export type TrackEventData = typeof trackEvents.$inferSelect;
export type InsertTrackEventData = typeof trackEvents.$inferInsert;
export type TrackEventTiming = typeof trackEventTiming.$inferSelect;
export type InsertTrackEventTiming = typeof trackEventTiming.$inferInsert;

// Tournament Integration types
export type TournamentFormatConfig = typeof tournamentFormatConfigs.$inferSelect;
export type InsertTournamentFormatConfig = typeof tournamentFormatConfigs.$inferInsert;
export type BracketTemplate = typeof bracketTemplates.$inferSelect;
export type InsertBracketTemplate = typeof bracketTemplates.$inferInsert;
export type TournamentGenerationLog = typeof tournamentGenerationLog.$inferSelect;
export type InsertTournamentGenerationLog = typeof tournamentGenerationLog.$inferInsert;

// Competition Format types
export type CompetitionFormatTemplate = typeof competitionFormatTemplates.$inferSelect;
export type InsertCompetitionFormatTemplate = typeof competitionFormatTemplates.$inferInsert;
export type GameLengthTemplate = typeof gameLengthTemplates.$inferSelect;
export type InsertGameLengthTemplate = typeof gameLengthTemplates.$inferInsert;
export type SeriesTemplate = typeof seriesTemplates.$inferSelect;
export type InsertSeriesTemplate = typeof seriesTemplates.$inferInsert;

// Kraken Multi-Division types
export type TournamentDivision = typeof tournamentDivisions.$inferSelect;
export type InsertTournamentDivision = typeof tournamentDivisions.$inferInsert;
export type DivisionParticipant = typeof divisionParticipants.$inferSelect;
export type InsertDivisionParticipant = typeof divisionParticipants.$inferInsert;
export type DivisionTemplate = typeof divisionTemplates.$inferSelect;
export type InsertDivisionTemplate = typeof divisionTemplates.$inferInsert;
export type DivisionGenerationRule = typeof divisionGenerationRules.$inferSelect;
export type InsertDivisionGenerationRule = typeof divisionGenerationRules.$inferInsert;
export type DivisionScheduling = typeof divisionScheduling.$inferSelect;
export type InsertDivisionScheduling = typeof divisionScheduling.$inferInsert;

// Tournament Empire types
export type UserDashboardConfig = typeof userDashboardConfigs.$inferSelect;
export type InsertUserDashboardConfig = typeof userDashboardConfigs.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;
export type UserOrganizationRole = typeof userOrganizationRoles.$inferSelect;
export type InsertUserOrganizationRole = typeof userOrganizationRoles.$inferInsert;
export type PermissionAssignment = typeof permissionAssignments.$inferSelect;
export type InsertPermissionAssignment = typeof permissionAssignments.$inferInsert;
export type PermissionTemplate = typeof permissionTemplates.$inferSelect;
export type InsertPermissionTemplate = typeof permissionTemplates.$inferInsert;

// Tournament Empire insert schemas
export const insertUserDashboardConfigSchema = createInsertSchema(userDashboardConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentOrganizationSchema = createInsertSchema(tournamentOrganizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserOrganizationRoleSchema = createInsertSchema(userOrganizationRoles).omit({
  id: true,
  assignmentDate: true,
});

export const insertPermissionAssignmentSchema = createInsertSchema(permissionAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertPermissionTemplateSchema = createInsertSchema(permissionTemplates).omit({
  id: true,
  createdAt: true,
});

// ===================================================================
// ADULT-ONLY FANTASY SYSTEM! 🎮⚡ 
// DRAFTKINGS/FANDUEL COMPETITOR - LEGALLY BULLETPROOF!
// ===================================================================

// Fantasy leagues - age-gated and professional focus
export const fantasyLeagues = pgTable("fantasy_leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueName: varchar("league_name").notNull(),
  commissionerId: varchar("commissioner_id").notNull(),
  sportType: varchar("sport_type").notNull(), // nfl, nba, mlb, nhl, esports, college
  leagueFormat: varchar("league_format").notNull(), // survivor, draft, daily, season
  dataSource: varchar("data_source").notNull(), // espn_api, nfl_api, manual_import, esports_api
  ageRestriction: integer("age_restriction").default(18),
  requiresAgeVerification: boolean("requires_age_verification").default(true),
  maxParticipants: integer("max_participants").default(12),
  entryRequirements: jsonb("entry_requirements"), // Age verification, location restrictions
  scoringConfig: jsonb("scoring_config").notNull(),
  prizeStructure: jsonb("prize_structure"), // Optional - we don't manage money
  leagueSettings: jsonb("league_settings").notNull(),
  status: varchar("status").default("open"), // open, closed, active, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fantasy participants - verified adults only
export const fantasyParticipants = pgTable("fantasy_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  userId: varchar("user_id").notNull(),
  teamName: varchar("team_name").notNull(),
  ageVerified: boolean("age_verified").default(false),
  ageVerificationDate: timestamp("age_verification_date"),
  entryDate: timestamp("entry_date").defaultNow(),
  currentScore: decimal("current_score").default("0"),
  eliminated: boolean("eliminated").default(false),
  eliminationWeek: integer("elimination_week"),
  participantStatus: varchar("participant_status").default("active"), // active, eliminated, withdrawn
});

// Professional player database - external API integration
export const professionalPlayers = pgTable("professional_players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  externalPlayerId: varchar("external_player_id").notNull(), // ESPN ID, NFL ID, etc.
  dataSource: varchar("data_source").notNull(), // espn, nfl_api, nba_api, etc.
  playerName: varchar("player_name").notNull(),
  teamName: varchar("team_name").notNull(),
  teamAbbreviation: varchar("team_abbreviation"),
  position: varchar("position").notNull(),
  sport: varchar("sport").notNull(), // nfl, nba, mlb, nhl, esports
  jerseyNumber: integer("jersey_number"),
  salary: integer("salary"), // For salary cap formats
  currentSeasonStats: jsonb("current_season_stats"),
  injuryStatus: varchar("injury_status").default("healthy"),
  byeWeek: integer("bye_week"), // For NFL
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Fantasy picks - survivor & draft systems
export const fantasyPicks = pgTable("fantasy_picks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  participantId: varchar("participant_id").references(() => fantasyParticipants.id),
  weekNumber: integer("week_number"), // For survivor leagues
  pickType: varchar("pick_type").notNull(), // survivor_pick, draft_pick, lineup_set
  selectedPlayerId: varchar("selected_player_id").references(() => professionalPlayers.id),
  selectedTeam: varchar("selected_team"), // For team-based picks
  pickTimestamp: timestamp("pick_timestamp").defaultNow(),
  pointsEarned: decimal("points_earned").default("0"),
  isEliminatedPick: boolean("is_eliminated_pick").default(false), // For survivor
  usedPlayers: jsonb("used_players"), // Track previously used players/teams
});

// Fantasy lineups - DraftKings style daily/weekly
export const fantasyLineups = pgTable("fantasy_lineups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  participantId: varchar("participant_id").references(() => fantasyParticipants.id),
  weekNumber: integer("week_number"),
  lineupConfig: jsonb("lineup_config").notNull(), // Position requirements
  totalSalary: integer("total_salary"), // Salary cap total
  projectedPoints: decimal("projected_points"),
  actualPoints: decimal("actual_points").default("0"),
  lineupStatus: varchar("lineup_status").default("set"), // set, locked, scored
  submissionTimestamp: timestamp("submission_timestamp").defaultNow(),
});

// Player performance - real-time scoring integration
export const playerPerformances = pgTable("player_performances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => professionalPlayers.id),
  weekNumber: integer("week_number"),
  season: varchar("season"),
  gameDate: timestamp("game_date"),
  opponent: varchar("opponent"),
  stats: jsonb("stats").notNull(), // Sport-specific stats
  fantasyPoints: decimal("fantasy_points").notNull(),
  dataSource: varchar("data_source"), // Which API provided the data
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Age verification records
export const ageVerifications = pgTable("age_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  verificationMethod: varchar("verification_method").notNull(), // id_upload, credit_card, third_party
  dateOfBirth: date("date_of_birth").notNull(),
  verifiedAge: integer("verified_age").notNull(),
  verificationDate: timestamp("verification_date").defaultNow(),
  verificationStatus: varchar("verification_status").default("verified"), // verified, pending, rejected
  verifyingDocumentHash: varchar("verifying_document_hash"), // Hashed for privacy
  expiresAt: timestamp("expires_at"),
});

// Fantasy league eligibility checks
export const fantasyEligibilityChecks = pgTable("fantasy_eligibility_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  userId: varchar("user_id").notNull(),
  ageCheckPassed: boolean("age_check_passed").default(false),
  locationCheckPassed: boolean("location_check_passed").default(true), // For legal compliance
  eligibilityDate: timestamp("eligibility_date").defaultNow(),
  checkDetails: jsonb("check_details"),
});

// Safety restrictions by sport/league type
export const fantasySafetyRules = pgTable("fantasy_safety_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportType: varchar("sport_type").notNull(),
  leagueFormat: varchar("league_format").notNull(),
  minAgeRequirement: integer("min_age_requirement").default(18),
  restrictedRegions: jsonb("restricted_regions"), // Legal compliance
  maxEntryAmount: decimal("max_entry_amount"), // If handling entry fees
  requiresIdentityVerification: boolean("requires_identity_verification").default(true),
  additionalRestrictions: jsonb("additional_restrictions"),
  createdAt: timestamp("created_at").defaultNow(),
});

// API data source configuration
export const apiConfigurations = pgTable("api_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiName: varchar("api_name").notNull(), // espn, nfl, nba, riot, etc.
  sportType: varchar("sport_type").notNull(),
  apiEndpoint: varchar("api_endpoint").notNull(),
  apiKeyHash: varchar("api_key_hash"), // Encrypted storage
  rateLimitPerHour: integer("rate_limit_per_hour"),
  lastSyncTimestamp: timestamp("last_sync_timestamp"),
  syncFrequencyMinutes: integer("sync_frequency_minutes").default(60),
  isActive: boolean("is_active").default(true),
  dataMapping: jsonb("data_mapping"), // How to map their data to our schema
});

// Automated scoring functions framework
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

// Fantasy system types
export type FantasyLeague = typeof fantasyLeagues.$inferSelect;
export type InsertFantasyLeague = typeof fantasyLeagues.$inferInsert;
export type FantasyParticipant = typeof fantasyParticipants.$inferSelect;
export type InsertFantasyParticipant = typeof fantasyParticipants.$inferInsert;
export type ProfessionalPlayer = typeof professionalPlayers.$inferSelect;
export type InsertProfessionalPlayer = typeof professionalPlayers.$inferInsert;
export type FantasyPick = typeof fantasyPicks.$inferSelect;
export type InsertFantasyPick = typeof fantasyPicks.$inferInsert;
export type FantasyLineup = typeof fantasyLineups.$inferSelect;
export type InsertFantasyLineup = typeof fantasyLineups.$inferInsert;
export type PlayerPerformance = typeof playerPerformances.$inferSelect;
export type InsertPlayerPerformance = typeof playerPerformances.$inferInsert;
export type AgeVerification = typeof ageVerifications.$inferSelect;
export type InsertAgeVerification = typeof ageVerifications.$inferInsert;
export type FantasyEligibilityCheck = typeof fantasyEligibilityChecks.$inferSelect;
export type InsertFantasyEligibilityCheck = typeof fantasyEligibilityChecks.$inferInsert;
export type FantasySafetyRule = typeof fantasySafetyRules.$inferSelect;
export type InsertFantasySafetyRule = typeof fantasySafetyRules.$inferInsert;
export type ApiConfiguration = typeof apiConfigurations.$inferSelect;
export type InsertApiConfiguration = typeof apiConfigurations.$inferInsert;
export type ScoringAutomation = typeof scoringAutomations.$inferSelect;
export type InsertScoringAutomation = typeof scoringAutomations.$inferInsert;

// Fantasy insert schemas
export const insertFantasyLeagueSchema = createInsertSchema(fantasyLeagues).omit({
  id: true,
  createdAt: true,
});

export const insertFantasyParticipantSchema = createInsertSchema(fantasyParticipants).omit({
  id: true,
  entryDate: true,
});

export const insertProfessionalPlayerSchema = createInsertSchema(professionalPlayers).omit({
  id: true,
  lastUpdated: true,
});

export const insertFantasyPickSchema = createInsertSchema(fantasyPicks).omit({
  id: true,
  pickTimestamp: true,
});

export const insertFantasyLineupSchema = createInsertSchema(fantasyLineups).omit({
  id: true,
  submissionTimestamp: true,
});

export const insertPlayerPerformanceSchema = createInsertSchema(playerPerformances).omit({
  id: true,
  lastUpdated: true,
});

export const insertAgeVerificationSchema = createInsertSchema(ageVerifications).omit({
  id: true,
  verificationDate: true,
});

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

export type WhitelabelConfigData = typeof whitelabelConfigs.$inferSelect;
export type InsertWhitelabelConfigData = typeof whitelabelConfigs.$inferInsert;

// Donor types
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = typeof donors.$inferInsert;

// Donation types  
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

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
  schoolId: varchar("school_id").notNull().references(() => tournamentOrganizations.id),
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

// Tournament credits purchases tracking
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

// Usage analytics for fraud detection
export const usageAnalytics = pgTable("usage_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  actionType: text("action_type", {
    enum: ["tournament_created", "login", "credit_purchased", "limit_reached"]
  }).notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  deviceFingerprint: varchar("device_fingerprint"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // Additional context
});

export type TournamentCredit = typeof tournamentCredits.$inferSelect;
export type InsertTournamentCredit = typeof tournamentCredits.$inferInsert;
export type UsageAnalytic = typeof usageAnalytics.$inferSelect;
export type InsertUsageAnalytic = typeof usageAnalytics.$inferInsert;
export type CoachEventAssignment = typeof coachEventAssignments.$inferSelect;
export type InsertCoachEventAssignment = typeof coachEventAssignments.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

// White-label types
export type WhitelabelConfigRecord = typeof whitelabelConfigs.$inferSelect;
export type InsertWhitelabelConfigRecord = z.infer<typeof insertWhitelabelConfigSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type UpdateMatch = z.infer<typeof updateMatchSchema>;

export type SportOption = typeof sportOptions.$inferSelect;
export type InsertSportOption = z.infer<typeof insertSportOptionSchema>;
export type TournamentStructure = typeof tournamentStructures.$inferSelect;
export type InsertTournamentStructure = z.infer<typeof insertTournamentStructureSchema>;
export type TrackEventRecord = typeof trackEvents.$inferSelect;
export type InsertTrackEventRecord = z.infer<typeof insertTrackEventSchema>;

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

// UNIVERSAL REGISTRATION CODE SYSTEM
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

// COACHES LOUNGE LEAGUES SYSTEM
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
