// 🧠 KEYSTONE AI FANTASY COACHING BRAIN - RAMMING SPEED DEPLOYMENT
// The smartest fantasy coaching system ever built

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, decimal, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Player performance analytics
export const playerAnalytics = pgTable("player_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").notNull(),
  playerName: varchar("player_name").notNull(),
  position: varchar("position").notNull(),
  team: varchar("team").notNull(),
  sport: varchar("sport").notNull(),
  
  // PERFORMANCE PATTERNS
  leftSideRushingPercentage: real("left_side_rushing_percentage"), // "Gibbs runs left 75%"
  rightSideRushingPercentage: real("right_side_rushing_percentage"),
  redZoneTargetShare: real("red_zone_target_share"),
  thirdDownConversionRate: real("third_down_conversion_rate"),
  
  // SITUATIONAL PERFORMANCE
  performanceVsDefenseRank: jsonb("performance_vs_defense_rank").$type<{
    top10: number;
    middle10: number;
    bottom10: number;
  }>(),
  
  weatherPerformance: jsonb("weather_performance").$type<{
    dome: number;
    outdoor: number;
    cold: number;
    rain: number;
  }>(),
  
  // WEEKLY TRENDS
  lastFiveGames: jsonb("last_five_games").$type<Array<{
    week: number;
    points: number;
    opponent: string;
    usage: number;
  }>>(),
  
  seasonTrends: jsonb("season_trends").$type<{
    earlyseason: number;
    midseason: number;
    lateseason: number;
  }>(),
  
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Defensive analytics for matchup insights
export const defensiveAnalytics = pgTable("defensive_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  team: varchar("team").notNull(),
  sport: varchar("sport").notNull(),
  
  // FORMATION WEAKNESSES
  leftSideRushingYardsAllowed: real("left_side_rushing_yards_allowed"), // "67% more yards allowed left side"
  rightSideRushingYardsAllowed: real("right_side_rushing_yards_allowed"),
  interiorLineWeakness: real("interior_line_weakness"),
  edgeRushWeakness: real("edge_rush_weakness"),
  
  // SITUATIONAL DEFENSE
  redZoneDefenseRank: integer("red_zone_defense_rank"),
  thirdDownDefenseRank: integer("third_down_defense_rank"),
  passRushPressureRate: real("pass_rush_pressure_rate"),
  
  // POSITION-SPECIFIC RANKINGS
  vsRunningBacks: jsonb("vs_running_backs").$type<{
    fantasyPointsAllowed: number;
    yardageAllowed: number;
    touchdownsAllowed: number;
    rank: number;
  }>(),
  
  vsWideReceivers: jsonb("vs_wide_receivers").$type<{
    slot: number;
    outside: number;
    deepTargets: number;
    rank: number;
  }>(),
  
  vsTightEnds: jsonb("vs_tight_ends").$type<{
    fantasyPointsAllowed: number;
    redZoneTargets: number;
    rank: number;
  }>(),
  
  recentTrends: jsonb("recent_trends").$type<Array<{
    week: number;
    pointsAllowed: number;
    yardsAllowed: number;
    injuries: string[];
  }>>(),
  
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI coaching insights and recommendations
export const aiCoachingInsights = pgTable("ai_coaching_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  playerId: varchar("player_id").notNull(),
  week: integer("week").notNull(),
  season: integer("season").notNull(),
  
  // INSIGHT DETAILS
  insightType: text("insight_type", {
    enum: ["trend_alert", "matchup_advantage", "defensive_weakness", "usage_pattern", "breakout_potential"]
  }).notNull(),
  
  confidenceScore: real("confidence_score").notNull(), // 0-100
  title: varchar("title").notNull(), // "Gibbs Poised for Big Game"
  description: text("description").notNull(), // Full explanation
  recommendation: text("recommendation").notNull(), // "Start with confidence"
  
  // SUPPORTING DATA
  supportingStats: jsonb("supporting_stats").$type<{
    keyMetric: string;
    playerValue: number;
    leagueAverage: number;
    percentageDifference: number;
  }>(),
  
  // RISK ASSESSMENT
  riskLevel: text("risk_level", {
    enum: ["low", "medium", "high"]
  }).notNull(),
  
  upside: text("upside").notNull(),
  downside: text("downside").notNull(),
  
  // USER INTERACTION
  wasHelpful: boolean("was_helpful"),
  userFeedback: text("user_feedback"),
  actualOutcome: jsonb("actual_outcome").$type<{
    actualPoints: number;
    predictionAccuracy: number;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly matchup analysis
export const weeklyMatchups = pgTable("weekly_matchups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  week: integer("week").notNull(),
  season: integer("season").notNull(),
  homeTeam: varchar("home_team").notNull(),
  awayTeam: varchar("away_team").notNull(),
  
  // GAME CONDITIONS
  weather: jsonb("weather").$type<{
    condition: string;
    temperature: number;
    windSpeed: number;
    precipitation: number;
  }>(),
  
  gameTotal: real("game_total"), // Over/under
  spread: real("spread"),
  
  // PACE AND STYLE
  projectedPace: real("projected_pace"),
  homePaceRank: integer("home_pace_rank"),
  awayPaceRank: integer("away_pace_rank"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User fantasy teams and lineups
export const fantasyLineups = pgTable("fantasy_lineups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  leagueId: varchar("league_id").notNull(),
  week: integer("week").notNull(),
  season: integer("season").notNull(),
  
  // LINEUP COMPOSITION
  quarterbacks: jsonb("quarterbacks").$type<string[]>(),
  runningBacks: jsonb("running_backs").$type<string[]>(),
  wideReceivers: jsonb("wide_receivers").$type<string[]>(),
  tightEnds: jsonb("tight_ends").$type<string[]>(),
  kickers: jsonb("kickers").$type<string[]>(),
  defenseSpecialTeams: jsonb("defense_special_teams").$type<string[]>(),
  
  // STRATEGY NOTES
  strategyType: text("strategy_type", {
    enum: ["safe_floor", "high_ceiling", "balanced", "contrarian", "stack_heavy"]
  }),
  
  aiRecommendations: jsonb("ai_recommendations").$type<Array<{
    playerId: string;
    confidence: number;
    reason: string;
  }>>(),
  
  totalProjectedPoints: real("total_projected_points"),
  actualPoints: real("actual_points"),
  
  submittedAt: timestamp("submitted_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for form validation
export const insertPlayerAnalytics = createInsertSchema(playerAnalytics);
export const insertDefensiveAnalytics = createInsertSchema(defensiveAnalytics);
export const insertAiCoachingInsights = createInsertSchema(aiCoachingInsights);
export const insertWeeklyMatchups = createInsertSchema(weeklyMatchups);
export const insertFantasyLineups = createInsertSchema(fantasyLineups);

// Select types
export type PlayerAnalytics = typeof playerAnalytics.$inferSelect;
export type DefensiveAnalytics = typeof defensiveAnalytics.$inferSelect;
export type AiCoachingInsights = typeof aiCoachingInsights.$inferSelect;
export type WeeklyMatchups = typeof weeklyMatchups.$inferSelect;
export type FantasyLineups = typeof fantasyLineups.$inferSelect;

// Insert types
export type InsertPlayerAnalytics = z.infer<typeof insertPlayerAnalytics>;
export type InsertDefensiveAnalytics = z.infer<typeof insertDefensiveAnalytics>;
export type InsertAiCoachingInsights = z.infer<typeof insertAiCoachingInsights>;
export type InsertWeeklyMatchups = z.infer<typeof insertWeeklyMatchups>;
export type InsertFantasyLineups = z.infer<typeof insertFantasyLineups>;