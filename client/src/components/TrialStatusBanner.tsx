import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Heart, Clock, X } from 'lucide-react';
import { useLocation } from 'wouter';
import { useState } from 'react';

interface User {
  id: string;
  email: string;
  subscriptionStatus?: string;
  trialEndDate?: string;
}

export default function TrialStatusBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  if (!user || dismissed) return null;

  if (user.subscriptionStatus !== 'trialing' || !user.trialEndDate) {
    return null;
  }

  const trialEndDate = new Date(user.trialEndDate);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpired = daysRemaining < 0;
  const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 3;

  if (!isExpired && !isExpiringSoon) {
    return null;
  }

  return (
    <Alert className={`${isExpired ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'} relative`}>
      <div className="flex items-center gap-3 pr-8">
        {isExpired ? (
          <Heart className="h-5 w-5 text-orange-600" />
        ) : (
          <Clock className="h-5 w-5 text-blue-600" />
        )}
        <div className="flex-1">
          <AlertDescription className="text-sm">
            {isExpired ? (
              <span>
                Your free trial has ended. <strong>No worries - you still have full access!</strong> If you're finding value in the platform, consider supporting Champions for Change with a donation to help fund educational opportunities for underprivileged students.
              </span>
            ) : (
              <span>
                Your free trial ends in <strong>{daysRemaining} day{daysRemaining !== 1 ? 's' : ''}</strong>. After that, you'll still have full access! Consider supporting our educational mission if you're enjoying the platform.
              </span>
            )}
          </AlertDescription>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => setLocation('/donate')}
            className={isExpired ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}
            data-testid="button-trial-donate"
          >
            <Heart className="h-4 w-4 mr-1" />
            Donate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="px-2"
            data-testid="button-dismiss-trial-banner"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Alert>
  );
}
