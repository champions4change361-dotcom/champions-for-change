import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Shield, 
  Clock, 
  Check, 
  Trophy, 
  AlertCircle,
  ArrowLeft,
  Play,
  Eye,
  Zap,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';
import TrialExperienceFlow from '@/components/TrialExperienceFlow';

interface PlanDetails {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
}

export default function TrialSignup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showTrialFlow, setShowTrialFlow] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organizationName: ''
  });

  // Get plan details from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const planType = urlParams.get('plan') || 'donation-based';
  const planPrice = urlParams.get('price') || '50';

  const planDetails: Record<string, PlanDetails> = {
    'donation-based': {
      name: 'Tournament Management Platform',
      price: '$50',
      period: 'month suggested donation',
      description: 'Fund student education while getting professional tournament management',
      features: [
        '💚 All donations fund student educational opportunities',
        '🏆 Unlimited professional tournaments',
        '🎨 Complete white-label branding & custom domains',
        '⚡ AI-powered tournament creation and optimization', 
        '👥 Unlimited teams and players',
        '📊 All tournament formats (Single/Double/Round Robin/Swiss)',
        '💳 Integrated payment processing via Stripe',
        '📱 Mobile-responsive tournament management',
        '🔒 Enterprise-grade security and data backup',
        '💯 100% tax-deductible charitable donation',
        '🤝 Pay what feels right for your organization',
        '📈 Help subsidize smaller community groups'
      ]
    }
  };

  const selectedPlan = planDetails[planType] || planDetails['donation-based'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Integrate with Stripe to set up donation subscription
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Welcome to Champions for Change!",
        description: "Your educational support has begun. Thank you for helping students achieve their dreams!",
      });

      // Redirect to dashboard or onboarding
      navigate('/tournament-design');
    } catch (error) {
      toast({
        title: "Error Setting Up Donation",
        description: "There was a problem processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show trial experience flow if requested
  if (showTrialFlow) {
    return (
      <TrialExperienceFlow
        selectedPlan={planType}
        onComplete={() => setShowTrialFlow(false)}
        onStartTrial={() => {
          setShowTrialFlow(false);
          // Scroll to the trial form
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Tournament Arena</h1>
                  <p className="text-xs text-blue-600">Fund Student Education</p>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/pricing" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pricing
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Plan Summary */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Fund Student Education • Get Tournament Tools</h1>
              <p className="text-lg text-gray-600">
                Join Champions for Change • Pay what feels right • 100% tax-deductible donations
              </p>
            </div>

            {/* Donation Impact & Trial Benefits */}
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  💚 Champions for Change Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Every donation funds student educational opportunities
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    100% tax-deductible charitable contributions
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Full enterprise features for everyone - no tiers
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Pay what feels right for your organization
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Help subsidize smaller community groups
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Explore Features Option */}
            <Card className="mb-8 border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    Want to see what makes us different?
                  </h3>
                  <p className="text-purple-700 mb-4">
                    Explore our competitive advantages vs Challonge, Jersey Watch, and other platforms
                  </p>
                  <Button
                    onClick={() => setShowTrialFlow(true)}
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                    size="lg"
                    data-testid="button-explore-features"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Explore Features First
                  </Button>
                  <p className="text-xs text-purple-600 mt-2">
                    Interactive demo • No signup required • 3-minute tour
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Plan */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedPlan.name}</span>
                  <Badge className="bg-blue-100 text-blue-800">Selected Plan</Badge>
                </CardTitle>
                <CardDescription>{selectedPlan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-gray-900">{selectedPlan.price}</span>
                    <span className="text-lg text-gray-600">{selectedPlan.period}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Suggested donation</div>
                    <div className="text-sm font-medium text-green-700">Pay what feels right</div>
                  </div>
                </div>
                
                <ul className="space-y-2">
                  {selectedPlan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Signup Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  💚 Fund Students, Get Tournament Tools
                </CardTitle>
                <CardDescription>
                  Suggested $50/month donation • Pay what feels right • 100% tax-deductible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Account Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          data-testid="input-first-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        data-testid="input-email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        name="organizationName"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        placeholder="e.g., Spring Valley Basketball League"
                        required
                        data-testid="input-organization"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Donation Impact */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      🎓 <h3 className="font-semibold text-green-800 ml-2">Your Impact:</h3>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Every donation funds student travel and educational opportunities</li>
                      <li>• Help underprivileged youth access competition experiences</li>
                      <li>• Support Champions for Change educational mission</li>
                      <li>• Your organization gets full enterprise tournament tools</li>
                    </ul>
                  </div>

                  {/* Donation Terms */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-2">Donation Terms:</p>
                        <ul className="space-y-1 text-blue-800">
                          <li>• Your educational support starts immediately</li>
                          <li>• Pay what feels right for your organization</li>
                          <li>• Cancel anytime with 30-day notice</li>
                          <li>• Full platform access from day one</li>
                          <li>• Every dollar funds student educational opportunities</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                    disabled={isLoading}
                    data-testid="button-start-trial"
                  >
                    {isLoading ? (
                      "Setting Up Your Student Support..."
                    ) : (
                      "💚 Start Supporting Students Today"
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By joining Champions for Change, you agree to support our educational mission. 
                    Your suggested $50/month donation can be adjusted to what feels right for your organization.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}