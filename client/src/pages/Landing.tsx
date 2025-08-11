import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Zap, Globe, CreditCard, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">TournamentPro</span>
          </div>
          <Button 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Login / Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Complete White-Label Tournament Management Platform
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
          Launch your own branded tournament platform in minutes. AI-powered tournament creation, 
          comprehensive sports coverage, and everything you need to run professional competitions.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-get-started"
          >
            Get Started Free
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            data-testid="button-view-demo"
          >
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Everything You Need for Tournament Management
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-blue-600 mb-4" />
              <CardTitle>AI-Powered Creation</CardTitle>
              <CardDescription>
                Generate complete tournaments instantly with our AI consultation system across 65+ sports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-green-600 mb-4" />
              <CardTitle>White-Label Ready</CardTitle>
              <CardDescription>
                Launch under your brand with custom domains, colors, logos, and complete customization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-purple-600 mb-4" />
              <CardTitle>Multi-Sport Support</CardTitle>
              <CardDescription>
                Comprehensive coverage from team sports to individual competitions, esports to academics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CreditCard className="h-10 w-10 text-orange-600 mb-4" />
              <CardTitle>Payment Integration</CardTitle>
              <CardDescription>
                Built-in Stripe integration for entry fees, subscriptions, and revenue sharing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-10 w-10 text-yellow-600 mb-4" />
              <CardTitle>Professional Brackets</CardTitle>
              <CardDescription>
                Interactive tournament brackets with real-time updates and multiple format support
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Star className="h-10 w-10 text-red-600 mb-4" />
              <CardTitle>Enterprise Features</CardTitle>
              <CardDescription>
                User authentication, subscription management, analytics, and white-label client tools
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
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="text-3xl font-bold">$0<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Up to 3 tournaments per month</li>
                <li>✓ Basic bracket management</li>
                <li>✓ Standard sports library</li>
                <li>✓ Community support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For growing organizations</CardDescription>
              <div className="text-3xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited tournaments</li>
                <li>✓ AI tournament generation</li>
                <li>✓ Payment processing</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ Priority support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>White-label solution</CardDescription>
              <div className="text-3xl font-bold">$99<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✓ Complete white-labeling</li>
                <li>✓ Custom domain & branding</li>
                <li>✓ Revenue sharing options</li>
                <li>✓ API access</li>
                <li>✓ Dedicated support</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to Launch Your Tournament Platform?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Join hundreds of organizations already using TournamentPro
        </p>
        <Button 
          size="lg" 
          onClick={() => window.location.href = "/api/login"}
          data-testid="button-start-free"
        >
          Start Free Trial
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="h-6 w-6" />
            <span className="text-xl font-bold">TournamentPro</span>
          </div>
          <p className="text-gray-400">
            Professional tournament management made simple
          </p>
        </div>
      </footer>
    </div>
  );
}