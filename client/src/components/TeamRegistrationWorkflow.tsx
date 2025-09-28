import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Save,
  X,
  Plus,
  User,
  Trophy,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Registration form schema
const teamRegistrationSchema = z.object({
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
  captainName: z.string().min(2, "Captain name is required"),
  captainEmail: z.string().email("Valid email is required"),
  captainPhone: z.string().min(10, "Valid phone number is required"),
  organization: z.string().optional(),
  players: z.array(z.object({
    name: z.string().min(2, "Player name is required"),
    email: z.string().email("Valid email is required").optional(),
    position: z.string().optional(),
    jerseyNumber: z.number().min(0).max(99).optional(),
    eligibilityVerified: z.boolean().default(false)
  })).min(1, "At least one player is required"),
  emergencyContact: z.object({
    name: z.string().min(2, "Emergency contact name is required"),
    phone: z.string().min(10, "Emergency contact phone is required"),
    relationship: z.string().min(2, "Relationship is required")
  }),
  medicalInfo: z.string().optional(),
  additionalNotes: z.string().optional(),
  agreesToTerms: z.boolean().refine(val => val === true, "Must agree to terms"),
  paymentMethod: z.enum(["online", "check", "cash", "waived"]).default("online")
});

type TeamRegistrationFormData = z.infer<typeof teamRegistrationSchema>;

interface TeamRegistrationWorkflowProps {
  tournamentId: string;
  registrationFormId?: string;
  onComplete?: () => void;
}

interface RegistrationForm {
  id: string;
  tournamentId: string;
  title: string;
  description: string;
  maxTeams: number;
  registrationDeadline: string;
  entryFee: number;
  paymentRequired: boolean;
  fields: any[];
  isActive: boolean;
}

interface TeamRegistration {
  id: string;
  teamName: string;
  captainName: string;
  captainEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  playerCount: number;
}

export function TeamRegistrationWorkflow({ 
  tournamentId, 
  registrationFormId,
  onComplete 
}: TeamRegistrationWorkflowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [players, setPlayers] = useState([{ name: "", email: "", position: "", jerseyNumber: undefined }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TeamRegistrationFormData>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      teamName: "",
      captainName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      captainEmail: user?.email || "",
      captainPhone: "",
      organization: user?.organizationName || "",
      players: [{ name: "", email: "", position: "", jerseyNumber: undefined, eligibilityVerified: false }],
      emergencyContact: { name: "", phone: "", relationship: "" },
      medicalInfo: "",
      additionalNotes: "",
      agreesToTerms: false,
      paymentMethod: "online"
    }
  });

  // Fetch tournament information
  const { data: tournament } = useQuery({
    queryKey: ["/api/tournaments", tournamentId],
    enabled: !!tournamentId
  });

  // Fetch registration form if ID provided
  const { data: registrationForm } = useQuery<RegistrationForm>({
    queryKey: ["/api/tournament-registration-forms", registrationFormId],
    enabled: !!registrationFormId
  });

  // Fetch existing team registrations for management view
  const { data: teamRegistrations = [], refetch: refetchRegistrations } = useQuery<TeamRegistration[]>({
    queryKey: ["/api/tournaments", tournamentId, "registrations"],
    enabled: !!tournamentId && !!user
  });

  // Submit team registration
  const submitRegistrationMutation = useMutation({
    mutationFn: async (data: TeamRegistrationFormData) => {
      const payload = {
        tournamentId,
        registrationFormId,
        teamName: data.teamName,
        captainName: data.captainName,
        captainEmail: data.captainEmail,
        captainPhone: data.captainPhone,
        organization: data.organization,
        players: data.players,
        emergencyContact: data.emergencyContact,
        medicalInfo: data.medicalInfo,
        additionalNotes: data.additionalNotes,
        paymentMethod: data.paymentMethod
      };

      const endpoint = registrationFormId 
        ? `/api/tournament-registration/${registrationFormId}/submit`
        : `/api/tournaments/${tournamentId}/register`;

      const response = await apiRequest(endpoint, "POST", payload);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Submitted!",
        description: "Your team registration has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId, "registrations"] });
      onComplete?.();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Add player to form
  const addPlayer = () => {
    const newPlayer = { name: "", email: "", position: "", jerseyNumber: undefined, eligibilityVerified: false };
    setPlayers([...players, newPlayer]);
    form.setValue("players", [...form.getValues("players"), newPlayer]);
  };

  // Remove player from form
  const removePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
    form.setValue("players", updatedPlayers);
  };

  // Update player data
  const updatePlayer = (index: number, field: string, value: any) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = { ...updatedPlayers[index], [field]: value };
    setPlayers(updatedPlayers);
    form.setValue("players", updatedPlayers);
  };

  const onSubmit = async (data: TeamRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      await submitRegistrationMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Team Information";
      case 2: return "Player Roster";
      case 3: return "Emergency & Medical";
      case 4: return "Review & Submit";
      default: return "Registration";
    }
  };

  const canManageRegistrations = user && (
    ['tournament_manager', 'assistant_tournament_manager', 'head_coach'].includes(user.userRole || '')
  );

  // Check if user can manage this tournament's registrations
  const canManageTournament = user && tournament && (
    user.id === tournament.userId ||
    ['tournament_manager', 'assistant_tournament_manager'].includes(user.userRole || '')
  );

  return (
    <div className="max-w-4xl mx-auto p-6" data-testid="team-registration-workflow">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Team Registration
        </h1>
        <p className="text-gray-600">
          {tournament?.name ? `Register your team for ${tournament.name}` : "Complete your team registration"}
        </p>
      </div>

      {/* Show management view for tournament managers */}
      {canManageTournament && (
        <Tabs defaultValue="register" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">New Registration</TabsTrigger>
            <TabsTrigger value="manage">Manage Registrations</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Registrations</CardTitle>
                <CardDescription>
                  Manage team registrations for this tournament
                </CardDescription>
              </CardHeader>
              <CardContent>
                {teamRegistrations.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                    <p className="text-gray-500">Team registrations will appear here once submitted.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamRegistrations.map((registration) => (
                      <div key={registration.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{registration.teamName}</h3>
                            <p className="text-sm text-gray-600">
                              Captain: {registration.captainName} • {registration.playerCount} players
                            </p>
                            <p className="text-xs text-gray-500">
                              Submitted: {new Date(registration.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                registration.status === 'approved' ? 'default' :
                                registration.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {registration.status}
                            </Badge>
                            {registration.status === 'pending' && (
                              <div className="flex space-x-1">
                                <Button size="sm" variant="outline">
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-6">
            {/* Registration form content */}
          </TabsContent>
        </Tabs>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{getStepTitle(currentStep)}</CardTitle>
              <CardDescription>Step {currentStep} of 4</CardDescription>
            </div>
            <div className="w-32">
              <Progress value={(currentStep / 4) * 100} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Team Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="teamName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your team name" {...field} data-testid="input-team-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="captainName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team Captain *</FormLabel>
                          <FormControl>
                            <Input placeholder="Captain's full name" {...field} data-testid="input-captain-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization/School</FormLabel>
                          <FormControl>
                            <Input placeholder="School or organization name" {...field} data-testid="input-organization" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="captainEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Captain Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="captain@example.com" {...field} data-testid="input-captain-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="captainPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Captain Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} data-testid="input-captain-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {tournament?.entryFee && tournament.entryFee > 0 && (
                    <Alert>
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Entry Fee:</strong> ${tournament.entryFee} per team
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 2: Player Roster */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Player Roster</h3>
                    <Button type="button" onClick={addPlayer} variant="outline" size="sm" data-testid="button-add-player">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Player
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {players.map((player, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Player {index + 1}</h4>
                          {players.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removePlayer(index)}
                              variant="ghost"
                              size="sm"
                              data-testid={`button-remove-player-${index}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Player Name *</Label>
                            <Input
                              placeholder="Full name"
                              value={player.name}
                              onChange={(e) => updatePlayer(index, "name", e.target.value)}
                              data-testid={`input-player-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              type="email"
                              placeholder="player@example.com"
                              value={player.email}
                              onChange={(e) => updatePlayer(index, "email", e.target.value)}
                              data-testid={`input-player-email-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Position</Label>
                            <Input
                              placeholder="e.g., Forward, Guard"
                              value={player.position}
                              onChange={(e) => updatePlayer(index, "position", e.target.value)}
                              data-testid={`input-player-position-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Jersey Number</Label>
                            <Input
                              type="number"
                              min="0"
                              max="99"
                              placeholder="0-99"
                              value={player.jerseyNumber || ""}
                              onChange={(e) => updatePlayer(index, "jerseyNumber", parseInt(e.target.value) || undefined)}
                              data-testid={`input-player-jersey-${index}`}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {tournament?.teamSize && (
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertDescription>
                        Maximum team size: {tournament.teamSize} players
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Step 3: Emergency & Medical */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Emergency Contact & Medical Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} data-testid="input-emergency-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} data-testid="input-emergency-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergencyContact.relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Parent, Spouse" {...field} data-testid="input-emergency-relationship" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="medicalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Information & Allergies</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List any medical conditions, allergies, or medications that coaches/staff should be aware of"
                            rows={3}
                            {...field} 
                            data-testid="textarea-medical-info"
                          />
                        </FormControl>
                        <FormDescription>
                          This information will be kept confidential and only shared with authorized personnel.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information or special requests"
                            rows={3}
                            {...field} 
                            data-testid="textarea-additional-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Review Your Registration</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="font-medium">Team:</span> {form.watch("teamName")}
                    </div>
                    <div>
                      <span className="font-medium">Captain:</span> {form.watch("captainName")} ({form.watch("captainEmail")})
                    </div>
                    <div>
                      <span className="font-medium">Players:</span> {players.filter(p => p.name).length} registered
                    </div>
                    {tournament?.entryFee && tournament.entryFee > 0 && (
                      <div>
                        <span className="font-medium">Entry Fee:</span> ${tournament.entryFee}
                      </div>
                    )}
                  </div>

                  {tournament?.entryFee && tournament.entryFee > 0 && (
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="online">Online Payment</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="cash">Cash at Event</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="agreesToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            data-testid="checkbox-agree-terms"
                            className="mt-1"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to the tournament terms and conditions *
                          </FormLabel>
                          <FormDescription>
                            By checking this box, you confirm that all information provided is accurate and that you agree to abide by tournament rules and regulations.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  data-testid="button-previous-step"
                >
                  Previous
                </Button>

                <div className="flex space-x-2">
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      data-testid="button-next-step"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting || !form.watch("agreesToTerms")}
                      data-testid="button-submit-registration"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamRegistrationWorkflow;