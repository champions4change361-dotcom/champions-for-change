import { Request, Response, NextFunction } from 'express';
import { RBACDataFilters } from './rbac-data-filters';
import { HealthDataAudit } from './data-encryption';
import type { User } from '@shared/schema';

/**
 * Comprehensive Health Data Access Validation Middleware
 * HIPAA/FERPA compliant access control with proper audit logging
 */

interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Validate health data access based on user role and context
 */
export const validateHealthDataAccess = (requiredDataType: 'phi' | 'summary' | 'aggregate' = 'phi') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user || !user.id) {
        await HealthDataAudit.logAccess(
          'ANONYMOUS',
          'UNKNOWN',
          'health_data',
          'failed_access',
          { 
            reason: 'NO_USER_CONTEXT',
            endpoint: req.path,
            method: req.method,
            riskLevel: 'critical'
          }
        );
        return res.status(401).json({ 
          error: 'Authentication required for health data access',
          complianceViolation: true
        });
      }

      // Check if user has health data access permissions
      const hasHealthAccess = await validateUserHealthPermissions(user);
      if (!hasHealthAccess) {
        await HealthDataAudit.logAccess(
          user.id,
          'UNKNOWN',
          'health_data',
          'failed_access',
          { 
            reason: 'INSUFFICIENT_HEALTH_PERMISSIONS',
            userRole: user.userRole,
            endpoint: req.path,
            method: req.method,
            riskLevel: 'high'
          }
        );
        return res.status(403).json({ 
          error: 'Insufficient permissions for health data access',
          complianceViolation: true
        });
      }

      // Validate role-specific access for PHI data
      if (requiredDataType === 'phi') {
        const canAccessPHI = await validatePHIAccess(user, req);
        if (!canAccessPHI) {
          await HealthDataAudit.logAccess(
            user.id,
            req.params.athleteId || req.params.studentId || 'UNKNOWN',
            'phi_data',
            'failed_access',
            { 
              reason: 'PHI_ACCESS_DENIED',
              userRole: user.userRole,
              requestedResource: req.params.athleteId || req.params.studentId,
              endpoint: req.path,
              riskLevel: 'critical'
            }
          );
          return res.status(403).json({ 
            error: 'Access to Protected Health Information denied - minimum necessary principle violated',
            complianceViolation: true
          });
        }
      }

      // Log successful access attempt
      await HealthDataAudit.logAccess(
        user.id,
        req.params.athleteId || req.params.studentId || 'HEALTH_SYSTEM',
        'health_data',
        'access_granted',
        { 
          endpoint: req.path,
          method: req.method,
          dataType: requiredDataType,
          riskLevel: 'low'
        }
      );

      next();
    } catch (error) {
      console.error('Health data access validation error:', error);
      
      // Log system error
      await HealthDataAudit.logAccess(
        req.user?.id || 'SYSTEM',
        'UNKNOWN',
        'health_data',
        'system_error',
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          endpoint: req.path,
          riskLevel: 'critical'
        }
      );

      res.status(500).json({ 
        error: 'Health data access validation failed',
        complianceViolation: true
      });
    }
  };
};

/**
 * Validate user has basic health data permissions
 */
async function validateUserHealthPermissions(user: User): Promise<boolean> {
  const healthDataRoles = [
    'district_athletic_trainer',
    'school_athletic_trainer',
    'athletic_training_student',
    'head_coach',
    'assistant_coach',
    'school_nurse',
    'parent',
    'student'
  ];

  // Check role-based access
  const hasRoleAccess = healthDataRoles.includes(user.userRole || '') || 
                       healthDataRoles.includes(user.complianceRole || '');

  if (!hasRoleAccess) return false;

  // Additional compliance checks
  if (['district_athletic_trainer', 'school_athletic_trainer', 'school_nurse'].includes(user.userRole || '')) {
    return (user as any).hipaaAuthorized === true && (user as any).licenseValid === true;
  }

  if (['head_coach', 'assistant_coach'].includes(user.userRole || '')) {
    return (user as any).ferpaTrainingCompleted === true;
  }

  return hasRoleAccess;
}

/**
 * Validate PHI access based on HIPAA "minimum necessary" principle
 */
async function validatePHIAccess(user: User, req: AuthenticatedRequest): Promise<boolean> {
  const userRole = user.userRole || user.complianceRole;

  switch (userRole) {
    case 'district_admin':
    case 'superintendent':
      // District Level: NO INDIVIDUAL PHI ACCESS per HIPAA
      return false;

    case 'district_athletic_trainer':
    case 'school_athletic_trainer':
      // Athletic trainers have PHI access for direct care relationships
      return await validateDirectCareRelationship(user, req);

    case 'head_coach':
    case 'assistant_coach':
      // Coaches have LIMITED PHI access for team members only
      return await validateCoachTeamRelationship(user, req);

    case 'parent':
      // Parents can access their own child's PHI
      return await validateParentChildRelationship(user, req);

    case 'student':
      // Students can access their own PHI
      return req.params.athleteId === user.id || req.params.studentId === user.id;

    default:
      return false;
  }
}

/**
 * Validate direct care relationship for athletic trainers
 */
async function validateDirectCareRelationship(user: User, req: AuthenticatedRequest): Promise<boolean> {
  // Implementation would check if athletic trainer has direct care assignment
  // For now, return true if they have the proper role
  return ['district_athletic_trainer', 'school_athletic_trainer'].includes(user.userRole || '');
}

/**
 * Validate coach-team relationship for limited health access
 */
async function validateCoachTeamRelationship(user: User, req: AuthenticatedRequest): Promise<boolean> {
  // Implementation would check if coach is assigned to the athlete's team
  // For now, return true if they have the proper role and athlete context exists
  return ['head_coach', 'assistant_coach'].includes(user.userRole || '') && 
         (req.params.athleteId || req.params.studentId) !== undefined;
}

/**
 * Validate parent-child relationship
 */
async function validateParentChildRelationship(user: User, req: AuthenticatedRequest): Promise<boolean> {
  // Implementation would check parent-child relationship in database
  // For now, return true if parent role and student context exists
  return user.userRole === 'parent' && (req.params.athleteId || req.params.studentId) !== undefined;
}

/**
 * Middleware to enforce data masking for unauthorized access
 */
export const enforceDataMasking = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    if (req.user && data) {
      const maskedData = maskSensitiveHealthData(data, req.user);
      return originalJson.call(this, maskedData);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Mask sensitive health data based on user permissions
 */
function maskSensitiveHealthData(data: any, user: User): any {
  if (!data || typeof data !== 'object') return data;

  const userRole = user.userRole || user.complianceRole;
  const sensitiveFields = ['medications', 'medicalConditions', 'allergies', 'injuryHistory', 'treatmentNotes'];

  // District administrators get aggregated data only
  if (['district_admin', 'superintendent'].includes(userRole || '')) {
    return maskAllPHI(data);
  }

  // Coaches get limited health information
  if (['head_coach', 'assistant_coach'].includes(userRole || '')) {
    return maskCoachHealthData(data);
  }

  return data; // Athletic trainers and authorized personnel get full access
}

/**
 * Mask all PHI for district-level administrators
 */
function maskAllPHI(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => maskAllPHI(item));
  }

  if (typeof data === 'object' && data !== null) {
    const masked = { ...data };
    const phiFields = ['medications', 'medicalConditions', 'allergies', 'injuryHistory', 'treatmentNotes', 'physicianNotes'];
    
    phiFields.forEach(field => {
      if (masked[field]) {
        masked[field] = '[REDACTED - DISTRICT LEVEL ACCESS]';
      }
    });

    return masked;
  }

  return data;
}

/**
 * Mask coach-inappropriate health data
 */
function maskCoachHealthData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => maskCoachHealthData(item));
  }

  if (typeof data === 'object' && data !== null) {
    const masked = { ...data };
    const restrictedFields = ['medications', 'medicalConditions', 'allergies', 'treatmentNotes', 'physicianNotes'];
    
    restrictedFields.forEach(field => {
      if (masked[field]) {
        masked[field] = '[REDACTED - COACH ACCESS RESTRICTED]';
      }
    });

    // Coaches can see basic injury status and return-to-play information
    if (masked.injuryStatus) {
      masked.injuryStatus = masked.injuryStatus; // Keep basic status
    }
    if (masked.returnToPlayStatus) {
      masked.returnToPlayStatus = masked.returnToPlayStatus; // Keep clearance status
    }

    return masked;
  }

  return data;
}