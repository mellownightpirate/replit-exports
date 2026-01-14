import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  interests: json("interests").$type<string[]>().notNull(),
  otherInterest: text("other_interest"),
  message: text("message"),
  createdAt: text("created_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSubscriberSchema = createInsertSchema(subscribers).pick({
  email: true,
});

export const insertParticipantSchema = createInsertSchema(participants)
  .pick({
    name: true,
    email: true,
    interests: true,
    otherInterest: true,
    message: true,
  })
  .extend({
    name: z.string().nullable().default(null),
    interests: z.array(z.string()),
    otherInterest: z.string().nullable().default(null),
    message: z.string().nullable().default(null),
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
export type Subscriber = typeof subscribers.$inferSelect;

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type Participant = typeof participants.$inferSelect;
