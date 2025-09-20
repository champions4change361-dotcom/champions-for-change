import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, CreditCard, ArrowLeft, Smartphone, Repeat } from 'lucide-react';
import { SiPaypal, SiVenmo } from 'react-icons/si';

export default function PaymentMethods() {
  const [paymentData, setPaymentData] = useState<{
    amount: string;
    donorId: string;
    postDonationChoice: string;
  } | null>(null);
  const [isMonthly, setIsMonthly] = useState(false);

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

  const trackPaymentMethod = async (method: string) => {
    if (!paymentData) return;
    
    try {
      await fetch('/api/donation/track-payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          donorId: paymentData.donorId,
          amount: paymentData.amount,
          paymentMethod: method,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Payment tracking error:', error);
    }
  };

  const handleStripePayment = async (paymentType = 'card') => {
    if (!paymentData) return;
    
    // Track payment method selection
    await trackPaymentMethod(paymentType);
    
    try {
      // Use existing payment intent - get clientSecret from URL params or create new one
      const urlParams = new URLSearchParams(window.location.search);
      let clientSecret = urlParams.get('client_secret');
      
      if (!clientSecret) {
        // Create payment intent or subscription based on monthly selection
        const endpoint = isMonthly ? '/api/create-subscription' : '/api/create-payment-intent';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            amount: parseInt(paymentData.amount),
            description: `$${paymentData.amount} ${isMonthly ? 'monthly ' : ''}donation to Champions for Change educational programs`,
            isMonthly,
            donorId: paymentData.donorId
          }),
        });

        const data = await response.json();
        clientSecret = data.clientSecret;
      }

      if (clientSecret) {
        const checkoutUrl = `/checkout?client_secret=${encodeURIComponent(clientSecret)}&amount=${paymentData.amount}&donor_id=${paymentData.donorId}&choice=${paymentData.postDonationChoice}&monthly=${isMonthly}&payment_type=${paymentType}`;
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment setup error:', error);
    }
  };

  const handleApplePayPayment = () => handleStripePayment('apple_pay');
  const handleGooglePayPayment = () => handleStripePayment('google_pay');

  const handlePayPalPayment = async () => {
    if (!paymentData) return;
    
    // Track payment method selection
    await trackPaymentMethod('paypal');
    
    // PayPal donation link with mobile app deep linking
    const paypalEmail = 'champions4change361@gmail.com';
    const paypalUrl = `https://www.paypal.com/donate/?business=${encodeURIComponent(paypalEmail)}&amount=${paymentData.amount}&currency_code=USD&item_name=${encodeURIComponent('Champions for Change Educational Donation')}`;
    
    // Use location.href for better mobile app support
    window.location.href = paypalUrl;
  };

  const handleVenmoPayment = async () => {
    if (!paymentData) return;
    
    // Track payment method selection  
    await trackPaymentMethod('venmo');
    
    // Venmo deep link with mobile app support
    const venmoUsername = 'championsforchange'; // Your Venmo business username
    const note = encodeURIComponent(`$${paymentData.amount} donation for Champions for Change educational programs`);
    
    // Try mobile app deep link first, fallback to web
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use Venmo app deep link for mobile
      const venmoDeepLink = `venmo://paycharge?txn=pay&recipients=${venmoUsername}&amount=${paymentData.amount}&note=${note}`;
      
      // Try to open Venmo app, fallback to web if app not installed
      window.location.href = venmoDeepLink;
      
      // Fallback to web after a short delay if app doesn't open
      setTimeout(() => {
        const venmoWebUrl = `https://venmo.com/${venmoUsername}?txn=pay&amount=${paymentData.amount}&note=${note}`;
        window.location.href = venmoWebUrl;
      }, 1000);
    } else {
      // Desktop - use web version
      const venmoWebUrl = `https://venmo.com/${venmoUsername}?txn=pay&amount=${paymentData.amount}&note=${note}`;
      window.location.href = venmoWebUrl;
    }
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
              Your ${paymentData.amount} {isMonthly ? 'monthly ' : ''}donation will help fund educational trips for underprivileged youth 
              in Corpus Christi, Texas, supporting Robert Driscoll Middle School students.
            </p>
          </div>

          {/* Monthly Donation Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Monthly Donation</h3>
                  <p className="text-sm text-blue-600">Support students every month</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMonthly}
                  onChange={(e) => setIsMonthly(e.target.checked)}
                  className="sr-only peer"
                  data-testid="toggle-monthly"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {isMonthly && (
              <div className="mt-3 p-3 bg-blue-100 rounded-md">
                <p className="text-xs text-blue-700">
                  <strong>Monthly Impact:</strong> ${paymentData.amount}/month helps provide consistent support for student educational opportunities. Cancel anytime.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 text-center">Select Your Preferred Payment Method</h3>
            
            {/* Credit Card / Stripe */}
            <Button
              onClick={() => handleStripePayment('card')}
              className="w-full p-6 bg-blue-600 hover:bg-blue-700 flex items-center justify-between"
              data-testid="button-stripe-payment"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Credit / Debit Card</div>
                  <div className="text-sm opacity-90">Includes Cash App, Klarna, Link</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm">Most Popular</div>
                <div className="text-xs opacity-75">Instant processing</div>
              </div>
            </Button>

            {/* Apple Pay */}
            <Button
              onClick={handleApplePayPayment}
              variant="outline"
              className="w-full p-6 border-2 border-gray-500 hover:bg-gray-50 flex items-center justify-between"
              data-testid="button-apple-pay"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-gray-700" />
                <div className="text-left">
                  <div className="font-semibold text-gray-700">Apple Pay</div>
                  <div className="text-sm text-gray-600">Touch ID, Face ID, or passcode</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-700">iPhone/Mac</div>
                <div className="text-xs text-gray-500">One-touch payment</div>
              </div>
            </Button>

            {/* Google Pay */}
            <Button
              onClick={handleGooglePayPayment}
              variant="outline"
              className="w-full p-6 border-2 border-green-500 hover:bg-green-50 flex items-center justify-between"
              data-testid="button-google-pay"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-green-600">Google Pay</div>
                  <div className="text-sm text-gray-600">Fingerprint or PIN verification</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-600">Android/Chrome</div>
                <div className="text-xs text-gray-500">Quick checkout</div>
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