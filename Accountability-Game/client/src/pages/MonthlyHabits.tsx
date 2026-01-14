import { useQuery, useMutation } from "@tanstack/react-query";
import { format, getDate, getDaysInMonth, isSameMonth } from "date-fns";
import { useState } from "react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Trash2, Check, Settings } from "lucide-react";
import type { Habit, HabitLog } from "@shared/schema";
import { HabitIcon } from "@/components/HabitIcon";
import { AddHabitDialog } from "@/components/AddHabitDialog";

export function MonthlyHabits() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: habitLogs = [], isLoading: logsLoading } = useQuery<HabitLog[]>({
    queryKey: ["/api/habit-logs"],
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs"] });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, dateISO }: { habitId: number; dateISO: string }) => {
      const res = await apiRequest("POST", "/api/habit-logs/toggle", { habitId, dateISO });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs"] });
    },
  });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const activeHabits = habits.filter(h => h.isActive);

  const isLogDone = (habitId: number, day: number): boolean => {
    const dateISO = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), "yyyy-MM-dd");
    return habitLogs.some(l => l.habitId === habitId && l.dateISO === dateISO && l.done);
  };

  const getDayCompletionPercent = (day: number): number => {
    if (activeHabits.length === 0) return 0;
    const done = activeHabits.filter(h => isLogDone(h.id, day)).length;
    return Math.round((done / activeHabits.length) * 100);
  };

  const getOverallMonthPercent = (): number => {
    if (activeHabits.length === 0 || daysInMonth === 0) return 0;
    let totalDone = 0;
    let totalPossible = 0;
    const today = new Date();
    const daysToCount = isSameMonth(currentMonth, today) ? getDate(today) : daysInMonth;
    
    for (let day = 1; day <= daysToCount; day++) {
      totalPossible += activeHabits.length;
      totalDone += activeHabits.filter(h => isLogDone(h.id, day)).length;
    }
    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  };

  const isLoading = habitsLoading || logsLoading;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 pb-24">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <Button size="icon" variant="ghost" onClick={handlePrevMonth} data-testid="button-prev-month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button size="icon" variant="ghost" onClick={handleNextMonth} data-testid="button-next-month">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Month Progress</CardTitle>
            <span className="text-lg font-bold text-primary">{getOverallMonthPercent()}%</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getOverallMonthPercent()} className="h-2" />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <AddHabitDialog />
        <Link href="/habits">
          <Button size="sm" variant="outline" className="gap-1" data-testid="button-manage-habits-monthly">
            <Settings className="h-4 w-4" />
            Manage
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2 sticky left-0 bg-background min-w-[120px]">Anchor</th>
              {monthDays.map(day => (
                <th key={day} className="text-center p-1 min-w-[28px]">{day}</th>
              ))}
              <th className="text-center p-2 min-w-[48px]"></th>
            </tr>
          </thead>
          <tbody>
            {activeHabits.map(habit => (
              <tr key={habit.id} className="border-t">
                <td className="p-2 sticky left-0 bg-background">
                  <div className="flex items-center gap-2">
                    <HabitIcon emoji={habit.emoji ?? undefined} className="h-4 w-4" />
                    <span className="truncate">{habit.name}</span>
                  </div>
                </td>
                {monthDays.map(day => {
                  const done = isLogDone(habit.id, day);
                  const dateISO = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), "yyyy-MM-dd");
                  return (
                    <td key={day} className="text-center p-1">
                      <button
                        onClick={() => toggleHabitMutation.mutate({ habitId: habit.id, dateISO })}
                        className={`w-6 h-6 rounded-sm flex items-center justify-center ${
                          done ? "bg-primary text-primary-foreground" : "bg-muted hover-elevate"
                        }`}
                        data-testid={`habit-cell-${habit.id}-${day}`}
                      >
                        {done && <Check className="h-3 w-3" />}
                      </button>
                    </td>
                  );
                })}
                <td className="text-center p-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteHabitMutation.mutate(habit.id)}
                    disabled={deleteHabitMutation.isPending}
                    data-testid={`delete-habit-${habit.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
            <tr className="border-t bg-muted/50">
              <td className="p-2 sticky left-0 bg-muted/50 font-medium text-muted-foreground">Daily %</td>
              {monthDays.map(day => (
                <td key={day} className="text-center p-1 text-xs text-muted-foreground">
                  {getDayCompletionPercent(day)}
                </td>
              ))}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {activeHabits.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No anchors yet. Add one to get started!
        </p>
      )}
    </div>
  );
}
