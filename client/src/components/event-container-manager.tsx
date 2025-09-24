import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Users, 
  Trophy, 
  Plus, 
  Edit, 
  Eye,
  Clock,
  Medal,
  AlertCircle,
  CheckCircle,
  UserPlus,
  Link
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventParticipant {
  id: string;
  name: string;
  email: string;
  registrationTime: string;
  result?: {
    score: number | string;
    unit: string;
    rank?: number;
  };
}

interface EventContainer {
  eventName: string;
  eventType: 'Track' | 'Field' | 'Swimming' | 'Gymnastics' | 'Other';
  scoringUnit: string;
  description: string;
  participantLimit: number;
  participants: EventParticipant[];
  resultsRecorder?: string;
  status: 'registration' | 'in-progress' | 'completed';
  registrationUrl: string;
}

interface EventContainerManagerProps {
  tournamentId: string;
  events: EventContainer[];
  onUpdateEvent?: (eventName: string, updates: Partial<EventContainer>) => void;
}

// Mock data for development - Basketball events for demo
const mockEvents: EventContainer[] = [
  {
    eventName: 'Basketball Game',
    eventType: 'Other',
    scoringUnit: 'points',
    description: 'Full basketball game competition',
    participantLimit: 10,
    participants: [],
    resultsRecorder: 'Referee',
    status: 'registration',
    registrationUrl: `/tournaments/basketball/register?event=basketball-game`
  },
  {
    eventName: 'Free Throw Contest',
    eventType: 'Other',
    scoringUnit: 'percentage',
    description: 'Free throw shooting accuracy contest',
    participantLimit: 8,
    participants: [],
    resultsRecorder: 'Coach',
    status: 'registration',
    registrationUrl: `/tournaments/basketball/register?event=free-throw`
  },
  {
    eventName: '3-Point Contest',
    eventType: 'Other',
    scoringUnit: 'made shots',
    description: '3-point shooting contest',
    participantLimit: 8,
    participants: [],
    resultsRecorder: 'Coach',
    status: 'registration',
    registrationUrl: `/tournaments/basketball/register?event=3-point`
  }
];

export default function EventContainerManager({ 
  tournamentId, 
  events = mockEvents,
  onUpdateEvent 
}: EventContainerManagerProps) {
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newParticipantEmail, setNewParticipantEmail] = useState('');

  const handleAddParticipant = (eventName: string) => {
    if (!newParticipantName.trim() || !newParticipantEmail.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both name and email for the participant.',
        variant: 'destructive'
      });
      return;
    }

    const newParticipant: EventParticipant = {
      id: Date.now().toString(),
      name: newParticipantName.trim(),
      email: newParticipantEmail.trim(),
      registrationTime: new Date().toISOString()
    };

    // Simulate adding participant to event
    toast({
      title: 'Participant Added',
      description: `${newParticipant.name} has been registered for ${eventName}`,
    });

    setNewParticipantName('');
    setNewParticipantEmail('');
    setSelectedEvent(null);
  };

  const copyRegistrationLink = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    toast({
      title: 'Link Copied',
      description: 'Registration link copied to clipboard',
    });
  };

  const getStatusColor = (status: EventContainer['status']) => {
    switch (status) {
      case 'registration': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status: EventContainer['status']) => {
    switch (status) {
      case 'registration': return <UserPlus className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          Event Management
        </h2>
        <Badge variant="outline" className="text-xs sm:text-sm w-fit">
          {events.length} Events
        </Badge>
      </div>

      <div className="grid gap-6">
        {events.map((event, index) => {
          const spotsRemaining = event.participantLimit - event.participants.length;
          const completedParticipants = event.participants.filter(p => p.result).length;
          
          return (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg">
                      <Badge variant={event.eventType === 'Track' ? 'default' : 'secondary'} className="text-xs w-fit">
                        {event.eventType}
                      </Badge>
                      <span className="break-words">{event.eventName}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(event.status)} flex items-center gap-1`}>
                      {getStatusIcon(event.status)}
                      <span className="capitalize">{event.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Event Statistics - Mobile Optimized */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-sm">
                  <div className="bg-gray-50 rounded p-2 sm:p-3 text-center">
                    <Users className="h-4 w-4 mx-auto text-gray-500 mb-1" />
                    <div className="font-semibold text-base sm:text-lg">{event.participants.length}</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Registered</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded p-2 sm:p-3 text-center">
                    <Target className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <div className="font-semibold text-base sm:text-lg">{spotsRemaining}</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Spots Left</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded p-2 sm:p-3 text-center">
                    <Clock className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                    <div className="font-semibold text-base sm:text-lg">{completedParticipants}</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Results In</div>
                  </div>
                  
                  <div className="bg-green-50 rounded p-2 sm:p-3 text-center">
                    <Trophy className="h-4 w-4 mx-auto text-green-500 mb-1" />
                    <div className="font-semibold text-base sm:text-lg">{event.scoringUnit}</div>
                    <div className="text-gray-500 text-xs sm:text-sm">Scoring Unit</div>
                  </div>
                </div>

                <Separator />

                {/* Results Recorder - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Medal className="h-4 w-4 text-gray-500" />
                    <span>Results Recorder: </span>
                    <span className="font-medium">{event.resultsRecorder || 'Not assigned'}</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-fit">
                    <Edit className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                </div>

                <Separator />

                {/* Participant Management */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h4 className="font-medium flex items-center gap-2 text-sm sm:text-base">
                      <Users className="h-4 w-4" />
                      Participants ({event.participants.length}/{event.participantLimit})
                    </h4>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyRegistrationLink(event.registrationUrl)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Link className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Copy Registration Link</span>
                        <span className="sm:hidden">Copy Link</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvent(selectedEvent === event.eventName ? null : event.eventName)}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Add Participant</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </div>
                  </div>

                  {/* Add Participant Form */}
                  {selectedEvent === event.eventName && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="participantName" className="text-xs">Name</Label>
                            <Input
                              id="participantName"
                              value={newParticipantName}
                              onChange={(e) => setNewParticipantName(e.target.value)}
                              placeholder="Participant name"
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="participantEmail" className="text-xs">Email</Label>
                            <Input
                              id="participantEmail"
                              type="email"
                              value={newParticipantEmail}
                              onChange={(e) => setNewParticipantEmail(e.target.value)}
                              placeholder="email@example.com"
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                            <Button
                              onClick={() => handleAddParticipant(event.eventName)}
                              disabled={spotsRemaining <= 0}
                              size="sm"
                              className="w-full"
                            >
                              Add Participant
                            </Button>
                          </div>
                        </div>
                        
                        {spotsRemaining <= 0 && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                            <AlertCircle className="h-3 w-3" />
                            Event is full - cannot add more participants
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Participants List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {event.participants.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No participants registered yet
                      </div>
                    ) : (
                      event.participants.map((participant, pIndex) => (
                        <div key={pIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">{participant.name}</div>
                            <div className="text-xs text-gray-500">{participant.email}</div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {participant.result ? (
                              <div className="text-right">
                                <div className="font-medium text-green-600">
                                  {participant.result.score} {participant.result.unit}
                                </div>
                                {participant.result.rank && (
                                  <div className="text-xs text-gray-500">
                                    Rank #{participant.result.rank}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Awaiting Result
                              </Badge>
                            )}
                            
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}