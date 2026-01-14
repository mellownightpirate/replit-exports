import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Info, UserPlus, X, Search, Loader2, Crown, Check } from "lucide-react";
import type { User, BuddyConnection, ChatroomMember } from "@shared/schema";

type BuddyWithConnection = { connection: BuddyConnection; buddy: User };
type MemberWithUser = ChatroomMember & { user: User };

interface ChatInfoSheetProps {
  chatroomId: number;
  chatroomName: string;
  members: MemberWithUser[];
  isAdmin: boolean;
  onMembersUpdated?: () => void;
}

export function ChatInfoSheet({ chatroomId, chatroomName, members, isAdmin, onMembersUpdated }: ChatInfoSheetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddPeople, setShowAddPeople] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuddies, setSelectedBuddies] = useState<number[]>([]);

  const { data: buddies = [] } = useQuery<BuddyWithConnection[]>({
    queryKey: ["/api/buddies"],
    enabled: showAddPeople,
  });

  const addMembersMutation = useMutation({
    mutationFn: async (userIds: number[]) => {
      const res = await apiRequest("POST", `/api/chatrooms/${chatroomId}/members`, { userIds });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatrooms", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chatrooms"] });
      setSelectedBuddies([]);
      setShowAddPeople(false);
      onMembersUpdated?.();
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/chatrooms/${chatroomId}/members/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatrooms", chatroomId] });
      queryClient.invalidateQueries({ queryKey: ["/api/chatrooms"] });
      onMembersUpdated?.();
    },
  });

  const existingMemberIds = members.map(m => m.userId);
  const availableBuddies = buddies.filter(
    b => !existingMemberIds.includes(b.buddy.id)
  );
  const filteredBuddies = availableBuddies.filter(
    b => (b.buddy.displayName || b.buddy.username).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleBuddySelection = (buddyId: number) => {
    setSelectedBuddies(prev =>
      prev.includes(buddyId) ? prev.filter(id => id !== buddyId) : [...prev, buddyId]
    );
  };

  const handleAddMembers = () => {
    if (selectedBuddies.length > 0) {
      addMembersMutation.mutate(selectedBuddies);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" data-testid="button-chat-info">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{chatroomName}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Members ({members.length})
              </h3>
              {isAdmin && !showAddPeople && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddPeople(true)}
                  data-testid="button-add-people"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add people
                </Button>
              )}
            </div>

            {showAddPeople ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setShowAddPeople(false);
                      setSelectedBuddies([]);
                      setSearchQuery("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">Add people</span>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search buddies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-buddies"
                  />
                </div>

                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {filteredBuddies.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {availableBuddies.length === 0
                          ? "All your buddies are already in this chat"
                          : "No buddies found"}
                      </p>
                    ) : (
                      filteredBuddies.map(({ buddy }) => (
                        <div
                          key={buddy.id}
                          className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                          onClick={() => toggleBuddySelection(buddy.id)}
                          data-testid={`buddy-item-${buddy.id}`}
                        >
                          <Checkbox
                            checked={selectedBuddies.includes(buddy.id)}
                            onCheckedChange={() => toggleBuddySelection(buddy.id)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={buddy.avatarUrl || undefined} />
                            <AvatarFallback>
                              {(buddy.displayName || buddy.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {buddy.displayName || buddy.username}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {selectedBuddies.length > 0 && (
                  <Button
                    className="w-full"
                    onClick={handleAddMembers}
                    disabled={addMembersMutation.isPending}
                    data-testid="button-confirm-add"
                  >
                    {addMembersMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Add {selectedBuddies.length} {selectedBuddies.length === 1 ? "person" : "people"}
                  </Button>
                )}
              </div>
            ) : (
              <ScrollArea className="h-72">
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {(member.user.displayName || member.user.username).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {member.user.displayName || member.user.username}
                          </span>
                          {member.role === "admin" && (
                            <Crown className="h-3 w-3 text-amber-500" />
                          )}
                          {member.userId === user?.id && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                        </div>
                      </div>
                      {isAdmin && member.userId !== user?.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                          disabled={removeMemberMutation.isPending}
                          data-testid={`button-remove-member-${member.userId}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <Separator />

          {!isAdmin && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (user) {
                  removeMemberMutation.mutate(user.id);
                  setIsOpen(false);
                }
              }}
              disabled={removeMemberMutation.isPending}
              data-testid="button-leave-chat"
            >
              Leave chat
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
