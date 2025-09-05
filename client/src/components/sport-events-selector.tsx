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

  // Enhanced quick selection presets for all sports
  const getQuickSelectionsForSport = (sportName: string): Array<{label: string, events: string[], description?: string}> => {
    const sportLower = sportName.toLowerCase();
    
    // Swimming & Diving presets
    if (sportLower.includes('swimming') || sportLower.includes('diving')) {
      return [
        {
          label: "Sprint Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('50m') || e.eventName.includes('100m')
          ).map((e: SportEvent) => e.id),
          description: "Short, high-intensity races"
        },
        {
          label: "Distance Events", 
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('400m') || e.eventName.includes('800m') || e.eventName.includes('1500m')
          ).map((e: SportEvent) => e.id),
          description: "Endurance races"
        },
        {
          label: "Individual Medley",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Individual Medley')
          ).map((e: SportEvent) => e.id),
          description: "All four strokes combined"
        },
        {
          label: "Relay Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Relay')
          ).map((e: SportEvent) => e.id),
          description: "Team races"
        },
        {
          label: "Diving Only",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Diving')
          ).map((e: SportEvent) => e.id),
          description: "Platform and springboard diving"
        }
      ];
    }
    
    // Track & Field presets
    if (sportLower.includes('track') || sportLower.includes('field')) {
      return [
        {
          label: "Sprint Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('100m') || e.eventName.includes('200m') || e.eventName.includes('400m')
          ).map((e: SportEvent) => e.id),
          description: "Short distance running"
        },
        {
          label: "Distance Running",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('800m') || e.eventName.includes('1500m') || e.eventName.includes('3000m') || e.eventName.includes('5000m')
          ).map((e: SportEvent) => e.id),
          description: "Middle and long distance"
        },
        {
          label: "Hurdle Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Hurdles')
          ).map((e: SportEvent) => e.id),
          description: "Hurdle racing events"
        },
        {
          label: "Jumping Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Jump') || e.eventName.includes('Vault')
          ).map((e: SportEvent) => e.id),
          description: "Field jumping competitions"
        },
        {
          label: "Throwing Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Shot') || e.eventName.includes('Discus') || e.eventName.includes('Javelin') || e.eventName.includes('Hammer')
          ).map((e: SportEvent) => e.id),
          description: "Field throwing competitions"
        },
        {
          label: "Relay Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Relay')
          ).map((e: SportEvent) => e.id),
          description: "Team running events"
        }
      ];
    }
    
    // Wrestling presets
    if (sportLower.includes('wrestling')) {
      return [
        {
          label: "Lower Weights",
          events: events.filter((e: SportEvent) => {
            const weight = parseInt(e.eventName.split(' ')[0]);
            return weight <= 132;
          }).map((e: SportEvent) => e.id),
          description: "106-132 lbs weight classes"
        },
        {
          label: "Middle Weights",
          events: events.filter((e: SportEvent) => {
            const weight = parseInt(e.eventName.split(' ')[0]);
            return weight > 132 && weight <= 170;
          }).map((e: SportEvent) => e.id),
          description: "138-170 lbs weight classes"
        },
        {
          label: "Upper Weights",
          events: events.filter((e: SportEvent) => {
            const weight = parseInt(e.eventName.split(' ')[0]);
            return weight > 170;
          }).map((e: SportEvent) => e.id),
          description: "182-285 lbs weight classes"
        }
      ];
    }
    
    // Gymnastics presets
    if (sportLower.includes('gymnastics')) {
      return [
        {
          label: "Women's Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Women') || e.eventName.includes('Uneven') || e.eventName.includes('Beam')
          ).map((e: SportEvent) => e.id),
          description: "Women's artistic gymnastics"
        },
        {
          label: "Men's Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Men') || e.eventName.includes('Pommel') || e.eventName.includes('Rings') || e.eventName.includes('Parallel')
          ).map((e: SportEvent) => e.id),
          description: "Men's artistic gymnastics"
        },
        {
          label: "All-Around",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('All-Around')
          ).map((e: SportEvent) => e.id),
          description: "Combined apparatus competition"
        }
      ];
    }
    
    // Golf presets
    if (sportLower.includes('golf')) {
      return [
        {
          label: "Individual Play",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Individual')
          ).map((e: SportEvent) => e.id),
          description: "Solo competition formats"
        },
        {
          label: "Team Formats",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Scramble') || e.eventName.includes('Best Ball') || e.eventName.includes('Alternate')
          ).map((e: SportEvent) => e.id),
          description: "Team-based golf formats"
        }
      ];
    }
    
    // Basketball presets
    if (sportLower.includes('basketball')) {
      return [
        {
          label: "Game Competition",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Tournament')
          ).map((e: SportEvent) => e.id),
          description: "Full game competitions"
        },
        {
          label: "Skills Contests",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Contest')
          ).map((e: SportEvent) => e.id),
          description: "Individual skill competitions"
        }
      ];
    }
    
    // Academic/STEM presets
    if (sportLower.includes('academic') || sportLower.includes('stem')) {
      return [
        {
          label: "STEM Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Science') || e.eventName.includes('Math') || e.eventName.includes('Engineering') || e.eventName.includes('Programming')
          ).map((e: SportEvent) => e.id),
          description: "Science, Technology, Engineering, Math"
        },
        {
          label: "Competition Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Olympiad') || e.eventName.includes('Competition') || e.eventName.includes('Challenge')
          ).map((e: SportEvent) => e.id),
          description: "Competitive academic contests"
        }
      ];
    }
    
    // Speech & Debate presets
    if (sportLower.includes('speech') || sportLower.includes('debate')) {
      return [
        {
          label: "Debate Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Debate')
          ).map((e: SportEvent) => e.id),
          description: "Argumentative competitions"
        },
        {
          label: "Speaking Events",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Speaking') || e.eventName.includes('Oratory')
          ).map((e: SportEvent) => e.id),
          description: "Public speaking competitions"
        },
        {
          label: "Interpretation",
          events: events.filter((e: SportEvent) => 
            e.eventName.includes('Interpretation')
          ).map((e: SportEvent) => e.id),
          description: "Performance interpretation events"
        }
      ];
    }
    
    // Default return empty if no specific presets
    return [];
  };

  const quickSelections = getQuickSelectionsForSport(sportName);

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
        
        {/* Enhanced Quick selection buttons with descriptions */}
        {quickSelections.length > 0 && (
          <div className="space-y-3 mt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectAllMode ? "Deselect All" : "Select All"}
              </Button>
              <span className="text-xs text-gray-500">Quick selections for {sportName}:</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {quickSelections.map((preset, index) => (
                <div key={index} className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(preset.events)}
                    className="w-full text-xs p-3 h-auto flex flex-col items-start gap-1 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <span className="font-medium">{preset.label}</span>
                    {preset.description && (
                      <span className="text-xs text-gray-500 text-left">{preset.description}</span>
                    )}
                    <span className="text-xs text-blue-600">
                      {preset.events.length} event{preset.events.length !== 1 ? 's' : ''}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
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