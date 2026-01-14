import Database from 'better-sqlite3';
import { createHash } from 'crypto';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'analytics.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

const ANALYTICS_SALT = process.env.ANALYTICS_SALT || 'layla-default-salt-change-in-production';

// Initialize database schema
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS visitors (
      visitor_id TEXT PRIMARY KEY,
      first_seen DATETIME NOT NULL,
      last_seen DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts DATETIME NOT NULL,
      visitor_id TEXT NOT NULL,
      path TEXT NOT NULL,
      referrer TEXT,
      ua TEXT,
      is_bot INTEGER DEFAULT 0,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_hits_ts ON hits(ts);
    CREATE INDEX IF NOT EXISTS idx_hits_path ON hits(path);
    CREATE INDEX IF NOT EXISTS idx_hits_visitor_id ON hits(visitor_id);
  `);
}

initializeDatabase();

// Bot detection
export function isBot(userAgent: string): boolean {
  if (!userAgent) return true;
  const botPatterns = ['bot', 'spider', 'crawler', 'headlesschrome', 'phantom', 'selenium'];
  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern));
}

// Generate stable visitor ID
export function generateVisitorId(ip: string, userAgent: string, cookieValue: string): string {
  const data = `${ANALYTICS_SALT}${ip}${userAgent}${cookieValue}`;
  return createHash('sha256').update(data).digest('hex');
}

// Track a hit
export interface TrackData {
  path: string;
  referrer?: string;
  ua: string;
  ip: string;
  cookieValue: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export function trackHit(data: TrackData): { visitor_id: string } {
  const visitor_id = generateVisitorId(data.ip, data.ua, data.cookieValue);
  const now = new Date().toISOString();
  const bot = isBot(data.ua) ? 1 : 0;

  // Upsert visitor
  const upsertVisitor = db.prepare(`
    INSERT INTO visitors (visitor_id, first_seen, last_seen)
    VALUES (?, ?, ?)
    ON CONFLICT(visitor_id) DO UPDATE SET last_seen = ?
  `);
  upsertVisitor.run(visitor_id, now, now, now);

  // Insert hit
  const insertHit = db.prepare(`
    INSERT INTO hits (ts, visitor_id, path, referrer, ua, is_bot, utm_source, utm_medium, utm_campaign)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertHit.run(
    now,
    visitor_id,
    data.path,
    data.referrer || null,
    data.ua,
    bot,
    data.utm_source || null,
    data.utm_medium || null,
    data.utm_campaign || null
  );

  return { visitor_id };
}

// Get analytics summary
export function getAnalyticsSummary() {
  const allTimeUniques = db.prepare(`
    SELECT COUNT(DISTINCT visitor_id) as count
    FROM hits
    WHERE is_bot = 0
  `).get() as { count: number };

  const todayUniques = db.prepare(`
    SELECT COUNT(DISTINCT visitor_id) as count
    FROM hits
    WHERE is_bot = 0
    AND date(ts) = date('now')
  `).get() as { count: number };

  const todayPageviews = db.prepare(`
    SELECT COUNT(*) as count
    FROM hits
    WHERE is_bot = 0
    AND date(ts) = date('now')
  `).get() as { count: number };

  const last60d = db.prepare(`
    SELECT 
      date(ts) as date,
      COUNT(DISTINCT visitor_id) as uniques,
      COUNT(*) as pageviews
    FROM hits
    WHERE is_bot = 0
    AND date(ts) >= date('now', '-60 days')
    GROUP BY date(ts)
    ORDER BY date(ts) ASC
  `).all() as Array<{ date: string; uniques: number; pageviews: number }>;

  const topPages = db.prepare(`
    SELECT 
      path,
      COUNT(DISTINCT visitor_id) as uniques_7d,
      COUNT(*) as pageviews_7d
    FROM hits
    WHERE is_bot = 0
    AND date(ts) >= date('now', '-7 days')
    GROUP BY path
    ORDER BY pageviews_7d DESC
    LIMIT 10
  `).all() as Array<{ path: string; uniques_7d: number; pageviews_7d: number }>;

  const topReferrers = db.prepare(`
    SELECT 
      referrer,
      COUNT(*) as pageviews
    FROM hits
    WHERE is_bot = 0
    AND referrer IS NOT NULL
    AND referrer != ''
    AND date(ts) >= date('now', '-7 days')
    GROUP BY referrer
    ORDER BY pageviews DESC
    LIMIT 10
  `).all() as Array<{ referrer: string; pageviews: number }>;

  return {
    all_time_uniques: allTimeUniques.count,
    today_uniques: todayUniques.count,
    today_pageviews: todayPageviews.count,
    last_60d: last60d,
    top_pages: topPages,
    top_referrers_7d: topReferrers,
  };
}

// Get recent hits for debugging
export function getRecentHits(limit: number = 50) {
  return db.prepare(`
    SELECT 
      id,
      ts,
      visitor_id,
      path,
      referrer,
      is_bot
    FROM hits
    ORDER BY ts DESC
    LIMIT ?
  `).all(limit) as Array<{
    id: number;
    ts: string;
    visitor_id: string;
    path: string;
    referrer: string | null;
    is_bot: number;
  }>;
}

// Get live visitor count (last 5 minutes)
export function getLiveVisitors(): number {
  const result = db.prepare(`
    SELECT COUNT(DISTINCT visitor_id) as count
    FROM hits
    WHERE is_bot = 0
    AND datetime(ts) >= datetime('now', '-5 minutes')
  `).get() as { count: number };
  return result.count;
}

// Get today's unique count (for SSE streaming)
export function getTodayUniques(): number {
  const result = db.prepare(`
    SELECT COUNT(DISTINCT visitor_id) as count
    FROM hits
    WHERE is_bot = 0
    AND date(ts) = date('now')
  `).get() as { count: number };
  return result.count;
}

export default db;
