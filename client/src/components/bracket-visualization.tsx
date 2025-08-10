import { useState } from "react";
import { type Tournament, type Match } from "@shared/schema";
import MatchUpdateModal from "@/components/match-update-modal";
import { Button } from "@/components/ui/button";
import { Download, FastForward } from "lucide-react";

interface BracketVisualizationProps {
  tournament: Tournament;
  matches: Match[];
}

export default function BracketVisualization({ tournament, matches }: BracketVisualizationProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalRounds = Math.ceil(Math.log2(tournament.teamSize));
  
  // Group matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const getRoundName = (round: number) => {
    const roundsFromEnd = totalRounds - round + 1;
    switch (roundsFromEnd) {
      case 1: return "Final";
      case 2: return "Semifinals";
      case 3: return "Quarterfinals";
      default: return `Round ${round}`;
    }
  };

  const getRoundSubtitle = (round: number) => {
    const roundsFromEnd = totalRounds - round + 1;
    switch (roundsFromEnd) {
      case 1: return "Championship";
      case 2: return "Final Four";
      case 3: return "Elite Eight";
      default: return `Round ${round} of ${totalRounds}`;
    }
  };

  const getMatchBorderColor = (match: Match) => {
    if (match.status === 'completed') return 'border-active';
    if (match.status === 'in-progress') return 'border-in-progress';
    return 'border-gray-300';
  };

  const getTeamBorderColor = (match: Match, team: 'team1' | 'team2') => {
    if (match.status === 'completed' && match.winner) {
      const teamName = team === 'team1' ? match.team1 : match.team2;
      return teamName === match.winner ? 'border-l-active' : 'border-l-gray-300';
    }
    if (match.status === 'in-progress') return 'border-l-in-progress';
    return 'border-l-gray-300';
  };

  const getTeamTextColor = (match: Match, team: 'team1' | 'team2') => {
    if (match.status === 'completed' && match.winner) {
      const teamName = team === 'team1' ? match.team1 : match.team2;
      return teamName === match.winner ? 'font-medium text-neutral' : 'text-gray-600';
    }
    if (match.status === 'in-progress') return 'font-medium text-neutral';
    return 'text-gray-600';
  };

  const getScoreColor = (match: Match, team: 'team1' | 'team2') => {
    if (match.status === 'completed' && match.winner) {
      const teamName = team === 'team1' ? match.team1 : match.team2;
      return teamName === match.winner ? 'font-bold text-active' : 'text-gray-600';
    }
    if (match.status === 'in-progress') return 'font-bold text-in-progress';
    return 'text-gray-400';
  };

  const getMatchStatusDisplay = (match: Match) => {
    if (match.status === 'completed' && match.winner) {
      return {
        text: `Winner: ${match.winner}`,
        color: 'text-active',
        icon: null
      };
    }
    if (match.status === 'in-progress') {
      return {
        text: 'In Progress',
        color: 'text-in-progress',
        icon: 'fas fa-clock'
      };
    }
    if (!match.team1 || !match.team2) {
      return {
        text: 'Awaiting Teams',
        color: 'text-gray-500',
        icon: null
      };
    }
    return {
      text: 'Upcoming',
      color: 'text-gray-500',
      icon: null
    };
  };

  const handleMatchClick = (match: Match) => {
    if (match.team1 && match.team2) {
      setSelectedMatch(match);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMatch(null);
  };

  const exportBracket = () => {
    // TODO: Implement bracket export functionality
    console.log('Exporting bracket...');
  };

  const advanceRound = () => {
    // TODO: Implement advance round functionality
    console.log('Advancing round...');
  };

  return (
    <>
      <div className="overflow-x-auto" data-testid="bracket-visualization">
        <div className="min-w-full">
          {/* Round Headers */}
          <div className="flex justify-between mb-6">
            {Array.from({ length: totalRounds }, (_, i) => {
              const round = i + 1;
              return (
                <div key={round} className="text-center" data-testid={`header-round-${round}`}>
                  <h3 className="font-semibold text-neutral mb-2">{getRoundName(round)}</h3>
                  <p className="text-xs text-gray-500">{getRoundSubtitle(round)}</p>
                </div>
              );
            })}
          </div>
          
          {/* Bracket Structure */}
          <div className="flex justify-between items-center space-x-8">
            {Array.from({ length: totalRounds }, (_, roundIndex) => {
              const round = roundIndex + 1;
              const roundMatches = matchesByRound[round] || [];
              const isNotLastRound = round < totalRounds;
              const isFinalRound = round === totalRounds;
              
              return (
                <div key={round} className="flex items-center">
                  {/* Round matches */}
                  <div className={`flex flex-col ${round === 1 ? 'space-y-8' : 'justify-center space-y-16'}`}>
                    {roundMatches.map((match) => {
                      const statusDisplay = getMatchStatusDisplay(match);
                      
                      return (
                        <div
                          key={match.id}
                          className={`${isFinalRound ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400' : 'bg-gray-50'} rounded-lg p-4 border-2 ${getMatchBorderColor(match)} min-w-48 ${match.team1 && match.team2 ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
                          onClick={() => handleMatchClick(match)}
                          data-testid={`match-${match.id}`}
                        >
                          <div className="space-y-2">
                            <div className={`flex justify-between items-center p-2 bg-white rounded border-l-4 ${getTeamBorderColor(match, 'team1')}`}>
                              <span className={getTeamTextColor(match, 'team1')} data-testid={`match-${match.id}-team1`}>
                                {match.team1 || 'TBD'}
                              </span>
                              <span className={getScoreColor(match, 'team1')} data-testid={`match-${match.id}-score1`}>
                                {match.status === 'upcoming' ? '-' : match.team1Score}
                              </span>
                            </div>
                            <div className={`flex justify-between items-center p-2 bg-white rounded border-l-4 ${getTeamBorderColor(match, 'team2')}`}>
                              <span className={getTeamTextColor(match, 'team2')} data-testid={`match-${match.id}-team2`}>
                                {match.team2 || 'TBD'}
                              </span>
                              <span className={getScoreColor(match, 'team2')} data-testid={`match-${match.id}-score2`}>
                                {match.status === 'upcoming' ? '-' : match.team2Score}
                              </span>
                            </div>
                          </div>
                          <div className={`mt-2 text-xs text-center font-medium ${statusDisplay.color}`} data-testid={`match-${match.id}-status`}>
                            {statusDisplay.icon && <i className={`${statusDisplay.icon} mr-1`}></i>}
                            {isFinalRound && match.status !== 'completed' ? (
                              <>
                                <i className="fas fa-crown mr-1"></i>
                                Championship
                              </>
                            ) : (
                              statusDisplay.text
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Bracket connectors */}
                  {isNotLastRound && (
                    <div className="flex flex-col justify-center space-y-16 mx-4">
                      {Array.from({ length: Math.ceil(roundMatches.length / 2) }, (_, i) => (
                        <div key={i} className="w-8 h-px bg-gray-300" data-testid={`connector-${round}-${i}`}></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Tournament Actions */}
      <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <i className="fas fa-info-circle mr-1"></i>
          Click on any match to update scores and advance winners
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={exportBracket}
            data-testid="button-export-bracket"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={advanceRound}
            className="bg-tournament-primary hover:bg-blue-700"
            data-testid="button-advance-round"
          >
            <FastForward className="w-4 h-4 mr-2" />
            Advance Round
          </Button>
        </div>
      </div>

      {selectedMatch && (
        <MatchUpdateModal
          match={selectedMatch}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
