import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

export function useAuth() {
  // Check if we're on a school domain by looking at hostname
  const isSchoolDomain = typeof window !== 'undefined' && 
    (window.location.hostname.includes('tournaments') || window.location.hostname.includes('localhost'));
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: !isSchoolDomain, // Skip auth calls for school domains
  });

  return {
    user,
    isLoading: isSchoolDomain ? false : isLoading, // Never loading for school domains
    isAuthenticated: !!user && !error,
    error
  };
}