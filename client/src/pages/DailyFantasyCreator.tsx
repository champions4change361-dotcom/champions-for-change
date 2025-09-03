import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Users, Settings, DollarSign, Clock } from 'lucide-react';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { useToast } from '@/hooks/use-toast';

export default function DailyFantasyCreator() {
  const [location, setLocation] = useLocation();
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [contestName, setContestName] = useState('');
  const [salaryCap, setSalaryCap] = useState('50000');
  const [maxEntries, setMaxEntries] = useState('100');
  const [contestDuration, setContestDuration] = useState('weekly');
  const [rosterFormat, setRosterFormat] = useState('standard');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-600 text-white">
              <Users className="w-4 h-4 mr-1" />
              Commissioner: {fantasyUser?.email?.split('@')[0]}
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              💰 Daily Fantasy Format
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              FREE - No Entry Fees
            </Badge>
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
                  <Select value={salaryCap} onValueChange={setSalaryCap}>
                    <SelectTrigger data-testid="salary-cap-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="40000">$40,000</SelectItem>
                      <SelectItem value="50000">$50,000 (Standard)</SelectItem>
                      <SelectItem value="60000">$60,000</SelectItem>
                      <SelectItem value="75000">$75,000 (High Cap)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max-entries">Max Participants</Label>
                  <Select value={maxEntries} onValueChange={setMaxEntries}>
                    <SelectTrigger data-testid="max-entries-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25 Participants</SelectItem>
                      <SelectItem value="50">50 Participants</SelectItem>
                      <SelectItem value="100">100 Participants</SelectItem>
                      <SelectItem value="200">200 Participants</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contest-duration">Contest Duration</Label>
                  <Select value={contestDuration} onValueChange={setContestDuration}>
                    <SelectTrigger data-testid="contest-duration-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-game">Single Game</SelectItem>
                      <SelectItem value="daily">Daily (1 Day)</SelectItem>
                      <SelectItem value="weekly">Weekly (NFL Week)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Select value={rosterFormat} onValueChange={setRosterFormat}>
                    <SelectTrigger data-testid="roster-format-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (QB/RB/RB/WR/WR/TE/FLEX/DEF)</SelectItem>
                      <SelectItem value="showdown">Showdown (1 CPT + 5 FLEX)</SelectItem>
                      <SelectItem value="classic">Classic (QB/RB/WR/TE/K/DEF)</SelectItem>
                      <SelectItem value="turbo">Turbo (3 FLEX positions)</SelectItem>
                    </SelectContent>
                  </Select>
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