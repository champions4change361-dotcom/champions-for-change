import { Link, useLocation } from "wouter";
import { useDomain } from "@/hooks/useDomain";
import { Button } from "@/components/ui/button";

export default function DomainNavigation() {
  const [location] = useLocation();
  const { config, getBrandConfig, isFeatureEnabled } = useDomain();
  const brandConfig = getBrandConfig();

  const getNavItemClass = (path: string) => {
    const isActive = location === path || (path !== "/" && location.startsWith(path));
    return `px-4 py-2 rounded-lg transition-colors ${
      isActive 
        ? "bg-white/20 text-white font-medium" 
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;
  };

  const getDonateButtonClass = () => {
    return "bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-4 py-2 rounded-lg transition-colors";
  };

  return (
    <nav 
      className="w-full py-4 px-6 shadow-lg"
      style={{ backgroundColor: brandConfig.primaryColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Section */}
        <div className="flex items-center space-x-4">
          <img 
            src={brandConfig.logo} 
            alt={config.brand} 
            className="h-10 w-10"
            onError={(e) => {
              // Fallback to emoji if logo not found
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
            }}
          />
          <div className="hidden h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center text-white text-xl">
            {config.brand === 'SCHOLASTIC_TOURNAMENTS' ? '🏆' : 
             config.brand === 'FANTASY_LEAGUE_CENTRAL' ? '🎮' : '⚡'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{brandConfig.brand}</h1>
            <p className="text-sm text-white/70">{config.branding.footerText}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/">
            <a className={getNavItemClass("/")}>Home</a>
          </Link>

          {/* Show Tournament Empire for school-safe and pro domains */}
          {config.brand !== 'FANTASY_LEAGUE_CENTRAL' && (
            <Link href="/tournament-empire">
              <a className={getNavItemClass("/tournament-empire")}>Tournaments</a>
            </Link>
          )}

          {/* Show Fantasy only for fantasy and pro domains */}
          {isFeatureEnabled('fantasyLeagues') && (
            <Link href="/fantasy-tournaments">
              <a className={getNavItemClass("/fantasy-tournaments")}>Fantasy</a>
            </Link>
          )}

          {/* Domain-specific navigation items */}
          {config.navigation.slice(2).map((item) => {
            const path = `/${item.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <Link key={item} href={path}>
                <a className={getNavItemClass(path)}>{item}</a>
              </Link>
            );
          })}

          {/* Donate button for fantasy domain */}
          {isFeatureEnabled('donationButtons') && (
            <Button className={getDonateButtonClass()}>
              Donate ❤️
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}