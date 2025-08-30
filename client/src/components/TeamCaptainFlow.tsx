import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, Trophy, Share, CreditCard, Check, 
  ArrowRight, ArrowLeft, Copy, Mail, Phone 
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TeamCaptainFlowProps {
  tournamentId: string;
  tournamentConfig: {
    title: string;
    registrationFee: number;
    minTeamSize: number;
    maxTeamSize: number;
    feeStructure: "per_player" | "per_team";
    allowCaptainPaysAll: boolean;
    allowIndividualPayments: boolean;
    allowPartialPayments: boolean;
  };
  onComplete: (teamData: any) => void;
  onCancel: () => void;
}

interface TeamRegistration {
  teamName: string;
  organizationName: string;
  captainName: string;
  captainEmail: string;
  captainPhone: string;
  paymentMethod: "captain_pays_all" | "individual_payments" | "mixed";
  initialPlayers: Array<{
    playerName: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
  }>;
}

export default function TeamCaptainFlow({ 
  tournamentId, 
  tournamentConfig, 
  onComplete, 
  onCancel 
}: TeamCaptainFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [teamData, setTeamData] = useState<TeamRegistration>({
    teamName: "",
    organizationName: "",
    captainName: "",
    captainEmail: "",
    captainPhone: "",
    paymentMethod: "individual_payments",
    initialPlayers: []
  });
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: async (teamRegistration: TeamRegistration) => {
      const response = await apiRequest("POST", "/api/team-registrations", {
        tournamentId,
        ...teamRegistration
      });
      return await response.json();
    },
    onSuccess: (data: { teamCode: string }) => {
      setGeneratedCode(data.teamCode);
      setCurrentStep(4);
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments", tournamentId] });
      toast({
        title: "Team Created Successfully!",
        description: "Your team has been created and your shareable code is ready.",
      });
    },
    onError: (error) => {
      toast({
        title: "Team Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTeamData = (key: keyof TeamRegistration, value: any) => {
    setTeamData(prev => ({ ...prev, [key]: value }));
  };

  const addPlayer = () => {
    if (teamData.initialPlayers.length < tournamentConfig.maxTeamSize) {
      setTeamData(prev => ({
        ...prev,
        initialPlayers: [...prev.initialPlayers, {
          playerName: "",
          parentName: "",
          parentEmail: "",
          parentPhone: ""
        }]
      }));
    }
  };

  const removePlayer = (index: number) => {
    setTeamData(prev => ({
      ...prev,
      initialPlayers: prev.initialPlayers.filter((_, i) => i !== index)
    }));
  };

  const updatePlayer = (index: number, field: string, value: string) => {
    setTeamData(prev => ({
      ...prev,
      initialPlayers: prev.initialPlayers.map((player, i) => 
        i === index ? { ...player, [field]: value } : player
      )
    }));
  };

  const copyTeamCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setIsCodeCopied(true);
      toast({
        title: "Code Copied!",
        description: "Team code copied to clipboard. Share it with your players.",
      });
      setTimeout(() => setIsCodeCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the team code.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalFee = () => {
    if (tournamentConfig.feeStructure === "per_team") {
      return tournamentConfig.registrationFee;
    } else {
      return tournamentConfig.registrationFee * teamData.initialPlayers.length;
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    createTeamMutation.mutate(teamData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return teamData.teamName && teamData.organizationName && teamData.captainName && teamData.captainEmail;
      case 2:
        return teamData.initialPlayers.length >= tournamentConfig.minTeamSize && 
               teamData.initialPlayers.every(p => p.playerName && p.parentName && p.parentEmail);
      case 3:
        return teamData.paymentMethod;
      default:
        return true;
    }
  };

  const steps = [
    { number: 1, title: "Team Details", icon: Trophy },
    { number: 2, title: "Add Players", icon: Users },
    { number: 3, title: "Payment Setup", icon: CreditCard },
    { number: 4, title: "Share Code", icon: Share }
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
              {currentStep > step.number ? (
                <Check className="h-6 w-6" />
              ) : (
                <step.icon className="h-6 w-6" />
              )}
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
            <Trophy className="h-6 w-6 text-blue-600" />
            <span>Create Your Team - {tournamentConfig.title}</span>
          </CardTitle>
          <CardDescription>
            Create your team and get a shareable code for your players to join
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Team Details */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={teamData.teamName}
                    onChange={(e) => updateTeamData('teamName', e.target.value)}
                    placeholder="Eagles Basketball Team"
                    data-testid="input-team-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="organizationName">School/Organization</Label>
                  <Input
                    id="organizationName"
                    value={teamData.organizationName}
                    onChange={(e) => updateTeamData('organizationName', e.target.value)}
                    placeholder="Lincoln High School"
                    data-testid="input-organization-name"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Team Captain Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="captainName">Captain Name *</Label>
                    <Input
                      id="captainName"
                      value={teamData.captainName}
                      onChange={(e) => updateTeamData('captainName', e.target.value)}
                      placeholder="John Smith"
                      data-testid="input-captain-name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="captainEmail">Email Address *</Label>
                    <Input
                      id="captainEmail"
                      type="email"
                      value={teamData.captainEmail}
                      onChange={(e) => updateTeamData('captainEmail', e.target.value)}
                      placeholder="john.smith@email.com"
                      data-testid="input-captain-email"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="captainPhone">Phone Number</Label>
                    <Input
                      id="captainPhone"
                      type="tel"
                      value={teamData.captainPhone}
                      onChange={(e) => updateTeamData('captainPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                      data-testid="input-captain-phone"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Players */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Team Players</h3>
                <Badge variant="outline">
                  {teamData.initialPlayers.length}/{tournamentConfig.maxTeamSize} Players
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600">
                Add at least {tournamentConfig.minTeamSize} players to continue. 
                You can add more players later using your team code.
              </p>

              <div className="space-y-4">
                {teamData.initialPlayers.map((player, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Player {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removePlayer(index)}
                        data-testid={`button-remove-player-${index}`}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Player Name *</Label>
                        <Input
                          value={player.playerName}
                          onChange={(e) => updatePlayer(index, 'playerName', e.target.value)}
                          placeholder="Player full name"
                          data-testid={`input-player-name-${index}`}
                        />
                      </div>
                      
                      <div>
                        <Label>Parent/Guardian Name *</Label>
                        <Input
                          value={player.parentName}
                          onChange={(e) => updatePlayer(index, 'parentName', e.target.value)}
                          placeholder="Parent or guardian name"
                          data-testid={`input-parent-name-${index}`}
                        />
                      </div>
                      
                      <div>
                        <Label>Parent Email *</Label>
                        <Input
                          type="email"
                          value={player.parentEmail}
                          onChange={(e) => updatePlayer(index, 'parentEmail', e.target.value)}
                          placeholder="parent@email.com"
                          data-testid={`input-parent-email-${index}`}
                        />
                      </div>
                      
                      <div>
                        <Label>Parent Phone</Label>
                        <Input
                          type="tel"
                          value={player.parentPhone}
                          onChange={(e) => updatePlayer(index, 'parentPhone', e.target.value)}
                          placeholder="(555) 123-4567"
                          data-testid={`input-parent-phone-${index}`}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {teamData.initialPlayers.length < tournamentConfig.maxTeamSize && (
                <Button
                  variant="outline"
                  onClick={addPlayer}
                  className="w-full"
                  data-testid="button-add-player"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Another Player
                </Button>
              )}
            </div>
          )}

          {/* Step 3: Payment Setup */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Configuration</h3>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Registration Fee Summary</h4>
                <div className="text-sm text-blue-800">
                  <p>Fee Structure: {tournamentConfig.feeStructure === "per_team" ? "Per Team" : "Per Player"}</p>
                  <p>Base Fee: ${tournamentConfig.registrationFee}</p>
                  <p>Current Players: {teamData.initialPlayers.length}</p>
                  <p className="font-semibold text-lg">Total: ${calculateTotalFee()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">How will your team pay?</h4>
                
                {tournamentConfig.allowCaptainPaysAll && (
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      teamData.paymentMethod === "captain_pays_all" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => updateTeamData('paymentMethod', 'captain_pays_all')}
                    data-testid="payment-method-captain-pays-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Captain Pays for Entire Team</h5>
                        <p className="text-sm text-gray-600">
                          You'll pay the full ${calculateTotalFee()} now for all players
                        </p>
                      </div>
                      <input
                        type="radio"
                        checked={teamData.paymentMethod === "captain_pays_all"}
                        onChange={() => updateTeamData('paymentMethod', 'captain_pays_all')}
                        className="text-blue-600"
                      />
                    </div>
                  </div>
                )}
                
                {tournamentConfig.allowIndividualPayments && (
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      teamData.paymentMethod === "individual_payments" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => updateTeamData('paymentMethod', 'individual_payments')}
                    data-testid="payment-method-individual-payments"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Individual Player Payments</h5>
                        <p className="text-sm text-gray-600">
                          Each player's family pays separately using your team code
                        </p>
                      </div>
                      <input
                        type="radio"
                        checked={teamData.paymentMethod === "individual_payments"}
                        onChange={() => updateTeamData('paymentMethod', 'individual_payments')}
                        className="text-blue-600"
                      />
                    </div>
                  </div>
                )}
                
                {tournamentConfig.allowPartialPayments && (
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      teamData.paymentMethod === "mixed" 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => updateTeamData('paymentMethod', 'mixed')}
                    data-testid="payment-method-mixed"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium">Mixed Payments</h5>
                        <p className="text-sm text-gray-600">
                          Some players pay individually, others you can pay for
                        </p>
                      </div>
                      <input
                        type="radio"
                        checked={teamData.paymentMethod === "mixed"}
                        onChange={() => updateTeamData('paymentMethod', 'mixed')}
                        className="text-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Team Code Sharing */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <Check className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-2xl font-bold text-gray-900">Team Created Successfully!</h3>
                <p className="text-gray-600">
                  Share this code with your players so they can join your team
                </p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center space-y-4">
                    <h4 className="font-semibold text-gray-900">Your Team Code</h4>
                    <div className="bg-white border-2 border-blue-500 rounded-lg p-4">
                      <div className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
                        {generatedCode}
                      </div>
                    </div>
                    <Button
                      onClick={copyTeamCode}
                      className="w-full"
                      data-testid="button-copy-team-code"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {isCodeCopied ? "Copied!" : "Copy Team Code"}
                    </Button>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-left">
                  <h5 className="font-medium text-gray-900">Share your team code:</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email it to parents</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Text it to team members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Share className="h-4 w-4" />
                      <span>Post it in your team group chat</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg max-w-lg mx-auto">
                <h5 className="font-medium text-blue-900 mb-2">What's Next?</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Players will use this code to join your team</p>
                  <p>• You can track registrations in your team dashboard</p>
                  <p>• Payment processing will begin once players join</p>
                </div>
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={currentStep === 3 ? handleSubmit : nextStep}
                disabled={!isStepValid() || createTeamMutation.isPending}
                data-testid="button-next"
              >
                {currentStep === 3 ? (
                  createTeamMutation.isPending ? "Creating Team..." : "Create Team"
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => onComplete({ teamCode: generatedCode, teamData })}
                data-testid="button-complete"
              >
                Continue to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}