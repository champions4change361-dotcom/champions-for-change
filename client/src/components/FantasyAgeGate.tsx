import { useState, useEffect } from 'react';
import { AgeVerification } from './AgeVerification';
import { Button } from '@/components/ui/button';
import { Shield, Brain } from 'lucide-react';

interface FantasyAgeGateProps {
  children: React.ReactNode;
  platform?: string;
  requiredAge?: number;
}

export function FantasyAgeGate({ 
  children, 
  platform = "Fantasy Sports Platform",
  requiredAge = 21 
}: FantasyAgeGateProps) {
  const [ageVerified, setAgeVerified] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    // Check if age was previously denied
    const denied = localStorage.getItem('ageVerificationDenied');
    if (denied === 'true') {
      setAccessDenied(true);
    }
  }, []);

  // Show age verification if not verified and not denied
  if (!ageVerified && !accessDenied) {
    return (
      <AgeVerification
        requiredAge={requiredAge}
        platform={platform}
        onVerified={() => setAgeVerified(true)}
        onDenied={() => setAccessDenied(true)}
      />
    );
  }

  // Show access denied page if user is under required age
  if (accessDenied) {
    const IconComponent = platform.includes('Coaching') ? Brain : Shield;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <IconComponent className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-3xl font-bold text-red-700">Access Denied</h1>
          <p className="text-red-600">
            You must be {requiredAge} years or older to access this {platform.toLowerCase()}.
            This requirement helps us comply with legal regulations across all jurisdictions.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Return to Main Site
          </Button>
        </div>
      </div>
    );
  }

  // User is verified, show the fantasy content
  return <>{children}</>;
}