import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Settings, User, Crown, Plus, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import type { Team, TeamPlayer, InsertTeamPlayer } from '@shared/schema';
import { insertTeamPlayerSchema } from '@shared/schema';

export default function TeamDashboardPage() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Derive activeTab from URL path
  const getActiveTabFromPath = (path: string): string => {
    if (path.endsWith('/roster')) return 'roster';
    if (path.endsWith('/settings')) return 'settings';
    return 'profile';
  };
  
  const [activeTab, setActiveTab] = useState(() => getActiveTabFromPath(location));

  // Sync activeTab when URL changes
  useEffect(() => {
    const newTab = getActiveTabFromPath(location);
    setActiveTab(newTab);
  }, [location]);

  // Handle tab change and navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      navigate(`/teams/${id}`);
    } else {
      navigate(`/teams/${id}/${tab}`);
    }
  };

  const { data: team, isLoading, error } = useQuery<Team>({
    queryKey: ['/api/teams', id],
    enabled: !!id,
  });

  // Fetch team players
  const { data: players = [] } = useQuery<TeamPlayer[]>({
    queryKey: ['/api/teams', id, 'players'],
    enabled: !!id,
  });

  // Add player form with proper null handling
  const addPlayerForm = useForm<InsertTeamPlayer>({
    resolver: zodResolver(insertTeamPlayerSchema),
    defaultValues: {
      teamId: id || '',
      playerName: '',
      jerseyNumber: '',
      position: '',
      parentGuardianName: '',
      parentGuardianEmail: '',
      parentGuardianPhone: '',
      homeAddress: '',
      status: 'active' as const,
    },
  });

  // Add player mutation
  const addPlayerMutation = useMutation({
    mutationFn: async (playerData: InsertTeamPlayer) => {
      const response = await fetch(`/api/teams/${id}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData),
      });
      if (!response.ok) throw new Error('Failed to add player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', id, 'players'] });
      toast({ title: "Player Added", description: "Player has been successfully added to the roster!" });
      setIsAddPlayerOpen(false);
      addPlayerForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Unable to Add Player", 
        description: error.message || "Please try again or check your connection.",
        className: "bg-slate-800 border-slate-600 text-slate-100"
      });
    },
  });

  const getSubscriptionBadgeVariant = (status: string | null) => {
    switch (status) {
      case 'active': return 'default';
      case 'past_due': return 'destructive';
      case 'canceled': return 'secondary';
      case 'unpaid': return 'destructive';
      default: return 'outline';
    }
  };

  const getSubscriptionIcon = (tier: string | null) => {
    switch (tier) {
      case 'enterprise': return <Crown className="w-3 h-3" />;
      case 'pro': return <Users className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const formatSubscriptionStatus = (status: string | null) => {
    if (!status) return 'free';
    return status.replace('_', ' ');
  };

  const formatTier = (tier: string | null) => {
    if (!tier) return 'basic';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Failed to load team details</h2>
            <p className="text-slate-300 mb-6">The team may not exist or you may not have access.</p>
            <Button 
              onClick={() => navigate('/teams')} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-back-to-teams"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/teams')}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-100" data-testid="text-team-name">
                {team.teamName}
              </h1>
              {team.organizationName && (
                <p className="text-sm text-slate-300" data-testid="text-organization">
                  {team.organizationName}
                </p>
              )}
            </div>
          </div>

          {/* Subscription Status */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={getSubscriptionBadgeVariant(team.subscriptionStatus)}
              className="flex items-center gap-1"
              data-testid={`badge-subscription-${team.subscriptionStatus || 'free'}`}
            >
              {getSubscriptionIcon(team.subscriptionTier)}
              {formatTier(team.subscriptionTier || 'basic')} - {formatSubscriptionStatus(team.subscriptionStatus)}
            </Badge>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="roster" data-testid="tab-roster">
              <Users className="w-4 h-4 mr-2" />
              Roster
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              {/* Team Information */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Team Information</CardTitle>
                  <CardDescription className="text-slate-300">
                    Manage your team's basic information and details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Team Name</label>
                      <p className="text-sm text-slate-100" data-testid="text-profile-team-name">
                        {team.teamName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Organization</label>
                      <p className="text-sm text-slate-100" data-testid="text-profile-organization">
                        {team.organizationName || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Age Group</label>
                      <p className="text-sm text-slate-100" data-testid="text-profile-age-group">
                        {team.ageGroup || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Division</label>
                      <p className="text-sm text-slate-100" data-testid="text-profile-division">
                        {team.division || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" data-testid="button-edit-profile" className="border-slate-600 text-slate-100 hover:bg-slate-700">
                    Edit Team Information
                  </Button>
                </CardContent>
              </Card>

              {/* Coach Information */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Coach Information</CardTitle>
                  <CardDescription className="text-slate-300">
                    Primary coach contact and details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Coach Name</label>
                      <p className="text-sm text-slate-100" data-testid="text-coach-name">
                        {team.coachName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Email</label>
                      <p className="text-sm text-slate-100" data-testid="text-coach-email">
                        {team.coachEmail}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Phone</label>
                      <p className="text-sm text-slate-100" data-testid="text-coach-phone">
                        {team.coachPhone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Home Venue</label>
                      <p className="text-sm text-slate-100" data-testid="text-home-venue">
                        {team.homeVenue || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Roster Tab */}
          <TabsContent value="roster">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-slate-100">Team Roster</CardTitle>
                  <CardDescription className="text-slate-300">
                    Manage your team's players and roster ({players.length} players)
                  </CardDescription>
                </div>
                <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-add-player">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-slate-100">Add New Player</DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Add a new player to your team roster with all required information.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...addPlayerForm}>
                      <form onSubmit={addPlayerForm.handleSubmit((data) => addPlayerMutation.mutate(data))} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={addPlayerForm.control}
                            name="playerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Player Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-player-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addPlayerForm.control}
                            name="jerseyNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Jersey Number</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-jersey-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={addPlayerForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-100">Position</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-position" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-slate-100">Parent/Guardian Contact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={addPlayerForm.control}
                              name="parentGuardianName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-100">Parent/Guardian Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-parent-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={addPlayerForm.control}
                              name="parentGuardianPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-100">Parent Phone</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-parent-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={addPlayerForm.control}
                            name="parentGuardianEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Parent Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} type="email" className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-parent-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addPlayerForm.control}
                            name="homeAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Home Address</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-home-address" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsAddPlayerOpen(false)} className="border-slate-600 text-slate-100 hover:bg-slate-700">
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={addPlayerMutation.isPending} data-testid="button-save-player">
                            {addPlayerMutation.isPending ? 'Adding...' : 'Add Player'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-100 mb-2">No Players Yet</h3>
                    <p className="text-slate-300 mb-4">Add your first player to start building your roster.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {players.map((player) => (
                      <div key={player.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-4" data-testid={`player-card-${player.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                              {player.jerseyNumber || '#'}
                            </div>
                            <div>
                              <h4 className="text-slate-100 font-medium">{player.playerName}</h4>
                              <p className="text-slate-300 text-sm">{player.position || 'Position not set'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300 text-sm">{player.parentGuardianName}</p>
                            <p className="text-slate-400 text-xs">{player.parentGuardianPhone}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Subscription Settings */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Subscription Settings</CardTitle>
                  <CardDescription className="text-slate-300">
                    Manage your team's subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-700/50">
                    <div>
                      <p className="font-medium text-slate-100">
                        Current Plan: {formatTier(team.subscriptionTier || 'basic')}
                      </p>
                      <p className="text-sm text-slate-300">
                        Status: {formatSubscriptionStatus(team.subscriptionStatus)}
                      </p>
                    </div>
                    <Button variant="outline" data-testid="button-upgrade-plan" className="border-slate-600 text-slate-100 hover:bg-slate-700">
                      Upgrade Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Team Settings */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-100">Team Settings</CardTitle>
                  <CardDescription className="text-slate-300">
                    Configure team preferences and options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Team Status</label>
                    <p className="text-sm text-slate-300">
                      Currently: <Badge variant="outline" data-testid="badge-team-status" className="border-slate-600 text-slate-100">
                        {team.status || 'active'}
                      </Badge>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Team Color</label>
                    <p className="text-sm text-slate-300" data-testid="text-team-color">
                      {team.teamColor || 'Not specified'}
                    </p>
                  </div>
                  <Button variant="outline" data-testid="button-edit-settings" className="border-slate-600 text-slate-100 hover:bg-slate-700">
                    Edit Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-red-900/20 border-red-700/50">
                <CardHeader>
                  <CardTitle className="text-red-400">Danger Zone</CardTitle>
                  <CardDescription className="text-slate-300">
                    Irreversible actions for this team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    data-testid="button-delete-team"
                    className="w-full bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100"
                  >
                    Delete Team
                  </Button>
                  <p className="text-xs text-slate-400 mt-2">
                    This will permanently delete the team and all associated data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}