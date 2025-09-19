import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Users, Settings, User, Crown, Plus, Upload, Heart, FileCheck, MapPin, ChevronRight, ChevronLeft, Check, Loader2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import type { Team, TeamPlayer, InsertTeamPlayer } from '@shared/schema';
import { insertTeamPlayerSchema } from '@shared/schema';
import { z } from 'zod';
import { ObjectUploader } from '../../components/ObjectUploader';
import { MedicalHistoryForm } from '@/components/MedicalHistoryForm';

export default function TeamDashboardPage() {
  const { id } = useParams();
  const [location, navigate] = useLocation();
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1); // 1: Demographics, 2: Medical History, 3: Finalize
  const [editStep, setEditStep] = useState(1); // For edit dialog multi-step wizard
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isEditPlayerOpen, setIsEditPlayerOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<TeamPlayer | null>(null);
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [isMedicalHistoryOpen, setIsMedicalHistoryOpen] = useState(false);
  const [selectedPlayerForMedical, setSelectedPlayerForMedical] = useState<TeamPlayer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create update schema for team editing
  const updateTeamSchema = z.object({
    teamName: z.string().min(1, "Team name is required"),
    teamColor: z.string().optional(),
    status: z.enum(["active", "inactive", "suspended"]).optional(),
    ageGroup: z.string().optional(),
    division: z.string().optional(),
    homeVenue: z.string().optional(),
    organizationName: z.string().optional(),
    coachPhone: z.string().optional(),
  });
  
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

  // Team management mutations
  const updateTeamMutation = useMutation({
    mutationFn: async (updates: z.infer<typeof updateTeamSchema>) => {
      return apiRequest(`/api/teams/${id}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setIsEditTeamOpen(false);
      toast({
        title: "Success",
        description: "Team information updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update team",
        variant: "destructive",
      });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/teams/${id}`, 'DELETE');
    },
    onSuccess: () => {
      // Invalidate both the current team and teams list cache
      queryClient.invalidateQueries({ queryKey: ['/api/teams', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      navigate('/teams');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete team",
        variant: "destructive",
      });
    },
  });

  // Team editing form
  const editTeamForm = useForm<z.infer<typeof updateTeamSchema>>({
    resolver: zodResolver(updateTeamSchema),
    defaultValues: {
      teamName: team?.teamName || '',
      teamColor: team?.teamColor || '',
      status: team?.status || 'active',
      ageGroup: team?.ageGroup || '',
      division: team?.division || '',
      homeVenue: team?.homeVenue || '',
      organizationName: team?.organizationName || '',
      coachPhone: team?.coachPhone || '',
    },
  });

  // Update form values when team data changes
  useEffect(() => {
    if (team) {
      editTeamForm.reset({
        teamName: team.teamName || '',
        teamColor: team.teamColor || '',
        status: team.status || 'active',
        ageGroup: team.ageGroup || '',
        division: team.division || '',
        homeVenue: team.homeVenue || '',
        organizationName: team.organizationName || '',
        coachPhone: team.coachPhone || '',
      });
    }
  }, [team, editTeamForm]);

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
      profilePicture: '',
      medicalClearanceDoc: '',
      birthCertificateDoc: '',
      physicalFormDoc: '',
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

  // Edit player form
  const editPlayerForm = useForm<Partial<TeamPlayer>>({
    resolver: zodResolver(insertTeamPlayerSchema.omit({ teamId: true }).partial()),
    defaultValues: {
      playerName: '',
      jerseyNumber: '',
      position: '',
      parentGuardianName: '',
      parentGuardianEmail: '',
      parentGuardianPhone: '',
      homeAddress: '',
      profilePicture: '',
      medicalClearanceDoc: '',
      birthCertificateDoc: '',
      physicalFormDoc: '',
    },
  });

  // Update player mutation
  const updatePlayerMutation = useMutation({
    mutationFn: async (updates: Partial<TeamPlayer>) => {
      if (!editingPlayer) throw new Error('No player selected for editing');
      const response = await fetch(`/api/teams/${id}/players/${editingPlayer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', id, 'players'] });
      toast({ title: "Player Updated", description: "Player information has been successfully updated!" });
      setIsEditPlayerOpen(false);
      setEditingPlayer(null);
      editPlayerForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Unable to Update Player", 
        description: error.message || "Please try again or check your connection.",
        className: "bg-slate-800 border-slate-600 text-slate-100"
      });
    },
  });

  // Handle opening edit player dialog
  const handleEditPlayer = (player: TeamPlayer) => {
    setEditingPlayer(player);
    setEditStep(1); // Reset to first step when opening
    editPlayerForm.reset({
      playerName: player.playerName || '',
      jerseyNumber: player.jerseyNumber || '',
      position: player.position || '',
      parentGuardianName: player.parentGuardianName || '',
      parentGuardianEmail: player.parentGuardianEmail || '',
      parentGuardianPhone: player.parentGuardianPhone || '',
      homeAddress: player.homeAddress || '',
      profilePicture: player.profilePicture || '',
      medicalClearanceDoc: player.medicalClearanceDoc || '',
      birthCertificateDoc: player.birthCertificateDoc || '',
      physicalFormDoc: player.physicalFormDoc || '',
    });
    setIsEditPlayerOpen(true);
  };

  // Handle opening medical history dialog
  const handleMedicalHistory = (player: TeamPlayer) => {
    setSelectedPlayerForMedical(player);
    setIsMedicalHistoryOpen(true);
  };

  // Search for address using Nominatim (OpenStreetMap) - completely free, no API key required
  const searchAddress = async (query: string) => {
    if (query.length < 5) {
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=5&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Failed to fetch addresses');
      
      const results = await response.json();
      setAddressSuggestions(results);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle address selection - auto-fill city, state, zip
  const selectAddress = (suggestion: any) => {
    const address = suggestion.address || {};
    const streetNumber = address.house_number || '';
    const streetName = address.road || '';
    const fullStreet = `${streetNumber} ${streetName}`.trim();
    const city = address.city || address.town || address.village || '';
    const state = address.state || '';
    const zipCode = address.postcode || '';
    
    // Create the full address string
    const fullAddress = `${fullStreet}, ${city}, ${state} ${zipCode}`;
    
    addPlayerForm.setValue('homeAddress', fullAddress);
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setAddressSearchQuery('');
  };

  // Handle when dialog closes - reset step
  const handleDialogClose = (open: boolean) => {
    setIsAddPlayerOpen(open);
    if (!open) {
      setRegistrationStep(1);
      addPlayerForm.reset();
      setAddressSuggestions([]);
      setAddressSearchQuery('');
    }
  };

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
              className="flex items-center gap-1 bg-slate-700/80 text-slate-50 border-slate-600 font-medium"
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
                      <label className="text-sm font-semibold text-slate-200">Team Name</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-profile-team-name">
                        {team.teamName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200">Organization</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-profile-organization">
                        {team.organizationName || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200">Age Group</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-profile-age-group">
                        {team.ageGroup || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200">Division</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-profile-division">
                        {team.division || 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    data-testid="button-edit-profile" 
                    className="border-slate-500 bg-slate-800/50 text-slate-50 hover:bg-slate-700 hover:text-white hover:border-slate-400"
                    onClick={() => setIsEditTeamOpen(true)}
                  >
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
                      <label className="text-sm font-semibold text-slate-200">Coach Name</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-coach-name">
                        {team.coachName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200">Email</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-coach-email">
                        {team.coachEmail}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200">Phone</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-coach-phone">
                        {team.coachPhone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-200">Home Venue</label>
                      <p className="text-sm text-slate-50 font-medium" data-testid="text-home-venue">
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
                <Dialog open={isAddPlayerOpen} onOpenChange={handleDialogClose}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-add-player">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-slate-100 text-xl">Player Registration</DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Complete all three steps to register a new player
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-6 px-2">
                      <div className="flex items-center flex-1">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${registrationStep >= 1 ? 'bg-blue-600' : 'bg-slate-600'} text-white`}>
                          {registrationStep > 1 ? <Check className="w-5 h-5" /> : '1'}
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${registrationStep > 1 ? 'bg-blue-600' : 'bg-slate-600'}`} />
                        
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${registrationStep >= 2 ? 'bg-blue-600' : 'bg-slate-600'} text-white`}>
                          {registrationStep > 2 ? <Check className="w-5 h-5" /> : '2'}
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${registrationStep > 2 ? 'bg-blue-600' : 'bg-slate-600'}`} />
                        
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${registrationStep >= 3 ? 'bg-blue-600' : 'bg-slate-600'} text-white`}>
                          {registrationStep > 3 ? <Check className="w-5 h-5" /> : '3'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {registrationStep === 1 && 'Step 1: Player Information'}
                        {registrationStep === 2 && 'Step 2: Medical History'}
                        {registrationStep === 3 && 'Step 3: Documents & Signature'}
                      </h3>
                    </div>
                    <Form {...addPlayerForm}>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        // Only submit if we're on the final step
                        if (registrationStep === 3) {
                          addPlayerForm.handleSubmit((data) => addPlayerMutation.mutate(data))(e);
                        }
                      }} className="space-y-4">
                        
                        {/* Step 1: Demographics */}
                        {registrationStep === 1 && (
                          <div className="space-y-4">
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
                                <FormLabel className="text-slate-100">
                                  <MapPin className="w-4 h-4 inline mr-1" />
                                  Home Address (Start typing to search)
                                </FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input 
                                      {...field}
                                      value={addressSearchQuery || field.value || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setAddressSearchQuery(value);
                                        field.onChange(value);
                                        if (value.length > 4) {
                                          searchAddress(value);
                                        } else {
                                          setAddressSuggestions([]);
                                          setShowAddressSuggestions(false);
                                        }
                                      }}
                                      className="bg-slate-700 border-slate-600 text-slate-100 pr-10" 
                                      placeholder="123 Main St, City, State"
                                      data-testid="input-home-address"
                                    />
                                    {isLoadingAddress && (
                                      <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-slate-400" />
                                    )}
                                    {!isLoadingAddress && addressSearchQuery && (
                                      <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                                    )}
                                    
                                    {/* Address Suggestions Dropdown */}
                                    {showAddressSuggestions && addressSuggestions.length > 0 && (
                                      <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {addressSuggestions.map((suggestion, index) => (
                                          <button
                                            key={index}
                                            type="button"
                                            onClick={() => selectAddress(suggestion)}
                                            className="w-full px-4 py-2 text-left text-slate-100 hover:bg-slate-600 focus:bg-slate-600 focus:outline-none transition-colors"
                                          >
                                            <div className="flex items-start gap-2">
                                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                              <div>
                                                <div className="font-medium">{suggestion.display_name?.split(',')[0]}</div>
                                                <div className="text-sm text-slate-300">
                                                  {suggestion.display_name?.split(',').slice(1).join(',')}
                                                </div>
                                              </div>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </FormControl>
                                <p className="text-xs text-slate-400 mt-1">
                                  Powered by OpenStreetMap - Free address lookup
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Document Upload Section */}
                          <div className="col-span-1 md:col-span-2 space-y-4 pt-6 border-t border-slate-600">
                            {/* Profile Picture */}
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-slate-100 mb-4">Player Photo</h3>
                              <FormField
                                control={addPlayerForm.control}
                                name="profilePicture"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Profile Picture</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={5242880}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'profile-picture' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result) => {
                                            const successful = result.successful?.[0];
                                            if (successful) {
                                              field.onChange(successful.uploadURL);
                                            }
                                          }}
                                          buttonClassName="w-full bg-blue-600 hover:bg-blue-500 border-blue-500 text-white"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Photo' : 'Upload Player Photo'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Player photo uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <h3 className="text-lg font-semibold text-slate-100 mb-4">Required Documents</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Medical Clearance */}
                              <FormField
                                control={addPlayerForm.control}
                                name="medicalClearanceDoc"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Medical Clearance</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={10485760}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'medical-clearance' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result: any) => {
                                            if (result.successful && result.successful.length > 0) {
                                              field.onChange(result.successful[0].uploadURL || result.successful[0].url);
                                            }
                                          }}
                                          buttonClassName="w-full bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Medical Form' : 'Upload Medical Form'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Medical clearance uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Birth Certificate */}
                              <FormField
                                control={addPlayerForm.control}
                                name="birthCertificateDoc"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Birth Certificate</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={10485760}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'birth-certificate' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result: any) => {
                                            if (result.successful && result.successful.length > 0) {
                                              field.onChange(result.successful[0].uploadURL || result.successful[0].url);
                                            }
                                          }}
                                          buttonClassName="w-full bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Birth Certificate' : 'Upload Birth Certificate'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Birth certificate uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Physical Form */}
                              <FormField
                                control={addPlayerForm.control}
                                name="physicalFormDoc"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Physical Form</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={10485760}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'physical-form' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result: any) => {
                                            if (result.successful && result.successful.length > 0) {
                                              field.onChange(result.successful[0].uploadURL || result.successful[0].url);
                                            }
                                          }}
                                          buttonClassName="w-full bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Physical Form' : 'Upload Physical Form'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Physical form uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                          </div>
                        )}
                        
                        {/* Step 2: Medical History (PPE Questions) */}
                        {registrationStep === 2 && (
                          <div className="space-y-4">
                            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 mb-4">
                              <Heart className="h-4 w-4 text-blue-600" />
                              <AlertDescription>
                                UIL Participation Physical Evaluation - Please answer Yes or No to each question.
                              </AlertDescription>
                            </Alert>
                            
                            {/* All 21 PPE Medical History Questions with Yes/No */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                              {/* Question 1 */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">1. Has the student had a medical illness or injury since the last exam?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q1" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q1" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 2 */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">2. Has the student been hospitalized or had surgery?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q2" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q2" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 3 - Heart */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">3. Has the student ever passed out, nearly passed out, or had chest pain during exercise?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q3" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q3" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 4 - Head Injury */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">4. Has the student had a head injury or concussion?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q4" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q4" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 5 - Neurological */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">5. Has the student had a seizure, numbness, or tingling in arms/legs?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q5" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q5" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 6 - Organs */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">6. Is the student missing any organs (kidney, testicle, spleen, etc.)?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q6" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q6" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 7 - Medical Care */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">7. Is the student under a doctor's care for any condition?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q7" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q7" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 8 - Medications */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">8. Is the student currently taking any prescription medications?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q8" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q8" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 9 - Allergies */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">9. Does the student have any allergies (medications, food, insects)?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q9" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q9" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 10 - Dizziness */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">10. Has the student ever become dizzy during or after exercise?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q10" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q10" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 11 - Skin */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">11. Does the student have any skin problems (itching, rashes, MRSA)?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q11" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q11" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 12 - Heat Illness */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">12. Has the student had problems with heat or cold illness?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q12" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q12" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 13 - Vision */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">13. Does the student have vision problems or wear glasses/contacts?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q13" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q13" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 14 - Breathing */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">14. Does the student have asthma or use an inhaler?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q14" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q14" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 15 - Equipment */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">15. Does the student use any special equipment or protective devices?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q15" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q15" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 16 - Injuries */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">16. Has the student had any sprains, fractures, or bone/joint problems?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q16" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q16" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 17 - Weight */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">17. Does the student have concerns about weight or eating habits?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q17" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q17" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 18 - Mental Health */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">18. Does the student feel stressed, anxious, or depressed?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q18" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q18" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 19 - Sickle Cell */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">19. Does the student have sickle cell trait or disease?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q19" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q19" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 20 - Female Only */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">20. (Females only) Have you had irregular menstrual periods?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q20" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q20" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q20" value="na" className="w-4 h-4" />
                                    <span className="text-slate-100">N/A</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 21 - Male Only */}
                              <div className="pb-3">
                                <p className="text-slate-100 mb-2 font-medium">21. (Males only) Do you have any testicular swelling or pain?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q21" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q21" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="q21" value="na" className="w-4 h-4" />
                                    <span className="text-slate-100">N/A</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Step 3: Documents & Signature */}
                        {registrationStep === 3 && (
                          <div className="space-y-4">
                            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 mb-4">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <AlertDescription>
                                Upload required documents and provide a digital signature to complete registration.
                              </AlertDescription>
                            </Alert>
                            
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-slate-100">Digital Signature</h3>
                              <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                                <p className="text-slate-300 mb-4">Click or touch to sign below</p>
                                <canvas
                                  ref={(canvas) => {
                                    if (canvas && !canvas.hasAttribute('data-initialized')) {
                                      canvas.setAttribute('data-initialized', 'true');
                                      const ctx = canvas.getContext('2d');
                                      if (ctx) {
                                        let isDrawing = false;
                                        let lastX = 0;
                                        let lastY = 0;
                                        
                                        // Set canvas size
                                        const rect = canvas.getBoundingClientRect();
                                        canvas.width = rect.width * 2; // High DPI
                                        canvas.height = 120 * 2; // High DPI
                                        canvas.style.width = '100%';
                                        canvas.style.height = '120px';
                                        
                                        // Scale for high DPI
                                        ctx.scale(2, 2);
                                        
                                        // Set drawing styles
                                        ctx.strokeStyle = '#ffffff';
                                        ctx.lineWidth = 2;
                                        ctx.lineCap = 'round';
                                        ctx.lineJoin = 'round';
                                        
                                        // Clear canvas background
                                        ctx.fillStyle = '#374151'; // slate-700
                                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                                        
                                        const startDrawing = (e: MouseEvent | TouchEvent) => {
                                          isDrawing = true;
                                          const rect = canvas.getBoundingClientRect();
                                          if (e.type.includes('touch')) {
                                            const touch = (e as TouchEvent).touches[0];
                                            lastX = touch.clientX - rect.left;
                                            lastY = touch.clientY - rect.top;
                                          } else {
                                            lastX = (e as MouseEvent).clientX - rect.left;
                                            lastY = (e as MouseEvent).clientY - rect.top;
                                          }
                                        };
                                        
                                        const draw = (e: MouseEvent | TouchEvent) => {
                                          if (!isDrawing) return;
                                          e.preventDefault();
                                          
                                          const rect = canvas.getBoundingClientRect();
                                          let currentX, currentY;
                                          
                                          if (e.type.includes('touch')) {
                                            const touch = (e as TouchEvent).touches[0];
                                            currentX = touch.clientX - rect.left;
                                            currentY = touch.clientY - rect.top;
                                          } else {
                                            currentX = (e as MouseEvent).clientX - rect.left;
                                            currentY = (e as MouseEvent).clientY - rect.top;
                                          }
                                          
                                          ctx.beginPath();
                                          ctx.moveTo(lastX, lastY);
                                          ctx.lineTo(currentX, currentY);
                                          ctx.stroke();
                                          
                                          lastX = currentX;
                                          lastY = currentY;
                                        };
                                        
                                        const stopDrawing = () => {
                                          isDrawing = false;
                                        };
                                        
                                        // Mouse events
                                        canvas.addEventListener('mousedown', startDrawing);
                                        canvas.addEventListener('mousemove', draw);
                                        canvas.addEventListener('mouseup', stopDrawing);
                                        canvas.addEventListener('mouseout', stopDrawing);
                                        
                                        // Touch events with passive: false to prevent scrolling
                                        canvas.addEventListener('touchstart', startDrawing, { passive: false });
                                        canvas.addEventListener('touchmove', draw, { passive: false });
                                        canvas.addEventListener('touchend', stopDrawing, { passive: false });
                                        
                                        // Add clear button functionality
                                        // Mark canvas as empty initially and track signature state
                                        (canvas as any).isEmpty = true;
                                        (canvas as any).hasSignature = () => !(canvas as any).isEmpty;
                                        
                                        // Override draw to track if signature exists
                                        const originalStartDrawing = startDrawing;
                                        const trackingStartDrawing = (e: MouseEvent | TouchEvent) => {
                                          originalStartDrawing(e);
                                          (canvas as any).isEmpty = false;
                                        };
                                        
                                        const clearButton = document.createElement('button');
                                        clearButton.innerText = 'Clear Signature';
                                        clearButton.className = 'mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700';
                                        clearButton.onclick = (e) => {
                                          e.preventDefault();
                                          ctx.fillStyle = '#374151';
                                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                                          (canvas as any).isEmpty = true;
                                        };
                                        canvas.parentNode?.appendChild(clearButton);
                                        
                                        // Use tracking version of startDrawing
                                        canvas.addEventListener('mousedown', trackingStartDrawing);
                                        canvas.addEventListener('touchstart', trackingStartDrawing, { passive: false });
                                      }
                                    }
                                  }}
                                  className="bg-slate-700 rounded border border-slate-600 cursor-crosshair w-full"
                                  style={{ touchAction: 'none' }}
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" className="w-4 h-4" />
                                <label className="text-slate-100 text-sm">
                                  I certify that all information provided is true and accurate. I understand this medical history will be used for athletic participation evaluation.
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                          <div>
                            {registrationStep > 1 && (
                              <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => setRegistrationStep(registrationStep - 1)} 
                                className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:text-white"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                              </Button>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              type="button" 
                              variant="secondary" 
                              onClick={() => handleDialogClose(false)} 
                              className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:text-white"
                            >
                              Cancel
                            </Button>
                            {registrationStep < 3 ? (
                              <Button 
                                type="button" 
                                onClick={() => setRegistrationStep(registrationStep + 1)} 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            ) : (
                              <Button 
                                type="button"
                                onClick={() => {
                                  // Only submit when Complete Registration is clicked
                                  addPlayerForm.handleSubmit((data) => addPlayerMutation.mutate(data))();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white" 
                                disabled={addPlayerMutation.isPending} 
                                data-testid="button-save-player"
                              >
                                {addPlayerMutation.isPending ? 'Submitting...' : 'Complete Registration'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>

                {/* Edit Player Dialog - Multi-Step Wizard */}
                <Dialog open={isEditPlayerOpen} onOpenChange={setIsEditPlayerOpen}>
                  <DialogContent className="bg-slate-800 border-slate-700 max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-slate-100">Edit Player Information</DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Update player information, medical history, and documents.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {/* Progress Indicator */}
                    <div className="mb-6">
                      <div className="flex items-center justify-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${editStep >= 1 ? 'bg-blue-600' : 'bg-slate-600'} text-white`}>
                          {editStep > 1 ? <Check className="w-5 h-5" /> : '1'}
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${editStep > 1 ? 'bg-blue-600' : 'bg-slate-600'}`} />
                        
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${editStep >= 2 ? 'bg-blue-600' : 'bg-slate-600'} text-white`}>
                          {editStep > 2 ? <Check className="w-5 h-5" /> : '2'}
                        </div>
                        <div className={`flex-1 h-1 mx-2 ${editStep > 2 ? 'bg-blue-600' : 'bg-slate-600'}`} />
                        
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${editStep >= 3 ? 'bg-blue-600' : 'bg-slate-600'} text-white`}>
                          {editStep > 3 ? <Check className="w-5 h-5" /> : '3'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-100">
                        {editStep === 1 && 'Step 1: Player Information'}
                        {editStep === 2 && 'Step 2: Medical History'}
                        {editStep === 3 && 'Step 3: Documents'}
                      </h3>
                    </div>
                    
                    <Form {...editPlayerForm}>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        // Only submit if we're on the final step
                        if (editStep === 3) {
                          editPlayerForm.handleSubmit((data) => updatePlayerMutation.mutate(data))(e);
                        }
                      }} className="space-y-4">
                        
                        {/* Step 1: Demographics */}
                        {editStep === 1 && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={editPlayerForm.control}
                            name="playerName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Player Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-edit-player-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editPlayerForm.control}
                            name="jerseyNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Jersey Number</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-edit-jersey-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={editPlayerForm.control}
                          name="position"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-100">Position</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-edit-position" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium text-slate-100">Parent/Guardian Contact</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={editPlayerForm.control}
                              name="parentGuardianName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-100">Parent/Guardian Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-edit-parent-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editPlayerForm.control}
                              name="parentGuardianPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-100">Parent Phone</FormLabel>
                                  <FormControl>
                                    <Input {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-edit-parent-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={editPlayerForm.control}
                            name="parentGuardianEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Parent Email Address</FormLabel>
                                <FormControl>
                                  <Input {...field} value={field.value || ''} type="email" className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-edit-parent-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editPlayerForm.control}
                            name="homeAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-100">Home Address</FormLabel>
                                <FormControl>
                                  <Textarea {...field} value={field.value || ''} className="bg-slate-700 border-slate-600 text-slate-100" data-testid="input-edit-home-address" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Document Upload Section */}
                          <div className="col-span-1 md:col-span-2 space-y-4 pt-6 border-t border-slate-600">
                            {/* Profile Picture */}
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-slate-100 mb-4">Player Photo</h3>
                              <FormField
                                control={editPlayerForm.control}
                                name="profilePicture"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Profile Picture</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={5242880}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'profile-picture' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result) => {
                                            const successful = result.successful?.[0];
                                            if (successful) {
                                              field.onChange(successful.uploadURL);
                                            }
                                          }}
                                          buttonClassName="w-full bg-blue-600 hover:bg-blue-500 border-blue-500 text-white"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Photo' : 'Upload Player Photo'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Player photo uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <h3 className="text-lg font-semibold text-slate-100 mb-4">Required Documents</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Medical Clearance */}
                              <FormField
                                control={editPlayerForm.control}
                                name="medicalClearanceDoc"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Medical Clearance</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={10485760}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'medical-clearance' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result: any) => {
                                            if (result.successful && result.successful.length > 0) {
                                              field.onChange(result.successful[0].uploadURL || result.successful[0].url);
                                            }
                                          }}
                                          buttonClassName="w-full bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Medical Form' : 'Upload Medical Form'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Medical clearance uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Birth Certificate */}
                              <FormField
                                control={editPlayerForm.control}
                                name="birthCertificateDoc"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Birth Certificate</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={10485760}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'birth-certificate' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result: any) => {
                                            if (result.successful && result.successful.length > 0) {
                                              field.onChange(result.successful[0].uploadURL || result.successful[0].url);
                                            }
                                          }}
                                          buttonClassName="w-full bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Birth Certificate' : 'Upload Birth Certificate'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Birth certificate uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Physical Form */}
                              <FormField
                                control={editPlayerForm.control}
                                name="physicalFormDoc"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-100">Physical Form</FormLabel>
                                    <FormControl>
                                      <div className="space-y-2">
                                        <ObjectUploader
                                          maxNumberOfFiles={1}
                                          maxFileSize={10485760}
                                          onGetUploadParameters={async () => {
                                            const response = await fetch('/api/upload/presigned-url', {
                                              method: 'POST',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ fileType: 'physical-form' })
                                            });
                                            return response.json();
                                          }}
                                          onComplete={(result: any) => {
                                            if (result.successful && result.successful.length > 0) {
                                              field.onChange(result.successful[0].uploadURL || result.successful[0].url);
                                            }
                                          }}
                                          buttonClassName="w-full bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-100"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          {field.value ? 'Replace Physical Form' : 'Upload Physical Form'}
                                        </ObjectUploader>
                                        {field.value && (
                                          <p className="text-xs text-green-400">✅ Physical form uploaded</p>
                                        )}
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                          </div>
                        )}
                        
                        {/* Step 2: Medical History - Edit Mode */}
                        {editStep === 2 && (
                          <div className="space-y-4">
                            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 mb-4">
                              <Heart className="h-4 w-4 text-blue-600" />
                              <AlertDescription>
                                Review and update medical history. Click Next if no changes needed.
                              </AlertDescription>
                            </Alert>
                            
                            {/* All 21 PPE Medical History Questions - Edit Mode */}
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                              {/* Question 1 */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">1. Has the student had a medical illness or injury since the last exam?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q1" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q1" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 2 */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">2. Has the student been hospitalized or had surgery?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q2" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q2" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 3 - Heart */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">3. Has the student ever passed out, nearly passed out, or had chest pain during exercise?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q3" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q3" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 4 - Head Injury */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">4. Has the student had a head injury or concussion?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q4" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q4" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 5 - Neurological */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">5. Has the student had a seizure, numbness, or tingling in arms/legs?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q5" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q5" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 6 - Organs */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">6. Is the student missing any organs (kidney, testicle, spleen, etc.)?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q6" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q6" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 7 - Medical Care */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">7. Is the student under a doctor's care for any condition?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q7" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q7" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 8 - Medications */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">8. Is the student currently taking any prescription medications?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q8" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q8" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 9 - Allergies */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">9. Does the student have any allergies (medications, food, insects)?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q9" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q9" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 10 - Dizziness */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">10. Has the student ever become dizzy during or after exercise?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q10" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q10" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 11 - Skin */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">11. Does the student have any skin problems (itching, rashes, MRSA)?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q11" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q11" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 12 - Heat Illness */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">12. Has the student had problems with heat or cold illness?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q12" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q12" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 13 - Vision */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">13. Does the student have vision problems or wear glasses/contacts?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q13" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q13" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 14 - Breathing */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">14. Does the student have asthma or use an inhaler?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q14" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q14" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 15 - Equipment */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">15. Does the student use any special equipment or protective devices?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q15" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q15" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 16 - Injuries */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">16. Has the student had any sprains, fractures, or bone/joint problems?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q16" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q16" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 17 - Weight */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">17. Does the student have concerns about weight or eating habits?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q17" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q17" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 18 - Mental Health */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">18. Does the student feel stressed, anxious, or depressed?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q18" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q18" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 19 - Sickle Cell */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">19. Does the student have sickle cell trait or disease?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q19" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q19" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 20 - Female Only */}
                              <div className="border-b border-slate-700 pb-3">
                                <p className="text-slate-100 mb-2 font-medium">20. (Females only) Have you had irregular menstrual periods?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q20" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q20" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q20" value="na" className="w-4 h-4" />
                                    <span className="text-slate-100">N/A</span>
                                  </label>
                                </div>
                              </div>

                              {/* Question 21 - Male Only */}
                              <div className="pb-3">
                                <p className="text-slate-100 mb-2 font-medium">21. (Males only) Do you have any testicular swelling or pain?</p>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q21" value="yes" className="w-4 h-4" />
                                    <span className="text-slate-100">Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q21" value="no" className="w-4 h-4" />
                                    <span className="text-slate-100">No</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="edit_q21" value="na" className="w-4 h-4" />
                                    <span className="text-slate-100">N/A</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Step 3: Documents & Signature - Edit Mode */}
                        {editStep === 3 && (
                          <div className="space-y-4">
                            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 mb-4">
                              <FileCheck className="h-4 w-4 text-green-600" />
                              <AlertDescription>
                                Add signature to confirm all information is accurate and save changes.
                              </AlertDescription>
                            </Alert>
                            
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-slate-100">Digital Signature</h3>
                              <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                                <p className="text-slate-300 mb-4">Click or touch to sign below</p>
                                <canvas
                                  ref={(canvas) => {
                                    if (canvas && !canvas.hasAttribute('data-initialized')) {
                                      canvas.setAttribute('data-initialized', 'true');
                                      const ctx = canvas.getContext('2d');
                                      if (ctx) {
                                        let isDrawing = false;
                                        let lastX = 0;
                                        let lastY = 0;
                                        
                                        // Set canvas size
                                        const rect = canvas.getBoundingClientRect();
                                        canvas.width = rect.width * 2; // High DPI
                                        canvas.height = 120 * 2; // High DPI
                                        canvas.style.width = '100%';
                                        canvas.style.height = '120px';
                                        
                                        // Scale for high DPI
                                        ctx.scale(2, 2);
                                        
                                        // Set drawing styles
                                        ctx.strokeStyle = '#ffffff';
                                        ctx.lineWidth = 2;
                                        ctx.lineCap = 'round';
                                        ctx.lineJoin = 'round';
                                        
                                        // Clear canvas background
                                        ctx.fillStyle = '#374151'; // slate-700
                                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                                        
                                        const startDrawing = (e: MouseEvent | TouchEvent) => {
                                          isDrawing = true;
                                          const rect = canvas.getBoundingClientRect();
                                          if (e.type.includes('touch')) {
                                            const touch = (e as TouchEvent).touches[0];
                                            lastX = touch.clientX - rect.left;
                                            lastY = touch.clientY - rect.top;
                                          } else {
                                            lastX = (e as MouseEvent).clientX - rect.left;
                                            lastY = (e as MouseEvent).clientY - rect.top;
                                          }
                                        };
                                        
                                        const draw = (e: MouseEvent | TouchEvent) => {
                                          if (!isDrawing) return;
                                          e.preventDefault();
                                          
                                          const rect = canvas.getBoundingClientRect();
                                          let currentX, currentY;
                                          
                                          if (e.type.includes('touch')) {
                                            const touch = (e as TouchEvent).touches[0];
                                            currentX = touch.clientX - rect.left;
                                            currentY = touch.clientY - rect.top;
                                          } else {
                                            currentX = (e as MouseEvent).clientX - rect.left;
                                            currentY = (e as MouseEvent).clientY - rect.top;
                                          }
                                          
                                          ctx.beginPath();
                                          ctx.moveTo(lastX, lastY);
                                          ctx.lineTo(currentX, currentY);
                                          ctx.stroke();
                                          
                                          lastX = currentX;
                                          lastY = currentY;
                                        };
                                        
                                        const stopDrawing = () => {
                                          isDrawing = false;
                                        };
                                        
                                        // Mouse events
                                        canvas.addEventListener('mousedown', startDrawing);
                                        canvas.addEventListener('mousemove', draw);
                                        canvas.addEventListener('mouseup', stopDrawing);
                                        canvas.addEventListener('mouseout', stopDrawing);
                                        
                                        // Touch events with passive: false to prevent scrolling
                                        canvas.addEventListener('touchstart', startDrawing, { passive: false });
                                        canvas.addEventListener('touchmove', draw, { passive: false });
                                        canvas.addEventListener('touchend', stopDrawing, { passive: false });
                                        
                                        // Add clear button functionality
                                        // Mark canvas as empty initially and track signature state
                                        (canvas as any).isEmpty = true;
                                        (canvas as any).hasSignature = () => !(canvas as any).isEmpty;
                                        
                                        // Override draw to track if signature exists
                                        const originalStartDrawing = startDrawing;
                                        const trackingStartDrawing = (e: MouseEvent | TouchEvent) => {
                                          originalStartDrawing(e);
                                          (canvas as any).isEmpty = false;
                                        };
                                        
                                        const clearButton = document.createElement('button');
                                        clearButton.innerText = 'Clear Signature';
                                        clearButton.className = 'mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700';
                                        clearButton.onclick = (e) => {
                                          e.preventDefault();
                                          ctx.fillStyle = '#374151';
                                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                                          (canvas as any).isEmpty = true;
                                        };
                                        canvas.parentNode?.appendChild(clearButton);
                                        
                                        // Use tracking version of startDrawing
                                        canvas.addEventListener('mousedown', trackingStartDrawing);
                                        canvas.addEventListener('touchstart', trackingStartDrawing, { passive: false });
                                      }
                                    }
                                  }}
                                  className="bg-slate-700 rounded border border-slate-600 cursor-crosshair w-full"
                                  style={{ touchAction: 'none' }}
                                />
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <input type="checkbox" className="w-4 h-4" />
                                <label className="text-slate-100 text-sm">
                                  I certify that all updated information is true and accurate.
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4">
                          <div>
                            {editStep > 1 && (
                              <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => setEditStep(editStep - 1)} 
                                className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:text-white"
                              >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                              </Button>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              type="button" 
                              variant="secondary" 
                              onClick={() => setIsEditPlayerOpen(false)} 
                              className="bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600 hover:text-white"
                            >
                              Cancel
                            </Button>
                            {editStep < 3 ? (
                              <Button 
                                type="button" 
                                onClick={() => setEditStep(editStep + 1)} 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </Button>
                            ) : (
                              <Button 
                                type="button"
                                onClick={() => {
                                  // Only submit when Save Changes is clicked
                                  editPlayerForm.handleSubmit((data) => updatePlayerMutation.mutate(data))();
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white" 
                                disabled={updatePlayerMutation.isPending} 
                                data-testid="button-update-player"
                              >
                                {updatePlayerMutation.isPending ? 'Updating...' : 'Save Changes'}
                              </Button>
                            )}
                          </div>
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
                      <div 
                        key={player.id} 
                        className="bg-slate-700/50 border border-slate-600 rounded-lg p-4" 
                        data-testid={`player-card-${player.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {player.profilePicture ? (
                              <div className="relative">
                                <img
                                  src={player.profilePicture}
                                  alt={`${player.playerName} profile`}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                                  data-testid={`player-photo-${player.id}`}
                                />
                                {player.jerseyNumber && (
                                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {player.jerseyNumber}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                                {player.jerseyNumber || player.playerName?.charAt(0)?.toUpperCase() || '#'}
                              </div>
                            )}
                            <div>
                              <h4 className="text-slate-50 font-medium">{player.playerName}</h4>
                              <p className="text-slate-200 text-sm font-medium">{player.position || 'Position not set'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-slate-200 text-sm font-medium">{player.parentGuardianName}</p>
                              <p className="text-slate-300 text-xs">{player.parentGuardianPhone}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMedicalHistory(player)}
                                className="bg-red-600/20 border-red-500 text-red-300 hover:bg-red-600/30 hover:text-red-200"
                                data-testid={`button-medical-history-${player.id}`}
                              >
                                <Heart className="w-4 h-4 mr-1" />
                                Medical
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPlayer(player)}
                                className="bg-blue-600/20 border-blue-500 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200"
                                data-testid={`button-edit-player-${player.id}`}
                              >
                                Edit
                              </Button>
                            </div>
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
                      <p className="font-semibold text-slate-50 text-lg">
                        Current Plan: <span className="text-blue-300">{formatTier(team.subscriptionTier || 'basic')}</span>
                      </p>
                      <p className="text-sm text-slate-200 font-medium">
                        Status: <span className="text-green-300">{formatSubscriptionStatus(team.subscriptionStatus)}</span>
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      data-testid="button-upgrade-plan" 
                      className="border-slate-500 bg-slate-800/50 text-slate-50 hover:bg-slate-700 hover:text-white hover:border-slate-400"
                      onClick={() => {
                        // For subscription upgrades, show a coming soon message for now
                        // In the future, this would redirect to Stripe checkout
                        toast({
                          title: "Upgrade Plan",
                          description: "Subscription upgrades will be available soon. Contact support for premium features.",
                        });
                      }}
                    >
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
                    <label className="text-sm font-medium text-slate-200">Team Status</label>
                    <p className="text-sm text-slate-100 font-medium">
                      Currently: <Badge variant="outline" data-testid="badge-team-status" className="border-green-500 text-green-200 bg-green-900/30">
                        {team.status || 'active'}
                      </Badge>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Team Color</label>
                    <p className="text-sm text-slate-100 font-medium" data-testid="text-team-color">
                      {team.teamColor || 'Not specified'}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    data-testid="button-edit-settings" 
                    className="border-slate-500 bg-slate-800/50 text-slate-50 hover:bg-slate-700 hover:text-white hover:border-slate-400"
                    onClick={() => {
                      setIsEditTeamOpen(true);
                    }}
                  >
                    Edit Settings
                  </Button>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="bg-slate-800/50 border-slate-600">
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
                    onClick={() => {
                      // Show confirmation dialog for dangerous action
                      if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
                        deleteTeamMutation.mutate();
                      }
                    }}
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

        {/* Edit Team Dialog */}
        <Dialog open={isEditTeamOpen} onOpenChange={setIsEditTeamOpen}>
          <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Edit Team Settings</DialogTitle>
              <DialogDescription className="text-slate-300">
                Update your team's information and settings.
              </DialogDescription>
            </DialogHeader>
            <Form {...editTeamForm}>
              <form onSubmit={editTeamForm.handleSubmit(data => updateTeamMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={editTeamForm.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Team Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-slate-800 border-slate-600 text-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTeamForm.control}
                  name="teamColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Team Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Blue, Red" className="bg-slate-800 border-slate-600 text-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTeamForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Team Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="active" className="text-slate-100">Active</SelectItem>
                          <SelectItem value="inactive" className="text-slate-100">Inactive</SelectItem>
                          <SelectItem value="suspended" className="text-slate-100">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTeamForm.control}
                  name="ageGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Age Group</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., U12, U14, Varsity" className="bg-slate-800 border-slate-600 text-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTeamForm.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Division</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., A, B, Recreational" className="bg-slate-800 border-slate-600 text-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editTeamForm.control}
                  name="homeVenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Home Venue</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Home playing location" className="bg-slate-800 border-slate-600 text-slate-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditTeamOpen(false)} className="border-slate-600 text-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateTeamMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                    {updateTeamMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Medical History Dialog */}
        <Dialog open={isMedicalHistoryOpen} onOpenChange={setIsMedicalHistoryOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-slate-100">
                <Heart className="h-5 w-5 text-red-500" />
                Medical History - {selectedPlayerForMedical?.playerName}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Complete the participation physical evaluation medical history form. All medical data is HIPAA compliant and encrypted.
              </DialogDescription>
            </DialogHeader>
            {selectedPlayerForMedical && (
              <MedicalHistoryForm 
                playerId={selectedPlayerForMedical.id} 
                onComplete={() => setIsMedicalHistoryOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}