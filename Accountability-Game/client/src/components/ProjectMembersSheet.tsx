import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Info, UserPlus, Loader2, Crown, X, Clock, UserCheck } from "lucide-react";
import type { User, ProjectMember } from "@shared/schema";

interface ProjectMembersSheetProps {
  projectId: number;
  projectName: string;
  ownerId: number;
  isOwner: boolean;
  onMembersUpdated?: () => void;
}

interface MemberWithUser extends ProjectMember {
  user?: Partial<User> | null;
}

interface BuddyConnection {
  id: number;
  status: string;
  buddy: Partial<User>;
}

export default function ProjectMembersSheet({
  projectId,
  projectName,
  ownerId,
  isOwner,
  onMembersUpdated
}: ProjectMembersSheetProps) {
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedBuddies, setSelectedBuddies] = useState<number[]>([]);
  const [addMode, setAddMode] = useState<"invite" | "direct">("invite");
  const { toast } = useToast();

  const { data: members = [], isLoading: membersLoading } = useQuery<MemberWithUser[]>({
    queryKey: ["/api/projects", projectId, "members"],
    enabled: open,
  });

  const { data: buddies = [] } = useQuery<BuddyConnection[]>({
    queryKey: ["/api/buddies"],
    enabled: addDialogOpen,
  });

  const addMembersMutation = useMutation({
    mutationFn: async ({ userIds, mode }: { userIds: number[]; mode: "invite" | "direct" }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/invite`, {
        userIds,
        mode
      });
      return res.json();
    },
    onSuccess: (_, { mode }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "members"] });
      setSelectedBuddies([]);
      setAddDialogOpen(false);
      onMembersUpdated?.();
      toast({ title: mode === "invite" ? "Invitations sent" : "Members added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add members", description: error.message, variant: "destructive" });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/projects/${projectId}/members/${userId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "members"] });
      onMembersUpdated?.();
      toast({ title: "Member removed" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove member", description: error.message, variant: "destructive" });
    }
  });

  const memberUserIds = members.map(m => m.userId);
  const availableBuddies = buddies.filter(b => 
    b.status === "accepted" && !memberUserIds.includes(b.buddy.id!)
  );

  const toggleBuddy = (buddyId: number) => {
    setSelectedBuddies(prev => 
      prev.includes(buddyId) ? prev.filter(id => id !== buddyId) : [...prev, buddyId]
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" data-testid="button-project-info">
          <Info className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{projectName}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Members ({members.length})</h3>
            {isOwner && (
              <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" data-testid="button-add-project-member">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Members</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <RadioGroup value={addMode} onValueChange={(v) => setAddMode(v as "invite" | "direct")} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="invite" id="mode-invite" />
                        <Label htmlFor="mode-invite" className="text-sm cursor-pointer">Send invitation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="direct" id="mode-direct" />
                        <Label htmlFor="mode-direct" className="text-sm cursor-pointer">Add directly</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      {addMode === "invite" 
                        ? "They will receive an invitation they need to accept" 
                        : "They will be added immediately as active members"}
                    </p>
                  </div>
                  
                  <ScrollArea className="max-h-[250px]">
                    {availableBuddies.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No buddies available to add
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {availableBuddies.map((connection) => (
                          <div
                            key={connection.buddy.id}
                            className="flex items-center gap-3 p-2 rounded-md hover-elevate cursor-pointer"
                            onClick={() => toggleBuddy(connection.buddy.id!)}
                          >
                            <Checkbox
                              checked={selectedBuddies.includes(connection.buddy.id!)}
                              onCheckedChange={() => toggleBuddy(connection.buddy.id!)}
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={connection.buddy.avatarUrl || undefined} />
                              <AvatarFallback>
                                {(connection.buddy.displayName || connection.buddy.username || "?")[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {connection.buddy.displayName || connection.buddy.username}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  {availableBuddies.length > 0 && (
                    <Button
                      onClick={() => addMembersMutation.mutate({ userIds: selectedBuddies, mode: addMode })}
                      disabled={selectedBuddies.length === 0 || addMembersMutation.isPending}
                      data-testid="button-confirm-add-project-members"
                    >
                      {addMembersMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {addMode === "invite" ? "Send Invites" : "Add"} {selectedBuddies.length > 0 ? `(${selectedBuddies.length})` : ""}
                    </Button>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>

          <ScrollArea className="flex-1">
            {membersLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2">
                {[...members]
                  .sort((a, b) => {
                    if (a.userId === ownerId) return -1;
                    if (b.userId === ownerId) return 1;
                    if (a.status === "active" && b.status !== "active") return -1;
                    if (b.status === "active" && a.status !== "active") return 1;
                    return 0;
                  })
                  .map((member) => {
                  const isProjectOwner = member.userId === ownerId;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-2 rounded-md"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user?.avatarUrl || undefined} />
                        <AvatarFallback>
                          {(member.user?.displayName || member.user?.username || "?")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.user?.displayName || member.user?.username}
                        </p>
                        <div className="flex items-center gap-1">
                          {isProjectOwner && (
                            <Badge variant="secondary" className="text-xs">
                              <Crown className="h-3 w-3 mr-1" />
                              Owner
                            </Badge>
                          )}
                          {member.status === "active" && !isProjectOwner && (
                            <Badge variant="outline" className="text-xs">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Member
                            </Badge>
                          )}
                          {member.status === "invited" && (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isOwner && !isProjectOwner && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeMemberMutation.mutate(member.userId)}
                          disabled={removeMemberMutation.isPending}
                          data-testid={`button-remove-project-member-${member.userId}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
