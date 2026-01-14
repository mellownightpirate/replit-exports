import { ContentItem, Event, Testimonial, FaqItem } from "./types";

export const contentItems: ContentItem[] = [
  {
    title: "Building Modern Data Pipelines with Python",
    description: "Learn how to design scalable data pipelines using Python and cloud services.",
    thumbnailUrl: "https://images.unsplash.com/photo-1599658880436-c61792e70672?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=example1",
    platform: "youtube",
    views: "2.5K",
    publishedDate: "2 weeks ago",
    topics: ["data-analytics", "data-integration"]
  },
  {
    title: "Introduction to Machine Learning Models for Beginners",
    description: "An overview of popular ML models and when to use each one.",
    thumbnailUrl: "https://images.unsplash.com/photo-1526378800651-c32d170fe6f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.linkedin.com/video/example2",
    platform: "linkedin",
    views: "1.8K",
    publishedDate: "1 month ago",
    topics: ["ai-ml"]
  },
  {
    title: "5 Tech Sales Strategies That Actually Work",
    description: "Practical advice for technical sales professionals to improve conversion.",
    thumbnailUrl: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.tiktok.com/@example/video/example3",
    platform: "tiktok",
    views: "5.2K",
    publishedDate: "3 days ago",
    topics: ["tech-sales", "solutions-engineering"]
  },
  {
    title: "Data Integration Patterns for Enterprise Applications",
    description: "Explore proven patterns for integrating data across complex enterprise systems.",
    thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.youtube.com/watch?v=example4",
    platform: "youtube",
    views: "1.7K",
    publishedDate: "1 month ago",
    topics: ["data-integration", "solutions-engineering"]
  },
  {
    title: "AI/ML Project Management Best Practices",
    description: "How to effectively manage AI/ML projects from proof of concept to production.",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.linkedin.com/video/example5",
    platform: "linkedin",
    views: "3.4K",
    publishedDate: "3 weeks ago",
    topics: ["ai-ml", "solutions-engineering"]
  },
  {
    title: "Quick Data Visualization Tips in Python",
    description: "Learn how to create impactful data visualizations with these quick tips.",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    videoUrl: "https://www.tiktok.com/@example/video/example6",
    platform: "tiktok",
    views: "7.1K",
    publishedDate: "5 days ago",
    topics: ["data-analytics"]
  }
];

export const events: Event[] = [
  {
    day: "15",
    month: "Jun",
    title: "Data Analytics Meetup: Visualization Best Practices",
    description: "Learn how to create impactful data visualizations that drive decision-making.",
    time: "6:00 PM - 8:00 PM",
    location: "TechHub Co-working Space, Downtown",
    isOnline: false,
    actionLink: "https://example.com/rsvp1",
    actionText: "RSVP Now"
  },
  {
    day: "23",
    month: "Jun",
    title: "AI Solutions Engineering Workshop",
    description: "Hands-on workshop on implementing and scaling AI solutions for enterprise applications.",
    time: "10:00 AM - 4:00 PM",
    location: "Innovation Center, Tech District",
    isOnline: false,
    actionLink: "https://example.com/rsvp2",
    actionText: "RSVP Now"
  },
  {
    day: "07",
    month: "Jul",
    title: "LinkedIn Live: Data Integration Challenges",
    description: "Join me for a LinkedIn Live session where we'll discuss common data integration challenges and solutions.",
    time: "12:00 PM - 1:00 PM",
    location: "Online - LinkedIn",
    isOnline: true,
    actionLink: "https://linkedin.com/live/reminder",
    actionText: "Set Reminder"
  }
];

export const testimonials: Testimonial[] = [
  {
    quote: "John's data analytics course completely transformed how I approach business intelligence at my company. The practical exercises were invaluable.",
    name: "Sarah Johnson",
    title: "Data Analyst",
    company: "TechCorp",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "The AI/ML meetups organized by John provided me with both technical knowledge and invaluable networking opportunities that led directly to my current role.",
    name: "Michael Chen",
    title: "ML Engineer",
    company: "AI Innovations",
    imageUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  },
  {
    quote: "As someone transitioning to tech sales, John's content on solutions engineering gave me the confidence to speak technically with clients and close more deals.",
    name: "Rebecca Martinez",
    title: "Solutions Consultant",
    company: "DataFlow",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
  }
];

export const faqItems: FaqItem[] = [
  {
    question: "What topics do you cover?",
    answer: "I primarily focus on Data Analytics, Data Integration, AI/ML, Tech Sales, and Solutions Engineering. My content is designed for both beginners and experienced professionals looking to enhance their skills."
  },
  {
    question: "How can I join your meetups?",
    answer: "You can join my meetups by RSVP'ing through the Events section on this website. I also announce upcoming events on my LinkedIn and through my email newsletter. Most events are free and open to all skill levels."
  },
  {
    question: "Do you mentor people one-on-one?",
    answer: "Yes, I offer limited one-on-one mentoring sessions. Due to high demand, I currently prioritize individuals who are actively engaged in the community and demonstrate a clear commitment to growth. Contact me directly to discuss mentoring opportunities."
  },
  {
    question: "How often do you release new content?",
    answer: "I aim to release new YouTube videos bi-weekly, with shorter content on LinkedIn and TikTok more frequently. I also host at least one live Q&A session per month. The best way to stay updated is by subscribing to my email newsletter."
  }
];
