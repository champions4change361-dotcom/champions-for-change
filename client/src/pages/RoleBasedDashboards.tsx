import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Users, Building, GraduationCap, Heart, Trophy, FileText, Settings, GitBranch, ArrowLeft, LogIn, Shield } from 'lucide-react';
import { OrgChartBuilder } from '@/components/OrgChartBuilder';

interface DashboardProps {
  userRole: string;
  complianceRole?: string;
  organizationId?: string;
}

// DISTRICT LEVEL DASHBOARDS
function DistrictAthleticDirectorDashboard({ organizationId }: { organizationId: string }) {
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState('current_year');
  const [showOrgChartBuilder, setShowOrgChartBuilder] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              District Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Select Schools</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Miller High School', 'Driscoll Middle', 'Martin Middle'].map(school => (
                    <div key={school} className="flex items-center space-x-2">
                      <Checkbox 
                        id={school}
                        checked={selectedSchools.includes(school)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSchools([...selectedSchools, school]);
                          } else {
                            setSelectedSchools(selectedSchools.filter(s => s !== school));
                          }
                        }}
                      />
                      <Label htmlFor={school} className="text-sm">{school}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Athletic Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Sports Programs</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['Football', 'Basketball', 'Baseball', 'Track & Field', 'Soccer'].map(sport => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox 
                        id={sport}
                        checked={selectedSports.includes(sport)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSports([...selectedSports, sport]);
                          } else {
                            setSelectedSports(selectedSports.filter(s => s !== sport));
                          }
                        }}
                      />
                      <Label htmlFor={sport} className="text-sm">{sport}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health & Safety
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Injuries</span>
                <Badge variant="destructive">23</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pending Clearances</span>
                <Badge variant="secondary">8</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Trainers Available</span>
                <Badge variant="default">15</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">District Overview</TabsTrigger>
          <TabsTrigger value="schools">School Management</TabsTrigger>
          <TabsTrigger value="org-structure">Organization Structure</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="budgets">Budget Allocation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>District Athletic Overview</CardTitle>
              <CardDescription>Comprehensive view of all district athletic programs</CardDescription>
            </CardHeader>
            <CardContent>
              <p>District-wide athletic program management dashboard with cascading data access</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="org-structure">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Organization Structure Builder
              </CardTitle>
              <CardDescription>
                Build and manage your district's organizational hierarchy - just like a tournament bracket but for your staff structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">How It Works</h4>
                  <p className="text-blue-800 text-sm mb-3">
                    The organizational chart builder works exactly like creating a tournament bracket, but instead of teams advancing, 
                    you're building reporting relationships and role hierarchies.
                  </p>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Start with your top position (like Superintendent)</li>
                    <li>• Add direct reports (like Athletic Directors)</li>
                    <li>• Build down the hierarchy (Coaches, Trainers, etc.)</li>
                    <li>• Set permissions and access levels for each role</li>
                  </ul>
                </div>
                
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setShowOrgChartBuilder(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="button-org-chart-builder"
                  >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Build Organization Chart
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Current Structure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Organization Chart Builder Modal */}
      <OrgChartBuilder
        isOpen={showOrgChartBuilder}
        onClose={() => setShowOrgChartBuilder(false)}
        onSave={(orgChart) => {
          console.log('Saving organizational chart:', orgChart);
          // Here you would typically save to your backend
          setShowOrgChartBuilder(false);
          // Show success message
        }}
      />
    </div>
  );
}

function DistrictHeadAthleticTrainerDashboard({ organizationId }: { organizationId: string }) {
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [injuryTypes, setInjuryTypes] = useState<string[]>([]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Trainer Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Miller High - Sarah Johnson', 'Driscoll - Mike Rodriguez', 'Martin - Lisa Chen'].map(trainer => (
                <div key={trainer} className="flex items-center space-x-2">
                  <Checkbox 
                    id={trainer}
                    checked={selectedTrainers.includes(trainer)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTrainers([...selectedTrainers, trainer]);
                      } else {
                        setSelectedTrainers(selectedTrainers.filter(t => t !== trainer));
                      }
                    }}
                  />
                  <Label htmlFor={trainer} className="text-xs">{trainer}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              District Injuries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Concussions</span>
                <Badge variant="destructive">5</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">ACL Injuries</span>
                <Badge variant="destructive">3</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Minor Sprains</span>
                <Badge variant="secondary">15</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply Coordination</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Critical Stock</span>
                <Badge variant="destructive">8 items</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Low Stock</span>
                <Badge variant="secondary">12 items</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">CPR Certified</span>
                <Badge variant="default">15/15</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Expiring Soon</span>
                <Badge variant="secondary">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// SCHOOL LEVEL DASHBOARDS
function SchoolAthleticDirectorDashboard({ organizationId }: { organizationId: string }) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              School Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Varsity Football', 'JV Basketball', 'Freshman Baseball', 'Girls Soccer'].map(team => (
                <div key={team} className="flex items-center space-x-2">
                  <Checkbox 
                    id={team}
                    checked={selectedTeams.includes(team)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTeams([...selectedTeams, team]);
                      } else {
                        setSelectedTeams(selectedTeams.filter(t => t !== team));
                      }
                    }}
                  />
                  <Label htmlFor={team} className="text-sm">{team}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Grade Levels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['9th Grade', '10th Grade', '11th Grade', '12th Grade'].map(grade => (
                <div key={grade} className="flex items-center space-x-2">
                  <Checkbox 
                    id={grade}
                    checked={selectedGrades.includes(grade)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedGrades([...selectedGrades, grade]);
                      } else {
                        setSelectedGrades(selectedGrades.filter(g => g !== grade));
                      }
                    }}
                  />
                  <Label htmlFor={grade} className="text-sm">{grade}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Athletes</span>
                <Badge variant="default">247</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Active Coaches</span>
                <Badge variant="default">18</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pending Forms</span>
                <Badge variant="secondary">12</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SchoolAthleticTrainerDashboard({ organizationId }: { organizationId: string }) {
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [filterBySport, setFilterBySport] = useState('all');
  const [filterByStatus, setFilterByStatus] = useState('all');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter Athletes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>By Sport</Label>
              <Select value={filterBySport} onValueChange={setFilterBySport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="baseball">Baseball</SelectItem>
                  <SelectItem value="soccer">Soccer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>By Status</Label>
              <Select value={filterByStatus} onValueChange={setFilterByStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="injured">Injured</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {['Sarah Johnson - Basketball', 'Mike Rodriguez - Football', 'Lisa Chen - Soccer', 'David Wilson - Baseball'].map(athlete => (
                <div key={athlete} className="flex items-center space-x-2">
                  <Checkbox 
                    id={athlete}
                    checked={selectedAthletes.includes(athlete)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAthletes([...selectedAthletes, athlete]);
                      } else {
                        setSelectedAthletes(selectedAthletes.filter(a => a !== athlete));
                      }
                    }}
                  />
                  <Label htmlFor={athlete} className="text-sm">{athlete}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" size="sm">New Injury Report</Button>
            <Button className="w-full" size="sm" variant="outline">Update Care Plan</Button>
            <Button className="w-full" size="sm" variant="outline">Send Parent Update</Button>
            <Button className="w-full" size="sm" variant="outline">Schedule Appointment</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// TEAM LEVEL DASHBOARDS
function HeadCoachDashboard({ organizationId }: { organizationId: string }) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState('roster');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>View Mode</Label>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roster">Full Roster</SelectItem>
                    <SelectItem value="starters">Starters Only</SelectItem>
                    <SelectItem value="injured">Injured List</SelectItem>
                    <SelectItem value="cleared">Medical Cleared</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Player Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {['John Smith - QB', 'Mike Johnson - RB', 'David Lee - WR', 'Tom Wilson - LB'].map(player => (
                <div key={player} className="flex items-center space-x-2">
                  <Checkbox 
                    id={player}
                    checked={selectedPlayers.includes(player)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPlayers([...selectedPlayers, player]);
                      } else {
                        setSelectedPlayers(selectedPlayers.filter(p => p !== player));
                      }
                    }}
                  />
                  <Label htmlFor={player} className="text-sm">{player}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Active Players</span>
                <Badge variant="default">22</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Injured</span>
                <Badge variant="destructive">3</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Medical Cleared</span>
                <Badge variant="default">25</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// GENERAL ACCESS DASHBOARDS
function ScorekeeperDashboard({ organizationId }: { organizationId: string }) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState('active');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['Football vs. Central - 7:00 PM', 'Basketball vs. East - 6:00 PM', 'Soccer vs. West - 4:00 PM'].map(event => (
                <div key={event} className="flex items-center space-x-2">
                  <Checkbox 
                    id={event}
                    checked={selectedEvents.includes(event)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEvents([...selectedEvents, event]);
                      } else {
                        setSelectedEvents(selectedEvents.filter(e => e !== event));
                      }
                    }}
                  />
                  <Label htmlFor={event} className="text-sm">{event}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={gameStatus} onValueChange={setGameStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pregame">Pre-Game</SelectItem>
                <SelectItem value="active">Game Active</SelectItem>
                <SelectItem value="halftime">Halftime</SelectItem>
                <SelectItem value="finished">Game Finished</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AthleteDashboard({ organizationId }: { organizationId: string }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>My Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">Today</div>
                <div>Practice - 3:30 PM</div>
                <div>Study Hall - 5:00 PM</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Tomorrow</div>
                <div>Game vs. Central - 7:00 PM</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Health Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Clearance Status</span>
                <Badge variant="default">Cleared</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Physical Expires</span>
                <Badge variant="secondary">60 days</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium">Varsity Football</div>
                <div>Position: Wide Receiver</div>
                <div>Jersey: #84</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// MAIN DASHBOARD ROUTER
export default function RoleBasedDashboards() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to log in to access the dashboard and organizational chart builder.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => window.location.href = '/admin'}
                className="bg-blue-600 hover:bg-blue-700 w-full"
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Go to Admin Login
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Need access? Contact the system administrator</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRole = user.userRole || 'fan';
  const complianceRole = user.complianceRole;
  const organizationId = user.organizationId || '';

  const renderDashboard = () => {
    switch (userRole) {
      case 'district_athletic_director':
        return <DistrictAthleticDirectorDashboard organizationId={organizationId} />;
      case 'district_athletic_trainer':
        return <DistrictHeadAthleticTrainerDashboard organizationId={organizationId} />;
      case 'school_athletic_director':
        return <SchoolAthleticDirectorDashboard organizationId={organizationId} />;
      case 'school_athletic_trainer':
        return <SchoolAthleticTrainerDashboard organizationId={organizationId} />;
      case 'head_coach':
      case 'assistant_coach':
        return <HeadCoachDashboard organizationId={organizationId} />;
      case 'scorekeeper':
        return <ScorekeeperDashboard organizationId={organizationId} />;
      case 'athlete':
        return <AthleteDashboard organizationId={organizationId} />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Access Restricted</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your role ({userRole}) does not have access to specialized dashboard features.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.firstName} {user.lastName} Dashboard
          </h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{userRole.replace('_', ' ').toUpperCase()}</Badge>
            {complianceRole && (
              <Badge variant="secondary">{complianceRole.replace('_', ' ').toUpperCase()}</Badge>
            )}
            {user.organizationName && (
              <Badge variant="default">{user.organizationName}</Badge>
            )}
          </div>
        </div>
        
        {renderDashboard()}
      </div>
    </div>
  );
}