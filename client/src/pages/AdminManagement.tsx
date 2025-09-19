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
  userRole: string;
  complianceRole: string;
  subscriptionPlan: string;
  organizationName: string;
  userType: 'district' | 'organizer' | 'business' | 'general';
  organizationType: 'business' | 'nonprofit' | 'sports_club' | 'district' | 'school' | 'club';
  medicalDataAccess: boolean;
  // Hybrid subscription support
  hybridSubscription?: {
    baseType: 'team' | 'organizer' | 'district';
    teamTier?: 'starter' | 'growing' | 'elite';
    organizerPlan?: 'annual' | 'monthly';
    districtPlan?: 'enterprise' | 'unlimited';
    addons: {
      tournamentPerEvent: boolean;
      teamManagement: boolean;
    };
    pricing?: {
      basePrice: number;
      recurringAddons: number;
      perEventCosts: number;
    };
  };
}

export default function AdminManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  const [newUser, setNewUser] = useState<FakeUser>({
    firstName: '',
    lastName: '',
    email: '',
    userRole: '',
    complianceRole: '',
    subscriptionPlan: '',
    organizationName: '',
    userType: 'district',
    organizationType: 'district',
    medicalDataAccess: false,
    hybridSubscription: {
      baseType: 'team',
      teamTier: 'starter',
      organizerPlan: 'annual',
      addons: {
        tournamentPerEvent: false,
        teamManagement: false
      }
    }
  });

  // Helper function to get defaults for a userType
  const getDefaultsForUserType = (userType: string) => {
    const roleOptions = getRoleOptions(userType);
    const complianceRoleOptions = getComplianceRoleOptions(userType);
    const subscriptionOptions = getSubscriptionOptions(userType);
    
    let orgType: FakeUser['organizationType'] = 'district';
    switch (userType) {
      case 'district':
        orgType = 'district';
        break;
      case 'organizer':
        orgType = 'sports_club';
        break;
      case 'business':
        orgType = 'business';
        break;
      case 'general':
        orgType = 'club';
        break;
    }
    
    return {
      userRole: roleOptions[0]?.value || '',
      complianceRole: complianceRoleOptions[0]?.value || '',
      subscriptionPlan: subscriptionOptions[0]?.value || '',
      organizationType: orgType
    };
  };

  // Initialize role and subscription when userType changes
  useEffect(() => {
    const roleOptions = getRoleOptions(newUser.userType);
    const complianceRoleOptions = getComplianceRoleOptions(newUser.userType);
    const subscriptionOptions = getSubscriptionOptions(newUser.userType);
    
    // Only set defaults if current values are invalid for the new userType
    const isUserRoleValid = roleOptions.some(option => option.value === newUser.userRole);
    const isComplianceRoleValid = complianceRoleOptions.some(option => option.value === newUser.complianceRole);
    const isSubscriptionValid = subscriptionOptions.some(option => option.value === newUser.subscriptionPlan);
    
    let updates: Partial<FakeUser> = {};
    
    if (!isUserRoleValid && roleOptions.length > 0) {
      updates.userRole = roleOptions[0].value;
    }
    
    if (!isComplianceRoleValid && complianceRoleOptions.length > 0) {
      updates.complianceRole = complianceRoleOptions[0].value;
    }
    
    if (!isSubscriptionValid && subscriptionOptions.length > 0) {
      updates.subscriptionPlan = subscriptionOptions[0].value;
    }
    
    // Set organization type based on user type
    const defaults = getDefaultsForUserType(newUser.userType);
    if (newUser.organizationType !== defaults.organizationType) {
      updates.organizationType = defaults.organizationType;
    }
    
    if (Object.keys(updates).length > 0) {
      setNewUser(prev => ({ ...prev, ...updates }));
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
      const defaults = getDefaultsForUserType('district');
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        userRole: defaults.userRole,
        complianceRole: defaults.complianceRole,
        subscriptionPlan: defaults.subscriptionPlan,
        organizationName: '',
        userType: 'district',
        organizationType: defaults.organizationType,
        medicalDataAccess: false
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
          { value: 'district_athletic_coordinator', label: 'District Athletic Coordinator' },
          { value: 'district_athletic_trainer', label: 'District Athletic Trainer' },
          { value: 'district_aquatic_coordinator', label: 'District Aquatic Coordinator' },
          { value: 'school_athletic_director', label: 'School Athletic Director' },
          { value: 'school_athletic_coordinator', label: 'School Athletic Coordinator' },
          { value: 'school_athletic_trainer', label: 'School Athletic Trainer' },
          { value: 'school_aquatic_coordinator', label: 'School Aquatic Coordinator' },
          { value: 'head_coach', label: 'Head Coach' },
          { value: 'assistant_coach', label: 'Assistant Coach' },
        ];
      case 'organizer':
        return [
          { value: 'tournament_manager', label: 'Tournament Manager' },
          { value: 'assistant_tournament_manager', label: 'Assistant Tournament Manager' },
          { value: 'scorekeeper', label: 'Scorekeeper/Judge' },
          { value: 'head_coach', label: 'Head Coach' },
          { value: 'assistant_coach', label: 'Assistant Coach' },
          { value: 'parent_guardian', label: 'Parent/Guardian' },
        ];
      case 'business':
        return [
          { value: 'tournament_manager', label: 'Event Manager' },
          { value: 'scorekeeper', label: 'Operations Manager' },
          { value: 'head_coach', label: 'Team Lead' },
        ];
      default:
        return [
          { value: 'fan', label: 'General User/Fan' },
          { value: 'athlete', label: 'Athlete' },
          { value: 'parent_guardian', label: 'Parent/Guardian' },
          { value: 'scorekeeper', label: 'Scorekeeper' }
        ];
    }
  };

  // Separate function for compliance roles (HIPAA/FERPA specific)
  const getComplianceRoleOptions = (userType: string) => {
    switch (userType) {
      case 'district':
        return [
          { value: 'district_athletic_director', label: 'District Athletic Director' },
          { value: 'district_athletic_coordinator', label: 'District Athletic Coordinator' },
          { value: 'district_athletic_trainer', label: 'District Athletic Trainer' },
          { value: 'district_aquatic_coordinator', label: 'District Aquatic Coordinator' },
          { value: 'school_athletic_director', label: 'School Athletic Director' },
          { value: 'school_athletic_coordinator', label: 'School Athletic Coordinator' },
          { value: 'school_athletic_trainer', label: 'School Athletic Trainer' },
          { value: 'school_aquatic_coordinator', label: 'School Aquatic Coordinator' },
          { value: 'head_coach', label: 'Head Coach' },
          { value: 'assistant_coach', label: 'Assistant Coach' },
          { value: 'athletic_training_student', label: 'Athletic Training Student' },
        ];
      case 'organizer':
        return [
          { value: 'tournament_manager', label: 'Tournament Manager' },
          { value: 'assistant_tournament_manager', label: 'Assistant Tournament Manager' },
          { value: 'scorekeeper', label: 'Scorekeeper/Judge' },
          { value: 'parent_guardian', label: 'Parent/Guardian' },
        ];
      case 'business':
        return [
          { value: 'tournament_manager', label: 'Event Manager' },
          { value: 'scorekeeper', label: 'Operations Manager' },
        ];
      default:
        return [
          { value: 'scorekeeper', label: 'Scorekeeper' },
          { value: 'parent_guardian', label: 'Parent/Guardian' }
        ];
    }
  };

  const getSubscriptionOptions = (userType: string) => {
    switch (userType) {
      case 'district':
        return [
          { value: 'district_enterprise', label: 'District Enterprise ($4,500/year)' },
          { value: 'enterprise', label: 'Enterprise' },
          { value: 'professional', label: 'Professional' },
        ];
      case 'organizer':
        return [
          { value: 'hybrid-starter', label: 'Hybrid: Starter Team ($23/month)' },
          { value: 'hybrid-growing', label: 'Hybrid: Growing Team ($39/month)' },
          { value: 'hybrid-elite', label: 'Hybrid: Elite Program ($63/month)' },
          { value: 'hybrid-organizer-annual', label: 'Hybrid: Organizer Annual ($99/year)' },
          { value: 'hybrid-organizer-monthly', label: 'Hybrid: Organizer Monthly ($39/month)' },
          { value: 'tournament-organizer', label: 'Tournament Organizer ($39/month) - Legacy' },
        ];
      case 'business':
        return [
          { value: 'business-enterprise', label: 'Business Enterprise ($149/month)' },
          { value: 'enterprise', label: 'Enterprise' },
          { value: 'professional', label: 'Professional' },
          { value: 'champion', label: 'Champion' },
        ];
      default:
        return [
          { value: 'hybrid-starter', label: 'Hybrid: Starter Team ($23/month)' },
          { value: 'hybrid-growing', label: 'Hybrid: Growing Team ($39/month)' },
          { value: 'hybrid-elite', label: 'Hybrid: Elite Program ($63/month)' },
        ];
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
                        const response = await fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: 'champions4change361@gmail.com',
                            password: 'master-admin-danielthornton',
                            userType: 'district'
                          }),
                        });
                        if (response.ok) {
                          toast({ title: "Success", description: "Logged in as District Admin!" });
                          // Immediately redirect to district dashboard without delay
                          navigate('/role-based-dashboards');
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
                    onClick={() => navigate('/role-based-dashboards')}
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
                            const value = e.target.value as 'district' | 'organizer' | 'business' | 'general';
                            const defaults = getDefaultsForUserType(value);
                            setNewUser({ 
                              ...newUser, 
                              userType: value, 
                              userRole: defaults.userRole, 
                              complianceRole: defaults.complianceRole,
                              subscriptionPlan: defaults.subscriptionPlan,
                              organizationType: defaults.organizationType
                            });
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          data-testid="select-usertype"
                        >
                          <option value="district">District Platform</option>
                          <option value="organizer">Tournament Organizer</option>
                          <option value="business">Business Enterprise</option>
                          <option value="general">General User</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="userRole">User Role</Label>
                        <select
                          id="userRole"
                          value={newUser.userRole}
                          onChange={(e) => {
                            setNewUser(prev => ({ ...prev, userRole: e.target.value }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          data-testid="select-userrole"
                        >
                          <option value="">Select user role</option>
                          {getRoleOptions(newUser.userType).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="complianceRole">Compliance Role</Label>
                        <select
                          id="complianceRole"
                          value={newUser.complianceRole}
                          onChange={(e) => {
                            setNewUser(prev => ({ ...prev, complianceRole: e.target.value }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          data-testid="select-compliancerole"
                        >
                          <option value="">Select compliance role</option>
                          {getComplianceRoleOptions(newUser.userType).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          For HIPAA/FERPA compliance tracking
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="medicalDataAccess"
                          checked={newUser.medicalDataAccess}
                          onChange={(e) => {
                            setNewUser(prev => ({ ...prev, medicalDataAccess: e.target.checked }));
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          data-testid="checkbox-medical-access"
                        />
                        <Label htmlFor="medicalDataAccess" className="text-sm">
                          Medical Data Access (HIPAA)
                        </Label>
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

                      {/* Hybrid Subscription Configuration */}
                      {(newUser.subscriptionPlan?.startsWith('hybrid-') || newUser.userType === 'organizer') && (
                        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Hybrid Subscription Configuration
                          </h4>

                          {/* Base Type Selection */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="baseType">Base Type</Label>
                              <select
                                id="baseType"
                                value={newUser.hybridSubscription?.baseType || 'team'}
                                onChange={(e) => {
                                  const baseType = e.target.value as 'team' | 'organizer' | 'district';
                                  setNewUser(prev => ({
                                    ...prev,
                                    hybridSubscription: {
                                      ...prev.hybridSubscription!,
                                      baseType,
                                      teamTier: baseType === 'team' ? 'starter' : undefined,
                                      organizerPlan: baseType === 'organizer' ? 'annual' : undefined,
                                      districtPlan: baseType === 'district' ? 'enterprise' : undefined
                                    }
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                data-testid="select-base-type"
                              >
                                <option value="team">Team Management</option>
                                <option value="organizer">Tournament Organizer</option>
                                <option value="district">District Platform</option>
                              </select>
                            </div>

                            {/* Team Tier Selection */}
                            {newUser.hybridSubscription?.baseType === 'team' && (
                              <div>
                                <Label htmlFor="teamTier">Team Tier</Label>
                                <select
                                  id="teamTier"
                                  value={newUser.hybridSubscription?.teamTier || 'starter'}
                                  onChange={(e) => {
                                    const teamTier = e.target.value as 'starter' | 'growing' | 'elite';
                                    setNewUser(prev => ({
                                      ...prev,
                                      hybridSubscription: {
                                        ...prev.hybridSubscription!,
                                        teamTier
                                      }
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  data-testid="select-team-tier"
                                >
                                  <option value="starter">Starter Team ($23/month)</option>
                                  <option value="growing">Growing Team ($39/month)</option>
                                  <option value="elite">Elite Program ($63/month)</option>
                                </select>
                              </div>
                            )}

                            {/* Organizer Plan Selection */}
                            {newUser.hybridSubscription?.baseType === 'organizer' && (
                              <div>
                                <Label htmlFor="organizerPlan">Organizer Plan</Label>
                                <select
                                  id="organizerPlan"
                                  value={newUser.hybridSubscription?.organizerPlan || 'annual'}
                                  onChange={(e) => {
                                    const organizerPlan = e.target.value as 'annual' | 'monthly';
                                    setNewUser(prev => ({
                                      ...prev,
                                      hybridSubscription: {
                                        ...prev.hybridSubscription!,
                                        organizerPlan
                                      }
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  data-testid="select-organizer-plan"
                                >
                                  <option value="annual">Annual Plan ($99/year)</option>
                                  <option value="monthly">Monthly Plan ($39/month)</option>
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Add-ons Section */}
                          <div>
                            <Label className="text-sm font-semibold">Add-ons</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              {/* Tournament Per-Event Add-on */}
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  id="tournamentPerEvent"
                                  checked={newUser.hybridSubscription?.addons?.tournamentPerEvent || false}
                                  onChange={(e) => {
                                    setNewUser(prev => ({
                                      ...prev,
                                      hybridSubscription: {
                                        ...prev.hybridSubscription!,
                                        addons: {
                                          ...prev.hybridSubscription!.addons,
                                          tournamentPerEvent: e.target.checked
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                  data-testid="checkbox-tournament-addon"
                                />
                                <div>
                                  <Label htmlFor="tournamentPerEvent" className="text-sm font-medium">
                                    Tournament Per-Event
                                  </Label>
                                  <p className="text-xs text-gray-600">$50 per tournament</p>
                                </div>
                              </div>

                              {/* Team Management Add-on */}
                              <div className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  id="teamManagement"
                                  checked={newUser.hybridSubscription?.addons?.teamManagement || false}
                                  onChange={(e) => {
                                    setNewUser(prev => ({
                                      ...prev,
                                      hybridSubscription: {
                                        ...prev.hybridSubscription!,
                                        addons: {
                                          ...prev.hybridSubscription!.addons,
                                          teamManagement: e.target.checked
                                        }
                                      }
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                  data-testid="checkbox-team-addon"
                                />
                                <div>
                                  <Label htmlFor="teamManagement" className="text-sm font-medium">
                                    Team Management
                                  </Label>
                                  <p className="text-xs text-gray-600">$20/month recurring</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Pricing Preview */}
                          <div className="bg-white p-3 rounded-lg border border-blue-200">
                            <h5 className="font-semibold text-sm text-blue-900 mb-2">Pricing Preview</h5>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Base Subscription:</span>
                                <span className="font-medium">
                                  ${newUser.hybridSubscription?.baseType === 'team' 
                                    ? (newUser.hybridSubscription?.teamTier === 'starter' ? 23 : 
                                       newUser.hybridSubscription?.teamTier === 'growing' ? 39 : 63)
                                    : (newUser.hybridSubscription?.organizerPlan === 'annual' ? 99 : 39)
                                  }/month
                                </span>
                              </div>
                              {newUser.hybridSubscription?.addons?.teamManagement && (
                                <div className="flex justify-between">
                                  <span>Team Management:</span>
                                  <span className="font-medium">$20/month</span>
                                </div>
                              )}
                              {newUser.hybridSubscription?.addons?.tournamentPerEvent && (
                                <div className="flex justify-between">
                                  <span>Per-Tournament Fee:</span>
                                  <span className="font-medium">$50/event</span>
                                </div>
                              )}
                              <hr className="my-2" />
                              <div className="flex justify-between font-semibold text-blue-900">
                                <span>Monthly Total:</span>
                                <span>
                                  ${(newUser.hybridSubscription?.baseType === 'team' 
                                    ? (newUser.hybridSubscription?.teamTier === 'starter' ? 23 : 
                                       newUser.hybridSubscription?.teamTier === 'growing' ? 39 : 63)
                                    : (newUser.hybridSubscription?.organizerPlan === 'annual' ? 99 : 39))
                                  + (newUser.hybridSubscription?.addons?.teamManagement ? 20 : 0)}/month
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
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