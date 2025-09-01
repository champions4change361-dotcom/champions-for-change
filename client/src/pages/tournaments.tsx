import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trophy, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Users,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Target,
  Crown,
  Lock,
  Star,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useTournamentAccess } from '@/hooks/useTournamentAccess';
import EnhancedTournamentWizard from '@/components/enhanced-tournament-wizard';
import { TournamentAccessGate, FeatureLimitGate } from '@/components/tournament-access-gate';
import PricingComparison from '@/components/pricing-comparison';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teamSize: number;
  tournamentType: 'single' | 'double' | 'pool-play' | 'round-robin' | 'swiss-system';
  competitionFormat: 'bracket' | 'leaderboard' | 'series' | 'bracket-to-series' | 'multi-stage';
  status: 'upcoming' | 'stage-1' | 'stage-2' | 'stage-3' | 'completed';
  teams: { teamName: string }[];
  ageGroup?: string;
  genderDivision?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TournamentsPage() {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  
  const { user, isAuthenticated } = useAuth();
  const { 
    limits, 
    canCreateTournament, 
    getUpgradeMessage, 
    userPlan, 
    userStatus, 
    isDistrictUser,
    isTournamentManager 
  } = useTournamentAccess();

  const { data: tournaments = [], isLoading } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.sport.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    const matchesFormat = formatFilter === 'all' || tournament.competitionFormat === formatFilter;
    
    return matchesSearch && matchesStatus && matchesFormat;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming': return <Clock className="h-4 w-4" />;
      case 'stage-1':
      case 'stage-2': 
      case 'stage-3': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-gray-500';
      case 'stage-1':
      case 'stage-2':
      case 'stage-3': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'bracket': return <Trophy className="h-4 w-4" />;
      case 'leaderboard': return <Target className="h-4 w-4" />;
      case 'series': return <Calendar className="h-4 w-4" />;
      case 'multi-stage': return <Crown className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getTournamentTypeDisplay = (type: string) => {
    switch (type) {
      case 'single': return 'Single Elimination';
      case 'double': return 'Double Elimination';
      case 'pool-play': return 'Pool Play';
      case 'round-robin': return 'Round Robin';
      case 'swiss-system': return 'Swiss System';
      default: return type;
    }
  };

  const getParticipantCount = (tournament: Tournament) => {
    return tournament.teams?.length || tournament.teamSize;
  };

  const getParticipantLabel = (tournament: Tournament) => {
    return tournament.competitionFormat === 'leaderboard' ? 'participants' : 'teams';
  };

  if (showCreateWizard) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowCreateWizard(false)}
            className="mb-4"
          >
            ← Back to Tournaments
          </Button>
        </div>
        
        <FeatureLimitGate
          feature="tournaments"
          currentCount={tournaments.length}
          checkLimit={canCreateTournament}
        >
          <EnhancedTournamentWizard 
            onClose={() => setShowCreateWizard(false)}
            onTournamentCreated={() => {
              setShowCreateWizard(false);
              // Refresh tournaments list
              window.location.reload();
            }}
          />
        </FeatureLimitGate>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6 space-y-6" data-testid="tournaments-page-guest">
        <Card>
          <CardContent className="text-center py-12">
            <Lock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Tournament Management</h2>
            <p className="text-gray-600 mb-6">
              Sign in to create and manage professional tournaments with comprehensive bracket systems
            </p>
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Trophy className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold">Professional Brackets</h3>
                <p className="text-sm text-gray-600">Single & double elimination tournaments</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-semibold">Team Management</h3>
                <p className="text-sm text-gray-600">Organize teams and track progress</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="font-semibold">Live Updates</h3>
                <p className="text-sm text-gray-600">Real-time scoring and results</p>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/api/login">
                <Button className="w-full">Sign In to Get Started</Button>
              </Link>
              <p className="text-sm text-gray-500">
                Free account includes 1 tournament with up to 8 teams
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="tournaments-page">
      {/* Account Status Alert */}
      {userStatus !== 'active' && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Limited access with {userPlan} plan. {getUpgradeMessage('unlimited tournaments')}
              </span>
              <Link href="/pricing">
                <Button variant="outline" size="sm">Upgrade</Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-high-contrast">
            <Trophy className="h-8 w-8 text-primary" />
            Tournament Management
            {isDistrictUser && <Badge className="bg-blue-500">District</Badge>}
            {isTournamentManager && <Badge className="bg-green-500">Pro</Badge>}
          </h1>
          <p className="text-medium-contrast mt-2">
            Create and manage tournaments with comprehensive bracket systems
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-readable-light">
              Plan: <strong className="capitalize">{userPlan.replace('-', ' ')}</strong>
            </span>
            <span className="text-readable-light">
              Tournaments: <strong>{tournaments.length}</strong>
              {limits.maxTournaments !== -1 && ` / ${limits.maxTournaments}`}
            </span>
            <span className="text-readable-light">
              Max Teams: <strong>{limits.maxTeamsPerTournament === -1 ? 'Unlimited' : limits.maxTeamsPerTournament}</strong>
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {!canCreateTournament(tournaments.length) ? (
            <div className="text-right">
              <Button 
                disabled
                className="flex items-center gap-2"
                data-testid="button-create-tournament-disabled"
              >
                <Lock className="h-4 w-4" />
                Limit Reached
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                {getUpgradeMessage('more tournaments')}
              </p>
            </div>
          ) : (
            <Button 
              onClick={() => setShowCreateWizard(true)}
              className="flex items-center gap-2"
              data-testid="button-create-tournament"
            >
              <Plus className="h-4 w-4" />
              Create Tournament
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="stage-1">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger data-testid="select-format-filter">
                <SelectValue placeholder="Filter by format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="bracket">Bracket</SelectItem>
                <SelectItem value="leaderboard">Leaderboard</SelectItem>
                <SelectItem value="series">Series</SelectItem>
                <SelectItem value="multi-stage">Multi-Stage</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              {filteredTournaments.length} of {tournaments.length} tournaments
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tournament Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTournaments.length === 0 ? (
        <Card className="card-high-contrast">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {tournaments.length === 0 ? 'No Tournaments Yet' : 'No Matching Tournaments'}
            </h3>
            <p className="text-gray-700 mb-6">
              {tournaments.length === 0 
                ? 'Create your first tournament to get started with bracket management'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {tournaments.length === 0 && (
              <Button 
                onClick={() => setShowCreateWizard(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Tournament
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTournaments.map((tournament) => (
            <Card 
              key={tournament.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer card-high-contrast"
              data-testid={`tournament-card-${tournament.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2 mb-2">
                      {getFormatIcon(tournament.competitionFormat)}
                      <Link href={`/tournaments/${tournament.id}`} className="hover:underline">
                        {tournament.name}
                      </Link>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{tournament.sport}</span>
                      {tournament.ageGroup && (
                        <>
                          <span>•</span>
                          <span>{tournament.ageGroup}</span>
                        </>
                      )}
                      {tournament.genderDivision && (
                        <>
                          <span>•</span>
                          <span>{tournament.genderDivision}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(tournament.status)}>
                    {getStatusIcon(tournament.status)}
                    <span className="ml-1 capitalize">
                      {tournament.status === 'stage-1' ? 'Active' :
                       tournament.status === 'stage-2' ? 'Stage 2' :
                       tournament.status === 'stage-3' ? 'Stage 3' :
                       tournament.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tournament Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">Format</div>
                    <div className="text-gray-600">{getTournamentTypeDisplay(tournament.tournamentType)}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Participants</div>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {getParticipantCount(tournament)} {getParticipantLabel(tournament)}
                    </div>
                  </div>
                </div>

                {/* Format and Type Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {tournament.competitionFormat}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getTournamentTypeDisplay(tournament.tournamentType)}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/tournaments/${tournament.id}`} className="flex-1">
                    <Button variant="default" className="w-full text-sm">
                      {tournament.status === 'upcoming' ? 'Setup' : 
                       tournament.status === 'completed' ? 'View Results' : 'Manage'}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4" />
                  </Button>
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Created {new Date(tournament.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats & Account Info */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tournament Stats */}
        {tournaments.length > 0 && (
          <Card className="card-high-contrast">
            <CardHeader>
              <CardTitle>Tournament Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {tournaments.length}
                  </div>
                  <div className="text-sm text-blue-700">Total Tournaments</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tournaments.filter(t => ['stage-1', 'stage-2', 'stage-3'].includes(t.status)).length}
                  </div>
                  <div className="text-sm text-yellow-700">Active</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {tournaments.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {tournaments.reduce((sum, t) => sum + getParticipantCount(t), 0)}
                  </div>
                  <div className="text-sm text-gray-700">Total Participants</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Features */}
        <Card className="card-high-contrast">
          <CardHeader>
            <CardTitle>Your Account Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Advanced Formats</span>
                {limits.allowAdvancedFormats ? (
                  <Badge className="bg-green-500">✓ Enabled</Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade Required
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Custom Branding</span>
                {limits.allowCustomBranding ? (
                  <Badge className="bg-green-500">✓ Enabled</Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade Required
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Multi-Stage Tournaments</span>
                {limits.allowMultiStage ? (
                  <Badge className="bg-green-500">✓ Enabled</Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade Required
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Export</span>
                {limits.allowDataExport ? (
                  <Badge className="bg-green-500">✓ Enabled</Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade Required
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">API Access</span>
                {limits.allowAPIAccess ? (
                  <Badge className="bg-green-500">✓ Enabled</Badge>
                ) : (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Upgrade Required
                  </Badge>
                )}
              </div>
              
              <div className="pt-3 border-t">
                <Link href="/pricing">
                  <Button variant="outline" className="w-full">
                    View Upgrade Options
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}