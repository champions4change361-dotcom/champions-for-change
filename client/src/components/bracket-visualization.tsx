import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Users, Play } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MatchUpdateModal from './match-update-modal';
import { type Match } from '@shared/schema';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teamSize: number;
  tournamentType: string;
  status: string;
}

// Using shared Match type from schema for consistency

interface BracketVisualizationProps {
  tournament: Tournament;
  matches: Match[];
}

export default function BracketVisualization({ tournament, matches }: BracketVisualizationProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: liveMatches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", tournament.id],
  });

  const updateMatchMutation = useMutation({
    mutationFn: async (matchData: { matchId: string; team1Score: number; team2Score: number; winner: string; status: string }) => {
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

  const allMatches = liveMatches.length > 0 ? liveMatches : matches;

  // Group matches by round
  const matchesByRound = allMatches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const handleMatchClick = (match: Match) => {
    if (match.team1 && match.team2) {
      setSelectedMatch(match);
      setIsModalOpen(true);
    }
  };

  const getMatchBorderColor = (match: Match) => {
    if (match.status === 'completed') return 'border-green-500';
    if (match.status === 'in-progress') return 'border-yellow-500';
    return 'border-gray-300';
  };

  const getTeamStyle = (match: Match, team: 'team1' | 'team2') => {
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

  const getRoundName = (round: number) => {
    const totalRounds = Math.max(...allMatches.map(m => m.round));
    const roundsFromEnd = totalRounds - round + 1;
    
    switch (roundsFromEnd) {
      case 1: return "Championship";
      case 2: return "Semifinals";
      case 3: return "Quarterfinals";
      default: return `Round ${round}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (allMatches.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Matches Yet</h3>
          <p className="text-gray-600">
            Matches will appear here once the tournament bracket is generated
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="bracket-visualization">
      {/* Tournament Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {tournament.name} - {tournament.tournamentType} Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {tournament.teamSize} teams
            </div>
            <div className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              {tournament.sport}
            </div>
            <Badge variant={tournament.status === 'completed' ? 'default' : 'secondary'}>
              {tournament.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Bracket Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Bracket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Object.keys(matchesByRound).length}, 1fr)` }}>
            {Object.entries(matchesByRound)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([round, roundMatches]) => (
                <div key={round} className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{getRoundName(parseInt(round))}</h3>
                    <p className="text-sm text-gray-600">Round {round}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {roundMatches
                      .sort((a, b) => a.position - b.position)
                      .map((match) => (
                        <div
                          key={match.id}
                          className={`bg-white rounded-lg p-3 border-2 ${getMatchBorderColor(match)} ${
                            match.team1 && match.team2 ? 'cursor-pointer hover:shadow-md' : ''
                          } transition-all`}
                          onClick={() => handleMatchClick(match)}
                          data-testid={`match-${match.id}`}
                        >
                          <div className="space-y-2">
                            <div 
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              style={getTeamStyle(match, 'team1')}
                            >
                              <span className="flex-1">
                                {match.team1 || 'TBD'}
                              </span>
                              <span className="font-bold">
                                {match.status === 'upcoming' ? '-' : match.team1Score}
                              </span>
                            </div>
                            
                            <div 
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              style={getTeamStyle(match, 'team2')}
                            >
                              <span className="flex-1">
                                {match.team2 || 'TBD'}
                              </span>
                              <span className="font-bold">
                                {match.status === 'upcoming' ? '-' : match.team2Score}
                              </span>
                            </div>
                            
                            {match.status === 'completed' && match.winner && (
                              <div className="text-center text-sm text-green-600 font-medium">
                                Winner: {match.winner}
                              </div>
                            )}
                            
                            <div className="flex justify-center">
                              <Badge variant={
                                match.status === 'completed' ? 'default' : 
                                match.status === 'in-progress' ? 'secondary' : 'outline'
                              }>
                                {match.status === 'upcoming' ? 'Upcoming' :
                                 match.status === 'in-progress' ? 'In Progress' : 'Completed'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Match Update Modal */}
      {selectedMatch && (
        <MatchUpdateModal
          match={selectedMatch}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMatch(null);
          }}
          onUpdate={(matchData) => updateMatchMutation.mutate(matchData)}
          isLoading={updateMatchMutation.isPending}
        />
      )}
    </div>
  );
}