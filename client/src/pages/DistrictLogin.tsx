import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Shield, BarChart3, Trophy, Heart } from "lucide-react";

export default function DistrictLogin() {
  const handleLogin = () => {
    window.location.href = "/api/login?user_type=district";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <GraduationCap className="h-12 w-12 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">District Portal</h1>
              <p className="text-lg text-slate-600">Comprehensive Academic & Athletic Management</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Ready to Serve Texas School Districts
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl text-slate-900">School District Access</CardTitle>
            <CardDescription className="text-lg">
              Complete district-wide management for academic competitions and athletic programs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">50+ UIL Competitions</h4>
                  <p className="text-sm text-slate-600">Academic & Athletic</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Multi-School Coordination</h4>
                  <p className="text-sm text-slate-600">District-wide oversight</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">HIPAA/FERPA Compliant</h4>
                  <p className="text-sm text-slate-600">Automated compliance</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Advanced Analytics</h4>
                  <p className="text-sm text-slate-600">Performance insights</p>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Heart className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-slate-900">Mission-Driven Value</h4>
              </div>
              <p className="text-sm text-slate-700">
                Save $31,010-$65,510 annually while supporting Champions for Change educational opportunities for underprivileged youth
              </p>
              <div className="mt-2 text-xs text-green-700 font-medium">
                ROI: 1,244%-2,629% • Price you pay is the price you always pay
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:drop-shadow-lg district-portal-glow"
              data-testid="button-district-login"
            >
              Access District Portal
            </Button>

            {/* Role Access */}
            <div className="text-center text-sm text-slate-600">
              <p className="mb-2">District portal access includes:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Athletic Directors</Badge>
                <Badge variant="outline">Superintendents</Badge>
                <Badge variant="outline">Academic Coordinators</Badge>
                <Badge variant="outline">Athletic Trainers</Badge>
                <Badge variant="outline">Coaches</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>Champions for Change • Supporting Educational Excellence</p>
        </div>
      </div>
    </div>
  );
}