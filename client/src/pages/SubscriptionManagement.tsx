import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SubscriptionData {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  interval: string;
  nextBillingDate: string;
  customerPortalUrl?: string;
}

export default function SubscriptionManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cancelReason, setCancelReason] = useState('');

  // Fetch subscription data
  const { data: subscription, isLoading: subLoading, error } = useQuery({
    queryKey: ['/api/subscription'],
    enabled: isAuthenticated,
    retry: false,
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: async (data: { reason?: string; feedback?: string }) => {
      return await apiRequest('POST', '/api/subscription/cancel', data);
    },
    onSuccess: () => {
      toast({
        title: "Subscription Scheduled for Cancellation",
        description: "Your subscription will end at the current billing period. You'll keep access until then.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Unable to cancel subscription. Please contact support.",
        variant: "destructive",
      });
    },
  });

  // Reactivate subscription mutation
  const reactivateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/subscription/reactivate');
    },
    onSuccess: () => {
      toast({
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated and will continue normally.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: "Reactivation Failed", 
        description: error.message || "Unable to reactivate subscription. Please contact support.",
        variant: "destructive",
      });
    },
  });

  // Open customer portal
  const openCustomerPortal = () => {
    if (subscription?.customerPortalUrl) {
      window.open(subscription.customerPortalUrl, '_blank');
    } else {
      toast({
        title: "Portal Unavailable",
        description: "Customer portal is not available. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading subscription details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
              <p className="text-gray-600">Please log in to manage your subscription.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Active Subscription</h2>
              <p className="text-gray-600 mb-4">
                You don't have an active subscription or there was an error loading your subscription details.
              </p>
              <Button onClick={() => window.location.href = '/pricing'}>
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Canceled</Badge>;
      case 'unpaid':
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'tournament-organizer':
        return 'Tournament Organizer ($39/month)';
      case 'business-enterprise':
        return 'Business Enterprise ($149/month)';
      case 'annual-pro':
        return 'Annual Pro ($990/month)';
      default:
        return plan;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-600">Manage your Trantor platform subscription and billing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Current Subscription
            </CardTitle>
            <CardDescription>
              Your active plan and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Plan:</span>
              <span>{getPlanName(subscription.plan)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              {getStatusBadge(subscription.status)}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount:</span>
              <span className="flex items-center">
                <DollarSign className="h-4 w-4" />
                {subscription.amount / 100}/{subscription.interval}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Next Billing:</span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </span>
            </div>
            {subscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center text-yellow-800">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Cancellation Scheduled</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={openCustomerPortal}
              className="flex items-center"
              data-testid="button-customer-portal"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Billing
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(`/api/subscription/invoice`, '_blank')}
              data-testid="button-download-invoice"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
          </CardFooter>
        </Card>

        {/* Subscription Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Subscription Actions
            </CardTitle>
            <CardDescription>
              Manage your subscription settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription.cancelAtPeriodEnd ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center text-blue-800 mb-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Cancellation Scheduled</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
                    You'll keep full access until then.
                  </p>
                </div>
                <Button 
                  onClick={() => reactivateMutation.mutate()}
                  disabled={reactivateMutation.isPending}
                  className="w-full"
                  data-testid="button-reactivate-subscription"
                >
                  {reactivateMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reactivating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Reactivate Subscription
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Need to cancel your subscription? We're sorry to see you go.
                </p>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      data-testid="button-cancel-subscription"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>Are you sure you want to cancel your subscription?</p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>What happens when you cancel:</strong>
                          </p>
                          <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside space-y-1">
                            <li>You'll keep access until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</li>
                            <li>No future charges will be made</li>
                            <li>Your tournaments will remain accessible</li>
                            <li>You can reactivate anytime before the period ends</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Help us improve - why are you canceling? (optional)
                          </label>
                          <select
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          >
                            <option value="">Select a reason</option>
                            <option value="too_expensive">Too expensive</option>
                            <option value="not_using">Not using the features</option>
                            <option value="missing_features">Missing features I need</option>
                            <option value="switching_platforms">Switching to another platform</option>
                            <option value="temporary_pause">Temporary pause</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => cancelMutation.mutate({ reason: cancelReason })}
                        disabled={cancelMutation.isPending}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {cancelMutation.isPending ? 'Canceling...' : 'Yes, Cancel'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Contact our support team if you have questions about your subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h4 className="font-medium mb-1">Email Support</h4>
              <p className="text-sm text-gray-600">support@trantortournaments.org</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Live Chat</h4>
              <p className="text-sm text-gray-600">Available 9 AM - 5 PM CST</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Help Center</h4>
              <p className="text-sm text-gray-600">Browse our knowledge base</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}