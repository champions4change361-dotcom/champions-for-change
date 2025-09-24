import type { Express } from "express";
import { storage } from "../storage";
import { insertTournamentSchema } from "@shared/schema";
import { BracketGenerator } from "../utils/bracket-generator";
import { z } from "zod";

export function registerTournamentRoutes(app: Express) {
  // Sport Events API Routes
  app.get("/api/sports/:sportId/events", async (req, res) => {
    try {
      const { sportId } = req.params;
      const events = await storage.getSportEventsBySport(sportId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching sport events:", error);
      res.status(500).json({ message: "Error fetching sport events", error: error.message });
    }
  });

  app.get("/api/sport-events", async (req, res) => {
    try {
      const events = await storage.getAllSportEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching all sport events:", error);
      res.status(500).json({ message: "Error fetching sport events", error: error.message });
    }
  });
  
  // Get all tournaments for the current user
  app.get("/api/tournaments", async (req: any, res) => {
    try {
      // Hybrid authentication: OAuth or session-based
      let isAuthenticated = false;
      let userId = null;

      // Check OAuth authentication first
      if (req.isAuthenticated && req.isAuthenticated()) {
        isAuthenticated = true;
        userId = req.user?.claims?.sub;
        console.log('Using OAuth authentication');
      }
      // Fallback to session-based authentication
      else if (req.session?.user) {
        isAuthenticated = true;
        userId = req.session.user.id;
        console.log('Using session-based authentication');
      }

      if (!isAuthenticated) {
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

  // Get public tournaments for calendar display (NO AUTH REQUIRED)
  app.get("/api/tournaments/public", async (req, res) => {
    try {
      const storage = await getStorage();
      
      // Get tournaments that are marked as calendar visible and approved
      const allTournaments = await storage.getTournaments();
      
      // Filter for public calendar visibility
      const publicTournaments = allTournaments.filter((tournament: any) => 
        tournament.isPublicCalendarVisible === true && 
        tournament.calendarApprovalStatus === 'approved'
      );
      
      // Return only necessary fields for calendar display
      const calendarTournaments = publicTournaments.map((tournament: any) => ({
        id: tournament.id,
        name: tournament.name,
        sport: tournament.sport,
        tournamentDate: tournament.tournamentDate,
        location: tournament.location,
        calendarRegion: tournament.calendarRegion,
        calendarCity: tournament.calendarCity,
        calendarStateCode: tournament.calendarStateCode,
        calendarTags: tournament.calendarTags,
        calendarApprovalStatus: tournament.calendarApprovalStatus,
        ageGroup: tournament.ageGroup,
        genderDivision: tournament.genderDivision,
        teamSize: tournament.teamSize,
        maxParticipants: tournament.maxParticipants,
        entryFee: tournament.entryFee,
        description: tournament.description,
        calendarViewCount: tournament.calendarViewCount,
        status: tournament.status
      }));
      
      res.json(calendarTournaments);
    } catch (error) {
      console.error("Error fetching public tournaments:", error);
      res.status(500).json({ message: "Failed to fetch public tournaments" });
    }
  });

  // Submit tournament for calendar approval
  app.patch("/api/tournaments/:id/calendar-submit", async (req: any, res) => {
    try {
      // Check authentication
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;
      const { calendarRegion, calendarCity, calendarStateCode, calendarTags } = req.body;

      const storage = await getStorage();
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // Update tournament with calendar submission
      await storage.updateTournament(id, {
        isPublicCalendarVisible: true,
        calendarApprovalStatus: 'pending',
        calendarSubmittedAt: new Date(),
        calendarRegion,
        calendarCity,
        calendarStateCode,
        calendarTags: calendarTags || []
      });

      res.json({ message: "Tournament submitted for calendar approval" });
    } catch (error) {
      console.error("Error submitting tournament for calendar:", error);
      res.status(500).json({ message: "Failed to submit tournament for calendar" });
    }
  });

  // Admin: Approve/reject tournament for calendar
  app.patch("/api/admin/tournaments/:id/calendar-approval", async (req: any, res) => {
    try {
      // Check authentication (you may want to add admin role checking here)
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;
      const { status, rejectionReason } = req.body;
      const userId = req.user?.claims?.sub;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
      }

      const storage = await getStorage();
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      const updateData: any = {
        calendarApprovalStatus: status,
        calendarApprovedAt: status === 'approved' ? new Date() : null,
        calendarApprovedBy: status === 'approved' ? userId : null
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.calendarRejectionReason = rejectionReason;
      }

      await storage.updateTournament(id, updateData);

      res.json({ 
        message: `Tournament ${status} for calendar display`,
        tournament: await storage.getTournament(id)
      });
    } catch (error) {
      console.error("Error updating tournament calendar approval:", error);
      res.status(500).json({ message: "Failed to update tournament approval" });
    }
  });

  // Get pending calendar submissions for admin review
  app.get("/api/admin/tournaments/calendar-pending", async (req: any, res) => {
    try {
      // Check authentication (you may want to add admin role checking here)
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const storage = await getStorage();
      const allTournaments = await storage.getTournaments();
      
      // Filter for pending calendar submissions
      const pendingTournaments = allTournaments.filter((tournament: any) => 
        tournament.isPublicCalendarVisible === true && 
        tournament.calendarApprovalStatus === 'pending'
      );

      res.json(pendingTournaments);
    } catch (error) {
      console.error("Error fetching pending calendar submissions:", error);
      res.status(500).json({ message: "Failed to fetch pending submissions" });
    }
  });

  // Track tournament calendar view (for analytics)
  app.post("/api/tournaments/:id/calendar-view", async (req, res) => {
    try {
      const { id } = req.params;
      const storage = await getStorage();
      
      const tournament = await storage.getTournament(id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // Increment view count
      const currentViews = tournament.calendarViewCount || 0;
      await storage.updateTournament(id, {
        calendarViewCount: currentViews + 1
      });

      res.json({ message: "View tracked" });
    } catch (error) {
      console.error("Error tracking tournament view:", error);
      res.status(500).json({ message: "Failed to track view" });
    }
  });

  // Get tournament calendar analytics
  app.get("/api/tournaments/:id/calendar-analytics", async (req: any, res) => {
    try {
      // Check authentication
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { id } = req.params;
      const storage = await getStorage();
      
      const tournament = await storage.getTournament(id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // Return analytics data
      const analytics = {
        calendarViewCount: tournament.calendarViewCount || 0,
        calendarClickCount: tournament.calendarClickCount || 0,
        calendarApprovalStatus: tournament.calendarApprovalStatus,
        calendarSubmittedAt: tournament.calendarSubmittedAt,
        calendarApprovedAt: tournament.calendarApprovedAt,
        calendarRegion: tournament.calendarRegion,
        calendarTags: tournament.calendarTags || []
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching tournament calendar analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
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

  // Get tournament divisions for basketball-style tournaments
  app.get("/api/tournaments/:id/divisions", async (req, res) => {
    try {
      const { id } = req.params;
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // For bracket-based tournaments (like basketball), return divisions
      if (tournament.competitionFormat === 'bracket') {
        const divisions = await storage.getTournamentDivisionsByTournament(id);
        res.json(divisions);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching tournament divisions:", error);
      res.status(500).json({ message: "Error fetching divisions", error: error.message });
    }
  });

  // Get tournament events for track & field style tournaments
  app.get("/api/tournaments/:id/events", async (req, res) => {
    try {
      const { id } = req.params;
      const tournament = await storage.getTournament(id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      // For event-based tournaments (like track & field), return events
      if (tournament.competitionFormat === 'event') {
        const events = await storage.getTournamentEventsByTournament(id);
        res.json(events);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching tournament events:", error);
      res.status(500).json({ message: "Error fetching events", error: error.message });
    }
  });

  // Get tournament registration submissions for bracket generation
  app.get("/api/registration-forms/tournament/:id/submissions", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get all registration forms for this tournament
      const registrationForms = await storage.getRegistrationFormsByTournament(id);
      
      if (registrationForms.length === 0) {
        return res.json([]);
      }
      
      // Get submissions for all forms of this tournament
      const allSubmissions = [];
      for (const form of registrationForms) {
        const formSubmissions = await storage.getRegistrationSubmissions(form.id);
        allSubmissions.push(...formSubmissions);
      }
      
      // Transform submissions to SmartParticipant format
      const participants = allSubmissions.map(submission => ({
        id: submission.id,
        participantName: submission.participantName || `${submission.firstName} ${submission.lastName}`,
        skillLevel: submission.skillLevel || 'beginner',
        age: submission.age || 0,
        gender: submission.gender || 'unspecified',
        assignedDivisionId: submission.assignedDivisionId,
        assignedEventIds: submission.assignedEventIds,
        seed: submission.seed,
        assignmentResult: submission.assignmentResult
      }));
      
      res.json(participants);
    } catch (error) {
      console.error("Error fetching tournament registration submissions:", error);
      res.status(500).json({ message: "Error fetching registration submissions", error: error.message });
    }
  });

  // Create a new tournament
  app.post("/api/tournaments", async (req: any, res) => {
    try {
      // TEMPORARY: Skip authentication for testing
      // TODO: Re-enable authentication when ready for production
      let userId = req.user?.claims?.sub;
      let user = null;
      
      if (req.isAuthenticated && req.isAuthenticated()) {
        user = await storage.getUser(userId);
      } else {
        // For testing without authentication, create a temporary user context
        userId = 'test-user-id';
        user = {
          id: 'test-user-id',
          subscriptionPlan: 'enterprise',
          subscriptionStatus: 'active'
        };
        console.log('⚠️ Creating tournament without authentication - testing mode');
      }

      // Check tournament creation limits based on subscription
      const existingTournaments = await storage.getTournaments();
      // Filter by user_id OR created_by since we might have both fields
      const userTournaments = existingTournaments.filter((t: any) => 
        t.createdBy === userId || t.user_id === userId
      );
      
      // Only count tournaments that have been actually run (not just created)
      // Consider tournaments "run" if they have matches with results or status beyond 'upcoming'
      const activeTournaments = userTournaments.filter((t: any) => 
        t.status !== 'upcoming' && t.status !== 'draft'
      );
      
      const getTournamentLimit = (plan: string, status: string) => {
        if (status !== 'active') return 1; // Inactive accounts get 1 tournament
        
        switch (plan) {
          case 'starter':
          case 'free':
            return 3; // 3 tournaments per month
          case 'tournament-organizer':
            return 25; // 25 tournaments per month
          case 'business-enterprise':
            return 100; // 100 tournaments per month
          case 'district_enterprise':
          case 'enterprise':
          case 'annual-pro':
            return -1; // Unlimited
          default:
            return 2; // Default fallback
        }
      };

      const limit = getTournamentLimit(user.subscriptionPlan || 'starter', user.subscriptionStatus || 'inactive');
      
      // For enterprise accounts, skip limit checking entirely
      if (user.subscriptionPlan === 'district_enterprise' || user.subscriptionPlan === 'enterprise' || user.subscriptionPlan === 'annual-pro') {
        console.log(`✅ Enterprise user ${userId} creating tournament - unlimited access`);
      } else if (limit !== -1 && activeTournaments.length >= limit) {
        return res.status(403).json({ 
          message: "Monthly tournament limit reached for your subscription plan",
          currentCount: activeTournaments.length,
          totalCreated: userTournaments.length,
          limit: limit,
          plan: user.subscriptionPlan,
          note: "Only tournaments that have been run count toward your limit"
        });
      }

      // Parse the data directly - schema now expects strings
      console.log("Raw tournament data received:", JSON.stringify(req.body, null, 2));
      const validatedData = insertTournamentSchema.parse(req.body);
      console.log("Validated tournament data:", JSON.stringify(validatedData, null, 2));
      
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
      // Sanitize numeric fields to prevent empty string errors
      const sanitizeNumericField = (value: any, defaultValue: any = null) => {
        if (value === "" || value === null || value === undefined) {
          return defaultValue;
        }
        return value;
      };

      const sanitizedData = {
        ...validatedData,
        entryFee: sanitizeNumericField(validatedData.entryFee, "0"),
        donationGoal: sanitizeNumericField(validatedData.donationGoal, "0"),
        maxParticipants: sanitizeNumericField(validatedData.maxParticipants, null),
        teamSize: sanitizeNumericField(validatedData.teamSize, 8),
        seriesLength: sanitizeNumericField(validatedData.seriesLength, 7),
        currentStage: sanitizeNumericField(validatedData.currentStage, 1),
        totalStages: sanitizeNumericField(validatedData.totalStages, 1),
        maxTeamSize: sanitizeNumericField(validatedData.maxTeamSize, null),
        minTeamSize: sanitizeNumericField(validatedData.minTeamSize, null)
      };
      
      console.log("Sanitized tournament data:", JSON.stringify(sanitizedData, null, 2));

      const tournamentData = {
        ...sanitizedData,
        bracket: bracketStructure,
        status: 'upcoming' as const,
        createdBy: userId,
        user_id: userId // Ensure both fields are set for consistency
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

  // Helper function to advance winner and loser for double elimination
  async function advanceWinner(completedMatch: any) {
    try {
      const allMatches = await storage.getMatchesByTournament(completedMatch.tournamentId);
      const tournament = await storage.getTournament(completedMatch.tournamentId);
      
      // Double Elimination Tournament Logic
      console.log(`🔍 Tournament Type Check: "${tournament?.tournamentType}"`);
      if (tournament?.tournamentType === 'double' || tournament?.tournamentType === 'Double Elimination') {
        console.log(`🏆 Starting Double Elimination advancement for ${completedMatch.winner}`);
        await handleDoubleEliminationAdvancement(completedMatch, allMatches);
      } else {
        console.log(`⚡ Using Single Elimination advancement for ${completedMatch.winner}`);
        // Single elimination logic (unchanged)
        await handleSingleEliminationAdvancement(completedMatch, allMatches);
      }
    } catch (error) {
      console.error("Error advancing winner:", error);
    }
  }

  // Handle double elimination advancement
  async function handleDoubleEliminationAdvancement(completedMatch: any, allMatches: any[]) {
    const { winner, round, position, tournamentId } = completedMatch;
    const loser = completedMatch.team1 === winner ? completedMatch.team2 : completedMatch.team1;
    
    console.log(`🏆 Double Elimination: ${winner} beats ${loser} in Round ${round}, Position ${position}`);
    
    // STEP 1: Advance winner to next round in winners bracket
    const nextRound = round + 1;
    const nextPosition = Math.ceil(position / 2);
    
    // Find or create next round match in winners bracket
    let nextMatch = allMatches.find(m => 
      m.round === nextRound && 
      m.position === nextPosition && 
      (!m.bracket || m.bracket === 'winners')
    );
    
    if (!nextMatch) {
      // Create the next round match if it doesn't exist
      const newMatchId = `generated-r${nextRound}-p${nextPosition}`;
      nextMatch = await storage.createMatch({
        id: newMatchId,
        tournamentId,
        round: nextRound,
        position: nextPosition,
        team1: 'TBD',
        team2: 'TBD',
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: 'pending',
        bracket: 'winners'
      });
    }
    
    if (nextMatch) {
      // Determine if winner goes to team1 or team2 slot (odd positions = team1)
      const isTeam1Slot = (position % 2 === 1);
      const updateData = isTeam1Slot 
        ? { team1: winner }
        : { team2: winner };
      
      await storage.updateMatch(nextMatch.id, updateData);
      console.log(`✅ Winner ${winner} advanced to Winners Round ${nextRound}, Position ${nextPosition}`);
    }
    
    // STEP 2: Move loser to losers bracket
    await moveLoserToLosersBracket(loser, round, position, tournamentId, allMatches);
  }

  // Move loser to appropriate position in losers bracket
  async function moveLoserToLosersBracket(loser: string, winnerRound: number, winnerPosition: number, tournamentId: string, allMatches: any[]) {
    // For Round 1 losers, they go to Losers Round 1
    const losersRound = 1;
    const losersPosition = winnerPosition; // Same position in losers bracket
    
    // Find or create losers bracket match
    let losersMatch = allMatches.find(m => 
      m.round === losersRound && 
      m.position === losersPosition && 
      m.bracket === 'losers'
    );
    
    if (!losersMatch) {
      // Create losers bracket match
      const newMatchId = `losers-r${losersRound}-p${losersPosition}`;
      losersMatch = await storage.createMatch({
        id: newMatchId,
        tournamentId,
        round: losersRound,
        position: losersPosition,
        team1: 'TBD',
        team2: 'TBD',
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: 'pending',
        bracket: 'losers'
      });
    }
    
    if (losersMatch) {
      // Add loser to available slot
      const updateData = !losersMatch.team1 || losersMatch.team1 === 'TBD' 
        ? { team1: loser }
        : { team2: loser };
      
      await storage.updateMatch(losersMatch.id, updateData);
      console.log(`🔄 Loser ${loser} moved to Losers Round ${losersRound}, Position ${losersPosition}`);
    }
  }

  // Original single elimination logic
  async function handleSingleEliminationAdvancement(completedMatch: any, allMatches: any[]) {
    const nextRound = completedMatch.round + 1;
    const currentPosition = completedMatch.position;
    const nextPosition = Math.ceil(currentPosition / 2);
    
    const nextMatch = allMatches.find(m => 
      m.round === nextRound && 
      m.position === nextPosition &&
      (!m.bracket || m.bracket === completedMatch.bracket)
    );
    
    if (nextMatch) {
      const isTeam1Slot = (currentPosition % 2 === 1);
      const updateData = isTeam1Slot 
        ? { team1: completedMatch.winner }
        : { team2: completedMatch.winner };
      
      await storage.updateMatch(nextMatch.id, updateData);
      console.log(`✅ Advanced winner ${completedMatch.winner} from Round ${completedMatch.round} to Round ${nextRound}`);
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