import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RingChart } from "./RingChart";
import { TaskItem } from "./TaskItem";
import { Plus, Sparkles } from "lucide-react";
import { formatDayName, formatDayNumber, isToday } from "@/lib/dateUtils";
import { quickAddTemplates } from "@shared/schema";
import type { Task, InsertTask } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DayCardProps {
  date: Date;
  tasks: Task[];
  onAddTask: (task: InsertTask) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function DayCard({
  date,
  tasks,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}: DayCardProps) {
  const [newTask, setNewTask] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const today = isToday(date);

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask({ title: newTask.trim(), done: false });
      setNewTask("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    } else if (e.key === "Escape") {
      setNewTask("");
      setIsAdding(false);
    }
  };

  const handleQuickAdd = (template: string) => {
    onAddTask({ title: template, done: false });
  };

  return (
    <Card
      className={`flex flex-col h-full transition-all duration-200 ${
        today ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      }`}
      data-testid={`day-card-${formatDayNumber(date)}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3 space-y-0">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {formatDayName(date)}
          </span>
          <span className="text-2xl font-semibold tabular-nums font-mono">
            {formatDayNumber(date)}
          </span>
          {today && (
            <Badge variant="secondary" className="mt-1 text-xs w-fit">
              Today
            </Badge>
          )}
        </div>
        <RingChart percentage={percentage} size={56} strokeWidth={5} />
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin space-y-0.5">
          {tasks.length === 0 && !isAdding ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">No tasks yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAdding(true)}
                data-testid="button-add-first-task"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add task
              </Button>
            </div>
          ) : (
            <>
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onUpdate={(updates) => onUpdateTask(task.id, updates)}
                  onDelete={() => onDeleteTask(task.id)}
                />
              ))}
            </>
          )}
        </div>

        {isAdding ? (
          <div className="mt-3 flex items-center gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter task..."
              className="flex-1 h-8 text-sm"
              autoFocus
              data-testid="input-new-task"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAddTask}
              data-testid="button-confirm-add-task"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          tasks.length > 0 && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono font-tabular">
                  <span className="text-primary font-medium">{completedCount}</span>
                  {" / "}
                  {totalCount} done
                </span>
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" data-testid="button-quick-add">
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      Quick
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {quickAddTemplates.map((template) => (
                      <DropdownMenuItem
                        key={template}
                        onClick={() => handleQuickAdd(template)}
                        data-testid={`quick-add-${template.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {template}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAdding(true)}
                  data-testid="button-add-task"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
