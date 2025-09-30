import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// References to Core domain tables
import { users, sports } from "./core";

// =============================================================================
// DISTRICT DOMAIN SCHEMA
// =============================================================================
// School District Management - HIPAA/FERPA Protected
//
// 44 district tables for school administration:
// - District & School Structure
// - Student & Athlete Management
// - Health & Medical (HIPAA/FERPA protected)
// - Academic Competitions (UIL)
// - Budget Management (Excel-style)
// - Athletic Management
// - Assignments & Permissions
// - Consent & Compliance
// =============================================================================

// =============================================================================
// TABLE DEFINITIONS
// =============================================================================

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

export const schools = pgTable("schools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  districtId: varchar("district_id").notNull().references(() => districts.id),
  name: varchar("name").notNull(), // "Roy Miller High School"
  abbreviation: varchar("abbreviation").notNull(), // "RMHS"
  schoolType: text("school_type", {
    enum: ["elementary", "middle", "high", "alternative", "specialty"]
  }).notNull(),
  vlcCode: varchar("vlc_code").notNull().unique(), // Venue Location Code for athletics
  ncessId: varchar("ncess_id"), // National Center for Education Statistics ID
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

// =============================================================================
// ACADEMIC COMPETITIONS FRAMEWORK (UIL EVENTS)
// =============================================================================

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

// Practice Sessions - Team practice scheduling

// Facility Reservations - Venue booking system
// COMPREHENSIVE SCHEDULING SYSTEM
// =============================================================================

// Games/Matches - Athletic competition scheduling

});
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


// =============================================================================
// INSERT SCHEMAS & TYPES
// =============================================================================

// Generate insert schemas for key tables
export const insertDistrictSchema = createInsertSchema(districts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSchoolSchema = createInsertSchema(schools).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAthleteSchema = createInsertSchema(athletes).omit({ id: true, createdAt: true });
export const insertStudentDataSchema = createInsertSchema(studentData).omit({ id: true, lastUpdated: true });
export const insertHealthDataSchema = createInsertSchema(healthData).omit({ id: true, lastUpdated: true });
export const insertInjuryIncidentSchema = createInsertSchema(injuryIncidents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHealthRiskAssessmentSchema = createInsertSchema(healthRiskAssessments).omit({ id: true, createdAt: true });
export const insertAcademicCompetitionSchema = createInsertSchema(academicCompetitions).omit({ id: true, createdAt: true });
export const insertDistrictBudgetSchema = createInsertSchema(districtBudgets).omit({ id: true, createdAt: true, updatedAt: true });

// Type exports
export type District = typeof districts.$inferSelect;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type AthleticVenue = typeof athleticVenues.$inferSelect;
export type SchoolAsset = typeof schoolAssets.$inferSelect;
export type StudentData = typeof studentData.$inferSelect;
export type HealthData = typeof healthData.$inferSelect;
export type Athlete = typeof athletes.$inferSelect;
export type InjuryIncident = typeof injuryIncidents.$inferSelect;
export type InjuryFollowUp = typeof injuryFollowUps.$inferSelect;
export type HealthRiskAssessment = typeof healthRiskAssessments.$inferSelect;
export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type AcademicEvent = typeof academicEvents.$inferSelect;
export type AcademicCompetition = typeof academicCompetitions.$inferSelect;
export type AcademicParticipant = typeof academicParticipants.$inferSelect;
export type AcademicResult = typeof academicResults.$inferSelect;
export type DistrictBudget = typeof districtBudgets.$inferSelect;
export type SchoolDepartmentBudget = typeof schoolDepartmentBudgets.$inferSelect;
export type SportProgramBudget = typeof sportProgramBudgets.$inferSelect;
export type ExpenseRecord = typeof expenseRecords.$inferSelect;
export type FacilityReservation = typeof facilityReservations.$inferSelect;
export type AthleticCalendarEvent = typeof athleticCalendarEvents.$inferSelect;
export type ScheduleConflict = typeof scheduleConflicts.$inferSelect;

// Relations are defined in their respective domains to avoid circular dependencies
