import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Heart, CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

// Load Stripe with public key from environment
if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLISHABLE_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  amount: string;
  donorId: string;
  postDonationChoice: string;
  paymentType?: string;
  isMonthly?: boolean;
}

function CheckoutForm({ clientSecret, amount, donorId, postDonationChoice, paymentType, isMonthly }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donation-success?amount=${amount}&choice=${postDonationChoice}&donor_id=${donorId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      } else {
        setPaymentSucceeded(true);
        toast({
          title: "Payment Successful!",
          description: "Thank you for your donation to Champions for Change!",
        });
        
        // Redirect to success page after a short delay
        setTimeout(() => {
          window.location.href = `/donation-success?amount=${amount}&choice=${postDonationChoice}&donor_id=${donorId}`;
        }, 2000);
      }
    } catch (err: any) {
      console.error('Payment processing error:', err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Redirecting you to your next steps...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
          Complete Your Donation
        </CardTitle>
        <CardDescription className="text-lg">
          ${amount} {isMonthly ? 'monthly ' : ''}donation to Champions for Change educational programs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800">Your Impact</h3>
            </div>
            <p className="text-sm text-green-700">
              Your ${amount} {isMonthly ? 'monthly ' : ''}donation will help fund educational trips for underprivileged youth 
              in Corpus Christi, Texas, supporting Robert Driscoll Middle School students.
              {isMonthly ? ' You can cancel your monthly donation anytime.' : ''}
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <PaymentElement
              options={{
                wallets: {
                  applePay: paymentType === 'apple_pay' ? 'auto' : 'never',
                  googlePay: paymentType === 'google_pay' ? 'auto' : 'never'
                },
                ...(paymentType === 'apple_pay' || paymentType === 'google_pay' ? {
                  fields: {
                    billingDetails: 'never'
                  }
                } : {})
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
              data-testid="button-complete-donation"
            >
              {isProcessing ? 'Processing...' : `Complete $${amount} Donation`}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure payment processing by Stripe</p>
          <p>Champions for Change is a 501(c)(3) nonprofit organization</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Checkout() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    amount: string;
    donorId: string;
    postDonationChoice: string;
    paymentType?: string;
    isMonthly?: boolean;
  } | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecret = urlParams.get('client_secret');
    const amount = urlParams.get('amount');
    const donorId = urlParams.get('donor_id');
    const postDonationChoice = urlParams.get('choice');
    const paymentType = urlParams.get('payment_type');
    const isMonthly = urlParams.get('monthly') === 'true';

    if (!clientSecret || !amount) {
      setError('Missing payment information. Please start over.');
      setLoading(false);
      return;
    }

    setPaymentData({
      clientSecret,
      amount,
      donorId: donorId || '',
      postDonationChoice: postDonationChoice || 'just_donate',
      paymentType: paymentType || undefined,
      isMonthly: isMonthly || false
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <h2 className="text-xl font-bold text-red-600 mb-4">Payment Setup Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.href = '/donate'}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const options = {
    clientSecret: paymentData.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#16a34a',
      },
    },
    paymentMethodCreation: 'manual' as const,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm {...paymentData} />
      </Elements>
    </div>
  );
}