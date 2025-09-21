import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
// Using native select for better mobile UX
import { ArrowLeft, Trophy, Users, Settings, DollarSign, Clock, Globe, Lock, Calendar } from 'lucide-react';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import LanguageSelector from '@/components/LanguageSelector';

export default function DailyFantasyCreator() {
  const [location, setLocation] = useLocation();
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [contestName, setContestName] = useState('');
  const [salaryCap, setSalaryCap] = useState('50000');
  const [maxEntries, setMaxEntries] = useState('100');
  const [contestDuration, setContestDuration] = useState('weekly');
  const [rosterFormat, setRosterFormat] = useState('standard');
  const [slateTime, setSlateTime] = useState('afternoon');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedSport, setSelectedSport] = useState('nfl');
  const [isCreating, setIsCreating] = useState(false);

  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to create a daily fantasy contest.
            </p>
            <Button onClick={() => setLocation('/fantasy-tournaments')}>
              Go to Fantasy Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateContest = async () => {
    if (!contestName.trim()) {
      toast({
        title: "Contest Name Required",
        description: "Please enter a name for your daily fantasy contest.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const contestId = `daily-${Date.now()}`;
      
      toast({
        title: "Daily Fantasy Contest Created!",
        description: `${contestName} has been created successfully.`,
      });
      
      setLocation(`/fantasy/league/${contestId}`);
      
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your contest. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 overflow-x-hidden">
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
                <Trophy className="h-8 w-8 text-blue-600 mr-3" />
                Create Daily Fantasy Contest
              </h1>
              <p className="text-gray-600 mt-1">
                Set up salary cap contests with professional player pricing
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-600 text-white text-xs px-2 py-1 sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Commissioner: {fantasyUser?.email?.split('@')[0]}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs px-2 py-1 sm:text-sm whitespace-normal">
                💰 Daily Fantasy Format
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-2 py-1 sm:text-sm whitespace-normal">
                FREE - No Entry Fees
              </Badge>
            </div>
            <div className="shrink-0">
              <LanguageSelector variant="compact" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contest Setup Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 w-5 mr-2" />
                  Contest Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="contest-name">Contest Name *</Label>
                  <Input
                    id="contest-name"
                    placeholder="e.g., Office Daily Fantasy Championship"
                    value={contestName}
                    onChange={(e) => setContestName(e.target.value)}
                    data-testid="contest-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="salary-cap">Salary Cap</Label>
                  <select 
                    id="salary-cap"
                    value={salaryCap} 
                    onChange={(e) => setSalaryCap(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="salary-cap-select"
                  >
                    <option value="40000">$40,000</option>
                    <option value="50000">$50,000 (Standard)</option>
                    <option value="60000">$60,000</option>
                    <option value="75000">$75,000 (High Cap)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="max-entries">Max Participants</Label>
                  <select 
                    id="max-entries"
                    value={maxEntries} 
                    onChange={(e) => setMaxEntries(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="max-entries-select"
                  >
                    <option value="25">25 Participants</option>
                    <option value="50">50 Participants</option>
                    <option value="100">100 Participants</option>
                    <option value="200">200 Participants</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="contest-duration">Contest Duration</Label>
                  <select 
                    id="contest-duration"
                    value={contestDuration} 
                    onChange={(e) => setContestDuration(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="contest-duration-select"
                  >
                    <option value="single-game">Single Game</option>
                    <option value="daily">Daily (1 Day)</option>
                    <option value="weekly">Weekly (NFL Week)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 w-5 mr-2" />
                  Lineup & Scoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="roster-format">Roster Format</Label>
                  <select 
                    id="roster-format"
                    value={rosterFormat} 
                    onChange={(e) => setRosterFormat(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="roster-format-select"
                  >
                    <option value="standard">Standard (QB/RB/RB/WR/WR/TE/FLEX/DEF)</option>
                    <option value="showdown">Showdown (1 CPT + 5 FLEX)</option>
                    <option value="classic">Classic (QB/RB/WR/TE/K/DEF)</option>
                    <option value="turbo">Turbo (3 FLEX positions)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="sport-selection">Sport</Label>
                  <select 
                    id="sport-selection"
                    value={selectedSport} 
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="sport-selection-select"
                  >
                    <option value="nfl">🏈 NFL Football</option>
                    <option value="nba">🏀 NBA Basketball</option>
                    <option value="nhl">🏒 NHL Hockey</option>
                    <option value="soccer">⚽ Soccer</option>
                  </select>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Player Salary System</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Elite players: $9,000-$12,000</li>
                    <li>• Mid-tier players: $6,000-$8,999</li>
                    <li>• Value players: $4,000-$5,999</li>
                    <li>• Budget players: $3,000-$3,999</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Slate Timing & Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 w-5 mr-2" />
                  Contest Schedule & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="slate-time">Slate Timing</Label>
                  <select 
                    id="slate-time"
                    value={slateTime} 
                    onChange={(e) => setSlateTime(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md bg-white text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="slate-time-select"
                  >
                    <option value="morning">🌅 Morning Slate (9:00 AM - 12:00 PM EST)</option>
                    <option value="afternoon">☀️ Afternoon Slate (1:00 PM - 4:00 PM EST)</option>
                    <option value="evening">🌙 Evening Slate (7:00 PM - 11:00 PM EST)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose when your contest games will be played
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="public-contest" className="text-sm font-medium">
                      Make Contest Public
                    </Label>
                    <p className="text-xs text-gray-600">
                      {isPublic ? '🌍 Anyone can discover and join this contest' : '🔒 Only people with invite links can join'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-gray-500" />}
                    <Switch
                      id="public-contest"
                      checked={isPublic}
                      onCheckedChange={setIsPublic}
                      data-testid="public-contest-toggle"
                    />
                  </div>
                </div>

                {isPublic && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🌍 International Competition</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Your contest will appear in the global contest directory</li>
                      <li>• Players from any country can join and compete</li>
                      <li>• Perfect for building an international fantasy community</li>
                      <li>• Example: Compete with fantasy players from France, Mexico, Canada!</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateContest}
              disabled={isCreating || !contestName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3"
              data-testid="create-contest-button"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating Contest...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Create Daily Fantasy Contest
                </>
              )}
            </Button>
          </div>

          {/* Preview & Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-800">Daily Fantasy Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-blue-700">
                  <Clock className="w-4 h-4 mr-2" />
                  Short-term fantasy competition
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>How it works:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Draft players within salary cap constraints</li>
                    <li>Each player has a salary based on expected performance</li>
                    <li>Build optimal lineup staying under the cap</li>
                    <li>Compete for duration of contest period</li>
                    <li>Highest scoring lineup wins</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contest Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Contest Name:</span>
                    <p className="text-gray-600">{contestName || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Salary Cap:</span>
                    <p className="text-gray-600">${parseInt(salaryCap).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p className="text-gray-600 capitalize">{contestDuration.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Max Entries:</span>
                    <p className="text-gray-600">{maxEntries === 'unlimited' ? 'Unlimited' : `${maxEntries} players`}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <span className="font-medium text-sm">Commissioner:</span>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
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