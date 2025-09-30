import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL_FANTASY) {
  throw new Error("DATABASE_URL_FANTASY not found - ensure the fantasy database is provisioned");
}

export default defineConfig({
  out: "./migrations/fantasy",
  schema: "./shared/fantasy-schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_FANTASY,
  },
});
