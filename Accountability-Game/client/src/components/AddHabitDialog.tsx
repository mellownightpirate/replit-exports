import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { HabitIcon, habitIconOptions } from "@/components/HabitIcon";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddHabitDialogProps {
  trigger?: React.ReactNode;
}

export function AddHabitDialog({ trigger }: AddHabitDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("target");
  const [targetPerWeek, setTargetPerWeek] = useState(7);

  const addHabitMutation = useMutation({
    mutationFn: async (data: { name: string; emoji: string; targetPerWeek: number }) => {
      const res = await apiRequest("POST", "/api/habits", { ...data, isActive: true });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({ title: "Anchor added", description: "Your new anchor has been created." });
      resetForm();
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setName("");
    setIcon("target");
    setTargetPerWeek(7);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addHabitMutation.mutate({ name: name.trim(), emoji: icon, targetPerWeek });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1" data-testid="button-add-anchor">
            <Plus className="h-4 w-4" />
            Add Anchor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Anchor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anchor-name">Anchor Name</Label>
            <Input
              id="anchor-name"
              placeholder="e.g., Morning workout"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-anchor-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {habitIconOptions.map((iconKey) => (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => setIcon(iconKey)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    icon === iconKey ? "bg-primary text-primary-foreground" : "bg-muted hover-elevate"
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
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setTargetPerWeek(Math.max(1, targetPerWeek - 1))}
                data-testid="button-decrease-target"
              >
                -
              </Button>
              <Input
                id="target"
                type="number"
                min={1}
                max={7}
                value={targetPerWeek}
                onChange={(e) => setTargetPerWeek(parseInt(e.target.value) || 1)}
                className="w-16 text-center"
                data-testid="input-target"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setTargetPerWeek(Math.min(7, targetPerWeek + 1))}
                data-testid="button-increase-target"
              >
                +
              </Button>
              <span className="text-sm text-muted-foreground">days/week</span>
            </div>
          </div>

          <Button type="submit" disabled={addHabitMutation.isPending || !name.trim()} className="w-full">
            {addHabitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Anchor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
