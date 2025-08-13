import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Zap,
  Bus,
  Home,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
  Eye,
  Download,
  Upload,
  Settings,
  Bell,
  Route
} from "lucide-react";

interface ScheduledEvent {
  id: string;
  type: 'game' | 'practice' | 'scrimmage' | 'tournament';
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  isHome: boolean;
  opponent?: string;
  sport: string;
  team: string;
  coach: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  transportation?: string;
  equipment?: string[];
  officials?: string[];
  attendance?: number;
  weatherConcerns?: boolean;
  rescheduled?: boolean;
  parentNotified?: boolean;
  createdBy: string;
  createdAt: string;
}

interface TeamRoster {
  id: string;
  teamName: string;
  sport: string;
  school: string;
  coach: string;
  assistantCoaches: string[];
  players: {
    id: string;
    name: string;
    grade: string;
    position: string;
    parentContact: string;
    medicalStatus: 'cleared' | 'limited' | 'restricted';
  }[];
  season: string;
  division: string;
}

export default function GamePracticeScheduler() {
  const [selectedTab, setSelectedTab] = useState("schedule");
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Sample team rosters
  const teams: TeamRoster[] = [
    {
      id: "fb-varsity",
      teamName: "Buccaneers Varsity Football",
      sport: "Football",
      school: "Roy Miller High",
      coach: "Coach David Rodriguez",
      assistantCoaches: ["Coach Mike Wilson", "Coach Sam Turner"],
      players: [
        {
          id: "p1",
          name: "Marcus Rodriguez",
          grade: "11th",
          position: "QB",
          parentContact: "(361) 555-0123",
          medicalStatus: "cleared"
        },
        {
          id: "p2", 
          name: "Jordan Williams",
          grade: "12th",
          position: "RB", 
          parentContact: "(361) 555-0234",
          medicalStatus: "cleared"
        },
        {
          id: "p3",
          name: "Alex Thompson",
          grade: "10th", 
          position: "WR",
          parentContact: "(361) 555-0345",
          medicalStatus: "limited"
        }
      ],
      season: "Fall 2024",
      division: "District 30-5A"
    },
    {
      id: "vb-jv",
      teamName: "Rangers JV Volleyball",
      sport: "Volleyball", 
      school: "Robert Driscoll Middle",
      coach: "Coach Amanda Wilson",
      assistantCoaches: ["Coach Lisa Park"],
      players: [
        {
          id: "p4",
          name: "Sarah Chen",
          grade: "8th",
          position: "Setter",
          parentContact: "(361) 555-0456",
          medicalStatus: "cleared"
        },
        {
          id: "p5",
          name: "Emily Rodriguez",
          grade: "7th",
          position: "Outside Hitter",
          parentContact: "(361) 555-0567",
          medicalStatus: "cleared"
        }
      ],
      season: "Fall 2024",
      division: "District Middle School"
    },
    {
      id: "tr-varsity",
      teamName: "Trojans Track & Field",
      sport: "Track & Field",
      school: "Sterling Martin Middle",
      coach: "Coach Jennifer Martinez",
      assistantCoaches: ["Coach Robert Lee"],
      players: [
        {
          id: "p6",
          name: "Carlos Jimenez",
          grade: "8th",
          position: "Sprinter",
          parentContact: "(361) 555-0678",
          medicalStatus: "cleared"
        },
        {
          id: "p7",
          name: "Maria Gonzalez", 
          grade: "7th",
          position: "Distance",
          parentContact: "(361) 555-0789",
          medicalStatus: "cleared"
        }
      ],
      season: "Spring 2024",
      division: "District Middle School"
    }
  ];

  // Sample events data
  const events: ScheduledEvent[] = [
    {
      id: "1",
      type: "game",
      title: "vs Veterans Memorial Eagles",
      date: "2024-08-16",
      time: "19:00",
      endTime: "22:00",
      location: "Miller Stadium",
      isHome: true,
      opponent: "Veterans Memorial High",
      sport: "Football",
      team: "Buccaneers Varsity Football",
      coach: "Coach David Rodriguez",
      status: "confirmed",
      notes: "Homecoming game. Band performance at halftime. Senior night recognitions.",
      transportation: "N/A - Home Game",
      equipment: ["Game jerseys", "Helmets", "Pads", "Water bottles", "Medical kit"],
      officials: ["Referee: Mike Johnson", "Line Judge: Tom Wilson", "Back Judge: Sarah Davis"],
      attendance: 2500,
      weatherConcerns: false,
      parentNotified: true,
      createdBy: "Coach David Rodriguez",
      createdAt: "2024-08-01"
    },
    {
      id: "2",
      type: "practice",
      title: "Football Practice - Offense Focus",
      date: "2024-08-14",
      time: "16:00",
      endTime: "18:30",
      location: "Miller Practice Field",
      isHome: true,
      sport: "Football",
      team: "Buccaneers Varsity Football",
      coach: "Coach David Rodriguez",
      status: "scheduled",
      notes: "Focus on red zone offense. Full pads. Hydration breaks every 20 minutes due to heat.",
      equipment: ["Practice jerseys", "Helmets", "Pads", "Cones", "Water stations"],
      weatherConcerns: true,
      parentNotified: false,
      createdBy: "Coach David Rodriguez", 
      createdAt: "2024-08-10"
    },
    {
      id: "3",
      type: "game",
      title: "@ Dawson Middle School",
      date: "2024-08-15",
      time: "17:00",
      endTime: "19:00",
      location: "Dawson MS Gymnasium",
      isHome: false,
      opponent: "Dawson Middle School",
      sport: "Volleyball",
      team: "Rangers JV Volleyball",
      coach: "Coach Amanda Wilson",
      status: "scheduled",
      notes: "District game. Need parent drivers for transportation.",
      transportation: "Bus departs 3:30 PM from school",
      equipment: ["Game uniforms", "Volleyball", "Knee pads", "Water bottles"],
      parentNotified: true,
      createdBy: "Coach Amanda Wilson",
      createdAt: "2024-08-05"
    },
    {
      id: "4",
      type: "practice",
      title: "Volleyball Practice - Serving",
      date: "2024-08-14",
      time: "15:30",
      endTime: "17:00",
      location: "Driscoll MS Gymnasium",
      isHome: true,
      sport: "Volleyball",
      team: "Rangers JV Volleyball",
      coach: "Coach Amanda Wilson",
      status: "confirmed",
      notes: "Focus on serve receive patterns. Light practice before tomorrow's game.",
      equipment: ["Volleyballs", "Net", "Practice jerseys"],
      parentNotified: false,
      createdBy: "Coach Amanda Wilson",
      createdAt: "2024-08-12"
    },
    {
      id: "5",
      type: "tournament",
      title: "CCISD Track & Field Meet",
      date: "2024-08-17",
      time: "08:00",
      endTime: "16:00",
      location: "Cabaniss Stadium",
      isHome: false,
      sport: "Track & Field",
      team: "Trojans Track & Field",
      coach: "Coach Jennifer Martinez",
      status: "confirmed",
      notes: "District championship qualifying meet. All events. Bring team tent and coolers.",
      transportation: "Bus departs 6:30 AM from school",
      equipment: ["Team uniforms", "Spikes", "Starting blocks", "Implements", "Team tent"],
      attendance: 500,
      parentNotified: true,
      createdBy: "Coach Jennifer Martinez",
      createdAt: "2024-07-20"
    }
  ];

  const sports = ["Football", "Volleyball", "Basketball", "Track & Field", "Baseball", "Softball", "Soccer", "Tennis", "Golf", "Cross Country"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'game':
        return 'bg-red-600';
      case 'practice':
        return 'bg-blue-600';
      case 'scrimmage':
        return 'bg-yellow-600';
      case 'tournament':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Trophy className="h-4 w-4" />;
      case 'practice':
        return <Zap className="h-4 w-4" />;
      case 'scrimmage':
        return <Users className="h-4 w-4" />;
      case 'tournament':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredEvents = events.filter(event => {
    let matches = true;
    if (selectedSport && event.sport !== selectedSport) matches = false;
    if (selectedTeam && event.team !== selectedTeam) matches = false;
    return matches;
  });

  const weekEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const selectedWeekDate = new Date(selectedWeek);
    const weekStart = new Date(selectedWeekDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-800 to-purple-800 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            CCISD Game & Practice Scheduler
          </h1>
          <p className="text-xl text-blue-200 mb-6">
            Comprehensive Athletic Event Management • Coach Scheduling Tools • Team Coordination
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <Badge className="bg-red-600 text-white px-4 py-2">
              Game Scheduling
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              Practice Management
            </Badge>
            <Badge className="bg-green-600 text-white px-4 py-2">
              Parent Notifications
            </Badge>
            <Badge className="bg-purple-600 text-white px-4 py-2">
              Tournament Tracking
            </Badge>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              
              {/* Schedule Filters */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Filters & View
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">View Mode</label>
                    <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Week View</SelectItem>
                        <SelectItem value="month">Month View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Week Starting</label>
                    <Input
                      type="date"
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className="bg-white/10 border-white/30 text-white"
                      data-testid="input-week-date"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sport</label>
                    <Select value={selectedSport} onValueChange={setSelectedSport}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue placeholder="All Sports" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Sports</SelectItem>
                        {sports.map((sport) => (
                          <SelectItem key={sport} value={sport}>
                            {sport}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Team</label>
                    <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue placeholder="All Teams" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Teams</SelectItem>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.teamName}>
                            {team.teamName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowNewEvent(true)}
                    data-testid="button-quick-schedule"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Quick Schedule
                  </Button>
                </CardContent>
              </Card>

              {/* Weekly Summary */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Week Summary
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    {weekEvents.length} events scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-500/20 rounded">
                      <span>Games</span>
                      <Badge className="bg-red-600">
                        {weekEvents.filter(e => e.type === 'game').length}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-500/20 rounded">
                      <span>Practices</span>
                      <Badge className="bg-blue-600">
                        {weekEvents.filter(e => e.type === 'practice').length}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-500/20 rounded">
                      <span>Tournaments</span>
                      <Badge className="bg-purple-600">
                        {weekEvents.filter(e => e.type === 'tournament').length}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-500/20 rounded">
                      <span>Away Events</span>
                      <Badge className="bg-yellow-600">
                        {weekEvents.filter(e => !e.isHome).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Coach Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-bulk-schedule"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Bulk Schedule
                  </Button>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-copy-week"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Week
                  </Button>
                  
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    data-testid="button-weather-check"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Weather Check
                  </Button>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-send-updates"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Updates
                  </Button>
                </CardContent>
              </Card>

              {/* Transportation */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    Transportation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-500/20 rounded">
                      <span>Bus Requests</span>
                      <Badge className="bg-blue-600">
                        {weekEvents.filter(e => e.transportation?.includes('Bus')).length}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-500/20 rounded">
                      <span>Home Events</span>
                      <Badge className="bg-green-600">
                        {weekEvents.filter(e => e.isHome).length}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid="button-request-transport"
                    >
                      <Route className="h-4 w-4 mr-2" />
                      Request Transport
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Schedule Grid */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Schedule - {selectedWeek}
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Games, practices, and tournaments for all teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weekEvents.sort((a, b) => {
                    const dateCompare = a.date.localeCompare(b.date);
                    if (dateCompare === 0) {
                      return a.time.localeCompare(b.time);
                    }
                    return dateCompare;
                  }).map((event) => (
                    <div 
                      key={event.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(event.type)}
                              <div className="text-lg font-semibold">{event.title}</div>
                            </div>
                            <Badge className={getTypeColor(event.type)}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </Badge>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </Badge>
                            {event.weatherConcerns && (
                              <Badge className="bg-yellow-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Weather Watch
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-sm text-blue-200">Date & Time</div>
                              <div className="font-medium">{event.date}</div>
                              <div className="text-sm text-blue-200">{event.time} - {event.endTime}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Location</div>
                              <div className="font-medium flex items-center gap-2">
                                {event.isHome ? <Home className="h-3 w-3" /> : <Route className="h-3 w-3" />}
                                {event.location}
                              </div>
                              {!event.isHome && (
                                <div className="text-sm text-blue-200">{event.transportation}</div>
                              )}
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Team</div>
                              <div className="font-medium">{event.team}</div>
                              <div className="text-sm text-blue-200">{event.coach}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Details</div>
                              {event.opponent && (
                                <div className="text-sm">vs {event.opponent}</div>
                              )}
                              {event.attendance && (
                                <div className="text-sm text-blue-200">Expected: {event.attendance}</div>
                              )}
                            </div>
                          </div>
                          
                          {event.notes && (
                            <div className="p-3 bg-white/5 rounded border border-white/10 mb-3">
                              <div className="text-sm text-blue-200 mb-1">Notes:</div>
                              <div className="text-sm">{event.notes}</div>
                            </div>
                          )}
                          
                          {event.equipment && event.equipment.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm text-blue-200 mb-2">Equipment Needed:</div>
                              <div className="flex flex-wrap gap-2">
                                {event.equipment.map((item, index) => (
                                  <Badge key={index} variant="outline" className="text-white border-white/30 text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid={`button-edit-${event.id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-copy-${event.id}`}>
                          <Copy className="h-3 w-3 mr-1" />
                          Duplicate
                        </Button>
                        
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid={`button-notify-${event.id}`}>
                          <Send className="h-3 w-3 mr-1" />
                          Notify Parents
                        </Button>
                        
                        {event.status === 'scheduled' && (
                          <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" data-testid={`button-confirm-${event.id}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirm
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline" className="text-red-400 border-red-400" data-testid={`button-cancel-${event.id}`}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {weekEvents.length === 0 && (
                    <div className="text-center py-8 text-blue-200">
                      No events scheduled for this week
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5" />
                        <div>
                          <div>{team.teamName}</div>
                          <div className="text-sm text-blue-200">{team.school} • {team.season}</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-600">
                        {team.players.length} Players
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Coaching Staff</div>
                        <div className="space-y-1">
                          <div className="font-medium">{team.coach} (Head Coach)</div>
                          {team.assistantCoaches.map((coach, index) => (
                            <div key={index} className="text-sm text-blue-200">{coach}</div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Team Information</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-blue-200">Sport:</div>
                            <div>{team.sport}</div>
                          </div>
                          <div>
                            <div className="text-blue-200">Division:</div>
                            <div>{team.division}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Medical Status</div>
                        <div className="flex gap-2">
                          <Badge className="bg-green-600">
                            {team.players.filter(p => p.medicalStatus === 'cleared').length} Cleared
                          </Badge>
                          <Badge className="bg-yellow-600">
                            {team.players.filter(p => p.medicalStatus === 'limited').length} Limited
                          </Badge>
                          <Badge className="bg-red-600">
                            {team.players.filter(p => p.medicalStatus === 'restricted').length} Restricted
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-blue-200 mb-2">This Week's Events</div>
                        <div className="text-lg font-semibold">
                          {events.filter(event => event.team === team.teamName && 
                            new Date(event.date) >= new Date(selectedWeek) && 
                            new Date(event.date) <= new Date(new Date(selectedWeek).getTime() + 7 * 24 * 60 * 60 * 1000)
                          ).length}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid={`button-schedule-team-${team.id}`}>
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule Event
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-roster-${team.id}`}>
                          <Users className="h-3 w-3 mr-1" />
                          View Roster
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-contact-${team.id}`}>
                          <Send className="h-3 w-3 mr-1" />
                          Contact Parents
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Event
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Schedule games, practices, scrimmages, or tournaments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Type</label>
                      <Select>
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="game">Game</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                          <SelectItem value="scrimmage">Scrimmage</SelectItem>
                          <SelectItem value="tournament">Tournament</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Team</label>
                      <Select>
                        <SelectTrigger className="bg-white/10 border-white/30 text-white">
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.teamName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Event Title</label>
                      <Input 
                        className="bg-white/10 border-white/30 text-white"
                        placeholder="e.g., vs Memorial Eagles"
                        data-testid="input-event-title"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <Input 
                        type="date"
                        className="bg-white/10 border-white/30 text-white"
                        data-testid="input-event-date"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Start Time</label>
                      <Input 
                        type="time"
                        className="bg-white/10 border-white/30 text-white"
                        data-testid="input-start-time"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">End Time</label>
                      <Input 
                        type="time"
                        className="bg-white/10 border-white/30 text-white"
                        data-testid="input-end-time"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Input 
                        className="bg-white/10 border-white/30 text-white"
                        placeholder="e.g., Miller Stadium"
                        data-testid="input-location"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3 pt-6">
                      <Switch id="home-game" />
                      <label htmlFor="home-game" className="text-sm font-medium">
                        Home Event
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Opponent (for games)</label>
                    <Input 
                      className="bg-white/10 border-white/30 text-white"
                      placeholder="e.g., Veterans Memorial High"
                      data-testid="input-opponent"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Transportation</label>
                    <Select>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue placeholder="Select transportation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">N/A - Home Event</SelectItem>
                        <SelectItem value="bus">School Bus</SelectItem>
                        <SelectItem value="parent">Parent Transportation</SelectItem>
                        <SelectItem value="charter">Charter Bus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notes & Instructions</label>
                    <Textarea 
                      className="bg-white/10 border-white/30 text-white"
                      placeholder="Special instructions, equipment needed, weather considerations, etc."
                      rows={3}
                      data-testid="textarea-event-notes"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <Switch id="notify-parents" />
                      <label htmlFor="notify-parents" className="text-sm font-medium">
                        Notify Parents Immediately
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Switch id="weather-watch" />
                      <label htmlFor="weather-watch" className="text-sm font-medium">
                        Weather Concerns
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button className="bg-green-600 hover:bg-green-700" data-testid="button-create-event">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-create-and-duplicate">
                      <Copy className="h-4 w-4 mr-2" />
                      Create & Duplicate
                    </Button>
                    <Button variant="outline" className="text-white border-white/30" data-testid="button-save-template">
                      <Download className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Notification Templates */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Parent Notification Templates
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Pre-written messages for common scheduling updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded border border-white/20">
                      <div className="font-semibold mb-2">Game Reminder</div>
                      <div className="text-sm text-blue-200 mb-2">
                        "REMINDER: [Team] has a game against [Opponent] on [Date] at [Time] at [Location]. Players should arrive 30 minutes early. Go [Mascot]! - Coach [Name]"
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-use-game-reminder">
                        Use Template
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded border border-white/20">
                      <div className="font-semibold mb-2">Practice Update</div>
                      <div className="text-sm text-blue-200 mb-2">
                        "Practice update: [Team] practice on [Date] at [Time] will focus on [Skills]. Please bring water and be ready to work hard! - Coach [Name]"
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid="button-use-practice-update">
                        Use Template
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded border border-white/20">
                      <div className="font-semibold mb-2">Weather Cancellation</div>
                      <div className="text-sm text-blue-200 mb-2">
                        "Due to weather conditions, [Team] [Event] scheduled for [Date] at [Time] has been cancelled/postponed. New date/time will be announced soon. - Coach [Name]"
                      </div>
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" data-testid="button-use-weather-cancel">
                        Use Template
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded border border-white/20">
                      <div className="font-semibold mb-2">Transportation Info</div>
                      <div className="text-sm text-blue-200 mb-2">
                        "Transportation update: The bus for [Team] to [Location] on [Date] will depart at [Time] from [Pickup Location]. Please be on time! - Coach [Name]"
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" data-testid="button-use-transport-info">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Recent Notifications
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Track messages sent to parents and players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Football Game Reminder</div>
                        <div className="text-xs text-blue-200">2 hours ago</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        Sent to: Buccaneers Varsity Football parents (45 recipients)
                      </div>
                      <div className="text-sm mb-2">
                        "REMINDER: Buccaneers have a game against Veterans Memorial Eagles tomorrow at 7:00 PM at Miller Stadium..."
                      </div>
                      <Badge className="bg-green-600">Delivered</Badge>
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Practice Schedule Change</div>
                        <div className="text-xs text-blue-200">1 day ago</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        Sent to: Rangers JV Volleyball parents (18 recipients)
                      </div>
                      <div className="text-sm mb-2">
                        "Practice update: Tomorrow's practice moved to 4:00 PM due to academic tutoring..."
                      </div>
                      <Badge className="bg-blue-600">Read</Badge>
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Tournament Information</div>
                        <div className="text-xs text-blue-200">3 days ago</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        Sent to: Trojans Track & Field parents (28 recipients)
                      </div>
                      <div className="text-sm mb-2">
                        "CCISD Track Meet details: Saturday 8:00 AM at Cabaniss Stadium. Bus departs 6:30 AM..."
                      </div>
                      <Badge className="bg-green-600">Delivered</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="text-white border-white/30" data-testid="button-view-all-notifications">
                      View All Notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Schedule Reports */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Schedule Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-weekly-schedule"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Weekly Schedule
                  </Button>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-monthly-calendar"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Monthly Calendar
                  </Button>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-team-schedules"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Team Schedules
                  </Button>
                  
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    data-testid="button-facility-usage"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Facility Usage
                  </Button>
                </CardContent>
              </Card>

              {/* Communication Reports */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Communication Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-parent-contacts"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Parent Contact List
                  </Button>
                  
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-notification-log"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notification Log
                  </Button>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-response-tracking"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Response Tracking
                  </Button>
                  
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    data-testid="button-emergency-contacts"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Contacts
                  </Button>
                </CardContent>
              </Card>

              {/* Analytics & Statistics */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-white/5 rounded border border-white/20">
                    <div className="text-sm text-blue-200">Total Events This Month</div>
                    <div className="text-2xl font-bold">127</div>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded border border-white/20">
                    <div className="text-sm text-blue-200">Messages Sent This Week</div>
                    <div className="text-2xl font-bold">89</div>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded border border-white/20">
                    <div className="text-sm text-blue-200">Average Response Rate</div>
                    <div className="text-2xl font-bold">94%</div>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-detailed-analytics"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Detailed Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}