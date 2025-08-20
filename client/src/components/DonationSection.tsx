import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Plane, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DonationSectionProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export function DonationSection({ variant = 'full', className = '' }: DonationSectionProps) {
  const [donationAmount, setDonationAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const { toast } = useToast();

  const predefinedAmounts = ['25', '50', '100', '250'];

  const handleDonation = async (amount?: string) => {
    // Use the provided amount, or fall back to selected amount or custom amount
    const finalAmount = amount || donationAmount || customAmount;
    const numericAmount = parseInt(finalAmount);
    
    console.log('Donation attempt:', { amount, donationAmount, customAmount, finalAmount, numericAmount });
    
    if (!finalAmount || isNaN(numericAmount) || numericAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount (minimum $1).",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create payment intent on the server (secure)
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: numericAmount,
          description: `$${numericAmount} donation to Champions for Change educational programs`
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment setup error:', { status: response.status, response: errorText });
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: `Payment setup failed (${response.status})` };
        }
        throw new Error(errorData.message || `Payment setup failed: ${response.status}`);
      }

      const { clientSecret } = await response.json();
      
      if (!clientSecret) {
        throw new Error('Payment setup incomplete');
      }
      
      // Redirect to donation flow instead of direct checkout
      console.log('Redirecting to donation flow...');
      window.location.href = `/donate?amount=${numericAmount}`;
      
    } catch (error: any) {
      console.error('Donation error:', error);
      
      // Handle specific Stripe errors with helpful messages
      if (error.message.includes('Expired API Key') || error.message.includes('api_key_expired')) {
        toast({
          title: "Payment System Maintenance",
          description: "Our payment system is temporarily being updated. Please try again in a few minutes or contact support.",
          variant: "destructive",
        });
        return;
      }
      
      if (error.message.includes('Invalid API Key') || error.message.includes('authentication')) {
        toast({
          title: "Payment Configuration Issue",
          description: "There's a temporary issue with our payment system. Please contact support for assistance.",
          variant: "destructive",
        });
        return;
      }
      
      // Handle Stripe activation delay
      const isActivationIssue = error.message?.includes('Expired API Key') || 
                                error.message?.includes('activate') ||
                                error.message?.includes('account');
      
      toast({
        title: isActivationIssue ? "Account Activating" : "Payment Setup Failed",
        description: isActivationIssue 
          ? "Your Stripe account is still activating. Please try again in a few minutes."
          : error.message || "Unable to process donation. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (variant === 'compact') {
    return (
      <Card className={`bg-gradient-to-r from-green-50 to-blue-50 border-green-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-green-800">Support Our Mission</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Help fund educational trips for student competitors nationwide
          </p>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleDonation('25')}
              data-testid="button-donate-25"
            >
              Donate $25
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => handleDonation('50')}
              data-testid="button-donate-50"
            >
              $50
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-green-50 via-blue-50 to-green-50 border-2 border-green-200 ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-800 flex items-center justify-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          Support Champions for Change
        </CardTitle>
        <CardDescription className="text-lg text-gray-700">
          Enjoying our platform? Help us fund educational opportunities for underprivileged student competitors
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center space-y-2">
            <Plane className="h-8 w-8 text-blue-600" />
            <h4 className="font-semibold">Educational Trips</h4>
            <p className="text-sm text-gray-600">$2,600+ per student for educational tours</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <BookOpen className="h-8 w-8 text-green-600" />
            <h4 className="font-semibold">Educational Focus</h4>
            <p className="text-sm text-gray-600">Supporting underprivileged student competitor education</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Users className="h-8 w-8 text-purple-600" />
            <h4 className="font-semibold">Coach-Built Platform</h4>
            <p className="text-sm text-gray-600">Created by educators who understand student needs</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-center">Choose Your Donation Amount</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={donationAmount === amount ? 'default' : 'outline'}
                className={`${
                  donationAmount === amount 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'border-green-600 text-green-600 hover:bg-green-50'
                }`}
                onClick={() => {
                  setDonationAmount(amount);
                  setCustomAmount('');
                  handleDonation(amount);
                }}
                data-testid={`button-select-${amount}`}
              >
                ${amount}
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setDonationAmount('');
              }}
              className="flex-1"
              min="1"
              data-testid="input-custom-amount"
            />
            <Button
              onClick={() => handleDonation(customAmount)}
              className="bg-green-600 hover:bg-green-700 px-6"
              data-testid="button-donate-custom"
            >
              Donate
            </Button>
          </div>

          <Button
            onClick={() => handleDonation()}
            disabled={!donationAmount && !customAmount}
            className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg"
            data-testid="button-donate-selected"
          >
            {donationAmount ? `Donate $${donationAmount}` : customAmount ? `Donate $${customAmount}` : 'Select Amount Above'}
          </Button>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-center">
          <p className="text-green-800 text-sm">
            <strong>✅ Payment System Active</strong> - Champions for Change Stripe account is now fully operational! 
            If you see any cached errors, please refresh your browser.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
          <p className="text-blue-800 text-sm">
            <strong>100% of donations</strong> go directly to funding student educational trips. 
            Platform revenue covers operational costs separately.
          </p>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Champions for Change is a 501(c)(3) nonprofit organization</p>
          <p>Contact: champions4change361@gmail.com | 361-300-1552</p>
        </div>
      </CardContent>
    </Card>
  );
}