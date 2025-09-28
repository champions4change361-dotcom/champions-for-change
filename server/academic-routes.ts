import type { Express } from "express";
import { 
  loadUserContext, 
  requireAcademicDataAccess, 
  requirePermissions, 
  requireOrganizationAccess 
} from "./rbac-middleware";
import { PERMISSIONS } from "./rbac-permissions";
import AcademicCompetitionService from "./academic-competition-service";
import { 
  insertAcademicDistrictSchema,
  insertAcademicCompetitionSchema,
  insertAcademicMeetSchema,
  insertSchoolAcademicProgramSchema,
  insertAcademicTeamSchema,
  insertAcademicParticipantSchema,
  insertAcademicResultSchema,
  insertAcademicOfficialSchema
} from "@shared/schema";

// Initialize the academic competition service
const academicService = new AcademicCompetitionService();

/**
 * Register Academic Competition API Routes
 * Comprehensive API endpoints for UIL academic competition management
 * All routes require proper RBAC permissions and FERPA compliance
 */
export function registerAcademicRoutes(app: Express): void {
  console.log('🎓 Registering Academic Competition API routes');

  // ===================================================================
  // SYSTEM STATUS AND HEALTH
  // ===================================================================

  // Get academic system status
  app.get('/api/academic/system/status', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const status = await academicService.getSystemStatus(req.user!);
      res.json(status);
    } catch (error: any) {
      console.error('Get academic system status error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve system status',
        details: error.message 
      });
    }
  });

  // Get user dashboard
  app.get('/api/academic/dashboard', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const dashboard = await academicService.generateUserDashboard(req.user!);
      res.json(dashboard);
    } catch (error: any) {
      console.error('Get academic dashboard error:', error);
      res.status(500).json({ 
        error: 'Failed to generate dashboard',
        details: error.message 
      });
    }
  });

  // Get system integrations status
  app.get('/api/academic/system/integrations', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.SYSTEM_ADMIN]), 
    async (req, res) => {
    try {
      const integrations = await academicService.getSystemIntegrations(req.user!);
      res.json(integrations);
    } catch (error: any) {
      console.error('Get system integrations error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve system integrations',
        details: error.message 
      });
    }
  });

  // ===================================================================
  // UIL COMPETITION MANAGEMENT
  // ===================================================================

  // Get all UIL competitions
  app.get('/api/academic/competitions/uil', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const uilService = academicService.getUILEventService();
      const competitions = await uilService.getAllUILCompetitions(req.user!);
      res.json(competitions);
    } catch (error: any) {
      console.error('Get UIL competitions error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve UIL competitions',
        details: error.message 
      });
    }
  });

  // Get UIL competitions by type
  app.get('/api/academic/competitions/uil/:type', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { type } = req.params;
      if (type !== 'high_school' && type !== 'aplus') {
        return res.status(400).json({ error: 'Invalid competition type' });
      }

      const uilService = academicService.getUILEventService();
      const competitions = await uilService.getUILCompetitionsByType(type, req.user!);
      res.json(competitions);
    } catch (error: any) {
      console.error('Get UIL competitions by type error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve UIL competitions by type',
        details: error.message 
      });
    }
  });

  // Get UIL competitions by subject
  app.get('/api/academic/competitions/subject/:subject', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { subject } = req.params;
      const uilService = academicService.getUILEventService();
      const competitions = await uilService.getUILCompetitionsBySubject(subject, req.user!);
      res.json(competitions);
    } catch (error: any) {
      console.error('Get UIL competitions by subject error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve UIL competitions by subject',
        details: error.message 
      });
    }
  });

  // Create academic district
  app.post('/api/academic/districts', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const validatedData = insertAcademicDistrictSchema.parse(req.body);
      const uilService = academicService.getUILEventService();
      const district = await uilService.createAcademicDistrict(validatedData, req.user!);
      res.status(201).json(district);
    } catch (error: any) {
      console.error('Create academic district error:', error);
      res.status(500).json({ 
        error: 'Failed to create academic district',
        details: error.message 
      });
    }
  });

  // Get academic districts by region
  app.get('/api/academic/districts/region/:region', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { region } = req.params;
      const uilService = academicService.getUILEventService();
      const districts = await uilService.getAcademicDistrictsByRegion(region, req.user!);
      res.json(districts);
    } catch (error: any) {
      console.error('Get academic districts by region error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve academic districts',
        details: error.message 
      });
    }
  });

  // Create academic meet
  app.post('/api/academic/meets', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const validatedData = insertAcademicMeetSchema.parse(req.body);
      const uilService = academicService.getUILEventService();
      const meet = await uilService.createAcademicMeet(validatedData, req.user!);
      res.status(201).json(meet);
    } catch (error: any) {
      console.error('Create academic meet error:', error);
      res.status(500).json({ 
        error: 'Failed to create academic meet',
        details: error.message 
      });
    }
  });

  // Get academic meets by district
  app.get('/api/academic/meets/district/:districtId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { districtId } = req.params;
      const uilService = academicService.getUILEventService();
      const meets = await uilService.getAcademicMeetsByDistrict(districtId, req.user!);
      res.json(meets);
    } catch (error: any) {
      console.error('Get academic meets by district error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve academic meets',
        details: error.message 
      });
    }
  });

  // Get academic meets by date range
  app.get('/api/academic/meets', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const uilService = academicService.getUILEventService();
      const meets = await uilService.getAcademicMeetsByDateRange(
        startDate as string, 
        endDate as string, 
        req.user!
      );
      res.json(meets);
    } catch (error: any) {
      console.error('Get academic meets by date range error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve academic meets',
        details: error.message 
      });
    }
  });

  // Register participant for competition
  app.post('/api/academic/participants/register', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const uilService = academicService.getUILEventService();
      const participant = await uilService.registerParticipant(req.body, req.user!);
      res.status(201).json(participant);
    } catch (error: any) {
      console.error('Register participant error:', error);
      res.status(500).json({ 
        error: 'Failed to register participant',
        details: error.message 
      });
    }
  });

  // Create complete academic meet with workflow
  app.post('/api/academic/meets/complete', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { meetData, competitions } = req.body;
      const validatedMeetData = insertAcademicMeetSchema.parse(meetData);
      
      const result = await academicService.createCompleteMeet(
        validatedMeetData, 
        competitions, 
        req.user!
      );
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Create complete meet error:', error);
      res.status(500).json({ 
        error: 'Failed to create complete academic meet',
        details: error.message 
      });
    }
  });

  // ===================================================================
  // SCORING AND RESULTS MANAGEMENT
  // ===================================================================

  // Get scoring rubric for competition
  app.get('/api/academic/scoring/rubric/:competitionId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { competitionId } = req.params;
      const { contestFormat } = req.query;
      
      const scoringService = academicService.getScoringService();
      const rubric = await scoringService.getScoringRubric(
        competitionId, 
        contestFormat as string, 
        req.user!
      );
      res.json(rubric);
    } catch (error: any) {
      console.error('Get scoring rubric error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve scoring rubric',
        details: error.message 
      });
    }
  });

  // Assign judges to competition
  app.post('/api/academic/scoring/judges/assign', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const scoringService = academicService.getScoringService();
      const assignments = await scoringService.assignJudges(req.body, req.user!);
      res.status(201).json(assignments);
    } catch (error: any) {
      console.error('Assign judges error:', error);
      res.status(500).json({ 
        error: 'Failed to assign judges',
        details: error.message 
      });
    }
  });

  // Submit scores for participant
  app.post('/api/academic/scoring/submit', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const scoringService = academicService.getScoringService();
      const result = await scoringService.submitScores(req.body, req.user!);
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Submit scores error:', error);
      res.status(500).json({ 
        error: 'Failed to submit scores',
        details: error.message 
      });
    }
  });

  // Process competition results
  app.post('/api/academic/scoring/process/:competitionId/:meetId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { competitionId, meetId } = req.params;
      const scoringService = academicService.getScoringService();
      const results = await scoringService.processCompetitionResults(
        competitionId, 
        meetId, 
        req.user!
      );
      res.json(results);
    } catch (error: any) {
      console.error('Process competition results error:', error);
      res.status(500).json({ 
        error: 'Failed to process competition results',
        details: error.message 
      });
    }
  });

  // Verify competition results
  app.post('/api/academic/scoring/verify/:competitionId/:meetId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { competitionId, meetId } = req.params;
      const { verifiedBy } = req.body;
      
      const scoringService = academicService.getScoringService();
      const verified = await scoringService.verifyResults(
        competitionId, 
        meetId, 
        verifiedBy, 
        req.user!
      );
      res.json({ verified });
    } catch (error: any) {
      console.error('Verify results error:', error);
      res.status(500).json({ 
        error: 'Failed to verify results',
        details: error.message 
      });
    }
  });

  // Report scoring conflict
  app.post('/api/academic/scoring/conflict/report', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const scoringService = academicService.getScoringService();
      const conflict = await scoringService.reportScoringConflict(req.body, req.user!);
      res.status(201).json(conflict);
    } catch (error: any) {
      console.error('Report scoring conflict error:', error);
      res.status(500).json({ 
        error: 'Failed to report scoring conflict',
        details: error.message 
      });
    }
  });

  // Process complete scoring workflow
  app.post('/api/academic/scoring/complete/:competitionId/:meetId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { competitionId, meetId } = req.params;
      const result = await academicService.processCompleteScoring(
        competitionId, 
        meetId, 
        req.user!
      );
      res.json(result);
    } catch (error: any) {
      console.error('Process complete scoring error:', error);
      res.status(500).json({ 
        error: 'Failed to process complete scoring',
        details: error.message 
      });
    }
  });

  // ===================================================================
  // PROGRESSION TRACKING
  // ===================================================================

  // Get advancement criteria
  app.get('/api/academic/progression/criteria/:competitionId/:level', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { competitionId, level } = req.params;
      const progressionService = academicService.getProgressionService();
      const criteria = await progressionService.getAdvancementCriteria(
        competitionId, 
        level as any, 
        req.user!
      );
      res.json(criteria);
    } catch (error: any) {
      console.error('Get advancement criteria error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve advancement criteria',
        details: error.message 
      });
    }
  });

  // Track participant progression
  app.get('/api/academic/progression/participant/:participantId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { participantId } = req.params;
      const progressionService = academicService.getProgressionService();
      const progression = await progressionService.trackParticipantProgression(
        participantId, 
        req.user!
      );
      res.json(progression);
    } catch (error: any) {
      console.error('Track participant progression error:', error);
      res.status(500).json({ 
        error: 'Failed to track participant progression',
        details: error.message 
      });
    }
  });

  // Track team progression
  app.get('/api/academic/progression/team/:teamId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { teamId } = req.params;
      const progressionService = academicService.getProgressionService();
      const progression = await progressionService.trackTeamProgression(teamId, req.user!);
      res.json(progression);
    } catch (error: any) {
      console.error('Track team progression error:', error);
      res.status(500).json({ 
        error: 'Failed to track team progression',
        details: error.message 
      });
    }
  });

  // Send advancement notifications
  app.post('/api/academic/progression/notifications/:competitionId/:meetId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { competitionId, meetId } = req.params;
      const progressionService = academicService.getProgressionService();
      const notifications = await progressionService.sendAdvancementNotifications(
        competitionId, 
        meetId, 
        req.user!
      );
      res.json(notifications);
    } catch (error: any) {
      console.error('Send advancement notifications error:', error);
      res.status(500).json({ 
        error: 'Failed to send advancement notifications',
        details: error.message 
      });
    }
  });

  // Generate progression analytics
  app.get('/api/academic/progression/analytics/:competitionId/:level', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { competitionId, level } = req.params;
      const progressionService = academicService.getProgressionService();
      const analytics = await progressionService.generateProgressionAnalytics(
        competitionId, 
        level, 
        req.user!
      );
      res.json(analytics);
    } catch (error: any) {
      console.error('Generate progression analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to generate progression analytics',
        details: error.message 
      });
    }
  });

  // ===================================================================
  // TEKS ALIGNMENT AND COMPLIANCE
  // ===================================================================

  // Get TEKS standards
  app.get('/api/academic/teks/standards/:subjectArea', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { subjectArea } = req.params;
      const { gradeLevel } = req.query;
      
      const teksService = academicService.getTeksService();
      const standards = await teksService.getTeksStandards(
        subjectArea, 
        gradeLevel as string, 
        req.user
      );
      res.json(standards);
    } catch (error: any) {
      console.error('Get TEKS standards error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve TEKS standards',
        details: error.message 
      });
    }
  });

  // Search TEKS standards
  app.post('/api/academic/teks/search', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { searchQuery, filters } = req.body;
      const teksService = academicService.getTeksService();
      const standards = await teksService.searchTeksStandards(searchQuery, filters, req.user!);
      res.json(standards);
    } catch (error: any) {
      console.error('Search TEKS standards error:', error);
      res.status(500).json({ 
        error: 'Failed to search TEKS standards',
        details: error.message 
      });
    }
  });

  // Analyze competition alignment
  app.get('/api/academic/teks/alignment/:competitionId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { competitionId } = req.params;
      const teksService = academicService.getTeksService();
      const alignment = await teksService.analyzeCompetitionAlignment(competitionId, req.user!);
      res.json(alignment);
    } catch (error: any) {
      console.error('Analyze competition alignment error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze competition alignment',
        details: error.message 
      });
    }
  });

  // Generate curriculum mapping
  app.post('/api/academic/teks/curriculum-mapping', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { schoolId, academicYear, subjectArea, gradeLevel } = req.body;
      const teksService = academicService.getTeksService();
      const mapping = await teksService.generateCurriculumMapping(
        schoolId, 
        academicYear, 
        subjectArea, 
        gradeLevel, 
        req.user!
      );
      res.json(mapping);
    } catch (error: any) {
      console.error('Generate curriculum mapping error:', error);
      res.status(500).json({ 
        error: 'Failed to generate curriculum mapping',
        details: error.message 
      });
    }
  });

  // Generate compliance report
  app.post('/api/academic/teks/compliance-report', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { reportType, scope } = req.body;
      const teksService = academicService.getTeksService();
      const report = await teksService.generateComplianceReport(reportType, scope, req.user!);
      res.json(report);
    } catch (error: any) {
      console.error('Generate compliance report error:', error);
      res.status(500).json({ 
        error: 'Failed to generate compliance report',
        details: error.message 
      });
    }
  });

  // Validate educational standards
  app.post('/api/academic/teks/validate/:competitionId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { competitionId } = req.params;
      const { validationType, validator } = req.body;
      
      const teksService = academicService.getTeksService();
      const validation = await teksService.validateEducationalStandards(
        competitionId, 
        validationType, 
        validator, 
        req.user!
      );
      res.json(validation);
    } catch (error: any) {
      console.error('Validate educational standards error:', error);
      res.status(500).json({ 
        error: 'Failed to validate educational standards',
        details: error.message 
      });
    }
  });

  // ===================================================================
  // ANALYTICS AND REPORTING
  // ===================================================================

  // Generate participant metrics
  app.get('/api/academic/analytics/participant/:participantId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { participantId } = req.params;
      const { timeframe } = req.query;
      
      const analyticsService = academicService.getAnalyticsService();
      const metrics = await analyticsService.generateParticipantMetrics(
        participantId, 
        timeframe as string, 
        req.user!
      );
      res.json(metrics);
    } catch (error: any) {
      console.error('Generate participant metrics error:', error);
      res.status(500).json({ 
        error: 'Failed to generate participant metrics',
        details: error.message 
      });
    }
  });

  // Generate school analytics
  app.get('/api/academic/analytics/school/:schoolId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { schoolId } = req.params;
      const { academicYear } = req.query;
      
      const analyticsService = academicService.getAnalyticsService();
      const analytics = await analyticsService.generateSchoolAnalytics(
        schoolId, 
        academicYear as string, 
        req.user!
      );
      res.json(analytics);
    } catch (error: any) {
      console.error('Generate school analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to generate school analytics',
        details: error.message 
      });
    }
  });

  // Generate district analytics
  app.get('/api/academic/analytics/district/:districtId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { districtId } = req.params;
      const { academicYear } = req.query;
      
      const analyticsService = academicService.getAnalyticsService();
      const analytics = await analyticsService.generateDistrictAnalytics(
        districtId, 
        academicYear as string, 
        req.user!
      );
      res.json(analytics);
    } catch (error: any) {
      console.error('Generate district analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to generate district analytics',
        details: error.message 
      });
    }
  });

  // Generate competition analytics
  app.get('/api/academic/analytics/competition/:competitionId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { competitionId } = req.params;
      const { timeframe } = req.query;
      
      const analyticsService = academicService.getAnalyticsService();
      const analytics = await analyticsService.generateCompetitionAnalytics(
        competitionId, 
        timeframe as string, 
        req.user!
      );
      res.json(analytics);
    } catch (error: any) {
      console.error('Generate competition analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to generate competition analytics',
        details: error.message 
      });
    }
  });

  // Generate historical trends
  app.post('/api/academic/analytics/trends', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { scope, yearsBack } = req.body;
      const analyticsService = academicService.getAnalyticsService();
      const trends = await analyticsService.generateHistoricalTrends(scope, yearsBack, req.user!);
      res.json(trends);
    } catch (error: any) {
      console.error('Generate historical trends error:', error);
      res.status(500).json({ 
        error: 'Failed to generate historical trends',
        details: error.message 
      });
    }
  });

  // Generate comprehensive school report
  app.get('/api/academic/reports/school/:schoolId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_READ]), 
    async (req, res) => {
    try {
      const { schoolId } = req.params;
      const { academicYear } = req.query;
      
      const report = await academicService.generateSchoolReport(
        schoolId, 
        academicYear as string, 
        req.user!
      );
      res.json(report);
    } catch (error: any) {
      console.error('Generate school report error:', error);
      res.status(500).json({ 
        error: 'Failed to generate school report',
        details: error.message 
      });
    }
  });

  // ===================================================================
  // WORKFLOW MANAGEMENT
  // ===================================================================

  // Create competition workflow
  app.post('/api/academic/workflows', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { workflowType, competitionId } = req.body;
      const workflow = await academicService.createCompetitionWorkflow(
        workflowType, 
        competitionId, 
        req.user!
      );
      res.status(201).json(workflow);
    } catch (error: any) {
      console.error('Create competition workflow error:', error);
      res.status(500).json({ 
        error: 'Failed to create competition workflow',
        details: error.message 
      });
    }
  });

  // Update workflow step
  app.put('/api/academic/workflows/:workflowId/steps/:stepId', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { workflowId, stepId } = req.params;
      const { status, notes } = req.body;
      
      await academicService.updateWorkflowStep(workflowId, stepId, status, notes, req.user);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Update workflow step error:', error);
      res.status(500).json({ 
        error: 'Failed to update workflow step',
        details: error.message 
      });
    }
  });

  // ===================================================================
  // BULK OPERATIONS
  // ===================================================================

  // Execute bulk participant registration
  app.post('/api/academic/bulk/participants/register', 
    loadUserContext, 
    requirePermissions([PERMISSIONS.ACADEMIC_DATA_WRITE]), 
    async (req, res) => {
    try {
      const { registrationData } = req.body;
      const result = await academicService.executeBulkParticipantRegistration(
        registrationData, 
        req.user!
      );
      res.status(201).json(result);
    } catch (error: any) {
      console.error('Execute bulk participant registration error:', error);
      res.status(500).json({ 
        error: 'Failed to execute bulk participant registration',
        details: error.message 
      });
    }
  });

  console.log('✅ Academic Competition API routes registered successfully');
}