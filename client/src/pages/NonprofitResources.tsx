import { ArrowLeft, Building2, Users, Target, CheckCircle, ExternalLink, AlertCircle, DollarSign, Calendar, FileText, Code, Database, Search, Heart } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NonprofitResources() {
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
              Nonprofit Resources
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-400 p-4 rounded-full">
              <Heart className="h-12 w-12 text-green-900" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
            Nonprofit Tech Resources
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8" data-testid="text-hero-subtitle">
            Powerful APIs and tools to help nonprofits amplify their impact through technology
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-green-900 font-semibold" 
              onClick={() => window.open('https://candid.org/about/candid-apis', '_blank')}
              data-testid="button-api-docs"
            >
              Explore APIs
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-green-900 backdrop-blur-sm font-semibold" 
              onClick={() => window.open('https://www.techsoup.org/', '_blank')}
              data-testid="button-tech-resources"
            >
              TechSoup Resources
            </Button>
          </div>
        </div>
      </section>

      {/* API Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-api-title">
            Essential APIs for Nonprofits
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Candid APIs */}
            <Card className="border-t-4 border-green-500" data-testid="card-candid-api">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <Database className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-green-900 dark:text-green-100">Candid Foundation API</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Access the world's largest database of foundations and grants. Perfect for automated grant discovery.
                </p>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Key Features:</div>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Foundation profiles and giving patterns</li>
                    <li>• Grant opportunities by category</li>
                    <li>• Application deadlines and requirements</li>
                    <li>• Funder contact information</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open('https://candid.org/about/candid-apis', '_blank')}
                  data-testid="button-candid-api"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Candid API Documentation
                </Button>
              </CardContent>
            </Card>

            {/* GuideStar API */}
            <Card className="border-t-4 border-blue-500" data-testid="card-guidestar-api">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                    <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-blue-100">GuideStar API</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Nonprofit organization data and financial information for due diligence and research.
                </p>
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Key Features:</div>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                    <li>• Nonprofit financial data</li>
                    <li>• Organization profiles</li>
                    <li>• Board and leadership info</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => window.open('https://www.guidestar.org/profile/shared/partners/api', '_blank')}
                  data-testid="button-guidestar-api"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  GuideStar API Info
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 mb-8" data-testid="alert-integration">
            <Code className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Platform Integration:</strong> These APIs can be integrated into our tournament platform to help 
              school districts and nonprofits automatically discover relevant funding opportunities based on their programs.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Nonprofit Tech Tools */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-tools-title">
            Essential Nonprofit Tech Tools
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* TechSoup */}
            <Card className="border-t-4 border-purple-500" data-testid="card-techsoup">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-100">TechSoup</CardTitle>
                <CardDescription>Discounted software for nonprofits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Access discounted Microsoft, Adobe, and other software licenses for qualifying nonprofits.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open('https://www.techsoup.org/', '_blank')}
                  data-testid="button-techsoup"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit TechSoup
                </Button>
              </CardContent>
            </Card>

            {/* Google for Nonprofits */}
            <Card className="border-t-4 border-red-500" data-testid="card-google-nonprofits">
              <CardHeader>
                <CardTitle className="text-red-900 dark:text-red-100">Google for Nonprofits</CardTitle>
                <CardDescription>Free Google services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Free Google Workspace, $10K/month Google Ads grants, and other Google services.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open('https://www.google.org/nonprofits/', '_blank')}
                  data-testid="button-google-nonprofits"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </CardContent>
            </Card>

            {/* Microsoft Nonprofits */}
            <Card className="border-t-4 border-blue-500" data-testid="card-microsoft-nonprofits">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Microsoft Nonprofits</CardTitle>
                <CardDescription>Discounted Microsoft services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Free and discounted Microsoft 365, Azure cloud credits, and professional development.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open('https://nonprofit.microsoft.com/', '_blank')}
                  data-testid="button-microsoft-nonprofits"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* Salesforce Nonprofit Cloud */}
            <Card className="border-t-4 border-cyan-500" data-testid="card-salesforce-nonprofits">
              <CardHeader>
                <CardTitle className="text-cyan-900 dark:text-cyan-100">Salesforce Nonprofit Cloud</CardTitle>
                <CardDescription>CRM for nonprofits</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Free Salesforce licenses for qualifying nonprofits to manage donors and programs.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open('https://www.salesforce.org/products/nonprofit-cloud/', '_blank')}
                  data-testid="button-salesforce-nonprofits"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Slack for Nonprofits */}
            <Card className="border-t-4 border-green-500" data-testid="card-slack-nonprofits">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100">Slack for Nonprofits</CardTitle>
                <CardDescription>Team communication</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  85% discount on Slack Pro and Business+ plans for qualifying nonprofits.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open('https://slack.com/help/articles/204368833-Slack-for-Nonprofits-program', '_blank')}
                  data-testid="button-slack-nonprofits"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply for Discount
                </Button>
              </CardContent>
            </Card>

            {/* Benevity */}
            <Card className="border-t-4 border-orange-500" data-testid="card-benevity">
              <CardHeader>
                <CardTitle className="text-orange-900 dark:text-orange-100">Benevity</CardTitle>
                <CardDescription>Corporate giving platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Connect with corporate giving programs and employee volunteer matching.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => window.open('https://benevity.com/', '_blank')}
                  data-testid="button-benevity"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Champions for Change Integration */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8" data-testid="text-integration-title">
            How Our Platform Helps Nonprofits
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Mission-Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built specifically to fund educational opportunities for underprivileged youth through tournament management.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mx-auto mb-4">
                <Code className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">API Integration</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ready to integrate with Candid and other nonprofit APIs for automated grant discovery.
              </p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mx-auto mb-4">
                <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Nonprofit Support</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Special pricing and features designed specifically for nonprofit organizations and school districts.
              </p>
            </div>
          </div>

          <Card className="bg-white dark:bg-slate-800">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Partner with Champions for Change
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Join our mission to provide educational opportunities for underprivileged youth while leveraging 
                powerful nonprofit technology tools and APIs.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/grant-funding">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    Explore Grant Opportunities
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => window.open('mailto:support@championsforchange.net', '_blank')}
                >
                  Contact Our Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}