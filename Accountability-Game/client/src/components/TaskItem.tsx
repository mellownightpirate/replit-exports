import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Check, X } from "lucide-react";
import type { Task } from "@shared/schema";

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
}

export function TaskItem({ task, onToggle, onUpdate, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

  const handleSave = () => {
    if (editValue.trim()) {
      onUpdate({ title: editValue.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 group py-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-8 text-sm"
          autoFocus
          data-testid={`input-edit-task-${task.id}`}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSave}
          className="shrink-0"
          data-testid={`button-save-task-${task.id}`}
        >
          <Check className="w-4 h-4 text-primary" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleCancel}
          className="shrink-0"
          data-testid={`button-cancel-edit-${task.id}`}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 group py-1.5 px-1 -mx-1 rounded-md transition-colors duration-150 hover-elevate"
      data-testid={`task-item-${task.id}`}
    >
      <Checkbox
        checked={task.done}
        onCheckedChange={onToggle}
        className="shrink-0 transition-transform duration-150 active:scale-95"
        data-testid={`checkbox-task-${task.id}`}
      />
      <span
        className={`flex-1 text-sm transition-all duration-200 ${
          task.done
            ? "line-through text-muted-foreground opacity-60"
            : "text-foreground"
        }`}
      >
        {task.title}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="shrink-0"
          data-testid={`button-edit-task-${task.id}`}
        >
          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          className="shrink-0"
          data-testid={`button-delete-task-${task.id}`}
        >
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
