import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Building, Trophy, Users, Shield, Target, UserCheck, Zap, CreditCard, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function SignupSelector() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="text-white hover:bg-white/10"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Platform
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Choose Your Registration Path
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Select the registration type that matches your organization and role. Each path is optimized for different needs and provides the right features for your tournament management.
          </p>
        </div>

        {/* Registration Type Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Tournament Organizer */}
          <Card className="bg-gradient-to-br from-blue-800 to-blue-900 border-blue-500/30 text-white hover:border-blue-400/50 transition-all cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/30 transition-all">
                <Trophy className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-2xl mb-2">Tournament Organizer</CardTitle>
              <CardDescription className="text-blue-200">
                Individual coaches and tournament organizers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-blue-100">
                  <Users className="h-4 w-4 mr-3" />
                  Individual coaches & organizers
                </div>
                <div className="flex items-center text-blue-100">
                  <Trophy className="h-4 w-4 mr-3" />
                  Single school tournaments
                </div>
                <div className="flex items-center text-blue-100">
                  <Zap className="h-4 w-4 mr-3" />
                  AI-powered tournament creation
                </div>
                <div className="flex items-center text-blue-100">
                  <Target className="h-4 w-4 mr-3" />
                  65+ sports supported
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">$10/month</div>
                <div className="text-blue-200 text-sm">or $99/year (save $21)</div>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={() => setLocation("/trial-signup?plan=annual-tournament&billing=monthly&price=10")}
                data-testid="button-select-organizer"
              >
                Select Tournament Organizer
              </Button>
            </CardContent>
          </Card>

          {/* Business Enterprise */}
          <Card className="bg-gradient-to-br from-green-800 to-green-900 border-green-500/30 text-white hover:border-green-400/50 transition-all cursor-pointer group border-2 border-yellow-400">
            <CardHeader className="text-center">
              <Badge className="bg-yellow-400 text-green-800 mb-3 mx-auto">Most Popular</Badge>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-all">
                <Building className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl mb-2">Business Enterprise</CardTitle>
              <CardDescription className="text-green-200">
                Corporate and organizational tournaments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-green-100">
                  <Building className="h-4 w-4 mr-3" />
                  Corporate team building events
                </div>
                <div className="flex items-center text-green-100">
                  <Users className="h-4 w-4 mr-3" />
                  Multi-organization tournaments
                </div>
                <div className="flex items-center text-green-100">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Flexible billing options
                </div>
                <div className="flex items-center text-green-100">
                  <Zap className="h-4 w-4 mr-3" />
                  Advanced AI features
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">$45/month</div>
                <div className="text-green-200 text-sm">or $468/year (save $72)</div>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => setLocation("/trial-signup?plan=multi-tournament&billing=monthly&price=45")}
                data-testid="button-select-business"
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>

          {/* District Enterprise */}
          <Card className="bg-gradient-to-br from-purple-800 to-purple-900 border-purple-500/30 text-white hover:border-purple-400/50 transition-all cursor-pointer group">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-all">
                <GraduationCap className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-2xl mb-2">District Enterprise</CardTitle>
              <CardDescription className="text-purple-200">
                Complete district-wide management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-purple-100">
                  <UserCheck className="h-4 w-4 mr-3" />
                  District Athletic Directors
                </div>
                <div className="flex items-center text-purple-100">
                  <Users className="h-4 w-4 mr-3" />
                  Multi-school coordination
                </div>
                <div className="flex items-center text-purple-100">
                  <Shield className="h-4 w-4 mr-3" />
                  HIPAA/FERPA compliance
                </div>
                <div className="flex items-center text-purple-100">
                  <Target className="h-4 w-4 mr-3" />
                  50+ UIL competitions
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">$4,500/year</div>
                <div className="text-purple-200 text-sm">Save $26,000+ vs alternatives</div>
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                onClick={() => setLocation("/login/district")}
                data-testid="button-select-district"
              >
                Select District Enterprise
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Not sure which option is right for you?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Contact our team for personalized recommendations based on your organization's needs and tournament requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 hover:text-white"
                onClick={() => setLocation("/contact")}
                data-testid="button-contact-sales"
              >
                Contact Sales Team
              </Button>
              <Button 
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-700 hover:text-white"
                onClick={() => setLocation("/pricing")}
                data-testid="button-view-all-pricing"
              >
                View All Pricing Options
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}