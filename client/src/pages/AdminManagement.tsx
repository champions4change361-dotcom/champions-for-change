import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Users, Trophy, Building2, Plus, Eye, Shield, User } from "lucide-react";
import { useLocation } from "wouter";

interface FakeUser {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  subscriptionPlan: string;
  organizationName: string;
  userType: 'district' | 'organizer' | 'business';
}

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [newUser, setNewUser] = useState<FakeUser>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    subscriptionPlan: '',
    organizationName: '',
    userType: 'district'
  });

  // Initialize role and subscription when userType changes
  useEffect(() => {
    const roleOptions = getRoleOptions(newUser.userType);
    const subscriptionOptions = getSubscriptionOptions(newUser.userType);
    
    // Only set defaults if current values are invalid for the new userType
    const isRoleValid = roleOptions.some(option => option.value === newUser.role);
    const isSubscriptionValid = subscriptionOptions.some(option => option.value === newUser.subscriptionPlan);
    
    if (!isRoleValid && roleOptions.length > 0) {
      setNewUser(prev => ({ ...prev, role: roleOptions[0].value }));
    }
    
    if (!isSubscriptionValid && subscriptionOptions.length > 0) {
      setNewUser(prev => ({ ...prev, subscriptionPlan: subscriptionOptions[0].value }));
    }
  }, [newUser.userType]);

  // Fetch existing users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Create fake user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: FakeUser) => {
      const response = await fetch("/api/admin/create-fake-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fake user created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        role: 'scorekeeper',
        subscriptionPlan: 'foundation',
        organizationName: '',
        userType: 'district'
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  const getRoleOptions = (userType: string) => {
    switch (userType) {
      case 'district':
        return [
          { value: 'district_athletic_director', label: 'District Athletic Director' },
          { value: 'district_head_athletic_trainer', label: 'District Head Athletic Trainer' },
          { value: 'school_athletic_director', label: 'School Athletic Director' },
          { value: 'school_athletic_trainer', label: 'School Athletic Trainer' },
          { value: 'school_principal', label: 'School Principal' },
          { value: 'head_coach', label: 'Head Coach' },
          { value: 'assistant_coach', label: 'Assistant Coach' },
        ];
      case 'organizer':
        return [
          { value: 'scorekeeper', label: 'Tournament Organizer' },
          { value: 'head_coach', label: 'Event Coordinator' },
        ];
      case 'business':
        return [
          { value: 'scorekeeper', label: 'Business Manager' },
          { value: 'head_coach', label: 'Operations Director' },
        ];
      default:
        return [{ value: 'scorekeeper', label: 'General User' }];
    }
  };

  const getSubscriptionOptions = (userType: string) => {
    switch (userType) {
      case 'district':
        return [
          { value: 'district_enterprise', label: 'District Enterprise ($4,500/year)' },
          { value: 'enterprise', label: 'Enterprise' },
        ];
      case 'organizer':
        return [
          { value: 'tournament_organizer', label: 'Tournament Organizer ($39/month)' },
          { value: 'tournament_organizer_annual', label: 'Tournament Organizer Annual ($399/year)' },
        ];
      case 'business':
        return [
          { value: 'enterprise', label: 'Business Enterprise ($149/month)' },
          { value: 'professional', label: 'Professional' },
        ];
      default:
        return [{ value: 'foundation', label: 'Foundation' }];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 md:space-y-4">
          <div className="flex items-center justify-center space-x-2 md:space-x-3">
            <Settings className="h-6 w-6 md:h-10 md:w-10 text-blue-600" />
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-slate-900">Master Admin Portal</h1>
              <p className="text-sm md:text-lg text-slate-600">Manage and test all platform features</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm md:text-lg px-3 py-1 md:px-4 md:py-2">
            Full Access Across All Platforms
          </Badge>
        </div>

        <Tabs defaultValue="create-users" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 h-auto p-1">
            <TabsTrigger value="create-users" className="text-xs md:text-sm p-1 md:p-2 h-8 md:h-10">Create Users</TabsTrigger>
            <TabsTrigger value="view-users" className="text-xs md:text-sm p-1 md:p-2 h-8 md:h-10">View Users</TabsTrigger>
            <TabsTrigger value="platform-access" className="text-xs md:text-sm p-1 md:p-2 h-8 md:h-10">Platform</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs md:text-sm p-1 md:p-2 h-8 md:h-10">Analytics</TabsTrigger>
          </TabsList>

          {/* Create Test Users Tab */}
          <TabsContent value="create-users">
            {/* Quick Login Component */}
            <Card className="mb-4 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  Quick Admin Login (Testing)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/login-form', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: 'admin@example.com',
                            password: 'admin123',
                            userType: 'district'
                          }),
                        });
                        if (response.ok) {
                          toast({ title: "Success", description: "Logged in successfully!" });
                          window.location.reload();
                        } else {
                          const error = await response.json();
                          toast({ title: "Error", description: error.message || "Login failed", variant: "destructive" });
                        }
                      } catch (error) {
                        toast({ title: "Error", description: "Network error during login", variant: "destructive" });
                      }
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-xs"
                    data-testid="button-quick-login-district"
                  >
                    <User className="h-3 w-3 mr-1" />
                    Login as District Admin
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/athletic-trainer-dashboard')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                    data-testid="button-org-chart"
                  >
                    <Building2 className="h-3 w-3 mr-1" />
                    Organizational Chart
                  </Button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Use this to authenticate and test user creation features
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Fake User Profiles</span>
                </CardTitle>
                <CardDescription>
                  Add test users to different platforms for testing features and workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {/* Basic Info - Full width on mobile */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">Basic Information</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-sm">First Name</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            placeholder="John"
                            className="text-sm"
                            data-testid="input-firstname"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-sm">Last Name</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            placeholder="Smith"
                            className="text-sm"
                            data-testid="input-lastname"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-sm">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          placeholder="john.smith@example.com"
                          className="text-sm"
                          data-testid="input-email"
                        />
                      </div>

                      <div>
                        <Label htmlFor="organizationName" className="text-sm">Organization</Label>
                        <Input
                          id="organizationName"
                          value={newUser.organizationName}
                          onChange={(e) => setNewUser({ ...newUser, organizationName: e.target.value })}
                          placeholder="Example School District"
                          className="text-sm"
                          data-testid="input-organization"
                        />
                      </div>
                    </div>

                    {/* Platform & Role */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900 text-sm md:text-base">Platform & Access</h3>
                      
                      <div>
                        <Label htmlFor="userType" className="text-sm">Platform Type</Label>
                        <select
                          id="userType"
                          value={newUser.userType}
                          onChange={(e) => {
                            const value = e.target.value as 'district' | 'organizer' | 'business';
                            const roleOptions = getRoleOptions(value);
                            const subscriptionOptions = getSubscriptionOptions(value);
                            setNewUser({ 
                              ...newUser, 
                              userType: value, 
                              role: roleOptions[0]?.value || '', 
                              subscriptionPlan: subscriptionOptions[0]?.value || '' 
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          data-testid="select-usertype"
                        >
                          <option value="district">District Platform</option>
                          <option value="organizer">Tournament Organizer</option>
                          <option value="business">Business Enterprise</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="role">Role</Label>
                        <select
                          id="role"
                          value={newUser.role}
                          onChange={(e) => {
                            setNewUser(prev => ({ ...prev, role: e.target.value }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          data-testid="select-role"
                        >
                          <option value="">Select role</option>
                          {getRoleOptions(newUser.userType).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                        <select
                          id="subscriptionPlan"
                          value={newUser.subscriptionPlan}
                          onChange={(e) => {
                            setNewUser(prev => ({ ...prev, subscriptionPlan: e.target.value }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          data-testid="select-subscription"
                        >
                          <option value="">Select subscription</option>
                          {getSubscriptionOptions(newUser.userType).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createUserMutation.isPending}
                    data-testid="button-create-user"
                  >
                    {createUserMutation.isPending ? "Creating..." : "Create Test User"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* View Users Tab */}
          <TabsContent value="view-users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Existing Users</span>
                </CardTitle>
                <CardDescription>
                  View and manage all users across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(users) && users.length ? (
                      users.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{user.firstName} {user.lastName}</h4>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            <p className="text-xs text-slate-500">{user.organizationName}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline">{user.complianceRole || user.userRole}</Badge>
                            <Badge variant="secondary">{user.subscriptionPlan}</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-600">No users found</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Platform Access Tab */}
          <TabsContent value="platform-access">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-blue-200">
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto" />
                  <CardTitle className="text-blue-900">District Platform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">Full access to district management features</p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700" 
                    data-testid="button-access-district"
                    onClick={() => navigate('/dashboard')}
                  >
                    Access District Features
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="text-center">
                  <Trophy className="h-8 w-8 text-purple-600 mx-auto" />
                  <CardTitle className="text-purple-900">Tournament Platform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">Professional tournament management tools</p>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    data-testid="button-access-tournament"
                    onClick={() => navigate('/create')}
                  >
                    Access Tournament Features
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="text-center">
                  <Building2 className="h-8 w-8 text-slate-600 mx-auto" />
                  <CardTitle className="text-slate-900">Business Platform</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-600">Enterprise-grade business solutions</p>
                  <Button 
                    className="w-full bg-slate-600 hover:bg-slate-700" 
                    data-testid="button-access-business"
                    onClick={() => navigate('/corporate-competitions')}
                  >
                    Access Business Features
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Overview of user activity and platform usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-blue-600">{Array.isArray(users) ? users.filter((u: any) => u.subscriptionPlan === 'district_enterprise').length : 0}</h3>
                    <p className="text-sm text-slate-600">District Users</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-purple-600">{Array.isArray(users) ? users.filter((u: any) => u.subscriptionPlan === 'professional').length : 0}</h3>
                    <p className="text-sm text-slate-600">Tournament Organizers</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <h3 className="text-2xl font-bold text-slate-600">{Array.isArray(users) ? users.filter((u: any) => u.subscriptionPlan === 'enterprise').length : 0}</h3>
                    <p className="text-sm text-slate-600">Business Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}