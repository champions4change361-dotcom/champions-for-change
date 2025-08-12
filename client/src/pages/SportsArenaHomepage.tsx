import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Users, Calendar, Settings, Award, Timer, Star, ChevronRight } from 'lucide-react';
import { Link } from "wouter";

export default function SportsArenaHomepage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveMatches, setLiveMatches] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTournaments = [
    { name: "Spring Basketball Championship", status: "Quarter Finals", participants: 16, prize: "$2,600" },
    { name: "Soccer Regional Cup", status: "Semi Finals", participants: 8, prize: "$1,800" },
    { name: "Tennis Open Series", status: "Group Stage", participants: 32, prize: "$3,200" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Stadium Lighting Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
        <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Arena Logo */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg shadow-lg">
                  <Trophy className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Champions Arena</h1>
                  <p className="text-xs text-yellow-400">Tournament Central</p>
                </div>
              </div>

              {/* Live Status Bar */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">{liveMatches} Live Matches</span>
                </div>
                <div className="text-sm text-slate-300">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Daniel Thornton</p>
                  <p className="text-xs text-yellow-400">Tournament Director</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-slate-900 font-bold">D</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Main Arena Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Jumbotron Welcome */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl border border-yellow-500/30 mb-8">
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-4 w-40 h-40 bg-yellow-400/3 rounded-full blur-3xl"></div>
          </div>
          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  Welcome Back, <span className="text-yellow-400">Champion</span>
                </h2>
                <p className="text-xl text-slate-300 mb-4">
                  Every tournament creates opportunities for student athletes in Corpus Christi, Texas
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">Supporting Education</span>
                  </div>
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">Built by Coaches</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-yellow-400">$2,600+</div>
                <div className="text-lg text-slate-300">Per Student Trip</div>
                <div className="text-sm text-slate-400">Costs covered first</div>
              </div>
            </div>
          </div>
        </div>

        {/* Arena Command Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Create Tournament */}
          <Link href="/create">
            <div className="lg:col-span-1 bg-slate-800 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/50 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500/30 transition-colors">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Create Tournament</h3>
                <p className="text-sm text-slate-400">Start a new competition</p>
              </div>
            </div>
          </Link>

          {/* AI Coach */}
          <div className="lg:col-span-1 bg-slate-800 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all cursor-pointer group">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Star className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Coach</h3>
              <p className="text-sm text-slate-400">Tournament strategy</p>
            </div>
          </div>

          {/* Live Matches */}
          <div className="lg:col-span-1 bg-slate-800 border border-red-500/30 rounded-xl p-6 hover:border-red-400/50 transition-all cursor-pointer group">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500/30 transition-colors">
                <Timer className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Matches</h3>
              <p className="text-sm text-slate-400">{liveMatches} in progress</p>
            </div>
          </div>

          {/* Championships */}
          <div className="lg:col-span-1 bg-slate-800 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all cursor-pointer group">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/30 transition-colors">
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Championships</h3>
              <p className="text-sm text-slate-400">View winners</p>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-1 bg-slate-800 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all cursor-pointer group">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Settings className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Settings</h3>
              <p className="text-sm text-slate-400">Platform config</p>
            </div>
          </div>
        </div>

        {/* Active Tournaments Dashboard */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Active Tournaments</h3>
              <p className="text-slate-400">Live competitions generating student funding</p>
            </div>
            <button className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 px-4 py-2 rounded-lg font-semibold transition-colors">
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTournaments.map((tournament, index) => (
              <div key={index} className="bg-slate-700 border border-slate-600 rounded-xl p-6 hover:border-yellow-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{tournament.name}</h4>
                    <p className="text-yellow-400 text-sm font-medium mb-2">{tournament.status}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-400">{tournament.prize}</div>
                    <div className="text-xs text-slate-400">Prize Fund</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{tournament.participants} teams</span>
                  </div>
                  <button className="text-yellow-400 hover:text-yellow-300 text-sm font-medium flex items-center space-x-1">
                    <span>Manage</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}