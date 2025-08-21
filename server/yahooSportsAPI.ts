import axios from 'axios';
import * as crypto from 'crypto';

export interface PlayerProjection {
  playerId: string;
  playerName: string;
  position: string;
  team: string;
  opponent: string;
  projectedPoints: number;
  confidence: number;
  analysis: string;
  factors: string[];
  usage: {
    targetShare?: number;
    carryShare?: number;
    snapCount?: number;
    redZoneTargets?: number;
  };
  matchup: {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    defensiveRank: number;
    allowedPoints: number;
    keyFactors: string[];
  };
}

export interface InjuryReport {
  playerId: string;
  playerName: string;
  team: string;
  status: 'Healthy' | 'Questionable' | 'Doubtful' | 'Out' | 'IR';
  injury: string;
  impact: string;
  lastUpdated: string;
}

export interface SlateAnalysis {
  slate: 'morning' | 'afternoon' | 'night' | 'all-day';
  games: Array<{
    homeTeam: string;
    awayTeam: string;
    gameTime: string;
    weather?: string;
    vegasTotal: number;
    spread: number;
  }>;
  topPlays: PlayerProjection[];
  sleepers: PlayerProjection[];
  avoids: PlayerProjection[];
  stackRecommendations: Array<{
    qb: string;
    receivers: string[];
    reasoning: string;
    confidence: number;
  }>;
}

export class YahooSportsAPI {
  private consumerKey: string;
  private consumerSecret: string;
  private accessToken?: string;
  private accessSecret?: string;

  constructor(consumerKey?: string, consumerSecret?: string) {
    this.consumerKey = consumerKey || process.env.YAHOO_CONSUMER_KEY || '';
    this.consumerSecret = consumerSecret || process.env.YAHOO_CONSUMER_SECRET || '';
    
    if (!this.consumerKey || !this.consumerSecret) {
      console.warn('Yahoo API credentials not found. Using mock data.');
    } else {
      console.log('Yahoo API credentials loaded successfully');
    }
  }

  // OAuth signature generation
  private generateSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    tokenSecret: string = ''
  ): string {
    // Sort parameters
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Create base string
    const baseString = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(sortedParams)
    ].join('&');

    // Create signing key
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

    // Generate signature
    return crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');
  }

  // Make authenticated request to Yahoo API
  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = `https://fantasysports.yahooapis.com${endpoint}`;
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      ...params
    };

    if (this.accessToken) {
      oauthParams.oauth_token = this.accessToken;
    }

    const signature = this.generateSignature('GET', url, oauthParams, this.accessSecret);
    oauthParams.oauth_signature = signature;

    try {
      const response = await axios.get(url, {
        params: oauthParams,
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Yahoo API request failed:', error);
      throw error;
    }
  }

  // Get player projections for a specific position
  async getPlayerProjections(position: 'RB' | 'WR' | 'QB' | 'TE', week: number = 1): Promise<PlayerProjection[]> {
    try {
      // In a real implementation, this would call Yahoo's actual endpoints
      // For now, providing realistic mock data based on actual NFL analysis patterns
      const mockProjections: PlayerProjection[] = [
        {
          playerId: 'nfl.p.32725',
          playerName: 'Christian McCaffrey',
          position: 'RB',
          team: 'SF',
          opponent: 'vs SEA',
          projectedPoints: 22.4,
          confidence: 92,
          analysis: 'Elite volume in plus matchup. SF favored by 6.5, should control game flow. McCaffrey sees 85% of RB snaps and 92% of red zone carries.',
          factors: [
            'Home favorite in projected blowout',
            'Seattle allows 4.8 YPC to RBs (28th worst)',
            'Weather: Dome, perfect conditions',
            'Injury status: 100% healthy'
          ],
          usage: {
            carryShare: 0.78,
            targetShare: 0.15,
            snapCount: 85,
            redZoneTargets: 3
          },
          matchup: {
            difficulty: 'Easy',
            defensiveRank: 28,
            allowedPoints: 18.2,
            keyFactors: [
              'Weak run defense',
              'Missing starting LB',
              'Game script favors running'
            ]
          }
        },
        {
          playerId: 'nfl.p.33086',
          playerName: 'Derrick Henry',
          position: 'RB',
          team: 'BAL',
          opponent: '@ CIN',
          projectedPoints: 19.8,
          confidence: 87,
          analysis: 'Volume king in revenge game. Cincinnati allows 5.1 YPC (worst in NFL). Henry historically dominates AFC North defenses.',
          factors: [
            'Revenge game narrative',
            'Cincinnati worst run defense',
            'Ravens should lean on ground game',
            'Weather: Indoor, controlled conditions'
          ],
          usage: {
            carryShare: 0.82,
            targetShare: 0.08,
            snapCount: 78,
            redZoneTargets: 1
          },
          matchup: {
            difficulty: 'Easy',
            defensiveRank: 32,
            allowedPoints: 21.3,
            keyFactors: [
              'Historically bad run defense',
              'Injured defensive line',
              'Ravens offensive line advantage'
            ]
          }
        }
      ];

      return mockProjections.filter(p => p.position === position);
    } catch (error) {
      console.error('Error getting player projections:', error);
      return [];
    }
  }

  // Get injury reports
  async getInjuryReports(): Promise<InjuryReport[]> {
    try {
      // Mock injury data based on real NFL injury report patterns
      return [
        {
          playerId: 'nfl.p.32725',
          playerName: 'Christian McCaffrey',
          team: 'SF',
          status: 'Healthy',
          injury: 'None',
          impact: 'Full go, no restrictions',
          lastUpdated: new Date().toISOString()
        },
        {
          playerId: 'nfl.p.30123',
          playerName: 'Cooper Kupp',
          team: 'LAR',
          status: 'Questionable',
          injury: 'Ankle',
          impact: 'Limited in practice, expected to play but monitor snap count',
          lastUpdated: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('Error getting injury reports:', error);
      return [];
    }
  }

  // Analyze Sunday slate for optimal plays
  async analyzeSundaySlate(slate: 'morning' | 'afternoon' | 'all-day' = 'all-day'): Promise<SlateAnalysis> {
    try {
      const projections = await this.getPlayerProjections('RB');
      const injuries = await this.getInjuryReports();

      // Analyze which RBs will get the most carries
      const topCarryProjections = projections
        .filter(p => p.usage.carryShare && p.usage.carryShare > 0.6)
        .sort((a, b) => (b.usage.carryShare || 0) - (a.usage.carryShare || 0))
        .slice(0, 5);

      return {
        slate,
        games: [
          {
            homeTeam: 'SF',
            awayTeam: 'SEA',
            gameTime: '1:00 PM ET',
            weather: 'Dome',
            vegasTotal: 47.5,
            spread: -6.5
          },
          {
            homeTeam: 'CIN',
            awayTeam: 'BAL',
            gameTime: '1:00 PM ET',
            weather: 'Indoor',
            vegasTotal: 51.0,
            spread: -3.0
          }
        ],
        topPlays: topCarryProjections,
        sleepers: projections.filter(p => p.confidence < 70 && p.projectedPoints > 15),
        avoids: projections.filter(p => p.matchup.difficulty === 'Hard'),
        stackRecommendations: [
          {
            qb: 'Lamar Jackson',
            receivers: ['Mark Andrews', 'Zay Flowers'],
            reasoning: 'Baltimore in high-scoring divisional game. Projected 35+ pass attempts with strong red zone upside.',
            confidence: 84
          }
        ]
      };
    } catch (error) {
      console.error('Error analyzing Sunday slate:', error);
      throw error;
    }
  }

  // Answer specific fantasy questions using AI analysis
  async answerFantasyQuestion(question: string): Promise<{
    answer: string;
    analysis: string;
    supportingData: any[];
    confidence: number;
  }> {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('running back') && lowerQuestion.includes('carries')) {
      const slateAnalysis = await this.analyzeSundaySlate();
      const topRB = slateAnalysis.topPlays[0];
      
      return {
        answer: `${topRB.playerName} is projected to get the most carries on Sunday's slate with an 78% carry share and 18-22 projected attempts.`,
        analysis: `${topRB.analysis} His usage rate and game script strongly favor high-volume ground work.`,
        supportingData: [
          { metric: 'Carry Share', value: `${(topRB.usage.carryShare! * 100).toFixed(0)}%` },
          { metric: 'Projected Carries', value: '18-22' },
          { metric: 'Matchup Grade', value: topRB.matchup.difficulty },
          { metric: 'Confidence', value: `${topRB.confidence}%` }
        ],
        confidence: topRB.confidence
      };
    }

    if (lowerQuestion.includes('injury') || lowerQuestion.includes('questionable')) {
      const injuries = await this.getInjuryReports();
      const activeInjuries = injuries.filter(i => i.status !== 'Healthy');
      
      return {
        answer: `Currently tracking ${activeInjuries.length} players with injury concerns that could impact Sunday's slate.`,
        analysis: 'Key injuries to monitor include skill position players with questionable tags who could see reduced snaps or be inactive.',
        supportingData: activeInjuries.map(inj => ({
          player: inj.playerName,
          status: inj.status,
          injury: inj.injury,
          impact: inj.impact
        })),
        confidence: 85
      };
    }

    // Default response for unrecognized questions
    return {
      answer: 'I can help analyze running back carries, injury reports, matchups, and slate optimization. Try asking about specific positions or game situations.',
      analysis: 'The Fantasy Coaching AI specializes in data-driven analysis of player usage, matchups, and injury impacts.',
      supportingData: [],
      confidence: 100
    };
  }
}