import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Timer, 
  Users, 
  Target, 
  Crown,
  Medal,
  Clock,
  Activity,
  BarChart3,
  Flame,
  Zap,
  CheckCircle,
  X,
  Star,
  TrendingUp
} from 'lucide-react';

// Import FFA interfaces from shared bracket generator
import type {
  FFAParticipant,
  FFALeaderboardEntry,
  FFAHeat,
  FFARound,
  FFAPerformance,
  FFAHeatResult,
  MultiHeatRacingStructure,
  BattleRoyaleStructure,
  PointAccumulationStructure,
  TimeTrialsStructure,
  SurvivalEliminationStructure,
  FFAScoringRound
} from '../../../shared/bracket-generator';

interface FFATournamentDisplayProps {
  tournament: any;
  bracketStructure: MultiHeatRacingStructure | BattleRoyaleStructure | PointAccumulationStructure | TimeTrialsStructure | SurvivalEliminationStructure;
  onUpdateResults?: (results: any) => void;
  isLive?: boolean;
}

export const FFATournamentDisplay: React.FC<FFATournamentDisplayProps> = ({
  tournament,
  bracketStructure,
  onUpdateResults,
  isLive = false
}) => {
  const [selectedTab, setSelectedTab] = useState('leaderboard');
  const [selectedRound, setSelectedRound] = useState(1);

  const formatType = bracketStructure.format;

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'multi-heat-racing': return Zap;
      case 'battle-royale': return Flame;
      case 'point-accumulation': return BarChart3;
      case 'time-trials': return Timer;
      case 'survival-elimination': return Target;
      default: return Trophy;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'eliminated': return 'bg-red-500';
      case 'advanced': return 'bg-blue-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  const FormatIcon = getFormatIcon(formatType);

  return (
    <div className="space-y-6">
      {/* Tournament Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FormatIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{tournament.name}</CardTitle>
                <CardDescription className="text-base">
                  {formatType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Tournament
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Users className="h-4 w-4" />
                <span>{bracketStructure.participants.length} Participants</span>
              </div>
              {isLive && (
                <Badge variant="destructive" className="animate-pulse">
                  <Activity className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rounds" data-testid="tab-rounds">
            <Target className="h-4 w-4 mr-2" />
            Rounds
          </TabsTrigger>
          <TabsTrigger value="participants" data-testid="tab-participants">
            <Users className="h-4 w-4 mr-2" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <FFALeaderboard 
            leaderboard={bracketStructure.leaderboard} 
            tournamentFormat={formatType}
          />
        </TabsContent>

        {/* Rounds Tab */}
        <TabsContent value="rounds" className="space-y-4">
          <FFARoundsDisplay 
            bracketStructure={bracketStructure}
            selectedRound={selectedRound}
            onRoundSelect={setSelectedRound}
            onUpdateResults={onUpdateResults}
          />
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <FFAParticipantsDisplay 
            participants={bracketStructure.participants}
            tournamentFormat={formatType}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <FFAAnalytics 
            bracketStructure={bracketStructure}
            tournamentFormat={formatType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// FFA Leaderboard Component
interface FFALeaderboardProps {
  leaderboard: FFALeaderboardEntry[];
  tournamentFormat: string;
}

const FFALeaderboard: React.FC<FFALeaderboardProps> = ({ leaderboard, tournamentFormat }) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-muted-foreground font-bold">{position}</span>;
    }
  };

  const sortedLeaderboard = [...leaderboard].sort((a, b) => a.currentRanking - b.currentRanking);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Current Standings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedLeaderboard.map((entry, index) => (
            <div 
              key={entry.participantId}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-muted/30'
              }`}
              data-testid={`leaderboard-entry-${entry.participantId}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {getPositionIcon(entry.currentRanking)}
                </div>
                <div>
                  <div className="font-semibold">{entry.participantName}</div>
                  <div className="text-sm text-muted-foreground">
                    Status: <Badge variant={entry.status === 'active' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{entry.score}</div>
                <div className="text-sm text-muted-foreground">
                  {tournamentFormat === 'time-trials' ? 'Best Time' : 'Points'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// FFA Rounds Display Component
interface FFARoundsDisplayProps {
  bracketStructure: any;
  selectedRound: number;
  onRoundSelect: (round: number) => void;
  onUpdateResults?: (results: any) => void;
}

const FFARoundsDisplay: React.FC<FFARoundsDisplayProps> = ({
  bracketStructure,
  selectedRound,
  onRoundSelect,
  onUpdateResults
}) => {
  const getRounds = () => {
    switch (bracketStructure.format) {
      case 'multi-heat-racing':
        return (bracketStructure as MultiHeatRacingStructure).rounds;
      case 'battle-royale':
        return (bracketStructure as BattleRoyaleStructure).eliminationRounds;
      case 'point-accumulation':
        return (bracketStructure as PointAccumulationStructure).scoringRounds.map((round: FFAScoringRound, index: number) => ({
          roundNumber: index + 1,
          roundName: round.roundName,
          roundType: 'scoring',
          heats: []
        }));
      case 'survival-elimination':
        return (bracketStructure as SurvivalEliminationStructure).eliminationRounds;
      default:
        return [];
    }
  };

  const rounds = getRounds();

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {rounds.map((round: any) => (
          <Button
            key={round.roundNumber}
            variant={selectedRound === round.roundNumber ? 'default' : 'outline'}
            size="sm"
            onClick={() => onRoundSelect(round.roundNumber)}
            data-testid={`round-button-${round.roundNumber}`}
          >
            {round.roundName}
          </Button>
        ))}
      </div>

      {rounds.length > 0 && (
        <FFARoundDetail 
          round={rounds.find((r: any) => r.roundNumber === selectedRound)}
          bracketStructure={bracketStructure}
          onUpdateResults={onUpdateResults}
        />
      )}
    </div>
  );
};

// FFA Round Detail Component
interface FFARoundDetailProps {
  round?: any;
  bracketStructure: any;
  onUpdateResults?: (results: any) => void;
}

const FFARoundDetail: React.FC<FFARoundDetailProps> = ({ round, bracketStructure, onUpdateResults }) => {
  if (!round) return null;

  const formatType = bracketStructure.format;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          {round.roundName}
        </CardTitle>
        <CardDescription>
          {round.roundType && (
            <Badge variant="outline" className="mr-2">
              {round.roundType.replace(/-/g, ' ')}
            </Badge>
          )}
          Round {round.roundNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {formatType === 'multi-heat-racing' && round.heats && round.heats.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Heats</h4>
            {round.heats.map((heat: FFAHeat) => (
              <Card key={heat.heatNumber} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{heat.heatName}</CardTitle>
                    <Badge variant={heat.status === 'completed' ? 'default' : 'secondary'}>
                      {heat.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {heat.participants.length} participants
                  </div>
                  {heat.results && heat.results.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {heat.results.map((result: FFAHeatResult, index: number) => (
                        <div key={result.participantId} className="flex justify-between text-sm">
                          <span>#{result.ranking}</span>
                          <span>{result.result}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {formatType === 'battle-royale' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {round.eliminationCriteria?.count || 0}
                    </div>
                    <div className="text-sm text-red-700">Eliminated</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {round.advancementCriteria?.count || 0}
                    </div>
                    <div className="text-sm text-green-700">Advancing</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {round.advancementCriteria && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Advancement Rules</div>
            <div className="text-sm text-muted-foreground">
              {round.advancementCriteria.method}: {round.advancementCriteria.count} advance
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// FFA Participants Display Component
interface FFAParticipantsDisplayProps {
  participants: FFAParticipant[];
  tournamentFormat: string;
}

const FFAParticipantsDisplay: React.FC<FFAParticipantsDisplayProps> = ({ participants, tournamentFormat }) => {
  const statusCounts = participants.reduce((acc, p) => {
    acc[p.currentStatus] = (acc[p.currentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{count as React.ReactNode}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {status.replace(/-/g, ' ')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {participants.map((participant) => (
              <div 
                key={participant.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                data-testid={`participant-${participant.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(participant.currentStatus)}`} />
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    {participant.seedNumber && (
                      <div className="text-sm text-muted-foreground">Seed #{participant.seedNumber}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize">
                    {participant.currentStatus.replace(/-/g, ' ')}
                  </Badge>
                  {participant.finalRanking && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Rank: #{participant.finalRanking}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// FFA Analytics Component
interface FFAAnalyticsProps {
  bracketStructure: any;
  tournamentFormat: string;
}

const FFAAnalytics: React.FC<FFAAnalyticsProps> = ({ bracketStructure, tournamentFormat }) => {
  const getAnalyticsData = () => {
    const totalParticipants = bracketStructure.participants.length;
    const activeParticipants = bracketStructure.participants.filter((p: FFAParticipant) => p.currentStatus === 'active').length;
    const eliminatedParticipants = bracketStructure.participants.filter((p: FFAParticipant) => p.currentStatus === 'eliminated').length;

    return {
      totalParticipants,
      activeParticipants,
      eliminatedParticipants,
      completionRate: ((totalParticipants - activeParticipants) / totalParticipants) * 100,
      currentRound: bracketStructure.currentRound || 1,
      totalRounds: bracketStructure.totalRounds
    };
  };

  const analytics = getAnalyticsData();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Still Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.activeParticipants}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eliminated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.eliminatedParticipants}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tournament Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Current Round: {analytics.currentRound}</span>
              <span>Total Rounds: {analytics.totalRounds}</span>
            </div>
            <Progress value={(analytics.currentRound / analytics.totalRounds) * 100} />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">{analytics.activeParticipants}</div>
                <div className="text-sm text-muted-foreground">Participants Remaining</div>
              </div>
              <div>
                <div className="text-lg font-bold text-muted-foreground">
                  {analytics.totalRounds - analytics.currentRound + 1}
                </div>
                <div className="text-sm text-muted-foreground">Rounds Remaining</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Format-specific analytics */}
      {tournamentFormat === 'battle-royale' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Battle Royale Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((analytics.eliminatedParticipants / analytics.totalParticipants) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Elimination Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.activeParticipants}
                </div>
                <div className="text-sm text-muted-foreground">Survivors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'eliminated': return 'bg-red-500';
    case 'advanced': return 'bg-blue-500';
    case 'finished': return 'bg-gray-500';
    default: return 'bg-gray-300';
  }
};

export default FFATournamentDisplay;