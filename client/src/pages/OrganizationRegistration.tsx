import { ArrowLeft, Users, Heart, Shield, Trophy, CheckCircle, Star, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const organizationFormSchema = z.object({
  organizationType: z.string().min(1, "Please select your organization type"),
  organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  approximateParticipants: z.string().min(1, "Please select participant range"),
  primarySports: z.string().min(5, "Please describe the sports/activities"),
  additionalInfo: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationFormSchema>;

export default function OrganizationRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      organizationType: "",
      organizationName: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      city: "",
      state: "",
      approximateParticipants: "",
      primarySports: "",
      additionalInfo: "",
    },
  });

  const onSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true);
    try {
      // Here you would typically send to your backend
      console.log("Organization registration data:", data);
      
      toast({
        title: "Registration Submitted!",
        description: "We'll contact you within 24 hours to get your organization set up.",
      });
      
      // Reset form
      form.reset();
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Organization Registration
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-400 p-4 rounded-full">
              <Users className="h-12 w-12 text-green-900" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
            Register Your Organization
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8" data-testid="text-hero-subtitle">
            Perfect for charter schools, private schools, pony leagues, pop warner, and youth sports organizations
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-benefits-title">
            Why Organizations Choose Our Platform
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center" data-testid="card-affordable">
              <CardHeader>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-900 dark:text-green-100">Mission-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Every subscription supports educational opportunities for underprivileged youth in Corpus Christi, Texas.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-flexible">
              <CardHeader>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-blue-900 dark:text-blue-100">Flexible Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Customizable features for organizations of all sizes, from 10-team pony leagues to large private schools.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="card-comprehensive">
              <CardHeader>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-purple-900 dark:text-purple-100">Complete Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Tournament management, scheduling, health monitoring, and communication tools in one platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Organization Registration Form</CardTitle>
              <CardDescription className="text-center">
                Tell us about your organization so we can customize the perfect solution for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-organization-registration">
                  
                  {/* Organization Type */}
                  <FormField
                    control={form.control}
                    name="organizationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-organization-type">
                              <SelectValue placeholder="Select your organization type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="charter-school">Charter School</SelectItem>
                            <SelectItem value="private-school">Private School</SelectItem>
                            <SelectItem value="pony-league">Pony League</SelectItem>
                            <SelectItem value="pop-warner">Pop Warner</SelectItem>
                            <SelectItem value="youth-sports">Youth Sports Organization</SelectItem>
                            <SelectItem value="club-sports">Club Sports</SelectItem>
                            <SelectItem value="recreation-center">Recreation Center</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Organization Name */}
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your organization name" {...field} data-testid="input-organization-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Name */}
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} data-testid="input-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Email */}
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@organization.com" {...field} data-testid="input-contact-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Phone */}
                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} data-testid="input-contact-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* City */}
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your city" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <FormControl>
                            <Input placeholder="TX" {...field} data-testid="input-state" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Participant Count */}
                  <FormField
                    control={form.control}
                    name="approximateParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approximate Number of Participants *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-participants">
                              <SelectValue placeholder="Select participant range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10-25">10-25 participants</SelectItem>
                            <SelectItem value="26-50">26-50 participants</SelectItem>
                            <SelectItem value="51-100">51-100 participants</SelectItem>
                            <SelectItem value="101-200">101-200 participants</SelectItem>
                            <SelectItem value="201-500">201-500 participants</SelectItem>
                            <SelectItem value="500+">500+ participants</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Primary Sports */}
                  <FormField
                    control={form.control}
                    name="primarySports"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Sports/Activities *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List the main sports or activities your organization manages (e.g., football, baseball, basketball, soccer, etc.)"
                            {...field}
                            data-testid="textarea-primary-sports"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Info */}
                  <FormField
                    control={form.control}
                    name="additionalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about any specific needs, current challenges, or questions you have about our platform"
                            {...field}
                            data-testid="textarea-additional-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="text-center pt-6">
                    <Button 
                      type="submit" 
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-4"
                      disabled={isSubmitting}
                      data-testid="button-submit-registration"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Registration"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-features-title">
            What You'll Get with Your Organization Account
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-3" data-testid="feature-tournament-management">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Tournament Management</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Create and manage tournaments with custom brackets and scoring</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3" data-testid="feature-team-registration">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Team Registration</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Easy team signup and roster management for coaches</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3" data-testid="feature-scheduling">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Smart Scheduling</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Automated scheduling with conflict detection</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3" data-testid="feature-health-monitoring">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Health Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Track participant safety and health metrics</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3" data-testid="feature-communication">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Communication Tools</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Keep parents and participants informed</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3" data-testid="feature-reporting">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Reporting & Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Detailed reports on participation and performance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-cta-title">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl mb-8" data-testid="text-cta-description">
            Join hundreds of organizations already using our platform to create better experiences for their participants while supporting educational opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900" data-testid="button-contact-sales">
              Contact Our Team
            </Button>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" data-testid="button-return-home">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}