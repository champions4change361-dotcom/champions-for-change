import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, DollarSign, Users, Check, AlertCircle, 
  Clock, Shield, Star, ArrowRight, Receipt, Calculator
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface TeamPaymentInfo {
  teamId: string;
  teamName: string;
  organizationName: string;
  captainName: string;
  paymentMethod: "captain_pays_all" | "individual_payments" | "mixed";
  registrationFee: number;
  feeStructure: "per_player" | "per_team";
  totalPlayers: number;
  paidPlayers: number;
  totalAmount: number;
  paidAmount: number;
  paymentBreakdown: Array<{
    playerId: string;
    playerName: string;
    amount: number;
    paidBy?: string;
    paidAt?: string;
    paymentStatus: "unpaid" | "paid" | "partial";
  }>;
}

interface TeamPaymentFlowProps {
  teamId: string;
  userRole: "captain" | "parent";
  playerId?: string; // Only for parent payments
  onPaymentComplete: (paymentData: any) => void;
}

// Payment form component that uses Stripe Elements
function PaymentForm({ 
  amount, 
  description, 
  onSuccess, 
  onError,
  isProcessing,
  setIsProcessing 
}: {
  amount: number;
  description: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [billingDetails, setBillingDetails] = useState({
    name: "",
    email: "",
    address: {
      line1: "",
      city: "",
      state: "",
      postal_code: "",
      country: "US"
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment intent
      const paymentIntentResponse = await apiRequest("POST", "/api/team-payments/create-intent", {
        amount: Math.round(amount * 100), // Convert to cents
        description,
        billing_details: billingDetails
      });

      const { client_secret } = await paymentIntentResponse.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        }
      });

      if (error) {
        onError(error.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent);
      }
    } catch (error: any) {
      onError(error.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Cardholder Name *</Label>
          <Input
            id="name"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              name: e.target.value
            }))}
            placeholder="John Smith"
            required
            data-testid="input-cardholder-name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              email: e.target.value
            }))}
            placeholder="john@email.com"
            required
            data-testid="input-email"
          />
        </div>
      </div>

      <div>
        <Label>Card Information *</Label>
        <div className="mt-2 p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={billingDetails.address.line1}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              address: { ...prev.address, line1: e.target.value }
            }))}
            placeholder="123 Main St"
            data-testid="input-address"
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={billingDetails.address.city}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              address: { ...prev.address, city: e.target.value }
            }))}
            placeholder="New York"
            data-testid="input-city"
          />
        </div>
        <div>
          <Label htmlFor="postal_code">ZIP Code</Label>
          <Input
            id="postal_code"
            value={billingDetails.address.postal_code}
            onChange={(e) => setBillingDetails(prev => ({
              ...prev,
              address: { ...prev.address, postal_code: e.target.value }
            }))}
            placeholder="10001"
            data-testid="input-zip"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing || !billingDetails.name || !billingDetails.email}
        className="w-full"
        data-testid="button-submit-payment"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function TeamPaymentFlow({ 
  teamId, 
  userRole, 
  playerId, 
  onPaymentComplete 
}: TeamPaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch team payment information
  const { data: teamPayment, isLoading } = useQuery({
    queryKey: ["/api/team-payments", teamId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/team-payments/${teamId}`);
      return await response.json();
    }
  });

  // Calculate payment options based on role and payment method
  const getPaymentOptions = () => {
    if (!teamPayment) return [];

    const options = [];
    
    if (userRole === "captain") {
      if (teamPayment.paymentMethod === "captain_pays_all") {
        options.push({
          id: "full_team",
          title: "Pay for Entire Team",
          description: `Pay ${teamPayment.feeStructure === "per_team" ? "team registration fee" : "for all " + teamPayment.totalPlayers + " players"}`,
          amount: teamPayment.totalAmount - teamPayment.paidAmount,
          icon: Users,
          recommended: true
        });
      } else if (teamPayment.paymentMethod === "mixed") {
        options.push(
          {
            id: "remaining_balance",
            title: "Pay Remaining Balance",
            description: "Pay for any unpaid players",
            amount: teamPayment.totalAmount - teamPayment.paidAmount,
            icon: Calculator,
            recommended: teamPayment.paidAmount > 0
          },
          {
            id: "select_players",
            title: "Pay for Specific Players",
            description: "Choose which players to pay for",
            amount: 0, // Will be calculated based on selection
            icon: Users,
            recommended: false
          }
        );
      }
    } else if (userRole === "parent" && playerId) {
      const playerPayment = teamPayment.paymentBreakdown.find((p: any) => p.playerId === playerId);
      if (playerPayment && playerPayment.paymentStatus === "unpaid") {
        options.push({
          id: "individual_player",
          title: "Pay for Your Player",
          description: `Registration fee for ${playerPayment.playerName}`,
          amount: playerPayment.amount,
          icon: DollarSign,
          recommended: true
        });
      }
    }

    return options;
  };

  const paymentOptions = getPaymentOptions();

  const selectPaymentOption = (optionId: string) => {
    setSelectedPaymentOption(optionId);
    const option = paymentOptions.find(opt => opt.id === optionId);
    
    if (option) {
      if (optionId === "select_players") {
        setCurrentStep(2); // Go to player selection
      } else {
        setPaymentAmount(option.amount);
        setCurrentStep(3); // Go to payment
      }
    }
  };

  const handlePlayerSelection = (playerId: string, selected: boolean) => {
    if (selected) {
      setSelectedPlayers(prev => [...prev, playerId]);
    } else {
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
    }
  };

  const calculateSelectedAmount = () => {
    return selectedPlayers.reduce((total, playerId) => {
      const player = teamPayment?.paymentBreakdown.find((p: any) => p.playerId === playerId);
      return total + (player?.amount || 0);
    }, 0);
  };

  const proceedWithSelectedPlayers = () => {
    setPaymentAmount(calculateSelectedAmount());
    setCurrentStep(3);
  };

  const handlePaymentSuccess = async (paymentIntent: any) => {
    try {
      // Record the payment on the server
      await apiRequest("POST", "/api/team-payments/record", {
        teamId,
        paymentIntentId: paymentIntent.id,
        amount: paymentAmount,
        paidFor: selectedPaymentOption === "individual_player" ? [playerId] : selectedPlayers,
        paymentMethod: selectedPaymentOption
      });

      queryClient.invalidateQueries({ queryKey: ["/api/team-payments", teamId] });
      
      toast({
        title: "Payment Successful!",
        description: `$${paymentAmount.toFixed(2)} payment processed successfully.`,
      });

      setCurrentStep(4); // Success step
      onPaymentComplete({
        paymentIntent,
        amount: paymentAmount,
        teamId
      });

    } catch (error: any) {
      toast({
        title: "Payment Recording Failed",
        description: "Payment succeeded but failed to record. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!teamPayment) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Not Found</h3>
          <p className="text-gray-600">Unable to load team payment information.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <span>Team Payment - {teamPayment.teamName}</span>
          </CardTitle>
          <CardDescription>
            {userRole === "captain" ? "Manage team payments" : "Complete your player registration"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Amount:</span>
                <div className="font-semibold">${teamPayment.totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">Paid Amount:</span>
                <div className="font-semibold text-green-600">${teamPayment.paidAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-gray-600">Remaining:</span>
                <div className="font-semibold text-orange-600">
                  ${(teamPayment.totalAmount - teamPayment.paidAmount).toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Players Paid:</span>
                <div className="font-semibold">{teamPayment.paidPlayers}/{teamPayment.totalPlayers}</div>
              </div>
            </div>
          </div>

          {/* Step 1: Payment Options */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose Payment Option</h3>
              
              {paymentOptions.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">All Payments Complete</h4>
                  <p className="text-gray-600">
                    {userRole === "captain" 
                      ? "All team payments have been processed." 
                      : "Your player registration is fully paid."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentOptions.map((option) => (
                    <div
                      key={option.id}
                      className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors"
                      onClick={() => selectPaymentOption(option.id)}
                      data-testid={`payment-option-${option.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <option.icon className="h-6 w-6 text-blue-600" />
                          <div>
                            <h4 className="font-semibold">{option.title}</h4>
                            {option.recommended && (
                              <Badge className="mt-1" variant="default">
                                <Star className="h-3 w-3 mr-1" />
                                Recommended
                              </Badge>
                            )}
                          </div>
                        </div>
                        {option.amount > 0 && (
                          <div className="text-right">
                            <div className="text-xl font-bold text-blue-600">
                              ${option.amount.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Player Selection (for mixed payments) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Select Players to Pay For</h3>
                <Badge variant="outline">
                  {selectedPlayers.length} selected - ${calculateSelectedAmount().toFixed(2)}
                </Badge>
              </div>

              <div className="space-y-3">
                {teamPayment.paymentBreakdown
                  .filter((player: any) => player.paymentStatus === "unpaid")
                  .map((player: any) => (
                    <div
                      key={player.playerId}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedPlayers.includes(player.playerId)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handlePlayerSelection(
                        player.playerId, 
                        !selectedPlayers.includes(player.playerId)
                      )}
                      data-testid={`player-${player.playerId}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{player.playerName}</h4>
                          <p className="text-sm text-gray-600">Registration Fee</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">${player.amount.toFixed(2)}</span>
                          <input
                            type="checkbox"
                            checked={selectedPlayers.includes(player.playerId)}
                            onChange={() => {}}
                            className="h-4 w-4 text-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  data-testid="button-back-to-options"
                >
                  Back to Options
                </Button>
                <Button
                  onClick={proceedWithSelectedPlayers}
                  disabled={selectedPlayers.length === 0}
                  data-testid="button-proceed-payment"
                >
                  Proceed to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Form */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    ${paymentAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Your payment is processed securely through Stripe. We never store your card information.
                </p>
              </div>

              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={paymentAmount}
                  description={`Team registration - ${teamPayment.teamName}`}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </Elements>

              <Button
                variant="outline"
                onClick={() => setCurrentStep(selectedPaymentOption === "select_players" ? 2 : 1)}
                disabled={isProcessing}
                data-testid="button-back"
              >
                Back
              </Button>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="text-center space-y-4">
              <Check className="h-16 w-16 text-green-600 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-gray-600">
                Your payment of ${paymentAmount.toFixed(2)} has been processed successfully.
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg max-w-md mx-auto">
                <h4 className="font-medium text-green-900 mb-2">What's Next?</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <p>• You'll receive a payment confirmation email</p>
                  <p>• Your team registration is now complete</p>
                  <p>• Watch for tournament updates from your organizer</p>
                </div>
              </div>

              <Button
                onClick={() => onPaymentComplete({ success: true })}
                data-testid="button-continue"
              >
                <Receipt className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}