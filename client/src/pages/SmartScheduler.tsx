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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ScheduleEvent {
  id: string;
  title: string;
  type: 'practice' | 'game' | 'banquet' | 'meeting' | 'tournament' | 'fundraiser' | 'awards' | 'community' | 'academic_competition' | 'deadline' | 'training' | 'other';
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
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [conflictAnalysis, setConflictAnalysis] = useState<ConflictDetection | null>(null);

  // Calculate date range for calendar view
  const getDateRange = () => {
    const date = new Date(selectedDate);
    const startDate = new Date(date);
    const endDate = new Date(date);
    
    if (viewMode === 'day') {
      // Same day
    } else if (viewMode === 'week') {
      startDate.setDate(date.getDate() - date.getDay()); // Start of week
      endDate.setDate(startDate.getDate() + 6); // End of week
    } else if (viewMode === 'month') {
      startDate.setDate(1); // Start of month
      endDate.setMonth(date.getMonth() + 1);
      endDate.setDate(0); // End of month
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Fetch calendar events using TanStack Query
  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useQuery({
    queryKey: ['/api/scheduling/calendar/view', viewMode, selectedDate, filterSport, filterType],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        viewType: viewMode === 'day' ? 'daily' : viewMode === 'week' ? 'weekly' : 'monthly',
        startDate,
        endDate
      });
      
      if (filterSport !== 'all') {
        params.append('sports', filterSport);
      }
      if (filterType !== 'all') {
        params.append('eventTypes', filterType);
      }
      
      const response = await fetch(`/api/scheduling/calendar/view?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }
      
      const result = await response.json();
      // Backend returns calendarView object with nested events array
      const rawEvents = result.data?.events || [];
      
      // Transform backend eventType field to frontend type field for consistent display
      return rawEvents.map((event: any) => ({
        ...event,
        type: event.eventType || event.type, // Map eventType → type for frontend compatibility
        title: event.eventTitle || event.title, // Also handle title mapping
        date: event.eventDate || event.date // Also handle date mapping
      }));
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  // Fetch schedule conflicts
  const { data: conflicts = [], isLoading: conflictsLoading } = useQuery({
    queryKey: ['/api/scheduling/conflicts', selectedDate],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();
      const params = new URLSearchParams({
        startDate,
        endDate,
        status: 'detected'
      });
      
      const response = await fetch(`/api/scheduling/conflicts?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conflicts');
      }
      
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!user,
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000 // 1 minute
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest('/api/scheduling/calendar/events', 'POST', eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/calendar/view'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/conflicts'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
    }
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // Transform frontend type field to backend eventType field if present
      const transformedUpdates = { ...updates };
      if (updates.type && !updates.eventType) {
        transformedUpdates.eventType = updates.type;
        delete transformedUpdates.type;
      }
      
      const response = await apiRequest(`/api/scheduling/calendar/events/${id}`, 'PUT', transformedUpdates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/calendar/view'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/conflicts'] });
      setSelectedEvent(null);
    }
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest(`/api/scheduling/calendar/events/${eventId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/calendar/view'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduling/conflicts'] });
    }
  });

  // Conflict detection mutation
  const detectConflictsMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest('/api/scheduling/conflicts/detect', 'POST', eventData);
      return response.json();
    },
    onSuccess: (result) => {
      setConflictAnalysis(result.data);
    }
  });

  // Handle event creation
  const handleCreateEvent = (eventData: any) => {
    // First detect conflicts
    detectConflictsMutation.mutate(eventData);
    // Then create the event
    createEventMutation.mutate({
      eventTitle: eventData.title,
      eventType: eventData.type,
      eventDate: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      description: eventData.description,
      visibility: eventData.isPublic ? 'public' : 'school',
      importanceLevel: 'normal'
    });
  };

  // Helper function to format events for display
  const formatEventForDisplay = (event: any): ScheduleEvent => {
    return {
      id: event.id,
      title: event.eventTitle || event.title,
      type: event.eventType || event.type,
      sport: event.sport || '',
      date: event.eventDate || event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      description: event.description || '',
      attendees: event.attendees || [],
      isRecurring: event.isRecurring || false,
      recurringPattern: event.recurringPattern,
      isPublic: event.visibility === 'public',
      requiresPermission: event.requiresPermission || false,
      createdBy: event.createdBy || '',
      status: event.status || 'scheduled',
      equipment: event.equipment || [],
      transportation: event.transportation || false,
      meals: event.meals || false,
      parentNotification: event.parentNotification || false,
      conflicts: event.conflicts || [],
      aiSuggestions: event.aiSuggestions || []
    };
  };

  // Format events for display
  const formattedEvents = events.map(formatEventForDisplay);

  // Set up conflict analysis from real data
  useEffect(() => {
    if (conflicts.length > 0) {
      setConflictAnalysis({
        hasConflicts: true,
        conflicts: conflicts.map((conflict: any) => ({
          type: conflict.conflictType,
          severity: conflict.severity,
          message: conflict.description || `${conflict.conflictType} detected`,
          affectedEvents: [conflict.event1Id, conflict.event2Id],
          suggestion: conflict.resolutionMethod || 'Review and resolve manually'
        }))
      });
    } else {
      setConflictAnalysis({ hasConflicts: false, conflicts: [] });
    }
  }, [conflicts]);

  const getEventsByDate = (date: string) => {
    return formattedEvents.filter(event => event.date === date);
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

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const CreateEventDialog = () => {
    const [formData, setFormData] = useState({
      title: '',
      type: '',
      sport: '',
      date: '',
      location: '',
      startTime: '',
      endTime: '',
      description: '',
      isRecurring: false,
      isPublic: false,
      parentNotification: false,
      transportation: false
    });

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.title || !formData.type || !formData.date || !formData.startTime || !formData.endTime) {
        console.error('Please fill in all required fields');
        return;
      }

      const eventData = {
        title: formData.title,
        type: formData.type,
        sport: formData.sport,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        description: formData.description,
        isRecurring: formData.isRecurring,
        isPublic: formData.isPublic,
        parentNotification: formData.parentNotification,
        transportation: formData.transportation
      };

      handleCreateEvent(eventData);
      
      // Reset form
      setFormData({
        title: '',
        type: '',
        sport: '',
        date: '',
        location: '',
        startTime: '',
        endTime: '',
        description: '',
        isRecurring: false,
        isPublic: false,
        parentNotification: false,
        transportation: false
      });
    };

    const handleInputChange = (field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-2 gap-4 space-y-4">
              <div className="col-span-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input 
                  id="title" 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter event title" 
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Event Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
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
                    <SelectItem value="academic_competition">Academic Competition</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sport">Sport (Optional)</Label>
                <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
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
                <Label htmlFor="date">Date *</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location" 
                />
              </div>
              
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input 
                  id="startTime" 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input 
                  id="endTime" 
                  type="time" 
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Event description..." 
                />
              </div>
              
              <div className="col-span-2 space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="recurring" 
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                  />
                  <Label htmlFor="recurring">Recurring Event</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="public" 
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                  <Label htmlFor="public">Public Event</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="parentNotify" 
                    checked={formData.parentNotification}
                    onCheckedChange={(checked) => handleInputChange('parentNotification', checked)}
                  />
                  <Label htmlFor="parentNotify">Notify Parents</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="transportation" 
                    checked={formData.transportation}
                    onCheckedChange={(checked) => handleInputChange('transportation', checked)}
                  />
                  <Label htmlFor="transportation">Transportation Required</Label>
                </div>
              </div>
              
              <div className="col-span-2 flex justify-end space-x-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

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
              <Button onClick={handleOpenCreateDialog} className="bg-green-600 hover:bg-green-700">
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
                    <SelectItem value="fundraiser">Fundraisers</SelectItem>
                    <SelectItem value="awards">Awards</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="academic_competition">Academic</SelectItem>
                    <SelectItem value="deadline">Deadlines</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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