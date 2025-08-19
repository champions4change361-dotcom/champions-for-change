import { ArrowLeft, Building2, MapPin, Users, Target, CheckCircle, ExternalLink, AlertCircle, DollarSign, Calendar, FileText } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GrantFunding() {
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
              Grant Funding Opportunities
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-yellow-400 p-4 rounded-full">
              <Target className="h-12 w-12 text-blue-900" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" data-testid="text-hero-title">
            Grant Funding Opportunities
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8" data-testid="text-hero-subtitle">
            We've identified grant opportunities that support athletic safety technology. Use these resources to fund your platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900" 
              onClick={() => window.open('https://www.grants.gov/learn-grants/grant-making-process', '_blank')}
              data-testid="button-download-guide"
            >
              Download Grant Guide
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-900" 
              onClick={() => window.open('https://www.foundationcenter.org/', '_blank')}
              data-testid="button-grant-resources"
            >
              View Grant Resources
            </Button>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-12" data-testid="card-introduction">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">Fund Your Athletic Safety Platform Through Grants</CardTitle>
              <CardDescription className="text-lg">
                Many school districts successfully secure grant funding for athletic safety technology, injury prevention programs, and student wellness initiatives.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Our platform qualifies for multiple grant categories since it combines educational technology, student safety, and health monitoring.
              </p>
              
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" data-testid="alert-grant-strategy">
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Grant Strategy:</strong> Position our platform as "student competitor safety technology" rather than just tournament management. 
                  Emphasize injury prevention, health monitoring, and educational outcomes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grant Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-categories-title">
            Grant Funding Categories
          </h2>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Federal Grants */}
            <Card className="border-t-4 border-red-500" data-testid="card-federal-grants">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full">
                    <Building2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <CardTitle className="text-red-900 dark:text-red-100">Federal Grants</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">CDC Injury Prevention Grants</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$50,000 - $500,000</div>
                  <div className="text-red-600 dark:text-red-400 text-sm mb-3">Next Cycle: Spring 2025</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Funds programs that prevent sports-related injuries and promote youth safety. Perfect fit for our health monitoring features.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://www.cdc.gov/injury/grants/', '_blank')}
                    data-testid="button-cdc-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">USDA Rural Education Achievement Grant</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$25,000 - $180,000</div>
                  <div className="text-red-600 dark:text-red-400 text-sm mb-3">Next Cycle: February 2025</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    For rural districts to improve educational services. Technology for student safety qualifies.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://www.grants.gov/web/grants/view-opportunity.html?oppId=346573', '_blank')}
                    data-testid="button-usda-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Here
                  </Button>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Department of Education Innovation Grants</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$100,000 - $2,000,000</div>
                  <div className="text-red-600 dark:text-red-400 text-sm mb-3">Next Cycle: Fall 2025</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Educational technology innovations that improve student outcomes and safety.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://www.ed.gov/fund/grant/find/edlite-forecast.html', '_blank')}
                    data-testid="button-ed-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* State & Local Grants */}
            <Card className="border-t-4 border-orange-500" data-testid="card-state-grants">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                    <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle className="text-orange-900 dark:text-orange-100">State & Local Grants</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Texas Education Agency Technology Grants</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$10,000 - $100,000</div>
                  <div className="text-blue-600 dark:text-blue-400 text-sm mb-3">Rolling Applications</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    TEA funds technology that enhances student safety and educational outcomes.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://tea.texas.gov/finance-and-grants', '_blank')}
                    data-testid="button-tea-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    TEA Grants
                  </Button>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Regional Education Service Centers</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$5,000 - $50,000</div>
                  <div className="text-blue-600 dark:text-blue-400 text-sm mb-3">Varies by Region</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Local ESCs often have small grants for innovative educational programs.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://tea.texas.gov/regional-services/regional-education-service-centers', '_blank')}
                    data-testid="button-esc-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Find Your ESC
                  </Button>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Texas UIL Foundation Grants</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$2,500 - $25,000</div>
                  <div className="text-red-600 dark:text-red-400 text-sm mb-3">Next Cycle: January 2025</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Supports athletic programs and student safety initiatives in UIL member schools.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://www.uiltexas.org/scholarships', '_blank')}
                    data-testid="button-uil-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    UIL Grants
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Private Foundation Grants */}
            <Card className="border-t-4 border-green-500" data-testid="card-private-grants">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-green-900 dark:text-green-100">Private Foundations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Robert Wood Johnson Foundation</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$25,000 - $200,000</div>
                  <div className="text-blue-600 dark:text-blue-400 text-sm mb-3">Rolling Applications</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Health-focused foundation supporting youth wellness and injury prevention programs.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://www.rwjf.org/en/grants.html', '_blank')}
                    data-testid="button-rwjf-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply Now
                  </Button>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Nike Community Impact Fund</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$10,000 - $100,000</div>
                  <div className="text-red-600 dark:text-red-400 text-sm mb-3">Next Cycle: Winter 2025</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Supports programs that get kids active and safe through sports.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://www.nike.com/help/a/community-impact-grants', '_blank')}
                    data-testid="button-nike-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Nike Grants
                  </Button>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white mb-2">Local Community Foundations</div>
                  <div className="text-green-600 dark:text-green-400 font-bold mb-2">$1,000 - $25,000</div>
                  <div className="text-blue-600 dark:text-blue-400 text-sm mb-3">Varies by Foundation</div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Many local foundations support educational technology and youth safety programs.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => window.open('https://foundationcenter.org/', '_blank')}
                    data-testid="button-local-grants"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Find Local Foundations
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Grant Application Tips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-tips-title">
            Grant Application Success Tips
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-tip-safety">
              <CardHeader>
                <div className="bg-yellow-400 p-3 rounded-full w-fit mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-900" />
                </div>
                <CardTitle className="text-yellow-400">Focus on Safety Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Emphasize injury prevention, liability reduction, and student competitor welfare rather than just tournament management.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-tip-quantify">
              <CardHeader>
                <div className="bg-yellow-400 p-3 rounded-full w-fit mb-4">
                  <DollarSign className="h-6 w-6 text-purple-900" />
                </div>
                <CardTitle className="text-yellow-400">Quantify the Need</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Include statistics on sports injuries in your district, potential cost savings, and number of students who will benefit.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-tip-compliance">
              <CardHeader>
                <div className="bg-yellow-400 p-3 rounded-full w-fit mb-4">
                  <FileText className="h-6 w-6 text-purple-900" />
                </div>
                <CardTitle className="text-yellow-400">Highlight Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Mention HIPAA/FERPA compliance, data security, and how the platform meets educational technology standards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm" data-testid="card-tip-partnerships">
              <CardHeader>
                <div className="bg-yellow-400 p-3 rounded-full w-fit mb-4">
                  <Users className="h-6 w-6 text-purple-900" />
                </div>
                <CardTitle className="text-yellow-400">Show Partnerships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">
                  Demonstrate collaboration with athletic trainers, coaches, and medical professionals in your application.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform ROI for Grants */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-roi-title">
            Grant-Worthy ROI: Injury Prevention Savings
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center" data-testid="card-concussion-cost">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">$15,000</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average concussion treatment cost</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center" data-testid="card-acl-cost">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">$35,000</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Average ACL surgery and rehabilitation</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center" data-testid="card-platform-cost">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">$2,490</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Annual platform cost</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center" data-testid="card-grant-roi">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">1,400%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">ROI when preventing one ACL injury</div>
            </div>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20" data-testid="card-grant-message">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Perfect Grant Justification
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Show grant committees that preventing just one serious injury pays for the platform for over 10 years. 
                Our safety technology is an investment in student welfare that saves money and protects futures.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700" 
                  onClick={() => window.open('https://www.upwork.com/freelancers/skills/grant-writing/', '_blank')}
                  data-testid="button-grant-platforms"
                >
                  Find Grant Writing Services
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => window.open('https://www.grants.gov/web/grants/applicants/applicant-resources.html', '_blank')}
                  data-testid="button-download-template"
                >
                  Download Application Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Grant Writing Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12" data-testid="text-resources-title">
            Trusted Grant Writing Resources
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-t-4 border-blue-500" data-testid="card-instrumentl">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Instrumentl</CardTitle>
                <CardDescription>Grant discovery and management platform</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Professional grant search engine with application tracking. Used by thousands of nonprofits and schools.
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.open('https://instrumentl.com', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Instrumentl
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-green-500" data-testid="card-grantwatch">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100">GrantWatch</CardTitle>
                <CardDescription>Comprehensive grant database</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Extensive database of federal, state, and private foundation grants with search filters.
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.open('https://grantwatch.com', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit GrantWatch
                </Button>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-purple-500" data-testid="card-upwork">
              <CardHeader>
                <CardTitle className="text-purple-900 dark:text-purple-100">Professional Grant Writers</CardTitle>
                <CardDescription>Freelance grant writing specialists</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Find experienced grant writers on platforms like Upwork and Fiverr who specialize in educational funding.
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.open('https://upwork.com/freelance-jobs/grant-writing/', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Find Grant Writers
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 dark:bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6" data-testid="text-contact-title">
            Need Professional Grant Writing Help?
          </h2>
          <p className="text-xl text-gray-300 mb-8" data-testid="text-contact-description">
            While we can't write grants for you, we've identified trusted grant writing services that specialize in educational technology funding. 
            We provide the platform documentation and ROI data you'll need for your applications.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900" data-testid="button-trusted-writers">
              Find Trusted Grant Writers
            </Button>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" data-testid="button-return-home">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}