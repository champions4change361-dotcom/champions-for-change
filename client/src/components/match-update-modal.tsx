import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Target } from 'lucide-react';

interface Match {
  id: string;
  tournamentId: string;
  round: number;
  position: number;
  team1?: string;
  team2?: string;
  team1Score: number;
  team2Score: number;
  winner?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  bracket?: 'winners' | 'losers' | 'championship';
  poolId?: string;
}

interface MatchUpdateModalProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: { matchId: string; team1Score: number; team2Score: number; winner: string; status: string }) => void;
  isLoading: boolean;
}

export default function MatchUpdateModal({ 
  match, 
  isOpen, 
  onClose, 
  onUpdate, 
  isLoading 
}: MatchUpdateModalProps) {
  const [team1Score, setTeam1Score] = useState(match.team1Score.toString());
  const [team2Score, setTeam2Score] = useState(match.team2Score.toString());
  const [status, setStatus] = useState(match.status);
  const [winner, setWinner] = useState(match.winner || '');

  useEffect(() => {
    setTeam1Score(match.team1Score.toString());
    setTeam2Score(match.team2Score.toString());
    setStatus(match.status);
    setWinner(match.winner || '');
  }, [match]);

  // Auto-determine winner based on scores
  useEffect(() => {
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    
    if (score1 > score2 && match.team1) {
      setWinner(match.team1);
    } else if (score2 > score1 && match.team2) {
      setWinner(match.team2);
    } else if (score1 === score2) {
      setWinner('');
    }
  }, [team1Score, team2Score, match.team1, match.team2]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const score1 = parseInt(team1Score) || 0;
    const score2 = parseInt(team2Score) || 0;
    
    let finalStatus = status;
    let finalWinner = winner;
    
    // Auto-set status and winner if scores are entered
    if (score1 > 0 || score2 > 0) {
      if (score1 !== score2) {
        finalStatus = 'completed';
        finalWinner = score1 > score2 ? (match.team1 || '') : (match.team2 || '');
      } else if (score1 === score2 && score1 > 0) {
        finalStatus = 'completed';
        // For ties, let user manually select winner or handle differently
      }
    }

    onUpdate({
      matchId: match.id,
      team1Score: score1,
      team2Score: score2,
      winner: finalWinner,
      status: finalStatus
    });
  };

  const getBracketBadge = () => {
    if (match.bracket === 'winners') return <Badge className="bg-yellow-500">Winners</Badge>;
    if (match.bracket === 'losers') return <Badge className="bg-orange-500">Losers</Badge>;
    if (match.bracket === 'championship') return <Badge className="bg-purple-500">Championship</Badge>;
    if (match.poolId) return <Badge variant="secondary">Pool Play</Badge>;
    return null;
  };

  const getRoundDisplay = () => {
    if (match.bracket === 'championship') return 'Championship Final';
    if (match.poolId) return `Pool ${match.poolId.split('-')[1]?.toUpperCase() || ''}`;
    return `Round ${match.round}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="match-update-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Update Match Result
          </DialogTitle>
          <DialogDescription>
            {getRoundDisplay()} - Position {match.position}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Match Info */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Match Status</span>
            </div>
            {getBracketBadge()}
          </div>

          {/* Team 1 Score */}
          <div className="space-y-2">
            <Label htmlFor="team1-score">
              {match.team1 || 'Team 1'} Score
            </Label>
            <Input
              id="team1-score"
              type="number"
              min="0"
              value={team1Score}
              onChange={(e) => setTeam1Score(e.target.value)}
              placeholder="0"
              data-testid="input-team1-score"
            />
          </div>

          {/* Team 2 Score */}
          <div className="space-y-2">
            <Label htmlFor="team2-score">
              {match.team2 || 'Team 2'} Score
            </Label>
            <Input
              id="team2-score"
              type="number"
              min="0"
              value={team2Score}
              onChange={(e) => setTeam2Score(e.target.value)}
              placeholder="0"
              data-testid="input-team2-score"
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <Label htmlFor="status">Match Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'upcoming' | 'in-progress' | 'completed')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="select-status"
            >
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Winner Selection (if needed) */}
          {status === 'completed' && parseInt(team1Score) === parseInt(team2Score) && parseInt(team1Score) > 0 && (
            <div className="space-y-2">
              <Label htmlFor="winner">Winner (Tie Game)</Label>
              <select
                id="winner"
                value={winner}
                onChange={(e) => setWinner(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="select-winner"
              >
                <option value="">Select winner</option>
                {match.team1 && <option value={match.team1}>{match.team1}</option>}
                {match.team2 && <option value={match.team2}>{match.team2}</option>}
              </select>
            </div>
          )}

          {/* Winner Display */}
          {winner && status === 'completed' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Winner: {winner}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-save"
            >
              {isLoading ? 'Saving...' : 'Save Result'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}