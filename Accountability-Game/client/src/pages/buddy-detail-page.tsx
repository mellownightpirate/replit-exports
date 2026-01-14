import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, Check, Eye, ThumbsUp, Heart, PartyPopper, HandHeart, Flame, BellRing, CalendarIcon, User as UserIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import type { User, Habit, HabitLog, HabitWatcher } from "@shared/schema";
import { RingChart } from "@/components/RingChart";

const REACTIONS = [
  { type: "like", icon: ThumbsUp, label: "Like" },
  { type: "love", icon: Heart, label: "Love" },
  { type: "celebrate", icon: PartyPopper, label: "Celebrate" },
  { type: "support", icon: HandHeart, label: "Support" },
  { type: "fire", icon: Flame, label: "Fire" },
] as const;

type BuddyOverview = {
  buddy: User;
  habits: Habit[];
  habitLogs: HabitLog[];
  visibility: any;
};

type WatchedHabit = HabitWatcher & {
  habit: Habit;
  owner: User;
};

export default function BuddyDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const buddyId = parseInt(params.id || "0");
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const dateISO = format(selectedDate, "yyyy-MM-dd");
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const { data: buddyOverview, isLoading } = useQuery<BuddyOverview>({
    queryKey: ["/api/buddies", buddyId, "overview", dateISO],
    queryFn: async () => {
      const res = await fetch(`/api/buddies/${buddyId}/overview?date=${dateISO}`, { credentials: "include" });
      return res.json();
    },
    enabled: buddyId > 0,
  });

  const { data: myWatchedHabits = [] } = useQuery<WatchedHabit[]>({
    queryKey: ["/api/my-watched-habits"],
  });

  type AnchorSeenStatus = { habitLogId: number; seen: boolean; seenAt: string | null };
  
  const { data: anchorsSeen = [] } = useQuery<AnchorSeenStatus[]>({
    queryKey: ["/api/buddies", buddyId, "anchors-seen", dateISO],
    queryFn: async () => {
      const res = await fetch(`/api/buddies/${buddyId}/anchors-seen?date=${dateISO}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: buddyId > 0,
  });

  const markAnchorSeenMutation = useMutation({
    mutationFn: async (logId: number) => {
      const res = await apiRequest("POST", `/api/anchor-logs/${logId}/seen`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddies", buddyId, "anchors-seen", dateISO] });
    },
  });

  const watchHabitMutation = useMutation({
    mutationFn: async ({ habitId }: { habitId: number }) => {
      const res = await apiRequest("POST", `/api/habits/${habitId}/watchers`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-watched-habits"] });
    },
  });

  const unwatchHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      await apiRequest("DELETE", `/api/habits/${habitId}/watchers`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-watched-habits"] });
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ habitId, reactionType }: { habitId: number; reactionType: string }) => {
      const res = await apiRequest("POST", `/api/habits/${habitId}/reactions`, {
        dateISO,
        reactionType,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddies", buddyId, "overview", dateISO] });
    },
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const res = await apiRequest("POST", "/api/acknowledgements", {
        subjectUserId: buddyId,
        dateISO,
        type,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddies", buddyId, "overview", dateISO] });
    },
  });

  const isWatching = (habitId: number) => myWatchedHabits.some((w) => w.habitId === habitId);
  const isAnchorSeen = (logId: number) => {
    const record = anchorsSeen.find((s) => s.habitLogId === logId);
    return record?.seen ?? false;
  };

  const getDateLabel = () => {
    if (dateISO === today) return "Today";
    if (dateISO === yesterday) return "Yesterday";
    return format(selectedDate, "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!buddyOverview) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => setLocation("/buddies")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="text-center mt-8 text-muted-foreground">Buddy not found</p>
      </div>
    );
  }

  const activeHabits = buddyOverview.habits.filter((h) => h.isActive);
  const dateLogs = buddyOverview.habitLogs.filter((l) => l.dateISO === dateISO);
  const habitsDone = dateLogs.filter((l) => l.done).length;
  const habitsTotal = activeHabits.length;
  const habitsPercent = habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0;

  const getLogForHabit = (habitId: number) => dateLogs.find((l) => l.habitId === habitId && l.done);

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <Button size="icon" variant="ghost" onClick={() => setLocation("/buddies")} data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-buddy-name">
              {buddyOverview.buddy.displayName || buddyOverview.buddy.username}
            </h1>
            <p className="text-sm text-muted-foreground">@{buddyOverview.buddy.username}</p>
          </div>
        </div>
        <Badge variant="secondary">Buddy</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={dateISO === today ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDate(new Date())}
          data-testid="button-date-today"
        >
          Today
        </Button>
        <Button
          variant={dateISO === yesterday ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedDate(subDays(new Date(), 1))}
          data-testid="button-date-yesterday"
        >
          Yesterday
        </Button>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={dateISO !== today && dateISO !== yesterday ? "default" : "outline"}
              size="sm"
              data-testid="button-date-picker"
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              {dateISO !== today && dateISO !== yesterday ? getDateLabel() : "Pick date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }
              }}
              disabled={(date) => date > new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-6">
            <RingChart percentage={habitsPercent} size={80} strokeWidth={6} />
            <div>
              <p className="text-2xl font-bold" data-testid="text-progress-percent">{habitsPercent}%</p>
              <p className="text-sm text-muted-foreground">{getDateLabel()}'s Progress</p>
              <Badge variant="secondary" className="text-xs mt-2">
                {habitsDone}/{habitsTotal} anchors
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => acknowledgeMutation.mutate({ type: "seen" })}
          disabled={acknowledgeMutation.isPending}
          data-testid="button-mark-day-seen"
        >
          <Eye className="h-4 w-4" />
          Seen Day
        </Button>
        <Button
          className="flex-1 gap-2"
          onClick={() => acknowledgeMutation.mutate({ type: "approved" })}
          disabled={acknowledgeMutation.isPending}
          data-testid="button-approve-day"
        >
          <ThumbsUp className="h-4 w-4" />
          Approve
        </Button>
      </div>

      {activeHabits.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between gap-2">
              <span>Anchors</span>
              <span className="text-sm font-normal text-muted-foreground">
                Tap icons to mark Seen or Watch
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeHabits.map((habit) => {
                const log = getLogForHabit(habit.id);
                const done = !!log;
                const watching = isWatching(habit.id);
                const seen = log ? isAnchorSeen(log.id) : false;

                return (
                  <div
                    key={habit.id}
                    className={`p-3 rounded-lg ${done ? "bg-primary/10" : "bg-muted/50"}`}
                    data-testid={`anchor-item-${habit.id}`}
                  >
                    <div className="flex items-center gap-2">
                      {done && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                      <span
                        className={`flex-1 ${done ? "line-through text-muted-foreground" : ""}`}
                      >
                        {buddyOverview.visibility?.shareHabits !== false ? habit.name : "Completed Anchor"}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {done && log && (
                          <Button
                            size="icon"
                            variant={seen ? "secondary" : "ghost"}
                            className={seen ? "toggle-elevate toggle-elevated" : ""}
                            onClick={() => {
                              if (!seen) {
                                markAnchorSeenMutation.mutate(log.id);
                              }
                            }}
                            disabled={seen || markAnchorSeenMutation.isPending}
                            data-testid={`button-mark-anchor-seen-${log.id}`}
                            title={seen ? "Already seen" : "Mark as seen"}
                          >
                            <Eye className={`h-4 w-4 ${seen ? "text-primary" : ""}`} />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant={watching ? "secondary" : "ghost"}
                          className={watching ? "toggle-elevate toggle-elevated" : ""}
                          onClick={() => {
                            if (watching) {
                              unwatchHabitMutation.mutate(habit.id);
                            } else {
                              watchHabitMutation.mutate({ habitId: habit.id });
                            }
                          }}
                          disabled={watchHabitMutation.isPending || unwatchHabitMutation.isPending}
                          data-testid={`button-watch-${habit.id}`}
                          title={watching ? "Stop watching" : "Watch this anchor"}
                        >
                          <BellRing className={`h-4 w-4 ${watching ? "text-primary" : ""}`} />
                        </Button>
                      </div>
                    </div>
                    {done && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        <span className="text-xs text-muted-foreground mr-2">React:</span>
                        {REACTIONS.map(({ type, icon: Icon, label }) => (
                          <Button
                            key={type}
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => addReactionMutation.mutate({ habitId: habit.id, reactionType: type })}
                            disabled={addReactionMutation.isPending}
                            data-testid={`button-react-${type}-${habit.id}`}
                            title={label}
                          >
                            <Icon className="h-3 w-3" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeHabits.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {buddyOverview.visibility?.shareHabits === false
              ? "This buddy has chosen not to share their anchors"
              : "No anchors to display"}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
