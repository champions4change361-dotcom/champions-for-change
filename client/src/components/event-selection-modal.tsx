import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Timer, Ruler, TrendingUp, Waves, Users, Target } from "lucide-react";

interface EventSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sportType: string;
  onEventsSelected: (selectedEvents: any[]) => void;
}

interface SportEvent {
  id: string;
  name: string;
  category: string;
  scoringMethod: "time" | "distance" | "height" | "points";
  measurementUnit: string;
  description?: string;
  gender?: "men" | "women" | "mixed";
  distance?: string;
}

const TRACK_FIELD_EVENTS: SportEvent[] = [
  // Sprint Events
  { id: "100m", name: "100 Meter Dash", category: "sprints", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "200m", name: "200 Meter Dash", category: "sprints", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "400m", name: "400 Meter Dash", category: "sprints", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Middle Distance
  { id: "800m", name: "800 Meter Run", category: "middle-distance", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "1500m", name: "1500 Meter Run", category: "middle-distance", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "mile", name: "Mile Run", category: "middle-distance", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Long Distance
  { id: "3000m", name: "3000 Meter Run", category: "long-distance", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "5000m", name: "5000 Meter Run", category: "long-distance", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "10000m", name: "10000 Meter Run", category: "long-distance", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "marathon", name: "Marathon", category: "long-distance", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Hurdles
  { id: "110m-hurdles", name: "110m Hurdles", category: "hurdles", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "100m-hurdles", name: "100m Hurdles", category: "hurdles", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "400m-hurdles", name: "400m Hurdles", category: "hurdles", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Steeplechase
  { id: "3000m-steeplechase", name: "3000m Steeplechase", category: "steeplechase", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Relay Events
  { id: "4x100m-relay", name: "4x100m Relay", category: "relay", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "4x400m-relay", name: "4x400m Relay", category: "relay", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "4x800m-relay", name: "4x800m Relay", category: "relay", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Jump Events
  { id: "long-jump", name: "Long Jump", category: "jumping", scoringMethod: "distance", measurementUnit: "meters", description: "Longest distance wins" },
  { id: "triple-jump", name: "Triple Jump", category: "jumping", scoringMethod: "distance", measurementUnit: "meters", description: "Longest distance wins" },
  { id: "high-jump", name: "High Jump", category: "jumping", scoringMethod: "height", measurementUnit: "meters", description: "Highest height wins" },
  { id: "pole-vault", name: "Pole Vault", category: "jumping", scoringMethod: "height", measurementUnit: "meters", description: "Highest height wins" },
  
  // Throwing Events
  { id: "shot-put", name: "Shot Put", category: "throwing", scoringMethod: "distance", measurementUnit: "meters", description: "Longest distance wins" },
  { id: "discus", name: "Discus Throw", category: "throwing", scoringMethod: "distance", measurementUnit: "meters", description: "Longest distance wins" },
  { id: "hammer", name: "Hammer Throw", category: "throwing", scoringMethod: "distance", measurementUnit: "meters", description: "Longest distance wins" },
  { id: "javelin", name: "Javelin Throw", category: "throwing", scoringMethod: "distance", measurementUnit: "meters", description: "Longest distance wins" },
  
  // Combined Events
  { id: "decathlon", name: "Decathlon", category: "combined", scoringMethod: "points", measurementUnit: "points", description: "10 events combined scoring" },
  { id: "heptathlon", name: "Heptathlon", category: "combined", scoringMethod: "points", measurementUnit: "points", description: "7 events combined scoring" },
  { id: "pentathlon", name: "Pentathlon", category: "combined", scoringMethod: "points", measurementUnit: "points", description: "5 events combined scoring" }
];

const SWIMMING_EVENTS: SportEvent[] = [
  // Freestyle
  { id: "50m-freestyle", name: "50m Freestyle", category: "freestyle", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "100m-freestyle", name: "100m Freestyle", category: "freestyle", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "200m-freestyle", name: "200m Freestyle", category: "freestyle", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "400m-freestyle", name: "400m Freestyle", category: "freestyle", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "800m-freestyle", name: "800m Freestyle", category: "freestyle", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "1500m-freestyle", name: "1500m Freestyle", category: "freestyle", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Backstroke
  { id: "100m-backstroke", name: "100m Backstroke", category: "backstroke", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "200m-backstroke", name: "200m Backstroke", category: "backstroke", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Breaststroke
  { id: "100m-breaststroke", name: "100m Breaststroke", category: "breaststroke", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "200m-breaststroke", name: "200m Breaststroke", category: "breaststroke", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Butterfly
  { id: "100m-butterfly", name: "100m Butterfly", category: "butterfly", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "200m-butterfly", name: "200m Butterfly", category: "butterfly", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Individual Medley
  { id: "200m-im", name: "200m Individual Medley", category: "medley", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "400m-im", name: "400m Individual Medley", category: "medley", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Relay Events
  { id: "4x50m-freestyle-relay", name: "4x50m Freestyle Relay", category: "relay", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "4x100m-freestyle-relay", name: "4x100m Freestyle Relay", category: "relay", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "4x200m-freestyle-relay", name: "4x200m Freestyle Relay", category: "relay", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  { id: "4x100m-medley-relay", name: "4x100m Medley Relay", category: "relay", scoringMethod: "time", measurementUnit: "seconds", description: "Fastest time wins" },
  
  // Diving Events
  { id: "1m-springboard", name: "1m Springboard Diving", category: "diving", scoringMethod: "points", measurementUnit: "points", description: "Highest score wins" },
  { id: "3m-springboard", name: "3m Springboard Diving", category: "diving", scoringMethod: "points", measurementUnit: "points", description: "Highest score wins" },
  { id: "10m-platform", name: "10m Platform Diving", category: "diving", scoringMethod: "points", measurementUnit: "points", description: "Highest score wins" },
  { id: "synchronized-3m", name: "Synchronized 3m Springboard", category: "diving", scoringMethod: "points", measurementUnit: "points", description: "Highest score wins" },
  { id: "synchronized-10m", name: "Synchronized 10m Platform", category: "diving", scoringMethod: "points", measurementUnit: "points", description: "Highest score wins" }
];

export default function EventSelectionModal({ isOpen, onClose, sportType, onEventsSelected }: EventSelectionModalProps) {
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  
  const events = sportType.includes("Track & Field") ? TRACK_FIELD_EVENTS : 
                 sportType.includes("Swimming") ? SWIMMING_EVENTS : [];
  
  const categories = [...new Set(events.map(event => event.category))];
  
  const getEventIcon = (category: string) => {
    switch (category) {
      case "sprints":
      case "middle-distance":
      case "long-distance":
      case "hurdles":
      case "steeplechase":
        return <Timer className="w-4 h-4 text-blue-600" />;
      case "jumping":
        return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case "throwing":
        return <Target className="w-4 h-4 text-red-600" />;
      case "relay":
      case "combined":
        return <Users className="w-4 h-4 text-green-600" />;
      case "freestyle":
      case "backstroke":
      case "breaststroke":
      case "butterfly":
      case "medley":
        return <Waves className="w-4 h-4 text-blue-600" />;
      case "diving":
        return <TrendingUp className="w-4 h-4 text-cyan-600" />;
      default:
        return <Timer className="w-4 h-4" />;
    }
  };

  const handleEventToggle = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryEvents = events.filter(event => event.category === category);
    const newSelected = new Set(selectedEvents);
    const allSelected = categoryEvents.every(event => newSelected.has(event.id));
    
    if (allSelected) {
      // Unselect all in category
      categoryEvents.forEach(event => newSelected.delete(event.id));
    } else {
      // Select all in category
      categoryEvents.forEach(event => newSelected.add(event.id));
    }
    setSelectedEvents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      const allEventIds = events.map(event => event.id);
      setSelectedEvents(new Set(allEventIds));
    }
  };

  const handleConfirm = () => {
    const selectedEventsList = events.filter(event => selectedEvents.has(event.id));
    onEventsSelected(selectedEventsList);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Select {sportType} Events
          </DialogTitle>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-600">
              Choose which events to include in your tournament
            </p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-blue-600">
                {selectedEvents.size} events selected
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                data-testid="button-select-all-events"
              >
                {selectedEvents.size === events.length ? "Unselect All" : "Select All"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {categories.map((category) => {
            const categoryEvents = events.filter(event => event.category === category);
            const categorySelectedCount = categoryEvents.filter(event => selectedEvents.has(event.id)).length;
            
            return (
              <Card key={category} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg capitalize">
                      {getEventIcon(category)}
                      {category.replace("-", " ")} Events
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {categorySelectedCount}/{categoryEvents.length}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectAllInCategory(category)}
                        data-testid={`button-select-category-${category}`}
                      >
                        {categorySelectedCount === categoryEvents.length ? "Unselect All" : "Select All"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedEvents.has(event.id)
                            ? "bg-blue-50 border-blue-200"
                            : "bg-white border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleEventToggle(event.id)}
                        data-testid={`event-option-${event.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedEvents.has(event.id)}
                            onCheckedChange={() => handleEventToggle(event.id)}
                            data-testid={`checkbox-${event.id}`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-5">{event.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {event.scoringMethod}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {event.measurementUnit}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-600">
            {selectedEvents.size} events selected for your tournament
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} data-testid="button-cancel-events">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selectedEvents.size === 0}
              data-testid="button-confirm-events"
            >
              Add Selected Events ({selectedEvents.size})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}