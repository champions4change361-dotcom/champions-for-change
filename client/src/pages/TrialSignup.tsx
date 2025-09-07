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
  ArrowLeft
} from 'lucide-react';
import { Link } from 'wouter';

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
    annual: {
      name: 'Annual Tournament',
      price: '$99',
      period: '/year',
      description: 'Perfect for organizations running one tournament annually',
      features: [
        'One tournament per year',
        'Year-round website hosting',
        'Full platform access',
        'Payment processing',
        'Professional branding',
        'White-label experience'
      ]
    },
    monthly: {
      name: 'Multi-Tournament',
      price: '$39',
      period: '/month',
      description: 'Perfect for active tournament organizers',
      features: [
        'Unlimited tournaments',
        'Full platform access',
        'Advanced analytics',
        'Payment processing',
        'Professional branding',
        'White-label experience'
      ]
    },
    enterprise: {
      name: 'Business Enterprise',
      price: '$149',
      period: '/month',
      description: 'Complete enterprise features for businesses',
      features: [
        'Unlimited tournaments',
        'Enterprise AI assistance',
        'Advanced analytics',
        'White-label branding',
        'Priority support',
        'API access'
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
            
            <Link href="/pricing" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pricing
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Plan Summary */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Start Your Free Trial</h1>
              <p className="text-lg text-gray-600">
                Get full access to Tournament Arena for 14 days. No charge until your trial ends.
              </p>
            </div>

            {/* Trial Benefits */}
            <Card className="mb-8 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <Shield className="h-5 w-5 mr-2" />
                  Your 14-Day Free Trial Includes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Full platform access - no restrictions
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Create and manage tournaments
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Build custom tournament websites
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Payment processing and registration
                  </li>
                  <li className="flex items-center text-green-700">
                    <Check className="h-4 w-4 mr-3 text-green-600" />
                    Professional branding and white-label
                  </li>
                </ul>
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