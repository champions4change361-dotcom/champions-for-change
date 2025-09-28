import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// SECURITY: Runtime check to prevent direct access to sensitive tables outside storage layer
const originalDb = drizzle({ client: pool, schema });

// Sensitive tables that MUST go through storage layer for RBAC/audit compliance
const SENSITIVE_TABLES = ['teams', 'teamPlayers', 'medicalHistory', 'academicConfigs', 'healthData', 'budgetData'];

// Create a proxy to detect direct access to sensitive tables
export const db = new Proxy(originalDb, {
  get(target: any, prop: string) {
    const original = target[prop];
    
    // Check if accessing a sensitive table directly
    if (SENSITIVE_TABLES.includes(prop)) {
      const stack = new Error().stack || '';
      
      // Allow access only from storage.ts and security-related files
      if (!stack.includes('storage.ts') && 
          !stack.includes('rbac-data-filters.ts') && 
          !stack.includes('monitoring.ts')) {
        
        console.error(`🚨 SECURITY: Direct access to sensitive table '${prop}' blocked. Use storage layer methods.`);
        throw new Error(`SECURITY VIOLATION: Direct access to '${prop}' table blocked. Use storage layer methods for RBAC compliance.`);
      }
    }
    
    return original;
  }
});
