import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, Trophy, TrendingUp, Users, Zap, Target, BarChart3 } from 'lucide-react';
import { KeystoneAvatar } from '@/components/KeystoneAvatar';
import { FantasyLineupCoach } from '@/components/FantasyLineupCoach';
import { LiveScoring } from '@/components/LiveScoring';
import { useAuth } from '@/hooks/useAuth';
import { FantasyAgeGate } from '@/components/FantasyAgeGate';

export default function FantasyCoaching() {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [activeTab, setActiveTab] = useState('lineup');

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
            <div className="flex items-center gap-4">
              <KeystoneAvatar state="success" size="large" domain="coaches" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
                  Fantasy Coaching Brain
                </h1>
                <p className="text-gray-600">Advanced AI analysis for smarter fantasy decisions</p>
              </div>
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

      {/* AI Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
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
              Analysis Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="week-select">NFL Week</Label>
                <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                  <SelectTrigger data-testid="week-selector">
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentWeekRange().map(week => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="player-search">Player Search</Label>
                <Input
                  id="player-search"
                  placeholder="Search player..."
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  data-testid="player-search"
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full" data-testid="analyze-button">
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="coaching-tabs">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="lineup" data-testid="tab-lineup">Lineup Coach</TabsTrigger>
            <TabsTrigger value="trends" data-testid="tab-trends">Weekly Trends</TabsTrigger>
            <TabsTrigger value="live" data-testid="tab-live">Live Scoring</TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights">Game Insights</TabsTrigger>
          </TabsList>

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