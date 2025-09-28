import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Calendar, Lock, CheckCircle } from 'lucide-react';

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
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  // Server-backed system - no localStorage checks needed

  const calculateAge = (month: number, day: number, year: number): number => {
    const today = new Date();
    const birthDate = new Date(year, month - 1, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validation
    if (!birthMonth || !birthDay || !birthYear) {
      setError('Please enter your complete birth date');
      setIsSubmitting(false);
      return;
    }

    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);
    const year = parseInt(birthYear);

    // Basic validation
    if (month < 1 || month > 12) {
      setError('Please enter a valid month (1-12)');
      setIsSubmitting(false);
      return;
    }

    if (day < 1 || day > 31) {
      setError('Please enter a valid day');
      setIsSubmitting(false);
      return;
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      setError('Please enter a valid birth year');
      setIsSubmitting(false);
      return;
    }

    // Calculate age locally for immediate feedback
    const age = calculateAge(month, day, year);
    
    if (age < requiredAge) {
      setError(`You must be ${requiredAge} years or older to access this platform`);
      setIsSubmitting(false);
      setAttempts(prev => prev + 1);
      
      if (attempts >= 2) {
        onDenied();
        return;
      }
      return;
    }

    // Format date for server
    const birthDate = new Date(year, month - 1, day);
    const dateOfBirth = birthDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    try {
      // Call the server-backed verification
      await onVerified(dateOfBirth);
    } catch (error: any) {
      console.error('Age verification failed:', error);
      setError(error.message || 'Age verification failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Warning Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-12 w-12 text-red-600" />
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold text-red-700">Age Verification Required</h1>
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2 text-lg">
            13+ Platform
          </Badge>
        </div>

        {/* Age Verification Card */}
        <Card className="border-2 border-red-200 shadow-xl">
          <CardHeader className="text-center space-y-3">
            <CardTitle className="text-xl text-red-700">
              Verify Your Age to Continue
            </CardTitle>
            <CardDescription className="text-base">
              {platform} requires all users to be 13 years or older to comply with COPPA regulations.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Legal Notice */}
            <Alert className="border-amber-200 bg-amber-50">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 text-sm">
                <strong>Legal Compliance:</strong> Age verification ensures COPPA compliance for users under 13. 
                Your information is not stored and is only used for verification.
              </AlertDescription>
            </Alert>

            {/* Age Requirements */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Age Requirements
              </h4>
              <div className="space-y-2 text-sm text-red-700">
                <div className="flex justify-between">
                  <span>• Minimum Age:</span>
                  <span className="font-bold">13 Years Old</span>
                </div>
                <div className="flex justify-between">
                  <span>• Age Calculation:</span>
                  <span>Based on Current Date</span>
                </div>
                <div className="flex justify-between">
                  <span>• Verification Period:</span>
                  <span>Valid for 30 Days</span>
                </div>
              </div>
            </div>

            {/* Birth Date Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <Label className="text-base font-semibold text-gray-700">
                  Enter Your Birth Date
                </Label>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="birth-month" className="text-sm">Month</Label>
                  <select
                    id="birth-month"
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    data-testid="birth-month"
                  >
                    <option value="">Month</option>
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="birth-day" className="text-sm">Day</Label>
                  <select
                    id="birth-day"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    data-testid="birth-day"
                  >
                    <option value="">Day</option>
                    {days.map(day => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="birth-year" className="text-sm">Year</Label>
                  <select
                    id="birth-year"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                    data-testid="birth-year"
                  >
                    <option value="">Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                    {attempts >= 1 && (
                      <div className="mt-2 text-sm">
                        Attempts remaining: {3 - attempts - 1}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                disabled={isSubmitting || !birthMonth || !birthDay || !birthYear}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
                data-testid="verify-age-button"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Verifying Age...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Verify Age (13+)
                  </>
                )}
              </Button>
            </form>

            {/* Privacy Notice */}
            <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
              <p>
                Your birth date is used only for age verification and is not stored on our servers. 
                This process complies with federal and state regulations for fantasy sports platforms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Age verification powered by secure local storage • COPPA & State Compliant</p>
        </div>
      </div>
    </div>
  );
}