import { randomUUID } from "crypto";
import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { HealthDataEncryption, HealthDataAudit } from "./data-encryption";
import { logComplianceAction } from "./complianceMiddleware";
import type { User, Athlete, InsertAthlete, HealthRiskAssessment, InsertHealthRiskAssessment, MedicalHistory, InsertMedicalHistory } from "@shared/schema";
import type { 
  AthleteProfile, 
  SchedulingSlot, 
  EquipmentItem, 
  InventoryItem, 
  AthleticTrainerService 
} from "@shared/athletic-trainer-types";

/**
 * Athletic Trainer Service Implementation
 * Provides comprehensive functionality for athletic trainer dashboard
 */
export class AthleticTrainerServiceImpl implements AthleticTrainerService {
  private storage = getStorage();
  
  constructor() {
    console.log('🏥 Athletic Trainer Service initialized');
  }

  // Athlete Management Methods
  async getAthleteProfile(athleteId: string, user: User): Promise<AthleteProfile | null> {
    try {
      const storage = await this.storage;
      
      // RBAC Security Check
      if (!user.id) {
        throw new Error('User context required for athlete profile access');
      }

      // Get athlete data
      const athlete = await storage.getAthlete(athleteId, user);
      if (!athlete) {
        return null;
      }

      // Get medical history if authorized
      let medicalHistory = null;
      if (await this.hasHealthDataAccess(user)) {
        medicalHistory = await storage.getMedicalHistoryByPlayer(athleteId, user);
      }

      // Get recent risk assessments
      const riskAssessments = await storage.getHealthRiskAssessmentsByAthlete(athleteId, user);
      const latestRisk = riskAssessments?.[0];

      // Build comprehensive profile
      const profile: AthleteProfile = {
        id: athlete.id,
        trainerId: user.id,
        athleteId: athlete.id,
        organizationId: user.organizationId || '',
        sport: Array.isArray(athlete.primarySports) && athlete.primarySports.length > 0 ? athlete.primarySports[0] : undefined,
        season: undefined,
        grade: athlete.grade?.toString() || undefined,
        status: athlete.eligibilityStatus === 'eligible' ? 'active' : athlete.eligibilityStatus === 'medically_ineligible' ? 'injured' : 'cleared',
        dateAdded: new Date(),
        lastUpdated: new Date(),
        medicalAlerts: [], // To be populated from separate medical data
        personalInfo: {
          firstName: athlete.firstName,
          lastName: athlete.lastName,
          dateOfBirth: athlete.dateOfBirth || undefined,
          gender: athlete.gender || undefined,
          studentId: athlete.studentDataId || undefined,
        },
        contactInfo: {
          email: undefined, // Not stored directly on athlete table
          phone: undefined, // Not stored directly on athlete table
          emergencyContact: athlete.primaryEmergencyContact ? {
            name: athlete.primaryEmergencyContact.name,
            relationship: athlete.primaryEmergencyContact.relationship,
            phone: athlete.primaryEmergencyContact.phone,
            email: athlete.primaryEmergencyContact.email,
          } : undefined,
          parentGuardian: athlete.secondaryEmergencyContact ? {
            name: athlete.secondaryEmergencyContact.name,
            phone: athlete.secondaryEmergencyContact.phone,
            email: athlete.secondaryEmergencyContact.email,
          } : undefined,
        },
        sportsInfo: {
          primarySport: Array.isArray(athlete.primarySports) && athlete.primarySports.length > 0 ? athlete.primarySports[0] : undefined,
          secondarySports: Array.isArray(athlete.primarySports) ? athlete.primarySports.slice(1) : [],
          position: undefined, // Not in current schema
          eligibilityStatus: athlete.eligibilityStatus === 'eligible' ? 'eligible' : athlete.eligibilityStatus === 'academically_ineligible' || athlete.eligibilityStatus === 'medically_ineligible' || athlete.eligibilityStatus === 'disciplinary_ineligible' ? 'ineligible' : 'pending',
          clearanceStatus: athlete.medicalClearanceDate ? 'cleared' : 'not_cleared',
          lastPhysicalDate: athlete.medicalClearanceDate || undefined,
          nextPhysicalDue: athlete.medicalClearanceExpires || undefined,
        },
        healthInfo: {
          currentInjuries: [], // Will be populated from injury incidents
          injuryHistory: [], // Will be populated from injury incidents
          medications: [], // To be populated from separate medical data
          allergies: [], // To be populated from separate medical data
          riskFactors: [], // Will be populated from risk assessments
          lastRiskAssessment: latestRisk?.assessmentDate || undefined,
          riskScore: latestRisk?.overallRiskScore || undefined,
        },
        performanceTracking: {
          fitnessLevel: undefined, // Not in current schema
          lastAssessmentDate: undefined, // Not in current schema
          notes: undefined, // Notes not available in athlete schema
        },
        complianceInfo: {
          hipaaConsent: false, // To be implemented with proper consent tracking
          ferpaConsent: false, // To be implemented with proper consent tracking
          lastConsentUpdate: undefined,
          dataRetentionDate: undefined, // Not in current schema
        },
      };

      // Log compliance action
      await logComplianceAction(user.id, 'data_access', 'student_data', athleteId, undefined);

      return profile;
    } catch (error) {
      console.error('Error getting athlete profile:', error);
      throw error;
    }
  }

  async createAthleteProfile(athlete: Partial<AthleteProfile>, user: User): Promise<AthleteProfile> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for athlete creation');
      }

      // Create new athlete record
      const newAthleteData: InsertAthlete = {
        id: randomUUID(),
        firstName: athlete.personalInfo?.firstName || '',
        lastName: athlete.personalInfo?.lastName || '',
        dateOfBirth: athlete.personalInfo?.dateOfBirth,
        gender: athlete.personalInfo?.gender as "male" | "female" | "non_binary" | "prefer_not_to_say" | null | undefined,
        grade: athlete.grade ? parseInt(athlete.grade.toString()) : undefined,
        studentId: athlete.personalInfo?.studentId,
        email: athlete.contactInfo?.email,
        phone: athlete.contactInfo?.phone,
        emergencyContact: athlete.contactInfo?.emergencyContact,
        parentGuardian: athlete.contactInfo?.parentGuardian,
        primarySport: athlete.sportsInfo?.primarySport,
        secondarySports: athlete.sportsInfo?.secondarySports,
        position: athlete.sportsInfo?.position,
        eligibilityStatus: athlete.sportsInfo?.eligibilityStatus === 'pending' ? 'transfer_pending' : athlete.sportsInfo?.eligibilityStatus as "eligible" | "academically_ineligible" | "medically_ineligible" | "disciplinary_ineligible" | "transfer_pending" | null | undefined,
        clearanceStatus: athlete.sportsInfo?.clearanceStatus || 'not_cleared',
        lastPhysicalDate: athlete.sportsInfo?.lastPhysicalDate,
        nextPhysicalDue: athlete.sportsInfo?.nextPhysicalDue,
        medicalAlerts: athlete.medicalAlerts || [],
        currentInjuries: athlete.healthInfo?.currentInjuries || [],
        injuryHistory: athlete.healthInfo?.injuryHistory || [],
        medications: athlete.healthInfo?.medications || [],
        allergies: athlete.healthInfo?.allergies || [],
        riskFactors: athlete.healthInfo?.riskFactors || [],
        fitnessLevel: athlete.performanceTracking?.fitnessLevel,
        lastAssessmentDate: athlete.performanceTracking?.lastAssessmentDate,
        notes: athlete.performanceTracking?.notes,
        hipaaConsent: athlete.complianceInfo?.hipaaConsent || false,
        ferpaConsent: athlete.complianceInfo?.ferpaConsent || false,
        lastConsentUpdate: athlete.complianceInfo?.lastConsentUpdate,
        dataRetentionDate: athlete.complianceInfo?.dataRetentionDate,
        athleticTrainerId: user.id,
        organizationId: user.organizationId || '',
        schoolId: user.organizationId || '', // Assuming school level organization
        districtId: user.organizationId || '', // Set district ID for database constraint
      };

      const createdAthlete = await storage.createAthlete(newAthleteData, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'student_data', createdAthlete.id, undefined, 'athlete_profile_created');

      // Return full profile
      return await this.getAthleteProfile(createdAthlete.id, user) as AthleteProfile;
    } catch (error) {
      console.error('Error creating athlete profile:', error);
      throw error;
    }
  }

  async updateAthleteProfile(athleteId: string, updates: Partial<AthleteProfile>, user: User): Promise<AthleteProfile> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for athlete updates');
      }

      // Convert profile updates to athlete updates
      const athleteUpdates: Partial<any> = {};
      
      if (updates.personalInfo) {
        Object.assign(athleteUpdates, {
          firstName: updates.personalInfo.firstName,
          lastName: updates.personalInfo.lastName,
          dateOfBirth: updates.personalInfo.dateOfBirth,
          gender: updates.personalInfo.gender,
          grade: updates.grade ? parseInt(updates.grade.toString()) : undefined,
          studentId: updates.personalInfo.studentId,
        });
      }

      if (updates.contactInfo) {
        Object.assign(athleteUpdates, {
          email: updates.contactInfo.email,
          phone: updates.contactInfo.phone,
          emergencyContact: updates.contactInfo.emergencyContact,
          parentGuardian: updates.contactInfo.parentGuardian,
        });
      }

      if (updates.sportsInfo) {
        Object.assign(athleteUpdates, {
          primarySport: updates.sportsInfo.primarySport,
          secondarySports: updates.sportsInfo.secondarySports,
          position: updates.sportsInfo.position,
          eligibilityStatus: updates.sportsInfo.eligibilityStatus,
          clearanceStatus: updates.sportsInfo.clearanceStatus,
          lastPhysicalDate: updates.sportsInfo.lastPhysicalDate,
          nextPhysicalDue: updates.sportsInfo.nextPhysicalDue,
        });
      }

      if (updates.healthInfo) {
        Object.assign(athleteUpdates, {
          medicalAlerts: updates.medicalAlerts || [],
          currentInjuries: updates.healthInfo.currentInjuries,
          injuryHistory: updates.healthInfo.injuryHistory,
          medications: updates.healthInfo.medications,
          allergies: updates.healthInfo.allergies,
          riskFactors: updates.healthInfo.riskFactors,
        });
      }

      if (updates.performanceTracking) {
        Object.assign(athleteUpdates, {
          fitnessLevel: updates.performanceTracking.fitnessLevel,
          lastAssessmentDate: updates.performanceTracking.lastAssessmentDate,
          notes: updates.performanceTracking.notes,
        });
      }

      if (updates.complianceInfo) {
        Object.assign(athleteUpdates, {
          hipaaConsent: updates.complianceInfo.hipaaConsent,
          ferpaConsent: updates.complianceInfo.ferpaConsent,
          lastConsentUpdate: updates.complianceInfo.lastConsentUpdate,
          dataRetentionDate: updates.complianceInfo.dataRetentionDate,
        });
      }

      await storage.updateAthlete(athleteId, athleteUpdates, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'student_data', athleteId, undefined, 'athlete_profile_updated');

      // Return updated profile
      return await this.getAthleteProfile(athleteId, user) as AthleteProfile;
    } catch (error) {
      console.error('Error updating athlete profile:', error);
      throw error;
    }
  }

  async getAthletesByTrainer(trainerId: string, user: User): Promise<AthleteProfile[]> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for athlete access');
      }

      const athletes = await storage.getAthletesByTrainer(trainerId, user);
      
      // Convert to profiles
      const profiles: AthleteProfile[] = [];
      for (const athlete of athletes) {
        const profile = await this.getAthleteProfile(athlete.id, user);
        if (profile) {
          profiles.push(profile);
        }
      }

      return profiles;
    } catch (error) {
      console.error('Error getting athletes by trainer:', error);
      throw error;
    }
  }

  async getAthletesByOrganization(organizationId: string, user: User): Promise<AthleteProfile[]> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for athlete access');
      }

      const athletes = await storage.getAthletesByOrganization(organizationId, user);
      
      // Convert to profiles
      const profiles: AthleteProfile[] = [];
      for (const athlete of athletes) {
        const profile = await this.getAthleteProfile(athlete.id, user);
        if (profile) {
          profiles.push(profile);
        }
      }

      return profiles;
    } catch (error) {
      console.error('Error getting athletes by organization:', error);
      throw error;
    }
  }

  async searchAthletes(query: string, filters: any, user: User): Promise<AthleteProfile[]> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for athlete search');
      }

      // Get athletes based on search criteria
      const athletes = await storage.searchAthletes(query, filters, user);
      
      // Convert to profiles
      const profiles: AthleteProfile[] = [];
      for (const athlete of athletes) {
        const profile = await this.getAthleteProfile(athlete.id, user);
        if (profile) {
          profiles.push(profile);
        }
      }

      return profiles;
    } catch (error) {
      console.error('Error searching athletes:', error);
      throw error;
    }
  }

  // Health Monitoring Methods
  async updateHealthStatus(athleteId: string, healthUpdate: any, user: User): Promise<void> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id || !await this.hasHealthDataAccess(user)) {
        throw new Error('Health data access required for health status updates');
      }

      await storage.updateAthlete(athleteId, healthUpdate, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', athleteId, undefined, 'health_status_updated');
    } catch (error) {
      console.error('Error updating health status:', error);
      throw error;
    }
  }

  async addMedicalAlert(athleteId: string, alert: string, user: User): Promise<void> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id || !await this.hasHealthDataAccess(user)) {
        throw new Error('Health data access required for medical alerts');
      }

      const athlete = await storage.getAthlete(athleteId, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      // TODO: Medical alerts should be stored in a separate table
      // For now, we'll log the alert but can't store it on the athlete record
      console.log('Medical alert to be added:', alert);
      
      // Cannot update medicalAlerts as property doesn't exist on Athlete schema
      // await storage.updateAthlete(athleteId, { medicalAlerts: updatedAlerts }, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', athleteId, undefined, 'medical_alert_added');
    } catch (error) {
      console.error('Error adding medical alert:', error);
      throw error;
    }
  }

  async removeMedicalAlert(athleteId: string, alertId: string, user: User): Promise<void> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id || !await this.hasHealthDataAccess(user)) {
        throw new Error('Health data access required for medical alerts');
      }

      const athlete = await storage.getAthlete(athleteId, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      // TODO: Medical alerts should be stored in a separate table
      // For now, we'll log the removal but can't update the athlete record
      console.log('Medical alert to be removed:', alertId);
      
      // Cannot update medicalAlerts as property doesn't exist on Athlete schema
      // await storage.updateAthlete(athleteId, { medicalAlerts: updatedAlerts }, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', athleteId, undefined, 'medical_alert_removed');
    } catch (error) {
      console.error('Error removing medical alert:', error);
      throw error;
    }
  }

  async recordVitalSigns(athleteId: string, vitals: any, user: User): Promise<void> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id || !await this.hasHealthDataAccess(user)) {
        throw new Error('Health data access required for vital signs');
      }

      // Store vital signs in athlete's health tracking
      const vitalRecord = {
        date: new Date().toISOString(),
        recordedBy: user.id,
        ...vitals,
      };

      const athlete = await storage.getAthlete(athleteId, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      // TODO: Vital signs should be stored in a separate table
      // For now, we'll log the vital signs but can't store them on the athlete record
      console.log('Vital signs to be recorded:', vitalRecord);
      
      // Cannot update vitalSigns as property doesn't exist on Athlete schema
      // await storage.updateAthlete(athleteId, { vitalSigns: updatedVitals }, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', athleteId, undefined, 'vital_signs_recorded');
    } catch (error) {
      console.error('Error recording vital signs:', error);
      throw error;
    }
  }

  // Scheduling System Methods (placeholder implementations)
  async getSchedulingSlots(trainerId: string, dateRange: { start: string; end: string }): Promise<SchedulingSlot[]> {
    // TODO: Implement with actual storage
    return [];
  }

  async createSchedulingSlot(slot: Omit<SchedulingSlot, 'id'>, user: User): Promise<SchedulingSlot> {
    // TODO: Implement with actual storage
    return { ...slot, id: randomUUID() };
  }

  async bookAppointment(slotId: string, athleteId: string, notes?: string, user?: User): Promise<SchedulingSlot> {
    // TODO: Implement with actual storage
    throw new Error('Method not implemented');
  }

  async cancelAppointment(slotId: string, reason?: string, user?: User): Promise<void> {
    // TODO: Implement with actual storage
    throw new Error('Method not implemented');
  }

  async rescheduleAppointment(slotId: string, newSlotId: string, user?: User): Promise<SchedulingSlot> {
    // TODO: Implement with actual storage
    throw new Error('Method not implemented');
  }

  // Equipment & Inventory Management (placeholder implementations)
  async getEquipmentInventory(location?: string): Promise<EquipmentItem[]> {
    // TODO: Implement with actual storage
    return [];
  }

  async updateEquipmentStatus(equipmentId: string, status: EquipmentItem['status'], notes?: string, user?: User): Promise<void> {
    // TODO: Implement with actual storage
  }

  async scheduleEquipmentMaintenance(equipmentId: string, date: string, user?: User): Promise<void> {
    // TODO: Implement with actual storage
  }

  async getSupplyInventory(category?: string): Promise<InventoryItem[]> {
    // TODO: Implement with actual storage
    return [];
  }

  async updateInventoryStock(itemId: string, quantity: number, action: 'add' | 'subtract' | 'set', user?: User): Promise<void> {
    // TODO: Implement with actual storage
  }

  async createInventoryAlert(itemId: string, alert: InventoryItem['alerts'][0], user?: User): Promise<void> {
    // TODO: Implement with actual storage
  }

  // Communication & Notifications (placeholder implementations)
  async sendHealthCommunication(recipientId: string, message: any, user: User): Promise<void> {
    // TODO: Implement with health communication service
  }

  async getHealthCommunications(trainerId: string, filters?: any): Promise<any[]> {
    // TODO: Implement with health communication service
    return [];
  }

  async createEmergencyAlert(athleteId: string, alert: any, user: User): Promise<void> {
    // TODO: Implement emergency alert system
  }

  // Analytics & Reporting (placeholder implementations)
  async getHealthAnalytics(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<any> {
    // TODO: Implement analytics aggregation
    return {};
  }

  async getInjuryTrends(filters: any, user: User): Promise<any> {
    // TODO: Implement injury trend analysis
    return {};
  }

  async generateComplianceReport(organizationId: string, reportType: string, user: User): Promise<any> {
    // TODO: Implement compliance reporting
    return {};
  }

  // Private utility methods
  private async hasHealthDataAccess(user: User): Promise<boolean> {
    const healthRoles = [
      'district_athletic_trainer',
      'school_athletic_trainer',
      'district_athletic_director',
      'school_athletic_director'
    ];
    
    return healthRoles.includes(user.userRole || '') && 
           (user.hipaaTrainingCompleted || false) && 
           (user.medicalDataAccess || false);
  }
}

// Export singleton instance
export const athleticTrainerService = new AthleticTrainerServiceImpl();