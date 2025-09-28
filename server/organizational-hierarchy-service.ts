import { getStorage } from './storage';
import type { User, District, School, Organization } from '@shared/schema';
import { RBACService } from './rbac-permissions';

/**
 * Organizational Hierarchy Service
 * 
 * Manages district organizational structure, role hierarchies, position assignments,
 * and organizational analytics for comprehensive district oversight.
 */
export class OrganizationalHierarchyService {

  /**
   * Get complete organizational hierarchy for a district
   */
  static async getDistrictOrganizationalHierarchy(districtId: string, currentUser: User) {
    // Verify organizational data access permissions
    if (!RBACService.canAccessDistrictData(currentUser)) {
      throw new Error('Insufficient permissions for organizational data access');
    }
    
    if (!RBACService.canAccessOrganizationData(currentUser, districtId)) {
      throw new Error('Access denied to this district organization data');
    }

    const storage = await getStorage();
    
    // Get district information
    const district = await storage.getDistrictById(districtId);
    if (!district) {
      throw new Error('District not found');
    }

    // Get all schools in the district
    const schools = await storage.getSchoolsByDistrictId(districtId);
    
    // Build comprehensive organizational hierarchy
    const hierarchy = await this.buildOrganizationalHierarchy(district, schools);
    
    // Get position analytics
    const positionAnalytics = await this.getPositionAnalytics(districtId);
    
    // Get organizational metrics
    const orgMetrics = await this.getOrganizationalMetrics(districtId, schools);

    return {
      hierarchy,
      positionAnalytics,
      orgMetrics,
      districtInfo: {
        id: district.id,
        name: district.name,
        abbreviation: district.abbreviation,
        totalSchools: schools.length,
        superintendentName: district.superintendentName,
        athleticDirectorId: district.athleticDirectorId,
        headAthleticTrainerId: district.headAthleticTrainerId
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Build detailed organizational hierarchy tree
   */
  private static async buildOrganizationalHierarchy(district: District, schools: School[]) {
    const storage = await getStorage();

    // District level hierarchy
    const districtLevel = {
      id: district.id,
      name: district.name,
      type: 'district',
      level: 0,
      positions: await this.getDistrictPositions(district),
      children: []
    };

    // School level hierarchy
    for (const school of schools) {
      const schoolLevel = {
        id: school.id,
        name: school.name,
        type: 'school',
        level: 1,
        schoolType: school.schoolType,
        enrollment: school.totalEnrollment,
        positions: await this.getSchoolPositions(school),
        children: await this.getSchoolDepartments(school.id)
      };

      districtLevel.children.push(schoolLevel);
    }

    return districtLevel;
  }

  /**
   * Get district-level positions and leadership
   */
  private static async getDistrictPositions(district: District) {
    const storage = await getStorage();
    
    const positions = [
      {
        title: 'Superintendent',
        employeeName: district.superintendentName || 'Vacant',
        employeeId: null,
        department: 'administration',
        isKeyPosition: true,
        reportsTo: null
      }
    ];

    // Get athletic director information if assigned
    if (district.athleticDirectorId) {
      const athleticDirector = await storage.getUser(district.athleticDirectorId);
      if (athleticDirector) {
        positions.push({
          title: 'District Athletic Director',
          employeeName: `${athleticDirector.firstName} ${athleticDirector.lastName}`,
          employeeId: athleticDirector.id,
          department: 'athletics',
          isKeyPosition: true,
          reportsTo: 'Superintendent'
        });
      }
    }

    // Get head athletic trainer information if assigned
    if (district.headAthleticTrainerId) {
      const headTrainer = await storage.getUser(district.headAthleticTrainerId);
      if (headTrainer) {
        positions.push({
          title: 'District Head Athletic Trainer',
          employeeName: `${headTrainer.firstName} ${headTrainer.lastName}`,
          employeeId: headTrainer.id,
          department: 'athletics',
          isKeyPosition: true,
          reportsTo: 'District Athletic Director'
        });
      }
    }

    return positions;
  }

  /**
   * Get school-level positions and leadership
   */
  private static async getSchoolPositions(school: School) {
    const storage = await getStorage();
    
    const positions = [];

    // Principal
    if (school.principalName) {
      positions.push({
        title: 'Principal',
        employeeName: school.principalName,
        employeeId: school.principalId || null,
        department: 'administration',
        isKeyPosition: true,
        reportsTo: 'Superintendent'
      });
    }

    // Athletic Director
    if (school.athleticDirectorId) {
      const athleticDirector = await storage.getUser(school.athleticDirectorId);
      if (athleticDirector) {
        positions.push({
          title: 'School Athletic Director',
          employeeName: `${athleticDirector.firstName} ${athleticDirector.lastName}`,
          employeeId: athleticDirector.id,
          department: 'athletics',
          isKeyPosition: true,
          reportsTo: 'Principal'
        });
      }
    }

    // Athletic Trainer
    if (school.athleticTrainerId) {
      const athleticTrainer = await storage.getUser(school.athleticTrainerId);
      if (athleticTrainer) {
        positions.push({
          title: 'School Athletic Trainer',
          employeeName: `${athleticTrainer.firstName} ${athleticTrainer.lastName}`,
          employeeId: athleticTrainer.id,
          department: 'athletics',
          isKeyPosition: true,
          reportsTo: 'School Athletic Director'
        });
      }
    }

    return positions;
  }

  /**
   * Get school departments and their structure
   */
  private static async getSchoolDepartments(schoolId: string) {
    const storage = await getStorage();
    
    // Get sports programs as departments
    const sportsPrograms = await storage.getSchoolSportsProgramsBySchoolId(schoolId);
    
    const departments = [
      {
        id: `athletics-${schoolId}`,
        name: 'Athletics Department',
        type: 'department',
        level: 2,
        positions: await this.getAthleticDepartmentPositions(schoolId, sportsPrograms),
        children: sportsPrograms.map(program => ({
          id: program.id,
          name: `${program.sport} ${program.level}`,
          type: 'program',
          level: 3,
          sport: program.sport,
          season: program.season,
          level: program.level,
          positions: this.getSportProgramPositions(program),
          children: []
        }))
      }
    ];

    return departments;
  }

  /**
   * Get athletic department positions
   */
  private static async getAthleticDepartmentPositions(schoolId: string, sportsPrograms: any[]) {
    // Get unique coaching positions from sports programs
    const coachingPositions = sportsPrograms.map(program => ({
      title: `${program.sport} ${program.level} Head Coach`,
      employeeName: program.headCoachId ? 'Coach Name' : 'Vacant', // Would get from actual coach data
      employeeId: program.headCoachId,
      department: 'athletics',
      sport: program.sport,
      level: program.level,
      isKeyPosition: true,
      reportsTo: 'School Athletic Director'
    }));

    return coachingPositions;
  }

  /**
   * Get sport program specific positions
   */
  private static getSportProgramPositions(program: any) {
    const positions = [];

    if (program.headCoachId) {
      positions.push({
        title: 'Head Coach',
        employeeId: program.headCoachId,
        department: 'athletics',
        sport: program.sport,
        level: program.level,
        isKeyPosition: true,
        reportsTo: 'School Athletic Director'
      });
    }

    // Assistant coaches (mock data - in real implementation, get from actual data)
    const assistantCoachCount = Math.floor(Math.random() * 3) + 1; // 1-3 assistants
    for (let i = 1; i <= assistantCoachCount; i++) {
      positions.push({
        title: `Assistant Coach ${i}`,
        employeeId: null,
        department: 'athletics',
        sport: program.sport,
        level: program.level,
        isKeyPosition: false,
        reportsTo: 'Head Coach'
      });
    }

    return positions;
  }

  /**
   * Get position analytics and insights
   */
  private static async getPositionAnalytics(districtId: string) {
    const storage = await getStorage();
    const schools = await storage.getSchoolsByDistrictId(districtId);
    
    // Calculate position metrics
    let totalPositions = 0;
    let filledPositions = 0;
    let keyPositions = 0;
    let filledKeyPositions = 0;
    
    const positionsByDepartment = {
      administration: { total: 0, filled: 0 },
      athletics: { total: 0, filled: 0 },
      academics: { total: 0, filled: 0 }
    };

    // Count district positions
    const districtPositions = 3; // Superintendent, Athletic Director, Head Trainer
    totalPositions += districtPositions;
    keyPositions += districtPositions;
    
    // Mock filled district positions
    filledPositions += 2; // Assume some are filled
    filledKeyPositions += 2;

    // Count school positions
    for (const school of schools) {
      const schoolPositions = 3; // Principal, Athletic Director, Athletic Trainer
      const filledSchoolPositions = Math.floor(Math.random() * 3) + 1; // Random filled
      
      totalPositions += schoolPositions;
      filledPositions += filledSchoolPositions;
      keyPositions += schoolPositions;
      filledKeyPositions += Math.min(filledSchoolPositions, schoolPositions);

      // Get sports programs and count coaching positions
      const sportsPrograms = await storage.getSchoolSportsProgramsBySchoolId(school.id);
      for (const program of sportsPrograms) {
        const coachingPositions = 3; // Head coach + 2 assistants (average)
        const filledCoaching = Math.floor(Math.random() * 3) + 1;
        
        totalPositions += coachingPositions;
        filledPositions += filledCoaching;
        positionsByDepartment.athletics.total += coachingPositions;
        positionsByDepartment.athletics.filled += filledCoaching;
        
        if (program.headCoachId) {
          keyPositions += 1;
          filledKeyPositions += 1;
        }
      }
    }

    const fillRate = totalPositions > 0 ? Math.round((filledPositions / totalPositions) * 100) : 0;
    const keyPositionFillRate = keyPositions > 0 ? Math.round((filledKeyPositions / keyPositions) * 100) : 0;

    return {
      summary: {
        totalPositions,
        filledPositions,
        vacantPositions: totalPositions - filledPositions,
        fillRate,
        keyPositions,
        filledKeyPositions,
        keyPositionFillRate
      },
      byDepartment: positionsByDepartment,
      trends: {
        newHires: Math.floor(Math.random() * 10) + 5, // Mock data
        separations: Math.floor(Math.random() * 5) + 1,
        promotions: Math.floor(Math.random() * 3) + 1,
        transfers: Math.floor(Math.random() * 4) + 1
      }
    };
  }

  /**
   * Get organizational metrics and KPIs
   */
  private static async getOrganizationalMetrics(districtId: string, schools: School[]) {
    const storage = await getStorage();
    
    // Calculate span of control metrics
    const averageSchoolSize = schools.reduce((sum, school) => sum + (school.totalEnrollment || 0), 0) / schools.length;
    const totalEnrollment = schools.reduce((sum, school) => sum + (school.totalEnrollment || 0), 0);
    const totalAthletes = schools.reduce((sum, school) => sum + (school.athleticParticipation || 0), 0);
    
    // Get program distribution
    const programCounts = await Promise.all(
      schools.map(async (school) => {
        const programs = await storage.getSchoolSportsProgramsBySchoolId(school.id);
        return programs.length;
      })
    );
    
    const totalPrograms = programCounts.reduce((sum, count) => sum + count, 0);
    const averageProgramsPerSchool = Math.round((totalPrograms / schools.length) * 100) / 100;

    // Organizational efficiency metrics
    const metrics = {
      enrollment: {
        total: totalEnrollment,
        averagePerSchool: Math.round(averageSchoolSize),
        athleticParticipation: totalAthletes,
        participationRate: totalEnrollment > 0 ? Math.round((totalAthletes / totalEnrollment) * 100 * 100) / 100 : 0
      },
      structure: {
        totalSchools: schools.length,
        schoolTypes: this.getSchoolTypeDistribution(schools),
        totalPrograms,
        averageProgramsPerSchool,
        programDistribution: this.getProgramDistribution(schools, programCounts)
      },
      efficiency: {
        studentsPerAdministrator: Math.round(totalEnrollment / (schools.length * 2)), // Principal + AD per school
        athletesPerTrainer: Math.round(totalAthletes / schools.length), // Assuming one trainer per school
        programsPerDirector: Math.round(totalPrograms / schools.length),
        spanOfControl: this.calculateSpanOfControl(schools, totalPrograms)
      },
      geographic: {
        schoolDistribution: this.getGeographicDistribution(schools),
        averageDistance: 'N/A', // Would calculate from actual coordinates
        transportationZones: this.getTransportationZones(schools)
      }
    };

    return metrics;
  }

  /**
   * Role hierarchy visualization and management
   */
  static async getRoleHierarchyVisualization(districtId: string, currentUser: User) {
    if (!RBACService.canAccessDistrictData(currentUser)) {
      throw new Error('Insufficient permissions for role hierarchy data');
    }

    const storage = await getStorage();
    
    // Build role hierarchy structure
    const roleHierarchy = {
      districtLevel: {
        'district_athletic_director': {
          title: 'District Athletic Director',
          level: 1,
          reportsTo: 'superintendent',
          manages: ['school_athletic_director'],
          permissions: RBACService.getRolePermissions('district_athletic_director'),
          responsibilities: [
            'District-wide athletic program oversight',
            'Budget allocation and management',
            'Policy development and enforcement',
            'School performance monitoring'
          ]
        },
        'district_athletic_trainer': {
          title: 'District Athletic Trainer',
          level: 1,
          reportsTo: 'district_athletic_director',
          manages: ['school_athletic_trainer'],
          permissions: RBACService.getRolePermissions('district_athletic_trainer'),
          responsibilities: [
            'District health and safety protocols',
            'Training program coordination',
            'Medical emergency response',
            'Compliance monitoring'
          ]
        }
      },
      schoolLevel: {
        'school_athletic_director': {
          title: 'School Athletic Director',
          level: 2,
          reportsTo: 'district_athletic_director',
          manages: ['head_coach', 'school_athletic_trainer'],
          permissions: RBACService.getRolePermissions('school_athletic_director'),
          responsibilities: [
            'School athletic program management',
            'Coach supervision and evaluation',
            'Facility management',
            'Student eligibility oversight'
          ]
        },
        'school_athletic_trainer': {
          title: 'School Athletic Trainer',
          level: 2,
          reportsTo: 'school_athletic_director',
          manages: ['athletic_training_student'],
          permissions: RBACService.getRolePermissions('school_athletic_trainer'),
          responsibilities: [
            'Student athlete health care',
            'Injury prevention and treatment',
            'Return-to-play protocols',
            'Medical record management'
          ]
        }
      },
      teamLevel: {
        'head_coach': {
          title: 'Head Coach',
          level: 3,
          reportsTo: 'school_athletic_director',
          manages: ['assistant_coach'],
          permissions: RBACService.getRolePermissions('head_coach'),
          responsibilities: [
            'Team management and strategy',
            'Player development',
            'Practice and game planning',
            'Academic monitoring'
          ]
        },
        'assistant_coach': {
          title: 'Assistant Coach',
          level: 4,
          reportsTo: 'head_coach',
          manages: [],
          permissions: RBACService.getRolePermissions('assistant_coach'),
          responsibilities: [
            'Assist with team activities',
            'Specialized skill training',
            'Equipment management',
            'Player supervision'
          ]
        }
      }
    };

    // Get current role assignments
    const roleAssignments = await this.getCurrentRoleAssignments(districtId);

    // Calculate role distribution
    const roleDistribution = this.calculateRoleDistribution(roleAssignments);

    return {
      hierarchy: roleHierarchy,
      assignments: roleAssignments,
      distribution: roleDistribution,
      recommendations: await this.generateRoleRecommendations(districtId, roleAssignments)
    };
  }

  /**
   * Position management and assignments
   */
  static async managePosition(action: 'create' | 'update' | 'assign' | 'remove', positionData: PositionManagementData, currentUser: User) {
    if (!RBACService.canManagePositions(currentUser)) {
      throw new Error('Insufficient permissions for position management');
    }

    const storage = await getStorage();
    
    switch (action) {
      case 'create':
        return await this.createPosition(positionData, currentUser);
      case 'update':
        return await this.updatePosition(positionData, currentUser);
      case 'assign':
        return await this.assignPosition(positionData, currentUser);
      case 'remove':
        return await this.removePosition(positionData, currentUser);
      default:
        throw new Error('Invalid position management action');
    }
  }

  /**
   * Directory and contact management
   */
  static async getDistrictDirectory(districtId: string, currentUser: User) {
    if (!RBACService.canAccessDistrictData(currentUser)) {
      throw new Error('Insufficient permissions for district directory');
    }

    const storage = await getStorage();
    const schools = await storage.getSchoolsByDistrictId(districtId);
    
    const directory = {
      district: await this.getDistrictContacts(districtId),
      schools: await Promise.all(
        schools.map(async (school) => ({
          schoolId: school.id,
          schoolName: school.name,
          contacts: await this.getSchoolContacts(school.id)
        }))
      ),
      emergencyContacts: await this.getEmergencyContacts(districtId),
      lastUpdated: new Date().toISOString()
    };

    return directory;
  }

  // Helper methods for organizational management
  private static getSchoolTypeDistribution(schools: School[]) {
    const distribution = schools.reduce((acc, school) => {
      acc[school.schoolType] = (acc[school.schoolType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return distribution;
  }

  private static getProgramDistribution(schools: School[], programCounts: number[]) {
    const distribution = schools.map((school, index) => ({
      schoolId: school.id,
      schoolName: school.name,
      schoolType: school.schoolType,
      programCount: programCounts[index]
    }));
    
    return distribution;
  }

  private static calculateSpanOfControl(schools: School[], totalPrograms: number) {
    // Calculate average span of control metrics
    return {
      schoolsPerDistrictAdmin: schools.length,
      programsPerSchoolAdmin: Math.round((totalPrograms / schools.length) * 100) / 100,
      averageEnrollmentPerSchool: schools.reduce((sum, school) => sum + (school.totalEnrollment || 0), 0) / schools.length
    };
  }

  private static getGeographicDistribution(schools: School[]) {
    // Group schools by city/region
    const distribution = schools.reduce((acc, school) => {
      const key = school.city || 'Unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return distribution;
  }

  private static getTransportationZones(schools: School[]) {
    // Mock transportation zones based on school locations
    return schools.map(school => ({
      schoolId: school.id,
      schoolName: school.name,
      zone: `Zone ${school.city?.charAt(0) || 'A'}`,
      city: school.city
    }));
  }

  private static async getCurrentRoleAssignments(districtId: string) {
    // Mock role assignments - in real implementation, query from users table
    return [
      { role: 'district_athletic_director', count: 1, filled: 1 },
      { role: 'district_athletic_trainer', count: 1, filled: 1 },
      { role: 'school_athletic_director', count: 5, filled: 4 },
      { role: 'school_athletic_trainer', count: 5, filled: 3 },
      { role: 'head_coach', count: 45, filled: 40 },
      { role: 'assistant_coach', count: 90, filled: 75 }
    ];
  }

  private static calculateRoleDistribution(assignments: any[]) {
    const totalPositions = assignments.reduce((sum, a) => sum + a.count, 0);
    const totalFilled = assignments.reduce((sum, a) => sum + a.filled, 0);
    
    return {
      totalPositions,
      totalFilled,
      overallFillRate: Math.round((totalFilled / totalPositions) * 100),
      byLevel: {
        district: assignments.filter(a => a.role.includes('district')),
        school: assignments.filter(a => a.role.includes('school')),
        team: assignments.filter(a => ['head_coach', 'assistant_coach'].includes(a.role))
      }
    };
  }

  private static async generateRoleRecommendations(districtId: string, assignments: any[]) {
    const recommendations = [];
    
    // Identify understaffed areas
    const understaffed = assignments.filter(a => (a.filled / a.count) < 0.8);
    understaffed.forEach(role => {
      recommendations.push({
        type: 'staffing',
        priority: 'high',
        message: `${role.role} positions are understaffed (${role.filled}/${role.count} filled)`,
        action: 'Prioritize recruitment for this role'
      });
    });

    // Suggest organizational improvements
    if (assignments.find(a => a.role === 'assistant_coach')?.filled < 60) {
      recommendations.push({
        type: 'structure',
        priority: 'medium',
        message: 'Consider assistant coach development program',
        action: 'Implement mentorship and training initiatives'
      });
    }

    return recommendations;
  }

  private static async createPosition(positionData: PositionManagementData, currentUser: User) {
    // Implementation for creating new positions
    return { success: true, positionId: 'new-position-id' };
  }

  private static async updatePosition(positionData: PositionManagementData, currentUser: User) {
    // Implementation for updating positions
    return { success: true, positionId: positionData.id };
  }

  private static async assignPosition(positionData: PositionManagementData, currentUser: User) {
    // Implementation for assigning users to positions
    return { success: true, assignmentId: 'new-assignment-id' };
  }

  private static async removePosition(positionData: PositionManagementData, currentUser: User) {
    // Implementation for removing positions
    return { success: true, removed: positionData.id };
  }

  private static async getDistrictContacts(districtId: string) {
    // Mock district contacts - in real implementation, query from users/contacts
    return [
      {
        name: 'Dr. John Smith',
        title: 'Superintendent',
        email: 'superintendent@district.edu',
        phone: '(555) 123-4567',
        department: 'Administration'
      },
      {
        name: 'Mike Johnson',
        title: 'District Athletic Director',
        email: 'athletics@district.edu',
        phone: '(555) 123-4568',
        department: 'Athletics'
      }
    ];
  }

  private static async getSchoolContacts(schoolId: string) {
    // Mock school contacts - in real implementation, query from users
    return [
      {
        name: 'Jane Doe',
        title: 'Principal',
        email: 'principal@school.edu',
        phone: '(555) 123-4569',
        department: 'Administration'
      },
      {
        name: 'Bob Wilson',
        title: 'Athletic Director',
        email: 'athletics@school.edu',
        phone: '(555) 123-4570',
        department: 'Athletics'
      }
    ];
  }

  private static async getEmergencyContacts(districtId: string) {
    // Mock emergency contacts
    return [
      {
        type: 'Medical Emergency',
        contact: 'District Nurse',
        phone: '(555) 911-0001',
        availability: '24/7'
      },
      {
        type: 'Safety Emergency',
        contact: 'Security Office',
        phone: '(555) 911-0002',
        availability: 'Business Hours'
      }
    ];
  }
}

// Type definitions for position management
export interface PositionManagementData {
  id?: string;
  title: string;
  department: string;
  level: number;
  reportsTo?: string;
  assignedUserId?: string;
  schoolId?: string;
  districtId: string;
  responsibilities?: string[];
  requirements?: string[];
}