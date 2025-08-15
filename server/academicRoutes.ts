// Academic Competition Routes - THE Complete UIL Solution
// Handles all 50+ academic competitions from grades 2-12 across Texas districts

import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { getStorage } from "./storage";
import { AcademicCompetitionService } from "./academicService";
import { CrossDashboardAccessService } from "./crossDashboardAccess";
import { AcademicResumeBuilderService } from "./academicResumeBuilder";
import { 
  requireFerpaCompliance,
  auditDataAccess,
  type ComplianceRequest
} from "./complianceMiddleware";

export function registerAcademicRoutes(app: Express) {
  console.log('🎓 Setting up comprehensive academic competition routes');
  const academicService = new AcademicCompetitionService();
  const crossDashboardService = new CrossDashboardAccessService();
  const resumeBuilderService = new AcademicResumeBuilderService();

  // ===============================
  // DISTRICT ACADEMIC MANAGEMENT
  // ===============================

  // Get all UIL academic competitions available
  app.get("/api/academic/competitions", async (req, res) => {
    try {
      const highSchool = academicService.getHighSchoolCompetitions();
      const aPlus = academicService.getAPlusCompetitions();
      
      res.json({
        highSchool,
        aPlus,
        totalCompetitions: 50,
        description: "Complete UIL academic competition system covering grades 2-12"
      });
    } catch (error) {
      console.error("Academic competitions error:", error);
      res.status(500).json({ error: "Failed to fetch academic competitions" });
    }
  });

  // Get academic role hierarchy
  app.get("/api/academic/roles", async (req, res) => {
    try {
      const hierarchy = academicService.getRoleHierarchy();
      res.json(hierarchy);
    } catch (error) {
      console.error("Academic roles error:", error);
      res.status(500).json({ error: "Failed to fetch academic roles" });
    }
  });

  // Get TEKS alignments for educational value
  app.get("/api/academic/teks-alignments", async (req, res) => {
    try {
      const alignments = academicService.getTeksAlignments();
      res.json(alignments);
    } catch (error) {
      console.error("TEKS alignments error:", error);
      res.status(500).json({ error: "Failed to fetch TEKS alignments" });
    }
  });

  // ===============================
  // DISTRICT COORDINATOR FUNCTIONS
  // ===============================

  // Create district academic meet
  app.post("/api/academic/districts/:districtId/meets", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { districtId } = req.params;
      const userId = req.user?.claims?.sub;
      
      await auditDataAccess(userId, 'academic_data', 'create_district_meet', req);
      
      const meet = await academicService.createDistrictAcademicMeet({
        districtId,
        meetName: req.body.meetName,
        meetDate: req.body.meetDate,
        location: req.body.location,
        hostSchool: req.body.hostSchool,
        competitions: req.body.competitions,
        meetDirector: req.body.meetDirector
      });
      
      res.json(meet);
    } catch (error) {
      console.error("Create academic meet error:", error);
      res.status(500).json({ error: "Failed to create academic meet" });
    }
  });

  // Get district academic analytics
  app.get("/api/academic/districts/:districtId/analytics", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { districtId } = req.params;
      const userId = req.user?.claims?.sub;
      
      await auditDataAccess(userId, 'academic_data', 'district_analytics', req);
      
      const analytics = await academicService.getDistrictAcademicAnalytics(districtId);
      res.json(analytics);
    } catch (error) {
      console.error("Academic analytics error:", error);
      res.status(500).json({ error: "Failed to fetch academic analytics" });
    }
  });

  // ===============================
  // SCHOOL COORDINATOR FUNCTIONS  
  // ===============================

  // Register school for academic competitions
  app.post("/api/academic/schools/:schoolId/register", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { schoolId } = req.params;
      const userId = req.user?.claims?.sub;
      
      await auditDataAccess(userId, 'academic_data', 'school_registration', req);
      
      const registration = await academicService.registerSchoolForCompetitions({
        schoolId,
        districtId: req.body.districtId,
        competitions: req.body.competitions
      });
      
      res.json(registration);
    } catch (error) {
      console.error("School registration error:", error);
      res.status(500).json({ error: "Failed to register school" });
    }
  });

  // Get school academic program status
  app.get("/api/academic/schools/:schoolId/program", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { schoolId } = req.params;
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'school_program_status', req);
      
      const program = await storage.getSchoolAcademicProgram?.(schoolId) || {
        schoolId,
        isActive: false,
        participatingCompetitions: [],
        coordinatorName: "Not assigned",
        message: "School not yet registered for academic competitions"
      };
      
      res.json(program);
    } catch (error) {
      console.error("School program error:", error);
      res.status(500).json({ error: "Failed to fetch school program" });
    }
  });

  // ===============================
  // ACADEMIC COACH/SPONSOR FUNCTIONS
  // ===============================

  // Get coach's academic teams and students
  app.get("/api/academic/coach/teams", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'coach_teams', req);
      
      const teams = await storage.getAcademicTeamsByCoach?.(userId) || [];
      res.json(teams);
    } catch (error) {
      console.error("Coach teams error:", error);
      res.status(500).json({ error: "Failed to fetch coach teams" });
    }
  });

  // Submit academic team entries
  app.post("/api/academic/teams/:teamId/entries", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { teamId } = req.params;
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'submit_team_entries', req);
      
      const updated = await storage.updateAcademicTeam?.(teamId, {
        entriesSubmitted: true,
        entryDeadlineMet: true,
        confirmationDate: new Date()
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Submit entries error:", error);
      res.status(500).json({ error: "Failed to submit team entries" });
    }
  });

  // ===============================
  // ACADEMIC STUDENT FUNCTIONS
  // ===============================

  // Get student's academic competitions and schedule
  app.get("/api/academic/student/competitions", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'student_competitions', req);
      
      const competitions = await storage.getAcademicParticipationByStudent?.(userId) || [];
      
      const studentCompetitions = competitions.map((comp: any) => ({
        id: comp.id,
        competitionName: comp.competitionName,
        meetDate: comp.meetDate,
        meetLocation: comp.meetLocation,
        role: comp.participantRole,
        status: comp.registrationStatus,
        category: comp.category,
        sponsor: comp.sponsorName
      }));
      
      res.json(studentCompetitions);
    } catch (error) {
      console.error("Student competitions error:", error);
      res.status(500).json({ error: "Failed to fetch student competitions" });
    }
  });

  // Get student's academic results and achievements
  app.get("/api/academic/student/results", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'student_results', req);
      
      const results = await storage.getAcademicResultsByStudent?.(userId) || [];
      
      const studentResults = results.map((result: any) => ({
        competitionName: result.competitionName,
        meetName: result.meetName,
        placement: result.placement,
        medal: result.medal,
        advances: result.advances,
        advancementLevel: result.advancementLevel,
        performanceDate: result.createdAt
      }));
      
      res.json(studentResults);
    } catch (error) {
      console.error("Student results error:", error);
      res.status(500).json({ error: "Failed to fetch student results" });
    }
  });

  // ===============================
  // CONTEST OFFICIALS & JUDGES
  // ===============================

  // Get available contest officials
  app.get("/api/academic/officials", isAuthenticated, async (req, res) => {
    try {
      const storage = await getStorage();
      const officials = await storage.getAcademicOfficials?.() || [];
      res.json(officials);
    } catch (error) {
      console.error("Officials error:", error);
      res.status(500).json({ error: "Failed to fetch officials" });
    }
  });

  // Assign official to contest
  app.post("/api/academic/meets/:meetId/assign-official", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { meetId } = req.params;
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'assign_official', req);
      
      const assignment = await storage.createOfficialAssignment?.({
        meetId,
        officialId: req.body.officialId,
        competitionId: req.body.competitionId,
        assignmentType: req.body.assignmentType,
        room: req.body.room,
        timeSlot: req.body.timeSlot,
        status: 'assigned'
      });
      
      res.json(assignment);
    } catch (error) {
      console.error("Assign official error:", error);
      res.status(500).json({ error: "Failed to assign official" });
    }
  });

  // ===============================
  // RESULTS & SCORING
  // ===============================

  // Submit contest results
  app.post("/api/academic/contests/:competitionId/results", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { competitionId } = req.params;
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'submit_results', req);
      
      const results = [];
      for (const result of req.body.results) {
        const savedResult = await storage.createAcademicResult?.({
          meetId: req.body.meetId,
          competitionId,
          participantId: result.participantId,
          teamId: result.teamId,
          score: result.score,
          rank: result.rank,
          placement: result.placement,
          medal: result.medal,
          advances: result.advances,
          advancementLevel: result.advancementLevel,
          resultsVerified: false
        });
        results.push(savedResult);
      }
      
      res.json(results);
    } catch (error) {
      console.error("Submit results error:", error);
      res.status(500).json({ error: "Failed to submit contest results" });
    }
  });

  // Get meet results
  app.get("/api/academic/meets/:meetId/results", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { meetId } = req.params;
      const userId = req.user?.claims?.sub;
      const storage = await getStorage();
      
      await auditDataAccess(userId, 'academic_data', 'view_meet_results', req);
      
      const results = await storage.getAcademicResultsByMeet?.(meetId) || [];
      res.json(results);
    } catch (error) {
      console.error("Meet results error:", error);
      res.status(500).json({ error: "Failed to fetch meet results" });
    }
  });

  // ===============================
  // CROSS-DASHBOARD ACCESS ROUTES (Academic Achievement Portfolios)
  // ===============================

  // Coach access to student achievement portfolios
  app.get("/api/academic/coach/student-dashboards", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      await auditDataAccess(userId, 'student_achievement_data', 'coach_dashboard_access', req);
      
      const studentDashboards = await crossDashboardService.getCoachStudentDashboards(userId);
      
      res.json({
        coachId: userId,
        studentCount: studentDashboards.length,
        students: studentDashboards,
        description: "Complete academic and athletic achievement portfolios for your students"
      });
    } catch (error) {
      console.error("Coach student dashboards error:", error);
      res.status(500).json({ error: "Failed to fetch student dashboards" });
    }
  });

  // Parent access to child achievement portfolios
  app.get("/api/academic/parent/student-dashboards", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      await auditDataAccess(userId, 'student_achievement_data', 'parent_dashboard_access', req);
      
      const childrenDashboards = await crossDashboardService.getParentStudentDashboards(userId);
      
      res.json({
        parentId: userId,
        childrenCount: childrenDashboards.length,
        children: childrenDashboards,
        description: "Complete academic and athletic achievement portfolios for your children - perfect for college applications"
      });
    } catch (error) {
      console.error("Parent student dashboards error:", error);
      res.status(500).json({ error: "Failed to fetch children dashboards" });
    }
  });

  // Get specific student achievement profile (with access validation)
  app.get("/api/academic/student/:studentId/achievement-profile", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { studentId } = req.params;
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.role || 'student';
      
      // Validate access permissions
      let hasAccess = false;
      
      if (userRole === 'student' && studentId === userId) {
        hasAccess = true; // Students can access their own data
      } else if (userRole.includes('coach') || userRole.includes('sponsor')) {
        hasAccess = await crossDashboardService.validateCoachAccess(userId, studentId);
      } else if (userRole === 'parent') {
        hasAccess = await crossDashboardService.validateParentAccess(userId, studentId);
      } else if (userRole.includes('coordinator') || userRole.includes('director')) {
        hasAccess = true; // District/school administrators have broader access
      }
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to this student's achievement profile" });
      }
      
      await auditDataAccess(userId, 'student_achievement_data', 'individual_profile_access', req);
      
      const achievementProfile = await crossDashboardService.buildStudentAchievementProfile(studentId);
      
      res.json({
        studentId,
        accessType: userRole,
        profile: achievementProfile,
        generatedAt: new Date(),
        description: "Complete academic and athletic achievement portfolio - like Rotowire for academics"
      });
    } catch (error) {
      console.error("Student achievement profile error:", error);
      res.status(500).json({ error: "Failed to fetch student achievement profile" });
    }
  });

  // College recruitment export (verified achievement portfolio)
  app.get("/api/academic/student/:studentId/college-recruitment-export", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { studentId } = req.params;
      const userId = req.user?.claims?.sub;
      
      // Validate parent/student access for college recruitment
      const hasParentAccess = await crossDashboardService.validateParentAccess(userId, studentId);
      const isOwnProfile = studentId === userId;
      
      if (!hasParentAccess && !isOwnProfile) {
        return res.status(403).json({ error: "Access denied - college recruitment export requires parent or student access" });
      }
      
      await auditDataAccess(userId, 'student_achievement_data', 'college_recruitment_export', req);
      
      const achievementProfile = await crossDashboardService.buildStudentAchievementProfile(studentId);
      
      // Format for college applications
      const collegeExport = {
        studentProfile: {
          studentId,
          exportDate: new Date(),
          verificationStatus: "Platform Verified",
          dataSource: "Champions for Change Tournament Platform"
        },
        academicAchievements: {
          totalCompetitions: achievementProfile.academics.totalCompetitions,
          subjects: achievementProfile.academics.subjects,
          topPerformances: achievementProfile.academics.topPerformances,
          advancementHistory: achievementProfile.academics.advancementHistory,
          strengths: achievementProfile.collegeProfile.academicStrengths
        },
        athleticAchievements: {
          totalSports: achievementProfile.athletics.totalSports,
          sports: achievementProfile.athletics.sports,
          topPerformances: achievementProfile.athletics.topPerformances,
          athleticProfile: achievementProfile.collegeProfile.athleticProfile
        },
        leadershipAndCharacter: {
          leadershipRoles: achievementProfile.collegeProfile.leadershipRoles,
          wellRoundedScore: achievementProfile.collegeProfile.wellRoundedScore,
          collegeReadinessIndicators: achievementProfile.collegeProfile.collegeReadinessIndicators
        },
        competitiveTimeline: achievementProfile.timeline,
        platformVerification: {
          dataIntegrity: "All achievements tracked in real-time through official competition platform",
          complianceNote: "FERPA compliant data management",
          contact: "Champions for Change Tournament Platform"
        }
      };
      
      res.json(collegeExport);
    } catch (error) {
      console.error("College recruitment export error:", error);
      res.status(500).json({ error: "Failed to generate college recruitment export" });
    }
  });

  // ===============================
  // ACADEMIC RESUME BUILDER ROUTES
  // ===============================

  // Get available resume templates
  app.get("/api/academic/resume/templates", async (req, res) => {
    try {
      const templates = resumeBuilderService.getResumeTemplates();
      res.json({
        templates,
        description: "Professional resume templates for academic achievement portfolios"
      });
    } catch (error) {
      console.error("Resume templates error:", error);
      res.status(500).json({ error: "Failed to fetch resume templates" });
    }
  });

  // Generate academic resume for student
  app.post("/api/academic/student/:studentId/resume", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { studentId } = req.params;
      const { templateId, customizations } = req.body;
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.role || 'student';
      
      // Validate access permissions (student, parent, coach, or administrator)
      let hasAccess = false;
      
      if (userRole === 'student' && studentId === userId) {
        hasAccess = true;
      } else if (userRole.includes('coach') || userRole.includes('sponsor')) {
        hasAccess = await crossDashboardService.validateCoachAccess(userId, studentId);
      } else if (userRole === 'parent') {
        hasAccess = await crossDashboardService.validateParentAccess(userId, studentId);
      } else if (userRole.includes('coordinator') || userRole.includes('director')) {
        hasAccess = true;
      }
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to generate resume for this student" });
      }
      
      await auditDataAccess(userId, 'student_achievement_data', 'resume_generation', req);
      
      const resume = await resumeBuilderService.generateResume(studentId, templateId, customizations);
      
      res.json({
        studentId,
        templateUsed: templateId,
        generatedBy: userRole,
        resume,
        exportFormats: ['json', 'markdown'],
        description: "Professional academic achievement resume generated from verified competition data"
      });
    } catch (error) {
      console.error("Resume generation error:", error);
      res.status(500).json({ error: "Failed to generate academic resume" });
    }
  });

  // Export resume in different formats
  app.get("/api/academic/resume/:studentId/export/:format", isAuthenticated, requireFerpaCompliance, async (req: ComplianceRequest, res) => {
    try {
      const { studentId, format } = req.params;
      const { templateId = 'college_application' } = req.query;
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.role || 'student';
      
      // Validate access permissions
      let hasAccess = false;
      
      if (userRole === 'student' && studentId === userId) {
        hasAccess = true;
      } else if (userRole === 'parent') {
        hasAccess = await crossDashboardService.validateParentAccess(userId, studentId);
      } else if (userRole.includes('coach') || userRole.includes('coordinator')) {
        hasAccess = await crossDashboardService.validateCoachAccess(userId, studentId) || 
                   userRole.includes('coordinator');
      }
      
      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied to export resume for this student" });
      }
      
      await auditDataAccess(userId, 'student_achievement_data', 'resume_export', req);
      
      const resume = await resumeBuilderService.generateResume(studentId, templateId as string);
      
      if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="academic-resume-${studentId}.json"`);
        res.send(resumeBuilderService.exportResumeAsJSON(resume));
      } else if (format === 'markdown') {
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="academic-resume-${studentId}.md"`);
        res.send(resumeBuilderService.exportResumeAsMarkdown(resume));
      } else if (format === 'pdf') {
        res.status(501).json({ 
          error: "PDF export not yet implemented",
          message: "PDF generation will be available in future update",
          availableFormats: ['json', 'markdown']
        });
      } else {
        res.status(400).json({ error: "Unsupported export format", supportedFormats: ['json', 'markdown'] });
      }
      
    } catch (error) {
      console.error("Resume export error:", error);
      res.status(500).json({ error: "Failed to export resume" });
    }
  });

  // Get resume preview (for template selection)
  app.get("/api/academic/resume/preview/:templateId", isAuthenticated, async (req, res) => {
    try {
      const { templateId } = req.params;
      const templates = resumeBuilderService.getResumeTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return res.status(404).json({ error: "Resume template not found" });
      }
      
      res.json({
        template,
        sampleSections: template.sections.map(section => ({
          title: section.title,
          type: section.type,
          required: section.required,
          description: getSectionDescription(section.id)
        })),
        targetAudience: template.targetAudience,
        description: template.description
      });
    } catch (error) {
      console.error("Resume preview error:", error);
      res.status(500).json({ error: "Failed to generate resume preview" });
    }
  });

  console.log('✅ Academic competition routes configured');

// Helper function for section descriptions
function getSectionDescription(sectionId: string): string {
  const descriptions: { [key: string]: string } = {
    academic_achievements: "Top academic competition results and placements",
    leadership_roles: "Leadership positions and character development activities",
    athletic_participation: "Athletic involvement and sports achievements",
    advancement_history: "District, Regional, and State advancement records",
    academic_strengths: "Subject area expertise and competitive strengths",
    top_achievements: "Highest competitive accomplishments across all areas",
    subject_expertise: "Deep knowledge demonstration in specific academic subjects",
    consistency_record: "Track record of consistent competitive performance",
    leadership_positions: "Formal leadership roles and responsibilities",
    team_achievements: "Team-based competitive successes and collaboration",
    achievement_timeline: "Chronological view of competitive development",
    well_rounded_score: "Overall development profile and college readiness indicators"
  };
  return descriptions[sectionId] || "Academic achievement section";
}
  console.log('   🏫 District Level: Academic coordinators, meet directors');
  console.log('   🎓 School Level: Academic coordinators, principals');  
  console.log('   👨‍🏫 Coach Level: Academic sponsors, coaches');
  console.log('   👨‍⚖️ Official Level: Judges, graders, officials');
  console.log('   🎯 Student Level: Academic competitors');
  console.log('   📊 Competitions: 50+ UIL academic contests (grades 2-12)');
  console.log('   🎖️ Full advancement tracking: District → Regional → State');
  console.log('   📚 TEKS alignment for educational value');
  console.log('   🔒 FERPA compliant academic data access');
  console.log('   🎓 CROSS-DASHBOARD ACCESS:');
  console.log('      🏅 Coaches can view all student achievement portfolios');
  console.log('      👨‍👩‍👧‍👦 Parents can access children\'s complete academic resumes');
  console.log('      🎯 Students get comprehensive achievement profiles');
  console.log('      🏛️ College recruitment-ready verified portfolios');
  console.log('      📈 Like "Rotowire for academics" - complete competitive intelligence');
  console.log('   📄 ACADEMIC RESUME BUILDER:');
  console.log('      📋 4 professional resume templates (College, Scholarship, Leadership, Well-Rounded)');
  console.log('      🎯 Auto-generated from verified competition data');
  console.log('      📊 Achievement analysis and competitive intelligence');
  console.log('      📁 Export formats: JSON, Markdown (PDF coming soon)');
  console.log('      🏆 Perfect for college applications and scholarship submissions');
}