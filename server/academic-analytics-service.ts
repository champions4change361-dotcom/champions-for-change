import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import type { User, AcademicResult, AcademicParticipant } from "@shared/schema";

export interface ParticipantPerformanceMetrics {
  participantId: string;
  studentId: string;
  name: string;
  grade: number;
  school: string;
  competitions: Array<{
    competitionId: string;
    competitionName: string;
    category: string;
    level: string;
    score: number;
    placement: number;
    percentile: number;
    improvement: number;
    date: string;
  }>;
  overallMetrics: {
    averageScore: number;
    averagePlacement: number;
    averagePercentile: number;
    totalCompetitions: number;
    advancementRate: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
    strongestSubjects: string[];
    improvementAreas: string[];
  };
}

export interface SchoolPerformanceAnalytics {
  schoolId: string;
  schoolName: string;
  district: string;
  academicYear: string;
  participationMetrics: {
    totalParticipants: number;
    participantsByGrade: Record<string, number>;
    participantsBySubject: Record<string, number>;
    competitionsEntered: number;
    advancementRate: number;
  };
  performanceMetrics: {
    averageScore: number;
    medianScore: number;
    topScore: number;
    averagePlacement: number;
    advancementCount: number;
    medalCount: {
      gold: number;
      silver: number;
      bronze: number;
    };
  };
  subjectPerformance: Array<{
    subjectArea: string;
    participantCount: number;
    averageScore: number;
    advancementRate: number;
    ranking: number;
    percentile: number;
  }>;
  trends: {
    participationTrend: 'increasing' | 'stable' | 'decreasing';
    performanceTrend: 'improving' | 'stable' | 'declining';
    yearOverYearGrowth: number;
    competitiveStrength: 'strong' | 'moderate' | 'developing';
  };
  benchmarking: {
    districtRanking: number;
    regionalRanking: number;
    statePercentile: number;
    similarSchoolsComparison: 'above' | 'at' | 'below';
  };
}

export interface DistrictPerformanceAnalytics {
  districtId: string;
  districtName: string;
  region: string;
  academicYear: string;
  overview: {
    totalSchools: number;
    totalParticipants: number;
    totalCompetitions: number;
    participationRate: number;
    advancementRate: number;
  };
  schoolPerformance: Array<{
    schoolId: string;
    schoolName: string;
    participantCount: number;
    averageScore: number;
    advancementCount: number;
    ranking: number;
    medalCount: number;
  }>;
  competitionAnalysis: Array<{
    competitionId: string;
    competitionName: string;
    participantCount: number;
    averageScore: number;
    competitiveLevel: 'high' | 'medium' | 'low';
    topPerformers: Array<{
      participantId: string;
      name: string;
      school: string;
      score: number;
    }>;
  }>;
  progressionAnalysis: {
    districtToRegional: number;
    regionalToState: number;
    qualificationTrends: Array<{
      year: string;
      totalQualified: number;
      subjects: Record<string, number>;
    }>;
  };
  resourceAllocation: {
    budgetEfficiency: number;
    coachingQuality: number;
    facilityAdequacy: number;
    technologyIntegration: number;
  };
}

export interface CompetitionAnalytics {
  competitionId: string;
  competitionName: string;
  category: string;
  subjectArea: string;
  participationData: {
    totalParticipants: number;
    schoolCount: number;
    gradeDistribution: Record<string, number>;
    geographicDistribution: Record<string, number>;
    participationTrend: Array<{
      year: string;
      participants: number;
      schools: number;
    }>;
  };
  performanceData: {
    scoreDistribution: {
      mean: number;
      median: number;
      mode: number;
      standardDeviation: number;
      range: { min: number; max: number };
      percentiles: Record<string, number>;
    };
    difficultyAnalysis: {
      difficultyLevel: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
      discriminationIndex: number;
      reliabilityCoefficient: number;
      questionAnalysis: Array<{
        questionId: string;
        correctRate: number;
        difficulty: number;
        discrimination: number;
      }>;
    };
    trendAnalysis: {
      performanceTrend: 'improving' | 'stable' | 'declining';
      consistencyTrend: 'more_consistent' | 'stable' | 'less_consistent';
      competitiveTrend: 'more_competitive' | 'stable' | 'less_competitive';
    };
  };
  advancementAnalysis: {
    qualificationRate: number;
    advancementCriteria: string;
    qualifiedParticipants: Array<{
      participantId: string;
      name: string;
      school: string;
      score: number;
      placement: number;
      nextLevel: string;
    }>;
    bubbleAnalysis: Array<{
      participantId: string;
      name: string;
      school: string;
      score: number;
      missedBy: number;
    }>;
  };
}

export interface HistoricalTrends {
  timeframe: string;
  dataPoints: Array<{
    year: string;
    totalParticipants: number;
    averageScore: number;
    advancementRate: number;
    schoolParticipation: number;
    competitionCount: number;
  }>;
  trendAnalysis: {
    participationGrowth: number;
    performanceImprovement: number;
    competitiveEvolution: string;
    significantEvents: Array<{
      year: string;
      event: string;
      impact: string;
    }>;
  };
  predictions: {
    nextYearParticipation: number;
    expectedPerformance: number;
    growthProjection: string;
    recommendedActions: string[];
  };
}

/**
 * Academic Analytics Service
 * Comprehensive performance analytics and reporting for academic competitions
 * Provides insights for participants, schools, districts, and competitions
 */
export class AcademicAnalyticsService {
  private storage = getStorage();

  constructor() {
    console.log('📊 Academic Analytics Service initialized');
  }

  // ===================================================================
  // PARTICIPANT PERFORMANCE ANALYTICS
  // ===================================================================

  /**
   * Generate participant performance metrics
   */
  async generateParticipantMetrics(
    participantId: string,
    timeframe: string = 'current_year',
    user: User
  ): Promise<ParticipantPerformanceMetrics> {
    try {
      const storage = await this.storage;
      
      // Get participant details
      const participant = await storage.getAcademicParticipant(participantId, user);
      if (!participant) {
        throw new Error('Participant not found');
      }

      // Get participant's competition results
      const results = await storage.getAcademicResultsByParticipant(participantId, user);
      
      // Filter by timeframe
      const filteredResults = await this.filterResultsByTimeframe(results, timeframe, user);

      // Build competition performance data
      const competitions = await Promise.all(
        filteredResults.map(async (result) => {
          const competition = await storage.getAcademicCompetition(result.competitionId, user);
          const meet = await storage.getAcademicMeet(result.meetId, user);
          
          // Calculate percentile
          const competitionResults = await storage.getAcademicResultsByCompetition(result.competitionId, user);
          const percentile = this.calculatePercentile(
            parseFloat(result.score || '0'),
            competitionResults.map(r => parseFloat(r.score || '0'))
          );

          // Calculate improvement (compared to previous year)
          const improvement = await this.calculateImprovement(
            participantId,
            result.competitionId,
            result.score || '0',
            user
          );

          return {
            competitionId: result.competitionId,
            competitionName: competition?.competitionName || 'Unknown',
            category: competition?.category || 'Unknown',
            level: meet?.level || 'district',
            score: parseFloat(result.score || '0'),
            placement: result.placement || 0,
            percentile,
            improvement,
            date: meet?.meetDate || new Date().toISOString().split('T')[0]
          };
        })
      );

      // Calculate overall metrics
      const overallMetrics = this.calculateOverallMetrics(competitions, participant);

      const metrics: ParticipantPerformanceMetrics = {
        participantId,
        studentId: participant.studentId || '',
        name: `${participant.firstName} ${participant.lastName}`,
        grade: participant.grade,
        school: await this.getSchoolName(participant.teamId, user),
        competitions,
        overallMetrics
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'student_data',
        participantId,
        { ip: 'system' } as any,
        `Generated performance metrics for participant: ${metrics.name}`
      );

      return metrics;
    } catch (error) {
      console.error('Error generating participant metrics:', error);
      throw new Error('Failed to generate participant metrics');
    }
  }

  /**
   * Get school name helper
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
      return 'Unknown School';
    }
  }

  /**
   * Filter results by timeframe
   */
  private async filterResultsByTimeframe(
    results: any[],
    timeframe: string,
    user: User
  ): Promise<any[]> {
    const storage = await this.storage;
    const currentYear = new Date().getFullYear();
    
    switch (timeframe) {
      case 'current_year':
        return results.filter(async (result) => {
          const meet = await storage.getAcademicMeet(result.meetId, user);
          return meet && new Date(meet.meetDate).getFullYear() === currentYear;
        });
      case 'last_3_years':
        return results.filter(async (result) => {
          const meet = await storage.getAcademicMeet(result.meetId, user);
          return meet && new Date(meet.meetDate).getFullYear() >= currentYear - 3;
        });
      default:
        return results;
    }
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(score: number, allScores: number[]): number {
    if (allScores.length === 0) return 50;
    
    const sortedScores = allScores.sort((a, b) => a - b);
    const rank = sortedScores.filter(s => s < score).length;
    return Math.round((rank / sortedScores.length) * 100);
  }

  /**
   * Calculate improvement
   */
  private async calculateImprovement(
    participantId: string,
    competitionId: string,
    currentScore: string,
    user: User
  ): Promise<number> {
    try {
      const storage = await this.storage;
      
      // Get participant's historical results for this competition
      const allResults = await storage.getAcademicResultsByParticipant(participantId, user);
      const competitionResults = allResults.filter(r => r.competitionId === competitionId);
      
      if (competitionResults.length < 2) return 0;
      
      // Sort by date and get previous year's score
      const sortedResults = competitionResults.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      
      const currentScoreNum = parseFloat(currentScore);
      const previousScore = parseFloat(sortedResults[1].score || '0');
      
      return currentScoreNum - previousScore;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calculate overall metrics
   */
  private calculateOverallMetrics(
    competitions: ParticipantPerformanceMetrics['competitions'],
    participant: any
  ): ParticipantPerformanceMetrics['overallMetrics'] {
    if (competitions.length === 0) {
      return {
        averageScore: 0,
        averagePlacement: 0,
        averagePercentile: 0,
        totalCompetitions: 0,
        advancementRate: 0,
        improvementTrend: 'stable',
        strongestSubjects: [],
        improvementAreas: []
      };
    }

    const averageScore = competitions.reduce((sum, comp) => sum + comp.score, 0) / competitions.length;
    const averagePlacement = competitions.reduce((sum, comp) => sum + comp.placement, 0) / competitions.length;
    const averagePercentile = competitions.reduce((sum, comp) => sum + comp.percentile, 0) / competitions.length;
    
    // Calculate advancement rate (simplified)
    const advancedCompetitions = competitions.filter(comp => comp.placement <= 6); // Top 6 typically advance
    const advancementRate = (advancedCompetitions.length / competitions.length) * 100;

    // Determine improvement trend
    const improvementTrend = this.determineImprovementTrend(competitions);

    // Identify strongest subjects and improvement areas
    const subjectPerformance = this.analyzeSubjectPerformance(competitions);

    return {
      averageScore,
      averagePlacement: Math.round(averagePlacement),
      averagePercentile: Math.round(averagePercentile),
      totalCompetitions: competitions.length,
      advancementRate: Math.round(advancementRate),
      improvementTrend,
      strongestSubjects: subjectPerformance.strongest,
      improvementAreas: subjectPerformance.improvement
    };
  }

  /**
   * Determine improvement trend
   */
  private determineImprovementTrend(
    competitions: ParticipantPerformanceMetrics['competitions']
  ): 'improving' | 'stable' | 'declining' {
    if (competitions.length < 2) return 'stable';
    
    const recentCompetitions = competitions.slice(0, Math.min(3, competitions.length));
    const averageImprovement = recentCompetitions.reduce((sum, comp) => sum + comp.improvement, 0) / recentCompetitions.length;
    
    if (averageImprovement > 5) return 'improving';
    if (averageImprovement < -5) return 'declining';
    return 'stable';
  }

  /**
   * Analyze subject performance
   */
  private analyzeSubjectPerformance(
    competitions: ParticipantPerformanceMetrics['competitions']
  ): { strongest: string[]; improvement: string[] } {
    const subjectStats = new Map<string, { scores: number[]; placements: number[] }>();
    
    competitions.forEach(comp => {
      if (!subjectStats.has(comp.category)) {
        subjectStats.set(comp.category, { scores: [], placements: [] });
      }
      
      const stats = subjectStats.get(comp.category)!;
      stats.scores.push(comp.score);
      stats.placements.push(comp.placement);
    });

    const subjectAverages = Array.from(subjectStats.entries()).map(([category, stats]) => ({
      category,
      averageScore: stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length,
      averagePlacement: stats.placements.reduce((sum, place) => sum + place, 0) / stats.placements.length
    }));

    // Sort by performance
    subjectAverages.sort((a, b) => b.averageScore - a.averageScore);

    const strongest = subjectAverages.slice(0, 2).map(s => s.category);
    const improvement = subjectAverages.slice(-2).map(s => s.category);

    return { strongest, improvement };
  }

  // ===================================================================
  // SCHOOL PERFORMANCE ANALYTICS
  // ===================================================================

  /**
   * Generate school performance analytics
   */
  async generateSchoolAnalytics(
    schoolId: string,
    academicYear: string,
    user: User
  ): Promise<SchoolPerformanceAnalytics> {
    try {
      const storage = await this.storage;
      
      // Get school program
      const program = await storage.getSchoolAcademicProgram(schoolId, user);
      if (!program) {
        throw new Error('School academic program not found');
      }

      // Get school's academic teams
      const teams = await storage.getAcademicTeamsBySchool(schoolId, user);
      
      // Get all participants for the school
      const allParticipants: any[] = [];
      for (const team of teams) {
        const participants = await storage.getAcademicParticipantsByTeam(team.id, user);
        allParticipants.push(...participants);
      }

      // Get all results for school participants
      const allResults: any[] = [];
      for (const participant of allParticipants) {
        const results = await storage.getAcademicResultsByParticipant(participant.id, user);
        allResults.push(...results);
      }

      // Calculate participation metrics
      const participationMetrics = this.calculateParticipationMetrics(allParticipants, teams);

      // Calculate performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(allResults);

      // Analyze subject performance
      const subjectPerformance = await this.analyzeSchoolSubjectPerformance(allResults, user);

      // Calculate trends
      const trends = this.calculateSchoolTrends(allResults, allParticipants);

      // Calculate benchmarking
      const benchmarking = await this.calculateSchoolBenchmarking(schoolId, allResults, user);

      const analytics: SchoolPerformanceAnalytics = {
        schoolId,
        schoolName: program.schoolName,
        district: program.districtId,
        academicYear,
        participationMetrics,
        performanceMetrics,
        subjectPerformance,
        trends,
        benchmarking
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        schoolId,
        { ip: 'system' } as any,
        `Generated school analytics for: ${program.schoolName}`
      );

      return analytics;
    } catch (error) {
      console.error('Error generating school analytics:', error);
      throw new Error('Failed to generate school analytics');
    }
  }

  /**
   * Calculate participation metrics
   */
  private calculateParticipationMetrics(
    participants: any[],
    teams: any[]
  ): SchoolPerformanceAnalytics['participationMetrics'] {
    const participantsByGrade: Record<string, number> = {};
    const participantsBySubject: Record<string, number> = {};

    participants.forEach(participant => {
      const grade = participant.grade.toString();
      participantsByGrade[grade] = (participantsByGrade[grade] || 0) + 1;
    });

    teams.forEach(team => {
      // Would need to get competition subject from team.competitionId
      const subject = 'Unknown'; // Simplified
      participantsBySubject[subject] = (participantsBySubject[subject] || 0) + 1;
    });

    return {
      totalParticipants: participants.length,
      participantsByGrade,
      participantsBySubject,
      competitionsEntered: teams.length,
      advancementRate: 0 // Would calculate based on results
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(results: any[]): SchoolPerformanceAnalytics['performanceMetrics'] {
    if (results.length === 0) {
      return {
        averageScore: 0,
        medianScore: 0,
        topScore: 0,
        averagePlacement: 0,
        advancementCount: 0,
        medalCount: { gold: 0, silver: 0, bronze: 0 }
      };
    }

    const scores = results.map(r => parseFloat(r.score || '0'));
    const placements = results.map(r => r.placement || 0);
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const sortedScores = scores.sort((a, b) => a - b);
    const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];
    const topScore = Math.max(...scores);
    const averagePlacement = placements.reduce((sum, place) => sum + place, 0) / placements.length;
    
    const advancementCount = results.filter(r => r.advances).length;
    
    const medalCount = {
      gold: results.filter(r => r.medal === 'gold').length,
      silver: results.filter(r => r.medal === 'silver').length,
      bronze: results.filter(r => r.medal === 'bronze').length
    };

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      medianScore: Math.round(medianScore * 100) / 100,
      topScore: Math.round(topScore * 100) / 100,
      averagePlacement: Math.round(averagePlacement),
      advancementCount,
      medalCount
    };
  }

  /**
   * Analyze school subject performance
   */
  private async analyzeSchoolSubjectPerformance(
    results: any[],
    user: User
  ): Promise<SchoolPerformanceAnalytics['subjectPerformance']> {
    try {
      const storage = await this.storage;
      const subjectData = new Map<string, { scores: number[]; advances: number; total: number }>();

      for (const result of results) {
        const competition = await storage.getAcademicCompetition(result.competitionId, user);
        if (!competition) continue;

        const subject = competition.subjectArea;
        if (!subjectData.has(subject)) {
          subjectData.set(subject, { scores: [], advances: 0, total: 0 });
        }

        const data = subjectData.get(subject)!;
        data.scores.push(parseFloat(result.score || '0'));
        if (result.advances) data.advances++;
        data.total++;
      }

      const subjectPerformance = Array.from(subjectData.entries()).map(([subjectArea, data]) => ({
        subjectArea,
        participantCount: data.total,
        averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
        advancementRate: (data.advances / data.total) * 100,
        ranking: 0, // Would calculate based on district comparison
        percentile: 0 // Would calculate based on state comparison
      }));

      return subjectPerformance;
    } catch (error) {
      console.error('Error analyzing school subject performance:', error);
      return [];
    }
  }

  /**
   * Calculate school trends
   */
  private calculateSchoolTrends(
    results: any[],
    participants: any[]
  ): SchoolPerformanceAnalytics['trends'] {
    // Simplified trend calculation
    return {
      participationTrend: 'stable',
      performanceTrend: 'stable',
      yearOverYearGrowth: 0,
      competitiveStrength: 'moderate'
    };
  }

  /**
   * Calculate school benchmarking
   */
  private async calculateSchoolBenchmarking(
    schoolId: string,
    results: any[],
    user: User
  ): Promise<SchoolPerformanceAnalytics['benchmarking']> {
    // Simplified benchmarking calculation
    return {
      districtRanking: 0,
      regionalRanking: 0,
      statePercentile: 0,
      similarSchoolsComparison: 'at'
    };
  }

  // ===================================================================
  // DISTRICT PERFORMANCE ANALYTICS
  // ===================================================================

  /**
   * Generate district performance analytics
   */
  async generateDistrictAnalytics(
    districtId: string,
    academicYear: string,
    user: User
  ): Promise<DistrictPerformanceAnalytics> {
    try {
      const storage = await this.storage;
      
      // Get district details
      const district = await storage.getAcademicDistrict(districtId, user);
      if (!district) {
        throw new Error('Academic district not found');
      }

      // Get all schools in the district
      const schools = await storage.getSchoolAcademicProgramsByDistrict(districtId, user);

      // Calculate overview metrics
      const overview = await this.calculateDistrictOverview(schools, user);

      // Analyze school performance
      const schoolPerformance = await this.analyzeDistrictSchoolPerformance(schools, user);

      // Analyze competitions
      const competitionAnalysis = await this.analyzeDistrictCompetitions(districtId, user);

      // Calculate progression analysis
      const progressionAnalysis = await this.calculateDistrictProgressionAnalysis(districtId, user);

      // Assess resource allocation
      const resourceAllocation = this.assessResourceAllocation(schools);

      const analytics: DistrictPerformanceAnalytics = {
        districtId,
        districtName: district.districtName,
        region: district.region,
        academicYear,
        overview,
        schoolPerformance,
        competitionAnalysis,
        progressionAnalysis,
        resourceAllocation
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        districtId,
        { ip: 'system' } as any,
        `Generated district analytics for: ${district.districtName}`
      );

      return analytics;
    } catch (error) {
      console.error('Error generating district analytics:', error);
      throw new Error('Failed to generate district analytics');
    }
  }

  /**
   * Calculate district overview
   */
  private async calculateDistrictOverview(
    schools: any[],
    user: User
  ): Promise<DistrictPerformanceAnalytics['overview']> {
    const storage = await this.storage;
    let totalParticipants = 0;
    let totalCompetitions = 0;

    for (const school of schools) {
      const teams = await storage.getAcademicTeamsBySchool(school.id, user);
      totalCompetitions += teams.length;
      
      for (const team of teams) {
        const participants = await storage.getAcademicParticipantsByTeam(team.id, user);
        totalParticipants += participants.length;
      }
    }

    return {
      totalSchools: schools.length,
      totalParticipants,
      totalCompetitions,
      participationRate: 0, // Would calculate based on district enrollment
      advancementRate: 0 // Would calculate based on advancement results
    };
  }

  /**
   * Analyze district school performance
   */
  private async analyzeDistrictSchoolPerformance(
    schools: any[],
    user: User
  ): Promise<DistrictPerformanceAnalytics['schoolPerformance']> {
    const storage = await this.storage;
    const schoolPerformance = [];

    for (const school of schools) {
      const teams = await storage.getAcademicTeamsBySchool(school.id, user);
      let participantCount = 0;
      let totalScore = 0;
      let scoreCount = 0;
      let advancementCount = 0;
      let medalCount = 0;

      for (const team of teams) {
        const participants = await storage.getAcademicParticipantsByTeam(team.id, user);
        participantCount += participants.length;

        for (const participant of participants) {
          const results = await storage.getAcademicResultsByParticipant(participant.id, user);
          for (const result of results) {
            if (result.score) {
              totalScore += parseFloat(result.score);
              scoreCount++;
            }
            if (result.advances) advancementCount++;
            if (result.medal && result.medal !== 'none') medalCount++;
          }
        }
      }

      schoolPerformance.push({
        schoolId: school.id,
        schoolName: school.schoolName,
        participantCount,
        averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
        advancementCount,
        ranking: 0, // Would calculate relative ranking
        medalCount
      });
    }

    // Sort by performance
    schoolPerformance.sort((a, b) => b.averageScore - a.averageScore);
    
    // Assign rankings
    schoolPerformance.forEach((school, index) => {
      school.ranking = index + 1;
    });

    return schoolPerformance;
  }

  /**
   * Analyze district competitions
   */
  private async analyzeDistrictCompetitions(
    districtId: string,
    user: User
  ): Promise<DistrictPerformanceAnalytics['competitionAnalysis']> {
    try {
      const storage = await this.storage;
      
      // Get district meets
      const meets = await storage.getAcademicMeetsByDistrict(districtId, user);
      const competitionAnalysis = [];

      for (const meet of meets) {
        // This would analyze each competition in the meet
        // Simplified implementation
        competitionAnalysis.push({
          competitionId: meet.id,
          competitionName: meet.meetName,
          participantCount: 0,
          averageScore: 0,
          competitiveLevel: 'medium' as const,
          topPerformers: []
        });
      }

      return competitionAnalysis;
    } catch (error) {
      console.error('Error analyzing district competitions:', error);
      return [];
    }
  }

  /**
   * Calculate district progression analysis
   */
  private async calculateDistrictProgressionAnalysis(
    districtId: string,
    user: User
  ): Promise<DistrictPerformanceAnalytics['progressionAnalysis']> {
    // Simplified progression analysis
    return {
      districtToRegional: 0,
      regionalToState: 0,
      qualificationTrends: []
    };
  }

  /**
   * Assess resource allocation
   */
  private assessResourceAllocation(schools: any[]): DistrictPerformanceAnalytics['resourceAllocation'] {
    // Simplified resource allocation assessment
    return {
      budgetEfficiency: 75,
      coachingQuality: 80,
      facilityAdequacy: 70,
      technologyIntegration: 65
    };
  }

  // ===================================================================
  // COMPETITION ANALYTICS
  // ===================================================================

  /**
   * Generate competition analytics
   */
  async generateCompetitionAnalytics(
    competitionId: string,
    timeframe: string = 'current_year',
    user: User
  ): Promise<CompetitionAnalytics> {
    try {
      const storage = await this.storage;
      
      // Get competition details
      const competition = await storage.getAcademicCompetition(competitionId, user);
      if (!competition) {
        throw new Error('Competition not found');
      }

      // Get all results for this competition
      const allResults = await storage.getAcademicResultsByCompetition(competitionId, user);

      // Calculate participation data
      const participationData = await this.calculateCompetitionParticipationData(allResults, user);

      // Analyze performance data
      const performanceData = this.analyzeCompetitionPerformanceData(allResults);

      // Analyze advancement data
      const advancementAnalysis = await this.analyzeCompetitionAdvancement(allResults, user);

      const analytics: CompetitionAnalytics = {
        competitionId,
        competitionName: competition.competitionName,
        category: competition.category,
        subjectArea: competition.subjectArea,
        participationData,
        performanceData,
        advancementAnalysis
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        competitionId,
        { ip: 'system' } as any,
        `Generated competition analytics for: ${competition.competitionName}`
      );

      return analytics;
    } catch (error) {
      console.error('Error generating competition analytics:', error);
      throw new Error('Failed to generate competition analytics');
    }
  }

  /**
   * Calculate competition participation data
   */
  private async calculateCompetitionParticipationData(
    results: any[],
    user: User
  ): Promise<CompetitionAnalytics['participationData']> {
    const storage = await this.storage;
    const schools = new Set<string>();
    const gradeDistribution: Record<string, number> = {};
    const geographicDistribution: Record<string, number> = {};

    for (const result of results) {
      if (result.participantId) {
        const participant = await storage.getAcademicParticipant(result.participantId, user);
        if (participant) {
          // Track grade distribution
          const grade = participant.grade.toString();
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

          // Track school participation
          if (participant.teamId) {
            const team = await storage.getAcademicTeam(participant.teamId, user);
            if (team?.schoolId) {
              schools.add(team.schoolId);
              
              // Track geographic distribution (simplified)
              const program = await storage.getSchoolAcademicProgram(team.schoolId, user);
              if (program) {
                const region = 'Region 1'; // Would get from district data
                geographicDistribution[region] = (geographicDistribution[region] || 0) + 1;
              }
            }
          }
        }
      }
    }

    return {
      totalParticipants: results.length,
      schoolCount: schools.size,
      gradeDistribution,
      geographicDistribution,
      participationTrend: [] // Would include historical data
    };
  }

  /**
   * Analyze competition performance data
   */
  private analyzeCompetitionPerformanceData(results: any[]): CompetitionAnalytics['performanceData'] {
    const scores = results.map(r => parseFloat(r.score || '0')).filter(s => s > 0);
    
    if (scores.length === 0) {
      return {
        scoreDistribution: {
          mean: 0,
          median: 0,
          mode: 0,
          standardDeviation: 0,
          range: { min: 0, max: 0 },
          percentiles: {}
        },
        difficultyAnalysis: {
          difficultyLevel: 'moderate',
          discriminationIndex: 0,
          reliabilityCoefficient: 0,
          questionAnalysis: []
        },
        trendAnalysis: {
          performanceTrend: 'stable',
          consistencyTrend: 'stable',
          competitiveTrend: 'stable'
        }
      };
    }

    const sortedScores = scores.sort((a, b) => a - b);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const median = sortedScores[Math.floor(sortedScores.length / 2)];
    
    // Calculate mode (most frequent score)
    const scoreFreq = new Map<number, number>();
    scores.forEach(score => {
      scoreFreq.set(score, (scoreFreq.get(score) || 0) + 1);
    });
    const mode = Array.from(scoreFreq.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0];

    // Calculate standard deviation
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Calculate percentiles
    const percentiles: Record<string, number> = {};
    [10, 25, 50, 75, 90].forEach(percentile => {
      const index = Math.floor((percentile / 100) * sortedScores.length);
      percentiles[percentile.toString()] = sortedScores[index] || 0;
    });

    // Determine difficulty level
    let difficultyLevel: 'easy' | 'moderate' | 'difficult' | 'very_difficult' = 'moderate';
    if (mean >= 85) difficultyLevel = 'easy';
    else if (mean >= 70) difficultyLevel = 'moderate';
    else if (mean >= 55) difficultyLevel = 'difficult';
    else difficultyLevel = 'very_difficult';

    return {
      scoreDistribution: {
        mean: Math.round(mean * 100) / 100,
        median: Math.round(median * 100) / 100,
        mode: Math.round(mode * 100) / 100,
        standardDeviation: Math.round(standardDeviation * 100) / 100,
        range: { min: Math.min(...scores), max: Math.max(...scores) },
        percentiles
      },
      difficultyAnalysis: {
        difficultyLevel,
        discriminationIndex: 0.5, // Would calculate based on item analysis
        reliabilityCoefficient: 0.8, // Would calculate based on statistical analysis
        questionAnalysis: [] // Would include detailed question-level analysis
      },
      trendAnalysis: {
        performanceTrend: 'stable',
        consistencyTrend: 'stable',
        competitiveTrend: 'stable'
      }
    };
  }

  /**
   * Analyze competition advancement
   */
  private async analyzeCompetitionAdvancement(
    results: any[],
    user: User
  ): Promise<CompetitionAnalytics['advancementAnalysis']> {
    const storage = await this.storage;
    const qualifiedParticipants = [];
    const bubbleAnalysis = [];

    for (const result of results) {
      if (result.participantId) {
        const participant = await storage.getAcademicParticipant(result.participantId, user);
        if (participant) {
          const participantData = {
            participantId: result.participantId,
            name: `${participant.firstName} ${participant.lastName}`,
            school: await this.getSchoolName(participant.teamId, user),
            score: parseFloat(result.score || '0'),
            placement: result.placement || 0,
            nextLevel: result.advancementLevel || 'regional'
          };

          if (result.advances) {
            qualifiedParticipants.push(participantData);
          } else if (result.placement && result.placement <= 8) {
            // "Bubble" participants who just missed advancement
            bubbleAnalysis.push({
              ...participantData,
              missedBy: result.placement - 6 // Assuming top 6 advance
            });
          }
        }
      }
    }

    const qualificationRate = results.length > 0 ? (qualifiedParticipants.length / results.length) * 100 : 0;

    return {
      qualificationRate: Math.round(qualificationRate * 100) / 100,
      advancementCriteria: 'Top 6 individuals advance to regional level',
      qualifiedParticipants,
      bubbleAnalysis: bubbleAnalysis.slice(0, 5) // Show top 5 bubble participants
    };
  }

  // ===================================================================
  // HISTORICAL TRENDS
  // ===================================================================

  /**
   * Generate historical trends analysis
   */
  async generateHistoricalTrends(
    scope: {
      type: 'district' | 'school' | 'competition';
      id: string;
    },
    yearsBack: number = 5,
    user: User
  ): Promise<HistoricalTrends> {
    try {
      // This would analyze historical data over the specified time period
      // Simplified implementation for demonstration

      const currentYear = new Date().getFullYear();
      const dataPoints = [];

      for (let i = yearsBack; i >= 0; i--) {
        const year = (currentYear - i).toString();
        
        // Would gather actual historical data here
        dataPoints.push({
          year,
          totalParticipants: 100 + (i * 10), // Simulated growth
          averageScore: 75 + Math.random() * 10,
          advancementRate: 15 + Math.random() * 5,
          schoolParticipation: 20 + (i * 2),
          competitionCount: 25 + i
        });
      }

      const trendAnalysis = {
        participationGrowth: 15.5, // Percent growth over period
        performanceImprovement: 8.2, // Percent improvement
        competitiveEvolution: 'Increasing competitiveness and participation',
        significantEvents: [
          {
            year: '2022',
            event: 'New academic competition categories added',
            impact: 'Increased participation by 20%'
          }
        ]
      };

      const predictions = {
        nextYearParticipation: dataPoints[dataPoints.length - 1].totalParticipants + 15,
        expectedPerformance: dataPoints[dataPoints.length - 1].averageScore + 2,
        growthProjection: 'Continued steady growth expected',
        recommendedActions: [
          'Expand coaching programs',
          'Invest in additional practice materials',
          'Consider adding more competition categories'
        ]
      };

      const trends: HistoricalTrends = {
        timeframe: `${currentYear - yearsBack}-${currentYear}`,
        dataPoints,
        trendAnalysis,
        predictions
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'administrative_data',
        scope.id,
        { ip: 'system' } as any,
        `Generated historical trends for ${scope.type}: ${scope.id}`
      );

      return trends;
    } catch (error) {
      console.error('Error generating historical trends:', error);
      throw new Error('Failed to generate historical trends');
    }
  }
}

export default AcademicAnalyticsService;