import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link2, Crown, Trophy, Users, Check, ArrowRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useDomain } from "@/hooks/useDomain";

export function AccountLinking() {
  const { user } = useAuth();
  const { isProDomain, isFantasyDomain } = useDomain();
  const { toast } = useToast();
  const [linkingStep, setLinkingStep] = useState<'options' | 'verify' | 'complete'>('options');

  const linkAccountMutation = useMutation({
    mutationFn: async (targetDomain: string) => {
      return apiRequest("/api/account/link", "POST", { targetDomain });
    },
    onSuccess: () => {
      setLinkingStep('complete');
      toast({
        title: "Accounts Linked",
        description: "You can now access both platforms with the same login",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Linking Failed",
        description: error.message || "Failed to link accounts",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const availableLinks = [];
  
  if (!isFantasyDomain()) {
    availableLinks.push({
      domain: '/coaches-lounge',
      name: "Captain's Lounge Fantasy",
      description: "Compete with friends and coworkers for fun",
      icon: Crown,
      color: "purple",
      benefits: ["Professional fantasy leagues", "Compete with friends/coworkers", "Advanced statistics", "Age-verified community"]
    });
  }

  if (!isProDomain()) {
    availableLinks.push({
      domain: 'pro.trantortournaments.org', 
      name: "Professional Platform",
      description: "Enterprise tournament management",
      icon: Trophy,
      color: "blue",
      benefits: ["Advanced tournament tools", "Team management", "Analytics dashboard", "Priority support"]
    });
  }

  if (availableLinks.length === 0) {
    return (
      <Alert className="bg-green-900/20 border-green-500/20">
        <Check className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          Your account is linked across all platforms. Access any domain with the same login.
        </AlertDescription>
      </Alert>
    );
  }

  if (linkingStep === 'complete') {
    return (
      <Alert className="bg-green-900/20 border-green-500/20">
        <Check className="h-4 w-4 text-green-400" />
        <AlertDescription className="text-green-300">
          Account linking complete! You can now use the same login across all platforms.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <div className="flex items-center space-x-2 mb-4">
        <Link2 className="h-5 w-5 text-white" />
        <h3 className="text-white font-semibold">Link Your Accounts</h3>
      </div>
      
      <p className="text-slate-100 text-sm mb-4 leading-relaxed">
        Connect your account to access multiple platforms with the same login. Your Champions for Change account will work everywhere.
      </p>

      <div className="grid gap-4 max-w-full">
        {availableLinks.map((link) => {
          const IconComponent = link.icon;
          const colorClasses = {
            purple: "from-purple-900/30 to-purple-800/20 border-purple-500/20",
            blue: "from-blue-900/30 to-blue-800/20 border-blue-500/20"
          };
          
          return (
            <Card key={link.domain} className={`bg-gradient-to-br ${colorClasses[link.color as keyof typeof colorClasses]} overflow-hidden`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-col sm:flex-row gap-3 sm:gap-0">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <IconComponent className={`h-6 w-6 text-${link.color}-400 flex-shrink-0`} />
                    <div className="min-w-0">
                      <CardTitle className="text-white text-lg sm:text-xl">{link.name}</CardTitle>
                      <CardDescription className={`text-slate-100 text-sm leading-relaxed`}>
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-slate-400 bg-slate-700/50 border-slate-600 flex-shrink-0">
                    Available
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  {link.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-slate-100 text-sm leading-relaxed">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => linkAccountMutation.mutate(link.domain)}
                    disabled={linkAccountMutation.isPending}
                    className={`bg-${link.color}-600 hover:bg-${link.color}-700 text-white flex-1 min-h-[44px]`}
                    data-testid={`button-link-${link.domain.split('.')[0]}`}
                  >
                    {linkAccountMutation.isPending ? "Linking..." : "Link Account"}
                    <Link2 className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      if (link.domain.startsWith('/')) {
                        window.location.href = link.domain;
                      } else {
                        window.open(`https://${link.domain}`, '_blank');
                      }
                    }}
                    variant="outline"
                    className={`border-${link.color}-500/50 text-${link.color}-300 hover:bg-${link.color}-500/10 min-h-[44px]`}
                    data-testid={`button-visit-${link.domain.replace('/', '').split('.')[0]}`}
                  >
                    Visit
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}