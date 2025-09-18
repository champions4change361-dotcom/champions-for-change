import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Search, Filter, Download, Upload, Plus, Activity, Heart, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  grade: number;
  gender: 'M' | 'F';
  school: string;
  sports: string[];
  eligibilityStatus: 'eligible' | 'pending' | 'ineligible' | 'injured';
  healthStatus: 'good' | 'caution' | 'restricted' | 'cleared';
  injuryRisk: number; // 0-100 AI prediction
  formsCompleted: {
    physical: boolean;
    emergency: boolean;
    concussion: boolean;
    insurance: boolean;
  };
  lastUpdated: string;
  parentContact: string;
  emergencyContact: string;
  medicalNotes?: string;
  gpa?: number;
  behaviorPoints?: number;
}

export default function AthleteManagement() {
  const { user } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Mock data for demonstration - would come from API
  useEffect(() => {
    const mockAthletes: Athlete[] = [
      {
        id: '1',
        firstName: 'Marcus',
        lastName: 'Johnson',
        studentId: '543797',
        grade: 11,
        gender: 'M',
        school: 'Miller High School',
        sports: ['Football', 'Track'],
        eligibilityStatus: 'eligible',
        healthStatus: 'good',
        injuryRisk: 15,
        formsCompleted: { physical: true, emergency: true, concussion: true, insurance: true },
        lastUpdated: '2024-08-15',
        parentContact: 'maria.johnson@email.com',
        emergencyContact: '(361) 555-0123',
        gpa: 3.2,
        behaviorPoints: 0
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Williams',
        studentId: '354993',
        grade: 10,
        gender: 'F',
        school: 'Carroll High School',
        sports: ['Volleyball', 'Basketball'],
        eligibilityStatus: 'pending',
        healthStatus: 'caution',
        injuryRisk: 45,
        formsCompleted: { physical: true, emergency: true, concussion: false, insurance: true },
        lastUpdated: '2024-08-12',
        parentContact: 'david.williams@email.com',
        emergencyContact: '(361) 555-0456',
        gpa: 3.8,
        behaviorPoints: 0
      },
      {
        id: '3',
        firstName: 'Antonio',
        lastName: 'Rodriguez',
        studentId: '362401',
        grade: 12,
        gender: 'M',
        school: 'Ray High School',
        sports: ['Baseball', 'Soccer'],
        eligibilityStatus: 'ineligible',
        healthStatus: 'restricted',
        injuryRisk: 75,
        formsCompleted: { physical: false, emergency: true, concussion: true, insurance: false },
        lastUpdated: '2024-08-10',
        parentContact: 'carmen.rodriguez@email.com',
        emergencyContact: '(361) 555-0789',
        medicalNotes: 'Previous shoulder injury - requires clearance',
        gpa: 2.1,
        behaviorPoints: 15
      },
      {
        id: '4',
        firstName: 'Ashley',
        lastName: 'Davis',
        studentId: '354765',
        grade: 9,
        gender: 'F',
        school: 'Veterans Memorial',
        sports: ['Tennis', 'Swimming'],
        eligibilityStatus: 'eligible',
        healthStatus: 'good',
        injuryRisk: 8,
        formsCompleted: { physical: true, emergency: true, concussion: true, insurance: true },
        lastUpdated: '2024-08-14',
        parentContact: 'jennifer.davis@email.com',
        emergencyContact: '(361) 555-0321',
        gpa: 4.0,
        behaviorPoints: 0
      }
    ];
    
    setAthletes(mockAthletes);
    setFilteredAthletes(mockAthletes);
  }, []);

  // Filter athletes based on search and filters
  useEffect(() => {
    let filtered = athletes.filter(athlete => {
      const matchesSearch = searchTerm === '' || 
        athlete.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.studentId.includes(searchTerm);
      
      const matchesGrade = selectedGrade === 'all' || athlete.grade.toString() === selectedGrade;
      const matchesSport = selectedSport === 'all' || athlete.sports.some(sport => sport === selectedSport);
      const matchesStatus = selectedStatus === 'all' || athlete.eligibilityStatus === selectedStatus;
      const matchesSchool = selectedSchool === 'all' || athlete.school === selectedSchool;
      
      return matchesSearch && matchesGrade && matchesSport && matchesStatus && matchesSchool;
    });
    
    setFilteredAthletes(filtered);
  }, [searchTerm, selectedGrade, selectedSport, selectedStatus, selectedSchool, athletes]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      eligible: { color: 'bg-green-900/50 text-green-300 border border-green-600/50', icon: CheckCircle, text: 'Eligible' },
      pending: { color: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/50', icon: Clock, text: 'Pending' },
      ineligible: { color: 'bg-red-900/50 text-red-300 border border-red-600/50', icon: XCircle, text: 'Ineligible' },
      injured: { color: 'bg-orange-900/50 text-orange-300 border border-orange-600/50', icon: AlertTriangle, text: 'Injured' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const getHealthBadge = (status: string, injuryRisk: number) => {
    const healthConfig = {
      good: { color: 'bg-green-900/50 text-green-300 border border-green-600/50', icon: Heart },
      caution: { color: 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/50', icon: AlertTriangle },
      restricted: { color: 'bg-red-900/50 text-red-300 border border-red-600/50', icon: XCircle },
      cleared: { color: 'bg-blue-900/50 text-blue-300 border border-blue-600/50', icon: CheckCircle }
    };
    
    const config = healthConfig[status as keyof typeof healthConfig];
    const IconComponent = config.icon;
    
    return (
      <div className="flex items-center space-x-2">
        <Badge className={`${config.color} flex items-center space-x-1`}>
          <IconComponent className="w-3 h-3" />
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </Badge>
        <span className={`text-xs px-2 py-1 rounded border ${
          injuryRisk < 25 ? 'bg-green-900/50 text-green-300 border-green-600/50' :
          injuryRisk < 50 ? 'bg-yellow-900/50 text-yellow-300 border-yellow-600/50' :
          injuryRisk < 75 ? 'bg-orange-900/50 text-orange-300 border-orange-600/50' :
          'bg-red-900/50 text-red-300 border-red-600/50'
        }`}>
          {injuryRisk}% Risk
        </span>
      </div>
    );
  };

  const getFormsProgress = (forms: Athlete['formsCompleted']) => {
    const completed = Object.values(forms).filter(Boolean).length;
    const total = Object.keys(forms).length;
    const percentage = (completed / total) * 100;
    
    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${
              percentage === 100 ? 'bg-green-500' :
              percentage >= 75 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600">{completed}/{total}</span>
      </div>
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
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Athlete Management</h1>
                <p className="text-xs text-green-600 dark:text-green-400">Champions for Change Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Athlete
              </Button>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Athletes</p>
                  <p className="text-2xl font-bold text-gray-900">{athletes.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Eligible</p>
                  <p className="text-2xl font-bold text-green-600">
                    {athletes.filter(a => a.eligibilityStatus === 'eligible').length}
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
                  <p className="text-sm font-medium text-gray-500">High Risk</p>
                  <p className="text-2xl font-bold text-red-600">
                    {athletes.filter(a => a.injuryRisk >= 50).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Forms Complete</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {athletes.filter(a => Object.values(a.formsCompleted).every(Boolean)).length}
                  </p>
                </div>
                <Heart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Advanced Athlete Filters</span>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showAdvancedFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search athletes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="9">9th Grade</SelectItem>
                  <SelectItem value="10">10th Grade</SelectItem>
                  <SelectItem value="11">11th Grade</SelectItem>
                  <SelectItem value="12">12th Grade</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Basketball">Basketball</SelectItem>
                  <SelectItem value="Volleyball">Volleyball</SelectItem>
                  <SelectItem value="Track">Track</SelectItem>
                  <SelectItem value="Baseball">Baseball</SelectItem>
                  <SelectItem value="Soccer">Soccer</SelectItem>
                  <SelectItem value="Tennis">Tennis</SelectItem>
                  <SelectItem value="Swimming">Swimming</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Eligibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ineligible">Ineligible</SelectItem>
                  <SelectItem value="injured">Injured</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder="School" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Schools</SelectItem>
                  <SelectItem value="Miller High School">Miller High School</SelectItem>
                  <SelectItem value="Carroll High School">Carroll High School</SelectItem>
                  <SelectItem value="Ray High School">Ray High School</SelectItem>
                  <SelectItem value="Veterans Memorial">Veterans Memorial</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </Button>
            </div>
            
            {showAdvancedFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">High Injury Risk (50%+)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">Incomplete Forms</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">Low GPA (&lt;2.0)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox />
                    <span className="text-sm">Behavior Issues</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Athletes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Athlete Roster ({filteredAthletes.length} athletes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Athlete</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">School</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Sports</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Eligibility</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Health Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Forms</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">GPA</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAthletes.map((athlete) => (
                    <tr key={athlete.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {athlete.firstName} {athlete.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {athlete.studentId} | Grade {athlete.grade} | {athlete.gender}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900">{athlete.school}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {athlete.sports.map((sport) => (
                            <Badge key={sport} variant="secondary" className="text-xs">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(athlete.eligibilityStatus)}</td>
                      <td className="py-4 px-4">{getHealthBadge(athlete.healthStatus, athlete.injuryRisk)}</td>
                      <td className="py-4 px-4">{getFormsProgress(athlete.formsCompleted)}</td>
                      <td className="py-4 px-4">
                        <span className={`font-medium ${
                          (athlete.gpa || 0) >= 3.0 ? 'text-green-600' :
                          (athlete.gpa || 0) >= 2.0 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {athlete.gpa?.toFixed(1) || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">View</Button>
                          <Button size="sm" variant="outline">Edit</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}