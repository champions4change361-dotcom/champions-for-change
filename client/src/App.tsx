import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SportsArenaHomepage from './pages/SportsArenaHomepage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SportsArenaHomepage />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;