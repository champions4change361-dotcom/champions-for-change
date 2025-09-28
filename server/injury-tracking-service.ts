import { randomUUID } from "crypto";
import { getStorage } from "./storage";
import { HealthDataEncryption, HealthDataAudit } from "./data-encryption";
import { logComplianceAction } from "./complianceMiddleware";
import type { 
  User, 
  InjuryIncident, 
  InsertInjuryIncident, 
  InjuryFollowUp, 
  InsertInjuryFollowUp,
  Athlete 
} from "@shared/schema";

export interface InjuryIncidentRecord {
  id: string;
  athleteId: string;
  athleteName?: string;
  sportId?: string;
  sportName?: string;
  incidentDate: string;
  incidentTime?: string;
  location: string;
  injuryType: 'acute' | 'chronic' | 'overuse' | 'reinjury' | 'illness';
  injuryCategory: 'head_neck' | 'upper_extremity' | 'trunk' | 'lower_extremity' | 'systemic';
  bodyPartAffected: string;
  injurySeverity: 'minor' | 'moderate' | 'major' | 'severe' | 'catastrophic';
  mechanismOfInjury?: string;
  activityAtTimeOfInjury?: string;
  immediateResponse?: string;
  treatmentProvided?: string;
  referralMade?: boolean;
  referralDetails?: string;
  returnToPlayStatus: 'cleared' | 'modified_activity' | 'no_activity' | 'pending_evaluation';
  estimatedReturnDate?: string;
  notes?: string;
  reportedBy: string;
  athleticTrainerId?: string;
  schoolId?: string;
  weatherConditions?: string;
  playingSurface?: string;
  protectiveEquipment?: string[];
  witnessPresent?: boolean;
  parentNotified?: boolean;
  emergencyAction?: boolean;
  followUpRequired: boolean;
  status: 'active' | 'resolved' | 'chronic_management' | 'referred';
  createdAt: string;
  updatedAt: string;
}

export interface InjuryFollowUpRecord {
  id: string;
  injuryIncidentId: string;
  followUpDate: string;
  followUpType: 'evaluation' | 'treatment' | 'clearance' | 'referral' | 'progress_check';
  symptoms?: string;
  painLevel?: number;
  functionalStatus?: string;
  treatmentGiven?: string;
  progressNotes?: string;
  nextAppointment?: string;
  modificationsRecommended?: string;
  returnToPlayCleared?: boolean;
  athleticTrainerId?: string;
  referralMade?: boolean;
  referralDetails?: string;
  attachments?: string[];
  createdAt: string;
}

export interface ReturnToPlayAssessment {
  id: string;
  athleteId: string;
  injuryIncidentId: string;
  assessmentDate: string;
  assessorId: string;
  assessmentType: 'functional' | 'medical' | 'psychological' | 'performance';
  clearanceLevel: 'full_clearance' | 'limited_clearance' | 'no_clearance' | 'conditional_clearance';
  restrictions?: string[];
  functionalTests: Array<{
    testName: string;
    result: 'pass' | 'fail' | 'modified';
    notes?: string;
  }>;
  painAssessment: {
    atRest: number;
    withActivity: number;
    location?: string;
  };
  rangeOfMotion?: {
    affected: number;
    unaffected: number;
    unit: 'degrees' | 'percentage';
  };
  strengthAssessment?: {
    affected: number;
    unaffected: number;
    unit: 'lbs' | 'kg' | 'percentage';
  };
  psychologicalReadiness?: {
    confidence: number;
    fearOfReinjury: number;
    motivation: number;
  };
  recommendations: string[];
  nextReassessment?: string;
  finalClearance: boolean;
  notes?: string;
  createdAt: string;
}

export interface InjuryAnalytics {
  totalIncidents: number;
  incidentsByType: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
  incidentsBySport: Record<string, number>;
  incidentsByMonth: Record<string, number>;
  averageReturnToPlayDays: number;
  reinjuryRate: number;
  mostCommonInjuries: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  injuryTrends: Array<{
    period: string;
    incidents: number;
    changeFromPrevious: number;
  }>;
  riskFactors: Array<{
    factor: string;
    correlation: number;
    significance: string;
  }>;
}

export interface InjuryTrackingService {
  // Injury Incident Management
  createInjuryIncident(incident: Partial<InjuryIncidentRecord>, user: User): Promise<InjuryIncidentRecord>;
  getInjuryIncident(incidentId: string, user: User): Promise<InjuryIncidentRecord | null>;
  updateInjuryIncident(incidentId: string, updates: Partial<InjuryIncidentRecord>, user: User): Promise<InjuryIncidentRecord>;
  getInjuryIncidents(filters: any, user: User): Promise<InjuryIncidentRecord[]>;
  getAthleteInjuries(athleteId: string, user: User): Promise<InjuryIncidentRecord[]>;
  
  // Follow-up Management
  createFollowUp(followUp: Partial<InjuryFollowUpRecord>, user: User): Promise<InjuryFollowUpRecord>;
  getFollowUps(incidentId: string, user: User): Promise<InjuryFollowUpRecord[]>;
  updateFollowUp(followUpId: string, updates: Partial<InjuryFollowUpRecord>, user: User): Promise<InjuryFollowUpRecord>;
  scheduleFollowUp(incidentId: string, date: string, type: string, user: User): Promise<InjuryFollowUpRecord>;
  
  // Return-to-Play Management
  createReturnToPlayAssessment(assessment: Partial<ReturnToPlayAssessment>, user: User): Promise<ReturnToPlayAssessment>;
  getReturnToPlayAssessments(athleteId: string, user: User): Promise<ReturnToPlayAssessment[]>;
  updateReturnToPlayStatus(incidentId: string, status: string, restrictions?: string[], user?: User): Promise<void>;
  clearAthleteForPlay(athleteId: string, incidentId: string, clearanceNotes: string, user: User): Promise<void>;
  
  // Analytics and Reporting
  getInjuryAnalytics(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<InjuryAnalytics>;
  getInjuryTrends(filters: any, user: User): Promise<any>;
  generateInjuryReport(organizationId: string, reportType: string, filters: any, user: User): Promise<any>;
  
  // Workflow Management
  getActiveInjuries(organizationId: string, user: User): Promise<InjuryIncidentRecord[]>;
  getPendingFollowUps(trainerId: string, user: User): Promise<InjuryFollowUpRecord[]>;
  getReturnToPlayCandidates(organizationId: string, user: User): Promise<InjuryIncidentRecord[]>;
  
  // Notifications and Alerts
  sendInjuryNotification(incidentId: string, recipientType: 'coach' | 'parent' | 'admin', message: string, user: User): Promise<void>;
  createInjuryAlert(incidentId: string, alertType: string, message: string, user: User): Promise<void>;
}

/**
 * Injury Tracking Service Implementation
 * Comprehensive injury incident recording and workflow management
 */
export class InjuryTrackingServiceImpl implements InjuryTrackingService {
  private storage = getStorage();
  
  constructor() {
    console.log('🏥 Injury Tracking Service initialized');
  }

  // Injury Incident Management
  async createInjuryIncident(incident: Partial<InjuryIncidentRecord>, user: User): Promise<InjuryIncidentRecord> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for injury incident creation');
      }

      // Build injury incident data
      const injuryData: InsertInjuryIncident = {
        id: randomUUID(),
        athleteId: incident.athleteId!,
        sportId: incident.sportId,
        incidentDate: incident.incidentDate!,
        incidentTime: incident.incidentTime,
        location: incident.location!,
        injuryType: incident.injuryType!,
        injuryCategory: incident.injuryCategory!,
        bodyPartAffected: incident.bodyPartAffected!,
        injurySeverity: incident.injurySeverity!,
        mechanismOfInjury: incident.mechanismOfInjury,
        activityAtTimeOfInjury: incident.activityAtTimeOfInjury,
        immediateResponse: incident.immediateResponse,
        treatmentProvided: incident.treatmentProvided,
        referralMade: incident.referralMade || false,
        referralDetails: incident.referralDetails,
        returnToPlayStatus: incident.returnToPlayStatus || 'pending_evaluation',
        estimatedReturnDate: incident.estimatedReturnDate,
        notes: incident.notes,
        reportedBy: user.id,
        athleticTrainerId: user.id,
        schoolId: user.organizationId,
        weatherConditions: incident.weatherConditions,
        playingSurface: incident.playingSurface,
        protectiveEquipment: incident.protectiveEquipment,
        witnessPresent: incident.witnessPresent || false,
        parentNotified: incident.parentNotified || false,
        emergencyAction: incident.emergencyAction || false,
        followUpRequired: incident.followUpRequired ?? true,
        status: incident.status || 'active',
      };

      const createdIncident = await storage.createInjuryIncident(injuryData, user);

      // Get athlete name for the record
      const athlete = await storage.getAthlete(incident.athleteId!, user);
      
      const incidentRecord: InjuryIncidentRecord = {
        ...createdIncident,
        athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : undefined,
        sportName: incident.sportName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', createdIncident.id, {
        action: 'injury_incident_created',
        athleteId: incident.athleteId,
        injuryType: incident.injuryType,
        severity: incident.injurySeverity,
      });

      // Create initial follow-up if required
      if (injuryData.followUpRequired) {
        await this.scheduleFollowUp(createdIncident.id, 
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next day
          'evaluation', 
          user
        );
      }

      // Send notifications if this is a severe injury
      if (['major', 'severe', 'catastrophic'].includes(incident.injurySeverity!)) {
        await this.sendInjuryNotification(createdIncident.id, 'coach', 
          `Severe injury reported for ${incidentRecord.athleteName}. Immediate attention required.`, user);
        
        if (incident.parentNotified) {
          await this.sendInjuryNotification(createdIncident.id, 'parent', 
            `Your child has sustained an injury and is receiving appropriate care. Please contact the athletic trainer for details.`, user);
        }
      }

      console.log(`🏥 Created injury incident ${createdIncident.id} for athlete ${incident.athleteId}`);
      return incidentRecord;
    } catch (error) {
      console.error('Error creating injury incident:', error);
      throw error;
    }
  }

  async getInjuryIncident(incidentId: string, user: User): Promise<InjuryIncidentRecord | null> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for injury incident access');
      }

      const incident = await storage.getInjuryIncident(incidentId, user);
      if (!incident) {
        return null;
      }

      // Get athlete information
      const athlete = await storage.getAthlete(incident.athleteId, user);
      
      const incidentRecord: InjuryIncidentRecord = {
        ...incident,
        athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : undefined,
        createdAt: incident.createdAt || new Date().toISOString(),
        updatedAt: incident.updatedAt || new Date().toISOString(),
      };

      // Log compliance action
      await logComplianceAction(user.id, 'data_access', 'health_data', incidentId, {
        action: 'injury_incident_viewed',
        athleteId: incident.athleteId,
      });

      return incidentRecord;
    } catch (error) {
      console.error('Error getting injury incident:', error);
      throw error;
    }
  }

  async updateInjuryIncident(incidentId: string, updates: Partial<InjuryIncidentRecord>, user: User): Promise<InjuryIncidentRecord> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for injury incident updates');
      }

      // Convert updates to storage format
      const storageUpdates: Partial<InjuryIncident> = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await storage.updateInjuryIncident(incidentId, storageUpdates, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', incidentId, {
        action: 'injury_incident_updated',
        updatedFields: Object.keys(updates),
      });

      // Return updated incident
      return await this.getInjuryIncident(incidentId, user) as InjuryIncidentRecord;
    } catch (error) {
      console.error('Error updating injury incident:', error);
      throw error;
    }
  }

  async getInjuryIncidents(filters: any, user: User): Promise<InjuryIncidentRecord[]> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for injury incidents access');
      }

      const incidents = await storage.getInjuryIncidents(filters, user);
      
      // Convert to records with athlete names
      const incidentRecords: InjuryIncidentRecord[] = [];
      for (const incident of incidents) {
        const athlete = await storage.getAthlete(incident.athleteId, user);
        incidentRecords.push({
          ...incident,
          athleteName: athlete ? `${athlete.firstName} ${athlete.lastName}` : undefined,
          createdAt: incident.createdAt || new Date().toISOString(),
          updatedAt: incident.updatedAt || new Date().toISOString(),
        });
      }

      return incidentRecords;
    } catch (error) {
      console.error('Error getting injury incidents:', error);
      throw error;
    }
  }

  async getAthleteInjuries(athleteId: string, user: User): Promise<InjuryIncidentRecord[]> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for athlete injury access');
      }

      const incidents = await storage.getAthleteInjuries(athleteId, user);
      
      // Convert to records
      const incidentRecords: InjuryIncidentRecord[] = incidents.map(incident => ({
        ...incident,
        createdAt: incident.createdAt || new Date().toISOString(),
        updatedAt: incident.updatedAt || new Date().toISOString(),
      }));

      return incidentRecords;
    } catch (error) {
      console.error('Error getting athlete injuries:', error);
      throw error;
    }
  }

  // Follow-up Management
  async createFollowUp(followUp: Partial<InjuryFollowUpRecord>, user: User): Promise<InjuryFollowUpRecord> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for follow-up creation');
      }

      const followUpData: InsertInjuryFollowUp = {
        id: randomUUID(),
        injuryIncidentId: followUp.injuryIncidentId!,
        followUpDate: followUp.followUpDate!,
        followUpType: followUp.followUpType!,
        symptoms: followUp.symptoms,
        painLevel: followUp.painLevel,
        functionalStatus: followUp.functionalStatus,
        treatmentGiven: followUp.treatmentGiven,
        progressNotes: followUp.progressNotes,
        nextAppointment: followUp.nextAppointment,
        modificationsRecommended: followUp.modificationsRecommended,
        returnToPlayCleared: followUp.returnToPlayCleared || false,
        athleticTrainerId: user.id,
        referralMade: followUp.referralMade || false,
        referralDetails: followUp.referralDetails,
        attachments: followUp.attachments,
      };

      const createdFollowUp = await storage.createInjuryFollowUp(followUpData, user);

      const followUpRecord: InjuryFollowUpRecord = {
        ...createdFollowUp,
        createdAt: new Date().toISOString(),
      };

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', createdFollowUp.id, {
        action: 'injury_followup_created',
        injuryIncidentId: followUp.injuryIncidentId,
        followUpType: followUp.followUpType,
      });

      console.log(`🏥 Created follow-up ${createdFollowUp.id} for incident ${followUp.injuryIncidentId}`);
      return followUpRecord;
    } catch (error) {
      console.error('Error creating follow-up:', error);
      throw error;
    }
  }

  async getFollowUps(incidentId: string, user: User): Promise<InjuryFollowUpRecord[]> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for follow-up access');
      }

      const followUps = await storage.getInjuryFollowUps(incidentId, user);
      
      return followUps.map(followUp => ({
        ...followUp,
        createdAt: followUp.createdAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error getting follow-ups:', error);
      throw error;
    }
  }

  async updateFollowUp(followUpId: string, updates: Partial<InjuryFollowUpRecord>, user: User): Promise<InjuryFollowUpRecord> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for follow-up updates');
      }

      await storage.updateInjuryFollowUp(followUpId, updates, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', followUpId, {
        action: 'injury_followup_updated',
        updatedFields: Object.keys(updates),
      });

      // Return updated follow-up
      const followUp = await storage.getInjuryFollowUp(followUpId, user);
      return {
        ...followUp!,
        createdAt: followUp!.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating follow-up:', error);
      throw error;
    }
  }

  async scheduleFollowUp(incidentId: string, date: string, type: string, user: User): Promise<InjuryFollowUpRecord> {
    try {
      const followUpData: Partial<InjuryFollowUpRecord> = {
        injuryIncidentId: incidentId,
        followUpDate: date,
        followUpType: type as any,
        progressNotes: `Scheduled ${type} follow-up`,
      };

      return await this.createFollowUp(followUpData, user);
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  }

  // Return-to-Play Management (placeholder implementations)
  async createReturnToPlayAssessment(assessment: Partial<ReturnToPlayAssessment>, user: User): Promise<ReturnToPlayAssessment> {
    // TODO: Implement with storage for return-to-play assessments
    const assessmentRecord: ReturnToPlayAssessment = {
      id: randomUUID(),
      athleteId: assessment.athleteId!,
      injuryIncidentId: assessment.injuryIncidentId!,
      assessmentDate: assessment.assessmentDate!,
      assessorId: user.id,
      assessmentType: assessment.assessmentType!,
      clearanceLevel: assessment.clearanceLevel!,
      restrictions: assessment.restrictions || [],
      functionalTests: assessment.functionalTests || [],
      painAssessment: assessment.painAssessment!,
      rangeOfMotion: assessment.rangeOfMotion,
      strengthAssessment: assessment.strengthAssessment,
      psychologicalReadiness: assessment.psychologicalReadiness,
      recommendations: assessment.recommendations || [],
      nextReassessment: assessment.nextReassessment,
      finalClearance: assessment.finalClearance || false,
      notes: assessment.notes,
      createdAt: new Date().toISOString(),
    };

    // Log compliance action
    await logComplianceAction(user.id, 'data_modification', 'health_data', assessmentRecord.id, {
      action: 'return_to_play_assessment_created',
      athleteId: assessment.athleteId,
      clearanceLevel: assessment.clearanceLevel,
    });

    return assessmentRecord;
  }

  async getReturnToPlayAssessments(athleteId: string, user: User): Promise<ReturnToPlayAssessment[]> {
    // TODO: Implement with storage
    return [];
  }

  async updateReturnToPlayStatus(incidentId: string, status: string, restrictions?: string[], user?: User): Promise<void> {
    try {
      const storage = await this.storage;
      
      if (!user?.id) {
        throw new Error('User context required for return-to-play updates');
      }

      await storage.updateInjuryIncident(incidentId, {
        returnToPlayStatus: status as any,
        updatedAt: new Date().toISOString(),
      }, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', incidentId, {
        action: 'return_to_play_status_updated',
        newStatus: status,
        restrictions: restrictions,
      });
    } catch (error) {
      console.error('Error updating return-to-play status:', error);
      throw error;
    }
  }

  async clearAthleteForPlay(athleteId: string, incidentId: string, clearanceNotes: string, user: User): Promise<void> {
    try {
      await this.updateReturnToPlayStatus(incidentId, 'cleared', [], user);
      
      // Update athlete clearance status
      const storage = await this.storage;
      await storage.updateAthlete(athleteId, {
        clearanceStatus: 'cleared',
        lastClearanceDate: new Date().toISOString(),
        clearanceNotes: clearanceNotes,
      }, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', athleteId, {
        action: 'athlete_cleared_for_play',
        incidentId: incidentId,
        clearanceNotes: clearanceNotes,
      });

      console.log(`🏥 Cleared athlete ${athleteId} for play from incident ${incidentId}`);
    } catch (error) {
      console.error('Error clearing athlete for play:', error);
      throw error;
    }
  }

  // Analytics and Reporting (placeholder implementations)
  async getInjuryAnalytics(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<InjuryAnalytics> {
    try {
      const incidents = await this.getInjuryIncidents({
        organizationId,
        dateRange,
      }, user);

      // Basic analytics calculation
      const analytics: InjuryAnalytics = {
        totalIncidents: incidents.length,
        incidentsByType: this.groupBy(incidents, 'injuryType'),
        incidentsBySeverity: this.groupBy(incidents, 'injurySeverity'),
        incidentsBySport: this.groupBy(incidents, 'sportName'),
        incidentsByMonth: this.groupByMonth(incidents),
        averageReturnToPlayDays: this.calculateAverageReturnDays(incidents),
        reinjuryRate: this.calculateReinjuryRate(incidents),
        mostCommonInjuries: this.getMostCommonInjuries(incidents),
        injuryTrends: this.calculateInjuryTrends(incidents),
        riskFactors: this.identifyRiskFactors(incidents),
      };

      return analytics;
    } catch (error) {
      console.error('Error getting injury analytics:', error);
      throw error;
    }
  }

  async getInjuryTrends(filters: any, user: User): Promise<any> {
    // TODO: Implement trend analysis
    return {};
  }

  async generateInjuryReport(organizationId: string, reportType: string, filters: any, user: User): Promise<any> {
    // TODO: Implement report generation
    return {};
  }

  // Workflow Management
  async getActiveInjuries(organizationId: string, user: User): Promise<InjuryIncidentRecord[]> {
    return await this.getInjuryIncidents({
      organizationId,
      status: 'active',
    }, user);
  }

  async getPendingFollowUps(trainerId: string, user: User): Promise<InjuryFollowUpRecord[]> {
    // TODO: Implement pending follow-ups query
    return [];
  }

  async getReturnToPlayCandidates(organizationId: string, user: User): Promise<InjuryIncidentRecord[]> {
    return await this.getInjuryIncidents({
      organizationId,
      returnToPlayStatus: 'pending_evaluation',
    }, user);
  }

  // Notifications and Alerts (placeholder implementations)
  async sendInjuryNotification(incidentId: string, recipientType: 'coach' | 'parent' | 'admin', message: string, user: User): Promise<void> {
    // TODO: Integrate with health communication service
    console.log(`🏥 Sending ${recipientType} notification for incident ${incidentId}: ${message}`);
  }

  async createInjuryAlert(incidentId: string, alertType: string, message: string, user: User): Promise<void> {
    // TODO: Implement alert system
    console.log(`🏥 Creating ${alertType} alert for incident ${incidentId}: ${message}`);
  }

  // Private utility methods
  private groupBy(items: InjuryIncidentRecord[], key: keyof InjuryIncidentRecord): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = String(item[key] || 'unknown');
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupByMonth(items: InjuryIncidentRecord[]): Record<string, number> {
    return items.reduce((acc, item) => {
      const month = new Date(item.incidentDate).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateAverageReturnDays(items: InjuryIncidentRecord[]): number {
    const resolvedInjuries = items.filter(item => 
      item.status === 'resolved' && item.estimatedReturnDate && item.incidentDate
    );

    if (resolvedInjuries.length === 0) return 0;

    const totalDays = resolvedInjuries.reduce((sum, item) => {
      const incidentDate = new Date(item.incidentDate);
      const returnDate = new Date(item.estimatedReturnDate!);
      const days = Math.floor((returnDate.getTime() - incidentDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / resolvedInjuries.length);
  }

  private calculateReinjuryRate(items: InjuryIncidentRecord[]): number {
    const reinjuries = items.filter(item => item.injuryType === 'reinjury');
    return items.length > 0 ? Math.round((reinjuries.length / items.length) * 100) : 0;
  }

  private getMostCommonInjuries(items: InjuryIncidentRecord[]) {
    const injuryCounts = this.groupBy(items, 'bodyPartAffected');
    const total = items.length;
    
    return Object.entries(injuryCounts)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateInjuryTrends(items: InjuryIncidentRecord[]) {
    // TODO: Implement proper trend calculation
    return [];
  }

  private identifyRiskFactors(items: InjuryIncidentRecord[]) {
    // TODO: Implement risk factor analysis
    return [];
  }
}

// Export singleton instance
export const injuryTrackingService = new InjuryTrackingServiceImpl();