/**
 * Analytics Database - SQLite storage for first-party analytics
 * 
 * Stores:
 * - Page views: URL, timestamp, referrer, user agent, session ID
 * - Click events: element clicked, URL, timestamp, session ID
 * - Heartbeat events: time on page tracking
 */

import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const db = new Database('analytics.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    url TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    element_id TEXT,
    element_text TEXT,
    timestamp INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
  CREATE INDEX IF NOT EXISTS idx_events_url ON events(url);
  CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
`);

export interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: 'page_view' | 'click' | 'heartbeat';
  url: string;
  referrer?: string;
  user_agent?: string;
  element_id?: string;
  element_text?: string;
  timestamp: number;
}

export interface AnalyticsStats {
  totalViews: number;
  uniqueSessions: number;
  topPages: Array<{ url: string; views: number }>;
  topReferrers: Array<{ referrer_domain: string; views: number }>;
  recentEvents: AnalyticsEvent[];
  viewsLast24h: number;
  viewsLast7d: number;
}

/**
 * Extract domain from referrer URL
 * Returns normalized domain (e.g., "linkedin.com", "twitter.com") or "Direct"
 */
export function normalizeReferrer(referrer: string | null | undefined): string {
  if (!referrer || referrer.trim() === '') {
    return 'Direct';
  }
  
  try {
    const url = new URL(referrer);
    let hostname = url.hostname;
    
    // Remove 'www.' prefix for cleaner display
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    return hostname;
  } catch {
    // If URL parsing fails, return "Direct"
    return 'Direct';
  }
}

/**
 * Insert a new analytics event
 */
export function insertEvent(event: Omit<AnalyticsEvent, 'id'>): void {
  const id = randomUUID();
  const stmt = db.prepare(`
    INSERT INTO events (id, session_id, event_type, url, referrer, user_agent, element_id, element_text, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    event.session_id,
    event.event_type,
    event.url,
    event.referrer || null,
    event.user_agent || null,
    event.element_id || null,
    event.element_text || null,
    event.timestamp
  );
}

/**
 * Get analytics statistics
 */
export function getStats(): AnalyticsStats {
  const now = Date.now();
  const last24h = now - (24 * 60 * 60 * 1000);
  const last7d = now - (7 * 24 * 60 * 60 * 1000);
  
  // Total page views
  const totalViews = db.prepare(`
    SELECT COUNT(*) as count FROM events WHERE event_type = 'page_view'
  `).get() as { count: number };
  
  // Unique sessions
  const uniqueSessions = db.prepare(`
    SELECT COUNT(DISTINCT session_id) as count FROM events
  `).get() as { count: number };
  
  // Top pages by views
  const topPages = db.prepare(`
    SELECT url, COUNT(*) as views
    FROM events
    WHERE event_type = 'page_view'
    GROUP BY url
    ORDER BY views DESC
    LIMIT 10
  `).all() as Array<{ url: string; views: number }>;
  
  // Top referrers by page views
  // We normalize referrers in JavaScript since SQLite doesn't have built-in URL parsing
  const allPageViews = db.prepare(`
    SELECT referrer
    FROM events
    WHERE event_type = 'page_view'
  `).all() as Array<{ referrer: string | null }>;
  
  // Count referrers by normalized domain
  const referrerCounts = new Map<string, number>();
  allPageViews.forEach(({ referrer }) => {
    const domain = normalizeReferrer(referrer);
    referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1);
  });
  
  // Convert to array and sort by count
  const topReferrers = Array.from(referrerCounts.entries())
    .map(([referrer_domain, views]) => ({ referrer_domain, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  
  // Recent events
  const recentEvents = db.prepare(`
    SELECT * FROM events
    ORDER BY timestamp DESC
    LIMIT 50
  `).all() as AnalyticsEvent[];
  
  // Views in last 24 hours
  const viewsLast24h = db.prepare(`
    SELECT COUNT(*) as count FROM events
    WHERE event_type = 'page_view' AND timestamp > ?
  `).get(last24h) as { count: number };
  
  // Views in last 7 days
  const viewsLast7d = db.prepare(`
    SELECT COUNT(*) as count FROM events
    WHERE event_type = 'page_view' AND timestamp > ?
  `).get(last7d) as { count: number };
  
  return {
    totalViews: totalViews.count,
    uniqueSessions: uniqueSessions.count,
    topPages,
    topReferrers,
    recentEvents,
    viewsLast24h: viewsLast24h.count,
    viewsLast7d: viewsLast7d.count,
  };
}

/**
 * Get all events (for export/backup)
 */
export function getAllEvents(): AnalyticsEvent[] {
  return db.prepare('SELECT * FROM events ORDER BY timestamp DESC').all() as AnalyticsEvent[];
}

export default db;
