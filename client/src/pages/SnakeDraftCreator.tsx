import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Users, Settings, Calendar, Target } from 'lucide-react';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { useToast } from '@/hooks/use-toast';

export default function SnakeDraftCreator() {
  const [location, setLocation] = useLocation();
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [leagueName, setLeagueName] = useState('');
  const [maxTeams, setMaxTeams] = useState('12');
  const [draftDate, setDraftDate] = useState('');
  const [draftTime, setDraftTime] = useState('');
  const [scoringFormat, setScoringFormat] = useState('standard');
  const [rosterFormat, setRosterFormat] = useState('standard');
  const [isCreating, setIsCreating] = useState(false);

  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to create a snake draft league.
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
        description: "Please enter a name for your snake draft league.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // Simulate league creation (in real app, this would hit the backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const leagueId = `snake-${Date.now()}`;
      
      toast({
        title: "Snake Draft League Created!",
        description: `${leagueName} has been created successfully.`,
      });
      
      // Redirect to the new league dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
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
                <Trophy className="h-8 w-8 text-purple-600 mr-3" />
                Create Snake Draft League
              </h1>
              <p className="text-gray-600 mt-1">
                Set up your season-long fantasy league with traditional snake draft
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-purple-600 text-white">
              <Users className="w-4 h-4 mr-1" />
              Commissioner: {fantasyUser?.email?.split('@')[0]}
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600">
              🐍 Snake Draft Format
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
                    placeholder="e.g., Office Championship League"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    data-testid="league-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="max-teams">Number of Teams</Label>
                  <Select value={maxTeams} onValueChange={setMaxTeams}>
                    <SelectTrigger data-testid="max-teams-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 Teams</SelectItem>
                      <SelectItem value="10">10 Teams</SelectItem>
                      <SelectItem value="12">12 Teams</SelectItem>
                      <SelectItem value="14">14 Teams</SelectItem>
                      <SelectItem value="16">16 Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="draft-date">Draft Date</Label>
                    <Input
                      id="draft-date"
                      type="date"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      data-testid="draft-date-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="draft-time">Draft Time</Label>
                    <Input
                      id="draft-time"
                      type="time"
                      value={draftTime}
                      onChange={(e) => setDraftTime(e.target.value)}
                      data-testid="draft-time-input"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 w-5 mr-2" />
                  Scoring & Roster
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scoring-format">Scoring Format</Label>
                  <Select value={scoringFormat} onValueChange={setScoringFormat}>
                    <SelectTrigger data-testid="scoring-format-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Scoring</SelectItem>
                      <SelectItem value="ppr">PPR (Point Per Reception)</SelectItem>
                      <SelectItem value="half-ppr">Half PPR</SelectItem>
                      <SelectItem value="custom">Custom Scoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="roster-format">Roster Format</Label>
                  <Select value={rosterFormat} onValueChange={setRosterFormat}>
                    <SelectTrigger data-testid="roster-format-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (QB/RB/RB/WR/WR/TE/FLEX/DEF/K)</SelectItem>
                      <SelectItem value="superflex">Superflex (2 QB/Superflex)</SelectItem>
                      <SelectItem value="deep">Deep Roster (Extra Bench)</SelectItem>
                      <SelectItem value="custom">Custom Roster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateLeague}
              disabled={isCreating || !leagueName.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg py-3"
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
                  Create Snake Draft League
                </>
              )}
            </Button>
          </div>

          {/* Preview & Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-800">Snake Draft Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-purple-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Season-long fantasy league
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>How it works:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Draft players in snake order (1st pick gets last pick in round 2)</li>
                    <li>Set your lineup each week from drafted players</li>
                    <li>Play head-to-head matchups against other teams</li>
                    <li>Season runs all 18 weeks of NFL regular season</li>
                    <li>Playoffs typically weeks 16-18</li>
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
                    <p className="text-gray-600">{maxTeams} teams</p>
                  </div>
                  <div>
                    <span className="font-medium">Draft:</span>
                    <p className="text-gray-600">
                      {draftDate && draftTime 
                        ? `${new Date(draftDate).toLocaleDateString()} at ${draftTime}`
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Scoring:</span>
                    <p className="text-gray-600 capitalize">{scoringFormat.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <span className="font-medium text-sm">Commissioner:</span>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
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