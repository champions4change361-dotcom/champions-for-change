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
        await storage.updateTournament(tournamentId, { status: "in-progress" });
      }
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
