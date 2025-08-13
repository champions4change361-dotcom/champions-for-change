import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Zap, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UsageStats {
  planType: string;
  remainingTournaments: number;
  totalAvailable: number;
  usagePercentage: number;
  creditsAvailable: number;
  status: 'plenty' | 'moderate' | 'warning' | 'critical' | 'unlimited';
  recommendedAction?: string;
}

export function AIUsageAwarenessWidget() {
  const { user } = useAuth();
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  const { data: usageStats, isLoading } = useQuery<UsageStats>({
    queryKey: ['/api/usage/stats'],
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const { data: aiReminder } = useQuery<{
    reminderSent: boolean;
    reminderType: string;
    message?: string;
    actionItems?: string[];
  }>({
    queryKey: ['/api/ai/check-usage-reminders', user?.id],
    enabled: !!user?.id,
    refetchInterval: 300000, // Check every 5 minutes
  });

  if (isLoading || !usageStats) {
    return (
      <Card className="w-full max-w-md" data-testid="usage-widget-loading">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (usageStats.status === 'unlimited') {
    return (
      <Card className="w-full max-w-md border-green-200 bg-green-50" data-testid="usage-widget-unlimited">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Star className="h-5 w-5" />
            Unlimited Access
          </CardTitle>
          <CardDescription className="text-green-600">
            Create as many tournaments as you need!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (usageStats.status) {
      case 'critical': return 'red';
      case 'warning': return 'yellow';
      case 'moderate': return 'blue';
      default: return 'green';
    }
  };

  const getStatusIcon = () => {
    switch (usageStats.status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <TrendingUp className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4" data-testid="usage-awareness-widget">
      <Card className={`w-full max-w-md ${
        usageStats.status === 'critical' ? 'border-red-200 bg-red-50' :
        usageStats.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-gray-200 bg-white'
      }`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {getStatusIcon()}
              Tournament Usage
            </span>
            <Badge variant={usageStats.status === 'critical' ? 'destructive' : 'secondary'}>
              {usageStats.totalAvailable} remaining
            </Badge>
          </CardTitle>
          <CardDescription>
            {usageStats.status === 'critical' 
              ? 'Monthly limit reached! Use credits or upgrade.'
              : `${usageStats.remainingTournaments} monthly + ${usageStats.creditsAvailable} credits`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Usage</span>
              <span>{Math.round(usageStats.usagePercentage)}%</span>
            </div>
            <Progress 
              value={usageStats.usagePercentage} 
              className="h-2"
              data-testid="usage-progress-bar"
            />
          </div>

          {usageStats.creditsAvailable > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-900">Available Credits</div>
                <div className="text-sm text-blue-600">Never expire</div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {usageStats.creditsAvailable}
              </Badge>
            </div>
          )}

          {(usageStats.status === 'warning' || usageStats.status === 'critical') && (
            <div className="space-y-2">
              <Button 
                onClick={() => setShowUpgradeOptions(!showUpgradeOptions)}
                variant={usageStats.status === 'critical' ? 'default' : 'outline'}
                className="w-full"
                data-testid="button-show-upgrade-options"
              >
                {usageStats.status === 'critical' ? 'Get More Tournaments' : 'View Options'}
              </Button>
              
              {showUpgradeOptions && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium">Quick Options:</div>
                  <div className="space-y-1 text-sm">
                    <div>• Single Tournament: $10</div>
                    <div>• 5-Pack: $40 (save $10)</div>
                    <div>• 10-Pack: $70 (save $30)</div>
                    <div>• Unlimited Plans: Starting $99/month</div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => window.location.href = '/pricing'}
                    data-testid="button-view-pricing"
                  >
                    View All Options
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Reminder Display */}
      {aiReminder?.reminderSent && (
        <Card className="border-blue-200 bg-blue-50" data-testid="ai-reminder-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-base">
              <Zap className="h-4 w-4" />
              Keystone AI Reminder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 mb-3">
              Hey there! 👋 Quick heads up - you've used 80% of your monthly tournaments. 
              You have 3 remaining. Planning any more events this month?
            </p>
            <div className="space-y-1">
              <div className="text-xs font-medium text-blue-700">Suggested Actions:</div>
              <div className="text-xs text-blue-600 space-y-1">
                <div>• Plan remaining tournaments</div>
                <div>• Consider credit pack for flexibility</div>
                <div>• Explore unlimited plans</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Enhanced Usage Alert Component with Proactive Help
interface UsageAlertProps {
  alert: {
    type: 'info' | 'warning' | 'limit_reached';
    message: string;
    actionSuggested?: string;
  };
  proactiveHelp?: string[];
  onDismiss: () => void;
}

export function UsageAlert({ alert, proactiveHelp, onDismiss }: UsageAlertProps) {
  const getAlertStyling = () => {
    switch (alert.type) {
      case 'limit_reached':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Card className={`${getAlertStyling()}`} data-testid="usage-alert">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium mb-1">{alert.message}</div>
            
            {proactiveHelp && proactiveHelp.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="text-sm font-medium">AI Suggestions:</div>
                {proactiveHelp.map((suggestion, index) => (
                  <div key={index} className="text-sm opacity-90">
                    💡 {suggestion}
                  </div>
                ))}
              </div>
            )}
            
            {alert.actionSuggested && (
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => window.location.href = '/pricing'}
                  data-testid="button-suggested-action"
                >
                  View Options
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="ml-2"
            data-testid="button-dismiss-alert"
          >
            ×
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}