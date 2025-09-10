import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, Settings, User, Crown } from 'lucide-react';
import type { Team } from '@shared/schema';

export default function TeamDashboardPage() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  
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
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load team details. The team may not exist or you may not have access.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => navigate('/teams')} 
          className="mt-4"
          data-testid="button-back-to-teams"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>
      </div>
    );
  }

  return (
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-team-name">
              {team.teamName}
            </h1>
            {team.organizationName && (
              <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="text-organization">
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
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>
                  Manage your team's basic information and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Name</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-profile-team-name">
                      {team.teamName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Organization</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-profile-organization">
                      {team.organizationName || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age Group</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-profile-age-group">
                      {team.ageGroup || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Division</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-profile-division">
                      {team.division || 'Not specified'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" data-testid="button-edit-profile">
                  Edit Team Information
                </Button>
              </CardContent>
            </Card>

            {/* Coach Information */}
            <Card>
              <CardHeader>
                <CardTitle>Coach Information</CardTitle>
                <CardDescription>
                  Primary coach contact and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Coach Name</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-coach-name">
                      {team.coachName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-coach-email">
                      {team.coachEmail}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-coach-phone">
                      {team.coachPhone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Home Venue</label>
                    <p className="text-sm text-gray-900 dark:text-white" data-testid="text-home-venue">
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
          <Card>
            <CardHeader>
              <CardTitle>Team Roster</CardTitle>
              <CardDescription>
                Manage your team's players and roster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Roster Management Coming Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add and manage your team's players, track eligibility, and organize your roster.
                </p>
                <Button variant="outline" data-testid="button-add-player">
                  Add First Player
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Subscription Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription Settings</CardTitle>
                <CardDescription>
                  Manage your team's subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Current Plan: {formatTier(team.subscriptionTier || 'basic')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {formatSubscriptionStatus(team.subscriptionStatus)}
                    </p>
                  </div>
                  <Button variant="outline" data-testid="button-upgrade-plan">
                    Upgrade Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Team Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Team Settings</CardTitle>
                <CardDescription>
                  Configure team preferences and options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Status</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Currently: <Badge variant="outline" data-testid="badge-team-status">
                      {team.status || 'active'}
                    </Badge>
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Color</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-team-color">
                    {team.teamColor || 'Not specified'}
                  </p>
                </div>
                <Button variant="outline" data-testid="button-edit-settings">
                  Edit Settings
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for this team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  data-testid="button-delete-team"
                  className="w-full"
                >
                  Delete Team
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This will permanently delete the team and all associated data.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}