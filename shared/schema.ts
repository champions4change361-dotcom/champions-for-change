import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index, check } from "drizzle-orm/pg-core";
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
  subscriptionStatus: text("subscription_status", { 
    enum: ["active", "inactive", "trialing", "past_due", "canceled", "unpaid", "pending", "pending_approval"] 
  }).default("inactive"),
  subscriptionPlan: text("subscription_plan", { 
    enum: [
      // Legacy plans (preserved for backward compatibility)
      "supporter", "professional", "champion", "enterprise", "district_enterprise",
      // New pricing tier plans
      "fantasy_sports_free", "youth_organization_monthly", "youth_organization_annual", "private_school_annual"
    ]
  }).default("supporter"),
  userRole: text("user_role", {
    enum: [
      // District Level
      "district_athletic_director", 
      "district_athletic_coordinator",
      "district_athletic_trainer",
      "district_aquatic_coordinator",
      // School Level  
      "school_athletic_director",
      "school_athletic_coordinator",
      "school_athletic_trainer", 
      "school_aquatic_coordinator",
      // Coaching Level
      "head_coach",
      "assistant_coach", 
      // Tournament Management
      "tournament_manager",
      "assistant_tournament_manager",
      // General Access
      "scorekeeper", 
      "athlete", 
      "fan"
    ]
  }).default("fan"),
  organizationId: varchar("organization_id"), // School district, club, etc.
  organizationName: varchar("organization_name"), // Name of school/club they represent
  mission: text("mission"), // Their goals and mission statement for branding
  customBranding: jsonb("custom_branding").$type<{
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
    logoUrl?: string;
    theme?: 'light' | 'dark' | 'neutral';
  }>().default({
    primaryColor: '#000000',
    secondaryColor: '#666666', 
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    accentColor: '#3b82f6',
    theme: 'neutral'
  }), // Clean neutral defaults for new organizers
  isWhitelabelClient: boolean("is_whitelabel_client").default(false),
  whitelabelDomain: varchar("whitelabel_domain"),
  whitelabelBranding: jsonb("whitelabel_branding").$type<{
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    logoUrl?: string;
    companyName?: string;
    customDomain?: string;
    theme?: 'light' | 'dark' | 'neutral';
  }>().default({
    primaryColor: '#000000',
    secondaryColor: '#666666',
    backgroundColor: '#ffffff',
    theme: 'neutral'
  }), // Clean neutral defaults for white-label clients
  
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
    avatarStyle: 'professional_coach' | 'friendly_advisor' | 'minimalist_icon' | 'sports_mascot' | 'keystone_coach';
    
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
  
  // HIPAA/FERPA COMPLIANCE FIELDS
  hipaaTrainingCompleted: boolean("hipaa_training_completed").default(false),
  hipaaTrainingDate: timestamp("hipaa_training_date"),
  ferpaAgreementSigned: boolean("ferpa_agreement_signed").default(false),
  ferpaAgreementDate: timestamp("ferpa_agreement_date"),
  complianceRole: text("compliance_role", {
    enum: [
      // District Level
      "district_athletic_director", 
      "district_athletic_coordinator",
      "district_athletic_trainer",
      "district_aquatic_coordinator",
      // School Level  
      "school_athletic_director",
      "school_athletic_coordinator",
      "school_athletic_trainer", 
      "school_aquatic_coordinator",
      // Team Level
      "head_coach",
      "assistant_coach", 
      "athletic_training_student",
      // Tournament Management
      "tournament_manager",
      "assistant_tournament_manager",
      // General Access
      "scorekeeper"
    ]
  }),
  medicalDataAccess: boolean("medical_data_access").default(false),
  lastComplianceAudit: timestamp("last_compliance_audit"),
  
  // STRIPE INTEGRATION (OPTIONAL)
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  stripeConnectAccountId: varchar("stripe_connect_account_id"), // For Stripe Connect platform payments

  // PRICING TIER SUPPORT FIELDS
  pricingTier: text("pricing_tier", {
    enum: ["fantasy_sports_free", "youth_organization_monthly", "youth_organization_annual", "private_school_annual", "legacy"]
  }),
  annualDiscountApplied: boolean("annual_discount_applied").default(false),
  annualDiscountPercentage: decimal("annual_discount_percentage", { precision: 5, scale: 2 }).default("0"), // Store discount percentage (e.g., 20.00 for 20%)
  annualDiscountAmount: decimal("annual_discount_amount", { precision: 10, scale: 2 }).default("0"), // Store discount amount in dollars
  originalAnnualPrice: decimal("original_annual_price", { precision: 10, scale: 2 }).default("0"), // Store original price before discount
  effectiveAnnualPrice: decimal("effective_annual_price", { precision: 10, scale: 2 }).default("0"), // Store final price after discount

  // BUSINESS REGISTRATION FIELDS
  phone: varchar("phone"),
  organizationType: text("organization_type", {
    enum: [
      // Legacy organization types (preserved for backward compatibility)
      "business", "nonprofit", "sports_club", "individual", "district", "school", "club",
      // New pricing tier organization types
      "fantasy_sports", "youth_organization", "private_school", "public_school"
    ]
  }),
  description: text("description"),
  sportsInvolved: jsonb("sports_involved").$type<string[]>(),
  requestType: varchar("request_type"),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "check", "paypal", "bank_transfer"]
  }),
  pendingCheckAmount: varchar("pending_check_amount"),
  accountStatus: text("account_status", {
    enum: ["active", "pending_check_payment", "suspended", "under_review", "email_unverified"]
  }).default("email_unverified"),
  
  // PASSWORD AUTHENTICATION
  passwordHash: varchar("password_hash"), // bcrypt hash for email/password login
  authProvider: text("auth_provider", {
    enum: ["google", "email", "replit"]
  }).default("email"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Profile - Linked to main user accounts for 21+ fantasy sports access
export const fantasyProfiles = pgTable("fantasy_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tosAcceptedAt: timestamp("tos_accepted_at"),
  ageVerifiedAt: timestamp("age_verified_at"),
  ageVerificationExpiresAt: timestamp("age_verification_expires_at"),
  status: text("status", { 
    enum: ["active", "restricted"] 
  }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// COMPREHENSIVE FANTASY LEAGUE SYSTEM
// =============================================================================

// Fantasy Leagues - Season-long fantasy leagues
export const fantasyLeagues = pgTable("fantasy_leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  commissionerId: varchar("commissioner_id").notNull().references(() => users.id),
  
  // League Basic Info
  leagueName: varchar("league_name").notNull(),
  leagueDescription: text("league_description"),
  sport: text("sport", {
    enum: ["nfl", "nba", "mlb", "nhl"]
  }).notNull().default("nfl"),
  season: varchar("season").notNull(), // "2024-2025"
  
  // League Configuration
  teamCount: integer("team_count").notNull().default(10),
  maxTeams: integer("max_teams").notNull().default(12),
  draftType: text("draft_type", {
    enum: ["snake", "linear", "auction"]
  }).default("snake"),
  
  // League Settings
  scoringType: text("scoring_type", {
    enum: ["standard", "ppr", "half_ppr", "superflex", "custom"]
  }).default("ppr"),
  playoffTeams: integer("playoff_teams").default(4),
  playoffWeeks: integer("playoff_weeks").default(3),
  regularSeasonWeeks: integer("regular_season_weeks").default(14),
  
  // Roster Settings
  rosterSettings: jsonb("roster_settings").$type<{
    qb: number;
    rb: number;
    wr: number;
    te: number;
    flex: number;
    def: number;
    k: number;
    bench: number;
    ir: number;
  }>().default({
    qb: 1, rb: 2, wr: 2, te: 1, flex: 1, def: 1, k: 1, bench: 6, ir: 1
  }),
  
  // League Status
  status: text("status", {
    enum: ["creating", "open", "drafting", "active", "playoffs", "completed", "archived"]
  }).default("creating"),
  
  // League Privacy
  isPrivate: boolean("is_private").default(false),
  inviteCode: varchar("invite_code"),
  password: varchar("password"),
  
  // League Dates
  draftDate: timestamp("draft_date"),
  seasonStart: date("season_start"),
  seasonEnd: date("season_end"),
  tradeDeadline: date("trade_deadline"),
  
  // League Rules
  waiverPeriod: integer("waiver_period").default(2), // days
  tradeDeadlineWeek: integer("trade_deadline_week").default(10),
  maxKeepers: integer("max_keepers").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Teams - Teams within fantasy leagues
export const fantasyTeams = pgTable("fantasy_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull().references(() => fantasyLeagues.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  
  // Team Info
  teamName: varchar("team_name").notNull(),
  teamAbbreviation: varchar("team_abbreviation", { length: 4 }),
  teamLogo: varchar("team_logo"),
  
  // Team Performance
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  ties: integer("ties").default(0),
  pointsFor: decimal("points_for", { precision: 8, scale: 2 }).default("0"),
  pointsAgainst: decimal("points_against", { precision: 8, scale: 2 }).default("0"),
  
  // Playoff Status
  playoffSeed: integer("playoff_seed"),
  isInPlayoffs: boolean("is_in_playoffs").default(false),
  
  // Draft Results
  draftPosition: integer("draft_position"),
  draftGrade: varchar("draft_grade"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Team Rosters - Player ownership tracking
export const fantasyRosters = pgTable("fantasy_rosters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => fantasyTeams.id),
  playerId: varchar("player_id").notNull().references(() => professionalPlayers.id),
  
  // Roster Status
  rosterPosition: text("roster_position", {
    enum: ["starter", "bench", "ir", "taxi"]
  }).default("bench"),
  lineupPosition: text("lineup_position", {
    enum: ["QB", "RB", "WR", "TE", "FLEX", "DEF", "K", "BENCH", "IR"]
  }),
  
  // Acquisition Info
  acquisitionType: text("acquisition_type", {
    enum: ["draft", "trade", "waiver", "free_agent", "keeper"]
  }).notNull(),
  acquisitionWeek: integer("acquisition_week"),
  acquisitionCost: integer("acquisition_cost"), // FAAB or waiver priority
  
  // Performance Tracking
  weeklyPoints: jsonb("weekly_points").$type<Array<{
    week: number;
    points: number;
    started: boolean;
  }>>().default([]),
  totalPoints: decimal("total_points", { precision: 8, scale: 2 }).default("0"),
  
  // Contract Info (for keeper/dynasty leagues)
  contractLength: integer("contract_length"),
  keeperCost: integer("keeper_cost"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Drafts - Draft management and tracking
export const fantasyDrafts = pgTable("fantasy_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull().references(() => fantasyLeagues.id),
  
  // Draft Info
  draftType: text("draft_type", {
    enum: ["snake", "linear", "auction"]
  }).notNull(),
  status: text("status", {
    enum: ["scheduled", "active", "paused", "completed"]
  }).default("scheduled"),
  
  // Draft Settings
  rounds: integer("rounds").default(16),
  timePerPick: integer("time_per_pick").default(90), // seconds
  currentRound: integer("current_round").default(1),
  currentPick: integer("current_pick").default(1),
  
  // Current Turn
  currentTeamId: varchar("current_team_id").references(() => fantasyTeams.id),
  pickDeadline: timestamp("pick_deadline"),
  
  // Draft Order
  draftOrder: jsonb("draft_order").$type<Array<{
    position: number;
    teamId: string;
    teamName: string;
  }>>(),
  
  // Auction Settings (if auction draft)
  startingBudget: integer("starting_budget").default(200),
  minimumBid: integer("minimum_bid").default(1),
  
  // Draft Results
  picks: jsonb("picks").$type<Array<{
    round: number;
    pick: number;
    teamId: string;
    playerId: string;
    playerName: string;
    position: string;
    cost?: number; // for auction
    pickTime: string;
  }>>().default([]),
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Matchups - Weekly head-to-head games
export const fantasyMatchups = pgTable("fantasy_matchups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull().references(() => fantasyLeagues.id),
  
  // Matchup Info
  week: integer("week").notNull(),
  season: varchar("season").notNull(),
  matchupType: text("matchup_type", {
    enum: ["regular_season", "playoff", "championship", "consolation"]
  }).default("regular_season"),
  
  // Teams
  team1Id: varchar("team1_id").notNull().references(() => fantasyTeams.id),
  team2Id: varchar("team2_id").references(() => fantasyTeams.id), // null for bye week
  
  // Scores
  team1Score: decimal("team1_score", { precision: 8, scale: 2 }).default("0"),
  team2Score: decimal("team2_score", { precision: 8, scale: 2 }).default("0"),
  
  // Lineups
  team1Lineup: jsonb("team1_lineup").$type<Array<{
    playerId: string;
    playerName: string;
    position: string;
    points: number;
    started: boolean;
  }>>(),
  team2Lineup: jsonb("team2_lineup").$type<Array<{
    playerId: string;
    playerName: string;
    position: string;
    points: number;
    started: boolean;
  }>>(),
  
  // Matchup Status
  status: text("status", {
    enum: ["scheduled", "in_progress", "completed"]
  }).default("scheduled"),
  winnerId: varchar("winner_id").references(() => fantasyTeams.id),
  
  // Matchup Dates
  gameDate: date("game_date"),
  lineupLockTime: timestamp("lineup_lock_time"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Waiver Claims - Waiver wire system
export const fantasyWaiverClaims = pgTable("fantasy_waiver_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull().references(() => fantasyLeagues.id),
  teamId: varchar("team_id").notNull().references(() => fantasyTeams.id),
  
  // Claim Details
  claimType: text("claim_type", {
    enum: ["add", "drop", "add_drop"]
  }).notNull(),
  addPlayerId: varchar("add_player_id").references(() => professionalPlayers.id),
  dropPlayerId: varchar("drop_player_id").references(() => professionalPlayers.id),
  
  // Waiver Info
  priority: integer("priority").notNull(),
  faabBid: integer("faab_bid"), // Free Agent Auction Budget
  processWeek: integer("process_week").notNull(),
  
  // Claim Status
  status: text("status", {
    enum: ["pending", "successful", "failed", "cancelled"]
  }).default("pending"),
  failureReason: text("failure_reason"),
  
  // Processing
  processedAt: timestamp("processed_at"),
  processOrder: integer("process_order"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy Trades - Player trading system
export const fantasyTrades = pgTable("fantasy_trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull().references(() => fantasyLeagues.id),
  
  // Trade Participants
  proposingTeamId: varchar("proposing_team_id").notNull().references(() => fantasyTeams.id),
  receivingTeamId: varchar("receiving_team_id").notNull().references(() => fantasyTeams.id),
  
  // Trade Details
  proposingAssets: jsonb("proposing_assets").$type<{
    players: Array<{
      playerId: string;
      playerName: string;
      position: string;
    }>;
    faabAmount?: number;
    draftPicks?: Array<{
      round: number;
      year: string;
    }>;
  }>(),
  receivingAssets: jsonb("receiving_assets").$type<{
    players: Array<{
      playerId: string;
      playerName: string;
      position: string;
    }>;
    faabAmount?: number;
    draftPicks?: Array<{
      round: number;
      year: string;
    }>;
  }>(),
  
  // Trade Status
  status: text("status", {
    enum: ["pending", "accepted", "rejected", "cancelled", "vetoed", "completed"]
  }).default("pending"),
  
  // Trade Processing
  proposedAt: timestamp("proposed_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  processedAt: timestamp("processed_at"),
  vetoDeadline: timestamp("veto_deadline"),
  
  // League Review
  requiresLeagueApproval: boolean("requires_league_approval").default(false),
  vetoVotes: jsonb("veto_votes").$type<Array<{
    teamId: string;
    vote: 'veto' | 'approve';
    timestamp: string;
  }>>().default([]),
  
  // Trade Notes
  proposingTeamNotes: text("proposing_team_notes"),
  rejectionReason: text("rejection_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fantasy League Messages - League communication system
export const fantasyLeagueMessages = pgTable("fantasy_league_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").notNull().references(() => fantasyLeagues.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  
  // Message Content
  messageType: text("message_type", {
    enum: ["general", "trade_talk", "trash_talk", "announcement", "system"]
  }).default("general"),
  subject: varchar("subject"),
  content: text("content").notNull(),
  
  // Message Targeting
  isPublic: boolean("is_public").default(true),
  recipientId: varchar("recipient_id").references(() => users.id), // for private messages
  
  // Message Status
  edited: boolean("edited").default(false),
  editedAt: timestamp("edited_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced HIPAA/FERPA Compliance Audit Trail with tamper-evidence
export const complianceAuditLog = pgTable("compliance_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  actionType: text("action_type", {
    enum: ["data_access", "data_modification", "export", "view", "login", "permission_change", "failed_access", "security_violation"]
  }).notNull(),
  resourceType: text("resource_type", {
    enum: ["student_data", "health_data", "tournament_data", "administrative_data", "phi_data", "ferpa_data"]
  }).notNull(),
  resourceId: varchar("resource_id"), // ID of the specific record accessed
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  
  // Enhanced audit fields for compliance
  sessionId: varchar("session_id"), // Session tracking
  requestMethod: varchar("request_method"), // HTTP method
  requestPath: varchar("request_path"), // API endpoint accessed
  responseStatus: integer("response_status"), // HTTP response code
  dataFieldsAccessed: jsonb("data_fields_accessed").$type<string[]>(), // Specific PHI fields accessed
  hipaaMinimumNecessary: boolean("hipaa_minimum_necessary").default(true), // Was access minimum necessary?
  complianceRole: varchar("compliance_role"), // User's compliance role at time of access
  organizationContext: varchar("organization_context"), // Organization scope of access
  
  // Tamper-evidence and integrity
  integrityHash: varchar("integrity_hash"), // Cryptographic hash for tamper detection
  previousLogHash: varchar("previous_log_hash"), // Chain of integrity hashes
  auditChainValid: boolean("audit_chain_valid").default(true), // Integrity verification status
  
  complianceNotes: text("compliance_notes"), // Additional context for audit
  riskLevel: text("risk_level", {
    enum: ["low", "medium", "high", "critical"]
  }).default("low"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Privacy (FERPA) Protected Data
export const studentData = pgTable("student_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(), // District student ID
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  grade: integer("grade"),
  schoolId: varchar("school_id").notNull(),
  districtId: varchar("district_id").notNull(),
  emergencyContact: jsonb("emergency_contact").$type<{
    name: string;
    phone: string;
    relationship: string;
  }>(),
  parentalConsent: boolean("parental_consent").default(false),
  ferpaReleaseForm: varchar("ferpa_release_form"), // File path/URL to signed form
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Health Data (HIPAA) Protected Information - Enhanced with encryption markers
export const healthData = pgTable("health_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => studentData.id),
  athleticTrainerId: varchar("athletic_trainer_id").notNull().references(() => users.id),
  
  // PHI Fields - AES-256 encrypted at rest
  medicalConditions: text("medical_conditions"), // ENCRYPTED PHI
  medicalConditionsEncrypted: boolean("medical_conditions_encrypted").default(true),
  medications: text("medications"), // ENCRYPTED PHI
  medicationsEncrypted: boolean("medications_encrypted").default(true),
  allergies: text("allergies"), // ENCRYPTED PHI
  allergiesEncrypted: boolean("allergies_encrypted").default(true),
  injuryHistory: jsonb("injury_history"), // ENCRYPTED PHI
  injuryHistoryEncrypted: boolean("injury_history_encrypted").default(true),
  concussionBaseline: jsonb("concussion_baseline"), // ENCRYPTED PHI
  concussionBaselineEncrypted: boolean("concussion_baseline_encrypted").default(true),
  
  // Non-PHI Fields
  physicalsOnFile: boolean("physicals_on_file").default(false),
  physicalExpirationDate: date("physical_expiration_date"),
  lastMedicalUpdate: timestamp("last_medical_update"),
  hipaaAuthorizationForm: varchar("hipaa_authorization_form"), // File path to signed form
  
  // Compliance tracking
  lastAccessedBy: varchar("last_accessed_by").references(() => users.id),
  lastAccessedAt: timestamp("last_accessed_at"),
  accessCount: integer("access_count").default(0),
  dataClassification: text("data_classification", {
    enum: ["phi", "confidential", "internal", "public"]
  }).default("phi"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Processing Agreements for Districts
export const dataProcessingAgreements = pgTable("data_processing_agreements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  agreementType: text("agreement_type", {
    enum: ["ferpa_dpa", "hipaa_baa", "state_privacy_agreement"]
  }).notNull(),
  signedDate: timestamp("signed_date"),
  expirationDate: timestamp("expiration_date"),
  agreementDocument: varchar("agreement_document"), // File path to signed agreement
  signatoryName: varchar("signatory_name"),
  signatoryTitle: varchar("signatory_title"),
  isActive: boolean("is_active").default(true),
  complianceNotes: text("compliance_notes"),
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

// District Information with VLC-based organization
export const districts = pgTable("districts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "Corpus Christi Independent School District"
  abbreviation: varchar("abbreviation").notNull(), // "CCISD"
  districtCode: varchar("district_code").notNull().unique(), // Official district identifier
  state: varchar("state").notNull().default("TX"),
  city: varchar("city").notNull(),
  zipCode: varchar("zip_code"),
  superintendentName: varchar("superintendent_name"),
  athleticDirectorId: varchar("athletic_director_id").references(() => users.id),
  headAthleticTrainerId: varchar("head_athletic_trainer_id").references(() => users.id),
  website: varchar("website"),
  phone: varchar("phone"),
  logoUrl: varchar("logo_url"),
  brandColors: jsonb("brand_colors").$type<{
    primary: string;
    secondary: string;
    accent?: string;
  }>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schools within Districts with VLC (Venue Location Code) system
export const schools = pgTable("schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").notNull().references(() => districts.id),
  feedsIntoSchoolId: varchar("feeds_into_school_id"), // NULL for high schools, points to parent HS for feeder schools (VLC hierarchy)
  name: varchar("name").notNull(), // "Roy Miller High School"
  abbreviation: varchar("abbreviation").notNull(), // "RMHS"
  schoolType: text("school_type", {
    enum: ["elementary", "middle", "high", "alternative", "specialty"]
  }).notNull(),
  vlcCode: varchar("vlc_code").notNull().unique(), // Venue Location Code for athletics
  ncessId: varchar("ncess_id"), // National Center for Education Statistics ID
  districtSchoolCode: varchar("district_school_code"), // Internal district code for administrative systems (e.g., "0472" for School Business Plus)
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  state: varchar("state").notNull().default("TX"),
  zipCode: varchar("zip_code").notNull(),
  phone: varchar("phone"),
  website: varchar("website"),
  
  // School leadership
  principalName: varchar("principal_name"),
  principalId: varchar("principal_id").references(() => users.id),
  athleticDirectorId: varchar("athletic_director_id").references(() => users.id),
  athleticTrainerId: varchar("athletic_trainer_id").references(() => users.id),
  
  // School branding and assets
  logoUrl: varchar("logo_url"),
  bannerImageUrl: varchar("banner_image_url"), // For school-specific pages like Roy Miller
  mascotName: varchar("mascot_name"), // "Buccaneers"
  schoolColors: jsonb("school_colors").$type<{
    primary: string;
    secondary: string;
    accent?: string;
  }>(),
  
  // Athletic facilities
  gymCapacity: integer("gym_capacity"),
  footballStadium: varchar("football_stadium"),
  trackFacility: varchar("track_facility"),
  hasPool: boolean("has_pool").default(false),
  
  // Enrollment and demographics
  totalEnrollment: integer("total_enrollment"),
  athleticParticipation: integer("athletic_participation"),
  grades: jsonb("grades").$type<string[]>(), // ["9", "10", "11", "12"]
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School AD Invitations - Track invitation status for school registration
export const schoolInvites = pgTable("school_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").notNull().references(() => districts.id),
  schoolName: varchar("school_name").notNull(),
  schoolType: text("school_type", {
    enum: ["elementary", "middle", "high", "alternative", "specialty"]
  }).notNull(),
  districtSchoolCode: varchar("district_school_code"), // Internal district code
  feedsIntoSchoolId: varchar("feeds_into_school_id").references(() => schools.id), // Parent school for feeders
  
  // Invitee information
  inviteeEmail: varchar("invitee_email").notNull(),
  inviteeName: varchar("invitee_name"),
  invitedRole: text("invited_role", {
    enum: ["school_athletic_director", "school_athletic_coordinator", "school_athletic_trainer"]
  }).default("school_athletic_director"),
  
  // Invitation metadata
  invitedById: varchar("invited_by_id").notNull().references(() => users.id),
  inviteToken: varchar("invite_token").notNull().unique(), // Secure token for registration link
  inviteStatus: text("invite_status", {
    enum: ["pending", "accepted", "expired", "revoked"]
  }).default("pending"),
  
  // Registration tracking
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at").notNull(), // Invite expiration (e.g., 7 days)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Athletic Venues and Facilities with VLC tracking
export const athleticVenues = pgTable("athletic_venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  venueName: varchar("venue_name").notNull(), // "Roy Miller Stadium"
  venueType: text("venue_type", {
    enum: ["gymnasium", "football_stadium", "baseball_field", "softball_field", "track", "tennis_courts", "soccer_field", "pool", "wrestling_room", "other"]
  }).notNull(),
  vlcCode: varchar("vlc_code").notNull().unique(), // Specific VLC for this venue
  capacity: integer("capacity"),
  address: varchar("address"),
  isHomeVenue: boolean("is_home_venue").default(true),
  surfaceType: varchar("surface_type"), // "grass", "turf", "hardwood", "track"
  hasLights: boolean("has_lights").default(false),
  hasScoreboard: boolean("has_scoreboard").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School Assets (Images, Documents, Media) organized by VLC
export const schoolAssets = pgTable("school_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  assetType: text("asset_type", {
    enum: ["logo", "banner", "facility_photo", "team_photo", "document", "media", "other"]
  }).notNull(),
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(), // Object storage path
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  uploadedById: varchar("uploaded_by_id").notNull().references(() => users.id),
  description: text("description"),
  tags: jsonb("tags").$type<string[]>(), // ["athletics", "facilities", "2024"]
  isPublic: boolean("is_public").default(true),
  displayOrder: integer("display_order").default(0),
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

// Tax Exemption Documents for Nonprofit Organizations
export const taxExemptionDocuments = pgTable("tax_exemption_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  uploaderUserId: varchar("uploader_user_id").notNull().references(() => users.id),
  documentType: text("document_type", {
    enum: ["501c3_determination_letter", "state_tax_exemption", "sales_tax_exemption", "other"]
  }).notNull(),
  documentName: varchar("document_name").notNull(),
  documentPath: varchar("document_path").notNull(), // File storage path
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  expirationDate: date("expiration_date"), // Some exemptions expire
  verificationStatus: text("verification_status", {
    enum: ["pending", "verified", "rejected", "expired"]
  }).default("pending"),
  verificationNotes: text("verification_notes"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  issuingState: varchar("issuing_state"), // For state-specific exemptions
  federalEIN: varchar("federal_ein"), // Federal Employer ID Number
  taxExemptNumber: varchar("tax_exempt_number"), // State tax exempt number
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flat Rate Billing System for Nonprofits (No Tax Collection)
export const nonprofitSubscriptions = pgTable("nonprofit_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  billingContactUserId: varchar("billing_contact_user_id").notNull().references(() => users.id),
  subscriptionTier: text("subscription_tier", {
    enum: ["starter", "champion", "enterprise", "district_enterprise"]
  }).notNull(),
  flatRateAmount: numeric("flat_rate_amount", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle", {
    enum: ["monthly", "quarterly", "annual"]
  }).default("annual"),
  subscriptionStatus: text("subscription_status", {
    enum: ["active", "inactive", "suspended", "canceled", "past_due"]
  }).default("active"),
  taxExemptStatus: text("tax_exempt_status", {
    enum: ["exempt", "pending_verification", "not_exempt"]
  }).default("pending_verification"),
  exemptionDocumentId: varchar("exemption_document_id").references(() => taxExemptionDocuments.id),
  
  // Billing details
  nextBillingDate: timestamp("next_billing_date"),
  lastBillingDate: timestamp("last_billing_date"),
  billingAddress: jsonb("billing_address").$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  
  // Payment method (simplified for nonprofits)
  paymentMethod: text("payment_method", {
    enum: ["check", "ach", "wire", "stripe"]
  }).default("check"),
  paymentInstructions: text("payment_instructions"), // Where to send checks, etc.
  
  // Compliance tracking
  nonprofitVerificationRequired: boolean("nonprofit_verification_required").default(true),
  complianceNotes: text("compliance_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing Invoices for Nonprofit Flat Rate System
export const nonprofitInvoices = pgTable("nonprofit_invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subscriptionId: varchar("subscription_id").notNull().references(() => nonprofitSubscriptions.id),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  invoiceDate: timestamp("invoice_date").defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  billingPeriodStart: date("billing_period_start").notNull(),
  billingPeriodEnd: date("billing_period_end").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0.00"), // Always $0 for tax-exempt
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status", {
    enum: ["pending", "paid", "overdue", "canceled"]
  }).default("pending"),
  paymentDate: timestamp("payment_date"),
  paymentMethod: text("payment_method", {
    enum: ["check", "ach", "wire", "stripe"]
  }),
  paymentReference: varchar("payment_reference"), // Check number, transaction ID, etc.
  notes: text("notes"),
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
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type School = typeof schools.$inferSelect;

export const insertSchoolInviteSchema = createInsertSchema(schoolInvites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSchoolInvite = z.infer<typeof insertSchoolInviteSchema>;
export type SchoolInvite = typeof schoolInvites.$inferSelect;

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

// Tournament notification subscriptions
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

// Tournament Coordination Intelligence System
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

// Tournament Organizer Network for collaboration
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

// Regional Tournament Circuits for strategic coordination
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

// Internal messaging system for tournaments and teams
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  messageType: text("message_type", {
    enum: ["tournament_update", "team_notification", "payment_reminder", "document_deadline", "game_schedule", "broadcast", "direct_message", "fantasy_smack_talk", "business_announcement", "league_update"]
  }).notNull(),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  priority: text("priority", {
    enum: ["low", "normal", "high", "urgent"]
  }).default("normal"),
  
  // Target audience
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  teamId: varchar("team_id").references(() => teams.id),
  fantasyLeagueId: varchar("fantasy_league_id"), // For fantasy sports messaging
  businessOrgId: varchar("business_org_id"), // For business organization messaging
  targetRoles: jsonb("target_roles").$type<string[]>().default([]), // ["coach", "parent", "player", "fantasy_member", "business_employee"]
  
  // Cross-domain messaging support
  domainType: text("domain_type", {
    enum: ["tournament", "fantasy", "business"]
  }).default("tournament"),
  isDirectorBlast: boolean("is_director_blast").default(false), // Director-only broadcast messages
  
  // Delivery tracking
  totalRecipients: integer("total_recipients").default(0),
  deliveredCount: integer("delivered_count").default(0),
  readCount: integer("read_count").default(0),
  
  // Push notification data
  pushNotificationSent: boolean("push_notification_sent").default(false),
  pushNotificationData: jsonb("push_notification_data").$type<{
    title: string;
    body: string;
    icon?: string;
    badge?: number;
    sound?: string;
    clickAction?: string;
  }>(),
  
  // Scheduling
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Message recipients tracking for mobile app notifications
export const messageRecipients = pgTable("message_recipients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull().references(() => messages.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  userRole: text("user_role", {
    enum: ["tournament_manager", "coach", "parent", "player", "scorekeeper"]
  }).notNull(),
  
  // Delivery status
  deliveryStatus: text("delivery_status", {
    enum: ["pending", "delivered", "read", "failed"]
  }).default("pending"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  
  // Mobile app tracking
  pushTokens: jsonb("push_tokens").$type<string[]>().default([]), // FCM tokens
  pushDeliveryStatus: text("push_delivery_status", {
    enum: ["not_sent", "sent", "delivered", "failed"]
  }).default("not_sent"),
  pushDeliveredAt: timestamp("push_delivered_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Mobile app device registration for push notifications
export const mobileDevices = pgTable("mobile_devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceId: varchar("device_id").notNull(), // Unique device identifier
  platform: text("platform", {
    enum: ["ios", "android", "web"]
  }).notNull(),
  fcmToken: varchar("fcm_token"), // Firebase Cloud Messaging token
  apnsToken: varchar("apns_token"), // Apple Push Notification token
  
  // App info
  appVersion: varchar("app_version"),
  osVersion: varchar("os_version"),
  deviceModel: varchar("device_model"),
  
  // Notification preferences
  notificationSettings: jsonb("notification_settings").$type<{
    tournamentUpdates: boolean;
    teamNotifications: boolean;
    paymentReminders: boolean;
    gameSchedules: boolean;
    generalAnnouncements: boolean;
    quietHours?: {
      enabled: boolean;
      startTime: string; // "22:00"
      endTime: string; // "08:00"
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
});

// Message usage tracking for tier limits
export const messageUsage = pgTable("message_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  month: varchar("month").notNull(), // "2025-01"
  messagesUsed: integer("messages_used").default(0),
  messageLimit: integer("message_limit").default(50), // Based on subscription tier
  
  // Breakdown by message type
  tournamentUpdates: integer("tournament_updates").default(0),
  teamNotifications: integer("team_notifications").default(0),
  paymentReminders: integer("payment_reminders").default(0),
  broadcasts: integer("broadcasts").default(0),
  directMessages: integer("direct_messages").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live scoring system with strict access control
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

// Scorekeeper assignments - WHO can update which events
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

// Live score updates log for audit trail
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

// Instant messaging triggered by score events
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
    enum: [
      // District Level
      "district_athletic_director", 
      "district_head_athletic_trainer",
      // School Level  
      "school_athletic_director",
      "school_athletic_trainer", 
      "school_principal",
      // Team Level
      "head_coach",
      "assistant_coach", 
      "athletic_training_student",
      // General Access
      "scorekeeper", 
      "athlete", 
      "fan"
    ]
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

// DISCOUNT CODES - Tournament-specific discount codes  
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  code: varchar("code").notNull().unique(), // "EARLY2024", "TEAM15", etc.
  description: varchar("description"), // Optional description for organizers
  discountType: text("discount_type", {
    enum: ["percentage", "fixed_amount"]
  }).notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(), // 15 (for 15%) or 25.00 (for $25 off)
  maxUses: integer("max_uses"), // null = unlimited uses
  currentUses: integer("current_uses").default(0),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"), // null = no expiration
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(), // Tournament organizer user ID
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Plans for Registration Forms (Jersey Watch-style installment payments)
export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull(),
  planName: varchar("plan_name").notNull(), // "Monthly Payment Plan", "Quarterly Plan"
  planType: text("plan_type", {
    enum: ["monthly", "quarterly", "custom"]
  }).notNull(),
  minimumAmount: numeric("minimum_amount", { precision: 10, scale: 2 }).notNull(), // Minimum registration fee to qualify
  installmentCount: integer("installment_count").notNull(), // Number of payments
  firstPaymentPercentage: numeric("first_payment_percentage", { precision: 5, scale: 2 }).default("50.00"), // % due upfront
  processingFeePercentage: numeric("processing_fee_percentage", { precision: 5, scale: 2 }).default("2.50"), // Fee for payment plan
  cutoffDaysBeforeTournament: integer("cutoff_days_before_tournament").default(14), // Stop payment plans X days before tournament
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Plan Enrollments - Track who enrolled in payment plans
export const paymentPlanEnrollments = pgTable("payment_plan_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationId: varchar("registration_id").notNull(), // Reference to tournament registration
  paymentPlanId: varchar("payment_plan_id").notNull().references(() => paymentPlans.id),
  participantEmail: varchar("participant_email").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  processingFee: numeric("processing_fee", { precision: 10, scale: 2 }).notNull(),
  firstPaymentAmount: numeric("first_payment_amount", { precision: 10, scale: 2 }).notNull(),
  remainingPaymentAmount: numeric("remaining_payment_amount", { precision: 10, scale: 2 }).notNull(),
  enrollmentStatus: text("enrollment_status", {
    enum: ["active", "completed", "defaulted", "canceled"]
  }).default("active"),
  stripeCustomerId: varchar("stripe_customer_id"), // For processing payments
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Plan Installments - Individual payment schedule
export const paymentPlanInstallments = pgTable("payment_plan_installments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enrollmentId: varchar("enrollment_id").notNull().references(() => paymentPlanEnrollments.id),
  installmentNumber: integer("installment_number").notNull(), // 1, 2, 3, etc.
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

// Event Assignments - Who is recording results for which events 
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

// Event Schools - Schools participating in specific events (dynamic roster)
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

// Event Participants - Individual athletes in events (live roster management)
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

// Event Results - Individual attempt/performance tracking
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

// Company Management
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

// Corporate Competition Types - Sales, Production, Corporate Events
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

// Corporate Participants
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

// Performance Metrics Tracking
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

// Competition Leaderboards - Real-time rankings
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
}, (table) => [
  // Index for filtering sports by category
  index("idx_sport_options_category").on(table.sportCategory),
]);

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
}, (table) => [
  // Index for sport association queries
  index("idx_sport_events_sport_id").on(table.sportId),
  // Composite index for sport + event type queries
  index("idx_events_sport_type").on(table.sportId, table.eventType),
]);

// Tournament Events Schema (selected events for a tournament)
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
  maxAttempt: integer("max_attempt"), // Match actual database column name
  ribbonPlaces: integer("ribbon_places").default(8),
  usesStakes: text("uses_stakes"),
  eventSortOrder: integer("event_sort_order"),
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
}).extend({
  // Make legacy fields optional when using config-driven creation
  ageGroup: z.string().optional(),
  genderDivision: z.string().optional(),
  // Allow tournamentType to be derived from config
  tournamentType: z.string().optional(),
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

// User-organization assignments
export const userOrganizationRoles: any = pgTable("user_organization_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id"),
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

// Tax Exemption Document schemas
export const insertTaxExemptionDocumentSchema = createInsertSchema(taxExemptionDocuments).omit({
  id: true,
  verificationStatus: true,
  verificationNotes: true,
  verifiedBy: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNonprofitSubscriptionSchema = createInsertSchema(nonprofitSubscriptions).omit({
  id: true,
  subscriptionStatus: true,
  taxExemptStatus: true,
  nextBillingDate: true,
  lastBillingDate: true,
  nonprofitVerificationRequired: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNonprofitInvoiceSchema = createInsertSchema(nonprofitInvoices).omit({
  id: true,
  invoiceNumber: true,
  invoiceDate: true,
  paymentStatus: true,
  paymentDate: true,
  createdAt: true,
  updatedAt: true,
});

// Nonprofit types
export type TaxExemptionDocument = typeof taxExemptionDocuments.$inferSelect;
export type InsertTaxExemptionDocument = z.infer<typeof insertTaxExemptionDocumentSchema>;
export type NonprofitSubscription = typeof nonprofitSubscriptions.$inferSelect;
export type InsertNonprofitSubscription = z.infer<typeof insertNonprofitSubscriptionSchema>;
export type NonprofitInvoice = typeof nonprofitInvoices.$inferSelect;
export type InsertNonprofitInvoice = z.infer<typeof insertNonprofitInvoiceSchema>;

// Athletic Support Teams (Cheerleading, Dance, Band, Color Guard)
export const supportTeams = pgTable("support_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  name: varchar("name").notNull(), // "Varsity Cheerleading", "Dance Team", etc.
  teamType: text("team_type", {
    enum: ["cheerleading", "dance_team", "color_guard", "marching_band", "pep_squad", "mascot_team"]
  }).notNull(),
  season: text("season", {
    enum: ["fall", "winter", "spring", "summer", "year_round"]
  }).default("fall"),
  coachId: varchar("coach_id").references(() => users.id),
  assistantCoachId: varchar("assistant_coach_id").references(() => users.id),
  
  // Team specifications
  teamSize: integer("team_size").default(0),
  competitionLevel: text("competition_level", {
    enum: ["varsity", "junior_varsity", "freshman", "middle_school", "elementary", "recreational"]
  }).default("varsity"),
  
  // Safety and compliance
  usaCheersafety: boolean("usa_cheer_safety").default(false), // USA Cheer Safety certification
  usasfCompliant: boolean("usasf_compliant").default(false), // USASF rules compliance
  nfhsRules: boolean("nfhs_rules").default(false), // NFHS Spirit Rules
  
  // Performance details for cheerleading/dance
  stuntsAllowed: boolean("stunts_allowed").default(false),
  tumblingAllowed: boolean("tumbling_allowed").default(false),
  basketTossAllowed: boolean("basket_toss_allowed").default(false),
  pyramidsAllowed: boolean("pyramids_allowed").default(false),
  
  // Equipment and surfaces
  practicesOnMats: boolean("practices_on_mats").default(true),
  competesOnMats: boolean("competes_on_mats").default(true),
  hasSpringFloor: boolean("has_spring_floor").default(false),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support Team Members (individual cheerleaders, dancers, band members, etc.)
export const supportTeamMembers = pgTable("support_team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supportTeamId: varchar("support_team_id").notNull().references(() => supportTeams.id),
  studentId: varchar("student_id").references(() => users.id), // If they have a user account
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  grade: integer("grade"), // 6-12
  dateOfBirth: date("date_of_birth"),
  
  // Position/Role specific to team type
  position: text("position", {
    enum: [
      // Cheerleading positions
      "base", "flyer", "back_spot", "front_spot", "tumbler", "captain", "co_captain",
      // Dance positions
      "captain", "co_captain", "soloist", "ensemble", "choreographer",
      // Band positions
      "section_leader", "drum_major", "color_guard_captain", "equipment_manager",
      // General
      "member", "alternate"
    ]
  }).default("member"),
  
  // Experience and skills
  yearsExperience: integer("years_experience").default(0),
  skillLevel: text("skill_level", {
    enum: ["beginner", "intermediate", "advanced", "elite"]
  }).default("beginner"),
  
  // Cheerleading/Dance specific skills
  canStunt: boolean("can_stunt").default(false),
  canTumble: boolean("can_tumble").default(false),
  canFly: boolean("can_fly").default(false),
  canBase: boolean("can_base").default(false),
  canSpot: boolean("can_spot").default(false),
  
  // Health and medical clearance
  medicalClearance: boolean("medical_clearance").default(false),
  clearanceDate: date("clearance_date"),
  clearanceExpiresAt: date("clearance_expires_at"),
  hasInjuryHistory: boolean("has_injury_history").default(false),
  
  // Parent/Guardian info
  parentEmail: varchar("parent_email"),
  parentPhone: varchar("parent_phone"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support Team Injury Tracking
export const supportTeamInjuries = pgTable("support_team_injuries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull().references(() => supportTeamMembers.id),
  athleticTrainerId: varchar("athletic_trainer_id").references(() => users.id),
  
  // Injury details
  injuryDate: date("injury_date").notNull(),
  injuryLocation: text("injury_location", {
    enum: ["ankle", "knee", "wrist", "shoulder", "neck", "back", "hip", "elbow", "finger", "other"]
  }).notNull(),
  injuryType: text("injury_type", {
    enum: ["sprain", "strain", "fracture", "concussion", "contusion", "laceration", "dislocation", "other"]
  }).notNull(),
  
  // Activity when injured
  activityWhenInjured: text("activity_when_injured", {
    enum: ["stunting", "tumbling", "dancing", "jumping", "running", "marching", "lifting_equipment", "practice", "performance", "other"]
  }),
  
  // Cheerleading specific
  stuntingPosition: text("stunting_position", {
    enum: ["base", "flyer", "back_spot", "front_spot", "none"]
  }),
  surfaceType: text("surface_type", {
    enum: ["mats", "spring_floor", "gym_floor", "outdoor_surface", "football_field", "track", "other"]
  }),
  
  // Severity and treatment
  severity: text("severity", {
    enum: ["minor", "moderate", "severe", "catastrophic"]
  }).default("minor"),
  description: text("description"),
  treatmentProvided: text("treatment_provided"),
  returnToPlayCleared: boolean("return_to_play_cleared").default(false),
  returnToPlayDate: date("return_to_play_date"),
  
  // Follow-up care
  requiresFollowUp: boolean("requires_follow_up").default(false),
  followUpNotes: text("follow_up_notes"),
  parentNotified: boolean("parent_notified").default(false),
  doctorReferral: boolean("doctor_referral").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Support Team AI Consultation History
export const supportTeamAiConsultations = pgTable("support_team_ai_consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleticTrainerId: varchar("athletic_trainer_id").notNull().references(() => users.id),
  memberId: varchar("member_id").references(() => supportTeamMembers.id),
  supportTeamId: varchar("support_team_id").references(() => supportTeams.id),
  
  // Consultation details
  consultationType: text("consultation_type", {
    enum: ["injury_assessment", "prevention_protocol", "return_to_play", "safety_review", "skill_progression"]
  }).notNull(),
  sport: text("sport", {
    enum: ["cheerleading", "dance_team", "color_guard", "marching_band", "other"]
  }).notNull(),
  injuryLocation: text("injury_location", {
    enum: ["ankle", "knee", "wrist", "shoulder", "neck", "back", "hip", "elbow", "other"]
  }),
  
  // Input data
  symptoms: text("symptoms"),
  activityDescription: text("activity_description"),
  riskFactors: jsonb("risk_factors").$type<string[]>(),
  
  // AI response
  aiRecommendations: text("ai_recommendations"),
  riskLevel: text("risk_level", {
    enum: ["low", "moderate", "high", "critical"]
  }).default("low"),
  redFlags: jsonb("red_flags").$type<string[]>(),
  recommendedActions: jsonb("recommended_actions").$type<string[]>(),
  
  // Cheerleading specific data
  stuntingActivity: boolean("stunting_activity").default(false),
  basketTossInvolved: boolean("basket_toss_involved").default(false),
  surfaceType: text("surface_type", {
    enum: ["mats", "spring_floor", "gym_floor", "outdoor_surface", "other"]
  }),
  
  // Follow-up tracking
  followUpRequired: boolean("follow_up_required").default(false),
  followUpCompleted: boolean("follow_up_completed").default(false),
  followUpDate: date("follow_up_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema and type exports for support teams
export const insertSupportTeamSchema = createInsertSchema(supportTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTeamMemberSchema = createInsertSchema(supportTeamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTeamInjurySchema = createInsertSchema(supportTeamInjuries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTeamAiConsultationSchema = createInsertSchema(supportTeamAiConsultations).omit({
  id: true,
  createdAt: true,
});

// Support team types
export type SupportTeam = typeof supportTeams.$inferSelect;
export type InsertSupportTeam = z.infer<typeof insertSupportTeamSchema>;
export type SupportTeamMember = typeof supportTeamMembers.$inferSelect;
export type InsertSupportTeamMember = z.infer<typeof insertSupportTeamMemberSchema>;
export type SupportTeamInjury = typeof supportTeamInjuries.$inferSelect;
export type InsertSupportTeamInjury = z.infer<typeof insertSupportTeamInjurySchema>;
export type SupportTeamAiConsultation = typeof supportTeamAiConsultations.$inferSelect;
export type InsertSupportTeamAiConsultation = z.infer<typeof insertSupportTeamAiConsultationSchema>;

// User types
export type User = typeof users.$inferSelect;

// Import academic competition schema
export * from "./academicSchema";

// Import commissioner schema for fantasy league management
export * from './commissioner-schema';
export * from './game-templates-schema';

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

// Note: Fantasy leagues table moved to earlier in file for better organization

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
  
  // Enhanced player card data
  playerImageUrl: varchar("player_image_url"),
  teamLogoUrl: varchar("team_logo_url"),
  height: varchar("height"), // e.g., "6'2\""
  weight: integer("weight"), // in pounds
  age: integer("age"),
  experience: integer("experience"), // years in league
  
  // Current season totals (like DK player cards)
  currentSeasonStats: jsonb("current_season_stats").$type<{
    // NFL Example
    attempts?: number;
    yards?: number;
    yardsPerGame?: number;
    touchdowns?: number;
    fantasyPointsPerGame?: number;
    // NBA Example
    points?: number;
    rebounds?: number;
    assists?: number;
    minutesPerGame?: number;
    // Generic stats
    gamesPlayed?: number;
    [key: string]: any;
  }>(),
  
  // Recent performance window (last 6 games)
  recentPerformance: jsonb("recent_performance").$type<{
    games: Array<{
      week: number;
      opponent: string;
      fantasyPoints: number;
      salary: number;
      gameResult: 'W' | 'L';
      stats: { [key: string]: any };
    }>;
    trend: 'up' | 'down' | 'stable';
  }>(),
  
  // News and injury updates
  injuryStatus: varchar("injury_status").default("healthy"),
  injuryDesignation: varchar("injury_designation"), // Questionable, Doubtful, Out, IR
  latestNews: jsonb("latest_news").$type<Array<{
    timestamp: string;
    headline: string;
    summary: string;
    source: string;
    impact: 'positive' | 'negative' | 'neutral';
  }>>(),
  
  // Matchup data
  nextOpponent: varchar("next_opponent"),
  nextGameDate: timestamp("next_game_date"),
  opponentRank: jsonb("opponent_rank").$type<{
    vsPosition: number; // Rank against this position (e.g., 2nd vs RBs)
    passYardsAllowed?: number;
    rushYardsAllowed?: number;
    pointsAllowed?: number;
    fantasyPointsAllowed?: number;
  }>(),
  
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

// Showdown contests - Captain mode like DraftKings
export const showdownContests = pgTable("showdown_contests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contestName: varchar("contest_name").notNull(),
  commissionerId: varchar("commissioner_id").notNull(),
  sport: varchar("sport").notNull(), // nfl, nba, mlb, etc.
  gameDate: timestamp("game_date").notNull(),
  team1: varchar("team1").notNull(),
  team2: varchar("team2").notNull(),
  gameDescription: varchar("game_description"), // "KC @ LAC"
  
  // Contest settings
  maxEntries: integer("max_entries").default(20),
  currentEntries: integer("current_entries").default(0),
  entryFee: integer("entry_fee").default(0), // $0 for non-gambling
  prizePool: varchar("prize_pool").default("Bragging Rights"), // Text description
  
  // Captain mode configuration
  captainMultiplier: decimal("captain_multiplier").default("1.5"), // 1.5x points
  flexPositions: integer("flex_positions").default(5), // 5 FLEX players
  totalLineupSize: integer("total_lineup_size").default(6), // 1 Captain + 5 FLEX
  salaryCapEnabled: boolean("salary_cap_enabled").default(false), // Optional for showdowns
  salaryCap: integer("salary_cap"), // Optional salary limit
  
  // Contest status and timing
  status: varchar("status").default("open"), // open, locked, live, completed
  lineupLockTime: timestamp("lineup_lock_time").notNull(), // When lineups lock
  contestStartTime: timestamp("contest_start_time").notNull(),
  contestEndTime: timestamp("contest_end_time"),
  
  // Available players (filtered by game)
  availablePlayers: jsonb("available_players").$type<string[]>(), // Player IDs from the game
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Showdown entries - Individual lineups in showdown contests
export const showdownEntries = pgTable("showdown_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contestId: varchar("contest_id").references(() => showdownContests.id).notNull(),
  userId: varchar("user_id").notNull(),
  entryName: varchar("entry_name"), // Optional entry nickname
  
  // Captain mode lineup
  captainPlayerId: varchar("captain_player_id").references(() => professionalPlayers.id).notNull(),
  flexPlayers: jsonb("flex_players").$type<string[]>().notNull(), // Array of 5 player IDs
  
  // Scoring and performance
  totalSalary: integer("total_salary").default(0),
  projectedPoints: decimal("projected_points").default("0"),
  actualPoints: decimal("actual_points").default("0"),
  captainPoints: decimal("captain_points").default("0"), // Captain points with multiplier
  flexPoints: decimal("flex_points").default("0"),
  
  // Contest position and stats
  currentRank: integer("current_rank"),
  finalRank: integer("final_rank"),
  entryStatus: varchar("entry_status").default("active"), // active, eliminated, withdrawn
  
  submissionTime: timestamp("submission_time").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Showdown leaderboards - Real-time rankings
export const showdownLeaderboards = pgTable("showdown_leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contestId: varchar("contest_id").references(() => showdownContests.id).notNull(),
  entryId: varchar("entry_id").references(() => showdownEntries.id).notNull(),
  userId: varchar("user_id").notNull(),
  
  // Ranking data
  currentRank: integer("current_rank").notNull(),
  previousRank: integer("previous_rank"),
  totalPoints: decimal("total_points").default("0"),
  pointsBehindLeader: decimal("points_behind_leader").default("0"),
  
  // Performance breakdown
  captainPerformance: jsonb("captain_performance").$type<{
    playerId: string;
    playerName: string;
    points: number;
    multipliedPoints: number;
    stats: { [key: string]: any };
  }>(),
  
  flexPerformance: jsonb("flex_performance").$type<Array<{
    playerId: string;
    playerName: string;
    points: number;
    stats: { [key: string]: any };
  }>>(),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
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

// Fantasy system types (moved to end of file to avoid duplicates)
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

// Note: Fantasy league insert schemas moved to earlier in file for better organization

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

// Modular page system - stores page layout and styling
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

// Dynamic form fields for registration modules
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

// Registration form responses
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
  approvedAt: timestamp("approved_at"),
  approvedById: varchar("approved_by_id").references(() => users.id),
});

// Relations for form fields
export const registrationFormFieldsRelations = relations(registrationFormFields, ({ one }) => ({
  page: one(modularPages, {
    fields: [registrationFormFields.pageId],
    references: [modularPages.id],
  }),
}));

// Relations for responses
export const registrationResponsesRelations = relations(registrationResponses, ({ one }) => ({
  page: one(modularPages, {
    fields: [registrationResponses.pageId],
    references: [modularPages.id],
  }),
  approvedBy: one(users, {
    fields: [registrationResponses.approvedById],
    references: [users.id],
  }),
}));

export type RegistrationFormField = typeof registrationFormFields.$inferSelect;
export type InsertRegistrationFormField = typeof registrationFormFields.$inferInsert;
export type RegistrationResponse = typeof registrationResponses.$inferSelect;
export type InsertRegistrationResponse = typeof registrationResponses.$inferInsert;

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

// Team registrations - Jersey Watch-style team creation with shareable codes
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

// Jersey Watch-style team members within a team registration
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

// Jersey Watch-style team payment tracking for flexible payment models
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

// Teams - core team entity for better organization
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

// Team players/athletes with comprehensive info
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

// Medical History Form - Comprehensive 21-question participation physical evaluation
export const medicalHistory = pgTable("medical_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull().unique().references(() => teamPlayers.id, { onDelete: "cascade" }),
  
  // Basic demographic info (auto-populated from registration)
  studentName: varchar("student_name").notNull(),
  sex: varchar("sex"),
  age: integer("age"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  phone: varchar("phone"),
  grade: varchar("grade"),
  school: varchar("school"),
  personalPhysician: varchar("personal_physician"),
  physicianPhone: varchar("physician_phone"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactRelationship: varchar("emergency_contact_relationship"),
  emergencyContactPhoneHome: varchar("emergency_contact_phone_home"),
  emergencyContactPhoneWork: varchar("emergency_contact_phone_work"),
  
  // Medical History Questions (Yes/No with explanations)
  // Q1: Recent medical illness or injury
  q1_recent_illness: boolean("q1_recent_illness"),
  q1_explanation: text("q1_explanation"),
  
  // Q2: Hospitalizations and surgeries
  q2_hospitalized: boolean("q2_hospitalized"),
  q2_surgery: boolean("q2_surgery"),
  q2_explanation: text("q2_explanation"),
  
  // Q3: Heart-related questions (multiple sub-questions)
  q3_heart_testing: boolean("q3_heart_testing"),
  q3_passed_out_exercise: boolean("q3_passed_out_exercise"),
  q3_chest_pain_exercise: boolean("q3_chest_pain_exercise"),
  q3_tired_quickly: boolean("q3_tired_quickly"),
  q3_racing_heart: boolean("q3_racing_heart"),
  q3_high_bp_cholesterol: boolean("q3_high_bp_cholesterol"),
  q3_heart_murmur: boolean("q3_heart_murmur"),
  q3_family_heart_death: boolean("q3_family_heart_death"),
  q3_family_heart_disease: boolean("q3_family_heart_disease"),
  q3_viral_infection: boolean("q3_viral_infection"),
  q3_physician_restricted: boolean("q3_physician_restricted"),
  q3_explanation: text("q3_explanation"),
  
  // Q4: Head injuries and concussions
  q4_head_injury: boolean("q4_head_injury"),
  q4_unconscious: boolean("q4_unconscious"),
  q4_concussion_count: integer("q4_concussion_count"),
  q4_last_concussion_date: varchar("q4_last_concussion_date"),
  q4_explanation: text("q4_explanation"),
  
  // Q5: Neurological questions
  q5_seizure: boolean("q5_seizure"),
  q5_headaches: boolean("q5_headaches"),
  q5_numbness: boolean("q5_numbness"),
  q5_stinger_burner: boolean("q5_stinger_burner"),
  q5_explanation: text("q5_explanation"),
  
  // Q6: Missing paired organs
  q6_missing_organs: boolean("q6_missing_organs"),
  q6_explanation: text("q6_explanation"),
  
  // Q7: Under doctor's care
  q7_doctors_care: boolean("q7_doctors_care"),
  q7_explanation: text("q7_explanation"),
  
  // Q8: Current medications
  q8_medications: boolean("q8_medications"),
  q8_explanation: text("q8_explanation"),
  
  // Q9: Allergies
  q9_allergies: boolean("q9_allergies"),
  q9_explanation: text("q9_explanation"),
  
  // Q10: Exercise-related dizziness
  q10_dizzy_exercise: boolean("q10_dizzy_exercise"),
  q10_explanation: text("q10_explanation"),
  
  // Q11: Skin problems
  q11_skin_problems: boolean("q11_skin_problems"),
  q11_explanation: text("q11_explanation"),
  
  // Q12: Heat illness
  q12_heat_illness: boolean("q12_heat_illness"),
  q12_explanation: text("q12_explanation"),
  
  // Q13: Vision problems
  q13_vision_problems: boolean("q13_vision_problems"),
  q13_explanation: text("q13_explanation"),
  
  // Q14: Breathing and asthma
  q14_short_breath: boolean("q14_short_breath"),
  q14_asthma: boolean("q14_asthma"),
  q14_seasonal_allergies: boolean("q14_seasonal_allergies"),
  q14_explanation: text("q14_explanation"),
  
  // Q15: Protective equipment
  q15_protective_equipment: boolean("q15_protective_equipment"),
  q15_explanation: text("q15_explanation"),
  
  // Q16: Injuries and pain
  q16_sprain_strain: boolean("q16_sprain_strain"),
  q16_broken_bones: boolean("q16_broken_bones"),
  q16_joint_problems: boolean("q16_joint_problems"),
  q16_body_parts: jsonb("q16_body_parts").$type<{
    head?: boolean;
    neck?: boolean;
    back?: boolean;
    chest?: boolean;
    shoulder?: boolean;
    upperArm?: boolean;
    elbow?: boolean;
    forearm?: boolean;
    wrist?: boolean;
    hand?: boolean;
    finger?: boolean;
    hip?: boolean;
    thigh?: boolean;
    knee?: boolean;
    shinCalf?: boolean;
    ankle?: boolean;
    foot?: boolean;
  }>(),
  q16_explanation: text("q16_explanation"),
  
  // Q17: Weight concerns
  q17_weight_concerns: boolean("q17_weight_concerns"),
  q17_explanation: text("q17_explanation"),
  
  // Q18: Stress
  q18_stressed: boolean("q18_stressed"),
  q18_explanation: text("q18_explanation"),
  
  // Q19: Sickle cell
  q19_sickle_cell: boolean("q19_sickle_cell"),
  q19_explanation: text("q19_explanation"),
  
  // Female-specific questions
  q20_first_menstrual_period: varchar("q20_first_menstrual_period"),
  q20_most_recent_period: varchar("q20_most_recent_period"),
  q20_cycle_length: varchar("q20_cycle_length"),
  q20_periods_last_year: integer("q20_periods_last_year"),
  q20_longest_time_between: varchar("q20_longest_time_between"),
  
  // Male-specific questions
  q21_missing_testicle: boolean("q21_missing_testicle"),
  q21_testicular_swelling: boolean("q21_testicular_swelling"),
  q21_explanation: text("q21_explanation"),
  
  // ECG screening option
  ecg_screening_requested: boolean("ecg_screening_requested").default(false),
  
  // Digital signatures
  studentSignature: varchar("student_signature"),
  parentSignature: varchar("parent_signature").notNull(),
  signatureDate: date("signature_date").notNull(),
  
  // Form completion status
  isComplete: boolean("is_complete").default(false),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports for teams, team players, and medical history
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamPlayerSchema = createInsertSchema(teamPlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertTeamPlayer = z.infer<typeof insertTeamPlayerSchema>;
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type Team = typeof teams.$inferSelect;
export type TeamPlayer = typeof teamPlayers.$inferSelect;
export type MedicalHistory = typeof medicalHistory.$inferSelect;

// Dedicated schema for subscription updates - only allows Stripe subscription ID
// Status and tier should be derived from Stripe or set via webhooks only
export const updateTeamSubscriptionSchema = z.object({
  stripeSubscriptionId: z.string().min(1, "Stripe subscription ID required")
});

export type UpdateTeamSubscription = z.infer<typeof updateTeamSubscriptionSchema>;

// Team documents and consent forms with file management
export const teamDocuments = pgTable("team_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  playerId: varchar("player_id").references(() => teamPlayers.id, { onDelete: "cascade" }),
  documentType: text("document_type", {
    enum: ["birth_certificate", "medical_form", "photo_consent", "liability_waiver", "emergency_contact", "insurance_card", "physical_form", "custom"]
  }).notNull(),
  documentName: varchar("document_name").notNull(),
  documentUrl: varchar("document_url"), // Object storage path
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  isRequired: boolean("is_required").default(true),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  expirationDate: date("expiration_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consent form templates with legal compliance
export const consentFormTemplates = pgTable("consent_form_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  formType: text("form_type", {
    enum: ["liability_waiver", "medical_consent", "photo_release", "emergency_contact", "transportation_consent", "general_consent"]
  }).notNull(),
  htmlContent: text("html_content").notNull(),
  requiredFields: jsonb("required_fields").$type<Array<{
    fieldName: string;
    fieldType: string;
    required: boolean;
    placeholder?: string;
  }>>().default([]),
  legalDisclaimer: text("legal_disclaimer"),
  stateCompliance: jsonb("state_compliance").$type<{
    applicableStates?: string[];
    federalCompliance?: boolean;
    lastReviewed?: string;
    reviewedBy?: string;
  }>(),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual consent form responses with digital signatures
export const consentFormResponses = pgTable("consent_form_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateId: varchar("template_id").notNull().references(() => consentFormTemplates.id),
  teamRegistrationId: varchar("team_registration_id").references(() => teamRegistrations.id, { onDelete: "cascade" }),
  playerId: varchar("player_id").references(() => teamPlayers.id),
  parentGuardianName: varchar("parent_guardian_name").notNull(),
  parentGuardianEmail: varchar("parent_guardian_email").notNull(),
  digitalSignature: varchar("digital_signature").notNull(),
  signatureTimestamp: timestamp("signature_timestamp").notNull(),
  responseData: jsonb("response_data").$type<Record<string, any>>().default({}),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  isComplete: boolean("is_complete").default(false),
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

// Jersey Watch-style team registration types
export type JerseyTeamMember = typeof jerseyTeamMembers.$inferSelect;
export type InsertJerseyTeamMember = typeof jerseyTeamMembers.$inferInsert;
export type JerseyTeamPayment = typeof jerseyTeamPayments.$inferSelect;
export type InsertJerseyTeamPayment = typeof jerseyTeamPayments.$inferInsert;

// Live scoring and messaging system types
export type LiveScore = typeof liveScores.$inferSelect;
export type InsertLiveScore = typeof liveScores.$inferInsert;
export type ScorekeeperAssignment = typeof scorekeeperAssignments.$inferSelect;
export type InsertScorekeeperAssignment = typeof scorekeeperAssignments.$inferInsert;
export type LiveScoreMessage = typeof liveScoreMessages.$inferSelect;
export type InsertLiveScoreMessage = typeof liveScoreMessages.$inferInsert;

// Geolocation-based event tracking
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

// Location check-ins for participants and scorekeepers
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

// Location-based scoring permissions
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
export type LocationCheckIn = typeof locationCheckIns.$inferSelect;
export type InsertLocationCheckIn = typeof locationCheckIns.$inferInsert;
export type LocationScoringPermission = typeof locationScoringPermissions.$inferSelect;
export type InsertLocationScoringPermission = typeof locationScoringPermissions.$inferInsert;

// Relations for live scoring system
export const liveScoresRelations = relations(liveScores, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [liveScores.tournamentId],
    references: [tournaments.id],
  }),
  assignedScorekeeper: one(users, {
    fields: [liveScores.assignedScorekeeperId],
    references: [users.id],
  }),
}));

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
    fields: [scorekeeperAssignments.assignedBy],
    references: [users.id],
  }),
}));

export const liveScoreMessagesRelations = relations(liveScoreMessages, ({ one }) => ({
  liveScore: one(liveScores, {
    fields: [liveScoreMessages.liveScoreId],
    references: [liveScores.id],
  }),
  sender: one(users, {
    fields: [liveScoreMessages.senderId],
    references: [users.id],
  }),
}));

// Geolocation relations
export const eventLocationsRelations = relations(eventLocations, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [eventLocations.tournamentId],
    references: [tournaments.id],
  }),
  checkIns: many(locationCheckIns),
  scoringPermissions: many(locationScoringPermissions),
}));

export const locationCheckInsRelations = relations(locationCheckIns, ({ one }) => ({
  user: one(users, {
    fields: [locationCheckIns.userId],
    references: [users.id],
  }),
  eventLocation: one(eventLocations, {
    fields: [locationCheckIns.eventLocationId],
    references: [eventLocations.id],
  }),
  tournament: one(tournaments, {
    fields: [locationCheckIns.tournamentId],
    references: [tournaments.id],
  }),
}));

export const locationScoringPermissionsRelations = relations(locationScoringPermissions, ({ one }) => ({
  scorekeeper: one(users, {
    fields: [locationScoringPermissions.scorekeeperId],
    references: [users.id],
  }),
  eventLocation: one(eventLocations, {
    fields: [locationScoringPermissions.eventLocationId],
    references: [eventLocations.id],
  }),
  tournament: one(tournaments, {
    fields: [locationScoringPermissions.tournamentId],
    references: [tournaments.id],
  }),
  permissionGrantedByUser: one(users, {
    fields: [locationScoringPermissions.permissionGrantedBy],
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

// Nightly Analysis Storage - PERSISTENT ACROSS DEPLOYMENTS
export const nightlyAnalysis = pgTable("nightly_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  runDate: timestamp("run_date").defaultNow(),
  yahooData: jsonb("yahoo_data"),
  freeSourceData: jsonb("free_source_data"),
  comparisonAnalysis: jsonb("comparison_analysis"),
  predictions: jsonb("predictions"),
  processingTime: integer("processing_time_ms"),
  status: varchar("status").default("completed"), // completed, failed, running
  dataPointsCollected: integer("data_points_collected"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TournamentCredit = typeof tournamentCredits.$inferSelect;
export type InsertTournamentCredit = typeof tournamentCredits.$inferInsert;
export type UsageAnalytic = typeof usageAnalytics.$inferSelect;
export type InsertUsageAnalytic = typeof usageAnalytics.$inferInsert;
export type NightlyAnalysis = typeof nightlyAnalysis.$inferSelect;
export type InsertNightlyAnalysis = typeof nightlyAnalysis.$inferInsert;
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

// Tournament Coordination Intelligence System types
export type TournamentCoordinationData = typeof tournamentCoordinationData.$inferSelect;
export type InsertTournamentCoordinationData = typeof tournamentCoordinationData.$inferInsert;

// Tournament Organizer Network types  
export type TournamentOrganizerNetwork = typeof tournamentOrganizerNetwork.$inferSelect;
export type InsertTournamentOrganizerNetwork = typeof tournamentOrganizerNetwork.$inferInsert;

// Regional Tournament Circuits types
export type RegionalTournamentCircuit = typeof regionalTournamentCircuits.$inferSelect;
export type InsertRegionalTournamentCircuit = typeof regionalTournamentCircuits.$inferInsert;

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
  competition: one(corporateCompetitions, {
    fields: [performanceMetrics.competitionId],
    references: [corporateCompetitions.id],
  }),
  participant: one(corporateParticipants, {
    fields: [performanceMetrics.participantId],
    references: [corporateParticipants.id],
  }),
}));

export const competitionLeaderboardsRelations = relations(competitionLeaderboards, ({ one }) => ({
  competition: one(corporateCompetitions, {
    fields: [competitionLeaderboards.competitionId],
    references: [corporateCompetitions.id],
  }),
  participant: one(corporateParticipants, {
    fields: [competitionLeaderboards.participantId],
    references: [corporateParticipants.id],
  }),
}));

// District and School Relations
export const districtsRelations = relations(districts, ({ one, many }) => ({
  athleticDirector: one(users, {
    fields: [districts.athleticDirectorId],
    references: [users.id],
  }),
  headAthleticTrainer: one(users, {
    fields: [districts.headAthleticTrainerId],
    references: [users.id],
  }),
  schools: many(schools),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  district: one(districts, {
    fields: [schools.districtId],
    references: [districts.id],
  }),
  principal: one(users, {
    fields: [schools.principalId],
    references: [users.id],
  }),
  athleticDirector: one(users, {
    fields: [schools.athleticDirectorId],
    references: [users.id],
  }),
  athleticTrainer: one(users, {
    fields: [schools.athleticTrainerId],
    references: [users.id],
  }),
  venues: many(athleticVenues),
  assets: many(schoolAssets),
}));

export const athleticVenuesRelations = relations(athleticVenues, ({ one }) => ({
  school: one(schools, {
    fields: [athleticVenues.schoolId],
    references: [schools.id],
  }),
}));

export const schoolAssetsRelations = relations(schoolAssets, ({ one }) => ({
  school: one(schools, {
    fields: [schoolAssets.schoolId],
    references: [schools.id],
  }),
  uploadedBy: one(users, {
    fields: [schoolAssets.uploadedById],
    references: [users.id],
  }),
}));

// Insert schemas for modular pages
export const insertModularPageSchema = createInsertSchema(modularPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insert schemas for discount codes
export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  currentUses: true,
  createdAt: true,
  updatedAt: true,
});

// Type definitions for discount codes
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;

export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = typeof paymentPlans.$inferInsert;
export type PaymentPlanEnrollment = typeof paymentPlanEnrollments.$inferSelect;
export type InsertPaymentPlanEnrollment = typeof paymentPlanEnrollments.$inferInsert;
export type PaymentPlanInstallment = typeof paymentPlanInstallments.$inferSelect;
export type InsertPaymentPlanInstallment = typeof paymentPlanInstallments.$inferInsert;

// ⚡ JERSEY WATCH-STYLE ORGANIZER ANALYTICS

// Page view tracking for organizer analytics (Jersey Watch style)
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

// Contact collection from tournament participants (Jersey Watch style)
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

// Organizer dashboard metrics aggregation (Jersey Watch style)
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

// White-label client configurations
export const clientConfigurations = pgTable("client_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  domain: varchar("domain").unique().notNull(), // championsforchange.net
  clientName: varchar("client_name").notNull(), // Champions for Change
  
  // Branding Configuration
  branding: jsonb("branding").$type<{
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    logoUrl?: string;
    faviconUrl?: string;
    theme: 'light' | 'dark' | 'auto';
  }>().default({
    primaryColor: '#059669', // emerald-600
    secondaryColor: '#10b981', // emerald-500  
    accentColor: '#f59e0b', // amber-500
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    theme: 'light'
  }),
  
  // Landing Page Content
  heroContent: jsonb("hero_content").$type<{
    mainHeading: string;
    subheading: string;
    ctaText: string;
    ctaUrl: string;
    backgroundImageUrl?: string;
    showMissionBanner: boolean;
    missionText: string;
  }>().default({
    mainHeading: 'Welcome to Our Platform',
    subheading: 'Professional tournament management made simple',
    ctaText: 'Get Started',
    ctaUrl: '/pricing',
    showMissionBanner: true,
    missionText: 'Built to support educational opportunities'
  }),
  
  // Contact Information
  contactInfo: jsonb("contact_info").$type<{
    email: string;
    phone?: string;
    address?: string;
    supportEmail?: string;
  }>().default({
    email: 'info@example.com'
  }),
  
  // Features Configuration
  features: jsonb("features").$type<{
    showDonationButton: boolean;
    enableTournamentOrganizers: boolean;
    showHealthBenefits: boolean;
    enableAcademicPrograms: boolean;
    showTestimonials: boolean;
  }>().default({
    showDonationButton: true,
    enableTournamentOrganizers: true,
    showHealthBenefits: true,
    enableAcademicPrograms: true,
    showTestimonials: true
  }),
  
  // SEO Configuration
  seoConfig: jsonb("seo_config").$type<{
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImageUrl?: string;
  }>().default({
    metaTitle: 'Tournament Management Platform',
    metaDescription: 'Professional tournament management solutions',
    keywords: ['tournaments', 'sports', 'management']
  }),
  
  // Custom CSS
  customStyles: text("custom_styles"), // CSS overrides
  
  // Status and Settings
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type exports for Jersey Watch-style analytics
export type OrganizerPageView = typeof organizerPageViews.$inferSelect;
export type InsertOrganizerPageView = typeof organizerPageViews.$inferInsert;
export type OrganizerContact = typeof organizerContacts.$inferSelect;
export type InsertOrganizerContact = typeof organizerContacts.$inferInsert;
export type OrganizerMetric = typeof organizerMetrics.$inferSelect;
export type InsertOrganizerMetric = typeof organizerMetrics.$inferInsert;

// Client configuration types
export type ClientConfiguration = typeof clientConfigurations.$inferSelect;
export type InsertClientConfiguration = typeof clientConfigurations.$inferInsert;

// Insert schema for client configurations
export const insertClientConfigurationSchema = createInsertSchema(clientConfigurations);
export type InsertClientConfigurationType = z.infer<typeof insertClientConfigurationSchema>;

// Guest participant registrations - "Pay & Play or Join the Family" system
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
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for guest participants
export const guestParticipantsRelations = relations(guestParticipants, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [guestParticipants.tournamentId],
    references: [tournaments.id],
  }),
  organizer: one(users, {
    fields: [guestParticipants.organizerId],
    references: [users.id],
  }),
  linkedUser: one(users, {
    fields: [guestParticipants.linkedUserId],
    references: [users.id],
  }),
}));

// Relations for password reset tokens
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Type exports for guest participant system
export type GuestParticipant = typeof guestParticipants.$inferSelect;
export type InsertGuestParticipant = typeof guestParticipants.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// Insert schemas
export const insertGuestParticipantSchema = createInsertSchema(guestParticipants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

// Showdown contest relations
export const showdownContestsRelations = relations(showdownContests, ({ many, one }) => ({
  entries: many(showdownEntries),
  leaderboards: many(showdownLeaderboards),
  commissioner: one(users, {
    fields: [showdownContests.commissionerId],
    references: [users.id],
  }),
}));

export const showdownEntriesRelations = relations(showdownEntries, ({ one, many }) => ({
  contest: one(showdownContests, {
    fields: [showdownEntries.contestId],
    references: [showdownContests.id],
  }),
  user: one(users, {
    fields: [showdownEntries.userId],
    references: [users.id],
  }),
  captain: one(professionalPlayers, {
    fields: [showdownEntries.captainPlayerId],
    references: [professionalPlayers.id],
  }),
  leaderboard: one(showdownLeaderboards, {
    fields: [showdownEntries.id],
    references: [showdownLeaderboards.entryId],
  }),
}));

export const showdownLeaderboardsRelations = relations(showdownLeaderboards, ({ one }) => ({
  contest: one(showdownContests, {
    fields: [showdownLeaderboards.contestId],
    references: [showdownContests.id],
  }),
  entry: one(showdownEntries, {
    fields: [showdownLeaderboards.entryId],
    references: [showdownEntries.id],
  }),
  user: one(users, {
    fields: [showdownLeaderboards.userId],
    references: [users.id],
  }),
}));

// Type exports for showdown system
export type ShowdownContest = typeof showdownContests.$inferSelect;
export type InsertShowdownContest = typeof showdownContests.$inferInsert;
export type ShowdownEntry = typeof showdownEntries.$inferSelect;
export type InsertShowdownEntry = typeof showdownEntries.$inferInsert;
export type ShowdownLeaderboard = typeof showdownLeaderboards.$inferSelect;
export type InsertShowdownLeaderboard = typeof showdownLeaderboards.$inferInsert;

// Enhanced professional player types (already defined above)

// Insert schemas for showdown system
export const insertShowdownContestSchema = createInsertSchema(showdownContests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShowdownEntrySchema = createInsertSchema(showdownEntries).omit({
  id: true,
  submissionTime: true,
  lastUpdated: true,
});

export const insertShowdownLeaderboardSchema = createInsertSchema(showdownLeaderboards).omit({
  id: true,
  lastUpdated: true,
});

// =============================================================================
// MERCHANDISE AND WEBSTORE SYSTEM
// =============================================================================

// Merchandise products table
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
});

// Event tickets table for webstore
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
});

// Merchandise and ticket type definitions
export type MerchandiseProduct = typeof merchandiseProducts.$inferSelect;
export type InsertMerchandiseProduct = typeof merchandiseProducts.$inferInsert;
export type MerchandiseOrder = typeof merchandiseOrders.$inferSelect;
export type InsertMerchandiseOrder = typeof merchandiseOrders.$inferInsert;
export type EventTicket = typeof eventTickets.$inferSelect;
export type InsertEventTicket = typeof eventTickets.$inferInsert;
export type TicketOrder = typeof ticketOrders.$inferSelect;
export type InsertTicketOrder = typeof ticketOrders.$inferInsert;

// Insert schemas for webstore system
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

// SMART TOURNAMENT-REGISTRATION LINKING SYSTEM
// Bridges registration forms to existing tournament divisions and events

// Tournament Registration Forms - Define what data to collect for tournament registration
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

// Registration Submissions - Individual participant submissions
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

// Registration Assignment Log - Track smart matching decisions
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

// Insert schemas for registration system
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

export const insertRegistrationAssignmentLogSchema = createInsertSchema(registrationAssignmentLog).omit({
  id: true,
  createdAt: true,
});

// =============================================================================
// ENHANCED VALIDATION SCHEMAS WITH BUSINESS LOGIC
// Comprehensive validation for production-ready tournament management
// =============================================================================

// Enhanced Match Validation with Business Rules
export const createMatchSchema = insertMatchSchema.extend({
  round: z.number().int().positive().max(100, "Round number cannot exceed 100"),
  position: z.number().int().positive().max(1000, "Position cannot exceed 1000"),
  team1Score: z.number().int().min(0, "Scores cannot be negative").max(999, "Score too high").optional(),
  team2Score: z.number().int().min(0, "Scores cannot be negative").max(999, "Score too high").optional(),
  team1: z.string().min(1, "Team 1 is required").optional(),
  team2: z.string().min(1, "Team 2 is required").optional(),
  status: z.enum(["upcoming", "in-progress", "completed"]),
  winner: z.enum(["team1", "team2", "tie"]).optional(),
}).superRefine((data, ctx) => {
  // 1. Status-based validation for completed matches
  if (data.status === "completed") {
    if (data.team1Score === undefined || data.team2Score === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Completed matches must have scores for both teams",
        path: ["team1Score", "team2Score"]
      });
    }
    if (!data.winner) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Completed matches must have a winner declared",
        path: ["winner"]
      });
    }
  }
  
  // 2. Forbid winner/scores for non-completed matches
  if (data.status !== "completed") {
    if (data.winner) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only completed matches can have a winner declared",
        path: ["winner"]
      });
    }
  }
  
  // 3. Winner-score consistency validation
  if (data.winner && data.team1Score !== undefined && data.team2Score !== undefined) {
    if (data.winner === "team1" && data.team1Score <= data.team2Score) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Team 1 cannot be winner with a lower or equal score",
        path: ["winner"]
      });
    }
    if (data.winner === "team2" && data.team2Score <= data.team1Score) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Team 2 cannot be winner with a lower or equal score",
        path: ["winner"]
      });
    }
    if (data.winner === "tie" && data.team1Score !== data.team2Score) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tie declared but scores are not equal",
        path: ["winner"]
      });
    }
  }
  
  // 4. Team identity validation - teams must be different
  if (data.team1 && data.team2 && data.team1 === data.team2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Teams cannot play against themselves",
      path: ["team1", "team2"]
    });
  }
});

// Enhanced Tournament Validation - Override problematic enum fields
export const createTournamentSchema = insertTournamentSchema.omit({
  ageGroup: true,
  genderDivision: true,
  ffaConfig: true, // Omit ffaConfig as it may not exist in database
}).extend({
  name: z.string().min(3, "Tournament name must be at least 3 characters").max(100, "Name too long"),
  teamSize: z.number().int().min(1, "Team size must be at least 1").max(128, "Team size too large").optional(),
  teamsCount: z.number().int().min(1, "Teams count must be at least 1").max(10000, "Too many teams").optional(),
  maxParticipants: z.number().int().min(2, "Need at least 2 participants").max(10000, "Too many participants").optional(),
  entryFee: z.coerce.number().min(0, "Entry fee cannot be negative").optional(),
  // Make these completely optional strings to avoid enum validation issues
  ageGroup: z.string().optional(),
  genderDivision: z.string().optional(),
  skillLevel: z.string().optional(),
  tournamentDate: z.coerce.date({
    errorMap: () => ({ message: "Invalid tournament date format" })
  }).refine((date) => {
    const now = new Date();
    return date > now;
  }, "Tournament date must be in the future").optional(),
  registrationDeadline: z.coerce.date({
    errorMap: () => ({ message: "Invalid registration deadline format" })
  }).optional(),
}).superRefine((data, ctx) => {
  // 0. TeamSize validation - required for legacy tournaments, optional for config-driven ones
  const hasConfig = Boolean(data.config);
  if (!hasConfig && !data.teamSize) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Team size is required for legacy tournaments without config",
      path: ["teamSize"]
    });
  }
  
  // 1. Registration deadline must be in the future
  if (data.registrationDeadline) {
    const now = new Date();
    if (data.registrationDeadline <= now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Registration deadline must be in the future",
        path: ["registrationDeadline"]
      });
    }
  }
  
  // 2. Registration deadline must be before tournament date
  if (data.registrationDeadline && data.tournamentDate) {
    if (data.registrationDeadline >= data.tournamentDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Registration deadline must be before tournament date",
        path: ["registrationDeadline"]
      });
    }
  }
  
  // 3. Max participants should be reasonable for team size
  if (data.maxParticipants && data.teamSize) {
    if (data.maxParticipants < data.teamSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum participants cannot be less than team size",
        path: ["maxParticipants"]
      });
    }
  }
});

// Enhanced Sport Option Validation
export const createSportOptionSchema = insertSportOptionSchema.extend({
  name: z.string().min(2, "Sport name must be at least 2 characters").max(50, "Sport name too long"),
  sportCategory: z.string().min(2, "Category must be specified"),
}).refine((data) => {
  // Validate sport name doesn't contain special characters
  const validNamePattern = /^[a-zA-Z0-9\s&'-]+$/;
  return validNamePattern.test(data.name);
}, {
  message: "Sport name contains invalid characters",
  path: ["name"]
});

// Enhanced User Registration Validation
export const createUserSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email format").max(255, "Email too long"),
  firstName: z.string().min(1, "First name is required").max(50, "First name too long").optional(),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long").optional(),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters").max(100, "Organization name too long").optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, "Invalid phone number format").optional(),
});

// Enhanced Team Registration Validation  
export const createTeamRegistrationSchema = z.object({
  tournamentId: z.string().uuid("Invalid tournament ID"),
  teamName: z.string().min(2, "Team name must be at least 2 characters").max(100, "Team name too long"),
  coachName: z.string().min(2, "Coach name required").max(100, "Coach name too long"),
  coachEmail: z.string().email("Invalid coach email"),
  coachPhone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, "Invalid phone number").optional(),
  division: z.string().min(1, "Division must be specified").optional(),
  paymentStatus: z.enum(["pending", "partial", "paid", "overdue"]).default("pending"),
});

// Contact Validation
export const createContactSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50, "First name too long").optional(),
  lastName: z.string().min(1, "Last name required").max(50, "Last name too long").optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^\+?[\d\s\-\(\)\.]+$/, "Invalid phone number").optional(),
  organization: z.string().max(100, "Organization name too long").optional(),
  position: z.string().max(100, "Position title too long").optional(),
  sport: z.string().max(50, "Sport name too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

// API Response Validation Helpers
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(20),
  sortBy: z.string().max(50, "Sort field too long").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  query: z.string().min(1, "Search query required").max(100, "Query too long"),
  filters: z.record(z.string()).optional(),
}).merge(paginationSchema);

// Type exports for enhanced schemas
export type CreateMatchInput = z.infer<typeof createMatchSchema>;
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
export type CreateSportOptionInput = z.infer<typeof createSportOptionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTeamRegistrationInput = z.infer<typeof createTeamRegistrationSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;

// FantasyProfile schemas
export const insertFantasyProfileSchema = createInsertSchema(fantasyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFantasyProfile = z.infer<typeof insertFantasyProfileSchema>;
export type FantasyProfile = typeof fantasyProfiles.$inferSelect;

// =============================================================================
// ATHLETIC MANAGEMENT SYSTEM - CORE MISSING FUNCTIONALITY 
// =============================================================================

// Sports Catalog - Master list of all sports offered
export const sports = pgTable("sports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(), // "Basketball", "Football", "Track & Field"
  abbreviation: varchar("abbreviation"), // "BB", "FB", "TF"
  category: text("category", {
    enum: ["team_sport", "individual_sport", "academic_competition", "performing_arts"]
  }).notNull(),
  season: text("season", {
    enum: ["fall", "winter", "spring", "summer", "year_round"]
  }).notNull(),
  teamSize: integer("team_size"), // Players on field/court at once
  rosterSize: integer("roster_size"), // Total players on team
  genderDivisions: jsonb("gender_divisions").$type<string[]>().default([]), // ["boys", "girls", "mixed"]
  competitionLevels: jsonb("competition_levels").$type<string[]>().default([]), // ["jv", "varsity", "freshman"]
  isUILSport: boolean("is_uil_sport").default(false),
  description: text("description"),
  equipmentRequired: jsonb("equipment_required").$type<string[]>().default([]),
  facilitiesRequired: jsonb("facilities_required").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Athletic Seasons - Yearly athletic calendar periods
export const athleticSeasons = pgTable("athletic_seasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").notNull().references(() => districts.id),
  seasonName: varchar("season_name").notNull(), // "2024-2025 Fall", "2024-2025 Basketball"
  seasonType: text("season_type", {
    enum: ["fall", "winter", "spring", "summer", "year_round"]
  }).notNull(),
  academicYear: varchar("academic_year").notNull(), // "2024-2025"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  registrationOpen: date("registration_open"),
  registrationClose: date("registration_close"),
  status: text("status", {
    enum: ["planning", "registration", "active", "postseason", "completed"]
  }).default("planning"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School Sports Programs - Which sports each school offers
export const schoolSportsPrograms = pgTable("school_sports_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  sportId: varchar("sport_id").notNull().references(() => sports.id),
  seasonId: varchar("season_id").references(() => athleticSeasons.id),
  competitionLevel: text("competition_level", {
    enum: ["freshman", "junior_varsity", "varsity", "mixed_age", "open"]
  }).notNull(),
  genderDivision: text("gender_division", {
    enum: ["boys", "girls", "coed", "mixed"]
  }).notNull(),
  headCoachId: varchar("head_coach_id").references(() => users.id),
  assistantCoaches: jsonb("assistant_coaches").$type<Array<{
    userId?: string;
    name: string;
    role: string;
  }>>().default([]),
  maxRosterSize: integer("max_roster_size"),
  currentRosterSize: integer("current_roster_size").default(0),
  programStatus: text("program_status", {
    enum: ["active", "inactive", "suspended", "discontinued"]
  }).default("active"),
  budgetAllocated: decimal("budget_allocated", { precision: 10, scale: 2 }).default("0"),
  homeVenueId: varchar("home_venue_id").references(() => athleticVenues.id),
  practiceVenues: jsonb("practice_venues").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Athletes - Individual student athletes with comprehensive tracking
export const athletes = pgTable("athletes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  districtId: varchar("district_id").notNull().references(() => districts.id),
  studentDataId: varchar("student_data_id").references(() => studentData.id),
  
  // Personal Information
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  gender: text("gender", { enum: ["male", "female", "non_binary", "prefer_not_to_say"] }),
  grade: integer("grade"),
  graduationYear: integer("graduation_year"),
  
  // Academic Information
  gpa: decimal("gpa", { precision: 3, scale: 2 }),
  academicStanding: text("academic_standing", {
    enum: ["good", "academic_watch", "probation", "ineligible"]
  }).default("good"),
  
  // Physical Attributes (for sports analytics)
  height: integer("height"), // inches
  weight: integer("weight"), // pounds
  dominantHand: text("dominant_hand", { enum: ["right", "left", "ambidextrous"] }),
  
  // Emergency Contacts
  primaryEmergencyContact: jsonb("primary_emergency_contact").$type<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  }>(),
  secondaryEmergencyContact: jsonb("secondary_emergency_contact").$type<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>(),
  
  // Medical Information Links
  healthDataId: varchar("health_data_id").references(() => healthData.id),
  medicalClearanceDate: date("medical_clearance_date"),
  medicalClearanceExpires: date("medical_clearance_expires"),
  
  // Athletic Information
  primarySports: jsonb("primary_sports").$type<string[]>().default([]), // Sport IDs
  athleticStatus: text("athletic_status", {
    enum: ["active", "injured", "suspended", "retired", "transferred"]
  }).default("active"),
  eligibilityStatus: text("eligibility_status", {
    enum: ["eligible", "academically_ineligible", "medically_ineligible", "disciplinary_ineligible", "transfer_pending"]
  }).default("eligible"),
  
  // Performance Analytics Support
  performanceProfile: jsonb("performance_profile").$type<{
    baselineMetrics?: Record<string, number>;
    strengthAreas?: string[];
    improvementAreas?: string[];
    injuryRiskFactors?: string[];
    lastAssessmentDate?: string;
  }>(),
  
  athleticTrainerId: varchar("athletic_trainer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Rosters - Linking athletes to specific sport programs
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

// Injury Incidents - Individual injury tracking events
export const injuryIncidents = pgTable("injury_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  athleticTrainerId: varchar("athletic_trainer_id").notNull().references(() => users.id),
  
  // Incident Details
  incidentDate: timestamp("incident_date").notNull(),
  incidentTime: varchar("incident_time"), // Time of day
  activityWhenInjured: text("activity_when_injured", {
    enum: ["practice", "game", "conditioning", "weight_training", "other_athletic", "non_athletic"]
  }).notNull(),
  sportId: varchar("sport_id").references(() => sports.id),
  
  // Injury Classification
  injuryType: text("injury_type", {
    enum: ["acute", "chronic", "overuse", "reinjury", "illness"]
  }).notNull(),
  bodyPart: text("body_part", {
    enum: ["head", "neck", "shoulder", "arm", "elbow", "wrist", "hand", "back", "chest", "abdomen", "hip", "thigh", "knee", "shin", "ankle", "foot", "other"]
  }).notNull(),
  specificDiagnosis: varchar("specific_diagnosis").notNull(),
  injurySeverity: text("injury_severity", {
    enum: ["minor", "moderate", "severe", "catastrophic"]
  }).notNull(),
  
  // Mechanism and Environment
  mechanismOfInjury: text("mechanism_of_injury"),
  environmentalFactors: jsonb("environmental_factors").$type<{
    weather?: string;
    temperature?: number;
    surfaceType?: string;
    equipmentInvolved?: string[];
    timeOfDay?: string;
  }>(),
  
  // Initial Assessment
  initialAssessment: text("initial_assessment").notNull(),
  vitals: jsonb("vitals").$type<{
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
  }>(),
  
  // Treatment and Return to Play
  immediateCarePlan: text("immediate_care_plan").notNull(),
  referralNeeded: boolean("referral_needed").default(false),
  referralTo: varchar("referral_to"),
  referralDate: date("referral_date"),
  
  estimatedReturnDate: date("estimated_return_date"),
  actualReturnDate: date("actual_return_date"),
  returnToPLayClearance: jsonb("return_to_play_clearance").$type<{
    clearedBy: string;
    clearanceDate: string;
    restrictions?: string[];
    followUpRequired?: boolean;
  }>(),
  
  // Documentation
  incidentPhotos: jsonb("incident_photos").$type<string[]>().default([]),
  witnessStatements: text("witness_statements"),
  parentNotificationDate: timestamp("parent_notification_date"),
  insuranceNotified: boolean("insurance_notified").default(false),
  
  // Status Tracking
  caseStatus: text("case_status", {
    enum: ["active", "monitoring", "cleared", "referred", "chronic_management"]
  }).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Injury Follow-ups - Tracking recovery progress
export const injuryFollowUps = pgTable("injury_follow_ups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  injuryIncidentId: varchar("injury_incident_id").notNull().references(() => injuryIncidents.id),
  athleticTrainerId: varchar("athletic_trainer_id").notNull().references(() => users.id),
  followUpDate: date("follow_up_date").notNull(),
  
  // Progress Assessment
  painLevel: integer("pain_level"), // 0-10 scale
  rangeOfMotion: jsonb("range_of_motion").$type<{
    measurement: string;
    currentValue: number;
    targetValue: number;
    improvementFromLast?: number;
  }[]>(),
  functionalTests: jsonb("functional_tests").$type<{
    testName: string;
    result: "pass" | "fail" | "partial";
    notes?: string;
  }[]>(),
  
  // Treatment Progress
  treatmentCompliance: text("treatment_compliance", {
    enum: ["excellent", "good", "fair", "poor"]
  }),
  currentTreatments: jsonb("current_treatments").$type<string[]>(),
  modificationsNeeded: text("modifications_needed"),
  
  // Return to Play Assessment
  activityLevel: text("activity_level", {
    enum: ["complete_rest", "light_activity", "modified_practice", "full_practice", "game_ready"]
  }),
  returnToPlayProgression: jsonb("return_to_play_progression").$type<{
    currentPhase: number;
    totalPhases: number;
    phaseDescription: string;
    nextPhaseTarget: string;
  }>(),
  
  clinicalNotes: text("clinical_notes").notNull(),
  nextFollowUpDate: date("next_follow_up_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Risk Assessments - Proactive injury prevention
export const healthRiskAssessments = pgTable("health_risk_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id),
  athleticTrainerId: varchar("athletic_trainer_id").notNull().references(() => users.id),
  assessmentDate: date("assessment_date").notNull(),
  assessmentType: text("assessment_type", {
    enum: ["preseason", "mid_season", "postseason", "post_injury", "annual", "targeted"]
  }).notNull(),
  
  // Risk Factor Analysis
  injuryHistory: jsonb("injury_history").$type<{
    previousInjuries: Array<{
      injuryType: string;
      date: string;
      severity: string;
      fullyRecovered: boolean;
    }>;
    familyHistory: string[];
    surgicalHistory: string[];
  }>(),
  
  movementScreen: jsonb("movement_screen").$type<{
    deepSquat: number;
    hurdleStep: number;
    inlineLunge: number;
    shoulderMobility: number;
    legRaise: number;
    trunkStability: number;
    rotaryStability: number;
    totalScore: number;
    highRiskPatterns: string[];
  }>(),
  
  strengthAssessment: jsonb("strength_assessment").$type<{
    coreStrength: number;
    legStrength: number;
    shoulderStrength: number;
    balanceScore: number;
    asymmetries: string[];
  }>(),
  
  // AI-Powered Risk Analysis
  riskFactors: jsonb("risk_factors").$type<{
    factorName: string;
    severity: "low" | "moderate" | "high" | "critical";
    description: string;
    recommendedInterventions: string[];
  }[]>(),
  
  overallRiskScore: integer("overall_risk_score"), // 0-100
  aiPredictionModel: varchar("ai_prediction_model"), // Which AI model version used
  
  // Recommendations
  recommendedInterventions: jsonb("recommended_interventions").$type<{
    interventionType: string;
    priority: "immediate" | "high" | "medium" | "low";
    description: string;
    targetDate: string;
    assignedTo?: string;
  }[]>(),
  
  followUpSchedule: jsonb("follow_up_schedule").$type<{
    frequency: string;
    nextAssessmentDate: string;
    focusAreas: string[];
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical Clearance Consents - Cross-database verification bridge for tournament participation
// This table lives in the District DB but enables safe verification queries from Tournament DB
export const medicalClearanceConsents = pgTable("medical_clearance_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Student Identity (District DB)
  athleteId: varchar("athlete_id").notNull().references(() => athletes.id),
  studentFirstName: varchar("student_first_name").notNull(),
  studentLastName: varchar("student_last_name").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  
  // Parent/Guardian Authorization
  parentGuardianName: varchar("parent_guardian_name").notNull(),
  parentEmail: varchar("parent_email").notNull(),
  parentPhone: varchar("parent_phone"),
  consentGrantedDate: timestamp("consent_granted_date").notNull().defaultNow(),
  consentExpiresDate: date("consent_expires_date"), // Typically end of school year or season
  
  // Clearance Status (verification only - no detailed health info)
  isMedicallyCleared: boolean("is_medically_cleared").default(false),
  clearanceDate: date("clearance_date"),
  clearanceExpiresDate: date("clearance_expires_date"),
  clearanceVerifiedBy: varchar("clearance_verified_by").references(() => users.id), // Athletic trainer who verified
  
  // Tournament Registration Context
  // These are soft references - tournament data lives in separate DATABASE_URL_TOURNAMENT
  authorizedTournamentIds: jsonb("authorized_tournament_ids").$type<string[]>().default([]), // Specific tournaments parent approved
  authorizeAllTournaments: boolean("authorize_all_tournaments").default(false), // Blanket consent for all tournaments
  
  // Restrictions and Special Considerations (minimal info for safety)
  hasActivityRestrictions: boolean("has_activity_restrictions").default(false),
  restrictionSummary: text("restriction_summary"), // Brief summary only (e.g., "No contact sports", "Requires breaks")
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  
  // Consent Management
  consentRevoked: boolean("consent_revoked").default(false),
  revokedDate: timestamp("revoked_date"),
  revokedReason: text("revoked_reason"),
  
  // Audit Trail
  createdBy: varchar("created_by").references(() => users.id), // Who initiated consent (athletic trainer, coach)
  lastVerificationDate: timestamp("last_verification_date"), // Last time clearance status was checked
  verificationCount: integer("verification_count").default(0), // How many times status was queried
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_clearance_athlete").on(table.athleteId),
  index("idx_clearance_parent_email").on(table.parentEmail),
  index("idx_clearance_status").on(table.isMedicallyCleared),
  index("idx_clearance_expires").on(table.clearanceExpiresDate),
]);

// =============================================================================
// ACADEMIC COMPETITIONS FRAMEWORK (UIL EVENTS)
// =============================================================================

// Academic Events - Master catalog of UIL and other academic competitions
export const academicEvents = pgTable("academic_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventName: varchar("event_name").notNull(),
  eventCategory: text("event_category", {
    enum: ["uil_academic", "speech_debate", "fine_arts", "stem_competition", "other_academic"]
  }).notNull(),
  competitionType: text("competition_type", {
    enum: ["individual", "team", "duo", "group"]
  }).notNull(),
  gradeEligibility: jsonb("grade_eligibility").$type<number[]>(), // [9,10,11,12]
  maxParticipants: integer("max_participants"),
  teamSize: integer("team_size"), // For team events
  
  // Competition Details
  description: text("description"),
  preparationTime: varchar("preparation_time"), // "3 months", "ongoing"
  materialsList: jsonb("materials_list").$type<string[]>(),
  judgeCount: integer("judge_count"),
  
  // Scoring System
  scoringMethod: text("scoring_method", {
    enum: ["points", "ranking", "time", "accuracy", "rubric", "elimination"]
  }).notNull(),
  maxScore: integer("max_score"),
  passingScore: integer("passing_score"),
  advancementCriteria: text("advancement_criteria"),
  
  // Official Information
  uilEventCode: varchar("uil_event_code"), // Official UIL code if applicable
  officialRules: text("official_rules"),
  equipmentRequired: jsonb("equipment_required").$type<string[]>(),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Competitions - Specific competition instances
export const academicCompetitions = pgTable("academic_competitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionName: varchar("competition_name").notNull(),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  competitionLevel: text("competition_level", {
    enum: ["district", "regional", "state", "national", "invitational", "practice"]
  }).notNull(),
  
  // Date and Location
  competitionDate: timestamp("competition_date").notNull(),
  registrationDeadline: date("registration_deadline"),
  location: varchar("location").notNull(),
  hostSchoolId: varchar("host_school_id").references(() => schools.id),
  
  // Events Offered
  events: jsonb("events").$type<Array<{
    eventId: string;
    divisions: string[];
    maxEntries: number;
    entryFee: number;
    currentEntries: number;
  }>>(),
  
  // Competition Status
  competitionStatus: text("competition_status", {
    enum: ["planning", "registration_open", "registration_closed", "in_progress", "completed", "cancelled"]
  }).default("planning"),
  
  // Results and Advancement
  resultsPublished: boolean("results_published").default(false),
  advancementLevel: varchar("advancement_level"), // Where winners advance to
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Participants - Students competing in academic events
export const academicParticipants = pgTable("academic_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => academicCompetitions.id),
  athleteId: varchar("athlete_id").references(() => athletes.id), // Link to athlete if they exist
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  coachId: varchar("coach_id").references(() => users.id),
  
  // Participant Details (if not linked to athlete)
  participantName: varchar("participant_name").notNull(),
  grade: integer("grade").notNull(),
  division: varchar("division"),
  
  // Event Registrations
  registeredEvents: jsonb("registered_events").$type<Array<{
    eventId: string;
    registrationStatus: "pending" | "confirmed" | "withdrawn";
    seedRank?: number;
  }>>(),
  
  // Competition Performance
  overallPlacement: integer("overall_placement"),
  totalPoints: decimal("total_points", { precision: 8, scale: 2 }),
  qualifiedForAdvancement: boolean("qualified_for_advancement").default(false),
  advancementDetails: jsonb("advancement_details").$type<{
    nextCompetitionLevel: string;
    qualificationDate: string;
    events: string[];
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Results - Individual event results
export const academicResults = pgTable("academic_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => academicCompetitions.id),
  participantId: varchar("participant_id").notNull().references(() => academicParticipants.id),
  eventId: varchar("event_id").notNull().references(() => academicEvents.id),
  
  // Result Details
  placement: integer("placement"), // 1st, 2nd, 3rd, etc.
  score: decimal("score", { precision: 10, scale: 2 }),
  maxPossibleScore: decimal("max_possible_score", { precision: 10, scale: 2 }),
  percentageScore: decimal("percentage_score", { precision: 5, scale: 2 }),
  
  // Performance Breakdown
  performanceBreakdown: jsonb("performance_breakdown").$type<{
    category: string;
    pointsEarned: number;
    pointsPossible: number;
    notes?: string;
  }[]>(),
  
  // Recognition and Advancement
  medal: text("medal", { enum: ["gold", "silver", "bronze", "participation", "none"] }),
  qualifiesForAdvancement: boolean("qualifies_for_advancement").default(false),
  specialRecognition: varchar("special_recognition"),
  
  // Judge Feedback
  judgeFeedback: text("judge_feedback"),
  areasOfStrength: jsonb("areas_of_strength").$type<string[]>(),
  areasForImprovement: jsonb("areas_for_improvement").$type<string[]>(),
  
  resultTimestamp: timestamp("result_timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Academic Districts - UIL district organization
export const academicDistricts = pgTable("academic_districts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtName: varchar("district_name").notNull(),
  districtNumber: varchar("district_number").notNull(),
  region: varchar("region").notNull(), // UIL region
  classification: varchar("classification").notNull(), // 1A, 2A, 3A, 4A, 5A, 6A
  districtDirector: varchar("district_director").references(() => users.id),
  
  // Geographic Info
  state: varchar("state").default("TX"),
  counties: jsonb("counties").$type<string[]>(),
  
  // Contact Information
  directorEmail: varchar("director_email"),
  directorPhone: varchar("director_phone"),
  
  // Academic Competition Details
  competitionDates: jsonb("competition_dates").$type<{
    district: string;
    regional: string;
    state: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Meets - Specific competition events
export const academicMeets = pgTable("academic_meets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetName: varchar("meet_name").notNull(),
  districtId: varchar("district_id").references(() => academicDistricts.id),
  hostSchoolId: varchar("host_school_id").references(() => schools.id),
  
  // Meet Details
  meetType: text("meet_type", {
    enum: ["district", "regional", "state", "invitational", "practice"]
  }).notNull(),
  meetDate: date("meet_date").notNull(),
  registrationDeadline: date("registration_deadline"),
  
  // Location
  venue: varchar("venue"),
  address: text("address"),
  
  // Competition Configuration
  eventsOffered: jsonb("events_offered").$type<string[]>(),
  divisions: jsonb("divisions").$type<string[]>(), // A+, High School
  teamLimit: integer("team_limit"),
  participantLimit: integer("participant_limit"),
  
  // Meet Status
  status: text("status", {
    enum: ["planning", "registration_open", "registration_closed", "in_progress", "completed", "cancelled"]
  }).default("planning"),
  
  // Results
  resultsPublished: boolean("results_published").default(false),
  resultsUrl: varchar("results_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School Academic Programs - School's academic competition programs
export const schoolAcademicPrograms = pgTable("school_academic_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  academicCoachId: varchar("academic_coach_id").references(() => users.id),
  
  // Program Details
  programName: varchar("program_name").default("Academic Team"),
  eventsOffered: jsonb("events_offered").$type<string[]>(),
  divisions: jsonb("divisions").$type<string[]>(), // A+, High School
  
  // Participation Info
  currentParticipants: integer("current_participants").default(0),
  maxParticipants: integer("max_participants"),
  
  // Competition History
  districtWins: integer("district_wins").default(0),
  regionalWins: integer("regional_wins").default(0),
  stateWins: integer("state_wins").default(0),
  
  // Program Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Teams - Team entries for competitions
export const academicTeams = pgTable("academic_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  meetId: varchar("meet_id").notNull().references(() => academicMeets.id),
  coachId: varchar("coach_id").references(() => users.id),
  
  // Team Details
  teamName: varchar("team_name"), // e.g., "Varsity", "JV", "A+"
  division: varchar("division").notNull(), // A+, High School
  
  // Team Members
  teamMembers: jsonb("team_members").$type<Array<{
    participantId: string;
    events: string[];
    captain?: boolean;
  }>>(),
  
  // Team Results
  teamPlacement: integer("team_placement"),
  totalPoints: integer("total_points").default(0),
  sweepstakes: boolean("sweepstakes").default(false),
  
  // Registration
  registrationStatus: text("registration_status", {
    enum: ["pending", "confirmed", "waitlisted", "withdrawn"]
  }).default("pending"),
  registrationDate: timestamp("registration_date").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Officials - Judges and administrators
export const academicOfficials = pgTable("academic_officials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  
  // Official Details
  officialType: text("official_type", {
    enum: ["judge", "grader", "director", "coordinator", "timekeeper"]
  }).notNull(),
  
  // Certification
  certified: boolean("certified").default(false),
  certificationLevel: varchar("certification_level"), // UIL certification level
  certificationExpiry: date("certification_expiry"),
  
  // Specializations
  eventsQualified: jsonb("events_qualified").$type<string[]>(),
  preferredEvents: jsonb("preferred_events").$type<string[]>(),
  
  // Experience
  yearsExperience: integer("years_experience").default(0),
  meetsConducted: integer("meets_conducted").default(0),
  
  // Availability
  available: boolean("available").default(true),
  
  // Contact
  phoneNumber: varchar("phone_number"),
  emergencyContact: varchar("emergency_contact"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// =============================================================================
// BUDGET MANAGEMENT SYSTEM
// =============================================================================

// District Budgets - Top-level district athletic funding
export const districtBudgets = pgTable("district_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").notNull().references(() => districts.id),
  fiscalYear: varchar("fiscal_year").notNull(), // "2024-2025"
  budgetType: text("budget_type", {
    enum: ["athletics", "academics", "fine_arts", "facilities", "transportation", "general"]
  }).notNull(),
  
  // Budget Amounts
  totalBudgetAllocated: decimal("total_budget_allocated", { precision: 12, scale: 2 }).notNull(),
  totalBudgetSpent: decimal("total_budget_spent", { precision: 12, scale: 2 }).default("0"),
  totalBudgetRemaining: decimal("total_budget_remaining", { precision: 12, scale: 2 }).default("0"),
  
  // Approval and Status
  budgetStatus: text("budget_status", {
    enum: ["draft", "proposed", "approved", "active", "closed"]
  }).default("draft"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvalDate: date("approval_date"),
  
  // Budget Categories Breakdown
  categoryBreakdown: jsonb("category_breakdown").$type<{
    categoryName: string;
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
  }[]>().default([]),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School Department Budgets - School-level budget allocations
export const schoolDepartmentBudgets = pgTable("school_department_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  districtBudgetId: varchar("district_budget_id").references(() => districtBudgets.id),
  departmentType: text("department_type", {
    enum: ["athletics", "band", "choir", "theatre", "academics", "facilities", "general"]
  }).notNull(),
  fiscalYear: varchar("fiscal_year").notNull(),
  
  // Allocated Amounts
  budgetAllocated: decimal("budget_allocated", { precision: 10, scale: 2 }).notNull(),
  budgetSpent: decimal("budget_spent", { precision: 10, scale: 2 }).default("0"),
  budgetRemaining: decimal("budget_remaining", { precision: 10, scale: 2 }).default("0"),
  
  // Department Leadership
  departmentHeadId: varchar("department_head_id").references(() => users.id),
  budgetManagerId: varchar("budget_manager_id").references(() => users.id),
  
  // Spending Controls
  spendingLimits: jsonb("spending_limits").$type<{
    maxSinglePurchase: number;
    requiresApprovalOver: number;
    monthlySpendingLimit: number;
  }>(),
  
  budgetStatus: text("budget_status", {
    enum: ["active", "frozen", "overspent", "closed"]
  }).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sport Program Budgets - Individual sport budget allocations
export const sportProgramBudgets = pgTable("sport_program_budgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolSportsProgramId: varchar("school_sports_program_id").notNull().references(() => schoolSportsPrograms.id),
  schoolDepartmentBudgetId: varchar("school_department_budget_id").references(() => schoolDepartmentBudgets.id),
  fiscalYear: varchar("fiscal_year").notNull(),
  
  // Budget Allocation
  totalAllocated: decimal("total_allocated", { precision: 10, scale: 2 }).notNull(),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  totalRemaining: decimal("total_remaining", { precision: 10, scale: 2 }).default("0"),
  
  // Budget Categories
  equipmentBudget: decimal("equipment_budget", { precision: 8, scale: 2 }).default("0"),
  uniformsBudget: decimal("uniforms_budget", { precision: 8, scale: 2 }).default("0"),
  travelBudget: decimal("travel_budget", { precision: 8, scale: 2 }).default("0"),
  facilitiesBudget: decimal("facilities_budget", { precision: 8, scale: 2 }).default("0"),
  officiatingBudget: decimal("officiating_budget", { precision: 8, scale: 2 }).default("0"),
  medicalBudget: decimal("medical_budget", { precision: 8, scale: 2 }).default("0"),
  miscellaneousBudget: decimal("miscellaneous_budget", { precision: 8, scale: 2 }).default("0"),
  
  // Spending Tracking
  equipmentSpent: decimal("equipment_spent", { precision: 8, scale: 2 }).default("0"),
  uniformsSpent: decimal("uniforms_spent", { precision: 8, scale: 2 }).default("0"),
  travelSpent: decimal("travel_spent", { precision: 8, scale: 2 }).default("0"),
  facilitiesSpent: decimal("facilities_spent", { precision: 8, scale: 2 }).default("0"),
  officiatingSpent: decimal("officiating_spent", { precision: 8, scale: 2 }).default("0"),
  medicalSpent: decimal("medical_spent", { precision: 8, scale: 2 }).default("0"),
  miscellaneousSpent: decimal("miscellaneous_spent", { precision: 8, scale: 2 }).default("0"),
  
  budgetManagerId: varchar("budget_manager_id").references(() => users.id), // Usually head coach
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expense Records - Individual purchases and expenses
export const expenseRecords = pgTable("expense_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportProgramBudgetId: varchar("sport_program_budget_id").references(() => sportProgramBudgets.id),
  schoolDepartmentBudgetId: varchar("school_department_budget_id").references(() => schoolDepartmentBudgets.id),
  
  // Purchase Details
  expenseDate: date("expense_date").notNull(),
  vendor: varchar("vendor").notNull(),
  description: text("description").notNull(),
  expenseCategory: text("expense_category", {
    enum: ["equipment", "uniforms", "travel", "facilities", "officiating", "medical", "miscellaneous"]
  }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Approval Workflow
  requestedBy: varchar("requested_by").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvalStatus: text("approval_status", {
    enum: ["pending", "approved", "rejected", "paid"]
  }).default("pending"),
  approvalDate: date("approval_date"),
  
  // Payment Information
  paymentMethod: text("payment_method", {
    enum: ["check", "credit_card", "purchase_order", "petty_cash", "reimbursement"]
  }),
  purchaseOrderNumber: varchar("purchase_order_number"),
  invoiceNumber: varchar("invoice_number"),
  receiptAttached: boolean("receipt_attached").default(false),
  
  // Tracking
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: varchar("recurring_frequency"), // "monthly", "quarterly", etc.
  taxAmount: decimal("tax_amount", { precision: 8, scale: 2 }).default("0"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Budget Transfers - Moving money between categories/programs
export const budgetTransfers = pgTable("budget_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromBudgetType: text("from_budget_type", {
    enum: ["district", "school_department", "sport_program"]
  }).notNull(),
  fromBudgetId: varchar("from_budget_id").notNull(),
  toBudgetType: text("to_budget_type", {
    enum: ["district", "school_department", "sport_program"]
  }).notNull(),
  toBudgetId: varchar("to_budget_id").notNull(),
  
  transferAmount: decimal("transfer_amount", { precision: 10, scale: 2 }).notNull(),
  transferReason: text("transfer_reason").notNull(),
  
  requestedBy: varchar("requested_by").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  transferStatus: text("transfer_status", {
    enum: ["pending", "approved", "rejected", "completed"]
  }).default("pending"),
  
  transferDate: date("transfer_date"),
  fiscalYear: varchar("fiscal_year").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// =============================================================================
// COMPREHENSIVE EXCEL-STYLE BUDGET MANAGEMENT SYSTEM
// =============================================================================

// Budget Categories - Department/program categories for organization
export const budgetCategories = pgTable("budget_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").notNull().references(() => districts.id),
  categoryName: varchar("category_name").notNull(), // "Athletics", "Academics", "Operations", "Facilities"
  categoryCode: varchar("category_code").notNull(), // "ATH", "ACD", "OPS", "FAC"
  categoryType: text("category_type", {
    enum: ["athletics", "academics", "fine_arts", "operations", "facilities", "transportation", "technology", "general"]
  }).notNull(),
  description: text("description"),
  parentCategoryId: varchar("parent_category_id"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  
  // Excel-style formatting options
  backgroundColor: varchar("background_color").default("#ffffff"),
  textColor: varchar("text_color").default("#000000"),
  fontWeight: varchar("font_weight").default("normal"),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_budget_categories_district").on(table.districtId),
  index("idx_budget_categories_type").on(table.categoryType)
]);

// Budget Items - Individual line items within categories
export const budgetItems = pgTable("budget_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => budgetCategories.id),
  itemName: varchar("item_name").notNull(), // "Coaching Salaries", "Equipment", "Travel"
  itemCode: varchar("item_code").notNull(), // "SAL001", "EQP001", "TRV001"
  description: text("description"),
  
  // Item specifications
  itemType: text("item_type", {
    enum: ["salary", "equipment", "supplies", "travel", "facility_rental", "officials", "insurance", "utilities", "maintenance", "other"]
  }).notNull(),
  
  // Excel-style properties
  formula: text("formula"), // Excel-style formulas like "=SUM(B2:B10)"
  isCalculated: boolean("is_calculated").default(false),
  displayOrder: integer("display_order").default(0),
  isEditable: boolean("is_editable").default(true),
  isRequired: boolean("is_required").default(false),
  
  // Validation rules
  minValue: decimal("min_value", { precision: 12, scale: 2 }),
  maxValue: decimal("max_value", { precision: 12, scale: 2 }),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_budget_items_category").on(table.categoryId),
  index("idx_budget_items_type").on(table.itemType)
]);

// Budget Allocations - Budget assignments to schools/departments with Excel-style data
export const budgetAllocations = pgTable("budget_allocations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  budgetItemId: varchar("budget_item_id").notNull().references(() => budgetItems.id),
  schoolId: varchar("school_id").references(() => schools.id),
  departmentId: varchar("department_id"), // Generic department reference
  
  // Fiscal information
  fiscalYear: varchar("fiscal_year").notNull(), // "2024-2025"
  
  // Budget allocation amounts
  originalBudget: decimal("original_budget", { precision: 12, scale: 2 }).notNull(),
  revisedBudget: decimal("revised_budget", { precision: 12, scale: 2 }),
  currentBudget: decimal("current_budget", { precision: 12, scale: 2 }).notNull(),
  encumbered: decimal("encumbered", { precision: 12, scale: 2 }).default("0"),
  actualSpent: decimal("actual_spent", { precision: 12, scale: 2 }).default("0"),
  remainingBalance: decimal("remaining_balance", { precision: 12, scale: 2 }),
  
  // Percentage calculations (Excel-style)
  percentUsed: decimal("percent_used", { precision: 5, scale: 2 }).default("0"), // 0.00 to 100.00
  percentRemaining: decimal("percent_remaining", { precision: 5, scale: 2 }).default("100"),
  
  // Status and approvals
  allocationStatus: text("allocation_status", {
    enum: ["draft", "pending_approval", "approved", "active", "frozen", "closed"]
  }).default("draft"),
  
  // Quarterly projections for cash flow
  q1Projection: decimal("q1_projection", { precision: 12, scale: 2 }).default("0"),
  q2Projection: decimal("q2_projection", { precision: 12, scale: 2 }).default("0"),
  q3Projection: decimal("q3_projection", { precision: 12, scale: 2 }).default("0"),
  q4Projection: decimal("q4_projection", { precision: 12, scale: 2 }).default("0"),
  
  // Notes and tracking
  notes: text("notes"),
  lastRecalculated: timestamp("last_recalculated").defaultNow(),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_budget_allocations_item").on(table.budgetItemId),
  index("idx_budget_allocations_school").on(table.schoolId),
  index("idx_budget_allocations_fiscal_year").on(table.fiscalYear),
  index("idx_budget_allocations_status").on(table.allocationStatus)
]);

// Budget Transactions - Enhanced spending tracking and expense records
export const budgetTransactions = pgTable("budget_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  allocationId: varchar("allocation_id").notNull().references(() => budgetAllocations.id),
  
  // Transaction details
  transactionDate: date("transaction_date").notNull(),
  transactionType: text("transaction_type", {
    enum: ["expense", "encumbrance", "revenue", "transfer_in", "transfer_out", "adjustment"]
  }).notNull(),
  
  // Financial amounts
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  runningBalance: decimal("running_balance", { precision: 12, scale: 2 }),
  
  // Transaction details
  vendor: varchar("vendor"),
  description: text("description").notNull(),
  referenceNumber: varchar("reference_number"), // PO number, check number, etc.
  invoiceNumber: varchar("invoice_number"),
  
  // Approval workflow
  approvalStatus: text("approval_status", {
    enum: ["pending", "approved", "rejected", "paid", "cancelled"]
  }).default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  approvalNotes: text("approval_notes"),
  
  // Payment tracking
  paymentMethod: text("payment_method", {
    enum: ["check", "credit_card", "ach", "wire_transfer", "purchase_order", "petty_cash"]
  }),
  paymentDate: date("payment_date"),
  checkNumber: varchar("check_number"),
  
  // Categorization and tracking
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: text("recurring_frequency", {
    enum: ["weekly", "biweekly", "monthly", "quarterly", "annually"]
  }),
  nextRecurringDate: date("next_recurring_date"),
  
  // Audit trail
  attachmentUrls: jsonb("attachment_urls").$type<string[]>().default([]),
  auditNotes: text("audit_notes"),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_budget_transactions_allocation").on(table.allocationId),
  index("idx_budget_transactions_date").on(table.transactionDate),
  index("idx_budget_transactions_type").on(table.transactionType),
  index("idx_budget_transactions_status").on(table.approvalStatus)
]);

// Budget Approvals - Approval workflow tracking
export const budgetApprovals = pgTable("budget_approvals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // What is being approved
  approvalType: text("approval_type", {
    enum: ["budget_allocation", "budget_transaction", "budget_transfer", "budget_revision"]
  }).notNull(),
  relatedEntityId: varchar("related_entity_id").notNull(), // ID of allocation, transaction, etc.
  
  // Approval workflow
  currentStep: integer("current_step").default(1),
  totalSteps: integer("total_steps").default(1),
  workflowStatus: text("workflow_status", {
    enum: ["pending", "in_review", "approved", "rejected", "cancelled"]
  }).default("pending"),
  
  // Current approver
  currentApproverId: varchar("current_approver_id").references(() => users.id),
  approverRole: text("approver_role", {
    enum: ["department_head", "principal", "superintendent", "school_board", "business_manager", "district_controller"]
  }),
  
  // Approval details
  requestedAmount: decimal("requested_amount", { precision: 12, scale: 2 }).notNull(),
  approvedAmount: decimal("approved_amount", { precision: 12, scale: 2 }),
  
  // Timeline
  submittedAt: timestamp("submitted_at").defaultNow(),
  dueDate: date("due_date"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  
  // Communications
  requestNotes: text("request_notes"),
  approvalNotes: text("approval_notes"),
  rejectionReason: text("rejection_reason"),
  
  // Audit trail
  approvalHistory: jsonb("approval_history").$type<{
    step: number;
    approverId: string;
    action: 'approved' | 'rejected' | 'delegated';
    timestamp: string;
    notes?: string;
  }[]>().default([]),
  
  submittedBy: varchar("submitted_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_budget_approvals_type").on(table.approvalType),
  index("idx_budget_approvals_entity").on(table.relatedEntityId),
  index("idx_budget_approvals_status").on(table.workflowStatus),
  index("idx_budget_approvals_approver").on(table.currentApproverId)
]);

// Budget Templates - Pre-built templates for different organization types
export const budgetTemplates = pgTable("budget_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: varchar("template_name").notNull(),
  description: text("description"),
  
  // Template metadata
  organizationType: text("organization_type", {
    enum: ["elementary_school", "middle_school", "high_school", "district_office", "athletic_department"]
  }).notNull(),
  
  // Template structure (Excel-like layout)
  templateStructure: jsonb("template_structure").$type<{
    categories: {
      id: string;
      name: string;
      items: {
        id: string;
        name: string;
        type: string;
        formula?: string;
        defaultAmount?: number;
      }[];
    }[];
  }>(),
  
  // Usage and sharing
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_budget_templates_type").on(table.organizationType),
  index("idx_budget_templates_public").on(table.isPublic)
]);

// =============================================================================
// COMPREHENSIVE SCHEDULING SYSTEM
// =============================================================================

// Games/Matches - Athletic competition scheduling
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

// Practice Sessions - Team practice scheduling
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

// Facility Reservations - Venue booking system
export const facilityReservations = pgTable("facility_reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  venueId: varchar("venue_id").notNull().references(() => athleticVenues.id),
  schoolId: varchar("school_id").notNull().references(() => schools.id),
  requestedBy: varchar("requested_by").notNull().references(() => users.id),
  
  // Reservation Details
  reservationDate: date("reservation_date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  duration: integer("duration"), // minutes
  
  // Usage Information
  usageType: text("usage_type", {
    enum: ["practice", "game", "meeting", "event", "tournament", "maintenance", "other"]
  }).notNull(),
  schoolSportsProgramId: varchar("school_sports_program_id").references(() => schoolSportsPrograms.id),
  gameId: varchar("game_id").references(() => games.id),
  practiceId: varchar("practice_id").references(() => practices.id),
  
  // Approval and Status
  reservationStatus: text("reservation_status", {
    enum: ["pending", "approved", "denied", "confirmed", "completed", "cancelled"]
  }).default("pending"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvalDate: timestamp("approval_date"),
  
  // Facility Setup
  setupRequired: jsonb("setup_required").$type<{
    equipment: string[];
    specialArrangements: string;
    custodialNeeds: string[];
  }>(),
  estimatedAttendance: integer("estimated_attendance"),
  
  // Conflict Detection
  conflictsWith: jsonb("conflicts_with").$type<string[]>().default([]), // Other reservation IDs
  conflictResolution: text("conflict_resolution"),
  
  // Costs and Fees
  facilityCost: decimal("facility_cost", { precision: 8, scale: 2 }).default("0"),
  custodialCost: decimal("custodial_cost", { precision: 8, scale: 2 }).default("0"),
  securityCost: decimal("security_cost", { precision: 8, scale: 2 }).default("0"),
  
  // Notes
  specialRequests: text("special_requests"),
  reservationNotes: text("reservation_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Athletic Calendar Events - Comprehensive calendar system
export const athleticCalendarEvents = pgTable("athletic_calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").references(() => districts.id),
  schoolId: varchar("school_id").references(() => schools.id),
  seasonId: varchar("season_id").references(() => athleticSeasons.id),
  
  // Event Details
  eventTitle: varchar("event_title").notNull(),
  eventType: text("event_type", {
    enum: ["game", "practice", "meeting", "tournament", "academic_competition", "deadline", "training", "other", "banquet", "fundraiser", "awards", "community"]
  }).notNull(),
  eventDate: date("event_date").notNull(),
  startTime: varchar("start_time"),
  endTime: varchar("end_time"),
  allDay: boolean("all_day").default(false),
  
  // Related Records
  gameId: varchar("game_id").references(() => games.id),
  practiceId: varchar("practice_id").references(() => practices.id),
  academicCompetitionId: varchar("academic_competition_id").references(() => academicCompetitions.id),
  
  // Visibility and Audience
  visibility: text("visibility", {
    enum: ["public", "district", "school", "team", "coaching_staff", "private"]
  }).default("school"),
  targetAudience: jsonb("target_audience").$type<string[]>().default([]), // ["athletes", "parents", "coaches", "community"]
  
  // Location and Description
  location: varchar("location"),
  description: text("description"),
  importanceLevel: text("importance_level", {
    enum: ["low", "normal", "high", "critical"]
  }).default("normal"),
  
  // Reminders and Notifications
  reminderSettings: jsonb("reminder_settings").$type<{
    sendReminder: boolean;
    reminderDays: number[];
    reminderMethods: string[];
  }>(),
  
  // Recurrence
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: varchar("recurrence_pattern"), // "weekly", "bi-weekly", etc.
  recurrenceEndDate: date("recurrence_end_date"),
  
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conflict Detection and Resolution
export const scheduleConflicts = pgTable("schedule_conflicts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conflictType: text("conflict_type", {
    enum: ["venue_double_booked", "coach_conflict", "athlete_conflict", "transportation_conflict", "official_conflict"]
  }).notNull(),
  
  // Conflicting Events
  event1Type: varchar("event1_type").notNull(), // "game", "practice", "reservation"
  event1Id: varchar("event1_id").notNull(),
  event2Type: varchar("event2_type").notNull(),
  event2Id: varchar("event2_id").notNull(),
  
  // Conflict Details
  conflictDate: date("conflict_date").notNull(),
  conflictTimeStart: varchar("conflict_time_start"),
  conflictTimeEnd: varchar("conflict_time_end"),
  severity: text("severity", {
    enum: ["minor", "major", "critical"]
  }).default("minor"),
  
  // Resolution
  conflictStatus: text("conflict_status", {
    enum: ["detected", "acknowledged", "resolving", "resolved", "unresolvable"]
  }).default("detected"),
  resolutionMethod: text("resolution_method"),
  resolutionNotes: text("resolution_notes"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  
  detectedAt: timestamp("detected_at").defaultNow(),
});

// =============================================================================
// FLEXIBLE TOURNAMENT CONFIGURATION SYSTEM
// =============================================================================

// Tournament Configuration Types - replaces sport-specific constraints
export const tournamentConfigSchema = z.object({
  meta: z.object({
    name: z.string(),
    participantType: z.enum(['team', 'individual']),
    participantCount: z.number().optional(),
    teamSize: z.number().optional(),
  }),
  divisions: z.array(z.object({
    name: z.string(),
    eligibility: z.object({
      ageBand: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      gradeBand: z.object({
        min: z.number().optional(), 
        max: z.number().optional(),
      }).optional(),
      weightClassKg: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
      }).optional(),
      openText: z.string().optional(),
    }),
    genderPolicy: z.enum(['male', 'female', 'mixed', 'coed', 'open']),
  })),
  stages: z.array(z.discriminatedUnion('engine', [
    z.object({
      engine: z.literal('single'),
      size: z.number(),
      thirdPlace: z.boolean().optional(),
    }),
    z.object({
      engine: z.literal('double'),
      size: z.number(),
      finals: z.enum(['single', 'best_of_n', 'if_necessary']),
      minGamesGuaranteed: z.number().optional(),
    }),
    z.object({
      engine: z.literal('round_robin'),
      groups: z.number(),
      groupSize: z.number().optional(),
      points: z.object({
        win: z.number(),
        draw: z.number().optional(),
        loss: z.number().optional(),
      }),
      tiebreakers: z.array(z.string()),
    }),
    z.object({
      engine: z.literal('swiss'),
      rounds: z.number(),
      pairing: z.enum(['seed', 'elo', 'random']),
      tiebreakers: z.array(z.string()),
    }),
    z.object({
      engine: z.literal('leaderboard'),
      events: z.array(z.object({
        templateId: z.string().optional(),
        name: z.string().optional(),
        measureType: z.string(),
        unit: z.string(),
        maxParticipants: z.number().optional(),
      })),
    }),
  ])),
  seeding: z.object({
    method: z.enum(['manual', 'random', 'rating', 'previous_stage']),
    ratingField: z.string().optional(),
  }),
  scheduling: z.object({
    venues: z.array(z.string()).optional(),
    timeWindows: z.array(z.object({
      start: z.string(),
      end: z.string(),
    })).optional(),
    minRestMinutes: z.number().optional(),
  }).optional(),
});

// Individual types for easier use
export const divisionPolicySchema = z.object({
  name: z.string(),
  eligibility: z.object({
    ageBand: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    gradeBand: z.object({
      min: z.number().optional(), 
      max: z.number().optional(),
    }).optional(),
    weightClassKg: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    openText: z.string().optional(),
  }),
  genderPolicy: z.enum(['male', 'female', 'mixed', 'coed', 'open']),
});

export const stageConfigSchema = z.discriminatedUnion('engine', [
  z.object({
    engine: z.literal('single'),
    size: z.number(),
    thirdPlace: z.boolean().optional(),
  }),
  z.object({
    engine: z.literal('double'),
    size: z.number(),
    finals: z.enum(['single', 'best_of_n', 'if_necessary']),
    minGamesGuaranteed: z.number().optional(),
  }),
  z.object({
    engine: z.literal('round_robin'),
    groups: z.number(),
    groupSize: z.number().optional(),
    points: z.object({
      win: z.number(),
      draw: z.number().optional(),
      loss: z.number().optional(),
    }),
    tiebreakers: z.array(z.string()),
  }),
  z.object({
    engine: z.literal('swiss'),
    rounds: z.number(),
    pairing: z.enum(['seed', 'elo', 'random']),
    tiebreakers: z.array(z.string()),
  }),
  z.object({
    engine: z.literal('leaderboard'),
    events: z.array(z.object({
      templateId: z.string().optional(),
      name: z.string().optional(),
      measureType: z.string(),
      unit: z.string(),
      maxParticipants: z.number().optional(),
    })),
  }),
]);

// Export TypeScript types
export type TournamentConfig = z.infer<typeof tournamentConfigSchema>;
export type DivisionPolicy = z.infer<typeof divisionPolicySchema>;
export type StageConfig = z.infer<typeof stageConfigSchema>;

// =============================================================================
// NEW DATABASE TABLES FOR FLEXIBLE CONFIGURATION
// =============================================================================

// Event Templates - Reusable event configurations
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

// Scoring Policies - Flexible scoring rules
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add indexes for JSON path queries (will be created via database migration after tables are created)
// export const eventTemplatesIndex = index("event_templates_category_idx").on(eventTemplates.category);
// export const scoringPoliciesTypeIndex = index("scoring_policies_type_idx").on(scoringPolicies.policyType);

// Drizzle-zod schemas for the new tables
export const insertEventTemplateSchema = createInsertSchema(eventTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScoringPolicySchema = createInsertSchema(scoringPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports for new tables
export type EventTemplate = typeof eventTemplates.$inferSelect;
export type InsertEventTemplate = z.infer<typeof insertEventTemplateSchema>;
export type ScoringPolicy = typeof scoringPolicies.$inferSelect;
export type InsertScoringPolicy = z.infer<typeof insertScoringPolicySchema>;

// SPORT-SPECIFIC CONFIGURATION TABLES
// Import and re-export sport configuration tables
// =============================================================================
// ATHLETIC MANAGEMENT RELATIONS
// =============================================================================

// Sports relations
export const sportsRelations = relations(sports, ({ many }) => ({
  schoolSportsPrograms: many(schoolSportsPrograms),
  injuryIncidents: many(injuryIncidents),
}));

// Athletic Seasons relations
export const athleticSeasonsRelations = relations(athleticSeasons, ({ one, many }) => ({
  district: one(districts, {
    fields: [athleticSeasons.districtId],
    references: [districts.id],
  }),
  schoolSportsPrograms: many(schoolSportsPrograms),
  rosters: many(rosters),
  games: many(games),
  practices: many(practices),
  athleticCalendarEvents: many(athleticCalendarEvents),
}));

// School Sports Programs relations
export const schoolSportsProgramsRelations = relations(schoolSportsPrograms, ({ one, many }) => ({
  school: one(schools, {
    fields: [schoolSportsPrograms.schoolId],
    references: [schools.id],
  }),
  sport: one(sports, {
    fields: [schoolSportsPrograms.sportId],
    references: [sports.id],
  }),
  season: one(athleticSeasons, {
    fields: [schoolSportsPrograms.seasonId],
    references: [athleticSeasons.id],
  }),
  headCoach: one(users, {
    fields: [schoolSportsPrograms.headCoachId],
    references: [users.id],
  }),
  homeVenue: one(athleticVenues, {
    fields: [schoolSportsPrograms.homeVenueId],
    references: [athleticVenues.id],
  }),
  rosters: many(rosters),
  sportProgramBudgets: many(sportProgramBudgets),
  homeGames: many(games, { relationName: "homeProgram" }),
  awayGames: many(games, { relationName: "awayProgram" }),
  practices: many(practices),
  facilityReservations: many(facilityReservations),
}));

// Athletes relations
export const athletesRelations = relations(athletes, ({ one, many }) => ({
  school: one(schools, {
    fields: [athletes.schoolId],
    references: [schools.id],
  }),
  district: one(districts, {
    fields: [athletes.districtId],
    references: [districts.id],
  }),
  studentData: one(studentData, {
    fields: [athletes.studentDataId],
    references: [studentData.id],
  }),
  healthData: one(healthData, {
    fields: [athletes.healthDataId],
    references: [healthData.id],
  }),
  athleticTrainer: one(users, {
    fields: [athletes.athleticTrainerId],
    references: [users.id],
  }),
  rosters: many(rosters),
  injuryIncidents: many(injuryIncidents),
  healthRiskAssessments: many(healthRiskAssessments),
  academicParticipants: many(academicParticipants),
}));

// Rosters relations
export const rostersRelations = relations(rosters, ({ one }) => ({
  schoolSportsProgram: one(schoolSportsPrograms, {
    fields: [rosters.schoolSportsProgramId],
    references: [schoolSportsPrograms.id],
  }),
  athlete: one(athletes, {
    fields: [rosters.athleteId],
    references: [athletes.id],
  }),
  season: one(athleticSeasons, {
    fields: [rosters.seasonId],
    references: [athleticSeasons.id],
  }),
}));

// Injury Incidents relations
export const injuryIncidentsRelations = relations(injuryIncidents, ({ one, many }) => ({
  athlete: one(athletes, {
    fields: [injuryIncidents.athleteId],
    references: [athletes.id],
  }),
  school: one(schools, {
    fields: [injuryIncidents.schoolId],
    references: [schools.id],
  }),
  athleticTrainer: one(users, {
    fields: [injuryIncidents.athleticTrainerId],
    references: [users.id],
  }),
  sport: one(sports, {
    fields: [injuryIncidents.sportId],
    references: [sports.id],
  }),
  followUps: many(injuryFollowUps),
}));

// Injury Follow-ups relations
export const injuryFollowUpsRelations = relations(injuryFollowUps, ({ one }) => ({
  injuryIncident: one(injuryIncidents, {
    fields: [injuryFollowUps.injuryIncidentId],
    references: [injuryIncidents.id],
  }),
  athleticTrainer: one(users, {
    fields: [injuryFollowUps.athleticTrainerId],
    references: [users.id],
  }),
}));

// Health Risk Assessments relations
export const healthRiskAssessmentsRelations = relations(healthRiskAssessments, ({ one }) => ({
  athlete: one(athletes, {
    fields: [healthRiskAssessments.athleteId],
    references: [athletes.id],
  }),
  athleticTrainer: one(users, {
    fields: [healthRiskAssessments.athleticTrainerId],
    references: [users.id],
  }),
}));

// Academic Events relations
export const academicEventsRelations = relations(academicEvents, ({ many }) => ({
  academicResults: many(academicResults),
}));

// Academic Competitions relations
export const academicCompetitionsRelations = relations(academicCompetitions, ({ one, many }) => ({
  organizer: one(users, {
    fields: [academicCompetitions.organizerId],
    references: [users.id],
  }),
  hostSchool: one(schools, {
    fields: [academicCompetitions.hostSchoolId],
    references: [schools.id],
  }),
  participants: many(academicParticipants),
  results: many(academicResults),
  athleticCalendarEvents: many(athleticCalendarEvents),
}));

// Academic Participants relations
export const academicParticipantsRelations = relations(academicParticipants, ({ one, many }) => ({
  competition: one(academicCompetitions, {
    fields: [academicParticipants.competitionId],
    references: [academicCompetitions.id],
  }),
  athlete: one(athletes, {
    fields: [academicParticipants.athleteId],
    references: [athletes.id],
  }),
  school: one(schools, {
    fields: [academicParticipants.schoolId],
    references: [schools.id],
  }),
  coach: one(users, {
    fields: [academicParticipants.coachId],
    references: [users.id],
  }),
  results: many(academicResults),
}));

// Academic Results relations
export const academicResultsRelations = relations(academicResults, ({ one }) => ({
  competition: one(academicCompetitions, {
    fields: [academicResults.competitionId],
    references: [academicCompetitions.id],
  }),
  participant: one(academicParticipants, {
    fields: [academicResults.participantId],
    references: [academicParticipants.id],
  }),
  event: one(academicEvents, {
    fields: [academicResults.eventId],
    references: [academicEvents.id],
  }),
}));

// Budget Management Relations
export const districtBudgetsRelations = relations(districtBudgets, ({ one, many }) => ({
  district: one(districts, {
    fields: [districtBudgets.districtId],
    references: [districts.id],
  }),
  approvedBy: one(users, {
    fields: [districtBudgets.approvedBy],
    references: [users.id],
  }),
  schoolDepartmentBudgets: many(schoolDepartmentBudgets),
}));

export const schoolDepartmentBudgetsRelations = relations(schoolDepartmentBudgets, ({ one, many }) => ({
  school: one(schools, {
    fields: [schoolDepartmentBudgets.schoolId],
    references: [schools.id],
  }),
  districtBudget: one(districtBudgets, {
    fields: [schoolDepartmentBudgets.districtBudgetId],
    references: [districtBudgets.id],
  }),
  departmentHead: one(users, {
    fields: [schoolDepartmentBudgets.departmentHeadId],
    references: [users.id],
  }),
  budgetManager: one(users, {
    fields: [schoolDepartmentBudgets.budgetManagerId],
    references: [users.id],
  }),
  sportProgramBudgets: many(sportProgramBudgets),
  expenseRecords: many(expenseRecords),
}));

export const sportProgramBudgetsRelations = relations(sportProgramBudgets, ({ one, many }) => ({
  schoolSportsProgram: one(schoolSportsPrograms, {
    fields: [sportProgramBudgets.schoolSportsProgramId],
    references: [schoolSportsPrograms.id],
  }),
  schoolDepartmentBudget: one(schoolDepartmentBudgets, {
    fields: [sportProgramBudgets.schoolDepartmentBudgetId],
    references: [schoolDepartmentBudgets.id],
  }),
  budgetManager: one(users, {
    fields: [sportProgramBudgets.budgetManagerId],
    references: [users.id],
  }),
  expenseRecords: many(expenseRecords),
}));

export const expenseRecordsRelations = relations(expenseRecords, ({ one }) => ({
  sportProgramBudget: one(sportProgramBudgets, {
    fields: [expenseRecords.sportProgramBudgetId],
    references: [sportProgramBudgets.id],
  }),
  schoolDepartmentBudget: one(schoolDepartmentBudgets, {
    fields: [expenseRecords.schoolDepartmentBudgetId],
    references: [schoolDepartmentBudgets.id],
  }),
  requestedBy: one(users, {
    fields: [expenseRecords.requestedBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [expenseRecords.approvedBy],
    references: [users.id],
  }),
}));

export const budgetTransfersRelations = relations(budgetTransfers, ({ one }) => ({
  requestedBy: one(users, {
    fields: [budgetTransfers.requestedBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [budgetTransfers.approvedBy],
    references: [users.id],
  }),
}));

// Scheduling System Relations
export const gamesRelations = relations(games, ({ one, many }) => ({
  season: one(athleticSeasons, {
    fields: [games.seasonId],
    references: [athleticSeasons.id],
  }),
  homeSchoolSportsProgram: one(schoolSportsPrograms, {
    fields: [games.homeSchoolSportsProgramId],
    references: [schoolSportsPrograms.id],
    relationName: "homeProgram",
  }),
  awaySchoolSportsProgram: one(schoolSportsPrograms, {
    fields: [games.awaySchoolSportsProgramId],
    references: [schoolSportsPrograms.id],
    relationName: "awayProgram",
  }),
  venue: one(athleticVenues, {
    fields: [games.venueId],
    references: [athleticVenues.id],
  }),
  createdBy: one(users, {
    fields: [games.createdBy],
    references: [users.id],
  }),
  athleticCalendarEvents: many(athleticCalendarEvents),
  facilityReservations: many(facilityReservations),
}));

export const practicesRelations = relations(practices, ({ one, many }) => ({
  schoolSportsProgram: one(schoolSportsPrograms, {
    fields: [practices.schoolSportsProgramId],
    references: [schoolSportsPrograms.id],
  }),
  season: one(athleticSeasons, {
    fields: [practices.seasonId],
    references: [athleticSeasons.id],
  }),
  venue: one(athleticVenues, {
    fields: [practices.venueId],
    references: [athleticVenues.id],
  }),
  indoorAlternative: one(athleticVenues, {
    fields: [practices.indoorAlternativeId],
    references: [athleticVenues.id],
  }),
  createdBy: one(users, {
    fields: [practices.createdBy],
    references: [users.id],
  }),
  athleticCalendarEvents: many(athleticCalendarEvents),
  facilityReservations: many(facilityReservations),
}));

export const facilityReservationsRelations = relations(facilityReservations, ({ one }) => ({
  venue: one(athleticVenues, {
    fields: [facilityReservations.venueId],
    references: [athleticVenues.id],
  }),
  school: one(schools, {
    fields: [facilityReservations.schoolId],
    references: [schools.id],
  }),
  requestedBy: one(users, {
    fields: [facilityReservations.requestedBy],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [facilityReservations.approvedBy],
    references: [users.id],
  }),
  schoolSportsProgram: one(schoolSportsPrograms, {
    fields: [facilityReservations.schoolSportsProgramId],
    references: [schoolSportsPrograms.id],
  }),
  game: one(games, {
    fields: [facilityReservations.gameId],
    references: [games.id],
  }),
  practice: one(practices, {
    fields: [facilityReservations.practiceId],
    references: [practices.id],
  }),
}));

export const athleticCalendarEventsRelations = relations(athleticCalendarEvents, ({ one }) => ({
  district: one(districts, {
    fields: [athleticCalendarEvents.districtId],
    references: [districts.id],
  }),
  school: one(schools, {
    fields: [athleticCalendarEvents.schoolId],
    references: [schools.id],
  }),
  season: one(athleticSeasons, {
    fields: [athleticCalendarEvents.seasonId],
    references: [athleticSeasons.id],
  }),
  game: one(games, {
    fields: [athleticCalendarEvents.gameId],
    references: [games.id],
  }),
  practice: one(practices, {
    fields: [athleticCalendarEvents.practiceId],
    references: [practices.id],
  }),
  academicCompetition: one(academicCompetitions, {
    fields: [athleticCalendarEvents.academicCompetitionId],
    references: [academicCompetitions.id],
  }),
  createdBy: one(users, {
    fields: [athleticCalendarEvents.createdBy],
    references: [users.id],
  }),
}));

export const scheduleConflictsRelations = relations(scheduleConflicts, ({ one }) => ({
  resolvedBy: one(users, {
    fields: [scheduleConflicts.resolvedBy],
    references: [users.id],
  }),
}));

// =============================================================================
// ZOD SCHEMAS FOR NEW ATHLETIC MANAGEMENT TABLES
// =============================================================================

// Athletic Management Schemas
export const insertSportSchema = createInsertSchema(sports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAthleticSeasonSchema = createInsertSchema(athleticSeasons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSchoolSportsProgramSchema = createInsertSchema(schoolSportsPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAthleteSchema = createInsertSchema(athletes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRosterSchema = createInsertSchema(rosters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Injury & Health Tracking Schemas
export const insertInjuryIncidentSchema = createInsertSchema(injuryIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInjuryFollowUpSchema = createInsertSchema(injuryFollowUps).omit({
  id: true,
  createdAt: true,
});

export const insertHealthRiskAssessmentSchema = createInsertSchema(healthRiskAssessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalClearanceConsentSchema = createInsertSchema(medicalClearanceConsents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Academic Competition Schemas
export const insertAcademicEventSchema = createInsertSchema(academicEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicCompetitionSchema = createInsertSchema(academicCompetitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicParticipantSchema = createInsertSchema(academicParticipants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicResultSchema = createInsertSchema(academicResults).omit({
  id: true,
  createdAt: true,
});

export const insertAcademicDistrictSchema = createInsertSchema(academicDistricts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicMeetSchema = createInsertSchema(academicMeets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSchoolAcademicProgramSchema = createInsertSchema(schoolAcademicPrograms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicTeamSchema = createInsertSchema(academicTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAcademicOfficialSchema = createInsertSchema(academicOfficials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Budget Management Schemas
export const insertDistrictBudgetSchema = createInsertSchema(districtBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSchoolDepartmentBudgetSchema = createInsertSchema(schoolDepartmentBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSportProgramBudgetSchema = createInsertSchema(sportProgramBudgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseRecordSchema = createInsertSchema(expenseRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetTransferSchema = createInsertSchema(budgetTransfers).omit({
  id: true,
  createdAt: true,
});

// Comprehensive Excel-Style Budget Management Schemas
export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetAllocationSchema = createInsertSchema(budgetAllocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRecalculated: true,
});

export const insertBudgetTransactionSchema = createInsertSchema(budgetTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetApprovalSchema = createInsertSchema(budgetApprovals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  submittedAt: true,
});

export const insertBudgetTemplateSchema = createInsertSchema(budgetTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Fantasy League System Schemas
export const insertFantasyLeagueSchema = createInsertSchema(fantasyLeagues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyTeamSchema = createInsertSchema(fantasyTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyRosterSchema = createInsertSchema(fantasyRosters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyDraftSchema = createInsertSchema(fantasyDrafts).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyMatchupSchema = createInsertSchema(fantasyMatchups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyWaiverClaimSchema = createInsertSchema(fantasyWaiverClaims).omit({
  id: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyTradeSchema = createInsertSchema(fantasyTrades).omit({
  id: true,
  proposedAt: true,
  respondedAt: true,
  processedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyLeagueMessageSchema = createInsertSchema(fantasyLeagueMessages).omit({
  id: true,
  editedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Scheduling System Schemas
export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPracticeSchema = createInsertSchema(practices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacilityReservationSchema = createInsertSchema(facilityReservations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAthleticCalendarEventSchema = createInsertSchema(athleticCalendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleConflictSchema = createInsertSchema(scheduleConflicts).omit({
  id: true,
  detectedAt: true,
});

// =============================================================================
// TYPE EXPORTS FOR NEW ATHLETIC MANAGEMENT TABLES
// =============================================================================

// Athletic Management Types
export type Sport = typeof sports.$inferSelect;
export type InsertSport = z.infer<typeof insertSportSchema>;
export type AthleticSeason = typeof athleticSeasons.$inferSelect;
export type InsertAthleticSeason = z.infer<typeof insertAthleticSeasonSchema>;
export type SchoolSportsProgram = typeof schoolSportsPrograms.$inferSelect;
export type InsertSchoolSportsProgram = z.infer<typeof insertSchoolSportsProgramSchema>;
export type Athlete = typeof athletes.$inferSelect;
export type InsertAthlete = z.infer<typeof insertAthleteSchema>;
export type Roster = typeof rosters.$inferSelect;
export type InsertRoster = z.infer<typeof insertRosterSchema>;

// Injury & Health Tracking Types
export type InjuryIncident = typeof injuryIncidents.$inferSelect;
export type InsertInjuryIncident = z.infer<typeof insertInjuryIncidentSchema>;
export type InjuryFollowUp = typeof injuryFollowUps.$inferSelect;
export type InsertInjuryFollowUp = z.infer<typeof insertInjuryFollowUpSchema>;
export type HealthRiskAssessment = typeof healthRiskAssessments.$inferSelect;
export type InsertHealthRiskAssessment = z.infer<typeof insertHealthRiskAssessmentSchema>;
export type MedicalClearanceConsent = typeof medicalClearanceConsents.$inferSelect;
export type InsertMedicalClearanceConsent = z.infer<typeof insertMedicalClearanceConsentSchema>;

// Academic Competition Types
export type AcademicEvent = typeof academicEvents.$inferSelect;
export type InsertAcademicEvent = z.infer<typeof insertAcademicEventSchema>;
export type AcademicCompetition = typeof academicCompetitions.$inferSelect;
export type InsertAcademicCompetition = z.infer<typeof insertAcademicCompetitionSchema>;
export type AcademicParticipant = typeof academicParticipants.$inferSelect;
export type InsertAcademicParticipant = z.infer<typeof insertAcademicParticipantSchema>;
export type AcademicResult = typeof academicResults.$inferSelect;
export type InsertAcademicResult = z.infer<typeof insertAcademicResultSchema>;
export type AcademicDistrict = typeof academicDistricts.$inferSelect;
export type InsertAcademicDistrict = z.infer<typeof insertAcademicDistrictSchema>;
export type AcademicMeet = typeof academicMeets.$inferSelect;
export type InsertAcademicMeet = z.infer<typeof insertAcademicMeetSchema>;
export type SchoolAcademicProgram = typeof schoolAcademicPrograms.$inferSelect;
export type InsertSchoolAcademicProgram = z.infer<typeof insertSchoolAcademicProgramSchema>;
export type AcademicTeam = typeof academicTeams.$inferSelect;
export type InsertAcademicTeam = z.infer<typeof insertAcademicTeamSchema>;
export type AcademicOfficial = typeof academicOfficials.$inferSelect;
export type InsertAcademicOfficial = z.infer<typeof insertAcademicOfficialSchema>;

// Budget Management Types
export type DistrictBudget = typeof districtBudgets.$inferSelect;
export type InsertDistrictBudget = z.infer<typeof insertDistrictBudgetSchema>;
export type SchoolDepartmentBudget = typeof schoolDepartmentBudgets.$inferSelect;
export type InsertSchoolDepartmentBudget = z.infer<typeof insertSchoolDepartmentBudgetSchema>;
export type SportProgramBudget = typeof sportProgramBudgets.$inferSelect;
export type InsertSportProgramBudget = z.infer<typeof insertSportProgramBudgetSchema>;
export type ExpenseRecord = typeof expenseRecords.$inferSelect;
export type InsertExpenseRecord = z.infer<typeof insertExpenseRecordSchema>;
export type BudgetTransfer = typeof budgetTransfers.$inferSelect;
export type InsertBudgetTransfer = z.infer<typeof insertBudgetTransferSchema>;

// Comprehensive Excel-Style Budget Management Types
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type InsertBudgetItem = z.infer<typeof insertBudgetItemSchema>;
export type BudgetAllocation = typeof budgetAllocations.$inferSelect;
export type InsertBudgetAllocation = z.infer<typeof insertBudgetAllocationSchema>;
export type BudgetTransaction = typeof budgetTransactions.$inferSelect;
export type InsertBudgetTransaction = z.infer<typeof insertBudgetTransactionSchema>;
export type BudgetApproval = typeof budgetApprovals.$inferSelect;
export type InsertBudgetApproval = z.infer<typeof insertBudgetApprovalSchema>;
export type BudgetTemplate = typeof budgetTemplates.$inferSelect;
export type InsertBudgetTemplate = z.infer<typeof insertBudgetTemplateSchema>;

// Scheduling System Types
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Practice = typeof practices.$inferSelect;
export type InsertPractice = z.infer<typeof insertPracticeSchema>;
export type FacilityReservation = typeof facilityReservations.$inferSelect;
export type InsertFacilityReservation = z.infer<typeof insertFacilityReservationSchema>;
export type AthleticCalendarEvent = typeof athleticCalendarEvents.$inferSelect;
export type InsertAthleticCalendarEvent = z.infer<typeof insertAthleticCalendarEventSchema>;
export type ScheduleConflict = typeof scheduleConflicts.$inferSelect;
export type InsertScheduleConflict = z.infer<typeof insertScheduleConflictSchema>;

// Fantasy League System Types
export type FantasyLeague = typeof fantasyLeagues.$inferSelect;
export type InsertFantasyLeague = z.infer<typeof insertFantasyLeagueSchema>;
export type FantasyTeam = typeof fantasyTeams.$inferSelect;
export type InsertFantasyTeam = z.infer<typeof insertFantasyTeamSchema>;
export type FantasyRoster = typeof fantasyRosters.$inferSelect;
export type InsertFantasyRoster = z.infer<typeof insertFantasyRosterSchema>;
export type FantasyDraft = typeof fantasyDrafts.$inferSelect;
export type InsertFantasyDraft = z.infer<typeof insertFantasyDraftSchema>;
export type FantasyMatchup = typeof fantasyMatchups.$inferSelect;
export type InsertFantasyMatchup = z.infer<typeof insertFantasyMatchupSchema>;
export type FantasyWaiverClaim = typeof fantasyWaiverClaims.$inferSelect;
export type InsertFantasyWaiverClaim = z.infer<typeof insertFantasyWaiverClaimSchema>;
export type FantasyTrade = typeof fantasyTrades.$inferSelect;
export type InsertFantasyTrade = z.infer<typeof insertFantasyTradeSchema>;
export type FantasyLeagueMessage = typeof fantasyLeagueMessages.$inferSelect;
export type InsertFantasyLeagueMessage = z.infer<typeof insertFantasyLeagueMessageSchema>;

export * from "./sport-configs-schema";
export * from "./athleticTrainerSchema";
