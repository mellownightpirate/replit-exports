import {
  users, habits, habitLogs, tasks, buddyConnections, visibilitySettings, acknowledgements, passwordResetTokens,
  habitWatchers, habitReactions, notifications, notificationPreferences, notificationDeliveries, emailQueue,
  chatrooms, chatroomMembers, chatMessages,
  onboardingState, userBlocks, projects, projectMembers, projectHabitLinks, projectContributions, taskSeen,
  anchorSeen, follows,
  type User, type InsertUser, type Habit, type InsertHabit, type HabitLog, type InsertHabitLog,
  type Task, type InsertTask, type BuddyConnection, type InsertBuddyConnection,
  type VisibilitySettings, type InsertVisibilitySettings, type Acknowledgement, type InsertAcknowledgement,
  type PasswordResetToken, type InsertPasswordResetToken,
  type HabitWatcher, type InsertHabitWatcher, type HabitReaction, type InsertHabitReaction,
  type Notification, type InsertNotification, type NotificationPreferences, type InsertNotificationPreferences,
  type NotificationDelivery, type InsertNotificationDelivery, type EmailQueueItem, type InsertEmailQueueItem,
  type Chatroom, type InsertChatroom, type ChatroomMember, type InsertChatroomMember, type ChatMessage, type InsertChatMessage,
  type OnboardingState, type InsertOnboardingState,
  type UserBlock, type InsertUserBlock,
  type Project, type InsertProject, type ProjectMember, type InsertProjectMember,
  type ProjectHabitLink, type InsertProjectHabitLink, type ProjectContribution, type InsertProjectContribution,
  type TaskSeen, type InsertTaskSeen,
  type AnchorSeen, type InsertAnchorSeen, type Follow, type InsertFollow,
  defaultHabits
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, ilike, ne, notInArray, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  getHabits(userId: number): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: number, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: number): Promise<void>;
  
  getHabitLogs(userId: number, dateISO?: string): Promise<HabitLog[]>;
  getHabitLog(userId: number, habitId: number, dateISO: string): Promise<HabitLog | undefined>;
  createHabitLog(log: InsertHabitLog): Promise<HabitLog>;
  updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog | undefined>;
  deleteHabitLog(id: number): Promise<void>;
  toggleHabitLog(userId: number, habitId: number, dateISO: string): Promise<HabitLog>;
  
  getTasks(userId: number, dateISO?: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;
  
  getBuddyConnections(userId: number): Promise<BuddyConnection[]>;
  getBuddyConnectionById(id: number): Promise<BuddyConnection | undefined>;
  getPendingRequests(userId: number): Promise<BuddyConnection[]>;
  createBuddyConnection(connection: InsertBuddyConnection): Promise<BuddyConnection>;
  updateBuddyConnection(id: number, status: string): Promise<BuddyConnection | undefined>;
  deleteBuddyConnection(id: number): Promise<void>;
  areBuddies(userId1: number, userId2: number): Promise<boolean>;
  
  getVisibilitySettings(userId: number): Promise<VisibilitySettings | undefined>;
  createVisibilitySettings(settings: InsertVisibilitySettings): Promise<VisibilitySettings>;
  updateVisibilitySettings(userId: number, updates: Partial<VisibilitySettings>): Promise<VisibilitySettings | undefined>;
  
  getAcknowledgements(subjectUserId: number, dateISO: string): Promise<Acknowledgement[]>;
  createAcknowledgement(ack: InsertAcknowledgement): Promise<Acknowledgement>;
  getAcknowledgement(subjectUserId: number, buddyUserId: number, dateISO: string, type: string): Promise<Acknowledgement | undefined>;
  
  seedDefaultHabits(userId: number): Promise<void>;
  
  getUserByEmail(email: string): Promise<User | undefined>;
  createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(id: number): Promise<void>;
  
  getHabitWatchers(habitId: number): Promise<HabitWatcher[]>;
  getHabitWatcher(habitId: number, buddyUserId: number): Promise<HabitWatcher | undefined>;
  createHabitWatcher(watcher: InsertHabitWatcher): Promise<HabitWatcher>;
  updateHabitWatcher(id: number, updates: Partial<HabitWatcher>): Promise<HabitWatcher | undefined>;
  deleteHabitWatcher(habitId: number, buddyUserId: number): Promise<void>;
  getWatcherCountByHabit(habitId: number): Promise<number>;
  getWatchedHabitsByUser(buddyUserId: number): Promise<HabitWatcher[]>;
  
  getHabitReactions(habitId: number, dateISO: string): Promise<HabitReaction[]>;
  getHabitReaction(habitId: number, buddyUserId: number, dateISO: string, reactionType: string): Promise<HabitReaction | undefined>;
  createHabitReaction(reaction: InsertHabitReaction): Promise<HabitReaction>;
  deleteHabitReaction(habitId: number, buddyUserId: number, dateISO: string, reactionType: string): Promise<void>;
  getReactionCountsByHabit(habitId: number, dateISO: string): Promise<Record<string, number>>;
  
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<void>;
  markAllNotificationsRead(userId: number): Promise<void>;
  
  getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined>;
  createNotificationPreferences(prefs: InsertNotificationPreferences): Promise<NotificationPreferences>;
  updateNotificationPreferences(userId: number, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences | undefined>;
  
  getChatrooms(userId: number): Promise<Chatroom[]>;
  getChatroom(id: number): Promise<Chatroom | undefined>;
  createChatroom(chatroom: InsertChatroom): Promise<Chatroom>;
  deleteChatroom(id: number): Promise<void>;
  
  getChatroomMembers(chatroomId: number): Promise<ChatroomMember[]>;
  getChatroomMember(chatroomId: number, userId: number): Promise<ChatroomMember | undefined>;
  addChatroomMember(member: InsertChatroomMember): Promise<ChatroomMember>;
  updateChatroomMember(chatroomId: number, userId: number, updates: Partial<ChatroomMember>): Promise<ChatroomMember | undefined>;
  removeChatroomMember(chatroomId: number, userId: number): Promise<void>;
  isChatroomMember(chatroomId: number, userId: number): Promise<boolean>;
  isChatroomAdmin(chatroomId: number, userId: number): Promise<boolean>;
  
  getChatMessages(chatroomId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  getOnboardingState(userId: number): Promise<OnboardingState | undefined>;
  createOnboardingState(state: InsertOnboardingState): Promise<OnboardingState>;
  updateOnboardingState(userId: number, updates: Partial<OnboardingState>): Promise<OnboardingState | undefined>;
  deleteDefaultHabits(userId: number): Promise<void>;
  
  // Discovery
  searchPublicUsers(query: string, excludeUserId: number, limit?: number): Promise<User[]>;
  getPublicUsers(excludeUserId: number, limit?: number): Promise<User[]>;
  getBlockedUsers(userId: number): Promise<number[]>;
  blockUser(blockerId: number, blockedId: number): Promise<UserBlock>;
  unblockUser(blockerId: number, blockedId: number): Promise<void>;
  isBlocked(blockerId: number, blockedId: number): Promise<boolean>;
  
  // Projects
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<void>;
  
  getProjectMembers(projectId: number): Promise<ProjectMember[]>;
  getProjectMember(projectId: number, userId: number): Promise<ProjectMember | undefined>;
  createProjectMember(member: InsertProjectMember): Promise<ProjectMember>;
  updateProjectMember(id: number, updates: Partial<ProjectMember>): Promise<ProjectMember | undefined>;
  deleteProjectMember(projectId: number, userId: number): Promise<void>;
  getProjectInvites(userId: number): Promise<ProjectMember[]>;
  
  getProjectHabitLinks(projectId: number): Promise<ProjectHabitLink[]>;
  createProjectHabitLink(link: InsertProjectHabitLink): Promise<ProjectHabitLink>;
  deleteProjectHabitLink(projectId: number, habitId: number): Promise<void>;
  
  getProjectContributions(projectId: number, startDate?: string, endDate?: string): Promise<ProjectContribution[]>;
  createProjectContribution(contribution: InsertProjectContribution): Promise<ProjectContribution>;
  getProjectProgress(projectId: number): Promise<number>;
  
  // Task Seen
  getTaskSeenByTask(taskId: number): Promise<TaskSeen[]>;
  markTaskSeen(taskId: number, buddyUserId: number): Promise<TaskSeen>;
  getTaskSeenForUser(taskOwnerId: number, buddyUserId: number): Promise<TaskSeen[]>;
  
  // Anchor Seen
  getAnchorSeenByLog(habitLogId: number): Promise<AnchorSeen[]>;
  markAnchorSeen(habitLogId: number, subjectUserId: number, viewerUserId: number): Promise<AnchorSeen>;
  removeAnchorSeen(habitLogId: number, viewerUserId: number): Promise<void>;
  deleteAnchorSeenForLog(habitLogId: number): Promise<void>;
  getHabitLogById(id: number): Promise<HabitLog | undefined>;
  
  // Follows
  createFollow(followerId: number, followingId: number): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<void>;
  getFollow(followerId: number, followingId: number): Promise<Follow | undefined>;
  getFollowers(userId: number): Promise<User[]>;
  getFollowing(userId: number): Promise<User[]>;
  getFollowerCount(userId: number): Promise<number>;
  getFollowingCount(userId: number): Promise<number>;
  
  // Public projects
  getPublicProjects(limit?: number): Promise<Project[]>;
  joinProject(projectId: number, userId: number): Promise<ProjectMember>;
  leaveProject(projectId: number, userId: number): Promise<void>;
  
  // Notification Deliveries
  createNotificationDelivery(delivery: InsertNotificationDelivery): Promise<NotificationDelivery>;
  getNotificationDeliveryByDedupeKey(dedupeKey: string): Promise<NotificationDelivery | undefined>;
  updateNotificationDelivery(id: number, updates: Partial<NotificationDelivery>): Promise<NotificationDelivery | undefined>;
  
  // Email Queue
  createEmailQueueItem(item: InsertEmailQueueItem): Promise<EmailQueueItem>;
  getEmailQueueItemByDedupeKey(dedupeKey: string): Promise<EmailQueueItem | undefined>;
  getPendingEmailQueueItems(limit?: number): Promise<EmailQueueItem[]>;
  updateEmailQueueItem(id: number, updates: Partial<EmailQueueItem>): Promise<EmailQueueItem | undefined>;
  
  // User activity tracking
  updateLastSeen(userId: number): Promise<void>;
  isUserOnline(userId: number, thresholdMinutes?: number): Promise<boolean>;
  
  // Get notification with related user
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByEntity(entityType: string, entityId: number): Promise<Notification[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getHabits(userId: number): Promise<Habit[]> {
    return db.select().from(habits).where(eq(habits.userId, userId)).orderBy(asc(habits.order));
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit || undefined;
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const [created] = await db.insert(habits).values(habit).returning();
    return created;
  }

  async updateHabit(id: number, updates: Partial<Habit>): Promise<Habit | undefined> {
    const [habit] = await db.update(habits).set(updates).where(eq(habits.id, id)).returning();
    return habit || undefined;
  }

  async deleteHabit(id: number): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }

  async getHabitLogs(userId: number, dateISO?: string): Promise<HabitLog[]> {
    if (dateISO) {
      return db.select().from(habitLogs).where(and(eq(habitLogs.userId, userId), eq(habitLogs.dateISO, dateISO)));
    }
    return db.select().from(habitLogs).where(eq(habitLogs.userId, userId));
  }

  async getHabitLog(userId: number, habitId: number, dateISO: string): Promise<HabitLog | undefined> {
    const [log] = await db.select().from(habitLogs).where(
      and(eq(habitLogs.userId, userId), eq(habitLogs.habitId, habitId), eq(habitLogs.dateISO, dateISO))
    );
    return log || undefined;
  }

  async createHabitLog(log: InsertHabitLog): Promise<HabitLog> {
    const [created] = await db.insert(habitLogs).values(log).returning();
    return created;
  }

  async updateHabitLog(id: number, updates: Partial<HabitLog>): Promise<HabitLog | undefined> {
    const [log] = await db.update(habitLogs).set(updates).where(eq(habitLogs.id, id)).returning();
    return log || undefined;
  }

  async deleteHabitLog(id: number): Promise<void> {
    await db.delete(habitLogs).where(eq(habitLogs.id, id));
  }

  async toggleHabitLog(userId: number, habitId: number, dateISO: string): Promise<HabitLog> {
    const existing = await this.getHabitLog(userId, habitId, dateISO);
    if (existing) {
      const [updated] = await db.update(habitLogs).set({ done: !existing.done }).where(eq(habitLogs.id, existing.id)).returning();
      return updated;
    }
    return this.createHabitLog({ userId, habitId, dateISO, done: true });
  }

  async getTasks(userId: number, dateISO?: string): Promise<Task[]> {
    if (dateISO) {
      return db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.dateISO, dateISO)));
    }
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getBuddyConnections(userId: number): Promise<BuddyConnection[]> {
    return db.select().from(buddyConnections).where(
      and(
        or(eq(buddyConnections.requesterId, userId), eq(buddyConnections.receiverId, userId)),
        eq(buddyConnections.status, "accepted")
      )
    );
  }

  async getBuddyConnectionById(id: number): Promise<BuddyConnection | undefined> {
    const [connection] = await db.select().from(buddyConnections).where(eq(buddyConnections.id, id));
    return connection || undefined;
  }

  async getPendingRequests(userId: number): Promise<BuddyConnection[]> {
    return db.select().from(buddyConnections).where(
      and(eq(buddyConnections.receiverId, userId), eq(buddyConnections.status, "pending"))
    );
  }

  async createBuddyConnection(connection: InsertBuddyConnection): Promise<BuddyConnection> {
    const [created] = await db.insert(buddyConnections).values(connection).returning();
    return created;
  }

  async updateBuddyConnection(id: number, status: string): Promise<BuddyConnection | undefined> {
    const [updated] = await db.update(buddyConnections).set({ status }).where(eq(buddyConnections.id, id)).returning();
    return updated || undefined;
  }

  async deleteBuddyConnection(id: number): Promise<void> {
    await db.delete(buddyConnections).where(eq(buddyConnections.id, id));
  }

  async areBuddies(userId1: number, userId2: number): Promise<boolean> {
    const [connection] = await db.select().from(buddyConnections).where(
      and(
        or(
          and(eq(buddyConnections.requesterId, userId1), eq(buddyConnections.receiverId, userId2)),
          and(eq(buddyConnections.requesterId, userId2), eq(buddyConnections.receiverId, userId1))
        ),
        eq(buddyConnections.status, "accepted")
      )
    );
    return !!connection;
  }

  async getVisibilitySettings(userId: number): Promise<VisibilitySettings | undefined> {
    const [settings] = await db.select().from(visibilitySettings).where(eq(visibilitySettings.userId, userId));
    return settings || undefined;
  }

  async createVisibilitySettings(settings: InsertVisibilitySettings): Promise<VisibilitySettings> {
    const [created] = await db.insert(visibilitySettings).values(settings).returning();
    return created;
  }

  async updateVisibilitySettings(userId: number, updates: Partial<VisibilitySettings>): Promise<VisibilitySettings | undefined> {
    const [updated] = await db.update(visibilitySettings).set(updates).where(eq(visibilitySettings.userId, userId)).returning();
    return updated || undefined;
  }

  async getAcknowledgements(subjectUserId: number, dateISO: string): Promise<Acknowledgement[]> {
    return db.select().from(acknowledgements).where(
      and(eq(acknowledgements.subjectUserId, subjectUserId), eq(acknowledgements.dateISO, dateISO))
    );
  }

  async createAcknowledgement(ack: InsertAcknowledgement): Promise<Acknowledgement> {
    const [created] = await db.insert(acknowledgements).values(ack).returning();
    return created;
  }

  async getAcknowledgement(subjectUserId: number, buddyUserId: number, dateISO: string, type: string): Promise<Acknowledgement | undefined> {
    const [ack] = await db.select().from(acknowledgements).where(
      and(
        eq(acknowledgements.subjectUserId, subjectUserId),
        eq(acknowledgements.buddyUserId, buddyUserId),
        eq(acknowledgements.dateISO, dateISO),
        eq(acknowledgements.type, type)
      )
    );
    return ack || undefined;
  }

  async seedDefaultHabits(userId: number): Promise<void> {
    const existingHabits = await this.getHabits(userId);
    if (existingHabits.length === 0) {
      for (let i = 0; i < defaultHabits.length; i++) {
        await this.createHabit({
          userId,
          ...defaultHabits[i],
          order: i,
        });
      }
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [created] = await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    }).returning();
    return created;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken || undefined;
  }

  async markPasswordResetTokenUsed(id: number): Promise<void> {
    await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, id));
  }

  async getHabitWatchers(habitId: number): Promise<HabitWatcher[]> {
    return db.select().from(habitWatchers).where(eq(habitWatchers.habitId, habitId));
  }

  async getHabitWatcher(habitId: number, buddyUserId: number): Promise<HabitWatcher | undefined> {
    const [watcher] = await db.select().from(habitWatchers).where(
      and(eq(habitWatchers.habitId, habitId), eq(habitWatchers.buddyUserId, buddyUserId))
    );
    return watcher || undefined;
  }

  async createHabitWatcher(watcher: InsertHabitWatcher): Promise<HabitWatcher> {
    const [created] = await db.insert(habitWatchers).values(watcher).returning();
    return created;
  }

  async updateHabitWatcher(id: number, updates: Partial<HabitWatcher>): Promise<HabitWatcher | undefined> {
    const [updated] = await db.update(habitWatchers).set({ ...updates, updatedAt: new Date() }).where(eq(habitWatchers.id, id)).returning();
    return updated || undefined;
  }

  async deleteHabitWatcher(habitId: number, buddyUserId: number): Promise<void> {
    await db.delete(habitWatchers).where(
      and(eq(habitWatchers.habitId, habitId), eq(habitWatchers.buddyUserId, buddyUserId))
    );
  }

  async getWatcherCountByHabit(habitId: number): Promise<number> {
    const watchers = await this.getHabitWatchers(habitId);
    return watchers.length;
  }

  async getWatchedHabitsByUser(buddyUserId: number): Promise<HabitWatcher[]> {
    return db.select().from(habitWatchers).where(eq(habitWatchers.buddyUserId, buddyUserId));
  }

  async getHabitReactions(habitId: number, dateISO: string): Promise<HabitReaction[]> {
    return db.select().from(habitReactions).where(
      and(eq(habitReactions.habitId, habitId), eq(habitReactions.dateISO, dateISO))
    );
  }

  async getHabitReaction(habitId: number, buddyUserId: number, dateISO: string, reactionType: string): Promise<HabitReaction | undefined> {
    const [reaction] = await db.select().from(habitReactions).where(
      and(
        eq(habitReactions.habitId, habitId),
        eq(habitReactions.buddyUserId, buddyUserId),
        eq(habitReactions.dateISO, dateISO),
        eq(habitReactions.reactionType, reactionType)
      )
    );
    return reaction || undefined;
  }

  async createHabitReaction(reaction: InsertHabitReaction): Promise<HabitReaction> {
    const [created] = await db.insert(habitReactions).values(reaction).returning();
    return created;
  }

  async deleteHabitReaction(habitId: number, buddyUserId: number, dateISO: string, reactionType: string): Promise<void> {
    await db.delete(habitReactions).where(
      and(
        eq(habitReactions.habitId, habitId),
        eq(habitReactions.buddyUserId, buddyUserId),
        eq(habitReactions.dateISO, dateISO),
        eq(habitReactions.reactionType, reactionType)
      )
    );
  }

  async getReactionCountsByHabit(habitId: number, dateISO: string): Promise<Record<string, number>> {
    const reactions = await this.getHabitReactions(habitId, dateISO);
    const counts: Record<string, number> = {};
    for (const reaction of reactions) {
      counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1;
    }
    return counts;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const unread = await db.select().from(notifications).where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );
    return unread.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  async markAllNotificationsRead(userId: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
  }

  async getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined> {
    const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
    return prefs || undefined;
  }

  async createNotificationPreferences(prefs: InsertNotificationPreferences): Promise<NotificationPreferences> {
    const [created] = await db.insert(notificationPreferences).values(prefs).returning();
    return created;
  }

  async updateNotificationPreferences(userId: number, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences | undefined> {
    const [updated] = await db.update(notificationPreferences).set(updates).where(eq(notificationPreferences.userId, userId)).returning();
    return updated || undefined;
  }

  async getChatrooms(userId: number): Promise<Chatroom[]> {
    const memberOf = await db.select().from(chatroomMembers).where(eq(chatroomMembers.userId, userId));
    const chatroomIds = memberOf.map(m => m.chatroomId);
    if (chatroomIds.length === 0) return [];
    
    const result = [];
    for (const id of chatroomIds) {
      const room = await this.getChatroom(id);
      if (room) result.push(room);
    }
    return result;
  }

  async getChatroom(id: number): Promise<Chatroom | undefined> {
    const [room] = await db.select().from(chatrooms).where(eq(chatrooms.id, id));
    return room || undefined;
  }

  async createChatroom(chatroom: InsertChatroom): Promise<Chatroom> {
    const [created] = await db.insert(chatrooms).values(chatroom).returning();
    return created;
  }

  async deleteChatroom(id: number): Promise<void> {
    await db.delete(chatrooms).where(eq(chatrooms.id, id));
  }

  async getChatroomMembers(chatroomId: number): Promise<ChatroomMember[]> {
    return db.select().from(chatroomMembers).where(eq(chatroomMembers.chatroomId, chatroomId));
  }

  async getChatroomMember(chatroomId: number, userId: number): Promise<ChatroomMember | undefined> {
    const [member] = await db.select().from(chatroomMembers).where(
      and(eq(chatroomMembers.chatroomId, chatroomId), eq(chatroomMembers.userId, userId))
    );
    return member || undefined;
  }

  async addChatroomMember(member: InsertChatroomMember): Promise<ChatroomMember> {
    const [created] = await db.insert(chatroomMembers).values(member).returning();
    return created;
  }

  async updateChatroomMember(chatroomId: number, userId: number, updates: Partial<ChatroomMember>): Promise<ChatroomMember | undefined> {
    const [updated] = await db.update(chatroomMembers)
      .set(updates)
      .where(and(eq(chatroomMembers.chatroomId, chatroomId), eq(chatroomMembers.userId, userId)))
      .returning();
    return updated || undefined;
  }

  async removeChatroomMember(chatroomId: number, userId: number): Promise<void> {
    await db.delete(chatroomMembers).where(
      and(eq(chatroomMembers.chatroomId, chatroomId), eq(chatroomMembers.userId, userId))
    );
  }

  async isChatroomMember(chatroomId: number, userId: number): Promise<boolean> {
    const [member] = await db.select().from(chatroomMembers).where(
      and(eq(chatroomMembers.chatroomId, chatroomId), eq(chatroomMembers.userId, userId))
    );
    return !!member;
  }

  async isChatroomAdmin(chatroomId: number, userId: number): Promise<boolean> {
    const [member] = await db.select().from(chatroomMembers).where(
      and(eq(chatroomMembers.chatroomId, chatroomId), eq(chatroomMembers.userId, userId))
    );
    return member?.role === "admin";
  }

  async getChatMessages(chatroomId: number, limit = 100): Promise<ChatMessage[]> {
    return db.select().from(chatMessages).where(eq(chatMessages.chatroomId, chatroomId)).orderBy(desc(chatMessages.createdAt)).limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages).values(message).returning();
    return created;
  }

  async getOnboardingState(userId: number): Promise<OnboardingState | undefined> {
    const [state] = await db.select().from(onboardingState).where(eq(onboardingState.userId, userId));
    return state || undefined;
  }

  async createOnboardingState(state: InsertOnboardingState): Promise<OnboardingState> {
    const [created] = await db.insert(onboardingState).values(state).returning();
    return created;
  }

  async updateOnboardingState(userId: number, updates: Partial<OnboardingState>): Promise<OnboardingState | undefined> {
    const [updated] = await db.update(onboardingState)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(onboardingState.userId, userId))
      .returning();
    return updated || undefined;
  }

  async deleteDefaultHabits(userId: number): Promise<void> {
    const defaultNames = defaultHabits.map(h => h.name);
    const userHabits = await this.getHabits(userId);
    const habitsToDelete = userHabits.filter(h => defaultNames.includes(h.name));
    for (const habit of habitsToDelete) {
      await this.deleteHabit(habit.id);
    }
  }

  // Discovery methods
  async searchPublicUsers(query: string, excludeUserId: number, limit = 20): Promise<User[]> {
    const blockedIds = await this.getBlockedUsers(excludeUserId);
    const blockedByIds = await this.getUsersWhoBlocked(excludeUserId);
    const excludeIds = [...blockedIds, ...blockedByIds, excludeUserId];
    
    return db.select()
      .from(users)
      .where(
        and(
          eq(users.isPublic, true),
          notInArray(users.id, excludeIds.length > 0 ? excludeIds : [0]),
          or(
            ilike(users.username, `%${query}%`),
            ilike(users.displayName, `%${query}%`)
          )
        )
      )
      .limit(limit);
  }

  async getPublicUsers(excludeUserId: number, limit = 20): Promise<User[]> {
    const blockedIds = await this.getBlockedUsers(excludeUserId);
    const blockedByIds = await this.getUsersWhoBlocked(excludeUserId);
    const excludeIds = [...blockedIds, ...blockedByIds, excludeUserId];
    
    return db.select()
      .from(users)
      .where(
        and(
          eq(users.isPublic, true),
          notInArray(users.id, excludeIds.length > 0 ? excludeIds : [0])
        )
      )
      .orderBy(desc(users.createdAt))
      .limit(limit);
  }

  async getBlockedUsers(userId: number): Promise<number[]> {
    const blocks = await db.select().from(userBlocks).where(eq(userBlocks.blockerId, userId));
    return blocks.map(b => b.blockedId);
  }

  private async getUsersWhoBlocked(userId: number): Promise<number[]> {
    const blocks = await db.select().from(userBlocks).where(eq(userBlocks.blockedId, userId));
    return blocks.map(b => b.blockerId);
  }

  async blockUser(blockerId: number, blockedId: number): Promise<UserBlock> {
    const [block] = await db.insert(userBlocks).values({ blockerId, blockedId }).returning();
    return block;
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    await db.delete(userBlocks).where(
      and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId))
    );
  }

  async isBlocked(blockerId: number, blockedId: number): Promise<boolean> {
    const [block] = await db.select().from(userBlocks).where(
      and(eq(userBlocks.blockerId, blockerId), eq(userBlocks.blockedId, blockedId))
    );
    return !!block;
  }

  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    // Get projects where user is owner or active member
    const ownedProjects = await db.select().from(projects).where(eq(projects.ownerId, userId));
    const memberProjects = await db.select({ project: projects })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(and(eq(projectMembers.userId, userId), eq(projectMembers.status, "active")));
    
    const memberProjectList = memberProjects.map(m => m.project);
    const allProjects = [...ownedProjects, ...memberProjectList];
    
    // Deduplicate by id
    const seen = new Set<number>();
    return allProjects.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [updated] = await db.update(projects).set(updates).where(eq(projects.id, id)).returning();
    return updated || undefined;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async getProjectMembers(projectId: number): Promise<ProjectMember[]> {
    return db.select().from(projectMembers).where(eq(projectMembers.projectId, projectId));
  }

  async getProjectMember(projectId: number, userId: number): Promise<ProjectMember | undefined> {
    const [member] = await db.select().from(projectMembers).where(
      and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))
    );
    return member || undefined;
  }

  async createProjectMember(member: InsertProjectMember): Promise<ProjectMember> {
    const [created] = await db.insert(projectMembers).values(member).returning();
    return created;
  }

  async updateProjectMember(id: number, updates: Partial<ProjectMember>): Promise<ProjectMember | undefined> {
    const [updated] = await db.update(projectMembers).set(updates).where(eq(projectMembers.id, id)).returning();
    return updated || undefined;
  }

  async deleteProjectMember(projectId: number, userId: number): Promise<void> {
    await db.delete(projectMembers).where(
      and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))
    );
  }

  async getProjectInvites(userId: number): Promise<ProjectMember[]> {
    return db.select().from(projectMembers).where(
      and(eq(projectMembers.userId, userId), eq(projectMembers.status, "invited"))
    );
  }

  async getProjectHabitLinks(projectId: number): Promise<ProjectHabitLink[]> {
    return db.select().from(projectHabitLinks).where(eq(projectHabitLinks.projectId, projectId));
  }

  async createProjectHabitLink(link: InsertProjectHabitLink): Promise<ProjectHabitLink> {
    const [created] = await db.insert(projectHabitLinks).values(link).returning();
    return created;
  }

  async deleteProjectHabitLink(projectId: number, habitId: number): Promise<void> {
    await db.delete(projectHabitLinks).where(
      and(eq(projectHabitLinks.projectId, projectId), eq(projectHabitLinks.habitId, habitId))
    );
  }

  async getProjectContributions(projectId: number, startDate?: string, endDate?: string): Promise<ProjectContribution[]> {
    let query = db.select().from(projectContributions).where(eq(projectContributions.projectId, projectId));
    return query.orderBy(desc(projectContributions.createdAt));
  }

  async createProjectContribution(contribution: InsertProjectContribution): Promise<ProjectContribution> {
    const [created] = await db.insert(projectContributions).values(contribution).returning();
    return created;
  }

  async getProjectProgress(projectId: number): Promise<number> {
    const contributions = await this.getProjectContributions(projectId);
    return contributions.reduce((sum, c) => sum + c.amount, 0);
  }

  async getTaskSeenByTask(taskId: number): Promise<TaskSeen[]> {
    return db.select().from(taskSeen).where(eq(taskSeen.taskId, taskId));
  }

  async markTaskSeen(taskId: number, buddyUserId: number): Promise<TaskSeen> {
    const existing = await db.select().from(taskSeen).where(
      and(eq(taskSeen.taskId, taskId), eq(taskSeen.buddyUserId, buddyUserId))
    );
    if (existing.length > 0) {
      return existing[0];
    }
    const [created] = await db.insert(taskSeen).values({ taskId, buddyUserId }).returning();
    return created;
  }

  async getTaskSeenForUser(taskOwnerId: number, buddyUserId: number): Promise<TaskSeen[]> {
    const userTasks = await db.select().from(tasks).where(eq(tasks.userId, taskOwnerId));
    const taskIds = userTasks.map(t => t.id);
    if (taskIds.length === 0) return [];
    return db.select().from(taskSeen).where(
      and(
        sql`${taskSeen.taskId} = ANY(ARRAY[${sql.join(taskIds, sql`, `)}]::int[])`,
        eq(taskSeen.buddyUserId, buddyUserId)
      )
    );
  }

  // Anchor Seen implementations
  async getAnchorSeenByLog(habitLogId: number): Promise<AnchorSeen[]> {
    return db.select().from(anchorSeen).where(eq(anchorSeen.habitLogId, habitLogId));
  }

  async markAnchorSeen(habitLogId: number, subjectUserId: number, viewerUserId: number): Promise<AnchorSeen> {
    const existing = await db.select().from(anchorSeen).where(
      and(eq(anchorSeen.habitLogId, habitLogId), eq(anchorSeen.viewerUserId, viewerUserId))
    );
    if (existing.length > 0) {
      return existing[0];
    }
    const [created] = await db.insert(anchorSeen).values({ habitLogId, subjectUserId, viewerUserId }).returning();
    return created;
  }

  async removeAnchorSeen(habitLogId: number, viewerUserId: number): Promise<void> {
    await db.delete(anchorSeen).where(
      and(eq(anchorSeen.habitLogId, habitLogId), eq(anchorSeen.viewerUserId, viewerUserId))
    );
  }

  async deleteAnchorSeenForLog(habitLogId: number): Promise<void> {
    await db.delete(anchorSeen).where(eq(anchorSeen.habitLogId, habitLogId));
  }

  async getHabitLogById(id: number): Promise<HabitLog | undefined> {
    const [log] = await db.select().from(habitLogs).where(eq(habitLogs.id, id));
    return log || undefined;
  }

  // Follow implementations
  async createFollow(followerId: number, followingId: number): Promise<Follow> {
    const [created] = await db.insert(follows).values({ followerId, followingId }).returning();
    return created;
  }

  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    await db.delete(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
  }

  async getFollow(followerId: number, followingId: number): Promise<Follow | undefined> {
    const [follow] = await db.select().from(follows).where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId))
    );
    return follow || undefined;
  }

  async getFollowers(userId: number): Promise<User[]> {
    const result = await db.select({ user: users }).from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    return result.map(r => r.user);
  }

  async getFollowing(userId: number): Promise<User[]> {
    const result = await db.select({ user: users }).from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    return result.map(r => r.user);
  }

  async getFollowerCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(follows)
      .where(eq(follows.followingId, userId));
    return result[0]?.count || 0;
  }

  async getFollowingCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(follows)
      .where(eq(follows.followerId, userId));
    return result[0]?.count || 0;
  }

  // Public projects
  async getPublicProjects(limit = 50): Promise<Project[]> {
    return db.select().from(projects)
      .where(eq(projects.visibility, "public"))
      .orderBy(desc(projects.createdAt))
      .limit(limit);
  }

  async joinProject(projectId: number, userId: number): Promise<ProjectMember> {
    const existing = await this.getProjectMember(projectId, userId);
    if (existing) {
      if (existing.status !== "active") {
        const [updated] = await db.update(projectMembers)
          .set({ status: "active", joinedAt: new Date() })
          .where(eq(projectMembers.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }
    const [created] = await db.insert(projectMembers).values({
      projectId,
      userId,
      role: "member",
      status: "active",
      joinedAt: new Date(),
    }).returning();
    return created;
  }

  async leaveProject(projectId: number, userId: number): Promise<void> {
    await db.delete(projectMembers).where(
      and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId))
    );
  }

  // Notification Deliveries
  async createNotificationDelivery(delivery: InsertNotificationDelivery): Promise<NotificationDelivery> {
    const [created] = await db.insert(notificationDeliveries).values(delivery).returning();
    return created;
  }

  async getNotificationDeliveryByDedupeKey(dedupeKey: string): Promise<NotificationDelivery | undefined> {
    const [delivery] = await db.select().from(notificationDeliveries).where(eq(notificationDeliveries.dedupeKey, dedupeKey));
    return delivery || undefined;
  }

  async updateNotificationDelivery(id: number, updates: Partial<NotificationDelivery>): Promise<NotificationDelivery | undefined> {
    const [updated] = await db.update(notificationDeliveries).set(updates).where(eq(notificationDeliveries.id, id)).returning();
    return updated || undefined;
  }

  // Email Queue
  async createEmailQueueItem(item: InsertEmailQueueItem): Promise<EmailQueueItem> {
    const [created] = await db.insert(emailQueue).values(item).returning();
    return created;
  }

  async getEmailQueueItemByDedupeKey(dedupeKey: string): Promise<EmailQueueItem | undefined> {
    const [item] = await db.select().from(emailQueue).where(eq(emailQueue.dedupeKey, dedupeKey));
    return item || undefined;
  }

  async getPendingEmailQueueItems(limit = 10): Promise<EmailQueueItem[]> {
    return db.select().from(emailQueue)
      .where(and(
        eq(emailQueue.status, "QUEUED"),
        sql`${emailQueue.scheduledFor} <= NOW()`
      ))
      .orderBy(asc(emailQueue.createdAt))
      .limit(limit);
  }

  async updateEmailQueueItem(id: number, updates: Partial<EmailQueueItem>): Promise<EmailQueueItem | undefined> {
    const [updated] = await db.update(emailQueue).set(updates).where(eq(emailQueue.id, id)).returning();
    return updated || undefined;
  }

  // User activity tracking
  async updateLastSeen(userId: number): Promise<void> {
    await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, userId));
  }

  async isUserOnline(userId: number, thresholdMinutes = 5): Promise<boolean> {
    const [user] = await db.select({ lastSeenAt: users.lastSeenAt }).from(users).where(eq(users.id, userId));
    if (!user?.lastSeenAt) return false;
    const threshold = new Date(Date.now() - thresholdMinutes * 60 * 1000);
    return user.lastSeenAt > threshold;
  }

  // Get notification with related user
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async getNotificationsByEntity(entityType: string, entityId: number): Promise<Notification[]> {
    return db.select().from(notifications)
      .where(and(eq(notifications.entityType, entityType), eq(notifications.entityId, entityId)))
      .orderBy(desc(notifications.createdAt));
  }
}

export const storage = new DatabaseStorage();
