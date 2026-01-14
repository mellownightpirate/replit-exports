import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Invitation submission schema
export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  workDescription: text("work_description").notNull(),
  whoToMeet: text("who_to_meet").notNull(),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertInvitationSchema = createInsertSchema(invitations).pick({
  name: true,
  email: true,
  role: true,
  company: true,
  workDescription: true,
  whoToMeet: true,
});

export type InsertInvitation = z.infer<typeof insertInvitationSchema>;
export type Invitation = typeof invitations.$inferSelect;
