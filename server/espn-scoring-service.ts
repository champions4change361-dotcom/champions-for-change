// 🏈 ESPN REAL-TIME SCORING SERVICE
// Fetches live player stats and updates fantasy lineups automatically

import { ESPNApiService } from './espn-api';
import type { IStorage } from './storage';

export interface PlayerStats {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  // Passing stats
  passingYards: number;
  passingTDs: number;
  interceptions: number;
  // Rushing stats  
  rushingYards: number;
  rushingTDs: number;
  // Receiving stats
  receptions: number;
  receivingYards: number;
  receivingTDs: number;
  // Kicking stats
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  extraPointsMade: number;
  // Defense stats
  sacks: number;
  safeties: number;
  defensive_TDs: number;
  interceptionTDs: number;
  fumbleRecoveryTDs: number;
  // Meta
  gameStatus: 'not_started' | 'in_progress' | 'completed' | 'postponed';
  lastUpdated: string;
}

export interface ScoringConfig {
  // Passing scoring
  passingYard: number;
  passingTD: number;
  interception: number;
  // Rushing scoring
  rushingYard: number;
  rushingTD: number;
  // Receiving scoring
  reception: number;
  receivingYard: number;
  receivingTD: number;
  // Kicking scoring
  fieldGoal: number;
  extraPoint: number;
  // Defense scoring
  sack: number;
  safety: number;
  defensiveTD: number;
  // Bonus scoring
  longTD_bonus: number; // 40+ yard TD bonus
  longRush_bonus: number; // 40+ yard rush bonus
  longReceiving_bonus: number; // 40+ yard reception bonus
}

export interface FantasyLineup {
  id: string;
  userId: string;
  gameInstanceId: string;
  lineup: {
    position: string;
    playerId: string;
    playerName: string;
    playerTeam: string;
    salary: number;
    projectedPoints?: number;
  }[] | null;
  currentScore: string | number | null;
  isSubmitted: boolean;
  submittedAt?: Date | string | null;
}

export class ESPNScoringService {
  private storage: IStorage;
  private updateInterval: NodeJS.Timeout | null = null;
  
  // Standard PPR scoring configuration
  private static readonly STANDARD_SCORING: ScoringConfig = {
    // Passing (1 point per 25 yards, 4 pts per TD)
    passingYard: 0.04,
    passingTD: 4,
    interception: -2,
    // Rushing (1 point per 10 yards, 6 pts per TD)
    rushingYard: 0.1,
    rushingTD: 6,
    // Receiving (1 PPR, 1 point per 10 yards, 6 pts per TD)
    reception: 1,
    receivingYard: 0.1,
    receivingTD: 6,
    // Kicking
    fieldGoal: 3,
    extraPoint: 1,
    // Defense
    sack: 1,
    safety: 2,
    defensiveTD: 6,
    // Bonuses
    longTD_bonus: 2,
    longRush_bonus: 2,
    longReceiving_bonus: 2
  };

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  // 🚀 Start real-time scoring updates
  startRealTimeScoring(): void {
    console.log('🏈 Starting ESPN real-time scoring service...');
    
    // Update every 2 minutes during active game times
    this.updateInterval = setInterval(async () => {
      await this.updateAllLineupScores();
    }, 2 * 60 * 1000);
    
    // Initial update
    this.updateAllLineupScores();
  }

  // 🛑 Stop real-time scoring updates
  stopRealTimeScoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🏈 Stopped ESPN real-time scoring service');
    }
  }

  // 📊 Update all fantasy lineups with current scores
  async updateAllLineupScores(): Promise<void> {
    try {
      console.log('🔄 Updating all fantasy lineup scores from ESPN...');
      
      // Get current player stats from ESPN
      const playerStats = await this.fetchCurrentPlayerStats();
      console.log(`📊 Fetched stats for ${Object.keys(playerStats).length} players`);
      
      // Get all active game instances
      const activeGames = await this.getActiveGameInstances();
      console.log(`🎮 Found ${activeGames.length} active game instances`);
      
      let totalUpdates = 0;
      
      for (const gameInstance of activeGames) {
        // Get all lineups for this game instance
        const lineups = await this.storage.getUserLineups(gameInstance.id);
        
        for (const lineup of lineups) {
          const newScore = this.calculateLineupScore(lineup, playerStats);
          
          const currentScore = typeof lineup.currentScore === 'string' ? parseFloat(lineup.currentScore) : (lineup.currentScore || 0);
          if (Math.abs(newScore - currentScore) > 0.01) {
            await this.storage.updateLineupScore(lineup.id, newScore);
            totalUpdates++;
          }
        }
      }
      
      console.log(`✅ Updated ${totalUpdates} lineups with new scores`);
      
    } catch (error) {
      console.error('❌ Error updating lineup scores:', error);
    }
  }

  // 📈 Fetch current player stats from ESPN API
  private async fetchCurrentPlayerStats(): Promise<Record<string, PlayerStats>> {
    try {
      const playerStats: Record<string, PlayerStats> = {};
      
      // Get live scores from ESPN
      const liveGames = await ESPNApiService.getLiveScores();
      
      for (const game of liveGames) {
        if (!game.competitions?.[0]?.competitors) continue;
        
        // Extract player stats from each team in the game
        for (const team of game.competitions[0].competitors) {
          if (team.athletes) {
            for (const athlete of team.athletes) {
              const playerId = `${athlete.athlete.id}_${team.team.abbreviation.toLowerCase()}`;
              
              playerStats[playerId] = {
                playerId,
                playerName: athlete.athlete.displayName,
                team: team.team.abbreviation,
                position: athlete.athlete.position?.abbreviation || 'UNKNOWN',
                
                // Initialize stats (ESPN API format varies)
                passingYards: this.extractStat(athlete, 'passingYards', 0),
                passingTDs: this.extractStat(athlete, 'passingTouchdowns', 0),
                interceptions: this.extractStat(athlete, 'interceptions', 0),
                
                rushingYards: this.extractStat(athlete, 'rushingYards', 0),
                rushingTDs: this.extractStat(athlete, 'rushingTouchdowns', 0),
                
                receptions: this.extractStat(athlete, 'receptions', 0),
                receivingYards: this.extractStat(athlete, 'receivingYards', 0),
                receivingTDs: this.extractStat(athlete, 'receivingTouchdowns', 0),
                
                fieldGoalsMade: this.extractStat(athlete, 'fieldGoalsMade', 0),
                fieldGoalsAttempted: this.extractStat(athlete, 'fieldGoalsAttempted', 0),
                extraPointsMade: this.extractStat(athlete, 'extraPointsMade', 0),
                
                sacks: this.extractStat(athlete, 'sacks', 0),
                safeties: this.extractStat(athlete, 'safeties', 0),
                defensive_TDs: this.extractStat(athlete, 'defensiveTouchdowns', 0),
                interceptionTDs: this.extractStat(athlete, 'interceptionTouchdowns', 0),
                fumbleRecoveryTDs: this.extractStat(athlete, 'fumbleRecoveryTouchdowns', 0),
                
                gameStatus: this.determineGameStatus(game),
                lastUpdated: new Date().toISOString()
              };
            }
          }
        }
      }
      
      return playerStats;
      
    } catch (error) {
      console.error('❌ Error fetching player stats:', error);
      return {};
    }
  }

  // 🎯 Calculate fantasy score for a lineup
  private calculateLineupScore(lineup: FantasyLineup, playerStats: Record<string, PlayerStats>): number {
    let totalScore = 0;
    
    // Score each player in the lineup array
    if (lineup.lineup) {
      lineup.lineup.forEach(player => {
        if (player.playerId && playerStats[player.playerId]) {
          const playerScore = this.calculatePlayerScore(playerStats[player.playerId]);
          totalScore += playerScore;
          
          console.log(`📊 ${player.position}: ${player.playerName} = ${playerScore.toFixed(2)} pts`);
        }
      });
    }
    
    return Math.round(totalScore * 100) / 100; // Round to 2 decimal places
  }

  // ⚡ Calculate fantasy points for individual player
  private calculatePlayerScore(stats: PlayerStats): number {
    const config = ESPNScoringService.STANDARD_SCORING;
    let score = 0;
    
    // Passing stats
    score += stats.passingYards * config.passingYard;
    score += stats.passingTDs * config.passingTD;
    score += stats.interceptions * config.interception;
    
    // Rushing stats
    score += stats.rushingYards * config.rushingYard;
    score += stats.rushingTDs * config.rushingTD;
    
    // Receiving stats (PPR)
    score += stats.receptions * config.reception;
    score += stats.receivingYards * config.receivingYard;
    score += stats.receivingTDs * config.receivingTD;
    
    // Kicking stats
    score += stats.fieldGoalsMade * config.fieldGoal;
    score += stats.extraPointsMade * config.extraPoint;
    
    // Defense stats
    score += stats.sacks * config.sack;
    score += stats.safeties * config.safety;
    score += stats.defensive_TDs * config.defensiveTD;
    score += stats.interceptionTDs * config.defensiveTD;
    score += stats.fumbleRecoveryTDs * config.defensiveTD;
    
    // TODO: Add bonus scoring for long plays
    // This requires play-by-play data analysis
    
    return score;
  }

  // 🔍 Extract stat from ESPN athlete data
  private extractStat(athlete: any, statName: string, defaultValue: number): number {
    try {
      // ESPN API stat structure varies, try multiple paths
      const paths = [
        athlete.statistics?.[0]?.[statName],
        athlete.athlete?.statistics?.[statName],
        athlete.stats?.[statName],
        athlete[statName]
      ];
      
      for (const value of paths) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) return parsed;
        }
      }
      
      return defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // 🎮 Get active game instances that need scoring updates
  private async getActiveGameInstances(): Promise<any[]> {
    try {
      return await this.storage.getActiveGameInstances();
    } catch (error) {
      console.error('❌ Error getting active game instances:', error);
      return [];
    }
  }

  // 🕐 Determine game status from ESPN data
  private determineGameStatus(game: any): PlayerStats['gameStatus'] {
    const competition = game.competitions?.[0];
    if (!competition) return 'not_started';
    
    const status = competition.status?.type?.name?.toLowerCase();
    
    if (status === 'final') return 'completed';
    if (status === 'in_progress' || status === 'halftime') return 'in_progress';
    if (status === 'postponed') return 'postponed';
    
    return 'not_started';
  }

  // 📊 Get scoring summary for a game instance
  async getScoringLeaderboard(gameInstanceId: string): Promise<{
    userId: string;
    userName: string;
    currentScore: number;
    rank: number;
    isSubmitted: boolean;
  }[]> {
    try {
      const lineups = await this.storage.getUserLineups(gameInstanceId);
      
      return lineups
        .map((lineup, index) => ({
          userId: lineup.userId,
          userName: lineup.userId, // TODO: Get actual user names
          currentScore: typeof lineup.currentScore === 'string' ? parseFloat(lineup.currentScore) : (lineup.currentScore || 0),
          rank: index + 1,
          isSubmitted: lineup.isSubmitted || false
        }))
        .sort((a, b) => b.currentScore - a.currentScore)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
        
    } catch (error) {
      console.error('❌ Error getting scoring leaderboard:', error);
      return [];
    }
  }

  // 🎯 Force immediate scoring update for specific game instance
  async forceScoreUpdate(gameInstanceId: string): Promise<void> {
    try {
      console.log(`🔄 Force updating scores for game instance ${gameInstanceId}...`);
      
      const playerStats = await this.fetchCurrentPlayerStats();
      const lineups = await this.storage.getUserLineups(gameInstanceId);
      
      for (const lineup of lineups) {
        const newScore = this.calculateLineupScore(lineup, playerStats);
        await this.storage.updateLineupScore(lineup.id, newScore);
      }
      
      console.log(`✅ Force updated ${lineups.length} lineups`);
      
    } catch (error) {
      console.error('❌ Error force updating scores:', error);
      throw error;
    }
  }
}

export default ESPNScoringService;