import { Request, Response, NextFunction } from 'express';
import { getStorage } from './storage';
import crypto from 'crypto';

// Using standard Request interface with user extension from rbac-middleware.ts
export interface ComplianceContext {
  hasHipaaAccess: boolean;
  hasFerpaAccess: boolean;
  complianceRole: string;
  medicalDataAccess: boolean;
}

// Extend Request interface to include compliance context
declare module 'express-serve-static-core' {
  interface Request {
    complianceContext?: ComplianceContext;
  }
}

// Generate tamper-evident integrity hash for audit log entry
function generateAuditIntegrityHash(logData: any): string {
  const dataString = JSON.stringify({
    userId: logData.userId,
    actionType: logData.actionType,
    resourceType: logData.resourceType,
    resourceId: logData.resourceId,
    timestamp: logData.createdAt?.toISOString() || new Date().toISOString(),
    ipAddress: logData.ipAddress,
    userAgent: logData.userAgent
  });
  
  // Create HMAC with secret key for tamper detection
  const secret = process.env.AUDIT_INTEGRITY_KEY;
  if (!secret) {
    throw new Error('AUDIT_INTEGRITY_KEY environment variable is required for HIPAA compliance');
  }
  return crypto.createHmac('sha256', secret).update(dataString).digest('hex');
}

// Enhanced compliance logging with tamper-evidence
export async function logComplianceAction(
  userId: string,
  actionType: 'data_access' | 'data_modification' | 'export' | 'view' | 'login' | 'permission_change',
  resourceType: 'student_data' | 'health_data' | 'tournament_data' | 'administrative_data',
  resourceId?: string,
  req?: Request,
  notes?: string
) {
  try {
    const timestamp = new Date();
    const logData = {
      userId,
      actionType,
      resourceType,
      resourceId: resourceId || null,
      ipAddress: req?.ip || req?.socket?.remoteAddress || 'unknown',
      userAgent: (req && typeof req.get === 'function' ? req.get('User-Agent') : null) || 'unknown',
      complianceNotes: notes || null,
      createdAt: timestamp
    };
    
    // Generate integrity hash for tamper-evidence
    const integrityHash = generateAuditIntegrityHash(logData);
    
    const storage = await getStorage();
    await storage.createComplianceAuditLog({
      ...logData,
      complianceNotes: `${notes || ''} [INTEGRITY:${integrityHash}]`
    });
    
    // Log security-critical actions to console for immediate visibility
    if (actionType === 'data_access' && resourceType === 'health_data') {
      console.log(`🔒 HIPAA AUDIT: User ${userId} accessed ${resourceType} [${actionType}] - Integrity: ${integrityHash.substring(0, 8)}...`);
    }
    
  } catch (error) {
    console.error('Failed to log compliance action:', error);
    // Continue execution - don't fail requests due to audit logging issues
  }
}

// Middleware to check HIPAA compliance for health data access
export function requireHipaaCompliance(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ 
      error: 'Authentication required for health data access',
      complianceViolation: 'HIPAA authentication failure'
    });
  }

  // Check user HIPAA training and role
  const checkHipaaCompliance = async () => {
    try {
      const storage = await getStorage();
      const user = await storage.getUser(req.user!.claims.sub);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found',
          complianceViolation: 'HIPAA user verification failure'
        });
      }

      // Check HIPAA training completion
      if (!user.hipaaTrainingCompleted) {
        await logComplianceAction(
          user.id, 
          'data_access', 
          'health_data', 
          undefined, 
          req,
          'HIPAA access denied - training not completed'
        );
        return res.status(403).json({ 
          error: 'HIPAA training required for health data access',
          complianceViolation: 'HIPAA training incomplete',
          redirectTo: '/compliance/hipaa-training'
        });
      }

      // Check medical data access permission
      if (!user.medicalDataAccess) {
        await logComplianceAction(
          user.id, 
          'data_access', 
          'health_data', 
          undefined, 
          req,
          'HIPAA access denied - insufficient permissions'
        );
        return res.status(403).json({ 
          error: 'Insufficient permissions for health data access',
          complianceViolation: 'HIPAA permission denied'
        });
      }

      // Check role hierarchy for medical access - District and School level health roles
      const medicalRoles = [
        'district_athletic_director', 
        'district_head_athletic_trainer',
        'school_athletic_director',
        'school_athletic_trainer'
      ];
      if (!user.complianceRole || !medicalRoles.includes(user.complianceRole)) {
        await logComplianceAction(
          user.id, 
          'data_access', 
          'health_data', 
          undefined, 
          req,
          'HIPAA access denied - insufficient role'
        );
        return res.status(403).json({ 
          error: 'Role does not permit health data access',
          complianceViolation: 'HIPAA role restriction'
        });
      }

      // Log successful HIPAA access
      await logComplianceAction(
        user.id, 
        'data_access', 
        'health_data', 
        undefined, 
        req,
        'HIPAA access granted'
      );

      // Add compliance context to request
      req.complianceContext = {
        hasHipaaAccess: true,
        hasFerpaAccess: user.ferpaAgreementSigned || false,
        complianceRole: user.complianceRole || 'scorekeeper',
        medicalDataAccess: true
      };

      next();
    } catch (error) {
      console.error('HIPAA compliance check failed:', error);
      res.status(500).json({ 
        error: 'Compliance verification failed',
        complianceViolation: 'HIPAA system error'
      });
    }
  };

  checkHipaaCompliance();
}

// Middleware to check FERPA compliance for student data access
export function requireFerpaCompliance(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.claims?.sub) {
    return res.status(401).json({ 
      error: 'Authentication required for student data access',
      complianceViolation: 'FERPA authentication failure'
    });
  }

  const checkFerpaCompliance = async () => {
    try {
      const storage = await getStorage();
      const user = await storage.getUser(req.user!.claims.sub);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'User not found',
          complianceViolation: 'FERPA user verification failure'
        });
      }

      // Check FERPA agreement signature
      if (!user.ferpaAgreementSigned) {
        await logComplianceAction(
          user.id, 
          'data_access', 
          'student_data', 
          undefined, 
          req,
          'FERPA access denied - agreement not signed'
        );
        return res.status(403).json({ 
          error: 'FERPA agreement required for student data access',
          complianceViolation: 'FERPA agreement unsigned',
          redirectTo: '/compliance/ferpa-agreement'
        });
      }

      // Check organizational authorization
      if (!user.organizationId) {
        await logComplianceAction(
          user.id, 
          'data_access', 
          'student_data', 
          undefined, 
          req,
          'FERPA access denied - no organization affiliation'
        );
        return res.status(403).json({ 
          error: 'Organization affiliation required for student data access',
          complianceViolation: 'FERPA organization requirement'
        });
      }

      // Log successful FERPA access
      await logComplianceAction(
        user.id, 
        'data_access', 
        'student_data', 
        undefined, 
        req,
        'FERPA access granted'
      );

      // Add compliance context to request
      req.complianceContext = {
        hasHipaaAccess: user.medicalDataAccess || false,
        hasFerpaAccess: true,
        complianceRole: user.complianceRole || 'scorekeeper',
        medicalDataAccess: user.medicalDataAccess || false
      };

      next();
    } catch (error) {
      console.error('FERPA compliance check failed:', error);
      res.status(500).json({ 
        error: 'Compliance verification failed',
        complianceViolation: 'FERPA system error'
      });
    }
  };

  checkFerpaCompliance();
}

// Combined middleware for routes requiring both HIPAA and FERPA compliance
export function requireFullCompliance(req: Request, res: Response, next: NextFunction) {
  requireFerpaCompliance(req, res, (ferpaError) => {
    if (ferpaError) return;
    
    requireHipaaCompliance(req, res, next);
  });
}

// Middleware to log all data access (for audit trails)
export function auditDataAccess(
  resourceType: 'student_data' | 'health_data' | 'tournament_data' | 'administrative_data'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.claims?.sub) {
      await logComplianceAction(
        req.user.claims.sub,
        'data_access',
        resourceType,
        req.params.id || req.params.studentId || req.params.tournamentId,
        req,
        `${req.method} ${req.path}`
      );
    }
    next();
  };
}

// Middleware to enforce role-based access for different compliance levels
export function requireComplianceRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.claims?.sub) {
      return res.status(401).json({ 
        error: 'Authentication required',
        complianceViolation: 'Role authentication failure'
      });
    }

    try {
      const storage = await getStorage();
      const user = await storage.getUser(req.user.claims.sub);
      
      if (!user || !user.complianceRole || !allowedRoles.includes(user.complianceRole)) {
        await logComplianceAction(
          req.user.claims.sub, 
          'data_access', 
          'administrative_data', 
          undefined, 
          req,
          `Role access denied - required: ${allowedRoles.join(', ')}, actual: ${user?.complianceRole || 'none'}`
        );
        return res.status(403).json({ 
          error: 'Insufficient role permissions',
          complianceViolation: 'Role restriction',
          requiredRoles: allowedRoles,
          userRole: user?.complianceRole || 'none'
        });
      }

      await logComplianceAction(
        user.id, 
        'data_access', 
        'administrative_data', 
        undefined, 
        req,
        `Role access granted - ${user.complianceRole}`
      );

      next();
    } catch (error) {
      console.error('Role compliance check failed:', error);
      res.status(500).json({ 
        error: 'Role verification failed',
        complianceViolation: 'Role system error'
      });
    }
  };
}