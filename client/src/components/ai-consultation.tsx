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
    "High school boys basketball tournament with 16 teams",
    "College women's swimming meet with timing events", 
    "Esports Valorant tournament bracket style playoffs",
    "Middle school girls track and field championship",
    "Adult men's golf tournament with stroke play scoring",
    "Elementary school cooking competition for 20 kids",
    "University debate tournament double elimination format",
    "Youth soccer league with round robin then playoffs",
    "Masters tennis tournament best-of-three series",
    "Corporate hackathon with team coding challenges"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {examples.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start text-xs h-auto py-2 px-3 hover:bg-blue-50"
                  onClick={() => form.setValue("user_input", example)}
                  data-testid={`example-${index}`}
                >
                  <i className="fas fa-lightbulb mr-2 text-yellow-500"></i>
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
              <Badge 
                variant={recommendation.confidence >= 80 ? "default" : recommendation.confidence >= 60 ? "secondary" : "outline"} 
                className="ml-auto"
              >
                {recommendation.confidence}% confidence
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Generated in real-time • Based on 65+ sports database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">🏆 SPORT</div>
                <Badge variant="default" className="font-medium text-sm px-3 py-1">
                  {recommendation.sport}
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">⚡ FORMAT</div>
                <Badge variant="outline" className="font-medium text-sm px-3 py-1">
                  {recommendation.format}
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">🎂 AGE GROUP</div>
                <Badge variant="secondary" className="font-medium text-sm px-3 py-1">
                  {recommendation.age_group}
                </Badge>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-2">👥 DIVISION</div>
                <Badge variant="destructive" className="font-medium text-sm px-3 py-1">
                  {recommendation.gender_division}
                </Badge>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Detailed Recommendation:
              </Label>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-robot text-blue-600 text-lg mt-1"></i>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {recommendation.recommendation}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
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
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              >
                <i className="fas fa-check mr-2"></i>
                Apply to Form
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(recommendation.recommendation);
                  toast({
                    title: "Copied to Clipboard",
                    description: "AI recommendation copied for sharing",
                  });
                }}
                data-testid="button-copy-recommendation"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <i className="fas fa-copy mr-2"></i>
                Copy
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRecommendation(null)}
                data-testid="button-clear-recommendation"
                className="text-gray-500 hover:text-gray-700"
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