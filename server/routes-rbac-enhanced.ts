/**
 * ENHANCED ROUTES WITH COMPREHENSIVE RBAC IMPLEMENTATION
 * 
 * This file demonstrates how to apply the complete RBAC system to the existing routes.
 * Key enhancements:
 * 1. Role-based permission checking
 * 2. Organization data isolation 
 * 3. Health data encryption and access controls
 * 4. Comprehensive audit logging
 * 5. HIPAA/FERPA compliance
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";
import { 
  loadUserContext, 
  requirePermissions, 
  requireOrganizationAccess,
  requireHealthDataAccess,
  requireBudgetDataAccess,
  requireAcademicDataAccess,
  requireRoles,
  requireSelfOrAuthorizedAccess,
  addDataFilters,
  requireAuthentication,
  requireDistrictAdmin,
  requireSchoolAdmin,
  requireHealthAccess,
  requireBudgetAccess,
  requireAcademicAccess
} from './rbac-middleware';
import { PERMISSIONS } from './rbac-permissions';
import { HealthDataEncryption, FieldEncryption } from './data-encryption';
import { ComprehensiveAuditSystem, auditMiddleware } from './comprehensive-audit-system';
import { RBACDataFilters } from './rbac-data-filters';
import { 
  insertTeamSchema, 
  insertTeamPlayerSchema, 
  insertMedicalHistorySchema,
  type User 
} from "@shared/schema";

export async function registerRBACRoutes(app: Express): Promise<Server> {
  console.log('🔒 Initializing RBAC-protected routes...');
  
  // Setup authentication first
  await setupAuth(app);
  
  // ====================================================================
  // PUBLIC ROUTES (No authentication required)
  // ====================================================================
  
  // Health check endpoints
  app.get('/health', (req, res) => res.status(200).send('ok'));
  app.get('/healthz', (req, res) => res.status(200).send('ok'));
  app.get('/ping', (req, res) => res.status(200).send('pong'));
  
  // Public game templates (read-only)
  app.get("/api/game-templates", async (req, res) => {
    try {
      const storage = await getStorage();
      const templates = await storage.getGameTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Get game templates error:", error);
      res.status(500).json({ 
        error: "Failed to fetch game templates",
        details: error.message 
      });
    }
  });
  
  // ====================================================================
  // AUTHENTICATION & USER MANAGEMENT ROUTES
  // ====================================================================
  
  // Get current user with RBAC context
  app.get("/api/auth/user", loadUserContext, async (req, res) => {
    try {
      if (!req.rbacContext) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { user, permissions, dataScope } = req.rbacContext;
      
      // Log authentication check
      await ComprehensiveAuditSystem.logAuthEvent(
        user.id,
        'login',
        req,
        { attemptedResource: 'user_profile' }
      );
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userRole: user.userRole,
          complianceRole: user.complianceRole,
          organizationId: user.organizationId,
          organizationName: user.organizationName,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan
        },
        permissions,
        dataScope: dataScope?.organizationScope,
        canAccessHealthData: req.rbacContext.canAccessHealthData,
        canAccessBudgetData: req.rbacContext.canAccessBudgetData,
        canAccessAcademicData: req.rbacContext.canAccessAcademicData
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // ====================================================================
  // TEAM MANAGEMENT ROUTES WITH RBAC
  // ====================================================================
  
  // Get teams (filtered by user's organization scope)
  app.get('/api/teams', 
    loadUserContext,
    addDataFilters,
    auditMiddleware('administrative_data'),
    requirePermissions([PERMISSIONS.TEAM_DATA_READ]),
    async (req, res) => {
      try {
        const storage = await getStorage();
        const { user } = req.rbacContext!;
        
        // Apply organization-based filtering
        const teams = await storage.getTeamsByOrganization(user.organizationId || '');
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'read',
          'administrative_data',
          undefined,
          user.organizationId,
          req,
          { 
            dataClassification: 'internal',
            resultCount: teams.length 
          }
        );
        
        res.json(teams);
      } catch (error) {
        console.error("Get teams error:", error);
        res.status(500).json({ error: "Failed to fetch teams" });
      }
    }
  );
  
  // Create team (requires organization access and team creation permissions)
  app.post('/api/teams',
    loadUserContext,
    requirePermissions([PERMISSIONS.TEAM_DATA_WRITE]),
    requireOrganizationAccess(),
    auditMiddleware('administrative_data'),
    async (req, res) => {
      try {
        const validationResult = insertTeamSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ 
            error: 'Invalid team data', 
            details: validationResult.error.errors 
          });
        }
        
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        // Ensure team is created in user's organization
        const teamData = {
          ...validationResult.data,
          organizationId: user.organizationId,
          coachId: user.id
        };
        
        const team = await storage.createTeam(teamData);
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'write',
          'administrative_data',
          team.id,
          user.organizationId,
          req,
          { dataClassification: 'internal' }
        );
        
        res.status(201).json(team);
      } catch (error) {
        console.error("Create team error:", error);
        res.status(500).json({ error: "Failed to create team" });
      }
    }
  );
  
  // ====================================================================
  // ATHLETE/PLAYER DATA ROUTES WITH HEALTH DATA PROTECTION
  // ====================================================================
  
  // Get team players (with health data access control)
  app.get('/api/teams/:id/players',
    loadUserContext,
    requirePermissions([PERMISSIONS.ATHLETE_DATA_READ]),
    requireOrganizationAccess(),
    auditMiddleware('student_data'),
    async (req, res) => {
      try {
        const { id: teamId } = req.params;
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        // Verify user can access this team
        const team = await storage.getTeam(teamId);
        if (!team || !RBACDataFilters.canPerformAction(user, 'read', 'teams', team.organizationId)) {
          return res.status(403).json({ error: 'Access denied to team data' });
        }
        
        const players = await storage.getTeamPlayers(teamId);
        
        // Filter sensitive data based on permissions
        const filteredPlayers = players.map(player => {
          if (!req.rbacContext!.canAccessHealthData) {
            // Remove health-related fields for non-authorized users
            const { medicalHistory, emergencyContact, ...publicData } = player;
            return publicData;
          }
          return player;
        });
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'read',
          'student_data',
          teamId,
          user.organizationId,
          req,
          { 
            dataClassification: 'confidential',
            resultCount: filteredPlayers.length,
            fieldAccessed: req.rbacContext!.canAccessHealthData ? 
              ['all_player_data'] : ['public_player_data_only']
          }
        );
        
        res.json(filteredPlayers);
      } catch (error) {
        console.error("Get team players error:", error);
        res.status(500).json({ error: "Failed to fetch team players" });
      }
    }
  );
  
  // Add player to team (requires team management permissions)
  app.post('/api/teams/:id/players',
    loadUserContext,
    requirePermissions([PERMISSIONS.ATHLETE_DATA_WRITE]),
    requireOrganizationAccess(),
    auditMiddleware('student_data'),
    async (req, res) => {
      try {
        const validationResult = insertTeamPlayerSchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ 
            error: 'Invalid player data', 
            details: validationResult.error.errors 
          });
        }
        
        const { id: teamId } = req.params;
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        // Verify team access
        const team = await storage.getTeam(teamId);
        if (!team || !RBACDataFilters.canPerformAction(user, 'write', 'teams', team.organizationId)) {
          return res.status(403).json({ error: 'Access denied to team' });
        }
        
        const playerData = {
          ...validationResult.data,
          teamId,
          organizationId: team.organizationId
        };
        
        const player = await storage.createTeamPlayer(playerData);
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'write',
          'student_data',
          player.id,
          team.organizationId,
          req,
          { dataClassification: 'confidential' }
        );
        
        res.status(201).json(player);
      } catch (error) {
        console.error("Add player error:", error);
        res.status(500).json({ error: "Failed to add player" });
      }
    }
  );
  
  // ====================================================================
  // MEDICAL/HEALTH DATA ROUTES WITH PHI PROTECTION
  // ====================================================================
  
  // Get player medical history (HIPAA protected)
  app.get('/api/players/:playerId/medical-history',
    loadUserContext,
    requireHealthDataAccess,
    requireSelfOrAuthorizedAccess,
    async (req, res) => {
      try {
        const { playerId } = req.params;
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        const medicalHistory = await storage.getMedicalHistory(playerId);
        
        if (!medicalHistory) {
          return res.status(404).json({ error: 'Medical history not found' });
        }
        
        // Decrypt health data for authorized users
        const decryptedHistory = HealthDataEncryption.decryptMedicalHistory(medicalHistory);
        
        await ComprehensiveAuditSystem.logHealthDataAccess(
          user.id,
          playerId,
          'read',
          ['medical_history'],
          req
        );
        
        res.json(decryptedHistory);
      } catch (error) {
        console.error("Get medical history error:", error);
        res.status(500).json({ error: "Failed to fetch medical history" });
      }
    }
  );
  
  // Create/update medical history (HIPAA protected with encryption)
  app.post('/api/players/:playerId/medical-history',
    loadUserContext,
    requireHealthDataAccess,
    requirePermissions([PERMISSIONS.HEALTH_DATA_WRITE]),
    async (req, res) => {
      try {
        const validationResult = insertMedicalHistorySchema.safeParse(req.body);
        if (!validationResult.success) {
          return res.status(400).json({ 
            error: 'Invalid medical history data', 
            details: validationResult.error.errors 
          });
        }
        
        const { playerId } = req.params;
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        // Encrypt sensitive health data before storage
        const encryptedData = HealthDataEncryption.encryptMedicalHistory(validationResult.data);
        
        const medicalHistory = await storage.createMedicalHistory({
          ...encryptedData,
          athleteId: playerId,
          recordedBy: user.id,
          organizationId: user.organizationId
        });
        
        await ComprehensiveAuditSystem.logHealthDataAccess(
          user.id,
          playerId,
          'write',
          Object.keys(validationResult.data),
          req
        );
        
        // Return decrypted data for immediate use
        const decryptedHistory = HealthDataEncryption.decryptMedicalHistory(medicalHistory);
        res.status(201).json(decryptedHistory);
      } catch (error) {
        console.error("Create medical history error:", error);
        res.status(500).json({ error: "Failed to create medical history" });
      }
    }
  );
  
  // ====================================================================
  // ATHLETIC TRAINER DASHBOARD ROUTES
  // ====================================================================
  
  // Athletic trainer dashboard - health status overview
  app.get('/api/trainer/health-overview',
    loadUserContext,
    requireRoles(['district_athletic_trainer', 'school_athletic_trainer']),
    requireHealthDataAccess,
    auditMiddleware('health_data'),
    async (req, res) => {
      try {
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        // Get health data within trainer's scope
        const healthData = await storage.getHealthDataByOrganization(user.organizationId || '');
        
        // Apply data filtering based on role scope
        const filteredData = healthData.filter(record => 
          RBACDataFilters.canPerformAction(user, 'read', 'health', record.organizationId)
        );
        
        // Decrypt data for authorized access
        const decryptedData = filteredData.map(record => 
          HealthDataEncryption.decryptMedicalHistory(record)
        );
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'read',
          'health_data',
          undefined,
          user.organizationId,
          req,
          { 
            dataClassification: 'phi',
            resultCount: decryptedData.length,
            fieldAccessed: ['health_overview']
          }
        );
        
        res.json({
          totalAthletes: decryptedData.length,
          activeInjuries: decryptedData.filter(d => d.activeInjuries?.length > 0).length,
          upcomingAppointments: [], // Would implement appointment system
          alertsCount: decryptedData.filter(d => d.requiresAttention).length
        });
      } catch (error) {
        console.error("Trainer health overview error:", error);
        res.status(500).json({ error: "Failed to fetch health overview" });
      }
    }
  );
  
  // ====================================================================
  // BUDGET/FINANCIAL DATA ROUTES
  // ====================================================================
  
  // Get budget data (admin roles only)
  app.get('/api/budget',
    loadUserContext,
    requireBudgetAccess,
    auditMiddleware('budget_data'),
    async (req, res) => {
      try {
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        const budgetData = await storage.getBudgetByOrganization(user.organizationId || '');
        
        await ComprehensiveAuditSystem.logBudgetDataAccess(
          user.id,
          'budget_summary',
          'read',
          user.organizationId || '',
          req
        );
        
        res.json(budgetData);
      } catch (error) {
        console.error("Get budget error:", error);
        res.status(500).json({ error: "Failed to fetch budget data" });
      }
    }
  );
  
  // ====================================================================
  // TOURNAMENT MANAGEMENT ROUTES
  // ====================================================================
  
  // Get tournaments (filtered by user permissions)
  app.get('/api/tournaments',
    loadUserContext,
    addDataFilters,
    auditMiddleware('tournament_data'),
    async (req, res) => {
      try {
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        let tournaments;
        const userRole = user.userRole || user.complianceRole;
        
        if (userRole === 'fan' || userRole === 'athlete') {
          // Public tournaments only
          tournaments = await storage.getPublicTournaments();
        } else {
          // Organization-based tournaments
          tournaments = await storage.getTournamentsByOrganization(user.organizationId || '');
        }
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'read',
          'tournament_data',
          undefined,
          user.organizationId,
          req,
          { 
            dataClassification: 'internal',
            resultCount: tournaments.length 
          }
        );
        
        res.json(tournaments);
      } catch (error) {
        console.error("Get tournaments error:", error);
        res.status(500).json({ error: "Failed to fetch tournaments" });
      }
    }
  );
  
  // ====================================================================
  // ADMIN ROUTES (District/School Admin Only)
  // ====================================================================
  
  // User management (district admin only)
  app.get('/api/admin/users',
    requireDistrictAdmin,
    auditMiddleware('administrative_data'),
    async (req, res) => {
      try {
        const { user } = req.rbacContext!;
        const storage = await getStorage();
        
        const users = await storage.getUsersByOrganization(user.organizationId || '');
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'read',
          'administrative_data',
          undefined,
          user.organizationId,
          req,
          { 
            dataClassification: 'confidential',
            resultCount: users.length,
            fieldAccessed: ['user_management']
          }
        );
        
        res.json(users);
      } catch (error) {
        console.error("Get admin users error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    }
  );
  
  // ====================================================================
  // AUDIT AND COMPLIANCE ROUTES
  // ====================================================================
  
  // Get audit logs (admin access required)
  app.get('/api/audit/logs',
    loadUserContext,
    requirePermissions([PERMISSIONS.AUDIT_LOGS_VIEW]),
    async (req, res) => {
      try {
        const { user } = req.rbacContext!;
        const { startDate, endDate, resourceType } = req.query;
        
        // Generate compliance report
        const report = await ComprehensiveAuditSystem.generateComplianceReport(
          user.organizationId || '',
          startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate ? new Date(endDate as string) : new Date(),
          resourceType as 'hipaa' | 'ferpa' | 'full' || 'full'
        );
        
        await ComprehensiveAuditSystem.logDataAccess(
          user.id,
          'read',
          'administrative_data',
          undefined,
          user.organizationId,
          req,
          { 
            dataClassification: 'confidential',
            fieldAccessed: ['audit_logs']
          }
        );
        
        res.json(report);
      } catch (error) {
        console.error("Get audit logs error:", error);
        res.status(500).json({ error: "Failed to fetch audit logs" });
      }
    }
  );
  
  console.log('✅ RBAC-protected routes registered successfully');
  
  // Create server
  const server = createServer(app);
  return server;
}

// Export for integration with existing system
export { registerRBACRoutes as registerRoutes };