import { useState, useEffect, useCallback } from "react";
import type { AppState, Habit, Task, PlannerDay, DailyHabitLog, InsertHabit, InsertTask } from "@shared/schema";
import { defaultHabits } from "@shared/schema";

const STORAGE_KEY = "habit-tracker-data";

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function createDefaultState(): AppState {
  const habits: Habit[] = defaultHabits.map((h, index) => ({
    ...h,
    id: generateId(),
    order: index,
    targetPerWeek: h.targetPerWeek ?? 7,
    isActive: h.isActive ?? true,
  }));

  return {
    habits,
    habitLogs: [],
    plannerDays: [],
  };
}

function getInitialState(): AppState {
  if (typeof window === "undefined") {
    return createDefaultState();
  }
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.error("Failed to parse saved state");
  }
  
  return createDefaultState();
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        console.error("Failed to save state to localStorage");
      }
    }
  }, [state]);

  const addHabit = useCallback((habit: InsertHabit) => {
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        {
          ...habit,
          id: generateId(),
          order: prev.habits.length,
          targetPerWeek: habit.targetPerWeek ?? 7,
          isActive: habit.isActive ?? true,
        },
      ],
    }));
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
    }));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== id),
      habitLogs: prev.habitLogs.filter((l) => l.habitId !== id),
    }));
  }, []);

  const reorderHabits = useCallback((habitIds: string[]) => {
    setState((prev) => ({
      ...prev,
      habits: habitIds
        .map((id, index) => {
          const habit = prev.habits.find((h) => h.id === id);
          return habit ? { ...habit, order: index } : null;
        })
        .filter((h): h is Habit => h !== null),
    }));
  }, []);

  const toggleHabitLog = useCallback((dateISO: string, habitId: string) => {
    setState((prev) => {
      const existingIndex = prev.habitLogs.findIndex(
        (l) => l.dateISO === dateISO && l.habitId === habitId
      );

      if (existingIndex >= 0) {
        const existing = prev.habitLogs[existingIndex];
        if (existing.done) {
          return {
            ...prev,
            habitLogs: prev.habitLogs.filter((_, i) => i !== existingIndex),
          };
        }
        return {
          ...prev,
          habitLogs: prev.habitLogs.map((l, i) =>
            i === existingIndex ? { ...l, done: true } : l
          ),
        };
      }

      return {
        ...prev,
        habitLogs: [...prev.habitLogs, { dateISO, habitId, done: true }],
      };
    });
  }, []);

  const getHabitLog = useCallback(
    (dateISO: string, habitId: string): DailyHabitLog | undefined => {
      return state.habitLogs.find(
        (l) => l.dateISO === dateISO && l.habitId === habitId
      );
    },
    [state.habitLogs]
  );

  const getPlannerDay = useCallback(
    (dateISO: string): PlannerDay => {
      return (
        state.plannerDays.find((d) => d.dateISO === dateISO) ?? {
          dateISO,
          tasks: [],
        }
      );
    },
    [state.plannerDays]
  );

  const addTask = useCallback((dateISO: string, task: InsertTask) => {
    setState((prev) => {
      const dayIndex = prev.plannerDays.findIndex((d) => d.dateISO === dateISO);
      const newTask: Task = { ...task, id: generateId() };

      if (dayIndex >= 0) {
        return {
          ...prev,
          plannerDays: prev.plannerDays.map((d, i) =>
            i === dayIndex ? { ...d, tasks: [...d.tasks, newTask] } : d
          ),
        };
      }

      return {
        ...prev,
        plannerDays: [...prev.plannerDays, { dateISO, tasks: [newTask] }],
      };
    });
  }, []);

  const updateTask = useCallback(
    (dateISO: string, taskId: string, updates: Partial<Task>) => {
      setState((prev) => ({
        ...prev,
        plannerDays: prev.plannerDays.map((d) =>
          d.dateISO === dateISO
            ? {
                ...d,
                tasks: d.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...updates } : t
                ),
              }
            : d
        ),
      }));
    },
    []
  );

  const deleteTask = useCallback((dateISO: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      plannerDays: prev.plannerDays.map((d) =>
        d.dateISO === dateISO
          ? { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }
          : d
      ),
    }));
  }, []);

  const toggleTask = useCallback((dateISO: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      plannerDays: prev.plannerDays.map((d) =>
        d.dateISO === dateISO
          ? {
              ...d,
              tasks: d.tasks.map((t) =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
            }
          : d
      ),
    }));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-tracker-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const importData = useCallback((jsonString: string) => {
    try {
      const data = JSON.parse(jsonString) as AppState;
      if (data.habits && data.habitLogs && data.plannerDays) {
        setState(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const clearAllData = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        console.error("Failed to clear localStorage");
      }
    }
    setState(createDefaultState());
  }, []);

  return {
    ...state,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleHabitLog,
    getHabitLog,
    getPlannerDay,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    exportData,
    importData,
    clearAllData,
  };
}
