import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, Clock, Users, CheckCircle, AlertCircle,
  User, Calendar, Phone, Mail, MapPin, FileText, Tag, Percent, CreditCard, CalendarDays
} from "lucide-react";
import { usePaymentPlanCalculator } from "./PaymentPlanCalculator";
import { PaymentPlan } from "@shared/schema";

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  isRequired: boolean;
  position: number;
  options?: string[];
}

interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

interface RegistrationConfig {
  title: string;
  description: string;
  registrationFee: number;
  maxParticipants: number;
  registrationDeadline: string;
  requiresApproval: boolean;
  formFields: FormField[];
  discountCodes?: DiscountCode[];
  paymentPlans?: PaymentPlan[];
  tournamentDate?: string;
}

interface RegistrationPreviewProps {
  config: RegistrationConfig;
}

export default function RegistrationPreview({ config }: RegistrationPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentParticipants] = useState(Math.floor(Math.random() * (config.maxParticipants * 0.7))); // Demo data
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [selectedPaymentOption, setSelectedPaymentOption] = useState('full');

  const calculateFinalPrice = () => {
    let price = config.registrationFee || 0;
    
    if (appliedDiscount) {
      if (appliedDiscount.discountType === 'percentage') {
        price = price - (price * (appliedDiscount.discountValue / 100));
      } else {
        price = Math.max(0, price - appliedDiscount.discountValue);
      }
    }
    
    return price;
  };

  // Use tournament date or registration deadline as fallback
  const tournamentDate = config.tournamentDate || config.registrationDeadline;
  
  // Calculate payment options
  const { paymentOptions } = usePaymentPlanCalculator({
    registrationFee: calculateFinalPrice(),
    tournamentDate: tournamentDate,
    availablePaymentPlans: config.paymentPlans || []
  });

  const updateFormField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const applyDiscountCode = () => {
    if (!discountCode.trim()) return;
    
    setDiscountError('');
    const availableCodes = config.discountCodes || [];
    const matchingCode = availableCodes.find(
      code => code.code.toUpperCase() === discountCode.toUpperCase() && code.isActive
    );

    if (!matchingCode) {
      setDiscountError('Invalid or expired discount code');
      return;
    }

    if (matchingCode.maxUses && matchingCode.currentUses >= matchingCode.maxUses) {
      setDiscountError('This discount code has reached its usage limit');
      return;
    }

    setAppliedDiscount(matchingCode);
    setDiscountError('');
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;
    
    const originalPrice = config.registrationFee || 0;
    if (appliedDiscount.discountType === 'percentage') {
      return originalPrice * (appliedDiscount.discountValue / 100);
    } else {
      return Math.min(originalPrice, appliedDiscount.discountValue);
    }
  };

  const formatDeadline = (deadline: string) => {
    if (!deadline) return 'No deadline set';
    return new Date(deadline).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const renderFormField = (field: FormField) => {
    const commonProps = {
      id: field.id,
      key: field.id,
      className: "w-full",
      placeholder: field.placeholder || "",
      required: field.isRequired,
      onChange: (e: any) => updateFormField(field.id, e.target.value),
      value: formData[field.id] || '',
      'data-testid': `preview-field-${field.type}-${field.id}`
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <Input
            {...commonProps}
            type={field.type === 'phone' ? 'tel' : field.type}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <Select value={formData[field.id] || ''} onValueChange={(value) => updateFormField(field.id, value)}>
            <SelectTrigger data-testid={`preview-select-${field.id}`}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => updateFormField(field.id, e.target.value)}
                  className="form-radio"
                  data-testid={`preview-radio-${field.id}-${index}`}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(formData[field.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[field.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    updateFormField(field.id, newValues);
                  }}
                  className="form-checkbox rounded"
                  data-testid={`preview-checkbox-${field.id}-${index}`}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
          />
        );
      
      case 'file':
        return (
          <Input
            {...commonProps}
            type="file"
            onChange={(e: any) => updateFormField(field.id, e.target.files?.[0])}
          />
        );
      
      default:
        return <Input {...commonProps} />;
    }
  };

  // Sort fields by position
  const sortedFields = [...config.formFields].sort((a, b) => a.position - b.position);

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 bg-white min-h-screen">
      {/* Tournament Header */}
      <div className="text-center space-y-4 border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900" data-testid="preview-tournament-title">
          {config.title || 'Tournament Registration'}
        </h1>
        
        {/* Registration Fee */}
        <div className="flex justify-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-2xl font-bold text-green-700" data-testid="preview-registration-fee">
              ${config.registrationFee || 0}
            </span>
            <span className="text-green-600">registration fee</span>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {currentParticipants}/{config.maxParticipants} registered
            </span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Deadline: {formatDeadline(config.registrationDeadline)}</span>
          </div>
          {config.requiresApproval && (
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>Approval required</span>
            </div>
          )}
        </div>
      </div>

      {/* Tournament Description */}
      {config.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About This Tournament</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed" data-testid="preview-tournament-description">
              {config.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registration Information</CardTitle>
          <p className="text-sm text-gray-600">
            Please fill out all required fields marked with <Badge variant="secondary" className="text-xs">Required</Badge>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                <div className="flex items-center space-x-2">
                  <span>{field.label}</span>
                  {field.isRequired && (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  )}
                </div>
              </label>
              {renderFormField(field)}
            </div>
          ))}

          {/* Discount Code Section */}
          <div className="pt-6 border-t space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Summary</h3>
              
              {/* Price Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registration Fee</span>
                  <span className="font-medium">${(config.registrationFee || 0).toFixed(2)}</span>
                </div>
                
                {appliedDiscount && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center space-x-2">
                      <Tag className="h-4 w-4" />
                      <span>Discount ({appliedDiscount.code})</span>
                    </span>
                    <span className="font-medium">-${getDiscountAmount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-green-600">${calculateFinalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Discount Code Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Have a discount code?
              </label>
              
              {!appliedDiscount ? (
                <div className="flex space-x-2">
                  <Input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Enter discount code"
                    className="uppercase"
                    data-testid="input-discount-code-checkout"
                  />
                  <Button 
                    variant="outline"
                    onClick={applyDiscountCode}
                    disabled={!discountCode.trim()}
                    data-testid="button-apply-discount"
                  >
                    Apply
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      {appliedDiscount.code} applied
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {appliedDiscount.discountType === 'percentage' 
                        ? `${appliedDiscount.discountValue}% off`
                        : `$${appliedDiscount.discountValue} off`
                      }
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={removeDiscount}
                    className="text-gray-500 hover:text-gray-700"
                    data-testid="button-remove-discount"
                  >
                    Remove
                  </Button>
                </div>
              )}
              
              {discountError && (
                <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{discountError}</span>
                </p>
              )}
            </div>

            {/* Payment Plan Options */}
            {paymentOptions.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <CreditCard className="inline h-4 w-4 mr-2" />
                  Payment Options
                </label>
                
                <RadioGroup 
                  value={selectedPaymentOption} 
                  onValueChange={setSelectedPaymentOption}
                  className="space-y-3"
                >
                  {paymentOptions.map((option) => (
                    <div 
                      key={option.id}
                      className={`border rounded-lg p-4 ${
                        !option.isAvailable 
                          ? 'border-gray-200 bg-gray-50 opacity-60' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem 
                          value={option.id} 
                          id={option.id}
                          disabled={!option.isAvailable}
                          data-testid={`radio-payment-option-${option.id}`}
                        />
                        <div className="flex-1">
                          <Label 
                            htmlFor={option.id} 
                            className={`font-medium ${!option.isAvailable ? 'text-gray-500' : 'text-gray-900'}`}
                          >
                            {option.name}
                          </Label>
                          
                          {option.isAvailable ? (
                            <div className="mt-2 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Amount:</span>
                                <span className="font-semibold">${option.totalAmount.toFixed(2)}</span>
                              </div>
                              
                              {option.type !== "full" && (
                                <>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Due Today:</span>
                                    <span>${option.firstPaymentAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Remaining ({option.installmentCount - 1} payments):</span>
                                    <span>${option.installmentAmount.toFixed(2)} each</span>
                                  </div>
                                  {option.processingFee > 0 && (
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">Processing Fee:</span>
                                      <span>${option.processingFee.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                    <CalendarDays className="inline h-3 w-3 mr-1" />
                                    <strong>Payment Schedule:</strong>
                                    <ul className="mt-1 space-y-1">
                                      {option.paymentDates.slice(0, 3).map((date, index) => (
                                        <li key={index}>
                                          {date}: ${index === 0 ? option.firstPaymentAmount.toFixed(2) : option.installmentAmount.toFixed(2)}
                                        </li>
                                      ))}
                                      {option.paymentDates.length > 3 && (
                                        <li className="text-gray-500">+ {option.paymentDates.length - 3} more payments</li>
                                      )}
                                    </ul>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-red-600 mt-1">{option.reason}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              data-testid="preview-submit-button"
            >
              {config.requiresApproval ? 'Submit for Approval' : 'Register Now'}
              <span className="ml-2">
                {(() => {
                  const selectedOption = paymentOptions.find(opt => opt.id === selectedPaymentOption);
                  if (!selectedOption || selectedOption.type === 'full') {
                    return `$${calculateFinalPrice().toFixed(2)}`;
                  }
                  return `$${selectedOption.firstPaymentAmount.toFixed(2)} today`;
                })()}
              </span>
            </Button>
            
            {config.requiresApproval && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Your registration will be reviewed and you'll receive a confirmation email within 24 hours.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>Secure registration powered by Champions for Change</p>
        <p>Questions? Contact the tournament organizer</p>
      </div>
    </div>
  );
}