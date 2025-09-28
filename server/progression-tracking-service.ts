import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import type { User, AcademicResult, AcademicParticipant } from "@shared/schema";

export interface AdvancementCriteria {
  competitionId: string;
  level: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
  individualAdvance: number;
  teamAdvance: number;
  wildcardRules: {
    enabled: boolean;
    count?: number;
    criteria?: string;
  };
  qualificationThreshold?: number;
  tiebreakingRules: string[];
}

export interface ParticipantProgression {
  participantId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: number;
  school: string;
  competitionHistory: Array<{
    year: string;
    competition: string;
    level: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
    placement: number;
    score: number;
    advances: boolean;
    medal?: 'gold' | 'silver' | 'bronze';
    meetDate: string;
  }>;
  currentLevel: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
  advancementStatus: 'qualified' | 'not_qualified' | 'pending' | 'wildcard';
  nextLevel?: 'regional' | 'state' | 'area' | 'bi_district';
  qualificationDate?: string;
  advancementNotified: boolean;
}

export interface TeamProgression {
  teamId: string;
  schoolId: string;
  schoolName: string;
  competitionId: string;
  currentLevel: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
  teamMembers: Array<{
    participantId: string;
    name: string;
    role: 'primary' | 'alternate' | 'team_member' | 'captain';
  }>;
  advancementStatus: 'qualified' | 'not_qualified' | 'pending' | 'wildcard';
  teamScore?: number;
  teamPlacement?: number;
  nextLevel?: 'regional' | 'state' | 'area' | 'bi_district';
  qualificationDate?: string;
}

export interface AdvancementNotification {
  id: string;
  recipientType: 'participant' | 'school' | 'coach' | 'parent';
  recipientId: string;
  competitionId: string;
  currentLevel: string;
  nextLevel: string;
  advancementType: 'qualified' | 'wildcard' | 'team_advance';
  notificationMethod: 'email' | 'sms' | 'push' | 'portal';
  message: string;
  sentAt?: string;
  deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
}

export interface ProgressionAnalytics {
  competitionId: string;
  level: string;
  totalParticipants: number;
  qualifiedCount: number;
  wildcardCount: number;
  advancementRate: number;
  schoolParticipation: Array<{
    schoolId: string;
    schoolName: string;
    participantCount: number;
    qualifiedCount: number;
    qualificationRate: number;
  }>;
  performanceTrends: Array<{
    year: string;
    averageScore: number;
    medianScore: number;
    topScore: number;
    participantCount: number;
  }>;
}

/**
 * Progression Tracking Service
 * Comprehensive tracking for district → regional → state advancement
 * Manages qualification criteria, advancement notifications, and analytics
 */
export class ProgressionTrackingService {
  private storage = getStorage();

  // UIL Academic Competition Advancement Rules
  private readonly ADVANCEMENT_CRITERIA: Record<string, AdvancementCriteria> = {
    'district_to_regional': {
      competitionId: 'default',
      level: 'district',
      individualAdvance: 6,
      teamAdvance: 3,
      wildcardRules: {
        enabled: true,
        count: 2,
        criteria: 'highest_non_qualifying_scores'
      },
      tiebreakingRules: [
        'highest_score',
        'fewest_incorrect_answers',
        'earliest_submission_time'
      ]
    },
    'regional_to_state': {
      competitionId: 'default',
      level: 'regional',
      individualAdvance: 3,
      teamAdvance: 2,
      wildcardRules: {
        enabled: false
      },
      tiebreakingRules: [
        'highest_score',
        'regional_placement',
        'district_performance'
      ]
    },
    'area_to_state': {
      competitionId: 'default', 
      level: 'area',
      individualAdvance: 2,
      teamAdvance: 1,
      wildcardRules: {
        enabled: false
      },
      tiebreakingRules: [
        'highest_score',
        'area_placement'
      ]
    }
  };

  constructor() {
    console.log('📊 Progression Tracking Service initialized');
  }

  // ===================================================================
  // ADVANCEMENT CRITERIA MANAGEMENT
  // ===================================================================

  /**
   * Get advancement criteria for competition and level
   */
  async getAdvancementCriteria(
    competitionId: string,
    fromLevel: 'district' | 'regional' | 'area',
    user: User
  ): Promise<AdvancementCriteria> {
    try {
      const criteriaKey = `${fromLevel}_to_${this.getNextLevel(fromLevel)}`;
      const baseCriteria = this.ADVANCEMENT_CRITERIA[criteriaKey];
      
      if (!baseCriteria) {
        throw new Error(`No advancement criteria found for ${fromLevel} level`);
      }

      // Get competition-specific criteria if available
      const storage = await this.storage;
      const competition = await storage.getAcademicCompetition(competitionId, user);
      
      if (competition?.advancementRules) {
        const customRules = competition.advancementRules as any;
        return {
          ...baseCriteria,
          competitionId,
          individualAdvance: customRules.individualAdvance || baseCriteria.individualAdvance,
          teamAdvance: customRules.teamAdvance || baseCriteria.teamAdvance,
          wildcardRules: {
            ...baseCriteria.wildcardRules,
            enabled: customRules.wildcardRules || baseCriteria.wildcardRules.enabled
          }
        };
      }

      return {
        ...baseCriteria,
        competitionId
      };
    } catch (error) {
      console.error('Error getting advancement criteria:', error);
      throw new Error('Failed to retrieve advancement criteria');
    }
  }

  /**
   * Get next competition level
   */
  private getNextLevel(currentLevel: string): string {
    const levelProgression = {
      'district': 'regional',
      'regional': 'state',
      'area': 'state',
      'bi_district': 'area'
    };
    return levelProgression[currentLevel as keyof typeof levelProgression] || 'state';
  }

  // ===================================================================
  // PARTICIPANT PROGRESSION TRACKING
  // ===================================================================

  /**
   * Track individual participant progression
   */
  async trackParticipantProgression(
    participantId: string,
    user: User
  ): Promise<ParticipantProgression> {
    try {
      const storage = await this.storage;
      
      // Get participant details
      const participant = await storage.getAcademicParticipant(participantId, user);
      if (!participant) {
        throw new Error('Participant not found');
      }

      // Get participant's competition history
      const results = await storage.getAcademicResultsByParticipant(participantId, user);
      
      // Build competition history
      const competitionHistory = await Promise.all(
        results.map(async (result) => {
          const competition = await storage.getAcademicCompetition(result.competitionId, user);
          const meet = await storage.getAcademicMeet(result.meetId, user);
          
          return {
            year: new Date(meet?.meetDate || Date.now()).getFullYear().toString(),
            competition: competition?.competitionName || 'Unknown',
            level: meet?.level || 'district' as const,
            placement: result.placement || 0,
            score: parseFloat(result.score || '0'),
            advances: result.advances || false,
            medal: result.medal || undefined,
            meetDate: meet?.meetDate || ''
          };
        })
      );

      // Sort by date (most recent first)
      competitionHistory.sort((a, b) => new Date(b.meetDate).getTime() - new Date(a.meetDate).getTime());

      // Determine current level and advancement status
      const { currentLevel, advancementStatus, nextLevel } = await this.determineAdvancementStatus(
        participantId,
        competitionHistory,
        user
      );

      const progression: ParticipantProgression = {
        participantId,
        studentId: participant.studentId || '',
        firstName: participant.firstName,
        lastName: participant.lastName,
        grade: participant.grade,
        school: await this.getSchoolName(participant.teamId, user),
        competitionHistory,
        currentLevel,
        advancementStatus,
        nextLevel,
        qualificationDate: this.getQualificationDate(competitionHistory),
        advancementNotified: false
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'student_data',
        participantId,
        { ip: 'system' } as any,
        `Tracked progression for participant: ${participant.firstName} ${participant.lastName}`
      );

      return progression;
    } catch (error) {
      console.error('Error tracking participant progression:', error);
      throw new Error('Failed to track participant progression');
    }
  }

  /**
   * Get school name from team ID
   */
  private async getSchoolName(teamId: string, user: User): Promise<string> {
    try {
      const storage = await this.storage;
      const team = await storage.getAcademicTeam(teamId, user);
      
      if (team?.schoolId) {
        const program = await storage.getSchoolAcademicProgram(team.schoolId, user);
        return program?.schoolName || 'Unknown School';
      }
      
      return 'Unknown School';
    } catch (error) {
      console.error('Error getting school name:', error);
      return 'Unknown School';
    }
  }

  /**
   * Determine advancement status
   */
  private async determineAdvancementStatus(
    participantId: string,
    competitionHistory: ParticipantProgression['competitionHistory'],
    user: User
  ): Promise<{
    currentLevel: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
    advancementStatus: 'qualified' | 'not_qualified' | 'pending' | 'wildcard';
    nextLevel?: 'regional' | 'state' | 'area' | 'bi_district';
  }> {
    // Get most recent competition
    const recentCompetition = competitionHistory[0];
    
    if (!recentCompetition) {
      return {
        currentLevel: 'district',
        advancementStatus: 'pending'
      };
    }

    // Check if participant advanced from most recent competition
    if (recentCompetition.advances) {
      const nextLevel = this.getNextLevel(recentCompetition.level) as any;
      return {
        currentLevel: recentCompetition.level,
        advancementStatus: 'qualified',
        nextLevel
      };
    }

    return {
      currentLevel: recentCompetition.level,
      advancementStatus: 'not_qualified'
    };
  }

  /**
   * Get qualification date
   */
  private getQualificationDate(competitionHistory: ParticipantProgression['competitionHistory']): string | undefined {
    const qualifyingCompetition = competitionHistory.find(comp => comp.advances);
    return qualifyingCompetition?.meetDate;
  }

  // ===================================================================
  // TEAM PROGRESSION TRACKING
  // ===================================================================

  /**
   * Track team progression
   */
  async trackTeamProgression(
    teamId: string,
    user: User
  ): Promise<TeamProgression> {
    try {
      const storage = await this.storage;
      
      // Get team details
      const team = await storage.getAcademicTeam(teamId, user);
      if (!team) {
        throw new Error('Team not found');
      }

      // Get team members
      const participants = await storage.getAcademicParticipantsByTeam(teamId, user);
      const teamMembers = participants.map(p => ({
        participantId: p.id,
        name: `${p.firstName} ${p.lastName}`,
        role: p.participantRole || 'team_member' as const
      }));

      // Get team results
      const teamResults = await storage.getAcademicResultsByTeam(teamId, user);
      const latestResult = teamResults[0]; // Assuming sorted by date

      // Get school information
      const program = team.schoolId ? 
        await storage.getSchoolAcademicProgram(team.schoolId, user) : null;

      // Determine advancement status
      const advancementStatus = latestResult?.advances ? 'qualified' : 'not_qualified';
      const nextLevel = latestResult?.advancementLevel as any;

      const teamProgression: TeamProgression = {
        teamId,
        schoolId: team.schoolId || '',
        schoolName: program?.schoolName || 'Unknown School',
        competitionId: team.competitionId,
        currentLevel: 'district', // Would be determined from meet level
        teamMembers,
        advancementStatus,
        teamScore: latestResult ? parseFloat(latestResult.score || '0') : undefined,
        teamPlacement: latestResult?.placement || undefined,
        nextLevel,
        qualificationDate: latestResult?.createdAt ? 
          new Date(latestResult.createdAt).toISOString().split('T')[0] : undefined
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'student_data',
        teamId,
        { ip: 'system' } as any,
        `Tracked team progression: ${program?.schoolName}`
      );

      return teamProgression;
    } catch (error) {
      console.error('Error tracking team progression:', error);
      throw new Error('Failed to track team progression');
    }
  }

  // ===================================================================
  // ADVANCEMENT NOTIFICATIONS
  // ===================================================================

  /**
   * Send advancement notifications
   */
  async sendAdvancementNotifications(
    competitionId: string,
    meetId: string,
    user: User
  ): Promise<AdvancementNotification[]> {
    try {
      const storage = await this.storage;
      
      // Get all results for the competition
      const results = await storage.getAcademicResultsByMeet(meetId, user);
      const advancingResults = results.filter(r => r.advances);

      const notifications: AdvancementNotification[] = [];

      for (const result of advancingResults) {
        if (!result.participantId) continue;
        
        // Get participant details for notification
        const participant = await storage.getAcademicParticipant(result.participantId, user);
        if (!participant) continue;

        // Create participant notification
        const participantNotification: AdvancementNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          recipientType: 'participant',
          recipientId: result.participantId,
          competitionId,
          currentLevel: 'district', // Would be determined from meet
          nextLevel: result.advancementLevel || 'regional',
          advancementType: 'qualified',
          notificationMethod: 'email',
          message: this.generateAdvancementMessage(participant, result),
          deliveryStatus: 'pending'
        };

        notifications.push(participantNotification);

        // Create parent notification if contact info available
        if (participant.parentEmail) {
          const parentNotification: AdvancementNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            recipientType: 'parent',
            recipientId: participant.id,
            competitionId,
            currentLevel: 'district',
            nextLevel: result.advancementLevel || 'regional',
            advancementType: 'qualified',
            notificationMethod: 'email',
            message: this.generateParentAdvancementMessage(participant, result),
            deliveryStatus: 'pending'
          };

          notifications.push(parentNotification);
        }
      }

      // Log notification creation
      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        competitionId,
        { ip: 'system' } as any,
        `Created ${notifications.length} advancement notifications`
      );

      return notifications;
    } catch (error) {
      console.error('Error sending advancement notifications:', error);
      throw new Error('Failed to send advancement notifications');
    }
  }

  /**
   * Generate advancement message
   */
  private generateAdvancementMessage(participant: any, result: any): string {
    return `
      Congratulations ${participant.firstName} ${participant.lastName}!
      
      You have qualified to advance to the ${result.advancementLevel || 'regional'} level 
      in your academic competition.
      
      Placement: ${result.placement}
      Score: ${result.score}
      Medal: ${result.medal || 'Participation'}
      
      Please watch for additional information about the next level competition.
      
      Great job representing your school!
    `.trim();
  }

  /**
   * Generate parent advancement message
   */
  private generateParentAdvancementMessage(participant: any, result: any): string {
    return `
      Dear Parent/Guardian,
      
      We are pleased to inform you that ${participant.firstName} ${participant.lastName} 
      has qualified to advance to the ${result.advancementLevel || 'regional'} level 
      academic competition.
      
      Competition Details:
      - Placement: ${result.placement}
      - Score: ${result.score}
      - Award: ${result.medal || 'Participation'}
      
      You will receive additional information about the next competition including 
      dates, location, and any required forms or permissions.
      
      Congratulations to ${participant.firstName} on this achievement!
    `.trim();
  }

  // ===================================================================
  // PROGRESSION ANALYTICS
  // ===================================================================

  /**
   * Generate progression analytics
   */
  async generateProgressionAnalytics(
    competitionId: string,
    level: string,
    user: User
  ): Promise<ProgressionAnalytics> {
    try {
      const storage = await this.storage;
      
      // Get all results for this competition and level
      const results = await storage.getAcademicResultsByCompetition(competitionId, user);
      
      // Filter by level (would need meet-level filtering in real implementation)
      const levelResults = results; // Simplified for demo
      
      const totalParticipants = levelResults.length;
      const qualifiedCount = levelResults.filter(r => r.advances).length;
      const wildcardCount = 0; // Would calculate based on wildcard rules
      const advancementRate = totalParticipants > 0 ? (qualifiedCount / totalParticipants) * 100 : 0;

      // Get school participation data
      const schoolParticipation = await this.getSchoolParticipationData(levelResults, user);

      // Get performance trends (simplified - would use historical data)
      const performanceTrends = [{
        year: new Date().getFullYear().toString(),
        averageScore: this.calculateAverageScore(levelResults),
        medianScore: this.calculateMedianScore(levelResults),
        topScore: this.calculateTopScore(levelResults),
        participantCount: totalParticipants
      }];

      const analytics: ProgressionAnalytics = {
        competitionId,
        level,
        totalParticipants,
        qualifiedCount,
        wildcardCount,
        advancementRate,
        schoolParticipation,
        performanceTrends
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        competitionId,
        { ip: 'system' } as any,
        `Generated progression analytics for ${competitionId}`
      );

      return analytics;
    } catch (error) {
      console.error('Error generating progression analytics:', error);
      throw new Error('Failed to generate progression analytics');
    }
  }

  /**
   * Get school participation data
   */
  private async getSchoolParticipationData(
    results: any[],
    user: User
  ): Promise<ProgressionAnalytics['schoolParticipation']> {
    const storage = await this.storage;
    const schoolData = new Map<string, { name: string; total: number; qualified: number }>();

    for (const result of results) {
      if (!result.participantId) continue;
      
      try {
        const participant = await storage.getAcademicParticipant(result.participantId, user);
        if (!participant?.teamId) continue;

        const team = await storage.getAcademicTeam(participant.teamId, user);
        if (!team?.schoolId) continue;

        const program = await storage.getSchoolAcademicProgram(team.schoolId, user);
        const schoolName = program?.schoolName || 'Unknown School';

        if (!schoolData.has(team.schoolId)) {
          schoolData.set(team.schoolId, { name: schoolName, total: 0, qualified: 0 });
        }

        const data = schoolData.get(team.schoolId)!;
        data.total++;
        if (result.advances) data.qualified++;
      } catch (error) {
        console.error('Error processing school data for result:', result.id);
      }
    }

    return Array.from(schoolData.entries()).map(([schoolId, data]) => ({
      schoolId,
      schoolName: data.name,
      participantCount: data.total,
      qualifiedCount: data.qualified,
      qualificationRate: data.total > 0 ? (data.qualified / data.total) * 100 : 0
    }));
  }

  /**
   * Calculate average score
   */
  private calculateAverageScore(results: any[]): number {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, r) => sum + parseFloat(r.score || '0'), 0);
    return total / results.length;
  }

  /**
   * Calculate median score
   */
  private calculateMedianScore(results: any[]): number {
    if (results.length === 0) return 0;
    const scores = results.map(r => parseFloat(r.score || '0')).sort((a, b) => a - b);
    const mid = Math.floor(scores.length / 2);
    return scores.length % 2 === 0 ? (scores[mid - 1] + scores[mid]) / 2 : scores[mid];
  }

  /**
   * Calculate top score
   */
  private calculateTopScore(results: any[]): number {
    if (results.length === 0) return 0;
    return Math.max(...results.map(r => parseFloat(r.score || '0')));
  }
}

export default ProgressionTrackingService;