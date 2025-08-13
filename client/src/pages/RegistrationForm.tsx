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
import { CheckCircle, AlertCircle, CreditCard, FileText, Anchor, Trophy } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useDomain } from '@/hooks/useDomain';
// Removed fantasy promotions - district registration is educational only

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
  references: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    relationship: z.string()
  })).optional(),
  requestReason: z.string().min(10, 'Please explain why you need access (minimum 10 characters)'),
  selectedTier: z.enum(['foundation', 'champion', 'enterprise']),
  paymentMethod: z.enum(['stripe', 'check'])
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistrationFormPage() {
  const [step, setStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [references, setReferences] = useState([{ name: '', email: '', phone: '', relationship: '' }]);
  const [selectedTier, setSelectedTier] = useState<string>('foundation');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'check'>('stripe');
  const { toast } = useToast();
  const { isSchoolDomain } = useDomain();

  // Get tier from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier');
    if (tier && ['foundation', 'champion', 'enterprise'].includes(tier)) {
      setSelectedTier(tier);
    }
  }, []);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      sportsInvolved: [],
      references: [],
      selectedTier: selectedTier as any,
      paymentMethod: 'stripe'
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      return apiRequest('POST', '/api/registration/request', {
        ...data,
        sportsInvolved: selectedSports,
        references: references.filter(ref => ref.name && ref.email)
      });
    },
    onSuccess: async (data) => {
      if (paymentMethod === 'stripe' && selectedTier !== 'foundation') {
        // For now, show success - Stripe integration can be added later
        setStep(5);
        toast({
          title: "Registration Submitted",
          description: "We'll contact you about payment options for your selected tier.",
        });
      } else {
        setStep(5); // Success step
        toast({
          title: "Registration Submitted",
          description: "Your registration has been submitted successfully!",
        });
      }
    },
    onError: (error) => {
      console.error('Registration submission failed:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: RegistrationForm) => {
    submitMutation.mutate({
      ...data,
      selectedTier: selectedTier as any,
      paymentMethod,
      sportsInvolved: selectedSports,
      references: references.filter(ref => ref.name && ref.email)
    });
  };

  // Define which roles can register districts vs must join existing districts
  const districtRegistrationRoles = ['district_admin', 'school_admin'];
  const joinOnlyRoles = ['coach', 'scorekeeper'];

  const roleDescriptions = {
    district_admin: {
      title: 'District Athletic Director',
      description: 'CREATE DISTRICTS - Oversee all athletic programs across multiple schools in your district.',
      requirements: ['District administrative authority', 'Multi-school management oversight', 'Budget and policy control'],
      canRegisterDistrict: true,
      badge: 'District Creator'
    },
    school_admin: {
      title: 'School Athletic Coordinator', 
      description: 'JOIN DISTRICTS - Manage athletic programs for your specific school within an existing district.',
      requirements: ['School administrative role', 'Reports to District Athletic Director', 'Single-school focus'],
      canRegisterDistrict: true,
      badge: 'District Member',
      note: 'District size affects autonomy: Small districts = more independence, Large districts = less autonomy'
    },
    coach: {
      title: 'Coach',
      description: 'JOIN SCHOOLS - Register teams, manage rosters, and participate in tournaments under a School Athletic Coordinator.',
      requirements: ['Coaching certification', 'Reports to School Athletic Coordinator', 'Team-level focus'],
      canRegisterDistrict: false,
      badge: 'Team Level',
      redirectMessage: 'Coaches must be invited by their School Athletic Coordinator'
    },
    scorekeeper: {
      title: 'Scorekeeper/Judge',
      description: 'EVENT ASSIGNMENT - Update scores and results for specific events assigned by Tournament Managers.',
      requirements: ['Event scoring experience', 'Assigned by Tournament Manager', 'Event-specific access'],
      canRegisterDistrict: false,
      badge: 'Event Level', 
      redirectMessage: 'Scorekeepers are assigned by Tournament Managers to specific events'
    }
  };

  const sports = [
    'Basketball', 'Soccer', 'Tennis', 'Track & Field', 'Swimming', 'Golf', 
    'Baseball', 'Softball', 'Volleyball', 'Football', 'Cross Country', 
    'Wrestling', 'Cheerleading', 'Other'
  ];

  const tierPricing = {
    foundation: { name: 'Foundation', price: 'Free', features: ['Up to 5 tournaments', 'Basic features', 'Community support'] },
    champion: { name: 'Champion', price: '$99/month', features: ['Unlimited tournaments', 'Advanced analytics', 'Multi-school management', 'Priority support'] },
    enterprise: { name: 'District Enterprise', price: '$399/month', features: ['White-label solution', 'Custom domain', 'Dedicated support', 'District-wide management', 'Advanced reporting'] }
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <Card className="max-w-2xl mx-auto" data-testid="registration-success">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Registration Submitted!</CardTitle>
            <CardDescription>
              {paymentMethod === 'check' 
                ? 'Your registration is pending payment confirmation.'
                : 'Your registration has been submitted successfully.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>What happens next:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>We'll review your request within 2-3 business days</li>
                  {paymentMethod === 'check' && (
                    <li>Mail your check to: Champions for Change, Corpus Christi, TX</li>
                  )}
                  <li>You'll receive approval confirmation via email</li>
                  <li>Access to your tournament dashboard will be activated</li>
                </ol>
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Contact Information</h4>
              <p className="text-blue-800">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Join Champions for Change</h1>
          <p className="text-gray-600">Help fund $2,600+ educational trips for Corpus Christi students</p>
        </div>

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
            <Card data-testid="step-role-selection">
              <CardHeader>
                <CardTitle>Step 1: Choose Your Role</CardTitle>
                <CardDescription>Select your position and responsibilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(roleDescriptions).map(([role, info]) => {
                    const isDisabled = !info.canRegisterDistrict;
                    return (
                      <div 
                        key={role}
                        className={`p-4 border rounded-lg transition-all relative ${
                          isDisabled 
                            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                            : form.watch('requestType') === role 
                              ? 'border-blue-500 bg-blue-50 cursor-pointer' 
                              : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!isDisabled) {
                            form.setValue('requestType', role as any);
                          }
                        }}
                        data-testid={`role-${role}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{info.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            info.canRegisterDistrict 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {info.badge}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{info.description}</p>
                        <ul className="text-xs text-gray-600 space-y-1 mb-2">
                          {info.requirements.map((req, idx) => (
                            <li key={idx}>• {req}</li>
                          ))}
                        </ul>
                        {info.note && (
                          <p className="text-xs text-blue-600 italic mt-2">{info.note}</p>
                        )}
                        {isDisabled && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                            <p className="text-xs text-yellow-700 font-medium">
                              {info.redirectMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Role Hierarchy Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">User Role Hierarchy</h4>
                  <div className="text-sm text-blue-800">
                    <p className="mb-2"><strong>District Registration Authority:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>District Athletic Director:</strong> Creates and manages entire districts</li>
                      <li>• <strong>School Athletic Coordinator:</strong> Joins existing districts, manages their school</li>
                    </ul>
                    <p className="mt-3 mb-2"><strong>Must Be Invited/Assigned:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Coaches:</strong> Invited by School Athletic Coordinators</li>
                      <li>• <strong>Scorekeepers:</strong> Assigned by Tournament Managers to specific events</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    disabled={!form.watch('requestType') || !roleDescriptions[form.watch('requestType') as keyof typeof roleDescriptions]?.canRegisterDistrict}
                    data-testid="button-continue-step1"
                  >
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card data-testid="step-personal-info">
              <CardHeader>
                <CardTitle>Step 2: Personal & Organization Information</CardTitle>
                <CardDescription>Tell us about yourself and your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName"
                      {...form.register('firstName')} 
                      data-testid="input-firstName"
                    />
                    {form.formState.errors.firstName && (
                      <span className="text-red-500 text-sm">{form.formState.errors.firstName.message}</span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName"
                      {...form.register('lastName')} 
                      data-testid="input-lastName"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email"
                      type="email" 
                      {...form.register('email')} 
                      data-testid="input-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone"
                      {...form.register('phone')} 
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="position">Position/Title *</Label>
                  <Input 
                    id="position"
                    {...form.register('position')} 
                    placeholder="e.g., Athletic Director, Head Coach, Physical Education Teacher"
                    data-testid="input-position"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input 
                      id="organizationName"
                      {...form.register('organizationName')} 
                      placeholder="e.g., Corpus Christi ISD, Robert Driscoll Middle School"
                      data-testid="input-organizationName"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Select onValueChange={(value) => form.setValue('organizationType', value as any)}>
                      <SelectTrigger data-testid="select-organizationType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school_district">School District</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                        <SelectItem value="club">Sports Club</SelectItem>
                        <SelectItem value="nonprofit">Nonprofit Organization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button type="button" onClick={() => setStep(3)} data-testid="button-continue-step2">Continue</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card data-testid="step-experience-sports">
              <CardHeader>
                <CardTitle>Step 3: Experience & Sports</CardTitle>
                <CardDescription>Help us understand your background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Years of Experience</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="50"
                    {...form.register('yearsExperience', { valueAsNumber: true })} 
                    data-testid="input-yearsExperience"
                  />
                </div>

                <div>
                  <Label>Sports Involved (Select all that apply) *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
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
                          data-testid={`checkbox-sport-${sport}`}
                        />
                        <span className="text-sm">{sport}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Certifications</Label>
                  <Textarea 
                    {...form.register('certifications')} 
                    placeholder="List any relevant coaching certifications, first aid, etc."
                    data-testid="textarea-certifications"
                  />
                </div>

                <div>
                  <Label>Why do you need access? *</Label>
                  <Textarea 
                    {...form.register('requestReason')} 
                    placeholder="Explain how you'll use the platform to benefit your students..."
                    rows={4}
                    data-testid="textarea-requestReason"
                  />
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button type="button" onClick={() => setStep(4)} data-testid="button-continue-step3">Continue</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card data-testid="step-plan-payment">
              <CardHeader>
                <CardTitle>Step 4: Plan & Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Selection */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Choose Your Plan</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(tierPricing).map(([tier, info]) => (
                      <div 
                        key={tier}
                        className={`p-4 border rounded-lg cursor-pointer ${
                          selectedTier === tier ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedTier(tier)}
                        data-testid={`plan-${tier}`}
                      >
                        <h3 className="font-semibold">{info.name}</h3>
                        <p className="text-lg font-bold">{info.price}</p>
                        <ul className="text-xs mt-2 space-y-1">
                          {info.features.map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                {selectedTier !== 'foundation' && (
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">Payment Method</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${
                          paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('stripe')}
                        data-testid="payment-stripe"
                      >
                        <CreditCard className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">Credit Card</h3>
                          <p className="text-sm text-gray-600">Instant activation</p>
                        </div>
                      </div>
                      
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer flex items-center gap-3 ${
                          paymentMethod === 'check' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('check')}
                        data-testid="payment-check"
                      >
                        <FileText className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">Check Payment</h3>
                          <p className="text-sm text-gray-600">Manual processing</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button 
                    type="submit" 
                    disabled={submitMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit-registration"
                  >
                    {submitMutation.isPending ? 'Processing...' : 
                     paymentMethod === 'stripe' && selectedTier !== 'foundation' ? 'Continue to Payment' : 
                     'Submit Registration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
        
        {/* Educational Mission Focus - District Registration Only */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              Champions for Change Educational Mission
            </h3>
            <p className="text-green-700">
              Every tournament helps fund $2,600+ student educational trips
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Trophy className="h-5 w-5" />
                  Educational Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700 mb-4">
                  100% of platform revenue funds educational opportunities for underprivileged youth in Corpus Christi, Texas
                </p>
                <div className="text-xs text-green-600">
                  <p>✓ Educational tour companies</p>
                  <p>✓ Student travel experiences</p>
                  <p>✓ Learning opportunities</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="h-5 w-5" />
                  Coach-Built Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 mb-4">
                  Built by coaches who understand real tournament management needs
                </p>
                <div className="text-xs text-blue-600">
                  <p>✓ 21 years coaching experience</p>
                  <p>✓ Robert Driscoll Middle School</p>
                  <p>✓ Corpus Christi, Texas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}