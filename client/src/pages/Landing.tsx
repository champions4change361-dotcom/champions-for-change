import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Heart, GraduationCap, BookOpen, Award, Mail, Phone, Timer, UserCheck, Shield, Target, Building, Check } from "lucide-react";
import { SiPaypal, SiVenmo } from "react-icons/si";
import { useLocation } from "wouter";
import React, { useState } from "react";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";
import championVideo from "@assets/Champions for Change Logo_1755291031903.mp4";
import championLogoNew from "@assets/Untitled design_1755380695198.png";
import { DonationSection } from "@/components/DonationSection";
import { SignupSection } from "@/components/SignupSection";

import Footer from "@/components/Footer";
import RegistrationAssistant from "@/components/RegistrationAssistant";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";


export default function Landing() {
  const [, setLocation] = useLocation();
  const [isRegistrationAssistantOpen, setIsRegistrationAssistantOpen] = useState(false);
  const [tournamentEmail, setTournamentEmail] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const { toast } = useToast();
  const { settings } = usePlatformSettings();

  // Location detection
  const { data: userLocation, isLoading: locationLoading } = useQuery({
    queryKey: ['/api/location'],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 1
  });

  // Regional tournament data
  const regionalTournaments = {
    'Texas': {
      fishing: [
        { name: 'CCA Texas STAR Tournament', date: 'May 26 - Sept 1, 2025', prize: '$2M+ in prizes', type: 'LIVE' },
        { name: 'Sharkathon', date: 'October-November 2025', prize: 'Conservation focused', type: 'FEATURED' }
      ],
      golf: [
        { name: 'Texas Open Championship', date: 'April 2026', prize: '$25,000 prizes', type: 'FEATURED' },
        { name: 'Hill Country Golf Classic', date: 'March 2026', prize: 'Amateur/Pro divisions', type: 'POPULAR' }
      ],
      basketball: [
        { name: 'Champions for Change Youth Tournament', date: '12U-14U divisions', prize: 'Supporting education', type: 'LIVE' },
        { name: 'Texas High School Regional', date: 'December 2025', prize: 'State qualification', type: 'FEATURED' }
      ]
    },
    'California': {
      fishing: [
        { name: 'California Bass Federation Championship', date: 'June 2026', prize: '$50,000 prizes', type: 'FEATURED' },
        { name: 'Pacific Coast Salmon Derby', date: 'August 2025', prize: 'Ocean fishing', type: 'POPULAR' }
      ],
      golf: [
        { name: 'Pebble Beach Amateur Championship', date: 'September 2025', prize: 'Prestigious venue', type: 'FEATURED' },
        { name: 'San Diego County Open', date: 'October 2025', prize: '$15,000 prizes', type: 'POPULAR' }
      ],
      basketball: [
        { name: 'West Coast Youth Championships', date: 'January 2026', prize: 'All age divisions', type: 'FEATURED' },
        { name: 'California AAU Regional', date: 'March 2026', prize: 'National qualifiers', type: 'LIVE' }
      ]
    },
    'Florida': {
      fishing: [
        { name: 'Florida Keys Tournament Series', date: 'Year-round', prize: 'Tropical fishing', type: 'FEATURED' },
        { name: 'Everglades Bass Classic', date: 'February 2026', prize: '$30,000 prizes', type: 'POPULAR' }
      ],
      golf: [
        { name: 'Florida State Amateur', date: 'July 2026', prize: 'State championship', type: 'FEATURED' },
        { name: 'Miami-Dade Open', date: 'November 2025', prize: '$20,000 prizes', type: 'POPULAR' }
      ]
    },
    'International': {
      fishing: [
        { name: 'European Bass Championships', date: 'Summer 2026', prize: '€100,000 prizes', type: 'FEATURED' },
        { name: 'World Fly Fishing Championships', date: 'September 2026', prize: 'Global competition', type: 'FEATURED' }
      ],
      golf: [
        { name: 'British Amateur Championship', date: 'June 2026', prize: 'Historic tournament', type: 'FEATURED' },
        { name: 'Canadian Open Amateur', date: 'August 2026', prize: 'International field', type: 'POPULAR' }
      ]
    }
  };

  // Determine user's region
  const getUserRegion = () => {
    if (!userLocation) return 'Texas'; // Default fallback
    if (userLocation.country !== 'United States') return 'International';
    if (userLocation.region === 'California') return 'California';
    if (userLocation.region === 'Florida') return 'Florida';
    if (userLocation.region === 'Texas') return 'Texas';
    return 'Texas'; // Default for other US states
  };

  const currentRegion = selectedRegion === 'all' ? getUserRegion() : selectedRegion;

  const tournamentSubscriptionMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('/api/tournament-subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          email,
          sports: [],
          frequency: 'weekly'
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Successfully subscribed!",
        description: "You'll receive tournament notifications via email.",
      });
      setTournamentEmail('');
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const handleTournamentSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournamentEmail.trim()) return;
    
    tournamentSubscriptionMutation.mutate(tournamentEmail);
  };

  // Clear any persistent session data when landing page loads
  React.useEffect(() => {
    // Clear Smart Assistant session data
    localStorage.removeItem('anonymous_session');
  }, []);

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
                    <h1 className="text-xl font-bold text-white">{settings?.content?.platformName || "Champions for Change"}</h1>
                    <p className="text-xs text-orange-400">{settings?.content?.heroSubtitle || "Athletic & Academic Management Platform"}</p>
                  </div>
                </div>

                {/* Live Status Bar - Desktop only */}
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-300">Live Platform</span>
                  </div>
                </div>

                {/* Donation and Login Buttons with optimized mobile spacing */}
                <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3 lg:ml-auto">
                  <Button 
                    onClick={() => setLocation('/donate')}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                    data-testid="button-donate-header"
                  >
                    <Heart className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    Donate
                  </Button>
                  <Button 
                    onClick={() => setLocation('/login')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                    data-testid="button-login"
                  >
                    <span className="lg:hidden">Login</span>
                    <span className="hidden lg:inline">Login to Arena</span>
                  </Button>
                  <Button 
                    onClick={() => setLocation('/trial-signup')}
                    variant="outline"
                    className="border-orange-500 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base font-semibold w-full lg:w-auto"
                    data-testid="button-signup"
                  >
                    <span className="lg:hidden">Sign Up</span>
                    <span className="hidden lg:inline">Start Free Trial</span>
                  </Button>
                  <Button 
                    onClick={() => window.location.href = 'mailto:Champions4change361@gmail.com?subject=Champions for Change Platform Inquiry&body=Hello, I am interested in learning more about your tournament platform and would like to discuss how it can support our organization.'}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                    data-testid="button-contact-header"
                  >
                    <Mail className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="lg:hidden">Contact</span>
                    <span className="hidden lg:inline">Contact Us</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mission Banner with optimized mobile spacing */}
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white py-4 lg:py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm lg:text-sm">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-center leading-relaxed px-2">
              <span className="hidden sm:inline">Built by coaches to fund educational opportunities for underprivileged student competitors</span>
              <span className="sm:hidden">Funding student educational opportunities</span>
            </span>
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          </div>
        </div>
        {/* Add breathing room below tagline - reduced for mobile */}
        <div className="h-6 sm:h-8 lg:h-8"></div>
      </section>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Champions Welcome with Video */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl border border-orange-500/30 mb-12">
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-32 h-32 bg-orange-400/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-4 w-40 h-40 bg-red-400/3 rounded-full blur-3xl"></div>
          </div>
          <div className="relative p-6 sm:p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Logo Section */}
              <div className="order-2 lg:order-1">
                <div 
                  className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto cursor-pointer hero-logo-coin"
                  onClick={(e) => {
                    const element = e.currentTarget;
                    // Prevent multiple clicks during animation
                    if (element.classList.contains('spinning')) return;
                    
                    // Add spinning animation and mark as spinning
                    element.classList.add('spin-4x', 'spinning');
                    
                    // After spin completes, redirect to onboarding
                    setTimeout(() => {
                      window.location.href = '/platform-options';
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
                    <span className="text-white font-semibold bg-black/60 px-4 py-2 rounded-full text-sm shadow-lg">Choose Your Platform</span>
                  </div>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <Badge className="mb-6 bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/20">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Supporting Student Education Through Sports
                </Badge>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 lg:mb-6 leading-tight">
                  Complete Athletic & Academic <span className="text-orange-400">Management Platform</span>
                </h1>
            
                <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 lg:mb-8 max-w-4xl leading-relaxed">
                  Comprehensive platform for school districts and organizations managing athletic programs, academic competitions, 
                  budgets, health monitoring, and organizational oversight. Every subscription helps fund student trips and educational opportunities for underprivileged youth.
                </p>

                <div className="flex flex-col gap-4 justify-center lg:justify-start items-center lg:items-start">
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 lg:mb-6 justify-center lg:justify-start">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base"
                      onClick={() => setLocation("/your-why")}
                      data-testid="button-your-why"
                    >
                      <Heart className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Your Why</span>
                      <span className="sm:hidden">Why</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base"
                      onClick={() => setLocation("/capabilities")}
                      data-testid="button-capabilities"
                    >
                      <Trophy className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Platform Capabilities</span>
                      <span className="sm:hidden">Capabilities</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:border-orange-400 px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base"
                      onClick={() => setLocation("/grant-funding")}
                      data-testid="button-grant-funding"
                    >
                      <Target className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Grant Opportunities</span>
                      <span className="sm:hidden">Grants</span>
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 px-3 py-2 text-sm lg:px-4 lg:py-3 lg:text-base"
                      onClick={() => setLocation("/health-benefits")}
                      data-testid="button-health-benefits"
                    >
                      <Shield className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Health & Wellness</span>
                      <span className="sm:hidden">Health</span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full max-w-lg">
                    <Button 
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-3 text-base w-full"
                      onClick={() => setLocation("/pricing")}
                      data-testid="button-get-started"
                    >
                      <Trophy className="mr-2 h-5 w-5" />
                      Start Your Platform
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enterprise/Nonprofit Access */}
            <div className="mt-8 p-6 bg-slate-700/50 border border-slate-600 rounded-xl">
              <p className="text-slate-300 text-center mb-4">
                <Shield className="h-5 w-5 inline mr-2" />
                Trusted by Educational Organizations
              </p>
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <div className="text-orange-400 font-medium">Districts</div>
                <div className="text-blue-400 font-medium">Schools</div>
                <div className="text-green-400 font-medium">Youth Organizations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Three-Tier Organization Selection - Above the fold */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-2xl border border-orange-500/30 p-8 mb-12 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Choose Your Organization Type
              </h2>
              <p className="text-xl text-slate-300 mb-6 leading-relaxed">
                Three distinct pricing tiers designed for different organization types and needs
              </p>
              <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                <Heart className="h-4 w-4 mr-2" />
                All subscriptions support Champions for Change educational programs
              </div>
            </div>

            {/* Three Organization Type Cards */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Fantasy Sports */}
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white border border-orange-400/30">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-orange-200 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Fantasy Sports</h3>
                  <div className="text-4xl font-bold mb-2">Free</div>
                  <div className="text-orange-200 mb-4">Optional donation support</div>
                  <p className="text-orange-100 text-sm mb-6">
                    Individual users for fantasy leagues
                  </p>
                  
                  <div className="space-y-2 text-sm text-orange-100 mb-6">
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Join fantasy leagues and compete</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Community building features</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Educational mission support</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Mobile-responsive management</div>
                  </div>
                  
                  <Button 
                    className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold mb-3"
                    onClick={() => setLocation("/register-organization?type=fantasy")}
                    data-testid="button-select-fantasy"
                  >
                    Start Playing Fantasy Sports
                  </Button>
                  <p className="text-orange-200 text-xs">Support our educational mission while enjoying fantasy sports</p>
                </div>
              </div>

              {/* Youth Organizations */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white border-2 border-blue-400 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
                <div className="text-center">
                  <Users className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Youth Organizations</h3>
                  <div className="text-4xl font-bold mb-1">$50</div>
                  <div className="text-lg font-medium mb-2">/month</div>
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm mb-4">
                    $480/year (Save 20%)
                  </div>
                  <p className="text-blue-100 text-sm mb-6">
                    YMCA, Boys & Girls Clubs, Pop Warner, local leagues
                  </p>
                  
                  <div className="space-y-2 text-sm text-blue-100 mb-6">
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Complete tournament management</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Nonprofit pricing for communities</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Unlimited teams & participants</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Custom branding & communication</div>
                  </div>
                  
                  <Button 
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold mb-3"
                    onClick={() => setLocation("/register-organization?type=youth")}
                    data-testid="button-select-youth"
                  >
                    Start Youth Program Management
                  </Button>
                  <p className="text-blue-200 text-xs">Affordable comprehensive management for community sports</p>
                </div>
              </div>

              {/* Private Schools */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white border border-purple-400/30">
                <div className="text-center">
                  <Building className="h-12 w-12 text-purple-200 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Private Schools</h3>
                  <div className="text-4xl font-bold mb-2">$2,000</div>
                  <div className="text-purple-200 mb-4">/year (annual only)</div>
                  <p className="text-purple-100 text-sm mb-6">
                    Private schools and private charter schools
                  </p>
                  
                  <div className="space-y-2 text-sm text-purple-100 mb-6">
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Enterprise athletic & academic mgmt</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />HIPAA/FERPA compliance</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />District-to-student hierarchy</div>
                    <div className="flex items-center"><Check className="h-4 w-4 mr-2" />Priority support & training</div>
                  </div>
                  
                  <Button 
                    className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold mb-3"
                    onClick={() => setLocation("/register-organization?type=private-school")}
                    data-testid="button-select-private-school"
                  >
                    Contact for Enterprise Setup
                  </Button>
                  <p className="text-purple-200 text-xs">Professional capabilities with full compliance and unlimited scale</p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12">
              <p className="text-slate-300 mb-6">
                Need help choosing the right tier for your organization?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline"
                  className="border-blue-300 text-blue-400 hover:bg-blue-500/10 px-8 py-3"
                  onClick={() => window.location.href = 'mailto:Champions4change361@gmail.com?subject=Organization Type Selection - Pricing Inquiry&body=Hello, I need help determining which pricing tier is best for my organization.'}
                  data-testid="button-pricing-help"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Get Pricing Help
                </Button>
                <Button 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
                  onClick={() => setLocation("/pricing")}
                  data-testid="button-view-detailed-pricing"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  View Detailed Pricing
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Impact Section */}
        <section className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white py-12 mb-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Supporting Student Education Through Sports Management
              </h2>
              <p className="text-xl text-green-100 mb-8 leading-relaxed">
                Every subscription and participation supports Champions for Change, funding educational 
                trips and opportunities for underprivileged students in Corpus Christi, Texas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-green-50 font-bold px-8 py-4 text-lg"
                  onClick={() => setLocation("/donate")}
                  data-testid="button-donate-impact"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Make a Direct Donation
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white bg-white/10 hover:bg-white hover:text-green-800 hover:border-white px-8 py-4 text-lg font-semibold"
                  onClick={() => setLocation("/your-why")}
                  data-testid="button-impact-story"
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  See Our Impact
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-100">100%</div>
                  <div className="text-sm text-green-200">Goes to Students</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-100">501(c)(3)</div>
                  <div className="text-sm text-green-200">Tax Deductible</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-100">$15,000+</div>
                  <div className="text-sm text-green-200">Already Funded</div>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-green-100">
                <p>Champions for Change • EIN: 33-2548199 • 501(c)(3) Nonprofit Organization</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Impact Mission Command Center */}
        <div id="impact-mission" className="bg-slate-800 border border-emerald-500/30 rounded-2xl p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-white mb-4">Our Impact Mission</h3>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto">
              Revenue from this platform directly funds educational trips and opportunities for underprivileged student competitors. 
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

        {/* Featured Tournaments - Traffic Driver */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl border border-yellow-500/30 py-12 mb-12">
          <div className="text-center px-8 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="text-4xl font-bold text-white">🏆 Featured Tournaments</h2>
              {locationLoading && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Finding tournaments near you...</span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center mb-6">
              <p className="text-slate-300 text-lg max-w-3xl mx-auto mb-4">
                {userLocation ? (
                  <>Tournaments near <span className="text-yellow-400 font-semibold">{userLocation.city}, {userLocation.region}</span> and beyond</>
                ) : (
                  <>Discover major tournaments in your area. Get notified about upcoming events across all sports.</>
                )}
              </p>
              
              {/* Region selector */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => setSelectedRegion('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === 'all' 
                      ? 'bg-yellow-500 text-slate-900' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  📍 Near Me
                </button>
                <button 
                  onClick={() => setSelectedRegion('Texas')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === 'Texas' 
                      ? 'bg-yellow-500 text-slate-900' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  🤠 Texas
                </button>
                <button 
                  onClick={() => setSelectedRegion('California')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === 'California' 
                      ? 'bg-yellow-500 text-slate-900' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  🌊 California  
                </button>
                <button 
                  onClick={() => setSelectedRegion('Florida')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === 'Florida' 
                      ? 'bg-yellow-500 text-slate-900' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  🏖️ Florida
                </button>
                <button 
                  onClick={() => setSelectedRegion('International')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRegion === 'International' 
                      ? 'bg-yellow-500 text-slate-900' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  🌍 International
                </button>
              </div>
            </div>
            
            {/* Email Signup for Tournament Notifications */}
            <div className="bg-slate-900/50 border border-yellow-500/30 rounded-xl p-6 max-w-2xl mx-auto mb-8">
              <h3 className="text-xl font-bold text-white mb-3">📧 Tournament Notifications</h3>
              <p className="text-slate-300 mb-4">Get notified about tournaments in your area - all sports, all skill levels</p>
              <form onSubmit={handleTournamentSubscription} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email for tournament alerts" 
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-500"
                  data-testid="input-tournament-email"
                  value={tournamentEmail}
                  onChange={(e) => setTournamentEmail(e.target.value)}
                  required
                />
                <Button 
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-6 py-3"
                  data-testid="button-subscribe-tournaments"
                  disabled={tournamentSubscriptionMutation.isPending}
                >
                  {tournamentSubscriptionMutation.isPending ? 'Subscribing...' : 'Get Alerts'}
                </Button>
              </form>
              <p className="text-xs text-slate-400 mt-2">Free • Unsubscribe anytime • No spam</p>
            </div>
          </div>

          {/* Dynamic Multi-Sport Tournament Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
            
            {/* Fishing Tournaments */}
            <div className="bg-slate-900/50 border border-teal-500/30 rounded-xl p-6 hover:border-teal-400/50 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mr-3">
                  🎣
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Fishing Tournaments</h3>
                  <div className="text-sm text-teal-400 font-semibold">POPULAR</div>
                </div>
              </div>
              {regionalTournaments[currentRegion]?.fishing?.map((tournament, idx) => (
                <div key={idx} className={`space-y-2 text-sm ${idx > 0 ? 'mt-3 pt-3 border-t border-slate-700' : ''}`}>
                  <div className="text-white font-semibold">{tournament.name}</div>
                  <div className="text-slate-300">{tournament.date}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400">{tournament.prize}</div>
                    {tournament.type && (
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        tournament.type === 'LIVE' ? 'bg-red-500/20 text-red-400' :
                        tournament.type === 'FEATURED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {tournament.type}
                      </span>
                    )}
                  </div>
                </div>
              )) || (
                <div className="space-y-2 text-sm">
                  <div className="text-white font-semibold">No fishing tournaments found</div>
                  <div className="text-slate-400">Check back soon for updates</div>
                </div>
              )}
            </div>

            {/* Basketball Tournaments */}
            <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-6 hover:border-orange-400/50 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                  🏀
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Basketball Tournaments</h3>
                  <div className="text-sm text-orange-400 font-semibold">FEATURED</div>
                </div>
              </div>
              {regionalTournaments[currentRegion]?.basketball?.map((tournament, idx) => (
                <div key={idx} className={`space-y-2 text-sm ${idx > 0 ? 'mt-3 pt-3 border-t border-slate-700' : ''}`}>
                  <div className="text-white font-semibold">{tournament.name}</div>
                  <div className="text-slate-300">{tournament.date}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400">{tournament.prize}</div>
                    {tournament.type && (
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        tournament.type === 'LIVE' ? 'bg-red-500/20 text-red-400' :
                        tournament.type === 'FEATURED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {tournament.type}
                      </span>
                    )}
                  </div>
                </div>
              )) || (
                <div className="space-y-2 text-sm">
                  <div className="text-white font-semibold">No basketball tournaments found</div>
                  <div className="text-slate-400">Check back soon for updates</div>
                </div>
              )}
            </div>

            {/* Golf Tournaments */}
            <div className="bg-slate-900/50 border border-green-500/30 rounded-xl p-6 hover:border-green-400/50 transition-all">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  ⛳
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Golf Tournaments</h3>
                  <div className="text-sm text-green-400 font-semibold">PREMIUM</div>
                </div>
              </div>
              {regionalTournaments[currentRegion]?.golf?.map((tournament, idx) => (
                <div key={idx} className={`space-y-2 text-sm ${idx > 0 ? 'mt-3 pt-3 border-t border-slate-700' : ''}`}>
                  <div className="text-white font-semibold">{tournament.name}</div>
                  <div className="text-slate-300">{tournament.date}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-yellow-400">{tournament.prize}</div>
                    {tournament.type && (
                      <span className={`px-2 py-1 text-xs font-bold rounded ${
                        tournament.type === 'LIVE' ? 'bg-red-500/20 text-red-400' :
                        tournament.type === 'FEATURED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {tournament.type}
                      </span>
                    )}
                  </div>
                </div>
              )) || (
                <div className="space-y-2 text-sm">
                  <div className="text-white font-semibold">No golf tournaments found</div>
                  <div className="text-slate-400">Check back soon for updates</div>
                </div>
              )}
            </div>

          </div>

          <div className="text-center mt-8">
            <Button 
              className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-slate-900 font-bold px-8 py-3 text-lg hover:from-yellow-500 hover:to-yellow-400 transition-all shadow-lg"
              onClick={() => setLocation('/tournament-calendar')}
              data-testid="button-view-all-tournaments"
            >
              View All Tournaments →
            </Button>
          </div>
        </div>

        {/* Impact Stats Arena - Simplified */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 rounded-2xl text-white py-8 mb-12">
          <div className="text-center px-8">
            <h2 className="text-3xl font-bold mb-6">Making a Real Difference</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-emerald-700/30 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2 text-yellow-400">65+ Sports</div>
                <div className="text-emerald-100">Tournament types supported</div>
              </div>
              <div className="bg-emerald-700/30 rounded-xl p-6">
                <div className="text-3xl font-bold mb-2 text-yellow-400">100% Mission</div>
                <div className="text-emerald-100">Profit funds student education</div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent & Athlete Benefits */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 rounded-2xl text-white py-12">
            <div className="text-center px-8 mb-8">
              <h2 className="text-4xl font-bold mb-4">For Parents & Athletes - Always Free</h2>
              <p className="text-xl text-purple-100 max-w-4xl mx-auto mb-8">
                When your school or organization uses our platform, you get access to powerful tools at no cost. 
                Here's what you gain as a parent or athlete:
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
              <div className="bg-purple-700/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-purple-200" />
                </div>
                <h3 className="text-lg font-bold mb-3">Health Monitoring</h3>
                <p className="text-purple-200 text-sm">
                  Real-time health monitoring and comprehensive safety protocols to keep your athlete safe
                </p>
              </div>
              
              <div className="bg-purple-700/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Timer className="h-6 w-6 text-purple-200" />
                </div>
                <h3 className="text-lg font-bold mb-3">Live Updates</h3>
                <p className="text-purple-200 text-sm">
                  Get instant notifications about games, practice changes, and tournament results
                </p>
              </div>
              
              <div className="bg-purple-700/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-6 w-6 text-purple-200" />
                </div>
                <h3 className="text-lg font-bold mb-3">Achievement Tracking</h3>
                <p className="text-purple-200 text-sm">
                  Complete academic and athletic records, stats, and performance analytics
                </p>
              </div>
              
              <div className="bg-purple-700/30 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-6 w-6 text-purple-200" />
                </div>
                <h3 className="text-lg font-bold mb-3">Family Communication</h3>
                <p className="text-purple-200 text-sm">
                  Direct communication with coaches, trainers, and school staff through secure channels
                </p>
              </div>
            </div>
            
            <div className="text-center mt-8 px-8">
              <div className="bg-purple-800/40 rounded-xl p-6 max-w-4xl mx-auto">
                <h3 className="text-xl font-bold mb-3 text-yellow-300">Why It's Free for Families</h3>
                <p className="text-purple-100">
                  Your school or organization subscribes to our platform, which gives your entire family access to these powerful tools. 
                  Plus, every subscription helps fund educational trips for underprivileged student athletes - 
                  so you're part of something bigger while getting premium features at no cost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Arena */}
        <div className="mb-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Complete Athletic & Academic Management
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Built by coaches who understand the needs of schools and districts. Every feature designed to streamline operations while supporting student education.
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
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white flex flex-col">
              <div className="text-center flex-1">
                <div className="h-8 mb-3 flex items-center justify-center">
                  <Badge className="bg-yellow-400 text-blue-800 text-xs px-2 py-1">Most Popular</Badge>
                </div>
                <h4 className="text-2xl font-bold mb-2">Tournament Organizer</h4>
                <div className="text-4xl font-bold mb-2">$39<span className="text-lg font-normal">/month</span></div>
                <div className="text-blue-200 mb-6">or $399/year (save 2 months)</div>
                <div className="mt-auto">
                  <Button 
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold mb-3"
                    onClick={() => setLocation("/pricing?type=education#tournament-organizer")}
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-blue-300 text-white hover:bg-blue-500/20 hover:text-white bg-blue-600 flex items-center justify-center py-2"
                    onClick={() => window.location.href = 'mailto:Champions4change361@gmail.com?subject=Tournament Organizer Pricing Inquiry&body=Hello, I am interested in learning more about Tournament Organizer pricing and would like to discuss options.'}
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    Contact Us
                  </Button>
                  <p className="text-blue-200 text-sm mt-2">Perfect for coaches & individual organizers</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white flex flex-col">
              <div className="text-center flex-1">
                <div className="h-8 mb-3 flex items-center justify-center">
                  <Badge className="bg-green-200 text-green-800 text-xs px-2 py-1 opacity-80">Enterprise Features</Badge>
                </div>
                <h4 className="text-2xl font-bold mb-2">Business Enterprise</h4>
                <div className="text-4xl font-bold mb-2">$149<span className="text-lg font-normal">/month</span></div>
                <div className="text-green-200 mb-6">or $1,499/year (save 2 months)</div>
                <div className="mt-auto">
                  <Button 
                    className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold mb-3"
                    onClick={() => setLocation("/pricing?type=business#business-enterprise")}
                  >
                    Start Enterprise
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-green-300 text-white hover:bg-green-500/20 hover:text-white bg-blue-600 flex items-center justify-center py-2"
                    onClick={() => window.location.href = 'mailto:Champions4change361@gmail.com?subject=Business Enterprise Pricing Inquiry&body=Hello, I am interested in learning more about Business Enterprise pricing and would like to discuss flexible solutions.'}
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    Contact Us
                  </Button>
                  <p className="text-green-200 text-sm mt-2">Flexible solutions for any organization</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white flex flex-col">
              <div className="text-center flex-1">
                <div className="h-8 mb-3 flex items-center justify-center">
                  <Badge className="bg-purple-200 text-purple-800 text-xs px-2 py-1 opacity-80">Educational Mission</Badge>
                </div>
                <h4 className="text-2xl font-bold mb-2">Champions Level</h4>
                <div className="text-4xl font-bold mb-2">$399<span className="text-lg font-normal">/month</span></div>
                <div className="text-purple-200 mb-6">Complete enterprise platform for larger educational institutions</div>
                <div className="mt-auto">
                  <Button 
                    className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold mb-3"
                    onClick={() => setLocation("/register?plan=champions")}
                  >
                    Start Champions Level
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-purple-300 text-white hover:bg-purple-500/20 hover:text-white bg-purple-600 flex items-center justify-center py-2"
                    onClick={() => window.location.href = 'mailto:Champions4change361@gmail.com?subject=Champions Level Pricing Inquiry&body=Hello, I am interested in learning more about Champions Level for our educational institution and would like to discuss our specific needs.'}
                  >
                    <Mail className="h-3 w-3 mr-2" />
                    Contact Us
                  </Button>
                  <p className="text-purple-200 text-sm mt-2">Perfect for large private schools & charter networks</p>
                </div>
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

      {/* Compliance Center Link */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Compliance & Privacy Center</h3>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Access our comprehensive compliance documentation including Privacy Policy, FERPA, HIPAA, 
            and Safety Protocols. Essential for Facebook plugins and third-party integrations.
          </p>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            onClick={() => {
              setLocation("/compliance");
              // Small delay to ensure navigation happens first, then scroll
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}
            data-testid="button-compliance-center"
          >
            View Compliance Center
          </Button>
        </div>
      </div>

      {/* Registration Assistant */}
      <div className="space-y-6">

        <RegistrationAssistant isOpen={isRegistrationAssistantOpen} setIsOpen={setIsRegistrationAssistantOpen} />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}