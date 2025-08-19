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
import { AlertCircle, Users, Building, GraduationCap, Heart, Trophy, FileText, Settings, GitBranch, ArrowLeft, LogIn, Shield, DollarSign, Calculator, Save, Download, Upload, Plus, Edit3, CheckCircle, AlertTriangle, School, UserCheck, BookOpen, ClipboardCheck } from 'lucide-react';
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
        
        <TabsContent value="budgets">
          <BudgetAllocationTab organizationId={organizationId} />
        </TabsContent>
        
        <TabsContent value="compliance">
          <ComplianceManagementTab organizationId={organizationId} />
        </TabsContent>
        
        <TabsContent value="schools">
          <SchoolManagementTab organizationId={organizationId} />
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

// BUDGET ALLOCATION TAB - Professional spreadsheet-style budget management
function BudgetAllocationTab({ organizationId }: { organizationId: string }) {
  const [budgetItems, setBudgetItems] = useState([
    // CCISD-style budget structure based on your research
    { category: 'PAYROLL COSTS', subcategory: 'Athletic Director Salary', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'PAYROLL COSTS', subcategory: 'Head Coaches Stipends', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'PAYROLL COSTS', subcategory: 'Assistant Coaches Stipends', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'PAYROLL COSTS', subcategory: 'Athletic Trainers', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'PAYROLL COSTS', subcategory: 'Support Staff', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    
    { category: 'PROFESSIONAL SERVICES', subcategory: 'Officials/Referees Fees', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'PROFESSIONAL SERVICES', subcategory: 'Medical Services', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'PROFESSIONAL SERVICES', subcategory: 'Event Security', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'PROFESSIONAL SERVICES', subcategory: 'Contracted Maintenance', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    
    { category: 'SUPPLIES & MATERIALS', subcategory: 'Uniforms & Equipment', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'SUPPLIES & MATERIALS', subcategory: 'Athletic Equipment', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'SUPPLIES & MATERIALS', subcategory: 'Office Supplies', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'SUPPLIES & MATERIALS', subcategory: 'First Aid Supplies', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    
    { category: 'OPERATING EXPENSES', subcategory: 'Transportation/Buses', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'OPERATING EXPENSES', subcategory: 'Tournament Entry Fees', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'OPERATING EXPENSES', subcategory: 'Travel/Meals/Lodging', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'OPERATING EXPENSES', subcategory: 'Awards & Banquets', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    
    { category: 'CAPITAL OUTLAY', subcategory: 'Equipment Purchases', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'CAPITAL OUTLAY', subcategory: 'Scoreboards/Technology', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'CAPITAL OUTLAY', subcategory: 'Vehicles', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    
    { category: 'FACILITIES & UTILITIES', subcategory: 'Field Maintenance', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'FACILITIES & UTILITIES', subcategory: 'Utilities for Events', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' },
    { category: 'FACILITIES & UTILITIES', subcategory: 'Insurance', budgeted: '', actual: '', variance: '', percentage: 'auto', notes: '' }
  ]);
  
  const [totalBudget, setTotalBudget] = useState('');
  
  // Calculate totals and variances
  const calculateTotals = () => {
    const budgetedTotal = budgetItems.reduce((sum, item) => sum + (parseFloat(item.budgeted) || 0), 0);
    const actualTotal = budgetItems.reduce((sum, item) => sum + (parseFloat(item.actual) || 0), 0);
    const varianceTotal = actualTotal - budgetedTotal;
    return { budgetedTotal, actualTotal, varianceTotal };
  };
  
  const updateBudgetItem = (index: number, field: string, value: string) => {
    const updated = [...budgetItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate variance if both budgeted and actual are present
    if (field === 'budgeted' || field === 'actual') {
      const budgeted = parseFloat(updated[index].budgeted) || 0;
      const actual = parseFloat(updated[index].actual) || 0;
      updated[index].variance = (actual - budgeted).toFixed(2);
    }
    
    setBudgetItems(updated);
  };
  
  const addBudgetItem = () => {
    setBudgetItems([...budgetItems, {
      category: 'CUSTOM',
      subcategory: 'New Line Item',
      budgeted: '',
      actual: '',
      variance: '',
      percentage: 'auto',
      notes: ''
    }]);
  };
  
  const { budgetedTotal, actualTotal, varianceTotal } = calculateTotals();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          District Athletic Budget Allocation
        </CardTitle>
        <CardDescription>
          Professional budget management tool with CCISD-style categories and automatic calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Budget Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <Label>Total Budget Allocation</Label>
              <Input
                type="number"
                placeholder="8400000"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-green-700 mt-1">CCISD Range: $8.4M - $15M</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Budgeted Total</Label>
              <p className="text-lg font-semibold text-blue-700">
                ${budgetedTotal.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Actual Spent</Label>
              <p className="text-lg font-semibold text-orange-700">
                ${actualTotal.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Variance</Label>
              <p className={`text-lg font-semibold ${varianceTotal >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                ${varianceTotal.toLocaleString()}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={addBudgetItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Line Item
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import Budget
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Budget
            </Button>
          </div>
          
          {/* Budget Spreadsheet */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Category</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Line Item</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Budgeted ($)</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Actual ($)</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Variance ($)</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-semibold">% of Total</th>
                    <th className="border border-gray-200 p-2 text-left text-sm font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetItems.map((item, index) => {
                    const percentage = totalBudget && item.budgeted 
                      ? ((parseFloat(item.budgeted) / parseFloat(totalBudget)) * 100).toFixed(1)
                      : '0.0';
                    const varianceColor = parseFloat(item.variance) >= 0 ? 'text-red-600' : 'text-green-600';
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-2">
                          <Input
                            value={item.category}
                            onChange={(e) => updateBudgetItem(index, 'category', e.target.value)}
                            className="border-0 bg-transparent text-xs font-medium"
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input
                            value={item.subcategory}
                            onChange={(e) => updateBudgetItem(index, 'subcategory', e.target.value)}
                            className="border-0 bg-transparent text-xs"
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input
                            type="number"
                            value={item.budgeted}
                            onChange={(e) => updateBudgetItem(index, 'budgeted', e.target.value)}
                            className="border-0 bg-transparent text-xs text-right"
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input
                            type="number"
                            value={item.actual}
                            onChange={(e) => updateBudgetItem(index, 'actual', e.target.value)}
                            className="border-0 bg-transparent text-xs text-right"
                            placeholder="0"
                          />
                        </td>
                        <td className={`border border-gray-200 p-2 ${varianceColor}`}>
                          <span className="text-xs font-medium">
                            {item.variance ? `${parseFloat(item.variance) >= 0 ? '+' : ''}${item.variance}` : '0.00'}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-2">
                          <span className="text-xs">{percentage}%</span>
                        </td>
                        <td className="border border-gray-200 p-2">
                          <Input
                            value={item.notes}
                            onChange={(e) => updateBudgetItem(index, 'notes', e.target.value)}
                            className="border-0 bg-transparent text-xs"
                            placeholder="Add notes..."
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Budget Guidelines */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">CCISD Budget Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium">Typical Allocation Ranges:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Payroll Costs: 50-70% ($4M-$10M)</li>
                  <li>Operating Expenses: 15-25% ($1M-$4M)</li>
                  <li>Supplies & Materials: 5-15% ($500K-$2M)</li>
                  <li>Professional Services: 5-10% ($300K-$1.5M)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Revenue Offsets:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Ticket Sales: $200K-$400K</li>
                  <li>Concessions: $150K-$300K</li>
                  <li>Playoff Games: $100K-$300K</li>
                  <li>Sponsorships: $50K-$200K</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// COMPLIANCE MANAGEMENT TAB
function ComplianceManagementTab({ organizationId }: { organizationId: string }) {
  const [complianceItems, setComplianceItems] = useState([
    { category: 'HIPAA Compliance', requirement: 'Staff Training Completed', status: 'pending', dueDate: '2024-12-01', responsible: 'Athletic Director', notes: '' },
    { category: 'FERPA Compliance', requirement: 'Agreement Signed', status: 'completed', dueDate: '2024-09-01', responsible: 'District Office', notes: 'Annual renewal required' },
    { category: 'Safety Protocols', requirement: 'Emergency Action Plans', status: 'in_progress', dueDate: '2024-11-15', responsible: 'Head Trainer', notes: '' },
    { category: 'Insurance Coverage', requirement: 'Liability Insurance Active', status: 'completed', dueDate: '2025-08-01', responsible: 'Business Office', notes: 'Policy #12345' },
    { category: 'UIL Compliance', requirement: 'Athletic Physical Forms', status: 'pending', dueDate: '2024-10-30', responsible: 'School Nurses', notes: '85% complete' },
    { category: 'Background Checks', requirement: 'All Coaches Cleared', status: 'in_progress', dueDate: '2024-11-01', responsible: 'HR Department', notes: '3 pending renewals' }
  ]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in_progress': return 'text-yellow-700 bg-yellow-100';
      case 'pending': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          HIPAA/FERPA Compliance Management
        </CardTitle>
        <CardDescription>
          Track regulatory compliance requirements and audit trails
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-2xl font-bold text-green-700">
                      {complianceItems.filter(item => item.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {complianceItems.filter(item => item.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-red-700">
                      {complianceItems.filter(item => item.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Compliance Tracking Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold">Category</th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold">Requirement</th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold">Status</th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold">Due Date</th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold">Responsible Party</th>
                  <th className="border border-gray-200 p-3 text-left text-sm font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {complianceItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 p-3 text-sm font-medium">{item.category}</td>
                    <td className="border border-gray-200 p-3 text-sm">{item.requirement}</td>
                    <td className="border border-gray-200 p-3">
                      <Badge className={`${getStatusColor(item.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                    <td className="border border-gray-200 p-3 text-sm">{item.dueDate}</td>
                    <td className="border border-gray-200 p-3 text-sm">{item.responsible}</td>
                    <td className="border border-gray-200 p-3 text-sm">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Audit Trail
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// SCHOOL MANAGEMENT TAB
function SchoolManagementTab({ organizationId }: { organizationId: string }) {
  const [schools] = useState([
    { 
      name: 'Miller High School', 
      students: 1247, 
      athletes: 287, 
      coaches: 18, 
      sports: ['Football', 'Basketball', 'Baseball', 'Track', 'Soccer'], 
      status: 'active',
      lastUpdate: '2024-08-15'
    },
    { 
      name: 'Driscoll Middle School', 
      students: 892, 
      athletes: 156, 
      coaches: 12, 
      sports: ['Basketball', 'Track', 'Soccer', 'Cross Country'], 
      status: 'active',
      lastUpdate: '2024-08-14'
    },
    { 
      name: 'Martin Middle School', 
      students: 734, 
      athletes: 134, 
      coaches: 10, 
      sports: ['Basketball', 'Track', 'Volleyball'], 
      status: 'active',
      lastUpdate: '2024-08-13'
    }
  ]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <School className="h-5 w-5" />
          District School Management
        </CardTitle>
        <CardDescription>
          Comprehensive oversight of all schools in the athletic district
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* District Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Total Schools</p>
                    <p className="text-2xl font-bold text-blue-700">{schools.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Total Athletes</p>
                    <p className="text-2xl font-bold text-green-700">
                      {schools.reduce((sum, school) => sum + school.athletes, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium">Total Coaches</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {schools.reduce((sum, school) => sum + school.coaches, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Total Students</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {schools.reduce((sum, school) => sum + school.students, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* School Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school, index) => (
              <Card key={index} className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">{school.name}</CardTitle>
                  <CardDescription>
                    Last updated: {school.lastUpdate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-gray-600">Total Students</Label>
                        <p className="font-semibold">{school.students.toLocaleString()}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Athletes</Label>
                        <p className="font-semibold">{school.athletes}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Coaches</Label>
                        <p className="font-semibold">{school.coaches}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Participation %</Label>
                        <p className="font-semibold">{((school.athletes / school.students) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-600">Sports Programs</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {school.sports.map((sport, sportIndex) => (
                          <Badge key={sportIndex} variant="outline" className="text-xs">
                            {sport}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="text-xs">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        Reports
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Management Actions */}
          <div className="flex gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              District Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}