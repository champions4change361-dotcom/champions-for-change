import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Users, UserCog, Edit, Trash2, Search, Shield, School } from "lucide-react";
import { useLocation } from "wouter";

export default function StaffRoles() {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  // Mock data for demonstration - replace with real API call
  const staffMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sjohnson@district.edu",
      role: "district_athletic_director",
      school: "District Office",
      status: "active"
    },
    {
      id: 2,
      name: "Mike Rodriguez", 
      email: "mrodriguez@lincoln.edu",
      role: "school_athletic_director",
      school: "Lincoln High School",
      status: "active"
    },
    {
      id: 3,
      name: "Emily Chen",
      email: "echen@washington.edu", 
      role: "athletic_trainer",
      school: "Washington Middle School",
      status: "active"
    }
  ];

  const roles = [
    { value: 'district_athletic_director', label: 'District Athletic Director', color: 'bg-red-600' },
    { value: 'district_head_athletic_trainer', label: 'District Head Athletic Trainer', color: 'bg-red-500' },
    { value: 'school_athletic_director', label: 'School Athletic Director', color: 'bg-blue-600' },
    { value: 'school_athletic_trainer', label: 'School Athletic Trainer', color: 'bg-blue-500' },
    { value: 'school_principal', label: 'School Principal', color: 'bg-purple-600' },
    { value: 'head_coach', label: 'Head Coach', color: 'bg-green-600' },
    { value: 'assistant_coach', label: 'Assistant Coach', color: 'bg-green-500' },
    { value: 'athletic_training_student', label: 'Athletic Training Student', color: 'bg-cyan-500' },
  ];

  const getRoleInfo = (roleValue: string) => {
    return roles.find(r => r.value === roleValue) || { label: roleValue, color: 'bg-gray-500' };
  };

  const filteredStaff = staffMembers.filter(member => 
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedRole === "" || member.role === selectedRole)
  );

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: number, newRole: string }) => {
      return apiRequest(`/api/admin/users/${userId}/role`, 'PATCH', { role: newRole });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update role",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Staff Role Management</h1>
          <p className="text-slate-600">Manage roles and permissions for district staff members</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Staff</p>
                  <p className="text-2xl font-bold text-slate-900">{staffMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Athletic Directors</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {staffMembers.filter(s => s.role.includes('athletic_director')).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Athletic Trainers</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {staffMembers.filter(s => s.role.includes('trainer')).length}
                  </p>
                </div>
                <UserCog className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Schools</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {new Set(staffMembers.map(s => s.school)).size}
                  </p>
                </div>
                <School className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search by name or email</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search staff members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-staff"
                  />
                </div>
              </div>
              <div className="min-w-48">
                <Label htmlFor="roleFilter">Filter by role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger data-testid="select-role-filter">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
            <CardDescription>
              Manage roles and permissions for your district staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School/Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => {
                  const roleInfo = getRoleInfo(member.role);
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge className={`text-white ${roleInfo.color}`}>
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.school}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-edit-${member.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-delete-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}