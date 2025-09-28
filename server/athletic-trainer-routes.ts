import type { Express } from "express";
import { athleticTrainerService } from "./athletic-trainer-service";
import { injuryTrackingService } from "./injury-tracking-service";
import { healthRiskAssessmentService } from "./health-risk-assessment";
import { healthCommunicationService } from "./health-communication-service";
import { aiHealthAnalyticsService } from "./ai-health-analytics";
import { healthAlertService } from "./health-alert-system";
import { medicalConsultationService } from "./medical-consultation-ai";
import { loadUserContext, requireHealthDataAccess, requirePermissions } from "./rbac-middleware";
import { PERMISSIONS } from "./rbac-permissions";
import { logComplianceAction } from "./complianceMiddleware";
import type { User } from "@shared/schema";

/**
 * Athletic Trainer Routes
 * Comprehensive REST API endpoints for athletic trainer dashboard functionality
 */
export function registerAthleticTrainerRoutes(app: Express): void {
  console.log('🏥 Registering Athletic Trainer Dashboard API routes');

  // ==== ATHLETE MANAGEMENT ROUTES ====

  // Get athlete profile
  app.get("/api/athletic-trainer/athletes/:athleteId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;

        const profile = await athleticTrainerService.getAthleteProfile(athleteId, user);
        
        if (!profile) {
          return res.status(404).json({ error: "Athlete not found" });
        }

        res.json(profile);
      } catch (error: any) {
        console.error("Get athlete profile error:", error);
        res.status(500).json({ 
          error: "Failed to get athlete profile",
          details: error.message 
        });
      }
    }
  );

  // Create athlete profile
  app.post("/api/athletic-trainer/athletes", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const athleteData = req.body;

        const profile = await athleticTrainerService.createAthleteProfile(athleteData, user);
        
        res.status(201).json(profile);
      } catch (error: any) {
        console.error("Create athlete profile error:", error);
        res.status(500).json({ 
          error: "Failed to create athlete profile",
          details: error.message 
        });
      }
    }
  );

  // Update athlete profile
  app.patch("/api/athletic-trainer/athletes/:athleteId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const updates = req.body;

        const profile = await athleticTrainerService.updateAthleteProfile(athleteId, updates, user);
        
        res.json(profile);
      } catch (error: any) {
        console.error("Update athlete profile error:", error);
        res.status(500).json({ 
          error: "Failed to update athlete profile",
          details: error.message 
        });
      }
    }
  );

  // Get athletes by trainer
  app.get("/api/athletic-trainer/my-athletes", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;

        const athletes = await athleticTrainerService.getAthletesByTrainer(user.id, user);
        
        res.json(athletes);
      } catch (error: any) {
        console.error("Get trainer athletes error:", error);
        res.status(500).json({ 
          error: "Failed to get trainer athletes",
          details: error.message 
        });
      }
    }
  );

  // Get athletes by organization
  app.get("/api/athletic-trainer/athletes", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { organizationId } = req.query;

        const orgId = organizationId as string || user.organizationId;
        if (!orgId) {
          return res.status(400).json({ error: "Organization ID required" });
        }

        const athletes = await athleticTrainerService.getAthletesByOrganization(orgId, user);
        
        res.json(athletes);
      } catch (error: any) {
        console.error("Get organization athletes error:", error);
        res.status(500).json({ 
          error: "Failed to get organization athletes",
          details: error.message 
        });
      }
    }
  );

  // Search athletes
  app.get("/api/athletic-trainer/athletes/search", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { q, sport, grade, status } = req.query;

        const filters = {
          sport: sport as string,
          grade: grade as string,
          status: status as string,
        };

        const athletes = await athleticTrainerService.searchAthletes(q as string || '', filters, user);
        
        res.json(athletes);
      } catch (error: any) {
        console.error("Search athletes error:", error);
        res.status(500).json({ 
          error: "Failed to search athletes",
          details: error.message 
        });
      }
    }
  );

  // Update health status
  app.patch("/api/athletic-trainer/athletes/:athleteId/health", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const healthUpdate = req.body;

        await athleticTrainerService.updateHealthStatus(athleteId, healthUpdate, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Update health status error:", error);
        res.status(500).json({ 
          error: "Failed to update health status",
          details: error.message 
        });
      }
    }
  );

  // Add medical alert
  app.post("/api/athletic-trainer/athletes/:athleteId/alerts", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const { alert } = req.body;

        await athleticTrainerService.addMedicalAlert(athleteId, alert, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Add medical alert error:", error);
        res.status(500).json({ 
          error: "Failed to add medical alert",
          details: error.message 
        });
      }
    }
  );

  // Remove medical alert
  app.delete("/api/athletic-trainer/athletes/:athleteId/alerts/:alertId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId, alertId } = req.params;
        const user = req.user!;

        await athleticTrainerService.removeMedicalAlert(athleteId, alertId, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Remove medical alert error:", error);
        res.status(500).json({ 
          error: "Failed to remove medical alert",
          details: error.message 
        });
      }
    }
  );

  // Record vital signs
  app.post("/api/athletic-trainer/athletes/:athleteId/vitals", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const vitals = req.body;

        await athleticTrainerService.recordVitalSigns(athleteId, vitals, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Record vital signs error:", error);
        res.status(500).json({ 
          error: "Failed to record vital signs",
          details: error.message 
        });
      }
    }
  );

  // ==== INJURY TRACKING ROUTES ====

  // Create injury incident
  app.post("/api/athletic-trainer/injuries", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const incidentData = req.body;

        const incident = await injuryTrackingService.createInjuryIncident(incidentData, user);
        
        res.status(201).json(incident);
      } catch (error: any) {
        console.error("Create injury incident error:", error);
        res.status(500).json({ 
          error: "Failed to create injury incident",
          details: error.message 
        });
      }
    }
  );

  // Get injury incident
  app.get("/api/athletic-trainer/injuries/:incidentId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { incidentId } = req.params;
        const user = req.user!;

        const incident = await injuryTrackingService.getInjuryIncident(incidentId, user);
        
        if (!incident) {
          return res.status(404).json({ error: "Injury incident not found" });
        }

        res.json(incident);
      } catch (error: any) {
        console.error("Get injury incident error:", error);
        res.status(500).json({ 
          error: "Failed to get injury incident",
          details: error.message 
        });
      }
    }
  );

  // Update injury incident
  app.patch("/api/athletic-trainer/injuries/:incidentId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { incidentId } = req.params;
        const user = req.user!;
        const updates = req.body;

        const incident = await injuryTrackingService.updateInjuryIncident(incidentId, updates, user);
        
        res.json(incident);
      } catch (error: any) {
        console.error("Update injury incident error:", error);
        res.status(500).json({ 
          error: "Failed to update injury incident",
          details: error.message 
        });
      }
    }
  );

  // Get injury incidents (with filters)
  app.get("/api/athletic-trainer/injuries", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const filters = req.query;

        const incidents = await injuryTrackingService.getInjuryIncidents(filters, user);
        
        res.json(incidents);
      } catch (error: any) {
        console.error("Get injury incidents error:", error);
        res.status(500).json({ 
          error: "Failed to get injury incidents",
          details: error.message 
        });
      }
    }
  );

  // Get athlete injuries
  app.get("/api/athletic-trainer/athletes/:athleteId/injuries", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;

        const injuries = await injuryTrackingService.getAthleteInjuries(athleteId, user);
        
        res.json(injuries);
      } catch (error: any) {
        console.error("Get athlete injuries error:", error);
        res.status(500).json({ 
          error: "Failed to get athlete injuries",
          details: error.message 
        });
      }
    }
  );

  // Create injury follow-up
  app.post("/api/athletic-trainer/injuries/:incidentId/follow-ups", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { incidentId } = req.params;
        const user = req.user!;
        const followUpData = { ...req.body, injuryIncidentId: incidentId };

        const followUp = await injuryTrackingService.createFollowUp(followUpData, user);
        
        res.status(201).json(followUp);
      } catch (error: any) {
        console.error("Create injury follow-up error:", error);
        res.status(500).json({ 
          error: "Failed to create injury follow-up",
          details: error.message 
        });
      }
    }
  );

  // Get injury follow-ups
  app.get("/api/athletic-trainer/injuries/:incidentId/follow-ups", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { incidentId } = req.params;
        const user = req.user!;

        const followUps = await injuryTrackingService.getFollowUps(incidentId, user);
        
        res.json(followUps);
      } catch (error: any) {
        console.error("Get injury follow-ups error:", error);
        res.status(500).json({ 
          error: "Failed to get injury follow-ups",
          details: error.message 
        });
      }
    }
  );

  // Update return-to-play status
  app.patch("/api/athletic-trainer/injuries/:incidentId/return-to-play", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { incidentId } = req.params;
        const user = req.user!;
        const { status, restrictions } = req.body;

        await injuryTrackingService.updateReturnToPlayStatus(incidentId, status, restrictions, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Update return-to-play status error:", error);
        res.status(500).json({ 
          error: "Failed to update return-to-play status",
          details: error.message 
        });
      }
    }
  );

  // Clear athlete for play
  app.post("/api/athletic-trainer/athletes/:athleteId/clear-for-play", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const { incidentId, clearanceNotes } = req.body;

        await injuryTrackingService.clearAthleteForPlay(athleteId, incidentId, clearanceNotes, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Clear athlete for play error:", error);
        res.status(500).json({ 
          error: "Failed to clear athlete for play",
          details: error.message 
        });
      }
    }
  );

  // Get active injuries
  app.get("/api/athletic-trainer/injuries/active", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { organizationId } = req.query;

        const orgId = organizationId as string || user.organizationId;
        if (!orgId) {
          return res.status(400).json({ error: "Organization ID required" });
        }

        const activeInjuries = await injuryTrackingService.getActiveInjuries(orgId, user);
        
        res.json(activeInjuries);
      } catch (error: any) {
        console.error("Get active injuries error:", error);
        res.status(500).json({ 
          error: "Failed to get active injuries",
          details: error.message 
        });
      }
    }
  );

  // Get return-to-play candidates
  app.get("/api/athletic-trainer/return-to-play/candidates", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { organizationId } = req.query;

        const orgId = organizationId as string || user.organizationId;
        if (!orgId) {
          return res.status(400).json({ error: "Organization ID required" });
        }

        const candidates = await injuryTrackingService.getReturnToPlayCandidates(orgId, user);
        
        res.json(candidates);
      } catch (error: any) {
        console.error("Get return-to-play candidates error:", error);
        res.status(500).json({ 
          error: "Failed to get return-to-play candidates",
          details: error.message 
        });
      }
    }
  );

  // Get injury analytics
  app.get("/api/athletic-trainer/injuries/analytics", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { organizationId, startDate, endDate } = req.query;

        const orgId = organizationId as string || user.organizationId;
        if (!orgId) {
          return res.status(400).json({ error: "Organization ID required" });
        }

        const dateRange = {
          start: startDate as string || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: endDate as string || new Date().toISOString().split('T')[0],
        };

        const analytics = await injuryTrackingService.getInjuryAnalytics(orgId, dateRange, user);
        
        res.json(analytics);
      } catch (error: any) {
        console.error("Get injury analytics error:", error);
        res.status(500).json({ 
          error: "Failed to get injury analytics",
          details: error.message 
        });
      }
    }
  );

  // ==== HEALTH RISK ASSESSMENT ROUTES ====

  // Create risk assessment
  app.post("/api/athletic-trainer/risk-assessments", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const assessmentData = req.body;

        const assessment = await healthRiskAssessmentService.createRiskAssessment(assessmentData, user);
        
        res.status(201).json(assessment);
      } catch (error: any) {
        console.error("Create risk assessment error:", error);
        res.status(500).json({ 
          error: "Failed to create risk assessment",
          details: error.message 
        });
      }
    }
  );

  // Get risk assessment
  app.get("/api/athletic-trainer/risk-assessments/:assessmentId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { assessmentId } = req.params;
        const user = req.user!;

        const assessment = await healthRiskAssessmentService.getRiskAssessment(assessmentId, user);
        
        if (!assessment) {
          return res.status(404).json({ error: "Risk assessment not found" });
        }

        res.json(assessment);
      } catch (error: any) {
        console.error("Get risk assessment error:", error);
        res.status(500).json({ 
          error: "Failed to get risk assessment",
          details: error.message 
        });
      }
    }
  );

  // Update risk assessment
  app.patch("/api/athletic-trainer/risk-assessments/:assessmentId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { assessmentId } = req.params;
        const user = req.user!;
        const updates = req.body;

        const assessment = await healthRiskAssessmentService.updateRiskAssessment(assessmentId, updates, user);
        
        res.json(assessment);
      } catch (error: any) {
        console.error("Update risk assessment error:", error);
        res.status(500).json({ 
          error: "Failed to update risk assessment",
          details: error.message 
        });
      }
    }
  );

  // Get athlete risk assessments
  app.get("/api/athletic-trainer/athletes/:athleteId/risk-assessments", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;

        const assessments = await healthRiskAssessmentService.getAthleteRiskAssessments(athleteId, user);
        
        res.json(assessments);
      } catch (error: any) {
        console.error("Get athlete risk assessments error:", error);
        res.status(500).json({ 
          error: "Failed to get athlete risk assessments",
          details: error.message 
        });
      }
    }
  );

  // Get latest risk assessment for athlete
  app.get("/api/athletic-trainer/athletes/:athleteId/risk-assessment/latest", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;

        const assessment = await healthRiskAssessmentService.getLatestRiskAssessment(athleteId, user);
        
        if (!assessment) {
          return res.status(404).json({ error: "No risk assessment found for athlete" });
        }

        res.json(assessment);
      } catch (error: any) {
        console.error("Get latest risk assessment error:", error);
        res.status(500).json({ 
          error: "Failed to get latest risk assessment",
          details: error.message 
        });
      }
    }
  );

  // Calculate risk score
  app.post("/api/athletic-trainer/athletes/:athleteId/risk-score", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const assessmentData = req.body;

        const riskScore = await healthRiskAssessmentService.calculateRiskScore(athleteId, assessmentData, user);
        
        res.json({ riskScore });
      } catch (error: any) {
        console.error("Calculate risk score error:", error);
        res.status(500).json({ 
          error: "Failed to calculate risk score",
          details: error.message 
        });
      }
    }
  );

  // Predict injury risk
  app.post("/api/athletic-trainer/athletes/:athleteId/injury-prediction", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const { timeframe } = req.body; // timeframe in days

        const prediction = await healthRiskAssessmentService.predictInjuryRisk(athleteId, timeframe || 180, user);
        
        res.json(prediction);
      } catch (error: any) {
        console.error("Predict injury risk error:", error);
        res.status(500).json({ 
          error: "Failed to predict injury risk",
          details: error.message 
        });
      }
    }
  );

  // ==== HEALTH COMMUNICATION ROUTES ====

  // Send health message
  app.post("/api/athletic-trainer/messages", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const messageData = req.body;

        const message = await healthCommunicationService.sendMessage(messageData, user);
        
        res.status(201).json(message);
      } catch (error: any) {
        console.error("Send health message error:", error);
        res.status(500).json({ 
          error: "Failed to send health message",
          details: error.message 
        });
      }
    }
  );

  // Get health message
  app.get("/api/athletic-trainer/messages/:messageId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { messageId } = req.params;
        const user = req.user!;

        const message = await healthCommunicationService.getMessage(messageId, user);
        
        if (!message) {
          return res.status(404).json({ error: "Message not found" });
        }

        res.json(message);
      } catch (error: any) {
        console.error("Get health message error:", error);
        res.status(500).json({ 
          error: "Failed to get health message",
          details: error.message 
        });
      }
    }
  );

  // Get health messages
  app.get("/api/athletic-trainer/messages", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const filters = req.query;

        const messages = await healthCommunicationService.getMessages(filters, user);
        
        res.json(messages);
      } catch (error: any) {
        console.error("Get health messages error:", error);
        res.status(500).json({ 
          error: "Failed to get health messages",
          details: error.message 
        });
      }
    }
  );

  // Get message threads
  app.get("/api/athletic-trainer/message-threads", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const filters = req.query;

        const threads = await healthCommunicationService.getMessageThreads(filters, user);
        
        res.json(threads);
      } catch (error: any) {
        console.error("Get message threads error:", error);
        res.status(500).json({ 
          error: "Failed to get message threads",
          details: error.message 
        });
      }
    }
  );

  // Get message thread
  app.get("/api/athletic-trainer/message-threads/:threadId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { threadId } = req.params;
        const user = req.user!;

        const thread = await healthCommunicationService.getMessageThread(threadId, user);
        
        if (!thread) {
          return res.status(404).json({ error: "Message thread not found" });
        }

        res.json(thread);
      } catch (error: any) {
        console.error("Get message thread error:", error);
        res.status(500).json({ 
          error: "Failed to get message thread",
          details: error.message 
        });
      }
    }
  );

  // Mark message as read
  app.patch("/api/athletic-trainer/messages/:messageId/read", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { messageId } = req.params;
        const user = req.user!;

        await healthCommunicationService.markMessageAsRead(messageId, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Mark message as read error:", error);
        res.status(500).json({ 
          error: "Failed to mark message as read",
          details: error.message 
        });
      }
    }
  );

  // Reply to message
  app.post("/api/athletic-trainer/messages/:messageId/reply", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { messageId } = req.params;
        const user = req.user!;
        const { content } = req.body;

        const reply = await healthCommunicationService.replyToMessage(messageId, content, user);
        
        res.status(201).json(reply);
      } catch (error: any) {
        console.error("Reply to message error:", error);
        res.status(500).json({ 
          error: "Failed to reply to message",
          details: error.message 
        });
      }
    }
  );

  // Create emergency alert
  app.post("/api/athletic-trainer/emergency-alerts", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const alertData = req.body;

        const alert = await healthCommunicationService.createEmergencyAlert(alertData, user);
        
        res.status(201).json(alert);
      } catch (error: any) {
        console.error("Create emergency alert error:", error);
        res.status(500).json({ 
          error: "Failed to create emergency alert",
          details: error.message 
        });
      }
    }
  );

  // Get emergency alerts
  app.get("/api/athletic-trainer/emergency-alerts", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const filters = req.query;

        const alerts = await healthCommunicationService.getEmergencyAlerts(filters, user);
        
        res.json(alerts);
      } catch (error: any) {
        console.error("Get emergency alerts error:", error);
        res.status(500).json({ 
          error: "Failed to get emergency alerts",
          details: error.message 
        });
      }
    }
  );

  // Acknowledge emergency alert
  app.patch("/api/athletic-trainer/emergency-alerts/:alertId/acknowledge", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { alertId } = req.params;
        const user = req.user!;

        await healthCommunicationService.acknowledgeEmergencyAlert(alertId, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Acknowledge emergency alert error:", error);
        res.status(500).json({ 
          error: "Failed to acknowledge emergency alert",
          details: error.message 
        });
      }
    }
  );

  // Resolve emergency alert
  app.patch("/api/athletic-trainer/emergency-alerts/:alertId/resolve", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { alertId } = req.params;
        const user = req.user!;
        const { resolution } = req.body;

        await healthCommunicationService.resolveEmergencyAlert(alertId, resolution, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Resolve emergency alert error:", error);
        res.status(500).json({ 
          error: "Failed to resolve emergency alert",
          details: error.message 
        });
      }
    }
  );

  // Send injury notification
  app.post("/api/athletic-trainer/athletes/:athleteId/injury-notification", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const { injuryDetails, recipients } = req.body;

        await healthCommunicationService.sendInjuryNotification(athleteId, injuryDetails, recipients, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Send injury notification error:", error);
        res.status(500).json({ 
          error: "Failed to send injury notification",
          details: error.message 
        });
      }
    }
  );

  // Send clearance update
  app.post("/api/athletic-trainer/athletes/:athleteId/clearance-update", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;
        const { clearanceStatus, restrictions, recipients } = req.body;

        await healthCommunicationService.sendClearanceUpdate(athleteId, clearanceStatus, restrictions, recipients, user);
        
        res.json({ success: true });
      } catch (error: any) {
        console.error("Send clearance update error:", error);
        res.status(500).json({ 
          error: "Failed to send clearance update",
          details: error.message 
        });
      }
    }
  );

  // Update notification preferences
  app.patch("/api/athletic-trainer/notification-preferences", 
    loadUserContext,
    async (req, res) => {
      try {
        const user = req.user!;
        const preferences = req.body;

        const updatedPrefs = await healthCommunicationService.updateNotificationPreferences(preferences, user);
        
        res.json(updatedPrefs);
      } catch (error: any) {
        console.error("Update notification preferences error:", error);
        res.status(500).json({ 
          error: "Failed to update notification preferences",
          details: error.message 
        });
      }
    }
  );

  // Get notification preferences
  app.get("/api/athletic-trainer/notification-preferences", 
    loadUserContext,
    async (req, res) => {
      try {
        const user = req.user!;

        const preferences = await healthCommunicationService.getNotificationPreferences(user.id, user);
        
        res.json(preferences);
      } catch (error: any) {
        console.error("Get notification preferences error:", error);
        res.status(500).json({ 
          error: "Failed to get notification preferences",
          details: error.message 
        });
      }
    }
  );

  // ==== ANALYTICS AND REPORTING ROUTES ====

  // Get health analytics
  app.get("/api/athletic-trainer/analytics/health", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { organizationId, startDate, endDate } = req.query;

        const orgId = organizationId as string || user.organizationId;
        if (!orgId) {
          return res.status(400).json({ error: "Organization ID required" });
        }

        const dateRange = {
          start: startDate as string || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: endDate as string || new Date().toISOString().split('T')[0],
        };

        const analytics = await athleticTrainerService.getHealthAnalytics(orgId, dateRange, user);
        
        res.json(analytics);
      } catch (error: any) {
        console.error("Get health analytics error:", error);
        res.status(500).json({ 
          error: "Failed to get health analytics",
          details: error.message 
        });
      }
    }
  );

  // Get communication analytics
  app.get("/api/athletic-trainer/analytics/communication", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { organizationId, startDate, endDate } = req.query;

        const orgId = organizationId as string || user.organizationId;
        if (!orgId) {
          return res.status(400).json({ error: "Organization ID required" });
        }

        const dateRange = {
          start: startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: endDate as string || new Date().toISOString().split('T')[0],
        };

        const analytics = await healthCommunicationService.getCommunicationAnalytics(orgId, dateRange, user);
        
        res.json(analytics);
      } catch (error: any) {
        console.error("Get communication analytics error:", error);
        res.status(500).json({ 
          error: "Failed to get communication analytics",
          details: error.message 
        });
      }
    }
  );

  // ==== DASHBOARD OVERVIEW ROUTES ====

  // Get dashboard overview
  app.get("/api/athletic-trainer/dashboard/overview", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const { organizationId } = req.query;

        const orgId = organizationId as string || user.organizationId;
        if (!orgId) {
          return res.status(400).json({ error: "Organization ID required" });
        }

        // Get overview data from multiple services
        const [
          athletes,
          activeInjuries,
          returnToPlayCandidates,
          emergencyAlerts,
          messages
        ] = await Promise.all([
          athleticTrainerService.getAthletesByOrganization(orgId, user),
          injuryTrackingService.getActiveInjuries(orgId, user),
          injuryTrackingService.getReturnToPlayCandidates(orgId, user),
          healthCommunicationService.getEmergencyAlerts({ resolved: false }, user),
          healthCommunicationService.getMessages({ status: 'sent' }, user)
        ]);

        const overview = {
          totalAthletes: athletes.length,
          activeInjuries: activeInjuries.length,
          returnToPlayCandidates: returnToPlayCandidates.length,
          unreadMessages: messages.length,
          activeEmergencyAlerts: emergencyAlerts.length,
          highRiskAthletes: athletes.filter(athlete => 
            athlete.healthInfo.riskScore && athlete.healthInfo.riskScore >= 70
          ).length,
          recentActivity: {
            newInjuries: activeInjuries.filter(injury => {
              const incidentDate = new Date(injury.incidentDate);
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return incidentDate >= weekAgo;
            }).length,
            completedFollowUps: 0, // TODO: Implement when follow-up tracking is available
            clearedAthletes: athletes.filter(athlete => 
              athlete.sportsInfo.clearanceStatus === 'cleared'
            ).length,
          }
        };

        res.json(overview);
      } catch (error: any) {
        console.error("Get dashboard overview error:", error);
        res.status(500).json({ 
          error: "Failed to get dashboard overview",
          details: error.message 
        });
      }
    }
  );

  // ==== AI HEALTH ANALYTICS ROUTES ====

  // Advanced risk scoring
  app.post("/api/athletic-trainer/ai/risk-score/:athleteId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;

        const riskAnalysis = await aiHealthAnalyticsService.calculateAdvancedRiskScore(athleteId, user);
        
        res.json({
          ...riskAnalysis,
          disclaimer: "Rule-based analytics in beta. Not a substitute for medical diagnosis. Consult medical professionals for health decisions."
        });
      } catch (error: any) {
        console.error("AI risk calculation error:", error);
        res.status(500).json({ 
          error: "Failed to calculate AI risk score",
          details: error.message 
        });
      }
    }
  );

  // Health trend analysis
  app.get("/api/athletic-trainer/ai/trends/:athleteId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const { timeframe } = req.query;
        const user = req.user!;

        const trends = await aiHealthAnalyticsService.analyzeTrends(athleteId, timeframe as string || 'monthly', user);
        
        res.json({
          ...trends,
          disclaimer: "Rule-based pattern analysis. Trends are for informational purposes only."
        });
      } catch (error: any) {
        console.error("AI trend analysis error:", error);
        res.status(500).json({ 
          error: "Failed to analyze health trends",
          details: error.message 
        });
      }
    }
  );

  // Population health metrics
  app.get("/api/athletic-trainer/ai/population/:organizationId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { organizationId } = req.params;
        const { timeframe } = req.query;
        const user = req.user!;

        const metrics = await aiHealthAnalyticsService.getPopulationHealthMetrics(organizationId, timeframe as string || 'monthly', user);
        
        res.json({
          ...metrics,
          disclaimer: "Population analytics based on rule-based algorithms. For educational and planning purposes."
        });
      } catch (error: any) {
        console.error("Population health metrics error:", error);
        res.status(500).json({ 
          error: "Failed to get population health metrics",
          details: error.message 
        });
      }
    }
  );

  // Injury risk prediction
  app.post("/api/athletic-trainer/ai/predict-injury/:athleteId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const { timeframe } = req.body;
        const user = req.user!;

        const prediction = await aiHealthAnalyticsService.predictInjuryRisk(athleteId, timeframe || 30, user);
        
        res.json({
          ...prediction,
          disclaimer: "Predictive estimates based on rule-based analysis. Not diagnostic. Use clinical judgment for all decisions."
        });
      } catch (error: any) {
        console.error("Injury prediction error:", error);
        res.status(500).json({ 
          error: "Failed to predict injury risk",
          details: error.message 
        });
      }
    }
  );

  // ==== HEALTH ALERT SYSTEM ROUTES ====

  // Get active health alerts
  app.get("/api/athletic-trainer/alerts/active/:organizationId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { organizationId } = req.params;
        const user = req.user!;

        const alerts = await healthAlertService.getActiveAlerts(organizationId, user);
        
        res.json(alerts);
      } catch (error: any) {
        console.error("Get active alerts error:", error);
        res.status(500).json({ 
          error: "Failed to get active alerts",
          details: error.message 
        });
      }
    }
  );

  // Get athlete alerts
  app.get("/api/athletic-trainer/alerts/athlete/:athleteId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const user = req.user!;

        const alerts = await healthAlertService.getAthleteAlerts(athleteId, user);
        
        res.json(alerts);
      } catch (error: any) {
        console.error("Get athlete alerts error:", error);
        res.status(500).json({ 
          error: "Failed to get athlete alerts",
          details: error.message 
        });
      }
    }
  );

  // Create health alert
  app.post("/api/athletic-trainer/alerts", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const alertData = req.body;

        const alert = await healthAlertService.createAlert(alertData, user);
        
        res.status(201).json(alert);
      } catch (error: any) {
        console.error("Create alert error:", error);
        res.status(500).json({ 
          error: "Failed to create health alert",
          details: error.message 
        });
      }
    }
  );

  // Acknowledge alert
  app.patch("/api/athletic-trainer/alerts/:alertId/acknowledge", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { alertId } = req.params;
        const { acknowledgment } = req.body;
        const user = req.user!;

        const alert = await healthAlertService.acknowledgeAlert(alertId, acknowledgment || 'Acknowledged', user);
        
        res.json(alert);
      } catch (error: any) {
        console.error("Acknowledge alert error:", error);
        res.status(500).json({ 
          error: "Failed to acknowledge alert",
          details: error.message 
        });
      }
    }
  );

  // Resolve alert
  app.patch("/api/athletic-trainer/alerts/:alertId/resolve", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { alertId } = req.params;
        const { resolution } = req.body;
        const user = req.user!;

        const alert = await healthAlertService.resolveAlert(alertId, resolution || 'Resolved', user);
        
        res.json(alert);
      } catch (error: any) {
        console.error("Resolve alert error:", error);
        res.status(500).json({ 
          error: "Failed to resolve alert",
          details: error.message 
        });
      }
    }
  );

  // ==== MEDICAL CONSULTATION AI ROUTES ====

  // Start medical consultation
  app.post("/api/athletic-trainer/consultation/start", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const user = req.user!;
        const consultationData = req.body;

        const consultation = await medicalConsultationService.startConsultation(consultationData, user);
        
        res.status(201).json({
          ...consultation,
          systemDisclaimer: "IMPORTANT: This AI consultation provides rule-based decision support only. It is not a medical diagnosis or substitute for professional medical advice. Always consult qualified healthcare providers for medical decisions."
        });
      } catch (error: any) {
        console.error("Start consultation error:", error);
        res.status(500).json({ 
          error: "Failed to start medical consultation",
          details: error.message 
        });
      }
    }
  );

  // Get consultation
  app.get("/api/athletic-trainer/consultation/:consultationId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { consultationId } = req.params;
        const user = req.user!;

        const consultation = await medicalConsultationService.getConsultation(consultationId, user);
        
        if (!consultation) {
          return res.status(404).json({ error: "Consultation not found" });
        }

        res.json(consultation);
      } catch (error: any) {
        console.error("Get consultation error:", error);
        res.status(500).json({ 
          error: "Failed to get consultation",
          details: error.message 
        });
      }
    }
  );

  // Analyze symptoms
  app.post("/api/athletic-trainer/consultation/analyze-symptoms", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { symptoms, context } = req.body;
        const user = req.user!;

        const analysis = await medicalConsultationService.analyzeSymptoms(symptoms, context, user);
        
        res.json({
          ...analysis,
          disclaimer: "Symptom analysis based on rule-based algorithms. Clinical judgment and professional evaluation are required for medical decisions."
        });
      } catch (error: any) {
        console.error("Symptom analysis error:", error);
        res.status(500).json({ 
          error: "Failed to analyze symptoms",
          details: error.message 
        });
      }
    }
  );

  // Return-to-play assessment
  app.post("/api/athletic-trainer/consultation/return-to-play/:athleteId", 
    loadUserContext,
    requireHealthDataAccess,
    async (req, res) => {
      try {
        const { athleteId } = req.params;
        const { injuryId } = req.body;
        const user = req.user!;

        const assessment = await medicalConsultationService.assessReturnToPlay(athleteId, injuryId, user);
        
        res.json({
          ...assessment,
          disclaimer: "Return-to-play guidance based on rule-based protocols. Final clearance decisions must involve qualified medical professionals."
        });
      } catch (error: any) {
        console.error("Return-to-play assessment error:", error);
        res.status(500).json({ 
          error: "Failed to assess return-to-play",
          details: error.message 
        });
      }
    }
  );

  console.log('🏥 Athletic Trainer Dashboard API routes (including AI Health endpoints) registered successfully');
}