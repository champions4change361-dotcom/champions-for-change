import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { io, type Socket } from 'socket.io-client';
import { type Match } from "@shared/schema";
import { 
  Trophy, 
  Timer, 
  Target, 
  User, 
  MessageSquare, 
  CheckCircle, 
  Play, 
  Pause, 
  StopCircle,
  Edit,
  Send,
  Clock,
  MapPin,
  Users,
  Shield,
  Zap,
  Medal,
  Activity
} from 'lucide-react';

// ScoreIcon component
const ScoreIcon = Activity;

// Using shared Match type from schema for consistency
type LiveMatch = Match;

interface ScoreUpdateData {
  team1Score?: number;
  team2Score?: number;
  status?: string;
  winner?: string;
  notes?: string;
}

interface LiveScoringProps {
  userRole: string;
  userId: string;
  canUpdateScores: boolean;
  assignedEvents: string[];
  assignedVenues: string[];
  tournamentName: string;
  tournamentId: string;
}

export function LiveScoring({
  userRole,
  userId,
  canUpdateScores,
  assignedEvents,
  assignedVenues,
  tournamentName,
  tournamentId
}: LiveScoringProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // State management
  const [selectedMatch, setSelectedMatch] = useState<LiveMatch | null>(null);
  const [newScore1, setNewScore1] = useState('');
  const [newScore2, setNewScore2] = useState('');
  const [matchStatus, setMatchStatus] = useState<string>('in-progress');
  const [updateReason, setUpdateReason] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Instant messaging state
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<string>('encouragement');
  const [targetParticipant, setTargetParticipant] = useState('');

  // Fetch matches for the tournament
  const { data: matches = [], isLoading: matchesLoading, error: matchesError } = useQuery<LiveMatch[]>({
    queryKey: ['/api/tournaments', tournamentId, 'matches'],
    enabled: !!tournamentId,
  });

  // SECURITY: Enhanced WebSocket connection with authentication
  useEffect(() => {
    if (!tournamentId) return;

    const newSocket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true, // SECURITY: Include credentials for authentication
      autoConnect: false // Wait for manual connection after auth setup
    });

    // SECURITY: Handle authentication success/failure
    newSocket.on('authenticated', (authData) => {
      console.log('✅ WebSocket authenticated:', authData);
      setIsConnected(true);
      
      // Join tournament room with proper authorization
      newSocket.emit('join-room', {
        room: `tournament:${tournamentId}`,
        context: { module: 'tournaments', action: 'live_scoring' }
      });
    });

    newSocket.on('auth_error', (error) => {
      console.error('❌ WebSocket authentication failed:', error);
      setIsConnected(false);
      toast({
        title: "Connection Failed",
        description: "Failed to authenticate WebSocket connection",
        variant: "destructive"
      });
    });

    newSocket.on('connect', () => {
      console.log('🔗 Connected to live scoring WebSocket');
      // Connection is established, but wait for authentication
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from live scoring WebSocket');
      setIsConnected(false);
    });

    // Handle room join success/failure
    newSocket.on('room_joined', (data) => {
      console.log('🏆 Joined tournament room:', data);
      toast({
        title: "Connected",
        description: `Connected to tournament: ${tournamentName}`,
      });
    });

    newSocket.on('room_error', (error) => {
      console.error('❌ Failed to join tournament room:', error);
      toast({
        title: "Access Denied",
        description: `Cannot access tournament: ${error.reason || 'Insufficient permissions'}`,
        variant: "destructive"
      });
    });

    // SECURITY: Listen for standardized event names with backward compatibility
    newSocket.on('score_updated', (data) => {
      console.log('📊 Received score update:', data);
      // Invalidate queries to refresh match data
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournamentId, 'matches'] });
      toast({
        title: "Score Updated",
        description: `Match score has been updated in real-time`,
      });
    });

    // LEGACY SUPPORT: Still listen for old event names for backward compatibility
    newSocket.on('score-update', (data) => {
      console.log('📊 Received legacy score update:', data);
      // Handle the same way as score_updated
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournamentId, 'matches'] });
      toast({
        title: "Score Updated",
        description: `Match score has been updated in real-time`,
      });
    });

    // Listen for match completion (standardized name)
    newSocket.on('match_completed', (data) => {
      console.log('🏆 Match completed:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournamentId, 'matches'] });
      toast({
        title: "Match Completed!",
        description: `${data.match?.winner || 'A team'} has won the match`,
      });
    });

    // Connect and authenticate
    newSocket.connect();
    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.emit('leave-room', { room: `tournament:${tournamentId}` });
        newSocket.disconnect();
      }
    };
  }, [tournamentId, queryClient, toast, tournamentName]);

  // Score update mutation
  const scoreUpdateMutation = useMutation({
    mutationFn: async ({ matchId, scoreData }: { matchId: string, scoreData: ScoreUpdateData }) => {
      const response = await apiRequest(
        `/api/tournaments/${tournamentId}/matches/${matchId}/score-update`, 
        "POST", 
        scoreData
      );
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Optimistic UI update - immediately update local cache
      queryClient.setQueryData(
        ['/api/tournaments', tournamentId, 'matches'],
        (oldMatches: LiveMatch[] = []) => {
          return oldMatches.map(match => 
            match.id === variables.matchId 
              ? { ...match, ...variables.scoreData }
              : match
          );
        }
      );
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', tournamentId, 'matches'] });
      
      toast({
        title: "Score Updated",
        description: `Match score has been updated successfully`,
      });
      
      // Clear form
      setNewScore1('');
      setNewScore2('');
      setUpdateReason('');
      setSelectedMatch(null);
    },
    onError: (error) => {
      console.error('Failed to update score:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update score",
        variant: "destructive",
      });
    }
  });

  // Access control check
  const canUpdateThisMatch = (match: LiveMatch) => {
    if (!canUpdateScores) return false;
    
    // Tournament directors and athletic directors can update any match
    if (userRole === 'tournament_manager' || userRole === 'district_athletic_director') {
      return true;
    }
    
    // Scorekeepers can only update their assigned venues
    if (userRole === 'scorekeeper') {
      // For now, allow scorekeeper to update any match in their assigned venues
      // Could add venue property to match schema in future
      return assignedVenues.length === 0 || assignedVenues.includes('default');
    }
    
    return false;
  };

  const handleScoreUpdate = (match: LiveMatch) => {
    if (!canUpdateThisMatch(match)) return;
    
    // Prepare score update data
    const scoreData: ScoreUpdateData = {
      team1Score: parseFloat(newScore1) || match.team1Score || 0,
      team2Score: parseFloat(newScore2) || match.team2Score || 0,
      status: matchStatus as any,
      notes: updateReason || undefined
    };

    // Determine winner if match is completed
    if (matchStatus === 'completed') {
      if (scoreData.team1Score! > scoreData.team2Score!) {
        scoreData.winner = match.team1 || undefined;
      } else if (scoreData.team2Score! > scoreData.team1Score!) {
        scoreData.winner = match.team2 || undefined;
      }
      // No winner set for ties
    }
    
    // Execute the mutation to update score via API
    scoreUpdateMutation.mutate({
      matchId: match.id,
      scoreData
    });
  };

  const sendInstantMessage = (match: LiveMatch) => {
    if (!messageContent.trim()) return;
    
    const performanceContext = {
      matchId: match.id,
      result: targetParticipant === 'participant1' || targetParticipant === 'team1'
        ? `${match.team1Score || 0} points`
        : `${match.team2Score || 0} points`,
      placement: determineCurrentPlacement(match, targetParticipant)
    };
    
    console.log('Sending instant message:', {
      matchId: match.id,
      senderId: userId,
      messageType,
      content: messageContent,
      relatedTeam: targetParticipant,
      performanceContext,
      deliveredViaPush: true
    });
    
    // In a real implementation, this would make an API call
    // For now, just simulate sending the message
    toast({
      title: "Message Sent",
      description: `Message sent to ${targetParticipant}`,
    });
    
    // Clear message form
    setMessageContent('');
    setShowMessagePanel(false);
  };

  const determineCurrentPlacement = (match: LiveMatch, participant: string) => {
    // Simple placement logic - could be enhanced with tournament-wide data
    const score1 = match.team1Score || 0;
    const score2 = match.team2Score || 0;
    
    if (participant === 'participant1' || participant === 'team1') return score1 > score2 ? 1 : 2;
    return score2 > score1 ? 1 : 2;
  };

  const formatScore = (score?: number, scoreType?: string, scoreUnit?: string) => {
    const baseScore = score?.toString() || '0';
    if (scoreUnit) {
      return `${baseScore} ${scoreUnit}`;
    }
    return baseScore;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      case 'scheduled': return 'text-gray-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return Play;
      case 'completed': return CheckCircle;
      case 'scheduled': return Clock;
      case 'cancelled': return StopCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6" data-testid="live-scoring">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Live Scoring - {tournamentName}
          </CardTitle>
          <CardDescription>
            Real-time score updates with automatic bracket progression
          </CardDescription>
          
          {/* Access Control Info */}
          <div className="flex items-center gap-4 text-sm">
            <Badge variant={canUpdateScores ? "default" : "secondary"}>
              <Shield className="h-3 w-3 mr-1" />
              {canUpdateScores ? 'Scoring Enabled' : 'View Only'}
            </Badge>
            
            {assignedEvents.length > 0 && (
              <div className="text-gray-600">
                Events: {assignedEvents.join(', ')}
              </div>
            )}
            
            {assignedVenues.length > 0 && (
              <div className="text-gray-600">
                Venues: {assignedVenues.join(', ')}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Loading and Error States */}
      {matchesLoading && (
        <Alert data-testid="loading-matches">
          <AlertDescription>Loading tournament matches...</AlertDescription>
        </Alert>
      )}

      {matchesError && (
        <Alert variant="destructive" data-testid="error-loading-matches">
          <AlertDescription>
            Failed to load tournament matches. Please check your authentication and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* WebSocket Connection Status */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        {isConnected ? 'Connected to live updates' : 'Connecting to live updates...'}
      </div>

      {/* Live Scores Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => {
          const StatusIcon = getStatusIcon(match.status);
          const canUpdate = canUpdateThisMatch(match);
          
          return (
            <Card key={match.id} className={`${match.status === 'in-progress' ? 'border-green-500 shadow-lg' : ''}`} data-testid={`match-card-${match.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScoreIcon className="h-4 w-4" />
                    <span className="font-medium text-sm">Match {match.round}-{match.position}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={match.status === 'in-progress' ? "default" : "secondary"} className="text-xs">
                      {match.status === 'in-progress' ? (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          LIVE
                        </>
                      ) : (
                        match.status.toUpperCase()
                      )}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3 w-3" />
                  {match.bracket ? `${match.bracket} bracket` : 'Tournament match'}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Participants and Scores */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{match.team1 || 'TBD'}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatScore(match.team1Score || 0)}
                    </span>
                  </div>
                  
                  {match.team2 && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{match.team2}</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatScore(match.team2Score || 0)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  {canUpdate && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMatch(match)}
                        data-testid={`button-update-score-${match.id}`}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Update Score
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTargetParticipant('team1');
                          setShowMessagePanel(true);
                          setSelectedMatch(match);
                        }}
                        data-testid={`button-message-${match.id}`}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Score Update Modal */}
      {selectedMatch && !showMessagePanel && (
        <Card>
          <CardHeader>
            <CardTitle>Update Score - Match {selectedMatch.round}-{selectedMatch.position}</CardTitle>
            <CardDescription>
              {selectedMatch.bracket ? `${selectedMatch.bracket} bracket` : 'Tournament match'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{selectedMatch.team1 || 'Team 1'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newScore1}
                  onChange={(e) => setNewScore1(e.target.value)}
                  placeholder={`Current: ${selectedMatch.team1Score || 0}`}
                  data-testid="input-score-1"
                />
              </div>
              
              {selectedMatch.team2 && (
                <div>
                  <Label>{selectedMatch.team2}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newScore2}
                    onChange={(e) => setNewScore2(e.target.value)}
                    placeholder={`Current: ${selectedMatch.team2Score || 0}`}
                    data-testid="input-score-2"
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label>Match Status</Label>
              <Select value={matchStatus} onValueChange={setMatchStatus}>
                <SelectTrigger data-testid="select-match-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Update Reason (Optional)</Label>
              <Input
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                placeholder="e.g., Corrected measurement, Match completed"
                data-testid="input-update-reason"
              />
            </div>
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedMatch(null)}
                data-testid="button-cancel-update"
              >
                Cancel
              </Button>
              
              <Button
                onClick={() => handleScoreUpdate(selectedMatch)}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-save-score"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Score & Advance Bracket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instant Message Panel */}
      {showMessagePanel && selectedMatch && (
        <Card>
          <CardHeader>
            <CardTitle>Send Instant Message</CardTitle>
            <CardDescription>
              Quick message to participant or coach - delivered via push notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Message To</Label>
                <Select value={targetParticipant} onValueChange={setTargetParticipant}>
                  <SelectTrigger data-testid="select-target-participant">
                    <SelectValue placeholder="Select participant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant1">{selectedMatch.team1 || 'Team 1'}</SelectItem>
                    {selectedMatch.team2 && (
                      <SelectItem value="participant2">{selectedMatch.team2}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Message Type</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger data-testid="select-message-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encouragement">Encouragement</SelectItem>
                    <SelectItem value="congratulations">Congratulations</SelectItem>
                    <SelectItem value="technique_tip">Technique Tip</SelectItem>
                    <SelectItem value="performance_update">Performance Update</SelectItem>
                    <SelectItem value="coaching_note">Coaching Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Message</Label>
              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder={
                  messageType === 'encouragement' 
                    ? "Great job! Keep up the great work!"
                    : "Type your message here..."
                }
                rows={3}
                maxLength={200}
                data-testid="textarea-message"
              />
              <div className="text-xs text-gray-500 mt-1">
                {messageContent.length}/200 characters
              </div>
            </div>
            
            {/* Performance Context */}
            {targetParticipant && (
              <Alert>
                <Medal className="h-4 w-4" />
                <AlertDescription>
                  <strong>Performance Context:</strong> Match {selectedMatch.round}-{selectedMatch.position} - Current result: {' '}
                  {targetParticipant === 'participant1' 
                    ? formatScore(selectedMatch.team1Score || 0)
                    : formatScore(selectedMatch.team2Score || 0)
                  } (Currently in {determineCurrentPlacement(selectedMatch, targetParticipant)} place)
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowMessagePanel(false)}
                data-testid="button-cancel-message"
              >
                Cancel
              </Button>
              
              <Button
                onClick={() => sendInstantMessage(selectedMatch)}
                disabled={!targetParticipant || !messageContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Push Notification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}