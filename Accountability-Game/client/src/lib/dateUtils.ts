import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  addMonths,
  subMonths,
  isToday,
  isSameDay,
  parseISO,
  differenceInDays,
} from "date-fns";

export function getWeekDays(date: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  });
}

export function getMonthDays(date: Date): number[] {
  return Array.from({ length: getDaysInMonth(date) }, (_, i) => i + 1);
}

export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDayName(date: Date): string {
  return format(date, "EEE");
}

export function formatDayNumber(date: Date): string {
  return format(date, "d");
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatWeekRange(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
}

export { addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth, isToday, isSameDay, parseISO, differenceInDays, format };
