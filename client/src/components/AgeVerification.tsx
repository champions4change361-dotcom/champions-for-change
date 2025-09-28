import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle, CheckCircle, UserCheck } from 'lucide-react';

interface AgeVerificationProps {
  requiredAge?: number;
  onVerified: (dateOfBirth: string) => void;
  onDenied: () => void;
  platform?: string;
  isLoading?: boolean;
}

export function AgeVerification({ 
  requiredAge = 13, 
  onVerified, 
  onDenied,
  platform = "Fantasy Sports Platform",
  isLoading = false
}: AgeVerificationProps) {
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!isAgeConfirmed) {
      setError('Please confirm that you are 13 years or older');
      setIsSubmitting(false);
      return;
    }

    try {
      // For checkbox verification, we generate a synthetic DOB for API compatibility
      // The backend now prioritizes affirmation over DOB parsing
      const ageVerificationDate = new Date(Date.now() - (requiredAge + 5) * 365 * 24 * 60 * 60 * 1000);
      const dateOfBirth = ageVerificationDate.toISOString().split('T')[0];
      
      await onVerified(dateOfBirth);
    } catch (error: any) {
      console.error('Age verification failed:', error);
      setError(error.message || 'Age verification failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <UserCheck className="h-12 w-12 text-blue-600" />
            <Shield className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700">Age Verification</h1>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2 text-lg">
            13+ Platform
          </Badge>
        </div>

        {/* Age Verification Card */}
        <Card className="border-2 border-blue-200 shadow-xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-xl text-blue-700">
              Confirm Your Age to Continue
            </CardTitle>
            <CardDescription className="text-base">
              {platform} requires users to be 13 years or older to comply with COPPA regulations.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Legal Notice */}
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900 text-sm">
                <strong>COPPA Compliance:</strong> We follow federal guidelines to protect users under 13. 
                This simple verification helps us provide age-appropriate experiences.
              </AlertDescription>
            </Alert>

            {/* Simple Age Confirmation Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Checkbox
                  id="age-confirmation"
                  checked={isAgeConfirmed}
                  onCheckedChange={(checked) => setIsAgeConfirmed(checked === true)}
                  className="mt-1"
                  data-testid="age-confirmation-checkbox"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="age-confirmation" 
                    className="text-sm font-medium text-blue-900 cursor-pointer"
                  >
                    I confirm that I am 13 years of age or older
                  </label>
                  <p className="text-xs text-blue-700 mt-1">
                    Required for access to fantasy sports features
                  </p>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting || !isAgeConfirmed}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                data-testid="verify-age-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Continue to Fantasy Sports
                  </>
                )}
              </Button>
            </form>

            {/* Privacy Notice */}
            <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
              <p>
                This confirmation is used only for age verification compliance and is not stored permanently. 
                Platform designed for safe, educational fantasy sports experiences.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Simple age verification • COPPA Compliant • Youth-Friendly Platform</p>
        </div>
      </div>
    </div>
  );
}