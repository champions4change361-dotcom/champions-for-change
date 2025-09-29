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
import { CheckCircle, AlertTriangle, CreditCard, Heart, Building, Users, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import OrganizationTypeSelection, { OrganizationType } from '@/components/OrganizationTypeSelection';

const baseRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  organizationType: z.nativeEnum(OrganizationType),
  organizationName: z.string().min(2, 'Organization name is required'),
  description: z.string().optional(),
  sportsInvolved: z.array(z.string()).min(1, 'Please select at least one sport'),
});

// Extended schemas for different organization types
const fantasyRegistrationSchema = baseRegistrationSchema.extend({
  donationAmount: z.number().min(0).optional(),
  supportMessage: z.string().optional(),
});

const youthOrgRegistrationSchema = baseRegistrationSchema.extend({
  billingCycle: z.enum(['monthly', 'annual']),
  organizationVerification: z.string().min(10, 'Please provide verification details'),
  contactTitle: z.string().min(2, 'Contact title is required'),
});

const privateSchoolRegistrationSchema = baseRegistrationSchema.extend({
  schoolType: z.enum(['private', 'charter']),
  enrollmentSize: z.string(),
  organizationVerification: z.string().min(10, 'Please provide verification details'),
  contactTitle: z.string().min(2, 'Contact title is required'),
});

type RegistrationFormData = z.infer<typeof baseRegistrationSchema> & {
  billingCycle?: 'monthly' | 'annual';
  donationAmount?: number;
  supportMessage?: string;
  organizationVerification?: string;
  contactTitle?: string;
  schoolType?: 'private' | 'charter';
  enrollmentSize?: string;
};

export default function OrganizationRegister() {
  const [step, setStep] = useState(1);
  const [selectedOrgType, setSelectedOrgType] = useState<OrganizationType>();
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { toast } = useToast();

  // Dynamic schema selection based on organization type
  const getSchema = () => {
    switch (selectedOrgType) {
      case OrganizationType.FANTASY_SPORTS:
        return fantasyRegistrationSchema;
      case OrganizationType.YOUTH_ORGANIZATION:
        return youthOrgRegistrationSchema;
      case OrganizationType.PRIVATE_SCHOOL:
        return privateSchoolRegistrationSchema;
      default:
        return baseRegistrationSchema;
    }
  };

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      sportsInvolved: [],
      billingCycle: 'monthly',
      donationAmount: 0,
    }
  });

  // Update form validation when organization type changes
  useEffect(() => {
    if (selectedOrgType) {
      form.setValue('organizationType', selectedOrgType);
      // Reset organization-specific fields when switching types
      form.setValue('billingCycle', 'monthly');
      form.setValue('donationAmount', 0);
      form.setValue('organizationVerification', '');
      form.setValue('contactTitle', '');
      form.setValue('schoolType', 'private');
    }
  }, [selectedOrgType, form]);

  const submitMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      // Choose the appropriate API endpoint based on organization type
      const endpoint = selectedOrgType === OrganizationType.FANTASY_SPORTS 
        ? '/api/registration/fantasy'
        : '/api/registration/organization';
        
      return apiRequest('POST', endpoint, {
        ...data,
        sportsInvolved: selectedSports,
        pricingTier: getPricingTier(),
        subscriptionPlan: getSubscriptionPlan()
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful!",
        description: "Your registration has been submitted successfully.",
      });
      
      if (selectedOrgType === OrganizationType.FANTASY_SPORTS) {
        if (form.getValues('donationAmount') && form.getValues('donationAmount')! > 0) {
          setStep(4); // Go to donation payment
        } else {
          setStep(5); // Go to success
        }
      } else {
        setStep(4); // Go to subscription payment
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

  const getPricingTier = (): string => {
    switch (selectedOrgType) {
      case OrganizationType.FANTASY_SPORTS:
        return 'fantasy_sports_free';
      case OrganizationType.YOUTH_ORGANIZATION:
        return billingCycle === 'monthly' ? 'youth_organization_monthly' : 'youth_organization_annual';
      case OrganizationType.PRIVATE_SCHOOL:
        return 'private_school_annual';
      default:
        return 'fantasy_sports_free';
    }
  };

  const getSubscriptionPlan = (): string => {
    return getPricingTier(); // They're the same in this case
  };

  const onSubmit = (data: RegistrationFormData) => {
    if (selectedSports.length === 0) {
      toast({
        title: "Sports Selection Required",
        description: "Please select at least one sport you're involved with.",
        variant: "destructive"
      });
      return;
    }
    
    submitMutation.mutate(data);
  };

  const sports = [
    'Basketball', 'Soccer', 'Tennis', 'Track & Field', 'Swimming', 'Golf', 
    'Baseball', 'Softball', 'Volleyball', 'Football', 'Cross Country', 
    'Wrestling', 'Cheerleading', 'Lacrosse', 'Field Hockey', 'Other'
  ];

  // Step 1: Organization Type Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4">
          <OrganizationTypeSelection
            onTypeSelect={setSelectedOrgType}
            selectedType={selectedOrgType}
          />
          
          {selectedOrgType && (
            <div className="flex justify-center mt-8">
              <Button 
                onClick={() => setStep(2)}
                size="lg"
                className="px-8"
                data-testid="button-continue-registration"
              >
                Continue Registration
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Organization Details Form
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setStep(1)}
              className="mb-4"
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Organization Selection
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedOrgType === OrganizationType.FANTASY_SPORTS && <Heart className="mr-2 h-5 w-5 text-orange-500" />}
                {selectedOrgType === OrganizationType.YOUTH_ORGANIZATION && <Users className="mr-2 h-5 w-5 text-blue-500" />}
                {selectedOrgType === OrganizationType.PRIVATE_SCHOOL && <GraduationCap className="mr-2 h-5 w-5 text-purple-500" />}
                Organization Details
              </CardTitle>
              <CardDescription>
                Please provide your organization information to complete registration.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...form.register('firstName')}
                      data-testid="input-firstName"
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...form.register('lastName')}
                      data-testid="input-lastName"
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register('email')}
                      data-testid="input-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...form.register('phone')}
                      data-testid="input-phone"
                    />
                  </div>
                </div>

                {/* Organization Information */}
                <div>
                  <Label htmlFor="organizationName">
                    {selectedOrgType === OrganizationType.FANTASY_SPORTS ? 'League/Team Name' :
                     selectedOrgType === OrganizationType.YOUTH_ORGANIZATION ? 'Organization Name' :
                     'School Name'} *
                  </Label>
                  <Input
                    id="organizationName"
                    {...form.register('organizationName')}
                    placeholder={
                      selectedOrgType === OrganizationType.FANTASY_SPORTS ? 'e.g., "Weekend Warriors Fantasy League"' :
                      selectedOrgType === OrganizationType.YOUTH_ORGANIZATION ? 'e.g., "Metro YMCA" or "Riverside Boys & Girls Club"' :
                      'e.g., "St. Mary\'s Academy" or "Riverside Charter School"'
                    }
                    data-testid="input-organizationName"
                  />
                  {form.formState.errors.organizationName && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.organizationName.message}</p>
                  )}
                </div>

                {/* Organization-specific fields */}
                {selectedOrgType === OrganizationType.PRIVATE_SCHOOL && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schoolType">School Type *</Label>
                      <Select onValueChange={(value: 'private' | 'charter') => form.setValue('schoolType', value)}>
                        <SelectTrigger data-testid="select-schoolType">
                          <SelectValue placeholder="Select school type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private School</SelectItem>
                          <SelectItem value="charter">Charter School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="enrollmentSize">Student Enrollment</Label>
                      <Select onValueChange={(value) => form.setValue('enrollmentSize', value)}>
                        <SelectTrigger data-testid="select-enrollmentSize">
                          <SelectValue placeholder="Select enrollment size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-100">Under 100 students</SelectItem>
                          <SelectItem value="100-300">100-300 students</SelectItem>
                          <SelectItem value="300-600">300-600 students</SelectItem>
                          <SelectItem value="600-1000">600-1,000 students</SelectItem>
                          <SelectItem value="over-1000">Over 1,000 students</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {(selectedOrgType === OrganizationType.YOUTH_ORGANIZATION || selectedOrgType === OrganizationType.PRIVATE_SCHOOL) && (
                  <div>
                    <Label htmlFor="contactTitle">Your Title/Position *</Label>
                    <Input
                      id="contactTitle"
                      {...form.register('contactTitle')}
                      placeholder={
                        selectedOrgType === OrganizationType.YOUTH_ORGANIZATION 
                          ? 'e.g., "Athletic Director", "Program Coordinator"' 
                          : 'e.g., "Athletic Director", "Principal", "Dean of Students"'
                      }
                      data-testid="input-contactTitle"
                    />
                    {form.formState.errors.contactTitle && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactTitle.message}</p>
                    )}
                  </div>
                )}

                {/* Sports Selection */}
                <div>
                  <Label>Sports/Activities Involved *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
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
                          data-testid={`checkbox-sport-${sport.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <span className="text-sm">{sport}</span>
                      </label>
                    ))}
                  </div>
                  {selectedSports.length === 0 && (
                    <p className="text-sm text-red-500 mt-1">Please select at least one sport</p>
                  )}
                </div>

                {/* Fantasy Sports specific fields */}
                {selectedOrgType === OrganizationType.FANTASY_SPORTS && (
                  <>
                    <div>
                      <Label htmlFor="donationAmount">Optional Donation to Support Education ($)</Label>
                      <Input
                        id="donationAmount"
                        type="number"
                        min="0"
                        step="1"
                        {...form.register('donationAmount', { valueAsNumber: true })}
                        placeholder="0"
                        data-testid="input-donationAmount"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Help fund educational trips for underprivileged students
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="supportMessage">Message of Support (Optional)</Label>
                      <Textarea
                        id="supportMessage"
                        {...form.register('supportMessage')}
                        placeholder="Share why you support Champions for Change's educational mission..."
                        data-testid="textarea-supportMessage"
                      />
                    </div>
                  </>
                )}

                {/* Youth Organization billing cycle */}
                {selectedOrgType === OrganizationType.YOUTH_ORGANIZATION && (
                  <div>
                    <Label>Billing Preference</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <Card 
                        className={`cursor-pointer transition-colors ${billingCycle === 'monthly' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => {
                          setBillingCycle('monthly');
                          form.setValue('billingCycle', 'monthly');
                        }}
                        data-testid="card-billing-monthly"
                      >
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">$50/month</div>
                            <div className="text-sm text-gray-500">Monthly billing</div>
                            <div className="text-xs text-gray-400 mt-1">$600/year total</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card 
                        className={`cursor-pointer transition-colors ${billingCycle === 'annual' ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => {
                          setBillingCycle('annual');
                          form.setValue('billingCycle', 'annual');
                        }}
                        data-testid="card-billing-annual"
                      >
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">$480/year</div>
                            <Badge variant="default" className="mt-1">Save $120!</Badge>
                            <div className="text-sm text-gray-500 mt-1">20% discount</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Organization verification for paid tiers */}
                {(selectedOrgType === OrganizationType.YOUTH_ORGANIZATION || selectedOrgType === OrganizationType.PRIVATE_SCHOOL) && (
                  <div>
                    <Label htmlFor="organizationVerification">
                      Organization Verification Details *
                    </Label>
                    <Textarea
                      id="organizationVerification"
                      {...form.register('organizationVerification')}
                      placeholder={
                        selectedOrgType === OrganizationType.YOUTH_ORGANIZATION 
                          ? 'Please provide details about your organization (website, registration numbers, affiliated leagues, etc.) to help us verify your status...'
                          : 'Please provide details about your school (accreditation, enrollment numbers, website, etc.) to help us verify your status...'
                      }
                      data-testid="textarea-organizationVerification"
                    />
                    {form.formState.errors.organizationVerification && (
                      <p className="text-sm text-red-500 mt-1">{form.formState.errors.organizationVerification.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Additional Information (Optional)</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Tell us more about your goals and how you plan to use our platform..."
                    data-testid="textarea-description"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-registration"
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Complete Registration'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Payment (placeholder for now)
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-gray-900 dark:to-gray-800 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-blue-500" />
            <CardTitle className="text-2xl">Complete Your Setup</CardTitle>
            <CardDescription>
              {selectedOrgType === OrganizationType.FANTASY_SPORTS 
                ? 'Process your optional donation to support educational trips'
                : selectedOrgType === OrganizationType.YOUTH_ORGANIZATION
                ? `Set up your ${billingCycle} subscription - ${billingCycle === 'monthly' ? '$50/month' : '$480/year (Save $120!)'}`
                : 'Set up your annual subscription - $2,000/year'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Payment integration will be connected to your Stripe configuration.
                For now, your registration has been submitted successfully.
              </AlertDescription>
            </Alert>
            <Button onClick={() => setStep(5)} className="w-full" data-testid="button-continue-success">
              Continue to Success Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 4: Success
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl text-green-700">Registration Complete!</CardTitle>
          <CardDescription>
            Welcome to Champions for Change Tournament Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Heart className="h-4 w-4" />
            <AlertDescription>
              <strong>Your {
                selectedOrgType === OrganizationType.FANTASY_SPORTS ? 'Fantasy Sports' :
                selectedOrgType === OrganizationType.YOUTH_ORGANIZATION ? 'Youth Organization' : 
                'Private School'
              } account is ready!</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check your email for login instructions</li>
                <li>Access your dashboard and start organizing</li>
                {selectedOrgType === OrganizationType.FANTASY_SPORTS && (
                  <li>Thank you for supporting our educational mission!</li>
                )}
                {selectedOrgType !== OrganizationType.FANTASY_SPORTS && (
                  <>
                    <li>Full platform access is now active</li>
                    <li>Create unlimited tournaments and manage teams</li>
                  </>
                )}
              </ul>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1" data-testid="button-dashboard">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
            <Button variant="outline" asChild className="flex-1" data-testid="button-tournaments">
              <a href="/tournaments">View Tournaments</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}