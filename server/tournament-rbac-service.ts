/**
 * Tournament RBAC Service - Comprehensive Role-Based Access Control
 * Integrates with existing RBAC system to secure all tournament management operations
 * Provides centralized permission checking and data filtering for tournament services
 */

import { storage, type SecureUserContext, assertUserContext } from "./storage";
import type {
  Tournament,
  Match,
  Team,
  TournamentRegistrationForm,
  RegistrationSubmission
} from "@shared/schema";

export interface TournamentPermissions {
  canCreateTournament: boolean;
  canViewTournament: boolean;
  canEditTournament: boolean;
  canDeleteTournament: boolean;
  canManageRegistrations: boolean;
  canScoreMatches: boolean;
  canViewFinancials: boolean;
  canSendCommunications: boolean;
  canGenerateReports: boolean;
  canExecuteOverrides: boolean;
  canManageStaff: boolean;
}

export interface UserContext {
  userId: string;
  userRole: string;
  organizationId?: string;
  schoolId?: string;
  permissions?: string[];
}

export class TournamentRBACService {
  
  /**
   * Validate user context and assert security requirements
   */
  static validateUserContext(user: SecureUserContext, operation: string): void {
    assertUserContext(user, operation);
    
    if (!user.userRole) {
      throw new Error(`RBAC_SECURITY_VIOLATION: ${operation} requires user role for permission checking`);
    }
  }

  /**
   * Get comprehensive tournament permissions for a user
   */
  static getTournamentPermissions(
    user: SecureUserContext, 
    tournament?: Tournament
  ): TournamentPermissions {
    this.validateUserContext(user, 'getTournamentPermissions');

    const role = user.userRole;
    const isOwner = tournament ? tournament.userId === user.id : false;
    const isOrganizationAdmin = false; // TODO: Add organizationRole to user schema if needed

    // Role-based permission matrix
    switch (role) {
      case 'district_athletic_director': // Super admin equivalent
        return {
          canCreateTournament: true,
          canViewTournament: true,
          canEditTournament: true,
          canDeleteTournament: true,
          canManageRegistrations: true,
          canScoreMatches: true,
          canViewFinancials: true,
          canSendCommunications: true,
          canGenerateReports: true,
          canExecuteOverrides: true,
          canManageStaff: true
        };

      case 'district_athletic_director':
        return {
          canCreateTournament: true,
          canViewTournament: true,
          canEditTournament: true,
          canDeleteTournament: true,
          canManageRegistrations: true,
          canScoreMatches: true,
          canViewFinancials: true,
          canSendCommunications: true,
          canGenerateReports: true,
          canExecuteOverrides: true,
          canManageStaff: true
        };

      case 'tournament_manager':
        return {
          canCreateTournament: true,
          canViewTournament: true,
          canEditTournament: isOwner || isOrganizationAdmin,
          canDeleteTournament: isOwner,
          canManageRegistrations: isOwner || isOrganizationAdmin,
          canScoreMatches: true,
          canViewFinancials: isOwner || isOrganizationAdmin,
          canSendCommunications: isOwner || isOrganizationAdmin,
          canGenerateReports: true,
          canExecuteOverrides: false,
          canManageStaff: isOwner || isOrganizationAdmin
        };

      case 'assistant_tournament_manager':
        return {
          canCreateTournament: false,
          canViewTournament: true,
          canEditTournament: false,
          canDeleteTournament: false,
          canManageRegistrations: true,
          canScoreMatches: true,
          canViewFinancials: false,
          canSendCommunications: false,
          canGenerateReports: true,
          canExecuteOverrides: false,
          canManageStaff: false
        };

      case 'scorekeeper':
        return {
          canCreateTournament: false,
          canViewTournament: true,
          canEditTournament: false,
          canDeleteTournament: false,
          canManageRegistrations: false,
          canScoreMatches: true,
          canViewFinancials: false,
          canSendCommunications: false,
          canGenerateReports: false,
          canExecuteOverrides: false,
          canManageStaff: false
        };

      case 'head_coach':
      case 'assistant_coach':
        return {
          canCreateTournament: false,
          canViewTournament: true,
          canEditTournament: false,
          canDeleteTournament: false,
          canManageRegistrations: false, // Can register their own teams only
          canScoreMatches: false,
          canViewFinancials: false,
          canSendCommunications: false,
          canGenerateReports: false,
          canExecuteOverrides: false,
          canManageStaff: false
        };

      case 'athlete':
        return {
          canCreateTournament: false,
          canViewTournament: true,
          canEditTournament: false,
          canDeleteTournament: false,
          canManageRegistrations: false, // Can register their own team only
          canScoreMatches: false,
          canViewFinancials: false,
          canSendCommunications: false,
          canGenerateReports: false,
          canExecuteOverrides: false,
          canManageStaff: false
        };

      default:
        // Default to minimal permissions
        return {
          canCreateTournament: false,
          canViewTournament: false,
          canEditTournament: false,
          canDeleteTournament: false,
          canManageRegistrations: false,
          canScoreMatches: false,
          canViewFinancials: false,
          canSendCommunications: false,
          canGenerateReports: false,
          canExecuteOverrides: false,
          canManageStaff: false
        };
    }
  }

  /**
   * Check if user can perform specific tournament operation
   */
  static async canPerformOperation(
    user: SecureUserContext,
    operation: keyof TournamentPermissions,
    tournamentId?: string
  ): Promise<boolean> {
    this.validateUserContext(user, `canPerformOperation:${operation}`);

    let tournament: Tournament | undefined;
    
    if (tournamentId) {
      try {
        tournament = await storage.getTournament(tournamentId, user);
      } catch (error) {
        // If user can't access tournament, they can't perform operations on it
        return false;
      }
    }

    const permissions = this.getTournamentPermissions(user, tournament);
    return permissions[operation];
  }

  /**
   * Assert that user has permission for operation (throws if not)
   */
  static async assertPermission(
    user: SecureUserContext,
    operation: keyof TournamentPermissions,
    tournamentId?: string
  ): Promise<void> {
    const hasPermission = await this.canPerformOperation(user, operation, tournamentId);
    
    if (!hasPermission) {
      throw new Error(
        `RBAC_PERMISSION_DENIED: User ${user.id} with role ${user.userRole} does not have permission to ${operation}` +
        (tournamentId ? ` for tournament ${tournamentId}` : '')
      );
    }
  }

  /**
   * Filter tournaments based on user permissions
   */
  static async filterTournamentsForUser(
    user: SecureUserContext,
    tournaments: Tournament[]
  ): Promise<Tournament[]> {
    this.validateUserContext(user, 'filterTournamentsForUser');

    // District directors can see all tournaments
    if (user.userRole === 'district_athletic_director') {
      return tournaments;
    }

    // Tournament managers can see tournaments they own or are in their organization
    if (user.userRole === 'tournament_manager' || user.userRole === 'assistant_tournament_manager') {
      return tournaments.filter(tournament => 
        tournament.userId === user.id || 
        (user.organizationId && tournament.organizationId === user.organizationId)
      );
    }

    // Coaches can see public tournaments and those they're registered for
    if (user.userRole === 'head_coach' || user.userRole === 'assistant_coach') {
      return tournaments.filter(tournament => 
        tournament.isPublic || 
        this.isUserRegisteredForTournament(user.id, tournament.id)
      );
    }

    // Athletes can see public tournaments
    if (user.userRole === 'athlete') {
      return tournaments.filter(tournament => tournament.isPublic);
    }

    // Default: no access
    return [];
  }

  /**
   * Filter matches based on user permissions
   */
  static async filterMatchesForUser(
    user: SecureUserContext,
    matches: Match[],
    tournamentId: string
  ): Promise<Match[]> {
    this.validateUserContext(user, 'filterMatchesForUser');

    // Check if user can view the tournament
    const canViewTournament = await this.canPerformOperation(user, 'canViewTournament', tournamentId);
    
    if (!canViewTournament) {
      return [];
    }

    // Tournament staff can see all matches
    if (this.isTournamentStaff(user)) {
      return matches;
    }

    // Coaches can see matches involving their teams
    if (user.userRole === 'head_coach' || user.userRole === 'assistant_coach') {
      const userTeams = await this.getUserTeams(user.id);
      const teamIds = userTeams.map(team => team.id);
      
      return matches.filter(match => 
        (match.team1 && teamIds.includes(match.team1)) ||
        (match.team2 && teamIds.includes(match.team2))
      );
    }

    // Default: show all public matches
    return matches;
  }

  /**
   * Check registration submission permissions
   */
  static async canAccessRegistrationSubmission(
    user: SecureUserContext,
    submission: RegistrationSubmission
  ): Promise<boolean> {
    this.validateUserContext(user, 'canAccessRegistrationSubmission');

    // District director has full access
    if (user.userRole === 'district_athletic_director') {
      return true;
    }

    // Tournament managers can access submissions for their tournaments
    if (user.userRole === 'tournament_manager' || user.userRole === 'assistant_tournament_manager') {
      const form = await storage.getTournamentRegistrationForm(submission.formId);
      if (form) {
        const tournament = await storage.getTournament(form.tournamentId, user);
        return tournament?.userId === user.id;
      }
    }

    // Users can access their own submissions
    if (submission.submittedBy === user.id) {
      return true;
    }

    return false;
  }

  /**
   * Validate match scoring permissions
   */
  static async canScoreMatch(
    user: SecureUserContext,
    matchId: string
  ): Promise<boolean> {
    this.validateUserContext(user, 'canScoreMatch');

    try {
      const match = await storage.getMatch(matchId);
      if (!match) {
        return false;
      }

      // Check general scoring permission
      const canScore = await this.canPerformOperation(user, 'canScoreMatches', match.tournamentId);
      if (!canScore) {
        return false;
      }

      // Additional checks for match status
      if (match.status === 'completed') {
        // Only tournament managers and above can modify completed matches
        return user.userRole === 'tournament_manager' || 
               user.userRole === 'district_athletic_director';
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get tournaments accessible to user
   */
  static async getUserAccessibleTournaments(user: SecureUserContext): Promise<Tournament[]> {
    this.validateUserContext(user, 'getUserAccessibleTournaments');

    // Get tournaments based on user role
    switch (user.userRole) {
      case 'district_athletic_director':
        return await storage.getTournaments();

      case 'tournament_manager':
      case 'assistant_tournament_manager':
        // Get tournaments owned by user or in their organization
        const allTournaments = await storage.getTournaments();
        return allTournaments.filter(tournament => 
          tournament.userId === user.id
        );

      case 'head_coach':
      case 'assistant_coach':
      case 'athlete':
        // Get public tournaments and ones they're registered for
        const publicTournaments = await storage.getTournaments();
        return publicTournaments.filter(tournament => 
          tournament.isPublic || 
          this.isUserRegisteredForTournament(user.id, tournament.id)
        );

      default:
        return [];
    }
  }

  /**
   * Log security audit for tournament operations
   */
  static async auditTournamentAccess(
    user: SecureUserContext,
    action: string,
    resourceId: string,
    resourceType: 'tournament' | 'match' | 'registration' | 'report',
    success: boolean,
    additionalInfo?: any
  ): Promise<void> {
    try {
      await storage.createComplianceAuditLog({
        userId: user.id,
        actionType: 'data_access',
        resourceType: 'tournament_data',
        resourceId,
        ipAddress: additionalInfo?.ipAddress || null,
        userAgent: additionalInfo?.userAgent || null,
        complianceNotes: `Tournament ${action} - ${resourceType} ${resourceId} - ${success ? 'SUCCESS' : 'DENIED'} - Role: ${user.userRole}`
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  // Private helper methods

  private static isTournamentStaff(user: SecureUserContext): boolean {
    return ['tournament_manager', 'assistant_tournament_manager', 'scorekeeper', 'district_athletic_director']
      .includes(user.userRole || '');
  }

  private static isUserRegisteredForTournament(userId: string, tournamentId: string): boolean {
    // This would check if user is registered for the tournament
    // Implementation would query registration submissions
    // For now, return false as placeholder
    return false;
  }

  private static async getUserTeams(userId: string): Promise<Team[]> {
    // This would get teams associated with the user
    // Implementation would query teams where user is coach or member
    // For now, return empty array as placeholder
    return [];
  }

  /**
   * Create secured user context from request
   */
  static createSecureUserContext(req: any): SecureUserContext {
    let userId: string | undefined;
    let userRole: string = 'guest';
    let organizationId: string | undefined;

    // Extract user information from request
    if (req.isAuthenticated && req.isAuthenticated()) {
      userId = req.user?.claims?.sub;
      userRole = req.user?.userRole || 'user';
      organizationId = req.user?.organizationId;
    } else if (req.session?.user) {
      userId = req.session.user.id;
      userRole = req.session.user.userRole || 'user';
      organizationId = req.session.user.organizationId;
    }

    if (!userId) {
      throw new Error('RBAC_AUTH_REQUIRED: Valid user authentication required');
    }

    return {
      id: userId,
      userRole,
      organizationId,
      organizationRole: req.user?.organizationRole,
      email: req.user?.email || req.session?.user?.email,
      // Include other required User properties
      subscriptionPlan: req.user?.subscriptionPlan || 'free',
      subscriptionStatus: req.user?.subscriptionStatus || 'inactive'
    } as SecureUserContext;
  }

  /**
   * Middleware to validate tournament access
   */
  static createTournamentAccessMiddleware(requiredPermission: keyof TournamentPermissions) {
    return async (req: any, res: any, next: any) => {
      try {
        const user = this.createSecureUserContext(req);
        const tournamentId = req.params.id || req.params.tournamentId;

        await this.assertPermission(user, requiredPermission, tournamentId);
        
        // Attach user context to request for use in route handlers
        req.secureUser = user;
        
        // Audit the access
        await this.auditTournamentAccess(
          user, 
          requiredPermission, 
          tournamentId || 'unknown', 
          'tournament', 
          true,
          { ipAddress: req.ip, userAgent: req.get('User-Agent') }
        );

        next();
      } catch (error) {
        console.error('Tournament access denied:', error);
        
        // Audit the failed access
        if (req.secureUser) {
          await this.auditTournamentAccess(
            req.secureUser, 
            requiredPermission, 
            req.params.id || req.params.tournamentId || 'unknown', 
            'tournament', 
            false,
            { ipAddress: req.ip, userAgent: req.get('User-Agent') }
          );
        }

        res.status(403).json({ 
          message: 'Access denied', 
          error: error instanceof Error ? error.message : 'Permission denied'
        });
      }
    };
  }
}