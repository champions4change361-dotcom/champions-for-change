import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Heart, GraduationCap, MapPin, Award, Mail, Phone, Users, Target, Star } from "lucide-react";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";
import Footer from "@/components/Footer";
import { Link } from "wouter";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <img 
              src={championLogo} 
              alt="Champions for Change" 
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Champions for Change</div>
              <div className="text-sm text-green-600 font-medium">About Our Mission</div>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/"}
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Mission Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Heart className="h-3 w-3 mr-1" />
          Our Educational Mission
        </Badge>
        
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Champions for Change Story
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto">
          Founded by coaches who saw firsthand the challenges of tournament management and the funding needs 
          of educational programs for underprivileged youth in Corpus Christi, Texas.
        </p>
      </section>

      {/* Leadership Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Leadership</h2>
          
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Daniel Thornton</CardTitle>
              <CardDescription className="text-lg text-blue-600">Executive Director & Founder</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-green-600" />
                    Military Service
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    21 years of distinguished military service, beginning with the Marines before transferring to the Army. 
                    This veteran leadership experience instilled the discipline and dedication that drives our mission today.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                    Education & Coaching
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    After retiring from military service, Daniel earned his teaching certificate and moved to Corpus Christi, Texas in 2016. 
                    Since then, he's accumulated 10 years of secondary athletic coaching experience at Robert Driscoll Middle School, directly impacting student lives daily.
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Vision & Mission</h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  "Having served our country and now serving our students, I understand the transformative power of opportunities. 
                  Every tournament managed on our platform directly funds educational trips that open new worlds for underprivileged youth. 
                  This isn't just a business—it's a mission to champion change through sports and education."
                </p>
              </div>
              
              <div className="flex justify-center gap-6 pt-4">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-green-600" />
                  <a 
                    href="mailto:Champions4change361@gmail.com" 
                    className="text-blue-600 hover:text-blue-800"
                    data-testid="about-email-link"
                  >
                    Champions4change361@gmail.com
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  <a 
                    href="tel:361-300-1552" 
                    className="text-blue-600 hover:text-blue-800"
                    data-testid="about-phone-link"
                  >
                    (361) 300-1552
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Impact Mission */}
      <section className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Our Educational Impact</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-6 w-6 mr-2 text-green-600" />
                  The Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li>• Many students in Corpus Christi lack access to educational travel opportunities</li>
                  <li>• Educational trips cost $2,600+ per student through tour companies</li>
                  <li>• School districts struggle with limited budgets for enrichment programs</li>
                  <li>• Tournament management systems are expensive and poorly designed</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-6 w-6 mr-2 text-blue-600" />
                  Our Solution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li>• 100% of platform profits fund student educational trips</li>
                  <li>• Coach-built platform that actually meets tournament needs</li>
                  <li>• Affordable pricing designed for school district budgets</li>
                  <li>• Direct impact: Every subscription helps send students on life-changing trips</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 max-w-4xl mx-auto text-center">
            <h3 className="text-xl font-bold text-blue-800 dark:text-blue-200 mb-4">Transparent Impact Model</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-2xl font-bold text-green-600 mb-2">$2,600+</div>
                <p className="text-blue-700 dark:text-blue-300">Cost per student for educational trips through tour companies</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-2">100%</div>
                <p className="text-blue-700 dark:text-blue-300">Platform profits directed to student education funding</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 mb-2">5-15</div>
                <p className="text-blue-700 dark:text-blue-300">Students we can fund annually with current growth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Story */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Why We Built This Platform</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-purple-600" />
                Coach-Identified Problems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                As active coaches, we experienced firsthand the frustrations with existing tournament management systems:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Clunky interfaces that coaches couldn't navigate</li>
                <li>• Missing features essential for real tournament management</li>
                <li>• High costs that strained school budgets</li>
                <li>• No connection to educational or community impact</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-6 w-6 mr-2 text-green-600" />
                Our Innovative Approach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We designed a platform that solves both problems simultaneously:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Built BY coaches FOR coaches with real-world tournament experience</li>
                <li>• Every feature tested in actual tournament environments</li>
                <li>• Pricing that respects school district budget realities</li>
                <li>• Revenue model that directly supports student education</li>
                <li>• AI-powered features that save time and improve tournament quality</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            When you choose Champions for Change, you're not just getting tournament management software—
            you're directly funding educational opportunities for students who need them most.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-start-mission"
            >
              Start Supporting Students Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white border-2 bg-transparent hover:bg-white hover:text-green-600 font-semibold px-6 button-outline-white"
              onClick={() => window.location.href = "/"}
              data-testid="button-back-home-cta"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}