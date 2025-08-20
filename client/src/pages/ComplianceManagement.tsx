import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Shield, Calendar, Upload, CheckCircle, XCircle, Clock, AlertTriangle, FileText, User, Download, Eye } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ComplianceTraining {
  id: string;
  name: string;
  type: 'annual' | 'lifetime' | 'seasonal' | 'one_time';
  category: 'safety' | 'education' | 'sport_specific' | 'administrative' | 'medical' | 'data_security';
  description: string;
  requiredFor: string[];
  provider: string;
  durationHours?: number;
  validityPeriod?: number; // years
  uilRequired: boolean;
  txRampRequired: boolean;
  priority: 'required' | 'recommended' | 'optional';
  stateMandate?: 'TX-RAMP' | 'UIL' | 'FERPA' | 'HIPAA';
}

interface CoachCompliance {
  id: string;
  coachId: string;
  coachName: string;
  school: string;
  sports: string[];
  role: string;
  completions: ComplianceCompletion[];
  overallStatus: 'compliant' | 'pending' | 'non_compliant' | 'expiring_soon';
  lastUpdated: string;
}

interface ComplianceCompletion {
  id: string;
  trainingId: string;
  trainingName: string;
  status: 'complete' | 'pending' | 'expired' | 'not_started' | 'exempt';
  completionDate?: string;
  expirationDate?: string;
  certificateUrl?: string;
  uploadDate?: string;
  reviewStatus: 'approved' | 'pending_review' | 'rejected' | 'not_submitted';
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  autoApproved: boolean;
}

export default function ComplianceManagement() {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState<CoachCompliance[]>([]);
  const [trainings, setTrainings] = useState<ComplianceTraining[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<CoachCompliance | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSchool, setFilterSchool] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedCompletion, setSelectedCompletion] = useState<ComplianceCompletion | null>(null);

  // Load UIL compliance trainings based on the image provided
  useEffect(() => {
    const uilTrainings: ComplianceTraining[] = [
      {
        id: '1',
        name: 'Concussion Education',
        type: 'annual',
        category: 'safety',
        description: 'Annual concussion awareness and management training',
        requiredFor: ['Football', 'Basketball', 'Soccer', 'All Sports'],
        provider: 'UIL',
        durationHours: 2,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '2',
        name: 'UIL Ethics & Sportsmanship',
        type: 'annual',
        category: 'education',
        description: 'UIL ethics and sportsmanship requirements for all coaches',
        requiredFor: ['All Sports'],
        provider: 'UIL',
        durationHours: 1,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '3',
        name: 'Atavus Tackling Level 2 Certification',
        type: 'lifetime',
        category: 'sport_specific',
        description: 'Advanced safe tackling techniques certification',
        requiredFor: ['Football'],
        provider: 'Atavus',
        durationHours: 8,
        validityPeriod: 30, // Until 2055 as shown in image
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '4',
        name: 'UIL Sexual Harassment Education',
        type: 'annual',
        category: 'education',
        description: 'Required sexual harassment prevention training',
        requiredFor: ['All Sports'],
        provider: 'UIL',
        durationHours: 1,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '5',
        name: 'Child Safety Training',
        type: 'annual',
        category: 'safety',
        description: 'Child protection and safety protocols',
        requiredFor: ['All Sports'],
        provider: 'UIL',
        durationHours: 2,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '6',
        name: 'Sudden Cardiac Arrest Education',
        type: 'annual',
        category: 'medical',
        description: 'Recognition and response to sudden cardiac arrest',
        requiredFor: ['All Sports'],
        provider: 'UIL',
        durationHours: 1,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '7',
        name: 'Heat Illness Prevention',
        type: 'annual',
        category: 'safety',
        description: 'Heat illness prevention and management protocols',
        requiredFor: ['Football', 'Track', 'Cross Country', 'Tennis'],
        provider: 'UIL',
        durationHours: 1,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '8',
        name: 'Medical Safety Training',
        type: 'annual',
        category: 'medical',
        description: 'Basic medical emergency response for coaches',
        requiredFor: ['All Sports'],
        provider: 'UIL',
        durationHours: 2,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '9',
        name: 'UIL Constitution & Contest Rules',
        type: 'annual',
        category: 'administrative',
        description: 'Current UIL rules and regulations',
        requiredFor: ['All Sports'],
        provider: 'UIL',
        durationHours: 1,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '10',
        name: 'Sport-Specific Training (Football)',
        type: 'annual',
        category: 'sport_specific',
        description: 'Football-specific coaching certification',
        requiredFor: ['Football'],
        provider: 'UIL',
        durationHours: 3,
        validityPeriod: 1,
        uilRequired: true,
        txRampRequired: false,
        priority: 'required'
      },
      {
        id: '11',
        name: 'TX-RAMP Level 1 Certification',
        type: 'one_time',
        category: 'data_security',
        description: 'Texas Risk and Authorization Management Program Level 1 - Non-confidential data and low-impact information resources',
        requiredFor: ['District Administration', 'Technology Staff', 'Data Managers'],
        provider: 'Texas DIR',
        durationHours: 8,
        validityPeriod: 3,
        uilRequired: false,
        txRampRequired: true,
        priority: 'required',
        stateMandate: 'TX-RAMP'
      },
      {
        id: '12',
        name: 'TX-RAMP Level 2 Certification',
        type: 'one_time',
        category: 'data_security',
        description: 'Texas Risk and Authorization Management Program Level 2 - Confidential information and moderate/high-impact information resources',
        requiredFor: ['District Administration', 'Technology Staff', 'Student Information Systems'],
        provider: 'Texas DIR',
        durationHours: 16,
        validityPeriod: 3,
        uilRequired: false,
        txRampRequired: true,
        priority: 'required',
        stateMandate: 'TX-RAMP'
      },
      {
        id: '13',
        name: 'FERPA Compliance Training',
        type: 'annual',
        category: 'data_security',
        description: 'Family Educational Rights and Privacy Act compliance for student data protection',
        requiredFor: ['All Staff', 'Coaches', 'Administrators'],
        provider: 'US Department of Education',
        durationHours: 2,
        validityPeriod: 1,
        uilRequired: false,
        txRampRequired: false,
        priority: 'required',
        stateMandate: 'FERPA'
      },
      {
        id: '14',
        name: 'HIPAA Privacy Training',
        type: 'annual',
        category: 'data_security',
        description: 'Health Insurance Portability and Accountability Act training for medical data protection',
        requiredFor: ['Athletic Trainers', 'Nurses', 'Medical Staff'],
        provider: 'HHS',
        durationHours: 3,
        validityPeriod: 1,
        uilRequired: false,
        txRampRequired: false,
        priority: 'required',
        stateMandate: 'HIPAA'
      }
    ];

    const mockCoaches: CoachCompliance[] = [
      {
        id: '1',
        coachId: 'coach_001',
        coachName: 'John Thompson',
        school: 'Miller High School',
        sports: ['Football', 'Basketball'],
        role: 'Head Coach',
        overallStatus: 'pending',
        lastUpdated: '2024-08-20',
        completions: [
          {
            id: 'c1',
            trainingId: '1',
            trainingName: 'Concussion Education',
            status: 'complete',
            completionDate: '2024-07-15',
            expirationDate: '2025-07-15',
            certificateUrl: '/certificates/concussion_thompson.pdf',
            uploadDate: '2024-07-16',
            reviewStatus: 'approved',
            reviewedBy: 'Athletic Director',
            reviewDate: '2024-07-17',
            autoApproved: false
          },
          {
            id: 'c2',
            trainingId: '2',
            trainingName: 'UIL Ethics & Sportsmanship',
            status: 'pending',
            uploadDate: '2024-08-20',
            reviewStatus: 'pending_review',
            autoApproved: false
          },
          {
            id: 'c3',
            trainingId: '3',
            trainingName: 'Atavus Tackling Level 2 Certification',
            status: 'complete',
            completionDate: '2020-06-01',
            expirationDate: '2055-06-01',
            certificateUrl: '/certificates/atavus_thompson.pdf',
            uploadDate: '2020-06-02',
            reviewStatus: 'approved',
            reviewedBy: 'UIL Representative',
            reviewDate: '2020-06-03',
            autoApproved: false
          },
          {
            id: 'c4',
            trainingId: '4',
            trainingName: 'UIL Sexual Harassment Education',
            status: 'expired',
            completionDate: '2023-08-01',
            expirationDate: '2024-08-01',
            reviewStatus: 'approved',
            autoApproved: false
          }
        ]
      },
      {
        id: '2',
        coachId: 'coach_002',
        coachName: 'Maria Rodriguez',
        school: 'Carroll High School',
        sports: ['Volleyball', 'Track'],
        role: 'Assistant Coach',
        overallStatus: 'compliant',
        lastUpdated: '2024-08-18',
        completions: [
          {
            id: 'c5',
            trainingId: '1',
            trainingName: 'Concussion Education',
            status: 'complete',
            completionDate: '2024-08-01',
            expirationDate: '2025-08-01',
            certificateUrl: '/certificates/concussion_rodriguez.pdf',
            uploadDate: '2024-08-02',
            reviewStatus: 'approved',
            reviewedBy: 'Athletic Director',
            reviewDate: '2024-08-03',
            autoApproved: true
          }
        ]
      }
    ];

    setTrainings(uilTrainings);
    setCoaches(mockCoaches);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      complete: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Complete' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Review' },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Expired' },
      not_started: { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Not Started' },
      exempt: { color: 'bg-blue-100 text-blue-800', icon: Shield, text: 'Exempt' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getOverallStatusBadge = (status: string) => {
    const statusConfig = {
      compliant: { color: 'bg-green-100 text-green-800', text: 'Compliant' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      non_compliant: { color: 'bg-red-100 text-red-800', text: 'Non-Compliant' },
      expiring_soon: { color: 'bg-orange-100 text-orange-800', text: 'Expiring Soon' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getTrainingTypeBadge = (type: string) => {
    const typeConfig = {
      annual: { color: 'bg-blue-100 text-blue-800', text: 'Annual' },
      lifetime: { color: 'bg-purple-100 text-purple-800', text: 'Lifetime' },
      seasonal: { color: 'bg-green-100 text-green-800', text: 'Seasonal' },
      one_time: { color: 'bg-gray-100 text-gray-800', text: 'One-Time' }
    };
    
    const config = typeConfig[type as keyof typeof typeConfig];
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const filteredCoaches = coaches.filter(coach => {
    const statusMatch = filterStatus === 'all' || coach.overallStatus === filterStatus;
    const schoolMatch = filterSchool === 'all' || coach.school === filterSchool;
    const searchMatch = searchTerm === '' || 
      coach.coachName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.sports.some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && schoolMatch && searchMatch;
  });

  const handleApproveCompletion = (completionId: string) => {
    // Implementation for approving a completion
    console.log('Approving completion:', completionId);
  };

  const handleRejectCompletion = (completionId: string, reason: string) => {
    // Implementation for rejecting a completion
    console.log('Rejecting completion:', completionId, 'Reason:', reason);
  };

  const handleUploadCertificate = () => {
    setIsUploadDialogOpen(true);
  };

  const calculateCompliancePercentage = (coach: CoachCompliance) => {
    const requiredTrainings = trainings.filter(training => 
      training.priority === 'required' && 
      (training.requiredFor.includes('All Sports') || 
       coach.sports.some(sport => training.requiredFor.includes(sport)))
    );
    
    const completeTrainings = coach.completions.filter(completion => 
      completion.status === 'complete' && 
      requiredTrainings.some(training => training.id === completion.trainingId)
    );
    
    return Math.round((completeTrainings.length / requiredTrainings.length) * 100);
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Compliance Management</h1>
                <p className="text-xs text-green-600 dark:text-green-400">UIL Training & Certification Tracking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={handleUploadCertificate} className="bg-green-600 hover:bg-green-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Certificate
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grant Funding Opportunity Alert */}
        <div className="mb-6">
          <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Shield className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                    💰 Grant Funding Available - Educational Nonprofit Advantage
                  </h3>
                  <p className="text-green-800 dark:text-green-200 mb-3">
                    Champions for Change 501(c)(3) status and SAM registration enable access to federal grants, 
                    foundation funding, and corporate philanthropy for security certification costs ($150K target). 
                    Educational nonprofits have significant advantages in technology infrastructure funding.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-600 text-white">Federal Grants Available</Badge>
                    <Badge className="bg-blue-600 text-white">Foundation Funding</Badge>
                    <Badge className="bg-purple-600 text-white">SAM Registered</Badge>
                    <Badge className="bg-orange-600 text-white">501(c)(3) Advantage</Badge>
                  </div>
                  <div className="mt-3">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      Explore Grant Opportunities
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Requirements Alert */}
        <div className="mb-6">
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    🚨 Security Certifications Required - Multi-State Mandate
                  </h3>
                  <p className="text-red-800 dark:text-red-200 mb-3">
                    Platform lacks industry-standard security certifications required by educational institutions nationwide. 
                    SOC II Type 2 and ISO 27001 are baseline requirements for EdTech platforms serving districts in any state. 
                    Comprehensive security certification program needed for competitive positioning.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-red-600 text-white">SOC II Required (Universal)</Badge>
                    <Badge className="bg-red-600 text-white">ISO 27001 Required (Enterprise)</Badge>
                    <Badge className="bg-orange-600 text-white">Industry Standard Gap</Badge>
                    <Badge className="bg-yellow-600 text-white">Certification Roadmap Needed</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Clock className="w-4 h-4 mr-2" />
                      Track Certification Progress
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      <Shield className="w-4 h-4 mr-2" />
                      View Grant Opportunities
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Coaches</p>
                  <p className="text-2xl font-bold text-gray-900">{coaches.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Compliant</p>
                  <p className="text-2xl font-bold text-green-600">
                    {coaches.filter(c => c.overallStatus === 'compliant').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {coaches.filter(c => c.overallStatus === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Non-Compliant</p>
                  <p className="text-2xl font-bold text-red-600">
                    {coaches.filter(c => c.overallStatus === 'non_compliant').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Coach Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Search coaches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterSchool} onValueChange={setFilterSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by school" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  <SelectItem value="Miller High School">Miller High School</SelectItem>
                  <SelectItem value="Carroll High School">Carroll High School</SelectItem>
                  <SelectItem value="Ray High School">Ray High School</SelectItem>
                  <SelectItem value="Veterans Memorial">Veterans Memorial</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Coach Compliance Table */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Coach</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">School</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Sports</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Compliance %</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoaches.map((coach) => (
                    <tr key={coach.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{coach.coachName}</div>
                        <div className="text-sm text-gray-500">{coach.role}</div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{coach.school}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {coach.sports.map((sport, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                calculateCompliancePercentage(coach) === 100 ? 'bg-green-500' :
                                calculateCompliancePercentage(coach) >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${calculateCompliancePercentage(coach)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {calculateCompliancePercentage(coach)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{getOverallStatusBadge(coach.overallStatus)}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">
                        {new Date(coach.lastUpdated).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedCoach(coach)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Coach Details Dialog */}
        {selectedCoach && (
          <Dialog open={!!selectedCoach} onOpenChange={() => setSelectedCoach(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>{selectedCoach.coachName} - Compliance Details</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">School</Label>
                    <p className="text-gray-900">{selectedCoach.school}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Role</Label>
                    <p className="text-gray-900">{selectedCoach.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Sports</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedCoach.sports.map((sport, index) => (
                        <Badge key={index} variant="secondary">{sport}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Overall Status</Label>
                    <div className="mt-1">
                      {getOverallStatusBadge(selectedCoach.overallStatus)}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-medium text-gray-900 mb-4 block">Training Completions</Label>
                  <div className="space-y-3">
                    {selectedCoach.completions.map((completion) => {
                      const training = trainings.find(t => t.id === completion.trainingId);
                      return (
                        <div key={completion.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{completion.trainingName}</h4>
                              {training && (
                                <div className="flex items-center space-x-2 mt-1">
                                  {getTrainingTypeBadge(training.type)}
                                  <Badge variant="outline">{training.category}</Badge>
                                </div>
                              )}
                            </div>
                            {getStatusBadge(completion.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            {completion.completionDate && (
                              <div>
                                <span className="font-medium">Completed:</span> {new Date(completion.completionDate).toLocaleDateString()}
                              </div>
                            )}
                            {completion.expirationDate && (
                              <div>
                                <span className="font-medium">Expires:</span> {new Date(completion.expirationDate).toLocaleDateString()}
                              </div>
                            )}
                            {completion.reviewedBy && (
                              <div>
                                <span className="font-medium">Reviewed by:</span> {completion.reviewedBy}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Review Status:</span> 
                              <Badge className={`ml-2 ${
                                completion.reviewStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                completion.reviewStatus === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {completion.reviewStatus.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          
                          {completion.reviewStatus === 'pending_review' && (
                            <div className="flex space-x-2 mt-3">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveCompletion(completion.id)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRejectCompletion(completion.id, 'Needs review')}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Upload Certificate Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Training Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="training">Training</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select training" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainings.map(training => (
                      <SelectItem key={training.id} value={training.id}>
                        {training.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="completionDate">Completion Date</Label>
                <Input id="completionDate" type="date" />
              </div>
              <div>
                <Label htmlFor="certificate">Certificate File</Label>
                <Input id="certificate" type="file" accept=".pdf,.jpg,.png" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(false)}>
                  Upload Certificate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}