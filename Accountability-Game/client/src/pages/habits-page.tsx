import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Habit } from "@shared/schema";
import { HabitIcon, habitIconOptions } from "@/components/HabitIcon";
import { useToast } from "@/hooks/use-toast";

export default function HabitsPage() {
  const { toast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formEmoji, setFormEmoji] = useState("star");
  const [formTarget, setFormTarget] = useState(7);
  const [formIsActive, setFormIsActive] = useState(true);

  const { data: habits = [], isLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const editingHabit = habits.find(h => h.id === editingHabitId);

  useEffect(() => {
    if (editingHabit) {
      setFormName(editingHabit.name);
      setFormEmoji(editingHabit.emoji || "star");
      setFormTarget(editingHabit.targetPerWeek || 7);
      setFormIsActive(editingHabit.isActive ?? true);
    }
  }, [editingHabit]);

  const createHabitMutation = useMutation({
    mutationFn: async (data: { name: string; emoji: string; targetPerWeek: number }) => {
      const res = await apiRequest("POST", "/api/habits", {
        ...data,
        isActive: true,
        order: habits.length,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "Anchor created" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; emoji?: string; targetPerWeek?: number; isActive?: boolean }) => {
      const res = await apiRequest("PATCH", `/api/habits/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      setEditingHabitId(null);
      resetForm();
      toast({ title: "Anchor updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Anchor deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormName("");
    setFormEmoji("star");
    setFormTarget(7);
    setFormIsActive(true);
  };

  const handleAddDialogChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      setEditingHabitId(null);
      resetForm();
    }
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim()) {
      createHabitMutation.mutate({
        name: formName.trim(),
        emoji: formEmoji,
        targetPerWeek: formTarget,
      });
    }
  };

  const handleEditHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHabitId && formName.trim()) {
      updateHabitMutation.mutate({
        id: editingHabitId,
        name: formName.trim(),
        emoji: formEmoji,
        targetPerWeek: formTarget,
        isActive: formIsActive,
      });
    }
  };

  const handleReactivate = (habitId: number) => {
    updateHabitMutation.mutate({ id: habitId, isActive: true });
  };

  const activeHabits = habits.filter(h => h.isActive);
  const inactiveHabits = habits.filter(h => !h.isActive);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Manage Anchors</h1>
        <Button size="sm" className="gap-1" onClick={() => setIsAddOpen(true)} data-testid="button-add-anchor" data-tour="add-anchor">
          <Plus className="h-4 w-4" />
          Add Anchor
        </Button>
      </div>

      <Dialog open={isAddOpen} onOpenChange={handleAddDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Anchor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddHabit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="anchor-name">Anchor Name</Label>
              <Input
                id="anchor-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Morning exercise"
                data-testid="input-anchor-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {habitIconOptions.map((iconKey) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setFormEmoji(iconKey)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formEmoji === iconKey ? "bg-primary text-primary-foreground" : "bg-muted hover-elevate"
                    }`}
                    data-testid={`icon-option-${iconKey}`}
                  >
                    <HabitIcon icon={iconKey} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target per Week</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="target"
                  type="number"
                  min={1}
                  max={7}
                  value={formTarget}
                  onChange={(e) => setFormTarget(parseInt(e.target.value) || 1)}
                  className="w-20"
                  data-testid="input-habit-target"
                />
                <span className="text-muted-foreground text-sm">days per week</span>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createHabitMutation.isPending} data-testid="button-save-anchor">
                {createHabitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Anchor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingHabitId} onOpenChange={handleEditDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Anchor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditHabit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Anchor Name</Label>
              <Input
                id="edit-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                data-testid="input-edit-anchor-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {habitIconOptions.map((iconKey) => (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setFormEmoji(iconKey)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formEmoji === iconKey ? "bg-primary text-primary-foreground" : "bg-muted hover-elevate"
                    }`}
                  >
                    <HabitIcon icon={iconKey} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-target">Target per Week</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-target"
                  type="number"
                  min={1}
                  max={7}
                  value={formTarget}
                  onChange={(e) => setFormTarget(parseInt(e.target.value) || 1)}
                  className="w-20"
                  data-testid="input-edit-habit-target"
                />
                <span className="text-muted-foreground text-sm">days per week</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-muted-foreground text-sm">Show in daily tracking</p>
              </div>
              <Switch
                checked={formIsActive}
                onCheckedChange={setFormIsActive}
                data-testid="switch-habit-active"
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={updateHabitMutation.isPending} data-testid="button-update-anchor">
                {updateHabitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Anchors ({activeHabits.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeHabits.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              No active anchors. Add one to get started!
            </p>
          ) : (
            activeHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                data-testid={`habit-item-${habit.id}`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <HabitIcon emoji={habit.emoji ?? undefined} className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{habit.name}</p>
                  <p className="text-muted-foreground text-sm">{habit.targetPerWeek}x per week</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingHabitId(habit.id)}
                    data-testid={`button-edit-habit-${habit.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" data-testid={`button-delete-habit-${habit.id}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Anchor?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{habit.name}" and all its tracking history. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteHabitMutation.mutate(habit.id)}
                          className="bg-destructive text-destructive-foreground"
                          data-testid="button-confirm-delete"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {inactiveHabits.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Anchors ({inactiveHabits.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inactiveHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60"
                data-testid={`inactive-habit-${habit.id}`}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <HabitIcon emoji={habit.emoji ?? undefined} className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{habit.name}</p>
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReactivate(habit.id)}
                  disabled={updateHabitMutation.isPending}
                  data-testid={`button-reactivate-${habit.id}`}
                >
                  Reactivate
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
