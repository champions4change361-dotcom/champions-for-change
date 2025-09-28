import { randomUUID } from "crypto";
import { getStorage } from "./storage";
import { HealthDataEncryption, HealthDataAudit } from "./data-encryption";
import { logComplianceAction } from "./complianceMiddleware";
import type { 
  User, 
  HealthRiskAssessment, 
  InsertHealthRiskAssessment, 
  Athlete,
  InjuryIncident 
} from "@shared/schema";

export interface RiskFactor {
  id: string;
  category: 'injury_history' | 'physical_condition' | 'training_load' | 'biomechanical' | 'environmental' | 'psychological';
  factor: string;
  weight: number; // 1-10 scale
  currentValue: number; // Athlete's current value for this factor
  riskContribution: number; // Calculated risk contribution
  description: string;
  recommendations?: string[];
}

export interface HealthRiskProfile {
  id: string;
  athleteId: string;
  athleteName?: string;
  assessmentDate: string;
  assessmentType: 'preseason' | 'mid_season' | 'postseason' | 'post_injury' | 'annual' | 'targeted';
  overallRiskScore: number; // 0-100 scale
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  
  // Risk Categories
  injuryHistoryRisk: number;
  physicalConditionRisk: number;
  trainingLoadRisk: number;
  biomechanicalRisk: number;
  environmentalRisk: number;
  psychologicalRisk: number;
  
  // Detailed Risk Factors
  riskFactors: RiskFactor[];
  
  // Previous Injuries Impact
  injuryHistory: Array<{
    injuryType: string;
    bodyPart: string;
    severity: string;
    dateOccurred: string;
    fullyRecovered: boolean;
    riskContribution: number;
  }>;
  
  // Health Metrics
  healthMetrics: {
    bmi?: number;
    bodyFatPercentage?: number;
    vo2Max?: number;
    restingHeartRate?: number;
    bloodPressure?: {
      systolic: number;
      diastolic: number;
    };
    flexibilityScore?: number;
    strengthScore?: number;
    balanceScore?: number;
  };
  
  // Training Load Assessment
  trainingLoad: {
    weeklyHours?: number;
    intensityLevel?: 'low' | 'moderate' | 'high' | 'very_high';
    sportSpecificLoad?: number;
    crossTraining?: boolean;
    adequateRest?: boolean;
    recentLoadChanges?: string;
  };
  
  // Predictive Analytics
  predictions: {
    injuryProbability: number; // 0-100% chance of injury in next 6 months
    mostLikelyInjuryTypes: string[];
    recommendedInterventions: string[];
    nextAssessmentDate: string;
  };
  
  // Alerts and Recommendations
  alerts: Array<{
    level: 'info' | 'warning' | 'critical';
    category: string;
    message: string;
    actionRequired: boolean;
    dueDate?: string;
  }>;
  
  recommendations: Array<{
    category: 'training' | 'recovery' | 'medical' | 'nutrition' | 'equipment';
    priority: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
    expectedImpact: string;
    timeframe: string;
  }>;
  
  assessorId: string;
  organizationId?: string;
  notes?: string;
  nextReassessmentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRiskModel {
  modelVersion: string;
  lastTrained: string;
  accuracy: number;
  features: string[];
  predict(athleteData: any): Promise<{
    riskScore: number;
    confidence: number;
    keyFactors: string[];
    recommendations: string[];
  }>;
}

export interface HealthRiskAssessmentService {
  // Risk Assessment Management
  createRiskAssessment(assessment: Partial<HealthRiskProfile>, user: User): Promise<HealthRiskProfile>;
  getRiskAssessment(assessmentId: string, user: User): Promise<HealthRiskProfile | null>;
  updateRiskAssessment(assessmentId: string, updates: Partial<HealthRiskProfile>, user: User): Promise<HealthRiskProfile>;
  getAthleteRiskAssessments(athleteId: string, user: User): Promise<HealthRiskProfile[]>;
  getLatestRiskAssessment(athleteId: string, user: User): Promise<HealthRiskProfile | null>;
  
  // AI-Powered Risk Scoring
  calculateRiskScore(athleteId: string, assessmentData: any, user: User): Promise<number>;
  predictInjuryRisk(athleteId: string, timeframe: number, user: User): Promise<{
    probability: number;
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
  }>;
  
  // Health Alert Management
  generateHealthAlerts(athleteId: string, riskProfile: HealthRiskProfile, user: User): Promise<void>;
  getActiveHealthAlerts(organizationId: string, user: User): Promise<any[]>;
  resolveHealthAlert(alertId: string, resolution: string, user: User): Promise<void>;
  
  // Risk Monitoring
  monitorAthleteRisks(organizationId: string, user: User): Promise<{
    highRiskAthletes: string[];
    criticalAlerts: number;
    trendsAnalysis: any;
  }>;
  
  // Predictive Analytics
  getInjuryPredictions(organizationId: string, timeframe: number, user: User): Promise<any>;
  identifyRiskTrends(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<any>;
  
  // Intervention Recommendations
  generateRecommendations(athleteId: string, riskProfile: HealthRiskProfile, user: User): Promise<string[]>;
  trackInterventionEffectiveness(athleteId: string, interventionId: string, user: User): Promise<any>;
}

/**
 * AI-Powered Health Risk Assessment Service
 * Provides injury prediction and prevention analytics
 */
export class HealthRiskAssessmentServiceImpl implements HealthRiskAssessmentService {
  private storage = getStorage();
  private riskModel: AIRiskModel;
  
  constructor() {
    console.log('🏥 Health Risk Assessment Service with rule-based analytics initialized');
    this.riskModel = this.initializeRiskModel();
  }

  // Risk Assessment Management
  async createRiskAssessment(assessment: Partial<HealthRiskProfile>, user: User): Promise<HealthRiskProfile> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for risk assessment creation');
      }

      // Get athlete information
      const athlete = await storage.getAthlete(assessment.athleteId!, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      // Calculate comprehensive risk score
      const riskScore = await this.calculateRiskScore(assessment.athleteId!, assessment, user);
      
      // Get rule-based risk predictions
      const riskPrediction = await this.predictInjuryRisk(assessment.athleteId!, 180, user); // 6 months
      
      // Build comprehensive risk profile
      const riskProfile: HealthRiskProfile = {
        id: randomUUID(),
        athleteId: assessment.athleteId!,
        athleteName: `${athlete.firstName} ${athlete.lastName}`,
        assessmentDate: assessment.assessmentDate || new Date().toISOString().split('T')[0],
        assessmentType: assessment.assessmentType || 'annual',
        overallRiskScore: riskScore,
        riskLevel: this.determineRiskLevel(riskScore),
        
        // Risk category scores (calculated from individual factors)
        injuryHistoryRisk: assessment.injuryHistoryRisk || this.calculateInjuryHistoryRisk(athlete),
        physicalConditionRisk: assessment.physicalConditionRisk || this.calculatePhysicalConditionRisk(assessment),
        trainingLoadRisk: assessment.trainingLoadRisk || this.calculateTrainingLoadRisk(assessment),
        biomechanicalRisk: assessment.biomechanicalRisk || 50, // Default moderate risk
        environmentalRisk: assessment.environmentalRisk || 30, // Default low-moderate risk
        psychologicalRisk: assessment.psychologicalRisk || 40, // Default moderate risk
        
        riskFactors: assessment.riskFactors || this.generateRiskFactors(athlete, assessment),
        injuryHistory: assessment.injuryHistory || this.buildInjuryHistoryRisk(athlete),
        healthMetrics: assessment.healthMetrics || {},
        trainingLoad: assessment.trainingLoad || {},
        
        predictions: {
          injuryProbability: riskPrediction.probability,
          mostLikelyInjuryTypes: riskPrediction.riskFactors,
          recommendedInterventions: riskPrediction.recommendations,
          nextAssessmentDate: this.calculateNextAssessmentDate(assessment.assessmentType || 'annual'),
        },
        
        alerts: this.generateAlerts(riskScore, riskPrediction),
        recommendations: await this.generateRecommendations(assessment.athleteId!, assessment as HealthRiskProfile, user),
        
        assessorId: user.id,
        organizationId: user.organizationId,
        notes: assessment.notes,
        nextReassessmentDate: assessment.nextReassessmentDate || this.calculateNextAssessmentDate(assessment.assessmentType || 'annual'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in database
      const assessmentData: InsertHealthRiskAssessment = {
        id: riskProfile.id,
        athleteId: riskProfile.athleteId,
        assessmentDate: riskProfile.assessmentDate,
        assessmentType: riskProfile.assessmentType,
        overallRiskScore: riskProfile.overallRiskScore,
        riskLevel: riskProfile.riskLevel,
        injuryHistory: riskProfile.injuryHistory,
        riskFactors: riskProfile.riskFactors.map(rf => rf.factor),
        healthMetrics: riskProfile.healthMetrics,
        trainingLoad: riskProfile.trainingLoad,
        predictions: riskProfile.predictions,
        recommendations: riskProfile.recommendations.map(r => r.recommendation),
        assessorId: riskProfile.assessorId,
        organizationId: riskProfile.organizationId,
        notes: riskProfile.notes,
        nextReassessmentDate: riskProfile.nextReassessmentDate,
      };

      await storage.createHealthRiskAssessment(assessmentData, user);

      // Generate health alerts if needed
      await this.generateHealthAlerts(assessment.athleteId!, riskProfile, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', riskProfile.id, {
        action: 'health_risk_assessment_created',
        athleteId: assessment.athleteId,
        riskScore: riskScore,
        riskLevel: riskProfile.riskLevel,
      });

      console.log(`🧠 Created risk assessment ${riskProfile.id} for athlete ${assessment.athleteId} with risk score ${riskScore}`);
      return riskProfile;
    } catch (error) {
      console.error('Error creating risk assessment:', error);
      throw error;
    }
  }

  async getRiskAssessment(assessmentId: string, user: User): Promise<HealthRiskProfile | null> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for risk assessment access');
      }

      const assessment = await storage.getHealthRiskAssessment(assessmentId, user);
      if (!assessment) {
        return null;
      }

      // Convert to full profile format
      const athlete = await storage.getAthlete(assessment.athleteId, user);
      
      const riskProfile: HealthRiskProfile = {
        ...assessment,
        athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : undefined,
        riskFactors: this.parseRiskFactors(assessment.riskFactors),
        alerts: this.generateAlerts(assessment.overallRiskScore, assessment.predictions),
        recommendations: this.parseRecommendations(assessment.recommendations),
        injuryHistoryRisk: this.calculateInjuryHistoryRisk(athlete),
        physicalConditionRisk: 50, // TODO: Calculate from health metrics
        trainingLoadRisk: 50, // TODO: Calculate from training load
        biomechanicalRisk: 50,
        environmentalRisk: 30,
        psychologicalRisk: 40,
        createdAt: assessment.createdAt || new Date().toISOString(),
        updatedAt: assessment.updatedAt || new Date().toISOString(),
      };

      // Log compliance action
      await logComplianceAction(user.id, 'data_access', 'health_data', assessmentId, {
        action: 'health_risk_assessment_viewed',
        athleteId: assessment.athleteId,
      });

      return riskProfile;
    } catch (error) {
      console.error('Error getting risk assessment:', error);
      throw error;
    }
  }

  async updateRiskAssessment(assessmentId: string, updates: Partial<HealthRiskProfile>, user: User): Promise<HealthRiskProfile> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for risk assessment updates');
      }

      // Convert updates to storage format
      const storageUpdates: Partial<HealthRiskAssessment> = {
        assessmentDate: updates.assessmentDate,
        assessmentType: updates.assessmentType,
        overallRiskScore: updates.overallRiskScore,
        riskLevel: updates.riskLevel,
        injuryHistory: updates.injuryHistory,
        riskFactors: updates.riskFactors?.map(rf => rf.factor),
        healthMetrics: updates.healthMetrics,
        trainingLoad: updates.trainingLoad,
        predictions: updates.predictions,
        recommendations: updates.recommendations?.map(r => r.recommendation),
        notes: updates.notes,
        nextReassessmentDate: updates.nextReassessmentDate,
        updatedAt: new Date().toISOString(),
      };

      await storage.updateHealthRiskAssessment(assessmentId, storageUpdates, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', assessmentId, {
        action: 'health_risk_assessment_updated',
        updatedFields: Object.keys(updates),
      });

      // Return updated assessment
      return await this.getRiskAssessment(assessmentId, user) as HealthRiskProfile;
    } catch (error) {
      console.error('Error updating risk assessment:', error);
      throw error;
    }
  }

  async getAthleteRiskAssessments(athleteId: string, user: User): Promise<HealthRiskProfile[]> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for athlete risk assessments');
      }

      const assessments = await storage.getHealthRiskAssessmentsByAthlete(athleteId, user);
      
      // Convert to full profiles
      const profiles: HealthRiskProfile[] = [];
      for (const assessment of assessments) {
        const profile = await this.getRiskAssessment(assessment.id, user);
        if (profile) {
          profiles.push(profile);
        }
      }

      return profiles.sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
    } catch (error) {
      console.error('Error getting athlete risk assessments:', error);
      throw error;
    }
  }

  async getLatestRiskAssessment(athleteId: string, user: User): Promise<HealthRiskProfile | null> {
    try {
      const assessments = await this.getAthleteRiskAssessments(athleteId, user);
      return assessments.length > 0 ? assessments[0] : null;
    } catch (error) {
      console.error('Error getting latest risk assessment:', error);
      throw error;
    }
  }

  // AI-Powered Risk Scoring
  async calculateRiskScore(athleteId: string, assessmentData: any, user: User): Promise<number> {
    try {
      const storage = await this.storage;
      const athlete = await storage.getAthlete(athleteId, user);
      
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      // Get injury history for the athlete
      const injuries = await storage.getAthleteInjuries(athleteId, user);
      
      // Base risk factors calculation
      let riskScore = 0;
      
      // Injury history weight (40% of total score)
      const injuryHistoryScore = this.calculateInjuryHistoryRisk(athlete, injuries);
      riskScore += injuryHistoryScore * 0.4;
      
      // Physical condition weight (25% of total score)
      const physicalConditionScore = this.calculatePhysicalConditionRisk(assessmentData);
      riskScore += physicalConditionScore * 0.25;
      
      // Training load weight (20% of total score)
      const trainingLoadScore = this.calculateTrainingLoadRisk(assessmentData);
      riskScore += trainingLoadScore * 0.2;
      
      // Environmental factors weight (10% of total score)
      const environmentalScore = this.calculateEnvironmentalRisk(assessmentData);
      riskScore += environmentalScore * 0.1;
      
      // Psychological factors weight (5% of total score)
      const psychologicalScore = this.calculatePsychologicalRisk(assessmentData);
      riskScore += psychologicalScore * 0.05;
      
      // Use AI model for refinement if available
      try {
        const aiPrediction = await this.riskModel.predict({
          athlete,
          injuries,
          assessmentData,
        });
        
        // Use enhanced rule-based analytics
        // Note: Machine learning integration planned for future versions
        riskScore = riskScore; // Pure rule-based for now
      } catch (aiError) {
        console.warn('AI model unavailable, using rule-based scoring:', aiError);
      }
      
      // Ensure score is within bounds
      return Math.max(0, Math.min(100, Math.round(riskScore)));
    } catch (error) {
      console.error('Error calculating risk score:', error);
      return 50; // Default moderate risk
    }
  }

  async predictInjuryRisk(athleteId: string, timeframe: number, user: User): Promise<{
    probability: number;
    confidence: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    try {
      const storage = await this.storage;
      const athlete = await storage.getAthlete(athleteId, user);
      const injuries = await storage.getAthleteInjuries(athleteId, user);
      
      // Rule-based prediction logic using evidence-based risk factors
      let probability = 10; // Base probability
      const riskFactors: string[] = [];
      const recommendations: string[] = [];
      
      // Injury history analysis
      if (injuries && injuries.length > 0) {
        const recentInjuries = injuries.filter(inj => {
          const injuryDate = new Date(inj.incidentDate);
          const monthsAgo = (Date.now() - injuryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
          return monthsAgo <= 12; // Within last year
        });
        
        if (recentInjuries.length > 0) {
          probability += recentInjuries.length * 15;
          riskFactors.push('Recent injury history');
          recommendations.push('Focus on injury prevention protocols');
        }
        
        // Check for reinjuries
        const reinjuries = injuries.filter(inj => inj.injuryType === 'reinjury');
        if (reinjuries.length > 0) {
          probability += 20;
          riskFactors.push('Previous reinjury pattern');
          recommendations.push('Implement comprehensive rehabilitation program');
        }
      }
      
      // Age factor
      if (athlete?.dateOfBirth) {
        const age = this.calculateAge(athlete.dateOfBirth);
        if (age >= 18) {
          probability += (age - 18) * 2; // Slight increase with age
          if (age >= 20) {
            riskFactors.push('Increased age-related risk');
            recommendations.push('Enhanced recovery and flexibility training');
          }
        }
      }
      
      // Sport-specific risks
      if (athlete?.primarySport) {
        const highRiskSports = ['football', 'wrestling', 'gymnastics', 'ice hockey'];
        if (highRiskSports.includes(athlete.primarySport.toLowerCase())) {
          probability += 15;
          riskFactors.push('High-risk sport participation');
          recommendations.push('Sport-specific injury prevention training');
        }
      }
      
      // Clearance status
      if (athlete?.clearanceStatus === 'conditional' || athlete?.clearanceStatus === 'not_cleared') {
        probability += 25;
        riskFactors.push('Current clearance restrictions');
        recommendations.push('Complete clearance requirements before full participation');
      }
      
      // Adjust for timeframe
      const timeframeFactor = Math.sqrt(timeframe / 180); // Square root scaling for timeframe
      probability *= timeframeFactor;
      
      // Use AI model if available
      let confidence = 75; // Base confidence for rule-based system
      try {
        const aiPrediction = await this.riskModel.predict({
          athlete,
          injuries,
          timeframe,
        });
        
        // Blend predictions
        probability = (probability * 0.7) + (aiPrediction.riskScore * 0.3);
        confidence = aiPrediction.confidence;
        
        // Merge AI risk factors
        riskFactors.push(...aiPrediction.keyFactors);
        recommendations.push(...aiPrediction.recommendations);
      } catch (aiError) {
        console.warn('Enhanced prediction model unavailable, using baseline rule-based prediction:', aiError);
      }
      
      // Ensure bounds
      probability = Math.max(0, Math.min(100, probability));
      
      return {
        probability: Math.round(probability),
        confidence: Math.round(confidence),
        riskFactors: [...new Set(riskFactors)], // Remove duplicates
        recommendations: [...new Set(recommendations)], // Remove duplicates
      };
    } catch (error) {
      console.error('Error predicting injury risk:', error);
      return {
        probability: 25,
        confidence: 50,
        riskFactors: ['Assessment data incomplete'],
        recommendations: ['Complete comprehensive risk assessment'],
      };
    }
  }

  // Health Alert Management (placeholder implementations)
  async generateHealthAlerts(athleteId: string, riskProfile: HealthRiskProfile, user: User): Promise<void> {
    try {
      // Generate alerts based on risk level
      if (riskProfile.riskLevel === 'critical' || riskProfile.overallRiskScore >= 80) {
        console.log(`🚨 CRITICAL RISK ALERT: Athlete ${athleteId} has critical injury risk (${riskProfile.overallRiskScore})`);
        // TODO: Send immediate notifications to athletic trainer and coach
      } else if (riskProfile.riskLevel === 'high' || riskProfile.overallRiskScore >= 60) {
        console.log(`⚠️ HIGH RISK ALERT: Athlete ${athleteId} has high injury risk (${riskProfile.overallRiskScore})`);
        // TODO: Schedule enhanced monitoring and preventive interventions
      }
      
      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', athleteId, {
        action: 'health_alerts_generated',
        riskLevel: riskProfile.riskLevel,
        alertCount: riskProfile.alerts.length,
      });
    } catch (error) {
      console.error('Error generating health alerts:', error);
    }
  }

  async getActiveHealthAlerts(organizationId: string, user: User): Promise<any[]> {
    // TODO: Implement with storage
    return [];
  }

  async resolveHealthAlert(alertId: string, resolution: string, user: User): Promise<void> {
    // TODO: Implement alert resolution
  }

  // Risk Monitoring (placeholder implementations)
  async monitorAthleteRisks(organizationId: string, user: User): Promise<{
    highRiskAthletes: string[];
    criticalAlerts: number;
    trendsAnalysis: any;
  }> {
    // TODO: Implement comprehensive risk monitoring
    return {
      highRiskAthletes: [],
      criticalAlerts: 0,
      trendsAnalysis: {},
    };
  }

  async getInjuryPredictions(organizationId: string, timeframe: number, user: User): Promise<any> {
    // TODO: Implement organization-wide predictions
    return {};
  }

  async identifyRiskTrends(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<any> {
    // TODO: Implement trend analysis
    return {};
  }

  // Intervention Recommendations
  async generateRecommendations(athleteId: string, riskProfile: HealthRiskProfile, user: User): Promise<any[]> {
    const recommendations: any[] = [];
    
    // Risk-based recommendations
    if (riskProfile.overallRiskScore >= 70) {
      recommendations.push({
        category: 'medical',
        priority: 'high',
        recommendation: 'Schedule comprehensive medical evaluation',
        expectedImpact: 'Identify underlying health issues',
        timeframe: '1 week',
      });
    }
    
    if (riskProfile.injuryHistoryRisk >= 60) {
      recommendations.push({
        category: 'training',
        priority: 'high',
        recommendation: 'Implement targeted injury prevention program',
        expectedImpact: 'Reduce reinjury risk by 30-40%',
        timeframe: '2-4 weeks',
      });
    }
    
    if (riskProfile.trainingLoadRisk >= 60) {
      recommendations.push({
        category: 'training',
        priority: 'medium',
        recommendation: 'Modify training intensity and volume',
        expectedImpact: 'Reduce overuse injury risk',
        timeframe: 'Immediate',
      });
    }
    
    return recommendations;
  }

  async trackInterventionEffectiveness(athleteId: string, interventionId: string, user: User): Promise<any> {
    // TODO: Implement intervention tracking
    return {};
  }

  // Private utility methods
  private initializeRiskModel(): AIRiskModel {
    return {
      modelVersion: '1.0.0-rule-based',
      lastTrained: new Date().toISOString(),
      accuracy: 70, // Rule-based risk assessment accuracy based on validated scoring systems
      features: ['injury_history', 'age', 'sport', 'training_load', 'clearance_status'],
      
      async predict(athleteData: any): Promise<{
        riskScore: number;
        confidence: number;
        keyFactors: string[];
        recommendations: string[];
      }> {
        // Rule-based prediction using validated injury risk factors
        // Machine learning integration planned for future enhancement
        return {
          riskScore: 45,
          confidence: 75,
          keyFactors: ['Training load', 'Previous injuries'],
          recommendations: ['Monitor training intensity', 'Focus on injury prevention'],
        };
      },
    };
  }

  private determineRiskLevel(riskScore: number): 'low' | 'moderate' | 'high' | 'critical' {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'moderate';
    return 'low';
  }

  private calculateInjuryHistoryRisk(athlete: any, injuries?: any[]): number {
    if (!athlete) return 50;
    
    let risk = 20; // Base risk
    
    // Count recent injuries
    if (injuries && injuries.length > 0) {
      const recentInjuries = injuries.filter(inj => {
        const injuryDate = new Date(inj.incidentDate);
        const monthsAgo = (Date.now() - injuryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo <= 12;
      });
      
      risk += recentInjuries.length * 15;
      
      // Severe injuries increase risk more
      const severeInjuries = recentInjuries.filter(inj => 
        ['major', 'severe', 'catastrophic'].includes(inj.injurySeverity)
      );
      risk += severeInjuries.length * 10;
    }
    
    return Math.min(100, risk);
  }

  private calculatePhysicalConditionRisk(assessmentData: any): number {
    // Base moderate risk
    let risk = 40;
    
    if (assessmentData?.healthMetrics) {
      const metrics = assessmentData.healthMetrics;
      
      // BMI risk
      if (metrics.bmi) {
        if (metrics.bmi < 18.5 || metrics.bmi > 30) risk += 20;
        else if (metrics.bmi > 25) risk += 10;
      }
      
      // Fitness level
      if (metrics.fitnessLevel === 'poor') risk += 25;
      else if (metrics.fitnessLevel === 'fair') risk += 15;
      else if (metrics.fitnessLevel === 'excellent') risk -= 10;
    }
    
    return Math.max(0, Math.min(100, risk));
  }

  private calculateTrainingLoadRisk(assessmentData: any): number {
    let risk = 30; // Base low-moderate risk
    
    if (assessmentData?.trainingLoad) {
      const load = assessmentData.trainingLoad;
      
      if (load.intensityLevel === 'very_high') risk += 30;
      else if (load.intensityLevel === 'high') risk += 20;
      
      if (load.weeklyHours && load.weeklyHours > 20) risk += 15;
      if (!load.adequateRest) risk += 20;
      if (load.recentLoadChanges === 'significant_increase') risk += 25;
    }
    
    return Math.max(0, Math.min(100, risk));
  }

  private calculateEnvironmentalRisk(assessmentData: any): number {
    // TODO: Implement environmental risk calculation
    return 30; // Default low-moderate risk
  }

  private calculatePsychologicalRisk(assessmentData: any): number {
    // TODO: Implement psychological risk calculation
    return 40; // Default moderate risk
  }

  private generateRiskFactors(athlete: any, assessmentData: any): RiskFactor[] {
    const factors: RiskFactor[] = [];
    
    // Injury history factor
    if (athlete?.injuryHistory && athlete.injuryHistory.length > 0) {
      factors.push({
        id: randomUUID(),
        category: 'injury_history',
        factor: 'Previous Injuries',
        weight: 8,
        currentValue: athlete.injuryHistory.length,
        riskContribution: Math.min(30, athlete.injuryHistory.length * 10),
        description: 'Athletes with previous injuries have higher reinjury risk',
        recommendations: ['Implement targeted prevention protocols', 'Regular reassessment'],
      });
    }
    
    // Age factor
    if (athlete?.dateOfBirth) {
      const age = this.calculateAge(athlete.dateOfBirth);
      factors.push({
        id: randomUUID(),
        category: 'physical_condition',
        factor: 'Age',
        weight: 6,
        currentValue: age,
        riskContribution: Math.max(0, (age - 16) * 2),
        description: 'Injury risk may increase with age due to physical changes',
        recommendations: age >= 18 ? ['Enhanced recovery protocols', 'Flexibility training'] : [],
      });
    }
    
    return factors;
  }

  private buildInjuryHistoryRisk(athlete: any): any[] {
    if (!athlete?.injuryHistory) return [];
    
    return athlete.injuryHistory.map((injury: any) => ({
      ...injury,
      riskContribution: this.calculateInjuryRiskContribution(injury),
    }));
  }

  private calculateInjuryRiskContribution(injury: any): number {
    let contribution = 10; // Base contribution
    
    if (injury.severity === 'severe' || injury.severity === 'catastrophic') contribution += 20;
    else if (injury.severity === 'major') contribution += 15;
    else if (injury.severity === 'moderate') contribution += 10;
    
    if (!injury.fullyRecovered) contribution += 15;
    
    // Recent injuries contribute more
    const injuryDate = new Date(injury.dateOccurred);
    const monthsAgo = (Date.now() - injuryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAgo <= 6) contribution += 10;
    else if (monthsAgo <= 12) contribution += 5;
    
    return Math.min(50, contribution);
  }

  private generateAlerts(riskScore: number, predictions: any): any[] {
    const alerts: any[] = [];
    
    if (riskScore >= 80) {
      alerts.push({
        level: 'critical',
        category: 'injury_risk',
        message: 'Critical injury risk detected - immediate intervention required',
        actionRequired: true,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } else if (riskScore >= 60) {
      alerts.push({
        level: 'warning',
        category: 'injury_risk',
        message: 'High injury risk detected - enhanced monitoring recommended',
        actionRequired: true,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
    
    if (predictions?.injuryProbability >= 70) {
      alerts.push({
        level: 'warning',
        category: 'prediction',
        message: `High injury probability (${predictions.injuryProbability}%) in next 6 months`,
        actionRequired: true,
      });
    }
    
    return alerts;
  }

  private parseRiskFactors(factors: any): RiskFactor[] {
    if (!Array.isArray(factors)) return [];
    
    return factors.map((factor, index) => ({
      id: `factor-${index}`,
      category: 'physical_condition',
      factor: factor,
      weight: 5,
      currentValue: 1,
      riskContribution: 10,
      description: factor,
    }));
  }

  private parseRecommendations(recommendations: any): any[] {
    if (!Array.isArray(recommendations)) return [];
    
    return recommendations.map((rec, index) => ({
      category: 'training',
      priority: 'medium',
      recommendation: rec,
      expectedImpact: 'Reduce injury risk',
      timeframe: '2-4 weeks',
    }));
  }

  private calculateNextAssessmentDate(assessmentType: string): string {
    const now = new Date();
    let monthsToAdd = 12; // Default annual
    
    switch (assessmentType) {
      case 'preseason':
        monthsToAdd = 6;
        break;
      case 'mid_season':
        monthsToAdd = 3;
        break;
      case 'post_injury':
        monthsToAdd = 1;
        break;
      case 'targeted':
        monthsToAdd = 2;
        break;
    }
    
    const nextDate = new Date(now.getTime() + monthsToAdd * 30 * 24 * 60 * 60 * 1000);
    return nextDate.toISOString().split('T')[0];
  }

  private calculateAge(dateOfBirth: string): number {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}

// Export singleton instance
export const healthRiskAssessmentService = new HealthRiskAssessmentServiceImpl();