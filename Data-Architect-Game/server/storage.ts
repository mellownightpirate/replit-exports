import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  rooms,
  players,
  gameStates,
  turns,
  plannedActions,
  actionLogs,
  turnResults,
  type User,
  type Room,
  type Player,
  type GameState,
  type Turn,
  type PlannedAction,
  type TurnResult,
  type PlayerRole,
} from "@shared/schema";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const storage = {
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  },

  async createUser(email: string, passwordHash: string): Promise<User> {
    const result = await db.insert(users).values({ email, passwordHash }).returning();
    return result[0];
  },

  async createRoom(scenarioId: string, creatorId: string): Promise<{ room: Room; player: Player }> {
    const code = generateRoomCode();
    const seed = Math.floor(Math.random() * 1000000);
    
    const [room] = await db.insert(rooms).values({
      code,
      scenarioId,
      seed,
      status: "waiting",
      currentTurn: 1,
      phase: "waiting",
    }).returning();

    const [player] = await db.insert(players).values({
      roomId: room.id,
      userId: creatorId,
      role: "ARCHITECT",
    }).returning();

    return { room, player };
  },

  async getRoomByCode(code: string): Promise<Room | undefined> {
    const result = await db.select().from(rooms).where(eq(rooms.code, code.toUpperCase())).limit(1);
    return result[0];
  },

  async getRoomById(id: string): Promise<Room | undefined> {
    const result = await db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
    return result[0];
  },

  async getPlayersByRoomId(roomId: string): Promise<Player[]> {
    return db.select().from(players).where(eq(players.roomId, roomId));
  },

  async getPlayerByRoomAndUser(roomId: string, userId: string): Promise<Player | undefined> {
    const result = await db.select().from(players).where(
      and(eq(players.roomId, roomId), eq(players.userId, userId))
    ).limit(1);
    return result[0];
  },

  async joinRoom(roomId: string, userId: string): Promise<Player | null> {
    const existingPlayers = await this.getPlayersByRoomId(roomId);
    
    if (existingPlayers.length >= 2) {
      return null;
    }

    const existingPlayer = existingPlayers.find(p => p.userId === userId);
    if (existingPlayer) {
      return existingPlayer;
    }

    const role: PlayerRole = existingPlayers.some(p => p.role === "ARCHITECT") ? "PROSPECT" : "ARCHITECT";
    
    const [player] = await db.insert(players).values({
      roomId,
      userId,
      role,
    }).returning();

    if (existingPlayers.length === 1) {
      await db.update(rooms).set({ status: "active", phase: "event" }).where(eq(rooms.id, roomId));
    }

    return player;
  },

  async getRoomsForUser(userId: string): Promise<Array<Room & { role: PlayerRole; playerCount: number }>> {
    const userPlayers = await db.select().from(players).where(eq(players.userId, userId));
    
    const roomsWithInfo = await Promise.all(
      userPlayers.map(async (player) => {
        const room = await this.getRoomById(player.roomId);
        const allPlayers = await this.getPlayersByRoomId(player.roomId);
        if (!room) return null;
        return {
          ...room,
          role: player.role as PlayerRole,
          playerCount: allPlayers.length,
        };
      })
    );

    return roomsWithInfo.filter((r): r is NonNullable<typeof r> => r !== null);
  },

  async getAvailableRooms(): Promise<Array<Room & { playerCount: number }>> {
    const waitingRooms = await db.select().from(rooms).where(eq(rooms.status, "waiting"));
    
    const roomsWithCount = await Promise.all(
      waitingRooms.map(async (room) => {
        const roomPlayers = await this.getPlayersByRoomId(room.id);
        return {
          ...room,
          playerCount: roomPlayers.length,
        };
      })
    );

    return roomsWithCount.filter(r => r.playerCount < 2);
  },

  async getGameState(roomId: string): Promise<GameState | undefined> {
    const result = await db.select().from(gameStates).where(eq(gameStates.roomId, roomId)).limit(1);
    return result[0];
  },

  async saveGameState(roomId: string, stateJson: any, version: number): Promise<GameState> {
    const existing = await this.getGameState(roomId);
    
    if (existing) {
      const [updated] = await db.update(gameStates)
        .set({ stateJson, version, updatedAt: new Date() })
        .where(eq(gameStates.roomId, roomId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(gameStates)
        .values({ roomId, stateJson, version })
        .returning();
      return created;
    }
  },

  async updateRoomPhase(roomId: string, phase: string, currentTurn?: number): Promise<void> {
    const updates: any = { phase, updatedAt: new Date() };
    if (currentTurn !== undefined) {
      updates.currentTurn = currentTurn;
    }
    await db.update(rooms).set(updates).where(eq(rooms.id, roomId));
  },

  async updateRoomStatus(roomId: string, status: string): Promise<void> {
    await db.update(rooms).set({ status, updatedAt: new Date() }).where(eq(rooms.id, roomId));
  },

  async getTurn(roomId: string, turnNumber: number): Promise<Turn | undefined> {
    const result = await db.select().from(turns).where(
      and(eq(turns.roomId, roomId), eq(turns.turnNumber, turnNumber))
    ).limit(1);
    return result[0];
  },

  async createTurn(roomId: string, turnNumber: number, eventJson?: any): Promise<Turn> {
    const [turn] = await db.insert(turns).values({
      roomId,
      turnNumber,
      eventJson,
      status: "planning",
    }).returning();
    return turn;
  },

  async resolveTurn(roomId: string, turnNumber: number): Promise<void> {
    await db.update(turns)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(and(eq(turns.roomId, roomId), eq(turns.turnNumber, turnNumber)));
  },

  async getPlannedActions(roomId: string, turnNumber: number): Promise<PlannedAction[]> {
    return db.select().from(plannedActions).where(
      and(eq(plannedActions.roomId, roomId), eq(plannedActions.turnNumber, turnNumber))
    );
  },

  async submitPlannedAction(
    roomId: string,
    turnNumber: number,
    userId: string,
    role: string,
    actionsJson: any
  ): Promise<PlannedAction> {
    const existing = await db.select().from(plannedActions).where(
      and(
        eq(plannedActions.roomId, roomId),
        eq(plannedActions.turnNumber, turnNumber),
        eq(plannedActions.role, role)
      )
    ).limit(1);

    if (existing[0]) {
      const [updated] = await db.update(plannedActions)
        .set({ actionsJson, submittedAt: new Date() })
        .where(eq(plannedActions.id, existing[0].id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(plannedActions).values({
      roomId,
      turnNumber,
      userId,
      role,
      actionsJson,
    }).returning();
    return created;
  },

  async clearPlannedActions(roomId: string, turnNumber: number): Promise<void> {
    await db.delete(plannedActions).where(
      and(eq(plannedActions.roomId, roomId), eq(plannedActions.turnNumber, turnNumber))
    );
  },

  async logAction(roomId: string, turnNumber: number, role: string, actionJson: any): Promise<void> {
    await db.insert(actionLogs).values({
      roomId,
      turnNumber,
      role,
      actionJson,
    });
  },

  async saveTurnResult(roomId: string, turnNumber: number, resultJson: any): Promise<TurnResult> {
    const [result] = await db.insert(turnResults).values({
      roomId,
      turnNumber,
      resultJson,
    }).returning();
    return result;
  },

  async getTurnResult(roomId: string, turnNumber: number): Promise<TurnResult | undefined> {
    const result = await db.select().from(turnResults).where(
      and(eq(turnResults.roomId, roomId), eq(turnResults.turnNumber, turnNumber))
    ).limit(1);
    return result[0];
  },
};
