import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import GamePage from "@/pages/game";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import LobbyPage from "@/pages/lobby";
import RoomPage from "@/pages/room";
import NotFound from "@/pages/not-found";

function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Redirect to="/lobby" />;
  }
  
  return <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthRedirect} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/lobby" component={LobbyPage} />
      <Route path="/room/:roomId" component={RoomPage} />
      <Route path="/solo" component={GamePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
