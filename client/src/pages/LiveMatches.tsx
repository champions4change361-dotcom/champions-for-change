import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Timer, Users, MapPin, LogOut } from 'lucide-react';

export default function LiveMatches() {
  const liveMatches = [
    { id: 1, sport: "Basketball", teams: ["Eagles vs Hawks"], venue: "Gym A", time: "2:15 PM", status: "Quarter 3" },
    { id: 2, sport: "Soccer", teams: ["Lions vs Tigers"], venue: "Field 1", time: "3:30 PM", status: "Half Time" },
    { id: 3, sport: "Tennis", teams: ["Smith vs Johnson"], venue: "Court 2", time: "1:45 PM", status: "Set 2" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg shadow-lg">
                  <Trophy className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Champions Arena</h1>
                  <p className="text-xs text-yellow-400">Tournament Central</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-slate-300 hover:text-yellow-400 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <a 
                href="/api/logout"
                className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-yellow-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Logout</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Timer className="h-4 w-4" />
            <span>Live Tournament Action</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Live Matches</h1>
          <p className="text-xl text-slate-300">
            Track ongoing competitions and real-time scores
          </p>
        </div>

        {/* Live Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveMatches.map((match) => (
            <div key={match.id} className="bg-slate-800 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-semibold text-sm">LIVE</span>
                </div>
                <span className="text-slate-400 text-sm">{match.time}</span>
              </div>
              
              <h3 className="text-white font-bold text-lg mb-2">{match.sport}</h3>
              <p className="text-yellow-400 font-semibold mb-3">{match.teams[0]}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-slate-300 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  {match.venue}
                </div>
                <div className="flex items-center text-slate-300 text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  {match.status}
                </div>
              </div>
              
              <button className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors">
                View Match
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}