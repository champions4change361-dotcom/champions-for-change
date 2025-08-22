import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Zap, Crown, Star } from 'lucide-react';
import { Link } from 'wouter';
import { useTournamentAccess } from '@/hooks/useTournamentAccess';

interface TournamentAccessGateProps {
  feature: string;
  requiredFeature: keyof ReturnType<typeof useTournamentAccess>['limits'];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TournamentAccessGate({ 
  feature, 
  requiredFeature, 
  children, 
  fallback 
}: TournamentAccessGateProps) {
  const { limits, getUpgradeMessage, userPlan, isAuthenticated } = useTournamentAccess();

  // Check if feature is enabled
  const hasAccess = limits[requiredFeature];

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Lock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">Sign In Required</h3>
          <p className="text-gray-600 mb-4">
            {feature} requires an account to access
          </p>
          <Link href="/api/login">
            <Button>Sign In to Continue</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Crown className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-2">Upgrade Required</h3>
          <p className="text-gray-600 mb-4">
            {feature} is not available with your current {userPlan.replace('-', ' ')} plan
          </p>
          
          <Alert className="mb-4">
            <Zap className="h-4 w-4" />
            <AlertDescription>
              {getUpgradeMessage(feature)}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Link href="/pricing">
              <Button className="w-full">
                <Star className="h-4 w-4 mr-2" />
                View Upgrade Options
              </Button>
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Available in Tournament Organizer plan and above</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

interface FeatureLimitGateProps {
  feature: string;
  currentCount: number;
  checkLimit: (count: number) => boolean;
  children: React.ReactNode;
}

export function FeatureLimitGate({ 
  feature, 
  currentCount, 
  checkLimit, 
  children 
}: FeatureLimitGateProps) {
  const { getUpgradeMessage, userPlan } = useTournamentAccess();

  if (!checkLimit(currentCount)) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Lock className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <h3 className="font-semibold text-lg mb-2">Limit Reached</h3>
          <p className="text-gray-600 mb-4">
            You've reached the maximum number of {feature} for your {userPlan.replace('-', ' ')} plan
          </p>
          
          <Alert className="mb-4">
            <Zap className="h-4 w-4" />
            <AlertDescription>
              {getUpgradeMessage(`more ${feature}`)}
            </AlertDescription>
          </Alert>
          
          <Link href="/pricing">
            <Button className="w-full">
              <Star className="h-4 w-4 mr-2" />
              Upgrade for More {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

export default TournamentAccessGate;