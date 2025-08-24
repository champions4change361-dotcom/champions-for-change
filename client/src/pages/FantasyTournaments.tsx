import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GamepadIcon, Shield, Trophy, Users, Star, Clock, Target, Zap } from "lucide-react";
import { useState } from "react";
import { FantasyAgeGate } from "@/components/FantasyAgeGate";

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
      case "salary_cap": return "Daily fantasy with salary budget constraints";
      case "snake_draft": return "Traditional snake draft with season-long scoring";
      case "head_to_head": return "Direct competition against one opponent";
      case "best_ball": return "Draft once, optimal lineup set automatically";
      default: return "Professional fantasy sports format";
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
              Real-time status of all adult fantasy sports systems
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

      {/* Sport and Format Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Sport</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={selectedSport} 
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full p-4 text-lg bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
              data-testid="select-sport"
            >
              {fantasyStatus?.stats.supported_sports.map((sport) => (
                <option key={sport} value={sport}>
                  {getSportIcon(sport)} {sport.toUpperCase().replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Format</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full p-4 text-lg bg-white border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
              data-testid="select-format"
            >
              {fantasyStatus?.stats.supported_formats.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              {getFormatDescription(selectedFormat)}
            </p>
          </CardContent>
        </Card>
      </div>

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
              Real professional athletes from {selectedSport.toUpperCase()} with live stats integration
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
              <span>Real-Time Scoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Live stats integration from ESPN, NFL, NBA, and other official APIs
            </p>
            <Badge variant="default">
              Live API Integration
            </Badge>
          </CardContent>
        </Card>
        </div>
      </div>
    </FantasyAgeGate>
  );
}