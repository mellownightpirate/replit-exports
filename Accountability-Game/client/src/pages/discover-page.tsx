import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, UserPlus, Loader2 } from "lucide-react";

type PublicUser = {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<PublicUser[]>({
    queryKey: searchQuery.length >= 2 
      ? ["/api/discover/search", searchQuery]
      : ["/api/discover/users"],
    queryFn: async () => {
      if (searchQuery.length >= 2) {
        const res = await fetch(`/api/discover/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      } else {
        const res = await fetch("/api/discover/users");
        if (!res.ok) throw new Error("Failed to load users");
        return res.json();
      }
    },
    staleTime: 30000,
  });

  const inviteMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("POST", "/api/buddies/invite", { receiverId: userId });
    },
    onSuccess: () => {
      toast({ title: "Buddy request sent!" });
      queryClient.invalidateQueries({ queryKey: ["/api/buddies"] });
    },
    onError: () => {
      toast({ title: "Failed to send request", variant: "destructive" });
    },
  });

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto" data-tour="discover-section">
      <div className="sticky top-12 bg-background pt-4 pb-2 z-30">
        <h2 className="text-xl font-semibold mb-4">Discover Buddies</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-discover-search"
          />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery.length >= 2 
              ? "No users found matching your search"
              : "No public users to discover yet"}
          </div>
        ) : (
          users.map((user) => (
            <Card key={user.id} data-testid={`card-user-${user.id}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback>
                      {(user.displayName || user.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" data-testid={`text-username-${user.id}`}>
                      {user.displayName || user.username}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{user.username}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => inviteMutation.mutate(user.id)}
                    disabled={inviteMutation.isPending}
                    data-testid={`button-add-buddy-${user.id}`}
                  >
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
