CREATE TYPE "public"."aplus_academic" AS ENUM('art', 'calculator_applications_aplus', 'chess_puzzle', 'creative_writing', 'dictionary_skills', 'editorial_writing_aplus', 'listening', 'maps_graphs_charts', 'mathematics_aplus', 'music_memory', 'number_sense_aplus', 'ready_writing_aplus', 'science_aplus', 'social_studies_aplus', 'spelling_aplus', 'impromptu_speaking', 'modern_oratory', 'one_act_play_aplus', 'oral_reading', 'theatrical_design_aplus');--> statement-breakpoint
CREATE TYPE "public"."academic_category" AS ENUM('literary_criticism', 'ready_writing', 'spelling_vocabulary', 'copy_editing', 'editorial_writing', 'feature_writing', 'headline_writing', 'news_writing', 'current_issues_events', 'social_studies', 'calculator_applications', 'mathematics', 'number_sense', 'science', 'accounting', 'computer_applications', 'cross_examination_debate', 'informative_speaking', 'persuasive_speaking', 'poetry_interpretation', 'prose_interpretation', 'one_act_play', 'theatrical_design', 'barbara_jordan_essay', 'latino_history_essay');--> statement-breakpoint
CREATE TYPE "public"."academic_role" AS ENUM('district_academic_coordinator', 'district_academic_director', 'district_meet_director', 'school_academic_coordinator', 'academic_principal', 'academic_assistant_principal', 'academic_sponsor', 'academic_coach', 'volunteer_coach', 'contest_judge', 'contest_grader', 'contest_official', 'meet_manager', 'academic_student', 'team_captain', 'alternate_competitor');--> statement-breakpoint
CREATE TYPE "public"."competition_level" AS ENUM('district', 'regional', 'state', 'area', 'bi_district');--> statement-breakpoint
CREATE TYPE "public"."school_classification" AS ENUM('elementary', 'middle', 'high_1A', 'high_2A', 'high_3A', 'high_4A', 'high_5A', 'high_6A');--> statement-breakpoint
CREATE TABLE "age_verifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"verification_method" varchar NOT NULL,
	"date_of_birth" date NOT NULL,
	"verified_age" integer NOT NULL,
	"verification_date" timestamp DEFAULT now(),
	"verification_status" varchar DEFAULT 'verified',
	"verifying_document_hash" varchar,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "api_configurations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_name" varchar NOT NULL,
	"sport_type" varchar NOT NULL,
	"api_endpoint" varchar NOT NULL,
	"api_key_hash" varchar,
	"rate_limit_per_hour" integer,
	"last_sync_timestamp" timestamp,
	"sync_frequency_minutes" integer DEFAULT 60,
	"is_active" boolean DEFAULT true,
	"data_mapping" jsonb
);
--> statement-breakpoint
CREATE TABLE "athletic_venues" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" varchar NOT NULL,
	"venue_name" varchar NOT NULL,
	"venue_type" text NOT NULL,
	"vlc_code" varchar NOT NULL,
	"capacity" integer,
	"address" varchar,
	"is_home_venue" boolean DEFAULT true,
	"surface_type" varchar,
	"has_lights" boolean DEFAULT false,
	"has_scoreboard" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "athletic_venues_vlc_code_unique" UNIQUE("vlc_code")
);
--> statement-breakpoint
CREATE TABLE "bracket_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_structure_id" varchar,
	"participant_count" integer NOT NULL,
	"bracket_structure" jsonb NOT NULL,
	"match_sequence" jsonb NOT NULL,
	"advancement_map" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaign_recipients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" varchar NOT NULL,
	"contact_id" varchar NOT NULL,
	"status" text DEFAULT 'pending',
	"sent_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coach_event_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_assignment_id" varchar NOT NULL,
	"coach_id" varchar NOT NULL,
	"assigned_by_id" varchar NOT NULL,
	"event_name" varchar NOT NULL,
	"role" text DEFAULT 'assistant_coach',
	"responsibilities" text,
	"is_active" boolean DEFAULT true,
	"assignment_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"industry" varchar,
	"contact_email" varchar NOT NULL,
	"estimated_employees" varchar,
	"subscription_tier" varchar DEFAULT 'starter',
	"code_prefix" varchar NOT NULL,
	"active_competitions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competition_format_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" varchar,
	"template_name" varchar NOT NULL,
	"template_description" text,
	"is_default" boolean DEFAULT false,
	"age_group_config" jsonb,
	"gender_division_config" jsonb,
	"team_size_config" jsonb,
	"equipment_specifications" jsonb,
	"game_format_config" jsonb,
	"scoring_system_config" jsonb,
	"series_config" jsonb,
	"venue_requirements" jsonb,
	"officiating_config" jsonb,
	"timing_config" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competition_leaderboards" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" varchar NOT NULL,
	"participant_id" varchar NOT NULL,
	"current_rank" integer NOT NULL,
	"previous_rank" integer,
	"total_score" numeric NOT NULL,
	"daily_average" numeric,
	"weekly_total" numeric,
	"monthly_total" numeric,
	"goal_progress" numeric,
	"streak_days" integer DEFAULT 0,
	"personal_best" numeric,
	"department_rank" integer,
	"team_rank" integer,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_audit_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" varchar,
	"ip_address" varchar,
	"user_agent" text,
	"compliance_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consent_form_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar NOT NULL,
	"team_registration_id" varchar,
	"player_id" varchar,
	"parent_guardian_name" varchar NOT NULL,
	"parent_guardian_email" varchar NOT NULL,
	"digital_signature" varchar NOT NULL,
	"signature_timestamp" timestamp NOT NULL,
	"response_data" jsonb DEFAULT '{}'::jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"is_complete" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consent_form_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"form_type" text NOT NULL,
	"html_content" text NOT NULL,
	"required_fields" jsonb DEFAULT '[]'::jsonb,
	"legal_disclaimer" text,
	"state_compliance" jsonb,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"email" varchar NOT NULL,
	"phone" varchar,
	"organization" varchar,
	"organization_type" text,
	"position" varchar,
	"sport" varchar,
	"notes" text,
	"source" text DEFAULT 'manual_entry',
	"last_contact_date" timestamp,
	"contact_status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "corporate_competitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"competition_type" varchar NOT NULL,
	"tracking_metric" varchar NOT NULL,
	"competition_format" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" varchar DEFAULT 'planning' NOT NULL,
	"revenue_goal" numeric,
	"units_sold_goal" integer,
	"sales_targets" jsonb,
	"production_target" integer,
	"quality_threshold" integer,
	"efficiency_metric" varchar,
	"production_goals" jsonb,
	"custom_metrics" jsonb,
	"departments" text[],
	"registration_codes" jsonb,
	"prize_structure" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "corporate_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"employee_id" varchar,
	"department" varchar NOT NULL,
	"role" varchar NOT NULL,
	"team_name" varchar,
	"registration_code" varchar NOT NULL,
	"current_score" numeric DEFAULT '0',
	"current_rank" integer,
	"personal_goal" numeric,
	"territory" varchar,
	"shift" varchar,
	"start_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_processing_agreements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"agreement_type" text NOT NULL,
	"signed_date" timestamp,
	"expiration_date" timestamp,
	"agreement_document" varchar,
	"signatory_name" varchar,
	"signatory_title" varchar,
	"is_active" boolean DEFAULT true,
	"compliance_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"code" varchar NOT NULL,
	"description" varchar,
	"discount_type" text NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"max_uses" integer,
	"current_uses" integer DEFAULT 0,
	"valid_from" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"is_active" boolean DEFAULT true,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"abbreviation" varchar NOT NULL,
	"district_code" varchar NOT NULL,
	"state" varchar DEFAULT 'TX' NOT NULL,
	"city" varchar NOT NULL,
	"zip_code" varchar,
	"superintendent_name" varchar,
	"athletic_director_id" varchar,
	"head_athletic_trainer_id" varchar,
	"website" varchar,
	"phone" varchar,
	"logo_url" varchar,
	"brand_colors" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "districts_district_code_unique" UNIQUE("district_code")
);
--> statement-breakpoint
CREATE TABLE "division_generation_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar,
	"template_id" varchar,
	"generation_config" jsonb NOT NULL,
	"status" varchar DEFAULT 'pending',
	"generated_divisions" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "division_matches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"match_id" varchar NOT NULL,
	"division" text NOT NULL,
	"age_group" text,
	"gender" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "division_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"division_id" varchar,
	"participant_id" varchar NOT NULL,
	"participant_name" varchar NOT NULL,
	"participant_type" varchar NOT NULL,
	"seed_number" integer,
	"qualification_data" jsonb,
	"registration_time" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'registered'
);
--> statement-breakpoint
CREATE TABLE "division_scheduling" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar,
	"division_id" varchar,
	"scheduling_config" jsonb NOT NULL,
	"venue_assignments" jsonb,
	"time_slots" jsonb,
	"conflict_resolution" jsonb,
	"optimization_score" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "division_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_name" varchar NOT NULL,
	"template_description" text,
	"sport_category" varchar,
	"division_structure" jsonb NOT NULL,
	"auto_generation_rules" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"donor_id" varchar NOT NULL,
	"amount" numeric NOT NULL,
	"stripe_payment_intent_id" varchar,
	"payment_status" text DEFAULT 'pending',
	"donation_purpose" text DEFAULT 'general_education',
	"post_donation_choice" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "donors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"total_donated" numeric DEFAULT '0',
	"donation_count" integer DEFAULT 0,
	"last_donation_date" timestamp,
	"preferred_contact_method" text DEFAULT 'email',
	"source" text DEFAULT 'landing_page',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "educational_impact_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"tournament_id" varchar,
	"metric_type" text NOT NULL,
	"value" numeric NOT NULL,
	"description" text,
	"date_recorded" timestamp DEFAULT now(),
	"academic_year" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"content" text NOT NULL,
	"status" text DEFAULT 'draft',
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"recipient_count" integer DEFAULT 0,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_event_id" varchar NOT NULL,
	"tournament_id" varchar NOT NULL,
	"scorekeeper_id" varchar,
	"assignment_status" text DEFAULT 'open',
	"assignment_type" text DEFAULT 'self_selected',
	"assigned_at" timestamp,
	"accepted_at" timestamp,
	"declined_at" timestamp,
	"assignment_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"event_name" varchar NOT NULL,
	"venue_name" varchar NOT NULL,
	"address" text NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"geofence_radius" integer DEFAULT 100,
	"allow_remote_scoring" boolean DEFAULT false,
	"require_location_verification" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_event_id" varchar NOT NULL,
	"event_school_id" varchar NOT NULL,
	"athlete_name" varchar NOT NULL,
	"grade" varchar,
	"division" text,
	"participant_order" integer,
	"added_by" varchar NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" varchar NOT NULL,
	"tournament_event_id" varchar NOT NULL,
	"attempt_number" integer NOT NULL,
	"result_value" numeric,
	"result_unit" varchar NOT NULL,
	"is_foul" boolean DEFAULT false,
	"is_personal_best" boolean DEFAULT false,
	"notes" text,
	"recorded_by" varchar NOT NULL,
	"recorded_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_schools" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_event_id" varchar NOT NULL,
	"school_name" varchar NOT NULL,
	"school_type" text DEFAULT 'visiting',
	"is_pre_registered" boolean DEFAULT false,
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	"added_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "event_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"assignment_id" varchar NOT NULL,
	"team_id" varchar,
	"participant_name" varchar NOT NULL,
	"event_name" varchar NOT NULL,
	"score_value" numeric,
	"score_unit" varchar,
	"placement" integer,
	"notes" text,
	"scored_at" timestamp DEFAULT now(),
	"scored_by_id" varchar NOT NULL,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fantasy_eligibility_checks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" varchar,
	"user_id" varchar NOT NULL,
	"age_check_passed" boolean DEFAULT false,
	"location_check_passed" boolean DEFAULT true,
	"eligibility_date" timestamp DEFAULT now(),
	"check_details" jsonb
);
--> statement-breakpoint
CREATE TABLE "fantasy_leagues" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_name" varchar NOT NULL,
	"commissioner_id" varchar NOT NULL,
	"sport_type" varchar NOT NULL,
	"league_format" varchar NOT NULL,
	"data_source" varchar NOT NULL,
	"age_restriction" integer DEFAULT 18,
	"requires_age_verification" boolean DEFAULT true,
	"max_participants" integer DEFAULT 12,
	"entry_requirements" jsonb,
	"scoring_config" jsonb NOT NULL,
	"prize_structure" jsonb,
	"league_settings" jsonb NOT NULL,
	"status" varchar DEFAULT 'open',
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fantasy_lineups" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" varchar,
	"participant_id" varchar,
	"week_number" integer,
	"lineup_config" jsonb NOT NULL,
	"total_salary" integer,
	"projected_points" numeric,
	"actual_points" numeric DEFAULT '0',
	"lineup_status" varchar DEFAULT 'set',
	"submission_timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fantasy_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" varchar,
	"user_id" varchar NOT NULL,
	"team_name" varchar NOT NULL,
	"age_verified" boolean DEFAULT false,
	"age_verification_date" timestamp,
	"entry_date" timestamp DEFAULT now(),
	"current_score" numeric DEFAULT '0',
	"eliminated" boolean DEFAULT false,
	"elimination_week" integer,
	"participant_status" varchar DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "fantasy_picks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" varchar,
	"participant_id" varchar,
	"week_number" integer,
	"pick_type" varchar NOT NULL,
	"selected_player_id" varchar,
	"selected_team" varchar,
	"pick_timestamp" timestamp DEFAULT now(),
	"points_earned" numeric DEFAULT '0',
	"is_eliminated_pick" boolean DEFAULT false,
	"used_players" jsonb
);
--> statement-breakpoint
CREATE TABLE "fantasy_safety_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_type" varchar NOT NULL,
	"league_format" varchar NOT NULL,
	"min_age_requirement" integer DEFAULT 18,
	"restricted_regions" jsonb,
	"max_entry_amount" numeric,
	"requires_identity_verification" boolean DEFAULT true,
	"additional_restrictions" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_length_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" varchar,
	"age_group" varchar NOT NULL,
	"regulation_time" jsonb NOT NULL,
	"overtime_rules" jsonb,
	"break_intervals" jsonb,
	"timeout_rules" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "health_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"athletic_trainer_id" varchar NOT NULL,
	"medical_conditions" text,
	"medications" text,
	"allergies" text,
	"injury_history" jsonb,
	"physicals_on_file" boolean DEFAULT false,
	"physical_expiration_date" date,
	"concussion_baseline" jsonb,
	"last_medical_update" timestamp,
	"hipaa_authorization_form" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jersey_team_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_registration_id" varchar NOT NULL,
	"player_name" varchar NOT NULL,
	"date_of_birth" date,
	"jersey_number" varchar,
	"position" varchar,
	"parent_name" varchar NOT NULL,
	"parent_email" varchar NOT NULL,
	"parent_phone" varchar,
	"emergency_contact_name" varchar,
	"emergency_contact_phone" varchar,
	"member_status" text DEFAULT 'invited',
	"individual_fee" numeric(10, 2),
	"payment_status" text DEFAULT 'unpaid',
	"payment_date" timestamp,
	"stripe_payment_intent_id" varchar,
	"documents_required" jsonb,
	"documents_complete" boolean DEFAULT false,
	"custom_form_data" jsonb,
	"joined_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jersey_team_payments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_registration_id" varchar NOT NULL,
	"payer_name" varchar NOT NULL,
	"payer_email" varchar NOT NULL,
	"payment_amount" numeric(10, 2) NOT NULL,
	"payment_type" text NOT NULL,
	"payment_method" text NOT NULL,
	"stripe_payment_intent_id" varchar,
	"stripe_customer_id" varchar,
	"payment_plan_enrollment_id" varchar,
	"covers_members" jsonb,
	"allocation_notes" text,
	"payment_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leagues" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"commissioner_id" varchar NOT NULL,
	"registration_code" varchar NOT NULL,
	"settings" jsonb,
	"participants" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "leagues_registration_code_unique" UNIQUE("registration_code")
);
--> statement-breakpoint
CREATE TABLE "live_score_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"live_score_id" varchar NOT NULL,
	"sender_id" varchar NOT NULL,
	"recipient_id" varchar,
	"message_type" text NOT NULL,
	"content" text NOT NULL,
	"related_participant_id" varchar,
	"performance_context" jsonb,
	"is_auto_generated" boolean DEFAULT false,
	"auto_message_trigger" text,
	"sent_at" timestamp DEFAULT now(),
	"read_at" timestamp,
	"delivered_via_push" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"match_id" varchar NOT NULL,
	"event_name" varchar,
	"participant1_id" varchar,
	"participant1_name" varchar NOT NULL,
	"participant1_score" numeric DEFAULT '0',
	"participant2_id" varchar,
	"participant2_name" varchar,
	"participant2_score" numeric DEFAULT '0',
	"score_type" text DEFAULT 'points',
	"score_unit" varchar,
	"match_status" text DEFAULT 'scheduled',
	"winner_id" varchar,
	"start_time" timestamp,
	"end_time" timestamp,
	"venue" varchar,
	"field" varchar,
	"assigned_scorekeeper_id" varchar NOT NULL,
	"last_updated_by" varchar,
	"is_live" boolean DEFAULT false,
	"live_update_count" integer DEFAULT 0,
	"last_score_update" timestamp,
	"additional_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "location_check_ins" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"event_location_id" varchar NOT NULL,
	"tournament_id" varchar NOT NULL,
	"check_in_latitude" numeric(10, 8) NOT NULL,
	"check_in_longitude" numeric(11, 8) NOT NULL,
	"distance_from_venue" integer,
	"check_in_type" text NOT NULL,
	"verification_status" text DEFAULT 'verified',
	"check_in_time" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "location_scoring_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scorekeeper_id" varchar NOT NULL,
	"event_location_id" varchar NOT NULL,
	"tournament_id" varchar NOT NULL,
	"is_location_verified" boolean DEFAULT false,
	"last_location_check" timestamp,
	"location_check_latitude" numeric(10, 8),
	"location_check_longitude" numeric(11, 8),
	"distance_from_venue" integer,
	"can_score_remotely" boolean DEFAULT false,
	"permission_granted_by" varchar,
	"permission_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"round" integer NOT NULL,
	"position" integer NOT NULL,
	"team1" text,
	"team2" text,
	"team1_score" integer DEFAULT 0,
	"team2_score" integer DEFAULT 0,
	"winner" text,
	"status" text DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_recipients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"user_role" text NOT NULL,
	"delivery_status" text DEFAULT 'pending',
	"delivered_at" timestamp,
	"read_at" timestamp,
	"push_tokens" jsonb DEFAULT '[]'::jsonb,
	"push_delivery_status" text DEFAULT 'not_sent',
	"push_delivered_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_usage" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"month" varchar NOT NULL,
	"messages_used" integer DEFAULT 0,
	"message_limit" integer DEFAULT 50,
	"tournament_updates" integer DEFAULT 0,
	"team_notifications" integer DEFAULT 0,
	"payment_reminders" integer DEFAULT 0,
	"broadcasts" integer DEFAULT 0,
	"direct_messages" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" varchar NOT NULL,
	"message_type" text NOT NULL,
	"subject" varchar NOT NULL,
	"content" text NOT NULL,
	"priority" text DEFAULT 'normal',
	"tournament_id" varchar,
	"team_id" varchar,
	"fantasy_league_id" varchar,
	"business_org_id" varchar,
	"target_roles" jsonb DEFAULT '[]'::jsonb,
	"domain_type" text DEFAULT 'tournament',
	"is_director_blast" boolean DEFAULT false,
	"total_recipients" integer DEFAULT 0,
	"delivered_count" integer DEFAULT 0,
	"read_count" integer DEFAULT 0,
	"push_notification_sent" boolean DEFAULT false,
	"push_notification_data" jsonb,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mobile_devices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"device_id" varchar NOT NULL,
	"platform" text NOT NULL,
	"fcm_token" varchar,
	"apns_token" varchar,
	"app_version" varchar,
	"os_version" varchar,
	"device_model" varchar,
	"notification_settings" jsonb DEFAULT '{"tournamentUpdates":true,"teamNotifications":true,"paymentReminders":true,"gameSchedules":true,"generalAnnouncements":true}'::jsonb,
	"is_active" boolean DEFAULT true,
	"last_active_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modular_pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"page_background" jsonb,
	"modules" jsonb DEFAULT '[]'::jsonb,
	"is_published" boolean DEFAULT false,
	"is_registration_open" boolean DEFAULT false,
	"custom_domain" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nightly_analysis" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_date" timestamp DEFAULT now(),
	"yahoo_data" jsonb,
	"free_source_data" jsonb,
	"comparison_analysis" jsonb,
	"predictions" jsonb,
	"processing_time_ms" integer,
	"status" varchar DEFAULT 'completed',
	"data_points_collected" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "nonprofit_invoices" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" varchar NOT NULL,
	"invoice_number" varchar NOT NULL,
	"invoice_date" timestamp DEFAULT now(),
	"due_date" timestamp NOT NULL,
	"billing_period_start" date NOT NULL,
	"billing_period_end" date NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"payment_date" timestamp,
	"payment_method" text,
	"payment_reference" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "nonprofit_invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "nonprofit_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"billing_contact_user_id" varchar NOT NULL,
	"subscription_tier" text NOT NULL,
	"flat_rate_amount" numeric(10, 2) NOT NULL,
	"billing_cycle" text DEFAULT 'annual',
	"subscription_status" text DEFAULT 'active',
	"tax_exempt_status" text DEFAULT 'pending_verification',
	"exemption_document_id" varchar,
	"next_billing_date" timestamp,
	"last_billing_date" timestamp,
	"billing_address" jsonb,
	"payment_method" text DEFAULT 'check',
	"payment_instructions" text,
	"nonprofit_verification_required" boolean DEFAULT true,
	"compliance_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"type" text NOT NULL,
	"contact_email" varchar NOT NULL,
	"contact_phone" varchar,
	"address" text,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"website" varchar,
	"parent_organization_id" varchar,
	"is_verified" boolean DEFAULT false,
	"verification_notes" text,
	"registration_status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizer_contacts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" varchar NOT NULL,
	"tournament_id" varchar,
	"contact_name" varchar NOT NULL,
	"contact_email" varchar NOT NULL,
	"contact_phone" varchar,
	"contact_source" varchar NOT NULL,
	"contact_role" varchar,
	"organization_name" varchar,
	"team_name" varchar,
	"email_opt_in" boolean DEFAULT false,
	"sms_opt_in" boolean DEFAULT false,
	"marketing_opt_in" boolean DEFAULT false,
	"last_email_sent" timestamp,
	"last_email_opened" timestamp,
	"email_open_count" integer DEFAULT 0,
	"total_tournaments" integer DEFAULT 1,
	"city" varchar,
	"state" varchar,
	"zip_code" varchar,
	"collected_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizer_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" varchar NOT NULL,
	"metric_date" date NOT NULL,
	"total_page_views" integer DEFAULT 0,
	"unique_visitors" integer DEFAULT 0,
	"new_visitors" integer DEFAULT 0,
	"avg_session_duration" integer DEFAULT 0,
	"total_contacts" integer DEFAULT 0,
	"new_contacts_today" integer DEFAULT 0,
	"email_opt_ins" integer DEFAULT 0,
	"sms_opt_ins" integer DEFAULT 0,
	"active_tournaments" integer DEFAULT 0,
	"total_registrations" integer DEFAULT 0,
	"new_registrations_today" integer DEFAULT 0,
	"top_cities" jsonb DEFAULT '[]'::jsonb,
	"top_states" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizer_page_views" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizer_id" varchar NOT NULL,
	"tournament_id" varchar,
	"page_url" varchar NOT NULL,
	"page_title" varchar,
	"page_type" varchar NOT NULL,
	"visitor_id" varchar,
	"visitor_ip" varchar,
	"user_agent" text,
	"referrer" varchar,
	"country" varchar,
	"city" varchar,
	"device_type" varchar,
	"browser_name" varchar,
	"session_id" varchar,
	"session_duration" integer,
	"is_new_visitor" boolean DEFAULT true,
	"viewed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"content" text NOT NULL,
	"meta_description" varchar,
	"is_published" boolean DEFAULT false,
	"page_type" text DEFAULT 'custom',
	"template_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "participant_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_event_id" varchar NOT NULL,
	"participant_name" text NOT NULL,
	"team_name" text,
	"bib_number" text,
	"preliminary_result" numeric,
	"final_result" numeric,
	"placement" integer,
	"is_disqualified" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_plan_enrollments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"registration_id" varchar NOT NULL,
	"payment_plan_id" varchar NOT NULL,
	"participant_email" varchar NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"processing_fee" numeric(10, 2) NOT NULL,
	"first_payment_amount" numeric(10, 2) NOT NULL,
	"remaining_payment_amount" numeric(10, 2) NOT NULL,
	"enrollment_status" text DEFAULT 'active',
	"stripe_customer_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_plan_installments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" varchar NOT NULL,
	"installment_number" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_status" text DEFAULT 'pending',
	"stripe_payment_intent_id" varchar,
	"paid_date" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_plans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"plan_name" varchar NOT NULL,
	"plan_type" text NOT NULL,
	"minimum_amount" numeric(10, 2) NOT NULL,
	"installment_count" integer NOT NULL,
	"first_payment_percentage" numeric(5, 2) DEFAULT '50.00',
	"processing_fee_percentage" numeric(5, 2) DEFAULT '2.50',
	"cutoff_days_before_tournament" integer DEFAULT 14,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" varchar NOT NULL,
	"participant_id" varchar NOT NULL,
	"metric_type" varchar NOT NULL,
	"metric_value" numeric NOT NULL,
	"recorded_date" timestamp NOT NULL,
	"shift" varchar,
	"product_type" varchar,
	"territory" varchar,
	"customer_type" varchar,
	"quality_score" integer,
	"defect_count" integer DEFAULT 0,
	"verified_by" varchar,
	"verification_status" varchar DEFAULT 'pending',
	"verification_notes" text,
	"source" varchar DEFAULT 'manual',
	"batch_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permission_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"permission_type" varchar NOT NULL,
	"resource_id" varchar,
	"resource_type" varchar,
	"permission_scope" jsonb,
	"granted_by" varchar NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permission_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_name" varchar NOT NULL,
	"role_type" varchar NOT NULL,
	"subscription_tier" varchar NOT NULL,
	"permissions" jsonb NOT NULL,
	"restrictions" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"active_users" integer DEFAULT 0,
	"new_signups" integer DEFAULT 0,
	"tournaments_created" integer DEFAULT 0,
	"revenue_generated" numeric DEFAULT '0',
	"subscription_upgrades" integer DEFAULT 0,
	"whitelabel_clients_active" integer DEFAULT 0,
	"student_trips_funded" integer DEFAULT 0,
	"champions_campaign_progress" numeric DEFAULT '0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "player_performances" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" varchar,
	"week_number" integer,
	"season" varchar,
	"game_date" timestamp,
	"opponent" varchar,
	"stats" jsonb NOT NULL,
	"fantasy_points" numeric NOT NULL,
	"data_source" varchar,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_players" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_player_id" varchar NOT NULL,
	"data_source" varchar NOT NULL,
	"player_name" varchar NOT NULL,
	"team_name" varchar NOT NULL,
	"team_abbreviation" varchar,
	"position" varchar NOT NULL,
	"sport" varchar NOT NULL,
	"jersey_number" integer,
	"salary" integer,
	"current_season_stats" jsonb,
	"injury_status" varchar DEFAULT 'healthy',
	"bye_week" integer,
	"last_updated" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "registration_codes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"type" text NOT NULL,
	"created_by" varchar NOT NULL,
	"organization_id" varchar,
	"league_id" varchar,
	"permissions" jsonb NOT NULL,
	"max_uses" integer DEFAULT 1,
	"current_uses" integer DEFAULT 0,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "registration_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "registration_form_fields" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"field_type" text NOT NULL,
	"label" varchar NOT NULL,
	"placeholder" varchar,
	"is_required" boolean DEFAULT false,
	"position" integer NOT NULL,
	"options" jsonb,
	"validation" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "registration_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_type" text NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"position" varchar,
	"organization_name" varchar NOT NULL,
	"organization_type" text NOT NULL,
	"parent_organization" varchar,
	"years_experience" integer,
	"sports_involved" jsonb,
	"certifications" text,
	"references" jsonb,
	"request_reason" text,
	"selected_tier" text DEFAULT 'foundation',
	"payment_method" text DEFAULT 'pending',
	"stripe_session_id" varchar,
	"status" text DEFAULT 'pending',
	"review_notes" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "registration_responses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"participant_email" varchar,
	"participant_name" varchar,
	"form_data" jsonb,
	"payment_status" text DEFAULT 'pending',
	"payment_amount" numeric(10, 2),
	"stripe_payment_intent_id" varchar,
	"approval_status" text DEFAULT 'pending',
	"submitted_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"approved_by_id" varchar
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_role" text NOT NULL,
	"permission" text NOT NULL,
	"is_allowed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" varchar NOT NULL,
	"asset_type" text NOT NULL,
	"file_name" varchar NOT NULL,
	"file_path" varchar NOT NULL,
	"file_size" integer,
	"mime_type" varchar,
	"uploaded_by_id" varchar NOT NULL,
	"description" text,
	"tags" jsonb,
	"is_public" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_event_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"school_id" varchar NOT NULL,
	"assigned_by_id" varchar NOT NULL,
	"event_names" jsonb NOT NULL,
	"school_athletic_director_id" varchar,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"assignment_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"abbreviation" varchar NOT NULL,
	"school_type" text NOT NULL,
	"vlc_code" varchar NOT NULL,
	"ncess_id" varchar,
	"address" varchar NOT NULL,
	"city" varchar NOT NULL,
	"state" varchar DEFAULT 'TX' NOT NULL,
	"zip_code" varchar NOT NULL,
	"phone" varchar,
	"website" varchar,
	"principal_name" varchar,
	"principal_id" varchar,
	"athletic_director_id" varchar,
	"athletic_trainer_id" varchar,
	"logo_url" varchar,
	"banner_image_url" varchar,
	"mascot_name" varchar,
	"school_colors" jsonb,
	"gym_capacity" integer,
	"football_stadium" varchar,
	"track_facility" varchar,
	"has_pool" boolean DEFAULT false,
	"total_enrollment" integer,
	"athletic_participation" integer,
	"grades" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "schools_vlc_code_unique" UNIQUE("vlc_code")
);
--> statement-breakpoint
CREATE TABLE "score_update_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"live_score_id" varchar NOT NULL,
	"updated_by" varchar NOT NULL,
	"update_type" text NOT NULL,
	"previous_data" jsonb,
	"new_data" jsonb,
	"update_reason" varchar,
	"triggered_bracket_update" boolean DEFAULT false,
	"bracket_update_details" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scorekeeper_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"scorekeeper_id" varchar NOT NULL,
	"assigned_by" varchar NOT NULL,
	"assigned_events" jsonb DEFAULT '[]'::jsonb,
	"assigned_venues" jsonb DEFAULT '[]'::jsonb,
	"can_update_scores" boolean DEFAULT true,
	"can_mark_match_complete" boolean DEFAULT true,
	"can_send_messages" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"assignment_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scoring_automations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" varchar,
	"automation_type" varchar NOT NULL,
	"data_source" varchar NOT NULL,
	"last_run" timestamp,
	"next_scheduled_run" timestamp,
	"automation_status" varchar DEFAULT 'active',
	"error_log" jsonb
);
--> statement-breakpoint
CREATE TABLE "series_templates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" varchar,
	"series_name" varchar NOT NULL,
	"games_to_win" integer NOT NULL,
	"maximum_games" integer NOT NULL,
	"home_field_advantage" boolean DEFAULT false,
	"game_intervals" jsonb,
	"tiebreaker_rules" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sport_categories" (
	"id" varchar PRIMARY KEY NOT NULL,
	"category_name" text NOT NULL,
	"category_description" text,
	"category_sort_order" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sport_division_rules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" varchar NOT NULL,
	"required_divisions" jsonb,
	"allowed_combinations" jsonb,
	"age_group_rules" jsonb,
	"gender_rules" jsonb,
	"performance_standards" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sport_events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"sport_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"scoring_method" text NOT NULL,
	"measurement_unit" text NOT NULL,
	"supports_metric" boolean DEFAULT true,
	"supports_imperial" boolean DEFAULT true,
	"gender" text DEFAULT 'mixed',
	"age_group" text,
	"sort_order" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sport_options" (
	"id" varchar PRIMARY KEY NOT NULL,
	"sport_name" text NOT NULL,
	"sport_category" text NOT NULL,
	"sport_subcategory" text,
	"sport_sort_order" integer,
	"competition_type" text DEFAULT 'bracket' NOT NULL,
	"scoring_method" text DEFAULT 'wins',
	"measurement_unit" text,
	"has_sub_events" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"grade" integer,
	"school_id" varchar NOT NULL,
	"district_id" varchar NOT NULL,
	"emergency_contact" jsonb,
	"parental_consent" boolean DEFAULT false,
	"ferpa_release_form" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_team_ai_consultations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athletic_trainer_id" varchar NOT NULL,
	"member_id" varchar,
	"support_team_id" varchar,
	"consultation_type" text NOT NULL,
	"sport" text NOT NULL,
	"injury_location" text,
	"symptoms" text,
	"activity_description" text,
	"risk_factors" jsonb,
	"ai_recommendations" text,
	"risk_level" text DEFAULT 'low',
	"red_flags" jsonb,
	"recommended_actions" jsonb,
	"stunting_activity" boolean DEFAULT false,
	"basket_toss_involved" boolean DEFAULT false,
	"surface_type" text,
	"follow_up_required" boolean DEFAULT false,
	"follow_up_completed" boolean DEFAULT false,
	"follow_up_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_team_injuries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" varchar NOT NULL,
	"athletic_trainer_id" varchar,
	"injury_date" date NOT NULL,
	"injury_location" text NOT NULL,
	"injury_type" text NOT NULL,
	"activity_when_injured" text,
	"stunting_position" text,
	"surface_type" text,
	"severity" text DEFAULT 'minor',
	"description" text,
	"treatment_provided" text,
	"return_to_play_cleared" boolean DEFAULT false,
	"return_to_play_date" date,
	"requires_follow_up" boolean DEFAULT false,
	"follow_up_notes" text,
	"parent_notified" boolean DEFAULT false,
	"doctor_referral" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_team_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"support_team_id" varchar NOT NULL,
	"student_id" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"grade" integer,
	"date_of_birth" date,
	"position" text DEFAULT 'member',
	"years_experience" integer DEFAULT 0,
	"skill_level" text DEFAULT 'beginner',
	"can_stunt" boolean DEFAULT false,
	"can_tumble" boolean DEFAULT false,
	"can_fly" boolean DEFAULT false,
	"can_base" boolean DEFAULT false,
	"can_spot" boolean DEFAULT false,
	"medical_clearance" boolean DEFAULT false,
	"clearance_date" date,
	"clearance_expires_at" date,
	"has_injury_history" boolean DEFAULT false,
	"parent_email" varchar,
	"parent_phone" varchar,
	"emergency_contact_name" varchar,
	"emergency_contact_phone" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "support_teams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"team_type" text NOT NULL,
	"season" text DEFAULT 'fall',
	"coach_id" varchar,
	"assistant_coach_id" varchar,
	"team_size" integer DEFAULT 0,
	"competition_level" text DEFAULT 'varsity',
	"usa_cheer_safety" boolean DEFAULT false,
	"usasf_compliant" boolean DEFAULT false,
	"nfhs_rules" boolean DEFAULT false,
	"stunts_allowed" boolean DEFAULT false,
	"tumbling_allowed" boolean DEFAULT false,
	"basket_toss_allowed" boolean DEFAULT false,
	"pyramids_allowed" boolean DEFAULT false,
	"practices_on_mats" boolean DEFAULT true,
	"competes_on_mats" boolean DEFAULT true,
	"has_spring_floor" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tax_exemption_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" varchar NOT NULL,
	"uploader_user_id" varchar NOT NULL,
	"document_type" text NOT NULL,
	"document_name" varchar NOT NULL,
	"document_path" varchar NOT NULL,
	"file_size" integer,
	"mime_type" varchar,
	"expiration_date" date,
	"verification_status" text DEFAULT 'pending',
	"verification_notes" text,
	"verified_by" varchar,
	"verified_at" timestamp,
	"issuing_state" varchar,
	"federal_ein" varchar,
	"tax_exempt_number" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar,
	"player_id" varchar,
	"document_type" text NOT NULL,
	"document_name" varchar NOT NULL,
	"document_url" varchar,
	"uploaded_by" varchar,
	"is_required" boolean DEFAULT true,
	"is_approved" boolean DEFAULT false,
	"approved_by" varchar,
	"approval_date" timestamp,
	"expiration_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_players" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar NOT NULL,
	"player_name" varchar NOT NULL,
	"date_of_birth" date,
	"jersey_number" varchar,
	"position" varchar,
	"parent_guardian_name" varchar,
	"parent_guardian_email" varchar,
	"parent_guardian_phone" varchar,
	"emergency_contact_name" varchar,
	"emergency_contact_phone" varchar,
	"medical_notes" text,
	"allergies" text,
	"medications" text,
	"physician_name" varchar,
	"physician_phone" varchar,
	"status" text DEFAULT 'active',
	"health_alerts" jsonb,
	"performance_trends" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "team_registrations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"coach_id" varchar,
	"team_name" varchar NOT NULL,
	"organization_name" varchar,
	"team_code" varchar NOT NULL,
	"captain_name" varchar NOT NULL,
	"captain_email" varchar NOT NULL,
	"captain_phone" varchar,
	"payment_method" text DEFAULT 'individual_payments',
	"player_list" jsonb,
	"registered_events" jsonb,
	"registration_status" text DEFAULT 'incomplete',
	"payment_status" text DEFAULT 'unpaid',
	"total_fee" numeric(10, 2) DEFAULT '0',
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"payment_breakdown" jsonb DEFAULT '[]'::jsonb,
	"required_players" integer,
	"current_players" integer DEFAULT 0,
	"max_players" integer,
	"applied_discount_code" varchar,
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"payment_plan_id" varchar,
	"required_documents" jsonb DEFAULT '[]'::jsonb,
	"document_compliance_status" text DEFAULT 'incomplete',
	"registration_date" timestamp DEFAULT now(),
	"notes" text,
	"approval_notes" text,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "team_registrations_team_code_unique" UNIQUE("team_code")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_name" varchar NOT NULL,
	"organization_name" varchar,
	"coach_name" varchar NOT NULL,
	"coach_email" varchar NOT NULL,
	"coach_phone" varchar,
	"coach_id" varchar,
	"assistant_coaches" jsonb DEFAULT '[]'::jsonb,
	"team_color" varchar,
	"home_venue" varchar,
	"age_group" varchar,
	"division" varchar,
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournament_credits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"package_type" text NOT NULL,
	"credits_amount" integer NOT NULL,
	"price_amount" numeric(10, 2) NOT NULL,
	"stripe_payment_id" varchar,
	"purchase_date" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"status" text DEFAULT 'pending'
);
--> statement-breakpoint
CREATE TABLE "tournament_divisions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar,
	"division_name" varchar NOT NULL,
	"division_type" varchar NOT NULL,
	"division_config" jsonb NOT NULL,
	"participant_count" integer DEFAULT 0,
	"max_participants" integer,
	"registration_deadline" timestamp,
	"division_status" varchar DEFAULT 'open',
	"bracket_structure" jsonb,
	"advancement_rules" jsonb,
	"prize_structure" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournament_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar NOT NULL,
	"sport_event_id" varchar NOT NULL,
	"measurement_system" text DEFAULT 'metric',
	"results_recorder_id" varchar,
	"results_recorder_name" varchar,
	"results_recorder_email" varchar,
	"event_status" text DEFAULT 'upcoming',
	"event_date_time" timestamp,
	"event_order" integer DEFAULT 1,
	"max_participants" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournament_format_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_structure_id" varchar,
	"sport_category" varchar,
	"min_participants" integer DEFAULT 2 NOT NULL,
	"max_participants" integer,
	"ideal_participants" integer,
	"bracket_generation_rules" jsonb,
	"advancement_rules" jsonb,
	"tiebreaker_rules" jsonb,
	"scheduling_requirements" jsonb,
	"venue_requirements" jsonb,
	"officiating_requirements" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournament_generation_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" varchar,
	"generation_step" varchar NOT NULL,
	"step_data" jsonb,
	"success" boolean DEFAULT true,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournament_organizations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_name" varchar NOT NULL,
	"organization_type" varchar NOT NULL,
	"parent_organization_id" varchar,
	"subscription_tier" varchar NOT NULL,
	"white_label_config" jsonb,
	"branding_config" jsonb,
	"custom_domain" varchar,
	"organization_settings" jsonb,
	"billing_config" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournament_structures" (
	"id" varchar PRIMARY KEY NOT NULL,
	"format_name" text NOT NULL,
	"format_description" text,
	"format_type" text,
	"applicable_sports" text,
	"format_sort_order" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"team_size" integer NOT NULL,
	"tournament_type" text DEFAULT 'single' NOT NULL,
	"competition_format" text DEFAULT 'bracket' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"current_stage" integer DEFAULT 1,
	"total_stages" integer DEFAULT 1,
	"stage_configuration" jsonb,
	"series_length" integer DEFAULT 7,
	"bracket" jsonb NOT NULL,
	"teams" jsonb DEFAULT '[]'::jsonb,
	"sport" text,
	"sport_category" text,
	"tournament_structure" text,
	"age_group" text DEFAULT 'All Ages',
	"gender_division" text DEFAULT 'Mixed',
	"divisions" jsonb,
	"scoring_method" text DEFAULT 'wins',
	"user_id" varchar,
	"whitelabel_config_id" varchar,
	"entry_fee" numeric DEFAULT '0',
	"max_participants" integer,
	"registration_deadline" timestamp,
	"tournament_date" timestamp,
	"location" text,
	"description" text,
	"is_public" boolean DEFAULT true,
	"donations_enabled" boolean DEFAULT false,
	"donation_goal" numeric DEFAULT '0',
	"donation_description" text,
	"stripe_account_id" varchar,
	"registration_fee_enabled" boolean DEFAULT false,
	"ai_setup_progress" jsonb,
	"ai_context" jsonb,
	"setup_assistance_level" text DEFAULT 'standard',
	"donation_setup_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"registration_type" text DEFAULT 'individual',
	"allow_partial_team_payments" boolean DEFAULT true,
	"max_team_size" integer,
	"min_team_size" integer,
	"golf_format" text,
	"golf_cut_system" text,
	"golf_handicap_system" boolean DEFAULT false,
	"golf_rounds" integer DEFAULT 4,
	"football_format" text,
	"football_seeding_method" text,
	"football_tiebreakers" jsonb,
	"swimming_format" text,
	"swimming_heat_management" boolean DEFAULT true,
	"swimming_time_standards" jsonb,
	"swimming_scoring" text,
	"wrestling_format" text,
	"wrestling_weight_classes" jsonb[],
	"wrestling_pool_format" boolean DEFAULT false,
	"basketball_format" text,
	"basketball_skills_events" jsonb,
	"track_format" text,
	"track_scoring_system" text,
	"track_field_event_management" boolean DEFAULT true,
	"track_qualifying_standards" jsonb,
	"tennis_format" text,
	"tennis_draw_size" integer DEFAULT 32,
	"tennis_consolation_bracket" boolean DEFAULT false,
	"soccer_format" text,
	"soccer_extra_time" boolean DEFAULT true,
	"soccer_penalty_shootouts" boolean DEFAULT true,
	"academic_format" text,
	"academic_advancement_rules" jsonb,
	"academic_judging_criteria" jsonb,
	"academic_substitution_rules" boolean DEFAULT true,
	"fine_arts_format" text,
	"fine_arts_rating_scale" text,
	"fine_arts_categories" jsonb[],
	"seeding_method" text,
	"tiebreaker_rules" jsonb,
	"advancement_criteria" jsonb,
	"consolation_bracket" boolean DEFAULT false,
	"wildcard_slots" integer DEFAULT 0,
	"bye_management" text,
	"multi_day_format" boolean DEFAULT false,
	"session_scheduling" jsonb,
	"official_assignments" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "track_event_timing" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_event_id" varchar NOT NULL,
	"timing_method" text NOT NULL,
	"precision_level" text NOT NULL,
	"wind_measurement" boolean DEFAULT false,
	"photo_finish" boolean DEFAULT false,
	"reaction_time_tracking" boolean DEFAULT false,
	"intermediate_splits" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "track_events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_name" text NOT NULL,
	"event_category" text,
	"distance_meters" integer,
	"measurement_type" text,
	"max_attempts" integer DEFAULT 3,
	"uses_lanes" boolean DEFAULT false,
	"uses_stagger" boolean DEFAULT false,
	"uses_hurdles" boolean DEFAULT false,
	"hurdle_height_men" numeric,
	"hurdle_height_women" numeric,
	"hurdle_count" integer DEFAULT 0,
	"implements_used" jsonb,
	"wind_legal_distance" integer,
	"qualifying_standards" jsonb,
	"equipment_specs" jsonb,
	"scoring_method" text,
	"ribbon_places" integer DEFAULT 8,
	"age_restrictions" jsonb,
	"gender_specific" boolean DEFAULT false,
	"event_sort_order" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" text NOT NULL,
	"ip_address" varchar,
	"user_agent" varchar,
	"device_fingerprint" varchar,
	"timestamp" timestamp DEFAULT now(),
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_dashboard_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_role" varchar NOT NULL,
	"subscription_tier" varchar NOT NULL,
	"dashboard_layout" jsonb NOT NULL,
	"available_features" jsonb NOT NULL,
	"ui_permissions" jsonb NOT NULL,
	"navigation_config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_organization_roles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"organization_id" varchar,
	"role_within_org" varchar NOT NULL,
	"permissions_override" jsonb,
	"assignment_date" timestamp DEFAULT now(),
	"status" varchar DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"subscription_status" text DEFAULT 'inactive',
	"subscription_plan" text DEFAULT 'foundation',
	"user_role" text DEFAULT 'fan',
	"organization_id" varchar,
	"organization_name" varchar,
	"mission" text,
	"custom_branding" jsonb DEFAULT '{"primaryColor":"#000000","secondaryColor":"#666666","backgroundColor":"#ffffff","textColor":"#1a1a1a","accentColor":"#3b82f6","theme":"neutral"}'::jsonb,
	"is_whitelabel_client" boolean DEFAULT false,
	"whitelabel_domain" varchar,
	"whitelabel_branding" jsonb DEFAULT '{"primaryColor":"#000000","secondaryColor":"#666666","backgroundColor":"#ffffff","theme":"neutral"}'::jsonb,
	"ai_preferences" jsonb,
	"tech_skill_level" text DEFAULT 'intermediate',
	"completed_ai_tutorials" jsonb,
	"ai_interaction_count" integer DEFAULT 0,
	"enhanced_ai_preferences" jsonb,
	"monthly_tournament_limit" integer DEFAULT 5,
	"current_month_tournaments" integer DEFAULT 0,
	"last_month_reset" timestamp DEFAULT now(),
	"registration_fingerprint" varchar,
	"registration_ip" varchar,
	"verified_phone" varchar,
	"organization_verified" boolean DEFAULT false,
	"total_tournaments_created" integer DEFAULT 0,
	"lifetime_usage_value" numeric(10, 2) DEFAULT '0',
	"tournament_credits" integer DEFAULT 0,
	"credits_purchased" numeric(10, 2) DEFAULT '0',
	"hipaa_training_completed" boolean DEFAULT false,
	"hipaa_training_date" timestamp,
	"ferpa_agreement_signed" boolean DEFAULT false,
	"ferpa_agreement_date" timestamp,
	"compliance_role" text,
	"medical_data_access" boolean DEFAULT false,
	"last_compliance_audit" timestamp,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"stripe_connect_account_id" varchar,
	"phone" varchar,
	"organization_type" text,
	"description" text,
	"sports_involved" jsonb,
	"request_type" varchar,
	"payment_method" text,
	"pending_check_amount" varchar,
	"account_status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "whitelabel_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"domain" varchar NOT NULL,
	"company_name" varchar NOT NULL,
	"primary_color" varchar DEFAULT '#3b82f6',
	"secondary_color" varchar DEFAULT '#1e40af',
	"logo_url" varchar,
	"favicon_url" varchar,
	"custom_css" text,
	"allowed_features" jsonb,
	"revenue_share_percentage" numeric DEFAULT '0',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "whitelabel_configs_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "academic_competitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_name" varchar NOT NULL,
	"competition_type" varchar NOT NULL,
	"category" varchar NOT NULL,
	"grade_level" varchar NOT NULL,
	"classification" "school_classification"[],
	"max_participants" integer DEFAULT 3,
	"is_team_event" boolean DEFAULT false,
	"team_size" integer,
	"contest_format" varchar NOT NULL,
	"test_duration_minutes" integer,
	"has_advancement" boolean DEFAULT true,
	"advancement_rules" jsonb,
	"teks_alignment" text,
	"subject_area" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"season" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_districts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_name" varchar NOT NULL,
	"district_number" varchar NOT NULL,
	"region" varchar NOT NULL,
	"classification" "school_classification" NOT NULL,
	"district_esc" varchar,
	"coordinator_name" varchar,
	"coordinator_email" varchar,
	"coordinator_phone" varchar,
	"meet_date" date,
	"meet_location" varchar,
	"registration_deadline" date,
	"is_active" boolean DEFAULT true,
	"allows_substitutions" boolean DEFAULT true,
	"max_entries_per_event" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_meets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"district_id" varchar NOT NULL,
	"meet_name" varchar NOT NULL,
	"meet_type" varchar NOT NULL,
	"level" "competition_level" NOT NULL,
	"meet_date" date NOT NULL,
	"start_time" varchar NOT NULL,
	"end_time" varchar,
	"location" varchar NOT NULL,
	"host_school" varchar,
	"meet_director" varchar NOT NULL,
	"meet_director_email" varchar,
	"meet_director_phone" varchar,
	"registration_deadline" timestamp NOT NULL,
	"substitution_deadline" timestamp,
	"max_schools" integer,
	"competitions" jsonb[],
	"scoring_system" varchar DEFAULT 'uil_standard',
	"awards_levels" jsonb,
	"status" varchar DEFAULT 'planning',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_officials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"role" "academic_role" NOT NULL,
	"certifications" jsonb[],
	"qualified_competitions" jsonb[],
	"experience_level" varchar DEFAULT 'novice',
	"is_active" boolean DEFAULT true,
	"available_dates" jsonb DEFAULT '[]'::jsonb,
	"assignments_completed" integer DEFAULT 0,
	"average_rating" numeric(3, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" varchar NOT NULL,
	"competition_id" varchar NOT NULL,
	"student_id" varchar,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"grade" integer NOT NULL,
	"participant_role" varchar DEFAULT 'primary',
	"entry_position" integer,
	"is_eligible" boolean DEFAULT true,
	"eligibility_verified" boolean DEFAULT false,
	"eligibility_date" date,
	"previous_participation" jsonb DEFAULT '[]'::jsonb,
	"parent_name" varchar,
	"parent_email" varchar,
	"parent_phone" varchar,
	"emergency_contact" varchar,
	"emergency_phone" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meet_id" varchar NOT NULL,
	"competition_id" varchar NOT NULL,
	"participant_id" varchar,
	"team_id" varchar,
	"score" numeric(10, 3),
	"rank" integer,
	"placement" integer,
	"medal" varchar DEFAULT 'none',
	"advances" boolean DEFAULT false,
	"advancement_level" varchar,
	"performance_notes" text,
	"judge_comments" text,
	"results_verified" boolean DEFAULT false,
	"verified_by" varchar,
	"verification_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "academic_teams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" varchar NOT NULL,
	"meet_id" varchar NOT NULL,
	"competition_id" varchar NOT NULL,
	"team_name" varchar,
	"division" varchar,
	"sponsor_id" varchar,
	"sponsor_name" varchar NOT NULL,
	"registration_status" varchar DEFAULT 'registered',
	"registration_date" timestamp DEFAULT now(),
	"confirmation_date" timestamp,
	"entries_submitted" boolean DEFAULT false,
	"entry_deadline_met" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "official_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meet_id" varchar NOT NULL,
	"official_id" varchar NOT NULL,
	"competition_id" varchar NOT NULL,
	"assignment_type" varchar NOT NULL,
	"room" varchar,
	"time_slot" varchar,
	"stipend" numeric(8, 2),
	"mileage_reimbursement" numeric(8, 2),
	"status" varchar DEFAULT 'assigned',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "school_academic_programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" varchar NOT NULL,
	"district_id" varchar NOT NULL,
	"school_name" varchar NOT NULL,
	"classification" "school_classification" NOT NULL,
	"enrollment" integer,
	"coordinator_id" varchar,
	"coordinator_name" varchar NOT NULL,
	"coordinator_email" varchar NOT NULL,
	"coordinator_phone" varchar,
	"is_active" boolean DEFAULT true,
	"participating_competitions" jsonb[],
	"academic_budget" numeric(10, 2),
	"transportation_arranged" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commissioner_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"commissioner_id" varchar NOT NULL,
	"total_leagues_created" integer DEFAULT 0,
	"active_leagues" integer DEFAULT 0,
	"total_participants_managed" integer DEFAULT 0,
	"players_data_entered" integer DEFAULT 0,
	"data_accuracy_score" numeric(5, 2) DEFAULT '0',
	"last_data_update" timestamp,
	"login_streak" integer DEFAULT 0,
	"total_logins" integer DEFAULT 0,
	"average_session_time" integer DEFAULT 0,
	"helpful_votes" integer DEFAULT 0,
	"data_verifications" integer DEFAULT 0,
	"disputes_resolved" integer DEFAULT 0,
	"total_revenue" numeric(12, 2) DEFAULT '0',
	"donations_to_champions" numeric(12, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "fantasy_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"espn_id" varchar,
	"name" varchar(255) NOT NULL,
	"position" text NOT NULL,
	"team" varchar(10) NOT NULL,
	"jersey_number" integer,
	"height" varchar,
	"weight" integer,
	"age" integer,
	"experience" integer,
	"college" varchar,
	"status" text DEFAULT 'active',
	"injury_status" varchar,
	"injury_designation" text DEFAULT 'healthy',
	"current_season_stats" jsonb,
	"tendency_analysis" jsonb,
	"last_updated" timestamp DEFAULT now(),
	"verified_by" varchar,
	"data_source" text DEFAULT 'commissioner',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "fantasy_players_espn_id_unique" UNIQUE("espn_id")
);
--> statement-breakpoint
CREATE TABLE "league_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" text NOT NULL,
	"description" text NOT NULL,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "league_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" uuid NOT NULL,
	"user_id" varchar NOT NULL,
	"user_email" varchar,
	"user_name" varchar,
	"status" text DEFAULT 'pending',
	"is_commissioner" boolean DEFAULT false,
	"is_co_commissioner" boolean DEFAULT false,
	"team_name" varchar,
	"team_logo" text,
	"draft_position" integer,
	"wins" integer DEFAULT 0,
	"losses" integer DEFAULT 0,
	"ties" integer DEFAULT 0,
	"points_for" numeric(10, 2) DEFAULT '0',
	"points_against" numeric(10, 2) DEFAULT '0',
	"login_count" integer DEFAULT 0,
	"last_active" timestamp,
	"trade_count" integer DEFAULT 0,
	"waivers_claimed" integer DEFAULT 0,
	"joined_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "athletic_venues" ADD CONSTRAINT "athletic_venues_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bracket_templates" ADD CONSTRAINT "bracket_templates_tournament_structure_id_tournament_structures_id_fk" FOREIGN KEY ("tournament_structure_id") REFERENCES "public"."tournament_structures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_email_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."email_campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_event_assignments" ADD CONSTRAINT "coach_event_assignments_school_assignment_id_school_event_assignments_id_fk" FOREIGN KEY ("school_assignment_id") REFERENCES "public"."school_event_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_event_assignments" ADD CONSTRAINT "coach_event_assignments_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_event_assignments" ADD CONSTRAINT "coach_event_assignments_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_format_templates" ADD CONSTRAINT "competition_format_templates_sport_id_sport_options_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_leaderboards" ADD CONSTRAINT "competition_leaderboards_competition_id_corporate_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."corporate_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_leaderboards" ADD CONSTRAINT "competition_leaderboards_participant_id_corporate_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."corporate_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_audit_log" ADD CONSTRAINT "compliance_audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_form_responses" ADD CONSTRAINT "consent_form_responses_template_id_consent_form_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."consent_form_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_form_responses" ADD CONSTRAINT "consent_form_responses_team_registration_id_team_registrations_id_fk" FOREIGN KEY ("team_registration_id") REFERENCES "public"."team_registrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_form_responses" ADD CONSTRAINT "consent_form_responses_player_id_team_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."team_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_form_templates" ADD CONSTRAINT "consent_form_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_competitions" ADD CONSTRAINT "corporate_competitions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_participants" ADD CONSTRAINT "corporate_participants_competition_id_corporate_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."corporate_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "corporate_participants" ADD CONSTRAINT "corporate_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_processing_agreements" ADD CONSTRAINT "data_processing_agreements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_athletic_director_id_users_id_fk" FOREIGN KEY ("athletic_director_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_head_athletic_trainer_id_users_id_fk" FOREIGN KEY ("head_athletic_trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_generation_rules" ADD CONSTRAINT "division_generation_rules_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_generation_rules" ADD CONSTRAINT "division_generation_rules_template_id_division_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."division_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_matches" ADD CONSTRAINT "division_matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_matches" ADD CONSTRAINT "division_matches_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_participants" ADD CONSTRAINT "division_participants_division_id_tournament_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."tournament_divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_scheduling" ADD CONSTRAINT "division_scheduling_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_scheduling" ADD CONSTRAINT "division_scheduling_division_id_tournament_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."tournament_divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "division_templates" ADD CONSTRAINT "division_templates_sport_category_sport_categories_id_fk" FOREIGN KEY ("sport_category") REFERENCES "public"."sport_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_donors_id_fk" FOREIGN KEY ("donor_id") REFERENCES "public"."donors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educational_impact_metrics" ADD CONSTRAINT "educational_impact_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "educational_impact_metrics" ADD CONSTRAINT "educational_impact_metrics_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_assignments" ADD CONSTRAINT "event_assignments_scorekeeper_id_users_id_fk" FOREIGN KEY ("scorekeeper_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_locations" ADD CONSTRAINT "event_locations_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_results" ADD CONSTRAINT "event_results_recorded_by_users_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_schools" ADD CONSTRAINT "event_schools_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_scores" ADD CONSTRAINT "event_scores_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_scores" ADD CONSTRAINT "event_scores_assignment_id_scorekeeper_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."scorekeeper_assignments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_scores" ADD CONSTRAINT "event_scores_scored_by_id_users_id_fk" FOREIGN KEY ("scored_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_eligibility_checks" ADD CONSTRAINT "fantasy_eligibility_checks_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_lineups" ADD CONSTRAINT "fantasy_lineups_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_lineups" ADD CONSTRAINT "fantasy_lineups_participant_id_fantasy_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."fantasy_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_participants" ADD CONSTRAINT "fantasy_participants_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_picks" ADD CONSTRAINT "fantasy_picks_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_picks" ADD CONSTRAINT "fantasy_picks_participant_id_fantasy_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."fantasy_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_picks" ADD CONSTRAINT "fantasy_picks_selected_player_id_professional_players_id_fk" FOREIGN KEY ("selected_player_id") REFERENCES "public"."professional_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_length_templates" ADD CONSTRAINT "game_length_templates_sport_id_sport_options_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_data" ADD CONSTRAINT "health_data_student_id_student_data_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_data" ADD CONSTRAINT "health_data_athletic_trainer_id_users_id_fk" FOREIGN KEY ("athletic_trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jersey_team_members" ADD CONSTRAINT "jersey_team_members_team_registration_id_team_registrations_id_fk" FOREIGN KEY ("team_registration_id") REFERENCES "public"."team_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jersey_team_payments" ADD CONSTRAINT "jersey_team_payments_team_registration_id_team_registrations_id_fk" FOREIGN KEY ("team_registration_id") REFERENCES "public"."team_registrations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jersey_team_payments" ADD CONSTRAINT "jersey_team_payments_payment_plan_enrollment_id_payment_plan_enrollments_id_fk" FOREIGN KEY ("payment_plan_enrollment_id") REFERENCES "public"."payment_plan_enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_commissioner_id_users_id_fk" FOREIGN KEY ("commissioner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_score_messages" ADD CONSTRAINT "live_score_messages_live_score_id_live_scores_id_fk" FOREIGN KEY ("live_score_id") REFERENCES "public"."live_scores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_score_messages" ADD CONSTRAINT "live_score_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_score_messages" ADD CONSTRAINT "live_score_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_scores" ADD CONSTRAINT "live_scores_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_scores" ADD CONSTRAINT "live_scores_assigned_scorekeeper_id_users_id_fk" FOREIGN KEY ("assigned_scorekeeper_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_scores" ADD CONSTRAINT "live_scores_last_updated_by_users_id_fk" FOREIGN KEY ("last_updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_check_ins" ADD CONSTRAINT "location_check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_check_ins" ADD CONSTRAINT "location_check_ins_event_location_id_event_locations_id_fk" FOREIGN KEY ("event_location_id") REFERENCES "public"."event_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_check_ins" ADD CONSTRAINT "location_check_ins_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_scoring_permissions" ADD CONSTRAINT "location_scoring_permissions_scorekeeper_id_users_id_fk" FOREIGN KEY ("scorekeeper_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_scoring_permissions" ADD CONSTRAINT "location_scoring_permissions_event_location_id_event_locations_id_fk" FOREIGN KEY ("event_location_id") REFERENCES "public"."event_locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_scoring_permissions" ADD CONSTRAINT "location_scoring_permissions_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_scoring_permissions" ADD CONSTRAINT "location_scoring_permissions_permission_granted_by_users_id_fk" FOREIGN KEY ("permission_granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_recipients" ADD CONSTRAINT "message_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_usage" ADD CONSTRAINT "message_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modular_pages" ADD CONSTRAINT "modular_pages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nonprofit_invoices" ADD CONSTRAINT "nonprofit_invoices_subscription_id_nonprofit_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."nonprofit_subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nonprofit_subscriptions" ADD CONSTRAINT "nonprofit_subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nonprofit_subscriptions" ADD CONSTRAINT "nonprofit_subscriptions_billing_contact_user_id_users_id_fk" FOREIGN KEY ("billing_contact_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nonprofit_subscriptions" ADD CONSTRAINT "nonprofit_subscriptions_exemption_document_id_tax_exemption_documents_id_fk" FOREIGN KEY ("exemption_document_id") REFERENCES "public"."tax_exemption_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizer_contacts" ADD CONSTRAINT "organizer_contacts_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizer_contacts" ADD CONSTRAINT "organizer_contacts_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizer_metrics" ADD CONSTRAINT "organizer_metrics_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizer_page_views" ADD CONSTRAINT "organizer_page_views_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizer_page_views" ADD CONSTRAINT "organizer_page_views_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participant_events" ADD CONSTRAINT "participant_events_tournament_event_id_tournament_events_id_fk" FOREIGN KEY ("tournament_event_id") REFERENCES "public"."tournament_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_enrollments" ADD CONSTRAINT "payment_plan_enrollments_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_installments" ADD CONSTRAINT "payment_plan_installments_enrollment_id_payment_plan_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."payment_plan_enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_competition_id_corporate_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."corporate_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_participant_id_corporate_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."corporate_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_assignments" ADD CONSTRAINT "permission_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_assignments" ADD CONSTRAINT "permission_assignments_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_performances" ADD CONSTRAINT "player_performances_player_id_professional_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."professional_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_form_fields" ADD CONSTRAINT "registration_form_fields_page_id_modular_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."modular_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_responses" ADD CONSTRAINT "registration_responses_page_id_modular_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."modular_pages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registration_responses" ADD CONSTRAINT "registration_responses_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_assets" ADD CONSTRAINT "school_assets_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_assets" ADD CONSTRAINT "school_assets_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_event_assignments" ADD CONSTRAINT "school_event_assignments_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_event_assignments" ADD CONSTRAINT "school_event_assignments_school_id_tournament_organizations_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."tournament_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_event_assignments" ADD CONSTRAINT "school_event_assignments_assigned_by_id_users_id_fk" FOREIGN KEY ("assigned_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_event_assignments" ADD CONSTRAINT "school_event_assignments_school_athletic_director_id_users_id_fk" FOREIGN KEY ("school_athletic_director_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_principal_id_users_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_athletic_director_id_users_id_fk" FOREIGN KEY ("athletic_director_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_athletic_trainer_id_users_id_fk" FOREIGN KEY ("athletic_trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_update_log" ADD CONSTRAINT "score_update_log_live_score_id_live_scores_id_fk" FOREIGN KEY ("live_score_id") REFERENCES "public"."live_scores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "score_update_log" ADD CONSTRAINT "score_update_log_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scorekeeper_assignments" ADD CONSTRAINT "scorekeeper_assignments_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scorekeeper_assignments" ADD CONSTRAINT "scorekeeper_assignments_scorekeeper_id_users_id_fk" FOREIGN KEY ("scorekeeper_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scorekeeper_assignments" ADD CONSTRAINT "scorekeeper_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scoring_automations" ADD CONSTRAINT "scoring_automations_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series_templates" ADD CONSTRAINT "series_templates_sport_id_sport_options_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_division_rules" ADD CONSTRAINT "sport_division_rules_sport_id_sport_options_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_events" ADD CONSTRAINT "sport_events_sport_id_sport_options_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_team_ai_consultations" ADD CONSTRAINT "support_team_ai_consultations_athletic_trainer_id_users_id_fk" FOREIGN KEY ("athletic_trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_team_ai_consultations" ADD CONSTRAINT "support_team_ai_consultations_member_id_support_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."support_team_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_team_ai_consultations" ADD CONSTRAINT "support_team_ai_consultations_support_team_id_support_teams_id_fk" FOREIGN KEY ("support_team_id") REFERENCES "public"."support_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_team_injuries" ADD CONSTRAINT "support_team_injuries_member_id_support_team_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."support_team_members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_team_injuries" ADD CONSTRAINT "support_team_injuries_athletic_trainer_id_users_id_fk" FOREIGN KEY ("athletic_trainer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_team_members" ADD CONSTRAINT "support_team_members_support_team_id_support_teams_id_fk" FOREIGN KEY ("support_team_id") REFERENCES "public"."support_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_team_members" ADD CONSTRAINT "support_team_members_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_teams" ADD CONSTRAINT "support_teams_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_teams" ADD CONSTRAINT "support_teams_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_teams" ADD CONSTRAINT "support_teams_assistant_coach_id_users_id_fk" FOREIGN KEY ("assistant_coach_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_exemption_documents" ADD CONSTRAINT "tax_exemption_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_exemption_documents" ADD CONSTRAINT "tax_exemption_documents_uploader_user_id_users_id_fk" FOREIGN KEY ("uploader_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_exemption_documents" ADD CONSTRAINT "tax_exemption_documents_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_documents" ADD CONSTRAINT "team_documents_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_documents" ADD CONSTRAINT "team_documents_player_id_team_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."team_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_documents" ADD CONSTRAINT "team_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_documents" ADD CONSTRAINT "team_documents_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_players" ADD CONSTRAINT "team_players_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_registrations" ADD CONSTRAINT "team_registrations_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_registrations" ADD CONSTRAINT "team_registrations_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_registrations" ADD CONSTRAINT "team_registrations_payment_plan_id_payment_plans_id_fk" FOREIGN KEY ("payment_plan_id") REFERENCES "public"."payment_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_coach_id_users_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_credits" ADD CONSTRAINT "tournament_credits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_divisions" ADD CONSTRAINT "tournament_divisions_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_events" ADD CONSTRAINT "tournament_events_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_events" ADD CONSTRAINT "tournament_events_sport_event_id_sport_events_id_fk" FOREIGN KEY ("sport_event_id") REFERENCES "public"."sport_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_events" ADD CONSTRAINT "tournament_events_results_recorder_id_users_id_fk" FOREIGN KEY ("results_recorder_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_format_configs" ADD CONSTRAINT "tournament_format_configs_tournament_structure_id_tournament_structures_id_fk" FOREIGN KEY ("tournament_structure_id") REFERENCES "public"."tournament_structures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_format_configs" ADD CONSTRAINT "tournament_format_configs_sport_category_sport_categories_id_fk" FOREIGN KEY ("sport_category") REFERENCES "public"."sport_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_generation_log" ADD CONSTRAINT "tournament_generation_log_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_whitelabel_config_id_whitelabel_configs_id_fk" FOREIGN KEY ("whitelabel_config_id") REFERENCES "public"."whitelabel_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "track_event_timing" ADD CONSTRAINT "track_event_timing_track_event_id_track_events_id_fk" FOREIGN KEY ("track_event_id") REFERENCES "public"."track_events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_analytics" ADD CONSTRAINT "usage_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_organization_roles" ADD CONSTRAINT "user_organization_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whitelabel_configs" ADD CONSTRAINT "whitelabel_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_meets" ADD CONSTRAINT "academic_meets_district_id_academic_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."academic_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_participants" ADD CONSTRAINT "academic_participants_team_id_academic_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."academic_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_participants" ADD CONSTRAINT "academic_participants_competition_id_academic_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."academic_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_results" ADD CONSTRAINT "academic_results_meet_id_academic_meets_id_fk" FOREIGN KEY ("meet_id") REFERENCES "public"."academic_meets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_results" ADD CONSTRAINT "academic_results_competition_id_academic_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."academic_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_results" ADD CONSTRAINT "academic_results_participant_id_academic_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."academic_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_results" ADD CONSTRAINT "academic_results_team_id_academic_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."academic_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_teams" ADD CONSTRAINT "academic_teams_school_id_school_academic_programs_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."school_academic_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_teams" ADD CONSTRAINT "academic_teams_meet_id_academic_meets_id_fk" FOREIGN KEY ("meet_id") REFERENCES "public"."academic_meets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_teams" ADD CONSTRAINT "academic_teams_competition_id_academic_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."academic_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_assignments" ADD CONSTRAINT "official_assignments_meet_id_academic_meets_id_fk" FOREIGN KEY ("meet_id") REFERENCES "public"."academic_meets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_assignments" ADD CONSTRAINT "official_assignments_official_id_academic_officials_id_fk" FOREIGN KEY ("official_id") REFERENCES "public"."academic_officials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_assignments" ADD CONSTRAINT "official_assignments_competition_id_academic_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."academic_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_academic_programs" ADD CONSTRAINT "school_academic_programs_district_id_academic_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."academic_districts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_activities" ADD CONSTRAINT "league_activities_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_participants" ADD CONSTRAINT "league_participants_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");