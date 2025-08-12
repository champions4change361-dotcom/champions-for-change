import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Anchor } from "lucide-react";
import { useDomain } from "@/hooks/useDomain";

export function DomainAwareNavbar() {
  const { config, isSchoolDomain, isFantasyDomain, isProDomain } = useDomain();
  
  // Return a basic navbar if config is still loading
  if (!config) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h1 className="text-xl font-bold text-gray-600">Champions for Change</h1>
                <p className="text-sm text-gray-600">Tournament Platform</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const getBrandConfig = () => {
    switch (config.type) {
      case 'school':
        return {
          title: 'Champions for Change',
          subtitle: 'Educational Tournament Platform',
          logo: '🎓',
          color: 'text-green-600'
        };
      case 'fantasy':
        return {
          title: "Captain's Lounge",
          subtitle: 'Where Fantasy Becomes Legendary',
          logo: '⚓',
          color: 'text-purple-600'
        };
      case 'pro':
        return {
          title: 'Tournament Pro',
          subtitle: 'Professional Tournament Management',
          logo: '🏆',
          color: 'text-blue-600'
        };
      default:
        return {
          title: 'Tournament Platform',
          subtitle: '',
          logo: '🏆',
          color: 'text-gray-600'
        };
    }
  };

  const brand = getBrandConfig();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{brand.logo}</span>
            <div>
              <h1 className={`text-xl font-bold ${brand.color}`}>
                {brand.title}
              </h1>
              {brand.subtitle && (
                <p className="text-sm text-gray-600">{brand.subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Domain switcher for non-school domains */}
          {!isSchoolDomain() && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {config.type.toUpperCase()}
              </Badge>
              
              {/* Quick domain links */}
              <div className="flex gap-1">
                {isProDomain() && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open('https://fantasy.trantortournaments.org', '_blank')}
                    className="text-purple-600 hover:text-purple-700"
                    data-testid="navbar-link-fantasy"
                  >
                    <Anchor className="h-4 w-4 mr-1" />
                    Fantasy
                  </Button>
                )}
                
                {isFantasyDomain() && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => window.open('https://pro.trantortournaments.org', '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                    data-testid="navbar-link-pro"
                  >
                    <Trophy className="h-4 w-4 mr-1" />
                    Pro
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}