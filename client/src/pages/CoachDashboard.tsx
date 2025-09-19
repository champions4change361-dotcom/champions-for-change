import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, AlertTriangle, Users, FileText, Activity, MessageSquare } from "lucide-react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";

export default function CoachDashboard() {
  const { user } = useAuth();

  // Fetch teams managed by this coach
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['/api/coach/teams'],
    enabled: !!user?.id
  });

  // Fetch player health status summaries (cleared/not cleared only)
  const { data: playerHealthStatus, isLoading: healthStatusLoading } = useQuery({
    queryKey: ['/api/coach/player-health-status'],
    enabled: !!user?.id
  });

  // Fetch health alerts affecting coach's players
  const { data: healthAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/coach/health-alerts'],
    enabled: !!user?.id
  });

  // Fetch communications with athletic trainer
  const { data: trainerCommunications, isLoading: communicationsLoading } = useQuery({
    queryKey: ['/api/coach/trainer-communications'],
    enabled: !!user?.id
  });

  if (teamsLoading || healthStatusLoading || alertsLoading || communicationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout
      title="Coach Dashboard"
      subtitle={`${user?.organizationName || 'Champions for Change'}`}
      variant="default"
    >
      <div className="mb-8">
        <p className="text-slate-600">Welcome, {user?.firstName} {user?.lastName}</p>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overview Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Teams:</span>
                  <span className="font-semibold">{teams?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Players:</span>
                  <span className="font-semibold">{playerHealthStatus?.totalPlayers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cleared to Play:</span>
                  <span className="font-semibold text-green-600">{playerHealthStatus?.cleared || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Health Restrictions:</span>
                  <span className="font-semibold text-red-600">{playerHealthStatus?.restricted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pending Review:</span>
                  <span className="font-semibold text-yellow-600">{playerHealthStatus?.pending || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Health Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Player Health Status Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {healthAlerts?.map((alert: any) => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{alert.playerName}</h4>
                        <p className="text-sm text-slate-600">{alert.teamName} • #{alert.jerseyNumber}</p>
                      </div>
                      <Badge 
                        variant={alert.clearanceStatus === 'cleared' ? 'default' : alert.clearanceStatus === 'restricted' ? 'destructive' : 'secondary'}
                      >
                        {alert.clearanceStatus?.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{alert.coachMessage}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = `/trainer-communication/${alert.id}`}
                        data-testid={`button-message-trainer-${alert.id}`}
                      >
                        Message Trainer
                      </Button>
                      {alert.clearanceStatus === 'cleared' && (
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = `/player/${alert.playerId}/return-to-play`}
                          data-testid={`button-return-to-play-${alert.playerId}`}
                        >
                          Return to Play
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical History Status Dashboard */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Medical History Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{playerHealthStatus?.cleared || 0}</div>
                <div className="text-sm text-green-700">Medical Forms Complete</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{playerHealthStatus?.pending || 0}</div>
                <div className="text-sm text-yellow-700">Forms Pending</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{healthAlerts?.filter((alert: any) => alert.type === 'health_concern')?.length || 0}</div>
                <div className="text-sm text-red-700">Health Concerns</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {playerHealthStatus?.cleared ? Math.round((playerHealthStatus.cleared / (playerHealthStatus.totalPlayers || 1)) * 100) : 0}%
                </div>
                <div className="text-sm text-blue-700">Completion Rate</div>
              </div>
            </div>

            {/* Medical Alerts */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900 mb-3">Medical Alerts & Notifications</h4>
              {healthAlerts && healthAlerts.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {healthAlerts.map((alert: any) => (
                    <div 
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                        alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-semibold">{alert.playerName}</h5>
                          <p className="text-sm text-slate-600">{alert.teamName}</p>
                        </div>
                        <Badge 
                          variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'warning' ? 'secondary' : 'default'}
                        >
                          {alert.type === 'missing_medical' ? 'INCOMPLETE' : 'HEALTH CONCERN'}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3">{alert.message}</p>
                      
                      {alert.severity === 'high' && (
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 mb-1">Recommendation:</p>
                          <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded inline-block">
                            Requires athletic trainer clearance before participation
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/teams/${alert.teamId || ''}/players/${alert.playerId}/edit`}
                          data-testid={`button-view-medical-${alert.playerId}`}
                        >
                          {alert.type === 'missing_medical' ? 'Complete Medical Form' : 'Review Medical History'}
                        </Button>
                        {alert.type === 'health_concern' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `/trainer-communication/${alert.playerId}`}
                            data-testid={`button-contact-trainer-${alert.playerId}`}
                          >
                            Contact Athletic Trainer
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>All medical forms are complete and no health concerns noted.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Roster with Health Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Roster - Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Player Name</th>
                    <th className="text-left p-2">Jersey #</th>
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Health Status</th>
                    <th className="text-left p-2">Last Update</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playerHealthStatus?.players?.map((player: any) => (
                    <tr key={player.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{player.name}</td>
                      <td className="p-2">#{player.jerseyNumber}</td>
                      <td className="p-2">{player.position}</td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            player.healthStatus === 'cleared' ? 'default' :
                            player.healthStatus === 'restricted' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {player.healthStatus?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </td>
                      <td className="p-2">{player.lastHealthUpdate || 'No updates'}</td>
                      <td className="p-2">
                        {player.healthStatus === 'restricted' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = '/health-communication?player=' + player.id}
                            data-testid={`button-health-inquiry-${player.id}`}
                          >
                            Health Inquiry
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Trainer Communications */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Trainer Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {trainerCommunications?.map((comm: any) => (
                <div key={comm.id} className="p-3 border rounded-lg bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">Trainer {comm.trainerName}</h4>
                      <p className="text-sm text-slate-600">{comm.subject}</p>
                    </div>
                    <span className="text-xs text-slate-500">{comm.timeAgo}</span>
                  </div>
                  <p className="text-sm mb-2">Re: {comm.playerName}</p>
                  <p className="text-sm text-slate-600">{comm.preview}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => window.location.href = '/health-communication'}
                    data-testid={`button-view-thread-${comm.id}`}
                  >
                    View Thread
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/team-management'}
            data-testid="button-team-management"
          >
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-1" />
              Team Management
            </div>
          </Button>
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/health-communication'}
            data-testid="button-health-communication"
          >
            <div className="text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-1" />
              Health Communication
            </div>
          </Button>
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/practice-schedule'}
            data-testid="button-practice-schedule"
          >
            <div className="text-center">
              <Activity className="h-6 w-6 mx-auto mb-1" />
              Practice Schedule
            </div>
          </Button>
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/tournaments'}
            data-testid="button-tournaments"
          >
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-1" />
              Tournaments
            </div>
          </Button>
        </div>
    </AuthenticatedLayout>
  );
}