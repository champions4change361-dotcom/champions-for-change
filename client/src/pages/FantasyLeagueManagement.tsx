import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Users, Calendar, Settings, Plus, Crown, Star, Target } from "lucide-react";

// TypeScript interfaces for fantasy league data
interface FantasyLeague {
  id: string;
  leagueName: string;
  leagueDescription?: string;
  sport: "nfl" | "nba" | "mlb" | "nhl";
  season: string;
  teamCount: number;
  maxTeams: number;
  scoringType: "standard" | "ppr" | "half_ppr" | "superflex" | "custom";
  draftType: "snake" | "linear" | "auction";
  status: "creating" | "open" | "drafting" | "active" | "playoffs" | "completed" | "archived";
  commissionerId: string;
  isPrivate: boolean;
  inviteCode?: string;
  password?: string;
  rosterSettings: {
    qb: number;
    rb: number;
    wr: number;
    te: number;
    flex: number;
    def: number;
    k: number;
    bench: number;
    ir: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface FantasyTeam {
  id: string;
  teamName: string;
  teamAbbreviation: string;
  ownerId: string;
  leagueId: string;
}

interface FantasyStanding {
  team: FantasyTeam;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  rank: number;
}

const createLeagueSchema = z.object({
  leagueName: z.string().min(3, "League name must be at least 3 characters"),
  leagueDescription: z.string().optional(),
  sport: z.enum(["nfl", "nba", "mlb", "nhl"]),
  maxTeams: z.number().min(4).max(32),
  scoringType: z.enum(["standard", "ppr", "half_ppr", "superflex", "custom"]),
  draftType: z.enum(["snake", "linear", "auction"]),
  isPrivate: z.boolean(),
  password: z.string().optional(),
});

type CreateLeagueForm = z.infer<typeof createLeagueSchema>;

export default function FantasyLeagueManagement() {
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's fantasy leagues
  const { data: leagues = [], isLoading: leaguesLoading } = useQuery<FantasyLeague[]>({
    queryKey: ["/api/fantasy/leagues"],
  });

  // Get selected league details
  const { data: leagueDetails } = useQuery<FantasyLeague>({
    queryKey: ["/api/fantasy/leagues", selectedLeague],
    enabled: !!selectedLeague,
  });

  // Get user's team in selected league
  const { data: userTeam } = useQuery<FantasyTeam>({
    queryKey: ["/api/fantasy/leagues", selectedLeague, "my-team"],
    enabled: !!selectedLeague,
  });

  // Get league standings
  const { data: standings = [] } = useQuery<FantasyStanding[]>({
    queryKey: ["/api/fantasy/leagues", selectedLeague, "standings"],
    enabled: !!selectedLeague,
  });

  // Create league mutation
  const createLeague = useMutation({
    mutationFn: (data: CreateLeagueForm) => apiRequest("/api/fantasy/leagues", "POST", data),
    onSuccess: () => {
      toast({ title: "League created successfully!" });
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/fantasy/leagues"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create league", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Join league mutation
  const joinLeague = useMutation({
    mutationFn: ({ leagueId, teamName, inviteCode }: { leagueId: string; teamName: string; inviteCode?: string }) => 
      apiRequest(`/api/fantasy/leagues/${leagueId}/join`, "POST", { teamName, inviteCode }),
    onSuccess: () => {
      toast({ title: "Successfully joined league!" });
      queryClient.invalidateQueries({ queryKey: ["/api/fantasy/leagues"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to join league", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const form = useForm<CreateLeagueForm>({
    resolver: zodResolver(createLeagueSchema),
    defaultValues: {
      sport: "nfl",
      maxTeams: 10,
      scoringType: "ppr",
      draftType: "snake",
      isPrivate: false,
    },
  });

  const onSubmit = (data: CreateLeagueForm) => {
    createLeague.mutate(data);
  };

  const getSportIcon = (sport: string) => {
    const icons = {
      nfl: "🏈",
      nba: "🏀", 
      mlb: "⚾",
      nhl: "🏒"
    };
    return icons[sport as keyof typeof icons] || "🏆";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      creating: "bg-yellow-500",
      open: "bg-green-500",
      drafting: "bg-blue-500", 
      active: "bg-purple-500",
      playoffs: "bg-orange-500",
      completed: "bg-gray-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  if (leaguesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading your fantasy leagues...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="page-fantasy-league-management">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Fantasy League Management
          </h1>
          <p className="text-muted-foreground">Create and manage your fantasy sports leagues</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" data-testid="button-create-league">
              <Plus className="w-4 h-4" />
              Create League
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Fantasy League</DialogTitle>
              <DialogDescription>
                Set up your fantasy league with custom rules and settings
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="leagueName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>League Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Awesome League" {...field} data-testid="input-league-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="sport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sport</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-sport">
                              <SelectValue placeholder="Select sport" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="nfl">🏈 NFL Football</SelectItem>
                            <SelectItem value="nba">🏀 NBA Basketball</SelectItem>
                            <SelectItem value="mlb">⚾ MLB Baseball</SelectItem>
                            <SelectItem value="nhl">🏒 NHL Hockey</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="leagueDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell people about your league..." {...field} data-testid="input-league-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="maxTeams"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Teams</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={4} 
                            max={32} 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            data-testid="input-max-teams"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scoringType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scoring</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-scoring">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="ppr">PPR</SelectItem>
                            <SelectItem value="half_ppr">Half PPR</SelectItem>
                            <SelectItem value="superflex">Superflex</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="draftType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Draft Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-draft-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="snake">Snake Draft</SelectItem>
                            <SelectItem value="linear">Linear Draft</SelectItem>
                            <SelectItem value="auction">Auction Draft</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Private League</FormLabel>
                          <FormDescription>
                            Require an invite code to join this league
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="switch-private-league"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  {form.watch("isPrivate") && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>League Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter league password" {...field} data-testid="input-league-password" />
                          </FormControl>
                          <FormDescription>
                            Optional password for additional security
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createLeague.isPending}
                    data-testid="button-submit-create"
                  >
                    {createLeague.isPending ? "Creating..." : "Create League"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* League List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Your Leagues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leagues.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No leagues yet!</p>
                  <p className="text-sm">Create your first fantasy league</p>
                </div>
              ) : (
                leagues.map((league) => (
                  <Card 
                    key={league.id} 
                    className={`cursor-pointer transition-colors ${selectedLeague === league.id ? 'bg-muted' : ''}`}
                    onClick={() => setSelectedLeague(league.id)}
                    data-testid={`card-league-${league.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getSportIcon(league.sport)}</div>
                          <div>
                            <h3 className="font-medium" data-testid={`text-league-name-${league.id}`}>
                              {league.leagueName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {league.sport.toUpperCase()} • {league.teamCount}/{league.maxTeams} teams
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {league.commissionerId && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                          <Badge 
                            className={`${getStatusColor(league.status)} text-white`}
                            data-testid={`badge-status-${league.id}`}
                          >
                            {league.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* League Details */}
        <div className="lg:col-span-2">
          {selectedLeague && leagueDetails ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="standings" data-testid="tab-standings">Standings</TabsTrigger>
                <TabsTrigger value="team" data-testid="tab-team">My Team</TabsTrigger>
                <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" data-testid="text-league-details-title">
                      {getSportIcon(leagueDetails.sport)} {leagueDetails.leagueName}
                    </CardTitle>
                    <CardDescription>{leagueDetails.leagueDescription || "No description provided"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold" data-testid="text-team-count">{leagueDetails.teamCount}</div>
                        <div className="text-sm text-muted-foreground">Teams</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{leagueDetails.scoringType.toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">Scoring</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{leagueDetails.draftType}</div>
                        <div className="text-sm text-muted-foreground">Draft</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{leagueDetails.season}</div>
                        <div className="text-sm text-muted-foreground">Season</div>
                      </div>
                    </div>
                    
                    {leagueDetails.inviteCode && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <Label className="text-sm font-medium">Invite Code:</Label>
                        <div className="font-mono text-lg" data-testid="text-invite-code">{leagueDetails.inviteCode}</div>
                        <p className="text-sm text-muted-foreground">Share this code with friends to join your league</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="standings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      League Standings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {standings.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No standings available yet</p>
                        <p className="text-sm">Standings will appear once games are played</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {standings.map((standing, index: number) => (
                          <div 
                            key={standing.team.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-muted"
                            data-testid={`row-standing-${standing.team.id}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium" data-testid={`text-team-name-${standing.team.id}`}>
                                  {standing.team.teamName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {standing.wins}-{standing.losses}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium" data-testid={`text-points-for-${standing.team.id}`}>
                                {standing.pointsFor.toFixed(1)}
                              </div>
                              <div className="text-sm text-muted-foreground">Points For</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      My Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userTeam ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-medium" data-testid="text-user-team-name">{userTeam.teamName}</h3>
                          <p className="text-sm text-muted-foreground">{userTeam.teamAbbreviation}</p>
                        </div>
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Team roster and lineup management</p>
                          <p className="text-sm">Full roster functionality coming soon!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>You don't have a team in this league</p>
                        <Button 
                          className="mt-4"
                          onClick={() => {
                            const teamName = prompt("Enter your team name:");
                            if (teamName) {
                              joinLeague.mutate({ 
                                leagueId: selectedLeague, 
                                teamName 
                              });
                            }
                          }}
                          data-testid="button-join-league"
                        >
                          Join League
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      League Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Sport</Label>
                          <div className="text-lg">{leagueDetails.sport.toUpperCase()}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Scoring Type</Label>
                          <div className="text-lg">{leagueDetails.scoringType.toUpperCase()}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Draft Type</Label>
                          <div className="text-lg">{leagueDetails.draftType}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Max Teams</Label>
                          <div className="text-lg">{leagueDetails.maxTeams}</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Roster Settings</Label>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          {leagueDetails.rosterSettings && Object.entries(leagueDetails.rosterSettings).map(([position, count]) => (
                            <div key={position} className="flex justify-between p-2 bg-muted rounded">
                              <span className="uppercase">{position}:</span>
                              <span>{count as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a League</h3>
                <p className="text-muted-foreground">
                  Choose a league from the left panel to view details and manage your team
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}