import { randomUUID } from "crypto";
import { getStorage } from "./storage";
import { HealthDataEncryption, HealthDataAudit } from "./data-encryption";
import { logComplianceAction } from "./complianceMiddleware";
import { aiHealthAnalyticsService } from "./ai-health-analytics";
import { healthAlertService } from "./health-alert-system";
import type { 
  User, 
  Athlete,
  HealthRiskAssessment,
  InjuryIncident,
  MedicalHistory 
} from "@shared/schema";

export interface MedicalConsultation {
  id: string;
  athleteId: string;
  athleteName?: string;
  organizationId: string;
  consultationType: 'symptom_analysis' | 'injury_assessment' | 'return_to_play' | 'preventive_care' | 'emergency_guidance' | 'protocol_lookup' | 'differential_diagnosis';
  status: 'in_progress' | 'completed' | 'requires_physician' | 'emergency_referral' | 'follow_up_needed';
  priority: 'routine' | 'urgent' | 'immediate' | 'emergency';
  
  // Input Information
  chiefComplaint: string;
  symptoms: Array<{
    symptom: string;
    severity: 'mild' | 'moderate' | 'severe' | 'critical';
    duration: string;
    onset: 'sudden' | 'gradual' | 'chronic';
    location?: string;
    triggers?: string[];
    relievingFactors?: string[];
    associatedSymptoms?: string[];
  }>;
  
  currentVitals?: {
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    painScale?: number; // 1-10
  };
  
  contextualInformation: {
    activityAtOnset?: string;
    previousSimilarEpisodes?: boolean;
    recentInjuries?: string[];
    currentMedications?: string[];
    relevantMedicalHistory?: string[];
    environmentalFactors?: string[];
  };
  
  // AI Analysis Results
  analysis: {
    preliminaryAssessment: string;
    differentialDiagnosis: Array<{
      condition: string;
      probability: number; // 0-1
      reasoning: string;
      supportingEvidence: string[];
      contradictingEvidence: string[];
    }>;
    riskAssessment: {
      severityLevel: 'low' | 'moderate' | 'high' | 'critical' | 'life_threatening';
      urgencyLevel: 'routine' | 'urgent' | 'immediate' | 'emergent';
      risksIfUntreated: string[];
      timelineForDetermination: string;
    };
    redFlags: Array<{
      flag: string;
      significance: 'concerning' | 'serious' | 'critical' | 'life_threatening';
      action: string;
    }>;
  };
  
  // Recommendations
  recommendations: {
    immediateActions: string[];
    furtherEvaluation: string[];
    treatmentOptions: Array<{
      option: string;
      rationale: string;
      contraindications?: string[];
      expectedOutcome: string;
      timeframe: string;
    }>;
    activityRestrictions: Array<{
      restriction: string;
      duration: string;
      rationale: string;
    }>;
    monitoringInstructions: string[];
    followUpSchedule: Array<{
      timeframe: string;
      purpose: string;
      provider: string;
    }>;
    returnToPlayCriteria?: string[];
  };
  
  // Professional Referrals
  referrals: Array<{
    specialty: string;
    urgency: 'routine' | 'urgent' | 'stat';
    reason: string;
    specificConcerns: string[];
    suggestedTimeframe: string;
  }>;
  
  // Educational Information
  educationProvided: {
    conditionExplanation: string;
    preventionStrategies: string[];
    warningSignsToWatch: string[];
    recoveryExpectations: string;
  };
  
  // Protocols and Guidelines
  protocolsReferenced: Array<{
    protocolId: string;
    protocolName: string;
    relevantSections: string[];
    adherenceNotes: string;
  }>;
  
  // Quality Assurance
  confidenceLevel: number; // 0-1
  limitationsAcknowledged: string[];
  disclaimers: string[];
  
  // Tracking
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
  physicianOverride?: {
    providerId: string;
    notes: string;
    modifiedRecommendations: string[];
    timestamp: string;
  };
  
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MedicalProtocol {
  id: string;
  name: string;
  category: 'injury_management' | 'return_to_play' | 'emergency_procedures' | 'preventive_care' | 'concussion_management' | 'environmental_illness';
  sport?: string; // Sport-specific protocols
  description: string;
  
  // Protocol Steps
  steps: Array<{
    step: number;
    phase: string;
    description: string;
    criteria: string[];
    actions: string[];
    timeframe: string;
    nextStep: string;
    alternativeActions?: string[];
  }>;
  
  // Decision Trees
  decisionPoints: Array<{
    question: string;
    responses: Array<{
      response: string;
      nextAction: string;
      reasoning: string;
    }>;
  }>;
  
  // Safety Considerations
  contraindications: string[];
  redFlags: string[];
  emergencyProcedures: string[];
  
  // Evidence Base
  evidenceLevel: 'expert_opinion' | 'case_series' | 'cohort_study' | 'randomized_trial' | 'systematic_review' | 'meta_analysis';
  lastUpdated: string;
  approvedBy: string;
  
  // Usage Tracking
  timesUsed: number;
  successRate: number;
  userFeedback: number; // 1-5 rating
}

export interface SymptomAnalysisResult {
  analysisId: string;
  symptoms: string[];
  
  // Pattern Recognition
  symptomClusters: Array<{
    cluster: string;
    symptoms: string[];
    significance: string;
    commonCauses: string[];
  }>;
  
  // Risk Stratification
  emergencyIndicators: Array<{
    indicator: string;
    severity: 'mild_concern' | 'moderate_concern' | 'serious_concern' | 'emergency';
    action: string;
  }>;
  
  // System-Based Analysis
  systemsInvolved: Array<{
    system: 'cardiovascular' | 'respiratory' | 'neurological' | 'musculoskeletal' | 'gastrointestinal' | 'endocrine' | 'psychiatric';
    symptoms: string[];
    concernLevel: 'low' | 'moderate' | 'high' | 'critical';
  }>;
  
  // Temporal Analysis
  acuityAssessment: {
    onset: 'acute' | 'subacute' | 'chronic';
    progression: 'improving' | 'stable' | 'worsening' | 'fluctuating';
    temporalPattern: 'constant' | 'intermittent' | 'episodic' | 'cyclical';
  };
  
  // Recommendations
  triageCategory: 'self_care' | 'routine_care' | 'urgent_care' | 'emergency_care';
  recommendedTimeline: string;
  workupSuggestions: string[];
}

export interface ReturnToPlayAssessment {
  assessmentId: string;
  athleteId: string;
  injuryType: string;
  injuryDate: string;
  currentPhase: 'acute' | 'healing' | 'reconditioning' | 'sport_specific' | 'cleared';
  
  // Clearance Criteria
  physicalCriteria: Array<{
    criterion: string;
    status: 'met' | 'partial' | 'not_met' | 'not_applicable';
    notes: string;
    testResults?: any;
  }>;
  
  functionalCriteria: Array<{
    test: string;
    baseline?: number;
    current: number;
    percentOfBaseline: number;
    passingThreshold: number;
    status: 'pass' | 'conditional' | 'fail';
  }>;
  
  psychologicalReadiness: {
    fearOfReinjury: 'low' | 'moderate' | 'high' | 'severe';
    confidence: number; // 1-10
    motivation: number; // 1-10
    concernAreas: string[];
  };
  
  // Medical Clearance
  medicalClearance: {
    required: boolean;
    obtained: boolean;
    provider?: string;
    restrictions?: string[];
    specialConsiderations?: string[];
  };
  
  // Progressive Loading
  progressionPlan: Array<{
    phase: string;
    duration: string;
    activities: string[];
    intensityLevel: number; // 1-10
    successCriteria: string[];
    modificationOptions: string[];
  }>;
  
  // Risk Assessment
  reinjuryRisk: {
    probability: number; // 0-1
    riskFactors: string[];
    mitigationStrategies: string[];
  };
  
  // Final Recommendation
  recommendation: 'full_clearance' | 'conditional_clearance' | 'modified_participation' | 'continued_rehabilitation' | 'medical_referral';
  recommendationRationale: string;
  followUpSchedule: string[];
  
  // Tracking
  assessedBy: string;
  assessmentDate: string;
  nextReviewDate: string;
}

export interface MedicalReference {
  id: string;
  title: string;
  category: 'anatomy' | 'pathology' | 'treatment' | 'pharmacology' | 'diagnostics' | 'emergency_procedures';
  keywords: string[];
  content: {
    definition: string;
    clinicalPresentation: string[];
    differentialDiagnosis: string[];
    riskFactors: string[];
    diagnosticCriteria: string[];
    treatmentOptions: string[];
    prognosis: string;
    complications: string[];
    preventionStrategies: string[];
  };
  
  // Sport-Specific Information
  sportConsiderations?: {
    sport: string;
    specificRisks: string[];
    modifications: string[];
    returnToCriteria: string[];
  }[];
  
  evidenceLevel: string;
  lastUpdated: string;
  sources: string[];
}

export interface MedicalConsultationService {
  // Core Consultation Functions
  startConsultation(request: Partial<MedicalConsultation>, user: User): Promise<MedicalConsultation>;
  updateConsultation(consultationId: string, updates: Partial<MedicalConsultation>, user: User): Promise<MedicalConsultation>;
  completeConsultation(consultationId: string, finalNotes: string, user: User): Promise<MedicalConsultation>;
  getConsultation(consultationId: string, user: User): Promise<MedicalConsultation | null>;
  getAthleteConsultations(athleteId: string, user: User): Promise<MedicalConsultation[]>;
  
  // Symptom Analysis
  analyzeSymptoms(symptoms: string[], context: any, user: User): Promise<SymptomAnalysisResult>;
  performDifferentialDiagnosis(symptoms: string[], history: any, user: User): Promise<MedicalConsultation['analysis']['differentialDiagnosis']>;
  assessSymptomSeverity(symptoms: any[], user: User): Promise<{ severity: string; urgency: string; redFlags: string[] }>;
  
  // Injury Assessment
  assessInjury(injuryData: any, user: User): Promise<{
    severity: string;
    expectedRecoveryTime: number;
    treatmentRecommendations: string[];
    complications: string[];
  }>;
  
  provideInjuryGuidance(injuryType: string, severity: string, athlete: Athlete, user: User): Promise<{
    immediateActions: string[];
    treatmentProtocol: string[];
    expectedTimeline: string;
    monitoringPlan: string[];
  }>;
  
  // Return-to-Play Assessment
  assessReturnToPlay(athleteId: string, injuryId: string, user: User): Promise<ReturnToPlayAssessment>;
  updateReturnToPlayStatus(assessmentId: string, updates: Partial<ReturnToPlayAssessment>, user: User): Promise<ReturnToPlayAssessment>;
  generateReturnToPlayProtocol(injuryType: string, sport: string, user: User): Promise<ReturnToPlayAssessment['progressionPlan']>;
  clearForReturn(assessmentId: string, clearanceNotes: string, user: User): Promise<ReturnToPlayAssessment>;
  
  // Medical Protocol Management
  getProtocol(protocolId: string, user: User): Promise<MedicalProtocol | null>;
  searchProtocols(query: string, filters: any, user: User): Promise<MedicalProtocol[]>;
  executeProtocol(protocolId: string, context: any, user: User): Promise<{
    steps: string[];
    recommendations: string[];
    nextActions: string[];
  }>;
  
  updateProtocolUsage(protocolId: string, outcome: string, feedback: number, user: User): Promise<void>;
  
  // Medical Reference System
  lookupMedicalCondition(condition: string, user: User): Promise<MedicalReference | null>;
  searchMedicalReferences(query: string, category?: string, user: User): Promise<MedicalReference[]>;
  getMedicalGuidance(topic: string, context: any, user: User): Promise<{
    guidance: string;
    recommendations: string[];
    references: string[];
  }>;
  
  // Emergency Guidance
  provideEmergencyGuidance(emergencyType: string, context: any, user: User): Promise<{
    immediateActions: string[];
    emergencyProtocol: string[];
    contraindications: string[];
    monitoringInstructions: string[];
  }>;
  
  assessEmergencyStatus(symptoms: string[], vitals: any, user: User): Promise<{
    isEmergency: boolean;
    severity: string;
    recommendedActions: string[];
    timeframe: string;
  }>;
  
  // AI-Powered Insights
  generateHealthInsights(athleteId: string, user: User): Promise<{
    insights: string[];
    recommendations: string[];
    preventiveActions: string[];
    riskFactors: string[];
  }>;
  
  providePredictiveGuidance(athleteId: string, scenario: string, user: User): Promise<{
    prediction: string;
    confidence: number;
    recommendations: string[];
    preventiveActions: string[];
  }>;
  
  // Integration Hooks
  onNewSymptoms(athleteId: string, symptoms: string[], user: User): Promise<MedicalConsultation>;
  onInjuryOccurrence(athleteId: string, injury: InjuryIncident, user: User): Promise<MedicalConsultation>;
  onVitalSignsAlert(athleteId: string, vitals: any, alertType: string, user: User): Promise<MedicalConsultation>;
}

/**
 * AI-Powered Medical Consultation Assistant
 * Provides intelligent medical guidance, symptom analysis, and treatment recommendations
 */
export class MedicalConsultationServiceImpl implements MedicalConsultationService {
  private storage = getStorage();
  private protocols: Map<string, MedicalProtocol> = new Map();
  private medicalReferences: Map<string, MedicalReference> = new Map();
  private consultations: Map<string, MedicalConsultation> = new Map();
  
  constructor() {
    console.log('🏥 Medical Consultation AI Assistant (Rule-based decision support - NOT medical diagnosis) initialized');
    this.initializeMedicalProtocols();
    this.initializeMedicalReferences();
  }

  private async initializeMedicalProtocols(): Promise<void> {
    // Initialize standard medical protocols for athletic training
    const protocols: MedicalProtocol[] = [
      {
        id: 'concussion_management',
        name: 'Concussion Management Protocol',
        category: 'concussion_management',
        description: 'Comprehensive concussion assessment and management protocol',
        steps: [
          {
            step: 1,
            phase: 'Immediate Assessment',
            description: 'Remove athlete from play and conduct immediate evaluation',
            criteria: ['Suspected head injury', 'Loss of consciousness', 'Confusion', 'Memory problems'],
            actions: [
              'Remove from activity immediately',
              'Assess consciousness level',
              'Check for cervical spine injury',
              'Perform baseline neurological assessment',
              'Notify emergency contacts if severe'
            ],
            timeframe: 'Immediate',
            nextStep: 'Emergency evaluation or baseline testing'
          },
          {
            step: 2,
            phase: 'Baseline Testing',
            description: 'Conduct comprehensive baseline concussion testing',
            criteria: ['Alert and oriented', 'No severe symptoms', 'Stable vital signs'],
            actions: [
              'Administer SCAT-5 or similar tool',
              'Perform cognitive assessment',
              'Test balance and coordination',
              'Document all findings',
              'Establish symptom baseline'
            ],
            timeframe: '30-60 minutes',
            nextStep: 'Serial monitoring and reassessment'
          },
          {
            step: 3,
            phase: 'Serial Monitoring',
            description: 'Monitor for symptom progression and complications',
            criteria: ['Completed baseline testing', 'Stable neurological status'],
            actions: [
              'Monitor every 15-30 minutes initially',
              'Watch for deteriorating symptoms',
              'Document symptom progression',
              'Educate athlete and family',
              'Provide clear return criteria'
            ],
            timeframe: 'First 24-48 hours',
            nextStep: 'Gradual return-to-play protocol'
          }
        ],
        decisionPoints: [
          {
            question: 'Does the athlete show signs of severe head injury?',
            responses: [
              {
                response: 'Yes - loss of consciousness >30 seconds, severe confusion, vomiting',
                nextAction: 'Emergency transport to hospital',
                reasoning: 'Potential serious brain injury requiring immediate medical evaluation'
              },
              {
                response: 'No - mild symptoms, alert and oriented',
                nextAction: 'Continue with baseline testing',
                reasoning: 'Mild concussion can be managed with standard protocol'
              }
            ]
          }
        ],
        contraindications: [
          'Suspected cervical spine injury',
          'Deteriorating neurological status',
          'Persistent vomiting',
          'Severe headache unresponsive to rest'
        ],
        redFlags: [
          'Repeated vomiting',
          'Increasing confusion',
          'Severe or worsening headache',
          'Loss of consciousness',
          'Seizures',
          'Unequal pupils'
        ],
        emergencyProcedures: [
          'Call 911 if severe symptoms',
          'Stabilize cervical spine',
          'Monitor airway and breathing',
          'Document all assessments'
        ],
        evidenceLevel: 'systematic_review',
        lastUpdated: new Date().toISOString(),
        approvedBy: 'Medical Director',
        timesUsed: 0,
        successRate: 0.95,
        userFeedback: 4.8
      },
      {
        id: 'acute_injury_assessment',
        name: 'Acute Injury Assessment Protocol',
        category: 'injury_management',
        description: 'Systematic approach to acute musculoskeletal injury assessment',
        steps: [
          {
            step: 1,
            phase: 'Primary Assessment',
            description: 'Initial injury evaluation and stabilization',
            criteria: ['Acute injury occurred', 'Athlete conscious and responsive'],
            actions: [
              'Ensure scene safety',
              'Assess athlete responsiveness',
              'Check for life-threatening injuries',
              'Stabilize injured area',
              'Control bleeding if present'
            ],
            timeframe: 'First 5 minutes',
            nextStep: 'Secondary assessment'
          },
          {
            step: 2,
            phase: 'Secondary Assessment',
            description: 'Detailed injury evaluation',
            criteria: ['No life-threatening injuries', 'Athlete stable'],
            actions: [
              'Obtain injury history',
              'Perform visual inspection',
              'Palpate injured area',
              'Test range of motion',
              'Assess function and stability'
            ],
            timeframe: '10-15 minutes',
            nextStep: 'Treatment planning'
          },
          {
            step: 3,
            phase: 'Initial Treatment',
            description: 'Implement immediate treatment measures',
            criteria: ['Assessment completed', 'Treatment plan established'],
            actions: [
              'Apply RICE protocol',
              'Provide pain management',
              'Protect injured area',
              'Document findings',
              'Plan follow-up care'
            ],
            timeframe: 'Ongoing',
            nextStep: 'Referral or continued monitoring'
          }
        ],
        decisionPoints: [
          {
            question: 'Is there evidence of fracture or dislocation?',
            responses: [
              {
                response: 'Yes - deformity, severe pain, inability to bear weight',
                nextAction: 'Immobilize and transport for imaging',
                reasoning: 'Potential fracture requires medical evaluation and imaging'
              },
              {
                response: 'No - soft tissue injury, able to move',
                nextAction: 'Conservative treatment and monitoring',
                reasoning: 'Soft tissue injuries can often be managed conservatively'
              }
            ]
          }
        ],
        contraindications: [
          'Open fracture',
          'Neurovascular compromise',
          'Suspected internal injuries'
        ],
        redFlags: [
          'Severe deformity',
          'Loss of pulse',
          'Numbness or tingling',
          'Severe pain out of proportion',
          'Signs of infection'
        ],
        emergencyProcedures: [
          'Immobilize suspected fractures',
          'Control bleeding',
          'Monitor vital signs',
          'Prepare for transport if needed'
        ],
        evidenceLevel: 'expert_opinion',
        lastUpdated: new Date().toISOString(),
        approvedBy: 'Athletic Training Director',
        timesUsed: 0,
        successRate: 0.92,
        userFeedback: 4.6
      },
      {
        id: 'heat_illness_management',
        name: 'Heat Illness Management Protocol',
        category: 'environmental_illness',
        description: 'Recognition and management of heat-related illnesses',
        steps: [
          {
            step: 1,
            phase: 'Recognition',
            description: 'Identify signs and symptoms of heat illness',
            criteria: ['Hot environment', 'Physical exertion', 'Concerning symptoms'],
            actions: [
              'Assess core temperature if possible',
              'Evaluate mental status',
              'Check for profuse sweating or absence',
              'Monitor vital signs',
              'Assess hydration status'
            ],
            timeframe: 'Immediate',
            nextStep: 'Severity classification'
          },
          {
            step: 2,
            phase: 'Classification',
            description: 'Determine severity of heat illness',
            criteria: ['Initial assessment completed'],
            actions: [
              'Classify as heat cramps, exhaustion, or stroke',
              'Assess level of consciousness',
              'Determine treatment urgency',
              'Begin cooling measures',
              'Prepare for potential emergency transport'
            ],
            timeframe: '5-10 minutes',
            nextStep: 'Targeted treatment'
          },
          {
            step: 3,
            phase: 'Treatment',
            description: 'Implement appropriate cooling and support measures',
            criteria: ['Heat illness severity determined'],
            actions: [
              'Remove from heat source',
              'Begin aggressive cooling',
              'Provide fluid replacement if conscious',
              'Monitor core temperature',
              'Prepare for medical transport if severe'
            ],
            timeframe: 'Until resolution or transport',
            nextStep: 'Recovery monitoring'
          }
        ],
        decisionPoints: [
          {
            question: 'What is the core body temperature?',
            responses: [
              {
                response: '>104°F (40°C) with altered mental status',
                nextAction: 'Emergency cooling and immediate transport',
                reasoning: 'Heat stroke is life-threatening and requires emergency intervention'
              },
              {
                response: '100-104°F with normal mental status',
                nextAction: 'Aggressive cooling and monitoring',
                reasoning: 'Heat exhaustion requires immediate cooling but may not need transport'
              }
            ]
          }
        ],
        contraindications: [
          'Do not give fluids if unconscious',
          'Avoid overcooling below 101°F',
          'Do not leave athlete unattended'
        ],
        redFlags: [
          'Altered mental status',
          'Core temperature >104°F',
          'Absence of sweating with high temperature',
          'Rapid pulse with low blood pressure',
          'Nausea and vomiting'
        ],
        emergencyProcedures: [
          'Call 911 for heat stroke',
          'Begin immediate cooling',
          'Monitor airway and breathing',
          'Prepare for IV fluid replacement'
        ],
        evidenceLevel: 'randomized_trial',
        lastUpdated: new Date().toISOString(),
        approvedBy: 'Medical Director',
        timesUsed: 0,
        successRate: 0.98,
        userFeedback: 4.9
      },
      {
        id: 'return_to_play_protocol',
        name: 'General Return-to-Play Protocol',
        category: 'return_to_play',
        description: 'Systematic approach to safe return-to-play decisions',
        steps: [
          {
            step: 1,
            phase: 'Medical Clearance',
            description: 'Obtain appropriate medical clearance',
            criteria: ['Injury rehabilitation progressing', 'Symptoms resolved'],
            actions: [
              'Review medical documentation',
              'Confirm physician clearance if required',
              'Verify adherence to treatment plan',
              'Document current status',
              'Assess psychological readiness'
            ],
            timeframe: 'Before progression',
            nextStep: 'Functional assessment'
          },
          {
            step: 2,
            phase: 'Functional Testing',
            description: 'Assess functional capacity for sport demands',
            criteria: ['Medical clearance obtained', 'Basic function restored'],
            actions: [
              'Test sport-specific movements',
              'Assess strength and power',
              'Evaluate endurance capacity',
              'Test balance and proprioception',
              'Document objective measures'
            ],
            timeframe: '1-2 sessions',
            nextStep: 'Progressive activity'
          },
          {
            step: 3,
            phase: 'Progressive Return',
            description: 'Gradual return to full participation',
            criteria: ['Functional testing passed', 'No symptoms during testing'],
            actions: [
              'Begin low-intensity activity',
              'Progress intensity gradually',
              'Monitor for symptom recurrence',
              'Assess performance quality',
              'Maintain regular communication'
            ],
            timeframe: 'Variable based on injury',
            nextStep: 'Full clearance'
          }
        ],
        decisionPoints: [
          {
            question: 'Does the athlete meet all return criteria?',
            responses: [
              {
                response: 'Yes - all criteria met, no symptoms',
                nextAction: 'Clear for full participation',
                reasoning: 'Safe return with minimal reinjury risk'
              },
              {
                response: 'No - some criteria not met or symptoms present',
                nextAction: 'Continue rehabilitation and reassess',
                reasoning: 'Premature return increases reinjury risk'
              }
            ]
          }
        ],
        contraindications: [
          'Persistent symptoms',
          'Incomplete rehabilitation',
          'Lack of medical clearance',
          'Psychological concerns'
        ],
        redFlags: [
          'Symptom recurrence with activity',
          'Compensatory movement patterns',
          'Fear of reinjury',
          'Incomplete range of motion',
          'Strength deficits'
        ],
        emergencyProcedures: [
          'Stop activity if symptoms return',
          'Reassess injury status',
          'Return to previous phase',
          'Seek medical consultation'
        ],
        evidenceLevel: 'cohort_study',
        lastUpdated: new Date().toISOString(),
        approvedBy: 'Athletic Training Director',
        timesUsed: 0,
        successRate: 0.89,
        userFeedback: 4.7
      }
    ];

    // Store protocols
    for (const protocol of protocols) {
      this.protocols.set(protocol.id, protocol);
    }

    console.log(`📋 Initialized ${protocols.length} medical protocols`);
  }

  private async initializeMedicalReferences(): Promise<void> {
    // Initialize medical reference database
    const references: MedicalReference[] = [
      {
        id: 'concussion_overview',
        title: 'Concussion: Definition and Clinical Presentation',
        category: 'pathology',
        keywords: ['concussion', 'traumatic brain injury', 'head injury', 'mTBI'],
        content: {
          definition: 'A traumatic brain injury induced by biomechanical forces, resulting in temporary functional neurological impairment',
          clinicalPresentation: [
            'Headache',
            'Confusion or feeling "in a fog"',
            'Amnesia surrounding the traumatic event',
            'Dizziness or balance problems',
            'Nausea or vomiting',
            'Sensitivity to light or noise',
            'Feeling sluggish, hazy, or groggy',
            'Concentration or memory problems',
            'Sleep disturbances'
          ],
          differentialDiagnosis: [
            'Cervical spine injury',
            'Intracranial hemorrhage',
            'Skull fracture',
            'Post-traumatic stress reaction',
            'Migraine headache',
            'Vestibular dysfunction'
          ],
          riskFactors: [
            'Previous concussion history',
            'Contact or collision sports',
            'Poor neck strength',
            'Female gender (in some sports)',
            'Younger age',
            'Genetic factors (APOE4)'
          ],
          diagnosticCriteria: [
            'Direct or indirect blow to head',
            'Rapid onset of neurological symptoms',
            'Symptoms may or may not involve loss of consciousness',
            'Symptoms typically resolve spontaneously',
            'No abnormality on standard neuroimaging'
          ],
          treatmentOptions: [
            'Initial rest (24-48 hours)',
            'Gradual return to activity',
            'Cognitive rest',
            'Symptom management',
            'Graduated return-to-play protocol',
            'Neuropsychological testing if needed'
          ],
          prognosis: 'Most athletes recover within 7-10 days; some may have prolonged symptoms',
          complications: [
            'Post-concussion syndrome',
            'Second impact syndrome',
            'Chronic traumatic encephalopathy',
            'Depression and anxiety',
            'Cognitive impairment'
          ],
          preventionStrategies: [
            'Proper equipment fitting',
            'Rule enforcement',
            'Neck strengthening programs',
            'Education on concussion risks',
            'Baseline testing',
            'Safe playing techniques'
          ]
        },
        sportConsiderations: [
          {
            sport: 'football',
            specificRisks: ['High-speed collisions', 'Repetitive head impacts'],
            modifications: ['Improved helmet technology', 'Tackling technique training'],
            returnToCriteria: ['Complete symptom resolution', 'Neuropsychological testing clearance']
          },
          {
            sport: 'soccer',
            specificRisks: ['Ball-to-head contact', 'Player-to-player collisions'],
            modifications: ['Heading restrictions for youth', 'Better field conditions'],
            returnToCriteria: ['Symptom-free at rest and exertion', 'Balance testing normal']
          }
        ],
        evidenceLevel: 'Consensus statement (Zurich 2016)',
        lastUpdated: new Date().toISOString(),
        sources: [
          'McCrory et al. Consensus statement on concussion in sport. Br J Sports Med. 2017',
          'Giza et al. The new neurometabolic cascade of concussion. Neurosurgery. 2014'
        ]
      },
      {
        id: 'ankle_sprain_management',
        title: 'Ankle Sprain: Assessment and Management',
        category: 'injury_management',
        keywords: ['ankle sprain', 'lateral ankle', 'ATFL', 'inversion injury'],
        content: {
          definition: 'Stretching or tearing of ligaments around the ankle joint, most commonly the lateral ligament complex',
          clinicalPresentation: [
            'Pain over lateral ankle',
            'Swelling and bruising',
            'Difficulty weight bearing',
            'Reduced range of motion',
            'Joint instability',
            'Tenderness over ligaments'
          ],
          differentialDiagnosis: [
            'Ankle fracture',
            'Syndesmotic injury',
            'Peroneal tendon injury',
            'Osteochondral lesion',
            'Tarsal coalition',
            'Stress fracture'
          ],
          riskFactors: [
            'Previous ankle sprain',
            'Poor proprioception',
            'Muscle weakness',
            'Poor balance',
            'Inappropriate footwear',
            'Uneven playing surfaces'
          ],
          diagnosticCriteria: [
            'Mechanism of inversion injury',
            'Pain and swelling over lateral ankle',
            'Positive anterior drawer test',
            'Positive talar tilt test',
            'Ottawa ankle rules for fracture screening'
          ],
          treatmentOptions: [
            'RICE protocol (Rest, Ice, Compression, Elevation)',
            'Early mobilization',
            'Progressive strengthening',
            'Proprioceptive training',
            'Functional bracing',
            'Return to sport progression'
          ],
          prognosis: 'Most grade I-II sprains heal in 2-6 weeks with proper treatment',
          complications: [
            'Chronic ankle instability',
            'Recurrent sprains',
            'Arthritis',
            'Chronic pain',
            'Functional limitations'
          ],
          preventionStrategies: [
            'Proprioceptive training',
            'Strength training',
            'Proper warm-up',
            'Ankle bracing',
            'Proper footwear',
            'Playing surface maintenance'
          ]
        },
        sportConsiderations: [
          {
            sport: 'basketball',
            specificRisks: ['Landing injuries', 'Cutting movements', 'Player contact'],
            modifications: ['High-top shoes', 'Ankle taping/bracing'],
            returnToCriteria: ['Pain-free weight bearing', 'Full range of motion', 'Functional testing passed']
          }
        ],
        evidenceLevel: 'Clinical practice guidelines',
        lastUpdated: new Date().toISOString(),
        sources: [
          'Delahunt et al. Clinical assessment of acute lateral ankle sprain injuries. J Orthop Sports Phys Ther. 2018',
          'Vuurberg et al. Diagnosis, treatment and prevention of ankle sprains. Br J Sports Med. 2018'
        ]
      },
      {
        id: 'heat_exhaustion',
        title: 'Heat Exhaustion: Recognition and Treatment',
        category: 'emergency_procedures',
        keywords: ['heat exhaustion', 'hyperthermia', 'environmental illness', 'dehydration'],
        content: {
          definition: 'A heat-related illness characterized by elevated body temperature and systemic symptoms due to heat exposure and inadequate heat dissipation',
          clinicalPresentation: [
            'Core temperature 100-104°F (37.8-40°C)',
            'Profuse sweating',
            'Weakness and fatigue',
            'Nausea and vomiting',
            'Headache',
            'Muscle cramps',
            'Dizziness',
            'Rapid pulse'
          ],
          differentialDiagnosis: [
            'Heat stroke',
            'Dehydration',
            'Viral illness',
            'Exercise-associated collapse',
            'Hyponatremia',
            'Drug reaction'
          ],
          riskFactors: [
            'High ambient temperature and humidity',
            'Inadequate acclimatization',
            'Dehydration',
            'Obesity',
            'Poor fitness level',
            'Certain medications',
            'Previous heat illness'
          ],
          diagnosticCriteria: [
            'Elevated core temperature <104°F',
            'Normal mental status',
            'Profuse sweating typically present',
            'History of heat exposure',
            'Systemic symptoms present'
          ],
          treatmentOptions: [
            'Remove from heat source',
            'Aggressive cooling measures',
            'Oral rehydration if conscious',
            'Monitor vital signs',
            'Rest in cool environment',
            'Gradual return to activity'
          ],
          prognosis: 'Excellent with prompt recognition and treatment',
          complications: [
            'Progression to heat stroke',
            'Electrolyte imbalances',
            'Dehydration',
            'Increased susceptibility to future heat illness'
          ],
          preventionStrategies: [
            'Gradual heat acclimatization',
            'Adequate hydration',
            'Appropriate clothing',
            'Activity modification in extreme heat',
            'Regular breaks in shade',
            'Education on heat illness signs'
          ]
        },
        evidenceLevel: 'Clinical guidelines',
        lastUpdated: new Date().toISOString(),
        sources: [
          'Casa et al. National Athletic Trainers Association position statement: Exertional heat illnesses. J Athl Train. 2015',
          'Armstrong et al. American College of Sports Medicine position stand: Exertional heat illness. Med Sci Sports Exerc. 2007'
        ]
      }
    ];

    // Store references
    for (const reference of references) {
      this.medicalReferences.set(reference.id, reference);
    }

    console.log(`📚 Initialized ${references.length} medical references`);
  }

  // Core Consultation Functions
  async startConsultation(request: Partial<MedicalConsultation>, user: User): Promise<MedicalConsultation> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for medical consultation');
      }

      // Get athlete information
      const athlete = await storage.getAthlete(request.athleteId!, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      // Create consultation
      const consultation: MedicalConsultation = {
        id: randomUUID(),
        athleteId: request.athleteId!,
        athleteName: `${athlete.firstName} ${athlete.lastName}`,
        organizationId: request.organizationId || athlete.organizationId || user.organizationId!,
        consultationType: request.consultationType || 'symptom_analysis',
        status: 'in_progress',
        priority: request.priority || 'routine',
        
        // Input Information
        chiefComplaint: request.chiefComplaint || 'Health concern',
        symptoms: request.symptoms || [],
        currentVitals: request.currentVitals,
        contextualInformation: request.contextualInformation || {},
        
        // AI Analysis Results (to be populated)
        analysis: {
          preliminaryAssessment: '',
          differentialDiagnosis: [],
          riskAssessment: {
            severityLevel: 'low',
            urgencyLevel: 'routine',
            risksIfUntreated: [],
            timelineForDetermination: ''
          },
          redFlags: []
        },
        
        // Recommendations (to be populated)
        recommendations: {
          immediateActions: [],
          furtherEvaluation: [],
          treatmentOptions: [],
          activityRestrictions: [],
          monitoringInstructions: [],
          followUpSchedule: [],
          returnToPlayCriteria: []
        },
        
        // Professional Referrals
        referrals: [],
        
        // Educational Information
        educationProvided: {
          conditionExplanation: '',
          preventionStrategies: [],
          warningSignsToWatch: [],
          recoveryExpectations: ''
        },
        
        // Protocols and Guidelines
        protocolsReferenced: [],
        
        // Quality Assurance
        confidenceLevel: 0.5,
        limitationsAcknowledged: [
          'This is a preliminary assessment and not a substitute for professional medical evaluation',
          'AI recommendations should be verified by qualified medical personnel',
          'Individual patient factors may not be fully captured in automated analysis'
        ],
        disclaimers: [
          'Seek immediate medical attention for emergency symptoms',
          'This consultation does not establish a doctor-patient relationship',
          'Recommendations are based on general medical principles and may not apply to specific cases'
        ],
        
        // Tracking
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Perform initial AI analysis if symptoms provided
      if (request.symptoms && request.symptoms.length > 0) {
        await this.performInitialAnalysis(consultation, user);
      }

      // Store consultation
      this.consultations.set(consultation.id, consultation);

      // Log compliance action
      await logComplianceAction(
        user.id, 
        'data_modification', 
        'health_data', 
        consultation.id, 
        `Medical consultation started: ${consultation.consultationType}`
      );

      return consultation;

    } catch (error: any) {
      console.error('Start consultation error:', error);
      throw new Error(`Failed to start consultation: ${error.message}`);
    }
  }

  private async performInitialAnalysis(consultation: MedicalConsultation, user: User): Promise<void> {
    try {
      // Extract symptoms for analysis
      const symptomList = consultation.symptoms.map(s => s.symptom);
      
      // Perform symptom analysis
      const symptomAnalysis = await this.analyzeSymptoms(symptomList, consultation.contextualInformation, user);
      
      // Generate differential diagnosis
      const differentialDx = await this.performDifferentialDiagnosis(
        symptomList, 
        consultation.contextualInformation, 
        user
      );
      
      // Assess severity and urgency
      const severityAssessment = await this.assessSymptomSeverity(consultation.symptoms, user);
      
      // Update consultation with analysis
      consultation.analysis = {
        preliminaryAssessment: this.generatePreliminaryAssessment(symptomAnalysis, consultation),
        differentialDiagnosis: differentialDx,
        riskAssessment: {
          severityLevel: severityAssessment.severity as any,
          urgencyLevel: severityAssessment.urgency as any,
          risksIfUntreated: this.identifyRisksIfUntreated(differentialDx),
          timelineForDetermination: this.determineTimeline(severityAssessment.severity)
        },
        redFlags: severityAssessment.redFlags.map(flag => ({
          flag,
          significance: 'concerning' as any,
          action: `Evaluate ${flag} immediately`
        }))
      };
      
      // Generate recommendations
      consultation.recommendations = await this.generateRecommendations(consultation, symptomAnalysis, user);
      
      // Update confidence based on analysis quality
      consultation.confidenceLevel = this.calculateConfidenceLevel(consultation);
      
      consultation.updatedAt = new Date().toISOString();

    } catch (error) {
      console.error('Initial analysis error:', error);
    }
  }

  private generatePreliminaryAssessment(symptomAnalysis: SymptomAnalysisResult, consultation: MedicalConsultation): string {
    const primarySymptoms = consultation.symptoms.slice(0, 3).map(s => s.symptom).join(', ');
    const systemsInvolved = symptomAnalysis.systemsInvolved.map(s => s.system).join(', ');
    
    return `Based on presenting symptoms of ${primarySymptoms}, this appears to involve the ${systemsInvolved} system(s). ` +
           `The symptoms are ${symptomAnalysis.acuityAssessment.onset} in onset and ${symptomAnalysis.acuityAssessment.progression} in nature. ` +
           `Triage category: ${symptomAnalysis.triageCategory}. Further evaluation is recommended as outlined below.`;
  }

  private identifyRisksIfUntreated(differentialDx: MedicalConsultation['analysis']['differentialDiagnosis']): string[] {
    const risks: string[] = [];
    
    for (const dx of differentialDx) {
      if (dx.probability > 0.3) {
        // Add condition-specific risks
        if (dx.condition.toLowerCase().includes('concussion')) {
          risks.push('Second impact syndrome', 'Prolonged recovery', 'Cognitive impairment');
        } else if (dx.condition.toLowerCase().includes('heat')) {
          risks.push('Progression to heat stroke', 'Organ damage', 'Death');
        } else if (dx.condition.toLowerCase().includes('fracture')) {
          risks.push('Displacement', 'Non-union', 'Chronic pain');
        } else {
          risks.push('Symptom progression', 'Functional limitation', 'Chronic condition');
        }
      }
    }
    
    return Array.from(new Set(risks)).slice(0, 5);
  }

  private determineTimeline(severity: string): string {
    const timelineMap: Record<string, string> = {
      'low': 'Monitor over 24-48 hours',
      'moderate': 'Reassess within 24 hours',
      'high': 'Evaluate within 2-4 hours',
      'critical': 'Immediate evaluation required',
      'life_threatening': 'Emergency intervention required'
    };
    
    return timelineMap[severity] || 'Monitor as clinically indicated';
  }

  private async generateRecommendations(
    consultation: MedicalConsultation, 
    symptomAnalysis: SymptomAnalysisResult, 
    user: User
  ): Promise<MedicalConsultation['recommendations']> {
    const recommendations: MedicalConsultation['recommendations'] = {
      immediateActions: [],
      furtherEvaluation: [],
      treatmentOptions: [],
      activityRestrictions: [],
      monitoringInstructions: [],
      followUpSchedule: [],
      returnToPlayCriteria: []
    };

    // Generate immediate actions based on symptoms
    if (consultation.symptoms.some(s => s.severity === 'critical' || s.severity === 'severe')) {
      recommendations.immediateActions.push(
        'Remove athlete from activity immediately',
        'Monitor vital signs closely',
        'Ensure athlete safety and comfort'
      );
    }

    // Generate based on triage category
    switch (symptomAnalysis.triageCategory) {
      case 'emergency_care':
        recommendations.immediateActions.push(
          'Call 911 or transport to emergency department',
          'Monitor airway, breathing, circulation',
          'Notify emergency contacts'
        );
        break;
      case 'urgent_care':
        recommendations.immediateActions.push(
          'Arrange urgent medical evaluation',
          'Do not leave athlete unattended',
          'Prepare for potential transport'
        );
        break;
      case 'routine_care':
        recommendations.immediateActions.push(
          'Complete thorough assessment',
          'Document all findings',
          'Implement conservative measures'
        );
        break;
    }

    // Add activity restrictions
    if (consultation.consultationType === 'injury_assessment') {
      recommendations.activityRestrictions.push({
        restriction: 'No participation in contact/collision activities',
        duration: 'Until medical clearance',
        rationale: 'Prevent further injury during healing'
      });
    }

    // Add monitoring instructions
    recommendations.monitoringInstructions.push(
      'Monitor for symptom progression',
      'Document any changes in condition',
      'Reassess every 15-30 minutes initially'
    );

    // Add follow-up schedule
    recommendations.followUpSchedule.push({
      timeframe: 'Within 24 hours',
      purpose: 'Reassess symptoms and progress',
      provider: 'Athletic trainer or physician'
    });

    return recommendations;
  }

  private calculateConfidenceLevel(consultation: MedicalConsultation): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on available data
    if (consultation.symptoms.length >= 3) confidence += 0.1;
    if (consultation.currentVitals) confidence += 0.1;
    if (consultation.contextualInformation.relevantMedicalHistory?.length) confidence += 0.1;
    if (consultation.analysis.differentialDiagnosis.length >= 2) confidence += 0.1;

    // Decrease confidence for critical symptoms (requires physician evaluation)
    if (consultation.symptoms.some(s => s.severity === 'critical')) confidence -= 0.2;

    return Math.min(Math.max(confidence, 0.2), 0.8); // Keep between 20-80%
  }

  async updateConsultation(consultationId: string, updates: Partial<MedicalConsultation>, user: User): Promise<MedicalConsultation> {
    try {
      if (!user.id) {
        throw new Error('User context required for consultation update');
      }

      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      // Update consultation
      const updatedConsultation: MedicalConsultation = {
        ...consultation,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.consultations.set(consultationId, updatedConsultation);

      await logComplianceAction(user.id, 'data_modification', 'health_data', consultationId, 'Consultation updated');

      return updatedConsultation;

    } catch (error: any) {
      console.error('Update consultation error:', error);
      throw new Error(`Failed to update consultation: ${error.message}`);
    }
  }

  async completeConsultation(consultationId: string, finalNotes: string, user: User): Promise<MedicalConsultation> {
    try {
      if (!user.id) {
        throw new Error('User context required for consultation completion');
      }

      const consultation = this.consultations.get(consultationId);
      if (!consultation) {
        throw new Error('Consultation not found');
      }

      // Complete consultation
      const completedConsultation: MedicalConsultation = {
        ...consultation,
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add final notes to preliminary assessment
      if (finalNotes) {
        completedConsultation.analysis.preliminaryAssessment += `\n\nFinal Notes: ${finalNotes}`;
      }

      this.consultations.set(consultationId, completedConsultation);

      await logComplianceAction(user.id, 'data_modification', 'health_data', consultationId, 'Consultation completed');

      return completedConsultation;

    } catch (error: any) {
      console.error('Complete consultation error:', error);
      throw new Error(`Failed to complete consultation: ${error.message}`);
    }
  }

  async getConsultation(consultationId: string, user: User): Promise<MedicalConsultation | null> {
    try {
      if (!user.id) {
        throw new Error('User context required for consultation access');
      }

      const consultation = this.consultations.get(consultationId);
      
      if (consultation) {
        await logComplianceAction(user.id, 'data_access', 'health_data', consultationId, 'Consultation accessed');
      }

      return consultation || null;

    } catch (error: any) {
      console.error('Get consultation error:', error);
      throw new Error(`Failed to get consultation: ${error.message}`);
    }
  }

  async getAthleteConsultations(athleteId: string, user: User): Promise<MedicalConsultation[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for athlete consultations access');
      }

      // Filter consultations by athlete
      const consultations = Array.from(this.consultations.values()).filter(
        c => c.athleteId === athleteId
      );

      await logComplianceAction(user.id, 'data_access', 'health_data', athleteId, 'Athlete consultations accessed');

      return consultations;

    } catch (error: any) {
      console.error('Get athlete consultations error:', error);
      throw new Error(`Failed to get athlete consultations: ${error.message}`);
    }
  }

  // Symptom Analysis
  async analyzeSymptoms(symptoms: string[], context: any, user: User): Promise<SymptomAnalysisResult> {
    try {
      if (!user.id) {
        throw new Error('User context required for symptom analysis');
      }

      const analysis: SymptomAnalysisResult = {
        analysisId: randomUUID(),
        symptoms,
        
        // Pattern Recognition
        symptomClusters: this.identifySymptomClusters(symptoms),
        
        // Risk Stratification
        emergencyIndicators: this.identifyEmergencyIndicators(symptoms),
        
        // System-Based Analysis
        systemsInvolved: this.identifySystemsInvolved(symptoms),
        
        // Temporal Analysis
        acuityAssessment: this.assessAcuity(symptoms, context),
        
        // Recommendations
        triageCategory: this.determineTriageCategory(symptoms),
        recommendedTimeline: this.getRecommendedTimeline(symptoms),
        workupSuggestions: this.generateWorkupSuggestions(symptoms)
      };

      await logComplianceAction(user.id, 'data_access', 'health_data', 'symptom_analysis', 'Symptom analysis performed');

      return analysis;

    } catch (error: any) {
      console.error('Analyze symptoms error:', error);
      throw new Error(`Failed to analyze symptoms: ${error.message}`);
    }
  }

  private identifySymptomClusters(symptoms: string[]): SymptomAnalysisResult['symptomClusters'] {
    const clusters: SymptomAnalysisResult['symptomClusters'] = [];

    // Neurological cluster
    const neuroSymptoms = symptoms.filter(s => 
      ['headache', 'dizziness', 'confusion', 'memory problems', 'balance problems', 'nausea'].includes(s.toLowerCase())
    );
    if (neuroSymptoms.length >= 2) {
      clusters.push({
        cluster: 'Neurological',
        symptoms: neuroSymptoms,
        significance: 'Possible brain injury or neurological condition',
        commonCauses: ['Concussion', 'Migraine', 'Vestibular dysfunction']
      });
    }

    // Musculoskeletal cluster
    const musculoskeletalSymptoms = symptoms.filter(s => 
      ['pain', 'swelling', 'stiffness', 'limited motion', 'instability', 'weakness'].includes(s.toLowerCase())
    );
    if (musculoskeletalSymptoms.length >= 2) {
      clusters.push({
        cluster: 'Musculoskeletal',
        symptoms: musculoskeletalSymptoms,
        significance: 'Possible injury to muscles, bones, or joints',
        commonCauses: ['Sprain', 'Strain', 'Fracture', 'Contusion']
      });
    }

    // Heat illness cluster
    const heatSymptoms = symptoms.filter(s => 
      ['hot skin', 'excessive sweating', 'nausea', 'vomiting', 'weakness', 'confusion'].includes(s.toLowerCase())
    );
    if (heatSymptoms.length >= 2) {
      clusters.push({
        cluster: 'Heat Illness',
        symptoms: heatSymptoms,
        significance: 'Possible heat-related illness',
        commonCauses: ['Heat exhaustion', 'Heat stroke', 'Dehydration']
      });
    }

    return clusters;
  }

  private identifyEmergencyIndicators(symptoms: string[]): SymptomAnalysisResult['emergencyIndicators'] {
    const indicators: SymptomAnalysisResult['emergencyIndicators'] = [];

    // Critical neurological symptoms
    const criticalNeuroSymptoms = ['loss of consciousness', 'severe confusion', 'repeated vomiting', 'seizures'];
    for (const symptom of criticalNeuroSymptoms) {
      if (symptoms.some(s => s.toLowerCase().includes(symptom))) {
        indicators.push({
          indicator: symptom,
          severity: 'emergency',
          action: 'Call 911 immediately'
        });
      }
    }

    // Severe heat illness symptoms
    const heatEmergencySymptoms = ['hot dry skin', 'altered mental status', 'high body temperature'];
    for (const symptom of heatEmergencySymptoms) {
      if (symptoms.some(s => s.toLowerCase().includes(symptom))) {
        indicators.push({
          indicator: symptom,
          severity: 'emergency',
          action: 'Begin immediate cooling and call 911'
        });
      }
    }

    // Serious injury indicators
    const seriousInjurySymptoms = ['severe deformity', 'numbness', 'loss of pulse', 'bone protruding'];
    for (const symptom of seriousInjurySymptoms) {
      if (symptoms.some(s => s.toLowerCase().includes(symptom))) {
        indicators.push({
          indicator: symptom,
          severity: 'serious_concern',
          action: 'Immobilize and transport for emergency evaluation'
        });
      }
    }

    return indicators;
  }

  private identifySystemsInvolved(symptoms: string[]): SymptomAnalysisResult['systemsInvolved'] {
    const systems: SymptomAnalysisResult['systemsInvolved'] = [];

    // Neurological system
    const neuroSymptoms = symptoms.filter(s => 
      ['headache', 'dizziness', 'confusion', 'memory', 'balance', 'vision', 'hearing'].some(ns => 
        s.toLowerCase().includes(ns)
      )
    );
    if (neuroSymptoms.length > 0) {
      systems.push({
        system: 'neurological',
        symptoms: neuroSymptoms,
        concernLevel: neuroSymptoms.length >= 3 ? 'high' : neuroSymptoms.length >= 2 ? 'moderate' : 'low'
      });
    }

    // Musculoskeletal system
    const mskSymptoms = symptoms.filter(s => 
      ['pain', 'swelling', 'stiffness', 'weakness', 'instability', 'deformity'].some(ms => 
        s.toLowerCase().includes(ms)
      )
    );
    if (mskSymptoms.length > 0) {
      systems.push({
        system: 'musculoskeletal',
        symptoms: mskSymptoms,
        concernLevel: mskSymptoms.some(s => s.includes('severe')) ? 'high' : 'moderate'
      });
    }

    // Cardiovascular system
    const cardioSymptoms = symptoms.filter(s => 
      ['chest pain', 'shortness of breath', 'palpitations', 'rapid pulse'].some(cs => 
        s.toLowerCase().includes(cs)
      )
    );
    if (cardioSymptoms.length > 0) {
      systems.push({
        system: 'cardiovascular',
        symptoms: cardioSymptoms,
        concernLevel: 'high' // Always high concern for cardiac symptoms
      });
    }

    // Respiratory system
    const respSymptoms = symptoms.filter(s => 
      ['breathing', 'cough', 'wheeze', 'chest tightness'].some(rs => 
        s.toLowerCase().includes(rs)
      )
    );
    if (respSymptoms.length > 0) {
      systems.push({
        system: 'respiratory',
        symptoms: respSymptoms,
        concernLevel: respSymptoms.some(s => s.includes('severe')) ? 'high' : 'moderate'
      });
    }

    return systems;
  }

  private assessAcuity(symptoms: string[], context: any): SymptomAnalysisResult['acuityAssessment'] {
    // Assess onset
    let onset: 'acute' | 'subacute' | 'chronic' = 'acute';
    if (context.duration) {
      if (context.duration.includes('week') || context.duration.includes('month')) {
        onset = context.duration.includes('month') ? 'chronic' : 'subacute';
      }
    }

    // Assess progression
    let progression: 'improving' | 'stable' | 'worsening' | 'fluctuating' = 'stable';
    if (context.progression) {
      progression = context.progression;
    } else if (symptoms.some(s => s.includes('worsening') || s.includes('getting worse'))) {
      progression = 'worsening';
    }

    // Assess temporal pattern
    let temporalPattern: 'constant' | 'intermittent' | 'episodic' | 'cyclical' = 'constant';
    if (context.pattern) {
      temporalPattern = context.pattern;
    } else if (symptoms.some(s => s.includes('comes and goes') || s.includes('intermittent'))) {
      temporalPattern = 'intermittent';
    }

    return { onset, progression, temporalPattern };
  }

  private determineTriageCategory(symptoms: string[]): SymptomAnalysisResult['triageCategory'] {
    // Emergency indicators
    const emergencySymptoms = [
      'loss of consciousness', 'severe confusion', 'difficulty breathing', 'chest pain',
      'severe bleeding', 'signs of shock', 'severe head injury'
    ];
    
    if (symptoms.some(s => emergencySymptoms.some(es => s.toLowerCase().includes(es)))) {
      return 'emergency_care';
    }

    // Urgent care indicators
    const urgentSymptoms = [
      'moderate confusion', 'persistent vomiting', 'severe pain', 'signs of fracture',
      'heat exhaustion', 'moderate breathing difficulty'
    ];
    
    if (symptoms.some(s => urgentSymptoms.some(us => s.toLowerCase().includes(us)))) {
      return 'urgent_care';
    }

    // Routine care indicators
    const routineSymptoms = [
      'mild pain', 'minor swelling', 'slight stiffness', 'minor cuts', 'mild headache'
    ];
    
    if (symptoms.some(s => routineSymptoms.some(rs => s.toLowerCase().includes(rs)))) {
      return 'routine_care';
    }

    // Default to routine care
    return 'routine_care';
  }

  private getRecommendedTimeline(symptoms: string[]): string {
    const triageCategory = this.determineTriageCategory(symptoms);
    
    const timelineMap = {
      'emergency_care': 'Immediate evaluation required',
      'urgent_care': 'Evaluation within 1-2 hours',
      'routine_care': 'Evaluation within 24-48 hours',
      'self_care': 'Monitor and reassess in 2-3 days'
    };
    
    return timelineMap[triageCategory];
  }

  private generateWorkupSuggestions(symptoms: string[]): string[] {
    const suggestions: string[] = [];

    // Neurological workup
    if (symptoms.some(s => ['headache', 'confusion', 'dizziness'].some(ns => s.toLowerCase().includes(ns)))) {
      suggestions.push('Neurological assessment including cognitive testing');
      suggestions.push('Balance and coordination testing');
    }

    // Musculoskeletal workup
    if (symptoms.some(s => ['pain', 'swelling', 'deformity'].some(ms => s.toLowerCase().includes(ms)))) {
      suggestions.push('Physical examination of affected area');
      suggestions.push('Range of motion and strength testing');
      suggestions.push('Consider imaging if fracture suspected');
    }

    // Vital signs
    if (symptoms.some(s => ['fever', 'weakness', 'dizziness'].some(vs => s.toLowerCase().includes(vs)))) {
      suggestions.push('Complete vital signs assessment');
    }

    return suggestions;
  }

  async performDifferentialDiagnosis(symptoms: string[], history: any, user: User): Promise<MedicalConsultation['analysis']['differentialDiagnosis']> {
    try {
      const differentials: MedicalConsultation['analysis']['differentialDiagnosis'] = [];

      // Neurological conditions
      if (symptoms.some(s => ['headache', 'confusion', 'dizziness', 'nausea'].some(ns => s.toLowerCase().includes(ns)))) {
        differentials.push({
          condition: 'Concussion',
          probability: 0.7,
          reasoning: 'Cluster of neurological symptoms consistent with traumatic brain injury',
          supportingEvidence: symptoms.filter(s => ['headache', 'confusion', 'dizziness'].some(ns => s.toLowerCase().includes(ns))),
          contradictingEvidence: []
        });

        differentials.push({
          condition: 'Migraine',
          probability: 0.3,
          reasoning: 'Headache with associated neurological symptoms',
          supportingEvidence: symptoms.filter(s => s.toLowerCase().includes('headache')),
          contradictingEvidence: []
        });
      }

      // Heat-related conditions
      if (symptoms.some(s => ['hot', 'sweating', 'weakness', 'nausea'].some(hs => s.toLowerCase().includes(hs)))) {
        differentials.push({
          condition: 'Heat Exhaustion',
          probability: 0.6,
          reasoning: 'Symptoms consistent with heat-related illness',
          supportingEvidence: symptoms.filter(s => ['hot', 'sweating', 'weakness'].some(hs => s.toLowerCase().includes(hs))),
          contradictingEvidence: []
        });

        if (symptoms.some(s => s.toLowerCase().includes('confusion') || s.toLowerCase().includes('altered mental'))) {
          differentials.push({
            condition: 'Heat Stroke',
            probability: 0.8,
            reasoning: 'Heat symptoms with altered mental status suggest heat stroke',
            supportingEvidence: symptoms.filter(s => ['confusion', 'hot', 'altered'].some(hs => s.toLowerCase().includes(hs))),
            contradictingEvidence: []
          });
        }
      }

      // Musculoskeletal conditions
      if (symptoms.some(s => ['pain', 'swelling', 'limited motion'].some(ms => s.toLowerCase().includes(ms)))) {
        differentials.push({
          condition: 'Soft Tissue Injury',
          probability: 0.6,
          reasoning: 'Pain and swelling suggest soft tissue involvement',
          supportingEvidence: symptoms.filter(s => ['pain', 'swelling'].some(ms => s.toLowerCase().includes(ms))),
          contradictingEvidence: []
        });

        if (symptoms.some(s => s.toLowerCase().includes('deformity') || s.toLowerCase().includes('unable to bear weight'))) {
          differentials.push({
            condition: 'Fracture',
            probability: 0.7,
            reasoning: 'Deformity or inability to bear weight suggests possible fracture',
            supportingEvidence: symptoms.filter(s => ['deformity', 'severe pain'].some(fs => s.toLowerCase().includes(fs))),
            contradictingEvidence: []
          });
        }
      }

      // Sort by probability
      differentials.sort((a, b) => b.probability - a.probability);

      await logComplianceAction(user.id, 'data_access', 'health_data', 'differential_diagnosis', 'Differential diagnosis performed');

      return differentials.slice(0, 5); // Return top 5 differentials

    } catch (error: any) {
      console.error('Differential diagnosis error:', error);
      throw new Error(`Failed to perform differential diagnosis: ${error.message}`);
    }
  }

  async assessSymptomSeverity(symptoms: any[], user: User): Promise<{ severity: string; urgency: string; redFlags: string[] }> {
    try {
      let severity = 'low';
      let urgency = 'routine';
      const redFlags: string[] = [];

      // Check for severe symptoms
      for (const symptom of symptoms) {
        if (symptom.severity === 'critical' || symptom.severity === 'severe') {
          severity = 'high';
          urgency = 'immediate';
        }

        // Check for specific red flags
        if (symptom.symptom.toLowerCase().includes('loss of consciousness')) {
          redFlags.push('Loss of consciousness');
          severity = 'critical';
          urgency = 'emergency';
        }

        if (symptom.symptom.toLowerCase().includes('difficulty breathing')) {
          redFlags.push('Respiratory distress');
          severity = 'critical';
          urgency = 'emergency';
        }

        if (symptom.symptom.toLowerCase().includes('chest pain')) {
          redFlags.push('Chest pain');
          severity = 'high';
          urgency = 'immediate';
        }

        if (symptom.symptom.toLowerCase().includes('severe confusion')) {
          redFlags.push('Altered mental status');
          severity = 'high';
          urgency = 'immediate';
        }
      }

      await logComplianceAction(user.id, 'data_access', 'health_data', 'severity_assessment', 'Symptom severity assessed');

      return { severity, urgency, redFlags };

    } catch (error: any) {
      console.error('Assess symptom severity error:', error);
      throw new Error(`Failed to assess symptom severity: ${error.message}`);
    }
  }

  // Injury Assessment
  async assessInjury(injuryData: any, user: User): Promise<{
    severity: string;
    expectedRecoveryTime: number;
    treatmentRecommendations: string[];
    complications: string[];
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for injury assessment');
      }

      // Assess severity based on injury characteristics
      const severity = this.determineInjurySeverity(injuryData);
      
      // Estimate recovery time
      const expectedRecoveryTime = this.estimateRecoveryTime(injuryData.injuryType, severity);
      
      // Generate treatment recommendations
      const treatmentRecommendations = this.generateTreatmentRecommendations(injuryData.injuryType, severity);
      
      // Identify potential complications
      const complications = this.identifyPotentialComplications(injuryData.injuryType, severity);

      await logComplianceAction(user.id, 'data_access', 'health_data', 'injury_assessment', 'Injury assessment performed');

      return {
        severity,
        expectedRecoveryTime,
        treatmentRecommendations,
        complications
      };

    } catch (error: any) {
      console.error('Assess injury error:', error);
      throw new Error(`Failed to assess injury: ${error.message}`);
    }
  }

  private determineInjurySeverity(injuryData: any): string {
    // Check for severe indicators
    if (injuryData.symptoms?.includes('severe deformity') || 
        injuryData.symptoms?.includes('loss of function') ||
        injuryData.symptoms?.includes('neurovascular compromise')) {
      return 'severe';
    }

    // Check for moderate indicators
    if (injuryData.symptoms?.includes('significant swelling') ||
        injuryData.symptoms?.includes('marked pain') ||
        injuryData.symptoms?.includes('instability')) {
      return 'moderate';
    }

    // Default to mild
    return 'mild';
  }

  private estimateRecoveryTime(injuryType: string, severity: string): number {
    // Recovery time matrix (days)
    const recoveryMatrix: Record<string, Record<string, number>> = {
      'sprain': { 'mild': 7, 'moderate': 21, 'severe': 42 },
      'strain': { 'mild': 5, 'moderate': 14, 'severe': 28 },
      'contusion': { 'mild': 3, 'moderate': 7, 'severe': 14 },
      'fracture': { 'mild': 28, 'moderate': 42, 'severe': 84 },
      'concussion': { 'mild': 7, 'moderate': 14, 'severe': 28 },
      'dislocation': { 'mild': 14, 'moderate': 28, 'severe': 56 }
    };

    const injuryKey = injuryType.toLowerCase();
    return recoveryMatrix[injuryKey]?.[severity] || 14; // Default 2 weeks
  }

  private generateTreatmentRecommendations(injuryType: string, severity: string): string[] {
    const recommendations: string[] = [];

    // General recommendations
    recommendations.push('RICE protocol (Rest, Ice, Compression, Elevation)');
    recommendations.push('Pain management as needed');
    recommendations.push('Gradual return to activity');

    // Injury-specific recommendations
    if (injuryType.toLowerCase().includes('sprain')) {
      recommendations.push('Joint protection and stabilization');
      recommendations.push('Progressive range of motion exercises');
      recommendations.push('Strengthening exercises when appropriate');
    }

    if (injuryType.toLowerCase().includes('concussion')) {
      recommendations.push('Cognitive and physical rest');
      recommendations.push('Gradual return-to-play protocol');
      recommendations.push('Neuropsychological testing if indicated');
    }

    // Severity-specific recommendations
    if (severity === 'severe') {
      recommendations.push('Immediate medical evaluation');
      recommendations.push('Consider advanced imaging');
      recommendations.push('Specialist consultation');
    }

    return recommendations;
  }

  private identifyPotentialComplications(injuryType: string, severity: string): string[] {
    const complications: string[] = [];

    // General complications
    if (severity === 'severe') {
      complications.push('Chronic pain');
      complications.push('Functional limitation');
      complications.push('Re-injury risk');
    }

    // Injury-specific complications
    if (injuryType.toLowerCase().includes('sprain')) {
      complications.push('Joint instability');
      complications.push('Arthritis');
    }

    if (injuryType.toLowerCase().includes('concussion')) {
      complications.push('Post-concussion syndrome');
      complications.push('Cognitive impairment');
      complications.push('Increased susceptibility to future concussions');
    }

    return complications;
  }

  async provideInjuryGuidance(injuryType: string, severity: string, athlete: Athlete, user: User): Promise<{
    immediateActions: string[];
    treatmentProtocol: string[];
    expectedTimeline: string;
    monitoringPlan: string[];
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for injury guidance');
      }

      // Generate immediate actions
      const immediateActions = this.generateImmediateActions(injuryType, severity);
      
      // Generate treatment protocol
      const treatmentProtocol = await this.generateTreatmentProtocol(injuryType, severity, athlete);
      
      // Determine expected timeline
      const expectedTimeline = this.generateExpectedTimeline(injuryType, severity);
      
      // Create monitoring plan
      const monitoringPlan = this.generateMonitoringPlan(injuryType, severity);

      await logComplianceAction(user.id, 'data_access', 'health_data', athlete.id, 'Injury guidance provided');

      return {
        immediateActions,
        treatmentProtocol,
        expectedTimeline,
        monitoringPlan
      };

    } catch (error: any) {
      console.error('Provide injury guidance error:', error);
      throw new Error(`Failed to provide injury guidance: ${error.message}`);
    }
  }

  private generateImmediateActions(injuryType: string, severity: string): string[] {
    const actions: string[] = [];

    // Universal immediate actions
    actions.push('Remove athlete from activity');
    actions.push('Assess injury severity');
    actions.push('Provide initial first aid');

    // Severity-specific actions
    if (severity === 'severe') {
      actions.push('Call for emergency medical assistance');
      actions.push('Immobilize injured area');
      actions.push('Monitor vital signs');
    } else {
      actions.push('Apply ice and compression');
      actions.push('Elevate if possible');
      actions.push('Document injury details');
    }

    // Injury-specific actions
    if (injuryType.toLowerCase().includes('head') || injuryType.toLowerCase().includes('concussion')) {
      actions.push('Assess consciousness level');
      actions.push('Check for cervical spine injury');
      actions.push('Remove from play immediately');
    }

    return actions;
  }

  private async generateTreatmentProtocol(injuryType: string, severity: string, athlete: Athlete): Promise<string[]> {
    const protocol: string[] = [];

    // Look up specific protocol if available
    const relevantProtocols = Array.from(this.protocols.values()).filter(p => 
      p.name.toLowerCase().includes(injuryType.toLowerCase())
    );

    if (relevantProtocols.length > 0) {
      const primaryProtocol = relevantProtocols[0];
      for (const step of primaryProtocol.steps) {
        protocol.push(`${step.phase}: ${step.description}`);
      }
    } else {
      // Generate generic protocol
      protocol.push('Phase 1: Acute management and pain control');
      protocol.push('Phase 2: Early mobilization and gentle exercises');
      protocol.push('Phase 3: Progressive strengthening and conditioning');
      protocol.push('Phase 4: Sport-specific training and return preparation');
    }

    return protocol;
  }

  private generateExpectedTimeline(injuryType: string, severity: string): string {
    const recoveryDays = this.estimateRecoveryTime(injuryType, severity);
    
    if (recoveryDays <= 7) {
      return `Expected recovery: ${recoveryDays} days with proper treatment`;
    } else if (recoveryDays <= 28) {
      return `Expected recovery: ${Math.ceil(recoveryDays / 7)} weeks with progressive rehabilitation`;
    } else {
      return `Expected recovery: ${Math.ceil(recoveryDays / 30)} months with comprehensive treatment`;
    }
  }

  private generateMonitoringPlan(injuryType: string, severity: string): string[] {
    const plan: string[] = [];

    // Universal monitoring
    plan.push('Monitor pain levels and functional improvement');
    plan.push('Assess for signs of complications');
    plan.push('Track adherence to treatment plan');

    // Severity-specific monitoring
    if (severity === 'severe') {
      plan.push('Daily assessment for first week');
      plan.push('Monitor for signs of infection or deterioration');
      plan.push('Regular communication with medical team');
    } else {
      plan.push('Weekly progress assessments');
      plan.push('Monitor response to treatment');
    }

    // Injury-specific monitoring
    if (injuryType.toLowerCase().includes('concussion')) {
      plan.push('Monitor cognitive function');
      plan.push('Assess symptom progression');
      plan.push('Track return-to-activity tolerance');
    }

    return plan;
  }

  // Return-to-Play Assessment
  async assessReturnToPlay(athleteId: string, injuryId: string, user: User): Promise<ReturnToPlayAssessment> {
    try {
      const storage = await this.storage;
      
      if (!user.id) {
        throw new Error('User context required for return-to-play assessment');
      }

      // Get athlete and injury information
      const [athlete, injury] = await Promise.all([
        storage.getAthlete(athleteId, user),
        storage.getInjuryIncident(injuryId, user)
      ]);

      if (!athlete || !injury) {
        throw new Error('Athlete or injury not found');
      }

      // Create return-to-play assessment
      const assessment: ReturnToPlayAssessment = {
        assessmentId: randomUUID(),
        athleteId,
        injuryType: injury.injuryType,
        injuryDate: injury.incidentDate,
        currentPhase: this.determineCurrentPhase(injury),
        
        // Clearance Criteria
        physicalCriteria: this.generatePhysicalCriteria(injury.injuryType),
        functionalCriteria: this.generateFunctionalCriteria(injury.injuryType, athlete.sport),
        
        psychologicalReadiness: {
          fearOfReinjury: 'moderate',
          confidence: 7,
          motivation: 8,
          concernAreas: []
        },
        
        // Medical Clearance
        medicalClearance: {
          required: this.requiresMedicalClearance(injury.injurySeverity),
          obtained: false
        },
        
        // Progressive Loading
        progressionPlan: await this.generateReturnToPlayProtocol(injury.injuryType, athlete.sport || '', user),
        
        // Risk Assessment
        reinjuryRisk: {
          probability: this.calculateReinjuryRisk(injury, athlete),
          riskFactors: this.identifyReinjuryRiskFactors(injury, athlete),
          mitigationStrategies: this.generateMitigationStrategies(injury.injuryType)
        },
        
        // Final Recommendation
        recommendation: 'continued_rehabilitation',
        recommendationRationale: 'Assessment in progress, continue rehabilitation until all criteria met',
        followUpSchedule: ['Weekly assessment until cleared'],
        
        // Tracking
        assessedBy: user.id,
        assessmentDate: new Date().toISOString(),
        nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week
      };

      await logComplianceAction(user.id, 'data_modification', 'health_data', assessment.assessmentId, 'Return-to-play assessment created');

      return assessment;

    } catch (error: any) {
      console.error('Assess return to play error:', error);
      throw new Error(`Failed to assess return to play: ${error.message}`);
    }
  }

  private determineCurrentPhase(injury: any): ReturnToPlayAssessment['currentPhase'] {
    const daysSinceInjury = Math.floor((Date.now() - new Date(injury.incidentDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceInjury < 3) return 'acute';
    if (daysSinceInjury < 14) return 'healing';
    if (daysSinceInjury < 28) return 'reconditioning';
    return 'sport_specific';
  }

  private generatePhysicalCriteria(injuryType: string): ReturnToPlayAssessment['physicalCriteria'] {
    const criteria: ReturnToPlayAssessment['physicalCriteria'] = [];

    // Universal criteria
    criteria.push({
      criterion: 'Pain-free at rest',
      status: 'not_met',
      notes: 'Assessment needed'
    });

    criteria.push({
      criterion: 'Full range of motion',
      status: 'not_met',
      notes: 'Assessment needed'
    });

    criteria.push({
      criterion: 'Normal strength',
      status: 'not_met',
      notes: 'Assessment needed'
    });

    // Injury-specific criteria
    if (injuryType.toLowerCase().includes('ankle')) {
      criteria.push({
        criterion: 'Single-leg balance >30 seconds',
        status: 'not_met',
        notes: 'Assessment needed'
      });
    }

    if (injuryType.toLowerCase().includes('knee')) {
      criteria.push({
        criterion: 'Hop test symmetry >90%',
        status: 'not_met',
        notes: 'Assessment needed'
      });
    }

    if (injuryType.toLowerCase().includes('concussion')) {
      criteria.push({
        criterion: 'Symptom-free at rest',
        status: 'not_met',
        notes: 'Assessment needed'
      });

      criteria.push({
        criterion: 'Normal neurological examination',
        status: 'not_met',
        notes: 'Assessment needed'
      });
    }

    return criteria;
  }

  private generateFunctionalCriteria(injuryType: string, sport?: string): ReturnToPlayAssessment['functionalCriteria'] {
    const criteria: ReturnToPlayAssessment['functionalCriteria'] = [];

    // General functional tests
    criteria.push({
      test: 'Pain Scale (0-10)',
      baseline: 0,
      current: 5,
      percentOfBaseline: 0,
      passingThreshold: 0,
      status: 'fail'
    });

    if (injuryType.toLowerCase().includes('lower')) {
      criteria.push({
        test: 'Single Leg Hop Distance (cm)',
        baseline: 200,
        current: 150,
        percentOfBaseline: 75,
        passingThreshold: 90,
        status: 'fail'
      });
    }

    // Sport-specific criteria
    if (sport?.toLowerCase().includes('basketball')) {
      criteria.push({
        test: 'Vertical Jump (cm)',
        baseline: 60,
        current: 45,
        percentOfBaseline: 75,
        passingThreshold: 90,
        status: 'fail'
      });
    }

    return criteria;
  }

  private requiresMedicalClearance(severity?: string): boolean {
    return ['major', 'severe', 'catastrophic'].includes(severity || '');
  }

  private calculateReinjuryRisk(injury: any, athlete: any): number {
    let risk = 0.2; // Base risk

    // Previous injuries increase risk
    if (athlete.injuryHistory?.length > 0) {
      risk += athlete.injuryHistory.length * 0.1;
    }

    // Severity affects risk
    const severityRisk = {
      'minor': 0.1,
      'moderate': 0.2,
      'major': 0.3,
      'severe': 0.4
    };
    risk += severityRisk[injury.injurySeverity as keyof typeof severityRisk] || 0.2;

    return Math.min(risk, 0.8); // Cap at 80%
  }

  private identifyReinjuryRiskFactors(injury: any, athlete: any): string[] {
    const factors: string[] = [];

    if (athlete.injuryHistory?.length > 0) {
      factors.push('Previous injury history');
    }

    if (injury.injurySeverity === 'severe') {
      factors.push('Severe initial injury');
    }

    factors.push('Incomplete rehabilitation');
    factors.push('Premature return to activity');
    factors.push('Poor compliance with prevention strategies');

    return factors;
  }

  private generateMitigationStrategies(injuryType: string): string[] {
    const strategies: string[] = [];

    // Universal strategies
    strategies.push('Complete full rehabilitation program');
    strategies.push('Gradual return to activity');
    strategies.push('Continue preventive exercises');

    // Injury-specific strategies
    if (injuryType.toLowerCase().includes('ankle')) {
      strategies.push('Proprioceptive training');
      strategies.push('Consider ankle bracing');
    }

    if (injuryType.toLowerCase().includes('concussion')) {
      strategies.push('Baseline testing');
      strategies.push('Education on concussion signs');
    }

    return strategies;
  }

  async updateReturnToPlayStatus(assessmentId: string, updates: Partial<ReturnToPlayAssessment>, user: User): Promise<ReturnToPlayAssessment> {
    try {
      if (!user.id) {
        throw new Error('User context required for return-to-play update');
      }

      // This would update the assessment in storage
      // For now, return a placeholder
      throw new Error('Return-to-play update not implemented');

    } catch (error: any) {
      console.error('Update return to play status error:', error);
      throw new Error(`Failed to update return-to-play status: ${error.message}`);
    }
  }

  async generateReturnToPlayProtocol(injuryType: string, sport: string, user: User): Promise<ReturnToPlayAssessment['progressionPlan']> {
    try {
      if (!user.id) {
        throw new Error('User context required for protocol generation');
      }

      const phases: ReturnToPlayAssessment['progressionPlan'] = [];

      // Phase 1: Rest and Recovery
      phases.push({
        phase: 'Rest and Recovery',
        duration: '3-7 days',
        activities: ['Complete rest', 'Pain management', 'Basic daily activities'],
        intensityLevel: 1,
        successCriteria: ['Pain-free at rest', 'Swelling reduced', 'Normal sleep'],
        modificationOptions: ['Extend rest if symptoms persist']
      });

      // Phase 2: Light Activity
      phases.push({
        phase: 'Light Activity',
        duration: '3-5 days',
        activities: ['Walking', 'Light stretching', 'Pool therapy'],
        intensityLevel: 3,
        successCriteria: ['No pain with light activity', 'Improved range of motion'],
        modificationOptions: ['Reduce intensity if pain returns']
      });

      // Phase 3: Progressive Exercise
      phases.push({
        phase: 'Progressive Exercise',
        duration: '7-14 days',
        activities: ['Strengthening exercises', 'Balance training', 'Cardiovascular conditioning'],
        intensityLevel: 5,
        successCriteria: ['Normal strength', 'Good balance', 'No symptoms with exercise'],
        modificationOptions: ['Adjust exercises based on response']
      });

      // Phase 4: Sport-Specific Training
      phases.push({
        phase: 'Sport-Specific Training',
        duration: '7-10 days',
        activities: ['Sport movements', 'Skill practice', 'Position-specific drills'],
        intensityLevel: 7,
        successCriteria: ['Normal sport movements', 'Confidence restored', 'No fear of reinjury'],
        modificationOptions: ['Focus on weak areas']
      });

      // Phase 5: Full Return
      phases.push({
        phase: 'Full Return',
        duration: 'Ongoing',
        activities: ['Full practice', 'Competition', 'Normal training'],
        intensityLevel: 10,
        successCriteria: ['Medical clearance', 'All tests passed', 'Athlete confidence'],
        modificationOptions: ['Continue prevention strategies']
      });

      await logComplianceAction(user.id, 'data_access', 'health_data', 'protocol_generation', 'Return-to-play protocol generated');

      return phases;

    } catch (error: any) {
      console.error('Generate return to play protocol error:', error);
      throw new Error(`Failed to generate return-to-play protocol: ${error.message}`);
    }
  }

  async clearForReturn(assessmentId: string, clearanceNotes: string, user: User): Promise<ReturnToPlayAssessment> {
    try {
      if (!user.id) {
        throw new Error('User context required for return clearance');
      }

      // This would update the assessment with clearance
      await logComplianceAction(user.id, 'data_modification', 'health_data', assessmentId, 'Return-to-play clearance granted');
      
      throw new Error('Return clearance not implemented');

    } catch (error: any) {
      console.error('Clear for return error:', error);
      throw new Error(`Failed to clear for return: ${error.message}`);
    }
  }

  // Medical Protocol Management
  async getProtocol(protocolId: string, user: User): Promise<MedicalProtocol | null> {
    try {
      if (!user.id) {
        throw new Error('User context required for protocol access');
      }

      const protocol = this.protocols.get(protocolId);
      
      if (protocol) {
        await logComplianceAction(user.id, 'data_access', 'health_data', protocolId, 'Medical protocol accessed');
      }

      return protocol || null;

    } catch (error: any) {
      console.error('Get protocol error:', error);
      throw new Error(`Failed to get protocol: ${error.message}`);
    }
  }

  async searchProtocols(query: string, filters: any, user: User): Promise<MedicalProtocol[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for protocol search');
      }

      // Search protocols by name, description, or category
      const protocols = Array.from(this.protocols.values()).filter(protocol => {
        const searchText = `${protocol.name} ${protocol.description} ${protocol.category}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });

      await logComplianceAction(user.id, 'data_access', 'health_data', 'protocol_search', `Protocol search: ${query}`);

      return protocols;

    } catch (error: any) {
      console.error('Search protocols error:', error);
      throw new Error(`Failed to search protocols: ${error.message}`);
    }
  }

  async executeProtocol(protocolId: string, context: any, user: User): Promise<{
    steps: string[];
    recommendations: string[];
    nextActions: string[];
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for protocol execution');
      }

      const protocol = this.protocols.get(protocolId);
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      // Extract steps and recommendations
      const steps = protocol.steps.map(step => `${step.phase}: ${step.description}`);
      const recommendations = protocol.steps.flatMap(step => step.actions);
      const nextActions = protocol.steps[0]?.actions || [];

      // Update usage statistics
      protocol.timesUsed++;

      await logComplianceAction(user.id, 'data_modification', 'health_data', protocolId, 'Protocol executed');

      return {
        steps,
        recommendations,
        nextActions
      };

    } catch (error: any) {
      console.error('Execute protocol error:', error);
      throw new Error(`Failed to execute protocol: ${error.message}`);
    }
  }

  async updateProtocolUsage(protocolId: string, outcome: string, feedback: number, user: User): Promise<void> {
    try {
      if (!user.id) {
        throw new Error('User context required for protocol usage update');
      }

      const protocol = this.protocols.get(protocolId);
      if (!protocol) {
        throw new Error('Protocol not found');
      }

      // Update statistics
      if (outcome === 'successful') {
        protocol.successRate = (protocol.successRate * protocol.timesUsed + 1) / (protocol.timesUsed + 1);
      }

      protocol.userFeedback = (protocol.userFeedback * protocol.timesUsed + feedback) / (protocol.timesUsed + 1);

      await logComplianceAction(user.id, 'data_modification', 'health_data', protocolId, 'Protocol usage updated');

    } catch (error: any) {
      console.error('Update protocol usage error:', error);
      throw new Error(`Failed to update protocol usage: ${error.message}`);
    }
  }

  // Medical Reference System
  async lookupMedicalCondition(condition: string, user: User): Promise<MedicalReference | null> {
    try {
      if (!user.id) {
        throw new Error('User context required for medical reference lookup');
      }

      // Search for medical reference by keywords
      const reference = Array.from(this.medicalReferences.values()).find(ref => 
        ref.keywords.some(keyword => 
          keyword.toLowerCase().includes(condition.toLowerCase()) ||
          condition.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      if (reference) {
        await logComplianceAction(user.id, 'data_access', 'health_data', reference.id, `Medical reference lookup: ${condition}`);
      }

      return reference || null;

    } catch (error: any) {
      console.error('Lookup medical condition error:', error);
      throw new Error(`Failed to lookup medical condition: ${error.message}`);
    }
  }

  async searchMedicalReferences(query: string, category?: string, user: User): Promise<MedicalReference[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for medical reference search');
      }

      let references = Array.from(this.medicalReferences.values());

      // Filter by category if specified
      if (category) {
        references = references.filter(ref => ref.category === category);
      }

      // Search by query
      references = references.filter(ref => {
        const searchText = `${ref.title} ${ref.keywords.join(' ')} ${ref.content.definition}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });

      await logComplianceAction(user.id, 'data_access', 'health_data', 'reference_search', `Reference search: ${query}`);

      return references;

    } catch (error: any) {
      console.error('Search medical references error:', error);
      throw new Error(`Failed to search medical references: ${error.message}`);
    }
  }

  async getMedicalGuidance(topic: string, context: any, user: User): Promise<{
    guidance: string;
    recommendations: string[];
    references: string[];
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for medical guidance');
      }

      // Look up relevant references
      const references = await this.searchMedicalReferences(topic, undefined, user);
      
      let guidance = `General guidance for ${topic}:`;
      const recommendations: string[] = [];
      const referenceList: string[] = [];

      if (references.length > 0) {
        const primaryRef = references[0];
        guidance = primaryRef.content.definition;
        recommendations.push(...primaryRef.content.treatmentOptions.slice(0, 5));
        referenceList.push(...primaryRef.sources);
      } else {
        guidance = 'No specific medical guidance found. Consult with medical personnel for expert opinion.';
        recommendations.push('Seek professional medical evaluation');
      }

      await logComplianceAction(user.id, 'data_access', 'health_data', 'medical_guidance', `Medical guidance: ${topic}`);

      return {
        guidance,
        recommendations,
        references: referenceList
      };

    } catch (error: any) {
      console.error('Get medical guidance error:', error);
      throw new Error(`Failed to get medical guidance: ${error.message}`);
    }
  }

  // Emergency Guidance
  async provideEmergencyGuidance(emergencyType: string, context: any, user: User): Promise<{
    immediateActions: string[];
    emergencyProtocol: string[];
    contraindications: string[];
    monitoringInstructions: string[];
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for emergency guidance');
      }

      // Emergency action templates
      const emergencyActions: Record<string, any> = {
        'cardiac_emergency': {
          immediateActions: [
            'Call 911 immediately',
            'Check for pulse and breathing',
            'Begin CPR if needed',
            'Use AED if available',
            'Position for recovery'
          ],
          emergencyProtocol: [
            'Assess responsiveness',
            'Open airway',
            'Check breathing and pulse',
            'Begin resuscitation if needed',
            'Continue until EMS arrives'
          ],
          contraindications: [
            'Do not move if spinal injury suspected',
            'Do not give anything by mouth',
            'Do not leave patient alone'
          ],
          monitoringInstructions: [
            'Monitor vital signs continuously',
            'Watch for changes in consciousness',
            'Document all interventions'
          ]
        },
        'heat_stroke': {
          immediateActions: [
            'Call 911 if core temperature >104°F',
            'Move to cool environment',
            'Remove excess clothing',
            'Begin aggressive cooling',
            'Monitor airway and breathing'
          ],
          emergencyProtocol: [
            'Assess consciousness level',
            'Check core temperature',
            'Begin cooling measures',
            'Monitor for seizures',
            'Prepare for transport'
          ],
          contraindications: [
            'Do not give fluids if unconscious',
            'Do not overcool below 101°F',
            'Do not use ice directly on skin'
          ],
          monitoringInstructions: [
            'Monitor core temperature every 5 minutes',
            'Watch for neurological changes',
            'Track cooling progress'
          ]
        },
        'severe_head_injury': {
          immediateActions: [
            'Call 911 immediately',
            'Stabilize head and neck',
            'Assess consciousness',
            'Monitor airway and breathing',
            'Control bleeding if present'
          ],
          emergencyProtocol: [
            'Maintain cervical spine immobilization',
            'Assess neurological status',
            'Monitor for increased intracranial pressure',
            'Prepare for emergency transport',
            'Document all findings'
          ],
          contraindications: [
            'Do not move head or neck',
            'Do not give anything by mouth',
            'Do not leave patient unattended'
          ],
          monitoringInstructions: [
            'Monitor consciousness level',
            'Watch for pupil changes',
            'Track vital signs',
            'Document neurological status'
          ]
        }
      };

      const guidance = emergencyActions[emergencyType] || emergencyActions['cardiac_emergency'];

      await logComplianceAction(user.id, 'data_access', 'health_data', 'emergency_guidance', `Emergency guidance: ${emergencyType}`);

      return guidance;

    } catch (error: any) {
      console.error('Provide emergency guidance error:', error);
      throw new Error(`Failed to provide emergency guidance: ${error.message}`);
    }
  }

  async assessEmergencyStatus(symptoms: string[], vitals: any, user: User): Promise<{
    isEmergency: boolean;
    severity: string;
    recommendedActions: string[];
    timeframe: string;
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for emergency assessment');
      }

      let isEmergency = false;
      let severity = 'low';
      const recommendedActions: string[] = [];
      let timeframe = 'routine';

      // Check for emergency indicators
      const emergencySymptoms = [
        'loss of consciousness', 'difficulty breathing', 'chest pain', 'severe bleeding',
        'signs of shock', 'altered mental status', 'severe head injury'
      ];

      for (const symptom of symptoms) {
        if (emergencySymptoms.some(emergency => symptom.toLowerCase().includes(emergency))) {
          isEmergency = true;
          severity = 'critical';
          timeframe = 'immediate';
          recommendedActions.push('Call 911 immediately');
          break;
        }
      }

      // Check vital signs for emergency values
      if (vitals) {
        if (vitals.heartRate > 120 || vitals.heartRate < 50) {
          isEmergency = true;
          severity = 'high';
          recommendedActions.push('Monitor cardiac status closely');
        }

        if (vitals.systolicBP > 180 || vitals.systolicBP < 80) {
          isEmergency = true;
          severity = 'high';
          recommendedActions.push('Manage blood pressure emergency');
        }

        if (vitals.temperature > 104) {
          isEmergency = true;
          severity = 'critical';
          recommendedActions.push('Begin emergency cooling measures');
        }
      }

      if (!isEmergency) {
        recommendedActions.push('Continue monitoring');
        recommendedActions.push('Provide supportive care');
      }

      await logComplianceAction(user.id, 'data_access', 'health_data', 'emergency_assessment', 'Emergency status assessed');

      return {
        isEmergency,
        severity,
        recommendedActions,
        timeframe
      };

    } catch (error: any) {
      console.error('Assess emergency status error:', error);
      throw new Error(`Failed to assess emergency status: ${error.message}`);
    }
  }

  // AI-Powered Insights
  async generateHealthInsights(athleteId: string, user: User): Promise<{
    insights: string[];
    recommendations: string[];
    preventiveActions: string[];
    riskFactors: string[];
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for health insights');
      }

      // Get athlete health analytics
      const riskAnalysis = await aiHealthAnalyticsService.calculateAdvancedRiskScore(athleteId, user);
      
      const insights: string[] = [];
      const recommendations: string[] = [];
      const preventiveActions: string[] = [];
      const riskFactors = riskAnalysis.riskFactors.map(rf => rf.factor);

      // Generate insights based on risk analysis
      if (riskAnalysis.overallRisk > 0.7) {
        insights.push('High injury risk detected requiring immediate attention');
        recommendations.push('Schedule comprehensive medical evaluation');
        preventiveActions.push('Implement enhanced injury prevention protocols');
      }

      // Add trend-based insights
      const trends = await aiHealthAnalyticsService.analyzeTrends(athleteId, 'monthly', user);
      
      if (trends.trends.riskScore.trend === 'declining') {
        insights.push('Risk score has been increasing over time');
        recommendations.push('Investigate factors contributing to increased risk');
      }

      // Add general preventive actions
      preventiveActions.push(
        'Maintain proper training progression',
        'Ensure adequate recovery time',
        'Continue injury prevention exercises'
      );

      await logComplianceAction(user.id, 'data_access', 'health_data', athleteId, 'Health insights generated');

      return {
        insights,
        recommendations,
        preventiveActions,
        riskFactors
      };

    } catch (error: any) {
      console.error('Generate health insights error:', error);
      throw new Error(`Failed to generate health insights: ${error.message}`);
    }
  }

  async providePredictiveGuidance(athleteId: string, scenario: string, user: User): Promise<{
    prediction: string;
    confidence: number;
    recommendations: string[];
    preventiveActions: string[];
  }> {
    try {
      if (!user.id) {
        throw new Error('User context required for predictive guidance');
      }

      // Use AI analytics for prediction
      const prediction = await aiHealthAnalyticsService.predictInjuryRisk(athleteId, 30, user);
      
      const guidance = {
        prediction: `${(prediction.probability * 100).toFixed(1)}% injury risk over next 30 days`,
        confidence: prediction.confidence,
        recommendations: prediction.preventionStrategies,
        preventiveActions: [
          'Monitor high-risk factors closely',
          'Implement targeted prevention strategies',
          'Consider activity modifications if needed'
        ]
      };

      await logComplianceAction(user.id, 'data_access', 'health_data', athleteId, `Predictive guidance: ${scenario}`);

      return guidance;

    } catch (error: any) {
      console.error('Provide predictive guidance error:', error);
      throw new Error(`Failed to provide predictive guidance: ${error.message}`);
    }
  }

  // Integration Hooks
  async onNewSymptoms(athleteId: string, symptoms: string[], user: User): Promise<MedicalConsultation> {
    try {
      // Create consultation for new symptoms
      const consultation = await this.startConsultation({
        athleteId,
        consultationType: 'symptom_analysis',
        chiefComplaint: 'New symptoms reported',
        symptoms: symptoms.map(symptom => ({
          symptom,
          severity: 'moderate' as any,
          duration: 'recent',
          onset: 'gradual' as any
        }))
      }, user);

      console.log(`🔍 New symptoms consultation created: ${consultation.id}`);
      
      return consultation;

    } catch (error: any) {
      console.error('New symptoms hook error:', error);
      throw new Error(`Failed to handle new symptoms: ${error.message}`);
    }
  }

  async onInjuryOccurrence(athleteId: string, injury: InjuryIncident, user: User): Promise<MedicalConsultation> {
    try {
      // Create consultation for injury
      const consultation = await this.startConsultation({
        athleteId,
        consultationType: 'injury_assessment',
        chiefComplaint: `${injury.injuryType} injury`,
        contextualInformation: {
          activityAtOnset: injury.activityAtTimeOfInjury,
          recentInjuries: [injury.injuryType]
        }
      }, user);

      console.log(`🏥 Injury consultation created: ${consultation.id}`);
      
      return consultation;

    } catch (error: any) {
      console.error('Injury occurrence hook error:', error);
      throw new Error(`Failed to handle injury occurrence: ${error.message}`);
    }
  }

  async onVitalSignsAlert(athleteId: string, vitals: any, alertType: string, user: User): Promise<MedicalConsultation> {
    try {
      // Create consultation for vital signs alert
      const consultation = await this.startConsultation({
        athleteId,
        consultationType: 'emergency_guidance',
        chiefComplaint: `Abnormal vital signs: ${alertType}`,
        currentVitals: vitals,
        priority: 'urgent'
      }, user);

      console.log(`⚠️ Vital signs consultation created: ${consultation.id}`);
      
      return consultation;

    } catch (error: any) {
      console.error('Vital signs alert hook error:', error);
      throw new Error(`Failed to handle vital signs alert: ${error.message}`);
    }
  }
}

// Export service instance
export const medicalConsultationService = new MedicalConsultationServiceImpl();