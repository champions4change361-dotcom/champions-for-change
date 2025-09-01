import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Trophy,
  AlertTriangle,
  RefreshCw,
  FileText,
  School
} from "lucide-react";

interface Participant {
  id: string;
  schoolName: string;
  athleteName: string;
  attempts: {
    attemptNumber: number;
    measurement: string | null;
    units: string;
    isValid: boolean | null;
  }[];
  bestMark: string;
  rank: number;
  checkedIn: boolean;
}

interface EventData {
  eventId: string;
  eventName: string;
  participants: Participant[];
  totalParticipants: number;
  checkedInCount: number;
}

interface EventScorekeeperDashboardProps {
  tournamentEventId: string;
}

export default function EventScorekeeperDashboard({ tournamentEventId }: EventScorekeeperDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [newAthleteName, setNewAthleteName] = useState<string>('');
  const [newSchoolName, setNewSchoolName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('manage');

  // Fetch event data and participants
  const { data: eventData, isLoading, error } = useQuery<EventData>({
    queryKey: ['/api/events', tournamentEventId, 'participants'],
    refetchInterval: 10000, // Refresh every 10 seconds for live updates
  });

  // Mutation for adding participants
  const addParticipantMutation = useMutation({
    mutationFn: async ({ schoolName, athleteName }: { schoolName: string; athleteName: string }) => {
      return apiRequest('POST', `/api/events/${tournamentEventId}/participants`, {
        schoolName,
        athleteName
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', tournamentEventId, 'participants'] });
      setNewAthleteName('');
      setSelectedSchool('');
      toast({
        title: "Participant Added",
        description: "New athlete successfully added to the event.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Participant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for recording attempts
  const recordAttemptMutation = useMutation({
    mutationFn: async ({ 
      participantId, 
      attemptNumber, 
      measurement, 
      isValid 
    }: { 
      participantId: string; 
      attemptNumber: number; 
      measurement: string; 
      isValid: boolean;
    }) => {
      return apiRequest('POST', `/api/events/${tournamentEventId}/attempts`, {
        participantId,
        attemptNumber,
        measurement,
        isValid
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events', tournamentEventId, 'participants'] });
      toast({
        title: "Attempt Recorded",
        description: "Attempt has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Record Attempt",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Event</h3>
            <p className="text-red-700">Unable to load event data. Please refresh the page or contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const schools = [...new Set(eventData?.participants.map(p => p.schoolName) || [])];
  const checkedInParticipants = eventData?.participants.filter(p => p.checkedIn) || [];
  const pendingParticipants = eventData?.participants.filter(p => !p.checkedIn) || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{eventData?.eventName}</h1>
            <p className="text-gray-600">Event Management Dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{eventData?.checkedInCount}/{eventData?.totalParticipants}</div>
            <p className="text-sm text-gray-500">Athletes Checked In</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{eventData?.totalParticipants}</div>
              <p className="text-sm text-gray-600">Total Athletes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <School className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{schools.length}</div>
              <p className="text-sm text-gray-600">Schools</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{checkedInParticipants.length}</div>
              <p className="text-sm text-gray-600">Checked In</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{pendingParticipants.length}</div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage Athletes</TabsTrigger>
          <TabsTrigger value="compete">Record Results</TabsTrigger>
          <TabsTrigger value="results">Final Results</TabsTrigger>
        </TabsList>

        {/* Manage Athletes Tab */}
        <TabsContent value="manage" className="space-y-6">
          {/* Add New Participant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Walk-Up Athlete (Organized Chaos Support)
              </CardTitle>
              <CardDescription>
                Add athletes who weren't pre-registered - common in track meets where schools bring surprise participants
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="school-select">School</Label>
                  <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing school or add new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__new__">➕ Add New School</SelectItem>
                      {schools.map((school) => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSchool === '__new__' && (
                  <div>
                    <Label htmlFor="new-school">New School Name</Label>
                    <Input
                      id="new-school"
                      placeholder="e.g., Westfield High School"
                      value={newSchoolName}
                      onChange={(e) => setNewSchoolName(e.target.value)}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="athlete-name">Athlete Name</Label>
                  <Input
                    id="athlete-name"
                    placeholder="e.g., Sarah Johnson"
                    value={newAthleteName}
                    onChange={(e) => setNewAthleteName(e.target.value)}
                  />
                </div>
              </div>
              
              <Button
                onClick={() => {
                  const schoolName = selectedSchool === '__new__' ? newSchoolName : selectedSchool;
                  if (schoolName && newAthleteName) {
                    addParticipantMutation.mutate({
                      schoolName,
                      athleteName: newAthleteName
                    });
                  }
                }}
                disabled={!((selectedSchool && selectedSchool !== '__new__') || newSchoolName) || !newAthleteName || addParticipantMutation.isPending}
                className="w-full md:w-auto"
              >
                {addParticipantMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Athlete
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* School-by-School Roster */}
          <div className="grid gap-6">
            {schools.map((school) => {
              const schoolParticipants = eventData?.participants.filter(p => p.schoolName === school) || [];
              return (
                <Card key={school}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <School className="h-5 w-5" />
                        {school}
                      </div>
                      <Badge variant="outline">
                        {schoolParticipants.length} athletes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {schoolParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              participant.checkedIn ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className="font-medium">{participant.athleteName}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {participant.bestMark && (
                              <Badge variant="secondary">
                                Best: {participant.bestMark}
                              </Badge>
                            )}
                            <Badge variant={participant.checkedIn ? "default" : "outline"}>
                              {participant.checkedIn ? "Checked In" : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Record Results Tab */}
        <TabsContent value="compete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Live Competition Recording
              </CardTitle>
              <CardDescription>
                Record attempts as they happen - call up each school one at a time, each athlete gets 3 attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {checkedInParticipants.map((participant) => (
                  <div key={participant.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{participant.athleteName}</h4>
                        <p className="text-gray-600">{participant.schoolName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Current Rank</div>
                        <div className="text-2xl font-bold text-blue-600">#{participant.rank}</div>
                        {participant.bestMark && (
                          <div className="text-sm font-medium text-green-600">
                            Best: {participant.bestMark}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((attemptNum) => {
                        const attempt = participant.attempts.find(a => a.attemptNumber === attemptNum);
                        return (
                          <div key={attemptNum} className="space-y-2">
                            <Label>Attempt {attemptNum}</Label>
                            {attempt?.measurement ? (
                              <div className={`p-2 border rounded text-center ${
                                attempt.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                              }`}>
                                <div className="font-medium">
                                  {attempt.isValid ? attempt.measurement : 'FOUL'}
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="35.25 or FOUL"
                                  className="text-center"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement;
                                      const measurement = target.value.trim();
                                      const isValid = measurement !== 'FOUL' && measurement !== '';
                                      
                                      recordAttemptMutation.mutate({
                                        participantId: participant.id,
                                        attemptNumber: attemptNum,
                                        measurement,
                                        isValid
                                      });
                                    }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    recordAttemptMutation.mutate({
                                      participantId: participant.id,
                                      attemptNumber: attemptNum,
                                      measurement: 'FOUL',
                                      isValid: false
                                    });
                                  }}
                                >
                                  FOUL
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Final Results Tab */}
        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Final Results & Rankings
              </CardTitle>
              <CardDescription>
                Complete results for {eventData?.eventName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData?.participants
                  .filter(p => p.bestMark)
                  .sort((a, b) => a.rank - b.rank)
                  .map((participant, index) => (
                    <div key={participant.id} className={`flex items-center justify-between p-4 border rounded-lg ${
                      index < 3 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {participant.rank}
                        </div>
                        <div>
                          <div className="font-semibold">{participant.athleteName}</div>
                          <div className="text-sm text-gray-600">{participant.schoolName}</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">{participant.bestMark}</div>
                        <div className="text-sm text-gray-500">
                          {participant.attempts.filter(a => a.isValid).length} valid attempts
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Results
                </Button>
                <Button className="flex-1">
                  <Trophy className="h-4 w-4 mr-2" />
                  Finalize Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}