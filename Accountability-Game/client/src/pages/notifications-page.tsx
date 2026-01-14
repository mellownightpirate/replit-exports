import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, Settings, MessageSquare, Users, Target, Flame } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Notification, NotificationPreferences } from "@shared/schema";

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  task_created: Target,
  habit_milestone: Flame,
  buddy_request: Users,
  buddy_accepted: Users,
  chat_message: MessageSquare,
  reaction_received: Flame,
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const { data: preferences } = useQuery<NotificationPreferences>({
    queryKey: ["/api/notification-preferences"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const updatePrefsMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
      await apiRequest("PATCH", "/api/notification-preferences", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="inbox">
        <TabsList className="w-full">
          <TabsTrigger value="inbox" className="flex-1" data-testid="tab-inbox">
            Inbox {unreadCount > 0 && <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-2 mt-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => {
              const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
              return (
                <Card
                  key={notification.id}
                  className={`${!notification.isRead ? "border-primary/50 bg-primary/5" : ""}`}
                >
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        !notification.isRead ? "bg-primary/20 text-primary" : "bg-muted"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markReadMutation.mutate(notification.id)}
                          disabled={markReadMutation.isPending}
                          data-testid={`button-mark-read-${notification.id}`}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Delivery Methods</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Email Notifications</Label>
                  <Switch
                    id="email-enabled"
                    checked={preferences?.emailEnabled ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ emailEnabled: checked })}
                    data-testid="switch-email-notifications"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="inapp-enabled">In-App Notifications</Label>
                  <Switch
                    id="inapp-enabled"
                    checked={preferences?.inAppEnabled ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ inAppEnabled: checked })}
                    data-testid="switch-inapp-notifications"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Notification Types</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="buddy-task">Buddy New Tasks</Label>
                  <Switch
                    id="buddy-task"
                    checked={preferences?.buddyTaskCreated ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ buddyTaskCreated: checked })}
                    data-testid="switch-buddy-tasks"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="buddy-milestone">Buddy Milestones</Label>
                  <Switch
                    id="buddy-milestone"
                    checked={preferences?.buddyHabitMilestone ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ buddyHabitMilestone: checked })}
                    data-testid="switch-buddy-milestones"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="buddy-request">Buddy Requests</Label>
                  <Switch
                    id="buddy-request"
                    checked={preferences?.buddyRequest ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ buddyRequest: checked })}
                    data-testid="switch-buddy-requests"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="chat-messages">Chat Messages</Label>
                  <Switch
                    id="chat-messages"
                    checked={preferences?.chatMessages ?? true}
                    onCheckedChange={(checked) => updatePrefsMutation.mutate({ chatMessages: checked })}
                    data-testid="switch-chat-messages"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
