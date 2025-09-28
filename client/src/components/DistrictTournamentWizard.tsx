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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Check, Trophy, Users, Settings, Target, Activity } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// District Tournament Form Schema - Simplified for district use
const districtTournamentSchema = z.object({
  // Basic tournament information
  name: z.string().min(1, "Tournament name is required"),
  sport: z.string().min(1, "Sport selection is required"),
  description: z.string().optional(),
  
  // Participant configuration
  participantType: z.enum(["individual", "team"]).default("team"),
  participantCount: z.number().min(2, "At least 2 participants required").max(128, "Maximum 128 participants"),
  teamSize: z.number().min(1).max(50).optional(),
  
  // Tournament structure
  tournamentType: z.enum([
    "single", "double", "round-robin", "pool-play", "swiss-system",
    "multi-event-scoring", "time-trials", "preliminary-finals"
  ]).default("single"),
  
  // Scoring configuration
  scoringMethod: z.enum([
    "head-to-head", "performance-score", "fastest-time", 
    "greatest-distance", "points-accumulated"
  ]).default("head-to-head"),
  
  // Event structure
  isMultiStage: z.boolean().default(false),
  isEventBased: z.boolean().default(false),
  
  // Score direction for leaderboard
  scoreDirection: z.enum(["higher-better", "lower-better"]).default("higher-better"),
  
  // District-specific settings
  schoolsParticipating: z.array(z.string()).optional(),
  districtEvent: z.boolean().default(true),
  
  // Scheduling
  tournamentDate: z.date().optional(),
  location: z.string().optional()
});

type DistrictTournamentForm = z.infer<typeof districtTournamentSchema>;

interface DistrictTournamentWizardProps {
  districtId: string;
  onTournamentCreated?: (tournament: any) => void;
  onCancel?: () => void;
}

export default function DistrictTournamentWizard({ 
  districtId, 
  onTournamentCreated, 
  onCancel 
}: DistrictTournamentWizardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  // Form setup
  const form = useForm<DistrictTournamentForm>({
    resolver: zodResolver(districtTournamentSchema),
    defaultValues: {
      participantType: "team",
      participantCount: 8,
      teamSize: 1,
      tournamentType: "single",
      scoringMethod: "head-to-head",
      isMultiStage: false,
      isEventBased: false,
      scoreDirection: "higher-better",
      districtEvent: true
    }
  });

  // Fetch district tournament templates
  const { data: templates } = useQuery({
    queryKey: [`/api/district/${districtId}/tournament-templates`],
    enabled: !!districtId
  });

  // Create tournament mutation
  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData: DistrictTournamentForm) => {
      // Convert form data to tournament config format
      const config = {
        meta: {
          name: tournamentData.name,
          participantType: tournamentData.participantType,
          participantCount: tournamentData.participantCount,
          teamSize: tournamentData.teamSize
        },
        stages: [{
          engine: mapTournamentTypeToEngine(tournamentData.tournamentType),
          advancementRules: {},
          stageNumber: 1
        }],
        scoring: {
          method: tournamentData.scoringMethod,
          direction: tournamentData.scoreDirection
        },
        structure: {
          isMultiStage: tournamentData.isMultiStage,
          isEventBased: tournamentData.isEventBased
        }
      };

      return apiRequest(`/api/district/${districtId}/tournaments`, {
        method: 'POST',
        body: {
          config,
          sport: tournamentData.sport,
          description: tournamentData.description,
          venue: {
            name: tournamentData.location || 'District Venue',
            address: tournamentData.location || ''
          },
          scheduling: {
            startDate: tournamentData.tournamentDate || new Date()
          }
        }
      });
    },
    onSuccess: (tournament) => {
      toast({
        title: "Tournament Created Successfully",
        description: `${tournament.name} has been created for your district.`
      });
      queryClient.invalidateQueries({ queryKey: [`/api/district/${districtId}/tournaments`] });
      onTournamentCreated?.(tournament);
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Tournament",
        description: error.message || "Failed to create tournament. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Helper function to map tournament types to engines
  const mapTournamentTypeToEngine = (type: string) => {
    switch (type) {
      case 'single': return 'single';
      case 'double': return 'double';
      case 'round-robin': return 'round_robin';
      case 'swiss-system': return 'swiss';
      case 'pool-play':
      case 'multi-event-scoring':
      case 'time-trials':
      case 'preliminary-finals':
        return 'leaderboard';
      default: return 'single';
    }
  };

  // Form submission
  const onSubmit = (data: DistrictTournamentForm) => {
    createTournamentMutation.mutate(data);
  };

  // Step navigation
  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { id: 1, title: "Basic Information", icon: Trophy },
    { id: 2, title: "Tournament Structure", icon: Settings },
    { id: 3, title: "Scoring & Events", icon: Target },
    { id: 4, title: "Review & Create", icon: Check }
  ];

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create District Tournament
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Set up a tournament for your district schools
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-4">
        <Progress value={progress} className="w-full" />
        <div className="flex justify-between">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? "border-blue-600 bg-blue-50"
                      : isCompleted
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Basic Tournament Information</span>
                </CardTitle>
                <CardDescription>
                  Set up the basic details for your district tournament
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., District Basketball Championship"
                          data-testid="input-tournament-name"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sport *</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          data-testid="select-sport"
                          {...field}
                        >
                          <option value="">Select a sport</option>
                          <option value="Basketball">Basketball</option>
                          <option value="Volleyball">Volleyball</option>
                          <option value="Soccer">Soccer</option>
                          <option value="Football">Football</option>
                          <option value="Baseball">Baseball</option>
                          <option value="Softball">Softball</option>
                          <option value="Track and Field">Track and Field</option>
                          <option value="Swimming">Swimming</option>
                          <option value="Cross Country">Cross Country</option>
                          <option value="Tennis">Tennis</option>
                          <option value="Wrestling">Wrestling</option>
                          <option value="Golf">Golf</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <textarea 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="Brief description of the tournament"
                          data-testid="textarea-description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tournament venue"
                            data-testid="input-location"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tournamentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            data-testid="input-tournament-date"
                            {...field}
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Tournament Structure */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Tournament Structure</span>
                </CardTitle>
                <CardDescription>
                  Configure how your tournament will be organized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="participantType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participant Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                          data-testid="radio-participant-type"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="team" id="team" />
                            <Label htmlFor="team">Teams</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual">Individual Athletes</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="participantCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Participants</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="2"
                            max="128"
                            data-testid="input-participant-count"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("participantType") === "team" && (
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Size</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              max="50"
                              data-testid="input-team-size"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="tournamentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tournament Format</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          data-testid="select-tournament-type"
                          {...field}
                        >
                          <option value="single">Single Elimination</option>
                          <option value="double">Double Elimination</option>
                          <option value="round-robin">Round Robin</option>
                          <option value="pool-play">Pool Play + Playoffs</option>
                          <option value="swiss-system">Swiss System</option>
                          <option value="multi-event-scoring">Multi-Event Meet</option>
                          <option value="time-trials">Time Trials</option>
                          <option value="preliminary-finals">Preliminary + Finals</option>
                        </select>
                      </FormControl>
                      <FormDescription>
                        Choose the format that best fits your tournament style
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Scoring & Events */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Scoring & Event Configuration</span>
                </CardTitle>
                <CardDescription>
                  Set up how scoring and events will work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="scoringMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scoring Method</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md"
                          data-testid="select-scoring-method"
                          {...field}
                        >
                          <option value="head-to-head">Head-to-Head (Win/Loss)</option>
                          <option value="performance-score">Performance Score</option>
                          <option value="fastest-time">Fastest Time</option>
                          <option value="greatest-distance">Greatest Distance</option>
                          <option value="points-accumulated">Points Accumulated</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scoreDirection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Score Direction</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                          data-testid="radio-score-direction"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="higher-better" id="higher-better" />
                            <Label htmlFor="higher-better">Higher Score is Better (points, distance)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="lower-better" id="lower-better" />
                            <Label htmlFor="lower-better">Lower Score is Better (time, golf)</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isMultiStage"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Multi-Stage Tournament</FormLabel>
                          <FormDescription>
                            Enable multiple stages (e.g., pools then playoffs)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-multi-stage"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isEventBased"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Event-Based Tournament</FormLabel>
                          <FormDescription>
                            Multiple events with separate scoring (track meet, swimming)
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-event-based"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Create */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Check className="w-5 h-5" />
                  <span>Review & Create Tournament</span>
                </CardTitle>
                <CardDescription>
                  Review your tournament settings before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {form.watch("name")}</p>
                      <p><strong>Sport:</strong> {form.watch("sport")}</p>
                      <p><strong>Location:</strong> {form.watch("location") || "Not specified"}</p>
                      <p><strong>Date:</strong> {form.watch("tournamentDate")?.toLocaleDateString() || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Tournament Structure</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {form.watch("participantType")}</p>
                      <p><strong>Participants:</strong> {form.watch("participantCount")}</p>
                      <p><strong>Format:</strong> {form.watch("tournamentType")}</p>
                      <p><strong>Scoring:</strong> {form.watch("scoringMethod")}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {form.watch("isMultiStage") && (
                    <Badge variant="secondary">Multi-Stage</Badge>
                  )}
                  {form.watch("isEventBased") && (
                    <Badge variant="secondary">Event-Based</Badge>
                  )}
                  <Badge variant="outline">
                    {form.watch("scoreDirection") === "higher-better" ? "Higher = Better" : "Lower = Better"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  data-testid="button-previous"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {onCancel && currentStep === 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              )}
            </div>

            <div>
              {currentStep < 4 && (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {currentStep === 4 && (
                <Button 
                  type="submit" 
                  disabled={createTournamentMutation.isPending}
                  data-testid="button-create-tournament"
                >
                  {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}