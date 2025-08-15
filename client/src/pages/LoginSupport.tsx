import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Shield, User, HelpCircle, ExternalLink, ArrowLeft } from "lucide-react";

export default function LoginSupport() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <HelpCircle className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Login Support</h1>
              <p className="text-lg text-slate-600">Help with accessing your account</p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div className="flex justify-center">
          <Link href="/login">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* How Login Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span>Secure Login Process</span>
              </CardTitle>
              <CardDescription>
                Your account is protected by enterprise-grade security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">How It Works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600">
                  <li>Click "Login" on any platform (District, Tournament, or Business)</li>
                  <li>You're securely redirected to Replit's authentication system</li>
                  <li>Log in with your Replit account credentials</li>
                  <li>You're automatically returned to the platform</li>
                </ol>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>No passwords to remember!</strong> Your account security is managed by Replit's enterprise authentication system.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Account Issues */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <span>Can't Access Your Account?</span>
              </CardTitle>
              <CardDescription>
                Common solutions for login issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Try These Steps:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                    <li>Clear your browser cache and cookies</li>
                    <li>Try using an incognito/private browser window</li>
                    <li>Disable browser extensions temporarily</li>
                    <li>Check if you're using the correct platform login</li>
                  </ul>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Still Having Issues?</h4>
                  <p className="text-sm text-orange-700 mb-3">
                    Account recovery is handled through Replit's support system.
                  </p>
                  <a 
                    href="https://replit.com/support" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-sm text-orange-700 hover:text-orange-900 underline"
                  >
                    <span>Contact Replit Support</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform-Specific Help */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200">
            <CardHeader className="text-center">
              <CardTitle className="text-blue-900">District Platform</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">For Athletic Directors, Principals, and District Staff</p>
              <Link href="/login/district">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-district-login">
                  District Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader className="text-center">
              <CardTitle className="text-purple-900">Tournament Organizers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">For Independent Tournament Management</p>
              <Link href="/login/organizer">
                <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-organizer-login">
                  Organizer Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="text-center">
              <CardTitle className="text-slate-900">Business Enterprise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600">For Corporate and Multi-Site Operations</p>
              <Link href="/login/business">
                <Button className="w-full bg-slate-600 hover:bg-slate-700" data-testid="button-business-login">
                  Business Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
            <CardDescription>Get help and learn more about the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Platform Support</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Email: support@championsforchange.org</li>
                  <li>• Phone: (361) 123-4567</li>
                  <li>• Hours: Mon-Fri 8AM-5PM CST</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Technical Requirements</h4>
                <ul className="space-y-1 text-sm text-slate-600">
                  <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                  <li>• JavaScript enabled</li>
                  <li>• Stable internet connection</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}