import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  Users, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Pause, 
  Square,
  Timer,
  Target,
  Zap,
  RefreshCw,
  MapPinned,
  Wifi,
  WifiOff,
  Save,
  User
} from 'lucide-react';

interface Match {
  id: string;
  eventName: string;
  venue: string;
  field: string;
  startTime: string;
  participant1: string;
  participant2: string;
  participant1Score: number;
  participant2Score: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scoreType: 'points' | 'time' | 'distance';
  scoreUnit?: string;
  isLive: boolean;
}

export default function ScorekeeperDashboard() {
  const [locationVerified, setLocationVerified] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scoringMatch, setScoringMatch] = useState<string | null>(null);

  // Sample scorekeeper assignments - in real app would come from API
  const assignments: Match[] = [
    {
      id: '1',
      eventName: 'Boys Basketball - Semifinals',
      venue: 'Miller High School',
      field: 'Gym A',
      startTime: '2025-08-19T16:00:00',
      participant1: 'Ray High School',
      participant2: 'Carroll High School', 
      participant1Score: 42,
      participant2Score: 38,
      status: 'in_progress',
      scoreType: 'points',
      isLive: true
    },
    {
      id: '2', 
      eventName: 'Girls Volleyball - Championship',
      venue: 'Miller High School',
      field: 'Gym B',
      startTime: '2025-08-19T18:30:00',
      participant1: 'Veterans Memorial Eagles',
      participant2: 'King High School',
      participant1Score: 0,
      participant2Score: 0,
      status: 'scheduled',
      scoreType: 'points',
      isLive: false
    },
    {
      id: '3',
      eventName: 'Track & Field - Shot Put',
      venue: 'Miller High School',
      field: 'Track Field',
      startTime: '2025-08-19T15:30:00',
      participant1: 'Sarah Martinez',
      participant2: 'Jessica Thompson',
      participant1Score: 42.5,
      participant2Score: 39.2,
      status: 'completed',
      scoreType: 'distance',
      scoreUnit: 'feet',
      isLive: false
    }
  ];

  const currentTime = new Date();

  useEffect(() => {
    // Simulate location verification
    const timer = setTimeout(() => {
      setLocationVerified(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleStartScoring = (match: Match) => {
    setScoringMatch(match.id);
    setSelectedMatch(match);
  };

  const handleScoreUpdate = (participant: 'participant1' | 'participant2', newScore: number) => {
    if (selectedMatch) {
      const updatedMatch = {
        ...selectedMatch,
        [participant === 'participant1' ? 'participant1Score' : 'participant2Score']: newScore,
        status: 'in_progress' as const,
        isLive: true
      };
      setSelectedMatch(updatedMatch);
    }
  };

  const handleCompleteMatch = () => {
    if (selectedMatch) {
      const updatedMatch = {
        ...selectedMatch,
        status: 'completed' as const,
        isLive: false
      };
      setSelectedMatch(updatedMatch);
      setScoringMatch(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge className="bg-green-500 text-white"><Play className="h-3 w-3 mr-1" />Live</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Complete</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-500 text-black"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Scorekeeper Dashboard</h1>
              <p className="text-slate-300">Welcome back, Marcus Johnson</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Location Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${locationVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                {locationVerified ? <MapPinned className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {locationVerified ? 'Location Verified' : 'Verifying Location...'}
                </span>
              </div>
              
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isOnline ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700">
            <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-600">My Assignments</TabsTrigger>
            <TabsTrigger value="scoring" className="data-[state=active]:bg-green-600">Live Scoring</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-purple-600">Completed</TabsTrigger>
          </TabsList>

          {/* My Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="grid gap-4">
              {assignments.filter(match => match.status !== 'completed').map((match) => (
                <Card key={match.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{match.eventName}</CardTitle>
                      {getStatusBadge(match.status)}
                    </div>
                    <CardDescription className="flex items-center text-slate-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {match.venue} • {match.field}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Match Info */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center text-slate-300">
                          <Clock className="h-4 w-4 mr-2 text-blue-400" />
                          <span className="text-sm">
                            {new Date(match.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <Users className="h-4 w-4 mr-2 text-green-400" />
                          <span className="text-sm">vs Match</span>
                        </div>
                        <div className="flex items-center text-slate-300">
                          <Target className="h-4 w-4 mr-2 text-purple-400" />
                          <span className="text-sm capitalize">{match.scoreType} {match.scoreUnit}</span>
                        </div>
                      </div>

                      {/* Participants & Current Score */}
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <p className="font-semibold text-white text-sm mb-1">{match.participant1}</p>
                            <p className="text-2xl font-bold text-blue-400">{match.participant1Score}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-400 text-xs uppercase tracking-wide">VS</p>
                          </div>
                          <div className="text-center">
                            <p className="font-semibold text-white text-sm mb-1">{match.participant2}</p>
                            <p className="text-2xl font-bold text-green-400">{match.participant2Score}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {match.status === 'scheduled' && (
                          <Button 
                            onClick={() => handleStartScoring(match)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            data-testid={`button-start-scoring-${match.id}`}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Scoring
                          </Button>
                        )}
                        {match.status === 'in_progress' && (
                          <>
                            <Button 
                              onClick={() => handleStartScoring(match)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              data-testid={`button-continue-scoring-${match.id}`}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Continue Scoring
                            </Button>
                            <Button 
                              onClick={handleCompleteMatch}
                              variant="outline"
                              className="border-green-500 text-green-400 hover:bg-green-500/10"
                              data-testid={`button-complete-match-${match.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Scoring Tab */}
          <TabsContent value="scoring" className="space-y-6">
            {selectedMatch ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl">{selectedMatch.eventName}</CardTitle>
                    <Badge className="bg-green-500 text-white animate-pulse">
                      <Zap className="h-3 w-3 mr-1" />
                      Live Scoring
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-400">
                    {selectedMatch.venue} • {selectedMatch.field}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Live Score Interface */}
                  <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl p-6">
                    <div className="grid grid-cols-3 gap-6 items-center">
                      {/* Participant 1 */}
                      <div className="text-center space-y-4">
                        <div>
                          <p className="text-white font-semibold mb-2">{selectedMatch.participant1}</p>
                          <div className="text-4xl font-bold text-blue-400 mb-4">{selectedMatch.participant1Score}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleScoreUpdate('participant1', selectedMatch.participant1Score + 1)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            +1
                          </Button>
                          <Button 
                            onClick={() => handleScoreUpdate('participant1', selectedMatch.participant1Score + 2)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            +2
                          </Button>
                          <Button 
                            onClick={() => handleScoreUpdate('participant1', selectedMatch.participant1Score + 3)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            +3
                          </Button>
                        </div>
                        <Input 
                          type="number"
                          value={selectedMatch.participant1Score}
                          onChange={(e) => handleScoreUpdate('participant1', parseInt(e.target.value) || 0)}
                          className="text-center bg-slate-700 border-slate-600 text-white"
                          data-testid="input-participant1-score"
                        />
                      </div>

                      {/* VS Separator */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-400 mb-4">VS</div>
                        <Timer className="h-8 w-8 mx-auto text-slate-500" />
                      </div>

                      {/* Participant 2 */}
                      <div className="text-center space-y-4">
                        <div>
                          <p className="text-white font-semibold mb-2">{selectedMatch.participant2}</p>
                          <div className="text-4xl font-bold text-green-400 mb-4">{selectedMatch.participant2Score}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleScoreUpdate('participant2', selectedMatch.participant2Score + 1)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            +1
                          </Button>
                          <Button 
                            onClick={() => handleScoreUpdate('participant2', selectedMatch.participant2Score + 2)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            +2
                          </Button>
                          <Button 
                            onClick={() => handleScoreUpdate('participant2', selectedMatch.participant2Score + 3)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            +3
                          </Button>
                        </div>
                        <Input 
                          type="number"
                          value={selectedMatch.participant2Score}
                          onChange={(e) => handleScoreUpdate('participant2', parseInt(e.target.value) || 0)}
                          className="text-center bg-slate-700 border-slate-600 text-white"
                          data-testid="input-participant2-score"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => {}} 
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                      data-testid="button-save-score"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Score
                    </Button>
                    <Button 
                      onClick={handleCompleteMatch}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      data-testid="button-complete-match"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Complete Match
                    </Button>
                    <Button 
                      onClick={() => setScoringMatch(null)}
                      variant="outline"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      data-testid="button-pause-scoring"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Scoring
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-16 text-center">
                  <Target className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-xl text-slate-400 mb-2">No Active Scoring Session</p>
                  <p className="text-slate-500">Select a match from your assignments to start scoring</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Completed Tab */}
          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4">
              {assignments.filter(match => match.status === 'completed').map((match) => (
                <Card key={match.id} className="bg-slate-800/30 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{match.eventName}</CardTitle>
                      {getStatusBadge(match.status)}
                    </div>
                    <CardDescription className="flex items-center text-slate-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {match.venue} • {match.field}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-700/30 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-center">
                          <p className="font-semibold text-white text-sm mb-1">{match.participant1}</p>
                          <p className="text-2xl font-bold text-blue-400">{match.participant1Score}</p>
                        </div>
                        <div className="text-center">
                          <Trophy className="h-6 w-6 text-yellow-400 mx-auto" />
                          <p className="text-slate-400 text-xs mt-1">Final</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-white text-sm mb-1">{match.participant2}</p>
                          <p className="text-2xl font-bold text-green-400">{match.participant2Score}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}