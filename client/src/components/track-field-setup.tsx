import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, Square, Timer, Ruler, TrendingUp } from "lucide-react";
import { type SportEvent, type TournamentEvent } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

interface TrackFieldSetupProps {
  tournamentId: string;
  sportId: string;
  onComplete: (selectedEvents: string[]) => void;
}

export default function TrackFieldSetup({ tournamentId, sportId, onComplete }: TrackFieldSetupProps) {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [measurementSystem, setMeasurementSystem] = useState<"metric" | "imperial">("metric");

  const { data: sportEvents = [] } = useQuery<SportEvent[]>({
    queryKey: ["/api/sport-events", sportId],
  });

  const { data: tournamentEvents = [] } = useQuery<TournamentEvent[]>({
    queryKey: ["/api/tournament-events", tournamentId],
  });

  const addEventsMutation = useMutation({
    mutationFn: async (eventData: { eventIds: string[], measurementSystem: string }) => {
      const response = await fetch(`/api/tournaments/${tournamentId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to add events');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournament-events"] });
      onComplete(Array.from(selectedEvents));
    },
  });

  const toggleEvent = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const selectAllInCategory = (eventType: string) => {
    const categoryEvents = sportEvents.filter(e => e.eventType === eventType);
    const newSelected = new Set(selectedEvents);
    categoryEvents.forEach(event => newSelected.add(event.id));
    setSelectedEvents(newSelected);
  };

  const getEventIcon = (scoringMethod: string) => {
    switch (scoringMethod) {
      case 'time': return <Timer className="w-4 h-4" />;
      case 'distance': return <Ruler className="w-4 h-4" />;
      case 'height': return <TrendingUp className="w-4 h-4" />;
      default: return <Timer className="w-4 h-4" />;
    }
  };

  const getMeasurementLabel = (event: SportEvent) => {
    const unit = measurementSystem === "metric" ? 
      event.measurementUnit : 
      (event.measurementUnit === "meters" ? "feet" : 
       event.measurementUnit === "seconds" ? "seconds" : "feet");
    
    return `${event.scoringMethod} (${unit})`;
  };

  const groupedEvents = sportEvents.reduce((groups, event) => {
    const type = event.eventType;
    if (!groups[type]) groups[type] = [];
    groups[type].push(event);
    return groups;
  }, {} as Record<string, SportEvent[]>);

  const eventTypeLabels = {
    running: "Running Events",
    jumping: "Jumping Events", 
    throwing: "Throwing Events",
    combined: "Combined Events"
  };

  return (
    <div className="space-y-6" data-testid="track-field-setup">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Track & Field Event Selection
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose which events to include in your track meet. You can select individual events or entire categories.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Label htmlFor="measurement-system">Measurement System:</Label>
            <select 
              value={measurementSystem} 
              onChange={(e) => setMeasurementSystem(e.target.value as "metric" | "imperial")}
              className="w-48 h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="select-measurement-system"
            >
              <option value="metric">Metric (meters, seconds)</option>
              <option value="imperial">Imperial (feet, seconds)</option>
            </select>
          </div>

          <Tabs defaultValue="running" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              {Object.entries(eventTypeLabels).map(([type, label]) => (
                <TabsTrigger key={type} value={type}>{label}</TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedEvents).map(([eventType, events]) => (
              <TabsContent key={eventType} value={eventType} className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{eventTypeLabels[eventType as keyof typeof eventTypeLabels]}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => selectAllInCategory(eventType)}
                    data-testid={`button-select-all-${eventType}`}
                  >
                    Select All {eventTypeLabels[eventType as keyof typeof eventTypeLabels]}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {events.map((event) => (
                    <Card 
                      key={event.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedEvents.has(event.id) ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleEvent(event.id)}
                      data-testid={`event-card-${event.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {selectedEvents.has(event.id) ? 
                                <CheckSquare className="w-5 h-5 text-blue-600" /> : 
                                <Square className="w-5 h-5 text-gray-400" />
                              }
                              <h4 className="font-medium text-sm">{event.eventName}</h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {getEventIcon(event.scoringMethod)}
                              <span>{getMeasurementLabel(event)}</span>
                            </div>
                            {event.gender !== 'mixed' && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {event.gender}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex items-center justify-between mt-8 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Selected Events: {selectedEvents.size}</p>
              <p className="text-sm text-gray-600">
                Events will use {measurementSystem === 'metric' ? 'metric' : 'imperial'} measurements
              </p>
            </div>
            <Button 
              onClick={() => addEventsMutation.mutate({ 
                eventIds: Array.from(selectedEvents), 
                measurementSystem 
              })}
              disabled={selectedEvents.size === 0 || addEventsMutation.isPending}
              data-testid="button-add-selected-events"
            >
              {addEventsMutation.isPending ? 'Adding Events...' : `Add ${selectedEvents.size} Events`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}