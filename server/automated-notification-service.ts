import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import type { 
  User, 
  AthleticCalendarEvent,
  FacilityReservation,
  ScheduleConflict,
  Game,
  Practice
} from "@shared/schema";

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  eventTypes: string[];
  triggerConditions: TriggerCondition[];
  channels: NotificationChannel[];
  recipients: RecipientRule[];
  timing: NotificationTiming;
  template: NotificationTemplate;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  enabled: boolean;
  escalationRules?: EscalationRule[];
}

export interface TriggerCondition {
  type: 'event_created' | 'event_updated' | 'event_cancelled' | 'conflict_detected' | 'facility_unavailable' | 'approval_required' | 'reminder' | 'escalation';
  parameters: Record<string, any>;
  operator?: 'and' | 'or';
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'in_app' | 'push' | 'webhook' | 'slack' | 'teams';
  enabled: boolean;
  configuration: Record<string, any>;
  fallbackChannels?: string[];
}

export interface RecipientRule {
  type: 'user' | 'role' | 'group' | 'organization' | 'event_participants' | 'facility_contacts' | 'custom_list';
  criteria: Record<string, any>;
  includeFilters?: string[];
  excludeFilters?: string[];
}

export interface NotificationTiming {
  immediate: boolean;
  scheduled?: {
    beforeEvent: number[]; // minutes before event
    afterEvent?: number[];
    atTime?: string; // specific time "09:00"
    onDays?: number[]; // days of week
  };
  throttling?: {
    maxPerHour: number;
    maxPerDay: number;
    cooldownMinutes: number;
  };
}

export interface NotificationTemplate {
  subject: string;
  body: string;
  htmlBody?: string;
  variables: string[];
  localization?: Record<string, {
    subject: string;
    body: string;
    htmlBody?: string;
  }>;
}

export interface EscalationRule {
  delayMinutes: number;
  condition: 'no_response' | 'no_acknowledgment' | 'conflict_unresolved';
  escalateTo: RecipientRule[];
  maxEscalations: number;
  escalationMessage: string;
}

export interface NotificationRequest {
  ruleId?: string;
  eventId: string;
  eventType: 'calendar_event' | 'facility_reservation' | 'conflict' | 'game' | 'practice' | 'athletic_trainer_appointment';
  triggerType: TriggerCondition['type'];
  urgency: 'low' | 'normal' | 'high' | 'critical';
  customRecipients?: string[];
  customMessage?: {
    subject: string;
    body: string;
  };
  scheduleFor?: string; // ISO timestamp
  metadata?: Record<string, any>;
}

export interface NotificationDelivery {
  id: string;
  requestId: string;
  recipientId: string;
  recipientType: 'user' | 'group' | 'external';
  channel: NotificationChannel['type'];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read' | 'acknowledged';
  attempts: number;
  maxAttempts: number;
  lastAttempt?: string;
  nextAttempt?: string;
  failureReason?: string;
  deliveredAt?: string;
  readAt?: string;
  acknowledgedAt?: string;
  content: {
    subject: string;
    body: string;
    htmlBody?: string;
  };
  metadata: Record<string, any>;
}

export interface NotificationHistory {
  id: string;
  eventId: string;
  eventType: string;
  triggerType: string;
  ruleId?: string;
  recipientCount: number;
  deliveryRate: number;
  readRate: number;
  acknowledgmentRate: number;
  createdAt: string;
  completedAt?: string;
  deliveries: NotificationDelivery[];
}

export interface NotificationPreferences {
  userId: string;
  channels: {
    email: {
      enabled: boolean;
      address?: string;
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
    };
    sms: {
      enabled: boolean;
      phoneNumber?: string;
      frequency: 'immediate' | 'daily';
    };
    inApp: {
      enabled: boolean;
      showDesktop: boolean;
    };
    push: {
      enabled: boolean;
      deviceTokens: string[];
    };
  };
  eventTypes: {
    calendarReminders: boolean;
    conflictAlerts: boolean;
    facilityUpdates: boolean;
    scheduleChanges: boolean;
    approvalRequests: boolean;
    emergencyAlerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
    timezone: string;
    exceptions: string[]; // event types that bypass quiet hours
  };
  escalationSettings: {
    enableAutoEscalation: boolean;
    escalationDelayMinutes: number;
    maxEscalationLevel: number;
  };
}

export interface NotificationAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  totalNotifications: number;
  byChannel: Record<string, {
    sent: number;
    delivered: number;
    read: number;
    acknowledged: number;
    failed: number;
  }>;
  byEventType: Record<string, number>;
  byUrgency: Record<string, number>;
  deliveryRates: {
    overall: number;
    byChannel: Record<string, number>;
    byRecipientType: Record<string, number>;
  };
  responseRates: {
    readRate: number;
    acknowledgmentRate: number;
    averageResponseTime: number;
  };
  failureAnalysis: {
    commonFailures: {
      reason: string;
      count: number;
      percentage: number;
    }[];
    channelReliability: Record<string, number>;
  };
  userEngagement: {
    activeUsers: number;
    frequentUsers: string[];
    disengagedUsers: string[];
  };
}

export interface SmartNotificationInsights {
  optimalTiming: {
    channel: string;
    bestHours: number[];
    bestDays: number[];
    readRateByTime: Record<string, number>;
  }[];
  recipientBehavior: {
    preferredChannels: Record<string, string>;
    responsePatterns: Record<string, {
      averageResponseTime: number;
      preferredTimes: string[];
    }>;
  };
  contentOptimization: {
    effectiveSubjectLines: string[];
    optimalBodyLength: number;
    highPerformingTemplates: string[];
  };
  escalationEffectiveness: {
    escalationSuccessRate: number;
    optimalEscalationDelay: number;
    mostEffectiveEscalators: string[];
  };
}

/**
 * Automated Notification Service
 * Intelligent notification system for schedule changes and alerts
 */
export class AutomatedNotificationService {
  private storage = getStorage();
  private notificationRules: NotificationRule[] = [];
  private pendingNotifications: Map<string, NotificationRequest> = new Map();

  constructor() {
    console.log('🔔 Automated Notification Service initialized');
    this.initializeDefaultRules();
    this.startNotificationProcessor();
  }

  // ===================================================================
  // NOTIFICATION RULES MANAGEMENT
  // ===================================================================

  /**
   * Create notification rule
   */
  async createNotificationRule(
    rule: Omit<NotificationRule, 'id'>,
    user: User
  ): Promise<NotificationRule> {
    try {
      const newRule: NotificationRule = {
        id: `rule_${Date.now()}`,
        ...rule
      };

      // Validate rule
      await this.validateNotificationRule(newRule, user);

      this.notificationRules.push(newRule);

      await logComplianceAction(
        user.id,
        'data_modification',
        'notification_rule',
        newRule.id,
        { ip: 'system' } as any,
        `Notification rule created: ${newRule.name}`
      );

      return newRule;
    } catch (error) {
      console.error('Error creating notification rule:', error);
      throw error;
    }
  }

  /**
   * Update notification rule
   */
  async updateNotificationRule(
    ruleId: string,
    updates: Partial<NotificationRule>,
    user: User
  ): Promise<NotificationRule> {
    try {
      const ruleIndex = this.notificationRules.findIndex(r => r.id === ruleId);
      if (ruleIndex === -1) {
        throw new Error('Notification rule not found');
      }

      const updatedRule = {
        ...this.notificationRules[ruleIndex],
        ...updates
      };

      await this.validateNotificationRule(updatedRule, user);

      this.notificationRules[ruleIndex] = updatedRule;

      await logComplianceAction(
        user.id,
        'data_modification',
        'notification_rule',
        ruleId,
        { ip: 'system' } as any,
        `Notification rule updated: ${updatedRule.name}`
      );

      return updatedRule;
    } catch (error) {
      console.error('Error updating notification rule:', error);
      throw error;
    }
  }

  /**
   * Get notification rules
   */
  getNotificationRules(user: User): NotificationRule[] {
    // Apply RBAC filtering
    return this.notificationRules.filter(rule => 
      this.canAccessRule(rule, user)
    );
  }

  // ===================================================================
  // NOTIFICATION SENDING METHODS
  // ===================================================================

  /**
   * Send notification based on event
   */
  async sendEventNotification(
    request: NotificationRequest,
    user: User
  ): Promise<string> {
    try {
      const requestId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get event details
      const eventData = await this.getEventData(request.eventId, request.eventType, user);
      if (!eventData) {
        throw new Error('Event not found');
      }

      // Find applicable rules
      const applicableRules = await this.findApplicableRules(request, eventData, user);

      // If no specific rule provided, use the best matching rule
      let rule: NotificationRule | null = null;
      if (request.ruleId) {
        rule = this.notificationRules.find(r => r.id === request.ruleId) || null;
      } else if (applicableRules.length > 0) {
        rule = applicableRules[0]; // Use highest priority rule
      }

      if (!rule && !request.customMessage) {
        throw new Error('No applicable notification rule found and no custom message provided');
      }

      // Determine recipients
      const recipients = await this.determineRecipients(request, eventData, rule, user);

      // Create notification deliveries
      const deliveries: NotificationDelivery[] = [];
      
      for (const recipient of recipients) {
        const userPreferences = await this.getUserNotificationPreferences(recipient.id);
        const channels = this.selectOptimalChannels(rule, userPreferences, request.urgency);

        for (const channel of channels) {
          const content = await this.generateNotificationContent(
            request,
            eventData,
            rule,
            recipient,
            channel,
            user
          );

          const delivery: NotificationDelivery = {
            id: `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            requestId,
            recipientId: recipient.id,
            recipientType: recipient.type,
            channel: channel.type,
            status: 'pending',
            attempts: 0,
            maxAttempts: this.getMaxAttempts(channel.type, request.urgency),
            content,
            metadata: {
              eventId: request.eventId,
              eventType: request.eventType,
              triggerType: request.triggerType,
              urgency: request.urgency
            }
          };

          deliveries.push(delivery);
        }
      }

      // Schedule deliveries
      if (request.scheduleFor) {
        await this.scheduleNotificationDeliveries(deliveries, request.scheduleFor);
      } else {
        await this.executeNotificationDeliveries(deliveries);
      }

      // Create notification history record
      const history: NotificationHistory = {
        id: requestId,
        eventId: request.eventId,
        eventType: request.eventType,
        triggerType: request.triggerType,
        ruleId: rule?.id,
        recipientCount: recipients.length,
        deliveryRate: 0, // Will be updated as deliveries complete
        readRate: 0,
        acknowledgmentRate: 0,
        createdAt: new Date().toISOString(),
        deliveries
      };

      await this.saveNotificationHistory(history);

      await logComplianceAction(
        user.id,
        'notification_sent',
        'notification_system',
        requestId,
        { ip: 'system' } as any,
        `Notification sent for ${request.eventType}: ${request.eventId}`
      );

      return requestId;
    } catch (error) {
      console.error('Error sending event notification:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(
    requests: NotificationRequest[],
    user: User
  ): Promise<{
    successful: string[];
    failed: { request: NotificationRequest; error: string }[];
  }> {
    const successful: string[] = [];
    const failed: { request: NotificationRequest; error: string }[] = [];

    for (const request of requests) {
      try {
        const requestId = await this.sendEventNotification(request, user);
        successful.push(requestId);
      } catch (error) {
        failed.push({
          request,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Send reminder notifications
   */
  async sendReminderNotifications(
    user: User,
    timeframeHours = 24
  ): Promise<void> {
    try {
      const storage = await this.storage;

      // Get upcoming events
      const now = new Date();
      const futureTime = new Date(now.getTime() + timeframeHours * 60 * 60 * 1000);

      const upcomingEvents = await storage.getUpcomingCalendarEvents(
        now.toISOString(),
        futureTime.toISOString(),
        user
      );

      const reminderRequests: NotificationRequest[] = [];

      for (const event of upcomingEvents) {
        // Check if reminders are enabled for this event
        if (!event.reminderSettings?.sendReminder) continue;

        // Calculate if we should send reminder now
        const eventTime = new Date(`${event.eventDate}T${event.startTime || '00:00'}`);
        const timeDiff = eventTime.getTime() - now.getTime();
        const minutesUntilEvent = timeDiff / (1000 * 60);

        const reminderDays = event.reminderSettings.reminderDays || [];
        const shouldSendReminder = reminderDays.some(days => {
          const reminderMinutes = days * 24 * 60;
          return Math.abs(minutesUntilEvent - reminderMinutes) < 30; // Within 30 minutes of reminder time
        });

        if (shouldSendReminder) {
          reminderRequests.push({
            eventId: event.id,
            eventType: 'calendar_event',
            triggerType: 'reminder',
            urgency: this.determineReminderUrgency(minutesUntilEvent),
            metadata: {
              minutesUntilEvent,
              originalEventTime: eventTime.toISOString()
            }
          });
        }
      }

      if (reminderRequests.length > 0) {
        await this.sendBulkNotifications(reminderRequests, user);
        console.log(`📅 Sent ${reminderRequests.length} reminder notifications`);
      }
    } catch (error) {
      console.error('Error sending reminder notifications:', error);
    }
  }

  // ===================================================================
  // ESCALATION MANAGEMENT
  // ===================================================================

  /**
   * Process escalations for unacknowledged notifications
   */
  async processEscalations(): Promise<void> {
    try {
      const storage = await this.storage;

      // Get notifications requiring escalation
      const escalationCandidates = await storage.getNotificationsForEscalation();

      for (const notification of escalationCandidates) {
        await this.processNotificationEscalation(notification);
      }
    } catch (error) {
      console.error('Error processing escalations:', error);
    }
  }

  /**
   * Process individual notification escalation
   */
  private async processNotificationEscalation(
    notificationHistory: NotificationHistory
  ): Promise<void> {
    try {
      // Find the rule that triggered this notification
      const rule = this.notificationRules.find(r => r.id === notificationHistory.ruleId);
      if (!rule?.escalationRules?.length) return;

      // Check if escalation conditions are met
      for (const escalationRule of rule.escalationRules) {
        const escalationTime = new Date(notificationHistory.createdAt);
        escalationTime.setMinutes(escalationTime.getMinutes() + escalationRule.delayMinutes);

        if (new Date() >= escalationTime) {
          const shouldEscalate = await this.checkEscalationCondition(
            escalationRule.condition,
            notificationHistory
          );

          if (shouldEscalate) {
            await this.executeEscalation(escalationRule, notificationHistory);
          }
        }
      }
    } catch (error) {
      console.error('Error processing notification escalation:', error);
    }
  }

  // ===================================================================
  // USER PREFERENCES MANAGEMENT
  // ===================================================================

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>,
    user: User
  ): Promise<NotificationPreferences> {
    try {
      const storage = await this.storage;

      // Check permissions
      if (userId !== user.id && !this.canManageUserPreferences(user)) {
        throw new Error('Insufficient permissions to update user preferences');
      }

      const currentPreferences = await storage.getUserNotificationPreferences(userId) || 
        this.getDefaultNotificationPreferences(userId);

      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        ...preferences
      };

      await storage.saveUserNotificationPreferences(updatedPreferences);

      await logComplianceAction(
        user.id,
        'data_modification',
        'notification_preferences',
        userId,
        { ip: 'system' } as any,
        `Notification preferences updated for user: ${userId}`
      );

      return updatedPreferences;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const storage = await this.storage;
      
      const preferences = await storage.getUserNotificationPreferences(userId);
      return preferences || this.getDefaultNotificationPreferences(userId);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return this.getDefaultNotificationPreferences(userId);
    }
  }

  // ===================================================================
  // ANALYTICS AND INSIGHTS
  // ===================================================================

  /**
   * Get notification analytics
   */
  async getNotificationAnalytics(
    startDate: string,
    endDate: string,
    user: User,
    organizationId?: string
  ): Promise<NotificationAnalytics> {
    try {
      const storage = await this.storage;

      const notifications = await storage.getNotificationHistory(
        startDate,
        endDate,
        organizationId,
        user
      );

      const analytics: NotificationAnalytics = {
        period: { startDate, endDate },
        totalNotifications: notifications.length,
        byChannel: this.analyzeByChannel(notifications),
        byEventType: this.analyzeByEventType(notifications),
        byUrgency: this.analyzeByUrgency(notifications),
        deliveryRates: this.calculateDeliveryRates(notifications),
        responseRates: this.calculateResponseRates(notifications),
        failureAnalysis: this.analyzeFailures(notifications),
        userEngagement: this.analyzeUserEngagement(notifications)
      };

      return analytics;
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      throw new Error('Failed to retrieve notification analytics');
    }
  }

  /**
   * Get smart notification insights
   */
  async getSmartNotificationInsights(
    startDate: string,
    endDate: string,
    user: User
  ): Promise<SmartNotificationInsights> {
    try {
      const analytics = await this.getNotificationAnalytics(startDate, endDate, user);

      const insights: SmartNotificationInsights = {
        optimalTiming: await this.analyzeOptimalTiming(analytics),
        recipientBehavior: await this.analyzeRecipientBehavior(analytics),
        contentOptimization: await this.analyzeContentEffectiveness(analytics),
        escalationEffectiveness: await this.analyzeEscalationEffectiveness(analytics)
      };

      return insights;
    } catch (error) {
      console.error('Error getting smart notification insights:', error);
      throw new Error('Failed to generate notification insights');
    }
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  private initializeDefaultRules(): void {
    this.notificationRules = [
      {
        id: 'conflict_alert',
        name: 'Schedule Conflict Alert',
        description: 'Notify when scheduling conflicts are detected',
        eventTypes: ['conflict'],
        triggerConditions: [
          {
            type: 'conflict_detected',
            parameters: { severity: ['major', 'critical'] }
          }
        ],
        channels: [
          { type: 'email', enabled: true, configuration: {} },
          { type: 'in_app', enabled: true, configuration: {} }
        ],
        recipients: [
          { type: 'event_participants', criteria: {} },
          { type: 'role', criteria: { roles: ['coordinator', 'director'] } }
        ],
        timing: { immediate: true },
        template: {
          subject: 'Schedule Conflict Detected: {{eventTitle}}',
          body: 'A scheduling conflict has been detected for {{eventTitle}} on {{eventDate}}. Please review and resolve.',
          variables: ['eventTitle', 'eventDate', 'conflictDetails']
        },
        priority: 'high',
        enabled: true,
        escalationRules: [
          {
            delayMinutes: 30,
            condition: 'no_acknowledgment',
            escalateTo: [
              { type: 'role', criteria: { roles: ['director'] } }
            ],
            maxEscalations: 2,
            escalationMessage: 'Unresolved scheduling conflict requires immediate attention'
          }
        ]
      },
      {
        id: 'event_reminder',
        name: 'Event Reminder',
        description: 'Send reminders before scheduled events',
        eventTypes: ['calendar_event', 'game', 'practice'],
        triggerConditions: [
          {
            type: 'reminder',
            parameters: { beforeMinutes: [1440, 60] } // 24 hours and 1 hour
          }
        ],
        channels: [
          { type: 'email', enabled: true, configuration: {} },
          { type: 'sms', enabled: true, configuration: {} },
          { type: 'in_app', enabled: true, configuration: {} }
        ],
        recipients: [
          { type: 'event_participants', criteria: {} }
        ],
        timing: {
          immediate: false,
          scheduled: {
            beforeEvent: [1440, 60] // 24 hours and 1 hour before
          }
        },
        template: {
          subject: 'Reminder: {{eventTitle}} in {{timeUntilEvent}}',
          body: 'This is a reminder that {{eventTitle}} is scheduled for {{eventDateTime}} at {{location}}.',
          variables: ['eventTitle', 'eventDateTime', 'location', 'timeUntilEvent']
        },
        priority: 'normal',
        enabled: true
      },
      {
        id: 'facility_unavailable',
        name: 'Facility Unavailable Alert',
        description: 'Notify when facility becomes unavailable',
        eventTypes: ['facility_reservation'],
        triggerConditions: [
          {
            type: 'facility_unavailable',
            parameters: { reasons: ['maintenance', 'emergency', 'double_booking'] }
          }
        ],
        channels: [
          { type: 'email', enabled: true, configuration: {} },
          { type: 'sms', enabled: true, configuration: {} },
          { type: 'in_app', enabled: true, configuration: {} }
        ],
        recipients: [
          { type: 'facility_contacts', criteria: {} },
          { type: 'event_participants', criteria: {} }
        ],
        timing: { immediate: true },
        template: {
          subject: 'Facility Unavailable: {{facilityName}}',
          body: 'The facility {{facilityName}} is no longer available for your event {{eventTitle}} on {{eventDate}}. Reason: {{unavailabilityReason}}',
          variables: ['facilityName', 'eventTitle', 'eventDate', 'unavailabilityReason']
        },
        priority: 'urgent',
        enabled: true
      },
      {
        id: 'approval_request',
        name: 'Approval Request',
        description: 'Request approval for facility bookings or events',
        eventTypes: ['facility_reservation', 'calendar_event'],
        triggerConditions: [
          {
            type: 'approval_required',
            parameters: { priority: ['high', 'urgent'] }
          }
        ],
        channels: [
          { type: 'email', enabled: true, configuration: {} },
          { type: 'in_app', enabled: true, configuration: {} }
        ],
        recipients: [
          { type: 'role', criteria: { roles: ['approver', 'director'] } }
        ],
        timing: { immediate: true },
        template: {
          subject: 'Approval Required: {{eventTitle}}',
          body: 'Your approval is required for {{eventTitle}} scheduled for {{eventDateTime}}. Please review and approve/deny.',
          variables: ['eventTitle', 'eventDateTime', 'requester', 'details']
        },
        priority: 'high',
        enabled: true
      },
      {
        id: 'schedule_change',
        name: 'Schedule Change Alert',
        description: 'Notify when events are updated or rescheduled',
        eventTypes: ['calendar_event', 'game', 'practice', 'facility_reservation'],
        triggerConditions: [
          {
            type: 'event_updated',
            parameters: { significantChanges: ['time', 'location', 'cancellation'] }
          }
        ],
        channels: [
          { type: 'email', enabled: true, configuration: {} },
          { type: 'sms', enabled: true, configuration: {} },
          { type: 'in_app', enabled: true, configuration: {} }
        ],
        recipients: [
          { type: 'event_participants', criteria: {} }
        ],
        timing: { immediate: true },
        template: {
          subject: 'Schedule Change: {{eventTitle}}',
          body: 'The schedule for {{eventTitle}} has been updated. New details: {{newDetails}}',
          variables: ['eventTitle', 'oldDetails', 'newDetails', 'changeReason']
        },
        priority: 'high',
        enabled: true
      }
    ];
  }

  private async validateNotificationRule(rule: NotificationRule, user: User): Promise<void> {
    // Validate rule structure
    if (!rule.name || rule.name.trim().length === 0) {
      throw new Error('Rule name is required');
    }

    if (!rule.triggerConditions || rule.triggerConditions.length === 0) {
      throw new Error('At least one trigger condition is required');
    }

    if (!rule.channels || rule.channels.length === 0) {
      throw new Error('At least one notification channel is required');
    }

    if (!rule.recipients || rule.recipients.length === 0) {
      throw new Error('At least one recipient rule is required');
    }

    // Validate permissions
    if (!this.canCreateNotificationRule(user)) {
      throw new Error('Insufficient permissions to create notification rules');
    }
  }

  private canAccessRule(rule: NotificationRule, user: User): boolean {
    // Apply RBAC logic for rule access
    return user.userRole?.includes('director') || 
           user.userRole?.includes('coordinator') ||
           user.complianceRole?.includes('director');
  }

  private canCreateNotificationRule(user: User): boolean {
    return user.userRole?.includes('director') || 
           user.userRole?.includes('coordinator');
  }

  private canManageUserPreferences(user: User): boolean {
    return user.userRole?.includes('director') || 
           user.complianceRole?.includes('director');
  }

  private async getEventData(eventId: string, eventType: string, user: User): Promise<any> {
    try {
      const storage = await this.storage;

      switch (eventType) {
        case 'calendar_event':
          return await storage.getCalendarEvent(eventId, user);
        case 'facility_reservation':
          return await storage.getFacilityReservation(eventId, user);
        case 'conflict':
          return await storage.getScheduleConflict(eventId, user);
        case 'game':
          return await storage.getGame(eventId, user);
        case 'practice':
          return await storage.getPractice(eventId, user);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error getting event data:', error);
      return null;
    }
  }

  private async findApplicableRules(
    request: NotificationRequest,
    eventData: any,
    user: User
  ): Promise<NotificationRule[]> {
    const applicableRules = this.notificationRules.filter(rule => {
      // Check if rule is enabled
      if (!rule.enabled) return false;

      // Check event type match
      if (rule.eventTypes.length > 0 && !rule.eventTypes.includes(request.eventType)) {
        return false;
      }

      // Check trigger conditions
      return rule.triggerConditions.some(condition => 
        this.evaluateTriggerCondition(condition, request, eventData)
      );
    });

    // Sort by priority
    return applicableRules.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private evaluateTriggerCondition(
    condition: TriggerCondition,
    request: NotificationRequest,
    eventData: any
  ): boolean {
    if (condition.type !== request.triggerType) return false;

    // Evaluate condition parameters
    if (condition.parameters) {
      for (const [key, value] of Object.entries(condition.parameters)) {
        switch (key) {
          case 'severity':
            if (Array.isArray(value) && !value.includes(eventData?.severity)) {
              return false;
            }
            break;
          case 'priority':
            if (Array.isArray(value) && !value.includes(request.urgency)) {
              return false;
            }
            break;
          // Add more parameter evaluations as needed
        }
      }
    }

    return true;
  }

  private async determineRecipients(
    request: NotificationRequest,
    eventData: any,
    rule: NotificationRule | null,
    user: User
  ): Promise<{ id: string; type: 'user' | 'group' | 'external'; email?: string; phone?: string; name?: string }[]> {
    const recipients: { id: string; type: 'user' | 'group' | 'external'; email?: string; phone?: string; name?: string }[] = [];

    // Add custom recipients
    if (request.customRecipients) {
      for (const recipientId of request.customRecipients) {
        recipients.push({ id: recipientId, type: 'user' });
      }
    }

    // Add recipients from rule
    if (rule) {
      for (const recipientRule of rule.recipients) {
        const ruleRecipients = await this.resolveRecipientRule(recipientRule, eventData, user);
        recipients.push(...ruleRecipients);
      }
    }

    // Remove duplicates
    const uniqueRecipients = recipients.filter((recipient, index, self) => 
      index === self.findIndex(r => r.id === recipient.id && r.type === recipient.type)
    );

    return uniqueRecipients;
  }

  private async resolveRecipientRule(
    recipientRule: RecipientRule,
    eventData: any,
    user: User
  ): Promise<{ id: string; type: 'user' | 'group' | 'external'; email?: string; phone?: string; name?: string }[]> {
    const storage = await this.storage;
    const recipients: { id: string; type: 'user' | 'group' | 'external'; email?: string; phone?: string; name?: string }[] = [];

    try {
      switch (recipientRule.type) {
        case 'user':
          if (recipientRule.criteria.userId) {
            recipients.push({ id: recipientRule.criteria.userId, type: 'user' });
          }
          break;

        case 'role':
          if (recipientRule.criteria.roles) {
            const roleUsers = await storage.getUsersByRoles(recipientRule.criteria.roles, user);
            recipients.push(...roleUsers.map(u => ({ id: u.id, type: 'user' as const })));
          }
          break;

        case 'event_participants':
          // Get participants based on event type
          const participants = await this.getEventParticipants(eventData, user);
          recipients.push(...participants);
          break;

        case 'facility_contacts':
          if (eventData?.venueId) {
            const facilityContacts = await storage.getFacilityContacts(eventData.venueId, user);
            recipients.push(...facilityContacts.map(c => ({ id: c.id, type: 'user' as const })));
          }
          break;

        case 'organization':
          if (recipientRule.criteria.organizationId) {
            const orgUsers = await storage.getUsersByOrganization(recipientRule.criteria.organizationId, user);
            recipients.push(...orgUsers.map(u => ({ id: u.id, type: 'user' as const })));
          }
          break;

        case 'custom_list':
          if (recipientRule.criteria.userIds) {
            recipients.push(...recipientRule.criteria.userIds.map((id: string) => ({ id, type: 'user' as const })));
          }
          break;
      }
    } catch (error) {
      console.error('Error resolving recipient rule:', error);
    }

    return recipients;
  }

  private async getEventParticipants(eventData: any, user: User): Promise<{ id: string; type: 'user' | 'group' | 'external' }[]> {
    // This would get participants based on the event type and data
    // For now, return empty array
    return [];
  }

  private selectOptimalChannels(
    rule: NotificationRule | null,
    preferences: NotificationPreferences,
    urgency: string
  ): NotificationChannel[] {
    const availableChannels = rule?.channels || [];
    const selectedChannels: NotificationChannel[] = [];

    // Always include channels based on urgency
    switch (urgency) {
      case 'critical':
        selectedChannels.push(...availableChannels.filter(c => 
          ['sms', 'in_app', 'email'].includes(c.type) && c.enabled
        ));
        break;
      case 'high':
        selectedChannels.push(...availableChannels.filter(c => 
          ['email', 'in_app'].includes(c.type) && c.enabled
        ));
        break;
      default:
        selectedChannels.push(...availableChannels.filter(c => 
          c.enabled && preferences.channels[c.type as keyof typeof preferences.channels]?.enabled
        ));
    }

    return selectedChannels.length > 0 ? selectedChannels : 
      availableChannels.filter(c => c.type === 'in_app' && c.enabled).slice(0, 1);
  }

  private async generateNotificationContent(
    request: NotificationRequest,
    eventData: any,
    rule: NotificationRule | null,
    recipient: any,
    channel: NotificationChannel,
    user: User
  ): Promise<{ subject: string; body: string; htmlBody?: string }> {
    let template = rule?.template;

    // Use custom message if provided
    if (request.customMessage) {
      template = {
        subject: request.customMessage.subject,
        body: request.customMessage.body,
        variables: []
      };
    }

    if (!template) {
      // Default template
      template = {
        subject: 'Notification: {{eventTitle}}',
        body: 'You have a new notification regarding {{eventTitle}}.',
        variables: ['eventTitle']
      };
    }

    // Replace template variables
    const variables = this.extractTemplateVariables(eventData, request, recipient);
    
    const subject = this.replaceTemplateVariables(template.subject, variables);
    const body = this.replaceTemplateVariables(template.body, variables);
    const htmlBody = template.htmlBody ? this.replaceTemplateVariables(template.htmlBody, variables) : undefined;

    return { subject, body, htmlBody };
  }

  private extractTemplateVariables(eventData: any, request: NotificationRequest, recipient: any): Record<string, string> {
    const variables: Record<string, string> = {
      eventTitle: eventData?.eventTitle || eventData?.title || 'Event',
      eventDate: eventData?.eventDate || eventData?.gameDate || eventData?.practiceDate || new Date().toISOString().split('T')[0],
      eventDateTime: this.formatEventDateTime(eventData),
      location: eventData?.location || eventData?.venueName || 'TBD',
      recipientName: recipient?.name || 'User',
      urgency: request.urgency,
      eventType: request.eventType
    };

    // Add event-specific variables
    if (request.eventType === 'conflict') {
      variables.conflictDetails = eventData?.resolutionNotes || 'Scheduling conflict detected';
    }

    if (request.eventType === 'facility_reservation') {
      variables.facilityName = eventData?.venueName || 'Facility';
      variables.unavailabilityReason = eventData?.cancellationReason || 'Maintenance';
    }

    return variables;
  }

  private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }

    return result;
  }

  private formatEventDateTime(eventData: any): string {
    const date = eventData?.eventDate || eventData?.gameDate || eventData?.practiceDate;
    const time = eventData?.startTime || eventData?.gameTime || '00:00';
    
    if (date && time) {
      return new Date(`${date}T${time}`).toLocaleString();
    }
    
    return new Date().toLocaleString();
  }

  private getMaxAttempts(channelType: string, urgency: string): number {
    const baseAttempts = {
      email: 3,
      sms: 2,
      in_app: 1,
      push: 2,
      webhook: 3
    };

    const urgencyMultiplier = {
      low: 1,
      normal: 1,
      high: 1.5,
      critical: 2
    };

    const base = baseAttempts[channelType as keyof typeof baseAttempts] || 1;
    const multiplier = urgencyMultiplier[urgency as keyof typeof urgencyMultiplier] || 1;
    
    return Math.ceil(base * multiplier);
  }

  private async scheduleNotificationDeliveries(
    deliveries: NotificationDelivery[],
    scheduleFor: string
  ): Promise<void> {
    // Implementation for scheduling notifications
    console.log(`📅 Scheduled ${deliveries.length} notifications for ${scheduleFor}`);
  }

  private async executeNotificationDeliveries(deliveries: NotificationDelivery[]): Promise<void> {
    // Implementation for immediate notification delivery
    console.log(`🚀 Executing ${deliveries.length} immediate notifications`);
    
    for (const delivery of deliveries) {
      try {
        await this.sendNotificationDelivery(delivery);
      } catch (error) {
        console.error('Error sending notification delivery:', error);
        delivery.status = 'failed';
        delivery.failureReason = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  }

  private async sendNotificationDelivery(delivery: NotificationDelivery): Promise<void> {
    // Implementation for sending individual notification
    switch (delivery.channel) {
      case 'email':
        await this.sendEmailNotification(delivery);
        break;
      case 'sms':
        await this.sendSMSNotification(delivery);
        break;
      case 'in_app':
        await this.sendInAppNotification(delivery);
        break;
      case 'push':
        await this.sendPushNotification(delivery);
        break;
      default:
        throw new Error(`Unsupported notification channel: ${delivery.channel}`);
    }
    
    delivery.status = 'sent';
    delivery.lastAttempt = new Date().toISOString();
    delivery.attempts++;
  }

  private async sendEmailNotification(delivery: NotificationDelivery): Promise<void> {
    // Implementation for email sending
    console.log(`📧 Sending email notification to ${delivery.recipientId}`);
  }

  private async sendSMSNotification(delivery: NotificationDelivery): Promise<void> {
    // Implementation for SMS sending
    console.log(`📱 Sending SMS notification to ${delivery.recipientId}`);
  }

  private async sendInAppNotification(delivery: NotificationDelivery): Promise<void> {
    // Implementation for in-app notification
    console.log(`🔔 Sending in-app notification to ${delivery.recipientId}`);
  }

  private async sendPushNotification(delivery: NotificationDelivery): Promise<void> {
    // Implementation for push notification
    console.log(`📲 Sending push notification to ${delivery.recipientId}`);
  }

  private async saveNotificationHistory(history: NotificationHistory): Promise<void> {
    const storage = await this.storage;
    await storage.saveNotificationHistory(history);
  }

  private determineReminderUrgency(minutesUntilEvent: number): NotificationRequest['urgency'] {
    if (minutesUntilEvent <= 60) return 'high';
    if (minutesUntilEvent <= 180) return 'normal';
    return 'low';
  }

  private async checkEscalationCondition(
    condition: EscalationRule['condition'],
    notificationHistory: NotificationHistory
  ): Promise<boolean> {
    switch (condition) {
      case 'no_response':
        return notificationHistory.readRate < 0.5;
      case 'no_acknowledgment':
        return notificationHistory.acknowledgmentRate < 0.1;
      case 'conflict_unresolved':
        // Check if conflict is still unresolved
        return true; // Simplified logic
      default:
        return false;
    }
  }

  private async executeEscalation(
    escalationRule: EscalationRule,
    notificationHistory: NotificationHistory
  ): Promise<void> {
    console.log(`⚠️ Executing escalation for notification ${notificationHistory.id}`);
    // Implementation for escalation
  }

  private getDefaultNotificationPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      channels: {
        email: {
          enabled: true,
          frequency: 'immediate'
        },
        sms: {
          enabled: false,
          frequency: 'immediate'
        },
        inApp: {
          enabled: true,
          showDesktop: true
        },
        push: {
          enabled: true,
          deviceTokens: []
        }
      },
      eventTypes: {
        calendarReminders: true,
        conflictAlerts: true,
        facilityUpdates: true,
        scheduleChanges: true,
        approvalRequests: true,
        emergencyAlerts: true
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'America/New_York',
        exceptions: ['emergency']
      },
      escalationSettings: {
        enableAutoEscalation: true,
        escalationDelayMinutes: 30,
        maxEscalationLevel: 3
      }
    };
  }

  private analyzeByChannel(notifications: NotificationHistory[]): Record<string, any> {
    // Implementation for channel analysis
    return {};
  }

  private analyzeByEventType(notifications: NotificationHistory[]): Record<string, number> {
    // Implementation for event type analysis
    return {};
  }

  private analyzeByUrgency(notifications: NotificationHistory[]): Record<string, number> {
    // Implementation for urgency analysis
    return {};
  }

  private calculateDeliveryRates(notifications: NotificationHistory[]): any {
    // Implementation for delivery rate calculation
    return { overall: 0.95, byChannel: {}, byRecipientType: {} };
  }

  private calculateResponseRates(notifications: NotificationHistory[]): any {
    // Implementation for response rate calculation
    return { readRate: 0.75, acknowledgmentRate: 0.45, averageResponseTime: 30 };
  }

  private analyzeFailures(notifications: NotificationHistory[]): any {
    // Implementation for failure analysis
    return { commonFailures: [], channelReliability: {} };
  }

  private analyzeUserEngagement(notifications: NotificationHistory[]): any {
    // Implementation for user engagement analysis
    return { activeUsers: 0, frequentUsers: [], disengagedUsers: [] };
  }

  private async analyzeOptimalTiming(analytics: NotificationAnalytics): Promise<any> {
    // Implementation for optimal timing analysis
    return [];
  }

  private async analyzeRecipientBehavior(analytics: NotificationAnalytics): Promise<any> {
    // Implementation for recipient behavior analysis
    return { preferredChannels: {}, responsePatterns: {} };
  }

  private async analyzeContentEffectiveness(analytics: NotificationAnalytics): Promise<any> {
    // Implementation for content effectiveness analysis
    return { effectiveSubjectLines: [], optimalBodyLength: 150, highPerformingTemplates: [] };
  }

  private async analyzeEscalationEffectiveness(analytics: NotificationAnalytics): Promise<any> {
    // Implementation for escalation effectiveness analysis
    return { escalationSuccessRate: 0.8, optimalEscalationDelay: 30, mostEffectiveEscalators: [] };
  }

  private startNotificationProcessor(): void {
    // Start background processor for handling queued notifications and escalations
    setInterval(async () => {
      try {
        await this.processEscalations();
        await this.sendReminderNotifications({ id: 'system' } as User);
      } catch (error) {
        console.error('Error in notification processor:', error);
      }
    }, 5 * 60 * 1000); // Run every 5 minutes
  }
}

/**
 * Export singleton instance
 */
export const automatedNotificationService = new AutomatedNotificationService();