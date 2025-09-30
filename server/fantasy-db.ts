import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as fantasySchema from "../shared/fantasy-schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL_FANTASY) {
  throw new Error(
    "DATABASE_URL_FANTASY must be set. Fantasy database not provisioned.",
  );
}

export const fantasyPool = new Pool({ connectionString: process.env.DATABASE_URL_FANTASY });

export const fantasyDb = drizzle({ client: fantasyPool, schema: fantasySchema });
