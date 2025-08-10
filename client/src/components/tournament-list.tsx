import { type Tournament } from "@shared/schema";

interface TournamentListProps {
  tournaments: Tournament[];
  isLoading: boolean;
  selectedTournamentId: string | null;
  onSelectTournament: (id: string) => void;
}

export default function TournamentList({ 
  tournaments, 
  isLoading, 
  selectedTournamentId, 
  onSelectTournament 
}: TournamentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-active bg-active/20';
      case 'in-progress': return 'text-in-progress bg-in-progress/20';
      case 'completed': return 'text-completed bg-completed/20';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const getProgressText = (tournament: Tournament) => {
    const rounds = Math.ceil(Math.log2(tournament.teamSize));
    return `${rounds} rounds • ${tournament.teamSize} teams`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-tournaments-list">
        <h2 className="text-lg font-semibold text-neutral mb-4">
          <i className="fas fa-list text-tournament-secondary mr-2"></i>
          Active Tournaments
        </h2>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 animate-pulse" data-testid={`skeleton-tournament-${i}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="mt-2 h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-tournaments-list">
      <h2 className="text-lg font-semibold text-neutral mb-4">
        <i className="fas fa-list text-tournament-secondary mr-2"></i>
        Active Tournaments
      </h2>
      
      <div className="space-y-3">
        {tournaments.length === 0 ? (
          <div className="text-center py-8" data-testid="text-no-tournaments">
            <i className="fas fa-clipboard-list text-gray-400 text-3xl mb-3"></i>
            <p className="text-gray-500">No tournaments yet</p>
            <p className="text-sm text-gray-400">Create your first tournament to get started</p>
          </div>
        ) : (
          tournaments.map((tournament) => (
            <div 
              key={tournament.id}
              className={`border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedTournamentId === tournament.id ? 'border-tournament-primary bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => onSelectTournament(tournament.id)}
              data-testid={`card-tournament-${tournament.id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-neutral" data-testid={`text-tournament-name-${tournament.id}`}>
                    {tournament.name}
                  </h3>
                  <p className="text-sm text-gray-600" data-testid={`text-tournament-teams-${tournament.id}`}>
                    {tournament.teamSize} Teams
                  </p>
                </div>
                <span 
                  className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(tournament.status)}`}
                  data-testid={`status-tournament-${tournament.id}`}
                >
                  {getStatusLabel(tournament.status)}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500" data-testid={`text-tournament-progress-${tournament.id}`}>
                {getProgressText(tournament)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
