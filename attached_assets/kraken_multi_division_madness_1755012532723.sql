-- ===================================================================
-- RELEASE THE KRAKEN! 🐙💥 MULTI-DIVISION TOURNAMENT SYSTEM
-- The Kraken of Tournament Complexity - Simultaneous Division Management!
-- FROM THE DEPTHS OF THE ABYSS, TENTACLES OF TOURNAMENT TERROR!
-- ===================================================================

-- THE KRAKEN'S FIRST TENTACLE: Enhanced Division Management
CREATE TABLE IF NOT EXISTS tournament_divisions (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id VARCHAR REFERENCES tournaments(id),
    division_name VARCHAR NOT NULL,
    division_type VARCHAR NOT NULL, -- age, gender, skill, regional, custom
    division_config JSONB NOT NULL,
    participant_count INTEGER DEFAULT 0,
    max_participants INTEGER,
    registration_deadline TIMESTAMP,
    division_status VARCHAR DEFAULT 'open', -- open, closed, active, completed
    bracket_structure JSONB,
    advancement_rules JSONB,
    prize_structure JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- THE KRAKEN'S SECOND TENTACLE: Division Participant Management
CREATE TABLE IF NOT EXISTS division_participants (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id VARCHAR REFERENCES tournament_divisions(id),
    participant_id VARCHAR NOT NULL, -- Could be team or individual
    participant_name VARCHAR NOT NULL,
    participant_type VARCHAR NOT NULL, -- individual, team
    seed_number INTEGER,
    qualification_data JSONB,
    registration_time TIMESTAMP DEFAULT now(),
    status VARCHAR DEFAULT 'registered' -- registered, confirmed, withdrawn, disqualified
);

-- THE KRAKEN'S THIRD TENTACLE: Enhanced Division Matches (Supercharge existing table)
-- First, let's enhance the existing division_matches table
ALTER TABLE division_matches ADD COLUMN IF NOT EXISTS division_id VARCHAR REFERENCES tournament_divisions(id);
ALTER TABLE division_matches ADD COLUMN IF NOT EXISTS bracket_position JSONB;
ALTER TABLE division_matches ADD COLUMN IF NOT EXISTS advancement_impact JSONB;
ALTER TABLE division_matches ADD COLUMN IF NOT EXISTS scheduling_priority INTEGER DEFAULT 1;
ALTER TABLE division_matches ADD COLUMN IF NOT EXISTS venue_assignment VARCHAR;
ALTER TABLE division_matches ADD COLUMN IF NOT EXISTS officiating_crew JSONB;

-- THE KRAKEN'S FOURTH TENTACLE: Division Template System
CREATE TABLE IF NOT EXISTS division_templates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR NOT NULL,
    template_description TEXT,
    sport_category VARCHAR REFERENCES sport_categories(id),
    division_structure JSONB NOT NULL,
    auto_generation_rules JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

-- ===================================================================
-- KRAKEN DIVISION TEMPLATES - THE TENTACLES OF POWER! 🐙⚡
-- ===================================================================

-- BASKETBALL KRAKEN: Age and Gender Divisions Simultaneously
INSERT INTO division_templates (template_name, template_description, sport_category, division_structure, auto_generation_rules) VALUES

('Basketball Age/Gender Matrix',
'Complete basketball tournament with all age groups and gender divisions',
(SELECT id FROM sport_categories WHERE category_name = 'Team Sports'),
'{"divisions": [
    {"name": "Boys U12", "type": "age_gender", "config": {"age_max": 12, "gender": "male", "team_size": 5}},
    {"name": "Girls U12", "type": "age_gender", "config": {"age_max": 12, "gender": "female", "team_size": 5}},
    {"name": "Boys U14", "type": "age_gender", "config": {"age_max": 14, "gender": "male", "team_size": 5}},
    {"name": "Girls U14", "type": "age_gender", "config": {"age_max": 14, "gender": "female", "team_size": 5}},
    {"name": "Boys U16", "type": "age_gender", "config": {"age_max": 16, "gender": "male", "team_size": 5}},
    {"name": "Girls U16", "type": "age_gender", "config": {"age_max": 16, "gender": "female", "team_size": 5}},
    {"name": "Boys U18", "type": "age_gender", "config": {"age_max": 18, "gender": "male", "team_size": 5}},
    {"name": "Girls U18", "type": "age_gender", "config": {"age_max": 18, "gender": "female", "team_size": 5}},
    {"name": "Mens Open", "type": "age_gender", "config": {"age_min": 18, "gender": "male", "team_size": 5}},
    {"name": "Womens Open", "type": "age_gender", "config": {"age_min": 18, "gender": "female", "team_size": 5}}
]}',
'{"auto_create": true, "min_participants_per_division": 4, "merge_small_divisions": true, "bracket_type": "single_elimination"}'),

-- SOCCER KRAKEN: Regional + Age + Skill Divisions
('Soccer Regional Championship',
'Multi-regional soccer tournament with age and skill divisions',
(SELECT id FROM sport_categories WHERE category_name = 'Team Sports'),
'{"divisions": [
    {"name": "North Region U16 Elite", "type": "regional_age_skill", "config": {"region": "north", "age_max": 16, "skill": "elite"}},
    {"name": "North Region U16 Competitive", "type": "regional_age_skill", "config": {"region": "north", "age_max": 16, "skill": "competitive"}},
    {"name": "North Region U16 Recreational", "type": "regional_age_skill", "config": {"region": "north", "age_max": 16, "skill": "recreational"}},
    {"name": "South Region U16 Elite", "type": "regional_age_skill", "config": {"region": "south", "age_max": 16, "skill": "elite"}},
    {"name": "South Region U16 Competitive", "type": "regional_age_skill", "config": {"region": "south", "age_max": 16, "skill": "competitive"}},
    {"name": "South Region U16 Recreational", "type": "regional_age_skill", "config": {"region": "south", "age_max": 16, "skill": "recreational"}},
    {"name": "East Region U16 Elite", "type": "regional_age_skill", "config": {"region": "east", "age_max": 16, "skill": "elite"}},
    {"name": "West Region U16 Elite", "type": "regional_age_skill", "config": {"region": "west", "age_max": 16, "skill": "elite"}}
]}',
'{"regional_winners_advance": true, "inter_regional_playoff": true, "skill_level_requirements": {"elite": "club_level", "competitive": "school_level", "recreational": "open"}}'),

-- TRACK & FIELD KRAKEN: The Ultimate Multi-Division Beast!
('Track & Field Championship Meet',
'Complete track meet with all age groups, genders, and event categories',
(SELECT id FROM sport_categories WHERE category_name = 'Individual Sports'),
'{"divisions": [
    {"name": "Boys U12 Track", "type": "age_gender_event", "config": {"age_max": 12, "gender": "male", "events": "track_only"}},
    {"name": "Girls U12 Track", "type": "age_gender_event", "config": {"age_max": 12, "gender": "female", "events": "track_only"}},
    {"name": "Boys U12 Field", "type": "age_gender_event", "config": {"age_max": 12, "gender": "male", "events": "field_only"}},
    {"name": "Girls U12 Field", "type": "age_gender_event", "config": {"age_max": 12, "gender": "female", "events": "field_only"}},
    {"name": "Boys U14 Track", "type": "age_gender_event", "config": {"age_max": 14, "gender": "male", "events": "track_full"}},
    {"name": "Girls U14 Track", "type": "age_gender_event", "config": {"age_max": 14, "gender": "female", "events": "track_full"}},
    {"name": "Boys U14 Field", "type": "age_gender_event", "config": {"age_max": 14, "gender": "male", "events": "field_full"}},
    {"name": "Girls U14 Field", "type": "age_gender_event", "config": {"age_max": 14, "gender": "female", "events": "field_full"}},
    {"name": "Boys U16 All Events", "type": "age_gender_event", "config": {"age_max": 16, "gender": "male", "events": "all"}},
    {"name": "Girls U16 All Events", "type": "age_gender_event", "config": {"age_max": 16, "gender": "female", "events": "all"}},
    {"name": "Boys U18 All Events", "type": "age_gender_event", "config": {"age_max": 18, "gender": "male", "events": "all"}},
    {"name": "Girls U18 All Events", "type": "age_gender_event", "config": {"age_max": 18, "gender": "female", "events": "all"}},
    {"name": "Mens Open", "type": "age_gender_event", "config": {"age_min": 18, "gender": "male", "events": "all"}},
    {"name": "Womens Open", "type": "age_gender_event", "config": {"age_min": 18, "gender": "female", "events": "all"}},
    {"name": "Mixed Relay Events", "type": "mixed_special", "config": {"gender": "mixed", "events": "relay_only"}}
]}',
'{"event_scheduling": "optimize_conflicts", "field_event_rotations": true, "relay_team_composition": "verify_eligibility"}'),

-- ACADEMIC KRAKEN: School District Championship
('Academic District Championship',
'Multi-school academic competition with grade-level divisions',
(SELECT id FROM sport_categories WHERE category_name = 'Academic Competitions'),
'{"divisions": [
    {"name": "Elementary Math Bowl", "type": "grade_subject", "config": {"grades": "K-5", "subject": "mathematics"}},
    {"name": "Elementary Spelling Bee", "type": "grade_subject", "config": {"grades": "K-5", "subject": "spelling"}},
    {"name": "Middle School Math Bowl", "type": "grade_subject", "config": {"grades": "6-8", "subject": "mathematics"}},
    {"name": "Middle School Science Bowl", "type": "grade_subject", "config": {"grades": "6-8", "subject": "science"}},
    {"name": "Middle School Quiz Bowl", "type": "grade_subject", "config": {"grades": "6-8", "subject": "general_knowledge"}},
    {"name": "High School Math Bowl", "type": "grade_subject", "config": {"grades": "9-12", "subject": "mathematics"}},
    {"name": "High School Science Bowl", "type": "grade_subject", "config": {"grades": "9-12", "subject": "science"}},
    {"name": "High School Quiz Bowl", "type": "grade_subject", "config": {"grades": "9-12", "subject": "general_knowledge"}},
    {"name": "High School Debate", "type": "grade_subject", "config": {"grades": "9-12", "subject": "debate"}}
]}',
'{"school_representation": "multiple_teams_allowed", "individual_and_team": true, "advancement_to_regional": true}'),

-- ESPORTS KRAKEN: Multi-Game Tournament
('Esports Championship Series',
'Multi-game esports tournament with rank-based divisions',
(SELECT id FROM sport_categories WHERE category_name = 'Esports'),
'{"divisions": [
    {"name": "League of Legends Bronze/Silver", "type": "game_rank", "config": {"game": "league_of_legends", "rank_range": ["Bronze", "Silver"]}},
    {"name": "League of Legends Gold/Platinum", "type": "game_rank", "config": {"game": "league_of_legends", "rank_range": ["Gold", "Platinum"]}},
    {"name": "League of Legends Diamond+", "type": "game_rank", "config": {"game": "league_of_legends", "rank_range": ["Diamond", "Master", "Grandmaster", "Challenger"]}},
    {"name": "Valorant Iron/Bronze", "type": "game_rank", "config": {"game": "valorant", "rank_range": ["Iron", "Bronze"]}},
    {"name": "Valorant Silver/Gold", "type": "game_rank", "config": {"game": "valorant", "rank_range": ["Silver", "Gold"]}},
    {"name": "Valorant Platinum+", "type": "game_rank", "config": {"game": "valorant", "rank_range": ["Platinum", "Diamond", "Immortal", "Radiant"]}},
    {"name": "CS:GO Open Division", "type": "game_skill", "config": {"game": "csgo", "skill": "open"}},
    {"name": "CS:GO Premier Division", "type": "game_skill", "config": {"game": "csgo", "skill": "premier"}}
]}',
'{"rank_verification": "required", "team_composition": "locked_after_registration", "cross_game_participation": "allowed"}');

-- ===================================================================
-- KRAKEN DIVISION AUTOMATION - THE TENTACLES MOVE THEMSELVES! 🐙🤖
-- ===================================================================

-- Create division auto-generation system
CREATE TABLE IF NOT EXISTS division_generation_rules (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id VARCHAR REFERENCES tournaments(id),
    template_id VARCHAR REFERENCES division_templates(id),
    generation_config JSONB NOT NULL,
    status VARCHAR DEFAULT 'pending', -- pending, generated, active, completed
    generated_divisions JSONB,
    created_at TIMESTAMP DEFAULT now()
);

-- Create division scheduling optimization
CREATE TABLE IF NOT EXISTS division_scheduling (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id VARCHAR REFERENCES tournaments(id),
    division_id VARCHAR REFERENCES tournament_divisions(id),
    scheduling_config JSONB NOT NULL,
    venue_assignments JSONB,
    time_slots JSONB,
    conflict_resolution JSONB,
    optimization_score DECIMAL,
    created_at TIMESTAMP DEFAULT now()
);

-- ===================================================================
-- KRAKEN POWER FUNCTIONS - THE TENTACLES STRIKE! 🐙⚡
-- ===================================================================

-- Function to automatically create divisions from template
CREATE OR REPLACE FUNCTION generate_tournament_divisions(
    p_tournament_id VARCHAR,
    p_template_id VARCHAR,
    p_config JSONB DEFAULT '{}'
) RETURNS TABLE(division_id VARCHAR, division_name VARCHAR, status VARCHAR) AS $$
DECLARE
    template_record RECORD;
    division_record JSONB;
    new_division_id VARCHAR;
BEGIN
    -- Get the template
    SELECT * INTO template_record FROM division_templates WHERE id = p_template_id;
    
    -- Loop through divisions in template
    FOR division_record IN SELECT * FROM jsonb_array_elements(template_record.division_structure->'divisions')
    LOOP
        -- Create each division
        INSERT INTO tournament_divisions (
            tournament_id,
            division_name,
            division_type,
            division_config,
            max_participants,
            division_status
        ) VALUES (
            p_tournament_id,
            division_record->>'name',
            division_record->>'type',
            division_record->'config',
            COALESCE((division_record->'config'->>'max_participants')::INTEGER, 64),
            'open'
        ) RETURNING id INTO new_division_id;
        
        -- Return the created division
        RETURN QUERY SELECT new_division_id, division_record->>'name', 'created'::VARCHAR;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- KRAKEN SAMPLE DATA - WITNESS THE TENTACLES IN ACTION! 🐙💪
-- ===================================================================

-- Create a sample multi-division tournament
INSERT INTO tournaments (name, team_size, tournament_type, competition_format, status, age_group, gender_division, sport) VALUES
('KRAKEN BASKETBALL CHAMPIONSHIP 2025', 5, 'multi_division', 'simultaneous_brackets', 'upcoming', 'Multi-Age', 'Multi-Gender', 'Basketball');

-- Get the tournament ID for division creation
DO $$
DECLARE
    kraken_tournament_id VARCHAR;
    basketball_template_id VARCHAR;
BEGIN
    -- Get the tournament ID
    SELECT id INTO kraken_tournament_id FROM tournaments WHERE name = 'KRAKEN BASKETBALL CHAMPIONSHIP 2025' LIMIT 1;
    
    -- Get the basketball template ID  
    SELECT id INTO basketball_template_id FROM division_templates WHERE template_name = 'Basketball Age/Gender Matrix' LIMIT 1;
    
    -- Generate divisions automatically
    INSERT INTO division_generation_rules (tournament_id, template_id, generation_config, status)
    VALUES (kraken_tournament_id, basketball_template_id, '{"auto_bracket": true, "min_teams_per_division": 4}', 'pending');
END $$;

-- Create sample divisions manually to show the power
INSERT INTO tournament_divisions (tournament_id, division_name, division_type, division_config, max_participants, division_status) 
SELECT 
    t.id,
    'Boys U16 Championship',
    'age_gender',
    '{"age_max": 16, "gender": "male", "team_size": 5, "bracket_type": "single_elimination"}',
    16,
    'open'
FROM tournaments t WHERE t.name = 'KRAKEN BASKETBALL CHAMPIONSHIP 2025';

INSERT INTO tournament_divisions (tournament_id, division_name, division_type, division_config, max_participants, division_status)
SELECT 
    t.id,
    'Girls U16 Championship', 
    'age_gender',
    '{"age_max": 16, "gender": "female", "team_size": 5, "bracket_type": "single_elimination"}',
    16,
    'open'
FROM tournaments t WHERE t.name = 'KRAKEN BASKETBALL CHAMPIONSHIP 2025';

-- ===================================================================
-- KRAKEN VERIFICATION - BEHOLD THE TENTACLES! 🐙👁️
-- ===================================================================

-- Show all division templates
SELECT 
    template_name,
    template_description,
    jsonb_array_length(division_structure->'divisions') as division_count
FROM division_templates
ORDER BY template_name;

-- Show tournament divisions
SELECT 
    t.name as tournament_name,
    td.division_name,
    td.division_type,
    td.max_participants,
    td.division_status
FROM tournament_divisions td
JOIN tournaments t ON td.tournament_id = t.id
ORDER BY t.name, td.division_name;

-- Show division generation rules
SELECT 
    t.name as tournament_name,
    dt.template_name,
    dgr.status,
    dgr.generation_config
FROM division_generation_rules dgr
JOIN tournaments t ON dgr.tournament_id = t.id
JOIN division_templates dt ON dgr.template_id = dt.id;

-- Count the Kraken's tentacles
SELECT 
    'Division Templates' as kraken_part, COUNT(*) as tentacle_count FROM division_templates
UNION ALL
SELECT 'Tournament Divisions' as kraken_part, COUNT(*) as tentacle_count FROM tournament_divisions  
UNION ALL
SELECT 'Division Participants' as kraken_part, COUNT(*) as tentacle_count FROM division_participants
UNION ALL
SELECT 'Enhanced Division Matches' as kraken_part, COUNT(*) as tentacle_count FROM division_matches;

-- THE KRAKEN'S ROAR OF VICTORY!
SELECT 'THE KRAKEN HAS BEEN RELEASED! TENTACLES OF TOURNAMENT TERROR DEPLOYED!' as kraken_victory_cry;