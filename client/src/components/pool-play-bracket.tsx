import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Users, 
  ArrowRight, 
  Target, 
  Award, 
  TrendingUp, 
  ArrowUpDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { BracketGenerator, type TeamRecord } from '@/utils/bracket-generator';
import { StageTransitionEngine, type TeamStanding } from '@shared/stage-transition-engine';
import { type Pool, type TiebreakerRule, professionalTournamentFormats } from '@shared/multi-stage-schema';
import MatchUpdateModal from './match-update-modal';

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  team1?: string;
  team2?: string;
  team1Score: number;
  team2Score: number;
  winner?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  poolId?: string;
}

interface Tournament {
  id: string;
  name: string;
  teamSize: number;
  tournamentType: string;
  status: string;
  teams: { teamName: string }[];
  stageConfiguration?: {
    currentStage: number;
    totalStages: number;
    poolConfiguration?: {
      poolCount: number;
      teamsPerPool: number;
      poolNamingScheme: 'letters' | 'numbers' | 'custom';
      balancedGroups: boolean;
    };
    advancementRules?: {
      advancementType: string;
      teamsAdvancingPerPool?: number;
      wildcardSpots?: number;
    };
    tiebreakers?: TiebreakerRule[];
  };
}

interface PoolPlayBracketProps {
  tournament: Tournament;
  stageNumber?: number;
  onAdvancement?: (results: any) => void;
}

interface EnhancedPool extends Pool {
  completionPercentage: number;
  advancementCalculated: boolean;
  poolSettings?: {
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    allowDraws: boolean;
  };
}

export default function PoolPlayBracket({ 
  tournament, 
  stageNumber = 1, 
  onAdvancement 
}: PoolPlayBracketProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pools');
  const [showAdvancementDialog, setShowAdvancementDialog] = useState(false);
  const [advancementPreview, setAdvancementPreview] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", tournament.id],
  });

  // Professional tournament configuration from schema
  const poolConfig = tournament.stageConfiguration?.poolConfiguration || {
    poolCount: 4,
    teamsPerPool: 4,
    poolNamingScheme: 'letters' as const,
    balancedGroups: true,
  };

  const advancementRules = tournament.stageConfiguration?.advancementRules || {
    advancementType: 'top-n-per-pool',
    teamsAdvancingPerPool: 2,
    wildcardSpots: 0,
  };

  const tiebreakers: TiebreakerRule[] = tournament.stageConfiguration?.tiebreakers || [
    { method: "head-to-head-record", priority: 1, description: "Head-to-head record" },
    { method: "point-differential", priority: 2, description: "Point differential" },
    { method: "total-points-scored", priority: 3, description: "Total points scored" },
  ];

  const updateMatchMutation = useMutation({
    mutationFn: async (matchData: { 
      matchId: string; 
      team1Score: number; 
      team2Score: number; 
      winner: string; 
      status: string;
      isDraw?: boolean;
    }) => {
      const response = await apiRequest(`/api/matches/${matchData.matchId}`, "PATCH", matchData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches", tournament.id] });
      toast({
        title: "Match Updated",
        description: "Score and result have been saved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not save match result. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateAdvancementMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/tournaments/${tournament.id}/calculate-advancement`, "POST", {
        stageNumber,
        advancementRules,
        tiebreakers,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAdvancementPreview(data);
      setShowAdvancementDialog(true);
    },
    onError: () => {
      toast({
        title: "Calculation Failed",
        description: "Could not calculate advancement. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Enhanced pool management with professional features
  const enhancedPools: EnhancedPool[] = useMemo(() => {
    if (isLoading) return [];
    
    const poolMatches = matches.filter(m => m.poolId);
    const poolIds = [...new Set(poolMatches.map(m => m.poolId))].filter(Boolean) as string[];
    
    return poolIds.map((poolId, index) => {
      const poolMatchesFiltered = poolMatches.filter(m => m.poolId === poolId);
      const poolTeams = [...new Set([
        ...poolMatchesFiltered.map(m => m.team1),
        ...poolMatchesFiltered.map(m => m.team2)
      ])].filter(Boolean) as string[];

      // Convert matches to Pool format for StageTransitionEngine
      const poolData: Pool = {
        poolId,
        poolName: poolConfig.poolNamingScheme === 'letters' 
          ? `Pool ${String.fromCharCode(65 + index)}`
          : `Pool ${index + 1}`,
        poolIndex: index,
        teams: poolTeams,
        maxTeams: poolConfig.teamsPerPool,
        standings: [],
        matches: poolMatchesFiltered.map(m => ({
          matchId: m.id,
          team1: m.team1 || '',
          team2: m.team2 || '',
          team1Score: m.team1Score,
          team2Score: m.team2Score,
          winner: m.winner || null,
          isDraw: false, // TODO: Add draw support
          round: m.round,
          completed: m.status === 'completed',
          status: m.status === 'upcoming' ? 'scheduled' as const :
                  m.status === 'in-progress' ? 'in-progress' as const :
                  'completed' as const,
        })),
        isComplete: false,
        completionPercentage: 0,
        advancementCalculated: false,
        poolSettings: {
          pointsPerWin: 3,
          pointsPerDraw: 1,
          pointsPerLoss: 0,
          allowDraws: false,
          tiebreakingOrder: tiebreakers.map(t => t.method),
        },
      };

      // Calculate professional standings with tiebreakers
      const professionalStandings = StageTransitionEngine.calculatePoolStandings(poolData, tiebreakers);
      
      // Calculate completion percentage
      const totalMatches = poolMatchesFiltered.length;
      const completedMatches = poolMatchesFiltered.filter(m => m.status === 'completed').length;
      const completionPercentage = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
      
      return {
        ...poolData,
        completionPercentage,
        standings: professionalStandings.map(standing => ({
          team: standing.team,
          wins: standing.wins,
          losses: standing.losses,
          pointsFor: standing.gamePoints,
          pointsAgainst: standing.pointsAllowed,
          pointDifferential: standing.pointDifferential,
          gamesPlayed: standing.matchesPlayed,
        })),
        advancementCalculated: completionPercentage === 100,
      };
    });
  }, [matches, isLoading, poolConfig, tiebreakers]);

  // Calculate overall tournament progress
  const overallProgress = useMemo(() => {
    if (enhancedPools.length === 0) return 0;
    
    const totalProgress = enhancedPools.reduce((sum, pool) => sum + pool.completionPercentage, 0);
    return totalProgress / enhancedPools.length;
  }, [enhancedPools]);

  // Check if ready for advancement
  const readyForAdvancement = useMemo(() => {
    return enhancedPools.length > 0 && enhancedPools.every(pool => pool.completionPercentage === 100);
  }, [enhancedPools]);

  // Handle advancement calculation
  const handleCalculateAdvancement = async () => {
    if (!readyForAdvancement) {
      toast({
        title: "Not Ready",
        description: "All pool matches must be completed before calculating advancement.",
        variant: "destructive",
      });
      return;
    }

    calculateAdvancementMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Group bracket matches by round
  const bracketRounds = bracketMatches.reduce((acc, match) => {
    if (!acc[match.round]) acc[match.round] = [];
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const handleMatchClick = (match: Match) => {
    if (match.team1 && match.team2) {
      setSelectedMatch(match);
      setIsModalOpen(true);
    }
  };

  const getMatchBorderColor = (match: Match) => {
    if (match.status === 'completed') return 'border-green-500';
    if (match.status === 'in-progress') return 'border-yellow-500';
    return 'border-gray-300';
  };

  const getTeamStyle = (match: Match, team: 'team1' | 'team2') => {
    if (match.status === 'completed' && match.winner) {
      const teamName = team === 'team1' ? match.team1 : match.team2;
      const isWinner = teamName === match.winner;
      return {
        fontWeight: isWinner ? 'bold' : 'normal',
        color: isWinner ? '#16a34a' : '#6b7280',
        borderLeft: `4px solid ${isWinner ? '#16a34a' : '#d1d5db'}`
      };
    }
    return { borderLeft: '4px solid #d1d5db' };
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}.`;
    }
  };

  const getRoundName = (round: number) => {
    const totalRounds = Math.max(...bracketMatches.map(m => m.round));
    const roundsFromEnd = totalRounds - round + 1;
    switch (roundsFromEnd) {
      case 1: return "Championship";
      case 2: return "Semifinals";
      case 3: return "Quarterfinals";
      default: return `Round ${round - 1}`; // Subtract 1 since pool play is round 1
    }
  };

  return (
    <div className="space-y-6" data-testid="pool-play-bracket">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pools" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pool Play
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Standings
          </TabsTrigger>
          <TabsTrigger value="bracket" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Elimination Bracket
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {pools.map((pool) => (
              <Card key={pool.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {pool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pool.matches
                      .sort((a, b) => a.position - b.position)
                      .map((match) => (
                        <div
                          key={match.id}
                          className={`bg-gray-50 rounded-lg p-3 border-2 ${getMatchBorderColor(match)} ${
                            match.team1 && match.team2 ? 'cursor-pointer hover:shadow-md' : ''
                          } transition-all`}
                          onClick={() => handleMatchClick(match)}
                          data-testid={`pool-match-${match.id}`}
                        >
                          <div className="space-y-2">
                            <div 
                              className="flex justify-between items-center p-2 bg-white rounded"
                              style={getTeamStyle(match, 'team1')}
                            >
                              <span className="flex-1">
                                {match.team1 || 'TBD'}
                              </span>
                              <span className="font-bold">
                                {match.status === 'upcoming' ? '-' : match.team1Score}
                              </span>
                            </div>
                            
                            <div 
                              className="flex justify-between items-center p-2 bg-white rounded"
                              style={getTeamStyle(match, 'team2')}
                            >
                              <span className="flex-1">
                                {match.team2 || 'TBD'}
                              </span>
                              <span className="font-bold">
                                {match.status === 'upcoming' ? '-' : match.team2Score}
                              </span>
                            </div>
                            
                            {match.status === 'completed' && match.winner && (
                              <div className="text-center text-sm text-green-600 font-medium">
                                Winner: {match.winner}
                              </div>
                            )}
                            
                            <div className="flex justify-center">
                              <Badge variant={
                                match.status === 'completed' ? 'default' : 
                                match.status === 'in-progress' ? 'secondary' : 'outline'
                              }>
                                {match.status === 'upcoming' ? 'Upcoming' :
                                 match.status === 'in-progress' ? 'In Progress' : 'Completed'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="standings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {pools.map((pool) => (
              <Card key={pool.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {pool.name} Standings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pos</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead>W-L</TableHead>
                        <TableHead>PF</TableHead>
                        <TableHead>PA</TableHead>
                        <TableHead>Diff</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pool.standings.map((team, index) => (
                        <TableRow 
                          key={team.team}
                          className={index < 2 ? 'bg-green-50' : ''}
                          data-testid={`standings-${pool.id}-${team.team}`}
                        >
                          <TableCell className="font-medium">
                            {getPositionIcon(index + 1)}
                          </TableCell>
                          <TableCell className={index < 2 ? 'font-bold text-green-700' : ''}>
                            {team.team}
                            {index < 2 && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Advances
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{team.wins}-{team.losses}</TableCell>
                          <TableCell>{team.pointsFor}</TableCell>
                          <TableCell>{team.pointsAgainst}</TableCell>
                          <TableCell className={team.pointDifferential >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {team.pointDifferential >= 0 ? '+' : ''}{team.pointDifferential}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bracket" className="space-y-6">
          {bracketMatches.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Elimination Bracket
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Top 2 from each pool advance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Object.keys(bracketRounds).length}, 1fr)` }}>
                  {Object.entries(bracketRounds)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([round, roundMatches]) => (
                      <div key={round} className="space-y-4">
                        <div className="text-center">
                          <h3 className="font-semibold text-lg">{getRoundName(parseInt(round))}</h3>
                          <p className="text-sm text-gray-600">Round {parseInt(round) - 1}</p>
                        </div>
                        
                        <div className="space-y-3">
                          {roundMatches
                            .sort((a, b) => a.position - b.position)
                            .map((match) => (
                              <div
                                key={match.id}
                                className={`${parseInt(round) === Math.max(...bracketMatches.map(m => m.round)) ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400' : 'bg-gray-50'} rounded-lg p-3 border-2 ${getMatchBorderColor(match)} ${
                                  match.team1 && match.team2 ? 'cursor-pointer hover:shadow-md' : ''
                                } transition-all`}
                                onClick={() => handleMatchClick(match)}
                                data-testid={`bracket-match-${match.id}`}
                              >
                                <div className="space-y-2">
                                  <div 
                                    className="flex justify-between items-center p-2 bg-white rounded"
                                    style={getTeamStyle(match, 'team1')}
                                  >
                                    <span className="flex-1">
                                      {match.team1 || 'TBD'}
                                    </span>
                                    <span className="font-bold">
                                      {match.status === 'upcoming' ? '-' : match.team1Score}
                                    </span>
                                  </div>
                                  
                                  <div 
                                    className="flex justify-between items-center p-2 bg-white rounded"
                                    style={getTeamStyle(match, 'team2')}
                                  >
                                    <span className="flex-1">
                                      {match.team2 || 'TBD'}
                                    </span>
                                    <span className="font-bold">
                                      {match.status === 'upcoming' ? '-' : match.team2Score}
                                    </span>
                                  </div>
                                  
                                  {match.status === 'completed' && match.winner && (
                                    <div className="text-center text-sm text-green-600 font-medium">
                                      Winner: {match.winner}
                                    </div>
                                  )}
                                  
                                  <div className="flex justify-center">
                                    <Badge variant={
                                      match.status === 'completed' ? 'default' : 
                                      match.status === 'in-progress' ? 'secondary' : 'outline'
                                    }>
                                      {match.status === 'upcoming' ? 'Upcoming' :
                                       match.status === 'in-progress' ? 'In Progress' : 'Completed'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Elimination Bracket</h3>
                <p className="text-gray-600">
                  Complete pool play matches to advance teams to the elimination bracket
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Match Update Modal */}
      {selectedMatch && (
        <MatchUpdateModal
          match={selectedMatch}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedMatch(null);
          }}
          onUpdate={(matchData) => updateMatchMutation.mutate(matchData)}
          isLoading={updateMatchMutation.isPending}
        />
      )}
    </div>
  );
}