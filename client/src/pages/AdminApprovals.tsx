import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, User, Building, DollarSign, Mail, Phone } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organizationName: string;
  organizationType: string;
  subscriptionPlan: string;
  paymentMethod: string;
  pendingCheckAmount?: string;
  accountStatus: string;
  description: string;
  sportsInvolved: string[];
  createdAt: string;
}

export default function AdminApprovals() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending users
  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ['/api/admin/pending-users'],
    retry: false,
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('POST', `/api/admin/approve-user/${userId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Approved",
        description: "Account has been activated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve user account.",
        variant: "destructive",
      });
    },
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest('POST', `/api/admin/reject-user/${userId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "User Rejected",
        description: "Account has been rejected and notified.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject user account.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  const users = (pendingUsers as any)?.users || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 py-8">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Clock className="h-8 w-8 text-amber-600" />
            Pending Approvals
          </h1>
          <p className="text-slate-600">Review and approve user registrations with check payments</p>
        </div>

        {users.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No pending approvals at this time. All registrations are up to date!
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-6">
            {users.map((user: PendingUser) => (
              <Card key={user.id} className="border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl">
                          {user.firstName} {user.lastName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {user.organizationName} ({user.organizationType})
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      Pending Check Payment
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-700">Contact Information</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline">
                            {user.email}
                          </a>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <a href={`tel:${user.phone}`} className="text-blue-600 hover:underline">
                              {user.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-slate-700">Payment Details</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>Plan: {user.subscriptionPlan}</span>
                        </div>
                        {user.pendingCheckAmount && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Amount: ${user.pendingCheckAmount}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-600">
                          Payment Method: {user.paymentMethod}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-700">Organization Details</h4>
                    <p className="text-sm text-gray-700">{user.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {user.sportsInvolved?.map((sport) => (
                        <Badge key={sport} variant="outline" className="text-xs">
                          {sport}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    Registered: {new Date(user.createdAt).toLocaleString()}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      data-testid={`button-approve-${user.id}`}
                    >
                      <CheckCircle className="h-4 w-4" />
                      {approveMutation.isPending ? 'Approving...' : 'Approve Account'}
                    </Button>
                    
                    <Button
                      onClick={() => rejectMutation.mutate(user.id)}
                      disabled={rejectMutation.isPending}
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2"
                      data-testid={`button-reject-${user.id}`}
                    >
                      <XCircle className="h-4 w-4" />
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}