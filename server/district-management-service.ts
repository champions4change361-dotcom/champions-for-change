import { getStorage } from './storage';
import type { User, District, School, Organization, SchoolSportsProgram } from '@shared/schema';
import { RBACService } from './rbac-permissions';

/**
 * District Management Service
 * 
 * Core service for district-level administration and multi-school coordination.
 * Handles district policies, school oversight, performance monitoring, and coordination.
 */
export class DistrictManagementService {
  
  /**
   * Get comprehensive district overview with all schools and key metrics
   */
  static async getDistrictOverview(districtId: string, currentUser: User) {
    // Verify district admin permissions
    if (!RBACService.canAccessDistrictData(currentUser)) {
      throw new Error('Insufficient permissions for district data access');
    }
    
    if (!RBACService.canAccessOrganizationData(currentUser, districtId)) {
      throw new Error('Access denied to this district');
    }

    const storage = await getStorage();
    
    // Get district basic information
    const district = await storage.getDistrictById(districtId);
    if (!district) {
      throw new Error('District not found');
    }

    // Get all schools in the district
    const schools = await storage.getSchoolsByDistrictId(districtId);
    
    // Get school performance metrics
    const schoolMetrics = await Promise.all(
      schools.map(async (school) => {
        const athleticPrograms = await storage.getSchoolSportsProgramsBySchoolId(school.id);
        const totalEnrollment = school.totalEnrollment || 0;
        const athleticParticipation = school.athleticParticipation || 0;
        const participationRate = totalEnrollment > 0 ? (athleticParticipation / totalEnrollment) * 100 : 0;
        
        return {
          schoolId: school.id,
          schoolName: school.name,
          abbreviation: school.abbreviation,
          schoolType: school.schoolType,
          totalEnrollment,
          athleticParticipation,
          participationRate: Math.round(participationRate * 100) / 100,
          activeProgramCount: athleticPrograms.length,
          facilitiesCount: await storage.getAthleticVenuesBySchoolId(school.id).then(venues => venues.length),
          lastActivityDate: null // Will be populated from recent tournament/game data
        };
      })
    );

    // Calculate district-wide metrics
    const districtMetrics = {
      totalSchools: schools.length,
      totalStudents: schoolMetrics.reduce((sum, school) => sum + school.totalEnrollment, 0),
      totalAthletes: schoolMetrics.reduce((sum, school) => sum + school.athleticParticipation, 0),
      averageParticipationRate: schoolMetrics.length > 0 
        ? Math.round((schoolMetrics.reduce((sum, school) => sum + school.participationRate, 0) / schoolMetrics.length) * 100) / 100 
        : 0,
      totalPrograms: schoolMetrics.reduce((sum, school) => sum + school.activeProgramCount, 0),
      totalFacilities: schoolMetrics.reduce((sum, school) => sum + school.facilitiesCount, 0)
    };

    return {
      district,
      schools: schoolMetrics,
      districtMetrics,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Multi-school coordination features
   */
  static async getDistrictCoordinationData(districtId: string, currentUser: User) {
    if (!RBACService.canAccessDistrictData(currentUser)) {
      throw new Error('Insufficient permissions for district coordination data');
    }

    const storage = await getStorage();

    // Get inter-school activities and shared resources
    const schools = await storage.getSchoolsByDistrictId(districtId);
    const sharedEvents = await storage.getDistrictWideEvents(districtId);
    const resourceSharing = await this.getResourceSharingStatus(districtId);
    const upcomingMeetings = await this.getDistrictMeetings(districtId);

    return {
      schools: schools.map(school => ({
        id: school.id,
        name: school.name,
        abbreviation: school.abbreviation,
        athleticDirectorId: school.athleticDirectorId,
        principalName: school.principalName,
        contactInfo: {
          phone: school.phone,
          website: school.website
        }
      })),
      sharedEvents,
      resourceSharing,
      upcomingMeetings,
      coordinationChannels: await this.getCoordinationChannels(districtId)
    };
  }

  /**
   * District-wide policy management
   */
  static async getDistrictPolicies(districtId: string, currentUser: User) {
    if (!RBACService.canManageDistrictPolicies(currentUser)) {
      throw new Error('Insufficient permissions to access district policies');
    }

    const storage = await getStorage();
    
    // Mock policy data - in a real implementation, this would come from a policies table
    const policies = [
      {
        id: 'pol-001',
        category: 'athletics',
        title: 'Athletic Participation Requirements',
        description: 'GPA and attendance requirements for student athletes',
        status: 'active',
        effectiveDate: '2024-08-01',
        lastUpdated: '2024-07-15',
        updatedBy: currentUser.id,
        appliesToSchools: 'all',
        complianceDeadline: '2024-08-31'
      },
      {
        id: 'pol-002',
        category: 'safety',
        title: 'Concussion Protocol',
        description: 'Mandatory concussion testing and return-to-play protocols',
        status: 'active',
        effectiveDate: '2024-07-01',
        lastUpdated: '2024-06-20',
        updatedBy: currentUser.id,
        appliesToSchools: 'all',
        complianceDeadline: '2024-07-31'
      },
      {
        id: 'pol-003',
        category: 'financial',
        title: 'Budget Approval Workflow',
        description: 'Required approval process for purchases over $500',
        status: 'active',
        effectiveDate: '2024-09-01',
        lastUpdated: '2024-08-15',
        updatedBy: currentUser.id,
        appliesToSchools: 'all',
        complianceDeadline: '2024-09-15'
      }
    ];

    // Get compliance status for each policy across all schools
    const schools = await storage.getSchoolsByDistrictId(districtId);
    const complianceStatus = await Promise.all(
      policies.map(async (policy) => {
        const schoolCompliance = await Promise.all(
          schools.map(async (school) => {
            // Mock compliance checking - in real implementation, check against actual compliance records
            const isCompliant = Math.random() > 0.2; // 80% compliance rate simulation
            return {
              schoolId: school.id,
              schoolName: school.name,
              isCompliant,
              lastChecked: new Date().toISOString(),
              notes: isCompliant ? 'Fully compliant' : 'Requires attention'
            };
          })
        );

        const compliantCount = schoolCompliance.filter(s => s.isCompliant).length;
        
        return {
          policyId: policy.id,
          title: policy.title,
          overallCompliance: Math.round((compliantCount / schools.length) * 100),
          schoolCompliance
        };
      })
    );

    return {
      policies,
      complianceStatus,
      totalPolicies: policies.length,
      averageCompliance: Math.round(
        complianceStatus.reduce((sum, p) => sum + p.overallCompliance, 0) / complianceStatus.length
      )
    };
  }

  /**
   * School performance monitoring and benchmarking
   */
  static async getSchoolPerformanceMetrics(districtId: string, currentUser: User) {
    if (!RBACService.canAccessDistrictData(currentUser)) {
      throw new Error('Insufficient permissions for school performance data');
    }

    const storage = await getStorage();
    const schools = await storage.getSchoolsByDistrictId(districtId);

    const performanceData = await Promise.all(
      schools.map(async (school) => {
        // Get comprehensive performance metrics for each school
        const athleticPrograms = await storage.getSchoolSportsProgramsBySchoolId(school.id);
        const venues = await storage.getAthleticVenuesBySchoolId(school.id);
        
        // Mock performance data - in real implementation, calculate from actual data
        const mockWinRate = 0.6 + (Math.random() * 0.3); // 60-90% win rate range
        const mockParticipationGrowth = -10 + (Math.random() * 30); // -10% to +20% growth
        
        return {
          schoolId: school.id,
          schoolName: school.name,
          schoolType: school.schoolType,
          enrollment: school.totalEnrollment || 0,
          athleticParticipation: school.athleticParticipation || 0,
          participationRate: school.totalEnrollment ? 
            Math.round((school.athleticParticipation || 0) / school.totalEnrollment * 100 * 100) / 100 : 0,
          activeProgramCount: athleticPrograms.length,
          facilityCount: venues.length,
          performance: {
            winRate: Math.round(mockWinRate * 100),
            participationGrowthRate: Math.round(mockParticipationGrowth * 100) / 100,
            budgetUtilization: 75 + Math.round(Math.random() * 20), // 75-95%
            complianceScore: 85 + Math.round(Math.random() * 15), // 85-100%
            safetyIncidents: Math.floor(Math.random() * 3), // 0-2 incidents
            lastAuditScore: 90 + Math.round(Math.random() * 10) // 90-100%
          },
          programs: athleticPrograms.map(program => ({
            id: program.id,
            sport: program.sport,
            season: program.season,
            level: program.level,
            isActive: program.isActive
          })),
          lastUpdated: new Date().toISOString()
        };
      })
    );

    // Calculate district benchmarks
    const benchmarks = {
      averageParticipationRate: performanceData.reduce((sum, school) => sum + school.participationRate, 0) / performanceData.length,
      averageWinRate: performanceData.reduce((sum, school) => sum + school.performance.winRate, 0) / performanceData.length,
      averageComplianceScore: performanceData.reduce((sum, school) => sum + school.performance.complianceScore, 0) / performanceData.length,
      totalSafetyIncidents: performanceData.reduce((sum, school) => sum + school.performance.safetyIncidents, 0),
      programDiversity: Math.round(performanceData.reduce((sum, school) => sum + school.activeProgramCount, 0) / performanceData.length)
    };

    return {
      schools: performanceData,
      benchmarks,
      rankings: {
        byParticipation: [...performanceData].sort((a, b) => b.participationRate - a.participationRate),
        byPerformance: [...performanceData].sort((a, b) => b.performance.winRate - a.performance.winRate),
        byCompliance: [...performanceData].sort((a, b) => b.performance.complianceScore - a.performance.complianceScore)
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * District-wide event coordination and scheduling
   */
  static async getDistrictEventCoordination(districtId: string, currentUser: User) {
    if (!RBACService.canAccessDistrictData(currentUser)) {
      throw new Error('Insufficient permissions for district event coordination');
    }

    const storage = await getStorage();

    // Mock district-wide events - in real implementation, query from actual events tables
    const districtEvents = [
      {
        id: 'event-001',
        title: 'District Athletic Directors Meeting',
        type: 'meeting',
        date: '2024-10-15',
        time: '2:00 PM',
        location: 'District Administration Building',
        involvedSchools: 'all',
        organizer: 'District Athletic Director',
        status: 'scheduled',
        agenda: ['Budget review', 'Safety protocols', 'Scheduling conflicts']
      },
      {
        id: 'event-002',
        title: 'District Swimming Championships',
        type: 'tournament',
        date: '2024-11-02',
        time: '9:00 AM',
        location: 'CCISD Aquatic Center',
        involvedSchools: ['school-001', 'school-002', 'school-003'],
        organizer: 'District Aquatic Coordinator',
        status: 'confirmed',
        registrationDeadline: '2024-10-25'
      },
      {
        id: 'event-003',
        title: 'Safety Training Workshop',
        type: 'training',
        date: '2024-10-22',
        time: '4:00 PM',
        location: 'Virtual Meeting',
        involvedSchools: 'all',
        organizer: 'District Safety Coordinator',
        status: 'scheduled',
        mandatory: true
      }
    ];

    // Get scheduling conflicts and resource allocation
    const schedulingConflicts = await this.detectSchedulingConflicts(districtId);
    const resourceAllocation = await this.getResourceAllocation(districtId);

    return {
      upcomingEvents: districtEvents,
      schedulingConflicts,
      resourceAllocation,
      coordinationMetrics: {
        totalEvents: districtEvents.length,
        conflictsDetected: schedulingConflicts.length,
        resourceUtilization: 78, // Mock percentage
        schoolParticipation: 95 // Mock percentage
      }
    };
  }

  // Helper methods for district coordination
  private static async getResourceSharingStatus(districtId: string) {
    // Mock resource sharing data
    return {
      sharedFacilities: [
        { facilityName: 'District Pool', utilizationRate: 85, availableSlots: 12 },
        { facilityName: 'District Stadium', utilizationRate: 92, availableSlots: 3 }
      ],
      sharedEquipment: [
        { equipmentType: 'Timing Systems', available: 8, total: 10 },
        { equipmentType: 'Sound Systems', available: 5, total: 8 }
      ],
      transportationCoordination: {
        busesAvailable: 15,
        routesOptimized: 23,
        costSavings: 12500
      }
    };
  }

  private static async getDistrictMeetings(districtId: string) {
    // Mock meeting data
    return [
      {
        id: 'meet-001',
        title: 'Monthly AD Meeting',
        date: '2024-10-15',
        attendees: ['AD-001', 'AD-002', 'AD-003'],
        agenda: ['Budget updates', 'Policy changes'],
        type: 'monthly'
      }
    ];
  }

  private static async getCoordinationChannels(districtId: string) {
    // Mock coordination channels
    return {
      messagingChannels: ['athletic-directors', 'coaches', 'trainers'],
      announcementBoards: ['district-news', 'safety-alerts'],
      sharedCalendars: ['district-events', 'facility-bookings']
    };
  }

  private static async detectSchedulingConflicts(districtId: string) {
    // Mock conflict detection
    return [
      {
        conflictId: 'conf-001',
        type: 'facility_conflict',
        description: 'Two events scheduled at Roy Miller Stadium on same date',
        date: '2024-10-20',
        affectedEvents: ['game-001', 'game-002'],
        severity: 'high',
        suggestedResolution: 'Reschedule one game to backup venue'
      }
    ];
  }

  private static async getResourceAllocation(districtId: string) {
    // Mock resource allocation
    return {
      officials: { allocated: 45, available: 8, needed: 12 },
      transportation: { allocated: 20, available: 5, needed: 8 },
      facilities: { allocated: 35, available: 10, needed: 5 }
    };
  }
}