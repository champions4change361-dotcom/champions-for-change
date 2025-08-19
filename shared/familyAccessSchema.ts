import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { users, students } from "./schema";

// Family relationship types
export const relationshipEnum = pgEnum('relationship_type', [
  'parent',
  'guardian', 
  'grandparent',
  'aunt_uncle',
  'sibling',
  'family_friend',
  'emergency_contact'
]);

// Access levels for family members
export const accessLevelEnum = pgEnum('access_level', [
  'full',           // Real-time location, schedules, notifications
  'events_only',    // Schedules and results, no real-time location
  'results_only',   // Final results after events complete
  'none'           // No access
]);

// Verification status
export const verificationStatusEnum = pgEnum('verification_status', [
  'pending',
  'verified',
  'denied',
  'revoked'
]);

// Family member access control
export const familyMembers = pgTable("family_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  userId: varchar("user_id").references(() => users.id), // Linked after verification
  
  // Personal Information
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  relationship: relationshipEnum("relationship").notNull(),
  
  // Verification Information
  verificationStatus: verificationStatusEnum("verification_status").default("pending"),
  verificationMethod: text("verification_method"), // "school_records", "parent_approval", "emergency_contact"
  verificationDocumentPath: varchar("verification_document_path"), // ID upload, custody docs, etc.
  
  // Access Control
  accessLevel: accessLevelEnum("access_level").default("none"),
  canViewLocation: boolean("can_view_location").default(false),
  canReceiveNotifications: boolean("can_receive_notifications").default(false),
  canAccessMedicalInfo: boolean("can_access_medical_info").default(false),
  isEmergencyContact: boolean("is_emergency_contact").default(false),
  
  // Approval Trail
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  approvalNotes: text("approval_notes"),
  
  // Activity Tracking
  lastActive: timestamp("last_active"),
  accessExpiryDate: timestamp("access_expiry_date"), // For temporary access
  
  // Security
  ipWhitelist: jsonb("ip_whitelist").$type<string[]>(), // Allowed IP addresses
  deviceFingerprints: jsonb("device_fingerprints").$type<string[]>(), // Trusted devices
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_family_student").on(table.studentId),
  index("idx_family_verification").on(table.verificationStatus),
  index("idx_family_access").on(table.accessLevel),
]);

// Family access requests (before verification)
export const familyAccessRequests = pgTable("family_access_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  
  // Requester Information
  requesterName: varchar("requester_name").notNull(),
  requesterEmail: varchar("requester_email").notNull(),
  requesterPhone: varchar("requester_phone"),
  relationship: relationshipEnum("relationship").notNull(),
  
  // Request Details
  requestedAccessLevel: accessLevelEnum("requested_access_level").notNull(),
  requestReason: text("request_reason"),
  
  // Verification Documents
  identificationDocumentPath: varchar("identification_document_path"),
  relationshipProofPath: varchar("relationship_proof_path"), // Birth cert, custody docs
  
  // Request Status
  status: verificationStatusEnum("status").default("pending"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  
  // Security
  requestIP: varchar("request_ip"),
  requestUserAgent: text("request_user_agent"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_requests_student").on(table.studentId),
  index("idx_requests_status").on(table.status),
]);

// Audit trail for all family access activities
export const familyAccessAuditLog = pgTable("family_access_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => students.id),
  familyMemberId: varchar("family_member_id").references(() => familyMembers.id),
  
  // Action Details
  actionType: text("action_type", {
    enum: [
      "access_requested",
      "access_approved", 
      "access_denied",
      "access_revoked",
      "access_modified",
      "location_viewed",
      "schedule_accessed",
      "notification_sent",
      "emergency_access_used"
    ]
  }).notNull(),
  
  // Actor Information
  performedBy: varchar("performed_by").references(() => users.id),
  performedByRole: varchar("performed_by_role"), // parent, athletic_director, principal
  
  // Context
  description: text("description").notNull(),
  previousValue: text("previous_value"), // For modifications
  newValue: text("new_value"), // For modifications
  
  // Security Context
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  deviceFingerprint: varchar("device_fingerprint"),
  
  // Location/Event Context (when applicable)
  eventId: varchar("event_id"), // If related to specific event
  locationLat: varchar("location_lat"), // If location access was used
  locationLng: varchar("location_lng"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_audit_student").on(table.studentId),
  index("idx_audit_family_member").on(table.familyMemberId),
  index("idx_audit_action").on(table.actionType),
  index("idx_audit_created").on(table.createdAt),
]);

// Location access permissions (real-time tracking)
export const locationAccessPermissions = pgTable("location_access_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyMemberId: varchar("family_member_id").notNull().references(() => familyMembers.id),
  studentId: varchar("student_id").notNull().references(() => students.id),
  
  // Permission Details
  canViewRealTimeLocation: boolean("can_view_real_time_location").default(false),
  locationAccessStartTime: timestamp("location_access_start_time"),
  locationAccessEndTime: timestamp("location_access_end_time"),
  
  // Geofencing
  allowedVenues: jsonb("allowed_venues").$type<{
    venueId: string;
    venueName: string;
    address: string;
    coordinates: { lat: number; lng: number };
  }[]>(),
  
  // Usage Tracking
  lastLocationAccess: timestamp("last_location_access"),
  locationAccessCount: varchar("location_access_count").default("0"),
  
  // Emergency Override
  emergencyAccess: boolean("emergency_access").default(false),
  emergencyAccessGrantedBy: varchar("emergency_access_granted_by").references(() => users.id),
  emergencyAccessExpiry: timestamp("emergency_access_expiry"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_location_family_member").on(table.familyMemberId),
  index("idx_location_student").on(table.studentId),
]);

// Family notification preferences
export const familyNotificationSettings = pgTable("family_notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  familyMemberId: varchar("family_member_id").notNull().references(() => familyMembers.id),
  
  // Notification Types
  eventReminders: boolean("event_reminders").default(true),
  scheduleChanges: boolean("schedule_changes").default(true),
  results: boolean("results").default(true),
  emergencyAlerts: boolean("emergency_alerts").default(true),
  checkInReminders: boolean("check_in_reminders").default(true),
  
  // Delivery Methods
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(false),
  
  // Timing Preferences
  advanceNoticeMinutes: varchar("advance_notice_minutes").default("30"), // Minutes before event
  quietHours: jsonb("quiet_hours").$type<{
    start: string; // "22:00"
    end: string;   // "07:00"
    timezone: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_notifications_family_member").on(table.familyMemberId),
]);

export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = typeof familyMembers.$inferInsert;
export type FamilyAccessRequest = typeof familyAccessRequests.$inferSelect;
export type InsertFamilyAccessRequest = typeof familyAccessRequests.$inferInsert;
export type FamilyAccessAuditLog = typeof familyAccessAuditLog.$inferSelect;
export type InsertFamilyAccessAuditLog = typeof familyAccessAuditLog.$inferInsert;
export type LocationAccessPermission = typeof locationAccessPermissions.$inferSelect;
export type InsertLocationAccessPermission = typeof locationAccessPermissions.$inferInsert;
export type FamilyNotificationSettings = typeof familyNotificationSettings.$inferSelect;
export type InsertFamilyNotificationSettings = typeof familyNotificationSettings.$inferInsert;