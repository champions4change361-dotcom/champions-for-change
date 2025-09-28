import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Trophy, 
  Users, 
  Timer, 
  FileText, 
  Save, 
  Check, 
  AlertTriangle,
  GraduationCap,
  Medal,
  Target,
  Calculator,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  Award
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  insertAcademicResultSchema,
  insertAcademicOfficialSchema,
  type InsertAcademicResult,
  type InsertAcademicOfficial
} from "@shared/schema";

// Use shared schemas for scoring operations
const participantScoreSchema = insertAcademicResultSchema.extend({
  medal: z.enum(["gold", "silver", "bronze", "none"]).default("none"),
  advancementLevel: z.string().optional(),
  performanceNotes: z.string().optional(),
  judgeComments: z.string().optional()
});

const judgeAssignmentSchema = insertAcademicOfficialSchema.extend({
  judgeIds: z.array(z.string()).min(1, "At least one judge required"),
  assignmentType: z.enum(["head_judge", "judge", "grader", "timekeeper"]),
  room: z.string().optional(),
  timeSlot: z.string().optional()
});

type ParticipantScoreData = z.infer<typeof participantScoreSchema>;
type JudgeAssignmentData = z.infer<typeof judgeAssignmentSchema>;

interface AcademicMeet {
  id: string;
  meetName: string;
  meetDate: string;
  status: string;
  competitions: string[];
  location: string;
}

interface UILCompetition {
  id: string;
  name: string;
  category: string;
  contestFormat: string;
  maxParticipants: number;
  isTeamEvent: boolean;
  advancementRules: {
    individualAdvance: number;
    teamAdvance: number;
  };
}

interface AcademicParticipant {
  id: string;
  firstName: string;
  lastName: string;
  grade: number;
  studentId: string;
  schoolName: string;
  participantRole: string;
  entryPosition: number;
}

interface AcademicResult {
  id: string;
  participantId: string;
  participantName: string;
  schoolName: string;
  score: number;
  rank: number;
  placement: number;
  medal: string;
  advances: boolean;
  advancementLevel?: string;
  judgeComments?: string;
  isVerified: boolean;
}

interface ScoringRubric {
  competitionId: string;
  competitionName: string;
  contestFormat: string;
  scoringMethod: 'points' | 'time' | 'rank' | 'percentage';
  maxScore?: number;
  passingScore?: number;
  timeLimit?: number;
  criteria: Array<{
    criterion: string;
    maxPoints: number;
    description: string;
  }>;
  advancementRules: {
    individualAdvance: number;
    teamAdvance: number;
    qualifyingScore?: number;
  };
}

interface JudgeAssignment {
  id: string;
  judgeName: string;
  email: string;
  competitionName: string;
  assignmentType: string;
  room?: string;
  timeSlot?: string;
  status: string;
}

export default function AcademicScoring() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("live-scoring");
  const [selectedMeet, setSelectedMeet] = useState<string>("");
  const [selectedCompetition, setSelectedCompetition] = useState<string>("");
  const [scoringRubric, setScoringRubric] = useState<ScoringRubric | null>(null);

  const scoreForm = useForm<ParticipantScoreData>({
    resolver: zodResolver(participantScoreSchema),
    defaultValues: {
      medal: "none",
      advances: false
    }
  });

  const assignmentForm = useForm<JudgeAssignmentData>({
    resolver: zodResolver(judgeAssignmentSchema)
  });

  // Get active meets
  const { data: activeMeets, isLoading: meetsLoading } = useQuery<AcademicMeet[]>({
    queryKey: ['/api/academic/meets'],
    enabled: !!user,
    select: (meets) => meets?.filter(m => m.status === 'in_progress' || m.status === 'registration_closed')
  });

  // Get competitions for selected meet
  const { data: meetCompetitions, isLoading: competitionsLoading } = useQuery<UILCompetition[]>({
    queryKey: ['/api/academic/competitions/meet', selectedMeet],
    enabled: !!user && !!selectedMeet
  });

  // Get participants for selected competition
  const { data: participants, isLoading: participantsLoading } = useQuery<AcademicParticipant[]>({
    queryKey: ['/api/academic/participants', selectedMeet, selectedCompetition],
    enabled: !!user && !!selectedMeet && !!selectedCompetition
  });

  // Get existing results
  const { data: existingResults, isLoading: resultsLoading } = useQuery<AcademicResult[]>({
    queryKey: ['/api/academic/results', selectedMeet, selectedCompetition],
    enabled: !!user && !!selectedMeet && !!selectedCompetition
  });

  // Get judge assignments
  const { data: judgeAssignments, isLoading: assignmentsLoading } = useQuery<JudgeAssignment[]>({
    queryKey: ['/api/academic/judges/assignments', selectedMeet],
    enabled: !!user && !!selectedMeet
  });

  // Get scoring rubric
  const { data: rubricData } = useQuery<ScoringRubric>({
    queryKey: ['/api/academic/scoring/rubric', selectedCompetition],
    enabled: !!user && !!selectedCompetition,
    onSuccess: (data) => {
      setScoringRubric(data);
    }
  });

  // Submit score mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (data: ParticipantScoreData) => {
      return apiRequest('/api/academic/scoring/submit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Score Submitted",
        description: "Participant score has been successfully recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'results'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'advancement'] });
      scoreForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Scoring Failed",
        description: error.message || "Failed to submit score. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Assign judges mutation
  const assignJudgesMutation = useMutation({
    mutationFn: async (data: JudgeAssignmentData) => {
      return apiRequest('/api/academic/scoring/judges/assign', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Judges Assigned",
        description: "Judge assignments have been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'judges'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'meets'] });
      assignmentForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign judges. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmitScore = async (data: ParticipantScoreData) => {
    try {
      const submissionData = {
        ...data,
        meetId: selectedMeet,
        competitionId: selectedCompetition
      };
      await submitScoreMutation.mutateAsync(submissionData);
    } catch (error) {
      console.error('Score submission error:', error);
    }
  };

  const onAssignJudges = async (data: JudgeAssignmentData) => {
    try {
      await assignJudgesMutation.mutateAsync(data);
    } catch (error) {
      console.error('Judge assignment error:', error);
    }
  };

  const calculateAdvancement = (score: number, placement: number) => {
    if (!scoringRubric) return false;
    
    const { advancementRules } = scoringRubric;
    
    // Check if placement qualifies for advancement
    if (placement <= advancementRules.individualAdvance) {
      return true;
    }
    
    // Check if score meets qualifying score (if applicable)
    if (advancementRules.qualifyingScore && score >= advancementRules.qualifyingScore) {
      return true;
    }
    
    return false;
  };

  const getMedalType = (placement: number): "gold" | "silver" | "bronze" | "none" => {
    switch (placement) {
      case 1: return "gold";
      case 2: return "silver";
      case 3: return "bronze";
      default: return "none";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <CardTitle>Academic Scoring</CardTitle>
            <CardDescription>Please log in to access the scoring system</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Star className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="heading-scoring">
                  Academic Competition Scoring
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter scores, assign judges, and manage competition results
                </p>
              </div>
            </div>
            
            <Link to="/academic">
              <Button variant="outline" data-testid="button-back-dashboard">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="live-scoring" data-testid="tab-live-scoring">Live Scoring</TabsTrigger>
            <TabsTrigger value="judge-assignments" data-testid="tab-judge-assignments">Judge Assignments</TabsTrigger>
            <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
            <TabsTrigger value="rubrics" data-testid="tab-rubrics">Scoring Rubrics</TabsTrigger>
          </TabsList>

          {/* Live Scoring Tab */}
          <TabsContent value="live-scoring" className="space-y-6">
            {/* Event Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="h-5 w-5" />
                  <span>Select Competition</span>
                </CardTitle>
                <CardDescription>
                  Choose the meet and competition you are scoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="meet-select">Academic Meet</Label>
                    <Select value={selectedMeet} onValueChange={setSelectedMeet}>
                      <SelectTrigger data-testid="select-meet">
                        <SelectValue placeholder="Select academic meet" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeMeets?.map((meet) => (
                          <SelectItem key={meet.id} value={meet.id}>
                            {meet.meetName} - {new Date(meet.meetDate).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="competition-select">Competition</Label>
                    <Select 
                      value={selectedCompetition} 
                      onValueChange={setSelectedCompetition}
                      disabled={!selectedMeet}
                    >
                      <SelectTrigger data-testid="select-competition">
                        <SelectValue placeholder="Select competition" />
                      </SelectTrigger>
                      <SelectContent>
                        {meetCompetitions?.map((competition) => (
                          <SelectItem key={competition.id} value={competition.id}>
                            {competition.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Interface */}
            {selectedMeet && selectedCompetition && (
              <>
                {/* Scoring Rubric Display */}
                {scoringRubric && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Scoring Guidelines</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {scoringRubric.scoringMethod}
                          </div>
                          <div className="text-sm text-muted-foreground">Scoring Method</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {scoringRubric.maxScore || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Max Score</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {scoringRubric.advancementRules.individualAdvance}
                          </div>
                          <div className="text-sm text-muted-foreground">Advance to Regional</div>
                        </div>
                      </div>
                      
                      {scoringRubric.criteria.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Scoring Criteria</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {scoringRubric.criteria.map((criterion, index) => (
                              <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-medium">{criterion.criterion}</span>
                                  <Badge variant="outline">{criterion.maxPoints} pts</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{criterion.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Participants Scoring */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5" />
                      <span>Score Entry</span>
                    </CardTitle>
                    <CardDescription>
                      Enter scores for competition participants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {participantsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Loading participants...</p>
                      </div>
                    ) : participants && participants.length > 0 ? (
                      <div className="space-y-6">
                        <Form {...scoreForm}>
                          <form onSubmit={scoreForm.handleSubmit(onSubmitScore)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={scoreForm.control}
                                name="participantId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Participant</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid="select-participant">
                                          <SelectValue placeholder="Select participant" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {participants.map((participant) => (
                                          <SelectItem key={participant.id} value={participant.id}>
                                            {participant.firstName} {participant.lastName} - {participant.schoolName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={scoreForm.control}
                                name="score"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Score</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter score"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                        data-testid="input-score"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={scoreForm.control}
                                name="rank"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rank</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="Overall rank"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                        data-testid="input-rank"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={scoreForm.control}
                                name="placement"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Placement</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min="1"
                                        placeholder="Final placement"
                                        {...field}
                                        onChange={(e) => {
                                          const placement = parseInt(e.target.value) || 1;
                                          field.onChange(placement);
                                          // Auto-assign medal based on placement
                                          scoreForm.setValue('medal', getMedalType(placement));
                                          // Auto-calculate advancement
                                          const score = scoreForm.getValues('score');
                                          scoreForm.setValue('advances', calculateAdvancement(score, placement));
                                        }}
                                        data-testid="input-placement"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={scoreForm.control}
                                name="medal"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Medal</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger data-testid="select-medal">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="gold">🥇 Gold</SelectItem>
                                        <SelectItem value="silver">🥈 Silver</SelectItem>
                                        <SelectItem value="bronze">🥉 Bronze</SelectItem>
                                        <SelectItem value="none">No Medal</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={scoreForm.control}
                                name="advances"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                      <FormLabel className="text-base">
                                        Advances to Regional
                                      </FormLabel>
                                      <FormDescription>
                                        Check if participant qualifies for next level
                                      </FormDescription>
                                    </div>
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        className="h-4 w-4"
                                        data-testid="checkbox-advances"
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              {scoreForm.watch('advances') && (
                                <FormField
                                  control={scoreForm.control}
                                  name="advancementLevel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Advancement Level</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-advancement-level">
                                            <SelectValue placeholder="Select level" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="regional">Regional</SelectItem>
                                          <SelectItem value="state">State</SelectItem>
                                          <SelectItem value="area">Area</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </div>

                            <FormField
                              control={scoreForm.control}
                              name="judgeComments"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Judge Comments (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Enter any comments about the performance..."
                                      {...field}
                                      data-testid="textarea-judge-comments"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                disabled={submitScoreMutation.isPending}
                                data-testid="button-submit-score"
                              >
                                {submitScoreMutation.isPending ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Submitting...</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2">
                                    <Save className="h-4 w-4" />
                                    <span>Submit Score</span>
                                  </div>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>

                        {/* Participants List with Quick Scoring */}
                        <div>
                          <h4 className="font-semibold mb-3">Participants</h4>
                          <div className="space-y-3">
                            {participants.map((participant) => {
                              const existingResult = existingResults?.find(r => r.participantId === participant.id);
                              return (
                                <Card key={participant.id} className={`p-4 ${existingResult ? 'bg-green-50 dark:bg-green-950' : ''}`}>
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">
                                        {participant.firstName} {participant.lastName}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {participant.schoolName} • Grade {participant.grade} • {participant.participantRole}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      {existingResult && (
                                        <div className="text-right">
                                          <div className="font-semibold">
                                            Score: {existingResult.score} (#{existingResult.placement})
                                          </div>
                                          <div className="text-sm text-muted-foreground">
                                            {existingResult.medal !== 'none' && (
                                              <span className="mr-2">
                                                {existingResult.medal === 'gold' && '🥇'}
                                                {existingResult.medal === 'silver' && '🥈'}
                                                {existingResult.medal === 'bronze' && '🥉'}
                                              </span>
                                            )}
                                            {existingResult.advances && (
                                              <Badge variant="default" className="text-xs">
                                                Advances to {existingResult.advancementLevel}
                                              </Badge>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      <Button
                                        size="sm"
                                        variant={existingResult ? "outline" : "default"}
                                        onClick={() => {
                                          scoreForm.setValue('participantId', participant.id);
                                          if (existingResult) {
                                            scoreForm.setValue('score', existingResult.score);
                                            scoreForm.setValue('rank', existingResult.rank);
                                            scoreForm.setValue('placement', existingResult.placement);
                                            scoreForm.setValue('medal', existingResult.medal as any);
                                            scoreForm.setValue('advances', existingResult.advances);
                                            scoreForm.setValue('advancementLevel', existingResult.advancementLevel || '');
                                          }
                                        }}
                                        data-testid={`button-score-participant-${participant.id}`}
                                      >
                                        {existingResult ? (
                                          <>
                                            <Edit className="h-4 w-4 mr-1" />
                                            Edit Score
                                          </>
                                        ) : (
                                          <>
                                            <Calculator className="h-4 w-4 mr-1" />
                                            Score
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Participants</h3>
                        <p className="text-muted-foreground">
                          No participants registered for this competition.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Judge Assignments Tab */}
          <TabsContent value="judge-assignments" className="space-y-6">
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Judge Assignments</h3>
              <p className="text-muted-foreground mb-6">
                Assign qualified judges to academic competitions
              </p>
              <Button size="lg" data-testid="button-manage-judges">
                <Users className="h-4 w-4 mr-2" />
                Manage Judge Assignments
              </Button>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <div className="text-center py-12">
              <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Competition Results</h3>
              <p className="text-muted-foreground mb-6">
                View and manage competition results and advancement tracking
              </p>
              <Link to="/academic/results">
                <Button size="lg" data-testid="button-view-results">
                  <Eye className="h-4 w-4 mr-2" />
                  View Results Dashboard
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Rubrics Tab */}
          <TabsContent value="rubrics" className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Scoring Rubrics</h3>
              <p className="text-muted-foreground mb-6">
                View and manage scoring criteria for academic competitions
              </p>
              <Button size="lg" data-testid="button-manage-rubrics">
                <Target className="h-4 w-4 mr-2" />
                Manage Scoring Rubrics
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}