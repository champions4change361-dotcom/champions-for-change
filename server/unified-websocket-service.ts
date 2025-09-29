/**
 * Unified WebSocket Service - Real-Time Event Dispatcher
 * 
 * Provides comprehensive WebSocket-based real-time updates for all platform modules:
 * - Tournament Management (scoring, brackets, registration)
 * - Athletic Trainer Dashboard (health alerts, communications, equipment)
 * - Smart Scheduling (conflicts, facility updates, reminders)
 * - Academic Competitions (results, registration, scoring)
 * - Cross-module notifications with RBAC compliance
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import type { 
  User,
  Tournament,
  Match,
  AthleticCalendarEvent,
  ScheduleConflict,
  FacilityReservation,
  AcademicCompetition,
  AcademicResult
} from '@shared/schema';
import { RBACDataFilters } from './rbac-data-filters';
import { logComplianceAction } from './complianceMiddleware';
import { getStorage } from './storage';
import { RBACService } from './rbac-permissions';
import type { IncomingMessage } from 'http';
import type { ExtendedError } from 'socket.io/dist/namespace';

// Event Types for Real-Time Updates
export interface PlatformEvent {
  id: string;
  type: PlatformEventType;
  module: PlatformModule;
  organizationId: string;
  userId?: string;
  data: any;
  timestamp: Date;
  priority: EventPriority;
  rbacScope: RBACScope;
  compliance: ComplianceInfo;
}

export type PlatformEventType = 
  // Tournament Events
  | 'tournament_created' | 'tournament_updated' | 'tournament_started' | 'tournament_completed'
  | 'match_started' | 'match_completed' | 'score_updated' | 'bracket_progressed'
  | 'team_registered' | 'registration_closed' | 'tournament_status_changed'
  
  // Athletic Trainer Events  
  | 'health_alert_created' | 'health_alert_acknowledged' | 'health_alert_resolved'
  | 'injury_reported' | 'clearance_updated' | 'equipment_check_due'
  | 'communication_received' | 'medical_update' | 'emergency_alert'
  
  // Scheduling Events
  | 'event_created' | 'event_updated' | 'event_cancelled' | 'conflict_detected'
  | 'facility_updated' | 'reminder_triggered' | 'approval_requested'
  | 'schedule_optimized' | 'facility_maintenance'
  
  // Academic Competition Events
  | 'competition_created' | 'competition_started' | 'results_updated'
  | 'participant_registered' | 'academic_score_updated' | 'ranking_changed'
  
  // System Events
  | 'user_notification' | 'system_alert' | 'compliance_update';

export type PlatformModule = 
  | 'tournaments' | 'athletic_training' | 'scheduling' | 'academics' | 'system';

export type EventPriority = 'low' | 'normal' | 'high' | 'urgent' | 'emergency';

export interface RBACScope {
  organizationIds: string[];
  userRoles: string[];
  permissions: string[];
  dataClassifications: string[];
}

export interface ComplianceInfo {
  containsHealthData: boolean;
  containsEducationalData: boolean;
  requiresAudit: boolean;
  hipaaRelevant: boolean;
  ferpaRelevant: boolean;
}

// WebSocket Channel Management
export interface UserChannel {
  userId: string;
  socketId: string;
  userRole: string;
  organizationId: string;
  permissions: string[];
  subscriptions: Set<string>;
  lastActivity: Date;
}

// Event Subscription Filters
export interface EventSubscription {
  userId: string;
  eventTypes: PlatformEventType[];
  modules: PlatformModule[];
  priorities: EventPriority[];
  organizationScope: string[];
  customFilters?: Record<string, any>;
}

export class UnifiedWebSocketService {
  private static instance: UnifiedWebSocketService | null = null;
  private io: SocketIOServer | null = null;
  private userChannels = new Map<string, UserChannel>();
  private organizationChannels = new Map<string, Set<string>>();
  private eventBuffer = new Map<string, PlatformEvent[]>();
  
  private constructor() {}

  static getInstance(): UnifiedWebSocketService {
    if (!UnifiedWebSocketService.instance) {
      UnifiedWebSocketService.instance = new UnifiedWebSocketService();
    }
    return UnifiedWebSocketService.instance;
  }

  /**
   * Initialize unified WebSocket service with existing server
   */
  initialize(server: HTTPServer): void {
    if (this.io) {
      console.log('📡 Unified WebSocket service already initialized');
      return;
    }

    // SECURITY: Restrict CORS to known domains only
    const allowedOrigins = [
      'https://championsforchange.net',
      'https://www.championsforchange.net', 
      'https://trantortournaments.org',
      'https://www.trantortournaments.org',
      // Development origins
      'http://localhost:3000',
      'http://localhost:5000',
      // Replit preview domains (secure pattern)
      /^https:\/\/[a-f0-9\-]+-00-[a-z0-9]+\.janeway\.replit\.dev$/
    ];

    this.io = new SocketIOServer(server, {
      cors: {
        origin: (origin, callback) => {
          // Allow requests with no origin (mobile apps, Postman, etc.)
          if (!origin) return callback(null, true);
          
          const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
              return origin === allowed;
            }
            return allowed.test(origin);
          });
          
          if (isAllowed) {
            callback(null, true);
          } else {
            console.warn(`🚫 Blocked WebSocket connection from unauthorized origin: ${origin}`);
            callback(new Error('CORS policy violation'), false);
          }
        },
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    // SECURITY: Add authentication middleware for Socket.IO
    this.io.use(async (socket, next) => {
      await this.authenticateSocket(socket, next);
    });

    this.setupEventHandlers();
    console.log('✅ Unified WebSocket service initialized for all platform modules');
  }

  /**
   * SECURITY: Socket.IO authentication middleware
   * Validates user sessions before allowing WebSocket connections
   */
  private async authenticateSocket(socket: Socket, next: (err?: ExtendedError) => void): Promise<void> {
    try {
      // Extract session from request headers or handshake
      const request = socket.request as IncomingMessage & {
        session?: any;
        user?: any;
        headers: any;
      };

      let userId: string | undefined;
      let user: User | undefined;

      // Try to get user from various auth sources
      if (request.session?.user?.id) {
        userId = request.session.user.id;
      } else if (request.user?.id) {
        userId = request.user.id;
      }

      // DEVELOPMENT MODE: Athletic Trainer test user bypass DISABLED to fix redirect loop
      /*
      if (!userId && (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production')) {
        console.log('🧪 Development mode: Using Athletic Trainer test user for WebSocket auth');
        userId = 'test-athletic-trainer-2025';
      }
      */

      if (!userId) {
        console.warn(`⚠️  WebSocket authentication failed: No user ID found`);
        return next(new Error('Authentication required'));
      }

      // Load user from database
      const storage = await getStorage();
      user = await storage.getUser(userId);

      if (!user) {
        console.warn(`⚠️  WebSocket authentication failed: User not found: ${userId}`);
        return next(new Error('User not found'));
      }

      // Store user data in socket for later use
      (socket as any).authenticatedUser = user;
      (socket as any).authenticatedUserId = user.id;
      (socket as any).userOrganizationId = user.organizationId;
      (socket as any).userRole = user.userRole;
      (socket as any).userPermissions = await this.getUserPermissions(user);

      console.log(`✅ WebSocket authenticated: ${user.id} (${user.userRole}) from org: ${user.organizationId}`);
      
      // Log authentication for compliance
      await logComplianceAction(
        user.id,
        'websocket_connection',
        'system',
        undefined,
        { ip: socket.handshake.address, userAgent: socket.handshake.headers['user-agent'] },
        `WebSocket connection authenticated for user ${user.id} (${user.userRole})`
      );

      next(); // Allow connection
    } catch (error) {
      console.error('❌ WebSocket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  }

  /**
   * Setup WebSocket event handlers with RBAC integration
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔗 Authenticated client connected: ${socket.id}`);

      // User is already authenticated via middleware
      const user = (socket as any).authenticatedUser as User;
      const userPermissions = (socket as any).userPermissions as string[];

      // Auto-create user channel for authenticated user
      this.autoCreateUserChannel(socket, user, userPermissions);

      // LEGACY SUPPORT: Handle legacy tournament events for backward compatibility
      socket.on('join-tournament', (tournamentId: string) => {
        this.handleLegacyTournamentJoin(socket, tournamentId);
      });

      // LEGACY SUPPORT: Map legacy score-update to new score_updated
      socket.on('score-update', (data) => {
        // Emit new standardized event name
        socket.emit('score_updated', data);
      });

      // Authenticate and register user channel (for manual auth if needed)
      socket.on('authenticate', async (authData) => {
        // User already authenticated, just send success
        socket.emit('authenticated', {
          userId: user.id,
          channels: [],
          permissions: userPermissions
        });
      });

      // Subscribe to events
      socket.on('subscribe', (subscription: EventSubscription) => {
        this.handleEventSubscription(socket, subscription);
      });

      // Unsubscribe from events
      socket.on('unsubscribe', (eventTypes: PlatformEventType[]) => {
        this.handleEventUnsubscription(socket, eventTypes);
      });

      // Join organization/module rooms
      socket.on('join-room', (roomData) => {
        this.handleRoomJoin(socket, roomData);
      });

      // Leave rooms
      socket.on('leave-room', (roomData) => {
        this.handleRoomLeave(socket, roomData);
      });

      // Handle acknowledgments
      socket.on('acknowledge', (eventId: string) => {
        this.handleEventAcknowledgment(socket, eventId);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket);
      });

      // Health check ping/pong
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });
  }

  /**
   * Auto-create authenticated user channel
   */
  private async autoCreateUserChannel(socket: Socket, user: User, permissions: string[]): Promise<void> {
    try {
      // Create user channel with RBAC context
      const userChannel: UserChannel = {
        userId: user.id,
        socketId: socket.id,
        userRole: user.userRole || 'fan',
        organizationId: user.organizationId || '',
        permissions,
        subscriptions: new Set(),
        lastActivity: new Date()
      };

      // Register user channel
      this.userChannels.set(socket.id, userChannel);
      
      // SECURITY: Add to organization channel with validation
      if (user.organizationId) {
        const orgRoom = `org:${user.organizationId}`;
        if (!this.organizationChannels.has(user.organizationId)) {
          this.organizationChannels.set(user.organizationId, new Set());
        }
        this.organizationChannels.get(user.organizationId)!.add(socket.id);
        socket.join(orgRoom);
        
        console.log(`🏢 User ${user.id} joined organization room: ${orgRoom}`);
      }

      // Join role-based rooms
      const roleRoom = `role:${user.userRole}`;
      socket.join(roleRoom);
      
      // Send authentication success with user context
      socket.emit('authenticated', {
        userId: user.id,
        organizationId: user.organizationId,
        userRole: user.userRole,
        channels: [orgRoom, roleRoom],
        permissions
      });

      // Send buffered events for this user
      await this.sendBufferedEvents(socket, user.id);

      console.log(`✅ Auto-created channel for user: ${user.id} (${user.userRole}) in org: ${user.organizationId}`);
      
    } catch (error) {
      console.error('❌ Error auto-creating user channel:', error);
      socket.emit('channel_error', { message: 'Failed to create user channel' });
    }
  }

  /**
   * LEGACY SUPPORT: Handle legacy tournament join events
   */
  private handleLegacyTournamentJoin(socket: Socket, tournamentId: string): void {
    const userChannel = this.userChannels.get(socket.id);
    if (!userChannel) {
      socket.emit('tournament_error', { message: 'Not authenticated' });
      return;
    }

    // SECURITY: Validate tournament access based on organization
    const tournamentRoom = `tournament:${tournamentId}`;
    
    // For now, allow access if user is authenticated
    // TODO: Add tournament-specific access validation
    socket.join(tournamentRoom);
    
    // Emit both legacy and new event names for compatibility
    socket.emit('tournament-joined', { tournamentId });
    socket.emit('tournament_joined', { tournamentId });
    
    console.log(`🏆 User ${userChannel.userId} joined tournament: ${tournamentId}`);
  }

  /**
   * DEPRECATED: Legacy authentication handler (now handled by middleware)
   * Kept for backward compatibility
   */
  private async handleAuthentication(socket: Socket, authData: any): Promise<void> {
    // User is already authenticated via middleware
    const user = (socket as any).authenticatedUser as User;
    const userPermissions = (socket as any).userPermissions as string[];
    
    if (!user) {
      socket.emit('auth_error', { message: 'Authentication required' });
      return;
    }

    // Send authentication success
    socket.emit('authenticated', {
      userId: user.id,
      organizationId: user.organizationId,
      userRole: user.userRole,
      channels: [],
      permissions: userPermissions
    });

    console.log(`✅ Legacy auth handler: ${user.id} (${user.userRole})`);
  }

  /**
   * Handle event subscription with permission validation
   */
  private handleEventSubscription(socket: Socket, subscription: EventSubscription): void {
    const userChannel = this.userChannels.get(socket.id);
    if (!userChannel) {
      socket.emit('subscription_error', { message: 'Not authenticated' });
      return;
    }

    // Validate subscription permissions
    if (!this.validateSubscriptionPermissions(userChannel, subscription)) {
      socket.emit('subscription_error', { message: 'Insufficient permissions' });
      return;
    }

    // Add subscriptions
    subscription.eventTypes.forEach(eventType => {
      userChannel.subscriptions.add(eventType);
      socket.join(`event:${eventType}`);
    });

    // Add module subscriptions
    subscription.modules.forEach(module => {
      socket.join(`module:${module}`);
    });

    socket.emit('subscribed', {
      eventTypes: subscription.eventTypes,
      modules: subscription.modules
    });

    console.log(`📋 User ${userChannel.userId} subscribed to ${subscription.eventTypes.length} event types`);
  }

  /**
   * AUDIT: Publish platform event with comprehensive audit logging
   */
  async publishEvent(event: PlatformEvent): Promise<void> {
    if (!this.io) {
      console.warn('WebSocket service not initialized, buffering event');
      this.bufferEvent(event);
      return;
    }

    try {
      // AUDIT: Log all WebSocket events for comprehensive tracking
      await this.logEventAudit(event, 'event_published');

      // Enhanced compliance logging for sensitive data
      if (event.compliance.requiresAudit || event.compliance.containsHealthData || event.compliance.containsEducationalData) {
        await this.logComplianceEvent(event);
      }

      // Broadcast to appropriate channels based on RBAC scope
      const recipientCount = await this.broadcastToChannels(event);

      // Log successful broadcast with recipient metrics
      await this.logEventAudit(event, 'event_broadcast_completed', {
        recipientCount,
        channelsTargeted: this.getTargetChannels(event).length
      });

      console.log(`📡 Event published: ${event.type} (${event.priority}) to ${event.module} module - ${recipientCount} recipients`);

    } catch (error) {
      console.error('Error publishing event:', error);
      
      // Log the error for audit
      await this.logEventAudit(event, 'event_publish_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      this.bufferEvent(event);
    }
  }

  /**
   * AUDIT: Comprehensive event audit logging
   */
  private async logEventAudit(event: PlatformEvent, action: string, metadata?: any): Promise<void> {
    try {
      const auditData = {
        eventId: event.id,
        eventType: event.type,
        module: event.module,
        organizationId: event.organizationId,
        userId: event.userId || 'system',
        priority: event.priority,
        action,
        timestamp: event.timestamp,
        compliance: {
          hipaaRelevant: event.compliance.hipaaRelevant,
          ferpaRelevant: event.compliance.ferpaRelevant,
          containsHealthData: event.compliance.containsHealthData,
          containsEducationalData: event.compliance.containsEducationalData
        },
        rbacScope: event.rbacScope,
        metadata: metadata || {}
      };

      // Log to compliance audit system
      await logComplianceAction(
        event.userId || 'system',
        'websocket_event',
        event.compliance.containsHealthData ? 'health_data' : 
        event.compliance.containsEducationalData ? 'educational_data' : 'platform_data',
        event.organizationId,
        auditData,
        `WebSocket event: ${action} - ${event.type}`
      );

      console.log(`📝 Audit logged: ${action} for event ${event.type} (org: ${event.organizationId})`);
    } catch (auditError) {
      console.error('❌ Audit logging failed:', auditError);
      // Don't throw - audit failure shouldn't stop event processing
    }
  }

  /**
   * COMPLIANCE: Enhanced compliance logging for HIPAA/FERPA events
   */
  private async logComplianceEvent(event: PlatformEvent): Promise<void> {
    try {
      if (event.compliance.hipaaRelevant) {
        console.log(`🏮 HIPAA: Processing health data event ${event.type} for org ${event.organizationId}`);
        
        // Log specific HIPAA compliance details
        await logComplianceAction(
          event.userId || 'system',
          'hipaa_data_transmission',
          'health_data',
          event.organizationId,
          {
            eventType: event.type,
            dataClassifications: event.rbacScope.dataClassifications,
            authorizedRoles: event.rbacScope.userRoles,
            containsHealthData: event.compliance.containsHealthData
          },
          `HIPAA: WebSocket transmission of health data - ${event.type}`
        );
      }

      if (event.compliance.ferpaRelevant) {
        console.log(`🎓 FERPA: Processing educational data event ${event.type} for org ${event.organizationId}`);
        
        // Log specific FERPA compliance details
        await logComplianceAction(
          event.userId || 'system',
          'ferpa_data_transmission',
          'educational_data',
          event.organizationId,
          {
            eventType: event.type,
            dataClassifications: event.rbacScope.dataClassifications,
            authorizedRoles: event.rbacScope.userRoles,
            containsEducationalData: event.compliance.containsEducationalData
          },
          `FERPA: WebSocket transmission of educational data - ${event.type}`
        );
      }
    } catch (complianceError) {
      console.error('❌ Compliance logging failed:', complianceError);
      // Log the compliance failure itself
      try {
        await logComplianceAction(
          'system',
          'compliance_logging_failure',
          'system',
          event.organizationId,
          { error: complianceError instanceof Error ? complianceError.message : 'Unknown error' },
          `Compliance logging failed for event ${event.type}`
        );
      } catch {
        // Ignore secondary logging failures
      }
    }
  }

  /**
   * Get target channels for an event (for audit purposes)
   */
  private getTargetChannels(event: PlatformEvent): string[] {
    const channels: string[] = [];

    // Organization-scoped events
    if (event.organizationId) {
      channels.push(`org:${event.organizationId}`);
    }

    // Event type channels  
    channels.push(`event:${event.type}`);
    
    // Module channels
    channels.push(`module:${event.module}`);

    // Role-based channels for RBAC scope
    event.rbacScope.userRoles.forEach(role => {
      channels.push(`role:${role}`);
    });

    // Priority-based emergency broadcasts
    if (event.priority === 'emergency') {
      channels.push('emergency');
    }

    return channels;
  }

  /**
   * AUDIT: Broadcast event to appropriate channels with RBAC filtering and recipient tracking
   */
  private async broadcastToChannels(event: PlatformEvent): Promise<number> {
    if (!this.io) return 0;

    let totalRecipients = 0;
    const channels = this.getTargetChannels(event);

    // AUDIT: Log broadcast attempt
    await this.logEventAudit(event, 'broadcast_initiated', {
      targetChannels: channels,
      channelCount: channels.length
    });

    // Filter and send to each channel
    for (const channel of channels) {
      const filteredEvent = await this.applyRBACFiltering(event, channel);
      if (filteredEvent) {
        // Get channel recipient count
        const channelSockets = await this.io.in(channel).allSockets();
        const recipientCount = channelSockets.size;
        
        if (recipientCount > 0) {
          this.io.to(channel).emit('platform_event', filteredEvent);
          totalRecipients += recipientCount;
          
          // AUDIT: Log channel delivery
          await this.logEventAudit(event, 'channel_delivered', {
            channel,
            recipientCount,
            containsSensitiveData: event.compliance.containsHealthData || event.compliance.containsEducationalData
          });
        }
      } else {
        // AUDIT: Log filtered delivery
        await this.logEventAudit(event, 'channel_filtered', {
          channel,
          reason: 'RBAC filtering removed event content'
        });
      }
    }

    // Send direct messages for high priority events to specific users
    if (event.priority === 'urgent' || event.priority === 'emergency') {
      const directRecipients = await this.sendDirectNotifications(event);
      totalRecipients += directRecipients;
    }

    return totalRecipients;
  }

  /**
   * Apply RBAC filtering to events before sending
   */
  private async applyRBACFiltering(event: PlatformEvent, channel: string): Promise<PlatformEvent | null> {
    // Clone event for filtering
    const filteredEvent = { ...event };

    // Remove sensitive data based on channel permissions
    if (event.compliance.containsHealthData) {
      const hasHealthAccess = channel.includes('role:athletic_trainer') || 
                             channel.includes('role:district_athletic_director');
      if (!hasHealthAccess) {
        // Sanitize health data
        filteredEvent.data = this.sanitizeHealthData(event.data);
      }
    }

    if (event.compliance.containsEducationalData) {
      const hasEducationalAccess = channel.includes('role:school_') || 
                                  channel.includes('role:district_');
      if (!hasEducationalAccess) {
        // Sanitize educational data  
        filteredEvent.data = this.sanitizeEducationalData(event.data);
      }
    }

    return filteredEvent;
  }

  /**
   * AUDIT: Send direct notifications for high priority events with tracking
   */
  private async sendDirectNotifications(event: PlatformEvent): Promise<number> {
    if (!this.io) return 0;

    // Get users who should receive direct notifications
    const targetUsers = await this.getDirectNotificationTargets(event);
    let directRecipients = 0;
    
    for (const userId of targetUsers) {
      const userSocket = this.findUserSocket(userId);
      if (userSocket) {
        userSocket.emit('direct_notification', {
          ...event,
          isDirectNotification: true,
          requiresAcknowledgment: event.priority === 'emergency'
        });
        directRecipients++;
        
        // AUDIT: Log direct notification delivery
        await this.logEventAudit(event, 'direct_notification_sent', {
          targetUserId: userId,
          requiresAcknowledgment: event.priority === 'emergency',
          socketId: userSocket.id
        });
      }
    }

    // AUDIT: Log direct notification summary
    if (targetUsers.length > 0) {
      await this.logEventAudit(event, 'direct_notifications_completed', {
        targetsIdentified: targetUsers.length,
        delivered: directRecipients,
        deliveryRate: targetUsers.length > 0 ? (directRecipients / targetUsers.length) * 100 : 0
      });
    }

    return directRecipients;
  }

  /**
   * Module-specific event publishing methods
   */

  // Tournament Events
  async publishTournamentEvent(
    type: Extract<PlatformEventType, 'tournament_created' | 'match_started' | 'score_updated' | 'bracket_progressed'>,
    tournamentId: string,
    data: any,
    organizationId: string,
    userId?: string
  ): Promise<void> {
    const event: PlatformEvent = {
      id: `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      module: 'tournaments',
      organizationId,
      userId,
      data: { ...data, tournamentId },
      timestamp: new Date(),
      priority: this.getTournamentEventPriority(type),
      rbacScope: {
        organizationIds: [organizationId],
        userRoles: ['tournament_manager', 'assistant_tournament_manager', 'scorekeeper', 'fan'],
        permissions: ['TOURNAMENT_VIEW'],
        dataClassifications: ['public', 'internal']
      },
      compliance: {
        containsHealthData: false,
        containsEducationalData: false,
        requiresAudit: false,
        hipaaRelevant: false,
        ferpaRelevant: false
      }
    };

    await this.publishEvent(event);
  }

  // Athletic Trainer Events
  async publishHealthEvent(
    type: Extract<PlatformEventType, 'health_alert_created' | 'injury_reported' | 'emergency_alert'>,
    athleteId: string,
    data: any,
    organizationId: string,
    userId: string
  ): Promise<void> {
    const event: PlatformEvent = {
      id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      module: 'athletic_training',
      organizationId,
      userId,
      data: { ...data, athleteId },
      timestamp: new Date(),
      priority: this.getHealthEventPriority(type),
      rbacScope: {
        organizationIds: [organizationId],
        userRoles: ['athletic_trainer', 'district_athletic_director', 'school_athletic_director'],
        permissions: ['HEALTH_DATA_READ'],
        dataClassifications: ['confidential', 'medical']
      },
      compliance: {
        containsHealthData: true,
        containsEducationalData: false,
        requiresAudit: true,
        hipaaRelevant: true,
        ferpaRelevant: false
      }
    };

    await this.publishEvent(event);
  }

  // Scheduling Events  
  async publishSchedulingEvent(
    type: Extract<PlatformEventType, 'conflict_detected' | 'event_created' | 'reminder_triggered'>,
    eventId: string,
    data: any,
    organizationId: string,
    userId?: string
  ): Promise<void> {
    const event: PlatformEvent = {
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      module: 'scheduling',
      organizationId,
      userId,
      data: { ...data, eventId },
      timestamp: new Date(),
      priority: this.getSchedulingEventPriority(type),
      rbacScope: {
        organizationIds: [organizationId],
        userRoles: ['district_athletic_director', 'school_athletic_director', 'head_coach'],
        permissions: ['TOURNAMENT_VIEW'],
        dataClassifications: ['internal']
      },
      compliance: {
        containsHealthData: false,
        containsEducationalData: true,
        requiresAudit: false,
        hipaaRelevant: false,
        ferpaRelevant: true
      }
    };

    await this.publishEvent(event);
  }

  // Academic Competition Events
  async publishAcademicEvent(
    type: Extract<PlatformEventType, 'competition_started' | 'results_updated' | 'academic_score_updated'>,
    competitionId: string,
    data: any,
    organizationId: string,
    userId?: string
  ): Promise<void> {
    const event: PlatformEvent = {
      id: `academic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      module: 'academics',
      organizationId,
      userId,
      data: { ...data, competitionId },
      timestamp: new Date(),
      priority: 'normal',
      rbacScope: {
        organizationIds: [organizationId],
        userRoles: ['district_athletic_director', 'school_athletic_director', 'head_coach'],
        permissions: ['ACADEMIC_DATA_READ'],
        dataClassifications: ['educational']
      },
      compliance: {
        containsHealthData: false,
        containsEducationalData: true,
        requiresAudit: false,
        hipaaRelevant: false,
        ferpaRelevant: true
      }
    };

    await this.publishEvent(event);
  }

  /**
   * Utility methods
   */

  private getTournamentEventPriority(type: string): EventPriority {
    switch (type) {
      case 'tournament_started':
      case 'match_started':
        return 'high';
      case 'score_updated':
      case 'bracket_progressed':
        return 'normal';
      default:
        return 'normal';
    }
  }

  private getHealthEventPriority(type: string): EventPriority {
    switch (type) {
      case 'emergency_alert':
        return 'emergency';
      case 'health_alert_created':
      case 'injury_reported':
        return 'urgent';
      default:
        return 'high';
    }
  }

  private getSchedulingEventPriority(type: string): EventPriority {
    switch (type) {
      case 'conflict_detected':
        return 'high';
      case 'reminder_triggered':
        return 'normal';
      default:
        return 'normal';
    }
  }

  private async getUserPermissions(user: User): Promise<string[]> {
    // Integration point with existing RBAC system
    const permissions: string[] = [];
    
    const userRole = user.userRole as string;
    switch (userRole) {
      case 'district_athletic_director':
        permissions.push('TOURNAMENT_MANAGE', 'HEALTH_DATA_READ', 'ACADEMIC_DATA_READ', 'SYSTEM_ADMIN');
        break;
      case 'athletic_trainer':
      case 'district_athletic_trainer':
        permissions.push('HEALTH_DATA_READ', 'HEALTH_DATA_WRITE', 'TOURNAMENT_VIEW');
        break;
      case 'tournament_manager':
        permissions.push('TOURNAMENT_MANAGE', 'TOURNAMENT_VIEW');
        break;
      case 'head_coach':
        permissions.push('TOURNAMENT_VIEW', 'ACADEMIC_DATA_READ');
        break;
      default:
        permissions.push('TOURNAMENT_VIEW');
    }
    
    return permissions;
  }

  private validateSubscriptionPermissions(channel: UserChannel, subscription: EventSubscription): boolean {
    // Check if user has permission to subscribe to these events
    for (const eventType of subscription.eventTypes) {
      if (eventType.startsWith('health_') && !channel.permissions.includes('HEALTH_DATA_READ')) {
        return false;
      }
      if (eventType.startsWith('academic_') && !channel.permissions.includes('ACADEMIC_DATA_READ')) {
        return false;
      }
    }
    return true;
  }

  private sanitizeHealthData(data: any): any {
    // Remove sensitive health information for unauthorized users
    const sanitized = { ...data };
    delete sanitized.medicalHistory;
    delete sanitized.medications;
    delete sanitized.symptoms;
    delete sanitized.vitalSigns;
    return { ...sanitized, message: 'Health alert (details restricted)' };
  }

  private sanitizeEducationalData(data: any): any {
    // Remove sensitive educational information for unauthorized users  
    const sanitized = { ...data };
    delete sanitized.grades;
    delete sanitized.academicRecords;
    delete sanitized.personalInfo;
    return { ...sanitized, message: 'Academic update (details restricted)' };
  }

  private bufferEvent(event: PlatformEvent): void {
    const bufferKey = `${event.organizationId}_${event.module}`;
    if (!this.eventBuffer.has(bufferKey)) {
      this.eventBuffer.set(bufferKey, []);
    }
    this.eventBuffer.get(bufferKey)!.push(event);
    
    // Limit buffer size
    const buffer = this.eventBuffer.get(bufferKey)!;
    if (buffer.length > 100) {
      buffer.splice(0, buffer.length - 100);
    }
  }

  private async sendBufferedEvents(socket: Socket, userId: string): Promise<void> {
    const userChannel = this.userChannels.get(socket.id);
    if (!userChannel) return;

    const bufferKey = `${userChannel.organizationId}_*`;
    // Send relevant buffered events to newly connected user
    // Implementation would filter and send recent events
  }

  private async getDirectNotificationTargets(event: PlatformEvent): Promise<string[]> {
    // Get users who should receive direct notifications based on event type and severity
    const targets: string[] = [];
    
    if (event.priority === 'emergency' && event.module === 'athletic_training') {
      // Emergency health alerts go to all athletic trainers in organization
      targets.push(...await this.getUsersByRoleInOrganization('athletic_trainer', event.organizationId));
    }
    
    return targets;
  }

  private async getUsersByRoleInOrganization(role: string, organizationId: string): Promise<string[]> {
    // Implementation would query user database
    return [];
  }

  private findUserSocket(userId: string): Socket | null {
    for (const [socketId, channel] of Array.from(this.userChannels.entries())) {
      if (channel.userId === userId) {
        return this.io?.sockets.sockets.get(socketId) || null;
      }
    }
    return null;
  }

  private handleEventUnsubscription(socket: Socket, eventTypes: PlatformEventType[]): void {
    const userChannel = this.userChannels.get(socket.id);
    if (!userChannel) return;

    eventTypes.forEach(eventType => {
      userChannel.subscriptions.delete(eventType);
      socket.leave(`event:${eventType}`);
    });

    socket.emit('unsubscribed', { eventTypes });
  }

  /**
   * SECURITY: Enhanced room join with comprehensive organizational validation
   */
  private async handleRoomJoin(socket: Socket, roomData: any): Promise<void> {
    const userChannel = this.userChannels.get(socket.id);
    if (!userChannel) {
      socket.emit('room_error', { message: 'Not authenticated' });
      return;
    }

    const { room, context } = roomData;
    if (!room) {
      socket.emit('room_error', { message: 'Room identifier required' });
      return;
    }

    try {
      // SECURITY: Validate room access with comprehensive authorization
      const accessResult = await this.validateEnhancedRoomAccess(userChannel, room, context);
      
      if (!accessResult.allowed) {
        console.warn(`⚠️  Room access denied: User ${userChannel.userId} attempted to join ${room}`);
        
        // Log security violation for audit
        await logComplianceAction(
          userChannel.userId,
          'room_access_denied',
          'security',
          room,
          { userRole: userChannel.userRole, organizationId: userChannel.organizationId },
          `Room access denied: ${accessResult.reason}`
        );
        
        socket.emit('room_error', { 
          message: 'Access denied to room',
          reason: accessResult.reason,
          room 
        });
        return;
      }

      // Join the room
      socket.join(room);
      
      // Log successful room join for audit
      await logComplianceAction(
        userChannel.userId,
        'room_joined',
        'security',
        room,
        { userRole: userChannel.userRole, organizationId: userChannel.organizationId },
        `Successfully joined room: ${room}`
      );
      
      socket.emit('room_joined', { 
        room,
        permissions: accessResult.permissions,
        organizationScope: userChannel.organizationId
      });
      
      console.log(`✅ User ${userChannel.userId} joined room: ${room}`);
      
    } catch (error) {
      console.error('❌ Error handling room join:', error);
      socket.emit('room_error', { message: 'Failed to join room' });
    }
  }

  private handleRoomLeave(socket: Socket, roomData: any): void {
    socket.leave(roomData.room);
    socket.emit('room_left', { room: roomData.room });
  }

  private handleEventAcknowledgment(socket: Socket, eventId: string): void {
    const userChannel = this.userChannels.get(socket.id);
    if (!userChannel) return;

    console.log(`✅ Event acknowledged: ${eventId} by user ${userChannel.userId}`);
    
    // Could store acknowledgment in database for compliance
    socket.emit('acknowledgment_received', { eventId });
  }

  private handleDisconnection(socket: Socket): void {
    const userChannel = this.userChannels.get(socket.id);
    if (userChannel) {
      console.log(`🔌 User disconnected: ${userChannel.userId}`);
      
      // Remove from organization channels
      if (userChannel.organizationId) {
        const orgChannel = this.organizationChannels.get(userChannel.organizationId);
        if (orgChannel) {
          orgChannel.delete(socket.id);
          if (orgChannel.size === 0) {
            this.organizationChannels.delete(userChannel.organizationId);
          }
        }
      }
      
      // Remove user channel
      this.userChannels.delete(socket.id);
    }
  }

  /**
   * DEPRECATED: Simple room validation (replaced by enhanced version)
   */
  private validateRoomAccess(channel: UserChannel, room: string): boolean {
    return this.validateEnhancedRoomAccess(channel, room).then(result => result.allowed).catch(() => false);
  }

  /**
   * SECURITY: Enhanced room access validation with organizational scoping
   */
  private async validateEnhancedRoomAccess(
    channel: UserChannel, 
    room: string, 
    context?: any
  ): Promise<{ allowed: boolean; reason?: string; permissions?: string[] }> {
    try {
      // Organization-scoped rooms (e.g., org:district-123, org:school-456)
      if (room.startsWith('org:')) {
        const orgId = room.replace('org:', '');
        
        // Users can only access their own organization's rooms
        if (channel.organizationId !== orgId) {
          return {
            allowed: false,
            reason: `Cross-organization access denied. User org: ${channel.organizationId}, Requested: ${orgId}`
          };
        }
        
        return {
          allowed: true,
          permissions: channel.permissions
        };
      }
      
      // District-scoped rooms (e.g., district:CCISD)
      if (room.startsWith('district:')) {
        const districtId = room.replace('district:', '');
        
        // Only district-level roles can access district rooms
        const hasDistrictAccess = [
          'district_athletic_director',
          'district_athletic_trainer',
          'district_admin',
          'district_budget_manager'
        ].includes(channel.userRole);
        
        if (!hasDistrictAccess) {
          return {
            allowed: false,
            reason: `District access denied. User role: ${channel.userRole}`
          };
        }
        
        // Verify user's organization is within this district
        if (!channel.organizationId.includes(districtId)) {
          return {
            allowed: false,
            reason: `District mismatch. User org: ${channel.organizationId}, District: ${districtId}`
          };
        }
        
        return { allowed: true, permissions: channel.permissions };
      }
      
      // School-scoped rooms (e.g., school:school-789)
      if (room.startsWith('school:')) {
        const schoolId = room.replace('school:', '');
        
        // School-level and district-level roles can access school rooms
        const hasSchoolAccess = [
          'school_athletic_director',
          'athletic_trainer',
          'head_coach',
          'district_athletic_director',
          'district_athletic_trainer'
        ].includes(channel.userRole);
        
        if (!hasSchoolAccess) {
          return {
            allowed: false,
            reason: `School access denied. User role: ${channel.userRole}`
          };
        }
        
        // Verify organizational hierarchy access
        const hasOrgAccess = channel.organizationId === schoolId || 
                           channel.organizationId.includes('district') ||
                           channel.userRole.startsWith('district_');
        
        if (!hasOrgAccess) {
          return {
            allowed: false,
            reason: `School access denied. User org: ${channel.organizationId}, School: ${schoolId}`
          };
        }
        
        return { allowed: true, permissions: channel.permissions };
      }
      
      // Health data rooms (e.g., health:alerts, health:emergencies)
      if (room.startsWith('health:')) {
        const hasHealthAccess = channel.permissions.includes('HEALTH_DATA_READ');
        
        if (!hasHealthAccess) {
          return {
            allowed: false,
            reason: `Health data access denied. Missing HEALTH_DATA_READ permission`
          };
        }
        
        // HIPAA Compliance: Log health data room access
        console.log(`🏮 HIPAA: User ${channel.userId} accessing health room: ${room}`);
        
        return { allowed: true, permissions: channel.permissions };
      }
      
      // Academic data rooms (e.g., academic:competitions, academic:results)
      if (room.startsWith('academic:')) {
        const hasAcademicAccess = channel.permissions.includes('ACADEMIC_DATA_READ');
        
        if (!hasAcademicAccess) {
          return {
            allowed: false,
            reason: `Academic data access denied. Missing ACADEMIC_DATA_READ permission`
          };
        }
        
        // FERPA Compliance: Log educational data room access
        console.log(`🎓 FERPA: User ${channel.userId} accessing academic room: ${room}`);
        
        return { allowed: true, permissions: channel.permissions };
      }
      
      // Role-based rooms (e.g., role:athletic_trainer)
      if (room.startsWith('role:')) {
        const requiredRole = room.replace('role:', '');
        
        if (channel.userRole !== requiredRole) {
          return {
            allowed: false,
            reason: `Role mismatch. User role: ${channel.userRole}, Required: ${requiredRole}`
          };
        }
        
        return { allowed: true, permissions: channel.permissions };
      }
      
      // Tournament rooms (e.g., tournament:tournament-123)
      if (room.startsWith('tournament:')) {
        // All authenticated users can view tournaments, but verify organizational scope
        const tournamentId = room.replace('tournament:', '');
        
        // TODO: Add tournament-specific organizational validation
        // For now, allow access if user is authenticated
        return { allowed: true, permissions: channel.permissions };
      }
      
      // Emergency broadcast rooms (emergency access only)
      if (room === 'emergency') {
        const hasEmergencyAccess = [
          'district_athletic_director',
          'athletic_trainer',
          'district_athletic_trainer'
        ].includes(channel.userRole);
        
        if (!hasEmergencyAccess) {
          return {
            allowed: false,
            reason: `Emergency room access denied. User role: ${channel.userRole}`
          };
        }
        
        return { allowed: true, permissions: channel.permissions };
      }
      
      // Module-based rooms (e.g., module:athletic_training)
      if (room.startsWith('module:')) {
        const module = room.replace('module:', '');
        
        // Validate module access based on user role and permissions
        switch (module) {
          case 'athletic_training':
            return {
              allowed: channel.permissions.includes('HEALTH_DATA_READ'),
              reason: channel.permissions.includes('HEALTH_DATA_READ') ? undefined : 'Health data access required'
            };
          case 'academics':
            return {
              allowed: channel.permissions.includes('ACADEMIC_DATA_READ'),
              reason: channel.permissions.includes('ACADEMIC_DATA_READ') ? undefined : 'Academic data access required'
            };
          case 'tournaments':
            return {
              allowed: channel.permissions.includes('TOURNAMENT_VIEW'),
              reason: channel.permissions.includes('TOURNAMENT_VIEW') ? undefined : 'Tournament view access required'
            };
          default:
            return {
              allowed: false,
              reason: `Unknown module: ${module}`
            };
        }
      }
      
      // Deny access to unknown room types
      return {
        allowed: false,
        reason: `Unknown room type: ${room}`
      };
      
    } catch (error) {
      console.error('❌ Error validating room access:', error);
      return {
        allowed: false,
        reason: 'Internal validation error'
      };
    }
  }

  /**
   * Service health and monitoring
   */
  getServiceStatus() {
    return {
      initialized: !!this.io,
      connectedUsers: this.userChannels.size,
      organizationChannels: this.organizationChannels.size,
      bufferedEvents: Array.from(this.eventBuffer.values()).reduce((sum, events) => sum + events.length, 0),
      uptime: process.uptime()
    };
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
    }
    this.userChannels.clear();
    this.organizationChannels.clear();
    this.eventBuffer.clear();
    console.log('🔌 Unified WebSocket service shutdown complete');
  }
}

// Export singleton instance
export const unifiedWebSocketService = UnifiedWebSocketService.getInstance();