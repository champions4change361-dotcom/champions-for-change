import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Settings, Save, Plus, X, Users, Trophy, Clock, Target, UserCheck, UserX, Edit2, Trash2, AlertTriangle } from 'lucide-react';
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
  teams: { teamName: string; isScratched?: boolean }[];
  participants?: { id: string; name: string; team?: string; isScratched?: boolean }[];
  events?: { id: string; eventName: string; resultsRecorderName?: string; resultsRecorderEmail?: string }[];
  ageGroup?: string;
  genderDivision?: string;
  description?: string;
  // Golf-specific cut options
  enableCut?: boolean;
  cutPosition?: number;
  cutAfterRound?: number;
  cutType?: 'professional' | 'percentage';
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
    teamSize: 8,
    // Golf cut options
    enableCut: false,
    cutPosition: 70,
    cutAfterRound: 2,
    cutType: 'professional' as 'professional' | 'percentage'
  });
  const [teams, setTeams] = useState<{ teamName: string; isScratched?: boolean }[]>([]);
  const [participants, setParticipants] = useState<{ id: string; name: string; team?: string; isScratched?: boolean }[]>([]);
  const [events, setEvents] = useState<{ id: string; eventName: string; resultsRecorderName?: string; resultsRecorderEmail?: string }[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');
  const [editingResultsRecorder, setEditingResultsRecorder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'participants' | 'events'>('basic');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        teamSize: tournament.teamSize,
        // Golf cut options
        enableCut: tournament.enableCut || false,
        cutPosition: tournament.cutPosition || 70,
        cutAfterRound: tournament.cutAfterRound || 2,
        cutType: tournament.cutType || 'professional'
      });
      setTeams(tournament.teams || []);
      setParticipants(tournament.participants || []);
      setEvents(tournament.events || []);
    }
  }, [tournament]);

  // Update tournament mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      return await apiRequest(`/api/tournaments/${id}`, 'PUT', updates);
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
      teams,
      participants,
      events
    };
    updateMutation.mutate(updates);
  };

  // Team Management
  const addTeam = () => {
    if (newTeamName.trim() && !teams.some(t => t.teamName === newTeamName.trim())) {
      setTeams([...teams, { teamName: newTeamName.trim() }]);
      setNewTeamName('');
    }
  };

  const removeTeam = (teamName: string) => {
    setTeams(teams.filter(t => t.teamName !== teamName));
  };

  const scratchTeam = (teamName: string) => {
    setTeams(teams.map(t => 
      t.teamName === teamName ? { ...t, isScratched: !t.isScratched } : t
    ));
  };

  // Participant Management
  const addParticipant = () => {
    if (newParticipantName.trim()) {
      const newParticipant = {
        id: Date.now().toString(),
        name: newParticipantName.trim()
      };
      setParticipants([...participants, newParticipant]);
      setNewParticipantName('');
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const scratchParticipant = (id: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, isScratched: !p.isScratched } : p
    ));
  };

  // Results Recorder Management
  const updateResultsRecorder = (eventId: string, name: string, email: string) => {
    setEvents(events.map(e => 
      e.id === eventId 
        ? { ...e, resultsRecorderName: name, resultsRecorderEmail: email }
        : e
    ));
    setEditingResultsRecorder(null);
  };

  // Delete Tournament
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/tournaments/${id}`, 'DELETE');
    },
    onSuccess: () => {
      toast({
        title: "Tournament Deleted",
        description: "Tournament has been permanently removed.",
      });
      // Redirect to tournaments list
      window.location.href = '/tournaments';
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete tournament",
        variant: "destructive",
      });
    }
  });

  const handleDeleteTournament = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={`/tournaments/${id}`}>
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h1 className="text-lg font-bold text-gray-900">Edit Tournament</h1>
                </div>
                <p className="text-sm text-gray-500">Modify tournament options and team roster</p>
              </div>
            </div>
            
            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-100">
          {[
            { key: 'basic', label: 'Basic Info', icon: Settings },
            { key: 'participants', label: 'Participants', icon: Users },
            { key: 'events', label: 'Events', icon: Trophy }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
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
                disabled={!newTeamName.trim() || teams.some(t => t.teamName === newTeamName.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tournament-name" className="text-sm font-medium text-gray-700 mb-2 block">Tournament Name</Label>
                <div className="text-base font-medium p-3 bg-gray-50 rounded-lg border">
                  {formData.name}
                </div>
              </div>
              
              <div>
                <Label htmlFor="sport" className="text-sm font-medium text-gray-700 mb-2 block">Sport</Label>
                <div className="text-base p-3 bg-gray-50 rounded-lg border">
                  {formData.sport}
                </div>
              </div>
              
              <div>
                <Label htmlFor="age-group" className="text-sm font-medium text-gray-700 mb-2 block">Age Group</Label>
                <div className="text-base p-3 bg-gray-50 rounded-lg border">
                  {formData.ageGroup || 'Not specified'}
                </div>
              </div>
              
              <div>
                <Label htmlFor="gender-division" className="text-sm font-medium text-gray-700 mb-2 block">Gender Division</Label>
                <div className="text-base p-3 bg-gray-50 rounded-lg border">
                  {formData.genderDivision || 'Not specified'}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional tournament description"
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Status</Label>
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

              {/* Golf Cut Configuration */}
              {formData.sport.toLowerCase().includes('golf') && (
                <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="enableCut"
                      checked={formData.enableCut}
                      onChange={(e) => setFormData({ ...formData, enableCut: e.target.checked })}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="enableCut" className="text-sm font-medium text-green-800">
                      Enable Cut (Eliminate players after specified round)
                    </Label>
                  </div>
                  
                  {formData.enableCut && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label htmlFor="cutAfterRound" className="block text-sm font-medium text-gray-700 mb-2">
                          Cut After Round
                        </Label>
                        <Select 
                          value={formData.cutAfterRound.toString()} 
                          onValueChange={(value) => setFormData({ ...formData, cutAfterRound: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">After Round 1</SelectItem>
                            <SelectItem value="2">After Round 2 (Standard)</SelectItem>
                            <SelectItem value="3">After Round 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cutType" className="block text-sm font-medium text-gray-700 mb-2">
                          Cut Type
                        </Label>
                        <Select 
                          value={formData.cutType} 
                          onValueChange={(value) => setFormData({ ...formData, cutType: value as 'professional' | 'percentage' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional Style</SelectItem>
                            <SelectItem value="percentage">Percentage Based</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="cutPosition" className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.cutType === 'percentage' ? 'Top Percentage' : 'Cut Position'}
                        </Label>
                        <Select 
                          value={formData.cutPosition.toString()} 
                          onValueChange={(value) => setFormData({ ...formData, cutPosition: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.cutType === 'percentage' ? (
                              <>
                                <SelectItem value="25">Top 25%</SelectItem>
                                <SelectItem value="33">Top 33%</SelectItem>
                                <SelectItem value="50">Top 50%</SelectItem>
                                <SelectItem value="66">Top 66%</SelectItem>
                                <SelectItem value="75">Top 75%</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="50">Top 50 + ties (Masters)</SelectItem>
                                <SelectItem value="65">Top 65 + ties</SelectItem>
                                <SelectItem value="70">Top 70 + ties (Standard)</SelectItem>
                                <SelectItem value="80">Top 80 + ties</SelectItem>
                                <SelectItem value="100">Top 100 + ties</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h4 className="text-sm font-semibold text-yellow-800 mb-1">Cut Rules</h4>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Players who miss the cut are eliminated and don't play remaining rounds</li>
                      <li>• Cut is determined by lowest scores (best performance)</li>
                      <li>• "Plus ties" means all players tied at cut score also advance</li>
                      <li>• Can be changed until the cut round is completed</li>
                      <li>• Professional tournaments typically use cuts, amateur often skip them</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Delete Tournament Section */}
              <div className="pt-6 border-t border-gray-200">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900 mb-1">Danger Zone</h4>
                      <p className="text-sm text-red-700 mb-3">
                        Permanently delete this tournament and all associated data. This action cannot be undone.
                      </p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleteMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Tournament
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Delete Tournament</h3>
                    <p className="text-sm text-gray-500">Are you sure?</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6">
                  This will permanently delete "<strong>{tournament.name}</strong>" and all associated data including:
                </p>
                
                <ul className="text-sm text-gray-600 mb-6 space-y-1">
                  <li>• All participant records</li>
                  <li>• Tournament events and results</li>
                  <li>• Results recorder assignments</li>
                  <li>• Tournament history and statistics</li>
                </ul>
                
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-6">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ This action cannot be undone!
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteMutation.isPending}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteTournament}
                    disabled={deleteMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {deleteMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Yes, Delete
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants/Teams Management Tab */}
        {activeTab === 'participants' && (
          <div className="space-y-4">
            {/* Add Participant/Team */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Add New Participant</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      placeholder="Enter participant name"
                      onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                      className="flex-1"
                    />
                    <Button onClick={addParticipant} size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {participants.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {participants.map((participant) => (
                      <div key={participant.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${participant.isScratched ? 'bg-red-400' : 'bg-green-400'}`} />
                            <span className={`font-medium ${participant.isScratched ? 'line-through text-gray-400' : ''}`}>
                              {participant.name}
                            </span>
                            {participant.isScratched && (
                              <Badge variant="secondary" className="text-xs">Scratched</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => scratchParticipant(participant.id)}
                              className={participant.isScratched ? 'text-green-600 hover:text-green-700' : 'text-yellow-600 hover:text-yellow-700'}
                            >
                              {participant.isScratched ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No participants yet</p>
                    <p className="text-sm">Add participants above to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Events & Results Recorders Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Tournament Events ({events.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {events.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {events.map((event) => (
                      <div key={event.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium">{event.eventName}</h3>
                            {event.resultsRecorderName ? (
                              <div className="text-sm text-gray-600 mt-1">
                                <p>📋 Results Recorder: {event.resultsRecorderName}</p>
                                {event.resultsRecorderEmail && (
                                  <p>📧 {event.resultsRecorderEmail}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-orange-600 mt-1">⚠️ No Results Recorder assigned</p>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingResultsRecorder(event.id)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {editingResultsRecorder === event.id && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Assign Results Recorder</h4>
                            <div className="space-y-2">
                              <Input
                                placeholder="Results Recorder Name"
                                defaultValue={event.resultsRecorderName || ''}
                                id={`recorder-name-${event.id}`}
                              />
                              <Input
                                type="email"
                                placeholder="Results Recorder Email"
                                defaultValue={event.resultsRecorderEmail || ''}
                                id={`recorder-email-${event.id}`}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const name = (document.getElementById(`recorder-name-${event.id}`) as HTMLInputElement)?.value || '';
                                    const email = (document.getElementById(`recorder-email-${event.id}`) as HTMLInputElement)?.value || '';
                                    updateResultsRecorder(event.id, name, email);
                                  }}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingResultsRecorder(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No events configured</p>
                    <p className="text-sm">Events are automatically created based on sport selection</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}