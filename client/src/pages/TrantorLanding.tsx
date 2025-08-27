import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Target, Building, CheckCircle, BarChart3, Clock, Smartphone } from "lucide-react";
import { useLocation } from "wouter";
import React, { useState } from "react";
import Footer from "@/components/Footer";
import RegistrationAssistant from "@/components/RegistrationAssistant";

export default function TrantorLanding() {
  const [, setLocation] = useLocation();
  const [isRegistrationAssistantOpen, setIsRegistrationAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900">
      {/* Professional Tournament Header */}
      <header className="relative border-b border-orange-500/20 bg-orange-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between lg:h-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full py-4 lg:py-0 space-y-4 lg:space-y-0">
              
              {/* Trantor Tournaments Logo */}
              <div className="flex items-center space-x-3 mb-5 lg:mb-0">
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 rounded-full">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Trantor Tournaments</h1>
                  <p className="text-xs text-orange-300">Professional Tournament Management</p>
                </div>
              </div>

              {/* Platform Status */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-orange-200">Live Platform</span>
                </div>
                <Badge variant="outline" className="border-orange-400 text-orange-300">
                  Commercial Ready
                </Badge>
              </div>

              {/* Start Tournament and Pricing Buttons */}
              <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3 lg:ml-auto">
                <Button 
                  onClick={() => setLocation('/create')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                  data-testid="button-start-tournament-trantor"
                >
                  <Trophy className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Start Tournament
                </Button>
                <Button 
                  onClick={() => setLocation('/pricing')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto border border-orange-500 shadow-lg"
                  data-testid="button-pricing-trantor"
                >
                  <CreditCard className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  View Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tournament Management Hero */}
      <div className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-transparent to-orange-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-orange-600 text-white px-4 py-2">
              🏆 Professional Tournament Platform
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Fantasy Sports &
              <span className="block text-orange-300">Tournament Management</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
              Join professional fantasy leagues with overnight scoring OR create your own traditional tournaments. Complete platform for organizers, businesses, and fantasy enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => setLocation('/fantasy-tournaments')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold border border-purple-500 shadow-lg"
                data-testid="button-join-fantasy"
              >
                <Target className="mr-2 h-5 w-5" />
                Join Fantasy Leagues
              </Button>
              <Button 
                size="lg"
                onClick={() => setLocation('/create')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold border border-orange-500 shadow-lg"
                data-testid="button-create-tournament"
              >
                <Trophy className="mr-2 h-5 w-5" />
                Create Tournament
              </Button>
            </div>
            <p className="text-orange-300 text-sm mt-4">
              Fantasy results update overnight at 2 AM - Family-friendly, sustainable fantasy sports
            </p>
          </div>
        </div>
      </div>

      {/* Tournament Types */}
      <div className="py-16 bg-orange-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Fantasy Sports & Tournament Management</h2>
            <p className="text-orange-200 text-lg">Professional fantasy leagues and traditional tournaments</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-purple-900/50 border-purple-600/30 ring-2 ring-purple-500">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Fantasy Sports</CardTitle>
                <CardDescription className="text-purple-200">
                  NFL Survivor, Daily Fantasy, Season-Long, Pick'em Leagues with overnight scoring
                </CardDescription>
                <Badge className="mt-3 bg-purple-600 text-white">Next-Day Results</Badge>
              </CardHeader>
            </Card>
            <Card className="bg-orange-900/50 border-orange-600/30">
              <CardHeader className="text-center">
                <Building className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Corporate Events</CardTitle>
                <CardDescription className="text-orange-200">
                  Team building competitions and company tournaments
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-900/50 border-orange-600/30">
              <CardHeader className="text-center">
                <Trophy className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Sports Tournaments</CardTitle>
                <CardDescription className="text-orange-200">
                  Youth leagues, adult competitions, and nonprofit fundraisers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Professional Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Professional Tournament Tools</h2>
            <p className="text-orange-200 text-lg">Everything you need to run successful tournaments</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-purple-900/30 border-purple-600/30">
              <CardHeader>
                <Target className="h-8 w-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Professional Fantasy</CardTitle>
                <CardDescription className="text-purple-200">
                  NFL, NBA, MLB fantasy leagues with Yahoo Sports data integration
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-900/30 border-orange-600/30">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Payment Processing</CardTitle>
                <CardDescription className="text-orange-200">
                  Integrated Stripe payments for entry fees and donations
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-900/30 border-orange-600/30">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Advanced Analytics</CardTitle>
                <CardDescription className="text-orange-200">
                  Comprehensive tournament analytics and participant insights
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-900/30 border-orange-600/30">
              <CardHeader>
                <Globe className="h-8 w-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Custom Domains</CardTitle>
                <CardDescription className="text-orange-200">
                  White-label tournaments with your own branding and domain
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-orange-900/30 border-orange-600/30">
              <CardHeader>
                <Smartphone className="h-8 w-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Mobile Optimized</CardTitle>
                <CardDescription className="text-orange-200">
                  Perfect mobile experience for participants and organizers
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-purple-900/30 border-purple-600/30">
              <CardHeader>
                <Clock className="h-8 w-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Overnight Scoring</CardTitle>
                <CardDescription className="text-purple-200">
                  Fantasy results update nightly at 2 AM - sustainable and family-friendly
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="py-16 bg-orange-800/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h2>
            <p className="text-orange-200 text-lg">From individual organizers to high-volume tournament companies</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-orange-900/50 border-orange-600/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Tournament Organizer</CardTitle>
                <CardDescription className="text-orange-200">Perfect for individual organizers</CardDescription>
                <div className="text-3xl font-bold text-orange-400 mt-4">$39<span className="text-lg text-orange-300">/month</span></div>
                <p className="text-sm text-orange-300">or $399/year (2 months free)</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Unlimited tournaments
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Payment processing
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Custom branding
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Mobile app experience
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-900/50 border-orange-600/30 ring-2 ring-orange-500">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Business Enterprise</CardTitle>
                <CardDescription className="text-orange-200">White-label platform for businesses</CardDescription>
                <div className="text-3xl font-bold text-orange-400 mt-4">$149<span className="text-lg text-orange-300">/month</span></div>
                <p className="text-sm text-orange-300">or $1,499/year</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Everything in Tournament Organizer
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Custom domain included
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Advanced analytics
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Priority support
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-900/50 border-orange-600/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Annual Pro</CardTitle>
                <CardDescription className="text-orange-200">High-volume tournament companies</CardDescription>
                <div className="text-3xl font-bold text-orange-400 mt-4">$990<span className="text-lg text-orange-300">/month</span></div>
                <p className="text-sm text-orange-300">50+ tournaments/year</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Unlimited capacity
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Dedicated support team
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Custom integrations
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Check payment option
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-orange-600/20 to-red-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready for Fantasy Sports & Tournaments?</h2>
          <p className="text-orange-200 text-lg mb-8">
            Join fantasy leagues with overnight scoring OR create your own traditional tournaments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation('/fantasy-tournaments')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold border border-purple-500 shadow-lg"
              data-testid="button-join-fantasy-cta"
            >
              <Target className="mr-2 h-5 w-5" />
              Join Fantasy Leagues
            </Button>
            <Button 
              size="lg"
              onClick={() => setLocation('/login/business')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-lg font-semibold border border-orange-500 shadow-lg"
              data-testid="button-business-signup"
            >
              <Building className="mr-2 h-5 w-5" />
              Business Signup
            </Button>
          </div>
        </div>
      </div>

      {/* Registration Assistant */}
      <RegistrationAssistant 
        isOpen={isRegistrationAssistantOpen} 
        setIsOpen={setIsRegistrationAssistantOpen} 
      />

      <Footer />
    </div>
  );
}