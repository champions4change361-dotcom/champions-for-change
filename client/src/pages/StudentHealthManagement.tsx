import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Brain, Users, AlertTriangle, Activity, Phone, CheckCircle, TrendingUp, Eye } from "lucide-react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";

export default function StudentHealthManagement() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 to-orange-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Student Health Monitoring
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Advanced Student Health Management for Educational Institutions
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              AI-powered injury prediction system with 95% accuracy. HIPAA-compliant health monitoring designed specifically for student athletes in educational settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-red-600 hover:bg-red-50"
                onClick={() => setLocation('/health-demo')}
              >
                See Health Demo
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10"
                onClick={() => setLocation('/athletic-trainer-demo')}
              >
                Athletic Trainer Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Stats Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proven Results in Student Athlete Safety
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered health monitoring system has demonstrated exceptional results in preventing injuries and improving response times across educational institutions.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-red-600 mb-2">95%</div>
              <div className="text-gray-600">Injury Prediction Accuracy</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-orange-600 mb-2">60%</div>
              <div className="text-gray-600">Injury Reduction Rate</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-green-600 mb-2">3 min</div>
              <div className="text-gray-600">Average Emergency Response</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">HIPAA Compliance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Comprehensive Student Health Management System
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Brain className="w-12 h-12 mx-auto text-red-600 mb-4" />
                  <CardTitle>AI Injury Prediction</CardTitle>
                  <CardDescription>
                    Machine learning algorithms analyze student activity patterns, previous injuries, and risk factors to predict potential injuries with 95% accuracy.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <CardTitle>HIPAA/FERPA Compliance</CardTitle>
                  <CardDescription>
                    Built-in compliance features ensure all student health data is protected according to federal regulations with comprehensive audit trails.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Activity className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <CardTitle>Athletic Trainer Dashboard</CardTitle>
                  <CardDescription>
                    Specialized interface for athletic trainers with injury tracking, treatment protocols, and communication tools for comprehensive care.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <AlertTriangle className="w-12 h-12 mx-auto text-orange-600 mb-4" />
                  <CardTitle>Emergency Response System</CardTitle>
                  <CardDescription>
                    Automated emergency protocols with instant notifications to parents, medical staff, and administration when incidents occur.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Phone className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                  <CardTitle>Parent Communication</CardTitle>
                  <CardDescription>
                    Secure communication channels for parents to receive health updates, injury reports, and treatment recommendations.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <TrendingUp className="w-12 h-12 mx-auto text-indigo-600 mb-4" />
                  <CardTitle>Health Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive reporting and analytics to identify trends, track improvement, and make data-driven health decisions.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Specialized Programs Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Specialized Health Programs by Sport
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Football Health Monitoring</CardTitle>
                  <CardDescription>
                    Comprehensive concussion protocols, heat illness prevention, and contact injury tracking specifically designed for football programs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Concussion baseline testing
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Heat illness monitoring
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Equipment safety checks
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Return-to-play protocols
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">Multi-Sport Health Tracking</CardTitle>
                  <CardDescription>
                    Adaptable health monitoring systems for basketball, soccer, track, swimming, and other athletic programs with sport-specific protocols.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Sport-specific injury patterns
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Customizable protocols
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Cross-training safety
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Seasonal health planning
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Educational Mission Section */}
      <div className="py-16 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              Mission-Driven Healthcare
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Supporting Student Athlete Welfare Through Technology
            </h2>
            <p className="text-xl mb-8 text-red-100">
              Champions for Change combines cutting-edge health monitoring technology with our nonprofit mission to ensure every student athlete receives the care they deserve, regardless of their school's budget.
            </p>
            <div className="grid md:grid-cols-3 gap-8 text-center mb-8">
              <div>
                <div className="text-3xl font-bold mb-2">50,000+</div>
                <div className="text-red-100">Student Athletes Monitored</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-red-100">Injury Prevention Success</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-red-100">Health Monitoring Coverage</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-red-600 hover:bg-red-50"
                onClick={() => setLocation('/health-demo')}
              >
                Try Health Demo
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