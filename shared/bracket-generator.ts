// Shared bracket generator interfaces for FFA tournaments

export interface BracketStructure {
  matches: any[];
  totalRounds: number;
  totalMatches: number;
  format: string;
}

// FREE FOR ALL TOURNAMENT INTERFACES

export interface FFAParticipant {
  id: string;
  name: string;
  email?: string;
  seedNumber?: number;
  skillLevel?: string;
  currentStatus: 'registered' | 'active' | 'eliminated' | 'advanced' | 'finished';
  performanceHistory: FFAPerformance[];
  finalRanking?: number;
  finalScore?: number;
}

export interface FFAPerformance {
  round: number;
  heat?: number;
  result: number;
  ranking: number;
  eliminated?: boolean;
  advancedToNextRound?: boolean;
  timestamp?: string;
}

export interface FFAHeat {
  heatNumber: number;
  heatName?: string;
  participants: string[]; // participant IDs
  startTime?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  results?: FFAHeatResult[];
}

export interface FFAHeatResult {
  participantId: string;
  result: number;
  ranking: number;
  qualified?: boolean;
  eliminated?: boolean;
}

export interface FFARound {
  roundNumber: number;
  roundName: string;
  roundType: 'qualifying' | 'semifinal' | 'final' | 'elimination';
  heats: FFAHeat[];
  advancementCriteria: {
    method: 'top-n' | 'percentage' | 'time-based' | 'score-based';
    count: number;
    threshold?: number;
  };
  eliminationCriteria?: {
    method: 'bottom-n' | 'percentage' | 'score-threshold';
    count: number;
    threshold?: number;
  };
}

// Multi-Heat Racing Structure
export interface MultiHeatRacingStructure extends BracketStructure {
  participants: FFAParticipant[];
  rounds: FFARound[];
  qualifyingHeats: FFAHeat[];
  semifinals: FFAHeat[];
  finals: FFAHeat[];
  leaderboard: FFALeaderboardEntry[];
  heatConfiguration: {
    participantsPerHeat: number;
    qualificationMethod: 'top-n' | 'percentage' | 'time-based';
    qualificationCount: number;
  };
}

export interface FFAStage {
  stageNumber: number;
  stageName: string;
  participantsAtStart: number;
  participantsEliminated: number;
  participantsRemaining: number;
  eliminationCriteria: {
    method: string;
    threshold: number;
  };
  survivors: string[]; // participant IDs
}

export interface FFAElimination {
  participantId: string;
  eliminationRound: number;
  eliminationReason: string;
  finalRanking: number;
  performance: FFAPerformance[];
}

// Battle Royale Structure
export interface BattleRoyaleStructure extends BracketStructure {
  participants: FFAParticipant[];
  eliminationRounds: FFARound[];
  survivalStages: FFAStage[];
  finalSurvivors: FFAParticipant[];
  eliminationHistory: FFAElimination[];
  leaderboard: FFALeaderboardEntry[];
  eliminationRules: {
    method: 'percentage' | 'fixed-number' | 'score-threshold';
    criteria: number;
    finalFieldSize: number;
  };
}

export interface FFAScoringRound {
  roundNumber: number;
  roundName: string;
  participants: string[];
  scoring: FFARoundScore[];
  multiplier: number;
  bonusOpportunities: string[];
}

export interface FFARoundScore {
  participantId: string;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
  ranking: number;
}

export interface FFAScore {
  participantId: string;
  roundScores: number[];
  totalScore: number;
  averageScore: number;
  bestRound: number;
  consistency: number;
}

// Point Accumulation Structure
export interface PointAccumulationStructure extends BracketStructure {
  participants: FFAParticipant[];
  scoringRounds: FFAScoringRound[];
  cumulativeScores: FFAScore[];
  leaderboard: FFALeaderboardEntry[];
  scoringMethodology: {
    pointsPerRound: boolean;
    cumulativeScoring: boolean;
    roundMultipliers: number[];
    bonusPoints: Record<string, number>;
  };
}

export interface FFATrialRound {
  roundNumber: number;
  roundName: string;
  attempts: FFAAttempt[];
  conditions?: Record<string, any>;
}

export interface FFAAttempt {
  participantId: string;
  attemptNumber: number;
  result: number;
  resultUnit: string;
  timestamp: string;
  isPersonalBest: boolean;
  isFoul?: boolean;
  conditions?: Record<string, any>;
}

export interface FFATime {
  participantId: string;
  bestTime: number;
  averageTime: number;
  attempts: FFAAttempt[];
  improvement: number;
}

// Time Trials Structure
export interface TimeTrialsStructure extends BracketStructure {
  participants: FFAParticipant[];
  trialRounds: FFATrialRound[];
  bestTimes: FFATime[];
  leaderboard: FFALeaderboardEntry[];
  trialConfiguration: {
    attemptsPerParticipant: number;
    timingMethod: 'best-time' | 'average-time' | 'cumulative-time';
    allowMultipleAttempts: boolean;
  };
}

// Survival Elimination Structure
export interface SurvivalEliminationStructure extends BracketStructure {
  participants: FFAParticipant[];
  eliminationRounds: FFARound[];
  survivorsByRound: Record<number, string[]>;
  eliminated: FFAElimination[];
  finalSurvivor: FFAParticipant;
  leaderboard: FFALeaderboardEntry[];
  progressiveElimination: {
    roundsToElimination: number;
    eliminationRate: number;
    finalFieldSize: number;
  };
}

// Common FFA Interfaces
export interface FFALeaderboardEntry {
  participantId: string;
  participantName: string;
  currentRanking: number;
  score: number;
  status: 'active' | 'eliminated' | 'finished';
  performance: FFAPerformance[];
}

export interface FFATournamentStructure extends BracketStructure {
  tournamentType: 'multi-heat-racing' | 'battle-royale' | 'point-accumulation' | 'time-trials' | 'survival-elimination';
  participants: FFAParticipant[];
  currentRound: number;
  totalRounds: number;
  leaderboard: FFALeaderboardEntry[];
  isComplete: boolean;
  winner?: FFAParticipant;
  podium?: FFAParticipant[]; // Top 3 finishers
}

// Server-side specific interfaces for bracket generation
export interface MatchData {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  team1?: string;
  team2?: string;
  team1Score: number;
  team2Score: number;
  winner?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  bracket: 'winners' | 'losers' | 'championship';
}