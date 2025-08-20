import { ArrowLeft, Shield, Activity, Heart, Brain, Users, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HealthBenefits() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Health & Wellness Platform
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
              <Heart className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6" data-testid="text-hero-title">
            Health & Wellness Benefits
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8" data-testid="text-hero-subtitle">
            AI-powered athlete health management and injury tracking for all organization types - from HIPAA-compliant district systems to simple community injury documentation
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register-organization">
              <Button size="lg" className="bg-green-600 hover:bg-green-700" data-testid="button-get-started">
                Get Started Today
              </Button>
            </Link>
            <Link href="/demo/health">
              <Button size="lg" variant="outline" data-testid="button-learn-more">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* User Segments */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-segments-title">
            Health Benefits for Every User
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* School Districts */}
            <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="card-districts">
              <CardHeader className="text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-blue-900 dark:text-blue-100">School Districts</CardTitle>
                <CardDescription>$2,490/year (Champions District) or $4,500/year (District Enterprise)</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>HIPAA/FERPA compliant health monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Concussion risk assessment and tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Position-specific health analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Predictive injury prevention alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Athletic trainer workflow integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Parent health notifications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Casual Users */}
            <Card className="border-2 border-green-200 dark:border-green-800" data-testid="card-casual">
              <CardHeader className="text-center">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-green-900 dark:text-green-100">Casual Users</CardTitle>
                <CardDescription>FREE - Basic wellness tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Basic athlete wellness monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Safety alert notifications (4 levels)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Basic injury tracking and logging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Health trend visualization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Personal wellness dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Educational health resources</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Business Enterprise */}
            <Card className="border-2 border-purple-200 dark:border-purple-800" data-testid="card-business">
              <CardHeader className="text-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-purple-900 dark:text-purple-100">Business Enterprise</CardTitle>
                <CardDescription>$149/month or $1,499/year - White-label tournament platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Employee wellness competition tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Workplace injury documentation system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Corporate health analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Budget management for wellness programs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>White-label platform with health features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>ROI reporting for wellness initiatives</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Nonprofit Organizations */}
            <Card className="border-2 border-orange-200 dark:border-orange-800" data-testid="card-nonprofit">
              <CardHeader className="text-center">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-orange-900 dark:text-orange-100">Community Nonprofits</CardTitle>
                <CardDescription>$39/month (Tournament Organizer) - Churches, Boys & Girls Clubs, etc.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Basic injury documentation and tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Youth league health and safety monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Tournament medical incident reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Event budget management tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Volunteer safety awareness tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AI-powered health trend insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Health Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-features-title">
            Advanced Health Monitoring Features
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card data-testid="card-ai-monitoring">
              <CardHeader>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mb-4">
                  <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>AI-Powered Health Analytics</CardTitle>
                <CardDescription>Smart predictive health monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Concussion risk prediction algorithms</li>
                  <li>• Impact load analysis and warnings</li>
                  <li>• Fatigue pattern recognition</li>
                  <li>• Recovery time optimization</li>
                  <li>• Performance trend analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card data-testid="card-real-time-alerts">
              <CardHeader>
                <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full w-fit mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Real-Time Safety Alerts</CardTitle>
                <CardDescription>Instant health notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• Critical: Immediate medical attention</li>
                  <li>• High: Coach/trainer intervention</li>
                  <li>• Medium: Monitoring required</li>
                  <li>• Low: Preventive measures</li>
                  <li>• Automated parent notifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card data-testid="card-compliance">
              <CardHeader>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mb-4">
                  <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Medical Compliance</CardTitle>
                <CardDescription>Full regulatory compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• HIPAA-compliant data handling</li>
                  <li>• FERPA educational record protection</li>
                  <li>• Complete audit trail logging</li>
                  <li>• Role-based access controls</li>
                  <li>• Secure medical document storage</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Health ROI Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8" data-testid="text-roi-title">
            Health & Wellness Return on Investment
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md" data-testid="card-injury-cost">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">$25,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average cost of one preventable sports injury</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md" data-testid="card-platform-cost">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$2,490</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Annual cost of complete safety platform</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md" data-testid="card-roi-percentage">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">903%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">ROI when preventing just one serious injury</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md" data-testid="card-compliance-rate">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">HIPAA/FERPA compliant health monitoring</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-prevention-title">
              Prevention is Always Better Than Treatment
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6" data-testid="text-prevention-description">
              Our health monitoring platform doesn't just track athletes - it actively prevents injuries before they happen. 
              With AI-powered analytics, real-time alerts, and comprehensive health tracking, we help you protect your most valuable assets: your people.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register-organization">
                <Button size="lg" className="bg-green-600 hover:bg-green-700" data-testid="button-start-prevention">
                  Start Preventing Injuries Today
                </Button>
              </Link>
              <Link href="/demo/health">
                <Button size="lg" variant="outline" data-testid="button-schedule-demo">
                  Schedule a Health Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-footer-title">
            Ready to Transform Your Health Monitoring?
          </h2>
          <p className="text-xl text-gray-300 mb-8" data-testid="text-footer-description">
            Join thousands of organizations using our platform to protect athletes and promote wellness across their communities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register-organization">
              <Button size="lg" className="bg-green-600 hover:bg-green-700" data-testid="button-get-started-footer">
                Get Started Now
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-gray-900" data-testid="button-back-home-footer">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}