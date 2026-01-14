import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code", { length: 8 }).notNull().unique(),
  scenarioId: text("scenario_id").notNull(),
  seed: integer("seed").notNull(),
  status: text("status").notNull().default("waiting"),
  currentTurn: integer("current_turn").notNull().default(1),
  phase: text("phase").notNull().default("waiting"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.roomId, table.userId),
  unique().on(table.roomId, table.role),
]);

export const gameStates = pgTable("game_states", {
  roomId: varchar("room_id").primaryKey().references(() => rooms.id, { onDelete: "cascade" }),
  stateJson: jsonb("state_json").notNull(),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const turns = pgTable("turns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  turnNumber: integer("turn_number").notNull(),
  eventJson: jsonb("event_json"),
  status: text("status").notNull().default("planning"),
  resolvedAt: timestamp("resolved_at"),
}, (table) => [
  unique().on(table.roomId, table.turnNumber),
]);

export const plannedActions = pgTable("planned_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  turnNumber: integer("turn_number").notNull(),
  userId: varchar("user_id").notNull(),
  role: text("role").notNull(),
  actionsJson: jsonb("actions_json").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.roomId, table.turnNumber, table.role),
]);

export const actionLogs = pgTable("action_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  turnNumber: integer("turn_number").notNull(),
  role: text("role").notNull(),
  actionJson: jsonb("action_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const turnResults = pgTable("turn_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  turnNumber: integer("turn_number").notNull(),
  resultJson: jsonb("result_json").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique().on(table.roomId, table.turnNumber),
]);

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  passwordHash: true,
});

export const registerUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createRoomSchema = z.object({
  scenarioId: z.string(),
});

export const joinRoomSchema = z.object({
  code: z.string().length(8, "Room code must be 8 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Room = typeof rooms.$inferSelect;
export type Player = typeof players.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
export type Turn = typeof turns.$inferSelect;
export type PlannedAction = typeof plannedActions.$inferSelect;
export type ActionLog = typeof actionLogs.$inferSelect;
export type TurnResult = typeof turnResults.$inferSelect;

export type PlayerRole = "ARCHITECT" | "PROSPECT";
export type RoomStatus = "waiting" | "active" | "finished";
export type RoomPhase = "waiting" | "event" | "planning" | "commit" | "resolve" | "review";
export type TurnStatus = "planning" | "resolved";
