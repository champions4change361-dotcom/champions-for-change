import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RegistrationPreview from "@/components/RegistrationPreview";
import DiscountCodeManager from "@/components/DiscountCodeManager";
import PaymentPlanManager from "@/components/PaymentPlanManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Settings, Tag, CreditCard } from "lucide-react";
import { PaymentPlan } from "@shared/schema";

export default function DiscountDemo() {
  const [discountCodes, setDiscountCodes] = useState([
    {
      id: "1",
      code: "EARLY2024", 
      description: "Early bird discount",
      discountType: "percentage" as const,
      discountValue: 15,
      maxUses: 50,
      currentUses: 23,
      isActive: true
    },
    {
      id: "2", 
      code: "TEAM25",
      description: "Team registration discount",
      discountType: "fixed_amount" as const,
      discountValue: 25,
      maxUses: undefined,
      currentUses: 8,
      isActive: true
    }
  ]);

  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([
    {
      id: "1",
      tournamentId: "demo-tournament",
      planName: "Monthly Payment Plan",
      planType: "monthly",
      minimumAmount: "75",
      installmentCount: 3,
      firstPaymentPercentage: "50.00",
      processingFeePercentage: "2.50",
      cutoffDaysBeforeTournament: 14,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      tournamentId: "demo-tournament", 
      planName: "Quarterly Plan (2 Payments)",
      planType: "quarterly",
      minimumAmount: "100",
      installmentCount: 2,
      firstPaymentPercentage: "60.00",
      processingFeePercentage: "3.00",
      cutoffDaysBeforeTournament: 21,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const sampleRegistrationConfig = {
    title: "Hoops for History Capital Classic 12u",
    description: "Join us for an exciting basketball tournament supporting youth education. All proceeds go toward funding educational trips for underprivileged students. This tournament features competitive 12U divisions with professional referees and championship trophies.",
    registrationFee: 150,
    maxParticipants: 32,
    registrationDeadline: "2024-09-15T23:59",
    tournamentDate: "2024-10-15T09:00", // Tournament is in October
    requiresApproval: false,
    formFields: [
      {
        id: "athlete_name",
        type: "text" as const,
        label: "Athlete Name",
        placeholder: "Enter athlete's full name",
        isRequired: true,
        position: 1
      },
      {
        id: "date_of_birth",
        type: "date" as const,
        label: "Date of Birth",
        placeholder: "",
        isRequired: true,
        position: 2
      },
      {
        id: "parent_name", 
        type: "text" as const,
        label: "Parent/Guardian Name",
        placeholder: "Enter parent or guardian name",
        isRequired: true,
        position: 3
      },
      {
        id: "contact_phone",
        type: "phone" as const,
        label: "Contact Phone",
        placeholder: "(555) 123-4567",
        isRequired: true,
        position: 4
      },
      {
        id: "email",
        type: "email" as const,
        label: "Email Address", 
        placeholder: "parent@email.com",
        isRequired: true,
        position: 5
      },
      {
        id: "address",
        type: "textarea" as const,
        label: "Home Address",
        placeholder: "Street, City, State, ZIP",
        isRequired: true,
        position: 6
      },
      {
        id: "jersey_size",
        type: "select" as const,
        label: "Jersey Size",
        placeholder: "Select size",
        isRequired: true,
        position: 7,
        options: ["Youth Small", "Youth Medium", "Youth Large", "Adult Small", "Adult Medium", "Adult Large"]
      },
      {
        id: "emergency_contact",
        type: "text" as const,
        label: "Emergency Contact",
        placeholder: "Name and phone number",
        isRequired: true,
        position: 8
      }
    ],
    discountCodes: discountCodes,
    paymentPlans: paymentPlans
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Registration System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how tournament organizers can create discount codes and payment plans, and how participants use them during registration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Organizer View */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Tournament Organizer View</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="discounts" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="discounts" className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Discounts</span>
                  </TabsTrigger>
                  <TabsTrigger value="payment-plans" className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Payment Plans</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Stats</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="discounts" className="mt-6">
                  <DiscountCodeManager
                    tournamentId="demo-tournament"
                    onDiscountCodesChange={setDiscountCodes}
                  />
                </TabsContent>
                
                <TabsContent value="payment-plans" className="mt-6">
                  <div className="max-h-[600px] overflow-y-auto">
                    <PaymentPlanManager
                      tournamentId="demo-tournament"
                      tournamentDate="2024-10-15T09:00"
                      onPaymentPlansChange={setPaymentPlans}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="stats" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Active Discount Codes</h3>
                      <div className="space-y-2">
                        {discountCodes.map((code) => (
                          <div key={code.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="font-mono">
                                {code.code}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {code.discountType === 'percentage' 
                                  ? `${code.discountValue}% off`
                                  : `$${code.discountValue} off`
                                }
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {code.maxUses 
                                ? `${code.currentUses}/${code.maxUses} used`
                                : `${code.currentUses} used`
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Active Payment Plans</h3>
                      <div className="space-y-2">
                        {paymentPlans.map((plan) => (
                          <div key={plan.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className="font-mono">
                                {plan.planName}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {plan.installmentCount} payments, {plan.firstPaymentPercentage}% upfront
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Min: ${plan.minimumAmount}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Participant View */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Participant Registration View</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[600px] overflow-y-auto border rounded-lg">
                <RegistrationPreview config={sampleRegistrationConfig} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Try It Out!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">For Tournament Organizers:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Create discount codes with custom names</li>
                  <li>• Choose percentage (15% off) or fixed amount ($25 off)</li>
                  <li>• Set usage limits and expiration dates</li>
                  <li>• Configure payment plans (monthly/quarterly)</li>
                  <li>• Set minimum amounts and processing fees</li>
                  <li>• Control cutoff dates before tournaments</li>
                  <li>• Track usage statistics for both features</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">For Participants:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Apply discount codes: <Badge variant="outline" className="mx-1">EARLY2024</Badge> or <Badge variant="outline" className="mx-1">TEAM25</Badge></li>
                  <li>• Choose payment plans (monthly/quarterly options)</li>
                  <li>• See live price calculations with discounts</li>
                  <li>• View payment schedules and processing fees</li>
                  <li>• See "due today" vs. total amounts</li>
                  <li>• Jersey Watch-style payment flexibility</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}