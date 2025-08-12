import React from 'react';

const MoxyMessage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-yellow-500/30">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">The Champions Philosophy</h2>
        <p className="text-slate-300">Mission-Driven Tournament Platform</p>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-4">
        <h3 className="text-lg font-semibold text-white mb-3">The Moxy Message:</h3>
        <blockquote className="text-slate-200 italic border-l-4 border-yellow-500 pl-4">
          "It's gonna cost a few pennies, but I like the moxy to add it. 
          A buddy asked me today what if they copy you? I said well they should copy me - 
          will it drive down my price? Sure. But they gotta beat a guy who doesn't care 
          about money or power, so good luck."
        </blockquote>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-900/30 rounded-lg p-4 border border-emerald-500/30">
          <h4 className="text-emerald-400 font-semibold mb-2">Mission-Driven</h4>
          <p className="text-slate-300 text-sm">
            Building for student education, not profit maximization. 
            Every dollar goes toward $2,600+ student trips.
          </p>
        </div>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
          <h4 className="text-blue-400 font-semibold mb-2">Competitive Advantage</h4>
          <p className="text-slate-300 text-sm">
            "Beat someone who doesn't care about money or power" - 
            The ultimate unbeatable moat.
          </p>
        </div>
        
        <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
          <h4 className="text-purple-400 font-semibold mb-2">Innovation Freedom</h4>
          <p className="text-slate-300 text-sm">
            No quarterly profit pressure means pure focus on 
            building the best tournament platform possible.
          </p>
        </div>
        
        <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-500/30">
          <h4 className="text-yellow-400 font-semibold mb-2">The Moxy</h4>
          <p className="text-slate-300 text-sm">
            "I like the moxy to add it" - Willing to invest in 
            AI enhancement because it serves the mission.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-semibold">
          <span>⚔️</span>
          <span>Tournament Empire Builder</span>
          <span>🏆</span>
        </div>
      </div>
    </div>
  );
};

export default MoxyMessage;