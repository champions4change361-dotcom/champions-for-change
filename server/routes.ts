import type { Express } from "express";
import { createServer, type Server } from "http";
import { getStorage } from "./storage";
import { insertTournamentSchema, updateMatchSchema } from "@shared/schema";
import { z } from "zod";

function generateSingleEliminationBracket(teamSize: number, tournamentId: string) {
  const rounds = Math.ceil(Math.log2(teamSize));
  const totalTeams = Math.pow(2, rounds);
  
  // Generate team names
  const teams = Array.from({ length: teamSize }, (_, i) => `Team ${String.fromCharCode(65 + i)}`);
  
  // Add "Bye" teams to fill bracket
  while (teams.length < totalTeams) {
    teams.push("Bye");
  }
  
  const matches = [];
  let matchPosition = 0;
  
  // Generate first round matches
  for (let i = 0; i < teams.length; i += 2) {
    const team1 = teams[i];
    const team2 = teams[i + 1];
    
    matches.push({
      tournamentId,
      round: 1,
      position: matchPosition++,
      team1: team1 === "Bye" ? null : team1,
      team2: team2 === "Bye" ? null : team2,
      team1Score: 0,
      team2Score: 0,
      winner: null,
      status: (team1 === "Bye" || team2 === "Bye") ? "completed" as const : "upcoming" as const,
    });
  }
  
  // Generate subsequent rounds with empty matches
  for (let round = 2; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    matchPosition = 0;
    
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournamentId,
        round,
        position: matchPosition++,
        team1: null,
        team2: null,
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: "upcoming" as const,
      });
    }
  }
  
  return matches;
}

function generateDoubleEliminationBracket(teamSize: number, tournamentId: string) {
  const rounds = Math.ceil(Math.log2(teamSize));
  const totalTeams = Math.pow(2, rounds);
  
  // Generate team names
  const teams = Array.from({ length: teamSize }, (_, i) => `Team ${String.fromCharCode(65 + i)}`);
  
  // Add "Bye" teams to fill bracket
  while (teams.length < totalTeams) {
    teams.push("Bye");
  }
  
  const matches = [];
  let matchPosition = 0;
  
  // Winners Bracket - First Round
  for (let i = 0; i < teams.length; i += 2) {
    const team1 = teams[i];
    const team2 = teams[i + 1];
    
    matches.push({
      tournamentId,
      round: 1,
      position: matchPosition++,
      team1: team1 === "Bye" ? null : team1,
      team2: team2 === "Bye" ? null : team2,
      team1Score: 0,
      team2Score: 0,
      winner: null,
      status: (team1 === "Bye" || team2 === "Bye") ? "completed" as const : "upcoming" as const,
    });
  }
  
  // Winners Bracket - Subsequent Rounds
  for (let round = 2; round <= rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round);
    matchPosition = 0;
    
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournamentId,
        round,
        position: matchPosition++,
        team1: null,
        team2: null,
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: "upcoming" as const,
      });
    }
  }
  
  // Losers Bracket - More complex structure for double elimination
  const loserRounds = (rounds - 1) * 2;
  for (let round = rounds + 1; round <= rounds + loserRounds; round++) {
    const isEliminationRound = (round - rounds) % 2 === 1;
    const matchesInRound = isEliminationRound ? 
      Math.pow(2, Math.floor((rounds + loserRounds - round) / 2)) :
      Math.pow(2, Math.floor((rounds + loserRounds - round + 1) / 2));
    
    matchPosition = 0;
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        tournamentId,
        round,
        position: matchPosition++,
        team1: null,
        team2: null,
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: "upcoming" as const,
      });
    }
  }
  
  // Grand Final
  matches.push({
    tournamentId,
    round: rounds + loserRounds + 1,
    position: 0,
    team1: null,
    team2: null,
    team1Score: 0,
    team2Score: 0,
    winner: null,
    status: "upcoming" as const,
  });
  
  return matches;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tournaments
  app.get("/api/tournaments", async (req, res) => {
    try {
      const storage = await getStorage();
      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  // Get single tournament with matches
  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storage = await getStorage();
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ error: "Tournament not found" });
      }
      
      const matches = await storage.getMatchesByTournament(id);
      res.json({ tournament, matches });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  });

  // Create tournament
  app.post("/api/tournaments", async (req, res) => {
    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const storage = await getStorage();
      
      // Create tournament
      const tournament = await storage.createTournament(validatedData);
      
      // Generate bracket matches based on tournament type
      const matches = validatedData.tournamentType === "double" 
        ? generateDoubleEliminationBracket(validatedData.teamSize, tournament.id)
        : generateSingleEliminationBracket(validatedData.teamSize, tournament.id);
      
      // Create all matches
      const createdMatches = [];
      for (const matchData of matches) {
        const match = await storage.createMatch(matchData);
        createdMatches.push(match);
      }
      
      // Handle byes in first round
      for (const match of createdMatches.filter(m => m.round === 1)) {
        if (!match.team1 && match.team2) {
          await storage.updateMatch(match.id, { winner: match.team2, status: "completed" });
        } else if (match.team1 && !match.team2) {
          await storage.updateMatch(match.id, { winner: match.team1, status: "completed" });
        }
      }
      
      res.json({ tournament, matches: createdMatches });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid tournament data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create tournament" });
    }
  });

  // Update match
  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateMatchSchema.parse(req.body);
      const storage = await getStorage();
      
      const match = await storage.updateMatch(id, validatedData);
      
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      
      // Determine winner based on scores if match is completed
      if (match.status === "completed" && match.team1Score !== null && match.team2Score !== null) {
        let winner = null;
        if (match.team1Score > match.team2Score) {
          winner = match.team1;
        } else if (match.team2Score > match.team1Score) {
          winner = match.team2;
        }
        
        if (winner && winner !== match.winner) {
          await storage.updateMatch(id, { winner });
        }
        
        // Advance winner to next round
        if (winner) {
          await advanceWinner(match.tournamentId, match.round, match.position, winner);
        }
      }
      
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid match data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update match" });
    }
  });

  // Update team name
  app.patch("/api/tournaments/:id/teams", async (req, res) => {
    try {
      const { id } = req.params;
      const { oldName, newName } = req.body;
      
      if (!oldName || !newName) {
        return res.status(400).json({ error: "Both oldName and newName are required" });
      }
      
      const storage = await getStorage();
      await storage.updateTeamName(id, oldName, newName);
      
      res.json({ success: true, message: "Team name updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update team name" });
    }
  });

  // Import Bubble data
  app.post("/api/import/bubble-data", async (req, res) => {
    try {
      const storage = await getStorage();
      let imported = 0;
      
      // Import Sport Options data with competition types
      const sportOptionsData = [
        { 
          id: "1754180946865x898161729538192500", 
          sportName: "Basketball", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 1,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754180977955x395946833660146800", 
          sportName: "Soccer", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754181015919x333498357441713860", 
          sportName: "Football", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "bracket",
          scoringMethod: "wins"
        },
        { 
          id: "1754181255196x388986311669203840", 
          sportName: "Track & Field(Sprints, Distance, Field Events)", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 1,
          competitionType: "leaderboard",
          scoringMethod: "time",
          measurementUnit: "seconds"
        },
        { 
          id: "1754181223028x396723622458883260", 
          sportName: "Tennis", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "bracket",
          scoringMethod: "wins"
        },
        { 
          id: "1754181187121x526423864176922750", 
          sportName: "Golf", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "leaderboard",
          scoringMethod: "points",
          measurementUnit: "strokes"
        },
        { 
          id: "1754181287630x265470261364728830", 
          sportName: "Swimming", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 4,
          competitionType: "leaderboard",
          scoringMethod: "time",
          measurementUnit: "seconds"
        },
        { 
          id: "1754186198614x721676290099525500", 
          sportName: "League of Legends", 
          sportCategory: "1754106388289x383805117761464300", 
          sportSubcategory: "", 
          sortOrder: 6,
          competitionType: "bracket",
          scoringMethod: "wins"
        },
        { 
          id: "1754186227104x911583160186015100", 
          sportName: "CS:GO", 
          sportCategory: "1754106388289x383805117761464300", 
          sportSubcategory: "", 
          sortOrder: 7,
          competitionType: "bracket",
          scoringMethod: "wins"
        },
        { 
          id: "1754186254060x898039150049687400", 
          sportName: "Valorant", 
          sportCategory: "1754106388289x383805117761464300", 
          sportSubcategory: "", 
          sortOrder: 8,
          competitionType: "bracket",
          scoringMethod: "wins"
        },
        { 
          id: "1754808200000x123456789012345600", 
          sportName: "Fishing & Angling", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 9,
          competitionType: "leaderboard",
          scoringMethod: "points",
          measurementUnit: "weight"
        },
        { 
          id: "1754808300000x987654321098765400", 
          sportName: "Hunting & Wildlife", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 10,
          competitionType: "leaderboard",
          scoringMethod: "points",
          measurementUnit: "points"
        },
        // Missing Team Sports
        { 
          id: "1754808400000x111111111111111100", 
          sportName: "Baseball", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 4,
          competitionType: "series",
          scoringMethod: "wins"
        },
        { 
          id: "1754808500000x222222222222222200", 
          sportName: "Softball", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 5,
          competitionType: "both",
          scoringMethod: "wins"
        },
        { 
          id: "1754808600000x333333333333333300", 
          sportName: "Hockey", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 6,
          competitionType: "series",
          scoringMethod: "wins"
        },
        // Culinary Competitions
        { 
          id: "1754808700000x444444444444444400", 
          sportName: "BBQ Cook-Off", 
          sportCategory: "1754808800000x555555555555555500", 
          sportSubcategory: "", 
          sortOrder: 1,
          competitionType: "both",
          scoringMethod: "points"
        },
        { 
          id: "1754808710000x444444444444444500", 
          sportName: "Cooking Competition", 
          sportCategory: "1754808800000x555555555555555500", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "both",
          scoringMethod: "points"
        },
        { 
          id: "1754808720000x444444444444444600", 
          sportName: "Eating Competition", 
          sportCategory: "1754808800000x555555555555555500", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "leaderboard",
          scoringMethod: "points",
          measurementUnit: "amount"
        },
        // Academic Competitions
        { 
          id: "1754808730000x666666666666666600", 
          sportName: "Spelling Bee", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 1,
          competitionType: "bracket",
          scoringMethod: "wins"
        },
        { 
          id: "1754808740000x666666666666666700", 
          sportName: "Math Bowl", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "both",
          scoringMethod: "points"
        },
        { 
          id: "1754808750000x666666666666666800", 
          sportName: "Science Bowl", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "both",
          scoringMethod: "points"
        },
        { 
          id: "1754808760000x666666666666666900", 
          sportName: "Quiz Bowl", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 4,
          competitionType: "both",
          scoringMethod: "points"
        },
        { 
          id: "1754808770000x666666666666667000", 
          sportName: "Debate Tournament", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 5,
          competitionType: "bracket",
          scoringMethod: "wins"
        }
      ];

      for (const sport of sportOptionsData) {
        await storage.createSportOption(sport);
        imported++;
      }

      // Import Tournament Structures
      const tournamentStructuresData = [
        { id: "single-elimination", formatName: "Single Elimination", formatDescription: "Traditional single elimination bracket where one loss eliminates a team", formatType: "Elimination", applicableSports: "", sortOrder: 1 },
        { id: "double-elimination", formatName: "Double Elimination", formatDescription: "Teams must lose twice to be eliminated, includes winners and losers brackets", formatType: "Elimination", applicableSports: "", sortOrder: 2 },
        { id: "round-robin", formatName: "Round Robin", formatDescription: "Every team plays every other team once, winner determined by record", formatType: "League", applicableSports: "", sortOrder: 3 },
        { id: "1754188778087x479108798816628740", formatName: "Pool Play → Single Elimination", formatDescription: "Groups compete in round robin pools, then top teams advance to single elimination bracket", formatType: "Hybrid", applicableSports: "", sortOrder: 4 },
        { id: "1754250656716x507627447270448260", formatName: "Swiss System", formatDescription: "Teams paired based on similar records. No elimination, predetermined number of rounds.", formatType: "League", applicableSports: "", sortOrder: 5 },
        { id: "1754250872083x720648956222675700", formatName: "Pool Play → Double Elimination", formatDescription: "Pool play followed by double elimination bracket for advanced teams.", formatType: "Hybrid", applicableSports: "", sortOrder: 6 },
      ];

      for (const structure of tournamentStructuresData) {
        await storage.createTournamentStructure(structure);
        imported++;
      }

      // Import Track Events
      const trackEventsData = [
        { id: "1754525327790x301165369722352450", eventName: "100m Dash", eventCategory: "Track", measurementType: "Time", maxAttempts: 1, ribbonPlaces: 6, usesStakes: "no", sortOrder: 2 },
        { id: "1754525252846x428396594519322700", eventName: "Shot Put", eventCategory: "Field", measurementType: "Distance", maxAttempts: 3, ribbonPlaces: 6, usesStakes: "yes", sortOrder: 1 },
        { id: "1754525477436x974619504023812600", eventName: "Long Jump", eventCategory: "Field", measurementType: "Distance", maxAttempts: 3, ribbonPlaces: 6, usesStakes: "no", sortOrder: 3 },
        { id: "1754526697438x872362739342171800", eventName: "200m Dash", eventCategory: "Track", measurementType: "Time", maxAttempts: 1, ribbonPlaces: 6, usesStakes: "no", sortOrder: 10 },
        { id: "1754526729029x592096268799294600", eventName: "400m Dash", eventCategory: "Track", measurementType: "Time", maxAttempts: 1, ribbonPlaces: 6, usesStakes: "no", sortOrder: 11 },
      ];

      for (const event of trackEventsData) {
        await storage.createTrackEvent(event);
        imported++;
      }

      res.json({ 
        success: true, 
        imported,
        summary: `${sportOptionsData.length} sports (${sportOptionsData.filter(s => s.competitionType === 'leaderboard').length} leaderboard, ${sportOptionsData.filter(s => s.competitionType === 'bracket').length} bracket), ${tournamentStructuresData.length} tournament formats, ${trackEventsData.length} track events`
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ error: "Failed to import Bubble data" });
    }
  });

  // Get sport categories
  app.get("/api/sport-categories", async (req, res) => {
    try {
      const storage = await getStorage();
      const categories = await storage.getSportCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching sport categories:", error);
      res.status(500).json({ error: "Failed to fetch sport categories" });
    }
  });

  // Get sport options (auto-import if empty)
  app.get("/api/sports", async (req, res) => {
    try {
      const storage = await getStorage();
      let sports = await storage.getSportOptions();
      
      // If no sports exist, auto-import the default sports
      if (sports.length === 0) {
        console.log("No sports found, auto-importing default sports data...");
        await importDefaultSportsData(storage);
        sports = await storage.getSportOptions();
        console.log(`Auto-imported ${sports.length} sports`);
      }
      
      res.json(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ error: "Failed to fetch sports" });
    }
  });

  // Get tournament structures
  app.get("/api/tournament-structures", async (req, res) => {
    try {
      const storage = await getStorage();
      const structures = await storage.getTournamentStructures();
      res.json(structures);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournament structures" });
    }
  });

  // Helper function to import default sports data
  async function importDefaultSportsData(storage: any) {
    // First import sport categories
    const sportCategoriesData = [
      {
        id: "1753907759981x546774752330226900",
        categoryName: "Team Sports",
        categoryDescription: "Sports played in teams",
        sortOrder: 1
      },
      {
        id: "1753907823621x983678515921424100", 
        categoryName: "Individual Sports",
        categoryDescription: "Sports played individually",
        sortOrder: 2
      },
      {
        id: "1754106388289x383805117761464300",
        categoryName: "Esports",
        categoryDescription: "Electronic sports and gaming competitions",
        sortOrder: 3
      },
      {
        id: "1754808800000x555555555555555500",
        categoryName: "Culinary Competitions",
        categoryDescription: "Cooking, BBQ, and eating competitions",
        sortOrder: 4
      },
      {
        id: "1754808810000x777777777777777700",
        categoryName: "Academic Competitions",
        categoryDescription: "Educational and intellectual competitions",
        sortOrder: 5
      },
      {
        id: "1754810400000x800000000000000000",
        categoryName: "Combat Sports",
        categoryDescription: "Martial arts, boxing, wrestling, and fighting sports",
        sortOrder: 6
      },
      {
        id: "1754810500000x900000000000000000",
        categoryName: "Water Sports",
        categoryDescription: "Swimming, diving, water polo, and aquatic sports",
        sortOrder: 7
      },
      {
        id: "1754810600000x111111111111111111",
        categoryName: "Winter Sports",
        categoryDescription: "Ice and snow sports competitions",
        sortOrder: 8
      },
      {
        id: "1754810700000x222222222222222222",
        categoryName: "Extreme Sports",
        categoryDescription: "High-risk and adventure sports",
        sortOrder: 9
      },
      {
        id: "1754810800000x333333333333333333",
        categoryName: "Professional Services",
        categoryDescription: "Business and professional skill competitions",
        sortOrder: 10
      },
      {
        id: "1754810900000x444444444444444444",
        categoryName: "Creative Arts",
        categoryDescription: "Art, music, dance, and creative competitions",
        sortOrder: 11
      }
    ];

    for (const category of sportCategoriesData) {
      await storage.createSportCategory(category);
    }

    const sportOptionsData = [
      { 
        id: "1754180946865x898161729538192500", 
        sportName: "Basketball", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 1,
        competitionType: "bracket-to-series",
        scoringMethod: "wins"
      },
      { 
        id: "1754180977955x395946833660146800", 
        sportName: "Soccer", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 2,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754181015919x333498357441713860", 
        sportName: "Football", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 3,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754181255196x388986311669203840", 
        sportName: "Track & Field (Sprints, Distance, Field Events)", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 1,
        competitionType: "leaderboard",
        scoringMethod: "time",
        measurementUnit: "seconds"
      },
      { 
        id: "1754181223028x396723622458883260", 
        sportName: "Tennis", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 2,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754181187121x526423864176922750", 
        sportName: "Golf", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 3,
        competitionType: "leaderboard",
        scoringMethod: "points",
        measurementUnit: "strokes"
      },
      { 
        id: "1754181287630x265470261364728830", 
        sportName: "Swimming", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 4,
        competitionType: "leaderboard",
        scoringMethod: "time",
        measurementUnit: "seconds"
      },
      { 
        id: "1754186198614x721676290099525500", 
        sportName: "League of Legends", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 6,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754186227104x911583160186015100", 
        sportName: "CS:GO", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 7,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754186254060x898039150049687400", 
        sportName: "Valorant", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 8,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754808200000x123456789012345600", 
        sportName: "Fishing & Angling", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 9,
        competitionType: "leaderboard",
        scoringMethod: "points",
        measurementUnit: "weight"
      },
      { 
        id: "1754808300000x987654321098765400", 
        sportName: "Hunting & Wildlife", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 10,
        competitionType: "leaderboard",
        scoringMethod: "points",
        measurementUnit: "points"
      },
      // Professional sports with bracket-to-series format
      { 
        id: "1754809100000x111111111111111100", 
        sportName: "Baseball", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 11,
        competitionType: "bracket-to-series",
        scoringMethod: "wins"
      },
      { 
        id: "1754809200000x222222222222222200", 
        sportName: "Hockey", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 12,
        competitionType: "bracket-to-series",
        scoringMethod: "wins"
      },
      { 
        id: "1754809300000x333333333333333300", 
        sportName: "Softball", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 13,
        competitionType: "both",
        scoringMethod: "wins"
      },
      // Culinary competitions
      { 
        id: "1754809400000x444444444444444400", 
        sportName: "BBQ Cook-Off", 
        sportCategory: "1754808800000x555555555555555500", 
        sportSubcategory: "", 
        sortOrder: 14,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754809600000x666666666666666600", 
        sportName: "Cooking Competition", 
        sportCategory: "1754808800000x555555555555555500", 
        sportSubcategory: "", 
        sortOrder: 15,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754809700000x777777777777777700", 
        sportName: "Eating Competition", 
        sportCategory: "1754808800000x555555555555555500", 
        sportSubcategory: "", 
        sortOrder: 16,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      // Academic competitions
      { 
        id: "1754809800000x888888888888888800", 
        sportName: "Spelling Bee", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 17,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754810000000x100000000000000000", 
        sportName: "Math Bowl", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 18,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754810100000x110000000000000000", 
        sportName: "Science Bowl", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 19,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754810200000x120000000000000000", 
        sportName: "Quiz Bowl", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 20,
        competitionType: "bracket",
        scoringMethod: "points"
      },
      { 
        id: "1754810300000x130000000000000000", 
        sportName: "Debate Tournament", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 21,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      // Major missing team sports
      { 
        id: "1754811000000x140000000000000000", 
        sportName: "Volleyball", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 22,
        competitionType: "bracket-to-series",
        scoringMethod: "wins"
      },
      { 
        id: "1754811100000x150000000000000000", 
        sportName: "Rugby", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 23,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754811200000x160000000000000000", 
        sportName: "Cricket", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 24,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754811300000x170000000000000000", 
        sportName: "Lacrosse", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 25,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754811400000x180000000000000000", 
        sportName: "Field Hockey", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 26,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      // Combat Sports
      { 
        id: "1754811500000x190000000000000000", 
        sportName: "Boxing", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 27,
        competitionType: "bracket",
        scoringMethod: "points"
      },
      { 
        id: "1754811600000x200000000000000000", 
        sportName: "Wrestling", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 28,
        competitionType: "bracket",
        scoringMethod: "points"
      },
      { 
        id: "1754811700000x210000000000000000", 
        sportName: "Martial Arts (Karate)", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 29,
        competitionType: "bracket",
        scoringMethod: "points"
      },
      { 
        id: "1754811800000x220000000000000000", 
        sportName: "Judo", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 30,
        competitionType: "bracket",
        scoringMethod: "points"
      },
      { 
        id: "1754811900000x230000000000000000", 
        sportName: "Taekwondo", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 31,
        competitionType: "bracket",
        scoringMethod: "points"
      },
      { 
        id: "1754812000000x240000000000000000", 
        sportName: "MMA", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 32,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      // Water Sports
      { 
        id: "1754812100000x250000000000000000", 
        sportName: "Water Polo", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 33,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754812200000x260000000000000000", 
        sportName: "Diving", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 34,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754812300000x270000000000000000", 
        sportName: "Synchronized Swimming", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 35,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754812400000x280000000000000000", 
        sportName: "Surfing", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 36,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      // Winter Sports
      { 
        id: "1754812500000x290000000000000000", 
        sportName: "Ice Hockey", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 37,
        competitionType: "bracket-to-series",
        scoringMethod: "wins"
      },
      { 
        id: "1754812600000x300000000000000000", 
        sportName: "Figure Skating", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 38,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754812700000x310000000000000000", 
        sportName: "Skiing", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 39,
        competitionType: "leaderboard",
        scoringMethod: "time"
      },
      { 
        id: "1754812800000x320000000000000000", 
        sportName: "Snowboarding", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 40,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754812900000x330000000000000000", 
        sportName: "Curling", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 41,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      // Individual Sports expansions
      { 
        id: "1754813000000x340000000000000000", 
        sportName: "Badminton", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 42,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754813100000x350000000000000000", 
        sportName: "Table Tennis", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 43,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754813200000x360000000000000000", 
        sportName: "Archery", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 44,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754813300000x370000000000000000", 
        sportName: "Cycling", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 45,
        competitionType: "leaderboard",
        scoringMethod: "time"
      },
      { 
        id: "1754813400000x380000000000000000", 
        sportName: "Gymnastics", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 46,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754813500000x390000000000000000", 
        sportName: "Weightlifting", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 47,
        competitionType: "leaderboard",
        scoringMethod: "weight"
      },
      { 
        id: "1754813600000x400000000000000000", 
        sportName: "Rock Climbing", 
        sportCategory: "1754810700000x222222222222222222", 
        sportSubcategory: "", 
        sortOrder: 48,
        competitionType: "leaderboard",
        scoringMethod: "time"
      },
      { 
        id: "1754813700000x410000000000000000", 
        sportName: "Skateboarding", 
        sportCategory: "1754810700000x222222222222222222", 
        sportSubcategory: "", 
        sortOrder: 49,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754813800000x420000000000000000", 
        sportName: "BMX", 
        sportCategory: "1754810700000x222222222222222222", 
        sportSubcategory: "", 
        sortOrder: 50,
        competitionType: "leaderboard",
        scoringMethod: "time"
      },
      // Esports expansions
      { 
        id: "1754813900000x430000000000000000", 
        sportName: "Dota 2", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 51,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754814000000x440000000000000000", 
        sportName: "Overwatch", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 52,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754814100000x450000000000000000", 
        sportName: "Rocket League", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 53,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      { 
        id: "1754814200000x460000000000000000", 
        sportName: "Fortnite", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 54,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754814300000x470000000000000000", 
        sportName: "FIFA", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 55,
        competitionType: "bracket",
        scoringMethod: "wins"
      },
      // Creative Arts
      { 
        id: "1754814400000x480000000000000000", 
        sportName: "Dance Competition", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 56,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754814500000x490000000000000000", 
        sportName: "Art Competition", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 57,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754814600000x500000000000000000", 
        sportName: "Music Competition", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 58,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754814700000x510000000000000000", 
        sportName: "Photography Contest", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 59,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      // Professional Services
      { 
        id: "1754814800000x520000000000000000", 
        sportName: "Sales Competition", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 60,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754814900000x530000000000000000", 
        sportName: "Coding Competition", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 61,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754815000000x540000000000000000", 
        sportName: "Hackathon", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 62,
        competitionType: "leaderboard",
        scoringMethod: "points"
      },
      { 
        id: "1754815100000x550000000000000000", 
        sportName: "Business Case Competition", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 63,
        competitionType: "bracket",
        scoringMethod: "points"
      }
    ];

    for (const sport of sportOptionsData) {
      await storage.createSportOption(sport);
    }

    // Import Track & Field events
    if (sportOptionsData.find(s => s.sportName.includes("Track & Field"))) {
      const trackFieldEvents = [
        // Running Events - Sprints
        { id: "tf-100m", eventName: "100 Meter Dash", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 1 },
        { id: "tf-200m", eventName: "200 Meter Dash", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 2 },
        { id: "tf-400m", eventName: "400 Meter Dash", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 3 },
        
        // Running Events - Middle Distance
        { id: "tf-800m", eventName: "800 Meter Run", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 4 },
        { id: "tf-1600m", eventName: "1600 Meter Run", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 5 },
        
        // Running Events - Long Distance  
        { id: "tf-3200m", eventName: "3200 Meter Run", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 6 },
        
        // Hurdles
        { id: "tf-110h", eventName: "110 Meter Hurdles", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, gender: "male", sortOrder: 7 },
        { id: "tf-100h", eventName: "100 Meter Hurdles", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, gender: "female", sortOrder: 8 },
        { id: "tf-300h", eventName: "300 Meter Hurdles", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 9 },
        
        // Jumping Events
        { id: "tf-hj", eventName: "High Jump", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "height", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 10 },
        { id: "tf-pv", eventName: "Pole Vault", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "height", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 11 },
        { id: "tf-lj", eventName: "Long Jump", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "distance", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 12 },
        { id: "tf-tj", eventName: "Triple Jump", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "distance", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 13 },
        
        // Throwing Events
        { id: "tf-shot", eventName: "Shot Put", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 14 },
        { id: "tf-discus", eventName: "Discus Throw", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 15 },
        { id: "tf-hammer", eventName: "Hammer Throw", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 16 },
        { id: "tf-javelin", eventName: "Javelin Throw", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 17 },
        
        // Relays
        { id: "tf-4x100", eventName: "4x100 Meter Relay", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 18 },
        { id: "tf-4x400", eventName: "4x400 Meter Relay", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time", measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 19 },
      ];

      for (const event of trackFieldEvents) {
        await storage.createSportEvent(event);
      }
    }
  }

  async function advanceWinner(tournamentId: string, round: number, position: number, winner: string) {
    const storage = await getStorage();
    const nextRound = round + 1;
    const nextPosition = Math.floor(position / 2);
    
    const allMatches = await storage.getMatchesByTournament(tournamentId);
    const nextMatch = allMatches.find(m => m.round === nextRound && m.position === nextPosition);
    
    if (nextMatch) {
      const isFirstTeam = position % 2 === 0;
      const updateData = isFirstTeam ? { team1: winner } : { team2: winner };
      await storage.updateMatch(nextMatch.id, updateData);
    }
    
    // Check if tournament is completed
    const finalMatch = allMatches.find(m => m.round === Math.max(...allMatches.map(m => m.round)));
    if (finalMatch?.winner) {
      await storage.updateTournament(tournamentId, { status: "completed" });
    } else {
      // Check if tournament should be in progress
      const hasStartedMatches = allMatches.some(m => m.status === "in-progress" || m.status === "completed");
      if (hasStartedMatches) {
        await storage.updateTournament(tournamentId, { status: "stage-1" });
      }
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
