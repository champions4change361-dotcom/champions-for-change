import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  opponent?: string;
  projectedPoints?: number;
  salary?: number;
  injuryStatus?: string;
  isActive?: boolean;
}

interface PlayerListProps {
  players: Player[];
  position: string;
  onPlayerClick: (player: Player) => void;
  title?: string;
}

export function PlayerList({ players, position, onPlayerClick, title }: PlayerListProps) {
  const filteredPlayers = players.filter(p => p.position === position && p.isActive !== false);
  
  const getInjuryBadge = (status?: string) => {
    if (!status || status === 'healthy') return null;
    
    const variants = {
      'out': 'destructive',
      'doubtful': 'secondary', 
      'questionable': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="text-xs">
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getSalaryDisplay = (salary?: number) => {
    if (!salary) return '';
    return `$${salary.toLocaleString()}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          {title || `Available ${position}s`} ({filteredPlayers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => onPlayerClick(player)}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
              data-testid={`player-${player.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-blue-600 group-hover:text-blue-700">
                    {player.name}
                  </span>
                  {getInjuryBadge(player.injuryStatus)}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="font-medium">{player.team}</span>
                  {player.opponent && (
                    <>
                      <span>vs</span>
                      <span className="font-medium">{player.opponent}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {player.projectedPoints && (
                  <div className="text-sm font-medium text-green-600">
                    {player.projectedPoints.toFixed(1)} pts
                  </div>
                )}
                {player.salary && (
                  <div className="text-xs text-gray-500">
                    {getSalaryDisplay(player.salary)}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {filteredPlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No {position}s available for this week</p>
              <p className="text-sm mt-1">Players may be on bye or injured</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}