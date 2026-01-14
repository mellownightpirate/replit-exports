import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { HabitIcon, habitIconOptions } from "./HabitIcon";
import { Plus, Trash2, GripVertical, X, Check } from "lucide-react";
import { formatDateISO, getMonthDays, startOfMonth, isToday, parseISO } from "@/lib/dateUtils";
import type { Habit, DailyHabitLog, InsertHabit } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface HabitGridProps {
  currentMonth: Date;
  habits: Habit[];
  habitLogs: DailyHabitLog[];
  onToggleLog: (dateISO: string, habitId: string) => void;
  onAddHabit: (habit: InsertHabit) => void;
  onDeleteHabit: (id: string) => void;
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
}

export function HabitGrid({
  currentMonth,
  habits,
  habitLogs,
  onToggleLog,
  onAddHabit,
  onDeleteHabit,
  onUpdateHabit,
}: HabitGridProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("target");
  const [editingHabit, setEditingHabit] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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

  const getDailyCompletion = (day: number): number => {
    if (habits.length === 0) return 0;
    const dateISO = getDateForDay(day);
    const completed = habits.filter((h) => isLogDone(h.id, dateISO)).length;
    return Math.round((completed / habits.length) * 100);
  };

  const getHabitStats = (habitId: string) => {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let monthCompleted = 0;

    const today = new Date();
    for (let day = days.length; day >= 1; day--) {
      const dateISO = getDateForDay(day);
      const dateObj = parseISO(dateISO);
      if (dateObj > today) continue;
      
      const done = isLogDone(habitId, dateISO);
      if (done) {
        tempStreak++;
        monthCompleted++;
        if (day === today.getDate() || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 0;
        if (currentStreak === 0) currentStreak = 0;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    return { currentStreak, bestStreak, monthCompleted };
  };

  const getOverallMonthProgress = (): number => {
    if (habits.length === 0 || days.length === 0) return 0;
    const today = new Date();
    const currentDay = Math.min(today.getDate(), days.length);
    const totalPossible = habits.length * currentDay;
    if (totalPossible === 0) return 0;
    
    let completed = 0;
    for (let day = 1; day <= currentDay; day++) {
      const dateISO = getDateForDay(day);
      completed += habits.filter((h) => isLogDone(h.id, dateISO)).length;
    }
    return Math.round((completed / totalPossible) * 100);
  };

  const handleAddHabit = () => {
    if (newHabitName.trim()) {
      onAddHabit({
        name: newHabitName.trim(),
        emoji: newHabitIcon,
        targetPerWeek: 7,
        isActive: true,
      });
      setNewHabitName("");
      setNewHabitIcon("target");
      setIsAdding(false);
    }
  };

  const handleEditSave = (habitId: string) => {
    if (editName.trim()) {
      onUpdateHabit(habitId, { name: editName.trim() });
    }
    setEditingHabit(null);
    setEditName("");
  };

  const startEditing = (habit: Habit) => {
    setEditingHabit(habit.id);
    setEditName(habit.name);
  };

  const sortedHabits = [...habits].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-lg font-medium">Monthly Progress</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Overall: <span className="font-mono font-medium text-foreground">{getOverallMonthProgress()}%</span>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getOverallMonthProgress()} className="h-2" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-max">
              <div className="flex border-b">
                <div className="w-48 min-w-[192px] flex-shrink-0 p-4 font-medium text-sm border-r bg-muted/30 sticky left-0 z-10">
                  Habits
                </div>
                <div className="flex">
                  {days.map((day) => {
                    const dateISO = getDateForDay(day);
                    const dateObj = parseISO(dateISO);
                    const isTodayCell = isToday(dateObj);
                    return (
                      <div
                        key={day}
                        className={`w-9 min-w-[36px] p-2 text-center text-xs font-mono font-medium border-r last:border-r-0 ${
                          isTodayCell
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {sortedHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex border-b last:border-b-0 hover:bg-muted/20 transition-colors group"
                  data-testid={`habit-row-${habit.id}`}
                >
                  <div className="w-48 min-w-[192px] flex-shrink-0 p-3 border-r bg-background sticky left-0 z-10 flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                    <HabitIcon emoji={habit.emoji} className="w-4 h-4 text-primary shrink-0" />
                    {editingHabit === habit.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditSave(habit.id);
                            if (e.key === "Escape") setEditingHabit(null);
                          }}
                          className="h-6 text-sm flex-1"
                          autoFocus
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditSave(habit.id)}
                          className="shrink-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span
                          className="text-sm font-medium truncate flex-1 cursor-pointer"
                          onClick={() => startEditing(habit)}
                          data-testid={`habit-name-${habit.id}`}
                        >
                          {habit.name}
                        </span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`button-delete-habit-${habit.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete habit?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{habit.name}" and all its tracking data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteHabit(habit.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                  <div className="flex">
                    {days.map((day) => {
                      const dateISO = getDateForDay(day);
                      const dateObj = parseISO(dateISO);
                      const isTodayCell = isToday(dateObj);
                      const isDone = isLogDone(habit.id, dateISO);
                      const isFuture = dateObj > new Date();

                      return (
                        <button
                          key={day}
                          onClick={() => !isFuture && onToggleLog(dateISO, habit.id)}
                          disabled={isFuture}
                          className={`w-9 min-w-[36px] h-10 flex items-center justify-center border-r last:border-r-0 transition-all duration-150 ${
                            isFuture
                              ? "bg-muted/20 cursor-not-allowed"
                              : isDone
                              ? "bg-primary text-primary-foreground"
                              : isTodayCell
                              ? "bg-primary/10 hover:bg-primary/20"
                              : "hover:bg-muted/50"
                          }`}
                          data-testid={`habit-cell-${habit.id}-${day}`}
                        >
                          {isDone && <Check className="w-4 h-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex border-t bg-muted/30">
                <div className="w-48 min-w-[192px] flex-shrink-0 p-3 border-r text-xs font-medium text-muted-foreground sticky left-0 z-10 bg-muted/30">
                  Daily %
                </div>
                <div className="flex">
                  {days.map((day) => {
                    const completion = getDailyCompletion(day);
                    const dateISO = getDateForDay(day);
                    const dateObj = parseISO(dateISO);
                    const isFuture = dateObj > new Date();
                    return (
                      <div
                        key={day}
                        className={`w-9 min-w-[36px] p-2 text-center text-xs font-mono font-medium border-r last:border-r-0 ${
                          isFuture
                            ? "text-muted-foreground/30"
                            : completion >= 80
                            ? "text-primary"
                            : completion >= 50
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isFuture ? "-" : `${completion}`}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {isAdding ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <HabitIcon emoji={newHabitIcon} className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="grid grid-cols-5 gap-1 p-2">
                  {habitIconOptions.map((icon) => (
                    <DropdownMenuItem
                      key={icon}
                      onClick={() => setNewHabitIcon(icon)}
                      className="p-2 justify-center"
                    >
                      <HabitIcon emoji={icon} className="w-4 h-4" />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="New habit name..."
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddHabit();
                  if (e.key === "Escape") setIsAdding(false);
                }}
                data-testid="input-new-habit"
              />
              <Button onClick={handleAddHabit} data-testid="button-save-habit">
                Add
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsAdding(true)}
          data-testid="button-add-habit"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Habit
        </Button>
      )}

      {sortedHabits.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Habit Streaks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedHabits.map((habit) => {
              const stats = getHabitStats(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <HabitIcon emoji={habit.emoji} className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm flex-1 truncate">{habit.name}</span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">
                      <span className="text-primary font-medium">{stats.currentStreak}</span> streak
                    </span>
                    <span className="font-mono">
                      Best: <span className="text-foreground font-medium">{stats.bestStreak}</span>
                    </span>
                    <span className="font-mono">
                      Month: <span className="text-foreground font-medium">{stats.monthCompleted}</span>/{days.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
