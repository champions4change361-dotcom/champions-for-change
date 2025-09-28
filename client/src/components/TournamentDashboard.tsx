import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Trophy, 
  Users, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  Calendar,
  MapPin,
  Clock,
  Zap,
  BarChart3,
  UserPlus,
  Target,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ChallongeStyleBracket from "./ChallongeStyleBracket";
import { LiveScoring } from "./LiveScoring";
import { type Tournament, type Match } from "@shared/schema";
import { io, type Socket } from 'socket.io-client';

interface TournamentStats {
  totalTeams: number;
  totalMatches: number;
  completedMatches: number;
  inProgressMatches: number;
  upcomingMatches: number;
  participantCount: number;
  averageScore: number;
  lastUpdated: string;
}

interface TournamentDashboardProps {
  tournamentId?: string;
}

export function TournamentDashboard({ tournamentId }: TournamentDashboardProps) {
  const { id: paramId } = useParams<{ id: string }>();
  const finalTournamentId = tournamentId || paramId;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time WebSocket connection
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState<any[]>([]);

  // Dashboard state
  const [selectedTab, setSelectedTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch tournament data
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useQuery<Tournament>({
    queryKey: ["/api/tournaments", finalTournamentId],
    enabled: !!finalTournamentId,
  });

  // Fetch tournament matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/tournaments", finalTournamentId, "matches"],
    enabled: !!finalTournamentId,
  });

  // Fetch tournament statistics
  const { data: stats, isLoading: statsLoading } = useQuery<TournamentStats>({
    queryKey: ["/api/tournaments", finalTournamentId, "statistics"],
    enabled: !!finalTournamentId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (!finalTournamentId) return;

    // SECURITY: Enhanced WebSocket connection with authentication
    const newSocket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true, // SECURITY: Include credentials for authentication
      autoConnect: false // Wait for manual connection after auth setup
    });

    // SECURITY: Handle authentication success/failure
    newSocket.on('authenticated', (authData) => {
      console.log('✅ Tournament WebSocket authenticated:', authData);
      setIsConnected(true);
      
      // Join tournament room with proper authorization
      newSocket.emit('join-room', {
        room: `tournament:${finalTournamentId}`,
        context: { module: 'tournaments', action: 'dashboard' }
      });
    });

    newSocket.on('auth_error', (error) => {
      console.error('❌ Tournament WebSocket authentication failed:', error);
      setIsConnected(false);
    });

    newSocket.on('connect', () => {
      console.log('🔗 Connected to tournament WebSocket');
      // Connection is established, but wait for authentication
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from tournament WebSocket');
      setIsConnected(false);
    });

    // Handle room join success/failure
    newSocket.on('room_joined', (data) => {
      console.log('🏆 Joined tournament room:', data);
    });

    newSocket.on('room_error', (error) => {
      console.error('❌ Failed to join tournament room:', error);
    });

    // SECURITY: Listen for standardized event names
    newSocket.on('score_updated', (data) => {
      console.log('📊 Live score update (standardized):', data);
      setLiveUpdates(prev => [...prev.slice(-9), { type: 'score', data, timestamp: new Date() }]);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId, "statistics"] });
      
      toast({
        title: "Live Update",
        description: `Match score updated: ${data.scoreUpdate?.team1Score} - ${data.scoreUpdate?.team2Score}`,
      });
    });

    // LEGACY SUPPORT: Still listen for old event names for backward compatibility
    newSocket.on('score-update', (data) => {
      console.log('📊 Live score update (legacy):', data);
      setLiveUpdates(prev => [...prev.slice(-9), { type: 'score', data, timestamp: new Date() }]);
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId, "matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId, "statistics"] });
      
      toast({
        title: "Live Update",
        description: `Match score updated: ${data.scoreUpdate?.team1Score} - ${data.scoreUpdate?.team2Score}`,
      });
    });

    newSocket.on('match-completed', (data) => {
      console.log('🏆 Match completed:', data);
      setLiveUpdates(prev => [...prev.slice(-9), { type: 'match-completed', data, timestamp: new Date() }]);
      
      // Refresh all tournament data
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
      
      toast({
        title: "Match Completed!",
        description: `${data.match?.winner || 'A team'} has won the match`,
      });
    });

    // Handle bracket progression (standardized)
    newSocket.on('bracket_progressed', (data) => {
      console.log('🔄 Bracket progression (standardized):', data);
      setLiveUpdates(prev => [...prev.slice(-9), { type: 'bracket', data, timestamp: new Date() }]);
      
      // Refresh tournament and matches data
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
      
      toast({
        title: "Bracket Updated",
        description: "Tournament bracket has been updated with new matches",
      });
    });

    // LEGACY SUPPORT: Old bracket progression event
    newSocket.on('bracket-progression', (data) => {
      console.log('🔄 Bracket progression (legacy):', data);
      setLiveUpdates(prev => [...prev.slice(-9), { type: 'bracket', data, timestamp: new Date() }]);
      
      // Refresh tournament and matches data
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
      
      toast({
        title: "Bracket Updated",
        description: "Tournament bracket has been updated with new matches",
      });
    });

    // Handle tournament status updates (standardized)
    newSocket.on('tournament_status_changed', (data) => {
      console.log('📅 Tournament status update (standardized):', data);
      setLiveUpdates(prev => [...prev.slice(-9), { type: 'status', data, timestamp: new Date() }]);
      
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
    });

    // LEGACY SUPPORT: Old tournament status event
    newSocket.on('tournament-status', (data) => {
      console.log('📅 Tournament status update (legacy):', data);
      setLiveUpdates(prev => [...prev.slice(-9), { type: 'status', data, timestamp: new Date() }]);
      
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
    });

    // Connect and authenticate
    newSocket.connect();
    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.emit('leave-room', { room: `tournament:${finalTournamentId}` });
        newSocket.disconnect();
      }
    };
  }, [finalTournamentId, queryClient, toast]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
      toast({
        title: "Refreshed",
        description: "Tournament data has been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Could not refresh tournament data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Tournament control mutations
  const startTournamentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/tournaments/${finalTournamentId}/start`, "POST");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
      toast({
        title: "Tournament Started",
        description: "The tournament is now in progress",
      });
    },
  });

  const pauseTournamentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/tournaments/${finalTournamentId}/pause`, "POST");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", finalTournamentId] });
      toast({
        title: "Tournament Paused",
        description: "The tournament has been paused",
      });
    },
  });

  // Check if user can manage this tournament
  const canManageTournament = user && tournament && (
    user.id === tournament.userId ||
    ['tournament_manager', 'assistant_tournament_manager', 'head_coach', 'assistant_coach'].includes(user.userRole || '')
  );

  if (!finalTournamentId) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tournament selected. Please select a tournament to view its dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (tournamentLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tournament dashboard...</p>
        </div>
      </div>
    );
  }

  if (tournamentError || !tournament) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tournament not found or you don't have permission to view it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getProgressPercentage = () => {
    if (!stats || stats.totalMatches === 0) return 0;
    return Math.round((stats.completedMatches / stats.totalMatches) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="tournament-dashboard">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900" data-testid="text-tournament-name">
                      {tournament.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {tournament.sport} • {stats?.totalTeams || 0} teams
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(tournament.status)} data-testid="status-tournament">
                  {tournament.status === 'upcoming' ? 'Upcoming' : 
                   tournament.status === 'stage-1' || tournament.status === 'stage-2' || tournament.status === 'stage-3' ? 'In Progress' : 'Completed'}
                </Badge>
              </div>

              <div className="flex items-center space-x-3">
                {/* WebSocket Status */}
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                  isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span>{isConnected ? 'Live' : 'Offline'}</span>
                </div>

                {canManageTournament && (
                  <>
                    {tournament.status === 'upcoming' && (
                      <Button
                        onClick={() => startTournamentMutation.mutate()}
                        disabled={startTournamentMutation.isPending}
                        data-testid="button-start-tournament"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Tournament
                      </Button>
                    )}
                    
                    {(tournament.status === 'stage-1' || tournament.status === 'stage-2' || tournament.status === 'stage-3') && (
                      <Button
                        variant="outline"
                        onClick={() => pauseTournamentMutation.mutate()}
                        disabled={pauseTournamentMutation.isPending}
                        data-testid="button-pause-tournament"
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  data-testid="button-refresh-tournament"
                >
                  <RotateCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Tournament Progress */}
            {stats && stats.totalMatches > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tournament Progress</span>
                  <span className="text-sm text-gray-500">
                    {stats.completedMatches} of {stats.totalMatches} matches completed
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bracket" data-testid="tab-bracket">
              <Target className="h-4 w-4 mr-2" />
              Bracket
            </TabsTrigger>
            <TabsTrigger value="live-scoring" data-testid="tab-live-scoring">
              <Zap className="h-4 w-4 mr-2" />
              Live Scoring
            </TabsTrigger>
            <TabsTrigger value="teams" data-testid="tab-teams">
              <Users className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Statistics Cards */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Teams</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-teams">
                    {stats?.totalTeams || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.participantCount || 0} total participants
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matches</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-total-matches">
                    {stats?.totalMatches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.completedMatches || 0} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-in-progress-matches">
                    {stats?.inProgressMatches || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active matches
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="stat-average-score">
                    {stats?.averageScore?.toFixed(1) || '0.0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per match
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Live Updates Feed */}
            {liveUpdates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Live Updates</span>
                  </CardTitle>
                  <CardDescription>Real-time tournament activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3" data-testid="live-updates-feed">
                    {liveUpdates.slice(-5).reverse().map((update, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {update.type === 'score' && <Target className="h-4 w-4 text-blue-500" />}
                          {update.type === 'match-completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          {update.type === 'bracket' && <Trophy className="h-4 w-4 text-yellow-500" />}
                          {update.type === 'status' && <Calendar className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {update.type === 'score' && 'Score updated'}
                            {update.type === 'match-completed' && 'Match completed'}
                            {update.type === 'bracket' && 'Bracket updated'}
                            {update.type === 'status' && 'Status changed'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {update.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tournament Information */}
            <Card>
              <CardHeader>
                <CardTitle>Tournament Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Date:</span>
                      <span className="text-sm text-gray-700">
                        {tournament.tournamentDate ? new Date(tournament.tournamentDate).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Location:</span>
                      <span className="text-sm text-gray-700">{tournament.location || 'TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Format:</span>
                      <span className="text-sm text-gray-700">{tournament.tournamentType || 'Single Elimination'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Sport:</span>
                      <span className="text-sm text-gray-700">{tournament.sport || 'General'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Team Size:</span>
                      <span className="text-sm text-gray-700">{tournament.teamSize || 'TBD'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Entry Fee:</span>
                      <span className="text-sm text-gray-700">
                        {tournament.entryFee ? `$${tournament.entryFee}` : 'Free'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {tournament.description && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-700">{tournament.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bracket Tab */}
          <TabsContent value="bracket">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Bracket</CardTitle>
                <CardDescription>
                  Interactive tournament bracket with live updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChallongeStyleBracket 
                  tournament={{...tournament, sport: tournament.sport || 'Unknown', teamSize: tournament.teamSize || 0}} 
                  matches={matches.map(match => ({
                    ...match, 
                    team1: match.team1 || null,
                    team2: match.team2 || null
                  }))} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Scoring Tab */}
          <TabsContent value="live-scoring">
            <Card>
              <CardHeader>
                <CardTitle>Live Scoring</CardTitle>
                <CardDescription>
                  Real-time match scoring and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canManageTournament && user ? (
                  <LiveScoring
                    userRole={user.userRole || 'fan'}
                    userId={user.id}
                    canUpdateScores={canManageTournament}
                    assignedEvents={[]}
                    assignedVenues={[]}
                    tournamentName={tournament.name}
                    tournamentId={finalTournamentId!}
                  />
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need tournament management permissions to access live scoring.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Teams Tab */}
          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  View and manage tournament teams and registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
                  <p className="text-gray-500 mb-4">
                    Team registration and management features will be available here.
                  </p>
                  {canManageTournament && (
                    <Button data-testid="button-add-team">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Team
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TournamentDashboard;