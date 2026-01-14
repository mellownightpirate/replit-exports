import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, User as UserIcon, Loader2, Settings, ChevronRight, RotateCcw, Globe, BookOpen, UserPlus, Compass, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";
import type { VisibilitySettings, OnboardingState } from "@shared/schema";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isPublic, setIsPublic] = useState(user?.isPublic || false);
  const [timezone, setTimezone] = useState(user?.timezone || "UTC");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setIsPublic(user.isPublic || false);
      setTimezone(user.timezone || "UTC");
    }
  }, [user]);

  const { data: visibility, isLoading: visibilityLoading } = useQuery<VisibilitySettings>({
    queryKey: ["/api/visibility"],
  });

  const { data: onboardingState } = useQuery<OnboardingState>({
    queryKey: ["/api/onboarding"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { displayName?: string; bio?: string; isPublic?: boolean; timezone?: string }) => {
      const res = await apiRequest("PATCH", "/api/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: async (data: Partial<VisibilitySettings>) => {
      const res = await apiRequest("PATCH", "/api/visibility", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visibility"] });
    },
  });

  const restartOnboardingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/onboarding/restart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
    },
  });

  const jumpToStepMutation = useMutation({
    mutationFn: async (stepIndex: number) => {
      const res = await apiRequest("PATCH", "/api/onboarding", { stepIndex, completed: false, skipped: false });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/onboarding"] });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({ displayName, bio, isPublic, timezone });
  };

  if (visibilityLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Profile</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{user?.displayName || user?.username}</p>
              <p className="text-muted-foreground text-sm">@{user?.username}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              data-testid="input-display-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              data-testid="input-bio"
            />
          </div>

          <Button 
            onClick={handleSaveProfile} 
            disabled={updateProfileMutation.isPending}
            data-testid="button-save-profile"
          >
            {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card data-tour="public-discovery">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Public Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Allow others to find you in the Discover section and send you buddy requests.
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Make Profile Public</p>
              <p className="text-muted-foreground text-sm">Others can discover and invite you</p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={(checked) => {
                setIsPublic(checked);
                updateProfileMutation.mutate({ isPublic: checked });
              }}
              data-testid="switch-public-profile"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <button
            onClick={() => setLocation("/habits")}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
            data-testid="button-manage-anchors"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-left font-medium">Manage Anchors</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </CardContent>
      </Card>

      <Card data-tour="privacy-settings">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Control what your buddies can see about your progress.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Anchors List</p>
                <p className="text-muted-foreground text-sm">Buddies can see your anchor names</p>
              </div>
              <Switch
                checked={visibility?.shareHabits ?? true}
                onCheckedChange={(checked) => updateVisibilityMutation.mutate({ shareHabits: checked })}
                data-testid="switch-share-anchors"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Anchor Status</p>
                <p className="text-muted-foreground text-sm">Buddies can see your completion status</p>
              </div>
              <Switch
                checked={visibility?.shareHabitStatus ?? true}
                onCheckedChange={(checked) => updateVisibilityMutation.mutate({ shareHabitStatus: checked })}
                data-testid="switch-share-anchor-status"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Task Titles</p>
                <p className="text-muted-foreground text-sm">Buddies can see your task names</p>
              </div>
              <Switch
                checked={visibility?.shareTasksTitles ?? false}
                onCheckedChange={(checked) => updateVisibilityMutation.mutate({ shareTasksTitles: checked })}
                data-testid="switch-share-task-titles"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Task Counts Only</p>
                <p className="text-muted-foreground text-sm">Show only completion numbers</p>
              </div>
              <Switch
                checked={visibility?.shareTasksCountsOnly ?? true}
                onCheckedChange={(checked) => updateVisibilityMutation.mutate({ shareTasksCountsOnly: checked })}
                data-testid="switch-share-task-counts"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Quick Guides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Jump to helpful walkthroughs for specific features.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={() => jumpToStepMutation.mutate(2)}
              disabled={jumpToStepMutation.isPending}
              data-testid="button-guide-add-anchor"
            >
              <BookOpen className="h-4 w-4" />
              Add Anchors
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={() => jumpToStepMutation.mutate(3)}
              disabled={jumpToStepMutation.isPending}
              data-testid="button-guide-find-buddies"
            >
              <UserPlus className="h-4 w-4" />
              Find Buddies
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={() => jumpToStepMutation.mutate(7)}
              disabled={jumpToStepMutation.isPending}
              data-testid="button-guide-discover"
            >
              <Compass className="h-4 w-4" />
              Discover Users
            </Button>
            <Button
              variant="outline"
              className="gap-2 justify-start"
              onClick={() => jumpToStepMutation.mutate(8)}
              disabled={jumpToStepMutation.isPending}
              data-testid="button-guide-projects"
            >
              <Settings className="h-4 w-4" />
              Projects
            </Button>
          </div>
          {onboardingState?.completed && (
            <Button
              variant="ghost"
              className="w-full gap-2 mt-2"
              onClick={() => restartOnboardingMutation.mutate()}
              disabled={restartOnboardingMutation.isPending}
              data-testid="button-restart-onboarding"
            >
              {restartOnboardingMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Restart Full Onboarding
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
