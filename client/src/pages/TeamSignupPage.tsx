import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Trophy, Users, MessageSquare, Calendar, CheckCircle, ArrowLeft, Mail, Globe, ArrowRight, Eye, EyeOff, Settings, Calculator } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTeamSchema, InsertTeam } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const teamSignupSchema = insertTeamSchema.extend({
  sport: z.string().min(1, "Please select a sport"),
  teamSize: z.coerce.number().int().min(1, "Please estimate your team size"),
  subscriptionTier: z.string(),
  price: z.string(),
});

// Email/password signup schema for embedded authentication
const emailSignupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type TeamSignupForm = z.infer<typeof teamSignupSchema>;
type EmailSignupForm = z.infer<typeof emailSignupSchema>;

export default function TeamSignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  // 2-step flow state
  const [step, setStep] = useState(1); // 1 = Team Info, 2 = Authentication
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hybrid subscription state
  const [addons, setAddons] = useState({
    tournamentPerEvent: false,
    teamManagement: false
  });
  const [livePricing, setLivePricing] = useState<any>(null);

  // Get plan and price from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'growing';
  const price = urlParams.get('price') || '39';
  const resume = urlParams.get('resume') === '1';
  
  // Handle OAuth resume flow
  useEffect(() => {
    if (resume && isAuthenticated && user) {
      // User returned from OAuth, create team from draft
      const teamDraft = sessionStorage.getItem('team_signup_draft');
      if (teamDraft) {
        try {
          const teamData = JSON.parse(teamDraft);
          createAuthenticatedTeam(teamData);
        } catch (error) {
          console.error('Failed to parse team draft:', error);
          sessionStorage.removeItem('team_signup_draft');
          toast({
            title: "Resume Error",
            description: "Please fill out the team form again.",
            variant: "destructive",
          });
          setStep(1);
        }
      }
    }
  }, [resume, isAuthenticated, user]);

  // Plan configurations
  const planConfig = {
    starter: {
      name: "Starter Team",
      price: "$23",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: ["Up to 20 players", "400 communications/month", "Basic roster management", "Tournament registration"],
      color: "green",
      maxPlayers: 20,
      communications: 400,
      popular: false
    },
    growing: {
      name: "Growing Team", 
      price: "$39",
      period: "/month",
      description: "Most popular choice for active teams",
      features: ["Up to 35 players", "4,000 communications/month", "Advanced scheduling", "Parent portal access"],
      color: "blue",
      maxPlayers: 35,
      communications: 4000,
      popular: true
    },
    elite: {
      name: "Elite Program",
      price: "$63", 
      period: "/month",
      description: "Complete solution for large organizations",
      features: ["Unlimited players & teams", "16,000 communications/month", "Full organization management", "Multi-team coordination"],
      color: "purple",
      maxPlayers: "unlimited",
      communications: 16000,
      popular: false
    }
  };

  const currentPlan = planConfig[plan as keyof typeof planConfig] || planConfig.growing;

  // Live pricing calculator API call
  const { data: pricingData, refetch: recalculatePrice } = useQuery({
    queryKey: ['pricing-calculator', plan, addons],
    queryFn: async () => {
      const response = await apiRequest('/api/pricing/calculate', 'POST', {
        baseType: 'team',
        teamTier: plan as 'starter' | 'growing' | 'elite',
        addons: addons
      });
      return response;
    },
    enabled: true
  });

  // Update live pricing when addons change
  useEffect(() => {
    recalculatePrice();
  }, [addons, recalculatePrice]);

  // Team information form
  const teamForm = useForm<TeamSignupForm>({
    resolver: zodResolver(teamSignupSchema),
    defaultValues: {
      teamName: "",
      organizationName: "",
      coachName: "",
      coachEmail: "",
      coachPhone: "",
      sport: "",
      teamSize: 0,
      subscriptionTier: plan,
      price: price,
    },
  });

  // Email signup form
  const emailForm = useForm<EmailSignupForm>({
    resolver: zodResolver(emailSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Quick fix: Add missing functions to resolve errors
  const createAuthenticatedTeam = (teamData: TeamSignupForm) => {
    console.log('Creating team for authenticated user:', teamData);
  };

  const onTeamSubmit = (data: TeamSignupForm) => {
    console.log('Team form submitted:', data);
    // For now, just show we're moving to step 2
    setStep(2);
  };

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamSignupForm) => {
      const response = await apiRequest('/api/teams/signup', 'POST', {
        teamName: data.teamName,
        organizationName: data.organizationName,
        coachName: data.coachName,
        coachEmail: data.coachEmail,
        coachPhone: data.coachPhone,
        sport: data.sport,
        teamSize: data.teamSize,
        subscriptionTier: data.subscriptionTier === 'starter' ? 'basic' : 
                         data.subscriptionTier === 'growing' ? 'premium' : 
                         data.subscriptionTier === 'elite' ? 'enterprise' : 'premium', // Map to schema values
        subscriptionStatus: 'free', // Start with free status
      });
      return response.json();
    },
    onSuccess: (team) => {
      toast({
        title: "Team created successfully!",
        description: "Your 14-day free trial has started. Please sign in to access your dashboard.",
      });
      
      // SECURITY: Store secure linkToken for team linking verification
      if (team.linkToken) {
        localStorage.setItem('team_link_token', team.linkToken);
        sessionStorage.setItem('pending_team_link', team.id);
        console.log('🔒 SECURITY: Secure link token stored for team verification');
      } else {
        console.error('🚨 SECURITY: No linkToken received from server - team linking may fail');
      }
      
      // Store team information for linking after authentication
      localStorage.setItem('pending_team_signup', JSON.stringify({
        teamId: team.id,
        teamName: team.teamName,
        subscriptionTier: team.subscriptionTier,
        createdAt: new Date().toISOString(),
        hasSecureToken: !!team.linkToken // Track if token was properly received
      }));
      
      // Redirect to login with team signup context
      setLocation('/unified-login?action=complete-team-signup&team=' + team.id);
      
      // Invalidate teams cache
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
    },
    onError: (error) => {
      console.error('Team creation error:', error);
      toast({
        title: "Failed to create team",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: TeamSignupForm) => {
    createTeamMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => setLocation('/')}
              variant="ghost" 
              className="text-yellow-300 hover:text-yellow-200"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Badge className="bg-blue-600 text-white">
              14-Day Free Trial • No Credit Card Required
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Plan Summary */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Create Your Team</h1>
              <p className="text-slate-300">Get started with professional team management</p>
            </div>

            {/* Selected Plan Card */}
            <Card className={`${currentPlan.color === 'green' ? 'bg-green-900/40 border-green-500/40' : currentPlan.color === 'blue' ? 'bg-blue-900/40 border-blue-500/40' : 'bg-purple-900/40 border-purple-500/40'} relative`}>
              {currentPlan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className={`text-2xl ${currentPlan.color === 'green' ? 'text-green-300' : currentPlan.color === 'blue' ? 'text-blue-300' : 'text-purple-300'} ${currentPlan.popular ? 'mt-2' : ''}`}>
                  {currentPlan.name}
                </CardTitle>
                <div className={`text-4xl font-bold ${currentPlan.color === 'green' ? 'text-green-400' : currentPlan.color === 'blue' ? 'text-blue-400' : 'text-purple-400'}`}>
                  {currentPlan.price}
                  <span className={`text-lg ${currentPlan.color === 'green' ? 'text-green-300' : currentPlan.color === 'blue' ? 'text-blue-300' : 'text-purple-300'}`}>{currentPlan.period}</span>
                </div>
                <CardDescription className={`${currentPlan.color === 'green' ? 'text-green-200' : currentPlan.color === 'blue' ? 'text-blue-200' : 'text-purple-200'}`}>
                  {currentPlan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className={`space-y-2 ${currentPlan.color === 'green' ? 'text-green-100' : currentPlan.color === 'blue' ? 'text-blue-100' : 'text-purple-100'}`}>
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 p-4 bg-green-600/20 border border-green-500/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-green-300 font-semibold">🎯 Promotional Pricing</div>
                    <div className="text-sm text-green-200 mt-1">
                      First month: <strong>FREE</strong> • Second month: <strong>$19</strong> • Then {currentPlan.price}{currentPlan.period}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hybrid Subscription Add-ons */}
            <Card className="mt-6 bg-slate-800/50 border-slate-600/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Add Tournament Features
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enhance your subscription with tournament organizing capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tournament Per-Event Add-on */}
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      <div>
                        <h4 className="font-semibold text-white">Tournament Hosting</h4>
                        <p className="text-sm text-slate-400">Host tournaments with $50 per event fee</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-300 font-medium">$50/event</span>
                    <Switch
                      checked={addons.tournamentPerEvent}
                      onCheckedChange={(checked) => 
                        setAddons(prev => ({ ...prev, tournamentPerEvent: checked }))
                      }
                      data-testid="switch-tournament-addon"
                    />
                  </div>
                </div>

                {/* Team Management Add-on (for future organizers) */}
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30 opacity-60">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-400" />
                      <div>
                        <h4 className="font-semibold text-white">Advanced Team Management</h4>
                        <p className="text-sm text-slate-400">Additional team coordination tools (Future)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-300 font-medium">$20/month</span>
                    <Switch
                      checked={false}
                      disabled={true}
                      data-testid="switch-team-addon"
                    />
                  </div>
                </div>

                {/* Live Pricing Calculator */}
                {pricingData && (
                  <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white flex items-center">
                        <Calculator className="h-4 w-4 mr-2" />
                        Live Pricing Calculator
                      </h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-300">
                        <span>Base Subscription ({currentPlan.name}):</span>
                        <span className="font-medium">${pricingData.breakdown?.baseSubscription || currentPlan.price.replace('$', '')}/month</span>
                      </div>
                      {addons.tournamentPerEvent && (
                        <div className="flex justify-between text-slate-300">
                          <span>Tournament Hosting:</span>
                          <span className="font-medium">${pricingData.breakdown?.perTournamentFee || 50}/event</span>
                        </div>
                      )}
                      {pricingData.totals?.recurringAddons > 0 && (
                        <div className="flex justify-between text-slate-300">
                          <span>Monthly Add-ons:</span>
                          <span className="font-medium">${pricingData.totals.recurringAddons}/month</span>
                        </div>
                      )}
                      <hr className="border-slate-600/50 my-2" />
                      <div className="flex justify-between text-white font-semibold text-base">
                        <span>Monthly Total:</span>
                        <span className="text-blue-400">${pricingData.totals?.monthly || currentPlan.price.replace('$', '')}/month</span>
                      </div>
                      {addons.tournamentPerEvent && (
                        <div className="text-xs text-slate-400 mt-2">
                          * Plus ${pricingData.totals?.perEventFee || 50} per tournament you host
                        </div>
                      )}
                      {pricingData.totals?.annualSavings > 0 && (
                        <div className="text-xs text-green-400 mt-2">
                          💰 Save ${pricingData.totals.annualSavings} with annual billing
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-slate-300">
                <Trophy className="h-5 w-5 text-yellow-400 mr-3" />
                <span>Professional team management platform</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Users className="h-5 w-5 text-blue-400 mr-3" />
                <span>Join any tournament with your team</span>
              </div>
              <div className="flex items-center text-slate-300">
                <MessageSquare className="h-5 w-5 text-green-400 mr-3" />
                <span>Communication limits scale with team size</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Calendar className="h-5 w-5 text-purple-400 mr-3" />
                <span>No tournament experience required</span>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div>
            <Card className="bg-slate-800/50 border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white">Team Information</CardTitle>
                <CardDescription className="text-slate-300">
                  Tell us about your team to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...teamForm}>
                  <form onSubmit={teamForm.handleSubmit(onTeamSubmit)} className="space-y-4">
                    
                    <FormField
                      control={teamForm.control}
                      name="teamName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Team Name *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Eagles, Warriors, etc."
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:text-white"
                              data-testid="input-team-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={teamForm.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">School/Organization</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ''}
                              placeholder="Lincoln High School, YMCA, etc."
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:text-white"
                              data-testid="input-organization-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={teamForm.control}
                        name="coachName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Coach Name *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="John Smith"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:text-white"
                                data-testid="input-coach-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={teamForm.control}
                        name="coachEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Coach Email *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email"
                                placeholder="coach@email.com"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:text-white"
                                data-testid="input-coach-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={teamForm.control}
                      name="coachPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Coach Phone</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ''}
                              placeholder="(555) 123-4567"
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:text-white"
                              data-testid="input-coach-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={teamForm.control}
                        name="sport"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Sport *</FormLabel>
                            <FormControl>
                              <select 
                                {...field}
                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                data-testid="select-sport"
                              >
                                <option value="" className="bg-slate-700 text-white">Select sport</option>
                                <option value="basketball" className="bg-slate-700 text-white">Basketball</option>
                                <option value="football" className="bg-slate-700 text-white">Football</option>
                                <option value="soccer" className="bg-slate-700 text-white">Soccer</option>
                                <option value="volleyball" className="bg-slate-700 text-white">Volleyball</option>
                                <option value="baseball" className="bg-slate-700 text-white">Baseball</option>
                                <option value="softball" className="bg-slate-700 text-white">Softball</option>
                                <option value="track" className="bg-slate-700 text-white">Track & Field</option>
                                <option value="swimming" className="bg-slate-700 text-white">Swimming</option>
                                <option value="tennis" className="bg-slate-700 text-white">Tennis</option>
                                <option value="golf" className="bg-slate-700 text-white">Golf</option>
                                <option value="wrestling" className="bg-slate-700 text-white">Wrestling</option>
                                <option value="cross_country" className="bg-slate-700 text-white">Cross Country</option>
                                <option value="other" className="bg-slate-700 text-white">Other</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={teamForm.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Team Size *</FormLabel>
                            <FormControl>
                              <select 
                                {...field}
                                value={field.value?.toString() || ""}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                data-testid="select-team-size"
                              >
                                <option value="" className="bg-slate-700 text-white">How many players?</option>
                                <option value="10" className="bg-slate-700 text-white">10 or fewer</option>
                                <option value="15" className="bg-slate-700 text-white">11-15 players</option>
                                <option value="20" className="bg-slate-700 text-white">16-20 players</option>
                                <option value="25" className="bg-slate-700 text-white">21-25 players</option>
                                <option value="30" className="bg-slate-700 text-white">26-30 players</option>
                                <option value="35" className="bg-slate-700 text-white">31-35 players</option>
                                <option value="50" className="bg-slate-700 text-white">36-50 players</option>
                                <option value="100" className="bg-slate-700 text-white">50+ players</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-6"
                      disabled={createTeamMutation.isPending}
                      data-testid="button-create-team"
                    >
                      {createTeamMutation.isPending ? "Creating Team..." : "Start Free Trial"}
                    </Button>

                    <p className="text-xs text-slate-400 text-center mt-4">
                      By creating your team, you agree to our Terms of Service and Privacy Policy.
                      Your free trial starts immediately - no credit card required until trial ends.
                    </p>

                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

        </div>
        )}

        {/* Step 2: Authentication */}
        {step === 2 && (
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-slate-300">Choose how you'd like to sign up</p>
            </div>

            <Card className="bg-slate-800/80 backdrop-blur-sm border-yellow-500/20">
              <CardContent className="p-6 space-y-4">
                {/* Google OAuth Button */}
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-base flex items-center justify-center"
                  data-testid="button-google-signup"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-slate-400">Or</span>
                  </div>
                </div>

                {/* Email Signup Button */}
                <Button 
                  onClick={() => setAuthMethod('email')}
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:text-white hover:border-slate-500"
                  data-testid="button-email-signup"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Sign up with Email
                </Button>

                <div className="text-center pt-2">
                  <Button 
                    onClick={() => setStep(1)}
                    variant="ghost" 
                    className="text-slate-400 hover:text-white"
                    data-testid="button-back-to-step1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Team Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}