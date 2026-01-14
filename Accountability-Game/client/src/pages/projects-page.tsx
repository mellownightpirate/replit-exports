import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Target, Loader2, Check, X } from "lucide-react";
import type { Project, ProjectMember } from "@shared/schema";

type ProjectInvite = ProjectMember & {
  project: Project | null;
  owner: { id: number; username: string; displayName: string | null; avatarUrl: string | null } | null;
};

export default function ProjectsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: invites = [] } = useQuery<ProjectInvite[]>({
    queryKey: ["/api/project-invites"],
  });

  const acceptMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return apiRequest("POST", `/api/project-invites/${projectId}/accept`);
    },
    onSuccess: () => {
      toast({ title: "Joined project!" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/project-invites"] });
    },
    onError: () => {
      toast({ title: "Failed to accept invite", variant: "destructive" });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (projectId: number) => {
      return apiRequest("POST", `/api/project-invites/${projectId}/decline`);
    },
    onSuccess: () => {
      toast({ title: "Invite declined" });
      queryClient.invalidateQueries({ queryKey: ["/api/project-invites"] });
    },
  });

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto" data-tour="projects-section">
      <div className="sticky top-12 bg-background pt-4 pb-2 z-30 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Projects</h2>
        <Button
          onClick={() => setLocation("/projects/new")}
          data-testid="button-create-project"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {invites.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Invitations</h3>
          <div className="space-y-2">
            {invites.map((invite) => (
              <Card key={invite.id} data-testid={`card-invite-${invite.projectId}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{invite.project?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        From {invite.owner?.displayName || invite.owner?.username}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => acceptMutation.mutate(invite.projectId)}
                        disabled={acceptMutation.isPending}
                        data-testid={`button-accept-invite-${invite.projectId}`}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => declineMutation.mutate(invite.projectId)}
                        disabled={declineMutation.isPending}
                        data-testid={`button-decline-invite-${invite.projectId}`}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No projects yet</p>
            <p className="text-sm mt-1">Create a project to track shared goals with buddies</p>
          </div>
        ) : (
          projects.map((project) => (
            <Card 
              key={project.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => setLocation(`/projects/${project.id}`)}
              data-testid={`card-project-${project.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {project.visibility}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Goal: {project.goalTarget} {project.goalType}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
