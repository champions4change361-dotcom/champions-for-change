import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Target, 
  Trophy, 
  ArrowRight, 
  CheckCircle, 
  Clock,
  Users,
  Zap,
  Award,
  TrendingUp,
  Settings,
  PlayCircle,
  AlertCircle
} from 'lucide-react';
import PoolPlayBracket from './pool-play-bracket';
import DoubleEliminationBracket from './double-elimination-bracket';
import BracketVisualization from './bracket-visualization';
import { 
  professionalTournamentFormats, 
  type TournamentState, 
  type StageTransition,
  validateTournamentFormat
} from '@shared/multi-stage-schema';
import { StageTransitionEngine } from '@shared/stage-transition-engine';
import { SwissSystemEngine } from '@shared/swiss-system-engine';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teamSize: number;
  tournamentType: string;
  competitionFormat: string;
  status: 'upcoming' | 'stage-1' | 'stage-2' | 'stage-3' | 'completed';
  currentStage?: number;
  totalStages?: number;
  teams: { teamName: string }[];
  
  // Enhanced multi-stage configuration
  professionalFormat?: keyof typeof professionalTournamentFormats;
  tournamentState?: TournamentState;
  stageTransitions?: StageTransition[];
  advancementRules?: {
    advancementType: string;
    teamsAdvancingPerPool?: number;
    wildcardSpots?: number;
  };
}

interface MultiStageTournamentProps {
  tournament: Tournament;
  onStageTransition?: (results: any) => void;
}

export default function MultiStageTournament({ 
  tournament, 
  onStageTransition 
}: MultiStageTournamentProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stageTransitionInProgress, setStageTransitionInProgress] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Helper function to get stage descriptions
  const getStageDescription = (stageType: string): string => {
    switch (stageType) {
      case 'pool-play':
        return 'Teams compete in round-robin pools to determine seeding for elimination rounds';
      case 'single-elimination':
        return 'Direct elimination tournament where losing teams are eliminated';
      case 'double-elimination':
        return 'Teams get a second chance through winner and loser brackets';
      case 'swiss-system':
        return 'Pairing system that avoids eliminations while determining rankings';
      case 'championship':
        return 'Final stage to determine the tournament champion';
      default:
        return 'Tournament stage with custom rules and advancement criteria';
    }
  };

  // Professional tournament configuration
  const professionalConfig = useMemo(() => {
    if (tournament.professionalFormat && professionalTournamentFormats[tournament.professionalFormat]) {
      return professionalTournamentFormats[tournament.professionalFormat];
    }
    
    // Default configuration
    return {
      name: "Multi-Stage Tournament",
      complexity: "intermediate",
      stages: [
        {
          stageName: "Pool Play",
          stageType: "pool-play",
          poolConfiguration: { poolCount: 4, teamsPerPool: 4, balancedGroups: true },
          advancementRules: { advancementType: "top-n-per-pool", teamsAdvancingPerPool: 2 },
        },
        {
          stageName: "Elimination Bracket", 
          stageType: "single-elimination",
          advancementRules: { seedingMethod: "pool-standings" },
        }
      ]
    };
  }, [tournament.professionalFormat]);

  // Dynamic stage configuration based on professional format
  const stages = useMemo(() => {
    return professionalConfig.stages.map((stage, index) => ({
      id: index + 1,
      name: stage.stageName,
      description: getStageDescription(stage.stageType),
      type: stage.stageType,
      status: tournament.status === 'upcoming' ? 'pending' : 
              tournament.currentStage === (index + 1) ? 'active' :
              (tournament.currentStage || 0) > (index + 1) ? 'completed' : 'pending',
      configuration: stage,
    }));
  }, [professionalConfig, tournament.currentStage, tournament.status]);

  // Tournament state and progress tracking
  const tournamentState: TournamentState = useMemo(() => {
    const currentStageInfo = stages.find(s => s.status === 'active');
    const completedStages = stages.filter(s => s.status === 'completed').length;
    
    return {
      tournamentId: tournament.id,
      currentStage: tournament.currentStage || 1,
      totalStages: stages.length,
      stageStatuses: stages.reduce((acc, stage) => {
        acc[stage.name] = stage.status === 'active' ? 'in-progress' :
                         stage.status === 'completed' ? 'completed' : 'not-started';
        return acc;
      }, {} as Record<string, any>),
      overallProgress: {
        percentComplete: (completedStages / stages.length) * 100,
        matchesCompleted: 0, // Would be calculated from actual matches
        totalMatches: 0, // Would be calculated from tournament structure
        participantsRemaining: tournament.teams.length,
        eliminatedParticipants: 0,
      },
      currentStageInfo: currentStageInfo ? {
        stageName: currentStageInfo.name,
        stageType: currentStageInfo.type,
        stageProgress: 50, // Would be calculated from actual stage completion
        criticalPath: true,
      } : undefined,
    };
  }, [tournament, stages]);

  // Stage transition mutation
  const stageTransitionMutation = useMutation({
    mutationFn: async (transitionData: { 
      fromStage: number; 
      toStage: number; 
      results?: any;
    }) => {
      setStageTransitionInProgress(true);
      const response = await apiRequest(`/api/tournaments/${tournament.id}/advance-stage`, "POST", transitionData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tournaments/${tournament.id}`] });
      toast({
        title: "Stage Advanced",
        description: `Successfully advanced to ${data.nextStageName}`,
      });
      setStageTransitionInProgress(false);
      onStageTransition?.(data);
    },
    onError: () => {
      toast({
        title: "Advancement Failed", 
        description: "Could not advance tournament stage. Please try again.",
        variant: "destructive",
      });
      setStageTransitionInProgress(false);
    },
  });

  // Format validation
  const formatValidation = useMemo(() => {
    if (tournament.professionalFormat) {
      return validateTournamentFormat(tournament.professionalFormat, tournament.teams.length);
    }
    return { valid: true, recommended: true, suggestions: [] };
  }, [tournament.professionalFormat, tournament.teams.length]);

  const currentStageIndex = (tournament.currentStage || 1) - 1;
  const progressPercentage = ((tournament.currentStage || 1) / 3) * 100;

  const getStageIcon = (stage: any) => {
    switch (stage.status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'active': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStageColor = (stage: any) => {
    switch (stage.status) {
      case 'completed': return 'bg-green-100 border-green-300';
      case 'active': return 'bg-blue-100 border-blue-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const renderStageContent = () => {
    const currentStage = stages[currentStageIndex];
    
    if (!currentStage || tournament.status === 'upcoming') {
      return (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Tournament Not Started</h3>
            <p className="text-gray-600">
              The tournament is scheduled to begin with pool play
            </p>
          </CardContent>
        </Card>
      );
    }

    switch (currentStage.type) {
      case 'pool-play':
        return <PoolPlayBracket tournament={tournament} />;
      case 'single-elimination':
        return <BracketVisualization tournament={tournament} matches={[]} />;
      case 'championship':
        return <DoubleEliminationBracket tournament={tournament} />;
      default:
        return <BracketVisualization tournament={tournament} matches={[]} />;
    }
  };

  return (
    <div className="space-y-6" data-testid="multi-stage-tournament">
      {/* Tournament Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-500" />
            Multi-Stage Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tournament Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* Stage Timeline */}
          <div className="grid gap-4 md:grid-cols-3">
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className={`p-4 rounded-lg border-2 ${getStageColor(stage)} transition-all`}
              >
                <div className="flex items-start gap-3">
                  {getStageIcon(stage)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{stage.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                    
                    <Badge variant={
                      stage.status === 'completed' ? 'default' :
                      stage.status === 'active' ? 'secondary' : 'outline'
                    }>
                      {stage.status === 'pending' ? 'Upcoming' :
                       stage.status === 'active' ? 'In Progress' : 'Completed'}
                    </Badge>
                  </div>
                </div>
                
                {index < stages.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stage Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="current">Current Stage</TabsTrigger>
          <TabsTrigger value="standings">Standings</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold">Tournament Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Teams:</span>
                      <span className="font-medium">{tournament.teams?.length || tournament.teamSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sport:</span>
                      <span className="font-medium">{tournament.sport}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span className="font-medium">Multi-Stage</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Stage:</span>
                      <span className="font-medium">
                        {stages[currentStageIndex]?.name || 'Not Started'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Stage Breakdown</h4>
                  <div className="space-y-3">
                    {stages.map((stage) => (
                      <div key={stage.id} className="flex items-center gap-3 text-sm">
                        {getStageIcon(stage)}
                        <span className="flex-1">{stage.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {stage.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Current Stage: {stages[currentStageIndex]?.name || 'Not Started'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {stages[currentStageIndex]?.description || 'Tournament has not begun yet'}
                </p>
              </CardContent>
            </Card>
            
            {renderStageContent()}
          </div>
        </TabsContent>

        <TabsContent value="standings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Standings will be calculated based on performance across all stages
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stages.map((stage) => (
                  <div 
                    key={stage.id} 
                    className={`p-4 rounded-lg border ${getStageColor(stage)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getStageIcon(stage)}
                      <div className="flex-1">
                        <h4 className="font-semibold">{stage.name}</h4>
                        <p className="text-sm text-gray-600">{stage.description}</p>
                      </div>
                      <Badge variant={
                        stage.status === 'completed' ? 'default' :
                        stage.status === 'active' ? 'secondary' : 'outline'
                      }>
                        {stage.status === 'pending' ? 'Scheduled' :
                         stage.status === 'active' ? 'Now Playing' : 'Completed'}
                      </Badge>
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