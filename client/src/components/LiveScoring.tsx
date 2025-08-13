import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  Zap,
  Target,
  Trophy
} from 'lucide-react';

interface LiveGame {
  gameId: string;
  week: number;
  status: string;
  clock: string;
  period: number;
  homeTeam: {
    id: string;
    name: string;
    score: string;
    logo: string;
  };
  awayTeam: {
    id: string;
    name: string;
    score: string;
    logo: string;
  };
  venue: string;
  startTime: string;
}

interface LiveInsight {
  type: string;
  message: string;
  confidence: number;
  fantasy_impact: string;
}

export function LiveScoring() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameInsights, setGameInsights] = useState<LiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchLiveScores = async () => {
    try {
      const response = await fetch('/api/espn/live-scores');
      const data = await response.json();
      
      if (data.success) {
        setGames(data.games);
        setLastUpdated(data.lastUpdated);
      }
    } catch (error) {
      console.error('Failed to fetch live scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameInsights = async (gameId: string) => {
    try {
      const response = await fetch(`/api/espn/game/${gameId}`);
      const data = await response.json();
      
      if (data.success) {
        setGameInsights(data.liveInsights || []);
      }
    } catch (error) {
      console.error('Failed to fetch game insights:', error);
    }
  };

  useEffect(() => {
    fetchLiveScores();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchLiveScores();
        if (selectedGame) {
          fetchGameInsights(selectedGame);
        }
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedGame]);

  const getGameStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in progress':
      case 'halftime':
        return 'bg-green-600';
      case 'final':
        return 'bg-gray-600';
      case 'scheduled':
        return 'bg-blue-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'touchdown':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'big_play':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="live-scoring-loading">
        <Activity className="h-6 w-6 animate-pulse mr-2" />
        <span>Loading live scores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="live-scoring">
      {/* Header with refresh controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live NFL Scores</h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated ? formatTime(lastUpdated) : 'Never'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="toggle-auto-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            size="sm"
            onClick={fetchLiveScores}
            data-testid="manual-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <Card 
            key={game.gameId} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedGame === game.gameId ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => {
              setSelectedGame(game.gameId);
              fetchGameInsights(game.gameId);
            }}
            data-testid={`game-card-${game.gameId}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge className={`${getGameStatusColor(game.status)} text-white`}>
                  {game.status}
                </Badge>
                {game.clock && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    {game.clock}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Away Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {game.awayTeam.logo && (
                    <img 
                      src={game.awayTeam.logo} 
                      alt={game.awayTeam.name}
                      className="w-6 h-6"
                    />
                  )}
                  <span className="font-medium text-sm">{game.awayTeam.name}</span>
                </div>
                <span className="text-xl font-bold">{game.awayTeam.score}</span>
              </div>
              
              {/* Home Team */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {game.homeTeam.logo && (
                    <img 
                      src={game.homeTeam.logo} 
                      alt={game.homeTeam.name}
                      className="w-6 h-6"
                    />
                  )}
                  <span className="font-medium text-sm">{game.homeTeam.name}</span>
                </div>
                <span className="text-xl font-bold">{game.homeTeam.score}</span>
              </div>
              
              {/* Game Info */}
              <div className="text-xs text-gray-500 border-t pt-2">
                <div>Week {game.week}</div>
                {game.venue && <div>{game.venue}</div>}
                {game.status === 'Scheduled' && (
                  <div>{formatTime(game.startTime)}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Insights for Selected Game */}
      {selectedGame && gameInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <TrendingUp className="h-5 w-5" />
              Live Fantasy Coaching Insights
            </CardTitle>
            <CardDescription>
              Real-time analysis for the selected game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gameInsights.map((insight, index) => (
              <Alert key={index} className="border-blue-200 bg-white">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <AlertDescription className="text-blue-900">
                      {insight.message}
                    </AlertDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          insight.confidence >= 90 ? 'border-green-500 text-green-700' :
                          insight.confidence >= 70 ? 'border-yellow-500 text-yellow-700' :
                          'border-red-500 text-red-700'
                        }`}
                      >
                        {insight.confidence}% Confidence
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          insight.fantasy_impact === 'high' ? 'border-red-500 text-red-700' :
                          insight.fantasy_impact === 'medium' ? 'border-yellow-500 text-yellow-700' :
                          'border-green-500 text-green-700'
                        }`}
                      >
                        {insight.fantasy_impact.toUpperCase()} Impact
                      </Badge>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No games message */}
      {games.length === 0 && (
        <Alert>
          <AlertDescription>
            No live games available. Check back during NFL game days for real-time scoring and fantasy insights.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}