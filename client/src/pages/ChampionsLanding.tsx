import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Heart, GraduationCap, BookOpen, Award, Globe, Star, Target, Shield, Check, Building } from "lucide-react";
import { useLocation } from "wouter";
import React, { useState } from "react";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";
import championVideo from "@assets/Champions for Change Logo_1755291031903.mp4";
import { DonationSection } from "@/components/DonationSection";
import { SignupSection } from "@/components/SignupSection";
import Footer from "@/components/Footer";
import RegistrationAssistant from "@/components/RegistrationAssistant";

export default function ChampionsLanding() {
  const [, setLocation] = useLocation();
  const [isRegistrationAssistantOpen, setIsRegistrationAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Champions for Change Header */}
      <header className="relative border-b border-green-500/20 bg-green-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between lg:h-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full py-4 lg:py-0 space-y-4 lg:space-y-0">
              
              {/* Champions Logo Section */}
              <div className="flex items-center space-x-3 mb-5 lg:mb-0">
                <div className="w-16 h-16 flex items-center justify-center">
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover rounded-full"
                    data-testid="champions-logo-video-header"
                  >
                    <source src={championVideo} type="video/mp4" />
                    <img src={championLogo} alt="Champions for Change" className="w-full h-full object-cover rounded-full" />
                  </video>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Champions for Change</h1>
                  <p className="text-xs text-green-300">Empowering Educational Opportunities</p>
                </div>
              </div>

              {/* Live Mission Status */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-200">Supporting Students</span>
                </div>
                <Badge variant="outline" className="border-green-400 text-green-300">
                  Nonprofit Mission
                </Badge>
              </div>

              {/* Donation, Login, and Get Involved Buttons */}
              <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3 lg:ml-auto">
                <Button 
                  onClick={() => setLocation('/donate')}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto border border-green-500"
                  data-testid="button-donate-champions"
                >
                  <Heart className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Donate Now
                </Button>
                <Button 
                  onClick={() => setLocation('/login-portal')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto border border-emerald-500"
                  data-testid="button-login-champions"
                >
                  <Trophy className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  <span className="lg:hidden">Login</span>
                  <span className="hidden lg:inline">Login to Platform</span>
                </Button>
                <Button 
                  onClick={() => setLocation('/register')}
                  variant="outline"
                  className="border-green-400 text-green-300 hover:bg-green-500/10 hover:border-green-300 px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base font-semibold w-full lg:w-auto"
                  data-testid="button-get-involved-champions"
                >
                  <Users className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Get Involved
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Two-Path Hero Section */}
      <div className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-transparent to-green-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-green-600 text-white px-4 py-2">
              🎓 Champions for Change
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Which describes you?
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto mb-12">
              Choose your path to get started with Champions for Change
            </p>
            
            {/* Two-Path Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Tournament Organizer Path */}
              <div className="bg-green-800/40 backdrop-blur-sm border border-green-600/30 rounded-2xl p-8 hover:bg-green-700/50 transition-all duration-300">
                <div className="text-center">
                  <Trophy className="h-16 w-16 text-green-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">I'm a Tournament Organizer</h2>
                  <p className="text-green-200 mb-6">
                    I want to license tournament management technology or learn about white-label platform solutions
                  </p>
                  <div className="space-y-3">
                    <Button 
                      size="lg"
                      onClick={() => setLocation('/login/organizer')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold w-full border border-emerald-500 shadow-lg"
                      data-testid="button-tournament-organizer-login"
                    >
                      <Trophy className="mr-2 h-5 w-5" />
                      Access Tournament Dashboard
                    </Button>
                    <Button 
                      size="lg"
                      onClick={() => setLocation('/smart-signup?type=individual')}
                      variant="outline"
                      className="border-green-400 text-green-300 hover:bg-green-500/10 hover:border-green-300 px-8 py-4 text-lg font-semibold w-full"
                      data-testid="button-tournament-organizer-signup"
                    >
                      <Building className="mr-2 h-5 w-5" />
                      Get Platform Solutions
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tournament Participant Path */}
              <div className="bg-green-800/40 backdrop-blur-sm border border-green-600/30 rounded-2xl p-8 hover:bg-green-700/50 transition-all duration-300">
                <div className="text-center">
                  <Users className="h-16 w-16 text-green-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">Register for Tournaments</h2>
                  <p className="text-green-200 mb-6">
                    I want to sign up my child/team for Champions for Change basketball tournaments that support education
                  </p>
                  <Button 
                    size="lg"
                    onClick={() => setLocation('/tournaments')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold w-full border border-emerald-500 shadow-lg"
                    data-testid="button-register-tournament"
                  >
                    <Award className="mr-2 h-5 w-5" />
                    View Tournaments
                  </Button>
                </div>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => setLocation('/your-why')}
                className="border-green-400 bg-green-900/50 text-green-100 hover:bg-green-700 hover:text-white px-6 py-3 text-base"
                data-testid="button-our-mission"
              >
                <Heart className="mr-2 h-4 w-4" />
                Our Mission Story
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/donate')}
                className="border-green-400 bg-green-900/50 text-green-100 hover:bg-green-700 hover:text-white px-6 py-3 text-base"
                data-testid="button-support-mission"
              >
                <Heart className="mr-2 h-4 w-4" />
                Support Our Mission
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="py-16 bg-green-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Making a Real Difference</h2>
            <p className="text-green-200 text-lg">Every tournament creates educational opportunities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-green-900/50 border-green-600/30">
              <CardHeader className="text-center">
                <GraduationCap className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Educational Trips</CardTitle>
                <CardDescription className="text-green-200">
                  Funding field trips and educational experiences
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-900/50 border-green-600/30">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Student Programs</CardTitle>
                <CardDescription className="text-green-200">
                  Supporting academic competitions and enrichment
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-900/50 border-green-600/30">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Tournament Fundraisers</CardTitle>
                <CardDescription className="text-green-200">
                  12U-14U basketball tournaments that give back
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Platform Features for Nonprofit */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Comprehensive Platform for Good</h2>
            <p className="text-green-200 text-lg">Everything you need to run successful charity tournaments</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-green-900/30 border-green-600/30">
              <CardHeader>
                <Trophy className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Charity Tournaments</CardTitle>
                <CardDescription className="text-green-200">
                  12U-14U basketball fundraisers with professional management
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-900/30 border-green-600/30">
              <CardHeader>
                <Target className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Fantasy Fundraising</CardTitle>
                <CardDescription className="text-green-200">
                  FREE NFL Survivor pools that drive donations to education
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-900/30 border-green-600/30">
              <CardHeader>
                <Globe className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Community Impact</CardTitle>
                <CardDescription className="text-green-200">
                  Local tournaments that build community and fund education
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-900/30 border-green-600/30">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Transparent Mission</CardTitle>
                <CardDescription className="text-green-200">
                  100% transparency on how funds support student opportunities
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-900/30 border-green-600/30">
              <CardHeader>
                <Users className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Volunteer Network</CardTitle>
                <CardDescription className="text-green-200">
                  Connect with coaches and volunteers who share your mission
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-green-900/30 border-green-600/30">
              <CardHeader>
                <Star className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Student Recognition</CardTitle>
                <CardDescription className="text-green-200">
                  Celebrate achievements and inspire educational excellence
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-green-600/20 to-emerald-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Still Not Sure Which Path?</h2>
          <p className="text-green-200 text-lg mb-8">
            Get personalized recommendations based on your specific needs and goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setIsRegistrationAssistantOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold border border-green-500 shadow-lg"
              data-testid="button-get-help"
            >
              <Users className="mr-2 h-5 w-5" />
              Get Personalized Help
            </Button>
            <Button 
              size="lg"
              onClick={() => setLocation('/donate')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold border border-emerald-500 shadow-lg"
              data-testid="button-donate-cta"
            >
              <Heart className="mr-2 h-5 w-5" />
              Support Education
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