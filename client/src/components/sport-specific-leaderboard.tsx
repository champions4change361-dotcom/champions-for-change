import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Timer, Target, Activity, Medal, Plus } from 'lucide-react';
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
  time?: string;
  distance?: number;
  attempts?: number;
  placement: number;
  eventName?: string;
  measurement: string;
  unit: string;
  scoringDirection?: 'higher-better' | 'lower-better';
  status: 'active' | 'completed' | 'disqualified';
  personalBest?: boolean;
  seasonBest?: boolean;
  meetRecord?: boolean;
}

interface SportSpecificLeaderboardProps {
  tournament: Tournament;
}

// Sport-specific configurations
const sportConfigs = {
  track: {
    icon: Timer,
    primaryMetric: 'time',
    unit: 'seconds',
    sortDirection: 'asc', // Lower is better
    events: ['100m', '200m', '400m', '800m', '1600m', '3200m', '110m Hurdles', '300m Hurdles'],
    fieldEvents: ['Shot Put', 'Discus', 'Long Jump', 'High Jump', 'Pole Vault', 'Triple Jump']
  },
  swimming: {
    icon: Activity,
    primaryMetric: 'time',
    unit: 'seconds',
    sortDirection: 'asc',
    events: ['50m Free', '100m Free', '200m Free', '500m Free', '100m Back', '100m Breast', '100m Fly', '200m IM']
  },
  golf: {
    icon: Target,
    primaryMetric: 'score',
    unit: 'strokes',
    sortDirection: 'asc', // Lower score is better
    events: ['Round 1', 'Round 2', 'Round 3', 'Final Round']
  },
  wrestling: {
    icon: Trophy,
    primaryMetric: 'points',
    unit: 'points',
    sortDirection: 'desc',
    weightClasses: ['106', '113', '120', '126', '132', '138', '145', '152', '160', '170', '182', '195', '220', '285']
  },
  powerlifting: {
    icon: Medal,
    primaryMetric: 'weight',
    unit: 'lbs',
    sortDirection: 'desc',
    events: ['Squat', 'Bench Press', 'Deadlift', 'Total']
  }
};

export default function SportSpecificLeaderboard({ tournament }: SportSpecificLeaderboardProps) {
  const [newParticipant, setNewParticipant] = useState('');
  const [newScore, setNewScore] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sportConfig = sportConfigs[tournament.sport as keyof typeof sportConfigs] || sportConfigs.track;
  const IconComponent = sportConfig.icon;

  const { data: entries = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", tournament.id],
  });

  const addEntryMutation = useMutation({
    mutationFn: async (entry: { 
      participantName: string; 
      score: number; 
      eventName?: string;
      time?: string;
      distance?: number;
    }) => {
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
      setSelectedEvent("");
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

  const updateScoreMutation = useMutation({
    mutationFn: async ({ entryId, score }: { entryId: string; score: number }) => {
      const response = await apiRequest("PATCH", `/api/leaderboard/${entryId}`, { score });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard", tournament.id] });
    },
  });

  // Group entries by event if applicable
  const groupedEntries = entries.reduce((acc, entry) => {
    const eventKey = entry.eventName || 'Overall';
    if (!acc[eventKey]) acc[eventKey] = [];
    acc[eventKey].push(entry);
    return acc;
  }, {} as Record<string, LeaderboardEntry[]>);

  // Sort entries using universal scoring direction logic
  Object.keys(groupedEntries).forEach(eventKey => {
    groupedEntries[eventKey].sort((a, b) => {
      // Check if we have event-specific scoring direction
      const eventScoringDirection = entries.find(e => e.eventName === eventKey)?.scoringDirection;
      
      // Use event-specific direction, fallback to sport config, then default to higher-better
      const shouldLowerWin = eventScoringDirection === 'lower-better' || 
                           (eventScoringDirection === undefined && sportConfig.sortDirection === 'asc');
      
      if (shouldLowerWin) {
        return a.score - b.score; // Lower is better (time, golf closest-to-pin)
      } else {
        return b.score - a.score; // Higher is better (distance, points)
      }
    });

    // Update placements
    groupedEntries[eventKey].forEach((entry, index) => {
      entry.placement = index + 1;
    });
  });

  const handleAddEntry = () => {
    if (!newParticipant.trim() || !newScore.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter participant name and result",
        variant: "destructive",
      });
      return;
    }

    const score = parseFloat(newScore);
    if (isNaN(score)) {
      toast({
        title: "Invalid Result", 
        description: "Please enter a valid numeric result",
        variant: "destructive",
      });
      return;
    }

    const entryData: any = { 
      participantName: newParticipant, 
      score 
    };

    if (selectedEvent) {
      entryData.eventName = selectedEvent;
    }

    // For time-based sports, also store as time format
    if (sportConfig.primaryMetric === 'time') {
      entryData.time = formatTime(score);
    }

    // For distance events, store distance
    if (tournament.sport === 'track' && ['Shot Put', 'Discus', 'Long Jump', 'Triple Jump'].includes(selectedEvent)) {
      entryData.distance = score;
    }

    addEntryMutation.mutate(entryData);
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toFixed(2)}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toFixed(2)}`;
    }
  };

  const formatScore = (entry: LeaderboardEntry): string => {
    if (sportConfig.primaryMetric === 'time' && entry.time) {
      return entry.time;
    } else if (tournament.sport === 'golf') {
      const par = 72; // Assume par 72 course
      const relative = entry.score - par;
      if (relative === 0) return `E (${entry.score})`;
      if (relative > 0) return `+${relative} (${entry.score})`;
      return `${relative} (${entry.score})`;
    } else {
      return `${entry.score} ${sportConfig.unit}`;
    }
  };

  const getPlacementBadge = (placement: number) => {
    switch (placement) {
      case 1: return <Badge className="bg-yellow-500 text-white">🥇 1st</Badge>;
      case 2: return <Badge className="bg-gray-400 text-white">🥈 2nd</Badge>;
      case 3: return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>;
      default: return <Badge variant="outline">{placement}th</Badge>;
    }
  };

  const getRecordBadges = (entry: LeaderboardEntry) => {
    const badges = [];
    if (entry.personalBest) badges.push(<Badge key="pb" variant="secondary" className="text-xs">PB</Badge>);
    if (entry.seasonBest) badges.push(<Badge key="sb" variant="secondary" className="text-xs">SB</Badge>);
    if (entry.meetRecord) badges.push(<Badge key="mr" className="bg-red-500 text-white text-xs">MR</Badge>);
    return badges;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="sport-specific-leaderboard">
      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Participant name"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                data-testid="input-participant-name"
              />
            </div>

            {(sportConfig.events || sportConfig.weightClasses) && (
              <div>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger data-testid="select-event">
                    <SelectValue placeholder="Select event/class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(sportConfig.events || sportConfig.weightClasses || []).map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Input
                placeholder={`Result (${sportConfig.unit} - decimal format)`}
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                type="number"
                step="0.01"
                data-testid="input-score"
              />
              <p className="text-xs text-gray-600 mt-1">
                {sportConfig.sortDirection === 'asc' ? '⬇️ Lower is better' : '⬆️ Higher is better'} • Use decimal format (e.g., 12.50 ft or 11.24 sec)
              </p>
            </div>

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

      {/* Results by Event */}
      {Object.entries(groupedEntries).map(([eventName, eventEntries]) => (
        <Card key={eventName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconComponent className="h-5 w-5" />
              {eventName}
              <Badge variant="outline">{eventEntries.length} participants</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <IconComponent className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No results recorded yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Place</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventEntries.map((entry) => (
                    <TableRow 
                      key={entry.id}
                      className={entry.placement <= 3 ? 'bg-gradient-to-r from-yellow-50 to-transparent' : ''}
                      data-testid={`entry-${entry.id}`}
                    >
                      <TableCell className="font-medium">
                        {getPlacementBadge(entry.placement)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.participantName}
                      </TableCell>
                      <TableCell className="font-mono text-lg">
                        {formatScore(entry)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {getRecordBadges(entry)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          entry.status === "completed" ? "default" : 
                          entry.status === "disqualified" ? "destructive" : "secondary"
                        }>
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
      ))}

      {entries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <IconComponent className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Results Yet</h3>
            <p className="text-gray-600 mb-4">
              Start recording participant results for {tournament.name}
            </p>
            <p className="text-sm text-gray-500">
              Use the form above to add times, scores, or measurements
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}