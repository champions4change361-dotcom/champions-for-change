import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Target, Building, CheckCircle, BarChart3, Clock, Smartphone, Calendar, GraduationCap, Heart, Repeat } from "lucide-react";
import { useLocation } from "wouter";
import React, { useState } from "react";
import Footer from "@/components/Footer";
import RegistrationAssistant from "@/components/RegistrationAssistant";
import TrantorCoin from "@/components/TrantorCoin";
import LanguageSelector from "@/components/LanguageSelector";

export default function TrantorLanding() {
  const [, setLocation] = useLocation();
  const [isRegistrationAssistantOpen, setIsRegistrationAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Professional Tournament Header */}
      <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm pt-4 lg:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between lg:min-h-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full py-4 lg:py-0 space-y-4 lg:space-y-0">
              
              {/* Left Side: Logo and Text */}
              <div className="flex items-center space-x-4 mb-5 lg:mb-0">
                {/* Champions for Change Coin */}
                <div className="flex-shrink-0">
                  <TrantorCoin size="lg" />
                </div>
                
                {/* Header Text and Status */}
                <div className="flex flex-col">
                  <div>
                    <h1 className="text-xl font-bold text-white">Champions for Change</h1>
                    <p className="text-xs text-yellow-300 mb-2">Click coin to create account</p>
                  </div>
                  
                  {/* Platform Status */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-200">Live Platform</span>
                    </div>
                    <Badge variant="outline" className="border-yellow-400 text-yellow-300 w-fit">
                      Commercial Ready
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Trial and Action Buttons */}
              <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3 lg:ml-auto">
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={() => setLocation('/trial-signup?plan=monthly&price=39')}
                    className="bg-yellow-600 hover:bg-yellow-700 text-slate-900 font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                    data-testid="button-start-trial-trantor"
                  >
                    <Zap className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Start 14-Day Free Trial
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      try {
                        setLocation('/tournament-calendar');
                        setTimeout(() => {
                          if (window.location.pathname !== '/tournament-calendar') {
                            window.location.href = '/tournament-calendar';
                          }
                        }, 100);
                      } catch (error) {
                        window.location.href = '/tournament-calendar';
                      }
                    }}
                    className="bg-blue-700 hover:bg-blue-600 text-blue-200 font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto border border-blue-400 shadow-lg"
                    data-testid="button-see-tournaments"
                  >
                    <Calendar className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    See Local Tournaments
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      try {
                        setLocation('/login');
                        // Mobile fallback
                        setTimeout(() => {
                          if (window.location.pathname !== '/login') {
                            window.location.href = '/login';
                          }
                        }, 100);
                      } catch (error) {
                        window.location.href = '/login';
                      }
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-yellow-300 font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto border border-yellow-500 shadow-lg"
                    data-testid="button-signin-trantor"
                  >
                    <Trophy className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Sign In
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Donation Section - Support Students */}
      <div className="relative py-8 lg:py-12 mt-4 lg:mt-8 bg-gradient-to-r from-red-600/90 via-red-500/90 to-red-700/90 backdrop-blur-sm">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-8 w-8 text-white mr-3" />
            <h2 className="text-2xl lg:text-4xl font-bold text-white">Donate & Support Students</h2>
            <Heart className="h-8 w-8 text-white ml-3" />
          </div>
          
          <p className="text-lg lg:text-xl text-red-100 max-w-4xl mx-auto mb-8 leading-relaxed">
            <strong>Support educational opportunities for underprivileged student competitors.</strong> Every donation directly funds student travel experiences and educational programs.
          </p>
          
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <CreditCard className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">Cards</div>
              <div className="text-red-100 text-xs">Visa, MC, Amex</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Globe className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">PayPal</div>
              <div className="text-red-100 text-xs">Secure & Fast</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Users className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">Venmo</div>
              <div className="text-red-100 text-xs">Mobile Apps</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Smartphone className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">Apple Pay</div>
              <div className="text-red-100 text-xs">Touch/Face ID</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Smartphone className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">Google Pay</div>
              <div className="text-red-100 text-xs">Fingerprint</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Repeat className="h-6 w-6 text-white mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">Monthly</div>
              <div className="text-red-100 text-xs">Recurring</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-white font-semibold">100% to Students</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-white font-semibold">Tax Deductible</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <span className="text-white font-semibold">One-time/Monthly</span>
            </div>
          </div>

          <Button 
            onClick={(e) => {
              e.preventDefault();
              try {
                setLocation('/donate');
                setTimeout(() => {
                  if (window.location.pathname !== '/donate') {
                    window.location.href = '/donate';
                  }
                }, 100);
              } catch (error) {
                window.location.href = '/donate';
              }
            }}
            className="bg-white text-red-600 hover:bg-red-50 font-bold px-8 py-4 text-lg shadow-xl"
            data-testid="button-donate-here"
          >
            <Heart className="mr-3 h-5 w-5" />
            Donate Any Amount
          </Button>
        </div>
      </div>

      {/* Educational Mission Banner */}
      <div className="relative py-8 lg:py-12 mt-4 lg:mt-8 bg-gradient-to-r from-green-600/90 via-blue-600/90 to-purple-600/90 backdrop-blur-sm">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-yellow-300 mr-3" />
            <Badge className="bg-yellow-500 text-slate-900 px-4 py-2 text-base font-bold">
              🎓 Educational Impact Mission
            </Badge>
            <Heart className="h-8 w-8 text-red-300 ml-3" />
          </div>
          <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
            Supporting Student Education Through Tournament Management
          </h2>
          <p className="text-lg lg:text-xl text-green-100 max-w-4xl mx-auto mb-6 leading-relaxed">
            <strong>Champions for Change is dedicated to funding educational opportunities and student travel experiences</strong> for underprivileged student competitors. Every tournament managed on our platform directly supports these vital educational experiences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-yellow-300 mb-2">100%</div>
              <p className="text-white text-sm">Platform revenue supports student education</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-green-300 mb-2">$2,600+</div>
              <p className="text-white text-sm">Cost per student for educational travel trips</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-300 mb-2">Every Event</div>
              <p className="text-white text-sm">Directly funds student opportunities</p>
            </div>
          </div>
          <p className="text-green-200 text-sm mt-6 italic">
            Built by coaches who understand both tournament needs and student funding challenges
          </p>
        </div>
      </div>

      {/* Tournament Management Hero */}
      <div className="relative py-12 lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-transparent to-yellow-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center">
            <Badge className="mb-6 bg-yellow-600 text-slate-900 px-4 py-2">
              🏆 Professional Tournament Platform
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Tournament & Sports
              <span className="block text-orange-300">Administration System</span>
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-6">
              Professional tournament management and sports administration platform. Complete system for schools, organizations, and tournament directors to manage events, participants, scheduling, and operations.
            </p>
            <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-yellow-300 mb-2">🎯 Start Your 14-Day Free Trial</h3>
              <p className="text-yellow-100 mb-4">Full platform access • No credit card charged until trial ends</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setLocation('/trial-signup?plan=annual&price=99')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3"
                  data-testid="button-annual-trial"
                >
                  Annual Tournament - $99/year
                </Button>
                <Button 
                  onClick={() => setLocation('/trial-signup?plan=monthly&price=39')}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3"
                  data-testid="button-monthly-trial"
                >
                  Multi-Tournament - $39/month
                </Button>
              </div>
              
            </div>

            {/* Team Management Section - NEW */}
            <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-6 mb-8 max-w-4xl mx-auto mt-12">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-300 mb-2">🏆 Team Management & Communication</h3>
                <p className="text-blue-100 mb-1">For Coaches & Team Managers - No Tournament Experience Required</p>
                <p className="text-sm text-blue-200">Pricing based on team size & communication needs • Tournament hosting included with optional $50/tournament unlimited add-on</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {/* Starter Team */}
                <div className="bg-green-900/30 border border-green-500/40 rounded-lg p-5 text-center">
                  <h4 className="text-lg font-bold text-green-300 mb-2">Starter Team</h4>
                  <div className="text-2xl font-bold text-green-400 mb-1">$23<span className="text-sm text-green-300">/month</span></div>
                  <p className="text-xs text-green-200 mb-3">Paid annually ($276/year)</p>
                  <ul className="text-sm text-green-100 space-y-1 mb-4">
                    <li>• Up to 20 players</li>
                    <li>• 1 professional tournament per year included</li>
                    <li>• Additional tournaments: $25 each (vs $50+ elsewhere)</li>
                    <li>• 400 communications/month</li>
                    <li>• Smart seeding algorithm (not random brackets)</li>
                  </ul>
                  <Button 
                    onClick={() => setLocation('/team-signup?plan=starter&price=23')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2"
                    data-testid="button-starter-team"
                  >
                    Start Team Trial
                  </Button>
                </div>

                {/* Growing Team */}
                <div className="bg-blue-900/40 border-2 border-blue-400/60 rounded-lg p-5 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-3 py-1">Most Popular</Badge>
                  </div>
                  <h4 className="text-lg font-bold text-blue-300 mb-2 mt-2">Growing Team</h4>
                  <div className="text-2xl font-bold text-blue-400 mb-1">$39<span className="text-sm text-blue-300">/month</span></div>
                  <p className="text-xs text-blue-200 mb-3">Paid annually ($468/year)</p>
                  <ul className="text-sm text-blue-100 space-y-1 mb-4">
                    <li>• Up to 35 players</li>
                    <li>• 5 professional tournaments per year included</li>
                    <li>• Additional tournaments: $25 each (50% less than competitors)</li>
                    <li>• 4,000 communications/month</li>
                    <li>• Pool Play, Double Elimination, Round Robin formats</li>
                  </ul>
                  <Button 
                    onClick={() => setLocation('/team-signup?plan=growing&price=39')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
                    data-testid="button-growing-team"
                  >
                    Start Team Trial
                  </Button>
                </div>

                {/* Elite Program */}
                <div className="bg-purple-900/30 border border-purple-500/40 rounded-lg p-5 text-center">
                  <h4 className="text-lg font-bold text-purple-300 mb-2">Elite Program</h4>
                  <div className="text-2xl font-bold text-purple-400 mb-1">$63<span className="text-sm text-purple-300">/month</span></div>
                  <p className="text-xs text-purple-200 mb-3">Annual only ($756/year)</p>
                  <ul className="text-sm text-purple-100 space-y-1 mb-4">
                    <li>• Unlimited players & teams</li>
                    <li>• 10 professional tournaments per year included</li>
                    <li>• Additional tournaments: $25 each (enterprise pricing for everyone)</li>
                    <li>• 16,000 communications/month</li>
                    <li>• Swiss System, Leaderboards, Multi-division management</li>
                  </ul>
                  <Button 
                    onClick={() => setLocation('/team-signup?plan=elite&price=63')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2"
                    data-testid="button-elite-program"
                  >
                    Start Team Trial
                  </Button>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-sm text-blue-200">
                  💡 <strong>20% less than competitors</strong> • Communication limits scale with team size • Cancel anytime
                </p>
              </div>
            </div>

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
                variant="default"
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
            <h2 className="text-3xl font-bold text-white mb-4">Professional Tournament & Sports Administration</h2>
            <p className="text-orange-200 text-lg">Fun-only fantasy leagues and traditional tournaments (no gambling)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-purple-900/50 border-purple-600/30 ring-2 ring-purple-500">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Tournament Administration</CardTitle>
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
                <CardTitle className="text-white">Sports Management</CardTitle>
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
            <h2 className="text-3xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-orange-200 text-lg">Choose your plan based on tournament frequency - Start with 14-day free trial</p>
            <div className="mt-4 bg-green-600/20 border border-green-500/50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-300 font-semibold">🛡️ No Hidden Fees • Cancel Anytime • Full Access During Trial</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-blue-900/50 border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Annual Tournament</CardTitle>
                <CardDescription className="text-blue-200">Perfect for organizations running one tournament per year</CardDescription>
                <div className="text-4xl font-bold text-blue-400 mt-4">$99<span className="text-lg text-blue-300">/year</span></div>
                <p className="text-sm text-blue-300">Just $8.25/month • Year-round hosting included</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  One tournament per year
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Year-round website hosting
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Full platform access (no restrictions)
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Payment processing & registration
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Professional branding & white-label
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={() => setLocation('/trial-signup?plan=annual&price=99')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    data-testid="button-start-annual-trial-2"
                  >
                    Start 14-Day Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-900/50 border-orange-600/30 ring-2 ring-orange-500">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl text-white">Multi-Tournament</CardTitle>
                    <CardDescription className="text-orange-200">For active tournament organizers</CardDescription>
                  </div>
                  <Badge className="bg-orange-600 text-white">Most Popular</Badge>
                </div>
                <div className="text-4xl font-bold text-orange-400 mt-4">$39<span className="text-lg text-orange-300">/month</span></div>
                <p className="text-sm text-orange-300">For organizers running multiple tournaments</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Unlimited tournaments
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Full platform access (no restrictions)
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Advanced analytics & reporting
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Priority community support
                </div>
                <div className="flex items-center text-orange-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  White-label tournament experience
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={() => setLocation('/trial-signup?plan=monthly&price=39')}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                    data-testid="button-start-monthly-trial-2"
                  >
                    Start 14-Day Free Trial
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <p className="text-orange-200 mb-4">Need enterprise features for larger organizations?</p>
            <Button 
              onClick={() => setLocation('/pricing')}
              variant="outline"
              className="border-orange-500 text-orange-300 hover:bg-orange-500/10"
              data-testid="button-view-enterprise-2"
            >
              View Enterprise Plans
            </Button>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-orange-600/20 to-red-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready for Professional Tournament Management?</h2>
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