import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const consultationSchema = z.object({
  user_input: z.string().min(10, "Please provide more details about your tournament needs"),
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

interface AIRecommendation {
  success: boolean;
  sport: string;
  format: string;
  age_group: string;
  gender_division: string;
  confidence: number;
  recommendation: string;
}

export default function AIConsultation() {
  const { toast } = useToast();
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      user_input: "",
    },
  });

  const consultationMutation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      const response = await apiRequest("POST", "/api/quick-consult", data);
      return response.json() as Promise<AIRecommendation>;
    },
    onSuccess: (data) => {
      if (data.success) {
        setRecommendation(data);
        toast({
          title: "AI Consultation Complete",
          description: `Found ${data.sport} tournament recommendation with ${data.confidence}% confidence`,
        });
      } else {
        toast({
          title: "Consultation Failed",
          description: "Unable to analyze your tournament request",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error("AI Consultation Error:", error);
      toast({
        title: "AI Service Error",
        description: "Failed to connect to tournament AI consultation service",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    consultationMutation.mutate(data);
  };

  const examples = [
    "I need to organize a high school boys basketball tournament with 16 teams",
    "Swimming meet for college women with timing events",
    "Esports valorant tournament bracket style",
    "Middle school girls track and field meet",
    "Adult men's golf tournament with skill flights",
    "Elementary cooking competition for 20 kids",
    "University debate tournament double elimination"
  ];

  return (
    <div className="space-y-6">
      <Card data-testid="card-ai-consultation">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-brain text-tournament-primary"></i>
            AI Tournament Consultation
          </CardTitle>
          <CardDescription>
            Get intelligent recommendations for your tournament setup based on your specific needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="user_input" className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Tournament Needs
              </Label>
              <Input
                {...form.register("user_input")}
                placeholder="e.g., High school boys basketball with 16 teams..."
                className="w-full"
                data-testid="input-tournament-description"
              />
              {form.formState.errors.user_input && (
                <p className="text-sm text-red-600 mt-1" data-testid="error-user-input">
                  {form.formState.errors.user_input.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-tournament-primary text-white hover:bg-blue-700"
              disabled={consultationMutation.isPending}
              data-testid="button-get-recommendation"
            >
              {consultationMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Get AI Recommendation
                </>
              )}
            </Button>
          </form>

          {/* Example Prompts */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Try These Examples:
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start text-xs h-auto py-2 px-3"
                  onClick={() => form.setValue("user_input", example)}
                  data-testid={`example-${index}`}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendation Display */}
      {recommendation && recommendation.success && (
        <Card data-testid="card-ai-recommendation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-lightbulb text-yellow-500"></i>
              AI Recommendation
              <Badge variant="secondary" className="ml-auto">
                {recommendation.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Sport</div>
                <Badge variant="default" className="font-medium">
                  {recommendation.sport}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Format</div>
                <Badge variant="outline" className="font-medium">
                  {recommendation.format}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Age Group</div>
                <Badge variant="secondary" className="font-medium">
                  {recommendation.age_group}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Division</div>
                <Badge variant="destructive" className="font-medium">
                  {recommendation.gender_division}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Detailed Recommendation:
              </Label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {recommendation.recommendation}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Pre-fill tournament creation form with AI recommendations
                  const event = new CustomEvent('ai-recommendation', { 
                    detail: {
                      sport: recommendation.sport,
                      competitionFormat: recommendation.format,
                      ageGroup: recommendation.age_group,
                      genderDivision: recommendation.gender_division
                    }
                  });
                  window.dispatchEvent(event);
                  toast({
                    title: "Recommendation Applied",
                    description: "Tournament form pre-filled with AI suggestions",
                  });
                }}
                data-testid="button-apply-recommendation"
              >
                <i className="fas fa-check mr-2"></i>
                Apply to Tournament Form
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecommendation(null)}
                data-testid="button-clear-recommendation"
              >
                <i className="fas fa-times mr-2"></i>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}