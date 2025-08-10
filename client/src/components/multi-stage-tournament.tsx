import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import BracketVisualization from "@/components/bracket-visualization";
import LeaderboardView from "@/components/leaderboard-view";
import { Trophy, Users, ArrowRight, Play, CheckCircle, Clock } from "lucide-react";
import { type Tournament } from "@shared/schema";
import { type Pool, type StageConfiguration } from "@shared/multi-stage-schema";

interface MultiStageTournamentProps {
  tournament: Tournament;
  pools?: Pool[];
}

export default function MultiStageTournament({ tournament, pools = [] }: MultiStageTournamentProps) {
  const [activeTab, setActiveTab] = useState("current-stage");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const stageConfig = tournament.stageConfiguration as StageConfiguration;
  const currentStage = tournament.currentStage || 1;
  const totalStages = tournament.totalStages || 1;
  const currentStageInfo = stageConfig?.stages?.[currentStage - 1];

  const advanceToNextStageMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/tournaments/${tournament.id}/advance-stage`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Stage Advanced",
        description: `Tournament has advanced to the next stage`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournament.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to advance tournament stage",
        variant: "destructive",
      });
    },
  });

  const getStageIcon = (stageNumber: number) => {
    if (stageNumber < currentStage) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (stageNumber === currentStage) return <Play className="h-4 w-4 text-blue-500" />;
    return <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStageStatus = (stageNumber: number) => {
    if (stageNumber < currentStage) return "completed";
    if (stageNumber === currentStage) return "active";
    return "upcoming";
  };

  const renderPoolStandings = (pool: Pool) => (
    <Card key={pool.poolId}>
      <CardHeader>
        <CardTitle className="text-sm">{pool.poolName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center">W</TableHead>
              <TableHead className="text-center">L</TableHead>
              <TableHead className="text-center">Pts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pool.standings
              .sort((a, b) => b.wins - a.wins || b.points - a.points || b.pointDifferential - a.pointDifferential)
              .map((standing, index) => (
                <TableRow key={standing.team}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{standing.team}</TableCell>
                  <TableCell className="text-center">{standing.wins}</TableCell>
                  <TableCell className="text-center">{standing.losses}</TableCell>
                  <TableCell className="text-center">{standing.points}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderCurrentStage = () => {
    if (!currentStageInfo) return <div>No stage configuration available</div>;

    switch (currentStageInfo.stageType) {
      case "pool-play":
      case "round-robin":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pools.map(renderPoolStandings)}
            </div>
            {pools.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pool Play Setup</h3>
                <p className="text-gray-600">Pools will be generated when the tournament starts</p>
              </div>
            )}
          </div>
        );
      
      case "single-elimination":
      case "double-elimination":
        return <BracketVisualization tournament={tournament} />;
      
      case "leaderboard":
        return <LeaderboardView tournament={tournament} />;
      
      case "swiss-system":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Swiss System Rounds</CardTitle>
                <CardDescription>
                  Pairings based on current standings and previous opponents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Swiss Rounds</h3>
                  <p className="text-gray-600">Round pairings will be generated automatically</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return <div>Unknown stage type: {currentStageInfo.stageType}</div>;
    }
  };

  return (
    <div className="space-y-6" data-testid="multi-stage-tournament">
      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tournament Progress
          </CardTitle>
          <CardDescription>
            Multi-stage tournament: {stageConfig?.overallFormat || "Custom Format"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(currentStage / totalStages) * 100} className="w-full" />
            
            {/* Stage Timeline */}
            <div className="flex items-center justify-between">
              {stageConfig?.stages?.map((stage, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    {getStageIcon(index + 1)}
                    <Badge variant={getStageStatus(index + 1) === "active" ? "default" : "secondary"}>
                      Stage {index + 1}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{stage.stageName}</div>
                    <div className="text-xs text-gray-500">{stage.stageType}</div>
                  </div>
                  {index < stageConfig.stages.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 absolute right-[-20px]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current-stage">
            Current Stage: {currentStageInfo?.stageName}
          </TabsTrigger>
          <TabsTrigger value="overall-standings">Overall Standings</TabsTrigger>
          <TabsTrigger value="advancement">Advancement Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="current-stage">
          {renderCurrentStage()}
          
          {currentStage < totalStages && (
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={() => advanceToNextStageMutation.mutate()}
                disabled={advanceToNextStageMutation.isPending}
                size="lg"
                data-testid="button-advance-stage"
              >
                Advance to Next Stage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overall-standings">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Standings</CardTitle>
              <CardDescription>
                Current overall tournament standings across all stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Overall Standings</h3>
                <p className="text-gray-600">Will be calculated based on stage performance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advancement">
          <Card>
            <CardHeader>
              <CardTitle>Advancement Rules</CardTitle>
              <CardDescription>
                How teams advance between tournament stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stageConfig?.stages?.map((stage, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{stage.stageName}</h4>
                      <Badge variant="outline">{stage.stageType}</Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Teams Advancing: {stage.advancementRules.teamsAdvancing}</p>
                      <p>Criteria: {stage.advancementRules.advancementCriteria}</p>
                      {stage.advancementRules.minimumScore && (
                        <p>Minimum Score: {stage.advancementRules.minimumScore}</p>
                      )}
                      {stage.tiebreakers && (
                        <p>Tiebreakers: {stage.tiebreakers.join(", ")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}