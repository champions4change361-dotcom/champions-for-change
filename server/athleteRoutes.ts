// Athletic Student/Player Dashboard Routes
// Provides appropriate access for individual athletes while maintaining HIPAA/FERPA compliance

import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";
import { 
  requireFerpaCompliance,
  auditDataAccess,
  logComplianceAction,
  type ComplianceRequest
} from "./complianceMiddleware";

export function registerAthleteRoutes(app: Express) {
  console.log('🏃‍♂️ Setting up athlete dashboard routes');
  
  // Athlete's personal schedule (games, practices, tournaments)
  app.get("/api/athlete/schedule", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      // Audit data access
      await auditDataAccess(userId, 'student_data', 'athlete_schedule', req);
      
      // Get athlete's schedule from multiple sources
      const [teamRegistrations, tournaments, scheduledEvents] = await Promise.all([
        storage.getTeamRegistrationsByAthlete?.(userId) || [],
        storage.getTournamentsByAthlete?.(userId) || [],
        storage.getScheduledEventsByAthlete?.(userId) || []
      ]);
      
      // Combine and format schedule data
      const schedule = [
        // Team practices and games
        ...scheduledEvents.map((event: any) => ({
          id: event.id,
          title: event.eventTitle,
          type: event.eventType, // 'practice', 'game', 'scrimmage'
          date: event.eventDate,
          time: event.eventTime,
          location: event.location,
          team: event.teamName,
          sport: event.sport,
          opponent: event.opponent || null
        })),
        
        // Tournament events
        ...tournaments.map((tournament: any) => ({
          id: `tournament-${tournament.id}`,
          title: tournament.name,
          type: 'tournament',
          date: tournament.tournamentDate,
          time: tournament.checkinTime || '8:00 AM',
          location: tournament.location,
          team: tournament.teamName,
          sport: tournament.sport
        }))
      ]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter(event => new Date(event.date) >= new Date()); // Only future events
      
      res.json(schedule);
    } catch (error) {
      console.error("Athlete schedule error:", error);
      res.status(500).json({ error: "Failed to fetch schedule" });
    }
  });

  // Athlete's teams and sports participation
  app.get("/api/athlete/teams", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'student_data', 'athlete_teams', req);
      
      // Get teams this athlete is registered for
      const teamRegistrations = await storage.getTeamRegistrationsByAthlete?.(userId) || [];
      const teamPlayers = await storage.getTeamPlayersByAthlete?.(userId) || [];
      
      const teams = teamPlayers.map((player: any) => ({
        id: player.teamId,
        teamName: player.teamName,
        sport: player.sport,
        division: player.division || player.ageGroup,
        coachName: player.coachName,
        position: player.position,
        jerseyNumber: player.jerseyNumber,
        status: player.status
      }));
      
      res.json(teams);
    } catch (error) {
      console.error("Athlete teams error:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // Athlete's tournament participation
  app.get("/api/athlete/tournaments", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'tournament_data', 'athlete_tournaments', req);
      
      // Get tournaments this athlete is participating in
      const tournaments = await storage.getTournamentsByAthlete?.(userId) || [];
      
      const formattedTournaments = tournaments.map((tournament: any) => ({
        id: tournament.id,
        name: tournament.name,
        sport: tournament.sport,
        date: tournament.tournamentDate,
        location: tournament.location,
        checkinTime: tournament.checkinTime || '8:00 AM',
        status: tournament.registrationStatus || 'pending',
        teamName: tournament.teamName,
        division: tournament.division || tournament.ageGroup
      }));
      
      res.json(formattedTournaments);
    } catch (error) {
      console.error("Athlete tournaments error:", error);
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  // Athlete's health clearance status (non-detailed, HIPAA compliant)
  app.get("/api/athlete/health-status", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'health_data', 'athlete_clearance_status', req);
      
      // Get non-detailed health clearance info only
      const healthStatus = await storage.getAthleteHealthClearance?.(userId) || {};
      
      // Return only clearance status, not medical details
      const clearanceInfo = {
        clearanceStatus: healthStatus.clearanceStatus || 'pending', // 'cleared', 'pending', 'restricted'
        physicalExpired: healthStatus.physicalExpired || false,
        physicalExpiryDate: healthStatus.physicalExpiryDate || null,
        lastUpdated: healthStatus.lastUpdated || null,
        // Do NOT include: medical conditions, medications, allergies, injury details
      };
      
      res.json(clearanceInfo);
    } catch (error) {
      console.error("Athlete health status error:", error);
      res.status(500).json({ error: "Failed to fetch health status" });
    }
  });

  // Athlete's transportation and logistics information
  app.get("/api/athlete/logistics", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'student_data', 'athlete_logistics', req);
      
      // Get transportation info for upcoming events
      const logistics = await storage.getAthleteLogistics?.(userId) || {};
      
      const logisticsInfo = {
        transportation: logistics.nextEventTransportation ? {
          eventName: logistics.nextEventTransportation.eventName,
          departureTime: logistics.nextEventTransportation.departureTime,
          pickupLocation: logistics.nextEventTransportation.pickupLocation,
          returnTime: logistics.nextEventTransportation.returnTime,
          parentPickupRequired: logistics.nextEventTransportation.parentPickupRequired || false
        } : null,
        
        parentNotifications: logistics.recentNotifications ? 
          logistics.recentNotifications.slice(0, 3).map((notification: any) => ({
            message: notification.message,
            sentAt: notification.sentAt,
            type: notification.type
          })) : []
      };
      
      res.json(logisticsInfo);
    } catch (error) {
      console.error("Athlete logistics error:", error);
      res.status(500).json({ error: "Failed to fetch logistics" });
    }
  });

  // Athlete's consent forms and document status
  app.get("/api/athlete/documents", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'student_data', 'athlete_documents', req);
      
      const documents = await storage.getAthleteDocuments?.(userId) || [];
      
      const documentStatus = documents.map((doc: any) => ({
        id: doc.id,
        type: doc.documentType,
        name: doc.documentName,
        status: doc.status, // 'complete', 'pending', 'expired'
        expiryDate: doc.expiryDate,
        required: doc.required,
        description: doc.description
      }));
      
      res.json(documentStatus);
    } catch (error) {
      console.error("Athlete documents error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Update athlete emergency contact (student/parent can update)
  app.patch("/api/athlete/emergency-contact", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { emergencyContactName, emergencyContactPhone, parentGuardianPhone } = req.body;
      const storage = await getStorage();
      
      await logComplianceAction(
        userId, 
        'data_modification', 
        'student_data', 
        userId, 
        req,
        'Student updated emergency contact information'
      );
      
      // Update emergency contact info in student data
      const updated = await storage.updateAthleteEmergencyContact?.(userId, {
        emergencyContactName,
        emergencyContactPhone,
        parentGuardianPhone
      });
      
      if (!updated) {
        return res.status(404).json({ error: "Student record not found" });
      }
      
      res.json({ 
        success: true, 
        message: "Emergency contact updated successfully",
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Update emergency contact error:", error);
      res.status(500).json({ error: "Failed to update emergency contact" });
    }
  });

  // Get athlete's academic eligibility status (if applicable)
  app.get("/api/athlete/eligibility", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'student_data', 'athlete_eligibility', req);
      
      const eligibility = await storage.getAthleteEligibility?.(userId) || {};
      
      // Return only eligibility status, not grades or detailed academic info
      const eligibilityInfo = {
        isEligible: eligibility.isEligible || false,
        nextEligibilityCheck: eligibility.nextCheckDate || null,
        lastUpdated: eligibility.lastUpdated || null,
        // Do NOT include: specific grades, GPA, course details
      };
      
      res.json(eligibilityInfo);
    } catch (error) {
      console.error("Athlete eligibility error:", error);
      res.status(500).json({ error: "Failed to fetch eligibility status" });
    }
  });

  console.log('✅ Athlete dashboard routes configured');
  console.log('   - Personal schedule access');
  console.log('   - Team participation info');
  console.log('   - Tournament schedules');
  console.log('   - Health clearance status (non-detailed)');
  console.log('   - Transportation logistics');
  console.log('   - Document compliance status');
  console.log('   - HIPAA/FERPA compliant data access');
}