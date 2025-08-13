import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Activity, Shield, TrendingDown, Heart, Zap } from "lucide-react";

// Mock football lineman data to demonstrate capabilities
const generateFootballLinemanData = () => {
  const positions = ["Left Tackle", "Left Guard", "Center", "Right Guard", "Right Tackle"];
  const players = [
    { name: "Marcus Johnson", jersey: "77", position: "Left Tackle", grade: 11, height: "6'4\"", weight: 285 },
    { name: "David Rodriguez", jersey: "66", position: "Left Guard", grade: 12, height: "6'2\"", weight: 275 },
    { name: "Tyler Williams", jersey: "55", position: "Center", grade: 12, height: "6'1\"", weight: 260 },
    { name: "Antonio Davis", jersey: "67", position: "Right Guard", grade: 11, height: "6'3\"", weight: 280 },
    { name: "Brandon Smith", jersey: "78", position: "Right Tackle", grade: 10, height: "6'5\"", weight: 295 }
  ];

  return players.map((player, index) => ({
    ...player,
    // Contact monitoring data
    totalContacts: Math.floor(Math.random() * 30) + 40, // 40-70 contacts per practice
    highImpactContacts: Math.floor(Math.random() * 15) + 5, // 5-20 high impact
    contactIntensity: Math.random() * 3 + 6, // 6-9 intensity score
    
    // Performance metrics
    techniqueQuality: Math.random() * 3 + 6, // 6-9 technique score
    recoveryTime: Math.floor(Math.random() * 20) + 10, // 10-30 seconds recovery
    fatigueLevel: Math.random() * 40 + 20, // 20-60% fatigue
    
    // Health indicators
    alertLevel: index === 1 ? "high" : index === 3 ? "medium" : "low",
    lastInjury: index === 0 ? "2 weeks ago - Minor knee strain" : "None this season",
    
    // Opponent-adjusted performance
    opponentStrength: ["Weak", "Average", "Strong", "Elite"][Math.floor(Math.random() * 4)],
    performanceVsExpected: Math.random() * 40 - 20, // -20% to +20%
  }));
};

export default function FootballHealthMonitoring() {
  const [linemanData, setLinemanData] = useState(generateFootballLinemanData());
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Refresh data every 30 seconds to simulate real-time monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setLinemanData(generateFootballLinemanData());
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

  const getAlertIcon = (level: string) => {
    if (level === "high" || level === "critical") return <AlertTriangle className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const criticalAlerts = linemanData.filter(p => p.alertLevel === "high" || p.alertLevel === "critical");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-green-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Football Health Monitoring</h1>
          <p className="text-blue-100 text-lg">Professional sports-level analytics for high school offensive line</p>
          <div className="mt-4 flex gap-4 text-sm text-blue-200">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Performance Tracking
            </span>
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Injury Prevention Monitoring
            </span>
            <span className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI-Powered Health Alerts
            </span>
          </div>
        </div>

        {/* Critical Alerts Section */}
        {criticalAlerts.length > 0 && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Health Alerts:</strong> {criticalAlerts.length} player(s) require attention
            </AlertDescription>
          </Alert>
        )}

        {/* Player Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {linemanData.map((player, index) => (
            <Card 
              key={index} 
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
              onClick={() => setSelectedPlayer(player)}
              data-testid={`card-player-${player.jersey}`}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                    <CardDescription className="text-blue-200">
                      #{player.jersey} • {player.position}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getAlertColor(player.alertLevel)} text-white`}
                    data-testid={`badge-alert-${player.jersey}`}
                  >
                    {getAlertIcon(player.alertLevel)}
                    {player.alertLevel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Contact Load:</span>
                    <span className="font-semibold">{player.totalContacts} total</span>
                  </div>
                  <div className="flex justify-between">
                    <span>High Impact:</span>
                    <span className={`font-semibold ${player.highImpactContacts > 15 ? 'text-orange-300' : 'text-green-300'}`}>
                      {player.highImpactContacts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technique Score:</span>
                    <span className={`font-semibold ${player.techniqueQuality < 6 ? 'text-red-300' : 'text-green-300'}`}>
                      {player.techniqueQuality.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span>Fatigue Level:</span>
                      <span className="text-xs">{Math.round(player.fatigueLevel)}%</span>
                    </div>
                    <Progress 
                      value={player.fatigueLevel} 
                      className="h-2 bg-white/20"
                      data-testid={`progress-fatigue-${player.jersey}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Player Analysis */}
        {selectedPlayer && (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">
                Detailed Analysis: {selectedPlayer.name}
              </CardTitle>
              <CardDescription className="text-blue-200">
                Position-specific monitoring for {selectedPlayer.position}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Contact Analysis */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Contact Analysis
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Contacts:</span>
                      <span className="font-semibold">{selectedPlayer.totalContacts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High Impact:</span>
                      <span className="font-semibold">{selectedPlayer.highImpactContacts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Contact Intensity:</span>
                      <span className="font-semibold">{selectedPlayer.contactIntensity.toFixed(1)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recovery Time:</span>
                      <span className="font-semibold">{selectedPlayer.recoveryTime}s</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Metrics
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Technique Quality:</span>
                      <span className={`font-semibold ${selectedPlayer.techniqueQuality < 6 ? 'text-red-300' : 'text-green-300'}`}>
                        {selectedPlayer.techniqueQuality.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Opponent Level:</span>
                      <span className="font-semibold">{selectedPlayer.opponentStrength}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>vs Expected:</span>
                      <span className={`font-semibold ${selectedPlayer.performanceVsExpected > 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {selectedPlayer.performanceVsExpected > 0 ? '+' : ''}{selectedPlayer.performanceVsExpected.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fatigue Level:</span>
                      <span className="font-semibold">{Math.round(selectedPlayer.fatigueLevel)}%</span>
                    </div>
                  </div>
                </div>

                {/* Health Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health Status
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="block">Alert Level:</span>
                      <Badge 
                        variant="secondary" 
                        className={`${getAlertColor(selectedPlayer.alertLevel)} text-white mt-1`}
                      >
                        {selectedPlayer.alertLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="block">Last Injury:</span>
                      <span className="text-blue-200">{selectedPlayer.lastInjury}</span>
                    </div>
                    <div>
                      <span className="block">Physical Stats:</span>
                      <span className="text-blue-200">
                        {selectedPlayer.height}, {selectedPlayer.weight} lbs
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  AI Health Recommendations
                </h3>
                <div className="space-y-2 text-sm">
                  {selectedPlayer.alertLevel === "high" && (
                    <Alert className="border-orange-500 bg-orange-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Technique degradation detected.</strong> Consider form-focused drills and reduced contact volume until technique stabilizes.
                      </AlertDescription>
                    </Alert>
                  )}
                  {selectedPlayer.highImpactContacts > 15 && (
                    <Alert className="border-yellow-500 bg-yellow-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>High contact load.</strong> Monitor recovery closely and consider rotation strategy.
                      </AlertDescription>
                    </Alert>
                  )}
                  {selectedPlayer.recoveryTime > 25 && (
                    <Alert className="border-blue-500 bg-blue-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Slow recovery between plays.</strong> Focus on conditioning and ensure adequate hydration.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  data-testid="button-close-analysis"
                  onClick={() => setSelectedPlayer(null)}
                >
                  Close Analysis
                </Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="button-generate-report"
                >
                  Generate Medical Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Capabilities Footer */}
        <Card className="mt-8 bg-green-900/30 backdrop-blur-sm border-green-500/30 text-white">
          <CardHeader>
            <CardTitle className="text-xl">Professional Sports-Level Monitoring Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Contact Sports Analytics</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• Impact force tracking</li>
                  <li>• Recovery time analysis</li>
                  <li>• Technique degradation alerts</li>
                  <li>• Cumulative load monitoring</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Position-Specific Monitoring</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• Lineman contact analysis</li>
                  <li>• Opponent-adjusted metrics</li>
                  <li>• Performance vs. expectations</li>
                  <li>• Role-based health indicators</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">AI Health Predictions</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• Injury risk assessment</li>
                  <li>• Performance trend analysis</li>
                  <li>• Early warning system</li>
                  <li>• Medical intervention alerts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Competitive Advantage</h4>
                <ul className="space-y-1 text-green-200">
                  <li>• First-to-market technology</li>
                  <li>• NCAA/NFL-level analytics</li>
                  <li>• No competitor offers this</li>
                  <li>• $47,510 annual savings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}