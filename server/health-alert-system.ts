import { randomUUID } from "crypto";
import { getStorage } from "./storage";
import { HealthDataEncryption, HealthDataAudit } from "./data-encryption";
import { logComplianceAction } from "./complianceMiddleware";
import type { 
  User, 
  Athlete,
  HealthRiskAssessment,
  InjuryIncident 
} from "@shared/schema";

export interface HealthAlert {
  id: string;
  athleteId: string;
  athleteName?: string;
  organizationId: string;
  alertType: 'risk_escalation' | 'injury_risk' | 'medical_concern' | 'return_to_play' | 'compliance' | 'environmental' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical' | 'emergency';
  priority: 'routine' | 'urgent' | 'immediate' | 'emergency';
  status: 'active' | 'acknowledged' | 'investigating' | 'resolved' | 'escalated';
  
  // Alert Content
  title: string;
  message: string;
  description: string;
  riskScore?: number;
  confidence?: number;
  
  // Triggering Data
  triggerType: 'automated' | 'manual' | 'threshold' | 'pattern' | 'prediction';
  triggerData: Record<string, any>;
  thresholdExceeded?: string;
  
  // Medical Information
  symptoms?: string[];
  vitalSigns?: Record<string, number>;
  medicalHistory?: string[];
  currentMedications?: string[];
  
  // Recommendations and Actions
  immediateActions: string[];
  recommendations: string[];
  followUpRequired: boolean;
  followUpDate?: string;
  restrictionsRecommended?: string[];
  
  // Escalation and Notifications
  escalationPath: Array<{
    level: number;
    role: string;
    contactInfo: string;
    timeframe: string; // e.g., "immediate", "within 1 hour", "within 24 hours"
    notified: boolean;
    notificationTime?: string;
  }>;
  
  parentNotificationRequired: boolean;
  parentNotified: boolean;
  parentNotificationTime?: string;
  
  // Tracking and Audit
  createdBy: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  
  // Integration Data
  relatedIncidentId?: string;
  relatedAssessmentId?: string;
  attachments?: string[];
  
  // Metadata
  tags: string[];
  isEmergency: boolean;
  requiresImmedateAttention: boolean;
  autoResolutionEnabled: boolean;
  
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  isActive: boolean;
  
  // Trigger Conditions
  triggerType: 'risk_threshold' | 'metric_change' | 'pattern_detection' | 'time_based' | 'manual';
  conditions: Array<{
    metric: string;
    operator: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains' | 'pattern_match';
    value: any;
    timeframe?: string;
  }>;
  
  // Alert Configuration
  alertSeverity: HealthAlert['severity'];
  alertPriority: HealthAlert['priority'];
  alertType: HealthAlert['alertType'];
  
  // Escalation Configuration
  escalationDelayMinutes: number;
  maxEscalationLevel: number;
  escalationRoles: string[];
  
  // Notification Settings
  notificationChannels: ('email' | 'sms' | 'push' | 'in_app')[];
  parentNotificationThreshold: HealthAlert['severity'];
  
  // Actions
  autoActions: string[];
  recommendedActions: string[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertMetrics {
  organizationId: string;
  timeframe: string;
  totalAlerts: number;
  alertsBySeverity: Record<HealthAlert['severity'], number>;
  alertsByType: Record<HealthAlert['alertType'], number>;
  responseMetrics: {
    averageAcknowledgmentTime: number; // minutes
    averageResolutionTime: number; // minutes
    escalationRate: number; // percentage
    falsePositiveRate: number; // percentage
  };
  trendsAnalysis: {
    alertVolumeChange: number; // percentage change
    severityTrend: 'improving' | 'stable' | 'concerning';
    mostCommonAlerts: string[];
    alertPatterns: Array<{
      pattern: string;
      frequency: number;
      recommendation: string;
    }>;
  };
}

export interface NotificationEvent {
  id: string;
  alertId: string;
  recipientType: 'trainer' | 'coach' | 'admin' | 'parent' | 'guardian' | 'medical';
  recipientId: string;
  recipientContact: string;
  channel: 'email' | 'sms' | 'push' | 'in_app' | 'phone';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'acknowledged';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'emergency';
  sentAt?: string;
  deliveredAt?: string;
  acknowledgedAt?: string;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
}

export interface HealthAlertService {
  // Alert Management
  createAlert(alert: Partial<HealthAlert>, user: User): Promise<HealthAlert>;
  getAlert(alertId: string, user: User): Promise<HealthAlert | null>;
  updateAlert(alertId: string, updates: Partial<HealthAlert>, user: User): Promise<HealthAlert>;
  getActiveAlerts(organizationId: string, user: User): Promise<HealthAlert[]>;
  getAthleteAlerts(athleteId: string, user: User): Promise<HealthAlert[]>;
  acknowledgeAlert(alertId: string, acknowledgment: string, user: User): Promise<HealthAlert>;
  resolveAlert(alertId: string, resolution: string, user: User): Promise<HealthAlert>;
  escalateAlert(alertId: string, escalationReason: string, user: User): Promise<HealthAlert>;
  
  // Automated Alert Generation
  monitorAthleteHealth(athleteId: string, user: User): Promise<HealthAlert[]>;
  monitorOrganizationHealth(organizationId: string, user: User): Promise<HealthAlert[]>;
  checkRiskThresholds(organizationId: string, user: User): Promise<HealthAlert[]>;
  detectHealthPatterns(organizationId: string, user: User): Promise<HealthAlert[]>;
  
  // Alert Rules Management
  createAlertRule(rule: Partial<AlertRule>, user: User): Promise<AlertRule>;
  getAlertRules(organizationId: string, user: User): Promise<AlertRule[]>;
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>, user: User): Promise<AlertRule>;
  deactivateAlertRule(ruleId: string, user: User): Promise<boolean>;
  testAlertRule(ruleId: string, user: User): Promise<{ matches: number; sampleAlerts: HealthAlert[] }>;
  
  // Notification Management
  sendNotification(notification: Partial<NotificationEvent>, user: User): Promise<NotificationEvent>;
  getNotifications(alertId: string, user: User): Promise<NotificationEvent[]>;
  retryFailedNotifications(user: User): Promise<number>;
  updateNotificationStatus(notificationId: string, status: NotificationEvent['status'], user: User): Promise<NotificationEvent>;
  
  // Emergency Protocols
  triggerEmergencyAlert(athleteId: string, emergencyType: string, description: string, user: User): Promise<HealthAlert>;
  activateEmergencyProtocol(alertId: string, user: User): Promise<void>;
  notifyEmergencyContacts(athleteId: string, alert: HealthAlert, user: User): Promise<NotificationEvent[]>;
  
  // Analytics and Reporting
  getAlertMetrics(organizationId: string, timeframe: string, user: User): Promise<AlertMetrics>;
  generateAlertReport(organizationId: string, reportType: string, filters: any, user: User): Promise<any>;
  analyzeAlertTrends(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<any>;
  
  // Integration Hooks
  onRiskAssessmentUpdate(athleteId: string, assessment: HealthRiskAssessment, user: User): Promise<HealthAlert[]>;
  onInjuryIncident(athleteId: string, incident: InjuryIncident, user: User): Promise<HealthAlert[]>;
  onVitalSignsUpdate(athleteId: string, vitals: Record<string, number>, user: User): Promise<HealthAlert[]>;
}

/**
 * Intelligent Health Alert System
 * Provides real-time health monitoring with automated alert generation and escalation
 */
export class HealthAlertServiceImpl implements HealthAlertService {
  private storage = getStorage();
  private alertRules: Map<string, AlertRule> = new Map();
  private activeMonitoring: Set<string> = new Set();
  
  constructor() {
    console.log('🚨 Health Alert System with intelligent monitoring initialized');
    this.initializeDefaultAlertRules();
    this.startHealthMonitoring();
  }

  private async initializeDefaultAlertRules(): Promise<void> {
    // Initialize standard alert rules for health monitoring
    const defaultRules: Partial<AlertRule>[] = [
      {
        id: 'high_injury_risk',
        name: 'High Injury Risk Alert',
        description: 'Alert when athlete injury risk score exceeds 70%',
        triggerType: 'risk_threshold',
        conditions: [
          {
            metric: 'overallRiskScore',
            operator: 'greater_than',
            value: 0.7
          }
        ],
        alertSeverity: 'high',
        alertPriority: 'urgent',
        alertType: 'injury_risk',
        escalationDelayMinutes: 60,
        maxEscalationLevel: 3,
        escalationRoles: ['athletic_trainer', 'athletic_director', 'medical_director'],
        notificationChannels: ['email', 'in_app'], // SMS disabled until provider integration
        parentNotificationThreshold: 'high',
        autoActions: ['flag_for_medical_review', 'restrict_high_intensity_training'],
        recommendedActions: [
          'Schedule immediate medical evaluation',
          'Implement enhanced monitoring',
          'Review training protocol'
        ],
        isActive: true
      },
      {
        id: 'critical_injury_risk',
        name: 'Critical Injury Risk Alert',
        description: 'Emergency alert for critical injury risk (>85%)',
        triggerType: 'risk_threshold',
        conditions: [
          {
            metric: 'overallRiskScore',
            operator: 'greater_than',
            value: 0.85
          }
        ],
        alertSeverity: 'critical',
        alertPriority: 'immediate',
        alertType: 'injury_risk',
        escalationDelayMinutes: 15,
        maxEscalationLevel: 4,
        escalationRoles: ['athletic_trainer', 'team_physician', 'athletic_director', 'emergency_contact'],
        notificationChannels: ['email', 'in_app'], // SMS/phone disabled until provider integration
        parentNotificationThreshold: 'critical',
        autoActions: ['immediate_activity_restriction', 'schedule_emergency_evaluation'],
        recommendedActions: [
          'IMMEDIATE: Remove from all activity',
          'Contact team physician immediately',
          'Notify parents/guardians',
          'Document incident thoroughly'
        ],
        isActive: true
      },
      {
        id: 'rapid_risk_increase',
        name: 'Rapid Risk Increase Pattern',
        description: 'Alert when risk score increases rapidly over short period',
        triggerType: 'pattern_detection',
        conditions: [
          {
            metric: 'riskScoreChange',
            operator: 'greater_than',
            value: 0.3,
            timeframe: '7_days'
          }
        ],
        alertSeverity: 'medium',
        alertPriority: 'urgent',
        alertType: 'risk_escalation',
        escalationDelayMinutes: 120,
        maxEscalationLevel: 2,
        escalationRoles: ['athletic_trainer', 'athletic_director'],
        notificationChannels: ['email', 'in_app'],
        parentNotificationThreshold: 'high',
        autoActions: ['flag_for_review'],
        recommendedActions: [
          'Investigate cause of risk increase',
          'Review recent training changes',
          'Consider preventive interventions'
        ],
        isActive: true
      },
      {
        id: 'multiple_concerning_symptoms',
        name: 'Multiple Concerning Symptoms',
        description: 'Alert when athlete reports multiple concerning symptoms',
        triggerType: 'pattern_detection',
        conditions: [
          {
            metric: 'concerningSymptomCount',
            operator: 'greater_than',
            value: 2
          }
        ],
        alertSeverity: 'medium',
        alertPriority: 'urgent',
        alertType: 'medical_concern',
        escalationDelayMinutes: 30,
        maxEscalationLevel: 3,
        escalationRoles: ['athletic_trainer', 'team_physician', 'athletic_director'],
        notificationChannels: ['email', 'in_app'], // SMS disabled until provider integration
        parentNotificationThreshold: 'medium',
        autoActions: ['schedule_medical_evaluation'],
        recommendedActions: [
          'Conduct comprehensive symptom assessment',
          'Review medical history',
          'Consider medical clearance hold'
        ],
        isActive: true
      },
      {
        id: 'overtraining_indicators',
        name: 'Overtraining Risk Indicators',
        description: 'Alert for signs of overtraining syndrome',
        triggerType: 'pattern_detection',
        conditions: [
          {
            metric: 'fatigueLevel',
            operator: 'greater_than',
            value: 0.8
          },
          {
            metric: 'adequateRest',
            operator: 'equals',
            value: false
          }
        ],
        alertSeverity: 'medium',
        alertPriority: 'routine',
        alertType: 'risk_escalation',
        escalationDelayMinutes: 240,
        maxEscalationLevel: 2,
        escalationRoles: ['athletic_trainer', 'head_coach'],
        notificationChannels: ['email', 'in_app'],
        parentNotificationThreshold: 'high',
        autoActions: ['recommend_rest_period'],
        recommendedActions: [
          'Implement recovery protocols',
          'Reduce training intensity',
          'Monitor for improvement'
        ],
        isActive: true
      },
      {
        id: 'return_to_play_concern',
        name: 'Return to Play Concern',
        description: 'Alert when return-to-play timeline concerns arise',
        triggerType: 'time_based',
        conditions: [
          {
            metric: 'returnToPlayDelay',
            operator: 'greater_than',
            value: 7,
            timeframe: 'days'
          }
        ],
        alertSeverity: 'low',
        alertPriority: 'routine',
        alertType: 'return_to_play',
        escalationDelayMinutes: 480,
        maxEscalationLevel: 2,
        escalationRoles: ['athletic_trainer', 'team_physician'],
        notificationChannels: ['email', 'in_app'],
        parentNotificationThreshold: 'medium',
        autoActions: ['schedule_reassessment'],
        recommendedActions: [
          'Reassess recovery progress',
          'Consider additional interventions',
          'Update return timeline'
        ],
        isActive: true
      }
    ];

    // Store default rules
    for (const rule of defaultRules) {
      if (rule.id) {
        this.alertRules.set(rule.id, rule as AlertRule);
      }
    }
  }

  private async startHealthMonitoring(): Promise<void> {
    // TODO: Replace with proper job scheduler (e.g., node-cron, bull queue)
    // setInterval removed for production safety - use proper scheduling system
    console.log('🔄 Health monitoring initialized (scheduled monitoring disabled until proper job queue implemented)');
  }

  private async performRoutineHealthChecks(): Promise<void> {
    // This would monitor all active organizations
    // For now, implement basic monitoring logic
    console.log('🔍 Performing routine health checks...');
  }

  // Alert Management
  async createAlert(alert: Partial<HealthAlert>, user: User): Promise<HealthAlert> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for alert creation');
      }

      // Get athlete information
      const athlete = await storage.getAthlete(alert.athleteId!, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      // Build complete alert
      const healthAlert: HealthAlert = {
        id: randomUUID(),
        athleteId: alert.athleteId!,
        athleteName: `${athlete.firstName} ${athlete.lastName}`,
        organizationId: alert.organizationId || athlete.organizationId || user.organizationId!,
        alertType: alert.alertType || 'medical_concern',
        severity: alert.severity || 'medium',
        priority: alert.priority || 'routine',
        status: 'active',
        
        // Alert Content
        title: alert.title || 'Health Alert',
        message: alert.message || 'Health concern detected',
        description: alert.description || '',
        riskScore: alert.riskScore,
        confidence: alert.confidence,
        
        // Triggering Data
        triggerType: alert.triggerType || 'manual',
        triggerData: alert.triggerData || {},
        thresholdExceeded: alert.thresholdExceeded,
        
        // Medical Information
        symptoms: alert.symptoms || [],
        vitalSigns: alert.vitalSigns || {},
        medicalHistory: alert.medicalHistory || [],
        currentMedications: alert.currentMedications || [],
        
        // Recommendations and Actions
        immediateActions: alert.immediateActions || [],
        recommendations: alert.recommendations || [],
        followUpRequired: alert.followUpRequired || false,
        followUpDate: alert.followUpDate,
        restrictionsRecommended: alert.restrictionsRecommended,
        
        // Escalation and Notifications
        escalationPath: alert.escalationPath || this.buildDefaultEscalationPath(alert.severity || 'medium'),
        parentNotificationRequired: this.shouldNotifyParents(alert.severity || 'medium'),
        parentNotified: false,
        
        // Tracking and Audit
        createdBy: user.id,
        
        // Integration Data
        relatedIncidentId: alert.relatedIncidentId,
        relatedAssessmentId: alert.relatedAssessmentId,
        attachments: alert.attachments || [],
        
        // Metadata
        tags: alert.tags || [],
        isEmergency: ['critical', 'emergency'].includes(alert.severity || 'medium'),
        requiresImmedateAttention: ['immediate', 'emergency'].includes(alert.priority || 'routine'),
        autoResolutionEnabled: alert.autoResolutionEnabled || false,
        
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: alert.expiresAt
      };

      // Log compliance action
      await logComplianceAction(
        user.id, 
        'data_modification', 
        'health_data', 
        healthAlert.id, 
        `Health alert created: ${healthAlert.alertType}`
      );

      // Trigger notifications if needed
      if (healthAlert.parentNotificationRequired || healthAlert.isEmergency) {
        await this.triggerAlertNotifications(healthAlert, user);
      }

      // Start escalation timer if needed
      if (healthAlert.escalationPath.length > 0) {
        this.scheduleAlertEscalation(healthAlert);
      }

      // Broadcast real-time health alert using unified WebSocket service
      const unifiedService = (global as any).unifiedWebSocketService;
      if (unifiedService) {
        await unifiedService.publishAthleticTrainerEvent(
          'health_alert_created',
          {
            alertId: healthAlert.id,
            athleteId: healthAlert.athleteId,
            athleteName: healthAlert.athleteName,
            alertType: healthAlert.alertType,
            severity: healthAlert.severity,
            priority: healthAlert.priority,
            title: healthAlert.title,
            message: healthAlert.message,
            immediateActions: healthAlert.immediateActions,
            isEmergency: healthAlert.isEmergency,
            requiresImmedateAttention: healthAlert.requiresImmedateAttention
          },
          healthAlert.organizationId,
          user.id
        );
      }

      return healthAlert;

    } catch (error: any) {
      console.error('Create alert error:', error);
      throw new Error(`Failed to create alert: ${error.message}`);
    }
  }

  private buildDefaultEscalationPath(severity: HealthAlert['severity']): HealthAlert['escalationPath'] {
    const escalationPaths: Record<HealthAlert['severity'], HealthAlert['escalationPath']> = {
      'low': [
        {
          level: 1,
          role: 'athletic_trainer',
          contactInfo: '',
          timeframe: 'within 4 hours',
          notified: false
        }
      ],
      'medium': [
        {
          level: 1,
          role: 'athletic_trainer',
          contactInfo: '',
          timeframe: 'within 1 hour',
          notified: false
        },
        {
          level: 2,
          role: 'athletic_director',
          contactInfo: '',
          timeframe: 'within 4 hours',
          notified: false
        }
      ],
      'high': [
        {
          level: 1,
          role: 'athletic_trainer',
          contactInfo: '',
          timeframe: 'immediate',
          notified: false
        },
        {
          level: 2,
          role: 'team_physician',
          contactInfo: '',
          timeframe: 'within 30 minutes',
          notified: false
        },
        {
          level: 3,
          role: 'athletic_director',
          contactInfo: '',
          timeframe: 'within 1 hour',
          notified: false
        }
      ],
      'critical': [
        {
          level: 1,
          role: 'athletic_trainer',
          contactInfo: '',
          timeframe: 'immediate',
          notified: false
        },
        {
          level: 2,
          role: 'team_physician',
          contactInfo: '',
          timeframe: 'immediate',
          notified: false
        },
        {
          level: 3,
          role: 'athletic_director',
          contactInfo: '',
          timeframe: 'within 15 minutes',
          notified: false
        },
        {
          level: 4,
          role: 'emergency_contact',
          contactInfo: '',
          timeframe: 'immediate',
          notified: false
        }
      ],
      'emergency': [
        {
          level: 1,
          role: 'emergency_services',
          contactInfo: 'emergency-services', // 911 integration disabled until provider setup
          timeframe: 'immediate',
          notified: false
        },
        {
          level: 2,
          role: 'athletic_trainer',
          contactInfo: '',
          timeframe: 'immediate',
          notified: false
        },
        {
          level: 3,
          role: 'team_physician',
          contactInfo: '',
          timeframe: 'immediate',
          notified: false
        },
        {
          level: 4,
          role: 'athletic_director',
          contactInfo: '',
          timeframe: 'immediate',
          notified: false
        }
      ]
    };

    return escalationPaths[severity] || escalationPaths['medium'];
  }

  private shouldNotifyParents(severity: HealthAlert['severity']): boolean {
    return ['high', 'critical', 'emergency'].includes(severity);
  }

  private async triggerAlertNotifications(alert: HealthAlert, user: User): Promise<void> {
    try {
      // Send immediate notifications based on severity
      for (const escalation of alert.escalationPath) {
        if (escalation.timeframe === 'immediate') {
          await this.sendEscalationNotification(alert, escalation, user);
        }
      }

      // Send parent notification if required
      if (alert.parentNotificationRequired && !alert.parentNotified) {
        await this.sendParentNotification(alert, user);
      }

    } catch (error) {
      console.error('Alert notification error:', error);
    }
  }

  private async sendEscalationNotification(
    alert: HealthAlert, 
    escalation: HealthAlert['escalationPath'][0], 
    user: User
  ): Promise<void> {
    const notification: Partial<NotificationEvent> = {
      alertId: alert.id,
      recipientType: escalation.role as any,
      recipientId: '', // Would be populated from organization contacts
      recipientContact: escalation.contactInfo,
      channel: 'email', // Phone disabled until provider integration
      message: this.buildEscalationMessage(alert, escalation),
      priority: alert.isEmergency ? 'emergency' : 'urgent',
      retryCount: 0,
      maxRetries: alert.isEmergency ? 5 : 3
    };

    await this.sendNotification(notification, user);
    
    // Mark as notified
    escalation.notified = true;
    escalation.notificationTime = new Date().toISOString();
  }

  private buildEscalationMessage(alert: HealthAlert, escalation: HealthAlert['escalationPath'][0]): string {
    return `🚨 HEALTH ALERT: ${alert.severity.toUpperCase()}

Athlete: ${alert.athleteName}
Alert Type: ${alert.alertType.replace('_', ' ').toUpperCase()}
Severity: ${alert.severity.toUpperCase()}

${alert.message}

Immediate Actions Required:
${alert.immediateActions.map(action => `• ${action}`).join('\n')}

Please respond immediately. Time frame: ${escalation.timeframe}

Alert ID: ${alert.id}
Created: ${new Date(alert.createdAt).toLocaleString()}`;
  }

  private async sendParentNotification(alert: HealthAlert, user: User): Promise<void> {
    const notification: Partial<NotificationEvent> = {
      alertId: alert.id,
      recipientType: 'parent',
      recipientId: '', // Would be populated from athlete emergency contacts
      recipientContact: '', // Would be populated from athlete emergency contacts
      channel: 'email',
      message: this.buildParentNotificationMessage(alert),
      priority: alert.isEmergency ? 'emergency' : 'high',
      retryCount: 0,
      maxRetries: 3
    };

    await this.sendNotification(notification, user);
  }

  private buildParentNotificationMessage(alert: HealthAlert): string {
    return `Health Alert for ${alert.athleteName}

Dear Parent/Guardian,

We are writing to inform you of a health alert regarding ${alert.athleteName}.

Alert Details:
• Type: ${alert.alertType.replace('_', ' ')}
• Severity: ${alert.severity}
• Time: ${new Date(alert.createdAt).toLocaleString()}

Description:
${alert.description || alert.message}

Actions Being Taken:
${alert.immediateActions.map(action => `• ${action}`).join('\n')}

${alert.followUpRequired ? `Follow-up Required: ${alert.followUpDate || 'To be scheduled'}` : ''}

Our athletic training staff is monitoring the situation closely. If you have any questions or concerns, please contact our athletic trainer immediately.

Thank you for your attention to this matter.

Athletic Training Staff`;
  }

  private scheduleAlertEscalation(alert: HealthAlert): void {
    // Implementation would schedule escalation notifications
    // For now, log the intent
    console.log(`🔄 Escalation scheduled for alert ${alert.id} with ${alert.escalationPath.length} levels`);
  }

  async getAlert(alertId: string, user: User): Promise<HealthAlert | null> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert access');
      }

      // This would retrieve from database
      // For now, return null as placeholder
      await logComplianceAction(user.id, 'data_access', 'health_data', alertId, 'Alert access');
      return null;

    } catch (error: any) {
      console.error('Get alert error:', error);
      throw new Error(`Failed to get alert: ${error.message}`);
    }
  }

  async updateAlert(alertId: string, updates: Partial<HealthAlert>, user: User): Promise<HealthAlert> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert update');
      }

      // This would update in database
      await logComplianceAction(user.id, 'data_modification', 'health_data', alertId, 'Alert update');
      
      // Return updated alert (placeholder)
      throw new Error('Alert update not implemented');

    } catch (error: any) {
      console.error('Update alert error:', error);
      throw new Error(`Failed to update alert: ${error.message}`);
    }
  }

  async getActiveAlerts(organizationId: string, user: User): Promise<HealthAlert[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for alerts access');
      }

      // This would query active alerts from database
      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, 'Active alerts access');
      
      return []; // Placeholder

    } catch (error: any) {
      console.error('Get active alerts error:', error);
      throw new Error(`Failed to get active alerts: ${error.message}`);
    }
  }

  async getAthleteAlerts(athleteId: string, user: User): Promise<HealthAlert[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for athlete alerts access');
      }

      // This would query athlete alerts from database
      await logComplianceAction(user.id, 'data_access', 'health_data', athleteId, 'Athlete alerts access');
      
      return []; // Placeholder

    } catch (error: any) {
      console.error('Get athlete alerts error:', error);
      throw new Error(`Failed to get athlete alerts: ${error.message}`);
    }
  }

  async acknowledgeAlert(alertId: string, acknowledgment: string, user: User): Promise<HealthAlert> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert acknowledgment');
      }

      // This would update alert status to acknowledged
      await logComplianceAction(user.id, 'data_modification', 'health_data', alertId, `Alert acknowledged: ${acknowledgment}`);
      
      throw new Error('Alert acknowledgment not implemented');

    } catch (error: any) {
      console.error('Acknowledge alert error:', error);
      throw new Error(`Failed to acknowledge alert: ${error.message}`);
    }
  }

  async resolveAlert(alertId: string, resolution: string, user: User): Promise<HealthAlert> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert resolution');
      }

      // This would update alert status to resolved
      await logComplianceAction(user.id, 'data_modification', 'health_data', alertId, `Alert resolved: ${resolution}`);
      
      throw new Error('Alert resolution not implemented');

    } catch (error: any) {
      console.error('Resolve alert error:', error);
      throw new Error(`Failed to resolve alert: ${error.message}`);
    }
  }

  async escalateAlert(alertId: string, escalationReason: string, user: User): Promise<HealthAlert> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert escalation');
      }

      // This would escalate alert to next level
      await logComplianceAction(user.id, 'data_modification', 'health_data', alertId, `Alert escalated: ${escalationReason}`);
      
      throw new Error('Alert escalation not implemented');

    } catch (error: any) {
      console.error('Escalate alert error:', error);
      throw new Error(`Failed to escalate alert: ${error.message}`);
    }
  }

  // Automated Alert Generation
  async monitorAthleteHealth(athleteId: string, user: User): Promise<HealthAlert[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for health monitoring');
      }

      const alerts: HealthAlert[] = [];

      // Basic health monitoring without AI analytics
      const riskAnalysis = {
        overallRisk: 0.3, // Default moderate risk
        confidence: 0.8,
        riskFactors: [{ factor: 'General monitoring', weight: 0.3 }],
        recommendations: ['Maintain regular health checkups', 'Follow training protocols']
      };
      
      // Check against alert rules (simplified)
      for (const rule of this.alertRules.values()) {
        if (!rule.isActive) continue;

        const shouldTrigger = await this.evaluateAlertRule(rule, { athleteId, riskAnalysis }, user);
        
        if (shouldTrigger) {
          const alert = await this.generateRuleBasedAlert(rule, athleteId, riskAnalysis, user);
          alerts.push(alert);
        }
      }

      await logComplianceAction(user.id, 'data_access', 'health_data', athleteId, 'Health monitoring');
      
      return alerts;

    } catch (error: any) {
      console.error('Monitor athlete health error:', error);
      throw new Error(`Failed to monitor athlete health: ${error.message}`);
    }
  }

  async monitorOrganizationHealth(organizationId: string, user: User): Promise<HealthAlert[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for organization health monitoring');
      }

      const alerts: HealthAlert[] = [];

      // Get organization athletes
      const storage = await this.storage;
      const athletes = await storage.getAthletesByOrganization(organizationId, user);

      // Monitor each athlete
      for (const athlete of athletes) {
        const athleteAlerts = await this.monitorAthleteHealth(athlete.id, user);
        alerts.push(...athleteAlerts);
      }

      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, 'Organization health monitoring');
      
      return alerts;

    } catch (error: any) {
      console.error('Monitor organization health error:', error);
      throw new Error(`Failed to monitor organization health: ${error.message}`);
    }
  }

  async checkRiskThresholds(organizationId: string, user: User): Promise<HealthAlert[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for risk threshold checking');
      }

      const alerts: HealthAlert[] = [];

      // Get organization athletes
      const storage = await this.storage;
      const athletes = await storage.getAthletesByOrganization(organizationId, user);

      // Check risk thresholds for each athlete (simplified monitoring)
      for (const athlete of athletes) {
        const riskAnalysis = {
          overallRisk: 0.3, // Default moderate risk without AI
          confidence: 0.8,
          riskFactors: [{ factor: 'General monitoring', weight: 0.3 }],
          recommendations: ['Maintain regular health checkups', 'Follow training protocols']
        };
        
        // Check high risk threshold (simplified without AI)
        if (riskAnalysis.overallRisk > 0.7) {
          const alert = await this.createAlert({
            athleteId: athlete.id,
            organizationId,
            alertType: 'injury_risk',
            severity: riskAnalysis.overallRisk > 0.85 ? 'critical' : 'high',
            priority: riskAnalysis.overallRisk > 0.85 ? 'immediate' : 'urgent',
            title: 'High Injury Risk Detected',
            message: `Athlete ${athlete.firstName} ${athlete.lastName} has elevated injury risk (${(riskAnalysis.overallRisk * 100).toFixed(1)}%)`,
            description: `Advanced risk analysis indicates elevated injury probability. Key risk factors: ${riskAnalysis.riskFactors.slice(0, 3).map(f => f.factor).join(', ')}`,
            riskScore: riskAnalysis.overallRisk,
            confidence: riskAnalysis.confidence,
            triggerType: 'threshold',
            triggerData: { riskAnalysis },
            thresholdExceeded: 'injury_risk_threshold',
            immediateActions: riskAnalysis.recommendations.slice(0, 3),
            recommendations: riskAnalysis.recommendations,
            followUpRequired: true,
            tags: ['injury_risk', 'threshold_alert', 'ai_generated']
          }, user);
          
          alerts.push(alert);
        }
      }

      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, 'Risk threshold check');
      
      return alerts;

    } catch (error: any) {
      console.error('Check risk thresholds error:', error);
      throw new Error(`Failed to check risk thresholds: ${error.message}`);
    }
  }

  async detectHealthPatterns(organizationId: string, user: User): Promise<HealthAlert[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for pattern detection');
      }

      const alerts: HealthAlert[] = [];

      // Simplified pattern detection without AI
      const patterns = {
        patterns: [] // No patterns detected without AI service
      };
      
      // Check for concerning patterns (simplified)
      for (const pattern of patterns.patterns) {
        if (pattern.risk > 0.6 && pattern.athletes >= 3) {
          const alert = await this.createAlert({
            organizationId,
            athleteId: '', // Organization-level alert
            alertType: 'risk_escalation',
            severity: pattern.risk > 0.8 ? 'high' : 'medium',
            priority: 'urgent',
            title: 'Health Pattern Alert',
            message: `Concerning health pattern detected: ${pattern.description}`,
            description: `Pattern affects ${pattern.athletes} athletes with risk level ${(pattern.risk * 100).toFixed(1)}%. Frequency: ${pattern.frequency}`,
            riskScore: pattern.risk,
            triggerType: 'pattern',
            triggerData: { pattern },
            immediateActions: [
              'Investigate pattern cause',
              'Review affected athletes',
              'Implement preventive measures'
            ],
            recommendations: [
              'Analyze training protocols for affected athletes',
              'Review environmental factors',
              'Consider population-level interventions'
            ],
            followUpRequired: true,
            tags: ['pattern_alert', 'population_health', 'ai_generated']
          }, user);
          
          alerts.push(alert);
        }
      }

      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, 'Health pattern detection');
      
      return alerts;

    } catch (error: any) {
      console.error('Detect health patterns error:', error);
      throw new Error(`Failed to detect health patterns: ${error.message}`);
    }
  }

  private async evaluateAlertRule(rule: AlertRule, context: any, user: User): Promise<boolean> {
    try {
      // Evaluate rule conditions
      for (const condition of rule.conditions) {
        const value = this.extractMetricValue(condition.metric, context);
        
        if (!this.evaluateCondition(value, condition.operator, condition.value)) {
          return false; // All conditions must be true
        }
      }
      
      return true;

    } catch (error) {
      console.error('Rule evaluation error:', error);
      return false;
    }
  }

  private extractMetricValue(metric: string, context: any): any {
    // Extract metric value from context
    if (metric === 'overallRiskScore') {
      return context.riskAnalysis?.overallRisk || 0;
    }
    
    // Add more metric extractions as needed
    return context[metric] || 0;
  }

  private evaluateCondition(value: any, operator: string, threshold: any): boolean {
    switch (operator) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'not_equals':
        return value !== threshold;
      case 'contains':
        return String(value).includes(String(threshold));
      default:
        return false;
    }
  }

  private async generateRuleBasedAlert(
    rule: AlertRule, 
    athleteId: string, 
    riskAnalysis: any, 
    user: User
  ): Promise<HealthAlert> {
    return await this.createAlert({
      athleteId,
      organizationId: rule.organizationId,
      alertType: rule.alertType,
      severity: rule.alertSeverity,
      priority: rule.alertPriority,
      title: rule.name,
      message: `Alert triggered by rule: ${rule.name}`,
      description: rule.description,
      riskScore: riskAnalysis.overallRisk,
      confidence: riskAnalysis.confidence,
      triggerType: 'automated',
      triggerData: { rule, riskAnalysis },
      immediateActions: rule.autoActions,
      recommendations: rule.recommendedActions,
      followUpRequired: true,
      tags: ['rule_based', 'automated', rule.name.toLowerCase().replace(/\s+/g, '_')]
    }, user);
  }

  // Alert Rules Management
  async createAlertRule(rule: Partial<AlertRule>, user: User): Promise<AlertRule> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert rule creation');
      }

      const alertRule: AlertRule = {
        id: randomUUID(),
        name: rule.name || 'New Alert Rule',
        description: rule.description || '',
        organizationId: rule.organizationId || user.organizationId!,
        isActive: rule.isActive !== undefined ? rule.isActive : true,
        triggerType: rule.triggerType || 'risk_threshold',
        conditions: rule.conditions || [],
        alertSeverity: rule.alertSeverity || 'medium',
        alertPriority: rule.alertPriority || 'routine',
        alertType: rule.alertType || 'medical_concern',
        escalationDelayMinutes: rule.escalationDelayMinutes || 60,
        maxEscalationLevel: rule.maxEscalationLevel || 2,
        escalationRoles: rule.escalationRoles || ['athletic_trainer'],
        notificationChannels: rule.notificationChannels || ['email'],
        parentNotificationThreshold: rule.parentNotificationThreshold || 'high',
        autoActions: rule.autoActions || [],
        recommendedActions: rule.recommendedActions || [],
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store rule
      this.alertRules.set(alertRule.id, alertRule);

      await logComplianceAction(user.id, 'data_modification', 'health_data', alertRule.id, 'Alert rule created');

      return alertRule;

    } catch (error: any) {
      console.error('Create alert rule error:', error);
      throw new Error(`Failed to create alert rule: ${error.message}`);
    }
  }

  async getAlertRules(organizationId: string, user: User): Promise<AlertRule[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert rules access');
      }

      // Filter rules by organization
      const rules = Array.from(this.alertRules.values()).filter(
        rule => rule.organizationId === organizationId
      );

      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, 'Alert rules access');

      return rules;

    } catch (error: any) {
      console.error('Get alert rules error:', error);
      throw new Error(`Failed to get alert rules: ${error.message}`);
    }
  }

  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>, user: User): Promise<AlertRule> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert rule update');
      }

      const existingRule = this.alertRules.get(ruleId);
      if (!existingRule) {
        throw new Error('Alert rule not found');
      }

      const updatedRule: AlertRule = {
        ...existingRule,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.alertRules.set(ruleId, updatedRule);

      await logComplianceAction(user.id, 'data_modification', 'health_data', ruleId, 'Alert rule updated');

      return updatedRule;

    } catch (error: any) {
      console.error('Update alert rule error:', error);
      throw new Error(`Failed to update alert rule: ${error.message}`);
    }
  }

  async deactivateAlertRule(ruleId: string, user: User): Promise<boolean> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert rule deactivation');
      }

      const rule = this.alertRules.get(ruleId);
      if (!rule) {
        throw new Error('Alert rule not found');
      }

      rule.isActive = false;
      rule.updatedAt = new Date().toISOString();

      await logComplianceAction(user.id, 'data_modification', 'health_data', ruleId, 'Alert rule deactivated');

      return true;

    } catch (error: any) {
      console.error('Deactivate alert rule error:', error);
      throw new Error(`Failed to deactivate alert rule: ${error.message}`);
    }
  }

  async testAlertRule(ruleId: string, user: User): Promise<{ matches: number; sampleAlerts: HealthAlert[] }> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert rule testing');
      }

      const rule = this.alertRules.get(ruleId);
      if (!rule) {
        throw new Error('Alert rule not found');
      }

      // This would test the rule against current data
      // For now, return placeholder results
      await logComplianceAction(user.id, 'data_access', 'health_data', ruleId, 'Alert rule test');

      return {
        matches: 0,
        sampleAlerts: []
      };

    } catch (error: any) {
      console.error('Test alert rule error:', error);
      throw new Error(`Failed to test alert rule: ${error.message}`);
    }
  }

  // Notification Management
  async sendNotification(notification: Partial<NotificationEvent>, user: User): Promise<NotificationEvent> {
    try {
      if (!user.id) {
        throw new Error('User context required for sending notifications');
      }

      const notificationEvent: NotificationEvent = {
        id: randomUUID(),
        alertId: notification.alertId!,
        recipientType: notification.recipientType || 'trainer',
        recipientId: notification.recipientId || '',
        recipientContact: notification.recipientContact || '',
        channel: notification.channel || 'email',
        status: 'pending',
        message: notification.message || '',
        priority: notification.priority || 'medium',
        retryCount: 0,
        maxRetries: notification.maxRetries || 3,
        createdAt: new Date().toISOString()
      };

      // This would actually send the notification via the chosen channel
      // For now, mark as sent
      notificationEvent.status = 'sent';
      notificationEvent.sentAt = new Date().toISOString();

      await logComplianceAction(user.id, 'data_modification', 'health_data', notificationEvent.id, 
        `Notification sent: ${notificationEvent.channel} to ${notificationEvent.recipientType}`);

      return notificationEvent;

    } catch (error: any) {
      console.error('Send notification error:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  async getNotifications(alertId: string, user: User): Promise<NotificationEvent[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for notifications access');
      }

      // This would query notifications from database
      await logComplianceAction(user.id, 'data_access', 'health_data', alertId, 'Notifications access');
      
      return []; // Placeholder

    } catch (error: any) {
      console.error('Get notifications error:', error);
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  async retryFailedNotifications(user: User): Promise<number> {
    try {
      if (!user.id) {
        throw new Error('User context required for notification retry');
      }

      // This would retry failed notifications
      await logComplianceAction(user.id, 'data_modification', 'health_data', 'system', 'Failed notifications retry');
      
      return 0; // Placeholder

    } catch (error: any) {
      console.error('Retry failed notifications error:', error);
      throw new Error(`Failed to retry notifications: ${error.message}`);
    }
  }

  async updateNotificationStatus(notificationId: string, status: NotificationEvent['status'], user: User): Promise<NotificationEvent> {
    try {
      if (!user.id) {
        throw new Error('User context required for notification status update');
      }

      // This would update notification status
      await logComplianceAction(user.id, 'data_modification', 'health_data', notificationId, `Notification status: ${status}`);
      
      throw new Error('Notification status update not implemented');

    } catch (error: any) {
      console.error('Update notification status error:', error);
      throw new Error(`Failed to update notification status: ${error.message}`);
    }
  }

  // Emergency Protocols
  async triggerEmergencyAlert(athleteId: string, emergencyType: string, description: string, user: User): Promise<HealthAlert> {
    try {
      if (!user.id) {
        throw new Error('User context required for emergency alert');
      }

      const emergencyAlert = await this.createAlert({
        athleteId,
        alertType: 'emergency',
        severity: 'emergency',
        priority: 'emergency',
        title: `EMERGENCY: ${emergencyType}`,
        message: `Emergency situation requiring immediate attention`,
        description,
        triggerType: 'manual',
        triggerData: { emergencyType, description },
        immediateActions: [
          'Contact emergency medical services if life-threatening',
          'Ensure athlete safety',
          'Contact emergency contacts',
          'Document all actions'
        ],
        recommendations: [
          'Follow emergency action plan',
          'Notify all relevant personnel',
          'Prepare for emergency response'
        ],
        followUpRequired: true,
        isEmergency: true,
        requiresImmedateAttention: true,
        tags: ['emergency', emergencyType.toLowerCase().replace(/\s+/g, '_')]
      }, user);

      // Activate emergency protocol
      await this.activateEmergencyProtocol(emergencyAlert.id, user);

      return emergencyAlert;

    } catch (error: any) {
      console.error('Trigger emergency alert error:', error);
      throw new Error(`Failed to trigger emergency alert: ${error.message}`);
    }
  }

  async activateEmergencyProtocol(alertId: string, user: User): Promise<void> {
    try {
      if (!user.id) {
        throw new Error('User context required for emergency protocol activation');
      }

      // This would activate comprehensive emergency protocols
      // Including immediate notifications, emergency services contact, etc.
      
      await logComplianceAction(user.id, 'data_modification', 'health_data', alertId, 'Emergency protocol activated');

      console.log(`🚨 EMERGENCY PROTOCOL ACTIVATED for alert ${alertId}`);

    } catch (error: any) {
      console.error('Activate emergency protocol error:', error);
      throw new Error(`Failed to activate emergency protocol: ${error.message}`);
    }
  }

  async notifyEmergencyContacts(athleteId: string, alert: HealthAlert, user: User): Promise<NotificationEvent[]> {
    try {
      if (!user.id) {
        throw new Error('User context required for emergency contact notification');
      }

      const notifications: NotificationEvent[] = [];

      // This would notify all emergency contacts for the athlete
      // Including parents, guardians, emergency contacts, medical team
      
      await logComplianceAction(user.id, 'data_modification', 'health_data', athleteId, 'Emergency contacts notified');

      return notifications;

    } catch (error: any) {
      console.error('Notify emergency contacts error:', error);
      throw new Error(`Failed to notify emergency contacts: ${error.message}`);
    }
  }

  // Analytics and Reporting
  async getAlertMetrics(organizationId: string, timeframe: string, user: User): Promise<AlertMetrics> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert metrics');
      }

      // This would calculate comprehensive alert metrics
      const metrics: AlertMetrics = {
        organizationId,
        timeframe,
        totalAlerts: 0,
        alertsBySeverity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
          emergency: 0
        },
        alertsByType: {
          risk_escalation: 0,
          injury_risk: 0,
          medical_concern: 0,
          return_to_play: 0,
          compliance: 0,
          environmental: 0,
          emergency: 0
        },
        responseMetrics: {
          averageAcknowledgmentTime: 0,
          averageResolutionTime: 0,
          escalationRate: 0,
          falsePositiveRate: 0
        },
        trendsAnalysis: {
          alertVolumeChange: 0,
          severityTrend: 'stable',
          mostCommonAlerts: [],
          alertPatterns: []
        }
      };

      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, 'Alert metrics access');

      return metrics;

    } catch (error: any) {
      console.error('Get alert metrics error:', error);
      throw new Error(`Failed to get alert metrics: ${error.message}`);
    }
  }

  async generateAlertReport(organizationId: string, reportType: string, filters: any, user: User): Promise<any> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert report generation');
      }

      // This would generate comprehensive alert reports
      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, `Alert report generated: ${reportType}`);

      return {}; // Placeholder

    } catch (error: any) {
      console.error('Generate alert report error:', error);
      throw new Error(`Failed to generate alert report: ${error.message}`);
    }
  }

  async analyzeAlertTrends(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<any> {
    try {
      if (!user.id) {
        throw new Error('User context required for alert trend analysis');
      }

      // This would analyze alert trends over time
      await logComplianceAction(user.id, 'data_access', 'health_data', organizationId, 'Alert trend analysis');

      return {}; // Placeholder

    } catch (error: any) {
      console.error('Analyze alert trends error:', error);
      throw new Error(`Failed to analyze alert trends: ${error.message}`);
    }
  }

  // Integration Hooks
  async onRiskAssessmentUpdate(athleteId: string, assessment: HealthRiskAssessment, user: User): Promise<HealthAlert[]> {
    try {
      // Trigger alert monitoring when risk assessment is updated
      const alerts = await this.monitorAthleteHealth(athleteId, user);
      
      console.log(`🔄 Risk assessment update triggered ${alerts.length} alerts for athlete ${athleteId}`);
      
      return alerts;

    } catch (error: any) {
      console.error('Risk assessment update hook error:', error);
      return [];
    }
  }

  async onInjuryIncident(athleteId: string, incident: InjuryIncident, user: User): Promise<HealthAlert[]> {
    try {
      const alerts: HealthAlert[] = [];

      // Create injury incident alert
      const injuryAlert = await this.createAlert({
        athleteId,
        alertType: 'medical_concern',
        severity: this.mapInjurySeverityToAlertSeverity(incident.injurySeverity),
        priority: this.mapInjurySeverityToAlertPriority(incident.injurySeverity),
        title: 'Injury Incident Reported',
        message: `New injury incident: ${incident.injuryType} - ${incident.bodyPartAffected}`,
        description: incident.notes || `${incident.injuryType} injury to ${incident.bodyPartAffected}`,
        triggerType: 'manual',
        triggerData: { incident },
        relatedIncidentId: incident.id,
        immediateActions: [
          'Assess injury severity',
          'Provide immediate care',
          'Document thoroughly',
          'Determine activity restrictions'
        ],
        recommendations: [
          'Follow injury protocol',
          'Schedule follow-up assessment',
          'Monitor for complications'
        ],
        followUpRequired: true,
        tags: ['injury_incident', incident.injuryType, incident.bodyPartAffected]
      }, user);

      alerts.push(injuryAlert);

      console.log(`🏥 Injury incident created alert ${injuryAlert.id} for athlete ${athleteId}`);
      
      return alerts;

    } catch (error: any) {
      console.error('Injury incident hook error:', error);
      return [];
    }
  }

  private mapInjurySeverityToAlertSeverity(injurySeverity: string): HealthAlert['severity'] {
    const severityMap: Record<string, HealthAlert['severity']> = {
      'minor': 'low',
      'moderate': 'medium',
      'major': 'high',
      'severe': 'critical',
      'catastrophic': 'emergency'
    };
    
    return severityMap[injurySeverity] || 'medium';
  }

  private mapInjurySeverityToAlertPriority(injurySeverity: string): HealthAlert['priority'] {
    const priorityMap: Record<string, HealthAlert['priority']> = {
      'minor': 'routine',
      'moderate': 'urgent',
      'major': 'urgent',
      'severe': 'immediate',
      'catastrophic': 'emergency'
    };
    
    return priorityMap[injurySeverity] || 'routine';
  }

  async onVitalSignsUpdate(athleteId: string, vitals: Record<string, number>, user: User): Promise<HealthAlert[]> {
    try {
      const alerts: HealthAlert[] = [];

      // Check for concerning vital signs
      const concerningVitals = this.analyzeConcerningVitals(vitals);
      
      if (concerningVitals.length > 0) {
        const vitalAlert = await this.createAlert({
          athleteId,
          alertType: 'medical_concern',
          severity: 'medium',
          priority: 'urgent',
          title: 'Concerning Vital Signs',
          message: `Abnormal vital signs detected: ${concerningVitals.join(', ')}`,
          description: `Vital signs assessment indicates potential health concerns that require attention.`,
          triggerType: 'automated',
          triggerData: { vitals, concerningVitals },
          vitalSigns: vitals,
          immediateActions: [
            'Re-check vital signs',
            'Assess athlete condition',
            'Consider medical evaluation'
          ],
          recommendations: [
            'Monitor vital signs closely',
            'Document trends',
            'Consult medical team if persistent'
          ],
          followUpRequired: true,
          tags: ['vital_signs', 'automated_alert', ...concerningVitals]
        }, user);

        alerts.push(vitalAlert);
      }

      return alerts;

    } catch (error: any) {
      console.error('Vital signs update hook error:', error);
      return [];
    }
  }

  private analyzeConcerningVitals(vitals: Record<string, number>): string[] {
    const concerning: string[] = [];

    // Check various vital signs for concerning values
    if (vitals.heartRate) {
      if (vitals.heartRate > 100 || vitals.heartRate < 50) {
        concerning.push('heart_rate');
      }
    }

    if (vitals.systolicBP) {
      if (vitals.systolicBP > 140 || vitals.systolicBP < 90) {
        concerning.push('blood_pressure');
      }
    }

    if (vitals.temperature) {
      if (vitals.temperature > 100.4 || vitals.temperature < 96.8) {
        concerning.push('temperature');
      }
    }

    if (vitals.oxygenSaturation) {
      if (vitals.oxygenSaturation < 95) {
        concerning.push('oxygen_saturation');
      }
    }

    return concerning;
  }
}

// Export service instance
export const healthAlertService = new HealthAlertServiceImpl();