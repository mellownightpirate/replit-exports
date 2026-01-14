import { pgTable, text, serial, integer, boolean, timestamp, varchar, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  timezone: text("timezone").default("UTC"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  isPublic: boolean("is_public").default(false),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  habits: many(habits),
  tasks: many(tasks),
  habitLogs: many(habitLogs),
  visibilitySettings: one(visibilitySettings),
  sentConnections: many(buddyConnections, { relationName: "requester" }),
  receivedConnections: many(buddyConnections, { relationName: "receiver" }),
}));

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  emoji: text("emoji"),
  targetPerWeek: integer("target_per_week").default(7),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, { fields: [habits.userId], references: [users.id] }),
  logs: many(habitLogs),
}));

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  dateISO: text("date_iso").notNull(),
  done: boolean("done").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("habit_log_unique").on(table.userId, table.habitId, table.dateISO),
]);

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  user: one(users, { fields: [habitLogs.userId], references: [users.id] }),
  habit: one(habits, { fields: [habitLogs.habitId], references: [habits.id] }),
}));

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateISO: text("date_iso").notNull(),
  title: text("title").notNull(),
  done: boolean("done").default(false),
  priority: text("priority"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
}));

export const buddyConnections = pgTable("buddy_connections", {
  id: serial("id").primaryKey(),
  requesterId: integer("requester_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  receiverId: integer("receiver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("buddy_connection_unique").on(table.requesterId, table.receiverId),
]);

export const buddyConnectionsRelations = relations(buddyConnections, ({ one }) => ({
  requester: one(users, { fields: [buddyConnections.requesterId], references: [users.id], relationName: "requester" }),
  receiver: one(users, { fields: [buddyConnections.receiverId], references: [users.id], relationName: "receiver" }),
}));

export const visibilitySettings = pgTable("visibility_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  shareHabits: boolean("share_habits").default(true),
  shareHabitStatus: boolean("share_habit_status").default(true),
  shareTasksTitles: boolean("share_tasks_titles").default(false),
  shareTasksCountsOnly: boolean("share_tasks_counts_only").default(true),
  showFollowerList: boolean("show_follower_list").default(true),
  showFollowingList: boolean("show_following_list").default(true),
});

export const visibilitySettingsRelations = relations(visibilitySettings, ({ one }) => ({
  user: one(users, { fields: [visibilitySettings.userId], references: [users.id] }),
}));

export const acknowledgements = pgTable("acknowledgements", {
  id: serial("id").primaryKey(),
  dateISO: text("date_iso").notNull(),
  subjectUserId: integer("subject_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  buddyUserId: integer("buddy_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("acknowledgement_unique").on(table.subjectUserId, table.buddyUserId, table.dateISO, table.type),
]);

export const acknowledgementsRelations = relations(acknowledgements, ({ one }) => ({
  subjectUser: one(users, { fields: [acknowledgements.subjectUserId], references: [users.id] }),
  buddyUser: one(users, { fields: [acknowledgements.buddyUserId], references: [users.id] }),
}));

export const habitWatchers = pgTable("habit_watchers", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  buddyUserId: integer("buddy_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("watching"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("habit_watcher_unique").on(table.habitId, table.buddyUserId),
]);

export const habitWatchersRelations = relations(habitWatchers, ({ one }) => ({
  habit: one(habits, { fields: [habitWatchers.habitId], references: [habits.id] }),
  buddyUser: one(users, { fields: [habitWatchers.buddyUserId], references: [users.id] }),
}));

export const habitReactions = pgTable("habit_reactions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  buddyUserId: integer("buddy_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateISO: text("date_iso").notNull(),
  reactionType: text("reaction_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("habit_reaction_unique").on(table.habitId, table.buddyUserId, table.dateISO, table.reactionType),
]);

export const habitReactionsRelations = relations(habitReactions, ({ one }) => ({
  habit: one(habits, { fields: [habitReactions.habitId], references: [habits.id] }),
  buddyUser: one(users, { fields: [habitReactions.buddyUserId], references: [users.id] }),
}));

export const taskSeen = pgTable("task_seen", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  buddyUserId: integer("buddy_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  seenAt: timestamp("seen_at").defaultNow(),
}, (table) => [
  unique("task_seen_unique").on(table.taskId, table.buddyUserId),
]);

export const taskSeenRelations = relations(taskSeen, ({ one }) => ({
  task: one(tasks, { fields: [taskSeen.taskId], references: [tasks.id] }),
  buddyUser: one(users, { fields: [taskSeen.buddyUserId], references: [users.id] }),
}));

// Anchor Seen - tracks when buddies acknowledge seeing an anchor check-in
export const anchorSeen = pgTable("anchor_seen", {
  id: serial("id").primaryKey(),
  habitLogId: integer("habit_log_id").notNull().references(() => habitLogs.id, { onDelete: "cascade" }),
  subjectUserId: integer("subject_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  viewerUserId: integer("viewer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("anchor_seen_unique").on(table.habitLogId, table.viewerUserId),
]);

export const anchorSeenRelations = relations(anchorSeen, ({ one }) => ({
  habitLog: one(habitLogs, { fields: [anchorSeen.habitLogId], references: [habitLogs.id] }),
  subjectUser: one(users, { fields: [anchorSeen.subjectUserId], references: [users.id] }),
  viewerUser: one(users, { fields: [anchorSeen.viewerUserId], references: [users.id] }),
}));

// Follow system for public profiles
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: integer("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("follow_unique").on(table.followerId, table.followingId),
]);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id] }),
  following: one(users, { fields: [follows.followingId], references: [users.id] }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true });
export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertBuddyConnectionSchema = createInsertSchema(buddyConnections).omit({ id: true, createdAt: true });
export const insertVisibilitySettingsSchema = createInsertSchema(visibilitySettings).omit({ id: true });
export const insertAcknowledgementSchema = createInsertSchema(acknowledgements).omit({ id: true, createdAt: true });
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({ id: true, createdAt: true });
export const insertHabitWatcherSchema = createInsertSchema(habitWatchers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHabitReactionSchema = createInsertSchema(habitReactions).omit({ id: true, createdAt: true });
export const insertTaskSeenSchema = createInsertSchema(taskSeen).omit({ id: true, seenAt: true });
export const insertAnchorSeenSchema = createInsertSchema(anchorSeen).omit({ id: true, createdAt: true });
export const insertFollowSchema = createInsertSchema(follows).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type BuddyConnection = typeof buddyConnections.$inferSelect;
export type InsertBuddyConnection = z.infer<typeof insertBuddyConnectionSchema>;
export type VisibilitySettings = typeof visibilitySettings.$inferSelect;
export type InsertVisibilitySettings = z.infer<typeof insertVisibilitySettingsSchema>;
export type Acknowledgement = typeof acknowledgements.$inferSelect;
export type InsertAcknowledgement = z.infer<typeof insertAcknowledgementSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type HabitWatcher = typeof habitWatchers.$inferSelect;
export type InsertHabitWatcher = z.infer<typeof insertHabitWatcherSchema>;
export type HabitReaction = typeof habitReactions.$inferSelect;
export type InsertHabitReaction = z.infer<typeof insertHabitReactionSchema>;
export type TaskSeen = typeof taskSeen.$inferSelect;
export type InsertTaskSeen = z.infer<typeof insertTaskSeenSchema>;
export type AnchorSeen = typeof anchorSeen.$inferSelect;
export type InsertAnchorSeen = z.infer<typeof insertAnchorSeenSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export const REACTION_TYPES = ["like", "love", "celebrate", "support", "fire"] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export const defaultHabits = [
  { name: "Wake up early", emoji: "sunrise", targetPerWeek: 7, isActive: true },
  { name: "Gym", emoji: "dumbbell", targetPerWeek: 5, isActive: true },
  { name: "Reading", emoji: "book", targetPerWeek: 7, isActive: true },
  { name: "Budget tracking", emoji: "wallet", targetPerWeek: 7, isActive: true },
  { name: "Project work", emoji: "laptop", targetPerWeek: 5, isActive: true },
  { name: "No alcohol", emoji: "glass-water", targetPerWeek: 7, isActive: true },
  { name: "Social media detox", emoji: "phone-off", targetPerWeek: 7, isActive: true },
  { name: "Goal journaling", emoji: "notebook", targetPerWeek: 7, isActive: true },
  { name: "Cold shower", emoji: "snowflake", targetPerWeek: 5, isActive: true },
];

export const quickAddTemplates = [
  "Gym",
  "Reading",
  "Meditation",
  "Cold shower",
  "Project work",
  "Call family",
];

// Notifications
export const NOTIFICATION_TYPE_ENUM = [
  "MESSAGE_RECEIVED",
  "PROJECT_INVITED", 
  "PROJECT_INVITE",
  "PROJECT_MEMBER_ADDED",
  "BUDDY_INVITED",
  "BUDDY_ACCEPTED",
  "ANCHOR_SEEN",
  "ANCHOR_WATCHED",
  "REACTION",
  "PROJECT_JOINED",
  "CHAT_MEMBER_ADDED",
  "task_created",
  "habit_milestone",
  "buddy_request",
  "buddy_accepted",
  "chat_message",
  "reaction_received",
] as const;

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  message: text("message"),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  relatedUserId: integer("related_user_id").references(() => users.id, { onDelete: "set null" }),
  isRead: boolean("is_read").default(false),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  relatedUser: one(users, { fields: [notifications.relatedUserId], references: [users.id] }),
  deliveries: many(notificationDeliveries),
}));

export const NOTIFICATION_DELIVERY_CHANNEL = ["IN_APP", "EMAIL"] as const;
export const NOTIFICATION_DELIVERY_STATUS = ["QUEUED", "SENT", "FAILED"] as const;

export const notificationDeliveries = pgTable("notification_deliveries", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull().references(() => notifications.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  status: text("status").notNull().default("QUEUED"),
  dedupeKey: text("dedupe_key").unique(),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notificationDeliveriesRelations = relations(notificationDeliveries, ({ one }) => ({
  notification: one(notifications, { fields: [notificationDeliveries.notificationId], references: [notifications.id] }),
}));

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  emailEnabled: boolean("email_enabled").default(true),
  inAppEnabled: boolean("in_app_enabled").default(true),
  emailMessages: boolean("email_messages").default(true),
  emailProjectInvites: boolean("email_project_invites").default(true),
  emailBuddyInvites: boolean("email_buddy_invites").default(true),
  emailDigestOnly: boolean("email_digest_only").default(false),
  quietHoursStart: integer("quiet_hours_start"),
  quietHoursEnd: integer("quiet_hours_end"),
  buddyTaskCreated: boolean("buddy_task_created").default(true),
  buddyHabitMilestone: boolean("buddy_habit_milestone").default(true),
  buddyRequest: boolean("buddy_request").default(true),
  chatMessages: boolean("chat_messages").default(true),
});

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, { fields: [notificationPreferences.userId], references: [users.id] }),
}));

export const EMAIL_QUEUE_STATUS = ["QUEUED", "PROCESSING", "SENT", "FAILED"] as const;

export const emailQueue = pgTable("email_queue", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  notificationId: integer("notification_id").references(() => notifications.id, { onDelete: "cascade" }),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  htmlBody: text("html_body").notNull(),
  textBody: text("text_body"),
  dedupeKey: text("dedupe_key").unique(),
  status: text("status").notNull().default("QUEUED"),
  retryCount: integer("retry_count").default(0),
  lastError: text("last_error"),
  scheduledFor: timestamp("scheduled_for").defaultNow(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailQueueRelations = relations(emailQueue, ({ one }) => ({
  user: one(users, { fields: [emailQueue.userId], references: [users.id] }),
  notification: one(notifications, { fields: [emailQueue.notificationId], references: [notifications.id] }),
}));

// Chatrooms
export const chatrooms = pgTable("chatrooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  creatorId: integer("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatroomsRelations = relations(chatrooms, ({ one, many }) => ({
  creator: one(users, { fields: [chatrooms.creatorId], references: [users.id] }),
  members: many(chatroomMembers),
  messages: many(chatMessages),
}));

export const CHATROOM_MEMBER_ROLES = ["admin", "member"] as const;
export type ChatroomMemberRole = typeof CHATROOM_MEMBER_ROLES[number];

export const chatroomMembers = pgTable("chatroom_members", {
  id: serial("id").primaryKey(),
  chatroomId: integer("chatroom_id").notNull().references(() => chatrooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  unique("chatroom_member_unique").on(table.chatroomId, table.userId),
]);

export const chatroomMembersRelations = relations(chatroomMembers, ({ one }) => ({
  chatroom: one(chatrooms, { fields: [chatroomMembers.chatroomId], references: [chatrooms.id] }),
  user: one(users, { fields: [chatroomMembers.userId], references: [users.id] }),
}));

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatroomId: integer("chatroom_id").notNull().references(() => chatrooms.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isSystemMessage: boolean("is_system_message").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  chatroom: one(chatrooms, { fields: [chatMessages.chatroomId], references: [chatrooms.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({ id: true });
export const insertNotificationDeliverySchema = createInsertSchema(notificationDeliveries).omit({ id: true, createdAt: true });
export const insertEmailQueueSchema = createInsertSchema(emailQueue).omit({ id: true, createdAt: true });
export const insertChatroomSchema = createInsertSchema(chatrooms).omit({ id: true, createdAt: true });
export const insertChatroomMemberSchema = createInsertSchema(chatroomMembers).omit({ id: true, joinedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
export type InsertNotificationDelivery = z.infer<typeof insertNotificationDeliverySchema>;
export type EmailQueueItem = typeof emailQueue.$inferSelect;
export type InsertEmailQueueItem = z.infer<typeof insertEmailQueueSchema>;
export type Chatroom = typeof chatrooms.$inferSelect;
export type InsertChatroom = z.infer<typeof insertChatroomSchema>;
export type ChatroomMember = typeof chatroomMembers.$inferSelect;
export type InsertChatroomMember = z.infer<typeof insertChatroomMemberSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export const NOTIFICATION_TYPES = NOTIFICATION_TYPE_ENUM;
export type NotificationType = typeof NOTIFICATION_TYPES[number];
export type NotificationDeliveryChannel = typeof NOTIFICATION_DELIVERY_CHANNEL[number];
export type NotificationDeliveryStatus = typeof NOTIFICATION_DELIVERY_STATUS[number];
export type EmailQueueStatus = typeof EMAIL_QUEUE_STATUS[number];

export const onboardingState = pgTable("onboarding_state", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  completed: boolean("completed").default(false),
  stepIndex: integer("step_index").default(0),
  skipped: boolean("skipped").default(false),
  dismissedAt: timestamp("dismissed_at"),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const onboardingStateRelations = relations(onboardingState, ({ one }) => ({
  user: one(users, { fields: [onboardingState.userId], references: [users.id] }),
}));

export const insertOnboardingStateSchema = createInsertSchema(onboardingState).omit({ id: true });
export type OnboardingState = typeof onboardingState.$inferSelect;
export type InsertOnboardingState = z.infer<typeof insertOnboardingStateSchema>;

// User blocks for discovery privacy
export const userBlocks = pgTable("user_blocks", {
  id: serial("id").primaryKey(),
  blockerId: integer("blocker_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  blockedId: integer("blocked_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("user_block_unique").on(table.blockerId, table.blockedId),
]);

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocker: one(users, { fields: [userBlocks.blockerId], references: [users.id] }),
  blocked: one(users, { fields: [userBlocks.blockedId], references: [users.id] }),
}));

export const insertUserBlockSchema = createInsertSchema(userBlocks).omit({ id: true, createdAt: true });
export type UserBlock = typeof userBlocks.$inferSelect;
export type InsertUserBlock = z.infer<typeof insertUserBlockSchema>;

// Projects
export const PROJECT_VISIBILITY = ["private", "buddies_only", "public"] as const;
export type ProjectVisibility = typeof PROJECT_VISIBILITY[number];

export const PROJECT_GOAL_TYPES = ["points", "checkins"] as const;
export type ProjectGoalType = typeof PROJECT_GOAL_TYPES[number];

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  visibility: text("visibility").notNull().default("private"),
  allowPublicJoin: boolean("allow_public_join").default(false),
  goalType: text("goal_type").notNull().default("checkins"),
  goalTarget: integer("goal_target").notNull().default(30),
  startDateISO: text("start_date_iso"),
  endDateISO: text("end_date_iso"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
  members: many(projectMembers),
  habitLinks: many(projectHabitLinks),
  contributions: many(projectContributions),
}));

export const PROJECT_MEMBER_ROLES = ["owner", "member"] as const;
export type ProjectMemberRole = typeof PROJECT_MEMBER_ROLES[number];

export const PROJECT_MEMBER_STATUS = ["invited", "active", "left"] as const;
export type ProjectMemberStatus = typeof PROJECT_MEMBER_STATUS[number];

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("invited"),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("project_member_unique").on(table.projectId, table.userId),
]);

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

export const projectHabitLinks = pgTable("project_habit_links", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  contributionWeight: integer("contribution_weight").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("project_habit_link_unique").on(table.projectId, table.habitId),
]);

export const projectHabitLinksRelations = relations(projectHabitLinks, ({ one }) => ({
  project: one(projects, { fields: [projectHabitLinks.projectId], references: [projects.id] }),
  habit: one(habits, { fields: [projectHabitLinks.habitId], references: [habits.id] }),
  user: one(users, { fields: [projectHabitLinks.userId], references: [users.id] }),
}));

export const projectContributions = pgTable("project_contributions", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateISO: text("date_iso").notNull(),
  amount: integer("amount").notNull().default(1),
  sourceType: text("source_type").notNull().default("habit_checkin"),
  sourceId: integer("source_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectContributionsRelations = relations(projectContributions, ({ one }) => ({
  project: one(projects, { fields: [projectContributions.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectContributions.userId], references: [users.id] }),
}));

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true });
export const insertProjectMemberSchema = createInsertSchema(projectMembers).omit({ id: true, createdAt: true });
export const insertProjectHabitLinkSchema = createInsertSchema(projectHabitLinks).omit({ id: true, createdAt: true });
export const insertProjectContributionSchema = createInsertSchema(projectContributions).omit({ id: true, createdAt: true });

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type InsertProjectMember = z.infer<typeof insertProjectMemberSchema>;
export type ProjectHabitLink = typeof projectHabitLinks.$inferSelect;
export type InsertProjectHabitLink = z.infer<typeof insertProjectHabitLinkSchema>;
export type ProjectContribution = typeof projectContributions.$inferSelect;
export type InsertProjectContribution = z.infer<typeof insertProjectContributionSchema>;
