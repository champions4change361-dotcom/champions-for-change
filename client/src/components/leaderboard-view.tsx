import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Plus, Medal, Target } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Tournament {
  id: string;
  name: string;
  sport: string;
  teamSize: number;
  status: string;
}

interface LeaderboardEntry {
  id: string;
  participantName: string;
  score: number;
  placement: number;
  status: 'active' | 'completed';
}

interface LeaderboardViewProps {
  tournament: Tournament;
}

export default function LeaderboardView({ tournament }: LeaderboardViewProps) {
  const [newParticipant, setNewParticipant] = useState('');
  const [newScore, setNewScore] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", tournament.id],
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: { participantName: string; score: number }) => {
      const response = await apiRequest("POST", `/api/tournaments/${tournament.id}/leaderboard`, entry);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry Added",
        description: "Participant result recorded successfully",
      });
      setNewParticipant("");
      setNewScore("");
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard", tournament.id] });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to add participant result",
        variant: "destructive",
      });
    },
  });

  const handleAddEntry = () => {
    if (!newParticipant.trim() || !newScore.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter participant name and score",
        variant: "destructive",
      });
      return;
    }

    const score = parseFloat(newScore);
    if (isNaN(score)) {
      toast({
        title: "Invalid Score", 
        description: "Please enter a valid numeric score",
        variant: "destructive",
      });
      return;
    }

    addEntryMutation.mutate({ 
      participantName: newParticipant, 
      score 
    });
  };

  // Sort entries by score (highest first for most competitions)
  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

  const getPlacementBadge = (placement: number) => {
    switch (placement) {
      case 1: return <Badge className="bg-yellow-500 text-white">🥇 1st</Badge>;
      case 2: return <Badge className="bg-gray-400 text-white">🥈 2nd</Badge>;
      case 3: return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>;
      default: return <Badge variant="outline">{placement}th</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="leaderboard-view">
      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Participant Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Participant name"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              data-testid="input-participant-name"
            />
            <Input
              placeholder="Score"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              type="number"
              step="0.01"
              data-testid="input-score"
            />
            <Button 
              onClick={handleAddEntry}
              disabled={addEntryMutation.isPending}
              data-testid="button-add-entry"
            >
              Add Result
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {tournament.name} Leaderboard
            <Badge variant="outline">{entries.length} participants</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Results Yet</h3>
              <p className="text-gray-600">
                Start recording participant results for {tournament.name}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Place</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.map((entry, index) => (
                  <TableRow 
                    key={entry.id}
                    className={index < 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}
                    data-testid={`entry-${entry.id}`}
                  >
                    <TableCell className="font-medium">
                      {getPlacementBadge(index + 1)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.participantName}
                    </TableCell>
                    <TableCell className="font-mono text-lg">
                      {entry.score}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.status === "completed" ? "default" : "secondary"}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}