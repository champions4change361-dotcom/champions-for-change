import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Save, Plus, X, Users } from 'lucide-react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

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
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TournamentEditPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    ageGroup: '',
    genderDivision: '',
    description: '',
    teamSize: 8
  });
  const [teams, setTeams] = useState<string[]>([]);
  const [newTeamName, setNewTeamName] = useState('');

  // Fetch tournament data
  const { data: tournament, isLoading } = useQuery<Tournament>({
    queryKey: ['/api/tournaments', id],
    enabled: !!id
  });

  // Update form when tournament data loads
  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        sport: tournament.sport,
        ageGroup: tournament.ageGroup || '',
        genderDivision: tournament.genderDivision || '',
        description: tournament.description || '',
        teamSize: tournament.teamSize
      });
      setTeams(tournament.teams?.map(t => t.teamName) || []);
    }
  }, [tournament]);

  // Update tournament mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest('PUT', `/api/tournaments/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      toast({
        title: "Tournament Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update tournament",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    const updates = {
      ...formData,
      teams: teams.map(teamName => ({ teamName }))
    };
    updateMutation.mutate(updates);
  };

  const addTeam = () => {
    if (newTeamName.trim() && !teams.includes(newTeamName.trim())) {
      setTeams([...teams, newTeamName.trim()]);
      setNewTeamName('');
    }
  };

  const removeTeam = (teamName: string) => {
    setTeams(teams.filter(t => t !== teamName));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="font-semibold text-lg mb-2">Tournament Not Found</h3>
            <p className="text-gray-600">The tournament you're trying to edit doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/tournaments/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournament
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Edit Tournament
            </h1>
            <p className="text-gray-600 mt-2">
              Modify tournament settings and team roster
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Tournament Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter tournament name"
              />
            </div>
            
            <div>
              <Label htmlFor="sport">Sport</Label>
              <Input
                id="sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                placeholder="e.g., Basketball, Soccer, Tennis"
              />
            </div>
            
            <div>
              <Label htmlFor="ageGroup">Age Group</Label>
              <Input
                id="ageGroup"
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                placeholder="e.g., Under 16, High School, Adult"
              />
            </div>
            
            <div>
              <Label htmlFor="genderDivision">Gender Division</Label>
              <Input
                id="genderDivision"
                value={formData.genderDivision}
                onChange={(e) => setFormData({ ...formData, genderDivision: e.target.value })}
                placeholder="e.g., Boys, Girls, Mixed, Men's, Women's"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional tournament description"
                rows={3}
              />
            </div>

            {/* Tournament Status */}
            <div>
              <Label>Current Status</Label>
              <div className="mt-1">
                <Badge className={
                  tournament.status === 'upcoming' ? 'bg-gray-500' :
                  tournament.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                }>
                  {tournament.status === 'stage-1' ? 'Active' :
                   tournament.status === 'stage-2' ? 'Stage 2' :
                   tournament.status === 'stage-3' ? 'Stage 3' :
                   tournament.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Team */}
            <div className="flex gap-2">
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name"
                onKeyPress={(e) => e.key === 'Enter' && addTeam()}
              />
              <Button 
                onClick={addTeam} 
                size="sm"
                disabled={!newTeamName.trim() || teams.includes(newTeamName.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Team List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teams.length === 0 ? (
                <p className="text-gray-500 text-sm">No teams added yet</p>
              ) : (
                teams.map((teamName, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>{teamName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeam(teamName)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">
                <strong>{teams.length}</strong> teams registered
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Format Info (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament Format (Read-only)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm font-medium">Tournament Type</Label>
              <p className="text-sm text-gray-600 mt-1">
                {tournament.tournamentType === 'single' ? 'Single Elimination' :
                 tournament.tournamentType === 'double' ? 'Double Elimination' :
                 tournament.tournamentType === 'pool-play' ? 'Pool Play' :
                 tournament.tournamentType === 'round-robin' ? 'Round Robin' :
                 tournament.tournamentType === 'swiss-system' ? 'Swiss System' :
                 tournament.tournamentType}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Competition Format</Label>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {tournament.competitionFormat}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Team Size</Label>
              <p className="text-sm text-gray-600 mt-1">
                {tournament.teamSize} per team
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Tournament format and bracket type cannot be changed once the tournament is created. 
              This prevents disruption to existing matches and bracket structure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}