import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendPasswordResetEmail } from "./email";
import crypto from "crypto";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { format } from "date-fns";

const scryptAsync = promisify(scrypt);

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint (no auth required)
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  setupAuth(app);

  app.get("/api/habits", requireAuth, async (req, res) => {
    const habits = await storage.getHabits(req.user!.id);
    res.json(habits);
  });

  app.post("/api/habits", requireAuth, async (req, res) => {
    const habit = await storage.createHabit({
      userId: req.user!.id,
      ...req.body,
    });
    res.status(201).json(habit);
  });

  app.patch("/api/habits/:id", requireAuth, async (req, res) => {
    const habit = await storage.getHabit(parseInt(req.params.id));
    if (!habit || habit.userId !== req.user!.id) {
      return res.status(404).json({ error: "Habit not found" });
    }
    const updated = await storage.updateHabit(habit.id, req.body);
    res.json(updated);
  });

  app.delete("/api/habits/:id", requireAuth, async (req, res) => {
    const habit = await storage.getHabit(parseInt(req.params.id));
    if (!habit || habit.userId !== req.user!.id) {
      return res.status(404).json({ error: "Habit not found" });
    }
    await storage.deleteHabit(habit.id);
    res.sendStatus(204);
  });

  app.get("/api/habit-logs", requireAuth, async (req, res) => {
    const dateISO = req.query.date as string | undefined;
    const logs = await storage.getHabitLogs(req.user!.id, dateISO);
    res.json(logs);
  });

  app.post("/api/habit-logs/toggle", requireAuth, async (req, res) => {
    const { habitId, dateISO } = req.body;
    const log = await storage.toggleHabitLog(req.user!.id, habitId, dateISO);
    
    if (log.done) {
      const { checkHabitMilestones } = await import("./notifications");
      checkHabitMilestones(req.user!.id, habitId).catch(console.error);
    } else {
      // Delete all AnchorSeen records when completion is toggled off
      await storage.deleteAnchorSeenForLog(log.id);
    }
    
    res.json(log);
  });

  app.get("/api/buddies", requireAuth, async (req, res) => {
    const connections = await storage.getBuddyConnections(req.user!.id);
    const buddiesWithInfo = await Promise.all(
      connections.map(async (conn) => {
        const buddyId = conn.requesterId === req.user!.id ? conn.receiverId : conn.requesterId;
        const buddy = await storage.getUser(buddyId);
        return { connection: conn, buddy };
      })
    );
    res.json(buddiesWithInfo);
  });

  app.get("/api/buddies/pending", requireAuth, async (req, res) => {
    const pending = await storage.getPendingRequests(req.user!.id);
    const requestsWithInfo = await Promise.all(
      pending.map(async (conn) => {
        const requester = await storage.getUser(conn.requesterId);
        return { connection: conn, requester };
      })
    );
    res.json(requestsWithInfo);
  });

  app.post("/api/buddies/invite", requireAuth, async (req, res) => {
    const { username } = req.body;
    const targetUser = await storage.getUserByUsername(username);
    
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (targetUser.id === req.user!.id) {
      return res.status(400).json({ error: "Cannot invite yourself" });
    }

    const alreadyBuddies = await storage.areBuddies(req.user!.id, targetUser.id);
    if (alreadyBuddies) {
      return res.status(400).json({ error: "Already connected" });
    }

    try {
      const connection = await storage.createBuddyConnection({
        requesterId: req.user!.id,
        receiverId: targetUser.id,
        status: "pending",
      });
      
      const { notifyBuddyRequest } = await import("./notifications");
      notifyBuddyRequest(req.user!.id, targetUser.id).catch(console.error);
      
      res.status(201).json(connection);
    } catch (error) {
      res.status(400).json({ error: "Invite already sent" });
    }
  });

  app.post("/api/buddies/:id/accept", requireAuth, async (req, res) => {
    const connectionId = parseInt(req.params.id);
    const connection = await storage.getBuddyConnectionById(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    
    if (connection.receiverId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const updated = await storage.updateBuddyConnection(connectionId, "accepted");
    
    const { notifyBuddyAccepted } = await import("./notifications");
    notifyBuddyAccepted(req.user!.id, connection.requesterId).catch(console.error);
    
    res.json(updated);
  });

  app.post("/api/buddies/:id/decline", requireAuth, async (req, res) => {
    const connectionId = parseInt(req.params.id);
    const connection = await storage.getBuddyConnectionById(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    
    if (connection.receiverId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    await storage.deleteBuddyConnection(connectionId);
    res.sendStatus(204);
  });

  app.delete("/api/buddies/:id", requireAuth, async (req, res) => {
    const connectionId = parseInt(req.params.id);
    const connection = await storage.getBuddyConnectionById(connectionId);
    
    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }
    
    if (connection.requesterId !== req.user!.id && connection.receiverId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    await storage.deleteBuddyConnection(connectionId);
    res.sendStatus(204);
  });

  app.get("/api/buddies/:userId/overview", requireAuth, async (req, res) => {
    const buddyId = parseInt(req.params.userId);
    
    const areBuddies = await storage.areBuddies(req.user!.id, buddyId);
    if (!areBuddies) {
      return res.status(403).json({ error: "Not connected" });
    }

    const buddy = await storage.getUser(buddyId);
    const visibility = await storage.getVisibilitySettings(buddyId);
    
    let habits: any[] = [];
    let habitLogs: any[] = [];

    if (visibility?.shareHabits) {
      habits = await storage.getHabits(buddyId);
    }
    
    if (visibility?.shareHabitStatus) {
      habitLogs = await storage.getHabitLogs(buddyId);
    }

    res.json({ buddy, habits, habitLogs, visibility });
  });

  app.get("/api/buddies/:userId/anchors-seen", requireAuth, async (req, res) => {
    const buddyId = parseInt(req.params.userId);
    const dateISO = req.query.date as string;
    
    const areBuddies = await storage.areBuddies(req.user!.id, buddyId);
    if (!areBuddies) {
      return res.status(403).json({ error: "Not connected" });
    }

    const habitLogs = await storage.getHabitLogs(buddyId);
    const todayLogs = dateISO ? habitLogs.filter(l => l.dateISO === dateISO && l.done) : habitLogs.filter(l => l.done);
    
    const seenRecords: any[] = [];
    for (const log of todayLogs) {
      const allSeen = await storage.getAnchorSeenByLog(log.id);
      const mySeenRecord = allSeen.find(s => s.viewerUserId === req.user!.id);
      seenRecords.push({
        habitLogId: log.id,
        seen: !!mySeenRecord,
        seenAt: mySeenRecord?.createdAt || null,
      });
    }
    
    res.json(seenRecords);
  });

  app.get("/api/visibility", requireAuth, async (req, res) => {
    let settings = await storage.getVisibilitySettings(req.user!.id);
    if (!settings) {
      settings = await storage.createVisibilitySettings({
        userId: req.user!.id,
        shareHabits: true,
        shareHabitStatus: true,
        shareTasksTitles: false,
        shareTasksCountsOnly: true,
      });
    }
    res.json(settings);
  });

  app.patch("/api/visibility", requireAuth, async (req, res) => {
    const updated = await storage.updateVisibilitySettings(req.user!.id, req.body);
    res.json(updated);
  });

  app.get("/api/acknowledgements", requireAuth, async (req, res) => {
    const dateISO = req.query.date as string;
    const acks = await storage.getAcknowledgements(req.user!.id, dateISO);
    const acksWithBuddies = await Promise.all(
      acks.map(async (ack) => {
        const buddy = await storage.getUser(ack.buddyUserId);
        return { ...ack, buddy };
      })
    );
    res.json(acksWithBuddies);
  });

  app.post("/api/acknowledgements", requireAuth, async (req, res) => {
    const { subjectUserId, dateISO, type, comment } = req.body;

    const areBuddies = await storage.areBuddies(req.user!.id, subjectUserId);
    if (!areBuddies) {
      return res.status(403).json({ error: "Not connected" });
    }

    const existing = await storage.getAcknowledgement(subjectUserId, req.user!.id, dateISO, type);
    if (existing) {
      return res.status(400).json({ error: "Already acknowledged" });
    }

    const ack = await storage.createAcknowledgement({
      subjectUserId,
      buddyUserId: req.user!.id,
      dateISO,
      type,
      comment,
    });
    res.status(201).json(ack);
  });

  // AnchorSeen - mark anchor completion as seen by buddies
  app.get("/api/anchor-logs/:logId/seen", requireAuth, async (req, res) => {
    const logId = parseInt(req.params.logId);
    const log = await storage.getHabitLogById(logId);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }
    if (log.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    const seenList = await storage.getAnchorSeenByLog(logId);
    const seenWithViewers = await Promise.all(
      seenList.map(async (s) => {
        const viewer = await storage.getUser(s.viewerUserId);
        return { ...s, viewer };
      })
    );
    res.json(seenWithViewers);
  });

  app.post("/api/anchor-logs/:logId/seen", requireAuth, async (req, res) => {
    const logId = parseInt(req.params.logId);
    const log = await storage.getHabitLogById(logId);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }
    if (!log.done) {
      return res.status(400).json({ error: "Cannot mark as seen - anchor not completed" });
    }
    const areBuddies = await storage.areBuddies(req.user!.id, log.userId);
    if (!areBuddies) {
      return res.status(403).json({ error: "Not connected" });
    }
    const seen = await storage.markAnchorSeen(logId, log.userId, req.user!.id);
    res.status(201).json(seen);
  });

  app.delete("/api/anchor-logs/:logId/seen", requireAuth, async (req, res) => {
    const logId = parseInt(req.params.logId);
    const log = await storage.getHabitLogById(logId);
    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }
    const areBuddies = await storage.areBuddies(req.user!.id, log.userId);
    if (!areBuddies) {
      return res.status(403).json({ error: "Not connected" });
    }
    await storage.removeAnchorSeen(logId, req.user!.id);
    res.sendStatus(204);
  });

  app.patch("/api/profile", requireAuth, async (req, res) => {
    const { displayName, timezone, bio, isPublic } = req.body;
    const updates: { displayName?: string; timezone?: string; bio?: string; isPublic?: boolean } = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (timezone !== undefined) updates.timezone = timezone;
    if (bio !== undefined) updates.bio = bio;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    const updated = await storage.updateUser(req.user!.id, updates);
    res.json(updated);
  });

  app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.json({ message: "If an account with that email exists, a reset link has been sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await storage.createPasswordResetToken(user.id, token, expiresAt);

    try {
      await sendPasswordResetEmail(email, token, user.username);
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }

    res.json({ message: "If an account with that email exists, a reset link has been sent." });
  });

  app.post("/api/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    if (resetToken.usedAt) {
      return res.status(400).json({ error: "This reset link has already been used" });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ error: "This reset link has expired" });
    }

    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedPassword = `${derivedKey.toString("hex")}.${salt}`;

    await storage.updateUser(resetToken.userId, { password: hashedPassword });
    await storage.markPasswordResetTokenUsed(resetToken.id);

    res.json({ message: "Password has been reset successfully" });
  });

  app.get("/api/habits/:id/watchers", requireAuth, async (req, res) => {
    const habitId = parseInt(req.params.id);
    const habit = await storage.getHabit(habitId);
    
    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    if (habit.userId !== req.user!.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const watchers = await storage.getHabitWatchers(habitId);
    const watchersWithUsers = await Promise.all(
      watchers.map(async (w) => {
        const buddy = await storage.getUser(w.buddyUserId);
        return { ...w, buddy };
      })
    );
    res.json(watchersWithUsers);
  });

  app.post("/api/habits/:id/watchers", requireAuth, async (req, res) => {
    const habitId = parseInt(req.params.id);
    const habit = await storage.getHabit(habitId);
    
    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    const areBuddies = await storage.areBuddies(req.user!.id, habit.userId);
    if (!areBuddies) {
      return res.status(403).json({ error: "Not connected as buddies" });
    }
    
    const visibility = await storage.getVisibilitySettings(habit.userId);
    if (visibility && !visibility.shareHabits) {
      return res.status(403).json({ error: "User has not shared their habits" });
    }
    
    const existing = await storage.getHabitWatcher(habitId, req.user!.id);
    if (existing) {
      const updated = await storage.updateHabitWatcher(existing.id, { status: req.body.status || "watching" });
      return res.json(updated);
    }
    
    const watcher = await storage.createHabitWatcher({
      habitId,
      buddyUserId: req.user!.id,
      status: req.body.status || "watching",
    });
    res.status(201).json(watcher);
  });

  app.delete("/api/habits/:id/watchers", requireAuth, async (req, res) => {
    const habitId = parseInt(req.params.id);
    await storage.deleteHabitWatcher(habitId, req.user!.id);
    res.json({ success: true });
  });

  app.get("/api/habits/:id/reactions", requireAuth, async (req, res) => {
    const habitId = parseInt(req.params.id);
    const dateISO = req.query.date as string;
    
    if (!dateISO) {
      return res.status(400).json({ error: "Date is required" });
    }
    
    const habit = await storage.getHabit(habitId);
    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    const areBuddies = await storage.areBuddies(req.user!.id, habit.userId);
    const isOwner = habit.userId === req.user!.id;
    
    if (!areBuddies && !isOwner) {
      return res.status(403).json({ error: "Not authorized" });
    }
    
    const reactions = await storage.getHabitReactions(habitId, dateISO);
    const reactionsWithUsers = await Promise.all(
      reactions.map(async (r) => {
        const buddy = await storage.getUser(r.buddyUserId);
        return { ...r, buddy };
      })
    );
    
    const counts = await storage.getReactionCountsByHabit(habitId, dateISO);
    res.json({ reactions: reactionsWithUsers, counts });
  });

  app.post("/api/habits/:id/reactions", requireAuth, async (req, res) => {
    const habitId = parseInt(req.params.id);
    const { dateISO, reactionType } = req.body;
    
    if (!dateISO || !reactionType) {
      return res.status(400).json({ error: "Date and reaction type are required" });
    }
    
    const habit = await storage.getHabit(habitId);
    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    const areBuddies = await storage.areBuddies(req.user!.id, habit.userId);
    if (!areBuddies) {
      return res.status(403).json({ error: "Not connected as buddies" });
    }
    
    const visibility = await storage.getVisibilitySettings(habit.userId);
    if (visibility && !visibility.shareHabits) {
      return res.status(403).json({ error: "User has not shared their habits" });
    }
    
    const existing = await storage.getHabitReaction(habitId, req.user!.id, dateISO, reactionType);
    if (existing) {
      return res.json(existing);
    }
    
    const reaction = await storage.createHabitReaction({
      habitId,
      buddyUserId: req.user!.id,
      dateISO,
      reactionType,
    });
    res.status(201).json(reaction);
  });

  app.delete("/api/habits/:id/reactions", requireAuth, async (req, res) => {
    const habitId = parseInt(req.params.id);
    const { dateISO, reactionType } = req.body;
    
    if (!dateISO || !reactionType) {
      return res.status(400).json({ error: "Date and reaction type are required" });
    }
    
    await storage.deleteHabitReaction(habitId, req.user!.id, dateISO, reactionType);
    res.json({ success: true });
  });

  app.get("/api/my-watched-habits", requireAuth, async (req, res) => {
    const watchedHabits = await storage.getWatchedHabitsByUser(req.user!.id);
    const habitsWithDetails = await Promise.all(
      watchedHabits.map(async (w) => {
        const habit = await storage.getHabit(w.habitId);
        const owner = habit ? await storage.getUser(habit.userId) : null;
        return { ...w, habit, owner };
      })
    );
    res.json(habitsWithDetails);
  });

  app.get("/api/my-habits-watchers", requireAuth, async (req, res) => {
    const habits = await storage.getHabits(req.user!.id);
    const watcherCounts: Record<number, { count: number; watchers: any[] }> = {};
    
    for (const habit of habits) {
      const watchers = await storage.getHabitWatchers(habit.id);
      const validWatchers = [];
      
      for (const w of watchers) {
        const areBuddies = await storage.areBuddies(req.user!.id, w.buddyUserId);
        if (!areBuddies) continue;
        
        const buddy = await storage.getUser(w.buddyUserId);
        validWatchers.push({ ...w, buddy });
      }
      
      watcherCounts[habit.id] = {
        count: validWatchers.length,
        watchers: validWatchers,
      };
    }
    
    res.json(watcherCounts);
  });

  app.get("/api/my-habits-reactions", requireAuth, async (req, res) => {
    const dateISO = req.query.date as string || format(new Date(), "yyyy-MM-dd");
    const habits = await storage.getHabits(req.user!.id);
    const reactionData: Record<number, { counts: Record<string, number>; reactions: any[] }> = {};
    
    for (const habit of habits) {
      const reactions = await storage.getHabitReactions(habit.id, dateISO);
      const validReactions = [];
      const validCounts: Record<string, number> = {};
      
      for (const r of reactions) {
        const areBuddies = await storage.areBuddies(req.user!.id, r.buddyUserId);
        if (!areBuddies) continue;
        
        const buddy = await storage.getUser(r.buddyUserId);
        validReactions.push({ ...r, buddy });
        validCounts[r.reactionType] = (validCounts[r.reactionType] || 0) + 1;
      }
      
      reactionData[habit.id] = {
        counts: validCounts,
        reactions: validReactions,
      };
    }
    
    res.json(reactionData);
  });

  // Notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const notifications = await storage.getNotifications(req.user!.id);
    res.json(notifications);
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    const count = await storage.getUnreadNotificationCount(req.user!.id);
    res.json({ count });
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    await storage.markNotificationRead(parseInt(req.params.id));
    res.json({ success: true });
  });

  app.post("/api/notifications/read-all", requireAuth, async (req, res) => {
    await storage.markAllNotificationsRead(req.user!.id);
    res.json({ success: true });
  });

  // Notification Preferences
  app.get("/api/notification-preferences", requireAuth, async (req, res) => {
    let prefs = await storage.getNotificationPreferences(req.user!.id);
    if (!prefs) {
      prefs = await storage.createNotificationPreferences({ userId: req.user!.id });
    }
    res.json(prefs);
  });

  app.patch("/api/notification-preferences", requireAuth, async (req, res) => {
    let prefs = await storage.getNotificationPreferences(req.user!.id);
    if (!prefs) {
      prefs = await storage.createNotificationPreferences({ userId: req.user!.id, ...req.body });
    } else {
      prefs = await storage.updateNotificationPreferences(req.user!.id, req.body);
    }
    res.json(prefs);
  });

  // Chatrooms
  app.get("/api/chatrooms", requireAuth, async (req, res) => {
    const chatrooms = await storage.getChatrooms(req.user!.id);
    const chatroomsWithMembers = await Promise.all(
      chatrooms.map(async (room) => {
        const members = await storage.getChatroomMembers(room.id);
        const membersWithUsers = await Promise.all(
          members.map(async (m) => {
            const user = await storage.getUser(m.userId);
            return { ...m, user };
          })
        );
        return { ...room, members: membersWithUsers };
      })
    );
    res.json(chatroomsWithMembers);
  });

  app.post("/api/chatrooms", requireAuth, async (req, res) => {
    const { name, memberIds } = req.body;
    
    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ error: "Name and member IDs are required" });
    }
    
    for (const memberId of memberIds) {
      if (memberId !== req.user!.id) {
        const areBuddies = await storage.areBuddies(req.user!.id, memberId);
        if (!areBuddies) {
          return res.status(403).json({ error: "Can only add buddies to chatroom" });
        }
      }
    }
    
    const chatroom = await storage.createChatroom({ name, creatorId: req.user!.id });
    
    await storage.addChatroomMember({ chatroomId: chatroom.id, userId: req.user!.id, role: "admin" });
    for (const memberId of memberIds) {
      if (memberId !== req.user!.id) {
        await storage.addChatroomMember({ chatroomId: chatroom.id, userId: memberId, role: "member" });
      }
    }
    
    res.status(201).json(chatroom);
  });

  app.get("/api/chatrooms/:id", requireAuth, async (req, res) => {
    const chatroomId = parseInt(req.params.id);
    const isMember = await storage.isChatroomMember(chatroomId, req.user!.id);
    
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this chatroom" });
    }
    
    const chatroom = await storage.getChatroom(chatroomId);
    const members = await storage.getChatroomMembers(chatroomId);
    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const user = await storage.getUser(m.userId);
        return { ...m, user };
      })
    );
    
    res.json({ ...chatroom, members: membersWithUsers });
  });

  app.post("/api/chatrooms/:id/members", requireAuth, async (req, res) => {
    const chatroomId = parseInt(req.params.id);
    const { userIds } = req.body;
    
    const isAdmin = await storage.isChatroomAdmin(chatroomId, req.user!.id);
    if (!isAdmin) {
      return res.status(403).json({ error: "Only admins can add members" });
    }
    
    const chatroom = await storage.getChatroom(chatroomId);
    if (!chatroom) {
      return res.status(404).json({ error: "Chatroom not found" });
    }
    
    const idsToAdd = Array.isArray(userIds) ? userIds : [userIds];
    const addedMembers = [];
    const adder = await storage.getUser(req.user!.id);
    
    for (const userId of idsToAdd) {
      const existing = await storage.getChatroomMember(chatroomId, userId);
      if (existing) continue;
      
      const areBuddies = await storage.areBuddies(req.user!.id, userId);
      if (!areBuddies) continue;
      
      const member = await storage.addChatroomMember({ chatroomId, userId, role: "member" });
      addedMembers.push(member);
      
      const addedUser = await storage.getUser(userId);
      if (addedUser && adder) {
        await storage.createChatMessage({
          chatroomId,
          userId: req.user!.id,
          content: `${adder.displayName || adder.username} added ${addedUser.displayName || addedUser.username} to the chat`,
          isSystemMessage: true,
        });
        
        const { notifyChatMemberAdded } = await import("./notifications");
        notifyChatMemberAdded(chatroomId, req.user!.id, userId, chatroom.name).catch(console.error);
      }
    }
    
    const members = await storage.getChatroomMembers(chatroomId);
    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const user = await storage.getUser(m.userId);
        return { ...m, user };
      })
    );
    
    res.status(201).json({ addedCount: addedMembers.length, members: membersWithUsers });
  });

  app.delete("/api/chatrooms/:id/members/:userId", requireAuth, async (req, res) => {
    const chatroomId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    const chatroom = await storage.getChatroom(chatroomId);
    if (!chatroom) {
      return res.status(404).json({ error: "Chatroom not found" });
    }
    
    const isAdmin = await storage.isChatroomAdmin(chatroomId, req.user!.id);
    const isSelf = userId === req.user!.id;
    
    if (!isAdmin && !isSelf) {
      return res.status(403).json({ error: "Can only remove yourself or be an admin" });
    }
    
    const removedUser = await storage.getUser(userId);
    const remover = await storage.getUser(req.user!.id);
    
    await storage.removeChatroomMember(chatroomId, userId);
    
    if (removedUser && remover && !isSelf) {
      await storage.createChatMessage({
        chatroomId,
        userId: req.user!.id,
        content: `${remover.displayName || remover.username} removed ${removedUser.displayName || removedUser.username} from the chat`,
        isSystemMessage: true,
      });
    } else if (removedUser && isSelf) {
      await storage.createChatMessage({
        chatroomId,
        userId: req.user!.id,
        content: `${removedUser.displayName || removedUser.username} left the chat`,
        isSystemMessage: true,
      });
    }
    
    res.json({ success: true });
  });

  app.get("/api/chatrooms/:id/messages", requireAuth, async (req, res) => {
    const chatroomId = parseInt(req.params.id);
    const isMember = await storage.isChatroomMember(chatroomId, req.user!.id);
    
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this chatroom" });
    }
    
    const limit = parseInt(req.query.limit as string) || 100;
    const messages = await storage.getChatMessages(chatroomId, limit);
    
    const messagesWithUsers = await Promise.all(
      messages.map(async (m) => {
        const user = await storage.getUser(m.userId);
        return { ...m, user };
      })
    );
    
    res.json(messagesWithUsers.reverse());
  });

  app.post("/api/chatrooms/:id/messages", requireAuth, async (req, res) => {
    const chatroomId = parseInt(req.params.id);
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }
    
    const isMember = await storage.isChatroomMember(chatroomId, req.user!.id);
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this chatroom" });
    }
    
    const message = await storage.createChatMessage({
      chatroomId,
      userId: req.user!.id,
      content,
    });
    
    const { notifyChatMessage } = await import("./notifications");
    notifyChatMessage(chatroomId, req.user!.id, content).catch(console.error);
    
    const user = await storage.getUser(req.user!.id);
    res.status(201).json({ ...message, user });
  });

  app.get("/api/onboarding", requireAuth, async (req, res) => {
    let state = await storage.getOnboardingState(req.user!.id);
    if (!state) {
      state = await storage.createOnboardingState({ userId: req.user!.id });
    }
    res.json(state);
  });

  app.patch("/api/onboarding", requireAuth, async (req, res) => {
    const { stepIndex, completed, skipped, dismissedAt, completedAt } = req.body;
    const updates: any = {};
    if (stepIndex !== undefined) updates.stepIndex = stepIndex;
    if (completed !== undefined) updates.completed = completed;
    if (skipped !== undefined) updates.skipped = skipped;
    if (dismissedAt !== undefined) updates.dismissedAt = dismissedAt ? new Date(dismissedAt) : null;
    if (completedAt !== undefined) updates.completedAt = completedAt ? new Date(completedAt) : null;
    
    let state = await storage.getOnboardingState(req.user!.id);
    if (!state) {
      state = await storage.createOnboardingState({ userId: req.user!.id, ...updates });
    } else {
      state = await storage.updateOnboardingState(req.user!.id, updates);
    }
    res.json(state);
  });

  app.post("/api/onboarding/delete-defaults", requireAuth, async (req, res) => {
    await storage.deleteDefaultHabits(req.user!.id);
    res.json({ success: true });
  });

  app.post("/api/onboarding/restart", requireAuth, async (req, res) => {
    const state = await storage.updateOnboardingState(req.user!.id, {
      completed: false,
      stepIndex: 0,
      skipped: false,
      dismissedAt: null,
      completedAt: null,
    });
    res.json(state);
  });

  // Discovery routes
  app.get("/api/discover/search", requireAuth, async (req, res) => {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return res.json([]);
    }
    const users = await storage.searchPublicUsers(query, req.user!.id);
    // Return only public fields
    const publicUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
    }));
    res.json(publicUsers);
  });

  app.get("/api/discover/users", requireAuth, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const users = await storage.getPublicUsers(req.user!.id, limit);
    // Return only public fields
    const publicUsers = users.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
    }));
    res.json(publicUsers);
  });

  app.get("/api/users/:id/public-profile", requireAuth, async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user || !user.isPublic) {
      return res.status(404).json({ error: "User not found" });
    }
    const visibility = await storage.getVisibilitySettings(user.id);
    const followersCount = await storage.getFollowerCount(user.id);
    const followingCount = await storage.getFollowingCount(user.id);
    const viewerFollow = await storage.getFollow(req.user!.id, user.id);
    
    res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      followersCount,
      followingCount,
      viewerIsFollowing: !!viewerFollow,
      showFollowerList: visibility?.showFollowerList ?? true,
      showFollowingList: visibility?.showFollowingList ?? true,
    });
  });

  // Follow routes
  app.post("/api/users/:username/follow", requireAuth, async (req, res) => {
    const targetUser = await storage.getUserByUsername(req.params.username);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!targetUser.isPublic) {
      return res.status(403).json({ error: "Cannot follow non-public users" });
    }
    if (targetUser.id === req.user!.id) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }
    const isBlocked = await storage.isBlocked(targetUser.id, req.user!.id);
    if (isBlocked) {
      return res.status(403).json({ error: "Cannot follow this user" });
    }
    const existing = await storage.getFollow(req.user!.id, targetUser.id);
    if (existing) {
      return res.json({ success: true, alreadyFollowing: true });
    }
    await storage.createFollow(req.user!.id, targetUser.id);
    res.status(201).json({ success: true });
  });

  app.delete("/api/users/:username/follow", requireAuth, async (req, res) => {
    const targetUser = await storage.getUserByUsername(req.params.username);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }
    await storage.deleteFollow(req.user!.id, targetUser.id);
    res.json({ success: true });
  });

  app.get("/api/users/:id/followers", requireAuth, async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user || !user.isPublic) {
      return res.status(404).json({ error: "User not found" });
    }
    const visibility = await storage.getVisibilitySettings(userId);
    if (visibility && !visibility.showFollowerList && userId !== req.user!.id) {
      return res.status(403).json({ error: "Follower list is private" });
    }
    const followers = await storage.getFollowers(userId);
    const publicFollowers = followers.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
    }));
    res.json(publicFollowers);
  });

  app.get("/api/users/:id/following", requireAuth, async (req, res) => {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    if (!user || !user.isPublic) {
      return res.status(404).json({ error: "User not found" });
    }
    const visibility = await storage.getVisibilitySettings(userId);
    if (visibility && !visibility.showFollowingList && userId !== req.user!.id) {
      return res.status(403).json({ error: "Following list is private" });
    }
    const following = await storage.getFollowing(userId);
    const publicFollowing = following.map(u => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
    }));
    res.json(publicFollowing);
  });

  app.post("/api/users/:id/block", requireAuth, async (req, res) => {
    const blockedId = parseInt(req.params.id);
    if (blockedId === req.user!.id) {
      return res.status(400).json({ error: "Cannot block yourself" });
    }
    try {
      await storage.blockUser(req.user!.id, blockedId);
      res.json({ success: true });
    } catch (e) {
      res.json({ success: true }); // Already blocked
    }
  });

  app.delete("/api/users/:id/block", requireAuth, async (req, res) => {
    const blockedId = parseInt(req.params.id);
    await storage.unblockUser(req.user!.id, blockedId);
    res.json({ success: true });
  });

  // Projects routes
  app.get("/api/projects", requireAuth, async (req, res) => {
    const projects = await storage.getProjects(req.user!.id);
    res.json(projects);
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Check if user is owner, member, or if project is public
    const member = await storage.getProjectMember(project.id, req.user!.id);
    const isOwnerOrMember = project.ownerId === req.user!.id || (member && member.status === "active");
    const isPublic = project.visibility === "public";
    
    if (!isOwnerOrMember && !isPublic) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const members = await storage.getProjectMembers(project.id);
    const habitLinks = await storage.getProjectHabitLinks(project.id);
    const progress = await storage.getProjectProgress(project.id);
    
    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const user = await storage.getUser(m.userId);
        return { ...m, user: user ? { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl } : null };
      })
    );
    
    res.json({ 
      ...project, 
      members: membersWithUsers, 
      habitLinks, 
      progress,
      viewerIsMember: isOwnerOrMember,
      canJoin: isPublic && project.allowPublicJoin && !isOwnerOrMember,
    });
  });

  // Public projects discovery
  app.get("/api/projects/public", requireAuth, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const projects = await storage.getPublicProjects(limit);
    const projectsWithInfo = await Promise.all(
      projects.map(async (p) => {
        const owner = await storage.getUser(p.ownerId);
        const member = await storage.getProjectMember(p.id, req.user!.id);
        return {
          ...p,
          owner: owner ? { id: owner.id, username: owner.username, displayName: owner.displayName, avatarUrl: owner.avatarUrl } : null,
          viewerIsMember: !!(member && member.status === "active"),
          canJoin: p.allowPublicJoin && (!member || member.status !== "active"),
        };
      })
    );
    res.json(projectsWithInfo);
  });

  app.post("/api/projects/:id/join", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.visibility !== "public" || !project.allowPublicJoin) {
      return res.status(403).json({ error: "Project is not open for joining" });
    }
    const member = await storage.joinProject(project.id, req.user!.id);
    res.status(201).json(member);
  });

  app.post("/api/projects/:id/leave", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (project.ownerId === req.user!.id) {
      return res.status(400).json({ error: "Owner cannot leave the project" });
    }
    await storage.leaveProject(project.id, req.user!.id);
    res.json({ success: true });
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    const { name, description, visibility, allowPublicJoin, goalType, goalTarget, startDateISO, endDateISO } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    
    const project = await storage.createProject({
      ownerId: req.user!.id,
      name,
      description,
      visibility: visibility || "private",
      allowPublicJoin: allowPublicJoin || false,
      goalType: goalType || "checkins",
      goalTarget: goalTarget || 30,
      startDateISO,
      endDateISO,
    });
    
    // Add owner as member
    await storage.createProjectMember({
      projectId: project.id,
      userId: req.user!.id,
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    });
    
    res.status(201).json(project);
  });

  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project || project.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const updated = await storage.updateProject(project.id, req.body);
    res.json(updated);
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project || project.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    await storage.deleteProject(project.id);
    res.sendStatus(204);
  });

  app.post("/api/projects/:id/invite", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project || project.ownerId !== req.user!.id) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const { userIds, userId, mode = "invite" } = req.body;
    const idsToProcess = userIds || (userId ? [userId] : []);
    
    if (idsToProcess.length === 0) {
      return res.status(400).json({ error: "User ID(s) required" });
    }
    
    const addedMembers = [];
    const { notifyProjectMemberAdded } = await import("./notifications");
    
    for (const uid of idsToProcess) {
      const existing = await storage.getProjectMember(project.id, uid);
      if (existing) continue;
      
      const isDirect = mode === "direct";
      const member = await storage.createProjectMember({
        projectId: project.id,
        userId: uid,
        role: "member",
        status: isDirect ? "active" : "invited",
        joinedAt: isDirect ? new Date() : undefined,
      });
      addedMembers.push(member);
      
      notifyProjectMemberAdded(project.id, req.user!.id, uid, project.name, isDirect ? "direct" : "invite").catch(console.error);
    }
    
    const members = await storage.getProjectMembers(project.id);
    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const user = await storage.getUser(m.userId);
        return { ...m, user };
      })
    );
    
    res.status(201).json({ addedCount: addedMembers.length, members: membersWithUsers });
  });

  app.get("/api/project-invites", requireAuth, async (req, res) => {
    const invites = await storage.getProjectInvites(req.user!.id);
    const invitesWithProjects = await Promise.all(
      invites.map(async (invite) => {
        const project = await storage.getProject(invite.projectId);
        const owner = project ? await storage.getUser(project.ownerId) : null;
        return { 
          ...invite, 
          project,
          owner: owner ? { id: owner.id, username: owner.username, displayName: owner.displayName, avatarUrl: owner.avatarUrl } : null
        };
      })
    );
    res.json(invitesWithProjects);
  });

  app.post("/api/project-invites/:id/accept", requireAuth, async (req, res) => {
    const invite = await storage.getProjectMember(parseInt(req.params.id), req.user!.id);
    if (!invite || invite.userId !== req.user!.id || invite.status !== "invited") {
      return res.status(404).json({ error: "Invite not found" });
    }
    
    const updated = await storage.updateProjectMember(invite.id, {
      status: "active",
      joinedAt: new Date(),
    });
    
    const project = await storage.getProject(invite.projectId);
    if (project) {
      const { notifyProjectJoined } = await import("./notifications");
      notifyProjectJoined(project.id, req.user!.id, project.ownerId, project.name).catch(console.error);
    }
    
    res.json(updated);
  });

  app.post("/api/project-invites/:id/decline", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const invite = await storage.getProjectMember(projectId, req.user!.id);
    if (!invite || invite.userId !== req.user!.id || invite.status !== "invited") {
      return res.status(404).json({ error: "Invite not found" });
    }
    
    await storage.deleteProjectMember(projectId, req.user!.id);
    res.json({ success: true });
  });

  app.get("/api/projects/:id/members", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const members = await storage.getProjectMembers(project.id);
    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const user = await storage.getUser(m.userId);
        return { ...m, user };
      })
    );
    
    res.json(membersWithUsers);
  });

  app.delete("/api/projects/:id/members/:userId", requireAuth, async (req, res) => {
    const projectId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    
    const project = await storage.getProject(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const isOwner = project.ownerId === req.user!.id;
    const isSelf = userId === req.user!.id;
    
    if (!isOwner && !isSelf) {
      return res.status(403).json({ error: "Can only remove yourself or be the owner" });
    }
    
    if (isOwner && isSelf) {
      return res.status(400).json({ error: "Owner cannot leave the project" });
    }
    
    await storage.deleteProjectMember(projectId, userId);
    res.json({ success: true });
  });

  app.post("/api/projects/:id/habits", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const member = await storage.getProjectMember(project.id, req.user!.id);
    if (!member || member.status !== "active") {
      return res.status(403).json({ error: "Not a member of this project" });
    }
    
    const { habitId, contributionWeight } = req.body;
    if (!habitId) {
      return res.status(400).json({ error: "Habit ID is required" });
    }
    
    const habit = await storage.getHabit(habitId);
    if (!habit || habit.userId !== req.user!.id) {
      return res.status(404).json({ error: "Habit not found" });
    }
    
    const link = await storage.createProjectHabitLink({
      projectId: project.id,
      habitId,
      userId: req.user!.id,
      contributionWeight: contributionWeight || 1,
    });
    
    res.status(201).json(link);
  });

  app.delete("/api/projects/:id/habits/:habitId", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    await storage.deleteProjectHabitLink(project.id, parseInt(req.params.habitId));
    res.sendStatus(204);
  });

  app.get("/api/projects/:id/contributions", requireAuth, async (req, res) => {
    const project = await storage.getProject(parseInt(req.params.id));
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const member = await storage.getProjectMember(project.id, req.user!.id);
    if (project.ownerId !== req.user!.id && (!member || member.status !== "active")) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const contributions = await storage.getProjectContributions(project.id);
    res.json(contributions);
  });

  // Heartbeat endpoint for tracking user activity
  app.post("/api/me/heartbeat", requireAuth, async (req, res) => {
    await storage.updateLastSeen(req.user!.id);
    res.json({ ok: true });
  });

  // SSE endpoint for real-time notifications
  app.get("/api/notifications/stream", requireAuth, (req, res) => {
    const userId = req.user!.id;
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    
    res.write(`event: connected\ndata: ${JSON.stringify({ userId })}\n\n`);
    
    const { addSSEClient, removeSSEClient } = require("./notifications");
    addSSEClient(userId, res);
    
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`event: heartbeat\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`);
      } catch (err) {
        clearInterval(heartbeatInterval);
        removeSSEClient(userId, res);
      }
    }, 30000);
    
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      removeSSEClient(userId, res);
    });
  });

  // Get notifications with pagination
  app.get("/api/notifications", requireAuth, async (req, res) => {
    const notifications = await storage.getNotifications(req.user!.id);
    res.json(notifications);
  });

  // Get unread notification count
  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    const count = await storage.getUnreadNotificationCount(req.user!.id);
    res.json({ count });
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", requireAuth, async (req, res) => {
    const notificationId = parseInt(req.params.id);
    const notification = await storage.getNotification(notificationId);
    
    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ error: "Notification not found" });
    }
    
    await storage.markNotificationRead(notificationId);
    res.json({ ok: true });
  });

  // Mark all notifications as read
  app.post("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    await storage.markAllNotificationsRead(req.user!.id);
    res.json({ ok: true });
  });

  // Get notification preferences
  app.get("/api/notification-preferences", requireAuth, async (req, res) => {
    let prefs = await storage.getNotificationPreferences(req.user!.id);
    if (!prefs) {
      prefs = await storage.createNotificationPreferences({
        userId: req.user!.id,
        emailEnabled: true,
        inAppEnabled: true,
      });
    }
    res.json(prefs);
  });

  // Update notification preferences
  app.patch("/api/notification-preferences", requireAuth, async (req, res) => {
    let prefs = await storage.getNotificationPreferences(req.user!.id);
    if (!prefs) {
      prefs = await storage.createNotificationPreferences({
        userId: req.user!.id,
        ...req.body,
      });
    } else {
      prefs = await storage.updateNotificationPreferences(req.user!.id, req.body);
    }
    res.json(prefs);
  });

  return httpServer;
}
