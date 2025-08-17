import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Activity, Users, Calendar, MessageSquare, Package, AlertTriangle, FileText, Phone } from "lucide-react";
import { useLocation } from "wouter";

// Demo data for Jolynn Millette's Athletic Trainer Dashboard
const athleteData = [
  {
    id: "1",
    name: "Sarah Johnson",
    sport: "Basketball", 
    grade: "11th",
    status: "active",
    lastVisit: "Today",
    medicalAlerts: ["Asthma"],
    nextAppointment: "Tomorrow 2:00 PM",
    parentContact: "Jennifer Johnson - (555) 123-4567"
  },
  {
    id: "2",
    name: "Marcus Williams", 
    sport: "Football",
    grade: "12th",
    status: "injured",
    lastVisit: "Yesterday",
    medicalAlerts: ["Concussion Protocol", "ACL Recovery"],
    nextAppointment: "Friday 10:00 AM",
    parentContact: "Robert Williams - (555) 234-5678"
  },
  {
    id: "3",
    name: "Emma Davis",
    sport: "Track & Field",
    grade: "10th",
    status: "cleared",
    lastVisit: "3 days ago", 
    medicalAlerts: [],
    nextAppointment: "None scheduled",
    parentContact: "Lisa Davis - (555) 345-6789"
  }
];

const messages = [
  {
    from: "Dr. Smith - Sports Medicine",
    subject: "Marcus Williams - MRI Results", 
    time: "2 hours ago",
    priority: "high",
    preview: "MRI shows significant improvement in ACL repair..."
  },
  {
    from: "Jennifer Johnson (Parent)",
    subject: "Sarah's Inhaler Refill",
    time: "4 hours ago", 
    priority: "medium",
    preview: "Sarah needs a new prescription for her rescue inhaler..."
  }
];

const supplies = [
  { 
    item: "Elastic Bandages (4-inch)", 
    current: 15, 
    minimum: 10, 
    status: "adequate",
    location: "Cabinet B-2",
    barcode: "UPC: 072140002428",
    supplier: "BSN Medical",
    trackingMethod: "Manual Count + Phone Scanner",
    lastReorder: "2 weeks ago",
    notes: "ACE brand - most common, scan UPC with phone"
  },
  { 
    item: "Ice Packs (Instant)", 
    current: 8, 
    minimum: 12, 
    status: "low",
    location: "Freezer Unit A", 
    barcode: "UPC: 074676671208",
    supplier: "Mueller Sports Medicine",
    trackingMethod: "Manual Count (expiration tracking)",
    lastReorder: "1 week ago",
    notes: "Check expiration dates monthly - disposable packs"
  },
  { 
    item: "Antiseptic Wipes", 
    current: 45, 
    minimum: 20, 
    status: "adequate",
    location: "Medical Cabinet A",
    barcode: "UPC: 092265221344", 
    supplier: "First Aid Only",
    trackingMethod: "QR Code System",
    lastReorder: "3 weeks ago",
    notes: "Custom QR labels - scan to update count"
  },
  { 
    item: "Athletic Tape (1.5-inch)", 
    current: 3, 
    minimum: 8, 
    status: "critical",
    location: "Tape Station",
    barcode: "UPC: 074676642109",
    supplier: "Cramer Products", 
    trackingMethod: "Inventory App (TeamSideline)",
    lastReorder: "4 weeks ago",
    notes: "White tape - most used, tracked via mobile app"
  }
];

export default function AthleticTrainerDemo() {
  const [location, navigate] = useLocation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'injured': return 'bg-red-100 text-red-800';  
      case 'cleared': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSupplyStatusColor = (status: string) => {
    switch (status) {
      case 'adequate': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Athletic Trainer Dashboard</h1>
              <p className="text-slate-600 mt-1">Welcome back, Jolynn Millette</p>
              <Badge className="mt-2 bg-blue-500">School Athletic Trainer</Badge>
            </div>
            <Button onClick={() => navigate('/role-dashboard')} variant="outline">
              Back to Main Dashboard
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Athletes</p>
                  <p className="text-2xl font-bold">{athleteData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Injuries</p>
                  <p className="text-2xl font-bold">{athleteData.filter(a => a.status === 'injured').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Today's Appointments</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">New Messages</p>
                  <p className="text-2xl font-bold">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="athletes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="supplies">Supplies</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Athletes Tab */}
          <TabsContent value="athletes">
            <Card>
              <CardHeader>
                <CardTitle>Athlete Health Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {athleteData.map((athlete) => (
                    <div key={athlete.id} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{athlete.name}</h3>
                            <Badge className={getStatusColor(athlete.status)}>
                              {athlete.status}
                            </Badge>
                            <span className="text-sm text-slate-600">{athlete.sport} - {athlete.grade}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Last Visit:</span> {athlete.lastVisit}
                            </div>
                            <div>
                              <span className="font-medium">Next Appointment:</span> {athlete.nextAppointment}
                            </div>
                            <div>
                              <span className="font-medium">Parent Contact:</span> {athlete.parentContact}
                            </div>
                          </div>

                          {athlete.medicalAlerts.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium text-red-600">Medical Alerts:</span>
                              <div className="flex gap-2 mt-1">
                                {athlete.medicalAlerts.map((alert, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {alert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-1" />
                            Records
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{message.from}</h4>
                            <Badge className={getPriorityColor(message.priority)}>
                              {message.priority}
                            </Badge>
                            <span className="text-sm text-slate-500">{message.time}</span>
                          </div>
                          <h5 className="font-medium mb-1">{message.subject}</h5>
                          <p className="text-sm text-slate-600">{message.preview}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Reply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Supplies Tab */}
          <TabsContent value="supplies">
            <div className="space-y-6">
              {/* Inventory Tracking Methods Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Supply Tracking Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">📱 Phone Scanner Methods:</h4>
                      <ul className="space-y-1 text-slate-700">
                        <li>• <strong>UPC Barcode Scanner:</strong> Use phone camera to scan manufacturer barcodes</li>
                        <li>• <strong>Inventory Apps:</strong> TeamSideline, Sortly, or similar apps</li>
                        <li>• <strong>Custom QR Codes:</strong> Create and print QR labels for custom tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">📝 Manual & Hybrid Methods:</h4>
                      <ul className="space-y-1 text-slate-700">
                        <li>• <strong>Manual Count:</strong> Traditional clipboard and pencil inventory</li>
                        <li>• <strong>Spreadsheet Tracking:</strong> Digital forms with manual entry</li>
                        <li>• <strong>Color-Coded Labels:</strong> Visual management system</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Medical Supply Inventory</CardTitle>
                  <CardContent className="text-sm text-slate-600 mt-2">
                    Multiple tracking methods in use - from phone scanners to manual counts
                  </CardContent>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {supplies.map((supply, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{supply.item}</h4>
                              <Badge className={getSupplyStatusColor(supply.status)}>
                                {supply.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><span className="font-medium">Current Stock:</span> {supply.current}</p>
                                <p><span className="font-medium">Minimum Level:</span> {supply.minimum}</p>
                                <p><span className="font-medium">Location:</span> {supply.location}</p>
                                <p><span className="font-medium">Supplier:</span> {supply.supplier}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Tracking Method:</span> {supply.trackingMethod}</p>
                                <p><span className="font-medium">Barcode:</span> <code className="bg-gray-100 px-1 rounded text-xs">{supply.barcode}</code></p>
                                <p><span className="font-medium">Last Reorder:</span> {supply.lastReorder}</p>
                              </div>
                            </div>
                            
                            <div className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600">
                              <strong>Tracking Notes:</strong> {supply.notes}
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2 ml-4">
                            {supply.status === 'critical' && (
                              <Button size="sm" variant="destructive">
                                🚨 Order Now
                              </Button>
                            )}
                            {supply.status === 'low' && (
                              <Button size="sm" variant="outline">
                                📦 Reorder
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              📱 Scan Update
                            </Button>
                            <Button size="sm" variant="outline">
                              📝 Manual Count
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">💡 Pro Tip: Mixed Tracking Approach</h4>
                    <p className="text-sm text-green-700">
                      Most athletic trainers use a combination: UPC scanning for manufactured items, custom QR codes for bulk supplies, 
                      and manual counts for consumables. Apps like <strong>TeamSideline</strong> or <strong>Sortly</strong> work great with phone cameras.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Sarah Johnson - Follow-up</h4>
                        <p className="text-sm text-slate-600">Asthma management check</p>
                      </div>
                      <Badge variant="outline">2:00 PM</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Equipment Check</h4>
                        <p className="text-sm text-slate-600">Weekly AED and emergency equipment inspection</p>
                      </div>
                      <Badge variant="outline">3:30 PM</Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Football Practice Coverage</h4>
                        <p className="text-sm text-slate-600">On-field medical coverage</p>
                      </div>
                      <Badge variant="outline">4:00 PM - 6:00 PM</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}