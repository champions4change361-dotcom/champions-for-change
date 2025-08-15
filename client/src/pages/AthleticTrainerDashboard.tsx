import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Heart, AlertTriangle, Users, FileText, Activity, MessageSquare, Shield } from "lucide-react";

export default function AthleticTrainerDashboard() {
  const { user } = useAuth();

  // Fetch all students under this trainer's care
  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ['/api/athletic-trainer/students'],
    enabled: !!user?.id
  });

  const { data: activeAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/athletic-trainer/active-alerts'],
    enabled: !!user?.id
  });

  const { data: pendingClearances, isLoading: clearancesLoading } = useQuery({
    queryKey: ['/api/athletic-trainer/pending-clearances'],
    enabled: !!user?.id
  });

  const { data: coachCommunications, isLoading: communicationsLoading } = useQuery({
    queryKey: ['/api/athletic-trainer/coach-communications'],
    enabled: !!user?.id
  });

  if (studentsLoading || alertsLoading || clearancesLoading || communicationsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Athletic Trainer Dashboard</h1>
            <p className="text-slate-600">Welcome, {user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.organizationName}</p>
            <div className="flex items-center gap-2 mt-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">HIPAA Compliant Access</span>
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
          {/* Overview Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Student Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Students:</span>
                  <span className="font-semibold">{students?.totalCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Athletes:</span>
                  <span className="font-semibold">{students?.activeAthletes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Current Restrictions:</span>
                  <span className="font-semibold text-red-600">{students?.restricted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pending Clearances:</span>
                  <span className="font-semibold text-yellow-600">{pendingClearances?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Coach Notifications:</span>
                  <span className="font-semibold text-blue-600">{coachCommunications?.unreadCount || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Health Alerts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Active Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeAlerts?.map((alert: any) => (
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
                        <h4 className="font-semibold">{alert.studentName}</h4>
                        <p className="text-sm text-slate-600">{alert.teamName} • {alert.sport}</p>
                      </div>
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      >
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{alert.description}</p>
                    <p className="text-xs text-slate-500 mb-2">Coach Message: {alert.coachMessage}</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={() => window.location.href = `/health-record/${alert.studentId}`}
                        data-testid={`button-view-record-${alert.studentId}`}
                      >
                        View Full Record
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.location.href = '/health-communication?alert=' + alert.id}
                        data-testid={`button-notify-coach-${alert.id}`}
                      >
                        Update Coach
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Clearances */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Return-to-Play Clearances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Student Name</th>
                    <th className="text-left p-2">Team/Sport</th>
                    <th className="text-left p-2">Injury/Condition</th>
                    <th className="text-left p-2">Date Restricted</th>
                    <th className="text-left p-2">Coach Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClearances?.map((clearance: any) => (
                    <tr key={clearance.id} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{clearance.studentName}</td>
                      <td className="p-2">{clearance.teamName} • {clearance.sport}</td>
                      <td className="p-2">{clearance.condition}</td>
                      <td className="p-2">{clearance.dateRestricted}</td>
                      <td className="p-2">
                        <Badge 
                          variant={clearance.coachAware ? 'default' : 'destructive'}
                        >
                          {clearance.coachAware ? 'Notified' : 'Pending Notification'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button 
                            size="sm"
                            onClick={() => window.location.href = `/clearance/${clearance.id}`}
                            data-testid={`button-process-${clearance.id}`}
                          >
                            Process
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = '/health-communication?clearance=' + clearance.id}
                            data-testid={`button-update-coach-${clearance.id}`}
                          >
                            Update Coach
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Coach Communications */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Coach Communications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {coachCommunications?.messages?.map((comm: any) => (
                <div key={comm.id} className="p-3 border rounded-lg bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">Coach {comm.coachName}</h4>
                      <p className="text-sm text-slate-600">{comm.teamName}</p>
                    </div>
                    <span className="text-xs text-slate-500">{comm.timeAgo}</span>
                  </div>
                  <p className="text-sm mb-2">Re: {comm.studentName} - {comm.subject}</p>
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/health-records'}
            data-testid="button-health-records"
          >
            <div className="text-center">
              <Heart className="h-6 w-6 mx-auto mb-1" />
              Health Records
            </div>
          </Button>
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/injury-management'}
            data-testid="button-injury-management"
          >
            <div className="text-center">
              <Activity className="h-6 w-6 mx-auto mb-1" />
              Injury Management
            </div>
          </Button>
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/health-communication'}
            data-testid="button-coach-communications"
          >
            <div className="text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-1" />
              Coach Communications
            </div>
          </Button>
          <Button 
            className="h-16"
            onClick={() => window.location.href = '/health-analytics'}
            data-testid="button-health-analytics"
          >
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-1" />
              Health Analytics
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}