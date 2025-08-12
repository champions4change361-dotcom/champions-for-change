import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route, Router } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useDomain } from "@/hooks/useDomain";
import DomainNavigation from "@/components/DomainNavigation";
import Home from './pages/home';
import Landing from './pages/Landing';
import DonationFlow from './pages/DonationFlow';
import PaymentMethods from './pages/PaymentMethods';
import Checkout from './pages/Checkout';
import DonationSuccess from './pages/DonationSuccess';
import CreateTournament from './pages/CreateTournament';
import Tournament from './pages/tournament';
import Contacts from './pages/Contacts';
import AIConsultation from './pages/AIConsultation';
import Settings from './pages/Settings';
import LiveMatches from './pages/LiveMatches';
import Championships from './pages/Championships';
import WebpageBuilder from './pages/WebpageBuilder';
import TournamentEmpire from './pages/TournamentEmpire';
import FantasyTournaments from './pages/FantasyTournaments';
import Register from './pages/Register';

function AuthenticatedRoutes() {
  const { isFeatureEnabled, isFantasyDomain, config } = useDomain();

  return (
    <div className={getDomainBackgroundClass(config.brand)}>
      <DomainNavigation />
      <Switch>
        <Route path="/" component={() => <Home />} />
        <Route path="/create" component={CreateTournament} />
        <Route path="/tournament/:id" component={Tournament} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/ai-consultation" component={AIConsultation} />
        <Route path="/settings" component={Settings} />
        <Route path="/live-matches" component={LiveMatches} />
        <Route path="/championships" component={Championships} />
        <Route path="/webpage-builder" component={WebpageBuilder} />
        
        {/* Show Tournament Empire only for school-safe and pro domains */}
        {!isFantasyDomain() && (
          <Route path="/tournament-empire" component={TournamentEmpire} />
        )}
        
        {/* Show Fantasy Tournaments only for fantasy and pro domains */}
        {isFeatureEnabled('fantasyLeagues') && (
          <Route path="/fantasy-tournaments" component={FantasyTournaments} />
        )}
        
        <Route>
          {/* 404 - redirect to home */}
          <Home />
        </Route>
      </Switch>
    </div>
  );
}

function getDomainBackgroundClass(brand: string) {
  if (brand === 'SCHOLASTIC_TOURNAMENTS') {
    return "min-h-screen bg-gradient-to-br from-blue-50 to-slate-50";
  }
  if (brand === 'FANTASY_LEAGUE_CENTRAL') {
    return "min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";
  }
  return "min-h-screen bg-gradient-to-br from-orange-50 to-red-50";
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          <AppRouter />
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const { config, isSchoolSafe } = useDomain();
  
  // For school domains, allow guest access to view tournaments
  const allowGuestAccess = isSchoolSafe();

  if (isLoading) {
    return (
      <div className={getDomainBackgroundClass(config.brand)} style={{ minHeight: '100vh' }}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading {config.branding.tagline}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/donate" component={DonationFlow} />
      <Route path="/payment-methods" component={PaymentMethods} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/donation-success" component={DonationSuccess} />
      <Route path="/register" component={Register} />
      {/* Show Landing page if not authenticated or on school-safe domains */}
      {(!isAuthenticated || allowGuestAccess) && (
        <Route path="/">
          <div className={getDomainBackgroundClass(config.brand)}>
            <Landing />
          </div>
        </Route>
      )}
      {/* Show authenticated routes if authenticated */}
      {isAuthenticated && <AuthenticatedRoutes />}
      {/* Default fallback */}
      <Route>
        <div className={getDomainBackgroundClass(config.brand)}>
          <Landing />
        </div>
      </Route>
    </Switch>
  );
}

export default App;