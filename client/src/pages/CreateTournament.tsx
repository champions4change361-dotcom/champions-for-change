import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, Zap, Users, Trophy, Settings, Sparkles, LogOut, FileText, MessageCircle, Send } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { useTournamentPreview } from "@/hooks/useTournamentPreview";
import EnhancedTournamentWizard from '@/components/enhanced-tournament-wizard';
import TournamentPreviewBanner from '@/components/TournamentPreviewBanner';
import TournamentSmartPrompt from '@/components/TournamentSmartPrompt';
// Removed old AI consultation component - using integrated chat AI instead

// AI conversation features temporarily disabled for production

function TournamentCreationPlaceholder() {
  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <div className="inline-flex items-center space-x-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
        <Settings className="h-4 w-4" />
        <span>Under Development</span>
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">Enhanced Tournament Creation</h1>
      <p className="text-xl text-slate-300 mb-8">
        Advanced tournament creation tools are being developed to make setup even easier.
      </p>
      <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-white mb-4">Coming Soon</h3>
        <ul className="text-slate-400 space-y-2 text-left max-w-md mx-auto">
          <li>• Guided tournament setup wizard</li>
          <li>• Smart bracket generation</li>
          <li>• Team management tools</li>
          <li>• Automated scheduling</li>
        </ul>
        <div className="mt-8">
          <Link href="/create">
            <button className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-colors">
              Use Standard Tournament Creator
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CreateTournament() {
  const { user, isAuthenticated } = useAuth();
  const [creationMode, setCreationMode] = useState<'menu' | 'wizard'>('menu');
  const [location, navigate] = useLocation();
  const { 
    isPreviewMode, 
    savePreviewData, 
    markSectionCompleted,
    progress
  } = useTournamentPreview();

  // Check URL parameters to determine if we should go straight to wizard
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const flow = urlParams.get('flow');
    
    if (flow === 'registration' || flow === 'bracket') {
      setCreationMode('wizard');
      // Save the flow preference to preview data
      if (isPreviewMode) {
        savePreviewData({ flow: flow as 'registration' | 'bracket' });
        markSectionCompleted('onboarding-choice');
      }
    }
  }, []); // Remove dependencies to prevent infinite loop

  // Mark initial section as completed when user starts tournament creation
  useEffect(() => {
    if (isPreviewMode) {
      markSectionCompleted('tournament-access');
    }
  }, []);

  const handleTournamentCreated = (tournament: any) => {
    if (isAuthenticated) {
      // Tournament created successfully for authenticated user
      console.log('Tournament created:', tournament);
    } else {
      // Save tournament data to preview mode
      savePreviewData({
        name: tournament.name,
        sport: tournament.sport,
        format: tournament.format,
        teams: tournament.teams,
        settings: tournament.settings
      });
      markSectionCompleted('tournament-completion');
    }
  };

  const handleWizardStart = () => {
    setCreationMode('wizard');
    if (isPreviewMode) {
      markSectionCompleted('wizard-start');
    }
  };

  const getUserType = (): 'district' | 'enterprise' | 'free' | 'general' => {
    // Determine user type based on available user properties
    if (user?.subscriptionStatus === 'active') {
      // Check subscription level or other indicators
      return 'general';
    }
    return 'free';
  };

  if (creationMode === 'wizard') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Preview Mode Components */}
        <TournamentPreviewBanner />
        <TournamentSmartPrompt />
        
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
                    <p className="text-xs text-yellow-400">5-Step Tournament Creator</p>
                  </div>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCreationMode('menu')}
                  className="flex items-center text-slate-300 hover:text-yellow-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Options
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EnhancedTournamentWizard
            onClose={() => setCreationMode('menu')}
            onTournamentCreated={handleTournamentCreated}
            userType={getUserType()}
          />
        </main>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Preview Mode Components */}
      <TournamentPreviewBanner />
      <TournamentSmartPrompt />
      
      {/* Header */}
      <header className={`relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm ${isPreviewMode ? 'mt-32 md:mt-40' : ''}`}>
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
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link href="/" className="flex items-center text-slate-300 hover:text-yellow-400 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
              <a 
                href="/api/logout"
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-slate-300 hover:text-yellow-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Logout</span>
              </a>
            </div>
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

        {/* Tournament Creation Options - Mobile optimized */}
        <div className="flex justify-center mb-8">
          {/* 5-Step Tournament Wizard */}
          <div 
            onClick={handleWizardStart}
            className="bg-slate-800 border border-blue-500/30 rounded-2xl p-8 hover:border-blue-400/50 transition-all cursor-pointer group max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500/30 transition-colors">
                <FileText className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">5-Step Tournament Creator</h3>
              <p className="text-slate-400 mb-6">
                Step-by-step tournament creation with team name management and CSV import. 
                Perfect for getting tournaments set up quickly with real team names.
              </p>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="space-y-1 text-blue-400 text-sm">
                  <div>1. Choose sport & format</div>
                  <div>2. Set tournament size</div>
                  <div>3. Enter team names (CSV import available)</div>
                  <div>4. Generate bracket/leaderboard</div>
                  <div>5. Start tournament</div>
                </div>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                Create Tournament
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