import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { UserLineup } from "@shared/game-templates-schema";

interface LeaderboardProps {
  gameInstanceId: string;
  showTitle?: boolean;
  maxEntries?: number;
}

export function Leaderboard({ gameInstanceId, showTitle = true, maxEntries }: LeaderboardProps) {
  const { data: lineups = [], isLoading } = useQuery<UserLineup[]>({
    queryKey: ['/api/game-instances', gameInstanceId, 'lineups'],
    enabled: !!gameInstanceId,
    refetchInterval: 15000 // Live updates every 15 seconds
  });

  // Sort lineups by score descending, then by submission status, then by submitted time
  const sortedLineups = [...lineups].sort((a, b) => {
    const scoreA = parseFloat(a.currentScore || "0");
    const scoreB = parseFloat(b.currentScore || "0");
    
    // Primary sort: by score (descending)
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    
    // Secondary sort: submitted entries rank above drafts
    if (a.isSubmitted !== b.isSubmitted) {
      return a.isSubmitted ? -1 : 1;
    }
    
    // Tertiary sort: by submission time (earliest first)
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    
    // Final sort: by user name for stable ordering
    const nameA = a.userName || a.userEmail || '';
    const nameB = b.userName || b.userEmail || '';
    return nameA.localeCompare(nameB);
  });
  
  const displayLineups = maxEntries ? sortedLineups.slice(0, maxEntries) : sortedLineups;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" data-testid="icon-first-place" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" data-testid="icon-second-place" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" data-testid="icon-third-place" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-medium text-gray-500" data-testid={`rank-${rank}`}>
          {rank}
        </span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500 text-white";
      case 2: return "bg-gray-400 text-white";
      case 3: return "bg-amber-600 text-white";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card data-testid="leaderboard-loading">
        <CardHeader>
          {showTitle && (
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboard
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayLineups.length === 0) {
    return (
      <Card data-testid="leaderboard-empty">
        <CardHeader>
          {showTitle && (
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leaderboard
            </CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No Lineups Yet</p>
            <p className="text-sm">
              Be the first to submit a lineup and start the competition!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="leaderboard">
      <CardHeader>
        {showTitle && (
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Leaderboard
            <Badge variant="secondary" className="ml-auto" data-testid="participant-count">
              {lineups.length} {lineups.length === 1 ? 'Player' : 'Players'}
            </Badge>
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2" data-testid="leaderboard-entries">
          {displayLineups.map((lineup, index) => {
            const rank = index + 1;
            const score = parseFloat(lineup.currentScore || "0");
            const isSubmitted = lineup.isSubmitted;
            
            return (
              <div
                key={lineup.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  rank <= 3 ? 'border-primary/20 bg-primary/5' : ''
                }`}
                data-testid={`leaderboard-entry-${rank}`}
              >
                {/* Rank Icon */}
                <div className="flex-shrink-0">
                  {getRankIcon(rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate" data-testid={`user-name-${rank}`}>
                      {lineup.userName || lineup.userEmail || 'Anonymous Player'}
                    </p>
                    {rank <= 3 && (
                      <Badge 
                        className={`text-xs ${getRankBadgeColor(rank)}`}
                        data-testid={`rank-badge-${rank}`}
                      >
                        #{rank}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span data-testid={`submission-status-${rank}`}>
                      {isSubmitted ? 'Lineup Submitted' : 'Draft'}
                    </span>
                    {lineup.totalSalary && (
                      <>
                        <span>•</span>
                        <span data-testid={`salary-${rank}`}>
                          ${parseFloat(lineup.totalSalary).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className={`text-lg font-bold ${
                    rank === 1 ? 'text-yellow-600 dark:text-yellow-400' : 
                    rank === 2 ? 'text-gray-600 dark:text-gray-400' :
                    rank === 3 ? 'text-amber-600 dark:text-amber-400' :
                    'text-gray-800 dark:text-gray-200'
                  }`} data-testid={`score-${rank}`}>
                    {score.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {maxEntries && lineups.length > maxEntries && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing top {maxEntries} of {lineups.length} players
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}