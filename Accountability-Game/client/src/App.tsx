import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useNotificationStream } from "@/hooks/use-notifications";
import { ProtectedRoute } from "@/lib/protected-route";
import { useTheme } from "@/lib/useTheme";
import AuthPage from "@/pages/auth-page";
import TodayPage from "@/pages/today-page";
import { MonthlyHabits } from "@/pages/MonthlyHabits";
import BuddiesPage from "@/pages/buddies-page";
import BuddyDetailPage from "@/pages/buddy-detail-page";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import ProfilePage from "@/pages/profile-page";
import HabitsPage from "@/pages/habits-page";
import NotificationsPage from "@/pages/notifications-page";
import ChatPage from "@/pages/chat-page";
import ForgotPasswordPage from "@/pages/forgot-password-page";
import ResetPasswordPage from "@/pages/reset-password-page";
import DiscoverPage from "@/pages/discover-page";
import ProjectsPage from "@/pages/projects-page";
import ProjectDetailPage from "@/pages/project-detail-page";
import CreateProjectPage from "@/pages/create-project-page";
import NotFound from "@/pages/not-found";
import { Calendar, CalendarDays, Users, BarChart3, User, Bell, MessageSquare, Compass, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OnboardingWizard, FinishSetupBanner } from "@/components/OnboardingWizard";
import type { OnboardingState } from "@shared/schema";

function BottomNav() {
  const [location, setLocation] = useLocation();
  
  const tabs = [
    { path: "/", icon: CalendarDays, label: "Today" },
    { path: "/monthly", icon: Calendar, label: "Monthly" },
    { path: "/buddies", icon: Users, label: "Buddies" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => setLocation(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`nav-${label.toLowerCase()}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ThemeToggleHeader() {
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: !!user,
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count ?? 0;
  
  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-40 h-12">
      <div className="flex items-center justify-between gap-2 h-full px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold">Stride</h1>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/discover")}
            data-testid="button-discover"
          >
            <Compass className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/projects")}
            data-testid="button-projects"
          >
            <Target className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/chats")}
            data-testid="button-chats"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation("/notifications")}
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  useNotificationStream();
  
  const { data: onboardingState } = useQuery<OnboardingState>({
    queryKey: ["/api/onboarding"],
    enabled: !!user,
  });

  const showOnboarding = user && onboardingState && !onboardingState.completed && !onboardingState.skipped;

  return (
    <div className="min-h-screen bg-background">
      <ThemeToggleHeader />
      <FinishSetupBanner />
      <main className="pt-12">
        {children}
      </main>
      <BottomNav />
      {showOnboarding && <OnboardingWizard />}
    </div>
  );
}

function MonthlyHabitsPage() {
  return (
    <AppLayout>
      <MonthlyHabits />
    </AppLayout>
  );
}

function AnalyticsPageWrapper() {
  return (
    <AppLayout>
      <AnalyticsPage />
    </AppLayout>
  );
}

function TodayPageWrapper() {
  return (
    <AppLayout>
      <TodayPage />
    </AppLayout>
  );
}

function BuddiesPageWrapper() {
  return (
    <AppLayout>
      <BuddiesPage />
    </AppLayout>
  );
}

function ProfilePageWrapper() {
  return (
    <AppLayout>
      <ProfilePage />
    </AppLayout>
  );
}

function HabitsPageWrapper() {
  return (
    <AppLayout>
      <HabitsPage />
    </AppLayout>
  );
}

function NotificationsPageWrapper() {
  return (
    <AppLayout>
      <NotificationsPage />
    </AppLayout>
  );
}

function ChatPageWrapper() {
  return (
    <AppLayout>
      <ChatPage />
    </AppLayout>
  );
}

function BuddyDetailPageWrapper() {
  return (
    <AppLayout>
      <BuddyDetailPage />
    </AppLayout>
  );
}

function DiscoverPageWrapper() {
  return (
    <AppLayout>
      <DiscoverPage />
    </AppLayout>
  );
}

function ProjectsPageWrapper() {
  return (
    <AppLayout>
      <ProjectsPage />
    </AppLayout>
  );
}

function ProjectDetailPageWrapper() {
  return (
    <AppLayout>
      <ProjectDetailPage />
    </AppLayout>
  );
}

function CreateProjectPageWrapper() {
  return (
    <AppLayout>
      <CreateProjectPage />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={TodayPageWrapper} />
      <ProtectedRoute path="/monthly" component={MonthlyHabitsPage} />
      <ProtectedRoute path="/buddies" component={BuddiesPageWrapper} />
      <ProtectedRoute path="/buddies/:id" component={BuddyDetailPageWrapper} />
      <ProtectedRoute path="/analytics" component={AnalyticsPageWrapper} />
      <ProtectedRoute path="/profile" component={ProfilePageWrapper} />
      <ProtectedRoute path="/habits" component={HabitsPageWrapper} />
      <ProtectedRoute path="/notifications" component={NotificationsPageWrapper} />
      <ProtectedRoute path="/chats" component={ChatPageWrapper} />
      <ProtectedRoute path="/discover" component={DiscoverPageWrapper} />
      <ProtectedRoute path="/projects" component={ProjectsPageWrapper} />
      <ProtectedRoute path="/projects/new" component={CreateProjectPageWrapper} />
      <ProtectedRoute path="/projects/:id" component={ProjectDetailPageWrapper} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
