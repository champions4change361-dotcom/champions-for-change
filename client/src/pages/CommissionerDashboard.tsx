import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Crown, 
  Users, 
  Trophy, 
  TrendingUp, 
  Plus, 
  Settings, 
  Activity,
  Target,
  BarChart3,
  Copy,
  Share2,
  Eye,
  Edit,
  Database,
  Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface League {
  id: string;
  name: string;
  leagueType: string;
  registrationCode: string;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
  entryFee: string;
  prizePool: string;
}

interface CommissionerStats {
  totalLeaguesCreated: number;
  activeLeagues: number;
  totalParticipantsManaged: number;
  dataAccuracyScore: string;
  helpfulVotes: number;
  donationsToChampions: string;
}

export default function CommissionerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [newLeagueData, setNewLeagueData] = useState({
    name: '',
    leagueType: 'ppr_league',
    maxParticipants: 12,
    entryFee: '0',
    isPublic: false
  });

  // Fetch commissioner dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/commissioner/dashboard'],
    enabled: !!user,
  });

  // Create new league mutation
  const createLeagueMutation = useMutation({
    mutationFn: async (leagueData: any) => {
      return await apiRequest('POST', '/api/commissioner/leagues', leagueData);
    },
    onSuccess: (data) => {
      toast({
        title: "League Created Successfully!",
        description: `Registration code: ${data.registrationCode}`,
      });
      // Reset form
      setNewLeagueData({
        name: '',
        leagueType: 'ppr_league',
        maxParticipants: 12,
        entryFee: '0',
        isPublic: false
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create League",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateLeague = () => {
    if (!newLeagueData.name.trim()) {
      toast({
        title: "League Name Required",
        description: "Please enter a name for your league",
        variant: "destructive",
      });
      return;
    }

    createLeagueMutation.mutate(newLeagueData);
  };

  const copyRegistrationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: "Registration code copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="h-8 w-8 animate-pulse" />
        <span className="ml-2">Loading commissioner dashboard...</span>
      </div>
    );
  }

  const leagues: League[] = dashboardData?.leagues || [];
  const stats: CommissionerStats = dashboardData?.analytics || {
    totalLeaguesCreated: 0,
    activeLeagues: 0,
    totalParticipantsManaged: 0,
    dataAccuracyScore: "0",
    helpfulVotes: 0,
    donationsToChampions: "0"
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="commissioner-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-600" />
            Commissioner Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your fantasy leagues and player data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Brain className="h-3 w-3 mr-1" />
            AI-Powered Platform
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Commissioner Level
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Leagues</p>
                <p className="text-2xl font-bold">{stats.activeLeagues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold">{stats.totalParticipantsManaged}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Accuracy</p>
                <p className="text-2xl font-bold">{stats.dataAccuracyScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Champion Donations</p>
                <p className="text-2xl font-bold">${stats.donationsToChampions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="commissioner-tabs">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="leagues" data-testid="tab-leagues">My Leagues</TabsTrigger>
          <TabsTrigger value="create" data-testid="tab-create">Create League</TabsTrigger>
          <TabsTrigger value="players" data-testid="tab-players">Player Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6" data-testid="overview-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common commissioner tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setActiveTab('create')} 
                  className="w-full justify-start"
                  data-testid="quick-create-league"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New League
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('players')} 
                  className="w-full justify-start"
                  data-testid="quick-add-player"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Add Player Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="quick-fantasy-coaching"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  View Fantasy Coaching AI
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentActivities?.map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
                      <div className="p-1 bg-blue-100 rounded">
                        <Edit className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="flex-1 text-sm">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leagues" className="space-y-6" data-testid="leagues-content">
          <Card>
            <CardHeader>
              <CardTitle>My Leagues</CardTitle>
              <CardDescription>
                Leagues you've created and manage
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leagues.length === 0 ? (
                <Alert>
                  <Trophy className="h-4 w-4" />
                  <AlertDescription>
                    You haven't created any leagues yet. Click "Create League" to get started!
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {leagues.map((league) => (
                    <Card key={league.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{league.name}</h3>
                            <p className="text-sm text-gray-600">
                              {league.currentParticipants}/{league.maxParticipants} participants
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {league.leagueType.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge variant={league.status === 'active' ? 'default' : 'secondary'}>
                                {league.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <p className="text-sm">
                              <span className="font-medium">Code: </span>
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {league.registrationCode}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyRegistrationCode(league.registrationCode)}
                                className="ml-1 h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Settings className="h-3 w-3 mr-1" />
                                Manage
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6" data-testid="create-content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New League
              </CardTitle>
              <CardDescription>
                Set up a new fantasy league for your community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="league-name">League Name *</Label>
                  <Input
                    id="league-name"
                    value={newLeagueData.name}
                    onChange={(e) => setNewLeagueData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Champions Fantasy Football 2024"
                    data-testid="input-league-name"
                  />
                </div>

                <div>
                  <Label htmlFor="league-type">League Type</Label>
                  <Select 
                    value={newLeagueData.leagueType} 
                    onValueChange={(value) => setNewLeagueData(prev => ({ ...prev, leagueType: value }))}
                  >
                    <SelectTrigger data-testid="select-league-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ppr_league">PPR League (Commissioner Data + AI)</SelectItem>
                      <SelectItem value="knockout_pool">Knockout Pool (ESPN API + Picks)</SelectItem>
                      <SelectItem value="dynasty">Dynasty League</SelectItem>
                      <SelectItem value="redraft">Redraft League</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max-participants">Max Participants</Label>
                  <Select 
                    value={newLeagueData.maxParticipants.toString()} 
                    onValueChange={(value) => setNewLeagueData(prev => ({ ...prev, maxParticipants: parseInt(value) }))}
                  >
                    <SelectTrigger data-testid="select-max-participants">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8 Teams</SelectItem>
                      <SelectItem value="10">10 Teams</SelectItem>
                      <SelectItem value="12">12 Teams (Recommended)</SelectItem>
                      <SelectItem value="14">14 Teams</SelectItem>
                      <SelectItem value="16">16 Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="entry-fee">Entry Fee ($)</Label>
                  <Input
                    id="entry-fee"
                    type="number"
                    value={newLeagueData.entryFee}
                    onChange={(e) => setNewLeagueData(prev => ({ ...prev, entryFee: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="5"
                    data-testid="input-entry-fee"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-public"
                  checked={newLeagueData.isPublic}
                  onChange={(e) => setNewLeagueData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  data-testid="checkbox-is-public"
                />
                <Label htmlFor="is-public">Make league publicly discoverable</Label>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  <strong>PPR Leagues</strong> use community-verified player data with detailed insights. 
                  <strong> Knockout Pools</strong> use ESPN API for automatic scoring.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleCreateLeague}
                disabled={createLeagueMutation.isPending || !newLeagueData.name.trim()}
                className="w-full"
                size="lg"
                data-testid="button-create-league"
              >
                {createLeagueMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating League...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create League
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-6" data-testid="players-content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Player Data Management
              </CardTitle>
              <CardDescription>
                Add and verify player data for enhanced coaching insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Player data entry coming soon! This will allow commissioners to input detailed 
                  player statistics and tendencies for enhanced coaching insights like 
                  "Player X runs left 75% of the time in red zone situations."
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}