import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Users, Settings, Swords, Target } from 'lucide-react';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { useToast } from '@/hooks/use-toast';

export default function HeadToHeadCreator() {
  const [location, setLocation] = useLocation();
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [tournamentName, setTournamentName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('16');
  const [tournamentFormat, setTournamentFormat] = useState('single-elimination');
  const [matchupDuration, setMatchupDuration] = useState('weekly');
  const [scoringSystem, setScoringSystem] = useState('standard');
  const [isCreating, setIsCreating] = useState(false);

  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to create a head-to-head tournament.
            </p>
            <Button onClick={() => setLocation('/fantasy-tournaments')}>
              Go to Fantasy Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateTournament = async () => {
    if (!tournamentName.trim()) {
      toast({
        title: "Tournament Name Required",
        description: "Please enter a name for your head-to-head tournament.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const tournamentId = `h2h-${Date.now()}`;
      
      toast({
        title: "Head-to-Head Tournament Created!",
        description: `${tournamentName} has been created successfully.`,
      });
      
      setLocation(`/fantasy/league/${tournamentId}`);
      
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "There was an error creating your tournament. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
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
                <Trophy className="h-8 w-8 text-red-600 mr-3" />
                Create Head-to-Head Tournament
              </h1>
              <p className="text-gray-600 mt-1">
                Set up direct 1v1 fantasy matchup competitions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-red-600 text-white">
              <Users className="w-4 h-4 mr-1" />
              Commissioner: {fantasyUser?.email?.split('@')[0]}
            </Badge>
            <Badge variant="outline" className="text-red-600 border-red-600">
              ⚔️ Head-to-Head Format
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-600">
              FREE - No Entry Fees
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tournament Setup Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 w-5 mr-2" />
                  Tournament Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tournament-name">Tournament Name *</Label>
                  <Input
                    id="tournament-name"
                    placeholder="e.g., Office Fantasy Showdown"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    data-testid="tournament-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="max-players">Tournament Size</Label>
                  <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                    <SelectTrigger data-testid="max-players-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Players</SelectItem>
                      <SelectItem value="8">8 Players</SelectItem>
                      <SelectItem value="16">16 Players</SelectItem>
                      <SelectItem value="32">32 Players</SelectItem>
                      <SelectItem value="64">64 Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tournament-format">Tournament Format</Label>
                  <Select value={tournamentFormat} onValueChange={setTournamentFormat}>
                    <SelectTrigger data-testid="tournament-format-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-elimination">Single Elimination</SelectItem>
                      <SelectItem value="double-elimination">Double Elimination</SelectItem>
                      <SelectItem value="round-robin">Round Robin</SelectItem>
                      <SelectItem value="swiss-system">Swiss System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="matchup-duration">Matchup Duration</Label>
                  <Select value={matchupDuration} onValueChange={setMatchupDuration}>
                    <SelectTrigger data-testid="matchup-duration-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-game">Single Game</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 w-5 mr-2" />
                  Scoring & Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scoring-system">Scoring System</Label>
                  <Select value={scoringSystem} onValueChange={setScoringSystem}>
                    <SelectTrigger data-testid="scoring-system-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Fantasy Scoring</SelectItem>
                      <SelectItem value="ppr">PPR (Point Per Reception)</SelectItem>
                      <SelectItem value="half-ppr">Half PPR</SelectItem>
                      <SelectItem value="salary-cap">Salary Cap + Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Head-to-Head Rules</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Direct 1v1 matchups each round</li>
                    <li>• Higher scoring lineup wins the matchup</li>
                    <li>• Advance through tournament bracket</li>
                    <li>• Real-time head-to-head competition</li>
                    <li>• Winner takes all format</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleCreateTournament}
              disabled={isCreating || !tournamentName.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-3"
              data-testid="create-tournament-button"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating Tournament...
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Create Head-to-Head Tournament
                </>
              )}
            </Button>
          </div>

          {/* Preview & Info */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Head-to-Head Format</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-red-700">
                  <Swords className="w-4 h-4 mr-2" />
                  Direct 1v1 fantasy competition
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>How it works:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Face one opponent directly each round</li>
                    <li>Both players draft lineups for the matchup</li>
                    <li>Higher total score wins the head-to-head</li>
                    <li>Winner advances in tournament bracket</li>
                    <li>Intense 1v1 competitive format</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournament Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tournament Name:</span>
                    <p className="text-gray-600">{tournamentName || 'Not set'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Players:</span>
                    <p className="text-gray-600">{maxPlayers} players</p>
                  </div>
                  <div>
                    <span className="font-medium">Format:</span>
                    <p className="text-gray-600 capitalize">{tournamentFormat.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium">Matchup Length:</span>
                    <p className="text-gray-600 capitalize">{matchupDuration.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <span className="font-medium text-sm">Commissioner:</span>
                  <div className="flex items-center mt-1">
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
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