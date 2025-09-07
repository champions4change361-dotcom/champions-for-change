import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
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
  createdAt: Date;
  updatedAt: Date;
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teamSize: number;
  tournamentType: string;
  status: string;
}

interface ChallongeStyleBracketProps {
  tournament: Tournament;
  matches: Match[];
}

export default function ChallongeStyleBracket({ tournament, matches }: ChallongeStyleBracketProps) {
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

  const getMatchStatus = (match: Match) => {
    if (match.status === 'completed') return 'completed';
    if (match.status === 'in-progress') return 'in-progress';
    return 'upcoming';
  };

  const getTeamStyle = (match: Match, team: 'team1' | 'team2') => {
    if (match.status === 'completed' && match.winner) {
      const teamName = team === 'team1' ? match.team1 : match.team2;
      const isWinner = teamName === match.winner;
      return {
        backgroundColor: isWinner ? '#f0f9ff' : '#f9fafb',
        fontWeight: isWinner ? '600' : '400',
        color: isWinner ? '#1e40af' : '#374151'
      };
    }
    return {
      backgroundColor: '#f9fafb',
      fontWeight: '400',
      color: '#374151'
    };
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
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">No Matches Yet</h3>
        <p className="text-gray-600">
          Matches will appear here once the tournament bracket is generated
        </p>
      </div>
    );
  }

  const totalRounds = Object.keys(matchesByRound).length;
  const maxMatchesInRound = Math.max(...Object.values(matchesByRound).map(round => round.length));

  return (
    <div className="w-full" data-testid="challonge-bracket">
      {/* Tournament Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{tournament.name}</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span>{tournament.sport}</span>
          <span>•</span>
          <span>{tournament.teamSize} teams</span>
          <span>•</span>
          <Badge variant={tournament.status === 'completed' ? 'default' : 'secondary'}>
            {tournament.status}
          </Badge>
        </div>
      </div>

      {/* Bracket Container */}
      <div className="relative overflow-x-auto">
        <div 
          className="grid gap-8 min-w-max p-4"
          style={{ 
            gridTemplateColumns: `repeat(${totalRounds}, minmax(200px, 1fr))`,
            minHeight: `${maxMatchesInRound * 120 + 100}px`
          }}
        >
          {/* SVG for Connection Lines */}
          <svg 
            className="absolute inset-0 pointer-events-none z-0" 
            style={{ 
              width: '100%', 
              height: '100%',
              minWidth: `${totalRounds * 240}px`,
              minHeight: `${maxMatchesInRound * 120 + 100}px`
            }}
          >
            {Object.entries(matchesByRound)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .slice(0, -1) // Don't draw lines from the last round
              .map(([round, roundMatches], roundIndex) => {
                const nextRoundMatches = matchesByRound[parseInt(round) + 1] || [];
                
                return roundMatches.map((match, matchIndex) => {
                  // Calculate connection to next round
                  const nextMatchIndex = Math.floor(matchIndex / 2);
                  const nextMatch = nextRoundMatches[nextMatchIndex];
                  
                  if (!nextMatch) return null;
                  
                  const startX = (roundIndex + 1) * 240 - 40;
                  const startY = 70 + matchIndex * 120 + 40;
                  const endX = (roundIndex + 1) * 240 + 40;
                  const endY = 70 + nextMatchIndex * 120 + 40;
                  const midX = startX + 40;
                  
                  return (
                    <g key={`${match.id}-connection`}>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={midX}
                        y2={startY}
                        stroke="#d1d5db"
                        strokeWidth="2"
                      />
                      <line
                        x1={midX}
                        y1={startY}
                        x2={midX}
                        y2={endY}
                        stroke="#d1d5db"
                        strokeWidth="2"
                      />
                      <line
                        x1={midX}
                        y1={endY}
                        x2={endX}
                        y2={endY}
                        stroke="#d1d5db"
                        strokeWidth="2"
                      />
                    </g>
                  );
                });
              })}
          </svg>

          {/* Matches */}
          {Object.entries(matchesByRound)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([round, roundMatches], roundIndex) => (
              <div key={round} className="relative z-10">
                {/* Round Header */}
                <div className="text-center mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {getRoundName(parseInt(round))}
                  </h3>
                  <p className="text-sm text-gray-500">Round {round}</p>
                </div>

                {/* Matches in Round */}
                <div className="space-y-6">
                  {roundMatches
                    .sort((a, b) => a.position - b.position)
                    .map((match, matchIndex) => (
                      <div
                        key={match.id}
                        className={`
                          bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden
                          ${match.team1 && match.team2 ? 'cursor-pointer hover:shadow-md' : ''}
                          ${getMatchStatus(match) === 'completed' ? 'border-green-400' : ''}
                          ${getMatchStatus(match) === 'in-progress' ? 'border-yellow-400' : ''}
                          transition-all duration-200 relative z-10
                        `}
                        onClick={() => handleMatchClick(match)}
                        data-testid={`match-${match.id}`}
                        style={{ minWidth: '200px', minHeight: '80px' }}
                      >
                        {/* Team 1 */}
                        <div 
                          className="flex justify-between items-center px-3 py-2 border-b border-gray-100"
                          style={getTeamStyle(match, 'team1')}
                        >
                          <span className="truncate text-sm">
                            {match.team1 || 'TBD'}
                          </span>
                          <span className="font-semibold text-lg ml-2">
                            {match.status === 'upcoming' ? '' : match.team1Score}
                          </span>
                        </div>

                        {/* Team 2 */}
                        <div 
                          className="flex justify-between items-center px-3 py-2"
                          style={getTeamStyle(match, 'team2')}
                        >
                          <span className="truncate text-sm">
                            {match.team2 || 'TBD'}
                          </span>
                          <span className="font-semibold text-lg ml-2">
                            {match.status === 'upcoming' ? '' : match.team2Score}
                          </span>
                        </div>

                        {/* Match Status Indicator */}
                        {getMatchStatus(match) !== 'upcoming' && (
                          <div className="absolute top-1 right-1">
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                getMatchStatus(match) === 'completed' ? 'bg-green-400' :
                                getMatchStatus(match) === 'in-progress' ? 'bg-yellow-400' : 'bg-gray-300'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>

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