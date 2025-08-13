import React, { useState } from 'react';
import { BusinessPricingSection } from '@/components/pricing/BusinessPricing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  Users, 
  Trophy, 
  Shield, 
  ChevronRight, 
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function BusinessPricingTest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<'pricing' | 'enterprise-join' | 'enterprise-setup'>('pricing');
  const [companyCode, setCompanyCode] = useState('');
  const [setupForm, setSetupForm] = useState({
    companyName: '',
    contactEmail: '',
    estimatedEmployees: '',
    tournamentTypes: []
  });

  // Join company tournament mutation
  const joinCompanyMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('POST', '/api/tournaments/join-company', { code });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Welcome to Your Company Tournament!",
        description: `Successfully joined ${data.companyName || 'the tournament'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Invalid Company Code",
        description: "Please check your tournament director's code and try again.",
        variant: "destructive",
      });
    }
  });

  // Setup enterprise account mutation
  const setupEnterpriseMutation = useMutation({
    mutationFn: async (formData: any) => {
      return await apiRequest('POST', '/api/enterprise/setup', formData);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Enterprise Account Created!",
        description: `Your tournament management system is ready. Registration codes have been sent to ${setupForm.contactEmail}`,
      });
    }
  });

  const handleJoinCompany = () => {
    if (!companyCode.trim()) return;
    joinCompanyMutation.mutate(companyCode);
  };

  const handleEnterpriseSetup = () => {
    setupEnterpriseMutation.mutate(setupForm);
  };

  if (view === 'enterprise-join') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Join Your Company Tournament</CardTitle>
              <CardDescription>
                Enter the tournament code provided by your HR or tournament director
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyCode">Company Tournament Code</Label>
                <Input 
                  id="companyCode"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                  placeholder="e.g., WALMART2024-SALES"
                  className="text-center font-mono text-lg tracking-wider"
                  data-testid="input-company-code"
                />
              </div>
              
              <Button 
                disabled={!companyCode || joinCompanyMutation.isPending}
                onClick={handleJoinCompany}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                data-testid="button-join-company"
              >
                {joinCompanyMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Joining Tournament...
                  </>
                ) : (
                  <>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Join Company Tournament
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={() => setView('pricing')}
                  className="text-sm text-blue-600"
                >
                  Back to Pricing
                </Button>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 text-sm">
                  <strong>Corporate Account Benefits:</strong> Your participation supports Champions for Change educational mission while building team unity.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'enterprise-setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Enterprise Tournament Setup</CardTitle>
              <CardDescription>
                Quick setup for corporate tournament management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName"
                    value={setupForm.companyName}
                    onChange={(e) => setSetupForm({...setupForm, companyName: e.target.value})}
                    placeholder="e.g., Walmart Inc."
                    data-testid="input-company-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactEmail">Primary Contact Email</Label>
                  <Input 
                    id="contactEmail"
                    type="email"
                    value={setupForm.contactEmail}
                    onChange={(e) => setSetupForm({...setupForm, contactEmail: e.target.value})}
                    placeholder="hr@company.com"
                    data-testid="input-contact-email"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedEmployees">Estimated Participants</Label>
                  <Input 
                    id="estimatedEmployees"
                    value={setupForm.estimatedEmployees}
                    onChange={(e) => setSetupForm({...setupForm, estimatedEmployees: e.target.value})}
                    placeholder="e.g., 50-200 employees"
                    data-testid="input-estimated-employees"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tournament Types of Interest</Label>
                <div className="space-y-3">
                  {/* Featured: Sales Competitions */}
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-900">Sales Competitions</span>
                      <Badge className="bg-green-600 text-white text-xs">Popular</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Revenue-based tournaments
                      </div>
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Units sold competitions
                      </div>
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Quarterly brackets
                      </div>
                      <div className="flex items-center gap-1 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Team vs. individual tracking
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {['Team Building', 'Fantasy Sports', 'Gaming Leagues', 'Wellness Challenges', 'Innovation Contests', 'Custom Tournaments'].map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start"
                        data-testid={`button-tournament-${type.toLowerCase().replace(' ', '-')}`}
                      >
                        <CheckCircle className="h-3 w-3 mr-2" />
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Setup Time:</strong> 5-10 minutes • <strong>Employee Onboarding:</strong> 30 seconds with registration codes
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button 
                  onClick={handleEnterpriseSetup}
                  disabled={!setupForm.companyName || !setupForm.contactEmail || setupEnterpriseMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  data-testid="button-setup-enterprise"
                >
                  {setupEnterpriseMutation.isPending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Setting up Enterprise Account...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Setup Enterprise Tournament Management
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setView('pricing')}
                  className="w-full"
                >
                  Back to Pricing Options
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Corporate Tournament Solutions
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Professional tournament management for businesses of all sizes
          </p>

          {/* Quick Access Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              onClick={() => setView('enterprise-join')}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              data-testid="button-join-company-tournament"
            >
              <Users className="mr-2 h-4 w-4" />
              Join Company Tournament
            </Button>
            
            <Button 
              onClick={() => setView('enterprise-setup')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-setup-enterprise-account"
            >
              <Target className="mr-2 h-4 w-4" />
              Setup Enterprise Account
            </Button>
          </div>

          {/* Sales Competition Spotlight */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-green-300 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 p-3 bg-green-100 rounded-full w-fit">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-900">Sales Competition Tournaments</CardTitle>
                <CardDescription className="text-green-700">
                  Turn your sales team into champions with gamified revenue competitions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Revenue Tournaments</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>Monthly revenue brackets</li>
                      <li>Quarterly championships</li>
                      <li>Territory vs. territory</li>
                      <li>Individual & team divisions</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Units Sold Competitions</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>Product-specific contests</li>
                      <li>Volume-based rankings</li>
                      <li>New customer acquisition</li>
                      <li>Cross-selling tournaments</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Advanced Metrics</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>Real-time leaderboards</li>
                      <li>Performance analytics</li>
                      <li>Goal achievement tracking</li>
                      <li>ROI & motivation metrics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Value Proposition Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Users className="h-5 w-5" />
                  For Sales Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Gamified sales competitions increase motivation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Real-time performance tracking & rankings
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Team building through friendly rivalry
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Building2 className="h-5 w-5" />
                  For Sales Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2 text-green-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Boost team performance & revenue targets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Advanced analytics & ROI tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Automated tournament management
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <BusinessPricingSection />
      </div>
    </div>
  );
}