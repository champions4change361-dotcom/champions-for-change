// Subdomain-Specific Tournament Routes
// Separates tournament functionality by subdomain to solve connection and role issues

import type { Express } from "express";
import { createSubdomainTournamentService, getTournamentServiceFromRequest } from "./subdomainTournamentService";
import { isAuthenticated } from "./replitAuth";
import { insertTournamentSchema } from "@shared/schema";
import { z } from "zod";

export function registerSubdomainTournamentRoutes(app: Express) {
  console.log('🏆 Setting up subdomain-separated tournament routes');
  
  // ENTERPRISE SUBDOMAIN ROUTES (trantortournaments.org)
  // Full tournament management for casual organizers and businesses
  
  app.get("/api/enterprise/tournaments", async (req, res) => {
    try {
      const tournamentService = createSubdomainTournamentService('trantortournaments.org');
      const userRole = req.user?.claims?.sub ? 'tournament_organizer' : undefined;
      
      const tournaments = await tournamentService.getTournaments(userRole);
      res.json(tournaments);
    } catch (error) {
      console.error("Enterprise tournaments error:", error);
      res.status(500).json({ error: "Failed to fetch enterprise tournaments" });
    }
  });

  app.post("/api/enterprise/tournaments", async (req, res) => {
    try {
      const tournamentService = createSubdomainTournamentService('trantortournaments.org');
      const userId = req.user?.claims?.sub;
      const userRole = 'tournament_organizer';
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await tournamentService.createTournament(validatedData, userId, userRole);
      
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid tournament data", details: error.errors });
      }
      console.error("Enterprise tournament creation error:", error);
      res.status(500).json({ error: "Failed to create enterprise tournament" });
    }
  });

  // DISTRICT SUBDOMAIN ROUTES
  // Athletic administration for district athletic directors and trainers
  
  app.get("/api/district/tournaments", isAuthenticated, async (req, res) => {
    try {
      const tournamentService = createSubdomainTournamentService('district');
      const userRole = req.user?.claims?.complianceRole;
      
      // Only district-level roles can access
      const allowedRoles = ['district_athletic_director', 'district_head_athletic_trainer'];
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "District-level access required" });
      }
      
      const tournaments = await tournamentService.getTournaments(userRole);
      res.json(tournaments);
    } catch (error) {
      console.error("District tournaments error:", error);
      res.status(500).json({ error: "Failed to fetch district tournaments" });
    }
  });

  app.post("/api/district/tournaments", isAuthenticated, async (req, res) => {
    try {
      const tournamentService = createSubdomainTournamentService('district');
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.claims?.complianceRole;
      
      // Only district athletic directors can create tournaments
      if (userRole !== 'district_athletic_director') {
        return res.status(403).json({ error: "District Athletic Director access required" });
      }

      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await tournamentService.createTournament(validatedData, userId, userRole);
      
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid tournament data", details: error.errors });
      }
      console.error("District tournament creation error:", error);
      res.status(500).json({ error: "Failed to create district tournament" });
    }
  });

  // SCHOOL SUBDOMAIN ROUTES
  // School-level athletics for coaches and school athletic staff
  
  app.get("/api/school/tournaments", isAuthenticated, async (req, res) => {
    try {
      const tournamentService = createSubdomainTournamentService('school');
      const userRole = req.user?.claims?.complianceRole;
      
      // School-level roles can access (including coaches for viewing)
      const allowedRoles = [
        'school_athletic_director', 'school_athletic_trainer', 'school_principal', 
        'head_coach', 'assistant_coach'
      ];
      if (!userRole || !allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: "School-level access required" });
      }
      
      const tournaments = await tournamentService.getTournaments(userRole);
      res.json(tournaments);
    } catch (error) {
      console.error("School tournaments error:", error);
      res.status(500).json({ error: "Failed to fetch school tournaments" });
    }
  });

  app.post("/api/school/tournaments", isAuthenticated, async (req, res) => {
    try {
      const tournamentService = createSubdomainTournamentService('school');
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.claims?.complianceRole;
      
      // Only school athletic directors can create tournaments
      if (userRole !== 'school_athletic_director') {
        return res.status(403).json({ error: "School Athletic Director access required" });
      }

      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await tournamentService.createTournament(validatedData, userId, userRole);
      
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid tournament data", details: error.errors });
      }
      console.error("School tournament creation error:", error);
      res.status(500).json({ error: "Failed to create school tournament" });
    }
  });

  // CROSS-SUBDOMAIN SHARED DATA ROUTES
  // For coaches and athletic trainers who need to see tournament schedules
  
  app.get("/api/shared/tournament-schedule/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user?.claims?.complianceRole;
      
      // Allow coaches and trainers to view tournament schedules for planning
      const sharedAccessRoles = [
        'school_athletic_trainer', 'head_coach', 'assistant_coach', 
        'district_head_athletic_trainer', 'school_athletic_director'
      ];
      
      if (!userRole || !sharedAccessRoles.includes(userRole)) {
        return res.status(403).json({ error: "Insufficient access for tournament schedules" });
      }

      // Try all subdomain services to find the tournament
      const services = [
        createSubdomainTournamentService('enterprise'),
        createSubdomainTournamentService('district'),
        createSubdomainTournamentService('school')
      ];

      let sharedInfo = null;
      for (const service of services) {
        sharedInfo = await service.getSharedTournamentInfo(id, userRole);
        if (sharedInfo) break;
      }

      if (!sharedInfo) {
        return res.status(404).json({ error: "Tournament not found or not accessible" });
      }

      res.json(sharedInfo);
    } catch (error) {
      console.error("Shared tournament schedule error:", error);
      res.status(500).json({ error: "Failed to fetch tournament schedule" });
    }
  });

  // AVAILABLE SPORTS BY SUBDOMAIN
  // Each subdomain gets appropriate sports options
  
  app.get("/api/:subdomain/sports", async (req, res) => {
    try {
      const { subdomain } = req.params;
      const validSubdomains = ['enterprise', 'district', 'school'];
      
      if (!validSubdomains.includes(subdomain)) {
        return res.status(400).json({ error: "Invalid subdomain" });
      }

      const tournamentService = createSubdomainTournamentService(subdomain);
      const userRole = req.user?.claims?.complianceRole || 'guest';
      
      const sports = await tournamentService.getAvailableSports(userRole);
      res.json(sports);
    } catch (error) {
      console.error("Sports fetch error:", error);
      res.status(500).json({ error: "Failed to fetch available sports" });
    }
  });

  // DYNAMIC ROUTING BASED ON REQUEST DOMAIN
  // Automatically routes to appropriate subdomain based on request
  
  app.get("/api/tournaments", async (req, res) => {
    try {
      const tournamentService = getTournamentServiceFromRequest(req);
      const userRole = req.user?.claims?.complianceRole || req.user?.claims?.sub ? 'tournament_organizer' : undefined;
      
      const tournaments = await tournamentService.getTournaments(userRole);
      res.json(tournaments);
    } catch (error) {
      console.error("Dynamic tournaments error:", error);
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  app.post("/api/tournaments", async (req, res) => {
    try {
      const tournamentService = getTournamentServiceFromRequest(req);
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.claims?.complianceRole || 'tournament_organizer';
      
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const validatedData = insertTournamentSchema.parse(req.body);
      const tournament = await tournamentService.createTournament(validatedData, userId, userRole);
      
      res.status(201).json(tournament);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid tournament data", details: error.errors });
      }
      console.error("Dynamic tournament creation error:", error);
      res.status(500).json({ error: "Failed to create tournament" });
    }
  });

  console.log('✅ Subdomain tournament routes configured');
  console.log('   - Enterprise: Full tournament management');
  console.log('   - District: Athletic administration');
  console.log('   - School: School-level athletics');
  console.log('   - Shared: Cross-role schedule access');
}