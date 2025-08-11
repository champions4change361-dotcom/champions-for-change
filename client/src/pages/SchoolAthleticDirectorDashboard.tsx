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
  Users, 
  Trophy, 
  Target,
  School,
  CheckCircle,
  Clock,
  UserCheck,
  Edit,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const coachAssignmentSchema = z.object({
  coachId: z.string().min(1, "Coach selection is required"),
  eventName: z.string().min(1, "Event name is required"),
  role: z.enum(["head_coach", "assistant_coach", "volunteer_coach"]),
  responsibilities: z.string().optional()
});

type CoachAssignmentFormData = z.infer<typeof coachAssignmentSchema>;

export default function SchoolAthleticDirectorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedSchoolAssignment, setSelectedSchoolAssignment] = useState<string | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const form = useForm<CoachAssignmentFormData>({
    resolver: zodResolver(coachAssignmentSchema),
    defaultValues: {
      coachId: "",
      eventName: "",
      role: "assistant_coach",
      responsibilities: ""
    }
  });

  // Get school event assignments for my school
  const { data: schoolAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["/api/school-event-assignments/mine"],
    enabled: isAuthenticated
  });

  // Get coach assignments for selected school assignment
  const { data: coachAssignments = [] } = useQuery({
    queryKey: ["/api/coach-event-assignments", selectedSchoolAssignment],
    enabled: !!selectedSchoolAssignment
  });

  // Get available coaches from my school
  const { data: availableCoaches = [] } = useQuery({
    queryKey: ["/api/coaches/school"],
    enabled: isAuthenticated
  });

  const selectedSchoolAssignmentData = (schoolAssignments as any[]).find((a: any) => a.id === selectedSchoolAssignment);

  const assignCoachMutation = useMutation({
    mutationFn: async (data: CoachAssignmentFormData & { schoolAssignmentId: string }) => {
      return apiRequest("POST", "/api/coach-event-assignments", data);
    },
    onSuccess: () => {
      toast({
        title: "Coach Assigned",
        description: "Coach has been successfully assigned to the event."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/coach-event-assignments", selectedSchoolAssignment] });
      setShowAssignDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign coach. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CoachAssignmentFormData) => {
    if (!selectedSchoolAssignment) return;
    
    assignCoachMutation.mutate({
      ...data,
      schoolAssignmentId: selectedSchoolAssignment
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "head_coach":
        return "bg-blue-100 text-blue-800";
      case "assistant_coach":
        return "bg-green-100 text-green-800";
      case "volunteer_coach":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "head_coach":
        return "Head Coach";
      case "assistant_coach":
        return "Assistant Coach";
      case "volunteer_coach":
        return "Volunteer Coach";
      default:
        return role;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the school athletic director dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">School Athletic Director Dashboard</h1>
          <p className="text-muted-foreground">
            Assign coaches to events within your school's assigned competitions
          </p>
          {user?.organizationName && (
            <p className="text-sm text-muted-foreground mt-1">
              <Building className="h-4 w-4 inline mr-1" />
              {user.organizationName}
            </p>
          )}
        </div>
        {selectedSchoolAssignment && (
          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-assign-coach">
                <Plus className="h-4 w-4 mr-2" />
                Assign Coach
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Assign Coach to Event</DialogTitle>
                <DialogDescription>
                  {selectedSchoolAssignmentData && (
                    <>Assign a coach to an event for {selectedSchoolAssignmentData.tournament?.name}</>
                  )}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="coachId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Coach</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-coach">
                                <SelectValue placeholder="Choose a coach" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(availableCoaches as any[]).map((coach: any) => (
                                <SelectItem key={coach.id} value={coach.id}>
                                  {coach.firstName} {coach.lastName} ({coach.email})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coach Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="head_coach">Head Coach</SelectItem>
                              <SelectItem value="assistant_coach">Assistant Coach</SelectItem>
                              <SelectItem value="volunteer_coach">Volunteer Coach</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-event">
                              <SelectValue placeholder="Choose an event" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {selectedSchoolAssignmentData?.eventNames?.map((eventName: string) => (
                              <SelectItem key={eventName} value={eventName}>
                                {eventName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select from events assigned to your school by the district
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsibilities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsibilities (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Specific duties and responsibilities for this event..."
                            {...field}
                            data-testid="textarea-responsibilities"
                          />
                        </FormControl>
                        <FormDescription>
                          Describe what this coach will be responsible for in this event
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAssignDialog(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={assignCoachMutation.isPending}
                      data-testid="button-submit"
                    >
                      {assignCoachMutation.isPending ? "Assigning..." : "Assign Coach"}
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
          <TabsTrigger value="assignments">Event Assignments</TabsTrigger>
          <TabsTrigger value="coaches" disabled={!selectedSchoolAssignment}>
            Coach Assignments {selectedSchoolAssignment && coachAssignments.length > 0 && `(${coachAssignments.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">
          <div className="grid gap-4">
            {(schoolAssignments as any[]).map((assignment: any) => (
              <Card 
                key={assignment.id}
                className={`cursor-pointer transition-all ${
                  selectedSchoolAssignment === assignment.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedSchoolAssignment(assignment.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <School className="h-5 w-5" />
                        {assignment.tournament?.name}
                      </CardTitle>
                      <CardDescription>
                        Assigned by: {assignment.assignedBy?.firstName} {assignment.assignedBy?.lastName} (District AD)
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
                          <Clock className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSchoolAssignment(assignment.id);
                        }}
                        data-testid={`button-manage-assignment-${assignment.id}`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Coaches
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="font-medium">Assigned:</span> {new Date(assignment.assignmentDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Events:</span> {assignment.eventNames?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Tournament Status:</span> {assignment.tournament?.status}
                    </div>
                  </div>
                  {assignment.eventNames && assignment.eventNames.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">Assigned Events:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assignment.eventNames.map((eventName: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {eventName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {assignment.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {assignment.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {schoolAssignments.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <School className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Event Assignments</h3>
                  <p className="text-muted-foreground">
                    Your school hasn't been assigned to any events yet. The district athletic director will assign events to your school.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="coaches" className="space-y-6">
          {selectedSchoolAssignment && selectedSchoolAssignmentData ? (
            <>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Managing Coaches For:</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tournament:</span> {selectedSchoolAssignmentData.tournament?.name}
                  </div>
                  <div>
                    <span className="font-medium">Sport:</span> {selectedSchoolAssignmentData.tournament?.sport}
                  </div>
                  <div>
                    <span className="font-medium">Events:</span> {selectedSchoolAssignmentData.eventNames?.length || 0}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {(coachAssignments as any[]).map((assignment: any) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            {assignment.coach?.firstName} {assignment.coach?.lastName}
                          </CardTitle>
                          <CardDescription>
                            Event: {assignment.eventName} • Role: {getRoleLabel(assignment.role)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(assignment.role)}>
                            {getRoleLabel(assignment.role)}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-edit-coach-${assignment.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {assignment.responsibilities && (
                      <CardContent>
                        <div className="p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Responsibilities:</span> {assignment.responsibilities}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}

                {coachAssignments.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Coach Assignments</h3>
                      <p className="text-muted-foreground mb-4">
                        Start assigning coaches to the events your school is responsible for.
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
                <h3 className="text-lg font-medium mb-2">Select an Event Assignment</h3>
                <p className="text-muted-foreground">
                  Choose an event assignment from the "Event Assignments" tab to manage coach assignments.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}