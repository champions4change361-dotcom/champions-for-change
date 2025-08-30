import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Search, UserPlus, Check, 
  ArrowRight, AlertCircle, Trophy, CreditCard, Clock 
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TeamInfo {
  id: string;
  teamName: string;
  organizationName: string;
  captainName: string;
  currentPlayers: number;
  maxPlayers: number;
  registrationFee: number;
  feeStructure: "per_player" | "per_team";
  paymentMethod: "captain_pays_all" | "individual_payments" | "mixed";
  tournamentTitle: string;
  registrationDeadline: string;
}

interface PlayerRegistration {
  playerName: string;
  dateOfBirth: string;
  jerseyNumber: string;
  position: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface TeamMemberJoinFlowProps {
  onComplete: (registration: any) => void;
  onCancel: () => void;
}

export default function TeamMemberJoinFlow({ onComplete, onCancel }: TeamMemberJoinFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamCode, setTeamCode] = useState("");
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [playerData, setPlayerData] = useState<PlayerRegistration>({
    playerName: "",
    dateOfBirth: "",
    jerseyNumber: "",
    position: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const joinTeamMutation = useMutation({
    mutationFn: async (registrationData: PlayerRegistration & { teamCode: string }) => {
      const response = await apiRequest("POST", "/api/team-members/join", registrationData);
      return await response.json();
    },
    onSuccess: (data) => {
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamInfo?.id] });
      toast({
        title: "Successfully Joined Team!",
        description: `You have joined ${teamInfo?.teamName}. Check your email for next steps.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const searchTeam = async () => {
    if (!teamCode.trim()) {
      setSearchError("Please enter a team code");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await apiRequest("GET", `/api/teams/search?code=${teamCode.toUpperCase()}`);
      const data = await response.json();
      
      if (data.team) {
        setTeamInfo(data.team);
        setCurrentStep(2);
        toast({
          title: "Team Found!",
          description: `Found team: ${data.team.teamName}`,
        });
      } else {
        setSearchError("Team not found. Please check your team code.");
      }
    } catch (error: any) {
      setSearchError(error.message || "Failed to search for team");
    } finally {
      setIsSearching(false);
    }
  };

  const updatePlayerData = (key: keyof PlayerRegistration, value: string) => {
    setPlayerData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!teamInfo) return;
    
    joinTeamMutation.mutate({
      ...playerData,
      teamCode: teamCode.toUpperCase()
    });
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) {
      if (currentStep === 2) {
        setTeamInfo(null);
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return teamCode.trim().length >= 6;
      case 2:
        return teamInfo !== null;
      case 3:
        return playerData.playerName && playerData.parentName && playerData.parentEmail;
      default:
        return true;
    }
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'No deadline set';
    return new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const steps = [
    { number: 1, title: "Enter Code", icon: Search },
    { number: 2, title: "Team Info", icon: Trophy },
    { number: 3, title: "Player Details", icon: UserPlus },
    { number: 4, title: "Complete", icon: Check }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div 
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                currentStep >= step.number 
                  ? "bg-blue-600 border-blue-600 text-white" 
                  : "border-gray-300 text-gray-400"
              }`}
            >
              <step.icon className="h-6 w-6" />
            </div>
            <div className="ml-3 hidden md:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? "text-blue-600" : "text-gray-400"
              }`}>
                Step {step.number}
              </p>
              <p className={`text-xs ${
                currentStep >= step.number ? "text-blue-600" : "text-gray-400"
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className={`h-5 w-5 mx-4 ${
                currentStep > step.number ? "text-blue-600" : "text-gray-300"
              }`} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Join a Team</span>
          </CardTitle>
          <CardDescription>
            Use your team code to join an existing team and complete your registration
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Enter Team Code */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Your Team Code</h3>
                  <p className="text-sm text-gray-600">
                    Your team captain should have shared an 8-character code with you
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="teamCode">Team Code</Label>
                    <Input
                      id="teamCode"
                      value={teamCode}
                      onChange={(e) => {
                        setTeamCode(e.target.value.toUpperCase());
                        setSearchError("");
                      }}
                      placeholder="ABCD1234"
                      className="text-center text-2xl font-mono tracking-wider"
                      maxLength={8}
                      data-testid="input-team-code"
                    />
                    {searchError && (
                      <div className="mt-2 flex items-center space-x-2 text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{searchError}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={searchTeam}
                    disabled={!teamCode.trim() || isSearching}
                    className="w-full"
                    data-testid="button-search-team"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Searching..." : "Find Team"}
                  </Button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg max-w-lg mx-auto">
                  <h4 className="font-medium text-gray-900 mb-2">Don't have a team code?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Contact your team captain or coach to get your unique team code.
                  </p>
                  <p className="text-xs text-gray-500">
                    Team codes are usually 6-8 characters and look like "EAGLES23" or "BBALL2024"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Information */}
          {currentStep === 2 && teamInfo && (
            <div className="space-y-6">
              <div className="text-center">
                <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Team Found!</h3>
                <p className="text-gray-600">Review the team details below</p>
              </div>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Team Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Team Name:</span>
                          <span className="font-medium">{teamInfo.teamName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organization:</span>
                          <span className="font-medium">{teamInfo.organizationName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Captain:</span>
                          <span className="font-medium">{teamInfo.captainName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Players:</span>
                          <span className="font-medium">
                            {teamInfo.currentPlayers}/{teamInfo.maxPlayers}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Tournament Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tournament:</span>
                          <span className="font-medium">{teamInfo.tournamentTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Fee:</span>
                          <span className="font-medium">
                            ${teamInfo.registrationFee} {teamInfo.feeStructure === "per_player" ? "per player" : "per team"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method:</span>
                          <Badge variant="outline">
                            {teamInfo.paymentMethod === "captain_pays_all" 
                              ? "Captain Pays All" 
                              : teamInfo.paymentMethod === "individual_payments"
                              ? "Individual Payments"
                              : "Mixed Payments"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deadline:</span>
                          <span className="font-medium text-orange-600">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {formatDeadline(teamInfo.registrationDeadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {teamInfo.currentPlayers >= teamInfo.maxPlayers && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-yellow-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Team is Full</span>
                      </div>
                      <p className="text-xs text-yellow-600 mt-1">
                        This team has reached its maximum capacity. You may join the waitlist.
                      </p>
                    </div>
                  )}

                  {teamInfo.paymentMethod === "captain_pays_all" && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 text-blue-700">
                        <CreditCard className="h-4 w-4" />
                        <span className="text-sm font-medium">Payment Handled by Captain</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Your team captain will handle all payment processing. No payment required from you.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Player Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Player Registration Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Player Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Player Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="playerName">Full Name *</Label>
                      <Input
                        id="playerName"
                        value={playerData.playerName}
                        onChange={(e) => updatePlayerData('playerName', e.target.value)}
                        placeholder="John Smith"
                        data-testid="input-player-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={playerData.dateOfBirth}
                        onChange={(e) => updatePlayerData('dateOfBirth', e.target.value)}
                        data-testid="input-date-of-birth"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="jerseyNumber">Jersey #</Label>
                        <Input
                          id="jerseyNumber"
                          value={playerData.jerseyNumber}
                          onChange={(e) => updatePlayerData('jerseyNumber', e.target.value)}
                          placeholder="23"
                          data-testid="input-jersey-number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={playerData.position}
                          onChange={(e) => updatePlayerData('position', e.target.value)}
                          placeholder="Forward"
                          data-testid="input-position"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Parent/Guardian Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Parent/Guardian Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                      <Input
                        id="parentName"
                        value={playerData.parentName}
                        onChange={(e) => updatePlayerData('parentName', e.target.value)}
                        placeholder="Jane Smith"
                        data-testid="input-parent-name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="parentEmail">Email Address *</Label>
                      <Input
                        id="parentEmail"
                        type="email"
                        value={playerData.parentEmail}
                        onChange={(e) => updatePlayerData('parentEmail', e.target.value)}
                        placeholder="jane.smith@email.com"
                        data-testid="input-parent-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="parentPhone">Phone Number</Label>
                      <Input
                        id="parentPhone"
                        type="tel"
                        value={playerData.parentPhone}
                        onChange={(e) => updatePlayerData('parentPhone', e.target.value)}
                        placeholder="(555) 123-4567"
                        data-testid="input-parent-phone"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={playerData.emergencyContactName}
                        onChange={(e) => updatePlayerData('emergencyContactName', e.target.value)}
                        placeholder="Bob Smith"
                        data-testid="input-emergency-contact-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        value={playerData.emergencyContactPhone}
                        onChange={(e) => updatePlayerData('emergencyContactPhone', e.target.value)}
                        placeholder="(555) 987-6543"
                        data-testid="input-emergency-contact-phone"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <Check className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-900">Registration Complete!</h3>
                <p className="text-gray-600">
                  You have successfully joined {teamInfo?.teamName}
                </p>
              </div>

              <div className="max-w-md mx-auto bg-green-50 p-6 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">What's Next?</h4>
                <div className="text-sm text-green-800 space-y-1 text-left">
                  <p>• Check your email for confirmation and next steps</p>
                  <p>• Complete any required documents</p>
                  {teamInfo?.paymentMethod === "individual_payments" && (
                    <p>• Complete payment to finalize your registration</p>
                  )}
                  <p>• Wait for tournament updates from your team captain</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg max-w-lg mx-auto">
                <h5 className="font-medium text-blue-900 mb-2">Contact Information</h5>
                <p className="text-sm text-blue-800">
                  For questions about the team or tournament, contact your team captain: {teamInfo?.captainName}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : prevStep}
              data-testid="button-back"
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={currentStep === 3 ? handleSubmit : nextStep}
                disabled={!isStepValid() || joinTeamMutation.isPending}
                data-testid="button-next"
              >
                {currentStep === 3 ? (
                  joinTeamMutation.isPending ? "Joining Team..." : "Join Team"
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => onComplete({ teamInfo, playerData })}
                data-testid="button-complete"
              >
                View Team Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}