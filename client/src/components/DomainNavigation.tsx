import { Link, useLocation } from "wouter";
import { useDomain } from "@/hooks/useDomain";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Brain, User, Calendar, Heart, Trophy, Settings, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function DomainNavigation() {
  const [location] = useLocation();
  const { config, isFeatureEnabled } = useDomain();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (mobileMenuOpen || userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mobileMenuOpen, userMenuOpen]);
  
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

        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden flex items-center space-x-3">
          {/* User Profile Button (DT) */}
          {isAuthenticated && user && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold"
                data-testid="button-user-profile"
              >
                {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link href="/profile">
                    <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-profile">
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </a>
                  </Link>
                  <Link href="/settings">
                    <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-settings">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </a>
                  </Link>
                  <button
                    onClick={() => window.location.href = '/api/logout'}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger Menu */}
          <div ref={mobileMenuRef}>
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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50">
                {/* Core Navigation */}
                <div className="py-2">
                  <Link href="/">
                    <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-home">
                      <Trophy className="w-4 h-4 mr-3" />
                      Home
                    </a>
                  </Link>
                  {config.brand !== 'COACHES_LOUNGE' && (
                    <Link href="/tournaments">
                      <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-tournaments">
                        <Trophy className="w-4 h-4 mr-3" />
                        Tournaments
                      </a>
                    </Link>
                  )}
                  
                  {/* Tournament Empire for school-safe and pro domains */}
                  {config.brand !== 'COACHES_LOUNGE' && (
                    <Link href="/tournament-empire">
                      <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-tournament-empire">
                        <Trophy className="w-4 h-4 mr-3" />
                        Tournament Empire
                      </a>
                    </Link>
                  )}

                  {/* AI Assistant */}
                  <Link href="/ai-chat">
                    <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-ai-chat">
                      <Brain className="w-4 h-4 mr-3" />
                      AI Assistant
                    </a>
                  </Link>

                  {/* Fantasy Leagues */}
                  {isFeatureEnabled('fantasyLeagues') && (
                    <Link href="/fantasy-tournaments">
                      <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-fantasy">
                        <Trophy className="w-4 h-4 mr-3" />
                        Fantasy
                      </a>
                    </Link>
                  )}
                </div>

                {/* Champions for Change Features */}
                {config.brand === 'CHAMPIONS_FOR_CHANGE' && (
                  <div className="border-t border-gray-100 py-2">
                    <Link href="/athletic-trainer-scheduler">
                      <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-scheduler">
                        <Calendar className="w-4 h-4 mr-3" />
                        Athletic Scheduler
                      </a>
                    </Link>
                    <Link href="/comprehensive-health-demo">
                      <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-health">
                        <Heart className="w-4 h-4 mr-3" />
                        Health Dashboard
                      </a>
                    </Link>
                    <Link href="/domains">
                      <a className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-testid="link-mobile-domains">
                        <Settings className="w-4 h-4 mr-3" />
                        Domain Management
                      </a>
                    </Link>
                  </div>
                )}

                {/* Authentication */}
                {!isAuthenticated ? (
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={() => window.location.href = '/api/login'}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      data-testid="button-mobile-login"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Sign In
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={() => window.location.href = '/api/logout'}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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