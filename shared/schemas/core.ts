import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================================================
// CORE DOMAIN SCHEMA
// =============================================================================
// Authentication, Billing, Permissions, Platform Settings, Shared Catalogs
//
// 36 core tables shared across all domains:
// - Authentication & Sessions (sessions, users, passwordResetTokens)
// - Organizations & Permissions (organizations, rolePermissions, etc.)
// - Configuration (whitelabelConfigs, clientConfigurations, etc.)
// - Compliance & Audit (complianceAuditLog, dataProcessingAgreements)
// - Billing (discountCodes, paymentPlans, etc.)
// - Analytics (platformAnalytics, usageAnalytics, nightlyAnalysis)
// - Communications (messages, messageRecipients, etc.)
// - Nonprofit (donors, donations, nonprofitSubscriptions, etc.)
// - Email Marketing (emailCampaigns, campaignRecipients, contacts)
// - Shared Sports Catalog (sports, sportCategories, sportOptions)
// =============================================================================

// =============================================================================
// TABLE DEFINITIONS
// =============================================================================

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

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

export const sportCategories = pgTable("sport_categories", {
  id: varchar("id").primaryKey(),
  categoryName: text("category_name").notNull(),
  categoryDescription: text("category_description"),
  sortOrder: integer("category_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

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

export const permissionTemplates = pgTable("permission_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: varchar("template_name").notNull(),
  roleType: varchar("role_type").notNull(),
  subscriptionTier: varchar("subscription_tier").notNull(),
  permissions: jsonb("permissions").notNull(),
  restrictions: jsonb("restrictions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

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

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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


// =============================================================================

export const userOrganizationRoles: any = pgTable("user_organization_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id"),
  roleWithinOrg: varchar("role_within_org").notNull(),
  permissionsOverride: jsonb("permissions_override"),
  assignmentDate: timestamp("assignment_date").default(sql`now()`),
  status: varchar("status").default("active"), // active, suspended, terminated
});
// INSERT SCHEMAS
// =============================================================================

// Users
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  subscriptionStatus: true,
  totalTournamentsCreated: true,
  currentMonthTournaments: true,
  lastMonthReset: true,
  hipaaTrainingCompleted: true,
  ferpaAgreementSigned: true,
  createdAt: true,
  updatedAt: true,
});

// Organizations
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  isVerified: true,
  verificationNotes: true,
  registrationStatus: true,
  createdAt: true,
  updatedAt: true,
});

// Whitelabel Configs
export const insertWhitelabelConfigSchema = createInsertSchema(whitelabelConfigs).omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

// Contacts
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Donors
export const insertDonorSchema = createInsertSchema(donors).omit({
  id: true,
  createdAt: true,
});

// Donations
export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

// Tax Exemption Documents
export const insertTaxExemptionDocumentSchema = createInsertSchema(taxExemptionDocuments).omit({
  id: true,
  uploadedAt: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Nonprofit Subscriptions
export const insertNonprofitSubscriptionSchema = createInsertSchema(nonprofitSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Nonprofit Invoices
export const insertNonprofitInvoiceSchema = createInsertSchema(nonprofitInvoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Sport Categories
export const insertSportCategorySchema = createInsertSchema(sportCategories).omit({
  id: true,
});

// Sport Options
export const insertSportOptionSchema = createInsertSchema(sportOptions).omit({
  id: true,
  createdAt: true,
});

// User Dashboard Configs
export const insertUserDashboardConfigSchema = createInsertSchema(userDashboardConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Permission Assignments
export const insertPermissionAssignmentSchema = createInsertSchema(permissionAssignments).omit({
  id: true,
});

// Permission Templates
export const insertPermissionTemplateSchema = createInsertSchema(permissionTemplates).omit({
  id: true,
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Session = typeof sessions.$inferSelect;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

export type PermissionAssignment = typeof permissionAssignments.$inferSelect;
export type InsertPermissionAssignment = z.infer<typeof insertPermissionAssignmentSchema>;

export type PermissionTemplate = typeof permissionTemplates.$inferSelect;
export type InsertPermissionTemplate = z.infer<typeof insertPermissionTemplateSchema>;

export type WhitelabelConfig = typeof whitelabelConfigs.$inferSelect;
export type InsertWhitelabelConfig = z.infer<typeof insertWhitelabelConfigSchema>;

export type ClientConfiguration = typeof clientConfigurations.$inferSelect;
export type InsertClientConfiguration = typeof clientConfigurations.$inferInsert;

export type ApiConfiguration = typeof apiConfigurations.$inferSelect;
export type InsertApiConfiguration = typeof apiConfigurations.$inferInsert;

export type UserDashboardConfig = typeof userDashboardConfigs.$inferSelect;
export type InsertUserDashboardConfig = z.infer<typeof insertUserDashboardConfigSchema>;

export type ComplianceAuditLog = typeof complianceAuditLog.$inferSelect;
export type InsertComplianceAuditLog = typeof complianceAuditLog.$inferInsert;

export type DataProcessingAgreement = typeof dataProcessingAgreements.$inferSelect;
export type InsertDataProcessingAgreement = typeof dataProcessingAgreements.$inferInsert;

export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;

export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = typeof paymentPlans.$inferInsert;

export type PaymentPlanEnrollment = typeof paymentPlanEnrollments.$inferSelect;
export type InsertPaymentPlanEnrollment = typeof paymentPlanEnrollments.$inferInsert;

export type PaymentPlanInstallment = typeof paymentPlanInstallments.$inferSelect;
export type InsertPaymentPlanInstallment = typeof paymentPlanInstallments.$inferInsert;

export type PlatformAnalytic = typeof platformAnalytics.$inferSelect;
export type InsertPlatformAnalytic = typeof platformAnalytics.$inferInsert;

export type UsageAnalytic = typeof usageAnalytics.$inferSelect;
export type InsertUsageAnalytic = typeof usageAnalytics.$inferInsert;

export type NightlyAnalysis = typeof nightlyAnalysis.$inferSelect;
export type InsertNightlyAnalysis = typeof nightlyAnalysis.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type InsertMessageRecipient = typeof messageRecipients.$inferInsert;

export type MessageUsage = typeof messageUsage.$inferSelect;
export type InsertMessageUsage = typeof messageUsage.$inferInsert;

export type MobileDevice = typeof mobileDevices.$inferSelect;
export type InsertMobileDevice = typeof mobileDevices.$inferInsert;

export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

export type TaxExemptionDocument = typeof taxExemptionDocuments.$inferSelect;
export type InsertTaxExemptionDocument = z.infer<typeof insertTaxExemptionDocumentSchema>;

export type NonprofitSubscription = typeof nonprofitSubscriptions.$inferSelect;
export type InsertNonprofitSubscription = z.infer<typeof insertNonprofitSubscriptionSchema>;

export type NonprofitInvoice = typeof nonprofitInvoices.$inferSelect;
export type InsertNonprofitInvoice = z.infer<typeof insertNonprofitInvoiceSchema>;

export type EducationalImpactMetric = typeof educationalImpactMetrics.$inferSelect;
export type InsertEducationalImpactMetric = typeof educationalImpactMetrics.$inferInsert;

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaignRecipients.$inferInsert;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Sport = typeof sports.$inferSelect;
export type InsertSport = typeof sports.$inferInsert;

export type SportCategory = typeof sportCategories.$inferSelect;
export type InsertSportCategory = z.infer<typeof insertSportCategorySchema>;

export type SportOption = typeof sportOptions.$inferSelect;
export type InsertSportOption = z.infer<typeof insertSportOptionSchema>;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;


// =============================================================================
// RELATIONS
// =============================================================================
// Note: Relations involving tables from other domains (Fantasy, District, Tournament)
// are defined in those respective schema files to avoid circular dependencies.
// Core tables are imported into other schemas as needed.
//
// Example: tournaments.ownerId references users.id (from Core)
// This relation is defined in tournament.ts, not here.
// =============================================================================

// Password Reset Tokens -> Users
export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

// Whitelabel Configs -> Users
export const whitelabelConfigsRelations = relations(whitelabelConfigs, ({ one }) => ({
  user: one(users, {
    fields: [whitelabelConfigs.userId],
    references: [users.id],
  }),
}));

// Organizations (self-referential for parent org)
export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  parentOrganization: one(organizations, {
    fields: [organizations.parentOrganizationId],
    references: [organizations.id],
    relationName: "parentChildOrgs",
  }),
  childOrganizations: many(organizations, {
    relationName: "parentChildOrgs",
  }),
}));

// Users -> Organizations
export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

// Campaign Recipients -> Email Campaigns and Contacts
export const campaignRecipientsRelations = relations(campaignRecipients, ({ one }) => ({
  campaign: one(emailCampaigns, {
    fields: [campaignRecipients.campaignId],
    references: [emailCampaigns.id],
  }),
  contact: one(contacts, {
    fields: [campaignRecipients.contactId],
    references: [contacts.id],
  }),
}));

// Email Campaigns -> Users
export const emailCampaignsRelations = relations(emailCampaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [emailCampaigns.userId],
    references: [users.id],
  }),
  recipients: many(campaignRecipients),
}));

// Message Recipients -> Messages and Users
export const messageRecipientsRelations = relations(messageRecipients, ({ one }) => ({
  message: one(messages, {
    fields: [messageRecipients.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageRecipients.userId],
    references: [users.id],
  }),
}));

// Messages -> Users (sender)
export const messagesRelations = relations(messages, ({ one, many }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  recipients: many(messageRecipients),
}));

// Mobile Devices -> Users
export const mobileDevicesRelations = relations(mobileDevices, ({ one }) => ({
  user: one(users, {
    fields: [mobileDevices.userId],
    references: [users.id],
  }),
}));

// Donors -> Users
export const donorsRelations = relations(donors, ({ one, many }) => ({
  user: one(users, {
    fields: [donors.userId],
    references: [users.id],
  }),
  donations: many(donations),
}));

// Donations -> Donors
export const donationsRelations = relations(donations, ({ one }) => ({
  donor: one(donors, {
    fields: [donations.donorId],
    references: [donors.id],
  }),
}));

// Nonprofit Invoices -> Nonprofit Subscriptions
export const nonprofitInvoicesRelations = relations(nonprofitInvoices, ({ one }) => ({
  subscription: one(nonprofitSubscriptions, {
    fields: [nonprofitInvoices.subscriptionId],
    references: [nonprofitSubscriptions.id],
  }),
}));

