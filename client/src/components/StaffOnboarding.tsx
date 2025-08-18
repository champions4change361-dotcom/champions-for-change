import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, UserPlus, Link as LinkIcon, CheckCircle, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface InvitationResult {
  code: string;
  link: string;
  expiresAt: string;
  maxUses: number;
  staffRole: string;
}

export function StaffOnboarding() {
  const [selectedRole, setSelectedRole] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [expirationDays, setExpirationDays] = useState("7");
  const [generatedInvitation, setGeneratedInvitation] = useState<InvitationResult | null>(null);
  const { toast } = useToast();

  const generateInvitation = useMutation({
    mutationFn: async (data: { staffRole: string; maxUses: number; expirationDays: number }) => {
      return apiRequest("/api/generate-staff-invitation", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (result) => {
      setGeneratedInvitation(result);
      toast({
        title: "Invitation Link Generated",
        description: `Successfully created invitation for ${result.staffRole}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Failed to generate invitation link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvitation = () => {
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select a staff role first",
        variant: "destructive",
      });
      return;
    }

    generateInvitation.mutate({
      staffRole: selectedRole,
      maxUses: parseInt(maxUses),
      expirationDays: parseInt(expirationDays)
    });
  };

  const staffRoles = [
    { value: "athletic_trainer", label: "Athletic Trainer", description: "Medical staff, injury prevention, equipment management" },
    { value: "head_coach", label: "Head Coach", description: "Team leadership, game strategy, player development" },
    { value: "assistant_coach", label: "Assistant Coach", description: "Coaching support, specialized training" },
    { value: "school_nurse", label: "School Nurse", description: "Medical oversight, health protocols" },
    { value: "equipment_manager", label: "Equipment Manager", description: "Inventory management, equipment maintenance" },
    { value: "scorekeeper", label: "Scorekeeper", description: "Game scoring, statistics tracking" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Staff Onboarding System</h1>
        <p className="text-slate-300">Generate secure invitation links for your athletic staff</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generation Form */}
        <Card className="bg-slate-800/50 border-slate-700" data-testid="card-invitation-generator">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <UserPlus className="h-5 w-5 mr-2 text-emerald-400" />
              Generate Invitation
            </CardTitle>
            <CardDescription>
              Create secure onboarding links for your staff members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="role-select" className="text-slate-300">Staff Role</Label>
              <select 
                id="role-select"
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                data-testid="select-staff-role"
              >
                <option value="">Select a role</option>
                {staffRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-uses" className="text-slate-300">Max Uses</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min="1"
                  max="50"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-max-uses"
                />
              </div>
              <div>
                <Label htmlFor="expiration-days" className="text-slate-300">Expires In (Days)</Label>
                <Input
                  id="expiration-days"
                  type="number"
                  min="1"
                  max="30"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  data-testid="input-expiration-days"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerateInvitation}
              disabled={generateInvitation.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="button-generate-invitation"
            >
              {generateInvitation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Generate Invitation Link
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Result */}
        {generatedInvitation && (
          <Card className="bg-slate-800/50 border-emerald-500/30" data-testid="card-generated-invitation">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-emerald-400" />
                Invitation Generated
              </CardTitle>
              <CardDescription>
                Send this link to your staff member
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-300">Staff Role</Label>
                <div className="text-white font-medium capitalize">
                  {generatedInvitation.staffRole.replace('_', ' ')}
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Registration Code</Label>
                <div className="flex items-center space-x-2">
                  <code className="bg-slate-700 px-3 py-1 rounded text-emerald-400 font-mono flex-1" data-testid="text-registration-code">
                    {generatedInvitation.code}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedInvitation.code, "Registration code")}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    data-testid="button-copy-code"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Invitation Link</Label>
                <div className="flex items-center space-x-2">
                  <code className="bg-slate-700 px-3 py-1 rounded text-blue-400 font-mono text-sm flex-1 truncate" data-testid="text-invitation-link">
                    {generatedInvitation.link}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedInvitation.link, "Invitation link")}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <Label className="text-slate-300 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Max Uses
                  </Label>
                  <div className="text-white font-medium" data-testid="text-max-uses">{generatedInvitation.maxUses}</div>
                </div>
                <div>
                  <Label className="text-slate-300 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Expires
                  </Label>
                  <div className="text-white font-medium" data-testid="text-expires-at">
                    {new Date(generatedInvitation.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
                <h4 className="text-emerald-400 font-medium mb-2">Instructions for Staff Member:</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>1. Click the invitation link above</li>
                  <li>2. Complete the registration form</li>
                  <li>3. Use your work email address</li>
                  <li>4. Access your role-specific dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage Examples */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Common Use Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-emerald-400 font-medium mb-2">Athletic Trainer</h3>
              <p className="text-slate-300 text-sm">
                Full medical access, injury tracking, equipment inventory, HIPAA compliance
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-blue-400 font-medium mb-2">Head Coach</h3>
              <p className="text-slate-300 text-sm">
                Team management, scheduling, player rosters, game planning
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <h3 className="text-purple-400 font-medium mb-2">Equipment Manager</h3>
              <p className="text-slate-300 text-sm">
                Inventory tracking, UPC scanning, maintenance schedules
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}