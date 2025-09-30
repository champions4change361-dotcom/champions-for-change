import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// References to Core domain tables
import { users } from "./core";

// =============================================================================
// FANTASY DOMAIN SCHEMA
// =============================================================================
// Fantasy Football League System
//
// 20 fantasy tables for season-long and daily fantasy sports:
// - Fantasy Profiles & Leagues
// - Fantasy Teams & Rosters
// - Drafts, Matchups, Trades, Waivers
// - Professional Players & Performances
// - Showdown (Daily Fantasy)
// - Age Verification & Safety
// =============================================================================

// =============================================================================
// TABLE DEFINITIONS
// =============================================================================

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

export const fantasyEligibilityChecks = pgTable("fantasy_eligibility_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  userId: varchar("user_id").notNull(),
  ageCheckPassed: boolean("age_check_passed").default(false),
  locationCheckPassed: boolean("location_check_passed").default(true), // For legal compliance
  eligibilityDate: timestamp("eligibility_date").defaultNow(),
  checkDetails: jsonb("check_details"),
});

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


// =============================================================================
// INSERT SCHEMAS
// =============================================================================

export const insertFantasyProfileSchema = createInsertSchema(fantasyProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyTradeSchema = createInsertSchema(fantasyTrades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFantasyLeagueMessageSchema = createInsertSchema(fantasyLeagueMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfessionalPlayerSchema = createInsertSchema(professionalPlayers).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type FantasyProfile = typeof fantasyProfiles.$inferSelect;
export type InsertFantasyProfile = z.infer<typeof insertFantasyProfileSchema>;

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

export type FantasyParticipant = typeof fantasyParticipants.$inferSelect;
export type InsertFantasyParticipant = typeof fantasyParticipants.$inferInsert;

export type ProfessionalPlayer = typeof professionalPlayers.$inferSelect;
export type InsertProfessionalPlayer = z.infer<typeof insertProfessionalPlayerSchema>;

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

export type ShowdownContest = typeof showdownContests.$inferSelect;
export type InsertShowdownContest = typeof showdownContests.$inferInsert;

export type ShowdownEntry = typeof showdownEntries.$inferSelect;
export type InsertShowdownEntry = typeof showdownEntries.$inferInsert;

export type ShowdownLeaderboard = typeof showdownLeaderboards.$inferSelect;
export type InsertShowdownLeaderboard = typeof showdownLeaderboards.$inferInsert;

// =============================================================================
// RELATIONS
// =============================================================================

// Fantasy Profiles -> Users (from Core)
export const fantasyProfilesRelations = relations(fantasyProfiles, ({ one }) => ({
  user: one(users, {
    fields: [fantasyProfiles.userId],
    references: [users.id],
  }),
}));

// Fantasy Leagues -> Users (commissioner from Core)
export const fantasyLeaguesRelations = relations(fantasyLeagues, ({ one, many }) => ({
  commissioner: one(users, {
    fields: [fantasyLeagues.commissionerId],
    references: [users.id],
  }),
  teams: many(fantasyTeams),
  matchups: many(fantasyMatchups),
  waiverClaims: many(fantasyWaiverClaims),
  trades: many(fantasyTrades),
  messages: many(fantasyLeagueMessages),
}));

// Fantasy Teams -> Fantasy Leagues and Users
export const fantasyTeamsRelations = relations(fantasyTeams, ({ one, many }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyTeams.leagueId],
    references: [fantasyLeagues.id],
  }),
  owner: one(users, {
    fields: [fantasyTeams.ownerId],
    references: [users.id],
  }),
  rosters: many(fantasyRosters),
}));

// Fantasy Rosters -> Fantasy Teams and Professional Players
export const fantasyRostersRelations = relations(fantasyRosters, ({ one }) => ({
  team: one(fantasyTeams, {
    fields: [fantasyRosters.teamId],
    references: [fantasyTeams.id],
  }),
  player: one(professionalPlayers, {
    fields: [fantasyRosters.playerId],
    references: [professionalPlayers.id],
  }),
}));

// Fantasy Drafts -> Fantasy Leagues
export const fantasyDraftsRelations = relations(fantasyDrafts, ({ one }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyDrafts.leagueId],
    references: [fantasyLeagues.id],
  }),
}));

// Fantasy Matchups -> Fantasy Leagues and Fantasy Teams
export const fantasyMatchupsRelations = relations(fantasyMatchups, ({ one }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyMatchups.leagueId],
    references: [fantasyLeagues.id],
  }),
  team1: one(fantasyTeams, {
    fields: [fantasyMatchups.team1Id],
    references: [fantasyTeams.id],
    relationName: "team1_matchups",
  }),
  team2: one(fantasyTeams, {
    fields: [fantasyMatchups.team2Id],
    references: [fantasyTeams.id],
    relationName: "team2_matchups",
  }),
}));

// Fantasy Waiver Claims -> Fantasy Leagues, Teams, and Players
export const fantasyWaiverClaimsRelations = relations(fantasyWaiverClaims, ({ one }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyWaiverClaims.leagueId],
    references: [fantasyLeagues.id],
  }),
  team: one(fantasyTeams, {
    fields: [fantasyWaiverClaims.teamId],
    references: [fantasyTeams.id],
  }),
  addPlayer: one(professionalPlayers, {
    fields: [fantasyWaiverClaims.addPlayerId],
    references: [professionalPlayers.id],
    relationName: "waiver_add_player",
  }),
  dropPlayer: one(professionalPlayers, {
    fields: [fantasyWaiverClaims.dropPlayerId],
    references: [professionalPlayers.id],
    relationName: "waiver_drop_player",
  }),
}));

// Fantasy Trades -> Fantasy Leagues and Teams
export const fantasyTradesRelations = relations(fantasyTrades, ({ one }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyTrades.leagueId],
    references: [fantasyLeagues.id],
  }),
  proposingTeam: one(fantasyTeams, {
    fields: [fantasyTrades.proposingTeamId],
    references: [fantasyTeams.id],
    relationName: "trade_proposing_team",
  }),
  receivingTeam: one(fantasyTeams, {
    fields: [fantasyTrades.receivingTeamId],
    references: [fantasyTeams.id],
    relationName: "trade_receiving_team",
  }),
}));

// Fantasy League Messages -> Fantasy Leagues and Users
export const fantasyLeagueMessagesRelations = relations(fantasyLeagueMessages, ({ one }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyLeagueMessages.leagueId],
    references: [fantasyLeagues.id],
  }),
  sender: one(users, {
    fields: [fantasyLeagueMessages.senderId],
    references: [users.id],
  }),
}));

// Showdown Contests -> Users (creator from Core)
export const showdownContestsRelations = relations(showdownContests, ({ one, many }) => ({
  creator: one(users, {
    fields: [showdownContests.creatorId],
    references: [users.id],
  }),
  entries: many(showdownEntries),
  leaderboards: many(showdownLeaderboards),
}));

// Showdown Entries -> Showdown Contests and Users
export const showdownEntriesRelations = relations(showdownEntries, ({ one }) => ({
  contest: one(showdownContests, {
    fields: [showdownEntries.contestId],
    references: [showdownContests.id],
  }),
  user: one(users, {
    fields: [showdownEntries.userId],
    references: [users.id],
  }),
}));

// Showdown Leaderboards -> Showdown Contests
export const showdownLeaderboardsRelations = relations(showdownLeaderboards, ({ one }) => ({
  contest: one(showdownContests, {
    fields: [showdownLeaderboards.contestId],
    references: [showdownContests.id],
  }),
}));

