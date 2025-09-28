// 🏈 SEASON-LONG FANTASY SCORING SERVICE
// Bridges ESPN real-time stats to season-long fantasy league scoring
// Updates fantasy rosters, matchups, and team standings with live ESPN data

import { ESPNScoringService, PlayerStats } from './espn-scoring-service';
import type { IStorage } from './storage';

export interface WeeklyFantasyScoring {
  week: number;
  season: string;
  leagueId: string;
  rosterScores: {
    rosterId: string;
    teamId: string;
    playerId: string;
    playerName: string;
    position: string;
    points: number;
    isStarting: boolean;
  }[];
  teamTotals: {
    teamId: string;
    weeklyScore: number;
    totalPointsFor: number;
  }[];
  matchupResults: {
    matchupId: string;
    homeTeamId: string;
    awayTeamId: string;
    homeTeamScore: number;
    awayTeamScore: number;
    winner: string | null;
  }[];
}

export class SeasonLongScoringService {
  private storage: IStorage;
  private espnScoringService: ESPNScoringService;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(storage: IStorage, espnScoringService: ESPNScoringService) {
    this.storage = storage;
    this.espnScoringService = espnScoringService;
  }

  // 🚀 Start season-long fantasy scoring updates
  startSeasonLongScoring(): void {
    console.log('🏈 Starting Season-Long Fantasy Scoring Service...');
    
    // Update every 5 minutes during active seasons
    this.updateInterval = setInterval(async () => {
      await this.updateAllSeasonLongScores();
    }, 5 * 60 * 1000);
    
    // Initial update
    this.updateAllSeasonLongScores();
  }

  // 🛑 Stop season-long scoring updates
  stopSeasonLongScoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('🏈 Stopped Season-Long Fantasy Scoring Service');
    }
  }

  // 📊 Update all fantasy leagues with current ESPN scores
  async updateAllSeasonLongScores(): Promise<void> {
    try {
      console.log('🔄 Updating season-long fantasy scores from ESPN...');
      
      // Get current week and season
      const currentWeek = this.getCurrentNFLWeek();
      const currentSeason = this.getCurrentNFLSeason();
      
      // Get all active fantasy leagues
      const activeLeagues = await this.getActiveFantasyLeagues();
      console.log(`🏈 Found ${activeLeagues.length} active fantasy leagues`);
      
      let totalUpdates = 0;
      
      for (const league of activeLeagues) {
        try {
          const updates = await this.updateLeagueScoring(league.id, currentWeek, currentSeason);
          totalUpdates += updates;
        } catch (error) {
          console.error(`❌ Error updating league ${league.id}:`, error);
        }
      }
      
      console.log(`✅ Updated ${totalUpdates} season-long fantasy scores`);
      
    } catch (error) {
      console.error('❌ Error updating season-long scores:', error);
    }
  }

  // 🎯 Update scoring for a specific fantasy league
  async updateLeagueScoring(leagueId: string, week: number, season: string): Promise<number> {
    try {
      // Get ESPN player stats
      const playerStats = await this.espnScoringService['fetchCurrentPlayerStats']();
      
      // Get all teams in the league
      const teams = await this.getLeagueTeams(leagueId);
      
      let updates = 0;
      const weeklyScoring: WeeklyFantasyScoring = {
        week,
        season,
        leagueId,
        rosterScores: [],
        teamTotals: [],
        matchupResults: []
      };

      // Calculate scores for each team's roster
      for (const team of teams) {
        try {
          const rosterPlayers = await this.storage.getFantasyTeamRoster(team.id, team.ownerId);
          let teamWeeklyScore = 0;

          // Score each player in the roster
          for (const rosterPlayer of rosterPlayers) {
            const playerStat = playerStats[rosterPlayer.playerId];
            
            if (playerStat) {
              const playerPoints = this.calculatePlayerScore(playerStat);
              
              // Update roster player scoring
              if (rosterPlayer.isStarting && playerPoints > 0) {
                teamWeeklyScore += playerPoints;
                
                weeklyScoring.rosterScores.push({
                  rosterId: rosterPlayer.id,
                  teamId: team.id,
                  playerId: rosterPlayer.playerId,
                  playerName: playerStat.playerName,
                  position: rosterPlayer.rosterPosition,
                  points: playerPoints,
                  isStarting: rosterPlayer.isStarting
                });
              }
              
              // Update roster with weekly points
              const existingWeeklyPoints = rosterPlayer.weeklyPoints || [];
              existingWeeklyPoints[week - 1] = playerPoints;
              
              await this.updateRosterPlayerStats(rosterPlayer.id, {
                weeklyPoints: existingWeeklyPoints,
                totalPoints: (rosterPlayer.totalPoints || 0) + playerPoints
              });
              
              updates++;
            }
          }

          // Update team's weekly score and total points
          const currentTotal = team.totalPointsFor || 0;
          const newTotal = currentTotal + teamWeeklyScore;
          
          await this.updateFantasyTeamStats(team.id, {
            totalPointsFor: newTotal,
            wins: team.wins,
            losses: team.losses
          });

          weeklyScoring.teamTotals.push({
            teamId: team.id,
            weeklyScore: teamWeeklyScore,
            totalPointsFor: newTotal
          });

        } catch (error) {
          console.error(`❌ Error updating team ${team.id}:`, error);
        }
      }

      // Update weekly matchups with scores
      await this.updateWeeklyMatchups(leagueId, week, weeklyScoring.teamTotals);
      
      return updates;
      
    } catch (error) {
      console.error(`❌ Error updating league scoring:`, error);
      return 0;
    }
  }

  // ⚡ Calculate fantasy points for individual player (reuse ESPN service logic)
  private calculatePlayerScore(stats: PlayerStats): number {
    // Standard PPR scoring configuration
    const config = {
      passingYard: 0.04, // 1 point per 25 yards
      passingTD: 4,
      interception: -2,
      rushingYard: 0.1, // 1 point per 10 yards
      rushingTD: 6,
      reception: 1, // PPR
      receivingYard: 0.1,
      receivingTD: 6,
      fieldGoal: 3,
      extraPoint: 1,
      sack: 1,
      safety: 2,
      defensiveTD: 6
    };
    
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
    
    return Math.round(score * 100) / 100; // Round to 2 decimal places
  }

  // 🏈 Update weekly matchup scores and determine winners
  private async updateWeeklyMatchups(leagueId: string, week: number, teamTotals: any[]): Promise<void> {
    try {
      // Get matchups for this week
      const matchups = await this.storage.getFantasyMatchups(leagueId, week, 'system');
      
      for (const matchup of matchups) {
        const homeTeam = teamTotals.find(t => t.teamId === matchup.homeTeamId);
        const awayTeam = teamTotals.find(t => t.teamId === matchup.awayTeamId);
        
        if (homeTeam && awayTeam) {
          const winner = homeTeam.weeklyScore > awayTeam.weeklyScore ? matchup.homeTeamId : matchup.awayTeamId;
          
          // Update matchup with scores
          await this.updateFantasyMatchup(matchup.id, {
            homeTeamScore: homeTeam.weeklyScore,
            awayTeamScore: awayTeam.weeklyScore,
            winnerId: winner,
            status: 'completed'
          });
          
          // Update team win/loss records
          if (winner === matchup.homeTeamId) {
            await this.updateTeamRecord(matchup.homeTeamId, 'win');
            await this.updateTeamRecord(matchup.awayTeamId, 'loss');
          } else {
            await this.updateTeamRecord(matchup.awayTeamId, 'win');
            await this.updateTeamRecord(matchup.homeTeamId, 'loss');
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Error updating weekly matchups:`, error);
    }
  }

  // 📈 Helper methods for database updates
  private async getActiveFantasyLeagues(): Promise<any[]> {
    // Get leagues that are currently active
    return [];  // TODO: Implement query for active leagues
  }

  private async getLeagueTeams(leagueId: string): Promise<any[]> {
    // Implementation would use storage to get teams
    return [];  // TODO: Implement
  }

  private async updateRosterPlayerStats(rosterId: string, updates: any): Promise<void> {
    // TODO: Implement roster update
  }

  private async updateFantasyTeamStats(teamId: string, updates: any): Promise<void> {
    // TODO: Implement team stats update
  }

  private async updateFantasyMatchup(matchupId: string, updates: any): Promise<void> {
    // TODO: Implement matchup update
  }

  private async updateTeamRecord(teamId: string, result: 'win' | 'loss'): Promise<void> {
    // TODO: Implement team record update
  }

  // 📅 Helper methods for season/week tracking
  private getCurrentNFLWeek(): number {
    // Calculate current NFL week (season starts in September)
    const now = new Date();
    const seasonStart = new Date(now.getFullYear(), 8, 8); // Sept 8th
    const weeksDiff = Math.floor((now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(18, weeksDiff + 1));
  }

  private getCurrentNFLSeason(): string {
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    return year.toString();
  }

  // 🎯 Force immediate scoring update for specific league
  async forceLeagueScoreUpdate(leagueId: string): Promise<void> {
    try {
      console.log(`🔄 Force updating season-long scores for league ${leagueId}...`);
      
      const currentWeek = this.getCurrentNFLWeek();
      const currentSeason = this.getCurrentNFLSeason();
      
      const updates = await this.updateLeagueScoring(leagueId, currentWeek, currentSeason);
      console.log(`✅ Force updated ${updates} fantasy scores for league`);
      
    } catch (error) {
      console.error('❌ Error force updating league scores:', error);
      throw error;
    }
  }
}

export default SeasonLongScoringService;