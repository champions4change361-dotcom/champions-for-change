import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trophy, Users, MessageSquare, Calendar, CheckCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTeamSchema, InsertTeam } from "@shared/schema";

const teamSignupSchema = insertTeamSchema.extend({
  sport: z.string().min(1, "Please select a sport"),
  teamSize: z.coerce.number().int().min(1, "Please estimate your team size"),
  subscriptionTier: z.string(),
  price: z.string(),
});

type TeamSignupForm = z.infer<typeof teamSignupSchema>;

export default function TeamSignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get plan and price from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'growing';
  const price = urlParams.get('price') || '39';

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
      communications: 400
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
      communications: 16000
    }
  };

  const currentPlan = planConfig[plan as keyof typeof planConfig] || planConfig.growing;

  const form = useForm<TeamSignupForm>({
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

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamSignupForm) => {
      return apiRequest('/api/teams', {
        method: 'POST',
        body: JSON.stringify({
          teamName: data.teamName,
          organizationName: data.organizationName,
          coachName: data.coachName,
          coachEmail: data.coachEmail,
          coachPhone: data.coachPhone,
          sport: data.sport,
          teamSize: data.teamSize,
          subscriptionTier: data.subscriptionTier,
          subscriptionStatus: 'trialing', // Start with free trial
        }),
      });
    },
    onSuccess: (team) => {
      toast({
        title: "Team created successfully!",
        description: "Your 14-day free trial has started. Welcome to team management!",
      });
      // Redirect to team dashboard
      setLocation(`/teams/${team.id}`);
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
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    
                    <FormField
                      control={form.control}
                      name="teamName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Team Name *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Eagles, Warriors, etc."
                              className="bg-slate-700/50 border-slate-600 text-white"
                              data-testid="input-team-name"
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
                          <FormLabel className="text-slate-200">School/Organization</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Lincoln High School, YMCA, etc."
                              className="bg-slate-700/50 border-slate-600 text-white"
                              data-testid="input-organization-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="coachName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Coach Name *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="John Smith"
                                className="bg-slate-700/50 border-slate-600 text-white"
                                data-testid="input-coach-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coachEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Coach Email *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="email"
                                placeholder="coach@email.com"
                                className="bg-slate-700/50 border-slate-600 text-white"
                                data-testid="input-coach-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="coachPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-200">Coach Phone</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="(555) 123-4567"
                              className="bg-slate-700/50 border-slate-600 text-white"
                              data-testid="input-coach-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sport"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Sport *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white" data-testid="select-sport">
                                  <SelectValue placeholder="Select sport" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="basketball">Basketball</SelectItem>
                                <SelectItem value="football">Football</SelectItem>
                                <SelectItem value="soccer">Soccer</SelectItem>
                                <SelectItem value="volleyball">Volleyball</SelectItem>
                                <SelectItem value="baseball">Baseball</SelectItem>
                                <SelectItem value="softball">Softball</SelectItem>
                                <SelectItem value="track">Track & Field</SelectItem>
                                <SelectItem value="swimming">Swimming</SelectItem>
                                <SelectItem value="tennis">Tennis</SelectItem>
                                <SelectItem value="golf">Golf</SelectItem>
                                <SelectItem value="wrestling">Wrestling</SelectItem>
                                <SelectItem value="cross_country">Cross Country</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="teamSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200">Team Size *</FormLabel>
                            <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white" data-testid="select-team-size">
                                  <SelectValue placeholder="How many players?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="10">10 or fewer</SelectItem>
                                <SelectItem value="15">11-15 players</SelectItem>
                                <SelectItem value="20">16-20 players</SelectItem>
                                <SelectItem value="25">21-25 players</SelectItem>
                                <SelectItem value="30">26-30 players</SelectItem>
                                <SelectItem value="35">31-35 players</SelectItem>
                                <SelectItem value="50">36-50 players</SelectItem>
                                <SelectItem value="100">50+ players</SelectItem>
                              </SelectContent>
                            </Select>
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
      </div>
    </div>
  );
}