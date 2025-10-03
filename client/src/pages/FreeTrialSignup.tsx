import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, CheckCircle, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const freeTrialSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(1, "Organization name is required"),
});

type FreeTrialForm = z.infer<typeof freeTrialSchema>;

export default function FreeTrialSignup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FreeTrialForm>({
    resolver: zodResolver(freeTrialSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      organizationName: "",
    },
  });

  const onSubmit = async (data: FreeTrialForm) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("/api/auth/trial-signup", "POST", data);

      toast({
        title: "Welcome to Champions for Change!",
        description: "Your 14-day free trial has started. Redirecting to your dashboard...",
      });

      setTimeout(() => {
        setLocation("/tournaments");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-green-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/')}
            className="text-white hover:bg-white/10"
            data-testid="button-back-home"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start Your 14-Day Free Trial
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Full access to tournament & team management. No payment required.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-slate-800 border border-green-500/30 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold">No Credit Card</p>
            <p className="text-slate-400 text-sm">Start immediately</p>
          </div>
          <div className="bg-slate-800 border border-green-500/30 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold">Full Access</p>
            <p className="text-slate-400 text-sm">All features unlocked</p>
          </div>
          <div className="bg-slate-800 border border-green-500/30 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-semibold">14 Days Free</p>
            <p className="text-slate-400 text-sm">Cancel anytime</p>
          </div>
        </div>

        {/* Signup Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Create Your Account</CardTitle>
            <CardDescription className="text-slate-400">
              Get started with your free trial in less than 60 seconds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-first-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-last-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-password"
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
                      <FormLabel className="text-white">Organization Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Your school, club, or business"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-organization"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-lg"
                  disabled={isLoading}
                  data-testid="button-start-trial"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Your Account...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-5 w-5" />
                      Start My Free Trial
                    </>
                  )}
                </Button>

                <p className="text-center text-slate-400 text-sm mt-4">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/login")}
                    className="text-green-400 hover:text-green-300 underline"
                    data-testid="link-login"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* What's Included */}
        <div className="mt-12 bg-slate-800 border border-slate-700 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">What's Included in Your Trial</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Unlimited Tournaments</p>
                <p className="text-slate-400 text-sm">Create as many tournaments as you need</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Team Management</p>
                <p className="text-slate-400 text-sm">Manage rosters, schedules, and communications</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">White-Label Branding</p>
                <p className="text-slate-400 text-sm">Customize with your colors and logo</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-white font-semibold">Priority Support</p>
                <p className="text-slate-400 text-sm">Get help when you need it</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
