import React, { useState, useEffect } from 'react';
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
import { CheckCircle, AlertCircle, CreditCard, FileText, Users, GraduationCap, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useDomain } from '@/hooks/useDomain';

const registrationSchema = z.object({
  requestType: z.enum(['district_admin', 'school_admin', 'coach', 'scorekeeper', 'tournament_manager']),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  position: z.string().min(2, 'Position/title is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationType: z.enum(['school_district', 'school', 'club', 'nonprofit']),
  parentOrganization: z.string().optional(),
  yearsExperience: z.number().min(0).max(50).optional(),
  sportsInvolved: z.array(z.string()).min(1, 'Please select at least one sport'),
  certifications: z.string().optional(),
  requestReason: z.string().min(10, 'Please explain why you need access (minimum 10 characters)'),
  paymentMethod: z.enum(['stripe', 'check']),
  subscriptionPlan: z.enum(['freemium', 'credits', 'tournament-organizer', 'monthly', 'annual', 'champions', 'enterprise'])
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  // Check URL parameters immediately to determine initial state
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan');
  const type = urlParams.get('type');
  const price = urlParams.get('price');
  
  // Determine if this is a business user flow
  const isBusinessUser = type === 'business';
  
  const [step, setStep] = useState(isBusinessUser ? 3 : 1); // Start at step 3 for business users
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'check'>('stripe');
  const [selectedPlan, setSelectedPlan] = useState<string>(
    isBusinessUser && plan === 'tournament-organizer' ? 'tournament-organizer' :
    isBusinessUser && plan === 'business-enterprise' ? 'enterprise' :
    isBusinessUser && plan === 'annual-pro' ? 'annual' :
    isBusinessUser && plan === 'free' ? 'freemium' : 'freemium'
  );
  const [organizationType, setOrganizationType] = useState<string>(isBusinessUser ? 'business' : '');
  const [shouldShowRoleSelection, setShouldShowRoleSelection] = useState(!isBusinessUser);
  const { isSchoolSafe, isProDomain } = useDomain();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      sportsInvolved: [],
      paymentMethod: 'stripe',
      subscriptionPlan: selectedPlan as any,
      requestType: 'tournament_manager', // Default to tournament manager role
      organizationType: isBusinessUser ? 'club' : undefined // Map business to club in schema
    }
  });

  console.log('Registration URL params:', { plan, type, price });
  console.log('Business user detected:', isBusinessUser);

  // Determine if user should see role selection based on organization type and domain
  const checkRoleSelectionNeeded = (orgType: string, plan: string) => {
    // Private schools and private charter schools should see role selection
    const needsRoleSelection = orgType === 'private_school' || orgType === 'charter_school';
    
    // For freemium and business enterprise users, skip role selection and assign tournament manager
    const isFreemiumOrBusiness = plan === 'freemium' || orgType === 'business' || isProDomain();
    
    if (isFreemiumOrBusiness && !needsRoleSelection) {
      // Automatically assign tournament manager role for freemium and business users
      form.setValue('requestType', 'tournament_manager');
      setShouldShowRoleSelection(false);
    } else if (needsRoleSelection) {
      setShouldShowRoleSelection(true);
    } else {
      // Default behavior for other organization types
      setShouldShowRoleSelection(false);
      form.setValue('requestType', 'tournament_manager');
    }
  };

  // Handle organization type changes
  const handleOrganizationTypeChange = (orgType: string) => {
    setOrganizationType(orgType);
    form.setValue('organizationType', orgType as any);
    checkRoleSelectionNeeded(orgType, selectedPlan);
  };

  // Handle plan changes
  const handlePlanChange = (plan: string) => {
    setSelectedPlan(plan);
    form.setValue('subscriptionPlan', plan as any);
    checkRoleSelectionNeeded(organizationType, plan);
  };

  const submitMutation = useMutation({
    mutationFn: (data: RegistrationForm) => 
      apiRequest('POST', '/api/registration/request', data),
    onSuccess: () => {
      if (paymentMethod === 'stripe') {
        setStep(5); // Go to Stripe checkout
      } else {
        setStep(4); // Success step for check payment
      }
    },
    onError: (error) => {
      console.error('Registration submission failed:', error);
    }
  });

  const onSubmit = (data: RegistrationForm) => {
    submitMutation.mutate({
      ...data,
      sportsInvolved: selectedSports,
      paymentMethod,
      subscriptionPlan: selectedPlan as any
    });
  };

  const roleDescriptions = {
    tournament_manager: {
      title: 'Tournament Manager',
      description: 'Organize and manage tournaments for your organization. Perfect for freemium and business users who run tournaments.',
      requirements: ['Tournament organizing experience', 'Event management skills', 'Team coordination'],
      recommendedPlan: 'freemium'
    },
    district_admin: {
      title: 'District Athletic Director',
      description: 'Oversee all athletic programs across multiple schools in your district. Create district-wide tournaments and assign schools to events.',
      requirements: ['District administrative role', 'Athletic program oversight', 'Multi-school coordination experience'],
      recommendedPlan: 'enterprise'
    },
    school_admin: {
      title: 'School Athletic Director',
      description: 'Manage athletic programs for your specific school. Assign coaches to tournaments and oversee school participation.',
      requirements: ['School administrative role', 'Athletic program management', 'Coach coordination experience'],
      recommendedPlan: 'champions'
    },
    coach: {
      title: 'Coach',
      description: 'Register teams, manage rosters, and participate in tournaments. Work under your school athletic director.',
      requirements: ['Coaching certification or experience', 'Team management experience', 'School affiliation'],
      recommendedPlan: 'annual'
    },
    scorekeeper: {
      title: 'Scorekeeper/Judge',
      description: 'Update scores and results for assigned events. Help ensure accurate tournament management.',
      requirements: ['Event scoring experience', 'Attention to detail', 'Reliability and punctuality'],
      recommendedPlan: 'monthly'
    }
  };

  const subscriptionPlans = {
    freemium: {
      name: 'Freemium',
      price: 'Free',
      description: 'Perfect for casual users and small business tournaments',
      features: ['Up to 3 tournaments per year', 'Basic bracket management', 'Score tracking', 'Community support'],
      note: 'After 3 tournaments, purchase tournament credits or upgrade'
    },
    credits: {
      name: 'Tournament Credits',
      price: '$15/tournament',
      description: 'Pay-per-tournament for occasional organizers',
      features: ['Full tournament features per credit', 'No monthly commitment', 'Advanced bracket management', 'Email support'],
      note: 'Perfect for seasonal organizers'
    },
    'tournament-organizer': {
      name: 'Tournament Organizer',
      price: '$39/month',
      description: 'Perfect for individual tournament organizers who want professional features',
      features: ['Unlimited tournament events', 'Team & athlete registration', 'Payment processing & fee collection', 'Custom donation page setup', 'Professional branding & logos', 'White-label tournament experience'],
      note: 'Annual option: $399/year (save 2 months)'
    },
    monthly: {
      name: 'Monthly Pro',
      price: '$99/month',
      description: 'Regular tournament organizers and coaches',
      features: ['Unlimited tournaments', 'Advanced analytics', 'Team management', 'Priority support', 'Custom branding']
    },
    annual: {
      name: 'Annual Pro',
      price: '$990/year',
      description: 'Best value for active tournament organizers',
      features: ['Everything in Monthly Pro', 'Save $198 per year', 'Enhanced analytics', 'API access', 'Priority phone support'],
      savings: 'Save $198 compared to monthly billing'
    },
    champions: {
      name: 'Champions District',
      price: '$2,490/year',
      description: 'Complete solution for school districts',
      features: ['Everything in Annual Pro', 'Multi-school management', 'District-wide analytics', 'FERPA compliance', 'Dedicated account manager']
    },
    enterprise: {
      name: 'Enterprise District',
      price: '$3,990/year',
      description: 'Enterprise solution for large school districts',
      features: ['Everything in Champions', 'White-label platform', 'Custom integrations', 'Training included', 'SLA guarantee', 'Custom development']
    }
  };

  const sports = [
    'Basketball', 'Soccer', 'Tennis', 'Track & Field', 'Swimming', 'Golf', 
    'Baseball', 'Softball', 'Volleyball', 'Football', 'Cross Country', 
    'Wrestling', 'Cheerleading', 'Other'
  ];

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Registration Submitted!</CardTitle>
            <CardDescription>
              Your registration request has been submitted successfully. Payment by check instructions below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Payment by Check Process:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Your account is now in "Pending Payment" status</li>
                  <li>Mail your check to Champions for Change (address below)</li>
                  <li>We'll activate your account within 1 business day of receiving payment</li>
                  <li>You'll receive login instructions via email</li>
                </ol>
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Mail Payment To:</h4>
              <div className="text-blue-800">
                <p className="font-medium">Champions for Change</p>
                <p>Daniel Thornton, Executive Director</p>
                <p>Robert Driscoll Middle School</p>
                <p>Corpus Christi, TX 78411</p>
                <p className="mt-2">
                  <strong>Amount Due:</strong> {subscriptionPlans[selectedPlan as keyof typeof subscriptionPlans]?.price}
                </p>
                <p className="text-sm">
                  Make check payable to "Champions for Change"<br />
                  Include your email address in memo line
                </p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Contact Information</h4>
              <p className="text-green-800">
                Questions? Contact Champions for Change:<br />
                📧 <a href="mailto:champions4change361@gmail.com" className="underline">champions4change361@gmail.com</a><br />
                📞 <a href="tel:3613001552" className="underline">361-300-1552</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('Register component render - Current step:', step);
  console.log('Register component render - shouldShowRoleSelection:', shouldShowRoleSelection);
  console.log('Register component render - organizationType:', organizationType);
  console.log('Register component render - selectedPlan:', selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
      <div className="max-w-4xl mx-auto p-6">
        {isSchoolSafe() && (
          <div className="mb-8 text-center">
            <div className="bg-blue-600 text-white py-6 px-8 rounded-lg mb-6">
              <Trophy className="h-12 w-12 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Champions for Change</h1>
              <p className="text-xl">Funding Educational Opportunities for Corpus Christi Students</p>
              <p className="text-blue-100 mt-2">Join our mission to fund $2,600+ student educational trips</p>
            </div>
          </div>
        )}

        {/* Step Progress */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 4 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-600" />
                  Step 1: Organization Type
                </CardTitle>
                <CardDescription>Tell us about your organization to customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Select onValueChange={handleOrganizationTypeChange} value={organizationType}>
                      <SelectTrigger data-testid="select-organizationType">
                        <SelectValue placeholder="Select your organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private_school">Private School</SelectItem>
                        <SelectItem value="charter_school">Charter School</SelectItem>
                        <SelectItem value="business">Business Enterprise</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit Organization</SelectItem>
                        <SelectItem value="club">Sports Club</SelectItem>
                        <SelectItem value="school_district">School District</SelectItem>
                        <SelectItem value="school">Public School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input 
                      {...form.register('organizationName')} 
                      placeholder="e.g., ABC Private School, Sports Club"
                      data-testid="input-organizationName"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(shouldShowRoleSelection ? 2 : 3)}
                    disabled={!organizationType}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && shouldShowRoleSelection && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 mr-2 text-blue-600" />
                  Step 2: Choose Your Role
                </CardTitle>
                <CardDescription>Select the role that best describes your position and responsibilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(roleDescriptions).map(([role, info]) => (
                    <div 
                      key={role}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        form.watch('requestType') === role 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        form.setValue('requestType', role as any);
                        setSelectedPlan(info.recommendedPlan);
                      }}
                    >
                      <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{info.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-700">Requirements:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {info.requirements.map((req, idx) => (
                            <li key={idx}>• {req}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Recommended: {subscriptionPlans[info.recommendedPlan as keyof typeof subscriptionPlans]?.name}
                      </div>
                    </div>
                  ))}
                </div>
                
                {form.formState.errors.requestType && (
                  <p className="text-red-500 text-sm">{form.formState.errors.requestType.message}</p>
                )}
                
                <div className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => setStep(3)}
                    disabled={!form.watch('requestType')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
                  Step 3: Personal Information
                </CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input {...form.register('firstName')} data-testid="input-firstName" />
                    {form.formState.errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input {...form.register('lastName')} data-testid="input-lastName" />
                    {form.formState.errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input type="email" {...form.register('email')} data-testid="input-email" />
                    {form.formState.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input {...form.register('phone')} data-testid="input-phone" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="position">Position/Title *</Label>
                  <Input 
                    {...form.register('position')} 
                    placeholder="e.g., Athletic Director, Coach, Tournament Organizer"
                    data-testid="input-position"
                  />
                  {form.formState.errors.position && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.position.message}</p>
                  )}
                </div>

                <div>
                  <Label>Sports Involved *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {sports.map((sport) => (
                      <label key={sport} className="flex items-center space-x-2">
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
                          data-testid={`checkbox-sport-${sport}`}
                        />
                        <span className="text-sm">{sport}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSports.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">Please select at least one sport</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="requestReason">Why do you need access? *</Label>
                  <Textarea 
                    {...form.register('requestReason')} 
                    placeholder="Explain how you plan to use the tournament platform and how it will benefit your students/organization..."
                    rows={4}
                    data-testid="textarea-requestReason"
                  />
                  {form.formState.errors.requestReason && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.requestReason.message}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(shouldShowRoleSelection ? 2 : 1)} data-testid="button-back">
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-700" data-testid="button-continue">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                  Step 4: Choose Plan & Payment
                </CardTitle>
                <CardDescription>Select your subscription plan and payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Subscription Plan</Label>
                  
                  {/* Casual/Business Plans */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Casual & Business Users</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(subscriptionPlans).filter(([key]) => 
                        ['freemium', 'credits', 'monthly', 'annual'].includes(key)
                      ).map(([planKey, plan]) => (
                        <div 
                          key={planKey}
                          className={`p-4 border rounded-lg cursor-pointer transition-all relative ${
                            selectedPlan === planKey 
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${planKey === 'annual' ? 'border-green-400 border-2' : ''}`}
                          onClick={() => handlePlanChange(planKey)}
                          data-testid={`plan-${planKey}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            {planKey === 'annual' && <Badge className="bg-green-500 text-white">Best Value</Badge>}
                            {planKey === 'freemium' && <Badge className="bg-blue-500 text-white">Free</Badge>}
                          </div>
                          <p className="text-2xl font-bold text-green-600 my-2">{plan.price}</p>
                          <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                          {(plan as any).savings && (
                            <p className="text-green-600 text-xs font-semibold mb-2">{(plan as any).savings}</p>
                          )}
                          {(plan as any).note && (
                            <p className="text-gray-500 text-xs italic mb-2">{(plan as any).note}</p>
                          )}
                          <ul className="text-xs text-gray-600 space-y-1">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* District Plans */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">School Districts</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(subscriptionPlans).filter(([key]) => 
                        ['champions', 'enterprise'].includes(key)
                      ).map(([planKey, plan]) => (
                        <div 
                          key={planKey}
                          className={`p-6 border rounded-lg cursor-pointer transition-all relative ${
                            selectedPlan === planKey 
                              ? `${planKey === 'champions' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'}` 
                              : 'border-gray-200 hover:border-gray-300'
                          } ${planKey === 'champions' ? 'border-blue-400 border-2' : 'border-purple-400 border-2'}`}
                          onClick={() => handlePlanChange(planKey)}
                          data-testid={`plan-${planKey}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-xl">{plan.name}</h3>
                            {planKey === 'champions' && <Badge className="bg-blue-500 text-white">Popular</Badge>}
                            {planKey === 'enterprise' && <Badge className="bg-purple-500 text-white">Premium</Badge>}
                          </div>
                          <p className={`text-3xl font-bold my-3 ${planKey === 'champions' ? 'text-blue-600' : 'text-purple-600'}`}>
                            {plan.price}
                          </p>
                          <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                          <ul className="text-sm text-gray-700 space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${planKey === 'champions' ? 'text-blue-500' : 'text-purple-500'}`} />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'stripe' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('stripe')}
                      data-testid="payment-stripe"
                    >
                      <CreditCard className="h-6 w-6 text-blue-600 mb-2" />
                      <h3 className="font-semibold">Credit/Debit Card</h3>
                      <p className="text-sm text-gray-600">Secure online payment via Stripe</p>
                      <p className="text-xs text-green-600 mt-2">✓ Instant activation</p>
                    </div>

                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'check' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setPaymentMethod('check')}
                      data-testid="payment-check"
                    >
                      <FileText className="h-6 w-6 text-blue-600 mb-2" />
                      <h3 className="font-semibold">Check Payment</h3>
                      <p className="text-sm text-gray-600">Mail check to Champions for Change</p>
                      <p className="text-xs text-orange-600 mt-2">⏳ Activation after payment received</p>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'check' && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Check Payment Process:</strong> After submitting this form, your account will be created in "Pending Payment" status. You'll receive instructions for mailing your check payment. Account activation occurs within 1 business day of receiving payment.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} data-testid="button-back-step4">
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? 'Submitting...' : (
                      paymentMethod === 'stripe' ? 'Continue to Payment' : 'Submit Registration'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}