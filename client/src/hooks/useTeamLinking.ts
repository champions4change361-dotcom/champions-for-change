import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';

export function useTeamLinking() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();

  const linkTeamMutation = useMutation({
    mutationFn: async ({ teamId, linkToken }: { teamId: string; linkToken: string }) => {
      const response = await apiRequest(`/api/teams/${teamId}/link`, 'POST', {
        linkToken: linkToken
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Clear all stored team signup data after successful linking
      sessionStorage.removeItem('pending_team_link');
      localStorage.removeItem('pending_team_signup');
      localStorage.removeItem('team_link_token');
      
      // Invalidate teams cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      
      // Redirect to team dashboard
      if (data.team?.id) {
        setLocation(`/teams/${data.team.id}`);
      }
    },
    onError: (error: any) => {
      console.error('🚨 SECURITY: Team linking failed:', error);
      
      // Clear security-related storage on error to prevent replay attacks
      localStorage.removeItem('team_link_token');
      sessionStorage.removeItem('pending_team_link');
      
      // Check if it's a security error (token expired, invalid, etc.)
      const isSecurityError = error?.message?.includes('token') || 
                              error?.message?.includes('expired') ||
                              error?.message?.includes('invalid') ||
                              error?.message?.includes('mismatch');
      
      if (isSecurityError) {
        console.warn('🚨 SECURITY: Clearing signup data due to security error');
        localStorage.removeItem('pending_team_signup');
      }
      
      // Still try to redirect to return URL if available
      const returnUrl = sessionStorage.getItem('auth_return_url');
      if (returnUrl) {
        sessionStorage.removeItem('auth_return_url');
        setLocation(returnUrl);
      }
    }
  });

  useEffect(() => {
    // Only proceed if user is authenticated and we haven't processed this yet
    if (isAuthenticated && user) {
      const pendingTeamId = sessionStorage.getItem('pending_team_link');
      const linkToken = localStorage.getItem('team_link_token');
      const returnUrl = sessionStorage.getItem('auth_return_url');
      
      if (pendingTeamId && linkToken && !linkTeamMutation.isPending) {
        // SECURITY: Link the team using secure token verification
        console.log('🔒 SECURITY: Initiating secure team linking');
        linkTeamMutation.mutate({ teamId: pendingTeamId, linkToken });
      } else if (pendingTeamId && !linkToken) {
        // SECURITY: Team ID exists but no token - potential security issue
        console.warn('🚨 SECURITY: Pending team ID without link token - clearing data');
        sessionStorage.removeItem('pending_team_link');
        localStorage.removeItem('pending_team_signup');
        
        if (returnUrl) {
          sessionStorage.removeItem('auth_return_url');
          setLocation(returnUrl);
        }
      } else if (returnUrl && !pendingTeamId) {
        // Handle normal auth redirect without team linking
        sessionStorage.removeItem('auth_return_url');
        setLocation(returnUrl);
      }
    }
  }, [isAuthenticated, user, linkTeamMutation]);

  return {
    isLinking: linkTeamMutation.isPending,
    linkingError: linkTeamMutation.error
  };
}