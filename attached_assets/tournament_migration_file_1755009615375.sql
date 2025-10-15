-- Tournament Structures Migration SQL
-- Run this file to populate your tournament_structures table with 30 professional formats

INSERT INTO tournament_structures (format_name, format_description, format_type, applicable_sports, format_sort_order) VALUES
('Single Elimination', 'Traditional bracket where one loss eliminates team/player. Fast, decisive tournament format perfect for time-constrained events.', 'Universal', 'all', 1),
('Double Elimination', 'Bracket with winners and losers brackets - teams get second chance after first loss. More games, fairer outcomes.', 'Universal', 'all', 2),
('Round Robin', 'Every team/player competes against every other participant - comprehensive competition format. Best for determining true rankings.', 'Universal', 'all', 3),
('Pool Play → Single Elimination', 'Groups compete in round robin pools, then top teams advance to single elimination bracket. Balances fairness with efficiency.', 'Hybrid', 'all', 4),
('Pool Play → Double Elimination', 'Pool play followed by double elimination bracket for advanced teams. Maximum fairness with second chances.', 'Hybrid', 'all', 5),
('Swiss System → Single Elimination', 'Swiss rounds to determine seeding, followed by single elimination playoffs. Popular in chess and esports.', 'Hybrid', 'chess,esports,academic', 6),
('Swiss System', 'Teams paired based on similar records. No elimination, predetermined number of rounds. Excellent for skill-based matching.', 'League', 'chess,esports,academic', 7),
('Round Robin League', 'Extended round robin with multiple rounds against same opponents. Season-style format.', 'League', 'team_sports', 8),
('Divisional League', 'Teams divided into skill-based divisions, round robin within divisions, playoffs between division winners.', 'League', 'team_sports', 9),
('Seeded Bracket', 'Single or double elimination with teams ranked and positioned based on skill/ranking. Prevents early matchups of top teams.', 'Elimination', 'all', 10),
('Step Ladder', 'Lower-seeded teams must climb the ladder by defeating higher seeds sequentially. Creates dramatic progression.', 'Elimination', 'individual_sports,combat_sports', 11),
('King of the Hill', 'One champion faces all challengers sequentially. Champion retains position until defeated. Classic format for continuous challenge.', 'Elimination', 'individual_sports,combat_sports', 12),
('Progressive Elimination', 'Participants eliminated based on cumulative performance across multiple rounds. Gradual elimination based on consistency.', 'Elimination', 'track_field,swimming,individual_sports', 13),
('Gauntlet', 'One team/player faces a series of increasingly difficult opponents. Ultimate endurance test.', 'Specialized', 'combat_sports,esports', 14),
('Survivor', 'Teams eliminated one by one based on performance in challenges. Reality TV style competition.', 'Specialized', 'multi_sport,team_building', 15),
('Battle Royale', 'Large field starts together, participants eliminated until one remains. Popular in gaming tournaments.', 'Specialized', 'esports,individual_sports', 16),
('Multi-Event Competition', 'Participants compete in multiple events with cumulative scoring. Decathlon/heptathlon style.', 'Specialized', 'track_field,multi_sport', 17),
('Relay Championship', 'Team-based relay events with specialized handoff rules and timing.', 'Specialized', 'track_field,swimming', 18),
('Field Event Meet', 'Distance/height based competition with multiple attempts and progressive standards.', 'Specialized', 'track_field', 19),
('Best of Series', 'Teams play multiple games, first to win majority advances. Baseball/basketball playoff style.', 'Series', 'team_sports', 20),
('Aggregate Score', 'Teams play multiple games, total score across all games determines winner. Soccer home/away legs.', 'Series', 'team_sports', 21),
('Sudden Death', 'Tied games continue until someone scores. High drama elimination format.', 'Elimination', 'team_sports', 22),
('Qualification → Championship', 'Initial qualification round determines championship bracket seeding. Two distinct phases.', 'Multi-Stage', 'all', 23),
('Group Stage → Knockout', 'Round robin groups followed by single elimination knockout rounds. World Cup style.', 'Multi-Stage', 'team_sports', 24),
('Regular Season → Playoffs', 'Extended regular season determines playoff seeding, then elimination rounds.', 'Multi-Stage', 'team_sports,league', 25),
('Draft Tournament', 'Teams/players drafted by captains, then compete in chosen format. Fantasy sports style.', 'Specialty', 'all', 26),
('Handicap System', 'Players receive advantages/disadvantages based on skill level to level playing field.', 'Specialty', 'individual_sports,golf', 27),
('Time Trial Championship', 'Individual time-based competition with qualifying and final rounds.', 'Specialty', 'individual_sports,racing', 28),
('Quiz Bowl', 'Team-based question/answer format with specialized scoring and timing rules.', 'Specialized', 'academic', 29),
('Debate Tournament', 'Structured argumentative competition with judge scoring and advancement rules.', 'Specialized', 'academic', 30);

-- Verification query - run this after the INSERT to confirm it worked
SELECT 
    format_name,
    format_type,
    format_sort_order
FROM tournament_structures 
ORDER BY format_sort_order;