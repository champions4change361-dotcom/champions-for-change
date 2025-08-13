import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Globe, 
  LayoutTemplate, 
  Trophy, 
  Home,
  LogOut,
  Calculator,
  School,
  Users,
  Target,
  UserPlus,
  BarChart3,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { path: "/", label: "Home", icon: Home },
      { path: "/contacts", label: "Contacts", icon: UserPlus },
      { path: "/fantasy-tournaments", label: "Fantasy Sports", icon: Target },
      { path: "/athlete-analytics", label: "Athlete Analytics", icon: BarChart3 },
      { path: "/corporate-analytics", label: "Corporate Analytics", icon: Building2 }
    ];

    // Add role-specific navigation items
    const userRole = (user as any)?.userRole || (user as any)?.role;
    if (userRole === "coach") {
      baseItems.push({ path: "/coach", label: "Coach Dashboard", icon: Users });
    } else if (userRole === "tournament_manager" || userRole === "district_athletic_director") {
      baseItems.push({ path: "/tournament-manager", label: "Tournament Manager", icon: Trophy });
    } else if (userRole === "school_athletic_director") {
      baseItems.push({ path: "/school-ad", label: "School Athletic Director", icon: School });
    } else if (userRole === "scorekeeper") {
      baseItems.push({ path: "/scorekeeper", label: "Scorekeeper Dashboard", icon: Calculator });
    } else if (userRole === "athlete" || userRole === "fan") {
      baseItems.push({ path: "/athlete", label: "Tournament Dashboard", icon: Trophy });
    }

    // Add admin items for enterprise users or white-label clients
    const subscriptionPlan = (user as any)?.subscriptionPlan || (user as any)?.subscription;
    const isWhitelabelClient = (user as any)?.isWhitelabelClient;
    if (subscriptionPlan === "enterprise" || isWhitelabelClient) {
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
                  {(user as any)?.firstName || (user as any)?.email || 'User'}
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