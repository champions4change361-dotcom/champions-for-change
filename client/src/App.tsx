import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route, Router } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Home from './pages/Home';
import Landing from './pages/Landing';
import DonationFlow from './pages/DonationFlow';
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

function AuthenticatedRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateTournament} />
      <Route path="/tournament/:id" component={Tournament} />
      <Route path="/contacts" component={Contacts} />
      <Route path="/ai-consultation" component={AIConsultation} />
      <Route path="/settings" component={Settings} />
      <Route path="/live-matches" component={LiveMatches} />
      <Route path="/championships" component={Championships} />
      <Route path="/webpage-builder" component={WebpageBuilder} />
      <Route>
        {/* 404 - redirect to home */}
        <Home />
      </Route>
    </Switch>
  );
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Champions Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/donate" component={DonationFlow} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/donation-success" component={DonationSuccess} />
      {!isAuthenticated ? (
        <Route component={Landing} />
      ) : (
        <AuthenticatedRoutes />
      )}
    </Switch>
  );
}

export default App;