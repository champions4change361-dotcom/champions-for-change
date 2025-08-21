import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, CreditCard, Trophy, Star, Building, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useDomain } from '@/hooks/useDomain';

const businessRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationType: z.enum(['business', 'nonprofit', 'sports_club', 'individual']),
  description: z.string().min(10, 'Please describe your tournament organizing needs (minimum 10 characters)'),
  sportsInvolved: z.array(z.string()).min(1, 'Please select at least one sport'),
  paymentMethod: z.enum(['stripe', 'check']),
  plan: z.string(),
  price: z.string().optional()
});

type BusinessRegistrationForm = z.infer<typeof businessRegistrationSchema>;

export default function BusinessRegister() {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'check'>('stripe');
  const { isSchoolSafe } = useDomain();

  // Get URL parameters to determine plan and pricing
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'tournament-organizer';
  const price = urlParams.get('price') || '39';

  const planDetails = {
    'free': {
      name: 'Free Starter',
      price: 'Free',
      features: ['Up to 5 tournaments per year', 'Basic bracket management', 'Score tracking', 'Community support'],
      description: 'Perfect for testing and small events'
    },
    'tournament-organizer': {
      name: 'Tournament Organizer',
      price: '$39/month',
      features: ['Unlimited tournaments', 'Payment processing', 'Custom donation pages', 'Professional branding', 'White-label experience'],
      description: 'Perfect for individual tournament organizers'
    },
    'business-enterprise': {
      name: 'Business Enterprise',
      price: '$149/month',
      features: ['Unlimited tournaments', 'Advanced analytics', 'Priority support', 'API access', 'Multi-location coordination'],
      description: 'Complete solution for businesses'
    },
    'annual-pro': {
      name: 'Annual Pro',
      price: '$990/month',
      features: ['High-volume capacity', 'Dedicated support', 'Custom features', 'Enhanced reporting'],
      description: 'For tournament management companies'
    }
  };

  const selectedPlanDetails = planDetails[plan as keyof typeof planDetails] || planDetails['tournament-organizer'];

  const form = useForm<BusinessRegistrationForm>({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      sportsInvolved: [],
      paymentMethod: 'stripe',
      plan: plan,
      price: price,
      organizationType: 'business'
    }
  });

  const submitMutation = useMutation({
    mutationFn: (data: BusinessRegistrationForm) => 
      apiRequest('POST', '/api/registration/business', {
        ...data,
        requestType: 'tournament_manager', // Always tournament manager for business users
        subscriptionPlan: plan,
        sportsInvolved: selectedSports
      }),
    onSuccess: () => {
      if (paymentMethod === 'stripe' && plan !== 'free') {
        setStep(3); // Go to Stripe checkout
      } else {
        setStep(2); // Success step
      }
    },
    onError: (error) => {
      console.error('Business registration submission failed:', error);
    }
  });

  const onSubmit = (data: BusinessRegistrationForm) => {
    submitMutation.mutate({
      ...data,
      sportsInvolved: selectedSports,
      paymentMethod
    });
  };

  const sports = [
    'Basketball', 'Soccer', 'Tennis', 'Track & Field', 'Swimming', 'Golf', 
    'Baseball', 'Softball', 'Volleyball', 'Football', 'Cross Country', 
    'Wrestling', 'Cheerleading', 'Other'
  ];

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Registration Complete!</CardTitle>
            <CardDescription>
              Welcome to Champions for Change Tournament Platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                <strong>Your {selectedPlanDetails.name} account is ready!</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check your email for login instructions</li>
                  <li>Access your tournament dashboard</li>
                  <li>Start organizing professional tournaments</li>
                  <li>Support Champions for Change educational mission</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
              <p className="text-green-800">
                🚀 <strong>Get Started:</strong> Create your first tournament<br />
                💡 <strong>Support:</strong> Contact us at champions4change361@gmail.com<br />
                📞 <strong>Phone:</strong> 361-300-1552
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="bg-blue-600 text-white py-6 px-8 rounded-lg mb-6">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Join Champions for Change</h1>
            <p className="text-xl">Professional Tournament Management Platform</p>
            <p className="text-blue-100 mt-2">Supporting educational opportunities for students</p>
          </div>
        </div>

        {/* Plan Summary */}
        <Card className="mb-8 border-2 border-blue-500 bg-blue-50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-6 w-6 text-orange-500" />
              <CardTitle className="text-xl">{selectedPlanDetails.name}</CardTitle>
              <Badge className="bg-orange-100 text-orange-800">{selectedPlanDetails.price}</Badge>
            </div>
            <CardDescription>{selectedPlanDetails.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Plan Features:</h4>
                <ul className="space-y-1">
                  {selectedPlanDetails.features.slice(0, 3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Additional Benefits:</h4>
                <ul className="space-y-1">
                  {selectedPlanDetails.features.slice(3).map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Form */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-6 w-6 mr-2 text-blue-600" />
                Tournament Organizer Registration
              </CardTitle>
              <CardDescription>Tell us about yourself and your tournament organizing needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    {...form.register('firstName')} 
                    placeholder="John"
                    data-testid="input-firstName"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    {...form.register('lastName')} 
                    placeholder="Smith"
                    data-testid="input-lastName"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    {...form.register('email')} 
                    type="email"
                    placeholder="john@example.com"
                    data-testid="input-email"
                  />
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    {...form.register('phone')} 
                    placeholder="(555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
              </div>

              {/* Organization Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input 
                    {...form.register('organizationName')} 
                    placeholder="e.g., ABC Sports, Tournament Pro"
                    data-testid="input-organizationName"
                  />
                  {form.formState.errors.organizationName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.organizationName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <Select onValueChange={(value) => form.setValue('organizationType', value as any)}>
                    <SelectTrigger data-testid="select-organizationType">
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="nonprofit">Nonprofit Organization</SelectItem>
                      <SelectItem value="sports_club">Sports Club</SelectItem>
                      <SelectItem value="individual">Individual Organizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tournament Description */}
              <div>
                <Label htmlFor="description">Tournament Organizing Experience *</Label>
                <Textarea 
                  {...form.register('description')} 
                  placeholder="Tell us about your tournament organizing experience and what types of events you plan to run..."
                  className="min-h-[100px]"
                  data-testid="textarea-description"
                />
                {form.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Sports Selection */}
              <div>
                <Label>Sports You Organize *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {sports.map((sport) => (
                    <label key={sport} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSports.includes(sport)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSports([...selectedSports, sport]);
                          } else {
                            setSelectedSports(selectedSports.filter(s => s !== sport));
                          }
                        }}
                        className="rounded"
                        data-testid={`checkbox-sport-${sport.toLowerCase()}`}
                      />
                      <span className="text-sm">{sport}</span>
                    </label>
                  ))}
                </div>
                {form.formState.errors.sportsInvolved && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.sportsInvolved.message}</p>
                )}
              </div>

              {/* Payment Method */}
              {plan !== 'free' && (
                <div>
                  <Label>Payment Method</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        data-testid="radio-payment-stripe"
                      />
                      <CreditCard className="h-4 w-4" />
                      <span>Credit Card (Stripe)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="check"
                        checked={paymentMethod === 'check'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        data-testid="radio-payment-check"
                      />
                      <span>Check Payment</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending || selectedSports.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  data-testid="button-submit"
                >
                  {submitMutation.isPending ? 'Creating Account...' : (
                    plan === 'free' ? 'Create Free Account' : 
                    paymentMethod === 'stripe' ? `Continue to Payment - ${selectedPlanDetails.price}` : 
                    'Submit Registration'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}