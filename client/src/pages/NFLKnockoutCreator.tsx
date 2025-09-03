import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Users, Settings, Shield, Calendar } from 'lucide-react';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { useToast } from '@/hooks/use-toast';

export default function NFLKnockoutCreator() {
  const [location, setLocation] = useLocation();
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [leagueName, setLeagueName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [startWeek, setStartWeek] = useState('1');
  const [eliminationRule, setEliminationRule] = useState('single-loss');
  const [pickDeadline, setPickDeadline] = useState('sunday-1pm');
  const [isCreating, setIsCreating] = useState(false);

  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to create an NFL knockout league.
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
        description: "Please enter a name for your NFL knockout league.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const leagueId = `knockout-${Date.now()}`;
      
      toast({
        title: "NFL Knockout League Created!",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
                <Trophy className="h-8 w-8 text-green-600 mr-3" />
                Create NFL Knockout League
              </h1>
              <p className="text-gray-600 mt-1">
                Set up elimination-style survivor pool based on team performance
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-600 text-white">
              <Users className="w-4 h-4 mr-1" />
              Commissioner: {fantasyUser?.email?.split('@')[0]}
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              🏈 NFL Knockout Format
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
                    placeholder="e.g., Office NFL Survivor Pool"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    data-testid="league-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="max-participants">Max Participants</Label>
                  <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                    <SelectTrigger data-testid="max-participants-select">
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
                  <Label htmlFor="start-week">Starting Week</Label>
                  <Select value={startWeek} onValueChange={setStartWeek}>
                    <SelectTrigger data-testid="start-week-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Week 1</SelectItem>
                      <SelectItem value="2">Week 2</SelectItem>
                      <SelectItem value="3">Week 3</SelectItem>
                      <SelectItem value="4">Week 4</SelectItem>
                      <SelectItem value="5">Week 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="pick-deadline">Pick Deadline</Label>
                  <Select value={pickDeadline} onValueChange={setPickDeadline}>
                    <SelectTrigger data-testid="pick-deadline-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thursday-8pm">Thursday 8:00 PM ET</SelectItem>
                      <SelectItem value="sunday-1pm">Sunday 1:00 PM ET</SelectItem>
                      <SelectItem value="sunday-kickoff">Each Game Kickoff</SelectItem>
                      <SelectItem value="saturday-midnight">Saturday Midnight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 w-5 mr-2" />
                  Elimination Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="elimination-rule">Elimination Type</Label>
                  <Select value={eliminationRule} onValueChange={setEliminationRule}>
                    <SelectTrigger data-testid="elimination-rule-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-loss">Single Loss (Standard)</SelectItem>
                      <SelectItem value="double-elimination">Double Elimination</SelectItem>
                      <SelectItem value="strike-system">3-Strike System</SelectItem>
                      <SelectItem value="margin-of-victory">Margin of Victory Tiebreaker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Knockout Rules</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Pick one NFL team each week to WIN</li>
                    <li>• Can only use each team ONCE per season</li>
                    <li>• Wrong pick = elimination (or strike)</li>
                    <li>• Last person standing wins!</li>
                    <li>• Based on actual NFL team performance</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateLeague}
              disabled={isCreating || !leagueName.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3"
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
                  Create NFL Knockout League
                </>
              )}
            </Button>
          </div>

          {/* Preview & Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">NFL Knockout Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-green-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Season-long elimination competition
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>How it works:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Pick one NFL team to WIN each week</li>
                    <li>Each team can only be used once all season</li>
                    <li>If your team loses, you're eliminated</li>
                    <li>Strategy: Save good teams for later weeks</li>
                    <li>No player salaries - pure team performance</li>
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
                    <span className="font-medium">Max Players:</span>
                    <p className="text-gray-600">{maxParticipants === 'unlimited' ? 'Unlimited' : `${maxParticipants} players`}</p>
                  </div>
                  <div>
                    <span className="font-medium">Start Week:</span>
                    <p className="text-gray-600">NFL Week {startWeek}</p>
                  </div>
                  <div>
                    <span className="font-medium">Elimination:</span>
                    <p className="text-gray-600 capitalize">{eliminationRule.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <span className="font-medium text-sm">Commissioner:</span>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
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