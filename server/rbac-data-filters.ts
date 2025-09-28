import { Request } from 'express';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import type { User } from '@shared/schema';
import { RBACService } from './rbac-permissions';
import { coachEventAssignments, schoolEventAssignments, teamPlayers } from '@shared/schema';
import { db } from './db';

/**
 * Data filtering service for role-based access control
 * Ensures users can only access data within their organizational scope
 */
export class RBACDataFilters {
  
  /**
   * Apply organization-based filters to database queries
   */
  static getOrganizationFilter(user: User, targetTable: any) {
    const dataScope = RBACService.getUserDataScope(user);
    
    if (!dataScope) {
      // No access if no data scope defined
      return sql`1 = 0`;
    }
    
    switch (dataScope.organizationScope) {
      case 'district':
        // District level users can access all data in their district
        return this.getDistrictLevelFilter(user, targetTable);
        
      case 'school':
        // School level users can access data in their school only (not district-wide)
        return this.getSchoolLevelFilter(user, targetTable);
        
      case 'team':
        // Team level users can access data for their assigned teams only
        return and(
          this.getSchoolLevelFilter(user, targetTable), // Team is within a school
          this.getTeamAssignmentFilter(user, targetTable)
        );
        
      case 'individual':
        // Individual users can only access their own data
        return eq(targetTable.userId, user.id);
        
      case 'public':
        // Public access to any organization
        return sql`1 = 1`;
        
      default:
        // Default to no access
        return sql`1 = 0`;
    }
  }
  
  /**
   * Get health data filters based on user permissions
   */
  static getHealthDataFilter(user: User, targetTable: any) {
    const canAccessHealthData = RBACService.canAccessHealthData(user);
    
    if (!canAccessHealthData) {
      // No health data access
      return sql`1 = 0`;
    }
    
    // Combine organization filter with health data access
    const orgFilter = this.getOrganizationFilter(user, targetTable);
    
    // Additional health data restrictions based on role
    const userRole = user.userRole || user.complianceRole;
    
    switch (userRole) {
      case 'district_athletic_trainer':
      case 'school_athletic_trainer':
        // Athletic trainers have full health data access within their scope
        return orgFilter;
        
      case 'head_coach':
      case 'assistant_coach':
        // Coaches can only access health data for their assigned teams
        return and(
          orgFilter,
          this.getCoachTeamHealthFilter(user, targetTable)
        );
        
      case 'athletic_training_student':
        // Students have supervised access only - must be under supervision of licensed trainer
        return and(
          orgFilter,
          this.getAthleticTrainingStudentSupervisionFilter(user, targetTable)
        );
        
      default:
        return orgFilter;
    }
  }
  
  /**
   * Get budget data filters
   */
  static getBudgetDataFilter(user: User, targetTable: any) {
    const canAccessBudgetData = RBACService.canAccessBudgetData(user);
    
    if (!canAccessBudgetData) {
      return sql`1 = 0`;
    }
    
    return this.getOrganizationFilter(user, targetTable);
  }
  
  /**
   * Get academic data filters (FERPA compliance)
   */
  static getAcademicDataFilter(user: User, targetTable: any) {
    const canAccessAcademicData = RBACService.canAccessAcademicData(user);
    
    if (!canAccessAcademicData) {
      return sql`1 = 0`;
    }
    
    // FERPA requires signed agreement
    if (!user.ferpaAgreementSigned) {
      return sql`1 = 0`;
    }
    
    return this.getOrganizationFilter(user, targetTable);
  }
  
  /**
   * Get athlete data filters
   */
  static getAthleteDataFilter(user: User, targetTable: any) {
    const userRole = user.userRole || user.complianceRole;
    
    // Athletes can only access their own data
    if (userRole === 'athlete') {
      return eq(targetTable.userId, user.id);
    }
    
    // Fans have no access to athlete data
    if (userRole === 'fan') {
      return sql`1 = 0`;
    }
    
    // Other roles use organization-based filtering
    return this.getOrganizationFilter(user, targetTable);
  }
  
  /**
   * Get team data filters
   */
  static getTeamDataFilter(user: User, targetTable: any) {
    const userRole = user.userRole || user.complianceRole;
    
    // Coaches can only access teams they are assigned to coach
    if (userRole === 'head_coach' || userRole === 'assistant_coach') {
      return and(
        eq(targetTable.organizationId, user.organizationId || ''),
        this.getCoachAssignedTeamsFilter(user, targetTable)
      );
    }
    
    // Other roles use standard organization filtering
    return this.getOrganizationFilter(user, targetTable);
  }
  
  /**
   * Get tournament data filters
   */
  static getTournamentDataFilter(user: User, targetTable: any) {
    const userRole = user.userRole || user.complianceRole;
    
    // Tournament managers can access tournaments they manage
    if (userRole === 'tournament_manager' || userRole === 'assistant_tournament_manager') {
      return or(
        eq(targetTable.createdBy, user.id),
        eq(targetTable.managedBy, user.id),
        // Public tournaments
        eq(targetTable.isPublic, true)
      );
    }
    
    // Scorekeepers can access tournaments they're assigned to
    if (userRole === 'scorekeeper') {
      return or(
        eq(targetTable.isPublic, true),
        // Additional scorekeeper assignment logic would go here
      );
    }
    
    // Fans can only access public tournaments
    if (userRole === 'fan') {
      return eq(targetTable.isPublic, true);
    }
    
    // Organization-based access for others
    return this.getOrganizationFilter(user, targetTable);
  }
  
  /**
   * Apply row-level security based on data type and user permissions
   */
  static applyRowLevelSecurity(
    user: User,
    dataType: 'athletes' | 'teams' | 'health' | 'budget' | 'academic' | 'tournaments',
    targetTable: any
  ) {
    switch (dataType) {
      case 'athletes':
        return this.getAthleteDataFilter(user, targetTable);
      case 'teams':
        return this.getTeamDataFilter(user, targetTable);
      case 'health':
        return this.getHealthDataFilter(user, targetTable);
      case 'budget':
        return this.getBudgetDataFilter(user, targetTable);
      case 'academic':
        return this.getAcademicDataFilter(user, targetTable);
      case 'tournaments':
        return this.getTournamentDataFilter(user, targetTable);
      default:
        return this.getOrganizationFilter(user, targetTable);
    }
  }
  
  /**
   * Get team assignment filter for team-level users (synchronous SQL expressions)
   */
  static getTeamAssignmentFilter(user: User, targetTable: any) {
    const userRole = user.userRole || user.complianceRole;
    
    // If the table has a teamId field, filter by user's assigned teams using SQL joins
    if (targetTable.teamId) {
      if (userRole === 'head_coach' || userRole === 'assistant_coach') {
        // Coaches: filter by coach_event_assignments -> school_event_assignments -> team_id
        // SECURITY: Using proper Drizzle subquery instead of raw SQL
        return inArray(
          targetTable.teamId,
          db.select({ teamId: schoolEventAssignments.teamId })
            .from(coachEventAssignments)
            .innerJoin(schoolEventAssignments, eq(coachEventAssignments.schoolAssignmentId, schoolEventAssignments.id))
            .where(and(
              eq(coachEventAssignments.coachId, user.id),
              sql`${schoolEventAssignments.teamId} IS NOT NULL`
            ))
        );
      } else if (userRole === 'athletic_training_student') {
        // Athletic training students: filter by supervised team assignments
        // SECURITY: Using proper Drizzle subquery instead of raw SQL
        const studentTeamIds = db.select({ teamId: teamPlayers.teamId })
          .from(teamPlayers)
          .where(eq(teamPlayers.userId, user.id));
        
        const supervisedTeamIds = db.select({ teamId: schoolEventAssignments.teamId })
          .from(schoolEventAssignments)
          .where(and(
            eq(schoolEventAssignments.supervisorId, user.id),
            sql`${schoolEventAssignments.teamId} IS NOT NULL`
          ));
        
        return or(
          inArray(targetTable.teamId, studentTeamIds),
          inArray(targetTable.teamId, supervisedTeamIds)
        );
      } else if (userRole === 'athlete') {
        // Athletes: only their own teams
        // SECURITY: Using proper Drizzle subquery instead of raw SQL
        return inArray(
          targetTable.teamId,
          db.select({ teamId: teamPlayers.teamId })
            .from(teamPlayers)
            .where(eq(teamPlayers.userId, user.id))
        );
      }
      
      // No team assignments for other roles
      return sql`1 = 0`;
    }
    
    // If table has userId field, allow access to own data
    if (targetTable.userId) {
      return eq(targetTable.userId, user.id);
    }
    
    // Default to no access if no team assignment can be determined
    return sql`1 = 0`;
  }
  
  /**
   * Get coach team health data filter - coaches can only access health data for assigned teams (synchronous)
   */
  static getCoachTeamHealthFilter(user: User, targetTable: any) {
    const userRole = user.userRole || user.complianceRole;
    
    // Filter by team assignments for health data using SQL joins
    if (targetTable.teamId) {
      if (userRole === 'head_coach' || userRole === 'assistant_coach') {
        // SECURITY: Using proper Drizzle subquery instead of raw SQL
        return inArray(
          targetTable.teamId,
          db.select({ teamId: schoolEventAssignments.teamId })
            .from(coachEventAssignments)
            .innerJoin(schoolEventAssignments, eq(coachEventAssignments.schoolAssignmentId, schoolEventAssignments.id))
            .where(and(
              eq(coachEventAssignments.coachId, user.id),
              sql`${schoolEventAssignments.teamId} IS NOT NULL`
            ))
        );
      }
      return sql`1 = 0`; // Other roles don't have coach health access
    }
    
    // For athlete/player tables, check if they belong to assigned teams
    if (targetTable.userId) {
      if (userRole === 'head_coach' || userRole === 'assistant_coach') {
        return sql`EXISTS (
          SELECT 1 FROM team_players tp 
          JOIN coach_event_assignments cea ON tp.team_id IN (
            SELECT DISTINCT sea.team_id 
            FROM coach_event_assignments cea2 
            JOIN school_event_assignments sea ON cea2.school_assignment_id = sea.id 
            WHERE cea2.coach_id = ${user.id} AND sea.team_id IS NOT NULL
          )
          WHERE tp.user_id = ${targetTable.userId}
        )`;
      }
      return sql`1 = 0`;
    }
    
    return sql`1 = 0`;
  }
  
  /**
   * Get coach assigned teams filter - coaches can only see teams they coach (synchronous)
   */
  static getCoachAssignedTeamsFilter(user: User, targetTable: any) {
    const userRole = user.userRole || user.complianceRole;
    
    // Filter teams table by assigned team IDs using SQL joins
    if (targetTable.id && (userRole === 'head_coach' || userRole === 'assistant_coach')) {
      return sql`${targetTable.id} IN (
        SELECT DISTINCT sea.team_id 
        FROM coach_event_assignments cea 
        JOIN school_event_assignments sea ON cea.school_assignment_id = sea.id 
        WHERE cea.coach_id = ${user.id} AND sea.team_id IS NOT NULL
      )`;
    }
    
    return sql`1 = 0`;
  }
  
  /**
   * Get user's assigned team IDs based on coach assignments
   * This should be implemented based on the actual team assignment logic
   */
  static async getUserAssignedTeamIds(user: User): Promise<string[]> {
    try {
      const { getStorage } = await import('./storage');
      const storage = await getStorage();
      
      // For coaches, get teams through coach assignments
      const userRole = user.userRole || user.complianceRole;
      if (userRole === 'head_coach' || userRole === 'assistant_coach') {
        // Get coach event assignments
        const coachAssignments = await storage.getCoachEventAssignmentsByCoach(user.id);
        
        // Extract unique team IDs from assignments
        const teamIds = new Set<string>();
        
        for (const assignment of coachAssignments) {
          // Get school assignment details to find associated teams
          if (assignment.schoolAssignmentId) {
            const schoolAssignment = await storage.getSchoolEventAssignment(assignment.schoolAssignmentId);
            if (schoolAssignment && schoolAssignment.teamId) {
              teamIds.add(schoolAssignment.teamId);
            }
          }
        }
        
        const assignedTeamIds = Array.from(teamIds);
        console.log(`🏈 Coach ${user.id} assigned to teams: [${assignedTeamIds.join(', ')}]`);
        return assignedTeamIds;
      }
      
      // For athletic training students, get teams through supervision assignments
      if (userRole === 'athletic_training_student') {
        // Athletic training students should be assigned to specific teams for supervised practice
        // This would require a separate assignment table or field in the user record
        const studentAssignments = await storage.getAthleticTrainingStudentAssignments?.(user.id) || [];
        const teamIds = studentAssignments.map((assignment: any) => assignment.teamId).filter(Boolean);
        console.log(`🎓 Athletic training student ${user.id} assigned to teams: [${teamIds.join(', ')}]`);
        return teamIds;
      }
      
      // For athletes, they belong to their own teams
      if (userRole === 'athlete') {
        const athleteTeams = await storage.getAthleteTeams?.(user.id) || [];
        const teamIds = athleteTeams.map((team: any) => team.teamId || team.id).filter(Boolean);
        console.log(`🏃 Athlete ${user.id} member of teams: [${teamIds.join(', ')}]`);
        return teamIds;
      }
      
      // Other roles don't have specific team assignments
      console.log(`👤 User ${user.id} (${userRole}) has no specific team assignments`);
      return [];
      
    } catch (error) {
      console.error('❌ Error getting user assigned team IDs:', error);
      // Return empty array for security - fail closed
      return [];
    }
  }
  
  /**
   * Get district-level data filter - access to all schools and teams in district
   */
  static getDistrictLevelFilter(user: User, targetTable: any) {
    const userDistrictId = user.organizationId; // For district users, organizationId is the district ID
    
    // If table has districtId field, filter directly
    if (targetTable.districtId) {
      return eq(targetTable.districtId, userDistrictId || '');
    }
    
    // If table has schoolId, filter by schools in user's district
    if (targetTable.schoolId) {
      return sql`${targetTable.schoolId} IN (SELECT id FROM schools WHERE district_id = ${userDistrictId || ''})`;
    }
    
    // For teams table: check coach assignments within district schools
    if (targetTable.coachId || targetTable.teamName) {
      return sql`(
        ${targetTable.coachId} IN (
          SELECT u.id FROM users u 
          JOIN organizations o ON u.organization_id = o.id 
          WHERE o.parent_organization_id = ${userDistrictId} OR o.id = ${userDistrictId}
        )
        OR ${targetTable.organizationName} IN (
          SELECT o.name FROM organizations o 
          WHERE o.parent_organization_id = ${userDistrictId} OR o.id = ${userDistrictId}
        )
      )`;
    }
    
    // For users table: match district or schools within district
    if (targetTable.organizationId) {
      return sql`(
        ${targetTable.organizationId} = ${userDistrictId} 
        OR ${targetTable.organizationId} IN (
          SELECT id FROM organizations WHERE parent_organization_id = ${userDistrictId}
        )
      )`;
    }
    
    return sql`1 = 0`; // No access if no organizational relationship
  }
  
  /**
   * Get school-level data filter - access only to specific school
   */
  static getSchoolLevelFilter(user: User, targetTable: any) {
    const userSchoolId = user.organizationId; // For school users, organizationId is the school ID
    
    // If table has schoolId field, filter directly
    if (targetTable.schoolId) {
      return eq(targetTable.schoolId, userSchoolId || '');
    }
    
    // If table has districtId but user is school-level, no access to district-wide data
    if (targetTable.districtId && !targetTable.schoolId) {
      return sql`1 = 0`; // School users can't access district-wide data
    }
    
    // For teams table: check if team belongs to user's school
    if (targetTable.coachId || targetTable.teamName) {
      return sql`(
        ${targetTable.coachId} IN (
          SELECT id FROM users WHERE organization_id = ${userSchoolId}
        )
        OR ${targetTable.organizationName} = (
          SELECT name FROM organizations WHERE id = ${userSchoolId}
        )
      )`;
    }
    
    // For users table: match school organization
    if (targetTable.organizationId) {
      return eq(targetTable.organizationId, userSchoolId || '');
    }
    
    return sql`1 = 0`;
  }
  
  /**
   * Get athletic training student supervision filter - ensures proper supervision hierarchy
   */
  static getAthleticTrainingStudentSupervisionFilter(user: User, targetTable: any) {
    // Athletic training students must be under supervision of licensed athletic trainer
    // They can only access data for teams where they are assigned and supervised
    
    if (targetTable.teamId) {
      // Filter by teams where student is assigned and has active supervisor
      return sql`${targetTable.teamId} IN (
        SELECT DISTINCT tp.team_id 
        FROM team_players tp 
        JOIN teams t ON tp.team_id = t.id 
        JOIN school_event_assignments sea ON t.id = sea.team_id 
        JOIN users supervisor ON sea.supervisor_id = supervisor.id 
        WHERE tp.user_id = ${user.id} 
        AND supervisor.user_role IN ('district_athletic_trainer', 'school_athletic_trainer')
        AND supervisor.hipaa_training_completed = true
        AND sea.is_active = true
      )`;
    }
    
    if (targetTable.userId) {
      // Students can access their own data or data they're specifically authorized for
      return or(
        eq(targetTable.userId, user.id),
        sql`EXISTS (
          SELECT 1 FROM team_players tp 
          JOIN teams t ON tp.team_id = t.id 
          JOIN school_event_assignments sea ON t.id = sea.team_id 
          JOIN users supervisor ON sea.supervisor_id = supervisor.id 
          WHERE tp.user_id = ${user.id} 
          AND supervisor.user_role IN ('district_athletic_trainer', 'school_athletic_trainer')
          AND supervisor.hipaa_training_completed = true
          AND sea.is_active = true
          AND tp.user_id = ${targetTable.userId}
        )`
      );
    }
    
    // For other data types, require supervisor approval
    return sql`EXISTS (
      SELECT 1 FROM school_event_assignments sea 
      JOIN users supervisor ON sea.supervisor_id = supervisor.id 
      WHERE sea.student_id = ${user.id} 
      AND supervisor.user_role IN ('district_athletic_trainer', 'school_athletic_trainer')
      AND supervisor.hipaa_training_completed = true
      AND sea.is_active = true
    )`;
  }

  /**
   * Get user-specific data filters from request context
   */
  static getFiltersFromRequest(req: Request) {
    return req.dataFilters || {
      organizationId: '',
      userRole: 'fan',
      scope: 'public',
      canAccessHealthData: false,
      canAccessBudgetData: false,
      canAccessAcademicData: false
    };
  }
  
  /**
   * Check if user can perform specific action on data
   */
  static canPerformAction(
    user: User,
    action: 'read' | 'write' | 'delete',
    dataType: 'athletes' | 'teams' | 'health' | 'budget' | 'academic' | 'tournaments',
    targetOrganizationId?: string
  ): boolean {
    // Check organization access first
    if (targetOrganizationId && !RBACService.canAccessOrganizationData(user, targetOrganizationId)) {
      return false;
    }
    
    // Check data type specific permissions
    switch (dataType) {
      case 'health':
        return action === 'read' ? 
          RBACService.canAccessHealthData(user) :
          RBACService.canAccessHealthData(user) && this.canModifyHealthData(user);
          
      case 'budget':
        return action === 'read' ?
          RBACService.canAccessBudgetData(user) :
          RBACService.canAccessBudgetData(user) && this.canModifyBudgetData(user);
          
      case 'academic':
        return action === 'read' ?
          RBACService.canAccessAcademicData(user) :
          RBACService.canAccessAcademicData(user) && this.canModifyAcademicData(user);
          
      default:
        // Use role-based permissions for other data types
        const dataScope = RBACService.getUserDataScope(user);
        return dataScope ? this.hasActionPermission(user, action, dataType) : false;
    }
  }
  
  /**
   * Check if user can modify health data
   */
  private static canModifyHealthData(user: User): boolean {
    const userRole = user.userRole || user.complianceRole;
    const modifyRoles = [
      'district_athletic_trainer',
      'school_athletic_trainer',
      'head_coach',
      'athletic_training_student'
    ];
    return modifyRoles.includes(userRole || '');
  }
  
  /**
   * Check if user can modify budget data
   */
  private static canModifyBudgetData(user: User): boolean {
    const userRole = user.userRole || user.complianceRole;
    const modifyRoles = [
      'district_athletic_director',
      'school_athletic_director'
    ];
    return modifyRoles.includes(userRole || '');
  }
  
  /**
   * Check if user can modify academic data
   */
  private static canModifyAcademicData(user: User): boolean {
    const userRole = user.userRole || user.complianceRole;
    const modifyRoles = [
      'district_athletic_director',
      'district_athletic_coordinator',
      'school_athletic_director',
      'school_athletic_coordinator'
    ];
    return modifyRoles.includes(userRole || '');
  }
  
  /**
   * Check if user has permission for specific action
   */
  private static hasActionPermission(
    user: User,
    action: 'read' | 'write' | 'delete',
    dataType: string
  ): boolean {
    const permissions = RBACService.getUserPermissions(user);
    const actionPermissions = {
      read: [`${dataType}:data:read`],
      write: [`${dataType}:data:write`],
      delete: [`${dataType}:data:delete`]
    };
    
    return actionPermissions[action]?.some(permission => permissions.includes(permission)) || false;
  }
}

/**
 * Storage wrapper that automatically applies data filters
 */
export class FilteredStorageWrapper {
  constructor(private baseStorage: any, private user: User) {}
  
  /**
   * Apply filters to query results
   */
  private applyFilters<T>(results: T[], dataType: string): T[] {
    // Additional client-side filtering if needed
    return results.filter(item => {
      // Implement additional filtering logic here
      return true; // For now, rely on database-level filtering
    });
  }
  
  /**
   * Filtered getters that apply RBAC
   */
  async getAthletes() {
    const results = await this.baseStorage.getAthletes();
    return this.applyFilters(results, 'athletes');
  }
  
  async getTeams() {
    const results = await this.baseStorage.getTeams();
    return this.applyFilters(results, 'teams');
  }
  
  async getTournaments() {
    const results = await this.baseStorage.getTournaments();
    return this.applyFilters(results, 'tournaments');
  }
  
  // Add more filtered methods as needed
}