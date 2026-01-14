import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Check, X, User as UserIcon, Loader2, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BuddyConnection, User } from "@shared/schema";

type BuddyWithConnection = {
  connection: BuddyConnection;
  buddy: User;
};

type PendingRequest = {
  connection: BuddyConnection;
  requester: User;
};

export default function BuddiesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [inviteUsername, setInviteUsername] = useState("");

  const { data: buddies = [], isLoading: buddiesLoading } = useQuery<BuddyWithConnection[]>({
    queryKey: ["/api/buddies"],
  });

  const { data: pendingRequests = [], isLoading: pendingLoading } = useQuery<PendingRequest[]>({
    queryKey: ["/api/buddies/pending"],
  });

  const inviteMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/buddies/invite", { username });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invite");
      }
      return res.json();
    },
    onSuccess: () => {
      setInviteUsername("");
      queryClient.invalidateQueries({ queryKey: ["/api/buddies"] });
      toast({ title: "Invite sent!", description: "Your buddy request has been sent." });
    },
    onError: (error: Error) => {
      toast({ title: "Invite failed", description: error.message, variant: "destructive" });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const res = await apiRequest("POST", `/api/buddies/${connectionId}/accept`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/buddies/pending"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      await apiRequest("POST", `/api/buddies/${connectionId}/decline`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buddies/pending"] });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteUsername.trim()) {
      inviteMutation.mutate(inviteUsername.trim());
    }
  };

  const isLoading = buddiesLoading || pendingLoading;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto" data-tour="buddies-tab">
      <h1 className="text-xl font-bold">Buddies</h1>

      <Card data-tour="invite-buddy">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Invite a Buddy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              placeholder="Enter username..."
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              data-testid="input-invite-username"
            />
            <Button type="submit" disabled={inviteMutation.isPending} data-testid="button-invite">
              {inviteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>

      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingRequests.map((req) => (
              <div key={req.connection.id} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{req.requester.displayName || req.requester.username}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => acceptMutation.mutate(req.connection.id)}
                    disabled={acceptMutation.isPending}
                    data-testid={`button-accept-${req.connection.id}`}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => declineMutation.mutate(req.connection.id)}
                    disabled={declineMutation.isPending}
                    data-testid={`button-decline-${req.connection.id}`}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Your Buddies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {buddies.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              No buddies yet. Invite someone to get started!
            </p>
          ) : (
            buddies.map(({ connection, buddy }) => (
              <button
                key={connection.id}
                onClick={() => setLocation(`/buddies/${buddy.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate text-left"
                data-testid={`buddy-item-${buddy.id}`}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{buddy.displayName || buddy.username}</p>
                  <p className="text-muted-foreground text-sm">@{buddy.username}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
