import { useQuery } from '@tanstack/react-query';

interface CurrentWeekData {
  currentWeek: number;
  byeTeams: string[];
  season: number;
}

export function useCurrentWeek() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/nfl/current-week'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  return {
    currentWeek: (data as any)?.currentWeek || 1,
    byeTeams: (data as any)?.byeTeams || [],
    season: (data as any)?.season || new Date().getFullYear(),
    isLoading,
    error
  };
}