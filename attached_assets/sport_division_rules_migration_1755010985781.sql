-- ===================================================================
-- SPORT DIVISION RULES MIGRATION
-- Creating flexible JSON-based rule configurations for all sports
-- This enables age groups, gender divisions, skill levels, and more!
-- ===================================================================

-- TEAM SPORTS CONFIGURATIONS
INSERT INTO sport_division_rules (sport_id, required_divisions, allowed_combinations, age_group_rules, gender_rules, performance_standards) VALUES

-- BASKETBALL
((SELECT id FROM sport_options WHERE sport_name = 'Basketball' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 8, "default_type": "age_gender"}',
'{"age_gender": true, "skill_only": true, "mixed_age": false}',
'{"youth": {"U10": {"max_age": 10, "min_players": 5}, "U12": {"max_age": 12, "min_players": 5}, "U14": {"max_age": 14, "min_players": 5}, "U16": {"max_age": 16, "min_players": 5}, "U18": {"max_age": 18, "min_players": 5}}, "adult": {"Open": {"min_age": 18, "min_players": 5}, "Masters": {"min_age": 35, "min_players": 5}}}',
'{"mens": {"required": false, "min_players": 5}, "womens": {"required": false, "min_players": 5}, "mixed": {"required": false, "min_players": 5, "gender_ratio": "flexible"}}',
'{"recreational": {"skill_level": 1, "description": "Beginner to intermediate players"}, "competitive": {"skill_level": 2, "description": "Advanced recreational and former high school players"}, "elite": {"skill_level": 3, "description": "College and professional level players"}}'),

-- SOCCER  
((SELECT id FROM sport_options WHERE sport_name = 'Soccer' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 12, "default_type": "age_gender"}',
'{"age_gender": true, "skill_only": true, "mixed_age": true}',
'{"youth": {"U8": {"max_age": 8, "min_players": 7, "field_size": "small"}, "U10": {"max_age": 10, "min_players": 9, "field_size": "small"}, "U12": {"max_age": 12, "min_players": 11, "field_size": "full"}, "U14": {"max_age": 14, "min_players": 11}, "U16": {"max_age": 16, "min_players": 11}, "U18": {"max_age": 18, "min_players": 11}}, "adult": {"Open": {"min_age": 18, "min_players": 11}, "Over30": {"min_age": 30, "min_players": 11}, "Over40": {"min_age": 40, "min_players": 11}}}',
'{"mens": {"required": false, "min_players": 11}, "womens": {"required": false, "min_players": 11}, "mixed": {"required": false, "min_players": 11, "gender_ratio": "flexible"}}',
'{"division_4": {"skill_level": 1, "description": "Recreational, new players welcome"}, "division_3": {"skill_level": 2, "description": "Intermediate recreational"}, "division_2": {"skill_level": 3, "description": "Competitive recreational"}, "division_1": {"skill_level": 4, "description": "Highly competitive, club level"}}'),

-- INDIVIDUAL SPORTS CONFIGURATIONS

-- TENNIS
((SELECT id FROM sport_options WHERE sport_name = 'Tennis' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 16, "default_type": "age_gender_skill"}',
'{"age_gender": true, "skill_only": true, "mixed_doubles": true}',
'{"junior": {"U10": {"max_age": 10, "court_size": "36ft"}, "U12": {"max_age": 12, "court_size": "60ft"}, "U14": {"max_age": 14, "court_size": "full"}, "U16": {"max_age": 16}, "U18": {"max_age": 18}}, "adult": {"Open": {"min_age": 18}, "35+": {"min_age": 35}, "45+": {"min_age": 45}, "55+": {"min_age": 55}, "65+": {"min_age": 65}}}',
'{"mens_singles": {"required": false}, "womens_singles": {"required": false}, "mens_doubles": {"required": false}, "womens_doubles": {"required": false}, "mixed_doubles": {"required": false, "gender_ratio": "1:1"}}',
'{"beginner": {"skill_level": 1, "ntrp_range": "1.0-2.5", "description": "New to tennis"}, "intermediate": {"skill_level": 2, "ntrp_range": "3.0-3.5", "description": "Regular recreational player"}, "advanced": {"skill_level": 3, "ntrp_range": "4.0-4.5", "description": "Tournament experienced"}, "open": {"skill_level": 4, "ntrp_range": "5.0+", "description": "Highly competitive"}}'),

-- GOLF
((SELECT id FROM sport_options WHERE sport_name = 'Golf' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 20, "default_type": "age_gender_handicap"}',
'{"age_gender": true, "handicap_flights": true, "mixed_age": true}',
'{"junior": {"U12": {"max_age": 12, "tee_color": "red"}, "U15": {"max_age": 15, "tee_color": "red"}, "U18": {"max_age": 18, "tee_color": "white"}}, "adult": {"Open": {"min_age": 18, "tee_color": "white"}, "Senior": {"min_age": 50, "tee_color": "white"}, "Super_Senior": {"min_age": 65, "tee_color": "gold"}}}',
'{"mens": {"required": false, "tee_color": "white"}, "womens": {"required": false, "tee_color": "red"}, "mixed": {"required": false, "tee_color": "flexible"}}',
'{"championship": {"handicap_range": "0-5", "description": "Scratch to low handicap"}, "A_flight": {"handicap_range": "6-12", "description": "Low to mid handicap"}, "B_flight": {"handicap_range": "13-20", "description": "Mid to high handicap"}, "C_flight": {"handicap_range": "21-36", "description": "High handicap and beginners"}}'),

-- TRACK & FIELD SPECIALIZATION
((SELECT id FROM sport_options WHERE sport_name LIKE '%Track & Field%' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 24, "default_type": "age_gender_event"}',
'{"age_gender": true, "event_specific": true, "team_individual": true}',
'{"youth": {"U10": {"max_age": 10, "events": "modified"}, "U12": {"max_age": 12, "events": "standard"}, "U14": {"max_age": 14, "events": "standard"}, "U16": {"max_age": 16, "events": "full"}, "U18": {"max_age": 18, "events": "full"}}, "adult": {"Open": {"min_age": 18, "events": "full"}, "Masters": {"age_groups": ["35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65+"]}}}',
'{"mens": {"required": true, "separate_events": true}, "womens": {"required": true, "separate_events": true}, "mixed": {"allowed_events": ["relay_mixed", "team_events"]}}',
'{"school": {"level": "high_school", "qualifying_standards": true}, "club": {"level": "club", "qualifying_standards": false}, "open": {"level": "open", "qualifying_standards": false}, "elite": {"level": "elite", "qualifying_standards": true, "meet_standards": "national"}}'),

-- ESPORTS CONFIGURATIONS

-- LEAGUE OF LEGENDS
((SELECT id FROM sport_options WHERE sport_name = 'League of Legends' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 8, "default_type": "skill_rank"}',
'{"rank_based": true, "team_based": true, "skill_only": true}',
'{"open": {"min_age": 13, "max_age": null, "note": "Professional esports age requirements"}}',
'{"open": {"required": false, "mixed_teams": true, "note": "Gender not typically segregated in esports"}}',
'{"iron_bronze": {"rank_range": ["Iron", "Bronze"], "description": "New to ranked play"}, "silver_gold": {"rank_range": ["Silver", "Gold"], "description": "Intermediate players"}, "platinum_diamond": {"rank_range": ["Platinum", "Diamond"], "description": "Advanced players"}, "master_challenger": {"rank_range": ["Master", "Grandmaster", "Challenger"], "description": "Elite competitive players"}}'),

-- ACADEMIC COMPETITIONS

-- QUIZ BOWL
((SELECT id FROM sport_options WHERE sport_name LIKE '%Quiz Bowl%' OR sport_category LIKE '%Academic%' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 6, "default_type": "academic_level"}',
'{"academic_level": true, "team_based": true, "knowledge_based": true}',
'{"elementary": {"grade_range": "K-5", "team_size": 4}, "middle_school": {"grade_range": "6-8", "team_size": 4}, "high_school": {"grade_range": "9-12", "team_size": 4}, "college": {"level": "undergraduate", "team_size": 4}, "adult": {"level": "post_college", "team_size": 4}}',
'{"mixed": {"required": true, "gender_ratio": "flexible", "note": "Academic competitions typically mixed gender"}}',
'{"novice": {"experience": "first_year", "description": "New to competitive quiz bowl"}, "JV": {"experience": "developing", "description": "Junior varsity level"}, "varsity": {"experience": "experienced", "description": "Varsity level competition"}, "open": {"experience": "any", "description": "Open to all skill levels"}}'),

-- COMBAT SPORTS

-- WRESTLING
((SELECT id FROM sport_options WHERE sport_name = 'Wrestling' LIMIT 1),
'{"min_divisions": 1, "max_divisions": 30, "default_type": "weight_age_experience"}',
'{"weight_classes": true, "age_groups": true, "experience_level": true}',
'{"youth": {"U8": {"max_age": 8, "weight_classes": "modified"}, "U10": {"max_age": 10, "weight_classes": "youth"}, "U12": {"max_age": 12, "weight_classes": "youth"}, "U14": {"max_age": 14, "weight_classes": "cadet"}, "U16": {"max_age": 16, "weight_classes": "junior"}, "U18": {"max_age": 18, "weight_classes": "junior"}}, "adult": {"Open": {"min_age": 18, "weight_classes": "senior"}, "Masters": {"age_groups": ["35-39", "40-44", "45-49", "50+"]}}}',
'{"mens": {"required": true, "separate_divisions": true}, "womens": {"required": true, "separate_divisions": true}}',
'{"novice": {"experience": "0-1_years", "description": "New wrestlers"}, "intermediate": {"experience": "2-4_years", "description": "Developing wrestlers"}, "advanced": {"experience": "5+_years", "description": "Experienced competitive wrestlers"}}');

-- ===================================================================
-- VERIFICATION QUERIES
-- ===================================================================

-- Check what we just created
SELECT 
    so.sport_name,
    sdr.required_divisions,
    sdr.age_group_rules->>'youth' as youth_divisions,
    sdr.gender_rules,
    sdr.performance_standards
FROM sport_division_rules sdr
JOIN sport_options so ON sdr.sport_id = so.id
ORDER BY so.sport_name;

-- Count total rules created
SELECT COUNT(*) as total_sport_rules FROM sport_division_rules;