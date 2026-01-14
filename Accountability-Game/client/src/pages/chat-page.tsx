import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Send, Users, User as UserIcon, ArrowLeft, MessageSquare, Loader2, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ChatInfoSheet } from "@/components/ChatInfoSheet";
import type { Chatroom, ChatMessage, User, BuddyConnection, ChatroomMember } from "@shared/schema";

type MemberWithUser = ChatroomMember & { user: User };
type ChatroomWithMembers = Chatroom & { members: MemberWithUser[] };
type MessageWithUser = ChatMessage & { user: User; isSystemMessage?: boolean };
type BuddyWithConnection = { connection: BuddyConnection; buddy: User };

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [selectedBuddies, setSelectedBuddies] = useState<number[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatrooms = [], isLoading: roomsLoading } = useQuery<ChatroomWithMembers[]>({
    queryKey: ["/api/chatrooms"],
  });

  const { data: buddies = [] } = useQuery<BuddyWithConnection[]>({
    queryKey: ["/api/buddies"],
  });

  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery<MessageWithUser[]>({
    queryKey: ["/api/chatrooms", selectedRoom, "messages"],
    queryFn: async () => {
      if (!selectedRoom) return [];
      const res = await fetch(`/api/chatrooms/${selectedRoom}/messages`, { credentials: "include" });
      return res.json();
    },
    enabled: !!selectedRoom,
    refetchInterval: selectedRoom ? 5000 : false,
  });

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chatrooms", {
        name: newRoomName,
        memberIds: selectedBuddies,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatrooms"] });
      setNewRoomName("");
      setSelectedBuddies([]);
      setCreateDialogOpen(false);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/chatrooms/${selectedRoom}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      refetchMessages();
      setNewMessage("");
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedRoom) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const toggleBuddySelection = (buddyId: number) => {
    setSelectedBuddies((prev) =>
      prev.includes(buddyId) ? prev.filter((id) => id !== buddyId) : [...prev, buddyId]
    );
  };

  if (roomsLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (selectedRoom) {
    const currentRoom = chatrooms.find((r) => r.id === selectedRoom);
    const currentMember = currentRoom?.members.find(m => m.userId === user?.id);
    const isAdmin = currentMember?.role === "admin";
    
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center gap-3 p-4 border-b">
          <Button size="icon" variant="ghost" onClick={() => setSelectedRoom(null)} data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold">{currentRoom?.name}</h2>
            <p className="text-sm text-muted-foreground">
              {currentRoom?.members.length} members
            </p>
          </div>
          {currentRoom && (
            <ChatInfoSheet
              chatroomId={currentRoom.id}
              chatroomName={currentRoom.name}
              members={currentRoom.members}
              isAdmin={isAdmin}
              onMembersUpdated={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/chatrooms"] });
              }}
            />
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messagesLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.userId === user?.id;
                const isSystem = message.isSystemMessage;
                
                if (isSystem) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                        {message.content}
                      </p>
                    </div>
                  );
                }
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {!isOwn && (
                        <p className="text-xs font-medium mb-1">
                          {message.user?.displayName || message.user?.username}
                        </p>
                      )}
                      <p className="break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              data-testid="input-message"
            />
            <Button type="submit" disabled={sendMessageMutation.isPending} data-testid="button-send">
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Chats</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" data-testid="button-new-chat">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Chat Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input
                placeholder="Room name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                data-testid="input-room-name"
              />
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Add Buddies</p>
                {buddies.filter(b => b.connection.status === "accepted").map(({ buddy }) => (
                  <button
                    key={buddy.id}
                    type="button"
                    onClick={() => toggleBuddySelection(buddy.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                      selectedBuddies.includes(buddy.id) ? "bg-primary/10 border border-primary" : "bg-muted/50"
                    }`}
                    data-testid={`select-buddy-${buddy.id}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span>{buddy.displayName || buddy.username}</span>
                  </button>
                ))}
              </div>
              
              <Button
                className="w-full"
                onClick={() => createRoomMutation.mutate()}
                disabled={!newRoomName.trim() || selectedBuddies.length === 0 || createRoomMutation.isPending}
                data-testid="button-create-room"
              >
                {createRoomMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Create Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {chatrooms.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No chats yet</p>
            <p className="text-sm">Create a chat room to message your buddies</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {chatrooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoom(room.id)}
              className="w-full p-4 rounded-lg bg-muted/50 hover-elevate text-left"
              data-testid={`chatroom-${room.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{room.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {room.members.map((m) => m.user?.displayName || m.user?.username).join(", ")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
