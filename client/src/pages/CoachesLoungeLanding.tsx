// 🎮 COACHES LOUNGE LANDING PAGE - CLEAR LEGAL MESSAGING
// Sports + Gaming + Community Platform with Educational Mission

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Trophy, 
  Users, 
  Heart, 
  Shield, 
  GraduationCap,
  Code,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap,
  Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { LeagueJoinForm } from '@/components/LeagueJoinForm';

export default function CoachesLoungeLanding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loginCode, setLoginCode] = useState('');
  const [showDonation, setShowDonation] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessingDonation, setIsProcessingDonation] = useState(false);
  const [selectedLeagueType, setSelectedLeagueType] = useState<string | null>(null);

  // Join league mutation
  const joinLeagueMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('POST', '/api/leagues/join', { code });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Welcome to the League!",
        description: `Successfully joined ${data.leagueName || 'the league'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Invalid Code",
        description: "Please check your commissioner code and try again.",
        variant: "destructive",
      });
    }
  });

  // Create league mutation
  const createLeagueMutation = useMutation({
    mutationFn: async (leagueType: string) => {
      return await apiRequest('POST', '/api/leagues/create', { type: leagueType });
    },
    onSuccess: (data: any) => {
      toast({
        title: "League Created!",
        description: `Your ${selectedLeagueType} league is ready. Share code: ${data.registrationCode || 'LEAGUE123'}`,
      });
    }
  });

  const handleJoinLeague = () => {
    if (!loginCode.trim()) return;
    joinLeagueMutation.mutate(loginCode);
  };

  const handleCreateLeague = (type: string) => {
    setSelectedLeagueType(type);
    createLeagueMutation.mutate(type);
  };

  const handleDonation = async () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (!amount || amount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Please select an amount of $5 or more.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingDonation(true);
    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: amount,
          description: `Donation to Champions for Change - Educational Trips`
        }),
      });

      if (!response.ok) {
        throw new Error('Payment setup failed');
      }

      const { clientSecret } = await response.json();
      
      // Redirect to checkout page with client secret
      window.location.href = `/checkout?client_secret=${clientSecret}&amount=${amount}&type=donation`;
      
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Unable to process donation. Please try again.",
        variant: "destructive",
      });
      setIsProcessingDonation(false);
    }
  };

  const leagueTypes = [
    { id: 'fantasy-sports', label: 'Fantasy Sports', icon: Trophy, color: 'orange' },
    { id: 'gaming', label: 'Gaming League', icon: Gamepad2, color: 'green' },
    { id: 'office', label: 'Office Challenge', icon: Code, color: 'blue' },
    { id: 'custom', label: 'Custom League', icon: Users, color: 'purple' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-green-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Coaches Lounge</h1>
                <p className="text-purple-200 text-sm">Where Competition Meets Community</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 text-white px-4 py-2">
                Supporting Education
              </Badge>
              {user && (
                <Badge variant="secondary" className="bg-white/10 text-white">
                  Welcome, {user.firstName || 'Coach'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission & Legal Clarity */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Shield className="h-5 w-5" />
              Important: We Are NOT a Gambling Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Coaches Lounge is a community platform for friends and colleagues</strong>
                <br />
                We provide tools for organizing competitions, tracking scores, and having fun together.
                Any rewards, prizes, or friendly wagers are agreements between commissioners and players - 
                not facilitated by our platform.
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 p-4 rounded-lg border border-green-200">
                <h4 className="flex items-center gap-2 font-semibold text-green-100 mb-2">
                  <GraduationCap className="h-4 w-4" />
                  Our Educational Mission
                </h4>
                <p className="text-green-200 text-sm mb-3">
                  Every platform supports Champions for Change - funding educational trips 
                  for underprivileged student competitors. Donations are voluntary but greatly appreciated!
                </p>
                
                {!showDonation ? (
                  <Button 
                    onClick={() => setShowDonation(true)}
                    variant="outline" 
                    className="w-full border-green-300 text-black hover:bg-green-50"
                    data-testid="button-show-donation"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Support Student Education
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-1">
                      {[5, 10, 25, 50].map(amount => (
                        <Button 
                          key={amount}
                          size="sm" 
                          variant={selectedAmount === amount ? "default" : "outline"}
                          className={selectedAmount === amount 
                            ? "text-xs bg-green-600 text-white hover:bg-green-700" 
                            : "text-xs border-green-300 text-green-700 hover:bg-green-50"
                          }
                          onClick={() => {
                            setSelectedAmount(amount);
                            setCustomAmount('');
                          }}
                          data-testid={`button-donate-${amount}`}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        min="5"
                        placeholder="Custom ($5 min)"
                        value={customAmount}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCustomAmount(value);
                          if (value && parseInt(value) >= 5) {
                            setSelectedAmount(null);
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={(!selectedAmount && (!customAmount || parseInt(customAmount) < 5)) || isProcessingDonation}
                      onClick={handleDonation}
                      data-testid="button-donate-now"
                    >
                      <Heart className="mr-2 h-3 w-3" />
                      {isProcessingDonation 
                        ? 'Processing...' 
                        : `Donate $${selectedAmount || customAmount || '0'} to Champions for Change`
                      }
                    </Button>
                    <p className="text-xs text-green-200 text-center">100% goes to student educational trips</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h4 className="flex items-center gap-2 font-semibold text-purple-900 mb-2">
                  <Users className="h-4 w-4" />
                  What We Offer
                </h4>
                <ul className="text-purple-800 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <Trophy className="h-3 w-3" />
                    Fantasy Sports Leagues (NFL, NBA)
                  </li>
                  <li className="flex items-center gap-2">
                    <Gamepad2 className="h-3 w-3" />
                    Video Gaming Tournaments
                  </li>
                  <li className="flex items-center gap-2">
                    <Code className="h-3 w-3" />
                    Office Competitions & Challenges
                  </li>
                  <li className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Custom League Management
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured: Fantasy Coaching AI */}
        <Card className="mb-8 bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Brain className="h-6 w-6" />
              🧠 KEYSTONE AI FANTASY COACHING BRAIN
            </CardTitle>
            <CardDescription className="text-purple-700">
              The smartest fantasy coaching system ever built - Get AI insights like "Jahmyr Gibbs runs left 75% of the time"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Player tendency analysis & defensive matchup insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Real-time coaching during games with confidence scores</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Educational tool - Professional sports data only (Texas compliant)</span>
              </div>
              <Button 
                onClick={() => {
                  console.log('Navigating to Fantasy Coaching AI...');
                  setLocation('/fantasy-coaching');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                data-testid="access-fantasy-coaching-button"
              >
                <Brain className="h-4 w-4 mr-2" />
                Access Fantasy Coaching AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Login Options */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Commissioner Code Login */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Join Existing League
              </CardTitle>
              <CardDescription>
                Enter your commissioner's registration code to join a league
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="loginCode">Commissioner Registration Code</Label>
                <Input 
                  id="loginCode"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  placeholder="e.g., COACH2024-ABC123"
                  className="text-center font-mono text-lg tracking-wider"
                  data-testid="input-login-code"
                />
              </div>
              
              <Button 
                disabled={!loginCode || joinLeagueMutation.isPending}
                onClick={handleJoinLeague}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
                data-testid="button-join-league"
              >
                {joinLeagueMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <ChevronRight className="mr-2 h-4 w-4" />
                    Join League
                  </>
                )}
              </Button>
              
              <p className="text-xs text-gray-600 text-center">
                Don't have a code? Ask your league commissioner or create your own below.
              </p>
            </CardContent>
          </Card>

          {/* Create New League */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                Create New League
              </CardTitle>
              <CardDescription>
                Become a commissioner and set up your own competitions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {leagueTypes.map(({ id, label, icon: Icon, color }) => (
                  <Button 
                    key={id}
                    variant="outline" 
                    className={`border-${color}-200 text-${color}-700 hover:bg-${color}-50`}
                    onClick={() => handleCreateLeague(id)}
                    disabled={createLeagueMutation.isPending}
                    data-testid={`button-create-${id}`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
                disabled={createLeagueMutation.isPending}
                onClick={() => handleCreateLeague('general')}
                data-testid="button-start-commissioner"
              >
                {createLeagueMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating League...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Start Commissioner Setup
                  </>
                )}
              </Button>
              
              <Alert>
                <GraduationCap className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Free to create!</strong> Commissioners can invite unlimited players. 
                  Optional donations support educational trips.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-300">
                <Trophy className="h-5 w-5" />
                Fantasy Sports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-200">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  NFL Survivor Pools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  NBA Fantasy Leagues
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Season-long competitions
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  Live score tracking
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-blue-400" />
                  Custom scoring rules
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Gamepad2 className="h-5 w-5" />
                Gaming Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-200">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Video game competitions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Bracket tournaments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Leaderboards
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  Multiple game support
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-blue-400" />
                  Team & solo events
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-300">
                <Users className="h-5 w-5" />
                Community Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-200">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Private leagues
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Commissioner controls
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Player invitations
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  Chat & messaging
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-blue-400" />
                  Achievement tracking
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Mission Statement */}
        <Card className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-sm border-green-400/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <GraduationCap className="h-5 w-5" />
              Our Educational Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-lg text-white mb-4">
                Every fantasy league and tournament on our platform directly supports educational opportunities for underprivileged youth.
              </p>
              <p className="text-sm text-gray-300">
                We believe competition and education go hand in hand. Your participation helps fund student trips, 
                educational experiences, and opportunities that inspire learning and broaden horizons.
              </p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-green-400">$2,600+</div>
                  <div className="text-sm text-gray-300">Per Student Trip</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-blue-400">100%</div>
                  <div className="text-sm text-gray-300">Revenue to Education</div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <div className="text-2xl font-bold text-yellow-400">Future</div>
                  <div className="text-sm text-gray-300">Impact Stories</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Legal */}
        <div className="mt-12 text-center">
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <p className="text-white/80 text-sm mb-4">
              <strong>Legal Notice:</strong> Coaches Lounge facilitates competition organization and score tracking only. 
              We do not process gambling transactions, hold funds, or facilitate betting. Any prizes or rewards are 
              arranged directly between league participants.
            </p>
            <p className="text-white/60 text-xs">
              Platform operated by Champions for Change nonprofit (EIN: pending) • 
              Educational mission: funding student trips for underprivileged youth • 
              Questions? Contact champions4change361@gmail.com
            </p>
            <div className="flex justify-center gap-4 mt-4 text-xs text-white/50">
              <Link href="/privacy" className="hover:text-white/80">Privacy Policy</Link>
              <Link href="/refund-policy" className="hover:text-white/80">Refund Policy</Link>
              <Link href="/terms" className="hover:text-white/80">Terms of Service</Link>
              <Link href="/support" className="hover:text-white/80">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}