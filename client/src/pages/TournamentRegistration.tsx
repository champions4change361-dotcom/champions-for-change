import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Trophy, User, Mail, Phone, Calendar, MapPin, Target, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';

// Registration form schema
const registrationSchema = z.object({
  participantName: z.string().min(1, 'Participant name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  selectedEvents: z.array(z.string()).min(1, 'At least one event must be selected'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

// Mock tournament data for development
const mockTournament = {
  id: 'tour-001',
  name: 'Spring Track & Field Championship',
  sport: 'Track & Field',
  date: '2025-09-15T09:00:00.000Z',
  location: 'Athletic Complex, 123 Stadium Drive',
  entryFee: '25.00',
  description: 'Annual spring championship featuring multiple track and field events',
  registrationDeadline: '2025-09-10T23:59:59.000Z',
  events: [
    {
      eventName: '100m Sprint',
      eventType: 'Track',
      scoringUnit: 'seconds',
      description: '100 meter sprint race',
      participantLimit: 8,
      currentParticipants: 3,
    },
    {
      eventName: 'Long Jump',
      eventType: 'Field',
      scoringUnit: 'meters',
      description: 'Long jump competition',
      participantLimit: 12,
      currentParticipants: 7,
    },
    {
      eventName: '200m Sprint',
      eventType: 'Track',
      scoringUnit: 'seconds',
      description: '200 meter sprint race',
      participantLimit: 8,
      currentParticipants: 2,
    },
    {
      eventName: 'Shot Put',
      eventType: 'Field',
      scoringUnit: 'meters',
      description: 'Shot put throwing competition',
      participantLimit: 10,
      currentParticipants: 5,
    },
  ],
};

export default function TournamentRegistration() {
  const { tournamentId } = useParams();
  const { toast } = useToast();
  const [tournament, setTournament] = useState(mockTournament);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      participantName: '',
      email: '',
      phone: '',
      emergencyContact: '',
      emergencyPhone: '',
      selectedEvents: [],
    },
  });

  // Calculate total fee
  const selectedEventsCount = form.watch('selectedEvents')?.length || 0;
  const totalFee = selectedEventsCount * parseFloat(tournament.entryFee || '0');

  const handleEventToggle = (eventName: string, checked: boolean) => {
    const currentEvents = form.getValues('selectedEvents') || [];
    
    if (checked) {
      form.setValue('selectedEvents', [...currentEvents, eventName]);
    } else {
      form.setValue('selectedEvents', currentEvents.filter(e => e !== eventName));
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call for registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Registration Successful!',
        description: `You've been registered for ${data.selectedEvents.length} events.`,
      });
      
      setIsRegistered(true);
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
              <Button onClick={() => window.location.href = '/tournaments'}>
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
                  {tournament.sport} • {new Date(tournament.date).toLocaleDateString()}
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
                <span>{new Date(tournament.date).toLocaleDateString()} at {new Date(tournament.date).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{tournament.location}</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
                <AlertCircle className="h-4 w-4" />
                Registration Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Event Selection */}
          <div className="lg:col-span-2 space-y-6">
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
                {tournament.events.map((event, index) => {
                  const isSelected = form.watch('selectedEvents')?.includes(event.eventName);
                  const spotsRemaining = event.participantLimit - event.currentParticipants;
                  const isFull = spotsRemaining <= 0;
                  
                  return (
                    <div key={index} className={`border rounded-lg p-4 ${
                      isSelected ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    } ${isFull ? 'opacity-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            checked={isSelected}
                            disabled={isFull && !isSelected}
                            onCheckedChange={(checked) => handleEventToggle(event.eventName, checked as boolean)}
                          />
                          <div className="space-y-1">
                            <h4 className="font-medium">{event.eventName}</h4>
                            <p className="text-sm text-gray-600">{event.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Scoring: {event.scoringUnit}</span>
                              <span>•</span>
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
                
                {form.formState.errors.selectedEvents && (
                  <p className="text-sm text-red-600">{form.formState.errors.selectedEvents.message}</p>
                )}
              </CardContent>
            </Card>

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
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        type="email"
                        {...form.register('email')}
                        placeholder="participant@email.com"
                        data-testid="input-email"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        {...form.register('phone')}
                        placeholder="(555) 123-4567"
                        data-testid="input-phone"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        {...form.register('emergencyContact')}
                        placeholder="Emergency contact name"
                        data-testid="input-emergency-contact"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      {...form.register('emergencyPhone')}
                      placeholder="Emergency contact phone"
                      data-testid="input-emergency-phone"
                    />
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
                    <span>Selected Events:</span>
                    <span className="font-medium">{selectedEventsCount}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Fee per Event:</span>
                    <span>${tournament.entryFee}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${totalFee.toFixed(2)}</span>
                  </div>
                </div>
                
                {selectedEventsCount > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Selected Events:</h4>
                    <div className="space-y-1">
                      {form.watch('selectedEvents')?.map((eventName, index) => (
                        <div key={index} className="text-xs bg-gray-50 rounded px-2 py-1">
                          {eventName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isLoading || selectedEventsCount === 0}
                  className="w-full"
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
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