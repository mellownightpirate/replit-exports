import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, ThumbsUp, Heart, PartyPopper, HandHeart, Flame, Check } from "lucide-react";
import { HabitIcon } from "@/components/HabitIcon";
import type { Habit, HabitLog, User, HabitWatcher, HabitReaction, AnchorSeen } from "@shared/schema";

const REACTION_ICONS: Record<string, typeof ThumbsUp> = {
  like: ThumbsUp,
  love: Heart,
  celebrate: PartyPopper,
  support: HandHeart,
  fire: Flame,
};

const REACTION_LABELS: Record<string, string> = {
  like: "Like",
  love: "Love",
  celebrate: "Celebrate",
  support: "Support",
  fire: "On Fire",
};

interface AnchorStatusSheetProps {
  habit: Habit | null;
  log?: HabitLog;
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnchorStatusSheet({ habit, log, date, open, onOpenChange }: AnchorStatusSheetProps) {
  const { data: watchers = [] } = useQuery<(HabitWatcher & { buddy: User })[]>({
    queryKey: ["/api/habits", habit?.id, "watchers"],
    queryFn: async () => {
      if (!habit) return [];
      const res = await fetch(`/api/habits/${habit.id}/watchers`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!habit,
  });

  const { data: reactions = [] } = useQuery<(HabitReaction & { buddy: User })[]>({
    queryKey: ["/api/habit-logs", log?.id, "reactions"],
    queryFn: async () => {
      if (!log) return [];
      const res = await fetch(`/api/habit-logs/${log.id}/reactions`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!log,
  });

  const { data: seenData = [] } = useQuery<(AnchorSeen & { buddy: User })[]>({
    queryKey: ["/api/anchor-logs", log?.id, "seen"],
    queryFn: async () => {
      if (!log) return [];
      const res = await fetch(`/api/anchor-logs/${log.id}/seen`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!log,
  });

  if (!habit) return null;

  const isDone = log?.done ?? false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
        <SheetHeader className="text-left pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isDone ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>
              {isDone ? <Check className="h-5 w-5" /> : <HabitIcon emoji={habit.emoji ?? undefined} className="h-5 w-5" />}
            </div>
            <div>
              <SheetTitle>{habit.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">
                {isDone ? "Completed today" : "Not completed yet"}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 py-4 overflow-y-auto">
          <section>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Buddies Watching ({watchers.length})
            </h3>
            {watchers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No buddies watching this anchor yet.</p>
            ) : (
              <div className="space-y-2">
                {watchers.map((watcher) => (
                  <div key={watcher.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={watcher.buddy?.avatarUrl ?? undefined} />
                      <AvatarFallback>{(watcher.buddy?.displayName || watcher.buddy?.username || "?")[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{watcher.buddy?.displayName || watcher.buddy?.username}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {isDone && (
            <>
              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Seen By ({seenData.length})
                </h3>
                {seenData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No buddies have seen this check-in yet.</p>
                ) : (
                  <div className="space-y-2">
                    {seenData.map((seen) => (
                      <div key={seen.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={seen.buddy?.avatarUrl ?? undefined} />
                          <AvatarFallback>{(seen.buddy?.displayName || seen.buddy?.username || "?")[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{seen.buddy?.displayName || seen.buddy?.username}</span>
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Reactions ({reactions.length})
                </h3>
                {reactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reactions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {reactions.map((reaction) => {
                      const Icon = REACTION_ICONS[reaction.reactionType];
                      return (
                        <div key={reaction.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={reaction.buddy?.avatarUrl ?? undefined} />
                            <AvatarFallback>{(reaction.buddy?.displayName || reaction.buddy?.username || "?")[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm flex-1">{reaction.buddy?.displayName || reaction.buddy?.username}</span>
                          <Badge variant="secondary" className="gap-1">
                            {Icon && <Icon className="h-3 w-3" />}
                            {REACTION_LABELS[reaction.reactionType] || reaction.reactionType}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
