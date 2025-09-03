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
  Trophy, 
  Users, 
  Settings, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit,
  Eye,
  MoreHorizontal,
  Calculator,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const tournamentSchema = z.object({
  name: z.string().min(1, "Tournament name is required"),
  sport: z.string().min(1, "Sport is required"),
  tournamentType: z.enum(["single", "double", "pool-play", "round-robin", "swiss-system", "double-stage"]),
  teamSize: z.number().min(1, "Team size must be at least 1").max(50, "Team size cannot exceed 50"),
  maxParticipants: z.number().min(2, "Must allow at least 2 participants").optional(),
  entryFee: z.number().min(0, "Entry fee cannot be negative").optional(),
  registrationDeadline: z.string().optional(),
  tournamentDate: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  ageGroup: z.enum(["Elementary", "Middle School", "High School", "College", "Adult", "Masters", "Senior", "All Ages"]),
  genderDivision: z.enum(["Men", "Women", "Mixed", "Boys", "Girls", "Co-Ed"]),
  isPublic: z.boolean()
});

type TournamentFormData = z.infer<typeof tournamentSchema>;

export default function TournamentManagerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  const form = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      sport: "",
      tournamentType: "single",
      teamSize: 1,
      maxParticipants: 16,
      entryFee: 0,
      registrationDeadline: "",
      tournamentDate: "",
      location: "",
      description: "",
      ageGroup: "All Ages",
      genderDivision: "Mixed",
      isPublic: true
    }
  });

  // Get my tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/tournaments/mine"],
    enabled: isAuthenticated
  });

  // Get team registrations for selected tournament
  const { data: registrations = [] } = useQuery({
    queryKey: ["/api/team-registrations", selectedTournament],
    enabled: !!selectedTournament
  });

  // Get scorekeeper assignments for selected tournament
  const { data: scorekeeperAssignments = [] } = useQuery({
    queryKey: ["/api/scorekeeper-assignments", selectedTournament],
    enabled: !!selectedTournament
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (data: TournamentFormData) => {
      // Convert string dates to proper format if provided
      const formattedData = {
        ...data,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline).toISOString() : undefined,
        tournamentDate: data.tournamentDate ? new Date(data.tournamentDate).toISOString() : undefined,
        bracket: { rounds: [], matches: [] }, // Initialize empty bracket
        teams: []
      };
      return apiRequest("POST", "/api/tournaments", formattedData);
    },
    onSuccess: () => {
      toast({
        title: "Tournament Created",
        description: "Your tournament has been created successfully."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments/mine"] });
      setShowCreateDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create tournament. Please try again.",
        variant: "destructive"
      });
    }
  });

  const approveRegistrationMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      return apiRequest("PATCH", `/api/team-registrations/${registrationId}`, {
        registrationStatus: "approved"
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Approved",
        description: "Team registration has been approved."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team-registrations", selectedTournament] });
    }
  });

  const rejectRegistrationMutation = useMutation({
    mutationFn: async (registrationId: string) => {
      return apiRequest("PATCH", `/api/team-registrations/${registrationId}`, {
        registrationStatus: "rejected"
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Rejected",
        description: "Team registration has been rejected."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team-registrations", selectedTournament] });
    }
  });

  const onSubmit = (data: TournamentFormData) => {
    // Configure double-stage tournaments to use multi-stage format
    const tournamentData = {
      ...data,
      competitionFormat: data.tournamentType === 'double-stage' ? 'multi-stage' : 'bracket',
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
    
    createTournamentMutation.mutate(tournamentData);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "stage-1":
      case "stage-2":
      case "stage-3":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the tournament manager dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tournament Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Create and manage tournaments, approve team registrations
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-tournament">
              <Plus className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
              <DialogDescription>
                Set up a new tournament with teams, events, and registration details
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Spring Basketball Championship" {...field} data-testid="input-tournament-name" />
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
                        <FormLabel>Sport</FormLabel>
                        <FormControl>
                          <Input placeholder="Basketball" {...field} data-testid="input-sport" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="tournamentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tournament Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-tournament-type">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single Elimination</SelectItem>
                            <SelectItem value="double">Double Elimination</SelectItem>
                            <SelectItem value="pool-play">Pool Play</SelectItem>
                            <SelectItem value="round-robin">Round Robin</SelectItem>
                            <SelectItem value="swiss-system">Swiss System</SelectItem>
                            <SelectItem value="double-stage">Double Stage (Group + Bracket)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            data-testid="input-team-size"
                          />
                        </FormControl>
                        <FormDescription>Number of players per team</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Teams</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="2" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-max-participants"
                          />
                        </FormControl>
                        <FormDescription>Maximum number of teams</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-age-group">
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Elementary">Elementary</SelectItem>
                            <SelectItem value="Middle School">Middle School</SelectItem>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                            <SelectItem value="Adult">Adult</SelectItem>
                            <SelectItem value="Masters">Masters</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="All Ages">All Ages</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="genderDivision"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender Division</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-gender-division">
                              <SelectValue placeholder="Select division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Men">Men</SelectItem>
                            <SelectItem value="Women">Women</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                            <SelectItem value="Boys">Boys</SelectItem>
                            <SelectItem value="Girls">Girls</SelectItem>
                            <SelectItem value="Co-Ed">Co-Ed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="entryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Fee ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-entry-fee"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="registrationDeadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Deadline</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                            data-testid="input-registration-deadline"
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
                            type="datetime-local" 
                            {...field}
                            data-testid="input-tournament-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City Sports Complex" {...field} data-testid="input-location" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tournament details, rules, and additional information..."
                          {...field}
                          data-testid="textarea-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Public Tournament
                        </FormLabel>
                        <FormDescription>
                          Allow public registration and visibility
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          data-testid="checkbox-public"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createTournamentMutation.isPending}
                    data-testid="button-create"
                  >
                    {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tournaments">My Tournaments</TabsTrigger>
          <TabsTrigger value="registrations" disabled={!selectedTournament}>
            Team Registrations {selectedTournament && registrations.length > 0 && `(${registrations.length})`}
          </TabsTrigger>
          <TabsTrigger value="scorekeepers" disabled={!selectedTournament}>
            Scorekeepers {selectedTournament && scorekeeperAssignments.length > 0 && `(${scorekeeperAssignments.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-6">
          <div className="grid gap-4">
            {(tournaments as any[]).map((tournament: any) => (
              <Card key={tournament.id} className={selectedTournament === tournament.id ? "ring-2 ring-primary" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        {tournament.name}
                      </CardTitle>
                      <CardDescription>
                        {tournament.sport} • {tournament.ageGroup} • {tournament.genderDivision}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTournament(tournament.id)}
                        data-testid={`button-select-tournament-${tournament.id}`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Format:</span> {tournament.tournamentType}
                    </div>
                    <div>
                      <span className="font-medium">Team Size:</span> {tournament.teamSize} players
                    </div>
                    <div>
                      <span className="font-medium">Entry Fee:</span> ${tournament.entryFee || "Free"}
                    </div>
                    <div>
                      <span className="font-medium">Max Teams:</span> {tournament.maxParticipants || "Unlimited"}
                    </div>
                  </div>
                  {tournament.description && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {tournament.description}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {tournaments.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tournaments Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first tournament to get started managing competitions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-6">
          {selectedTournament ? (
            <div className="grid gap-4">
              {(registrations as any[]).map((registration: any) => (
                <Card key={registration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {registration.teamName}
                        </CardTitle>
                        <CardDescription>
                          {registration.organizationName} • Coach: {registration.coach?.firstName} {registration.coach?.lastName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(registration.registrationStatus)}
                        <Badge className={`${
                          registration.registrationStatus === "approved" ? "bg-green-100 text-green-800" :
                          registration.registrationStatus === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {registration.registrationStatus}
                        </Badge>
                        {registration.registrationStatus === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => approveRegistrationMutation.mutate(registration.id)}
                              disabled={approveRegistrationMutation.isPending}
                              data-testid={`button-approve-${registration.id}`}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectRegistrationMutation.mutate(registration.id)}
                              disabled={rejectRegistrationMutation.isPending}
                              data-testid={`button-reject-${registration.id}`}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">Players:</span> {registration.playerList?.length || 0}
                      </div>
                      <div>
                        <span className="font-medium">Registered:</span> {new Date(registration.registrationDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {registration.playerList && registration.playerList.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Player Roster:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {registration.playerList.map((player: any, index: number) => (
                            <div key={index} className="flex justify-between py-1 border-b">
                              <span>{player.name}</span>
                              <span className="text-muted-foreground">{player.grade || "N/A"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {registration.notes && (
                      <div className="mt-4 p-2 bg-muted rounded text-sm">
                        <span className="font-medium">Notes:</span> {registration.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {registrations.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No Team Registrations</h3>
                    <p className="text-muted-foreground">
                      No teams have registered for this tournament yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Tournament</h3>
                <p className="text-muted-foreground">
                  Click "Manage" on a tournament to view and approve team registrations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="scorekeepers" className="space-y-6">
          {selectedTournament ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Scorekeeper Assignments</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign scorekeepers to specific events within this tournament
                  </p>
                </div>
                <Button data-testid="button-assign-scorekeeper">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Scorekeeper
                </Button>
              </div>

              <div className="grid gap-4">
                {(scorekeeperAssignments as any[]).map((assignment: any) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {assignment.eventName}
                          </CardTitle>
                          <CardDescription>
                            Scorekeeper: {assignment.scorekeeper?.firstName} {assignment.scorekeeper?.lastName} ({assignment.scorekeeper?.email})
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
                              Inactive
                            </Badge>
                          )}
                          <Button variant="outline" size="sm" data-testid={`button-edit-assignment-${assignment.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
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
                          <span className="font-medium">Can Update Scores:</span> {assignment.canUpdateScores ? "Yes" : "No"}
                        </div>
                        <div>
                          <span className="font-medium">Scores Recorded:</span> {assignment.eventScores?.length || 0}
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

                {scorekeeperAssignments.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">No Scorekeeper Assignments</h3>
                      <p className="text-muted-foreground mb-4">
                        Assign scorekeepers to specific events within this tournament. This is critical for multi-event sports and competitions.
                      </p>
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Assign First Scorekeeper
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Select a Tournament</h3>
                <p className="text-muted-foreground">
                  Choose a tournament to manage scorekeeper assignments for specific events.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}