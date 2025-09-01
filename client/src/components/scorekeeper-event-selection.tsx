import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventAssignment {
  id: string;
  tournamentEventId: string;
  tournamentId: string;
  eventName: string;
  eventType: string;
  scoringUnit: string;
  eventDate: string;
  eventTime: string;
  location: string;
  assignmentStatus: 'open' | 'assigned' | 'accepted' | 'declined' | 'completed';
  assignmentType: 'self_selected' | 'manager_assigned';
  assignedAt?: string;
  assignmentNotes?: string;
  tournamentName: string;
}

interface ScorekeeperEventSelectionProps {
  tournamentId?: string; // Optional - show specific tournament or all available
}

export default function ScorekeeperEventSelection({ tournamentId }: ScorekeeperEventSelectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPreference, setSelectedPreference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch available event assignments
  const { data: eventAssignments, isLoading } = useQuery({
    queryKey: ['/api/event-assignments', tournamentId, user?.id],
    enabled: !!user,
  });

  // Mutation for claiming/accepting/declining assignments
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, action, notes }: { 
      assignmentId: string; 
      action: 'claim' | 'accept' | 'decline'; 
      notes?: string;
    }) => {
      return apiRequest('POST', `/api/event-assignments/${assignmentId}/${action}`, { notes });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/event-assignments'] });
      
      const actionText = variables.action === 'claim' ? 'claimed' : 
                        variables.action === 'accept' ? 'accepted' : 'declined';
      
      toast({
        title: "Assignment Updated",
        description: `You have ${actionText} the event assignment.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const openAssignments = eventAssignments?.filter((a: EventAssignment) => 
    a.assignmentStatus === 'open') || [];
  
  const myAssignments = eventAssignments?.filter((a: EventAssignment) => 
    a.assignmentStatus === 'assigned' || a.assignmentStatus === 'accepted') || [];

  const myHistory = eventAssignments?.filter((a: EventAssignment) => 
    a.assignmentStatus === 'completed' || a.assignmentStatus === 'declined') || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Event Assignment Center
        </h1>
        <p className="text-gray-600">
          Just like the Google Sheets signup - claim your preferred events or manage your assignments
        </p>
      </div>

      {/* Coach Preference Setting */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="h-5 w-5" />
            Your Event Preferences
          </CardTitle>
          <CardDescription className="text-blue-700">
            Tell us your preferred events so we can suggest assignments that match your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preferred-events">Preferred Events (like "discus and triple jump")</Label>
              <Input
                id="preferred-events"
                placeholder="e.g., Discus, Triple Jump, Shot Put"
                value={selectedPreference}
                onChange={(e) => setSelectedPreference(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="experience-notes">Experience Notes</Label>
              <Input
                id="experience-notes"
                placeholder="e.g., I've done discus for 10 years"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" variant="outline">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Open Events for Self-Selection */}
      {openAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Available Events (Self-Select)
            </CardTitle>
            <CardDescription>
              These events are open for coaches to claim - first come, first served!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {openAssignments.map((assignment: EventAssignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{assignment.eventName}</h3>
                      <Badge variant="outline">{assignment.eventType}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {assignment.eventDate}
                      </div>
                      {assignment.eventTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {assignment.eventTime}
                        </div>
                      )}
                      {assignment.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {assignment.location}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Tournament: {assignment.tournamentName}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Available
                    </Badge>
                    <Button
                      onClick={() => updateAssignmentMutation.mutate({
                        assignmentId: assignment.id,
                        action: 'claim',
                        notes: `Coach self-selected this event (like Google Sheets signup)`
                      })}
                      disabled={updateAssignmentMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updateAssignmentMutation.isPending ? 'Claiming...' : 'Claim This Event'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Current Assignments */}
      {myAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <AlertCircle className="h-5 w-5" />
              My Event Assignments
            </CardTitle>
            <CardDescription>
              Events assigned to you or that you've claimed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {myAssignments.map((assignment: EventAssignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{assignment.eventName}</h3>
                      <Badge variant="outline">{assignment.eventType}</Badge>
                      <Badge 
                        variant={assignment.assignmentStatus === 'accepted' ? 'default' : 'secondary'}
                        className={assignment.assignmentStatus === 'accepted' ? 'bg-blue-600' : ''}
                      >
                        {assignment.assignmentStatus === 'assigned' ? 'Pending Acceptance' : 'Accepted'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {assignment.eventDate}
                      </div>
                      {assignment.eventTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {assignment.eventTime}
                        </div>
                      )}
                      {assignment.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {assignment.location}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      Tournament: {assignment.tournamentName}
                    </p>
                    
                    {assignment.assignmentNotes && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        Notes: {assignment.assignmentNotes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {assignment.assignmentStatus === 'assigned' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateAssignmentMutation.mutate({
                            assignmentId: assignment.id,
                            action: 'accept'
                          })}
                          disabled={updateAssignmentMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAssignmentMutation.mutate({
                            assignmentId: assignment.id,
                            action: 'decline',
                            notes: 'Unable to work this event'
                          })}
                          disabled={updateAssignmentMutation.isPending}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {assignment.assignmentStatus === 'accepted' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // Navigate to event management dashboard
                          window.location.href = `/events/${assignment.tournamentEventId}/manage`;
                        }}
                      >
                        Manage Event
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment History */}
      {myHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <XCircle className="h-5 w-5" />
              Assignment History
            </CardTitle>
            <CardDescription>
              Your past assignments and declined events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {myHistory.map((assignment: EventAssignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{assignment.eventName}</h4>
                      <Badge 
                        variant={assignment.assignmentStatus === 'completed' ? 'default' : 'secondary'}
                        className={assignment.assignmentStatus === 'completed' ? 'bg-gray-600' : 'bg-red-100 text-red-700'}
                      >
                        {assignment.assignmentStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">Tournament: {assignment.tournamentName}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {assignment.eventDate}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {openAssignments.length === 0 && myAssignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
            <p className="text-gray-600">
              No tournaments are currently seeking scorekeepers. Check back later or contact your tournament manager.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}