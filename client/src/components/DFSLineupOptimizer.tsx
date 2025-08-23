import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Target, DollarSign, TrendingUp, Star, Zap } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  salary: number;
  projected_points: number;
  value: number;
}

interface Lineup {
  lineup_number: number;
  total_salary: number;
  total_points: number;
  players: Player[];
}

interface OptimizerResult {
  success: boolean;
  site: string;
  sport: string;
  lineups: Lineup[];
  optimizer_info: {
    salary_cap: number;
    total_players: number;
    positions: string[];
  };
  source: string;
  num_generated: number;
}

export default function DFSLineupOptimizer() {
  const [selectedSite, setSelectedSite] = useState<string>('draftkings');
  const [selectedSport, setSelectedSport] = useState<string>('nfl');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { data: optimizerResult, isLoading, refetch } = useQuery<OptimizerResult>({
    queryKey: ['/api/dfs/optimize', selectedSite, selectedSport],
    queryFn: () => fetch(`/api/dfs/optimize/${selectedSite}/${selectedSport}`).then(res => res.json()),
    enabled: false, // Don't auto-run, only run when button is clicked
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache results
  });

  const handleOptimize = async () => {
    if (!selectedSite || !selectedSport) return;
    
    setIsOptimizing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error optimizing lineups:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const formatSalary = (salary: number) => {
    return `$${salary.toLocaleString()}`;
  };

  const getPositionColor = (position: string) => {
    const colors: { [key: string]: string } = {
      'QB': 'bg-purple-100 text-purple-800',
      'RB': 'bg-green-100 text-green-800',
      'WR': 'bg-blue-100 text-blue-800',
      'TE': 'bg-orange-100 text-orange-800',
      'DST': 'bg-gray-100 text-gray-800',
      'K': 'bg-yellow-100 text-yellow-800'
    };
    return colors[position] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Professional DFS Lineup Optimizer
          </CardTitle>
          <CardDescription className="text-lg">
            Powered by pydfs-lineup-optimizer - Generate mathematically optimal lineups for DraftKings, FanDuel, and Yahoo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">DFS Site</label>
              <select 
                value={selectedSite} 
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="select-dfs-site"
              >
                <option value="">Select DFS site</option>
                <option value="draftkings">DraftKings</option>
                <option value="fanduel">FanDuel</option>
                <option value="yahoo">Yahoo</option>
                <option value="fantasydraft">FantasyDraft</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sport</label>
              <select 
                value={selectedSport} 
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                data-testid="select-sport"
              >
                <option value="">Select sport</option>
                <option value="nfl">NFL Football</option>
                <option value="nba">NBA Basketball</option>
                <option value="mlb">MLB Baseball</option>
                <option value="nhl">NHL Hockey</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleOptimize} 
                disabled={(isLoading || isOptimizing) || !selectedSite || !selectedSport}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-optimize-lineups"
              >
                {(isLoading || isOptimizing) ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Optimizing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Generate Optimal Lineups
                  </div>
                )}
              </Button>
            </div>
          </div>

          {optimizerResult?.success && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {optimizerResult.num_generated} Optimal Lineups for {optimizerResult.site.toUpperCase()} {optimizerResult.sport.toUpperCase()}
                </h3>
                <div className="text-sm text-muted-foreground">
                  Salary Cap: {formatSalary(optimizerResult.optimizer_info.salary_cap)} • 
                  {optimizerResult.optimizer_info.total_players} Players
                </div>
              </div>

              <div className="space-y-6">
                {optimizerResult.lineups.map((lineup) => (
                  <Card key={lineup.lineup_number} className="border-l-4 border-l-blue-500 w-full overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Star className="h-5 w-5 text-yellow-500" />
                          Lineup #{lineup.lineup_number}
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {lineup.total_points} pts
                            </div>
                            <div className="text-sm text-muted-foreground">Projected</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {formatSalary(lineup.total_salary)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatSalary(optimizerResult.optimizer_info.salary_cap - lineup.total_salary)} left
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      <div className="space-y-3">
                        {lineup.players.map((player, index) => (
                          <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg min-w-0 w-full">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-sm sm:text-base truncate">{player.name}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground">{player.team}</div>
                              </div>
                              <Badge className={`${getPositionColor(player.position)} text-xs flex-shrink-0`}>
                                {player.position}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-shrink-0">
                              <div className="text-right">
                                <div className="font-semibold">{player.projected_points}</div>
                                <div className="text-muted-foreground">pts</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatSalary(player.salary)}</div>
                                <div className="text-muted-foreground">salary</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-green-600">{player.value}x</div>
                                <div className="text-muted-foreground">value</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {optimizerResult && !optimizerResult.success && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Failed to generate optimal lineups. Please try again or select a different sport/site combination.
              </AlertDescription>
            </Alert>
          )}

          {!optimizerResult && !isLoading && !isOptimizing && selectedSite && selectedSport && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                Click "Generate Optimal Lineups" to create mathematically optimized lineups for {selectedSite.toUpperCase()} {selectedSport.toUpperCase()}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}