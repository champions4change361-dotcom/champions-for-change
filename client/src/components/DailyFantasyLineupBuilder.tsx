import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
  Users, 
  Trophy, 
  Search, 
  X, 
  CheckCircle,
  TrendingUp,
  Filter,
  RefreshCw
} from 'lucide-react';
import { FantasyPlayerCard } from './FantasyPlayerCard';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface LineupSlot {
  position: string;
  player: any | null;
  salary: number;
}

interface DailyFantasyLineupBuilderProps {
  leagueId: string;
  sport: string;
  contestWeek?: number;
  byeTeams?: string[];
  onLineupSubmit?: (lineup: LineupSlot[]) => void;
}

export function DailyFantasyLineupBuilder({ 
  leagueId, 
  sport, 
  contestWeek = 1,
  byeTeams = [],
  onLineupSubmit 
}: DailyFantasyLineupBuilderProps) {
  const { toast } = useToast();
  const [lineup, setLineup] = useState<LineupSlot[]>([
    { position: 'QB', player: null, salary: 0 },
    { position: 'RB', player: null, salary: 0 },
    { position: 'RB', player: null, salary: 0 },
    { position: 'WR', player: null, salary: 0 },
    { position: 'WR', player: null, salary: 0 },
    { position: 'WR', player: null, salary: 0 },
    { position: 'TE', player: null, salary: 0 },
    { position: 'FLEX', player: null, salary: 0 }, // RB/WR/TE
    { position: 'DEF', player: null, salary: 0 },
  ]);

  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>('');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState<string>('ALL');
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState<any>(null);
  const [showPlayerDetailsModal, setShowPlayerDetailsModal] = useState(false);

  const salaryCap = 50000;
  const totalSalary = lineup.reduce((sum, slot) => sum + slot.salary, 0);
  const remainingSalary = salaryCap - totalSalary;

  // Fetch available players for the sport
  const { data: playersData, isLoading: playersLoading } = useQuery({
    queryKey: ['/api/fantasy/player-cards', sport],
    enabled: !!sport,
  });

  const availablePlayers = (playersData as any)?.players || [];

  const getPositionColor = (position: string) => {
    const colors = {
      'QB': 'bg-purple-500',
      'RB': 'bg-green-500',
      'WR': 'bg-blue-500',
      'TE': 'bg-orange-500',
      'FLEX': 'bg-indigo-500',
      'DEF': 'bg-red-500',
      'K': 'bg-gray-500'
    };
    return colors[position as keyof typeof colors] || 'bg-gray-500';
  };

  const openPlayerSelection = (position: string, slotIndex: number) => {
    setSelectedPosition(position);
    setSelectedSlotIndex(slotIndex);
    setFilterPosition(position === 'FLEX' ? 'ALL' : position);
    setSearchTerm('');
    setShowPlayerModal(true);
  };

  const generateFantasySalary = (player: any): number => {
    const { position, projectedPoints = 0, depth = 1, status } = player;
    
    const positionBaseSalary = {
      'QB': 70, 'RB': 65, 'WR': 60, 'TE': 50, 'K': 45, 'DEF': 40
    };
    
    let baseSalary = positionBaseSalary[position as keyof typeof positionBaseSalary] || 50;
    
    if (projectedPoints > 0) {
      if (projectedPoints >= 20) baseSalary += 35;
      else if (projectedPoints >= 15) baseSalary += 20;
      else if (projectedPoints >= 10) baseSalary += 10;
    }
    
    if (status === 'starter' || depth === 1) {
      baseSalary += 15;
    } else if (depth === 2) {
      baseSalary += 5;
    } else if (depth >= 3) {
      baseSalary -= 10;
    }
    
    return Math.max(40, Math.min(120, baseSalary)) * 100;
  };

  const selectPlayer = (player: any) => {
    const playerSalary = generateFantasySalary(player);
    
    // Check if player is already in lineup
    const existingPlayerIndex = lineup.findIndex(slot => slot.player?.id === player.id);
    if (existingPlayerIndex !== -1) {
      toast({
        title: "Player Already Selected",
        description: `${player.name} is already in your lineup`,
        variant: "destructive",
      });
      return;
    }

    // Check salary cap
    const currentSalaryWithoutSlot = lineup.reduce((sum, slot, index) => 
      index === selectedSlotIndex ? sum : sum + slot.salary, 0
    );
    
    if (currentSalaryWithoutSlot + playerSalary > salaryCap) {
      toast({
        title: "Salary Cap Exceeded",
        description: `Adding ${player.name} would exceed your $${(salaryCap/1000).toFixed(0)}K salary cap`,
        variant: "destructive",
      });
      return;
    }

    // Validate position for FLEX slot
    if (selectedPosition === 'FLEX' && !['RB', 'WR', 'TE'].includes(player.position)) {
      toast({
        title: "Invalid Position",
        description: "FLEX position only accepts RB, WR, or TE players",
        variant: "destructive",
      });
      return;
    }

    // Add player to lineup
    const newLineup = [...lineup];
    newLineup[selectedSlotIndex] = {
      position: selectedPosition,
      player: player,
      salary: playerSalary
    };
    setLineup(newLineup);
    
    toast({
      title: "Player Added!",
      description: `${player.name} added to your lineup`,
    });
    
    setShowPlayerModal(false);
  };

  const removePlayer = (slotIndex: number) => {
    const newLineup = [...lineup];
    newLineup[slotIndex] = {
      position: newLineup[slotIndex].position,
      player: null,
      salary: 0
    };
    setLineup(newLineup);
  };

  const openPlayerDetailsModal = (player: any) => {
    setSelectedPlayerForDetails(player);
    setShowPlayerDetailsModal(true);
  };

  const filteredPlayers = availablePlayers.filter((player: any) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.team.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesPosition = true;
    if (filterPosition !== 'ALL') {
      if (selectedPosition === 'FLEX') {
        matchesPosition = ['RB', 'WR', 'TE'].includes(player.position);
      } else {
        matchesPosition = player.position === filterPosition;
      }
    }
    
    // 🏈 CRITICAL: Filter out players from teams on bye week
    const notOnByeWeek = !byeTeams.includes(player.team);
    
    return matchesSearch && matchesPosition && notOnByeWeek;
  });

  const isLineupComplete = lineup.every(slot => slot.player !== null);
  const isLineupValid = totalSalary <= salaryCap && isLineupComplete;

  const submitLineup = () => {
    if (!isLineupValid) {
      toast({
        title: "Invalid Lineup",
        description: "Please complete your lineup within the salary cap",
        variant: "destructive",
      });
      return;
    }

    if (onLineupSubmit) {
      onLineupSubmit(lineup);
    }
    
    toast({
      title: "Lineup Submitted!",
      description: "Your daily fantasy lineup has been submitted",
    });
  };

  return (
    <div className="space-y-6" data-testid="daily-fantasy-lineup-builder">
      {/* Salary Cap Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span>Daily Fantasy Lineup - Week {contestWeek}</span>
            </div>
            <Badge className="bg-green-600 text-white text-lg px-3 py-2">
              ${(remainingSalary/1000).toFixed(1)}K Remaining
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Salary Used:</span> ${(totalSalary/1000).toFixed(1)}K / ${(salaryCap/1000).toFixed(0)}K
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">Players:</span> {lineup.filter(slot => slot.player).length}/9
              </div>
              <Button 
                onClick={submitLineup}
                disabled={!isLineupValid}
                className="bg-green-600 hover:bg-green-700"
                data-testid="submit-lineup-button"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Submit Lineup
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((totalSalary / salaryCap) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lineup Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Lineup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lineup.map((slot, index) => (
              <div
                key={index}
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors"
                data-testid={`lineup-slot-${slot.position}-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`${getPositionColor(slot.position)} text-white`}>
                    {slot.position}
                  </Badge>
                  {slot.player && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePlayer(index)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      data-testid={`remove-player-${index}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {slot.player ? (
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm">{slot.player.name}</h4>
                      <p className="text-xs text-gray-600">{slot.player.team} #{slot.player.number}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600">
                        ${(slot.salary/1000).toFixed(1)}K
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPlayerDetailsModal(slot.player)}
                        className="h-6 text-xs px-2"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Button
                      variant="ghost"
                      onClick={() => openPlayerSelection(slot.position, index)}
                      className="w-full h-auto py-3 border-2 border-dashed border-gray-300 hover:border-blue-400"
                      data-testid={`select-player-${slot.position}-${index}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Users className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-500">Select {slot.position}</span>
                      </div>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Selection Modal */}
      <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
        <DialogContent className="max-w-6xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Select {selectedPosition} Player - ${(remainingSalary/1000).toFixed(1)}K Available
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search players or teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="player-search-input"
                />
              </div>
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="px-3 py-2 border rounded-md"
                data-testid="position-filter"
              >
                <option value="ALL">All Positions</option>
                <option value="QB">QB</option>
                <option value="RB">RB</option>
                <option value="WR">WR</option>
                <option value="TE">TE</option>
                <option value="DEF">DEF</option>
              </select>
            </div>

            {/* Player Grid */}
            <ScrollArea className="h-[500px]">
              {playersLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                  <span className="ml-3 text-gray-600">Loading players...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
                  {filteredPlayers.map((player: any) => (
                    <FantasyPlayerCard
                      key={player.id}
                      player={player}
                      onPlayerSelect={() => selectPlayer(player)}
                      onPlayerDrillDown={() => openPlayerDetailsModal(player)}
                      isSelected={false}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Details Modal */}
      <Dialog open={showPlayerDetailsModal} onOpenChange={setShowPlayerDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPlayerForDetails?.name} - Detailed Analysis
            </DialogTitle>
          </DialogHeader>
          
          {selectedPlayerForDetails && (
            <div className="space-y-6">
              {/* Player Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Player Info</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Position:</strong> {selectedPlayerForDetails.position}</div>
                    <div><strong>Team:</strong> {selectedPlayerForDetails.team}</div>
                    <div><strong>Number:</strong> #{selectedPlayerForDetails.number}</div>
                    <div><strong>Opponent:</strong> vs {selectedPlayerForDetails.opponent || 'TBD'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Fantasy Points</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Projected:</strong> {selectedPlayerForDetails.projectedPoints?.toFixed(1) || 'N/A'} pts</div>
                    <div><strong>Confidence:</strong> {selectedPlayerForDetails.confidence || 'N/A'}%</div>
                    <div><strong>Salary:</strong> ${(generateFantasySalary(selectedPlayerForDetails)/1000).toFixed(1)}K</div>
                    <div><strong>Status:</strong> {selectedPlayerForDetails.status || 'Active'}</div>
                  </div>
                </div>
              </div>

              {/* Recent News */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Latest News</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {selectedPlayerForDetails.name} is coming off a strong performance and is expected to have a solid matchup 
                    this week. Coaches report good health and full participation in practice.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    <em>Real-time news integration coming soon</em>
                  </p>
                </div>
              </div>

              {/* Season Stats */}
              <div>
                <h4 className="font-semibold text-lg mb-2">Season Performance</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-bold text-lg text-blue-600">
                      {selectedPlayerForDetails.projectedPoints?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-gray-600">Avg Points</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-lg text-green-600">
                      {Math.floor(Math.random() * 10) + 5}
                    </div>
                    <div className="text-gray-600">Games Played</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-bold text-lg text-purple-600">
                      {selectedPlayerForDetails.confidence || 75}%
                    </div>
                    <div className="text-gray-600">Consistency</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    selectPlayer(selectedPlayerForDetails);
                    setShowPlayerDetailsModal(false);
                  }}
                  className="flex-1"
                  disabled={lineup.some(slot => slot.player?.id === selectedPlayerForDetails.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add to Lineup
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPlayerDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}