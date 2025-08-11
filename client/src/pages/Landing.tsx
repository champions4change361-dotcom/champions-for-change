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
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-4xl font-bold mb-2">$2,600+</div>
              <div className="text-green-100">Per student trip cost</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-green-100">Profit goes to education</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">65+</div>
              <div className="text-green-100">Sports supported</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5-15</div>
              <div className="text-green-100">Students funded annually</div>
            </div>
          </div>
          <div className="mt-8 text-green-200 text-sm">
            With just 10 Champion subscribers, we can fund one complete student trip per year
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
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              Pricing designed for school districts and nonprofits. Every subscription directly funds educational opportunities for students in Corpus Christi, Texas.
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <Badge className="bg-blue-100 text-blue-800">School District Friendly</Badge>
              <Badge className="bg-purple-100 text-purple-800">Nonprofit Discounts Available</Badge>
              <Badge className="bg-green-100 text-green-800">Annual Savings</Badge>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>15% Cheaper</strong> than Jersey Watch, Toornament & better than Challonge • <strong>Nonprofit Discount:</strong> 25% off • <strong>Annual Plans:</strong> Save 2 months
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>School District</CardTitle>
                <CardDescription>15% cheaper than Jersey Watch Basic</CardDescription>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-green-600">$25<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <div className="text-sm text-red-500">vs. Jersey Watch $29</div>
                </div>
                <div className="text-sm text-blue-600 mb-2">$250/year (annual) • $187.50/year (nonprofit)</div>
                <Badge variant="secondary" className="w-fit">15% savings vs competitors</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Up to 10 tournaments per month</li>
                  <li>✓ Advanced bracket management</li>
                  <li>✓ 65+ sports library with AI</li>
                  <li>✓ School district portal</li>
                  <li>✓ Student impact reporting</li>
                  <li>✓ Bulk team registration</li>
                  <li>✓ 500 text/email alerts</li>
                </ul>
                <div className="mt-4 p-2 bg-green-50 rounded text-xs text-green-700">
                  $12-18/month goes to student trips after costs
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600">15% Cheaper</Badge>
              </div>
              <CardHeader>
                <CardTitle>Champion</CardTitle>
                <CardDescription>15% cheaper than Jersey Watch Plus</CardDescription>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-green-600">$42<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <div className="text-sm text-red-500">vs. Jersey Watch $49</div>
                </div>
                <div className="text-sm text-blue-600 mb-2">$420/year (annual) • $315/year (nonprofit)</div>
                <Badge variant="secondary" className="w-fit">Best value vs competitors</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited tournaments</li>
                  <li>✓ AI tournament generation</li>
                  <li>✓ Payment processing (no fees)</li>
                  <li>✓ Analytics dashboard</li>
                  <li>✓ Priority support</li>
                  <li>✓ Multi-user accounts</li>
                  <li>✓ Custom branding options</li>
                  <li>✓ 2,000 text/email alerts</li>
                </ul>
                <div className="mt-4 p-2 bg-green-50 rounded text-xs text-green-700">
                  $22-28/month goes to student trips after costs
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500">
              <CardHeader>
                <CardTitle>Enterprise White-Label</CardTitle>
                <CardDescription>Full website builder + tournament platform</CardDescription>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-green-600">$73<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <div className="text-sm text-red-500">vs. Toornament €79 ($86)</div>
                </div>
                <div className="text-sm text-blue-600 mb-2">$730/year (annual) • $547.50/year (nonprofit)</div>
                <Badge variant="secondary" className="w-fit">Complete website solution</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ <strong>Website Builder:</strong> Create custom pages</li>
                  <li>✓ <strong>Your Branding:</strong> Remove our logo entirely</li>
                  <li>✓ <strong>Custom Domain:</strong> yourorganization.com</li>
                  <li>✓ <strong>Content Management:</strong> Edit pages/content</li>
                  <li>✓ <strong>Revenue Sharing:</strong> Keep tournament fees</li>
                  <li>✓ <strong>API Access:</strong> Custom integrations</li>
                  <li>✓ <strong>Dedicated Support:</strong> Personal account manager</li>
                  <li>✓ <strong>Training Included:</strong> Setup & onboarding</li>
                </ul>
                <div className="mt-4 p-2 bg-purple-50 rounded text-xs text-purple-700">
                  Full website + tournament platform under your brand
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                    School District Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• Budget-friendly pricing</li>
                    <li>• Educational impact focus</li>
                    <li>• Bulk registration tools</li>
                    <li>• Student progress tracking</li>
                    <li>• Grant-friendly invoicing</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-purple-600" />
                    Nonprofit Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• 25% nonprofit discount</li>
                    <li>• 501(c)(3) verification</li>
                    <li>• Mission alignment</li>
                    <li>• Impact documentation</li>
                    <li>• Tax-deductible receipts</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-600" />
                    White-Label Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    <li>• <strong>Website Builder:</strong> Create custom pages</li>
                    <li>• <strong>Your Domain:</strong> yourorganization.com</li>
                    <li>• <strong>Your Branding:</strong> Logo, colors, messaging</li>
                    <li>• <strong>Revenue Control:</strong> Keep tournament fees</li>
                    <li>• <strong>Content Management:</strong> Full page editing</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                Transparent Educational Funding Model
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Platform Costs:</h4>
                  <ul className="mt-2 space-y-1">
                    <li>• Hosting & infrastructure: ~$45/month</li>
                    <li>• Payment processing: 2.9% + 30¢</li>
                    <li>• Development & support</li>
                    <li>• Educational compliance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Student Impact:</h4>
                  <ul className="mt-2 space-y-1">
                    <li>• Trip cost: $2,600+ per student</li>
                    <li>• Multiple tour companies</li>
                    <li>• 100% profit to education</li>
                    <li>• Quarterly impact reports</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Competitive Advantage:</h4>
                  <ul className="mt-2 space-y-1">
                    <li>• 15% cheaper than Jersey Watch</li>
                    <li>• 15% cheaper than Toornament</li>
                    <li>• Better features than Challonge</li>
                    <li>• Educational mission focus</li>
                    <li>• 13 Champions = 1 trip/year funded</li>
                  </ul>
                </div>
              </div>
            </div>
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