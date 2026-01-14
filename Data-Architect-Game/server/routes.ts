import type { Express, Request, Response } from "express";
import type { Server } from "http";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { getSession, requireAuth } from "./session";
import { registerUserSchema, loginUserSchema, createRoomSchema, joinRoomSchema } from "@shared/schema";
import { setupSocketIO, getIO } from "./socket";
import { submitActions, startGame, getRoomStateForPlayer, setSocketIO } from "./turnController";
import { getAvailableActions } from "../shared/multiplayerSimulation";
import type { MultiplayerGameState } from "../shared/multiplayerTypes";

const SALT_ROUNDS = 10;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await storage.createUser(email, passwordHash);

      const session = await getSession(req, res);
      session.userId = user.id;
      session.email = user.email;
      await session.save();

      return res.json({ 
        user: { id: user.id, email: user.email },
        message: "Registration successful" 
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const session = await getSession(req, res);
      session.userId = user.id;
      session.email = user.email;
      await session.save();

      return res.json({ 
        user: { id: user.id, email: user.email },
        message: "Login successful" 
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const session = await getSession(req, res);
      session.destroy();
      return res.json({ message: "Logged out" });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const session = await getSession(req, res);
      if (!session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(session.userId);
      if (!user) {
        session.destroy();
        return res.status(401).json({ message: "User not found" });
      }

      return res.json({ user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Auth check error:", error);
      return res.status(500).json({ message: "Auth check failed" });
    }
  });

  app.post("/api/rooms", requireAuth, async (req: Request, res: Response) => {
    try {
      const parsed = createRoomSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const userId = (req as any).userId;
      const { room, player } = await storage.createRoom(parsed.data.scenarioId, userId);

      return res.json({ room, player });
    } catch (error) {
      console.error("Create room error:", error);
      return res.status(500).json({ message: "Failed to create room" });
    }
  });

  app.post("/api/rooms/join", requireAuth, async (req: Request, res: Response) => {
    try {
      const parsed = joinRoomSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const userId = (req as any).userId;
      const room = await storage.getRoomByCode(parsed.data.code);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const player = await storage.joinRoom(room.id, userId);
      
      if (!player) {
        return res.status(400).json({ message: "Room is full" });
      }

      return res.json({ room, player });
    } catch (error) {
      console.error("Join room error:", error);
      return res.status(500).json({ message: "Failed to join room" });
    }
  });

  app.get("/api/rooms", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const myRooms = await storage.getRoomsForUser(userId);
      const availableRooms = await storage.getAvailableRooms();

      return res.json({ myRooms, availableRooms });
    } catch (error) {
      console.error("Get rooms error:", error);
      return res.status(500).json({ message: "Failed to get rooms" });
    }
  });

  app.get("/api/rooms/:roomId", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { roomId } = req.params;

      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const player = await storage.getPlayerByRoomAndUser(roomId, userId);
      if (!player) {
        return res.status(403).json({ message: "You are not in this room" });
      }

      const players = await storage.getPlayersByRoomId(roomId);
      const gameStateRecord = await storage.getGameState(roomId);
      const gameState = gameStateRecord?.stateJson as MultiplayerGameState | null;
      const currentTurn = await storage.getTurn(roomId, room.currentTurn);
      const plannedActions = await storage.getPlannedActions(roomId, room.currentTurn);

      const myPlannedAction = plannedActions.find(a => a.role === player.role);
      const opponentSubmitted = plannedActions.some(a => a.role !== player.role);

      // Get available actions for this player's role
      let availableActions: string[] = [];
      if (gameState && player.role) {
        availableActions = getAvailableActions(
          gameState,
          player.role as 'ARCHITECT' | 'PROSPECT'
        );
      }

      return res.json({
        room: {
          ...room,
          currentTurn: gameState?.currentTurn || room.currentTurn,
          phase: room.phase,
        },
        player,
        players,
        gameState,
        currentTurn,
        myPlannedAction,
        opponentSubmitted,
        availableActions,
      });
    } catch (error) {
      console.error("Get room error:", error);
      return res.status(500).json({ message: "Failed to get room" });
    }
  });

  app.post("/api/rooms/:roomId/submit", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { roomId } = req.params;
      const { actions } = req.body;

      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const player = await storage.getPlayerByRoomAndUser(roomId, userId);
      if (!player) {
        return res.status(403).json({ message: "You are not in this room" });
      }

      // Use turn controller for proper simulation
      const result = await submitActions(roomId, userId, actions || []);

      return res.json({ 
        message: "Actions submitted", 
        submitted: true,
        waitingForOpponent: result.waitingForOpponent,
      });
    } catch (error: any) {
      console.error("Submit actions error:", error);
      return res.status(500).json({ message: error.message || "Failed to submit actions" });
    }
  });

  // Start game endpoint
  app.post("/api/rooms/:roomId/start", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { roomId } = req.params;

      const room = await storage.getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }

      const players = await storage.getPlayersByRoomId(roomId);
      if (players.length !== 2) {
        return res.status(400).json({ message: "Need 2 players to start" });
      }

      const gameState = await startGame(roomId, room.scenarioId);

      return res.json({ 
        message: "Game started",
        gameState,
      });
    } catch (error: any) {
      console.error("Start game error:", error);
      return res.status(500).json({ message: error.message || "Failed to start game" });
    }
  });

  // Set up Socket.IO and pass reference to turn controller
  const io = setupSocketIO(httpServer);
  setSocketIO(io);

  return httpServer;
}
