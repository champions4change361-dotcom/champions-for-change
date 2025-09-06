import { useState } from "react";
import { GuestRegistrationForm } from "@/components/GuestRegistrationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Zap, CheckCircle, Heart } from "lucide-react";
import { Link } from "wouter";

export default function GuestRegistrationDemo() {
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationId, setRegistrationId] = useState<string>("");

  // Mock tournament data for demo
  const mockTournament = {
    id: "demo-tournament-001",
    name: "Spring Basketball Championship",
    organizerId: "demo-organizer-001",
    registrationFee: 25,
    description: "Annual spring basketball tournament for all skill levels",
    date: "April 15-16, 2025",
    location: "Community Sports Center"
  };

  const handleRegistrationSuccess = (id: string) => {
    setRegistrationId(id);
    setRegistrationComplete(true);
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="animate-bounce">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </div>
            
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                  🎉 Registration Successful!
                </CardTitle>
                <CardDescription className="text-lg">
                  Welcome to the tournament community!
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Registration ID:</strong> {registrationId}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Save this ID for your records. We've also sent a confirmation email with all the details.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">What happens next?</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">1</Badge>
                      <div>
                        <p className="font-medium">Check your email</p>
                        <p>We've sent tournament details and payment instructions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">2</Badge>
                      <div>
                        <p className="font-medium">Complete payment</p>
                        <p>Secure your spot with the $25 registration fee</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-0.5">3</Badge>
                      <div>
                        <p className="font-medium">Tournament day</p>
                        <p>Show up ready to compete on April 15-16, 2025!</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Heart className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800 dark:text-orange-200">
                        Want to create a full account?
                      </p>
                      <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Manage multiple tournaments, track your history, and connect with the community.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Create Full Account
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild className="flex-1">
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={() => setRegistrationComplete(false)}>
                    Try Another Registration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            Guest Registration Demo
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience our "Pay & Play" registration system - quick tournament signup without creating an account
          </p>
        </div>

        {/* Tournament Info Card */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{mockTournament.name}</CardTitle>
                <CardDescription>{mockTournament.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">
                ${mockTournament.registrationFee}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">📅 Date:</span> {mockTournament.date}
              </div>
              <div>
                <span className="font-medium">📍 Location:</span> {mockTournament.location}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Highlight */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Lightning Fast</h3>
              <p className="text-xs text-muted-foreground">2-minute registration</p>
            </Card>
            <Card className="text-center p-4">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">No Account Required</h3>
              <p className="text-xs text-muted-foreground">Start playing immediately</p>
            </Card>
            <Card className="text-center p-4">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Join the Family</h3>
              <p className="text-xs text-muted-foreground">Upgrade to full account later</p>
            </Card>
          </div>
        </div>

        {/* Registration Form */}
        <GuestRegistrationForm
          tournamentId={mockTournament.id}
          tournamentName={mockTournament.name}
          registrationFee={mockTournament.registrationFee}
          organizerId={mockTournament.organizerId}
          onSuccess={handleRegistrationSuccess}
        />

        {/* Footer Note */}
        <div className="text-center mt-8 text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            This is a demonstration of our guest registration system. In a real tournament, 
            payment processing would be integrated and confirmation emails would be sent automatically.
          </p>
        </div>
      </div>
    </div>
  );
}