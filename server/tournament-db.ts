import { drizzle } from 'drizzle-orm/neon-http';
import { neon, Pool } from '@neondatabase/serverless';
import * as schema from '../shared/tournament-schema.js';

if (!process.env.DATABASE_URL_TOURNAMENT) {
  throw new Error('DATABASE_URL_TOURNAMENT environment variable is not set');
}

// HTTP client for Drizzle queries
const sql = neon(process.env.DATABASE_URL_TOURNAMENT);
export const tournamentDb = drizzle(sql, { schema });

// Connection pool for raw queries
export const tournamentPool = new Pool({ connectionString: process.env.DATABASE_URL_TOURNAMENT });

console.log('🏆 Tournament database connection initialized');
