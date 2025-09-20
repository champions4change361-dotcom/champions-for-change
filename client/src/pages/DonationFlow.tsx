import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, GraduationCap, MapPin, Users, ArrowRight, Trophy, Zap, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface DonorInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  isAnonymous?: boolean;
}

export default function DonationFlow() {
  // Parse amount from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlAmount = urlParams.get('amount');
  
  const [step, setStep] = useState<'amount' | 'contact' | 'payment' | 'success'>('amount');
  const [donationAmount, setDonationAmount] = useState(urlAmount || '');
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    source: 'landing_page',
    isAnonymous: false
  });
  const [postDonationChoice, setPostDonationChoice] = useState<'test_platform' | 'just_donate' | 'learn_more'>('test_platform');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const predefinedAmounts = ['25', '50', '100', '250'];

  const handleAmountSelect = (amount: string) => {
    setDonationAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setDonationAmount('');
  };

  const getFinalAmount = () => {
    return donationAmount || customAmount;
  };

  const handleContinueToContact = () => {
    const finalAmount = getFinalAmount();
    const numericAmount = parseInt(finalAmount);
    
    if (!finalAmount || isNaN(numericAmount) || numericAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount (minimum $1).",
        variant: "destructive",
      });
      return;
    }

    setStep('contact');
  };

  const handleSubmitDonation = async () => {
    const finalAmount = getFinalAmount();
    const numericAmount = parseInt(finalAmount);

    // Validate all required fields
    if (!donorInfo.firstName || !donorInfo.lastName || !donorInfo.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields (name and email).",
        variant: "destructive",
      });
      return;
    }

    if (!finalAmount || isNaN(numericAmount) || numericAmount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      setStep('payment');

      // Create donor record and payment intent
      const response = await fetch('/api/create-donation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: numericAmount,
          donorInfo,
          postDonationChoice,
          description: `$${numericAmount} donation to Champions for Change educational programs`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process donation');
      }

      const { clientSecret, donorId } = await response.json();
      
      if (!clientSecret) {
        throw new Error('Payment setup incomplete');
      }
      
      // Redirect to payment method selection with client secret
      window.location.href = `/payment-methods?amount=${numericAmount}&donor_id=${donorId}&choice=${postDonationChoice}&client_secret=${encodeURIComponent(clientSecret)}`;
      
    } catch (error: any) {
      console.error('Donation error:', error);
      setStep('contact'); // Go back to contact form
      
      toast({
        title: "Donation Setup Failed",
        description: error.message || "Unable to process donation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderAmountStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          Support Champions for Change
        </CardTitle>
        <CardDescription className="text-lg text-slate-600">
          Help fund $2,600+ educational trips for underprivileged student competitors nationwide
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-green-800 text-lg">Your Impact</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>• $25 = Partial field trip funding</div>
            <div>• $50 = Student meal & transportation</div>
            <div>• $100 = Full day educational experience</div>
            <div>• $250 = Multiple students supported</div>
          </div>
        </div>

        <div>
          <Label className="text-lg font-semibold text-slate-700 mb-4 block">Choose Your Donation Amount</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={donationAmount === amount ? "default" : "outline"}
                className={`text-lg py-6 ${donationAmount === amount ? 'bg-green-600 hover:bg-green-700' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                onClick={() => handleAmountSelect(amount)}
                data-testid={`button-amount-${amount}`}
              >
                ${amount}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-amount" className="text-sm font-medium">Custom Amount:</Label>
            <div className="relative flex-1 max-w-32">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="0"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="pl-8"
                data-testid="input-custom-amount"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="flex-1 order-2 sm:order-1"
            data-testid="button-cancel-donation-amount"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContinueToContact}
            className="flex-1 bg-green-600 hover:bg-green-700 text-base sm:text-lg py-3 sm:py-6 order-1 sm:order-2"
            disabled={!getFinalAmount()}
            data-testid="button-continue-contact"
          >
            <span className="hidden sm:inline">Continue to Contact Information</span>
            <span className="sm:hidden">Continue to Contact</span>
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800">
          Contact Information
        </CardTitle>
        <CardDescription className="text-lg">
          Donating ${getFinalAmount()} to support student education
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
            <Input
              id="firstName"
              value={donorInfo.firstName}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Your first name"
              data-testid="input-first-name"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
            <Input
              id="lastName"
              value={donorInfo.lastName}
              onChange={(e) => setDonorInfo(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Your last name"
              data-testid="input-last-name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={donorInfo.email}
            onChange={(e) => setDonorInfo(prev => ({ ...prev, email: e.target.value }))}
            placeholder="your.email@example.com"
            data-testid="input-email"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium">Phone Number (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={donorInfo.phone}
            onChange={(e) => setDonorInfo(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="(555) 123-4567"
            data-testid="input-phone"
          />
        </div>

        {/* Anonymous Donation Option */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="anonymous"
              checked={donorInfo.isAnonymous || false}
              onCheckedChange={(checked) => setDonorInfo(prev => ({ ...prev, isAnonymous: !!checked }))}
              data-testid="checkbox-anonymous"
            />
            <div className="flex-1">
              <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
                Keep my donation anonymous
              </Label>
              <p className="text-xs text-gray-600 mt-1">
                Your contact information will be kept private. You'll still receive a tax receipt.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">What would you like to do after your donation?</Label>
          <RadioGroup value={postDonationChoice} onValueChange={(value: any) => setPostDonationChoice(value)}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="test_platform" id="test_platform" />
              <Label htmlFor="test_platform" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Test the platform with free access</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">Create tournaments and explore all features</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="just_donate" id="just_donate" />
              <Label htmlFor="just_donate" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="font-medium">Just complete my donation</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">Support students without platform access</div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
              <RadioGroupItem value="learn_more" id="learn_more" />
              <Label htmlFor="learn_more" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Learn more about our mission</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">Get updates on how your donation helps</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="flex-1 order-3 sm:order-1"
            data-testid="button-cancel-donation"
          >
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setStep('amount')}
            className="flex-1 order-2"
            data-testid="button-back-amount"
          >
            Back to Amount
          </Button>
          <Button 
            onClick={handleSubmitDonation}
            className="flex-1 bg-green-600 hover:bg-green-700 text-sm sm:text-base py-3 order-1 sm:order-3"
            disabled={!donorInfo.firstName || !donorInfo.lastName || !donorInfo.email}
            data-testid="button-proceed-payment"
          >
            <span className="hidden sm:inline">Proceed to Payment</span>
            <span className="sm:hidden">Complete Donation</span>
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPaymentStep = () => (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="text-center py-12">
        <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Setting up your donation...</h2>
        <p className="text-slate-600">Redirecting to secure payment processing</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-3 rounded-lg shadow-lg">
              <Trophy className="h-8 w-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Champions for Change</h1>
              <p className="text-yellow-400">Educational Impact Donation</p>
            </div>
          </div>
        </div>

        {/* Steps */}
        {step === 'amount' && renderAmountStep()}
        {step === 'contact' && renderContactStep()}
        {step === 'payment' && renderPaymentStep()}
      </div>
    </div>
  );
}