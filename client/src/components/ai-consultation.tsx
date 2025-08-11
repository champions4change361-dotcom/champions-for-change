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

interface KeystoneRecommendation {
  success: boolean;
  tier: 'consultation' | 'generation' | 'full-service';
  sport: string;
  format: string;
  age_group: string;
  gender_division: string;
  confidence: number;
  recommendation: string;
  estimated_participants: number;
  tier1_consultation?: {
    strategic_suggestions: string[];
    venue_suggestions: string[];
    schedule_template: any;
    champions_for_change_integration: {
      fundraising_opportunities: string[];
      educational_tie_ins: string[];
    };
  };
  tier2_generation?: {
    auto_bracket: any;
    participant_assignments: string[];
    score_tracking_setup: any;
  };
  tier2_preview?: {
    feature_available: boolean;
    upgrade_message: string;
    sample_structure: string;
  };
  tier3_full_service?: {
    custom_webpage: {
      template_code: string;
      domain_suggestions: string[];
      seo_optimization: any;
    };
    complete_tournament_setup: boolean;
    dedicated_support: string;
    custom_branding: any;
  };
  tier3_preview?: {
    feature_available: boolean;
    upgrade_message: string;
    sample_features: string[];
  };
}

export default function AIConsultation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [recommendation, setRecommendation] = useState<KeystoneRecommendation | null>(null);
  const [isBuildingTournament, setIsBuildingTournament] = useState(false);
  const [selectedTier, setSelectedTier] = useState<'consultation' | 'generation' | 'full-service'>('consultation');

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      user_input: "",
    },
  });

  const keystoneConsultationMutation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      const payload = {
        ...data,
        tier: selectedTier,
        subscription_level: 'free' // This would come from user context in real implementation
      };
      const response = await apiRequest("POST", "/api/keystone-consult", payload);
      return response.json() as Promise<KeystoneRecommendation>;
    },
    onSuccess: (data) => {
      if (data.success) {
        setRecommendation(data);
        toast({
          title: "Keystone Consultation Complete",
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
      console.error("Keystone Consultation Error:", error);
      toast({
        title: "Keystone Service Error",
        description: "Failed to connect to Keystone AI consultation service",
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
    keystoneConsultationMutation.mutate(data);
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
            Keystone AI Consultation
          </CardTitle>
          <CardDescription>
            Three-tier AI consultation system: Ideas & suggestions → Auto-generation → Full service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Keystone Tier Selection */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Your Keystone Service Level
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                type="button"
                variant={selectedTier === 'consultation' ? 'default' : 'outline'}
                className={`h-auto p-4 text-left ${selectedTier === 'consultation' ? 'bg-tournament-primary text-white' : ''}`}
                onClick={() => setSelectedTier('consultation')}
                data-testid="tier-consultation"
              >
                <div>
                  <div className="font-semibold">Tier 1: Consultation</div>
                  <div className="text-xs opacity-90">Ideas & strategic advice</div>
                  <div className="text-xs font-medium mt-1">FREE</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={selectedTier === 'generation' ? 'default' : 'outline'}
                className={`h-auto p-4 text-left ${selectedTier === 'generation' ? 'bg-tournament-primary text-white' : ''}`}
                onClick={() => setSelectedTier('generation')}
                data-testid="tier-generation"
              >
                <div>
                  <div className="font-semibold">Tier 2: Auto-Generation</div>
                  <div className="text-xs opacity-90">Auto-create brackets</div>
                  <div className="text-xs font-medium mt-1">BASIC+</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={selectedTier === 'full-service' ? 'default' : 'outline'}
                className={`h-auto p-4 text-left ${selectedTier === 'full-service' ? 'bg-tournament-primary text-white' : ''}`}
                onClick={() => setSelectedTier('full-service')}
                data-testid="tier-full-service"
              >
                <div>
                  <div className="font-semibold">Tier 3: Full Service</div>
                  <div className="text-xs opacity-90">Complete + custom webpage</div>
                  <div className="text-xs font-medium mt-1">PRO+</div>
                </div>
              </Button>
            </div>
          </div>

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
              disabled={keystoneConsultationMutation.isPending}
              data-testid="button-get-recommendation"
            >
              {keystoneConsultationMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-2"></i>
                  Get Keystone Recommendation
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

      {/* Keystone Recommendation Display */}
      {recommendation && recommendation.success && (
        <Card data-testid="card-keystone-recommendation">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-lightbulb text-yellow-500"></i>
              Keystone AI Recommendation
              <Badge 
                variant={recommendation.confidence >= 80 ? "default" : recommendation.confidence >= 60 ? "secondary" : "outline"} 
                className="ml-auto"
              >
                {recommendation.confidence}% confidence
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Generated in real-time • Based on 65+ sports database • Champions for Change integration
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

            {/* Tier-Specific Content Display */}
            {recommendation.tier1_consultation && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-lightbulb text-yellow-500"></i>
                  Tier 1: Strategic Consultation & Ideas
                </h4>
                
                <div className="space-y-4">
                  {/* Strategic Suggestions */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-900 mb-2">Tournament Strategy Suggestions</h5>
                    <ul className="space-y-1">
                      {recommendation.tier1_consultation.strategic_suggestions?.map((suggestion, index) => (
                        <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                          <i className="fas fa-check text-green-600 mt-1"></i>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Venue Suggestions */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Recommended Venues</h5>
                    <ul className="space-y-1">
                      {recommendation.tier1_consultation.venue_suggestions?.map((venue, index) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <i className="fas fa-map-marker-alt text-blue-600 mt-1"></i>
                          {venue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Champions for Change Integration */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-tournament-primary">
                    <h5 className="font-medium text-tournament-primary mb-2 flex items-center gap-2">
                      <i className="fas fa-graduation-cap"></i>
                      Champions for Change Mission Integration
                    </h5>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-1">Fundraising Opportunities</h6>
                        <ul className="space-y-1">
                          {recommendation.tier1_consultation.champions_for_change_integration?.fundraising_opportunities.map((opportunity, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                              <i className="fas fa-dollar-sign text-green-500 mt-0.5"></i>
                              {opportunity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h6 className="text-sm font-medium text-gray-700 mb-1">Educational Tie-ins</h6>
                        <ul className="space-y-1">
                          {recommendation.tier1_consultation.champions_for_change_integration?.educational_tie_ins.map((tieIn, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                              <i className="fas fa-book text-blue-500 mt-0.5"></i>
                              {tieIn}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tier 2 Preview/Content */}
            {recommendation.tier2_preview && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-cogs text-orange-500"></i>
                  Tier 2: Auto-Generation
                </h4>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-orange-900 mb-1">
                        {recommendation.tier2_preview.upgrade_message}
                      </h5>
                      <p className="text-sm text-orange-700">
                        Preview: {recommendation.tier2_preview.sample_structure}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="border-orange-300">
                      Upgrade to Basic
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tier 3 Preview/Content */}
            {recommendation.tier3_preview && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <i className="fas fa-crown text-purple-500"></i>
                  Tier 3: Full Service
                </h4>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-purple-900 mb-1">
                        {recommendation.tier3_preview.upgrade_message}
                      </h5>
                      <div className="text-sm text-purple-700">
                        Features include:
                        <ul className="mt-1 space-y-1">
                          {recommendation.tier3_preview.sample_features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <i className="fas fa-star text-purple-500"></i>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-purple-300">
                      Upgrade to Pro
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Options */}
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Next Steps
              </h4>
              
              <div className="space-y-3">
                {/* Option 1: AI Builds Complete Tournament */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-purple-900 mb-1">
                        AI Builds Complete Tournament
                      </h5>
                      <p className="text-sm text-purple-700">
                        Let AI create the full tournament with sample participants, brackets/leaderboards, and ready-to-use structure.
                      </p>
                      <div className="text-xs text-purple-600 mt-1">
                        Instant setup • Sample data • Ready to start
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
                        Configure Tournament Manually
                      </h5>
                      <p className="text-sm text-green-700">
                        Pre-fill the form with AI recommendations, then customize settings and add your own participants.
                      </p>
                      <div className="text-xs text-green-600 mt-1">
                        Full control • Custom settings • Your participants
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Pre-fill tournament creation form with AI recommendations
                        const event = new CustomEvent('ai-recommendation', { 
                          detail: {
                            sport: recommendation.sport,
                            format: recommendation.format,
                            age_group: recommendation.age_group,
                            gender_division: recommendation.gender_division,
                            teamSize: recommendation.estimated_participants || 16
                          }
                        });
                        window.dispatchEvent(event);
                        
                        // Also trigger opening the tournament creation form
                        const openFormEvent = new CustomEvent('open-tournament-form');
                        window.dispatchEvent(openFormEvent);
                        
                        toast({
                          title: "Form Pre-filled",
                          description: "Tournament creation form has been populated with AI recommendations",
                        });
                      }}
                      data-testid="button-apply-to-form"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Apply to Form
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}