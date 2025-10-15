-- ===================================================================
-- TOURNAMENT STRUCTURE INTEGRATION - RAMMING SPEED! ⚡
-- Connecting your 30 tournament formats to actual tournament creation
-- NO MORE BASIC BRACKETS - ENTERPRISE POWER ACTIVATED!
-- ===================================================================

-- STEP 1: Fix existing tournaments to use proper structure references
-- Currently they have tournament_structure: null - LET'S FIX THAT!

UPDATE tournaments 
SET tournament_structure = (
    SELECT id FROM tournament_structures 
    WHERE format_name = 'Single Elimination' 
    LIMIT 1
)
WHERE tournament_type = 'single' AND competition_format = 'bracket';

UPDATE tournaments 
SET tournament_structure = (
    SELECT id FROM tournament_structures 
    WHERE format_name = 'Round Robin' 
    LIMIT 1
)
WHERE tournament_type = 'single' AND competition_format = 'leaderboard';

-- STEP 2: Create tournament format configurations table
-- This links tournament structures to sport-specific settings
CREATE TABLE IF NOT EXISTS tournament_format_configs (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_structure_id VARCHAR REFERENCES tournament_structures(id),
    sport_category VARCHAR REFERENCES sport_categories(id),
    min_participants INTEGER NOT NULL DEFAULT 2,
    max_participants INTEGER,
    ideal_participants INTEGER,
    bracket_generation_rules JSONB,
    advancement_rules JSONB,
    tiebreaker_rules JSONB,
    scheduling_requirements JSONB,
    venue_requirements JSONB,
    officiating_requirements JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- STEP 3: Populate configurations for major tournament formats
INSERT INTO tournament_format_configs (tournament_structure_id, sport_category, min_participants, max_participants, ideal_participants, bracket_generation_rules, advancement_rules, tiebreaker_rules, scheduling_requirements, venue_requirements, officiating_requirements) VALUES

-- SINGLE ELIMINATION CONFIGURATIONS
((SELECT id FROM tournament_structures WHERE format_name = 'Single Elimination'), 
 (SELECT id FROM sport_categories WHERE category_name = 'Team Sports'), 
 4, 128, 16,
 '{"bracket_type": "standard", "seeding": "optional", "byes": "auto_calculate", "consolation": "optional"}',
 '{"elimination": "single_loss", "advancement": "winner_only", "finals": "single_game"}',
 '{"overtime": "sudden_death", "tied_series": "extra_game", "equal_records": "head_to_head"}',
 '{"games_per_day": 4, "rest_between_games": "30_minutes", "championship_rest": "1_hour"}',
 '{"courts_needed": "calculated", "simultaneous_games": true, "championship_court": "preferred"}',
 '{"referees_per_game": 2, "tournament_director": 1, "scorekeeper": 1}'),

-- DOUBLE ELIMINATION CONFIGURATIONS  
((SELECT id FROM tournament_structures WHERE format_name = 'Double Elimination'),
 (SELECT id FROM sport_categories WHERE category_name = 'Team Sports'),
 4, 64, 12,
 '{"bracket_type": "double", "winners_bracket": true, "losers_bracket": true, "grand_finals": "winners_advantage"}',
 '{"elimination": "two_losses", "losers_bracket_advancement": "complex", "grand_finals_rule": "double_elimination"}',
 '{"overtime": "sudden_death", "losers_bracket_tiebreak": "run_differential", "winners_bracket_tiebreak": "head_to_head"}',
 '{"games_per_day": 6, "rest_between_games": "45_minutes", "elimination_rest": "1_hour"}',
 '{"courts_needed": "double_calculated", "losers_bracket_court": "secondary", "finals_court": "primary"}',
 '{"referees_per_game": 2, "bracket_coordinator": 1, "scorekeeper": 2}'),

-- ROUND ROBIN CONFIGURATIONS
((SELECT id FROM tournament_structures WHERE format_name = 'Round Robin'),
 (SELECT id FROM sport_categories WHERE category_name = 'Individual Sports'),
 3, 20, 8,
 '{"format": "everyone_plays_everyone", "rounds": "calculated", "courts": "rotation"}',
 '{"ranking": "win_percentage", "playoff": "optional", "tiebreakers": "multiple_criteria"}',
 '{"primary": "head_to_head", "secondary": "point_differential", "tertiary": "points_for"}',
 '{"rounds_per_day": 3, "matches_per_round": "calculated", "rest_between_rounds": "15_minutes"}',
 '{"courts_needed": "half_participants", "rotation_system": true, "scoreboard": "central"}',
 '{"referees_per_match": 1, "round_coordinator": 1, "central_scoring": 1}'),

-- SWISS SYSTEM CONFIGURATIONS (Perfect for Chess/Esports)
((SELECT id FROM tournament_structures WHERE format_name = 'Swiss System'),
 (SELECT id FROM sport_categories WHERE category_name = 'Esports'),
 8, 128, 32,
 '{"pairing_method": "swiss", "rounds": "calculated_log2", "color_balancing": true}',
 '{"ranking": "match_points", "tiebreakers": "buchholz_system", "final_standings": "swiss_points"}',
 '{"primary": "direct_encounter", "secondary": "buchholz", "tertiary": "sonneborn_berger"}',
 '{"rounds": "log2_participants", "round_duration": "varies_by_game", "break_between_rounds": "30_minutes"}',
 '{"stations_needed": "half_participants", "pairing_display": "required", "results_entry": "real_time"}',
 '{"tournament_director": 1, "pairing_software": "required", "arbiters": "calculated"}'),

-- POOL PLAY → SINGLE ELIMINATION (World Cup Style!)
((SELECT id FROM tournament_structures WHERE format_name = 'Pool Play → Single Elimination'),
 (SELECT id FROM sport_categories WHERE category_name = 'Team Sports'),
 8, 32, 16,
 '{"pool_size": 4, "pools_count": "calculated", "advancement": "top_2_per_pool", "bracket_seeding": "pool_results"}',
 '{"pool_stage": "round_robin", "elimination_stage": "single", "advancement_criteria": "top_finishers"}',
 '{"pool_tiebreak": "head_to_head_then_differential", "bracket_tiebreak": "sudden_death"}',
 '{"pool_stage_days": 2, "elimination_stage_days": 3, "rest_day": "between_stages"}',
 '{"pool_courts": "multiple", "elimination_courts": "single", "championship_venue": "premium"}',
 '{"pool_referees": 2, "elimination_referees": 3, "championship_crew": 5}'),

-- TRACK & FIELD SPECIFIC CONFIGURATIONS
((SELECT id FROM tournament_structures WHERE format_name = 'Multi-Event Competition'),
 (SELECT id FROM sport_categories WHERE category_name = 'Individual Sports'),
 5, 50, 20,
 '{"event_count": "variable", "scoring": "IAAF_tables", "event_order": "standard", "qualifying": "optional"}',
 '{"advancement": "cumulative_points", "event_completion": "required", "final_ranking": "total_points"}',
 '{"primary": "total_points", "secondary": "head_to_head_events", "tertiary": "best_individual_event"}',
 '{"days": "2_day_format", "events_per_day": "5", "rest_between_events": "45_minutes"}',
 '{"track_required": true, "field_areas": "multiple", "warm_up_areas": "required", "timing_system": "FAT"}',
 '{"meet_director": 1, "event_judges": "per_event", "timing_crew": 3, "results_crew": 2}'),

-- ESPORTS BATTLE ROYALE
((SELECT id FROM tournament_structures WHERE format_name = 'Battle Royale'),
 (SELECT id FROM sport_categories WHERE category_name = 'Esports'),
 20, 100, 60,
 '{"lobby_size": "60_players", "matches": "multiple", "scoring": "placement_kills", "final": "last_lobby"}',
 '{"elimination": "placement_based", "points": "cumulative", "final_lobby": "top_performers"}',
 '{"primary": "total_points", "secondary": "average_placement", "tertiary": "total_eliminations"}',
 '{"lobbies_per_day": 6, "lobby_duration": "30_minutes", "break_between": "15_minutes"}',
 '{"gaming_stations": 60, "spectator_area": "required", "streaming_setup": "professional"}',
 '{"tournament_admin": 1, "lobby_moderators": 3, "technical_support": 2}'),

-- ACADEMIC QUIZ BOWL
((SELECT id FROM tournament_structures WHERE format_name = 'Quiz Bowl'),
 (SELECT id FROM sport_categories WHERE category_name = 'Academic Competitions'),
 6, 24, 12,
 '{"format": "tossup_bonus", "rounds": "preliminary_playoff", "question_set": "standardized"}',
 '{"preliminary": "round_robin_pools", "playoff": "single_elimination", "ranking": "points_per_game"}',
 '{"primary": "points_per_game", "secondary": "head_to_head", "tertiary": "point_differential"}',
 '{"rounds": 8, "questions_per_round": 20, "break_between": "10_minutes"}',
 '{"rooms_needed": "calculated", "moderator_room": true, "question_control": "centralized"}',
 '{"moderator": 1, "scorekeeper": 1, "question_reader": 1, "timekeeper": 1}'),

-- GOLF HANDICAP SYSTEM
((SELECT id FROM tournament_structures WHERE format_name = 'Handicap System'),
 (SELECT id FROM sport_categories WHERE category_name = 'Individual Sports'),
 8, 144, 72,
 '{"format": "stroke_play", "handicap": "USGA_system", "flights": "calculated", "tee_times": "scheduled"}',
 '{"ranking": "net_score", "flights": "handicap_based", "playoffs": "sudden_death"}',
 '{"primary": "lowest_net_score", "secondary": "back_nine", "tertiary": "back_six"}',
 '{"tee_times": "8_minute_intervals", "pace_of_play": "4.5_hours", "shotgun_start": "optional"}',
 '{"golf_course": "18_holes", "practice_range": "required", "clubhouse": "scoring"}',
 '{"tournament_director": 1, "starter": 1, "course_marshals": 4, "scoring": 2}');

-- STEP 4: Create bracket generation templates
CREATE TABLE IF NOT EXISTS bracket_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_structure_id VARCHAR REFERENCES tournament_structures(id),
    participant_count INTEGER NOT NULL,
    bracket_structure JSONB NOT NULL,
    match_sequence JSONB NOT NULL,
    advancement_map JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- STEP 5: Generate bracket templates for common sizes
INSERT INTO bracket_templates (tournament_structure_id, participant_count, bracket_structure, match_sequence, advancement_map) VALUES

-- Single Elimination Templates
((SELECT id FROM tournament_structures WHERE format_name = 'Single Elimination'), 4,
 '{"rounds": 2, "total_matches": 3, "structure": "linear"}',
 '{"round_1": [{"match_1": {"team_a": "seed_1", "team_b": "seed_4"}}, {"match_2": {"team_a": "seed_2", "team_b": "seed_3"}}], "round_2": [{"championship": {"team_a": "winner_match_1", "team_b": "winner_match_2"}}]}',
 '{"round_1_winners": ["championship"], "championship_winner": ["tournament_winner"]}'),

((SELECT id FROM tournament_structures WHERE format_name = 'Single Elimination'), 8,
 '{"rounds": 3, "total_matches": 7, "structure": "tree"}',
 '{"round_1": [{"match_1": {"team_a": "seed_1", "team_b": "seed_8"}}, {"match_2": {"team_a": "seed_4", "team_b": "seed_5"}}, {"match_3": {"team_a": "seed_2", "team_b": "seed_7"}}, {"match_4": {"team_a": "seed_3", "team_b": "seed_6"}}], "round_2": [{"semifinal_1": {"team_a": "winner_match_1", "team_b": "winner_match_2"}}, {"semifinal_2": {"team_a": "winner_match_3", "team_b": "winner_match_4"}}], "round_3": [{"championship": {"team_a": "winner_semifinal_1", "team_b": "winner_semifinal_2"}}]}',
 '{"round_1_winners": ["semifinals"], "semifinal_winners": ["championship"], "championship_winner": ["tournament_winner"]}'),

-- Double Elimination Template (8 teams)
((SELECT id FROM tournament_structures WHERE format_name = 'Double Elimination'), 8,
 '{"winners_bracket_rounds": 3, "losers_bracket_rounds": 5, "total_matches": 14, "structure": "double_tree"}',
 '{"winners_round_1": [{"WB1": {"team_a": "seed_1", "team_b": "seed_8"}}, {"WB2": {"team_a": "seed_4", "team_b": "seed_5"}}, {"WB3": {"team_a": "seed_2", "team_b": "seed_7"}}, {"WB4": {"team_a": "seed_3", "team_b": "seed_6"}}], "losers_round_1": [{"LB1": {"team_a": "loser_WB1", "team_b": "loser_WB2"}}, {"LB2": {"team_a": "loser_WB3", "team_b": "loser_WB4"}}]}',
 '{"winners_bracket": "advances_or_to_losers", "losers_bracket": "elimination", "grand_finals": "winners_advantage"}'),

-- Round Robin Template (6 teams)
((SELECT id FROM tournament_structures WHERE format_name = 'Round Robin'), 6,
 '{"rounds": 5, "total_matches": 15, "structure": "matrix"}',
 '{"all_matches": [{"round_1": [{"match_1": {"team_a": "team_1", "team_b": "team_2"}}, {"match_2": {"team_a": "team_3", "team_b": "team_4"}}, {"match_3": {"team_a": "team_5", "team_b": "team_6"}}]}, {"round_2": [{"match_4": {"team_a": "team_1", "team_b": "team_3"}}, {"match_5": {"team_a": "team_2", "team_b": "team_5"}}, {"match_6": {"team_a": "team_4", "team_b": "team_6"}}]}]}',
 '{"final_ranking": "win_loss_record", "tiebreakers": ["head_to_head", "point_differential"]}');

-- STEP 6: Update existing tournaments to use proper foreign keys
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS format_config_id VARCHAR REFERENCES tournament_format_configs(id);

-- Link existing tournaments to appropriate configurations
UPDATE tournaments 
SET format_config_id = (
    SELECT tfc.id 
    FROM tournament_format_configs tfc
    JOIN tournament_structures ts ON tfc.tournament_structure_id = ts.id
    WHERE ts.id = tournaments.tournament_structure
    LIMIT 1
)
WHERE tournament_structure IS NOT NULL;

-- STEP 7: Create tournament generation helper functions
CREATE TABLE IF NOT EXISTS tournament_generation_log (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id VARCHAR REFERENCES tournaments(id),
    generation_step VARCHAR NOT NULL,
    step_data JSONB,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- ===================================================================
-- VERIFICATION QUERIES - SEE THE POWER UNLEASHED!
-- ===================================================================

-- Show all tournament structures with their configurations
SELECT 
    ts.format_name,
    ts.format_type,
    COUNT(tfc.id) as config_count,
    STRING_AGG(sc.category_name, ', ') as applicable_categories
FROM tournament_structures ts
LEFT JOIN tournament_format_configs tfc ON ts.id = tfc.tournament_structure_id
LEFT JOIN sport_categories sc ON tfc.sport_category = sc.id
GROUP BY ts.id, ts.format_name, ts.format_type
ORDER BY ts.format_sort_order;

-- Check existing tournaments now have proper structure links
SELECT 
    t.name,
    t.tournament_type,
    t.competition_format,
    ts.format_name as structure_name,
    ts.format_type,
    tfc.min_participants,
    tfc.max_participants
FROM tournaments t
LEFT JOIN tournament_structures ts ON t.tournament_structure = ts.id
LEFT JOIN tournament_format_configs tfc ON t.format_config_id = tfc.id;

-- Show bracket templates available
SELECT 
    ts.format_name,
    bt.participant_count,
    bt.bracket_structure->>'rounds' as rounds,
    bt.bracket_structure->>'total_matches' as total_matches
FROM bracket_templates bt
JOIN tournament_structures ts ON bt.tournament_structure_id = ts.id
ORDER BY ts.format_name, bt.participant_count;

-- Count everything we just created
SELECT 
    'Tournament Structures' as table_name, COUNT(*) as records FROM tournament_structures
UNION ALL
SELECT 'Format Configurations' as table_name, COUNT(*) as records FROM tournament_format_configs
UNION ALL
SELECT 'Bracket Templates' as table_name, COUNT(*) as records FROM bracket_templates;