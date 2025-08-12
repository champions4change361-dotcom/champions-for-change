import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, getStorage } from "./storage";
import { insertTournamentSchema, updateMatchSchema } from "@shared/schema";
import { analyzeTournamentQuery, generateTournamentStructure, type KeystoneConsultationResult } from "./ai-consultation";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";
import { z } from "zod";

// Initialize Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('⚠️  No Stripe account configured for Champions for Change');
  console.log('📋 Please create a new Stripe account at https://stripe.com');
  console.log('📧 Use champions4change361@gmail.com for the business email');
  console.log('🏢 Business: Champions for Change (Nonprofit)');
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY - See STRIPE_SETUP_GUIDE.md');
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
console.log(`🔑 Champions for Change payment system ready`);
console.log(`🔑 Key ends with: ...${stripeKey.slice(-15)}`);
console.log(`🔑 Live mode enabled for real donations`);

const stripe = new Stripe(stripeKey, {
  apiVersion: "2024-11-20.acacia", // More stable version
});

// Test the key immediately
stripe.accounts.retrieve().then(() => {
  console.log('✅ Stripe key validation successful');
}).catch((err) => {
  console.error('❌ Stripe key validation failed:', err.message);
});

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
  // Setup authentication middleware
  await setupAuth(app);
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
  app.post("/api/tournaments", isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertTournamentSchema.parse(req.body);
      const storage = await getStorage();
      
      // Add user ID to tournament data
      const tournamentData = {
        ...validatedData,
        userId: req.user.claims.sub
      };
      
      // Create tournament
      const tournament = await storage.createTournament(tournamentData);
      
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
          competitionType: "bracket" as const as const,
          scoringMethod: "wins" as const as const
        },
        { 
          id: "1754180977955x395946833660146800", 
          sportName: "Soccer", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "bracket" as const as const,
          scoringMethod: "wins" as const as const
        },
        { 
          id: "1754181015919x333498357441713860", 
          sportName: "Football", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754181255196x388986311669203840", 
          sportName: "Track & Field(Sprints, Distance, Field Events)", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 1,
          competitionType: "leaderboard" as const,
          scoringMethod: "time" as const,
          measurementUnit: "seconds"
        },
        { 
          id: "1754181223028x396723622458883260", 
          sportName: "Tennis", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754181187121x526423864176922750", 
          sportName: "Golf", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "leaderboard" as const,
          scoringMethod: "points" as const,
          measurementUnit: "strokes"
        },
        { 
          id: "1754181287630x265470261364728830", 
          sportName: "Swimming", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 4,
          competitionType: "leaderboard" as const,
          scoringMethod: "time" as const,
          measurementUnit: "seconds"
        },
        { 
          id: "1754186198614x721676290099525500", 
          sportName: "League of Legends", 
          sportCategory: "1754106388289x383805117761464300", 
          sportSubcategory: "", 
          sortOrder: 6,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754186227104x911583160186015100", 
          sportName: "CS:GO", 
          sportCategory: "1754106388289x383805117761464300", 
          sportSubcategory: "", 
          sortOrder: 7,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754186254060x898039150049687400", 
          sportName: "Valorant", 
          sportCategory: "1754106388289x383805117761464300", 
          sportSubcategory: "", 
          sortOrder: 8,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754808200000x123456789012345600", 
          sportName: "Fishing & Angling", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 9,
          competitionType: "leaderboard" as const,
          scoringMethod: "points" as const,
          measurementUnit: "weight"
        },
        { 
          id: "1754808300000x987654321098765400", 
          sportName: "Hunting & Wildlife", 
          sportCategory: "1753907823621x983678515921424100", 
          sportSubcategory: "", 
          sortOrder: 10,
          competitionType: "leaderboard" as const,
          scoringMethod: "points" as const,
          measurementUnit: "points"
        },
        // Missing Team Sports
        { 
          id: "1754808400000x111111111111111100", 
          sportName: "Baseball", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 4,
          competitionType: "series" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754808500000x222222222222222200", 
          sportName: "Softball", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 5,
          competitionType: "both" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754808600000x333333333333333300", 
          sportName: "Hockey", 
          sportCategory: "1753907759981x546774752330226900", 
          sportSubcategory: "", 
          sortOrder: 6,
          competitionType: "series" as const,
          scoringMethod: "wins" as const
        },
        // Culinary Competitions
        { 
          id: "1754808700000x444444444444444400", 
          sportName: "BBQ Cook-Off", 
          sportCategory: "1754808800000x555555555555555500", 
          sportSubcategory: "", 
          sortOrder: 1,
          competitionType: "both" as const,
          scoringMethod: "points" as const
        },
        { 
          id: "1754808710000x444444444444444500", 
          sportName: "Cooking Competition", 
          sportCategory: "1754808800000x555555555555555500", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "both" as const,
          scoringMethod: "points" as const
        },
        { 
          id: "1754808720000x444444444444444600", 
          sportName: "Eating Competition", 
          sportCategory: "1754808800000x555555555555555500", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "leaderboard" as const,
          scoringMethod: "points" as const,
          measurementUnit: "amount"
        },
        // Academic Competitions
        { 
          id: "1754808730000x666666666666666600", 
          sportName: "Spelling Bee", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 1,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
        },
        { 
          id: "1754808740000x666666666666666700", 
          sportName: "Math Bowl", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 2,
          competitionType: "both" as const,
          scoringMethod: "points" as const
        },
        { 
          id: "1754808750000x666666666666666800", 
          sportName: "Science Bowl", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 3,
          competitionType: "both" as const,
          scoringMethod: "points" as const
        },
        { 
          id: "1754808760000x666666666666666900", 
          sportName: "Quiz Bowl", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 4,
          competitionType: "both" as const,
          scoringMethod: "points" as const
        },
        { 
          id: "1754808770000x666666666666667000", 
          sportName: "Debate Tournament", 
          sportCategory: "1754808810000x777777777777777700", 
          sportSubcategory: "", 
          sortOrder: 5,
          competitionType: "bracket" as const,
          scoringMethod: "wins" as const
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
      let sports = await storage.getSportOptions();
      
      // If no sports exist, auto-import the default sports
      if (sports.length === 0) {
        console.log("No sports found, auto-importing default sports data...");
        await importDefaultSportsData();
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
  async function importDefaultSportsData() {
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
        competitionType: "bracket-to-series" as const,
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
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754181255196x388986311669203840", 
        sportName: "Track & Field (Sprints, Distance, Field Events)", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 1,
        competitionType: "leaderboard" as const,
        scoringMethod: "time" as const,
        measurementUnit: "seconds"
      },
      { 
        id: "1754181223028x396723622458883260", 
        sportName: "Tennis", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 2,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754181187121x526423864176922750", 
        sportName: "Golf", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 3,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const,
        measurementUnit: "strokes"
      },
      { 
        id: "1754181287630x265470261364728830", 
        sportName: "Swimming", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 4,
        competitionType: "leaderboard" as const,
        scoringMethod: "time" as const,
        measurementUnit: "seconds"
      },
      { 
        id: "1754186198614x721676290099525500", 
        sportName: "League of Legends", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 6,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754186227104x911583160186015100", 
        sportName: "CS:GO", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 7,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754186254060x898039150049687400", 
        sportName: "Valorant", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 8,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754808200000x123456789012345600", 
        sportName: "Fishing & Angling", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 9,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const,
        measurementUnit: "weight"
      },
      { 
        id: "1754808300000x987654321098765400", 
        sportName: "Hunting & Wildlife", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 10,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const,
        measurementUnit: "points"
      },
      // Professional sports with bracket-to-series format
      { 
        id: "1754809100000x111111111111111100", 
        sportName: "Baseball", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 11,
        competitionType: "bracket-to-series" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754809200000x222222222222222200", 
        sportName: "Hockey", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 12,
        competitionType: "bracket-to-series" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754809300000x333333333333333300", 
        sportName: "Softball", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 13,
        competitionType: "both" as const,
        scoringMethod: "wins" as const
      },
      // Culinary competitions
      { 
        id: "1754809400000x444444444444444400", 
        sportName: "BBQ Cook-Off", 
        sportCategory: "1754808800000x555555555555555500", 
        sportSubcategory: "", 
        sortOrder: 14,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754809600000x666666666666666600", 
        sportName: "Cooking Competition", 
        sportCategory: "1754808800000x555555555555555500", 
        sportSubcategory: "", 
        sortOrder: 15,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754809700000x777777777777777700", 
        sportName: "Eating Competition", 
        sportCategory: "1754808800000x555555555555555500", 
        sportSubcategory: "", 
        sortOrder: 16,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      // Academic competitions
      { 
        id: "1754809800000x888888888888888800", 
        sportName: "Spelling Bee", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 17,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754810000000x100000000000000000", 
        sportName: "Math Bowl", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 18,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754810100000x110000000000000000", 
        sportName: "Science Bowl", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 19,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754810200000x120000000000000000", 
        sportName: "Quiz Bowl", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 20,
        competitionType: "bracket" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754810300000x130000000000000000", 
        sportName: "Debate Tournament", 
        sportCategory: "1754808810000x777777777777777700", 
        sportSubcategory: "", 
        sortOrder: 21,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      // Major missing team sports
      { 
        id: "1754811000000x140000000000000000", 
        sportName: "Volleyball", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 22,
        competitionType: "bracket-to-series" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754811100000x150000000000000000", 
        sportName: "Rugby", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 23,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754811200000x160000000000000000", 
        sportName: "Cricket", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 24,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754811300000x170000000000000000", 
        sportName: "Lacrosse", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 25,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754811400000x180000000000000000", 
        sportName: "Field Hockey", 
        sportCategory: "1753907759981x546774752330226900", 
        sportSubcategory: "", 
        sortOrder: 26,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      // Combat Sports
      { 
        id: "1754811500000x190000000000000000", 
        sportName: "Boxing", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 27,
        competitionType: "bracket" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754811600000x200000000000000000", 
        sportName: "Wrestling", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 28,
        competitionType: "bracket" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754811700000x210000000000000000", 
        sportName: "Martial Arts (Karate)", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 29,
        competitionType: "bracket" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754811800000x220000000000000000", 
        sportName: "Judo", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 30,
        competitionType: "bracket" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754811900000x230000000000000000", 
        sportName: "Taekwondo", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 31,
        competitionType: "bracket" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754812000000x240000000000000000", 
        sportName: "MMA", 
        sportCategory: "1754810400000x800000000000000000", 
        sportSubcategory: "", 
        sortOrder: 32,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      // Water Sports
      { 
        id: "1754812100000x250000000000000000", 
        sportName: "Water Polo", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 33,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754812200000x260000000000000000", 
        sportName: "Diving", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 34,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754812300000x270000000000000000", 
        sportName: "Synchronized Swimming", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 35,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754812400000x280000000000000000", 
        sportName: "Surfing", 
        sportCategory: "1754810500000x900000000000000000", 
        sportSubcategory: "", 
        sortOrder: 36,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      // Winter Sports
      { 
        id: "1754812500000x290000000000000000", 
        sportName: "Ice Hockey", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 37,
        competitionType: "bracket-to-series" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754812600000x300000000000000000", 
        sportName: "Figure Skating", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 38,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754812700000x310000000000000000", 
        sportName: "Skiing", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 39,
        competitionType: "leaderboard" as const,
        scoringMethod: "time" as const
      },
      { 
        id: "1754812800000x320000000000000000", 
        sportName: "Snowboarding", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 40,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754812900000x330000000000000000", 
        sportName: "Curling", 
        sportCategory: "1754810600000x111111111111111111", 
        sportSubcategory: "", 
        sortOrder: 41,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      // Individual Sports expansions
      { 
        id: "1754813000000x340000000000000000", 
        sportName: "Badminton", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 42,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754813100000x350000000000000000", 
        sportName: "Table Tennis", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 43,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754813200000x360000000000000000", 
        sportName: "Archery", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 44,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754813300000x370000000000000000", 
        sportName: "Cycling", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 45,
        competitionType: "leaderboard" as const,
        scoringMethod: "time" as const
      },
      { 
        id: "1754813400000x380000000000000000", 
        sportName: "Gymnastics", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 46,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754813500000x390000000000000000", 
        sportName: "Weightlifting", 
        sportCategory: "1753907823621x983678515921424100", 
        sportSubcategory: "", 
        sortOrder: 47,
        competitionType: "leaderboard" as const,
        scoringMethod: "weight"
      },
      { 
        id: "1754813600000x400000000000000000", 
        sportName: "Rock Climbing", 
        sportCategory: "1754810700000x222222222222222222", 
        sportSubcategory: "", 
        sortOrder: 48,
        competitionType: "leaderboard" as const,
        scoringMethod: "time" as const
      },
      { 
        id: "1754813700000x410000000000000000", 
        sportName: "Skateboarding", 
        sportCategory: "1754810700000x222222222222222222", 
        sportSubcategory: "", 
        sortOrder: 49,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754813800000x420000000000000000", 
        sportName: "BMX", 
        sportCategory: "1754810700000x222222222222222222", 
        sportSubcategory: "", 
        sortOrder: 50,
        competitionType: "leaderboard" as const,
        scoringMethod: "time" as const
      },
      // Esports expansions
      { 
        id: "1754813900000x430000000000000000", 
        sportName: "Dota 2", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 51,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754814000000x440000000000000000", 
        sportName: "Overwatch", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 52,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754814100000x450000000000000000", 
        sportName: "Rocket League", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 53,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      { 
        id: "1754814200000x460000000000000000", 
        sportName: "Fortnite", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 54,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754814300000x470000000000000000", 
        sportName: "FIFA", 
        sportCategory: "1754106388289x383805117761464300", 
        sportSubcategory: "", 
        sortOrder: 55,
        competitionType: "bracket" as const,
        scoringMethod: "wins" as const
      },
      // Creative Arts
      { 
        id: "1754814400000x480000000000000000", 
        sportName: "Dance Competition", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 56,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754814500000x490000000000000000", 
        sportName: "Art Competition", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 57,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754814600000x500000000000000000", 
        sportName: "Music Competition", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 58,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754814700000x510000000000000000", 
        sportName: "Photography Contest", 
        sportCategory: "1754810900000x444444444444444444", 
        sportSubcategory: "", 
        sortOrder: 59,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      // Professional Services
      { 
        id: "1754814800000x520000000000000000", 
        sportName: "Sales Competition", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 60,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754814900000x530000000000000000", 
        sportName: "Coding Competition", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 61,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754815000000x540000000000000000", 
        sportName: "Hackathon", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 62,
        competitionType: "leaderboard" as const,
        scoringMethod: "points" as const
      },
      { 
        id: "1754815100000x550000000000000000", 
        sportName: "Business Case Competition", 
        sportCategory: "1754810800000x333333333333333333", 
        sportSubcategory: "", 
        sortOrder: 63,
        competitionType: "bracket" as const,
        scoringMethod: "points" as const
      }
    ];

    for (const sport of sportOptionsData) {
      await storage.createSportOption(sport);
    }

    // Import Track & Field events
    if (sportOptionsData.find(s => s.sportName.includes("Track & Field"))) {
      const trackFieldEvents = [
        // Running Events - Sprints
        { id: "tf-100m", eventName: "100 Meter Dash", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 1 },
        { id: "tf-200m", eventName: "200 Meter Dash", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 2 },
        { id: "tf-400m", eventName: "400 Meter Dash", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 3 },
        
        // Running Events - Middle Distance
        { id: "tf-800m", eventName: "800 Meter Run", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 4 },
        { id: "tf-1600m", eventName: "1600 Meter Run", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 5 },
        
        // Running Events - Long Distance  
        { id: "tf-3200m", eventName: "3200 Meter Run", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 6 },
        
        // Hurdles
        { id: "tf-110h", eventName: "110 Meter Hurdles", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, gender: "male", sortOrder: 7 },
        { id: "tf-100h", eventName: "100 Meter Hurdles", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, gender: "female", sortOrder: 8 },
        { id: "tf-300h", eventName: "300 Meter Hurdles", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 9 },
        
        // Jumping Events
        { id: "tf-hj", eventName: "High Jump", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "height", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 10 },
        { id: "tf-pv", eventName: "Pole Vault", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "height", measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 11 },
        { id: "tf-lj", eventName: "Long Jump", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "distance" as const, measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 12 },
        { id: "tf-tj", eventName: "Triple Jump", sportId: "1754181255196x388986311669203840", eventType: "jumping", scoringMethod: "distance" as const, measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 13 },
        
        // Throwing Events
        { id: "tf-shot", eventName: "Shot Put", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance" as const, measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 14 },
        { id: "tf-discus", eventName: "Discus Throw", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance" as const, measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 15 },
        { id: "tf-hammer", eventName: "Hammer Throw", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance" as const, measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 16 },
        { id: "tf-javelin", eventName: "Javelin Throw", sportId: "1754181255196x388986311669203840", eventType: "throwing", scoringMethod: "distance" as const, measurementUnit: "meters", supportsMetric: true, supportsImperial: true, sortOrder: 17 },
        
        // Relays
        { id: "tf-4x100", eventName: "4x100 Meter Relay", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 18 },
        { id: "tf-4x400", eventName: "4x400 Meter Relay", sportId: "1754181255196x388986311669203840", eventType: "running", scoringMethod: "time" as const, measurementUnit: "seconds", supportsMetric: true, supportsImperial: false, sortOrder: 19 },
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

  // AI Consultation Endpoints
  app.get('/api/test', (req, res) => {
    res.json({
      status: 'Tournament AI Service Online!',
      message: 'Ready for intelligent tournament consultation',
      timestamp: new Date().toISOString(),
      sports_loaded: 65,
      ai_ready: true
    });
  });

  // Enhanced Keystone AI Consultation with Three-Tier Service Model
  app.post('/api/keystone-consult', async (req, res) => {
    try {
      const { user_input, tier = 'consultation', subscription_level = 'free' } = req.body;
      
      if (!user_input) {
        return res.status(400).json({
          success: false,
          error: 'Please provide user_input'
        });
      }
      
      // Get comprehensive AI analysis
      const result: KeystoneConsultationResult = analyzeTournamentQuery(user_input);
      
      // Tier access control based on subscription
      const response: any = {
        success: true,
        tier: tier, // Use the requested tier, not result.tier
        sport: result.sport,
        format: result.format,
        age_group: result.age_group,
        gender_division: result.gender_division,
        confidence: result.confidence,
        recommendation: result.recommendation,
        estimated_participants: result.estimated_participants,
        timestamp: new Date().toISOString(),
        query_analyzed: user_input
      };

      // Tier 1: Tournament Consultation & Ideas (Available to all users)
      response.tier1_consultation = {
        strategic_suggestions: result.tier1_suggestions,
        venue_suggestions: result.venue_suggestions,
        schedule_template: result.schedule_template,
        champions_for_change_integration: {
          fundraising_opportunities: [
            "Tournament registration fees go toward student trips",
            "Concession sales with educational impact messaging",
            "Sponsor recognition highlighting community investment in youth"
          ],
          educational_tie_ins: [
            "Pre-tournament presentations about destination countries",
            "Cultural exchange activities during breaks",
            "Post-tournament travel planning sessions"
          ]
        }
      };

      // Tier 2: Auto-Generation (Requires Basic+ subscription)
      if (subscription_level !== 'free' && (tier === 'generation' || tier === 'full-service')) {
        response.tier2_generation = {
          auto_bracket: result.tier2_structure,
          participant_assignments: result.tier2_structure?.participants || [],
          score_tracking_setup: {
            performance_metrics: result.tier2_structure?.type === 'leaderboard' ? 'individual_scoring' : 'match_based',
            real_time_updates: true,
            mobile_friendly: true
          }
        };
      } else if (subscription_level === 'free') {
        response.tier2_preview = {
          feature_available: false,
          upgrade_message: "Upgrade to Basic plan for auto-bracket generation",
          sample_structure: "8-team single elimination bracket with Champions for Change branding"
        };
      }

      // Tier 3: Full Service with Custom Webpage (Requires Pro+ subscription)
      if ((subscription_level === 'pro' || subscription_level === 'enterprise') && tier === 'full-service') {
        response.tier3_full_service = {
          custom_webpage: {
            template_code: result.tier3_webpage_template,
            domain_suggestions: [
              `${result.sport.toLowerCase().replace(/\s+/g, '')}-tournament.champions4change.org`,
              `${result.age_group.toLowerCase().replace(/\s+/g, '')}-${result.sport.toLowerCase().replace(/\s+/g, '')}.c4c-tournaments.com`
            ],
            seo_optimization: {
              title: `${result.sport} ${result.age_group} Tournament | Champions for Change`,
              description: `Join our ${result.sport} tournament supporting educational trips for Corpus Christi youth`,
              keywords: `${result.sport}, tournament, education, Corpus Christi, Champions for Change`
            }
          },
          complete_tournament_setup: true,
          dedicated_support: "Priority email and phone support from Daniel Thornton",
          custom_branding: {
            logo_placement: "Champions for Change logo with custom tournament banner",
            color_scheme: "Green and blue Champions for Change branding",
            mission_integration: "Educational impact tracker and trip funding progress"
          }
        };
      } else if (subscription_level !== 'pro' && subscription_level !== 'enterprise') {
        response.tier3_preview = {
          feature_available: false,
          upgrade_message: "Upgrade to Pro plan for full-service tournament creation with custom webpages",
          sample_features: ["Custom branded tournament website", "Complete setup service", "Priority support from Daniel"]
        };
      }

      res.json(response);
      
    } catch (error) {
      console.error('Keystone Consultation Error:', error);
      res.status(500).json({
        success: false,
        error: 'Keystone consultation failed: ' + (error as Error).message
      });
    }
  });

  // Legacy endpoint for backward compatibility
  app.post('/api/quick-consult', (req, res) => {
    try {
      const { user_input } = req.body;
      
      if (!user_input) {
        return res.status(400).json({
          success: false,
          error: 'Please provide user_input'
        });
      }
      
      // AI analysis using the imported function
      const result = analyzeTournamentQuery(user_input);
      
      res.json({
        success: true,
        recommendation: result.recommendation,
        sport: result.sport,
        format: result.format,
        age_group: result.age_group,
        gender_division: result.gender_division,
        confidence: result.confidence,
        timestamp: new Date().toISOString(),
        query_analyzed: user_input
      });
      
    } catch (error) {
      console.error('AI Consultation Error:', error);
      res.status(500).json({
        success: false,
        error: 'AI consultation failed: ' + (error as Error).message
      });
    }
  });

  // AI auto-build tournament endpoint
  app.post('/api/ai-build-tournament', async (req, res) => {
    try {
      const { user_input } = req.body;
      
      if (!user_input) {
        return res.status(400).json({
          success: false,
          error: 'Please provide user_input'
        });
      }
      
      // Get AI analysis
      const aiResult = analyzeTournamentQuery(user_input);
      
      // Extract team size from user input or use default
      let teamSize = 8;
      
      // Try multiple patterns to extract team count
      const sizePatterns = [
        /(\d+)\s*teams?/i,
        /(\d+)\s*team/i,
        /(\d+)\s*participant/i,
        /(\d+)\s*player/i,
        /(\d+)\s*school/i,
        /(\d+)\s*compet/i,
        /for\s+(\d+)/i,
        /with\s+(\d+)/i,
        /(\d+)\s*(?:people|individuals|entries)/i
      ];
      
      for (const pattern of sizePatterns) {
        const match = user_input.match(pattern);
        if (match) {
          teamSize = parseInt(match[1]);
          break;
        }
      }
      
      // Fallback word-based detection
      if (teamSize === 8) {
        if (user_input.includes('20') || user_input.includes('twenty')) {
          teamSize = 20;
        }
        else if (user_input.includes('16') || user_input.includes('sixteen')) teamSize = 16;
        else if (user_input.includes('32') || user_input.includes('thirty')) teamSize = 32;
        else if (user_input.includes('12') || user_input.includes('twelve')) teamSize = 12;
        else if (user_input.includes('24') || user_input.includes('twenty-four')) teamSize = 24;
      }
      
      const tournamentName = `${aiResult.age_group !== "All Ages" ? aiResult.age_group + " " : ""}${aiResult.gender_division !== "Mixed" ? aiResult.gender_division + " " : ""}${aiResult.sport} Tournament`;
      
      // Generate tournament structure with proper bracket and teams
      const tournamentStructure = generateTournamentStructure(aiResult.sport, aiResult.format, teamSize, aiResult.age_group, aiResult.gender_division);
      
      // Create the tournament in the database
      const storage = await getStorage();
      const tournament = await storage.createTournament({
        name: tournamentName,
        sport: aiResult.sport,
        teamSize: teamSize,
        tournamentType: aiResult.format === "leaderboard" ? "round-robin" : "single",
        competitionFormat: aiResult.format as any,
        ageGroup: aiResult.age_group as any,
        genderDivision: aiResult.gender_division as any,
        status: "stage-1",
        bracket: tournamentStructure.structure,
        participants: tournamentStructure.participants || []
      });
      
      res.json({
        success: true,
        tournament,
        structure: tournamentStructure,
        ai_analysis: aiResult,
        message: `✨ AI has created a complete ${aiResult.format} tournament for ${aiResult.sport} with ${teamSize} ${tournamentStructure.type === "leaderboard" ? "participants" : "teams"}!`
      });
      
    } catch (error) {
      console.error('AI Tournament Build Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to build tournament: ' + (error as Error).message
      });
    }
  });

  // Tournament insights endpoint
  app.get('/api/tournament-insights', async (req, res) => {
    try {
      const storage = await getStorage();
      const tournaments = await storage.getTournaments();
      const sports = await storage.getSportOptions();
      
      const insights = {
        total_tournaments: tournaments.length,
        active_tournaments: tournaments.filter(t => t.status === 'stage-1' || t.status === 'stage-2').length,
        completed_tournaments: tournaments.filter(t => t.status === 'completed').length,
        popular_sports: sports.slice(0, 10).map(s => ({ 
          name: s.sportName, 
          category: s.sportCategory,
          format: s.competitionType 
        })),
        total_sports_available: sports.length,
        format_breakdown: {
          bracket: sports.filter(s => s.competitionType?.includes('bracket')).length,
          leaderboard: sports.filter(s => s.competitionType === 'leaderboard').length,
          series: sports.filter(s => s.competitionType === 'series').length,
          hybrid: sports.filter(s => s.competitionType === 'both').length
        }
      };
      
      res.json({ success: true, insights });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate tournament insights'
      });
    }
  });

  // Debug route to check auth configuration
  app.get('/api/auth/debug', async (req, res) => {
    res.json({
      current_domain: req.get('host'),
      hostname: req.hostname,
      supported_domains: process.env.REPLIT_DOMAINS?.split(',') || [],
      trantortournaments_supported: req.hostname === 'trantortournaments.org',
      oauth_configured: !!process.env.REPL_ID,
      issuer_url: process.env.ISSUER_URL || 'https://replit.com/oidc',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });

  // Authentication routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      // Try to get user, if not found create from session claims
      let user = await storage.getUser(userId);
      if (!user && req.user.claims) {
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email || 'admin@championsforchange.net',
          firstName: req.user.claims.first_name || 'Daniel',
          lastName: req.user.claims.last_name || 'Thornton',
          profileImageUrl: req.user.claims.profile_image_url || null
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Contact management routes
  app.get('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.getContacts(userId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Failed to fetch contacts" });
    }
  });

  app.get('/api/contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      // Verify ownership
      if (contact.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching contact:", error);
      res.status(500).json({ message: "Failed to fetch contact" });
    }
  });

  app.post('/api/contacts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contactData = { ...req.body, userId };
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(500).json({ message: "Failed to create contact" });
    }
  });

  app.post('/api/contacts/import', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contacts: contactsData } = req.body;
      
      // Add userId to each contact
      const contactsWithUserId = contactsData.map((contact: any) => ({
        ...contact,
        userId,
      }));
      
      const importedContacts = await storage.importContacts(userId, contactsWithUserId);
      res.json(importedContacts);
    } catch (error) {
      console.error("Error importing contacts:", error);
      res.status(500).json({ message: "Failed to import contacts" });
    }
  });

  app.patch('/api/contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      // Verify ownership
      if (contact.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedContact = await storage.updateContact(req.params.id, req.body);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(500).json({ message: "Failed to update contact" });
    }
  });

  app.delete('/api/contacts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      // Verify ownership
      if (contact.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteContact(req.params.id);
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      console.error("Error deleting contact:", error);
      res.status(500).json({ message: "Failed to delete contact" });
    }
  });

  app.get('/api/contacts/search/:query', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contacts = await storage.searchContacts(userId, req.params.query);
      res.json(contacts);
    } catch (error) {
      console.error("Error searching contacts:", error);
      res.status(500).json({ message: "Failed to search contacts" });
    }
  });

  // White-label configuration routes
  app.post('/api/whitelabel-config', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const configData = req.body;
      
      const config = await storage.createWhitelabelConfig({
        ...configData,
        userId
      });
      
      res.json(config);
    } catch (error) {
      console.error("Error creating white-label config:", error);
      res.status(500).json({ message: "Failed to create configuration" });
    }
  });

  app.get('/api/whitelabel-config/:domain', async (req, res) => {
    try {
      const { domain } = req.params;
      const config = await storage.getWhitelabelConfigByDomain(domain);
      
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error fetching white-label config:", error);
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  app.get('/api/whitelabel-config/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const config = await storage.getWhitelabelConfigByUserId(userId);
      
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error fetching white-label config:", error);
      res.status(500).json({ message: "Failed to fetch configuration" });
    }
  });

  app.patch('/api/whitelabel-config/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      // Check if user owns this config
      const existingConfig = await storage.getWhitelabelConfig(id);
      if (!existingConfig || existingConfig.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const config = await storage.updateWhitelabelConfig(id, updates);
      
      if (!config) {
        return res.status(404).json({ message: "Configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      console.error("Error updating white-label config:", error);
      res.status(500).json({ message: "Failed to update configuration" });
    }
  });

  // Page management routes
  app.post('/api/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pageData = { ...req.body, userId };
      
      const page = await storage.createPage(pageData);
      res.json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.get('/api/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pages = await storage.getPagesByUserId(userId);
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const page = await storage.getPage(id);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.patch('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      // Check if user owns this page
      const existingPage = await storage.getPage(id);
      if (!existingPage || existingPage.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const page = await storage.updatePage(id, updates);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete('/api/pages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user owns this page
      const existingPage = await storage.getPage(id);
      if (!existingPage || existingPage.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deletePage(id);
      
      if (!success) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Team registration routes
  app.post('/api/team-registrations', isAuthenticated, async (req: any, res) => {
    try {
      const coachId = req.user.claims.sub;
      const registrationData = { ...req.body, coachId };
      
      const registration = await storage.createTeamRegistration(registrationData);
      res.json(registration);
    } catch (error) {
      console.error("Error creating team registration:", error);
      res.status(500).json({ message: "Failed to create team registration" });
    }
  });

  app.get('/api/team-registrations/mine', isAuthenticated, async (req: any, res) => {
    try {
      const coachId = req.user.claims.sub;
      const registrations = await storage.getTeamRegistrationsByCoach(coachId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching team registrations:", error);
      res.status(500).json({ message: "Failed to fetch team registrations" });
    }
  });

  app.get('/api/team-registrations/:tournamentId', isAuthenticated, async (req: any, res) => {
    try {
      const { tournamentId } = req.params;
      const registrations = await storage.getTeamRegistrationsByTournament(tournamentId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching tournament registrations:", error);
      res.status(500).json({ message: "Failed to fetch tournament registrations" });
    }
  });

  app.patch('/api/team-registrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const registration = await storage.updateTeamRegistration(id, updates);
      
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json(registration);
    } catch (error) {
      console.error("Error updating team registration:", error);
      res.status(500).json({ message: "Failed to update team registration" });
    }
  });

  app.delete('/api/team-registrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTeamRegistration(id);
      
      if (!success) {
        return res.status(404).json({ message: "Registration not found" });
      }
      
      res.json({ message: "Registration deleted successfully" });
    } catch (error) {
      console.error("Error deleting team registration:", error);
      res.status(500).json({ message: "Failed to delete team registration" });
    }
  });

  // Tournament routes for managers
  app.get('/api/my-tournaments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tournaments = await storage.getTournaments();
      
      // Filter tournaments created by this user
      const myTournaments = tournaments.filter((t: any) => t.userId === userId);
      res.json(myTournaments);
    } catch (error) {
      console.error("Error fetching user tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  // Public tournament routes for athletes/fans
  app.get('/api/tournaments/public', async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      
      // Filter only public tournaments
      const publicTournaments = tournaments.filter((t: any) => t.isPublic === true);
      res.json(publicTournaments);
    } catch (error) {
      console.error("Error fetching public tournaments:", error);
      res.status(500).json({ message: "Failed to fetch public tournaments" });
    }
  });

  app.get('/api/tournaments/featured', async (req, res) => {
    try {
      const tournaments = await storage.getTournaments();
      
      // For now, featured tournaments are those with high participation or special status
      const featuredTournaments = tournaments.filter((t: any) => 
        t.isPublic === true && (t.teams?.length > 10 || t.entryFee > 0)
      );
      res.json(featuredTournaments);
    } catch (error) {
      console.error("Error fetching featured tournaments:", error);
      res.status(500).json({ message: "Failed to fetch featured tournaments" });
    }
  });

  app.get('/api/tournaments/followed', isAuthenticated, async (req: any, res) => {
    try {
      // For now, return empty array. This would be expanded with user preferences
      res.json([]);
    } catch (error) {
      console.error("Error fetching followed tournaments:", error);
      res.status(500).json({ message: "Failed to fetch followed tournaments" });
    }
  });

  // Scorekeeper assignment routes
  app.post('/api/scorekeeper-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const assignedById = req.user.claims.sub;
      const assignmentData = { ...req.body, assignedById };
      
      const assignment = await storage.createScorekeeperAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating scorekeeper assignment:", error);
      res.status(500).json({ message: "Failed to create scorekeeper assignment" });
    }
  });

  app.get('/api/scorekeeper-assignments/mine', isAuthenticated, async (req: any, res) => {
    try {
      const scorekeeperId = req.user.claims.sub;
      const assignments = await storage.getScorekeeperAssignmentsByUser(scorekeeperId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching scorekeeper assignments:", error);
      res.status(500).json({ message: "Failed to fetch scorekeeper assignments" });
    }
  });

  app.get('/api/scorekeeper-assignments/:tournamentId', isAuthenticated, async (req: any, res) => {
    try {
      const { tournamentId } = req.params;
      const assignments = await storage.getScorekeeperAssignmentsByTournament(tournamentId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching tournament scorekeeper assignments:", error);
      res.status(500).json({ message: "Failed to fetch scorekeeper assignments" });
    }
  });

  app.patch('/api/scorekeeper-assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const assignment = await storage.updateScorekeeperAssignment(id, updates);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      res.json(assignment);
    } catch (error) {
      console.error("Error updating scorekeeper assignment:", error);
      res.status(500).json({ message: "Failed to update scorekeeper assignment" });
    }
  });

  app.delete('/api/scorekeeper-assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteScorekeeperAssignment(id);
      
      if (!success) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting scorekeeper assignment:", error);
      res.status(500).json({ message: "Failed to delete scorekeeper assignment" });
    }
  });

  // Event score routes
  app.post('/api/event-scores', isAuthenticated, async (req: any, res) => {
    try {
      const scoredById = req.user.claims.sub;
      const scoreData = { ...req.body, scoredById };
      
      const score = await storage.createEventScore(scoreData);
      res.json(score);
    } catch (error) {
      console.error("Error creating event score:", error);
      res.status(500).json({ message: "Failed to create event score" });
    }
  });

  app.get('/api/event-scores/:assignmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { assignmentId } = req.params;
      const scores = await storage.getEventScoresByAssignment(assignmentId);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching event scores:", error);
      res.status(500).json({ message: "Failed to fetch event scores" });
    }
  });

  app.patch('/api/event-scores/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const score = await storage.updateEventScore(id, updates);
      
      if (!score) {
        return res.status(404).json({ message: "Score not found" });
      }
      
      res.json(score);
    } catch (error) {
      console.error("Error updating event score:", error);
      res.status(500).json({ message: "Failed to update event score" });
    }
  });

  app.delete('/api/event-scores/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEventScore(id);
      
      if (!success) {
        return res.status(404).json({ message: "Score not found" });
      }
      
      res.json({ message: "Score deleted successfully" });
    } catch (error) {
      console.error("Error deleting event score:", error);
      res.status(500).json({ message: "Failed to delete event score" });
    }
  });

  // School event assignment routes (District AD functionality)
  app.post('/api/school-event-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const assignedById = req.user.claims.sub;
      const assignmentData = { ...req.body, assignedById };
      
      const assignment = await storage.createSchoolEventAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating school event assignment:", error);
      res.status(500).json({ message: "Failed to create school event assignment" });
    }
  });

  app.get('/api/school-event-assignments/mine', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.organizationId) {
        const assignments = await storage.getSchoolEventAssignmentsBySchool(user.organizationId);
        res.json(assignments);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching school event assignments:", error);
      res.status(500).json({ message: "Failed to fetch school event assignments" });
    }
  });

  app.get('/api/school-event-assignments/:tournamentId', isAuthenticated, async (req: any, res) => {
    try {
      const { tournamentId } = req.params;
      const assignments = await storage.getSchoolEventAssignmentsByTournament(tournamentId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching tournament school assignments:", error);
      res.status(500).json({ message: "Failed to fetch school assignments" });
    }
  });

  // Coach event assignment routes (School AD functionality)
  app.post('/api/coach-event-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const assignedById = req.user.claims.sub;
      const assignmentData = { ...req.body, assignedById };
      
      const assignment = await storage.createCoachEventAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating coach event assignment:", error);
      res.status(500).json({ message: "Failed to create coach event assignment" });
    }
  });

  app.get('/api/coach-event-assignments/:schoolAssignmentId', isAuthenticated, async (req: any, res) => {
    try {
      const { schoolAssignmentId } = req.params;
      const assignments = await storage.getCoachEventAssignmentsBySchoolAssignment(schoolAssignmentId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching coach event assignments:", error);
      res.status(500).json({ message: "Failed to fetch coach assignments" });
    }
  });

  app.get('/api/coaches/school', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.organizationId) {
        // Get all users from the same organization with coach role
        const allUsers = await storage.getUsers();
        const schoolCoaches = allUsers.filter((u: any) => 
          u.organizationId === user.organizationId && u.userRole === 'coach'
        );
        res.json(schoolCoaches);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching school coaches:", error);
      res.status(500).json({ message: "Failed to fetch school coaches" });
    }
  });

  // Stripe payment routes (public endpoint for donations)
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, description = "Payment" } = req.body;
      
      if (!amount || amount < 1) {
        return res.status(400).json({ message: "Valid amount required" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        description: description,
        metadata: {
          source: 'Champions for Change Platform'
        }
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Payment intent error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent: " + error.message 
      });
    }
  });

  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user already has a subscription, return existing
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        return res.json({
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        });
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'User email required for subscription' });
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
      });

      // Create subscription (you'll need to set STRIPE_PRICE_ID in environment)
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Replace with actual price ID
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Update user with Stripe info
      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
  
      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error("Subscription error:", error);
      res.status(500).json({ 
        message: "Error creating subscription: " + error.message 
      });
    }
  });

  // Protected tournament routes (user-specific)
  app.get('/api/my-tournaments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tournaments = await storage.getTournaments();
      const userTournaments = tournaments.filter(t => t.userId === userId);
      res.json(userTournaments);
    } catch (error) {
      console.error("Error fetching user tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
