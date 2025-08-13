import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Users,
  School,
  Stethoscope,
  CalendarPlus,
  Send,
  Edit,
  Trash2,
  Navigation,
  Bell
} from "lucide-react";

interface ScheduledAppointment {
  id: string;
  athleteName: string;
  athleteId: string;
  school: string;
  sport: string;
  appointmentType: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'rescheduled' | 'cancelled';
  notes?: string;
  parentContact: string;
  athleteContact?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reminderSent: boolean;
  createdBy: string;
}

interface AthleticTrainer {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  assignedSchools: string[];
  certifications: string[];
  status: 'available' | 'busy' | 'off-duty';
  currentLocation?: string;
}

export default function AthleticTrainerScheduler() {
  const [selectedTab, setSelectedTab] = useState("schedule");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  // Sample athletic trainers data
  const trainers: AthleticTrainer[] = [
    {
      id: "1",
      name: "Dr. Sarah Martinez",
      title: "Lead Athletic Trainer",
      email: "smartinez@ccisd.org",
      phone: "(361) 878-4880",
      assignedSchools: ["Roy Miller High", "Robert Driscoll Middle", "Sterling Martin Middle"],
      certifications: ["ATC", "EMT-B", "CPR"],
      status: "available",
      currentLocation: "Roy Miller High - Training Room"
    },
    {
      id: "2", 
      name: "Mike Thompson",
      title: "Athletic Trainer",
      email: "mthompson@ccisd.org",
      phone: "(361) 878-4881",
      assignedSchools: ["Veterans Memorial High", "Cullen Middle", "Grant Middle"],
      certifications: ["ATC", "CPR"],
      status: "busy",
      currentLocation: "Veterans Memorial High - Field House"
    },
    {
      id: "3",
      name: "Lisa Chen",
      title: "Athletic Trainer", 
      email: "lchen@ccisd.org",
      phone: "(361) 878-4882",
      assignedSchools: ["Carroll High", "Dawson Middle", "Hopper Middle"],
      certifications: ["ATC", "CSCS", "CPR"],
      status: "available"
    }
  ];

  // Sample appointments data
  const appointments: ScheduledAppointment[] = [
    {
      id: "1",
      athleteName: "Marcus Rodriguez",
      athleteId: "student-123",
      school: "Robert Driscoll Middle",
      sport: "Football",
      appointmentType: "Concussion Return-to-Play Step 3",
      date: "2024-08-14",
      time: "14:00",
      location: "Boys Locker Room - Training Area",
      status: "scheduled",
      notes: "Step 3: Non-contact training drills. Must be 24+ hours symptom-free.",
      parentContact: "(361) 555-0123",
      athleteContact: "(361) 555-0124",
      priority: "high",
      reminderSent: false,
      createdBy: "Dr. Sarah Martinez"
    },
    {
      id: "2",
      athleteName: "Sarah Chen",
      athleteId: "student-456",
      school: "Sterling Martin Middle",
      sport: "Volleyball",
      appointmentType: "Asthma Care Plan Review",
      date: "2024-08-14",
      time: "15:30",
      location: "Nurse's Office",
      status: "confirmed",
      notes: "Annual asthma care plan update. Bring current inhaler and medication list.",
      parentContact: "(361) 555-0234",
      priority: "medium",
      reminderSent: true,
      createdBy: "Dr. Sarah Martinez"
    },
    {
      id: "3",
      athleteName: "Jordan Williams",
      athleteId: "student-789",
      school: "Roy Miller High",
      sport: "Track & Field",
      appointmentType: "Heat Illness Follow-up",
      date: "2024-08-14",
      time: "16:00",
      location: "Main Training Room",
      status: "scheduled",
      notes: "Post-heat exhaustion clearance. Check weight logs and hydration status.",
      parentContact: "(361) 555-0345",
      priority: "urgent",
      reminderSent: false,
      createdBy: "Dr. Sarah Martinez"
    },
    {
      id: "4",
      athleteName: "Alex Thompson",
      athleteId: "student-012",
      school: "Veterans Memorial High",
      sport: "Basketball",
      appointmentType: "Ankle Injury Assessment",
      date: "2024-08-15",
      time: "13:00",
      location: "Athletic Training Room",
      status: "scheduled",
      notes: "Initial evaluation of left ankle sprain during practice.",
      parentContact: "(361) 555-0456",
      priority: "medium",
      reminderSent: false,
      createdBy: "Mike Thompson"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500';
      case 'confirmed':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'rescheduled':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrainerStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'off-duty':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const todaysAppointments = appointments.filter(apt => apt.date === selectedDate);
  const trainerAppointments = selectedTrainer 
    ? appointments.filter(apt => apt.createdBy === trainers.find(t => t.id === selectedTrainer)?.name)
    : appointments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-800 to-blue-800 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            CCISD Athletic Trainer Scheduler
          </h1>
          <p className="text-xl text-blue-200 mb-6">
            Multi-School Athletic Training Coordination & Appointment Management
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <Badge className="bg-green-600 text-white px-4 py-2">
              District-Wide Scheduling
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              SMS & Email Notifications
            </Badge>
            <Badge className="bg-purple-600 text-white px-4 py-2">
              HIPAA Compliant
            </Badge>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Schedule
            </TabsTrigger>
            <TabsTrigger value="trainers" className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Trainer Status
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Manage Appointments
            </TabsTrigger>
            <TabsTrigger value="communications" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Date & Trainer Selection */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-white/10 border-white/30 text-white"
                      data-testid="input-schedule-date"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Athletic Trainer</label>
                    <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                      <SelectTrigger className="bg-white/10 border-white/30 text-white">
                        <SelectValue placeholder="All Trainers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Trainers</SelectItem>
                        {trainers.map((trainer) => (
                          <SelectItem key={trainer.id} value={trainer.id}>
                            {trainer.name} - {trainer.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowNewAppointment(true)}
                    data-testid="button-new-appointment"
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Schedule New Appointment
                  </Button>
                </CardContent>
              </Card>

              {/* Today's Schedule Summary */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule Summary
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    {selectedDate} - {todaysAppointments.length} appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-500/20 rounded">
                      <span>Confirmed</span>
                      <Badge className="bg-green-600">
                        {todaysAppointments.filter(apt => apt.status === 'confirmed').length}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-500/20 rounded">
                      <span>Scheduled</span>
                      <Badge className="bg-blue-600">
                        {todaysAppointments.filter(apt => apt.status === 'scheduled').length}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-500/20 rounded">
                      <span>Urgent Priority</span>
                      <Badge className="bg-red-600">
                        {todaysAppointments.filter(apt => apt.priority === 'urgent').length}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-yellow-500/20 rounded">
                      <span>Reminders Pending</span>
                      <Badge className="bg-yellow-600">
                        {todaysAppointments.filter(apt => !apt.reminderSent && apt.status === 'scheduled').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    data-testid="button-send-reminders"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send All Reminders
                  </Button>
                  
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    data-testid="button-view-urgent"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Urgent Appointments
                  </Button>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-generate-routes"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Generate Travel Routes
                  </Button>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="button-district-overview"
                  >
                    <School className="h-4 w-4 mr-2" />
                    District Overview
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Today's Appointments */}
            <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Appointments for {selectedDate}
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Chronological schedule view with priority indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/20"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-lg font-semibold">{appointment.time}</div>
                            <Badge className={getPriorityColor(appointment.priority)}>
                              {appointment.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm text-blue-200">Athlete</div>
                              <div className="font-medium">{appointment.athleteName}</div>
                              <div className="text-sm text-blue-200">{appointment.sport}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Location</div>
                              <div className="font-medium">{appointment.school}</div>
                              <div className="text-sm text-blue-200">{appointment.location}</div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-blue-200">Appointment Type</div>
                              <div className="font-medium">{appointment.appointmentType}</div>
                              <div className="text-sm text-blue-200">Assigned to: {appointment.createdBy}</div>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-3 p-3 bg-white/5 rounded border border-white/10">
                              <div className="text-sm text-blue-200 mb-1">Notes:</div>
                              <div className="text-sm">{appointment.notes}</div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-contact-${appointment.id}`}>
                          <Phone className="h-3 w-3 mr-1" />
                          Call Parent
                        </Button>
                        
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-message-${appointment.id}`}>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Send Reminder
                        </Button>
                        
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid={`button-complete-${appointment.id}`}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Complete
                        </Button>
                        
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-reschedule-${appointment.id}`}>
                          <Edit className="h-3 w-3 mr-1" />
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {todaysAppointments.length === 0 && (
                    <div className="text-center py-8 text-blue-200">
                      No appointments scheduled for {selectedDate}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trainers" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trainers.map((trainer) => (
                <Card key={trainer.id} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-5 w-5" />
                        <div>
                          <div>{trainer.name}</div>
                          <div className="text-sm text-blue-200">{trainer.title}</div>
                        </div>
                      </div>
                      <Badge className={getTrainerStatusColor(trainer.status)}>
                        {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-blue-200 mb-1">Contact Information</div>
                        <div className="text-sm">{trainer.email}</div>
                        <div className="text-sm">{trainer.phone}</div>
                      </div>
                      
                      {trainer.currentLocation && (
                        <div>
                          <div className="text-sm text-blue-200 mb-1">Current Location</div>
                          <div className="text-sm flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {trainer.currentLocation}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Assigned Schools</div>
                        <div className="flex flex-wrap gap-2">
                          {trainer.assignedSchools.map((school, index) => (
                            <Badge key={index} variant="outline" className="text-white border-white/30">
                              {school}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Certifications</div>
                        <div className="flex flex-wrap gap-2">
                          {trainer.certifications.map((cert, index) => (
                            <Badge key={index} className="bg-green-600">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-blue-200 mb-2">Today's Appointments</div>
                        <div className="text-lg font-semibold">
                          {appointments.filter(apt => apt.createdBy === trainer.name && apt.date === selectedDate).length}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid={`button-schedule-${trainer.id}`}>
                          <CalendarPlus className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-contact-trainer-${trainer.id}`}>
                          <Phone className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5" />
                  Appointment Management
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Create, modify, and track athletic training appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showNewAppointment ? (
                  <div className="space-y-4 p-4 bg-white/5 rounded border border-white/20">
                    <h3 className="text-lg font-semibold">Schedule New Appointment</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Athlete Name</label>
                        <Input 
                          className="bg-white/10 border-white/30 text-white"
                          placeholder="Enter athlete name"
                          data-testid="input-athlete-name"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">School</label>
                        <Select>
                          <SelectTrigger className="bg-white/10 border-white/30 text-white">
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="driscoll">Robert Driscoll Middle</SelectItem>
                            <SelectItem value="martin">Sterling Martin Middle</SelectItem>
                            <SelectItem value="miller">Roy Miller High</SelectItem>
                            <SelectItem value="veterans">Veterans Memorial High</SelectItem>
                            <SelectItem value="carroll">Carroll High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Appointment Type</label>
                        <Select>
                          <SelectTrigger className="bg-white/10 border-white/30 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="concussion">Concussion Return-to-Play</SelectItem>
                            <SelectItem value="injury">Injury Assessment</SelectItem>
                            <SelectItem value="care-plan">Care Plan Review</SelectItem>
                            <SelectItem value="clearance">Medical Clearance</SelectItem>
                            <SelectItem value="follow-up">Follow-up Evaluation</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Priority</label>
                        <Select>
                          <SelectTrigger className="bg-white/10 border-white/30 text-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Date</label>
                        <Input 
                          type="date"
                          className="bg-white/10 border-white/30 text-white"
                          data-testid="input-appointment-date"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Time</label>
                        <Input 
                          type="time"
                          className="bg-white/10 border-white/30 text-white"
                          data-testid="input-appointment-time"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Input 
                          className="bg-white/10 border-white/30 text-white"
                          placeholder="e.g., Boys Locker Room - Training Area"
                          data-testid="input-location"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Parent Contact</label>
                        <Input 
                          className="bg-white/10 border-white/30 text-white"
                          placeholder="(361) 555-0123"
                          data-testid="input-parent-contact"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes</label>
                      <Textarea 
                        className="bg-white/10 border-white/30 text-white"
                        placeholder="Additional notes or instructions..."
                        rows={3}
                        data-testid="textarea-notes"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700" data-testid="button-save-appointment">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Schedule Appointment
                      </Button>
                      <Button 
                        variant="outline" 
                        className="text-white border-white/30"
                        onClick={() => setShowNewAppointment(false)}
                        data-testid="button-cancel-appointment"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowNewAppointment(true)}
                      data-testid="button-create-appointment"
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Create New Appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="communications" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SMS/Email Templates */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Message Templates
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Pre-written messages for common scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded border border-white/20">
                      <div className="font-semibold mb-2">Appointment Reminder</div>
                      <div className="text-sm text-blue-200 mb-2">
                        "Hi [Parent Name], this is a reminder that [Athlete Name] has an appointment with the Athletic Trainer at [Location] today at [Time]. Please reply to confirm attendance. - CCISD Athletics"
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-use-reminder-template">
                        Use Template
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded border border-white/20">
                      <div className="font-semibold mb-2">Concussion Follow-up</div>
                      <div className="text-sm text-blue-200 mb-2">
                        "Hi [Parent Name], [Athlete Name] is cleared for the next step in the concussion return-to-play protocol. Please bring them to [Location] at [Time] for Step [#] evaluation. - CCISD Athletic Training"
                      </div>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" data-testid="button-use-concussion-template">
                        Use Template
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-white/5 rounded border border-white/20">
                      <div className="font-semibold mb-2">Rescheduling Request</div>
                      <div className="text-sm text-blue-200 mb-2">
                        "Hi [Parent Name], we need to reschedule [Athlete Name]'s appointment. Please call (361) 878-4880 or reply with your preferred times. Thank you. - CCISD Athletic Training"
                      </div>
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700" data-testid="button-use-reschedule-template">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Communication Log */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Recent Communications
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Track all messages sent to athletes and parents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Marcus Rodriguez - Parent</div>
                        <div className="text-xs text-blue-200">2:15 PM</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        SMS: Appointment reminder sent for tomorrow 2:00 PM
                      </div>
                      <Badge className="bg-green-600">Delivered</Badge>
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Sarah Chen - Parent</div>
                        <div className="text-xs text-blue-200">1:30 PM</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        Email: Asthma care plan review confirmation
                      </div>
                      <Badge className="bg-blue-600">Read</Badge>
                    </div>
                    
                    <div className="p-3 bg-white/5 rounded border border-white/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">Jordan Williams - Parent</div>
                        <div className="text-xs text-blue-200">12:45 PM</div>
                      </div>
                      <div className="text-sm text-blue-200 mb-2">
                        SMS: Urgent appointment scheduled for heat illness follow-up
                      </div>
                      <Badge className="bg-yellow-600">Pending</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="text-white border-white/30" data-testid="button-view-all-communications">
                      View All Communications
                    </Button>
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