import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Heart, GraduationCap, MapPin, Award, Mail, Phone, Timer, UserCheck, Shield, Target, Building } from "lucide-react";
import { useLocation } from "wouter";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";
import championVideo from "@assets/Champions for Change Logo_1755291031903.mp4";
import championLogoNew from "@assets/Untitled design_1755380695198.png";
import { DonationSection } from "@/components/DonationSection";
import { SignupSection } from "@/components/SignupSection";

import Footer from "@/components/Footer";
import { AIConsultant } from "@/components/AIConsultant";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Stadium Lighting Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 via-transparent to-yellow-400/5"></div>
        <header className="relative border-b border-orange-500/20 bg-slate-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile-optimized layout */}
            <div className="lg:flex lg:items-center lg:justify-between lg:h-16">
              {/* Mobile: Stacked Layout, Desktop: Horizontal */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full py-4 lg:py-0 space-y-4 lg:space-y-0">
                
                {/* Logo Section with proper spacing */}
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
                    <p className="text-xs text-orange-400">Tournament Management Platform</p>
                  </div>
                </div>

                {/* Live Status Bar - Desktop only */}
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">Live Platform</span>
                  </div>
                </div>

                {/* Login Buttons with optimized mobile spacing */}
                <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-3 lg:ml-auto">
                  <Button 
                    onClick={() => setLocation('/login')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 w-full lg:w-auto"
                    data-testid="button-login"
                  >
                    Login to Arena
                  </Button>
                  <Button 
                    onClick={() => setLocation('/register')}
                    variant="outline"
                    className="border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 px-6 py-3 font-semibold w-full lg:w-auto"
                    data-testid="button-signup"
                  >
                    Sign Up Free
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mission Banner with optimized mobile spacing */}
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white py-6 lg:py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm lg:text-sm text-xs sm:text-sm">
            <Heart className="h-4 w-4 flex-shrink-0" />
            <span className="text-center leading-relaxed">Built by coaches to fund educational opportunities for underprivileged student athletes</span>
            <MapPin className="h-4 w-4 flex-shrink-0" />
          </div>
        </div>
        {/* Add breathing room below tagline - 40-60px spacing */}
        <div className="h-12 lg:h-8"></div>
      </section>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Champions Welcome with Video */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl border border-orange-500/30 mb-12">
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-32 h-32 bg-orange-400/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-4 w-40 h-40 bg-red-400/3 rounded-full blur-3xl"></div>
          </div>
          <div className="relative p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Logo Section */}
              <div className="order-2 lg:order-1">
                <div 
                  className="relative w-80 h-80 mx-auto cursor-pointer hero-logo-coin"
                  onClick={(e) => {
                    const element = e.currentTarget;
                    // Prevent multiple clicks during animation
                    if (element.classList.contains('spinning')) return;
                    
                    // Add spinning animation and mark as spinning
                    element.classList.add('spin-4x', 'spinning');
                    
                    // After spin completes, redirect to onboarding
                    setTimeout(() => {
                      window.location.href = '/register';
                    }, 1800); // Wait for coin flip animation to complete
                  }}
                  data-testid="hero-logo-coin"
                >
                  <div className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-orange-400/30 coin-flip-entrance">
                    <img 
                      src={championLogoNew} 
                      alt="Champions for Change" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Hover indication */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-emerald-400/20 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-full">
                    <span className="text-white font-semibold bg-black/60 px-4 py-2 rounded-full text-sm shadow-lg">Click for Onboarding</span>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Supporting Student Education Through Sports
                </Badge>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                  Tournament Platform That <span className="text-orange-400">Champions Change</span>
                </h1>
            
                <p className="text-xl text-slate-300 mb-8 max-w-4xl">
                  Professional tournament management platform built by coaches who identified needs in the tournament world. 
                  Every subscription helps fund student trips and educational opportunities for underprivileged youth.
                </p>

                <div className="flex flex-col gap-4 justify-center lg:justify-start items-center lg:items-start">
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 px-4 py-3 text-base"
                      onClick={() => setLocation("/your-why")}
                      data-testid="button-your-why"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Your Why
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 px-4 py-3 text-base"
                      onClick={() => setLocation("/grant-funding")}
                      data-testid="button-grant-funding"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Grant Opportunities
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 px-4 py-3 text-base"
                      onClick={() => setLocation("/health-benefits")}
                      data-testid="button-health-benefits"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Health & Wellness
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 text-lg"
                      onClick={() => setLocation("/register")}
                      data-testid="button-get-started"
                    >
                      Start Supporting Students
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 px-6 py-4 text-lg"
                      onClick={() => {
                        const impactSection = document.getElementById('impact-mission');
                        impactSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      data-testid="button-learn-more"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enterprise/Nonprofit Access */}
            <div className="mt-8 p-6 bg-slate-700/50 border border-slate-600 rounded-xl">
              <p className="text-slate-300 text-center mb-4">
                Not a school or district but need reduced price and ad-free tournament solutions 
                for your nonprofit or company? Our donation-based revenue model keeps the fun going 
                while giving you access to our 65+ competitions!
              </p>
              <div className="text-center">
                <Button 
                  variant="outline"
                  className="border-emerald-400 text-emerald-400 hover:bg-emerald-400/10 hover:border-emerald-300"
                  onClick={() => setLocation("/business-pricing-test")}
                  data-testid="button-enterprise-help"
                >
                  Click Here - We Can Help
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Impact Mission Command Center */}
        <div id="impact-mission" className="bg-slate-800 border border-emerald-500/30 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Our Impact Mission</h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Revenue from this platform directly funds educational trips and opportunities for underprivileged student athletes. 
              When you choose our tournament management solution, you're not just organizing competitions—you're championing change in young lives.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-700 border border-slate-600 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                <Award className="h-5 w-5 mr-3 text-orange-400" />
                Leadership
              </h4>
              <div className="text-slate-300">
                <p className="font-semibold text-white text-lg">Daniel Thornton</p>
                <p className="text-orange-400 font-medium mb-2">Executive Director of Champions for Change</p>
                <p className="text-sm">21 years military service (Marines & Army) • 10 years secondary athletic coaching • Dedicated educator since 2016</p>
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
                  Every tournament directly funds educational opportunities for underprivileged youth
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Registration Section */}
        <div className="bg-slate-800 border border-blue-500/30 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Choose Your Platform</h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Professional tournament management with pricing designed for educational organizations and enterprises. Every subscription supports Champions for Change student trips.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="text-center">
                <h4 className="text-2xl font-bold mb-2">Tournament Organizer</h4>
                <div className="text-4xl font-bold mb-2">$39<span className="text-lg font-normal">/month</span></div>
                <div className="text-blue-200 mb-4">or $399/year (save 2 months)</div>
                <Button 
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                  onClick={() => setLocation("/pricing?type=education")}
                >
                  Start Free Trial
                </Button>
                <p className="text-blue-200 text-sm mt-3">Perfect for coaches & individual organizers</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white border-2 border-yellow-400">
              <div className="text-center">
                <Badge className="bg-yellow-400 text-green-800 mb-3">Most Popular</Badge>
                <h4 className="text-2xl font-bold mb-2">Business Enterprise</h4>
                <div className="text-4xl font-bold mb-2">$149<span className="text-lg font-normal">/month</span></div>
                <div className="text-green-200 mb-4">or $1,499/year (save 2 months)</div>
                <Button 
                  className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold"
                  onClick={() => setLocation("/pricing?type=business")}
                >
                  Start Enterprise
                </Button>
                <p className="text-green-200 text-sm mt-3">Flexible solutions for any organization</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="text-center">
                <h4 className="text-2xl font-bold mb-2">District Enterprise</h4>
                <div className="text-4xl font-bold mb-2">$4,500<span className="text-lg font-normal">/year</span></div>
                <div className="text-purple-200 mb-4">Save $26,000+ annually vs alternatives</div>
                <Button 
                  className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                  onClick={() => setLocation("/login/district")}
                >
                  Contact for District Access
                </Button>
                <p className="text-purple-200 text-sm mt-3">Complete district-wide management</p>
              </div>
            </div>
          </div>
          
          {/* Registration Workflows */}
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-white mb-4">Registration Workflows</h4>
            <p className="text-slate-300 mb-6">Choose the right registration path for your organization type</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* District Registration Workflow */}
            <div className="bg-gradient-to-br from-purple-800 to-purple-900 rounded-xl p-6 border border-purple-500/30">
              <div className="text-center mb-4">
                <GraduationCap className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-white mb-2">District Registration</h4>
                <p className="text-purple-200 text-sm">Complete district-wide management for K-12 schools</p>
              </div>
              <div className="space-y-3 text-sm text-purple-100 mb-6">
                <div className="flex items-center"><UserCheck className="h-4 w-4 mr-2" />District Athletic Directors</div>
                <div className="flex items-center"><Users className="h-4 w-4 mr-2" />Multi-school coordination</div>
                <div className="flex items-center"><Shield className="h-4 w-4 mr-2" />HIPAA/FERPA compliance</div>
                <div className="flex items-center"><Target className="h-4 w-4 mr-2" />50+ UIL competitions</div>
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                onClick={() => setLocation("/login/district")}
              >
                District Login Portal
              </Button>
            </div>

            {/* Enterprise Registration Workflow */}
            <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-xl p-6 border border-green-500/30">
              <div className="text-center mb-4">
                <Building className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <h4 className="text-xl font-bold text-white mb-2">Enterprise Registration</h4>
                <p className="text-green-200 text-sm">Corporate, nonprofit, and organization tournaments</p>
              </div>
              <div className="space-y-3 text-sm text-green-100 mb-6">
                <div className="flex items-center"><Users className="h-4 w-4 mr-2" />Corporate team building</div>
                <div className="flex items-center"><Trophy className="h-4 w-4 mr-2" />Professional competitions</div>
                <div className="flex items-center"><Zap className="h-4 w-4 mr-2" />AI tournament creation</div>
                <div className="flex items-center"><CreditCard className="h-4 w-4 mr-2" />Flexible billing</div>
              </div>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                onClick={() => setLocation("/login/business")}
              >
                Enterprise Login Portal
              </Button>
            </div>
          </div>


        </div>

        {/* Enhanced Cross-Platform Promotion - Only for appropriate domains */}
        {/* Note: FantasyPromotion and CrossPlatformPromotion are domain-gated and only show on enterprise/fantasy domains */}

        {/* Professional Signup Section */}
        <SignupSection />

        {/* Donation Section */}
        <DonationSection />
      </main>

      {/* AI Consultant */}
      <AIConsultant domain="education" />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}