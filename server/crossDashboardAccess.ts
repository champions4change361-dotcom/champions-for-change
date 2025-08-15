// Cross-Dashboard Access Service - Academic Achievement Portfolio System
// Enables coaches, parents, and students to access comprehensive achievement data

import { getStorage } from "./storage";
import type { User } from "@shared/schema";

export class CrossDashboardAccessService {
  constructor() {}

  // ===============================
  // COACH ACCESS TO STUDENT DASHBOARDS
  // ===============================
  
  async getCoachStudentDashboards(coachUserId: string) {
    const storage = await getStorage();
    
    // Get all teams/groups coached by this user
    const coachTeams = await storage.getAcademicTeamsByCoach?.(coachUserId) || [];
    const athleticTeams = await storage.getTeamsByCoach?.(coachUserId) || [];
    
    const studentDashboards = [];
    
    // Academic students
    for (const team of coachTeams) {
      const participants = await storage.getAcademicParticipantsByTeam?.(team.id) || [];
      for (const student of participants) {
        const dashboard = await this.buildStudentAchievementProfile(student.studentId);
        studentDashboards.push({
          ...dashboard,
          coachRelationship: 'academic_coach',
          teamName: team.teamName || `${team.competitionName} Team`,
          sport: 'academics'
        });
      }
    }
    
    // Athletic students  
    for (const team of athleticTeams) {
      const athletes = await storage.getAthletesByTeam?.(team.id) || [];
      for (const athlete of athletes) {
        const dashboard = await this.buildStudentAchievementProfile(athlete.studentId);
        studentDashboards.push({
          ...dashboard,
          coachRelationship: 'athletic_coach',
          teamName: team.teamName,
          sport: team.sport
        });
      }
    }
    
    return studentDashboards;
  }

  // ===============================
  // PARENT ACCESS TO STUDENT DASHBOARDS
  // ===============================
  
  async getParentStudentDashboards(parentUserId: string) {
    const storage = await getStorage();
    
    // Get all children linked to this parent
    const children = await storage.getStudentsByParent?.(parentUserId) || [];
    
    const childrenDashboards = [];
    
    for (const child of children) {
      const dashboard = await this.buildStudentAchievementProfile(child.studentId);
      childrenDashboards.push({
        ...dashboard,
        parentRelationship: 'guardian',
        childName: `${child.firstName} ${child.lastName}`,
        grade: child.grade,
        school: child.schoolName
      });
    }
    
    return childrenDashboards;
  }

  // ===============================
  // COMPREHENSIVE STUDENT ACHIEVEMENT PROFILE
  // ===============================
  
  async buildStudentAchievementProfile(studentId: string) {
    const storage = await getStorage();
    
    // Get academic achievements
    const academicResults = await storage.getAcademicResultsByStudent?.(studentId) || [];
    const academicParticipation = await storage.getAcademicParticipationByStudent?.(studentId) || [];
    
    // Get athletic achievements  
    const athleticResults = await storage.getAthleteResultsByStudent?.(studentId) || [];
    const athleticParticipation = await storage.getAthleteParticipationByStudent?.(studentId) || [];
    
    // Build comprehensive achievement portfolio
    const achievementProfile = {
      studentId,
      
      // ACADEMIC ACHIEVEMENTS
      academics: {
        totalCompetitions: academicParticipation.length,
        currentCompetitions: academicParticipation.filter(p => p.status === 'active'),
        achievements: academicResults.map(result => ({
          competition: result.competitionName,
          category: result.category,
          placement: result.placement,
          medal: result.medal,
          advances: result.advances,
          advancementLevel: result.advancementLevel,
          date: result.createdAt,
          type: 'academic'
        })),
        topPerformances: academicResults
          .filter(r => r.placement <= 3)
          .sort((a, b) => a.placement - b.placement)
          .slice(0, 10),
        advancementHistory: academicResults.filter(r => r.advances),
        subjects: [...new Set(academicResults.map(r => r.category))]
      },
      
      // ATHLETIC ACHIEVEMENTS
      athletics: {
        totalSports: athleticParticipation.length,
        currentSports: athleticParticipation.filter(p => p.status === 'active'),
        achievements: athleticResults.map(result => ({
          sport: result.sport,
          event: result.eventName,
          performance: result.performance,
          placement: result.placement,
          date: result.createdAt,
          type: 'athletic'
        })),
        topPerformances: athleticResults
          .filter(r => r.placement <= 3)
          .sort((a, b) => a.placement - b.placement)
          .slice(0, 10),
        sports: [...new Set(athleticResults.map(r => r.sport))]
      },
      
      // COLLEGE RECRUITMENT PROFILE
      collegeProfile: {
        gpa: null, // Would come from school system integration
        academicStrengths: this.identifyAcademicStrengths(academicResults),
        athleticProfile: this.buildAthleticProfile(athleticResults),
        leadershipRoles: this.identifyLeadershipRoles(academicParticipation, athleticParticipation),
        wellRoundedScore: this.calculateWellRoundedScore(academicResults, athleticResults),
        collegeReadinessIndicators: {
          academicDiversity: academicResults.length > 0,
          athleticParticipation: athleticResults.length > 0,
          advancementAchievements: academicResults.filter(r => r.advances).length,
          consistentPerformance: this.assessConsistency(academicResults, athleticResults),
          leadershipDemonstration: academicParticipation.some(p => p.role === 'team_captain')
        }
      },
      
      // ACHIEVEMENT TIMELINE
      timeline: [...academicResults, ...athleticResults]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20),
        
      // CURRENT ACTIVITY SUMMARY  
      currentActivity: {
        activeAcademicCompetitions: academicParticipation.filter(p => p.status === 'active').length,
        activeAthleticTeams: athleticParticipation.filter(p => p.status === 'active').length,
        upcomingEvents: [], // Would be populated from schedule data
        recentAchievements: [...academicResults, ...athleticResults]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      }
    };
    
    return achievementProfile;
  }

  // ===============================
  // COLLEGE RECRUITMENT ANALYSIS
  // ===============================
  
  private identifyAcademicStrengths(academicResults: any[]) {
    const categoryPerformance = {};
    
    academicResults.forEach(result => {
      if (!categoryPerformance[result.category]) {
        categoryPerformance[result.category] = [];
      }
      categoryPerformance[result.category].push(result.placement);
    });
    
    const strengths = [];
    for (const [category, placements] of Object.entries(categoryPerformance)) {
      const avgPlacement = (placements as number[]).reduce((sum, p) => sum + p, 0) / placements.length;
      if (avgPlacement <= 3 || (placements as number[]).some(p => p === 1)) {
        strengths.push({
          subject: category,
          averagePlacement: avgPlacement,
          totalCompetitions: placements.length,
          bestPlacement: Math.min(...(placements as number[]))
        });
      }
    }
    
    return strengths.sort((a, b) => a.averagePlacement - b.averagePlacement);
  }
  
  private buildAthleticProfile(athleticResults: any[]) {
    const sportPerformance = {};
    
    athleticResults.forEach(result => {
      if (!sportPerformance[result.sport]) {
        sportPerformance[result.sport] = {
          events: [],
          bestPerformances: []
        };
      }
      sportPerformance[result.sport].events.push(result);
      if (result.placement <= 3) {
        sportPerformance[result.sport].bestPerformances.push(result);
      }
    });
    
    return Object.entries(sportPerformance).map(([sport, data]) => ({
      sport,
      totalEvents: (data as any).events.length,
      topFinishes: (data as any).bestPerformances.length,
      bestPlacement: Math.min(...(data as any).events.map(e => e.placement))
    }));
  }
  
  private identifyLeadershipRoles(academicParticipation: any[], athleticParticipation: any[]) {
    const leadership = [];
    
    // Academic leadership
    academicParticipation.forEach(participation => {
      if (participation.role === 'team_captain' || participation.role === 'captain') {
        leadership.push({
          type: 'academic',
          role: 'Team Captain',
          activity: participation.competitionName,
          duration: 'Current' // Would calculate from dates
        });
      }
    });
    
    // Athletic leadership
    athleticParticipation.forEach(participation => {
      if (participation.role === 'captain' || participation.role === 'team_captain') {
        leadership.push({
          type: 'athletic',
          role: 'Team Captain',
          activity: participation.sport,
          duration: 'Current'
        });
      }
    });
    
    return leadership;
  }
  
  private calculateWellRoundedScore(academicResults: any[], athleticResults: any[]) {
    let score = 0;
    
    // Academic diversity (0-40 points)
    const academicCategories = new Set(academicResults.map(r => r.category));
    score += Math.min(academicCategories.size * 5, 40);
    
    // Athletic participation (0-20 points)
    const sports = new Set(athleticResults.map(r => r.sport));
    score += Math.min(sports.size * 10, 20);
    
    // Achievement excellence (0-40 points)
    const topAcademicFinishes = academicResults.filter(r => r.placement <= 3).length;
    const topAthleticFinishes = athleticResults.filter(r => r.placement <= 3).length;
    score += Math.min((topAcademicFinishes + topAthleticFinishes) * 2, 40);
    
    return Math.min(score, 100); // Cap at 100
  }
  
  private assessConsistency(academicResults: any[], athleticResults: any[]) {
    const allResults = [...academicResults, ...athleticResults];
    if (allResults.length < 3) return false;
    
    const averagePlacement = allResults.reduce((sum, r) => sum + (r.placement || 999), 0) / allResults.length;
    const topHalf = allResults.filter(r => (r.placement || 999) <= 5).length;
    
    return averagePlacement <= 8 && topHalf / allResults.length >= 0.4;
  }

  // ===============================
  // ACCESS PERMISSIONS VALIDATION
  // ===============================
  
  async validateCoachAccess(coachUserId: string, studentId: string): Promise<boolean> {
    const storage = await getStorage();
    
    // Check if coach has academic teams with this student
    const coachTeams = await storage.getAcademicTeamsByCoach?.(coachUserId) || [];
    for (const team of coachTeams) {
      const participants = await storage.getAcademicParticipantsByTeam?.(team.id) || [];
      if (participants.some(p => p.studentId === studentId)) {
        return true;
      }
    }
    
    // Check if coach has athletic teams with this student
    const athleticTeams = await storage.getTeamsByCoach?.(coachUserId) || [];
    for (const team of athleticTeams) {
      const athletes = await storage.getAthletesByTeam?.(team.id) || [];
      if (athletes.some(a => a.studentId === studentId)) {
        return true;
      }
    }
    
    return false;
  }
  
  async validateParentAccess(parentUserId: string, studentId: string): Promise<boolean> {
    const storage = await getStorage();
    
    const children = await storage.getStudentsByParent?.(parentUserId) || [];
    return children.some(child => child.studentId === studentId);
  }
}