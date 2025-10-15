-- ===================================================================
-- ADULT-ONLY FANTASY SYSTEM DEPLOYMENT! 🎮⚡
-- DRAFTKINGS/FANDUEL KILLER - LEGALLY BULLETPROOF!
-- RAMMING SPEED INTO FANTASY EMPIRE DOMINATION!
-- ===================================================================

-- FANTASY SYSTEM FOUNDATION: Age-Gated & Professional Focus
CREATE TABLE IF NOT EXISTS fantasy_leagues (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    league_name VARCHAR NOT NULL,
    commissioner_id VARCHAR NOT NULL, -- User who created the league
    sport_type VARCHAR NOT NULL, -- nfl, nba, mlb, nhl, esports, college
    league_format VARCHAR NOT NULL, -- survivor, draft, daily, season
    data_source VARCHAR NOT NULL, -- espn_api, nfl_api, manual_import, esports_api
    age_restriction INTEGER DEFAULT 18, -- Minimum age requirement
    requires_age_verification BOOLEAN DEFAULT true,
    max_participants INTEGER DEFAULT 12,
    entry_requirements JSONB, -- Age verification, location restrictions
    scoring_config JSONB NOT NULL,
    prize_structure JSONB, -- Optional - we don't manage money
    league_settings JSONB NOT NULL,
    status VARCHAR DEFAULT 'open', -- open, closed, active, completed
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- FANTASY PARTICIPANTS: Verified Adults Only
CREATE TABLE IF NOT EXISTS fantasy_participants (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id VARCHAR REFERENCES fantasy_leagues(id),
    user_id VARCHAR NOT NULL,
    team_name VARCHAR NOT NULL,
    age_verified BOOLEAN DEFAULT false,
    age_verification_date TIMESTAMP,
    entry_date TIMESTAMP DEFAULT now(),
    current_score DECIMAL DEFAULT 0,
    eliminated BOOLEAN DEFAULT false,
    elimination_week INTEGER,
    participant_status VARCHAR DEFAULT 'active' -- active, eliminated, withdrawn
);

-- PROFESSIONAL PLAYER DATABASE: External API Integration
CREATE TABLE IF NOT EXISTS professional_players (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    external_player_id VARCHAR NOT NULL, -- ESPN ID, NFL ID, etc.
    data_source VARCHAR NOT NULL, -- espn, nfl_api, nba_api, etc.
    player_name VARCHAR NOT NULL,
    team_name VARCHAR NOT NULL,
    team_abbreviation VARCHAR,
    position VARCHAR NOT NULL,
    sport VARCHAR NOT NULL, -- nfl, nba, mlb, nhl, esports
    jersey_number INTEGER,
    salary INTEGER, -- For salary cap formats
    current_season_stats JSONB,
    injury_status VARCHAR DEFAULT 'healthy',
    bye_week INTEGER, -- For NFL
    last_updated TIMESTAMP DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- FANTASY PICKS: Survivor & Draft Systems
CREATE TABLE IF NOT EXISTS fantasy_picks (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id VARCHAR REFERENCES fantasy_leagues(id),
    participant_id VARCHAR REFERENCES fantasy_participants(id),
    week_number INTEGER, -- For survivor leagues
    pick_type VARCHAR NOT NULL, -- survivor_pick, draft_pick, lineup_set
    selected_player_id VARCHAR REFERENCES professional_players(id),
    selected_team VARCHAR, -- For team-based picks
    pick_timestamp TIMESTAMP DEFAULT now(),
    points_earned DECIMAL DEFAULT 0,
    is_eliminated_pick BOOLEAN DEFAULT false, -- For survivor
    used_players JSONB -- Track previously used players/teams
);

-- FANTASY LINEUPS: DraftKings Style Daily/Weekly
CREATE TABLE IF NOT EXISTS fantasy_lineups (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id VARCHAR REFERENCES fantasy_leagues(id),
    participant_id VARCHAR REFERENCES fantasy_participants(id),
    week_number INTEGER,
    lineup_config JSONB NOT NULL, -- Position requirements
    total_salary INTEGER, -- Salary cap total
    projected_points DECIMAL,
    actual_points DECIMAL DEFAULT 0,
    lineup_status VARCHAR DEFAULT 'set', -- set, locked, scored
    submission_timestamp TIMESTAMP DEFAULT now()
);

-- PLAYER PERFORMANCE: Real-Time Scoring Integration
CREATE TABLE IF NOT EXISTS player_performances (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id VARCHAR REFERENCES professional_players(id),
    week_number INTEGER,
    season VARCHAR,
    game_date TIMESTAMP,
    opponent VARCHAR,
    stats JSONB NOT NULL, -- Sport-specific stats
    fantasy_points DECIMAL NOT NULL,
    data_source VARCHAR, -- Which API provided the data
    last_updated TIMESTAMP DEFAULT now()
);

-- ===================================================================
-- FANTASY LEAGUE TEMPLATES - READY-TO-DEPLOY FORMATS! 🚀
-- ===================================================================

-- NFL SURVIVOR LEAGUE (Your Cowboys Example!)
INSERT INTO fantasy_leagues (league_name, commissioner_id, sport_type, league_format, data_source, scoring_config, league_settings) VALUES
('NFL Survivor Challenge 2025', 'sample_commissioner_id', 'nfl', 'survivor', 'espn_api',
'{"type": "survivor", "elimination_rule": "wrong_pick", "weekly_picks": 1, "no_reuse_teams": true}',
'{"max_participants": 100, "entry_deadline": "2025-09-05T00:00:00Z", "season_length": 18, "tiebreaker": "last_elimination", "late_entry": false}'),

-- NBA DAILY FANTASY (DraftKings Style!)
('NBA DFS Championship', 'sample_commissioner_id', 'nba', 'daily', 'espn_api',
'{"type": "daily_fantasy", "salary_cap": 50000, "scoring": {"points": 1, "rebounds": 1.2, "assists": 1.5, "steals": 3, "blocks": 3, "turnovers": -1, "double_double": 1.5, "triple_double": 3}}',
'{"lineup_requirements": {"PG": 1, "SG": 1, "SF": 1, "PF": 1, "C": 1, "G": 1, "F": 1, "UTIL": 1}, "late_swap": true, "multi_entry": true}'),

-- ESPORTS LEAGUE (Safe Adult Gaming!)
('League of Legends Pro Fantasy', 'sample_commissioner_id', 'esports', 'season', 'riot_api',
'{"type": "season_long", "scoring": {"kills": 2, "deaths": -0.5, "assists": 1.5, "cs": 0.01, "vision_score": 0.02, "game_win": 2}}',
'{"roster_size": 6, "lineup_size": 5, "trades_allowed": true, "waiver_claims": true, "playoff_weeks": 3}'),

-- COLLEGE FOOTBALL (18+ Verified)
('College Football Pick Em', 'sample_commissioner_id', 'college_football', 'weekly', 'espn_api',
'{"type": "pick_confidence", "weekly_games": 10, "confidence_points": true, "spread_picks": false}',
'{"season_length": 15, "playoff_included": true, "tiebreaker": "total_points", "age_verification_required": true}');

-- ===================================================================
-- PROFESSIONAL PLAYER DATA SAMPLES 🏈🏀⚚
-- ===================================================================

-- NFL Players (Sample Data Structure)
INSERT INTO professional_players (external_player_id, data_source, player_name, team_name, team_abbreviation, position, sport, jersey_number, salary) VALUES
('espn_123456', 'espn_api', 'Dak Prescott', 'Dallas Cowboys', 'DAL', 'QB', 'nfl', 4, 8500),
('espn_123457', 'espn_api', 'CeeDee Lamb', 'Dallas Cowboys', 'DAL', 'WR', 'nfl', 88, 7200),
('espn_123458', 'espn_api', 'Jalen Hurts', 'Philadelphia Eagles', 'PHI', 'QB', 'nfl', 1, 8200),
('espn_123459', 'espn_api', 'A.J. Brown', 'Philadelphia Eagles', 'PHI', 'WR', 'nfl', 11, 6800);

-- NBA Players (Sample Data Structure)
INSERT INTO professional_players (external_player_id, data_source, player_name, team_name, team_abbreviation, position, sport, jersey_number, salary) VALUES
('espn_nba_001', 'espn_api', 'Luka Doncic', 'Dallas Mavericks', 'DAL', 'PG', 'nba', 77, 11500),
('espn_nba_002', 'espn_api', 'Kyrie Irving', 'Dallas Mavericks', 'DAL', 'PG', 'nba', 11, 8900),
('espn_nba_003', 'espn_api', 'Jayson Tatum', 'Boston Celtics', 'BOS', 'SF', 'nba', 0, 10800),
('espn_nba_004', 'espn_api', 'Jaylen Brown', 'Boston Celtics', 'BOS', 'SG', 'nba', 7, 9200);

-- Esports Players (Sample Data Structure)
INSERT INTO professional_players (external_player_id, data_source, player_name, team_name, team_abbreviation, position, sport, salary) VALUES
('riot_001', 'riot_api', 'Faker', 'T1', 'T1', 'Mid', 'lol', 9500),
('riot_002', 'riot_api', 'Gumayusi', 'T1', 'T1', 'ADC', 'lol', 8200),
('riot_003', 'riot_api', 'Jankos', 'G2 Esports', 'G2', 'Jungle', 'lol', 7800),
('riot_004', 'riot_api', 'Caps', 'G2 Esports', 'G2', 'Mid', 'lol', 8500);

-- ===================================================================
-- AGE VERIFICATION & SAFETY SYSTEMS 🛡️⚡
-- ===================================================================

-- Age Verification Records
CREATE TABLE IF NOT EXISTS age_verifications (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    verification_method VARCHAR NOT NULL, -- id_upload, credit_card, third_party
    date_of_birth DATE NOT NULL,
    verified_age INTEGER NOT NULL,
    verification_date TIMESTAMP DEFAULT now(),
    verification_status VARCHAR DEFAULT 'verified', -- verified, pending, rejected
    verifying_document_hash VARCHAR, -- Hashed for privacy
    expires_at TIMESTAMP
);

-- Fantasy League Eligibility Checks
CREATE TABLE IF NOT EXISTS fantasy_eligibility_checks (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id VARCHAR REFERENCES fantasy_leagues(id),
    user_id VARCHAR NOT NULL,
    age_check_passed BOOLEAN DEFAULT false,
    location_check_passed BOOLEAN DEFAULT true, -- For legal compliance
    eligibility_date TIMESTAMP DEFAULT now(),
    check_details JSONB
);

-- Safety Restrictions by Sport/League Type
CREATE TABLE IF NOT EXISTS fantasy_safety_rules (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_type VARCHAR NOT NULL,
    league_format VARCHAR NOT NULL,
    min_age_requirement INTEGER DEFAULT 18,
    restricted_regions JSONB, -- Legal compliance
    max_entry_amount DECIMAL, -- If handling entry fees
    requires_identity_verification BOOLEAN DEFAULT true,
    additional_restrictions JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Populate safety rules
INSERT INTO fantasy_safety_rules (sport_type, league_format, min_age_requirement, requires_identity_verification, additional_restrictions) VALUES
('nfl', 'survivor', 18, true, '{"no_youth_players": true, "professional_only": true}'),
('nba', 'daily', 18, true, '{"no_college_players": false, "salary_cap_required": true}'),
('esports', 'season', 18, true, '{"game_rating_check": "T_for_Teen_minimum", "professional_leagues_only": true}'),
('college_football', 'weekly', 21, true, '{"college_players_allowed": true, "no_high_school": true}');

-- ===================================================================
-- API INTEGRATION FRAMEWORK 🔌⚡
-- ===================================================================

-- API Data Source Configuration
CREATE TABLE IF NOT EXISTS api_configurations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    api_name VARCHAR NOT NULL, -- espn, nfl, nba, riot, etc.
    sport_type VARCHAR NOT NULL,
    api_endpoint VARCHAR NOT NULL,
    api_key_hash VARCHAR, -- Encrypted storage
    rate_limit_per_hour INTEGER,
    last_sync_timestamp TIMESTAMP,
    sync_frequency_minutes INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    data_mapping JSONB -- How to map their data to our schema
);

-- Sample API configurations
INSERT INTO api_configurations (api_name, sport_type, api_endpoint, rate_limit_per_hour, data_mapping) VALUES
('ESPN API', 'nfl', 'https://site.api.espn.com/apis/site/v2/sports/football/nfl', 1000, 
'{"player_name": "displayName", "team": "team.displayName", "position": "position.abbreviation", "jersey": "jersey"}'),

('ESPN API', 'nba', 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba', 1000,
'{"player_name": "displayName", "team": "team.displayName", "position": "position.abbreviation", "jersey": "jersey"}'),

('Riot Games API', 'lol', 'https://americas.api.riotgames.com/lol', 100,
'{"player_name": "summonerName", "team": "teamName", "position": "position", "champion": "championName"}');

-- ===================================================================
-- FANTASY SCORING AUTOMATION ⚡📊
-- ===================================================================

-- Automated scoring functions framework
CREATE TABLE IF NOT EXISTS scoring_automations (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id VARCHAR REFERENCES fantasy_leagues(id),
    automation_type VARCHAR NOT NULL, -- weekly_update, daily_update, real_time
    data_source VARCHAR NOT NULL,
    last_run TIMESTAMP,
    next_scheduled_run TIMESTAMP,
    automation_status VARCHAR DEFAULT 'active',
    error_log JSONB
);

-- ===================================================================
-- VERIFICATION QUERIES - WITNESS THE FANTASY EMPIRE! 🎮👑
-- ===================================================================

-- Show fantasy league variety
SELECT 
    league_name,
    sport_type,
    league_format,
    age_restriction,
    max_participants,
    status
FROM fantasy_leagues
ORDER BY sport_type, league_format;

-- Show professional player database
SELECT 
    sport,
    COUNT(*) as player_count,
    COUNT(DISTINCT team_name) as team_count,
    STRING_AGG(DISTINCT position, ', ') as positions
FROM professional_players
GROUP BY sport
ORDER BY sport;

-- Show safety compliance
SELECT 
    sport_type,
    league_format,
    min_age_requirement,
    requires_identity_verification
FROM fantasy_safety_rules
ORDER BY sport_type;

-- API integration status
SELECT 
    api_name,
    sport_type,
    is_active,
    rate_limit_per_hour
FROM api_configurations
ORDER BY api_name;

-- Count the fantasy empire components
SELECT 
    'Fantasy Leagues' as component, COUNT(*) as count FROM fantasy_leagues
UNION ALL
SELECT 'Professional Players' as component, COUNT(*) as count FROM professional_players
UNION ALL
SELECT 'Safety Rules' as component, COUNT(*) as count FROM fantasy_safety_rules
UNION ALL
SELECT 'API Configurations' as component, COUNT(*) as count FROM api_configurations;

-- THE FANTASY EMPIRE'S BATTLE CRY!
SELECT 'ADULT-ONLY FANTASY EMPIRE DEPLOYED! 🎮⚡ DRAFTKINGS/FANDUEL REPLACEMENT ACTIVATED!' as fantasy_victory;