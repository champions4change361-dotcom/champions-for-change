import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Clock, 
  Users, 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Navigation,
  Timer,
  Target,
  Zap,
  Bell,
  MapPinned,
  User,
  Calendar,
  Phone,
  MessageCircle,
  Camera,
  Heart,
  Star,
  Flag,
  Activity
} from 'lucide-react';

interface AthleteEvent {
  id: string;
  athleteName: string;
  athleteGrade: string;
  eventName: string;
  eventType: 'track' | 'field';
  venue: string;
  field: string;
  scheduledTime: string;
  checkInTime?: string;
  warmUpTime?: string;
  competitionTime?: string;
  status: 'upcoming' | 'check_in' | 'warming_up' | 'competing' | 'completed';
  placement?: number;
  result?: string;
  resultUnit?: string;
  personalRecord?: boolean;
  seasonBest?: boolean;
  conflicts?: string[];
}

export default function ParentDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<string[]>([]);

  // Sample parent with multiple kids at track meet
  const parentName = "Sarah Martinez";
  const meetName = "CCISD District Track & Field Championship";
  const meetVenue = "Miller High School Track Complex";

  const athleteEvents: AthleteEvent[] = [
    // Emma Martinez - 9th Grade
    {
      id: '1',
      athleteName: 'Emma Martinez',
      athleteGrade: '9th Grade',
      eventName: '100m Dash',
      eventType: 'track',
      venue: 'Miller High School',
      field: 'Track - Lanes 1-8',
      scheduledTime: '2025-08-19T15:45:00',
      checkInTime: '2025-08-19T15:30:00',
      status: 'check_in',
      conflicts: []
    },
    {
      id: '2',
      athleteName: 'Emma Martinez',
      athleteGrade: '9th Grade',
      eventName: '200m Dash',
      eventType: 'track',
      venue: 'Miller High School',
      field: 'Track - Lanes 1-8',
      scheduledTime: '2025-08-19T17:15:00',
      status: 'upcoming',
      conflicts: ['Same time as Diego\'s discus finals']
    },
    {
      id: '3',
      athleteName: 'Emma Martinez',
      athleteGrade: '9th Grade',
      eventName: 'Long Jump',
      eventType: 'field',
      venue: 'Miller High School',
      field: 'Field Event Area - Pit 1',
      scheduledTime: '2025-08-19T16:30:00',
      status: 'upcoming',
      conflicts: []
    },

    // Diego Martinez - 11th Grade
    {
      id: '4',
      athleteName: 'Diego Martinez',
      athleteGrade: '11th Grade',
      eventName: 'Discus',
      eventType: 'field',
      venue: 'Miller High School',
      field: 'Field Event Area - Discus Circle',
      scheduledTime: '2025-08-19T15:30:00',
      warmUpTime: '2025-08-19T15:15:00',
      status: 'warming_up',
      conflicts: []
    },
    {
      id: '5',
      athleteName: 'Diego Martinez',
      athleteGrade: '11th Grade',
      eventName: 'Shot Put',
      eventType: 'field',
      venue: 'Miller High School',
      field: 'Field Event Area - Shot Put Circle',
      scheduledTime: '2025-08-19T16:45:00',
      status: 'upcoming',
      conflicts: []
    },
    {
      id: '6',
      athleteName: 'Diego Martinez',
      athleteGrade: '11th Grade',
      eventName: '110m Hurdles',
      eventType: 'track',
      venue: 'Miller High School',
      field: 'Track - Lanes 1-8',
      scheduledTime: '2025-08-19T17:15:00',
      status: 'upcoming',
      conflicts: ['Same time as Emma\'s 200m dash']
    },

    // Completed events
    {
      id: '7',
      athleteName: 'Emma Martinez',
      athleteGrade: '9th Grade',
      eventName: '400m Dash',
      eventType: 'track',
      venue: 'Miller High School',
      field: 'Track - Lanes 1-8',
      scheduledTime: '2025-08-19T14:30:00',
      competitionTime: '2025-08-19T14:35:00',
      status: 'completed',
      placement: 3,
      result: '58.42',
      resultUnit: 'seconds',
      personalRecord: true,
      seasonBest: true,
      conflicts: []
    },
    {
      id: '8',
      athleteName: 'Diego Martinez',
      athleteGrade: '11th Grade',
      eventName: 'Javelin',
      eventType: 'field',
      venue: 'Miller High School',
      field: 'Field Event Area - Javelin Runway',
      scheduledTime: '2025-08-19T14:00:00',
      competitionTime: '2025-08-19T14:15:00',
      status: 'completed',
      placement: 1,
      result: '156.8',
      resultUnit: 'feet',
      personalRecord: false,
      seasonBest: true,
      conflicts: []
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Simulate real-time notifications
    const newNotifications: string[] = [];
    const now = new Date();
    
    athleteEvents.forEach(event => {
      const eventTime = new Date(event.scheduledTime);
      const timeDiff = eventTime.getTime() - now.getTime();
      const minutesUntil = Math.floor(timeDiff / (1000 * 60));
      
      if (minutesUntil <= 15 && minutesUntil > 0 && event.status === 'upcoming') {
        newNotifications.push(`${event.athleteName}'s ${event.eventName} starts in ${minutesUntil} minutes`);
      }
      
      if (event.status === 'check_in') {
        newNotifications.push(`${event.athleteName} needs to check in for ${event.eventName} NOW`);
      }
      
      if (event.conflicts && event.conflicts.length > 0) {
        newNotifications.push(`CONFLICT: ${event.athleteName}'s ${event.eventName} - ${event.conflicts[0]}`);
      }
    });
    
    setNotifications(newNotifications);
  }, [currentTime]);

  const getStatusBadge = (status: string, hasConflict?: boolean) => {
    if (hasConflict) {
      return <Badge className="bg-red-500 text-white animate-pulse"><AlertTriangle className="h-3 w-3 mr-1" />Conflict</Badge>;
    }
    
    switch (status) {
      case 'check_in':
        return <Badge className="bg-orange-500 text-white animate-pulse"><Bell className="h-3 w-3 mr-1" />Check In</Badge>;
      case 'warming_up':
        return <Badge className="bg-yellow-500 text-black"><Activity className="h-3 w-3 mr-1" />Warming Up</Badge>;
      case 'competing':
        return <Badge className="bg-green-500 text-white"><Play className="h-3 w-3 mr-1" />Competing</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Complete</Badge>;
      default:
        return <Badge className="bg-slate-500 text-white"><Clock className="h-3 w-3 mr-1" />Upcoming</Badge>;
    }
  };

  const getTimeUntilEvent = (eventTime: string) => {
    const now = new Date();
    const event = new Date(eventTime);
    const diff = event.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes <= 0) return "NOW";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const activeEvents = athleteEvents.filter(e => ['check_in', 'warming_up', 'competing'].includes(e.status));
  const upcomingEvents = athleteEvents.filter(e => e.status === 'upcoming');
  const completedEvents = athleteEvents.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Parent Dashboard</h1>
              <p className="text-slate-300">Welcome, {parentName}</p>
              <p className="text-slate-400 text-sm">{meetName} • {meetVenue}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
              <p className="text-slate-400 text-sm">Live Updates</p>
            </div>
          </div>
        </div>

        {/* Critical Notifications */}
        {notifications.length > 0 && (
          <Card className="mb-6 bg-red-500/20 border-red-500/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-400 flex items-center">
                <Bell className="h-5 w-5 mr-2 animate-pulse" />
                Urgent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notifications.map((notification, idx) => (
                  <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 font-medium">{notification}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
            <TabsTrigger value="active" className="data-[state=active]:bg-red-600">
              Active Now ({activeEvents.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-yellow-600">
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-600">
              Completed ({completedEvents.length})
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-600">
              Full Schedule
            </TabsTrigger>
          </TabsList>

          {/* Active Events Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="grid gap-4">
              {activeEvents.map((event) => (
                <Card key={event.id} className="bg-slate-800/50 border-slate-700 border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-400" />
                          {event.athleteName} ({event.athleteGrade})
                        </CardTitle>
                        <CardTitle className="text-green-400 text-xl mt-1">{event.eventName}</CardTitle>
                      </div>
                      {getStatusBadge(event.status, event.conflicts && event.conflicts.length > 0)}
                    </div>
                    <CardDescription className="flex items-center text-slate-400">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.field}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Event Timeline */}
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="grid md:grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-slate-400 text-xs uppercase mb-1">Check-In</p>
                            <p className="text-white font-bold">
                              {event.checkInTime ? new Date(event.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs uppercase mb-1">Warm-Up</p>
                            <p className="text-white font-bold">
                              {event.warmUpTime ? new Date(event.warmUpTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'TBD'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs uppercase mb-1">Competition</p>
                            <p className="text-green-400 font-bold">
                              {new Date(event.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid={`button-directions-${event.id}`}
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-400 hover:bg-green-500/10"
                          data-testid={`button-message-${event.id}`}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message Coach
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                          data-testid={`button-photo-${event.id}`}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {activeEvents.length === 0 && (
                <Card className="bg-slate-800/30 border-slate-700">
                  <CardContent className="py-16 text-center">
                    <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-xl text-slate-400 mb-2">No Active Events</p>
                    <p className="text-slate-500">Your athletes are between events</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Upcoming Events Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            <div className="grid gap-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className={`bg-slate-800/50 border-slate-700 ${event.conflicts && event.conflicts.length > 0 ? 'border-l-4 border-l-red-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-400" />
                          {event.athleteName} ({event.athleteGrade})
                        </CardTitle>
                        <CardTitle className="text-green-400 text-xl mt-1">{event.eventName}</CardTitle>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(event.status, event.conflicts && event.conflicts.length > 0)}
                        <div className="text-2xl font-bold text-yellow-400 mt-2">
                          {getTimeUntilEvent(event.scheduledTime)}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.field}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {new Date(event.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {event.conflicts && event.conflicts.length > 0 && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center mb-2">
                          <AlertTriangle className="h-4 w-4 mr-2 text-red-400" />
                          <p className="text-red-400 font-semibold">Scheduling Conflict</p>
                        </div>
                        {event.conflicts.map((conflict, idx) => (
                          <p key={idx} className="text-red-300 text-sm">{conflict}</p>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        data-testid={`button-set-reminder-${event.id}`}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Set Reminder
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid={`button-directions-${event.id}`}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Completed Events Tab */}
          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4">
              {completedEvents.map((event) => (
                <Card key={event.id} className="bg-slate-800/30 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-lg flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-400" />
                          {event.athleteName} ({event.athleteGrade})
                        </CardTitle>
                        <CardTitle className="text-green-400 text-xl mt-1">{event.eventName}</CardTitle>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                      <div className="grid md:grid-cols-4 gap-4 items-center text-center">
                        <div>
                          <Trophy className={`h-8 w-8 mx-auto mb-2 ${event.placement === 1 ? 'text-yellow-400' : event.placement === 2 ? 'text-gray-400' : event.placement === 3 ? 'text-orange-400' : 'text-slate-500'}`} />
                          <p className="text-2xl font-bold text-white">{event.placement}</p>
                          <p className="text-slate-400 text-xs">Place</p>
                        </div>
                        <div>
                          <Target className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-400">{event.result}</p>
                          <p className="text-slate-400 text-xs">{event.resultUnit}</p>
                        </div>
                        <div className="flex justify-center gap-2">
                          {event.personalRecord && (
                            <div className="bg-green-500/20 rounded-lg p-2">
                              <Star className="h-4 w-4 text-green-400 mx-auto mb-1" />
                              <p className="text-green-400 text-xs">PR</p>
                            </div>
                          )}
                          {event.seasonBest && (
                            <div className="bg-blue-500/20 rounded-lg p-2">
                              <Flag className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                              <p className="text-blue-400 text-xs">SB</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <Clock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                          <p className="text-slate-300 text-sm">
                            {event.competitionTime ? new Date(event.competitionTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                          </p>
                          <p className="text-slate-400 text-xs">Finished</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                        data-testid={`button-share-result-${event.id}`}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Share Result
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-400 hover:bg-green-500/10"
                        data-testid={`button-congratulate-${event.id}`}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Congratulate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Full Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Emma's Schedule */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-blue-400" />
                    Emma Martinez - 9th Grade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {athleteEvents.filter(e => e.athleteName === 'Emma Martinez').map(event => (
                      <div key={event.id} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-semibold">{event.eventName}</p>
                          <p className="text-slate-400 text-sm">{new Date(event.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        {getStatusBadge(event.status, event.conflicts && event.conflicts.length > 0)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Diego's Schedule */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-400" />
                    Diego Martinez - 11th Grade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {athleteEvents.filter(e => e.athleteName === 'Diego Martinez').map(event => (
                      <div key={event.id} className="flex items-center justify-between py-2 px-3 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-semibold">{event.eventName}</p>
                          <p className="text-slate-400 text-sm">{new Date(event.scheduledTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        {getStatusBadge(event.status, event.conflicts && event.conflicts.length > 0)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}