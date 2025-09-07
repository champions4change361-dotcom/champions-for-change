import { useParams, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import ChallongeStyleBracket from "@/components/ChallongeStyleBracket";
import { type Tournament, type Match } from "@shared/schema";

interface TournamentData {
  tournament: Tournament;
  matches: Match[];
}

export default function EmbedTournament() {
  const { id } = useParams<{ id: string }>();
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  const theme = params.get('theme') || 'light';
  const size = params.get('size') || 'medium';

  const { data, isLoading } = useQuery<TournamentData>({
    queryKey: ["/api/tournaments", id],
    refetchInterval: 10000, // Refresh every 10 seconds for live updates
  });

  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'tournament':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900';
      default:
        return 'bg-white text-gray-900';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeClasses()}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-4"></div>
          <p>Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.tournament) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getThemeClasses()}`}>
        <div className="text-center">
          <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="font-semibold text-lg mb-2">Tournament Not Found</h3>
          <p className="opacity-75">This tournament may not exist or is not public</p>
        </div>
      </div>
    );
  }

  const { tournament, matches } = data;

  return (
    <div className={`min-h-screen p-4 ${getThemeClasses()} ${getSizeClasses()}`}>
      {/* Embed Header */}
      <div className="mb-4 text-center border-b pb-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        <h1 className="font-bold text-lg truncate">{tournament.name}</h1>
        <div className="flex items-center justify-center gap-2 text-xs opacity-75 mt-1">
          <span>{tournament.sport}</span>
          <span>•</span>
          <span>{tournament.teamSize} Teams</span>
          <span>•</span>
          <span className="capitalize">{tournament.status}</span>
          {/* Live indicator */}
          <div className="flex items-center gap-1 ml-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Tournament Bracket */}
      <div className="overflow-hidden">
        {tournament.sport?.includes("Track & Field") ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Track & Field events display not supported in embed view</p>
            <p className="text-xs opacity-75 mt-1">View full tournament for complete results</p>
          </div>
        ) : tournament.competitionFormat === "multi-stage" ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Multi-stage tournament display optimized for full view</p>
            <p className="text-xs opacity-75 mt-1">Visit tournament page for complete experience</p>
          </div>
        ) : tournament.competitionFormat === "leaderboard" ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Leaderboard view available on full tournament page</p>
            <p className="text-xs opacity-75 mt-1">Click to view complete rankings</p>
          </div>
        ) : (
          <div style={{ transform: size === 'small' ? 'scale(0.8)' : size === 'large' ? 'scale(1.1)' : 'scale(1)', transformOrigin: 'top center' }}>
            <ChallongeStyleBracket 
              tournament={{...tournament, sport: tournament.sport || 'Unknown'}} 
              matches={matches.map(match => ({
                ...match, 
                team1: match.team1 || undefined,
                team2: match.team2 || undefined,
                team1Score: match.team1Score || 0,
                team2Score: match.team2Score || 0
              }))} 
            />
          </div>
        )}
      </div>

      {/* Embed Footer */}
      <div className="mt-4 pt-4 text-center border-t" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
        <div className="flex items-center justify-center gap-2 text-xs opacity-50">
          <span>Powered by</span>
          <strong>Trantor Tournaments</strong>
          <span>•</span>
          <a 
            href={`${window.location.origin}/tournaments/${tournament.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-75 underline"
          >
            View Full Tournament
          </a>
        </div>
      </div>
    </div>
  );
}