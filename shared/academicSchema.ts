// UIL Academic Competition Database Schema - THE Complete Solution
// Handles all 50+ academic competitions from grades 2-12 across Texas districts

import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ===============================
// ACADEMIC COMPETITION STRUCTURE
// ===============================

// Academic Competition Categories (High School - 30 contests)
export const academicCategoryEnum = pgEnum('academic_category', [
  // Language Arts
  'literary_criticism',
  'ready_writing', 
  'spelling_vocabulary',
  
  // Journalism
  'copy_editing',
  'editorial_writing',
  'feature_writing', 
  'headline_writing',
  'news_writing',
  
  // Social Studies
  'current_issues_events',
  'social_studies',
  
  // Mathematics & Science  
  'calculator_applications',
  'mathematics',
  'number_sense',
  'science',
  
  // Business Skills
  'accounting',
  'computer_applications',
  
  // Speech & Debate
  'cross_examination_debate',
  'informative_speaking',
  'persuasive_speaking',
  'poetry_interpretation',
  'prose_interpretation',
  
  // Fine Arts
  'one_act_play',
  'theatrical_design',
  
  // Essay Competitions
  'barbara_jordan_essay',
  'latino_history_essay'
]);

// A+ Academic Categories (Elementary/Middle - 20 contests)
export const aPlusAcademicEnum = pgEnum('aplus_academic', [
  'art',
  'calculator_applications_aplus',
  'chess_puzzle',
  'creative_writing',
  'dictionary_skills',
  'editorial_writing_aplus',
  'listening',
  'maps_graphs_charts',
  'mathematics_aplus',
  'music_memory',
  'number_sense_aplus',
  'ready_writing_aplus',
  'science_aplus',
  'social_studies_aplus',
  'spelling_aplus',
  'impromptu_speaking',
  'modern_oratory',
  'one_act_play_aplus',
  'oral_reading',
  'theatrical_design_aplus'
]);

// Competition Levels & Classifications
export const competitionLevelEnum = pgEnum('competition_level', [
  'district',
  'regional', 
  'state',
  'area',      // Some contests only
  'bi_district' // Some contests only
]);

export const schoolClassificationEnum = pgEnum('school_classification', [
  'elementary', // Grades 2-5
  'middle',     // Grades 6-8  
  'high_1A',    // High School Class 1A
  'high_2A',    // High School Class 2A
  'high_3A',    // High School Class 3A
  'high_4A',    // High School Class 4A
  'high_5A',    // High School Class 5A
  'high_6A'     // High School Class 6A
]);

// Role Hierarchy - District to Student Level
export const academicRoleEnum = pgEnum('academic_role', [
  // District Level
  'district_academic_coordinator',
  'district_academic_director',
  'district_meet_director',
  
  // School Level  
  'school_academic_coordinator',
  'academic_principal',
  'academic_assistant_principal',
  
  // Coach/Sponsor Level
  'academic_sponsor',
  'academic_coach',
  'volunteer_coach',
  
  // Contest Official Level
  'contest_judge',
  'contest_grader',
  'contest_official',
  'meet_manager',
  
  // Student Level
  'academic_student',
  'team_captain',
  'alternate_competitor'
]);

// ===============================
// CORE ACADEMIC COMPETITION TABLES
// ===============================

// Academic Districts - Separate from Athletic Districts
export const academicDistricts = pgTable("academic_districts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtName: varchar("district_name").notNull(),
  districtNumber: varchar("district_number").notNull(), // UIL District Number
  region: varchar("region").notNull(), // UIL Region
  classification: schoolClassificationEnum("classification").notNull(),
  
  // Geographic and Contact Info
  districtESC: varchar("district_esc"), // Education Service Center
  coordinatorName: varchar("coordinator_name"),
  coordinatorEmail: varchar("coordinator_email"),
  coordinatorPhone: varchar("coordinator_phone"),
  
  // Competition Management
  meetDate: date("meet_date"), // District meet date
  meetLocation: varchar("meet_location"),
  registrationDeadline: date("registration_deadline"),
  
  // Status and Settings
  isActive: boolean("is_active").default(true),
  allowsSubstitutions: boolean("allows_substitutions").default(true),
  maxEntriesPerEvent: integer("max_entries_per_event").default(3),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Competitions/Contests
export const academicCompetitions = pgTable("academic_competitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionName: varchar("competition_name").notNull(),
  competitionType: varchar("competition_type").notNull(), // 'high_school' or 'aplus'
  category: varchar("category").notNull(), // References appropriate enum
  
  // Competition Details
  gradeLevel: varchar("grade_level").notNull(), // "2-3", "6-8", "9-12", etc.
  classification: schoolClassificationEnum("classification").array(),
  maxParticipants: integer("max_participants").default(3),
  isTeamEvent: boolean("is_team_event").default(false),
  teamSize: integer("team_size"),
  
  // Contest Format  
  contestFormat: varchar("contest_format").notNull(), // 'written_test', 'oral_performance', 'portfolio'
  testDuration: integer("test_duration_minutes"),
  hasAdvancement: boolean("has_advancement").default(true),
  advancementRules: jsonb("advancement_rules").$type<{
    individualAdvance: number;
    teamAdvance: number;
    wildcardRules?: boolean;
  }>(),
  
  // TEKS Alignment
  teksAlignment: text("teks_alignment"), // Texas Essential Knowledge Skills alignment
  subjectArea: varchar("subject_area").notNull(),
  
  // Status
  isActive: boolean("is_active").default(true),
  season: varchar("season").notNull(), // 'fall', 'spring'
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Meets/Events
export const academicMeets = pgTable("academic_meets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").notNull().references(() => academicDistricts.id),
  meetName: varchar("meet_name").notNull(),
  meetType: varchar("meet_type").notNull(), // 'district', 'invitational', 'practice'
  level: competitionLevelEnum("level").notNull(),
  
  // Meet Details
  meetDate: date("meet_date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time"),
  location: varchar("location").notNull(),
  hostSchool: varchar("host_school"),
  
  // Meet Management
  meetDirector: varchar("meet_director").notNull(),
  meetDirectorEmail: varchar("meet_director_email"),
  meetDirectorPhone: varchar("meet_director_phone"),
  
  // Logistics
  registrationDeadline: timestamp("registration_deadline").notNull(),
  substitutionDeadline: timestamp("substitution_deadline"),
  maxSchools: integer("max_schools"),
  
  // Competition Settings
  competitions: jsonb("competitions").array(), // Array of competition IDs
  scoringSystem: varchar("scoring_system").default("uil_standard"),
  awardsLevels: jsonb("awards_levels").$type<{
    individual: number; // Top X individuals get awards
    team: number;      // Top X teams get awards
  }>(),
  
  // Status
  status: varchar("status", {
    enum: ["planning", "registration_open", "registration_closed", "in_progress", "completed", "cancelled"]
  }).default("planning"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School Academic Programs
export const schoolAcademicPrograms = pgTable("school_academic_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull(),
  districtId: varchar("district_id").notNull().references(() => academicDistricts.id),
  
  // School Info
  schoolName: varchar("school_name").notNull(),
  classification: schoolClassificationEnum("classification").notNull(),
  enrollment: integer("enrollment"),
  
  // Academic Coordinator
  coordinatorId: varchar("coordinator_id"), // User ID
  coordinatorName: varchar("coordinator_name").notNull(),
  coordinatorEmail: varchar("coordinator_email").notNull(),
  coordinatorPhone: varchar("coordinator_phone"),
  
  // Program Status
  isActive: boolean("is_active").default(true),
  participatingCompetitions: jsonb("participating_competitions").array(), // Competition IDs
  
  // Budget and Resources
  academicBudget: decimal("academic_budget", { precision: 10, scale: 2 }),
  transportationArranged: boolean("transportation_arranged").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Teams/Entries
export const academicTeams = pgTable("academic_teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  schoolId: varchar("school_id").notNull().references(() => schoolAcademicPrograms.id),
  meetId: varchar("meet_id").notNull().references(() => academicMeets.id),
  competitionId: varchar("competition_id").notNull().references(() => academicCompetitions.id),
  
  // Team Details
  teamName: varchar("team_name"),
  division: varchar("division"), // Grade division within competition
  sponsorId: varchar("sponsor_id"), // User ID of sponsor/coach
  sponsorName: varchar("sponsor_name").notNull(),
  
  // Registration Status
  registrationStatus: varchar("registration_status", {
    enum: ["registered", "confirmed", "substitution_pending", "withdrawn", "disqualified"]
  }).default("registered"),
  registrationDate: timestamp("registration_date").defaultNow(),
  confirmationDate: timestamp("confirmation_date"),
  
  // Entry Management
  entriesSubmitted: boolean("entries_submitted").default(false),
  entryDeadlineMet: boolean("entry_deadline_met").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Participants/Students
export const academicParticipants = pgTable("academic_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => academicTeams.id, { onDelete: "cascade" }),
  competitionId: varchar("competition_id").notNull().references(() => academicCompetitions.id),
  
  // Student Information
  studentId: varchar("student_id"), // District student ID
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  grade: integer("grade").notNull(),
  
  // Competition Role
  participantRole: varchar("participant_role", {
    enum: ["primary", "alternate", "team_member", "captain"]
  }).default("primary"),
  entryPosition: integer("entry_position"), // 1st entry, 2nd entry, etc.
  
  // Eligibility & Compliance
  isEligible: boolean("is_eligible").default(true),
  eligibilityVerified: boolean("eligibility_verified").default(false),
  eligibilityDate: date("eligibility_date"),
  
  // Performance Tracking
  previousParticipation: jsonb("previous_participation").$type<Array<{
    year: string;
    competition: string;
    placement: number;
    level: string;
  }>>().default([]),
  
  // Contact Information
  parentName: varchar("parent_name"),
  parentEmail: varchar("parent_email"),
  parentPhone: varchar("parent_phone"),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Results & Scoring
export const academicResults = pgTable("academic_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetId: varchar("meet_id").notNull().references(() => academicMeets.id),
  competitionId: varchar("competition_id").notNull().references(() => academicCompetitions.id),
  participantId: varchar("participant_id").references(() => academicParticipants.id),
  teamId: varchar("team_id").references(() => academicTeams.id),
  
  // Scoring
  score: decimal("score", { precision: 10, scale: 3 }),
  rank: integer("rank"),
  placement: integer("placement"),
  
  // Awards & Recognition
  medal: varchar("medal", { enum: ["gold", "silver", "bronze", "none"] }).default("none"),
  advances: boolean("advances").default(false),
  advancementLevel: varchar("advancement_level"), // 'regional', 'state', etc.
  
  // Performance Details
  performanceNotes: text("performance_notes"),
  judgeComments: text("judge_comments"),
  
  // Verification
  resultsVerified: boolean("results_verified").default(false),
  verifiedBy: varchar("verified_by"),
  verificationDate: timestamp("verification_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Judges & Officials
export const academicOfficials = pgTable("academic_officials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"), // Reference to users table
  
  // Official Information
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  
  // Certification & Qualifications
  role: academicRoleEnum("role").notNull(),
  certifications: jsonb("certifications").array(), // Array of certification types
  qualifiedCompetitions: jsonb("qualified_competitions").array(), // Competition IDs they can judge
  experienceLevel: varchar("experience_level", {
    enum: ["novice", "experienced", "expert", "master"]
  }).default("novice"),
  
  // Availability
  isActive: boolean("is_active").default(true),
  availableDates: jsonb("available_dates").$type<Array<{
    date: string;
    timeSlots: string[];
  }>>().default([]),
  
  // Performance Tracking
  assignmentsCompleted: integer("assignments_completed").default(0),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic Official Assignments
export const officialAssignments = pgTable("official_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  meetId: varchar("meet_id").notNull().references(() => academicMeets.id),
  officialId: varchar("official_id").notNull().references(() => academicOfficials.id),
  competitionId: varchar("competition_id").notNull().references(() => academicCompetitions.id),
  
  // Assignment Details
  assignmentType: varchar("assignment_type", {
    enum: ["head_judge", "judge", "grader", "timekeeper", "meet_manager"]
  }).notNull(),
  room: varchar("room"),
  timeSlot: varchar("time_slot"),
  
  // Compensation (if applicable)
  stipend: decimal("stipend", { precision: 8, scale: 2 }),
  mileageReimbursement: decimal("mileage_reimbursement", { precision: 8, scale: 2 }),
  
  // Status
  status: varchar("status", {
    enum: ["assigned", "confirmed", "completed", "cancelled"]
  }).default("assigned"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ===============================
// EXPORT TYPES
// ===============================

export type AcademicDistrict = typeof academicDistricts.$inferSelect;
export type InsertAcademicDistrict = typeof academicDistricts.$inferInsert;

export type AcademicCompetition = typeof academicCompetitions.$inferSelect;
export type InsertAcademicCompetition = typeof academicCompetitions.$inferInsert;

export type AcademicMeet = typeof academicMeets.$inferSelect;
export type InsertAcademicMeet = typeof academicMeets.$inferInsert;

export type SchoolAcademicProgram = typeof schoolAcademicPrograms.$inferSelect;
export type InsertSchoolAcademicProgram = typeof schoolAcademicPrograms.$inferInsert;

export type AcademicTeam = typeof academicTeams.$inferSelect;
export type InsertAcademicTeam = typeof academicTeams.$inferInsert;

export type AcademicParticipant = typeof academicParticipants.$inferSelect;
export type InsertAcademicParticipant = typeof academicParticipants.$inferInsert;

export type AcademicResult = typeof academicResults.$inferSelect;
export type InsertAcademicResult = typeof academicResults.$inferInsert;

export type AcademicOfficial = typeof academicOfficials.$inferSelect;
export type InsertAcademicOfficial = typeof academicOfficials.$inferInsert;

export type OfficialAssignment = typeof officialAssignments.$inferSelect;
export type InsertOfficialAssignment = typeof officialAssignments.$inferInsert;