import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, Clock, Shield, Heart, Brain, Activity, CheckCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function HealthDemo() {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactName: '',
    email: '',
    phone: '',
    organizationType: '',
    currentChallenges: '',
    preferredTime: '',
    attendees: '1-5'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Demo Scheduled Successfully!",
        description: "We'll contact you within 24 hours to confirm your personalized health monitoring demo.",
      });
      setIsSubmitting(false);
      
      // Reset form
      setFormData({
        organizationName: '',
        contactName: '',
        email: '',
        phone: '',
        organizationType: '',
        currentChallenges: '',
        preferredTime: '',
        attendees: '1-5'
      });
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/health-benefits">
              <Button variant="ghost" className="flex items-center gap-2" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Back to Health Benefits
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Personalized Demo
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Demo Information */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <Heart className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Health Monitoring Demo</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">See our AI-powered health system in action</p>
                </div>
              </div>
            </div>

            {/* What You'll See */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  What You'll Experience in Your Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">AI-Powered Injury Prediction</h4>
                    <p className="text-sm text-gray-600">See how our AI analyzes patterns to predict and prevent injuries before they happen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">HIPAA/FERPA Compliance</h4>
                    <p className="text-sm text-gray-600">Understand how we protect sensitive health data with enterprise-grade security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Real-Time Health Analytics</h4>
                    <p className="text-sm text-gray-600">View live dashboards showing athlete health trends and risk assessments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Custom Implementation Plan</h4>
                    <p className="text-sm text-gray-600">Get a personalized roadmap for implementing health monitoring in your organization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">30 min</div>
                  <div className="text-sm text-gray-600">Demo Duration</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">95%</div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Testimonial */}
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <blockquote className="mt-3 text-gray-700 dark:text-gray-300 italic">
                  "The demo showed us exactly how we could prevent injuries and save costs. We implemented the health monitoring system the next week."
                </blockquote>
                <footer className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                  — Dr. Sarah Martinez, Athletic Director, Lincoln ISD
                </footer>
              </CardContent>
            </Card>
          </div>

          {/* Scheduling Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Your Demo
              </CardTitle>
              <CardDescription>
                Fill out this form and we'll contact you within 24 hours to schedule your personalized health monitoring demonstration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Organization Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name *</Label>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => handleChange('organizationName', e.target.value)}
                      placeholder="e.g., Lincoln High School, YMCA, ABC Corporation"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="organizationType">Organization Type *</Label>
                    <Select value={formData.organizationType} onValueChange={(value) => handleChange('organizationType', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school_district">School District</SelectItem>
                        <SelectItem value="private_school">Private School</SelectItem>
                        <SelectItem value="community_nonprofit">Community Nonprofit (Church, YMCA, etc.)</SelectItem>
                        <SelectItem value="business_enterprise">Business Enterprise</SelectItem>
                        <SelectItem value="youth_organization">Youth Sports Organization</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactName">Contact Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => handleChange('contactName', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your.email@organization.com"
                      required
                    />
                  </div>
                </div>

                {/* Demo Preferences */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredTime">Preferred Time</Label>
                      <Select value={formData.preferredTime} onValueChange={(value) => handleChange('preferredTime', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select preferred time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                          <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                          <SelectItem value="flexible">I'm flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="attendees">Expected Attendees</Label>
                      <Select value={formData.attendees} onValueChange={(value) => handleChange('attendees', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Number of attendees" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5">1-5 people</SelectItem>
                          <SelectItem value="6-10">6-10 people</SelectItem>
                          <SelectItem value="11-20">11-20 people</SelectItem>
                          <SelectItem value="20+">20+ people</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="currentChallenges">Current Health/Safety Challenges (Optional)</Label>
                    <Textarea
                      id="currentChallenges"
                      value={formData.currentChallenges}
                      onChange={(e) => handleChange('currentChallenges', e.target.value)}
                      placeholder="Tell us about any specific health monitoring or safety challenges you're facing..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.organizationName || !formData.contactName || !formData.email}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    data-testid="button-schedule-demo"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule My Demo
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  * Required fields. We'll never share your information with third parties.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}