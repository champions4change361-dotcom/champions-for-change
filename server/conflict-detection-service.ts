import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import type { 
  User, 
  ScheduleConflict, 
  InsertScheduleConflict,
  AthleticCalendarEvent,
  Game,
  Practice,
  FacilityReservation
} from "@shared/schema";

export interface ConflictDetectionRule {
  id: string;
  name: string;
  description: string;
  category: 'venue' | 'personnel' | 'equipment' | 'transportation' | 'regulatory';
  severity: 'minor' | 'major' | 'critical';
  enabled: boolean;
  conditions: ConflictCondition[];
  actions: ConflictAction[];
}

export interface ConflictCondition {
  type: 'time_overlap' | 'resource_conflict' | 'capacity_exceeded' | 'personnel_unavailable' | 'distance_constraint';
  parameters: Record<string, any>;
}

export interface ConflictAction {
  type: 'notify' | 'suggest_alternative' | 'auto_resolve' | 'escalate' | 'block_creation';
  parameters: Record<string, any>;
}

export interface DetectedConflict {
  id: string;
  conflictType: 'venue_double_booked' | 'coach_conflict' | 'athlete_conflict' | 'transportation_conflict' | 'official_conflict' | 'equipment_conflict' | 'capacity_exceeded';
  severity: 'minor' | 'major' | 'critical';
  events: ConflictingEvent[];
  conflictDetails: {
    description: string;
    timeOverlap?: {
      start: string;
      end: string;
      duration: number;
    };
    resources: ResourceConflict[];
    impactedPersonnel: PersonnelConflict[];
  };
  resolutionSuggestions: ResolutionSuggestion[];
  status: 'detected' | 'acknowledged' | 'resolving' | 'resolved' | 'unresolvable';
  priority: number;
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ConflictingEvent {
  id: string;
  type: 'game' | 'practice' | 'calendar_event' | 'facility_reservation' | 'athletic_trainer_appointment';
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  participants: string[];
  requiredResources: string[];
}

export interface ResourceConflict {
  resourceId: string;
  resourceType: 'facility' | 'equipment' | 'personnel' | 'transportation';
  resourceName: string;
  conflictReason: string;
  availability: {
    total: number;
    allocated: number;
    requested: number;
  };
}

export interface PersonnelConflict {
  personId: string;
  personName: string;
  personRole: string;
  conflictType: 'double_booked' | 'unavailable' | 'exceeds_hours' | 'certification_required';
  currentCommitments: string[];
}

export interface ResolutionSuggestion {
  id: string;
  type: 'reschedule' | 'relocate' | 'reassign_personnel' | 'alternative_resource' | 'split_event' | 'cancel_conflict';
  description: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
  estimatedEffort: string;
  details: {
    suggestedChanges: SuggestedChange[];
    pros: string[];
    cons: string[];
    alternativeTimeSlots?: TimeSlot[];
    alternativeVenues?: VenueOption[];
  };
}

export interface SuggestedChange {
  eventId: string;
  changeType: 'time' | 'location' | 'personnel' | 'resource' | 'capacity';
  currentValue: any;
  suggestedValue: any;
  reason: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  venue?: string;
  conflicts: number;
  score: number; // optimization score
}

export interface VenueOption {
  venueId: string;
  venueName: string;
  capacity: number;
  availability: boolean;
  distance?: number; // from original venue
  suitability: number; // 0-100
  additionalCosts?: number;
}

export interface ConflictAnalytics {
  totalConflicts: number;
  conflictsByType: Record<string, number>;
  conflictsBySeverity: Record<string, number>;
  resolutionRate: number;
  averageResolutionTime: number;
  mostProblematicResources: ResourceAnalytics[];
  conflictTrends: {
    date: string;
    count: number;
  }[];
}

export interface ResourceAnalytics {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  conflictCount: number;
  utilizationRate: number;
  recommendations: string[];
}

/**
 * Conflict Detection Service
 * Intelligent conflict detection and resolution for scheduling
 */
export class ConflictDetectionService {
  private storage = getStorage();
  private detectionRules: ConflictDetectionRule[] = [];

  constructor() {
    console.log('⚠️ Conflict Detection Service initialized');
    this.initializeDefaultRules();
  }

  // ===================================================================
  // CONFLICT DETECTION METHODS
  // ===================================================================

  /**
   * Detect conflicts for a specific event
   */
  async detectEventConflicts(
    eventData: {
      id?: string;
      type: 'game' | 'practice' | 'calendar_event' | 'facility_reservation';
      startTime: string;
      endTime: string;
      location?: string;
      requiredPersonnel?: string[];
      requiredResources?: string[];
      participants?: string[];
    },
    user: User,
    excludeEventId?: string
  ): Promise<DetectedConflict[]> {
    try {
      const conflicts: DetectedConflict[] = [];

      // Get all potentially conflicting events in the time range
      const potentialConflicts = await this.getPotentialConflicts(
        eventData.startTime,
        eventData.endTime,
        user,
        excludeEventId
      );

      // Apply each detection rule
      for (const rule of this.detectionRules.filter(r => r.enabled)) {
        const ruleConflicts = await this.applyDetectionRule(
          rule,
          eventData,
          potentialConflicts,
          user
        );
        conflicts.push(...ruleConflicts);
      }

      // Deduplicate and prioritize conflicts
      const deduplicatedConflicts = this.deduplicateConflicts(conflicts);
      const prioritizedConflicts = this.prioritizeConflicts(deduplicatedConflicts);

      // Generate resolution suggestions for each conflict
      for (const conflict of prioritizedConflicts) {
        conflict.resolutionSuggestions = await this.generateResolutionSuggestions(
          conflict,
          user
        );
      }

      return prioritizedConflicts;
    } catch (error) {
      console.error('Error detecting event conflicts:', error);
      throw new Error('Failed to detect conflicts');
    }
  }

  /**
   * Detect all conflicts in a date range
   */
  async detectConflictsInRange(
    startDate: string,
    endDate: string,
    user: User,
    options?: {
      includeResolved?: boolean;
      severityFilter?: ('minor' | 'major' | 'critical')[];
      typeFilter?: string[];
    }
  ): Promise<DetectedConflict[]> {
    try {
      const storage = await this.storage;

      // Get all events in the date range
      const events = await this.getAllEventsInRange(startDate, endDate, user);

      // Detect conflicts between all events
      const allConflicts: DetectedConflict[] = [];

      for (let i = 0; i < events.length; i++) {
        for (let j = i + 1; j < events.length; j++) {
          const conflicts = await this.detectConflictsBetweenEvents(
            events[i],
            events[j],
            user
          );
          allConflicts.push(...conflicts);
        }
      }

      // Apply filters
      let filteredConflicts = allConflicts;

      if (options?.severityFilter?.length) {
        filteredConflicts = filteredConflicts.filter(c => 
          options.severityFilter!.includes(c.severity)
        );
      }

      if (options?.typeFilter?.length) {
        filteredConflicts = filteredConflicts.filter(c => 
          options.typeFilter!.includes(c.conflictType)
        );
      }

      if (!options?.includeResolved) {
        filteredConflicts = filteredConflicts.filter(c => 
          c.status !== 'resolved'
        );
      }

      return this.prioritizeConflicts(filteredConflicts);
    } catch (error) {
      console.error('Error detecting conflicts in range:', error);
      throw new Error('Failed to detect conflicts in range');
    }
  }

  /**
   * Real-time conflict detection when event is modified
   */
  async checkRealTimeConflicts(
    eventId: string,
    eventType: string,
    user: User
  ): Promise<DetectedConflict[]> {
    try {
      const storage = await this.storage;

      // Get the event data
      const eventData = await this.getEventData(eventId, eventType, user);
      if (!eventData) {
        throw new Error('Event not found');
      }

      // Detect conflicts
      const conflicts = await this.detectEventConflicts(eventData, user, eventId);

      // If critical conflicts found, trigger immediate notifications
      const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
      if (criticalConflicts.length > 0) {
        await this.triggerCriticalConflictAlerts(criticalConflicts, user);
      }

      return conflicts;
    } catch (error) {
      console.error('Error checking real-time conflicts:', error);
      throw error;
    }
  }

  // ===================================================================
  // CONFLICT RESOLUTION METHODS
  // ===================================================================

  /**
   * Resolve conflict with selected solution
   */
  async resolveConflict(
    conflictId: string,
    resolutionId: string,
    user: User,
    notes?: string
  ): Promise<void> {
    try {
      const storage = await this.storage;

      // Get conflict details
      const conflict = await storage.getScheduleConflict(conflictId, user);
      if (!conflict) {
        throw new Error('Conflict not found');
      }

      // Get resolution suggestion
      const detectedConflict = await this.enrichConflictData(conflict, user);
      const resolution = detectedConflict.resolutionSuggestions.find(r => r.id === resolutionId);
      if (!resolution) {
        throw new Error('Resolution suggestion not found');
      }

      // Apply the resolution
      await this.applyResolution(resolution, user);

      // Update conflict status
      await storage.updateScheduleConflict(conflictId, {
        conflictStatus: 'resolved',
        resolutionMethod: resolution.type,
        resolutionNotes: notes || resolution.description,
        resolvedBy: user.id,
        resolvedAt: new Date().toISOString()
      }, user);

      // Log the resolution
      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        conflictId,
        undefined,
        `Conflict resolved using ${resolution.type}: ${resolution.description}`
      );

      // Notify affected parties
      await this.notifyConflictResolution(conflictId, resolution, user);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      throw error;
    }
  }

  /**
   * Auto-resolve conflicts where possible
   */
  async autoResolveConflicts(
    user: User,
    criteria?: {
      maxSeverity?: 'minor' | 'major';
      minConfidence?: number;
      conflictTypes?: string[];
    }
  ): Promise<{
    resolved: string[];
    failed: { conflictId: string; reason: string }[];
  }> {
    try {
      const storage = await this.storage;

      // Get unresolved conflicts that meet criteria
      const conflicts = await storage.getUnresolvedConflicts(user);
      const eligibleConflicts = conflicts.filter((conflict: any) => {
        if (criteria?.maxSeverity && 
            this.getSeverityLevel(conflict.severity) > this.getSeverityLevel(criteria.maxSeverity)) {
          return false;
        }
        if (criteria?.conflictTypes?.length && 
            !criteria.conflictTypes.includes(conflict.conflictType)) {
          return false;
        }
        return true;
      });

      const resolved: string[] = [];
      const failed: { conflictId: string; reason: string }[] = [];

      for (const conflict of eligibleConflicts) {
        try {
          const detectedConflict = await this.enrichConflictData(conflict, user);
          
          // Find high-confidence auto-resolvable solutions
          const autoResolution = detectedConflict.resolutionSuggestions.find(r => 
            r.confidence >= (criteria?.minConfidence || 90) &&
            r.impact === 'low' &&
            ['reschedule', 'relocate', 'alternative_resource'].includes(r.type)
          );

          if (autoResolution) {
            await this.resolveConflict(conflict.id, autoResolution.id, user, 'Auto-resolved');
            resolved.push(conflict.id);
          } else {
            failed.push({
              conflictId: conflict.id,
              reason: 'No high-confidence resolution available'
            });
          }
        } catch (error) {
          failed.push({
            conflictId: conflict.id,
            reason: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return { resolved, failed };
    } catch (error) {
      console.error('Error auto-resolving conflicts:', error);
      throw error;
    }
  }

  // ===================================================================
  // ANALYTICS AND REPORTING
  // ===================================================================

  /**
   * Get conflict analytics for specified period
   */
  async getConflictAnalytics(
    startDate: string,
    endDate: string,
    user: User,
    organizationId?: string
  ): Promise<ConflictAnalytics> {
    try {
      const storage = await this.storage;

      const conflicts = await storage.getScheduleConflictsByDateRange(
        startDate,
        endDate,
        user
      );

      const analytics: ConflictAnalytics = {
        totalConflicts: conflicts.length,
        conflictsByType: this.groupBy(conflicts, 'conflictType'),
        conflictsBySeverity: this.groupBy(conflicts, 'severity'),
        resolutionRate: this.calculateResolutionRate(conflicts),
        averageResolutionTime: this.calculateAverageResolutionTime(conflicts),
        mostProblematicResources: await this.getProblematicResources(conflicts, user),
        conflictTrends: this.calculateConflictTrends(conflicts, startDate, endDate)
      };

      return analytics;
    } catch (error) {
      console.error('Error getting conflict analytics:', error);
      throw error;
    }
  }

  /**
   * Generate conflict prevention recommendations
   */
  async generateConflictPreventionRecommendations(
    organizationId: string,
    user: User
  ): Promise<{
    recommendations: string[];
    highRiskTimeSlots: TimeSlot[];
    resourceOptimizations: ResourceAnalytics[];
    schedulingGuidelines: string[];
  }> {
    try {
      // Analyze historical conflict patterns
      const analytics = await this.getConflictAnalytics(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        user,
        organizationId
      );

      const recommendations: string[] = [];
      const highRiskTimeSlots: TimeSlot[] = [];
      const schedulingGuidelines: string[] = [];

      // Generate recommendations based on analytics
      if (analytics.conflictsByType['venue_double_booked'] > analytics.totalConflicts * 0.3) {
        recommendations.push('Consider implementing venue booking approval workflow');
        recommendations.push('Add buffer time between venue bookings');
      }

      if (analytics.conflictsByType['coach_conflict'] > analytics.totalConflicts * 0.2) {
        recommendations.push('Implement coach availability tracking');
        recommendations.push('Consider assistant coach assignments for scheduling flexibility');
      }

      // Identify high-risk time slots
      const timeSlotConflicts = this.analyzeTimeSlotConflicts(analytics.conflictTrends);
      highRiskTimeSlots.push(...timeSlotConflicts);

      // Generate scheduling guidelines
      schedulingGuidelines.push('Schedule critical events 2+ weeks in advance');
      schedulingGuidelines.push('Avoid back-to-back events in same venue');
      schedulingGuidelines.push('Consider travel time between venues');
      
      if (analytics.resolutionRate < 0.8) {
        schedulingGuidelines.push('Increase advance scheduling notice requirements');
      }

      return {
        recommendations,
        highRiskTimeSlots,
        resourceOptimizations: analytics.mostProblematicResources,
        schedulingGuidelines
      };
    } catch (error) {
      console.error('Error generating prevention recommendations:', error);
      throw error;
    }
  }

  // ===================================================================
  // RULE MANAGEMENT
  // ===================================================================

  /**
   * Add custom conflict detection rule
   */
  async addDetectionRule(
    rule: Omit<ConflictDetectionRule, 'id'>,
    user: User
  ): Promise<ConflictDetectionRule> {
    try {
      const newRule: ConflictDetectionRule = {
        id: `rule_${Date.now()}`,
        ...rule
      };

      this.detectionRules.push(newRule);

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        newRule.id,
        undefined,
        `Conflict detection rule added: ${newRule.name}`
      );

      return newRule;
    } catch (error) {
      console.error('Error adding detection rule:', error);
      throw error;
    }
  }

  /**
   * Update conflict detection rule
   */
  async updateDetectionRule(
    ruleId: string,
    updates: Partial<ConflictDetectionRule>,
    user: User
  ): Promise<ConflictDetectionRule> {
    try {
      const ruleIndex = this.detectionRules.findIndex(r => r.id === ruleId);
      if (ruleIndex === -1) {
        throw new Error('Rule not found');
      }

      this.detectionRules[ruleIndex] = {
        ...this.detectionRules[ruleIndex],
        ...updates
      };

      const updatedRule = this.detectionRules[ruleIndex];

      await logComplianceAction(
        user.id,
        'data_modification',
        'administrative_data',
        ruleId,
        undefined,
        `Conflict detection rule updated: ${updatedRule.name}`
      );

      return updatedRule;
    } catch (error) {
      console.error('Error updating detection rule:', error);
      throw error;
    }
  }

  /**
   * Get all detection rules
   */
  getDetectionRules(): ConflictDetectionRule[] {
    return [...this.detectionRules];
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  private initializeDefaultRules(): void {
    this.detectionRules = [
      {
        id: 'venue_double_booking',
        name: 'Venue Double Booking',
        description: 'Detect when same venue is booked for overlapping times',
        category: 'venue',
        severity: 'major',
        enabled: true,
        conditions: [
          {
            type: 'time_overlap',
            parameters: { bufferMinutes: 15 }
          }
        ],
        actions: [
          {
            type: 'notify',
            parameters: { immediate: true }
          },
          {
            type: 'suggest_alternative',
            parameters: { includeNearbyVenues: true }
          }
        ]
      },
      {
        id: 'coach_conflict',
        name: 'Coach Scheduling Conflict',
        description: 'Detect when coach is scheduled for multiple events',
        category: 'personnel',
        severity: 'major',
        enabled: true,
        conditions: [
          {
            type: 'time_overlap',
            parameters: { bufferMinutes: 30 }
          }
        ],
        actions: [
          {
            type: 'notify',
            parameters: { immediate: true }
          },
          {
            type: 'suggest_alternative',
            parameters: { includeAssistantCoaches: true }
          }
        ]
      },
      {
        id: 'equipment_conflict',
        name: 'Equipment Double Booking',
        description: 'Detect when same equipment is needed by multiple events',
        category: 'equipment',
        severity: 'minor',
        enabled: true,
        conditions: [
          {
            type: 'resource_conflict',
            parameters: { resourceType: 'equipment' }
          }
        ],
        actions: [
          {
            type: 'notify',
            parameters: { immediate: false }
          },
          {
            type: 'suggest_alternative',
            parameters: { includeAlternativeEquipment: true }
          }
        ]
      },
      {
        id: 'capacity_exceeded',
        name: 'Venue Capacity Exceeded',
        description: 'Detect when expected attendance exceeds venue capacity',
        category: 'venue',
        severity: 'critical',
        enabled: true,
        conditions: [
          {
            type: 'capacity_exceeded',
            parameters: { safetyMarginPercent: 10 }
          }
        ],
        actions: [
          {
            type: 'notify',
            parameters: { immediate: true }
          },
          {
            type: 'block_creation',
            parameters: { requireApproval: true }
          }
        ]
      },
      {
        id: 'transportation_conflict',
        name: 'Transportation Scheduling Conflict',
        description: 'Detect when transportation resources are overcommitted',
        category: 'transportation',
        severity: 'major',
        enabled: true,
        conditions: [
          {
            type: 'distance_constraint',
            parameters: { maxTravelTime: 60 }
          }
        ],
        actions: [
          {
            type: 'notify',
            parameters: { immediate: true }
          },
          {
            type: 'suggest_alternative',
            parameters: { optimizeRoutes: true }
          }
        ]
      }
    ];
  }

  private async getPotentialConflicts(
    startTime: string,
    endTime: string,
    user: User,
    excludeEventId?: string
  ): Promise<ConflictingEvent[]> {
    const storage = await this.storage;
    const events: ConflictingEvent[] = [];

    // Get calendar events
    const calendarEvents = await storage.getCalendarEventsByDateRange(
      startTime.split('T')[0],
      endTime.split('T')[0],
      user
    );

    // Get games
    const games = await storage.getGamesByDateRange(
      startTime.split('T')[0],
      endTime.split('T')[0],
      user
    );

    // Get practices
    const practices = await storage.getPracticesByDateRange(
      startTime.split('T')[0],
      endTime.split('T')[0],
      user
    );

    // Get facility reservations
    const reservations = await storage.getFacilityReservationsByDateRange(
      startTime.split('T')[0],
      endTime.split('T')[0],
      user
    );

    // Convert to common format
    events.push(...calendarEvents.map((e: any) => this.convertToConflictingEvent(e, 'calendar_event')));
    events.push(...games.map((e: any) => this.convertToConflictingEvent(e, 'game')));
    events.push(...practices.map((e: any) => this.convertToConflictingEvent(e, 'practice')));
    events.push(...reservations.map((e: any) => this.convertToConflictingEvent(e, 'facility_reservation')));

    // Filter out excluded event
    return events.filter(e => e.id !== excludeEventId);
  }

  private convertToConflictingEvent(event: any, type: ConflictingEvent['type']): ConflictingEvent {
    switch (type) {
      case 'calendar_event':
        return {
          id: event.id,
          type,
          title: event.eventTitle,
          startTime: `${event.eventDate}T${event.startTime || '00:00'}`,
          endTime: `${event.eventDate}T${event.endTime || '23:59'}`,
          location: event.location,
          participants: [],
          requiredResources: []
        };
      case 'game':
        return {
          id: event.id,
          type,
          title: `Game: ${event.homeSchoolSportsProgramId} vs ${event.awaySchoolSportsProgramId || event.opponentName}`,
          startTime: `${event.gameDate}T${event.gameTime || '00:00'}`,
          endTime: `${event.gameDate}T${event.gameTime || '23:59'}`, // TODO: Add game duration
          location: event.venueName,
          participants: [event.homeSchoolSportsProgramId, event.awaySchoolSportsProgramId].filter(Boolean),
          requiredResources: []
        };
      case 'practice':
        return {
          id: event.id,
          type,
          title: `Practice: ${event.schoolSportsProgramId}`,
          startTime: `${event.practiceDate}T${event.startTime}`,
          endTime: `${event.practiceDate}T${event.endTime}`,
          location: event.venueId,
          participants: [event.schoolSportsProgramId],
          requiredResources: []
        };
      case 'facility_reservation':
        return {
          id: event.id,
          type,
          title: `Reservation: ${event.usageType}`,
          startTime: `${event.reservationDate}T${event.startTime}`,
          endTime: `${event.reservationDate}T${event.endTime}`,
          location: event.venueId,
          participants: [event.schoolId],
          requiredResources: []
        };
      default:
        throw new Error(`Unsupported event type: ${type}`);
    }
  }

  private async applyDetectionRule(
    rule: ConflictDetectionRule,
    eventData: any,
    potentialConflicts: ConflictingEvent[],
    user: User
  ): Promise<DetectedConflict[]> {
    const conflicts: DetectedConflict[] = [];

    for (const potentialConflict of potentialConflicts) {
      const conflict = await this.checkRuleConditions(
        rule,
        eventData,
        potentialConflict,
        user
      );

      if (conflict) {
        conflicts.push(conflict);
      }
    }

    return conflicts;
  }

  private async checkRuleConditions(
    rule: ConflictDetectionRule,
    event1: any,
    event2: ConflictingEvent,
    user: User
  ): Promise<DetectedConflict | null> {
    // Check if rule conditions are met
    for (const condition of rule.conditions) {
      const conditionMet = await this.evaluateCondition(condition, event1, event2, user);
      if (!conditionMet) {
        return null;
      }
    }

    // Create conflict object
    const conflict: DetectedConflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conflictType: this.mapRuleCategoryToConflictType(rule.category),
      severity: rule.severity,
      events: [
        {
          id: event1.id || 'new_event',
          type: event1.type,
          title: event1.title || 'New Event',
          startTime: event1.startTime,
          endTime: event1.endTime,
          location: event1.location,
          participants: event1.participants || [],
          requiredResources: event1.requiredResources || []
        },
        event2
      ],
      conflictDetails: {
        description: `${rule.name}: ${rule.description}`,
        timeOverlap: this.calculateTimeOverlap(event1.startTime, event1.endTime, event2.startTime, event2.endTime),
        resources: [],
        impactedPersonnel: []
      },
      resolutionSuggestions: [],
      status: 'detected',
      priority: this.calculateConflictPriority(rule.severity, rule.category),
      detectedAt: new Date().toISOString()
    };

    return conflict;
  }

  private async evaluateCondition(
    condition: ConflictCondition,
    event1: any,
    event2: ConflictingEvent,
    user: User
  ): Promise<boolean> {
    switch (condition.type) {
      case 'time_overlap':
        return this.hasTimeOverlap(
          event1.startTime,
          event1.endTime,
          event2.startTime,
          event2.endTime,
          condition.parameters.bufferMinutes || 0
        );
      case 'resource_conflict':
        return this.hasResourceConflict(event1, event2, condition.parameters);
      case 'capacity_exceeded':
        return await this.isCapacityExceeded(event1, condition.parameters, user);
      case 'personnel_unavailable':
        return await this.isPersonnelUnavailable(event1, event2, condition.parameters, user);
      case 'distance_constraint':
        return await this.violatesDistanceConstraint(event1, event2, condition.parameters, user);
      default:
        return false;
    }
  }

  private hasTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
    bufferMinutes = 0
  ): boolean {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    // Add buffer time
    if (bufferMinutes > 0) {
      s1.setMinutes(s1.getMinutes() - bufferMinutes);
      e1.setMinutes(e1.getMinutes() + bufferMinutes);
    }

    return s1 < e2 && e1 > s2;
  }

  private hasResourceConflict(event1: any, event2: ConflictingEvent, parameters: any): boolean {
    // Check if events require same resource
    if (event1.location && event2.location && event1.location === event2.location) {
      return true;
    }

    // Check other resource conflicts based on parameters
    return false;
  }

  private async isCapacityExceeded(event: any, parameters: any, user: User): Promise<boolean> {
    // Implementation would check venue capacity against expected attendance
    return false;
  }

  private async isPersonnelUnavailable(event1: any, event2: ConflictingEvent, parameters: any, user: User): Promise<boolean> {
    // Implementation would check if required personnel overlap
    return false;
  }

  private async violatesDistanceConstraint(event1: any, event2: ConflictingEvent, parameters: any, user: User): Promise<boolean> {
    // Implementation would check travel time between venues
    return false;
  }

  private calculateTimeOverlap(start1: string, end1: string, start2: string, end2: string): {
    start: string;
    end: string;
    duration: number;
  } | undefined {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    const overlapStart = new Date(Math.max(s1.getTime(), s2.getTime()));
    const overlapEnd = new Date(Math.min(e1.getTime(), e2.getTime()));

    if (overlapStart >= overlapEnd) {
      return undefined;
    }

    return {
      start: overlapStart.toISOString(),
      end: overlapEnd.toISOString(),
      duration: overlapEnd.getTime() - overlapStart.getTime()
    };
  }

  private mapRuleCategoryToConflictType(category: string): DetectedConflict['conflictType'] {
    const mapping: Record<string, DetectedConflict['conflictType']> = {
      venue: 'venue_double_booked',
      personnel: 'coach_conflict',
      equipment: 'equipment_conflict',
      transportation: 'transportation_conflict',
      regulatory: 'official_conflict'
    };
    return mapping[category] || 'venue_double_booked';
  }

  private calculateConflictPriority(severity: string, category: string): number {
    const severityWeight = { minor: 1, major: 2, critical: 3 };
    const categoryWeight = { venue: 3, personnel: 2, equipment: 1, transportation: 2, regulatory: 3 };
    return (severityWeight[severity as keyof typeof severityWeight] || 1) * 
           (categoryWeight[category as keyof typeof categoryWeight] || 1);
  }

  private deduplicateConflicts(conflicts: DetectedConflict[]): DetectedConflict[] {
    const seen = new Set<string>();
    return conflicts.filter(conflict => {
      const key = `${conflict.conflictType}_${conflict.events.map(e => e.id).sort().join('_')}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private prioritizeConflicts(conflicts: DetectedConflict[]): DetectedConflict[] {
    return conflicts.sort((a, b) => b.priority - a.priority);
  }

  private async generateResolutionSuggestions(
    conflict: DetectedConflict,
    user: User
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    // Generate suggestions based on conflict type
    switch (conflict.conflictType) {
      case 'venue_double_booked':
        suggestions.push(...await this.generateVenueConflictSuggestions(conflict, user));
        break;
      case 'coach_conflict':
        suggestions.push(...await this.generatePersonnelConflictSuggestions(conflict, user));
        break;
      case 'equipment_conflict':
        suggestions.push(...await this.generateEquipmentConflictSuggestions(conflict, user));
        break;
      default:
        suggestions.push({
          id: 'manual_review',
          type: 'reschedule',
          description: 'Manual review and rescheduling required',
          confidence: 50,
          impact: 'medium',
          estimatedEffort: '15-30 minutes',
          details: {
            suggestedChanges: [],
            pros: ['Allows for custom solution'],
            cons: ['Requires manual intervention']
          }
        });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private async generateVenueConflictSuggestions(
    conflict: DetectedConflict,
    user: User
  ): Promise<ResolutionSuggestion[]> {
    const suggestions: ResolutionSuggestion[] = [];

    // Suggest alternative venues
    const alternativeVenues = await this.findAlternativeVenues(conflict, user);
    if (alternativeVenues.length > 0) {
      suggestions.push({
        id: 'relocate_venue',
        type: 'relocate',
        description: `Relocate to ${alternativeVenues[0].venueName}`,
        confidence: 85,
        impact: 'low',
        estimatedEffort: '5-10 minutes',
        details: {
          suggestedChanges: [{
            eventId: conflict.events[0].id,
            changeType: 'location',
            currentValue: conflict.events[0].location,
            suggestedValue: alternativeVenues[0].venueName,
            reason: 'Alternative venue available'
          }],
          pros: ['Maintains original time', 'Available venue'],
          cons: ['Different location'],
          alternativeVenues
        }
      });
    }

    // Suggest time adjustments
    const alternativeTimeSlots = await this.findAlternativeTimeSlots(conflict, user);
    if (alternativeTimeSlots.length > 0) {
      suggestions.push({
        id: 'reschedule_time',
        type: 'reschedule',
        description: `Reschedule to ${alternativeTimeSlots[0].start}`,
        confidence: 75,
        impact: 'medium',
        estimatedEffort: '10-15 minutes',
        details: {
          suggestedChanges: [{
            eventId: conflict.events[0].id,
            changeType: 'time',
            currentValue: conflict.events[0].startTime,
            suggestedValue: alternativeTimeSlots[0].start,
            reason: 'Alternative time slot available'
          }],
          pros: ['Same venue', 'No conflicts'],
          cons: ['Different time'],
          alternativeTimeSlots
        }
      });
    }

    return suggestions;
  }

  private async generatePersonnelConflictSuggestions(
    conflict: DetectedConflict,
    user: User
  ): Promise<ResolutionSuggestion[]> {
    // Implementation for personnel conflict suggestions
    return [];
  }

  private async generateEquipmentConflictSuggestions(
    conflict: DetectedConflict,
    user: User
  ): Promise<ResolutionSuggestion[]> {
    // Implementation for equipment conflict suggestions
    return [];
  }

  private async findAlternativeVenues(conflict: DetectedConflict, user: User): Promise<VenueOption[]> {
    // Implementation to find alternative venues
    return [];
  }

  private async findAlternativeTimeSlots(conflict: DetectedConflict, user: User): Promise<TimeSlot[]> {
    // Implementation to find alternative time slots
    return [];
  }

  private async getAllEventsInRange(startDate: string, endDate: string, user: User): Promise<ConflictingEvent[]> {
    // Implementation to get all events in range
    return [];
  }

  private async detectConflictsBetweenEvents(
    event1: ConflictingEvent,
    event2: ConflictingEvent,
    user: User
  ): Promise<DetectedConflict[]> {
    // Implementation to detect conflicts between two events
    return [];
  }

  private async getEventData(eventId: string, eventType: string, user: User): Promise<any> {
    // Implementation to get event data
    return null;
  }

  private async enrichConflictData(conflict: ScheduleConflict, user: User): Promise<DetectedConflict> {
    // Implementation to enrich conflict data
    return {} as DetectedConflict;
  }

  private async applyResolution(resolution: ResolutionSuggestion, user: User): Promise<void> {
    // Implementation to apply resolution
    console.log('Applying resolution:', resolution.type);
  }

  private async triggerCriticalConflictAlerts(conflicts: DetectedConflict[], user: User): Promise<void> {
    // Implementation to trigger critical conflict alerts
    console.log('Triggering critical conflict alerts for', conflicts.length, 'conflicts');
  }

  private async notifyConflictResolution(
    conflictId: string,
    resolution: ResolutionSuggestion,
    user: User
  ): Promise<void> {
    // Implementation to notify conflict resolution
    console.log('Notifying conflict resolution:', conflictId);
  }

  private getSeverityLevel(severity: string): number {
    const levels = { minor: 1, major: 2, critical: 3 };
    return levels[severity as keyof typeof levels] || 1;
  }

  private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
    return array.reduce((acc, item) => {
      const value = String(item[key]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateResolutionRate(conflicts: ScheduleConflict[]): number {
    const resolved = conflicts.filter(c => c.conflictStatus === 'resolved').length;
    return conflicts.length > 0 ? resolved / conflicts.length : 0;
  }

  private calculateAverageResolutionTime(conflicts: ScheduleConflict[]): number {
    const resolvedConflicts = conflicts.filter(c => c.resolvedAt && c.detectedAt);
    if (resolvedConflicts.length === 0) return 0;

    const totalTime = resolvedConflicts.reduce((acc, conflict) => {
      const detected = new Date(conflict.detectedAt || new Date()).getTime();
      const resolved = new Date(conflict.resolvedAt!).getTime();
      return acc + (resolved - detected);
    }, 0);

    return totalTime / resolvedConflicts.length / (1000 * 60 * 60); // Convert to hours
  }

  private async getProblematicResources(conflicts: ScheduleConflict[], user: User): Promise<ResourceAnalytics[]> {
    // Implementation to analyze problematic resources
    return [];
  }

  private calculateConflictTrends(conflicts: ScheduleConflict[], startDate: string, endDate: string): {
    date: string;
    count: number;
  }[] {
    // Implementation to calculate conflict trends
    return [];
  }

  private analyzeTimeSlotConflicts(trends: { date: string; count: number }[]): TimeSlot[] {
    // Implementation to analyze time slot conflicts
    return [];
  }
}

/**
 * Export singleton instance
 */
export const conflictDetectionService = new ConflictDetectionService();