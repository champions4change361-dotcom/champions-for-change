import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  GraduationCap, 
  Building2, 
  Users, 
  Database, 
  Lock,
  Heart,
  Mail,
  FileText,
  Eye,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-6 max-w-5xl" data-testid="privacy-policy">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Shield className="h-10 w-10 text-blue-600" />
          Privacy Policy
        </h1>
        <p className="text-xl text-gray-600">
          Our commitment to protecting your privacy while supporting education
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            FERPA Compliant
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Educational Mission
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Champions for Change
          </Badge>
        </div>
      </div>

      <div className="space-y-8">
        {/* Commitment Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              Our Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">
              Champions for Change Tournament Platform is committed to protecting your privacy while supporting 
              educational opportunities for students. This policy explains how we collect, use, and protect your 
              information across our three domains.
            </p>
          </CardContent>
        </Card>

        {/* Domain-Specific Data Handling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              Domain-Specific Data Handling
            </CardTitle>
            <CardDescription>
              Different privacy standards for different platform areas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Educational Domain */}
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Educational Domain (tournaments.trantortournaments.org)
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li><strong>FERPA Compliant:</strong> Student data protection standards</li>
                <li><strong>School-Safe Guarantee:</strong> Zero data sharing with entertainment domains</li>
                <li><strong>Educational Purpose Only:</strong> Data used solely for tournament management</li>
                <li><strong>District Control:</strong> Schools maintain ownership of their data</li>
              </ul>
            </div>

            {/* Business Domain */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Domain (pro.trantortournaments.org)
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li><strong>Professional Standards:</strong> Business-grade data security</li>
                <li><strong>Limited Sharing:</strong> Only with explicitly consented integrations</li>
                <li><strong>Analytics Purpose:</strong> Platform improvement and tournament insights</li>
                <li><strong>Opt-Out Available:</strong> Users can limit data usage</li>
              </ul>
            </div>

            {/* Coaches Lounge */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Coaches Lounge (coaches.trantortournaments.org)
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li><strong>Community Focus:</strong> Data used for fantasy sports and community features</li>
                <li><strong>Age Verification Required:</strong> 18+ only, verified accounts</li>
                <li><strong>Social Features:</strong> Limited sharing for league and competition purposes</li>
                <li><strong>No Gambling Data:</strong> Educational fantasy sports only</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-gray-600" />
              Data Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-700 mb-2">Information We Collect</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li><strong>Account Information:</strong> Name, email, organization affiliation</li>
                <li><strong>Tournament Data:</strong> Scores, brackets, participant information</li>
                <li><strong>Usage Analytics:</strong> Platform interaction for improvement purposes</li>
                <li><strong>Payment Information:</strong> Processed securely through Stripe (not stored)</li>
                <li><strong>Fantasy Data:</strong> Player selections, league participation (Coaches Lounge only)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-red-700 mb-2">Information We Don't Collect</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li><strong>Student Personal Information:</strong> Beyond tournament participation</li>
                <li><strong>Financial Details:</strong> Credit cards stored with Stripe, not us</li>
                <li><strong>Cross-Domain Tracking:</strong> Educational users never tracked on other domains</li>
                <li><strong>Social Media Content:</strong> Only public profile information with consent</li>
              </ul>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Data Sharing Policy:</strong> We never sell user data to third parties. 
                Data is only shared with essential service providers (Stripe, email services) 
                or when legally required. All revenue supports Champions for Change educational mission.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-yellow-600" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Technical Safeguards</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li><strong>Encryption:</strong> All data encrypted in transit and at rest</li>
                  <li><strong>Secure Hosting:</strong> Replit enterprise hosting with SOC 2 compliance</li>
                  <li><strong>Access Controls:</strong> Role-based access with authentication</li>
                  <li><strong>Regular Audits:</strong> Quarterly security reviews and updates</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-green-700 mb-2">Organizational Safeguards</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li><strong>Employee Training:</strong> Regular privacy and security education</li>
                  <li><strong>Data Minimization:</strong> Collect only necessary information</li>
                  <li><strong>Retention Policies:</strong> Automatic deletion of expired data</li>
                  <li><strong>Breach Response:</strong> 72-hour notification procedures</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-6 w-6 text-purple-600" />
              Your Rights & Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-800">Access</h4>
                  <p className="text-sm text-blue-700">View and download your data anytime</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <RefreshCw className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Correction</h4>
                  <p className="text-sm text-green-700">Update incorrect information</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
                <div>
                  <h4 className="font-medium text-red-800">Deletion</h4>
                  <p className="text-sm text-red-700">Request account and data deletion</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Download className="h-5 w-5 text-purple-600" />
                <div>
                  <h4 className="font-medium text-purple-800">Portability</h4>
                  <p className="text-sm text-purple-700">Export data in standard formats</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Educational Mission */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <GraduationCap className="h-6 w-6" />
              Educational Mission Commitment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Every policy decision supports our educational mission:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-green-700">
                <li><strong>Student Privacy First:</strong> Protecting student information is paramount</li>
                <li><strong>Transparent Funding:</strong> Clear how revenue supports educational trips</li>
              </ul>
              <ul className="space-y-2 text-sm text-green-700">
                <li><strong>Community Benefit:</strong> Policies designed to serve schools and coaches</li>
                <li><strong>Long-term Sustainability:</strong> Ensuring platform serves educational mission indefinitely</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-blue-600" />
              Contact & Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Champions for Change</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li><strong>Email:</strong> privacy@trantortournaments.org</li>
                  <li><strong>Phone:</strong> 361-300-1552</li>
                  <li><strong>Response Time:</strong> 30 days maximum</li>
                </ul>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  For any privacy concerns, data requests, or questions about our educational mission, 
                  please contact us using the information above. We are committed to responding promptly 
                  and protecting your rights.
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
            This policy reflects our commitment to protecting your privacy while supporting 
            educational opportunities for students through Champions for Change.
          </p>
        </div>
      </div>
    </div>
  );
}