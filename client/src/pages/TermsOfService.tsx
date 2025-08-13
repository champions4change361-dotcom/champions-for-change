import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Shield, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Gavel,
  Clock,
  Phone,
  Mail,
  Building2
} from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="container mx-auto p-6 max-w-5xl" data-testid="terms-of-service">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <FileText className="h-10 w-10 text-purple-600" />
          Terms of Service
        </h1>
        <p className="text-xl text-gray-600">
          Clear terms for using our tournament management platform
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Fair Terms
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Educational Focus
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Community-Driven
          </Badge>
        </div>
      </div>

      <div className="space-y-8">
        {/* Platform Usage Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Platform Usage Agreement
            </CardTitle>
            <CardDescription>
              General terms applying to all users of the tournament platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">Acceptable Use</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Platform is for legitimate tournament management and educational purposes</li>
                <li>Users must provide accurate information during registration</li>
                <li>No harassment, abuse, or inappropriate behavior toward other users</li>
                <li>Respect intellectual property rights and platform content</li>
                <li>Comply with all applicable local, state, and federal laws</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-red-700 mb-2">Prohibited Activities</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Using the platform for gambling or illegal betting activities</li>
                <li>Attempting to hack, exploit, or damage platform security</li>
                <li>Creating fake accounts or impersonating others</li>
                <li>Sharing inappropriate content or personal information of minors</li>
                <li>Commercial use without proper licensing agreements</li>
              </ul>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Account Termination:</strong> Violation of these terms may result in 
                immediate account suspension or termination without refund.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Educational Domain Terms */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Building2 className="h-6 w-6" />
              Educational Domain Terms
            </CardTitle>
            <CardDescription className="text-green-700">
              Special terms for schools and educational organizations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">FERPA Compliance</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                <li>Student data protection follows all FERPA guidelines</li>
                <li>Schools maintain full ownership and control of their data</li>
                <li>No student information shared across different domains</li>
                <li>Parents have right to access and correct student information</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-700 mb-2">Educational Use Only</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                <li>Educational domain restricted to legitimate school activities</li>
                <li>Tournament data used solely for educational purposes</li>
                <li>Zero tolerance for inappropriate content in school environments</li>
                <li>Automatic compliance reporting available for district administrators</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Business Domain Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Business Domain Terms
            </CardTitle>
            <CardDescription>
              Terms for professional organizations and business users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-700 mb-2">Commercial Use</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Subscription required for commercial tournament management</li>
                <li>Revenue sharing applies to paid tournament entries</li>
                <li>Advanced features available with Enterprise subscriptions</li>
                <li>Custom branding and domain options for large organizations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-700 mb-2">Data Ownership</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Organizations retain ownership of their tournament data</li>
                <li>Platform may use aggregated, anonymized data for improvements</li>
                <li>Data export tools available for all subscription levels</li>
                <li>90-day data retention after account cancellation</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Payment and Subscription Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-6 w-6 text-purple-600" />
              Payment and Subscription Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-purple-700 mb-2">Billing Terms</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Subscriptions billed in advance (monthly or annually)</li>
                  <li>Automatic renewal unless cancelled 24 hours before billing</li>
                  <li>Price changes with 30-day advance notice</li>
                  <li>All payments processed securely through Stripe</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-purple-700 mb-2">Service Availability</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>99.9% uptime guarantee for paid subscriptions</li>
                  <li>Planned maintenance with advance notification</li>
                  <li>Emergency maintenance may occur without notice</li>
                  <li>Service credits for significant downtime</li>
                </ul>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Fair Billing:</strong> We believe in transparent, fair billing practices. 
                No hidden fees, clear cancellation policies, and prorated refunds when applicable.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-gray-600" />
              Limitation of Liability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Platform Responsibility</h3>
              <p className="text-sm text-gray-700 mb-3">
                Champions for Change Tournament Platform provides tournament management tools and services. 
                We are not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Disputes between tournament participants or organizers</li>
                <li>Prize distribution or tournament rule enforcement</li>
                <li>Physical injuries during tournament activities</li>
                <li>Loss of data due to user error or system failure beyond our control</li>
                <li>Third-party integrations or external service disruptions</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">User Responsibility</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Tournament organizers responsible for all tournament rules and prizes</li>
                <li>Users responsible for backup of important tournament data</li>
                <li>Compliance with local laws and regulations</li>
                <li>Appropriate supervision of minors using the platform</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Updates and Changes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-orange-600" />
              Terms Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-orange-700 mb-2">Notification Process</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>30-day advance notice for material changes to terms</li>
                  <li>Email notification to all active users</li>
                  <li>In-platform announcements for significant updates</li>
                  <li>Previous versions of terms available upon request</li>
                </ul>
              </div>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Continued use of the platform after terms updates constitutes acceptance 
                  of the new terms. Users who disagree may cancel their accounts before changes take effect.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-6 w-6 text-blue-600" />
              Contact & Disputes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Champions for Change</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li><strong>Email:</strong> legal@trantortournaments.org</li>
                  <li><strong>Phone:</strong> 361-300-1552</li>
                  <li><strong>Address:</strong> Corpus Christi, Texas</li>
                  <li><strong>Response Time:</strong> 5 business days for legal inquiries</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Dispute Resolution</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Good faith negotiation required before formal proceedings</li>
                  <li>Mediation through agreed-upon third party if needed</li>
                  <li>Binding arbitration for unresolved disputes</li>
                  <li>Texas state law governs all agreements</li>
                </ul>
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  For terms-related questions or concerns, please contact our legal team. 
                  We are committed to fair resolution of all disputes while supporting our educational mission.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6 border-t">
          <p className="mb-2">
            <strong>Last Updated:</strong> August 13, 2025 • <strong>Version:</strong> 3.0
          </p>
          <p>
            These terms reflect our commitment to fair treatment and educational mission 
            while providing excellent tournament management services.
          </p>
        </div>
      </div>
    </div>
  );
}