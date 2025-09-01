import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Trophy, Users, CheckCircle } from "lucide-react";

interface SportEvent {
  id: string;
  eventName: string;
  eventType: string;
  scoringMethod: string;
  measurementUnit: string;
  sortOrder: number;
}

interface SportEventsSelectorProps {
  sportId: string;
  sportName: string;
  onEventsSelected: (events: SportEvent[]) => void;
  initialSelected?: string[];
}

export default function SportEventsSelector({ 
  sportId, 
  sportName, 
  onEventsSelected, 
  initialSelected = [] 
}: SportEventsSelectorProps) {
  const [selectedEvents, setSelectedEvents] = useState<string[]>(initialSelected);
  const [selectAllMode, setSelectAllMode] = useState(false);

  // Fetch events for the selected sport
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['/api/sports', sportId, 'events'],
    enabled: !!sportId,
  });

  // Group events by type for better organization
  const groupedEvents = events.reduce((groups: Record<string, SportEvent[]>, event: SportEvent) => {
    const type = event.eventType || 'other';
    if (!groups[type]) groups[type] = [];
    groups[type].push(event);
    return groups;
  }, {});

  const eventTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
    swimming: { label: "Swimming Events", icon: Clock, color: "blue" },
    diving: { label: "Diving Events", icon: Trophy, color: "purple" },
    relay: { label: "Relay Events", icon: Users, color: "green" },
    other: { label: "Other Events", icon: CheckCircle, color: "gray" }
  };

  useEffect(() => {
    const selectedEventObjects = events.filter((event: SportEvent) => 
      selectedEvents.includes(event.id)
    );
    onEventsSelected(selectedEventObjects);
  }, [selectedEvents, events, onEventsSelected]);

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectAllMode) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(events.map((event: SportEvent) => event.id));
    }
    setSelectAllMode(!selectAllMode);
  };

  const handleQuickSelect = (eventIds: string[]) => {
    setSelectedEvents(eventIds);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Loading Events...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Events Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            No specific events found for {sportName}. The tournament will use a general format.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Quick selection presets for swimming
  const quickSelections = sportId === 'swimming-diving' ? [
    {
      label: "Sprint Events",
      events: events.filter((e: SportEvent) => 
        e.eventName.includes('50m') || e.eventName.includes('100m')
      ).map((e: SportEvent) => e.id)
    },
    {
      label: "Distance Events", 
      events: events.filter((e: SportEvent) => 
        e.eventName.includes('400m') || e.eventName.includes('800m') || e.eventName.includes('1500m')
      ).map((e: SportEvent) => e.id)
    },
    {
      label: "Individual Medley",
      events: events.filter((e: SportEvent) => 
        e.eventName.includes('Individual Medley')
      ).map((e: SportEvent) => e.id)
    },
    {
      label: "Relay Events",
      events: events.filter((e: SportEvent) => 
        e.eventName.includes('Relay')
      ).map((e: SportEvent) => e.id)
    }
  ] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Select {sportName} Events
          </span>
          <Badge variant="outline">
            {selectedEvents.length} selected
          </Badge>
        </CardTitle>
        
        {/* Quick selection buttons */}
        {quickSelections.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selectAllMode ? "Deselect All" : "Select All"}
            </Button>
            {quickSelections.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(preset.events)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.entries(groupedEvents).map(([eventType, typeEvents]) => {
          const typeConfig = eventTypeLabels[eventType] || eventTypeLabels.other;
          const IconComponent = typeConfig.icon;
          
          return (
            <div key={eventType}>
              <div className="flex items-center gap-2 mb-3">
                <IconComponent className={`w-4 h-4 text-${typeConfig.color}-600`} />
                <h3 className="font-medium text-sm">{typeConfig.label}</h3>
                <Separator className="flex-1" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typeEvents.map((event: SportEvent) => (
                  <div
                    key={event.id}
                    className={`
                      flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer
                      ${selectedEvents.includes(event.id) 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }
                    `}
                    onClick={() => handleEventToggle(event.id)}
                  >
                    <Checkbox
                      checked={selectedEvents.includes(event.id)}
                      onChange={() => handleEventToggle(event.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{event.eventName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.scoringMethod === 'time' ? 'Timed Event' : 'Scored Event'} • 
                        {event.measurementUnit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {selectedEvents.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium text-sm">
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <p className="text-green-700 text-xs mt-1">
              Participants will be able to register for these specific events. Each event will have its own results tracking.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}