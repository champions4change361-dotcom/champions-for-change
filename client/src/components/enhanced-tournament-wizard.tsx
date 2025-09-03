import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Check, CheckCircle, Play, Trophy, Users, Settings, DollarSign, X, Target } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { insertTournamentSchema } from "@shared/schema";
import TeamManagement from "@/components/team-management";
import { type TeamData } from "@/utils/csv-utils";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { getEventsForSport, type SportEventDefinition } from "@shared/sportEvents";
import { generateRandomNames } from "@/utils/name-generator";

const formSchema = insertTournamentSchema.extend({
  teamSize: z.number().min(2).max(128), // Support up to 128 teams for large tournaments
  tournamentType: z.enum(["single", "double", "double-stage", "pool-play", "round-robin", "swiss-system"]).default("single"),
  competitionFormat: z.enum(["bracket", "leaderboard", "series", "bracket-to-series", "multi-stage"]).default("bracket"),
  ageGroup: z.string().optional(),
  genderDivision: z.string().optional(),
  entryFee: z.string().optional(), // Convert to string for numeric database field
  tournamentDate: z.string().optional(), // ISO string for date field
});

type FormData = z.infer<typeof formSchema>;

interface EnhancedTournamentWizardProps {
  onClose?: () => void;
  onTournamentCreated?: (tournament: any) => void;
  aiRecommendations?: any;
  userType?: 'district' | 'enterprise' | 'free' | 'general';
}

type WizardStep = 'sport' | 'events' | 'settings' | 'launch';

const stepTitles = {
  sport: 'Choose Sport & Format',
  events: 'Select Events & Results Recorders',
  settings: 'Tournament Settings',
  launch: 'Launch Tournament'
};

const stepDescriptions = {
  sport: 'Select your sport and competition format',
  events: 'Choose events and assign Results Recorders for each',
  settings: 'Configure tournament details and registration settings',
  launch: 'Tournament is ready for participant registration!'
};

export default function EnhancedTournamentWizard({ 
  onClose, 
  onTournamentCreated, 
  aiRecommendations,
  userType = 'general'
}: EnhancedTournamentWizardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<WizardStep>('sport');
  const [selectedEvents, setSelectedEvents] = useState<SportEventDefinition[]>([]);
  const [eventRecorders, setEventRecorders] = useState<Record<string, string>>({});
  const [createdTournament, setCreatedTournament] = useState<any>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // Cascading dropdown state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');

  // Comprehensive sport categories system
  const sportCategories = {
    athletic: {
      name: 'Athletic',
      subcategories: {
        team_sports: {
          name: 'Team Sports',
          sports: [
            'Basketball (Boys)', 'Basketball (Girls)', 'Football', 'Soccer (Boys)', 'Soccer (Girls)',
            'Volleyball (Boys)', 'Volleyball (Girls)', 'Baseball', 'Softball', 'Hockey',
            'Rugby', 'Ultimate Frisbee', 'Water Polo', 'Field Hockey'
          ]
        },
        individual_sports: {
          name: 'Individual Sports',
          sports: [
            'Track & Field', 'Swimming & Diving', 'Cross Country', 'Tennis (Boys)',
            'Tennis (Girls)', 'Golf (Boys)', 'Golf (Girls)', 'Wrestling', 'Gymnastics',
            'Archery', 'Bowling', 'Martial Arts', 'Cycling', 'Fencing'
          ]
        },
        winter_sports: {
          name: 'Winter Sports',
          sports: ['Skiing', 'Snowboarding', 'Ice Hockey', 'Figure Skating', 'Curling']
        }
      }
    },
    academic: {
      name: 'Academic',
      subcategories: {
        uil_academic: {
          name: 'UIL Academic Competitions',
          sports: [
            'Accounting', 'Calculator Applications', 'Computer Applications', 'Computer Science',
            'Current Issues & Events', 'Economics', 'Literary Criticism', 'Mathematics',
            'Number Sense', 'Science', 'Social Studies', 'Spelling & Vocabulary'
          ]
        },
        speech_debate: {
          name: 'Speech & Debate',
          sports: [
            'Cross Examination Debate', 'Lincoln-Douglas Debate', 'Informative Speaking',
            'Persuasive Speaking', 'Poetry Interpretation', 'Prose Interpretation',
            'Extemporaneous Speaking', 'Original Oratory'
          ]
        },
        stem_competitions: {
          name: 'STEM Competitions',
          sports: [
            'Science Olympiad', 'Math Olympiad', 'Robotics Competition', 'Engineering Challenge',
            'Programming Competition', 'Quiz Bowl', 'Academic Decathlon', 'Destination Imagination'
          ]
        }
      }
    },
    fine_arts: {
      name: 'Fine Arts',
      subcategories: {
        music: {
          name: 'Music',
          sports: [
            'Concert Band', 'Marching Band', 'Jazz Band', 'Orchestra', 'Choir',
            'Solo & Ensemble', 'All-State Auditions', 'Piano Competition'
          ]
        },
        visual_arts: {
          name: 'Visual Arts',
          sports: [
            'Art Competition', 'Photography', 'Digital Art', 'Sculpture',
            'Painting', 'Drawing', 'Ceramics', 'Graphic Design'
          ]
        },
        performing_arts: {
          name: 'Performing Arts',
          sports: [
            'One Act Play', 'Musical Theater', 'Dance Competition', 'Drama',
            'Improvisation', 'Monologue Competition', 'Technical Theater'
          ]
        }
      }
    }
  };

  const { data: sports = [] } = useQuery<any[]>({
    queryKey: ["/api/sports"],
  });

  // Get available sports based on selected category and subcategory
  const getAvailableSports = () => {
    if (!selectedCategory || !selectedSubcategory) return [];
    
    const category = sportCategories[selectedCategory as keyof typeof sportCategories];
    if (!category) return [];
    
    const subcategory = (category.subcategories as any)[selectedSubcategory];
    return subcategory ? subcategory.sports : [];
  };

  // Reset selections when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
    form.setValue("sport", "");
  };

  // Reset sport when subcategory changes
  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    form.setValue("sport", "");
  };

  // Auto-populate events when sport is selected
  const handleSportChange = (sport: string) => {
    form.setValue("sport", sport);
    
    // Auto-populate events for multi-event sports
    const availableEvents = getEventsForSport(sport);
    if (availableEvents.length > 0) {
      // For swimming and track, auto-select all events
      // User can deselect what they don't need
      setSelectedEvents(availableEvents);
    } else {
      setSelectedEvents([]);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      teamSize: 8,
      tournamentType: "single",
      competitionFormat: "bracket",
      status: "upcoming",
      bracket: {},
    },
  });

  // Apply AI recommendations when component mounts
  useEffect(() => {
    if (aiRecommendations && sports.length > 0) {
      const { name, sport, format, age_group, gender_division, teamSize } = aiRecommendations;
      
      if (sport) {
        const matchingSport = sports.find(s => 
          s.sportName === sport || 
          s.sportName.toLowerCase().includes(sport.toLowerCase()) ||
          sport.toLowerCase().includes(s.sportName.toLowerCase())
        );
        if (matchingSport) {
          form.setValue("sport", matchingSport.sportName);
        }
      }
      
      if (format) {
        form.setValue("competitionFormat", format);
        if (format === "bracket") form.setValue("tournamentType", "single");
        else if (format === "leaderboard") form.setValue("tournamentType", "round-robin");
      }
      
      if (age_group && age_group !== "All Ages") form.setValue("ageGroup", age_group);
      if (gender_division) form.setValue("genderDivision", gender_division);
      if (teamSize) {
        // Clamp to valid range and use the provided value directly
        const clampedSize = Math.max(2, Math.min(128, teamSize));
        form.setValue("teamSize", clampedSize);
      }
      
      // Use provided name or auto-generate tournament name
      if (name) {
        form.setValue("name", name);
      } else {
        const sportName = sport || "Championship";
        const agePart = age_group && age_group !== "All Ages" ? `${age_group} ` : "";
        const genderPart = gender_division && gender_division !== "Mixed" ? `${gender_division} ` : "";
        const autoName = `${agePart}${genderPart}${sportName} Tournament`;
        form.setValue("name", autoName);
      }
    }
  }, [aiRecommendations, sports, form]);

  // Auto-save functionality
  useEffect(() => {
    // Load draft from localStorage on component mount
    const savedDraft = localStorage.getItem('tournamentDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        // Restore form values
        Object.keys(draftData).forEach(key => {
          if (key !== 'teams' && key !== 'currentStep' && key !== 'draftId') {
            form.setValue(key as any, draftData[key]);
          }
        });
        // Restore events and step
        if (draftData.selectedEvents) setSelectedEvents(draftData.selectedEvents);
        if (draftData.eventRecorders) setEventRecorders(draftData.eventRecorders);
        if (draftData.currentStep) setCurrentStep(draftData.currentStep);
        
        toast({
          title: "Draft Restored",
          description: "Your previous tournament draft has been restored.",
        });
      } catch (error) {
        console.error("Failed to load draft:", error);
        localStorage.removeItem('tournamentDraft');
      }
    }
  }, [form, toast]);

  // Auto-save to localStorage whenever form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.name || value.sport) { // Only save if there's meaningful content
        const draftData = { ...value, selectedEvents, eventRecorders, currentStep };
        localStorage.setItem('tournamentDraft', JSON.stringify(draftData));
        setAutoSaveStatus('saved');
      }
    });
    return () => subscription.unsubscribe();
  }, [form, selectedEvents, eventRecorders, currentStep]);

  const selectedSport = sports.find(sport => sport.sportName === form.watch("sport"));
  const isLeaderboardSport = selectedSport?.competitionType === "leaderboard";
  const competitionFormat = form.watch("competitionFormat");
  const teamSize = form.watch("teamSize");

  const createTournamentMutation = useMutation({
    mutationFn: async (data: FormData & { teams: TeamData[] }) => {
      // Transform data to match database schema
      const transformedData = {
        ...data,
        teams: data.teams,
        entryFee: data.entryFee ? String(data.entryFee) : "0", // Convert to string for numeric field
        tournamentDate: data.tournamentDate ? (data.tournamentDate instanceof Date ? data.tournamentDate.toISOString().slice(0, 16) : String(data.tournamentDate)) : null, // Ensure string format
        scoringMethod: selectedSport?.scoringMethod || "wins",
        isGuestCreated: !user, // Mark as guest-created for tournaments created without login
        // Configure double-stage tournaments to use multi-stage format
        competitionFormat: data.tournamentType === 'double-stage' ? 'multi-stage' : (data.competitionFormat || 'bracket'),
        totalStages: data.tournamentType === 'double-stage' ? 2 : 1,
        stageConfiguration: data.tournamentType === 'double-stage' ? {
          stage1: {
            name: 'Group Stage',
            format: 'round-robin',
            description: 'Teams compete in groups to advance to knockout stage'
          },
          stage2: {
            name: 'Knockout Stage', 
            format: 'single-elimination',
            description: 'Top teams from each group compete in elimination bracket'
          }
        } : null
      };
      
      const response = await apiRequest("/api/tournaments", "POST", transformedData);
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedTournament(data.tournament);
      // Stay on launch step to show success message
      // setCurrentStep('launch'); // Keep on current step
      toast({
        title: "Tournament Created Successfully!",
        description: `${data.tournament.name} has been created successfully with ${selectedEvents.length} event${selectedEvents.length !== 1 ? 's' : ''}.`,
      });
      
      // Clear draft data on successful creation
      localStorage.removeItem('tournamentDraft');
      setAutoSaveStatus(null);
      
      // Invalidate tournament queries
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-tournaments"] });
      
      if (onTournamentCreated) {
        onTournamentCreated(data.tournament);
      }
    },
    onError: (error) => {
      toast({
        title: "Error Creating Tournament",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: FormData & { teams: TeamData[], status: 'draft' }) => {
      // Transform data to match database schema
      const transformedData = {
        ...data,
        teams: data.teams,
        status: 'draft',
        entryFee: data.entryFee ? String(data.entryFee) : "0", // Convert to string for numeric field
        tournamentDate: data.tournamentDate ? (data.tournamentDate instanceof Date ? data.tournamentDate.toISOString().slice(0, 16) : String(data.tournamentDate)) : null, // Ensure string format
        scoringMethod: selectedSport?.scoringMethod || "wins",
        isGuestCreated: !user,
      };
      
      const response = await apiRequest("/api/tournaments", "POST", transformedData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Draft Saved!",
        description: "Your tournament draft has been saved successfully.",
      });
      setAutoSaveStatus('saved');
      setIsDraftSaving(false);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-tournaments"] });
      
      // Update localStorage with saved draft ID
      const draftData = { ...form.getValues(), selectedEvents, eventRecorders, currentStep, draftId: data.tournament.id };
      localStorage.setItem('tournamentDraft', JSON.stringify(draftData));
    },
    onError: (error) => {
      toast({
        title: "Draft Save Failed",
        description: "Failed to save tournament draft. Your progress is saved locally.",
        variant: "destructive",
      });
      setAutoSaveStatus('error');
      setIsDraftSaving(false);
      console.error("Draft save error:", error);
    },
  });

  const steps: WizardStep[] = ['sport', 'events', 'settings', 'launch'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceedFromStep = (step: WizardStep): boolean => {
    switch (step) {
      case 'sport':
        return !!(form.watch("sport") && form.watch("competitionFormat"));
      case 'events':
        return selectedEvents.length > 0;
      case 'settings':
        return !!(form.watch("name"));
      case 'launch':
        // For launch step, check that all required data is present (not that tournament already exists)
        return !!(form.watch("name") && form.watch("sport") && selectedEvents.length > 0 && !createdTournament);
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedFromStep(currentStep)) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleCreateTournament = () => {
    const formData = form.getValues();
    // For event-based tournaments, we create the tournament first
    // Participants will register for specific events later
    createTournamentMutation.mutate({ ...formData, teams: [] });
  };

  const handleEventRecorderUpdate = (eventName: string, recorder: string) => {
    setEventRecorders(prev => ({ ...prev, [eventName]: recorder }));
  };

  const getStepIcon = (step: WizardStep) => {
    switch (step) {
      case 'sport': return <Trophy className="w-5 h-5" />;
      case 'events': return <Target className="w-5 h-5" />;
      case 'settings': return <Settings className="w-5 h-5" />;
      case 'launch': return <Play className="w-5 h-5" />;
    }
  };

  // Function to clear cached data
  const clearCachedData = () => {
    localStorage.removeItem('tournament_draft');
    form.reset();
    setSelectedEvents([]);
    setEventRecorders({});
    setCurrentStep('sport');
    toast({
      title: "Cache Cleared",
      description: "All cached tournament data has been cleared.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="enhanced-tournament-wizard">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                {getStepIcon(currentStep)}
                <span className="truncate">{stepTitles[currentStep]}</span>
              </CardTitle>
              <CardDescription className="mt-1">{stepDescriptions[currentStep]}</CardDescription>
            </div>
            
            {/* Mobile-first action bar */}
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              {/* Auto-save status - more compact */}
              {autoSaveStatus && (
                <div className="flex items-center gap-1 text-xs">
                  {autoSaveStatus === 'saved' && (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">Auto-saved</span>
                    </>
                  )}
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full" />
                      <span className="text-blue-600">Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <X className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">Save failed</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {/* Save Draft - more compact */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDraftSaving(true);
                    const formData = form.getValues();
                    saveDraftMutation.mutate({ ...formData, teams: [], status: 'draft' as const });
                  }}
                  disabled={isDraftSaving || saveDraftMutation.isPending || !form.watch("name")}
                  className="flex items-center gap-1 text-xs"
                  data-testid="button-save-draft"
                >
                  {isDraftSaving || saveDraftMutation.isPending ? (
                    <div className="animate-spin h-3 w-3 border-2 border-gray-500 border-t-transparent rounded-full" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">Save Draft</span>
                  <span className="sm:hidden">Save</span>
                </Button>
                
                {/* Step indicator */}
                <Badge variant="outline" className="text-xs px-2 py-1">
                  Step {currentStepIndex + 1} of {steps.length}
                </Badge>
                
                {/* Clear Cache Button - helpful for mobile users */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCachedData}
                  className="flex items-center gap-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                  data-testid="button-clear-cache"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Progress bar with some breathing room */}
          <div className="mt-4">
            <Progress value={progress} className="w-full h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 'sport' && (
            <div className="space-y-6">
              {/* Step 1: Category Selection */}
              <div>
                <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Category *
                </Label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  data-testid="select-category"
                >
                  <option value="">Select broader category</option>
                  {Object.entries(sportCategories).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose from Athletic, Academic, or Fine Arts competitions
                </p>
              </div>

              {/* Step 2: Subcategory Selection */}
              {selectedCategory && (
                <div>
                  <Label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Area *
                  </Label>
                  <select 
                    value={selectedSubcategory}
                    onChange={(e) => handleSubcategoryChange(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    data-testid="select-subcategory"
                  >
                    <option value="">Select specific area</option>
                    {Object.entries(sportCategories[selectedCategory as keyof typeof sportCategories].subcategories).map(([key, subcategory]) => (
                      <option key={key} value={key}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Step 3: Sport Selection */}
              {selectedCategory && selectedSubcategory && (
                <div>
                  <Label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Competition *
                  </Label>
                  <select 
                    onChange={(e) => handleSportChange(e.target.value)} 
                    value={form.watch("sport") || ""}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    data-testid="select-sport"
                  >
                    <option value="">Choose specific competition</option>
                    {getAvailableSports().map((sport: string, index: number) => (
                      <option key={index} value={sport}>
                        {sport}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Help text showing selection path */}
              {selectedCategory && selectedSubcategory && form.watch("sport") && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Selection Complete:</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {(sportCategories as any)[selectedCategory].name} → {" "}
                    {(sportCategories as any)[selectedCategory].subcategories[selectedSubcategory].name} → {" "}
                    {form.watch("sport")}
                  </p>
                </div>
              )}


              <div>
                <Label htmlFor="competitionFormat" className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Format *
                </Label>
                <select 
                  value={form.watch("competitionFormat")} 
                  onChange={(e) => form.setValue("competitionFormat", e.target.value as any)}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose format</option>
                  <option value="bracket">Bracket Tournament</option>
                  <option value="leaderboard">Leaderboard Competition</option>
                  <option value="series">Best-of Series</option>
                  <option value="bracket-to-series">Bracket + Championship Series</option>
                </select>
              </div>

              <div>
                <Label htmlFor="tournamentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Type
                </Label>
                <select 
                  value={form.watch("tournamentType")}
                  onChange={(e) => form.setValue("tournamentType", e.target.value as any)}
                  className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select tournament type</option>
                  <option value="single">Single Elimination</option>
                  <option value="double">Double Elimination (Second Chance Bracket)</option>
                  <option value="double-stage">Double Stage (Group + Bracket)</option>
                  <option value="round-robin">Round Robin</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group
                  </Label>
                  <select
                    value={form.watch("ageGroup") || ""}
                    onChange={(e) => {
                      console.log("Age group selected:", e.target.value);
                      form.setValue("ageGroup", e.target.value);
                    }}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    data-testid="select-age-group"
                  >
                    <option value="">Select age group</option>
                    <option value="Elementary">Elementary (K-5)</option>
                    <option value="Middle School">Middle School (6-8)</option>
                    <option value="High School">High School (9-12)</option>
                    <option value="Adult">Adult (18+)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="genderDivision" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender Division
                  </Label>
                  <select
                    value={form.watch("genderDivision") || ""}
                    onChange={(e) => {
                      console.log("Gender division selected:", e.target.value);
                      form.setValue("genderDivision", e.target.value);
                    }}
                    className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    data-testid="select-gender-division"
                  >
                    <option value="">Select division</option>
                    <option value="Men">Men's</option>
                    <option value="Women">Women's</option>
                    <option value="Boys">Boys'</option>
                    <option value="Girls">Girls'</option>
                    <option value="Mixed">Mixed/Open</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'events' && (
            <div className="space-y-6">
              {form.watch("sport") && getEventsForSport(form.watch("sport")).length > 0 ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {form.watch("sport")} Events ({selectedEvents.length} of {getEventsForSport(form.watch("sport")).length} selected)
                    </h4>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getEventsForSport(form.watch("sport")).map((event, index) => {
                        const isSelected = selectedEvents.some(e => e.eventName === event.eventName);
                        return (
                          <div key={index} className={`flex items-center justify-between p-2 rounded border ${
                            isSelected ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedEvents(prev => [...prev, event]);
                                  } else {
                                    setSelectedEvents(prev => prev.filter(e => e.eventName !== event.eventName));
                                  }
                                }}
                              />
                              <span className={`font-medium ${
                                isSelected ? 'text-gray-900' : 'text-gray-500'
                              }`}>{event.eventName}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                                {event.eventType}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {event.scoringUnit}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm text-blue-700">
                        <p>Choose which events to include in your tournament</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEvents(getEventsForSport(form.watch("sport")))}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedEvents([])}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Results Recorder Assignment - Enhanced Google Sheets Style */}
                  {selectedEvents.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Event Assignments (Like Google Sheets Signup)
                      </h4>
                      <p className="text-sm text-green-700 mb-4">
                        Set up events for coach self-selection, just like your current Google Sheets process. Coaches will log in and claim their preferred events.
                      </p>
                      
                      <div className="space-y-3">
                        {selectedEvents.map((event, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 mb-1">
                                {event.eventName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {event.eventType} • {event.scoringUnit} • Max {event.maxAttempts || 3} attempts
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Select
                                value={eventRecorders[event.eventName] || 'open'}
                                onValueChange={(value) => handleEventRecorderUpdate(event.eventName, value)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Assignment type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">🟢 Open for Self-Selection</SelectItem>
                                  <SelectItem value="pre-assigned">🔵 Pre-Assign Specific Coach</SelectItem>
                                  <SelectItem value="manager-only">🔴 Tournament Manager Only</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              {eventRecorders[event.eventName] === 'pre-assigned' && (
                                <Input
                                  placeholder="Coach name/email"
                                  className="w-48 text-sm"
                                  // This would store the actual assignment
                                />
                              )}
                              
                              <Badge 
                                variant="outline" 
                                className="text-xs bg-green-100 text-green-700 border-green-300"
                              >
                                {eventRecorders[event.eventName] === 'open' ? 'Available' : 
                                 eventRecorders[event.eventName] === 'pre-assigned' ? 'Assigned' : 'Restricted'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h5 className="font-medium text-blue-900 mb-2">🎯 Coach Experience (Based on Your Feedback)</h5>
                        <div className="text-sm text-blue-700 space-y-1">
                          <p>• <strong>Open Events:</strong> Coaches log in and claim "I'll take discus on Day 1" (like Google Sheets)</p>
                          <p>• <strong>Pre-Assigned:</strong> You assign specific coaches, they accept/decline the assignment</p>
                          <p>• <strong>Traditions:</strong> System remembers "Coach always does discus and triple jump"</p>
                          <p>• <strong>Event Access:</strong> Each coach only sees their assigned event dashboard on tournament day</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Please select a sport first to configure events</p>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('sport')}
                    className="mt-3"
                  >
                    Go Back to Sport Selection
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'settings' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Name *
                </Label>
                <Input
                  {...form.register("name")}
                  placeholder="Enter tournament name"
                  data-testid="input-tournament-name"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tournamentDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Date & Time
                  </Label>
                  <Input
                    type="datetime-local"
                    {...form.register("tournamentDate")}
                    className="w-full"
                    data-testid="input-tournament-date"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When will the tournament take place?
                  </p>
                </div>

                <div>
                  <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location / Address
                  </Label>
                  <AddressAutocomplete
                    value={form.watch("location") || ""}
                    onChange={(value) => form.setValue("location", value)}
                    placeholder="Enter venue address or location"
                    className="w-full"
                    data-testid="input-location"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Where will the tournament be held? Start typing for address suggestions.
                  </p>
                </div>
              </div>

              {/* Registration Fee & Payment Settings */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Registration Fee & Payment (Optional)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-2">
                      Registration Fee ($)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register("entryFee")}
                      placeholder="0.00"
                      className="w-full"
                      data-testid="input-entry-fee"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank for free tournaments
                    </p>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Enable Donations
                    </Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...form.register("donationsEnabled")}
                        className="rounded border-gray-300"
                        data-testid="checkbox-donations-enabled"
                      />
                      <span className="text-sm text-gray-600">
                        Allow additional donations during registration
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Perfect for fundraising tournaments
                    </p>
                  </div>
                </div>

                {form.watch("donationsEnabled") && (
                  <div>
                    <Label htmlFor="donationGoal" className="block text-sm font-medium text-gray-700 mb-2">
                      Donation Goal ($)
                    </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]+(\.[0-9]{1,2})?"
                      {...form.register("donationGoal")}
                      placeholder="1000.00"
                      className="w-full"
                      data-testid="input-donation-goal"
                    />
                  </div>
                )}

                <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                  <strong>Foundation Plan:</strong> 2% platform fee supports student education. You keep 98% of all payments.
                </div>
              </div>

              <div>
                <Label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
                  {competitionFormat === 'leaderboard' ? 'Number of Participants' : 'Number of Teams'} *
                </Label>
                <div className="space-y-3">
                  {/* Quick Selection Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[4, 8, 16, 32, 64].map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={teamSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => form.setValue("teamSize", size)}
                        className="h-8 px-3"
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Custom Input - Better UX */}
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={teamSize || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
                        const numValue = parseInt(value);
                        if (value === "" || (numValue >= 2 && numValue <= 128)) {
                          form.setValue("teamSize", value === "" ? 2 : numValue);
                        }
                      }}
                      placeholder="Enter number of teams (2-128)"
                      className="w-full text-center text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      data-testid="input-team-size"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      Max: 128
                    </div>
                  </div>
                </div>
                
                {teamSize && teamSize > 64 && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                    <strong>Large Tournament:</strong> Tournaments with {teamSize}+ teams may require multiple rounds and extended time.
                  </div>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tournament Structure</h4>
                <p className="text-sm text-blue-700">
                  {competitionFormat === 'bracket' 
                    ? `${Math.ceil(Math.log2(teamSize || 2))} rounds of elimination matches`
                    : competitionFormat === 'leaderboard'
                    ? 'Individual performance rankings based on scores/times'
                    : `Series format with best-of matches`
                  }
                </p>
              </div>
            </div>
          )}

          {currentStep === 'launch' && !createdTournament && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tournament Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {form.watch("name")}</div>
                    <div><strong>Sport:</strong> {form.watch("sport")}</div>
                    <div><strong>Format:</strong> {competitionFormat}</div>
                    <div><strong>Events:</strong> {selectedEvents.length} selected</div>
                    {form.watch("ageGroup") && <div><strong>Age Group:</strong> {form.watch("ageGroup")}</div>}
                    {form.watch("genderDivision") && <div><strong>Division:</strong> {form.watch("genderDivision")}</div>}
                    {form.watch("tournamentDate") && (
                      <div><strong>Date:</strong> {new Date(form.watch("tournamentDate") || '').toLocaleDateString()} at {new Date(form.watch("tournamentDate") || '').toLocaleTimeString()}</div>
                    )}
                    {form.watch("location") && <div><strong>Location:</strong> {form.watch("location")}</div>}
                    {form.watch("entryFee") && parseFloat(form.watch("entryFee") || '0') > 0 && (
                      <div><strong>Registration Fee:</strong> ${form.watch("entryFee")}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Selected Events</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {selectedEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">{event.eventName}</span>
                        <Badge variant="secondary" className="text-xs">{event.eventType}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready to Launch Tournament</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your tournament will be created with event-specific registration. Participants can sign up for individual events they want to compete in.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'launch' && createdTournament && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tournament Created Successfully!</h3>
                <p className="text-gray-600">
                  <strong>{createdTournament.name}</strong> has been created! Participants can now register for events through the event-specific registration system.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => window.open(`/tournament/${createdTournament.id}`, '_blank')}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-view-tournament"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Tournament
                </Button>
                
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Create Another Tournament
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {!createdTournament && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep === 'launch' ? (
                <Button
                  onClick={handleCreateTournament}
                  disabled={createTournamentMutation.isPending || !canProceedFromStep(currentStep)}
                  data-testid="button-create-tournament"
                >
                  {createTournamentMutation.isPending ? 'Creating...' : 'Create Tournament'}
                  <Trophy className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep(currentStep)}
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}