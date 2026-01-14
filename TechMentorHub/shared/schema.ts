import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const quizSubmissions = pgTable("quiz_submissions", {
  id: serial("id").primaryKey(),
  email: text("email"),
  q1: text("q1"),
  q2: text("q2"),
  q3: text("q3"),
  q4: text("q4"),
  q5: text("q5"),
  score: integer("score"),
  result: text("result"),
  createdAt: text("created_at").notNull(),
});

export const waitlistUsers = pgTable("waitlist_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

// New analytics tables
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  path: text("path").notNull(),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // click, submit, view
  eventCategory: text("event_category").notNull(), // cta, quiz, pricing, etc.
  eventAction: text("event_action").notNull(), // click_button, submit_form, etc.
  eventLabel: text("event_label"), // additional info
  eventValue: integer("event_value"), // optional numeric value
  path: text("path"), // page where event occurred
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversions = pgTable("conversions", {
  id: serial("id").primaryKey(),
  conversionType: text("conversion_type").notNull(), // quiz_completion, waitlist_signup, checkout_started, checkout_completed
  email: text("email"),
  planId: text("plan_id"), // for checkout conversions
  planName: text("plan_name"),
  planPrice: integer("plan_price"),
  sessionId: text("session_id"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuizSubmissionSchema = createInsertSchema(quizSubmissions).omit({
  id: true,
});

export const insertWaitlistUserSchema = createInsertSchema(waitlistUsers).omit({
  id: true,
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertConversionSchema = createInsertSchema(conversions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuizSubmission = z.infer<typeof insertQuizSubmissionSchema>;
export type QuizSubmission = typeof quizSubmissions.$inferSelect;

export type InsertWaitlistUser = z.infer<typeof insertWaitlistUserSchema>;
export type WaitlistUser = typeof waitlistUsers.$inferSelect;

export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type PageView = typeof pageViews.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertConversion = z.infer<typeof insertConversionSchema>;
export type Conversion = typeof conversions.$inferSelect;
