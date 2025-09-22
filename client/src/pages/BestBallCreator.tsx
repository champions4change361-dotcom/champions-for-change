import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Removed Select components - using native HTML selects for better mobile UX
import { ArrowLeft, Trophy, Users, Settings, Star, Zap } from 'lucide-react';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { useToast } from '@/hooks/use-toast';

export default function BestBallCreator() {
  const [location, setLocation] = useLocation();
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [leagueName, setLeagueName] = useState('');
  const [leagueSize, setLeagueSize] = useState('12');
  const [draftStyle, setDraftStyle] = useState('snake');
  const [rosterSize, setRosterSize] = useState('18');
  const [scoringFormat, setScoringFormat] = useState('half-ppr');
  const [playoffWeeks, setPlayoffWeeks] = useState('weeks-15-17');
  const [isCreating, setIsCreating] = useState(false);

  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to create a best ball league.
            </p>
            <Button onClick={() => setLocation('/fantasy-tournaments')}>
              Go to Fantasy Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateLeague = async () => {
    if (!leagueName.trim()) {
      toast({
        title: "League Name Required",
        description: "Please enter a name for your best ball league.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const leagueId = `bestball-${Date.now()}`;
      
      toast({
        title: "Best Ball League Created!",
        description: `${leagueName} has been created successfully.`,
      });
      
      setLocation(`/fantasy/league/${leagueId}`);
      
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your league. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/fantasy-tournaments')}
              data-testid="back-to-fantasy"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Fantasy
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-8 w-8 text-orange-600 mr-3" />
                Create Best Ball League
              </h1>
              <p className="text-gray-600 mt-1">
                Set up auto-optimized fantasy league with draft-and-done format
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-orange-600 text-white">
              <Users className="w-4 h-4 mr-1" />
              Commissioner: {fantasyUser?.email?.split('@')[0]}
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              ⭐ Best Ball Format
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              FREE - No Entry Fees
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* League Setup Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 w-5 mr-2" />
                  League Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="league-name">League Name *</Label>
                  <Input
                    id="league-name"
                    placeholder="e.g., Office Best Ball Championship"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    data-testid="league-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="league-size">League Size</Label>
                  <select 
                    id="league-size"
                    value={leagueSize} 
                    onChange={(e) => setLeagueSize(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="league-size-select"
                  >
                    <option value="10">10 Teams</option>
                    <option value="12">12 Teams</option>
                    <option value="14">14 Teams</option>
                    <option value="16">16 Teams</option>
                    <option value="20">20 Teams</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="draft-style">Draft Style</Label>
                  <select 
                    id="draft-style"
                    value={draftStyle} 
                    onChange={(e) => setDraftStyle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="draft-style-select"
                  >
                    <option value="snake">Snake Draft</option>
                    <option value="linear">Linear Draft</option>
                    <option value="auction">Auction Draft</option>
                    <option value="slow-draft">Slow Draft (Email)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="roster-size">Roster Size</Label>
                  <select 
                    id="roster-size"
                    value={rosterSize} 
                    onChange={(e) => setRosterSize(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="roster-size-select"
                  >
                    <option value="15">15 Players</option>
                    <option value="18">18 Players</option>
                    <option value="20">20 Players</option>
                    <option value="22">22 Players</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 w-5 mr-2" />
                  Optimization & Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scoring-format">Scoring Format</Label>
                  <select 
                    id="scoring-format"
                    value={scoringFormat} 
                    onChange={(e) => setScoringFormat(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="scoring-format-select"
                  >
                    <option value="standard">Standard Scoring</option>
                    <option value="half-ppr">Half PPR</option>
                    <option value="full-ppr">Full PPR</option>
                    <option value="premium-scoring">Premium Scoring</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="playoff-weeks">Playoff Period</Label>
                  <select 
                    id="playoff-weeks"
                    value={playoffWeeks} 
                    onChange={(e) => setPlayoffWeeks(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    data-testid="playoff-weeks-select"
                  >
                    <option value="weeks-15-17">Weeks 15-17 (Standard)</option>
                    <option value="weeks-16-18">Weeks 16-18</option>
                    <option value="weeks-14-17">Weeks 14-17 (Extended)</option>
                    <option value="season-long">Entire Season</option>
                  </select>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Auto-Optimization</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• System automatically picks your best lineup</li>
                    <li>• Highest scoring players start each week</li>
                    <li>• No weekly lineup decisions needed</li>
                    <li>• Draft once, compete all season</li>
                    <li>• Perfect for busy fantasy players</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateLeague}
              disabled={isCreating || !leagueName.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-lg py-3"
              data-testid="create-league-button"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating League...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Create Best Ball League
                </>
              )}
            </Button>
          </div>

          {/* Preview & Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800">Best Ball Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-orange-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Draft-and-done fantasy format
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>How it works:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Draft a large roster of players once</li>
                    <li>System automatically starts your best lineup</li>
                    <li>No waiver wire or weekly management</li>
                    <li>Optimal lineup selected each week</li>
                    <li>Perfect for set-and-forget fantasy</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>League Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">League Name:</span>
                    <p className="text-gray-600">{leagueName || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Teams:</span>
                    <p className="text-gray-600">{leagueSize} teams</p>
                  </div>
                  <div>
                    <span className="font-medium">Draft Style:</span>
                    <p className="text-gray-600 capitalize">{draftStyle.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Roster Size:</span>
                    <p className="text-gray-600">{rosterSize} players</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <span className="font-medium text-sm">Commissioner:</span>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
                      {fantasyUser?.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600">{fantasyUser?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}