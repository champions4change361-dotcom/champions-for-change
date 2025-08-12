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
      return apiRequest("POST", "/api/account/link", { targetDomain });
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
      domain: 'fantasy.trantortournaments.org',
      name: "Captain's Lounge Fantasy",
      description: "Adult fantasy sports with real money leagues",
      icon: Crown,
      color: "purple",
      benefits: ["Professional fantasy leagues", "Real money prizes", "Advanced statistics", "Age-verified community"]
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
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Link2 className="h-5 w-5 text-white" />
        <h3 className="text-white font-semibold">Link Your Accounts</h3>
      </div>
      
      <p className="text-slate-300 text-sm mb-4">
        Connect your account to access multiple platforms with the same login. Your Champions for Change account will work everywhere.
      </p>

      <div className="grid gap-4">
        {availableLinks.map((link) => {
          const IconComponent = link.icon;
          const colorClasses = {
            purple: "from-purple-900/30 to-purple-800/20 border-purple-500/20",
            blue: "from-blue-900/30 to-blue-800/20 border-blue-500/20"
          };
          
          return (
            <Card key={link.domain} className={`bg-gradient-to-br ${colorClasses[link.color as keyof typeof colorClasses]}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <IconComponent className={`h-6 w-6 text-${link.color}-400`} />
                    <div>
                      <CardTitle className="text-white">{link.name}</CardTitle>
                      <CardDescription className={`text-${link.color}-300`}>
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={`border-${link.color}-500/50 text-${link.color}-400`}>
                    New Access
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {link.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-white text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => linkAccountMutation.mutate(link.domain)}
                    disabled={linkAccountMutation.isPending}
                    className={`bg-${link.color}-600 hover:bg-${link.color}-700 text-white flex-1`}
                    data-testid={`button-link-${link.domain.split('.')[0]}`}
                  >
                    {linkAccountMutation.isPending ? "Linking..." : "Link Account"}
                    <Link2 className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => window.open(`https://${link.domain}`, '_blank')}
                    variant="outline"
                    className={`border-${link.color}-500/50 text-${link.color}-400`}
                    data-testid={`button-visit-${link.domain.split('.')[0]}`}
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