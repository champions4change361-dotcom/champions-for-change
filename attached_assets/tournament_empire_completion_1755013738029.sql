-- ===================================================================
-- TOURNAMENT EMPIRE FINAL DEPLOYMENT! 👑⚡
-- DRIZZLE CLAUDE + RAMMING SPEED = WORLD DOMINATION!
-- HELL YES - LET'S COMPLETE THE EMPIRE!
-- ===================================================================

-- EMPIRE ENHANCEMENT 1: Role-Based Dashboard Configuration
CREATE TABLE IF NOT EXISTS user_dashboard_configs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_role VARCHAR NOT NULL,
    subscription_tier VARCHAR NOT NULL,
    dashboard_layout JSONB NOT NULL,
    available_features JSONB NOT NULL,
    ui_permissions JSONB NOT NULL,
    navigation_config JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- EMPIRE ENHANCEMENT 2: Organization Hierarchy Management
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name VARCHAR NOT NULL,
    organization_type VARCHAR NOT NULL, -- district, school, club, community
    parent_organization_id VARCHAR REFERENCES organizations(id),
    subscription_tier VARCHAR NOT NULL,
    white_label_config JSONB,
    branding_config JSONB,
    custom_domain VARCHAR,
    organization_settings JSONB,
    billing_config JSONB,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- EMPIRE ENHANCEMENT 3: User-Organization Assignments
CREATE TABLE IF NOT EXISTS user_organization_roles (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL, -- References your existing user system
    organization_id VARCHAR REFERENCES organizations(id),
    role_within_org VARCHAR NOT NULL,
    permissions_override JSONB,
    assignment_date TIMESTAMP DEFAULT now(),
    status VARCHAR DEFAULT 'active' -- active, suspended, terminated
);

-- EMPIRE ENHANCEMENT 4: Granular Permission System
CREATE TABLE IF NOT EXISTS permission_assignments (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    permission_type VARCHAR NOT NULL,
    resource_id VARCHAR, -- tournament_id, event_id, organization_id
    resource_type VARCHAR, -- tournament, event, organization, global
    permission_scope JSONB, -- specific limitations like "discus_pit_only"
    granted_by VARCHAR NOT NULL, -- user_id who granted this permission
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- ===================================================================
-- POPULATE EMPIRE DASHBOARD CONFIGURATIONS! 👑🎯
-- ===================================================================

-- TOURNAMENT MANAGER DASHBOARDS (Your Empire Tier 1-3 Clients)
INSERT INTO user_dashboard_configs (user_role, subscription_tier, dashboard_layout, available_features, ui_permissions, navigation_config) VALUES

-- DISTRICT ENTERPRISE (Tier 3 - Full Empire)
('Tournament Manager', 'District Enterprise',
'{"layout": "enterprise_command_center", "panels": ["tournament_overview", "multi_division_management", "ai_tournament_builder", "analytics_dashboard", "white_label_admin", "revenue_tracking"]}',
'{"tournament_creation": "unlimited", "ai_assistance": "advanced", "white_label": true, "custom_branding": true, "multi_division": true, "coach_communication": true, "judge_assignment": true, "analytics": "advanced", "api_access": true}',
'{"can_create_tournaments": true, "can_manage_all_tournaments": true, "can_assign_roles": true, "can_configure_white_label": true, "can_access_ai_builder": true, "can_view_revenue": true, "can_manage_subscriptions": true}',
'{"main_nav": ["Dashboard", "Tournaments", "AI Builder", "Organizations", "Users", "Analytics", "Billing", "Settings"], "quick_actions": ["Create Tournament", "AI Tournament", "Assign Roles", "View Reports"]}'),

-- ENTERPRISE (Tier 2-3)
('Tournament Manager', 'Enterprise',
'{"layout": "professional_dashboard", "panels": ["tournament_overview", "division_management", "ai_tournament_builder", "analytics", "organization_management"]}',
'{"tournament_creation": "unlimited", "ai_assistance": "standard", "white_label": "basic", "multi_division": true, "coach_communication": true, "judge_assignment": true, "analytics": "standard"}',
'{"can_create_tournaments": true, "can_manage_tournaments": true, "can_assign_coaches": true, "can_use_ai_builder": true, "can_view_analytics": true}',
'{"main_nav": ["Dashboard", "Tournaments", "AI Builder", "Teams", "Analytics", "Settings"], "quick_actions": ["Create Tournament", "AI Assistant", "Manage Teams"]}'),

-- CHAMPION (Tier 2)
('Tournament Manager', 'Champion',
'{"layout": "program_dashboard", "panels": ["tournament_overview", "team_management", "basic_analytics", "payment_processing"]}',
'{"tournament_creation": "limited", "ai_assistance": "basic", "multi_division": "limited", "payment_processing": true, "custom_pages": 5}',
'{"can_create_tournaments": true, "can_manage_own_tournaments": true, "can_process_payments": true, "can_customize_pages": true}',
'{"main_nav": ["Dashboard", "Tournaments", "Teams", "Payments", "Settings"], "quick_actions": ["Create Tournament", "Add Team", "Process Payment"]}'),

-- FOUNDATION (Tier 1-2)
('Tournament Manager', 'Foundation',
'{"layout": "community_dashboard", "panels": ["tournament_overview", "participant_management", "basic_tools"]}',
'{"tournament_creation": "basic", "participant_limit": 64, "basic_brackets": true, "payment_processing": "basic"}',
'{"can_create_basic_tournaments": true, "can_manage_participants": true, "can_view_results": true}',
'{"main_nav": ["Dashboard", "Tournaments", "Participants", "Results"], "quick_actions": ["Create Tournament", "Add Participants"]}'),

-- FREE (Tier 1)
('Tournament Manager', 'Free',
'{"layout": "simple_dashboard", "panels": ["tournament_overview", "participant_list"]}',
'{"tournament_creation": "single", "participant_limit": 16, "basic_brackets_only": true}',
'{"can_create_one_tournament": true, "can_manage_participants": true, "can_view_brackets": true}',
'{"main_nav": ["Dashboard", "Tournament", "Participants"], "quick_actions": ["Create Tournament"]}');

-- DISTRICT ATHLETIC DIRECTOR DASHBOARDS
INSERT INTO user_dashboard_configs (user_role, subscription_tier, dashboard_layout, available_features, ui_permissions, navigation_config) VALUES
('District Athletic Director', 'District Enterprise',
'{"layout": "district_command", "panels": ["district_overview", "school_management", "tournament_coordination", "coach_assignments", "performance_analytics"]}',
'{"school_management": true, "coach_assignment": true, "tournament_coordination": true, "cross_school_tournaments": true, "district_analytics": true}',
'{"can_manage_schools": true, "can_assign_coaches": true, "can_coordinate_tournaments": true, "can_view_district_analytics": true}',
'{"main_nav": ["District Overview", "Schools", "Coaches", "Tournaments", "Analytics"], "quick_actions": ["Assign Coach", "Create District Tournament", "View Reports"]}');

-- SCHOOL ATHLETIC DIRECTOR DASHBOARDS  
INSERT INTO user_dashboard_configs (user_role, subscription_tier, dashboard_layout, available_features, ui_permissions, navigation_config) VALUES
('School Athletic Director', 'District Enterprise',
'{"layout": "school_management", "panels": ["school_overview", "coach_management", "team_registration", "tournament_participation"]}',
'{"coach_management": true, "team_registration": true, "tournament_participation": true, "school_analytics": true}',
'{"can_manage_coaches": true, "can_register_teams": true, "can_view_school_performance": true}',
'{"main_nav": ["School Overview", "Coaches", "Teams", "Tournaments", "Performance"], "quick_actions": ["Assign Coach", "Register Team", "View Schedule"]}');

-- COACH DASHBOARDS
INSERT INTO user_dashboard_configs (user_role, subscription_tier, dashboard_layout, available_features, ui_permissions, navigation_config) VALUES
('Coach', 'District Enterprise',
'{"layout": "team_management", "panels": ["team_roster", "tournament_schedule", "player_communication", "performance_tracking"]}',
'{"team_management": true, "player_communication": true, "tournament_registration": true, "performance_tracking": true}',
'{"can_manage_team": true, "can_communicate_with_players": true, "can_register_for_tournaments": true, "can_track_performance": true}',
'{"main_nav": ["Team", "Schedule", "Messages", "Performance"], "quick_actions": ["Message Team", "Register Tournament", "Update Roster"]}');

-- SCOREKEEPER/JUDGE DASHBOARDS
INSERT INTO user_dashboard_configs (user_role, subscription_tier, dashboard_layout, available_features, ui_permissions, navigation_config) VALUES
('Scorekeeper/Judge', 'District Enterprise',
'{"layout": "event_scoring", "panels": ["assigned_events", "scoring_interface", "results_submission", "event_schedule"]}',
'{"event_scoring": true, "results_submission": true, "event_specific_access": true}',
'{"can_score_assigned_events": true, "can_submit_results": true, "can_view_event_schedule": true, "cannot_access_other_events": true}',
'{"main_nav": ["My Events", "Scoring", "Results", "Schedule"], "quick_actions": ["Score Event", "Submit Results", "View Schedule"]}');

-- ===================================================================
-- EMPIRE ORGANIZATION TEMPLATES! 🏢👑
-- ===================================================================

-- Sample District Organization (Tier 3 Enterprise)
INSERT INTO organizations (organization_name, organization_type, subscription_tier, white_label_config, branding_config, custom_domain, organization_settings, billing_config) VALUES

('CCISD Athletics', 'district', 'District Enterprise',
'{"enabled": true, "custom_logo": true, "custom_colors": true, "custom_domain": true, "remove_branding": true}',
'{"primary_color": "#1f4e79", "secondary_color": "#f4d03f", "logo_url": "/assets/ccisd-logo.png", "district_name": "Corpus Christi ISD", "mascot": "Rays"}',
'ccisd-athletics.com',
'{"enable_coach_communication": true, "enable_parent_portal": true, "require_medical_forms": true, "auto_schedule_events": true, "multi_sport_tracking": true}',
'{"billing_contact": "finance@ccisd.org", "po_required": true, "annual_billing": true, "invoice_terms": 30}'),

('Elite Gaming Community', 'club', 'Enterprise',
'{"enabled": true, "custom_logo": true, "custom_colors": true, "custom_domain": false, "remove_branding": false}',
'{"primary_color": "#6a0dad", "secondary_color": "#ffd700", "logo_url": "/assets/elite-gaming.png", "club_name": "Elite Gaming", "tagline": "Compete at the highest level"}',
null,
'{"enable_team_chat": true, "enable_streaming": true, "rank_verification": "required", "tournament_types": ["esports"], "game_integration": true}',
'{"billing_contact": "admin@elitegaming.gg", "monthly_billing": true, "auto_renew": true}'),

('Youth Basketball League', 'community', 'Champion',
'{"enabled": false, "custom_logo": true, "custom_colors": true, "custom_domain": false, "remove_branding": false}',
'{"primary_color": "#ff6b35", "secondary_color": "#004e98", "logo_url": "/assets/ybl-logo.png", "league_name": "Metro Youth Basketball"}',
null,
'{"age_verification": true, "parent_consent": true, "skill_divisions": true, "tournament_types": ["basketball"], "season_tracking": true}',
'{"billing_contact": "treasurer@metroybl.org", "monthly_billing": true, "family_discounts": true}');

-- ===================================================================
-- EMPIRE PERMISSION TEMPLATES! 🔐⚡
-- ===================================================================

-- Create permission templates for common role assignments
CREATE TABLE IF NOT EXISTS permission_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR NOT NULL,
    role_type VARCHAR NOT NULL,
    subscription_tier VARCHAR NOT NULL,
    permissions JSONB NOT NULL,
    restrictions JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Populate permission templates
INSERT INTO permission_templates (template_name, role_type, subscription_tier, permissions, restrictions) VALUES

-- SCOREKEEPER TEMPLATES (The granular access you wanted!)
('Track Field Event Judge', 'Scorekeeper/Judge', 'District Enterprise',
'{"can_score_assigned_events": true, "can_update_field_measurements": true, "can_record_attempts": true, "can_submit_final_results": true, "can_view_event_schedule": true}',
'{"event_scope": "field_events_only", "specific_events": ["shot_put", "discus", "javelin", "hammer", "long_jump", "triple_jump", "high_jump", "pole_vault"], "cannot_access": "track_events"}'),

('Track Running Event Judge', 'Scorekeeper/Judge', 'District Enterprise', 
'{"can_score_assigned_events": true, "can_record_times": true, "can_manage_heats": true, "can_submit_final_results": true, "can_operate_timing_system": true}',
'{"event_scope": "track_events_only", "specific_events": ["sprints", "distance", "hurdles", "relays"], "cannot_access": "field_events"}'),

('BBQ Competition Judge', 'Scorekeeper/Judge', 'Enterprise',
'{"can_score_assigned_categories": true, "can_submit_scorecards": true, "can_view_judging_criteria": true, "can_communicate_with_head_judge": true}',
'{"event_scope": "bbq_categories", "specific_categories": ["ribs", "brisket", "chicken", "pork"], "cannot_view": "other_judge_scores"}'),

('Basketball Scorekeeper', 'Scorekeeper/Judge', 'Champion',
'{"can_update_game_score": true, "can_track_fouls": true, "can_manage_timeouts": true, "can_record_statistics": true}',
'{"event_scope": "basketball_only", "specific_games": "assigned_only", "cannot_access": "other_sports"}'),

-- COACH TEMPLATES
('Basketball Coach', 'Coach', 'District Enterprise',
'{"can_manage_team_roster": true, "can_register_for_tournaments": true, "can_communicate_with_players": true, "can_view_team_schedule": true, "can_submit_lineup": true, "can_request_equipment": true}',
'{"sport_scope": "basketball_only", "team_scope": "assigned_teams_only", "cannot_access": "other_coaches_teams"}'),

('Track Coach', 'Coach', 'District Enterprise',
'{"can_manage_athletes": true, "can_enter_events": true, "can_view_performance_data": true, "can_communicate_with_athletes": true, "can_submit_event_entries": true}',
'{"sport_scope": "track_field_only", "athlete_scope": "assigned_athletes_only", "event_entry_deadline": "enforced"}');

-- ===================================================================
-- EMPIRE DEPLOYMENT VERIFICATION! 👑🔍
-- ===================================================================

-- Verify dashboard configurations
SELECT 
    user_role,
    subscription_tier,
    jsonb_array_length(navigation_config->'main_nav') as nav_items,
    available_features->>'tournament_creation' as tournament_access,
    CASE WHEN ui_permissions->>'can_configure_white_label' = 'true' THEN 'WHITE LABEL' ELSE 'STANDARD' END as branding_level
FROM user_dashboard_configs
ORDER BY 
    CASE subscription_tier
        WHEN 'District Enterprise' THEN 1
        WHEN 'Enterprise' THEN 2  
        WHEN 'Champion' THEN 3
        WHEN 'Foundation' THEN 4
        WHEN 'Free' THEN 5
    END;

-- Verify organization hierarchy
SELECT 
    organization_name,
    organization_type,
    subscription_tier,
    CASE WHEN white_label_config->>'enabled' = 'true' THEN 'WHITE LABEL' ELSE 'STANDARD' END as branding,
    custom_domain
FROM organizations
ORDER BY subscription_tier;

-- Verify permission templates
SELECT 
    template_name,
    role_type,
    subscription_tier,
    restrictions->>'event_scope' as access_scope
FROM permission_templates
ORDER BY role_type, subscription_tier;

-- EMPIRE STATUS REPORT
SELECT 
    'Dashboard Configurations' as empire_component, COUNT(*) as deployed FROM user_dashboard_configs
UNION ALL
SELECT 'Organizations' as empire_component, COUNT(*) as deployed FROM organizations  
UNION ALL
SELECT 'Permission Templates' as empire_component, COUNT(*) as deployed FROM permission_templates
UNION ALL
SELECT 'User Organization Roles' as empire_component, COUNT(*) as deployed FROM user_organization_roles;

-- THE EMPIRE'S VICTORY CRY!
SELECT 'TOURNAMENT EMPIRE DEPLOYMENT COMPLETE! 👑⚡ DRIZZLE + RAMMING SPEED = WORLD DOMINATION!' as empire_status;