import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Heart, 
  Package, 
  Shield, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Upload,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileImage,
  Stethoscope,
  Activity,
  ClipboardList,
  Bell,
  Brain,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AthleticTrainerDashboard() {
  const { user } = useAuth();
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [showMessageComposer, setShowMessageComposer] = useState(false);
  const [showAIConsultant, setShowAIConsultant] = useState(false);
  const [aiConsultation, setAiConsultation] = useState({
    athleteName: '',
    sport: '',
    injuryLocation: '',
    symptoms: '',
    painLevel: '',
    onset: '',
    mechanism: '',
    previousInjuries: '',
    currentActivity: ''
  });

  // Mock data for demonstration
  const athletes = [
    {
      id: "1",
      name: "Sarah Johnson",
      sport: "Basketball",
      grade: "11th",
      status: "active",
      lastVisit: "2024-08-12",
      medicalAlerts: ["Asthma", "Previous ACL injury"],
      upcomingAppointments: 2
    },
    {
      id: "2", 
      name: "Marcus Williams",
      sport: "Football",
      grade: "12th",
      status: "injured",
      lastVisit: "2024-08-14",
      medicalAlerts: ["Concussion protocol"],
      upcomingAppointments: 1
    },
    {
      id: "3",
      name: "Emma Davis",
      sport: "Track & Field",
      grade: "10th", 
      status: "cleared",
      lastVisit: "2024-08-10",
      medicalAlerts: [],
      upcomingAppointments: 0
    }
  ];

  const recentMessages = [
    {
      id: "1",
      from: "Dr. Smith",
      subject: "Marcus Williams - MRI Results",
      preview: "MRI shows significant improvement...",
      priority: "high",
      time: "2 hours ago",
      unread: true
    },
    {
      id: "2",
      from: "Coach Thompson",
      subject: "Sarah Johnson - Return to Play Status",
      preview: "When can Sarah return to full practice?",
      priority: "normal",
      time: "4 hours ago",
      unread: true
    }
  ];

  const upcomingChecks = [
    { equipment: "AED Unit #1", type: "Monthly Check", due: "Tomorrow", status: "pending" },
    { equipment: "Emergency Bag", type: "Weekly Inventory", due: "Aug 18", status: "pending" },
    { equipment: "Ice Machine", type: "Maintenance", due: "Aug 20", status: "scheduled" }
  ];

  const lowStockItems = [
    { item: "Elastic Bandages", current: 5, minimum: 10, status: "critical" },
    { item: "Ice Packs", current: 8, minimum: 15, status: "low" },
    { item: "Antiseptic Wipes", current: 12, minimum: 20, status: "low" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Athletic Training Center</h1>
            <p className="text-slate-600">Welcome back, {user?.firstName} {user?.lastName}</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowAIConsultant(true)}
              className="bg-purple-600 hover:bg-purple-700"
              data-testid="button-ai-consultant"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Injury Consultant
            </Button>
            <Button 
              onClick={() => setShowMessageComposer(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="button-compose-message"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button 
              onClick={() => setShowAddAthlete(true)}
              data-testid="button-add-athlete"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Athlete
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">Active Athletes</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-slate-600">Current Injuries</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">Unread Messages</p>
                  <p className="text-2xl font-bold">7</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-slate-600">Low Stock Items</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="athletes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="athletes" data-testid="tab-athletes">
              <Users className="h-4 w-4 mr-2" />
              Athletes
            </TabsTrigger>
            <TabsTrigger value="communications" data-testid="tab-communications">
              <MessageSquare className="h-4 w-4 mr-2" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents">
              <FileText className="h-4 w-4 mr-2" />
              Medical Docs
            </TabsTrigger>
            <TabsTrigger value="care-plans" data-testid="tab-care-plans">
              <Heart className="h-4 w-4 mr-2" />
              Care Plans
            </TabsTrigger>
            <TabsTrigger value="supplies" data-testid="tab-supplies">
              <Package className="h-4 w-4 mr-2" />
              Supplies
            </TabsTrigger>
            <TabsTrigger value="equipment" data-testid="tab-equipment">
              <Shield className="h-4 w-4 mr-2" />
              Equipment
            </TabsTrigger>
          </TabsList>

          {/* Athletes Tab */}
          <TabsContent value="athletes" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search athletes..."
                    className="pl-10 w-64"
                    data-testid="input-search-athletes"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-32" data-testid="filter-sport">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sports</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="basketball">Basketball</SelectItem>
                    <SelectItem value="track">Track & Field</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {athletes.map((athlete) => (
                <Card key={athlete.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{athlete.name}</CardTitle>
                        <CardDescription>{athlete.sport} • {athlete.grade}</CardDescription>
                      </div>
                      <Badge 
                        variant={athlete.status === 'active' ? 'default' : 
                                athlete.status === 'injured' ? 'destructive' : 'secondary'}
                      >
                        {athlete.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {athlete.medicalAlerts.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-700">
                          {athlete.medicalAlerts.length} alert(s)
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Last visit: {athlete.lastVisit}</span>
                      {athlete.upcomingAppointments > 0 && (
                        <span className="text-blue-600">
                          {athlete.upcomingAppointments} upcoming
                        </span>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-view-athlete-${athlete.id}`}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        data-testid={`button-message-athlete-${athlete.id}`}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Message Center */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Message Center</h3>
                  <Button 
                    onClick={() => setShowMessageComposer(true)}
                    data-testid="button-new-message"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Message
                  </Button>
                </div>

                <div className="space-y-2">
                  {recentMessages.map((message) => (
                    <Card key={message.id} className={`cursor-pointer transition-colors ${message.unread ? 'border-blue-200 bg-blue-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{message.from}</span>
                              <Badge 
                                variant={message.priority === 'high' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {message.priority}
                              </Badge>
                              {message.unread && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <h4 className="font-medium text-slate-900 mt-1">{message.subject}</h4>
                            <p className="text-sm text-slate-600 mt-1">{message.preview}</p>
                          </div>
                          <span className="text-xs text-slate-500">{message.time}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Communications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      data-testid="button-email-parents"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email All Parents
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      data-testid="button-notify-coaches"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Notify Coaches
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      data-testid="button-emergency-alert"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Emergency Alert
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      data-testid="button-doctor-referral"
                    >
                      <Stethoscope className="h-4 w-4 mr-2" />
                      Doctor Referral
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Message Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-1">
                      <div className="p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                        Injury Report to Coach
                      </div>
                      <div className="p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                        Return to Play Clearance
                      </div>
                      <div className="p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                        Parent Notification
                      </div>
                      <div className="p-2 bg-slate-50 rounded cursor-pointer hover:bg-slate-100">
                        Doctor Consultation Request
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Medical Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Medical Documents</h3>
              <Button data-testid="button-upload-document">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Select>
                      <SelectTrigger className="w-48" data-testid="filter-document-type">
                        <SelectValue placeholder="Document Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Documents</SelectItem>
                        <SelectItem value="xray">X-Ray</SelectItem>
                        <SelectItem value="mri">MRI</SelectItem>
                        <SelectItem value="physical">Physical Exam</SelectItem>
                        <SelectItem value="clearance">Clearance Form</SelectItem>
                        <SelectItem value="doctor_note">Doctor's Note</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-48" data-testid="filter-athlete">
                        <SelectValue placeholder="Select Athlete" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Athletes</SelectItem>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="marcus">Marcus Williams</SelectItem>
                        <SelectItem value="emma">Emma Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <FileImage className="h-8 w-8 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">Knee MRI - Marcus Williams</h4>
                            <p className="text-sm text-slate-600">Dr. Sarah Chen • Sports Medicine Clinic</p>
                            <p className="text-sm text-slate-600">August 10, 2024</p>
                            <div className="flex space-x-2 mt-2">
                              <Badge variant="secondary">MRI</Badge>
                              <Badge variant="outline">Knee</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline" data-testid="button-view-document">
                            View
                          </Button>
                          <Button size="sm" variant="outline" data-testid="button-share-document">
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <FileText className="h-8 w-8 text-green-600 mt-1" />
                          <div className="flex-1">
                            <h4 className="font-medium">Physical Therapy Report - Sarah Johnson</h4>
                            <p className="text-sm text-slate-600">Elite Physical Therapy</p>
                            <p className="text-sm text-slate-600">August 12, 2024</p>
                            <div className="flex space-x-2 mt-2">
                              <Badge variant="secondary">PT Report</Badge>
                              <Badge variant="outline">Ankle</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline" data-testid="button-view-pt-report">
                            View
                          </Button>
                          <Button size="sm" variant="outline" data-testid="button-share-pt-report">
                            Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Upload New Document</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select>
                      <SelectTrigger data-testid="select-upload-athlete">
                        <SelectValue placeholder="Select Athlete" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="marcus">Marcus Williams</SelectItem>
                        <SelectItem value="emma">Emma Davis</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select>
                      <SelectTrigger data-testid="select-document-type">
                        <SelectValue placeholder="Document Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xray">X-Ray</SelectItem>
                        <SelectItem value="mri">MRI</SelectItem>
                        <SelectItem value="ct">CT Scan</SelectItem>
                        <SelectItem value="physical">Physical Exam</SelectItem>
                        <SelectItem value="clearance">Clearance Form</SelectItem>
                        <SelectItem value="doctor_note">Doctor's Note</SelectItem>
                        <SelectItem value="lab">Lab Results</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input placeholder="Doctor/Facility Name" data-testid="input-doctor-name" />
                    <Textarea placeholder="Description or notes..." data-testid="textarea-document-notes" />
                    
                    <Button className="w-full" data-testid="button-select-file">
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Care Plans Tab */}
          <TabsContent value="care-plans" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Active Care Plans</h3>
              <Button data-testid="button-new-care-plan">
                <Plus className="h-4 w-4 mr-2" />
                New Care Plan
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>ACL Recovery Protocol</CardTitle>
                      <CardDescription>Marcus Williams • Football</CardDescription>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-slate-600">Week 6 of 12</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '50%'}}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Current Phase: Strength Building</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Range of motion exercises - 3x daily</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span>Quad strengthening - 2x daily</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-slate-400" />
                        <span>Light jogging - Not started</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" data-testid="button-view-care-plan">
                      View Details
                    </Button>
                    <Button size="sm" variant="outline" data-testid="button-update-progress">
                      Update Progress
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Asthma Management Plan</CardTitle>
                      <CardDescription>Sarah Johnson • Basketball</CardDescription>
                    </div>
                    <Badge variant="secondary">Ongoing</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Emergency Action Plan</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span>Rescue inhaler always available</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span>Pre-exercise medication as needed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span>Monitor during high-intensity drills</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Assessments</h4>
                    <div className="text-sm text-slate-600">
                      <p>Last episode: July 28 (mild, resolved quickly)</p>
                      <p>Next check-up: September 1</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" data-testid="button-view-asthma-plan">
                      View Plan
                    </Button>
                    <Button size="sm" variant="outline" data-testid="button-log-incident">
                      Log Incident
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Supplies Tab */}
          <TabsContent value="supplies" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Inventory Management</h3>
                  <Button data-testid="button-add-supply">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-2">
                  {lowStockItems.map((item, index) => (
                    <Card key={index} className={`${item.status === 'critical' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.item}</h4>
                            <p className="text-sm text-slate-600">
                              Current: {item.current} | Minimum: {item.minimum}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={item.status === 'critical' ? 'destructive' : 'secondary'}>
                              {item.status === 'critical' ? 'Critical' : 'Low Stock'}
                            </Badge>
                            <Button size="sm" data-testid={`button-reorder-${item.item.toLowerCase().replace(' ', '-')}`}>
                              Reorder
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Full Inventory</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-4 text-sm font-medium text-slate-600 border-b pb-2">
                        <span>Item</span>
                        <span>Current Stock</span>
                        <span>Status</span>
                        <span>Action</span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm py-2">
                        <span>Ace Bandages</span>
                        <span>25</span>
                        <Badge variant="default" className="w-fit">Good</Badge>
                        <Button size="sm" variant="outline">Update</Button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm py-2">
                        <span>Instant Ice Packs</span>
                        <span>8</span>
                        <Badge variant="secondary" className="w-fit">Low</Badge>
                        <Button size="sm" variant="outline">Reorder</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-inventory-report">
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Inventory Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-order-history">
                      <Package className="h-4 w-4 mr-2" />
                      Order History
                    </Button>
                    <Button variant="outline" className="w-full justify-start" data-testid="button-suppliers">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Suppliers
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Reminders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>Medication expiry check - Aug 20</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-orange-600" />
                        <span>Emergency kit inspection - Aug 25</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Equipment Checks</h3>
                  <Button data-testid="button-new-check">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Check
                  </Button>
                </div>

                <div className="space-y-2">
                  {upcomingChecks.map((check, index) => (
                    <Card key={index} className={check.status === 'pending' ? 'border-orange-200 bg-orange-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{check.equipment}</h4>
                            <p className="text-sm text-slate-600">{check.type}</p>
                            <p className="text-sm text-slate-600">Due: {check.due}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={check.status === 'pending' ? 'secondary' : 'default'}>
                              {check.status}
                            </Badge>
                            <Button size="sm" data-testid={`button-perform-check-${index}`}>
                              Perform Check
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Certification Tracking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Your CPR Certification</span>
                        <Badge variant="default">Current</Badge>
                      </div>
                      <p className="text-xs text-slate-600">Expires: March 15, 2025</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Coach Johnson - CPR</span>
                        <Badge variant="destructive">Expires Soon</Badge>
                      </div>
                      <p className="text-xs text-slate-600">Expires: August 30, 2024</p>
                    </div>

                    <Button size="sm" className="w-full" data-testid="button-certification-alerts">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Renewal Alerts
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Emergency Equipment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AED Unit #1</span>
                        <Badge variant="default">Operational</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Emergency Phone</span>
                        <Badge variant="default">Tested</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Spine Board</span>
                        <Badge variant="secondary">Check Due</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Injury Consultation Modal */}
        {showAIConsultant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Brain className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">AI Injury Assessment & Rehabilitation Consultant</h2>
                      <p className="text-sm text-gray-600">Evidence-based recommendations for injury evaluation and recovery protocols</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAIConsultant(false)}
                    data-testid="button-close-ai-consultant"
                  >
                    ×
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Athlete Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Athlete Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Athlete Name</label>
                      <Input
                        value={aiConsultation.athleteName}
                        onChange={(e) => setAiConsultation(prev => ({ ...prev, athleteName: e.target.value }))}
                        placeholder="Enter athlete's name"
                        data-testid="input-athlete-name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sport/Activity</label>
                      <Select 
                        value={aiConsultation.sport}
                        onValueChange={(value) => setAiConsultation(prev => ({ ...prev, sport: value }))}
                      >
                        <SelectTrigger data-testid="select-sport-consultation">
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baseball">Baseball</SelectItem>
                          <SelectItem value="softball">Softball</SelectItem>
                          <SelectItem value="tennis">Tennis</SelectItem>
                          <SelectItem value="volleyball">Volleyball</SelectItem>
                          <SelectItem value="swimming">Swimming</SelectItem>
                          <SelectItem value="track_throwing">Track & Field (Throwing)</SelectItem>
                          <SelectItem value="football">Football (Quarterback)</SelectItem>
                          <SelectItem value="basketball">Basketball</SelectItem>
                          <SelectItem value="other">Other Throwing Sport</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Injury Location</label>
                      <Select 
                        value={aiConsultation.injuryLocation}
                        onValueChange={(value) => setAiConsultation(prev => ({ ...prev, injuryLocation: value }))}
                      >
                        <SelectTrigger data-testid="select-injury-location">
                          <SelectValue placeholder="Select area of concern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shoulder">Shoulder</SelectItem>
                          <SelectItem value="elbow">Elbow</SelectItem>
                          <SelectItem value="wrist">Wrist</SelectItem>
                          <SelectItem value="lower_back">Lower Back</SelectItem>
                          <SelectItem value="hip">Hip</SelectItem>
                          <SelectItem value="knee">Knee</SelectItem>
                          <SelectItem value="ankle">Ankle</SelectItem>
                          <SelectItem value="neck">Neck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pain Level (1-10)</label>
                      <Select 
                        value={aiConsultation.painLevel}
                        onValueChange={(value) => setAiConsultation(prev => ({ ...prev, painLevel: value }))}
                      >
                        <SelectTrigger data-testid="select-pain-level">
                          <SelectValue placeholder="Select pain level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-2">1-2 (Minimal)</SelectItem>
                          <SelectItem value="3-4">3-4 (Mild)</SelectItem>
                          <SelectItem value="5-6">5-6 (Moderate)</SelectItem>
                          <SelectItem value="7-8">7-8 (Severe)</SelectItem>
                          <SelectItem value="9-10">9-10 (Extreme)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Injury Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900">Injury Assessment</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Onset</label>
                      <Select 
                        value={aiConsultation.onset}
                        onValueChange={(value) => setAiConsultation(prev => ({ ...prev, onset: value }))}
                      >
                        <SelectTrigger data-testid="select-onset">
                          <SelectValue placeholder="When did symptoms start?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acute">Acute (sudden onset)</SelectItem>
                          <SelectItem value="gradual">Gradual (developed over time)</SelectItem>
                          <SelectItem value="recurrent">Recurrent (comes and goes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mechanism of Injury</label>
                      <Select 
                        value={aiConsultation.mechanism}
                        onValueChange={(value) => setAiConsultation(prev => ({ ...prev, mechanism: value }))}
                      >
                        <SelectTrigger data-testid="select-mechanism">
                          <SelectValue placeholder="How did the injury occur?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overuse">Overuse/Repetitive Motion</SelectItem>
                          <SelectItem value="contact">Direct Contact/Collision</SelectItem>
                          <SelectItem value="non_contact">Non-Contact (Plant/Cut)</SelectItem>
                          <SelectItem value="fall">Fall</SelectItem>
                          <SelectItem value="unknown">Unknown/Insidious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Activity Level</label>
                      <Select 
                        value={aiConsultation.currentActivity}
                        onValueChange={(value) => setAiConsultation(prev => ({ ...prev, currentActivity: value }))}
                      >
                        <SelectTrigger data-testid="select-activity-level">
                          <SelectValue placeholder="Current participation status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Participation</SelectItem>
                          <SelectItem value="limited">Limited Participation</SelectItem>
                          <SelectItem value="rest">Complete Rest</SelectItem>
                          <SelectItem value="modified">Modified Activities Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
                      <Textarea
                        value={aiConsultation.symptoms}
                        onChange={(e) => setAiConsultation(prev => ({ ...prev, symptoms: e.target.value }))}
                        placeholder="Describe symptoms: pain during throwing, stiffness, weakness, swelling, etc."
                        className="min-h-[80px]"
                        data-testid="textarea-symptoms"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Previous Injuries</label>
                      <Textarea
                        value={aiConsultation.previousInjuries}
                        onChange={(e) => setAiConsultation(prev => ({ ...prev, previousInjuries: e.target.value }))}
                        placeholder="Any previous injuries to this area or related areas"
                        className="min-h-[60px]"
                        data-testid="textarea-previous-injuries"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                {aiConsultation.injuryLocation && aiConsultation.sport && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">AI-Powered Assessment & Recommendations</h3>
                    
                    {/* Comprehensive Injury-Specific AI Recommendations */}
                    {((aiConsultation.injuryLocation === 'shoulder' || aiConsultation.injuryLocation === 'elbow') && 
                     ['baseball', 'softball', 'tennis', 'volleyball', 'track_throwing', 'football'].includes(aiConsultation.sport)) && (
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Target className="h-5 w-5 text-purple-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-purple-900">Throwing Athlete Assessment</h4>
                              <p className="text-sm text-purple-700 mt-1">
                                Based on current research for {aiConsultation.injuryLocation} injuries in {aiConsultation.sport} athletes.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                                Immediate Assessment
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              {aiConsultation.injuryLocation === 'shoulder' ? (
                                <>
                                  <p>• Perform Athletic Shoulder Test (AST)</p>
                                  <p>• Check passive/active range of motion</p>
                                  <p>• Assess rotator cuff strength</p>
                                  <p>• Evaluate scapular stability</p>
                                  <p>• Pain with overhead motion?</p>
                                </>
                              ) : (
                                <>
                                  <p>• Evaluate elbow valgus stress</p>
                                  <p>• Check UCL integrity (moving valgus test)</p>
                                  <p>• Assess flexor-pronator muscle group</p>
                                  <p>• Range of motion: flexion/extension</p>
                                  <p>• Medial vs lateral elbow pain location</p>
                                </>
                              )}
                            </CardContent>
                          </Card>

                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                Recovery Protocol
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              {aiConsultation.injuryLocation === 'shoulder' ? (
                                <>
                                  <p>• Begin with pain-free range of motion</p>
                                  <p>• Progress to rotator cuff strengthening</p>
                                  <p>• Emphasize posterior capsule mobility</p>
                                  <p>• Scapular stabilization exercises</p>
                                  <p>• Gradual return to throwing program</p>
                                </>
                              ) : (
                                <>
                                  <p>• Rest from throwing activities initially</p>
                                  <p>• Strengthen flexor-pronator muscles</p>
                                  <p>• Address total arm strength deficits</p>
                                  <p>• Improve throwing mechanics</p>
                                  <p>• Interval throwing program when ready</p>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-orange-200 bg-orange-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                              Red Flags - Refer to Physician
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 text-sm space-y-1">
                            <p>• Severe pain (7-10/10) with throwing</p>
                            <p>• Significant strength loss or weakness</p>
                            <p>• Numbness, tingling, or neurological symptoms</p>
                            <p>• Inability to continue sport participation</p>
                            <p>• No improvement after 1-2 weeks of conservative treatment</p>
                          </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-purple-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-purple-600" />
                              Prevention Strategies
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 text-sm space-y-1">
                            <p>• Monitor throwing volume and intensity</p>
                            <p>• Maintain year-round conditioning</p>
                            <p>• Address flexibility deficits (GIRD, posterior tightness)</p>
                            <p>• Regular biomechanical assessment</p>
                            <p>• Proper warm-up and cool-down protocols</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* ACL Injury Assessment - 96% AI Diagnostic Accuracy */}
                    {aiConsultation.injuryLocation === 'knee' && aiConsultation.mechanism === 'non_contact' && (
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-red-900">High ACL Injury Risk - Non-Contact Mechanism</h4>
                              <p className="text-sm text-red-700 mt-1">
                                AI models show 96% accuracy in ACL tear detection. Non-contact mechanism in {aiConsultation.sport} significantly increases ACL injury probability.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                                Immediate ACL Assessment
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Lachman test (highest sensitivity)</p>
                              <p>• Anterior drawer test</p>
                              <p>• Pivot shift test (most specific)</p>
                              <p>• Check for effusion and range of motion</p>
                              <p>• Assess valgus stress and joint line tenderness</p>
                              <p>• 3D biomechanical movement analysis if available</p>
                            </CardContent>
                          </Card>

                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                ACL Rehabilitation Protocol
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Phase 1: Control swelling, restore ROM</p>
                              <p>• Phase 2: Quadriceps strengthening (key predictor)</p>
                              <p>• Phase 3: Proprioceptive training</p>
                              <p>• Phase 4: Sport-specific movements</p>
                              <p>• AI-monitored return-to-sport criteria</p>
                              <p>• Continuous risk monitoring post-return</p>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-orange-200 bg-orange-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-orange-600" />
                              ACL Red Flags - Immediate MRI/Orthopedic Referral
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 text-sm space-y-1">
                            <p>• Positive Lachman with firm endpoint loss</p>
                            <p>• Significant knee instability with pivot shift</p>
                            <p>• Unable to bear weight or continue activity</p>
                            <p>• Large effusion with mechanical symptoms</p>
                            <p>• Combined injury patterns (ACL + MCL + meniscus)</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Ankle Injury Assessment - AI Biomechanical Analysis */}
                    {aiConsultation.injuryLocation === 'ankle' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Target className="h-5 w-5 text-blue-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-blue-900">AI-Enhanced Ankle Assessment</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                Wearable sensors and AI provide 95% accuracy in ankle movement analysis and injury prediction.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-purple-200 bg-purple-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <Stethoscope className="h-4 w-4 mr-2 text-purple-600" />
                                Comprehensive Ankle Evaluation
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Ottawa Ankle Rules for fracture screening</p>
                              <p>• Anterior drawer test (ATFL integrity)</p>
                              <p>• Talar tilt test (CFL assessment)</p>
                              <p>• Weight-bearing capability assessment</p>
                              <p>• 3D kinematic landing mechanics analysis</p>
                              <p>• Proprioceptive testing with AI feedback</p>
                            </CardContent>
                          </Card>

                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                Progressive Ankle Rehabilitation
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• RICE protocol in acute phase</p>
                              <p>• Early mobilization (grade I-II sprains)</p>
                              <p>• Balance and proprioceptive training</p>
                              <p>• Strengthening: peroneal, tibialis anterior</p>
                              <p>• Sport-specific movement patterns</p>
                              <p>• AI-monitored return to play criteria</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Concussion Management - 95% AI Prediction Accuracy */}
                    {aiConsultation.injuryLocation === 'neck' || aiConsultation.symptoms.toLowerCase().includes('head') || 
                     aiConsultation.symptoms.toLowerCase().includes('concussion') && (
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                          <div className="flex items-start space-x-3">
                            <Brain className="h-5 w-5 text-red-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-red-900">Concussion Protocol - AI Risk Assessment</h4>
                              <p className="text-sm text-red-700 mt-1">
                                AI models achieve 95% accuracy in post-concussion injury risk prediction. Mandatory 11-day minimum stand-down protocol.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                                Immediate Concussion Assessment
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• SCAT5 or ImPACT baseline comparison</p>
                              <p>• Cognitive assessment (orientation, memory)</p>
                              <p>• Balance testing (modified BESS)</p>
                              <p>• Symptom inventory (headache, nausea, dizziness)</p>
                              <p>• Cervical spine clearance</p>
                              <p>• Sleep pattern analysis via AI monitoring</p>
                            </CardContent>
                          </Card>

                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                                Return-to-Play Protocol
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Minimum 11-day stand-down (evidence-based)</p>
                              <p>• 6-stage graduated return protocol</p>
                              <p>• Daily symptom monitoring with AI</p>
                              <p>• Cognitive testing at each stage</p>
                              <p>• Medical clearance required</p>
                              <p>• Extended monitoring for secondary injury risk</p>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-red-200 bg-red-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-red-600" />
                              Emergency Red Flags - Immediate Medical Attention
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 text-sm space-y-1">
                            <p>• Deteriorating consciousness or confusion</p>
                            <p>• Repeated vomiting or severe headache</p>
                            <p>• Seizures or abnormal behavior</p>
                            <p>• Double vision or pupils unequal in size</p>
                            <p>• Weakness or numbness in limbs</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Hamstring Injury - AI Prediction Models */}
                    {(aiConsultation.injuryLocation === 'hip' && aiConsultation.symptoms.toLowerCase().includes('hamstring')) ||
                     (aiConsultation.mechanism === 'overuse' && ['track_throwing', 'football', 'basketball'].includes(aiConsultation.sport)) && (
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Zap className="h-5 w-5 text-yellow-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-yellow-900">Hamstring Strain - AI Predictive Analysis</h4>
                              <p className="text-sm text-yellow-700 mt-1">
                                AI models with AUC-ROC 0.747 accuracy identify high-risk athletes through biomechanical analysis.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-orange-200 bg-orange-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <Target className="h-4 w-4 mr-2 text-orange-600" />
                                Hamstring Assessment Protocol
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Eccentric strength testing (key predictor)</p>
                              <p>• Hamstring-to-quadriceps ratio analysis</p>
                              <p>• Previous injury history evaluation</p>
                              <p>• Real-time EMG during high-speed movements</p>
                              <p>• Flexibility assessment (90/90 test)</p>
                              <p>• Fatigue monitoring through workload tracking</p>
                            </CardContent>
                          </Card>

                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                Evidence-Based Rehabilitation
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Eccentric strengthening (Nordic hamstrings)</p>
                              <p>• Progressive loading protocols</p>
                              <p>• Neuromuscular control training</p>
                              <p>• Sport-specific movement patterns</p>
                              <p>• Running progression (pace/distance)</p>
                              <p>• AI-monitored biomechanical correction</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* Back/Spine Injury Assessment */}
                    {aiConsultation.injuryLocation === 'lower_back' && (
                      <div className="space-y-4">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Shield className="h-5 w-5 text-indigo-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-indigo-900">Lower Back Assessment - AI Diagnostic Support</h4>
                              <p className="text-sm text-indigo-700 mt-1">
                                AI image processing and biomechanical analysis for comprehensive spine evaluation.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-purple-200 bg-purple-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <Stethoscope className="h-4 w-4 mr-2 text-purple-600" />
                                Comprehensive Back Evaluation
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Range of motion assessment (flexion/extension)</p>
                              <p>• Neurological screening (reflexes, sensation)</p>
                              <p>• Straight leg raise test</p>
                              <p>• Core stability assessment</p>
                              <p>• Movement pattern analysis</p>
                              <p>• AI-assisted posture evaluation</p>
                            </CardContent>
                          </Card>

                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                Progressive Back Rehabilitation
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Pain management and movement restoration</p>
                              <p>• Core strengthening progression</p>
                              <p>• Movement re-education</p>
                              <p>• Sport-specific loading protocols</p>
                              <p>• Ergonomic and technique modification</p>
                              <p>• AI-monitored movement quality</p>
                            </CardContent>
                          </Card>
                        </div>

                        <Card className="border-red-200 bg-red-50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                              Red Flags - Immediate Medical Referral
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0 text-sm space-y-1">
                            <p>• Cauda equina syndrome symptoms</p>
                            <p>• Progressive neurological deficits</p>
                            <p>• Bowel/bladder dysfunction</p>
                            <p>• Severe night pain or fever</p>
                            <p>• Saddle anesthesia</p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* Hip Injury Assessment */}
                    {aiConsultation.injuryLocation === 'hip' && !aiConsultation.symptoms.toLowerCase().includes('hamstring') && (
                      <div className="space-y-4">
                        <div className="bg-teal-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <Target className="h-5 w-5 text-teal-600 mt-1" />
                            <div>
                              <h4 className="font-medium text-teal-900">Hip Assessment - AI Pattern Recognition</h4>
                              <p className="text-sm text-teal-700 mt-1">
                                Machine learning analysis of hip biomechanics and movement patterns for accurate diagnosis.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="border-blue-200 bg-blue-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <Stethoscope className="h-4 w-4 mr-2 text-blue-600" />
                                Hip Assessment Protocol
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Range of motion (flexion, extension, rotation)</p>
                              <p>• Hip impingement tests (FADIR, FABER)</p>
                              <p>• Strength testing (hip abductors, flexors)</p>
                              <p>• Trendelenburg test for stability</p>
                              <p>• Gait analysis and movement screening</p>
                              <p>• AI-assisted biomechanical evaluation</p>
                            </CardContent>
                          </Card>

                          <Card className="border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm flex items-center">
                                <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                                Hip Rehabilitation Strategy
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 text-sm space-y-2">
                              <p>• Pain reduction and mobility restoration</p>
                              <p>• Hip stabilizer strengthening</p>
                              <p>• Movement pattern correction</p>
                              <p>• Sport-specific functional training</p>
                              <p>• Load management protocols</p>
                              <p>• AI-guided progress monitoring</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {/* General Evidence-Based Recommendations */}
                    {!['knee', 'ankle', 'neck', 'hip', 'lower_back'].includes(aiConsultation.injuryLocation) && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Brain className="h-5 w-5 text-gray-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-gray-900">Evidence-Based {aiConsultation.injuryLocation.charAt(0).toUpperCase() + aiConsultation.injuryLocation.slice(1)} Assessment</h4>
                            <p className="text-sm text-gray-700 mt-2">
                              For {aiConsultation.injuryLocation} injuries in {aiConsultation.sport} athletes:
                            </p>
                            <ul className="text-sm text-gray-700 mt-2 space-y-1">
                              <li>• Comprehensive injury assessment using validated clinical tests</li>
                              <li>• Evidence-based rehabilitation protocols specific to {aiConsultation.sport}</li>
                              <li>• AI-monitored progress tracking and outcome measures</li>
                              <li>• Sport-specific return-to-play criteria</li>
                              <li>• Physician consultation for persistent or severe symptoms</li>
                              <li>• Preventive strategies based on injury mechanism and sport demands</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setAiConsultation({
                      athleteName: '',
                      sport: '',
                      injuryLocation: '',
                      symptoms: '',
                      painLevel: '',
                      onset: '',
                      mechanism: '',
                      previousInjuries: '',
                      currentActivity: ''
                    })}
                    data-testid="button-clear-consultation"
                  >
                    Clear Form
                  </Button>
                  
                  <div className="space-x-3">
                    <Button 
                      variant="outline"
                      data-testid="button-save-consultation"
                    >
                      Save Assessment
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      data-testid="button-create-care-plan"
                    >
                      Create Care Plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}