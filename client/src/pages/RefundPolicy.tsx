import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Trophy, 
  Heart, 
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Phone,
  Mail
} from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="container mx-auto p-6 max-w-5xl" data-testid="refund-policy">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <CreditCard className="h-10 w-10 text-green-600" />
          Refund Policy
        </h1>
        <p className="text-xl text-gray-600">
          Clear and fair refund terms supporting our educational mission
        </p>
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Fair Refunds
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Transparent Terms
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Educational Focus
          </Badge>
        </div>
      </div>

      <div className="space-y-8">
        {/* Annual Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              Annual Subscription Plans
            </CardTitle>
            <CardDescription>
              Long-term commitments with extended refund windows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Champion Annual */}
            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Champion Annual ($990/year - Save $198)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Free Trial:</strong> 30 days full access, cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Refund Window:</strong> Prorated refunds within first 60 days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span><strong>After 60 Days:</strong> No refunds except exceptional circumstances</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span><strong>Cancellation:</strong> Can cancel to prevent next year's renewal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Annual */}
            <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enterprise Annual ($3,990/year - Save $798)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Free Consultation:</strong> 30-day implementation period</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Refund Window:</strong> Prorated refunds within first 90 days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span><strong>After 90 Days:</strong> No refunds except exceptional circumstances</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span><strong>Contract Terms:</strong> Annual commitment with renewal options</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Subscription Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-green-600" />
              Monthly Subscription Plans
            </CardTitle>
            <CardDescription>
              Flexible monthly options with clear terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Champion Monthly */}
            <div className="border rounded-lg p-4 bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Champion Monthly ($99/month)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Free Trial:</strong> 30 days full access</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Cancel Anytime:</strong> No future charges, immediate cancellation</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span><strong>No Refunds:</strong> After trial period ends</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span><strong>Fair Warning:</strong> Clear disclosure before trial ends</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Monthly */}
            <div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enterprise Monthly ($399/month)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Free Trial:</strong> 30 days full access with setup support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Migration Support:</strong> Help transitioning to annual plans</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span><strong>No Refunds:</strong> After trial period ends</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span><strong>Cancel Anytime:</strong> 30-day notice for large implementations</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tournament Credits & One-Time Purchases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-600" />
              Tournament Credits & One-Time Purchases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-purple-50 border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3">Tournament Credit Packages</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Full Refunds:</strong> Within 7 days if no tournaments created</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span><strong>Partial Refunds:</strong> Unused credits refundable within 30 days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span><strong>No Refunds:</strong> After first tournament is created</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <span><strong>Transferable:</strong> Credits can be used across seasons</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">Registration Fees (Paid to Organizers)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span><strong>Organizer Policy:</strong> Refunds handled by tournament organizers</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span><strong>Dispute Resolution:</strong> Assistance with organizer communication</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span><strong>Platform Not Liable:</strong> We facilitate payment, don't control refunds</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span><strong>Emergency Situations:</strong> Platform may intervene for safety issues</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donations */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Heart className="h-6 w-6" />
              Donations to Champions for Change
            </CardTitle>
            <CardDescription className="text-green-700">
              Supporting educational opportunities for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span><strong>Tax Deductible:</strong> Eligible for tax benefits</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span><strong>Transparency:</strong> Annual reports on student trip funding</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span><strong>No Refunds:</strong> Donations are final contributions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <Trophy className="h-4 w-4 text-green-600" />
                  <span><strong>Recognition:</strong> Optional donor recognition programs</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Transparency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Revenue Transparency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800">Platform Subscriptions</h4>
                  <p className="text-sm text-blue-700">Fund platform development and Champions for Change</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-800">Organizer Fees</h4>
                  <p className="text-sm text-green-700">100% to tournament organizers for their events</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-800">Donations</h4>
                  <p className="text-sm text-purple-700">100% to designated recipients (organizers or Champions for Change)</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-800">Credit Purchases</h4>
                  <p className="text-sm text-orange-700">Fund platform operation and educational mission</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-6 w-6 text-blue-600" />
              Contact & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Champions for Change</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li><strong>Email:</strong> refunds@trantortournaments.org</li>
                  <li><strong>Phone:</strong> 361-300-1552</li>
                  <li><strong>Response Time:</strong> 5 business days for refund requests</li>
                </ul>
              </div>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  For refund requests, please include your order number, account information, 
                  and reason for the request. We process all refunds according to the terms 
                  outlined above and will respond within 5 business days.
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
            This refund policy reflects our commitment to fair treatment while supporting 
            the educational mission of Champions for Change.
          </p>
        </div>
      </div>
    </div>
  );
}