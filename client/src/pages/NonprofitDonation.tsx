import { useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, GraduationCap, Users, Trophy } from "lucide-react";

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const DonationForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [cause, setCause] = useState('');
  const [targetProgram, setTargetProgram] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const donationCauses = [
    { value: 'student-trips', label: 'Student Educational Trips', icon: GraduationCap },
    { value: 'academic-competitions', label: 'Academic Competition Travel', icon: Trophy },
    { value: 'equipment-supplies', label: 'Educational Equipment & Supplies', icon: Users },
    { value: 'general-mission', label: 'General Educational Mission', icon: Heart },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !amount || !donorEmail || !cause) return;

    setIsProcessing(true);

    try {
      // Create donation payment intent (qualifies for nonprofit rates)
      const response = await apiRequest("POST", "/api/nonprofit/donation", {
        amount: parseFloat(amount),
        donorEmail,
        cause,
        targetProgram: targetProgram || undefined
      });

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/donation-success',
        },
      });

      if (error) {
        toast({
          title: "Donation Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Thank You!",
          description: "Your donation supports educational opportunities for students",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process donation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Donation Amount</Label>
          <Input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="25.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            data-testid="input-donation-amount"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="donor@email.com"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            required
            data-testid="input-donor-email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cause">Support Our Mission</Label>
        <Select onValueChange={setCause} required>
          <SelectTrigger data-testid="select-donation-cause">
            <SelectValue placeholder="Choose what to support" />
          </SelectTrigger>
          <SelectContent>
            {donationCauses.map((cause) => (
              <SelectItem key={cause.value} value={cause.value}>
                <div className="flex items-center gap-2">
                  <cause.icon className="h-4 w-4" />
                  {cause.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="program">Specific Program (Optional)</Label>
        <Input
          id="program"
          placeholder="e.g., UIL Academic State Competition"
          value={targetProgram}
          onChange={(e) => setTargetProgram(e.target.value)}
          data-testid="input-target-program"
        />
      </div>

      <div className="p-4 border rounded-lg">
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
        data-testid="button-submit-donation"
      >
        {isProcessing ? "Processing..." : `Donate $${amount || "0"}`}
      </Button>
    </form>
  );
};

export default function NonprofitDonation() {
  const [clientSecret, setClientSecret] = useState("");
  const [donationAmount, setDonationAmount] = useState(25);

  const createPaymentIntent = async (amount: number) => {
    try {
      const response = await apiRequest("POST", "/api/nonprofit/donation", {
        amount,
        donorEmail: "demo@example.com",
        cause: "general-mission",
      });
      setClientSecret(response.clientSecret);
    } catch (error) {
      console.error("Failed to create payment intent:", error);
    }
  };

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
              Support Champions for Change
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your donation funds educational opportunities for underprivileged youth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <CardHeader>
                <GraduationCap className="h-8 w-8 mx-auto text-green-600" />
                <CardTitle className="text-lg">Academic Competitions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Fund travel and registration for UIL academic competitions</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-8 w-8 mx-auto text-blue-600" />
                <CardTitle className="text-lg">Educational Trips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Support educational field trips and learning experiences</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Trophy className="h-8 w-8 mx-auto text-purple-600" />
                <CardTitle className="text-lg">Equipment & Supplies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Provide necessary educational materials and equipment</p>
              </CardContent>
            </Card>
          </div>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Quick Donation
              </CardTitle>
              <CardDescription>
                Choose an amount to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => {
                      setDonationAmount(amount);
                      createPaymentIntent(amount);
                    }}
                    data-testid={`button-quick-${amount}`}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Custom amount"
                  onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
                  data-testid="input-custom-amount"
                />
                <Button 
                  onClick={() => createPaymentIntent(donationAmount)}
                  data-testid="button-custom-donation"
                >
                  Donate
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Badge variant="secondary" className="text-xs">
                🏆 Nonprofit Rates: 2.2% + $0.30 (vs 2.9% standard)
              </Badge>
              <p className="text-xs text-gray-500 text-center">
                Tax-deductible donation to Champions for Change (EIN: 81-3834471)
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">
            Complete Your Donation
          </h1>
          <Badge variant="secondary" className="mb-4">
            Stripe Nonprofit Rates Active: 2.2% + $0.30
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Support Educational Opportunities
            </CardTitle>
            <CardDescription>
              Your donation helps fund educational trips and academic competitions for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <DonationForm />
            </Elements>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            <p>All donations are tax-deductible. Champions for Change is a 501(c)(3) nonprofit organization.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}