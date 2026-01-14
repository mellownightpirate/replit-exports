import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Check, Settings, Eye, ThumbsUp, Heart, PartyPopper, HandHeart, Flame } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import type { Habit, HabitLog, Acknowledgement, User, HabitWatcher, HabitReaction } from "@shared/schema";
import { RingChart } from "@/components/RingChart";
import { HabitIcon } from "@/components/HabitIcon";
import { AddHabitDialog } from "@/components/AddHabitDialog";
import { AnchorStatusSheet } from "@/components/AnchorStatusSheet";

const REACTION_ICONS: Record<string, typeof ThumbsUp> = {
  like: ThumbsUp,
  love: Heart,
  celebrate: PartyPopper,
  support: HandHeart,
  fire: Flame,
};

type WatcherData = Record<number, { count: number; watchers: (HabitWatcher & { buddy: User })[] }>;
type ReactionData = Record<number, { counts: Record<string, number>; reactions: (HabitReaction & { buddy: User })[] }>;

export default function TodayPage() {
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedAnchor, setSelectedAnchor] = useState<Habit | null>(null);

  const { data: habits = [], isLoading: habitsLoading } = useQuery<Habit[]>({
    queryKey: ["/api/habits"],
  });

  const { data: habitLogs = [], isLoading: logsLoading } = useQuery<HabitLog[]>({
    queryKey: ["/api/habit-logs"],
  });

  const { data: acknowledgements = [] } = useQuery<(Acknowledgement & { buddy: User })[]>({
    queryKey: ["/api/acknowledgements", { date: today }],
    queryFn: async () => {
      const res = await fetch(`/api/acknowledgements?date=${today}`, { credentials: "include" });
      return res.json();
    },
  });

  const { data: watcherData = {} } = useQuery<WatcherData>({
    queryKey: ["/api/my-habits-watchers"],
  });

  const { data: reactionData = {} } = useQuery<ReactionData>({
    queryKey: ["/api/my-habits-reactions", { date: today }],
    queryFn: async () => {
      const res = await fetch(`/api/my-habits-reactions?date=${today}`, { credentials: "include" });
      return res.json();
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

  const activeHabits = habits.filter((h) => h.isActive);
  const todayLogs = habitLogs.filter((l) => l.dateISO === today);

  const habitsDone = todayLogs.filter((l) => l.done).length;
  const habitsTotal = activeHabits.length;
  const habitsPercent = habitsTotal > 0 ? Math.round((habitsDone / habitsTotal) * 100) : 0;

  const isHabitDone = (habitId: number) => {
    return todayLogs.some((l) => l.habitId === habitId && l.done);
  };

  const getHabitLog = (habitId: number) => {
    return todayLogs.find((l) => l.habitId === habitId);
  };

  const isLoading = habitsLoading || logsLoading;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <div className="text-center">
        <p className="text-muted-foreground text-sm">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="text-xl font-bold">Today</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-6">
            <RingChart percentage={habitsPercent} size={100} strokeWidth={8} />
            <div className="text-left">
              <p className="text-3xl font-bold">{habitsPercent}%</p>
              <p className="text-muted-foreground text-sm">Today's Progress</p>
              <Badge variant="secondary" className="text-xs mt-2">{habitsDone}/{habitsTotal} anchors</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {acknowledgements.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accountability Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {acknowledgements.map((ack) => (
                <Badge key={ack.id} variant="outline" className="gap-1">
                  <Check className="h-3 w-3" />
                  {ack.buddy?.displayName || ack.buddy?.username} - {ack.type}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-tour="anchors-section">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold">Anchors</CardTitle>
            <div className="flex items-center gap-1">
              <AddHabitDialog
                trigger={
                  <Button size="icon" variant="ghost" data-testid="button-add-anchor-today" data-tour="add-anchor-today">
                    <Plus className="h-4 w-4" />
                  </Button>
                }
              />
              <Link href="/habits">
                <Button size="icon" variant="ghost" data-testid="button-manage-anchors">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {activeHabits.map((habit) => {
            const done = isHabitDone(habit.id);
            const log = getHabitLog(habit.id);
            const watchers = watcherData[habit.id];
            const reactions = reactionData[habit.id];
            const hasWatchers = watchers && watchers.count > 0;
            const hasReactions = reactions && Object.keys(reactions.counts).length > 0;
            
            return (
              <div
                key={habit.id}
                className={`p-3 rounded-lg transition-colors ${
                  done ? "bg-primary/10" : "bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabitMutation.mutate({ habitId: habit.id, dateISO: today })}
                    disabled={toggleHabitMutation.isPending}
                    className="flex-shrink-0"
                    data-testid={`habit-toggle-${habit.id}`}
                    data-tour="habit-toggle"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center hover-elevate ${
                      done ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {done ? <Check className="h-4 w-4" /> : <HabitIcon emoji={habit.emoji ?? undefined} className="h-4 w-4" />}
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedAnchor(habit)}
                    className="flex-1 text-left hover-elevate rounded-md px-2 py-1"
                    data-testid={`habit-details-${habit.id}`}
                  >
                    <span className={done ? "line-through text-muted-foreground" : ""}>
                      {habit.name}
                    </span>
                  </button>
                  {done && <Check className="h-4 w-4 text-primary" />}
                </div>
                
                {(hasWatchers || hasReactions) && (
                  <div className="flex items-center gap-2 mt-2 ml-11 flex-wrap">
                    {hasWatchers && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Eye className="h-3 w-3" />
                            {watchers.count}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{watchers.count} {watchers.count === 1 ? 'buddy is' : 'buddies are'} watching this anchor</p>
                          {watchers.watchers.map(w => (
                            <p key={w.id} className="text-xs text-muted-foreground">
                              {w.buddy?.displayName || w.buddy?.username}
                            </p>
                          ))}
                        </TooltipContent>
                      </Tooltip>
                    )}
                    
                    {hasReactions && Object.entries(reactions.counts).map(([type, count]) => {
                      const Icon = REACTION_ICONS[type];
                      if (!Icon) return null;
                      return (
                        <Tooltip key={type}>
                          <TooltipTrigger asChild>
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Icon className="h-3 w-3" />
                              {count}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{count} {type} reaction{count !== 1 ? 's' : ''}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AnchorStatusSheet
        habit={selectedAnchor}
        log={selectedAnchor ? getHabitLog(selectedAnchor.id) : undefined}
        date={today}
        open={!!selectedAnchor}
        onOpenChange={(open) => !open && setSelectedAnchor(null)}
      />
    </div>
  );
}
