import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Sparkles, Zap, Brain, Target, Code, Monitor, LogOut } from 'lucide-react';
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
              placeholder="Try: 'Build a webpage for 16-team basketball tournament' or 'Create swimming meet with leaderboards' or 'Generate code for baseball playoffs'"
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
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-6">
                <h4 className="text-emerald-400 font-semibold mb-3">Strategic Recommendation</h4>
                <div className="text-white whitespace-pre-line">{response.recommendation}</div>
              </div>

              {/* Intelligent Tournament Structure Display */}
              {response.tier2_generation?.intelligent_tournament_structure && (
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h4 className="text-blue-400 font-semibold mb-4 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Intelligent Tournament Structure
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-2">Recommended Format</div>
                      <div className="text-white font-semibold text-lg">{response.tier2_generation.intelligent_tournament_structure.format}</div>
                      <div className="text-slate-300 text-sm mt-2">{response.tier2_generation.intelligent_tournament_structure.naturalReason}</div>
                    </div>
                    
                    {response.tier2_generation.intelligent_tournament_structure.events && (
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-2">Events Included</div>
                        <div className="flex flex-wrap gap-2">
                          {response.tier2_generation.intelligent_tournament_structure.events.map((event: string, idx: number) => (
                            <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">{event}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Implementation Code Section */}
              {response.tier2_generation?.implementation_code && (
                <div className="bg-slate-900 border border-green-500/30 rounded-lg p-6">
                  <h4 className="text-green-400 font-semibold mb-4 flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Copy-Paste Implementation Code
                  </h4>
                  <div className="bg-black rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-300 text-sm font-mono">
                      <code>{response.tier2_generation.implementation_code}</code>
                    </pre>
                  </div>
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="text-green-400 text-sm font-semibold">Ready to Deploy</div>
                    <div className="text-slate-300 text-sm">This code works with any JavaScript framework or vanilla HTML. Copy and paste to implement the tournament structure.</div>
                  </div>
                </div>
              )}

              {/* Complete Website Code - Show if available regardless of subscription for demo */}
              {(response.tier3_full_service?.intelligent_tournament_logic?.complete_website_template || 
                response.tier3_full_service?.custom_webpage?.complete_website_html || 
                response.tier3_full_service?.custom_webpage?.deployable_code) && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h4 className="text-purple-400 font-semibold mb-4 flex items-center">
                    <Monitor className="h-5 w-5 mr-2" />
                    🚀 Complete Deployable Website
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <div className="text-yellow-400 font-semibold mb-2">⚡ Ready to Deploy!</div>
                      <div className="text-slate-300 text-sm">
                        Complete HTML website with Champions for Change branding, educational impact tracking, and sport-specific tournament structure.
                      </div>
                    </div>
                    
                    <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-purple-300 font-semibold">Complete Website Code</span>
                        <button 
                          onClick={() => {
                            const code = response.tier3_full_service.intelligent_tournament_logic?.complete_website_template || 
                                       response.tier3_full_service.custom_webpage?.complete_website_html || 
                                       response.tier3_full_service.custom_webpage?.deployable_code || 
                                       'No website code available';
                            navigator.clipboard.writeText(code);
                          }}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Copy All
                        </button>
                      </div>
                      <pre className="text-purple-200 text-xs font-mono leading-relaxed">
                        <code>{
                          response.tier3_full_service.intelligent_tournament_logic?.complete_website_template || 
                          response.tier3_full_service.custom_webpage?.complete_website_html || 
                          response.tier3_full_service.custom_webpage?.deployable_code || 
                          'Generating complete website code...'
                        }</code>
                      </pre>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-2">Implementation</div>
                        <div className="text-purple-300 text-sm">
                          {response.tier3_full_service.intelligent_tournament_logic?.implementation_instructions || 
                           "1. Copy the HTML code 2. Save as .html file 3. Deploy to any web hosting 4. Customize branding as needed"}
                        </div>
                      </div>
                      
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="text-sm text-slate-400 mb-2">Platform Support</div>
                        <div className="text-purple-300 text-sm">
                          {response.tier3_full_service.intelligent_tournament_logic?.platform_integration || 
                           "Complete HTML/CSS/JS website ready to deploy anywhere"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Webpage Template */}
              {response.tier3_full_service?.custom_webpage && (
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h4 className="text-purple-400 font-semibold mb-4 flex items-center">
                    <Monitor className="h-5 w-5 mr-2" />
                    Website Configuration
                  </h4>
                  <div className="space-y-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-2">Domain Suggestions</div>
                      {response.tier3_full_service.custom_webpage.domain_suggestions.map((domain: string, idx: number) => (
                        <div key={idx} className="text-purple-300 font-mono text-sm bg-slate-800 px-3 py-1 rounded mb-2">{domain}</div>
                      ))}
                    </div>
                    
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="text-sm text-slate-400 mb-2">SEO Optimized</div>
                      <div className="text-white font-semibold">{response.tier3_full_service.custom_webpage.seo_optimization.title}</div>
                      <div className="text-slate-300 text-sm mt-1">{response.tier3_full_service.custom_webpage.seo_optimization.description}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tier Info */}
              {response.sport !== 'Custom Tournament' && (
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
              )}

              {response.tier3_full_service && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h4 className="text-blue-400 font-semibold mb-3">Webpage Generation Available</h4>
                  <p className="text-slate-300 mb-4">
                    Your District Enterprise subscription includes custom webpage generation!
                  </p>
                  <Link 
                    href="/webpage-builder"
                    className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Build Tournament Webpage</span>
                  </Link>
                </div>
              )}

              {response.tier1_consultation && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
                  <h4 className="text-yellow-400 font-semibold mb-3">Champions for Change Integration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-medium mb-2">Fundraising Opportunities</h5>
                      <ul className="text-slate-300 text-sm space-y-1">
                        {response.tier1_consultation.champions_for_change_integration.fundraising_opportunities.map((item: string, index: number) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-white font-medium mb-2">Educational Tie-ins</h5>
                      <ul className="text-slate-300 text-sm space-y-1">
                        {response.tier1_consultation.champions_for_change_integration.educational_tie_ins.map((item: string, index: number) => (
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