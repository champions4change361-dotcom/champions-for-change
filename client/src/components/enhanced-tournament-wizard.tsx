import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, CheckCircle, Play, Trophy, Users, Settings } from "lucide-react";
import { insertTournamentSchema } from "@shared/schema";
import TeamManagement from "@/components/team-management";
import { type TeamData } from "@/utils/csv-utils";

const formSchema = insertTournamentSchema.extend({
  teamSize: z.number().min(4).max(32),
  tournamentType: z.enum(["single", "double", "pool-play", "round-robin", "swiss-system"]).default("single"),
  competitionFormat: z.enum(["bracket", "leaderboard", "series", "bracket-to-series", "multi-stage"]).default("bracket"),
  ageGroup: z.string().optional(),
  genderDivision: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EnhancedTournamentWizardProps {
  onClose?: () => void;
  onTournamentCreated?: (tournament: any) => void;
  aiRecommendations?: any;
  userType?: 'district' | 'enterprise' | 'free' | 'general';
}

type WizardStep = 'sport' | 'size' | 'teams' | 'preview' | 'start';

const stepTitles = {
  sport: 'Choose Sport & Format',
  size: 'Set Tournament Size',
  teams: 'Enter Team Names',
  preview: 'Review & Generate',
  start: 'Start Tournament'
};

const stepDescriptions = {
  sport: 'Select your sport and competition format',
  size: 'Choose how many teams will participate',
  teams: 'Add team names manually or import from CSV',
  preview: 'Review all details and generate bracket/leaderboard',
  start: 'Tournament is ready to begin!'
};

export default function EnhancedTournamentWizard({ 
  onClose, 
  onTournamentCreated, 
  aiRecommendations,
  userType = 'general'
}: EnhancedTournamentWizardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<WizardStep>('sport');
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [createdTournament, setCreatedTournament] = useState<any>(null);

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
      const { sport, format, age_group, gender_division, teamSize } = aiRecommendations;
      
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
        const validSizes = [4, 8, 16, 32];
        const closestSize = validSizes.reduce((prev, curr) => 
          Math.abs(curr - teamSize) < Math.abs(prev - teamSize) ? curr : prev
        );
        form.setValue("teamSize", closestSize);
      }
      
      // Auto-generate tournament name
      const sportName = sport || "Championship";
      const agePart = age_group && age_group !== "All Ages" ? `${age_group} ` : "";
      const genderPart = gender_division && gender_division !== "Mixed" ? `${gender_division} ` : "";
      const autoName = `${agePart}${genderPart}${sportName} Tournament`;
      form.setValue("name", autoName);
    }
  }, [aiRecommendations, sports, form]);

  const selectedSport = sports.find(sport => sport.sportName === form.watch("sport"));
  const isLeaderboardSport = selectedSport?.competitionType === "leaderboard";
  const competitionFormat = form.watch("competitionFormat");
  const teamSize = form.watch("teamSize");

  const createTournamentMutation = useMutation({
    mutationFn: async (data: FormData & { teams: TeamData[] }) => {
      const response = await apiRequest("POST", "/api/tournaments", {
        ...data,
        teams: data.teams,
        scoringMethod: selectedSport?.scoringMethod || "wins",
      });
      return response.json();
    },
    onSuccess: (data) => {
      setCreatedTournament(data.tournament);
      setCurrentStep('start');
      toast({
        title: "Tournament Created Successfully!",
        description: `${data.tournament.name} is ready with ${teams.length} ${competitionFormat === 'leaderboard' ? 'participants' : 'teams'}.`,
      });
      
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

  const steps: WizardStep[] = ['sport', 'size', 'teams', 'preview', 'start'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceedFromStep = (step: WizardStep): boolean => {
    switch (step) {
      case 'sport':
        return !!(form.watch("sport") && form.watch("competitionFormat"));
      case 'size':
        return !!(form.watch("teamSize") && form.watch("name"));
      case 'teams':
        return teams.filter(t => t.teamName.trim()).length === teamSize;
      case 'preview':
        return true;
      case 'start':
        return !!createdTournament;
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
    createTournamentMutation.mutate({ ...formData, teams });
  };

  const handleTeamsUpdate = (updatedTeams: TeamData[]) => {
    setTeams(updatedTeams);
  };

  const getStepIcon = (step: WizardStep) => {
    switch (step) {
      case 'sport': return <Settings className="w-5 h-5" />;
      case 'size': return <Users className="w-5 h-5" />;
      case 'teams': return <Users className="w-5 h-5" />;
      case 'preview': return <Trophy className="w-5 h-5" />;
      case 'start': return <Play className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="enhanced-tournament-wizard">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStepIcon(currentStep)}
                {stepTitles[currentStep]}
              </CardTitle>
              <CardDescription>{stepDescriptions[currentStep]}</CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Step {currentStepIndex + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
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
                    onChange={(e) => form.setValue("sport", e.target.value)} 
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

          {currentStep === 'size' && (
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

              <div>
                <Label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
                  {competitionFormat === 'leaderboard' ? 'Number of Participants' : 'Number of Teams'} *
                </Label>
                <Select
                  value={teamSize?.toString()}
                  onValueChange={(value) => form.setValue("teamSize", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8">8 {competitionFormat === 'leaderboard' ? 'Participants' : 'Teams'}</SelectItem>
                    <SelectItem value="16">16 {competitionFormat === 'leaderboard' ? 'Participants' : 'Teams'}</SelectItem>
                    <SelectItem value="32">32 {competitionFormat === 'leaderboard' ? 'Participants' : 'Teams'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tournament Structure</h4>
                <p className="text-sm text-blue-700">
                  {competitionFormat === 'bracket' 
                    ? `${Math.ceil(Math.log2(teamSize))} rounds of elimination matches`
                    : competitionFormat === 'leaderboard'
                    ? 'Individual performance rankings based on scores/times'
                    : `Series format with best-of matches`
                  }
                </p>
              </div>
            </div>
          )}

          {currentStep === 'teams' && (
            <TeamManagement
              teamCount={teamSize}
              onTeamsUpdate={handleTeamsUpdate}
              tournamentType={userType}
              competitionFormat={competitionFormat}
            />
          )}

          {currentStep === 'preview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tournament Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {form.watch("name")}</div>
                    <div><strong>Sport:</strong> {form.watch("sport")}</div>
                    <div><strong>Format:</strong> {competitionFormat}</div>
                    <div><strong>Type:</strong> {form.watch("tournamentType")}</div>
                    <div><strong>Size:</strong> {teamSize} {competitionFormat === 'leaderboard' ? 'participants' : 'teams'}</div>
                    {form.watch("ageGroup") && <div><strong>Age Group:</strong> {form.watch("ageGroup")}</div>}
                    {form.watch("genderDivision") && <div><strong>Division:</strong> {form.watch("genderDivision")}</div>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{competitionFormat === 'leaderboard' ? 'Participants' : 'Teams'}</h3>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {teams.map((team, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">{team.teamName}</span>
                        {team.captainName && <span className="text-gray-600">{team.captainName}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready to Create Tournament</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  All required information is complete. Click "Create Tournament" to generate your {competitionFormat === 'bracket' ? 'bracket' : 'leaderboard'}.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'start' && createdTournament && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Tournament Created Successfully!</h3>
                <p className="text-gray-600">
                  <strong>{createdTournament.name}</strong> is ready with {teams.length} {competitionFormat === 'leaderboard' ? 'participants' : 'teams'}.
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
      {currentStep !== 'start' && (
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

              {currentStep === 'preview' ? (
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