import { useState } from 'react';
import { useFantasyAuth } from '@/hooks/useFantasyAuth';
import { AgeVerification } from './AgeVerification';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Brain, Loader2, FileText, CheckCircle } from 'lucide-react';

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
  const { 
    mainUser,
    isFantasyAuthenticated,
    canActivateFantasy,
    isAgeVerified,
    hasTOSAccepted,
    isLoading,
    verifyAge,
    acceptTOS,
    isVerifyingAge,
    isAcceptingTOS,
    needsMigration,
    legacyData,
    attemptLegacyMigration,
    clearLegacyData
  } = useFantasyAuth();
  
  const [accessDenied, setAccessDenied] = useState(false);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is fully fantasy authenticated, show content
  if (isFantasyAuthenticated) {
    return <>{children}</>;
  }

  // If no main user is logged in, require main authentication first
  if (!mainUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <Shield className="h-16 w-16 text-yellow-600 mx-auto" />
          <h1 className="text-3xl font-bold text-yellow-700">Authentication Required</h1>
          <p className="text-yellow-600">
            Please log in to your Champions for Change account to access {platform.toLowerCase()}.
          </p>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  // Check for legacy data migration
  if (needsMigration && !accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              We found your previous fantasy preferences. Let's upgrade your account to our new secure system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">What's New:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✅ Unified account - No separate fantasy login needed</li>
                <li>✅ Enhanced security - Server-backed age verification</li>
                <li>✅ Better experience - Seamless access to all features</li>
              </ul>
            </div>
            
            {legacyData.legacyAgeVerified && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ Your previous age verification found - we can migrate this automatically!
                </p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button 
                onClick={() => attemptLegacyMigration()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid="button-migrate-legacy"
              >
                Upgrade My Account
              </Button>
              <Button 
                variant="outline"
                onClick={() => clearLegacyData()}
                className="flex-1"
                data-testid="button-start-fresh"
              >
                Start Fresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Progressive activation flow for authenticated users
  if (canActivateFantasy) {
    // Step 1: Age verification
    if (!isAgeVerified && !accessDenied) {
      return (
        <AgeVerification
          requiredAge={requiredAge}
          platform={platform}
          onVerified={(dateOfBirth) => {
            verifyAge(dateOfBirth).catch(() => setAccessDenied(true));
          }}
          onDenied={() => setAccessDenied(true)}
          isLoading={isVerifyingAge}
        />
      );
    }

    // Step 2: TOS acceptance (after age verification)
    if (isAgeVerified && !hasTOSAccepted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
              <CardDescription>
                Please review and accept our terms of service to access {platform.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm">
                <h3 className="font-semibold mb-2">Fantasy Sports Terms of Service</h3>
                <p className="mb-2">By accessing this fantasy sports platform, you agree to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use the platform for entertainment purposes only</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Provide accurate information about yourself</li>
                  <li>Not engage in fraudulent or illegal activities</li>
                  <li>Respect other users and maintain fair play</li>
                </ul>
                <p className="mt-4 text-xs text-gray-600">
                  This is a non-profit educational platform operated by Champions for Change (501c3).
                  No monetary prizes are awarded - this platform is for educational and entertainment purposes only.
                </p>
              </div>
              <Button 
                onClick={() => acceptTOS()}
                disabled={isAcceptingTOS}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-accept-tos"
              >
                {isAcceptingTOS ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Terms & Continue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
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