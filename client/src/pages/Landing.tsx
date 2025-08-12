import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Heart, GraduationCap, MapPin, Award, Mail, Phone, Timer, UserCheck, Shield } from "lucide-react";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";
import { DonationSection } from "@/components/DonationSection";
import { SignupSection } from "@/components/SignupSection";
import { CrossPlatformPromotion } from "@/components/CrossPlatformPromotion";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Stadium Lighting Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
        <header className="relative border-b border-yellow-500/20 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Arena Logo */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-2 rounded-lg shadow-lg">
                  <Trophy className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Champions for Change</h1>
                  <p className="text-xs text-yellow-400">Tournament Management Platform</p>
                </div>
              </div>

              {/* Live Status Bar */}
              <div className="hidden md:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">Live Platform</span>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold"
                data-testid="button-login"
              >
                Enter Arena
              </Button>
            </div>
          </div>
        </header>
      </div>

      {/* Mission Banner */}
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Heart className="h-4 w-4" />
            <span>Built by coaches to fund educational opportunities for underprivileged youth in Corpus Christi, Texas</span>
            <MapPin className="h-4 w-4" />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Champions Welcome */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl border border-yellow-500/30 mb-12">
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-4 w-40 h-40 bg-yellow-400/3 rounded-full blur-3xl"></div>
          </div>
          <div className="relative p-12 text-center">
            <Badge className="mb-6 bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/20">
              <GraduationCap className="h-3 w-3 mr-1" />
              Supporting Student Education Through Sports
            </Badge>
            
            <h1 className="text-6xl font-bold text-white mb-6">
              Tournament Platform That <span className="text-yellow-400">Champions Change</span>
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto">
              Professional tournament management platform built by coaches who identified needs in the tournament world. 
              Every subscription helps fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
            </p>

            <div className="flex gap-6 justify-center">
              <Button 
                size="lg" 
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-8 py-4 text-lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-get-started"
              >
                Start Supporting Students
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-400 px-8 py-4 text-lg"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        
        {/* Impact Mission Command Center */}
        <div className="bg-slate-800 border border-emerald-500/30 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Our Impact Mission</h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Revenue from this platform directly funds educational trips and opportunities for underprivileged youth. 
              When you choose our tournament management solution, you're not just organizing competitions—you're championing change in young lives.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-3 text-yellow-400" />
                Leadership
              </h4>
              <div className="text-slate-300">
                <p className="font-semibold text-white text-lg">Daniel Thornton</p>
                <p className="text-yellow-400 font-medium mb-2">Executive Director of Champions for Change</p>
                <p className="text-sm">21 years military service (Marines & Army) • Teaching & coaching at Robert Driscoll Middle School since 2016</p>
              </div>
            </div>
            
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-3 text-emerald-400" />
                Contact
              </h4>
              <div className="text-slate-300 space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-emerald-400" />
                  <a 
                    href="mailto:Champions4change361@gmail.com" 
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                    data-testid="hero-email-link"
                  >
                    Champions4change361@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-emerald-400" />
                  <a 
                    href="tel:361-300-1552" 
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                    data-testid="hero-phone-link"
                  >
                    (361) 300-1552
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Stats Arena */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl text-white py-12 mb-12">
          <div className="text-center px-8">
            <h2 className="text-4xl font-bold mb-8">Making a Real Difference</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-emerald-700/30 rounded-xl p-6">
                <div className="text-4xl font-bold mb-2 text-yellow-400">$2,600+</div>
                <div className="text-emerald-100">Per student trip cost</div>
              </div>
              <div className="bg-emerald-700/30 rounded-xl p-6">
                <div className="text-4xl font-bold mb-2 text-yellow-400">100%</div>
                <div className="text-emerald-100">Profit goes to education</div>
              </div>
              <div className="bg-emerald-700/30 rounded-xl p-6">
                <div className="text-4xl font-bold mb-2 text-yellow-400">65+</div>
                <div className="text-emerald-100">Sports supported</div>
              </div>
              <div className="bg-emerald-700/30 rounded-xl p-6">
                <div className="text-4xl font-bold mb-2 text-yellow-400">5-15</div>
                <div className="text-emerald-100">Students funded annually</div>
              </div>
            </div>
            <div className="mt-8 text-emerald-200 text-lg">
              With just 10 Champion subscribers, we can fund one complete student trip per year
            </div>
          </div>
        </div>

        {/* Features Arena */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Professional Tournament Management
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built by coaches who understand the tournament world. Every feature designed to streamline your competitions while supporting student education.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-6 hover:border-emerald-400/50 transition-all">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Creation</h3>
                <p className="text-slate-400">
                  Generate complete tournaments instantly with our AI consultation system across 65+ sports
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-6 hover:border-blue-400/50 transition-all">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">White-Label Ready</h3>
                <p className="text-slate-400">
                  Launch under your brand with custom domains, colors, logos, and complete customization
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-6 hover:border-purple-400/50 transition-all">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Multi-Tier Management</h3>
                <p className="text-slate-400">
                  Five-tier user hierarchy reflecting real school district structure and roles
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-400/50 transition-all">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Stripe Integration</h3>
                <p className="text-slate-400">
                  Secure payment processing with real-time donation tracking for student funding
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-red-500/30 rounded-xl p-6 hover:border-red-400/50 transition-all">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Timer className="h-6 w-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Real-Time Updates</h3>
                <p className="text-slate-400">
                  Live match tracking, bracket updates, and tournament progress monitoring
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-pink-500/30 rounded-xl p-6 hover:border-pink-400/50 transition-all">
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Champion Impact</h3>
                <p className="text-slate-400">
                  Every tournament directly funds educational opportunities for Corpus Christi youth
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* District Registration Section */}
        <div className="bg-slate-800 border border-blue-500/30 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">District Registration</h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Schools and districts can register for tournament management access. We support both digital payments and traditional check payments to accommodate all district policies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center">
                <UserCheck className="h-5 w-5 mr-3 text-blue-400" />
                District Admin
              </h4>
              <p className="text-slate-300 text-sm">Create tournaments, assign schools to events, manage district-wide competitions</p>
            </div>
            
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center">
                <Users className="h-5 w-5 mr-3 text-green-400" />
                School Admin
              </h4>
              <p className="text-slate-300 text-sm">Assign coaches within your school to specific events, manage school participation</p>
            </div>
            
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-3 text-purple-400" />
                Coach
              </h4>
              <p className="text-slate-300 text-sm">Register teams, manage rosters, track your team's tournament participation</p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-8 py-4 text-lg mr-4"
              onClick={() => window.location.href = "/register"}
              data-testid="button-register-district"
            >
              Register Your District
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 px-8 py-4 text-lg"
              data-testid="button-learn-more-registration"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Cross-Platform Promotion Banner */}
        <CrossPlatformPromotion placement="banner" />

        {/* Professional Signup Section */}
        <SignupSection />

        {/* Donation Section */}
        <DonationSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}