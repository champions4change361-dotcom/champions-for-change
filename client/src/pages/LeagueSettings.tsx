import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Settings, 
  Save, 
  Users, 
  Clock, 
  Shield, 
  RotateCcw,
  UserCheck,
  Crown,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useFantasyAuth } from "@/hooks/useFantasyAuth";
import { useToast } from "@/hooks/use-toast";

interface EliminatedPlayer {
  id: string;
  email: string;
  displayName: string;
  eliminatedWeek: number;
  eliminatedBy: string; // Team that caused elimination
  canGetSecondChance: boolean;
  hasSecondChance: boolean;
}

interface LeagueSettings {
  leagueName: string;
  description: string;
  maxParticipants: number;
  pickDeadline: string;
  startWeek: number;
  isPrivate: boolean;
  secondChanceEnabled: boolean;
  secondChanceRules: string;
}

export default function LeagueSettings() {
  const params = useParams();
  const leagueId = params.id;
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<LeagueSettings>({
    leagueName: "House Rules",
    description: "Family fun league",
    maxParticipants: 50,
    pickDeadline: "sunday-1pm",
    startWeek: 1,
    isPrivate: false,
    secondChanceEnabled: true,
    secondChanceRules: "Commissioner discretion - eliminated players can re-enter mid-season with fresh team choices"
  });

  const [eliminatedPlayers, setEliminatedPlayers] = useState<EliminatedPlayer[]>([
    {
      id: "player-2",
      email: "sarah@example.com", 
      displayName: "Sarah",
      eliminatedWeek: 3,
      eliminatedBy: "Detroit Lions",
      canGetSecondChance: true,
      hasSecondChance: false
    },
    {
      id: "player-3",
      email: "mike@example.com",
      displayName: "Mike", 
      eliminatedWeek: 5,
      eliminatedBy: "Cleveland Browns",
      canGetSecondChance: true,
      hasSecondChance: false
    }
  ]);

  const [showSecondChanceModal, setShowSecondChanceModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<EliminatedPlayer | null>(null);

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved!",
      description: "League settings have been updated successfully",
    });
  };

  const giveSecondChance = (player: EliminatedPlayer) => {
    // Update the player to have second chance status
    setEliminatedPlayers(prev => 
      prev.map(p => 
        p.id === player.id 
          ? { ...p, hasSecondChance: true, canGetSecondChance: false }
          : p
      )
    );

    toast({
      title: "🔄 Second Chance Given!",
      description: `${player.displayName} has been re-entered into the league with a fresh team slate`,
    });

    setShowSecondChanceModal(false);
    setSelectedPlayer(null);
  };

  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You need to be logged in to view league settings</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Settings className="h-8 w-8 text-green-600 mr-3" />
            League Settings
          </h1>
          <p className="text-gray-600">Manage your "{settings.leagueName}" survivor league</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Basic League Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="league-name">League Name</Label>
                    <Input
                      id="league-name"
                      value={settings.leagueName}
                      onChange={(e) => setSettings({...settings, leagueName: e.target.value})}
                      data-testid="league-name-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-participants">Max Participants</Label>
                    <Select
                      value={settings.maxParticipants.toString()}
                      onValueChange={(value) => setSettings({...settings, maxParticipants: parseInt(value)})}
                    >
                      <SelectTrigger data-testid="max-participants-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 People</SelectItem>
                        <SelectItem value="25">25 People</SelectItem>
                        <SelectItem value="50">50 People</SelectItem>
                        <SelectItem value="100">100 People</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">League Description</Label>
                  <Input
                    id="description"
                    value={settings.description}
                    onChange={(e) => setSettings({...settings, description: e.target.value})}
                    placeholder="e.g., Family competition, Office league, Friends group"
                    data-testid="league-description-input"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Game Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Game Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pick-deadline">Pick Deadline</Label>
                    <Select
                      value={settings.pickDeadline}
                      onValueChange={(value) => setSettings({...settings, pickDeadline: value})}
                    >
                      <SelectTrigger data-testid="pick-deadline-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saturday-8pm">Saturday 8:00 PM EST</SelectItem>
                        <SelectItem value="sunday-1pm">Sunday 1:00 PM EST (Standard)</SelectItem>
                        <SelectItem value="sunday-12pm">Sunday 12:00 PM EST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start-week">Season Start Week</Label>
                    <Select
                      value={settings.startWeek.toString()}
                      onValueChange={(value) => setSettings({...settings, startWeek: parseInt(value)})}
                    >
                      <SelectTrigger data-testid="start-week-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Week 1 (Season Start)</SelectItem>
                        <SelectItem value="2">Week 2</SelectItem>
                        <SelectItem value="3">Week 3</SelectItem>
                        <SelectItem value="4">Week 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Second Chance Settings */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RotateCcw className="h-5 w-5 mr-2 text-orange-600" />
                  Second Chance Survivor
                </CardTitle>
                <CardDescription>
                  Allow eliminated players to re-enter mid-season (Commissioner discretion)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="second-chance-enabled" className="text-base font-medium">
                      Enable Second Chance
                    </Label>
                    <p className="text-sm text-gray-600">Eliminated players can be given a fresh start</p>
                  </div>
                  <Switch
                    id="second-chance-enabled"
                    checked={settings.secondChanceEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, secondChanceEnabled: checked})}
                    data-testid="second-chance-toggle"
                  />
                </div>
                
                {settings.secondChanceEnabled && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">🔄 How Second Chance Works</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Eliminated players can be re-entered by commissioner</li>
                      <li>• They get ALL 32 teams to choose from again</li>
                      <li>• They receive a "Second Chance" badge for transparency</li>
                      <li>• Original survivors still have advantage (fewer teams available)</li>
                      <li>• <strong>100% FREE - No additional fees</strong></li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="private-league" className="text-sm font-medium">
                      Private League
                    </Label>
                    <p className="text-xs text-gray-600">Invite-only vs public join</p>
                  </div>
                  <Switch
                    id="private-league"
                    checked={settings.isPrivate}
                    onCheckedChange={(checked) => setSettings({...settings, isPrivate: checked})}
                    data-testid="private-league-toggle"
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  {settings.isPrivate 
                    ? "🔒 Only people with invite links can join" 
                    : "🌍 Anyone with the link can join"
                  }
                </div>
              </CardContent>
            </Card>

            {/* Eliminated Players - Second Chance Management */}
            {settings.secondChanceEnabled && eliminatedPlayers.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-orange-600" />
                    Eliminated Players
                  </CardTitle>
                  <CardDescription>
                    Give second chances to eliminated players
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eliminatedPlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{player.displayName}</span>
                            {player.hasSecondChance && (
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                                🔄 Second Chance
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            Eliminated Week {player.eliminatedWeek} by {player.eliminatedBy}
                          </div>
                        </div>
                        
                        {player.canGetSecondChance && !player.hasSecondChance ? (
                          <Dialog open={showSecondChanceModal && selectedPlayer?.id === player.id} 
                                  onOpenChange={(open) => {
                                    setShowSecondChanceModal(open);
                                    if (!open) setSelectedPlayer(null);
                                  }}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                onClick={() => setSelectedPlayer(player)}
                                data-testid={`give-second-chance-${player.id}`}
                              >
                                Give 2nd Chance
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>🔄 Give Second Chance</DialogTitle>
                                <DialogDescription>
                                  Re-enter {player.displayName} into the survivor league?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <h4 className="font-semibold text-green-800 mb-2">What happens:</h4>
                                  <ul className="text-sm text-green-700 space-y-1">
                                    <li>✅ {player.displayName} can pick from all 32 NFL teams again</li>
                                    <li>✅ Gets a "Second Chance Survivor" badge</li>
                                    <li>✅ Re-enters current week with fresh slate</li>
                                    <li>✅ 100% transparent to other players</li>
                                  </ul>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={() => giveSecondChance(player)}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                                    data-testid="confirm-second-chance"
                                  >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Give Second Chance
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setShowSecondChanceModal(false)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {player.hasSecondChance ? "🔄 Active" : "✅ Used"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                <Button 
                  onClick={handleSaveSettings}
                  className="w-full bg-green-600 hover:bg-green-700"
                  data-testid="save-settings"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save All Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}