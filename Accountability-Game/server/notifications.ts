import { storage } from "./storage";
import { sendEmail } from "./email";
import type { InsertNotification, Notification } from "@shared/schema";
import { Response } from "express";

const sseClients = new Map<number, Set<Response>>();

export function addSSEClient(userId: number, res: Response): void {
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId)!.add(res);
}

export function removeSSEClient(userId: number, res: Response): void {
  const clients = sseClients.get(userId);
  if (clients) {
    clients.delete(res);
    if (clients.size === 0) {
      sseClients.delete(userId);
    }
  }
}

export function broadcastToUser(userId: number, event: string, data: any): void {
  const clients = sseClients.get(userId);
  if (clients) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    clients.forEach((res) => {
      try {
        res.write(message);
      } catch (err) {
        removeSSEClient(userId, res);
      }
    });
  }
}

export async function createAndSendNotification(
  notification: InsertNotification,
  recipientEmail?: string
): Promise<Notification> {
  const notificationWithBody = {
    ...notification,
    body: notification.body || notification.message || '',
  };
  
  const createdNotification = await storage.createNotification(notificationWithBody);
  
  broadcastToUser(notification.userId, 'notification', createdNotification);
  
  const unreadCount = await storage.getUnreadNotificationCount(notification.userId);
  broadcastToUser(notification.userId, 'unreadCount', { count: unreadCount });
  
  const prefs = await storage.getNotificationPreferences(notification.userId);
  
  const isUserOnline = await storage.isUserOnline(notification.userId);
  const shouldEmail = prefs?.emailEnabled !== false && recipientEmail && !isUserOnline;
  
  if (shouldEmail && recipientEmail) {
    const dedupeKey = generateDedupeKey(notification);
    
    const existing = await storage.getEmailQueueItemByDedupeKey(dedupeKey);
    if (!existing) {
      await storage.createEmailQueueItem({
        userId: notification.userId,
        notificationId: createdNotification.id,
        toEmail: recipientEmail,
        subject: notification.title,
        htmlBody: generateEmailHtml(notification),
        textBody: notification.body || notification.message || '',
        dedupeKey,
        status: "QUEUED",
      });
    }
  }
  
  return createdNotification;
}

function generateDedupeKey(notification: InsertNotification): string {
  const tenMinBucket = Math.floor(Date.now() / (10 * 60 * 1000));
  if (notification.entityType && notification.entityId) {
    return `EMAIL:${notification.type}:${notification.entityType}:${notification.entityId}:${notification.userId}:${tenMinBucket}`;
  }
  return `EMAIL:${notification.type}:${notification.userId}:${tenMinBucket}`;
}

function generateEmailHtml(notification: InsertNotification): string {
  const appUrl = process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.replit.app` : 'http://localhost:5000';
  
  let actionUrl = appUrl;
  if (notification.entityType === 'chat') {
    actionUrl = `${appUrl}/chat/${notification.entityId}`;
  } else if (notification.entityType === 'project') {
    actionUrl = `${appUrl}/projects/${notification.entityId}`;
  } else if (notification.entityType === 'buddy') {
    actionUrl = `${appUrl}/buddies`;
  }
  
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; margin-bottom: 16px;">${notification.title}</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
        ${notification.body || notification.message || ''}
      </p>
      <a href="${actionUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
        Open in App
      </a>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
      <p style="color: #9ca3af; font-size: 12px;">
        You're receiving this because you have email notifications enabled in Anchors.
      </p>
    </div>
  `;
}

export async function notifyBuddiesOfNewTask(
  userId: number,
  taskTitle: string
): Promise<void> {
  const user = await storage.getUser(userId);
  if (!user) return;
  
  const buddyConnections = await storage.getBuddyConnections(userId);
  const acceptedConnections = buddyConnections.filter(c => c.status === "accepted");
  
  for (const conn of acceptedConnections) {
    const buddyId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
    const buddy = await storage.getUser(buddyId);
    if (!buddy) continue;
    
    const prefs = await storage.getNotificationPreferences(buddyId);
    if (prefs?.buddyTaskCreated === false) continue;
    
    await createAndSendNotification({
      userId: buddyId,
      type: "task_created",
      title: "New Task from Buddy",
      body: `${user.displayName || user.username} created a new task: "${taskTitle}"`,
      message: `${user.displayName || user.username} created a new task: "${taskTitle}"`,
      relatedUserId: userId,
      isRead: false,
      emailSent: false,
    }, buddy.email || undefined);
  }
}

export async function notifyBuddiesOfMilestone(
  userId: number,
  habitName: string,
  milestone: string
): Promise<void> {
  const user = await storage.getUser(userId);
  if (!user) return;
  
  const buddyConnections = await storage.getBuddyConnections(userId);
  const acceptedConnections = buddyConnections.filter(c => c.status === "accepted");
  
  for (const conn of acceptedConnections) {
    const buddyId = conn.requesterId === userId ? conn.receiverId : conn.requesterId;
    const buddy = await storage.getUser(buddyId);
    if (!buddy) continue;
    
    const prefs = await storage.getNotificationPreferences(buddyId);
    if (prefs?.buddyHabitMilestone === false) continue;
    
    await createAndSendNotification({
      userId: buddyId,
      type: "habit_milestone",
      title: "Buddy Milestone!",
      body: `${user.displayName || user.username} reached ${milestone} for "${habitName}"`,
      message: `${user.displayName || user.username} reached ${milestone} for "${habitName}"`,
      relatedUserId: userId,
      isRead: false,
      emailSent: false,
    }, buddy.email || undefined);
  }
}

export async function notifyBuddyRequest(
  requesterId: number,
  receiverId: number
): Promise<void> {
  const requester = await storage.getUser(requesterId);
  const receiver = await storage.getUser(receiverId);
  if (!requester || !receiver) return;
  
  const prefs = await storage.getNotificationPreferences(receiverId);
  if (prefs?.buddyRequest === false) return;
  
  await createAndSendNotification({
    userId: receiverId,
    type: "BUDDY_INVITED",
    title: "New Buddy Request",
    body: `${requester.displayName || requester.username} wants to connect as accountability buddies`,
    message: `${requester.displayName || requester.username} wants to connect as accountability buddies`,
    entityType: "buddy",
    entityId: requesterId,
    relatedUserId: requesterId,
    isRead: false,
    emailSent: false,
  }, receiver.email || undefined);
}

export async function notifyBuddyAccepted(
  accepterId: number,
  requesterId: number
): Promise<void> {
  const accepter = await storage.getUser(accepterId);
  const requester = await storage.getUser(requesterId);
  if (!accepter || !requester) return;
  
  await createAndSendNotification({
    userId: requesterId,
    type: "BUDDY_ACCEPTED",
    title: "Buddy Request Accepted!",
    body: `${accepter.displayName || accepter.username} accepted your buddy request`,
    message: `${accepter.displayName || accepter.username} accepted your buddy request`,
    entityType: "buddy",
    entityId: accepterId,
    relatedUserId: accepterId,
    isRead: false,
    emailSent: false,
  }, requester.email || undefined);
}

export async function notifyChatMessage(
  chatroomId: number,
  senderId: number,
  messageContent: string
): Promise<void> {
  const sender = await storage.getUser(senderId);
  if (!sender) return;
  
  const members = await storage.getChatroomMembers(chatroomId);
  const chatroom = await storage.getChatroom(chatroomId);
  
  for (const member of members) {
    if (member.userId === senderId) continue;
    
    const prefs = await storage.getNotificationPreferences(member.userId);
    if (prefs?.chatMessages === false) continue;
    
    const user = await storage.getUser(member.userId);
    const preview = messageContent.substring(0, 100) + (messageContent.length > 100 ? "..." : "");
    
    await createAndSendNotification({
      userId: member.userId,
      type: "MESSAGE_RECEIVED",
      title: `New message from ${sender.displayName || sender.username}`,
      body: preview,
      message: `${sender.displayName || sender.username}: ${preview}`,
      entityType: "chat",
      entityId: chatroomId,
      relatedUserId: senderId,
      isRead: false,
      emailSent: false,
    }, user?.email || undefined);
  }
}

export async function notifyProjectInvite(
  projectId: number,
  inviterId: number,
  inviteeId: number,
  projectName: string
): Promise<void> {
  const inviter = await storage.getUser(inviterId);
  const invitee = await storage.getUser(inviteeId);
  if (!inviter || !invitee) return;
  
  const prefs = await storage.getNotificationPreferences(inviteeId);
  
  await createAndSendNotification({
    userId: inviteeId,
    type: "PROJECT_INVITED",
    title: "Project Invitation",
    body: `${inviter.displayName || inviter.username} invited you to join "${projectName}"`,
    message: `${inviter.displayName || inviter.username} invited you to join "${projectName}"`,
    entityType: "project",
    entityId: projectId,
    relatedUserId: inviterId,
    isRead: false,
    emailSent: false,
  }, prefs?.emailProjectInvites !== false ? invitee.email || undefined : undefined);
}

export async function notifyProjectJoined(
  projectId: number,
  joinerId: number,
  projectOwnerId: number,
  projectName: string
): Promise<void> {
  const joiner = await storage.getUser(joinerId);
  const owner = await storage.getUser(projectOwnerId);
  if (!joiner || !owner) return;
  
  await createAndSendNotification({
    userId: projectOwnerId,
    type: "PROJECT_JOINED",
    title: "New Project Member",
    body: `${joiner.displayName || joiner.username} joined your project "${projectName}"`,
    message: `${joiner.displayName || joiner.username} joined your project "${projectName}"`,
    entityType: "project",
    entityId: projectId,
    relatedUserId: joinerId,
    isRead: false,
    emailSent: false,
  }, owner.email || undefined);
}

export async function notifyAnchorSeen(
  habitId: number,
  habitName: string,
  habitOwnerId: number,
  viewerUserId: number
): Promise<void> {
  const viewer = await storage.getUser(viewerUserId);
  const owner = await storage.getUser(habitOwnerId);
  if (!viewer || !owner) return;
  
  await createAndSendNotification({
    userId: habitOwnerId,
    type: "ANCHOR_SEEN",
    title: "Anchor Seen",
    body: `${viewer.displayName || viewer.username} saw your "${habitName}" completion`,
    message: `${viewer.displayName || viewer.username} saw your "${habitName}" completion`,
    entityType: "anchorLog",
    entityId: habitId,
    relatedUserId: viewerUserId,
    isRead: false,
    emailSent: false,
  });
}

export async function notifyReaction(
  habitId: number,
  habitName: string,
  habitOwnerId: number,
  reactorId: number,
  reactionType: string
): Promise<void> {
  const reactor = await storage.getUser(reactorId);
  const owner = await storage.getUser(habitOwnerId);
  if (!reactor || !owner) return;
  
  await createAndSendNotification({
    userId: habitOwnerId,
    type: "REACTION",
    title: "New Reaction",
    body: `${reactor.displayName || reactor.username} reacted to your "${habitName}" with ${reactionType}`,
    message: `${reactor.displayName || reactor.username} reacted to your "${habitName}" with ${reactionType}`,
    entityType: "anchorLog",
    entityId: habitId,
    relatedUserId: reactorId,
    isRead: false,
    emailSent: false,
  });
}

export async function notifyChatMemberAdded(
  chatroomId: number,
  adderId: number,
  addedUserId: number,
  chatroomName: string
): Promise<void> {
  const adder = await storage.getUser(adderId);
  const addedUser = await storage.getUser(addedUserId);
  if (!adder || !addedUser) return;
  
  await createAndSendNotification({
    userId: addedUserId,
    type: "CHAT_MEMBER_ADDED",
    title: "Added to Chat",
    body: `${adder.displayName || adder.username} added you to "${chatroomName}"`,
    message: `${adder.displayName || adder.username} added you to "${chatroomName}"`,
    entityType: "chat",
    entityId: chatroomId,
    relatedUserId: adderId,
    isRead: false,
    emailSent: false,
  }, addedUser.email || undefined);
}

export async function notifyProjectMemberAdded(
  projectId: number,
  adderId: number,
  addedUserId: number,
  projectName: string,
  mode: "invite" | "direct"
): Promise<void> {
  const adder = await storage.getUser(adderId);
  const addedUser = await storage.getUser(addedUserId);
  if (!adder || !addedUser) return;
  
  const title = mode === "invite" ? "Project Invitation" : "Added to Project";
  const body = mode === "invite" 
    ? `${adder.displayName || adder.username} invited you to join "${projectName}"`
    : `${adder.displayName || adder.username} added you to "${projectName}"`;
  
  await createAndSendNotification({
    userId: addedUserId,
    type: mode === "invite" ? "PROJECT_INVITE" : "PROJECT_MEMBER_ADDED",
    title,
    body,
    message: body,
    entityType: "project",
    entityId: projectId,
    relatedUserId: adderId,
    isRead: false,
    emailSent: false,
  }, addedUser.email || undefined);
}

export async function checkHabitMilestones(userId: number, habitId: number): Promise<void> {
  const habit = await storage.getHabit(habitId);
  if (!habit) return;
  
  const logs = await storage.getHabitLogs(userId);
  const habitLogs = logs.filter(l => l.habitId === habitId && l.done);
  const streakCount = habitLogs.length;
  
  const milestones = [7, 14, 21, 30, 60, 90, 100, 365];
  if (milestones.includes(streakCount)) {
    await notifyBuddiesOfMilestone(userId, habit.name, `${streakCount} day streak`);
  }
}
