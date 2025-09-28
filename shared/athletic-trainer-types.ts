/**
 * Athletic Trainer Types - Shared between frontend and backend
 * This file contains types that are imported by both server and client code
 */

export interface AthleteProfile {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    grade?: string;
    studentId?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
    parentGuardian?: {
      name: string;
      phone: string;
      email?: string;
    };
  };
  sportsInfo: {
    primarySport?: string;
    secondarySports?: string[];
    position?: string;
    eligibilityStatus: 'eligible' | 'ineligible' | 'pending';
    clearanceStatus: 'cleared' | 'not_cleared' | 'conditional' | 'expired';
    lastPhysicalDate?: string;
    nextPhysicalDue?: string;
  };
  healthInfo: {
    medicalAlerts: string[];
    currentInjuries: string[];
    injuryHistory: Array<{
      date: string;
      type: string;
      location: string;
      severity: string;
      status: string;
    }>;
    medications: string[];
    allergies: string[];
    riskFactors: string[];
    lastRiskAssessment?: string;
    riskScore?: number;
  };
  performanceTracking: {
    fitnessLevel?: 'excellent' | 'good' | 'fair' | 'poor';
    lastAssessmentDate?: string;
    notes?: string;
  };
  complianceInfo: {
    hipaaConsent: boolean;
    ferpaConsent: boolean;
    lastConsentUpdate?: string;
    dataRetentionDate?: string;
  };
}

export interface SchedulingSlot {
  id: string;
  athleticTrainerId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'evaluation' | 'treatment' | 'follow_up' | 'screening' | 'consultation' | 'emergency';
  status: 'available' | 'booked' | 'blocked' | 'completed' | 'cancelled';
  athleteId?: string;
  notes?: string;
  location?: string;
  equipment?: string[];
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: 'treatment' | 'diagnostic' | 'safety' | 'rehabilitation' | 'emergency';
  serialNumber?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken' | 'retired';
  lastMaintenance?: string;
  nextMaintenance?: string;
  location: string;
  assignedTo?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'medical_supplies' | 'first_aid' | 'tape_wrap' | 'ice_cold' | 'heat_therapy' | 'cleaning';
  currentStock: number;
  minimumStock: number;
  maxStock: number;
  unit: string;
  supplier?: string;
  lastRestocked?: string;
  expirationDate?: string;
  cost?: number;
  alerts: Array<{
    type: 'low_stock' | 'expired' | 'recall' | 'critical';
    message: string;
    date: string;
  }>;
}

export interface AthleticTrainerService {
  // Athlete Management
  getAthleteProfile(athleteId: string, user: any): Promise<AthleteProfile | null>;
  createAthleteProfile(athlete: Partial<AthleteProfile>, user: any): Promise<AthleteProfile>;
  updateAthleteProfile(athleteId: string, updates: Partial<AthleteProfile>, user: any): Promise<AthleteProfile>;
  getAthletesByTrainer(trainerId: string, user: any): Promise<AthleteProfile[]>;
  getAthletesByOrganization(organizationId: string, user: any): Promise<AthleteProfile[]>;
  searchAthletes(query: string, filters: any, user: any): Promise<AthleteProfile[]>;
  
  // Health Monitoring
  updateHealthStatus(athleteId: string, healthUpdate: any, user: any): Promise<void>;
  addMedicalAlert(athleteId: string, alert: string, user: any): Promise<void>;
  removeMedicalAlert(athleteId: string, alertId: string, user: any): Promise<void>;
  recordVitalSigns(athleteId: string, vitals: any, user: any): Promise<void>;
  
  // Scheduling System
  getSchedulingSlots(trainerId: string, dateRange: { start: string; end: string }): Promise<SchedulingSlot[]>;
  createSchedulingSlot(slot: Omit<SchedulingSlot, 'id'>, user: any): Promise<SchedulingSlot>;
  bookAppointment(slotId: string, athleteId: string, notes?: string, user?: any): Promise<SchedulingSlot>;
  cancelAppointment(slotId: string, reason?: string, user?: any): Promise<void>;
  rescheduleAppointment(slotId: string, newSlotId: string, user?: any): Promise<SchedulingSlot>;
  
  // Equipment & Inventory Management
  getEquipmentInventory(location?: string): Promise<EquipmentItem[]>;
  updateEquipmentStatus(equipmentId: string, status: EquipmentItem['status'], notes?: string, user?: any): Promise<void>;
  scheduleEquipmentMaintenance(equipmentId: string, date: string, user?: any): Promise<void>;
  
  getSupplyInventory(category?: string): Promise<InventoryItem[]>;
  updateInventoryStock(itemId: string, quantity: number, action: 'add' | 'subtract' | 'set', user?: any): Promise<void>;
  createInventoryAlert(itemId: string, alert: InventoryItem['alerts'][0], user?: any): Promise<void>;
  
  // Communication & Notifications
  sendHealthCommunication(recipientId: string, message: any, user: any): Promise<void>;
  getHealthCommunications(trainerId: string, filters?: any): Promise<any[]>;
  createEmergencyAlert(athleteId: string, alert: any, user: any): Promise<void>;
  
  // Analytics & Reporting
  getHealthAnalytics(organizationId: string, dateRange: { start: string; end: string }, user: any): Promise<any>;
  getInjuryTrends(filters: any, user: any): Promise<any>;
  generateComplianceReport(organizationId: string, reportType: string, user: any): Promise<any>;
}