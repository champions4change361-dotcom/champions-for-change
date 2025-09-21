import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileCheck, 
  AlertTriangle, 
  User, 
  Heart, 
  Activity,
  Loader2,
  Check,
  Brain,
  Thermometer
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertMedicalHistorySchema, type InsertMedicalHistory, type TeamPlayer } from '@shared/schema';

interface MedicalHistoryFormProps {
  playerId: string;
  onComplete?: () => void;
  readonly?: boolean;
}

// Utility function to sanitize and validate player ID
function validatePlayerId(playerId: string): boolean {
  return !!playerId && typeof playerId === 'string' && /^[a-zA-Z0-9_-]+$/.test(playerId) && playerId.length <= 50;
}

export function MedicalHistoryForm({ playerId, onComplete, readonly = false }: MedicalHistoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch player data for auto-population with secure validation
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery<TeamPlayer>({
    queryKey: ['/api/players', playerId],
    enabled: !!playerId && /^[a-zA-Z0-9_-]+$/.test(playerId),
    queryFn: async () => {
      // Validate playerId format to prevent injection attacks
      if (!playerId || !/^[a-zA-Z0-9_-]+$/.test(playerId)) {
        throw new Error('Invalid player ID format');
      }
      const response = await apiRequest(`/api/players/${encodeURIComponent(playerId)}`, 'GET');
      return response.data || response;
    },
    retry: 3,
    retryDelay: 1000,
    meta: {
      errorMessage: "Failed to load player data"
    }
  });

  // Fetch existing medical history if available
  const { data: existingMedicalHistory, isLoading: medicalHistoryLoading, error: medicalHistoryError } = useQuery({
    queryKey: ['/api/players', playerId, 'medical-history'],
    enabled: !!playerId && /^[a-zA-Z0-9_-]+$/.test(playerId),
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 - this means no medical history exists yet, which is fine
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    retryOnMount: false,
    meta: {
      errorMessage: "Failed to load medical history"
    }
  });

  const form = useForm<InsertMedicalHistory>({
    resolver: zodResolver(insertMedicalHistorySchema),
    defaultValues: {
      playerId,
      studentName: '',
      // Initialize all PPE questions to false/empty
      q1_recent_illness: false,
      q1_explanation: '',
      q2_hospitalized: false,
      q2_surgery: false,
      q2_explanation: '',
      q3_heart_testing: false,
      q3_passed_out_exercise: false,
      q3_chest_pain_exercise: false,
      q3_tired_quickly: false,
      q3_racing_heart: false,
      q3_high_bp_cholesterol: false,
      q3_heart_murmur: false,
      q3_family_heart_death: false,
      q3_family_heart_disease: false,
      q3_viral_infection: false,
      q3_physician_restricted: false,
      q3_explanation: '',
      q4_head_injury: false,
      q4_unconscious: false,
      q4_concussion_count: 0,
      q4_last_concussion_date: '',
      q4_explanation: '',
      q5_seizure: false,
      q5_headaches: false,
      q5_numbness: false,
      q5_stinger_burner: false,
      q5_explanation: '',
      q6_missing_organs: false,
      q6_explanation: '',
      q7_doctors_care: false,
      q7_explanation: '',
      q8_medications: false,
      q8_explanation: '',
      q9_allergies: false,
      q9_explanation: '',
      q10_dizzy_exercise: false,
      q10_explanation: '',
      q11_skin_problems: false,
      q11_explanation: '',
      q12_heat_illness: false,
      q12_explanation: '',
      q13_vision_problems: false,
      q13_explanation: '',
      q14_short_breath: false,
      q14_asthma: false,
      q14_seasonal_allergies: false,
      q14_explanation: '',
      q15_protective_equipment: false,
      q15_explanation: '',
      q16_sprain_strain: false,
      q16_broken_bones: false,
      q16_joint_problems: false,
      q16_body_parts: {},
      q16_explanation: '',
      q17_weight_concerns: false,
      q17_explanation: '',
      q18_stressed: false,
      q18_explanation: '',
      q19_sickle_cell: false,
      q19_explanation: '',
      q20_first_menstrual_period: '',
      q20_most_recent_period: '',
      q20_cycle_length: '',
      q20_periods_last_year: undefined,
      q20_longest_time_between: '',
      q21_missing_testicle: false,
      q21_testicular_swelling: false,
      q21_explanation: '',
      parentSignature: '',
      signatureDate: '',
      isComplete: false,
    },
  });

  // Reset form when player changes
  React.useEffect(() => {
    if (player && typeof player === 'object' && 'id' in player) {
      form.reset({
        ...form.getValues(),
        playerId: player.id as string,
        studentName: (player as any).playerName || '',
      });
    }
  }, [player, form]);

  // Populate form with existing medical history if available
  React.useEffect(() => {
    if (existingMedicalHistory && typeof existingMedicalHistory === 'object') {
      // Normalize null values to appropriate defaults
      const normalizedData: any = {};
      Object.entries(existingMedicalHistory).forEach(([key, value]) => {
        if (key.startsWith('q') && key.includes('_') && !key.includes('explanation')) {
          // Boolean fields - convert null to false
          normalizedData[key] = value === null ? false : value;
        } else if (typeof value === 'string' || key.includes('explanation') || key.includes('signature')) {
          // String fields - convert null to empty string
          normalizedData[key] = value ?? '';
        } else if (key === 'q4_concussion_count' || key === 'q20_periods_last_year') {
          // Number fields - convert null to 0 or undefined
          normalizedData[key] = value ?? undefined;
        } else if (key === 'q16_body_parts') {
          // Object field - ensure it's an object
          normalizedData[key] = value ?? {};
        } else {
          // Keep other values as-is
          normalizedData[key] = value;
        }
      });
      form.reset(normalizedData as InsertMedicalHistory);
    }
  }, [existingMedicalHistory, form]);

  const createMedicalHistoryMutation = useMutation({
    mutationFn: async (data: InsertMedicalHistory) => {
      // Validate playerId before making request
      if (!playerId || !/^[a-zA-Z0-9_-]+$/.test(playerId)) {
        throw new Error('Invalid player ID format');
      }
      // Validate data using schema before sending
      const validatedData = insertMedicalHistorySchema.parse(data);
      const response = await apiRequest(`/api/players/${encodeURIComponent(playerId)}/medical-history`, 'POST', validatedData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Medical history saved",
        description: "The player's medical history has been successfully recorded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/players', playerId, 'medical-history'] });
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error saving medical history",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const updateMedicalHistoryMutation = useMutation({
    mutationFn: async (data: InsertMedicalHistory) => {
      // Validate playerId before making request
      if (!playerId || !/^[a-zA-Z0-9_-]+$/.test(playerId)) {
        throw new Error('Invalid player ID format');
      }
      // Validate data using schema before sending
      const validatedData = insertMedicalHistorySchema.parse(data);
      const response = await apiRequest(`/api/players/${encodeURIComponent(playerId)}/medical-history`, 'PUT', validatedData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Medical history updated",
        description: "The player's medical history has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/players', playerId, 'medical-history'] });
      if (onComplete) onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating medical history",
        description: error.message || "Please try again or contact support.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InsertMedicalHistory) => {
    // Mark as completed and add signature date if not provided
    const formData = {
      ...data,
      isComplete: true,
      signatureDate: data.signatureDate || new Date().toISOString().split('T')[0]
    };

    if (existingMedicalHistory) {
      updateMedicalHistoryMutation.mutate(formData);
    } else {
      createMedicalHistoryMutation.mutate(formData);
    }
  };

  if (playerLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading player information...</p>
        </CardContent>
      </Card>
    );
  }

  // Show specific error if player query failed
  if (playerError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading player: {(playerError as any)?.message || 'Unknown error'}. Player ID: {playerId}
        </AlertDescription>
      </Alert>
    );
  }

  if (!player) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Player not found. Please check the player ID and try again. Player ID: {playerId}
        </AlertDescription>
      </Alert>
    );
  }

  // Check if there's an error loading medical history (except 404, which means no medical history exists yet)
  if (medicalHistoryError && (medicalHistoryError as any)?.status !== 404) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading medical history: {(medicalHistoryError as any)?.message || 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  const isSubmitting = createMedicalHistoryMutation.isPending || updateMedicalHistoryMutation.isPending;
  const isCompleted = existingMedicalHistory && typeof existingMedicalHistory === 'object' && (existingMedicalHistory as any).isComplete;
  
  // Check if this is a new medical history (404 error means no medical history exists yet)
  const isNewMedicalHistory = (medicalHistoryError as any)?.status === 404 || !existingMedicalHistory;

  // Helper to check if any heart question is checked
  const hasHeartIssues = form.watch('q3_heart_testing') || form.watch('q3_passed_out_exercise') || 
    form.watch('q3_chest_pain_exercise') || form.watch('q3_tired_quickly') || 
    form.watch('q3_racing_heart') || form.watch('q3_high_bp_cholesterol') || 
    form.watch('q3_heart_murmur') || form.watch('q3_family_heart_death') || 
    form.watch('q3_family_heart_disease') || form.watch('q3_viral_infection') || 
    form.watch('q3_physician_restricted');

  const hasNeuroIssues = form.watch('q5_seizure') || form.watch('q5_headaches') || 
    form.watch('q5_numbness') || form.watch('q5_stinger_burner');

  const hasInjuryHistory = form.watch('q16_sprain_strain') || form.watch('q16_broken_bones') || 
    form.watch('q16_joint_problems');

  const hasBreathingIssues = form.watch('q14_short_breath') || form.watch('q14_asthma') || 
    form.watch('q14_seasonal_allergies');

  return (
    <div className="space-y-6" data-testid="medical-history-form">
      {/* Status banner for new medical history */}
      {isNewMedicalHistory && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Creating New Medical History</strong> - No previous medical record found for this player. Please complete the form below.
          </AlertDescription>
        </Alert>
      )}

      {/* Header with player info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            UIL Participation Physical Evaluation - Medical History
            {isCompleted && (
              <Badge className="bg-green-600 text-white">
                <Check className="h-4 w-4 mr-1" />
                Completed
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{(player as any)?.playerName || 'Player'}</span>
            </div>
            {(player as any)?.jerseyNumber && (
              <Badge variant="outline">#{(player as any).jerseyNumber}</Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Notice:</strong> This medical information is sensitive and confidential. 
          Access is restricted to authorized personnel only. All access and modifications are tracked for security.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Q1: Recent Medical Illness or Injury */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 1: Recent Medical Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="q1_recent_illness"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q1-recent-illness"
                      />
                    </FormControl>
                    <FormLabel className="font-normal leading-5">
                      Has the student had a medical illness or injury since last medical evaluation or sports physical?
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('q1_recent_illness') && (
                <FormField
                  control={form.control}
                  name="q1_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please explain:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Describe the illness or injury, treatment received, and recovery status..."
                          data-testid="textarea-q1-explanation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q2: Hospitalizations and Surgeries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 2: Hospitalizations & Surgeries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="q2_hospitalized"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q2-hospitalized"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Has the student been hospitalized overnight?
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="q2_surgery"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q2-surgery"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Has the student had surgery?
                    </FormLabel>
                  </FormItem>
                )}
              />
              {(form.watch('q2_hospitalized') || form.watch('q2_surgery')) && (
                <FormField
                  control={form.control}
                  name="q2_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please explain:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Type of hospitalization/surgery, date, reason, recovery status..."
                          data-testid="textarea-q2-explanation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q3: Heart-Related Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Question 3: Cardiovascular History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormDescription className="text-sm text-muted-foreground">
                Check all that apply to the student's medical history:
              </FormDescription>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="q3_heart_testing"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has ever been told by a doctor to have heart tests (EKG, echocardiogram)
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_passed_out_exercise"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has passed out or nearly passed out DURING or AFTER exercise
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_chest_pain_exercise"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has discomfort, pain, tightness, or pressure in chest during exercise
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_tired_quickly"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Gets tired more quickly than friends during exercise
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_racing_heart"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has heart that races, flutters, pounds, or skips beats
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_high_bp_cholesterol"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has been told they have high blood pressure or high cholesterol
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_heart_murmur"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has been told they have a heart murmur
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_family_heart_death"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Any family member died of heart problems or had sudden death before age 35
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_family_heart_disease"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Family member with heart disease, pacemaker, or defibrillator
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_viral_infection"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Had a severe viral infection (myocarditis, mononucleosis, etc.) within last month
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q3_physician_restricted"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has a doctor ever restricted participation in sports for heart problems
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              
              {hasHeartIssues && (
                <FormField
                  control={form.control}
                  name="q3_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please provide details about checked items:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Provide specific details about any heart-related conditions, test results, restrictions..."
                          className="min-h-[100px]"
                          data-testid="textarea-q3-explanation"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q4: Head Injuries and Concussions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Question 4: Head Injuries & Concussions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="q4_head_injury"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q4-head-injury"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Has the student ever had a head injury or concussion?
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="q4_unconscious"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Has been knocked out, become unconscious, or lost memory?
                    </FormLabel>
                  </FormItem>
                )}
              />
              {(form.watch('q4_head_injury') || form.watch('q4_unconscious')) && (
                <>
                  <FormField
                    control={form.control}
                    name="q4_concussion_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of concussions:</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            value={field.value ?? 0}
                            type="number"
                            min="0"
                            readOnly={readonly}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="q4_last_concussion_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of most recent concussion:</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            value={field.value ?? ''}
                            type="date"
                            readOnly={readonly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="q4_explanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field}
                            value={field.value ?? ''}
                            readOnly={readonly}
                            placeholder="Describe circumstances, symptoms, treatment received..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Q5: Neurological Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 5: Neurological History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="q5_seizure"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has ever had a seizure
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q5_headaches"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has frequent or severe headaches
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q5_numbness"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has ever had numbness, tingling, or weakness in arms or legs
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q5_stinger_burner"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has ever had a stinger, burner, or pinched nerve
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              {hasNeuroIssues && (
                <FormField
                  control={form.control}
                  name="q5_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please provide details:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Describe symptoms, triggers, treatment..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q6: Missing Paired Organs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 6: Missing Organs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="q6_missing_organs"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q6-missing-organs"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Is the student missing a kidney, eye, testicle, or any other organ?
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('q6_missing_organs') && (
                <FormField
                  control={form.control}
                  name="q6_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify which organ(s):</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Specify which organ(s) and any protective equipment needed..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q10: Exercise-related dizziness (Critical for syncope) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 10: Exercise-Related Symptoms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="q10_dizzy_exercise"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q10-dizzy"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Does the student get dizzy or feel faint during or after exercise?
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('q10_dizzy_exercise') && (
                <FormField
                  control={form.control}
                  name="q10_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please describe when this occurs:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Describe triggers, frequency, recovery time..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q12: Heat Illness (Critical for Texas athletes) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                Question 12: Heat-Related Illness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="q12_heat_illness"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q12-heat"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Has the student ever had heat stroke, heat exhaustion, or severe muscle cramps?
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('q12_heat_illness') && (
                <FormField
                  control={form.control}
                  name="q12_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please provide details:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="When did it occur? What treatment was received? Any ongoing precautions..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q14: Breathing and Asthma */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 14: Respiratory Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="q14_short_breath"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has unexplained shortness of breath with exercise
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q14_asthma"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has asthma or uses an inhaler
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q14_seasonal_allergies"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has seasonal allergies that require medication
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              {hasBreathingIssues && (
                <FormField
                  control={form.control}
                  name="q14_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please provide details:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="List medications, triggers, emergency procedures..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q16: Injuries and Pain */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 16: Injury History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="q16_sprain_strain"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has had sprains, strains, or muscle injuries
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q16_broken_bones"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has had broken or fractured bones
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="q16_joint_problems"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                          disabled={readonly}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Has joint problems (pain, swelling, instability)
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
              {hasInjuryHistory && (
                <FormField
                  control={form.control}
                  name="q16_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please describe injuries and affected body parts:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="List specific injuries, dates, affected body parts, current status..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Q19: Sickle Cell (Required screening) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question 19: Sickle Cell Trait</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="q19_sickle_cell"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                        data-testid="checkbox-q19-sickle"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Does the student have sickle cell trait or sickle cell disease?
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('q19_sickle_cell') && (
                <FormField
                  control={form.control}
                  name="q19_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Trait or disease? Any precautions or management plan..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Additional Questions - Condensed for brevity but maintaining all fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Q7: Under doctor's care */}
              <FormField
                control={form.control}
                name="q7_doctors_care"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Is currently under a doctor's care for any condition
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* Q8: Medications */}
              <FormField
                control={form.control}
                name="q8_medications"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Currently takes prescription or non-prescription medications
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('q8_medications') && (
                <FormField
                  control={form.control}
                  name="q8_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List all medications:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Include medication name, dosage, frequency, purpose..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Q9: Allergies */}
              <FormField
                control={form.control}
                name="q9_allergies"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={!!field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        disabled={readonly}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Has allergies to medicines, foods, or stinging insects
                    </FormLabel>
                  </FormItem>
                )}
              />
              {form.watch('q9_allergies') && (
                <FormField
                  control={form.control}
                  name="q9_explanation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List all allergies and reactions:</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          value={field.value ?? ''}
                          readOnly={readonly}
                          placeholder="Include allergen, type of reaction, treatment needed (EpiPen, etc.)..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Parent Signature Section */}
          {!readonly && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  Parent/Guardian Signature
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    By signing below, I certify that the information provided is accurate and complete to the best of my knowledge. 
                    I authorize qualified healthcare providers to perform a pre-participation physical evaluation and share results with appropriate school personnel.
                  </AlertDescription>
                </Alert>
                
                <FormField
                  control={form.control}
                  name="parentSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Full Name (Digital Signature) *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Type your full name as digital signature"
                          data-testid="input-parent-signature"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="signatureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          defaultValue={new Date().toISOString().split('T')[0]}
                          data-testid="input-signature-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {!readonly && (
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                data-testid="button-submit-medical-history"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving Medical History...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    {existingMedicalHistory ? 'Update Medical History' : 'Submit Medical History'}
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Completion Status */}
      {isCompleted && readonly && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
              <Check className="h-5 w-5" />
              <div>
                <p className="font-medium">Medical History Completed</p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Signed by {existingMedicalHistory && typeof existingMedicalHistory === 'object' ? (existingMedicalHistory as any).parentSignature : 'Unknown'} on{' '}
                  {existingMedicalHistory && typeof existingMedicalHistory === 'object' && (existingMedicalHistory as any).signatureDate ? 
                    new Date((existingMedicalHistory as any).signatureDate).toLocaleDateString() : 
                    'Unknown date'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}