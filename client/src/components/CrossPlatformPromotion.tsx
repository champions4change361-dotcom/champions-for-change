import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Users, Target, ArrowRight, Crown, Zap } from "lucide-react";
import { useDomain } from "@/hooks/useDomain";

interface CrossPlatformPromotionProps {
  placement: 'banner' | 'sidebar' | 'footer' | 'signup';
}

export function CrossPlatformPromotion({ placement }: CrossPlatformPromotionProps) {
  const { isSchoolSafe, isProDomain, isFantasyDomain } = useDomain();

  // Never show fantasy promotion on school domains
  if (isSchoolSafe()) {
    return null;
  }

  // Show fantasy promotion only on pro/business domains
  const shouldShowFantasyPromo = isProDomain() && !isFantasyDomain();
  const shouldShowProPromo = isFantasyDomain();

  if (placement === 'banner' && shouldShowFantasyPromo) {
    return (
      <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-6 w-6 text-purple-400" />
            <div>
              <h3 className="text-white font-semibold">Captain's Lounge Fantasy Sports</h3>
              <p className="text-purple-300 text-sm">Professional fantasy leagues with real money prizes</p>
            </div>
          </div>
          <Button 
            onClick={() => window.open('https://fantasy.trantortournaments.org', '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            data-testid="button-fantasy-promo"
          >
            Try Captain's Lounge
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (placement === 'sidebar' && shouldShowFantasyPromo) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white text-lg">Captain's Lounge</CardTitle>
          </div>
          <CardDescription className="text-purple-300">
            Adult fantasy sports platform with professional leagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-white text-sm">Real money prizes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-white text-sm">Professional players</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-white text-sm">Age-verified leagues</span>
            </div>
            <Button 
              onClick={() => window.open('https://fantasy.trantortournaments.org', '_blank')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="button-fantasy-sidebar"
            >
              Enter Captain's Lounge
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (placement === 'signup' && shouldShowFantasyPromo) {
    return (
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/20 rounded-lg">
        <div className="text-center">
          <Crown className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-white font-semibold mb-1">Also Try Captain's Lounge</h3>
          <p className="text-purple-300 text-sm mb-3">
            Professional fantasy sports with real money leagues
          </p>
          <Button 
            onClick={() => window.open('https://fantasy.trantortournaments.org', '_blank')}
            variant="outline"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
            data-testid="button-fantasy-signup"
          >
            Explore Fantasy Sports
          </Button>
        </div>
      </div>
    );
  }

  if (placement === 'sidebar' && shouldShowProPromo) {
    return (
      <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-white text-lg">Professional Platform</CardTitle>
          </div>
          <CardDescription className="text-blue-300">
            Enterprise tournament management solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-white text-sm">Advanced analytics</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-white text-sm">Team management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-blue-400" />
              <span className="text-white text-sm">Tournament hosting</span>
            </div>
            <Button 
              onClick={() => window.open('https://pro.trantortournaments.org', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-pro-sidebar"
            >
              Go Professional
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}