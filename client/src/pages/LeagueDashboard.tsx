import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, 
  Users, 
  Share2, 
  Mail, 
  Copy, 
  Settings, 
  Calendar,
  Crown,
  UserPlus,
  Link as LinkIcon,
  CheckCircle,
  Clock
} from "lucide-react";
import { useFantasyAuth } from "@/hooks/useFantasyAuth";
import { useToast } from "@/hooks/use-toast";

interface LeagueData {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  status: 'draft' | 'active' | 'completed';
  participantCount: number;
  maxParticipants: number;
  currentWeek: number;
  seasonStarted: boolean;
}

interface Participant {
  id: string;
  email: string;
  displayName: string;
  joinedAt: string;
  isOwner: boolean;
  isActive: boolean;
  wins: number;
  losses: number;
}

export default function LeagueDashboard() {
  const params = useParams();
  const leagueId = params.id;
  const { fantasyUser, isFantasyAuthenticated } = useFantasyAuth();
  const { toast } = useToast();
  
  const [leagueData, setLeagueData] = useState<LeagueData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockLeague: LeagueData = {
        id: leagueId || "league-123",
        name: "Office Champions Survivor Pool",
        description: "Family fun league",
        createdBy: fantasyUser?.email || "user@example.com",
        createdAt: new Date().toISOString(),
        status: 'draft',
        participantCount: 1,
        maxParticipants: 50,
        currentWeek: 1,
        seasonStarted: false
      };

      const mockParticipants: Participant[] = [
        {
          id: "1",
          email: fantasyUser?.email || "user@example.com",
          displayName: fantasyUser?.email?.split('@')[0] || "You",
          joinedAt: new Date().toISOString(),
          isOwner: true,
          isActive: true,
          wins: 0,
          losses: 0
        }
      ];

      setLeagueData(mockLeague);
      setParticipants(mockParticipants);
      setIsLoading(false);
    }, 1000);
  }, [leagueId, fantasyUser]);

  const inviteLink = `${window.location.origin}/fantasy/join/${leagueId}`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied!",
      description: "Invite link copied to clipboard",
    });
  };

  const sendEmailInvite = () => {
    if (!inviteEmail) return;
    
    // Mock email invite
    toast({
      title: "Invite Sent!",
      description: `Invitation sent to ${inviteEmail}`,
    });
    
    setInviteEmail("");
    setShowInviteModal(false);
  };

  const startSeason = () => {
    if (!leagueData) return;
    
    toast({
      title: "🏈 Season Started!",
      description: "Week 1 picks are now open for all participants",
    });
    
    setLeagueData({
      ...leagueData,
      status: 'active',
      seasonStarted: true
    });
  };

  if (!isFantasyAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>You need to be logged in to view this league</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading your league...</p>
        </div>
      </div>
    );
  }

  if (!leagueData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">League Not Found</CardTitle>
            <CardDescription>The league you're looking for doesn't exist</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isOwner = participants.some(p => p.email === fantasyUser?.email && p.isOwner);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Trophy className="h-8 w-8 text-green-600 mr-3" />
                {leagueData.name}
              </h1>
              <p className="text-gray-600">{leagueData.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>Created by {leagueData.createdBy}</span>
                <span>•</span>
                <span>{new Date(leagueData.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant={leagueData.status === 'active' ? 'default' : 'secondary'}
                className={leagueData.status === 'active' ? 'bg-green-600' : ''}
              >
                {leagueData.status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                {leagueData.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                {leagueData.status.charAt(0).toUpperCase() + leagueData.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* League Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  League Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{leagueData.participantCount}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{leagueData.currentWeek}</div>
                    <div className="text-sm text-gray-600">Current Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">FREE</div>
                    <div className="text-sm text-gray-600">Entry Fee</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">🏆</div>
                    <div className="text-sm text-gray-600">Bragging Rights</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NFL Survivor Rules */}
            <Card>
              <CardHeader>
                <CardTitle>🏈 NFL Survivor Pool Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Pick one NFL team each week to win their game</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />You can only use each team ONCE per season</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />If your team loses, you're eliminated</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" />Last person standing wins!</li>
                  <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-600 mr-2" /><strong>100% FREE - No gambling or entry fees</strong></li>
                </ul>
              </CardContent>
            </Card>

            {/* Participants List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Participants ({participants.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {participant.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{participant.displayName}</span>
                            {participant.isOwner && <Crown className="h-4 w-4 text-yellow-600" />}
                          </div>
                          <div className="text-sm text-gray-600">{participant.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">Record: {participant.wins}-{participant.losses}</div>
                        <div className="text-xs text-gray-500">
                          Joined {new Date(participant.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Invite Friends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite Friends
                </CardTitle>
                <CardDescription>
                  Share this FREE league with your friends
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="text-xs"
                    data-testid="invite-link"
                  />
                  <Button size="sm" onClick={copyInviteLink} data-testid="copy-link">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline" data-testid="email-invite">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email Invite
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Email Invitation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="friend@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        data-testid="invite-email-input"
                      />
                      <Button onClick={sendEmailInvite} className="w-full" data-testid="send-invite">
                        Send Invite
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* League Controls */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    League Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!leagueData.seasonStarted ? (
                    <Button
                      onClick={startSeason}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="start-season"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Start NFL Season
                    </Button>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800">Season Active!</p>
                      <p className="text-xs text-gray-600">Week {leagueData.currentWeek} picks are open</p>
                    </div>
                  )}
                  
                  <div className="border-t my-3" />
                  
                  <Button variant="outline" size="sm" className="w-full" data-testid="league-settings">
                    <Settings className="h-4 w-4 mr-2" />
                    League Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>League ID:</span>
                    <span className="font-mono text-xs">{leagueData.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Participants:</span>
                    <span>{leagueData.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Week:</span>
                    <span>Week {leagueData.currentWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entry Fee:</span>
                    <span className="text-green-600 font-semibold">FREE! 🎉</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}