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
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function AthleticTrainerDashboard() {
  const { user } = useAuth();
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [showMessageComposer, setShowMessageComposer] = useState(false);

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
      </div>
    </div>
  );
}