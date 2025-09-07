import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Heart, Users, GraduationCap, Target, Award, BookOpen, Building2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function EducationalAthletics() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Educational Athletic Management
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Comprehensive Athletic Management for Educational Institutions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-emerald-100">
              HIPAA/FERPA compliant platform designed specifically for schools, districts, and educational organizations. Manage athletics, academics, and student health with enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-emerald-50"
                onClick={() => setLocation('/register')}
              >
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation('/nonprofit-donation')}
              >
                Learn About Our Mission
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Educational Institutions Choose Champions for Change
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for schools and districts by educators who understand the unique challenges of managing athletic programs in educational settings.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="w-12 h-12 mx-auto text-emerald-600 mb-4" />
                <CardTitle>HIPAA/FERPA Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security designed specifically for educational institutions with comprehensive audit trails and data protection.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <CardTitle>Student Health Monitoring</CardTitle>
                <CardDescription>
                  AI-powered injury prediction (95% accuracy) with athletic trainer dashboards and emergency response protocols.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <GraduationCap className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Academic Integration</CardTitle>
                <CardDescription>
                  Comprehensive academic competition management for 50+ UIL events with TEKS alignment and advancement tracking.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* Comprehensive Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Complete Educational Athletic Management System
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-emerald-600">District & School Management</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Interactive organizational charts
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Excel-style budget management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Multi-school coordination
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Role-based access control
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-blue-600">Academic Competitions</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    50+ UIL competition management
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    District to state advancement
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    TEKS curriculum alignment
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Grades 2-12 support
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-red-600">Health & Safety</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    AI injury prediction system
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Athletic trainer dashboards
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Emergency protocols
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Parent communication systems
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-600">Tournament Management</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Multi-sport tournament hosting
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Registration & payment processing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Live scoring & updates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Custom branding options
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Impact Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800">
              Mission-Driven Technology
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Supporting Educational Opportunities for Underprivileged Youth
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Champions for Change is a nonprofit organization dedicated to funding educational trips and opportunities for underprivileged students. Every subscription directly supports our mission to provide life-changing experiences for young athletes and scholars.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">100,000+</div>
                <div className="text-gray-600">Students Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">School Districts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">$1M+</div>
                <div className="text-gray-600">Educational Funding</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Educational Athletic Program?
            </h2>
            <p className="text-xl mb-8 text-emerald-100">
              Join hundreds of schools and districts using our comprehensive platform to manage athletics, academics, and student health while supporting educational equity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-emerald-50"
                onClick={() => setLocation('/register')}
              >
                Start Free Trial Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation('/capabilities')}
              >
                View Full Capabilities
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}