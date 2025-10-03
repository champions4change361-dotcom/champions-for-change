import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowUp, Heart, DollarSign, HelpCircle, Settings, Trophy, Users } from "lucide-react";

export default function FAQ() {
  const [, setLocation] = useLocation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-white hover:bg-white/10"
              data-testid="button-back-home"
            >
              ← Back to Platform
            </Button>
            <Button 
              onClick={() => setLocation('/contact')}
              className="bg-green-600 hover:bg-green-700 text-white"
              data-testid="button-contact-support"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Everything you need to know about our donation-based tournament platform that funds student education.
          </p>
        </div>

        {/* Quick Navigation */}
        <Card className="bg-slate-800/50 border-slate-700 mb-12">
          <CardHeader>
            <CardTitle className="text-white text-xl">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button 
                variant="ghost" 
                className="text-left justify-start text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={() => scrollToSection('getting-started')}
                data-testid="nav-getting-started"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Getting Started
              </Button>
              <Button 
                variant="ghost" 
                className="text-left justify-start text-green-400 hover:text-green-300 hover:bg-green-500/10"
                onClick={() => scrollToSection('donation-pricing')}
                data-testid="nav-donation-pricing"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Donation & Pricing
              </Button>
              <Button 
                variant="ghost" 
                className="text-left justify-start text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                onClick={() => scrollToSection('platform-usage')}
                data-testid="nav-platform-usage"
              >
                <Settings className="h-4 w-4 mr-2" />
                Platform Usage
              </Button>
              <Button 
                variant="ghost" 
                className="text-left justify-start text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                onClick={() => scrollToSection('team-management')}
                data-testid="nav-team-management"
              >
                <Users className="h-4 w-4 mr-2" />
                Team Management
              </Button>
              <Button 
                variant="ghost" 
                className="text-left justify-start text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                onClick={() => scrollToSection('tournaments')}
                data-testid="nav-tournaments"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Tournament Creation
              </Button>
              <Button 
                variant="ghost" 
                className="text-left justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={() => scrollToSection('account-billing')}
                data-testid="nav-account-billing"
              >
                <Heart className="h-4 w-4 mr-2" />
                Account & Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Sections */}
        <div className="space-y-12">
          
          {/* Getting Started */}
          <section id="getting-started">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <HelpCircle className="h-8 w-8 mr-3 text-blue-400" />
              Getting Started
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How do I get started with the platform?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Getting started is simple:</p>
                  <ol className="list-decimal list-inside space-y-2 mb-4">
                    <li>Click "Start 14-Day Free Trial" from our homepage</li>
                    <li>Create your account - no credit card required for the trial</li>
                    <li>Access your dashboard to manage teams and create tournaments</li>
                    <li>After your trial, set up your donation amount to continue</li>
                  </ol>
                  <p>During your free trial, you have access to all features including unlimited tournaments, team management, and white-label branding.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-1"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">What do I get access to?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Everyone gets access to our complete tournament management suite:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Tournament Creation:</strong> Unlimited tournaments with our 5-step wizard</li>
                    <li><strong>Team Management:</strong> Complete roster and team coordination tools</li>
                    <li><strong>White-label Branding:</strong> Custom logos, colors, and domains</li>
                    <li><strong>Payment Processing:</strong> Collect tournament fees via Stripe</li>
                    <li><strong>AI Features:</strong> Tournament consultation and optimization</li>
                    <li><strong>Real-time Scoring:</strong> Live leaderboards and results</li>
                    <li><strong>65+ Sports:</strong> Support for all major and niche sports</li>
                  </ul>
                  <p>There are no feature tiers - everyone gets the same enterprise-level tools.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-2"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Do I need to download any software?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">No downloads required! Our platform is 100% web-based and works on any device:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Desktop/Laptop:</strong> Works in any modern browser</li>
                    <li><strong>Mobile:</strong> Fully responsive mobile web interface</li>
                    <li><strong>Tablet:</strong> Optimized for tournament management on the go</li>
                    <li><strong>Cross-Platform:</strong> Your tournaments sync across all devices</li>
                  </ul>
                  <p>Just log in from any device with internet access and you're ready to go.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-3"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Donation & Pricing */}
          <section id="donation-pricing">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <DollarSign className="h-8 w-8 mr-3 text-green-400" />
              Donation & Pricing
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How much should I donate?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Our suggested donation is <strong>$50/month</strong>, but you can donate whatever feels right for your organization:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Small Community Groups:</strong> $20-30/month</li>
                    <li><strong>Individual Coaches:</strong> $30-50/month</li>
                    <li><strong>Small Businesses:</strong> $50-100/month</li>
                    <li><strong>Large Corporations:</strong> $100-500/month</li>
                  </ul>
                  <p className="mb-4">The beauty of our model is that <strong>wealthy organizations help subsidize smaller community groups</strong>, ensuring everyone has access to professional tournament tools regardless of budget.</p>
                  <p>Remember: Your entire donation is <strong>100% tax-deductible</strong> as a charitable contribution to our 501(c)(3) nonprofit.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-4"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Are donations tax-deductible?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>Yes! 100% of your donation is tax-deductible.</strong></p>
                  <p className="mb-4">We are Champions for Change, a registered 501(c)(3) nonprofit organization. This means:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Business Tax Advantage:</strong> Charitable deduction vs. software expense</li>
                    <li><strong>Higher Deduction Value:</strong> Often more valuable than business expense deduction</li>
                    <li><strong>Corporate Social Responsibility:</strong> Demonstrates community investment</li>
                    <li><strong>Documentation Provided:</strong> Official receipts for tax filing</li>
                  </ul>
                  <p>Consult your tax advisor about the specific benefits for your situation, but most organizations find the charitable deduction more valuable than treating it as a business expense.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-5"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How does the 14-day free trial work?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Our free trial gives you complete access with no restrictions:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>No Credit Card Required:</strong> Sign up instantly without payment info</li>
                    <li><strong>Full Feature Access:</strong> All tournament and team management tools</li>
                    <li><strong>Unlimited Usage:</strong> Create as many tournaments as you need</li>
                    <li><strong>14 Full Days:</strong> Plenty of time to test everything</li>
                  </ul>
                  <p className="mb-4">After your trial:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Set your monthly donation amount (minimum $10)</li>
                    <li>Or choose annual donation for convenience</li>
                    <li>Continue with full access to all features</li>
                  </ul>
                  <p>No pressure, no sales calls - just decide if our platform helps your tournaments run better.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-6"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Do you offer refunds?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>We don't offer refunds</strong>, but we do something better:</p>
                  <p className="mb-4"><strong>You keep full access until the end of your paid term.</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Cancel anytime without penalty</li>
                    <li>Keep using all features until your term expires</li>
                    <li>No prorating complications or processing delays</li>
                    <li>Fair and transparent for everyone</li>
                  </ul>
                  <p>This policy is much better than competitors who cut off access immediately after cancellation, even if you've paid for the full year.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-7"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Where does my donation go?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Your donations directly fund educational opportunities for underprivileged students through Champions for Change:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Student Travel:</strong> Competition and tournament travel expenses</li>
                    <li><strong>Educational Programs:</strong> Academic and athletic skill development</li>
                    <li><strong>Equipment & Resources:</strong> Sports equipment and educational materials</li>
                    <li><strong>Scholarship Opportunities:</strong> Direct financial support for student athletes</li>
                    <li><strong>Platform Development:</strong> Improving tools to serve more students</li>
                  </ul>
                  <p className="mb-4">Every tournament you run creates educational opportunities for kids who wouldn't otherwise have them.</p>
                  <p>We provide regular updates on the impact your donations are making in students' lives.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-8"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Platform Usage */}
          <section id="platform-usage">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-purple-400" />
              Platform Usage
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How do I access my dashboard?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">After logging in, your dashboard is your central hub for all tournament and team management:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Quick Access:</strong> Login from any device at our main domain</li>
                    <li><strong>Dashboard Overview:</strong> See all your tournaments and teams at a glance</li>
                    <li><strong>Navigation Menu:</strong> Easy access to create tournaments, manage teams, and view results</li>
                    <li><strong>Recent Activity:</strong> Track updates and changes across all your events</li>
                  </ul>
                  <p>Your dashboard adapts to your role - whether you're running one tournament or managing dozens.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-9"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Can I customize tournament branding?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>Yes! Everyone gets full white-label branding capabilities:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Custom Logo:</strong> Upload your organization's logo</li>
                    <li><strong>Color Schemes:</strong> Match your brand colors throughout</li>
                    <li><strong>Custom Domains:</strong> Use your own domain name (yourname.com)</li>
                    <li><strong>Professional Look:</strong> Remove all our branding for a clean, professional appearance</li>
                    <li><strong>Tournament Pages:</strong> Fully branded tournament registration and results pages</li>
                  </ul>
                  <p>This makes your tournaments look completely professional and builds trust with participants.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-10"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How do I collect tournament fees from participants?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">We handle all payment processing through our integrated Stripe system:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Automatic Collection:</strong> Set entry fees and they're collected at registration</li>
                    <li><strong>Multiple Payment Methods:</strong> Credit/debit cards, digital wallets</li>
                    <li><strong>Secure Processing:</strong> Bank-level security for all transactions</li>
                    <li><strong>Instant Confirmation:</strong> Players get immediate confirmation of payment</li>
                    <li><strong>Revenue Tracking:</strong> Real-time dashboard of tournament revenue</li>
                  </ul>
                  <p className="mb-4">Standard processing fees apply (2.9% + $0.30 per transaction), which is industry standard.</p>
                  <p>Funds are transferred to your bank account automatically according to your Stripe settings.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-11"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Is my data secure and backed up?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>Absolutely. We take data security very seriously:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Enterprise Security:</strong> Bank-level encryption for all data</li>
                    <li><strong>Automatic Backups:</strong> Your tournaments and data backed up continuously</li>
                    <li><strong>Secure Hosting:</strong> Professional cloud infrastructure with 99.9% uptime</li>
                    <li><strong>Data Export:</strong> You can export your data anytime</li>
                    <li><strong>Privacy Compliance:</strong> GDPR and privacy regulation compliant</li>
                  </ul>
                  <p>Your tournament data is safer with us than on local computers or spreadsheets.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-12"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Team Management */}
          <section id="team-management">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Users className="h-8 w-8 mr-3 text-orange-400" />
              Team Management
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How do I manage teams and rosters?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Our team management system makes roster coordination simple:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Team Creation:</strong> Create teams with custom names and details</li>
                    <li><strong>Roster Management:</strong> Add players, coaches, and staff members</li>
                    <li><strong>Player Profiles:</strong> Track contact info, positions, and stats</li>
                    <li><strong>Team Communications:</strong> Send messages and updates to your teams</li>
                    <li><strong>Multi-Team Organization:</strong> Manage multiple teams from one dashboard</li>
                  </ul>
                  <p>Perfect for coaches managing multiple age groups or organizations with several teams.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-13"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Can teams register themselves for tournaments?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>Yes! We support both registration methods:</strong></p>
                  <p className="mb-4"><strong>Self-Registration:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Teams register directly through tournament links</li>
                    <li>Automatic roster collection and validation</li>
                    <li>Payment processing at time of registration</li>
                    <li>Instant confirmation and tournament details</li>
                  </ul>
                  <p className="mb-4"><strong>Organizer Registration:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>You can register teams manually from your dashboard</li>
                    <li>Bulk import from spreadsheets</li>
                    <li>Direct communication with team coaches</li>
                  </ul>
                  <p>Choose the method that works best for your tournament format.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-14"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Tournament Creation */}
          <section id="tournaments">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Trophy className="h-8 w-8 mr-3 text-yellow-400" />
              Tournament Creation
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How do I create my first tournament?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Our 5-step tournament wizard guides you through everything:</p>
                  <p className="mb-4"><strong>Step 1: Basic Information</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Tournament name, date, and location</li>
                    <li>Sport type from our 65+ supported options</li>
                    <li>Basic tournament format preferences</li>
                  </ul>
                  <p className="mb-4"><strong>Step 2: Format & Rules</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Bracket type (single elimination, double elimination, round robin)</li>
                    <li>Scoring system and rules</li>
                    <li>Advancement criteria</li>
                  </ul>
                  <p className="mb-4"><strong>Step 3: Registration Settings</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Entry fees and payment processing</li>
                    <li>Registration deadlines</li>
                    <li>Team requirements and restrictions</li>
                  </ul>
                  <p className="mb-4"><strong>Step 4: Branding & Customization</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Upload logos and set colors</li>
                    <li>Customize registration pages</li>
                    <li>Set up tournament website</li>
                  </ul>
                  <p className="mb-4"><strong>Step 5: Review & Launch</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Preview everything before going live</li>
                    <li>Test registration flow</li>
                    <li>Launch and start accepting registrations</li>
                  </ul>
                  <p>The whole process typically takes 10-15 minutes for a standard tournament.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-15"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">What sports and tournament formats do you support?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>65+ Sports Supported:</strong></p>
                  <p className="mb-4">Popular Sports:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Basketball, Football, Soccer, Baseball, Softball</li>
                    <li>Tennis, Golf, Track & Field, Swimming</li>
                    <li>Volleyball, Wrestling, Cross Country</li>
                  </ul>
                  <p className="mb-4">Niche & Specialized:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Esports, Chess, Debate, Academic competitions</li>
                    <li>Martial arts, Cycling, Triathlon</li>
                    <li>Corporate team building events</li>
                  </ul>
                  <p className="mb-4"><strong>We offer 16 tournament formats to fit any competition style!</strong></p>
                  <p>If you don't see your sport or format, contact us - we can typically add it quickly!</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-16"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Which tournament format should I choose?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>We offer 16 tournament formats - here's how to pick the right one:</strong></p>
                  
                  <div className="mb-6">
                    <p className="font-bold text-yellow-400 mb-2">🏆 Bracket/Elimination Formats (Best for Quick Playoffs)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Single Elimination:</strong> Classic bracket - one loss and you're out. Fast, exciting. Great for: playoffs, championship finals, 8-32 teams.</li>
                      <li><strong>Double Elimination:</strong> Losers get a second chance. More fair than single. Great for: competitive tournaments where skill matters, 8-64 teams.</li>
                      <li><strong>Triple Elimination:</strong> Three losses to be eliminated. Most forgiving. Great for: skilled competitors deserving multiple chances.</li>
                      <li><strong>Consolation Tournament:</strong> Separate bracket for eliminated teams. Great for: keeping everyone engaged, determining 3rd-8th places.</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <p className="font-bold text-blue-400 mb-2">🔄 Round Robin Formats (Best for Fair Competition)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Round Robin:</strong> Everyone plays everyone once. Most fair - no bracket luck. Great for: league play, true rankings, 8-16 teams.</li>
                      <li><strong>Swiss System:</strong> Smart pairing each round - winners face winners. Like chess tournaments. Great for: large fields 20+, competitive balance.</li>
                      <li><strong>Pool Play + Bracket:</strong> Round robin groups first, then elimination bracket. Great for: 16-64 teams, balancing fairness with excitement.</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <p className="font-bold text-green-400 mb-2">🎯 Game Guarantee Formats (Best for Youth/Travel)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Three Game Guarantee:</strong> Every team plays minimum 3 games. Great for: youth tournaments, travel events where teams expect multiple games.</li>
                      <li><strong>Compass Draw:</strong> Multiple brackets based on win/loss record. Everyone plays 3-4+ games. Great for: ensuring max playtime regardless of performance.</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <p className="font-bold text-purple-400 mb-2">📊 Individual Scoring Formats (Best for Skills/Track & Field)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Leaderboard Competition:</strong> Ranked by total points. No head-to-head needed. Great for: track & field, golf, bowling, individual performances.</li>
                      <li><strong>Multi-Event Competition:</strong> Multiple events with combined scoring (like a decathlon). Great for: all-around competitions, academic UIL meets.</li>
                      <li><strong>Time Trials:</strong> Individual timed runs, best time wins. Great for: racing, swimming, track events, timed challenges.</li>
                      <li><strong>Skills Competition:</strong> Multiple skill challenges scored. Great for: all-star events, demonstration competitions.</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <p className="font-bold text-orange-400 mb-2">⏰ Ongoing Formats (Best for Season-Long)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Ladder Tournament:</strong> Challenge those ranked above you to climb up. Great for: season-long competition, club rankings, flexible scheduling.</li>
                      <li><strong>Pyramid Tournament:</strong> Like ladder but pyramid-shaped with more at bottom. Great for: large participant pools with tiered skill levels.</li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <p className="font-bold text-red-400 mb-2">💥 Special Formats</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong>Battle Royale:</strong> Large field progressive elimination. Great for: 50+ participants, esports, survivor-style competitions.</li>
                    </ul>
                  </div>

                  <p className="mb-4"><strong>Quick Decision Guide:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Need fast tournament?</strong> → Single Elimination</li>
                    <li><strong>Want most fair?</strong> → Round Robin</li>
                    <li><strong>Large field (20+ teams)?</strong> → Swiss System or Battle Royale</li>
                    <li><strong>Youth/travel tournament?</strong> → Three Game Guarantee or Compass Draw</li>
                    <li><strong>Individual skills event?</strong> → Leaderboard or Multi-Event</li>
                    <li><strong>Season-long competition?</strong> → Ladder or Pyramid</li>
                  </ul>

                  <p className="text-sm italic">Still unsure? No worries! Our tournament wizard asks simple questions about your event and recommends the best format automatically.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-16b"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How do I update scores and manage brackets during the tournament?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">Real-time tournament management is simple and intuitive:</p>
                  <p className="mb-4"><strong>Score Entry:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Quick score entry from any device</li>
                    <li>Automatic bracket advancement</li>
                    <li>Real-time leaderboard updates</li>
                    <li>Multiple people can enter scores with proper permissions</li>
                  </ul>
                  <p className="mb-4"><strong>Live Features:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Participants see updated brackets immediately</li>
                    <li>Automated notifications for next games</li>
                    <li>Live streaming integration options</li>
                    <li>Social media sharing tools</li>
                  </ul>
                  <p className="mb-4"><strong>Tournament Control:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Pause/resume tournaments as needed</li>
                    <li>Modify brackets for no-shows or changes</li>
                    <li>Generate instant reports and summaries</li>
                    <li>Export final results in multiple formats</li>
                  </ul>
                  <p>Everything updates in real-time so participants always see current information.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-17"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Account & Billing */}
          <section id="account-billing">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Heart className="h-8 w-8 mr-3 text-red-400" />
              Account & Support
            </h2>
            
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">How do I cancel my subscription?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">You can cancel anytime with no penalties:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Account Settings:</strong> Cancel directly from your account dashboard</li>
                    <li><strong>Immediate Effect:</strong> No future donations will be charged</li>
                    <li><strong>Continued Access:</strong> Keep using the platform until your current term ends</li>
                    <li><strong>Data Preservation:</strong> Your tournaments and data remain available</li>
                    <li><strong>Easy Reactivation:</strong> Restart anytime by setting up donations again</li>
                  </ul>
                  <p>No phone calls, no retention specialists, no hassle - just simple cancellation when you need it.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-18"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Can I export my tournament data?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4"><strong>Yes! Your data belongs to you and you can export it anytime:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Tournament Results:</strong> Complete brackets and final standings</li>
                    <li><strong>Participant Data:</strong> Team rosters and contact information</li>
                    <li><strong>Financial Reports:</strong> Registration fees and payment summaries</li>
                    <li><strong>Historical Data:</strong> All past tournaments and statistics</li>
                    <li><strong>Multiple Formats:</strong> Excel, CSV, PDF options available</li>
                  </ul>
                  <p className="mb-4">Export options include:</p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Individual tournament exports</li>
                    <li>Full account data export</li>
                    <li>Custom date range exports</li>
                    <li>Automated regular exports (for backup purposes)</li>
                  </ul>
                  <p>We believe in data portability - you should never feel locked into any platform.</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-19"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">What kind of support do you offer?</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-300">
                  <p className="mb-4">We provide comprehensive support for all users:</p>
                  <p className="mb-4"><strong>Support Channels:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li><strong>Email Support:</strong> Detailed help with screenshots and solutions</li>
                    <li><strong>Knowledge Base:</strong> Comprehensive guides and tutorials</li>
                    <li><strong>Video Tutorials:</strong> Step-by-step platform walkthroughs</li>
                    <li><strong>Contact Form:</strong> Get personalized help with specific questions</li>
                  </ul>
                  <p className="mb-4"><strong>Response Times:</strong></p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>General questions: 24-48 hours</li>
                    <li>Technical issues: 12-24 hours</li>
                    <li>Tournament day emergencies: Same day response</li>
                    <li>Billing questions: Same day response</li>
                  </ul>
                  <p className="mb-4">Since everyone gets the same platform features, everyone gets the same quality support regardless of donation amount.</p>
                  <p>We're a small team focused on making your tournaments successful!</p>
                  <Button 
                    variant="link" 
                    onClick={scrollToTop}
                    className="text-blue-400 hover:text-blue-300 p-0 mt-4"
                    data-testid="back-to-top-20"
                  >
                    <ArrowUp className="h-4 w-4 mr-1" />
                    Back to top
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-green-800 to-blue-800 border-green-500/30">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                We're here to help! Contact our team for personalized assistance with your tournament needs.
              </p>
              <Button 
                onClick={() => setLocation('/contact')}
                className="bg-white text-green-800 hover:bg-green-50 font-semibold px-8 py-3"
                data-testid="button-contact-final"
              >
                Contact Our Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}