import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, Plus, AlertTriangle, Clock, Users, MapPin, Trophy, Utensils, Star, Edit, Trash2, CheckCircle, XCircle, Bot } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'practice' | 'game' | 'banquet' | 'meeting' | 'tournament' | 'fundraiser' | 'awards' | 'community';
  sport?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  attendees: string[];
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringUntil?: string;
  opponent?: string;
  homeAway?: 'home' | 'away';
  isPublic: boolean;
  requiresPermission: boolean;
  createdBy: string;
  conflicts?: string[];
  aiSuggestions?: string[];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  equipment?: string[];
  transportation?: boolean;
  meals?: boolean;
  parentNotification: boolean;
}

interface ConflictDetection {
  hasConflicts: boolean;
  conflicts: {
    type: 'time_overlap' | 'facility_double_book' | 'athlete_overload' | 'equipment_conflict' | 'transportation_conflict';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    affectedEvents: string[];
    suggestion: string;
  }[];
}

export default function SmartScheduler() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [conflictAnalysis, setConflictAnalysis] = useState<ConflictDetection | null>(null);

  // Sample events with realistic CCISD scheduling
  useEffect(() => {
    const sampleEvents: ScheduleEvent[] = [
      {
        id: '1',
        title: 'Football Practice',
        type: 'practice',
        sport: 'Football',
        date: '2024-08-21',
        startTime: '15:30',
        endTime: '17:30',
        location: 'Miller Stadium Practice Field',
        description: 'Conditioning and skill drills',
        attendees: ['Varsity Team', 'JV Team'],
        isRecurring: true,
        recurringPattern: 'daily',
        isPublic: false,
        requiresPermission: false,
        createdBy: 'Coach Thompson',
        status: 'scheduled',
        equipment: ['Practice Jerseys', 'Footballs', 'Cones', 'Water'],
        transportation: false,
        meals: false,
        parentNotification: false
      },
      {
        id: '2',
        title: 'Miller vs Carroll - Varsity Football',
        type: 'game',
        sport: 'Football',
        date: '2024-08-23',
        startTime: '19:00',
        endTime: '22:00',
        location: 'Miller Stadium',
        description: 'Season opener - Homecoming game',
        attendees: ['Varsity Team', 'Band', 'Cheerleaders'],
        opponent: 'Carroll High School',
        homeAway: 'home',
        isRecurring: false,
        isPublic: true,
        requiresPermission: false,
        createdBy: 'Athletic Director',
        status: 'confirmed',
        equipment: ['Game Uniforms', 'Helmets', 'Pads', 'Footballs'],
        transportation: false,
        meals: true,
        parentNotification: true,
        aiSuggestions: ['Consider adding extra security for rivalry game', 'Coordinate with band for halftime show']
      },
      {
        id: '3',
        title: 'Athletic Banquet',
        type: 'banquet',
        date: '2024-08-25',
        startTime: '18:00',
        endTime: '21:00',
        location: 'Miller High School Cafeteria',
        description: 'Fall Sports Kickoff Banquet - All sports teams and families invited',
        attendees: ['All Athletes', 'Parents', 'Staff', 'Coaches'],
        isRecurring: false,
        isPublic: true,
        requiresPermission: true,
        createdBy: 'Athletic Director',
        status: 'scheduled',
        transportation: false,
        meals: true,
        parentNotification: true,
        conflicts: ['Cafeteria already reserved for band concert'],
        aiSuggestions: ['Move to gymnasium due to cafeteria conflict', 'Coordinate catering with increased attendance']
      },
      {
        id: '4',
        title: 'Volleyball Practice',
        type: 'practice',
        sport: 'Volleyball',
        date: '2024-08-21',
        startTime: '16:00',
        endTime: '18:00',
        location: 'Miller Gymnasium',
        description: 'Serve and spike drills',
        attendees: ['Varsity Team', 'JV Team'],
        isRecurring: true,
        recurringPattern: 'daily',
        isPublic: false,
        requiresPermission: false,
        createdBy: 'Coach Martinez',
        status: 'scheduled',
        equipment: ['Volleyballs', 'Net', 'Knee Pads'],
        transportation: false,
        meals: false,
        parentNotification: false
      },
      {
        id: '5',
        title: 'Booster Club Meeting',
        type: 'meeting',
        date: '2024-08-22',
        startTime: '19:00',
        endTime: '20:30',
        location: 'Miller High School Library',
        description: 'Monthly booster club meeting - Fundraising discussion',
        attendees: ['Booster Club Members', 'Athletic Director'],
        isRecurring: true,
        recurringPattern: 'monthly',
        isPublic: true,
        requiresPermission: false,
        createdBy: 'Booster Club President',
        status: 'scheduled',
        transportation: false,
        meals: false,
        parentNotification: true
      },
      {
        id: '6',
        title: 'Cross Country at Ray Invitational',
        type: 'tournament',
        sport: 'Cross Country',
        date: '2024-08-24',
        startTime: '08:00',
        endTime: '14:00',
        location: 'Ray High School Cross Country Course',
        description: 'District invitational meet',
        attendees: ['Cross Country Team'],
        opponent: 'Multiple Schools',
        homeAway: 'away',
        isRecurring: false,
        isPublic: true,
        requiresPermission: true,
        createdBy: 'Coach Wilson',
        status: 'scheduled',
        equipment: ['Running Spikes', 'Team Tent', 'Coolers'],
        transportation: true,
        meals: true,
        parentNotification: true,
        aiSuggestions: ['Weather forecast shows rain - bring team tent', 'Schedule bus departure 30 minutes earlier for traffic']
      }
    ];
    
    setEvents(sampleEvents);
    
    // Simulate AI conflict detection
    const analysis: ConflictDetection = {
      hasConflicts: true,
      conflicts: [
        {
          type: 'facility_double_book',
          severity: 'high',
          message: 'Cafeteria double-booked: Athletic Banquet conflicts with Band Concert',
          affectedEvents: ['3'],
          suggestion: 'Move Athletic Banquet to Gymnasium or reschedule'
        },
        {
          type: 'athlete_overload',
          severity: 'medium',
          message: 'Football players have 3 events in 4 days - potential fatigue risk',
          affectedEvents: ['1', '2'],
          suggestion: 'Consider lighter practice on day before game'
        },
        {
          type: 'transportation_conflict',
          severity: 'low',
          message: 'Bus #3 requested for Cross Country same day as potential makeup game',
          affectedEvents: ['6'],
          suggestion: 'Reserve backup transportation or confirm game schedule'
        }
      ]
    };
    
    setConflictAnalysis(analysis);
  }, []);

  const getEventsByDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const getEventTypeIcon = (type: string) => {
    const iconMap = {
      practice: Clock,
      game: Trophy,
      banquet: Utensils,
      meeting: Users,
      tournament: Star,
      fundraiser: MapPin,
      awards: Star,
      community: Users
    };
    
    const IconComponent = iconMap[type as keyof typeof iconMap] || Calendar;
    return <IconComponent className="w-4 h-4" />;
  };

  const getEventTypeBadge = (type: string) => {
    const typeConfig = {
      practice: { color: 'bg-blue-900/50 text-blue-300 border border-blue-600/50', text: 'Practice' },
      game: { color: 'bg-green-900/50 text-green-300 border border-green-600/50', text: 'Game' },
      banquet: { color: 'bg-purple-900/50 text-purple-300 border border-purple-600/50', text: 'Banquet' },
      meeting: { color: 'bg-slate-700/50 text-slate-300 border border-slate-600/50', text: 'Meeting' },
      tournament: { color: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/50', text: 'Tournament' },
      fundraiser: { color: 'bg-pink-900/50 text-pink-300 border border-pink-600/50', text: 'Fundraiser' },
      awards: { color: 'bg-orange-900/50 text-orange-300 border border-orange-600/50', text: 'Awards' },
      community: { color: 'bg-indigo-900/50 text-indigo-300 border border-indigo-600/50', text: 'Community' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    const statusMap = {
      scheduled: Clock,
      confirmed: CheckCircle,
      cancelled: XCircle,
      completed: CheckCircle
    };
    
    const IconComponent = statusMap[status as keyof typeof statusMap];
    const colorClass = status === 'confirmed' || status === 'completed' ? 'text-green-500' :
                     status === 'cancelled' ? 'text-red-500' : 'text-yellow-500';
    
    return <IconComponent className={`w-4 h-4 ${colorClass}`} />;
  };

  const getConflictSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { color: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/50', text: 'Low Priority' },
      medium: { color: 'bg-orange-900/50 text-orange-300 border border-orange-600/50', text: 'Medium Priority' },
      high: { color: 'bg-red-900/50 text-red-300 border border-red-600/50', text: 'High Priority' },
      critical: { color: 'bg-red-600 text-white border border-red-500', text: 'CRITICAL' }
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const generateWeekDates = (startDate: string) => {
    const start = new Date(startDate);
    const dates = [];
    
    // Start from Monday of the week
    const monday = new Date(start);
    monday.setDate(start.getDate() - start.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const weekDates = generateWeekDates(selectedDate);

  const filteredEvents = events.filter(event => {
    const sportMatch = filterSport === 'all' || event.sport === filterSport;
    const typeMatch = filterType === 'all' || event.type === filterType;
    return sportMatch && typeMatch;
  });

  const handleCreateEvent = () => {
    setIsCreateDialogOpen(true);
  };

  const CreateEventDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 space-y-4">
          <div className="col-span-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" placeholder="Enter event title" />
          </div>
          
          <div>
            <Label htmlFor="type">Event Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="game">Game</SelectItem>
                <SelectItem value="banquet">Banquet</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
                <SelectItem value="fundraiser">Fundraiser</SelectItem>
                <SelectItem value="awards">Awards Ceremony</SelectItem>
                <SelectItem value="community">Community Event</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="sport">Sport (Optional)</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Football">Football</SelectItem>
                <SelectItem value="Volleyball">Volleyball</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Track">Track & Field</SelectItem>
                <SelectItem value="Cross Country">Cross Country</SelectItem>
                <SelectItem value="Baseball">Baseball</SelectItem>
                <SelectItem value="Soccer">Soccer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" />
          </div>
          
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Enter location" />
          </div>
          
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" />
          </div>
          
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" />
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Event description..." />
          </div>
          
          <div className="col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <Switch id="recurring" />
              <Label htmlFor="recurring">Recurring Event</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="public" />
              <Label htmlFor="public">Public Event</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="parentNotify" />
              <Label htmlFor="parentNotify">Notify Parents</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="transportation" />
              <Label htmlFor="transportation">Transportation Required</Label>
            </div>
          </div>
          
          <div className="col-span-2 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Create Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Back to Dashboard</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Smart Scheduler</h1>
                <p className="text-xs text-green-600 dark:text-green-400">AI-Powered Athletic Scheduling</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={handleCreateEvent} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Conflict Analysis */}
        {conflictAnalysis?.hasConflicts && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <Bot className="w-5 h-5" />
                <span>AI Conflict Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conflictAnalysis.conflicts.map((conflict, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-orange-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-gray-900">{conflict.message}</span>
                      </div>
                      {getConflictSeverityBadge(conflict.severity)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>AI Suggestion:</strong> {conflict.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Schedule View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
                
                <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'day' | 'week' | 'month')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-4">
                <Select value={filterSport} onValueChange={setFilterSport}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Volleyball">Volleyball</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Track">Track & Field</SelectItem>
                    <SelectItem value="Cross Country">Cross Country</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="practice">Practices</SelectItem>
                    <SelectItem value="game">Games</SelectItem>
                    <SelectItem value="banquet">Banquets</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="tournament">Tournaments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Week View Calendar */}
        {viewMode === 'week' && (
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                  <div key={day} className="border rounded-lg p-2 min-h-96">
                    <div className="text-sm font-medium text-gray-900 mb-2 text-center">
                      {day}
                      <div className="text-xs text-gray-500">
                        {new Date(weekDates[index]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {getEventsByDate(weekDates[index])
                        .filter(event => {
                          const sportMatch = filterSport === 'all' || event.sport === filterSport;
                          const typeMatch = filterType === 'all' || event.type === filterType;
                          return sportMatch && typeMatch;
                        })
                        .map((event) => (
                        <div 
                          key={event.id} 
                          className={`p-2 rounded border-l-4 text-xs cursor-pointer hover:shadow-md transition-shadow ${
                            event.conflicts?.length ? 'border-l-red-500 bg-red-50' : 
                            event.type === 'game' ? 'border-l-green-500 bg-green-50' :
                            event.type === 'practice' ? 'border-l-blue-500 bg-blue-50' :
                            'border-l-purple-500 bg-purple-50'
                          }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            {getEventTypeIcon(event.type)}
                            {getStatusIcon(event.status)}
                          </div>
                          
                          <div className="font-medium text-gray-900 mb-1 truncate">
                            {event.title}
                          </div>
                          
                          <div className="text-gray-600 mb-1">
                            {event.startTime} - {event.endTime}
                          </div>
                          
                          <div className="text-gray-500 truncate">
                            {event.location}
                          </div>
                          
                          {event.sport && (
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {event.sport}
                              </Badge>
                            </div>
                          )}
                          
                          {event.conflicts && event.conflicts.length > 0 && (
                            <div className="mt-1 flex items-center">
                              <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                              <span className="text-red-600 text-xs">Conflict</span>
                            </div>
                          )}
                          
                          {event.aiSuggestions && event.aiSuggestions.length > 0 && (
                            <div className="mt-1 flex items-center">
                              <Bot className="w-3 h-3 text-blue-500 mr-1" />
                              <span className="text-blue-600 text-xs">AI Tips</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Event Details Dialog */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getEventTypeIcon(selectedEvent.type)}
                  <span>{selectedEvent.title}</span>
                  {getEventTypeBadge(selectedEvent.type)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                    <p className="text-gray-900">
                      {new Date(selectedEvent.date).toLocaleDateString()} | {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Location</Label>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                  
                  {selectedEvent.sport && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Sport</Label>
                      <p className="text-gray-900">{selectedEvent.sport}</p>
                    </div>
                  )}
                  
                  {selectedEvent.opponent && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Opponent</Label>
                      <p className="text-gray-900">{selectedEvent.opponent} ({selectedEvent.homeAway})</p>
                    </div>
                  )}
                </div>
                
                {selectedEvent.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-gray-900">{selectedEvent.description}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Attendees</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <Badge key={index} variant="secondary">{attendee}</Badge>
                    ))}
                  </div>
                </div>
                
                {selectedEvent.equipment && selectedEvent.equipment.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Required Equipment</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedEvent.equipment.map((item, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-800">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.aiSuggestions && selectedEvent.aiSuggestions.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800 flex items-center mb-2">
                      <Bot className="w-4 h-4 mr-1" />
                      AI Recommendations
                    </Label>
                    <ul className="space-y-1">
                      {selectedEvent.aiSuggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-blue-700">• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedEvent.conflicts && selectedEvent.conflicts.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <Label className="text-sm font-medium text-red-800 flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Scheduling Conflicts
                    </Label>
                    <ul className="space-y-1">
                      {selectedEvent.conflicts.map((conflict, index) => (
                        <li key={index} className="text-sm text-red-700">• {conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Event
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Event
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>

      <CreateEventDialog />
    </div>
  );
}