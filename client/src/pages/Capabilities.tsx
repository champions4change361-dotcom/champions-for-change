import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, Users, Shield, Brain, Heart, Star, CheckCircle, Building, 
  GraduationCap, Award, Target, Zap, Calendar, BarChart3, 
  UserCheck, Globe, Lock, ArrowRight, School, Church
} from "lucide-react";
import { useLocation } from "wouter";

export default function Capabilities() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="relative border-b border-green-500/20 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')}
                className="text-white hover:text-green-400"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Platform Capabilities
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Comprehensive Athletic & Academic Management Platform designed for private schools, 
            charter schools, and educational organizations seeking enterprise-grade solutions.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
              <School className="h-4 w-4 mr-2" />
              Private Schools Ready
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
              <Building className="h-4 w-4 mr-2" />
              Charter Schools Supported
            </Badge>
            <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
              <Church className="h-4 w-4 mr-2" />
              Community Organizations
            </Badge>
          </div>
        </div>

        {/* Perfect For Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Perfect For Your Organization</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-800 border-green-500/30 hover:border-green-400/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <School className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-green-400">Private Schools</CardTitle>
                <CardDescription className="text-slate-300">
                  Independent educational institutions with flexible vendor requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    No federal compliance barriers
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    Flexible vendor selection process
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    Enterprise features for all sizes
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                    Custom branding available
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-blue-500/30 hover:border-blue-400/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-blue-400">Charter Schools</CardTitle>
                <CardDescription className="text-slate-300">
                  Public charter schools with independent operational authority
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    Autonomous vendor decisions
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    Budget-conscious pricing
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    Multi-campus coordination
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                    Performance tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-purple-500/30 hover:border-purple-400/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Church className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-purple-400">Community Organizations</CardTitle>
                <CardDescription className="text-slate-300">
                  Churches, nonprofits, and youth organizations running tournaments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    Mission-aligned pricing
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    Community-focused features
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    Tournament management
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                    Youth development tools
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Capabilities */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Enterprise-Grade Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Athletic Management */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Trophy className="h-5 w-5 text-green-400" />
                </div>
                <CardTitle className="text-green-400">Athletic Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Multi-sport coordination</li>
                  <li>• Roster & eligibility tracking</li>
                  <li>• Equipment management</li>
                  <li>• Performance analytics</li>
                  <li>• Season planning</li>
                </ul>
              </CardContent>
            </Card>

            {/* Health & Safety */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Heart className="h-5 w-5 text-red-400" />
                </div>
                <CardTitle className="text-red-400">Health & Safety</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• AI injury prediction (95% accuracy)</li>
                  <li>• Health communication system</li>
                  <li>• Athletic trainer dashboards</li>
                  <li>• Emergency protocols</li>
                  <li>• Medical form tracking</li>
                </ul>
              </CardContent>
            </Card>

            {/* Academic Competition */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                  <GraduationCap className="h-5 w-5 text-blue-400" />
                </div>
                <CardTitle className="text-blue-400">Academic Competitions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• 50+ UIL academic events</li>
                  <li>• District to state progression</li>
                  <li>• TEKS alignment tracking</li>
                  <li>• Performance scoring</li>
                  <li>• Achievement recognition</li>
                </ul>
              </CardContent>
            </Card>

            {/* Budget Management */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="h-5 w-5 text-yellow-400" />
                </div>
                <CardTitle className="text-yellow-400">Budget Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• Excel-style budget systems</li>
                  <li>• Multi-department allocation</li>
                  <li>• Real-time expense tracking</li>
                  <li>• Compliance reporting</li>
                  <li>• Grant fund management</li>
                </ul>
              </CardContent>
            </Card>

            {/* Smart Scheduling */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Calendar className="h-5 w-5 text-purple-400" />
                </div>
                <CardTitle className="text-purple-400">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• AI conflict detection</li>
                  <li>• Multi-facility coordination</li>
                  <li>• Transportation scheduling</li>
                  <li>• Parent notifications</li>
                  <li>• Event management</li>
                </ul>
              </CardContent>
            </Card>

            {/* AI Integration */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Brain className="h-5 w-5 text-cyan-400" />
                </div>
                <CardTitle className="text-cyan-400">AI Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• AI assistant on all forms</li>
                  <li>• Predictive analytics</li>
                  <li>• Automated recommendations</li>
                  <li>• Natural language queries</li>
                  <li>• Smart data entry</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Competitive Advantages */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Why Choose Champions for Change</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-6">Mission-Driven Advantage</h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start">
                  <Star className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>501(c)(3) Nonprofit Status:</strong> Platform revenue funds educational trips for underprivileged youth
                  </div>
                </li>
                <li className="flex items-start">
                  <Star className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Grant Funding Access:</strong> Federal grants, foundation funding, and corporate philanthropy unavailable to commercial competitors
                  </div>
                </li>
                <li className="flex items-start">
                  <Star className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Authentic Mission:</strong> Cannot be replicated by commercial software companies
                  </div>
                </li>
                <li className="flex items-start">
                  <Star className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Educational Impact:</strong> Every subscription directly supports student opportunities
                  </div>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-blue-400 mb-6">Technical Superiority</h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>95% AI Prediction Accuracy:</strong> Industry-leading injury prediction vs. 0% for RankOne Sport
                  </div>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>District-Wide Coordination:</strong> Multi-school management vs. single-school systems
                  </div>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Integrated ERP System:</strong> Complete platform vs. isolated modules
                  </div>
                </li>
                <li className="flex items-start">
                  <Zap className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Enterprise for All:</strong> Same features regardless of organization size
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Future Expansion */}
        <div className="mb-20">
          <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-orange-400" />
              </div>
              <CardTitle className="text-2xl text-white">Expanding Access</CardTitle>
              <CardDescription className="text-slate-300 text-lg">
                Building toward comprehensive educational coverage
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3">Currently Serving</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li>✓ Private Schools (All Sizes)</li>
                    <li>✓ Charter Schools</li>
                    <li>✓ Community Organizations</li>
                    <li>✓ Religious Institutions</li>
                    <li>✓ Youth Organizations</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-blue-400 mb-3">Future Expansion</h4>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Public School Districts</li>
                    <li>• State Athletic Associations</li>
                    <li>• Higher Education</li>
                    <li>• International Schools</li>
                    <li>• Professional Organizations</li>
                  </ul>
                  <p className="text-sm text-slate-400 mt-4">
                    *Pending SOC II Type 2 and ISO 27001 certifications
                  </p>
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-orange-400 mb-3">Security Certification Progress</h4>
                <p className="text-slate-300 mb-4">
                  We're actively pursuing industry-standard security certifications to serve public school districts. 
                  Our nonprofit status provides access to $150K+ in federal grants and foundation funding specifically 
                  for these certifications - a competitive advantage unavailable to commercial competitors.
                </p>
                <div className="flex justify-center space-x-4">
                  <Badge className="bg-orange-600 text-white">SOC II Type 2 - In Progress</Badge>
                  <Badge className="bg-orange-600 text-white">ISO 27001 - In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Athletic Program?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Join private schools and educational organizations already using Champions for Change 
            to revolutionize their athletic and academic management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation('/register')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              onClick={() => setLocation('/pricing')}
              variant="outline"
              className="border-green-500 text-green-400 hover:bg-green-500/10 px-8 py-3 text-lg"
            >
              View Pricing Plans
            </Button>
          </div>
          
          <div className="mt-8">
            <p className="text-sm text-slate-400">
              Questions about your specific needs? 
              <button 
                onClick={() => setLocation('/login-support')}
                className="text-green-400 hover:text-green-300 ml-1 underline"
              >
                Contact our education specialists
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}