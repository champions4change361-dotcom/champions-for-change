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
  depth?: number; // Optional - not used in MLB
  position?: string;
  hits?: string; // Batting handedness for MLB (R/L/S)
  sport?: string;
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
  const [teamFilter, setTeamFilter] = useState('');
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load roster data on mount and reset filters when sport changes
  useEffect(() => {
    loadRosterData();
    setPositionFilter('');
    setTeamFilter('');
    setSearchTerm('');
    setShowAllTeams(false);
  }, [sport]);

  // Filter players when search term, position filter, or team filter changes
  useEffect(() => {
    filterPlayers();
  }, [searchTerm, positionFilter, teamFilter, players]);

  const loadRosterData = async () => {
    try {
      setLoading(true);
      const sportLower = sport.toLowerCase();
      console.log(`Loading roster: ${sportLower}/all players`);
      
      if (sportLower === 'nfl') {
        // Get all NFL players from optimized depth chart parser
        const response = await fetch('/api/fantasy/roster/nfl/all');
        const data = await response.json();
        
        console.log('Raw API response:', data);
        
        if (data && data.success) {
          console.log('Received player data:', data);
          console.log('Players array:', data.players);
          console.log('Player count:', data.count);
          setPlayers(data.players || []);
        } else {
          console.error('API returned error:', data);
          setPlayers([]);
        }
        
      } else if (sportLower === 'nba') {
        // Get all NBA players using Yahoo Sports API optimized system
        const response = await fetch('/api/fantasy/roster/nba/all');
        const data = await response.json();
        
        console.log(`🏀 NBA API response:`, data);
        
        if (data && data.success) {
          setPlayers(data.players || []);
          console.log(`✅ Loaded ${data.players?.length || 0} NBA players`);
        } else {
          console.error('NBA API returned error:', data);
          setPlayers([]);
        }
        
      } else if (sportLower === 'mlb') {
        // Get all MLB players using Yahoo Sports API optimized system  
        const response = await fetch('/api/fantasy/roster/mlb/all');
        const data = await response.json();
        
        console.log(`⚾ MLB API response:`, data);
        
        if (data && data.success) {
          setPlayers(data.players || []);
          console.log(`✅ Loaded ${data.players?.length || 0} MLB players`);
        } else {
          console.error('MLB API returned error:', data);
          setPlayers([]);
        }
        
      } else if (sportLower === 'nhl') {
        // Get all NHL players using Yahoo Sports API optimized system
        const response = await fetch('/api/fantasy/roster/nhl/all');
        const data = await response.json();
        
        console.log(`🏒 NHL API response:`, data);
        
        if (data && data.success) {
          setPlayers(data.players || []);
          console.log(`✅ Loaded ${data.players?.length || 0} NHL players`);
        } else {
          console.error('NHL API returned error:', data);
          setPlayers([]);
        }
        
      } else {
        console.warn(`Unsupported sport: ${sport}`);
        setPlayers([]);
      }
    } catch (error) {
      console.error(`Error loading ${sport} roster data:`, error);
      setPlayers([]);
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

    // Apply team filter
    if (teamFilter) {
      filtered = filtered.filter(player => player.team === teamFilter);
    }

    setFilteredPlayers(filtered);
  };

  const getPositionFromId = (playerId: string): string => {
    // Extract position from player ID structure - Multi-sport support
    
    // NFL Positions
    if (playerId.includes('qb_') || playerId.includes('_qb')) return 'QB';
    if (playerId.includes('rb_') || playerId.includes('_rb')) return 'RB';
    if (playerId.includes('wr_') || playerId.includes('_wr')) return 'WR';
    if (playerId.includes('te_') || playerId.includes('_te')) return 'TE';
    if (playerId.includes('k_') || playerId.includes('_k')) return 'K';
    if (playerId.includes('def_') || playerId.includes('_def')) return 'DEF';
    
    // NBA Positions
    if (playerId.includes('pg_') || playerId.includes('_pg')) return 'PG';
    if (playerId.includes('sg_') || playerId.includes('_sg')) return 'SG';
    if (playerId.includes('sf_') || playerId.includes('_sf')) return 'SF';
    if (playerId.includes('pf_') || playerId.includes('_pf')) return 'PF';
    if (playerId.includes('c_') || playerId.includes('_c')) return 'C';
    
    // MLB Positions
    if (playerId.includes('p_') || playerId.includes('_p')) return 'P';
    if (playerId.includes('1b_') || playerId.includes('_1b')) return '1B';
    if (playerId.includes('2b_') || playerId.includes('_2b')) return '2B';
    if (playerId.includes('3b_') || playerId.includes('_3b')) return '3B';
    if (playerId.includes('ss_') || playerId.includes('_ss')) return 'SS';
    if (playerId.includes('of_') || playerId.includes('_of')) return 'OF';
    
    // NHL Positions
    if (playerId.includes('g_') || playerId.includes('_g')) return 'G';
    if (playerId.includes('d_') || playerId.includes('_d')) return 'D';
    if (playerId.includes('lw_') || playerId.includes('_lw')) return 'LW';
    if (playerId.includes('rw_') || playerId.includes('_rw')) return 'RW';
    
    // Smart sport-based fallback
    const sportLower = sport?.toLowerCase() || '';
    if (sportLower === 'nfl') return 'QB';
    if (sportLower === 'nba') return 'PG';
    if (sportLower === 'mlb') return 'P';
    if (sportLower === 'nhl') return 'C';
    
    return 'Unknown';
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

  const getTeams = () => {
    const teams = new Set(players.map(p => p.team));
    return Array.from(teams).sort();
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
        <div className="flex flex-col gap-4 mt-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by player name or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-player-search"
            />
          </div>
          
          {/* Position Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600 py-2">Position:</span>
            <Button
              variant={positionFilter === '' ? 'default' : 'outline'}
              onClick={() => setPositionFilter('')}
              size="sm"
              data-testid="button-filter-all-positions"
            >
              All Positions
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

          {/* Team Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600 py-2">Team:</span>
            <Button
              variant={teamFilter === '' ? 'default' : 'outline'}
              onClick={() => setTeamFilter('')}
              size="sm"
              data-testid="button-filter-all-teams"
            >
              All Teams
            </Button>
            {getTeams().slice(0, showAllTeams ? undefined : 8).map(team => (
              <Button
                key={team}
                variant={teamFilter === team ? 'default' : 'outline'}
                onClick={() => setTeamFilter(team)}
                size="sm"
                data-testid={`button-filter-team-${team.toLowerCase()}`}
              >
                {team}
              </Button>
            ))}
            {getTeams().length > 8 && (
              <Button
                variant="ghost"
                onClick={() => setShowAllTeams(!showAllTeams)}
                size="sm"
                data-testid="button-toggle-all-teams"
              >
                {showAllTeams ? 'Show Less' : `Show All ${getTeams().length} Teams`}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div className="text-sm text-gray-600">
            Showing {filteredPlayers.length} of {players.length} players
            {(positionFilter || teamFilter || searchTerm) && (
              <span className="ml-2 text-blue-600">
                (filtered)
              </span>
            )}
          </div>
          
          {/* Active Filters Summary */}
          {(positionFilter || teamFilter || searchTerm) && (
            <div className="flex flex-wrap gap-1 text-xs">
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Search: "{searchTerm}"
                </span>
              )}
              {positionFilter && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Position: {positionFilter}
                </span>
              )}
              {teamFilter && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded font-mono">
                  Team: {teamFilter}
                </span>
              )}
            </div>
          )}
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
                  {sport.toLowerCase() === 'mlb' ? (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hits
                    </th>
                  ) : (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Depth
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlayers.map((player, index) => (
                  <tr 
                    key={`${sport}_${player.id}_${index}`}
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
                      {sport.toLowerCase() === 'mlb' ? (
                        <Badge className="text-white bg-blue-500 hover:bg-blue-600">
                          {player.hits || 'R'}
                        </Badge>
                      ) : (
                        <Badge 
                          className={`text-white ${getDepthBadgeColor(player.depth || 1, player.status)}`}
                        >
                          {player.status === 'starter' ? 'Starter' : `${player.depth || 1}${(player.depth || 1) === 2 ? 'nd' : (player.depth || 1) === 3 ? 'rd' : 'th'} String`}
                        </Badge>
                      )}
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