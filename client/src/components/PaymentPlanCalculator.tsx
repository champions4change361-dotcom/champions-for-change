import { useMemo } from "react";
import { format, differenceInDays, addDays, addMonths } from "date-fns";
import { PaymentPlan } from "@shared/schema";

interface PaymentPlanOption {
  id: string;
  name: string;
  type: "monthly" | "quarterly" | "full";
  installmentCount: number;
  firstPaymentAmount: number;
  installmentAmount: number;
  totalAmount: number;
  processingFee: number;
  paymentDates: string[];
  isAvailable: boolean;
  reason?: string;
}

interface PaymentPlanCalculatorProps {
  registrationFee: number;
  tournamentDate: string; // ISO date string
  availablePaymentPlans?: PaymentPlan[];
}

export function usePaymentPlanCalculator({
  registrationFee,
  tournamentDate,
  availablePaymentPlans = []
}: PaymentPlanCalculatorProps) {
  
  const paymentOptions = useMemo(() => {
    const today = new Date();
    const tournamentDay = new Date(tournamentDate);
    const daysUntilTournament = differenceInDays(tournamentDay, today);
    
    const options: PaymentPlanOption[] = [];
    
    // Always include full payment option
    options.push({
      id: "full",
      name: "Pay in Full",
      type: "full",
      installmentCount: 1,
      firstPaymentAmount: registrationFee,
      installmentAmount: 0,
      totalAmount: registrationFee,
      processingFee: 0,
      paymentDates: [format(today, "MM/dd/yyyy")],
      isAvailable: true
    });
    
    // Process each available payment plan
    availablePaymentPlans.forEach(plan => {
      if (!plan.isActive) return;
      
      const cutoffDays = plan.cutoffDaysBeforeTournament || 14;
      const minimumAmount = parseFloat(plan.minimumAmount.toString());
      
      // Check if registration fee meets minimum
      if (registrationFee < minimumAmount) {
        options.push({
          id: plan.id,
          name: plan.planName,
          type: plan.planType as "monthly" | "quarterly",
          installmentCount: plan.installmentCount,
          firstPaymentAmount: 0,
          installmentAmount: 0,
          totalAmount: registrationFee,
          processingFee: 0,
          paymentDates: [],
          isAvailable: false,
          reason: `Minimum registration fee: $${minimumAmount}`
        });
        return;
      }
      
      // Calculate payment dates based on plan type
      const paymentDates: Date[] = [today]; // First payment today
      let nextPaymentDate = new Date(today);
      
      for (let i = 1; i < plan.installmentCount; i++) {
        if (plan.planType === "monthly") {
          nextPaymentDate = addMonths(nextPaymentDate, 1);
        } else if (plan.planType === "quarterly") {
          nextPaymentDate = addMonths(nextPaymentDate, 3);
        } else {
          // Custom - distribute evenly over remaining time
          const daysPerInstallment = Math.floor(daysUntilTournament / plan.installmentCount);
          nextPaymentDate = addDays(today, i * daysPerInstallment);
        }
        paymentDates.push(new Date(nextPaymentDate));
      }
      
      // Check if last payment date is before cutoff
      const lastPaymentDate = paymentDates[paymentDates.length - 1];
      const daysBetweenLastPaymentAndTournament = differenceInDays(tournamentDay, lastPaymentDate);
      
      if (daysBetweenLastPaymentAndTournament < cutoffDays) {
        options.push({
          id: plan.id,
          name: plan.planName,
          type: plan.planType as "monthly" | "quarterly",
          installmentCount: plan.installmentCount,
          firstPaymentAmount: 0,
          installmentAmount: 0,
          totalAmount: registrationFee,
          processingFee: 0,
          paymentDates: [],
          isAvailable: false,
          reason: `Not enough time for ${plan.installmentCount} payments (need ${cutoffDays} days before tournament)`
        });
        return;
      }
      
      // Calculate payment amounts
      const processingFeeRate = parseFloat(plan.processingFeePercentage.toString()) / 100;
      const processingFee = registrationFee * processingFeeRate;
      const totalWithFee = registrationFee + processingFee;
      
      const firstPaymentRate = parseFloat(plan.firstPaymentPercentage.toString()) / 100;
      const firstPaymentAmount = totalWithFee * firstPaymentRate;
      const remainingAmount = totalWithFee - firstPaymentAmount;
      const installmentAmount = remainingAmount / (plan.installmentCount - 1);
      
      options.push({
        id: plan.id,
        name: plan.planName,
        type: plan.planType as "monthly" | "quarterly",
        installmentCount: plan.installmentCount,
        firstPaymentAmount: Math.round(firstPaymentAmount * 100) / 100,
        installmentAmount: Math.round(installmentAmount * 100) / 100,
        totalAmount: Math.round(totalWithFee * 100) / 100,
        processingFee: Math.round(processingFee * 100) / 100,
        paymentDates: paymentDates.map(date => format(date, "MM/dd/yyyy")),
        isAvailable: true
      });
    });
    
    return options;
  }, [registrationFee, tournamentDate, availablePaymentPlans]);
  
  return { paymentOptions };
}

export default function PaymentPlanCalculator({
  registrationFee,
  tournamentDate,
  availablePaymentPlans
}: PaymentPlanCalculatorProps) {
  const { paymentOptions } = usePaymentPlanCalculator({
    registrationFee,
    tournamentDate,
    availablePaymentPlans
  });
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Payment Options</h3>
      
      {paymentOptions.map(option => (
        <div 
          key={option.id} 
          className={`p-4 border rounded-lg ${
            option.isAvailable 
              ? "border-green-200 bg-green-50" 
              : "border-gray-200 bg-gray-50 opacity-60"
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">{option.name}</h4>
            <span className="text-lg font-bold">
              ${option.totalAmount.toFixed(2)}
            </span>
          </div>
          
          {option.isAvailable ? (
            <div className="space-y-2 text-sm text-gray-600">
              {option.type === "full" ? (
                <p>Pay the full amount today</p>
              ) : (
                <>
                  <p>
                    <strong>First payment:</strong> ${option.firstPaymentAmount.toFixed(2)} (today)
                  </p>
                  <p>
                    <strong>Remaining {option.installmentCount - 1} payments:</strong> ${option.installmentAmount.toFixed(2)} each
                  </p>
                  {option.processingFee > 0 && (
                    <p>
                      <strong>Processing fee:</strong> ${option.processingFee.toFixed(2)}
                    </p>
                  )}
                  <div>
                    <strong>Payment schedule:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      {option.paymentDates.map((date, index) => (
                        <li key={index}>
                          {date} - ${index === 0 ? option.firstPaymentAmount.toFixed(2) : option.installmentAmount.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-red-600">{option.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
}