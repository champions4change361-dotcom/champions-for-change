import { getStorage } from "./storage";
import { RBACDataFilters } from "./rbac-data-filters";
import { logComplianceAction } from "./complianceMiddleware";
import type { 
  User, 
  FacilityReservation, 
  InsertFacilityReservation,
  AthleticCalendarEvent,
  Game,
  Practice
} from "@shared/schema";

export interface FacilityInfo {
  id: string;
  name: string;
  type: 'gym' | 'field' | 'track' | 'pool' | 'auditorium' | 'classroom' | 'multipurpose' | 'outdoor' | 'other';
  capacity: {
    maximum: number;
    recommended: number;
    standingRoom?: number;
  };
  location: {
    address: string;
    building?: string;
    room?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  amenities: string[];
  equipment: EquipmentInfo[];
  availability: {
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    timeSlots: TimeSlot[];
    blackoutDates: string[];
    seasonalRestrictions?: SeasonalRestriction[];
  };
  maintenance: {
    lastMaintenance?: string;
    nextScheduledMaintenance?: string;
    maintenanceType?: string;
    isUnderMaintenance: boolean;
    maintenanceNotes?: string;
  };
  costs: {
    hourlyRate?: number;
    setupFee?: number;
    cleaningFee?: number;
    securityFee?: number;
    equipmentFees?: Record<string, number>;
  };
  requirements: {
    advanceBookingDays: number;
    minimumBookingHours: number;
    maximumBookingHours: number;
    approvalRequired: boolean;
    insuranceRequired: boolean;
    supervisionRequired: boolean;
  };
  restrictions: {
    allowedEventTypes: string[];
    prohibitedActivities: string[];
    noiseRestrictions: boolean;
    foodAndDrinkPolicy: 'allowed' | 'restricted' | 'prohibited';
    decorationPolicy: 'allowed' | 'restricted' | 'prohibited';
  };
  accessibility: {
    wheelchairAccessible: boolean;
    elevatorAccess: boolean;
    parkingAvailable: boolean;
    publicTransportAccess: boolean;
  };
  contact: {
    managerId?: string;
    managerName?: string;
    managerPhone?: string;
    managerEmail?: string;
    emergencyContact?: {
      name: string;
      phone: string;
    };
  };
}

export interface EquipmentInfo {
  id: string;
  name: string;
  category: 'audio_visual' | 'sports' | 'safety' | 'furniture' | 'technology' | 'other';
  quantity: number;
  available: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'out_of_service';
  lastMaintenance?: string;
  reservationRequired: boolean;
  additionalCost?: number;
  setupTime?: number; // minutes
  certificationRequired?: boolean;
}

export interface TimeSlot {
  start: string; // "08:00"
  end: string;   // "17:00"
  available: boolean;
  rate?: number;
  minimumBooking?: number; // hours
}

export interface SeasonalRestriction {
  startDate: string;
  endDate: string;
  restriction: string;
  alternativeOptions?: string[];
}

export interface BookingRequest {
  facilityId: string;
  requestedBy: string;
  organizationId: string;
  eventType: 'practice' | 'game' | 'meeting' | 'event' | 'tournament' | 'maintenance' | 'other';
  eventTitle: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  expectedAttendance: number;
  setupRequirements: {
    equipment: string[];
    specialArrangements: string;
    custodialNeeds: string[];
    setupTime?: number; // minutes before event
    teardownTime?: number; // minutes after event
  };
  additionalServices: {
    catering?: boolean;
    security?: boolean;
    audioVisual?: boolean;
    custodial?: boolean;
  };
  specialRequests?: string;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate: string;
    daysOfWeek?: number[];
  };
  approvalWorkflow?: {
    autoApprove: boolean;
    approvers: string[];
    escalationLevel: number;
  };
}

export interface BookingResponse {
  bookingId: string;
  status: 'pending' | 'approved' | 'denied' | 'confirmed' | 'completed' | 'cancelled';
  approvalRequired: boolean;
  conflicts: ConflictInfo[];
  alternatives: AlternativeOption[];
  costs: BookingCosts;
  approvalWorkflow?: {
    currentStep: number;
    totalSteps: number;
    pendingApprovers: string[];
    approvalDeadline?: string;
  };
  notifications: {
    confirmationSent: boolean;
    reminderScheduled: boolean;
    notificationMethods: string[];
  };
}

export interface ConflictInfo {
  type: 'time_overlap' | 'capacity_exceeded' | 'equipment_unavailable' | 'maintenance_scheduled';
  description: string;
  conflictingBookingId?: string;
  severity: 'minor' | 'major' | 'critical';
  resolutionOptions: string[];
}

export interface AlternativeOption {
  facilityId: string;
  facilityName: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  distance?: number; // meters from requested facility
  suitabilityScore: number; // 0-100
  additionalCosts: number;
  reasoning: string;
}

export interface BookingCosts {
  facilityFee: number;
  equipmentFees: Record<string, number>;
  serviceFees: Record<string, number>;
  setupFee: number;
  cleaningFee: number;
  securityFee: number;
  totalCost: number;
  discountsApplied: {
    type: string;
    amount: number;
    reason: string;
  }[];
}

export interface FacilityUtilization {
  facilityId: string;
  facilityName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalHours: number;
  bookedHours: number;
  utilizationRate: number;
  peakUsageTimes: TimeSlot[];
  lowUsageTimes: TimeSlot[];
  revenueGenerated: number;
  maintenanceHours: number;
  cancelledBookings: number;
  averageBookingDuration: number;
  mostCommonEventTypes: {
    eventType: string;
    count: number;
    percentage: number;
  }[];
}

export interface MaintenanceSchedule {
  id: string;
  facilityId: string;
  maintenanceType: 'routine' | 'preventive' | 'repair' | 'deep_clean' | 'inspection' | 'upgrade';
  priority: 'low' | 'normal' | 'high' | 'emergency';
  scheduledStartDate: string;
  scheduledEndDate: string;
  estimatedDuration: number; // hours
  description: string;
  contractor?: {
    name: string;
    contact: string;
    specialization: string;
  };
  impactedServices: string[];
  alternativeFacilities: string[];
  cost?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  actualStartDate?: string;
  actualEndDate?: string;
  completionNotes?: string;
  affectedBookings: string[];
  notificationsSent: {
    advanceWarning: boolean;
    immediateNotification: boolean;
    completionNotification: boolean;
  };
}

/**
 * Facility Coordination Service
 * Comprehensive facility and venue management with booking system
 */
export class FacilityCoordinationService {
  private storage = getStorage();

  constructor() {
    console.log('🏢 Facility Coordination Service initialized');
  }

  // ===================================================================
  // FACILITY MANAGEMENT METHODS
  // ===================================================================

  /**
   * Get detailed facility information
   */
  async getFacilityInfo(facilityId: string, user: User): Promise<FacilityInfo | null> {
    try {
      const storage = await this.storage;
      
      // Apply RBAC filtering
      const dataFilters = new RBACDataFilters(user);
      
      const facility = await storage.getAthleticVenue(facilityId, user);
      if (!facility) {
        return null;
      }

      // Get current reservations to determine availability
      const currentReservations = await storage.getFacilityReservationsByFacility(
        facilityId,
        new Date().toISOString().split('T')[0],
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        user
      );

      // Get maintenance schedule
      const maintenanceSchedule = await this.getMaintenanceSchedule(facilityId, user);

      const facilityInfo: FacilityInfo = {
        id: facility.id,
        name: facility.venueName,
        type: this.mapVenueTypeToFacilityType(facility.venueType),
        capacity: {
          maximum: facility.capacity || 0,
          recommended: Math.floor((facility.capacity || 0) * 0.9),
          standingRoom: facility.standingCapacity
        },
        location: {
          address: facility.address || '',
          building: facility.building,
          room: facility.room,
          coordinates: facility.coordinates ? {
            latitude: facility.coordinates.latitude,
            longitude: facility.coordinates.longitude
          } : undefined
        },
        amenities: facility.amenities || [],
        equipment: await this.getFacilityEquipment(facilityId, user),
        availability: {
          daysOfWeek: facility.operatingDays || [1, 2, 3, 4, 5], // Default weekdays
          timeSlots: this.parseOperatingHours(facility.operatingHours),
          blackoutDates: this.getBlackoutDates(currentReservations, maintenanceSchedule),
          seasonalRestrictions: facility.seasonalRestrictions
        },
        maintenance: {
          lastMaintenance: facility.lastMaintenance,
          nextScheduledMaintenance: this.getNextMaintenanceDate(maintenanceSchedule),
          isUnderMaintenance: this.isFacilityUnderMaintenance(maintenanceSchedule),
          maintenanceNotes: facility.maintenanceNotes
        },
        costs: {
          hourlyRate: facility.hourlyRate,
          setupFee: facility.setupFee,
          cleaningFee: facility.cleaningFee,
          securityFee: facility.securityFee,
          equipmentFees: facility.equipmentFees || {}
        },
        requirements: {
          advanceBookingDays: facility.advanceBookingDays || 1,
          minimumBookingHours: facility.minimumBookingHours || 1,
          maximumBookingHours: facility.maximumBookingHours || 8,
          approvalRequired: facility.approvalRequired || false,
          insuranceRequired: facility.insuranceRequired || false,
          supervisionRequired: facility.supervisionRequired || false
        },
        restrictions: {
          allowedEventTypes: facility.allowedEventTypes || ['practice', 'game', 'meeting'],
          prohibitedActivities: facility.prohibitedActivities || [],
          noiseRestrictions: facility.noiseRestrictions || false,
          foodAndDrinkPolicy: facility.foodAndDrinkPolicy || 'allowed',
          decorationPolicy: facility.decorationPolicy || 'restricted'
        },
        accessibility: {
          wheelchairAccessible: facility.wheelchairAccessible || false,
          elevatorAccess: facility.elevatorAccess || false,
          parkingAvailable: facility.parkingAvailable || false,
          publicTransportAccess: facility.publicTransportAccess || false
        },
        contact: {
          managerId: facility.managerId,
          managerName: facility.managerName,
          managerPhone: facility.managerPhone,
          managerEmail: facility.managerEmail,
          emergencyContact: facility.emergencyContact
        }
      };

      await logComplianceAction(
        user.id,
        'data_access',
        'facility_data',
        facilityId,
        { ip: 'system' } as any,
        `Facility information accessed: ${facility.venueName}`
      );

      return facilityInfo;
    } catch (error) {
      console.error('Error getting facility info:', error);
      throw new Error('Failed to retrieve facility information');
    }
  }

  /**
   * Get all available facilities with filtering
   */
  async getFacilities(
    user: User,
    filters?: {
      type?: string[];
      capacity?: { min?: number; max?: number };
      amenities?: string[];
      availability?: { date: string; startTime: string; endTime: string };
      location?: { latitude: number; longitude: number; radius: number };
      priceRange?: { min?: number; max?: number };
    }
  ): Promise<FacilityInfo[]> {
    try {
      const storage = await this.storage;
      
      // Apply RBAC filtering for organization access
      const dataFilters = new RBACDataFilters(user);
      
      const facilities = await storage.getAthleticVenues(user, filters);
      
      const facilitiesInfo = await Promise.all(
        facilities.map(facility => this.getFacilityInfo(facility.id, user))
      );

      // Filter out null results and apply additional filters
      let filteredFacilities = facilitiesInfo.filter(f => f !== null) as FacilityInfo[];

      if (filters?.type?.length) {
        filteredFacilities = filteredFacilities.filter(f => 
          filters.type!.includes(f.type)
        );
      }

      if (filters?.capacity) {
        filteredFacilities = filteredFacilities.filter(f => {
          const capacity = f.capacity.maximum;
          return (!filters.capacity!.min || capacity >= filters.capacity!.min) &&
                 (!filters.capacity!.max || capacity <= filters.capacity!.max);
        });
      }

      if (filters?.amenities?.length) {
        filteredFacilities = filteredFacilities.filter(f =>
          filters.amenities!.every(amenity => f.amenities.includes(amenity))
        );
      }

      if (filters?.availability) {
        filteredFacilities = await this.filterByAvailability(
          filteredFacilities,
          filters.availability,
          user
        );
      }

      return filteredFacilities;
    } catch (error) {
      console.error('Error getting facilities:', error);
      throw new Error('Failed to retrieve facilities');
    }
  }

  // ===================================================================
  // BOOKING AND RESERVATION METHODS
  // ===================================================================

  /**
   * Create facility booking request
   */
  async createBookingRequest(
    bookingRequest: BookingRequest,
    user: User
  ): Promise<BookingResponse> {
    try {
      const storage = await this.storage;

      // Validate booking request
      await this.validateBookingRequest(bookingRequest, user);

      // Check for conflicts
      const conflicts = await this.checkBookingConflicts(bookingRequest, user);

      // Calculate costs
      const costs = await this.calculateBookingCosts(bookingRequest, user);

      // Find alternatives if conflicts exist
      const alternatives = conflicts.length > 0 ? 
        await this.findAlternativeOptions(bookingRequest, user) : [];

      // Determine if approval is required
      const facility = await this.getFacilityInfo(bookingRequest.facilityId, user);
      const approvalRequired = facility?.requirements.approvalRequired || 
                              bookingRequest.priority === 'high' ||
                              conflicts.some(c => c.severity === 'major' || c.severity === 'critical');

      // Create reservation record
      const reservationData: InsertFacilityReservation = {
        venueId: bookingRequest.facilityId,
        schoolId: bookingRequest.organizationId,
        requestedBy: user.id,
        reservationDate: bookingRequest.startDateTime.split('T')[0],
        startTime: this.extractTime(bookingRequest.startDateTime),
        endTime: this.extractTime(bookingRequest.endDateTime),
        duration: this.calculateDuration(bookingRequest.startDateTime, bookingRequest.endDateTime),
        usageType: bookingRequest.eventType,
        reservationStatus: approvalRequired ? 'pending' : 'approved',
        setupRequired: {
          equipment: bookingRequest.setupRequirements.equipment,
          specialArrangements: bookingRequest.setupRequirements.specialArrangements,
          custodialNeeds: bookingRequest.setupRequirements.custodialNeeds
        },
        estimatedAttendance: bookingRequest.expectedAttendance,
        facilityCost: costs.totalCost,
        specialRequests: bookingRequest.specialRequests
      };

      const reservation = await storage.createFacilityReservation(reservationData, user);

      // Create booking response
      const bookingResponse: BookingResponse = {
        bookingId: reservation.id,
        status: reservation.reservationStatus as any,
        approvalRequired,
        conflicts: conflicts.map(c => ({
          type: c.type,
          description: c.description,
          conflictingBookingId: c.conflictingBookingId,
          severity: c.severity,
          resolutionOptions: c.resolutionOptions
        })),
        alternatives,
        costs,
        notifications: {
          confirmationSent: false,
          reminderScheduled: false,
          notificationMethods: ['email', 'in_app']
        }
      };

      // Handle recurring bookings
      if (bookingRequest.recurringPattern) {
        await this.createRecurringBookings(bookingRequest, reservation.id, user);
      }

      // Start approval workflow if required
      if (approvalRequired) {
        await this.startApprovalWorkflow(reservation.id, bookingRequest, user);
      }

      // Send notifications
      await this.sendBookingNotifications(reservation.id, 'created', user);

      await logComplianceAction(
        user.id,
        'data_modification',
        'facility_booking',
        reservation.id,
        { ip: 'system' } as any,
        `Facility booking created: ${bookingRequest.eventTitle} at ${facility?.name}`
      );

      return bookingResponse;
    } catch (error) {
      console.error('Error creating booking request:', error);
      throw error;
    }
  }

  /**
   * Update existing booking
   */
  async updateBooking(
    bookingId: string,
    updates: Partial<BookingRequest>,
    user: User
  ): Promise<BookingResponse> {
    try {
      const storage = await this.storage;

      // Get existing booking
      const existingBooking = await storage.getFacilityReservation(bookingId, user);
      if (!existingBooking) {
        throw new Error('Booking not found');
      }

      // Check permissions
      if (existingBooking.requestedBy !== user.id && !this.canManageBooking(existingBooking, user)) {
        throw new Error('Insufficient permissions to update booking');
      }

      // Validate updates
      if (updates.startDateTime || updates.endDateTime) {
        const testRequest: BookingRequest = {
          ...this.convertReservationToRequest(existingBooking),
          ...updates
        };
        await this.validateBookingRequest(testRequest, user);
      }

      // Check for new conflicts if time or facility changed
      let conflicts: ConflictInfo[] = [];
      if (updates.facilityId || updates.startDateTime || updates.endDateTime) {
        const testRequest: BookingRequest = {
          ...this.convertReservationToRequest(existingBooking),
          ...updates
        };
        conflicts = await this.checkBookingConflicts(testRequest, user, bookingId);
      }

      // Prepare update data
      const updateData: Partial<InsertFacilityReservation> = {};
      
      if (updates.facilityId) updateData.venueId = updates.facilityId;
      if (updates.startDateTime) {
        updateData.reservationDate = updates.startDateTime.split('T')[0];
        updateData.startTime = this.extractTime(updates.startDateTime);
      }
      if (updates.endDateTime) updateData.endTime = this.extractTime(updates.endDateTime);
      if (updates.expectedAttendance) updateData.estimatedAttendance = updates.expectedAttendance;
      if (updates.eventType) updateData.usageType = updates.eventType;
      if (updates.specialRequests) updateData.specialRequests = updates.specialRequests;

      // Update reservation
      const updatedReservation = await storage.updateFacilityReservation(bookingId, updateData, user);

      // Recalculate costs if significant changes
      const costs = await this.calculateBookingCosts({
        ...this.convertReservationToRequest(existingBooking),
        ...updates
      }, user);

      // Send change notifications if significant
      if (this.isSignificantBookingChange(updates)) {
        await this.sendBookingNotifications(bookingId, 'updated', user);
      }

      return {
        bookingId,
        status: updatedReservation.reservationStatus as any,
        approvalRequired: updatedReservation.reservationStatus === 'pending',
        conflicts,
        alternatives: conflicts.length > 0 ? await this.findAlternativeOptions({
          ...this.convertReservationToRequest(existingBooking),
          ...updates
        }, user) : [],
        costs,
        notifications: {
          confirmationSent: true,
          reminderScheduled: true,
          notificationMethods: ['email', 'in_app']
        }
      };
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  }

  /**
   * Cancel facility booking
   */
  async cancelBooking(
    bookingId: string,
    reason: string,
    user: User,
    refundEligible = true
  ): Promise<void> {
    try {
      const storage = await this.storage;

      const booking = await storage.getFacilityReservation(bookingId, user);
      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check permissions
      if (booking.requestedBy !== user.id && !this.canManageBooking(booking, user)) {
        throw new Error('Insufficient permissions to cancel booking');
      }

      // Update booking status
      await storage.updateFacilityReservation(bookingId, {
        reservationStatus: 'cancelled',
        reservationNotes: `Cancelled: ${reason}`
      }, user);

      // Handle refund processing if applicable
      if (refundEligible && booking.facilityCost && parseFloat(booking.facilityCost.toString()) > 0) {
        await this.processBookingRefund(bookingId, reason, user);
      }

      // Cancel related calendar events
      await this.cancelRelatedCalendarEvents(bookingId, user);

      // Send cancellation notifications
      await this.sendBookingNotifications(bookingId, 'cancelled', user);

      await logComplianceAction(
        user.id,
        'data_modification',
        'facility_booking',
        bookingId,
        { ip: 'system' } as any,
        `Facility booking cancelled: ${reason}`
      );
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string, user: User): Promise<FacilityReservation | null> {
    try {
      const storage = await this.storage;
      
      const booking = await storage.getFacilityReservation(bookingId, user);
      if (!booking) {
        return null;
      }

      // Check permissions
      if (booking.requestedBy !== user.id && !this.canViewBooking(booking, user)) {
        throw new Error('Insufficient permissions to view booking');
      }

      return booking;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  /**
   * Get bookings for facility or organization
   */
  async getBookings(
    user: User,
    filters?: {
      facilityId?: string;
      organizationId?: string;
      startDate?: string;
      endDate?: string;
      status?: string[];
      eventType?: string[];
    }
  ): Promise<FacilityReservation[]> {
    try {
      const storage = await this.storage;
      
      // Apply RBAC filtering
      const dataFilters = new RBACDataFilters(user);
      
      return await storage.getFacilityReservations(user, filters);
    } catch (error) {
      console.error('Error getting bookings:', error);
      throw new Error('Failed to retrieve bookings');
    }
  }

  // ===================================================================
  // FACILITY UTILIZATION AND ANALYTICS
  // ===================================================================

  /**
   * Get facility utilization analytics
   */
  async getFacilityUtilization(
    facilityId: string,
    startDate: string,
    endDate: string,
    user: User
  ): Promise<FacilityUtilization> {
    try {
      const storage = await this.storage;

      // Get facility info
      const facility = await this.getFacilityInfo(facilityId, user);
      if (!facility) {
        throw new Error('Facility not found');
      }

      // Get all bookings in the period
      const bookings = await storage.getFacilityReservationsByFacility(
        facilityId,
        startDate,
        endDate,
        user
      );

      // Calculate utilization metrics
      const totalHours = this.calculateTotalAvailableHours(facility, startDate, endDate);
      const bookedHours = bookings.reduce((total, booking) => {
        return total + (booking.duration || 0) / 60; // Convert minutes to hours
      }, 0);

      const utilizationRate = totalHours > 0 ? bookedHours / totalHours : 0;

      // Analyze peak and low usage times
      const timeAnalysis = this.analyzeUsagePatterns(bookings);

      // Calculate revenue
      const revenueGenerated = bookings.reduce((total, booking) => {
        return total + (booking.facilityCost ? parseFloat(booking.facilityCost.toString()) : 0);
      }, 0);

      // Count maintenance hours
      const maintenanceSchedule = await this.getMaintenanceSchedule(facilityId, user);
      const maintenanceHours = this.calculateMaintenanceHours(maintenanceSchedule, startDate, endDate);

      // Count cancelled bookings
      const cancelledBookings = bookings.filter(b => b.reservationStatus === 'cancelled').length;

      // Calculate average booking duration
      const completedBookings = bookings.filter(b => b.reservationStatus === 'completed');
      const averageBookingDuration = completedBookings.length > 0 ?
        completedBookings.reduce((total, booking) => total + (booking.duration || 0), 0) / completedBookings.length / 60 : 0;

      // Analyze event types
      const eventTypeCounts = this.countEventTypes(bookings);
      const totalEvents = bookings.length;
      const mostCommonEventTypes = Object.entries(eventTypeCounts)
        .map(([eventType, count]) => ({
          eventType,
          count: count as number,
          percentage: totalEvents > 0 ? (count as number / totalEvents) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      const utilization: FacilityUtilization = {
        facilityId,
        facilityName: facility.name,
        period: { startDate, endDate },
        totalHours,
        bookedHours,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        peakUsageTimes: timeAnalysis.peakTimes,
        lowUsageTimes: timeAnalysis.lowTimes,
        revenueGenerated,
        maintenanceHours,
        cancelledBookings,
        averageBookingDuration,
        mostCommonEventTypes
      };

      return utilization;
    } catch (error) {
      console.error('Error getting facility utilization:', error);
      throw new Error('Failed to retrieve facility utilization');
    }
  }

  /**
   * Get utilization report for multiple facilities
   */
  async getUtilizationReport(
    organizationId: string,
    startDate: string,
    endDate: string,
    user: User
  ): Promise<{
    summary: {
      totalFacilities: number;
      averageUtilization: number;
      totalRevenue: number;
      totalBookings: number;
    };
    facilities: FacilityUtilization[];
    recommendations: string[];
  }> {
    try {
      // Get all facilities for organization
      const facilities = await this.getFacilities(user, {});
      
      // Get utilization for each facility
      const facilitiesUtilization = await Promise.all(
        facilities.map(facility => 
          this.getFacilityUtilization(facility.id, startDate, endDate, user)
        )
      );

      // Calculate summary metrics
      const totalFacilities = facilities.length;
      const averageUtilization = totalFacilities > 0 ?
        facilitiesUtilization.reduce((sum, util) => sum + util.utilizationRate, 0) / totalFacilities : 0;
      const totalRevenue = facilitiesUtilization.reduce((sum, util) => sum + util.revenueGenerated, 0);
      const totalBookings = facilitiesUtilization.reduce((sum, util) => sum + util.mostCommonEventTypes.reduce((typeSum, type) => typeSum + type.count, 0), 0);

      // Generate recommendations
      const recommendations = this.generateUtilizationRecommendations(facilitiesUtilization);

      return {
        summary: {
          totalFacilities,
          averageUtilization,
          totalRevenue,
          totalBookings
        },
        facilities: facilitiesUtilization,
        recommendations
      };
    } catch (error) {
      console.error('Error getting utilization report:', error);
      throw new Error('Failed to generate utilization report');
    }
  }

  // ===================================================================
  // MAINTENANCE MANAGEMENT
  // ===================================================================

  /**
   * Schedule facility maintenance
   */
  async scheduleMaintenance(
    maintenanceData: Omit<MaintenanceSchedule, 'id' | 'status' | 'notificationsSent'>,
    user: User
  ): Promise<MaintenanceSchedule> {
    try {
      const storage = await this.storage;

      // Check permissions
      if (!this.canScheduleMaintenance(user)) {
        throw new Error('Insufficient permissions to schedule maintenance');
      }

      // Check for booking conflicts
      const affectedBookings = await this.findBookingsAffectedByMaintenance(
        maintenanceData.facilityId,
        maintenanceData.scheduledStartDate,
        maintenanceData.scheduledEndDate,
        user
      );

      const maintenanceSchedule: MaintenanceSchedule = {
        id: `maintenance_${Date.now()}`,
        ...maintenanceData,
        status: 'scheduled',
        affectedBookings: affectedBookings.map(b => b.id),
        notificationsSent: {
          advanceWarning: false,
          immediateNotification: false,
          completionNotification: false
        }
      };

      // Save maintenance schedule
      await storage.saveMaintenanceSchedule(maintenanceSchedule, user);

      // Handle affected bookings
      if (affectedBookings.length > 0) {
        await this.handleMaintenanceConflicts(maintenanceSchedule, affectedBookings, user);
      }

      // Schedule notifications
      await this.scheduleMaintenanceNotifications(maintenanceSchedule, user);

      await logComplianceAction(
        user.id,
        'data_modification',
        'facility_maintenance',
        maintenanceSchedule.id,
        { ip: 'system' } as any,
        `Maintenance scheduled for facility: ${maintenanceData.facilityId}`
      );

      return maintenanceSchedule;
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      throw error;
    }
  }

  /**
   * Get maintenance schedule for facility
   */
  async getMaintenanceSchedule(
    facilityId: string,
    user: User,
    dateRange?: { startDate: string; endDate: string }
  ): Promise<MaintenanceSchedule[]> {
    try {
      const storage = await this.storage;
      return await storage.getMaintenanceSchedule(facilityId, user, dateRange);
    } catch (error) {
      console.error('Error getting maintenance schedule:', error);
      throw new Error('Failed to retrieve maintenance schedule');
    }
  }

  /**
   * Update maintenance status
   */
  async updateMaintenanceStatus(
    maintenanceId: string,
    status: MaintenanceSchedule['status'],
    notes?: string,
    user?: User
  ): Promise<void> {
    try {
      const storage = await this.storage;

      const maintenance = await storage.getMaintenanceRecord(maintenanceId, user!);
      if (!maintenance) {
        throw new Error('Maintenance record not found');
      }

      const updateData: Partial<MaintenanceSchedule> = {
        status,
        completionNotes: notes
      };

      if (status === 'in_progress') {
        updateData.actualStartDate = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.actualEndDate = new Date().toISOString();
      }

      await storage.updateMaintenanceSchedule(maintenanceId, updateData, user!);

      // Send appropriate notifications
      if (status === 'completed') {
        await this.sendMaintenanceCompletionNotifications(maintenanceId, user!);
      }

      await logComplianceAction(
        user!.id,
        'data_modification',
        'facility_maintenance',
        maintenanceId,
        { ip: 'system' } as any,
        `Maintenance status updated to: ${status}`
      );
    } catch (error) {
      console.error('Error updating maintenance status:', error);
      throw error;
    }
  }

  // ===================================================================
  // HELPER METHODS
  // ===================================================================

  private mapVenueTypeToFacilityType(venueType: string): FacilityInfo['type'] {
    const mapping: Record<string, FacilityInfo['type']> = {
      'gymnasium': 'gym',
      'football_field': 'field',
      'soccer_field': 'field',
      'baseball_field': 'field',
      'track_field': 'track',
      'swimming_pool': 'pool',
      'auditorium': 'auditorium',
      'classroom': 'classroom',
      'multipurpose': 'multipurpose',
      'outdoor': 'outdoor'
    };
    return mapping[venueType] || 'other';
  }

  private async getFacilityEquipment(facilityId: string, user: User): Promise<EquipmentInfo[]> {
    try {
      const storage = await this.storage;
      // This would get equipment from a dedicated equipment table
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting facility equipment:', error);
      return [];
    }
  }

  private parseOperatingHours(operatingHours: any): TimeSlot[] {
    // Parse operating hours from facility data
    if (!operatingHours) {
      return [{
        start: '08:00',
        end: '22:00',
        available: true
      }];
    }

    // Implementation would parse complex operating hours structure
    return [];
  }

  private getBlackoutDates(reservations: FacilityReservation[], maintenance: MaintenanceSchedule[]): string[] {
    const blackoutDates: string[] = [];

    // Add maintenance dates
    maintenance.forEach(m => {
      if (m.status === 'scheduled' || m.status === 'in_progress') {
        const start = new Date(m.scheduledStartDate);
        const end = new Date(m.scheduledEndDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          blackoutDates.push(d.toISOString().split('T')[0]);
        }
      }
    });

    return [...new Set(blackoutDates)]; // Remove duplicates
  }

  private getNextMaintenanceDate(maintenanceSchedule: MaintenanceSchedule[]): string | undefined {
    const upcoming = maintenanceSchedule
      .filter(m => m.status === 'scheduled' && new Date(m.scheduledStartDate) > new Date())
      .sort((a, b) => new Date(a.scheduledStartDate).getTime() - new Date(b.scheduledStartDate).getTime());
    
    return upcoming[0]?.scheduledStartDate;
  }

  private isFacilityUnderMaintenance(maintenanceSchedule: MaintenanceSchedule[]): boolean {
    return maintenanceSchedule.some(m => 
      m.status === 'in_progress' ||
      (m.status === 'scheduled' && 
       new Date(m.scheduledStartDate) <= new Date() && 
       new Date(m.scheduledEndDate) >= new Date())
    );
  }

  private async filterByAvailability(
    facilities: FacilityInfo[],
    availability: { date: string; startTime: string; endTime: string },
    user: User
  ): Promise<FacilityInfo[]> {
    const availableFacilities: FacilityInfo[] = [];

    for (const facility of facilities) {
      const isAvailable = await this.checkFacilityAvailability(
        facility.id,
        availability.date,
        availability.startTime,
        availability.endTime,
        user
      );

      if (isAvailable) {
        availableFacilities.push(facility);
      }
    }

    return availableFacilities;
  }

  private async checkFacilityAvailability(
    facilityId: string,
    date: string,
    startTime: string,
    endTime: string,
    user: User
  ): Promise<boolean> {
    try {
      const storage = await this.storage;

      // Check existing reservations
      const reservations = await storage.getFacilityReservationsByFacility(
        facilityId,
        date,
        date,
        user
      );

      // Check for time conflicts
      for (const reservation of reservations) {
        if (reservation.reservationStatus === 'cancelled') continue;

        const reservationStart = reservation.startTime;
        const reservationEnd = reservation.endTime;

        if (this.timeRangesOverlap(startTime, endTime, reservationStart, reservationEnd)) {
          return false;
        }
      }

      // Check maintenance schedule
      const maintenance = await this.getMaintenanceSchedule(facilityId, user, {
        startDate: date,
        endDate: date
      });

      for (const m of maintenance) {
        if (m.status === 'scheduled' || m.status === 'in_progress') {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking facility availability:', error);
      return false;
    }
  }

  private timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    return start1 < end2 && end1 > start2;
  }

  private async validateBookingRequest(request: BookingRequest, user: User): Promise<void> {
    // Get facility info
    const facility = await this.getFacilityInfo(request.facilityId, user);
    if (!facility) {
      throw new Error('Facility not found');
    }

    // Check capacity
    if (request.expectedAttendance > facility.capacity.maximum) {
      throw new Error(`Expected attendance (${request.expectedAttendance}) exceeds facility capacity (${facility.capacity.maximum})`);
    }

    // Check event type restrictions
    if (!facility.restrictions.allowedEventTypes.includes(request.eventType)) {
      throw new Error(`Event type '${request.eventType}' is not allowed at this facility`);
    }

    // Check advance booking requirements
    const requestDate = new Date(request.startDateTime);
    const now = new Date();
    const daysInAdvance = Math.ceil((requestDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysInAdvance < facility.requirements.advanceBookingDays) {
      throw new Error(`Booking must be made at least ${facility.requirements.advanceBookingDays} days in advance`);
    }

    // Check booking duration
    const duration = this.calculateDuration(request.startDateTime, request.endDateTime) / 60; // hours
    if (duration < facility.requirements.minimumBookingHours) {
      throw new Error(`Minimum booking duration is ${facility.requirements.minimumBookingHours} hours`);
    }
    if (duration > facility.requirements.maximumBookingHours) {
      throw new Error(`Maximum booking duration is ${facility.requirements.maximumBookingHours} hours`);
    }
  }

  private async checkBookingConflicts(
    request: BookingRequest,
    user: User,
    excludeBookingId?: string
  ): Promise<ConflictInfo[]> {
    const conflicts: ConflictInfo[] = [];

    try {
      const storage = await this.storage;

      // Check time availability
      const isAvailable = await this.checkFacilityAvailability(
        request.facilityId,
        request.startDateTime.split('T')[0],
        this.extractTime(request.startDateTime),
        this.extractTime(request.endDateTime),
        user
      );

      if (!isAvailable) {
        // Find specific conflicts
        const reservations = await storage.getFacilityReservationsByFacility(
          request.facilityId,
          request.startDateTime.split('T')[0],
          request.endDateTime.split('T')[0],
          user
        );

        for (const reservation of reservations) {
          if (reservation.id === excludeBookingId) continue;
          if (reservation.reservationStatus === 'cancelled') continue;

          if (this.timeRangesOverlap(
            this.extractTime(request.startDateTime),
            this.extractTime(request.endDateTime),
            reservation.startTime,
            reservation.endTime
          )) {
            conflicts.push({
              type: 'time_overlap',
              description: `Time conflict with existing reservation (${reservation.startTime} - ${reservation.endTime})`,
              conflictingBookingId: reservation.id,
              severity: 'major',
              resolutionOptions: ['Change time', 'Use different facility', 'Contact existing booker']
            });
          }
        }
      }

      // Check capacity constraints
      const facility = await this.getFacilityInfo(request.facilityId, user);
      if (facility && request.expectedAttendance > facility.capacity.recommended) {
        conflicts.push({
          type: 'capacity_exceeded',
          description: `Expected attendance (${request.expectedAttendance}) exceeds recommended capacity (${facility.capacity.recommended})`,
          severity: request.expectedAttendance > facility.capacity.maximum ? 'critical' : 'minor',
          resolutionOptions: ['Reduce attendance', 'Use larger facility', 'Split into multiple sessions']
        });
      }

      // Check equipment availability
      if (request.setupRequirements.equipment.length > 0) {
        // This would check equipment conflicts
        // Implementation depends on equipment tracking system
      }

    } catch (error) {
      console.error('Error checking booking conflicts:', error);
    }

    return conflicts;
  }

  private async calculateBookingCosts(request: BookingRequest, user: User): Promise<BookingCosts> {
    try {
      const facility = await this.getFacilityInfo(request.facilityId, user);
      if (!facility) {
        throw new Error('Facility not found for cost calculation');
      }

      const duration = this.calculateDuration(request.startDateTime, request.endDateTime) / 60; // hours
      
      const facilityFee = (facility.costs.hourlyRate || 0) * duration;
      const setupFee = facility.costs.setupFee || 0;
      const cleaningFee = facility.costs.cleaningFee || 0;
      const securityFee = request.additionalServices.security ? (facility.costs.securityFee || 0) : 0;

      const equipmentFees: Record<string, number> = {};
      request.setupRequirements.equipment.forEach(equipmentId => {
        equipmentFees[equipmentId] = facility.costs.equipmentFees?.[equipmentId] || 0;
      });

      const serviceFees: Record<string, number> = {};
      if (request.additionalServices.catering) serviceFees.catering = 50; // Example fee
      if (request.additionalServices.audioVisual) serviceFees.audioVisual = 25;
      if (request.additionalServices.custodial) serviceFees.custodial = 30;

      const totalEquipmentFees = Object.values(equipmentFees).reduce((sum, fee) => sum + fee, 0);
      const totalServiceFees = Object.values(serviceFees).reduce((sum, fee) => sum + fee, 0);

      const subtotal = facilityFee + setupFee + cleaningFee + securityFee + totalEquipmentFees + totalServiceFees;

      // Apply discounts
      const discountsApplied = await this.calculateDiscounts(request, subtotal, user);
      const totalDiscounts = discountsApplied.reduce((sum, discount) => sum + discount.amount, 0);

      const totalCost = Math.max(0, subtotal - totalDiscounts);

      return {
        facilityFee,
        equipmentFees,
        serviceFees,
        setupFee,
        cleaningFee,
        securityFee,
        totalCost,
        discountsApplied
      };
    } catch (error) {
      console.error('Error calculating booking costs:', error);
      throw new Error('Failed to calculate booking costs');
    }
  }

  private async calculateDiscounts(
    request: BookingRequest,
    subtotal: number,
    user: User
  ): Promise<{ type: string; amount: number; reason: string }[]> {
    const discounts: { type: string; amount: number; reason: string }[] = [];

    // Educational discount
    if (request.eventType === 'practice' || request.eventType === 'game') {
      discounts.push({
        type: 'educational',
        amount: subtotal * 0.1, // 10% discount
        reason: 'Educational/Athletic activity discount'
      });
    }

    // Non-profit discount (based on user organization)
    if (user.organizationType === 'nonprofit') {
      discounts.push({
        type: 'nonprofit',
        amount: subtotal * 0.15, // 15% discount
        reason: 'Non-profit organization discount'
      });
    }

    // Bulk booking discount
    if (request.recurringPattern) {
      discounts.push({
        type: 'recurring',
        amount: subtotal * 0.05, // 5% discount
        reason: 'Recurring booking discount'
      });
    }

    return discounts;
  }

  private async findAlternativeOptions(
    request: BookingRequest,
    user: User
  ): Promise<AlternativeOption[]> {
    try {
      // Get similar facilities
      const facilities = await this.getFacilities(user, {
        type: [this.inferFacilityTypeFromEvent(request.eventType)],
        capacity: { min: request.expectedAttendance }
      });

      const alternatives: AlternativeOption[] = [];

      for (const facility of facilities) {
        if (facility.id === request.facilityId) continue;

        // Check availability
        const isAvailable = await this.checkFacilityAvailability(
          facility.id,
          request.startDateTime.split('T')[0],
          this.extractTime(request.startDateTime),
          this.extractTime(request.endDateTime),
          user
        );

        if (isAvailable) {
          const costs = await this.calculateBookingCosts({
            ...request,
            facilityId: facility.id
          }, user);

          alternatives.push({
            facilityId: facility.id,
            facilityName: facility.name,
            startDateTime: request.startDateTime,
            endDateTime: request.endDateTime,
            capacity: facility.capacity.maximum,
            suitabilityScore: this.calculateSuitabilityScore(facility, request),
            additionalCosts: costs.totalCost,
            reasoning: `Alternative venue with capacity for ${facility.capacity.maximum}`
          });
        }
      }

      // Sort by suitability score
      return alternatives.sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 5);
    } catch (error) {
      console.error('Error finding alternative options:', error);
      return [];
    }
  }

  private calculateSuitabilityScore(facility: FacilityInfo, request: BookingRequest): number {
    let score = 100;

    // Capacity match
    const capacityRatio = request.expectedAttendance / facility.capacity.maximum;
    if (capacityRatio > 0.9) score -= 10; // Too close to capacity
    if (capacityRatio < 0.5) score -= 5;  // Underutilized

    // Type match
    const idealType = this.inferFacilityTypeFromEvent(request.eventType);
    if (facility.type !== idealType) score -= 20;

    // Amenities match
    const hasRequiredAmenities = request.setupRequirements.equipment.every(eq => 
      facility.amenities.some(amenity => amenity.toLowerCase().includes(eq.toLowerCase()))
    );
    if (!hasRequiredAmenities) score -= 15;

    // Accessibility
    if (facility.accessibility.wheelchairAccessible) score += 5;
    if (facility.accessibility.parkingAvailable) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private inferFacilityTypeFromEvent(eventType: string): FacilityInfo['type'] {
    const mapping: Record<string, FacilityInfo['type']> = {
      'practice': 'gym',
      'game': 'gym',
      'meeting': 'classroom',
      'tournament': 'gym',
      'event': 'multipurpose'
    };
    return mapping[eventType] || 'multipurpose';
  }

  private extractTime(dateTime: string): string {
    return dateTime.split('T')[1]?.substring(0, 5) || '00:00';
  }

  private calculateDuration(startDateTime: string, endDateTime: string): number {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    return end.getTime() - start.getTime(); // milliseconds
  }

  private canManageBooking(booking: FacilityReservation, user: User): boolean {
    return user.userRole?.includes('director') || 
           user.userRole?.includes('coordinator') ||
           user.complianceRole?.includes('director') ||
           booking.schoolId === user.organizationId;
  }

  private canViewBooking(booking: FacilityReservation, user: User): boolean {
    return this.canManageBooking(booking, user) || 
           booking.requestedBy === user.id ||
           booking.schoolId === user.organizationId;
  }

  private canScheduleMaintenance(user: User): boolean {
    return user.userRole?.includes('director') || 
           user.userRole?.includes('coordinator') ||
           user.complianceRole?.includes('director');
  }

  private convertReservationToRequest(reservation: FacilityReservation): BookingRequest {
    return {
      facilityId: reservation.venueId,
      requestedBy: reservation.requestedBy,
      organizationId: reservation.schoolId,
      eventType: reservation.usageType as any,
      eventTitle: `${reservation.usageType} Event`,
      startDateTime: `${reservation.reservationDate}T${reservation.startTime}`,
      endDateTime: `${reservation.reservationDate}T${reservation.endTime}`,
      expectedAttendance: reservation.estimatedAttendance || 0,
      setupRequirements: {
        equipment: reservation.setupRequired?.equipment || [],
        specialArrangements: reservation.setupRequired?.specialArrangements || '',
        custodialNeeds: reservation.setupRequired?.custodialNeeds || []
      },
      additionalServices: {},
      priority: 'normal',
      specialRequests: reservation.specialRequests
    };
  }

  private isSignificantBookingChange(updates: Partial<BookingRequest>): boolean {
    return !!(updates.startDateTime || updates.endDateTime || updates.facilityId || updates.expectedAttendance);
  }

  private async createRecurringBookings(
    request: BookingRequest,
    parentBookingId: string,
    user: User
  ): Promise<void> {
    // Implementation for creating recurring bookings
    console.log('Creating recurring bookings for:', parentBookingId);
  }

  private async startApprovalWorkflow(
    bookingId: string,
    request: BookingRequest,
    user: User
  ): Promise<void> {
    // Implementation for starting approval workflow
    console.log('Starting approval workflow for booking:', bookingId);
  }

  private async sendBookingNotifications(
    bookingId: string,
    action: 'created' | 'updated' | 'cancelled' | 'approved',
    user: User
  ): Promise<void> {
    // Implementation for sending booking notifications
    console.log('Sending booking notifications:', action, bookingId);
  }

  private async processBookingRefund(
    bookingId: string,
    reason: string,
    user: User
  ): Promise<void> {
    // Implementation for processing refunds
    console.log('Processing refund for booking:', bookingId, reason);
  }

  private async cancelRelatedCalendarEvents(bookingId: string, user: User): Promise<void> {
    // Implementation for canceling related calendar events
    console.log('Canceling related calendar events for booking:', bookingId);
  }

  private calculateTotalAvailableHours(
    facility: FacilityInfo,
    startDate: string,
    endDate: string
  ): number {
    // Calculate total available hours based on facility operating hours
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    // Simplified calculation - assumes 8 hours per day
    const dailyHours = 8;
    return totalDays * dailyHours;
  }

  private analyzeUsagePatterns(bookings: FacilityReservation[]): {
    peakTimes: TimeSlot[];
    lowTimes: TimeSlot[];
  } {
    // Analyze booking patterns to identify peak and low usage times
    const hourCounts: Record<string, number> = {};

    bookings.forEach(booking => {
      const hour = booking.startTime.substring(0, 2);
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const sortedHours = Object.entries(hourCounts).sort(([,a], [,b]) => b - a);
    
    const peakTimes: TimeSlot[] = sortedHours.slice(0, 3).map(([hour, count]) => ({
      start: `${hour}:00`,
      end: `${hour}:59`,
      available: false
    }));

    const lowTimes: TimeSlot[] = sortedHours.slice(-3).map(([hour, count]) => ({
      start: `${hour}:00`,
      end: `${hour}:59`,
      available: true
    }));

    return { peakTimes, lowTimes };
  }

  private calculateMaintenanceHours(
    maintenanceSchedule: MaintenanceSchedule[],
    startDate: string,
    endDate: string
  ): number {
    return maintenanceSchedule
      .filter(m => m.status === 'completed' || m.status === 'in_progress')
      .reduce((total, m) => total + (m.estimatedDuration || 0), 0);
  }

  private countEventTypes(bookings: FacilityReservation[]): Record<string, number> {
    return bookings.reduce((counts, booking) => {
      const type = booking.usageType;
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }

  private generateUtilizationRecommendations(utilizations: FacilityUtilization[]): string[] {
    const recommendations: string[] = [];

    // Low utilization recommendations
    const lowUtilizationFacilities = utilizations.filter(u => u.utilizationRate < 0.3);
    if (lowUtilizationFacilities.length > 0) {
      recommendations.push(`Consider promoting underutilized facilities: ${lowUtilizationFacilities.map(f => f.facilityName).join(', ')}`);
    }

    // High utilization recommendations
    const highUtilizationFacilities = utilizations.filter(u => u.utilizationRate > 0.9);
    if (highUtilizationFacilities.length > 0) {
      recommendations.push(`Consider expanding capacity or adding similar facilities for overbooked venues: ${highUtilizationFacilities.map(f => f.facilityName).join(', ')}`);
    }

    // Maintenance recommendations
    const facilitiesWithHighCancellations = utilizations.filter(u => u.cancelledBookings > 5);
    if (facilitiesWithHighCancellations.length > 0) {
      recommendations.push('Investigate high cancellation rates and improve booking policies');
    }

    return recommendations;
  }

  private async findBookingsAffectedByMaintenance(
    facilityId: string,
    startDate: string,
    endDate: string,
    user: User
  ): Promise<FacilityReservation[]> {
    try {
      const storage = await this.storage;
      const bookings = await storage.getFacilityReservationsByFacility(
        facilityId,
        startDate,
        endDate,
        user
      );

      return bookings.filter(booking => 
        booking.reservationStatus === 'approved' || booking.reservationStatus === 'confirmed'
      );
    } catch (error) {
      console.error('Error finding affected bookings:', error);
      return [];
    }
  }

  private async handleMaintenanceConflicts(
    maintenance: MaintenanceSchedule,
    affectedBookings: FacilityReservation[],
    user: User
  ): Promise<void> {
    // Implementation for handling maintenance conflicts
    console.log('Handling maintenance conflicts for', affectedBookings.length, 'bookings');
  }

  private async scheduleMaintenanceNotifications(
    maintenance: MaintenanceSchedule,
    user: User
  ): Promise<void> {
    // Implementation for scheduling maintenance notifications
    console.log('Scheduling maintenance notifications for:', maintenance.id);
  }

  private async sendMaintenanceCompletionNotifications(
    maintenanceId: string,
    user: User
  ): Promise<void> {
    // Implementation for sending maintenance completion notifications
    console.log('Sending maintenance completion notifications for:', maintenanceId);
  }
}

/**
 * Export singleton instance
 */
export const facilityCoordinationService = new FacilityCoordinationService();