import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Upload, DollarSign, FileText, CreditCard } from "lucide-react";

const nonprofitProfileSchema = z.object({
  ein: z.string().min(9, "EIN must be at least 9 characters"),
  organizationName: z.string().min(2, "Organization name required"),
  contactEmail: z.string().email("Valid email required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
});

type NonprofitProfileForm = z.infer<typeof nonprofitProfileSchema>;

interface PricingTier {
  cycle: 'monthly' | 'quarterly' | 'annual';
  price: number;
  description: string;
  features: string[];
}

export default function NonprofitBilling() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'annual'>('annual');
  const [step, setStep] = useState<'profile' | 'documents' | 'subscription' | 'payment'>('profile');

  const form = useForm<NonprofitProfileForm>({
    resolver: zodResolver(nonprofitProfileSchema),
    defaultValues: {
      ein: "",
      organizationName: "",
      contactEmail: "",
      address: "",
      phone: "",
      website: "",
      description: "",
    },
  });

  // Fetch existing nonprofit profile
  const { data: existingProfile } = useQuery({
    queryKey: ["/api/nonprofit/profile"],
    retry: false,
  }) as { data: { id: string; organizationName: string; ein: string; contactEmail: string } | undefined };

  // Fetch pricing information
  const { data: pricing = [] } = useQuery({
    queryKey: ["/api/nonprofit/pricing"],
  }) as { data: PricingTier[] };

  // Create nonprofit profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: NonprofitProfileForm) => 
      apiRequest("POST", "/api/nonprofit/profile", data),
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your nonprofit profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/nonprofit/profile"] });
      setStep('documents');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: ({ nonprofitId, billingCycle }: { nonprofitId: string; billingCycle: string }) =>
      apiRequest("POST", "/api/nonprofit/subscription", { nonprofitId, billingCycle }),
    onSuccess: () => {
      toast({
        title: "Subscription Created",
        description: "Your subscription has been set up successfully.",
      });
      setStep('payment');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (data: NonprofitProfileForm) => {
    createProfileMutation.mutate(data);
  };

  const handleSubscriptionCreate = () => {
    if (existingProfile?.id) {
      createSubscriptionMutation.mutate({
        nonprofitId: existingProfile.id,
        billingCycle: selectedPlan,
      });
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && existingProfile?.id) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fileContent = e.target?.result as ArrayBuffer;
          const base64Content = btoa(String.fromCharCode(...Array.from(new Uint8Array(fileContent))));

          await apiRequest("POST", "/api/nonprofit/tax-exemption", {
            nonprofitId: existingProfile.id,
            documentType: "irs_determination",
            filename: file.name,
            fileContent: base64Content,
          });

          toast({
            title: "Document Uploaded",
            description: "Your tax exemption document has been uploaded successfully.",
          });
          
          setStep('subscription');
        } catch (error: any) {
          toast({
            title: "Upload Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const currentPricing = pricing.find(p => p.cycle === selectedPlan);

  return (
    <div className="container mx-auto py-8 px-4" data-testid="nonprofit-billing-page">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">
            Nonprofit Billing Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Set up your 501(c)(3) organization for simplified flat-rate billing
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['profile', 'documents', 'subscription', 'payment'].map((s, index) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s
                      ? 'bg-green-600 text-white'
                      : ['profile', 'documents', 'subscription'].indexOf(step) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {['profile', 'documents', 'subscription'].indexOf(step) > index ? (
                    <CheckCircle size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 'profile' && (
          <Card data-testid="profile-setup-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Nonprofit Profile
              </CardTitle>
              <CardDescription>
                Enter your 501(c)(3) organization details for tax-exempt billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EIN (Tax ID)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="12-3456789" 
                              {...field} 
                              data-testid="input-ein"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your Nonprofit Name" 
                              {...field}
                              data-testid="input-org-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="contact@yournonprofit.org" 
                            {...field}
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your organization address" 
                            {...field}
                            data-testid="input-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(555) 123-4567" 
                              {...field}
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://yournonprofit.org" 
                              {...field}
                              data-testid="input-website"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your organization's mission" 
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={createProfileMutation.isPending}
                    data-testid="button-save-profile"
                  >
                    {createProfileMutation.isPending ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {step === 'documents' && (
          <Card data-testid="documents-upload-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Tax Exemption Documents
              </CardTitle>
              <CardDescription>
                Upload your IRS determination letter or state tax exemption certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Upload Tax Exemption Document</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Accepted formats: PDF, JPG, PNG (max 10MB)
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                    data-testid="file-upload-input"
                  />
                  <label htmlFor="document-upload">
                    <Button asChild data-testid="button-upload-document">
                      <span>Choose File</span>
                    </Button>
                  </label>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep('profile')}
                    data-testid="button-back-profile"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep('subscription')}
                    data-testid="button-skip-documents"
                  >
                    Skip for Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'subscription' && (
          <Card data-testid="subscription-setup-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Choose Your Plan
              </CardTitle>
              <CardDescription>
                Select a billing cycle for your nonprofit subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {pricing.map((tier) => (
                  <div
                    key={tier.cycle}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPlan === tier.cycle
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => setSelectedPlan(tier.cycle)}
                    data-testid={`plan-${tier.cycle}`}
                  >
                    <h3 className="text-xl font-bold capitalize mb-2">{tier.cycle}</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      ${tier.price}
                      <span className="text-sm text-gray-500">/{tier.cycle}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{tier.description}</p>
                    <ul className="space-y-2">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('documents')}
                  data-testid="button-back-documents"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubscriptionCreate}
                  disabled={createSubscriptionMutation.isPending}
                  data-testid="button-create-subscription"
                >
                  {createSubscriptionMutation.isPending ? "Creating..." : "Create Subscription"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'payment' && (
          <Card data-testid="payment-instructions-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Payment Instructions
              </CardTitle>
              <CardDescription>
                Complete your subscription setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
                    Subscription Created Successfully!
                  </h3>
                  <p className="text-green-700 dark:text-green-300">
                    Your {selectedPlan} subscription for ${currentPricing?.price} has been set up.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Payment Methods Available:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Check Payment</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Mail checks to our billing address. Include invoice number in memo.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">ACH Transfer</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Direct bank transfer. Contact us for ACH setup instructions.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Wire Transfer</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        For large organizations. Wire transfer details provided with invoice.
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Online Payment</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Secure online payment portal (available soon).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    You will receive an invoice within 24 hours with payment instructions.
                  </p>
                  <Button data-testid="button-complete-setup">
                    Complete Setup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}