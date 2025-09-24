import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MatchUpdateModal from './match-update-modal';

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  team1?: string;
  team2?: string;
  team1Score: number;
  team2Score: number;
  winner?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  bracket: 'winners' | 'losers' | 'championship';
  createdAt: Date;
  updatedAt: Date;
}

interface Tournament {
  id: string;
  name: string;
  teamSize: number;
  tournamentType: string;
  status: string;
}

interface DoubleEliminationBracketProps {
  tournament: Tournament;
}

export default function DoubleEliminationBracket({ tournament }: DoubleEliminationBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery<Match[]>({
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Normalize match data: 'pending' -> 'upcoming', add default bracket
  const normalizedMatches = matches.map(match => ({
    ...match,
    status: match.status === 'pending' ? 'upcoming' : match.status,
    bracket: match.bracket || 'winners'
  }));

  // Generate complete bracket structure with placeholders for proper tree visualization
  const generateBracketStructure = (existingMatches: any[]) => {
    const teamCount = 8; // From tournament
    const allBracketMatches = [...existingMatches];

    // Add Round 2 placeholders (semifinals)
    if (!existingMatches.find(m => m.round === 2)) {
      for (let i = 1; i <= 2; i++) {
        allBracketMatches.push({
          id: `placeholder-r2-${i}`,
          tournamentId: existingMatches[0]?.tournamentId || '',
          round: 2,
          position: i,
          team1: 'TBD',
          team2: 'TBD',
          team1Score: 0,
          team2Score: 0,
          winner: null,
          status: 'upcoming',
          bracket: 'winners',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    // Add Round 3 placeholder (finals)
    if (!existingMatches.find(m => m.round === 3)) {
      allBracketMatches.push({
        id: 'placeholder-r3-1',
        tournamentId: existingMatches[0]?.tournamentId || '',
        round: 3,
        position: 1,
        team1: 'TBD',
        team2: 'TBD',
        team1Score: 0,
        team2Score: 0,
        winner: null,
        status: 'upcoming',
        bracket: 'winners',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return allBracketMatches;
  };

  const completeMatches = generateBracketStructure(normalizedMatches);

  // Separate matches by bracket
  const winnersMatches = completeMatches.filter(m => m.bracket === 'winners');
  const losersMatches = completeMatches.filter(m => m.bracket === 'losers');
  const championshipMatches = completeMatches.filter(m => m.bracket === 'championship');

  // Group by rounds
  const winnersRounds = winnersMatches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const losersRounds = losersMatches.reduce((acc, match) => {
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

  const getRoundName = (round: number, bracket: string) => {
    if (bracket === 'winners') {
      const totalWinnersRounds = Math.max(...winnersMatches.map(m => m.round));
      const roundsFromEnd = totalWinnersRounds - round + 1;
      switch (roundsFromEnd) {
        case 1: return "Winners Final";
        case 2: return "Winners Semifinals";
        case 3: return "Winners Quarterfinals";
        default: return `Winners Round ${round}`;
      }
    } else if (bracket === 'losers') {
      return `Losers Round ${round}`;
    }
    return `Round ${round}`;
  };

  return (
    <div className="space-y-8" data-testid="double-elimination-bracket">
      {/* Winners Bracket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Winners Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Object.keys(winnersRounds).length}, 1fr)` }}>
            {Object.entries(winnersRounds)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([round, roundMatches]) => (
                <div key={round} className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{getRoundName(parseInt(round), 'winners')}</h3>
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
                          data-testid={`winners-match-${match.id}`}
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

      {/* Losers Bracket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Losers Bracket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Object.keys(losersRounds).length}, 1fr)` }}>
            {Object.entries(losersRounds)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([round, roundMatches]) => (
                <div key={round} className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{getRoundName(parseInt(round), 'losers')}</h3>
                    <p className="text-sm text-gray-600">Round {round}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {roundMatches
                      .sort((a, b) => a.position - b.position)
                      .map((match) => (
                        <div
                          key={match.id}
                          className={`bg-orange-50 rounded-lg p-3 border-2 ${getMatchBorderColor(match)} ${
                            match.team1 && match.team2 ? 'cursor-pointer hover:shadow-md' : ''
                          } transition-all`}
                          onClick={() => handleMatchClick(match)}
                          data-testid={`losers-match-${match.id}`}
                        >
                          <div className="space-y-2">
                            <div 
                              className="flex justify-between items-center p-2 bg-white rounded"
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
                              className="flex justify-between items-center p-2 bg-white rounded"
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

      {/* Championship Match */}
      {championshipMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" />
              Championship
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="w-80">
                {championshipMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border-2 border-yellow-400 ${
                      match.team1 && match.team2 ? 'cursor-pointer hover:shadow-lg' : ''
                    } transition-all`}
                    onClick={() => handleMatchClick(match)}
                    data-testid={`championship-match-${match.id}`}
                  >
                    <div className="space-y-3">
                      <div className="text-center font-bold text-lg text-yellow-800 mb-3">
                        Championship Final
                      </div>
                      
                      <div 
                        className="flex justify-between items-center p-3 bg-white rounded border-l-4"
                        style={getTeamStyle(match, 'team1')}
                      >
                        <span className="flex-1 font-medium">
                          {match.team1 || 'Winners Bracket Champion'}
                        </span>
                        <span className="font-bold text-lg">
                          {match.status === 'upcoming' ? '-' : match.team1Score}
                        </span>
                      </div>
                      
                      <div 
                        className="flex justify-between items-center p-3 bg-white rounded border-l-4"
                        style={getTeamStyle(match, 'team2')}
                      >
                        <span className="flex-1 font-medium">
                          {match.team2 || 'Losers Bracket Champion'}
                        </span>
                        <span className="font-bold text-lg">
                          {match.status === 'upcoming' ? '-' : match.team2Score}
                        </span>
                      </div>
                      
                      {match.status === 'completed' && match.winner && (
                        <div className="text-center p-2 bg-yellow-200 rounded font-bold text-yellow-800">
                          🏆 Tournament Champion: {match.winner} 🏆
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
          </CardContent>
        </Card>
      )}

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