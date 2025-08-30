import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RegistrationPreview from "@/components/RegistrationPreview";
import DiscountCodeManager from "@/components/DiscountCodeManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Settings, Tag } from "lucide-react";

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

  const sampleRegistrationConfig = {
    title: "Hoops for History Capital Classic 12u",
    description: "Join us for an exciting basketball tournament supporting youth education. All proceeds go toward funding educational trips for underprivileged students. This tournament features competitive 12U divisions with professional referees and championship trophies.",
    registrationFee: 150,
    maxParticipants: 32,
    registrationDeadline: "2024-09-15T23:59",
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
    discountCodes: discountCodes
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Discount Code System Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how tournament organizers can create discount codes and how participants use them during registration.
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="discounts" className="flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Discount Codes</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Usage Stats</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="discounts" className="mt-6">
                  <DiscountCodeManager
                    tournamentId="demo-tournament"
                    onDiscountCodesChange={setDiscountCodes}
                  />
                </TabsContent>
                
                <TabsContent value="stats" className="mt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Active Discount Codes</h3>
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
                  <li>• Create new discount codes with custom names</li>
                  <li>• Choose percentage (15% off) or fixed amount ($25 off)</li>
                  <li>• Set usage limits and expiration dates</li>
                  <li>• Enable/disable codes as needed</li>
                  <li>• Track usage statistics</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">For Participants:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Enter discount codes at checkout</li>
                  <li>• See live price calculations</li>
                  <li>• Try codes: <Badge variant="outline" className="mx-1">EARLY2024</Badge> or <Badge variant="outline" className="mx-1">TEAM25</Badge></li>
                  <li>• View applied discounts in payment summary</li>
                  <li>• Remove and reapply different codes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}