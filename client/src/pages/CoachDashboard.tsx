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
import { Plus, Users, Trophy, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const teamRegistrationSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  organizationName: z.string().min(1, "Organization name is required"),
  playerList: z.array(z.object({
    name: z.string().min(1, "Player name is required"),
    grade: z.string().optional(),
    position: z.string().optional(),
    parentContact: z.string().optional()
  })).min(1, "At least one player is required"),
  registeredEvents: z.array(z.string()).min(1, "At least one event must be selected"),
  notes: z.string().optional()
});

type TeamRegistrationFormData = z.infer<typeof teamRegistrationSchema>;

const defaultPlayer = { name: "", grade: "", position: "", parentContact: "" };

export default function CoachDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);

  const form = useForm<TeamRegistrationFormData>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      teamName: "",
      organizationName: user?.organizationName || "",
      playerList: [defaultPlayer],
      registeredEvents: [],
      notes: ""
    }
  });

  // Get available tournaments
  const { data: tournaments = [], isLoading: tournamentsLoading } = useQuery({
    queryKey: ["/api/tournaments"],
    enabled: isAuthenticated
  });

  // Get my team registrations
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ["/api/team-registrations/mine"],
    enabled: isAuthenticated
  });

  // Get tournament details for registration
  const { data: tournamentDetails } = useQuery({
    queryKey: ["/api/tournaments", selectedTournament],
    enabled: !!selectedTournament
  });

  const registerTeamMutation = useMutation({
    mutationFn: async (data: TeamRegistrationFormData & { tournamentId: string }) => {
      return apiRequest("POST", "/api/team-registrations", data);
    },
    onSuccess: () => {
      toast({
        title: "Team Registered",
        description: "Your team has been registered successfully. Awaiting approval."
      });
      queryClient.invalidateQueries({ queryKey: ["/api/team-registrations/mine"] });
      setShowRegistrationDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Failed to register team. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: TeamRegistrationFormData) => {
    if (!selectedTournament) return;
    
    registerTeamMutation.mutate({
      ...data,
      tournamentId: selectedTournament
    });
  };

  const addPlayer = () => {
    const currentPlayers = form.getValues("playerList");
    form.setValue("playerList", [...currentPlayers, defaultPlayer]);
  };

  const removePlayer = (index: number) => {
    const currentPlayers = form.getValues("playerList");
    if (currentPlayers.length > 1) {
      form.setValue("playerList", currentPlayers.filter((_, i) => i !== index));
    }
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
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be logged in to access the coach dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Coach Dashboard</h1>
          <p className="text-muted-foreground">
            Register your teams for tournaments and manage player rosters
          </p>
        </div>
        <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-register-team">
              <Plus className="h-4 w-4 mr-2" />
              Register Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register Team for Tournament</DialogTitle>
              <DialogDescription>
                Register your team and players for an upcoming tournament
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="teamName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Eagles Varsity" {...field} data-testid="input-team-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizationName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School/Organization</FormLabel>
                        <FormControl>
                          <Input placeholder="Lincoln High School" {...field} data-testid="input-organization" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Select Tournament</FormLabel>
                  <Select onValueChange={setSelectedTournament} value={selectedTournament || ""}>
                    <SelectTrigger data-testid="select-tournament">
                      <SelectValue placeholder="Choose a tournament" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tournaments as any[]).map((tournament: any) => (
                        <SelectItem key={tournament.id} value={tournament.id}>
                          {tournament.name} - {tournament.sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {tournamentDetails && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h3 className="font-medium mb-2">Tournament Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Sport:</span> {(tournamentDetails as any).sport}
                      </div>
                      <div>
                        <span className="font-medium">Format:</span> {(tournamentDetails as any).tournamentType}
                      </div>
                      <div>
                        <span className="font-medium">Team Size:</span> {(tournamentDetails as any).teamSize} players
                      </div>
                      <div>
                        <span className="font-medium">Entry Fee:</span> ${(tournamentDetails as any).entryFee || "Free"}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <FormLabel>Player Roster</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addPlayer} data-testid="button-add-player">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Player
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {form.watch("playerList").map((_, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-end">
                        <FormField
                          control={form.control}
                          name={`playerList.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Player Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Smith" {...field} data-testid={`input-player-name-${index}`} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`playerList.${index}.grade`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Grade</FormLabel>
                              <FormControl>
                                <Input placeholder="10th" {...field} data-testid={`input-player-grade-${index}`} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`playerList.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Position</FormLabel>
                              <FormControl>
                                <Input placeholder="Forward" {...field} data-testid={`input-player-position-${index}`} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`playerList.${index}.parentContact`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Parent Contact</FormLabel>
                              <FormControl>
                                <Input placeholder="555-0123" {...field} data-testid={`input-player-contact-${index}`} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePlayer(index)}
                          disabled={form.watch("playerList").length === 1}
                          data-testid={`button-remove-player-${index}`}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information about your team..."
                          {...field}
                          data-testid="textarea-notes"
                        />
                      </FormControl>
                      <FormDescription>
                        Include any special requirements, dietary restrictions, or other important information
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegistrationDialog(false)}
                    data-testid="button-cancel-registration"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerTeamMutation.isPending}
                    data-testid="button-submit-registration"
                  >
                    {registerTeamMutation.isPending ? "Registering..." : "Register Team"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="registrations">My Registrations</TabsTrigger>
          <TabsTrigger value="tournaments">Available Tournaments</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-6">
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
                        {registration.organizationName} • Tournament: {registration.tournament?.name}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(registration.registrationStatus)}
                      <Badge className={getStatusColor(registration.registrationStatus)}>
                        {registration.registrationStatus}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Players:</span> {registration.playerList?.length || 0}
                    </div>
                    <div>
                      <span className="font-medium">Sport:</span> {registration.tournament?.sport}
                    </div>
                    <div>
                      <span className="font-medium">Registered:</span> {new Date(registration.registrationDate).toLocaleDateString()}
                    </div>
                  </div>
                  {registration.notes && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <span className="font-medium">Notes:</span> {registration.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {registrations.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Team Registrations</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't registered any teams yet. Click "Register Team" to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-6">
          <div className="grid gap-4">
            {(tournaments as any[]).map((tournament: any) => (
              <Card key={tournament.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        {tournament.name}
                      </CardTitle>
                      <CardDescription>
                        {tournament.sport} • {tournament.tournamentType} • Team Size: {tournament.teamSize}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {tournament.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Entry Fee:</span> ${tournament.entryFee || "Free"}
                    </div>
                    <div>
                      <span className="font-medium">Max Teams:</span> {tournament.maxParticipants || "Unlimited"}
                    </div>
                    <div>
                      <span className="font-medium">Registration Deadline:</span> {
                        tournament.registrationDeadline 
                          ? new Date(tournament.registrationDeadline).toLocaleDateString()
                          : "Not set"
                      }
                    </div>
                    <div>
                      <span className="font-medium">Tournament Date:</span> {
                        tournament.tournamentDate 
                          ? new Date(tournament.tournamentDate).toLocaleDateString()
                          : "TBD"
                      }
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
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Tournaments Available</h3>
                  <p className="text-muted-foreground">
                    There are no tournaments available for registration at this time.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}