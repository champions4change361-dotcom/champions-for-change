import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GamepadIcon, Shield, Trophy, Users, Star, Clock, Target, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { FantasyAgeGate } from "@/components/FantasyAgeGate";
import { FantasyAuth } from "@/components/FantasyAuth";
import { useFantasyAuth } from "@/hooks/useFantasyAuth";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FantasyStatus {
  fantasy_status: string;
  systems: {
    fantasy_leagues: string;
    professional_players: string;
    age_verification: string;
    api_integrations: string;
    safety_rules: string;
  };
  stats: {
    fantasy_leagues_count: number;
    professional_players_count: number;
    safety_rules_count: number;
    api_configurations_count: number;
    supported_sports: string[];
    supported_formats: string[];
    min_age_requirement: number;
  };
  deployment_time: string;
  message: string;
}

interface FantasyLeague {
  id: string;
  leagueName: string;
  sportType: string;
  leagueFormat: string;
  ageRestriction: number;
  requiresAgeVerification: boolean;
  maxParticipants: number;
  scoringConfig: any;
  leagueSettings: any;
  status: string;
}

interface ProfessionalPlayer {
  id: string;
  playerName: string;
  teamName: string;
  teamAbbreviation: string;
  position: string;
  sport: string;
  jerseyNumber?: number;
  salary: number;
  injuryStatus: string;
  isActive: boolean;
}

export default function FantasyTournaments() {
  const [showCreateLeague, setShowCreateLeague] = useState(false);
  const [showFantasyAuth, setShowFantasyAuth] = useState(false);
  const [leagueName, setLeagueName] = useState("");
  
  const { fantasyUser, isFantasyAuthenticated, loginFantasyUser } = useFantasyAuth();
  const [location, setLocation] = useLocation();
  const [selectedSport, setSelectedSport] = useState("nfl");
  const [selectedFormat, setSelectedFormat] = useState("survivor");

  // Fetch Fantasy system status
  const { data: fantasyStatus, isLoading: statusLoading } = useQuery<FantasyStatus>({
    queryKey: ["/api/fantasy/status"],
  });

  // Fetch fantasy leagues
  const { data: fantasyLeagues, isLoading: leaguesLoading } = useQuery<{ success: boolean; leagues: FantasyLeague[]; count: number }>({
    queryKey: ["/api/fantasy/leagues"],
  });

  // Fetch professional players by sport
  const { data: professionalPlayers, isLoading: playersLoading } = useQuery<{ success: boolean; players: ProfessionalPlayer[]; count: number }>({
    queryKey: ["/api/fantasy/players/sport", selectedSport],
    enabled: !!selectedSport,
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case "nfl": return "🏈";
      case "nba": return "🏀";
      case "mlb": return "⚾";
      case "nhl": return "🏒";
      case "esports": return "🎮";
      case "college_football": return "🏟️";
      default: return "🏆";
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "survivor": return "Pick one team per week. One wrong pick eliminates you!";
      case "daily_fantasy": return "Daily fantasy with salary budget constraints";
      case "snake_draft": return "Traditional snake draft with season-long scoring";
      case "head_to_head": return "Direct competition against one opponent";
      case "best_ball": return "Draft once, optimal lineup set automatically";
      default: return "Professional fantasy sports format";
    }
  };

  const getFormatConfig = (format: string) => {
    switch(format) {
      case "survivor": 
        return {
          title: "NFL Knockout", 
          icon: "🏈", 
          color: "bg-green-600 hover:bg-green-700",
          description: "Pick one team each week - Last person standing wins!"
        };
      case "daily_fantasy": 
        return {
          title: "Daily Fantasy", 
          icon: "💰", 
          color: "bg-blue-600 hover:bg-blue-700",
          description: "Build lineups under salary cap - compete daily!"
        };
      case "snake_draft": 
        return {
          title: "Season Draft", 
          icon: "🐍", 
          color: "bg-purple-600 hover:bg-purple-700",
          description: "Draft players in order - manage all season!"
        };
      case "head_to_head": 
        return {
          title: "Head-to-Head", 
          icon: "⚔️", 
          color: "bg-red-600 hover:bg-red-700",
          description: "Face off directly against opponents!"
        };
      case "best_ball": 
        return {
          title: "Best Ball", 
          icon: "⭐", 
          color: "bg-orange-600 hover:bg-orange-700",
          description: "Draft once - best players auto-selected!"
        };
      default: 
        return {
          title: format.toUpperCase(), 
          icon: "🏆", 
          color: "bg-gray-600 hover:bg-gray-700",
          description: "Professional fantasy sports format"
        };
    }
  };

  const handleFormatSelection = (format: string) => {
    if (isFantasyAuthenticated) {
      // Redirect to game creator for specific format
      setLocation(`/fantasy/create/${format}`);
    } else {
      // Store the intended format and show auth
      sessionStorage.setItem('pendingFantasyFormat', format);
      setShowFantasyAuth(true);
    }
  };

  return (
    <FantasyAgeGate platform="Fantasy Sports Platform" requiredAge={21}>
      <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <GamepadIcon className="w-8 h-8 text-purple-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Adult Fantasy Sports
          </h1>
          <Shield className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-lg text-muted-foreground">
          Age-Verified Professional Fantasy Sports Platform
        </p>
        {fantasyStatus && (
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              Status: {fantasyStatus.fantasy_status}
            </Badge>
            <Badge variant="outline" className="text-sm text-red-600">
              Age 21+ Required
            </Badge>
          </div>
        )}
        
        {/* Create Tournament Buttons */}
        <div className="pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-center mb-4">Create Your League</h3>
          <div className="max-w-xl mx-auto">
            {/* Top Row: Daily Fantasy, NFL Knockout, Snake Draft */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center">
                <Button 
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={() => handleFormatSelection('daily_fantasy')}
                  data-testid="create-daily_fantasy-tournament"
                >
                  💰 Daily Fantasy
                </Button>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  Salary cap contests
                </p>
              </div>
              <div className="text-center">
                <Button 
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-2 py-2 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={() => handleFormatSelection('survivor')}
                  data-testid="create-survivor-tournament"
                >
                  🏈 NFL Knockout
                </Button>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  Last person standing
                </p>
              </div>
              <div className="text-center">
                <Button 
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-2 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={() => handleFormatSelection('snake_draft')}
                  data-testid="create-snake_draft-tournament"
                >
                  🐍 Snake Draft
                </Button>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  Season-long draft
                </p>
              </div>
            </div>
            
            {/* Bottom Row: Head-to-Head, Best Ball (centered) */}
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
              <div className="text-center">
                <Button 
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-2 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={() => handleFormatSelection('head_to_head')}
                  data-testid="create-head_to_head-tournament"
                >
                  ⚔️ Head-to-Head
                </Button>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  1v1 matchups
                </p>
              </div>
              <div className="text-center">
                <Button 
                  size="sm"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white px-2 py-2 text-xs font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  onClick={() => handleFormatSelection('best_ball')}
                  data-testid="create-best_ball-tournament"
                >
                  ⭐ Best Ball
                </Button>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  Auto-optimal lineups
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Age Verification Warning */}
      <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Shield className="w-5 h-5" />
            <span>Age Verification Required</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-red-600 font-medium">
              🔞 This platform is strictly for adults 21 years and older
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Identity verification required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Professional sports only</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Legally compliant nationwide</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fantasy System Status */}
      {fantasyStatus && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Fantasy System Status</span>
            </CardTitle>
            <CardDescription>
              Current status of fantasy sports platform demo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {fantasyStatus.systems && Object.entries(fantasyStatus.systems).map(([system, status]) => (
                <div key={system} className="text-center">
                  <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
                    {status}
                  </Badge>
                  <p className="text-sm mt-1 capitalize">
                    {system.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{fantasyStatus.stats.fantasy_leagues_count}</p>
                <p className="text-sm text-muted-foreground">Fantasy Leagues</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{fantasyStatus.stats.professional_players_count}</p>
                <p className="text-sm text-muted-foreground">Professional Players</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{fantasyStatus.stats.supported_sports.length}</p>
                <p className="text-sm text-muted-foreground">Sports Supported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">21+</p>
                <p className="text-sm text-muted-foreground">Age Requirement</p>
              </div>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-lg font-semibold text-purple-700">
                {fantasyStatus.message}
              </p>
              <p className="text-sm text-muted-foreground">
                Deployed: {new Date(fantasyStatus.deployment_time).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Fantasy Leagues Display */}
      {fantasyLeagues && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Available Fantasy Leagues</span>
            </CardTitle>
            <CardDescription>
              Professional fantasy sports leagues with age verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fantasyLeagues.leagues.map((league) => (
                <Card key={league.id} className="border-2 hover:border-purple-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{league.leagueName}</CardTitle>
                      <span className="text-2xl">{getSportIcon(league.sportType)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline">{league.sportType.toUpperCase()}</Badge>
                      <Badge variant="secondary">{league.leagueFormat.toUpperCase()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Max Players:</span>
                        <p>{league.maxParticipants}</p>
                      </div>
                      <div>
                        <span className="font-medium">Age Req:</span>
                        <p className="text-red-600">{league.ageRestriction}+</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant={league.status === "open" ? "default" : "secondary"}>
                        {league.status.toUpperCase()}
                      </Badge>
                      {league.requiresAgeVerification && (
                        <Badge variant="outline" className="text-red-600">
                          Age Verified
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full" 
                      disabled={league.status !== "open"}
                      data-testid={`join-league-${league.id}`}
                    >
                      {league.status === "open" ? "Join League" : "League Closed"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Players Display */}
      {professionalPlayers && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{selectedSport.toUpperCase()} Professional Players</span>
            </CardTitle>
            <CardDescription>
              Sample professional athletes from {selectedSport.toUpperCase()} for demo purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {playersLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Loading players...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {professionalPlayers.players.slice(0, 8).map((player) => (
                  <Card key={player.id} className="border hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <h3 className="font-bold">{player.playerName}</h3>
                        <div className="flex justify-center space-x-2">
                          <Badge variant="outline">{player.teamAbbreviation}</Badge>
                          <Badge variant="secondary">{player.position}</Badge>
                        </div>
                        {player.jerseyNumber && (
                          <p className="text-sm text-muted-foreground">#{player.jerseyNumber}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Salary:</span>
                          <span className="text-green-600 font-bold">${player.salary}</span>
                        </div>
                        <Badge variant={player.injuryStatus === "healthy" ? "default" : "destructive"}>
                          {player.injuryStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {professionalPlayers && professionalPlayers.players.length > 8 && (
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing 8 of {professionalPlayers.count} professional players
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Age Verification</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Strict 21+ age verification with identity confirmation required for all participants
            </p>
            <Badge variant="outline" className="text-red-600">
              ID Verification Required
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span>Professional Sports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Real professional athletes from NFL, NBA, MLB, NHL, and major esports leagues
            </p>
            <div className="flex space-x-1">
              <span>🏈</span><span>🏀</span><span>⚾</span><span>🏒</span><span>🎮</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <span>Sample Scoring Demo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Demo fantasy platform showcasing tournament concepts
            </p>
            <Badge variant="default">
              Demo Platform
            </Badge>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Fantasy Authentication Modal */}
      <FantasyAuth
        open={showFantasyAuth}
        onOpenChange={setShowFantasyAuth}
        onAuthSuccess={(user) => {
          loginFantasyUser(user);
          
          // Check if there's a pending format selection
          const pendingFormat = sessionStorage.getItem('pendingFantasyFormat');
          if (pendingFormat) {
            sessionStorage.removeItem('pendingFantasyFormat');
            setLocation(`/fantasy/create/${pendingFormat}`);
          } else {
            // Fallback to opening league creation modal
            setShowCreateLeague(true);
          }
        }}
      />

      {/* Create League Modal */}
      <Dialog open={showCreateLeague} onOpenChange={setShowCreateLeague}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🏈 Create NFL Knockout League</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">League Name</label>
              <Input
                placeholder="e.g., Office Champions Survivor Pool"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                data-testid="input-league-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">League Description (Optional)</label>
              <Input
                placeholder="e.g., Family fun league, Office competition, Friends group"
                data-testid="input-league-description"
              />
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🏆 FREE NFL Survivor Fun</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Pick one NFL team each week to win</li>
                <li>• You can only use each team once per season</li>
                <li>• If your team loses, you're eliminated</li>
                <li>• Last person standing wins bragging rights!</li>
                <li>• <strong>100% FREE - No entry fees or gambling</strong></li>
              </ul>
            </div>
            <div className="flex space-x-2">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // Create league and redirect to dashboard
                  const leagueNameFinal = leagueName || 'NFL Survivor Pool';
                  const leagueId = `league-${Date.now()}`;
                  
                  // Close modal and redirect to league dashboard
                  setShowCreateLeague(false);
                  setLeagueName("");
                  setLocation(`/fantasy/league/${leagueId}`);
                }}
                data-testid="button-create-league"
              >
                Create League
              </Button>
              <Button variant="outline" onClick={() => setShowCreateLeague(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FantasyAgeGate>
  );
}