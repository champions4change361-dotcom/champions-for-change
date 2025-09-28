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
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Users, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  School,
  BookOpen,
  Shield,
  UserCheck,
  Plus,
  Trash2,
  Save
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  insertAcademicParticipantSchema,
  insertAcademicTeamSchema,
  type InsertAcademicParticipant,
  type InsertAcademicTeam
} from "@shared/schema";

// Use shared schemas with validation extensions for FERPA compliance
const participantSchema = insertAcademicParticipantSchema.extend({
  ferpaConsent: z.boolean().refine(val => val === true, "FERPA consent is required"),
  parentalConsent: z.boolean().refine(val => val === true, "Parental consent is required")
});

const teamRegistrationSchema = insertAcademicTeamSchema.extend({
  participants: z.array(participantSchema).min(1, "At least one participant required")
});

type ParticipantData = z.infer<typeof participantSchema>;
type TeamRegistrationData = z.infer<typeof teamRegistrationSchema>;

interface UILCompetition {
  id: string;
  name: string;
  category: string;
  competitionType: 'high_school' | 'aplus';
  gradeLevel: string;
  classification: string[];
  maxParticipants: number;
  isTeamEvent: boolean;
  teamSize?: number;
  contestFormat: string;
  teksAlignment: string;
  subjectArea: string;
  season: 'fall' | 'spring';
  isActive: boolean;
}

interface AcademicMeet {
  id: string;
  districtId: string;
  meetName: string;
  meetType: 'district' | 'invitational' | 'practice';
  level: 'district' | 'regional' | 'state' | 'area' | 'bi_district';
  meetDate: string;
  startTime: string;
  location: string;
  hostSchool: string;
  meetDirector: string;
  registrationDeadline: string;
  maxSchools?: number;
  competitions: string[];
  status: 'planning' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
}

interface SchoolAcademicProgram {
  id: string;
  schoolId: string;
  districtId: string;
  schoolName: string;
  classification: string;
  coordinatorName: string;
  coordinatorEmail: string;
  isActive: boolean;
  participatingCompetitions: string[];
}

export default function AcademicRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("select-event");
  const [selectedMeet, setSelectedMeet] = useState<AcademicMeet | null>(null);
  const [selectedCompetition, setSelectedCompetition] = useState<UILCompetition | null>(null);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);

  const form = useForm<TeamRegistrationData>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: {
      participants: []
    }
  });

  // Get available meets
  const { data: academicMeets, isLoading: meetsLoading } = useQuery<AcademicMeet[]>({
    queryKey: ['/api/academic/meets'],
    enabled: !!user
  });

  // Get UIL competitions
  const { data: uilCompetitions, isLoading: competitionsLoading } = useQuery<UILCompetition[]>({
    queryKey: ['/api/academic/competitions/uil'],
    enabled: !!user
  });

  // Get school programs
  const { data: schoolPrograms, isLoading: schoolsLoading } = useQuery<SchoolAcademicProgram[]>({
    queryKey: ['/api/academic/schools'],
    enabled: !!user
  });

  // Registration mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: TeamRegistrationData) => {
      return apiRequest('/api/academic/participants/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Students have been successfully registered for the competition.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/academic', 'teams'] });
      // Reset form and state
      form.reset();
      setParticipants([]);
      setSelectedMeet(null);
      setSelectedCompetition(null);
      setActiveTab("select-event");
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register participants. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addParticipant = () => {
    const newParticipant: ParticipantData = {
      firstName: "",
      lastName: "",
      grade: 9,
      studentId: "",
      participantRole: "primary",
      entryPosition: participants.length + 1,
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      emergencyContact: "",
      emergencyPhone: "",
      isEligible: true,
      ferpaConsent: false,
      parentalConsent: false
    };
    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (index: number) => {
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(updated);
  };

  const updateParticipant = (index: number, field: keyof ParticipantData, value: any) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleMeetSelection = (meetId: string) => {
    const meet = academicMeets?.find(m => m.id === meetId);
    if (meet) {
      setSelectedMeet(meet);
      form.setValue('meetId', meetId);
      setActiveTab("select-competition");
    }
  };

  const handleCompetitionSelection = (competitionId: string) => {
    const competition = uilCompetitions?.find(c => c.id === competitionId);
    if (competition) {
      setSelectedCompetition(competition);
      form.setValue('competitionId', competitionId);
      setActiveTab("register-participants");
    }
  };

  const onSubmit = async (data: TeamRegistrationData) => {
    try {
      // Add participants to form data
      const submissionData = {
        ...data,
        participants: participants
      };
      
      await registrationMutation.mutateAsync(submissionData);
    } catch (error) {
      console.error('Registration submission error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <CardTitle>Academic Registration</CardTitle>
            <CardDescription>Please log in to access student registration</CardDescription>
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
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="heading-registration">
                  Academic Competition Registration
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Register students for UIL academic competitions with FERPA compliance
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
            <TabsTrigger value="select-event" data-testid="tab-select-event">Select Event</TabsTrigger>
            <TabsTrigger value="select-competition" disabled={!selectedMeet} data-testid="tab-select-competition">
              Select Competition
            </TabsTrigger>
            <TabsTrigger value="register-participants" disabled={!selectedCompetition} data-testid="tab-register-participants">
              Register Participants
            </TabsTrigger>
            <TabsTrigger value="review-submit" disabled={participants.length === 0} data-testid="tab-review-submit">
              Review & Submit
            </TabsTrigger>
          </TabsList>

          {/* Select Event Tab */}
          <TabsContent value="select-event" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Select Academic Meet</span>
                </CardTitle>
                <CardDescription>
                  Choose the academic meet where you want to register participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {meetsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading academic meets...</p>
                  </div>
                ) : academicMeets && academicMeets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {academicMeets
                      .filter(meet => meet.status === 'registration_open')
                      .map((meet) => (
                      <Card 
                        key={meet.id} 
                        className={`cursor-pointer transition-all ${
                          selectedMeet?.id === meet.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:shadow-md'
                        }`}
                        onClick={() => handleMeetSelection(meet.id)}
                        data-testid={`meet-card-${meet.id}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{meet.meetName}</CardTitle>
                            <Badge variant={meet.level === 'district' ? 'default' : 'secondary'}>
                              {meet.level}
                            </Badge>
                          </div>
                          <CardDescription>{meet.meetType} • {meet.hostSchool}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(meet.meetDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <School className="h-4 w-4" />
                            <span>{meet.location}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Registration deadline: {new Date(meet.registrationDeadline).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {meet.competitions.length} competitions available
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Open Registration</h3>
                    <p className="text-muted-foreground">
                      There are currently no academic meets with open registration.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Select Competition Tab */}
          <TabsContent value="select-competition" className="space-y-6">
            {selectedMeet && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Select Competition</span>
                  </CardTitle>
                  <CardDescription>
                    Choose the specific academic competition for {selectedMeet.meetName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {competitionsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Loading competitions...</p>
                    </div>
                  ) : uilCompetitions && uilCompetitions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uilCompetitions
                        .filter(comp => selectedMeet.competitions.includes(comp.id) && comp.isActive)
                        .map((competition) => (
                        <Card 
                          key={competition.id} 
                          className={`cursor-pointer transition-all ${
                            selectedCompetition?.id === competition.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : 'hover:shadow-md'
                          }`}
                          onClick={() => handleCompetitionSelection(competition.id)}
                          data-testid={`competition-card-${competition.id}`}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{competition.name}</CardTitle>
                            <CardDescription>
                              {competition.subjectArea} • {competition.gradeLevel}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm">
                              <Users className="h-4 w-4" />
                              <span>{competition.maxParticipants} max participants</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <BookOpen className="h-4 w-4" />
                              <span>{competition.contestFormat.replace('_', ' ')}</span>
                            </div>
                            {competition.isTeamEvent && (
                              <Badge variant="outline" className="text-xs">
                                Team Event
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                              <strong>TEKS:</strong> {competition.teksAlignment.slice(0, 60)}...
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Competitions Available</h3>
                      <p className="text-muted-foreground">
                        No competitions are available for this meet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Register Participants Tab */}
          <TabsContent value="register-participants" className="space-y-6">
            {selectedCompetition && (
              <>
                {/* Competition Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Register Participants</span>
                    </CardTitle>
                    <CardDescription>
                      Registering for {selectedCompetition.name} at {selectedMeet?.meetName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{selectedCompetition.maxParticipants}</div>
                        <div className="text-sm text-muted-foreground">Max Participants</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{participants.length}</div>
                        <div className="text-sm text-muted-foreground">Currently Registered</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedCompetition.maxParticipants - participants.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Spots Remaining</div>
                      </div>
                    </div>

                    {/* FERPA Compliance Notice */}
                    <Alert className="mb-6">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>FERPA Compliance:</strong> All student information is protected under FERPA regulations. 
                        Parental consent is required for all participants under 18 years of age.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* School and Sponsor Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>School & Sponsor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schoolId">School</Label>
                        <Select onValueChange={(value) => form.setValue('schoolId', value)}>
                          <SelectTrigger data-testid="select-school">
                            <SelectValue placeholder="Select school" />
                          </SelectTrigger>
                          <SelectContent>
                            {schoolPrograms?.map((school) => (
                              <SelectItem key={school.id} value={school.id}>
                                {school.schoolName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="sponsorName">Sponsor/Coach Name</Label>
                        <Input
                          {...form.register('sponsorName')}
                          placeholder="Enter sponsor name"
                          data-testid="input-sponsor-name"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Student Participants</CardTitle>
                      <Button
                        type="button"
                        onClick={addParticipant}
                        disabled={participants.length >= selectedCompetition.maxParticipants}
                        data-testid="button-add-participant"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Participant
                      </Button>
                    </div>
                    <CardDescription>
                      Add student participants with required consent forms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {participants.map((participant, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">Participant {index + 1}</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeParticipant(index)}
                            data-testid={`button-remove-participant-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <Input
                              value={participant.firstName}
                              onChange={(e) => updateParticipant(index, 'firstName', e.target.value)}
                              placeholder="First name"
                              data-testid={`input-first-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input
                              value={participant.lastName}
                              onChange={(e) => updateParticipant(index, 'lastName', e.target.value)}
                              placeholder="Last name"
                              data-testid={`input-last-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Student ID</Label>
                            <Input
                              value={participant.studentId}
                              onChange={(e) => updateParticipant(index, 'studentId', e.target.value)}
                              placeholder="Student ID"
                              data-testid={`input-student-id-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Grade</Label>
                            <Select 
                              value={participant.grade.toString()}
                              onValueChange={(value) => updateParticipant(index, 'grade', parseInt(value))}
                            >
                              <SelectTrigger data-testid={`select-grade-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                                  <SelectItem key={grade} value={grade.toString()}>
                                    Grade {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Role</Label>
                            <Select 
                              value={participant.participantRole}
                              onValueChange={(value) => updateParticipant(index, 'participantRole', value)}
                            >
                              <SelectTrigger data-testid={`select-role-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="primary">Primary</SelectItem>
                                <SelectItem value="alternate">Alternate</SelectItem>
                                <SelectItem value="team_member">Team Member</SelectItem>
                                <SelectItem value="captain">Team Captain</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Entry Position</Label>
                            <Select 
                              value={participant.entryPosition.toString()}
                              onValueChange={(value) => updateParticipant(index, 'entryPosition', parseInt(value))}
                            >
                              <SelectTrigger data-testid={`select-position-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1st Entry</SelectItem>
                                <SelectItem value="2">2nd Entry</SelectItem>
                                <SelectItem value="3">3rd Entry</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Parent/Guardian Information */}
                        <h5 className="font-medium mb-3">Parent/Guardian Information</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Parent/Guardian Name</Label>
                            <Input
                              value={participant.parentName}
                              onChange={(e) => updateParticipant(index, 'parentName', e.target.value)}
                              placeholder="Parent/Guardian name"
                              data-testid={`input-parent-name-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Parent Email</Label>
                            <Input
                              type="email"
                              value={participant.parentEmail}
                              onChange={(e) => updateParticipant(index, 'parentEmail', e.target.value)}
                              placeholder="parent@example.com"
                              data-testid={`input-parent-email-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Parent Phone</Label>
                            <Input
                              value={participant.parentPhone}
                              onChange={(e) => updateParticipant(index, 'parentPhone', e.target.value)}
                              placeholder="(555) 123-4567"
                              data-testid={`input-parent-phone-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Emergency Contact</Label>
                            <Input
                              value={participant.emergencyContact}
                              onChange={(e) => updateParticipant(index, 'emergencyContact', e.target.value)}
                              placeholder="Emergency contact name"
                              data-testid={`input-emergency-contact-${index}`}
                            />
                          </div>
                          <div>
                            <Label>Emergency Phone</Label>
                            <Input
                              value={participant.emergencyPhone}
                              onChange={(e) => updateParticipant(index, 'emergencyPhone', e.target.value)}
                              placeholder="(555) 123-4567"
                              data-testid={`input-emergency-phone-${index}`}
                            />
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Consent Forms */}
                        <div className="space-y-3">
                          <h5 className="font-medium">Required Consents</h5>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={participant.ferpaConsent}
                              onCheckedChange={(checked) => updateParticipant(index, 'ferpaConsent', checked)}
                              data-testid={`checkbox-ferpa-${index}`}
                            />
                            <Label className="text-sm">
                              FERPA Educational Records Consent - I consent to the release of educational records as required for competition participation
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={participant.parentalConsent}
                              onCheckedChange={(checked) => updateParticipant(index, 'parentalConsent', checked)}
                              data-testid={`checkbox-parental-${index}`}
                            />
                            <Label className="text-sm">
                              Parental Consent - I give permission for my child to participate in this academic competition
                            </Label>
                          </div>
                        </div>
                      </Card>
                    ))}

                    {participants.length === 0 && (
                      <div className="text-center py-8">
                        <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Participants Added</h3>
                        <p className="text-muted-foreground mb-4">
                          Click "Add Participant" to register students for this competition.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Continue Button */}
                {participants.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setActiveTab("review-submit")}
                      data-testid="button-continue-review"
                    >
                      Continue to Review
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Review & Submit Tab */}
          <TabsContent value="review-submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Review Registration</span>
                </CardTitle>
                <CardDescription>
                  Review all information before submitting the registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Event Summary */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Event Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Meet:</strong> {selectedMeet?.meetName}
                    </div>
                    <div>
                      <strong>Competition:</strong> {selectedCompetition?.name}
                    </div>
                    <div>
                      <strong>Date:</strong> {selectedMeet ? new Date(selectedMeet.meetDate).toLocaleDateString() : ''}
                    </div>
                    <div>
                      <strong>Location:</strong> {selectedMeet?.location}
                    </div>
                  </div>
                </div>

                {/* Participants Summary */}
                <div>
                  <h4 className="font-semibold mb-3">Registered Participants ({participants.length})</h4>
                  <div className="space-y-3">
                    {participants.map((participant, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">
                            {participant.firstName} {participant.lastName}
                          </div>
                          <Badge variant="outline">{participant.participantRole}</Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>Grade {participant.grade}</div>
                          <div>ID: {participant.studentId}</div>
                          <div>Position: {participant.entryPosition}</div>
                          <div className="flex items-center space-x-1">
                            {participant.ferpaConsent && participant.parentalConsent ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span>Consents</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance Check */}
                <Alert>
                  <UserCheck className="h-4 w-4" />
                  <AlertDescription>
                    All participants have completed required consent forms and are eligible to compete.
                    Registration will be submitted with FERPA compliance documentation.
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("register-participants")}
                      data-testid="button-back-participants"
                    >
                      Back to Participants
                    </Button>
                    <Button
                      type="submit"
                      disabled={registrationMutation.isPending}
                      data-testid="button-submit-registration"
                    >
                      {registrationMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Save className="h-4 w-4" />
                          <span>Submit Registration</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}