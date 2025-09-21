import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface FantasyProfile {
  id: string;
  userId: string;
  status: string;
  ageVerifiedAt?: string;
  ageVerificationExpiresAt?: string;
  tosAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FantasyAuthData {
  success: boolean;
  profile?: FantasyProfile;
  hasProfile: boolean;
  isAgeVerified: boolean;
  hasTOSAccepted: boolean;
}

interface MainUser {
  id: string;
  email: string;
  role: string;
}

export function useFantasyAuth() {
  const queryClient = useQueryClient();
  
  // Check main authentication first
  const { data: mainUser, isLoading: isMainUserLoading } = useQuery<MainUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false
  });

  // Fetch fantasy profile if main user is authenticated
  const { 
    data: fantasyData, 
    isLoading: isFantasyLoading,
    refetch: refetchFantasyProfile 
  } = useQuery<FantasyAuthData>({
    queryKey: ["/api/fantasy/profile"],
    enabled: !!mainUser,
    retry: false,
    refetchOnWindowFocus: false
  });

  // Age verification mutation
  const ageVerifyMutation = useMutation({
    mutationFn: async (dateOfBirth: string) => {
      return apiRequest("/api/fantasy/profile/age-verify", {
        method: "POST",
        body: { dateOfBirth }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fantasy/profile"] });
    }
  });

  // TOS acceptance mutation
  const acceptTOSMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/fantasy/profile/accept-tos", {
        method: "POST"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fantasy/profile"] });
    }
  });

  // Create fantasy profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/fantasy/profile", {
        method: "POST",
        body: { status: "active" }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fantasy/profile"] });
    }
  });

  const isLoading = isMainUserLoading || (mainUser && isFantasyLoading);
  
  // Fantasy user is considered authenticated if:
  // 1. Main user is authenticated
  // 2. Has a fantasy profile
  // 3. Age is verified and hasn't expired
  // 4. TOS is accepted
  const isFantasyAuthenticated = !!(
    mainUser && 
    fantasyData?.hasProfile && 
    fantasyData?.isAgeVerified && 
    fantasyData?.hasTOSAccepted
  );

  // Check if ready for fantasy activation (main user exists but missing fantasy steps)
  const canActivateFantasy = !!(mainUser && !isFantasyAuthenticated);

  const verifyAge = (dateOfBirth: string) => {
    return ageVerifyMutation.mutateAsync(dateOfBirth);
  };

  const acceptTOS = () => {
    return acceptTOSMutation.mutateAsync();
  };

  const createFantasyProfile = () => {
    return createProfileMutation.mutateAsync();
  };

  return {
    // Main user data
    mainUser,
    
    // Fantasy profile data
    fantasyProfile: fantasyData?.profile,
    hasFantasyProfile: fantasyData?.hasProfile || false,
    isAgeVerified: fantasyData?.isAgeVerified || false,
    hasTOSAccepted: fantasyData?.hasTOSAccepted || false,
    
    // Authentication state
    isFantasyAuthenticated,
    canActivateFantasy,
    isLoading,
    
    // Actions
    verifyAge,
    acceptTOS,
    createFantasyProfile,
    refetchFantasyProfile,
    
    // Mutation states for loading indicators
    isVerifyingAge: ageVerifyMutation.isPending,
    isAcceptingTOS: acceptTOSMutation.isPending,
    isCreatingProfile: createProfileMutation.isPending,
    
    // Legacy compatibility (for transition period)
    fantasyUser: isFantasyAuthenticated ? {
      id: mainUser?.id || '',
      email: mainUser?.email || '',
      isFantasyUser: true,
      ageVerified: fantasyData?.isAgeVerified || false,
      createdAt: fantasyData?.profile?.createdAt || new Date().toISOString()
    } : null,
    
    // Deprecated - use server-backed system instead
    loginFantasyUser: () => {
      console.warn("loginFantasyUser is deprecated - use server-backed authentication");
    },
    logoutFantasyUser: () => {
      console.warn("logoutFantasyUser is deprecated - use main logout instead");
    }
  };
}