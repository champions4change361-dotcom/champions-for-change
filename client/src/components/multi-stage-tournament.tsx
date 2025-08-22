import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Target, Trophy, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import PoolPlayBracket from './pool-play-bracket';
import DoubleEliminationBracket from './double-elimination-bracket';
import BracketVisualization from './bracket-visualization';

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
}

interface MultiStageTournamentProps {
  tournament: Tournament;
}

export default function MultiStageTournament({ tournament }: MultiStageTournamentProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const stages = [
    {
      id: 1,
      name: 'Pool Play',
      description: 'Round robin within groups',
      type: 'pool-play',
      status: tournament.status === 'upcoming' ? 'pending' : 
              tournament.currentStage === 1 ? 'active' :
              (tournament.currentStage || 0) > 1 ? 'completed' : 'pending'
    },
    {
      id: 2,
      name: 'Elimination Bracket',
      description: 'Single elimination from pool winners',
      type: 'single-elimination',
      status: tournament.status === 'upcoming' || (tournament.currentStage || 0) < 2 ? 'pending' :
              tournament.currentStage === 2 ? 'active' :
              (tournament.currentStage || 0) > 2 ? 'completed' : 'pending'
    },
    {
      id: 3,
      name: 'Championship',
      description: 'Final match for tournament winner',
      type: 'championship',
      status: tournament.status === 'upcoming' || (tournament.currentStage || 0) < 3 ? 'pending' :
              tournament.currentStage === 3 ? 'active' :
              tournament.status === 'completed' ? 'completed' : 'pending'
    }
  ];

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