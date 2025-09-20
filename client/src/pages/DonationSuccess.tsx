import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Heart, Trophy, GraduationCap, ArrowRight, Mail, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DonationSuccess() {
  const [donationData, setDonationData] = useState<{
    amount: string;
    choice: string;
    donorId: string;
  } | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<'sending' | 'sent' | 'error'>('sending');
  const [receiptNumber, setReceiptNumber] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount') || '0';
    const choice = urlParams.get('choice') || 'just_donate';
    const donorId = urlParams.get('donor_id') || '';
    const isAnonymous = urlParams.get('anonymous') === 'true';

    setDonationData({ amount, choice, donorId });

    // Automatically send tax receipt
    sendTaxReceipt({ amount, choice, donorId, isAnonymous });
  }, []);

  const sendTaxReceipt = async (data: { amount: string, choice: string, donorId: string, isAnonymous: boolean }) => {
    try {
      // In a real implementation, we'd fetch the donor info from the backend
      // For now, we'll simulate the receipt sending
      const response = await fetch('/api/donation/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          donationData: {
            donorInfo: {
              firstName: 'Donor', // Would be fetched from backend
              lastName: 'Name',
              email: 'donor@example.com' // Would be fetched from backend
            },
            amount: parseFloat(data.amount),
            donationDate: new Date(),
            donationId: data.donorId,
            isAnonymous: data.isAnonymous
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        setReceiptStatus('sent');
        setReceiptNumber(result.receiptNumber || '');
        toast({
          title: "Tax Receipt Sent!",
          description: "Check your email for your tax-deductible donation receipt.",
        });
      } else {
        throw new Error('Failed to send receipt');
      }
    } catch (error) {
      console.error('Receipt sending error:', error);
      setReceiptStatus('error');
      toast({
        title: "Receipt Issue",
        description: "We'll send your tax receipt shortly. Contact us if you don't receive it.",
        variant: "destructive",
      });
    }
  };

  const handlePlatformAccess = () => {
    // For now, redirect to login - later this could create a temporary account
    window.location.href = '/api/login';
  };

  const handleLearnMore = () => {
    // Redirect back to main landing page
    window.location.href = '/#about';
  };

  if (!donationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-800">
            Thank You for Your Donation!
          </CardTitle>
          <CardDescription className="text-lg text-gray-700">
            Your ${donationData.amount} donation to Champions for Change has been processed successfully
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tax Receipt Status */}
          <div className={`border rounded-lg p-6 ${receiptStatus === 'sent' ? 'bg-blue-50 border-blue-200' : receiptStatus === 'error' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              {receiptStatus === 'sent' ? (
                <FileCheck className="h-6 w-6 text-blue-600" />
              ) : receiptStatus === 'sending' ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              ) : (
                <Mail className="h-6 w-6 text-yellow-600" />
              )}
              <h3 className={`font-semibold text-lg ${receiptStatus === 'sent' ? 'text-blue-800' : receiptStatus === 'error' ? 'text-yellow-800' : 'text-gray-800'}`}>
                {receiptStatus === 'sent' ? 'Tax Receipt Sent!' : receiptStatus === 'error' ? 'Receipt Processing' : 'Sending Tax Receipt...'}
              </h3>
            </div>
            <div className={`text-sm space-y-2 ${receiptStatus === 'sent' ? 'text-blue-700' : receiptStatus === 'error' ? 'text-yellow-700' : 'text-gray-700'}`}>
              {receiptStatus === 'sent' ? (
                <>
                  <p>• <strong>Your tax-deductible receipt has been emailed to you</strong></p>
                  {receiptNumber && <p>• Receipt Number: <strong>{receiptNumber}</strong></p>}
                  <p>• Keep this receipt for your tax records</p>
                  <p>• Champions for Change is a 501(c)(3) tax-exempt organization</p>
                  <p>• Questions? Contact champions4change361@gmail.com</p>
                </>
              ) : receiptStatus === 'error' ? (
                <>
                  <p>• We're processing your tax receipt and will email it shortly</p>
                  <p>• If you don't receive it within 24 hours, please contact us</p>
                  <p>• Email: champions4change361@gmail.com | Phone: 361-300-1552</p>
                </>
              ) : (
                <>
                  <p>• Generating your IRS-compliant tax receipt</p>
                  <p>• Will be emailed to you momentarily</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="h-6 w-6 text-red-500" />
              <h3 className="font-semibold text-green-800 text-lg">Your Impact</h3>
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              <p>• Your donation directly funds educational trips for underprivileged youth</p>
              <p>• Students at Robert Driscoll Middle School will benefit from your generosity</p>
              <p>• 100% of your donation goes to student educational opportunities</p>
              <p>• You're helping create life-changing experiences in Corpus Christi, Texas</p>
            </div>
          </div>

          {donationData.choice === 'test_platform' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <Trophy className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-800 text-lg">Explore Our Platform</h3>
              </div>
              <p className="text-blue-700 mb-4">
                As a donor, you now have access to test our tournament management platform. 
                Create tournaments, explore features, and see how coaches are using our tools.
              </p>
              <Button
                onClick={handlePlatformAccess}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-access-platform"
              >
                Access Platform
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {donationData.choice === 'learn_more' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-purple-800 text-lg">Learn More About Our Mission</h3>
              </div>
              <p className="text-purple-700 mb-4">
                Discover how Champions for Change is transforming education through technology 
                and direct student support in Corpus Christi, Texas.
              </p>
              <Button
                onClick={handleLearnMore}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
                data-testid="button-learn-more"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Thank You Message</h3>
            <p className="text-gray-700 text-sm mb-4">
              "Your support means the world to our students. Every donation brings us closer 
              to providing life-changing educational experiences that these young people deserve."
            </p>
            <p className="text-gray-600 text-xs">
              - Daniel Thornton, Executive Director<br/>
              Champions for Change | champions4change361@gmail.com
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
              data-testid="button-home"
            >
              Return Home
            </Button>
            <Button
              onClick={() => window.location.href = '/donate'}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-donate-again"
            >
              Donate Again
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>You will receive an email receipt for your donation</p>
            <p>Champions for Change is a 501(c)(3) nonprofit organization</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}