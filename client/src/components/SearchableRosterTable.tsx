import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, TrendingUp } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Player {
  id: string;
  name: string;
  team: string;
  number: string;
  status: string;
  depth: number;
  position?: string;
}

interface SearchableRosterTableProps {
  sport: string;
  onPlayerSelect: (player: string, position: string, team: string) => void;
  selectedPlayer?: string;
}

export function SearchableRosterTable({ sport, onPlayerSelect, selectedPlayer }: SearchableRosterTableProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Load roster data on mount
  useEffect(() => {
    loadRosterData();
  }, [sport]);

  // Filter players when search term or position filter changes
  useEffect(() => {
    filterPlayers();
  }, [searchTerm, positionFilter, players]);

  const loadRosterData = async () => {
    try {
      setLoading(true);
      
      if (sport.toLowerCase() === 'nfl') {
        // Get all NFL players from our depth chart parser
        const response = await apiRequest('/api/fantasy/roster/nfl/all', 'GET');
        const data = response;
        
        if (data.success) {
          setPlayers(data.players || []);
        }
      }
      // Add other sports later (NBA, MLB, NHL)
    } catch (error) {
      console.error('Error loading roster data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = players;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply position filter
    if (positionFilter) {
      filtered = filtered.filter(player => {
        const playerPosition = player.position || getPositionFromId(player.id);
        return playerPosition === positionFilter;
      });
    }

    setFilteredPlayers(filtered);
  };

  const getPositionFromId = (playerId: string): string => {
    // Extract position from player ID structure
    if (playerId.includes('qb_') || playerId.includes('_qb')) return 'QB';
    if (playerId.includes('rb_') || playerId.includes('_rb')) return 'RB';
    if (playerId.includes('wr_') || playerId.includes('_wr')) return 'WR';
    if (playerId.includes('te_') || playerId.includes('_te')) return 'TE';
    return 'QB'; // Default fallback
  };

  const getDepthBadgeColor = (depth: number, status: string) => {
    if (status === 'starter' || depth === 1) return 'bg-green-500 hover:bg-green-600';
    if (depth === 2) return 'bg-yellow-500 hover:bg-yellow-600';
    if (depth >= 3) return 'bg-red-500 hover:bg-red-600';
    return 'bg-gray-500 hover:bg-gray-600';
  };

  const getPositions = () => {
    const positions = new Set(players.map(p => p.position || getPositionFromId(p.id)));
    return Array.from(positions).sort();
  };

  const handlePlayerClick = (player: Player) => {
    const position = player.position || getPositionFromId(player.id);
    onPlayerSelect(player.name, position, player.team);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-gray-600">Loading {sport.toUpperCase()} roster data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {sport.toUpperCase()} Player Search & Analysis
        </CardTitle>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by player name or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-player-search"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={positionFilter === '' ? 'default' : 'outline'}
              onClick={() => setPositionFilter('')}
              size="sm"
              data-testid="button-filter-all"
            >
              All
            </Button>
            {getPositions().map(position => (
              <Button
                key={position}
                variant={positionFilter === position ? 'default' : 'outline'}
                onClick={() => setPositionFilter(position)}
                size="sm"
                data-testid={`button-filter-${position.toLowerCase()}`}
              >
                {position}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredPlayers.length} of {players.length} players
        </div>

        {/* Roster Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Depth
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player, index) => (
                  <tr 
                    key={player.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedPlayer === player.name ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {player.position || getPositionFromId(player.id)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {player.team}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      #{player.number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge 
                        className={`text-white ${getDepthBadgeColor(player.depth, player.status)}`}
                      >
                        {player.status === 'starter' ? 'Starter' : `${player.depth}${player.depth === 2 ? 'nd' : player.depth === 3 ? 'rd' : 'th'} String`}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        size="sm"
                        onClick={() => handlePlayerClick(player)}
                        className="flex items-center gap-1"
                        data-testid={`button-analyze-${player.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        Analyze
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No players found matching your search criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}