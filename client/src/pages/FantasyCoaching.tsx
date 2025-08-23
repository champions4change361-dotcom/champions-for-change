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
import { LiveScoring } from '@/components/LiveScoring';
import { useAuth } from '@/hooks/useAuth';
import { FantasyAgeGate } from '@/components/FantasyAgeGate';
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
  const [activeTab, setActiveTab] = useState('ai-coach');
  const [question, setQuestion] = useState('');
  const [selectedSlate, setSelectedSlate] = useState<'morning' | 'afternoon' | 'all-day'>('all-day');
  const [playerAnalysis, setPlayerAnalysis] = useState<any>(null);

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
  const { data: injuryReports } = useQuery({
    queryKey: ['/api/fantasy/injury-reports'],
    queryFn: async () => {
      const response = await apiRequest('/api/fantasy/injury-reports', 'GET');
      return response;
    }
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

  const handleAskQuestion = async () => {
    if (!question.trim()) return;
    
    askQuestionMutation.mutate(question);
    setQuestion('');
  };

  // Player Analysis Mutation
  const analyzePlayerMutation = useMutation({
    mutationFn: async () => {
      const selectedPlayerName = rosterData?.roster?.find((p: any) => p.id === selectedPlayer)?.name || selectedPlayer;
      const analysisData = {
        sport: selectedSport,
        position: selectedPosition,
        player: selectedPlayerName,
        team: rosterData?.roster?.find((p: any) => p.id === selectedPlayer)?.team
      };
      
      const response = await apiRequest('/api/fantasy/analyze-player', 'POST', analysisData);
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      setPlayerAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: `Generated analysis for ${rosterData?.roster?.find((p: any) => p.id === selectedPlayer)?.name}`,
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
                  {rosterData?.success && rosterData.roster?.length > 0 ? 
                    rosterData.roster.map((item: any) => (
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
                    {playerAnalysis.analysis.projectedPoints}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Confidence
                    <span className="block text-xs opacity-70">AI prediction accuracy</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {playerAnalysis.analysis.confidence}%
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Matchup Rating
                    <span className="block text-xs opacity-70">Opponent strength (10 = easiest)</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {playerAnalysis.analysis.matchupRating}/10
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Recommendation</div>
                <div className="text-sm text-muted-foreground">
                  {playerAnalysis.analysis.recommendation}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <div className="text-xs text-muted-foreground">Injury Risk</div>
                  <Badge variant={playerAnalysis.analysis.injuryRisk === 'Low' ? 'default' : 'destructive'}>
                    {playerAnalysis.analysis.injuryRisk}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Ownership</div>
                  <div className="text-sm">{playerAnalysis.analysis.ownership}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Game Script</div>
                  <div className="text-sm">{playerAnalysis.analysis.gameScript}</div>
                </div>
                {playerAnalysis.analysis.weather && (
                  <div>
                    <div className="text-xs text-muted-foreground">Weather</div>
                    <div className="text-sm">{playerAnalysis.analysis.weather}</div>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <div className="text-sm font-semibold mb-2">Key Factors</div>
                <div className="flex flex-wrap gap-2">
                  {playerAnalysis.analysis.keyFactors.map((factor: string, index: number) => (
                    <Badge key={index} variant="outline">{factor}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="coaching-tabs">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1">
            <TabsTrigger value="ai-coach" data-testid="tab-ai-coach" className="flex items-center justify-center text-xs sm:text-sm">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">AI Coach</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="slate-analysis" data-testid="tab-slate-analysis" className="flex items-center justify-center text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Slate Analysis</span>
              <span className="sm:hidden">Slate</span>
            </TabsTrigger>
            <TabsTrigger value="injury-reports" data-testid="tab-injury-reports" className="flex items-center justify-center text-xs sm:text-sm">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Injuries</span>
              <span className="sm:hidden">Injury</span>
            </TabsTrigger>
            <TabsTrigger value="lineup" data-testid="tab-lineup" className="flex items-center justify-center text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Lineup Coach</span>
              <span className="sm:hidden">Lineup</span>
            </TabsTrigger>
            <TabsTrigger value="live" data-testid="tab-live" className="flex items-center justify-center text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Live Scoring</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
          </TabsList>

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
                  Real-time injury updates with traditional fantasy designations
                </CardDescription>
                
                {/* Legend */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs font-semibold mb-2 text-gray-700">Fantasy Designations:</div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">✓</div>
                      <span>Healthy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">P</div>
                      <span>Probable</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xs">Q</div>
                      <span>Questionable</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">D</div>
                      <span>Doubtful</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs">O</div>
                      <span>Out</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center text-white font-bold text-xs">✅</div>
                      <span>Starter</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-500 rounded flex items-center justify-center text-white font-bold text-xs">B</div>
                      <span>Bench</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">❌</div>
                      <span>Not Playing</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded">Coach's Decision</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(injuryReports as any)?.injuries ? (
                  <div className="space-y-3">
                    {(injuryReports as any).injuries.map((injury: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {/* Traditional Fantasy Designation */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            injury.status === 'Healthy' ? 'bg-green-500' :
                            injury.status === 'Probable' ? 'bg-blue-500' :
                            injury.status === 'Questionable' ? 'bg-yellow-500' :
                            injury.status === 'Doubtful' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}>
                            {injury.status === 'Healthy' ? '✓' :
                             injury.status === 'Probable' ? 'P' :
                             injury.status === 'Questionable' ? 'Q' :
                             injury.status === 'Doubtful' ? 'D' :
                             'O'}
                          </div>
                          
                          {/* Starter Status Indicator */}
                          <div className={`w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs ${
                            injury.starterStatus === 'starter' ? 'bg-green-600' :
                            injury.starterStatus === 'bench' ? 'bg-gray-500' :
                            injury.starterStatus === 'out' ? 'bg-red-600' :
                            'bg-gray-400'
                          }`}>
                            {injury.starterStatus === 'starter' ? '✅' :
                             injury.starterStatus === 'bench' ? 'B' :
                             injury.starterStatus === 'out' ? '❌' :
                             '?'}
                          </div>
                          
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {injury.playerName}
                              {injury.coachDecision && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  Coach's Decision
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{injury.team} - {injury.position} - {injury.injury}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              injury.status === 'Healthy' ? 'default' :
                              injury.status === 'Probable' ? 'default' :
                              injury.status === 'Questionable' ? 'secondary' :
                              'destructive'
                            }>
                              {injury.status}
                            </Badge>
                            {injury.starterStatus && (
                              <Badge variant="outline" className="text-xs">
                                {injury.starterStatus === 'starter' ? 'STARTER' :
                                 injury.starterStatus === 'bench' ? 'BENCH' :
                                 injury.starterStatus === 'out' ? 'OUT' :
                                 'TBD'}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{injury.impact}</div>
                          {injury.lastUpdated && (
                            <div className="text-xs text-gray-400 mt-1">Updated: {injury.lastUpdated}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Loading injury reports...
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