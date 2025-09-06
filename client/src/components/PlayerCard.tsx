import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, Target } from "lucide-react";
import type { ProfessionalPlayer } from "@shared/schema";

interface PlayerCardProps {
  player: ProfessionalPlayer;
  onClick?: () => void;
  isSelected?: boolean;
  showSalary?: boolean;
  captainMode?: boolean;
  onSelectAsCaptain?: () => void;
}

export function PlayerCard({ 
  player, 
  onClick, 
  isSelected = false, 
  showSalary = true,
  captainMode = false,
  onSelectAsCaptain 
}: PlayerCardProps) {
  const recentGames = player.recentPerformance?.games || [];
  const latestNews = player.latestNews || [];
  const currentStats = player.currentSeasonStats || {};
  const opponentData = player.opponentRank || {};

  // Determine injury status styling
  const getInjuryBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'out':
      case 'ir':
        return 'destructive';
      case 'questionable':
      case 'doubtful':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Performance trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  // Get recent average fantasy points
  const recentAvg = recentGames.length > 0 
    ? (recentGames.reduce((sum, game) => sum + game.fantasyPoints, 0) / recentGames.length).toFixed(1)
    : '0.0';

  return (
    <Card 
      className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
          : 'hover:shadow-md'
      }`}
      onClick={onClick}
      data-testid={`player-card-${player.id}`}
    >
      {/* Captain Mode Toggle */}
      {captainMode && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectAsCaptain?.();
            }}
            className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-full font-semibold"
            data-testid={`captain-button-${player.id}`}
          >
            CPT
          </button>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Player Image */}
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={player.playerImageUrl || undefined} 
                alt={player.playerName}
                className="object-cover"
              />
              <AvatarFallback className="text-sm">
                {player.playerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              {/* Player Name */}
              <h3 className="font-semibold text-sm truncate" data-testid={`player-name-${player.id}`}>
                {player.playerName}
              </h3>
              
              {/* Team & Position */}
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span data-testid={`player-team-${player.id}`}>{player.teamAbbreviation}</span>
                <span>•</span>
                <span data-testid={`player-position-${player.id}`}>{player.position}</span>
                {player.jerseyNumber && (
                  <>
                    <span>•</span>
                    <span>#{player.jerseyNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Salary */}
          {showSalary && player.salary && (
            <div className="text-right">
              <div className="text-sm font-semibold" data-testid={`player-salary-${player.id}`}>
                ${(player.salary / 1000).toFixed(1)}K
              </div>
            </div>
          )}
        </div>

        {/* Injury Status */}
        {player.injuryStatus !== 'healthy' && (
          <div className="flex items-center space-x-1 mt-1">
            <AlertTriangle className="h-3 w-3" />
            <Badge 
              variant={getInjuryBadgeVariant(player.injuryDesignation || player.injuryStatus || 'healthy')}
              className="text-xs"
              data-testid={`injury-status-${player.id}`}
            >
              {player.injuryDesignation || player.injuryStatus}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Key Stats Row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">FPPG</div>
            <div className="font-semibold text-sm" data-testid={`fppg-${player.id}`}>
              {currentStats.fantasyPointsPerGame?.toFixed(1) || '0.0'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Recent</div>
            <div className="font-semibold text-sm flex items-center justify-center space-x-1">
              <span data-testid={`recent-avg-${player.id}`}>{recentAvg}</span>
              {player.recentPerformance?.trend && getTrendIcon(player.recentPerformance.trend)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Games</div>
            <div className="font-semibold text-sm" data-testid={`games-played-${player.id}`}>
              {currentStats.gamesPlayed || 0}
            </div>
          </div>
        </div>

        {/* Recent Performance Mini Chart */}
        {recentGames.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Last {recentGames.length} Games</span>
            </div>
            <div className="flex space-x-1">
              {recentGames.slice(-6).map((game, index) => (
                <div 
                  key={index}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden"
                  style={{ height: '20px' }}
                  data-testid={`recent-game-${player.id}-${index}`}
                >
                  <div 
                    className={`h-full rounded ${
                      game.fantasyPoints > 15 ? 'bg-green-500' :
                      game.fantasyPoints > 10 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (game.fantasyPoints / 25) * 100)}%` 
                    }}
                    title={`Week ${game.week}: ${game.fantasyPoints.toFixed(1)} pts vs ${game.opponent}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matchup Information */}
        {player.nextOpponent && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>vs {player.nextOpponent}</span>
              {opponentData?.vsPosition && (
                <span className="text-xs">
                  (#{opponentData.vsPosition} vs {player.position})
                </span>
              )}
            </div>
            {opponentData?.fantasyPointsAllowed && (
              <div className="text-xs">
                <span className="text-muted-foreground">Allows: </span>
                <span className="font-medium">
                  {opponentData.fantasyPointsAllowed.toFixed(1)} FPPG
                </span>
              </div>
            )}
          </div>
        )}

        {/* Latest News */}
        {latestNews.length > 0 && (
          <div className="border-t pt-2">
            <div className="text-xs text-muted-foreground mb-1">Latest News</div>
            <div className="text-xs line-clamp-2" data-testid={`latest-news-${player.id}`}>
              {latestNews[0].headline}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(latestNews[0].timestamp).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Fantasy Player Grid Component
interface PlayerGridProps {
  players: ProfessionalPlayer[];
  onPlayerSelect?: (player: ProfessionalPlayer) => void;
  selectedPlayers?: string[];
  captainMode?: boolean;
  onCaptainSelect?: (player: ProfessionalPlayer) => void;
  loading?: boolean;
}

export function PlayerGrid({ 
  players, 
  onPlayerSelect, 
  selectedPlayers = [], 
  captainMode = false,
  onCaptainSelect,
  loading = false 
}: PlayerGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="player-grid">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onClick={() => onPlayerSelect?.(player)}
          isSelected={selectedPlayers.includes(player.id)}
          captainMode={captainMode}
          onSelectAsCaptain={() => onCaptainSelect?.(player)}
        />
      ))}
    </div>
  );
}