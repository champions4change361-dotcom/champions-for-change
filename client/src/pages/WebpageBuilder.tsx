import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Trophy, Code, Palette, Globe, Zap, Eye } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";

export default function WebpageBuilder() {
  const { user } = useAuth();
  const [tournamentInfo, setTournamentInfo] = useState({
    name: '',
    sport: '',
    ageGroup: '',
    participants: '',
    date: '',
    description: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebpage, setGeneratedWebpage] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/keystone-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_input: `Build a webpage for ${tournamentInfo.name} - a ${tournamentInfo.sport} tournament for ${tournamentInfo.ageGroup} with ${tournamentInfo.participants} participants on ${tournamentInfo.date}. ${tournamentInfo.description}`,
          tier: 'full-service',
          subscription_level: user?.subscriptionPlan || 'district_enterprise'
        })
      });
      const data = await res.json();
      setGeneratedWebpage(data);
    } catch (error) {
      console.error('Webpage generation error:', error);
    } finally {
      setIsGenerating(false);
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
            
            <Link href="/ai-coach" className="flex items-center text-slate-300 hover:text-yellow-400 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AI Coach
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Code className="h-4 w-4" />
            <span>Webpage Builder</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Tournament Webpage Generator</h1>
          <p className="text-xl text-slate-300">
            Create a custom tournament webpage with Champions for Change branding
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tournament Information Form */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Palette className="h-6 w-6 text-purple-400" />
              <span>Tournament Details</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Tournament Name</label>
                <input
                  type="text"
                  value={tournamentInfo.name}
                  onChange={(e) => setTournamentInfo(prev => ({...prev, name: e.target.value}))}
                  placeholder="e.g., Spring Basketball Championship"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Sport</label>
                  <select
                    value={tournamentInfo.sport}
                    onChange={(e) => setTournamentInfo(prev => ({...prev, sport: e.target.value}))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Select Sport</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Soccer">Soccer</option>
                    <option value="Baseball">Baseball</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Track & Field">Track & Field</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Football">Football</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Age Group</label>
                  <select
                    value={tournamentInfo.ageGroup}
                    onChange={(e) => setTournamentInfo(prev => ({...prev, ageGroup: e.target.value}))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-purple-400 focus:outline-none"
                  >
                    <option value="">Select Age Group</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Middle School">Middle School</option>
                    <option value="High School">High School</option>
                    <option value="College">College</option>
                    <option value="Adult">Adult</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Participants</label>
                  <input
                    type="text"
                    value={tournamentInfo.participants}
                    onChange={(e) => setTournamentInfo(prev => ({...prev, participants: e.target.value}))}
                    placeholder="e.g., 16 teams"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Event Date</label>
                  <input
                    type="date"
                    value={tournamentInfo.date}
                    onChange={(e) => setTournamentInfo(prev => ({...prev, date: e.target.value}))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  value={tournamentInfo.description}
                  onChange={(e) => setTournamentInfo(prev => ({...prev, description: e.target.value}))}
                  placeholder="Additional details about your tournament..."
                  rows={4}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:border-purple-400 focus:outline-none resize-none"
                />
              </div>
              
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !tournamentInfo.name || !tournamentInfo.sport}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Webpage...</span>
                  </>
                ) : (
                  <>
                    <Globe className="h-5 w-5" />
                    <span>Generate Tournament Webpage</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Webpage Preview */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Eye className="h-6 w-6 text-emerald-400" />
              <span>Webpage Preview</span>
            </h2>
            
            {!generatedWebpage ? (
              <div className="text-center py-12">
                <Globe className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  Fill out the tournament details and click "Generate" to see your custom webpage
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <h3 className="text-emerald-400 font-semibold mb-2">✓ Webpage Generated Successfully!</h3>
                  <p className="text-slate-300 text-sm">
                    Your tournament webpage is ready with Champions for Change branding and educational impact tracking.
                  </p>
                </div>
                
                {generatedWebpage.tier3_full_service && (
                  <div className="space-y-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Domain Options</h4>
                      <div className="space-y-2">
                        {generatedWebpage.tier3_full_service.custom_webpage.domain_suggestions.map((domain: string, index: number) => (
                          <div key={index} className="bg-slate-600 rounded px-3 py-2 text-emerald-400 font-mono text-sm">
                            {domain}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">SEO Settings</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-400">Title:</span>
                          <span className="text-white ml-2">{generatedWebpage.tier3_full_service.custom_webpage.seo_optimization.title}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Description:</span>
                          <span className="text-slate-300 ml-2">{generatedWebpage.tier3_full_service.custom_webpage.seo_optimization.description}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-lg p-4">
                      <h4 className="text-emerald-400 font-medium mb-2">Champions for Change Integration</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• Educational impact tracker</li>
                        <li>• $2,600 student trip funding progress</li>
                        <li>• Green/blue Champions for Change branding</li>
                        <li>• Tax-deductible donation processing</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}