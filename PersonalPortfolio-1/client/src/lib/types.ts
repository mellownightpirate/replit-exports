export type Platform = "youtube" | "linkedin" | "tiktok";
export type Topic = "data-analytics" | "ai-ml" | "tech-sales" | "data-integration" | "solutions-engineering";

export interface ContentItem {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  platform: Platform;
  views: string;
  publishedDate: string;
  topics: Topic[];
}

export interface Event {
  day: string;
  month: string;
  title: string;
  description: string;
  time: string;
  location: string;
  isOnline: boolean;
  actionLink: string;
  actionText: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  imageUrl: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface EmailSignup {
  email: string;
}
