import type { User } from "@shared/schema";

// Define all possible permissions in the system
export const PERMISSIONS = {
  // District Level Data Access
  DISTRICT_DATA_READ: 'district:data:read',
  DISTRICT_DATA_WRITE: 'district:data:write',
  DISTRICT_DATA_DELETE: 'district:data:delete',
  
  // School Level Data Access
  SCHOOL_DATA_READ: 'school:data:read',
  SCHOOL_DATA_WRITE: 'school:data:write',
  SCHOOL_DATA_DELETE: 'school:data:delete',
  
  // Team Level Data Access
  TEAM_DATA_READ: 'team:data:read',
  TEAM_DATA_WRITE: 'team:data:write',
  TEAM_DATA_DELETE: 'team:data:delete',
  
  // Athlete Data Access
  ATHLETE_DATA_READ: 'athlete:data:read',
  ATHLETE_DATA_WRITE: 'athlete:data:write',
  ATHLETE_DATA_DELETE: 'athlete:data:delete',
  
  // Health/Medical Data Access (PHI - Protected Health Information)
  HEALTH_DATA_READ: 'health:data:read',
  HEALTH_DATA_WRITE: 'health:data:write',
  HEALTH_DATA_DELETE: 'health:data:delete',
  HEALTH_DATA_EMERGENCY: 'health:data:emergency', // Emergency access override
  
  // Financial/Budget Data Access
  BUDGET_DATA_READ: 'budget:data:read',
  BUDGET_DATA_WRITE: 'budget:data:write',
  BUDGET_DATA_DELETE: 'budget:data:delete',
  
  // Academic Data Access (FERPA Protected)
  ACADEMIC_DATA_READ: 'academic:data:read',
  ACADEMIC_DATA_WRITE: 'academic:data:write',
  ACADEMIC_DATA_DELETE: 'academic:data:delete',
  
  // Tournament Management
  TOURNAMENT_CREATE: 'tournament:create',
  TOURNAMENT_MANAGE: 'tournament:manage',
  TOURNAMENT_SCORE: 'tournament:score',
  TOURNAMENT_VIEW: 'tournament:view',
  
  // User Management
  USER_CREATE: 'user:create',
  USER_MANAGE: 'user:manage',
  USER_DELETE: 'user:delete',
  USER_VIEW: 'user:view',
  
  // Organization Management
  ORG_MANAGE: 'organization:manage',
  ORG_VIEW: 'organization:view',
  
  // Reports and Analytics
  REPORTS_DISTRICT: 'reports:district',
  REPORTS_SCHOOL: 'reports:school',
  REPORTS_TEAM: 'reports:team',
  REPORTS_INDIVIDUAL: 'reports:individual',
  
  // Compliance and Audit
  AUDIT_LOGS_VIEW: 'audit:logs:view',
  COMPLIANCE_MANAGE: 'compliance:manage',
  
  // Analytics and Reporting Access
  ANALYTICS_DATA_READ: 'analytics:data:read',
  ANALYTICS_DATA_WRITE: 'analytics:data:write',
  
  // Collaboration Features Access
  COLLABORATION_DATA_READ: 'collaboration:data:read',
  COLLABORATION_DATA_WRITE: 'collaboration:data:write',
  
  // Team Registration Access
  TEAM_REGISTRATION_READ: 'team_registration:read',
  TEAM_REGISTRATION_WRITE: 'team_registration:write',
  TEAM_REGISTRATION_DELETE: 'team_registration:delete'
} as const;

// Role-based permission matrix
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  // District Level Roles
  district_athletic_director: [
    // Full district access
    PERMISSIONS.DISTRICT_DATA_READ,
    PERMISSIONS.DISTRICT_DATA_WRITE,
    PERMISSIONS.DISTRICT_DATA_DELETE,
    // All school access in district
    PERMISSIONS.SCHOOL_DATA_READ,
    PERMISSIONS.SCHOOL_DATA_WRITE,
    PERMISSIONS.SCHOOL_DATA_DELETE,
    // All team access in district
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE,
    PERMISSIONS.TEAM_DATA_DELETE,
    // All athlete access in district
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE,
    PERMISSIONS.ATHLETE_DATA_DELETE,
    // Health data access (administrative oversight)
    PERMISSIONS.HEALTH_DATA_READ,
    PERMISSIONS.HEALTH_DATA_WRITE,
    // Budget management
    PERMISSIONS.BUDGET_DATA_READ,
    PERMISSIONS.BUDGET_DATA_WRITE,
    PERMISSIONS.BUDGET_DATA_DELETE,
    // Academic oversight
    PERMISSIONS.ACADEMIC_DATA_READ,
    PERMISSIONS.ACADEMIC_DATA_WRITE,
    // Tournament oversight
    PERMISSIONS.TOURNAMENT_CREATE,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Analytics access
    PERMISSIONS.ANALYTICS_DATA_READ,
    PERMISSIONS.ANALYTICS_DATA_WRITE,
    // Collaboration access
    PERMISSIONS.COLLABORATION_DATA_READ,
    PERMISSIONS.COLLABORATION_DATA_WRITE,
    // Registration management
    PERMISSIONS.TEAM_REGISTRATION_READ,
    PERMISSIONS.TEAM_REGISTRATION_WRITE,
    PERMISSIONS.TEAM_REGISTRATION_DELETE,
    // User management
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_VIEW,
    // Organization management
    PERMISSIONS.ORG_MANAGE,
    PERMISSIONS.ORG_VIEW,
    // Reports
    PERMISSIONS.REPORTS_DISTRICT,
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL,
    // Compliance
    PERMISSIONS.AUDIT_LOGS_VIEW,
    PERMISSIONS.COMPLIANCE_MANAGE
  ],
  
  district_athletic_coordinator: [
    // District coordination access
    PERMISSIONS.DISTRICT_DATA_READ,
    PERMISSIONS.DISTRICT_DATA_WRITE,
    // School coordination
    PERMISSIONS.SCHOOL_DATA_READ,
    PERMISSIONS.SCHOOL_DATA_WRITE,
    // Team coordination
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE,
    // Athlete coordination
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE,
    // Limited health access (coordination only)
    PERMISSIONS.HEALTH_DATA_READ,
    // Tournament coordination
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Reports
    PERMISSIONS.REPORTS_DISTRICT,
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM
  ],
  
  district_athletic_trainer: [
    // District health oversight
    PERMISSIONS.DISTRICT_DATA_READ,
    // School health access
    PERMISSIONS.SCHOOL_DATA_READ,
    // Team health access
    PERMISSIONS.TEAM_DATA_READ,
    // Full athlete health access
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE,
    // Full health data access
    PERMISSIONS.HEALTH_DATA_READ,
    PERMISSIONS.HEALTH_DATA_WRITE,
    PERMISSIONS.HEALTH_DATA_DELETE,
    PERMISSIONS.HEALTH_DATA_EMERGENCY,
    // Tournament health oversight
    PERMISSIONS.TOURNAMENT_VIEW,
    // Health reports
    PERMISSIONS.REPORTS_DISTRICT,
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL,
    // Compliance for health data
    PERMISSIONS.AUDIT_LOGS_VIEW
  ],
  
  district_aquatic_coordinator: [
    // Aquatic program management across district
    PERMISSIONS.DISTRICT_DATA_READ,
    PERMISSIONS.SCHOOL_DATA_READ,
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE, // For aquatic teams only
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE, // For aquatic athletes only
    // Tournament management for aquatic events
    PERMISSIONS.TOURNAMENT_CREATE,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Reports for aquatic programs
    PERMISSIONS.REPORTS_DISTRICT,
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM
  ],
  
  // School Level Roles
  school_athletic_director: [
    // School-wide access
    PERMISSIONS.SCHOOL_DATA_READ,
    PERMISSIONS.SCHOOL_DATA_WRITE,
    PERMISSIONS.SCHOOL_DATA_DELETE,
    // All teams in school
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE,
    PERMISSIONS.TEAM_DATA_DELETE,
    // All athletes in school
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE,
    PERMISSIONS.ATHLETE_DATA_DELETE,
    // Health data oversight for school
    PERMISSIONS.HEALTH_DATA_READ,
    PERMISSIONS.HEALTH_DATA_WRITE,
    // School budget management
    PERMISSIONS.BUDGET_DATA_READ,
    PERMISSIONS.BUDGET_DATA_WRITE,
    // Academic coordination
    PERMISSIONS.ACADEMIC_DATA_READ,
    PERMISSIONS.ACADEMIC_DATA_WRITE,
    // Tournament management for school
    PERMISSIONS.TOURNAMENT_CREATE,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // User management for school
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.USER_VIEW,
    // Reports
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL,
    // Compliance oversight
    PERMISSIONS.AUDIT_LOGS_VIEW
  ],
  
  school_athletic_coordinator: [
    // School coordination
    PERMISSIONS.SCHOOL_DATA_READ,
    PERMISSIONS.SCHOOL_DATA_WRITE,
    // Team coordination
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE,
    // Athlete coordination
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE,
    // Tournament coordination
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Reports
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM
  ],
  
  school_athletic_trainer: [
    // School health oversight
    PERMISSIONS.SCHOOL_DATA_READ,
    // Team health access
    PERMISSIONS.TEAM_DATA_READ,
    // Full athlete health access in school
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE,
    // Full health data access
    PERMISSIONS.HEALTH_DATA_READ,
    PERMISSIONS.HEALTH_DATA_WRITE,
    PERMISSIONS.HEALTH_DATA_DELETE,
    PERMISSIONS.HEALTH_DATA_EMERGENCY,
    // Tournament health support
    PERMISSIONS.TOURNAMENT_VIEW,
    // Health reports
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL
  ],
  
  school_aquatic_coordinator: [
    // Aquatic programs in school
    PERMISSIONS.SCHOOL_DATA_READ,
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE, // Aquatic teams only
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE, // Aquatic athletes only
    // Tournament management for aquatic events
    PERMISSIONS.TOURNAMENT_CREATE,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Reports for aquatic programs
    PERMISSIONS.REPORTS_SCHOOL,
    PERMISSIONS.REPORTS_TEAM
  ],
  
  // Coaching Level Roles
  head_coach: [
    // Team management
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE,
    // Full athlete access for assigned teams
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE,
    // Health data access for team safety
    PERMISSIONS.HEALTH_DATA_READ,
    PERMISSIONS.HEALTH_DATA_WRITE,
    // Tournament participation
    PERMISSIONS.TOURNAMENT_VIEW,
    PERMISSIONS.TOURNAMENT_SCORE, // Can enter scores for their team
    // Reports for their team
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL
  ],
  
  assistant_coach: [
    // Team access (limited)
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.TEAM_DATA_WRITE, // Limited scope
    // Athlete access for assigned teams
    PERMISSIONS.ATHLETE_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_WRITE, // Limited scope
    // Limited health data (emergency situations)
    PERMISSIONS.HEALTH_DATA_READ,
    // Tournament participation
    PERMISSIONS.TOURNAMENT_VIEW,
    // Reports for their team
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL
  ],
  
  athletic_training_student: [
    // Supervised health data access
    PERMISSIONS.HEALTH_DATA_READ,
    PERMISSIONS.HEALTH_DATA_WRITE, // Under supervision
    // Limited athlete access
    PERMISSIONS.ATHLETE_DATA_READ,
    // Tournament health support
    PERMISSIONS.TOURNAMENT_VIEW,
    // Individual reports only
    PERMISSIONS.REPORTS_INDIVIDUAL
  ],
  
  // Tournament Level Roles
  tournament_manager: [
    // Full tournament management
    PERMISSIONS.TOURNAMENT_CREATE,
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_SCORE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Team and athlete access for tournaments
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_READ,
    // Reports for tournaments
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL,
    // User management for tournament
    PERMISSIONS.USER_VIEW
  ],
  
  assistant_tournament_manager: [
    // Limited tournament management
    PERMISSIONS.TOURNAMENT_MANAGE,
    PERMISSIONS.TOURNAMENT_SCORE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Limited team and athlete access
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_READ,
    // Limited reports
    PERMISSIONS.REPORTS_TEAM,
    PERMISSIONS.REPORTS_INDIVIDUAL
  ],
  
  scorekeeper: [
    // Scoring only
    PERMISSIONS.TOURNAMENT_SCORE,
    PERMISSIONS.TOURNAMENT_VIEW,
    // Limited data access for scoring
    PERMISSIONS.TEAM_DATA_READ,
    PERMISSIONS.ATHLETE_DATA_READ,
    // Individual reports
    PERMISSIONS.REPORTS_INDIVIDUAL
  ],
  
  // General Access Roles
  athlete: [
    // Own data only
    PERMISSIONS.ATHLETE_DATA_READ, // Own data only (filtered by user ID)
    PERMISSIONS.ATHLETE_DATA_WRITE, // Own data only (limited fields)
    // Tournament viewing
    PERMISSIONS.TOURNAMENT_VIEW,
    // Own reports only
    PERMISSIONS.REPORTS_INDIVIDUAL
  ],
  
  fan: [
    // Public data only
    PERMISSIONS.TOURNAMENT_VIEW,
    // Public reports only
    PERMISSIONS.REPORTS_INDIVIDUAL
  ]
};

// Data scope definitions for each role
export const ROLE_DATA_SCOPE: Record<string, {
  organizationScope: 'district' | 'school' | 'team' | 'individual' | 'public';
  healthDataAccess: boolean;
  budgetDataAccess: boolean;
  academicDataAccess: boolean;
  canCreateUsers: boolean;
  canManageOrganization: boolean;
}> = {
  // District Level
  district_athletic_director: {
    organizationScope: 'district',
    healthDataAccess: true,
    budgetDataAccess: true,
    academicDataAccess: true,
    canCreateUsers: true,
    canManageOrganization: true
  },
  district_athletic_coordinator: {
    organizationScope: 'district',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: true,
    canCreateUsers: true,
    canManageOrganization: false
  },
  district_athletic_trainer: {
    organizationScope: 'district',
    healthDataAccess: true,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  district_aquatic_coordinator: {
    organizationScope: 'district',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  
  // School Level
  school_athletic_director: {
    organizationScope: 'school',
    healthDataAccess: true,
    budgetDataAccess: true,
    academicDataAccess: true,
    canCreateUsers: true,
    canManageOrganization: false
  },
  school_athletic_coordinator: {
    organizationScope: 'school',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: true,
    canCreateUsers: false,
    canManageOrganization: false
  },
  school_athletic_trainer: {
    organizationScope: 'school',
    healthDataAccess: true,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  school_aquatic_coordinator: {
    organizationScope: 'school',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  
  // Coaching Level
  head_coach: {
    organizationScope: 'team',
    healthDataAccess: true,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  assistant_coach: {
    organizationScope: 'team',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  athletic_training_student: {
    organizationScope: 'team',
    healthDataAccess: true,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  
  // Tournament Level
  tournament_manager: {
    organizationScope: 'public',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  assistant_tournament_manager: {
    organizationScope: 'public',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  scorekeeper: {
    organizationScope: 'public',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  
  // General Access
  athlete: {
    organizationScope: 'individual',
    healthDataAccess: false, // Own health data only (handled separately)
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  },
  fan: {
    organizationScope: 'public',
    healthDataAccess: false,
    budgetDataAccess: false,
    academicDataAccess: false,
    canCreateUsers: false,
    canManageOrganization: false
  }
};

// Utility functions for permission checking
export class RBACService {
  /**
   * Check if a user has a specific permission
   */
  static hasPermission(user: User, permission: string): boolean {
    const userRole = user.userRole || user.complianceRole;
    if (!userRole) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }
  
  /**
   * Check if a user has any of the specified permissions
   */
  static hasAnyPermission(user: User, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(user, permission));
  }
  
  /**
   * Check if a user has all of the specified permissions
   */
  static hasAllPermissions(user: User, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(user, permission));
  }
  
  /**
   * Get all permissions for a user
   */
  static getUserPermissions(user: User): string[] {
    const userRole = user.userRole || user.complianceRole;
    if (!userRole) return [];
    
    return ROLE_PERMISSIONS[userRole] || [];
  }
  
  /**
   * Get data scope for a user role
   */
  static getUserDataScope(user: User) {
    const userRole = user.userRole || user.complianceRole;
    if (!userRole) return null;
    
    return ROLE_DATA_SCOPE[userRole] || null;
  }
  
  /**
   * Check if user can access data within organization scope
   */
  static canAccessOrganizationData(user: User, targetOrganizationId: string): boolean {
    const dataScope = this.getUserDataScope(user);
    if (!dataScope) return false;
    
    // Public scope can access any organization data
    if (dataScope.organizationScope === 'public') return true;
    
    // Individual scope can only access own data
    if (dataScope.organizationScope === 'individual') {
      return user.organizationId === targetOrganizationId;
    }
    
    // District, school, team scopes require matching organization
    return user.organizationId === targetOrganizationId;
  }
  
  /**
   * Check if user can access health data
   */
  static canAccessHealthData(user: User): boolean {
    const dataScope = this.getUserDataScope(user);
    return dataScope?.healthDataAccess || false;
  }
  
  /**
   * Check if user can access budget data
   */
  static canAccessBudgetData(user: User): boolean {
    const dataScope = this.getUserDataScope(user);
    return dataScope?.budgetDataAccess || false;
  }
  
  /**
   * Check if user can access academic data
   */
  static canAccessAcademicData(user: User): boolean {
    const dataScope = this.getUserDataScope(user);
    return dataScope?.academicDataAccess || false;
  }
}