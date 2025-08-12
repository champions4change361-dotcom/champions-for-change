import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Timer, Play, Pause, Users } from 'lucide-react';

export default function LiveMatches() {
  const liveMatches = [
    {
      id: '1',
      tournament: 'Spring Basketball Championship',
      round: 'Quarter Final',
      team1: 'Robert Driscoll Eagles',
      team2: 'CCISD Hawks',
      team1Score: 45,
      team2Score: 42,
      status: 'live',
      timeRemaining: '6:23'
    },
    {
      id: '2', 
      tournament: 'Soccer Regional Cup',
      round: 'Semi Final',
      team1: 'Corpus Christi Storm',
      team2: 'Coastal Bend United',
      team1Score: 2,
      team2Score: 1,
      status: 'live',
      timeRemaining: '15:45'
    },
    {
      id: '3',
      tournament: 'Tennis Open Series',
      round: 'Group Stage',
      team1: 'Champions Tennis Club',
      team2: 'Bay Area Rackets',
      team1Score: 4,
      team2Score: 6,
      status: 'live',
      timeRemaining: 'Set 2'
    }
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
            
            <Link href="/" className="flex items-center text-slate-300 hover:text-yellow-400 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Timer className="h-4 w-4" />
            <span>Live Action</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Live Matches</h1>
          <p className="text-xl text-slate-300">
            Follow the action in real-time across all Champions for Change tournaments
          </p>
        </div>

        {/* Live Match Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Play className="h-6 w-6 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400 mb-2">{liveMatches.length}</div>
            <div className="text-slate-300">Live Matches</div>
          </div>
          
          <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">48</div>
            <div className="text-slate-300">Teams Competing</div>
          </div>
          
          <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 mb-2">3</div>
            <div className="text-slate-300">Active Tournaments</div>
          </div>
        </div>

        {/* Live Matches Grid */}
        <div className="space-y-6">
          {liveMatches.map((match) => (
            <div key={match.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-red-400/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{match.tournament}</h3>
                  <p className="text-slate-400">{match.round}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">LIVE</span>
                  <span className="text-slate-400">{match.timeRemaining}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Team 1 */}
                <div className="text-center md:text-right">
                  <div className="text-white font-semibold text-xl mb-2">{match.team1}</div>
                  <div className="text-4xl font-bold text-yellow-400">{match.team1Score}</div>
                </div>
                
                {/* VS */}
                <div className="text-center">
                  <div className="text-slate-400 text-lg">VS</div>
                  <Link 
                    href={`/tournament/${match.id}`}
                    className="inline-block mt-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Watch Live
                  </Link>
                </div>
                
                {/* Team 2 */}
                <div className="text-center md:text-left">
                  <div className="text-white font-semibold text-xl mb-2">{match.team2}</div>
                  <div className="text-4xl font-bold text-yellow-400">{match.team2Score}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Impact Banner */}
        <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-yellow-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            <span>Educational Impact</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">Every Match Funds Student Dreams</h3>
          <p className="text-slate-300 text-lg mb-6">
            These tournaments generate revenue that directly funds $2,600+ educational trips for 
            underprivileged youth in Corpus Christi, Texas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-400 mb-1">$1,200</div>
              <div className="text-slate-300 text-sm">Raised today from live tournaments</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">24</div>
              <div className="text-slate-300 text-sm">Students can attend trips so far</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-400 mb-1">3</div>
              <div className="text-slate-300 text-sm">Schools participating today</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}