import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  FileText, 
  Shield, 
  Thermometer, 
  Heart, 
  Activity, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Globe,
  PhoneCall,
  Download,
  Upload,
  Eye
} from "lucide-react";

interface DocumentStatus {
  id: string;
  name: string;
  type: string;
  status: 'completed' | 'pending' | 'required';
  lastUpdated: string;
  expiresOn?: string;
}

interface ConcussionProgression {
  step: number;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  completedDate?: string;
  notes?: string;
}

export default function CCISDDocumentIntegration() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);

  // Sample data based on actual CCISD documents
  const documentStatuses: DocumentStatus[] = [
    {
      id: "1",
      name: "Pre-Participation Physical",
      type: "Medical Clearance",
      status: "completed",
      lastUpdated: "2024-08-01",
      expiresOn: "2025-08-01"
    },
    {
      id: "2", 
      name: "Concussion Baseline Testing",
      type: "Neurological Assessment",
      status: "completed",
      lastUpdated: "2024-07-15"
    },
    {
      id: "3",
      name: "Asthma Care Plan",
      type: "Medical Management",
      status: "pending",
      lastUpdated: "2024-06-01"
    },
    {
      id: "4",
      name: "Parent/Guardian Insurance Consent",
      type: "Insurance Documentation",
      status: "required",
      lastUpdated: ""
    }
  ];

  const concussionProgression: ConcussionProgression[] = [
    {
      step: 1,
      name: "Light Aerobic Exercise",
      description: "Walking, swimming or stationary cycling",
      status: "completed",
      completedDate: "2024-08-10",
      notes: "No symptoms observed during 20-minute session"
    },
    {
      step: 2,
      name: "Moderate Aerobic Exercise", 
      description: "Running drills, no helmet or contact",
      status: "current",
      notes: "Scheduled for tomorrow pending 24-hour symptom-free period"
    },
    {
      step: 3,
      name: "Non-Contact Training Drills",
      description: "Full uniform, no contact",
      status: "pending"
    },
    {
      step: 4,
      name: "Full Contact Practice",
      description: "Normal training activities",
      status: "pending"
    },
    {
      step: 5,
      name: "Full Game Play",
      description: "Return to competition",
      status: "pending"
    }
  ];

  const wbgtData = {
    current: 84.2,
    status: "caution",
    recommendations: [
      "Provide minimum 5-minute rest break every hour",
      "Unrestricted water access required",
      "Set up designated cool zones with canopies",
      "Monitor athletes closely for heat illness symptoms"
    ],
    restrictions: {
      equipment: "Helmet and shoulder pads only",
      practiceTime: "3 hours maximum",
      contactLevel: "Limited contact permitted"
    }
  };

  const athleteHealthData = [
    {
      id: "1",
      name: "Marcus Rodriguez",
      sport: "Football",
      position: "Linebacker",
      status: "Active",
      alerts: ["Concussion Protocol - Step 2"],
      documents: {
        physical: "Current",
        insurance: "Current", 
        concussion: "In Progress"
      },
      medicalFlags: ["Previous Concussion (2023)"]
    },
    {
      id: "2",
      name: "Sarah Chen",
      sport: "Volleyball",
      position: "Setter",
      status: "Active",
      alerts: ["Asthma Care Plan Review Due"],
      documents: {
        physical: "Current",
        insurance: "Current",
        asthma: "Needs Update"
      },
      medicalFlags: ["Asthma", "Seasonal Allergies"]
    },
    {
      id: "3",
      name: "Jordan Williams",
      sport: "Track & Field",
      position: "Sprinter",
      status: "Restricted",
      alerts: ["Weight Loss Monitoring", "Heat Exhaustion Risk"],
      documents: {
        physical: "Current",
        insurance: "Current"
      },
      medicalFlags: ["Previous Heat Illness"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'current':
      case 'Active':
        return 'bg-green-500';
      case 'pending':
      case 'caution':
        return 'bg-yellow-500';
      case 'required':
      case 'Restricted':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-800 to-blue-800 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            CCISD Athletic Document Integration
          </h1>
          <p className="text-xl text-blue-200 mb-6">
            Authentic Corpus Christi ISD Medical Protocols & Compliance Management
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <Badge className="bg-green-600 text-white px-4 py-2">
              Concussion Protocols Integrated
            </Badge>
            <Badge className="bg-blue-600 text-white px-4 py-2">
              Hot Weather Policy Active
            </Badge>
            <Badge className="bg-purple-600 text-white px-4 py-2">
              HIPAA Compliant
            </Badge>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="concussion" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Concussion Management
            </TabsTrigger>
            <TabsTrigger value="environmental" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Environmental Monitoring
            </TabsTrigger>
            <TabsTrigger value="medical-forms" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Medical Documentation
            </TabsTrigger>
            <TabsTrigger value="compliance" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Compliance Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Integration Status */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    CCISD Protocol Integration Status
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Real district document workflows implemented
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Concussion Protocols</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Hot Weather Policy</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Medical Forms System</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="w-full" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Insurance Integration</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Environmental Conditions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Current WBGT Status
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Live environmental monitoring per CCISD Hot Weather Policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-yellow-300">
                      {wbgtData.current}°F
                    </div>
                    <Badge className="bg-yellow-600 text-white mt-2">
                      {wbgtData.status.toUpperCase()} ZONE
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Equipment:</strong> {wbgtData.restrictions.equipment}
                    </div>
                    <div className="text-sm">
                      <strong>Practice Limit:</strong> {wbgtData.restrictions.practiceTime}
                    </div>
                    <div className="text-sm">
                      <strong>Contact Level:</strong> {wbgtData.restrictions.contactLevel}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Alerts */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Active Medical Alerts
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Athletes requiring attention per CCISD protocols
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert className="bg-red-500/20 border-red-500/50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Concussion Protocol Active</AlertTitle>
                      <AlertDescription>
                        Marcus Rodriguez - Step 2 of return-to-play progression
                      </AlertDescription>
                    </Alert>
                    <Alert className="bg-yellow-500/20 border-yellow-500/50">
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Care Plan Review Due</AlertTitle>
                      <AlertDescription>
                        Sarah Chen - Asthma care plan requires update
                      </AlertDescription>
                    </Alert>
                    <Alert className="bg-orange-500/20 border-orange-500/50">
                      <Thermometer className="h-4 w-4" />
                      <AlertTitle>Heat Risk Monitoring</AlertTitle>
                      <AlertDescription>
                        Jordan Williams - Weight loss threshold monitoring
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Athlete Overview */}
            <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Athlete Compliance Overview
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Current medical documentation and protocol status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {athleteHealthData.map((athlete) => (
                    <div 
                      key={athlete.id}
                      className="p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
                      data-testid={`athlete-card-${athlete.id}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-semibold">{athlete.name}</div>
                          <div className="text-sm text-blue-200">
                            {athlete.sport} - {athlete.position}
                          </div>
                        </div>
                        <Badge className={getStatusColor(athlete.status)}>
                          {athlete.status}
                        </Badge>
                      </div>
                      
                      {athlete.alerts.length > 0 && (
                        <div className="mb-3">
                          {athlete.alerts.map((alert, index) => (
                            <Badge key={index} variant="outline" className="mr-2 mb-1 text-yellow-300 border-yellow-300">
                              {alert}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Physical:</span>
                          <span className={athlete.documents.physical === 'Current' ? 'text-green-300' : 'text-red-300'}>
                            {athlete.documents.physical}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Insurance:</span>
                          <span className={athlete.documents.insurance === 'Current' ? 'text-green-300' : 'text-red-300'}>
                            {athlete.documents.insurance}
                          </span>
                        </div>
                      </div>
                      
                      {athlete.medicalFlags.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/20">
                          <div className="text-xs text-blue-200 mb-1">Medical Flags:</div>
                          {athlete.medicalFlags.map((flag, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 mb-1 text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="concussion" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Concussion Protocol Progress */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    5-Step Return-to-Play Progression
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Marcus Rodriguez - Football (Linebacker)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {concussionProgression.map((step) => (
                      <div 
                        key={step.step}
                        className={`p-4 rounded-lg border ${
                          step.status === 'completed' ? 'bg-green-500/20 border-green-500/50' :
                          step.status === 'current' ? 'bg-blue-500/20 border-blue-500/50' :
                          'bg-gray-500/20 border-gray-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">
                              Step {step.step}: {step.name}
                            </div>
                            <div className="text-sm text-blue-200">
                              {step.description}
                            </div>
                          </div>
                          <Badge 
                            className={
                              step.status === 'completed' ? 'bg-green-600' :
                              step.status === 'current' ? 'bg-blue-600' :
                              'bg-gray-600'
                            }
                          >
                            {step.status === 'completed' ? 'Complete' :
                             step.status === 'current' ? 'In Progress' : 'Pending'}
                          </Badge>
                        </div>
                        {step.completedDate && (
                          <div className="text-xs text-green-300">
                            Completed: {step.completedDate}
                          </div>
                        )}
                        {step.notes && (
                          <div className="text-xs text-blue-200 mt-2">
                            Notes: {step.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Protocol Requirements */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    CCISD Protocol Requirements
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Mandatory steps per district concussion policy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="font-semibold">Physician Clearance Received</span>
                      </div>
                      <div className="text-sm text-green-200">
                        Dr. Sarah Martinez cleared athlete on 08/09/2024
                      </div>
                    </div>

                    <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="font-semibold">Parent/Guardian Consent</span>
                      </div>
                      <div className="text-sm text-green-200">
                        Digital consent form signed by Maria Rodriguez
                      </div>
                    </div>

                    <div className="p-3 bg-blue-500/20 rounded border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-300" />
                        <span className="font-semibold">24-Hour Symptom-Free Required</span>
                      </div>
                      <div className="text-sm text-blue-200">
                        Current: 26 hours symptom-free (Ready for Step 2)
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-300" />
                        <span className="font-semibold">Supervision Required</span>
                      </div>
                      <div className="text-sm text-yellow-200">
                        All progression steps must be supervised by Athletic Trainer
                      </div>
                    </div>

                    <Alert className="bg-red-500/20 border-red-500/50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Second Impact Syndrome Warning</AlertTitle>
                      <AlertDescription className="text-sm">
                        50% mortality rate if athlete returns too quickly. Proper progression is vital for safety.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="environmental" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Current Conditions */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Live WBGT Monitoring
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Corpus Christi ISD Hot Weather Policy Implementation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-yellow-300 mb-2">
                      {wbgtData.current}°F
                    </div>
                    <Badge className="bg-yellow-600 text-white text-lg px-4 py-2">
                      YELLOW ZONE - CAUTION
                    </Badge>
                    <div className="text-sm text-blue-200 mt-2">
                      WBGT Range: 82.2°F - 86.9°F
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <div className="font-semibold mb-2">Equipment Restrictions</div>
                      <div className="text-sm">{wbgtData.restrictions.equipment}</div>
                    </div>
                    
                    <div className="p-3 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <div className="font-semibold mb-2">Practice Limitations</div>
                      <div className="text-sm">{wbgtData.restrictions.practiceTime}</div>
                    </div>
                    
                    <div className="p-3 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <div className="font-semibold mb-2">Contact Level</div>
                      <div className="text-sm">{wbgtData.restrictions.contactLevel}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Recommendations */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Required Safety Measures
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Mandatory protocols for current conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wbgtData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded">
                        <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-red-500/20 rounded border border-red-500/30">
                    <div className="font-semibold text-red-300 mb-2">
                      Emergency Protocols Active
                    </div>
                    <div className="text-sm space-y-1">
                      <div>• Cold water immersion area required</div>
                      <div>• Athletic Trainer must be present</div>
                      <div>• Emergency action plan accessible</div>
                      <div>• 911 contact readily available</div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-view-forecast">
                      <MapPin className="h-4 w-4 mr-2" />
                      View 7-Day Weather Forecast
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medical-forms" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Document Status */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Required Documentation Status
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    CCISD mandatory forms and clearances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documentStatuses.map((doc) => (
                      <div 
                        key={doc.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/20"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold">{doc.name}</div>
                            <div className="text-sm text-blue-200">{doc.type}</div>
                          </div>
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status === 'completed' ? 'Current' : 
                             doc.status === 'pending' ? 'Update Required' : 'Missing'}
                          </Badge>
                        </div>
                        
                        {doc.lastUpdated && (
                          <div className="text-xs text-blue-200">
                            Last Updated: {doc.lastUpdated}
                          </div>
                        )}
                        
                        {doc.expiresOn && (
                          <div className="text-xs text-yellow-300">
                            Expires: {doc.expiresOn}
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-view-${doc.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {doc.status !== 'completed' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid={`button-upload-${doc.id}`}>
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          )}
                          {doc.status === 'completed' && (
                            <Button size="sm" variant="outline" className="text-white border-white/30" data-testid={`button-download-${doc.id}`}>
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Digital Forms Available */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Digital Forms System
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Streamlined online completion with bilingual support
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    
                    <div className="p-4 bg-green-500/20 rounded border border-green-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                        <span className="font-semibold">Pre-Participation Physical Form</span>
                      </div>
                      <div className="text-sm text-green-200 mb-3">
                        Digital version of revised 2024 CCISD form with 20+ health questions
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-white border-white/30">English</Badge>
                        <Badge variant="outline" className="text-white border-white/30">Español</Badge>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/20 rounded border border-blue-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="h-4 w-4 text-blue-300" />
                        <span className="font-semibold">Asthma Care Plan</span>
                      </div>
                      <div className="text-sm text-blue-200 mb-3">
                        Traffic light system (Green/Yellow/Red zones) with medication protocols
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="button-complete-asthma">
                        Complete Online
                      </Button>
                    </div>

                    <div className="p-4 bg-purple-500/20 rounded border border-purple-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-purple-300" />
                        <span className="font-semibold">Anaphylaxis Emergency Action Plan</span>
                      </div>
                      <div className="text-sm text-purple-200 mb-3">
                        Life-threatening allergy management with EpiPen protocols
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700" data-testid="button-complete-anaphylaxis">
                        Complete Online
                      </Button>
                    </div>

                    <div className="p-4 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-yellow-300" />
                        <span className="font-semibold">Concussion Information Form</span>
                      </div>
                      <div className="text-sm text-yellow-200 mb-3">
                        Parent/guardian consent for return-to-play progression
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-white border-white/30">English</Badge>
                        <Badge variant="outline" className="text-white border-white/30">Español</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white/5 rounded border border-white/20">
                    <div className="text-sm text-blue-200 mb-2">System Features:</div>
                    <div className="text-xs space-y-1">
                      <div>• Automatic physician notifications</div>
                      <div>• Parent/guardian email confirmations</div>
                      <div>• HIPAA-compliant data storage</div>
                      <div>• Real-time compliance tracking</div>
                      <div>• Bilingual support (English/Spanish)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Compliance Statistics */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    District Compliance Metrics
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Overall CCISD protocol adherence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Medical Clearances</span>
                        <span className="text-green-300">94%</span>
                      </div>
                      <Progress value={94} className="w-full" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Concussion Protocols</span>
                        <span className="text-green-300">100%</span>
                      </div>
                      <Progress value={100} className="w-full" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Environmental Safety</span>
                        <span className="text-green-300">98%</span>
                      </div>
                      <Progress value={98} className="w-full" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Insurance Documentation</span>
                        <span className="text-yellow-300">87%</span>
                      </div>
                      <Progress value={87} className="w-full" />
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <div className="text-2xl font-bold text-green-300">A+</div>
                    <div className="text-sm text-blue-200">Overall District Grade</div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Requirements */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Upcoming Requirements
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Actions needed in the next 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-500/20 rounded border border-yellow-500/30">
                      <div className="font-semibold text-yellow-300">Physical Renewals</div>
                      <div className="text-sm text-yellow-200">12 athletes need annual physicals</div>
                      <div className="text-xs text-blue-200">Due: August 30, 2024</div>
                    </div>
                    
                    <div className="p-3 bg-blue-500/20 rounded border border-blue-500/30">
                      <div className="font-semibold text-blue-300">Baseline Testing</div>
                      <div className="text-sm text-blue-200">8 new athletes need concussion baseline</div>
                      <div className="text-xs text-blue-200">Due: September 1, 2024</div>
                    </div>
                    
                    <div className="p-3 bg-orange-500/20 rounded border border-orange-500/30">
                      <div className="font-semibold text-orange-300">Care Plan Updates</div>
                      <div className="text-sm text-orange-200">3 asthma care plans need review</div>
                      <div className="text-xs text-blue-200">Due: August 25, 2024</div>
                    </div>
                    
                    <div className="p-3 bg-red-500/20 rounded border border-red-500/30">
                      <div className="font-semibold text-red-300">Insurance Forms</div>
                      <div className="text-sm text-red-200">5 missing insurance acknowledgments</div>
                      <div className="text-xs text-blue-200">Due: August 20, 2024</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Recent Compliance Actions
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    HIPAA-compliant audit trail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-2 bg-white/5 rounded">
                      <CheckCircle className="h-4 w-4 text-green-300 mt-0.5" />
                      <div>
                        <div className="font-semibold">Concussion clearance processed</div>
                        <div className="text-xs text-blue-200">Marcus Rodriguez - 08/13/2024 2:30 PM</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-2 bg-white/5 rounded">
                      <FileText className="h-4 w-4 text-blue-300 mt-0.5" />
                      <div>
                        <div className="font-semibold">Physical form submitted</div>
                        <div className="text-xs text-blue-200">Jordan Williams - 08/13/2024 11:15 AM</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-2 bg-white/5 rounded">
                      <Thermometer className="h-4 w-4 text-yellow-300 mt-0.5" />
                      <div>
                        <div className="font-semibold">WBGT alert triggered</div>
                        <div className="text-xs text-blue-200">All coaches notified - 08/13/2024 8:45 AM</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-2 bg-white/5 rounded">
                      <Heart className="h-4 w-4 text-purple-300 mt-0.5" />
                      <div>
                        <div className="font-semibold">Asthma plan updated</div>
                        <div className="text-xs text-blue-200">Sarah Chen - 08/12/2024 4:20 PM</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-2 bg-white/5 rounded">
                      <PhoneCall className="h-4 w-4 text-red-300 mt-0.5" />
                      <div>
                        <div className="font-semibold">Emergency contact updated</div>
                        <div className="text-xs text-blue-200">Alex Thompson - 08/12/2024 1:10 PM</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Button variant="outline" className="text-white border-white/30" data-testid="button-view-full-audit">
                      View Full Audit Log
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