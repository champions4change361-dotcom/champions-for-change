import { useState } from "react";
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
  competitionFormat: z.enum(["bracket", "leaderboard", "multi-stage"]).default("bracket"),
  totalStages: z.number().min(1).max(5).default(1),
});

type FormData = z.infer<typeof formSchema>;

export default function TournamentCreationForm() {
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

  const selectedSport = sports.find(sport => sport.sportName === form.watch("sport"));
  const isLeaderboardSport = selectedSport?.competitionType === "leaderboard";
  const isTrackAndField = selectedSport?.sportName?.includes("Track & Field");
  const isSwimming = selectedSport?.sportName?.includes("Swimming");
  const needsEventSelection = isTrackAndField || isSwimming;
  const selectedTournamentType = form.watch("tournamentType");
  const isMultiStage = ["pool-play", "round-robin", "swiss-system"].includes(selectedTournamentType);

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
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
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
    let competitionFormat = "bracket";
    if (isLeaderboardSport) {
      competitionFormat = "leaderboard";
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
          <Select onValueChange={(value) => form.setValue("sport", value)}>
            <SelectTrigger data-testid="select-sport">
              <SelectValue placeholder="Choose a sport" />
            </SelectTrigger>
            <SelectContent>
              {sports.map((sport) => (
                <SelectItem key={sport.id} value={sport.sportName} data-testid={`option-sport-${sport.id}`}>
                  <div className="flex items-center gap-2">
                    {sport.sportName}
                    <Badge variant={sport.competitionType === "leaderboard" ? "outline" : "secondary"}>
                      {sport.competitionType === "leaderboard" ? "Leaderboard" : "Bracket"}
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
                : "Head-to-head elimination tournament brackets"
              }
            </p>
          )}
        </div>

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
        
        {!isLeaderboardSport && (
          <div>
            <Label htmlFor="tournamentType" className="block text-sm font-medium text-gray-700 mb-2">
              Tournament Format
            </Label>
            <Select onValueChange={(value) => form.setValue("tournamentType", value as any)}>
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
            <Select onValueChange={(value) => form.setValue("totalStages", parseInt(value))}>
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
                {isTrackAndField ? "Track & Field Events" : "Swimming Events"}
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
                  Select from {isTrackAndField ? "30+ track and field" : "25+ swimming and diving"} events:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-600">
                  {isTrackAndField ? (
                    <>
                      <div>• Sprint, Distance, Hurdles</div>
                      <div>• Jump & Field Events</div>
                      <div>• Throwing Events</div>
                      <div>• Relay & Combined Events</div>
                    </>
                  ) : (
                    <>
                      <div>• Freestyle, Backstroke</div>
                      <div>• Breaststroke, Butterfly</div>
                      <div>• Individual Medley</div>
                      <div>• Relay & Diving Events</div>
                    </>
                  )}
                </div>
              </div>
            )}
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
