import { drizzle } from 'drizzle-orm/neon-http';
import { neon, Pool } from '@neondatabase/serverless';
import * as schema from '../shared/tournament-schema.js';

// Optional Tournament DB - gracefully handle missing env var during development
const DATABASE_URL_TOURNAMENT = process.env.DATABASE_URL_TOURNAMENT;

// Placeholder error function
function throwNotConfigured(): never {
  throw new Error('Tournament database not configured - DATABASE_URL_TOURNAMENT environment variable is required');
}

// Export tournament database (throws if used without env var)
export const tournamentDb = DATABASE_URL_TOURNAMENT
  ? drizzle(neon(DATABASE_URL_TOURNAMENT), { schema })
  : new Proxy({} as any, { get: throwNotConfigured });

export const tournamentPool = DATABASE_URL_TOURNAMENT
  ? new Pool({ connectionString: DATABASE_URL_TOURNAMENT })
  : new Proxy({} as any, { get: throwNotConfigured });

if (DATABASE_URL_TOURNAMENT) {
  console.log('🏆 Tournament database connection initialized');
} else {
  console.warn('⚠️  DATABASE_URL_TOURNAMENT not set - tournament database features disabled');
}
