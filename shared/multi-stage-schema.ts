import { z } from "zod";

// Multi-stage tournament configuration schemas
export const stageConfigurationSchema = z.object({
  stages: z.array(z.object({
    stageNumber: z.number(),
    stageName: z.string(), // "Pool Play", "Quarterfinals", "Finals", etc.
    stageType: z.enum(["pool-play", "round-robin", "single-elimination", "double-elimination", "swiss-system", "leaderboard"]),
    groupCount: z.number().optional(), // For pool play
    groupSize: z.number().optional(), // Teams per pool
    advancementRules: z.object({
      teamsAdvancing: z.number(), // How many teams advance from this stage
      advancementCriteria: z.enum(["top-n", "top-percentage", "qualification-score", "all"]),
      minimumScore: z.number().optional(), // For qualification-based advancement
    }),
    scoringMethod: z.enum(["wins", "points", "time", "distance", "placement"]),
    tiebreakers: z.array(z.enum(["head-to-head", "point-differential", "total-points", "best-time", "seeding"])).optional(),
  })),
  overallFormat: z.enum(["pool-to-bracket", "round-robin-to-leaderboard", "swiss-to-elimination", "multi-pool-championship"]),
});

// Pool/Group management
export const poolSchema = z.object({
  poolId: z.string(),
  poolName: z.string(), // "Pool A", "Group 1", etc.
  teams: z.array(z.string()),
  standings: z.array(z.object({
    team: z.string(),
    wins: z.number().default(0),
    losses: z.number().default(0),
    points: z.number().default(0),
    pointDifferential: z.number().default(0),
    tiebreaker: z.number().default(0),
  })),
  matches: z.array(z.object({
    matchId: z.string(),
    team1: z.string(),
    team2: z.string(),
    team1Score: z.number().nullable(),
    team2Score: z.number().nullable(),
    winner: z.string().nullable(),
    round: z.number(),
    completed: z.boolean().default(false),
  })),
  isComplete: z.boolean().default(false),
});

// Swiss system pairings
export const swissRoundSchema = z.object({
  roundNumber: z.number(),
  pairings: z.array(z.object({
    matchId: z.string(),
    team1: z.string(),
    team2: z.string(),
    table: z.number().optional(), // For organized play
    completed: z.boolean().default(false),
    winner: z.string().nullable(),
  })),
  isComplete: z.boolean().default(false),
});

// Stage results for advancement
export const stageResultsSchema = z.object({
  stageNumber: z.number(),
  results: z.array(z.object({
    team: z.string(),
    placement: z.number(),
    score: z.number(),
    qualified: z.boolean(),
    seedForNextStage: z.number().optional(),
  })),
  advancingTeams: z.array(z.string()),
});

export type StageConfiguration = z.infer<typeof stageConfigurationSchema>;
export type Pool = z.infer<typeof poolSchema>;
export type SwissRound = z.infer<typeof swissRoundSchema>;
export type StageResults = z.infer<typeof stageResultsSchema>;

// Common multi-stage tournament formats
export const tournamentFormats = {
  "pool-to-bracket": {
    name: "Pool Play → Single Elimination",
    description: "Teams play in pools, top teams advance to elimination bracket",
    stages: [
      { stageName: "Pool Play", stageType: "round-robin" },
      { stageName: "Bracket", stageType: "single-elimination" }
    ]
  },
  "round-robin-to-leaderboard": {
    name: "Round Robin → Final Rankings",
    description: "All teams play each other, final standings determine placement",
    stages: [
      { stageName: "Round Robin", stageType: "round-robin" },
      { stageName: "Final Rankings", stageType: "leaderboard" }
    ]
  },
  "swiss-to-elimination": {
    name: "Swiss System → Top 8 Bracket",
    description: "Swiss rounds determine seeding for final elimination bracket",
    stages: [
      { stageName: "Swiss Rounds", stageType: "swiss-system" },
      { stageName: "Top 8", stageType: "single-elimination" }
    ]
  },
  "multi-pool-championship": {
    name: "Multi-Pool → Championships",
    description: "Multiple pools feed into championship rounds",
    stages: [
      { stageName: "Pool Play", stageType: "pool-play" },
      { stageName: "Semifinals", stageType: "single-elimination" },
      { stageName: "Finals", stageType: "single-elimination" }
    ]
  }
} as const;