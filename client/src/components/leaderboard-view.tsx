import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Award, Timer, Target } from "lucide-react";
import { type Tournament } from "@shared/schema";

interface LeaderboardEntry {
  id: string;
  participantName: string;
  score: number;
  placement: number;
  eventName?: string;
  measurement: string;
  unit: string;
  status: string;
}

interface LeaderboardViewProps {
  tournament: Tournament;
}

export default function LeaderboardView({ tournament }: LeaderboardViewProps) {
  const [newParticipant, setNewParticipant] = useState("");
  const [newScore, setNewScore] = useState("");
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
        description: "Participant added to leaderboard successfully",
      });
      setNewParticipant("");
      setNewScore("");
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard", tournament.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add participant to leaderboard",
        variant: "destructive",
      });
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ entryId, score }: { entryId: string; score: number }) => {
      const response = await apiRequest("PATCH", `/api/leaderboard/${entryId}`, { score });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard", tournament.id] });
    },
  });

  const handleAddEntry = () => {
    if (!newParticipant.trim() || !newScore.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both participant name and score",
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

    addEntryMutation.mutate({ participantName: newParticipant, score });
  };

  const handleScoreUpdate = (entryId: string, newScoreValue: string) => {
    const score = parseFloat(newScoreValue);
    if (!isNaN(score)) {
      updateScoreMutation.mutate({ entryId, score });
    }
  };

  const getRankIcon = (placement: number) => {
    switch (placement) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm text-gray-500">#{placement}</span>;
    }
  };

  const getScoreDisplay = (entry: LeaderboardEntry) => {
    const value = entry.score;
    const unit = entry.unit;
    
    if (entry.measurement === "time" && unit === "seconds") {
      // Format time as MM:SS.mmm
      const minutes = Math.floor(value / 60);
      const seconds = (value % 60).toFixed(3);
      return minutes > 0 ? `${minutes}:${seconds.padStart(6, '0')}` : `${seconds}s`;
    }
    
    return `${value} ${unit}`;
  };

  const sortedEntries = [...entries].sort((a, b) => {
    if (tournament.scoringMethod === "time") {
      return a.score - b.score; // Lower time is better
    }
    return b.score - a.score; // Higher score is better for points/distance
  });

  return (
    <div className="space-y-6" data-testid="leaderboard-view">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {tournament.name} Leaderboard
          </CardTitle>
          <CardDescription>
            Track individual performance and rankings
            {tournament.scoringMethod && (
              <Badge variant="outline" className="ml-2">
                {tournament.scoringMethod === "time" ? "Best Time Wins" : "Highest Score Wins"}
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Add New Entry */}
          <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input
              placeholder="Participant name"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              data-testid="input-participant-name"
            />
            <Input
              placeholder={tournament.scoringMethod === "time" ? "Time (seconds)" : "Score"}
              type="number"
              step="0.001"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
              data-testid="input-participant-score"
            />
            <Button 
              onClick={handleAddEntry}
              disabled={addEntryMutation.isPending}
              data-testid="button-add-entry"
            >
              Add Entry
            </Button>
          </div>

          {/* Leaderboard Table */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : sortedEntries.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Entries Yet</h3>
              <p className="text-gray-600">Add participants above to start tracking performance</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Participant</TableHead>
                  <TableHead className="text-right">
                    {tournament.scoringMethod === "time" ? "Time" : "Score"}
                  </TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEntries.map((entry, index) => (
                  <TableRow key={entry.id} data-testid={`leaderboard-entry-${entry.id}`}>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getRankIcon(index + 1)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.participantName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.001"
                        defaultValue={entry.score}
                        onBlur={(e) => handleScoreUpdate(entry.id, e.target.value)}
                        className="w-24 text-right"
                        data-testid={`input-score-${entry.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={entry.status === "completed" ? "default" : "secondary"}
                        data-testid={`status-${entry.id}`}
                      >
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