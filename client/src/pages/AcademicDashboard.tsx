import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Calendar, 
  Trophy, 
  Users, 
  FileText, 
  TrendingUp, 
  Bell,
  BookOpen,
  Star,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface AcademicDashboardData {
  userId: string;
  userRole: string;
  dashboardData: {
    summary: {
      totalCompetitions: number;
      activeRegistrations: number;
      upcomingEvents: number;
      recentResults: number;
    };
    quickActions: Array<{
      actionId: string;
      actionName: string;
      actionType: 'link' | 'button' | 'form';
      actionUrl?: string;
      priority: 'high' | 'medium' | 'low';
      category: 'management' | 'registration' | 'scoring' | 'reporting';
    }>;
    notifications: Array<{
      notificationId: string;
      type: 'info' | 'warning' | 'success' | 'error';
      title: string;
      message: string;
      actionRequired: boolean;
      timestamp: string;
      read: boolean;
    }>;
    upcomingDeadlines: Array<{
      deadlineId: string;
      title: string;
      description: string;
      dueDate: string;
      priority: 'high' | 'medium' | 'low';
      category: string;
    }>;
  };
}

interface UILCompetition {
  id: string;
  name: string;
  category: string;
  competitionType: 'high_school' | 'aplus';
  gradeLevel: string;
  classification: string[];
  maxParticipants: number;
  isTeamEvent: boolean;
  contestFormat: string;
  teksAlignment: string;
  subjectArea: string;
  season: 'fall' | 'spring';
  isActive: boolean;
}

interface SystemStatus {
  systemHealth: 'healthy' | 'warning' | 'critical';
  activeCompetitions: number;
  totalParticipants: number;
  upcomingEvents: number;
  recentAlerts: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
  compliance: {
    ferpaCompliance: boolean;
    teksAlignment: number;
    dataIntegrity: boolean;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
  };
}

export default function AcademicDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Get dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<AcademicDashboardData>({
    queryKey: ['/api/academic/dashboard'],
    enabled: !!user
  });

  // Get UIL competitions
  const { data: uilCompetitions, isLoading: competitionsLoading } = useQuery<UILCompetition[]>({
    queryKey: ['/api/academic/competitions/uil'],
    enabled: !!user
  });

  // Get system status
  const { data: systemStatus, isLoading: statusLoading } = useQuery<SystemStatus>({
    queryKey: ['/api/academic/system/status'],
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <CardTitle>Academic Competition System</CardTitle>
            <CardDescription>Please log in to access the academic competition platform</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'district_athletic_director': 'District Athletic Director',
      'district_academic_coordinator': 'District Academic Coordinator',
      'school_athletic_director': 'School Athletic Director',
      'school_academic_coordinator': 'School Academic Coordinator',
      'academic_sponsor': 'Academic Sponsor/Coach',
      'academic_coach': 'Academic Coach',
      'contest_judge': 'Contest Judge',
      'meet_manager': 'Meet Manager',
      'academic_student': 'Student',
      'team_captain': 'Team Captain'
    };
    return roleMap[role] || role;
  };

  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="heading-main">
                  Academic Competition System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user.firstName} • {getRoleDisplayName(user.userRole || '')}
                </p>
              </div>
            </div>
            
            {systemStatus && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    systemStatus.systemHealth === 'healthy' ? 'bg-green-500' : 
                    systemStatus.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-sm font-medium ${getHealthStatusColor(systemStatus.systemHealth)}`}>
                    System {systemStatus.systemHealth}
                  </span>
                </div>
                <Badge variant="outline" data-testid="badge-competitions">
                  {systemStatus.activeCompetitions} Active Competitions
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="competitions" data-testid="tab-competitions">Competitions</TabsTrigger>
            <TabsTrigger value="registration" data-testid="tab-registration">Registration</TabsTrigger>
            <TabsTrigger value="scoring" data-testid="tab-scoring">Scoring</TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Summary Cards */}
            {dashboardData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Competitions</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-total-competitions">
                      {dashboardData.dashboardData.summary.totalCompetitions}
                    </div>
                    <p className="text-xs text-muted-foreground">50+ UIL Events Available</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Registrations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-active-registrations">
                      {dashboardData.dashboardData.summary.activeRegistrations}
                    </div>
                    <p className="text-xs text-muted-foreground">Students registered</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-upcoming-events">
                      {dashboardData.dashboardData.summary.upcomingEvents}
                    </div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Results</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" data-testid="stat-recent-results">
                      {dashboardData.dashboardData.summary.recentResults}
                    </div>
                    <p className="text-xs text-muted-foreground">Competitions completed</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick Actions */}
            {dashboardData && dashboardData.dashboardData.quickActions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>Common tasks for your role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dashboardData.dashboardData.quickActions.map((action) => (
                      <Button
                        key={action.actionId}
                        variant={action.priority === 'high' ? 'default' : 'outline'}
                        className="justify-between h-auto p-4"
                        data-testid={`action-${action.actionId}`}
                        asChild={action.actionType === 'link'}
                      >
                        {action.actionType === 'link' && action.actionUrl ? (
                          <Link to={action.actionUrl}>
                            <span className="text-left">
                              <div className="font-medium">{action.actionName}</div>
                              <div className="text-xs text-muted-foreground capitalize">{action.category}</div>
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <>
                            <span className="text-left">
                              <div className="font-medium">{action.actionName}</div>
                              <div className="text-xs text-muted-foreground capitalize">{action.category}</div>
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications and Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Notifications */}
              {dashboardData && dashboardData.dashboardData.notifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <span>Recent Notifications</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.dashboardData.notifications.slice(0, 5).map((notification) => (
                      <Alert key={notification.notificationId} className={
                        notification.type === 'error' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
                        notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950' :
                        notification.type === 'success' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
                        'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                      }>
                        <div className="flex items-start space-x-2">
                          {notification.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />}
                          {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                          {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                          {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-600 mt-0.5" />}
                          <div className="flex-1">
                            <AlertDescription>
                              <div className="font-medium">{notification.title}</div>
                              <div className="text-sm text-muted-foreground">{notification.message}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.timestamp).toLocaleDateString()}
                              </div>
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Deadlines */}
              {dashboardData && dashboardData.dashboardData.upcomingDeadlines.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Upcoming Deadlines</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {dashboardData.dashboardData.upcomingDeadlines.slice(0, 5).map((deadline) => (
                      <div key={deadline.deadlineId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{deadline.title}</div>
                          <div className="text-sm text-muted-foreground">{deadline.description}</div>
                          <div className="text-xs text-muted-foreground">
                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={getPriorityColor(deadline.priority)}>
                          {deadline.priority}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Compliance Status */}
            {systemStatus && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Compliance & Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">FERPA Compliance</span>
                        <Badge variant={systemStatus.compliance.ferpaCompliance ? "default" : "destructive"}>
                          {systemStatus.compliance.ferpaCompliance ? "Compliant" : "Action Required"}
                        </Badge>
                      </div>
                      <Progress 
                        value={systemStatus.compliance.ferpaCompliance ? 100 : 75} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">TEKS Alignment</span>
                        <span className="text-sm text-muted-foreground">
                          {systemStatus.compliance.teksAlignment}%
                        </span>
                      </div>
                      <Progress 
                        value={systemStatus.compliance.teksAlignment} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Data Integrity</span>
                        <Badge variant={systemStatus.compliance.dataIntegrity ? "default" : "destructive"}>
                          {systemStatus.compliance.dataIntegrity ? "Verified" : "Issues Found"}
                        </Badge>
                      </div>
                      <Progress 
                        value={systemStatus.compliance.dataIntegrity ? 100 : 80} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {systemStatus.performance.responseTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {systemStatus.performance.throughput}
                      </div>
                      <div className="text-sm text-muted-foreground">Requests/min</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {systemStatus.performance.errorRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">UIL Academic Competitions</h2>
                <p className="text-muted-foreground">50+ academic events covering grades 2-12</p>
              </div>
              <Link to="/academic/competitions/manage">
                <Button data-testid="button-manage-competitions">
                  Manage Competitions
                </Button>
              </Link>
            </div>

            {uilCompetitions && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uilCompetitions.slice(0, 12).map((competition) => (
                  <Card key={competition.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{competition.name}</CardTitle>
                        <Badge variant={competition.isActive ? "default" : "secondary"}>
                          {competition.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {competition.subjectArea} • {competition.gradeLevel}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <BookOpen className="h-4 w-4" />
                        <span>{competition.contestFormat.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{competition.maxParticipants} max participants</span>
                      </div>
                      {competition.isTeamEvent && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Trophy className="h-4 w-4" />
                          <span>Team Event</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <strong>TEKS:</strong> {competition.teksAlignment}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="registration" className="space-y-6">
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Student Registration</h3>
              <p className="text-muted-foreground mb-6">
                Register students for academic competitions with FERPA compliance
              </p>
              <Link to="/academic/registration">
                <Button size="lg" data-testid="button-start-registration">
                  Start Registration Process
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring" className="space-y-6">
            <div className="text-center py-12">
              <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Competition Scoring</h3>
              <p className="text-muted-foreground mb-6">
                Enter scores, manage judging, and track results
              </p>
              <Link to="/academic/scoring">
                <Button size="lg" data-testid="button-access-scoring">
                  Access Scoring System
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground mb-6">
                View performance analytics, TEKS alignment, and advancement tracking
              </p>
              <Link to="/academic/reports">
                <Button size="lg" data-testid="button-view-reports">
                  View Reports
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}