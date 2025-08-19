import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  index,
  integer
} from "drizzle-orm/pg-core";
import { users } from "./schema";

// Assignment status types
export const assignmentStatusEnum = pgEnum('assignment_status', [
  'open',           // Available for coaches to sign up
  'assigned',       // Coach has signed up
  'confirmed',      // Athletic Coordinator has confirmed
  'completed',      // Event completed
  'cancelled'       // Event cancelled
]);

// Swap request status
export const swapStatusEnum = pgEnum('swap_status', [
  'pending',        // Waiting for response
  'approved',       // Both parties agreed
  'denied',         // Request declined
  'cancelled',      // Request withdrawn
  'expired'         // Request timed out
]);

// Event types for scorekeeper assignments
export const eventTypeEnum = pgEnum('event_type', [
  'throwing',       // Discus, shot put, javelin
  'jumping',        // Long jump, high jump, pole vault
  'running',        // Track events
  'field',          // General field events
  'combined'        // Multiple event types
]);

// Division types
export const divisionEnum = pgEnum('division', [
  'boys',
  'girls', 
  'mixed'
]);

// School level types
export const levelEnum = pgEnum('level', [
  'elementary',
  'middle_school',
  'high_school',
  'junior_varsity',
  'varsity'
]);

// Main scorekeeper assignments table
export const scorekeeperAssignments = pgTable("scorekeeper_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id"), // References events table when available
  
  // Event Details
  eventName: varchar("event_name").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  eventDate: timestamp("event_date").notNull(),
  eventTime: varchar("event_time").notNull(), // "5:30 PM"
  location: varchar("location").notNull(),
  venue: varchar("venue"), // Specific venue details
  
  // Competition Details
  division: divisionEnum("division").notNull(),
  level: levelEnum("level").notNull(),
  expectedParticipants: integer("expected_participants"),
  
  // Assignment Details
  status: assignmentStatusEnum("status").default("open"),
  assignedCoachId: varchar("assigned_coach_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  confirmedAt: timestamp("confirmed_at"),
  
  // Administrative
  athleticCoordinatorId: varchar("athletic_coordinator_id").notNull().references(() => users.id),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  
  // Requirements
  requiredQualifications: jsonb("required_qualifications").$type<string[]>(), // ["throwing_certified", "first_aid"]
  equipmentNeeded: jsonb("equipment_needed").$type<string[]>(), // ["measuring_tape", "rake"]
  specialInstructions: text("special_instructions"),
  
  // Scheduling
  setupTime: varchar("setup_time"), // Time to arrive before event
  estimatedDuration: integer("estimated_duration_minutes"),
  canSwap: boolean("can_swap").default(true),
  swapDeadline: timestamp("swap_deadline"), // Last date swaps allowed
  
  // Contact Info
  contactPersonId: varchar("contact_person_id").references(() => users.id),
  emergencyContact: varchar("emergency_contact"),
  emergencyPhone: varchar("emergency_phone"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_assignments_date").on(table.eventDate),
  index("idx_assignments_coach").on(table.assignedCoachId),
  index("idx_assignments_status").on(table.status),
  index("idx_assignments_coordinator").on(table.athleticCoordinatorId),
]);

// Swap requests between coaches
export const swapRequests = pgTable("swap_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Request Details
  requestedById: varchar("requested_by_id").notNull().references(() => users.id),
  targetCoachId: varchar("target_coach_id").notNull().references(() => users.id),
  
  // Assignment Details
  requestedAssignmentId: varchar("requested_assignment_id").notNull().references(() => scorekeeperAssignments.id),
  targetAssignmentId: varchar("target_assignment_id").notNull().references(() => scorekeeperAssignments.id),
  
  // Request Information
  reason: text("reason").notNull(),
  additionalNotes: text("additional_notes"),
  
  // Status & Timing
  status: swapStatusEnum("status").default("pending"),
  expiresAt: timestamp("expires_at"), // Auto-expire after X hours
  
  // Response
  respondedAt: timestamp("responded_at"),
  responseNotes: text("response_notes"),
  
  // Approval Process
  requiresCoordinatorApproval: boolean("requires_coordinator_approval").default(false),
  coordinatorApprovedAt: timestamp("coordinator_approved_at"),
  coordinatorApprovedById: varchar("coordinator_approved_by_id").references(() => users.id),
  
  // Metadata
  requestIP: varchar("request_ip"), // For security logging
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_swaps_requester").on(table.requestedById),
  index("idx_swaps_target").on(table.targetCoachId),
  index("idx_swaps_status").on(table.status),
  index("idx_swaps_expires").on(table.expiresAt),
]);

// Coach availability and preferences
export const coachAvailability = pgTable("coach_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  
  // Availability Windows
  availableDays: jsonb("available_days").$type<string[]>(), // ["monday", "tuesday", "friday"]
  availableTimeSlots: jsonb("available_time_slots").$type<{
    start: string; // "14:00" 
    end: string;   // "18:00"
    days: string[];
  }[]>(),
  
  // Preferences
  preferredEventTypes: jsonb("preferred_event_types").$type<string[]>(), // ["throwing", "jumping"]
  preferredLevels: jsonb("preferred_levels").$type<string[]>(), // ["middle_school", "high_school"]
  maxAssignmentsPerMonth: integer("max_assignments_per_month").default(4),
  
  // Qualifications
  certifications: jsonb("certifications").$type<{
    name: string;
    issuer: string;
    expiryDate: string;
  }[]>(),
  specialties: jsonb("specialties").$type<string[]>(), // ["discus_throwing", "first_aid"]
  
  // Restrictions
  blackoutDates: jsonb("blackout_dates").$type<{
    startDate: string;
    endDate: string;
    reason: string;
  }[]>(),
  canWorkWeekends: boolean("can_work_weekends").default(true),
  travelDistance: integer("travel_distance_miles"), // Max travel distance
  
  // Notifications
  notifyOfNewAssignments: boolean("notify_of_new_assignments").default(true),
  notifyOfSwapRequests: boolean("notify_of_swap_requests").default(true),
  preferredNotificationMethod: varchar("preferred_notification_method").default("email"), // email, sms, both
  
  // Emergency Info
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  medicalConditions: text("medical_conditions"), // Relevant conditions for athletic events
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_availability_coach").on(table.coachId),
]);

// Assignment history and performance tracking
export const assignmentHistory = pgTable("assignment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").notNull().references(() => scorekeeperAssignments.id),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  
  // Performance Metrics
  arrivedOnTime: boolean("arrived_on_time"),
  completedAllTasks: boolean("completed_all_tasks"),
  equipmentProperlyMaintained: boolean("equipment_properly_maintained"),
  
  // Feedback
  coordinatorRating: integer("coordinator_rating"), // 1-5 scale
  coordinatorNotes: text("coordinator_notes"),
  coachSelfRating: integer("coach_self_rating"), // 1-5 scale
  coachNotes: text("coach_notes"),
  
  // Issues
  hadIssues: boolean("had_issues").default(false),
  issueDescription: text("issue_description"),
  resolutionNotes: text("resolution_notes"),
  
  // Event Data
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  participantCount: integer("participant_count"),
  weatherConditions: varchar("weather_conditions"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_history_assignment").on(table.assignmentId),
  index("idx_history_coach").on(table.coachId),
]);

// Notification templates and logs
export const scorekeeperNotifications = pgTable("scorekeeper_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  
  // Notification Details
  type: varchar("type").notNull(), // "assignment_available", "swap_request", "assignment_reminder"
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  
  // Related Records
  assignmentId: varchar("assignment_id").references(() => scorekeeperAssignments.id),
  swapRequestId: varchar("swap_request_id").references(() => swapRequests.id),
  
  // Delivery
  status: varchar("status").default("pending"), // pending, sent, delivered, failed
  sentAt: timestamp("sent_at"),
  readAt: timestamp("read_at"),
  deliveryMethod: varchar("delivery_method"), // email, sms, push, in_app
  
  // Priority
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  expiresAt: timestamp("expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_recipient").on(table.recipientId),
  index("idx_notifications_status").on(table.status),
  index("idx_notifications_type").on(table.type),
]);

export type ScorekeeperAssignment = typeof scorekeeperAssignments.$inferSelect;
export type InsertScorekeeperAssignment = typeof scorekeeperAssignments.$inferInsert;
export type SwapRequest = typeof swapRequests.$inferSelect;
export type InsertSwapRequest = typeof swapRequests.$inferInsert;
export type CoachAvailability = typeof coachAvailability.$inferSelect;
export type InsertCoachAvailability = typeof coachAvailability.$inferInsert;
export type AssignmentHistory = typeof assignmentHistory.$inferSelect;
export type InsertAssignmentHistory = typeof assignmentHistory.$inferInsert;
export type ScorekeeperNotification = typeof scorekeeperNotifications.$inferSelect;
export type InsertScorekeeperNotification = typeof scorekeeperNotifications.$inferInsert;