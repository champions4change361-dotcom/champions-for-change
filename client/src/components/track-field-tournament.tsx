import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, Ruler, TrendingUp, Trophy, Plus, Edit2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface TrackFieldTournamentProps {
  tournamentId: string;
  tournamentName: string;
}

interface EventResult {
  id: string;
  participantName: string;
  teamName?: string;
  bibNumber?: string;
  result: number;
  placement?: number;
  isDisqualified?: boolean;
  notes?: string;
  measurementUnit: string;
  scoringMethod: string;
}

interface TrackEvent {
  id: string;
  eventName: string;
  eventType: string;
  scoringMethod: string;
  measurementUnit: string;
  results: EventResult[];
}

export default function TrackFieldTournament({ tournamentId, tournamentName }: TrackFieldTournamentProps) {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [newParticipant, setNewParticipant] = useState({
    participantName: "",
    teamName: "",
    bibNumber: "",
    result: "",
  });
  const [measurementSystem, setMeasurementSystem] = useState<"metric" | "imperial">("metric");

  // Mock track events for demonstration
  const trackEvents: TrackEvent[] = [
    {
      id: "100m",
      eventName: "100 Meter Dash",
      eventType: "running", 
      scoringMethod: "time",
      measurementUnit: "seconds",
      results: [
        { id: "1", participantName: "Sarah Johnson", teamName: "Lightning Bolts", bibNumber: "1", result: 11.24, placement: 1, measurementUnit: "seconds", scoringMethod: "time" },
        { id: "2", participantName: "Michael Chen", teamName: "Speed Demons", bibNumber: "2", result: 11.45, placement: 2, measurementUnit: "seconds", scoringMethod: "time" },
        { id: "3", participantName: "Emma Williams", teamName: "Lightning Bolts", bibNumber: "3", result: 11.67, placement: 3, measurementUnit: "seconds", scoringMethod: "time" },
      ]
    },
    {
      id: "shotput",
      eventName: "Shot Put",
      eventType: "throwing",
      scoringMethod: "distance", 
      measurementUnit: "meters",
      results: [
        { id: "4", participantName: "Marcus Thompson", teamName: "Power Throwers", bibNumber: "15", result: 16.24, placement: 1, measurementUnit: "meters", scoringMethod: "distance" },
        { id: "5", participantName: "Lisa Rodriguez", teamName: "Field Stars", bibNumber: "16", result: 14.89, placement: 2, measurementUnit: "meters", scoringMethod: "distance" },
        { id: "6", participantName: "Jake Miller", teamName: "Power Throwers", bibNumber: "17", result: 13.76, placement: 3, measurementUnit: "meters", scoringMethod: "distance" },
      ]
    },
    {
      id: "highjump", 
      eventName: "High Jump",
      eventType: "jumping",
      scoringMethod: "height",
      measurementUnit: "meters", 
      results: [
        { id: "7", participantName: "Alex Rivera", teamName: "High Flyers", bibNumber: "25", result: 2.15, placement: 1, measurementUnit: "meters", scoringMethod: "height" },
        { id: "8", participantName: "Jordan Smith", teamName: "Jump Squad", bibNumber: "26", result: 2.08, placement: 2, measurementUnit: "meters", scoringMethod: "height" },
        { id: "9", participantName: "Taylor Brown", teamName: "High Flyers", bibNumber: "27", result: 2.01, placement: 3, measurementUnit: "meters", scoringMethod: "height" },
      ]
    },
    {
      id: "discus",
      eventName: "Discus Throw", 
      eventType: "throwing",
      scoringMethod: "distance",
      measurementUnit: "meters",
      results: [
        { id: "10", participantName: "David Wilson", teamName: "Disc Masters", bibNumber: "35", result: 52.34, placement: 1, measurementUnit: "meters", scoringMethod: "distance" },
        { id: "11", participantName: "Rachel Green", teamName: "Field Stars", bibNumber: "36", result: 48.67, placement: 2, measurementUnit: "meters", scoringMethod: "distance" },
        { id: "12", participantName: "Chris Anderson", teamName: "Disc Masters", bibNumber: "37", result: 45.23, placement: 3, measurementUnit: "meters", scoringMethod: "distance" },
      ]
    }
  ];

  const getEventIcon = (scoringMethod: string) => {
    switch (scoringMethod) {
      case 'time': return <Timer className="w-4 h-4 text-blue-600" />;
      case 'distance': return <Ruler className="w-4 h-4 text-green-600" />;
      case 'height': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      default: return <Timer className="w-4 h-4" />;
    }
  };

  const formatResult = (result: number, scoringMethod: string, unit: string) => {
    if (scoringMethod === 'time') {
      return `${result.toFixed(2)}s`;
    } else if (scoringMethod === 'distance' || scoringMethod === 'height') {
      const convertedValue = measurementSystem === 'imperial' && unit === 'meters' 
        ? (result * 3.28084).toFixed(2) + 'ft' 
        : result.toFixed(2) + 'm';
      return convertedValue;
    }
    return result.toString();
  };

  const getPlacementColor = (placement?: number) => {
    switch (placement) {
      case 1: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getPlacementIcon = (placement?: number) => {
    if (placement <= 3) {
      return <Trophy className="w-4 h-4" />;
    }
    return null;
  };

  const calculateTeamScores = () => {
    const teamScores: Record<string, number> = {};
    
    trackEvents.forEach(event => {
      event.results.forEach(result => {
        if (result.teamName && result.placement && result.placement <= 8) {
          if (!teamScores[result.teamName]) teamScores[result.teamName] = 0;
          // Standard track scoring: 10-8-6-5-4-3-2-1 for places 1-8
          const points = [10, 8, 6, 5, 4, 3, 2, 1][result.placement - 1] || 0;
          teamScores[result.teamName] += points;
        }
      });
    });

    return Object.entries(teamScores)
      .sort(([,a], [,b]) => b - a)
      .map(([team, score], index) => ({ team, score, rank: index + 1 }));
  };

  const addParticipant = (eventId: string) => {
    // This would normally call an API to add a participant
    console.log("Adding participant to event", eventId, newParticipant);
    setNewParticipant({ participantName: "", teamName: "", bibNumber: "", result: "" });
  };

  return (
    <div className="space-y-6" data-testid="track-field-tournament">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{tournamentName}</h2>
          <p className="text-gray-600">Track & Field Meet Management</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={measurementSystem} onValueChange={(value: "metric" | "imperial") => setMeasurementSystem(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric</SelectItem>
              <SelectItem value="imperial">Imperial</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="team-scores">Team Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trackEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getEventIcon(event.scoringMethod)}
                    {event.eventName}
                    <Badge variant="outline" className="ml-auto">
                      {event.eventType}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.results.slice(0, 3).map((result, index) => (
                      <div key={result.id} className={`p-3 rounded-lg border ${getPlacementColor(result.placement)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getPlacementIcon(result.placement)}
                            <div>
                              <p className="font-medium">{result.participantName}</p>
                              <p className="text-sm opacity-75">
                                {result.teamName} • Bib #{result.bibNumber}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {formatResult(result.result, event.scoringMethod, event.measurementUnit)}
                            </p>
                            <p className="text-sm opacity-75">
                              {result.placement ? `#${result.placement}` : 'Unplaced'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => setSelectedEvent(event.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Participant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboards" className="mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {trackEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getEventIcon(event.scoringMethod)}
                    {event.eventName} Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.results.map((result, index) => (
                      <div key={result.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                            {result.placement || index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{result.participantName}</p>
                            <p className="text-xs text-gray-600">{result.teamName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">
                            {formatResult(result.result, event.scoringMethod, event.measurementUnit)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="team-scores" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Championship Standings</CardTitle>
              <p className="text-sm text-gray-600">
                Scoring: 10-8-6-5-4-3-2-1 points for places 1st-8th in each event
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {calculateTeamScores().map((team) => (
                  <div key={team.team} className={`p-4 rounded-lg border ${
                    team.rank === 1 ? 'bg-yellow-50 border-yellow-200' :
                    team.rank === 2 ? 'bg-gray-50 border-gray-200' :
                    team.rank === 3 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          team.rank === 1 ? 'bg-yellow-500 text-white' :
                          team.rank === 2 ? 'bg-gray-500 text-white' :
                          team.rank === 3 ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
                        }`}>
                          {team.rank}
                        </div>
                        <div>
                          <p className="font-semibold">{team.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{team.score}</p>
                        <p className="text-xs text-gray-600">points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedEvent && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">
              Add Participant to {trackEvents.find(e => e.id === selectedEvent)?.eventName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="participant-name">Participant Name</Label>
                <Input
                  id="participant-name"
                  value={newParticipant.participantName}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, participantName: e.target.value }))}
                  placeholder="Enter athlete name"
                />
              </div>
              <div>
                <Label htmlFor="team-name">Team Name</Label>
                <Input
                  id="team-name"
                  value={newParticipant.teamName}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, teamName: e.target.value }))}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="bib-number">Bib Number</Label>
                <Input
                  id="bib-number"
                  value={newParticipant.bibNumber}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, bibNumber: e.target.value }))}
                  placeholder="Athlete number"
                />
              </div>
              <div>
                <Label htmlFor="result">
                  Result ({trackEvents.find(e => e.id === selectedEvent)?.scoringMethod})
                </Label>
                <Input
                  id="result"
                  value={newParticipant.result}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, result: e.target.value }))}
                  placeholder="Enter result (decimal format)"
                  type="number"
                  step="0.01"
                />
                <p className="text-xs text-gray-600 mt-1">
                  {trackEvents.find(e => e.id === selectedEvent)?.scoringMethod === 'time' 
                    ? '⬇️ Lower time is better' 
                    : '⬆️ Higher distance/height is better'} • Use decimal format (e.g., 12.50 ft or 11.24 sec)
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => addParticipant(selectedEvent)}>
                Add Participant
              </Button>
              <Button variant="outline" onClick={() => setSelectedEvent("")}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}