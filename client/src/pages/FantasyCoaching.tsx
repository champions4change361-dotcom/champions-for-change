import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, Trophy, TrendingUp, Users, Zap, Target, BarChart3, MessageSquare, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { KeystoneAvatar } from '@/components/KeystoneAvatar';
import { FantasyLineupCoach } from '@/components/FantasyLineupCoach';
import DFSLineupOptimizer from '@/components/DFSLineupOptimizer';
import { LiveScoring } from '@/components/LiveScoring';
import { useAuth } from '@/hooks/useAuth';
import { FantasyAgeGate } from '@/components/FantasyAgeGate';
import HistoricalAIStatus from '@/components/HistoricalAIStatus';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function FantasyCoaching() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [activeTab, setActiveTab] = useState('dfs-optimizer');
  const [question, setQuestion] = useState('');
  const [selectedSlate, setSelectedSlate] = useState<'morning' | 'afternoon' | 'all-day'>('all-day');
  const [playerAnalysis, setPlayerAnalysis] = useState<any>(null);
  const [selectedInjurySport, setSelectedInjurySport] = useState('NFL');

  // Fantasy AI Question Mutation
  const askQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('/api/fantasy/ask-question', 'POST', { question });
      return response;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Slate Analysis Query
  const { data: slateAnalysis, isLoading: slateLoading } = useQuery({
    queryKey: ['/api/fantasy/analyze-slate', selectedSlate],
    queryFn: async () => {
      const response = await apiRequest('/api/fantasy/analyze-slate', 'POST', { slate: selectedSlate });
      return response;
    }
  });

  // Injury Reports Query
  const { data: injuryReports, isLoading: injuryLoading } = useQuery({
    queryKey: ['/api/fantasy/injury-reports'],
    queryFn: async () => {
      const response = await apiRequest('/api/fantasy/injury-reports', 'GET');
      return response;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0 // Always consider data stale to force fresh fetches
  });

  // Roster Data Query - loads players/teams for selected sport and position
  const { data: rosterData, isLoading: rosterLoading } = useQuery({
    queryKey: ['/api/fantasy/roster', selectedSport, selectedPosition],
    queryFn: async () => {
      if (!selectedSport || !selectedPosition) return null;
      console.log(`Loading roster: ${selectedSport}/${selectedPosition}`);
      const response = await apiRequest(`/api/fantasy/roster/${selectedSport}/${selectedPosition}`, 'GET');
      const data = await response.json();
      console.log('Roster data:', data);
      return data;
    },
    enabled: !!(selectedSport && selectedPosition),
    staleTime: 60000 // Cache for 1 minute
  });

  // Yahoo Connection Status
  const { data: yahooStatus, error: yahooError, isLoading: yahooLoading } = useQuery({
    queryKey: ['/api/yahoo/status'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/yahoo/status', 'GET');
        const data = await response.json();
        return data as { hasCredentials: boolean; connected: boolean; error?: boolean };
      } catch (error) {
        console.error('Yahoo status error:', error);
        return { hasCredentials: false, connected: false, error: true };
      }
    },
    retry: false
  });

  // R Analytics Projections - Professional Grade Fantasy Intelligence (NFL + MLB)
  const { data: rAnalyticsProjections, isLoading: rAnalyticsLoading } = useQuery({
    queryKey: ['/api/r-analytics/projections', selectedPosition, selectedSport],
    queryFn: async () => {
      const supportedSports = ['nfl', 'mlb'];
      if (!selectedPosition || !selectedSport || !supportedSports.includes(selectedSport)) return null;
      
      // Position validation by sport
      const nflPositions = ['QB', 'RB', 'WR', 'TE'];
      const mlbPositions = ['C', '1B', '2B', '3B', 'SS', 'OF', 'SP', 'RP'];
      
      const validPosition = selectedSport === 'nfl' 
        ? nflPositions.includes(selectedPosition)
        : mlbPositions.includes(selectedPosition);
        
      if (!validPosition) return null;
      
      console.log(`🔬 Loading R analytics for ${selectedSport.toUpperCase()} ${selectedPosition}`);
      const response = await fetch(`/api/r-analytics/projections/${selectedSport}/${selectedPosition}`);
      const data = await response.json();
      console.log('R Analytics data:', data);
      return data;
    },
    enabled: !!(selectedPosition && selectedSport && ['nfl', 'mlb'].includes(selectedSport)),
    staleTime: 300000 // Cache for 5 minutes
  });

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    askQuestionMutation.mutate(question);
    setQuestion('');
  };

  // Player Analysis Mutation
  const analyzePlayerMutation = useMutation({
    mutationFn: async () => {
      const selectedPlayerName = rosterData?.players?.find((p: any) => p.id === selectedPlayer)?.name || selectedPlayer;
      const analysisData = {
        sport: selectedSport,
        position: selectedPosition,
        player: selectedPlayerName,
        team: rosterData?.players?.find((p: any) => p.id === selectedPlayer)?.team
      };
      
      const response = await apiRequest('/api/fantasy/analyze-player', 'POST', analysisData);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setPlayerAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: `Generated analysis for ${rosterData?.players?.find((p: any) => p.id === selectedPlayer)?.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze player. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyzePlayer = () => {
    if (!selectedSport || !selectedPosition || !selectedPlayer) return;
    analyzePlayerMutation.mutate();
  };

  // Removed - Yahoo API now centralized, no individual user auth needed

  // Get positions for selected sport
  const getPositionsForSport = (sport: string) => {
    switch (sport) {
      case 'nfl':
        return [
          { value: 'QB', label: 'Quarterback (QB)' },
          { value: 'RB', label: 'Running Back (RB)' },
          { value: 'WR', label: 'Wide Receiver (WR)' },
          { value: 'TE', label: 'Tight End (TE)' },
          { value: 'K', label: 'Kicker (K)' },
          { value: 'DEF', label: 'Defense/ST (DEF)' }
        ];
      case 'nba':
        return [
          { value: 'PG', label: 'Point Guard (PG)' },
          { value: 'SG', label: 'Shooting Guard (SG)' },
          { value: 'SF', label: 'Small Forward (SF)' },
          { value: 'PF', label: 'Power Forward (PF)' },
          { value: 'C', label: 'Center (C)' }
        ];
      case 'mlb':
        return [
          { value: 'C', label: 'Catcher (C)' },
          { value: '1B', label: 'First Base (1B)' },
          { value: '2B', label: 'Second Base (2B)' },
          { value: '3B', label: 'Third Base (3B)' },
          { value: 'SS', label: 'Shortstop (SS)' },
          { value: 'OF', label: 'Outfield (OF)' },
          { value: 'SP', label: 'Starting Pitcher (SP)' },
          { value: 'RP', label: 'Relief Pitcher (RP)' }
        ];
      case 'nhl':
        return [
          { value: 'C', label: 'Center (C)' },
          { value: 'LW', label: 'Left Wing (LW)' },
          { value: 'RW', label: 'Right Wing (RW)' },
          { value: 'D', label: 'Defense (D)' },
          { value: 'G', label: 'Goaltender (G)' }
        ];
      default:
        return [];
    }
  };

  // Sample data for demonstration
  const weeklyTrends = {
    breakoutCandidates: [
      {
        player: "Jahmyr Gibbs",
        reason: "Left-side rushing advantage vs weak LB corps. Runs left 75% of time, defense allows 67% more yards left side.",
        confidence: 87,
        projection: "20+ points, multiple TDs"
      },
      {
        player: "Puka Nacua", 
        reason: "Slot target dominance vs defense allowing 12.4 slot receptions/game (worst in NFL)",
        confidence: 83,
        projection: "8+ catches, 100+ yards"
      }
    ],
    avoidList: [
      {
        player: "Weather-dependent RB",
        reason: "Heavy rain forecast, outdoor game, historically struggles in wet conditions",
        confidence: 72,
        projection: "Limited upside"
      }
    ],
    sleepers: [
      {
        player: "Backup WR",
        reason: "WR1 questionable with injury, 85% snap share if starter sits",
        confidence: 65,
        projection: "Boom potential if opportunity"
      }
    ],
    stackOfTheWeek: {
      qb: "High-volume QB",
      receivers: ["Primary WR", "Slot WR"],
      reason: "Projected 55+ pass attempts in pace-up spot vs weak secondary",
      confidence: 79
    }
  };

  const getCurrentWeekRange = () => {
    const weeks = [];
    for (let i = 1; i <= 18; i++) {
      weeks.push(i);
    }
    return weeks;
  };

  return (
    <FantasyAgeGate platform="Fantasy Coaching Platform" requiredAge={21}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50" data-testid="fantasy-coaching-page">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
                Fantasy Coaching Brain
              </h1>
              <p className="text-gray-600">Advanced AI analysis for smarter fantasy decisions</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 text-white px-4 py-2">
                Educational Tool - No Gambling
              </Badge>
              <Badge className="bg-purple-600 text-white px-4 py-2">
                Texas Compliant
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Yahoo Connection Status */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Alert className="border-green-200 bg-green-50 mb-4" data-testid="yahoo-centralized">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>Sports Data Ready:</strong> Centralized Yahoo API serving real-time data to all users. 
            No individual connection required - everyone gets the same premium experience.
          </AlertDescription>
        </Alert>

        {/* AI Disclaimer */}
        <Alert className="border-amber-200 bg-amber-50" data-testid="ai-disclaimer">
          <Brain className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900">
            <strong>Foundation AI Disclaimer:</strong> Foundation AI can get things wrong - do your own research. 
            "We can tell you the Cowboys secondary is hurt and the Browns QB is trending up… 
            but we can't predict when someone's about to have their 'Matt Ryan moment.'"
          </AlertDescription>
        </Alert>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Week Selection */}
        <Card className="mb-6" data-testid="week-selection">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Multi-Sport Fantasy Analysis
            </CardTitle>
            <CardDescription>
              Choose your sport, position, and specific player/team for detailed fantasy analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 space-y-2 sm:space-y-0">
              <div>
                <Label htmlFor="sport-select">Choose Sport</Label>
                <select 
                  id="sport-select"
                  value={selectedSport} 
                  onChange={(e) => {
                    setSelectedSport(e.target.value);
                    setSelectedPosition('');
                    setSelectedPlayer('');
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  data-testid="sport-selector"
                >
                  <option value="">Select Sport</option>
                  <option value="nfl">🏈 NFL Football</option>
                  <option value="nba">🏀 NBA Basketball</option>
                  <option value="mlb">⚾ MLB Baseball</option>
                  <option value="nhl">🏒 NHL Hockey</option>
                </select>
              </div>
              <div>
                <Label htmlFor="position-select">Choose Position</Label>
                <select 
                  id="position-select"
                  value={selectedPosition} 
                  onChange={(e) => {
                    setSelectedPosition(e.target.value);
                    setSelectedPlayer('');
                  }}
                  disabled={!selectedSport}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="position-selector"
                >
                  <option value="">Select Position</option>
                  {getPositionsForSport(selectedSport).map(position => (
                    <option key={position.value} value={position.value}>
                      {position.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="player-select">
                  Choose {selectedPosition === 'DEF' ? 'Team' : 'Player'}
                </Label>
                <select 
                  id="player-select"
                  value={selectedPlayer} 
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  disabled={!selectedPosition}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="player-selector"
                >
                  <option value="">
                    Select {selectedPosition === 'DEF' ? 'Team' : 'Player'}
                  </option>
                  {rosterLoading && (
                    <option disabled>Loading {selectedPosition === 'DEF' ? 'teams' : 'players'}...</option>
                  )}
                  {rosterData?.success && rosterData.players?.length > 0 ? 
                    rosterData.players.map((item: any) => (
                      <option key={item.id || item.name} value={item.id || item.name}>
                        {item.name} {item.team ? `(${item.team})` : ''}
                      </option>
                    )) : 
                    (!rosterLoading && selectedPosition && (
                      <option disabled>No {selectedPosition === 'DEF' ? 'teams' : 'players'} found</option>
                    ))
                  }
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  className="w-full h-12 text-base font-semibold" 
                  disabled={!selectedSport || !selectedPosition || !selectedPlayer || analyzePlayerMutation.isPending}
                  onClick={handleAnalyzePlayer}
                  data-testid="analyze-button"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  {analyzePlayerMutation.isPending ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Player Analysis Results */}
        {playerAnalysis && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Analysis: {playerAnalysis.player} ({playerAnalysis.team})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Projected Points</div>
                  <div className="text-2xl font-bold text-green-600">
                    {playerAnalysis?.analysis?.projectedPoints || playerAnalysis?.projectedPoints || 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Confidence
                    <span className="block text-xs opacity-70">AI prediction accuracy</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {playerAnalysis?.analysis?.confidence || playerAnalysis?.confidence || 'N/A'}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Matchup Rating
                    <span className="block text-xs opacity-70">Opponent strength (10 = easiest)</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {playerAnalysis?.analysis?.matchupRating || playerAnalysis?.analysis?.matchup_grade || playerAnalysis?.matchupRating || 'N/A'}/10
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Recommendation</div>
                <div className="text-sm text-muted-foreground">
                  {playerAnalysis?.analysis?.recommendation || playerAnalysis?.recommendation || 'No recommendation available'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-xs text-muted-foreground">Injury Risk</div>
                  <Badge variant={(playerAnalysis?.analysis?.injuryRisk || playerAnalysis?.analysis?.injury_risk || playerAnalysis?.injuryRisk) === 'Low' ? 'default' : 'destructive'}>
                    {playerAnalysis?.analysis?.injuryRisk || playerAnalysis?.analysis?.injury_risk || playerAnalysis?.injuryRisk || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ownership</div>
                  <div className="text-sm">{playerAnalysis?.analysis?.ownership || playerAnalysis?.ownership || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Game Script</div>
                  <div className="text-sm">{playerAnalysis?.analysis?.gameScript || playerAnalysis?.gameScript || 'N/A'}</div>
                </div>
                {(playerAnalysis?.analysis?.weather || playerAnalysis?.weather) && (
                  <div>
                    <div className="text-xs text-muted-foreground">Weather</div>
                    <div className="text-sm">{playerAnalysis?.analysis?.weather || playerAnalysis?.weather}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Key Factors</div>
                <div className="flex flex-wrap gap-2">
                  {(playerAnalysis?.analysis?.keyFactors || playerAnalysis?.keyFactors || []).map((factor: string, index: number) => (
                    <Badge key={index} variant="outline">{factor}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="coaching-tabs">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 gap-1 h-auto p-1">
            <TabsTrigger value="dfs-optimizer" data-testid="tab-dfs-optimizer" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem] bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
              <Trophy className="w-4 h-4 mb-1 text-yellow-600" />
              <span className="font-bold text-yellow-800">Optimizer</span>
            </TabsTrigger>
            <TabsTrigger value="ai-coach" data-testid="tab-ai-coach" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem]">
              <Brain className="w-4 h-4 mb-1" />
              <span>AI</span>
            </TabsTrigger>
            <TabsTrigger value="historical-ai" data-testid="tab-historical-ai" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem] bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
              <span className="text-xs font-bold text-purple-600 mb-1">📊</span>
              <span className="font-bold text-purple-800">2020-24</span>
            </TabsTrigger>
            <TabsTrigger value="r-analytics" data-testid="tab-r-analytics" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem]">
              <BarChart3 className="w-4 h-4 mb-1" />
              <span>R Pro</span>
            </TabsTrigger>
            <TabsTrigger value="slate-analysis" data-testid="tab-slate-analysis" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem]">
              <TrendingUp className="w-4 h-4 mb-1" />
              <span>Slate</span>
            </TabsTrigger>
            <TabsTrigger value="injury-reports" data-testid="tab-injury-reports" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem]">
              <AlertTriangle className="w-4 h-4 mb-1" />
              <span>Injury</span>
            </TabsTrigger>
            <TabsTrigger value="lineup" data-testid="tab-lineup" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem]">
              <Target className="w-4 h-4 mb-1" />
              <span>Lineup</span>
            </TabsTrigger>
            <TabsTrigger value="live" data-testid="tab-live" className="flex flex-col items-center justify-center text-xs px-1 py-2 min-h-[3rem]">
              <Zap className="w-4 h-4 mb-1" />
              <span>Live</span>
            </TabsTrigger>
          </TabsList>

          {/* DFS Lineup Optimizer Tab - PRIMARY FEATURE */}
          <TabsContent value="dfs-optimizer" className="space-y-6" data-testid="dfs-optimizer-content">
            <DFSLineupOptimizer />
          </TabsContent>

          {/* AI Coach Tab - Real Sports Intelligence */}
          <TabsContent value="ai-coach" className="space-y-6" data-testid="ai-coach-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Fantasy Coaching AI - Real Sports Intelligence
                </CardTitle>
                <CardDescription>
                  Ask questions about player usage, injury reports, matchups, and Sunday slate optimization. 
                  Powered by live Yahoo Sports data and advanced analytics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask: 'Which RB will get the most carries on Sunday's slate?' or 'Analyze injury reports for this week'"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    data-testid="ai-question-input"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAskQuestion}
                    disabled={askQuestionMutation.isPending || !question.trim()}
                    data-testid="ask-ai-button"
                  >
                    {askQuestionMutation.isPending ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Ask AI
                      </>
                    )}
                  </Button>
                </div>

                {/* Sample Questions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion("Which running back will get the most carries on Sunday's morning slate?")}
                    data-testid="sample-question-carries"
                  >
                    RB Carry Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion("What are the key injury reports affecting this week's slate?")}
                    data-testid="sample-question-injuries"
                  >
                    Injury Impact Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion("Which WR has the best matchup in the all-day slate?")}
                    data-testid="sample-question-matchups"
                  >
                    WR Matchup Analysis
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuestion("Analyze usage rates for top RBs this week")}
                    data-testid="sample-question-usage"
                  >
                    Usage Rate Analysis
                  </Button>
                </div>

                {/* AI Response */}
                {askQuestionMutation.data && (
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200" data-testid="ai-response">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Brain className="h-4 w-4" />
                        AI Analysis
                        <Badge className="ml-auto bg-purple-600">
                          {((askQuestionMutation.data as any)?.confidence || 85)}% Confidence
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-2">Answer:</h4>
                        <p className="text-purple-800">
                          {((askQuestionMutation.data as any)?.answer) || 'AI analysis completed - see detailed insights below.'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-purple-900 mb-2">Analysis:</h4>
                        <p className="text-purple-700">
                          {((askQuestionMutation.data as any)?.analysis) || 'Comprehensive analysis based on current NFL data, usage trends, and matchup information.'}
                        </p>
                      </div>

                      {(askQuestionMutation.data as any)?.supportingData && (askQuestionMutation.data as any).supportingData.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-900 mb-2">Supporting Data:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(askQuestionMutation.data as any).supportingData.map((data: any, index: number) => (
                              <div key={index} className="bg-white/60 p-3 rounded-lg text-center">
                                <div className="text-sm text-purple-600 font-medium">
                                  {data.metric || data.player}
                                </div>
                                <div className="text-lg font-bold text-purple-900">
                                  {data.value || data.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Historical AI Training Tab */}
          <TabsContent value="historical-ai" className="space-y-4" data-testid="historical-ai-content">
            <HistoricalAIStatus />
          </TabsContent>

          {/* R Analytics Tab - Professional Grade Fantasy Intelligence */}
          <TabsContent value="r-analytics" className="space-y-6" data-testid="r-analytics-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  R Analytics - Professional Projections
                </CardTitle>
                <CardDescription>
                  Advanced statistical analysis powered by R. NFL uses enhanced ffanalytics + nflverse integration, 
                  MLB uses baseball-public inspired analytics. Professional-grade projections with confidence ratings, 
                  injury risk, and Vegas data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedSport || !['nfl', 'mlb'].includes(selectedSport) ? (
                  <Alert className="border-amber-200 bg-amber-50">
                    <BarChart3 className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900">
                      <strong>NFL & MLB Supported:</strong> R Analytics is available for NFL and MLB. 
                      For {selectedSport?.toUpperCase() || 'other sports'}, use the main AI Coach tab which provides analysis across all sports.
                    </AlertDescription>
                  </Alert>
                ) : selectedSport === 'nfl' && (!selectedPosition || !['QB', 'RB', 'WR', 'TE'].includes(selectedPosition)) ? (
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      Select an NFL position (QB, RB, WR, or TE) above to view R Analytics projections powered by ffanalytics.
                    </AlertDescription>
                  </Alert>
                ) : selectedSport === 'mlb' && (!selectedPosition || !['C', '1B', '2B', '3B', 'SS', 'OF', 'SP', 'RP'].includes(selectedPosition)) ? (
                  <Alert>
                    <BarChart3 className="h-4 w-4" />
                    <AlertDescription>
                      Select an MLB position (C, 1B, 2B, 3B, SS, OF, SP, or RP) above to view baseball R Analytics projections.
                    </AlertDescription>
                  </Alert>
                ) : rAnalyticsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Activity className="w-6 h-6 animate-spin mr-2" />
                    Loading R Analytics for {selectedPosition}...
                  </div>
                ) : rAnalyticsProjections?.success ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className="bg-blue-600 text-white">
                        {selectedPosition} Rankings
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Source: {rAnalyticsProjections.source} • {rAnalyticsProjections.timestamp}
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {rAnalyticsProjections.projections?.map((player: any, index: number) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                                {player.rank}
                              </div>
                              <div>
                                <div className="font-semibold text-lg">{player.player}</div>
                                <div className="text-sm text-gray-600">{player.team} {selectedPosition}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{player.points}</div>
                                <div className="text-xs text-muted-foreground">Proj Points</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{player.confidence}%</div>
                                <div className="text-xs text-muted-foreground">Confidence</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Confidence Bar */}
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Confidence Level</span>
                              <span>{player.confidence}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  player.confidence >= 90 ? 'bg-green-500' :
                                  player.confidence >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${player.confidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {rAnalyticsProjections.projections?.length === 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No projections available for {selectedPosition} at this time.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load R Analytics projections. The analytics service may be unavailable.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slate Analysis Tab */}
          <TabsContent value="slate-analysis" className="space-y-6" data-testid="slate-analysis-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Sunday Slate Analysis
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of Sunday's games with carry projections and matchup data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="slate-select">Select Slate</Label>
                  <select 
                    id="slate-select"
                    value={selectedSlate} 
                    onChange={(e) => setSelectedSlate(e.target.value as 'morning' | 'afternoon' | 'all-day')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    data-testid="slate-selector"
                  >
                    <option value="morning">Morning Slate (1:00 PM ET)</option>
                    <option value="afternoon">Afternoon Slate (4:00 PM ET)</option>
                    <option value="all-day">All-Day Slate</option>
                  </select>
                </div>

                {slateLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Activity className="w-6 h-6 animate-spin mr-2" />
                    Analyzing slate data...
                  </div>
                ) : (slateAnalysis as any)?.analysis ? (
                  <div className="space-y-6">
                    {/* Top Plays */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        Top Carry Projections
                      </h3>
                      <div className="grid gap-3">
                        {(slateAnalysis as any).analysis.topPlays.slice(0, 3).map((player: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold">{player.playerName}</div>
                                  <div className="text-sm text-gray-600">{player.team} {player.position} {player.opponent}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-700">{player.projectedPoints} pts</div>
                                <div className="text-sm text-gray-600">{player.confidence}% confidence</div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{player.analysis}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="bg-white/60 p-2 rounded text-center">
                                <div className="font-medium">Carry Share</div>
                                <div className="text-blue-600 font-bold">
                                  {((player.usage?.carryShare || 0) * 100).toFixed(0)}%
                                </div>
                              </div>
                              <div className="bg-white/60 p-2 rounded text-center">
                                <div className="font-medium">Matchup</div>
                                <div className={`font-bold ${player.matchup?.difficulty === 'Easy' ? 'text-green-600' : 'text-yellow-600'}`}>
                                  {player.matchup?.difficulty}
                                </div>
                              </div>
                              <div className="bg-white/60 p-2 rounded text-center">
                                <div className="font-medium">Def Rank</div>
                                <div className="text-red-600 font-bold">#{player.matchup?.defensiveRank}</div>
                              </div>
                              <div className="bg-white/60 p-2 rounded text-center">
                                <div className="font-medium">Snap %</div>
                                <div className="text-purple-600 font-bold">{player.usage?.snapCount}%</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stack Recommendations */}
                    {(slateAnalysis as any).analysis.stackRecommendations && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-600" />
                          Stack Recommendations
                        </h3>
                        {(slateAnalysis as any).analysis.stackRecommendations.map((stack: any, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold">{stack.qb} + {stack.receivers.join(' + ')}</div>
                              <Badge className="bg-purple-600">{stack.confidence}% Confidence</Badge>
                            </div>
                            <p className="text-sm text-gray-700">{stack.reasoning}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a slate to view analysis
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Injury Reports Tab */}
          <TabsContent value="injury-reports" className="space-y-6" data-testid="injury-reports-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Live Injury Reports
                </CardTitle>
                <CardDescription>
                  Real-time injury updates organized by sport and game
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Sport Selection - DraftKings Style */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {['NFL', 'NBA', 'MLB', 'NHL'].map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setSelectedInjurySport(sport)}
                      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                        selectedInjurySport === sport
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>

                {/* Quick Legend */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center text-white font-bold text-xs">Q</div>
                      <span>Questionable</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-xs">D</div>
                      <span>Doubtful</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">O</div>
                      <span>Out</span>
                    </div>
                  </div>
                </div>

                {!injuryLoading && (injuryReports as any)?.injuries && (injuryReports as any).injuries.length > 0 ? (
                  <>
                    {/* Games for Selected Sport - DraftKings Style */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-2 text-gray-700">
                        {selectedInjurySport} Games Today
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        {selectedInjurySport === 'NFL' && ['CIN @ CLE', 'MIA @ IND', 'TB @ ATL'].map((game) => (
                          <div key={game} className="bg-gray-100 px-3 py-1 rounded text-sm">
                            {game}
                          </div>
                        ))}
                        {selectedInjurySport === 'NBA' && ['LAL @ GSW', 'BOS @ MIA', 'NYK @ BRK'].map((game) => (
                          <div key={game} className="bg-gray-100 px-3 py-1 rounded text-sm">
                            {game}
                          </div>
                        ))}
                        {selectedInjurySport === 'MLB' && ['LAD @ SF', 'NYY @ BOS', 'HOU @ TEX'].map((game) => (
                          <div key={game} className="bg-gray-100 px-3 py-1 rounded text-sm">
                            {game}
                          </div>
                        ))}
                        {selectedInjurySport === 'NHL' && ['BOS @ NYR', 'TOR @ MTL', 'VGK @ LAK'].map((game) => (
                          <div key={game} className="bg-gray-100 px-3 py-1 rounded text-sm">
                            {game}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Filtered Injuries - DraftKings Style */}
                    <div className="space-y-3">
                      {(() => {
                        console.log('Injury Reports Data:', injuryReports);
                        console.log('Selected Sport:', selectedInjurySport);
                        
                        if (!injuryReports || !(injuryReports as any).injuries || !Array.isArray((injuryReports as any).injuries)) {
                          console.log('No valid injury data structure');
                          return (
                            <div className="text-center py-8 text-gray-500">
                              Data structure issue - injuries not found
                            </div>
                          );
                        }

                        const filteredInjuries = (injuryReports as any).injuries.filter((injury: any) => {
                          // For NFL, show all NFL injuries since our data is all NFL
                          if (selectedInjurySport === 'NFL') {
                            return true; // Show all for now since all our current data is NFL
                          } else if (selectedInjurySport === 'NBA') {
                            return ['LAL', 'GSW', 'BOS', 'MIA', 'NYK', 'BRK', 'CHI', 'MIL', 'PHI', 'TOR', 'IND', 'CLE', 'ATL', 'ORL', 'WAS', 'CHA', 'DET', 'SAC', 'LAC', 'PHX', 'POR', 'UTA', 'OKC', 'MIN', 'NOP', 'SAS', 'HOU', 'DAL', 'MEM', 'DEN'].includes(injury.team);
                          } else if (selectedInjurySport === 'MLB') {
                            return ['LAD', 'SF', 'NYY', 'BOS', 'HOU', 'TEX', 'ATL', 'NYM', 'PHI', 'MIA', 'WSN', 'CHC', 'MIL', 'STL', 'CIN', 'PIT', 'SD', 'COL', 'ARI', 'LAA', 'OAK', 'SEA', 'MIN', 'CWS', 'DET', 'KC', 'CLE', 'TB', 'TOR', 'BAL'].includes(injury.team);
                          } else if (selectedInjurySport === 'NHL') {
                            return ['BOS', 'NYR', 'TOR', 'MTL', 'VGK', 'LAK', 'TB', 'FLA', 'CAR', 'NJD', 'NYI', 'WSH', 'PIT', 'PHI', 'CBJ', 'BUF', 'DET', 'OTT', 'COL', 'DAL', 'MIN', 'WPG', 'STL', 'NSH', 'CHI', 'ARI', 'CGY', 'EDM', 'VAN', 'SEA', 'SJS', 'ANA'].includes(injury.team);
                          }
                          return true;
                        });

                        console.log('Filtered injuries count:', filteredInjuries.length);
                        console.log('Filtered injuries:', filteredInjuries);

                        return filteredInjuries && filteredInjuries.length > 0 ? filteredInjuries.map((injury: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                            {/* Player Avatar - DraftKings Style */}
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm">
                              {injury.playerName.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            
                            {/* Player Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{injury.playerName}</span>
                                <span className="text-sm font-medium text-gray-600">{injury.position}</span>
                                {/* Injury Status Badge - Clean DraftKings Style */}
                                {injury.status !== 'Healthy' && (
                                  <div className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold ${
                                    injury.status === 'Questionable' ? 'bg-yellow-500' :
                                    injury.status === 'Doubtful' ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}>
                                    {injury.status === 'Questionable' ? 'Q' :
                                     injury.status === 'Doubtful' ? 'D' : 'O'}
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mb-1">{injury.team} • {injury.injury}</div>
                              <div className="text-xs text-gray-500">{injury.impact}</div>
                            </div>
                            
                            {/* Right Side Info - Timeline */}
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{injury.timeline}</div>
                              <div className="text-xs text-gray-500">{injury.lastUpdated}</div>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-8 text-gray-500">
                            No {selectedInjurySport} injury reports available right now.
                          </div>
                        );
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {injuryLoading ? 'Loading injury reports...' : 'No injury data available.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lineup" className="space-y-6" data-testid="lineup-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Lineup Analysis
                </CardTitle>
                <CardDescription>
                  AI-powered coaching for your fantasy lineup with player-specific insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <FantasyLineupCoach userId={user.id} week={selectedWeek} />
                ) : (
                  <Alert>
                    <AlertDescription>
                      Please log in to access personalized lineup coaching
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6" data-testid="trends-content">
            {/* Breakout Candidates */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <TrendingUp className="h-5 w-5" />
                  Week {selectedWeek} Breakout Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyTrends.breakoutCandidates.map((candidate, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-green-200" data-testid={`breakout-${index}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-green-900">{candidate.player}</h4>
                        <Badge className="bg-green-600 text-white">
                          {candidate.confidence}% Confidence
                        </Badge>
                      </div>
                      <p className="text-green-700 text-sm mb-2">{candidate.reason}</p>
                      <p className="text-green-600 text-xs font-medium">
                        Projection: {candidate.projection}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stack of the Week */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Target className="h-5 w-5" />
                  Stack of the Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 rounded-lg border border-blue-200" data-testid="stack-of-week">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-blue-900">
                      {weeklyTrends.stackOfTheWeek.qb} + {weeklyTrends.stackOfTheWeek.receivers.join(' + ')}
                    </h4>
                    <Badge className="bg-blue-600 text-white">
                      {weeklyTrends.stackOfTheWeek.confidence}% Confidence
                    </Badge>
                  </div>
                  <p className="text-blue-700 text-sm">{weeklyTrends.stackOfTheWeek.reason}</p>
                </div>
              </CardContent>
            </Card>

            {/* Avoid List */}
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Zap className="h-5 w-5" />
                  Avoid This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyTrends.avoidList.map((avoid, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-red-200" data-testid={`avoid-${index}`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-red-900">{avoid.player}</h4>
                        <Badge className="bg-red-600 text-white">
                          {avoid.confidence}% Confidence
                        </Badge>
                      </div>
                      <p className="text-red-700 text-sm">{avoid.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live" className="space-y-6" data-testid="live-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Live NFL Scores
                </CardTitle>
                <CardDescription>
                  Real-time scoring powered by ESPN API with fantasy coaching insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LiveScoring 
                  userRole="fantasy-coach"
                  userId={user?.id || "guest"}
                  canUpdateScores={false}
                  assignedEvents={[]}
                  assignedVenues={[]}
                  tournamentName="Fantasy Coaching"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6" data-testid="insights-content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Real-Time Game Insights
                </CardTitle>
                <CardDescription>
                  AI-powered analysis of live player performances and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>
                    Select a live game from the Live Scoring tab to see real-time player analysis, 
                    including insights like "Player X has 3 carries to the left for 45 yards - 
                    the pre-game analysis is holding perfectly!"
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </FantasyAgeGate>
  );
}