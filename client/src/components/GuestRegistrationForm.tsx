import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, UserPlus, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GuestRegistrationFormProps {
  tournamentId: string;
  tournamentName: string;
  registrationFee?: number;
  organizerId: string;
  onSuccess?: (registrationId: string) => void;
}

export function GuestRegistrationForm({ 
  tournamentId, 
  tournamentName, 
  registrationFee = 0,
  organizerId,
  onSuccess 
}: GuestRegistrationFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    emergencyContact: "",
    emergencyPhone: "",
    ageGroup: "",
    skillLevel: "beginner"
  });

  const registerGuestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/guest-registration", {
        method: "POST",
        body: JSON.stringify({
          tournamentId,
          organizerId,
          ...data
        })
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful! 🎉",
        description: `Welcome to ${tournamentName}! Check your email for confirmation.`,
      });
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    registerGuestMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="guest-registration-form">
      <CardHeader className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          <Badge variant="secondary" className="text-sm font-medium">
            Quick Registration
          </Badge>
        </div>
        <CardTitle className="text-2xl font-bold">
          Join {tournamentName}
        </CardTitle>
        <CardDescription className="text-base">
          Get started in under 2 minutes - no account required!
        </CardDescription>
        
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>2 min signup</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            <span>No password needed</span>
          </div>
          <div className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span>Optional account later</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {registrationFee > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Registration Fee</span>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                ${registrationFee}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Payment will be processed after registration
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                data-testid="input-firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                data-testid="input-lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              data-testid="input-email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              We'll send your confirmation and tournament updates here
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              data-testid="input-phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Emergency Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                <Input
                  id="emergencyContact"
                  data-testid="input-emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                <Input
                  id="emergencyPhone"
                  type="tel"
                  data-testid="input-emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group</Label>
              <select
                id="ageGroup"
                data-testid="select-ageGroup"
                value={formData.ageGroup}
                onChange={(e) => handleInputChange("ageGroup", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select age group</option>
                <option value="youth">Youth (Under 18)</option>
                <option value="adult">Adult (18+)</option>
                <option value="senior">Senior (55+)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <select
                id="skillLevel"
                data-testid="select-skillLevel"
                value={formData.skillLevel}
                onChange={(e) => handleInputChange("skillLevel", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={registerGuestMutation.isPending}
            data-testid="button-register"
          >
            {registerGuestMutation.isPending ? (
              "Processing Registration..."
            ) : (
              `Register for ${tournamentName} ${registrationFee > 0 ? `($${registrationFee})` : '(Free)'}`
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By registering, you agree to receive tournament updates and communications. 
            You can create a full account later to manage multiple tournaments.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}