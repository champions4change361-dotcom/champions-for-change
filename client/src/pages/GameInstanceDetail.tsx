import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Clock, Share2, DollarSign, Target, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import { Leaderboard } from "@/components/Leaderboard";
import type { GameInstance, GameTemplate } from "@shared/game-templates-schema";

interface GameInstanceDetailProps {
  params: {
    instanceId: string;
  };
}

export default function GameInstanceDetail({ params }: GameInstanceDetailProps) {
  const [, setLocation] = useLocation();
  const { instanceId } = params;

  // Fetch game instance details
  const { data: gameInstance, isLoading: instanceLoading } = useQuery<GameInstance>({
    queryKey: ['/api/game-instances', instanceId],
    refetchInterval: 30000 // Refresh every 30 seconds for live status updates
  });

  // Fetch template details
  const { data: template, isLoading: templateLoading } = useQuery<GameTemplate>({
    queryKey: ['/api/game-templates', gameInstance?.templateId],
    enabled: !!gameInstance?.templateId,
  });

  const isLoading = instanceLoading || templateLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!gameInstance) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Game Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The game you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => setLocation("/fantasy/available-games")}>
              Back to Available Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleShareGame = () => {
    const shareUrl = `${window.location.origin}/fantasy/game/${instanceId}`;
    navigator.clipboard.writeText(shareUrl);
    // TODO: Add toast notification
  };

  const config = gameInstance.liveConfig || template?.templateConfig;
  const statusColor = gameInstance.status === 'open' ? 'default' : 
                      gameInstance.status === 'live' ? 'secondary' : 
                      gameInstance.status === 'completed' ? 'outline' : 'destructive';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Game Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl" data-testid="game-title">
                {gameInstance.instanceName || template?.name || 'Fantasy Game'}
              </CardTitle>
              <p className="text-muted-foreground mt-2" data-testid="game-description">
                {template?.description || `${template?.gameType} contest`}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" data-testid="game-type">
                  {template?.gameType?.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="secondary" data-testid="sport-type">
                  {template?.sport?.toUpperCase()}
                </Badge>
                <Badge variant={statusColor} data-testid="game-status">
                  {gameInstance.status?.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Commissioner</div>
              <div className="font-medium" data-testid="commissioner-name">
                {gameInstance.commissionerName || 'Anonymous'}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="font-semibold" data-testid="participant-count">
                  {gameInstance.currentParticipants || 0}/{gameInstance.maxParticipants || config?.maxEntries}
                </p>
              </div>
            </div>
            
            {config?.salaryCap && config.salaryCap > 0 && (
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Salary Cap</p>
                  <p className="font-semibold" data-testid="salary-cap">
                    ${config.salaryCap.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Scoring</p>
                <p className="font-semibold" data-testid="scoring-system">
                  {config?.scoringSystem?.toUpperCase() || 'PPR'}
                </p>
              </div>
            </div>
            
            {gameInstance.lineupDeadline && (
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-semibold text-sm" data-testid="lineup-deadline">
                    {new Date(gameInstance.lineupDeadline).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-4 mt-6">
            <Button 
              onClick={handleShareGame}
              variant="outline"
              className="flex items-center space-x-2"
              data-testid="button-share-game"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Game</span>
            </Button>
            
            <Button 
              onClick={() => setLocation(`/fantasy/lineup/${instanceId}`)}
              disabled={gameInstance.status !== 'open'}
              data-testid="button-join-game"
            >
              {gameInstance.status === 'open' ? 'Submit Lineup' : 
               gameInstance.status === 'live' ? 'Game in Progress' :
               gameInstance.status === 'completed' ? 'Game Completed' : 'Game Closed'}
            </Button>

            {gameInstance.registrationCode && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                <span className="text-sm text-muted-foreground">Code:</span>
                <span className="font-mono font-semibold" data-testid="registration-code">
                  {gameInstance.registrationCode}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="rules" data-testid="tab-rules">
            <Target className="w-4 h-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="schedule" data-testid="tab-schedule">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </TabsTrigger>
        </TabsList>

        {/* Live Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-6">
          <Leaderboard gameInstanceId={instanceId} />
        </TabsContent>

        {/* Game Rules */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Rules & Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Lineup Structure</h3>
                    {config?.rosterFormat && (
                      <div className="space-y-2">
                        {Object.entries(config.rosterFormat).map(([position, count]) => (
                          count > 0 && (
                            <div key={position} className="flex justify-between text-sm">
                              <span>{position}:</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Contest Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Contest Type:</span>
                        <span className="font-medium">{template?.gameType?.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{config?.contestDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scoring System:</span>
                        <span className="font-medium">{config?.scoringSystem?.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Participants:</span>
                        <span className="font-medium">{config?.maxEntries}</span>
                      </div>
                      {config?.entryFee && (
                        <div className="flex justify-between">
                          <span>Entry Fee:</span>
                          <span className="font-medium">${config.entryFee}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {template?.difficulty && (
                  <div>
                    <h3 className="font-semibold mb-2">Difficulty Level</h3>
                    <Badge variant={
                      template.difficulty === 'beginner' ? 'default' :
                      template.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                    }>
                      {template.difficulty}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-2">
                      {template.difficulty === 'beginner' && 'Perfect for new players learning fantasy sports'}
                      {template.difficulty === 'intermediate' && 'Requires some fantasy sports experience'}
                      {template.difficulty === 'advanced' && 'For experienced players seeking a challenge'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Information */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contest Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gameInstance.contestStartTime && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Contest Start</p>
                      <p className="text-sm text-muted-foreground">
                        When the contest begins
                      </p>
                    </div>
                    <p className="font-semibold">
                      {new Date(gameInstance.contestStartTime).toLocaleString()}
                    </p>
                  </div>
                )}

                {gameInstance.lineupDeadline && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Lineup Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        Last chance to submit lineups
                      </p>
                    </div>
                    <p className="font-semibold">
                      {new Date(gameInstance.lineupDeadline).toLocaleString()}
                    </p>
                  </div>
                )}

                {gameInstance.contestEndTime && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Contest End</p>
                      <p className="text-sm text-muted-foreground">
                        When scoring is final
                      </p>
                    </div>
                    <p className="font-semibold">
                      {new Date(gameInstance.contestEndTime).toLocaleString()}
                    </p>
                  </div>
                )}

                {config?.slateTime && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Game Slate</p>
                      <p className="text-sm text-muted-foreground">
                        Recommended game time
                      </p>
                    </div>
                    <p className="font-semibold capitalize">
                      {config.slateTime}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}