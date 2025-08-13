import { z } from "zod";
import { pgTable, varchar, integer, decimal, timestamp, text, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Athlete Health Monitoring Schema
export const athleteHealthProfiles = pgTable("athlete_health_profiles", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id").notNull(),
  sport: varchar("sport").notNull(), // football, wrestling, soccer, basketball, volleyball, baseball
  position: varchar("position").notNull(), // specific position like "offensive_line", "linebacker", etc.
  height: integer("height"), // inches
  weight: integer("weight"), // pounds
  baselineMetrics: jsonb("baseline_metrics"), // sport-specific baseline measurements
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance Monitoring Sessions
export const performanceMonitoringSessions = pgTable("performance_monitoring_sessions", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id").notNull(),
  sessionType: varchar("session_type").notNull(), // practice, game, training
  sport: varchar("sport").notNull(),
  position: varchar("position").notNull(),
  date: timestamp("date").notNull(),
  duration: integer("duration"), // minutes
  intensity: varchar("intensity"), // low, medium, high, extreme
  environmentalFactors: jsonb("environmental_factors"), // temperature, humidity, field conditions
  createdAt: timestamp("created_at").defaultNow(),
});

// Football-Specific Contact Monitoring
export const footballContactData = pgTable("football_contact_data", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  athleteId: varchar("athlete_id").notNull(),
  position: varchar("position").notNull(),
  totalContacts: integer("total_contacts").notNull(),
  highImpactContacts: integer("high_impact_contacts").notNull(),
  contactIntensityScore: decimal("contact_intensity_score", { precision: 5, scale: 2 }),
  recoveryTime: integer("recovery_time"), // seconds between high-intensity plays
  techniqueQualityScore: decimal("technique_quality_score", { precision: 5, scale: 2 }),
  fatigueIndicators: jsonb("fatigue_indicators"),
  opponentStrength: varchar("opponent_strength"), // weak, average, strong, elite
  createdAt: timestamp("created_at").defaultNow(),
});

// Wrestling Weight Management
export const wrestlingWeightData = pgTable("wrestling_weight_data", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  athleteId: varchar("athlete_id").notNull(),
  preSessionWeight: decimal("pre_session_weight", { precision: 5, scale: 2 }),
  postSessionWeight: decimal("post_session_weight", { precision: 5, scale: 2 }),
  hydrationStatus: varchar("hydration_status"), // optimal, concerning, dangerous
  weightCuttingMethod: varchar("weight_cutting_method"), // healthy, moderate, extreme
  energyLevel: integer("energy_level"), // 1-10 scale
  mentalSharpness: integer("mental_sharpness"), // 1-10 scale
  trainingIntensity: varchar("training_intensity"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Soccer Endurance & Movement Data
export const soccerMovementData = pgTable("soccer_movement_data", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  athleteId: varchar("athlete_id").notNull(),
  position: varchar("position").notNull(),
  distanceCovered: decimal("distance_covered", { precision: 6, scale: 2 }), // meters
  sprintCount: integer("sprint_count"),
  averageSprintSpeed: decimal("average_sprint_speed", { precision: 5, scale: 2 }),
  recoveryBetweenSprints: integer("recovery_between_sprints"), // seconds
  touchesOnBall: integer("touches_on_ball"),
  passingAccuracy: decimal("passing_accuracy", { precision: 5, scale: 2 }),
  defensiveActions: integer("defensive_actions"),
  cardiacStressIndicators: jsonb("cardiac_stress_indicators"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Health Alert System
export const healthAlerts = pgTable("health_alerts", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id").notNull(),
  alertType: varchar("alert_type").notNull(), // performance_decline, injury_risk, overtraining, dehydration
  severity: varchar("severity").notNull(), // low, medium, high, critical
  sport: varchar("sport").notNull(),
  description: text("description").notNull(),
  recommendedAction: text("recommended_action").notNull(),
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Health Recommendations
export const aiHealthRecommendations = pgTable("ai_health_recommendations", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id").notNull(),
  sport: varchar("sport").notNull(),
  analysisType: varchar("analysis_type").notNull(), // performance_trend, injury_prediction, load_management
  recommendation: text("recommendation").notNull(),
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  dataPoints: jsonb("data_points"), // supporting evidence
  implementationPriority: varchar("implementation_priority"), // immediate, soon, monitor
  coachNotified: boolean("coach_notified").default(false),
  parentNotified: boolean("parent_notified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Position-Specific Performance Baselines
export const positionBaselines = pgTable("position_baselines", {
  id: varchar("id").primaryKey(),
  sport: varchar("sport").notNull(),
  position: varchar("position").notNull(),
  metricName: varchar("metric_name").notNull(),
  averageValue: decimal("average_value", { precision: 10, scale: 3 }),
  excellentThreshold: decimal("excellent_threshold", { precision: 10, scale: 3 }),
  concerningThreshold: decimal("concerning_threshold", { precision: 10, scale: 3 }),
  criticalThreshold: decimal("critical_threshold", { precision: 10, scale: 3 }),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Export types
export type AthleteHealthProfile = typeof athleteHealthProfiles.$inferSelect;
export type InsertAthleteHealthProfile = typeof athleteHealthProfiles.$inferInsert;

export type PerformanceMonitoringSession = typeof performanceMonitoringSessions.$inferSelect;
export type InsertPerformanceMonitoringSession = typeof performanceMonitoringSessions.$inferInsert;

export type FootballContactData = typeof footballContactData.$inferSelect;
export type InsertFootballContactData = typeof footballContactData.$inferInsert;

export type WrestlingWeightData = typeof wrestlingWeightData.$inferSelect;
export type InsertWrestlingWeightData = typeof wrestlingWeightData.$inferInsert;

export type SoccerMovementData = typeof soccerMovementData.$inferSelect;
export type InsertSoccerMovementData = typeof soccerMovementData.$inferInsert;

export type HealthAlert = typeof healthAlerts.$inferSelect;
export type InsertHealthAlert = typeof healthAlerts.$inferInsert;

export type AIHealthRecommendation = typeof aiHealthRecommendations.$inferSelect;
export type InsertAIHealthRecommendation = typeof aiHealthRecommendations.$inferInsert;

export type PositionBaseline = typeof positionBaselines.$inferSelect;
export type InsertPositionBaseline = typeof positionBaselines.$inferInsert;

// Zod schemas for validation
export const insertAthleteHealthProfileSchema = createInsertSchema(athleteHealthProfiles);
export const insertPerformanceMonitoringSessionSchema = createInsertSchema(performanceMonitoringSessions);
export const insertFootballContactDataSchema = createInsertSchema(footballContactData);
export const insertWrestlingWeightDataSchema = createInsertSchema(wrestlingWeightData);
export const insertSoccerMovementDataSchema = createInsertSchema(soccerMovementData);
export const insertHealthAlertSchema = createInsertSchema(healthAlerts);
export const insertAIHealthRecommendationSchema = createInsertSchema(aiHealthRecommendations);
export const insertPositionBaselineSchema = createInsertSchema(positionBaselines);