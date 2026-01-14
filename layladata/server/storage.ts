import { type User, type InsertUser, type Invitation, type InsertInvitation } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Invitation methods
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getAllInvitations(): Promise<Invitation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private invitations: Map<string, Invitation>;

  constructor() {
    this.users = new Map();
    this.invitations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Invitation storage methods
  async createInvitation(insertInvitation: InsertInvitation): Promise<Invitation> {
    const id = randomUUID();
    const invitation: Invitation = {
      ...insertInvitation,
      id,
      submittedAt: new Date(),
    };
    this.invitations.set(id, invitation);
    console.log(`[Storage] New invitation saved: ${invitation.name} (${invitation.email})`);
    return invitation;
  }

  async getAllInvitations(): Promise<Invitation[]> {
    return Array.from(this.invitations.values()).sort(
      (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()
    );
  }
}

export const storage = new MemStorage();
