import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Award, Calendar, Users, LogOut } from 'lucide-react';

export default function Championships() {
  const championships = [
    { 
      id: 1, 
      title: "Spring Basketball Championship", 
      winner: "Eagles", 
      date: "March 15, 2024", 
      participants: 16,
      prize: "$2,600"
    },
    { 
      id: 2, 
      title: "Soccer Regional Cup", 
      winner: "Lions", 
      date: "April 22, 2024", 
      participants: 12,
      prize: "$1,800"
    },
    { 
      id: 3, 
      title: "Tennis Open Series", 
      winner: "Johnson", 
      date: "May 8, 2024", 
      participants: 24,
      prize: "$3,200"
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
          <div className="inline-flex items-center space-x-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            <span>Hall of Champions</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Championship Results</h1>
          <p className="text-xl text-slate-300">
            Celebrating our tournament winners and their achievements
          </p>
        </div>

        {/* Championships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {championships.map((championship) => (
            <div key={championship.id} className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{championship.title}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{championship.winner}</div>
                  <div className="text-sm text-slate-400">Champion</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-slate-300 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{championship.date}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center space-x-1 text-slate-300 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{championship.participants} teams</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center pt-2 border-t border-slate-700">
                  <div className="text-emerald-400 font-semibold">{championship.prize}</div>
                  <div className="text-xs text-slate-400">Educational Funding Generated</div>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Educational Impact Summary */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8 mt-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Educational Impact</h2>
            <p className="text-xl text-slate-300 mb-6">
              Tournament revenue directly funds student educational opportunities
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-400">$7,600</div>
                <div className="text-slate-300">Total Funding Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">3</div>
                <div className="text-slate-300">Student Trips Funded</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">52</div>
                <div className="text-slate-300">Tournaments Completed</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}