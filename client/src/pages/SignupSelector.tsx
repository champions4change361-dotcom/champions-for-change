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
            Fund Student Education, Get Tournament Management
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our donation-based platform funds educational opportunities for underprivileged students while providing you with professional tournament management tools. Choose your path below.
          </p>
        </div>

        {/* Registration Type Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
          {/* Tournament Management - Donation Based */}
          <Card className="bg-gradient-to-br from-green-800 to-green-900 border-green-500/30 text-white hover:border-green-400/50 transition-all cursor-pointer group border-2 border-yellow-400">
            <CardHeader className="text-center">
              <Badge className="bg-yellow-400 text-green-800 mb-3 mx-auto">💚 Supports Students</Badge>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/30 transition-all">
                <Trophy className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="text-2xl mb-2">Tournament Management</CardTitle>
              <CardDescription className="text-green-200">
                Full-featured tournament platform for everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-green-100">
                  <Trophy className="h-4 w-4 mr-3" />
                  All tournament features
                </div>
                <div className="flex items-center text-green-100">
                  <Users className="h-4 w-4 mr-3" />
                  Unlimited tournaments
                </div>
                <div className="flex items-center text-green-100">
                  <Zap className="h-4 w-4 mr-3" />
                  AI-powered creation
                </div>
                <div className="flex items-center text-green-100">
                  <Building className="h-4 w-4 mr-3" />
                  White-label branding
                </div>
                <div className="flex items-center text-green-100">
                  <GraduationCap className="h-4 w-4 mr-3" />
                  Funds student education
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white mb-2">$50/month</div>
                <div className="text-green-200 text-sm">suggested donation • pay what feels right</div>
                <div className="text-xs text-green-300 mt-2">100% tax-deductible charitable donation</div>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => setLocation("/trial-signup?plan=donation-based&billing=monthly&price=50")}
                data-testid="button-select-organizer"
              >
                Start 14-Day Free Trial
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
            <h3 className="text-2xl font-bold text-white mb-4">Questions about our donation-based model?</h3>
            <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
              Learn more about how your donations fund student educational opportunities, or get help determining the right donation amount for your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
                onClick={() => setLocation("/contact")}
                data-testid="button-contact-us"
              >
                Contact Us
              </Button>
              <Button 
                className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500"
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