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
  athleticTrainerReviewed: boolean("athletic_trainer_reviewed").default(false),
  hipaaCompliant: boolean("hipaa_compliant").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Performance Drill Data (beyond counting stats)
export const performanceDrillData = pgTable("performance_drill_data", {
  id: varchar("id").primaryKey(),
  sessionId: varchar("session_id").notNull(),
  athleteId: varchar("athlete_id").notNull(),
  sport: varchar("sport").notNull(),
  position: varchar("position").notNull(),
  drillType: varchar("drill_type").notNull(), // forty_yard_dash, bench_press, vertical_jump, etc.
  result: decimal("result", { precision: 6, scale: 3 }), // time, weight, distance
  baseline: decimal("baseline", { precision: 6, scale: 3 }), // athlete's personal baseline
  percentileRank: integer("percentile_rank"), // compared to position peers
  performanceTrend: decimal("performance_trend", { precision: 5, scale: 2 }), // % change from baseline
  compensatoryMovements: boolean("compensatory_movements").default(false),
  injuryRiskIndicator: decimal("injury_risk_indicator", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Athletic Trainer Medical Records
export const athleticTrainerRecords = pgTable("athletic_trainer_records", {
  id: varchar("id").primaryKey(),
  athleteId: varchar("athlete_id").notNull(),
  trainerId: varchar("trainer_id").notNull(),
  evaluationType: varchar("evaluation_type").notNull(), // screening, injury_assessment, follow_up, clearance
  findings: text("findings"),
  recommendations: text("recommendations"),
  restrictionLevel: varchar("restriction_level"), // none, limited, restricted, no_participation
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  parentNotified: boolean("parent_notified").default(false),
  coachNotified: boolean("coach_notified").default(false),
  hipaaConsentDate: timestamp("hipaa_consent_date").notNull(),
  consentGivenBy: varchar("consent_given_by").notNull(), // parent/guardian name
  isConfidential: boolean("is_confidential").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Practice Schedule Integration
export const practiceSchedule = pgTable("practice_schedule", {
  id: varchar("id").primaryKey(),
  teamId: varchar("team_id").notNull(),
  sport: varchar("sport").notNull(),
  practiceDate: timestamp("practice_date").notNull(),
  drillsPlanned: jsonb("drills_planned").$type<{
    drillName: string;
    duration: number; // minutes
    intensity: 'low' | 'medium' | 'high';
    focus: string; // conditioning, technique, scrimmage, etc.
  }[]>(),
  healthMonitoringEnabled: boolean("health_monitoring_enabled").default(true),
  athleticTrainerPresent: boolean("athletic_trainer_present").default(false),
  environmentalConditions: jsonb("environmental_conditions").$type<{
    temperature: number;
    humidity: number;
    heatIndex: number;
    airQuality: 'good' | 'moderate' | 'unhealthy';
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// HIPAA Compliance Audit Log
export const hipaaAuditLog = pgTable("hipaa_audit_log", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  userRole: varchar("user_role").notNull(),
  athleteId: varchar("athlete_id").notNull(),
  actionType: varchar("action_type").notNull(), // view, create, update, delete, export
  dataAccessed: varchar("data_accessed").notNull(), // health_alert, medical_record, performance_data
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  justification: text("justification"), // reason for accessing PHI
  consentVerified: boolean("consent_verified").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
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

export type PerformanceDrillData = typeof performanceDrillData.$inferSelect;
export type InsertPerformanceDrillData = typeof performanceDrillData.$inferInsert;

export type AthleticTrainerRecord = typeof athleticTrainerRecords.$inferSelect;
export type InsertAthleticTrainerRecord = typeof athleticTrainerRecords.$inferInsert;

export type PracticeSchedule = typeof practiceSchedule.$inferSelect;
export type InsertPracticeSchedule = typeof practiceSchedule.$inferInsert;

export type HipaaAuditLog = typeof hipaaAuditLog.$inferSelect;
export type InsertHipaaAuditLog = typeof hipaaAuditLog.$inferInsert;

// Zod schemas for validation
export const insertAthleteHealthProfileSchema = createInsertSchema(athleteHealthProfiles);
export const insertPerformanceMonitoringSessionSchema = createInsertSchema(performanceMonitoringSessions);
export const insertFootballContactDataSchema = createInsertSchema(footballContactData);
export const insertWrestlingWeightDataSchema = createInsertSchema(wrestlingWeightData);
export const insertSoccerMovementDataSchema = createInsertSchema(soccerMovementData);
export const insertHealthAlertSchema = createInsertSchema(healthAlerts);
export const insertAIHealthRecommendationSchema = createInsertSchema(aiHealthRecommendations);
export const insertPositionBaselineSchema = createInsertSchema(positionBaselines);
export const insertPerformanceDrillDataSchema = createInsertSchema(performanceDrillData);
export const insertAthleticTrainerRecordSchema = createInsertSchema(athleticTrainerRecords);
export const insertPracticeScheduleSchema = createInsertSchema(practiceSchedule);
export const insertHipaaAuditLogSchema = createInsertSchema(hipaaAuditLog);