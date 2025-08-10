import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw } from "lucide-react";
import BracketVisualization from "@/components/bracket-visualization";
import LeaderboardView from "@/components/leaderboard-view";
import MultiStageTournament from "@/components/multi-stage-tournament";
import { type Tournament, type Match } from "@shared/schema";

interface TournamentData {
  tournament: Tournament;
  matches: Match[];
}

export default function Tournament() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, refetch } = useQuery<TournamentData>({
    queryKey: ["/api/tournaments", id],
  });

  if (isLoading) {
    return (
      <div className="font-inter bg-gray-50 min-h-screen" data-testid="tournament-loading">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <i className="fas fa-trophy text-tournament-primary text-2xl"></i>
                <h1 className="text-xl font-bold text-neutral">Tournament Manager</h1>
              </div>
              <Link href="/" data-testid="link-back-home">
                <a className="flex items-center text-neutral hover:text-tournament-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </a>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tournament-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading tournament...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="font-inter bg-gray-50 min-h-screen" data-testid="tournament-not-found">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <i className="fas fa-trophy text-tournament-primary text-2xl"></i>
                <h1 className="text-xl font-bold text-neutral">Tournament Manager</h1>
              </div>
              <Link href="/" data-testid="link-back-home">
                <a className="flex items-center text-neutral hover:text-tournament-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </a>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
              <p className="text-gray-600 mb-4">The tournament you're looking for doesn't exist or has been deleted.</p>
              <Link href="/" data-testid="link-back-home-error">
                <a className="inline-flex items-center px-4 py-2 bg-tournament-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </a>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { tournament, matches } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-active bg-active/20';
      case 'in-progress': return 'text-in-progress bg-in-progress/20';
      case 'completed': return 'text-completed bg-completed/20';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getRoundInfo = () => {
    const totalRounds = Math.ceil(Math.log2(tournament.teamSize));
    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const totalMatches = matches.length;
    
    return {
      totalRounds,
      completedMatches,
      totalMatches,
      progress: `${completedMatches} of ${totalMatches} matches completed`
    };
  };

  const roundInfo = getRoundInfo();

  return (
    <div className="font-inter bg-gray-50 min-h-screen" data-testid="tournament-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <i className="fas fa-trophy text-tournament-primary text-2xl"></i>
              <h1 className="text-xl font-bold text-neutral">Tournament Manager</h1>
            </div>
            <Link href="/" data-testid="link-back-home">
              <a className="flex items-center text-neutral hover:text-tournament-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </a>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral" data-testid="text-tournament-name">{tournament.name}</h2>
              <p className="text-gray-600" data-testid="text-tournament-description">
                {tournament.teamSize}-Team Single Elimination • {roundInfo.progress}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(tournament.status)}`} data-testid="status-tournament">
                {tournament.status === 'upcoming' ? 'Upcoming' : 
                 tournament.status === 'in-progress' ? 'In Progress' : 'Completed'}
              </span>
              <button 
                onClick={() => refetch()} 
                className="text-gray-500 hover:text-tournament-primary transition-colors p-2"
                data-testid="button-refresh-bracket"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Render appropriate tournament view based on format */}
          {tournament.competitionFormat === "multi-stage" ? (
            <MultiStageTournament tournament={tournament} />
          ) : tournament.competitionFormat === "leaderboard" ? (
            <LeaderboardView tournament={tournament} />
          ) : (
            <BracketVisualization tournament={tournament} matches={matches} />
          )}
        </div>
      </main>
    </div>
  );
}
