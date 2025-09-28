import express from 'express';
import { isAuthenticated } from './replitAuth';
import { loadUserContext, requirePermissions } from './rbac-middleware';
import { body, param, query, validationResult } from 'express-validator';
import { PERMISSIONS } from './rbac-permissions';
import { calendarManagementService } from './calendar-management-service';
import { conflictDetectionService } from './conflict-detection-service';
import { facilityCoordinationService } from './facility-coordination-service';
import { automatedNotificationService } from './automated-notification-service';
import { scheduleOptimizationService } from './schedule-optimization-service';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);
router.use(loadUserContext);

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// ===================================================================
// CALENDAR MANAGEMENT ROUTES
// ===================================================================

/**
 * Get calendar view
 * GET /api/scheduling/calendar/view
 */
router.get('/calendar/view',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  query('viewType').isIn(['daily', 'weekly', 'monthly', 'agenda', 'yearly']),
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('eventTypes').optional().isArray(),
  query('visibility').optional().isArray(),
  query('facilities').optional().isArray(),
  query('importance').optional().isArray(),
  validateRequest,
  async (req, res) => {
    try {
      const { viewType, startDate, endDate, eventTypes, visibility, facilities, importance } = req.query;
      
      const calendarView = await calendarManagementService.getCalendarView(
        viewType as any,
        startDate as string,
        endDate as string,
        req.user!,
        {
          eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes as string[] : [eventTypes as string]) : undefined,
          visibility: visibility ? (Array.isArray(visibility) ? visibility as string[] : [visibility as string]) : undefined,
          facilities: facilities ? (Array.isArray(facilities) ? facilities as string[] : [facilities as string]) : undefined,
          importance: importance ? (Array.isArray(importance) ? importance as string[] : [importance as string]) : undefined
        }
      );

      res.json({
        success: true,
        data: calendarView
      });
    } catch (error) {
      console.error('Error getting calendar view:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get calendar view'
      });
    }
  }
);

/**
 * Create calendar event
 * POST /api/scheduling/calendar/events
 */
router.post('/calendar/events',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  body('title').notEmpty().trim(),
  body('eventType').isIn(['game', 'practice', 'meeting', 'tournament', 'academic_competition', 'deadline', 'training', 'other']),
  body('startDateTime').isISO8601(),
  body('endDateTime').optional().isISO8601(),
  body('allDay').optional().isBoolean(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('visibility').optional().isIn(['public', 'district', 'school', 'team', 'coaching_staff', 'private']),
  body('importance').optional().isIn(['low', 'normal', 'high', 'critical']),
  body('attendees').optional().isArray(),
  body('reminders').optional().isArray(),
  body('recurrence').optional().isObject(),
  validateRequest,
  async (req, res) => {
    try {
      const eventData = req.body;
      const createdEvent = await calendarManagementService.createEvent(eventData, req.user!);

      res.status(201).json({
        success: true,
        data: createdEvent
      });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event'
      });
    }
  }
);

/**
 * Update calendar event
 * PUT /api/scheduling/calendar/events/:eventId
 */
router.put('/calendar/events/:eventId',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('eventId').isUUID(),
  body('title').optional().notEmpty().trim(),
  body('eventType').optional().isIn(['game', 'practice', 'meeting', 'tournament', 'academic_competition', 'deadline', 'training', 'other']),
  body('startDateTime').optional().isISO8601(),
  body('endDateTime').optional().isISO8601(),
  body('allDay').optional().isBoolean(),
  body('location').optional().trim(),
  body('description').optional().trim(),
  body('visibility').optional().isIn(['public', 'district', 'school', 'team', 'coaching_staff', 'private']),
  body('importance').optional().isIn(['low', 'normal', 'high', 'critical']),
  validateRequest,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const updates = req.body;
      
      const updatedEvent = await calendarManagementService.updateEvent(eventId, updates, req.user!);

      res.json({
        success: true,
        data: updatedEvent
      });
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event'
      });
    }
  }
);

/**
 * Delete calendar event
 * DELETE /api/scheduling/calendar/events/:eventId
 */
router.delete('/calendar/events/:eventId',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('eventId').isUUID(),
  query('deleteRecurring').optional().isBoolean(),
  validateRequest,
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { deleteRecurring } = req.query;
      
      await calendarManagementService.deleteEvent(eventId, req.user!, deleteRecurring === 'true');

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event'
      });
    }
  }
);

/**
 * Export calendar
 * GET /api/scheduling/calendar/export
 */
router.get('/calendar/export',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('format').isIn(['ical', 'csv', 'json']),
  query('eventTypes').optional().isArray(),
  query('visibility').optional().isArray(),
  validateRequest,
  async (req, res) => {
    try {
      const { startDate, endDate, format, eventTypes, visibility } = req.query;
      
      const exportData = await calendarManagementService.exportCalendar(
        startDate as string,
        endDate as string,
        format as any,
        req.user!,
        {
          eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes as string[] : [eventTypes as string]) : undefined,
          visibility: visibility ? (Array.isArray(visibility) ? visibility as string[] : [visibility as string]) : undefined
        }
      );

      // Set appropriate content type and filename
      const contentTypes = {
        ical: 'text/calendar',
        csv: 'text/csv',
        json: 'application/json'
      };
      
      const extensions = {
        ical: 'ics',
        csv: 'csv',
        json: 'json'
      };

      res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
      res.setHeader('Content-Disposition', `attachment; filename="calendar.${extensions[format as keyof typeof extensions]}"`);
      res.send(exportData);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export calendar'
      });
    }
  }
);

/**
 * Get event templates
 * GET /api/scheduling/calendar/templates
 */
router.get('/calendar/templates',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  async (req, res) => {
    try {
      const templates = await calendarManagementService.getEventTemplates(req.user!);

      res.json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Error getting event templates:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event templates'
      });
    }
  }
);

/**
 * Create event template
 * POST /api/scheduling/calendar/templates
 */
router.post('/calendar/templates',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  body('name').notEmpty().trim(),
  body('eventType').notEmpty().trim(),
  body('defaultDuration').isInt({ min: 15 }),
  body('defaultLocation').optional().trim(),
  body('defaultReminders').optional().isArray(),
  body('defaultAttendees').optional().isArray(),
  validateRequest,
  async (req, res) => {
    try {
      const templateData = req.body;
      const template = await calendarManagementService.createEventTemplate(templateData, req.user!);

      res.status(201).json({
        success: true,
        data: template
      });
    } catch (error) {
      console.error('Error creating event template:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event template'
      });
    }
  }
);

// ===================================================================
// CONFLICT DETECTION ROUTES
// ===================================================================

/**
 * Detect conflicts for event
 * POST /api/scheduling/conflicts/detect
 */
router.post('/conflicts/detect',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  body('eventData').isObject(),
  body('excludeEventId').optional().isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const { eventData, excludeEventId } = req.body;
      
      const conflicts = await conflictDetectionService.detectEventConflicts(
        eventData,
        req.user!,
        excludeEventId
      );

      res.json({
        success: true,
        data: conflicts
      });
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to detect conflicts'
      });
    }
  }
);

/**
 * Get conflicts in date range
 * GET /api/scheduling/conflicts
 */
router.get('/conflicts',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('includeResolved').optional().isBoolean(),
  query('severityFilter').optional().isArray(),
  query('typeFilter').optional().isArray(),
  validateRequest,
  async (req, res) => {
    try {
      const { startDate, endDate, includeResolved, severityFilter, typeFilter } = req.query;
      
      const conflicts = await conflictDetectionService.detectConflictsInRange(
        startDate as string,
        endDate as string,
        req.user!,
        {
          includeResolved: includeResolved === 'true',
          severityFilter: severityFilter ? (Array.isArray(severityFilter) ? severityFilter as any[] : [severityFilter]) : undefined,
          typeFilter: typeFilter ? (Array.isArray(typeFilter) ? typeFilter as string[] : [typeFilter as string]) : undefined
        }
      );

      res.json({
        success: true,
        data: conflicts
      });
    } catch (error) {
      console.error('Error getting conflicts:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get conflicts'
      });
    }
  }
);

/**
 * Resolve conflict
 * POST /api/scheduling/conflicts/:conflictId/resolve
 */
router.post('/conflicts/:conflictId/resolve',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('conflictId').isUUID(),
  body('resolutionId').notEmpty().trim(),
  body('notes').optional().trim(),
  validateRequest,
  async (req, res) => {
    try {
      const { conflictId } = req.params;
      const { resolutionId, notes } = req.body;
      
      await conflictDetectionService.resolveConflict(conflictId, resolutionId, req.user!, notes);

      res.json({
        success: true,
        message: 'Conflict resolved successfully'
      });
    } catch (error) {
      console.error('Error resolving conflict:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resolve conflict'
      });
    }
  }
);

/**
 * Auto-resolve conflicts
 * POST /api/scheduling/conflicts/auto-resolve
 */
router.post('/conflicts/auto-resolve',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  body('maxSeverity').optional().isIn(['minor', 'major']),
  body('minConfidence').optional().isInt({ min: 0, max: 100 }),
  body('conflictTypes').optional().isArray(),
  validateRequest,
  async (req, res) => {
    try {
      const criteria = req.body;
      const result = await conflictDetectionService.autoResolveConflicts(req.user!, criteria);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error auto-resolving conflicts:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to auto-resolve conflicts'
      });
    }
  }
);

/**
 * Get conflict analytics
 * GET /api/scheduling/conflicts/analytics
 */
router.get('/conflicts/analytics',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('organizationId').optional().isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const { startDate, endDate, organizationId } = req.query;
      
      const analytics = await conflictDetectionService.getConflictAnalytics(
        startDate as string,
        endDate as string,
        req.user!,
        organizationId as string
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting conflict analytics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get conflict analytics'
      });
    }
  }
);

// ===================================================================
// FACILITY COORDINATION ROUTES
// ===================================================================

/**
 * Get facility information
 * GET /api/scheduling/facilities/:facilityId
 */
router.get('/facilities/:facilityId',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  param('facilityId').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const { facilityId } = req.params;
      
      const facilityInfo = await facilityCoordinationService.getFacilityInfo(facilityId, req.user!);
      
      if (!facilityInfo) {
        return res.status(404).json({
          success: false,
          error: 'Facility not found'
        });
      }

      res.json({
        success: true,
        data: facilityInfo
      });
    } catch (error) {
      console.error('Error getting facility info:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get facility information'
      });
    }
  }
);

/**
 * Get facilities with filtering
 * GET /api/scheduling/facilities
 */
router.get('/facilities',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  query('type').optional().isArray(),
  query('capacity.min').optional().isInt({ min: 0 }),
  query('capacity.max').optional().isInt({ min: 0 }),
  query('amenities').optional().isArray(),
  query('availability.date').optional().isISO8601().toDate(),
  query('availability.startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  query('availability.endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  validateRequest,
  async (req, res) => {
    try {
      const filters: any = {};
      
      if (req.query.type) {
        filters.type = Array.isArray(req.query.type) ? req.query.type : [req.query.type];
      }
      
      if (req.query['capacity.min'] || req.query['capacity.max']) {
        filters.capacity = {
          min: req.query['capacity.min'] ? parseInt(req.query['capacity.min'] as string) : undefined,
          max: req.query['capacity.max'] ? parseInt(req.query['capacity.max'] as string) : undefined
        };
      }
      
      if (req.query.amenities) {
        filters.amenities = Array.isArray(req.query.amenities) ? req.query.amenities : [req.query.amenities];
      }
      
      if (req.query['availability.date'] && req.query['availability.startTime'] && req.query['availability.endTime']) {
        filters.availability = {
          date: (req.query['availability.date'] as Date).toISOString().split('T')[0],
          startTime: req.query['availability.startTime'] as string,
          endTime: req.query['availability.endTime'] as string
        };
      }
      
      const facilities = await facilityCoordinationService.getFacilities(req.user!, filters);

      res.json({
        success: true,
        data: facilities
      });
    } catch (error) {
      console.error('Error getting facilities:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get facilities'
      });
    }
  }
);

/**
 * Create facility booking
 * POST /api/scheduling/facilities/:facilityId/bookings
 */
router.post('/facilities/:facilityId/bookings',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('facilityId').isUUID(),
  body('organizationId').isUUID(),
  body('eventType').isIn(['practice', 'game', 'meeting', 'event', 'tournament', 'maintenance', 'other']),
  body('eventTitle').notEmpty().trim(),
  body('startDateTime').isISO8601(),
  body('endDateTime').isISO8601(),
  body('expectedAttendance').isInt({ min: 1 }),
  body('setupRequirements').isObject(),
  body('additionalServices').optional().isObject(),
  body('priority').optional().isIn(['low', 'normal', 'high', 'emergency']),
  body('recurringPattern').optional().isObject(),
  validateRequest,
  async (req, res) => {
    try {
      const { facilityId } = req.params;
      const bookingRequest = {
        facilityId,
        requestedBy: req.user!.id,
        ...req.body
      };
      
      const bookingResponse = await facilityCoordinationService.createBookingRequest(bookingRequest, req.user!);

      res.status(201).json({
        success: true,
        data: bookingResponse
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create booking'
      });
    }
  }
);

/**
 * Update facility booking
 * PUT /api/scheduling/bookings/:bookingId
 */
router.put('/bookings/:bookingId',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('bookingId').isUUID(),
  body('facilityId').optional().isUUID(),
  body('startDateTime').optional().isISO8601(),
  body('endDateTime').optional().isISO8601(),
  body('expectedAttendance').optional().isInt({ min: 1 }),
  body('eventType').optional().isIn(['practice', 'game', 'meeting', 'event', 'tournament', 'maintenance', 'other']),
  body('specialRequests').optional().trim(),
  validateRequest,
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const updates = req.body;
      
      const updatedBooking = await facilityCoordinationService.updateBooking(bookingId, updates, req.user!);

      res.json({
        success: true,
        data: updatedBooking
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update booking'
      });
    }
  }
);

/**
 * Cancel facility booking
 * DELETE /api/scheduling/bookings/:bookingId
 */
router.delete('/bookings/:bookingId',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('bookingId').isUUID(),
  body('reason').notEmpty().trim(),
  body('refundEligible').optional().isBoolean(),
  validateRequest,
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { reason, refundEligible } = req.body;
      
      await facilityCoordinationService.cancelBooking(bookingId, reason, req.user!, refundEligible);

      res.json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel booking'
      });
    }
  }
);

/**
 * Get facility utilization
 * GET /api/scheduling/facilities/:facilityId/utilization
 */
router.get('/facilities/:facilityId/utilization',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  param('facilityId').isUUID(),
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  validateRequest,
  async (req, res) => {
    try {
      const { facilityId } = req.params;
      const { startDate, endDate } = req.query;
      
      const utilization = await facilityCoordinationService.getFacilityUtilization(
        facilityId,
        startDate as string,
        endDate as string,
        req.user!
      );

      res.json({
        success: true,
        data: utilization
      });
    } catch (error) {
      console.error('Error getting facility utilization:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get facility utilization'
      });
    }
  }
);

/**
 * Schedule maintenance
 * POST /api/scheduling/facilities/:facilityId/maintenance
 */
router.post('/facilities/:facilityId/maintenance',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('facilityId').isUUID(),
  body('maintenanceType').isIn(['routine', 'preventive', 'repair', 'deep_clean', 'inspection', 'upgrade']),
  body('priority').isIn(['low', 'normal', 'high', 'emergency']),
  body('scheduledStartDate').isISO8601(),
  body('scheduledEndDate').isISO8601(),
  body('estimatedDuration').isInt({ min: 1 }),
  body('description').notEmpty().trim(),
  body('contractor').optional().isObject(),
  validateRequest,
  async (req, res) => {
    try {
      const { facilityId } = req.params;
      const maintenanceData = {
        facilityId,
        ...req.body
      };
      
      const maintenance = await facilityCoordinationService.scheduleMaintenance(maintenanceData, req.user!);

      res.status(201).json({
        success: true,
        data: maintenance
      });
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule maintenance'
      });
    }
  }
);

// ===================================================================
// NOTIFICATION ROUTES
// ===================================================================

/**
 * Send event notification
 * POST /api/scheduling/notifications/send
 */
router.post('/notifications/send',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  body('eventId').isUUID(),
  body('eventType').isIn(['calendar_event', 'facility_reservation', 'conflict', 'game', 'practice', 'athletic_trainer_appointment']),
  body('triggerType').isIn(['event_created', 'event_updated', 'event_cancelled', 'conflict_detected', 'facility_unavailable', 'approval_required', 'reminder', 'escalation']),
  body('urgency').isIn(['low', 'normal', 'high', 'critical']),
  body('customRecipients').optional().isArray(),
  body('customMessage').optional().isObject(),
  body('scheduleFor').optional().isISO8601(),
  validateRequest,
  async (req, res) => {
    try {
      const notificationRequest = req.body;
      
      const requestId = await automatedNotificationService.sendEventNotification(notificationRequest, req.user!);

      res.status(201).json({
        success: true,
        data: { requestId }
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send notification'
      });
    }
  }
);

/**
 * Update user notification preferences
 * PUT /api/scheduling/notifications/preferences/:userId
 */
router.put('/notifications/preferences/:userId',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('userId').isUUID(),
  body('channels').optional().isObject(),
  body('eventTypes').optional().isObject(),
  body('quietHours').optional().isObject(),
  body('escalationSettings').optional().isObject(),
  validateRequest,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = req.body;
      
      const updatedPreferences = await automatedNotificationService.updateUserPreferences(
        userId,
        preferences,
        req.user!
      );

      res.json({
        success: true,
        data: updatedPreferences
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification preferences'
      });
    }
  }
);

/**
 * Get user notification preferences
 * GET /api/scheduling/notifications/preferences/:userId
 */
router.get('/notifications/preferences/:userId',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  param('userId').isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const preferences = await automatedNotificationService.getUserNotificationPreferences(userId);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get notification preferences'
      });
    }
  }
);

/**
 * Get notification analytics
 * GET /api/scheduling/notifications/analytics
 */
router.get('/notifications/analytics',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  query('organizationId').optional().isUUID(),
  validateRequest,
  async (req, res) => {
    try {
      const { startDate, endDate, organizationId } = req.query;
      
      const analytics = await automatedNotificationService.getNotificationAnalytics(
        startDate as string,
        endDate as string,
        req.user!,
        organizationId as string
      );

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting notification analytics:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get notification analytics'
      });
    }
  }
);

// ===================================================================
// OPTIMIZATION ROUTES
// ===================================================================

/**
 * Create optimization request
 * POST /api/scheduling/optimization/requests
 */
router.post('/optimization/requests',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('scope').isObject(),
  body('objectives').isArray({ min: 1 }),
  body('constraints').isArray(),
  body('preferences').isObject(),
  body('priority').isIn(['low', 'normal', 'high', 'critical']),
  body('scheduledFor').optional().isISO8601(),
  body('recurring').optional().isObject(),
  validateRequest,
  async (req, res) => {
    try {
      const requestData = {
        requestedBy: req.user!.id,
        ...req.body
      };
      
      const optimizationRequest = await scheduleOptimizationService.createOptimizationRequest(requestData, req.user!);

      res.status(201).json({
        success: true,
        data: optimizationRequest
      });
    } catch (error) {
      console.error('Error creating optimization request:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create optimization request'
      });
    }
  }
);

/**
 * Get optimization result
 * GET /api/scheduling/optimization/results/:requestId
 */
router.get('/optimization/results/:requestId',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  param('requestId').notEmpty(),
  validateRequest,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      
      const result = await scheduleOptimizationService.getOptimizationResult(requestId, req.user!);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Optimization result not found'
        });
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting optimization result:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get optimization result'
      });
    }
  }
);

/**
 * Cancel optimization
 * POST /api/scheduling/optimization/:requestId/cancel
 */
router.post('/optimization/:requestId/cancel',
  requirePermissions([PERMISSIONS.TOURNAMENT_MANAGE]),
  param('requestId').notEmpty(),
  validateRequest,
  async (req, res) => {
    try {
      const { requestId } = req.params;
      
      await scheduleOptimizationService.cancelOptimization(requestId, req.user!);

      res.json({
        success: true,
        message: 'Optimization cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling optimization:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel optimization'
      });
    }
  }
);

/**
 * Generate demand forecast
 * GET /api/scheduling/optimization/forecast
 */
router.get('/optimization/forecast',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  query('organizationId').isUUID(),
  query('startDate').isISO8601(),
  query('endDate').isISO8601(),
  validateRequest,
  async (req, res) => {
    try {
      const { organizationId, startDate, endDate } = req.query;
      
      const forecast = await scheduleOptimizationService.generateDemandForecast(
        organizationId as string,
        { startDate: startDate as string, endDate: endDate as string },
        req.user!
      );

      res.json({
        success: true,
        data: forecast
      });
    } catch (error) {
      console.error('Error generating forecast:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate forecast'
      });
    }
  }
);

/**
 * Optimize travel logistics
 * POST /api/scheduling/optimization/travel
 */
router.post('/optimization/travel',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  body('events').isArray({ min: 1 }),
  validateRequest,
  async (req, res) => {
    try {
      const { events } = req.body;
      
      const travelOptimization = await scheduleOptimizationService.optimizeTravelLogistics(events, req.user!);

      res.json({
        success: true,
        data: travelOptimization
      });
    } catch (error) {
      console.error('Error optimizing travel:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize travel'
      });
    }
  }
);

/**
 * Balance workload
 * POST /api/scheduling/optimization/workload
 */
router.post('/optimization/workload',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  body('organizationId').isUUID(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  validateRequest,
  async (req, res) => {
    try {
      const { organizationId, startDate, endDate } = req.body;
      
      const workloadBalance = await scheduleOptimizationService.balanceWorkload(
        organizationId,
        { startDate, endDate },
        req.user!
      );

      res.json({
        success: true,
        data: workloadBalance
      });
    } catch (error) {
      console.error('Error balancing workload:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to balance workload'
      });
    }
  }
);

/**
 * Get weather impact
 * POST /api/scheduling/optimization/weather
 */
router.post('/optimization/weather',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  body('events').isArray({ min: 1 }),
  validateRequest,
  async (req, res) => {
    try {
      const { events } = req.body;
      
      const weatherImpact = await scheduleOptimizationService.getWeatherImpact(events, req.user!);

      res.json({
        success: true,
        data: weatherImpact
      });
    } catch (error) {
      console.error('Error getting weather impact:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get weather impact'
      });
    }
  }
);

// ===================================================================
// INTEGRATION ENDPOINTS
// ===================================================================

/**
 * Real-time conflict check
 * POST /api/scheduling/realtime/conflicts
 */
router.post('/realtime/conflicts',
  requirePermissions([PERMISSIONS.TOURNAMENT_VIEW]),
  body('eventId').isUUID(),
  body('eventType').notEmpty().trim(),
  validateRequest,
  async (req, res) => {
    try {
      const { eventId, eventType } = req.body;
      
      const conflicts = await conflictDetectionService.checkRealTimeConflicts(eventId, eventType, req.user!);

      res.json({
        success: true,
        data: conflicts
      });
    } catch (error) {
      console.error('Error checking real-time conflicts:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check real-time conflicts'
      });
    }
  }
);

/**
 * Health check endpoint
 * GET /api/scheduling/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Scheduling System is operational',
    timestamp: new Date().toISOString(),
    services: {
      calendarManagement: 'active',
      conflictDetection: 'active',
      facilityCoordination: 'active',
      automatedNotifications: 'active',
      scheduleOptimization: 'active'
    }
  });
});

export default router;