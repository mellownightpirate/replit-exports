import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RingChart } from "./RingChart";
import { HabitIcon } from "./HabitIcon";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  formatDateISO,
  getMonthDays,
  getWeekDays,
  startOfMonth,
  parseISO,
  format,
} from "@/lib/dateUtils";
import type { Habit, DailyHabitLog, PlannerDay } from "@shared/schema";
import { TrendingUp, TrendingDown, Flame, Award, Calendar } from "lucide-react";

interface AnalyticsProps {
  currentMonth: Date;
  habits: Habit[];
  habitLogs: DailyHabitLog[];
  plannerDays: PlannerDay[];
}

export function Analytics({
  currentMonth,
  habits,
  habitLogs,
  plannerDays,
}: AnalyticsProps) {
  const days = getMonthDays(currentMonth);
  const monthStart = startOfMonth(currentMonth);

  const getDateForDay = (day: number): string => {
    const date = new Date(monthStart);
    date.setDate(day);
    return formatDateISO(date);
  };

  const isLogDone = (habitId: string, dateISO: string): boolean => {
    return habitLogs.some(
      (log) => log.habitId === habitId && log.dateISO === dateISO && log.done
    );
  };

  const monthlyStats = useMemo(() => {
    const today = new Date();
    const currentDay = Math.min(today.getDate(), days.length);
    const totalPossible = habits.length * currentDay;

    let completed = 0;
    for (let day = 1; day <= currentDay; day++) {
      const dateISO = getDateForDay(day);
      completed += habits.filter((h) => isLogDone(h.id, dateISO)).length;
    }

    return {
      completed,
      total: totalPossible,
      percentage: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
    };
  }, [habits, habitLogs, days, monthStart]);

  const weeklyStats = useMemo(() => {
    const weekDays = getWeekDays(new Date());
    let tasksDone = 0;
    let tasksTotal = 0;

    weekDays.forEach((day) => {
      const dateISO = formatDateISO(day);
      const plannerDay = plannerDays.find((p) => p.dateISO === dateISO);
      if (plannerDay) {
        tasksTotal += plannerDay.tasks.length;
        tasksDone += plannerDay.tasks.filter((t) => t.done).length;
      }
    });

    return {
      tasksDone,
      tasksTotal,
      percentage: tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0,
    };
  }, [plannerDays]);

  const dailyTrendData = useMemo(() => {
    const today = new Date();
    const currentDay = Math.min(today.getDate(), days.length);

    return Array.from({ length: currentDay }, (_, i) => {
      const day = i + 1;
      const dateISO = getDateForDay(day);
      const completed = habits.filter((h) => isLogDone(h.id, dateISO)).length;
      const percentage = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;

      return {
        day,
        percentage,
        date: format(parseISO(dateISO), "MMM d"),
      };
    });
  }, [habits, habitLogs, days, monthStart]);

  const habitComparisonData = useMemo(() => {
    const today = new Date();
    const currentDay = Math.min(today.getDate(), days.length);

    return habits.map((habit) => {
      let completed = 0;
      for (let day = 1; day <= currentDay; day++) {
        const dateISO = getDateForDay(day);
        if (isLogDone(habit.id, dateISO)) completed++;
      }

      return {
        name: habit.name,
        completed,
        target: currentDay,
        percentage: currentDay > 0 ? Math.round((completed / currentDay) * 100) : 0,
        emoji: habit.emoji,
      };
    });
  }, [habits, habitLogs, days, monthStart]);

  const insights = useMemo(() => {
    const sorted = [...habitComparisonData].sort((a, b) => b.percentage - a.percentage);
    const topHabits = sorted.slice(0, 3);
    const lowestHabit = sorted[sorted.length - 1];

    const dayStats: Record<string, { total: number; completed: number }> = {};
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    dayNames.forEach((d) => (dayStats[d] = { total: 0, completed: 0 }));

    const today = new Date();
    for (let day = 1; day <= Math.min(today.getDate(), days.length); day++) {
      const dateISO = getDateForDay(day);
      const dateObj = parseISO(dateISO);
      const dayName = dayNames[dateObj.getDay()];
      dayStats[dayName].total += habits.length;
      dayStats[dayName].completed += habits.filter((h) => isLogDone(h.id, dateISO)).length;
    }

    let bestDay = { name: "-", percentage: 0 };
    Object.entries(dayStats).forEach(([name, stats]) => {
      const pct = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      if (pct > bestDay.percentage) {
        bestDay = { name, percentage: Math.round(pct) };
      }
    });

    return { topHabits, lowestHabit, bestDay };
  }, [habitComparisonData, habits, habitLogs, days, monthStart]);

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No anchors tracked yet.</p>
          <p className="text-sm text-muted-foreground">
            Add some anchors in the Monthly tab to see analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Month Completion
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-bold font-mono font-tabular">
                {monthlyStats.percentage}%
              </p>
              <p className="text-xs text-muted-foreground">
                {monthlyStats.completed} / {monthlyStats.total} anchors
              </p>
            </div>
            <RingChart percentage={monthlyStats.percentage} size={64} strokeWidth={6} showLabel={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-3xl font-bold font-mono font-tabular">
                {weeklyStats.percentage}%
              </p>
              <p className="text-xs text-muted-foreground">
                {weeklyStats.tasksDone} / {weeklyStats.tasksTotal} tasks
              </p>
            </div>
            <RingChart percentage={weeklyStats.percentage} size={64} strokeWidth={6} showLabel={false} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Best Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{insights.bestDay.name}</p>
            <p className="text-xs text-muted-foreground">
              {insights.bestDay.percentage}% avg completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              Total Anchors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold font-mono font-tabular">{habits.length}</p>
            <p className="text-xs text-muted-foreground">
              {habits.filter((h) => h.isActive).length} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Daily Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelFormatter={(_, payload) =>
                    payload[0]?.payload?.date || ""
                  }
                  formatter={(value: number) => [`${value}%`, "Completion"]}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Habit Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habitComparisonData.map((habit) => (
              <div key={habit.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <HabitIcon emoji={habit.emoji} className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm truncate">{habit.name}</span>
                  </div>
                  <span className="text-sm font-mono font-tabular text-muted-foreground">
                    {habit.completed}/{habit.target}
                  </span>
                </div>
                <Progress value={habit.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Habit Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Completion"]}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Top Performers</span>
              </div>
              <ul className="space-y-1">
                {insights.topHabits.map((habit, i) => (
                  <li key={habit.name} className="text-sm flex items-center gap-2">
                    <span className="text-muted-foreground">{i + 1}.</span>
                    <HabitIcon emoji={habit.emoji} className="w-3 h-3" />
                    <span className="truncate flex-1">{habit.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {habit.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Needs Attention</span>
              </div>
              {insights.lowestHabit && (
                <div className="text-sm flex items-center gap-2">
                  <HabitIcon emoji={insights.lowestHabit.emoji} className="w-4 h-4" />
                  <span className="truncate flex-1">{insights.lowestHabit.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {insights.lowestHabit.percentage}%
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-md bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-chart-2" />
                <span className="text-sm font-medium">Best Day of Week</span>
              </div>
              <p className="text-2xl font-bold">{insights.bestDay.name}</p>
              <p className="text-xs text-muted-foreground">
                Average {insights.bestDay.percentage}% completion
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
