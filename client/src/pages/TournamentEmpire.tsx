import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Shield, Users, Settings, Trophy, CreditCard, DollarSign } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EmpireStatus {
  empire_status: string;
  systems: {
    dashboard_configs: string;
    organization_hierarchy: string;
    permission_system: string;
    role_based_access: string;
  };
  stats: {
    organizations_count: number;
    permission_templates_count: number;
    supported_roles: string[];
    supported_tiers: string[];
  };
  deployment_time: string;
  message: string;
}

interface DashboardConfig {
  userRole: string;
  subscriptionTier: string;
  dashboardLayout: string;
  availableFeatures: string;
  uiPermissions: string;
  navigationConfig: string;
}

export default function TournamentEmpire() {
  const [selectedRole, setSelectedRole] = useState("tournament_manager");
  const [selectedTier, setSelectedTier] = useState("district_enterprise");
  const [isSettingUpPayments, setIsSettingUpPayments] = useState(false);
  const { toast } = useToast();

  // Fetch Empire status
  const { data: empireStatus, isLoading: statusLoading } = useQuery<EmpireStatus>({
    queryKey: ["/api/empire/status"],
  });

  // Fetch dashboard configuration
  const { data: dashboardConfig, isLoading: configLoading } = useQuery<{ success: boolean; config: DashboardConfig; empire_status: string }>({
    queryKey: ["/api/empire/dashboard-config", selectedRole, selectedTier],
    enabled: !!selectedRole && !!selectedTier,
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const parseJsonSafely = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return {};
    }
  };

  const handleSetupPayments = async () => {
    setIsSettingUpPayments(true);
    try {
      // Create Connect account
      const accountResponse = await apiRequest("POST", "/api/stripe/create-connect-account");
      const accountData = await accountResponse.json();
      
      if (accountData.accountId) {
        // Create account link for onboarding
        const linkResponse = await apiRequest("POST", "/api/stripe/create-account-link");
        const linkData = await linkResponse.json();
        
        if (linkData.url) {
          // Redirect to Stripe onboarding
          window.location.href = linkData.url;
        }
      }
    } catch (error) {
      console.error("Payment setup error:", error);
      toast({
        title: "Setup Error",
        description: "Unable to set up payment processing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSettingUpPayments(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Tournament Empire
          </h1>
          <Crown className="w-8 h-8 text-yellow-500" />
        </div>
        <p className="text-lg text-muted-foreground">
          Role-Based Dashboard & Organization Management System
        </p>
        {empireStatus && (
          <Badge variant="secondary" className="text-sm">
            Status: {empireStatus.empire_status}
          </Badge>
        )}
      </div>

      {/* Empire Status Overview */}
      {empireStatus && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Empire Systems Status</span>
            </CardTitle>
            <CardDescription>
              Real-time status of all Tournament Empire systems
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(empireStatus.systems).map(([system, status]) => (
                <div key={system} className="text-center">
                  <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
                    {status}
                  </Badge>
                  <p className="text-sm mt-1 capitalize">
                    {system.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{empireStatus.stats.organizations_count}</p>
                <p className="text-sm text-muted-foreground">Organizations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{empireStatus.stats.permission_templates_count}</p>
                <p className="text-sm text-muted-foreground">Permission Templates</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{empireStatus.stats.supported_roles.length}</p>
                <p className="text-sm text-muted-foreground">User Roles</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{empireStatus.stats.supported_tiers.length}</p>
                <p className="text-sm text-muted-foreground">Subscription Tiers</p>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-lg font-semibold text-green-700">
                {empireStatus.message}
              </p>
              <p className="text-sm text-muted-foreground">
                Deployed: {new Date(empireStatus.deployment_time).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Configuration Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Dashboard Configuration System</span>
          </CardTitle>
          <CardDescription>
            Test role-based dashboard configurations for different user types and subscription tiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role and Tier Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">User Role</label>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="select-role"
              >
                {empireStatus?.stats.supported_roles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subscription Tier</label>
              <select 
                value={selectedTier} 
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full p-2 border rounded-md"
                data-testid="select-tier"
              >
                {empireStatus?.stats.supported_tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dashboard Configuration Display */}
          {configLoading && (
            <div className="text-center py-4">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Loading configuration...</p>
            </div>
          )}

          {dashboardConfig?.config && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Dashboard Configuration</h3>
                <Badge variant="outline">{dashboardConfig.empire_status}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Navigation</h4>
                  <div className="space-y-1">
                    {parseJsonSafely(dashboardConfig.config.navigationConfig).main_nav?.map((item: string, index: number) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-600 mb-2">Quick Actions</h4>
                  <div className="space-y-1">
                    {parseJsonSafely(dashboardConfig.config.navigationConfig).quick_actions?.map((action: string, index: number) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">Available Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(parseJsonSafely(dashboardConfig.config.availableFeatures)).map(([feature, value]) => (
                    <div key={feature} className="flex justify-between">
                      <span className="capitalize">{feature.replace(/_/g, " ")}:</span>
                      <span className="font-medium text-green-600">
                        {value === true ? "✓" : value === false ? "✗" : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm text-gray-600 mb-2">UI Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(parseJsonSafely(dashboardConfig.config.uiPermissions)).map(([permission, allowed]) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <span className={allowed ? "text-green-600" : "text-red-600"}>
                        {allowed ? "✓" : "✗"}
                      </span>
                      <span className="capitalize">{permission.replace(/can_|_/g, " ").trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!dashboardConfig?.config && !configLoading && (
            <div className="text-center py-4 text-muted-foreground">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a role and subscription tier to view dashboard configuration</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Processing Setup for All Tiers */}
      {(
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <span>Payment Processing</span>
              {selectedTier === "foundation" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">Free Setup!</Badge>
              )}
              {selectedTier !== "foundation" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedTier === "annual_pro" ? "0% Platform Fee" : "1% Platform Fee"}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {selectedTier === "foundation" 
                ? "As a fan, collect registration fees and donations with our 2% platform fee supporting student education."
                : selectedTier === "annual_pro"
                ? "Premium subscribers enjoy 0% platform fees - keep 100% of payments after Stripe's standard processing fees."
                : "Collect registration fees and donations with reduced 1% platform fee supporting Champions for Change mission."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                How It Works
              </h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Collect tournament registration fees instantly</li>
                <li>• Accept donations for your sports programs</li>
                {selectedTier === "foundation" && (
                  <>
                    <li>• 2% platform fee supports underprivileged student education</li>
                    <li>• You keep 98% of all payments received</li>
                    <li>• Upgrade anytime to reduce platform fees</li>
                  </>
                )}
                {selectedTier === "annual_pro" && (
                  <>
                    <li>• 0% platform fee - keep 100% after Stripe fees</li>
                    <li>• Premium benefit for annual subscribers</li>
                    <li>• Full financial control and reporting</li>
                  </>
                )}
                {selectedTier !== "foundation" && selectedTier !== "annual_pro" && (
                  <>
                    <li>• 1% platform fee supports Champions for Change mission</li>
                    <li>• You keep 99% of all payments received</li>
                    <li>• Upgrade to Annual Pro to eliminate platform fees</li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Ready to start collecting payments?</p>
                <p className="text-xs text-gray-500">Setup takes 2-3 minutes with Stripe</p>
              </div>
              <Button 
                onClick={handleSetupPayments}
                disabled={isSettingUpPayments}
                className="bg-green-600 hover:bg-green-700"
                data-testid="setup-payments-button"
              >
                {isSettingUpPayments ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Setup Payments
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Role Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Five-tier user hierarchy system with granular permissions
            </p>
            <div className="space-y-2">
              {empireStatus?.stats.supported_roles.slice(0, 3).map((role) => (
                <Badge key={role} variant="outline" className="block text-center">
                  {role.replace(/_/g, " ").toUpperCase()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Permission System</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Granular permission templates for precise access control
            </p>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {empireStatus?.stats.permission_templates_count}
              </p>
              <p className="text-sm text-muted-foreground">Active Templates</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-purple-500" />
              <span>Dashboard Configs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Dynamic dashboard layouts based on user role and subscription
            </p>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {empireStatus?.stats.supported_tiers.length}
              </p>
              <p className="text-sm text-muted-foreground">Subscription Tiers</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}