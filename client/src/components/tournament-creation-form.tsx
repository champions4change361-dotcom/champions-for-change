import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { insertTournamentSchema } from "@shared/schema";
import EventSelectionModal from "@/components/event-selection-modal";

const formSchema = insertTournamentSchema.extend({
  teamSize: z.number().min(4).max(32),
  tournamentType: z.enum(["single", "double", "pool-play", "round-robin", "swiss-system"]).default("single"),
  competitionFormat: z.enum(["bracket", "leaderboard", "series", "bracket-to-series", "multi-stage"]).default("bracket"),
  totalStages: z.number().min(1).max(5).default(1),
  seriesLength: z.number().min(1).max(7).default(7).optional(),
  ageGroup: z.string().optional(),
  genderDivision: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TournamentCreationFormProps {
  onClose?: () => void;
}

export default function TournamentCreationForm({ onClose }: TournamentCreationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);

  const { data: sports = [] } = useQuery<any[]>({
    queryKey: ["/api/sports"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      teamSize: 8,
      tournamentType: "single",
      status: "upcoming",
      bracket: {},
    },
  });

  // Listen for AI recommendation events
  useEffect(() => {
    const handleAIRecommendation = (event: CustomEvent) => {
      const { sport, format, age_group, gender_division, teamSize } = event.detail;
      
      // Apply AI recommendations to form
      if (sport) {
        form.setValue("sport", sport);
      }
      
      if (format) {
        form.setValue("competitionFormat", format);
        
        // Auto-set tournament type based on format
        if (format === "bracket") {
          form.setValue("tournamentType", "single");
        } else if (format === "leaderboard") {
          form.setValue("tournamentType", "round-robin");
        } else if (format === "bracket-to-series") {
          form.setValue("tournamentType", "single");
          form.setValue("competitionFormat", "bracket-to-series");
        }
      }
      
      if (age_group && age_group !== "All Ages") {
        form.setValue("ageGroup", age_group);
      }
      
      if (gender_division && gender_division !== "Mixed") {
        form.setValue("genderDivision", gender_division);
      }
      
      if (teamSize) {
        form.setValue("teamSize", teamSize);
      }
      
      // Auto-generate tournament name
      const sportName = sport || form.getValues("sport") || "Championship";
      const agePart = age_group && age_group !== "All Ages" ? `${age_group} ` : "";
      const genderPart = gender_division && gender_division !== "Mixed" ? `${gender_division} ` : "";
      const autoName = `${agePart}${genderPart}${sportName} Tournament`;
      
      if (!form.getValues("name")) {
        form.setValue("name", autoName);
      }
      
      toast({
        title: "AI Recommendations Applied",
        description: "Tournament form has been pre-filled with AI suggestions",
      });
    };

    // Add event listener
    window.addEventListener('ai-recommendation', handleAIRecommendation as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('ai-recommendation', handleAIRecommendation as EventListener);
    };
  }, [form, toast]);

  const selectedSport = sports.find(sport => sport.sportName === form.watch("sport"));
  const isLeaderboardSport = selectedSport?.competitionType === "leaderboard";
  const isSeriesSport = selectedSport?.competitionType === "series";
  const isBracketToSeriesSport = selectedSport?.competitionType === "bracket-to-series";
  const isBothSport = selectedSport?.competitionType === "both";
  const isTrackAndField = selectedSport?.sportName?.includes("Track & Field");
  const isSwimming = selectedSport?.sportName?.includes("Swimming");
  const isGolf = selectedSport?.sportName?.includes("Golf");
  const isFishingHunting = selectedSport?.sportName?.includes("Fishing") || selectedSport?.sportName?.includes("Hunting") || selectedSport?.sportName?.includes("Angling") || selectedSport?.sportName?.includes("Wildlife");
  const needsEventSelection = isTrackAndField || isSwimming || isGolf || isFishingHunting;
  const selectedTournamentType = form.watch("tournamentType");
  const selectedCompetitionFormat = form.watch("competitionFormat");
  const isMultiStage = ["pool-play", "round-robin", "swiss-system"].includes(selectedTournamentType);
  const showSeriesOptions = selectedCompetitionFormat === "series" || selectedCompetitionFormat === "bracket-to-series" || isSeriesSport || isBracketToSeriesSport;

  // Sport-specific division guidance function
  const getSportDivisionGuidance = (sport: string, ageGroup?: string, genderDivision?: string) => {
    const guidelines: React.ReactNode[] = [];
    
    if (sport.includes("Football") || sport.includes("Basketball") || sport.includes("Wrestling")) {
      guidelines.push(<div key="contact">• Contact sports typically require gender separation and weight/age classes</div>);
      
      if (ageGroup === "High School" || ageGroup === "Middle School") {
        guidelines.push(<div key="school">• School competitions follow state athletic association rules</div>);
      }
    }
    
    if (sport.includes("Track & Field") || sport.includes("Swimming")) {
      guidelines.push(<div key="records">• Separate gender divisions maintain fair competition and record standards</div>);
      
      if (ageGroup === "High School" || ageGroup === "Middle School") {
        guidelines.push(<div key="grades">• Consider JV (9th-10th) vs Varsity (11th-12th) divisions</div>);
      }
    }
    
    if (sport.includes("Golf") || sport.includes("Tennis")) {
      guidelines.push(<div key="skill">• Consider skill-based flights within age/gender divisions</div>);
      
      if (genderDivision === "Mixed" || genderDivision === "Co-Ed") {
        guidelines.push(<div key="mixed">• Mixed divisions work well for recreational tournaments</div>);
      }
    }
    
    if (sport.includes("Esports") || sport.includes("Chess") || sport.includes("Debate")) {
      guidelines.push(<div key="mental">• Mental/skill sports can accommodate mixed gender competition</div>);
    }
    
    if (ageGroup === "Elementary" || ageGroup === "Middle School") {
      guidelines.push(<div key="youth">• Youth divisions prioritize participation and skill development</div>);
    }
    
    if (ageGroup === "Masters" || ageGroup === "Senior") {
      guidelines.push(<div key="masters">• Masters divisions often use 5-year age brackets</div>);
    }
    
    return guidelines.length > 0 ? guidelines : [<div key="default">• Standard tournament divisions apply</div>];
  };

  const createTournamentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/tournaments", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tournament Created",
        description: `${data.tournament.name} has been created successfully!`,
      });
      form.reset();
      // Invalidate both query keys to refresh tournament lists
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tournament-insights"] });
      
      // Close the modal after successful creation
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1500); // Wait 1.5 seconds to show the success message
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tournament",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Set competition format based on tournament type and sport
    let competitionFormat = data.competitionFormat || "bracket";
    if (isLeaderboardSport && !data.competitionFormat) {
      competitionFormat = "leaderboard";
    } else if (isSeriesSport && !data.competitionFormat) {
      competitionFormat = "series";
    } else if (isBracketToSeriesSport && !data.competitionFormat) {
      competitionFormat = "bracket-to-series";
    } else if (isMultiStage) {
      competitionFormat = "multi-stage";
    }
    
    // Generate stage configuration for multi-stage tournaments
    let stageConfiguration = null;
    if (isMultiStage) {
      stageConfiguration = {
        stages: generateStageConfig(selectedTournamentType, data.totalStages || 2),
        overallFormat: getOverallFormat(selectedTournamentType),
      };
    }
    
    const tournamentData = {
      ...data,
      competitionFormat: competitionFormat as any,
      stageConfiguration,
      scoringMethod: selectedSport?.scoringMethod || "wins",
    };
    
    createTournamentMutation.mutate(tournamentData);
  };

  const generateStageConfig = (tournamentType: string, totalStages: number) => {
    switch (tournamentType) {
      case "pool-play":
        return [
          {
            stageNumber: 1,
            stageName: "Pool Play",
            stageType: "round-robin",
            groupCount: Math.ceil(form.watch("teamSize") / 4),
            groupSize: 4,
            advancementRules: {
              teamsAdvancing: 2,
              advancementCriteria: "top-n",
            },
            scoringMethod: "wins",
          },
          {
            stageNumber: 2,
            stageName: "Elimination Bracket",
            stageType: "single-elimination",
            advancementRules: {
              teamsAdvancing: 1,
              advancementCriteria: "top-n",
            },
            scoringMethod: "wins",
          },
        ];
      case "round-robin":
        return [
          {
            stageNumber: 1,
            stageName: "Round Robin",
            stageType: "round-robin",
            advancementRules: {
              teamsAdvancing: form.watch("teamSize"),
              advancementCriteria: "all",
            },
            scoringMethod: "wins",
          },
        ];
      case "swiss-system":
        return [
          {
            stageNumber: 1,
            stageName: "Swiss Rounds",
            stageType: "swiss-system",
            advancementRules: {
              teamsAdvancing: 8,
              advancementCriteria: "top-n",
            },
            scoringMethod: "wins",
          },
          {
            stageNumber: 2,
            stageName: "Top 8 Bracket",
            stageType: "single-elimination",
            advancementRules: {
              teamsAdvancing: 1,
              advancementCriteria: "top-n",
            },
            scoringMethod: "wins",
          },
        ];
      default:
        return [];
    }
  };

  const getOverallFormat = (tournamentType: string) => {
    switch (tournamentType) {
      case "pool-play":
        return "pool-to-bracket";
      case "round-robin":
        return "round-robin-to-leaderboard";
      case "swiss-system":
        return "swiss-to-elimination";
      default:
        return "multi-pool-championship";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" data-testid="card-create-tournament">
      <h2 className="text-lg font-semibold text-neutral mb-4">
        <i className="fas fa-plus-circle text-tournament-primary mr-2"></i>
        Create Tournament
      </h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-create-tournament">
        <div>
          <Label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
            Sport
          </Label>
          <Select onValueChange={(value) => form.setValue("sport", value)} value={form.watch("sport")}>
            <SelectTrigger data-testid="select-sport">
              <SelectValue placeholder="Choose a sport" />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport.id} value={sport.sportName} data-testid={`option-sport-${sport.id}`}>
                  <div className="flex items-center gap-2">
                    {sport.sportName}
                    <Badge variant={sport.competitionType === "leaderboard" ? "outline" : 
                                   sport.competitionType === "series" ? "destructive" :
                                   sport.competitionType === "bracket-to-series" ? "default" :
                                   sport.competitionType === "both" ? "secondary" : "default"}>
                      {sport.competitionType === "leaderboard" ? "Leaderboard" : 
                       sport.competitionType === "series" ? "Series" :
                       sport.competitionType === "bracket-to-series" ? "Bracket + Series" :
                       sport.competitionType === "both" ? "Both" : "Bracket"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSport && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedSport.competitionType === "leaderboard" 
                ? "Individual performance rankings - best times/scores/distances"
                : selectedSport.competitionType === "series"
                ? "Best-of series format (best of 3, 5, or 7 games/matches)"
                : selectedSport.competitionType === "bracket-to-series"
                ? "Playoff brackets leading to championship series (like NBA/MLB/NHL playoffs)"
                : selectedSport.competitionType === "both"
                ? "Supports multiple competition formats - choose below"
                : "Head-to-head elimination tournament brackets"
              }
            </p>
          )}
        </div>

        {/* Competition Format Selection - show for sports that support multiple formats */}
        {(isBothSport || selectedSport) && (
          <div>
            <Label htmlFor="competitionFormat" className="block text-sm font-medium text-gray-700 mb-2">
              Competition Format
            </Label>
            <Select 
              value={form.watch("competitionFormat")} 
              onValueChange={(value) => form.setValue("competitionFormat", value as any)}
              data-testid="select-competition-format"
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose format" />
              </SelectTrigger>
              <SelectContent>
                {(!selectedSport || selectedSport.competitionType === "bracket" || selectedSport.competitionType === "both") && (
                  <SelectItem value="bracket">Bracket Tournament</SelectItem>
                )}
                {(!selectedSport || selectedSport.competitionType === "leaderboard" || selectedSport.competitionType === "both") && (
                  <SelectItem value="leaderboard">Leaderboard Competition</SelectItem>
                )}
                {(!selectedSport || selectedSport.competitionType === "series" || selectedSport.competitionType === "both") && (
                  <SelectItem value="series">Best-of Series</SelectItem>
                )}
                {(!selectedSport || selectedSport.competitionType === "bracket-to-series" || selectedSport.competitionType === "both") && (
                  <SelectItem value="bracket-to-series">Bracket + Championship Series</SelectItem>
                )}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCompetitionFormat === "bracket" && "Elimination tournament with winners advancing"}
              {selectedCompetitionFormat === "leaderboard" && "Individual performance rankings"}
              {selectedCompetitionFormat === "series" && "Teams play multiple games, first to win majority wins"}
              {selectedCompetitionFormat === "bracket-to-series" && "Playoff brackets leading to championship series (2 stages)"}
            </p>
          </div>
        )}

        {/* Series Configuration - show when series format is selected */}
        {showSeriesOptions && (
          <div>
            <Label htmlFor="seriesLength" className="block text-sm font-medium text-gray-700 mb-2">
              Series Length
            </Label>
            <Select 
              value={form.watch("seriesLength")?.toString() || "3"} 
              onValueChange={(value) => form.setValue("seriesLength", parseInt(value))}
              data-testid="select-series-length"
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose series length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Best of 3 (first to 2 wins)</SelectItem>
                <SelectItem value="5">Best of 5 (first to 3 wins)</SelectItem>
                <SelectItem value="7">Best of 7 (first to 4 wins)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCompetitionFormat === "bracket-to-series" 
                ? `Championship series will be best of ${form.watch("seriesLength") || 7}. First to win ${Math.ceil((form.watch("seriesLength") || 7) / 2)} games wins.`
                : `Teams will play up to ${form.watch("seriesLength") || 3} games. First team to win ${Math.ceil((form.watch("seriesLength") || 3) / 2)} games advances.`
              }
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Tournament Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter tournament name"
            {...form.register("name")}
            data-testid="input-tournament-name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-600 mt-1" data-testid="error-tournament-name">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="teamSize" className="block text-sm font-medium text-gray-700 mb-2">
            {isLeaderboardSport ? "Number of Participants" : "Number of Teams"}
          </Label>
          <Select
            value={form.watch("teamSize")?.toString()}
            onValueChange={(value) => form.setValue("teamSize", parseInt(value))}
            data-testid="select-team-size"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number of teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 Teams</SelectItem>
              <SelectItem value="8">8 Teams</SelectItem>
              <SelectItem value="16">16 Teams</SelectItem>
              <SelectItem value="32">32 Teams</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.teamSize && (
            <p className="text-sm text-red-600 mt-1" data-testid="error-team-size">
              {form.formState.errors.teamSize.message}
            </p>
          )}
        </div>

        {/* Age Group Selection */}
        <div>
          <Label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
            Age Group
          </Label>
          <Select
            value={form.watch("ageGroup") || ""}
            onValueChange={(value) => form.setValue("ageGroup", value)}
            data-testid="select-age-group"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Elementary">Elementary (K-5)</SelectItem>
              <SelectItem value="Middle School">Middle School (6-8)</SelectItem>
              <SelectItem value="High School">High School (9-12)</SelectItem>
              <SelectItem value="College">College/University</SelectItem>
              <SelectItem value="Adult">Adult (18+)</SelectItem>
              <SelectItem value="Masters">Masters (35+)</SelectItem>
              <SelectItem value="Senior">Senior (50+)</SelectItem>
              <SelectItem value="All Ages">All Ages/Open</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender Division Selection */}
        <div>
          <Label htmlFor="genderDivision" className="block text-sm font-medium text-gray-700 mb-2">
            Gender Division
          </Label>
          <Select
            value={form.watch("genderDivision") || ""}
            onValueChange={(value) => form.setValue("genderDivision", value)}
            data-testid="select-gender-division"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Men">Men's</SelectItem>
              <SelectItem value="Women">Women's</SelectItem>
              <SelectItem value="Boys">Boys'</SelectItem>
              <SelectItem value="Girls">Girls'</SelectItem>
              <SelectItem value="Mixed">Mixed/Open</SelectItem>
              <SelectItem value="Co-Ed">Co-Ed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Division Guidance */}
        {(form.watch("sport") || form.watch("ageGroup") || form.watch("genderDivision")) && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <i className="fas fa-lightbulb mr-2"></i>
              Division Guidelines
            </h4>
            <div className="text-sm text-yellow-800 space-y-1">
              {getSportDivisionGuidance(
                form.watch("sport") || "",
                form.watch("ageGroup"),
                form.watch("genderDivision")
              )}
            </div>
          </div>
        )}
        
        {!isLeaderboardSport && (
          <div>
            <Label htmlFor="tournamentType" className="block text-sm font-medium text-gray-700 mb-2">
              Tournament Format
            </Label>
            <Select 
              value={form.watch("tournamentType")}
              onValueChange={(value) => form.setValue("tournamentType", value as any)}
            >
              <SelectTrigger data-testid="select-tournament-type">
                <SelectValue placeholder="Select tournament format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single" data-testid="option-single">Single Elimination</SelectItem>
                <SelectItem value="double" data-testid="option-double">Double Elimination</SelectItem>
                <SelectItem value="pool-play" data-testid="option-pool-play">Pool Play → Bracket</SelectItem>
                <SelectItem value="round-robin" data-testid="option-round-robin">Round Robin</SelectItem>
                <SelectItem value="swiss-system" data-testid="option-swiss">Swiss System</SelectItem>
              </SelectContent>
            </Select>
            {isMultiStage && (
              <p className="text-sm text-gray-600 mt-1">
                Multi-stage tournament with preliminary rounds followed by elimination or ranking
              </p>
            )}
          </div>
        )}

        {isMultiStage && (
          <div>
            <Label htmlFor="totalStages" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Stages
            </Label>
            <Select 
              value={form.watch("totalStages")?.toString()}
              onValueChange={(value) => form.setValue("totalStages", parseInt(value))}
            >
              <SelectTrigger data-testid="select-total-stages">
                <SelectValue placeholder="Select number of stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2" data-testid="option-stages-2">2 Stages</SelectItem>
                <SelectItem value="3" data-testid="option-stages-3">3 Stages</SelectItem>
                <SelectItem value="4" data-testid="option-stages-4">4 Stages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {needsEventSelection && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-blue-900">
                {isTrackAndField ? "Track & Field Events" : 
                 isSwimming ? "Swimming & Diving Events" :
                 isGolf ? "Golf Events" :
                 isFishingHunting ? "Fishing & Hunting Events" : "Event Selection"}
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowEventModal(true)}
                data-testid="button-select-events"
              >
                Select Events ({selectedEvents.length})
              </Button>
            </div>
            
            {selectedEvents.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-blue-700 font-medium">Selected Events:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedEvents.slice(0, 6).map((event) => (
                    <Badge key={event.id} variant="secondary" className="text-xs">
                      {event.name}
                    </Badge>
                  ))}
                  {selectedEvents.length > 6 && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedEvents.length - 6} more
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-blue-700 mb-2">
                  Select from {
                    isTrackAndField ? "30+ track and field" : 
                    isSwimming ? "25+ swimming and diving" :
                    isGolf ? "20+ golf tournament and skills" :
                    isFishingHunting ? "20+ fishing and hunting" : "available"
                  } events:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                  {isTrackAndField ? (
                    <>
                      <div>• Sprint, Distance, Hurdles</div>
                      <div>• Jump & Field Events</div>
                      <div>• Throwing Events</div>
                      <div>• Relay & Combined Events</div>
                    </>
                  ) : isSwimming ? (
                    <>
                      <div>• Freestyle, Backstroke</div>
                      <div>• Breaststroke, Butterfly</div>
                      <div>• Individual Medley</div>
                      <div>• Relay & Diving Events</div>
                    </>
                  ) : isGolf ? (
                    <>
                      <div>• Stroke Play, Match Play</div>
                      <div>• Scramble, Best Ball</div>
                      <div>• Skills Competitions</div>
                      <div>• Youth Events</div>
                    </>
                  ) : isFishingHunting ? (
                    <>
                      <div>• Bass, Multi-Species</div>
                      <div>• Archery, Big Game</div>
                      <div>• Skills Competitions</div>
                      <div>• Youth Events</div>
                    </>
                  ) : (
                    <div>• Various event types</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Age Group and Gender Division Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ageGroup" className="block text-sm font-medium text-gray-700 mb-2">
              Age Group
            </Label>
            <Select onValueChange={(value) => form.setValue("ageGroup", value)} data-testid="select-age-group">
              <SelectTrigger>
                <SelectValue placeholder="All Ages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Ages">All Ages</SelectItem>
                <SelectItem value="Elementary">Elementary School</SelectItem>
                <SelectItem value="Middle School">Middle School (6th-8th Grade)</SelectItem>
                <SelectItem value="High School">High School (9th-12th Grade)</SelectItem>
                <SelectItem value="College">College/University</SelectItem>
                <SelectItem value="Adult">Adult (18+)</SelectItem>
                <SelectItem value="Masters">Masters (35+)</SelectItem>
                <SelectItem value="Senior">Senior (50+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="genderDivision" className="block text-sm font-medium text-gray-700 mb-2">
              Gender Division
            </Label>
            <Select onValueChange={(value) => form.setValue("genderDivision", value)} data-testid="select-gender-division">
              <SelectTrigger>
                <SelectValue placeholder="Mixed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mixed">Mixed/Open</SelectItem>
                <SelectItem value="Co-Ed">Co-Ed (Equal Gender Balance)</SelectItem>
                <SelectItem value="Men">Men's</SelectItem>
                <SelectItem value="Women">Women's</SelectItem>
                <SelectItem value="Boys">Boys' (Youth)</SelectItem>
                <SelectItem value="Girls">Girls' (Youth)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sport-Specific Division Guidance */}
        {selectedSport && form.watch("ageGroup") && form.watch("genderDivision") && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Division Guidelines for {selectedSport.sportName}</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {getSportDivisionGuidance(selectedSport.sportName, form.watch("ageGroup"), form.watch("genderDivision"))}
            </div>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-tournament-primary text-white hover:bg-blue-700"
          disabled={createTournamentMutation.isPending}
          data-testid="button-create-tournament"
        >
          {createTournamentMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <i className="fas fa-trophy mr-2"></i>
              {isTrackAndField ? "Create Track & Field Meet" : "Create Tournament"}
            </>
          )}
        </Button>
      </form>

      <EventSelectionModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        sportType={selectedSport?.sportName || ""}
        onEventsSelected={(events) => {
          setSelectedEvents(events);
          toast({
            title: "Events Selected",
            description: `${events.length} events added to your tournament`,
          });
        }}
      />
    </div>
  );
}
