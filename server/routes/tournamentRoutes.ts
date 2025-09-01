import type { Express } from "express";
import { storage } from "../storage";
import { insertTournamentSchema } from "@shared/schema";
import { BracketGenerator } from "../utils/bracket-generator";
import { z } from "zod";

export function registerTournamentRoutes(app: Express) {
  
  // Get all tournaments for the current user
  app.get("/api/tournaments", async (req: any, res) => {
    try {
      // Check authentication
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const tournaments = await storage.getTournaments();
      res.json(tournaments);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });

  // Get draft tournaments for the current user
  app.get("/api/tournaments/drafts", async (req: any, res) => {
    try {
      // Check authentication
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const drafts = await storage.getDraftTournaments(userId);
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching draft tournaments:", error);
      res.status(500).json({ message: "Failed to fetch draft tournaments" });
    }
  });

  // Get a specific tournament by ID
  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.json(tournament);
    } catch (error) {
      console.error("Error fetching tournament:", error);
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });

  // Create a new tournament
  app.post("/api/tournaments", async (req: any, res) => {
    try {
      // Check authentication
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Get user details for access control
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      // Get user from storage to check subscription and limits
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check tournament creation limits based on subscription
      const existingTournaments = await storage.getTournaments();
      const userTournaments = existingTournaments.filter((t: any) => t.createdBy === userId);
      
      const getTournamentLimit = (plan: string, status: string) => {
        if (status !== 'active') return 1; // Inactive accounts get 1 tournament
        
        switch (plan) {
          case 'foundation':
          case 'free':
            return 3;
          case 'tournament-organizer':
            return 25;
          case 'business-enterprise':
            return 100;
          case 'district_enterprise':
          case 'enterprise':
          case 'annual-pro':
            return -1; // Unlimited
          default:
            return 2;
        }
      };

      const limit = getTournamentLimit(user.subscriptionPlan || 'foundation', user.subscriptionStatus || 'inactive');
      
      if (limit !== -1 && userTournaments.length >= limit) {
        return res.status(403).json({ 
          message: "Tournament limit reached for your subscription plan",
          currentCount: userTournaments.length,
          limit: limit,
          plan: user.subscriptionPlan
        });
      }

      // Parse the data directly - schema now expects strings
      const validatedData = insertTournamentSchema.parse(req.body);
      
      // Generate bracket structure based on tournament type
      const teams = Array.isArray(validatedData.teams) ? validatedData.teams : [];
      let teamNames = teams.map((team: any) => typeof team === 'string' ? team : team.teamName);
      
      // If no team names provided, generate placeholders
      if (teamNames.length === 0 || teamNames.every(name => !name || name.trim() === '')) {
        const teamSize = validatedData.teamSize || 8;
        const isLeaderboard = validatedData.competitionFormat === 'leaderboard';
        teamNames = Array.from({ length: teamSize }, (_, i) => 
          isLeaderboard ? `Participant ${i + 1}` : `Team ${i + 1}`
        );
      }
      
      // Generate proper bracket structure
      const bracketStructure = BracketGenerator.generateBracket(
        teamNames,
        '',  // Tournament ID will be set after creation
        validatedData.tournamentType || 'single',
        validatedData.sport || 'Basketball'
      );

      // Create tournament with generated bracket and user association
      const tournamentData = {
        ...validatedData,
        bracket: bracketStructure,
        status: 'upcoming' as const,
        createdBy: userId
      };

      const tournament = await storage.createTournament(tournamentData);
      
      // Create matches for the tournament
      if (bracketStructure.matches.length > 0) {
        for (const match of bracketStructure.matches) {
          await storage.createMatch({
            tournamentId: tournament.id,
            round: match.round,
            position: match.position,
            team1: match.team1 || null,
            team2: match.team2 || null,
            team1Score: match.team1Score || 0,
            team2Score: match.team2Score || 0,
            winner: match.winner || null,
            status: match.status
          });
        }
      }

      res.status(201).json({ tournament });
    } catch (error) {
      console.error("Error creating tournament:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid tournament data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create tournament" });
    }
  });

  // Update tournament
  app.put("/api/tournaments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const tournament = await storage.updateTournament(id, updates);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.json(tournament);
    } catch (error) {
      console.error("Error updating tournament:", error);
      res.status(500).json({ message: "Failed to update tournament" });
    }
  });

  // Delete tournament
  app.delete("/api/tournaments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deleteTournament(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.json({ message: "Tournament deleted successfully" });
    } catch (error) {
      console.error("Error deleting tournament:", error);
      res.status(500).json({ message: "Failed to delete tournament" });
    }
  });

  // Get matches for a tournament
  app.get("/api/matches/:tournamentId", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      const matches = await storage.getMatchesByTournament(tournamentId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Update a match
  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const match = await storage.updateMatch(id, updates);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      // If match is completed with a winner, advance winner to next round
      if (match.status === 'completed' && match.winner) {
        await advanceWinner(match);
      }
      
      res.json(match);
    } catch (error) {
      console.error("Error updating match:", error);
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  // Helper function to advance winner to next round
  async function advanceWinner(completedMatch: any) {
    try {
      const nextRound = completedMatch.round + 1;
      const currentPosition = completedMatch.position;
      
      // For single elimination: position in next round = ceil(currentPosition / 2)
      const nextPosition = Math.ceil(currentPosition / 2);
      
      // Find the next round match that this winner should advance to
      const nextMatches = await storage.getMatchesByTournament(completedMatch.tournamentId);
      const nextMatch = nextMatches.find(m => 
        m.round === nextRound && 
        m.position === nextPosition &&
        (!m.bracket || m.bracket === completedMatch.bracket)
      );
      
      if (nextMatch) {
        // Determine if winner goes to team1 or team2 slot
        // Even positions go to team1, odd positions go to team2
        const isTeam1Slot = (currentPosition % 2 === 1);
        
        const updateData = isTeam1Slot 
          ? { team1: completedMatch.winner }
          : { team2: completedMatch.winner };
        
        await storage.updateMatch(nextMatch.id, updateData);
        console.log(`✅ Advanced winner ${completedMatch.winner} from Round ${completedMatch.round} to Round ${nextRound}`);
      }
    } catch (error) {
      console.error("Error advancing winner:", error);
    }
  }

  // Get leaderboard entries for a tournament
  app.get("/api/leaderboard/:tournamentId", async (req, res) => {
    try {
      const { tournamentId } = req.params;
      // For now, return empty array - this would be implemented with proper leaderboard storage
      res.json([]);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Add leaderboard entry
  app.post("/api/tournaments/:id/leaderboard", async (req, res) => {
    try {
      const { id } = req.params;
      const entry = req.body;
      
      // For now, return the entry with a generated ID
      const leaderboardEntry = {
        id: `entry-${Date.now()}`,
        ...entry,
        placement: 1,
        measurement: 'score',
        unit: 'points',
        status: 'completed'
      };
      
      res.status(201).json(leaderboardEntry);
    } catch (error) {
      console.error("Error creating leaderboard entry:", error);
      res.status(500).json({ message: "Failed to create leaderboard entry" });
    }
  });

  // Update leaderboard entry
  app.patch("/api/leaderboard/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // For now, return the updated entry
      const leaderboardEntry = {
        id,
        ...updates,
        placement: 1,
        measurement: 'score',
        unit: 'points',
        status: 'completed'
      };
      
      res.json(leaderboardEntry);
    } catch (error) {
      console.error("Error updating leaderboard entry:", error);
      res.status(500).json({ message: "Failed to update leaderboard entry" });
    }
  });
}