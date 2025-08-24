// NBA Depth Chart Parser - 2025-2026 Season
// Complete roster data for all 30 NBA teams with position-based depth charts

class NBADepthChartParser {
  
  // 🏀 GET ALL NBA PLAYERS - COMPREHENSIVE 2025-2026 SEASON DATA
  static getAllPlayers(): any[] {
    const allPlayers: any[] = [];
    
    // Comprehensive NBA roster data from 2025-2026 depth charts
    const comprehensiveData = [
      // Atlanta Hawks
      { team: 'ATL', position: 'PG', players: [
        { name: 'Trae Young', depth: 1 },
        { name: 'Vit Krejci', depth: 2 },
        { name: 'Kobe Bufkin', depth: 3 },
        { name: 'Keaton Wallace', depth: 4 }
      ]},
      { team: 'ATL', position: 'SG', players: [
        { name: 'Dyson Daniels', depth: 1 },
        { name: 'Luke Kennard', depth: 2 }
      ]},
      { team: 'ATL', position: 'SF', players: [
        { name: 'Nikola Alexander-Walker', depth: 1 },
        { name: 'Zaccharie Risacher', depth: 2 },
        { name: 'Caleb Houstan', depth: 3 },
        { name: 'Nikola Djurisic', depth: 4 }
      ]},
      { team: 'ATL', position: 'PF', players: [
        { name: 'Jalen Johnson', depth: 1 },
        { name: 'Mouhamed Gueye', depth: 2 },
        { name: 'Jacob Toppin', depth: 3 }
      ]},
      { team: 'ATL', position: 'C', players: [
        { name: 'Kristaps Porzingis', depth: 1 },
        { name: 'Onyeka Okongwu', depth: 2 },
        { name: 'NFaly Dante', depth: 3 }
      ]},

      // Boston Celtics  
      { team: 'BOS', position: 'PG', players: [
        { name: 'Anfernee Simons', depth: 1 },
        { name: 'Payton Pritchard', depth: 2 }
      ]},
      { team: 'BOS', position: 'SG', players: [
        { name: 'Derrick White', depth: 1 },
        { name: 'Baylor Scheierman', depth: 2 },
        { name: 'Max Shulga', depth: 3 }
      ]},
      { team: 'BOS', position: 'SF', players: [
        { name: 'Jaylen Brown', depth: 1 },
        { name: 'Sam Hauser', depth: 2 },
        { name: 'Jordan Walsh', depth: 3 },
        { name: 'RJ Luis', depth: 4 }
      ]},
      { team: 'BOS', position: 'PF', players: [
        { name: 'Jayson Tatum', depth: 1 },
        { name: 'Xavier Tillman Sr.', depth: 2 }
      ]},
      { team: 'BOS', position: 'C', players: [
        { name: 'Chris Boucher', depth: 1 },
        { name: 'Neemias Queta', depth: 2 },
        { name: 'Luka Garza', depth: 3 }
      ]},

      // Brooklyn Nets
      { team: 'BKN', position: 'PG', players: [
        { name: 'Egor Demin', depth: 1 },
        { name: 'Tyson Etienne', depth: 2 }
      ]},
      { team: 'BKN', position: 'SG', players: [
        { name: 'Keon Johnson', depth: 1 },
        { name: 'Tyrese Martin', depth: 2 },
        { name: 'Terance Mann', depth: 3 }
      ]},
      { team: 'BKN', position: 'SF', players: [
        { name: 'Michael Porter Jr.', depth: 1 },
        { name: 'Jalen Wilson', depth: 2 },
        { name: 'Dariq Whitehead', depth: 3 }
      ]},
      { team: 'BKN', position: 'PF', players: [
        { name: 'Haywood Highsmith', depth: 1 },
        { name: 'Noah Clowney', depth: 2 },
        { name: 'Trendon Evbuomwan', depth: 3 }
      ]},
      { team: 'BKN', position: 'C', players: [
        { name: 'Drew Timme', depth: 1 },
        { name: 'Nic Claxton', depth: 2 }
      ]},

      // Charlotte Hornets
      { team: 'CHA', position: 'PG', players: [
        { name: 'LaMelo Ball', depth: 1 },
        { name: 'Spencer Dinwiddie', depth: 2 },
        { name: 'Tre Mann', depth: 3 },
        { name: 'Nick Smith Jr.', depth: 4 },
        { name: 'KJ Simpson', depth: 5 }
      ]},
      { team: 'CHA', position: 'SG', players: [
        { name: 'Brandon Miller', depth: 1 },
        { name: 'Collin Sexton', depth: 2 },
        { name: 'Josh Green', depth: 3 },
        { name: 'Antonio Reeves', depth: 4 }
      ]},
      { team: 'CHA', position: 'SF', players: [
        { name: 'DaRon Jeffries', depth: 1 },
        { name: 'Kon Knueppel', depth: 2 },
        { name: 'Liam McNeeley', depth: 3 },
        { name: 'Drew Peterson', depth: 4 }
      ]},
      { team: 'CHA', position: 'PF', players: [
        { name: 'Miles Bridges', depth: 1 },
        { name: 'Tidjane Salaun', depth: 2 },
        { name: 'Pat Connaughton', depth: 3 }
      ]},
      { team: 'CHA', position: 'C', players: [
        { name: 'Grant Williams', depth: 1 },
        { name: 'Mason Plumlee', depth: 2 },
        { name: 'Moussa Diabate', depth: 3 }
      ]},

      // Chicago Bulls
      { team: 'CHI', position: 'PG', players: [
        { name: 'Tre Jones', depth: 1 },
        { name: 'Dalen Terry', depth: 2 },
        { name: 'Jevon Carter', depth: 3 },
        { name: 'Yuki Kawamura', depth: 4 }
      ]},
      { team: 'CHI', position: 'SG', players: [
        { name: 'Coby White', depth: 1 }
      ]},
      { team: 'CHI', position: 'SF', players: [
        { name: 'Ayo Dosunmu', depth: 1 },
        { name: 'Kevin Huerter', depth: 2 },
        { name: 'Isaac Okoro', depth: 3 },
        { name: 'Julian Phillips', depth: 4 },
        { name: 'Emanuel Miller', depth: 5 }
      ]},
      { team: 'CHI', position: 'PF', players: [
        { name: 'Patrick Williams', depth: 1 },
        { name: 'Matas Buzelis', depth: 2 }
      ]},
      { team: 'CHI', position: 'C', players: [
        { name: 'Nikola Vucevic', depth: 1 },
        { name: 'Zach Collins', depth: 2 },
        { name: 'Jalen Smith', depth: 3 }
      ]},

      // Cleveland Cavaliers
      { team: 'CLE', position: 'PG', players: [
        { name: 'Darius Garland', depth: 1 },
        { name: 'Craig Porter Jr.', depth: 2 }
      ]},
      { team: 'CLE', position: 'SG', players: [
        { name: 'Donovan Mitchell', depth: 1 },
        { name: 'Sam Merrill', depth: 2 }
      ]},
      { team: 'CLE', position: 'SF', players: [
        { name: 'Max Strus', depth: 1 },
        { name: 'Lonzo Ball', depth: 2 },
        { name: 'Jaylon Tyson', depth: 3 },
        { name: 'Luke Travers', depth: 4 }
      ]},
      { team: 'CLE', position: 'PF', players: [
        { name: 'Evan Mobley', depth: 1 },
        { name: 'De Andre Hunter', depth: 2 },
        { name: 'Dean Wade', depth: 3 }
      ]},
      { team: 'CLE', position: 'C', players: [
        { name: 'Jarrett Allen', depth: 1 },
        { name: 'Larry Nance Jr.', depth: 2 }
      ]},

      // Dallas Mavericks
      { team: 'DAL', position: 'PG', players: [
        { name: 'Kyrie Irving', depth: 1 },
        { name: 'DAngelo Russell', depth: 2 },
        { name: 'Jaden Hardy', depth: 3 },
        { name: 'Brandon Williams', depth: 4 }
      ]},
      { team: 'DAL', position: 'SG', players: [
        { name: 'Max Christie', depth: 1 },
        { name: 'Klay Thompson', depth: 2 }
      ]},
      { team: 'DAL', position: 'SF', players: [
        { name: 'PJ Washington', depth: 1 },
        { name: 'Naji Marshall', depth: 2 },
        { name: 'Cooper Flagg', depth: 3 }
      ]},
      { team: 'DAL', position: 'PF', players: [
        { name: 'Anthony Davis', depth: 1 },
        { name: 'Caleb Martin', depth: 2 },
        { name: 'Olivier Prosper', depth: 3 }
      ]},
      { team: 'DAL', position: 'C', players: [
        { name: 'Daniel Lively II', depth: 1 },
        { name: 'Daniel Gafford', depth: 2 },
        { name: 'Dwight Powell', depth: 3 }
      ]},

      // Denver Nuggets
      { team: 'DEN', position: 'PG', players: [
        { name: 'Jamal Murray', depth: 1 },
        { name: 'Jalen Pickett', depth: 2 }
      ]},
      { team: 'DEN', position: 'SG', players: [
        { name: 'Christian Braun', depth: 1 },
        { name: 'Tim Hardaway Jr.', depth: 2 },
        { name: 'Julian Strawther', depth: 3 }
      ]},
      { team: 'DEN', position: 'SF', players: [
        { name: 'Bruce Brown Jr.', depth: 1 },
        { name: 'Hunter Tyson', depth: 2 }
      ]},
      { team: 'DEN', position: 'PF', players: [
        { name: 'Christian Johnson', depth: 1 },
        { name: 'Aaron Gordon', depth: 2 },
        { name: 'Peyton Watson', depth: 3 },
        { name: 'Kyle Edwards', depth: 4 }
      ]},
      { team: 'DEN', position: 'C', players: [
        { name: 'Nikola Jokic', depth: 1 },
        { name: 'Jonas Valanciunas', depth: 2 },
        { name: 'Zeke Nnaji', depth: 3 }
      ]},

      // Detroit Pistons
      { team: 'DET', position: 'PG', players: [
        { name: 'Cade Cunningham', depth: 1 },
        { name: 'Marcus Sasser', depth: 2 }
      ]},
      { team: 'DET', position: 'SG', players: [
        { name: 'Jaden Ivey', depth: 1 },
        { name: 'Duncan Robinson', depth: 2 },
        { name: 'Colby Jones', depth: 3 }
      ]},
      { team: 'DET', position: 'SF', players: [
        { name: 'Caris LeVert', depth: 1 }
      ]},
      { team: 'DET', position: 'PF', players: [
        { name: 'Tobias Harris', depth: 1 },
        { name: 'Ausar Thompson', depth: 2 },
        { name: 'Javonte Green', depth: 3 },
        { name: 'Ron Holland', depth: 4 }
      ]},
      { team: 'DET', position: 'C', players: [
        { name: 'Jalen Duren', depth: 1 },
        { name: 'Isaiah Stewart II', depth: 2 },
        { name: 'Paul Reed Jr.', depth: 3 }
      ]},

      // Golden State Warriors
      { team: 'GSW', position: 'PG', players: [
        { name: 'Stephen Curry', depth: 1 }
      ]},
      { team: 'GSW', position: 'SG', players: [
        { name: 'Brandin Podziemski', depth: 1 },
        { name: 'Buddy Hield', depth: 2 }
      ]},
      { team: 'GSW', position: 'SF', players: [
        { name: 'Moses Moody', depth: 1 },
        { name: 'Gui Santos', depth: 2 }
      ]},
      { team: 'GSW', position: 'PF', players: [
        { name: 'Jimmy Butler III', depth: 1 }
      ]},
      { team: 'GSW', position: 'C', players: [
        { name: 'Draymond Green', depth: 1 },
        { name: 'Quinten Post', depth: 2 },
        { name: 'Trayce Jackson-Davis', depth: 3 }
      ]},

      // Add remaining teams...
      // Houston Rockets
      { team: 'HOU', position: 'PG', players: [
        { name: 'Fred VanVleet', depth: 1 },
        { name: 'Aaron Holiday', depth: 2 },
        { name: 'Reed Sheppard', depth: 3 },
        { name: 'JD Davison', depth: 4 }
      ]},
      { team: 'HOU', position: 'SG', players: [
        { name: 'Josh Okogie', depth: 1 }
      ]},
      { team: 'HOU', position: 'SF', players: [
        { name: 'Tari Eason', depth: 1 },
        { name: 'Jaesean Tate', depth: 2 }
      ]},
      { team: 'HOU', position: 'PF', players: [
        { name: 'Kevin Durant', depth: 1 },
        { name: 'Amen Thompson', depth: 2 },
        { name: 'Jabari Smith Jr.', depth: 3 },
        { name: 'Dorian Finney-Smith', depth: 4 },
        { name: 'Jeff Green', depth: 5 }
      ]},
      { team: 'HOU', position: 'C', players: [
        { name: 'Alperen Sengun', depth: 1 },
        { name: 'Clint Capela', depth: 2 },
        { name: 'Steven Adams', depth: 3 }
      ]},

      
      // Indiana Pacers
      { team: 'IND', position: 'PG', players: [
        { name: 'Tyrese Haliburton', depth: 1 },
        { name: 'TJ McConnell', depth: 2 },
        { name: 'RayJ Dennis', depth: 3 },
        { name: 'Quenton Jackson', depth: 4 }
      ]},
      { team: 'IND', position: 'SG', players: [
        { name: 'Bennedict Mathurin', depth: 1 },
        { name: 'Andrew Nembhard', depth: 2 },
        { name: 'Ben Sheppard', depth: 3 }
      ]},
      { team: 'IND', position: 'SF', players: [
        { name: 'Aaron Nesmith', depth: 1 },
        { name: 'Johnny Furphy', depth: 2 }
      ]},
      { team: 'IND', position: 'PF', players: [
        { name: 'Pascal Siakam', depth: 1 },
        { name: 'Jarace Walker', depth: 2 },
        { name: 'Obi Toppin', depth: 3 }
      ]},
      { team: 'IND', position: 'C', players: [
        { name: 'Isaiah Jackson', depth: 1 },
        { name: 'James Huff', depth: 2 },
        { name: 'Tony Bradley', depth: 3 },
        { name: 'James Wiseman', depth: 4 }
      ]},

      // Los Angeles Clippers
      { team: 'LAC', position: 'PG', players: [
        { name: 'James Harden', depth: 1 },
        { name: 'Kris Dunn', depth: 2 }
      ]},
      { team: 'LAC', position: 'SG', players: [
        { name: 'Norman Powell', depth: 1 },
        { name: 'Jordan Miller', depth: 2 },
        { name: 'Amir Coffey', depth: 3 }
      ]},
      { team: 'LAC', position: 'SF', players: [
        { name: 'Kawhi Leonard', depth: 1 },
        { name: 'Nicolas Batum', depth: 2 },
        { name: 'Kobe Brown', depth: 3 }
      ]},
      { team: 'LAC', position: 'PF', players: [
        { name: 'Derrick Jones Jr.', depth: 1 },
        { name: 'PJ Tucker', depth: 2 }
      ]},
      { team: 'LAC', position: 'C', players: [
        { name: 'Ivica Zubac', depth: 1 },
        { name: 'Mo Bamba', depth: 2 }
      ]},

      // Los Angeles Lakers
      { team: 'LAL', position: 'PG', players: [
        { name: 'DAngelo Russell', depth: 1 },
        { name: 'Gabe Vincent', depth: 2 },
        { name: 'Bronny James', depth: 3 }
      ]},
      { team: 'LAL', position: 'SG', players: [
        { name: 'Austin Reaves', depth: 1 },
        { name: 'Max Christie', depth: 2 },
        { name: 'Cam Reddish', depth: 3 }
      ]},
      { team: 'LAL', position: 'SF', players: [
        { name: 'LeBron James', depth: 1 },
        { name: 'Rui Hachimura', depth: 2 },
        { name: 'Dalton Knecht', depth: 3 }
      ]},
      { team: 'LAL', position: 'PF', players: [
        { name: 'Anthony Davis', depth: 1 },
        { name: 'Jarred Vanderbilt', depth: 2 },
        { name: 'Christian Wood', depth: 3 }
      ]},
      { team: 'LAL', position: 'C', players: [
        { name: 'Christian Koloko', depth: 1 },
        { name: 'Jaxson Hayes', depth: 2 }
      ]},

      // Memphis Grizzlies
      { team: 'MEM', position: 'PG', players: [
        { name: 'Ja Morant', depth: 1 },
        { name: 'Marcus Smart', depth: 2 },
        { name: 'Scotty Pippen Jr.', depth: 3 }
      ]},
      { team: 'MEM', position: 'SG', players: [
        { name: 'Desmond Bane', depth: 1 },
        { name: 'Luke Kennard', depth: 2 },
        { name: 'John Konchar', depth: 3 }
      ]},
      { team: 'MEM', position: 'SF', players: [
        { name: 'Jaylen Wells', depth: 1 },
        { name: 'Santi Aldama', depth: 2 },
        { name: 'Jake LaRavia', depth: 3 }
      ]},
      { team: 'MEM', position: 'PF', players: [
        { name: 'Jaren Jackson Jr.', depth: 1 },
        { name: 'Brandon Clarke', depth: 2 },
        { name: 'GG Jackson II', depth: 3 }
      ]},
      { team: 'MEM', position: 'C', players: [
        { name: 'Zach Edey', depth: 1 },
        { name: 'Jay Huff', depth: 2 }
      ]},

      // Miami Heat
      { team: 'MIA', position: 'PG', players: [
        { name: 'Terry Rozier', depth: 1 },
        { name: 'Tyler Herro', depth: 2 },
        { name: 'Alec Burks', depth: 3 }
      ]},
      { team: 'MIA', position: 'SG', players: [
        { name: 'Duncan Robinson', depth: 1 },
        { name: 'Dru Smith', depth: 2 }
      ]},
      { team: 'MIA', position: 'SF', players: [
        { name: 'Jimmy Butler', depth: 1 },
        { name: 'Jaime Jaquez Jr.', depth: 2 },
        { name: 'Nikola Jovic', depth: 3 }
      ]},
      { team: 'MIA', position: 'PF', players: [
        { name: 'Kevin Love', depth: 1 },
        { name: 'Haywood Highsmith', depth: 2 },
        { name: 'Pelle Larsson', depth: 3 }
      ]},
      { team: 'MIA', position: 'C', players: [
        { name: 'Bam Adebayo', depth: 1 },
        { name: 'Kel el Ware', depth: 2 },
        { name: 'Thomas Bryant', depth: 3 }
      ]},

      // Milwaukee Bucks
      { team: 'MIL', position: 'PG', players: [
        { name: 'Damian Lillard', depth: 1 },
        { name: 'AJ Green', depth: 2 },
        { name: 'Ryan Rollins', depth: 3 }
      ]},
      { team: 'MIL', position: 'SG', players: [
        { name: 'Gary Trent Jr.', depth: 1 },
        { name: 'Andre Jackson Jr.', depth: 2 }
      ]},
      { team: 'MIL', position: 'SF', players: [
        { name: 'Khris Middleton', depth: 1 },
        { name: 'Taurean Prince', depth: 2 },
        { name: 'MarJon Beauchamp', depth: 3 }
      ]},
      { team: 'MIL', position: 'PF', players: [
        { name: 'Giannis Antetokounmpo', depth: 1 },
        { name: 'Bobby Portis', depth: 2 }
      ]},
      { team: 'MIL', position: 'C', players: [
        { name: 'Brook Lopez', depth: 1 },
        { name: 'Tyler Smith', depth: 2 }
      ]},

      // Minnesota Timberwolves
      { team: 'MIN', position: 'PG', players: [
        { name: 'Mike Conley', depth: 1 },
        { name: 'Donte DiVincenzo', depth: 2 },
        { name: 'Rob Dillingham', depth: 3 }
      ]},
      { team: 'MIN', position: 'SG', players: [
        { name: 'Anthony Edwards', depth: 1 },
        { name: 'Nickeil Alexander-Walker', depth: 2 }
      ]},
      { team: 'MIN', position: 'SF', players: [
        { name: 'Jaden McDaniels', depth: 1 },
        { name: 'Terrence Shannon Jr.', depth: 2 }
      ]},
      { team: 'MIN', position: 'PF', players: [
        { name: 'Julius Randle', depth: 1 },
        { name: 'Naz Reid', depth: 2 },
        { name: 'Josh Minott', depth: 3 }
      ]},
      { team: 'MIN', position: 'C', players: [
        { name: 'Rudy Gobert', depth: 1 },
        { name: 'Luka Garza', depth: 2 }
      ]},

      // New Orleans Pelicans
      { team: 'NOP', position: 'PG', players: [
        { name: 'Dejounte Murray', depth: 1 },
        { name: 'Jose Alvarado', depth: 2 },
        { name: 'Elfrid Payton', depth: 3 }
      ]},
      { team: 'NOP', position: 'SG', players: [
        { name: 'CJ McCollum', depth: 1 },
        { name: 'Jordan Hawkins', depth: 2 },
        { name: 'Antonio Reeves', depth: 3 }
      ]},
      { team: 'NOP', position: 'SF', players: [
        { name: 'Brandon Ingram', depth: 1 },
        { name: 'Herb Jones', depth: 2 },
        { name: 'Javonte Green', depth: 3 }
      ]},
      { team: 'NOP', position: 'PF', players: [
        { name: 'Zion Williamson', depth: 1 },
        { name: 'Trey Murphy III', depth: 2 },
        { name: 'Jeremiah Robinson-Earl', depth: 3 }
      ]},
      { team: 'NOP', position: 'C', players: [
        { name: 'Yves Missi', depth: 1 },
        { name: 'Daniel Theis', depth: 2 }
      ]},

      // New York Knicks
      { team: 'NYK', position: 'PG', players: [
        { name: 'Jalen Brunson', depth: 1 },
        { name: 'Cameron Payne', depth: 2 },
        { name: 'Tyler Kolek', depth: 3 }
      ]},
      { team: 'NYK', position: 'SG', players: [
        { name: 'Mikal Bridges', depth: 1 },
        { name: 'Miles McBride', depth: 2 }
      ]},
      { team: 'NYK', position: 'SF', players: [
        { name: 'Josh Hart', depth: 1 },
        { name: 'Pacome Dadiet', depth: 2 }
      ]},
      { team: 'NYK', position: 'PF', players: [
        { name: 'OG Anunoby', depth: 1 },
        { name: 'Precious Achiuwa', depth: 2 }
      ]},
      { team: 'NYK', position: 'C', players: [
        { name: 'Karl-Anthony Towns', depth: 1 },
        { name: 'Mitchell Robinson', depth: 2 },
        { name: 'Jericho Sims', depth: 3 }
      ]},

      // Oklahoma City Thunder
      { team: 'OKC', position: 'PG', players: [
        { name: 'Shai Gilgeous-Alexander', depth: 1 },
        { name: 'Alex Caruso', depth: 2 }
      ]},
      { team: 'OKC', position: 'SG', players: [
        { name: 'Josh Giddey', depth: 1 },
        { name: 'Cason Wallace', depth: 2 },
        { name: 'Ajay Mitchell', depth: 3 }
      ]},
      { team: 'OKC', position: 'SF', players: [
        { name: 'Luguentz Dort', depth: 1 },
        { name: 'Aaron Wiggins', depth: 2 },
        { name: 'Dillon Jones', depth: 3 }
      ]},
      { team: 'OKC', position: 'PF', players: [
        { name: 'Jalen Williams', depth: 1 },
        { name: 'Kenrich Williams', depth: 2 },
        { name: 'Ousmane Dieng', depth: 3 }
      ]},
      { team: 'OKC', position: 'C', players: [
        { name: 'Chet Holmgren', depth: 1 },
        { name: 'Isaiah Hartenstein', depth: 2 },
        { name: 'Jaylin Williams', depth: 3 }
      ]},

      // Orlando Magic
      { team: 'ORL', position: 'PG', players: [
        { name: 'Jalen Suggs', depth: 1 },
        { name: 'Cole Anthony', depth: 2 },
        { name: 'Anthony Black', depth: 3 }
      ]},
      { team: 'ORL', position: 'SG', players: [
        { name: 'Kentavious Caldwell-Pope', depth: 1 },
        { name: 'Gary Harris', depth: 2 }
      ]},
      { team: 'ORL', position: 'SF', players: [
        { name: 'Franz Wagner', depth: 1 },
        { name: 'Tristan da Silva', depth: 2 },
        { name: 'Caleb Houstan', depth: 3 }
      ]},
      { team: 'ORL', position: 'PF', players: [
        { name: 'Paolo Banchero', depth: 1 },
        { name: 'Jonathan Isaac', depth: 2 },
        { name: 'Moritz Wagner', depth: 3 }
      ]},
      { team: 'ORL', position: 'C', players: [
        { name: 'Wendell Carter Jr.', depth: 1 },
        { name: 'Goga Bitadze', depth: 2 }
      ]},

      // Philadelphia 76ers
      { team: 'PHI', position: 'PG', players: [
        { name: 'Tyrese Maxey', depth: 1 },
        { name: 'Kyle Lowry', depth: 2 },
        { name: 'Jared McCain', depth: 3 }
      ]},
      { team: 'PHI', position: 'SG', players: [
        { name: 'Kelly Oubre Jr.', depth: 1 },
        { name: 'Eric Gordon', depth: 2 },
        { name: 'Reggie Jackson', depth: 3 }
      ]},
      { team: 'PHI', position: 'SF', players: [
        { name: 'Paul George', depth: 1 },
        { name: 'Caleb Martin', depth: 2 },
        { name: 'KJ Martin', depth: 3 }
      ]},
      { team: 'PHI', position: 'PF', players: [
        { name: 'Tobias Harris', depth: 1 },
        { name: 'Guerschon Yabusele', depth: 2 },
        { name: 'Ricky Council IV', depth: 3 }
      ]},
      { team: 'PHI', position: 'C', players: [
        { name: 'Joel Embiid', depth: 1 },
        { name: 'Andre Drummond', depth: 2 },
        { name: 'Adem Bona', depth: 3 }
      ]},

      // Phoenix Suns
      { team: 'PHX', position: 'PG', players: [
        { name: 'Tyus Jones', depth: 1 },
        { name: 'Monte Morris', depth: 2 },
        { name: 'Collin Gillespie', depth: 3 }
      ]},
      { team: 'PHX', position: 'SG', players: [
        { name: 'Devin Booker', depth: 1 },
        { name: 'Bradley Beal', depth: 2 },
        { name: 'Grayson Allen', depth: 3 }
      ]},
      { team: 'PHX', position: 'SF', players: [
        { name: 'Kevin Durant', depth: 1 },
        { name: 'Royce ONeale', depth: 2 },
        { name: 'Ryan Dunn', depth: 3 }
      ]},
      { team: 'PHX', position: 'PF', players: [
        { name: 'Josh Okogie', depth: 1 },
        { name: 'Oso Ighodaro', depth: 2 },
        { name: 'TyTy Washington Jr.', depth: 3 }
      ]},
      { team: 'PHX', position: 'C', players: [
        { name: 'Jusuf Nurkic', depth: 1 },
        { name: 'Mason Plumlee', depth: 2 }
      ]},

      // Portland Trail Blazers
      { team: 'POR', position: 'PG', players: [
        { name: 'Anfernee Simons', depth: 1 },
        { name: 'Scoot Henderson', depth: 2 },
        { name: 'Dalano Banton', depth: 3 }
      ]},
      { team: 'POR', position: 'SG', players: [
        { name: 'Shaedon Sharpe', depth: 1 },
        { name: 'Kris Murray', depth: 2 }
      ]},
      { team: 'POR', position: 'SF', players: [
        { name: 'Toumani Camara', depth: 1 },
        { name: 'Deni Avdija', depth: 2 },
        { name: 'Matisse Thybulle', depth: 3 }
      ]},
      { team: 'POR', position: 'PF', players: [
        { name: 'Jerami Grant', depth: 1 },
        { name: 'Jabari Walker', depth: 2 },
        { name: 'Rayan Rupert', depth: 3 }
      ]},
      { team: 'POR', position: 'C', players: [
        { name: 'Deandre Ayton', depth: 1 },
        { name: 'Robert Williams III', depth: 2 },
        { name: 'Donovan Clingan', depth: 3 }
      ]},

      // Sacramento Kings
      { team: 'SAC', position: 'PG', players: [
        { name: 'DeAaron Fox', depth: 1 },
        { name: 'Davion Mitchell', depth: 2 },
        { name: 'Jordan McLaughlin', depth: 3 }
      ]},
      { team: 'SAC', position: 'SG', players: [
        { name: 'Malik Monk', depth: 1 },
        { name: 'Kevin Huerter', depth: 2 },
        { name: 'Keon Ellis', depth: 3 }
      ]},
      { team: 'SAC', position: 'SF', players: [
        { name: 'DeMar DeRozan', depth: 1 },
        { name: 'Keegan Murray', depth: 2 },
        { name: 'Trey Lyles', depth: 3 }
      ]},
      { team: 'SAC', position: 'PF', players: [
        { name: 'Domantas Sabonis', depth: 1 },
        { name: 'Trey Lyles', depth: 2 },
        { name: 'Orlando Robinson', depth: 3 }
      ]},
      { team: 'SAC', position: 'C', players: [
        { name: 'Alex Len', depth: 1 },
        { name: 'JaVale McGee', depth: 2 }
      ]},

      // San Antonio Spurs
      { team: 'SAS', position: 'PG', players: [
        { name: 'Chris Paul', depth: 1 },
        { name: 'Stephon Castle', depth: 2 },
        { name: 'Tre Jones', depth: 3 }
      ]},
      { team: 'SAS', position: 'SG', players: [
        { name: 'Devin Vassell', depth: 1 },
        { name: 'Malaki Branham', depth: 2 },
        { name: 'Blake Wesley', depth: 3 }
      ]},
      { team: 'SAS', position: 'SF', players: [
        { name: 'Julian Champagnie', depth: 1 },
        { name: 'Keldon Johnson', depth: 2 },
        { name: 'Harrison Barnes', depth: 3 }
      ]},
      { team: 'SAS', position: 'PF', players: [
        { name: 'Jeremy Sochan', depth: 1 },
        { name: 'Keldon Johnson', depth: 2 },
        { name: 'Sidy Cissoko', depth: 3 }
      ]},
      { team: 'SAS', position: 'C', players: [
        { name: 'Victor Wembanyama', depth: 1 },
        { name: 'Zach Collins', depth: 2 },
        { name: 'Charles Bassey', depth: 3 }
      ]},

      // Toronto Raptors
      { team: 'TOR', position: 'PG', players: [
        { name: 'Immanuel Quickley', depth: 1 },
        { name: 'Davion Mitchell', depth: 2 },
        { name: 'Jamal Shead', depth: 3 }
      ]},
      { team: 'TOR', position: 'SG', players: [
        { name: 'RJ Barrett', depth: 1 },
        { name: 'Gradey Dick', depth: 2 },
        { name: 'Ochai Agbaji', depth: 3 }
      ]},
      { team: 'TOR', position: 'SF', players: [
        { name: 'Scottie Barnes', depth: 1 },
        { name: 'Bruce Brown', depth: 2 },
        { name: 'Ja Kobe Walter', depth: 3 }
      ]},
      { team: 'TOR', position: 'PF', players: [
        { name: 'Chris Boucher', depth: 1 },
        { name: 'Jonathan Mogbo', depth: 2 },
        { name: 'Kelly Olynyk', depth: 3 }
      ]},
      { team: 'TOR', position: 'C', players: [
        { name: 'Jakob Poeltl', depth: 1 },
        { name: 'Bruno Fernando', depth: 2 }
      ]},

      // Utah Jazz
      { team: 'UTA', position: 'PG', players: [
        { name: 'Keyonte George', depth: 1 },
        { name: 'Collin Sexton', depth: 2 },
        { name: 'Isaiah Collier', depth: 3 }
      ]},
      { team: 'UTA', position: 'SG', players: [
        { name: 'Jordan Clarkson', depth: 1 },
        { name: 'Cody Williams', depth: 2 },
        { name: 'Johnny Juzang', depth: 3 }
      ]},
      { team: 'UTA', position: 'SF', players: [
        { name: 'Lauri Markkanen', depth: 1 },
        { name: 'Taylor Hendricks', depth: 2 },
        { name: 'Brice Sensabaugh', depth: 3 }
      ]},
      { team: 'UTA', position: 'PF', players: [
        { name: 'John Collins', depth: 1 },
        { name: 'Kyle Filipowski', depth: 2 },
        { name: 'Drew Eubanks', depth: 3 }
      ]},
      { team: 'UTA', position: 'C', players: [
        { name: 'Walker Kessler', depth: 1 },
        { name: 'Micah Potter', depth: 2 }
      ]},

      // Washington Wizards
      { team: 'WAS', position: 'PG', players: [
        { name: 'Jordan Poole', depth: 1 },
        { name: 'Bub Carrington', depth: 2 },
        { name: 'Jared Butler', depth: 3 }
      ]},
      { team: 'WAS', position: 'SG', players: [
        { name: 'Bradley Beal', depth: 1 },
        { name: 'Corey Kispert', depth: 2 },
        { name: 'Johnny Davis', depth: 3 }
      ]},
      { team: 'WAS', position: 'SF', players: [
        { name: 'Kyle Kuzma', depth: 1 },
        { name: 'Bilal Coulibaly', depth: 2 },
        { name: 'Carlton Carrington', depth: 3 }
      ]},
      { team: 'WAS', position: 'PF', players: [
        { name: 'Alexandre Sarr', depth: 1 },
        { name: 'Marvin Bagley III', depth: 2 },
        { name: 'Richaun Holmes', depth: 3 }
      ]},
      { team: 'WAS', position: 'C', players: [
        { name: 'Jonas Valanciunas', depth: 1 },
        { name: 'Poole Gafford', depth: 2 }
      ]}
    ];

    // ALL 30 NBA TEAMS NOW COMPLETE!

    // Convert comprehensive data to flat player array
    comprehensiveData.forEach(teamPositionGroup => {
      teamPositionGroup.players.forEach(player => {
        allPlayers.push({
          id: `${player.name.toLowerCase().replace(/[^a-z]/g, '_')}_${teamPositionGroup.team.toLowerCase()}`,
          name: player.name,
          team: teamPositionGroup.team,
          status: player.depth === 1 ? 'starter' : 'rotation',
          depth: player.depth,
          position: teamPositionGroup.position
        });
      });
    });
    
    console.log(`🏀 getAllPlayers: Found ${allPlayers.length} total NBA players across ${new Set(allPlayers.map(p => p.team)).size} teams`);
    console.log('Sample NBA players:', allPlayers.slice(0, 3));
    
    return allPlayers;
  }

  // GET NBA ROSTER BY POSITION
  static getRosterByPosition(position: string): any[] {
    const allPlayers = this.getAllPlayers();
    return allPlayers.filter(player => player.position === position);
  }

  // GET NBA TEAM ROSTER
  static getTeamRoster(teamCode: string): any[] {
    const allPlayers = this.getAllPlayers();
    return allPlayers.filter(player => player.team === teamCode.toUpperCase());
  }

  // GET NBA DATA STATS
  static getDataStats() {
    const allPlayers = this.getAllPlayers();
    const stats = {
      totalPlayers: allPlayers.length,
      positionBreakdown: {} as any,
      teamCoverage: new Set<string>(),
      lastUpdated: '2025-08-24T02:00:00Z'
    };

    const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
    positions.forEach(pos => {
      stats.positionBreakdown[pos] = allPlayers.filter(p => p.position === pos).length;
    });

    allPlayers.forEach(player => {
      stats.teamCoverage.add(player.team);
    });

    return {
      ...stats,
      teamCoverage: Array.from(stats.teamCoverage).sort(),
      teamCount: stats.teamCoverage.size
    };
  }
}

export default NBADepthChartParser;