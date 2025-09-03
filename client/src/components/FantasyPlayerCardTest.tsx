import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FantasyPlayerCard } from './FantasyPlayerCard';
import { Shuffle, Users } from 'lucide-react';

export function FantasyPlayerCardTest() {
  const [players, setPlayers] = useState<any[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestPlayers();
  }, []);

  const loadTestPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load fantasy-enhanced NFL players for testing
      const response = await fetch('/api/fantasy/player-cards/nfl');
      const data = await response.json();
      
      if (data.success && data.players.length > 0) {
        setPlayers(data.players);
        setCurrentPlayer(data.players[0]); // Show first player
        console.log('✅ Loaded fantasy players:', data.players.slice(0, 3));
      } else {
        setError('No fantasy player data available');
      }
    } catch (err) {
      console.error('Error loading test players:', err);
      setError('Failed to load fantasy player data');
    } finally {
      setLoading(false);
    }
  };

  const showRandomPlayer = () => {
    if (players.length > 0) {
      const randomIndex = Math.floor(Math.random() * players.length);
      setCurrentPlayer(players[randomIndex]);
      setSelectedPlayer(''); // Reset selection
    }
  };

  const handlePlayerSelect = (playerName: string, position: string, team: string) => {
    setSelectedPlayer(playerName);
    console.log(`🎯 Player selected: ${playerName} (${position}) - ${team}`);
  };

  const handlePlayerDrillDown = (player: any) => {
    console.log(`📊 Drill down for: ${player.name}`, player);
    alert(`Drill-down coming soon for ${player.name}!\n\nWould show:\n- Recent news\n- Injury status\n- Expanded stats\n- Matchup analysis`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-gray-600">Loading fantasy player data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          {error}. Make sure the server is running and fantasy endpoints are available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          DraftKings-Style Player Card Test
        </CardTitle>
        <div className="flex gap-2">
          <Button 
            onClick={showRandomPlayer}
            disabled={players.length === 0}
            size="sm"
            data-testid="button-random-player"
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Random Player
          </Button>
          <Button 
            onClick={loadTestPlayers}
            variant="outline"
            size="sm"
            data-testid="button-reload-data"
          >
            Reload Data
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {currentPlayer ? (
          <div className="max-w-sm mx-auto">
            <FantasyPlayerCard
              player={currentPlayer}
              onPlayerSelect={handlePlayerSelect}
              onPlayerDrillDown={handlePlayerDrillDown}
              isSelected={selectedPlayer === currentPlayer.name}
            />
            
            {/* Player Details */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
              <h4 className="font-semibold mb-2">Test Data:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Name:</strong> {currentPlayer.name}</div>
                <div><strong>Position:</strong> {currentPlayer.position}</div>
                <div><strong>Team:</strong> {currentPlayer.team}</div>
                <div><strong>Number:</strong> #{currentPlayer.number}</div>
                <div><strong>Projected:</strong> {currentPlayer.projectedPoints?.toFixed(1)} pts</div>
                <div><strong>Confidence:</strong> {currentPlayer.confidence}%</div>
                <div><strong>Opponent:</strong> vs {currentPlayer.opponent}</div>
                <div><strong>Depth:</strong> {currentPlayer.depth || 1}</div>
              </div>
            </div>

            <div className="mt-2 text-center text-xs text-gray-500">
              Showing {players.indexOf(currentPlayer) + 1} of {players.length} players
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No player data available. Check console for errors.
          </div>
        )}
      </CardContent>
    </Card>
  );
}