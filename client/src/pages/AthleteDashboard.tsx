import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Activity, AlertTriangle, Trophy, Clock, MapPin, User, Shield } from "lucide-react";

export default function AthleteDashboard() {
  const { user } = useAuth();

  // Fetch athlete's personal schedule
  const { data: schedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ['/api/athlete/schedule'],
    enabled: !!user?.id
  });

  // Fetch athlete's teams and sports
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['/api/athlete/teams'],
    enabled: !!user?.id
  });

  // Fetch tournament schedules they're participating in
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['/api/athlete/tournaments'],
    enabled: !!user?.id
  });

  // Fetch health clearance status (non-detailed, just cleared/not cleared)
  const { data: healthStatus, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/athlete/health-status'],
    enabled: !!user?.id
  });

  // Fetch transportation and logistics info
  const { data: logistics, isLoading: logisticsLoading } = useQuery({
    queryKey: ['/api/athlete/logistics'],
    enabled: !!user?.id
  });

  if (scheduleLoading || teamsLoading || tournamentsLoading || healthLoading || logisticsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">My Athletics Dashboard</h1>
            <p className="text-slate-600">Welcome, {user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.organizationName}</p>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-600 font-medium">Student Privacy Protected</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Clearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Medical Clearance</span>
                  <Badge 
                    variant={healthStatus?.clearanceStatus === 'cleared' ? 'default' : 'destructive'}
                    data-testid={`badge-clearance-${healthStatus?.clearanceStatus || 'unknown'}`}
                  >
                    {healthStatus?.clearanceStatus === 'cleared' ? 'Cleared' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Physical Exam</span>
                  <Badge 
                    variant={healthStatus?.physicalExpired ? 'destructive' : 'default'}
                    data-testid="badge-physical-status"
                  >
                    {healthStatus?.physicalExpired ? 'Expired' : 'Current'}
                  </Badge>
                </div>
                {healthStatus?.physicalExpiryDate && (
                  <p className="text-xs text-slate-500">
                    Physical expires: {new Date(healthStatus.physicalExpiryDate).toLocaleDateString()}
                  </p>
                )}
                {healthStatus?.clearanceStatus !== 'cleared' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-medium">Action Required</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Contact your athletic trainer to complete clearance requirements.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Teams Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teams && teams.length > 0 ? (
                  teams.map((team: any) => (
                    <div key={team.id} className="bg-slate-50 rounded-lg p-3" data-testid={`team-${team.id}`}>
                      <h4 className="font-semibold text-sm text-slate-800">{team.teamName}</h4>
                      <p className="text-xs text-slate-600">{team.sport} • {team.division}</p>
                      <p className="text-xs text-slate-500">Coach: {team.coachName}</p>
                      {team.position && (
                        <Badge variant="outline" className="text-xs mt-1">
                          {team.position}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No team assignments yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule && schedule.length > 0 ? (
                  schedule.slice(0, 5).map((event: any) => (
                    <div key={event.id} className="border-l-2 border-purple-500 pl-3" data-testid={`event-${event.id}`}>
                      <h5 className="font-semibold text-sm text-slate-800">{event.title}</h5>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <Badge 
                        variant={event.type === 'game' ? 'default' : 'secondary'} 
                        className="text-xs mt-1"
                      >
                        {event.type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No upcoming events</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tournament Schedule Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Tournament Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tournaments && tournaments.length > 0 ? (
                  tournaments.map((tournament: any) => (
                    <div key={tournament.id} className="bg-slate-50 rounded-lg p-4" data-testid={`tournament-${tournament.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800">{tournament.name}</h4>
                        <Badge variant="outline">
                          {tournament.sport}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">
                            <span className="font-medium">Date:</span> {new Date(tournament.date).toLocaleDateString()}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Location:</span> {tournament.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">
                            <span className="font-medium">Check-in:</span> {tournament.checkinTime}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Status:</span> 
                            <Badge className="ml-2" variant={tournament.status === 'confirmed' ? 'default' : 'secondary'}>
                              {tournament.status}
                            </Badge>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No tournaments scheduled</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transportation & Logistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Transportation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {logistics && logistics.transportation ? (
                  <div data-testid="transportation-info">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="font-semibold text-sm text-blue-900">Next Event Transportation</h5>
                      <p className="text-xs text-blue-800 mt-1">
                        <span className="font-medium">Departure:</span> {logistics.transportation.departureTime}
                      </p>
                      <p className="text-xs text-blue-800">
                        <span className="font-medium">Location:</span> {logistics.transportation.pickupLocation}
                      </p>
                      <p className="text-xs text-blue-800">
                        <span className="font-medium">Return:</span> {logistics.transportation.returnTime}
                      </p>
                    </div>
                    {logistics.transportation.parentPickupRequired && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                        <p className="text-xs text-yellow-800 font-medium">
                          Parent pickup required after event
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No transportation info available</p>
                )}
                
                {logistics && logistics.parentNotifications && (
                  <div className="mt-4">
                    <h6 className="font-semibold text-xs text-slate-700 mb-2">Parent Notifications</h6>
                    <div className="space-y-2">
                      {logistics.parentNotifications.map((notification: any, index: number) => (
                        <div key={index} className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                          {notification.message}
                          <span className="text-slate-400 ml-2">
                            {new Date(notification.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Important Information Banner */}
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-purple-900 text-sm">Student Privacy & Safety</h3>
              <p className="text-purple-800 text-xs mt-1">
                Your personal health information is protected and only shared with authorized school staff. 
                If you have questions about your clearance status or need to update any information, 
                please contact your athletic trainer or coach.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}