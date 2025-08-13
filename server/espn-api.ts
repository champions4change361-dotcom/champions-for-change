// ESPN API Integration for Live Scoring and Player Data
// Provides real-time NFL data for Fantasy Coaching Brain

export class ESPNApiService {
  private baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
  
  // Get live scores for all NFL games
  static async getLiveScores(): Promise<any[]> {
    try {
      const response = await fetch(`${this.prototype.baseUrl}/scoreboard`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.events || [];
    } catch (error) {
      console.error('ESPN API live scores error:', error);
      return [];
    }
  }
  
  // Get detailed game information
  static async getGameDetails(gameId: string): Promise<any> {
    try {
      const response = await fetch(`${this.prototype.baseUrl}/summary?event=${gameId}`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ESPN API game details error:', error);
      return null;
    }
  }
  
  // Get team standings
  static async getStandings(): Promise<any[]> {
    try {
      const response = await fetch(`${this.prototype.baseUrl}/standings`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.children || [];
    } catch (error) {
      console.error('ESPN API standings error:', error);
      return [];
    }
  }
  
  // Get player statistics for a specific week
  static async getPlayerStats(week: number, season: number = 2024): Promise<any[]> {
    try {
      // ESPN doesn't have a direct player stats endpoint, but we can extract from game data
      const scores = await this.getLiveScores();
      const playerStats = [];
      
      for (const game of scores) {
        if (game.competitions?.[0]?.competitors) {
          for (const team of game.competitions[0].competitors) {
            if (team.statistics) {
              // Extract player statistics from team data
              playerStats.push({
                gameId: game.id,
                teamId: team.id,
                teamName: team.team.displayName,
                statistics: team.statistics
              });
            }
          }
        }
      }
      
      return playerStats;
    } catch (error) {
      console.error('ESPN API player stats error:', error);
      return [];
    }
  }
  
  // Get live play-by-play data for coaching insights
  static async getPlayByPlay(gameId: string): Promise<any> {
    try {
      const response = await fetch(`${this.prototype.baseUrl}/playbyplay?event=${gameId}`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('ESPN API play-by-play error:', error);
      return null;
    }
  }
  
  // Analyze live player performance for Fantasy Coaching insights
  static async analyzeLivePlayerPerformance(playerId: string, gameId: string): Promise<{
    currentStats: any;
    trendAnalysis: string;
    coachingInsight: string;
    confidence: number;
  }> {
    try {
      const playByPlay = await this.getPlayByPlay(gameId);
      const gameDetails = await this.getGameDetails(gameId);
      
      if (!playByPlay || !gameDetails) {
        return {
          currentStats: {},
          trendAnalysis: "Live data unavailable",
          coachingInsight: "Unable to analyze live performance",
          confidence: 0
        };
      }
      
      // Extract relevant plays for the player
      const playerPlays = this.extractPlayerPlays(playByPlay, playerId);
      const currentStats = this.calculateCurrentStats(playerPlays);
      
      // Generate coaching insight based on live performance
      const insight = this.generateLiveCoachingInsight(currentStats, playerPlays);
      
      return {
        currentStats,
        trendAnalysis: insight.trend,
        coachingInsight: insight.message,
        confidence: insight.confidence
      };
      
    } catch (error) {
      console.error('Live player analysis error:', error);
      return {
        currentStats: {},
        trendAnalysis: "Analysis error",
        coachingInsight: "Unable to analyze live performance",
        confidence: 0
      };
    }
  }
  
  // Extract plays involving a specific player
  private static extractPlayerPlays(playByPlay: any, playerId: string): any[] {
    if (!playByPlay.drives) return [];
    
    const playerPlays = [];
    
    for (const drive of playByPlay.drives) {
      if (drive.plays) {
        for (const play of drive.plays) {
          if (play.text && play.text.includes(playerId)) {
            playerPlays.push({
              ...play,
              driveNumber: drive.displayResult,
              quarter: play.period?.number || 1
            });
          }
        }
      }
    }
    
    return playerPlays;
  }
  
  // Calculate current game statistics
  private static calculateCurrentStats(playerPlays: any[]): any {
    const stats = {
      totalPlays: playerPlays.length,
      rushingAttempts: 0,
      rushingYards: 0,
      receptions: 0,
      receivingYards: 0,
      touchdowns: 0,
      targets: 0
    };
    
    for (const play of playerPlays) {
      const text = play.text.toLowerCase();
      
      // Count rushing attempts and yards
      if (text.includes('rush') || text.includes('carry')) {
        stats.rushingAttempts++;
        const yardMatch = text.match(/(\d+)\s*yard/);
        if (yardMatch) {
          stats.rushingYards += parseInt(yardMatch[1]);
        }
      }
      
      // Count receptions and receiving yards
      if (text.includes('catch') || text.includes('reception')) {
        stats.receptions++;
        const yardMatch = text.match(/(\d+)\s*yard/);
        if (yardMatch) {
          stats.receivingYards += parseInt(yardMatch[1]);
        }
      }
      
      // Count targets
      if (text.includes('target') || text.includes('incomplete')) {
        stats.targets++;
      }
      
      // Count touchdowns
      if (text.includes('touchdown') || text.includes('td')) {
        stats.touchdowns++;
      }
    }
    
    return stats;
  }
  
  // Generate live coaching insight
  private static generateLiveCoachingInsight(stats: any, plays: any[]): {
    trend: string;
    message: string;
    confidence: number;
  } {
    let confidence = 70;
    let trend = "On pace for solid performance";
    let message = "Player is performing as expected";
    
    // Analyze rushing efficiency
    if (stats.rushingAttempts >= 3) {
      const yardsPerCarry = stats.rushingYards / stats.rushingAttempts;
      if (yardsPerCarry > 5) {
        trend = "Excellent rushing efficiency";
        message = `🔥 RUSHING DOMINANCE: Averaging ${yardsPerCarry.toFixed(1)} yards per carry! The pre-game analysis about rushing tendencies is paying off perfectly.`;
        confidence = 90;
      } else if (yardsPerCarry < 2) {
        trend = "Struggling with ground game";
        message = `⚠️ TOUGH SLEDDING: Only ${yardsPerCarry.toFixed(1)} yards per carry so far. Defense is keying on the rush - expect more passing involvement.`;
        confidence = 75;
      }
    }
    
    // Analyze receiving performance
    if (stats.targets >= 2) {
      const catchRate = stats.receptions / stats.targets;
      if (catchRate > 0.8 && stats.receivingYards > 30) {
        trend = "High target efficiency";
        message = `🎯 TARGET MACHINE: ${stats.receptions}/${stats.targets} catches for ${stats.receivingYards} yards! Quarterback is looking his way early and often.`;
        confidence = 85;
      }
    }
    
    // Check for touchdowns
    if (stats.touchdowns >= 1) {
      trend = "Finding the end zone";
      message = `🚨 TOUCHDOWN CONFIRMED: Already has ${stats.touchdowns} TD! Our red zone analysis was spot on - this player is delivering in scoring position.`;
      confidence = 95;
    }
    
    // Low usage warning
    if (stats.totalPlays < 2 && plays.length > 10) {
      trend = "Low usage concern";
      message = `📊 USAGE ALERT: Only ${stats.totalPlays} touches so far. Game script or injury concern - monitor closely for potential pivot opportunities.`;
      confidence = 60;
    }
    
    return { trend, message, confidence };
  }
  
  // Get upcoming games for the week
  static async getUpcomingGames(week: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.prototype.baseUrl}/scoreboard`);
      if (!response.ok) {
        throw new Error(`ESPN API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.events?.filter((game: any) => {
        return game.week?.number === week && 
               new Date(game.date) > new Date();
      }) || [];
    } catch (error) {
      console.error('ESPN API upcoming games error:', error);
      return [];
    }
  }
  
  // Get weather information for outdoor games
  static async getGameWeather(gameId: string): Promise<any> {
    try {
      const gameDetails = await this.getGameDetails(gameId);
      
      if (gameDetails?.gameInfo?.venue?.indoor) {
        return {
          condition: "Dome",
          temperature: 72,
          windSpeed: 0,
          precipitation: 0
        };
      }
      
      // ESPN doesn't always provide weather, so we return basic outdoor info
      return {
        condition: "Outdoor",
        temperature: 65,
        windSpeed: 5,
        precipitation: 0
      };
    } catch (error) {
      console.error('ESPN API weather error:', error);
      return null;
    }
  }
}