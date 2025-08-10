import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import TournamentCreationForm from "@/components/tournament-creation-form";
import TournamentList from "@/components/tournament-list";
import { type Tournament } from "@shared/schema";

export default function Home() {
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  return (
    <div className="font-inter bg-gray-50 min-h-screen" data-testid="home-page">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <i className="fas fa-trophy text-tournament-primary text-2xl"></i>
              <h1 className="text-xl font-bold text-neutral">Tournament Manager</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/" data-testid="link-tournaments">
                <a className="text-neutral hover:text-tournament-primary transition-colors">Tournaments</a>
              </Link>
              <span className="text-neutral">Create</span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Tournament Creation & Management */}
          <div className="lg:col-span-1 space-y-6">
            <TournamentCreationForm />
            <TournamentList 
              tournaments={tournaments}
              isLoading={isLoading}
              selectedTournamentId={selectedTournamentId}
              onSelectTournament={setSelectedTournamentId}
            />
          </div>
          
          {/* Right Panel: Tournament Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="tournament-info-panel">
              {selectedTournamentId ? (
                <div className="text-center">
                  <div className="mb-6">
                    <i className="fas fa-eye text-tournament-primary text-4xl mb-4"></i>
                    <h2 className="text-xl font-bold text-neutral mb-2">View Tournament Details</h2>
                    <p className="text-gray-600">Click below to view the full tournament bracket and manage matches.</p>
                  </div>
                  <Link href={`/tournament/${selectedTournamentId}`} data-testid="link-view-tournament">
                    <a className="inline-flex items-center px-6 py-3 bg-tournament-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <i className="fas fa-bracket-curly mr-2"></i>
                      View Tournament Bracket
                    </a>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <i className="fas fa-trophy text-gray-400 text-6xl mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-600 mb-2">Welcome to Tournament Manager</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Create a new tournament or select an existing one from the list to get started with managing your brackets.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <i className="fas fa-plus-circle text-tournament-primary text-2xl mb-2"></i>
                      <h3 className="font-semibold text-neutral mb-1">Create Tournament</h3>
                      <p className="text-sm text-gray-600">Set up a new single elimination tournament</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <i className="fas fa-bracket-curly text-tournament-secondary text-2xl mb-2"></i>
                      <h3 className="font-semibold text-neutral mb-1">Manage Brackets</h3>
                      <p className="text-sm text-gray-600">Update scores and advance winners</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
