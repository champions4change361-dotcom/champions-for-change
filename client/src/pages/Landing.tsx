import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Zap, Globe, CreditCard, Star, Heart, GraduationCap, MapPin, Award, Mail, Phone } from "lucide-react";
import championLogo from "@assets/IMG_1442_1754896656003.jpeg";
import { DonationSection } from "@/components/DonationSection";
import Footer from "@/components/Footer";

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
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">Our Impact Mission</h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Revenue from this platform directly funds educational trips and opportunities for underprivileged youth. 
            When you choose our tournament management solution, you're not just organizing competitions—you're championing change in young lives.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Award className="h-4 w-4 mr-2 text-blue-600" />
                Leadership
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <p className="font-medium">Daniel Thornton</p>
                <p className="text-xs text-blue-600">Executive Director of Champions for Change</p>
                <p className="text-xs mt-1">21 years military service (Marines & Army) • Teaching & coaching at Robert Driscoll Middle School since 2016</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-green-600" />
                Contact
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-2 text-green-500" />
                  <a 
                    href="mailto:Champions4change361@gmail.com" 
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    data-testid="hero-email-link"
                  >
                    Champions4change361@gmail.com
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-2 text-blue-500" />
                  <a 
                    href="tel:361-300-1552" 
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    data-testid="hero-phone-link"
                  >
                    (361) 300-1552
                  </a>
                </div>
              </div>
            </div>
          </div>
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
            className="border-green-600 text-green-600 hover:bg-green-50 font-semibold"
            onClick={() => window.location.href = "/api/login"}
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

      {/* Tax Advantage Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Tax-Advantaged Business Investment</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg mb-6">
              100% tax-deductible business expense + Corporate Social Responsibility benefits + Educational mission impact
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Tax Benefits</h3>
                <p>Enterprise subscription: $5,988/year × 21% corporate rate = $1,257 annual tax savings</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">CSR Value</h3>
                <p>Stakeholder impact documentation, employee engagement, community reputation enhancement</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Mission Impact</h3>
                <p>Every subscription funds $2,600+ student educational trips in Corpus Christi, Texas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 dark:bg-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Investment Tiers - Optimized for Maximum Impact
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              Professional tournament management with tax advantages and educational mission support. 
              Pricing reflects enterprise-grade value delivery.
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <Badge className="bg-blue-100 text-blue-800">100% Tax Deductible</Badge>
              <Badge className="bg-purple-100 text-purple-800">CSR Benefits</Badge>
              <Badge className="bg-green-100 text-green-800">Educational Impact</Badge>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Value Positioning:</strong> Enterprise features + Tax benefits + Mission impact • 
              <strong>vs Jersey Watch:</strong> 65+ sports vs 15 sports, AI consultation vs basic templates, 
              100% revenue control vs 70% • <strong>vs Custom Development:</strong> $30k-100k setup cost avoided
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Foundation</CardTitle>
                <CardDescription>Schools & nonprofits</CardDescription>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-green-600">$79<span className="text-sm font-normal text-gray-500">/month</span></div>
                </div>
                <div className="text-sm text-blue-600 mb-2">$948/year • Effective: $747/year after tax benefits</div>
                <Badge variant="secondary" className="w-fit">Better than Jersey Watch</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Up to 8 tournaments/month</li>
                  <li>✓ 65+ sports library</li>
                  <li>✓ AI consultation system</li>
                  <li>✓ Student impact reporting</li>
                  <li>✓ Advanced bracket management</li>
                  <li>✓ 750 text/email alerts</li>
                  <li>✓ Tax-deductible business expense</li>
                </ul>
                <div className="mt-4 p-2 bg-green-50 rounded text-xs text-green-700">
                  Jersey Watch equivalent + AI + mission impact
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle>Champion</CardTitle>
                <CardDescription>Large districts & organizations</CardDescription>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-green-600">$199<span className="text-sm font-normal text-gray-500">/month</span></div>
                </div>
                <div className="text-sm text-blue-600 mb-2">$2,388/year • Effective: $1,886/year after tax benefits</div>
                <Badge variant="secondary" className="w-fit">Saves $500+ monthly on payment fees</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited tournaments</li>
                  <li>✓ AI tournament generation</li>
                  <li>✓ Payment processing (zero fees)</li>
                  <li>✓ Analytics dashboard</li>
                  <li>✓ Priority support</li>
                  <li>✓ Multi-user accounts</li>
                  <li>✓ Custom branding options</li>
                  <li>✓ 3,000 text/email alerts</li>
                </ul>
                <div className="mt-4 p-2 bg-green-50 rounded text-xs text-green-700">
                  Payment fee savings alone justify subscription cost
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600">Enterprise</Badge>
              </div>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>White-label platform ownership</CardDescription>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-green-600">$499<span className="text-sm font-normal text-gray-500">/month</span></div>
                </div>
                <div className="text-sm text-blue-600 mb-2">$5,988/year • Effective: $4,731/year after tax benefits</div>
                <Badge variant="secondary" className="w-fit">90% less than custom development</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Full website builder</li>
                  <li>✓ 100% your brand (zero our branding)</li>
                  <li>✓ Custom domain (yourorg.com)</li>
                  <li>✓ Revenue control (keep 100% fees)</li>
                  <li>✓ Full API access</li>
                  <li>✓ Dedicated account manager</li>
                  <li>✓ Custom development requests</li>
                  <li>✓ CMS platform (edit anytime)</li>
                  <li>✓ Full API access</li>
                  <li>✓ Dedicated account manager</li>
                  <li>✓ Custom development requests</li>
                  <li>✓ CMS platform (edit anytime)</li>
                </ul>
                <div className="mt-4 p-2 bg-purple-50 rounded text-xs text-purple-700">
                  Custom development alternative: $30k-100k + $2k-5k monthly
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600">District Scale</Badge>
              </div>
              <CardHeader>
                <CardTitle>District Enterprise</CardTitle>
                <CardDescription>Multi-school district management</CardDescription>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-3xl font-bold text-green-600">$999<span className="text-sm font-normal text-gray-500">/month</span></div>
                </div>
                <div className="text-sm text-blue-600 mb-2">$11,988/year • Effective: $9,469/year after tax benefits</div>
                <Badge variant="secondary" className="w-fit">Enterprise district management</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Everything in Enterprise tier</li>
                  <li>✓ Multi-school administration</li>
                  <li>✓ District-wide analytics</li>
                  <li>✓ Bulk user management (500+ users)</li>
                  <li>✓ Advanced permissions/roles</li>
                  <li>✓ School system integrations</li>
                  <li>✓ On-site training & setup</li>
                  <li>✓ Dedicated implementation team</li>
                </ul>
                <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
                  Manage entire district for less than one custom build
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
                  <h4 className="font-medium text-gray-900 dark:text-white">Unmatched Value:</h4>
                  <ul className="mt-2 space-y-1">
                    <li>• Enterprise: $149/month vs $30k+ custom build</li>
                    <li>• Full website builder (others don't offer)</li>
                    <li>• Complete white-label (others keep branding)</li>
                    <li>• API + custom development included</li>
                    <li>• Educational mission impact</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Competitive Comparison */}
          <div className="mt-12 bg-white dark:bg-gray-900 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Why Choose Champions for Change Over Competitors
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4 text-red-600">Jersey Watch</th>
                    <th className="text-center py-3 px-4 text-blue-600">TeamSnap</th>
                    <th className="text-center py-3 px-4 text-purple-600">SportsEngine</th>
                    <th className="text-center py-3 px-4 text-green-600 font-semibold">Champions for Change</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Monthly Cost</td>
                    <td className="text-center py-3 px-4">$42/month</td>
                    <td className="text-center py-3 px-4">$199/month</td>
                    <td className="text-center py-3 px-4">$250/month</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">$79-999/month</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Sports Covered</td>
                    <td className="text-center py-3 px-4">15</td>
                    <td className="text-center py-3 px-4">25</td>
                    <td className="text-center py-3 px-4">30</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">65+</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">AI Features</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">✅ Full AI consultation</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Custom Domains</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">Limited</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">✅ Unlimited</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Revenue Control</td>
                    <td className="text-center py-3 px-4">70%</td>
                    <td className="text-center py-3 px-4">90%</td>
                    <td className="text-center py-3 px-4">85%</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">✅ 100%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Educational Mission</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">✅ Champions for Change</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4 font-medium">Tax Benefits</td>
                    <td className="text-center py-3 px-4">Basic expense only</td>
                    <td className="text-center py-3 px-4">Basic expense only</td>
                    <td className="text-center py-3 px-4">Basic expense only</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">✅ Tax + CSR + Mission</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">White-Label Builder</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4">❌</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">✅ Full website builder</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 text-center">
              <Badge className="bg-green-100 text-green-800">
                Only platform with enterprise features + tax benefits + educational mission
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Section for Non-Users */}
      <section className="container mx-auto px-4 py-12">
        <DonationSection />
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
          <div className="text-green-200 mb-8 space-y-2">
            <p>Built by Daniel Thornton and coaches in Corpus Christi, Texas • Supporting students since day one</p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a 
                  href="mailto:Champions4change361@gmail.com" 
                  className="hover:text-white transition-colors"
                  data-testid="cta-email-link"
                >
                  Champions4change361@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <a 
                  href="tel:361-300-1552" 
                  className="hover:text-white transition-colors"
                  data-testid="cta-phone-link"
                >
                  (361) 300-1552
                </a>
              </div>
            </div>
          </div>
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
              className="border-white border-2 bg-transparent hover:bg-white hover:text-green-600 font-semibold px-6 button-outline-white"
              onClick={() => window.location.href = "/about"}
              data-testid="button-learn-more"
            >
              Learn About Our Mission
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}