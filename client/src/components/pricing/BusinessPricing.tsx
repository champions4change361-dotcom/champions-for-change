import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, GraduationCap, Heart, Trophy, Users, Zap, Building } from 'lucide-react';

export function BusinessPricingSection() {
  const handleStartSupporting = () => {
    window.location.href = '/donation-signup?plan=donation-based&billing=monthly&price=50';
  };

  const handleContactUs = () => {
    const subject = 'Champions for Change - Tournament Management Inquiry';
    const body = 'Hello, I am interested in learning more about supporting Champions for Change while getting access to professional tournament management tools. Please provide more information about the donation-based model.';
    window.location.href = `mailto:Champions4change361@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <GraduationCap className="h-4 w-4" />
            Champions for Change Educational Mission
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fund Student Education, Get Professional Tournament Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-6">
            Our unified donation model means everyone gets the same professional tournament management platform while supporting educational opportunities for underprivileged students.
          </p>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
            <Heart className="h-4 w-4" />
            100% Tax-Deductible Charitable Donation
          </div>
        </div>

        {/* Main Donation Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-green-500 shadow-2xl bg-gradient-to-br from-white to-green-50">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 p-4 bg-green-100 rounded-full w-fit">
                <Trophy className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold mb-4 text-gray-900">
                Complete Tournament Management Platform
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Full enterprise features for everyone • No tiers, no restrictions • Pay what feels right
              </CardDescription>
              
              {/* Pricing Display */}
              <div className="mt-8 mb-6">
                <div className="text-5xl font-bold text-green-600 mb-2">$50</div>
                <div className="text-lg text-gray-600">per month • suggested donation</div>
                <div className="text-sm text-green-700 font-medium mt-2">Pay what feels right for your organization</div>
              </div>

              <Badge className="bg-yellow-100 text-yellow-800 text-base px-4 py-2">
                💚 Every dollar funds student educational opportunities
              </Badge>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited professional tournaments</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>All tournament formats (Single/Double/Round Robin/Swiss)</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Complete white-label branding & custom domains</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>AI-powered tournament creation & optimization</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited teams, players, and events</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Integrated payment processing via Stripe</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Professional webstore with custom merchandise</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Event ticket sales & revenue tracking</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Mobile-responsive tournament management</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Enterprise-grade security and data backup</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Advanced analytics & reporting suite</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Priority support & training included</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                  size="lg"
                  onClick={handleStartSupporting}
                  data-testid="button-start-supporting"
                >
                  💚 Start Supporting Students Today
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 text-lg py-6"
                  size="lg"
                  onClick={handleContactUs}
                  data-testid="button-contact-us"
                >
                  Questions? Contact Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Impact Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center border-green-200 bg-green-50">
            <CardContent className="p-6">
              <GraduationCap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Fund Education</h3>
              <p className="text-green-700 text-sm">
                Every donation directly funds educational trips and opportunities for underprivileged students in Corpus Christi, Texas.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Pay What Feels Right</h3>
              <p className="text-blue-700 text-sm">
                Our suggested $50/month can be adjusted up or down based on your organization's capacity to support our mission.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center border-purple-200 bg-purple-50">
            <CardContent className="p-6">
              <Building className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Enterprise Features</h3>
              <p className="text-purple-700 text-sm">
                Everyone gets the same premium tournament management tools, regardless of donation amount. No feature restrictions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Special Cases */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-8 border border-purple-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              Need Special Arrangements?
            </h3>
            <p className="text-purple-800 mb-6 max-w-3xl mx-auto">
              Large school districts, enterprise companies, or organizations needing special billing arrangements? 
              We offer flexible solutions while maintaining our commitment to educational support.
            </p>
            <Button 
              variant="outline" 
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
              onClick={handleContactUs}
              data-testid="button-enterprise-contact"
            >
              Contact Us for Enterprise Solutions
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}