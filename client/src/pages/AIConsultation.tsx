import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Sparkles, Zap, Brain, Target } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

export default function AIConsultation() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsultation = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/keystone-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_input: query,
          subscription_level: user?.subscriptionPlan || 'free'
        })
      });
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('AI consultation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4" />
            <span>AI Tournament Coach</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Keystone AI Consultation</h1>
          <p className="text-xl text-slate-300">
            Get intelligent tournament advice from our AI system trained on 65+ sports
          </p>
        </div>

        {/* AI Consultation Interface */}
        <div className="bg-slate-800 border border-purple-500/30 rounded-2xl p-8 mb-8">
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">
              Describe your tournament idea or challenge:
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'I want to create a basketball tournament for 16 middle school teams that will raise money for student trips to Washington DC'"
              className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none resize-none"
            />
          </div>
          
          <button
            onClick={handleConsultation}
            disabled={isLoading || !query.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Get AI Consultation</span>
              </>
            )}
          </button>
        </div>

        {/* AI Response */}
        {response && (
          <div className="bg-slate-800 border border-emerald-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center space-x-2 mb-6">
              <Target className="h-6 w-6 text-emerald-400" />
              <h3 className="text-2xl font-bold text-white">AI Recommendations</h3>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Sport</div>
                  <div className="text-white font-semibold">{response.sport}</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Format</div>
                  <div className="text-white font-semibold">{response.format}</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Age Group</div>
                  <div className="text-white font-semibold">{response.age_group}</div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">Participants</div>
                  <div className="text-white font-semibold">{response.estimated_participants}</div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
                <h4 className="text-emerald-400 font-semibold mb-3">Strategic Recommendation</h4>
                <p className="text-white">{response.recommendation}</p>
              </div>

              {response.tier1_consultation && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <h4 className="text-yellow-400 font-semibold mb-3">Champions for Change Integration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-medium mb-2">Fundraising Opportunities</h5>
                      <ul className="text-slate-300 text-sm space-y-1">
                        {response.tier1_consultation.champions_for_change_integration.fundraising_opportunities.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-white font-medium mb-2">Educational Tie-ins</h5>
                      <ul className="text-slate-300 text-sm space-y-1">
                        {response.tier1_consultation.champions_for_change_integration.educational_tie_ins.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feature Examples */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <Zap className="h-8 w-8 text-yellow-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">Quick Analysis</h3>
            <p className="text-slate-400 text-sm">
              Get instant tournament structure recommendations based on your sport and requirements.
            </p>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <Brain className="h-8 w-8 text-purple-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">Smart Suggestions</h3>
            <p className="text-slate-400 text-sm">
              AI-powered advice on scheduling, venues, and fundraising strategies for Champions for Change.
            </p>
          </div>
          
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <Target className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="text-white font-semibold mb-2">Mission-Focused</h3>
            <p className="text-slate-400 text-sm">
              Every recommendation includes ways to maximize student trip funding and educational impact.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}