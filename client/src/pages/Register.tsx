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
import { CheckCircle, AlertCircle, CreditCard, FileText, Users, GraduationCap, Trophy } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useDomain } from '@/hooks/useDomain';

const registrationSchema = z.object({
  requestType: z.enum(['district_admin', 'school_admin', 'coach', 'scorekeeper']),
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
  subscriptionPlan: z.enum(['foundation', 'champion', 'enterprise', 'district_enterprise'])
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'check'>('stripe');
  const [selectedPlan, setSelectedPlan] = useState<string>('foundation');
  const { isSchoolSafe } = useDomain();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      sportsInvolved: [],
      paymentMethod: 'stripe',
      subscriptionPlan: 'foundation'
    }
  });

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
    district_admin: {
      title: 'District Athletic Director',
      description: 'Oversee all athletic programs across multiple schools in your district. Create district-wide tournaments and assign schools to events.',
      requirements: ['District administrative role', 'Athletic program oversight', 'Multi-school coordination experience'],
      recommendedPlan: 'district_enterprise'
    },
    school_admin: {
      title: 'School Athletic Director',
      description: 'Manage athletic programs for your specific school. Assign coaches to tournaments and oversee school participation.',
      requirements: ['School administrative role', 'Athletic program management', 'Coach coordination experience'],
      recommendedPlan: 'enterprise'
    },
    coach: {
      title: 'Coach',
      description: 'Register teams, manage rosters, and participate in tournaments. Work under your school athletic director.',
      requirements: ['Coaching certification or experience', 'Team management experience', 'School affiliation'],
      recommendedPlan: 'champion'
    },
    scorekeeper: {
      title: 'Scorekeeper/Judge',
      description: 'Update scores and results for assigned events. Help ensure accurate tournament management.',
      requirements: ['Event scoring experience', 'Attention to detail', 'Reliability and punctuality'],
      recommendedPlan: 'foundation'
    }
  };

  const subscriptionPlans = {
    foundation: {
      name: 'Foundation',
      price: '$29/month',
      description: 'Perfect for individual coaches and scorekeepers',
      features: ['Basic tournament management', 'Team registration', 'Score tracking', 'Email support']
    },
    champion: {
      name: 'Champion',
      price: '$79/month', 
      description: 'Ideal for schools and small organizations',
      features: ['Everything in Foundation', 'Multiple tournaments', 'Advanced analytics', 'Priority support', 'Custom branding']
    },
    enterprise: {
      name: 'Enterprise',
      price: '$199/month',
      description: 'Best for school districts and large organizations',
      features: ['Everything in Champion', 'Unlimited tournaments', 'Multi-school management', 'API access', 'Dedicated support']
    },
    district_enterprise: {
      name: 'District Enterprise',
      price: '$399/month',
      description: 'Complete solution for entire school districts',
      features: ['Everything in Enterprise', 'District-wide analytics', 'White-label options', 'Custom integrations', 'Training included']
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
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && <div className={`w-12 h-1 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`} />}
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
                  Step 1: Choose Your Role
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
                
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    disabled={!form.watch('requestType')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-6 w-6 mr-2 text-blue-600" />
                  Step 2: Organization & Experience
                </CardTitle>
                <CardDescription>Tell us about yourself and your organization</CardDescription>
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
                  <Input {...form.register('position')} placeholder="e.g., Athletic Director, Head Coach, etc." data-testid="input-position" />
                  {form.formState.errors.position && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.position.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input {...form.register('organizationName')} placeholder="e.g., Robert Driscoll Middle School" data-testid="input-organizationName" />
                    {form.formState.errors.organizationName && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.organizationName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Select onValueChange={(value) => form.setValue('organizationType', value as any)} data-testid="select-organizationType">
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school_district">School District</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="club">Club/Organization</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {form.watch('organizationType') === 'school' && (
                  <div>
                    <Label htmlFor="parentOrganization">School District</Label>
                    <Input {...form.register('parentOrganization')} placeholder="e.g., Corpus Christi ISD" data-testid="input-parentOrganization" />
                  </div>
                )}

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
                  <Button type="button" variant="outline" onClick={() => setStep(1)} data-testid="button-back">
                    Back
                  </Button>
                  <Button type="button" onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-700" data-testid="button-continue">
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
                  <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                  Step 3: Choose Plan & Payment
                </CardTitle>
                <CardDescription>Select your subscription plan and payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Subscription Plan</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {Object.entries(subscriptionPlans).map(([planKey, plan]) => (
                      <div 
                        key={planKey}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPlan === planKey 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPlan(planKey)}
                        data-testid={`plan-${planKey}`}
                      >
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        <p className="text-2xl font-bold text-blue-600 my-2">{plan.price}</p>
                        <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {plan.features.map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
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
                  <Button type="button" variant="outline" onClick={() => setStep(2)} data-testid="button-back-step3">
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