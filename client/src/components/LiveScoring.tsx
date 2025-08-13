import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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
  Medal
} from 'lucide-react';

interface LiveScore {
  id: string;
  tournamentId: string;
  matchId: string;
  eventName: string;
  participant1Name: string;
  participant1Score: number;
  participant2Name?: string;
  participant2Score?: number;
  scoreType: 'points' | 'time' | 'distance' | 'games' | 'sets' | 'goals' | 'runs';
  scoreUnit: string;
  matchStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  venue: string;
  field: string;
  isLive: boolean;
  lastScoreUpdate?: string;
}

interface LiveScoringProps {
  userRole: string;
  userId: string;
  canUpdateScores: boolean;
  assignedEvents: string[];
  assignedVenues: string[];
  tournamentName: string;
}

export function LiveScoring({
  userRole,
  userId,
  canUpdateScores,
  assignedEvents,
  assignedVenues,
  tournamentName
}: LiveScoringProps) {
  const [scores, setScores] = useState<LiveScore[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<LiveScore | null>(null);
  const [newScore1, setNewScore1] = useState('');
  const [newScore2, setNewScore2] = useState('');
  const [matchStatus, setMatchStatus] = useState<string>('in_progress');
  const [updateReason, setUpdateReason] = useState('');
  
  // Instant messaging state
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageType, setMessageType] = useState<string>('encouragement');
  const [targetParticipant, setTargetParticipant] = useState('');

  // Access control check
  const canUpdateThisMatch = (match: LiveScore) => {
    if (!canUpdateScores) return false;
    
    // Tournament directors and athletic directors can update any match
    if (userRole === 'tournament_manager' || userRole === 'district_athletic_director') {
      return true;
    }
    
    // Scorekeepers can only update their assigned events/venues
    if (userRole === 'scorekeeper') {
      const hasEventAccess = assignedEvents.includes(match.eventName);
      const hasVenueAccess = assignedVenues.includes(match.venue) || assignedVenues.includes(match.field);
      return hasEventAccess || hasVenueAccess;
    }
    
    return false;
  };

  const handleScoreUpdate = (match: LiveScore) => {
    if (!canUpdateThisMatch(match)) return;
    
    const updatedMatch = {
      ...match,
      participant1Score: parseFloat(newScore1) || match.participant1Score,
      participant2Score: parseFloat(newScore2) || match.participant2Score,
      matchStatus: matchStatus as any,
      lastScoreUpdate: new Date().toISOString(),
      liveUpdateCount: (match as any).liveUpdateCount + 1
    };
    
    // Update local state
    setScores(scores.map(s => s.id === match.id ? updatedMatch : s));
    
    // Log the update
    console.log('Score update:', {
      matchId: match.id,
      updatedBy: userId,
      updateType: 'score_change',
      previousData: {
        participant1Score: match.participant1Score,
        participant2Score: match.participant2Score,
        matchStatus: match.matchStatus
      },
      newData: {
        participant1Score: updatedMatch.participant1Score,
        participant2Score: updatedMatch.participant2Score,
        matchStatus: updatedMatch.matchStatus
      },
      updateReason
    });
    
    // Clear form
    setNewScore1('');
    setNewScore2('');
    setUpdateReason('');
    setSelectedMatch(null);
  };

  const sendInstantMessage = (match: LiveScore) => {
    if (!messageContent.trim()) return;
    
    const performanceContext = {
      eventName: match.eventName,
      result: targetParticipant === 'participant1' 
        ? `${match.participant1Score} ${match.scoreUnit}`
        : `${match.participant2Score} ${match.scoreUnit}`,
      placement: determineCurrentPlacement(match, targetParticipant)
    };
    
    console.log('Sending instant message:', {
      liveScoreId: match.id,
      senderId: userId,
      messageType,
      content: messageContent,
      relatedParticipantId: targetParticipant,
      performanceContext,
      deliveredViaPush: true
    });
    
    // Clear message form
    setMessageContent('');
    setShowMessagePanel(false);
  };

  const determineCurrentPlacement = (match: LiveScore, participant: string) => {
    // Simple placement logic - could be enhanced with tournament-wide data
    if (match.scoreType === 'time') {
      // Lower time is better
      const score1 = match.participant1Score;
      const score2 = match.participant2Score || 0;
      if (participant === 'participant1') return score1 < score2 ? 1 : 2;
      return score2 < score1 ? 1 : 2;
    } else {
      // Higher score is better
      const score1 = match.participant1Score;
      const score2 = match.participant2Score || 0;
      if (participant === 'participant1') return score1 > score2 ? 1 : 2;
      return score2 > score1 ? 1 : 2;
    }
  };

  const getScoreTypeIcon = (scoreType: string) => {
    switch (scoreType) {
      case 'time': return Timer;
      case 'distance': return Target;
      case 'points': return Trophy;
      default: return Trophy;
    }
  };

  const formatScore = (score: number, scoreType: string, scoreUnit: string) => {
    if (scoreType === 'time') {
      // Convert seconds to MM:SS format if needed
      if (scoreUnit === 'seconds' && score >= 60) {
        const minutes = Math.floor(score / 60);
        const seconds = (score % 60).toFixed(2);
        return `${minutes}:${seconds.padStart(5, '0')}`;
      }
    }
    return `${score} ${scoreUnit}`;
  };

  // Mock data for demonstration
  useEffect(() => {
    setScores([
      {
        id: '1',
        tournamentId: 'tourney-1',
        matchId: 'match-1',
        eventName: 'Shot Put',
        participant1Name: 'Sarah Johnson',
        participant1Score: 32.5,
        participant2Name: 'Mike Chen',
        participant2Score: 28.7,
        scoreType: 'distance',
        scoreUnit: 'feet',
        matchStatus: 'in_progress',
        venue: 'Field 1',
        field: 'Throwing Circle A',
        isLive: true,
        lastScoreUpdate: new Date().toISOString()
      },
      {
        id: '2',
        tournamentId: 'tourney-1',
        matchId: 'match-2',
        eventName: '100m Dash',
        participant1Name: 'Alex Rivera',
        participant1Score: 12.45,
        participant2Name: 'Jordan Smith',
        participant2Score: 12.78,
        scoreType: 'time',
        scoreUnit: 'seconds',
        matchStatus: 'completed',
        venue: 'Track',
        field: 'Lane 4-5',
        isLive: false
      }
    ]);
  }, []);

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

      {/* Live Scores Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scores.map((match) => {
          const ScoreIcon = getScoreTypeIcon(match.scoreType);
          const canUpdate = canUpdateThisMatch(match);
          
          return (
            <Card key={match.id} className={`${match.isLive ? 'border-green-500 shadow-lg' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScoreIcon className="h-4 w-4" />
                    <span className="font-medium text-sm">{match.eventName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={match.isLive ? "default" : "secondary"} className="text-xs">
                      {match.isLive ? (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          LIVE
                        </>
                      ) : (
                        match.matchStatus.toUpperCase()
                      )}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3 w-3" />
                  {match.venue} - {match.field}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Participants and Scores */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{match.participant1Name}</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatScore(match.participant1Score, match.scoreType, match.scoreUnit)}
                    </span>
                  </div>
                  
                  {match.participant2Name && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{match.participant2Name}</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatScore(match.participant2Score || 0, match.scoreType, match.scoreUnit)}
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
                          setTargetParticipant('participant1');
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
            <CardTitle>Update Score - {selectedMatch.eventName}</CardTitle>
            <CardDescription>
              {selectedMatch.venue} - {selectedMatch.field}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>{selectedMatch.participant1Name}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newScore1}
                  onChange={(e) => setNewScore1(e.target.value)}
                  placeholder={`Current: ${selectedMatch.participant1Score} ${selectedMatch.scoreUnit}`}
                  data-testid="input-score-1"
                />
              </div>
              
              {selectedMatch.participant2Name && (
                <div>
                  <Label>{selectedMatch.participant2Name}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newScore2}
                    onChange={(e) => setNewScore2(e.target.value)}
                    placeholder={`Current: ${selectedMatch.participant2Score} ${selectedMatch.scoreUnit}`}
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="postponed">Postponed</SelectItem>
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
                    <SelectItem value="participant1">{selectedMatch.participant1Name}</SelectItem>
                    {selectedMatch.participant2Name && (
                      <SelectItem value="participant2">{selectedMatch.participant2Name}</SelectItem>
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
                    ? "Great job! Keep working on technique - it's your first year and we can work on it later."
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
                  <strong>Performance Context:</strong> {selectedMatch.eventName} - Current result: {' '}
                  {targetParticipant === 'participant1' 
                    ? formatScore(selectedMatch.participant1Score, selectedMatch.scoreType, selectedMatch.scoreUnit)
                    : formatScore(selectedMatch.participant2Score || 0, selectedMatch.scoreType, selectedMatch.scoreUnit)
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