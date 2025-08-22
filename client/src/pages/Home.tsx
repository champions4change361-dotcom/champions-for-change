import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Users, Calendar, Settings, Award, Timer, Star, ChevronRight, LogOut, Palette } from 'lucide-react';
import { Link } from "wouter";
import MoxyMessage from "../components/MoxyMessage";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
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
              <UserMenu className="text-white" />
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
                  Every tournament creates opportunities for underprivileged student competitors
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          {/* Create Tournament */}
          <Link href="/create">
            <div data-testid="card-create-tournament" className="lg:col-span-1 bg-slate-800 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/50 transition-all cursor-pointer group">
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
          <Link href="/ai-consultation">
            <div data-testid="card-ai-consultation" className="lg:col-span-1 bg-slate-800 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                  <Star className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">AI Coach</h3>
                <p className="text-sm text-slate-400">Tournament strategy</p>
              </div>
            </div>
          </Link>

          {/* Live Matches */}
          <Link href="/live-matches">
            <div data-testid="card-live-matches" className="lg:col-span-1 bg-slate-800 border border-red-500/30 rounded-xl p-6 hover:border-red-400/50 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-red-500/30 transition-colors">
                  <Timer className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Live Matches</h3>
                <p className="text-sm text-slate-400">{liveMatches} in progress</p>
              </div>
            </div>
          </Link>

          {/* Championships */}
          <Link href="/championships">
            <div data-testid="card-championships" className="lg:col-span-1 bg-slate-800 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/30 transition-colors">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Championships</h3>
                <p className="text-sm text-slate-400">View results</p>
              </div>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/settings">
            <div data-testid="card-settings" className="lg:col-span-1 bg-slate-800 border border-slate-500/30 rounded-xl p-6 hover:border-slate-400/50 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-500/30 transition-colors">
                  <Settings className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Arena Settings</h3>
                <p className="text-sm text-slate-400">Account & preferences</p>
              </div>
            </div>
          </Link>

          {/* Custom Design Demo */}
          <Link href="/custom-design-demo">
            <div data-testid="card-custom-design" className="lg:col-span-1 bg-slate-800 border border-pink-500/30 rounded-xl p-6 hover:border-pink-400/50 transition-all cursor-pointer group">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-colors">
                  <Palette className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Design Demo</h3>
                <p className="text-sm text-slate-400">Custom UI showcase</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Active Championships Board */}
        <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="h-6 w-6 text-yellow-400 mr-3" />
              Active Championships
            </h2>
            <div className="text-sm text-slate-400">Updated live</div>
          </div>

          <div className="space-y-4">
            {activeTournaments.map((tournament, index) => (
              <div key={index} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-yellow-500/30 transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                      {tournament.name}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                        {tournament.status}
                      </span>
                      <span>{tournament.participants} Teams</span>
                      <span className="text-yellow-400 font-semibold">{tournament.prize}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-yellow-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-slate-900 px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-400 transition-all shadow-lg">
              View All Championships
            </button>
          </div>
        </div>

        {/* Mission Philosophy Section */}
        <div className="mt-8">
          <MoxyMessage />
        </div>
      </main>
    </div>
  );
}