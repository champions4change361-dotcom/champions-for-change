import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, numeric, decimal, date, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User authentication table
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
    enum: ["free", "foundation", "starter", "professional", "champion", "enterprise", "district_enterprise", "tournament-organizer", "business-enterprise", "annual-pro"] 
  }).default("foundation"),
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
  customBranding: jsonb("custom_branding"), // Logo, colors, website theming
  isWhitelabelClient: boolean("is_whitelabel_client").default(false),
  whitelabelDomain: varchar("whitelabel_domain"),
  whitelabelBranding: jsonb("whitelabel_branding"), // Custom colors, logos, etc
  
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

  // BUSINESS REGISTRATION FIELDS
  phone: varchar("phone"),
  organizationType: text("organization_type", {
    enum: ["business", "nonprofit", "sports_club", "individual", "district", "school", "club"]
  }),
  description: text("description"),
  sportsInvolved: jsonb("sports_involved").$type<string[]>(),
  requestType: varchar("request_type"),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "check", "paypal", "bank_transfer"]
  }),
  pendingCheckAmount: varchar("pending_check_amount"),
  accountStatus: text("account_status", {
    enum: ["active", "pending_check_payment", "suspended", "under_review"]
  }).default("active"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HIPAA/FERPA Compliance Audit Trail
export const complianceAuditLog = pgTable("compliance_audit_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  actionType: text("action_type", {
    enum: ["data_access", "data_modification", "export", "view", "login", "permission_change"]
  }).notNull(),
  resourceType: text("resource_type", {
    enum: ["student_data", "health_data", "tournament_data", "administrative_data"]
  }).notNull(),
  resourceId: varchar("resource_id"), // ID of the specific record accessed
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  complianceNotes: text("compliance_notes"), // Additional context for audit
  createdAt: timestamp("created_at").defaultNow(),
});

// Student Privacy (FERPA) Protected Data
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

// Health Data (HIPAA) Protected Information
export const healthData = pgTable("health_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull().references(() => studentData.id),
  athleticTrainerId: varchar("athletic_trainer_id").notNull().references(() => users.id),
  medicalConditions: text("medical_conditions"), // Encrypted field
  medications: text("medications"), // Encrypted field
  allergies: text("allergies"), // Encrypted field
  injuryHistory: jsonb("injury_history"), // Encrypted field
  physicalsOnFile: boolean("physicals_on_file").default(false),
  physicalExpirationDate: date("physical_expiration_date"),
  concussionBaseline: jsonb("concussion_baseline"), // Encrypted baseline test results
  lastMedicalUpdate: timestamp("last_medical_update"),
  hipaaAuthorizationForm: varchar("hipaa_authorization_form"), // File path to signed form
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Data Processing Agreements for Districts
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

// White-label client configurations
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

// District Information with VLC-based organization
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

// Schools within Districts with VLC (Venue Location Code) system
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

// Athletic Venues and Facilities with VLC tracking
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

// School Assets (Images, Documents, Media) organized by VLC
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

// Contact database for marketing and outreach
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

// Donor contacts for donation tracking and follow-up
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

// Individual donation records
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

// Tax Exemption Documents for Nonprofit Organizations
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

// Flat Rate Billing System for Nonprofits (No Tax Collection)
export const nonprofitSubscriptions = pgTable("nonprofit_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull().references(() => organizations.id),
  billingContactUserId: varchar("billing_contact_user_id").notNull().references(() => users.id),
  subscriptionTier: text("subscription_tier", {
    enum: ["foundation", "champion", "enterprise", "district_enterprise"]
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

// Billing Invoices for Nonprofit Flat Rate System
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

// Organization registration and management
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

// Self-registration requests for review - ENHANCED WITH PROFESSIONAL FEATURES
export const registrationRequests = pgTable("registration_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requestType: text("request_type", {
    enum: ["district_admin", "school_admin", "coach", "scorekeeper"]
  }).notNull(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  position: varchar("position"),
  organizationName: varchar("organization_name").notNull(),
  organizationType: text("organization_type", {
    enum: ["school_district", "school", "club", "nonprofit"]
  }).notNull(),
  parentOrganization: varchar("parent_organization"),
  yearsExperience: integer("years_experience"),
  sportsInvolved: jsonb("sports_involved"),
  certifications: text("certifications"),
  references: jsonb("references"),
  requestReason: text("request_reason"),
  selectedTier: text("selected_tier", {
    enum: ["foundation", "champion", "enterprise"]
  }).default("foundation"),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "check", "pending"]
  }).default("pending"),
  stripeSessionId: varchar("stripe_session_id"),
  status: text("status", {
    enum: ["pending", "approved", "rejected", "needs_info", "payment_pending"]
  }).default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Registration form schemas
export const insertRegistrationRequestSchema = createInsertSchema(registrationRequests).omit({
  id: true,
  status: true,
  reviewNotes: true,
  reviewedBy: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  isVerified: true,
  verificationNotes: true,
  registrationStatus: true,
  createdAt: true,
  updatedAt: true,
});

export type RegistrationRequest = typeof registrationRequests.$inferSelect;
export type InsertRegistrationRequest = z.infer<typeof insertRegistrationRequestSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

// District schema and types
export const insertDistrictSchema = createInsertSchema(districts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// School schema and types
export const insertSchoolSchema = createInsertSchema(schools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Athletic Venue schema and types
export const insertAthleticVenueSchema = createInsertSchema(athleticVenues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// School Asset schema and types
export const insertSchoolAssetSchema = createInsertSchema(schoolAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type District = typeof districts.$inferSelect;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type School = typeof schools.$inferSelect;
export type InsertSchool = z.infer<typeof insertSchoolSchema>;
export type AthleticVenue = typeof athleticVenues.$inferSelect;
export type InsertAthleticVenue = z.infer<typeof insertAthleticVenueSchema>;
export type SchoolAsset = typeof schoolAssets.$inferSelect;
export type InsertSchoolAsset = z.infer<typeof insertSchoolAssetSchema>;

// Email campaigns for marketing
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

// Campaign recipients tracking
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

// Internal messaging system for tournaments and teams
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

// Message recipients tracking for mobile app notifications
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

// Mobile app device registration for push notifications
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

// Message usage tracking for tier limits
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

// Live scoring system with strict access control
export const liveScores = pgTable("live_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  matchId: varchar("match_id").notNull(), // Reference to specific bracket match
  eventName: varchar("event_name"), // For track & field: "Shot Put", "100m Dash", etc.
  
  // Participant info
  participant1Id: varchar("participant1_id"), // Team or individual athlete
  participant1Name: varchar("participant1_name").notNull(),
  participant1Score: numeric("participant1_score").default("0"),
  
  participant2Id: varchar("participant2_id"), // Team or individual athlete  
  participant2Name: varchar("participant2_name"),
  participant2Score: numeric("participant2_score").default("0"),
  
  // Score details for different sports
  scoreType: text("score_type", {
    enum: ["points", "time", "distance", "games", "sets", "goals", "runs", "custom"]
  }).default("points"),
  scoreUnit: varchar("score_unit"), // "seconds", "feet", "meters", "points"
  
  // Match status
  matchStatus: text("match_status", {
    enum: ["scheduled", "in_progress", "completed", "cancelled", "postponed"]
  }).default("scheduled"),
  winnerId: varchar("winner_id"), // ID of winning participant
  
  // Timing and location
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  venue: varchar("venue"),
  field: varchar("field"), // "Field 1", "Court A", "Track Lane 3"
  
  // Access control - WHO CAN UPDATE SCORES
  assignedScorekeeperId: varchar("assigned_scorekeeper_id").notNull().references(() => users.id),
  lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
  
  // Real-time features
  isLive: boolean("is_live").default(false), // Currently happening
  liveUpdateCount: integer("live_update_count").default(0),
  lastScoreUpdate: timestamp("last_score_update"),
  
  // Additional match data (for complex scoring)
  additionalData: jsonb("additional_data").$type<{
    sets?: Array<{setNumber: number; participant1Score: number; participant2Score: number}>;
    periods?: Array<{period: number; participant1Score: number; participant2Score: number}>;
    attempts?: Array<{participantId: string; attempt: number; result: string; distance?: number; time?: number}>;
    notes?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scorekeeper assignments - WHO can update which events
export const scorekeeperAssignments = pgTable("scorekeeper_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  scorekeeperId: varchar("scorekeeper_id").notNull().references(() => users.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id), // Tournament/Athletic Director
  
  // What they can score
  assignedEvents: jsonb("assigned_events").$type<string[]>().default([]), // Event names or IDs
  assignedVenues: jsonb("assigned_venues").$type<string[]>().default([]), // "Field 1", "Court A"
  
  // Permission level
  canUpdateScores: boolean("can_update_scores").default(true),
  canMarkMatchComplete: boolean("can_mark_match_complete").default(true),
  canSendMessages: boolean("can_send_messages").default(false), // Send live updates to coaches/parents
  
  // Status
  isActive: boolean("is_active").default(true),
  assignmentNotes: text("assignment_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live score updates log for audit trail
export const scoreUpdateLog = pgTable("score_update_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  liveScoreId: varchar("live_score_id").notNull().references(() => liveScores.id),
  updatedBy: varchar("updated_by").notNull().references(() => users.id),
  
  // What changed
  updateType: text("update_type", {
    enum: ["score_change", "status_change", "participant_change", "match_start", "match_end", "manual_correction"]
  }).notNull(),
  previousData: jsonb("previous_data"), // What it was before
  newData: jsonb("new_data"), // What it is now
  updateReason: varchar("update_reason"), // "Corrected scoring error", "Match completed"
  
  // Automatic bracket progression
  triggeredBracketUpdate: boolean("triggered_bracket_update").default(false),
  bracketUpdateDetails: jsonb("bracket_update_details").$type<{
    nextMatchId?: string;
    advancedParticipant?: string;
    eliminatedParticipant?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Instant messaging triggered by score events
export const liveScoreMessages = pgTable("live_score_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  liveScoreId: varchar("live_score_id").notNull().references(() => liveScores.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").references(() => users.id), // If direct message
  
  // Message details
  messageType: text("message_type", {
    enum: ["encouragement", "congratulations", "technique_tip", "performance_update", "coaching_note"]
  }).notNull(),
  content: text("content").notNull(),
  
  // Context from score
  relatedParticipantId: varchar("related_participant_id"), // Which athlete/team
  performanceContext: jsonb("performance_context").$type<{
    eventName: string;
    result?: string;
    isPersonalBest?: boolean;
    placement?: number;
    improvement?: string;
  }>(),
  
  // Auto-generation (AI coaching messages)
  isAutoGenerated: boolean("is_auto_generated").default(false),
  autoMessageTrigger: text("auto_message_trigger"), // "personal_best", "first_place", "improvement"
  
  // Delivery
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  deliveredViaPush: boolean("delivered_via_push").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Educational Impact Tracking for Champions for Change Mission
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

// Platform Analytics for Daniel's Revenue Tracking
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

// Role-Based Access Control for Five-Tier Hierarchy
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

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamSize: integer("team_size").notNull(),
  tournamentType: text("tournament_type", { enum: ["single", "double", "pool-play", "round-robin", "swiss-system"] }).notNull().default("single"),
  competitionFormat: text("competition_format", { enum: ["bracket", "leaderboard", "series", "bracket-to-series", "multi-stage"] }).notNull().default("bracket"),
  status: text("status", { enum: ["upcoming", "stage-1", "stage-2", "stage-3", "completed"] }).notNull().default("upcoming"),
  currentStage: integer("current_stage").default(1),
  totalStages: integer("total_stages").default(1),
  stageConfiguration: jsonb("stage_configuration"), // Defines each stage structure
  seriesLength: integer("series_length").default(7), // For series and bracket-to-series formats
  bracket: jsonb("bracket").notNull(),
  teams: jsonb("teams").default([]), // Tournament participants/teams - renamed from participants
  sport: text("sport"), // From Bubble SportOptions
  sportCategory: text("sport_category"), // From Bubble SportCategories
  tournamentStructure: text("tournament_structure"), // From Bubble TournamentStructures
  ageGroup: text("age_group", { 
    enum: ["Elementary", "Middle School", "High School", "College", "Adult", "Masters", "Senior", "All Ages"] 
  }).default("All Ages"),
  genderDivision: text("gender_division", { 
    enum: ["Men", "Women", "Mixed", "Boys", "Girls", "Co-Ed"] 
  }).default("Mixed"),
  divisions: jsonb("divisions"), // Multiple division categories within one tournament
  scoringMethod: text("scoring_method").default("wins"),
  userId: varchar("user_id").references(() => users.id), // Tournament owner
  whitelabelConfigId: varchar("whitelabel_config_id").references(() => whitelabelConfigs.id), // White-label client
  entryFee: numeric("entry_fee").default("0"), // Tournament entry fee
  maxParticipants: integer("max_participants"),
  registrationDeadline: timestamp("registration_deadline"),
  tournamentDate: timestamp("tournament_date"),
  location: text("location"),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  
  // DONATION MODULE FIELDS
  donationsEnabled: boolean("donations_enabled").default(false),
  donationGoal: numeric("donation_goal").default("0"),
  donationDescription: text("donation_description"),
  stripeAccountId: varchar("stripe_account_id"),
  registrationFeeEnabled: boolean("registration_fee_enabled").default(false),
  
  // AI CONTEXT FIELDS
  aiSetupProgress: jsonb("ai_setup_progress").$type<{
    donationModuleStep: 'not_started' | 'suggested' | 'creating' | 'stripe_setup' | 'testing' | 'complete';
    stripeAccountStatus: 'unknown' | 'none' | 'creating' | 'has_account' | 'keys_added' | 'validated';
    lastAIInteraction: string;
    completedSteps: string[];
    userResponses: Record<string, any>;
  }>(),
  
  aiContext: jsonb("ai_context").$type<{
    userTechLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredCommunicationStyle: 'detailed' | 'concise' | 'visual';
    hasAskedForHelp: boolean;
    previousQuestions: string[];
    successfulSetups: number;
  }>(),
  
  setupAssistanceLevel: text("setup_assistance_level", {
    enum: ["minimal", "standard", "full_guidance", "expert_mode"]
  }).default("standard"),
  
  donationSetupData: jsonb("donation_setup_data").$type<{
    goal: number;
    purpose: string;
    description: string;
    suggestedAmounts: number[];
    stripePublicKey?: string;
    stripeAccountId?: string;
    setupStartedAt?: string;
    setupCompletedAt?: string;
  }>(),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// CORPORATE COMPETITION DATABASE SYSTEM
// Comprehensive database for sales, production, and corporate tournaments

// Company Management
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  industry: varchar("industry"), // retail, manufacturing, tech, healthcare
  contactEmail: varchar("contact_email").notNull(),
  estimatedEmployees: varchar("estimated_employees"),
  subscriptionTier: varchar("subscription_tier").default("starter"), // starter, professional, enterprise
  
  // Registration code generation
  codePrefix: varchar("code_prefix").notNull(), // WALMART2024, AMAZON2024
  activeCompetitions: integer("active_competitions").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Corporate Competition Types - Sales, Production, Corporate Events
export const corporateCompetitions = pgTable("corporate_competitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id),
  name: varchar("name").notNull(),
  competitionType: varchar("competition_type").notNull(), // sales, production, corporate
  trackingMetric: varchar("tracking_metric").notNull(), // revenue, units_sold, efficiency, quality, custom
  competitionFormat: varchar("competition_format").notNull(), // individual, team, department
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status").notNull().default("planning"), // planning, active, completed
  
  // Sales-specific fields
  revenueGoal: numeric("revenue_goal"), // Target revenue for competition
  unitsSoldGoal: integer("units_sold_goal"), // Target units to sell
  salesTargets: jsonb("sales_targets").$type<{
    individual?: number;
    team?: number;
    department?: number;
    territory?: string[];
  }>(),
  
  // Production-specific fields
  productionTarget: integer("production_target"), // Units to produce
  qualityThreshold: integer("quality_threshold"), // Quality percentage
  efficiencyMetric: varchar("efficiency_metric"), // per_hour, per_day, per_unit
  productionGoals: jsonb("production_goals").$type<{
    dailyTarget?: number;
    weeklyTarget?: number;
    monthlyTarget?: number;
    qualityStandard?: number;
  }>(),
  
  // Corporate-specific fields
  customMetrics: jsonb("custom_metrics").$type<Array<{
    name: string;
    type: 'number' | 'percentage' | 'time' | 'boolean';
    target?: number;
    description?: string;
  }>>(),
  
  // Competition settings
  departments: text("departments").array(), // ["Sales", "Manufacturing", "Quality Control"]
  registrationCodes: jsonb("registration_codes").$type<Record<string, {
    department: string;
    maxParticipants?: number;
    isActive: boolean;
    generatedAt: string;
  }>>(), // {"WALMART2024-SALES": {...}, "WALMART2024-PROD": {...}}
  
  // Prize structure
  prizeStructure: jsonb("prize_structure").$type<{
    firstPlace?: string;
    topThree?: string[];
    departmentWinner?: string;
    participationReward?: string;
  }>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Corporate Participants
export const corporateParticipants = pgTable("corporate_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  employeeId: varchar("employee_id"), // company's internal employee ID
  department: varchar("department").notNull(),
  role: varchar("role").notNull(), // participant, supervisor, manager
  teamName: varchar("team_name"), // for team-based competitions
  registrationCode: varchar("registration_code").notNull(), // which code they used to join
  
  // Performance tracking
  currentScore: numeric("current_score").default("0"),
  currentRank: integer("current_rank"),
  personalGoal: numeric("personal_goal"), // Individual target
  
  // Additional participant data
  territory: varchar("territory"), // for sales competitions
  shift: varchar("shift"), // for production competitions
  startDate: timestamp("start_date"), // when they joined competition
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Performance Metrics Tracking
export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  participantId: varchar("participant_id").notNull().references(() => corporateParticipants.id),
  
  metricType: varchar("metric_type").notNull(), // revenue, units_sold, production_count, quality_score
  metricValue: numeric("metric_value").notNull(),
  recordedDate: timestamp("recorded_date").notNull(),
  
  // Additional context
  shift: varchar("shift"), // for production competitions
  productType: varchar("product_type"), // for sales/production specificity
  territory: varchar("territory"), // for sales competitions
  customerType: varchar("customer_type"), // new, existing, premium
  
  // Quality metrics for production
  qualityScore: integer("quality_score"), // percentage
  defectCount: integer("defect_count").default(0),
  
  // Verification
  verifiedBy: varchar("verified_by"), // supervisor/manager who verified
  verificationStatus: varchar("verification_status").default("pending"), // pending, verified, disputed
  verificationNotes: text("verification_notes"),
  
  // Metadata
  source: varchar("source").default("manual"), // manual, system, integration
  batchId: varchar("batch_id"), // for bulk imports
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Competition Leaderboards - Real-time rankings
export const competitionLeaderboards = pgTable("competition_leaderboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => corporateCompetitions.id),
  participantId: varchar("participant_id").notNull().references(() => corporateParticipants.id),
  
  // Ranking data
  currentRank: integer("current_rank").notNull(),
  previousRank: integer("previous_rank"),
  totalScore: numeric("total_score").notNull(),
  
  // Performance breakdowns
  dailyAverage: numeric("daily_average"),
  weeklyTotal: numeric("weekly_total"),
  monthlyTotal: numeric("monthly_total"),
  
  // Achievement tracking
  goalProgress: numeric("goal_progress"), // percentage toward goal
  streakDays: integer("streak_days").default(0), // consecutive days meeting target
  personalBest: numeric("personal_best"),
  
  // Department/team context
  departmentRank: integer("department_rank"),
  teamRank: integer("team_rank"),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sport Categories table
export const sportCategories = pgTable("sport_categories", {
  id: varchar("id").primaryKey(),
  categoryName: text("category_name").notNull(),
  categoryDescription: text("category_description"),
  sortOrder: integer("category_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Bubble data tables
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
});

// Sport Events Schema (sub-events within sports like Track & Field events)
export const sportEvents = pgTable("sport_events", {
  id: varchar("id").primaryKey(),
  eventName: text("event_name").notNull(),
  sportId: varchar("sport_id").notNull().references(() => sportOptions.id),
  eventType: text("event_type").notNull(), // "running", "jumping", "throwing", "swimming"
  scoringMethod: text("scoring_method", { enum: ["time", "distance", "height", "points"] }).notNull(),
  measurementUnit: text("measurement_unit").notNull(), // "seconds", "meters", "feet", etc.
  supportsMetric: boolean("supports_metric").default(true),
  supportsImperial: boolean("supports_imperial").default(true),
  gender: text("gender", { enum: ["men", "women", "boys", "girls", "mixed", "co-ed"] }).default("mixed"),
  ageGroup: text("age_group", { 
    enum: ["elementary", "middle-school", "high-school", "college", "adult", "masters", "senior"] 
  }),
  sortOrder: integer("sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tournament Events Schema (selected events for a tournament)
export const tournamentEvents = pgTable("tournament_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  sportEventId: varchar("sport_event_id").notNull().references(() => sportEvents.id),
  measurementSystem: text("measurement_system", { enum: ["metric", "imperial"] }).default("metric"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Participant Events Schema (individual registrations for events)
export const participantEvents = pgTable("participant_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentEventId: varchar("tournament_event_id").notNull().references(() => tournamentEvents.id),
  participantName: text("participant_name").notNull(),
  teamName: text("team_name"), // Optional team affiliation
  bibNumber: text("bib_number"), // Race number
  preliminaryResult: numeric("preliminary_result"), // Qualifying round result
  finalResult: numeric("final_result"), // Final result
  placement: integer("placement"), // 1st, 2nd, 3rd, etc.
  isDisqualified: boolean("is_disqualified").default(false),
  notes: text("notes"), // DQ reason, wind conditions, etc.
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const tournamentStructures = pgTable("tournament_structures", {
  id: varchar("id").primaryKey(),
  formatName: text("format_name").notNull(),
  formatDescription: text("format_description"),
  formatType: text("format_type"),
  applicableSports: text("applicable_sports"),
  sortOrder: integer("format_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const trackEvents = pgTable("track_events", {
  id: varchar("id").primaryKey(),
  eventName: text("event_name").notNull(),
  eventCategory: text("event_category"), // Track, Field, Relay, Combined
  distanceMeters: integer("distance_meters"), // null for field events
  measurementType: text("measurement_type"), // time, distance, height, points
  maxAttempts: integer("max_attempts").default(3),
  usesLanes: boolean("uses_lanes").default(false),
  usesStagger: boolean("uses_stagger").default(false),
  usesHurdles: boolean("uses_hurdles").default(false),
  hurdleHeightMen: numeric("hurdle_height_men"), // in meters
  hurdleHeightWomen: numeric("hurdle_height_women"), // in meters
  hurdleCount: integer("hurdle_count").default(0),
  implementsUsed: jsonb("implements_used"), // Array of required equipment
  windLegalDistance: integer("wind_legal_distance"), // Distance for wind measurement
  qualifyingStandards: jsonb("qualifying_standards"), // Performance standards by level
  equipmentSpecs: jsonb("equipment_specs"), // Equipment specifications
  scoringMethod: text("scoring_method"), // time_ascending, distance_descending, etc.
  ribbonPlaces: integer("ribbon_places").default(8),
  ageRestrictions: jsonb("age_restrictions"), // Minimum age requirements
  genderSpecific: boolean("gender_specific").default(false), // Male/female only events
  sortOrder: integer("event_sort_order"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Track Event Timing Configuration
export const trackEventTiming = pgTable("track_event_timing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trackEventId: varchar("track_event_id").notNull().references(() => trackEvents.id),
  timingMethod: text("timing_method").notNull(), // manual, FAT, electronic
  precisionLevel: text("precision_level").notNull(), // tenth, hundredth, thousandth
  windMeasurement: boolean("wind_measurement").default(false),
  photoFinish: boolean("photo_finish").default(false),
  reactionTimeTracking: boolean("reaction_time_tracking").default(false),
  intermediateSplits: jsonb("intermediate_splits"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tournament format configurations table - connects tournament structures to sport-specific settings
export const tournamentFormatConfigs = pgTable("tournament_format_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentStructureId: varchar("tournament_structure_id").references(() => tournamentStructures.id),
  sportCategory: varchar("sport_category").references(() => sportCategories.id),
  minParticipants: integer("min_participants").notNull().default(2),
  maxParticipants: integer("max_participants"),
  idealParticipants: integer("ideal_participants"),
  bracketGenerationRules: jsonb("bracket_generation_rules"),
  advancementRules: jsonb("advancement_rules"),
  tiebreakerRules: jsonb("tiebreaker_rules"),
  schedulingRequirements: jsonb("scheduling_requirements"),
  venueRequirements: jsonb("venue_requirements"),
  officiatingRequirements: jsonb("officiating_requirements"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Bracket templates table - pre-built bracket structures for common participant counts
export const bracketTemplates = pgTable("bracket_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentStructureId: varchar("tournament_structure_id").references(() => tournamentStructures.id),
  participantCount: integer("participant_count").notNull(),
  bracketStructure: jsonb("bracket_structure").notNull(),
  matchSequence: jsonb("match_sequence").notNull(),
  advancementMap: jsonb("advancement_map").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Tournament generation log table - tracks tournament creation process
export const tournamentGenerationLog = pgTable("tournament_generation_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  generationStep: varchar("generation_step").notNull(),
  stepData: jsonb("step_data"),
  success: boolean("success").default(true),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Competition format templates table - sport-specific configurations
export const competitionFormatTemplates = pgTable("competition_format_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").references(() => sportOptions.id),
  templateName: varchar("template_name").notNull(),
  templateDescription: text("template_description"),
  isDefault: boolean("is_default").default(false),
  ageGroupConfig: jsonb("age_group_config"),
  genderDivisionConfig: jsonb("gender_division_config"),
  teamSizeConfig: jsonb("team_size_config"),
  equipmentSpecifications: jsonb("equipment_specifications"),
  gameFormatConfig: jsonb("game_format_config"),
  scoringSystemConfig: jsonb("scoring_system_config"),
  seriesConfig: jsonb("series_config"),
  venueRequirements: jsonb("venue_requirements"),
  officiatingConfig: jsonb("officiating_config"),
  timingConfig: jsonb("timing_config"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Game length templates table - sport and age-specific timing configurations
export const gameLengthTemplates = pgTable("game_length_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").references(() => sportOptions.id),
  ageGroup: varchar("age_group").notNull(),
  regulationTime: jsonb("regulation_time").notNull(),
  overtimeRules: jsonb("overtime_rules"),
  breakIntervals: jsonb("break_intervals"),
  timeoutRules: jsonb("timeout_rules"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Series templates table - multi-game series configurations  
export const seriesTemplates = pgTable("series_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").references(() => sportOptions.id),
  seriesName: varchar("series_name").notNull(),
  gamesToWin: integer("games_to_win").notNull(),
  maximumGames: integer("maximum_games").notNull(),
  homeFieldAdvantage: boolean("home_field_advantage").default(false),
  gameIntervals: jsonb("game_intervals"),
  tiebreakerRules: jsonb("tiebreaker_rules"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// KRAKEN MULTI-DIVISION SYSTEM - THE TENTACLES OF TOURNAMENT POWER! 🐙💥

// Tournament divisions table - the first tentacle
export const tournamentDivisions = pgTable("tournament_divisions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  divisionName: varchar("division_name").notNull(),
  divisionType: varchar("division_type").notNull(), // age, gender, skill, regional, custom
  divisionConfig: jsonb("division_config").notNull(),
  participantCount: integer("participant_count").default(0),
  maxParticipants: integer("max_participants"),
  registrationDeadline: timestamp("registration_deadline"),
  divisionStatus: varchar("division_status").default("open"), // open, closed, active, completed
  bracketStructure: jsonb("bracket_structure"),
  advancementRules: jsonb("advancement_rules"),
  prizeStructure: jsonb("prize_structure"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division participants table - the second tentacle
export const divisionParticipants = pgTable("division_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  divisionId: varchar("division_id").references(() => tournamentDivisions.id),
  participantId: varchar("participant_id").notNull(), // Could be team or individual
  participantName: varchar("participant_name").notNull(),
  participantType: varchar("participant_type").notNull(), // individual, team
  seedNumber: integer("seed_number"),
  qualificationData: jsonb("qualification_data"),
  registrationTime: timestamp("registration_time").default(sql`now()`),
  status: varchar("status").default("registered"), // registered, confirmed, withdrawn, disqualified
});

// Division templates table - the fourth tentacle
export const divisionTemplates = pgTable("division_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: varchar("template_name").notNull(),
  templateDescription: text("template_description"),
  sportCategory: varchar("sport_category").references(() => sportCategories.id),
  divisionStructure: jsonb("division_structure").notNull(),
  autoGenerationRules: jsonb("auto_generation_rules"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division generation rules table - kraken automation
export const divisionGenerationRules = pgTable("division_generation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  templateId: varchar("template_id").references(() => divisionTemplates.id),
  generationConfig: jsonb("generation_config").notNull(),
  status: varchar("status").default("pending"), // pending, generated, active, completed
  generatedDivisions: jsonb("generated_divisions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division scheduling table - kraken optimization
export const divisionScheduling = pgTable("division_scheduling", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").references(() => tournaments.id),
  divisionId: varchar("division_id").references(() => tournamentDivisions.id),
  schedulingConfig: jsonb("scheduling_config").notNull(),
  venueAssignments: jsonb("venue_assignments"),
  timeSlots: jsonb("time_slots"),
  conflictResolution: jsonb("conflict_resolution"),
  optimizationScore: numeric("optimization_score"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  round: integer("round").notNull(),
  position: integer("position").notNull(),
  team1: text("team1"),
  team2: text("team2"),
  team1Score: integer("team1_score").default(0),
  team2Score: integer("team2_score").default(0),
  winner: text("winner"),
  status: text("status", { enum: ["upcoming", "in-progress", "completed"] }).notNull().default("upcoming"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Sport-specific division rules
export const sportDivisionRules = pgTable("sport_division_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sportId: varchar("sport_id").notNull().references(() => sportOptions.id),
  requiredDivisions: jsonb("required_divisions"), // Array of required divisions
  allowedCombinations: jsonb("allowed_combinations"), // Valid age/gender combos
  ageGroupRules: jsonb("age_group_rules"), // Age cutoffs, grade requirements
  genderRules: jsonb("gender_rules"), // Gender-specific rules
  performanceStandards: jsonb("performance_standards"), // Different standards by division
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Division-specific matches for tournaments with multiple divisions
export const divisionMatches = pgTable("division_matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  matchId: varchar("match_id").notNull().references(() => matches.id),
  division: text("division").notNull(), // "Men's Varsity", "Women's JV", etc.
  ageGroup: text("age_group"),
  gender: text("gender"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

// White-label schemas
export const insertWhitelabelConfigSchema = createInsertSchema(whitelabelConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSportCategorySchema = createInsertSchema(sportCategories).omit({
  createdAt: true,
});

export const insertSportOptionSchema = createInsertSchema(sportOptions).omit({
  createdAt: true,
});

export const insertTournamentStructureSchema = createInsertSchema(tournamentStructures).omit({
  createdAt: true,
});

export const insertTrackEventSchema = createInsertSchema(trackEvents).omit({
  createdAt: true,
});

export const insertTrackEventTimingSchema = createInsertSchema(trackEventTiming).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentFormatConfigSchema = createInsertSchema(tournamentFormatConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertBracketTemplateSchema = createInsertSchema(bracketTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentGenerationLogSchema = createInsertSchema(tournamentGenerationLog).omit({
  id: true,
  createdAt: true,
});

export const insertCompetitionFormatTemplateSchema = createInsertSchema(competitionFormatTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertGameLengthTemplateSchema = createInsertSchema(gameLengthTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertSeriesTemplateSchema = createInsertSchema(seriesTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentDivisionSchema = createInsertSchema(tournamentDivisions).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionParticipantSchema = createInsertSchema(divisionParticipants).omit({
  id: true,
  registrationTime: true,
});

export const insertDivisionTemplateSchema = createInsertSchema(divisionTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionGenerationRuleSchema = createInsertSchema(divisionGenerationRules).omit({
  id: true,
  createdAt: true,
});

export const insertDivisionSchedulingSchema = createInsertSchema(divisionScheduling).omit({
  id: true,
  createdAt: true,
});

// Insert schemas moved after table definitions

// ===================================================================
// TOURNAMENT EMPIRE ROLE-BASED SYSTEM! 👑⚡
// ===================================================================

// Role-based dashboard configuration
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

// Organization hierarchy management (Tournament Empire)
export const tournamentOrganizations: any = pgTable("tournament_organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationName: varchar("organization_name").notNull(),
  organizationType: varchar("organization_type").notNull(), // district, school, club, community
  parentOrganizationId: varchar("parent_organization_id"),
  subscriptionTier: varchar("subscription_tier").notNull(),
  whiteLabelConfig: jsonb("white_label_config"),
  brandingConfig: jsonb("branding_config"),
  customDomain: varchar("custom_domain"),
  organizationSettings: jsonb("organization_settings"),
  billingConfig: jsonb("billing_config"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// User-organization assignments
export const userOrganizationRoles: any = pgTable("user_organization_roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  organizationId: varchar("organization_id"),
  roleWithinOrg: varchar("role_within_org").notNull(),
  permissionsOverride: jsonb("permissions_override"),
  assignmentDate: timestamp("assignment_date").default(sql`now()`),
  status: varchar("status").default("active"), // active, suspended, terminated
});

// Granular permission system
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

// Permission templates for common role assignments
export const permissionTemplates = pgTable("permission_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  templateName: varchar("template_name").notNull(),
  roleType: varchar("role_type").notNull(),
  subscriptionTier: varchar("subscription_tier").notNull(),
  permissions: jsonb("permissions").notNull(),
  restrictions: jsonb("restrictions"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertSportEventSchema = createInsertSchema(sportEvents).omit({
  createdAt: true,
});

export const insertTournamentEventSchema = createInsertSchema(tournamentEvents).omit({
  id: true,
  createdAt: true,
});

export const insertParticipantEventSchema = createInsertSchema(participantEvents).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateMatchSchema = createInsertSchema(matches).omit({
  id: true,
  tournamentId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Tax Exemption Document schemas
export const insertTaxExemptionDocumentSchema = createInsertSchema(taxExemptionDocuments).omit({
  id: true,
  verificationStatus: true,
  verificationNotes: true,
  verifiedBy: true,
  verifiedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNonprofitSubscriptionSchema = createInsertSchema(nonprofitSubscriptions).omit({
  id: true,
  subscriptionStatus: true,
  taxExemptStatus: true,
  nextBillingDate: true,
  lastBillingDate: true,
  nonprofitVerificationRequired: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNonprofitInvoiceSchema = createInsertSchema(nonprofitInvoices).omit({
  id: true,
  invoiceNumber: true,
  invoiceDate: true,
  paymentStatus: true,
  paymentDate: true,
  createdAt: true,
  updatedAt: true,
});

// Nonprofit types
export type TaxExemptionDocument = typeof taxExemptionDocuments.$inferSelect;
export type InsertTaxExemptionDocument = z.infer<typeof insertTaxExemptionDocumentSchema>;
export type NonprofitSubscription = typeof nonprofitSubscriptions.$inferSelect;
export type InsertNonprofitSubscription = z.infer<typeof insertNonprofitSubscriptionSchema>;
export type NonprofitInvoice = typeof nonprofitInvoices.$inferSelect;
export type InsertNonprofitInvoice = z.infer<typeof insertNonprofitInvoiceSchema>;

// Athletic Support Teams (Cheerleading, Dance, Band, Color Guard)
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

// Support Team Members (individual cheerleaders, dancers, band members, etc.)
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

// Support Team Injury Tracking
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

// Support Team AI Consultation History
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

// Schema and type exports for support teams
export const insertSupportTeamSchema = createInsertSchema(supportTeams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTeamMemberSchema = createInsertSchema(supportTeamMembers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTeamInjurySchema = createInsertSchema(supportTeamInjuries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTeamAiConsultationSchema = createInsertSchema(supportTeamAiConsultations).omit({
  id: true,
  createdAt: true,
});

// Support team types
export type SupportTeam = typeof supportTeams.$inferSelect;
export type InsertSupportTeam = z.infer<typeof insertSupportTeamSchema>;
export type SupportTeamMember = typeof supportTeamMembers.$inferSelect;
export type InsertSupportTeamMember = z.infer<typeof insertSupportTeamMemberSchema>;
export type SupportTeamInjury = typeof supportTeamInjuries.$inferSelect;
export type InsertSupportTeamInjury = z.infer<typeof insertSupportTeamInjurySchema>;
export type SupportTeamAiConsultation = typeof supportTeamAiConsultations.$inferSelect;
export type InsertSupportTeamAiConsultation = z.infer<typeof insertSupportTeamAiConsultationSchema>;

// User types
export type User = typeof users.$inferSelect;

// Import academic competition schema
export * from "./academicSchema";

// Import commissioner schema for fantasy league management
export * from './commissioner-schema';

// Track Events types
export type TrackEventData = typeof trackEvents.$inferSelect;
export type InsertTrackEventData = typeof trackEvents.$inferInsert;
export type TrackEventTiming = typeof trackEventTiming.$inferSelect;
export type InsertTrackEventTiming = typeof trackEventTiming.$inferInsert;

// Tournament Integration types
export type TournamentFormatConfig = typeof tournamentFormatConfigs.$inferSelect;
export type InsertTournamentFormatConfig = typeof tournamentFormatConfigs.$inferInsert;
export type BracketTemplate = typeof bracketTemplates.$inferSelect;
export type InsertBracketTemplate = typeof bracketTemplates.$inferInsert;
export type TournamentGenerationLog = typeof tournamentGenerationLog.$inferSelect;
export type InsertTournamentGenerationLog = typeof tournamentGenerationLog.$inferInsert;

// Competition Format types
export type CompetitionFormatTemplate = typeof competitionFormatTemplates.$inferSelect;
export type InsertCompetitionFormatTemplate = typeof competitionFormatTemplates.$inferInsert;
export type GameLengthTemplate = typeof gameLengthTemplates.$inferSelect;
export type InsertGameLengthTemplate = typeof gameLengthTemplates.$inferInsert;
export type SeriesTemplate = typeof seriesTemplates.$inferSelect;
export type InsertSeriesTemplate = typeof seriesTemplates.$inferInsert;

// Kraken Multi-Division types
export type TournamentDivision = typeof tournamentDivisions.$inferSelect;
export type InsertTournamentDivision = typeof tournamentDivisions.$inferInsert;
export type DivisionParticipant = typeof divisionParticipants.$inferSelect;
export type InsertDivisionParticipant = typeof divisionParticipants.$inferInsert;
export type DivisionTemplate = typeof divisionTemplates.$inferSelect;
export type InsertDivisionTemplate = typeof divisionTemplates.$inferInsert;
export type DivisionGenerationRule = typeof divisionGenerationRules.$inferSelect;
export type InsertDivisionGenerationRule = typeof divisionGenerationRules.$inferInsert;
export type DivisionScheduling = typeof divisionScheduling.$inferSelect;
export type InsertDivisionScheduling = typeof divisionScheduling.$inferInsert;

// Tournament Empire types
export type UserDashboardConfig = typeof userDashboardConfigs.$inferSelect;
export type InsertUserDashboardConfig = typeof userDashboardConfigs.$inferInsert;
export type UserOrganizationRole = typeof userOrganizationRoles.$inferSelect;
export type InsertUserOrganizationRole = typeof userOrganizationRoles.$inferInsert;
export type PermissionAssignment = typeof permissionAssignments.$inferSelect;
export type InsertPermissionAssignment = typeof permissionAssignments.$inferInsert;
export type PermissionTemplate = typeof permissionTemplates.$inferSelect;
export type InsertPermissionTemplate = typeof permissionTemplates.$inferInsert;

// Tournament Empire insert schemas
export const insertUserDashboardConfigSchema = createInsertSchema(userDashboardConfigs).omit({
  id: true,
  createdAt: true,
});

export const insertTournamentOrganizationSchema = createInsertSchema(tournamentOrganizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserOrganizationRoleSchema = createInsertSchema(userOrganizationRoles).omit({
  id: true,
  assignmentDate: true,
});

export const insertPermissionAssignmentSchema = createInsertSchema(permissionAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertPermissionTemplateSchema = createInsertSchema(permissionTemplates).omit({
  id: true,
  createdAt: true,
});

// ===================================================================
// ADULT-ONLY FANTASY SYSTEM! 🎮⚡ 
// DRAFTKINGS/FANDUEL COMPETITOR - LEGALLY BULLETPROOF!
// ===================================================================

// Fantasy leagues - age-gated and professional focus
export const fantasyLeagues = pgTable("fantasy_leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueName: varchar("league_name").notNull(),
  commissionerId: varchar("commissioner_id").notNull(),
  sportType: varchar("sport_type").notNull(), // nfl, nba, mlb, nhl, esports, college
  leagueFormat: varchar("league_format").notNull(), // survivor, draft, daily, season
  dataSource: varchar("data_source").notNull(), // espn_api, nfl_api, manual_import, esports_api
  ageRestriction: integer("age_restriction").default(18),
  requiresAgeVerification: boolean("requires_age_verification").default(true),
  maxParticipants: integer("max_participants").default(12),
  entryRequirements: jsonb("entry_requirements"), // Age verification, location restrictions
  scoringConfig: jsonb("scoring_config").notNull(),
  prizeStructure: jsonb("prize_structure"), // Optional - we don't manage money
  leagueSettings: jsonb("league_settings").notNull(),
  status: varchar("status").default("open"), // open, closed, active, completed
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fantasy participants - verified adults only
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

// Professional player database - external API integration
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
  currentSeasonStats: jsonb("current_season_stats"),
  injuryStatus: varchar("injury_status").default("healthy"),
  byeWeek: integer("bye_week"), // For NFL
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Fantasy picks - survivor & draft systems
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

// Fantasy lineups - DraftKings style daily/weekly
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

// Player performance - real-time scoring integration
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

// Age verification records
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

// Fantasy league eligibility checks
export const fantasyEligibilityChecks = pgTable("fantasy_eligibility_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  userId: varchar("user_id").notNull(),
  ageCheckPassed: boolean("age_check_passed").default(false),
  locationCheckPassed: boolean("location_check_passed").default(true), // For legal compliance
  eligibilityDate: timestamp("eligibility_date").defaultNow(),
  checkDetails: jsonb("check_details"),
});

// Safety restrictions by sport/league type
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

// API data source configuration
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

// Automated scoring functions framework
export const scoringAutomations = pgTable("scoring_automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leagueId: varchar("league_id").references(() => fantasyLeagues.id),
  automationType: varchar("automation_type").notNull(), // weekly_update, daily_update, real_time
  dataSource: varchar("data_source").notNull(),
  lastRun: timestamp("last_run"),
  nextScheduledRun: timestamp("next_scheduled_run"),
  automationStatus: varchar("automation_status").default("active"),
  errorLog: jsonb("error_log"),
});

// Fantasy system relations
export const fantasyLeaguesRelations = relations(fantasyLeagues, ({ many }) => ({
  participants: many(fantasyParticipants),
  picks: many(fantasyPicks),
  lineups: many(fantasyLineups),
}));

export const fantasyParticipantsRelations = relations(fantasyParticipants, ({ one, many }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyParticipants.leagueId],
    references: [fantasyLeagues.id],
  }),
  picks: many(fantasyPicks),
  lineups: many(fantasyLineups),
}));

export const professionalPlayersRelations = relations(professionalPlayers, ({ many }) => ({
  picks: many(fantasyPicks),
  performances: many(playerPerformances),
}));

export const fantasyPicksRelations = relations(fantasyPicks, ({ one }) => ({
  league: one(fantasyLeagues, {
    fields: [fantasyPicks.leagueId],
    references: [fantasyLeagues.id],
  }),
  participant: one(fantasyParticipants, {
    fields: [fantasyPicks.participantId],
    references: [fantasyParticipants.id],
  }),
  player: one(professionalPlayers, {
    fields: [fantasyPicks.selectedPlayerId],
    references: [professionalPlayers.id],
  }),
}));

// Fantasy system types
export type FantasyLeague = typeof fantasyLeagues.$inferSelect;
export type InsertFantasyLeague = typeof fantasyLeagues.$inferInsert;
export type FantasyParticipant = typeof fantasyParticipants.$inferSelect;
export type InsertFantasyParticipant = typeof fantasyParticipants.$inferInsert;
export type ProfessionalPlayer = typeof professionalPlayers.$inferSelect;
export type InsertProfessionalPlayer = typeof professionalPlayers.$inferInsert;
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
export type ApiConfiguration = typeof apiConfigurations.$inferSelect;
export type InsertApiConfiguration = typeof apiConfigurations.$inferInsert;
export type ScoringAutomation = typeof scoringAutomations.$inferSelect;
export type InsertScoringAutomation = typeof scoringAutomations.$inferInsert;

// Fantasy insert schemas
export const insertFantasyLeagueSchema = createInsertSchema(fantasyLeagues).omit({
  id: true,
  createdAt: true,
});

export const insertFantasyParticipantSchema = createInsertSchema(fantasyParticipants).omit({
  id: true,
  entryDate: true,
});

export const insertProfessionalPlayerSchema = createInsertSchema(professionalPlayers).omit({
  id: true,
  lastUpdated: true,
});

export const insertFantasyPickSchema = createInsertSchema(fantasyPicks).omit({
  id: true,
  pickTimestamp: true,
});

export const insertFantasyLineupSchema = createInsertSchema(fantasyLineups).omit({
  id: true,
  submissionTimestamp: true,
});

export const insertPlayerPerformanceSchema = createInsertSchema(playerPerformances).omit({
  id: true,
  lastUpdated: true,
});

export const insertAgeVerificationSchema = createInsertSchema(ageVerifications).omit({
  id: true,
  verificationDate: true,
});

// White-label pages schema
export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull(),
  content: text("content").notNull(),
  metaDescription: varchar("meta_description"),
  isPublished: boolean("is_published").default(false),
  pageType: text("page_type", { enum: ["landing", "about", "contact", "custom"] }).default("custom"),
  templateId: varchar("template_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pagesRelations = relations(pages, ({ one }) => ({
  user: one(users, {
    fields: [pages.userId],
    references: [users.id],
  }),
}));

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

// Update white-label configs with relations
export const whitelabelConfigsRelations = relations(whitelabelConfigs, ({ one }) => ({
  user: one(users, {
    fields: [whitelabelConfigs.userId],
    references: [users.id],
  }),
}));

export type WhitelabelConfigData = typeof whitelabelConfigs.$inferSelect;
export type InsertWhitelabelConfigData = typeof whitelabelConfigs.$inferInsert;

// Donor types
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = typeof donors.$inferInsert;

// Donation types  
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

// Team registrations - coaches register their teams for tournaments
export const teamRegistrations = pgTable("team_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  coachId: varchar("coach_id").notNull().references(() => users.id),
  teamName: varchar("team_name").notNull(),
  organizationName: varchar("organization_name"), // School/club name
  playerList: jsonb("player_list"), // Array of player details
  registeredEvents: jsonb("registered_events"), // Which events this team is competing in
  registrationStatus: text("registration_status", {
    enum: ["incomplete", "pending_approval", "approved", "rejected", "waitlisted"]
  }).default("incomplete"),
  
  // Enhanced payment tracking
  paymentStatus: text("payment_status", {
    enum: ["unpaid", "partial", "paid", "refunded"]
  }).default("unpaid"),
  totalFee: decimal("total_fee", { precision: 10, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  paymentBreakdown: jsonb("payment_breakdown").$type<Array<{
    playerId: string;
    playerName: string;
    amount: number;
    paidBy: string; // parent email or name
    paidAt?: string;
    paymentMethod?: string;
    transactionId?: string;
  }>>().default([]),
  
  // Document compliance tracking
  requiredDocuments: jsonb("required_documents").$type<Array<{
    type: string;
    name: string;
    required: boolean;
    description?: string;
  }>>().default([]),
  documentComplianceStatus: text("document_compliance_status", {
    enum: ["incomplete", "pending_review", "complete", "issues"]
  }).default("incomplete"),
  
  registrationDate: timestamp("registration_date").defaultNow(),
  notes: text("notes"),
  approvalNotes: text("approval_notes"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Teams - core team entity for better organization
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamName: varchar("team_name").notNull(),
  organizationName: varchar("organization_name"),
  coachName: varchar("coach_name").notNull(),
  coachEmail: varchar("coach_email").notNull(),
  coachPhone: varchar("coach_phone"),
  coachId: varchar("coach_id").references(() => users.id),
  assistantCoaches: jsonb("assistant_coaches").$type<Array<{
    name: string;
    email?: string;
    phone?: string;
    role?: string;
  }>>().default([]),
  teamColor: varchar("team_color"),
  homeVenue: varchar("home_venue"),
  ageGroup: varchar("age_group"), // U12, U14, JV, Varsity, etc.
  division: varchar("division"), // A, B, Recreational, etc.
  status: text("status", { 
    enum: ["active", "inactive", "suspended"] 
  }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team players/athletes with comprehensive info
export const teamPlayers = pgTable("team_players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  playerName: varchar("player_name").notNull(),
  dateOfBirth: date("date_of_birth"),
  jerseyNumber: varchar("jersey_number"),
  position: varchar("position"),
  parentGuardianName: varchar("parent_guardian_name"),
  parentGuardianEmail: varchar("parent_guardian_email"),
  parentGuardianPhone: varchar("parent_guardian_phone"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  medicalNotes: text("medical_notes"),
  allergies: text("allergies"),
  medications: text("medications"),
  physicianName: varchar("physician_name"),
  physicianPhone: varchar("physician_phone"),
  status: text("status", { 
    enum: ["active", "inactive", "injured", "suspended"] 
  }).default("active"),
  
  // Health & Safety Analytics
  healthAlerts: jsonb("health_alerts").$type<{
    alertId: string;
    alertType: 'performance_decline' | 'injury_risk' | 'fatigue_pattern' | 'unusual_behavior';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendedActions: string[];
    triggeredDate: string;
    resolvedDate?: string;
    resolvedBy?: string;
    notes?: string;
  }[]>(),
  
  performanceTrends: jsonb("performance_trends").$type<{
    eventType: string;
    sport: string;
    measurements: {
      date: string;
      value: number;
      unit: string;
      conditions?: string; // weather, venue, etc.
      notes?: string;
    }[];
    trendAnalysis: {
      direction: 'improving' | 'declining' | 'stable' | 'inconsistent';
      confidenceLevel: number; // 0-100
      lastAnalyzedDate: string;
      concernLevel: 'none' | 'minor' | 'moderate' | 'significant';
      autoGeneratedRecommendations?: string[];
    };
  }[]>(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

// Consent form templates with legal compliance
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

// Individual consent form responses with digital signatures
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



// Update users relations to include organization
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  ownedTournaments: many(tournaments),
  teamRegistrations: many(teamRegistrations),
}));

export type TeamRegistration = typeof teamRegistrations.$inferSelect;
export type InsertTeamRegistration = typeof teamRegistrations.$inferInsert;
// Live scoring and messaging system types
export type LiveScore = typeof liveScores.$inferSelect;
export type InsertLiveScore = typeof liveScores.$inferInsert;
export type ScorekeeperAssignment = typeof scorekeeperAssignments.$inferSelect;
export type InsertScorekeeperAssignment = typeof scorekeeperAssignments.$inferInsert;
export type LiveScoreMessage = typeof liveScoreMessages.$inferSelect;
export type InsertLiveScoreMessage = typeof liveScoreMessages.$inferInsert;

// Geolocation-based event tracking
export const eventLocations = pgTable("event_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  eventName: varchar("event_name").notNull(),
  venueName: varchar("venue_name").notNull(),
  address: text("address").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: numeric("longitude", { precision: 11, scale: 8 }).notNull(),
  geofenceRadius: integer("geofence_radius").default(100), // meters
  allowRemoteScoring: boolean("allow_remote_scoring").default(false),
  requireLocationVerification: boolean("require_location_verification").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Location check-ins for participants and scorekeepers
export const locationCheckIns = pgTable("location_check_ins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventLocationId: varchar("event_location_id").notNull().references(() => eventLocations.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  checkInLatitude: numeric("check_in_latitude", { precision: 10, scale: 8 }).notNull(),
  checkInLongitude: numeric("check_in_longitude", { precision: 11, scale: 8 }).notNull(),
  distanceFromVenue: integer("distance_from_venue"), // meters
  checkInType: text("check_in_type", {
    enum: ["participant_arrival", "scorekeeper_arrival", "event_start", "event_end", "score_update"]
  }).notNull(),
  verificationStatus: text("verification_status", {
    enum: ["verified", "outside_range", "manual_override", "failed"]
  }).default("verified"),
  checkInTime: timestamp("check_in_time").defaultNow(),
  notes: text("notes"),
});

// Location-based scoring permissions
export const locationScoringPermissions = pgTable("location_scoring_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scorekeeperId: varchar("scorekeeper_id").notNull().references(() => users.id),
  eventLocationId: varchar("event_location_id").notNull().references(() => eventLocations.id),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  isLocationVerified: boolean("is_location_verified").default(false),
  lastLocationCheck: timestamp("last_location_check"),
  locationCheckLatitude: numeric("location_check_latitude", { precision: 10, scale: 8 }),
  locationCheckLongitude: numeric("location_check_longitude", { precision: 11, scale: 8 }),
  distanceFromVenue: integer("distance_from_venue"), // meters
  canScoreRemotely: boolean("can_score_remotely").default(false),
  permissionGrantedBy: varchar("permission_granted_by").references(() => users.id),
  permissionNotes: text("permission_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EventLocation = typeof eventLocations.$inferSelect;
export type InsertEventLocation = typeof eventLocations.$inferInsert;
export type LocationCheckIn = typeof locationCheckIns.$inferSelect;
export type InsertLocationCheckIn = typeof locationCheckIns.$inferInsert;
export type LocationScoringPermission = typeof locationScoringPermissions.$inferSelect;
export type InsertLocationScoringPermission = typeof locationScoringPermissions.$inferInsert;

// Relations for live scoring system
export const liveScoresRelations = relations(liveScores, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [liveScores.tournamentId],
    references: [tournaments.id],
  }),
  assignedScorekeeper: one(users, {
    fields: [liveScores.assignedScorekeeperId],
    references: [users.id],
  }),
}));

export const scorekeeperAssignmentsRelations = relations(scorekeeperAssignments, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [scorekeeperAssignments.tournamentId],
    references: [tournaments.id],
  }),
  scorekeeper: one(users, {
    fields: [scorekeeperAssignments.scorekeeperId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [scorekeeperAssignments.assignedBy],
    references: [users.id],
  }),
}));

export const liveScoreMessagesRelations = relations(liveScoreMessages, ({ one }) => ({
  liveScore: one(liveScores, {
    fields: [liveScoreMessages.liveScoreId],
    references: [liveScores.id],
  }),
  sender: one(users, {
    fields: [liveScoreMessages.senderId],
    references: [users.id],
  }),
}));

// Geolocation relations
export const eventLocationsRelations = relations(eventLocations, ({ one, many }) => ({
  tournament: one(tournaments, {
    fields: [eventLocations.tournamentId],
    references: [tournaments.id],
  }),
  checkIns: many(locationCheckIns),
  scoringPermissions: many(locationScoringPermissions),
}));

export const locationCheckInsRelations = relations(locationCheckIns, ({ one }) => ({
  user: one(users, {
    fields: [locationCheckIns.userId],
    references: [users.id],
  }),
  eventLocation: one(eventLocations, {
    fields: [locationCheckIns.eventLocationId],
    references: [eventLocations.id],
  }),
  tournament: one(tournaments, {
    fields: [locationCheckIns.tournamentId],
    references: [tournaments.id],
  }),
}));

export const locationScoringPermissionsRelations = relations(locationScoringPermissions, ({ one }) => ({
  scorekeeper: one(users, {
    fields: [locationScoringPermissions.scorekeeperId],
    references: [users.id],
  }),
  eventLocation: one(eventLocations, {
    fields: [locationScoringPermissions.eventLocationId],
    references: [eventLocations.id],
  }),
  tournament: one(tournaments, {
    fields: [locationScoringPermissions.tournamentId],
    references: [tournaments.id],
  }),
  permissionGrantedByUser: one(users, {
    fields: [locationScoringPermissions.permissionGrantedBy],
    references: [users.id],
  }),
}));

// Event scores - scorekeepers update scores for their assigned events
export const eventScores = pgTable("event_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id),
  assignmentId: varchar("assignment_id").notNull().references(() => scorekeeperAssignments.id),
  teamId: varchar("team_id"), // Reference to team registration or participant
  participantName: varchar("participant_name").notNull(),
  eventName: varchar("event_name").notNull(),
  scoreValue: numeric("score_value"), // Numeric score (time, distance, points)
  scoreUnit: varchar("score_unit"), // Unit: seconds, meters, points, etc.
  placement: integer("placement"), // 1st, 2nd, 3rd place
  notes: text("notes"), // Judge notes, penalties, etc.
  scoredAt: timestamp("scored_at").defaultNow(),
  scoredById: varchar("scored_by_id").notNull().references(() => users.id), // Scorekeeper who entered score
  isVerified: boolean("is_verified").default(false), // Tournament manager can verify scores
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventScoresRelations = relations(eventScores, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [eventScores.tournamentId],
    references: [tournaments.id],
  }),
  assignment: one(scorekeeperAssignments, {
    fields: [eventScores.assignmentId],
    references: [scorekeeperAssignments.id],
  }),
  scoredBy: one(users, {
    fields: [eventScores.scoredById],
    references: [users.id],
  }),
}));

export type EventScore = typeof eventScores.$inferSelect;
export type InsertEventScore = typeof eventScores.$inferInsert;

// School assignments - district ADs assign schools to events, school ADs assign coaches
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

export const schoolEventAssignmentsRelations = relations(schoolEventAssignments, ({ one }) => ({
  tournament: one(tournaments, {
    fields: [schoolEventAssignments.tournamentId],
    references: [tournaments.id],
  }),
  school: one(organizations, {
    fields: [schoolEventAssignments.schoolId],
    references: [organizations.id],
  }),
  assignedBy: one(users, {
    fields: [schoolEventAssignments.assignedById],
    references: [users.id],
  }),
  schoolAthleticDirector: one(users, {
    fields: [schoolEventAssignments.schoolAthleticDirectorId],
    references: [users.id],
  }),
}));

// Coach assignments - school ADs assign coaches to specific events within their school's assignment
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

export const coachEventAssignmentsRelations = relations(coachEventAssignments, ({ one }) => ({
  schoolAssignment: one(schoolEventAssignments, {
    fields: [coachEventAssignments.schoolAssignmentId],
    references: [schoolEventAssignments.id],
  }),
  coach: one(users, {
    fields: [coachEventAssignments.coachId],
    references: [users.id],
  }),
  assignedBy: one(users, {
    fields: [coachEventAssignments.assignedById],
    references: [users.id],
  }),
}));

export type SchoolEventAssignment = typeof schoolEventAssignments.$inferSelect;
export type InsertSchoolEventAssignment = typeof schoolEventAssignments.$inferInsert;

// Tournament credits purchases tracking
export const tournamentCredits = pgTable("tournament_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  packageType: text("package_type", {
    enum: ["single_tournament", "tournament_5_pack", "tournament_10_pack", "monthly_boost"]
  }).notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  priceAmount: decimal("price_amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripe_payment_id"),
  purchaseDate: timestamp("purchase_date").defaultNow(),
  expiresAt: timestamp("expires_at"), // Credits can expire
  status: text("status", {
    enum: ["pending", "completed", "failed", "refunded"]
  }).default("pending"),
});

// Usage analytics for fraud detection
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

export type TournamentCredit = typeof tournamentCredits.$inferSelect;
export type InsertTournamentCredit = typeof tournamentCredits.$inferInsert;
export type UsageAnalytic = typeof usageAnalytics.$inferSelect;
export type InsertUsageAnalytic = typeof usageAnalytics.$inferInsert;
export type CoachEventAssignment = typeof coachEventAssignments.$inferSelect;
export type InsertCoachEventAssignment = typeof coachEventAssignments.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;

// White-label types
export type WhitelabelConfigRecord = typeof whitelabelConfigs.$inferSelect;
export type InsertWhitelabelConfigRecord = z.infer<typeof insertWhitelabelConfigSchema>;

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type UpdateMatch = z.infer<typeof updateMatchSchema>;

export type SportOption = typeof sportOptions.$inferSelect;
export type InsertSportOption = z.infer<typeof insertSportOptionSchema>;
export type TournamentStructure = typeof tournamentStructures.$inferSelect;
export type InsertTournamentStructure = z.infer<typeof insertTournamentStructureSchema>;
export type TrackEventRecord = typeof trackEvents.$inferSelect;
export type InsertTrackEventRecord = z.infer<typeof insertTrackEventSchema>;

export type SportEvent = typeof sportEvents.$inferSelect;
export type InsertSportEvent = z.infer<typeof insertSportEventSchema>;
export type TournamentEvent = typeof tournamentEvents.$inferSelect;
export type InsertTournamentEvent = z.infer<typeof insertTournamentEventSchema>;
export type ParticipantEvent = typeof participantEvents.$inferSelect;
export type InsertParticipantEvent = z.infer<typeof insertParticipantEventSchema>;

// Contact types
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContactType = z.infer<typeof insertContactSchema>;

// Email campaign types
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;
export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEmailCampaignType = z.infer<typeof insertEmailCampaignSchema>;

// Campaign recipient types  
export type CampaignRecipient = typeof campaignRecipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaignRecipients.$inferInsert;

// UNIVERSAL REGISTRATION CODE SYSTEM
export const registrationCodes = pgTable("registration_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(), // The actual registration code
  type: text("type", {
    enum: ["tournament_manager", "district_admin", "business_user", "fantasy_commissioner", "gaming_commissioner"]
  }).notNull(),
  createdBy: varchar("created_by").notNull(), // User ID who created the code
  organizationId: varchar("organization_id"), // Associated organization
  leagueId: varchar("league_id"), // Associated league/tournament
  permissions: jsonb("permissions").$type<string[]>().notNull(),
  maxUses: integer("max_uses").default(1), // How many people can use this code
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// COACHES LOUNGE LEAGUES SYSTEM
export const leagues = pgTable("leagues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["fantasy-sports", "gaming", "office", "custom", "general"]
  }).notNull(),
  commissionerId: varchar("commissioner_id").references(() => users.id).notNull(),
  registrationCode: varchar("registration_code").unique().notNull(),
  settings: jsonb("settings").$type<{
    isPrivate: boolean;
    maxParticipants: number;
    season: string;
    sport?: string;
    game?: string;
    rules: string;
  }>(),
  participants: jsonb("participants").$type<Array<{
    userId: string;
    joinedAt: string;
    status: 'active' | 'inactive';
  }>>().default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type RegistrationCode = typeof registrationCodes.$inferSelect;
export type InsertRegistrationCode = typeof registrationCodes.$inferInsert;
export type League = typeof leagues.$inferSelect;
export type InsertLeague = typeof leagues.$inferInsert;

// Corporate competition types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;
export type CorporateCompetition = typeof corporateCompetitions.$inferSelect;
export type InsertCorporateCompetition = typeof corporateCompetitions.$inferInsert;
export type CorporateParticipant = typeof corporateParticipants.$inferSelect;
export type InsertCorporateParticipant = typeof corporateParticipants.$inferInsert;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;
export type CompetitionLeaderboard = typeof competitionLeaderboards.$inferSelect;
export type InsertCompetitionLeaderboard = typeof competitionLeaderboards.$inferInsert;

// Create insert schemas for corporate tables
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  activeCompetitions: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorporateCompetitionSchema = createInsertSchema(corporateCompetitions).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCorporateParticipantSchema = createInsertSchema(corporateParticipants).omit({
  id: true,
  currentScore: true,
  currentRank: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  verificationStatus: true,
  createdAt: true,
});

// Corporate relations
export const companiesRelations = relations(companies, ({ many }) => ({
  competitions: many(corporateCompetitions),
}));

export const corporateCompetitionsRelations = relations(corporateCompetitions, ({ one, many }) => ({
  company: one(companies, {
    fields: [corporateCompetitions.companyId],
    references: [companies.id],
  }),
  participants: many(corporateParticipants),
  metrics: many(performanceMetrics),
  leaderboards: many(competitionLeaderboards),
}));

export const corporateParticipantsRelations = relations(corporateParticipants, ({ one, many }) => ({
  competition: one(corporateCompetitions, {
    fields: [corporateParticipants.competitionId],
    references: [corporateCompetitions.id],
  }),
  user: one(users, {
    fields: [corporateParticipants.userId],
    references: [users.id],
  }),
  metrics: many(performanceMetrics),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  competition: one(corporateCompetitions, {
    fields: [performanceMetrics.competitionId],
    references: [corporateCompetitions.id],
  }),
  participant: one(corporateParticipants, {
    fields: [performanceMetrics.participantId],
    references: [corporateParticipants.id],
  }),
}));

export const competitionLeaderboardsRelations = relations(competitionLeaderboards, ({ one }) => ({
  competition: one(corporateCompetitions, {
    fields: [competitionLeaderboards.competitionId],
    references: [corporateCompetitions.id],
  }),
  participant: one(corporateParticipants, {
    fields: [competitionLeaderboards.participantId],
    references: [corporateParticipants.id],
  }),
}));

// District and School Relations
export const districtsRelations = relations(districts, ({ one, many }) => ({
  athleticDirector: one(users, {
    fields: [districts.athleticDirectorId],
    references: [users.id],
  }),
  headAthleticTrainer: one(users, {
    fields: [districts.headAthleticTrainerId],
    references: [users.id],
  }),
  schools: many(schools),
}));

export const schoolsRelations = relations(schools, ({ one, many }) => ({
  district: one(districts, {
    fields: [schools.districtId],
    references: [districts.id],
  }),
  principal: one(users, {
    fields: [schools.principalId],
    references: [users.id],
  }),
  athleticDirector: one(users, {
    fields: [schools.athleticDirectorId],
    references: [users.id],
  }),
  athleticTrainer: one(users, {
    fields: [schools.athleticTrainerId],
    references: [users.id],
  }),
  venues: many(athleticVenues),
  assets: many(schoolAssets),
}));

export const athleticVenuesRelations = relations(athleticVenues, ({ one }) => ({
  school: one(schools, {
    fields: [athleticVenues.schoolId],
    references: [schools.id],
  }),
}));

export const schoolAssetsRelations = relations(schoolAssets, ({ one }) => ({
  school: one(schools, {
    fields: [schoolAssets.schoolId],
    references: [schools.id],
  }),
  uploadedBy: one(users, {
    fields: [schoolAssets.uploadedById],
    references: [users.id],
  }),
}));
