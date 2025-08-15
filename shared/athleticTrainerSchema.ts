import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Athletic Trainer Profile and Settings
export const athleticTrainerProfiles = pgTable("athletic_trainer_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(), // References users table
  organizationId: varchar("organization_id").notNull(),
  licenseNumber: varchar("license_number"),
  licenseExpiration: date("license_expiration"),
  certifications: jsonb("certifications").$type<{
    cpr?: { expiration: string; certifyingBody: string };
    aed?: { expiration: string; certifyingBody: string };
    firstAid?: { expiration: string; certifyingBody: string };
    other?: Array<{ name: string; expiration: string; certifyingBody: string }>;
  }>(),
  specialties: jsonb("specialties").$type<string[]>(),
  contactInfo: jsonb("contact_info").$type<{
    phone: string;
    emergencyPhone: string;
    email: string;
    office: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Student Athletes under Athletic Trainer care
export const athleteRoster = pgTable("athlete_roster", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainerId: varchar("trainer_id").notNull(), // References athletic_trainer_profiles
  athleteId: varchar("athlete_id").notNull(), // References users table where userRole = 'athlete'
  organizationId: varchar("organization_id").notNull(),
  sport: varchar("sport"),
  season: varchar("season"),
  grade: varchar("grade"),
  parentContacts: jsonb("parent_contacts").$type<Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    isPrimary: boolean;
  }>>(),
  medicalAlerts: jsonb("medical_alerts").$type<Array<{
    condition: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    medications?: string[];
    emergencyProcedure?: string;
  }>>(),
  status: text("status", { enum: ["active", "injured", "cleared", "suspended"] }).default("active"),
  dateAdded: timestamp("date_added").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Medical Documents Storage
export const medicalDocuments = pgTable("medical_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(), // trainer or athlete
  documentType: text("document_type", {
    enum: [
      "physical_exam",
      "xray",
      "mri",
      "ct_scan",
      "lab_results",
      "doctor_note",
      "physical_therapy_report",
      "injury_report",
      "clearance_form",
      "medication_list",
      "allergy_info",
      "emergency_contact",
      "insurance_card",
      "other"
    ]
  }).notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileSize: integer("file_size"),
  description: text("description"),
  doctorName: varchar("doctor_name"),
  facilityName: varchar("facility_name"),
  dateOfService: date("date_of_service"),
  isConfidential: boolean("is_confidential").default(true),
  accessLevel: text("access_level", {
    enum: ["trainer_only", "medical_staff", "coach_approved", "parent_shared"]
  }).default("trainer_only"),
  tags: jsonb("tags").$type<string[]>(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  lastViewed: timestamp("last_viewed"),
});

// Care Plans and Treatment Protocols
export const carePlans = pgTable("care_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull(),
  trainerId: varchar("trainer_id").notNull(),
  planType: text("plan_type", {
    enum: [
      "injury_recovery",
      "prevention",
      "conditioning",
      "return_to_play",
      "chronic_condition",
      "emergency_action"
    ]
  }).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  goals: jsonb("goals").$type<Array<{
    goal: string;
    target: string;
    timeline: string;
    status: "not_started" | "in_progress" | "completed";
  }>>(),
  protocols: jsonb("protocols").$type<Array<{
    step: number;
    instruction: string;
    frequency: string;
    duration: string;
    notes?: string;
  }>>(),
  restrictions: jsonb("restrictions").$type<Array<{
    activity: string;
    level: "none" | "modified" | "prohibited";
    duration: string;
    notes?: string;
  }>>(),
  medications: jsonb("medications").$type<Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy: string;
  }>>(),
  followUpSchedule: jsonb("follow_up_schedule").$type<Array<{
    date: string;
    type: string;
    notes?: string;
    completed: boolean;
  }>>(),
  status: text("status", { enum: ["active", "completed", "paused", "cancelled"] }).default("active"),
  startDate: date("start_date").notNull(),
  targetEndDate: date("target_end_date"),
  actualEndDate: date("actual_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communication and Messages
export const trainerCommunications = pgTable("trainer_communications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull(),
  toUserId: varchar("to_user_id").notNull(),
  athleteId: varchar("athlete_id"), // If message is about specific athlete
  messageType: text("message_type", {
    enum: [
      "injury_report",
      "clearance_update",
      "parent_notification",
      "coach_update",
      "doctor_communication",
      "general_message",
      "emergency_alert"
    ]
  }).notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  priority: text("priority", { enum: ["low", "normal", "high", "urgent"] }).default("normal"),
  isRead: boolean("is_read").default(false),
  requiresResponse: boolean("requires_response").default(false),
  responseReceived: boolean("response_received").default(false),
  attachments: jsonb("attachments").$type<Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>>(),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  respondedAt: timestamp("responded_at"),
});

// Supply and Equipment Management
export const medicalSupplies = pgTable("medical_supplies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  managedBy: varchar("managed_by").notNull(), // trainer managing inventory
  itemName: varchar("item_name").notNull(),
  category: text("category", {
    enum: [
      "first_aid",
      "emergency_equipment",
      "rehabilitation",
      "protective_gear",
      "medications",
      "diagnostic_tools",
      "cleaning_supplies",
      "office_supplies"
    ]
  }).notNull(),
  currentStock: integer("current_stock").notNull(),
  minimumStock: integer("minimum_stock").notNull(),
  maxStock: integer("max_stock"),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }),
  supplier: varchar("supplier"),
  lastRestocked: date("last_restocked"),
  expirationDate: date("expiration_date"),
  location: varchar("location"), // Where item is stored
  notes: text("notes"),
  isLowStock: boolean("is_low_stock").default(false),
  needsReorder: boolean("needs_reorder").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Equipment Maintenance and Checks
export const equipmentChecks = pgTable("equipment_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  performedBy: varchar("performed_by").notNull(),
  equipmentType: text("equipment_type", {
    enum: [
      "aed",
      "emergency_bags",
      "ice_machines",
      "treatment_tables",
      "rehabilitation_equipment",
      "protective_gear",
      "emergency_phones",
      "first_aid_kits"
    ]
  }).notNull(),
  equipmentId: varchar("equipment_id"), // Specific equipment identifier
  checkType: text("check_type", {
    enum: ["daily", "weekly", "monthly", "annual", "post_incident", "maintenance"]
  }).notNull(),
  checkDate: date("check_date").notNull(),
  nextCheckDue: date("next_check_due"),
  status: text("status", { enum: ["passed", "failed", "needs_maintenance", "needs_replacement"] }).notNull(),
  checklist: jsonb("checklist").$type<Array<{
    item: string;
    status: "pass" | "fail" | "na";
    notes?: string;
  }>>(),
  issues: jsonb("issues").$type<Array<{
    issue: string;
    severity: "low" | "medium" | "high" | "critical";
    actionTaken?: string;
    followUpRequired: boolean;
  }>>(),
  notes: text("notes"),
  photos: jsonb("photos").$type<Array<{
    fileName: string;
    fileUrl: string;
    description?: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Certification Tracking for Staff
export const staffCertifications = pgTable("staff_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  organizationId: varchar("organization_id").notNull(),
  certificationType: text("certification_type", {
    enum: [
      "cpr",
      "aed",
      "first_aid",
      "concussion_training",
      "heat_illness_prevention",
      "coaching_certification",
      "background_check",
      "safesport_training",
      "other"
    ]
  }).notNull(),
  certificationName: varchar("certification_name").notNull(),
  certifyingBody: varchar("certifying_body").notNull(),
  certificationNumber: varchar("certification_number"),
  issueDate: date("issue_date").notNull(),
  expirationDate: date("expiration_date").notNull(),
  renewalRequired: boolean("renewal_required").default(true),
  documentUrl: varchar("document_url"),
  status: text("status", {
    enum: ["current", "expiring_soon", "expired", "renewal_pending"]
  }).default("current"),
  remindersSent: integer("reminders_sent").default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export type AthleticTrainerProfile = typeof athleticTrainerProfiles.$inferSelect;
export type InsertAthleticTrainerProfile = typeof athleticTrainerProfiles.$inferInsert;

export type AthleteRoster = typeof athleteRoster.$inferSelect;
export type InsertAthleteRoster = typeof athleteRoster.$inferInsert;

export type MedicalDocument = typeof medicalDocuments.$inferSelect;
export type InsertMedicalDocument = typeof medicalDocuments.$inferInsert;

export type CarePlan = typeof carePlans.$inferSelect;
export type InsertCarePlan = typeof carePlans.$inferInsert;

export type TrainerCommunication = typeof trainerCommunications.$inferSelect;
export type InsertTrainerCommunication = typeof trainerCommunications.$inferInsert;

export type MedicalSupply = typeof medicalSupplies.$inferSelect;
export type InsertMedicalSupply = typeof medicalSupplies.$inferInsert;

export type EquipmentCheck = typeof equipmentChecks.$inferSelect;
export type InsertEquipmentCheck = typeof equipmentChecks.$inferInsert;

export type StaffCertification = typeof staffCertifications.$inferSelect;
export type InsertStaffCertification = typeof staffCertifications.$inferInsert;

// Zod schemas for validation
export const insertAthleticTrainerProfileSchema = createInsertSchema(athleticTrainerProfiles);
export const insertAthleteRosterSchema = createInsertSchema(athleteRoster);
export const insertMedicalDocumentSchema = createInsertSchema(medicalDocuments);
export const insertCarePlanSchema = createInsertSchema(carePlans);
export const insertTrainerCommunicationSchema = createInsertSchema(trainerCommunications);
export const insertMedicalSupplySchema = createInsertSchema(medicalSupplies);
export const insertEquipmentCheckSchema = createInsertSchema(equipmentChecks);
export const insertStaffCertificationSchema = createInsertSchema(staffCertifications);