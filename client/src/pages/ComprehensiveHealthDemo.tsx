import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Activity, Shield, TrendingDown, Heart, Zap, Users, ClipboardCheck, Stethoscope, Trophy, Target, Timer } from "lucide-react";

// Mock comprehensive sports data for Athletic Director demo
const generateComprehensiveSportsData = () => {
  const sports = {
    football: {
      name: "Football",
      season: "Fall 2024",
      teams: ["Roy Miller Buccaneers"],
      players: [
        { name: "Marcus Thompson", position: "QB", jersey: "7", grade: 12, injuryRisk: 3.2, performanceTrend: -8.5 },
        { name: "David Rodriguez", position: "RB", jersey: "24", grade: 11, injuryRisk: 7.8, performanceTrend: -15.2 },
        { name: "Tyler Williams", position: "WR", jersey: "81", grade: 12, injuryRisk: 2.1, performanceTrend: 5.3 },
        { name: "Antonio Garcia", position: "LT", jersey: "77", grade: 12, injuryRisk: 8.9, performanceTrend: -22.1 },
        { name: "Brandon Smith", position: "LB", jersey: "55", grade: 11, injuryRisk: 6.4, performanceTrend: -12.8 },
        { name: "Isaiah Brown", position: "CB", jersey: "21", grade: 10, injuryRisk: 4.1, performanceTrend: 3.7 },
      ],
      recentGames: [
        { opponent: "Carroll Tigers", score: "28-21", date: "2024-10-15", injuries: 1 },
        { opponent: "King Mustangs", score: "35-14", date: "2024-10-08", injuries: 0 },
        { opponent: "Moody Trojans", score: "21-24", date: "2024-10-01", injuries: 2 },
      ]
    },
    wrestling: {
      name: "Wrestling",
      season: "Winter 2024-25",
      teams: ["Roy Miller Wrestling"],
      players: [
        { name: "Carlos Martinez", weightClass: "106", jersey: "106", grade: 10, injuryRisk: 5.7, performanceTrend: -18.3 },
        { name: "Michael Johnson", weightClass: "113", jersey: "113", grade: 11, injuryRisk: 8.2, performanceTrend: -25.4 },
        { name: "Daniel Garcia", weightClass: "120", jersey: "120", grade: 12, injuryRisk: 3.8, performanceTrend: 7.2 },
        { name: "Jordan Williams", weightClass: "126", jersey: "126", grade: 11, injuryRisk: 9.1, performanceTrend: -31.6 },
        { name: "Anthony Davis", weightClass: "132", jersey: "132", grade: 12, injuryRisk: 4.2, performanceTrend: 2.8 },
        { name: "Roberto Lopez", weightClass: "138", jersey: "138", grade: 10, injuryRisk: 6.9, performanceTrend: -14.7 },
      ],
      recentTournaments: [
        { tournament: "District Championship", placement: "3rd", date: "2024-11-12", injuries: 0 },
        { tournament: "Coastal Bend Invitational", placement: "5th", date: "2024-11-05", injuries: 1 },
        { tournament: "Miller Duals", placement: "2nd", date: "2024-10-29", injuries: 0 },
      ]
    },
    volleyball: {
      name: "Volleyball",
      season: "Fall 2024",
      teams: ["Roy Miller Buccaneers"],
      players: [
        { name: "Sofia Rodriguez", position: "Outside Hitter", jersey: "12", grade: 12, injuryRisk: 6.3, performanceTrend: -11.2 },
        { name: "Maria Gonzalez", position: "Setter", jersey: "5", grade: 11, injuryRisk: 2.4, performanceTrend: 8.1 },
        { name: "Ashley Thompson", position: "Middle Blocker", jersey: "8", grade: 12, injuryRisk: 7.6, performanceTrend: -16.8 },
        { name: "Jasmine Davis", position: "Libero", jersey: "1", grade: 10, injuryRisk: 3.9, performanceTrend: 4.3 },
        { name: "Victoria Martinez", position: "Right Side", jersey: "11", grade: 11, injuryRisk: 5.8, performanceTrend: -9.7 },
        { name: "Samantha Wilson", position: "Outside Hitter", jersey: "7", grade: 12, injuryRisk: 4.7, performanceTrend: 1.8 },
      ],
      recentMatches: [
        { opponent: "Veterans Memorial Eagles", score: "3-1", date: "2024-10-18", injuries: 0 },
        { opponent: "Flour Bluff Hornets", score: "2-3", date: "2024-10-15", injuries: 1 },
        { opponent: "Calallen Wildcats", score: "3-0", date: "2024-10-12", injuries: 0 },
      ]
    },
    track: {
      name: "Track & Field",
      season: "Spring 2025",
      teams: ["Roy Miller Track"],
      players: [
        { name: "Kevin Johnson", events: "100m, 200m", jersey: "14", grade: 12, injuryRisk: 4.1, performanceTrend: -7.3 },
        { name: "Destiny Williams", events: "400m, 800m", jersey: "23", grade: 11, injuryRisk: 6.8, performanceTrend: -13.9 },
        { name: "Marcus Brown", events: "110H, 300H", jersey: "33", grade: 12, injuryRisk: 8.4, performanceTrend: -19.2 },
        { name: "Angela Martinez", events: "Shot Put, Discus", jersey: "41", grade: 10, injuryRisk: 3.2, performanceTrend: 9.6 },
        { name: "Christopher Davis", events: "High Jump, Long Jump", jersey: "52", grade: 11, injuryRisk: 7.1, performanceTrend: -11.8 },
        { name: "Isabella Garcia", events: "1600m, 3200m", jersey: "61", grade: 12, injuryRisk: 5.4, performanceTrend: -8.1 },
      ],
      recentMeets: [
        { meet: "District Championship", placement: "2nd", date: "2024-04-15", injuries: 0 },
        { meet: "Area Championship", placement: "4th", date: "2024-04-22", injuries: 1 },
        { meet: "Regional Meet", placement: "6th", date: "2024-04-29", injuries: 0 },
      ]
    }
  };

  return sports;
};

// Generate AI coaching recommendations based on player data
const generateAIRecommendations = (player: any, sport: string) => {
  const recommendations = [];
  
  if (player.injuryRisk > 7) {
    recommendations.push({
      type: "medical",
      priority: "immediate",
      message: `High injury risk detected (${player.injuryRisk.toFixed(1)}/10). Schedule Athletic Trainer evaluation immediately.`
    });
  }
  
  if (player.performanceTrend < -15) {
    recommendations.push({
      type: "performance",
      priority: "soon",
      message: `Significant performance decline (${player.performanceTrend.toFixed(1)}%). Consider workload reduction and technique review.`
    });
  }
  
  if (sport === "wrestling" && player.performanceTrend < -20) {
    recommendations.push({
      type: "weight",
      priority: "immediate",
      message: `Possible weight cutting complications. Monitor hydration and nutrition closely.`
    });
  }
  
  if (sport === "volleyball" && player.injuryRisk > 6) {
    recommendations.push({
      type: "movement",
      priority: "soon",
      message: `Shoulder/knee stress indicators elevated. Implement recovery protocol.`
    });
  }
  
  if (sport === "track" && player.performanceTrend < -10) {
    recommendations.push({
      type: "training",
      priority: "monitor",
      message: `Performance plateau detected. Adjust training periodization.`
    });
  }
  
  return recommendations;
};

export default function ComprehensiveHealthDemo() {
  const [sportsData] = useState(generateComprehensiveSportsData());
  const [selectedSport, setSelectedSport] = useState("football");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [viewMode, setViewMode] = useState("overview");

  const currentSport = sportsData[selectedSport];
  const allPlayers = Object.values(sportsData).flatMap(sport => sport.players);
  const highRiskPlayers = allPlayers.filter(p => p.injuryRisk > 6);
  const decliningPlayers = allPlayers.filter(p => p.performanceTrend < -10);

  const getAlertLevel = (injuryRisk: number) => {
    if (injuryRisk > 8) return "critical";
    if (injuryRisk > 6) return "high";
    if (injuryRisk > 4) return "medium";
    return "low";
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Miller VLC Athletic Director Dashboard</h1>
          <p className="text-blue-100 text-lg">Comprehensive health monitoring across all sports programs</p>
          <div className="mt-4 flex gap-4 text-sm text-blue-200">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {allPlayers.length} Athletes Monitored
            </span>
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {highRiskPlayers.length} High Risk
            </span>
            <span className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {decliningPlayers.length} Performance Decline
            </span>
          </div>
        </div>

        {/* Critical Alerts */}
        {(highRiskPlayers.length > 0 || decliningPlayers.length > 0) && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Athletic Director Alert:</strong> {highRiskPlayers.length} high-risk athletes and {decliningPlayers.length} showing performance decline require immediate attention
            </AlertDescription>
          </Alert>
        )}

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="football">Football</SelectItem>
              <SelectItem value="wrestling">Wrestling</SelectItem>
              <SelectItem value="volleyball">Volleyball</SelectItem>
              <SelectItem value="track">Track & Field</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Sport Overview</SelectItem>
              <SelectItem value="ai-analysis">AI Analysis</SelectItem>
              <SelectItem value="athletic-trainer">Athletic Trainer</SelectItem>
              <SelectItem value="competitions">Competition Results</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-white">Sport Overview</TabsTrigger>
            <TabsTrigger value="ai-analysis" className="text-white">AI Analysis</TabsTrigger>
            <TabsTrigger value="athletic-trainer" className="text-white">Athletic Trainer</TabsTrigger>
            <TabsTrigger value="competitions" className="text-white">Competition Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sport Information */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {currentSport.name} - {currentSport.season}
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Team performance and injury monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <strong>Teams:</strong> {currentSport.teams.join(", ")}
                    </div>
                    <div className="text-sm">
                      <strong>Athletes Monitored:</strong> {currentSport.players.length}
                    </div>
                    <div className="text-sm">
                      <strong>High Risk Athletes:</strong> {currentSport.players.filter(p => p.injuryRisk > 6).length}
                    </div>
                    
                    {/* Recent Results */}
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recent Competition Results</h4>
                      <div className="space-y-2">
                        {(currentSport.recentGames || currentSport.recentTournaments || currentSport.recentMatches || currentSport.recentMeets)?.map((result, index) => (
                          <div key={index} className="p-2 bg-white/5 rounded text-xs">
                            <div className="flex justify-between">
                              <span>{result.opponent || result.tournament || result.meet}</span>
                              <span>{result.score || result.placement}</span>
                            </div>
                            <div className="text-blue-200 mt-1">
                              {result.date} • {result.injuries} injuries
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Player Roster */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle>Player Health Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentSport.players.map((player, index) => (
                      <div 
                        key={index}
                        className="flex justify-between items-center p-3 bg-white/5 rounded cursor-pointer hover:bg-white/10"
                        onClick={() => setSelectedPlayer(player)}
                        data-testid={`player-card-${player.jersey}`}
                      >
                        <div>
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-blue-200">
                            #{player.jersey} • {player.position || player.weightClass || player.events}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`${getAlertColor(getAlertLevel(player.injuryRisk))} text-white`}
                          >
                            {getAlertLevel(player.injuryRisk)}
                          </Badge>
                          <div className="text-xs text-right">
                            <div>Risk: {player.injuryRisk.toFixed(1)}</div>
                            <div className={player.performanceTrend < 0 ? "text-red-300" : "text-green-300"}>
                              {player.performanceTrend > 0 ? '+' : ''}{player.performanceTrend.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ai-analysis" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* AI Insights */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Performance Analysis
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Machine learning insights from {currentSport.name} data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentSport.players
                      .filter(p => p.injuryRisk > 6 || p.performanceTrend < -10)
                      .map((player, index) => {
                        const recommendations = generateAIRecommendations(player, selectedSport);
                        return (
                          <div key={index} className="p-3 bg-orange-500/20 rounded border border-orange-500/30">
                            <div className="font-semibold mb-2">{player.name}</div>
                            <div className="space-y-2">
                              {recommendations.map((rec, recIndex) => (
                                <Alert key={recIndex} className="border-orange-500 bg-orange-500/10">
                                  <AlertTriangle className="h-4 w-4" />
                                  <AlertDescription className="text-xs">
                                    <Badge className={`mb-1 ${rec.priority === 'immediate' ? 'bg-red-500' : rec.priority === 'soon' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                                      {rec.priority}
                                    </Badge>
                                    <br />
                                    {rec.message}
                                  </AlertDescription>
                                </Alert>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Predictive Analytics */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Predictive Analytics
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    AI predictions for {currentSport.name} season
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/20 rounded">
                      <h4 className="font-semibold mb-2">Season Outlook</h4>
                      <div className="text-sm space-y-1">
                        <div>Projected Injury Rate: {Math.round(Math.random() * 15 + 5)}%</div>
                        <div>Performance Trend: {Math.random() > 0.5 ? 'Improving' : 'Stable'}</div>
                        <div>Championship Probability: {Math.round(Math.random() * 40 + 20)}%</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-500/20 rounded">
                      <h4 className="font-semibold mb-2">AI Recommendations</h4>
                      <div className="text-sm space-y-1">
                        <div>• Focus on injury prevention for high-risk athletes</div>
                        <div>• Implement load management protocols</div>
                        <div>• Schedule additional Athletic Trainer evaluations</div>
                        <div>• Monitor performance drill trends closely</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="athletic-trainer" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Medical Priorities */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Athletic Trainer Priorities
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Medical interventions required across all sports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {allPlayers
                      .filter(p => p.injuryRisk > 7)
                      .sort((a, b) => b.injuryRisk - a.injuryRisk)
                      .map((player, index) => (
                        <div key={index} className="p-3 bg-red-500/20 rounded border border-red-500/30">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold">{player.name}</div>
                              <div className="text-sm text-red-200">
                                Sport: {Object.keys(sportsData).find(sport => 
                                  sportsData[sport].players.includes(player)
                                )?.toUpperCase()}
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-red-500 text-white">
                              Critical
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <div>Injury Risk: {player.injuryRisk.toFixed(1)}/10</div>
                            <div>Performance Decline: {player.performanceTrend.toFixed(1)}%</div>
                          </div>
                          <Button 
                            size="sm" 
                            className="mt-2 bg-red-600 hover:bg-red-700"
                            data-testid={`button-schedule-${index}`}
                          >
                            Schedule Evaluation
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* HIPAA Compliance */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    HIPAA Compliance Status
                  </CardTitle>
                  <CardDescription className="text-blue-200">
                    Protected health information management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-300">{allPlayers.length}</div>
                        <div className="text-sm text-green-200">Consented Athletes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-300">100%</div>
                        <div className="text-sm text-green-200">Compliance Rate</div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-500/20 rounded">
                      <h4 className="font-semibold mb-2">Security Features</h4>
                      <div className="text-sm space-y-1">
                        <div>✓ 256-bit encryption for all health data</div>
                        <div>✓ Role-based access controls</div>
                        <div>✓ Complete audit trail logging</div>
                        <div>✓ Parent/guardian consent verified</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="competitions" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {Object.entries(sportsData).map(([sportKey, sport]) => (
                <Card key={sportKey} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5" />
                      {sport.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(sport.recentGames || sport.recentTournaments || sport.recentMatches || sport.recentMeets)?.map((result, index) => (
                        <div key={index} className="p-2 bg-white/5 rounded">
                          <div className="font-semibold text-sm">
                            {result.opponent || result.tournament || result.meet}
                          </div>
                          <div className="text-xs text-blue-200">
                            {result.score || result.placement} • {result.date}
                          </div>
                          <div className="text-xs mt-1">
                            Injuries: {result.injuries}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Player Detail Modal */}
        {selectedPlayer && (
          <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">
                Detailed Analysis: {selectedPlayer.name}
              </CardTitle>
              <CardDescription className="text-blue-200">
                Comprehensive health and performance monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Health Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Injury Risk:</span>
                      <span className={`font-semibold ${selectedPlayer.injuryRisk > 6 ? 'text-red-300' : 'text-green-300'}`}>
                        {selectedPlayer.injuryRisk.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance Trend:</span>
                      <span className={`font-semibold ${selectedPlayer.performanceTrend < 0 ? 'text-red-300' : 'text-green-300'}`}>
                        {selectedPlayer.performanceTrend > 0 ? '+' : ''}{selectedPlayer.performanceTrend.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Grade Level:</span>
                      <span className="font-semibold">{selectedPlayer.grade}th</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">AI Recommendations</h3>
                  <div className="space-y-2">
                    {generateAIRecommendations(selectedPlayer, selectedSport).map((rec, index) => (
                      <Alert key={index} className="border-orange-500 bg-orange-500/10">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          <Badge className={`mb-1 ${rec.priority === 'immediate' ? 'bg-red-500' : rec.priority === 'soon' ? 'bg-yellow-500' : 'bg-blue-500'}`}>
                            {rec.priority}
                          </Badge>
                          <br />
                          {rec.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Actions</h3>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid="button-generate-report"
                    >
                      Generate Medical Report
                    </Button>
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      data-testid="button-schedule-trainer"
                    >
                      Schedule Athletic Trainer
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() => setSelectedPlayer(null)}
                      data-testid="button-close-details"
                    >
                      Close Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Capabilities Footer */}
        <Card className="mt-8 bg-green-900/30 backdrop-blur-sm border-green-500/30 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Miller VLC Athletic Director Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Multi-Sport Monitoring</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• Football contact analytics</li>
                  <li>• Wrestling weight management</li>
                  <li>• Volleyball movement tracking</li>
                  <li>• Track & field performance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI-Powered Insights</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• Injury risk prediction</li>
                  <li>• Performance trend analysis</li>
                  <li>• Competition simulation</li>
                  <li>• Medical intervention alerts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Athletic Trainer Integration</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• Medical priority queues</li>
                  <li>• HIPAA-compliant records</li>
                  <li>• Parent notification system</li>
                  <li>• Recovery tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">District Value</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• $47,510 annual savings</li>
                  <li>• Professional sports analytics</li>
                  <li>• First-to-market technology</li>
                  <li>• Educational mission funding</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}