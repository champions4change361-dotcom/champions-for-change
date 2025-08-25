import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, BookOpen, Activity, BarChart3, Clock, UserCheck, Award, Target, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import React, { useState } from "react";
import Footer from "@/components/Footer";
import RegistrationAssistant from "@/components/RegistrationAssistant";

export default function EducationHubLanding() {
  const [, setLocation] = useLocation();
  const [isRegistrationAssistantOpen, setIsRegistrationAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Professional Education Header */}
      <header className="relative border-b border-blue-500/20 bg-blue-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between lg:h-16">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full py-4 lg:py-0 space-y-4 lg:space-y-0">
              
              {/* Competitive Education Hub Logo */}
              <div className="flex items-center space-x-3 mb-5 lg:mb-0">
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Competitive Education Hub</h1>
                  <p className="text-xs text-blue-300">Complete School Athletics Management</p>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-blue-200">HIPAA/FERPA Ready</span>
                </div>
                <Badge variant="outline" className="border-blue-400 text-blue-300">
                  Educational Technology
                </Badge>
              </div>

              {/* Get Started and Demo Buttons */}
              <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-3 lg:ml-auto">
                <Button 
                  onClick={() => setLocation('/register')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                  data-testid="button-get-started-education"
                >
                  <UserCheck className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  Get Started
                </Button>
                <Button 
                  onClick={() => setLocation('/athletic-trainer-demo')}
                  variant="outline"
                  className="border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base w-full lg:w-auto"
                  data-testid="button-demo-education"
                >
                  <Activity className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                  See Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Professional Hero Section */}
      <div className="relative py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-6 bg-blue-600 text-white px-4 py-2">
              🏫 Educational Technology Platform
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Complete School Athletics
              <span className="block text-blue-300">Management System</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              HIPAA/FERPA compliant platform for managing student athletics, health monitoring, UIL academic competitions, and comprehensive school sports programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => setLocation('/athletic-trainer-dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
                data-testid="button-explore-platform"
              >
                <Activity className="mr-2 h-5 w-5" />
                Explore Platform
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => setLocation('/compliance')}
                className="border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white px-8 py-4 text-lg"
                data-testid="button-compliance-info"
              >
                <Shield className="mr-2 h-5 w-5" />
                Compliance Details
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features for Schools */}
      <div className="py-16 bg-blue-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Everything Schools Need</h2>
            <p className="text-blue-200 text-lg">Comprehensive management for athletics and academics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-blue-900/50 border-blue-600/30">
              <CardHeader className="text-center">
                <Activity className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Health Monitoring</CardTitle>
                <CardDescription className="text-blue-200">
                  AI-powered injury prediction and athletic trainer dashboards
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-900/50 border-blue-600/30">
              <CardHeader className="text-center">
                <BookOpen className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">UIL Management</CardTitle>
                <CardDescription className="text-blue-200">
                  Complete system for 50+ UIL academic competitions
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-900/50 border-blue-600/30">
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Compliance Ready</CardTitle>
                <CardDescription className="text-blue-200">
                  HIPAA/FERPA compliant with role-based access controls
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Comprehensive Platform Features */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Complete Educational Athletics Suite</h2>
            <p className="text-blue-200 text-lg">Manage every aspect of your school's competitive programs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-blue-900/30 border-blue-600/30">
              <CardHeader>
                <Users className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Student Management</CardTitle>
                <CardDescription className="text-blue-200">
                  Complete athlete profiles with health records and performance tracking
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-900/30 border-blue-600/30">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Performance Analytics</CardTitle>
                <CardDescription className="text-blue-200">
                  Advanced analytics for athletic performance and academic progress
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-900/30 border-blue-600/30">
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Smart Scheduling</CardTitle>
                <CardDescription className="text-blue-200">
                  Automated scheduling for games, practices, and trainer sessions
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-900/30 border-blue-600/30">
              <CardHeader>
                <AlertCircle className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Injury Prevention</CardTitle>
                <CardDescription className="text-blue-200">
                  AI-powered injury prediction with 95% accuracy rate
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-900/30 border-blue-600/30">
              <CardHeader>
                <Award className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Academic Competitions</CardTitle>
                <CardDescription className="text-blue-200">
                  Full UIL management from district to state championships
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-blue-900/30 border-blue-600/30">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Progress Tracking</CardTitle>
                <CardDescription className="text-blue-200">
                  Comprehensive reporting for administrators and parents
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing for Schools */}
      <div className="py-16 bg-blue-800/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Plans for Every School</h2>
            <p className="text-blue-200 text-lg">Start with private schools, scale to district-wide implementation</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-blue-900/50 border-blue-600/30">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Educational Partnership</CardTitle>
                <CardDescription className="text-blue-200">Perfect for smaller private schools</CardDescription>
                <div className="text-3xl font-bold text-blue-400 mt-4">$99<span className="text-lg text-blue-300">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Up to 200 students
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Essential athletics management
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Basic health monitoring
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  UIL academic competition tracking
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-900/50 border-blue-600/30 ring-2 ring-blue-500">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Private School Enterprise</CardTitle>
                <CardDescription className="text-blue-200">Complete solution for larger institutions</CardDescription>
                <div className="text-3xl font-bold text-blue-400 mt-4">$399<span className="text-lg text-blue-300">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Up to 1,500 students
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Advanced AI injury prediction
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Custom branding and training
                </div>
                <div className="flex items-center text-blue-200">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                  Priority support and onboarding
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <p className="text-blue-300 text-sm">
              Public school districts: SOC 2 Type II certification in progress for compliance requirements
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-blue-600/20 to-indigo-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Revolutionize Your School Athletics?</h2>
          <p className="text-blue-200 text-lg mb-8">
            Join forward-thinking schools using cutting-edge technology to manage student athletics and academics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => setLocation('/athletic-trainer-demo')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
              data-testid="button-schedule-demo"
            >
              <Activity className="mr-2 h-5 w-5" />
              Schedule Demo
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => setIsRegistrationAssistantOpen(true)}
              className="border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white px-8 py-4 text-lg"
              data-testid="button-get-started-education-cta"
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Get Started Today
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