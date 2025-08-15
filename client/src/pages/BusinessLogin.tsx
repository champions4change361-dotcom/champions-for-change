import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Briefcase, Users, Zap, Calendar, Star } from "lucide-react";

export default function BusinessLogin() {
  const handleLogin = () => {
    window.location.href = "/api/login?user_type=business";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Building2 className="h-12 w-12 text-slate-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Business Enterprise</h1>
              <p className="text-lg text-slate-600">Professional Tournament Solutions</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Enterprise-Grade Tournament Management
          </Badge>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-slate-200 shadow-xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-2xl text-slate-900">Business & Enterprise Access</CardTitle>
            <CardDescription className="text-lg">
              Full-featured tournament management with flexible billing and enterprise support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Enterprise Features</h4>
                  <p className="text-sm text-slate-600">Full platform access</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Team Management</h4>
                  <p className="text-sm text-slate-600">Multi-user coordination</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Advanced Analytics</h4>
                  <p className="text-sm text-slate-600">Business intelligence</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-slate-900">Flexible Scheduling</h4>
                  <p className="text-sm text-slate-600">Complex tournaments</p>
                </div>
              </div>
            </div>

            {/* Business Value */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-5 w-5 text-slate-600" />
                <h4 className="font-semibold text-slate-900">Enterprise Benefits</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-700">• Dedicated account management</span>
                  <span className="text-slate-700">• Priority support</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">• Custom integrations available</span>
                  <span className="text-slate-700">• Volume discounts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-700">• White-label options</span>
                  <span className="text-slate-700">• API access</span>
                </div>
              </div>
            </div>

            {/* Flexible Pricing */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-center">
                <h4 className="font-semibold text-slate-900 mb-3">Flexible Business Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="font-medium text-slate-700">Monthly Flexibility</p>
                    <p className="text-2xl font-bold text-green-600">$149</p>
                    <p className="text-xs text-slate-600">Cancel anytime</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-700">Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600">$1,499</p>
                    <p className="text-xs text-green-700">Save $289 (2 months free)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              className="w-full bg-slate-600 hover:bg-slate-700 text-lg py-6"
              data-testid="button-business-login"
            >
              Access Business Portal
            </Button>

            {/* Use Cases */}
            <div className="text-center text-sm text-slate-600">
              <p className="mb-2">Ideal for:</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">Sports Organizations</Badge>
                <Badge variant="outline">Event Companies</Badge>
                <Badge variant="outline">Corporate Teams</Badge>
                <Badge variant="outline">Multi-Site Operations</Badge>
                <Badge variant="outline">Seasonal Organizers</Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200">
              <p>Need custom enterprise solutions? Contact our business team for volume pricing and white-label options.</p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>Enterprise Tournament Management • Flexible Solutions for Business</p>
        </div>
      </div>
    </div>
  );
}