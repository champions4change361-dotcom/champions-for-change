import axios from 'axios';

interface HistoricalPlayerData {
  playerId: string;
  name: string;
  position: string;
  team: string;
  season: number;
  week: number;
  stats: {
    passing?: {
      attempts: number;
      completions: number;
      yards: number;
      touchdowns: number;
      interceptions: number;
    };
    rushing?: {
      attempts: number;
      yards: number;
      touchdowns: number;
    };
    receiving?: {
      targets: number;
      receptions: number;
      yards: number;
      touchdowns: number;
    };
    fantasyPoints: number;
  };
  gameContext: {
    opponent: string;
    isHome: boolean;
    weather?: string;
    gameScript: 'positive' | 'negative' | 'neutral';
    teamScore: number;
    opponentScore: number;
  };
}

interface PlayerPattern {
  playerId: string;
  name: string;
  position: string;
  historicalMetrics: {
    consistencyScore: number; // 0-100, higher = more consistent
    ceilingScore: number; // 90th percentile performance
    floorScore: number; // 10th percentile performance
    trendSlope: number; // Career trajectory 
    injuryRecoveryPattern: number; // Performance after injuries
    matchupSensitivity: number; // How much matchups affect performance
    weatherImpact: number; // How weather affects performance
    gameScriptDependency: number; // How game flow affects performance
    ageAdjustment: number; // Age-based performance adjustment
  };
  seasonalPatterns: {
    earlySeasonMultiplier: number;
    midSeasonMultiplier: number;
    lateSeasonMultiplier: number;
    playoffMultiplier: number;
  };
  matchupHistory: {
    [opponentTeam: string]: {
      averagePoints: number;
      consistency: number;
      sampleSize: number;
    };
  };
}

export class HistoricalDataService {
  private static instance: HistoricalDataService;
  private historicalData: HistoricalPlayerData[] = [];
  private playerPatterns: Map<string, PlayerPattern> = new Map();
  private isInitialized = false;

  static getInstance(): HistoricalDataService {
    if (!HistoricalDataService.instance) {
      HistoricalDataService.instance = new HistoricalDataService();
    }
    return HistoricalDataService.instance;
  }

  async initializeHistoricalData(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Initializing historical NFL data (2020-2024)...');
      
      // Simulate loading historical data (in real implementation, this would fetch from the repository)
      await this.loadHistoricalData();
      await this.generatePlayerPatterns();
      
      this.isInitialized = true;
      console.log(`✅ Historical data initialized: ${this.historicalData.length} records processed`);
      console.log(`📊 Player patterns generated for ${this.playerPatterns.size} players`);
    } catch (error) {
      console.error('❌ Failed to initialize historical data:', error);
    }
  }

  private async loadHistoricalData(): Promise<void> {
    // Simulate comprehensive historical data from 2020-2024
    // This would normally fetch from the GitHub repository or API
    
    const mockHistoricalData: HistoricalPlayerData[] = [
      // Sample data structure - in real implementation, this would be thousands of records
      {
        playerId: 'mahomes_patrick',
        name: 'Patrick Mahomes',
        position: 'QB',
        team: 'KC',
        season: 2024,
        week: 1,
        stats: {
          passing: { attempts: 35, completions: 28, yards: 378, touchdowns: 3, interceptions: 0 },
          fantasyPoints: 28.1
        },
        gameContext: {
          opponent: 'BAL',
          isHome: true,
          gameScript: 'positive',
          teamScore: 27,
          opponentScore: 20
        }
      },
      // Add more historical records...
    ];

    // In real implementation, fetch from repository:
    // const response = await axios.get('https://api.github.com/repos/eric4244/NFLPlayerStatistics/contents/src/data');
    // Process and parse the statistical data files
    
    this.historicalData = mockHistoricalData;
  }

  private async generatePlayerPatterns(): Promise<void> {
    const playerGroups = this.groupByPlayer(this.historicalData);

    for (const [playerId, playerData] of Array.from(playerGroups)) {
      const pattern = this.calculatePlayerPattern(playerId, playerData);
      this.playerPatterns.set(playerId, pattern);
    }
  }

  private groupByPlayer(data: HistoricalPlayerData[]): Map<string, HistoricalPlayerData[]> {
    const groups = new Map<string, HistoricalPlayerData[]>();
    
    for (const record of data) {
      if (!groups.has(record.playerId)) {
        groups.set(record.playerId, []);
      }
      groups.get(record.playerId)!.push(record);
    }
    
    return groups;
  }

  private calculatePlayerPattern(playerId: string, data: HistoricalPlayerData[]): PlayerPattern {
    const fantasyPoints = data.map(d => d.stats.fantasyPoints);
    const sorted = [...fantasyPoints].sort((a, b) => a - b);
    
    // Calculate core metrics
    const mean = fantasyPoints.reduce((a, b) => a + b, 0) / fantasyPoints.length;
    const variance = fantasyPoints.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / fantasyPoints.length;
    const stdDev = Math.sqrt(variance);
    
    // Consistency Score (lower variance = higher consistency)
    const consistencyScore = Math.max(0, 100 - (stdDev / mean) * 100);
    
    // Ceiling and Floor (90th and 10th percentiles)
    const ceilingIndex = Math.floor(sorted.length * 0.9);
    const floorIndex = Math.floor(sorted.length * 0.1);
    const ceilingScore = sorted[ceilingIndex];
    const floorScore = sorted[floorIndex];

    // Trend analysis (simplified linear regression)
    const trendSlope = this.calculateTrendSlope(data);
    
    // Matchup analysis
    const matchupHistory = this.analyzeMatchupHistory(data);
    
    // Seasonal patterns
    const seasonalPatterns = this.calculateSeasonalPatterns(data);

    const firstRecord = data[0];
    
    return {
      playerId,
      name: firstRecord.name,
      position: firstRecord.position,
      historicalMetrics: {
        consistencyScore,
        ceilingScore,
        floorScore,
        trendSlope,
        injuryRecoveryPattern: this.calculateInjuryRecovery(data),
        matchupSensitivity: this.calculateMatchupSensitivity(data),
        weatherImpact: this.calculateWeatherImpact(data),
        gameScriptDependency: this.calculateGameScriptDependency(data),
        ageAdjustment: this.calculateAgeAdjustment(data)
      },
      seasonalPatterns,
      matchupHistory
    };
  }

  private calculateTrendSlope(data: HistoricalPlayerData[]): number {
    // Simple linear regression to find performance trend
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.stats.fantasyPoints, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.stats.fantasyPoints, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private analyzeMatchupHistory(data: HistoricalPlayerData[]): { [team: string]: any } {
    const matchups: { [team: string]: number[] } = {};
    
    for (const record of data) {
      const opponent = record.gameContext.opponent;
      if (!matchups[opponent]) {
        matchups[opponent] = [];
      }
      matchups[opponent].push(record.stats.fantasyPoints);
    }
    
    const result: { [team: string]: any } = {};
    for (const [team, points] of Array.from(Object.entries(matchups))) {
      const avg = points.reduce((a, b) => a + b, 0) / points.length;
      const variance = points.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / points.length;
      
      result[team] = {
        averagePoints: avg,
        consistency: Math.max(0, 100 - Math.sqrt(variance) / avg * 100),
        sampleSize: points.length
      };
    }
    
    return result;
  }

  private calculateSeasonalPatterns(data: HistoricalPlayerData[]): any {
    const early = data.filter(d => d.week <= 6);
    const mid = data.filter(d => d.week > 6 && d.week <= 12);
    const late = data.filter(d => d.week > 12);
    
    const avgAll = data.reduce((sum, d) => sum + d.stats.fantasyPoints, 0) / data.length;
    
    return {
      earlySeasonMultiplier: early.length ? early.reduce((sum, d) => sum + d.stats.fantasyPoints, 0) / early.length / avgAll : 1,
      midSeasonMultiplier: mid.length ? mid.reduce((sum, d) => sum + d.stats.fantasyPoints, 0) / mid.length / avgAll : 1,
      lateSeasonMultiplier: late.length ? late.reduce((sum, d) => sum + d.stats.fantasyPoints, 0) / late.length / avgAll : 1,
      playoffMultiplier: 1.05 // Assume slight playoff boost
    };
  }

  private calculateInjuryRecovery(data: HistoricalPlayerData[]): number {
    // Simplified - would analyze performance after injury returns
    return 85; // Mock value representing injury recovery performance
  }

  private calculateMatchupSensitivity(data: HistoricalPlayerData[]): number {
    // Analyze how much opponent affects performance
    const opponents = [...new Set(data.map(d => d.gameContext.opponent))];
    const variances = opponents.map(opp => {
      const games = data.filter(d => d.gameContext.opponent === opp);
      const points = games.map(g => g.stats.fantasyPoints);
      const avg = points.reduce((a, b) => a + b, 0) / points.length;
      return points.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / points.length;
    });
    
    const avgVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
    return Math.min(100, avgVariance * 2); // Convert to 0-100 scale
  }

  private calculateWeatherImpact(data: HistoricalPlayerData[]): number {
    // Analyze outdoor vs indoor performance
    return 15; // Mock value representing weather sensitivity
  }

  private calculateGameScriptDependency(data: HistoricalPlayerData[]): number {
    const positive = data.filter(d => d.gameContext.gameScript === 'positive');
    const negative = data.filter(d => d.gameContext.gameScript === 'negative');
    
    if (positive.length === 0 || negative.length === 0) return 50;
    
    const posAvg = positive.reduce((sum, d) => sum + d.stats.fantasyPoints, 0) / positive.length;
    const negAvg = negative.reduce((sum, d) => sum + d.stats.fantasyPoints, 0) / negative.length;
    
    return Math.abs((posAvg - negAvg) / Math.max(posAvg, negAvg)) * 100;
  }

  private calculateAgeAdjustment(data: HistoricalPlayerData[]): number {
    // Simplified age curve analysis
    return 1.0; // Mock multiplier
  }

  // Public methods for AI integration
  getPlayerPattern(playerId: string): PlayerPattern | null {
    return this.playerPatterns.get(playerId) || null;
  }

  enhanceProjection(playerId: string, baseProjection: number, context: {
    opponent: string;
    week: number;
    weather?: string;
    gameScript?: string;
  }): {
    enhancedProjection: number;
    confidence: number;
    explanation: string[];
  } {
    const pattern = this.getPlayerPattern(playerId);
    if (!pattern) {
      return {
        enhancedProjection: baseProjection,
        confidence: 70,
        explanation: ['No historical pattern data available']
      };
    }

    let adjustedProjection = baseProjection;
    const explanations: string[] = [];
    let confidenceBoost = 0;

    // Apply matchup history adjustment
    const matchupData = pattern.matchupHistory[context.opponent];
    if (matchupData && matchupData.sampleSize >= 3) {
      const matchupMultiplier = matchupData.averagePoints / 
        (Object.values(pattern.matchupHistory).reduce((sum, m) => sum + m.averagePoints, 0) / 
         Object.keys(pattern.matchupHistory).length);
      
      adjustedProjection *= matchupMultiplier;
      explanations.push(`Matchup history vs ${context.opponent}: ${matchupMultiplier > 1 ? 'favorable' : 'challenging'}`);
      confidenceBoost += matchupData.consistency * 0.1;
    }

    // Apply seasonal adjustment
    let seasonalMultiplier = 1;
    if (context.week <= 6) {
      seasonalMultiplier = pattern.seasonalPatterns.earlySeasonMultiplier;
      explanations.push(`Early season performance: ${seasonalMultiplier > 1 ? 'strong' : 'slow'} start`);
    } else if (context.week <= 12) {
      seasonalMultiplier = pattern.seasonalPatterns.midSeasonMultiplier;
      explanations.push(`Mid-season form: ${seasonalMultiplier > 1 ? 'peak' : 'average'} performance`);
    } else {
      seasonalMultiplier = pattern.seasonalPatterns.lateSeasonMultiplier;
      explanations.push(`Late season: ${seasonalMultiplier > 1 ? 'strong' : 'fading'} finish`);
    }
    
    adjustedProjection *= seasonalMultiplier;

    // Apply weather adjustment for outdoor games
    if (context.weather && pattern.historicalMetrics.weatherImpact > 20) {
      const weatherMultiplier = context.weather.includes('rain') || context.weather.includes('wind') ? 0.9 : 1.0;
      adjustedProjection *= weatherMultiplier;
      if (weatherMultiplier < 1) {
        explanations.push('Weather conditions may impact performance');
      }
    }

    // Calculate final confidence
    const baseConfidence = 75;
    const consistencyBonus = pattern.historicalMetrics.consistencyScore * 0.2;
    const finalConfidence = Math.min(95, baseConfidence + consistencyBonus + confidenceBoost);

    return {
      enhancedProjection: Math.round(adjustedProjection * 100) / 100,
      confidence: Math.round(finalConfidence),
      explanation: explanations
    };
  }

  getPlayerInsights(playerId: string): {
    consistency: string;
    ceiling: string;
    floor: string;
    trend: string;
    strengths: string[];
    weaknesses: string[];
  } | null {
    const pattern = this.getPlayerPattern(playerId);
    if (!pattern) return null;

    const metrics = pattern.historicalMetrics;
    
    return {
      consistency: metrics.consistencyScore > 80 ? 'Very Reliable' : 
                  metrics.consistencyScore > 60 ? 'Fairly Consistent' : 'Volatile',
      
      ceiling: metrics.ceilingScore > 25 ? 'Elite Upside' :
               metrics.ceilingScore > 18 ? 'High Upside' : 'Limited Upside',
      
      floor: metrics.floorScore > 8 ? 'Safe Floor' :
             metrics.floorScore > 4 ? 'Risky Floor' : 'Very Risky',
      
      trend: metrics.trendSlope > 0.5 ? 'Improving' :
             metrics.trendSlope < -0.5 ? 'Declining' : 'Stable',
      
      strengths: this.identifyStrengths(pattern),
      weaknesses: this.identifyWeaknesses(pattern)
    };
  }

  private identifyStrengths(pattern: PlayerPattern): string[] {
    const strengths: string[] = [];
    const metrics = pattern.historicalMetrics;
    
    if (metrics.consistencyScore > 80) strengths.push('High consistency');
    if (metrics.ceilingScore > 25) strengths.push('Elite ceiling');
    if (metrics.matchupSensitivity < 20) strengths.push('Matchup proof');
    if (metrics.weatherImpact < 15) strengths.push('Weather resistant');
    if (metrics.trendSlope > 0.3) strengths.push('Positive trend');
    
    return strengths;
  }

  private identifyWeaknesses(pattern: PlayerPattern): string[] {
    const weaknesses: string[] = [];
    const metrics = pattern.historicalMetrics;
    
    if (metrics.consistencyScore < 50) weaknesses.push('High volatility');
    if (metrics.floorScore < 5) weaknesses.push('Low floor');
    if (metrics.matchupSensitivity > 40) weaknesses.push('Matchup dependent');
    if (metrics.weatherImpact > 25) weaknesses.push('Weather sensitive');
    if (metrics.trendSlope < -0.3) weaknesses.push('Declining trend');
    
    return weaknesses;
  }

  // Analysis method for getting overall data insights
  getDataInsights(): {
    totalPlayers: number;
    totalGames: number;
    avgConsistency: number;
    topPerformers: string[];
    sleepers: string[];
  } {
    const patterns = Array.from(this.playerPatterns.values());
    
    return {
      totalPlayers: patterns.length,
      totalGames: this.historicalData.length,
      avgConsistency: patterns.reduce((sum, p) => sum + p.historicalMetrics.consistencyScore, 0) / patterns.length,
      topPerformers: patterns
        .filter(p => p.historicalMetrics.ceilingScore > 25)
        .map(p => p.name)
        .slice(0, 10),
      sleepers: patterns
        .filter(p => p.historicalMetrics.trendSlope > 0.5 && p.historicalMetrics.ceilingScore > 15)
        .map(p => p.name)
        .slice(0, 5)
    };
  }
}