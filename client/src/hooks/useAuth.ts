import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });

  return {
    user,
    isLoading: isLoading && !user, // Only show loading if we don't have cached user data
    isAuthenticated: !!user && !error,
    error
  };
}