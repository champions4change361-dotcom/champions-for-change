import { Link, useLocation } from "wouter";
import { useDomain } from "@/hooks/useDomain";
import { Button } from "@/components/ui/button";

export default function DomainNavigation() {
  const [location] = useLocation();
  const { config, isFeatureEnabled } = useDomain();
  
  if (!config) return null;

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
      style={{ backgroundColor: config.primaryColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Section */}
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center text-white text-xl">
            {config.brand === 'CHAMPIONS_FOR_CHANGE' ? '🏆' : 
             config.brand === 'COACHES_LOUNGE' ? '🎮' : '⚡'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{config.brand.replace(/_/g, ' ')}</h1>
            <p className="text-sm text-white/70">District Athletics Management</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link href="/">
            <a className={getNavItemClass("/")}>Home</a>
          </Link>

          {/* Show Tournament Empire for school-safe and pro domains */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <Link href="/tournament-empire">
              <a className={getNavItemClass("/tournament-empire")}>Tournaments</a>
            </Link>
          )}

          {/* Miller VLC Demo - CCISD Showcase */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <Link href="/miller-vlc-demo">
              <a className={getNavItemClass("/miller-vlc-demo")}>Miller VLC</a>
            </Link>
          )}

          {/* Role Hierarchy - District Administration */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <Link href="/role-hierarchy">
              <a className={getNavItemClass("/role-hierarchy")}>Roles</a>
            </Link>
          )}

          {/* Show Fantasy only for fantasy and pro domains */}
          {isFeatureEnabled('fantasyLeagues') && (
            <Link href="/fantasy-tournaments">
              <a className={getNavItemClass("/fantasy-tournaments")}>Fantasy</a>
            </Link>
          )}

          {/* Additional navigation for Champions for Change */}
          {config.brand === 'CHAMPIONS_FOR_CHANGE' && (
            <>
              <Link href="/athletic-trainer-scheduler">
                <a className={getNavItemClass("/athletic-trainer-scheduler")}>Scheduler</a>
              </Link>
              <Link href="/comprehensive-health-demo">
                <a className={getNavItemClass("/comprehensive-health-demo")}>Health</a>
              </Link>
            </>
          )}

          {/* Donate button for Champions for Change */}
          {config.brand === 'CHAMPIONS_FOR_CHANGE' && (
            <Button className={getDonateButtonClass()}>
              Support Students
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}