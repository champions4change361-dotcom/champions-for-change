import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Clock,
  Target,
  Crown,
  AlertCircle
} from 'lucide-react';
import BracketVisualization from './bracket-visualization';
import DoubleEliminationBracket from './double-elimination-bracket';
import PoolPlayBracket from './pool-play-bracket';
import SportSpecificLeaderboard from './sport-specific-leaderboard';
import LeaderboardView from './leaderboard-view';
import MultiStageTournament from './multi-stage-tournament';
import EventContainerManager from './event-container-manager';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teamSize: number;
  tournamentType: 'single' | 'double' | 'pool-play' | 'round-robin' | 'swiss-system';
  competitionFormat: 'bracket' | 'leaderboard' | 'series' | 'bracket-to-series' | 'multi-stage';
  status: 'upcoming' | 'stage-1' | 'stage-2' | 'stage-3' | 'completed';
  currentStage?: number;
  totalStages?: number;
  teams: { teamName: string }[];
  ageGroup?: string;
  genderDivision?: string;
  createdAt: string;
  updatedAt: string;
}

interface TournamentManagerProps {
  tournamentId: string;
}

// Helper function to generate CSV export data
const generateTournamentCsv = (tournament: Tournament) => {
  const headers = ['Tournament Name', 'Sport', 'Type', 'Format', 'Status', 'Teams', 'Created', 'Updated'];
  const row = [
    tournament.name,
    tournament.sport,
    tournament.tournamentType,
    tournament.competitionFormat,
    tournament.status,
    tournament.teams?.length || tournament.teamSize,
    new Date(tournament.createdAt).toLocaleDateString(),
    new Date(tournament.updatedAt).toLocaleDateString()
  ];
  
  return [headers.join(','), row.join(',')].join('\n');
};

// Helper function to get sport-specific events
const getSportSpecificEvents = (sport: string) => {
  const sportLower = sport.toLowerCase();
  
  if (sportLower.includes('basketball')) {
    return [
      {
        eventName: 'Basketball Game',
        eventType: 'Team Competition' as const,
        scoringUnit: 'points',
        description: 'Full basketball game competition',
        participantLimit: 10,
        participants: [],
        resultsRecorder: 'Referee',
        status: 'registration' as const,
        registrationUrl: `/tournaments/${sport}/register?event=basketball-game`
      },
      {
        eventName: 'Free Throw Contest',
        eventType: 'Other' as const,
        scoringUnit: 'percentage',
        description: 'Free throw shooting accuracy contest',
        participantLimit: 8,
        participants: [],
        resultsRecorder: 'Coach',
        status: 'registration' as const,
        registrationUrl: `/tournaments/${sport}/register?event=free-throw`
      },
      {
        eventName: '3-Point Contest',
        eventType: 'Other' as const,
        scoringUnit: 'made shots',
        description: '3-point shooting contest',
        participantLimit: 8,
        participants: [],
        resultsRecorder: 'Coach',
        status: 'registration' as const,
        registrationUrl: `/tournaments/${sport}/register?event=3-point`
      }
    ];
  }
  
  // Add more sports as needed
  if (sportLower.includes('soccer')) {
    return [
      {
        eventName: 'Soccer Match',
        eventType: 'Team Competition' as const,
        scoringUnit: 'goals',
        description: 'Full soccer match',
        participantLimit: 22,
        participants: [],
        resultsRecorder: 'Referee',
        status: 'registration' as const,
        registrationUrl: `/tournaments/${sport}/register?event=soccer-match`
      }
    ];
  }
  
  // Default empty array instead of mock track events
  return [];
};

export default function TournamentManager({ tournamentId }: TournamentManagerProps) {
  const [activeTab, setActiveTab] = useState('events');

  const { data: tournament, isLoading, error } = useQuery<Tournament>({
    queryKey: ["/api/tournaments", tournamentId],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Tournament Not Found</h3>
            <p className="text-gray-600">
              The tournament you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'stage-1':
      case 'stage-2': 
      case 'stage-3': return <Play className="h-4 w-4" />;
      case 'completed': return <Trophy className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-gray-500';
      case 'stage-1':
      case 'stage-2':
      case 'stage-3': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'bracket': return <Trophy className="h-4 w-4" />;
      case 'leaderboard': return <Target className="h-4 w-4" />;
      case 'series': return <BarChart3 className="h-4 w-4" />;
      case 'multi-stage': return <Crown className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const renderTournamentContent = () => {
    // Multi-stage tournaments
    if (tournament.competitionFormat === 'multi-stage') {
      return <MultiStageTournament tournament={tournament} />;
    }

    // Double elimination tournaments
    if (tournament.tournamentType === 'double') {
      return <DoubleEliminationBracket tournament={tournament} />;
    }

    // Pool play tournaments
    if (tournament.tournamentType === 'pool-play') {
      return <PoolPlayBracket tournament={tournament} />;
    }

    // Leaderboard formats (individual sports)
    if (tournament.competitionFormat === 'leaderboard') {
      // Use sport-specific leaderboard for track, swimming, golf, etc.
      const individualSports = ['track', 'swimming', 'golf', 'wrestling', 'powerlifting', 'gymnastics'];
      if (individualSports.includes(tournament.sport)) {
        return <SportSpecificLeaderboard tournament={tournament} />;
      } else {
        return <LeaderboardView tournament={tournament} />;
      }
    }

    // Default bracket visualization for single elimination, round robin, swiss
    return <BracketVisualization tournament={tournament} matches={[]} />;
  };

  const getTabsForTournament = () => {
    const baseTabs = [
      { value: 'events', label: 'Event Management', icon: <Target className="h-4 w-4" /> },
      { value: 'bracket', label: 'Tournament View', icon: getFormatIcon(tournament.competitionFormat) }
    ];

    // Add standings tab for appropriate formats
    if (['pool-play', 'round-robin', 'swiss-system'].includes(tournament.tournamentType)) {
      baseTabs.push({ value: 'standings', label: 'Standings', icon: <BarChart3 className="h-4 w-4" /> });
    }

    // Add analytics tab
    baseTabs.push({ value: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> });

    // Add settings tab
    baseTabs.push({ value: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> });

    return baseTabs;
  };

  return (
    <div className="space-y-6" data-testid="tournament-manager">
      {/* Tournament Header - Mobile Optimized */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            {/* Title and basic info */}
            <div>
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2 sm:gap-3 mb-2">
                {getFormatIcon(tournament.competitionFormat)}
                <span className="truncate">{tournament.name}</span>
              </CardTitle>
              
              {/* Mobile-first details layout */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{tournament.teams?.length || tournament.teamSize} {tournament.competitionFormat === 'leaderboard' ? 'participants' : 'teams'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">{tournament.sport}</span>
                </div>
                {tournament.ageGroup && (
                  <Badge variant="outline" className="text-xs">{tournament.ageGroup}</Badge>
                )}
                {tournament.genderDivision && (
                  <Badge variant="outline" className="text-xs">{tournament.genderDivision}</Badge>
                )}
              </div>
            </div>
            
            {/* Status badges - separate row on mobile */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getStatusColor(tournament.status)}>
                {getStatusIcon(tournament.status)}
                <span className="ml-1 capitalize text-xs">
                  {tournament.status === 'stage-1' ? 'Stage 1' :
                   tournament.status === 'stage-2' ? 'Stage 2' :
                   tournament.status === 'stage-3' ? 'Stage 3' :
                   tournament.status}
                </span>
              </Badge>
              
              <Badge variant="outline" className="text-xs">
                {tournament.tournamentType === 'single' ? 'Single Elim.' :
                 tournament.tournamentType === 'double' ? 'Double Elim.' :
                 tournament.tournamentType === 'pool-play' ? 'Pool Play' :
                 tournament.tournamentType === 'round-robin' ? 'Round Robin' :
                 tournament.tournamentType === 'swiss-system' ? 'Swiss' :
                 tournament.tournamentType}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tournament Content - Mobile-friendly tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full gap-1" style={{ gridTemplateColumns: `repeat(${getTabsForTournament().length}, 1fr)` }}>
          {getTabsForTournament().map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="flex items-center gap-1 p-2 text-xs sm:text-sm sm:gap-2 sm:p-3"
            >
              {tab.icon}
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
              <span className="xs:hidden sm:hidden">
                {tab.value === 'events' ? 'Events' :
                 tab.value === 'bracket' ? 'View' : 
                 tab.value === 'standings' ? 'Stand.' :
                 tab.value === 'analytics' ? 'Stats' :
                 tab.value === 'settings' ? 'Set.' : tab.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <EventContainerManager 
            tournamentId={tournamentId} 
            events={getSportSpecificEvents(tournament.sport || 'Basketball (Boys)')}
          />
        </TabsContent>

        <TabsContent value="bracket" className="mt-6">
          {renderTournamentContent()}
        </TabsContent>

        <TabsContent value="standings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Standings will be calculated based on completed matches
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {tournament.teams?.length || tournament.teamSize}
                  </div>
                  <div className="text-sm text-gray-600">Total Participants</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Completed Matches</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {tournament.currentStage || 1}
                    {tournament.totalStages ? `/${tournament.totalStages}` : ''}
                  </div>
                  <div className="text-sm text-gray-600">Current Stage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Tournament Type</h4>
                    <p className="text-sm text-gray-600">
                      {tournament.tournamentType === 'single' ? 'Single Elimination' :
                       tournament.tournamentType === 'double' ? 'Double Elimination' :
                       tournament.tournamentType === 'pool-play' ? 'Pool Play to Bracket' :
                       tournament.tournamentType === 'round-robin' ? 'Round Robin' :
                       tournament.tournamentType === 'swiss-system' ? 'Swiss System' :
                       tournament.tournamentType}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Competition Format</h4>
                    <p className="text-sm text-gray-600 capitalize">
                      {tournament.competitionFormat}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Created</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(tournament.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Last Updated</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(tournament.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="mr-2"
                    onClick={() => window.location.href = `/tournaments/${tournamentId}/edit`}
                    data-testid="button-edit-tournament"
                  >
                    Edit Tournament
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      // Create and download CSV export
                      const csvData = generateTournamentCsv(tournament);
                      const blob = new Blob([csvData], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${tournament.name}-results.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                    data-testid="button-export-results"
                  >
                    Export Results
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}