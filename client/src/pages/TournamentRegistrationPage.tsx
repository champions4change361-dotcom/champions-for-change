import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeamRegistrationWorkflow from "@/components/TeamRegistrationWorkflow";
import { useAuth } from "@/hooks/useAuth";

export default function TournamentRegistrationPage() {
  const { id, formId } = useParams<{ id: string; formId?: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: tournament, isLoading, error } = useQuery({
    queryKey: ["/api/tournaments", id],
    enabled: !!id,
  });

  const handleRegistrationComplete = () => {
    // Navigate to tournament page after successful registration
    setLocation(`/tournaments/${id}`);
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Invalid tournament ID. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading registration form...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tournament not found or registration is not available.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={() => setLocation("/tournaments")}
            variant="outline"
            data-testid="button-back-tournaments"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tournaments
          </Button>
        </div>
      </div>
    );
  }

  // Check if registration is open
  const now = new Date();
  const registrationDeadline = tournament.registrationDeadline ? new Date(tournament.registrationDeadline) : null;
  const isRegistrationClosed = registrationDeadline && now > registrationDeadline;

  if (isRegistrationClosed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Registration for this tournament has closed.
              {registrationDeadline && (
                <p className="mt-2 text-sm">
                  Registration deadline was: {registrationDeadline.toLocaleDateString()}
                </p>
              )}
            </AlertDescription>
          </Alert>
          <div className="space-x-2">
            <Button 
              onClick={() => setLocation(`/tournaments/${id}`)}
              variant="outline"
              data-testid="button-view-tournament"
            >
              View Tournament
            </Button>
            <Button 
              onClick={() => setLocation("/tournaments")}
              variant="outline"
              data-testid="button-back-tournaments"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tournaments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TeamRegistrationWorkflow
        tournamentId={id}
        registrationFormId={formId}
        onComplete={handleRegistrationComplete}
      />
    </div>
  );
}