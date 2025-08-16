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

  const { data: sports = [] } = useQuery<any[]>({
    queryKey: ["/api/sports"],
  });

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
              <div>
                <Label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </Label>
                <Select 
                  onValueChange={(value) => form.setValue("sport", value)} 
                  value={form.watch("sport") || ""}
                >
                  <SelectTrigger data-testid="select-sport">
                    <SelectValue placeholder="Choose a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={sport.sportName}>
                        <div className="flex items-center gap-2">
                          {sport.sportName}
                          <Badge variant={sport.competitionType === "leaderboard" ? "outline" : "default"}>
                            {sport.competitionType === "leaderboard" ? "Leaderboard" : "Bracket"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="competitionFormat" className="block text-sm font-medium text-gray-700 mb-2">
                  Competition Format *
                </Label>
                <Select 
                  value={form.watch("competitionFormat")} 
                  onValueChange={(value) => form.setValue("competitionFormat", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bracket">Bracket Tournament</SelectItem>
                    <SelectItem value="leaderboard">Leaderboard Competition</SelectItem>
                    <SelectItem value="series">Best-of Series</SelectItem>
                    <SelectItem value="bracket-to-series">Bracket + Championship Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tournamentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Type
                </Label>
                <Select 
                  value={form.watch("tournamentType")}
                  onValueChange={(value) => form.setValue("tournamentType", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Elimination</SelectItem>
                    <SelectItem value="double">Double Elimination (Second Chance Bracket)</SelectItem>
                    <SelectItem value="round-robin">Round Robin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group
                  </Label>
                  <Select
                    value={form.watch("ageGroup") || ""}
                    onValueChange={(value) => form.setValue("ageGroup", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elementary">Elementary (K-5)</SelectItem>
                      <SelectItem value="Middle School">Middle School (6-8)</SelectItem>
                      <SelectItem value="High School">High School (9-12)</SelectItem>
                      <SelectItem value="Adult">Adult (18+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="genderDivision" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender Division
                  </Label>
                  <Select
                    value={form.watch("genderDivision") || ""}
                    onValueChange={(value) => form.setValue("genderDivision", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select division" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Men">Men's</SelectItem>
                      <SelectItem value="Women">Women's</SelectItem>
                      <SelectItem value="Boys">Boys'</SelectItem>
                      <SelectItem value="Girls">Girls'</SelectItem>
                      <SelectItem value="Mixed">Mixed/Open</SelectItem>
                    </SelectContent>
                  </Select>
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