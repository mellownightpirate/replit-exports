import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Plus, Trash2, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import ProjectMembersSheet from "@/components/ProjectMembersSheet";
import type { Project, ProjectMember, ProjectHabitLink, Habit } from "@shared/schema";

type ProjectWithDetails = Project & {
  members: (ProjectMember & { user: { id: number; username: string; displayName: string | null; avatarUrl: string | null } | null })[];
  habitLinks: ProjectHabitLink[];
  progress: number;
};

export default function ProjectDetailPage() {
  const [, params] = useRoute("/projects/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string>("");

  const projectId = parseInt(params?.id || "0");

  const { data: project, isLoading } = useQuery<ProjectWithDetails>({
    queryKey: ["/api/projects", projectId],
    enabled: projectId > 0,
  });

  const { data: myHabits = [] } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const linkHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      return apiRequest("POST", `/api/projects/${projectId}/habits`, { habitId });
    },
    onSuccess: () => {
      toast({ title: "Anchor linked to project!" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setLinkDialogOpen(false);
      setSelectedHabit("");
    },
    onError: () => {
      toast({ title: "Failed to link anchor", variant: "destructive" });
    },
  });

  const unlinkHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      return apiRequest("DELETE", `/api/projects/${projectId}/habits/${habitId}`);
    },
    onSuccess: () => {
      toast({ title: "Anchor unlinked" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/projects/${projectId}`);
    },
    onSuccess: () => {
      toast({ title: "Project deleted" });
      setLocation("/projects");
    },
    onError: () => {
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pb-20 px-4 max-w-lg mx-auto">
        <div className="text-center py-12 text-muted-foreground">
          Project not found
        </div>
      </div>
    );
  }

  const isOwner = project.ownerId === user?.id;
  const progressPercent = project.goalTarget > 0 ? Math.min((project.progress / project.goalTarget) * 100, 100) : 0;

  // Filter out habits already linked
  const linkedHabitIds = project.habitLinks
    .filter(link => link.userId === user?.id)
    .map(link => link.habitId);
  const availableHabits = myHabits.filter(h => !linkedHabitIds.includes(h.id));
  const myLinkedHabits = project.habitLinks.filter(link => link.userId === user?.id);

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto">
      <div className="sticky top-12 bg-background pt-4 pb-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLocation("/projects")}
          className="mb-2"
          data-testid="button-back-projects"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>

      <Card className="mt-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{project.name}</CardTitle>
            <Badge variant="secondary">{project.visibility}</Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span>{project.progress} / {project.goalTarget} {project.goalType}</span>
              </div>
              <Progress value={progressPercent} className="h-3" />
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Members ({project.members.length})</span>
                </div>
                <ProjectMembersSheet
                  projectId={project.id}
                  projectName={project.name}
                  ownerId={project.ownerId}
                  isOwner={isOwner}
                  onMembersUpdated={() => {
                    queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.avatarUrl || undefined} />
                      <AvatarFallback>
                        {(member.user?.displayName || member.user?.username || "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {member.user?.displayName || member.user?.username}
                      {member.role === "owner" && (
                        <Badge variant="outline" className="ml-1 text-xs">Owner</Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">My Linked Anchors</CardTitle>
            {availableHabits.length > 0 && (
              <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-testid="button-link-anchor">
                    <Plus className="h-4 w-4 mr-1" />
                    Link Anchor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link an Anchor to Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                      <SelectTrigger data-testid="select-anchor-to-link">
                        <SelectValue placeholder="Select an anchor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableHabits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id.toString()}>
                            {habit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (selectedHabit) {
                          linkHabitMutation.mutate(parseInt(selectedHabit));
                        }
                      }}
                      disabled={!selectedHabit || linkHabitMutation.isPending}
                      data-testid="button-confirm-link-anchor"
                    >
                      Link Anchor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {myLinkedHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No anchors linked yet. Link your anchors to contribute to this project's goal.
            </p>
          ) : (
            <div className="space-y-2">
              {myLinkedHabits.map((link) => {
                const habit = myHabits.find(h => h.id === link.habitId);
                if (!habit) return null;
                return (
                  <div key={link.id} className="flex items-center justify-between py-2">
                    <span className="text-sm">{habit.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => unlinkHabitMutation.mutate(link.habitId)}
                      disabled={unlinkHabitMutation.isPending}
                      data-testid={`button-unlink-habit-${link.habitId}`}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isOwner && (
        <div className="mt-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              if (confirm("Are you sure you want to delete this project?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            data-testid="button-delete-project"
          >
            Delete Project
          </Button>
        </div>
      )}
    </div>
  );
}
