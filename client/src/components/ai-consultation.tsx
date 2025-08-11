import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isBuildingTournament, setIsBuildingTournament] = useState(false);

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

  const aiBuildTournamentMutation = useMutation({
    mutationFn: async (userInput: string) => {
      const response = await apiRequest("POST", "/api/ai-build-tournament", { user_input: userInput });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Tournament Created!",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
        form.reset();
        setRecommendation(null);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create tournament",
          variant: "destructive",
        });
      }
      setIsBuildingTournament(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
      setIsBuildingTournament(false);
    },
  });

  const aiBuildTournament = () => {
    if (!recommendation) return;
    
    setIsBuildingTournament(true);
    const originalQuery = form.getValues("user_input");
    aiBuildTournamentMutation.mutate(originalQuery);
  };

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

            {/* Action Options */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                🚀 How would you like to proceed?
              </h4>
              
              <div className="space-y-3">
                {/* Option 1: AI Builds Complete Tournament */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-purple-900 mb-1">
                        🤖 AI Builds Complete Tournament
                      </h5>
                      <p className="text-sm text-purple-700">
                        Let AI create the full tournament with sample participants, brackets/leaderboards, and ready-to-use structure.
                      </p>
                      <div className="text-xs text-purple-600 mt-1">
                        ✅ Instant setup • ✅ Sample data • ✅ Ready to start
                      </div>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => aiBuildTournament()}
                      disabled={isBuildingTournament}
                      data-testid="button-ai-build-tournament"
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isBuildingTournament ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Building...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic mr-2"></i>
                          Build It!
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Option 2: Apply to Form for Manual Configuration */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-green-900 mb-1">
                        ⚙️ Configure Tournament Manually
                      </h5>
                      <p className="text-sm text-green-700">
                        Pre-fill the form with AI recommendations, then customize settings and add your own participants.
                      </p>
                      <div className="text-xs text-green-600 mt-1">
                        ✅ Full control • ✅ Custom settings • ✅ Your participants
                      </div>
                    </div>
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 pt-2 border-t">
                <div className="text-xs text-gray-500">
                  💡 Choose based on your preference for speed vs. customization
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRecommendation(null)}
                  data-testid="button-clear-recommendation"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times mr-1"></i>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}