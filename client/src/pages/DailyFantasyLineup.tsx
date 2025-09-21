import { useParams, useLocation } from 'wouter';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { useCurrentWeek } from '@/hooks/useCurrentWeek';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users } from 'lucide-react';
import { DailyFantasyLineupBuilder } from '@/components/DailyFantasyLineupBuilder';
import { useToast } from '@/hooks/use-toast';

export default function DailyFantasyLineup() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { currentWeek, byeTeams } = useCurrentWeek();
  const { toast } = useToast();
  
  const leagueId = params.leagueId;
  const sport = 'nfl'; // Default to NFL, could be dynamic later
  
  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to access your daily fantasy lineup.
            </p>
            <Button onClick={() => setLocation('/fantasy-tournaments')}>
              Go to Fantasy Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLineupSubmit = (lineup: any[]) => {
    // In a real app, this would save to backend
    console.log('Submitting lineup:', lineup);
    toast({
      title: "Lineup Submitted!",
      description: "Your daily fantasy lineup has been submitted for this week.",
    });
    
    // Redirect back to league dashboard
    setLocation(`/fantasy/league/${leagueId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/fantasy/league/${leagueId}`)}
                data-testid="back-to-league"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to League
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Trophy className="h-8 w-8 text-green-600 mr-3" />
                  Daily Fantasy Lineup
                </h1>
                <p className="text-gray-600 mt-1">
                  Build your lineup within the $50K salary cap
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-purple-600 text-white">
                <Users className="w-4 h-4 mr-1" />
                {fantasyUser?.email?.split('@')[0] || 'Player'}
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                NFL Week {currentWeek}
              </Badge>
            </div>
          </div>
        </div>

        {/* Lineup Builder */}
        <DailyFantasyLineupBuilder
          leagueId={leagueId || ''}
          sport={sport}
          contestWeek={currentWeek}
          byeTeams={byeTeams}
          onLineupSubmit={handleLineupSubmit}
        />
      </div>
    </div>
  );
}