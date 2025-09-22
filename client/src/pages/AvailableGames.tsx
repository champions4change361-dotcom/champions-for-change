import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface AvailableContest {
  contestName: string;
  team1: string;
  team2: string;
  gameDescription: string;
  gameDate: string;
  maxEntries: number;
  prizePool: string;
  captainMultiplier: string;
  flexPositions: number;
  totalLineupSize: number;
  lineupLockTime: string;
}

export default function AvailableGames() {
  const { toast } = useToast();
  const [claiming, setClaiming] = useState<string | null>(null);

  // Fetch available prime time contests
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/fantasy/available-contests'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Mutation to claim a contest (add to dashboard)
  const claimContestMutation = useMutation({
    mutationFn: async (contestData: AvailableContest) => {
      const response = await fetch('/api/fantasy/claim-contest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contestData }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to claim contest');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Contest Added! 🎉",
        description: `${data.contest.contestName} has been added to your dashboard.`,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/fantasy/available-contests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fantasy/showdown-contests'] });
      
      setClaiming(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Contest",
        description: error.message || "There was an error adding the contest to your dashboard.",
        variant: "destructive",
      });
      setClaiming(null);
    }
  });

  const handleClaimContest = async (contest: AvailableContest) => {
    setClaiming(contest.contestName);
    claimContestMutation.mutate(contest);
  };

  const formatGameTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }) + ' at ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'TBD';
    }
  };

  const formatLockTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'TBD';
    }
  };

  const getContestIcon = (contestName: string) => {
    if (contestName.includes('Monday')) return '🏈';
    if (contestName.includes('Thursday')) return '⚡';
    if (contestName.includes('Sunday')) return '🌟';
    return '🏈';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Available Prime Time Games</h1>
              <p className="text-gray-200 font-medium">
                Select from our pre-created showdown contests for Monday Night, Thursday Night, and Sunday Night Football.
              </p>
            </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4 text-white">Unable to Load Games</h1>
            <p className="text-gray-200 font-medium mb-6">
              We're having trouble loading the available contests. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const contests = (data as any)?.contests || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white" data-testid="text-page-title">
              Available Prime Time Games
            </h1>
            <p className="text-gray-200 font-medium">
              Select from our pre-created showdown contests for Monday Night, Thursday Night, and Sunday Night Football.
              Once you add a contest to your dashboard, you can share the link with friends to join and compete!
            </p>
          </div>

        {contests.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <div className="mb-4">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Prime Time Games Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There are currently no Monday Night, Thursday Night, or Sunday Night Football games ready for contests.
                Check back soon for upcoming prime time matchups!
              </p>
              <Badge variant="outline">
                Prime time games are automatically created each week
              </Badge>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="grid-available-contests">
            {contests.map((contest: AvailableContest, index: number) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" data-testid={`text-contest-name-${index}`}>
                    <span>{getContestIcon(contest.contestName)}</span>
                    {contest.contestName}
                  </CardTitle>
                  <CardDescription data-testid={`text-game-description-${index}`}>
                    {contest.gameDescription}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span data-testid={`text-game-time-${index}`}>
                      {formatGameTime(contest.gameDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span data-testid={`text-lock-time-${index}`}>
                      Lineups lock at {formatLockTime(contest.lineupLockTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    <span>Max {contest.maxEntries} entries</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Trophy className="h-4 w-4" />
                    <span>{contest.prizePool}</span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">
                      Captain {contest.captainMultiplier}x
                    </Badge>
                    <Badge variant="outline">
                      {contest.totalLineupSize} players
                    </Badge>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handleClaimContest(contest)}
                    disabled={claiming === contest.contestName || claimContestMutation.isPending}
                    className="w-full"
                    data-testid={`button-add-contest-${index}`}
                  >
                    {claiming === contest.contestName ? (
                      <>Adding to Dashboard...</>
                    ) : (
                      <>Add to My Dashboard</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-8 p-4 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
          <h3 className="font-bold mb-2 text-white">How It Works:</h3>
          <div className="text-sm text-gray-200 font-medium space-y-1">
            <p>1. <strong className="text-white">Select a Game:</strong> Choose from Monday Night, Thursday Night, or Sunday Night Football</p>
            <p>2. <strong className="text-white">Add to Dashboard:</strong> Click "Add to My Dashboard" to claim the contest</p>
            <p>3. <strong className="text-white">Share with Friends:</strong> Get a shareable link to invite others to join</p>
            <p>4. <strong className="text-white">Captain Mode:</strong> Pick 6 players (1 Captain + 5 FLEX) from both teams</p>
            <p>5. <strong className="text-white">Compete:</strong> Captain gets {contests[0]?.captainMultiplier || '1.5'}x points, highest score wins!</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}