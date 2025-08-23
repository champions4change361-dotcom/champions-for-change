import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const { data: optimizerResult, isLoading, refetch } = useQuery<OptimizerResult>({
    queryKey: ['/api/dfs/optimize', selectedSite, selectedSport],
    enabled: !!selectedSite && !!selectedSport,
  });

  const handleOptimize = () => {
    refetch();
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
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger data-testid="select-dfs-site">
                  <SelectValue placeholder="Select DFS site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draftkings">DraftKings</SelectItem>
                  <SelectItem value="fanduel">FanDuel</SelectItem>
                  <SelectItem value="yahoo">Yahoo</SelectItem>
                  <SelectItem value="fantasydraft">FantasyDraft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sport</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger data-testid="select-sport">
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nfl">NFL Football</SelectItem>
                  <SelectItem value="nba">NBA Basketball</SelectItem>
                  <SelectItem value="mlb">MLB Baseball</SelectItem>
                  <SelectItem value="nhl">NHL Hockey</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleOptimize} 
                disabled={isLoading || !selectedSite || !selectedSport}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                data-testid="button-optimize-lineups"
              >
                {isLoading ? (
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

              <div className="grid gap-6">
                {optimizerResult.lineups.map((lineup) => (
                  <Card key={lineup.lineup_number} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
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
                    <CardContent>
                      <div className="grid gap-3">
                        {lineup.players.map((player, index) => (
                          <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold">{player.name}</div>
                                <div className="text-sm text-muted-foreground">{player.team}</div>
                              </div>
                              <Badge className={getPositionColor(player.position)}>
                                {player.position}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm">
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

          {!optimizerResult && !isLoading && selectedSite && selectedSport && (
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