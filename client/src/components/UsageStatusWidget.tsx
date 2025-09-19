import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  AlertTriangle, 
  CreditCard, 
  Zap, 
  TrendingUp,
  Calendar,
  Star
} from 'lucide-react';
import { TOURNAMENT_CREDIT_PACKAGES } from '@/lib/usageLimits';

interface UsageStatusProps {
  user: {
    subscriptionPlan: string;
    monthlyTournamentLimit: number;
    currentMonthTournaments: number;
    tournamentCredits: number;
  };
  onPurchaseCredits?: (packageId: string) => void;
  onUpgrade?: () => void;
}

export function UsageStatusWidget({ user, onPurchaseCredits, onUpgrade }: UsageStatusProps) {
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  
  const remainingTournaments = user.monthlyTournamentLimit - user.currentMonthTournaments;
  const usagePercentage = (user.currentMonthTournaments / user.monthlyTournamentLimit) * 100;
  const totalAvailable = Math.max(0, remainingTournaments) + user.tournamentCredits;
  
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = remainingTournaments <= 0 && user.tournamentCredits <= 0;
  const isUnlimited = !['starter', 'free'].includes(user.subscriptionPlan);

  return (
    <Card className={`${isNearLimit && !isUnlimited ? 'border-yellow-200 bg-yellow-50' : ''} ${isAtLimit ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-600" />
          Tournament Usage
          {user.subscriptionPlan === 'free' && (
            <Badge variant="outline" className="text-xs">Free Plan</Badge>
          )}
          {user.subscriptionPlan === 'starter' && (
            <Badge variant="outline" className="text-xs">Starter Plan</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isUnlimited
            ? 'Unlimited tournaments included'
            : `${user.monthlyTournamentLimit} tournaments per month included`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isUnlimited && (
          <>
            {/* Monthly Usage Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Monthly Usage</span>
                <span>{user.currentMonthTournaments}/{user.monthlyTournamentLimit}</span>
              </div>
              <Progress 
                value={Math.min(usagePercentage, 100)} 
                className={`h-2 ${isNearLimit ? 'bg-yellow-200' : ''}`}
              />
            </div>
            
            {/* Credits Available */}
            {user.tournamentCredits > 0 && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <Zap className="h-4 w-4" />
                  <span className="font-semibold">Extra Credits: {user.tournamentCredits}</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  These credits never expire and can be used anytime
                </p>
              </div>
            )}
            
            {/* Status Alerts */}
            {isAtLimit && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Tournament limit reached!</strong> Upgrade your plan or purchase additional tournaments to continue.
                </AlertDescription>
              </Alert>
            )}
            
            {isNearLimit && !isAtLimit && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Almost at your limit!</strong> You have {totalAvailable} tournaments remaining this month.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Upgrade Options */}
            {(isNearLimit || isAtLimit) && (
              <div className="space-y-3">
                <Button 
                  onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                  variant="outline" 
                  className="w-full"
                  data-testid="button-view-upgrade-options"
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Upgrade Options
                </Button>
                
                {showUpgradeOptions && (
                  <UpgradeOptionsWidget 
                    onPurchaseCredits={onPurchaseCredits}
                    onUpgrade={onUpgrade}
                  />
                )}
              </div>
            )}
          </>
        )}
        
        {/* Unlimited Plan Status */}
        {isUnlimited && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <Star className="h-4 w-4" />
              <span className="font-semibold">Unlimited Tournaments</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Create as many tournaments as you need!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface UpgradeOptionsProps {
  onPurchaseCredits?: (packageId: string) => void;
  onUpgrade?: () => void;
}

function UpgradeOptionsWidget({ onPurchaseCredits, onUpgrade }: UpgradeOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <h4 className="font-semibold text-gray-900 mb-3">Upgrade Options</h4>
        
        {/* Pay-per-Tournament */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {Object.values(TOURNAMENT_CREDIT_PACKAGES).map((pkg) => (
            <Card key={pkg.id} className={`${pkg.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-semibold text-sm">{pkg.name}</h5>
                    <p className="text-xs text-gray-600">{pkg.description}</p>
                  </div>
                  {pkg.popular && (
                    <Badge className="bg-blue-600 text-white text-xs">Popular</Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-lg font-bold">${pkg.price}</span>
                    <span className="text-xs text-gray-600 ml-1">
                      (${pkg.pricePerTournament}/tournament)
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => onPurchaseCredits?.(pkg.id)}
                    data-testid={`button-buy-credits-${pkg.id}`}
                  >
                    <CreditCard className="mr-1 h-3 w-3" />
                    Buy
                  </Button>
                </div>
                
                {pkg.savings && (
                  <p className="text-xs text-green-600 mt-1">Save ${pkg.savings}!</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Monthly Subscription */}
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-semibold text-green-900">Unlimited Plan</h5>
                <p className="text-sm text-green-800">Never worry about limits again</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-900">$99/month</div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 mt-2"
                  onClick={onUpgrade}
                  data-testid="button-upgrade-unlimited"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}