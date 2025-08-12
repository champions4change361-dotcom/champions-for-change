import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/navigation";
import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Home from "@/pages/Home";
import Tournament from "@/pages/tournament";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import NotFound from "@/pages/not-found";
import WhiteLabelAdmin from "@/pages/WhiteLabelAdmin";
import WebsiteBuilder from "@/pages/WebsiteBuilder";
import CoachDashboard from "@/pages/CoachDashboard";
import TournamentManagerDashboard from "@/pages/TournamentManagerDashboard";
import AthleteFanDashboard from "@/pages/AthleteFanDashboard";
import ScorekeeperDashboard from "@/pages/ScorekeeperDashboard";
import SchoolAthleticDirectorDashboard from "@/pages/SchoolAthleticDirectorDashboard";
import FantasyTournaments from "@/pages/FantasyTournaments";
import Contacts from "@/pages/Contacts";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Navigation />}
      <Switch>
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/about" component={About} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/payment-success" component={PaymentSuccess} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/tournament/:id" component={Tournament} />

            <Route path="/checkout" component={Checkout} />
            <Route path="/payment-success" component={PaymentSuccess} />
            <Route path="/admin/whitelabel" component={WhiteLabelAdmin} />
            <Route path="/admin/website" component={WebsiteBuilder} />
            <Route path="/coach" component={CoachDashboard} />
            <Route path="/tournament-manager" component={TournamentManagerDashboard} />
            <Route path="/athlete" component={AthleteFanDashboard} />
            <Route path="/scorekeeper" component={ScorekeeperDashboard} />
            <Route path="/school-ad" component={SchoolAthleticDirectorDashboard} />
            <Route path="/fantasy-tournaments" component={FantasyTournaments} />
            <Route path="/contacts" component={Contacts} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
