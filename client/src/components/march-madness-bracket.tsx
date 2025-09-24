import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Crown, Star, Play, Clock, Users } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MatchUpdateModal from './match-update-modal';

interface MarchMadnessMatch {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  bracket: 'winners' | 'losers' | 'championship';
  region: 'South' | 'West' | 'East' | 'Midwest' | 'Final Four';
  seed1: number;
  seed2: number;
  team1?: string;
  team2?: string;
  team1Score: number;
  team2Score: number;
  winner?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  roundName: string;
  isFirstFour?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teamSize: number;
  tournamentType: string;
  status: string;
}

interface MarchMadnessBracketProps {
  tournament: Tournament;
}

interface RegionalBracket {
  region: 'South' | 'West' | 'East' | 'Midwest';
  matches: MarchMadnessMatch[];
  color: string;
}

export default function MarchMadnessBracket({ tournament }: MarchMadnessBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<MarchMadnessMatch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery<MarchMadnessMatch[]>({
    queryKey: ["/api/matches", tournament.id],
  });

  const updateMatchMutation = useMutation({
    mutationFn: async (matchData: { 
      matchId: string; 
      team1Score: number; 
      team2Score: number; 
      winner: string; 
      status: string 
    }) => {
      const response = await apiRequest(`/api/matches/${matchData.matchId}`, "PATCH", matchData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", tournament.id] });
      toast({
        title: "Match Updated",
        description: "Score and result have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not save match result. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Organize matches by bracket type and region
  const organizedMatches = useMemo(() => {
    const firstFourMatches = matches.filter(m => m.isFirstFour);
    const regionalMatches = matches.filter(m => 
      !m.isFirstFour && 
      m.region !== 'Final Four' && 
      ['South', 'West', 'East', 'Midwest'].includes(m.region)
    );
    const finalFourMatches = matches.filter(m => 
      m.region === 'Final Four' && 
      m.roundName === 'Final Four'
    );
    const championshipMatch = matches.find(m => 
      m.region === 'Final Four' && 
      m.roundName === 'Championship'
    );

    // Group regional matches by region
    const regionalBrackets: RegionalBracket[] = [
      { 
        region: 'South', 
        matches: regionalMatches.filter(m => m.region === 'South'),
        color: 'bg-red-100 border-red-300'
      },
      { 
        region: 'West', 
        matches: regionalMatches.filter(m => m.region === 'West'),
        color: 'bg-blue-100 border-blue-300'
      },
      { 
        region: 'East', 
        matches: regionalMatches.filter(m => m.region === 'East'),
        color: 'bg-green-100 border-green-300'
      },
      { 
        region: 'Midwest', 
        matches: regionalMatches.filter(m => m.region === 'Midwest'),
        color: 'bg-yellow-100 border-yellow-300'
      }
    ];

    return {
      firstFourMatches,
      regionalBrackets,
      finalFourMatches,
      championshipMatch
    };
  }, [matches]);

  const handleMatchClick = (match: MarchMadnessMatch) => {
    if (match.team1 && match.team2) {
      setSelectedMatch(match);
      setIsModalOpen(true);
    }
  };

  const getMatchBorderColor = (match: MarchMadnessMatch) => {
    if (match.status === 'completed') return 'border-green-500';
    if (match.status === 'in-progress') return 'border-yellow-500';
    return 'border-gray-300';
  };

  const getTeamStyle = (match: MarchMadnessMatch, team: 'team1' | 'team2') => {
    if (match.status === 'completed' && match.winner) {
      const teamName = team === 'team1' ? match.team1 : match.team2;
      const isWinner = teamName === match.winner;
      return {
        fontWeight: isWinner ? 'bold' : 'normal',
        color: isWinner ? '#16a34a' : '#6b7280',
        borderLeft: `4px solid ${isWinner ? '#16a34a' : '#d1d5db'}`
      };
    }
    return { borderLeft: '4px solid #d1d5db' };
  };

  const getSeedDisplay = (match: MarchMadnessMatch, team: 'team1' | 'team2') => {
    const seed = team === 'team1' ? match.seed1 : match.seed2;
    return seed > 0 ? `(${seed})` : '';
  };

  const getRegionIcon = (region: string) => {
    const icons = {
      'South': '🔴',
      'West': '🔵', 
      'East': '🟢',
      'Midwest': '🟡'
    };
    return icons[region as keyof typeof icons] || '⚪';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const MatchCard = ({ match, showRegion = false }: { match: MarchMadnessMatch, showRegion?: boolean }) => (
    <Card 
      key={match.id}
      className={`cursor-pointer hover:shadow-md transition-shadow mb-2 ${getMatchBorderColor(match)}`}
      onClick={() => handleMatchClick(match)}
      data-testid={`match-${match.id}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline" className="text-xs">
            {match.roundName} - Game {match.position}
          </Badge>
          {showRegion && match.region !== 'Final Four' && (
            <Badge variant="secondary" className="text-xs">
              {getRegionIcon(match.region)} {match.region}
            </Badge>
          )}
          <Badge 
            variant={match.status === 'completed' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {match.status === 'upcoming' && <Clock className="w-3 h-3 mr-1" />}
            {match.status === 'in-progress' && <Play className="w-3 h-3 mr-1" />}
            {match.status === 'completed' && <Trophy className="w-3 h-3 mr-1" />}
            {match.status.replace('-', ' ')}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div 
            className="flex justify-between items-center p-2 rounded"
            style={getTeamStyle(match, 'team1')}
            data-testid={`team1-${match.id}`}
          >
            <span className="font-medium">
              {getSeedDisplay(match, 'team1')} {match.team1 || 'TBD'}
            </span>
            <span className="font-bold text-lg">{match.team1Score}</span>
          </div>
          
          <div 
            className="flex justify-between items-center p-2 rounded"
            style={getTeamStyle(match, 'team2')}
            data-testid={`team2-${match.id}`}
          >
            <span className="font-medium">
              {getSeedDisplay(match, 'team2')} {match.team2 || 'TBD'}
            </span>
            <span className="font-bold text-lg">{match.team2Score}</span>
          </div>
        </div>
        
        {match.status === 'completed' && match.winner && (
          <div className="mt-2 text-center">
            <Badge variant="default" className="bg-green-600">
              <Trophy className="w-3 h-3 mr-1" />
              Winner: {match.winner}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const RegionalBracketView = ({ bracket }: { bracket: RegionalBracket }) => {
    const matchesByRound = bracket.matches.reduce((acc, match) => {
      if (!acc[match.round]) acc[match.round] = [];
      acc[match.round].push(match);
      return acc;
    }, {} as Record<number, MarchMadnessMatch[]>);

    const rounds = Object.keys(matchesByRound).map(Number).sort();

    return (
      <Card className={`${bracket.color} h-full`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{getRegionIcon(bracket.region)}</span>
            {bracket.region} Region
            <Badge variant="outline">{bracket.matches.length} matches</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {rounds.map(round => (
              <div key={round} className="space-y-2">
                <h4 className="font-semibold text-center text-sm">
                  {round === 1 ? 'Round of 64' : 
                   round === 2 ? 'Round of 32' : 
                   round === 3 ? 'Sweet 16' : 
                   round === 4 ? 'Elite 8' : `Round ${round}`}
                </h4>
                {matchesByRound[round]
                  .sort((a, b) => a.position - b.position)
                  .map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="march-madness-bracket">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            March Madness Tournament: {tournament.name}
            <Badge variant="outline" className="ml-auto">
              <Users className="w-4 h-4 mr-1" />
              68 Teams
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="first-four">First Four</TabsTrigger>
          <TabsTrigger value="south">🔴 South</TabsTrigger>
          <TabsTrigger value="west">🔵 West</TabsTrigger>
          <TabsTrigger value="east">🟢 East</TabsTrigger>
          <TabsTrigger value="midwest">🟡 Midwest</TabsTrigger>
          <TabsTrigger value="final-four">Final Four</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {organizedMatches.regionalBrackets.map(bracket => (
              <Card key={bracket.region} className={bracket.color}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-xl">{getRegionIcon(bracket.region)}</span>
                    {bracket.region}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div>Matches: {bracket.matches.length}</div>
                    <div>Completed: {bracket.matches.filter(m => m.status === 'completed').length}</div>
                    {bracket.matches.find(m => m.round === 4 && m.status === 'completed') && (
                      <Badge variant="default" className="w-full justify-center">
                        <Trophy className="w-3 h-3 mr-1" />
                        Champion: {bracket.matches.find(m => m.round === 4 && m.status === 'completed')?.winner}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Final Four Preview */}
          {organizedMatches.finalFourMatches.length > 0 && (
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Final Four
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organizedMatches.finalFourMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Championship Preview */}
          {organizedMatches.championshipMatch && (
            <Card className="bg-gold-50 border-yellow-400">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  Championship Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MatchCard match={organizedMatches.championshipMatch} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="first-four">
          <Card>
            <CardHeader>
              <CardTitle>First Four Games</CardTitle>
              <p className="text-sm text-gray-600">
                Play-in games to determine the final spots in the main bracket
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {organizedMatches.firstFourMatches.map(match => (
                  <MatchCard key={match.id} match={match} showRegion />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {organizedMatches.regionalBrackets.map(bracket => (
          <TabsContent key={bracket.region.toLowerCase()} value={bracket.region.toLowerCase()}>
            <RegionalBracketView bracket={bracket} />
          </TabsContent>
        ))}

        <TabsContent value="final-four">
          <div className="space-y-6">
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  Final Four
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {organizedMatches.finalFourMatches.map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {organizedMatches.championshipMatch && (
              <Card className="bg-yellow-50 border-yellow-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-600" />
                    Championship Game
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <MatchCard match={organizedMatches.championshipMatch} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {selectedMatch && (
        <MatchUpdateModal
          match={selectedMatch}
          isOpen={isModalOpen}
          isLoading={updateMatchMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMatch(null);
          }}
          onUpdate={(matchData) => {
            updateMatchMutation.mutate({
              ...matchData,
              matchId: selectedMatch.id
            });
          }}
        />
      )}
    </div>
  );
}