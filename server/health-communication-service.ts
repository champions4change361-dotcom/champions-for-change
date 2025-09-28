import { randomUUID } from "crypto";
import { getStorage } from "./storage";
import { HealthDataEncryption, HealthDataAudit } from "./data-encryption";
import { logComplianceAction } from "./complianceMiddleware";
import { emailService } from "./emailService";
import type { User } from "@shared/schema";

export interface HealthMessage {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  fromUserRole?: string;
  toUserId: string;
  toUserName?: string;
  toUserRole?: string;
  athleteId?: string; // If message is about a specific athlete
  athleteName?: string;
  subject: string;
  content: string;
  messageType: 'health_update' | 'injury_report' | 'clearance' | 'emergency' | 'consultation' | 'appointment' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  status: 'sent' | 'delivered' | 'read' | 'responded';
  isEncrypted: boolean;
  parentNotification: boolean;
  emergencyAlert: boolean;
  attachments?: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    downloadUrl: string;
  }>;
  readAt?: string;
  respondedAt?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageThread {
  id: string;
  participantIds: string[];
  participantNames: string[];
  athleteId?: string;
  athleteName?: string;
  subject: string;
  lastMessageAt: string;
  messageCount: number;
  unreadCount: number;
  messages: HealthMessage[];
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  emergencyAlerts: boolean;
  injuryReports: boolean;
  clearanceUpdates: boolean;
  appointmentReminders: boolean;
  generalUpdates: boolean;
  parentNotifications: boolean; // For athlete's parents
  notificationHours: {
    start: string; // "08:00"
    end: string;   // "18:00"
  };
  weekendNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyAlert {
  id: string;
  athleteId: string;
  athleteName?: string;
  reportedBy: string;
  reporterName?: string;
  alertType: 'injury' | 'medical_emergency' | 'cardiac_event' | 'head_injury' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical' | 'life_threatening';
  location: string;
  description: string;
  immediateResponse: string;
  notificationsSent: string[]; // User IDs who were notified
  acknowledgedBy: string[]; // User IDs who acknowledged
  resolvedBy?: string;
  resolvedAt?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthCommunicationService {
  // Message Management
  sendMessage(message: Partial<HealthMessage>, user: User): Promise<HealthMessage>;
  getMessage(messageId: string, user: User): Promise<HealthMessage | null>;
  getMessages(filters: any, user: User): Promise<HealthMessage[]>;
  getMessageThread(threadId: string, user: User): Promise<MessageThread | null>;
  getMessageThreads(filters: any, user: User): Promise<MessageThread[]>;
  markMessageAsRead(messageId: string, user: User): Promise<void>;
  replyToMessage(messageId: string, content: string, user: User): Promise<HealthMessage>;
  
  // Notification Management
  updateNotificationPreferences(preferences: Partial<NotificationPreferences>, user: User): Promise<NotificationPreferences>;
  getNotificationPreferences(userId: string, user: User): Promise<NotificationPreferences | null>;
  sendNotification(userId: string, notification: any, user: User): Promise<void>;
  
  // Emergency Alerts
  createEmergencyAlert(alert: Partial<EmergencyAlert>, user: User): Promise<EmergencyAlert>;
  getEmergencyAlerts(filters: any, user: User): Promise<EmergencyAlert[]>;
  acknowledgeEmergencyAlert(alertId: string, user: User): Promise<void>;
  resolveEmergencyAlert(alertId: string, resolution: string, user: User): Promise<void>;
  
  // Health Communication Workflows
  sendInjuryNotification(athleteId: string, injuryDetails: any, recipients: string[], user: User): Promise<void>;
  sendClearanceUpdate(athleteId: string, clearanceStatus: string, restrictions: string[], recipients: string[], user: User): Promise<void>;
  sendAppointmentReminder(appointmentId: string, recipientId: string, reminderTime: number, user: User): Promise<void>;
  sendParentNotification(athleteId: string, notificationType: string, content: string, user: User): Promise<void>;
  
  // Communication Analytics
  getCommunicationAnalytics(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<any>;
  getMessageDeliveryStats(organizationId: string, user: User): Promise<any>;
}

/**
 * Health Communication Service Implementation
 * Secure messaging and notification system for health-related communications
 */
export class HealthCommunicationServiceImpl implements HealthCommunicationService {
  private storage = getStorage();
  private messages: Map<string, HealthMessage> = new Map();
  private threads: Map<string, MessageThread> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private emergencyAlerts: Map<string, EmergencyAlert> = new Map();
  
  constructor() {
    console.log('💬 Health Communication Service initialized with secure messaging');
  }

  // Message Management
  async sendMessage(message: Partial<HealthMessage>, user: User): Promise<HealthMessage> {
    try {
      const storage = await this.storage;
      
      // Security validation
      if (!user.id) {
        throw new Error('User context required for message sending');
      }

      // Get recipient information
      const recipient = await storage.getUser(message.toUserId!);
      if (!recipient) {
        throw new Error('Recipient not found');
      }

      // Build complete message
      const healthMessage: HealthMessage = {
        id: randomUUID(),
        fromUserId: user.id,
        fromUserName: `${user.firstName} ${user.lastName}`,
        fromUserRole: user.userRole,
        toUserId: message.toUserId!,
        toUserName: `${recipient.firstName} ${recipient.lastName}`,
        toUserRole: recipient.userRole,
        athleteId: message.athleteId,
        subject: message.subject!,
        content: message.content!,
        messageType: message.messageType || 'general',
        priority: message.priority || 'normal',
        status: 'sent',
        isEncrypted: this.shouldEncryptMessage(message.messageType!),
        parentNotification: message.parentNotification || false,
        emergencyAlert: message.emergencyAlert || false,
        attachments: message.attachments || [],
        organizationId: user.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get athlete name if specified
      if (message.athleteId) {
        const athlete = await storage.getAthlete(message.athleteId, user);
        if (athlete) {
          healthMessage.athleteName = `${athlete.firstName} ${athlete.lastName}`;
        }
      }

      // Encrypt content if required
      if (healthMessage.isEncrypted) {
        healthMessage.content = HealthDataEncryption.encryptText(healthMessage.content);
      }

      // Store message
      this.messages.set(healthMessage.id, healthMessage);

      // Update or create message thread
      await this.updateMessageThread(healthMessage);

      // Send notifications based on priority and preferences
      await this.sendMessageNotifications(healthMessage);

      // Handle emergency alerts
      if (healthMessage.emergencyAlert) {
        await this.handleEmergencyMessage(healthMessage, user);
      }

      // Handle parent notifications
      if (healthMessage.parentNotification && message.athleteId) {
        await this.sendParentNotification(message.athleteId, healthMessage.messageType, healthMessage.content, user);
      }

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', healthMessage.id, {
        action: 'health_message_sent',
        recipientId: message.toUserId,
        messageType: message.messageType,
        priority: message.priority,
        athleteId: message.athleteId,
      });

      console.log(`💬 Sent health message ${healthMessage.id} from ${user.id} to ${message.toUserId}`);
      return healthMessage;
    } catch (error) {
      console.error('Error sending health message:', error);
      throw error;
    }
  }

  async getMessage(messageId: string, user: User): Promise<HealthMessage | null> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for message access');
      }

      const message = this.messages.get(messageId);
      if (!message) {
        return null;
      }

      // Check if user is authorized to view this message
      if (message.fromUserId !== user.id && message.toUserId !== user.id) {
        // Additional authorization checks for athletic trainers and administrators
        if (!this.canUserAccessMessage(user, message)) {
          throw new Error('Unauthorized access to message');
        }
      }

      // Decrypt content if encrypted
      let decryptedMessage = { ...message };
      if (message.isEncrypted) {
        try {
          decryptedMessage.content = HealthDataEncryption.decryptText(message.content);
        } catch (decryptError) {
          console.error('Error decrypting message content:', decryptError);
          decryptedMessage.content = '[Encrypted content - decryption failed]';
        }
      }

      // Mark as read if user is the recipient
      if (message.toUserId === user.id && message.status === 'delivered') {
        await this.markMessageAsRead(messageId, user);
      }

      // Log compliance action
      await logComplianceAction(user.id, 'data_access', 'health_data', messageId, {
        action: 'health_message_viewed',
        messageType: message.messageType,
      });

      return decryptedMessage;
    } catch (error) {
      console.error('Error getting health message:', error);
      throw error;
    }
  }

  async getMessages(filters: any, user: User): Promise<HealthMessage[]> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for messages access');
      }

      let messages = Array.from(this.messages.values());

      // Apply security filtering
      messages = messages.filter(message => this.canUserAccessMessage(user, message));

      // Apply filters
      if (filters.messageType) {
        messages = messages.filter(message => message.messageType === filters.messageType);
      }

      if (filters.athleteId) {
        messages = messages.filter(message => message.athleteId === filters.athleteId);
      }

      if (filters.priority) {
        messages = messages.filter(message => message.priority === filters.priority);
      }

      if (filters.status) {
        messages = messages.filter(message => message.status === filters.status);
      }

      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        messages = messages.filter(message => {
          const messageDate = new Date(message.createdAt);
          return messageDate >= startDate && messageDate <= endDate;
        });
      }

      // Sort by creation date (newest first)
      messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Decrypt messages if needed
      return messages.map(message => {
        if (message.isEncrypted) {
          try {
            return {
              ...message,
              content: HealthDataEncryption.decryptText(message.content),
            };
          } catch (decryptError) {
            return {
              ...message,
              content: '[Encrypted content - decryption failed]',
            };
          }
        }
        return message;
      });
    } catch (error) {
      console.error('Error getting health messages:', error);
      throw error;
    }
  }

  async getMessageThread(threadId: string, user: User): Promise<MessageThread | null> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for thread access');
      }

      const thread = this.threads.get(threadId);
      if (!thread) {
        return null;
      }

      // Check if user is authorized to view this thread
      if (!thread.participantIds.includes(user.id)) {
        // Additional authorization checks for athletic trainers and administrators
        if (!this.canUserAccessThread(user, thread)) {
          throw new Error('Unauthorized access to message thread');
        }
      }

      // Decrypt messages in thread
      const decryptedMessages = thread.messages.map(message => {
        if (message.isEncrypted) {
          try {
            return {
              ...message,
              content: HealthDataEncryption.decryptText(message.content),
            };
          } catch (decryptError) {
            return {
              ...message,
              content: '[Encrypted content - decryption failed]',
            };
          }
        }
        return message;
      });

      return {
        ...thread,
        messages: decryptedMessages,
      };
    } catch (error) {
      console.error('Error getting message thread:', error);
      throw error;
    }
  }

  async getMessageThreads(filters: any, user: User): Promise<MessageThread[]> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for threads access');
      }

      let threads = Array.from(this.threads.values());

      // Apply security filtering
      threads = threads.filter(thread => this.canUserAccessThread(user, thread));

      // Apply filters
      if (filters.athleteId) {
        threads = threads.filter(thread => thread.athleteId === filters.athleteId);
      }

      if (filters.unreadOnly) {
        threads = threads.filter(thread => thread.unreadCount > 0);
      }

      // Sort by last message date (newest first)
      threads.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      return threads;
    } catch (error) {
      console.error('Error getting message threads:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, user: User): Promise<void> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for marking message as read');
      }

      const message = this.messages.get(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user is the recipient
      if (message.toUserId !== user.id) {
        throw new Error('Only message recipient can mark as read');
      }

      // Update message status
      const updatedMessage = {
        ...message,
        status: 'read' as const,
        readAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.messages.set(messageId, updatedMessage);

      // Update thread unread count
      await this.updateThreadUnreadCount(message);

      // Log compliance action
      await logComplianceAction(user.id, 'data_access', 'health_data', messageId, {
        action: 'health_message_read',
        messageType: message.messageType,
      });

      console.log(`💬 Message ${messageId} marked as read by ${user.id}`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  async replyToMessage(messageId: string, content: string, user: User): Promise<HealthMessage> {
    try {
      const originalMessage = await this.getMessage(messageId, user);
      if (!originalMessage) {
        throw new Error('Original message not found');
      }

      // Create reply message
      const replyMessage: Partial<HealthMessage> = {
        toUserId: originalMessage.fromUserId,
        athleteId: originalMessage.athleteId,
        subject: `Re: ${originalMessage.subject}`,
        content: content,
        messageType: originalMessage.messageType,
        priority: originalMessage.priority,
        parentNotification: originalMessage.parentNotification,
        emergencyAlert: false, // Replies are not emergency alerts
      };

      const sentReply = await this.sendMessage(replyMessage, user);

      // Update original message status
      if (originalMessage.status === 'read') {
        const updatedOriginal = {
          ...originalMessage,
          status: 'responded' as const,
          respondedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.messages.set(messageId, updatedOriginal);
      }

      return sentReply;
    } catch (error) {
      console.error('Error replying to message:', error);
      throw error;
    }
  }

  // Notification Management
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>, user: User): Promise<NotificationPreferences> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for notification preferences');
      }

      const existingPrefs = this.preferences.get(user.id);
      const updatedPrefs: NotificationPreferences = {
        userId: user.id,
        emailNotifications: preferences.emailNotifications ?? existingPrefs?.emailNotifications ?? true,
        smsNotifications: preferences.smsNotifications ?? existingPrefs?.smsNotifications ?? false,
        pushNotifications: preferences.pushNotifications ?? existingPrefs?.pushNotifications ?? true,
        emergencyAlerts: preferences.emergencyAlerts ?? existingPrefs?.emergencyAlerts ?? true,
        injuryReports: preferences.injuryReports ?? existingPrefs?.injuryReports ?? true,
        clearanceUpdates: preferences.clearanceUpdates ?? existingPrefs?.clearanceUpdates ?? true,
        appointmentReminders: preferences.appointmentReminders ?? existingPrefs?.appointmentReminders ?? true,
        generalUpdates: preferences.generalUpdates ?? existingPrefs?.generalUpdates ?? true,
        parentNotifications: preferences.parentNotifications ?? existingPrefs?.parentNotifications ?? false,
        notificationHours: preferences.notificationHours ?? existingPrefs?.notificationHours ?? { start: '08:00', end: '18:00' },
        weekendNotifications: preferences.weekendNotifications ?? existingPrefs?.weekendNotifications ?? false,
        createdAt: existingPrefs?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.preferences.set(user.id, updatedPrefs);

      console.log(`💬 Updated notification preferences for user ${user.id}`);
      return updatedPrefs;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  async getNotificationPreferences(userId: string, user: User): Promise<NotificationPreferences | null> {
    try {
      // Security validation - users can only access their own preferences unless they're authorized
      if (userId !== user.id && !this.canUserAccessOtherPreferences(user)) {
        throw new Error('Unauthorized access to notification preferences');
      }

      return this.preferences.get(userId) || null;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  async sendNotification(userId: string, notification: any, user: User): Promise<void> {
    try {
      const userPrefs = this.preferences.get(userId);
      
      // Check if notifications are enabled for this type
      if (userPrefs && !this.shouldSendNotification(userPrefs, notification.type)) {
        console.log(`💬 Notification suppressed for user ${userId} based on preferences`);
        return;
      }

      // Check notification hours
      if (userPrefs && !this.isWithinNotificationHours(userPrefs)) {
        console.log(`💬 Notification delayed for user ${userId} - outside notification hours`);
        // TODO: Queue for later delivery
        return;
      }

      // Send email notification if enabled
      if (userPrefs?.emailNotifications !== false) {
        try {
          const recipient = await (await this.storage).getUser(userId);
          if (recipient?.email) {
            await emailService.sendEmail({
              to: recipient.email,
              subject: notification.subject,
              text: notification.content,
              html: notification.htmlContent,
            });
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
        }
      }

      // TODO: Send SMS notification if enabled
      // TODO: Send push notification if enabled

      console.log(`💬 Sent notification to user ${userId}`);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Emergency Alerts
  async createEmergencyAlert(alert: Partial<EmergencyAlert>, user: User): Promise<EmergencyAlert> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for emergency alert creation');
      }

      const emergencyAlert: EmergencyAlert = {
        id: randomUUID(),
        athleteId: alert.athleteId!,
        reportedBy: user.id,
        reporterName: `${user.firstName} ${user.lastName}`,
        alertType: alert.alertType!,
        severity: alert.severity!,
        location: alert.location!,
        description: alert.description!,
        immediateResponse: alert.immediateResponse!,
        notificationsSent: [],
        acknowledgedBy: [],
        resolvedBy: alert.resolvedBy,
        resolvedAt: alert.resolvedAt,
        organizationId: user.organizationId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get athlete name
      const athlete = await (await this.storage).getAthlete(alert.athleteId!, user);
      if (athlete) {
        emergencyAlert.athleteName = `${athlete.firstName} ${athlete.lastName}`;
      }

      this.emergencyAlerts.set(emergencyAlert.id, emergencyAlert);

      // Send immediate notifications to all relevant personnel
      await this.sendEmergencyNotifications(emergencyAlert, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', emergencyAlert.id, {
        action: 'emergency_alert_created',
        athleteId: alert.athleteId,
        alertType: alert.alertType,
        severity: alert.severity,
      });

      console.log(`🚨 Created emergency alert ${emergencyAlert.id} for athlete ${alert.athleteId}`);
      return emergencyAlert;
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  }

  async getEmergencyAlerts(filters: any, user: User): Promise<EmergencyAlert[]> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for emergency alerts access');
      }

      let alerts = Array.from(this.emergencyAlerts.values());

      // Apply security filtering based on user role and organization
      alerts = alerts.filter(alert => this.canUserAccessEmergencyAlert(user, alert));

      // Apply filters
      if (filters.athleteId) {
        alerts = alerts.filter(alert => alert.athleteId === filters.athleteId);
      }

      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity);
      }

      if (filters.alertType) {
        alerts = alerts.filter(alert => alert.alertType === filters.alertType);
      }

      if (filters.resolved !== undefined) {
        alerts = alerts.filter(alert => !!alert.resolvedAt === filters.resolved);
      }

      // Sort by creation date (newest first)
      alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return alerts;
    } catch (error) {
      console.error('Error getting emergency alerts:', error);
      throw error;
    }
  }

  async acknowledgeEmergencyAlert(alertId: string, user: User): Promise<void> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for acknowledging emergency alert');
      }

      const alert = this.emergencyAlerts.get(alertId);
      if (!alert) {
        throw new Error('Emergency alert not found');
      }

      // Add user to acknowledged list if not already present
      if (!alert.acknowledgedBy.includes(user.id)) {
        const updatedAlert = {
          ...alert,
          acknowledgedBy: [...alert.acknowledgedBy, user.id],
          updatedAt: new Date().toISOString(),
        };
        this.emergencyAlerts.set(alertId, updatedAlert);
      }

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', alertId, {
        action: 'emergency_alert_acknowledged',
        athleteId: alert.athleteId,
      });

      console.log(`🚨 Emergency alert ${alertId} acknowledged by ${user.id}`);
    } catch (error) {
      console.error('Error acknowledging emergency alert:', error);
      throw error;
    }
  }

  async resolveEmergencyAlert(alertId: string, resolution: string, user: User): Promise<void> {
    try {
      // Security validation
      if (!user.id) {
        throw new Error('User context required for resolving emergency alert');
      }

      const alert = this.emergencyAlerts.get(alertId);
      if (!alert) {
        throw new Error('Emergency alert not found');
      }

      const updatedAlert = {
        ...alert,
        resolvedBy: user.id,
        resolvedAt: new Date().toISOString(),
        description: `${alert.description}\n\nResolution: ${resolution}`,
        updatedAt: new Date().toISOString(),
      };

      this.emergencyAlerts.set(alertId, updatedAlert);

      // Send resolution notifications
      await this.sendAlertResolutionNotifications(updatedAlert, resolution, user);

      // Log compliance action
      await logComplianceAction(user.id, 'data_modification', 'health_data', alertId, {
        action: 'emergency_alert_resolved',
        athleteId: alert.athleteId,
        resolution: resolution,
      });

      console.log(`🚨 Emergency alert ${alertId} resolved by ${user.id}`);
    } catch (error) {
      console.error('Error resolving emergency alert:', error);
      throw error;
    }
  }

  // Health Communication Workflows
  async sendInjuryNotification(athleteId: string, injuryDetails: any, recipients: string[], user: User): Promise<void> {
    try {
      const athlete = await (await this.storage).getAthlete(athleteId, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      const athleteName = `${athlete.firstName} ${athlete.lastName}`;
      
      for (const recipientId of recipients) {
        const message: Partial<HealthMessage> = {
          toUserId: recipientId,
          athleteId: athleteId,
          subject: `Injury Report - ${athleteName}`,
          content: `Injury report for ${athleteName}:\n\n${this.formatInjuryDetails(injuryDetails)}`,
          messageType: 'injury_report',
          priority: this.determinePriorityFromSeverity(injuryDetails.severity),
          parentNotification: true,
          emergencyAlert: ['major', 'severe', 'catastrophic'].includes(injuryDetails.severity),
        };

        await this.sendMessage(message, user);
      }

      console.log(`💬 Sent injury notifications for athlete ${athleteId} to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Error sending injury notification:', error);
      throw error;
    }
  }

  async sendClearanceUpdate(athleteId: string, clearanceStatus: string, restrictions: string[], recipients: string[], user: User): Promise<void> {
    try {
      const athlete = await (await this.storage).getAthlete(athleteId, user);
      if (!athlete) {
        throw new Error('Athlete not found');
      }

      const athleteName = `${athlete.firstName} ${athlete.lastName}`;
      
      for (const recipientId of recipients) {
        const message: Partial<HealthMessage> = {
          toUserId: recipientId,
          athleteId: athleteId,
          subject: `Clearance Update - ${athleteName}`,
          content: `Clearance status update for ${athleteName}:\n\nStatus: ${clearanceStatus}\nRestrictions: ${restrictions.length > 0 ? restrictions.join(', ') : 'None'}`,
          messageType: 'clearance',
          priority: 'normal',
          parentNotification: true,
        };

        await this.sendMessage(message, user);
      }

      console.log(`💬 Sent clearance updates for athlete ${athleteId} to ${recipients.length} recipients`);
    } catch (error) {
      console.error('Error sending clearance update:', error);
      throw error;
    }
  }

  async sendAppointmentReminder(appointmentId: string, recipientId: string, reminderTime: number, user: User): Promise<void> {
    try {
      // TODO: Implement appointment reminder with appointment details
      const message: Partial<HealthMessage> = {
        toUserId: recipientId,
        subject: 'Appointment Reminder',
        content: `You have an upcoming appointment. Please arrive on time.`,
        messageType: 'appointment',
        priority: 'normal',
      };

      await this.sendMessage(message, user);
      console.log(`💬 Sent appointment reminder for appointment ${appointmentId} to ${recipientId}`);
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
      throw error;
    }
  }

  async sendParentNotification(athleteId: string, notificationType: string, content: string, user: User): Promise<void> {
    try {
      const athlete = await (await this.storage).getAthlete(athleteId, user);
      if (!athlete || !athlete.parentGuardian) {
        console.warn(`No parent/guardian contact found for athlete ${athleteId}`);
        return;
      }

      const athleteName = `${athlete.firstName} ${athlete.lastName}`;
      
      // Send email notification to parent/guardian
      if (athlete.parentGuardian.email) {
        try {
          await emailService.sendEmail({
            to: athlete.parentGuardian.email,
            subject: `Health Update - ${athleteName}`,
            text: `Dear ${athlete.parentGuardian.name},\n\n${content}\n\nIf you have any questions, please contact the athletic training staff.\n\nThank you,\nAthletic Training Department`,
            html: `<p>Dear ${athlete.parentGuardian.name},</p><p>${content}</p><p>If you have any questions, please contact the athletic training staff.</p><p>Thank you,<br>Athletic Training Department</p>`,
          });
        } catch (emailError) {
          console.error('Error sending parent email notification:', emailError);
        }
      }

      // TODO: Send SMS notification if phone number is available

      console.log(`💬 Sent parent notification for athlete ${athleteId}`);
    } catch (error) {
      console.error('Error sending parent notification:', error);
      throw error;
    }
  }

  // Communication Analytics (placeholder implementations)
  async getCommunicationAnalytics(organizationId: string, dateRange: { start: string; end: string }, user: User): Promise<any> {
    // TODO: Implement communication analytics
    return {
      totalMessages: 0,
      messagesByType: {},
      responseRate: 0,
      averageResponseTime: 0,
    };
  }

  async getMessageDeliveryStats(organizationId: string, user: User): Promise<any> {
    // TODO: Implement delivery statistics
    return {
      deliveryRate: 0,
      readRate: 0,
      responseRate: 0,
    };
  }

  // Private utility methods
  private shouldEncryptMessage(messageType: string): boolean {
    const encryptedTypes = ['health_update', 'injury_report', 'consultation', 'emergency'];
    return encryptedTypes.includes(messageType);
  }

  private canUserAccessMessage(user: User, message: HealthMessage): boolean {
    // Users can access their own messages
    if (message.fromUserId === user.id || message.toUserId === user.id) {
      return true;
    }

    // Athletic trainers and administrators can access messages in their organization
    const authorizedRoles = [
      'district_athletic_trainer',
      'school_athletic_trainer',
      'district_athletic_director',
      'school_athletic_director',
    ];

    return authorizedRoles.includes(user.userRole || '') && 
           user.organizationId === message.organizationId;
  }

  private canUserAccessThread(user: User, thread: MessageThread): boolean {
    // Users can access threads they're part of
    if (thread.participantIds.includes(user.id)) {
      return true;
    }

    // Athletic trainers and administrators can access threads in their organization
    const authorizedRoles = [
      'district_athletic_trainer',
      'school_athletic_trainer',
      'district_athletic_director',
      'school_athletic_director',
    ];

    return authorizedRoles.includes(user.userRole || '') && 
           user.organizationId === thread.organizationId;
  }

  private canUserAccessOtherPreferences(user: User): boolean {
    const authorizedRoles = [
      'district_athletic_director',
      'school_athletic_director',
    ];

    return authorizedRoles.includes(user.userRole || '');
  }

  private canUserAccessEmergencyAlert(user: User, alert: EmergencyAlert): boolean {
    return user.organizationId === alert.organizationId;
  }

  private async updateMessageThread(message: HealthMessage): Promise<void> {
    // Find or create thread
    const threadId = this.generateThreadId(message.fromUserId, message.toUserId, message.athleteId);
    const existingThread = this.threads.get(threadId);

    if (existingThread) {
      // Update existing thread
      existingThread.messages.push(message);
      existingThread.lastMessageAt = message.createdAt;
      existingThread.messageCount++;
      existingThread.unreadCount++;
      existingThread.updatedAt = message.createdAt;
    } else {
      // Create new thread
      const newThread: MessageThread = {
        id: threadId,
        participantIds: [message.fromUserId, message.toUserId],
        participantNames: [message.fromUserName || '', message.toUserName || ''],
        athleteId: message.athleteId,
        athleteName: message.athleteName,
        subject: message.subject,
        lastMessageAt: message.createdAt,
        messageCount: 1,
        unreadCount: 1,
        messages: [message],
        organizationId: message.organizationId,
        createdAt: message.createdAt,
        updatedAt: message.createdAt,
      };

      this.threads.set(threadId, newThread);
    }
  }

  private async updateThreadUnreadCount(message: HealthMessage): Promise<void> {
    const threadId = this.generateThreadId(message.fromUserId, message.toUserId, message.athleteId);
    const thread = this.threads.get(threadId);

    if (thread && thread.unreadCount > 0) {
      thread.unreadCount--;
      thread.updatedAt = new Date().toISOString();
    }
  }

  private generateThreadId(fromUserId: string, toUserId: string, athleteId?: string): string {
    const participants = [fromUserId, toUserId].sort();
    const base = participants.join('-');
    return athleteId ? `${base}-${athleteId}` : base;
  }

  private async sendMessageNotifications(message: HealthMessage): Promise<void> {
    try {
      const notification = {
        type: 'message',
        subject: `New message: ${message.subject}`,
        content: `You have received a new ${message.messageType} message from ${message.fromUserName}.`,
        htmlContent: `<p>You have received a new <strong>${message.messageType}</strong> message from <strong>${message.fromUserName}</strong>.</p>`,
      };

      await this.sendNotification(message.toUserId, notification, { id: message.fromUserId } as User);
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }

  private async handleEmergencyMessage(message: HealthMessage, user: User): Promise<void> {
    try {
      // Create emergency alert
      const alert: Partial<EmergencyAlert> = {
        athleteId: message.athleteId!,
        alertType: 'other',
        severity: message.priority === 'emergency' ? 'critical' : 'moderate',
        location: 'See message details',
        description: `Emergency message: ${message.subject}`,
        immediateResponse: message.content,
      };

      await this.createEmergencyAlert(alert, user);
    } catch (error) {
      console.error('Error handling emergency message:', error);
    }
  }

  private async sendEmergencyNotifications(alert: EmergencyAlert, user: User): Promise<void> {
    try {
      // Get all relevant personnel for notifications
      const storage = await this.storage;
      const allUsers = await storage.getAllUsers();
      
      const notificationRoles = [
        'district_athletic_trainer',
        'school_athletic_trainer',
        'district_athletic_director',
        'school_athletic_director',
      ];

      const recipients = allUsers.filter(u => 
        u.organizationId === user.organizationId &&
        notificationRoles.includes(u.userRole || '')
      );

      const notification = {
        type: 'emergency',
        subject: `🚨 EMERGENCY ALERT - ${alert.athleteName}`,
        content: `Emergency alert for ${alert.athleteName}:\n\nType: ${alert.alertType}\nSeverity: ${alert.severity}\nLocation: ${alert.location}\n\nDescription: ${alert.description}\n\nImmediate Response: ${alert.immediateResponse}`,
        htmlContent: `<h3>🚨 EMERGENCY ALERT - ${alert.athleteName}</h3><p><strong>Type:</strong> ${alert.alertType}<br><strong>Severity:</strong> ${alert.severity}<br><strong>Location:</strong> ${alert.location}</p><p><strong>Description:</strong> ${alert.description}</p><p><strong>Immediate Response:</strong> ${alert.immediateResponse}</p>`,
      };

      for (const recipient of recipients) {
        await this.sendNotification(recipient.id, notification, user);
        alert.notificationsSent.push(recipient.id);
      }

      console.log(`🚨 Sent emergency notifications to ${recipients.length} personnel`);
    } catch (error) {
      console.error('Error sending emergency notifications:', error);
    }
  }

  private async sendAlertResolutionNotifications(alert: EmergencyAlert, resolution: string, user: User): Promise<void> {
    try {
      const notification = {
        type: 'alert_resolved',
        subject: `Emergency Alert Resolved - ${alert.athleteName}`,
        content: `The emergency alert for ${alert.athleteName} has been resolved.\n\nResolution: ${resolution}`,
        htmlContent: `<p>The emergency alert for <strong>${alert.athleteName}</strong> has been resolved.</p><p><strong>Resolution:</strong> ${resolution}</p>`,
      };

      for (const userId of alert.notificationsSent) {
        await this.sendNotification(userId, notification, user);
      }

      console.log(`🚨 Sent resolution notifications for alert ${alert.id}`);
    } catch (error) {
      console.error('Error sending alert resolution notifications:', error);
    }
  }

  private shouldSendNotification(prefs: NotificationPreferences, notificationType: string): boolean {
    switch (notificationType) {
      case 'emergency':
        return prefs.emergencyAlerts;
      case 'injury_report':
        return prefs.injuryReports;
      case 'clearance':
        return prefs.clearanceUpdates;
      case 'appointment':
        return prefs.appointmentReminders;
      default:
        return prefs.generalUpdates;
    }
  }

  private isWithinNotificationHours(prefs: NotificationPreferences): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;

    const [startHour, startMinutes] = prefs.notificationHours.start.split(':').map(Number);
    const [endHour, endMinutes] = prefs.notificationHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMinutes;
    const endTime = endHour * 60 + endMinutes;

    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    if (isWeekend && !prefs.weekendNotifications) {
      return false;
    }

    return currentTime >= startTime && currentTime <= endTime;
  }

  private formatInjuryDetails(injuryDetails: any): string {
    return `Type: ${injuryDetails.injuryType}
Body Part: ${injuryDetails.bodyPartAffected}
Severity: ${injuryDetails.severity}
Mechanism: ${injuryDetails.mechanismOfInjury || 'Not specified'}
Treatment: ${injuryDetails.treatmentProvided || 'None specified'}
Return to Play: ${injuryDetails.returnToPlayStatus}`;
  }

  private determinePriorityFromSeverity(severity: string): 'low' | 'normal' | 'high' | 'urgent' | 'emergency' {
    switch (severity) {
      case 'catastrophic':
        return 'emergency';
      case 'severe':
        return 'urgent';
      case 'major':
        return 'high';
      case 'moderate':
        return 'normal';
      default:
        return 'low';
    }
  }
}

// Export singleton instance
export const healthCommunicationService = new HealthCommunicationServiceImpl();