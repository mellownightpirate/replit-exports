import { Server as SocketIOServer, Socket } from "socket.io";
import type { Server } from "http";
import { storage } from "./storage";

let io: SocketIOServer | null = null;

export function setupSocketIO(httpServer: Server) {
  io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join-room", async (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      
      const player = await storage.getPlayerByRoomAndUser(roomId, userId);
      if (!player) {
        socket.emit("error", { message: "Not authorized for this room" });
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.role = player.role;

      const players = await storage.getPlayersByRoomId(roomId);
      io?.to(roomId).emit("player-joined", { 
        players: players.map(p => ({ id: p.id, role: p.role })),
        playerCount: players.length,
      });

      console.log(`User ${userId} (${player.role}) joined room ${roomId}`);
    });

    socket.on("leave-room", () => {
      if (socket.data.roomId) {
        socket.leave(socket.data.roomId);
        console.log(`User ${socket.data.userId} left room ${socket.data.roomId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.IO initialized");
  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}

export function broadcastToRoom(roomId: string, event: string, data: any) {
  if (io) {
    io.to(roomId).emit(event, data);
  }
}

export function broadcastGameState(roomId: string, gameState: any) {
  broadcastToRoom(roomId, "game-state", gameState);
}

export function broadcastPhaseChange(roomId: string, phase: string, data?: any) {
  broadcastToRoom(roomId, "phase-change", { phase, ...data });
}

export function broadcastTurnResolved(roomId: string, result: any) {
  broadcastToRoom(roomId, "turn-resolved", result);
}

export function broadcastPlayerSubmitted(roomId: string, role: string) {
  broadcastToRoom(roomId, "player-submitted", { role });
}
