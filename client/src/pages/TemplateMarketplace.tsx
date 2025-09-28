import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Target,
  Zap,
  Crown,
  Calendar,
  Gamepad2,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface GameTemplate {
  id: string;
  name: string;
  gameType: string;
  sport: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedParticipants: number;
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
    scoringSystem: 'ppr' | 'standard' | 'half_ppr';
    maxEntries: number;
    contestDuration: 'daily' | 'weekly' | 'season';
    slateTime?: string;
    entryFee?: number;
    isPublic: boolean;
  };
}

const getGameTypeIcon = (gameType: string) => {
  switch (gameType) {
    case 'daily_fantasy': return <Zap className="w-5 h-5" />;
    case 'weekly_league': return <Calendar className="w-5 h-5" />;
    case 'snake_draft': return <Target className="w-5 h-5" />;
    case 'head_to_head': return <Users className="w-5 h-5" />;
    case 'captain_mode': return <Crown className="w-5 h-5" />;
    case 'best_ball': return <Trophy className="w-5 h-5" />;
    default: return <Gamepad2 className="w-5 h-5" />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-700';
    case 'intermediate': return 'bg-yellow-100 text-yellow-700';
    case 'advanced': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function TemplateMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<GameTemplate | null>(null);
  const [instanceName, setInstanceName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [isDeploying, setIsDeploying] = useState(false);

  // Fetch available game templates
  const { data: templates, isLoading } = useQuery<GameTemplate[]>({
    queryKey: ['/api/game-templates'],
    enabled: !!user,
  });

  // Create game instance mutation
  const createInstanceMutation = useMutation({
    mutationFn: async (instanceData: any) => {
      return apiRequest('/api/game-instances', 'POST', instanceData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/game-instances'] });
      toast({
        title: "Game Deployed Successfully!",
        description: `${instanceName} is now available for users to join.`,
      });
      setLocation('/commissioner-dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy game. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDeployTemplate = async () => {
    if (!selectedTemplate || !instanceName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for your game instance.",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);

    try {
      await createInstanceMutation.mutateAsync({
        templateId: selectedTemplate.id,
        instanceName: instanceName.trim(),
        maxParticipants,
        commissionerId: user?.id,
        commissionerName: `${user?.firstName} ${user?.lastName}`.trim(),
      });
    } finally {
      setIsDeploying(false);
      setSelectedTemplate(null);
      setInstanceName('');
      setMaxParticipants(100);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please log in to access the template marketplace.
            </p>
            <Button onClick={() => setLocation('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fantasy Game Templates
            </h1>
            <Trophy className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Deploy professional fantasy games instantly. No complex setup - just click and go!
          </p>
        </div>

        {/* Success Message */}
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Simplified Approach:</strong> Choose a template below and deploy it to your dashboard. 
            Users will be able to join and create lineups with the standard QB/RB/RB/WR/WR/WR/TE/FLEX/DEF format.
          </AlertDescription>
        </Alert>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow bg-white/80 backdrop-blur-sm border-0 shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getGameTypeIcon(template.gameType)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Game Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>
                      {template.templateConfig.entryFee ? 
                        `$${template.templateConfig.entryFee}` : 
                        'Free'
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{template.estimatedParticipants} max</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="capitalize">{template.templateConfig.contestDuration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-orange-600" />
                    <span>{template.templateConfig.scoringSystem.toUpperCase()}</span>
                  </div>
                </div>

                {/* Roster Format */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Standard Lineup:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(template.templateConfig.rosterFormat)
                      .filter(([pos, count]) => count > 0)
                      .map(([position, count]) => (
                        <Badge key={position} variant="outline" className="text-xs">
                          {count}x {position}
                        </Badge>
                      ))}
                  </div>
                </div>

                {/* Deploy Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedTemplate(template)}
                      data-testid={`deploy-${template.gameType}-button`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to My Dashboard
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Deploy {selectedTemplate?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="instance-name">Game Name</Label>
                        <Input
                          id="instance-name"
                          placeholder="e.g., Week 4 Fantasy Football"
                          value={instanceName}
                          onChange={(e) => setInstanceName(e.target.value)}
                          data-testid="input-instance-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-participants">Max Participants</Label>
                        <Input
                          id="max-participants"
                          type="number"
                          min="2"
                          max="1000"
                          value={maxParticipants}
                          onChange={(e) => setMaxParticipants(Number(e.target.value))}
                          data-testid="input-max-participants"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedTemplate(null)}
                          data-testid="button-cancel"
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleDeployTemplate}
                          disabled={isDeploying || !instanceName.trim()}
                          data-testid="button-deploy"
                        >
                          {isDeploying ? 'Deploying...' : 'Deploy Game'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {templates && templates.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Templates Available</h3>
            <p className="text-gray-500">Game templates are being set up. Please check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}