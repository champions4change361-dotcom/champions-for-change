import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Heart, GraduationCap } from 'lucide-react';
import { Link } from 'wouter';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ amount, type }: { amount: string; type: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?type=${type}&amount=${amount}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative min-h-[200px]">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
        {(!stripe || !elements) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading payment form...</p>
            </div>
          </div>
        )}
      </div>
      
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg disabled:opacity-50"
        data-testid="button-complete-payment"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            Processing...
          </span>
        ) : (
          `${type === 'donation' ? '💚 Donate' : 'Pay'} $${amount}`
        )}
      </Button>
      
      {(!stripe || !elements) && (
        <p className="text-xs text-center text-orange-600 bg-orange-50 p-2 rounded">
          ⚠️ Payment form is loading. If this persists, please refresh the page.
        </p>
      )}
    </form>
  );
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('donation');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecretParam = urlParams.get('client_secret');
    const amountParam = urlParams.get('amount');
    const typeParam = urlParams.get('type');

    if (clientSecretParam) setClientSecret(clientSecretParam);
    if (amountParam) setAmount(amountParam);
    if (typeParam) setType(typeParam);

    // If no client secret, redirect back
    if (!clientSecretParam) {
      window.location.href = '/';
    }
  }, []);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Setting up secure payment...</p>
          <p className="text-sm text-gray-500">
            If this takes too long, please go back and try again.
          </p>
          <Link href="/" className="mt-4 inline-block text-green-600 hover:text-green-700 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#16a34a',
      colorBackground: '#ffffff',
      colorText: '#374151',
      colorDanger: '#dc2626',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  } as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-red-500" />
              <h1 className="text-xl font-bold text-gray-900">
                {type === 'donation' ? 'Support Champions for Change' : 'Complete Payment'}
              </h1>
            </div>
            <Link href="/" className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {type === 'donation' && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800 flex items-center justify-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Your Impact
              </CardTitle>
              <CardDescription className="text-lg">
                Your ${amount} donation helps fund educational opportunities for students in Corpus Christi, Texas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-gray-700">
              <p>• 100% of donations go directly to student educational trips</p>
              <p>• Average trip cost: $2,600+ per student</p>
              <p>• Supporting Robert Driscoll Middle School and other local schools</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Secure payment processing powered by Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-center text-sm text-gray-600">
              🔒 Secure payment processing • All data encrypted
            </div>
            <Elements 
              stripe={stripePromise} 
              options={{ clientSecret, appearance }}
              key={clientSecret} // Force re-render if client secret changes
            >
              <CheckoutForm amount={amount} type={type} />
            </Elements>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔒 Your payment information is secure and encrypted</p>
          <p>Champions for Change is a 501(c)(3) nonprofit organization</p>
        </div>
      </main>
    </div>
  );
}