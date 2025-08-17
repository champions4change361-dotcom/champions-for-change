import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function RoleDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">You need to be logged in to access this dashboard.</p>
            <Button onClick={() => window.location.href = '/api/login'} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      'district_athletic_director': { label: 'District Athletic Director', color: 'bg-red-600' },
      'district_head_athletic_trainer': { label: 'District Head Athletic Trainer', color: 'bg-red-500' },
      'school_athletic_director': { label: 'School Athletic Director', color: 'bg-blue-600' },
      'school_athletic_trainer': { label: 'School Athletic Trainer', color: 'bg-blue-500' },
      'school_principal': { label: 'School Principal', color: 'bg-purple-600' },
      'head_coach': { label: 'Head Coach', color: 'bg-green-600' },
      'assistant_coach': { label: 'Assistant Coach', color: 'bg-green-500' },
      'athletic_training_student': { label: 'Athletic Training Student', color: 'bg-cyan-500' },
      'scorekeeper': { label: 'Scorekeeper', color: 'bg-gray-500' },
      'athlete': { label: 'Athlete', color: 'bg-yellow-500' },
      'fan': { label: 'Fan', color: 'bg-gray-400' },
    };
    return roleMap[role] || { label: role, color: 'bg-gray-500' };
  };

  const roleInfo = getRoleDisplay((user as any).role || (user as any).userRole || 'unknown');

  const getDashboardContent = () => {
    const userRole = (user as any).role || (user as any).userRole;
    switch (userRole) {
      case 'district_athletic_director':
      case 'district_head_athletic_trainer':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>District Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/staff-registration')}
                  data-testid="button-bulk-registration"
                >
                  Bulk Staff Registration
                </Button>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/staff-roles')}
                  data-testid="button-role-assignment"
                >
                  Manage Staff Roles
                </Button>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/district-overview')}
                  data-testid="button-district-overview"
                >
                  District Athletics Overview
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'school_athletic_director':
      case 'school_athletic_trainer':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>School Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" data-testid="button-school-teams">
                  Manage School Teams
                </Button>
                <Button className="w-full" data-testid="button-school-health">
                  Health & Safety Monitoring
                </Button>
                <Button className="w-full" data-testid="button-school-events">
                  School Athletics Events
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 'head_coach':
      case 'assistant_coach':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" data-testid="button-team-roster">
                  Manage Team Roster
                </Button>
                <Button className="w-full" data-testid="button-practice-schedule">
                  Practice & Game Schedule
                </Button>
                <Button className="w-full" data-testid="button-tournament-registration">
                  Tournament Registration
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Your role provides limited access. Contact your district administrator for role assignment.</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Athletics Dashboard</h1>
            <p className="text-slate-600">Welcome, {user.firstName} {user.lastName}</p>
          </div>
          <div className="text-right">
            <Badge className={`${roleInfo.color} text-white mb-2`}>
              {roleInfo.label}
            </Badge>
            <div className="text-sm text-slate-600">
              {user.organizationName}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        {getDashboardContent()}
      </div>
    </div>
  );
}