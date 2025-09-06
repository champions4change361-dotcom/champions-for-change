import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Trophy, Users, Calendar, Crown, Target, DollarSign, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { InsertShowdownContest } from "@shared/schema";

// Mock NFL games data - in production this would come from ESPN/Yahoo API
const upcomingGames = [
  {
    id: "game-1",
    team1: "KC",
    team2: "LAC",
    gameTime: "2025-01-12T21:25:00Z",
    description: "KC @ LAC",
    week: "Wild Card"
  },
  {
    id: "game-2", 
    team1: "BAL",
    team2: "PIT",
    gameTime: "2025-01-11T20:15:00Z",
    description: "BAL @ PIT",
    week: "Wild Card"
  },
  {
    id: "game-3",
    team1: "BUF",
    team2: "DEN",
    gameTime: "2025-01-12T18:00:00Z",
    description: "BUF @ DEN", 
    week: "Wild Card"
  },
  {
    id: "game-4",
    team1: "PHI",
    team2: "GB",
    gameTime: "2025-01-12T16:30:00Z",
    description: "PHI @ GB",
    week: "Wild Card"
  }
];

export default function CaptainShowdownCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [contestName, setContestName] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [maxEntries, setMaxEntries] = useState(20);
  const [prizeDescription, setPrizeDescription] = useState("Bragging Rights");
  const [captainMultiplier, setCaptainMultiplier] = useState(1.5);
  const [salaryCapEnabled, setSalaryCapEnabled] = useState(false);
  const [salaryCap, setSalaryCap] = useState(50000);

  // Create showdown contest mutation
  const createContestMutation = useMutation({
    mutationFn: async (contestData: InsertShowdownContest) => {
      return await apiRequest("/api/fantasy/showdown-contests", {
        method: "POST",
        body: JSON.stringify(contestData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Showdown Contest Created!",
        description: `${contestName} is ready for entries`,
      });
      
      // Redirect to the contest page or back to fantasy dashboard
      setLocation(`/fantasy/showdown/${data.contest.id}`);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/fantasy/showdown-contests"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Contest",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contestName.trim()) {
      toast({
        title: "Contest Name Required",
        description: "Please enter a name for your showdown contest",
        variant: "destructive",
      });
      return;
    }

    if (!selectedGame) {
      toast({
        title: "Game Selection Required", 
        description: "Please select a game for your showdown contest",
        variant: "destructive",
      });
      return;
    }

    const game = upcomingGames.find(g => g.id === selectedGame);
    if (!game) return;

    // Calculate lineup lock time (30 minutes before game)
    const gameTime = new Date(game.gameTime);
    const lineupLockTime = new Date(gameTime.getTime() - 30 * 60 * 1000);

    const contestData: InsertShowdownContest = {
      contestName: contestName.trim(),
      commissionerId: "temp-user-id", // This would come from auth context
      sport: "nfl",
      gameDate: gameTime,
      team1: game.team1,
      team2: game.team2,
      gameDescription: game.description,
      maxEntries,
      entryFee: 0, // Free contests only for non-gambling
      prizePool: prizeDescription,
      captainMultiplier: captainMultiplier.toString(),
      flexPositions: 5,
      totalLineupSize: 6,
      salaryCapEnabled,
      salaryCap: salaryCapEnabled ? salaryCap : null,
      lineupLockTime,
      contestStartTime: gameTime,
      contestEndTime: new Date(gameTime.getTime() + 4 * 60 * 60 * 1000), // 4 hours after start
      availablePlayers: [], // Would be populated from game roster API
    };

    createContestMutation.mutate(contestData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="h-8 w-8 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Create Captain Showdown
            </h1>
            <Target className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Single-game contests with 1 Captain + 5 FLEX players
          </p>
          <Badge variant="outline" className="mt-2">
            <Trophy className="h-3 w-3 mr-1" />
            DraftKings-Style Format
          </Badge>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Contest Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span>Contest Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contest Name */}
                  <div className="space-y-2">
                    <Label htmlFor="contestName">Contest Name</Label>
                    <Input
                      id="contestName"
                      placeholder="e.g., Sunday Night Showdown"
                      value={contestName}
                      onChange={(e) => setContestName(e.target.value)}
                      data-testid="contest-name-input"
                    />
                  </div>

                  {/* Game Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="gameSelect">Select Game</Label>
                    <Select value={selectedGame} onValueChange={setSelectedGame}>
                      <SelectTrigger data-testid="game-select">
                        <SelectValue placeholder="Choose a game for your contest" />
                      </SelectTrigger>
                      <SelectContent>
                        {upcomingGames.map((game) => (
                          <SelectItem key={game.id} value={game.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{game.description}</span>
                              <div className="text-sm text-muted-foreground ml-4">
                                {new Date(game.gameTime).toLocaleDateString()} {new Date(game.gameTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Entries */}
                  <div className="space-y-2">
                    <Label htmlFor="maxEntries">Max Entries</Label>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="maxEntries"
                        type="number"
                        min="2"
                        max="100"
                        value={maxEntries}
                        onChange={(e) => setMaxEntries(parseInt(e.target.value) || 20)}
                        data-testid="max-entries-input"
                      />
                    </div>
                  </div>

                  {/* Prize Description */}
                  <div className="space-y-2">
                    <Label htmlFor="prizeDescription">Prize Pool</Label>
                    <Input
                      id="prizeDescription"
                      placeholder="e.g., Champion Title, Bragging Rights"
                      value={prizeDescription}
                      onChange={(e) => setPrizeDescription(e.target.value)}
                      data-testid="prize-description-input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Non-monetary prizes only (no gambling)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Captain Mode Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5" />
                    <span>Captain Mode Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Captain Multiplier */}
                  <div className="space-y-2">
                    <Label htmlFor="captainMultiplier">Captain Point Multiplier</Label>
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <Input
                        id="captainMultiplier"
                        type="number"
                        step="0.1"
                        min="1"
                        max="3"
                        value={captainMultiplier}
                        onChange={(e) => setCaptainMultiplier(parseFloat(e.target.value) || 1.5)}
                        data-testid="captain-multiplier-input"
                      />
                      <span className="text-sm text-muted-foreground">x points</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Typically 1.5x (standard DraftKings format)
                    </p>
                  </div>

                  {/* Salary Cap Toggle */}
                  <div className="space-y-3">
                    <div className="flex items-center space-between">
                      <Label htmlFor="salaryCapEnabled">Enable Salary Cap</Label>
                      <Switch
                        id="salaryCapEnabled"
                        checked={salaryCapEnabled}
                        onCheckedChange={setSalaryCapEnabled}
                        data-testid="salary-cap-toggle"
                      />
                    </div>
                    
                    {salaryCapEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="salaryCap">Salary Cap</Label>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="salaryCap"
                            type="number"
                            step="1000"
                            min="30000"
                            max="100000"
                            value={salaryCap}
                            onChange={(e) => setSalaryCap(parseInt(e.target.value) || 50000)}
                            data-testid="salary-cap-input"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total salary budget for lineup
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contest Format Info */}
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                      Captain Mode Format:
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• 1 Captain (gets {captainMultiplier}x points)</li>
                      <li>• 5 FLEX players (any position)</li>
                      <li>• All players from selected game only</li>
                      <li>• Lineups lock 30 min before kickoff</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Game Info Preview */}
            {selectedGame && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Contest Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const game = upcomingGames.find(g => g.id === selectedGame);
                    if (!game) return null;
                    
                    const gameTime = new Date(game.gameTime);
                    const lineupLockTime = new Date(gameTime.getTime() - 30 * 60 * 1000);
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium">{game.description}</p>
                            <p className="text-sm text-muted-foreground">{game.week} Round</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">Lineups Lock</p>
                            <p className="text-sm text-muted-foreground">
                              {lineupLockTime.toLocaleDateString()} {lineupLockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="font-medium">Max {maxEntries} Entries</p>
                            <p className="text-sm text-muted-foreground">Free to enter</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Submit Buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/fantasy-tournaments")}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={createContestMutation.isPending || !contestName.trim() || !selectedGame}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                data-testid="create-contest-button"
              >
                {createContestMutation.isPending ? (
                  <>Creating Contest...</>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Create Showdown Contest
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}