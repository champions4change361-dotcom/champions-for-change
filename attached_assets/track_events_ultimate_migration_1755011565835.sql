-- ===================================================================
-- ULTIMATE TRACK & FIELD EVENTS MIGRATION
-- Creating the most sophisticated track event system on the planet!
-- RAMMING SPEED IMPLEMENTATION 🚀
-- ===================================================================

-- TRACK EVENTS (Running Events - Time Based)
INSERT INTO track_events (event_name, event_category, distance_meters, measurement_type, max_attempts, uses_lanes, uses_stagger, uses_hurdles, hurdle_height_men, hurdle_height_women, hurdle_count, implements_used, wind_legal_distance, qualifying_standards, equipment_specs, scoring_method, ribbon_places, age_restrictions, gender_specific) VALUES

-- SPRINTS (100m family)
('100 Meter Dash', 'Track', 100, 'time', 1, true, false, false, null, null, 0, '[]', 100, '{"high_school_boys": "11.50", "high_school_girls": "13.00", "college_men": "10.80", "college_women": "12.30", "open_men": "10.50", "open_women": "12.00"}', '{"lanes": 8, "blocks": "required", "wind_gauge": "required"}', 'time_ascending', 8, '{"youth_minimum": 8}', false),

('200 Meter Dash', 'Track', 200, 'time', 1, true, true, false, null, null, 0, '[]', 200, '{"high_school_boys": "23.50", "high_school_girls": "26.50", "college_men": "22.00", "college_women": "24.50", "open_men": "21.50", "open_women": "24.00"}', '{"lanes": 8, "blocks": "required", "stagger": "calculated", "wind_gauge": "required"}', 'time_ascending', 8, '{"youth_minimum": 10}', false),

('400 Meter Dash', 'Track', 400, 'time', 1, true, true, false, null, null, 0, '[]', null, '{"high_school_boys": "52.00", "high_school_girls": "60.00", "college_men": "48.50", "college_women": "55.00", "open_men": "47.00", "open_women": "53.00"}', '{"lanes": 8, "blocks": "required", "stagger": "calculated"}', 'time_ascending', 8, '{"youth_minimum": 12}', false),

-- HURDLES
('110 Meter Hurdles', 'Track', 110, 'time', 1, true, false, true, 1.067, null, 10, '[]', 110, '{"high_school_boys": "16.00", "college_men": "14.50", "open_men": "14.00"}', '{"lanes": 8, "hurdle_height": "42_inches", "hurdle_spacing": "9.14m", "blocks": "required", "wind_gauge": "required"}', 'time_ascending', 8, '{"youth_minimum": 13}', true),

('100 Meter Hurdles', 'Track', 100, 'time', 1, true, false, true, null, 0.838, 10, '[]', 100, '{"high_school_girls": "16.50", "college_women": "14.00", "open_women": "13.50"}', '{"lanes": 8, "hurdle_height": "33_inches", "hurdle_spacing": "8.5m", "blocks": "required", "wind_gauge": "required"}', 'time_ascending', 8, '{"youth_minimum": 13}', true),

('300 Meter Hurdles', 'Track', 300, 'time', 1, true, true, true, 0.914, 0.762, 8, '[]', null, '{"high_school_boys": "41.00", "high_school_girls": "47.00"}', '{"lanes": 8, "hurdle_height_men": "36_inches", "hurdle_height_women": "30_inches", "stagger": "calculated"}', 'time_ascending', 8, '{"youth_minimum": 14}', false),

('400 Meter Hurdles', 'Track', 400, 'time', 1, true, true, true, 0.914, 0.762, 10, '[]', null, '{"college_men": "52.00", "college_women": "58.00", "open_men": "50.00", "open_women": "56.00"}', '{"lanes": 8, "hurdle_height_men": "36_inches", "hurdle_height_women": "30_inches", "stagger": "calculated"}', 'time_ascending', 8, '{"youth_minimum": 16}', false),

-- MIDDLE DISTANCE
('800 Meter Run', 'Track', 800, 'time', 1, true, true, false, null, null, 0, '[]', null, '{"high_school_boys": "2:05.00", "high_school_girls": "2:25.00", "college_men": "1:55.00", "college_women": "2:15.00", "open_men": "1:50.00", "open_women": "2:10.00"}', '{"lanes": 8, "break_after": "100m", "stagger": "calculated"}', 'time_ascending', 8, '{"youth_minimum": 10}', false),

('1500 Meter Run', 'Track', 1500, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"high_school_boys": "4:15.00", "high_school_girls": "5:00.00", "college_men": "3:55.00", "college_women": "4:30.00", "open_men": "3:45.00", "open_women": "4:20.00"}', '{"waterfall_start": true, "lanes": "optional"}', 'time_ascending', 8, '{"youth_minimum": 12}', false),

('1600 Meter Run', 'Track', 1600, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"high_school_boys": "4:30.00", "high_school_girls": "5:20.00"}', '{"waterfall_start": true, "imperial_mile": true}', 'time_ascending', 8, '{"youth_minimum": 12}', false),

-- DISTANCE
('3000 Meter Run', 'Track', 3000, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"high_school_boys": "9:30.00", "high_school_girls": "11:00.00", "college_men": "8:30.00", "college_women": "10:00.00"}', '{"waterfall_start": true, "laps": 7.5}', 'time_ascending', 8, '{"youth_minimum": 14}', false),

('3200 Meter Run', 'Track', 3200, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"high_school_boys": "10:00.00", "high_school_girls": "11:30.00"}', '{"waterfall_start": true, "laps": 8, "imperial_2_mile": true}', 'time_ascending', 8, '{"youth_minimum": 14}', false),

('5000 Meter Run', 'Track', 5000, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"college_men": "15:00.00", "college_women": "17:30.00", "open_men": "14:30.00", "open_women": "16:30.00"}', '{"waterfall_start": true, "laps": 12.5}', 'time_ascending', 8, '{"youth_minimum": 16}', false),

('10000 Meter Run', 'Track', 10000, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"college_men": "31:00.00", "college_women": "36:00.00", "open_men": "29:30.00", "open_women": "34:00.00"}', '{"waterfall_start": true, "laps": 25}', 'time_ascending', 8, '{"youth_minimum": 18}', false),

-- STEEPLECHASE
('3000 Meter Steeplechase', 'Track', 3000, 'time', 1, false, false, true, 0.914, 0.762, 28, '["water_jump"]', null, '{"college_men": "9:30.00", "college_women": "11:00.00", "open_men": "9:00.00", "open_women": "10:30.00"}', '{"barriers": 28, "water_jumps": 7, "barrier_height_men": "36_inches", "barrier_height_women": "30_inches"}', 'time_ascending', 8, '{"youth_minimum": 16}', false),

-- RELAYS
('4x100 Meter Relay', 'Relay', 400, 'time', 1, true, true, false, null, null, 0, '["baton"]', 400, '{"high_school_boys": "44.00", "high_school_girls": "50.00", "college_men": "40.50", "college_women": "45.00", "open_men": "39.50", "open_women": "43.50"}', '{"exchange_zones": 4, "zone_length": "20m", "baton_required": true, "team_size": 4}', 'time_ascending', 8, '{"youth_minimum": 10}', false),

('4x200 Meter Relay', 'Relay', 800, 'time', 1, true, true, false, null, null, 0, '["baton"]', null, '{"high_school": "1:35.00", "college": "1:28.00", "open": "1:25.00"}', '{"exchange_zones": 4, "zone_length": "20m", "baton_required": true, "team_size": 4}', 'time_ascending', 8, '{"youth_minimum": 12}', false),

('4x400 Meter Relay', 'Relay', 1600, 'time', 1, true, true, false, null, null, 0, '["baton"]', null, '{"high_school_boys": "3:30.00", "high_school_girls": "4:10.00", "college_men": "3:10.00", "college_women": "3:40.00", "open_men": "3:05.00", "open_women": "3:35.00"}', '{"exchange_zones": 3, "zone_length": "20m", "baton_required": true, "team_size": 4, "stagger": "calculated"}', 'time_ascending', 8, '{"youth_minimum": 14}', false),

('4x800 Meter Relay', 'Relay', 3200, 'time', 1, false, false, false, null, null, 0, '["baton"]', null, '{"high_school_boys": "8:30.00", "high_school_girls": "10:00.00", "college_men": "7:30.00", "college_women": "8:45.00"}', '{"exchange_zones": 3, "zone_length": "20m", "baton_required": true, "team_size": 4, "waterfall_start": true}', 'time_ascending', 8, '{"youth_minimum": 14}', false),

-- FIELD EVENTS (Throwing - Distance Based)
('Shot Put', 'Field', null, 'distance', 3, false, false, false, null, null, 0, '["shot_16lb_men", "shot_12lb_women", "shot_8.8lb_youth"]', null, '{"high_school_boys": "45_feet", "high_school_girls": "35_feet", "college_men": "55_feet", "college_women": "45_feet", "open_men": "60_feet", "open_women": "50_feet"}', '{"circle_diameter": "7_feet", "toe_board": "required", "sector_angle": "34.92_degrees", "implements": "certified_weights"}', 'distance_descending', 8, '{"youth_minimum": 8}', false),

('Discus Throw', 'Field', null, 'distance', 3, false, false, false, null, null, 0, '["discus_2kg_men", "discus_1kg_women", "discus_1.5kg_youth"]', null, '{"high_school_boys": "130_feet", "high_school_girls": "100_feet", "college_men": "150_feet", "college_women": "130_feet", "open_men": "180_feet", "open_women": "160_feet"}', '{"circle_diameter": "8.2_feet", "cage_required": true, "sector_angle": "34.92_degrees", "implements": "certified_weights"}', 'distance_descending', 8, '{"youth_minimum": 10}', false),

('Hammer Throw', 'Field', null, 'distance', 3, false, false, false, null, null, 0, '["hammer_16lb_men", "hammer_8.8lb_women", "hammer_12lb_youth"]', null, '{"high_school_boys": "150_feet", "high_school_girls": "120_feet", "college_men": "190_feet", "college_women": "160_feet", "open_men": "220_feet", "open_women": "190_feet"}', '{"circle_diameter": "7_feet", "cage_required": true, "sector_angle": "34.92_degrees", "implements": "certified_weights", "safety_cage": "full_enclosure"}', 'distance_descending', 8, '{"youth_minimum": 14}', false),

('Javelin Throw', 'Field', null, 'distance', 3, false, false, false, null, null, 0, '["javelin_800g_men", "javelin_600g_women", "javelin_700g_youth"]', null, '{"high_school_boys": "150_feet", "high_school_girls": "110_feet", "college_men": "190_feet", "college_women": "140_feet", "open_men": "220_feet", "open_women": "170_feet"}', '{"runway_length": "120_feet", "runway_width": "13_feet", "sector_angle": "28.96_degrees", "implements": "certified_specifications"}', 'distance_descending', 8, '{"youth_minimum": 12}', false),

-- FIELD EVENTS (Jumping - Height/Distance Based)
('High Jump', 'Field', null, 'height', 3, false, false, false, null, null, 0, '["crossbar", "standards", "landing_mat"]', null, '{"high_school_boys": "6_feet", "high_school_girls": "5_feet", "college_men": "6_feet_8_inches", "college_women": "5_feet_6_inches", "open_men": "7_feet", "open_women": "6_feet"}', '{"approach_unlimited": true, "bar_progression": "standard", "landing_mat": "required", "standards": "IAAF_certified"}', 'height_descending', 8, '{"youth_minimum": 8}', false),

('Pole Vault', 'Field', null, 'height', 3, false, false, false, null, null, 0, '["pole", "crossbar", "standards", "landing_mat"]', null, '{"high_school_boys": "12_feet", "high_school_girls": "9_feet", "college_men": "16_feet", "college_women": "12_feet", "open_men": "18_feet", "open_women": "14_feet"}', '{"runway_length": "130_feet", "box_specifications": "IAAF", "landing_mat": "required", "pole_certification": "required"}', 'height_descending', 8, '{"youth_minimum": 12}', false),

('Long Jump', 'Field', null, 'distance', 3, false, false, false, null, null, 0, '["takeoff_board", "sand_pit"]', null, '{"high_school_boys": "20_feet", "high_school_girls": "16_feet", "college_men": "23_feet", "college_women": "19_feet", "open_men": "25_feet", "open_women": "21_feet"}', '{"runway_length": "130_feet", "runway_width": "4_feet", "takeoff_board": "required", "sand_pit": "minimum_9_meters"}', 'distance_descending', 8, '{"youth_minimum": 8}', false),

('Triple Jump', 'Field', null, 'distance', 3, false, false, false, null, null, 0, '["takeoff_board", "sand_pit"]', null, '{"high_school_boys": "42_feet", "high_school_girls": "34_feet", "college_men": "48_feet", "college_women": "40_feet", "open_men": "52_feet", "open_women": "44_feet"}', '{"runway_length": "130_feet", "runway_width": "4_feet", "takeoff_board": "required", "sand_pit": "minimum_9_meters", "phases": "hop_step_jump"}', 'distance_descending', 8, '{"youth_minimum": 14}', false),

-- COMBINED EVENTS
('Decathlon', 'Combined', null, 'points', 10, false, false, false, null, null, 0, '["various"]', null, '{"college_men": "6000_points", "open_men": "7000_points"}', '{"events": ["100m", "long_jump", "shot_put", "high_jump", "400m", "110m_hurdles", "discus", "pole_vault", "javelin", "1500m"], "scoring": "IAAF_tables", "days": 2}', 'points_descending', 8, '{"youth_minimum": 16}', true),

('Heptathlon', 'Combined', null, 'points', 7, false, false, false, null, null, 0, '["various"]', null, '{"high_school_girls": "4000_points", "college_women": "4500_points", "open_women": "5500_points"}', '{"events": ["100m_hurdles", "high_jump", "shot_put", "200m", "long_jump", "javelin", "800m"], "scoring": "IAAF_tables", "days": 2}', 'points_descending', 8, '{"youth_minimum": 16}', true),

-- RACE WALKING
('5000 Meter Race Walk', 'Track', 5000, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"high_school": "25:00.00", "college": "22:00.00", "open": "20:00.00"}', '{"judges_required": 3, "technique": "race_walk_rules", "warnings": "3_strike_system"}', 'time_ascending', 8, '{"youth_minimum": 14}', false),

('10000 Meter Race Walk', 'Track', 10000, 'time', 1, false, false, false, null, null, 0, '[]', null, '{"college": "45:00.00", "open_men": "42:00.00", "open_women": "48:00.00"}', '{"judges_required": 6, "technique": "race_walk_rules", "warnings": "3_strike_system"}', 'time_ascending', 8, '{"youth_minimum": 16}', false);

-- ===================================================================
-- SPECIALIZED TRACK EVENT CONFIGURATIONS
-- Add event-specific rules and timing systems
-- ===================================================================

-- Create table for event timing configurations
CREATE TABLE IF NOT EXISTS track_event_timing (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    track_event_id VARCHAR REFERENCES track_events(id),
    timing_method VARCHAR NOT NULL, -- manual, FAT, electronic
    precision_level VARCHAR NOT NULL, -- tenth, hundredth, thousandth
    wind_measurement BOOLEAN DEFAULT false,
    photo_finish BOOLEAN DEFAULT false,
    reaction_time_tracking BOOLEAN DEFAULT false,
    intermediate_splits JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Populate timing configurations
INSERT INTO track_event_timing (track_event_id, timing_method, precision_level, wind_measurement, photo_finish, reaction_time_tracking, intermediate_splits)
SELECT 
    te.id,
    CASE 
        WHEN te.distance_meters <= 400 THEN 'FAT'
        WHEN te.distance_meters <= 1600 THEN 'electronic'
        ELSE 'manual'
    END,
    CASE 
        WHEN te.distance_meters <= 400 THEN 'hundredth'
        WHEN te.distance_meters <= 800 THEN 'hundredth'
        ELSE 'tenth'
    END,
    CASE WHEN te.wind_legal_distance IS NOT NULL THEN true ELSE false END,
    CASE WHEN te.distance_meters <= 800 THEN true ELSE false END,
    CASE WHEN te.distance_meters <= 400 THEN true ELSE false END,
    CASE 
        WHEN te.distance_meters = 800 THEN '{"splits": ["400m"]}'
        WHEN te.distance_meters = 1500 THEN '{"splits": ["400m", "800m", "1200m"]}'
        WHEN te.distance_meters = 1600 THEN '{"splits": ["400m", "800m", "1200m"]}'
        WHEN te.distance_meters >= 3000 THEN '{"splits": ["1000m", "2000m"]}'
        ELSE '{}'
    END
FROM track_events te;

-- ===================================================================
-- VERIFICATION AND UTILITY QUERIES
-- ===================================================================

-- See all track events by category
SELECT 
    event_category,
    COUNT(*) as event_count,
    STRING_AGG(event_name, ', ') as events
FROM track_events 
GROUP BY event_category
ORDER BY event_category;

-- Check total events created
SELECT COUNT(*) as total_track_events FROM track_events;

-- Show events with their equipment and standards
SELECT 
    event_name,
    event_category,
    measurement_type,
    max_attempts,
    implements_used,
    qualifying_standards->>'open_men' as men_standard,
    qualifying_standards->>'open_women' as women_standard
FROM track_events 
ORDER BY event_category, event_name;