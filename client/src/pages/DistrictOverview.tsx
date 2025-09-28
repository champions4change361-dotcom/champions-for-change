import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Trophy, Users, School, Calendar, MapPin, TrendingUp, AlertCircle, CheckCircle, Plus } from "lucide-react";
import { useLocation } from "wouter";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import DistrictTournamentWizard from "@/components/DistrictTournamentWizard";
import { useAuth } from "@/hooks/useAuth";

export default function DistrictOverview() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [showTournamentCreator, setShowTournamentCreator] = useState(false);

  // Mock data for demonstration
  const districtStats = {
    totalSchools: 12,
    totalAthletes: 3240,
    totalStaff: 156,
    activeTournaments: 8,
    upcomingEvents: 15,
    recentInjuries: 3,
    complianceScore: 96
  };

  const schools = [
    { name: "Lincoln High School", athletes: 450, sports: 12, compliance: 98 },
    { name: "Washington Middle School", athletes: 280, sports: 8, compliance: 94 },
    { name: "Roosevelt Elementary", athletes: 120, sports: 4, compliance: 100 },
    { name: "Jefferson High School", athletes: 420, sports: 11, compliance: 92 },
    { name: "Adams Middle School", athletes: 310, sports: 9, compliance: 96 }
  ];

  const upcomingEvents = [
    { name: "District Track & Field Championships", date: "2025-03-15", school: "Lincoln High", type: "championship" },
    { name: "Basketball Playoffs", date: "2025-03-20", school: "Washington Middle", type: "playoff" },
    { name: "Soccer Tournament", date: "2025-03-25", school: "Roosevelt Elementary", type: "tournament" },
    { name: "Swimming Championships", date: "2025-04-01", school: "Jefferson High", type: "championship" }
  ];

  const healthAlerts = [
    { type: "injury", message: "Football player concussion at Lincoln High - needs clearance", priority: "high" },
    { type: "equipment", message: "AED inspection due at Washington Middle", priority: "medium" },
    { type: "compliance", message: "Physical forms missing for 15 athletes", priority: "low" }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'championship': return 'bg-yellow-500';
      case 'playoff': return 'bg-blue-500';
      case 'tournament': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <AuthenticatedLayout
      title="District Athletics Overview"
      subtitle="Comprehensive view of district athletic programs and performance"
      backButtonHref="/dashboard"
      variant="default"
    >

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Schools</p>
                  <p className="text-2xl font-bold text-slate-900">{districtStats.totalSchools}</p>
                </div>
                <School className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Athletes</p>
                  <p className="text-2xl font-bold text-slate-900">{districtStats.totalAthletes.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Tournaments</p>
                  <p className="text-2xl font-bold text-slate-900">{districtStats.activeTournaments}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Compliance Score</p>
                  <p className="text-2xl font-bold text-slate-900">{districtStats.complianceScore}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schools" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schools">Schools</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="health">Health & Safety</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="schools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>School Performance</CardTitle>
                <CardDescription>Overview of athletic programs across district schools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schools.map((school, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{school.name}</h3>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>{school.athletes} athletes</span>
                          <span>{school.sports} sports</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-slate-600">Compliance:</span>
                          <Badge variant={school.compliance >= 95 ? 'default' : 'secondary'}>
                            {school.compliance}%
                          </Badge>
                        </div>
                        <Progress value={school.compliance} className="w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            {!showTournamentCreator ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5" />
                        District Tournaments
                      </CardTitle>
                      <CardDescription>Create and manage district-wide tournaments</CardDescription>
                    </div>
                    <Button 
                      onClick={() => setShowTournamentCreator(true)}
                      className="flex items-center gap-2"
                      data-testid="button-create-tournament"
                    >
                      <Plus className="h-4 w-4" />
                      Create Tournament
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mock tournament data for display */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">District Basketball Championship</h3>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>8 teams</span>
                          <span>Single Elimination</span>
                          <span>Starts March 15, 2025</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">Track & Field District Meet</h3>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>12 schools</span>
                          <span>Multi-Event</span>
                          <span>Starts April 1, 2025</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">Upcoming</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">Swimming Championships</h3>
                        <div className="flex gap-4 text-sm text-slate-600 mt-1">
                          <span>6 schools</span>
                          <span>Time Trials</span>
                          <span>Completed March 1, 2025</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    </div>

                    <div className="text-center py-8 text-slate-500">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">Ready to Create Your First Tournament?</p>
                      <p className="text-sm">
                        Use our simplified tournament wizard designed specifically for district coordinators.
                        Set up single elimination, round robin, track meets, and more.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <DistrictTournamentWizard
                    districtId={user?.organizationId || ""}
                    onTournamentCreated={(tournament) => {
                      toast({
                        title: "Tournament Created",
                        description: `${tournament.name} has been successfully created.`
                      });
                      setShowTournamentCreator(false);
                    }}
                    onCancel={() => setShowTournamentCreator(false)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>District-wide athletic events and competitions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{event.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.school}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900 mb-1">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <Badge className={`text-white ${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Health & Safety Alerts
                </CardTitle>
                <CardDescription>Current health and safety items requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthAlerts.map((alert, index) => (
                    <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{alert.message}</p>
                        <p className="text-sm text-slate-600 mt-1 capitalize">{alert.type} alert</p>
                      </div>
                      <Badge variant={getPriorityColor(alert.priority)}>
                        {alert.priority} priority
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Participation Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-slate-500">
                    Chart showing athlete participation over time would be displayed here
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Tournament Win Rate</span>
                      <span className="font-semibold">68%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Injury Rate</span>
                      <span className="font-semibold">2.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Equipment Utilization</span>
                      <span className="font-semibold">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Budget Efficiency</span>
                      <span className="font-semibold">94%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </AuthenticatedLayout>
  );
}