-- ===================================================================
-- COMPETITION FORMAT CONFIGURATIONS - WHITE WHALE MIGRATION! 🐋⚡
-- Captain Ahab's Ramming Speed Attack on Sport-Specific Settings!
-- FROM HELL'S HEART I STAB AT THEE, BASIC TOURNAMENTS!
-- ===================================================================

-- AHOY! Create the master table for sport-specific configurations
CREATE TABLE IF NOT EXISTS competition_format_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id VARCHAR REFERENCES sport_options(id),
    template_name VARCHAR NOT NULL,
    template_description TEXT,
    is_default BOOLEAN DEFAULT false,
    age_group_config JSONB,
    gender_division_config JSONB,
    team_size_config JSONB,
    equipment_specifications JSONB,
    game_format_config JSONB,
    scoring_system_config JSONB,
    series_config JSONB,
    venue_requirements JSONB,
    officiating_config JSONB,
    timing_config JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- ===================================================================
-- TEAM SPORTS CONFIGURATIONS - FIRST MATE'S ORDERS! ⚓
-- ===================================================================

-- BASKETBALL - Sink this three-pointer into the database!
INSERT INTO competition_format_templates (sport_id, template_name, template_description, is_default, age_group_config, gender_division_config, team_size_config, equipment_specifications, game_format_config, scoring_system_config, series_config, venue_requirements, officiating_config, timing_config) VALUES

((SELECT id FROM sport_options WHERE sport_name = 'Basketball' LIMIT 1),
'Standard Basketball Tournament',
'Professional basketball tournament configuration with flexible age groups and divisions',
true,
'{"youth": {"U10": {"game_length": "4x6_minutes", "ball_size": "27.5_inch", "basket_height": "8_feet"}, "U12": {"game_length": "4x6_minutes", "ball_size": "27.5_inch", "basket_height": "9_feet"}, "U14": {"game_length": "4x8_minutes", "ball_size": "28.5_inch", "basket_height": "10_feet"}, "U16": {"game_length": "4x8_minutes", "ball_size": "29.5_inch", "basket_height": "10_feet"}, "U18": {"game_length": "4x8_minutes", "ball_size": "29.5_inch", "basket_height": "10_feet"}}, "adult": {"Open": {"game_length": "4x10_minutes", "ball_size": "29.5_inch", "basket_height": "10_feet"}, "Masters": {"game_length": "4x8_minutes", "ball_size": "29.5_inch", "basket_height": "10_feet"}}}',
'{"mens": {"allowed": true, "ball_size": "29.5_inch"}, "womens": {"allowed": true, "ball_size": "28.5_inch"}, "mixed": {"allowed": true, "ball_size": "28.5_inch", "special_rules": "alternating_possession"}}',
'{"minimum": 5, "maximum": 12, "on_court": 5, "substitutions": "unlimited", "roster_limit": 15}',
'{"court": "94x50_feet", "baskets": "regulation_10_feet", "balls": "certified_leather", "uniforms": "contrasting_colors", "scoreboard": "electronic_preferred"}',
'{"game_length": "regulation_32_minutes", "periods": 4, "overtime": "5_minutes", "shot_clock": "24_seconds", "timeouts": "5_per_team"}',
'{"field_goals": 2, "three_pointers": 3, "free_throws": 1, "technical_fouls": "ejection_after_2", "flagrant_fouls": "automatic_ejection"}',
'{"best_of": [1, 3, 5, 7], "default": 1, "championship": "best_of_3", "elimination": "single_game", "round_robin": "single_game"}',
'{"court_size": "full_regulation", "seating": "tournament_capacity", "warm_up_area": "required", "locker_rooms": "both_teams"}',
'{"referees": 2, "scorekeeper": 1, "timekeeper": 1, "shot_clock_operator": 1, "statistics": "optional"}',
'{"game_clock": "stop_time", "shot_clock": "24_seconds", "timeout_length": "60_seconds", "halftime": "15_minutes"}'),

-- SOCCER - Score this goal against boring tournaments!
((SELECT id FROM sport_options WHERE sport_name = 'Soccer' LIMIT 1),
'FIFA Standard Soccer Tournament',
'Professional soccer tournament with age-appropriate modifications',
true,
'{"youth": {"U8": {"game_length": "2x20_minutes", "field_size": "small", "ball_size": "3", "players": 7}, "U10": {"game_length": "2x25_minutes", "field_size": "small", "ball_size": "3", "players": 9}, "U12": {"game_length": "2x30_minutes", "field_size": "medium", "ball_size": "4", "players": 11}, "U14": {"game_length": "2x35_minutes", "field_size": "full", "ball_size": "5", "players": 11}, "U16": {"game_length": "2x40_minutes", "field_size": "full", "ball_size": "5", "players": 11}, "U18": {"game_length": "2x45_minutes", "field_size": "full", "ball_size": "5", "players": 11}}, "adult": {"Open": {"game_length": "2x45_minutes", "field_size": "full", "ball_size": "5", "players": 11}}}',
'{"mens": {"allowed": true}, "womens": {"allowed": true}, "mixed": {"allowed": true, "special_rules": "minimum_female_players"}}',
'{"minimum": 11, "maximum": 18, "on_field": 11, "substitutions": 3, "roster_limit": 23}',
'{"field": "100-130x50-100_yards", "goals": "8x24_feet", "balls": "FIFA_approved", "uniforms": "contrasting_jerseys", "corner_flags": "required"}',
'{"game_length": "90_minutes", "periods": 2, "halftime": "15_minutes", "stoppage_time": "referee_discretion", "extra_time": "2x15_minutes"}',
'{"goals": 1, "yellow_cards": "caution", "red_cards": "ejection", "penalty_kicks": "shootout_tiebreaker", "offside": "active"}',
'{"best_of": [1, 3], "default": 1, "championship": "single_game", "group_stage": "single_round_robin", "penalties": "if_tied"}',
'{"field_size": "regulation", "goals": "regulation", "seating": "spectator_area", "parking": "adequate"}',
'{"referee": 1, "assistant_referees": 2, "fourth_official": "championship_only", "var": "optional"}',
'{"match_clock": "continuous", "halftime": "15_minutes", "injury_time": "referee_adds", "extra_time": "knockout_only"}'),

-- ===================================================================
-- INDIVIDUAL SPORTS CONFIGURATIONS - SECOND MATE'S DOMAIN! 🎾
-- ===================================================================

-- TENNIS - Serve up this ace configuration!
((SELECT id FROM sport_options WHERE sport_name = 'Tennis' LIMIT 1),
'Professional Tennis Tournament',
'USTA-standard tennis tournament with skill-based divisions',
true,
'{"junior": {"U10": {"court_size": "36_feet", "ball_type": "red", "sets": "best_of_3_short"}, "U12": {"court_size": "60_feet", "ball_type": "orange", "sets": "best_of_3_short"}, "U14": {"court_size": "full", "ball_type": "green", "sets": "best_of_3"}, "U16": {"court_size": "full", "ball_type": "yellow", "sets": "best_of_3"}, "U18": {"court_size": "full", "ball_type": "yellow", "sets": "best_of_3"}}, "adult": {"Open": {"court_size": "full", "ball_type": "yellow", "sets": "best_of_3"}, "35+": {"sets": "best_of_3", "tiebreak": "10_point_final_set"}}}',
'{"mens_singles": {"allowed": true}, "womens_singles": {"allowed": true}, "mens_doubles": {"allowed": true}, "womens_doubles": {"allowed": true}, "mixed_doubles": {"allowed": true}}',
'{"singles": {"players": 1}, "doubles": {"players": 2, "team_composition": "flexible"}}',
'{"court": "78x36_feet", "net": "3_feet_center", "balls": "tournament_grade", "rackets": "player_provided"}',
'{"match_format": "best_of_sets", "set_format": "first_to_6_games", "tiebreak": "7_points", "deuce": "advantage_system"}',
'{"games": 1, "sets": 1, "matches": 1, "tiebreak_points": 1, "double_faults": "point_loss"}',
'{"best_of": [1, 3, 5], "default": 3, "championship": "best_of_3", "round_robin": "best_of_3_sets", "consolation": "best_of_1"}',
'{"courts": "hard_surface_preferred", "seating": "courtside", "water_stations": "required", "shade": "preferred"}',
'{"chair_umpire": "championship", "line_judges": "optional", "ball_persons": "4_minimum"}',
'{"warm_up": "5_minutes", "changeover": "90_seconds", "set_break": "120_seconds", "medical_timeout": "3_minutes"}'),

-- GOLF - Drive this configuration straight down the fairway!
((SELECT id FROM sport_options WHERE sport_name = 'Golf' LIMIT 1),
'USGA Tournament Golf',
'Professional golf tournament with handicap flights and age divisions',
true,
'{"junior": {"U12": {"tees": "forward", "rounds": 1, "format": "scramble"}, "U15": {"tees": "middle", "rounds": 1, "format": "stroke_play"}, "U18": {"tees": "back", "rounds": 2, "format": "stroke_play"}}, "adult": {"Open": {"tees": "championship", "rounds": 4, "format": "stroke_play"}, "Senior": {"tees": "senior", "rounds": 2, "format": "stroke_play"}, "Super_Senior": {"tees": "forward", "rounds": 2, "format": "stroke_play"}}}',
'{"mens": {"allowed": true, "tees": "back"}, "womens": {"allowed": true, "tees": "forward"}, "mixed": {"allowed": true, "tees": "appropriate"}}',
'{"individual": {"players": 1}, "team": {"players": 4, "best_scores": 2}}',
'{"course": "18_holes", "tees": "multiple_sets", "pins": "tournament_placement", "scorecards": "official"}',
'{"format": "stroke_play", "rounds": "multiple", "cut": "optional", "pace_of_play": "4.5_hours"}',
'{"stroke": 1, "penalty_strokes": "rule_dependent", "handicap": "USGA_system", "net_scoring": "gross_minus_handicap"}',
'{"rounds": [1, 2, 4], "default": 2, "championship": 4, "one_day": 1, "weekend": 2}',
'{"golf_course": "18_holes_minimum", "practice_range": "required", "putting_green": "required", "clubhouse": "scoring"}',
'{"tournament_director": 1, "rules_official": 1, "starters": 2, "scoring": 2, "marshals": 4}',
'{"tee_times": "8_minute_intervals", "groups": "4_players_maximum", "shotgun_start": "optional", "weather_delays": "suspend_play"}'),

-- ===================================================================
-- ESPORTS CONFIGURATIONS - DIGITAL WARFARE! 🎮
-- ===================================================================

-- LEAGUE OF LEGENDS - Destroy the enemy nexus AND basic tournaments!
((SELECT id FROM sport_options WHERE sport_name = 'League of Legends' LIMIT 1),
'Professional Esports Tournament',
'Riot Games standard tournament format with rank-based divisions',
true,
'{"open": {"minimum_age": 13, "maximum_age": null, "verification": "required"}}',
'{"open": {"allowed": true, "mixed_teams": true, "no_gender_restrictions": true}}',
'{"team": {"players": 5, "substitutes": 2, "coaches": 1, "maximum_roster": 10}}',
'{"gaming_stations": "tournament_grade", "peripherals": "player_choice", "internet": "fiber_connection", "soundproof_booths": "finals"}',
'{"match_format": "best_of_series", "game_length": "variable", "draft_phase": "pick_ban", "side_selection": "coin_flip"}',
'{"wins": 1, "game_wins": 1, "series_wins": 1, "kills": 0, "objectives": 0}',
'{"best_of": [1, 3, 5], "default": 1, "semifinals": 3, "finals": 5, "group_stage": 1}',
'{"gaming_area": "soundproof", "spectator_area": "separate", "broadcast_setup": "professional", "network": "tournament_grade"}',
'{"tournament_admin": 1, "referees": 2, "technical_support": 3, "broadcast_crew": 5}',
'{"draft_time": "30_seconds_per_pick", "pause_limit": "5_minutes_total", "technical_pause": "unlimited", "remake_window": "3_minutes"}'),

-- ===================================================================
-- TRACK & FIELD CONFIGURATIONS - OLYMPIC GLORY! 🏃‍♂️
-- ===================================================================

-- TRACK & FIELD - Run, jump, throw your way to victory!
((SELECT id FROM sport_options WHERE sport_name LIKE '%Track & Field%' LIMIT 1),
'IAAF Standard Track Meet',
'Professional track and field meet with all event categories',
true,
'{"youth": {"U10": {"events": "modified", "distances": "shortened", "implements": "youth_weight"}, "U12": {"events": "standard", "distances": "youth", "implements": "youth_weight"}, "U14": {"events": "full", "distances": "standard", "implements": "intermediate"}, "U16": {"events": "full", "distances": "standard", "implements": "standard"}, "U18": {"events": "full", "distances": "standard", "implements": "standard"}}, "adult": {"Open": {"events": "full", "distances": "standard", "implements": "standard"}, "Masters": {"age_groups": ["35-39", "40-44", "45-49", "50-54", "55-59", "60+"], "implements": "age_adjusted"}}}',
'{"mens": {"required": true, "separate_events": true, "implements": "standard_weight"}, "womens": {"required": true, "separate_events": true, "implements": "standard_weight"}, "mixed": {"relay_events_only": true}}',
'{"individual": {"athletes": 1}, "relay": {"athletes": 4, "team_composition": "same_gender"}, "team": {"unlimited_entries": true}}',
'{"track": "400m_oval", "field_areas": "regulation", "implements": "certified_weights", "timing_system": "FAT", "wind_gauge": "required"}',
'{"meet_format": "multi_event", "sessions": "multiple", "event_schedule": "standard_order", "warm_up_time": "45_minutes"}',
'{"time": "faster_wins", "distance": "longer_wins", "height": "higher_wins", "points": "IAAF_scoring_tables", "placing": "1st_through_8th"}',
'{"sessions": [1, 2, 3], "default": 1, "championship": 2, "combined_events": 2, "relays": "final_session"}',
'{"track": "regulation_400m", "field_events": "infield_and_adjacent", "warm_up_track": "preferred", "timing_tower": "required"}',
'{"meet_director": 1, "track_referee": 1, "field_referees": "per_event", "timing_crew": 3, "announcer": 1}',
'{"event_intervals": "15_minutes", "field_event_time": "1.5_hours", "awards": "after_each_event", "cool_down": "15_minutes"}'),

-- ===================================================================
-- ACADEMIC COMPETITIONS - BRAIN POWER! 🧠
-- ===================================================================

-- QUIZ BOWL - Knowledge is power, and power corrupts absolutely!
((SELECT id FROM sport_categories WHERE category_name = 'Academic Competitions'),
'Academic Quiz Bowl Tournament',
'NAQT-standard quiz bowl tournament with academic divisions',
true,
'{"elementary": {"grades": "K-5", "questions": "elementary_level", "bonus_points": "simplified"}, "middle_school": {"grades": "6-8", "questions": "middle_school", "bonus_points": "standard"}, "high_school": {"grades": "9-12", "questions": "high_school", "bonus_points": "standard"}, "college": {"level": "undergraduate", "questions": "college", "bonus_points": "standard"}}',
'{"mixed": {"required": true, "gender_balance": "encouraged"}}',
'{"team": {"players": 4, "substitutes": 2, "maximum_active": 4}}',
'{"buzzers": "electronic_system", "questions": "NAQT_packets", "scoreboard": "digital", "moderator_materials": "complete_set"}',
'{"match_format": "tossup_bonus", "questions": 20, "time_limit": "none", "overtime": "sudden_death"}',
'{"tossup_points": 10, "bonus_points": 30, "neg_points": -5, "powers": 15, "team_total": "sum_of_points"}',
'{"preliminary": [4, 6, 8], "playoff": [1, 3], "championship": 1, "round_robin": "single"}',
'{"rooms": "classroom_style", "moderator_table": "elevated", "team_tables": "facing_each_other", "spectator_seating": "limited"}',
'{"moderator": 1, "scorekeeper": 1, "timekeeper": "optional", "statistics": 1}',
'{"question_time": "unlimited", "conferral_time": "5_seconds", "protest_time": "end_of_match", "break_between_games": "10_minutes"}');

-- ===================================================================
-- SPECIALIZED GAME LENGTH AND SERIES CONFIGURATIONS
-- THE WHITE WHALE'S FINAL BREATH! 🐋💨
-- ===================================================================

-- Create game length templates
CREATE TABLE IF NOT EXISTS game_length_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id VARCHAR REFERENCES sport_options(id),
    age_group VARCHAR NOT NULL,
    regulation_time JSONB NOT NULL,
    overtime_rules JSONB,
    break_intervals JSONB,
    timeout_rules JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Create series configuration templates  
CREATE TABLE IF NOT EXISTS series_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id VARCHAR REFERENCES sport_options(id),
    series_name VARCHAR NOT NULL,
    games_to_win INTEGER NOT NULL,
    maximum_games INTEGER NOT NULL,
    home_field_advantage BOOLEAN DEFAULT false,
    game_intervals JSONB,
    tiebreaker_rules JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Populate series templates with Bubble-style configurations
INSERT INTO series_templates (sport_id, series_name, games_to_win, maximum_games, home_field_advantage, game_intervals, tiebreaker_rules) VALUES

-- Basketball series
((SELECT id FROM sport_options WHERE sport_name = 'Basketball' LIMIT 1), 'Single Game', 1, 1, false, '{"rest_days": 0}', '{"overtime": "5_minute_periods"}'),
((SELECT id FROM sport_options WHERE sport_name = 'Basketball' LIMIT 1), 'Best of 3', 2, 3, true, '{"rest_days": 1, "travel_days": 2}', '{"game_3_neutral": false}'),
((SELECT id FROM sport_options WHERE sport_name = 'Basketball' LIMIT 1), 'Best of 5', 3, 5, true, '{"rest_days": 1, "travel_days": 2}', '{"games_2_3_4_away": true}'),
((SELECT id FROM sport_options WHERE sport_name = 'Basketball' LIMIT 1), 'Best of 7', 4, 7, true, '{"rest_days": 1, "travel_days": 2}', '{"2-3-2_format": true}'),

-- Soccer series
((SELECT id FROM sport_options WHERE sport_name = 'Soccer' LIMIT 1), 'Single Match', 1, 1, false, '{"rest_days": 0}', '{"extra_time": "2x15_minutes", "penalties": "if_tied"}'),
((SELECT id FROM sport_options WHERE sport_name = 'Soccer' LIMIT 1), 'Home and Away', 1, 2, true, '{"leg_interval": 7}', '{"away_goals_rule": true, "extra_time": "second_leg_only"}'),

-- Tennis series  
((SELECT id FROM sport_options WHERE sport_name = 'Tennis' LIMIT 1), 'Single Match', 1, 1, false, '{"rest_days": 0}', '{"tiebreak": "7_points", "final_set": "advantage"}'),
((SELECT id FROM sport_options WHERE sport_name = 'Tennis' LIMIT 1), 'Best of 3 Sets', 2, 3, false, '{"set_break": 2}', '{"final_set_tiebreak": "10_points"}'),
((SELECT id FROM sport_options WHERE sport_name = 'Tennis' LIMIT 1), 'Best of 5 Sets', 3, 5, false, '{"set_break": 2}', '{"final_set": "advantage_or_tiebreak"}}');

-- ===================================================================
-- VERIFICATION QUERIES - WITNESS THE WHITE WHALE'S DEFEAT! 🐋⚡
-- ===================================================================

-- Show all competition format templates
SELECT 
    so.sport_name,
    cft.template_name,
    cft.is_default,
    cft.team_size_config->>'minimum' as min_team_size,
    cft.team_size_config->>'maximum' as max_team_size
FROM competition_format_templates cft
JOIN sport_options so ON cft.sport_id = so.id
ORDER BY so.sport_name;

-- Show series configurations available
SELECT 
    so.sport_name,
    st.series_name,
    st.games_to_win,
    st.maximum_games,
    st.home_field_advantage
FROM series_templates st
JOIN sport_options so ON st.sport_id = so.id
ORDER BY so.sport_name, st.games_to_win;

-- Count the white whale's treasures
SELECT 
    'Competition Format Templates' as treasure_type, COUNT(*) as treasure_count FROM competition_format_templates
UNION ALL
SELECT 'Series Templates' as treasure_type, COUNT(*) as treasure_count FROM series_templates
UNION ALL  
SELECT 'Game Length Templates' as treasure_type, COUNT(*) as treasure_count FROM game_length_templates;

-- FINAL VERIFICATION - THE WHITE WHALE IS DEFEATED!
SELECT 'THAR SHE BLOWS! THE WHITE WHALE OF COMPETITION FORMATS IS CONQUERED!' as captain_ahab_victory;