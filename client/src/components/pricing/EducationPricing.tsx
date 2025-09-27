import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, GraduationCap, Heart, Trophy, Users, Shield, Target } from 'lucide-react';

export function EducationPricingSection() {
  const handleStartSupporting = () => {
    window.location.href = '/donation-signup?plan=donation-based&billing=monthly&price=50';
  };

  const handleContactUs = () => {
    const subject = 'Champions for Change - Educational Institution Inquiry';
    const body = 'Hello, I represent an educational institution and am interested in learning more about supporting Champions for Change while getting access to comprehensive athletic management tools. Please provide more information about the donation-based model and any special educational arrangements.';
    window.location.href = `mailto:Champions4change361@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <GraduationCap className="h-4 w-4" />
            Champions for Change Educational Platform
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Support Student Education, Get Complete Athletic Management
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
            Our unified donation model provides the same comprehensive athletic management platform to all educational institutions while funding educational opportunities for underprivileged students.
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Heart className="h-4 w-4" />
            Education Supporting Education • 100% Tax-Deductible
          </div>
        </div>

        {/* Main Donation Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-green-500 shadow-2xl bg-gradient-to-br from-white to-green-50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold mb-4 text-gray-900">
                Complete Educational Athletic Management
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Full enterprise platform for all schools • No restrictions • Pay what feels right for your institution
              </CardDescription>
              
              {/* Pricing Display */}
              <div className="mt-8 mb-6">
                <div className="text-5xl font-bold text-green-600 mb-2">$50</div>
                <div className="text-lg text-gray-600">per month • suggested donation</div>
                <div className="text-sm text-green-700 font-medium mt-2">Adjust based on your school's capacity to support our mission</div>
              </div>

              <Badge className="bg-yellow-100 text-yellow-800 text-base px-4 py-2">
                💚 Education supporting education • Every dollar helps students
              </Badge>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Complete athletic program management</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Comprehensive injury tracking & HIPAA compliance</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Equipment inventory & management system</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Smart scheduling with conflict detection</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Parent/athlete communication portal</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>UIL compliance tracking & reporting</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited tournaments & athletic events</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>School merchandise store with custom branding</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Event ticket management & revenue tracking</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Emergency notification system</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Role-based access (Athletic Director → Student)</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Advanced analytics & compliance reporting</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                  size="lg"
                  onClick={handleStartSupporting}
                  data-testid="button-start-supporting-education"
                >
                  💚 Start Supporting Students Today
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 text-lg py-6"
                  size="lg"
                  onClick={handleContactUs}
                  data-testid="button-contact-education"
                >
                  Questions? Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Mission Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center border-green-200 bg-green-50">
            <CardContent className="p-6">
              <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Education Supporting Education</h3>
              <p className="text-green-700 text-sm">
                Your school's support directly funds educational trips and opportunities for underprivileged students in Corpus Christi, Texas.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Flexible Donations</h3>
              <p className="text-blue-700 text-sm">
                Whether you're a small private school or large institution, adjust your donation to match your capacity while getting full features.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Complete Compliance</h3>
              <p className="text-purple-700 text-sm">
                HIPAA/FERPA compliant, UIL tracking, emergency systems, and everything your athletic program needs.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* District Enterprise Note */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 border border-purple-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              Large School Districts & Enterprise Needs?
            </h3>
            <p className="text-purple-800 mb-6 max-w-3xl mx-auto">
              Multi-school districts, large educational institutions, or organizations needing special compliance requirements? 
              We offer enterprise solutions while maintaining our commitment to educational support.
            </p>
            <Button 
              variant="outline" 
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={handleContactUs}
              data-testid="button-district-enterprise"
            >
              Contact Us for District & Enterprise Solutions
            </Button>
          </div>
        </div>

        {/* Educational Impact */}
        <div className="text-center mt-12 bg-white rounded-lg p-8 shadow-md border border-green-200">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            🎓 Educational Impact Guarantee
          </h3>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Every subscription directly supports Champions for Change, funding educational 
            trips and opportunities for students. We've already funded over $15,000 in student educational experiences!
          </p>
        </div>
      </div>
    </section>
  );
}