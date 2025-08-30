import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, CreditCard, Calendar, DollarSign } from "lucide-react";
import { PaymentPlan } from "@shared/schema";

interface PaymentPlanManagerProps {
  tournamentId: string;
  tournamentDate: string;
  onPaymentPlansChange?: (plans: PaymentPlan[]) => void;
}

export default function PaymentPlanManager({
  tournamentId,
  tournamentDate,
  onPaymentPlansChange
}: PaymentPlanManagerProps) {
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([
    {
      id: "1",
      tournamentId,
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
      tournamentId,
      planName: "Quarterly Plan",
      planType: "quarterly",
      minimumAmount: "150",
      installmentCount: 2,
      firstPaymentPercentage: "60.00",
      processingFeePercentage: "3.00",
      cutoffDaysBeforeTournament: 21,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  const addPaymentPlan = () => {
    const newPlan: PaymentPlan = {
      id: `new-${Date.now()}`,
      tournamentId,
      planName: "New Payment Plan",
      planType: "monthly",
      minimumAmount: "50",
      installmentCount: 2,
      firstPaymentPercentage: "50.00",
      processingFeePercentage: "2.50",
      cutoffDaysBeforeTournament: 14,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedPlans = [...paymentPlans, newPlan];
    setPaymentPlans(updatedPlans);
    onPaymentPlansChange?.(updatedPlans);
  };

  const updatePaymentPlan = (id: string, updates: Partial<PaymentPlan>) => {
    const updatedPlans = paymentPlans.map(plan =>
      plan.id === id ? { ...plan, ...updates, updatedAt: new Date() } : plan
    );
    setPaymentPlans(updatedPlans);
    onPaymentPlansChange?.(updatedPlans);
  };

  const removePaymentPlan = (id: string) => {
    const updatedPlans = paymentPlans.filter(plan => plan.id !== id);
    setPaymentPlans(updatedPlans);
    onPaymentPlansChange?.(updatedPlans);
  };

  const togglePlanStatus = (id: string) => {
    updatePaymentPlan(id, { 
      isActive: !paymentPlans.find(p => p.id === id)?.isActive 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Plan Management</h2>
          <p className="text-gray-600">
            Configure payment plans for your tournament registration
          </p>
        </div>
        <Button onClick={addPaymentPlan} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Payment Plan</span>
        </Button>
      </div>

      <div className="grid gap-6">
        {paymentPlans.map((plan, index) => (
          <Card key={plan.id} className={`${!plan.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <Input
                  value={plan.planName}
                  onChange={(e) => updatePaymentPlan(plan.id, { planName: e.target.value })}
                  className="font-semibold border-none p-0 h-auto bg-transparent"
                  data-testid={`input-plan-name-${index}`}
                />
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={plan.isActive}
                  onCheckedChange={() => togglePlanStatus(plan.id)}
                  data-testid={`switch-plan-active-${index}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePaymentPlan(plan.id)}
                  className="text-red-600 hover:text-red-700"
                  data-testid={`button-remove-plan-${index}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Plan Type</span>
                  </Label>
                  <Select
                    value={plan.planType}
                    onValueChange={(value: "monthly" | "quarterly" | "custom") =>
                      updatePaymentPlan(plan.id, { planType: value })
                    }
                  >
                    <SelectTrigger data-testid={`select-plan-type-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Number of Payments</Label>
                  <Input
                    type="number"
                    min="2"
                    max="12"
                    value={plan.installmentCount}
                    onChange={(e) => updatePaymentPlan(plan.id, { 
                      installmentCount: parseInt(e.target.value) 
                    })}
                    data-testid={`input-installment-count-${index}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Minimum Amount</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={plan.minimumAmount}
                    onChange={(e) => updatePaymentPlan(plan.id, { 
                      minimumAmount: e.target.value 
                    })}
                    placeholder="50.00"
                    data-testid={`input-minimum-amount-${index}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>First Payment %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={plan.firstPaymentPercentage}
                    onChange={(e) => updatePaymentPlan(plan.id, { 
                      firstPaymentPercentage: e.target.value 
                    })}
                    placeholder="50.00"
                    data-testid={`input-first-payment-percentage-${index}`}
                  />
                  <p className="text-xs text-gray-500">Percentage due upfront</p>
                </div>

                <div className="space-y-2">
                  <Label>Processing Fee %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={plan.processingFeePercentage}
                    onChange={(e) => updatePaymentPlan(plan.id, { 
                      processingFeePercentage: e.target.value 
                    })}
                    placeholder="2.50"
                    data-testid={`input-processing-fee-${index}`}
                  />
                  <p className="text-xs text-gray-500">Fee for payment plan service</p>
                </div>

                <div className="space-y-2">
                  <Label>Cutoff Days Before Tournament</Label>
                  <Input
                    type="number"
                    min="1"
                    max="90"
                    value={plan.cutoffDaysBeforeTournament}
                    onChange={(e) => updatePaymentPlan(plan.id, { 
                      cutoffDaysBeforeTournament: parseInt(e.target.value) 
                    })}
                    placeholder="14"
                    data-testid={`input-cutoff-days-${index}`}
                  />
                  <p className="text-xs text-gray-500">Days before tournament to stop payment plans</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Plan Summary</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Minimum registration fee: ${plan.minimumAmount}</p>
                  <p>• {plan.installmentCount} total payments ({plan.planType})</p>
                  <p>• {plan.firstPaymentPercentage}% due upfront, remaining split over {plan.installmentCount - 1} payments</p>
                  <p>• {plan.processingFeePercentage}% processing fee added to total</p>
                  <p>• Payment plans stop {plan.cutoffDaysBeforeTournament} days before tournament</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {paymentPlans.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Plans</h3>
              <p className="text-gray-600 mb-4">
                Add payment plans to give participants flexible payment options
              </p>
              <Button onClick={addPaymentPlan}>Create Your First Payment Plan</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}