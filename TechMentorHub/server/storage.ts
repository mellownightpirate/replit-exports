import { 
  users, type User, type InsertUser,
  quizSubmissions, type QuizSubmission, type InsertQuizSubmission,
  waitlistUsers, type WaitlistUser, type InsertWaitlistUser,
  pageViews, type PageView, type InsertPageView,
  events, type Event, type InsertEvent,
  conversions, type Conversion, type InsertConversion
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Existing operations
  createQuizSubmission(submission: InsertQuizSubmission & { score: number, result: string }): Promise<QuizSubmission>;
  addToWaitlist(user: InsertWaitlistUser): Promise<WaitlistUser>;
  
  // Analytics operations
  trackPageView(pageView: InsertPageView): Promise<PageView>;
  trackEvent(event: InsertEvent): Promise<Event>;
  trackConversion(conversion: InsertConversion): Promise<Conversion>;
  
  // Analytics reporting
  getPageViews(filter?: {path?: string, startDate?: Date, endDate?: Date}): Promise<PageView[]>;
  getEvents(filter?: {eventType?: string, eventCategory?: string, startDate?: Date, endDate?: Date}): Promise<Event[]>;
  getConversions(filter?: {conversionType?: string, startDate?: Date, endDate?: Date}): Promise<Conversion[]>;
  getConversionRate(conversionType: string, startDate?: Date, endDate?: Date): Promise<{rate: number, total: number, converted: number}>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizSubmissions: Map<number, QuizSubmission>;
  private waitlistUsers: Map<number, WaitlistUser>;
  private pageViews: Map<number, PageView>;
  private events: Map<number, Event>;
  private conversions: Map<number, Conversion>;
  
  currentId: number;
  quizSubmissionId: number;
  waitlistUserId: number;
  pageViewId: number;
  eventId: number;
  conversionId: number;

  constructor() {
    this.users = new Map();
    this.quizSubmissions = new Map();
    this.waitlistUsers = new Map();
    this.pageViews = new Map();
    this.events = new Map();
    this.conversions = new Map();
    
    this.currentId = 1;
    this.quizSubmissionId = 1;
    this.waitlistUserId = 1;
    this.pageViewId = 1;
    this.eventId = 1;
    this.conversionId = 1;
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

  async createQuizSubmission(submission: InsertQuizSubmission & { score: number, result: string }): Promise<QuizSubmission> {
    const id = this.quizSubmissionId++;
    
    // Ensure we have properly typed values for all properties
    const quizSubmission: QuizSubmission = {
      id,
      createdAt: submission.createdAt,
      email: submission.email || null,
      q1: submission.q1 || null,
      q2: submission.q2 || null,
      q3: submission.q3 || null,
      q4: submission.q4 || null,
      q5: submission.q5 || null,
      score: submission.score,
      result: submission.result
    };
    
    this.quizSubmissions.set(id, quizSubmission);
    return quizSubmission;
  }

  async addToWaitlist(user: InsertWaitlistUser): Promise<WaitlistUser> {
    const id = this.waitlistUserId++;
    const waitlistUser: WaitlistUser = { ...user, id };
    this.waitlistUsers.set(id, waitlistUser);
    return waitlistUser;
  }
  
  // Analytics methods implementation
  async trackPageView(pageView: InsertPageView): Promise<PageView> {
    const id = this.pageViewId++;
    const createdAt = new Date();
    
    // Ensure proper null values instead of undefined
    const newPageView: PageView = { 
      id, 
      createdAt,
      path: pageView.path,
      referrer: pageView.referrer || null,
      userAgent: pageView.userAgent || null,
      sessionId: pageView.sessionId || null
    };
    
    this.pageViews.set(id, newPageView);
    return newPageView;
  }
  
  async trackEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const createdAt = new Date();
    
    // Ensure proper null values instead of undefined
    const newEvent: Event = {
      id,
      createdAt,
      eventType: event.eventType,
      eventCategory: event.eventCategory,
      eventAction: event.eventAction,
      eventLabel: event.eventLabel || null,
      eventValue: event.eventValue || null,
      path: event.path || null,
      sessionId: event.sessionId || null
    };
    
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async trackConversion(conversion: InsertConversion): Promise<Conversion> {
    const id = this.conversionId++;
    const createdAt = new Date();
    
    // Ensure proper null values instead of undefined
    const newConversion: Conversion = {
      id,
      createdAt,
      conversionType: conversion.conversionType,
      email: conversion.email || null,
      planId: conversion.planId || null,
      planName: conversion.planName || null,
      planPrice: conversion.planPrice || null,
      sessionId: conversion.sessionId || null,
      completed: conversion.completed !== undefined ? conversion.completed : false
    };
    
    this.conversions.set(id, newConversion);
    return newConversion;
  }
  
  async getPageViews(filter?: {path?: string, startDate?: Date, endDate?: Date}): Promise<PageView[]> {
    let views = Array.from(this.pageViews.values());
    
    if (filter) {
      if (filter.path) {
        views = views.filter(view => view.path === filter.path);
      }
      
      if (filter.startDate) {
        views = views.filter(view => view.createdAt >= filter.startDate);
      }
      
      if (filter.endDate) {
        views = views.filter(view => view.createdAt <= filter.endDate);
      }
    }
    
    return views;
  }
  
  async getEvents(filter?: {eventType?: string, eventCategory?: string, startDate?: Date, endDate?: Date}): Promise<Event[]> {
    let allEvents = Array.from(this.events.values());
    
    if (filter) {
      if (filter.eventType) {
        allEvents = allEvents.filter(event => event.eventType === filter.eventType);
      }
      
      if (filter.eventCategory) {
        allEvents = allEvents.filter(event => event.eventCategory === filter.eventCategory);
      }
      
      if (filter.startDate) {
        allEvents = allEvents.filter(event => event.createdAt >= filter.startDate);
      }
      
      if (filter.endDate) {
        allEvents = allEvents.filter(event => event.createdAt <= filter.endDate);
      }
    }
    
    return allEvents;
  }
  
  async getConversions(filter?: {conversionType?: string, startDate?: Date, endDate?: Date}): Promise<Conversion[]> {
    let allConversions = Array.from(this.conversions.values());
    
    if (filter) {
      if (filter.conversionType) {
        allConversions = allConversions.filter(conv => conv.conversionType === filter.conversionType);
      }
      
      if (filter.startDate) {
        allConversions = allConversions.filter(conv => conv.createdAt >= filter.startDate);
      }
      
      if (filter.endDate) {
        allConversions = allConversions.filter(conv => conv.createdAt <= filter.endDate);
      }
    }
    
    return allConversions;
  }
  
  async getConversionRate(conversionType: string, startDate?: Date, endDate?: Date): Promise<{rate: number, total: number, converted: number}> {
    const conversions = await this.getConversions({
      conversionType,
      startDate,
      endDate
    });
    
    const total = conversions.length;
    const converted = conversions.filter(conv => conv.completed).length;
    const rate = total > 0 ? (converted / total) * 100 : 0;
    
    return {
      rate,
      total,
      converted
    };
  }
}

export const storage = new MemStorage();
