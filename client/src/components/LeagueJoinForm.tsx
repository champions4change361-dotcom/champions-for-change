import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Trophy, 
  Crown, 
  ArrowRight,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function LeagueJoinForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [registrationCode, setRegistrationCode] = useState('');
  const [joinedLeague, setJoinedLeague] = useState<any>(null);

  const joinLeagueMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('POST', '/api/commissioner/join-league', { 
        registrationCode: code 
      });
    },
    onSuccess: (data) => {
      setJoinedLeague(data.league);
      toast({
        title: "Successfully Joined League!",
        description: `Welcome to ${data.league.name}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Join League",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleJoinLeague = () => {
    if (!registrationCode.trim()) {
      toast({
        title: "Registration Code Required",
        description: "Please enter a valid registration code",
        variant: "destructive",
      });
      return;
    }

    // Validate code format
    const codePattern = /^COACH\d{4}-[A-Z0-9]{6,10}$/;
    if (!codePattern.test(registrationCode.toUpperCase())) {
      toast({
        title: "Invalid Code Format",
        description: "Registration codes should be in format: COACH2024-XXXXXX",
        variant: "destructive",
      });
      return;
    }

    joinLeagueMutation.mutate(registrationCode.toUpperCase());
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: "Registration code copied to clipboard",
    });
  };

  if (joinedLeague) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-6 w-6" />
            Successfully Joined League!
          </CardTitle>
          <CardDescription className="text-green-700">
            You're now part of the league community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{joinedLeague.name}</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {joinedLeague.leagueType.replace('_', ' ').toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {joinedLeague.status}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Participants:</span>
                <span className="ml-2 font-medium">
                  {joinedLeague.currentParticipants}/{joinedLeague.maxParticipants}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Registration Code:</span>
                <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {joinedLeague.registrationCode}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode(joinedLeague.registrationCode)}
                  className="ml-1 h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1">
              <Trophy className="h-4 w-4 mr-2" />
              View League Dashboard
            </Button>
            <Button variant="outline" onClick={() => setJoinedLeague(null)}>
              Join Another League
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="league-join-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          Join Fantasy League
        </CardTitle>
        <CardDescription>
          Enter a registration code to join an existing league
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="registration-code">Registration Code</Label>
          <Input
            id="registration-code"
            value={registrationCode}
            onChange={(e) => setRegistrationCode(e.target.value.toUpperCase())}
            placeholder="COACH2024-XXXXXX"
            className="font-mono"
            maxLength={20}
            data-testid="input-registration-code"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ask your league commissioner for the registration code
          </p>
        </div>

        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            <strong>Two League Types Available:</strong><br/>
            • <strong>PPR Leagues:</strong> Commissioner-verified data with AI coaching insights<br/>
            • <strong>Knockout Pools:</strong> ESPN API integration with automated scoring
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleJoinLeague}
          disabled={joinLeagueMutation.isPending || !registrationCode.trim()}
          className="w-full"
          size="lg"
          data-testid="button-join-league"
        >
          {joinLeagueMutation.isPending ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Joining League...
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4 mr-2" />
              Join League
            </>
          )}
        </Button>

        <div className="text-center text-sm text-gray-500">
          <p>Don't have a code? 
            <button 
              className="text-blue-600 hover:underline ml-1"
              onClick={() => {
                // In a real app, this would link to public leagues or commissioner signup
                toast({
                  title: "Find Leagues",
                  description: "Contact Champions for Change to start your own league!",
                });
              }}
            >
              Find public leagues
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}