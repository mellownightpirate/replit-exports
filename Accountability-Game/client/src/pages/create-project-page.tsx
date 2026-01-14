import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { User, BuddyConnection } from "@shared/schema";

type BuddyWithInfo = {
  connection: BuddyConnection;
  buddy: User | null;
};

export default function CreateProjectPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [goalType, setGoalType] = useState("checkins");
  const [goalTarget, setGoalTarget] = useState("30");
  const [selectedBuddies, setSelectedBuddies] = useState<number[]>([]);

  const { data: buddiesData = [] } = useQuery<BuddyWithInfo[]>({
    queryKey: ["/api/buddies"],
  });

  const buddies = buddiesData
    .filter(b => b.connection.status === "accepted" && b.buddy)
    .map(b => b.buddy!);

  const createMutation = useMutation({
    mutationFn: async () => {
      const project = await apiRequest("POST", "/api/projects", {
        name,
        description,
        visibility,
        goalType,
        goalTarget: parseInt(goalTarget),
      });
      
      // Invite selected buddies
      const projectData = await project.json();
      for (const buddyId of selectedBuddies) {
        await apiRequest("POST", `/api/projects/${projectData.id}/invite`, { userId: buddyId });
      }
      
      return projectData;
    },
    onSuccess: (project) => {
      toast({ title: "Project created!" });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setLocation(`/projects/${project.id}`);
    },
    onError: () => {
      toast({ title: "Failed to create project", variant: "destructive" });
    },
  });

  const canProceedStep1 = name.trim().length >= 2;
  const canProceedStep2 = goalTarget && parseInt(goalTarget) > 0;

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto">
      <div className="sticky top-12 bg-background pt-4 pb-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => step > 1 ? setStep(step - 1) : setLocation("/projects")}
          className="mb-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step > 1 ? "Back" : "Cancel"}
        </Button>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Create a Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="e.g., 30-Day Fitness Challenge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="input-project-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this project about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-testid="input-project-description"
              />
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger data-testid="select-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (only members)</SelectItem>
                  <SelectItem value="buddies_only">Buddies Only</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              data-testid="button-next-step-1"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Set a Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <Select value={goalType} onValueChange={setGoalType}>
                <SelectTrigger data-testid="select-goal-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkins">Check-ins (anchor completions)</SelectItem>
                  <SelectItem value="points">Points (weighted contributions)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalTarget">Target</Label>
              <Input
                id="goalTarget"
                type="number"
                min="1"
                placeholder="e.g., 30"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                data-testid="input-goal-target"
              />
              <p className="text-sm text-muted-foreground">
                Total {goalType === "checkins" ? "anchor check-ins" : "points"} needed to complete the project
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
              data-testid="button-next-step-2"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Invite Buddies (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {buddies.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No buddies to invite yet. You can invite them later from the project page.
              </p>
            ) : (
              <div className="space-y-2">
                {buddies.map((buddy) => (
                  <div
                    key={buddy.id}
                    className={`p-3 rounded-md border cursor-pointer transition-colors ${
                      selectedBuddies.includes(buddy.id)
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    onClick={() => {
                      if (selectedBuddies.includes(buddy.id)) {
                        setSelectedBuddies(selectedBuddies.filter(id => id !== buddy.id));
                      } else {
                        setSelectedBuddies([...selectedBuddies, buddy.id]);
                      }
                    }}
                    data-testid={`button-toggle-buddy-${buddy.id}`}
                  >
                    <p className="font-medium">{buddy.displayName || buddy.username}</p>
                    <p className="text-sm text-muted-foreground">@{buddy.username}</p>
                  </div>
                ))}
              </div>
            )}

            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              data-testid="button-create-project"
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
