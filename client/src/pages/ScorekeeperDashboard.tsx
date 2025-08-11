import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Calculator, 
  Users, 
  Trophy, 
  Target,
  Clock,
  Award,
  CheckCircle,
  AlertCircle,
  Edit,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const eventScoreSchema = z.object({
  participantName: z.string().min(1, "Participant name is required"),
  scoreValue: z.number().min(0, "Score must be positive").optional(),
  scoreUnit: z.string().optional(),
  placement: z.number().min(1, "Placement must be at least 1").optional(),
  notes: z.string().optional()
});

type EventScoreFormData = z.infer<typeof eventScoreSchema>;

export default function ScorekeeperDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [showScoreDialog, setShowScoreDialog] = useState(false);
  const [editingScore, setEditingScore] = useState<any>(null);

  const form = useForm<EventScoreFormData>({
    resolver: zodResolver(eventScoreSchema),
    defaultValues: {
      participantName: "",
      scoreValue: undefined,
      scoreUnit: "",
      placement: undefined,
      notes: ""
    }
  });

  // Get my scorekeeper assignments
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/scorekeeper-assignments/mine"],
    enabled: isAuthenticated
  });

  // Get scores for selected assignment
  const { data: scores = [] } = useQuery({
    queryKey: ["/api/event-scores", selectedAssignment],
    enabled: !!selectedAssignment
  });

  // Get assignment details
  const selectedAssignmentData = (assignments as any[]).find((a: any) => a.id === selectedAssignment);

  const createScoreMutation = useMutation({
    mutationFn: async (data: EventScoreFormData & { assignmentId: string }) => {
      return apiRequest("POST", "/api/event-scores", data);
    },
    onSuccess: () => {
      toast({
        title: "Score Recorded",
        description: "Event score has been successfully recorded."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event-scores", selectedAssignment] });
      setShowScoreDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Recording Failed",
        description: "Failed to record score. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventScoreFormData> }) => {
      return apiRequest("PATCH", `/api/event-scores/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Score Updated",
        description: "Event score has been successfully updated."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/event-scores", selectedAssignment] });
      setEditingScore(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update score. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: EventScoreFormData) => {
    if (!selectedAssignment) return;
    
    if (editingScore) {
      updateScoreMutation.mutate({ id: editingScore.id, data });
    } else {
      createScoreMutation.mutate({
        ...data,
        assignmentId: selectedAssignment
      });
    }
  };

  const startEditing = (score: any) => {
    setEditingScore(score);
    form.reset({
      participantName: score.participantName,
      scoreValue: score.scoreValue,
      scoreUnit: score.scoreUnit,
      placement: score.placement,
      notes: score.notes
    });
    setShowScoreDialog(true);
  };

  const cancelEditing = () => {
    setEditingScore(null);
    form.reset();
    setShowScoreDialog(false);
  };

  const getScoreDisplay = (score: any) => {
    if (score.scoreValue && score.scoreUnit) {
      return `${score.scoreValue} ${score.scoreUnit}`;
    } else if (score.scoreValue) {
      return score.scoreValue.toString();
    } else if (score.placement) {
      return `${score.placement}${score.placement === 1 ? 'st' : score.placement === 2 ? 'nd' : score.placement === 3 ? 'rd' : 'th'} place`;
    }
    return "No score";
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the scorekeeper dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Scorekeeper Dashboard</h1>
          <p className="text-muted-foreground">
            Record and manage scores for your assigned events
          </p>
        </div>
        {selectedAssignment && (
          <Dialog open={showScoreDialog} onOpenChange={setShowScoreDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-record-score">
                <Plus className="h-4 w-4 mr-2" />
                Record Score
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingScore ? "Edit Score" : "Record New Score"}
                </DialogTitle>
                <DialogDescription>
                  {selectedAssignmentData && (
                    <>Record score for {selectedAssignmentData.eventName} in {selectedAssignmentData.tournament?.name}</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="participantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participant/Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith or Eagles Team" {...field} data-testid="input-participant-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="scoreValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Score Value</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="12.45"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                              data-testid="input-score-value"
                            />
                          </FormControl>
                          <FormDescription>Numeric score (time, distance, points)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scoreUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="seconds, meters, points" {...field} data-testid="input-score-unit" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="placement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Placement</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              data-testid="input-placement"
                            />
                          </FormControl>
                          <FormDescription>1st, 2nd, 3rd place</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Penalties, disqualifications, or other notes..."
                            {...field}
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormDescription>
                          Record any penalties, fouls, or special circumstances
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditing}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createScoreMutation.isPending || updateScoreMutation.isPending}
                      data-testid="button-submit"
                    >
                      {editingScore ? (
                        updateScoreMutation.isPending ? "Updating..." : "Update Score"
                      ) : (
                        createScoreMutation.isPending ? "Recording..." : "Record Score"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments">My Assignments</TabsTrigger>
          <TabsTrigger value="scores" disabled={!selectedAssignment}>
            Event Scores {selectedAssignment && scores.length > 0 && `(${scores.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid gap-4">
            {(assignments as any[]).map((assignment: any) => (
              <Card 
                key={assignment.id} 
                className={`cursor-pointer transition-all ${
                  selectedAssignment === assignment.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedAssignment(assignment.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        {assignment.eventName}
                      </CardTitle>
                      <CardDescription>
                        Tournament: {assignment.tournament?.name} • Assigned by: {assignment.assignedBy?.firstName} {assignment.assignedBy?.lastName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssignment(assignment.id);
                        }}
                        data-testid={`button-select-assignment-${assignment.id}`}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Manage Scores
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Assigned:</span> {new Date(assignment.assignmentDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Can Update:</span> {assignment.canUpdateScores ? "Yes" : "No"}
                    </div>
                    <div>
                      <span className="font-medium">Tournament Status:</span> {assignment.tournament?.status}
                    </div>
                  </div>
                  {assignment.eventDescription && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {assignment.eventDescription}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {assignments.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Assignments</h3>
                  <p className="text-muted-foreground">
                    You haven't been assigned to any events yet. Tournament managers will assign you to specific events.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          {selectedAssignment && selectedAssignmentData ? (
            <>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Recording Scores For:</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Event:</span> {selectedAssignmentData.eventName}
                  </div>
                  <div>
                    <span className="font-medium">Tournament:</span> {selectedAssignmentData.tournament?.name}
                  </div>
                  <div>
                    <span className="font-medium">Sport:</span> {selectedAssignmentData.tournament?.sport}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {(scores as any[]).map((score: any) => (
                  <Card key={score.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            {score.participantName}
                          </CardTitle>
                          <CardDescription>
                            Score: {getScoreDisplay(score)} • Recorded: {new Date(score.scoredAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {score.isVerified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending Verification
                            </Badge>
                          )}
                          {selectedAssignmentData.canUpdateScores && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(score)}
                              data-testid={`button-edit-score-${score.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {score.notes && (
                      <CardContent>
                        <div className="p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Notes:</span> {score.notes}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}

                {scores.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Scores Recorded</h3>
                      <p className="text-muted-foreground mb-4">
                        Start recording scores for this event using the "Record Score" button.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select an Assignment</h3>
                <p className="text-muted-foreground">
                  Choose an assignment from the "My Assignments" tab to record and manage scores.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}