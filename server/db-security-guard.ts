/**
 * DATABASE SECURITY GUARD
 * 
 * This module implements runtime checks to prevent direct database access
 * to sensitive data tables outside of the storage layer.
 * 
 * SECURITY: Critical protection against storage layer bypass
 */

import { db } from './db';

// List of sensitive tables that should ONLY be accessed through storage.ts
const SENSITIVE_TABLES = [
  'teams',
  'teamPlayers', 
  'medicalHistory',
  'academicConfigs',
  'healthData',
  'budgetData',
  'studentRecords',
  'complianceAuditLog'
];

// Track which files are allowed to access sensitive tables
const ALLOWED_FILES = [
  'storage.ts',
  'rbac-data-filters.ts', // Security layer
  'monitoring.ts' // Monitoring for security purposes
];

/**
 * Check if the current call stack includes an allowed file
 */
function isAccessAllowed(): boolean {
  const stack = new Error().stack || '';
  
  // Check if the call is coming from an allowed file
  for (const allowedFile of ALLOWED_FILES) {
    if (stack.includes(allowedFile)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Proxy handler to intercept database operations
 */
const dbProxy = new Proxy(db, {
  get(target: any, prop: string) {
    const original = target[prop];
    
    // If it's a function that might access sensitive data
    if (typeof original === 'function') {
      return function(...args: any[]) {
        // For insert, select, update, delete operations
        if (['insert', 'select', 'update', 'delete'].includes(prop)) {
          // Check if this is accessing a sensitive table
          const tableAccess = args[0]?.tableName || args[0]?.name;
          
          if (SENSITIVE_TABLES.includes(tableAccess)) {
            if (!isAccessAllowed()) {
              const error = new Error(
                `SECURITY VIOLATION: Direct access to sensitive table '${tableAccess}' blocked. ` +
                `Use storage layer methods instead.`
              );
              
              console.error('🚨 DATABASE SECURITY VIOLATION:', {
                table: tableAccess,
                operation: prop,
                stack: new Error().stack?.split('\n').slice(0, 5)
              });
              
              throw error;
            }
          }
        }
        
        return original.apply(this, args);
      };
    }
    
    return original;
  }
});

/**
 * Wrapped database instance with security checks
 * Only use this in non-storage files that need database access
 */
export const secureDb = dbProxy;

/**
 * Validate that sensitive operations go through storage layer
 */
export function validateStorageAccess(operation: string, tableName: string): void {
  if (SENSITIVE_TABLES.includes(tableName) && !isAccessAllowed()) {
    throw new Error(
      `SECURITY: ${operation} on ${tableName} must go through storage layer`
    );
  }
}