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
  Eye
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
    organizationName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingZip: ''
  });

  // Get plan details from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const planType = urlParams.get('plan') || 'monthly';
  const planPrice = urlParams.get('price') || '39';

  const planDetails: Record<string, PlanDetails> = {
    // Team Management Plans
    starter: {
      name: 'Starter Team',
      price: '$23',
      period: 'month',
      description: 'Everything Jersey Watch offers + professional tournament hosting',
      features: [
        'Up to 20 players',
        '1 professional tournament per year included',
        'Additional tournaments: $25 each (vs $50+ elsewhere)',
        'Module-based website builder (Jersey Watch alternative)',
        '400 communications/month',
        'Smart seeding algorithm (not random brackets)'
      ]
    },
    growing: {
      name: 'Growing Team',
      price: '$39',
      period: 'month', 
      description: 'Complete team platform + professional tournament business tools',
      features: [
        'Up to 35 players',
        '5 professional tournaments per year included',
        'Additional tournaments: $25 each (50% less than competitors)',
        'Advanced module builder + tournament formats',
        '4,000 communications/month',
        'Pool Play, Double Elimination, Round Robin (vs basic brackets)'
      ]
    },
    elite: {
      name: 'Elite Program',
      price: '$63',
      period: 'month',
      description: 'Enterprise-grade team management + unlimited tournament hosting',
      features: [
        'Unlimited players & teams',
        '10 professional tournaments per year included',
        'Additional tournaments: $25 each (enterprise pricing for everyone)',
        'Premium module builder + all tournament formats',
        '16,000 communications/month',
        'Swiss System, Leaderboards, Multi-division management'
      ]
    },
    // Tournament Organizer Plans
    annual: {
      name: 'Annual Tournament Organizer',
      price: '$99',
      period: 'year',
      description: 'Enterprise tournament tools at 1/10th the cost of competitors',
      features: [
        'One professional tournament (vs basic Challonge brackets)',
        'Smart skill-based seeding algorithm (not random placement)',
        'Multiple formats: Single/Double/Pool/Round Robin/Swiss',
        'Module-based website builder (easy start)',
        'Automatic bye handling + tiebreaker systems',
        'Professional registration + payment processing'
      ]
    },
    monthly: {
      name: 'Multi-Tournament Organizer',
      price: '$39',
      period: 'month',
      description: 'Complete tournament business platform with growth path',
      features: [
        'Unlimited professional tournaments',
        'All tournament formats + smart seeding (enterprise-grade)',
        'CHOICE: Module-based OR White-label building',
        'Custom domains + complete branding control',
        'Skills-based progression: Start simple → Go advanced',
        'Everything enterprise companies get (no feature restrictions)'
      ]
    }
  };

  const selectedPlan = planDetails[planType] || planDetails.monthly;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Integrate with Stripe to create customer and payment method without charging
      // For now, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Trial Started Successfully!",
        description: "Your 14-day free trial has begun. You won't be charged until the trial ends.",
      });

      // Redirect to dashboard or onboarding
      navigate('/tournament-design');
    } catch (error) {
      toast({
        title: "Error Starting Trial",
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
                  <p className="text-xs text-blue-600">Start Your Free Trial</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Start Your 14-Day Free Trial</h1>
              <p className="text-lg text-gray-600">
                Full platform access • No credit card charged until trial ends
              </p>
            </div>

            {/* Trial Benefits */}
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Shield className="h-5 w-5 mr-2" />
                  14-Day Trial Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Full platform access with no limitations
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Professional tournament features vs basic brackets
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Smart seeding algorithm + multiple tournament formats
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Integrated payment processing
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Module-based or white-label website building
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
                    <div className="text-sm text-gray-500">After trial</div>
                    <div className="text-sm font-medium text-gray-700">Cancel anytime</div>
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
                  <CreditCard className="h-5 w-5 mr-2" />
                  Start Your Free Trial
                </CardTitle>
                <CardDescription>
                  We'll collect your payment info but won't charge you until your trial ends
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

                  {/* Payment Information */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Payment Information</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Shield className="h-4 w-4 mr-1" />
                        Secure & Encrypted
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        required
                        data-testid="input-card-number"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                          data-testid="input-expiry"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                          data-testid="input-cvv"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="billingZip">Billing ZIP Code</Label>
                      <Input
                        id="billingZip"
                        name="billingZip"
                        value={formData.billingZip}
                        onChange={handleInputChange}
                        placeholder="12345"
                        required
                        data-testid="input-billing-zip"
                      />
                    </div>
                  </div>

                  {/* Trial Terms */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-2">Trial Terms:</p>
                        <ul className="space-y-1 text-blue-800">
                          <li>• Your 14-day free trial starts immediately</li>
                          <li>• No charge until {new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString()}</li>
                          <li>• Cancel anytime during trial with no charge</li>
                          <li>• Full platform access during trial period</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    disabled={isLoading}
                    data-testid="button-start-trial"
                  >
                    {isLoading ? (
                      "Starting Your Trial..."
                    ) : (
                      "Start My 14-Day Free Trial"
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By starting your trial, you agree to our Terms of Service and Privacy Policy. 
                    You can cancel anytime during your trial period.
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