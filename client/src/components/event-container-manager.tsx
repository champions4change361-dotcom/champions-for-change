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
  UserPlus
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

// Mock data for development
const mockEvents: EventContainer[] = [
  {
    eventName: '100m Sprint',
    eventType: 'Track',
    scoringUnit: 'seconds',
    description: '100 meter sprint race',
    participantLimit: 8,
    participants: [
      {
        id: '1',
        name: 'Alex Johnson',
        email: 'alex@email.com',
        registrationTime: '2025-09-01T10:30:00Z',
        result: { score: 12.45, unit: 'seconds', rank: 1 }
      },
      {
        id: '2',
        name: 'Maria Garcia',
        email: 'maria@email.com',
        registrationTime: '2025-09-01T11:15:00Z',
        result: { score: 12.78, unit: 'seconds', rank: 2 }
      },
      {
        id: '3',
        name: 'James Wilson',
        email: 'james@email.com',
        registrationTime: '2025-09-01T14:20:00Z'
      }
    ],
    resultsRecorder: 'Coach Smith',
    status: 'in-progress',
    registrationUrl: `/tournaments/demo/register?event=100m-sprint`
  },
  {
    eventName: 'Long Jump',
    eventType: 'Field',
    scoringUnit: 'meters',
    description: 'Long jump competition',
    participantLimit: 12,
    participants: [
      {
        id: '4',
        name: 'Sarah Davis',
        email: 'sarah@email.com',
        registrationTime: '2025-09-01T09:45:00Z',
        result: { score: 5.67, unit: 'meters', rank: 1 }
      },
      {
        id: '5',
        name: 'Mike Chen',
        email: 'mike@email.com',
        registrationTime: '2025-09-01T12:30:00Z'
      }
    ],
    resultsRecorder: 'Coach Martinez',
    status: 'completed',
    registrationUrl: `/tournaments/demo/register?event=long-jump`
  },
  {
    eventName: '200m Sprint',
    eventType: 'Track',
    scoringUnit: 'seconds',
    description: '200 meter sprint race',
    participantLimit: 8,
    participants: [],
    resultsRecorder: 'Coach Johnson',
    status: 'registration',
    registrationUrl: `/tournaments/demo/register?event=200m-sprint`
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          Event Management
        </h2>
        <Badge variant="outline" className="text-sm">
          {events.length} Events
        </Badge>
      </div>

      <div className="grid gap-6">
        {events.map((event, index) => {
          const spotsRemaining = event.participantLimit - event.participants.length;
          const completedParticipants = event.participants.filter(p => p.result).length;
          
          return (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant={event.eventType === 'Track' ? 'default' : 'secondary'} className="text-xs">
                        {event.eventType}
                      </Badge>
                      {event.eventName}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                      {getStatusIcon(event.status)}
                      <span className="ml-1 capitalize">{event.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Event Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <Users className="h-4 w-4 mx-auto text-gray-500 mb-1" />
                    <div className="font-semibold">{event.participants.length}</div>
                    <div className="text-gray-500">Registered</div>
                  </div>
                  
                  <div className="bg-blue-50 rounded p-3 text-center">
                    <Target className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <div className="font-semibold">{spotsRemaining}</div>
                    <div className="text-gray-500">Spots Left</div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded p-3 text-center">
                    <Clock className="h-4 w-4 mx-auto text-yellow-500 mb-1" />
                    <div className="font-semibold">{completedParticipants}</div>
                    <div className="text-gray-500">Results In</div>
                  </div>
                  
                  <div className="bg-green-50 rounded p-3 text-center">
                    <Trophy className="h-4 w-4 mx-auto text-green-500 mb-1" />
                    <div className="font-semibold">{event.scoringUnit}</div>
                    <div className="text-gray-500">Scoring Unit</div>
                  </div>
                </div>

                <Separator />

                {/* Results Recorder */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Medal className="h-4 w-4 text-gray-500" />
                    <span>Results Recorder: </span>
                    <span className="font-medium">{event.resultsRecorder || 'Not assigned'}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>

                <Separator />

                {/* Participant Management */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Participants ({event.participants.length}/{event.participantLimit})
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyRegistrationLink(event.registrationUrl)}
                      >
                        Copy Registration Link
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvent(selectedEvent === event.eventName ? null : event.eventName)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Participant
                      </Button>
                    </div>
                  </div>

                  {/* Add Participant Form */}
                  {selectedEvent === event.eventName && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                          
                          <div className="flex items-end gap-2">
                            <Button
                              onClick={() => handleAddParticipant(event.eventName)}
                              disabled={spotsRemaining <= 0}
                              size="sm"
                              className="w-full"
                            >
                              Add
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