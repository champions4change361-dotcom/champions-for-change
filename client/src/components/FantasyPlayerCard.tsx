import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

interface FantasyPlayerCardProps {
  player: {
    id: string;
    name: string;
    position: string;
    team: string;
    number: string;
    projectedPoints?: number;
    confidence?: number;
    opponent?: string;
    depth?: number;
    status?: string;
  };
  onPlayerSelect: (player: string, position: string, team: string) => void;
  onPlayerDrillDown?: (player: any) => void;
  isSelected?: boolean;
}

export function FantasyPlayerCard({ player, onPlayerSelect, onPlayerDrillDown, isSelected }: FantasyPlayerCardProps) {
  
  // Fantasy salary algorithm based on position, projections, and tier
  const generateFantasySalary = (player: any): number => {
    const { position, projectedPoints = 0, depth = 1, status } = player;
    
    // Base salary ranges by position (in hundreds, will multiply by 100)
    const positionBaseSalary = {
      'QB': 70,    // $7,000 base
      'RB': 65,    // $6,500 base  
      'WR': 60,    // $6,000 base
      'TE': 50,    // $5,000 base
      'K': 45,     // $4,500 base
      'DEF': 40    // $4,000 base
    };
    
    let baseSalary = positionBaseSalary[position as keyof typeof positionBaseSalary] || 50;
    
    // Adjust for projected points (if available)
    if (projectedPoints > 0) {
      if (projectedPoints >= 20) baseSalary += 35; // Star players: $10K+
      else if (projectedPoints >= 15) baseSalary += 20; // Solid players: $6-9K
      else if (projectedPoints >= 10) baseSalary += 10; // Mid-tier
      // Budget options stay at base level: $4-6K
    }
    
    // Adjust for depth chart position
    if (status === 'starter' || depth === 1) {
      baseSalary += 15; // Starters get premium
    } else if (depth === 2) {
      baseSalary += 5;  // Backups get slight bump
    } else if (depth >= 3) {
      baseSalary -= 10; // Deep bench players cheaper
    }
    
    // Ensure salary stays in DraftKings range ($4,000 - $12,000)
    const finalSalary = Math.max(40, Math.min(120, baseSalary)) * 100;
    
    return finalSalary;
  };
  
  const salary = generateFantasySalary(player);
  
  // Determine tier based on salary for styling
  const getTierStyling = (salary: number) => {
    if (salary >= 10000) {
      return {
        borderColor: 'border-yellow-400',
        bgGradient: 'from-yellow-50 to-orange-50',
        salaryColor: 'text-yellow-700 bg-yellow-100',
        tierBadge: { text: 'ELITE', color: 'bg-yellow-500' }
      };
    } else if (salary >= 7000) {
      return {
        borderColor: 'border-blue-400', 
        bgGradient: 'from-blue-50 to-indigo-50',
        salaryColor: 'text-blue-700 bg-blue-100',
        tierBadge: { text: 'SOLID', color: 'bg-blue-500' }
      };
    } else {
      return {
        borderColor: 'border-green-400',
        bgGradient: 'from-green-50 to-emerald-50', 
        salaryColor: 'text-green-700 bg-green-100',
        tierBadge: { text: 'VALUE', color: 'bg-green-500' }
      };
    }
  };
  
  const styling = getTierStyling(salary);
  
  // Format salary for display
  const formatSalary = (amount: number) => {
    return `$${(amount / 1000).toFixed(1)}K`;
  };
  
  // Get position colors
  const getPositionColor = (position: string) => {
    const colors = {
      'QB': 'bg-purple-500',
      'RB': 'bg-green-500', 
      'WR': 'bg-blue-500',
      'TE': 'bg-orange-500',
      'K': 'bg-gray-500',
      'DEF': 'bg-red-500'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-500';
  };
  
  const handleCardClick = () => {
    onPlayerSelect(player.name, player.position, player.team);
  };
  
  const handleDrillDownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlayerDrillDown) {
      onPlayerDrillDown(player);
    }
  };

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        border-2 ${styling.borderColor} bg-gradient-to-br ${styling.bgGradient}
      `}
      onClick={handleCardClick}
      data-testid={`player-card-${player.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
    >
      <CardContent className="p-4">
        {/* Header Row - Name, Position, Tier */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">
              {player.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge className={`${getPositionColor(player.position)} text-white text-xs px-2 py-1`}>
                {player.position}
              </Badge>
              <Badge className={`${styling.tierBadge.color} text-white text-xs px-2 py-1`}>
                {styling.tierBadge.text}
              </Badge>
            </div>
          </div>
          
          {/* Salary Display */}
          <div className={`${styling.salaryColor} px-3 py-2 rounded-lg font-bold text-lg`}>
            {formatSalary(salary)}
          </div>
        </div>
        
        {/* Team and Opponent */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{player.team}</span>
            <span className="text-gray-500">#{player.number}</span>
          </div>
          {player.opponent && (
            <span className="text-gray-600 font-medium">vs {player.opponent}</span>
          )}
        </div>
        
        {/* Stats Row */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <div className="flex items-center gap-3">
            {player.projectedPoints && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-700">
                  {player.projectedPoints.toFixed(1)} pts
                </span>
              </div>
            )}
            
            {player.confidence && (
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">{player.confidence}%</span>
              </div>
            )}
          </div>
          
          {/* Depth Chart Badge */}
          {(player.status || player.depth) && (
            <Badge 
              className={`text-xs font-semibold ${
                player.status === 'out' ? 'bg-red-600 text-white' 
                  : player.status === 'doubtful' ? 'bg-orange-600 text-white'
                  : player.status === 'questionable' ? 'bg-yellow-500 text-black'
                  : player.status === 'starter' || player.depth === 1 
                  ? 'bg-green-600 text-white' 
                  : 'border-gray-400 text-gray-600 border'
              }`}
            >
              {player.status === 'out' ? '❌ OUT' 
                : player.status === 'doubtful' ? '🔴 Doubtful'
                : player.status === 'questionable' ? '⚠️ Questionable'
                : player.status === 'starter' ? '✅ Starter' 
                : `${player.depth}${player.depth === 2 ? 'nd' : player.depth === 3 ? 'rd' : 'th'} String`}
            </Badge>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="flex-1 h-8"
            onClick={handleCardClick}
            data-testid={`button-select-${player.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
          >
            <Users className="w-3 h-3 mr-1" />
            Select
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            className="h-8 px-3"
            onClick={handleDrillDownClick}
            data-testid={`button-details-${player.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
          >
            <TrendingUp className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}