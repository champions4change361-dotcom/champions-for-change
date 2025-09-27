import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trophy, Users, CheckCircle, ArrowLeft, Mail, Globe, ArrowRight, Eye, EyeOff, GraduationCap, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTeamSchema, InsertTeam } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useTeamLinking } from "@/hooks/useTeamLinking";
import { useState, useEffect } from "react";
import EmailSignupForm from "@/components/EmailSignupForm";

const teamSignupSchema = insertTeamSchema.extend({
  sport: z.string().min(1, "Please select a sport"),
  teamSize: z.coerce.number().int().min(1, "Please estimate your team size"),
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
  const { isLinking, linkingError } = useTeamLinking();
  
  // 2-step flow state
  const [step, setStep] = useState(1); // 1 = Team Info, 2 = Authentication
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get resume status from URL params
  const urlParams = new URLSearchParams(window.location.search);
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

  // Champions for Change donation configuration
  const donationConfig = {
    suggestedAmount: 50,
    description: "Support student education while getting complete tournament management tools",
    features: [
      "Unlimited professional tournaments",
      "All tournament formats (Single/Double/Round Robin/Swiss)", 
      "Complete white-label branding & custom domains",
      "AI-powered tournament creation & optimization",
      "Unlimited teams, players, and events",
      "Integrated payment processing via Stripe",
      "Professional webstore with custom merchandise",
      "Event ticket sales & revenue tracking",
      "Mobile-responsive tournament management",
      "Enterprise-grade security and data backup",
      "Advanced analytics & reporting suite",
      "Priority support & training included"
    ]
  };

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

  // Handle team linking after OAuth authentication
  const createAuthenticatedTeam = (teamData: TeamSignupForm) => {
    console.log('🔄 Setting up team linking for authenticated user:', { 
      teamName: teamData.teamName, 
      hasUser: !!user 
    });

    // Get the pending team information that was stored during signup
    const pendingTeamData = localStorage.getItem('pending_team_signup');
    const linkToken = localStorage.getItem('team_link_token');

    if (!pendingTeamData) {
      console.error('🚨 No pending team data found - cannot link team');
      toast({
        title: "Team Linking Error",
        description: "No pending team data found. Please create your team again.",
        variant: "destructive",
      });
      sessionStorage.removeItem('team_signup_draft');
      setLocation('/team-signup');
      return;
    }

    if (!linkToken) {
      console.error('🚨 No link token found - cannot securely link team');
      toast({
        title: "Security Error", 
        description: "Missing security token. Please create your team again.",
        variant: "destructive",
      });
      sessionStorage.removeItem('team_signup_draft');
      localStorage.removeItem('pending_team_signup');
      setLocation('/team-signup');
      return;
    }

    try {
      const pendingTeam = JSON.parse(pendingTeamData);
      
      console.log('🔗 Setting up team linking data:', {
        teamId: pendingTeam.teamId,
        teamName: pendingTeam.teamName,
        hasToken: !!linkToken
      });

      // Set up the data that useTeamLinking hook expects
      sessionStorage.setItem('pending_team_link', pendingTeam.teamId);
      // linkToken is already in localStorage with the correct key

      // Clean up the draft data
      sessionStorage.removeItem('team_signup_draft');

      // The useTeamLinking hook will automatically trigger the linking process
      console.log('✅ Team linking data prepared - hook will handle automatic linking');
      
      toast({
        title: "Welcome back!",
        description: "Linking you to your team...",
      });

    } catch (error) {
      console.error('🚨 Failed to parse pending team data:', error);
      toast({
        title: "Team Linking Error",
        description: "Failed to process team data. Please create your team again.", 
        variant: "destructive",
      });
      sessionStorage.removeItem('team_signup_draft');
      localStorage.removeItem('pending_team_signup');
      localStorage.removeItem('team_link_token');
      setLocation('/team-signup');
    }
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
        subscriptionTier: 'supporter', // Champions for Change supporter
        subscriptionStatus: 'active', // Active supporter status
      });
      return response.json();
    },
    onSuccess: (team) => {
      toast({
        title: "Welcome to Champions for Change!",
        description: "Your team is ready! Please sign in to complete your donation setup and access your dashboard.",
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
      
      // Store team draft data for OAuth resume flow
      const teamFormData = teamForm.getValues();
      sessionStorage.setItem('team_signup_draft', JSON.stringify(teamFormData));
      
      // Set return URL for OAuth flow
      sessionStorage.setItem('auth_return_url', `/team-signup?resume=1`);
      
      // Redirect to OAuth login (Google login specifically for team signup)
      setLocation('/api/login?provider=google&user_type=team');
      
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
            <div className="flex items-center gap-2">
              <Badge className="bg-green-600 text-white flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                Champions for Change
              </Badge>
              <Badge className="bg-blue-600 text-white flex items-center gap-1">
                <Heart className="h-3 w-3" />
                Tax-Deductible Donation
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Plan Summary */}
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Support Student Education</h1>
              <p className="text-slate-300">Get complete tournament management tools while funding educational opportunities for underprivileged students</p>
              <div className="mt-4 flex items-center gap-2 text-green-300">
                <Heart className="h-4 w-4" />
                <span className="text-sm">Every donation directly supports student educational programs in Corpus Christi, Texas</span>
              </div>
            </div>

            {/* Champions for Change Donation Card */}
            <Card className="bg-gradient-to-br from-green-900/40 to-blue-900/40 border-green-500/40 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-500 text-white flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  Champions for Change
                </Badge>
              </div>
              <CardHeader className="text-center pb-4 mt-2">
                <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                  <GraduationCap className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-300">
                  Complete Tournament Management Platform
                </CardTitle>
                <div className="text-4xl font-bold text-green-400">
                  ${donationConfig.suggestedAmount}
                  <span className="text-lg text-green-300">/month</span>
                </div>
                <CardDescription className="text-green-200">
                  {donationConfig.description}
                </CardDescription>
                <div className="mt-3">
                  <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">
                    💚 100% Tax-Deductible Charitable Donation
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-100">
                  {donationConfig.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-blue-300 font-semibold flex items-center justify-center gap-2">
                      <Heart className="h-4 w-4" />
                      Educational Impact
                    </div>
                    <div className="text-sm text-blue-200 mt-1">
                      <strong>Every donation</strong> funds educational trips and opportunities for underprivileged students in <strong>Corpus Christi, Texas</strong>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donation Flexibility */}
            <Card className="mt-6 bg-blue-900/20 border-blue-500/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-blue-400" />
                  Flexible Donation Options
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Support our educational mission at a level that works for your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-800/30 rounded-lg border border-blue-600/30">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-200 mb-2">💡 Suggested Monthly Donation</div>
                    <div className="text-3xl font-bold text-blue-300 mb-1">${donationConfig.suggestedAmount}</div>
                    <div className="text-sm text-blue-200 mb-3">Adjust up or down based on your capacity to support our mission</div>
                    <div className="text-xs text-blue-300 bg-blue-900/40 px-3 py-2 rounded-lg">
                      ✨ Complete platform access regardless of donation amount
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-green-800/20 rounded-lg border border-green-600/30">
                    <div className="text-green-300 font-semibold">Small Organization</div>
                    <div className="text-green-200 text-sm">$25-35/month</div>
                  </div>
                  <div className="p-3 bg-blue-800/20 rounded-lg border border-blue-600/30">
                    <div className="text-blue-300 font-semibold">Medium Organization</div>
                    <div className="text-blue-200 text-sm">$50/month</div>
                  </div>
                  <div className="p-3 bg-purple-800/20 rounded-lg border border-purple-600/30">
                    <div className="text-purple-300 font-semibold">Large Organization</div>
                    <div className="text-purple-200 text-sm">$75+/month</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Educational Impact */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-slate-300">
                <GraduationCap className="h-5 w-5 text-green-400 mr-3" />
                <span>Fund educational trips for underprivileged students</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Heart className="h-5 w-5 text-red-400 mr-3" />
                <span>100% tax-deductible charitable donation</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Trophy className="h-5 w-5 text-yellow-400 mr-3" />
                <span>Complete enterprise tournament platform</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Users className="h-5 w-5 text-blue-400 mr-3" />
                <span>No feature restrictions regardless of donation amount</span>
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
            {/* Show Email Signup Form when email method is selected */}
            {authMethod === 'email' ? (
              <div>
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                  <p className="text-slate-300">Sign up with your email address</p>
                </div>
                
                <EmailSignupForm
                  preselectedType="individual"
                  onSuccess={(data) => {
                    toast({
                      title: "Account Created Successfully!",
                      description: "Please check your email to verify your account.",
                    });
                    // Store team info and redirect to login to complete flow
                    const teamData = teamForm.getValues();
                    sessionStorage.setItem('team_signup_draft', JSON.stringify(teamData));
                    setLocation('/unified-login?action=complete-team-signup&email-verified=true');
                  }}
                  onBackToOptions={() => setAuthMethod('google')}
                />
              </div>
            ) : (
              // Show Authentication Method Selection
              <div>
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
        )}

      </div>
    </div>
  );
}