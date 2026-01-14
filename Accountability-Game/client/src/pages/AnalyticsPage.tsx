import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDate, getDaysInMonth, isSameMonth, startOfWeek, endOfWeek, getDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, Target, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { Habit, HabitLog, Task } from "@shared/schema";
import { RingChart } from "@/components/RingChart";

export function AnalyticsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: habitLogs = [], isLoading: logsLoading } = useQuery<HabitLog[]>({
    queryKey: ["/api/habit-logs"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const activeHabits = habits.filter(h => h.isActive);

  const isLogDone = (habitId: number, dateISO: string): boolean => {
    return habitLogs.some(l => l.habitId === habitId && l.dateISO === dateISO && l.done);
  };

  const getMonthCompletionRate = (): number => {
    if (activeHabits.length === 0) return 0;
    let totalDone = 0;
    let totalPossible = 0;
    const today = new Date();
    const daysToCount = isSameMonth(currentMonth, today) ? getDate(today) : daysInMonth;

    for (let day = 1; day <= daysToCount; day++) {
      const dateISO = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), "yyyy-MM-dd");
      totalPossible += activeHabits.length;
      totalDone += activeHabits.filter(h => isLogDone(h.id, dateISO)).length;
    }
    return totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  };

  const getDailyTrendData = () => {
    const data = [];
    const today = new Date();
    const daysToShow = isSameMonth(currentMonth, today) ? getDate(today) : daysInMonth;

    for (let day = 1; day <= daysToShow; day++) {
      const dateISO = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), "yyyy-MM-dd");
      const done = activeHabits.filter(h => isLogDone(h.id, dateISO)).length;
      const percent = activeHabits.length > 0 ? Math.round((done / activeHabits.length) * 100) : 0;
      data.push({ day, percent });
    }
    return data;
  };

  const getHabitPerformance = () => {
    const today = new Date();
    const daysToCount = isSameMonth(currentMonth, today) ? getDate(today) : daysInMonth;

    return activeHabits.map(habit => {
      let done = 0;
      for (let day = 1; day <= daysToCount; day++) {
        const dateISO = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day), "yyyy-MM-dd");
        if (isLogDone(habit.id, dateISO)) done++;
      }
      const percent = daysToCount > 0 ? Math.round((done / daysToCount) * 100) : 0;
      return { name: habit.name, percent, done, total: daysToCount };
    }).sort((a, b) => b.percent - a.percent);
  };

  const getBestDayOfWeek = () => {
    const dayStats: { [key: number]: { done: number; total: number } } = {};
    for (let i = 0; i < 7; i++) dayStats[i] = { done: 0, total: 0 };

    const today = new Date();
    const daysToCount = isSameMonth(currentMonth, today) ? getDate(today) : daysInMonth;

    for (let day = 1; day <= daysToCount; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayOfWeek = getDay(date);
      const dateISO = format(date, "yyyy-MM-dd");
      
      dayStats[dayOfWeek].total += activeHabits.length;
      dayStats[dayOfWeek].done += activeHabits.filter(h => isLogDone(h.id, dateISO)).length;
    }

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let bestDay = 0;
    let bestPercent = 0;

    for (let i = 0; i < 7; i++) {
      const percent = dayStats[i].total > 0 ? (dayStats[i].done / dayStats[i].total) * 100 : 0;
      if (percent > bestPercent) {
        bestPercent = percent;
        bestDay = i;
      }
    }

    return { day: dayNames[bestDay], percent: Math.round(bestPercent) };
  };

  const getWeeklyTaskCompletion = () => {
    const monthTasks = tasks.filter(t => {
      const taskDate = new Date(t.dateISO);
      return taskDate.getMonth() === currentMonth.getMonth() && taskDate.getFullYear() === currentMonth.getFullYear();
    });
    const done = monthTasks.filter(t => t.done).length;
    const total = monthTasks.length;
    return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const isLoading = habitsLoading || logsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 pb-24">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const monthRate = getMonthCompletionRate();
  const dailyTrend = getDailyTrendData();
  const habitPerformance = getHabitPerformance();
  const bestDay = getBestDayOfWeek();
  const taskCompletion = getWeeklyTaskCompletion();
  const topPerformer = habitPerformance[0];
  const needsAttention = habitPerformance.length > 0 ? habitPerformance[habitPerformance.length - 1] : null;

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2">
        <Button size="icon" variant="ghost" onClick={handlePrevMonth} data-testid="button-prev-month">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button size="icon" variant="ghost" onClick={handleNextMonth} data-testid="button-next-month">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <RingChart percentage={monthRate} size={80} strokeWidth={6} />
            <p className="mt-2 text-sm text-muted-foreground">Month Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary">{taskCompletion.percent}%</div>
            <p className="text-sm text-muted-foreground">Tasks Done</p>
            <p className="text-xs text-muted-foreground">{taskCompletion.done}/{taskCompletion.total}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Daily Completion Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`${value}%`, "Completion"]} />
                <Line type="monotone" dataKey="percent" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" />
            Anchor Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {habitPerformance.map(habit => (
            <div key={habit.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{habit.name}</span>
                <span className="text-muted-foreground">{habit.percent}%</span>
              </div>
              <Progress value={habit.percent} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Award className="h-4 w-4" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-sm">Best Day</span>
            <span className="font-semibold">{bestDay.day} ({bestDay.percent}%)</span>
          </div>
          {topPerformer && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <span className="text-sm">Top Performer</span>
              <span className="font-semibold">{topPerformer.name} ({topPerformer.percent}%)</span>
            </div>
          )}
          {needsAttention && needsAttention.percent < 50 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10">
              <span className="text-sm">Needs Attention</span>
              <span className="font-semibold">{needsAttention.name} ({needsAttention.percent}%)</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
