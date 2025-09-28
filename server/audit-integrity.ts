/**
 * AUDIT LOG INTEGRITY VERIFICATION
 * 
 * Basic tamper-evidence system for compliance audit logs
 * Provides integrity verification for HIPAA/FERPA compliance requirements
 */

import crypto from 'crypto';

// Verify audit log integrity hash
export function verifyAuditIntegrity(logEntry: any): boolean {
  try {
    // Extract integrity hash from compliance notes
    const notes = logEntry.complianceNotes || '';
    const integrityMatch = notes.match(/\[INTEGRITY:([a-f0-9]+)\]/);
    
    if (!integrityMatch) {
      console.warn('Audit log missing integrity hash:', logEntry.id);
      return false;
    }
    
    const storedHash = integrityMatch[1];
    
    // Recreate the expected hash
    const dataString = JSON.stringify({
      userId: logEntry.userId,
      actionType: logEntry.actionType,
      resourceType: logEntry.resourceType,
      resourceId: logEntry.resourceId,
      timestamp: logEntry.createdAt?.toISOString() || '',
      ipAddress: logEntry.ipAddress,
      userAgent: logEntry.userAgent
    });
    
    const secret = process.env.AUDIT_INTEGRITY_KEY;
    if (!secret) {
      throw new Error('AUDIT_INTEGRITY_KEY environment variable is required for HIPAA audit integrity');
    }
    const expectedHash = crypto.createHmac('sha256', secret).update(dataString).digest('hex');
    
    const isValid = storedHash === expectedHash;
    
    if (!isValid) {
      console.error('🚨 AUDIT INTEGRITY VIOLATION:', {
        logId: logEntry.id,
        userId: logEntry.userId,
        expected: expectedHash.substring(0, 8) + '...',
        stored: storedHash.substring(0, 8) + '...'
      });
    }
    
    return isValid;
    
  } catch (error) {
    console.error('Audit integrity verification failed:', error);
    return false;
  }
}

// Batch verify multiple audit log entries
export function verifyAuditLogIntegrity(logEntries: any[]): {
  valid: number;
  invalid: number;
  violations: any[];
} {
  const violations: any[] = [];
  let valid = 0;
  let invalid = 0;
  
  for (const entry of logEntries) {
    if (verifyAuditIntegrity(entry)) {
      valid++;
    } else {
      invalid++;
      violations.push({
        id: entry.id,
        userId: entry.userId,
        timestamp: entry.createdAt,
        action: entry.actionType,
        resource: entry.resourceType
      });
    }
  }
  
  return { valid, invalid, violations };
}

// Generate audit summary for compliance reporting
export function generateAuditSummary(logEntries: any[]): {
  totalEntries: number;
  integrityStatus: string;
  healthDataAccess: number;
  academicDataAccess: number;
  dataModifications: number;
  uniqueUsers: number;
  timeRange: { start: string; end: string };
} {
  const integrity = verifyAuditLogIntegrity(logEntries);
  
  const healthDataAccess = logEntries.filter(e => e.resourceType === 'health_data').length;
  const academicDataAccess = logEntries.filter(e => e.resourceType === 'student_data').length;
  const dataModifications = logEntries.filter(e => e.actionType === 'data_modification').length;
  const uniqueUsers = new Set(logEntries.map(e => e.userId)).size;
  
  const timestamps = logEntries.map(e => new Date(e.createdAt)).filter(d => !isNaN(d.getTime()));
  const timeRange = timestamps.length > 0 ? {
    start: new Date(Math.min(...timestamps.map(d => d.getTime()))).toISOString(),
    end: new Date(Math.max(...timestamps.map(d => d.getTime()))).toISOString()
  } : { start: '', end: '' };
  
  return {
    totalEntries: logEntries.length,
    integrityStatus: integrity.invalid === 0 ? 'VERIFIED' : `VIOLATIONS: ${integrity.invalid}`,
    healthDataAccess,
    academicDataAccess,
    dataModifications,
    uniqueUsers,
    timeRange
  };
}