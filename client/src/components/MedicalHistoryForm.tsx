import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  Clock
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertMedicalHistorySchema, type InsertMedicalHistory, type TeamPlayer } from '@shared/schema';
import { z } from 'zod';

interface MedicalHistoryFormProps {
  playerId: string;
  onComplete?: () => void;
  readonly?: boolean;
}

export function MedicalHistoryForm({ playerId, onComplete, readonly = false }: MedicalHistoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch player data for auto-population
  const { data: player, isLoading: playerLoading } = useQuery<TeamPlayer>({
    queryKey: [`/api/players/${playerId}`],
    enabled: !!playerId,
  });

  // Fetch existing medical history if available
  const { data: existingMedicalHistory, isLoading: medicalHistoryLoading } = useQuery({
    queryKey: [`/api/players/${playerId}/medical-history`],
    enabled: !!playerId,
  });

  const form = useForm<InsertMedicalHistory>({
    resolver: zodResolver(insertMedicalHistorySchema),
    defaultValues: {
      playerId,
      // Auto-populate from player data when it loads
      studentName: player?.playerName || '',
      dateOfBirth: player?.dateOfBirth || '',
      // All 21 medical questions default to false/empty
      hasHeartCondition: false as boolean,
      heartConditionDetails: '',
      hasHighBloodPressure: false,
      bloodPressureDetails: '',
      hasAsthma: false,
      asthmaDetails: '',
      hasDiabetes: false,
      diabetesDetails: '',
      hasSeizureDisorder: false,
      seizureDisorderDetails: '',
      hasHeadInjuries: false,
      headInjuriesDetails: '',
      hasBrokenBones: false,
      brokenBonesDetails: '',
      hasJointProblems: false,
      jointProblemsDetails: '',
      hasSurgeries: false,
      surgeriesDetails: '',
      hasAllergies: false,
      allergiesDetails: '',
      takesMedications: false,
      medicationsDetails: '',
      hasVisionProblems: false,
      visionProblemsDetails: '',
      hasHearingProblems: false,
      hearingProblemsDetails: '',
      hasSkinConditions: false,
      skinConditionsDetails: '',
      hasKidneyProblems: false,
      kidneyProblemsDetails: '',
      hasMentalHealthConditions: false,
      mentalHealthDetails: '',
      hasEatingDisorders: false,
      eatingDisordersDetails: '',
      hasFamilyHistory: false,
      familyHistoryDetails: '',
      additionalConcerns: '',
      parentSignature: '',
      signatureDate: '',
      isCompleted: false,
    },
  });

  // Auto-populate form when player data loads
  React.useEffect(() => {
    if (player) {
      form.setValue('studentName', player.playerName || '');
      form.setValue('dateOfBirth', player.dateOfBirth || '');
    }
  }, [player, form]);

  // Populate form with existing medical history if available
  React.useEffect(() => {
    if (existingMedicalHistory && typeof existingMedicalHistory === 'object') {
      const data = existingMedicalHistory as any;
      Object.keys(data).forEach(key => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt' && data[key] !== undefined) {
          form.setValue(key as keyof InsertMedicalHistory, data[key]);
        }
      });
    }
  }, [existingMedicalHistory, form]);

  const createMedicalHistoryMutation = useMutation({
    mutationFn: async (data: InsertMedicalHistory) => {
      const response = await apiRequest(`/api/players/${playerId}/medical-history`, 'POST', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Medical history saved",
        description: "The player's medical history has been successfully recorded.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${playerId}/medical-history`] });
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
      const response = await apiRequest(`/api/players/${playerId}/medical-history`, 'PUT', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Medical history updated",
        description: "The player's medical history has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/players/${playerId}/medical-history`] });
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
      isCompleted: true,
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

  if (!player) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Player not found. Please check the player ID and try again.
        </AlertDescription>
      </Alert>
    );
  }

  const isSubmitting = createMedicalHistoryMutation.isPending || updateMedicalHistoryMutation.isPending;
  const isCompleted = existingMedicalHistory && typeof existingMedicalHistory === 'object' && (existingMedicalHistory as any).isCompleted;

  return (
    <div className="space-y-6" data-testid="medical-history-form">
      {/* Header with player info */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Heart className="h-6 w-6 text-red-500" />
            Participation Physical Evaluation - Medical History
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
              <span className="font-medium">{player.playerName}</span>
            </div>
            {player.dateOfBirth && (
              <div>DOB: {new Date(player.dateOfBirth).toLocaleDateString()}</div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Privacy Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Privacy Notice:</strong> This medical information is protected under HIPAA and FERPA regulations. 
          Access is restricted to authorized personnel only.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Student Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          readOnly={readonly}
                          className="bg-slate-50 dark:bg-slate-800"
                          data-testid="input-student-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          value={field.value || ''}
                          readOnly={readonly}
                          className="bg-slate-50 dark:bg-slate-800"
                          data-testid="input-date-of-birth"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical History Questions - Organized by Category */}
          
          {/* Cardiovascular & Respiratory */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Cardiovascular & Respiratory History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Heart Condition */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasHeartCondition"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-heart-condition"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever had any heart problems, heart murmur, chest pain, or shortness of breath during exercise?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasHeartCondition') && (
                  <FormField
                    control={form.control}
                    name="heartConditionDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Describe the heart condition, treatment, and any restrictions..."
                            data-testid="textarea-heart-condition-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* High Blood Pressure */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasHighBloodPressure"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-high-blood-pressure"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever been told they have high blood pressure?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasHighBloodPressure') && (
                  <FormField
                    control={form.control}
                    name="bloodPressureDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Include medication, monitoring requirements, etc..."
                            data-testid="textarea-blood-pressure-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Asthma */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasAsthma"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-asthma"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student have asthma or any breathing problems?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasAsthma') && (
                  <FormField
                    control={form.control}
                    name="asthmaDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Include triggers, medications (inhaler type), emergency procedures..."
                            data-testid="textarea-asthma-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chronic Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Chronic Conditions & Medications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Diabetes */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasDiabetes"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-diabetes"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student have diabetes or blood sugar problems?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasDiabetes') && (
                  <FormField
                    control={form.control}
                    name="diabetesDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Type of diabetes, medications, monitoring requirements, emergency procedures..."
                            data-testid="textarea-diabetes-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Seizure Disorder */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasSeizureDisorder"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-seizure-disorder"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever had seizures, epilepsy, or been unconscious?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasSeizureDisorder') && (
                  <FormField
                    control={form.control}
                    name="seizureDisorderDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Type of seizures, triggers, medications, emergency procedures..."
                            data-testid="textarea-seizure-disorder-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Medications */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="takesMedications"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-takes-medications"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student currently take any medications or supplements?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('takesMedications') && (
                  <FormField
                    control={form.control}
                    name="medicationsDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please list all medications and supplements:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Include medication names, dosages, frequency, and purpose..."
                            data-testid="textarea-medications-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Allergies */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasAllergies"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-allergies"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student have any allergies (food, medication, environmental)?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasAllergies') && (
                  <FormField
                    control={form.control}
                    name="allergiesDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please list all allergies and reactions:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Include specific allergens, type of reactions, and emergency procedures..."
                            data-testid="textarea-allergies-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Injuries & Physical History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Injury & Physical History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Head Injuries */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasHeadInjuries"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-head-injuries"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever had a head injury, concussion, or been knocked unconscious?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasHeadInjuries') && (
                  <FormField
                    control={form.control}
                    name="headInjuriesDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Date, cause, treatment received, any lasting effects..."
                            data-testid="textarea-head-injuries-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Broken Bones */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasBrokenBones"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-broken-bones"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever had any broken bones, fractures, or dislocations?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasBrokenBones') && (
                  <FormField
                    control={form.control}
                    name="brokenBonesDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Which bones, when, treatment, any ongoing issues..."
                            data-testid="textarea-broken-bones-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Joint Problems */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasJointProblems"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-joint-problems"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever had joint pain, swelling, or problems with knees, ankles, or other joints?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasJointProblems') && (
                  <FormField
                    control={form.control}
                    name="jointProblemsDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Which joints, symptoms, treatment, activity restrictions..."
                            data-testid="textarea-joint-problems-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Surgeries */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasSurgeries"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-surgeries"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever had any surgeries or hospitalizations?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasSurgeries') && (
                  <FormField
                    control={form.control}
                    name="surgeriesDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Type of surgery/hospitalization, date, recovery, any restrictions..."
                            data-testid="textarea-surgeries-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sensory & Other Conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-purple-500" />
                Other Medical Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vision Problems */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasVisionProblems"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-vision-problems"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student wear glasses, contacts, or have any vision problems?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasVisionProblems') && (
                  <FormField
                    control={form.control}
                    name="visionProblemsDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Type of vision problem, corrective measures, any restrictions for sports..."
                            data-testid="textarea-vision-problems-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Hearing Problems */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasHearingProblems"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-hearing-problems"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student have any hearing problems or use hearing aids?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasHearingProblems') && (
                  <FormField
                    control={form.control}
                    name="hearingProblemsDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Type of hearing loss, hearing aids, communication needs..."
                            data-testid="textarea-hearing-problems-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Additional sections continue in similar pattern... */}
              {/* I'll add the remaining questions to keep the component comprehensive */}

              {/* Skin Conditions */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasSkinConditions"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-skin-conditions"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student have any skin conditions, rashes, or infections?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasSkinConditions') && (
                  <FormField
                    control={form.control}
                    name="skinConditionsDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Type of skin condition, treatments, contagious concerns..."
                            data-testid="textarea-skin-conditions-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Kidney Problems */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasKidneyProblems"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-kidney-problems"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever had kidney or urinary tract problems?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasKidneyProblems') && (
                  <FormField
                    control={form.control}
                    name="kidneyProblemsDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Type of kidney/urinary problem, treatments, current status..."
                            data-testid="textarea-kidney-problems-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Mental Health */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasMentalHealthConditions"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-mental-health"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Does the student have any mental health conditions, anxiety, or depression?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasMentalHealthConditions') && (
                  <FormField
                    control={form.control}
                    name="mentalHealthDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details (optional):</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Support needs, accommodations, emergency contacts..."
                            data-testid="textarea-mental-health-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Eating Disorders */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasEatingDisorders"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-eating-disorders"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Has the student ever been treated for an eating disorder?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasEatingDisorders') && (
                  <FormField
                    control={form.control}
                    name="eatingDisordersDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details (optional):</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Treatment status, monitoring needs, support requirements..."
                            data-testid="textarea-eating-disorders-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Family History */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="hasFamilyHistory"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox 
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={readonly}
                          data-testid="checkbox-family-history"
                        />
                      </FormControl>
                      <FormLabel className="font-normal leading-5">
                        Is there any family history of heart disease, sudden death, or other significant medical conditions?
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {form.watch('hasFamilyHistory') && (
                  <FormField
                    control={form.control}
                    name="familyHistoryDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please provide details:</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            readOnly={readonly}
                            placeholder="Relationship to student, condition, age at diagnosis/death..."
                            data-testid="textarea-family-history-details"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <Separator />

              {/* Additional Concerns */}
              <FormField
                control={form.control}
                name="additionalConcerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional health concerns or information:</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        readOnly={readonly}
                        placeholder="Any other health information, concerns, or special needs that should be known..."
                        className="min-h-[100px]"
                        data-testid="textarea-additional-concerns"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    I authorize school personnel to provide emergency medical care for my child if needed.
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