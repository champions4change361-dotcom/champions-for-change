import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, CreditCard, ArrowLeft } from 'lucide-react';
import { SiPaypal, SiVenmo } from 'react-icons/si';

export default function PaymentMethods() {
  const [paymentData, setPaymentData] = useState<{
    amount: string;
    donorId: string;
    postDonationChoice: string;
  } | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const donorId = urlParams.get('donor_id');
    const postDonationChoice = urlParams.get('choice');

    if (!amount) {
      window.location.href = '/donate';
      return;
    }

    setPaymentData({
      amount,
      donorId: donorId || '',
      postDonationChoice: postDonationChoice || 'just_donate'
    });
  }, []);

  const handleStripePayment = async () => {
    if (!paymentData) return;
    
    try {
      // Use existing payment intent - get clientSecret from URL params or create new one
      const urlParams = new URLSearchParams(window.location.search);
      let clientSecret = urlParams.get('client_secret');
      
      if (!clientSecret) {
        // If no client secret in URL, create a new payment intent
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: parseInt(paymentData.amount),
            description: `$${paymentData.amount} donation to Champions for Change educational programs`
          }),
        });

        const data = await response.json();
        clientSecret = data.clientSecret;
      }

      if (clientSecret) {
        window.location.href = `/checkout?client_secret=${encodeURIComponent(clientSecret)}&amount=${paymentData.amount}&donor_id=${paymentData.donorId}&choice=${paymentData.postDonationChoice}`;
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment setup error:', error);
    }
  };

  const handlePayPalPayment = () => {
    if (!paymentData) return;
    
    // PayPal donation link - replace YOUR_PAYPAL_EMAIL with your actual PayPal email
    const paypalEmail = 'champions4change361@gmail.com'; // Your PayPal email
    const paypalUrl = `https://www.paypal.com/donate/?business=${encodeURIComponent(paypalEmail)}&amount=${paymentData.amount}&currency_code=USD&item_name=${encodeURIComponent('Champions for Change Educational Donation')}`;
    window.open(paypalUrl, '_blank');
    
    // Keep user on page - they must complete payment externally
    // Do not auto-redirect to success without payment confirmation
  };

  const handleVenmoPayment = () => {
    if (!paymentData) return;
    
    // Venmo deep link - using your actual Venmo username
    const venmoUsername = 'championsforchange'; // Your Venmo business username
    const note = encodeURIComponent(`$${paymentData.amount} donation for Champions for Change educational programs`);
    const venmoUrl = `https://venmo.com/${venmoUsername}?txn=pay&amount=${paymentData.amount}&note=${note}`;
    
    window.open(venmoUrl, '_blank');
    
    // Keep user on page - they must complete payment externally
    // Do not auto-redirect to success without payment confirmation
  };

  if (!paymentData) {
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
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Choose Payment Method
          </CardTitle>
          <CardDescription className="text-lg">
            ${paymentData.amount} donation to Champions for Change educational programs
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Your Impact</h3>
            </div>
            <p className="text-sm text-green-700">
              Your ${paymentData.amount} donation will help fund educational trips for underprivileged youth 
              in Corpus Christi, Texas, supporting Robert Driscoll Middle School students.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 text-center">Select Your Preferred Payment Method</h3>
            
            {/* Credit Card / Stripe */}
            <Button
              onClick={handleStripePayment}
              className="w-full p-6 bg-blue-600 hover:bg-blue-700 flex items-center justify-between"
              data-testid="button-stripe-payment"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Credit / Debit Card</div>
                  <div className="text-sm opacity-90">Secure payment with Stripe</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Most Popular</div>
                <div className="text-xs opacity-75">Instant processing</div>
              </div>
            </Button>

            {/* PayPal */}
            <Button
              onClick={handlePayPalPayment}
              variant="outline"
              className="w-full p-6 border-2 border-blue-500 hover:bg-blue-50 flex items-center justify-between"
              data-testid="button-paypal-payment"
            >
              <div className="flex items-center gap-3">
                <SiPaypal className="h-6 w-6 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-blue-600">PayPal</div>
                  <div className="text-sm text-gray-600">Pay with your PayPal account</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600">Personal Account</div>
                <div className="text-xs text-gray-500">External redirect</div>
              </div>
            </Button>

            {/* Venmo */}
            <Button
              onClick={handleVenmoPayment}
              variant="outline"
              className="w-full p-6 border-2 border-purple-500 hover:bg-purple-50 flex items-center justify-between"
              data-testid="button-venmo-payment"
            >
              <div className="flex items-center gap-3">
                <SiVenmo className="h-6 w-6 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold text-purple-600">Venmo</div>
                  <div className="text-sm text-gray-600">Pay with Venmo (mobile-friendly)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-600">Nonprofit Business</div>
                <div className="text-xs text-gray-500">Opens Venmo app</div>
              </div>
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Contact Info
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-blue-800 text-sm">
              <strong>All payment methods</strong> support Champions for Change's mission to fund 
              educational opportunities for underprivileged youth in Corpus Christi, Texas.
            </p>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>Champions for Change is a 501(c)(3) nonprofit organization</p>
            <p>Contact: champions4change361@gmail.com | 361-300-1552</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}