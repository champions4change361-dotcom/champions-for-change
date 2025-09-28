import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";
import { z } from "zod";

// Health communication schemas
const sendMessageSchema = z.object({
  threadId: z.string(),
  message: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium')
});

const createHealthAlertSchema = z.object({
  playerId: z.string(),
  coachId: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  alertType: z.enum(['performance_decline', 'injury_risk', 'fatigue_pattern', 'unusual_behavior']),
  description: z.string(),
  coachMessage: z.string(), // Summary for coach (no medical details)
  recommendedActions: z.array(z.string()).optional()
});

const updatePlayerHealthStatusSchema = z.object({
  playerId: z.string(),
  healthStatus: z.enum(['cleared', 'restricted', 'pending_review']),
  coachNotificationMessage: z.string().optional(),
  lastHealthUpdate: z.string().optional()
});

export function registerHealthCommunicationRoutes(app: Express) {

  // =================================================================
  // COACH ENDPOINTS - Limited Health Information
  // =================================================================

  // Get teams for a coach
  app.get('/api/coach/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      // Get teams where user is head coach or assistant coach
      const userObj = { id: userId } as any;
      const teams = await storage.getTeamsByCoach(userId, userObj);
      
      res.json(teams);
    } catch (error) {
      console.error('Error fetching coach teams:', error);
      res.status(500).json({ error: 'Failed to fetch teams' });
    }
  });

  // Get player health status summaries (cleared/not cleared only)
  app.get('/api/coach/player-health-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      // Get all players for coach's teams with health status summaries
      const playerHealthStatus = await storage.getCoachPlayerHealthStatus(userId);
      
      res.json(playerHealthStatus);
    } catch (error) {
      console.error('Error fetching player health status:', error);
      res.status(500).json({ error: 'Failed to fetch player health status' });
    }
  });

  // Get health alerts for coach's players (coach-appropriate messages only)
  app.get('/api/coach/health-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const healthAlerts = await storage.getCoachHealthAlerts(userId);
      
      res.json(healthAlerts);
    } catch (error) {
      console.error('Error fetching health alerts:', error);
      res.status(500).json({ error: 'Failed to fetch health alerts' });
    }
  });

  // Get communications with athletic trainer
  app.get('/api/coach/trainer-communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const communications = await storage.getCoachTrainerCommunications(userId);
      
      res.json(communications);
    } catch (error) {
      console.error('Error fetching trainer communications:', error);
      res.status(500).json({ error: 'Failed to fetch communications' });
    }
  });

  // =================================================================
  // ATHLETIC TRAINER ENDPOINTS - Full Medical Access
  // =================================================================

  // Get all students under trainer's care
  app.get('/api/athletic-trainer/students', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const students = await storage.getTrainerStudents(userId);
      
      res.json(students);
    } catch (error) {
      console.error('Error fetching trainer students:', error);
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  // Get active health alerts for trainer
  app.get('/api/athletic-trainer/active-alerts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const activeAlerts = await storage.getTrainerActiveAlerts(userId);
      
      res.json(activeAlerts);
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      res.status(500).json({ error: 'Failed to fetch active alerts' });
    }
  });

  // Get pending clearances for trainer
  app.get('/api/athletic-trainer/pending-clearances', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const pendingClearances = await storage.getTrainerPendingClearances(userId);
      
      res.json(pendingClearances);
    } catch (error) {
      console.error('Error fetching pending clearances:', error);
      res.status(500).json({ error: 'Failed to fetch pending clearances' });
    }
  });

  // Get coach communications for trainer
  app.get('/api/athletic-trainer/coach-communications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const communications = await storage.getTrainerCoachCommunications(userId);
      
      res.json(communications);
    } catch (error) {
      console.error('Error fetching coach communications:', error);
      res.status(500).json({ error: 'Failed to fetch communications' });
    }
  });

  // =================================================================
  // SHARED COMMUNICATION ENDPOINTS
  // =================================================================

  // Get communication threads for user (coach or trainer)
  app.get('/api/health-communications/threads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = req.user.claims.userRole || 'fan';
      const storage = await getStorage();
      
      const threads = await storage.getHealthCommunicationThreads(userId);
      
      res.json(threads);
    } catch (error) {
      console.error('Error fetching communication threads:', error);
      res.status(500).json({ error: 'Failed to fetch threads' });
    }
  });

  // Get messages for a specific thread
  app.get('/api/health-communications/messages/:threadId', isAuthenticated, async (req: any, res) => {
    try {
      const { threadId } = req.params;
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      // Verify user has access to this thread
      const hasAccess = await storage.verifyThreadAccess(userId, threadId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const messages = await storage.getHealthCommunicationMessages(threadId);
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send a message in a thread
  app.post('/api/health-communications/send', isAuthenticated, async (req: any, res) => {
    try {
      const { threadId, message, priority } = sendMessageSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const userName = `${req.user.claims.first_name} ${req.user.claims.last_name}`;
      const userRole = req.user.claims.userRole || 'fan';
      const storage = await getStorage();
      
      // Verify user has access to this thread
      const hasAccess = await storage.verifyThreadAccess(userId, threadId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const newMessage = await storage.createHealthCommunicationMessage({
        threadId,
        senderId: userId,
        senderName: userName,
        senderRole: userRole,
        content: message,
        priority,
        timestamp: new Date().toISOString()
      });
      
      res.json(newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Create health alert (trainer only)
  app.post('/api/health-communications/create-alert', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.userRole || 'fan';
      
      // Only athletic trainers can create health alerts
      if (!['school_athletic_trainer', 'district_head_athletic_trainer'].includes(userRole)) {
        return res.status(403).json({ error: 'Only athletic trainers can create health alerts' });
      }
      
      const alertData = createHealthAlertSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const newAlert = await storage.createHealthAlert({
        ...alertData,
        athleticTrainerId: userId,
        createdAt: new Date().toISOString()
      });
      
      // Also create communication thread if it doesn't exist
      await storage.ensureHealthCommunicationThread({
        playerId: alertData.playerId,
        coachId: alertData.coachId,
        athleticTrainerId: userId
      });
      
      res.json(newAlert);
    } catch (error) {
      console.error('Error creating health alert:', error);
      res.status(500).json({ error: 'Failed to create health alert' });
    }
  });

  // Update player health status (trainer only)
  app.put('/api/health-communications/update-player-status', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.claims.userRole || 'fan';
      
      // Only athletic trainers can update player health status
      if (!['school_athletic_trainer', 'district_head_athletic_trainer'].includes(userRole)) {
        return res.status(403).json({ error: 'Only athletic trainers can update player health status' });
      }
      
      const statusData = updatePlayerHealthStatusSchema.parse(req.body);
      const userId = req.user.claims.sub;
      const storage = await getStorage();
      
      const updatedStatus = await storage.updatePlayerHealthStatus({
        ...statusData,
        updatedBy: userId,
        updatedAt: new Date().toISOString()
      });
      
      res.json(updatedStatus);
    } catch (error) {
      console.error('Error updating player health status:', error);
      res.status(500).json({ error: 'Failed to update player health status' });
    }
  });
}