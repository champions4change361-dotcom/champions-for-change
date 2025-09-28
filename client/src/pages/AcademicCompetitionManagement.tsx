import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  MapPin,
  School,
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  UserCheck,
  Trophy,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  insertAcademicMeetSchema,
  insertAcademicDistrictSchema,
  type InsertAcademicMeet,
  type InsertAcademicDistrict
} from "@shared/schema";

// Use shared schemas with additional validation
const meetSchema = insertAcademicMeetSchema.extend({
  competitions: z.array(z.string()).min(1, "At least one competition must be selected"),
  awardsLevels: z.object({
    individual: z.number().min(1),
    team: z.number().min(1)
  })
});

const districtSchema = insertAcademicDistrictSchema.extend({
  maxEntriesPerEvent: z.number().min(1).max(10).default(3)
});

type MeetFormData = z.infer<typeof meetSchema>;
type DistrictFormData = z.infer<typeof districtSchema>;

interface AcademicMeet {
  id: string;
  districtId: string;
  meetName: string;
  meetType: 'district' | 'invitational' | 'practice';
  level: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
  meetDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  hostSchool: string;
  meetDirector: string;
  meetDirectorEmail: string;
  registrationDeadline: string;
  maxSchools?: number;
  competitions: string[];
  status: 'planning' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
}

interface AcademicDistrict {
  id: string;
  districtName: string;
  districtNumber: string;
  region: string;
  classification: string;
  coordinatorName: string;
  coordinatorEmail: string;
  meetDate?: string;
  meetLocation?: string;
  isActive: boolean;
}

interface UILCompetition {
  id: string;
  name: string;
  category: string;
  competitionType: 'high_school' | 'aplus';
  gradeLevel: string;
  classification: string[];
  maxParticipants: number;
  isTeamEvent: boolean;
  contestFormat: string;
  teksAlignment: string;
  subjectArea: string;
  season: 'fall' | 'spring';
  isActive: boolean;
}

export default function AcademicCompetitionManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("meets");
  const [selectedMeet, setSelectedMeet] = useState<AcademicMeet | null>(null);
  const [isCreateMeetOpen, setIsCreateMeetOpen] = useState(false);
  const [isCreateDistrictOpen, setIsCreateDistrictOpen] = useState(false);
  const [selectedCompetitions, setSelectedCompetitions] = useState<string[]>([]);

  const meetForm = useForm<MeetFormData>({
    resolver: zodResolver(meetSchema),
    defaultValues: {
      scoringSystem: "uil_standard",
      awardsLevels: { individual: 6, team: 3 }
    }
  });

  const districtForm = useForm<DistrictFormData>({
    resolver: zodResolver(districtSchema),
    defaultValues: {
      maxEntriesPerEvent: 3
    }
  });

  // Get academic meets
  const { data: academicMeets, isLoading: meetsLoading } = useQuery<AcademicMeet[]>({
    queryKey: ['/api/academic/meets'],
    enabled: !!user
  });

  // Get academic districts
  const { data: academicDistricts, isLoading: districtsLoading } = useQuery<AcademicDistrict[]>({
    queryKey: ['/api/academic/districts'],
    enabled: !!user
  });

  // Get UIL competitions
  const { data: uilCompetitions, isLoading: competitionsLoading } = useQuery<UILCompetition[]>({
    queryKey: ['/api/academic/competitions/uil'],
    enabled: !!user
  });

  // Create meet mutation
  const createMeetMutation = useMutation({
    mutationFn: async (data: MeetFormData) => {
      return apiRequest('/api/academic/meets', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Meet Created",
        description: "Academic meet has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'meets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'dashboard'] });
      setIsCreateMeetOpen(false);
      meetForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create meet. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Create district mutation
  const createDistrictMutation = useMutation({
    mutationFn: async (data: DistrictFormData) => {
      return apiRequest('/api/academic/districts', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "District Created",
        description: "Academic district has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'districts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'meets'] });
      setIsCreateDistrictOpen(false);
      districtForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create district. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-gray-100 text-gray-800';
      case 'registration_open': return 'bg-green-100 text-green-800';
      case 'registration_closed': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'district': return 'bg-blue-100 text-blue-800';
      case 'regional': return 'bg-green-100 text-green-800';
      case 'state': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const onSubmitMeet = async (data: MeetFormData) => {
    try {
      await createMeetMutation.mutateAsync(data);
    } catch (error) {
      console.error('Meet creation error:', error);
    }
  };

  const onSubmitDistrict = async (data: DistrictFormData) => {
    try {
      await createDistrictMutation.mutateAsync(data);
    } catch (error) {
      console.error('District creation error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <CardTitle>Competition Management</CardTitle>
            <CardDescription>Please log in to manage academic competitions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button className="w-full" data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="heading-management">
                  Academic Competition Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage academic meets, districts, and competition scheduling
                </p>
              </div>
            </div>
            
            <Link to="/academic">
              <Button variant="outline" data-testid="button-back-dashboard">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="meets" data-testid="tab-meets">Academic Meets</TabsTrigger>
            <TabsTrigger value="districts" data-testid="tab-districts">Districts</TabsTrigger>
            <TabsTrigger value="competitions" data-testid="tab-competitions">Competitions</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Academic Meets Tab */}
          <TabsContent value="meets" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Academic Meets</h2>
                <p className="text-muted-foreground">Manage district, regional, and state academic competitions</p>
              </div>
              
              <Dialog open={isCreateMeetOpen} onOpenChange={setIsCreateMeetOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-meet">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Meet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Academic Meet</DialogTitle>
                    <DialogDescription>
                      Set up a new academic competition meet with all required details
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...meetForm}>
                    <form onSubmit={meetForm.handleSubmit(onSubmitMeet)} className="space-y-6">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={meetForm.control}
                          name="meetName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meet Name</FormLabel>
                              <FormControl>
                                <Input placeholder="District 15-4A Academic Meet" {...field} data-testid="input-meet-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="meetType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meet Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-meet-type">
                                    <SelectValue placeholder="Select meet type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="district">District Meet</SelectItem>
                                  <SelectItem value="invitational">Invitational</SelectItem>
                                  <SelectItem value="practice">Practice Meet</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Competition Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-meet-level">
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="district">District</SelectItem>
                                  <SelectItem value="regional">Regional</SelectItem>
                                  <SelectItem value="state">State</SelectItem>
                                  <SelectItem value="area">Area</SelectItem>
                                  <SelectItem value="bi_district">Bi-District</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="districtId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>District</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-district">
                                    <SelectValue placeholder="Select district" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {academicDistricts?.map((district) => (
                                    <SelectItem key={district.id} value={district.id}>
                                      {district.districtName} ({district.districtNumber})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={meetForm.control}
                          name="meetDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meet Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-meet-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} data-testid="input-start-time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time (Optional)</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} data-testid="input-end-time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Location and Host */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={meetForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="High School Campus" {...field} data-testid="input-location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="hostSchool"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Host School</FormLabel>
                              <FormControl>
                                <Input placeholder="Host School Name" {...field} data-testid="input-host-school" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Meet Director */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={meetForm.control}
                          name="meetDirector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meet Director</FormLabel>
                              <FormControl>
                                <Input placeholder="Director Name" {...field} data-testid="input-meet-director" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="meetDirectorEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Director Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="director@school.edu" {...field} data-testid="input-director-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="meetDirectorPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Director Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="(555) 123-4567" {...field} data-testid="input-director-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Deadlines */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={meetForm.control}
                          name="registrationDeadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Registration Deadline</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} data-testid="input-registration-deadline" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={meetForm.control}
                          name="substitutionDeadline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Substitution Deadline (Optional)</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} data-testid="input-substitution-deadline" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Competition Selection */}
                      <div>
                        <Label className="text-base font-semibold">Available Competitions</Label>
                        <p className="text-sm text-muted-foreground mb-4">
                          Select the academic competitions that will be held at this meet
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                          {uilCompetitions?.map((competition) => (
                            <div key={competition.id} className="flex items-center space-x-2">
                              <Checkbox
                                checked={selectedCompetitions.includes(competition.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedCompetitions([...selectedCompetitions, competition.id]);
                                    meetForm.setValue('competitions', [...selectedCompetitions, competition.id]);
                                  } else {
                                    const updated = selectedCompetitions.filter(id => id !== competition.id);
                                    setSelectedCompetitions(updated);
                                    meetForm.setValue('competitions', updated);
                                  }
                                }}
                                data-testid={`checkbox-competition-${competition.id}`}
                              />
                              <Label className="text-sm">
                                {competition.name}
                                <span className="text-xs text-muted-foreground block">
                                  {competition.subjectArea} • {competition.gradeLevel}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateMeetOpen(false)}
                          data-testid="button-cancel-meet"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMeetMutation.isPending}
                          data-testid="button-save-meet"
                        >
                          {createMeetMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Save className="h-4 w-4" />
                              <span>Create Meet</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Meets List */}
            {meetsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading academic meets...</p>
              </div>
            ) : academicMeets && academicMeets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {academicMeets.map((meet) => (
                  <Card key={meet.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{meet.meetName}</CardTitle>
                        <div className="flex space-x-2">
                          <Badge className={getLevelColor(meet.level)}>
                            {meet.level}
                          </Badge>
                          <Badge className={getStatusColor(meet.status)}>
                            {meet.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>
                        {meet.meetType} • {meet.hostSchool}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(meet.meetDate).toLocaleDateString()}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{meet.startTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{meet.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <UserCheck className="h-4 w-4" />
                        <span>{meet.meetDirector}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Trophy className="h-4 w-4" />
                        <span>{meet.competitions.length} competitions</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Registration deadline: {new Date(meet.registrationDeadline).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" data-testid={`button-edit-meet-${meet.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-view-meet-${meet.id}`}>
                          <FileText className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Academic Meets</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first academic meet to get started with competition management.
                </p>
                <Button onClick={() => setIsCreateMeetOpen(true)} data-testid="button-create-first-meet">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Meet
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Districts Tab */}
          <TabsContent value="districts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Academic Districts</h2>
                <p className="text-muted-foreground">Manage UIL academic districts and regional assignments</p>
              </div>
              
              <Dialog open={isCreateDistrictOpen} onOpenChange={setIsCreateDistrictOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-district">
                    <Plus className="h-4 w-4 mr-2" />
                    Create District
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Academic District</DialogTitle>
                    <DialogDescription>
                      Set up a new UIL academic district with coordinator information
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...districtForm}>
                    <form onSubmit={districtForm.handleSubmit(onSubmitDistrict)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={districtForm.control}
                          name="districtName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>District Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Academic District 15-4A" {...field} data-testid="input-district-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={districtForm.control}
                          name="districtNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>District Number</FormLabel>
                              <FormControl>
                                <Input placeholder="15-4A" {...field} data-testid="input-district-number" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={districtForm.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Region</FormLabel>
                              <FormControl>
                                <Input placeholder="Region IV" {...field} data-testid="input-region" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={districtForm.control}
                          name="classification"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Classification</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-classification">
                                    <SelectValue placeholder="Select classification" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="elementary">Elementary</SelectItem>
                                  <SelectItem value="middle">Middle School</SelectItem>
                                  <SelectItem value="high_1A">High School 1A</SelectItem>
                                  <SelectItem value="high_2A">High School 2A</SelectItem>
                                  <SelectItem value="high_3A">High School 3A</SelectItem>
                                  <SelectItem value="high_4A">High School 4A</SelectItem>
                                  <SelectItem value="high_5A">High School 5A</SelectItem>
                                  <SelectItem value="high_6A">High School 6A</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={districtForm.control}
                          name="coordinatorName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coordinator Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Academic Coordinator" {...field} data-testid="input-coordinator-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={districtForm.control}
                          name="coordinatorEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Coordinator Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="coordinator@district.edu" {...field} data-testid="input-coordinator-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateDistrictOpen(false)}
                          data-testid="button-cancel-district"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createDistrictMutation.isPending}
                          data-testid="button-save-district"
                        >
                          {createDistrictMutation.isPending ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Creating...</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Save className="h-4 w-4" />
                              <span>Create District</span>
                            </div>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Districts List */}
            {districtsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading academic districts...</p>
              </div>
            ) : academicDistricts && academicDistricts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {academicDistricts.map((district) => (
                  <Card key={district.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{district.districtName}</CardTitle>
                        <Badge variant={district.isActive ? "default" : "secondary"}>
                          {district.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {district.districtNumber} • {district.region}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <School className="h-4 w-4" />
                        <span className="capitalize">{district.classification.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <UserCheck className="h-4 w-4" />
                        <span>{district.coordinatorName}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{district.coordinatorEmail}</span>
                      </div>
                      {district.meetDate && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="h-4 w-4" />
                          <span>Meet: {new Date(district.meetDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" data-testid={`button-edit-district-${district.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-view-district-${district.id}`}>
                          <FileText className="h-4 w-4 mr-1" />
                          Schools
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <School className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Academic Districts</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first academic district to organize schools and competitions.
                </p>
                <Button onClick={() => setIsCreateDistrictOpen(true)} data-testid="button-create-first-district">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First District
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Competitions Tab */}
          <TabsContent value="competitions" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">UIL Academic Competitions</h2>
              <p className="text-muted-foreground">50+ academic events covering all grade levels and subjects</p>
            </div>

            {competitionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading competitions...</p>
              </div>
            ) : uilCompetitions && uilCompetitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uilCompetitions.map((competition) => (
                  <Card key={competition.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{competition.name}</CardTitle>
                        <Badge variant={competition.isActive ? "default" : "secondary"}>
                          {competition.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {competition.subjectArea} • {competition.gradeLevel}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Target className="h-4 w-4" />
                        <span>{competition.contestFormat.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{competition.maxParticipants} max participants</span>
                      </div>
                      {competition.isTeamEvent && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Trophy className="h-4 w-4" />
                          <span>Team Event</span>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <strong>TEKS:</strong> {competition.teksAlignment.slice(0, 80)}...
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" data-testid={`button-edit-competition-${competition.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-view-competition-${competition.id}`}>
                          <Zap className="h-4 w-4 mr-1" />
                          TEKS
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Competitions Available</h3>
                <p className="text-muted-foreground">
                  UIL academic competitions will be loaded automatically.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground mb-6">
                View comprehensive analytics for academic competition performance and participation
              </p>
              <Button size="lg" data-testid="button-view-analytics">
                <FileText className="h-4 w-4 mr-2" />
                View Full Analytics
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}