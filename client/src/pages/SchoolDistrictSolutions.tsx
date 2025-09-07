import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, DollarSign, Shield, BookOpen, Trophy, Target, CheckCircle, BarChart3, Calendar, Settings } from "lucide-react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function SchoolDistrictSolutions() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Complete District Management System
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              School District Athletic & Academic Management Solutions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Comprehensive ERP system designed for educational districts. Manage athletics, academics, budgets, and organizational oversight across multiple schools with enterprise-grade security and compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setLocation('/district-login')}
              >
                District Portal Login
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation('/capabilities')}
              >
                View Full Platform
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* District Challenges Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Solving Complex District Management Challenges
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built by educators for educators, our platform addresses the unique challenges facing school districts in managing comprehensive athletic and academic programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Building2 className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Multi-School Coordination</CardTitle>
                <CardDescription>
                  Manage athletic programs, budgets, and resources across multiple schools within your district from a single, unified platform.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <CardTitle>Budget Management</CardTitle>
                <CardDescription>
                  Excel-style budget tracking with CCISD categories, real-time allocation monitoring, and comprehensive financial oversight.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 mx-auto text-red-600 mb-4" />
                <CardTitle>Compliance & Security</CardTitle>
                <CardDescription>
                  Built-in HIPAA/FERPA compliance with role-based access controls and comprehensive audit trails for educational data.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                <CardTitle>Academic Competitions</CardTitle>
                <CardDescription>
                  Comprehensive UIL competition management for 50+ events across grades 2-12 with advancement tracking and TEKS alignment.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Trophy className="w-12 h-12 mx-auto text-orange-600 mb-4" />
                <CardTitle>Athletic Program Oversight</CardTitle>
                <CardDescription>
                  District-wide athletic coordination with health monitoring, trainer scheduling, and comprehensive program management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
                <CardTitle>Role-Based Access</CardTitle>
                <CardDescription>
                  5-tier hierarchy from district to student level with granular permissions ensuring data security and appropriate access.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Comprehensive Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Complete District ERP System
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-blue-600">Administrative Management</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">Interactive Organizational Charts</div>
                      <div className="text-gray-600 text-sm">Visual district structure with role hierarchy and reporting relationships</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">Excel-Style Budget System</div>
                      <div className="text-gray-600 text-sm">CCISD-compatible budget categories with real-time tracking and allocation</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">Cross-School Coordination</div>
                      <div className="text-gray-600 text-sm">Unified management of programs across multiple schools and campuses</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">Comprehensive Reporting</div>
                      <div className="text-gray-600 text-sm">District-wide analytics and reporting for compliance and oversight</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 text-purple-600">Academic & Athletic Programs</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">50+ UIL Competition Management</div>
                      <div className="text-gray-600 text-sm">Complete academic competition oversight from district to state level</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">AI-Powered Health Monitoring</div>
                      <div className="text-gray-600 text-sm">95% accurate injury prediction with athletic trainer coordination</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">Multi-Sport Tournament Hosting</div>
                      <div className="text-gray-600 text-sm">District-wide tournament management with revenue tracking</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1" />
                    <div>
                      <div className="font-medium">Family Communication Systems</div>
                      <div className="text-gray-600 text-sim">Secure parent portals with privacy controls and emergency notifications</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing for Districts Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Transparent District Pricing
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-2 border-blue-200">
                <CardHeader className="text-center">
                  <Badge className="mb-2 bg-blue-100 text-blue-800">Most Popular</Badge>
                  <CardTitle className="text-2xl text-blue-600">Independent School Pro</CardTitle>
                  <div className="text-4xl font-bold text-gray-900">$199<span className="text-lg font-normal">/month</span></div>
                  <CardDescription>Up to 500 students • Complete athletic & academic management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Full athletic management suite
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Academic competition tracking
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      AI injury prediction
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Budget management tools
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Basic support included
                    </li>
                  </ul>
                  <Button className="w-full mt-6" onClick={() => setLocation('/register')}>
                    Start Free Trial
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-200">
                <CardHeader className="text-center">
                  <Badge className="mb-2 bg-indigo-100 text-indigo-800">Enterprise</Badge>
                  <CardTitle className="text-2xl text-indigo-600">Private School Enterprise</CardTitle>
                  <div className="text-4xl font-bold text-gray-900">$399<span className="text-lg font-normal">/month</span></div>
                  <CardDescription>Up to 1,500 students • Advanced analytics & custom branding</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      All Pro features included
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Advanced analytics dashboard
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Custom branding options
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Priority support & training
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      Multi-sport coordination
                    </li>
                  </ul>
                  <Button className="w-full mt-6" onClick={() => setLocation('/business-register')}>
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                <strong>Enterprise Equality Philosophy:</strong> Small districts get the same enterprise features as large districts - we don't limit features based on size.
              </p>
              <Badge className="bg-green-100 text-green-800">
                Guaranteed Pricing: The price you pay today is the price you always pay
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Impact Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Educational Impact
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Every District Subscription Supports Educational Equity
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Champions for Change is a nonprofit organization. Every subscription directly funds educational opportunities and trips for underprivileged students across Texas and beyond.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center mb-8">
              <div>
                <div className="text-4xl font-bold mb-2">75+</div>
                <div className="text-blue-100">School Districts Served</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">125,000+</div>
                <div className="text-blue-100">Students Impacted</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">$2M+</div>
                <div className="text-blue-100">Educational Funding Generated</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setLocation('/district-login')}
              >
                Access District Portal
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation('/nonprofit-donation')}
              >
                Support Our Mission
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}