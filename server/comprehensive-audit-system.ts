import { Request, Response, NextFunction } from 'express';
import { getStorage } from './storage';
import crypto from 'crypto';
import type { User } from '@shared/schema';

// Enhanced audit logging system for comprehensive compliance tracking
export class ComprehensiveAuditSystem {
  
  /**
   * Log all data access activities for compliance
   */
  static async logDataAccess(
    userId: string,
    actionType: 'read' | 'write' | 'delete' | 'export' | 'import' | 'view' | 'download',
    resourceType: 'student_data' | 'health_data' | 'tournament_data' | 'administrative_data' | 'budget_data' | 'academic_data',
    resourceId?: string,
    organizationId?: string,
    req?: Request,
    additionalContext?: {
      dataClassification?: 'public' | 'internal' | 'confidential' | 'phi';
      fieldAccessed?: string[];
      queryFilters?: Record<string, any>;
      resultCount?: number;
      encryptedData?: boolean;
      emergencyAccess?: boolean;
    }
  ) {
    try {
      const auditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        userId,
        actionType,
        resourceType,
        resourceId: resourceId || null,
        organizationId: organizationId || null,
        ipAddress: req?.ip || req?.socket?.remoteAddress || 'unknown',
        userAgent: req?.get('User-Agent') || 'unknown',
        requestMethod: req?.method || 'unknown',
        requestPath: req?.path || 'unknown',
        requestQuery: req?.query ? JSON.stringify(req.query) : null,
        sessionId: req?.sessionID || 'unknown',
        
        // Enhanced context
        dataClassification: additionalContext?.dataClassification || 'internal',
        fieldsAccessed: additionalContext?.fieldAccessed || [],
        queryFilters: additionalContext?.queryFilters ? JSON.stringify(additionalContext.queryFilters) : null,
        resultCount: additionalContext?.resultCount || 0,
        encryptedData: additionalContext?.encryptedData || false,
        emergencyAccess: additionalContext?.emergencyAccess || false,
        
        // Request fingerprint for security analysis
        requestFingerprint: this.generateRequestFingerprint(req),
        
        // Compliance flags
        requiresHipaaCompliance: resourceType === 'health_data',
        requiresFerpaCompliance: resourceType === 'student_data' || resourceType === 'academic_data',
        
        // Risk assessment
        riskLevel: this.assessRiskLevel(actionType, resourceType, additionalContext)
      };
      
      // Store in primary audit log
      const storage = await getStorage();
      await storage.createComplianceAuditLog({
        userId,
        actionType: this.mapActionTypeForStorage(actionType),
        resourceType,
        resourceId,
        ipAddress: auditEntry.ipAddress,
        userAgent: auditEntry.userAgent,
        complianceNotes: JSON.stringify(auditEntry)
      });
      
      // Log to console for immediate monitoring
      console.log('🔍 AUDIT LOG:', {
        user: userId,
        action: `${actionType}:${resourceType}`,
        resource: resourceId,
        risk: auditEntry.riskLevel,
        ip: auditEntry.ipAddress,
        timestamp: auditEntry.timestamp.toISOString()
      });
      
      // Alert on high-risk activities
      if (auditEntry.riskLevel === 'high' || auditEntry.riskLevel === 'critical') {
        await this.alertHighRiskActivity(auditEntry);
      }
      
      return auditEntry.id;
    } catch (error) {
      console.error('❌ Failed to log audit entry:', error);
      // Continue execution - don't fail requests due to audit logging issues
    }
  }
  
  /**
   * Log user authentication and authorization events
   */
  static async logAuthEvent(
    userId: string,
    eventType: 'login' | 'logout' | 'permission_denied' | 'role_change' | 'session_expired' | 'invalid_access',
    req?: Request,
    additionalContext?: {
      attemptedResource?: string;
      deniedPermissions?: string[];
      oldRole?: string;
      newRole?: string;
      failureReason?: string;
    }
  ) {
    try {
      return await this.logDataAccess(
        userId,
        'view',
        'administrative_data',
        undefined,
        undefined,
        req,
        {
          dataClassification: 'internal',
          fieldAccessed: [`auth_event:${eventType}`],
          emergencyAccess: eventType === 'invalid_access'
        }
      );
    } catch (error) {
      console.error('❌ Failed to log auth event:', error);
      // Don't fail the auth process due to audit logging issues
      return undefined;
    }
  }
  
  /**
   * Log health data specific access (HIPAA compliance)
   */
  static async logHealthDataAccess(
    userId: string,
    patientId: string,
    actionType: 'read' | 'write' | 'delete',
    dataFields: string[],
    req?: Request,
    emergencyAccess: boolean = false
  ) {
    return this.logDataAccess(
      userId,
      actionType,
      'health_data',
      patientId,
      undefined,
      req,
      {
        dataClassification: 'phi',
        fieldAccessed: dataFields,
        encryptedData: true,
        emergencyAccess
      }
    );
  }
  
  /**
   * Log academic data access (FERPA compliance)
   */
  static async logAcademicDataAccess(
    userId: string,
    studentId: string,
    actionType: 'read' | 'write' | 'export',
    academicFields: string[],
    req?: Request
  ) {
    return this.logDataAccess(
      userId,
      actionType,
      'academic_data',
      studentId,
      undefined,
      req,
      {
        dataClassification: 'confidential',
        fieldAccessed: academicFields
      }
    );
  }
  
  /**
   * Log budget/financial data access
   */
  static async logBudgetDataAccess(
    userId: string,
    budgetId: string,
    actionType: 'read' | 'write' | 'export',
    organizationId: string,
    req?: Request
  ) {
    return this.logDataAccess(
      userId,
      actionType,
      'budget_data',
      budgetId,
      organizationId,
      req,
      {
        dataClassification: 'confidential'
      }
    );
  }
  
  /**
   * Log data export activities
   */
  static async logDataExport(
    userId: string,
    resourceType: 'student_data' | 'health_data' | 'tournament_data' | 'budget_data',
    exportFormat: 'csv' | 'xlsx' | 'pdf' | 'json',
    recordCount: number,
    req?: Request
  ) {
    return this.logDataAccess(
      userId,
      'export',
      resourceType,
      undefined,
      undefined,
      req,
      {
        dataClassification: resourceType === 'health_data' ? 'phi' : 'confidential',
        fieldAccessed: [`export:${exportFormat}`],
        resultCount: recordCount
      }
    );
  }
  
  /**
   * Generate unique request fingerprint for security analysis
   */
  private static generateRequestFingerprint(req?: Request): string {
    if (!req) return 'unknown';
    
    const fingerprintData = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      acceptLanguage: req.get('Accept-Language'),
      acceptEncoding: req.get('Accept-Encoding'),
      connection: req.get('Connection')
    };
    
    return crypto.createHash('sha256')
      .update(JSON.stringify(fingerprintData))
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Assess risk level of the activity
   */
  private static assessRiskLevel(
    actionType: string,
    resourceType: string,
    context?: {
      emergencyAccess?: boolean;
      resultCount?: number;
      dataClassification?: string;
    }
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Critical risk scenarios
    if (context?.emergencyAccess) return 'critical';
    if (actionType === 'delete' && resourceType === 'health_data') return 'critical';
    if (actionType === 'export' && resourceType === 'health_data') return 'critical';
    
    // High risk scenarios
    if (resourceType === 'health_data' && actionType === 'write') return 'high';
    if (resourceType === 'budget_data') return 'high';
    if (actionType === 'delete') return 'high';
    if (actionType === 'export' && context?.resultCount > 100) return 'high';
    
    // Medium risk scenarios
    if (resourceType === 'health_data') return 'medium';
    if (resourceType === 'academic_data') return 'medium';
    if (actionType === 'write') return 'medium';
    
    // Low risk
    return 'low';
  }
  
  /**
   * Map action types for storage compatibility
   */
  private static mapActionTypeForStorage(actionType: string): 'data_access' | 'data_modification' | 'export' | 'view' | 'login' | 'permission_change' {
    switch (actionType) {
      case 'read':
      case 'view':
        return 'data_access';
      case 'write':
      case 'delete':
        return 'data_modification';
      case 'export':
      case 'download':
        return 'export';
      default:
        return 'data_access';
    }
  }
  
  /**
   * Alert on high-risk activities
   */
  private static async alertHighRiskActivity(auditEntry: {
    userId: string;
    actionType: string;
    resourceType: string;
    riskLevel: string;
    timestamp: Date;
    ipAddress: string;
  }) {
    console.warn('🚨 HIGH RISK ACTIVITY DETECTED:', {
      userId: auditEntry.userId,
      action: auditEntry.actionType,
      resource: auditEntry.resourceType,
      risk: auditEntry.riskLevel,
      timestamp: auditEntry.timestamp,
      ip: auditEntry.ipAddress
    });
    
    // In production, this could:
    // - Send alerts to security team
    // - Trigger additional authentication
    // - Temporarily suspend access
    // - Send notifications to compliance officers
  }
  
  /**
   * Generate compliance reports
   */
  static async generateComplianceReport(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    reportType: 'hipaa' | 'ferpa' | 'full'
  ) {
    try {
      const storage = await getStorage();
      
      // This would query the audit logs and generate reports
      console.log(`📊 Generating ${reportType} compliance report for org ${organizationId} from ${startDate} to ${endDate}`);
      
      // In production, this would generate detailed compliance reports
      return {
        organizationId,
        reportType,
        period: { startDate, endDate },
        totalAccess: 0,
        highRiskActivities: 0,
        complianceViolations: 0,
        recommendations: []
      };
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }
  
  /**
   * Check for unusual access patterns
   */
  static async detectAnomalousActivity(userId: string, timeWindow: number = 3600000) {
    // This would analyze recent audit logs for unusual patterns
    console.log(`🔍 Checking for anomalous activity for user ${userId} in last ${timeWindow}ms`);
    
    // In production, this would implement:
    // - Unusual access time patterns
    // - Excessive data access
    // - Access from unusual locations
    // - Failed permission attempts
    
    return {
      userId,
      anomaliesDetected: false,
      riskScore: 0,
      recommendations: []
    };
  }
}

// Middleware wrapper for automatic audit logging
export function auditMiddleware(
  resourceType: 'student_data' | 'health_data' | 'tournament_data' | 'administrative_data' | 'budget_data' | 'academic_data'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Log the access attempt
    if (req.rbacContext?.user) {
      const actionType = req.method === 'GET' ? 'read' : 
                        req.method === 'POST' ? 'write' :
                        req.method === 'PUT' ? 'write' :
                        req.method === 'PATCH' ? 'write' :
                        req.method === 'DELETE' ? 'delete' : 'view';
      
      await ComprehensiveAuditSystem.logDataAccess(
        req.rbacContext.user.id,
        actionType as 'read' | 'write' | 'delete' | 'view',
        resourceType,
        req.params.id || req.params.resourceId,
        req.rbacContext.organizationId,
        req
      );
    }
    
    next();
  };
}

// Export audit system for use throughout the application
export default ComprehensiveAuditSystem;