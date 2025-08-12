import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route, Router } from "wouter";
import Home from './pages/Home';
import CreateTournament from './pages/CreateTournament';
import Tournament from './pages/tournament';
import Contacts from './pages/Contacts';
import AIConsultation from './pages/AIConsultation';
import Settings from './pages/Settings';
import LiveMatches from './pages/LiveMatches';
import Championships from './pages/Championships';
import WebpageBuilder from './pages/WebpageBuilder';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
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
        </Router>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;