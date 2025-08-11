import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Globe, 
  LayoutTemplate, 
  Trophy, 
  Home,
  LogOut,
  Calculator
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Home", icon: Home }
    ];

    // Add role-specific navigation items
    if (user?.userRole === "coach") {
      baseItems.push({ path: "/coach", label: "Coach Dashboard", icon: Users });
    } else if (user?.userRole === "tournament_manager" || user?.userRole === "athletic_director") {
      baseItems.push({ path: "/tournament-manager", label: "Tournament Manager", icon: Trophy });
    } else if (user?.userRole === "scorekeeper") {
      baseItems.push({ path: "/scorekeeper", label: "Scorekeeper Dashboard", icon: Calculator });
    } else if (user?.userRole === "athlete" || user?.userRole === "fan") {
      baseItems.push({ path: "/athlete", label: "Tournament Dashboard", icon: Trophy });
    }

    // Add admin items for enterprise users or white-label clients
    if (user?.subscriptionPlan === "enterprise" || user?.isWhitelabelClient) {
      baseItems.push(
        { path: "/admin/whitelabel", label: "White-Label Config", icon: Settings },
        { path: "/admin/website", label: "Website Builder", icon: LayoutTemplate }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Champions for Change</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                      data-testid={`nav-${item.path.replace(/\//g, '-')}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {user.firstName || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}