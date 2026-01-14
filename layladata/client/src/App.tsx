import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/LandingPage";
import PastEvents from "@/pages/PastEvents";
import AnalyticsDashboardV3 from "@/pages/AnalyticsDashboardV3";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { initializeTracker } from "@/lib/tracker";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/past-events" component={PastEvents} />
      <Route path="/layla-analytics-aurora-741" component={AnalyticsDashboardV3} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize V3 tracker on app load
  useEffect(() => {
    initializeTracker();
  }, []);

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
