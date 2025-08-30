import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Clock, Users, CheckCircle, AlertCircle,
  User, Calendar, Phone, Mail, MapPin, FileText
} from "lucide-react";

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  isRequired: boolean;
  position: number;
  options?: string[];
}

interface RegistrationConfig {
  title: string;
  description: string;
  registrationFee: number;
  maxParticipants: number;
  registrationDeadline: string;
  requiresApproval: boolean;
  formFields: FormField[];
}

interface RegistrationPreviewProps {
  config: RegistrationConfig;
}

export default function RegistrationPreview({ config }: RegistrationPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentParticipants] = useState(Math.floor(Math.random() * (config.maxParticipants * 0.7))); // Demo data

  const updateFormField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
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

          {/* Submit Button */}
          <div className="pt-6 border-t">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
              data-testid="preview-submit-button"
            >
              {config.requiresApproval ? 'Submit for Approval' : 'Register Now'}
              <span className="ml-2">${config.registrationFee || 0}</span>
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