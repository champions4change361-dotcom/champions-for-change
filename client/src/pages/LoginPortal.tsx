import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Trophy, Building2, ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "wouter";

export default function LoginPortal() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-slate-900">Choose Your Portal</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Select the login portal that matches your role to access the features designed for your needs
          </p>
        </div>

        {/* Login Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* District Portal */}
          <Card className="border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <GraduationCap className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-blue-900">School Districts</CardTitle>
              <CardDescription className="text-lg">
                Comprehensive academic & athletic management for entire districts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">50+ UIL Academic Competitions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Multi-School Coordination</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">HIPAA/FERPA Compliance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Advanced Health Analytics</span>
                </div>
              </div>

              {/* Value Badge */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Save $31K-$65K Annually
                  </Badge>
                  <p className="text-xs text-green-700 mt-1">ROI: 1,244%-2,629%</p>
                </div>
              </div>

              <Link href="/login/district">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6" data-testid="button-district-portal">
                  Enter District Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="text-center text-xs text-slate-500">
                Perfect for: Athletic Directors, Superintendents, Academic Coordinators
              </div>
            </CardContent>
          </Card>

          {/* Tournament Organizer Portal */}
          <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-purple-100 rounded-full">
                  <Trophy className="h-12 w-12 text-purple-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-purple-900">Tournament Organizers</CardTitle>
              <CardDescription className="text-lg">
                Professional tournament management combining Jersey Watch + Challonge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Season-Long Player Tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Advanced Tournament Brackets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Professional Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Sponsor Reports</span>
                </div>
              </div>

              {/* Pricing Badge */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Starting at $39/month
                  </Badge>
                  <p className="text-xs text-purple-700 mt-1">Better than competitors combined</p>
                </div>
              </div>

              <Link href="/login/organizer">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6" data-testid="button-organizer-portal">
                  Enter Tournament Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="text-center text-xs text-slate-500">
                Perfect for: Youth Leagues, Event Coordinators, Sports Complexes
              </div>
            </CardContent>
          </Card>

          {/* Business Portal */}
          <Card className="border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-slate-100 rounded-full">
                  <Building2 className="h-12 w-12 text-slate-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-slate-900">Business Enterprise</CardTitle>
              <CardDescription className="text-lg">
                Enterprise-grade tournament solutions with flexible billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Full Enterprise Features</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Multi-User Team Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Priority Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Custom Integration Options</span>
                </div>
              </div>

              {/* Pricing Badge */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="text-center">
                  <Badge variant="secondary" className="bg-slate-100 text-slate-800">
                    Flexible Pricing
                  </Badge>
                  <p className="text-xs text-slate-700 mt-1">Monthly or annual options</p>
                </div>
              </div>

              <Link href="/login/business">
                <Button className="w-full bg-slate-600 hover:bg-slate-700 text-lg py-6" data-testid="button-business-portal">
                  Enter Business Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <div className="text-center text-xs text-slate-500">
                Perfect for: Corporations, Multi-Site Operations, Seasonal Organizers
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="border border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <h3 className="font-semibold text-blue-900">Need Help Logging In?</h3>
                <p className="text-blue-700 text-sm">Your account uses secure OAuth authentication through Replit</p>
              </div>
              <Link href="/login-support">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" data-testid="button-login-help">
                  Get Help
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-slate-600">
            Not sure which portal is right for you? 
            <span className="text-blue-600 font-medium"> Contact our team for guidance.</span>
          </p>
          <p className="text-sm text-slate-500">
            Secure authentication • HIPAA/FERPA compliant • Supporting Champions for Change
          </p>
        </div>
      </div>
    </div>
  );
}