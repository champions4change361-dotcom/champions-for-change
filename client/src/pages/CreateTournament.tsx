import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Zap, Users, Trophy, Settings, Sparkles } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

export default function CreateTournament() {
  const { user } = useAuth();

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            <span>Tournament Creation</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Create New Tournament</h1>
          <p className="text-xl text-slate-300">
            Generate revenue for Champions for Change student educational trips
          </p>
        </div>

        {/* Tournament Creation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Quick AI Setup */}
          <div className="bg-slate-800 border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all cursor-pointer group">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500/30 transition-colors">
                <Sparkles className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Quick Setup</h3>
              <p className="text-slate-400 mb-6">
                Tell our AI what tournament you want to create and we'll handle the rest. 
                Perfect for coaches who want to focus on their athletes.
              </p>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <p className="text-purple-400 text-sm font-medium">
                  "I want to create a middle school basketball tournament for 16 teams"
                </p>
              </div>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Start with AI
              </button>
            </div>
          </div>

          {/* Manual Setup */}
          <div className="bg-slate-800 border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/50 transition-all cursor-pointer group">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-colors">
                <Settings className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Manual Setup</h3>
              <p className="text-slate-400 mb-6">
                Full control over every aspect of your tournament. 
                Perfect for experienced tournament directors who want specific configurations.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-400 text-sm font-medium">
                  Choose sport, format, teams, scheduling, and all tournament details
                </p>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Manual Setup
              </button>
            </div>
          </div>
        </div>

        {/* Championship Revenue Impact */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-emerald-500/10 border border-yellow-500/30 rounded-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/20 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Trophy className="h-4 w-4" />
              <span>Impact Calculator</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Tournament Revenue Funds Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">$25</div>
                <div className="text-slate-300">per team registration</div>
                <div className="text-xs text-slate-400 mt-2">
                  Covers tournament costs + education fund
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-emerald-400 mb-2">16</div>
                <div className="text-slate-300">teams average</div>
                <div className="text-xs text-slate-400 mt-2">
                  Perfect size for single-day tournament
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">$400</div>
                <div className="text-slate-300">toward student trips</div>
                <div className="text-xs text-slate-400 mt-2">
                  Every tournament matters to our kids
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}