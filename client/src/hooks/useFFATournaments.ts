import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type {
  FFATournamentType,
  FFAParticipant,
  FFAConfig,
  FFAHeatAssignment,
  FFALeaderboardEntry
} from '@shared/bracket-generator';

// Types for FFA tournament operations
export interface FFATournament {
  id: string;
  name: string;
  sport: string;
  tournamentType: FFATournamentType;
  competitionFormat: string;
  status: 'upcoming' | 'active' | 'completed';
  participants: FFAParticipant[];
  heatAssignments: FFAHeatAssignment[];
  ffaConfig: FFAConfig;
  bracketData?: any;
  totalRounds?: number;
  currentRound?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FFAGenerateRequest {
  tournamentId: string;
  tournamentType: FFATournamentType;
  participants: Array<{
    id: string;
    name: string;
    email?: string;
    seedNumber?: number;
    skillLevel?: string;
  }>;
  formatConfig?: Record<string, any>;
}

export interface FFARoundResultsRequest {
  roundNumber: number;
  results: Array<{
    participantId: string;
    result: number | string;
    ranking: number;
    eliminated?: boolean;
    advancedToNextRound?: boolean;
    notes?: string;
  }>;
}

export interface FFAGenerateResponse {
  success: boolean;
  tournament: FFATournament;
  message: string;
}

export interface FFARoundResultsResponse {
  success: boolean;
  tournament: FFATournament;
  leaderboard: FFALeaderboardEntry[];
  message: string;
}

// Hook to get FFA tournament details
export function useFFATournament(tournamentId: string | undefined) {
  return useQuery<{
    tournament: FFATournament;
    leaderboard: FFALeaderboardEntry[];
    participants: FFAParticipant[];
    heatAssignments: FFAHeatAssignment[];
    ffaConfig: FFAConfig;
  }>({
    queryKey: ['/api/ffa', tournamentId],
    enabled: !!tournamentId,
    staleTime: 1000 * 60 * 2, // 2 minutes - FFA tournaments can change frequently
  });
}

// Hook to get FFA leaderboard
export function useFFALeaderboard(tournamentId: string | undefined) {
  return useQuery<FFALeaderboardEntry[]>({
    queryKey: ['/api/ffa', tournamentId, 'leaderboard'],
    enabled: !!tournamentId,
    refetchInterval: 30000, // Refresh every 30 seconds for live tournaments
  });
}

// Hook to get FFA participant performance
export function useFFAParticipantPerformance(
  tournamentId: string | undefined,
  participantId: string | undefined
) {
  return useQuery({
    queryKey: ['/api/ffa', tournamentId, 'participants', participantId, 'performance'],
    enabled: !!tournamentId && !!participantId,
  });
}

// Hook to generate FFA tournament
export function useGenerateFFATournament() {
  const queryClient = useQueryClient();

  return useMutation<FFAGenerateResponse, Error, FFAGenerateRequest>({
    mutationFn: async (data: FFAGenerateRequest) => {
      const response = await apiRequest('/api/ffa/generate', 'POST', data);
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch tournaments list
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      
      // Update FFA tournament cache
      queryClient.setQueryData(['/api/ffa', variables.tournamentId], {
        tournament: data.tournament,
        leaderboard: [],
        participants: data.tournament.participants || [],
        heatAssignments: data.tournament.heatAssignments || [],
        ffaConfig: data.tournament.ffaConfig || {}
      });
      
      // Invalidate specific FFA tournament queries
      queryClient.invalidateQueries({ queryKey: ['/api/ffa', variables.tournamentId] });
    },
    onError: (error) => {
      console.error('Failed to generate FFA tournament:', error);
    }
  });
}

// Hook to update FFA round results
export function useUpdateFFARoundResults() {
  const queryClient = useQueryClient();

  return useMutation<FFARoundResultsResponse, Error, { tournamentId: string } & FFARoundResultsRequest>({
    mutationFn: async ({ tournamentId, ...data }) => {
      const response = await apiRequest(`/api/ffa/rounds/${tournamentId}/results`, 'PATCH', data);
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Update FFA tournament cache with new results
      queryClient.setQueryData(['/api/ffa', variables.tournamentId], (oldData: any) => ({
        ...oldData,
        tournament: data.tournament,
        leaderboard: data.leaderboard
      }));
      
      // Update leaderboard cache
      queryClient.setQueryData(['/api/ffa', variables.tournamentId, 'leaderboard'], data.leaderboard);
      
      // Invalidate general tournaments list
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      
      // Invalidate specific FFA queries
      queryClient.invalidateQueries({ queryKey: ['/api/ffa', variables.tournamentId] });
    },
    onError: (error) => {
      console.error('Failed to update FFA round results:', error);
    }
  });
}

// Hook to update FFA participants
export function useUpdateFFAParticipants() {
  const queryClient = useQueryClient();

  return useMutation<FFATournament, Error, { tournamentId: string; participants: FFAParticipant[] }>({
    mutationFn: async ({ tournamentId, participants }) => {
      const response = await apiRequest(`/api/tournaments/${tournamentId}`, 'PATCH', {
        participants
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Update FFA tournament cache
      queryClient.setQueryData(['/api/ffa', variables.tournamentId], (oldData: any) => ({
        ...oldData,
        tournament: data,
        participants: data.participants || []
      }));
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ffa', variables.tournamentId] });
    },
    onError: (error) => {
      console.error('Failed to update FFA participants:', error);
    }
  });
}

// Hook to update FFA heat assignments
export function useUpdateFFAHeatAssignments() {
  const queryClient = useQueryClient();

  return useMutation<FFATournament, Error, { tournamentId: string; heatAssignments: FFAHeatAssignment[] }>({
    mutationFn: async ({ tournamentId, heatAssignments }) => {
      const response = await apiRequest(`/api/tournaments/${tournamentId}`, 'PATCH', {
        heatAssignments
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Update FFA tournament cache
      queryClient.setQueryData(['/api/ffa', variables.tournamentId], (oldData: any) => ({
        ...oldData,
        tournament: data,
        heatAssignments: data.heatAssignments || []
      }));
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ffa', variables.tournamentId] });
    },
    onError: (error) => {
      console.error('Failed to update FFA heat assignments:', error);
    }
  });
}

// Helper hook for FFA tournament type validation
export function isFFATournamentType(tournamentType: string): tournamentType is FFATournamentType {
  return ['multi-heat-racing', 'battle-royale', 'point-accumulation', 'time-trials', 'survival-elimination'].includes(tournamentType);
}

// Helper hook to get FFA tournament display information
export function useFFATournamentDisplayInfo(tournamentType: FFATournamentType) {
  const getFFAIcon = (type: FFATournamentType) => {
    switch (type) {
      case 'multi-heat-racing': return '🏃';
      case 'battle-royale': return '⚔️';
      case 'point-accumulation': return '🎯';
      case 'time-trials': return '⏱️';
      case 'survival-elimination': return '🏆';
      default: return '🏁';
    }
  };

  const getFFADisplayName = (type: FFATournamentType) => {
    switch (type) {
      case 'multi-heat-racing': return 'Multi-Heat Racing';
      case 'battle-royale': return 'Battle Royale';
      case 'point-accumulation': return 'Point Accumulation';
      case 'time-trials': return 'Time Trials';
      case 'survival-elimination': return 'Survival Elimination';
      default: return 'FFA Tournament';
    }
  };

  const getFFADescription = (type: FFATournamentType) => {
    switch (type) {
      case 'multi-heat-racing': return 'Multiple qualifying heats with advancement to finals';
      case 'battle-royale': return 'Last player standing wins through elimination rounds';
      case 'point-accumulation': return 'Accumulate points across multiple scoring rounds';
      case 'time-trials': return 'Best individual time across multiple attempts';
      case 'survival-elimination': return 'Progressive elimination until final survivor';
      default: return 'Free-for-all tournament format';
    }
  };

  return {
    icon: getFFAIcon(tournamentType),
    displayName: getFFADisplayName(tournamentType),
    description: getFFADescription(tournamentType)
  };
}