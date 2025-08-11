import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Heart, GraduationCap, MapPin } from "lucide-react";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={championLogo} 
              alt="Champions for Change" 
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">Champions for Change</div>
              <div className="text-sm text-green-600 font-medium">Tournament Management Platform</div>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            className="bg-green-600 hover:bg-green-700"
            data-testid="button-login"
          >
            Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Mission Banner */}
      <section className="bg-green-600 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <Heart className="h-4 w-4" />
            <span>Built by coaches to fund educational opportunities for underprivileged youth in Corpus Christi, Texas</span>
            <MapPin className="h-4 w-4" />
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-100">
          <GraduationCap className="h-3 w-3 mr-1" />
          Supporting Student Education Through Sports
        </Badge>
        
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Tournament Platform That <span className="text-green-600">Champions Change</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-4xl mx-auto">
          Professional tournament management platform built by coaches who identified needs in the tournament world. 
          Every subscription helps fund student trips and educational opportunities for middle schools in Corpus Christi, Texas.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Our Impact Mission</h3>
          <p className="text-blue-700 dark:text-blue-300">
            Revenue from this platform directly funds educational trips and opportunities for underprivileged youth. 
            When you choose our tournament management solution, you're not just organizing competitions—you're championing change in young lives.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started"
          >
            Start Supporting Students
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50"
            data-testid="button-view-demo"
          >
            View Platform Demo
          </Button>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Making a Real Difference</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-green-100">Revenue goes to education</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">65+</div>
              <div className="text-green-100">Sports supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">∞</div>
              <div className="text-green-100">Student futures changed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Professional Tournament Management
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Built by coaches who understand the tournament world. Every feature designed to streamline your competitions while supporting student education.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-green-200 hover:border-green-400 transition-colors">
            <CardHeader>
              <Zap className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>AI-Powered Creation</CardTitle>
              <CardDescription>
                Generate complete tournaments instantly with our AI consultation system across 65+ sports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader>
              <Globe className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>White-Label Ready</CardTitle>
              <CardDescription>
                Launch under your brand with custom domains, colors, logos, and complete customization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-200 hover:border-purple-400 transition-colors">
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Multi-Sport Support</CardTitle>
              <CardDescription>
                Comprehensive coverage from team sports to individual competitions, esports to academics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-200 hover:border-orange-400 transition-colors">
            <CardHeader>
              <CreditCard className="h-10 w-10 text-orange-600 mb-4" />
              <CardTitle>Payment Integration</CardTitle>
              <CardDescription>
                Built-in Stripe integration for entry fees, subscriptions, and revenue sharing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-yellow-200 hover:border-yellow-400 transition-colors">
            <CardHeader>
              <Trophy className="h-10 w-10 text-yellow-600 mb-4" />
              <CardTitle>Professional Brackets</CardTitle>
              <CardDescription>
                Interactive tournament brackets with real-time updates and multiple format support
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-red-200 hover:border-red-400 transition-colors">
            <CardHeader>
              <Star className="h-10 w-10 text-red-600 mb-4" />
              <CardTitle>Coach-Built Features</CardTitle>
              <CardDescription>
                Designed by coaches for coaches with real-world tournament management experience
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Sports Categories */}
      <section className="container mx-auto px-4 py-20 bg-white dark:bg-gray-900 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Comprehensive Sports Coverage
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Team Sports", "Individual Sports", "Combat Sports", "Water Sports",
            "Winter Sports", "Esports", "Academic Competitions", "Culinary Competitions",
            "Professional Services", "Creative Arts", "Extreme Sports"
          ].map((category, index) => (
            <div key={index} className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{category}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Impact Level
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Every subscription directly funds educational opportunities for students in Corpus Christi, Texas. 
              Choose the plan that fits your needs and maximizes your impact.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Supporter</CardTitle>
                <CardDescription>Perfect for small tournaments</CardDescription>
                <div className="text-3xl font-bold text-green-600">$19<span className="text-sm font-normal text-gray-500">/month</span></div>
                <Badge variant="secondary" className="w-fit">Funds 1 student trip/year</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Up to 5 tournaments per month</li>
                  <li>✓ Basic bracket management</li>
                  <li>✓ 65+ sports library</li>
                  <li>✓ Community support</li>
                  <li>✓ Impact reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Champion</CardTitle>
                <CardDescription>For growing organizations</CardDescription>
                <div className="text-3xl font-bold text-green-600">$49<span className="text-sm font-normal text-gray-500">/month</span></div>
                <Badge variant="secondary" className="w-fit">Funds 3 student trips/year</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited tournaments</li>
                  <li>✓ AI tournament generation</li>
                  <li>✓ Payment processing</li>
                  <li>✓ Analytics dashboard</li>
                  <li>✓ Priority support</li>
                  <li>✓ Detailed impact reports</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle>Game Changer</CardTitle>
                <CardDescription>White-label solution</CardDescription>
                <div className="text-3xl font-bold text-green-600">$149<span className="text-sm font-normal text-gray-500">/month</span></div>
                <Badge variant="secondary" className="w-fit">Funds 8+ student trips/year</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Complete white-labeling</li>
                  <li>✓ Custom domain & branding</li>
                  <li>✓ Revenue sharing options</li>
                  <li>✓ API access</li>
                  <li>✓ Dedicated support</li>
                  <li>✓ Student scholarship naming rights</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Champion Change Through Sports?
          </h2>
          <p className="text-xl text-green-100 mb-4 max-w-3xl mx-auto">
            Join coaches and organizations who are transforming tournament management while funding student education
          </p>
          <p className="text-green-200 mb-8">
            Built by coaches in Corpus Christi, Texas • Supporting students since day one
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-start-supporting"
            >
              Start Supporting Students Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
              data-testid="button-learn-more"
            >
              Learn About Our Mission
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src={championLogo} 
                  alt="Champions for Change" 
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-xl font-bold">Champions for Change</span>
              </div>
              <p className="text-gray-400 mb-4">
                Tournament management platform built by coaches to fund educational opportunities for underprivileged youth.
              </p>
              <div className="flex items-center space-x-2 text-green-400">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Corpus Christi, Texas</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform Features</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>AI Tournament Generation</li>
                <li>65+ Sports Coverage</li>
                <li>White-Label Solutions</li>
                <li>Payment Processing</li>
                <li>Analytics & Reporting</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Our Impact</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>100% Revenue to Education</li>
                <li>Student Trip Funding</li>
                <li>Educational Opportunities</li>
                <li>Coach-to-Coach Support</li>
                <li>Community Building</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Champions for Change. Every tournament managed helps fund student education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}