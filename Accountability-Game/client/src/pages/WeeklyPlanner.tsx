import { DayCard } from "@/components/DayCard";
import { getWeekDays, formatDateISO } from "@/lib/dateUtils";
import type { Task, PlannerDay, InsertTask } from "@shared/schema";

interface WeeklyPlannerProps {
  currentWeek: Date;
  plannerDays: PlannerDay[];
  onAddTask: (dateISO: string, task: InsertTask) => void;
  onToggleTask: (dateISO: string, taskId: string) => void;
  onUpdateTask: (dateISO: string, taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (dateISO: string, taskId: string) => void;
}

export function WeeklyPlanner({
  currentWeek,
  plannerDays,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}: WeeklyPlannerProps) {
  const weekDays = getWeekDays(currentWeek);

  const getTasksForDate = (date: Date): Task[] => {
    const dateISO = formatDateISO(date);
    const plannerDay = plannerDays.find((d) => d.dateISO === dateISO);
    return plannerDay?.tasks ?? [];
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-7">
      {weekDays.map((date) => {
        const dateISO = formatDateISO(date);
        return (
          <DayCard
            key={dateISO}
            date={date}
            tasks={getTasksForDate(date)}
            onAddTask={(task) => onAddTask(dateISO, task)}
            onToggleTask={(taskId) => onToggleTask(dateISO, taskId)}
            onUpdateTask={(taskId, updates) => onUpdateTask(dateISO, taskId, updates)}
            onDeleteTask={(taskId) => onDeleteTask(dateISO, taskId)}
          />
        );
      })}
    </div>
  );
}
