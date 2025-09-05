import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Trophy, Users, Building, GraduationCap, ArrowLeft, ArrowRight, Home, Mail, Globe } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useDomain } from '@/hooks/useDomain';
import { useToast } from '@/hooks/use-toast';
import TrantorCoin from '@/components/TrantorCoin';
import EmailSignupForm from '@/components/EmailSignupForm';
import { Link } from 'wouter';

// Smart signup schema that adapts based on organization type
const baseSignupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationType: z.enum(['individual', 'business', 'school', 'nonprofit', 'participant']),
  description: z.string().optional(),
  sportsInvolved: z.array(z.string()).min(1, 'Please select at least one sport'),
  paymentMethod: z.enum(['stripe', 'check']).optional(),
});

type SmartSignupForm = z.infer<typeof baseSignupSchema>;

interface OrgType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  recommendedPlan?: string;
  requiresPayment?: boolean;
}

export default function SmartSignup() {
  const [step, setStep] = useState(1);
  const [selectedOrgType, setSelectedOrgType] = useState<string>('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'check'>('stripe');
  const [signupMethod, setSignupMethod] = useState<'google' | 'email'>('google');
  const { isSchoolSafe } = useDomain();
  const { toast } = useToast();

  // Get URL parameters for pre-selection
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('type');
  const fromCoin = urlParams.get('fromCoin');
  const redirectUrl = urlParams.get('redirect');

  useEffect(() => {
    if (preselectedType) {
      setSelectedOrgType(preselectedType);
      // Don't skip to step 2, let user see organization selection first
    }
  }, [preselectedType]);

  const orgTypes: OrgType[] = [
    {
      id: 'participant',
      name: 'Team/Participant',
      description: 'Teams, coaches, or participants registering for tournaments',
      icon: <Trophy className="h-8 w-8" />,
      examples: ['Basketball teams', 'Track & field athletes', 'Swimming teams', 'School teams'],
      recommendedPlan: 'participant',
      requiresPayment: false
    },
    {
      id: 'individual',
      name: 'Tournament Organizer',
      description: 'Individual coaches, parents, or community organizers running tournaments',
      icon: <Users className="h-8 w-8" />,
      examples: ['Youth coaches', 'Parent volunteers', 'Community leaders', 'Individual organizers'],
      recommendedPlan: 'tournament-organizer',
      requiresPayment: true
    },
    {
      id: 'business',
      name: 'Business Enterprise',
      description: 'Companies, sports facilities, or tournament management businesses',
      icon: <Building className="h-8 w-8" />,
      examples: ['Sports facilities', 'Tournament companies', 'Event management', 'Corporate teams'],
      recommendedPlan: 'business-enterprise',
      requiresPayment: true
    },
    {
      id: 'school',
      name: 'School or District',
      description: 'Educational institutions organizing academic and athletic competitions',
      icon: <GraduationCap className="h-8 w-8" />,
      examples: ['Public schools', 'Private schools', 'School districts', 'Charter schools'],
      recommendedPlan: 'district-enterprise',
      requiresPayment: true
    },
    {
      id: 'nonprofit',
      name: 'Nonprofit Organization',
      description: 'Churches, community groups, and charitable organizations',
      icon: <Trophy className="h-8 w-8" />,
      examples: ['Churches', 'Boys & Girls Clubs', 'Community centers', 'Youth organizations'],
      recommendedPlan: 'free-starter',
      requiresPayment: false
    }
  ];

  const sports = [
    'Basketball', 'Soccer', 'Tennis', 'Track & Field', 'Swimming', 'Golf', 
    'Baseball', 'Softball', 'Volleyball', 'Football', 'Cross Country', 
    'Wrestling', 'Cheerleading', 'Other'
  ];

  const form = useForm<SmartSignupForm>({
    resolver: zodResolver(baseSignupSchema),
    defaultValues: {
      sportsInvolved: [],
      organizationType: 'individual'
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: SmartSignupForm) => {
      const selectedOrg = orgTypes.find(org => org.id === selectedOrgType);
      const payload = {
        ...data,
        sportsInvolved: selectedSports,
        recommendedPlan: selectedOrg?.recommendedPlan,
        organizationType: selectedOrgType,
        paymentMethod: selectedOrg?.requiresPayment ? paymentMethod : undefined
      };
      
      console.log('Making API request to /api/registration/smart-signup with payload:', payload);
      
      try {
        const response = await apiRequest('POST', '/api/registration/smart-signup', payload);
        console.log('API request successful:', response);
        return response;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (response) => {
      console.log('Signup successful!', response);
      const selectedOrg = orgTypes.find(org => org.id === selectedOrgType);
      
      // Handle special redirect for Champions participants
      if (selectedOrgType === 'participant' && redirectUrl === 'champions-registration') {
        console.log('Participant signup for Champions - redirecting to Champions registration');
        window.location.href = '/champions-registration';
        return;
      }
      
      if (!selectedOrg?.requiresPayment) {
        console.log('Free plan - redirecting to tournaments page');
        // Free plan - redirect to tournament creation dashboard
        window.location.href = '/tournaments';
      } else if (paymentMethod === 'stripe') {
        console.log('Paid plan with Stripe - going to payment step');
        setStep(4); // Go to payment step
      } else {
        console.log('Paid plan with check - going to success step');
        setStep(3); // Go to success step
      }
    },
    onError: (error) => {
      console.error('Smart signup failed:', error);
      // Show user-friendly error
      alert('There was an error creating your account. Please try again or contact support.');
    }
  });

  const onSubmit = (data: SmartSignupForm) => {
    // Since the button is only enabled when sports are selected, we can skip validation
    if (selectedSports.length === 0) {
      return;
    }

    console.log('Submitting form with data:', {
      ...data,
      sportsInvolved: selectedSports,
      organizationType: selectedOrgType
    });

    submitMutation.mutate({
      ...data,
      sportsInvolved: selectedSports,
      organizationType: selectedOrgType as any
    });
  };

  // Step 2: Signup Method Selection (Google or Email)
  if (step === 2) {
    const selectedOrg = orgTypes.find(org => org.id === selectedOrgType);
    
    if (signupMethod === 'email') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
          <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
              <Link href="/">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </div>
            
            <EmailSignupForm
              preselectedType={selectedOrgType}
              onSuccess={(data) => {
                toast({
                  title: "Account Created!",
                  description: "Welcome to Champions for Change!",
                });
                setStep(3); // Go to success step
              }}
              onBackToOptions={() => setSignupMethod('google')}
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Choose Your Signup Method</CardTitle>
              <CardDescription className="text-center">
                How would you like to create your {selectedOrg?.name} account?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Google Signup Option */}
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Continue with Google</h3>
                    <p className="text-gray-600 mb-4">
                      Quick and secure signup using your Google account. No additional passwords to remember.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 mb-4">
                      <li>✓ Instant account creation</li>
                      <li>✓ Single sign-on convenience</li>
                      <li>✓ Google security protection</li>
                    </ul>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        toast({
                          title: "Starting Google Signup!",
                          description: selectedOrg?.requiresPayment 
                            ? "Sign up with Google, then set up payment to access all features."
                            : "Sign up with Google to start creating tournaments for free!",
                        });
                        setTimeout(() => {
                          window.location.href = '/api/login';
                        }, 1000);
                      }}
                      data-testid="button-google-signup"
                    >
                      Sign Up with Google
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email Signup Option */}
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">Sign Up with Email</h3>
                    <p className="text-gray-600 mb-4">
                      Create an account using your email address and a secure password.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1 mb-4">
                      <li>✓ Direct email control</li>
                      <li>✓ Custom password security</li>
                      <li>✓ Email verification included</li>
                    </ul>
                    <Button 
                      variant="outline" 
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => setSignupMethod('email')}
                      data-testid="button-email-signup"
                    >
                      Sign Up with Email
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  data-testid="button-back-to-org-selection"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Organization Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Success page
  if (step === 3) {
    const selectedOrg = orgTypes.find(org => org.id === selectedOrgType);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
        <div className="max-w-2xl mx-auto p-6">
          {/* Navigation Bar */}
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800" data-testid="back-to-home-success">
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>
          
          <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Welcome to Champions for Change!</CardTitle>
            <CardDescription>
              Your {selectedOrg?.name} account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Trophy className="h-4 w-4" />
              <AlertDescription>
                <strong>Account created successfully!</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Check your email for login instructions</li>
                  <li>Access your tournament dashboard</li>
                  <li>Start organizing professional tournaments</li>
                  <li>Build your tournament platform</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="p-4 rounded-lg bg-green-50">
              <h4 className="font-semibold mb-2 text-green-900">Ready to Get Started?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <Button 
                  onClick={() => window.location.href = '/tournaments'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Create Your First Tournament
                </Button>
                <Button 
                  onClick={() => window.location.href = '/website-builder'}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Build Your Website
                </Button>
              </div>
              <p className="text-green-800 text-sm text-center">
                💡 <strong>Need help?</strong> Contact us at champions4change361@gmail.com or 361-300-1552
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Navigation Bar */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-blue-600 hover:text-blue-800" data-testid="back-to-home">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
        
        {/* Header with optional coin flip */}
        <div className="mb-8 text-center">
          {fromCoin && (
            <div className="mb-6">
              <TrantorCoin size="lg" variant="tournament" />
            </div>
          )}
          <div className="bg-blue-600 text-white py-6 px-8 rounded-lg mb-6">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Join Champions for Change</h1>
            <p className="text-xl">Professional Tournament Management Platform</p>
            <p className="text-blue-100 mt-2">Supporting educational opportunities for students</p>
          </div>
        </div>

        {/* Step 1: Organization Type Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-6 w-6 mr-2 text-blue-600" />
                What type of organization are you?
              </CardTitle>
              <CardDescription>Choose the option that best describes your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orgTypes.map((orgType) => (
                  <div
                    key={orgType.id}
                    onClick={() => {
                      setSelectedOrgType(orgType.id);
                      setStep(2);
                    }}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg ${
                      selectedOrgType === orgType.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    data-testid={`org-type-${orgType.id}`}
                  >
                    <div className="text-center">
                      <div className="text-blue-600 mb-4 flex justify-center">
                        {orgType.icon}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{orgType.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{orgType.description}</p>
                      <div className="text-xs text-gray-500">
                        Examples: {orgType.examples.slice(0, 2).join(', ')}
                      </div>
                      {!orgType.requiresPayment && (
                        <div className="mt-3">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                            Free Plan Available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Old Step 2: Registration Form (now unused - replaced by signup method selection) */}
        {step === 99 && (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-6 w-6 mr-2 text-blue-600" />
                    Complete Your Registration
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                </CardTitle>
                <CardDescription>
                  {(() => {
                    const selectedOrg = orgTypes.find(org => org.id === selectedOrgType);
                    if (selectedOrg?.requiresPayment === false) {
                      return `${selectedOrg.name} Registration - Free Plan`;
                    }
                    return `${selectedOrg?.name} Registration`;
                  })()}
                </CardDescription>
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
                <div>
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input 
                    {...form.register('organizationName')} 
                    placeholder={`e.g., ${orgTypes.find(org => org.id === selectedOrgType)?.examples[0]}`}
                    data-testid="input-organizationName"
                  />
                  {form.formState.errors.organizationName && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.organizationName.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Tell us about your tournament organizing experience</Label>
                  <Textarea 
                    {...form.register('description')} 
                    placeholder="Tell us about your tournament organizing experience and what types of events you plan to run..."
                    className="min-h-[100px]"
                    data-testid="textarea-description"
                  />
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
                            const newSports = e.target.checked 
                              ? [...selectedSports, sport]
                              : selectedSports.filter(s => s !== sport);
                            
                            setSelectedSports(newSports);
                            // Update the form field so validation passes
                            form.setValue('sportsInvolved', newSports);
                          }}
                          className="rounded"
                          data-testid={`checkbox-sport-${sport.toLowerCase()}`}
                        />
                        <span className="text-sm">{sport}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSports.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">Please select at least one sport</p>
                  )}
                  {selectedSports.length > 0 && (
                    <p className="text-green-600 text-sm mt-1">✓ {selectedSports.length} sport{selectedSports.length > 1 ? 's' : ''} selected</p>
                  )}
                </div>

                {/* Payment Method (only for paid plans) */}
                {orgTypes.find(org => org.id === selectedOrgType)?.requiresPayment && (
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
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 px-8 flex items-center"
                    data-testid="button-submit"
                    onClick={() => {
                      console.log('Redirecting to Google signup for:', selectedOrgType);
                      const selectedOrg = orgTypes.find(org => org.id === selectedOrgType);
                      
                      // Show appropriate message
                      toast({
                        title: "Starting Signup!",
                        description: selectedOrg?.requiresPayment 
                          ? "Sign up with Google, then set up payment to access all features."
                          : "Sign up with Google to start creating tournaments for free!",
                      });
                      
                      // Redirect to Google OAuth
                      setTimeout(() => {
                        window.location.href = '/api/login';
                      }, 1000);
                    }}
                  >
                    <>
                      Sign Up with Google
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
}