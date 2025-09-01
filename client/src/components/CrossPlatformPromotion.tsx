import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Users, Target, ArrowRight, Crown, Zap, BarChart3, TrendingUp, Anchor } from "lucide-react";
import { useDomain } from "@/hooks/useDomain";

interface CrossPlatformPromotionProps {
  placement: 'banner' | 'sidebar' | 'footer' | 'signup';
}

// Fantasy Promotion for Pro Domain
export function FantasyPromotion() {
  const { canShowFantasyPromo } = useDomain();
  
  if (!canShowFantasyPromo()) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Anchor className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-purple-900">
              Coaches Lounge Fantasy Sports
            </CardTitle>
            <CardDescription className="text-purple-700">
              Professional fantasy analytics for data-driven teams
            </CardDescription>
          </div>
          <Badge className="bg-purple-600 text-white ml-auto">Ad-Free</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-purple-900 mb-3">Perfect for Your Office:</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                Advanced NFL/NBA analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Private office leagues & tournaments
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Real-time scoring with ESPN integration
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                Completely ad-free experience
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center">
            <div className="bg-white p-4 rounded-lg border border-purple-200 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">100% Free</div>
                <div className="text-sm text-purple-700">Donation-supported model</div>
              </div>
            </div>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white w-full"
              onClick={() => window.location.href = '/coaches-lounge'}
              data-testid="button-fantasy-full-promo"
            >
              <Anchor className="mr-2 h-4 w-4" />
              Visit Coaches Lounge
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pro Tournament Promotion for Fantasy Domain
export function ProTournamentPromotion() {
  const { canShowProPromo } = useDomain();
  
  if (!canShowProPromo()) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Trophy className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl text-blue-900">
              Tournament Pro Platform
            </CardTitle>
            <CardDescription className="text-blue-700">
              Professional tournament management for businesses & clubs
            </CardDescription>
          </div>
          <Badge className="bg-blue-600 text-white ml-auto">Enterprise</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-900 mb-3">Business Tournaments:</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                Hackathons, coding competitions
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Corporate team building events
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Professional league management
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                Custom branding & white-label options
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              onClick={() => window.location.href = '/business-pricing-test'}
              data-testid="button-pro-full-promo"
            >
              <Trophy className="mr-2 h-4 w-4" />
              Explore Tournament Pro
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CrossPlatformPromotion({ placement }: CrossPlatformPromotionProps) {
  const { isSchoolDomain, isProDomain, isFantasyDomain, canShowFantasyPromo, canShowProPromo } = useDomain();

  // Never show fantasy promotion on school domains
  if (isSchoolDomain()) {
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
              <h3 className="text-white font-semibold">Coaches Lounge Fantasy Sports</h3>
              <p className="text-purple-300 text-sm">Professional fantasy leagues with real money prizes</p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/coaches-lounge'}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            data-testid="button-fantasy-promo"
          >
            Try Coaches Lounge
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (placement === 'sidebar' && shouldShowFantasyPromo) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20 overflow-hidden max-w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-400 flex-shrink-0" />
            <CardTitle className="text-white text-lg">Captain's Lounge Fantasy</CardTitle>
          </div>
          <CardDescription className="text-slate-100 text-sm leading-relaxed">
            Compete with friends and coworkers in fantasy sports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <span className="text-slate-100 text-sm">League competitions</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-400 flex-shrink-0" />
              <span className="text-slate-100 text-sm">Professional players</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-400 flex-shrink-0" />
              <span className="text-slate-100 text-sm">Age-verified leagues</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/coaches-lounge'}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white min-h-[44px] mt-4"
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
            onClick={() => window.location.href = '/coaches-lounge'}
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