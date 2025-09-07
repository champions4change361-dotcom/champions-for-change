import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Settings, Users, Trophy, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import BracketVisualization from "@/components/bracket-visualization";
import ChallongeStyleBracket from "@/components/ChallongeStyleBracket";
import LeaderboardView from "@/components/leaderboard-view";
import MultiStageTournament from "@/components/multi-stage-tournament";
import TrackFieldTournament from "@/components/track-field-tournament";
import { type Tournament, type Match } from "@shared/schema";

interface TournamentData {
  tournament: Tournament;
  matches: Match[];
}

export default function Tournament() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery<TournamentData>({
    queryKey: ["/api/tournaments", id],
  });

  // Check if user owns this tournament  
  const { data: tournamentOwnership } = useQuery({
    queryKey: ["/api/events", "tournament", id, "tournament-owner"],
    enabled: !!user && !!id,
    retry: false,
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
              <Link href="/" data-testid="link-back-home" className="flex items-center text-neutral hover:text-tournament-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
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

  if (!data || !data.tournament) {
    return (
      <div className="font-inter bg-gray-50 min-h-screen" data-testid="tournament-not-found">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <i className="fas fa-trophy text-tournament-primary text-2xl"></i>
                <h1 className="text-xl font-bold text-neutral">Tournament Manager</h1>
              </div>
              <Link href="/" data-testid="link-back-home" className="flex items-center text-neutral hover:text-tournament-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
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
              <Link href="/" data-testid="link-back-home-error" className="inline-flex items-center px-4 py-2 bg-tournament-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
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

  // Determine if user can manage this tournament
  const canManageTournament = user && (
    user.id === tournament.userId ||
    ['tournament_manager', 'head_coach', 'assistant_coach', 'scorekeeper'].includes(user.userRole || '')
  );

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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {canManageTournament && (
                <>
                  <Link 
                    href={`/event-scorekeeper-dashboard/${id}`}
                    data-testid="link-manage-events" 
                    className="flex items-center text-neutral hover:text-tournament-primary transition-colors"
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Manage Events
                  </Link>
                  <Link 
                    href={`/tournaments/${id}/participants`}
                    data-testid="link-manage-participants" 
                    className="flex items-center text-neutral hover:text-tournament-primary transition-colors"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Participants
                  </Link>
                  <Link 
                    href={`/tournaments/${id}/settings`}
                    data-testid="link-tournament-settings" 
                    className="flex items-center text-neutral hover:text-tournament-primary transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </>
              )}
              <Link href="/" data-testid="link-back-home" className="flex items-center text-neutral hover:text-tournament-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-neutral hover:text-tournament-primary transition-colors p-2"
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200" data-testid="mobile-menu">
            <div className="px-4 py-2 space-y-1">
              {canManageTournament && (
                <>
                  <Link 
                    href={`/event-scorekeeper-dashboard/${id}`}
                    data-testid="mobile-link-manage-events"
                    className="block px-3 py-2 text-neutral hover:bg-gray-50 hover:text-tournament-primary transition-colors rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-3" />
                      Manage Events
                    </div>
                  </Link>
                  <Link 
                    href={`/tournaments/${id}/participants`}
                    data-testid="mobile-link-manage-participants"
                    className="block px-3 py-2 text-neutral hover:bg-gray-50 hover:text-tournament-primary transition-colors rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-3" />
                      Participants
                    </div>
                  </Link>
                  <Link 
                    href={`/tournaments/${id}/settings`}
                    data-testid="mobile-link-tournament-settings"
                    className="block px-3 py-2 text-neutral hover:bg-gray-50 hover:text-tournament-primary transition-colors rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </div>
                  </Link>
                </>
              )}
              <Link 
                href="/" 
                data-testid="mobile-link-back-home"
                className="block px-3 py-2 text-neutral hover:bg-gray-50 hover:text-tournament-primary transition-colors rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-3" />
                  Back to Home
                </div>
              </Link>
            </div>
          </div>
        )}
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
                 tournament.status === 'stage-1' || tournament.status === 'stage-2' || tournament.status === 'stage-3' ? 'In Progress' : 'Completed'}
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
          {tournament.sport?.includes("Track & Field") ? (
            <TrackFieldTournament tournamentId={tournament.id} tournamentName={tournament.name} />
          ) : tournament.competitionFormat === "multi-stage" ? (
            <MultiStageTournament tournament={{...tournament, sport: tournament.sport || 'Unknown'}} />
          ) : tournament.competitionFormat === "leaderboard" ? (
            <LeaderboardView tournament={{...tournament, sport: tournament.sport || 'Unknown'}} />
          ) : (
            <ChallongeStyleBracket 
              tournament={{...tournament, sport: tournament.sport || 'Unknown'}} 
              matches={matches.map(match => ({
                ...match, 
                team1: match.team1 || undefined,
                team2: match.team2 || undefined
              }))} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
