import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { fantasySalaryCalculator } from '@shared/fantasySalaryCalculator';

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
  
  // 🚀 PROFESSIONAL FANTASY SALARY CALCULATION
  // Uses advanced DraftKings-style algorithm with position scarcity and adjustments
  const generateFantasySalary = (player: any): number => {
    const { position, projectedPoints = 0, depth = 1, status } = player;
    
    // Generate realistic projected points if not provided
    let points = projectedPoints;
    if (points === 0) {
      points = fantasySalaryCalculator.generateProjectedPoints(position, depth);
    }
    
    // Create adjustments based on player data
    const adjustments = {
      injuryStatus: status === 'out' ? 'out' as const :
                   status === 'doubtful' ? 'doubtful' as const :
                   status === 'questionable' ? 'questionable' as const : 
                   'healthy' as const,
      gameScript: 'neutral' as const, // Default - could be enhanced with game data
      weather: 'clear' as const, // Default - could be enhanced with weather data
      ownershipProjection: depth === 1 ? 0.25 : depth === 2 ? 0.15 : 0.08 // Starters higher ownership
    };
    
    // Calculate salary using sophisticated algorithm
    return fantasySalaryCalculator.calculateSalary(points, position as any, adjustments);
  };
  
  const salary = generateFantasySalary(player);
  const tier = fantasySalaryCalculator.getSalaryTier(salary);
  
  // Professional tier styling based on sophisticated salary ranges
  const getTierStyling = (tier: string) => {
    switch (tier) {
      case 'elite':
        return {
          borderColor: 'border-yellow-400',
          bgGradient: 'from-yellow-50 to-orange-50',
          salaryColor: 'text-yellow-700 bg-yellow-100',
          tierBadge: { text: 'ELITE', color: 'bg-yellow-500' }
        };
      case 'solid':
        return {
          borderColor: 'border-blue-400', 
          bgGradient: 'from-blue-50 to-indigo-50',
          salaryColor: 'text-blue-700 bg-blue-100',
          tierBadge: { text: 'SOLID', color: 'bg-blue-500' }
        };
      case 'value':
        return {
          borderColor: 'border-green-400',
          bgGradient: 'from-green-50 to-emerald-50', 
          salaryColor: 'text-green-700 bg-green-100',
          tierBadge: { text: 'VALUE', color: 'bg-green-500' }
        };
      default: // budget
        return {
          borderColor: 'border-gray-400',
          bgGradient: 'from-gray-50 to-slate-50', 
          salaryColor: 'text-gray-700 bg-gray-100',
          tierBadge: { text: 'BUDGET', color: 'bg-gray-500' }
        };
    }
  };
  
  const styling = getTierStyling(tier);
  
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