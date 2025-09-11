import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTeamSchema, type InsertTeam, type Team } from "@shared/schema";

// Form validation schema - exclude coachId as it's set server-side
const createTeamSchema = insertTeamSchema.omit({ coachId: true });

type CreateTeamFormData = Omit<InsertTeam, 'coachId'>;

export default function TeamCreatePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      teamName: "",
      organizationName: "",
      coachName: "",
      coachEmail: "",
      coachPhone: "",
      homeVenue: "",
      ageGroup: "",
      division: "",
      teamColor: "",
      status: "active" as const,
      subscriptionStatus: "free" as const,
      subscriptionTier: "basic" as const,
      assistantCoaches: []
    }
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: CreateTeamFormData): Promise<Team> => {
      return apiRequest(`/api/teams`, 'POST', data) as unknown as Promise<Team>;
    },
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Team Created",
        description: `${newTeam.teamName} has been successfully created!`,
      });
      navigate(`/teams/${newTeam.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Team",
        description: error.message || "Failed to create team. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateTeamFormData) => {
    createTeamMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/teams')}
          data-testid="button-back"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Team</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up your team for year-round management and tournament participation
          </p>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name *</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-team-name"
                          placeholder="Lightning Bolts" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        The official name of your team
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="organizationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization/School</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-organization"
                          placeholder="Central High School" 
                          {...field}
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription>
                        School, club, or organization name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Coach Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Coach Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="coachName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Head Coach Name *</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-coach-name"
                            placeholder="John Smith" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coachEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach Email *</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-coach-email"
                            type="email"
                            placeholder="coach@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coachPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coach Phone</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-coach-phone"
                            placeholder="(555) 123-4567" 
                            {...field}
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Team Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Team Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="ageGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Group</FormLabel>
                        <FormControl>
                          <select
                            data-testid="select-age-group"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            value={field.value || ''}
                          >
                            <option value="">Select age group</option>
                            <option value="U8">Under 8 (U8)</option>
                            <option value="U10">Under 10 (U10)</option>
                            <option value="U12">Under 12 (U12)</option>
                            <option value="U14">Under 14 (U14)</option>
                            <option value="U16">Under 16 (U16)</option>
                            <option value="U18">Under 18 (U18)</option>
                            <option value="JV">Junior Varsity</option>
                            <option value="Varsity">Varsity</option>
                            <option value="Adult">Adult</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division</FormLabel>
                        <FormControl>
                          <select
                            data-testid="select-division"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                            value={field.value || ''}
                          >
                            <option value="">Select division</option>
                            <option value="A">Division A</option>
                            <option value="B">Division B</option>
                            <option value="C">Division C</option>
                            <option value="Recreational">Recreational</option>
                            <option value="Competitive">Competitive</option>
                            <option value="Elite">Elite</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="teamColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Color</FormLabel>
                        <FormControl>
                          <Input 
                            data-testid="input-team-color"
                            placeholder="Royal Blue" 
                            {...field}
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Venue Information */}
              <FormField
                control={form.control}
                name="homeVenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Venue</FormLabel>
                    <FormControl>
                      <Input 
                        data-testid="input-home-venue"
                        placeholder="Miller Stadium" 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormDescription>
                      Primary location where your team plays home games
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/teams')}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  data-testid="button-save"
                  className="flex items-center gap-2"
                >
                  {createTeamMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Team
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}