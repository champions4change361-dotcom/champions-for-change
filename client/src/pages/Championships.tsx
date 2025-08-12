import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Award, Star, Crown, Medal } from 'lucide-react';

export default function Championships() {
  const recentChampions = [
    {
      id: '1',
      tournament: 'Spring Basketball Championship',
      winner: 'Robert Driscoll Eagles',
      date: '2024-03-15',
      sport: 'Basketball',
      participants: 16,
      fundsRaised: '$2,600'
    },
    {
      id: '2',
      tournament: 'Soccer Regional Cup',
      winner: 'Coastal Bend United',
      date: '2024-03-10',
      sport: 'Soccer',
      participants: 12,
      fundsRaised: '$1,800'
    },
    {
      id: '3',
      tournament: 'Tennis Open Series',
      winner: 'Champions Tennis Club',
      date: '2024-03-05',
      sport: 'Tennis',
      participants: 24,
      fundsRaised: '$3,200'
    },
    {
      id: '4',
      tournament: 'Track & Field Invitational',
      winner: 'CCISD Speedsters',
      date: '2024-02-28',
      sport: 'Track & Field',
      participants: 32,
      fundsRaised: '$4,100'
    }
  ];

  const totalFundsRaised = recentChampions.reduce((total, champion) => {
    return total + parseInt(champion.fundsRaised.replace('$', '').replace(',', ''));
  }, 0);

  const studentsSupported = Math.floor(totalFundsRaised / 2600);

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
          <div className="inline-flex items-center space-x-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Crown className="h-4 w-4" />
            <span>Hall of Champions</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Championships</h1>
          <p className="text-xl text-slate-300">
            Celebrating our winners and the students they support through Champions for Change
          </p>
        </div>

        {/* Championship Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{recentChampions.length}</div>
            <div className="text-slate-300">Tournaments Completed</div>
          </div>
          
          <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 mb-2">${totalFundsRaised.toLocaleString()}</div>
            <div className="text-slate-300">Total Funds Raised</div>
          </div>
          
          <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{studentsSupported}</div>
            <div className="text-slate-300">Students Supported</div>
          </div>
          
          <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Medal className="h-6 w-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">84</div>
            <div className="text-slate-300">Total Teams Participated</div>
          </div>
        </div>

        {/* Recent Champions */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-400" />
            <span>Recent Champions</span>
          </h2>
          
          <div className="space-y-4">
            {recentChampions.map((champion, index) => (
              <div key={champion.id} className="bg-slate-700 rounded-xl p-6 hover:bg-slate-600/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-400 text-slate-900' :
                      index === 1 ? 'bg-slate-400 text-slate-900' :
                      index === 2 ? 'bg-orange-400 text-slate-900' :
                      'bg-slate-600 text-slate-300'
                    }`}>
                      {index === 0 ? <Crown className="h-6 w-6" /> : <Medal className="h-6 w-6" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{champion.winner}</h3>
                      <p className="text-slate-400">{champion.tournament}</p>
                      <p className="text-slate-500 text-sm">{champion.sport} • {champion.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-emerald-400 font-bold text-xl">{champion.fundsRaised}</div>
                    <div className="text-slate-400 text-sm">for student education</div>
                    <div className="text-slate-500 text-xs">{champion.participants} teams</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Educational Impact */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-2xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              <span>Educational Impact</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-6">Champions Creating Opportunities</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-left">
                <h4 className="text-xl font-semibold text-white mb-4">Student Trip Destinations Funded</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <span className="text-slate-300">Washington D.C. Leadership Trip</span>
                    <span className="text-emerald-400 font-semibold">2 Students</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <span className="text-slate-300">Space Center Houston STEM Trip</span>
                    <span className="text-emerald-400 font-semibold">3 Students</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <span className="text-slate-300">College Campus Tour</span>
                    <span className="text-emerald-400 font-semibold">1 Student</span>
                  </div>
                </div>
              </div>
              
              <div className="text-left">
                <h4 className="text-xl font-semibold text-white mb-4">School Participation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <span className="text-slate-300">Robert Driscoll Middle School</span>
                    <span className="text-yellow-400 font-semibold">12 Teams</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <span className="text-slate-300">CCISD Schools</span>
                    <span className="text-yellow-400 font-semibold">8 Teams</span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                    <span className="text-slate-300">Coastal Bend Schools</span>
                    <span className="text-yellow-400 font-semibold">6 Teams</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}