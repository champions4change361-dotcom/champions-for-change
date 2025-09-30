import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL_TOURNAMENT) {
  throw new Error('DATABASE_URL_TOURNAMENT environment variable is not set');
}

export default defineConfig({
  out: "./drizzle/tournament",
  schema: "./shared/tournament-schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_TOURNAMENT,
  },
});
