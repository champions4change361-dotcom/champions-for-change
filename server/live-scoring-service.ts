/**
 * Live Scoring Service - Real-Time Tournament Tracking
 * Provides real-time scoring updates, automatic bracket progression, and live tournament tracking
 * Implements WebSocket/Server-Sent Events for real-time updates
 */

import { randomUUID } from "crypto";
import { WebSocket, WebSocketServer } from 'ws';
import { storage, type SecureUserContext } from "./storage";
import { TournamentService, type MatchResult, type TournamentProgressUpdate } from "./tournament-service";
import type {
  Tournament,
  Match,
  InsertMatch,
  UpdateMatch,
  EventScore,
  InsertEventScore
} from "@shared/schema";

export interface LiveScore {
  matchId: string;
  tournamentId: string;
  currentScore: {
    team1: number;
    team2: number;
  };
  gameState: {
    period: number;
    timeRemaining?: string;
    status: 'pre_game' | 'in_progress' | 'halftime' | 'overtime' | 'final';
  };
  lastUpdated: Date;
  updatedBy: string;
  scoreEvents: ScoreEvent[];
}

export interface ScoreEvent {
  id: string;
  matchId: string;
  eventType: 'goal' | 'point' | 'foul' | 'timeout' | 'substitution' | 'period_end' | 'game_end';
  team: string;
  player?: string;
  timestamp: Date;
  gameTime?: string;
  points: number;
  description: string;
  verified: boolean;
}

export interface ScoringConflict {
  id: string;
  matchId: string;
  conflictType: 'disputed_score' | 'rule_violation' | 'technical_issue' | 'protest';
  reportedBy: string;
  description: string;
  proposedResolution?: string;
  status: 'reported' | 'under_review' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

export interface LiveTournamentUpdate {
  type: 'score_update' | 'match_completed' | 'bracket_progression' | 'tournament_status' | 'conflict_reported';
  tournamentId: string;
  matchId?: string;
  data: any;
  timestamp: Date;
}

export interface ScoreValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedCorrections?: {
    team1Score?: number;
    team2Score?: number;
    winner?: string;
  };
}

export interface BracketProgressionResult {
  progressionMade: boolean;
  newMatches: Match[];
  updatedMatches: Match[];
  tournamentStatus: 'ongoing' | 'completed';
  nextRoundGenerated: boolean;
  eliminatedTeams: string[];
  advancingTeams: string[];
}

export class LiveScoringService {
  private static wss: WebSocketServer | null = null;
  private static connectedClients = new Map<string, Set<WebSocket>>();
  private static scoreBuffer = new Map<string, LiveScore>();

  /**
   * Initialize WebSocket server for real-time updates
   */
  static initializeWebSocketServer(port: number = 8080): void {
    if (this.wss) {
      console.log('WebSocket server already initialized');
      return;
    }

    this.wss = new WebSocketServer({ port });
    
    this.wss.on('connection', (ws: WebSocket, request) => {
      console.log('New WebSocket connection established');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.removeClientConnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log(`Live scoring WebSocket server started on port ${port}`);
  }

  /**
   * Start live scoring for a match
   */
  static async startLiveScoring(
    matchId: string,
    scorerId: string,
    user: SecureUserContext
  ): Promise<LiveScore> {
    try {
      const match = await storage.getMatch(matchId, user);
      if (!match) {
        throw new Error('Match not found');
      }

      // Verify scorer has permission
      await this.verifyScorerPermissions(scorerId, match.tournamentId, user);

      // Initialize live score
      const liveScore: LiveScore = {
        matchId,
        tournamentId: match.tournamentId,
        currentScore: {
          team1: match.team1Score || 0,
          team2: match.team2Score || 0
        },
        gameState: {
          period: 1,
          timeRemaining: undefined,
          status: 'pre_game'
        },
        lastUpdated: new Date(),
        updatedBy: scorerId,
        scoreEvents: []
      };

      this.scoreBuffer.set(matchId, liveScore);

      // Update match status
      await storage.updateMatch(matchId, { 
        status: 'in-progress',
        startTime: new Date()
      }, user);

      // Broadcast match start
      await this.broadcastUpdate({
        type: 'match_started',
        tournamentId: match.tournamentId,
        matchId,
        data: liveScore,
        timestamp: new Date()
      });

      return liveScore;
    } catch (error) {
      console.error('Failed to start live scoring:', error);
      throw new Error(`Failed to start live scoring: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update live score with real-time validation
   */
  static async updateLiveScore(
    matchId: string,
    scoreUpdate: {
      team1Score?: number;
      team2Score?: number;
      gameState?: Partial<LiveScore['gameState']>;
      scoreEvent?: Omit<ScoreEvent, 'id' | 'matchId' | 'timestamp' | 'verified'>;
    },
    scorerId: string,
    user: SecureUserContext
  ): Promise<{
    liveScore: LiveScore;
    validation: ScoreValidation;
    bracketProgression?: BracketProgressionResult;
  }> {
    try {
      const match = await storage.getMatch(matchId, user);
      if (!match) {
        throw new Error('Match not found');
      }

      // Get current live score
      let liveScore = this.scoreBuffer.get(matchId);
      if (!liveScore) {
        throw new Error('Live scoring not started for this match');
      }

      // Validate score update
      const validation = await this.validateScoreUpdate(liveScore, scoreUpdate, match);
      if (!validation.isValid && validation.errors.length > 0) {
        throw new Error(`Score validation failed: ${validation.errors.join(', ')}`);
      }

      // Update live score
      if (scoreUpdate.team1Score !== undefined) {
        liveScore.currentScore.team1 = scoreUpdate.team1Score;
      }
      if (scoreUpdate.team2Score !== undefined) {
        liveScore.currentScore.team2 = scoreUpdate.team2Score;
      }
      if (scoreUpdate.gameState) {
        liveScore.gameState = { ...liveScore.gameState, ...scoreUpdate.gameState };
      }

      liveScore.lastUpdated = new Date();
      liveScore.updatedBy = scorerId;

      // Add score event if provided
      if (scoreUpdate.scoreEvent) {
        const scoreEvent: ScoreEvent = {
          id: randomUUID(),
          matchId,
          timestamp: new Date(),
          verified: true, // Auto-verify for now - could add manual verification later
          ...scoreUpdate.scoreEvent
        };
        liveScore.scoreEvents.push(scoreEvent);
      }

      // Update buffer
      this.scoreBuffer.set(matchId, liveScore);

      // Update match in database
      await storage.updateMatch(matchId, {
        team1Score: liveScore.currentScore.team1,
        team2Score: liveScore.currentScore.team2,
        status: liveScore.gameState.status === 'final' ? 'completed' : 'in-progress'
      }, user);

      // Handle bracket progression if match is complete
      let bracketProgression: BracketProgressionResult | undefined;
      if (liveScore.gameState.status === 'final') {
        bracketProgression = await this.handleMatchCompletion(matchId, liveScore, user);
      }

      // Broadcast update
      await this.broadcastUpdate({
        type: 'score_update',
        tournamentId: match.tournamentId,
        matchId,
        data: {
          liveScore,
          validation,
          bracketProgression
        },
        timestamp: new Date()
      });

      return { liveScore, validation, bracketProgression };
    } catch (error) {
      console.error('Failed to update live score:', error);
      throw new Error(`Failed to update score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete match with final score and automatic bracket progression
   */
  static async completeMatch(
    matchId: string,
    finalResult: MatchResult,
    scorerId: string,
    user: SecureUserContext
  ): Promise<{
    match: Match;
    progression: BracketProgressionResult;
    tournamentUpdate: TournamentProgressUpdate;
  }> {
    try {
      const match = await storage.getMatch(matchId, user);
      if (!match) {
        throw new Error('Match not found');
      }

      // Validate final result
      const validation = await this.validateFinalResult(finalResult, match);
      if (!validation.isValid) {
        throw new Error(`Invalid final result: ${validation.errors.join(', ')}`);
      }

      // Update match with final result using Tournament Service
      const { match: updatedMatch, progressUpdate } = await TournamentService.updateMatchResult(
        matchId,
        finalResult,
        user
      );

      // Handle bracket progression
      const progression = await this.handleMatchCompletion(matchId, null, user);

      // Clean up live scoring data
      this.scoreBuffer.delete(matchId);

      // Broadcast match completion
      await this.broadcastUpdate({
        type: 'match_completed',
        tournamentId: match.tournamentId,
        matchId,
        data: {
          match: updatedMatch,
          progression,
          tournamentUpdate: progressUpdate
        },
        timestamp: new Date()
      });

      return {
        match: updatedMatch,
        progression,
        tournamentUpdate: progressUpdate
      };
    } catch (error) {
      console.error('Failed to complete match:', error);
      throw new Error(`Failed to complete match: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Report scoring conflict or protest
   */
  static async reportScoringConflict(
    conflict: Omit<ScoringConflict, 'id' | 'createdAt' | 'status'>,
    reporterId: string,
    user: SecureUserContext
  ): Promise<ScoringConflict> {
    try {
      const match = await storage.getMatch(conflict.matchId, user);
      if (!match) {
        throw new Error('Match not found');
      }

      const scoringConflict: ScoringConflict = {
        id: randomUUID(),
        ...conflict,
        status: 'reported',
        createdAt: new Date()
      };

      // Store conflict (would need to add to storage interface)
      // For now, just log and broadcast
      console.log('Scoring conflict reported:', scoringConflict);

      // Pause live scoring for critical conflicts
      if (conflict.priority === 'critical') {
        const liveScore = this.scoreBuffer.get(conflict.matchId);
        if (liveScore && liveScore.gameState.status === 'in_progress') {
          liveScore.gameState.status = 'halftime'; // Temporary pause
          this.scoreBuffer.set(conflict.matchId, liveScore);
        }
      }

      // Notify tournament directors
      await this.notifyTournamentDirectors(scoringConflict, match.tournamentId);

      // Broadcast conflict
      await this.broadcastUpdate({
        type: 'conflict_reported',
        tournamentId: match.tournamentId,
        matchId: conflict.matchId,
        data: scoringConflict,
        timestamp: new Date()
      });

      return scoringConflict;
    } catch (error) {
      console.error('Failed to report scoring conflict:', error);
      throw new Error(`Failed to report conflict: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get live tournament dashboard data
   */
  static async getLiveTournamentData(
    tournamentId: string,
    user: SecureUserContext
  ): Promise<{
    tournament: Tournament;
    liveMatches: Array<{ match: Match; liveScore?: LiveScore }>;
    upcomingMatches: Match[];
    completedMatches: Match[];
    brackets: any;
    standings: any[];
    statistics: any;
    conflicts: ScoringConflict[];
  }> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const allMatches = await storage.getMatchesByTournament(tournamentId, user);
      
      // Categorize matches
      const liveMatches = allMatches
        .filter(m => m.status === 'in-progress')
        .map(match => ({
          match,
          liveScore: this.scoreBuffer.get(match.id)
        }));

      const upcomingMatches = allMatches.filter(m => m.status === 'upcoming');
      const completedMatches = allMatches.filter(m => m.status === 'completed');

      // Get tournament statistics
      const statistics = await TournamentService.getTournamentStatistics(tournamentId, user);

      // Get active conflicts (placeholder - would need storage implementation)
      const conflicts: ScoringConflict[] = [];

      return {
        tournament,
        liveMatches,
        upcomingMatches,
        completedMatches,
        brackets: tournament.bracketStructure,
        standings: statistics.standings,
        statistics: statistics.analytics,
        conflicts
      };
    } catch (error) {
      console.error('Failed to get live tournament data:', error);
      throw new Error(`Failed to get tournament data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Subscribe to live tournament updates
   */
  static subscribeToTournament(tournamentId: string, ws: WebSocket): void {
    if (!this.connectedClients.has(tournamentId)) {
      this.connectedClients.set(tournamentId, new Set());
    }
    this.connectedClients.get(tournamentId)!.add(ws);

    // Send initial tournament data
    this.sendTournamentSnapshot(tournamentId, ws);
  }

  /**
   * Get historical scoring data and analytics
   */
  static async getScoringAnalytics(
    tournamentId: string,
    options: {
      includePlayerStats?: boolean;
      includeTeamStats?: boolean;
      includeMatchTrends?: boolean;
    },
    user: SecureUserContext
  ): Promise<{
    tournamentSummary: any;
    playerStats?: any[];
    teamStats?: any[];
    matchTrends?: any[];
    scoringPatterns: any;
  }> {
    try {
      const tournament = await storage.getTournament(tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      const matches = await storage.getMatchesByTournament(tournamentId, user);
      const completedMatches = matches.filter(m => m.status === 'completed');

      // Calculate tournament summary
      const tournamentSummary = {
        totalMatches: matches.length,
        completedMatches: completedMatches.length,
        averageScore: this.calculateAverageScore(completedMatches),
        highestScoringMatch: this.findHighestScoringMatch(completedMatches),
        closestMatch: this.findClosestMatch(completedMatches),
        totalPointsScored: this.calculateTotalPoints(completedMatches)
      };

      // Generate scoring patterns analysis
      const scoringPatterns = this.analyzeScoringPatterns(completedMatches);

      const result: any = {
        tournamentSummary,
        scoringPatterns
      };

      // Optional detailed analytics
      if (options.includeTeamStats) {
        result.teamStats = this.calculateTeamStats(completedMatches);
      }

      if (options.includeMatchTrends) {
        result.matchTrends = this.calculateMatchTrends(completedMatches);
      }

      return result;
    } catch (error) {
      console.error('Failed to generate scoring analytics:', error);
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods

  private static async handleWebSocketMessage(ws: WebSocket, message: any): Promise<void> {
    try {
      switch (message.type) {
        case 'subscribe':
          if (message.tournamentId) {
            this.subscribeToTournament(message.tournamentId, ws);
          }
          break;
        case 'unsubscribe':
          if (message.tournamentId) {
            this.unsubscribeFromTournament(message.tournamentId, ws);
          }
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
          break;
        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({ error: 'Failed to process message' }));
    }
  }

  private static removeClientConnection(ws: WebSocket): void {
    for (const [tournamentId, clients] of this.connectedClients.entries()) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.connectedClients.delete(tournamentId);
      }
    }
  }

  private static unsubscribeFromTournament(tournamentId: string, ws: WebSocket): void {
    const clients = this.connectedClients.get(tournamentId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.connectedClients.delete(tournamentId);
      }
    }
  }

  private static async sendTournamentSnapshot(tournamentId: string, ws: WebSocket): Promise<void> {
    try {
      // This would send initial tournament state to new subscribers
      const snapshot = {
        type: 'tournament_snapshot',
        tournamentId,
        data: {
          // Live match scores
          liveScores: Array.from(this.scoreBuffer.values()).filter(
            score => score.tournamentId === tournamentId
          ),
          timestamp: new Date()
        }
      };
      
      ws.send(JSON.stringify(snapshot));
    } catch (error) {
      console.error('Failed to send tournament snapshot:', error);
    }
  }

  private static async broadcastUpdate(update: LiveTournamentUpdate): Promise<void> {
    const clients = this.connectedClients.get(update.tournamentId);
    if (!clients || clients.size === 0) {
      return;
    }

    const message = JSON.stringify(update);
    const disconnectedClients: WebSocket[] = [];

    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
        } catch (error) {
          console.error('Failed to send WebSocket message:', error);
          disconnectedClients.push(ws);
        }
      } else {
        disconnectedClients.push(ws);
      }
    });

    // Clean up disconnected clients
    disconnectedClients.forEach(ws => clients.delete(ws));
  }

  private static async verifyScorerPermissions(
    scorerId: string,
    tournamentId: string,
    user: SecureUserContext
  ): Promise<void> {
    // Verify user has permission to score matches in this tournament
    // This would integrate with RBAC system
    const allowedRoles = ['tournament_manager', 'assistant_tournament_manager', 'scorekeeper'];
    if (!allowedRoles.includes(user.userRole || '')) {
      throw new Error('Insufficient permissions to score matches');
    }
  }

  private static async validateScoreUpdate(
    liveScore: LiveScore,
    update: any,
    match: Match
  ): Promise<ScoreValidation> {
    const validation: ScoreValidation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate score increases are reasonable
    if (update.team1Score !== undefined && update.team1Score < liveScore.currentScore.team1) {
      validation.warnings.push('Team 1 score decreased - please verify');
    }
    if (update.team2Score !== undefined && update.team2Score < liveScore.currentScore.team2) {
      validation.warnings.push('Team 2 score decreased - please verify');
    }

    // Validate large score jumps
    if (update.team1Score !== undefined) {
      const scoreJump = update.team1Score - liveScore.currentScore.team1;
      if (scoreJump > 10) {
        validation.warnings.push(`Large score increase for Team 1: +${scoreJump} points`);
      }
    }

    if (update.team2Score !== undefined) {
      const scoreJump = update.team2Score - liveScore.currentScore.team2;
      if (scoreJump > 10) {
        validation.warnings.push(`Large score increase for Team 2: +${scoreJump} points`);
      }
    }

    // Validate game state transitions
    if (update.gameState?.status) {
      const validTransitions = this.getValidGameStateTransitions(liveScore.gameState.status);
      if (!validTransitions.includes(update.gameState.status)) {
        validation.errors.push(`Invalid game state transition: ${liveScore.gameState.status} -> ${update.gameState.status}`);
        validation.isValid = false;
      }
    }

    return validation;
  }

  private static async validateFinalResult(result: MatchResult, match: Match): Promise<ScoreValidation> {
    const validation: ScoreValidation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Basic validation
    if (result.team1Score < 0 || result.team2Score < 0) {
      validation.errors.push('Scores cannot be negative');
      validation.isValid = false;
    }

    if (!result.isDraw && !result.winner) {
      validation.errors.push('Winner must be specified for non-draw matches');
      validation.isValid = false;
    }

    if (result.isDraw && result.winner) {
      validation.errors.push('Cannot specify winner for draw matches');
      validation.isValid = false;
    }

    // Check winner consistency
    if (result.winner && !result.isDraw) {
      if (result.team1Score > result.team2Score && result.winner !== match.team1) {
        validation.errors.push('Winner does not match higher score (Team 1)');
        validation.isValid = false;
      } else if (result.team2Score > result.team1Score && result.winner !== match.team2) {
        validation.errors.push('Winner does not match higher score (Team 2)');
        validation.isValid = false;
      }
    }

    return validation;
  }

  private static getValidGameStateTransitions(currentStatus: string): string[] {
    const transitions: Record<string, string[]> = {
      'pre_game': ['in_progress'],
      'in_progress': ['halftime', 'overtime', 'final'],
      'halftime': ['in_progress', 'final'],
      'overtime': ['final'],
      'final': [] // No transitions from final
    };
    
    return transitions[currentStatus] || [];
  }

  private static async handleMatchCompletion(
    matchId: string,
    liveScore: LiveScore | null,
    user: SecureUserContext
  ): Promise<BracketProgressionResult> {
    try {
      const match = await storage.getMatch(matchId, user);
      if (!match) {
        throw new Error('Match not found');
      }

      const tournament = await storage.getTournament(match.tournamentId, user);
      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Get all tournament matches to determine progression
      const allMatches = await storage.getMatchesByTournament(match.tournamentId, user);
      
      // Basic progression result
      const result: BracketProgressionResult = {
        progressionMade: false,
        newMatches: [],
        updatedMatches: [],
        tournamentStatus: 'ongoing',
        nextRoundGenerated: false,
        eliminatedTeams: [],
        advancingTeams: []
      };

      // Determine if this match completion triggers bracket progression
      const currentRound = match.round;
      const roundMatches = allMatches.filter(m => m.round === currentRound);
      const completedRoundMatches = roundMatches.filter(m => m.status === 'completed');

      // If all matches in current round are complete, generate next round
      if (completedRoundMatches.length === roundMatches.length) {
        // This would integrate with bracket generation logic
        result.progressionMade = true;
        result.nextRoundGenerated = true;
        
        // Determine advancing teams
        result.advancingTeams = completedRoundMatches
          .map(m => m.winner)
          .filter(winner => winner !== null) as string[];
        
        // Determine eliminated teams
        const allTeams = new Set<string>();
        roundMatches.forEach(m => {
          if (m.team1) allTeams.add(m.team1);
          if (m.team2) allTeams.add(m.team2);
        });
        
        result.eliminatedTeams = Array.from(allTeams).filter(
          team => !result.advancingTeams.includes(team)
        );
      }

      // Check if tournament is complete
      const hasUncompletedMatches = allMatches.some(m => 
        m.status === 'upcoming' || m.status === 'in-progress'
      );
      
      if (!hasUncompletedMatches) {
        result.tournamentStatus = 'completed';
        
        // Update tournament status
        await storage.updateTournament(match.tournamentId, {
          status: 'completed',
          completedAt: new Date()
        }, user);
      }

      return result;
    } catch (error) {
      console.error('Failed to handle match completion:', error);
      return {
        progressionMade: false,
        newMatches: [],
        updatedMatches: [],
        tournamentStatus: 'ongoing',
        nextRoundGenerated: false,
        eliminatedTeams: [],
        advancingTeams: []
      };
    }
  }

  private static async notifyTournamentDirectors(
    conflict: ScoringConflict,
    tournamentId: string
  ): Promise<void> {
    // Send notifications to tournament directors about scoring conflicts
    console.log('Notifying tournament directors of conflict:', conflict.id);
  }

  // Analytics helper methods

  private static calculateAverageScore(matches: Match[]): number {
    if (matches.length === 0) return 0;
    
    const totalPoints = matches.reduce((sum, match) => 
      sum + (match.team1Score || 0) + (match.team2Score || 0), 0);
    
    return totalPoints / (matches.length * 2);
  }

  private static findHighestScoringMatch(matches: Match[]): Match | null {
    if (matches.length === 0) return null;
    
    return matches.reduce((highest, match) => {
      const matchTotal = (match.team1Score || 0) + (match.team2Score || 0);
      const highestTotal = (highest.team1Score || 0) + (highest.team2Score || 0);
      return matchTotal > highestTotal ? match : highest;
    });
  }

  private static findClosestMatch(matches: Match[]): Match | null {
    if (matches.length === 0) return null;
    
    return matches.reduce((closest, match) => {
      const matchDiff = Math.abs((match.team1Score || 0) - (match.team2Score || 0));
      const closestDiff = Math.abs((closest.team1Score || 0) - (closest.team2Score || 0));
      return matchDiff < closestDiff ? match : closest;
    });
  }

  private static calculateTotalPoints(matches: Match[]): number {
    return matches.reduce((total, match) => 
      total + (match.team1Score || 0) + (match.team2Score || 0), 0);
  }

  private static analyzeScoringPatterns(matches: Match[]): any {
    return {
      averagePointsPerMatch: this.calculateAverageScore(matches) * 2,
      highScoringMatches: matches.filter(m => 
        ((m.team1Score || 0) + (m.team2Score || 0)) > 20).length,
      blowouts: matches.filter(m => 
        Math.abs((m.team1Score || 0) - (m.team2Score || 0)) > 10).length,
      closeGames: matches.filter(m => 
        Math.abs((m.team1Score || 0) - (m.team2Score || 0)) <= 3).length
    };
  }

  private static calculateTeamStats(matches: Match[]): any[] {
    const teamStats = new Map<string, any>();
    
    matches.forEach(match => {
      if (!match.team1 || !match.team2) return;
      
      // Initialize team stats if not exists
      if (!teamStats.has(match.team1)) {
        teamStats.set(match.team1, { 
          team: match.team1, 
          gamesPlayed: 0, 
          wins: 0, 
          losses: 0, 
          pointsFor: 0, 
          pointsAgainst: 0 
        });
      }
      if (!teamStats.has(match.team2)) {
        teamStats.set(match.team2, { 
          team: match.team2, 
          gamesPlayed: 0, 
          wins: 0, 
          losses: 0, 
          pointsFor: 0, 
          pointsAgainst: 0 
        });
      }
      
      const team1Stats = teamStats.get(match.team1);
      const team2Stats = teamStats.get(match.team2);
      
      team1Stats.gamesPlayed++;
      team2Stats.gamesPlayed++;
      team1Stats.pointsFor += match.team1Score || 0;
      team1Stats.pointsAgainst += match.team2Score || 0;
      team2Stats.pointsFor += match.team2Score || 0;
      team2Stats.pointsAgainst += match.team1Score || 0;
      
      if (match.winner === match.team1) {
        team1Stats.wins++;
        team2Stats.losses++;
      } else if (match.winner === match.team2) {
        team2Stats.wins++;
        team1Stats.losses++;
      }
    });
    
    return Array.from(teamStats.values());
  }

  private static calculateMatchTrends(matches: Match[]): any[] {
    // Group matches by date and calculate trends
    const dailyStats = new Map<string, { date: string; totalMatches: number; averageScore: number }>();
    
    matches.forEach(match => {
      const date = new Date(match.createdAt || new Date()).toISOString().split('T')[0];
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { date, totalMatches: 0, averageScore: 0 });
      }
      
      const dayStats = dailyStats.get(date)!;
      dayStats.totalMatches++;
      dayStats.averageScore += ((match.team1Score || 0) + (match.team2Score || 0)) / 2;
    });
    
    // Calculate averages
    Array.from(dailyStats.values()).forEach(day => {
      if (day.totalMatches > 0) {
        day.averageScore = day.averageScore / day.totalMatches;
      }
    });
    
    return Array.from(dailyStats.values());
  }
}