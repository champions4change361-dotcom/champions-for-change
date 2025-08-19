import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Shield,
  Users,
  UserCog,
  School,
  Stethoscope,
  Trophy,
  Calendar,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  Settings
} from "lucide-react";

interface UserRole {
  id: string;
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  schools: string[];
  medicalAccess: boolean;
  tournamentAccess: boolean;
  schedulingAccess: boolean;
  adminAccess: boolean;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdBy: string;
  createdAt: string;
}

interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'tournament' | 'scheduling' | 'admin';
  permissions: string[];
}

export default function AdminRoleManagement() {
  const [selectedTab, setSelectedTab] = useState("users");
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showNewUser, setShowNewUser] = useState(false);

  // Standard District Athletics Hierarchy Role Definitions
  const roleDefinitions: RolePermission[] = [
    {
      id: "district-athletic-director",
      name: "District Athletic Director",
      description: "District-wide athletics administration and oversight",
      category: "admin",
      permissions: [
        "admin.district_management",
        "admin.all_schools",
        "admin.budget_oversight",
        "admin.policy_creation",
        "tournament.district_wide",
        "medical.oversight",
        "scheduling.district_access"
      ]
    },
    {
      id: "district-athletic-coordinator",
      name: "District Athletic Coordinator",
      description: "Coordinates athletics programs and events across district",
      category: "admin",
      permissions: [
        "admin.program_coordination",
        "tournament.district_events",
        "scheduling.district_coordination",
        "admin.school_communication",
        "medical.basic_oversight"
      ]
    },
    {
      id: "district-athletic-trainer",
      name: "District Athletic Trainer",
      description: "Senior medical officer with full medical access across all schools",
      category: "medical",
      permissions: [
        "medical.full_access",
        "medical.assign_trainers", 
        "medical.hipaa_admin",
        "medical.emergency_protocols",
        "scheduling.medical_appointments",
        "admin.trainer_management"
      ]
    },
    {
      id: "district-aquatic-coordinator",
      name: "District Aquatic Coordinator",
      description: "Oversees aquatic programs and safety across district",
      category: "admin",
      permissions: [
        "admin.aquatic_programs",
        "medical.water_safety",
        "scheduling.aquatic_facilities",
        "admin.lifeguard_management",
        "tournament.aquatic_events"
      ]
    },
    {
      id: "school-athletic-director",
      name: "School Athletic Director", 
      description: "School-level sports administration with medical oversight",
      category: "admin",
      permissions: [
        "admin.school_management",
        "admin.coach_assignment",
        "medical.oversight",
        "tournament.school_events",
        "scheduling.school_access",
        "admin.school_role_assignment"
      ]
    },
    {
      id: "school-athletic-coordinator",
      name: "School Athletic Coordinator",
      description: "Coordinates school athletics programs and schedules",
      category: "admin",
      permissions: [
        "admin.school_coordination",
        "tournament.school_management",
        "scheduling.school_coordination",
        "admin.team_management"
      ]
    },
    {
      id: "school-athletic-trainer",
      name: "School Athletic Trainer",
      description: "Medical professional with school-specific access",
      category: "medical", 
      permissions: [
        "medical.assessment",
        "medical.care_plans",
        "medical.injury_tracking",
        "scheduling.medical_appointments",
        "medical.emergency_response"
      ]
    },
    {
      id: "school-aquatic-coordinator",
      name: "School Aquatic Coordinator",
      description: "Manages aquatic programs and safety at school level",
      category: "admin",
      permissions: [
        "admin.school_aquatic_programs",
        "medical.water_safety_school",
        "scheduling.school_aquatic",
        "tournament.aquatic_school_events"
      ]
    },
    {
      id: "head-coach",
      name: "Head Coach",
      description: "Lead coach with scheduling and limited medical oversight",
      category: "tournament",
      permissions: [
        "tournament.team_management",
        "scheduling.practices",
        "scheduling.games", 
        "medical.basic_reporting",
        "tournament.registration"
      ]
    },
    {
      id: "assistant-coach",
      name: "Assistant Coach",
      description: "Supporting coach with limited access",
      category: "tournament",
      permissions: [
        "tournament.assist_team",
        "scheduling.view_only",
        "medical.basic_reporting"
      ]
    },
    {
      id: "scorekeeper",
      name: "Scorekeeper/Judge",
      description: "Event officials with scoring access",
      category: "tournament",
      permissions: [
        "tournament.scoring",
        "tournament.event_management",
        "scheduling.event_access"
      ]
    }
  ];

  // Sample users data
  const users: UserRole[] = [
    {
      id: "1",
      userId: "dtrainer-001",
      userName: "Dr. Sarah Martinez",
      email: "smartinez@ccisd.org",
      roles: ["district-athletic-trainer", "admin"],
      schools: ["All Schools"],
      medicalAccess: true,
      tournamentAccess: false,
      schedulingAccess: true,
      adminAccess: true,
      status: "active",
      lastLogin: "2024-08-13 14:30",
      createdBy: "System",
      createdAt: "2024-01-15"
    },
    {
      id: "2", 
      userId: "ad-miller",
      userName: "Coach Mike Thompson",
      email: "mthompson@ccisd.org",
      roles: ["athletic-director"],
      schools: ["Roy Miller High"],
      medicalAccess: true,
      tournamentAccess: true,
      schedulingAccess: true,
      adminAccess: false,
      status: "active",
      lastLogin: "2024-08-13 16:45",
      createdBy: "Dr. Sarah Martinez",
      createdAt: "2024-02-01"
    },
    {
      id: "3",
      userId: "trainer-002",
      userName: "Lisa Chen",
      email: "lchen@ccisd.org", 
      roles: ["athletic-trainer"],
      schools: ["Carroll High", "Dawson Middle"],
      medicalAccess: true,
      tournamentAccess: false,
      schedulingAccess: true,
      adminAccess: false,
      status: "active",
      lastLogin: "2024-08-13 15:20",
      createdBy: "Dr. Sarah Martinez",
      createdAt: "2024-03-10"
    },
    {
      id: "4",
      userId: "coach-fb-001",
      userName: "David Rodriguez",
      email: "drodriguez@ccisd.org",
      roles: ["head-coach"],
      schools: ["Robert Driscoll Middle"],
      medicalAccess: false,
      tournamentAccess: true,
      schedulingAccess: true,
      adminAccess: false,
      status: "active",
      lastLogin: "2024-08-13 17:10",
      createdBy: "Coach Mike Thompson",
      createdAt: "2024-04-05"
    },
    {
      id: "5",
      userId: "coach-vb-001", 
      userName: "Amanda Wilson",
      email: "awilson@ccisd.org",
      roles: ["head-coach"],
      schools: ["Sterling Martin Middle"],
      medicalAccess: false,
      tournamentAccess: true,
      schedulingAccess: true,
      adminAccess: false,
      status: "pending",
      createdBy: "Coach Mike Thompson",
      createdAt: "2024-08-10"
    }
  ];

  const schools = [
    "Roy Miller High",
    "Veterans Memorial High", 
    "Carroll High",
    "Robert Driscoll Middle",
    "Sterling Martin Middle",
    "Cullen Middle",
    "Grant Middle",
    "Dawson Middle",
    "Hopper Middle"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical':
        return 'bg-red-600';
      case 'tournament':
        return 'bg-blue-600';
      case 'scheduling':
        return 'bg-green-600';
      case 'admin':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const filteredUsers = selectedSchool 
    ? users.filter(user => user.schools.includes(selectedSchool) || user.schools.includes("All Schools"))
    : users;

  const filteredByRole = selectedRole
    ? filteredUsers.filter(user => user.roles.includes(selectedRole))
    : filteredUsers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-green-800 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            CCISD Role Management & Access Control
          </h1>
          <p className="text-xl text-blue-200 mb-6">
            District Athletic Administration • Medical/Tournament Partitioning • User Access Management
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <Badge className="bg-red-600 text-white px-4 py-2">
              Medical Partition
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              Tournament Partition  
            </Badge>
            <Badge className="bg-purple-600 text-white px-4 py-2">
              Role-Based Access
            </Badge>
            <Badge className="bg-green-600 text-white px-4 py-2">
              HIPAA Compliant
            </Badge>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role Definitions
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Access Permissions
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Audit & Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              
              {/* Filters */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">School</label>
                    <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue placeholder="All Schools" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Schools</SelectItem>
                        {schools.map((school) => (
                          <SelectItem key={school} value={school}>
                            {school}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Role</label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Roles</SelectItem>
                        {roleDefinitions.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowNewUser(true)}
                    data-testid="button-add-user"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-500/20 rounded">
                    <span>Active Users</span>
                    <Badge className="bg-green-600">
                      {users.filter(u => u.status === 'active').length}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-red-500/20 rounded">
                    <span>Medical Access</span>
                    <Badge className="bg-red-600">
                      {users.filter(u => u.medicalAccess).length}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-500/20 rounded">
                    <span>Tournament Access</span>
                    <Badge className="bg-blue-600">
                      {users.filter(u => u.tournamentAccess).length}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-purple-500/20 rounded">
                    <span>Admin Access</span>
                    <Badge className="bg-purple-600">
                      {users.filter(u => u.adminAccess).length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-bulk-assign"
                  >
                    <UserCog className="h-4 w-4 mr-2" />
                    Bulk Role Assignment
                  </Button>
                  
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    data-testid="button-medical-audit"
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Medical Access Audit
                  </Button>
                  
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    data-testid="button-pending-approvals"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Pending Approvals
                  </Button>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-export-report"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Export Access Report
                  </Button>
                </CardContent>
              </Card>

              {/* Security Alert */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="bg-green-500/20 border-green-500/30 mb-3">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle className="text-green-200">HIPAA Compliant</AlertTitle>
                    <AlertDescription className="text-green-200">
                      All medical access properly segregated
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-yellow-500/20 border-yellow-500/30">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-yellow-200">Pending Reviews</AlertTitle>
                    <AlertDescription className="text-yellow-200">
                      {users.filter(u => u.status === 'pending').length} users awaiting approval
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* User List */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Directory ({filteredByRole.length} users)
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Manage user roles, permissions, and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredByRole.map((user) => (
                    <div 
                      key={user.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-lg font-semibold">{user.userName}</div>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                            {user.adminAccess && (
                              <Badge className="bg-purple-600">
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-blue-200">Contact</div>
                              <div className="font-medium">{user.email}</div>
                              <div className="text-sm text-blue-200">ID: {user.userId}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Assigned Schools</div>
                              <div className="flex flex-wrap gap-1">
                                {user.schools.map((school, index) => (
                                  <Badge key={index} variant="outline" className="text-white border-white/30 text-xs">
                                    {school}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Access Levels</div>
                              <div className="flex gap-2 flex-wrap">
                                {user.medicalAccess && (
                                  <Badge className="bg-red-600 text-xs">Medical</Badge>
                                )}
                                {user.tournamentAccess && (
                                  <Badge className="bg-blue-600 text-xs">Tournament</Badge>
                                )}
                                {user.schedulingAccess && (
                                  <Badge className="bg-green-600 text-xs">Scheduling</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Last Activity</div>
                              <div className="text-sm">{user.lastLogin || "Never"}</div>
                              <div className="text-sm text-blue-200">Added: {user.createdAt}</div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-blue-200 mb-2">Current Roles</div>
                            <div className="flex gap-2 flex-wrap">
                              {user.roles.map((roleId) => {
                                const role = roleDefinitions.find(r => r.id === roleId);
                                return role ? (
                                  <Badge key={roleId} className={getCategoryColor(role.category)}>
                                    {role.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid={`button-edit-${user.id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Roles
                        </Button>
                        
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-permissions-${user.id}`}>
                          <Lock className="h-3 w-3 mr-1" />
                          Permissions
                        </Button>
                        
                        {user.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid={`button-approve-${user.id}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {user.status === 'active' && (
                          <Button size="sm" variant="outline" className="text-red-400 border-red-400" data-testid={`button-suspend-${user.id}`}>
                            <Lock className="h-3 w-3 mr-1" />
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredByRole.length === 0 && (
                    <div className="text-center py-8 text-blue-200">
                      No users found matching the selected filters
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roleDefinitions.map((role) => (
                <Card key={role.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {role.category === 'medical' && <Stethoscope className="h-5 w-5" />}
                        {role.category === 'tournament' && <Trophy className="h-5 w-5" />}
                        {role.category === 'scheduling' && <Calendar className="h-5 w-5" />}
                        {role.category === 'admin' && <Shield className="h-5 w-5" />}
                        <div>
                          <div>{role.name}</div>
                          <div className="text-sm text-blue-200">{role.description}</div>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(role.category)}>
                        {role.category.charAt(0).toUpperCase() + role.category.slice(1)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Permissions ({role.permissions.length})</div>
                        <div className="space-y-2">
                          {role.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                              <CheckCircle className="h-3 w-3 text-green-400" />
                              <span className="text-sm">{permission}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Current Users</div>
                        <div className="text-lg font-semibold">
                          {users.filter(user => user.roles.includes(role.id)).length}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid={`button-edit-role-${role.id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit Role
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-assign-role-${role.id}`}>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Assign Users
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Access Permission Matrix
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Medical/Tournament partition enforcement and granular permission control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left p-3">Permission</th>
                        <th className="text-center p-3">District Trainer</th>
                        <th className="text-center p-3">Athletic Director</th>
                        <th className="text-center p-3">Athletic Trainer</th>
                        <th className="text-center p-3">Head Coach</th>
                        <th className="text-center p-3">Asst Coach</th>
                        <th className="text-center p-3">Scorekeeper</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-red-500/20">Medical Full Access</td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-red-500/20">HIPAA Admin</td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-red-500/20">Medical Assessment</td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-blue-500/20">Tournament Management</td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-blue-500/20">Tournament Scoring</td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-green-500/20">Game Scheduling</td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-green-500/20">Practice Scheduling</td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                      </tr>
                      <tr className="border-b border-white/10">
                        <td className="p-3 font-medium bg-purple-500/20">Role Assignment</td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><CheckCircle className="h-4 w-4 text-green-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                        <td className="text-center p-3"><Lock className="h-4 w-4 text-red-400 mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* HIPAA Compliance */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    HIPAA Compliance Audit
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Medical data access monitoring and compliance verification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert className="bg-green-500/20 border-green-500/30">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle className="text-green-200">Compliant</AlertTitle>
                      <AlertDescription className="text-green-200">
                        All medical access properly segregated and monitored
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <span>Medical Access Users</span>
                        <Badge className="bg-red-600">
                          {users.filter(u => u.medicalAccess).length}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <span>HIPAA Admin Access</span>
                        <Badge className="bg-purple-600">
                          {users.filter(u => u.roles.includes('district-athletic-trainer')).length}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <span>Last Audit</span>
                        <span className="text-sm">2024-08-13 09:00</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded">
                        <span>Next Review</span>
                        <span className="text-sm">2024-08-20 09:00</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-red-600 hover:bg-red-700" data-testid="button-hipaa-audit">
                      <Shield className="h-4 w-4 mr-2" />
                      Run HIPAA Audit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Access Log */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Recent Access Changes
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Audit trail of role and permission modifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Medical Access Granted</div>
                        <div className="text-xs text-blue-200">2 hours ago</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        Lisa Chen granted Athletic Trainer role at Carroll High
                      </div>
                      <div className="text-xs">
                        Modified by: Dr. Sarah Martinez
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Role Assignment</div>
                        <div className="text-xs text-blue-200">5 hours ago</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        Amanda Wilson assigned Head Coach role - pending approval
                      </div>
                      <div className="text-xs">
                        Modified by: Coach Mike Thompson
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Permission Update</div>
                        <div className="text-xs text-blue-200">1 day ago</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        Scheduling permissions updated for Head Coach role
                      </div>
                      <div className="text-xs">
                        Modified by: Dr. Sarah Martinez
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="text-white border-white/30" data-testid="button-view-full-audit">
                      View Full Audit Log
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}