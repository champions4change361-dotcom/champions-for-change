import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Target, Building, CheckCircle, BarChart3, Clock, Smartphone, Calendar } from "lucide-react";
import { useLocation } from "wouter";
import React, { useState } from "react";
import Footer from "@/components/Footer";
import RegistrationAssistant from "@/components/RegistrationAssistant";
import TrantorCoin from "@/components/TrantorCoin";

export default function TrantorLanding() {
  const [, setLocation] = useLocation();
  const [isRegistrationAssistantOpen, setIsRegistrationAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Professional Tournament Header */}
      <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between lg:h-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full py-4 lg:py-0 space-y-4 lg:space-y-0">
              
              {/* Trantor Tournaments Logo */}
              <div className="flex items-center space-x-3 mb-5 lg:mb-0">
                <TrantorCoin size="lg" />
                <div>
                  <h1 className="text-xl font-bold text-white">Champions for Change</h1>
                  <p className="text-xs text-yellow-300">Click coin to create account</p>
                </div>
              </div>

              {/* Platform Status */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-200">Live Platform</span>
                </div>
                <Badge variant="outline" className="border-yellow-400 text-yellow-300">
                  Commercial Ready
                </Badge>
              </div>

              {/* Start Tournament and Pricing Buttons */}
              <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3 lg:ml-auto">
                <Button 
                  onClick={() => setLocation('/login')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                  data-testid="button-start-tournament-trantor"
                >
                  <Trophy className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Sign In
                </Button>
                <Button 
                  onClick={() => setLocation('/smart-signup?type=individual')}
                  className="bg-slate-700 hover:bg-slate-600 text-yellow-300 font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto border border-yellow-500 shadow-lg"
                  data-testid="button-signup-trantor"
                >
                  <CreditCard className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Sign Up
                </Button>
                <Button 
                  onClick={() => setLocation('/tournament-calendar')}
                  className="bg-blue-700 hover:bg-blue-600 text-blue-200 font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto border border-blue-400 shadow-lg"
                  data-testid="button-see-tournaments"
                >
                  <Calendar className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  See Local Tournaments
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tournament Management Hero */}
      <div className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-transparent to-yellow-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-yellow-600 text-slate-900 px-4 py-2">
              🏆 Professional Tournament Platform
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Fantasy Sports &
              <span className="block text-orange-300">Tournament Management</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
              Join recreational fantasy leagues (for fun only) with overnight scoring OR create your own traditional tournaments. Complete platform for organizers, businesses, and fantasy enthusiasts.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <TrantorCoin
                size="lg"
                variant="fantasy"
                topText="Join Fantasy Leagues"
                bottomText="Recreational Fun Only"
                redirectTo="/fantasy-tournaments"
                data-testid="coin-join-fantasy"
              />
              <TrantorCoin
                size="lg"
                variant="tournament"
                topText="Start Tournament Platform"
                bottomText="Sign Up & Get Started"
                redirectTo="/tournament-onboarding"
                data-testid="coin-start-platform"
              />
              <TrantorCoin
                size="lg"
                variant="local"
                topText="Texas Coastal Bend"
                bottomText="Champions for Change Events"
                redirectTo="/local-tournaments"
                data-testid="coin-local-tournaments"
              />
            </div>
            <p className="text-orange-300 text-sm mt-4">
              Fantasy results update overnight at 2 AM - Family-friendly recreational fun (not gambling)
            </p>
          </div>
        </div>
      </div>

      {/* Tournament Types */}
      <div className="py-16 bg-orange-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Recreational Fantasy & Tournament Management</h2>
            <p className="text-orange-200 text-lg">Fun-only fantasy leagues and traditional tournaments (no gambling)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-purple-900/50 border-purple-600/30 ring-2 ring-purple-500">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Recreational Fantasy</CardTitle>
                <CardDescription className="text-purple-200">
                  NFL Survivor, Daily Fantasy, Season-Long, Pick'em Leagues - For Fun Only (No Gambling)
                </CardDescription>
                <Badge className="mt-3 bg-purple-600 text-white">Educational & Fun</Badge>
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
                <CardTitle className="text-white">Recreational Fantasy</CardTitle>
                <CardDescription className="text-purple-200">
                  NFL, NBA, MLB fantasy leagues for fun only - Yahoo Sports data integration (no gambling)
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
          <div className="flex flex-col sm:flex-row gap-12 justify-center items-center">
            <TrantorCoin
              size="lg"
              variant="fantasy"
              topText="Join Fantasy Leagues"
              bottomText="Fantasy Sports"
              redirectTo="/fantasy-tournaments"
              data-testid="coin-join-fantasy-cta"
            />
            <TrantorCoin
              size="lg"
              variant="tournament"
              topText="Business Signup"
              bottomText="Enterprise Platform"
              redirectTo="/login/business"
              data-testid="coin-business-signup"
            />
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