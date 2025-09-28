import type { Express } from "express";
import { storage } from "../storage";
import { insertTournamentSchema, tournamentConfigSchema, type TournamentConfig, updateMatchSchema } from "@shared/schema";
import { BracketGenerator } from "../utils/bracket-generator";
import { TournamentService } from "../tournament-service";
import { TournamentRegistrationService } from "../tournament-registration-service";
import { LiveScoringService } from "../live-scoring-service";
import { TournamentDirectorService } from "../tournament-director-service";
import { TournamentRBACService } from "../tournament-rbac-service";
import { loadUserContext, requirePermissions } from "../rbac-middleware";
import { PERMISSIONS } from "../rbac-permissions";
import { z } from "zod";

// Zod schema for score update payloads
const scoreUpdateSchema = z.object({
  team1Score: z.number().min(0).optional(),
  team2Score: z.number().min(0).optional(),
  status: z.enum(["upcoming", "in-progress", "completed", "cancelled"]).optional(),
  winner: z.string().optional(),
  notes: z.string().optional()
}).refine(
  (data) => data.team1Score !== undefined || data.team2Score !== undefined,
  {
    message: "At least one score (team1Score or team2Score) must be provided",
    path: ["team1Score", "team2Score"]
  }
);
import type {
  FFAParticipant,
  FFALeaderboardEntry
} from "@shared/bracket-generator";

/**
 * Map legacy tournament types to engine types for TournamentConfig
 */
function mapTournamentTypeToEngine(tournamentType: string): 'single' | 'double' | 'round_robin' | 'swiss' | 'leaderboard' {
  switch (tournamentType) {
    case 'single':
      return 'single';
    case 'double':
      return 'double';
    case 'round-robin':
      return 'round_robin';
    case 'swiss-system':
      return 'swiss';
    case 'free-for-all':
    case 'multi-heat-racing':
    case 'battle-royale':
    case 'point-accumulation':
    case 'time-trials':
    case 'survival-elimination':
      return 'leaderboard';
    default:
      return 'single';
  }
}

/**
 * Map engine types back to legacy tournament types for database compatibility
 */
function mapEngineToTournamentType(engine: string): string {
  switch (engine) {
    case 'single':
      return 'single';
    case 'double':
      return 'double';
    case 'round_robin':
      return 'round-robin';
    case 'swiss':
      return 'swiss-system';
    case 'leaderboard':
      return 'free-for-all'; // Default leaderboard type
    default:
      return 'single';
  }
}

export function registerTournamentRoutes(app: Express) {

  // === LIVE SCORING ENDPOINTS ===
  
  // Start live scoring for a match
  app.post("/api/tournaments/:tournamentId/matches/:matchId/live-scoring/start", 
    TournamentRBACService.createTournamentAccessMiddleware('canScoreMatches'),
    async (req: any, res) => {
    try {
      const { tournamentId, matchId } = req.params;
      const user = req.secureUser;
      
      const liveScore = await LiveScoringService.startLiveScoring(matchId, user.id, user);
      
      // Broadcast to tournament room
      const io = (global as any).tournamentIO;
      if (io) {
        io.to(`tournament-${tournamentId}`).emit('match-started', { matchId, liveScore });
      }
      
      res.json(liveScore);
    } catch (error) {
      console.error("Error starting live scoring:", error);
      res.status(500).json({ message: "Failed to start live scoring", error: (error as Error).message });
    }
  });
  
  // Update match score in real-time with proper validation and bracket progression
  app.post("/api/tournaments/:tournamentId/matches/:matchId/score-update", 
    TournamentRBACService.createTournamentAccessMiddleware('canScoreMatches'),
    async (req: any, res) => {
    try {
      const { tournamentId, matchId } = req.params;
      const user = req.secureUser;
      
      // Validate score update with Zod schema
      const scoreUpdateResult = scoreUpdateSchema.safeParse(req.body);
      if (!scoreUpdateResult.success) {
        return res.status(400).json({ 
          message: "Invalid score update data", 
          errors: scoreUpdateResult.error.errors 
        });
      }
      
      const scoreUpdate = scoreUpdateResult.data;
      
      // Use TournamentService.updateMatchResult to handle bracket progression
      const matchResult = {
        matchId,
        team1Score: scoreUpdate.team1Score || 0,
        team2Score: scoreUpdate.team2Score || 0,
        winner: scoreUpdate.winner,
        notes: scoreUpdate.notes
      };
      
      const { match: updatedMatch, progressUpdate } = await TournamentService.updateMatchResult(
        matchId,
        matchResult,
        user
      );
      
      // Broadcast real-time update with progression info
      const io = (global as any).tournamentIO;
      if (io) {
        io.to(`tournament-${tournamentId}`).emit('score-update', { 
          matchId, 
          tournamentId, 
          scoreUpdate: updatedMatch,
          progressUpdate 
        });
        
        // If bracket progression occurred, broadcast that too
        if (progressUpdate.newMatches.length > 0 || progressUpdate.advancedTeams.length > 0) {
          io.to(`tournament-${tournamentId}`).emit('bracket-progression', {
            tournamentId,
            progressUpdate,
            updatedMatch
          });
        }
      }
      
      res.json({
        match: updatedMatch,
        progressUpdate
      });
    } catch (error) {
      console.error("Error updating match score:", error);
      res.status(500).json({ message: "Failed to update score", error: (error as Error).message });
    }
  });
  
  // === REGISTRATION ENDPOINTS ===
  
  // Create tournament registration form
  app.post("/api/tournaments/:id/registration-form", 
    TournamentRBACService.createTournamentAccessMiddleware('canManageRegistrations'),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.secureUser;
      const formData = req.body;
      
      const registrationForm = await TournamentRegistrationService.createRegistrationForm(
        id, 
        formData, 
        user
      );
      
      res.json(registrationForm);
    } catch (error) {
      console.error("Error creating registration form:", error);
      res.status(500).json({ message: "Failed to create registration form", error: (error as Error).message });
    }
  });
  
  // Get tournament registration form (Frontend compatibility endpoint)
  app.get("/api/tournament-registration-forms/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Use the existing service to get registration form
      const registrationForm = await storage.getTournamentRegistrationForm(id);
      
      if (!registrationForm) {
        return res.status(404).json({ message: "Registration form not found" });
      }
      
      res.json(registrationForm);
    } catch (error) {
      console.error("Error getting registration form:", error);
      res.status(500).json({ message: "Failed to get registration form", error: (error as Error).message });
    }
  });

  // Submit team registration
  app.post("/api/tournament-registration/:formId/submit", async (req: any, res) => {
    try {
      const { formId } = req.params;
      const registrationData = req.body;
      
      // Extract user context if available (registration can be public)
      let user;
      try {
        user = TournamentRBACService.createSecureUserContext(req);
      } catch (error) {
        // Allow guest registrations
        user = undefined;
      }
      
      const result = await TournamentRegistrationService.submitTeamRegistration(
        formId,
        registrationData,
        user
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error submitting registration:", error);
      res.status(500).json({ message: "Failed to submit registration", error: (error as Error).message });
    }
  });
  
  // Get tournament matches (PUBLIC ACCESS - for viewing)
  app.get("/api/tournaments/:id/matches", async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Try to get user context if available, but don't require it
      let user = null;
      try {
        user = TournamentRBACService.createSecureUserContext(req);
      } catch (error) {
        // User not authenticated - that's ok for public viewing
        console.log('No user context for public tournament matches viewing');
      }
      
      const matches = await storage.getMatchesByTournament(id);
      
      res.json(matches);
    } catch (error) {
      console.error("Error fetching tournament matches:", error);
      res.status(500).json({ message: "Failed to fetch matches", error: (error as Error).message });
    }
  });
  // Sport Events API Routes
  app.get("/api/sports/:sportId/events", async (req, res) => {
    try {
      const { sportId } = req.params;
      const events = await storage.getSportEventsBySport(sportId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching sport events:", error);
      res.status(500).json({ message: "Error fetching sport events", error: (error as Error).message });
    }
  });

  app.get("/api/sport-events", async (req, res) => {
    try {
      const events = await storage.getSportEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching all sport events:", error);
      res.status(500).json({ message: "Error fetching sport events", error: (error as Error).message });
    }
  });
  
  // Get all tournaments for the current user
  app.get("/api/tournaments", 
    TournamentRBACService.createTournamentAccessMiddleware('canViewTournament'),
    async (req: any, res) => {
    try {
      // Use secure user context from RBAC middleware
      const user = req.secureUser;

      // Get filtered tournaments based on user permissions
      const accessibleTournaments = await TournamentRBACService.getUserAccessibleTournaments(user);
      res.json(accessibleTournaments);
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
  app.patch("/api/tournaments/:id/calendar-submit", 
    TournamentRBACService.createTournamentAccessMiddleware('canEditTournament'),
    async (req: any, res) => {
    try {
      const { id } = req.params;
      const user = req.secureUser;
      const { calendarRegion, calendarCity, calendarStateCode, calendarTags } = req.body;
      
      const tournament = await storage.getTournament(id, user);
      
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
      }, user);

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

  // Get a specific tournament by ID (PUBLIC ACCESS - for viewing)
  app.get("/api/tournaments/:id", async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Try to get user context if available, but don't require it
      let user = null;
      try {
        user = TournamentRBACService.createSecureUserContext(req);
      } catch (error) {
        // User not authenticated - that's ok for public viewing
        console.log('No user context for public tournament viewing');
      }
      
      const tournament = user 
        ? await storage.getTournament(id, user)
        : await storage.getTournamentPublic(id);
      
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
        const divisions = await storage.getTournamentEventsByTournament(id);
        res.json(divisions);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching tournament divisions:", error);
      res.status(500).json({ message: "Error fetching divisions", error: (error as Error).message });
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
      if (tournament.competitionFormat === 'timed-competition' || tournament.competitionFormat === 'judged-performance') {
        const events = await storage.getTournamentEventsByTournament(id);
        res.json(events);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error("Error fetching tournament events:", error);
      res.status(500).json({ message: "Error fetching events", error: (error as Error).message });
    }
  });

  // Get tournament registration submissions for bracket generation
  app.get("/api/registration-forms/tournament/:id/submissions", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get all registration forms for this tournament
      const registrationForms = await storage.getTournamentRegistrationFormsByTournament(id);
      
      if (registrationForms.length === 0) {
        return res.json([]);
      }
      
      // Get submissions for all forms of this tournament
      const allSubmissions = [];
      for (const form of registrationForms) {
        const formSubmissions = await storage.getRegistrationSubmissionsByTournament(id);
        allSubmissions.push(...formSubmissions);
      }
      
      // Transform submissions to SmartParticipant format
      const participants = allSubmissions.map(submission => ({
        id: submission.id,
        participantName: submission.participantName || `Participant ${submission.id}`,
        skillLevel: submission.skillLevel || 'beginner',
        age: submission.age || 0,
        gender: submission.gender || 'unspecified',
        assignedDivisionId: submission.assignedDivisionId || null,
        assignedEventIds: submission.assignedEventIds || [],
        seed: null,
        assignmentResult: null
      }));
      
      res.json(participants);
    } catch (error) {
      console.error("Error fetching tournament registration submissions:", error);
      res.status(500).json({ message: "Error fetching registration submissions", error: (error as Error).message });
    }
  });

  // Helper function to extract bracket generation parameters from TournamentConfig
  const getBracketParamsFromConfig = (config: TournamentConfig) => {
    const firstStage = config.stages[0];
    const tournamentType = firstStage?.engine || 'single';
    const participantCount = config.meta.participantCount || 8;
    const competitionName = config.meta.name || 'Competition';
    
    console.log('🔧 getBracketParamsFromConfig - config.meta:', JSON.stringify(config.meta, null, 2));
    console.log('🔧 getBracketParamsFromConfig - extracted participantCount:', participantCount);
    
    return {
      tournamentType,
      participantCount,
      competitionName,
      participantType: config.meta.participantType
    };
  };

  // Create a new tournament
  app.post("/api/tournaments", 
    TournamentRBACService.createTournamentAccessMiddleware('canCreateTournament'),
    async (req: any, res) => {
    try {
      // Use secure user context from RBAC middleware
      const user = req.secureUser;
      const userId = user.id;

      // Check tournament creation limits based on subscription
      const existingTournaments = await storage.getTournaments();
      const userTournaments = existingTournaments.filter((t: any) => 
        t.user_id === userId
      );
      
      const activeTournaments = userTournaments.filter((t: any) => 
        t.status !== 'upcoming' && t.status !== 'draft'
      );
      
      const getTournamentLimit = (plan: string, status: string) => {
        if (status !== 'active') return 1;
        
        switch (plan) {
          case 'starter':
          case 'free':
            return 3;
          case 'tournament-organizer':
            return 25;
          case 'business-enterprise':
            return 100;
          case 'district_enterprise':
          case 'enterprise':
          case 'annual-pro':
            return -1;
          default:
            return 2;
        }
      };

      const limit = getTournamentLimit(user?.subscriptionPlan || 'starter', user?.subscriptionStatus || 'inactive');
      
      if (user?.subscriptionPlan === 'district_enterprise' || user?.subscriptionPlan === 'enterprise' || user?.subscriptionPlan === 'annual-pro') {
        console.log(`✅ Enterprise user ${userId} creating tournament - unlimited access`);
      } else if (limit !== -1 && activeTournaments.length >= limit) {
        return res.status(403).json({ 
          message: "Monthly tournament limit reached for your subscription plan",
          currentCount: activeTournaments.length,
          totalCreated: userTournaments.length,
          limit: limit,
          plan: user?.subscriptionPlan,
          note: "Only tournaments that have been run count toward your limit"
        });
      }

      console.log("Raw tournament data received:", JSON.stringify(req.body, null, 2));
      
      // CONFIGURATION-DRIVEN APPROACH: Primary validation with TournamentConfig
      let validatedConfig: TournamentConfig | null = null;
      let bracketParams: any = null;
      
      // Check if we have a configuration-driven tournament
      if (req.body.config) {
        try {
          validatedConfig = tournamentConfigSchema.parse(req.body.config);
          console.log('✓ TournamentConfig validation successful:', JSON.stringify(validatedConfig, null, 2));
          console.log('🔧 About to call getBracketParamsFromConfig with:', JSON.stringify(validatedConfig, null, 2));
          bracketParams = getBracketParamsFromConfig(validatedConfig);
          console.log('🔧 bracketParams result:', JSON.stringify(bracketParams, null, 2));
        } catch (configError) {
          console.error('✗ TournamentConfig validation or bracket params extraction failed:', configError);
          return res.status(400).json({
            message: "Invalid tournament configuration",
            errors: configError instanceof z.ZodError ? configError.errors : [configError]
          });
        }
      } else {
        // LEGACY SUPPORT: Fall back to sport-specific validation for backward compatibility
        console.log('⚠️ No TournamentConfig provided, using legacy validation for backward compatibility');
        bracketParams = {
          tournamentType: req.body.tournamentType || 'single',
          participantCount: req.body.teamSize || req.body.participantCount || 8,
          competitionName: req.body.sport || 'Competition',
          participantType: req.body.participantType || 'team'
        };
      }
      
      // Extract participants and generate participant names
      const teams = Array.isArray(req.body.teams) ? req.body.teams : [];
      let participantNames = teams.map((team: any) => typeof team === 'string' ? team : team.teamName || team.name);
      
      // Generate placeholder names if none provided
      if (participantNames.length === 0 || participantNames.every((name: string) => !name || name.trim() === '')) {
        const isIndividual = bracketParams.participantType === 'individual';
        const isLeaderboard = bracketParams.tournamentType === 'leaderboard';
        
        participantNames = Array.from({ length: bracketParams.participantCount }, (_, i) => {
          if (isIndividual || isLeaderboard) {
            return `Participant ${i + 1}`;
          }
          return `Team ${i + 1}`;
        });
      }
      
      // Generate bracket structure using TournamentConfig - NOW FULLY CONFIGURATION-DRIVEN!
      let bracketStructure;
      if (validatedConfig) {
        // Use new configuration-driven approach
        bracketStructure = BracketGenerator.generateFromConfig(
          validatedConfig, // Pass the complete TournamentConfig
          participantNames,
          '',  // Tournament ID will be set after creation
          {
            formatConfig: bracketParams.formatConfig || {}
          }
        );
      } else {
        // Create minimal TournamentConfig for backward compatibility
        const compatibilityConfig: TournamentConfig = {
          meta: {
            name: bracketParams.competitionName || 'Universal Competition',
            participantType: bracketParams.participantType === 'individual' ? 'individual' : 'team',
            participantCount: bracketParams.participantCount
          },
          divisions: [{
            name: 'Main Division',
            eligibility: {},
            genderPolicy: 'open'
          }],
          stages: [{
            engine: mapTournamentTypeToEngine(bracketParams.tournamentType || 'single'),
            size: bracketParams.participantCount
          }],
          seeding: {
            method: 'random'
          }
        };
        
        bracketStructure = BracketGenerator.generateFromConfig(
          compatibilityConfig,
          participantNames,
          '',  // Tournament ID will be set after creation
          {
            formatConfig: bracketParams.formatConfig || {}
          }
        );
      }
      
      // Ensure we have valid bracketParams before proceeding
      if (!bracketParams || bracketParams.participantCount === undefined) {
        console.error('❌ bracketParams is invalid:', bracketParams);
        return res.status(400).json({
          message: "Failed to extract tournament parameters",
          bracketParams: bracketParams
        });
      }

      console.log('✅ Valid bracketParams confirmed:', JSON.stringify(bracketParams, null, 2));

      // Prepare tournament data with config-driven approach
      const tournamentData = {
        // Core tournament fields
        name: req.body.name || bracketParams.competitionName,
        description: req.body.description || '',
        location: req.body.location || '',
        tournamentDate: req.body.tournamentDate || new Date().toISOString(),
        
        // Configuration data - store the validated config
        config: validatedConfig,
        
        // Legacy fields for backward compatibility - proper semantic mapping
        sport: bracketParams.competitionName,
        tournamentType: validatedConfig ? 
          mapEngineToTournamentType(validatedConfig.stages[0].engine) : 
          (bracketParams.tournamentType || 'single'),
        participantType: bracketParams.participantType,
        
        // SEMANTIC CORRECTNESS FIX:
        // - participantCount = total number of participants/teams entering tournament
        // - teamSize = number of players per team (only relevant for team competitions)  
        // - maxParticipants = total number of individual participants
        maxParticipants: Number(bracketParams.participantCount),
        teamSize: validatedConfig?.meta.teamSize || undefined, // Only if specified in config
        
        // Legacy fields with proper defaults (derived from config if available)
        ageGroup: req.body.ageGroup || "All Ages",
        genderDivision: req.body.genderDivision || "Mixed",
        
        // Optional fields with defaults
        entryFee: req.body.entryFee || "0",
        donationGoal: req.body.donationGoal || "0",
        seriesLength: req.body.seriesLength || 7,
        currentStage: req.body.currentStage || 1,
        totalStages: req.body.totalStages || 1,
        
        // Bracket and user association
        bracket: bracketStructure,
        status: 'upcoming' as const,
        userId: userId
      };

      // Validate with insertTournamentSchema for database compatibility
      let validatedTournamentData;
      try {
        validatedTournamentData = insertTournamentSchema.parse(tournamentData);
        console.log("Tournament data validation successful");
      } catch (validationError) {
        console.error('✗ Tournament data validation failed:', validationError);
        return res.status(400).json({
          message: "Invalid tournament data",
          errors: validationError instanceof z.ZodError ? validationError.errors : [validationError]
        });
      }

      const tournament = await storage.createTournament(validatedTournamentData);
      
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

      res.status(201).json({ 
        tournament,
        message: validatedConfig ? 
          'Tournament created with configuration-driven approach' : 
          'Tournament created with legacy compatibility mode'
      });
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
      if (tournament?.tournamentType === 'double') {
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
        tournamentId,
        round: nextRound,
        position: nextPosition,
        team1: 'TBD',
        team2: 'TBD',
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: 'upcoming',
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

  // Move loser to appropriate position in losers bracket using proper routing mathematics
  async function moveLoserToLosersBracket(loser: string, winnerRound: number, winnerPosition: number, tournamentId: string, allMatches: any[]) {
    try {
      // Use the bracket generator's routing logic to determine correct placement
      const routingInfo = BracketGenerator.routeLoser(winnerRound, winnerPosition - 1); // Convert to 0-based index
      const { losersRound, losersMatch, side } = routingInfo;
      
      console.log(`🔄 Routing ${loser} from W${winnerRound}-${winnerPosition} to L${losersRound}-${losersMatch + 1} (${side} side)`);
      
      // Find or create losers bracket match
      let losersMatchObj = allMatches.find(m => 
        m.round === losersRound && 
        m.position === losersMatch + 1 && // Convert back to 1-based for database
        m.bracket === 'losers'
      );
      
      if (!losersMatchObj) {
        // Create losers bracket match
        const newMatchId = `L${losersRound}-${losersMatch + 1}`;
        losersMatchObj = await storage.createMatch({
          tournamentId,
          round: losersRound,
          position: losersMatch + 1,
          team1: 'TBD',
          team2: 'TBD',
          team1Score: 0,
          team2Score: 0,
          winner: null,
          status: 'upcoming',
          bracket: 'losers'
        });
      }
      
      if (losersMatchObj) {
        // Place loser on the correct side based on routing info
        const updateData = side === 'left' 
          ? { team1: loser }
          : { team2: loser };
        
        await storage.updateMatch(losersMatchObj.id, updateData);
        console.log(`✅ Loser ${loser} placed in Losers Round ${losersRound}, Match ${losersMatch + 1} (${side} side)`);
      }
    } catch (error) {
      console.error(`❌ Error routing loser ${loser} from W${winnerRound}-${winnerPosition}:`, error);
      // Fallback: try to find any available losers bracket slot
      await fallbackLoserPlacement(loser, tournamentId, allMatches);
    }
  }

  // Fallback placement for losers when routing fails
  async function fallbackLoserPlacement(loser: string, tournamentId: string, allMatches: any[]) {
    console.log(`🔄 Attempting fallback placement for ${loser}`);
    const losersBracketMatches = allMatches.filter(m => m.bracket === 'losers' && m.status === 'upcoming');
    
    for (const match of losersBracketMatches) {
      if (!match.team1 || match.team1 === 'TBD') {
        await storage.updateMatch(match.id, { team1: loser });
        console.log(`🆘 Fallback: Placed ${loser} in L${match.round}-${match.position} (team1)`);
        return;
      } else if (!match.team2 || match.team2 === 'TBD') {
        await storage.updateMatch(match.id, { team2: loser });
        console.log(`🆘 Fallback: Placed ${loser} in L${match.round}-${match.position} (team2)`);
        return;
      }
    }
    
    console.error(`❌ Could not find any available slot for loser ${loser}`);
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

  // FFA Tournament API Endpoints
  
  // Generate FFA Tournament
  app.post("/api/ffa/generate", async (req: any, res) => {
    try {
      // Check authentication
      let isAuthenticated = false;
      let userId = null;

      // Check OAuth authentication first
      if (req.isAuthenticated && req.isAuthenticated()) {
        isAuthenticated = true;
        userId = req.user?.claims?.sub;
      }
      // Fallback to session-based authentication
      else if (req.session?.user) {
        isAuthenticated = true;
        userId = req.session.user.id;
      }

      if (!isAuthenticated || !userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Configuration-driven FFA validation - supports any tournament type through config
      const ffaGenerateSchema = z.object({
        tournamentId: z.string(),
        // Accept either legacy tournamentType or derive from config
        tournamentType: z.string().optional(), // Made optional and flexible
        config: tournamentConfigSchema.optional(), // Accept TournamentConfig for new approach
        teams: z.array(z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().optional(),
          seedNumber: z.number().optional(),
          skillLevel: z.string().optional()
        })),
        formatConfig: z.record(z.any()).optional().default({})
      });

      const validatedData = ffaGenerateSchema.parse(req.body);

      // Determine tournament type from config or legacy field
      let tournamentType = validatedData.tournamentType;
      if (validatedData.config) {
        // Configuration-driven approach - derive tournament type from config
        const firstStage = validatedData.config.stages[0];
        tournamentType = firstStage?.engine || 'leaderboard'; // Default to leaderboard for FFA
      } else if (!tournamentType) {
        // Legacy fallback with flexible support
        console.log('⚠️ No tournament type specified, defaulting to leaderboard for FFA');
        tournamentType = 'leaderboard';
      }

      // Generate FFA tournament using storage method
      const tournament = await storage.generateFFATournament(validatedData.tournamentId, {
        tournamentType: tournamentType,
        teams: validatedData.teams || [],
        formatConfig: validatedData.formatConfig,
        config: validatedData.config // Pass config for future use
      });

      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      res.status(201).json({
        success: true,
        tournament,
        message: "FFA tournament generated successfully"
      });
    } catch (error) {
      console.error("Error generating FFA tournament:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to generate FFA tournament" });
    }
  });

  // Get FFA Tournament Details
  app.get("/api/ffa/:id", async (req: any, res) => {
    try {
      const { id } = req.params;

      // Check authentication
      let isAuthenticated = false;
      let userId = null;

      if (req.isAuthenticated && req.isAuthenticated()) {
        isAuthenticated = true;
        userId = req.user?.claims?.sub;
      }
      else if (req.session?.user) {
        isAuthenticated = true;
        userId = req.session.user.id;
      }

      if (!isAuthenticated) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const tournament = await storage.getTournament(id);
      if (!tournament) {
        return res.status(404).json({ message: "FFA tournament not found" });
      }

      // SECURITY: Enforce tournament ownership/authorization
      if (tournament.userId !== userId) {
        return res.status(403).json({ message: "Access denied. You can only view tournaments you own." });
      }

      // Configuration-driven FFA tournament validation
      const isFFATournament = () => {
        // Check if tournament has a config and it's FFA-compatible
        if (tournament.config?.stages) {
          const firstStage = tournament.config.stages[0];
          return firstStage?.engine === 'leaderboard' || 
                 ['multi-heat-racing', 'battle-royale', 'point-accumulation', 'time-trials', 'survival-elimination'].includes(firstStage?.engine);
        }
        
        // Legacy check for backward compatibility
        return tournament.tournamentType && 
               ['multi-heat-racing', 'battle-royale', 'point-accumulation', 'time-trials', 'survival-elimination', 'leaderboard'].includes(tournament.tournamentType);
      };

      if (!isFFATournament()) {
        return res.status(400).json({ 
          message: "Tournament does not support FFA format. Use tournament configuration with leaderboard or FFA-compatible stage engines." 
        });
      }

      // Get additional FFA data
      const leaderboard = await storage.getFFALeaderboard(id);

      res.json({
        tournament,
        leaderboard,
        participants: tournament.teams || [],
        heatAssignments: tournament.ffaConfig?.heatAssignments || [],
        ffaConfig: tournament.ffaConfig || {}
      });
    } catch (error) {
      console.error("Error fetching FFA tournament:", error);
      res.status(500).json({ message: "Failed to fetch FFA tournament" });
    }
  });

  // Update FFA Round Results
  app.patch("/api/ffa/rounds/:id/results", async (req: any, res) => {
    try {
      const { id: tournamentId } = req.params;

      // Check authentication
      let isAuthenticated = false;
      let userId = null;

      if (req.isAuthenticated && req.isAuthenticated()) {
        isAuthenticated = true;
        userId = req.user?.claims?.sub;
      }
      else if (req.session?.user) {
        isAuthenticated = true;
        userId = req.session.user.id;
      }

      if (!isAuthenticated) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // SECURITY: First check if tournament exists and user has authorization to modify it
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      if (tournament.userId !== userId) {
        return res.status(403).json({ message: "Access denied. You can only modify tournaments you own." });
      }

      // Validate request body
      const roundResultsSchema = z.object({
        roundNumber: z.number().int().positive(),
        results: z.array(z.object({
          participantId: z.string(),
          result: z.union([z.number(), z.string()]),
          ranking: z.number().int().positive(),
          eliminated: z.boolean().optional(),
          advancedToNextRound: z.boolean().optional(),
          notes: z.string().optional()
        }))
      });

      const validatedData = roundResultsSchema.parse(req.body);

      // Update round results using storage method
      const updatedTournament = await storage.updateFFARoundResults(
        tournamentId,
        validatedData.roundNumber,
        validatedData.results
      );

      if (!updatedTournament) {
        return res.status(404).json({ message: "Tournament not found or failed to update" });
      }

      // Get updated leaderboard
      const leaderboard = await storage.getFFALeaderboard(tournamentId);

      res.json({
        success: true,
        tournament: updatedTournament,
        leaderboard,
        message: "Round results updated successfully"
      });
    } catch (error) {
      console.error("Error updating FFA round results:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update round results" });
    }
  });

  // Get FFA Participant Performance
  app.get("/api/ffa/:id/participants/:participantId/performance", async (req: any, res) => {
    try {
      const { id: tournamentId, participantId } = req.params;

      // Check authentication
      let isAuthenticated = false;
      let userId = null;

      if (req.isAuthenticated && req.isAuthenticated()) {
        isAuthenticated = true;
        userId = req.user?.claims?.sub;
      }
      else if (req.session?.user) {
        isAuthenticated = true;
        userId = req.session.user.id;
      }

      if (!isAuthenticated) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // SECURITY: Check tournament ownership before revealing participant performance
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      if (tournament.userId !== userId) {
        return res.status(403).json({ message: "Access denied. You can only view participant performance for tournaments you own." });
      }

      const performance = await storage.getFFAParticipantPerformance(tournamentId, participantId);
      if (!performance) {
        return res.status(404).json({ message: "Participant performance not found" });
      }

      res.json(performance);
    } catch (error) {
      console.error("Error fetching FFA participant performance:", error);
      res.status(500).json({ message: "Failed to fetch participant performance" });
    }
  });

  // Get FFA Leaderboard
  app.get("/api/ffa/:id/leaderboard", async (req: any, res) => {
    try {
      const { id: tournamentId } = req.params;

      // Check authentication
      let isAuthenticated = false;
      let userId = null;

      if (req.isAuthenticated && req.isAuthenticated()) {
        isAuthenticated = true;
        userId = req.user?.claims?.sub;
      }
      else if (req.session?.user) {
        isAuthenticated = true;
        userId = req.session.user.id;
      }

      if (!isAuthenticated) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // SECURITY: Check tournament ownership before revealing leaderboard
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }

      if (tournament.userId !== userId) {
        return res.status(403).json({ message: "Access denied. You can only view leaderboards for tournaments you own." });
      }

      const leaderboard = await storage.getFFALeaderboard(tournamentId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching FFA leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch FFA leaderboard" });
    }
  });

  // DEDICATED CONFIG-DRIVEN TOURNAMENT CREATION ENDPOINT
  // This endpoint is specifically for comprehensive E2E testing of all tournament types
  app.post("/api/tournaments/create-from-config", async (req: any, res) => {
    try {
      console.log('🎯 Config-driven tournament creation started');
      
      // SECURITY FIX: Proper authentication with environment-based testing mode
      let userId = req.user?.claims?.sub;
      let isAuthenticated = false;

      // Check OAuth authentication first
      if (req.isAuthenticated && req.isAuthenticated()) {
        isAuthenticated = true;
        userId = req.user?.claims?.sub;
        console.log('✅ Using OAuth authentication, userId:', userId);
      }
      // Fallback to session-based authentication
      else if (req.session?.user) {
        isAuthenticated = true;
        userId = req.session.user.id;
        console.log('✅ Using session-based authentication, userId:', userId);
      }

      // SECURITY: Only allow unauthenticated access in development/testing environments
      if (!isAuthenticated) {
        const isDevelopment = process.env.NODE_ENV === 'development' || process.env.ALLOW_TESTING_MODE === 'true';
        
        if (!isDevelopment) {
          console.log('❌ Authentication required in production environment');
          return res.status(401).json({ 
            message: "Authentication required. This endpoint requires authentication in production environments.",
            environment: process.env.NODE_ENV,
            testingModeAllowed: false
          });
        }
        
        // Development/testing mode only
        userId = 'test-user-id';
        console.log('⚠️ Using testing mode - development environment only');
      }

      // Parse and validate the TournamentConfig
      const { config, participants = [] } = req.body;
      
      if (!config) {
        return res.status(400).json({
          message: "TournamentConfig is required",
          example: {
            config: {
              meta: { name: "Test Tournament", participantType: "team", participantCount: 8 },
              divisions: [{ name: "Main Division", eligibility: {}, genderPolicy: "open" }],
              stages: [{ engine: "single", size: 8 }],
              seeding: { method: "random" }
            },
            participants: ["Team 1", "Team 2", "Team 3", "Team 4", "Team 5", "Team 6", "Team 7", "Team 8"]
          }
        });
      }
      
      let validatedConfig;
      try {
        validatedConfig = tournamentConfigSchema.parse(config);
        console.log('✅ TournamentConfig validation successful');
      } catch (validationError) {
        console.error('❌ TournamentConfig validation failed:', validationError);
        return res.status(400).json({
          message: "Invalid TournamentConfig",
          errors: validationError instanceof z.ZodError ? validationError.errors : [validationError]
        });
      }

      // Generate participant names if not provided
      const participantCount = config.meta.participantCount || participants.length || 8;
      const participantNames = participants.length > 0 ? 
        participants : 
        Array.from({ length: participantCount }, (_, i) => `${config.meta.participantType === 'individual' ? 'Player' : 'Team'} ${i + 1}`);
      
      console.log(`🏆 Creating ${config.meta.name} with ${participantNames.length} participants using ${config.stages[0].engine} engine`);

      // Generate bracket structure from config
      let bracketStructure;
      try {
        bracketStructure = BracketGenerator.generateFromConfig(
          validatedConfig,
          participantNames,
          '', // Tournament ID will be set after creation
          {
            formatConfig: req.body.formatConfig || {}
          }
        );
        console.log(`📊 Bracket generated: ${bracketStructure.totalMatches} matches, ${bracketStructure.totalRounds} rounds`);
      } catch (bracketError) {
        console.error('❌ Bracket generation failed:', bracketError);
        return res.status(500).json({
          message: "Failed to generate bracket structure",
          error: (bracketError as Error).message,
          config: validatedConfig
        });
      }

      // Prepare tournament data with semantic correctness
      const tournamentData = {
        name: config.meta.name,
        description: req.body.description || `${config.meta.name} - ${config.stages[0].engine} tournament`,
        location: req.body.location || 'Test Venue',
        tournamentDate: req.body.tournamentDate || new Date().toISOString(),
        
        // Store the full validated config
        config: validatedConfig,
        
        // Legacy compatibility fields - semantic mapping
        sport: config.meta.name,
        tournamentType: mapEngineToTournamentType(config.stages[0].engine),
        participantType: config.meta.participantType,
        
        // Participant counting with semantic correctness
        maxParticipants: Number(participantCount),
        teamSize: config.meta.teamSize || undefined, // Maps to team_size in database
        
        // Additional fields with defaults
        ageGroup: req.body.ageGroup || "Open",
        genderDivision: req.body.genderDivision || "Open",
        entryFee: req.body.entryFee || "0",
        donationGoal: req.body.donationGoal || "0",
        seriesLength: req.body.seriesLength || 7,
        currentStage: req.body.currentStage || 1,
        totalStages: req.body.totalStages || 1,
        
        // Bracket structure and metadata
        bracket: bracketStructure,
        status: 'upcoming' as const,
        userId: userId
      };

      // Validate tournament data for database insertion
      let validatedTournamentData;
      try {
        validatedTournamentData = insertTournamentSchema.parse(tournamentData);
        console.log("✅ Tournament data validation successful");
      } catch (validationError) {
        console.error('❌ Tournament data validation failed:', validationError);
        return res.status(400).json({
          message: "Invalid tournament data for database insertion",
          errors: validationError instanceof z.ZodError ? validationError.errors : [validationError]
        });
      }

      // Create tournament in database
      const tournament = await storage.createTournament(validatedTournamentData);
      console.log(`🎯 Tournament created with ID: ${tournament.id}`);
      
      // Create matches for the tournament
      const createdMatches = [];
      if (bracketStructure.matches && bracketStructure.matches.length > 0) {
        for (const match of bracketStructure.matches) {
          const createdMatch = await storage.createMatch({
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
          createdMatches.push(createdMatch);
        }
        console.log(`📋 Created ${createdMatches.length} matches`);
      }

      // Prepare comprehensive response for testing validation
      const response = {
        success: true,
        tournament,
        bracketStructure: {
          format: bracketStructure.format,
          totalMatches: bracketStructure.totalMatches,
          totalRounds: bracketStructure.totalRounds,
          matchCount: bracketStructure.matches?.length || 0,
          participants: participantNames.length,
        },
        validation: {
          configEngine: config.stages[0].engine,
          tournamentType: tournamentData.tournamentType,
          participantCount: participantNames.length,
          expectedMatches: bracketStructure.totalMatches,
          actualMatches: createdMatches.length,
          mathematicsCorrect: bracketStructure.totalMatches === createdMatches.length
        },
        message: `Tournament '${config.meta.name}' created successfully with ${config.stages[0].engine} engine`
      };

      res.status(201).json(response);
      
    } catch (error) {
      console.error("❌ Error in config-driven tournament creation:", error);
      res.status(500).json({ 
        message: "Failed to create tournament from config",
        error: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      });
    }
  });

  // ==========================================
  // COMPREHENSIVE TOURNAMENT MANAGEMENT API
  // Integrates all tournament services built
  // ==========================================

  // Tournament Service Endpoints

  // Create comprehensive tournament with advanced configuration
  app.post("/api/tournaments/comprehensive", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const tournament = await TournamentService.createTournament(req.body, user);
      res.status(201).json(tournament);
    } catch (error) {
      console.error("Tournament creation failed:", error);
      res.status(500).json({ message: "Failed to create tournament", error: (error as Error).message });
    }
  });

  // Get comprehensive tournament statistics
  app.get("/api/tournaments/:id/statistics", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const statistics = await TournamentService.getTournamentStatistics(req.params.id, user);
      res.json(statistics);
    } catch (error) {
      console.error("Failed to get tournament statistics:", error);
      res.status(500).json({ message: "Failed to get statistics", error: (error as Error).message });
    }
  });

  // Clone tournament structure
  app.post("/api/tournaments/:id/clone", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const { newName } = req.body;
      const clonedTournament = await TournamentService.cloneTournament(req.params.id, newName, user);
      res.status(201).json(clonedTournament);
    } catch (error) {
      console.error("Tournament cloning failed:", error);
      res.status(500).json({ message: "Failed to clone tournament", error: (error as Error).message });
    }
  });

  // Generate Swiss system pairings
  app.post("/api/tournaments/:id/swiss-pairings", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const { roundNumber, options } = req.body;
      const pairings = await TournamentService.generateSwissPairings(req.params.id, roundNumber, options, user);
      res.json(pairings);
    } catch (error) {
      console.error("Swiss pairings generation failed:", error);
      res.status(500).json({ message: "Failed to generate pairings", error: (error as Error).message });
    }
  });

  // Calculate pool advancement
  app.post("/api/tournaments/:id/pool-advancement", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const advancement = await TournamentService.calculatePoolAdvancement(req.params.id, req.body.rules, user);
      res.json(advancement);
    } catch (error) {
      console.error("Pool advancement calculation failed:", error);
      res.status(500).json({ message: "Failed to calculate advancement", error: (error as Error).message });
    }
  });

  // Registration Service Endpoints

  // Create registration form
  app.post("/api/tournaments/:id/registration-forms", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const form = await TournamentRegistrationService.createRegistrationForm(req.params.id, req.body, user);
      res.status(201).json(form);
    } catch (error) {
      console.error("Registration form creation failed:", error);
      res.status(500).json({ message: "Failed to create registration form", error: (error as Error).message });
    }
  });

  // Submit team registration
  app.post("/api/registration-forms/:formId/submit", async (req: any, res) => {
    try {
      const user = req.user?.claims?.sub || req.session?.user?.id ? 
        { id: req.user?.claims?.sub || req.session?.user?.id, userRole: 'team_member' } : undefined;
      const submission = await TournamentRegistrationService.submitTeamRegistration(req.params.formId, req.body, user);
      res.status(201).json(submission);
    } catch (error) {
      console.error("Team registration submission failed:", error);
      res.status(500).json({ message: "Failed to submit registration", error: (error as Error).message });
    }
  });

  // Process registration payment
  app.post("/api/registration-submissions/:id/payment", async (req: any, res) => {
    try {
      const user = req.user?.claims?.sub || req.session?.user?.id ? 
        { id: req.user?.claims?.sub || req.session?.user?.id, userRole: 'team_member' } : undefined;
      const payment = await TournamentRegistrationService.processRegistrationPayment(req.params.id, req.body, user);
      res.json(payment);
    } catch (error) {
      console.error("Payment processing failed:", error);
      res.status(500).json({ message: "Failed to process payment", error: (error as Error).message });
    }
  });

  // Update registration approval
  app.patch("/api/registration-submissions/:id/approval", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const submission = await TournamentRegistrationService.updateRegistrationApproval(req.params.id, req.body, user);
      res.json(submission);
    } catch (error) {
      console.error("Registration approval update failed:", error);
      res.status(500).json({ message: "Failed to update approval", error: (error as Error).message });
    }
  });

  // Update team roster
  app.patch("/api/registration-submissions/:id/roster", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'team_member' };
      const result = await TournamentRegistrationService.updateTeamRoster(req.params.id, req.body.roster, user);
      res.json(result);
    } catch (error) {
      console.error("Roster update failed:", error);
      res.status(500).json({ message: "Failed to update roster", error: (error as Error).message });
    }
  });

  // Get registration statistics
  app.get("/api/tournaments/:id/registration-stats", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const stats = await TournamentRegistrationService.getRegistrationStatistics(req.params.id, user);
      res.json(stats);
    } catch (error) {
      console.error("Registration statistics failed:", error);
      res.status(500).json({ message: "Failed to get statistics", error: (error as Error).message });
    }
  });

  // Live Scoring Service Endpoints

  // Start live scoring for a match
  app.post("/api/matches/:id/start-scoring", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'scorekeeper' };
      const { scorerId } = req.body;
      const liveScore = await LiveScoringService.startLiveScoring(req.params.id, scorerId || user.id, user);
      res.status(201).json(liveScore);
    } catch (error) {
      console.error("Live scoring start failed:", error);
      res.status(500).json({ message: "Failed to start live scoring", error: (error as Error).message });
    }
  });

  // Update live score
  app.patch("/api/matches/:id/live-score", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'scorekeeper' };
      const { scorerId, ...scoreUpdate } = req.body;
      const result = await LiveScoringService.updateLiveScore(req.params.id, scoreUpdate, scorerId || user.id, user);
      res.json(result);
    } catch (error) {
      console.error("Live score update failed:", error);
      res.status(500).json({ message: "Failed to update score", error: (error as Error).message });
    }
  });

  // Complete match with final result
  app.post("/api/matches/:id/complete", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'scorekeeper' };
      const { scorerId, ...finalResult } = req.body;
      const result = await LiveScoringService.completeMatch(req.params.id, finalResult, scorerId || user.id, user);
      res.json(result);
    } catch (error) {
      console.error("Match completion failed:", error);
      res.status(500).json({ message: "Failed to complete match", error: (error as Error).message });
    }
  });

  // Report scoring conflict
  app.post("/api/matches/:id/conflict", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'scorekeeper' };
      const { reporterId, ...conflict } = req.body;
      const conflictReport = await LiveScoringService.reportScoringConflict({
        ...conflict,
        matchId: req.params.id
      }, reporterId || user.id, user);
      res.status(201).json(conflictReport);
    } catch (error) {
      console.error("Conflict reporting failed:", error);
      res.status(500).json({ message: "Failed to report conflict", error: (error as Error).message });
    }
  });

  // Get live tournament data
  app.get("/api/tournaments/:id/live", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const liveData = await LiveScoringService.getLiveTournamentData(req.params.id, user);
      res.json(liveData);
    } catch (error) {
      console.error("Live tournament data failed:", error);
      res.status(500).json({ message: "Failed to get live data", error: (error as Error).message });
    }
  });

  // Get scoring analytics
  app.get("/api/tournaments/:id/scoring-analytics", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const options = {
        includePlayerStats: req.query.includePlayerStats === 'true',
        includeTeamStats: req.query.includeTeamStats === 'true',
        includeMatchTrends: req.query.includeMatchTrends === 'true'
      };
      const analytics = await LiveScoringService.getScoringAnalytics(req.params.id, options, user);
      res.json(analytics);
    } catch (error) {
      console.error("Scoring analytics failed:", error);
      res.status(500).json({ message: "Failed to get analytics", error: (error as Error).message });
    }
  });

  // Tournament Director Service Endpoints

  // Get tournament director dashboard
  app.get("/api/tournaments/:id/director-dashboard", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const dashboard = await TournamentDirectorService.getTournamentDashboard(req.params.id, user);
      res.json(dashboard);
    } catch (error) {
      console.error("Director dashboard failed:", error);
      res.status(500).json({ message: "Failed to get dashboard", error: (error as Error).message });
    }
  });

  // Send tournament communication
  app.post("/api/tournaments/:id/communicate", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const result = await TournamentDirectorService.sendTournamentCommunication(req.params.id, req.body, user);
      res.json(result);
    } catch (error) {
      console.error("Tournament communication failed:", error);
      res.status(500).json({ message: "Failed to send communication", error: (error as Error).message });
    }
  });

  // Generate tournament report
  app.post("/api/tournaments/:id/reports", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const report = await TournamentDirectorService.generateTournamentReport(req.params.id, req.body, user);
      res.status(201).json(report);
    } catch (error) {
      console.error("Report generation failed:", error);
      res.status(500).json({ message: "Failed to generate report", error: (error as Error).message });
    }
  });

  // Execute tournament override (emergency controls)
  app.post("/api/tournaments/:id/override", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'district_athletic_director' };
      const result = await TournamentDirectorService.executeTournamentOverride(req.params.id, req.body, user);
      res.json(result);
    } catch (error) {
      console.error("Tournament override failed:", error);
      res.status(500).json({ message: "Failed to execute override", error: (error as Error).message });
    }
  });

  // Get tournament control permissions
  app.get("/api/tournaments/:id/control", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const control = await TournamentDirectorService.getTournamentControl(req.params.id, user);
      res.json(control);
    } catch (error) {
      console.error("Tournament control check failed:", error);
      res.status(500).json({ message: "Failed to get control permissions", error: (error as Error).message });
    }
  });

  // Monitor tournament health
  app.get("/api/tournaments/:id/health", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'tournament_manager' };
      const health = await TournamentDirectorService.monitorTournamentHealth(req.params.id, user);
      res.json(health);
    } catch (error) {
      console.error("Tournament health monitoring failed:", error);
      res.status(500).json({ message: "Failed to monitor health", error: (error as Error).message });
    }
  });

  // WebSocket Support for Live Updates
  // Initialize WebSocket server for live scoring on startup
  if (process.env.NODE_ENV !== 'test') {
    try {
      LiveScoringService.initializeWebSocketServer(parseInt(process.env.WS_PORT || '8080'));
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
    }
  }

  // WebSocket subscription endpoint
  app.get("/api/tournaments/:id/subscribe", async (req: any, res) => {
    try {
      res.json({
        message: "WebSocket subscription available",
        wsUrl: `ws://localhost:${process.env.WS_PORT || 8080}`,
        tournamentId: req.params.id,
        instructions: "Connect to WebSocket and send {'type': 'subscribe', 'tournamentId': '<id>'}"
      });
    } catch (error) {
      console.error("WebSocket subscription info failed:", error);
      res.status(500).json({ message: "Failed to get subscription info", error: (error as Error).message });
    }
  });

  // Update match result with automatic bracket progression
  app.patch("/api/matches/:id/result", async (req: any, res) => {
    try {
      const user = { id: req.user?.claims?.sub || req.session?.user?.id || 'test-user', userRole: 'scorekeeper' };
      const result = await TournamentService.updateMatchResult(req.params.id, req.body, user);
      res.json(result);
    } catch (error) {
      console.error("Match result update failed:", error);
      res.status(500).json({ message: "Failed to update match result", error: (error as Error).message });
    }
  });

  console.log("✅ Comprehensive Tournament Management API routes registered");
}