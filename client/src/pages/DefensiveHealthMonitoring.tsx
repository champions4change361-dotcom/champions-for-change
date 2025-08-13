import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Activity, Shield, TrendingDown, Heart, Zap, Users, ClipboardCheck, Stethoscope } from "lucide-react";

// Mock defensive player data showing health monitoring beyond counting stats
const generateDefensivePlayerData = () => {
  const defensivePositions = [
    { name: "Defensive End", players: ["Marcus Thompson", "Darius Williams"] },
    { name: "Defensive Tackle", players: ["Antonio Garcia", "Michael Davis"] },
    { name: "Linebacker", players: ["Jordan Martinez", "Tyler Johnson", "Brandon Lee"] },
    { name: "Cornerback", players: ["Devon Smith", "Carlos Rodriguez"] },
    { name: "Safety", players: ["Isaiah Brown", "Cameron Wilson"] }
  ];

  const allPlayers = [];
  let playerId = 1;

  defensivePositions.forEach(pos => {
    pos.players.forEach(playerName => {
      allPlayers.push({
        id: playerId++,
        name: playerName,
        position: pos.name,
        jersey: (50 + playerId).toString(),
        grade: Math.floor(Math.random() * 3) + 10, // 10-12
        
        // Performance drill metrics (non-counting stats)
        fortyYardDash: (4.4 + Math.random() * 0.8).toFixed(2), // 4.4-5.2 seconds
        benchPress: Math.floor(Math.random() * 80) + 180, // 180-260 lbs
        verticalJump: Math.floor(Math.random() * 10) + 28, // 28-38 inches
        broadJump: Math.floor(Math.random() * 24) + 96, // 96-120 inches
        threeConeTime: (6.8 + Math.random() * 0.8).toFixed(2), // 6.8-7.6 seconds
        
        // Health indicators from practice drills
        reactionTime: Math.floor(Math.random() * 50) + 200, // 200-250ms
        agilityScore: Math.floor(Math.random() * 30) + 70, // 70-100
        enduranceLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
        recoveryRate: Math.floor(Math.random() * 30) + 70, // 70-100%
        
        // Health trend indicators
        weeklyPerformanceTrend: Math.random() * 20 - 10, // -10% to +10%
        injuryRiskScore: Math.random() * 10, // 0-10 risk scale
        alertLevel: Math.random() > 0.7 ? (Math.random() > 0.5 ? "medium" : "high") : "low",
        
        // Athletic Trainer notes
        athleticTrainerNotes: Math.random() > 0.8 ? "Scheduled for follow-up evaluation" : "Cleared for full participation",
        lastMedicalCheck: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
        
        // Practice drill performance
        drillPerformanceDecline: Math.random() > 0.85,
        compensatoryMovements: Math.random() > 0.9,
      });
    });
  });

  return allPlayers;
};

export default function DefensiveHealthMonitoring() {
  const [defensivePlayers, setDefensivePlayers] = useState(generateDefensivePlayerData());
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Refresh data to simulate real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setDefensivePlayers(generateDefensivePlayerData());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getAlertColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const playersNeedingAttention = defensivePlayers.filter(p => 
    p.alertLevel === "high" || p.drillPerformanceDecline || p.compensatoryMovements
  );

  const athleticTrainerReviews = defensivePlayers.filter(p => 
    p.athleticTrainerNotes !== "Cleared for full participation"
  );

  const groupPlayersByPosition = () => {
    return defensivePlayers.reduce((acc, player) => {
      if (!acc[player.position]) acc[player.position] = [];
      acc[player.position].push(player);
      return acc;
    }, {} as Record<string, typeof defensivePlayers>);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Defensive Health Monitoring</h1>
          <p className="text-red-100 text-lg">Performance drill analysis for positions without counting stats</p>
          <div className="mt-4 flex gap-4 text-sm text-red-200">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Position-Specific Analytics
            </span>
            <span className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Performance Drill Integration
            </span>
            <span className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Athletic Trainer Workflow
            </span>
          </div>
        </div>

        {/* Alert Summary */}
        {playersNeedingAttention.length > 0 && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention Required:</strong> {playersNeedingAttention.length} defensive player(s) showing performance regression or health concerns
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="overview" className="text-white">Position Overview</TabsTrigger>
            <TabsTrigger value="drills" className="text-white">Performance Drills</TabsTrigger>
            <TabsTrigger value="trainer" className="text-white">Athletic Trainer</TabsTrigger>
            <TabsTrigger value="compliance" className="text-white">HIPAA Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(groupPlayersByPosition()).map(([position, players]) => (
                <Card key={position} className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      {position}
                    </CardTitle>
                    <CardDescription className="text-red-200">
                      {players.length} players • Health monitoring beyond stats
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {players.map((player) => (
                        <div 
                          key={player.id}
                          className="flex justify-between items-center p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10"
                          onClick={() => setSelectedPlayer(player)}
                          data-testid={`player-card-${player.id}`}
                        >
                          <div>
                            <div className="font-semibold">{player.name}</div>
                            <div className="text-sm text-red-200">#{player.jersey}</div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${getAlertColor(player.alertLevel)} text-white`}
                          >
                            {player.alertLevel}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="drills" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Drill Analysis
                </CardTitle>
                <CardDescription className="text-red-200">
                  Health monitoring through practice drills and athletic performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {defensivePlayers.filter(p => p.drillPerformanceDecline).map((player) => (
                    <div key={player.id} className="p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{player.name}</h4>
                          <p className="text-sm text-red-200">{player.position} • #{player.jersey}</p>
                        </div>
                        <Badge variant="secondary" className="bg-orange-500 text-white">
                          Decline
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>40-Yard Time:</span>
                          <span className="text-orange-300">{player.fortyYardDash}s ↑</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Agility Score:</span>
                          <span className="text-orange-300">{player.agilityScore}/100 ↓</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reaction Time:</span>
                          <span className="text-orange-300">{player.reactionTime}ms ↑</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recovery Rate:</span>
                          <span className="text-orange-300">{player.recoveryRate}% ↓</span>
                        </div>
                      </div>
                      {player.compensatoryMovements && (
                        <Alert className="mt-3 border-red-500 bg-red-500/10">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Compensatory movement patterns detected
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trainer" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Athletic Trainer Dashboard
                </CardTitle>
                <CardDescription className="text-red-200">
                  Medical oversight and intervention tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Pending Reviews */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Pending Medical Reviews</h3>
                    <div className="space-y-3">
                      {athleticTrainerReviews.map((player) => (
                        <div key={player.id} className="p-3 bg-blue-500/20 rounded border border-blue-500/30">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold">{player.name}</div>
                              <div className="text-sm text-blue-200">{player.position} • #{player.jersey}</div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-500 text-white">
                              Review
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <div className="text-blue-200 mb-1">Status:</div>
                            <div>{player.athleticTrainerNotes}</div>
                            <div className="text-blue-200 mt-2 text-xs">
                              Last Check: {player.lastMedicalCheck.toLocaleDateString()}
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            className="mt-2 bg-blue-600 hover:bg-blue-700"
                            data-testid={`button-medical-review-${player.id}`}
                          >
                            Schedule Evaluation
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High Risk Players */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">High Risk Monitoring</h3>
                    <div className="space-y-3">
                      {defensivePlayers
                        .filter(p => p.injuryRiskScore > 7)
                        .map((player) => (
                          <div key={player.id} className="p-3 bg-red-500/20 rounded border border-red-500/30">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold">{player.name}</div>
                                <div className="text-sm text-red-200">{player.position}</div>
                              </div>
                              <Badge variant="secondary" className="bg-red-500 text-white">
                                High Risk
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span>Risk Score:</span>
                                <span className="text-red-300">{player.injuryRiskScore.toFixed(1)}/10</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Performance Trend:</span>
                                <span className={player.weeklyPerformanceTrend < 0 ? "text-red-300" : "text-green-300"}>
                                  {player.weeklyPerformanceTrend > 0 ? '+' : ''}{player.weeklyPerformanceTrend.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              className="mt-2 bg-red-600 hover:bg-red-700"
                              data-testid={`button-intervention-${player.id}`}
                            >
                              Medical Intervention
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  HIPAA Compliance Dashboard
                </CardTitle>
                <CardDescription className="text-red-200">
                  Protected health information management and audit trail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Privacy Controls */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                        <h4 className="font-semibold mb-2">✓ Data Encryption</h4>
                        <p className="text-sm text-green-200">
                          All health data encrypted at rest and in transit using AES-256
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                        <h4 className="font-semibold mb-2">✓ Access Controls</h4>
                        <p className="text-sm text-green-200">
                          Role-based access: Athletic Trainer, Coach, Parent/Guardian only
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                        <h4 className="font-semibold mb-2">✓ Audit Logging</h4>
                        <p className="text-sm text-green-200">
                          Complete audit trail of all health data access and modifications
                        </p>
                      </div>
                      
                      <div className="p-3 bg-green-500/20 rounded border border-green-500/30">
                        <h4 className="font-semibold mb-2">✓ Data Retention</h4>
                        <p className="text-sm text-green-200">
                          Automatic purging of health records per district policy (7 years)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Consent Management */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Consent Management</h3>
                    <div className="space-y-3">
                      {defensivePlayers.slice(0, 6).map((player) => (
                        <div key={player.id} className="p-3 bg-blue-500/20 rounded border border-blue-500/30">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-semibold">{player.name}</div>
                              <div className="text-sm text-blue-200">#{player.jersey} • {player.position}</div>
                            </div>
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              Consented
                            </Badge>
                          </div>
                          <div className="text-xs text-blue-200">
                            Parent/Guardian: John & Mary {player.name.split(' ')[1]}<br/>
                            Consent Date: {new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}<br/>
                            Medical Release: Active
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Compliance Summary */}
                <div className="mt-6 p-4 bg-green-900/30 rounded-lg border border-green-500/30">
                  <h3 className="text-lg font-semibold mb-3">Compliance Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-300">100%</div>
                      <div className="text-sm text-green-200">Consented Athletes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-300">256-bit</div>
                      <div className="text-sm text-green-200">Encryption Level</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-300">0</div>
                      <div className="text-sm text-green-200">Compliance Violations</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-300">24/7</div>
                      <div className="text-sm text-green-200">Audit Monitoring</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Capabilities */}
        <Card className="mt-8 bg-red-900/30 backdrop-blur-sm border-red-500/30 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Beyond Counting Stats: Comprehensive Health Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Performance Drills Integration</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• 40-yard dash trend analysis</li>
                  <li>• Agility drill performance</li>
                  <li>• Reaction time monitoring</li>
                  <li>• Strength test tracking</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Position-Specific Health</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• Defensive end conditioning</li>
                  <li>• Linebacker mobility tracking</li>
                  <li>• Secondary speed analysis</li>
                  <li>• D-line strength monitoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Athletic Trainer Workflow</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• Medical intervention alerts</li>
                  <li>• Injury risk predictions</li>
                  <li>• Recovery tracking</li>
                  <li>• PT progress monitoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">HIPAA Compliance</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• Encrypted health data</li>
                  <li>• Parent/guardian consent</li>
                  <li>• Access audit trails</li>
                  <li>• Privacy controls</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}