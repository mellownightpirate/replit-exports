import { users, type User, type InsertUser, type Subscriber, type InsertSubscriber, type Participant, type InsertParticipant } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Subscriber methods
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  createSubscriber(subscriber: InsertSubscriber & { createdAt: string }): Promise<Subscriber>;
  
  // Participant methods
  getParticipantByEmail(email: string): Promise<Participant | undefined>;
  createParticipant(participant: InsertParticipant & { createdAt: string }): Promise<Participant>;
  getAllParticipants(): Promise<Participant[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subscribers: Map<number, Subscriber>;
  private participants: Map<number, Participant>;
  currentId: number;
  subscriberId: number;
  participantId: number;

  constructor() {
    this.users = new Map();
    this.subscribers = new Map();
    this.participants = new Map();
    this.currentId = 1;
    this.subscriberId = 1;
    this.participantId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email === email,
    );
  }
  
  async createSubscriber(insertSubscriber: InsertSubscriber & { createdAt: string }): Promise<Subscriber> {
    const id = this.subscriberId++;
    const subscriber: Subscriber = { ...insertSubscriber, id };
    this.subscribers.set(id, subscriber);
    return subscriber;
  }
  
  async getParticipantByEmail(email: string): Promise<Participant | undefined> {
    return Array.from(this.participants.values()).find(
      (participant) => participant.email === email,
    );
  }
  
  async createParticipant(insertParticipant: InsertParticipant & { createdAt: string }): Promise<Participant> {
    const id = this.participantId++;
    // Ensure null values for optional fields
    const participant: Participant = { 
      ...insertParticipant, 
      id,
      name: insertParticipant.name || null,
      otherInterest: insertParticipant.otherInterest || null,
      message: insertParticipant.message || null
    };
    this.participants.set(id, participant);
    return participant;
  }
  
  async getAllParticipants(): Promise<Participant[]> {
    return Array.from(this.participants.values());
  }
}

export const storage = new MemStorage();
