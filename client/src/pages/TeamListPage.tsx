import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Users, 
  Search, 
  Settings, 
  Trophy,
  Crown,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Team } from "@shared/schema";

export default function TeamListPage() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch teams for the current user
  const { data: teams = [], isLoading, error } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
    meta: {
      errorMessage: "Failed to load teams"
    }
  });

  // Filter teams based on search
  const filteredTeams = teams.filter(team => 
    team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.ageGroup?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'premium': return <Star className="h-4 w-4 text-blue-500" />;
      default: return <Trophy className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSubscriptionColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'past_due': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'canceled': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'unpaid': return 'bg-red-100 text-red-800 hover:bg-red-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Teams</h2>
          <p className="text-gray-600 mb-4">We couldn't load your teams. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your teams year-round and join multiple tournaments
          </p>
        </div>
        <Link href="/teams/create">
          <Button data-testid="button-create-team" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Team
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            data-testid="input-search"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && teams.length === 0 && (
        <div className="text-center py-16">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Teams Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first team to start managing rosters and joining tournaments.
          </p>
          <Link href="/teams/create">
            <Button data-testid="button-create-first-team" size="lg" className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Your First Team
            </Button>
          </Link>
        </div>
      )}

      {/* Teams Grid */}
      {!isLoading && filteredTeams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card 
              key={team.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500"
              data-testid={`card-team-${team.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {team.teamName}
                    </CardTitle>
                    {team.organizationName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {team.organizationName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {getSubscriptionIcon(team.subscriptionTier || 'basic')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="secondary"
                    className={getSubscriptionColor(team.subscriptionStatus || 'free')}
                  >
                    {team.subscriptionStatus === 'free' ? 'Free Plan' : 
                     team.subscriptionStatus === 'active' ? `${team.subscriptionTier} Plan` :
                     team.subscriptionStatus}
                  </Badge>
                  {team.ageGroup && (
                    <Badge variant="outline" data-testid={`badge-age-${team.id}`}>
                      {team.ageGroup}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Coach: {team.coachName}</span>
                  </div>
                  
                  {team.homeVenue && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Home: {team.homeVenue}</span>
                    </div>
                  )}
                  
                  {team.division && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>Division: {team.division}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Link href={`/teams/${team.id || ''}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-manage-${team.id}`}
                    >
                      Manage
                    </Button>
                  </Link>
                  
                  <Link href={`/teams/${team.id || ''}/settings`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-settings-${team.id}`}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && teams.length > 0 && filteredTeams.length === 0 && (
        <div className="text-center py-16">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No teams found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Try adjusting your search terms or create a new team.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchTerm("")}
            data-testid="button-clear-search"
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}