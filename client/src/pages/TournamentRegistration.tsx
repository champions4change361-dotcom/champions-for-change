import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Trophy, User, Mail, Phone, Calendar, MapPin, Target, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Smart tournament registration schema matching database schema
const registrationSchema = z.object({
  participantName: z.string().min(1, 'Participant name is required'),
  participantType: z.enum(['individual', 'team']).default('individual'),
  teamName: z.string().optional(),
  
  // Contact information (matching database schema)
  contactEmail: z.string().email('Valid email address is required'),
  contactPhone: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional()
  }).optional(),
  
  // Participant criteria for smart assignment - fix age field conversion
  age: z.coerce.number().min(5).max(25),
  grade: z.string().optional(),
  gender: z.enum(['boys', 'girls', 'men', 'women', 'mixed', 'co-ed', 'other']),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
  
  // Multi-sport selections - support both divisions and events
  requestedEventIds: z.array(z.string()).optional().default([]),
  requestedDivisionIds: z.array(z.string()).optional().default([]),
  eventPreferences: z.array(z.object({
    priority: z.enum(['high', 'medium', 'low']),
    notes: z.string().optional()
  })).optional(),
});

// Refine to ensure at least one selection is made
const refinedRegistrationSchema = registrationSchema.refine(
  (data) => (data.requestedEventIds?.length ?? 0) > 0 || (data.requestedDivisionIds?.length ?? 0) > 0,
  {
    message: 'At least one event or division must be selected',
    path: ['requestedEventIds']
  }
);

type RegistrationFormData = z.infer<typeof refinedRegistrationSchema>;

// Tournament and form data types
interface TournamentEvent {
  id: string;
  eventName: string;
  eventType: string;
  description?: string;
  participantLimit: number;
  currentParticipants: number;
  scoringMethod?: string;
  measurementUnit?: string;
}

interface TournamentDivision {
  id: string;
  divisionName: string;
  divisionType: string;
  participantCount: number;
  maxParticipants: number;
  divisionConfig: any;
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
  tournamentDate: string;
  location: string;
  entryFee: string;
  description?: string;
  registrationDeadline?: string;
  status: string;
  competitionFormat: string;
}

interface RegistrationForm {
  id: string;
  tournamentId: string;
  formName: string;
  formDescription?: string;
  targetDivisions?: string[];
  targetEvents?: string[];
  participantCriteria: any;
  entryFee: string;
  registrationDeadline?: string;
  maxRegistrations?: number;
  currentRegistrations: number;
}


export default function TournamentRegistration() {
  const { tournamentId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegistered, setIsRegistered] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState<any>(null);

  // Fetch tournament data
  const { data: tournament, isLoading: tournamentLoading, error: tournamentError } = useQuery<Tournament>({
    queryKey: ['/api/tournaments', tournamentId],
    enabled: !!tournamentId,
  });

  // Fetch tournament events if tournament supports events
  const { data: events = [], isLoading: eventsLoading } = useQuery<TournamentEvent[]>({
    queryKey: ['/api/tournaments', tournamentId, 'events'],
    enabled: !!tournamentId && tournament?.competitionFormat !== 'bracket',
  });

  // Fetch tournament divisions if tournament supports divisions
  const { data: divisions = [], isLoading: divisionsLoading } = useQuery<TournamentDivision[]>({
    queryKey: ['/api/tournaments', tournamentId, 'divisions'],  
    enabled: !!tournamentId && tournament?.competitionFormat === 'bracket',
  });

  // Fetch registration form for this tournament
  const { data: registrationForm, isLoading: formLoading } = useQuery<RegistrationForm>({
    queryKey: ['/api/registration-forms', 'tournament', tournamentId],
    enabled: !!tournamentId,
  });

  const isLoading = tournamentLoading || eventsLoading || divisionsLoading || formLoading;

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(refinedRegistrationSchema),
    defaultValues: {
      participantName: '',
      participantType: 'individual' as const,
      teamName: '',
      contactEmail: '',
      contactPhone: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      age: 12,
      grade: '',
      gender: 'boys' as const,
      skillLevel: 'intermediate' as const,
      requestedEventIds: [],
      requestedDivisionIds: [],
      eventPreferences: [],
    },
  });

  // Calculate total fee based on selections
  const selectedEventsCount = form.watch('requestedEventIds')?.length || 0;
  const selectedDivisionsCount = form.watch('requestedDivisionIds')?.length || 0;
  const totalSelections = selectedEventsCount + selectedDivisionsCount;
  const baseFee = parseFloat(registrationForm?.entryFee || tournament?.entryFee || '0');
  const totalFee = totalSelections * baseFee;

  const handleEventToggle = (eventId: string, checked: boolean) => {
    const currentEvents = form.getValues('requestedEventIds') || [];
    
    if (checked) {
      form.setValue('requestedEventIds', [...currentEvents, eventId]);
    } else {
      form.setValue('requestedEventIds', currentEvents.filter(e => e !== eventId));
    }
  };

  const handleDivisionToggle = (divisionId: string, checked: boolean) => {
    const currentDivisions = form.getValues('requestedDivisionIds') || [];
    
    if (checked) {
      form.setValue('requestedDivisionIds', [...currentDivisions, divisionId]);
    } else {
      form.setValue('requestedDivisionIds', currentDivisions.filter(d => d !== divisionId));
    }
  };

  // Registration submission mutation
  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      if (!registrationForm?.id && !tournament?.id) {
        throw new Error('Tournament or registration form not found');
      }

      const formId = registrationForm?.id || `form_${tournament?.id}`;
      const response = await apiRequest('POST', `/api/registration-forms/${formId}/submit`, {
        formId,
        tournamentId: tournament?.id,
        ...data,
        requestedEventIds: data.requestedEventIds || [],
        requestedDivisionIds: data.requestedDivisionIds || []
      });
      
      // Fix: apiRequest returns Response, need to parse JSON
      return await response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Smart Assignment Complete!',
          description: `Successfully registered with ${result.submission?.assignmentResult?.success ? 'automatic placement' : 'waitlist placement'}.`,
        });
        
        console.log('🎯 Smart assignment result:', result.submission?.assignmentResult);
        setAssignmentResult(result.submission?.assignmentResult);
        setIsRegistered(true);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['/api/tournaments'] });
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    },
    onError: (error: any) => {
      console.error('Smart registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Please try again or contact support.',
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: RegistrationFormData) => {
    registrationMutation.mutate(data);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
        <div className="max-w-2xl mx-auto flex items-center justify-center">
          <Card>
            <CardContent className="pt-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
              <h2 className="text-xl font-semibold mb-2">Loading Tournament...</h2>
              <p className="text-gray-600">Fetching tournament details and registration information.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle error state
  if (tournamentError || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-8 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Tournament Not Found</h2>
              <p className="text-red-700 mb-6">
                The tournament you're looking for doesn't exist or registration is closed.
              </p>
              <Button onClick={() => window.location.href = '/tournaments'} data-testid="button-back-tournaments">
                Browse Tournaments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle registration success state
  if (isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Registration Complete!</h2>
              <p className="text-green-700 mb-6">
                You've successfully registered for the tournament. You'll receive a confirmation email shortly.
              </p>
              
              {assignmentResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-blue-900 mb-2">Assignment Result:</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    {assignmentResult.assignedDivision && (
                      <p>Division: <span className="font-medium">{assignmentResult.assignedDivision}</span></p>
                    )}
                    {assignmentResult.assignedEvents && assignmentResult.assignedEvents.length > 0 && (
                      <p>Events: <span className="font-medium">{assignmentResult.assignedEvents.join(', ')}</span></p>
                    )}
                    {assignmentResult.seedNumber && (
                      <p>Seed: <span className="font-medium">#{assignmentResult.seedNumber}</span></p>
                    )}
                  </div>
                </div>
              )}
              
              <Button onClick={() => window.location.href = '/tournaments'} data-testid="button-view-tournaments">
                View All Tournaments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4" data-testid="tournament-registration-page">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Tournament Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  {tournament.name}
                </CardTitle>
                <CardDescription className="text-base">
                  {tournament.sport} • {tournament.tournamentDate ? new Date(tournament.tournamentDate).toLocaleDateString() : 'Date TBD'}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                Registration Open
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>
                  {tournament.tournamentDate ? (
                    `${new Date(tournament.tournamentDate).toLocaleDateString()} at ${new Date(tournament.tournamentDate).toLocaleTimeString()}`
                  ) : 'Date TBD'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{tournament.location || 'Location TBD'}</span>
              </div>
            </div>
            
            {(registrationForm?.registrationDeadline || tournament.registrationDeadline) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Registration Deadline: {new Date(registrationForm?.registrationDeadline || tournament.registrationDeadline || '').toLocaleDateString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Dynamic Selection - Events OR Divisions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Events Section (for Track & Field, Swimming, etc.) */}
            {events && events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Select Events
                  </CardTitle>
                  <CardDescription>
                    Choose which events you want to compete in. You can select multiple events.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {events.map((event: TournamentEvent) => {
                    const isSelected = form.watch('requestedEventIds')?.includes(event.id);
                    const spotsRemaining = event.participantLimit - event.currentParticipants;
                    const isFull = spotsRemaining <= 0;
                    
                    return (
                      <div key={event.id} className={`border rounded-lg p-4 ${
                        isSelected ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      } ${isFull ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              disabled={isFull && !isSelected}
                              onCheckedChange={(checked) => handleEventToggle(event.id, checked as boolean)}
                              data-testid={`checkbox-event-${event.id}`}
                            />
                            <div className="space-y-1">
                              <h4 className="font-medium">{event.eventName}</h4>
                              {event.description && (
                                <p className="text-sm text-gray-600">{event.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {event.measurementUnit && (
                                  <>
                                    <span>Scoring: {event.measurementUnit}</span>
                                    <span>•</span>
                                  </>
                                )}
                                <span className={spotsRemaining <= 3 ? 'text-orange-600 font-medium' : ''}>
                                  {spotsRemaining} spots remaining
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={event.eventType === 'Track' ? 'default' : 'secondary'} className="text-xs">
                              {event.eventType}
                            </Badge>
                            {isFull && (
                              <Badge variant="destructive" className="text-xs">
                                Full
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Divisions Section (for Basketball, Soccer, etc.) */}
            {divisions && divisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Select Division
                  </CardTitle>
                  <CardDescription>
                    Choose which age/skill division you want to compete in.
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {divisions.map((division: TournamentDivision) => {
                    const isSelected = form.watch('requestedDivisionIds')?.includes(division.id);
                    const spotsRemaining = division.maxParticipants - division.participantCount;
                    const isFull = spotsRemaining <= 0;
                    
                    return (
                      <div key={division.id} className={`border rounded-lg p-4 ${
                        isSelected ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      } ${isFull ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Checkbox
                              checked={isSelected}
                              disabled={isFull && !isSelected}
                              onCheckedChange={(checked) => handleDivisionToggle(division.id, checked as boolean)}
                              data-testid={`checkbox-division-${division.id}`}
                            />
                            <div className="space-y-1">
                              <h4 className="font-medium">{division.divisionName}</h4>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Type: {division.divisionType}</span>
                                <span>•</span>
                                <span>Current: {division.participantCount}/{division.maxParticipants}</span>
                                <span>•</span>
                                <span className={spotsRemaining <= 3 ? 'text-orange-600 font-medium' : ''}>
                                  {spotsRemaining} spots remaining
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className="text-xs">
                              {division.divisionType}
                            </Badge>
                            {isFull && (
                              <Badge variant="destructive" className="text-xs">
                                Full
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
            
            {/* No events or divisions available */}
            {(!events || events.length === 0) && (!divisions || divisions.length === 0) && (
              <Card>
                <CardContent className="pt-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Registration Options Available</h3>
                  <p className="text-gray-600">
                    This tournament doesn't have any available events or divisions for registration at this time.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {form.formState.errors.requestedEventIds && (
              <p className="text-sm text-red-600">{form.formState.errors.requestedEventIds.message}</p>
            )}

            {/* Registration Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Participant Information
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="participantName">Full Name *</Label>
                      <Input
                        {...form.register('participantName')}
                        placeholder="Enter participant's full name"
                        data-testid="input-participant-name"
                      />
                      {form.formState.errors.participantName && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.participantName.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <Input
                        type="email"
                        {...form.register('contactEmail')}
                        placeholder="participant@email.com"
                        data-testid="input-email"
                      />
                      {form.formState.errors.contactEmail && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.contactEmail.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        {...form.register('contactPhone')}
                        placeholder="(555) 123-4567"
                        data-testid="input-phone"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        type="number"
                        {...form.register('age', { 
                          valueAsNumber: true,
                          setValueAs: (value) => value === '' ? undefined : Number(value)
                        })}
                        placeholder="12"
                        data-testid="input-age"
                      />
                      {form.formState.errors.age && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.age.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact.name">Emergency Contact Name</Label>
                      <Input
                        {...form.register('emergencyContact.name')}
                        placeholder="Emergency contact name"
                        data-testid="input-emergency-contact"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emergencyContact.phone">Emergency Phone</Label>
                      <Input
                        {...form.register('emergencyContact.phone')}
                        placeholder="Emergency contact phone"
                        data-testid="input-emergency-phone"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Registration Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Registration Summary</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Selected Items:</span>
                    <span className="font-medium">{totalSelections}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Fee per Item:</span>
                    <span>${baseFee.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${totalFee.toFixed(2)}</span>
                  </div>
                </div>
                
                {totalSelections > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Selected Items:</h4>
                    <div className="space-y-1">
                      {form.watch('requestedEventIds')?.map((eventId) => {
                        const event = events?.find(e => e.id === eventId);
                        return event ? (
                          <div key={eventId} className="text-xs bg-blue-50 rounded px-2 py-1">
                            {event.eventName}
                          </div>
                        ) : null;
                      })}
                      {form.watch('requestedDivisionIds')?.map((divisionId) => {
                        const division = divisions?.find(d => d.id === divisionId);
                        return division ? (
                          <div key={divisionId} className="text-xs bg-green-50 rounded px-2 py-1">
                            {division.divisionName}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={registrationMutation.isPending || totalSelections === 0}
                  className="w-full"
                  data-testid="button-register"
                >
                  {registrationMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Register for Tournament
                      <Users className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                
                {totalFee > 0 && (
                  <p className="text-xs text-gray-600 text-center">
                    Payment will be processed after registration
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}