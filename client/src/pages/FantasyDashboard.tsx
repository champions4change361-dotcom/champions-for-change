import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayerGrid } from "@/components/PlayerCard";
import { Trophy, Users, DollarSign, Clock, Star, Target } from "lucide-react";
import type { ProfessionalPlayer } from "@shared/schema";

// Sample player data that matches our enhanced schema
const samplePlayers: ProfessionalPlayer[] = [
  {
    id: "1",
    externalPlayerId: "mahomes-15",
    dataSource: "yahoo_sports",
    playerName: "Patrick Mahomes",
    teamName: "Kansas City Chiefs",
    teamAbbreviation: "KC",
    position: "QB",
    sport: "nfl",
    jerseyNumber: 15,
    salary: 11200,
    playerImageUrl: null,
    teamLogoUrl: null,
    height: "6'3\"",
    weight: 230,
    age: 28,
    experience: 7,
    currentSeasonStats: {
      attempts: 234,
      yards: 2890,
      yardsPerGame: 289,
      touchdowns: 22,
      fantasyPointsPerGame: 24.5,
      gamesPlayed: 10
    },
    recentPerformance: {
      games: [
        { week: 5, opponent: "MIN", fantasyPoints: 28.4, salary: 11200, gameResult: "W", stats: { yards: 281, tds: 2 } },
        { week: 6, opponent: "DEN", fantasyPoints: 18.2, salary: 11000, gameResult: "W", stats: { yards: 266, tds: 1 } },
        { week: 7, opponent: "SF", fantasyPoints: 22.8, salary: 11200, gameResult: "L", stats: { yards: 231, tds: 2 } },
        { week: 8, opponent: "LV", fantasyPoints: 32.1, salary: 11400, gameResult: "W", stats: { yards: 348, tds: 3 } },
        { week: 9, opponent: "TB", fantasyPoints: 26.7, salary: 11200, gameResult: "W", stats: { yards: 291, tds: 2 } },
        { week: 10, opponent: "BUF", fantasyPoints: 19.3, salary: 11200, gameResult: "L", stats: { yards: 196, tds: 1 } }
      ],
      trend: "up"
    },
    injuryStatus: "healthy",
    injuryDesignation: null,
    latestNews: [
      {
        timestamp: "2025-01-06T10:30:00Z",
        headline: "Mahomes throws for 350+ yards in playoff prep",
        summary: "Chiefs QB looks sharp in practice ahead of wild card weekend",
        source: "ESPN",
        impact: "positive"
      }
    ],
    nextOpponent: "LAC",
    nextGameDate: new Date("2025-01-12T18:00:00Z"),
    opponentRank: {
      vsPosition: 12,
      passYardsAllowed: 245.2,
      fantasyPointsAllowed: 19.8
    },
    byeWeek: null,
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: "2",
    externalPlayerId: "chase-1",
    dataSource: "yahoo_sports",
    playerName: "Ja'Marr Chase",
    teamName: "Cincinnati Bengals",
    teamAbbreviation: "CIN",
    position: "WR",
    sport: "nfl",
    jerseyNumber: 1,
    salary: 9800,
    playerImageUrl: null,
    teamLogoUrl: null,
    height: "6'0\"",
    weight: 200,
    age: 25,
    experience: 4,
    currentSeasonStats: {
      yards: 1142,
      yardsPerGame: 114.2,
      touchdowns: 8,
      fantasyPointsPerGame: 18.7,
      gamesPlayed: 10
    },
    recentPerformance: {
      games: [
        { week: 5, opponent: "BAL", fantasyPoints: 12.4, salary: 9600, gameResult: "L", stats: { yards: 62, tds: 0 } },
        { week: 6, opponent: "NYG", fantasyPoints: 25.8, salary: 9800, gameResult: "W", stats: { yards: 118, tds: 1 } },
        { week: 7, opponent: "CLE", fantasyPoints: 18.9, salary: 9800, gameResult: "W", stats: { yards: 129, tds: 0 } },
        { week: 8, opponent: "PHI", fantasyPoints: 31.2, salary: 10000, gameResult: "L", stats: { yards: 182, tds: 1 } },
        { week: 9, opponent: "LV", fantasyPoints: 22.1, salary: 9800, gameResult: "W", stats: { yards: 141, tds: 0 } },
        { week: 10, opponent: "PIT", fantasyPoints: 8.7, salary: 9400, gameResult: "L", stats: { yards: 47, tds: 0 } }
      ],
      trend: "down"
    },
    injuryStatus: "questionable",
    injuryDesignation: "Questionable",
    latestNews: [
      {
        timestamp: "2025-01-06T14:15:00Z",
        headline: "Chase limited in practice with hip injury",
        summary: "WR expected to play but worth monitoring leading up to game",
        source: "NFL Network",
        impact: "negative"
      }
    ],
    nextOpponent: "DEN",
    nextGameDate: new Date("2025-01-12T15:00:00Z"),
    opponentRank: {
      vsPosition: 8,
      passYardsAllowed: 198.5,
      fantasyPointsAllowed: 14.2
    },
    byeWeek: null,
    lastUpdated: new Date(),
    isActive: true
  },
  {
    id: "3",
    externalPlayerId: "henry-22",
    dataSource: "yahoo_sports",
    playerName: "Derrick Henry",
    teamName: "Baltimore Ravens",
    teamAbbreviation: "BAL",
    position: "RB",
    sport: "nfl",
    jerseyNumber: 22,
    salary: 8400,
    playerImageUrl: null,
    teamLogoUrl: null,
    height: "6'3\"",
    weight: 247,
    age: 30,
    experience: 9,
    currentSeasonStats: {
      yards: 1521,
      yardsPerGame: 152.1,
      touchdowns: 13,
      fantasyPointsPerGame: 21.3,
      gamesPlayed: 10
    },
    recentPerformance: {
      games: [
        { week: 5, opponent: "CIN", fantasyPoints: 28.7, salary: 8200, gameResult: "W", stats: { yards: 92, tds: 2 } },
        { week: 6, opponent: "WAS", fantasyPoints: 24.1, salary: 8400, gameResult: "W", stats: { yards: 132, tds: 1 } },
        { week: 7, opponent: "TB", fantasyPoints: 19.8, salary: 8400, gameResult: "W", stats: { yards: 169, tds: 0 } },
        { week: 8, opponent: "CLE", fantasyPoints: 15.2, salary: 8200, gameResult: "W", stats: { yards: 73, tds: 1 } },
        { week: 9, opponent: "DEN", fantasyPoints: 32.4, salary: 8600, gameResult: "W", stats: { yards: 107, tds: 2 } },
        { week: 10, opponent: "CIN", fantasyPoints: 27.8, salary: 8400, gameResult: "W", stats: { yards: 68, tds: 2 } }
      ],
      trend: "stable"
    },
    injuryStatus: "healthy",
    injuryDesignation: null,
    latestNews: [
      {
        timestamp: "2025-01-06T09:45:00Z",
        headline: "Henry caps off historic season with playoff push",
        summary: "Ravens RB looking to continue dominant rushing attack in postseason",
        source: "The Athletic",
        impact: "positive"
      }
    ],
    nextOpponent: "PIT",
    nextGameDate: new Date("2025-01-11T20:15:00Z"),
    opponentRank: {
      vsPosition: 4,
      rushYardsAllowed: 98.7,
      fantasyPointsAllowed: 16.5
    },
    byeWeek: null,
    lastUpdated: new Date(),
    isActive: true
  }
];

export default function FantasyDashboard() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("players");

  const handlePlayerSelect = (player: ProfessionalPlayer) => {
    setSelectedPlayers(prev => 
      prev.includes(player.id) 
        ? prev.filter(id => id !== player.id)
        : [...prev, player.id]
    );
  };

  const handleCaptainSelect = (player: ProfessionalPlayer) => {
    setCaptainId(player.id);
    if (!selectedPlayers.includes(player.id)) {
      setSelectedPlayers(prev => [...prev, player.id]);
    }
  };

  const totalSalary = selectedPlayers.reduce((sum, playerId) => {
    const player = samplePlayers.find(p => p.id === playerId);
    return sum + (player?.salary || 0);
  }, 0);

  const projectedPoints = selectedPlayers.reduce((sum, playerId) => {
    const player = samplePlayers.find(p => p.id === playerId);
    const basePoints = player?.currentSeasonStats?.fantasyPointsPerGame || 0;
    const multiplier = playerId === captainId ? 1.5 : 1;
    return sum + (basePoints * multiplier);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white" data-testid="fantasy-dashboard-title">
                Fantasy Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Build your lineup for Sunday's showdown contests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                Lineup locks in 2h 45m
              </Badge>
              <Button className="bg-green-600 hover:bg-green-700">
                <Trophy className="h-4 w-4 mr-2" />
                Enter Contest
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lineup Builder Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Lineup Builder</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Salary Cap */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Salary Used</span>
                    <span className="font-medium" data-testid="salary-used">
                      ${(totalSalary / 1000).toFixed(1)}K / 50K
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalSalary / 50000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Projected Points */}
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-2xl font-bold" data-testid="projected-points">
                    {projectedPoints.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Projected Points</div>
                </div>

                {/* Lineup Slots */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Captain + 5 FLEX</div>
                  
                  {/* Captain Slot */}
                  <div className="p-3 border-2 border-dashed border-yellow-300 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium">Captain (1.5x)</span>
                      </div>
                      {captainId && (
                        <Badge variant="secondary" className="text-xs">
                          {samplePlayers.find(p => p.id === captainId)?.playerName.split(' ').pop()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* FLEX Slots */}
                  {Array.from({ length: 5 }).map((_, index) => {
                    const flexPlayer = selectedPlayers.filter(id => id !== captainId)[index];
                    return (
                      <div key={index} className="p-3 border border-slate-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">FLEX {index + 1}</span>
                          {flexPlayer && (
                            <Badge variant="outline" className="text-xs">
                              {samplePlayers.find(p => p.id === flexPlayer)?.playerName.split(' ').pop()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clear Lineup */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setSelectedPlayers([]);
                    setCaptainId(null);
                  }}
                  data-testid="clear-lineup-button"
                >
                  Clear Lineup
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="players" data-testid="players-tab">
                  <Users className="h-4 w-4 mr-2" />
                  Player Pool
                </TabsTrigger>
                <TabsTrigger value="contests" data-testid="contests-tab">
                  <Trophy className="h-4 w-4 mr-2" />
                  Contests
                </TabsTrigger>
                <TabsTrigger value="leaderboards" data-testid="leaderboards-tab">
                  <Target className="h-4 w-4 mr-2" />
                  Live Scoring
                </TabsTrigger>
              </TabsList>

              <TabsContent value="players" className="mt-6">
                <div className="space-y-6">
                  {/* Game Filter */}
                  <Card>
                    <CardHeader>
                      <CardTitle>KC @ LAC - Sunday 4:25 PM ET</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Build your Captain + 5 FLEX lineup from this game
                      </p>
                    </CardHeader>
                  </Card>

                  {/* Player Pool */}
                  <PlayerGrid
                    players={samplePlayers}
                    onPlayerSelect={handlePlayerSelect}
                    selectedPlayers={selectedPlayers}
                    captainMode={true}
                    onCaptainSelect={handleCaptainSelect}
                  />
                </div>
              </TabsContent>

              <TabsContent value="contests" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>KC @ LAC Showdown</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>15/20 entries</span>
                        <span>•</span>
                        <span>Free entry</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Prize Pool</span>
                          <span className="font-medium">Bragging Rights</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lineups lock</span>
                          <span className="font-medium">4:25 PM ET</span>
                        </div>
                        <Button className="w-full mt-4">Join Contest</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sunday Night Special</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>8/50 entries</span>
                        <span>•</span>
                        <span>Free entry</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Prize Pool</span>
                          <span className="font-medium">Champion Title</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lineups lock</span>
                          <span className="font-medium">8:20 PM ET</span>
                        </div>
                        <Button className="w-full mt-4">Join Contest</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="leaderboards" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Live Contest Scoring</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Real-time leaderboards update during games
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Leaderboards will appear once contests begin</p>
                      <p className="text-sm mt-2">Next update: 2 AM EST (Yahoo Sports batch)</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}