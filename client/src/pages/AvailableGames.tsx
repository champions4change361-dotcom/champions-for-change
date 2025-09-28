import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Trophy, Calendar, MapPin, Star, Target, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

interface GameTemplate {
  id: string;
  name: string;
  gameType: string;
  sport: string;
  templateConfig: {
    salaryCap: number;
    rosterFormat: {
      QB: number;
      RB: number;
      WR: number;
      TE: number;
      FLEX: number;
      DEF: number;
      K?: number;
    };
    scoringSystem: string;
    maxEntries: number;
    contestDuration: string;
    slateTime?: string;
    isPublic: boolean;
  };
  description: string;
  difficulty: string;
  estimatedParticipants: number;
  isActive: boolean;
}

interface GameInstance {
  id: string;
  templateId: string;
  commissionerId: string;
  commissionerName: string;
  instanceName: string;
  registrationCode: string;
  status: string;
  liveConfig: GameTemplate['templateConfig'];
  entryLimit: number;
  currentEntries: number;
  lockoutTime?: string;
  createdAt: string;
}

export default function AvailableGames() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [joining, setJoining] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Fetch available game templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/game-templates'],
    refetchInterval: 60000, // Refresh every 60 seconds
  });

  // Fetch available public game instances
  const { data: gameInstances, isLoading: instancesLoading } = useQuery({
    queryKey: ['/api/game-instances/public'],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });

  // Mutation to join a game instance
  const joinGameMutation = useMutation({
    mutationFn: async (gameInstanceId: string) => {
      return apiRequest(`/api/game-instances/${gameInstanceId}/join`, 'POST');
    },
    onSuccess: (data: any, gameInstanceId: string) => {
      toast({
        title: "Successfully Joined! 🎉",
        description: `You've joined the game and can now submit lineups.`,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/game-instances/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/game-instances'] });
      
      setJoining(null);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Join Game",
        description: error.message || "There was an error joining the game.",
        variant: "destructive",
      });
      setJoining(null);
    }
  });

  const handleJoinGame = async (gameInstanceId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join games.",
        variant: "destructive",
      });
      return;
    }
    
    setJoining(gameInstanceId);
    joinGameMutation.mutate(gameInstanceId);
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

  const getGameTypeIcon = (gameType: string) => {
    switch (gameType) {
      case 'daily_fantasy': return <Star className="w-4 h-4" />;
      case 'snake_draft': return <Target className="w-4 h-4" />;
      case 'head_to_head': return <Zap className="w-4 h-4" />;
      case 'captain_mode': return <Trophy className="w-4 h-4" />;
      case 'best_ball': return <Calendar className="w-4 h-4" />;
      case 'weekly_league': return <Clock className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getGameTypeLabel = (gameType: string) => {
    switch (gameType) {
      case 'daily_fantasy': return 'Daily Fantasy';
      case 'snake_draft': return 'Snake Draft';
      case 'head_to_head': return 'Head-to-Head';
      case 'captain_mode': return 'Captain Mode';
      case 'best_ball': return 'Best Ball';
      case 'weekly_league': return 'Weekly League';
      default: return gameType;
    }
  };

  const isLoading = templatesLoading || instancesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="container mx-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-white">Available Fantasy Games</h1>
              <p className="text-gray-200 font-medium">
                Join open game instances from our template marketplace. Pick your favorite format and compete!
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

  // Show templates and instances  
  const allTemplates = (templates as GameTemplate[]) || [];
  const allInstances = (gameInstances as GameInstance[]) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white" data-testid="text-page-title">
              Available Fantasy Games
            </h1>
            <p className="text-gray-200 font-medium">
              Join open game instances or browse templates to see what's available. Pick your format and start competing!
            </p>
          </div>

        {/* Open Game Instances Section */}
        {allInstances.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">🔥 Open Games - Join Now!</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="grid-open-games">
              {allInstances.map((instance: GameInstance, index: number) => {
                const template = allTemplates.find((t: GameTemplate) => t.id === instance.templateId);
                return (
                  <Card key={instance.id} className="hover:shadow-lg transition-shadow duration-200 border-green-500/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2" data-testid={`text-instance-name-${index}`}>
                        {template && getGameTypeIcon(template.gameType)}
                        {instance.instanceName || template?.name || 'Unknown Game'}
                      </CardTitle>
                      <CardDescription data-testid={`text-instance-description-${index}`}>
                        Commissioner: {instance.commissionerName} • {template && getGameTypeLabel(template.gameType)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={template ? getDifficultyColor(template.difficulty) : 'bg-gray-500/20'}>
                          {template?.difficulty || 'Unknown'}
                        </Badge>
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
                          {instance.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{instance.currentEntries}/{instance.entryLimit || 'Unlimited'} players</span>
                      </div>
                      
                      {template && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Trophy className="h-4 w-4" />
                          <span>{template.templateConfig.scoringSystem.toUpperCase()} • ${template.templateConfig.salaryCap}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Created {formatGameTime(instance.createdAt)}</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button 
                          variant="outline"
                          onClick={() => setLocation(`/fantasy/game/${instance.id}`)}
                          className="w-full"
                          data-testid={`button-view-game-${index}`}
                        >
                          View Game
                        </Button>
                        <Button 
                          onClick={() => handleJoinGame(instance.id)}
                          disabled={joining === instance.id || !isAuthenticated}
                          className="w-full bg-green-600 hover:bg-green-700"
                          data-testid={`button-join-${index}`}
                        >
                          {joining === instance.id ? 'Joining...' : isAuthenticated ? 'Join Game' : 'Login to Join'}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Templates Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">🎮 Available Game Templates</h2>
          {allTemplates.length === 0 ? (
            <Card className="text-center p-8">
              <CardContent>
                <div className="mb-4">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Templates Available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  There are currently no game templates available. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="grid-available-templates">
              {allTemplates.map((template: GameTemplate, index: number) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" data-testid={`text-template-name-${index}`}>
                      {getGameTypeIcon(template.gameType)}
                      {template.name}
                    </CardTitle>
                    <CardDescription data-testid={`text-template-description-${index}`}>
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {getGameTypeLabel(template.gameType)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>~{template.estimatedParticipants} players</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Trophy className="h-4 w-4" /><span className="text-sm text-gray-400">{template.templateConfig.scoringSystem.toUpperCase()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{template.templateConfig.contestDuration}</span>
                    </div>
                  </CardContent>
                  
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      data-testid={`button-view-template-${index}`}
                    >
                      View Template Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {allInstances.length === 0 && allTemplates.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <div className="mb-4">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Games Available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There are currently no games or templates available. Check back soon!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}