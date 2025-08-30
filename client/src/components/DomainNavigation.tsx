import { Link, useLocation } from "wouter";
import { useDomain } from "@/hooks/useDomain";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function DomainNavigation() {
  const [location] = useLocation();
  const { config, isFeatureEnabled } = useDomain();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen]);
  
  if (!config) return null;

  const getNavItemClass = (path: string) => {
    const isActive = location === path || (path !== "/" && location.startsWith(path));
    return `px-3 py-1 rounded-md transition-colors text-sm ${
      isActive 
        ? "bg-white/20 text-white font-medium" 
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;
  };

  const getDonateButtonClass = () => {
    return "bg-yellow-500 hover:bg-yellow-400 text-black font-medium px-3 py-1 rounded-md transition-colors text-sm";
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-40 w-full py-2 px-3 md:px-4 shadow-lg"
      style={{ backgroundColor: config.primaryColor }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Section */}
        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
          <div className="h-6 w-6 md:h-8 md:w-8 bg-white/20 rounded-lg flex items-center justify-center text-white text-sm md:text-lg">
            {config.brand === 'CHAMPIONS_FOR_CHANGE' ? '🏆' : 
             config.brand === 'COACHES_LOUNGE' ? '🎮' : '⚡'}
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-bold text-white truncate">{config.brand.replace(/_/g, ' ')}</h1>
            <p className="text-xs text-white/70 hidden sm:block">District Athletics Management</p>
          </div>
        </div>

        {/* Navigation Links - Responsive */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className={getNavItemClass("/")}>Home</a>
          </Link>

          {/* Show Tournament Management for school-safe and pro domains */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <Link href="/tournaments">
              <a className={getNavItemClass("/tournaments")}>Tournaments</a>
            </Link>
          )}
          
          {/* Show Tournament Empire for school-safe and pro domains */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <Link href="/tournament-empire">
              <a className={getNavItemClass("/tournament-empire")}>Tournament Empire</a>
            </Link>
          )}

          {/* Domain Management for Champions for Change */}
          {config.brand === 'CHAMPIONS_FOR_CHANGE' && (
            <Link href="/domains">
              <a className={getNavItemClass("/domains")}>Domains</a>
            </Link>
          )}

          {/* All CCISD VLC Schools - District Athletic Director Access */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <div className="relative group">
              <button className="px-3 py-1 rounded-md transition-colors text-sm text-white/80 hover:text-white hover:bg-white/10">
                CCISD VLC Schools
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link href="/miller-vlc-demo">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md">Miller High School VLC</a>
                </Link>
                <Link href="/carroll-vlc-demo">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Carroll High School VLC</a>
                </Link>
                <Link href="/veterans-vlc-demo">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Veterans Memorial VLC</a>
                </Link>
                <Link href="/ray-vlc-demo">
                  <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md">Ray High School VLC</a>
                </Link>
              </div>
            </div>
          )}

          {/* Schools - District Management */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <Link href="/schools">
              <a className={getNavItemClass("/schools")}>Schools</a>
            </Link>
          )}

          {/* Role Hierarchy - District Administration */}
          {config.brand !== 'COACHES_LOUNGE' && (
            <Link href="/role-hierarchy">
              <a className={getNavItemClass("/role-hierarchy")}>Roles</a>
            </Link>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden" ref={mobileMenuRef}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative w-6 h-6 flex flex-col justify-center items-center text-white cursor-pointer"
            data-testid="button-mobile-menu"
          >
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white mb-1"></div>
            <div className="w-4 h-0.5 bg-white"></div>
          </button>
          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50">
              <Link href="/">
                <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md" data-testid="link-mobile-home">Home</a>
              </Link>
              {config.brand !== 'COACHES_LOUNGE' && (
                <>
                  <Link href="/tournament-empire">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-tournaments">Tournaments</a>
                  </Link>
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">CCISD VLC Schools</div>
                  <Link href="/miller-vlc-demo">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ml-2" data-testid="link-mobile-miller">Miller High School</a>
                  </Link>
                  <Link href="/carroll-vlc-demo">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ml-2" data-testid="link-mobile-carroll">Carroll High School</a>
                  </Link>
                  <Link href="/veterans-vlc-demo">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ml-2" data-testid="link-mobile-veterans">Veterans Memorial</a>
                  </Link>
                  <Link href="/ray-vlc-demo">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ml-2" data-testid="link-mobile-ray">Ray High School</a>
                  </Link>
                  <Link href="/schools">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-schools">Schools</a>
                  </Link>
                  <Link href="/role-hierarchy">
                    <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md" data-testid="link-mobile-roles">Roles</a>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Desktop Additional Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Show Fantasy only for fantasy and pro domains */}
          {isFeatureEnabled('fantasyLeagues') && (
            <Link href="/fantasy-tournaments">
              <a className={getNavItemClass("/fantasy-tournaments")}>Fantasy</a>
            </Link>
          )}

          {/* AI Chat - Available for all users */}
          <Link href="/ai-chat">
            <a className={`${getNavItemClass("/ai-chat")} flex items-center space-x-1`}>
              <Brain className="w-4 h-4" />
              <span>AI Assistant</span>
            </a>
          </Link>

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