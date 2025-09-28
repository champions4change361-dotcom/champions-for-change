import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import type { User, AcademicResult, InsertAcademicResult } from "@shared/schema";

export interface ScoringRubric {
  competitionId: string;
  criteriaName: string;
  maxPoints: number;
  evaluationMethod: 'objective' | 'subjective' | 'hybrid';
  description: string;
  weightPercentage: number;
  isActive: boolean;
}

export interface JudgeAssignment {
  judgeId: string;
  competitionId: string;
  meetId: string;
  assignmentType: 'head_judge' | 'judge' | 'grader' | 'timekeeper';
  room: string;
  timeSlot: string;
  competitionRound?: 'preliminary' | 'final';
  isConfirmed: boolean;
}

export interface ScoringSubmission {
  participantId: string;
  competitionId: string;
  meetId: string;
  judgeId: string;
  scores: Array<{
    criteriaId: string;
    points: number;
    comments?: string;
  }>;
  totalScore: number;
  rank?: number;
  placement?: number;
  performanceNotes?: string;
  submissionTime: string;
  isVerified: boolean;
}

export interface ScoringConflict {
  id: string;
  participantId: string;
  competitionId: string;
  conflictType: 'score_discrepancy' | 'judging_error' | 'eligibility_question' | 'appeal';
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface CompetitionResults {
  competitionId: string;
  meetId: string;
  individualResults: Array<{
    participantId: string;
    rank: number;
    placement: number;
    score: number;
    advances: boolean;
    advancementLevel?: string;
    medal?: 'gold' | 'silver' | 'bronze' | 'none';
  }>;
  teamResults?: Array<{
    teamId: string;
    rank: number;
    placement: number;
    totalScore: number;
    advances: boolean;
    advancementLevel?: string;
  }>;
  isFinalized: boolean;
  resultsVerified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
}

/**
 * Academic Competition Scoring Service
 * Comprehensive scoring system for UIL academic competitions
 * Handles judging workflows, scoring rubrics, and results management
 */
export class AcademicScoringService {
  private storage = getStorage();

  // Standard UIL scoring rubrics for different competition types
  private readonly SCORING_RUBRICS: Record<string, ScoringRubric[]> = {
    'written_test': [
      {
        competitionId: 'default',
        criteriaName: 'Accuracy',
        maxPoints: 100,
        evaluationMethod: 'objective',
        description: 'Correct answers based on answer key',
        weightPercentage: 100,
        isActive: true
      }
    ],
    'oral_performance': [
      {
        competitionId: 'default',
        criteriaName: 'Content & Organization',
        maxPoints: 40,
        evaluationMethod: 'subjective',
        description: 'Quality and structure of content',
        weightPercentage: 40,
        isActive: true
      },
      {
        competitionId: 'default',
        criteriaName: 'Delivery & Presentation',
        maxPoints: 30,
        evaluationMethod: 'subjective',
        description: 'Speaking clarity, pacing, and engagement',
        weightPercentage: 30,
        isActive: true
      },
      {
        competitionId: 'default',
        criteriaName: 'Interpretation & Understanding',
        maxPoints: 30,
        evaluationMethod: 'subjective',
        description: 'Depth of understanding and interpretation',
        weightPercentage: 30,
        isActive: true
      }
    ],
    'portfolio': [
      {
        competitionId: 'default',
        criteriaName: 'Technical Skill',
        maxPoints: 35,
        evaluationMethod: 'subjective',
        description: 'Technical execution and craftsmanship',
        weightPercentage: 35,
        isActive: true
      },
      {
        competitionId: 'default',
        criteriaName: 'Creativity & Innovation',
        maxPoints: 35,
        evaluationMethod: 'subjective',
        description: 'Original thinking and creative approach',
        weightPercentage: 35,
        isActive: true
      },
      {
        competitionId: 'default',
        criteriaName: 'Presentation Quality',
        maxPoints: 30,
        evaluationMethod: 'subjective',
        description: 'Overall presentation and documentation',
        weightPercentage: 30,
        isActive: true
      }
    ]
  };

  constructor() {
    console.log('🏆 Academic Scoring Service initialized');
  }

  // ===================================================================
  // SCORING RUBRIC MANAGEMENT
  // ===================================================================

  /**
   * Get scoring rubric for competition
   */
  async getScoringRubric(
    competitionId: string,
    contestFormat: string,
    user: User
  ): Promise<ScoringRubric[]> {
    try {
      // Get specific rubric for competition or use default for format
      const rubric = this.SCORING_RUBRICS[contestFormat] || this.SCORING_RUBRICS['written_test'];
      
      return rubric.map(criteria => ({
        ...criteria,
        competitionId
      }));
    } catch (error) {
      console.error('Error getting scoring rubric:', error);
      throw new Error('Failed to retrieve scoring rubric');
    }
  }

  /**
   * Create custom scoring rubric
   */
  async createCustomScoringRubric(
    competitionId: string,
    rubric: ScoringRubric[],
    user: User
  ): Promise<ScoringRubric[]> {
    try {
      // Validate rubric totals to 100%
      const totalWeight = rubric.reduce((sum, criteria) => sum + criteria.weightPercentage, 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new Error('Scoring rubric weights must total 100%');
      }

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        competitionId,
        { ip: 'system' } as any,
        `Created custom scoring rubric for competition: ${competitionId}`
      );

      return rubric;
    } catch (error) {
      console.error('Error creating custom scoring rubric:', error);
      throw new Error('Failed to create custom scoring rubric');
    }
  }

  // ===================================================================
  // JUDGE ASSIGNMENT AND MANAGEMENT
  // ===================================================================

  /**
   * Assign judges to competition
   */
  async assignJudges(
    assignments: JudgeAssignment[],
    user: User
  ): Promise<JudgeAssignment[]> {
    try {
      const storage = await this.storage;
      
      // Validate no conflicts in judge assignments
      const conflicts = await this.detectJudgeConflicts(assignments);
      if (conflicts.length > 0) {
        throw new Error(`Judge assignment conflicts: ${conflicts.join(', ')}`);
      }

      // Create official assignments in database
      const createdAssignments = [];
      for (const assignment of assignments) {
        const officialAssignment = await storage.createOfficialAssignment({
          meetId: assignment.meetId,
          officialId: assignment.judgeId,
          competitionId: assignment.competitionId,
          assignmentType: assignment.assignmentType,
          room: assignment.room,
          timeSlot: assignment.timeSlot,
          status: 'assigned'
        }, user);
        
        createdAssignments.push({
          ...assignment,
          id: officialAssignment.id,
          isConfirmed: false
        });
      }

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        assignments[0]?.meetId || 'unknown',
        { ip: 'system' } as any,
        `Assigned ${assignments.length} judges to competitions`
      );

      return createdAssignments;
    } catch (error) {
      console.error('Error assigning judges:', error);
      throw new Error('Failed to assign judges');
    }
  }

  /**
   * Detect judge conflicts
   */
  private async detectJudgeConflicts(assignments: JudgeAssignment[]): Promise<string[]> {
    const conflicts: string[] = [];
    
    for (let i = 0; i < assignments.length; i++) {
      for (let j = i + 1; j < assignments.length; j++) {
        const assign1 = assignments[i];
        const assign2 = assignments[j];
        
        if (assign1.judgeId === assign2.judgeId && assign1.timeSlot === assign2.timeSlot) {
          conflicts.push(`Judge ${assign1.judgeId} assigned to multiple competitions at ${assign1.timeSlot}`);
        }
      }
    }
    
    return conflicts;
  }

  // ===================================================================
  // SCORING SUBMISSION AND PROCESSING
  // ===================================================================

  /**
   * Submit scores for participant
   */
  async submitScores(
    scoringData: ScoringSubmission,
    user: User
  ): Promise<AcademicResult> {
    try {
      const storage = await this.storage;
      
      // Validate scoring data
      await this.validateScoringSubmission(scoringData, user);

      // Calculate final score and ranking
      const { finalScore, ranking } = await this.calculateFinalScore(scoringData, user);

      // Create academic result
      const result = await storage.createAcademicResult({
        meetId: scoringData.meetId,
        competitionId: scoringData.competitionId,
        participantId: scoringData.participantId,
        score: finalScore.toString(),
        rank: ranking,
        placement: ranking, // Will be updated after all scores are in
        performanceNotes: scoringData.performanceNotes,
        resultsVerified: false
      }, user);

      await logComplianceAction(
        user.id,
        'data_modification',
        'student_data',
        result.id,
        { ip: 'system' } as any,
        `Submitted scores for participant: ${scoringData.participantId}`
      );

      return result;
    } catch (error) {
      console.error('Error submitting scores:', error);
      throw new Error('Failed to submit scores');
    }
  }

  /**
   * Validate scoring submission
   */
  private async validateScoringSubmission(
    scoringData: ScoringSubmission,
    user: User
  ): Promise<void> {
    // Get scoring rubric for validation
    const storage = await this.storage;
    const competition = await storage.getAcademicCompetition(scoringData.competitionId, user);
    
    if (!competition) {
      throw new Error('Competition not found');
    }

    const rubric = await this.getScoringRubric(
      scoringData.competitionId,
      competition.contestFormat,
      user
    );

    // Validate all required criteria are scored
    const requiredCriteria = rubric.map(r => r.criteriaName);
    const submittedCriteria = scoringData.scores.map(s => s.criteriaId);
    
    for (const criteria of requiredCriteria) {
      if (!submittedCriteria.includes(criteria)) {
        throw new Error(`Missing score for criteria: ${criteria}`);
      }
    }

    // Validate score ranges
    for (const score of scoringData.scores) {
      const criteria = rubric.find(r => r.criteriaName === score.criteriaId);
      if (criteria && (score.points < 0 || score.points > criteria.maxPoints)) {
        throw new Error(`Invalid score for ${score.criteriaId}: ${score.points} (max: ${criteria.maxPoints})`);
      }
    }
  }

  /**
   * Calculate final score
   */
  private async calculateFinalScore(
    scoringData: ScoringSubmission,
    user: User
  ): Promise<{ finalScore: number; ranking: number }> {
    const storage = await this.storage;
    const competition = await storage.getAcademicCompetition(scoringData.competitionId, user);
    
    if (!competition) {
      throw new Error('Competition not found');
    }

    const rubric = await this.getScoringRubric(
      scoringData.competitionId,
      competition.contestFormat,
      user
    );

    // Calculate weighted score
    let finalScore = 0;
    for (const score of scoringData.scores) {
      const criteria = rubric.find(r => r.criteriaName === score.criteriaId);
      if (criteria) {
        const weightedScore = (score.points / criteria.maxPoints) * criteria.weightPercentage;
        finalScore += weightedScore;
      }
    }

    // Get current rankings for this competition
    const existingResults = await storage.getAcademicResultsByCompetition(
      scoringData.competitionId,
      user
    );

    // Calculate ranking (simple ranking for now - could be more sophisticated)
    const higherScores = existingResults.filter(r => 
      parseFloat(r.score || '0') > finalScore
    ).length;
    
    const ranking = higherScores + 1;

    return { finalScore, ranking };
  }

  // ===================================================================
  // RESULTS PROCESSING AND VERIFICATION
  // ===================================================================

  /**
   * Process competition results
   */
  async processCompetitionResults(
    competitionId: string,
    meetId: string,
    user: User
  ): Promise<CompetitionResults> {
    try {
      const storage = await this.storage;
      
      // Get all results for this competition
      const results = await storage.getAcademicResultsByCompetition(competitionId, user);
      const meetResults = results.filter(r => r.meetId === meetId);

      // Sort by score (descending) and assign placements
      const sortedResults = meetResults.sort((a, b) => 
        parseFloat(b.score || '0') - parseFloat(a.score || '0')
      );

      // Update placements in database
      const individualResults = [];
      for (let i = 0; i < sortedResults.length; i++) {
        const result = sortedResults[i];
        const placement = i + 1;
        
        // Update placement in database
        await storage.updateAcademicResult(result.id, {
          placement: placement,
          rank: placement
        }, user);

        // Determine advancement and awards
        const { advances, advancementLevel, medal } = await this.determineAdvancement(
          competitionId,
          placement,
          user
        );

        individualResults.push({
          participantId: result.participantId || '',
          rank: placement,
          placement: placement,
          score: parseFloat(result.score || '0'),
          advances,
          advancementLevel,
          medal
        });
      }

      const competitionResults: CompetitionResults = {
        competitionId,
        meetId,
        individualResults,
        isFinalized: true,
        resultsVerified: false
      };

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        competitionId,
        { ip: 'system' } as any,
        `Processed competition results for ${competitionId} - ${individualResults.length} participants`
      );

      return competitionResults;
    } catch (error) {
      console.error('Error processing competition results:', error);
      throw new Error('Failed to process competition results');
    }
  }

  /**
   * Determine advancement and awards
   */
  private async determineAdvancement(
    competitionId: string,
    placement: number,
    user: User
  ): Promise<{ advances: boolean; advancementLevel?: string; medal?: 'gold' | 'silver' | 'bronze' | 'none' }> {
    try {
      const storage = await this.storage;
      const competition = await storage.getAcademicCompetition(competitionId, user);
      
      if (!competition || !competition.hasAdvancement) {
        return { advances: false, medal: 'none' };
      }

      const advancementRules = competition.advancementRules as any;
      const individualAdvance = advancementRules?.individualAdvance || 6;

      // Determine advancement
      const advances = placement <= individualAdvance;
      const advancementLevel = advances ? 'regional' : undefined;

      // Determine medal
      let medal: 'gold' | 'silver' | 'bronze' | 'none' = 'none';
      if (placement === 1) medal = 'gold';
      else if (placement === 2) medal = 'silver';
      else if (placement === 3) medal = 'bronze';

      return { advances, advancementLevel, medal };
    } catch (error) {
      console.error('Error determining advancement:', error);
      return { advances: false, medal: 'none' };
    }
  }

  /**
   * Verify competition results
   */
  async verifyResults(
    competitionId: string,
    meetId: string,
    verifiedBy: string,
    user: User
  ): Promise<boolean> {
    try {
      const storage = await this.storage;
      
      // Get all results for this competition
      const results = await storage.getAcademicResultsByCompetition(competitionId, user);
      const meetResults = results.filter(r => r.meetId === meetId);

      // Mark all results as verified
      for (const result of meetResults) {
        await storage.verifyAcademicResult(result.id, verifiedBy, user);
      }

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        competitionId,
        { ip: 'system' } as any,
        `Verified results for competition ${competitionId} by ${verifiedBy}`
      );

      return true;
    } catch (error) {
      console.error('Error verifying results:', error);
      throw new Error('Failed to verify results');
    }
  }

  // ===================================================================
  // SCORING CONFLICTS AND APPEALS
  // ===================================================================

  /**
   * Report scoring conflict
   */
  async reportScoringConflict(
    conflictData: Omit<ScoringConflict, 'id' | 'reportedAt' | 'status'>,
    user: User
  ): Promise<ScoringConflict> {
    try {
      const conflict: ScoringConflict = {
        id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...conflictData,
        reportedAt: new Date().toISOString(),
        status: 'pending'
      };

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        conflict.id,
        { ip: 'system' } as any,
        `Reported scoring conflict: ${conflict.conflictType}`
      );

      return conflict;
    } catch (error) {
      console.error('Error reporting scoring conflict:', error);
      throw new Error('Failed to report scoring conflict');
    }
  }

  /**
   * Resolve scoring conflict
   */
  async resolveScoringConflict(
    conflictId: string,
    resolution: string,
    resolvedBy: string,
    user: User
  ): Promise<ScoringConflict> {
    try {
      // This would update the conflict in the database
      const resolvedConflict: ScoringConflict = {
        id: conflictId,
        participantId: '',
        competitionId: '',
        conflictType: 'score_discrepancy',
        description: '',
        reportedBy: '',
        reportedAt: '',
        status: 'resolved',
        resolution,
        resolvedBy,
        resolvedAt: new Date().toISOString()
      };

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        conflictId,
        { ip: 'system' } as any,
        `Resolved scoring conflict: ${conflictId}`
      );

      return resolvedConflict;
    } catch (error) {
      console.error('Error resolving scoring conflict:', error);
      throw new Error('Failed to resolve scoring conflict');
    }
  }

  // ===================================================================
  // REAL-TIME SCORING UPDATES
  // ===================================================================

  /**
   * Broadcast live scoring update
   */
  async broadcastScoringUpdate(
    competitionId: string,
    meetId: string,
    updateData: any,
    user: User
  ): Promise<void> {
    try {
      // This would integrate with WebSocket system for real-time updates
      const update = {
        type: 'scoring_update',
        competitionId,
        meetId,
        data: updateData,
        timestamp: new Date().toISOString()
      };

      // Log the update
      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        competitionId,
        { ip: 'system' } as any,
        `Broadcast scoring update for competition: ${competitionId}`
      );

      console.log('📊 Broadcasting scoring update:', update);
    } catch (error) {
      console.error('Error broadcasting scoring update:', error);
      throw new Error('Failed to broadcast scoring update');
    }
  }
}

export default AcademicScoringService;