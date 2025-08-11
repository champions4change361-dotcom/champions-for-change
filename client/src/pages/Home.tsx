import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Users, Settings, CreditCard, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import TournamentCreationForm from "@/components/tournament-creation-form";

export default function Home() {
  const { user, isLoading } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: myTournaments } = useQuery({
    queryKey: ["/api/my-tournaments"],
    enabled: !!user,
  });

  const { data: insights } = useQuery({
    queryKey: ["/api/tournament-insights"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">TournamentPro</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => setShowCreateForm(false)}
              data-testid="button-back"
            >
              Back to Dashboard
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <TournamentCreationForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold">TournamentPro</span>
              </div>
              <Badge variant="secondary" data-testid="text-user-plan">
                {user?.subscriptionPlan || "Free"} Plan
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right" data-testid="text-user-info">
                <div className="font-medium">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user?.email || "User"
                  }
                </div>
                <div className="text-sm text-gray-500">
                  {user?.email}
                </div>
              </div>
              
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                  data-testid="img-avatar"
                />
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user?.firstName || "there"}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your tournaments and track your success.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowCreateForm(true)}>
            <CardHeader className="text-center">
              <Plus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Create Tournament</CardTitle>
              <CardDescription>Start a new tournament</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-lg">My Tournaments</CardTitle>
              <CardDescription>{myTournaments?.length || 0} active</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Subscription</CardTitle>
              <CardDescription>Manage billing</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Settings className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Account & preferences</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Statistics */}
        {insights && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold" data-testid="text-total-tournaments">
                  {insights.total_tournaments}
                </CardTitle>
                <CardDescription>Total Tournaments</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-green-600" data-testid="text-active-tournaments">
                  {insights.active_tournaments}
                </CardTitle>
                <CardDescription>Active Tournaments</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-600" data-testid="text-completed-tournaments">
                  {insights.completed_tournaments}
                </CardTitle>
                <CardDescription>Completed Tournaments</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-purple-600" data-testid="text-sports-available">
                  {insights.total_sports_available}
                </CardTitle>
                <CardDescription>Sports Available</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Recent Tournaments */}
        <Card>
          <CardHeader>
            <CardTitle>My Recent Tournaments</CardTitle>
            <CardDescription>
              {myTournaments?.length ? 
                `You have ${myTournaments.length} tournament${myTournaments.length > 1 ? 's' : ''}` :
                'No tournaments created yet'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!myTournaments?.length ? (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Create your first tournament to get started!</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setShowCreateForm(true)}
                  data-testid="button-create-first-tournament"
                >
                  Create Tournament
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myTournaments.slice(0, 5).map((tournament: any) => (
                  <div 
                    key={tournament.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                    data-testid={`card-tournament-${tournament.id}`}
                  >
                    <div>
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <p className="text-sm text-gray-500">
                        {tournament.sport} • {tournament.teams?.length || 0} teams
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={tournament.status === 'completed' ? 'default' : 'secondary'}
                        data-testid={`status-tournament-${tournament.id}`}
                      >
                        {tournament.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}