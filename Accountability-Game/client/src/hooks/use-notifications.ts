import { useEffect, useRef } from "react";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function useNotificationStream() {
  const { user } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user) return;

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/me/heartbeat", {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Heartbeat failed:", err);
      }
    };

    sendHeartbeat();
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 60000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const connectSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource("/api/notifications/stream", {
        withCredentials: true,
      });

      eventSource.addEventListener("connected", () => {
        console.log("SSE stream established");
      });

      eventSource.addEventListener("notification", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received notification:", data);
          queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
        } catch (err) {
          console.error("Failed to parse notification:", err);
        }
      });

      eventSource.addEventListener("unreadCount", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received unread count:", data);
          queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
        } catch (err) {
          console.error("Failed to parse unread count:", err);
        }
      });

      eventSource.onerror = (err) => {
        console.error("SSE error:", err);
        eventSource.close();
        setTimeout(connectSSE, 5000);
      };

      eventSourceRef.current = eventSource;
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user]);
}
