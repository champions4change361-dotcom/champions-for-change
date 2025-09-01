import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import EventScorekeeperDashboard from "@/components/event-scorekeeper-dashboard";

export default function EventScorekeeperDashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const tournamentEventId = params.eventId;
  const [hasAccess, setHasAccess] = useState(false);

  // Query to check tournament ownership for this event
  const { data: tournamentOwnership } = useQuery({
    queryKey: ["/api/events", tournamentEventId, "tournament-owner"],
    enabled: !!user && !!tournamentEventId,
    retry: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the event dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user has appropriate role OR owns the tournament
  useEffect(() => {
    if (user && tournamentOwnership !== undefined) {
      const hasValidRole = ['scorekeeper', 'head_coach', 'assistant_coach', 'tournament_manager'].includes(user.userRole || '');
      const isTournamentOwner = tournamentOwnership?.isTournamentOwner === true;
      
      if (hasValidRole || isTournamentOwner) {
        setHasAccess(true);
      } else {
        toast({
          title: "Access Restricted",
          description: "This area is for coaches, tournament officials, and tournament owners only.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }
    }
  }, [user, tournamentOwnership, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Login</h2>
          <p className="text-gray-600">Please wait while we redirect you to the login page...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess && tournamentOwnership !== undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this event management page.</p>
        </div>
      </div>
    );
  }

  if (!tournamentEventId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600">The event ID is missing from the URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Scorekeeper Dashboard</h1>
              <p className="text-gray-600">Managing event: {tournamentEventId}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Scorekeeper: {user.firstName || user.email}</p>
              <p className="text-sm text-gray-500">{user.organizationName || 'Independent Coach'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-8">
        <EventScorekeeperDashboard tournamentEventId={tournamentEventId} />
      </div>
    </div>
  );
}