import { ArrowLeft, Users, Heart, Shield, Trophy, CheckCircle, Star, Target } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function OrganizationRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const { toast } = useToast();

  const handleActivityChange = (activity: string, checked: boolean) => {
    if (checked) {
      setSelectedActivities(prev => [...prev, activity]);
    } else {
      setSelectedActivities(prev => prev.filter(a => a !== activity));
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      organizationType: formData.get('organizationType'),
      organizationName: formData.get('organizationName'),
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      city: formData.get('city'),
      state: formData.get('state'),
      approximateParticipants: formData.get('approximateParticipants'),
      primaryActivities: selectedActivities,
      additionalInfo: formData.get('additionalInfo'),
    };

    try {
      console.log("Organization registration data:", data);
      
      toast({
        title: "Registration Submitted!",
        description: "We'll contact you within 24 hours to get your organization set up.",
      });
      
      // Reset form
      e.currentTarget.reset();
      setSelectedActivities([]);
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
              <form onSubmit={onSubmit} className="space-y-6" data-testid="form-organization-registration">
                
                {/* Organization Type */}
                <div>
                  <Label htmlFor="organizationType">Organization Type *</Label>
                  <select 
                    id="organizationType"
                    name="organizationType"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="select-organization-type"
                  >
                    <option value="">Select your organization type</option>
                    <option value="school-district">School District</option>
                    <option value="charter-school">Charter School</option>
                    <option value="private-school">Private School</option>
                    <option value="church">Church/Religious Organization</option>
                    <option value="ymca-ywca">YMCA/YWCA</option>
                    <option value="boys-girls-club">Boys & Girls Club</option>
                    <option value="pony-league">Pony League</option>
                    <option value="pop-warner">Pop Warner</option>
                    <option value="youth-sports">Youth Sports Organization</option>
                    <option value="club-sports">Club Sports</option>
                    <option value="recreation-center">Recreation Center</option>
                    <option value="business-enterprise">Business Enterprise</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Organization Name */}
                  <div>
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input 
                      id="organizationName"
                      name="organizationName"
                      placeholder="Your organization name" 
                      required 
                      data-testid="input-organization-name" 
                    />
                  </div>

                  {/* Contact Name */}
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input 
                      id="contactName"
                      name="contactName"
                      placeholder="Your full name" 
                      required 
                      data-testid="input-contact-name" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Email */}
                  <div>
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input 
                      id="contactEmail"
                      name="contactEmail"
                      type="email" 
                      placeholder="your.email@organization.com" 
                      required 
                      data-testid="input-contact-email" 
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <Label htmlFor="contactPhone">Phone Number *</Label>
                    <Input 
                      id="contactPhone"
                      name="contactPhone"
                      type="tel" 
                      placeholder="(555) 123-4567" 
                      required 
                      data-testid="input-contact-phone" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* City */}
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city"
                      name="city"
                      placeholder="Your city" 
                      required 
                      data-testid="input-city" 
                    />
                  </div>

                  {/* State */}
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <select 
                      id="state"
                      name="state"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      data-testid="select-state"
                    >
                      <option value="">Select your state</option>
                      <option value="AL">Alabama</option>
                      <option value="AK">Alaska</option>
                      <option value="AZ">Arizona</option>
                      <option value="AR">Arkansas</option>
                      <option value="CA">California</option>
                      <option value="CO">Colorado</option>
                      <option value="CT">Connecticut</option>
                      <option value="DE">Delaware</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      <option value="HI">Hawaii</option>
                      <option value="ID">Idaho</option>
                      <option value="IL">Illinois</option>
                      <option value="IN">Indiana</option>
                      <option value="IA">Iowa</option>
                      <option value="KS">Kansas</option>
                      <option value="KY">Kentucky</option>
                      <option value="LA">Louisiana</option>
                      <option value="ME">Maine</option>
                      <option value="MD">Maryland</option>
                      <option value="MA">Massachusetts</option>
                      <option value="MI">Michigan</option>
                      <option value="MN">Minnesota</option>
                      <option value="MS">Mississippi</option>
                      <option value="MO">Missouri</option>
                      <option value="MT">Montana</option>
                      <option value="NE">Nebraska</option>
                      <option value="NV">Nevada</option>
                      <option value="NH">New Hampshire</option>
                      <option value="NJ">New Jersey</option>
                      <option value="NM">New Mexico</option>
                      <option value="NY">New York</option>
                      <option value="NC">North Carolina</option>
                      <option value="ND">North Dakota</option>
                      <option value="OH">Ohio</option>
                      <option value="OK">Oklahoma</option>
                      <option value="OR">Oregon</option>
                      <option value="PA">Pennsylvania</option>
                      <option value="RI">Rhode Island</option>
                      <option value="SC">South Carolina</option>
                      <option value="SD">South Dakota</option>
                      <option value="TN">Tennessee</option>
                      <option value="TX">Texas</option>
                      <option value="UT">Utah</option>
                      <option value="VT">Vermont</option>
                      <option value="VA">Virginia</option>
                      <option value="WA">Washington</option>
                      <option value="WV">West Virginia</option>
                      <option value="WI">Wisconsin</option>
                      <option value="WY">Wyoming</option>
                    </select>
                  </div>
                </div>

                {/* Participant Count */}
                <div>
                  <Label htmlFor="approximateParticipants">Approximate Number of Participants *</Label>
                  <select 
                    id="approximateParticipants"
                    name="approximateParticipants"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="select-participants"
                  >
                    <option value="">Select participant range</option>
                    <option value="10-25">10-25 participants</option>
                    <option value="26-50">26-50 participants</option>
                    <option value="51-100">51-100 participants</option>
                    <option value="101-200">101-200 participants</option>
                    <option value="201-500">201-500 participants</option>
                    <option value="500+">500+ participants</option>
                  </select>
                </div>

                {/* Primary Activities - Multi-select checkboxes */}
                <div>
                  <Label>Primary Activities/Categories * (Select all that apply)</Label>
                  <div className="grid md:grid-cols-2 gap-4 mt-2 p-4 border rounded-md" data-testid="checkbox-group-activities">
                    {[
                      { id: 'academic', label: 'Academic Competitions (UIL, Debate, Math, Science)' },
                      { id: 'athletic', label: 'Athletic Sports (Football, Basketball, Baseball, etc.)' },
                      { id: 'stem', label: 'STEM Competitions (Robotics, Engineering, Tech)' },
                      { id: 'fine-arts', label: 'Fine Arts (Band, Choir, Theater, Art)' },
                      { id: 'community', label: 'Community Events & Tournaments' },
                      { id: 'health-wellness', label: 'Health & Wellness Programs' },
                    ].map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={activity.id}
                          checked={selectedActivities.includes(activity.id)}
                          onChange={(e) => handleActivityChange(activity.id, e.target.checked)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          data-testid={`checkbox-${activity.id}`}
                        />
                        <Label htmlFor={activity.id} className="text-sm font-normal cursor-pointer">
                          {activity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedActivities.length === 0 && (
                    <p className="text-red-500 text-sm mt-1">Please select at least one activity category</p>
                  )}
                </div>

                {/* Additional Info */}
                <div>
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea 
                    id="additionalInfo"
                    name="additionalInfo"
                    placeholder="Tell us about any specific needs, current challenges, or questions you have about our platform"
                    data-testid="textarea-additional-info"
                  />
                </div>

                <div className="text-center pt-6">
                  <Button 
                    type="submit" 
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4"
                    disabled={isSubmitting || selectedActivities.length === 0}
                    data-testid="button-submit-registration"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Registration"}
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>By submitting this form, you agree to our terms of service and privacy policy.</p>
                  <p className="mt-2">We'll contact you within 24 hours to schedule your demo and discuss pricing options.</p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Comprehensive Pricing Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Complete Pricing Options for Every Organization
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto">
            Enterprise equality philosophy: Small organizations get identical features as large corporations. 
            Pricing differs by capacity and support level, never by feature quality.
          </p>
          
          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-6">
            
            {/* Freemium */}
            <Card className="relative">
              <CardHeader>
                <Badge className="w-fit bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Free Trial</Badge>
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription>30-day trial with full platform access</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    AI tournament builder with smart recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Budget management spreadsheets
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Basic organizational charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Health tracking dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    AI assistant on all data entry pages
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-orange-600" />
                    Limited: 2 tournaments, 50 participants
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Tournament Organizer */}
            <Card className="relative">
              <CardHeader>
                <Badge className="w-fit bg-green-100 text-green-800">Community Nonprofits</Badge>
                <CardTitle className="text-xl">$39/month</CardTitle>
                <CardDescription>Churches, youth organizations, small leagues</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Unlimited AI-powered tournament creation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Excel-style budget management system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Interactive organizational charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Basic health tracking & injury documentation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    AI assistant for all forms & data entry
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Custom branding & communication tools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Scheduling & scoring systems
                  </li>
                </ul>
                <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                  Annual: $399/year (2 months free)
                </div>
              </CardContent>
            </Card>

            {/* Champions District */}
            <Card className="relative border-green-500 border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <Badge className="w-fit bg-blue-100 text-blue-800">School Districts</Badge>
                <CardTitle className="text-xl">$2,490/year</CardTitle>
                <CardDescription>Champions District - up to 15 schools</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Complete district budget allocation system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Multi-school organizational chart builder
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    HIPAA/FERPA compliant data management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Athletic trainer dashboards with AI assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Comprehensive health monitoring system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    50+ UIL academic competition management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Emergency notification & communication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Role-based access & audit trails
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    White-label platform with custom domain
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Enterprise */}
            <Card className="relative">
              <CardHeader>
                <Badge className="w-fit bg-purple-100 text-purple-800">Business Enterprise</Badge>
                <CardTitle className="text-xl">$149/month</CardTitle>
                <CardDescription>For-profit tournament businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Complete white-label tournament platform
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Advanced budget & financial analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Multi-client organizational management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    AI-powered tournament optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Custom integrations & API access
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Multi-tenant architecture support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Revenue tracking & client billing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Priority support & dedicated success manager
                  </li>
                </ul>
                <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                  Annual: $1,499/year (2 months free)
                </div>
              </CardContent>
            </Card>

            {/* District Enterprise */}
            <Card className="relative border-blue-500 border-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Enterprise</Badge>
              </div>
              <CardHeader>
                <Badge className="w-fit bg-orange-100 text-orange-800">Large Districts</Badge>
                <CardTitle className="text-xl">$4,500/year</CardTitle>
                <CardDescription>15+ schools, 25,000+ students</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Unlimited schools & student capacity
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Enterprise budget management across all schools
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Advanced organizational chart system
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    All Champions District features included
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Enhanced AI capabilities & analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Custom integrations with existing systems
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Dedicated account manager & training
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    Custom development & feature requests
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    24/7 phone support & priority response
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise Plus */}
          <div className="mt-8">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-700">
              <CardHeader className="text-center">
                <Badge className="w-fit mx-auto bg-purple-600 text-white mb-2">Annual Pro</Badge>
                <CardTitle className="text-2xl">$990/month</CardTitle>
                <CardDescription className="text-lg">
                  High-volume tournament companies (50+ tournaments/year)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Unlimited Everything</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Unlimited tournaments & participants
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Unlimited custom domains
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Unlimited budget management systems
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Unlimited organizational charts
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Advanced AI Platform</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        AI assistants on every data entry page
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Advanced tournament optimization AI
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Predictive analytics & reporting
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Custom AI model training
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Enterprise Support</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Dedicated success team & account manager
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        24/7 priority support & custom training
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Custom development & integrations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        White-label platform with full customization
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Pricing Guarantee */}
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">Pricing Guarantee</h3>
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>"The price you pay at the time is the price you always pay"</strong> - Early adopters get permanent cost advantage with no surprise increases. 
                All organizations receive identical enterprise features regardless of size.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}