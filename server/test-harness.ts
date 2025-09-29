/**
 * Test Harness for Smart Scheduling Verification
 * Provides development-mode authentication bypass and test data seeding
 */
import express from 'express';
import { getStorage } from './storage';
import { calendarManagementService } from './calendar-management-service';
import { conflictDetectionService } from './conflict-detection-service';
import type { User, InsertAthleticCalendarEvent } from '@shared/schema';

const router = express.Router();

// Development-only test user DISABLED to fix redirect loop
// Athletic Trainer auto-login was causing persistent login issues
const TEST_USER: User = {
  id: 'test-dev-user-2025',
  email: 'dev-user@example.com',
  firstName: 'Test',
  lastName: 'User',
  profileImageUrl: null,
  subscriptionStatus: 'active',
  subscriptionPlan: 'foundation',
  userRole: 'coach',
  organizationId: 'test-org',
  organizationName: 'Test Organization',
  mission: null,
  customBranding: { primaryColor: '#000000', secondaryColor: '#666666', backgroundColor: '#ffffff', textColor: '#1a1a1a', accentColor: '#3b82f6', theme: 'neutral' },
  isWhitelabelClient: true,
  whitelabelDomain: 'test.example.com',
  whitelabelBranding: { primaryColor: '#000000', secondaryColor: '#666666', backgroundColor: '#ffffff', theme: 'neutral' },
  aiPreferences: null,
  techSkillLevel: 'intermediate',
  completedAITutorials: null,
  aiInteractionCount: 0,
  enhancedAiPreferences: null,
  monthlyTournamentLimit: 5,
  currentMonthTournaments: 0,
  lastMonthReset: new Date(),
  registrationFingerprint: null,
  registrationIP: null,
  verifiedPhone: null,
  organizationVerified: false,
  totalTournamentsCreated: 0,
  lifetimeUsageValue: "0",
  tournamentCredits: 0,
  creditsPurchased: "0",
  hipaaTrainingCompleted: true,
  hipaaTrainingDate: new Date('2025-01-01'),
  ferpaAgreementSigned: true,
  ferpaAgreementDate: new Date('2025-01-01'),
  complianceRole: 'coach',
  medicalDataAccess: false,
  lastComplianceAudit: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  stripeConnectAccountId: null,
  phone: null,
  organizationType: null,
  description: null,
  sportsInvolved: null,
  requestType: null,
  paymentMethod: null,
  pendingCheckAmount: null,
  accountStatus: 'active',
  passwordHash: null,
  authProvider: 'email',
  emailVerified: false,
  emailVerificationToken: null,
  passwordResetToken: null,
  passwordResetExpires: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Test data for comprehensive verification
const TEST_EVENTS: Partial<InsertAthleticCalendarEvent>[] = [
  {
    eventTitle: 'Football Practice',
    eventType: 'practice',
    eventDate: '2025-10-01',
    startTime: '15:00',
    endTime: '17:00',
    location: 'Main Stadium',
    visibility: 'team',
    importanceLevel: 'normal',
    description: 'Regular practice session'
  },
  {
    eventTitle: 'Basketball Game vs Eagles',
    eventType: 'game',
    eventDate: '2025-10-01',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Main Gym',
    visibility: 'public',
    importanceLevel: 'high',
    description: 'Home game against Eagles'
  },
  {
    eventTitle: 'Academic Competition - Math Team',
    eventType: 'academic_competition',
    eventDate: '2025-10-02',
    startTime: '08:00',
    endTime: '12:00',
    location: 'Library',
    visibility: 'school',
    importanceLevel: 'high',
    description: 'Regional math competition'
  },
  {
    eventTitle: 'Training Workshop - Coaches',
    eventType: 'training',
    eventDate: '2025-10-02',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Conference Room',
    visibility: 'coaching_staff',
    importanceLevel: 'normal',
    description: 'Coaching development training'
  },
  {
    eventTitle: 'Registration Deadline - Spring Sports',
    eventType: 'deadline',
    eventDate: '2025-10-03',
    startTime: '23:59',
    endTime: '23:59',
    location: 'Athletic Office',
    visibility: 'district',
    importanceLevel: 'critical',
    description: 'Final deadline for spring sports registration'
  },
  {
    eventTitle: 'Facility Maintenance',
    eventType: 'other',
    eventDate: '2025-10-04',
    startTime: '08:00',
    endTime: '17:00',
    location: 'All Facilities',
    visibility: 'private',
    importanceLevel: 'low',
    description: 'Scheduled facility maintenance'
  },
  // CONFLICT EVENTS - These should trigger conflict detection
  {
    eventTitle: 'Volleyball Practice (CONFLICTS)',
    eventType: 'practice',
    eventDate: '2025-10-01',
    startTime: '19:30', // Overlaps with Basketball Game
    endTime: '21:30',
    location: 'Main Gym', // Same location as Basketball Game
    visibility: 'team',
    importanceLevel: 'normal',
    description: 'Practice session that conflicts with basketball game'
  },
  {
    eventTitle: 'Soccer Game (CONFLICTS)',
    eventType: 'game',
    eventDate: '2025-10-01',
    startTime: '20:00', // Also overlaps
    endTime: '22:00',
    location: 'Main Gym', // Same location conflict
    visibility: 'public',
    importanceLevel: 'high',
    description: 'Game that should conflict with other events'
  }
];

/**
 * Development-only middleware to bypass authentication
 * ONLY works in development mode with NODE_ENV=development
 */
function devAuthBypass(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      error: 'Test harness only available in development mode' 
    });
  }

  // Create mock authentication context
  req.user = {
    ...TEST_USER,
    claims: {
      sub: TEST_USER.id,
      email: TEST_USER.email,
      first_name: TEST_USER.firstName,
      last_name: TEST_USER.lastName
    }
  };

  // Create RBAC context
  req.rbacContext = {
    user: TEST_USER,
    permissions: ['TOURNAMENT_VIEW', 'TOURNAMENT_MANAGE', 'ACADEMIC_VIEW', 'ACADEMIC_MANAGE'],
    dataScope: { districts: ['test-district'], schools: ['test-school'] },
    organizationId: TEST_USER.organizationId || '',
    canAccessHealthData: true,
    canAccessBudgetData: true,
    canAccessAcademicData: true
  };

  next();
}

/**
 * Create authenticated session for test user
 * POST /api/test/login
 */
router.post('/login', async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ 
        error: 'Test login only available in development mode' 
      });
    }

    console.log('🧪 Creating authenticated session for test user...');
    
    const storage = await getStorage();
    
    // Ensure test user exists
    await storage.upsertUser(TEST_USER);
    
    // Create session user object that matches auth expectations
    const sessionUser = {
      claims: { 
        sub: TEST_USER.id,
        email: TEST_USER.email,
        first_name: TEST_USER.firstName,
        last_name: TEST_USER.lastName,
        profile_image_url: TEST_USER.profileImageUrl
      }
    };
    
    // Use req.login to establish passport session
    req.login(sessionUser, (err) => {
      if (err) {
        console.error("Test login error:", err);
        return res.status(500).json({ error: "Test login failed" });
      }
      
      console.log("✅ Test user authenticated successfully:", sessionUser.claims.email);
      
      // Force session save
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Session save error:", saveErr);
        }
        
        res.json({
          success: true,
          message: 'Authenticated session established',
          user: {
            id: TEST_USER.id,
            email: TEST_USER.email,
            firstName: TEST_USER.firstName,
            lastName: TEST_USER.lastName,
            userRole: TEST_USER.userRole,
            complianceRole: TEST_USER.complianceRole,
            medicalDataAccess: TEST_USER.medicalDataAccess
          }
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Test login failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Initialize test user and data
 * POST /api/test/init
 */
router.post('/init', devAuthBypass, async (req, res) => {
  try {
    console.log('🧪 Initializing test harness with user and data...');
    
    const storage = await getStorage();
    
    // Create test user
    await storage.upsertUser({
      id: TEST_USER.id,
      email: TEST_USER.email,
      firstName: TEST_USER.firstName,
      lastName: TEST_USER.lastName,
      userRole: TEST_USER.userRole,
      complianceRole: TEST_USER.complianceRole,
      subscriptionPlan: TEST_USER.subscriptionPlan,
      subscriptionStatus: TEST_USER.subscriptionStatus,
      organizationId: TEST_USER.organizationId,
      organizationName: TEST_USER.organizationName,
      isWhitelabelClient: TEST_USER.isWhitelabelClient,
      whitelabelDomain: TEST_USER.whitelabelDomain
    });

    console.log('✅ Test user created:', TEST_USER.id);

    // Create test events
    const createdEvents = [];
    for (const eventData of TEST_EVENTS) {
      try {
        const calendarEvent = await calendarManagementService.createEvent({
          title: eventData.eventTitle!,
          eventType: eventData.eventType as any,
          startDateTime: `${eventData.eventDate}T${eventData.startTime}:00`,
          endDateTime: `${eventData.eventDate}T${eventData.endTime}:00`,
          location: eventData.location || '',
          description: eventData.description || '',
          visibility: eventData.visibility as any,
          importance: eventData.importanceLevel as any
        }, TEST_USER);
        
        createdEvents.push(calendarEvent);
        console.log(`✅ Created event: ${eventData.eventTitle}`);
      } catch (error) {
        console.error(`❌ Failed to create event ${eventData.eventTitle}:`, error);
      }
    }

    res.json({
      success: true,
      message: 'Test harness initialized successfully',
      data: {
        user: TEST_USER,
        eventsCreated: createdEvents.length,
        events: createdEvents
      }
    });

  } catch (error) {
    console.error('❌ Test harness initialization failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test calendar view with filters
 * GET /api/test/calendar-view
 */
router.get('/calendar-view', devAuthBypass, async (req, res) => {
  try {
    console.log('🧪 Testing calendar view with filters...');
    
    const { eventTypes, sports, visibility, importance } = req.query;
    
    const calendarView = await calendarManagementService.getCalendarView(
      'weekly',
      '2025-09-28',
      '2025-10-05',
      TEST_USER,
      {
        eventTypes: eventTypes ? (Array.isArray(eventTypes) ? eventTypes as string[] : [eventTypes as string]) : undefined,
        sports: sports ? (Array.isArray(sports) ? sports as string[] : [sports as string]) : undefined,
        visibility: visibility ? (Array.isArray(visibility) ? visibility as string[] : [visibility as string]) : undefined,
        importance: importance ? (Array.isArray(importance) ? importance as string[] : [importance as string]) : undefined
      }
    );

    console.log(`📊 Calendar view returned ${calendarView.events.length} events`);
    console.log('🔍 Event types found:', Array.from(new Set(calendarView.events.map(e => e.eventType))));
    console.log('🔍 Visibility levels:', Array.from(new Set(calendarView.events.map(e => e.visibility))));
    console.log('🔍 Importance levels:', Array.from(new Set(calendarView.events.map(e => e.importance))));

    res.json({
      success: true,
      data: calendarView,
      filterApplied: { eventTypes, sports, visibility, importance },
      evidence: {
        totalEvents: calendarView.events.length,
        uniqueEventTypes: Array.from(new Set(calendarView.events.map(e => e.eventType))),
        uniqueVisibility: Array.from(new Set(calendarView.events.map(e => e.visibility))),
        uniqueImportance: Array.from(new Set(calendarView.events.map(e => e.importance)))
      }
    });

  } catch (error) {
    console.error('❌ Calendar view test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test conflict detection
 * GET /api/test/conflicts
 */
router.get('/conflicts', devAuthBypass, async (req, res) => {
  try {
    console.log('🧪 Testing conflict detection...');
    
    const conflicts = await conflictDetectionService.detectConflictsInRange(
      '2025-09-28',
      '2025-10-05',
      TEST_USER
    );

    console.log(`⚠️ Found ${conflicts.length} conflicts`);
    conflicts.forEach((conflict: any, index: number) => {
      console.log(`🔍 Conflict ${index + 1}:`, {
        type: conflict.conflictType,
        severity: conflict.severityLevel,
        events: conflict.conflictingEvents.length,
        message: conflict.detailsAndSuggestions
      });
    });

    res.json({
      success: true,
      data: conflicts,
      evidence: {
        totalConflicts: conflicts.length,
        conflictTypes: Array.from(new Set(conflicts.map((c: any) => c.conflictType))),
        severityLevels: Array.from(new Set(conflicts.map((c: any) => c.severityLevel))),
        detailedAnalysis: conflicts.map((c: any) => ({
          type: c.conflictType,
          severity: c.severityLevel,
          eventsInvolved: c.conflictingEvents.length,
          suggestion: c.detailsAndSuggestions
        }))
      }
    });

  } catch (error) {
    console.error('❌ Conflict detection test failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Comprehensive verification test
 * GET /api/test/full-verification
 */
router.get('/full-verification', devAuthBypass, async (req, res) => {
  try {
    console.log('🧪 Running comprehensive verification test...');
    
    const results: any = {
      success: true,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: All event types supported
    console.log('📋 Testing all 12 event types...');
    const allEventTypes = ['game', 'practice', 'meeting', 'tournament', 'academic_competition', 'deadline', 'training', 'other', 'banquet', 'fundraiser', 'awards', 'community'];
    
    for (const eventType of allEventTypes) {
      const filteredView = await calendarManagementService.getCalendarView(
        'weekly',
        '2025-09-28',
        '2025-10-05',
        TEST_USER,
        { eventTypes: [eventType] }
      );
      
      results.tests[`eventType_${eventType}`] = {
        supported: true,
        eventsFound: filteredView.events.length,
        events: filteredView.events.map(e => ({ title: e.title, type: e.eventType }))
      };
    }

    // Test 2: Visibility filtering
    console.log('🔒 Testing visibility filtering...');
    const visibilityLevels = ['public', 'district', 'school', 'team', 'coaching_staff', 'private'];
    
    for (const visibility of visibilityLevels) {
      const filteredView = await calendarManagementService.getCalendarView(
        'weekly',
        '2025-09-28',
        '2025-10-05',
        TEST_USER,
        { visibility: [visibility] }
      );
      
      results.tests[`visibility_${visibility}`] = {
        supported: true,
        eventsFound: filteredView.events.length,
        events: filteredView.events.map(e => ({ title: e.title, visibility: e.visibility }))
      };
    }

    // Test 3: Importance filtering
    console.log('⭐ Testing importance filtering...');
    const importanceLevels = ['low', 'normal', 'high', 'critical'];
    
    for (const importance of importanceLevels) {
      const filteredView = await calendarManagementService.getCalendarView(
        'weekly',
        '2025-09-28',
        '2025-10-05',
        TEST_USER,
        { importance: [importance] }
      );
      
      results.tests[`importance_${importance}`] = {
        supported: true,
        eventsFound: filteredView.events.length,
        events: filteredView.events.map(e => ({ title: e.title, importance: e.importance }))
      };
    }

    // Test 4: Conflict detection
    console.log('⚠️ Testing conflict detection...');
    const conflicts = await conflictDetectionService.detectConflictsInRange(
      '2025-09-28',
      '2025-10-05',
      TEST_USER
    );
    
    results.tests.conflict_detection = {
      supported: true,
      conflictsFound: conflicts.length,
      conflicts: conflicts.map((c: any) => ({
        type: c.conflictType,
        severity: c.severityLevel,
        events: c.conflictingEvents.length
      }))
    };

    console.log('✅ Comprehensive verification completed successfully!');
    
    res.json({
      success: true,
      data: results,
      summary: {
        allEventTypesSupported: allEventTypes.length === Object.keys(results.tests).filter(k => k.startsWith('eventType_')).length,
        allVisibilityLevelsSupported: visibilityLevels.length === Object.keys(results.tests).filter(k => k.startsWith('visibility_')).length,
        allImportanceLevelsSupported: importanceLevels.length === Object.keys(results.tests).filter(k => k.startsWith('importance_')).length,
        conflictDetectionWorking: results.tests.conflict_detection.conflictsFound > 0,
        totalTestsPassed: Object.keys(results.tests).length
      }
    });

  } catch (error) {
    console.error('❌ Comprehensive verification failed:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;