import { z } from "zod";

// Enhanced tiebreaker system
export const tiebreakerSchema = z.object({
  method: z.enum([
    "head-to-head-record", 
    "point-differential", 
    "total-points-scored",
    "total-points-allowed",
    "wins-vs-common-opponents",
    "strength-of-schedule",
    "random-draw",
    "coin-flip",
    "highest-seed",
    "goals-against",
    "most-recent-result",
    "overtime-wins"
  ]),
  priority: z.number(), // 1 = highest priority
  description: z.string().optional(),
});

// Advanced stage configuration with professional options
export const stageConfigurationSchema = z.object({
  stages: z.array(z.object({
    stageNumber: z.number(),
    stageName: z.string(),
    stageType: z.enum([
      "pool-play", 
      "round-robin", 
      "single-elimination", 
      "double-elimination", 
      "swiss-system", 
      "leaderboard",
      "group-stage",
      "playoff-bracket",
      "consolation-bracket"
    ]),
    
    // Pool/Group configuration
    poolConfiguration: z.object({
      poolCount: z.number().min(1).max(16).default(4), // Number of pools/groups
      teamsPerPool: z.number().min(3).max(8).default(4), // Teams per pool
      poolNamingScheme: z.enum(["letters", "numbers", "custom"]).default("letters"),
      customPoolNames: z.array(z.string()).optional(),
      balancedGroups: z.boolean().default(true), // Balance skill levels across pools
    }).optional(),
    
    // Swiss system configuration
    swissConfiguration: z.object({
      roundCount: z.number().min(3).max(15), // Number of Swiss rounds
      pairingMethod: z.enum(["swiss", "accelerated-swiss", "modified-swiss"]).default("swiss"),
      allowColorPreference: z.boolean().default(true), // For games with sides (chess, etc.)
      avoidRematches: z.boolean().default(true),
      strengthPairing: z.boolean().default(true), // Pair teams with similar records
    }).optional(),
    
    // Advancement rules with enhanced options
    advancementRules: z.object({
      advancementType: z.enum(["top-n-per-pool", "top-n-overall", "percentage", "points-threshold", "playoff-format", "all-advance"]),
      
      // Top N advancement
      teamsAdvancingPerPool: z.number().min(0).max(8).optional(), // Per pool advancement
      totalTeamsAdvancing: z.number().min(0).optional(), // Total teams advancing regardless of pool
      advancementPercentage: z.number().min(0).max(100).optional(), // Percentage of teams advancing
      
      // Threshold-based advancement
      pointsThreshold: z.number().optional(),
      minimumWins: z.number().optional(),
      minimumWinPercentage: z.number().min(0).max(100).optional(),
      
      // Advanced seeding for next stage
      seedingMethod: z.enum([
        "pool-standings", 
        "overall-record", 
        "cross-pool-record",
        "head-to-head-tiebreaker",
        "strength-of-schedule",
        "random"
      ]).default("pool-standings"),
      
      // Wildcard advancement (best losers across pools)
      wildcardSpots: z.number().min(0).default(0),
      wildcardCriteria: z.enum(["best-record", "best-point-differential", "best-strength-of-schedule"]).default("best-record"),
    }),
    
    // Scoring and match configuration
    matchConfiguration: z.object({
      scoringMethod: z.enum(["wins-losses", "points", "time-based", "distance", "placement", "elimination"]),
      pointsPerWin: z.number().default(3),
      pointsPerDraw: z.number().default(1),
      pointsPerLoss: z.number().default(0),
      allowDraws: z.boolean().default(false),
      overtimeRules: z.boolean().default(false),
      maxOvertimePeriods: z.number().min(0).max(5).default(1),
    }),
    
    // Professional tiebreaker system
    tiebreakers: z.array(tiebreakerSchema).default([
      { method: "head-to-head-record", priority: 1 },
      { method: "point-differential", priority: 2 },
      { method: "total-points-scored", priority: 3 },
    ]),
    
    // Stage completion and progression rules
    completionCriteria: z.object({
      requireAllMatches: z.boolean().default(true),
      allowIncompleteAdvancement: z.boolean().default(false),
      minimumMatchesForAdvancement: z.number().min(0).optional(),
    }),
    
    // Automatic progression settings
    autoAdvancement: z.object({
      enabled: z.boolean().default(true),
      advanceImmediately: z.boolean().default(false), // Advance as soon as criteria met
      requireManualConfirmation: z.boolean().default(false),
      notifyStakeholders: z.boolean().default(true),
    }),
  })),
  
  // Overall tournament format and flow
  overallFormat: z.enum([
    "pool-to-single-elimination",
    "pool-to-double-elimination", 
    "round-robin-to-leaderboard", 
    "swiss-to-single-elimination",
    "swiss-to-double-elimination",
    "multi-pool-championship",
    "group-stage-to-knockout",
    "pool-play-with-consolation",
    "custom-multi-stage"
  ]),
  
  // Tournament-wide settings
  globalSettings: z.object({
    allowByes: z.boolean().default(true),
    defaultMatchTime: z.number().optional(), // Minutes
    breakTimeBetweenStages: z.number().default(15), // Minutes
    useStandardSeeding: z.boolean().default(true),
    trackDetailedStats: z.boolean().default(true),
  }).optional(),
});

// Enhanced Pool/Group management with professional features
export const poolSchema = z.object({
  poolId: z.string(),
  poolName: z.string(), // "Pool A", "Group 1", etc.
  poolIndex: z.number(), // 0-based pool index for seeding calculations
  teams: z.array(z.string()),
  maxTeams: z.number().min(3).max(8).default(4),
  
  // Enhanced standings with comprehensive statistics
  standings: z.array(z.object({
    team: z.string(),
    teamId: z.string().optional(),
    
    // Basic record
    matchesPlayed: z.number().default(0),
    wins: z.number().default(0),
    losses: z.number().default(0),
    draws: z.number().default(0),
    
    // Point-based standings
    points: z.number().default(0), // Tournament points (3 for win, 1 for draw, etc.)
    gamePoints: z.number().default(0), // Actual points scored in games
    pointsAllowed: z.number().default(0),
    pointDifferential: z.number().default(0),
    
    // Advanced metrics
    winPercentage: z.number().default(0),
    strengthOfSchedule: z.number().default(0), // Average opponent win percentage
    headToHeadResults: z.record(z.string(), z.object({
      wins: z.number(),
      losses: z.number(),
      pointsFor: z.number(),
      pointsAgainst: z.number(),
    })).default({}),
    
    // Tiebreaker values
    tiebreakerValues: z.record(z.string(), z.number()).default({}),
    
    // Qualification status
    qualified: z.boolean().default(false),
    advancementSeed: z.number().optional(),
    advancementReason: z.string().optional(), // "Pool Winner", "Wildcard", etc.
    
    // Performance tracking
    averageScore: z.number().default(0),
    highestScore: z.number().default(0),
    lowestScore: z.number().default(0),
    overtimeWins: z.number().default(0),
  })),
  
  // Enhanced match tracking
  matches: z.array(z.object({
    matchId: z.string(),
    team1: z.string(),
    team2: z.string(),
    team1Score: z.number().nullable(),
    team2Score: z.number().nullable(),
    winner: z.string().nullable(),
    isDraw: z.boolean().default(false),
    round: z.number(),
    matchNumber: z.number().optional(), // Sequential match number in pool
    
    // Extended match details
    completed: z.boolean().default(false),
    status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).default("scheduled"),
    startTime: z.string().optional(), // ISO timestamp
    endTime: z.string().optional(),
    duration: z.number().optional(), // Minutes
    venue: z.string().optional(),
    
    // Advanced scoring
    overtimePeriods: z.number().default(0),
    team1Stats: z.record(z.string(), z.number()).optional(), // Custom stats
    team2Stats: z.record(z.string(), z.number()).optional(),
    
    // Officials and tracking
    referee: z.string().optional(),
    scorekeeper: z.string().optional(),
    notes: z.string().optional(),
  })),
  
  // Pool status and completion
  isComplete: z.boolean().default(false),
  completionPercentage: z.number().default(0),
  advancementCalculated: z.boolean().default(false),
  
  // Pool settings inheritance from stage configuration
  poolSettings: z.object({
    pointsPerWin: z.number().default(3),
    pointsPerDraw: z.number().default(1),
    pointsPerLoss: z.number().default(0),
    allowDraws: z.boolean().default(false),
    tiebreakingOrder: z.array(z.string()).default([]),
  }).optional(),
});

// Enhanced Swiss system with professional tournament management
export const swissRoundSchema = z.object({
  roundNumber: z.number(),
  maxRounds: z.number(),
  
  // Professional Swiss pairings
  pairings: z.array(z.object({
    matchId: z.string(),
    pairingNumber: z.number(),
    team1: z.string(),
    team2: z.string(),
    table: z.number().optional(),
    board: z.number().optional(), // For chess/gaming tournaments
    
    // Swiss-specific data
    team1Score: z.number().optional(), // Current tournament points before this match
    team2Score: z.number().optional(),
    team1Color: z.enum(["white", "black", "home", "away"]).optional(),
    team2Color: z.enum(["white", "black", "home", "away"]).optional(),
    
    // Match tracking
    completed: z.boolean().default(false),
    result: z.enum(["team1-wins", "team2-wins", "draw", "double-forfeit"]).optional(),
    winner: z.string().nullable(),
    actualScore1: z.number().optional(), // Game score
    actualScore2: z.number().optional(),
    
    // Pairing logic tracking
    colorBalance: z.boolean().default(false), // Whether pairing helps color balance
    avoidedRematch: z.boolean().default(true),
    scoreDifference: z.number().default(0), // Tournament score difference between opponents
    
    // Timing and logistics
    scheduledTime: z.string().optional(),
    actualStartTime: z.string().optional(),
    duration: z.number().optional(),
  })),
  
  // Round status and management
  isComplete: z.boolean().default(false),
  pairingMethod: z.enum(["swiss", "accelerated-swiss", "modified-swiss"]).default("swiss"),
  
  // Swiss tournament standings after this round
  standings: z.array(z.object({
    team: z.string(),
    rank: z.number(),
    tournamentPoints: z.number(), // Swiss points (1 per win, 0.5 per draw)
    gamePoints: z.number().default(0), // Actual score points
    opponentPoints: z.number().default(0), // Sum of opponent tournament points (Buchholz)
    colorBalance: z.number().default(0), // +1 for each white/home, -1 for each black/away
    strengthOfSchedule: z.number().default(0),
    
    // Detailed record
    wins: z.number().default(0),
    draws: z.number().default(0),
    losses: z.number().default(0),
    
    // Qualification tracking
    qualificationStatus: z.enum(["qualified", "eliminated", "in-contention"]).optional(),
    projectedFinalScore: z.number().optional(),
  })).default([]),
  
  // Advanced Swiss features
  roundSettings: z.object({
    allowColorImbalance: z.boolean().default(false),
    maxColorImbalance: z.number().default(2),
    avoidRematches: z.boolean().default(true),
    minimumScoreSpread: z.number().default(0), // Minimum tournament point difference for pairing
    acceleratedPairings: z.boolean().default(false), // Top players face each other early
  }).optional(),
});

// Comprehensive stage results and advancement tracking
export const stageResultsSchema = z.object({
  stageNumber: z.number(),
  stageName: z.string(),
  stageType: z.string(),
  
  // Complete results with detailed statistics
  results: z.array(z.object({
    team: z.string(),
    teamId: z.string().optional(),
    finalPlacement: z.number(),
    
    // Performance metrics
    record: z.object({
      wins: z.number(),
      losses: z.number(),
      draws: z.number(),
      totalMatches: z.number(),
      winPercentage: z.number(),
    }),
    
    // Scoring statistics
    scoring: z.object({
      tournamentPoints: z.number(), // Points earned in stage
      gamePointsFor: z.number(), // Actual points scored
      gamePointsAgainst: z.number(),
      pointDifferential: z.number(),
      averageScore: z.number(),
    }),
    
    // Advanced metrics
    strengthOfSchedule: z.number().default(0),
    qualityWins: z.number().default(0), // Wins against top-tier opponents
    performanceRating: z.number().optional(), // Calculated performance metric
    
    // Advancement determination
    qualified: z.boolean(),
    advancementMethod: z.enum([
      "pool-winner", 
      "runner-up", 
      "wildcard", 
      "points-threshold", 
      "automatic", 
      "bye"
    ]).optional(),
    seedForNextStage: z.number().optional(),
    nextStageBracketPosition: z.number().optional(),
    
    // Detailed advancement reasoning
    advancementDetails: z.object({
      poolId: z.string().optional(),
      poolPlacement: z.number().optional(),
      tiebreakersUsed: z.array(z.string()).default([]),
      marginOfAdvancement: z.number().optional(), // How close was advancement
    }).optional(),
    
    // Performance tracking
    momentum: z.enum(["hot", "cold", "steady"]).optional(), // Recent performance trend
    keyResults: z.array(z.string()).default([]), // Notable wins/losses
  })),
  
  // Stage-wide advancement summary
  advancementSummary: z.object({
    totalTeamsAdvancing: z.number(),
    advancementByMethod: z.record(z.string(), z.number()), // Count by advancement method
    tiebreadersRequired: z.boolean().default(false),
    controversialAdvancement: z.boolean().default(false), // Indicates close tiebreaker decisions
  }),
  
  // Teams advancing to next stage
  advancingTeams: z.array(z.string()),
  eliminatedTeams: z.array(z.string()),
  
  // Seeding for next stage
  nextStageSeeding: z.array(z.object({
    team: z.string(),
    seed: z.number(),
    bracketPosition: z.number(),
    seedingJustification: z.string(), // Explanation of seeding
  })).optional(),
  
  // Stage completion metadata
  completedAt: z.string().optional(), // ISO timestamp
  advancementConfirmedBy: z.string().optional(), // Tournament director/system
  nextStageReady: z.boolean().default(false),
});

// Additional schemas for stage transitions and management

// Stage transition engine schema
export const stageTransitionSchema = z.object({
  fromStage: z.number(),
  toStage: z.number(),
  transitionType: z.enum(["automatic", "manual", "conditional"]),
  
  // Transition conditions
  conditions: z.object({
    allMatchesComplete: z.boolean().default(true),
    minimumParticipation: z.number().default(100), // Percentage
    advancementThresholdMet: z.boolean().default(true),
    manualApprovalRequired: z.boolean().default(false),
  }),
  
  // Seeding rules for next stage
  seedingRules: z.object({
    method: z.enum([
      "pool-rankings", 
      "overall-record", 
      "cross-pool-comparison",
      "swiss-rankings",
      "performance-rating",
      "manual-seeding"
    ]),
    
    // Cross-pool seeding configuration
    crossPoolSeeding: z.object({
      enabled: z.boolean().default(true),
      seedingPattern: z.enum(["snake", "straight", "balanced"]).default("snake"),
      // Snake: A1,B1,C1,D1,D2,C2,B2,A2 (best pools face worst)
      // Straight: A1,A2,B1,B2,C1,C2,D1,D2 (pool order maintained)  
      // Balanced: A1,C1,B1,D1,D2,B2,C2,A2 (balanced bracket)
    }),
    
    // Wildcard seeding
    wildcardSeeding: z.object({
      enabled: z.boolean().default(false),
      wildcardCount: z.number().min(0).max(8).default(0),
      wildcardCriteria: z.enum([
        "best-losing-record",
        "highest-point-differential", 
        "strength-of-schedule",
        "head-to-head-performance"
      ]).default("best-losing-record"),
    }),
  }),
  
  // Bracket generation settings
  bracketGeneration: z.object({
    bracketType: z.enum(["single-elimination", "double-elimination", "round-robin", "swiss"]),
    bracketSize: z.number().optional(), // Override if different from advancing teams
    includeConsolationBracket: z.boolean().default(false),
    reseeding: z.boolean().default(false), // Re-seed after each round
    
    // Advanced bracket options
    balancedBrackets: z.boolean().default(true), // Avoid same-pool matchups early
    geographicConsiderations: z.boolean().default(false),
    timeConstraints: z.boolean().default(false),
  }),
  
  // Transition metadata
  estimatedTransitionTime: z.number().optional(), // Minutes between stages
  notificationSettings: z.object({
    notifyParticipants: z.boolean().default(true),
    notifyOfficials: z.boolean().default(true),
    publicAnnouncement: z.boolean().default(true),
  }).optional(),
});

// Tournament state management schema  
export const tournamentStateSchema = z.object({
  tournamentId: z.string(),
  currentStage: z.number(),
  totalStages: z.number(),
  
  // Stage status tracking
  stageStatuses: z.record(z.string(), z.enum([
    "not-started",
    "in-progress", 
    "completed",
    "cancelled",
    "delayed"
  ])),
  
  // Overall tournament progress
  overallProgress: z.object({
    percentComplete: z.number().min(0).max(100),
    matchesCompleted: z.number(),
    totalMatches: z.number(),
    participantsRemaining: z.number(),
    eliminatedParticipants: z.number(),
  }),
  
  // Current stage details
  currentStageInfo: z.object({
    stageName: z.string(),
    stageType: z.string(),
    stageProgress: z.number().min(0).max(100),
    estimatedCompletionTime: z.string().optional(), // ISO timestamp
    criticalPath: z.boolean().default(false), // Is this stage on critical path for tournament completion
  }).optional(),
  
  // Next stage preparation
  nextStagePreparation: z.object({
    readyForAdvancement: z.boolean().default(false),
    advancementCalculated: z.boolean().default(false),
    bracketGenerated: z.boolean().default(false),
    participantsNotified: z.boolean().default(false),
    scheduleCreated: z.boolean().default(false),
  }).optional(),
  
  // Tournament-wide statistics
  tournamentStats: z.object({
    averageMatchDuration: z.number().default(0),
    totalPlayTime: z.number().default(0),
    upsetCount: z.number().default(0), // Lower seeds beating higher seeds
    overtimeMatches: z.number().default(0),
    closestMatch: z.object({
      matchId: z.string(),
      margin: z.number(),
      description: z.string(),
    }).optional(),
  }).optional(),
});

// Export all types
export type TiebreakerRule = z.infer<typeof tiebreakerSchema>;
export type StageConfiguration = z.infer<typeof stageConfigurationSchema>;
export type Pool = z.infer<typeof poolSchema>;
export type SwissRound = z.infer<typeof swissRoundSchema>;
export type StageResults = z.infer<typeof stageResultsSchema>;
export type StageTransition = z.infer<typeof stageTransitionSchema>;
export type TournamentState = z.infer<typeof tournamentStateSchema>;

// Professional multi-stage tournament formats with enhanced configurations
export const professionalTournamentFormats = {
  "pool-to-single-elimination": {
    name: "Pool Play → Single Elimination",
    description: "Round robin pool play followed by single elimination bracket with cross-pool seeding",
    complexity: "intermediate",
    recommendedParticipants: { min: 8, max: 64, optimal: 16 },
    stages: [
      {
        stageName: "Pool Play",
        stageType: "pool-play",
        poolConfiguration: {
          poolCount: 4,
          teamsPerPool: 4,
          poolNamingScheme: "letters",
          balancedGroups: true,
        },
        advancementRules: {
          advancementType: "top-n-per-pool",
          teamsAdvancingPerPool: 2,
          wildcardSpots: 0,
        },
        tiebreakers: [
          { method: "head-to-head-record", priority: 1 },
          { method: "point-differential", priority: 2 },
          { method: "total-points-scored", priority: 3 },
        ],
      },
      {
        stageName: "Elimination Bracket",
        stageType: "single-elimination",
        advancementRules: {
          advancementType: "all-advance",
          seedingMethod: "pool-standings",
        },
      }
    ],
    globalSettings: {
      allowByes: true,
      useStandardSeeding: true,
      trackDetailedStats: true,
    }
  },
  
  "pool-to-double-elimination": {
    name: "Pool Play → Double Elimination",
    description: "Pool play qualifiers compete in double elimination bracket with losers bracket",
    complexity: "advanced",
    recommendedParticipants: { min: 12, max: 32, optimal: 16 },
    stages: [
      {
        stageName: "Pool Play",
        stageType: "pool-play",
        poolConfiguration: {
          poolCount: 4,
          teamsPerPool: 4,
          balancedGroups: true,
        },
        advancementRules: {
          advancementType: "top-n-per-pool",
          teamsAdvancingPerPool: 2,
          wildcardSpots: 0,
        },
      },
      {
        stageName: "Double Elimination Bracket",
        stageType: "double-elimination",
        advancementRules: {
          seedingMethod: "cross-pool-record",
        },
      }
    ]
  },

  "swiss-to-single-elimination": {
    name: "Swiss System → Single Elimination",
    description: "Swiss rounds for qualification followed by top performer elimination bracket",
    complexity: "intermediate", 
    recommendedParticipants: { min: 16, max: 128, optimal: 32 },
    stages: [
      {
        stageName: "Swiss Rounds",
        stageType: "swiss-system",
        swissConfiguration: {
          roundCount: 5,
          pairingMethod: "swiss",
          avoidRematches: true,
          strengthPairing: true,
        },
        advancementRules: {
          advancementType: "top-n-overall",
          totalTeamsAdvancing: 8,
          minimumWinPercentage: 60,
        },
      },
      {
        stageName: "Top 8 Bracket", 
        stageType: "single-elimination",
        advancementRules: {
          seedingMethod: "overall-record",
        },
      }
    ]
  },

  "swiss-to-double-elimination": {
    name: "Swiss System → Double Elimination",
    description: "Swiss qualification rounds feeding into comprehensive double elimination playoffs",
    complexity: "expert",
    recommendedParticipants: { min: 32, max: 256, optimal: 64 },
    stages: [
      {
        stageName: "Swiss Qualification",
        stageType: "swiss-system", 
        swissConfiguration: {
          roundCount: 7,
          pairingMethod: "swiss",
          acceleratedPairings: true,
        },
        advancementRules: {
          advancementType: "top-n-overall",
          totalTeamsAdvancing: 16,
          pointsThreshold: 4, // Minimum Swiss points to advance
        },
      },
      {
        stageName: "Double Elimination Playoffs",
        stageType: "double-elimination",
        advancementRules: {
          seedingMethod: "overall-record",
        },
      }
    ]
  },

  "multi-pool-championship": {
    name: "Multi-Pool Championship Series",
    description: "Multiple pool stages with cross-bracket semifinals and championship finals",
    complexity: "expert",
    recommendedParticipants: { min: 16, max: 48, optimal: 24 },
    stages: [
      {
        stageName: "Group Stage",
        stageType: "pool-play",
        poolConfiguration: {
          poolCount: 6,
          teamsPerPool: 4,
          balancedGroups: true,
        },
        advancementRules: {
          advancementType: "top-n-per-pool",
          teamsAdvancingPerPool: 2,
          wildcardSpots: 4, // Best third-place finishers
          wildcardCriteria: "best-record",
        },
      },
      {
        stageName: "Round of 16",
        stageType: "single-elimination",
        advancementRules: {
          seedingMethod: "cross-pool-record",
        },
      },
      {
        stageName: "Championship Bracket",
        stageType: "single-elimination",
      }
    ]
  },

  "round-robin-enhanced": {
    name: "Enhanced Round Robin with Finals",
    description: "Complete round robin followed by top-4 championship bracket",
    complexity: "beginner",
    recommendedParticipants: { min: 6, max: 16, optimal: 10 },
    stages: [
      {
        stageName: "Round Robin",
        stageType: "round-robin",
        advancementRules: {
          advancementType: "top-n-overall", 
          totalTeamsAdvancing: 4,
        },
        tiebreakers: [
          { method: "head-to-head-record", priority: 1 },
          { method: "point-differential", priority: 2 },
          { method: "total-points-scored", priority: 3 },
          { method: "coin-flip", priority: 4 },
        ],
      },
      {
        stageName: "Championship Semifinals",
        stageType: "single-elimination",
        advancementRules: {
          seedingMethod: "overall-record",
        },
      },
      {
        stageName: "Championship Final",
        stageType: "single-elimination",
      }
    ]
  }
} as const;

// Tournament format validation and utilities
export const validateTournamentFormat = (format: keyof typeof professionalTournamentFormats, participantCount: number) => {
  const formatConfig = professionalTournamentFormats[format];
  const { min, max } = formatConfig.recommendedParticipants;
  
  return {
    valid: participantCount >= min && participantCount <= max,
    recommended: participantCount >= formatConfig.recommendedParticipants.optimal * 0.75 &&
                 participantCount <= formatConfig.recommendedParticipants.optimal * 1.25,
    suggestions: participantCount < min ? [`Need at least ${min} participants`] :
                 participantCount > max ? [`Maximum ${max} participants recommended`] : [],
  };
};

// Stage transition configuration helpers
export const createStageTransition = (
  fromStage: number, 
  toStage: number, 
  config: Partial<StageTransition> = {}
): StageTransition => {
  return {
    fromStage,
    toStage,
    transitionType: "automatic",
    conditions: {
      allMatchesComplete: true,
      minimumParticipation: 100,
      advancementThresholdMet: true,
      manualApprovalRequired: false,
    },
    seedingRules: {
      method: "pool-rankings",
      crossPoolSeeding: {
        enabled: true,
        seedingPattern: "snake",
      },
      wildcardSeeding: {
        enabled: false,
        wildcardCount: 0,
        wildcardCriteria: "best-losing-record",
      },
    },
    bracketGeneration: {
      bracketType: "single-elimination",
      includeConsolationBracket: false,
      reseeding: false,
      balancedBrackets: true,
      geographicConsiderations: false,
      timeConstraints: false,
    },
    ...config,
  };
};