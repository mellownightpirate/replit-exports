/**
 * Analytics V3 - Goal-oriented analytics with funnel tracking
 * 
 * Features:
 * - Session and visitor tracking with cookies
 * - Bot filtering and de-noise
 * - UTM parameter capture
 * - Purchase funnel tracking
 * - Daily goal progress (150 unique visitors)
 */

import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import path from 'path';

// Static salt for IP hashing (can be changed to environment variable later)
const STATIC_SALT = process.env.ANALYTICS_SALT || 'layla-static-salt';

// Initialize database
const dbPath = path.join(process.cwd(), 'data', 'analytics.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    user_agent TEXT,
    first_seen INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    referrer TEXT
  );

  CREATE TABLE IF NOT EXISTS hits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    sid TEXT NOT NULL,
    vid TEXT NOT NULL,
    path TEXT NOT NULL,
    event TEXT NOT NULL DEFAULT 'page_view',
    meta TEXT
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER NOT NULL,
    sid TEXT,
    vid TEXT,
    source TEXT,
    amount_cents INTEGER,
    order_ref TEXT
  );

  CREATE TABLE IF NOT EXISTS ignore_ips (
    ip_hash TEXT PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS ignore_uas (
    ua_pattern TEXT PRIMARY KEY
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_vid ON sessions(visitor_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_last_seen ON sessions(last_seen);
  CREATE INDEX IF NOT EXISTS idx_hits_ts ON hits(ts);
  CREATE INDEX IF NOT EXISTS idx_hits_event ON hits(event);
  CREATE INDEX IF NOT EXISTS idx_hits_sid ON hits(sid);
  CREATE INDEX IF NOT EXISTS idx_purchases_ts ON purchases(ts);
`);

console.log('Analytics V3 database initialized at:', dbPath);

// Bot detection regex
const BOT_PATTERN = /(bot|crawler|spider|preview|fetch|monitor|scrape|facebookexternalhit|slackbot|twitterbot|linkedinbot|bingbot|googlebot|ahrefs|semrush|mj12|uptimerobot|whatsapp|telegrambot|discordbot)/i;

// Blocked paths
const BLOCKED_PATHS = ['/wp-admin', '/wordpress', 'setup-config.php', '/.git', '/phpmyadmin', '/.env', '/admin', '/xmlrpc.php'];

// Helper functions
export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + STATIC_SALT).digest('hex');
}

export function isBot(userAgent: string): boolean {
  return BOT_PATTERN.test(userAgent);
}

export function isBlockedPath(path: string): boolean {
  return BLOCKED_PATHS.some(blocked => path.includes(blocked));
}

export function isDevDomain(host: string): boolean {
  return host?.endsWith('.repl.dev') || host?.endsWith('.repl.co');
}

export function extractDomain(url: string): string {
  try {
    if (!url || url === 'direct') return 'direct';
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'direct';
  }
}

export function getSource(session: any): string {
  return session.utm_source || extractDomain(session.referrer);
}

// Database operations
interface TrackData {
  event: string;
  path: string;
  vid: string;
  sid: string;
  utms?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  referrer?: string;
  userAgent: string;
  ip: string;
  host?: string;
  meta?: any;
}

export function trackHit(data: TrackData): { ok: boolean; reason?: string } {
  const { event, path, vid, sid, utms, referrer, userAgent, ip, host, meta } = data;

  // Filter bots
  if (isBot(userAgent)) {
    return { ok: false, reason: 'bot' };
  }

  // Filter blocked paths
  if (isBlockedPath(path)) {
    return { ok: false, reason: 'blocked_path' };
  }

  // Filter dev domains
  if (host && isDevDomain(host)) {
    return { ok: false, reason: 'dev_domain' };
  }

  const ipHash = hashIP(ip);

  // Check ignore lists
  const ignoredIP = db.prepare('SELECT 1 FROM ignore_ips WHERE ip_hash = ?').get(ipHash);
  if (ignoredIP) {
    return { ok: false, reason: 'ignored_ip' };
  }

  const ignoreUA = db.prepare('SELECT ua_pattern FROM ignore_uas').all() as { ua_pattern: string }[];
  for (const { ua_pattern } of ignoreUA) {
    if (userAgent.includes(ua_pattern)) {
      return { ok: false, reason: 'ignored_ua' };
    }
  }

  const now = Date.now();

  // Upsert session
  const existingSession = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sid);
  
  if (!existingSession) {
    // New session
    db.prepare(`
      INSERT INTO sessions (id, visitor_id, ip_hash, user_agent, first_seen, last_seen, utm_source, utm_medium, utm_campaign, utm_content, utm_term, referrer)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sid,
      vid,
      ipHash,
      userAgent,
      now,
      now,
      utms?.utm_source || null,
      utms?.utm_medium || null,
      utms?.utm_campaign || null,
      utms?.utm_content || null,
      utms?.utm_term || null,
      referrer || null
    );
  } else {
    // Update existing session
    db.prepare('UPDATE sessions SET last_seen = ? WHERE id = ?').run(now, sid);
  }

  // Insert hit
  db.prepare(`
    INSERT INTO hits (ts, sid, vid, path, event, meta)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(now, sid, vid, path, event, meta ? JSON.stringify(meta) : null);

  return { ok: true };
}

export function recordPurchase(data: {
  sid?: string;
  vid?: string;
  source?: string;
  amount_cents?: number;
  order_ref?: string;
}): number {
  const now = Date.now();
  const result = db.prepare(`
    INSERT INTO purchases (ts, sid, vid, source, amount_cents, order_ref)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    now,
    data.sid || null,
    data.vid || null,
    data.source || null,
    data.amount_cents || null,
    data.order_ref || null
  );
  
  return result.lastInsertRowid as number;
}

export function addIgnoreIP(ipHash: string): void {
  db.prepare('INSERT OR IGNORE INTO ignore_ips (ip_hash) VALUES (?)').run(ipHash);
}

export function addIgnoreUA(uaPattern: string): void {
  db.prepare('INSERT OR IGNORE INTO ignore_uas (ua_pattern) VALUES (?)').run(uaPattern);
}

// Stats functions
export function getSummary(range: 'today' | '7d' | '30d' = 'today') {
  const now = Date.now();
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday).setDate(new Date(startOfToday).getDate() - 1);
  const startOf7DaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Today's uniques
  const todayUniques = db.prepare(`
    SELECT COUNT(DISTINCT vid) as count
    FROM hits
    WHERE ts >= ?
  `).get(startOfToday) as { count: number };

  // Yesterday's uniques
  const yesterdayUniques = db.prepare(`
    SELECT COUNT(DISTINCT vid) as count
    FROM hits
    WHERE ts >= ? AND ts < ?
  `).get(startOfYesterday, startOfToday) as { count: number };

  // Last 7 days uniques
  const last7DaysUniques = db.prepare(`
    SELECT COUNT(DISTINCT vid) as count
    FROM hits
    WHERE ts >= ?
  `).get(startOf7DaysAgo) as { count: number };

  // Today's page views
  const todayPageViews = db.prepare(`
    SELECT COUNT(*) as count
    FROM hits
    WHERE ts >= ? AND event = 'page_view'
  `).get(startOfToday) as { count: number };

  // Today's ticket clicks
  const todayTicketClicks = db.prepare(`
    SELECT COUNT(*) as count
    FROM hits
    WHERE ts >= ? AND event = 'click_ticket'
  `).get(startOfToday) as { count: number };

  // Today's purchases
  const todayPurchases = db.prepare(`
    SELECT COUNT(*) as count
    FROM purchases
    WHERE ts >= ?
  `).get(startOfToday) as { count: number };

  // Live visitors (sessions active in last 5 minutes)
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const liveVisitors = db.prepare(`
    SELECT COUNT(DISTINCT id) as count
    FROM sessions
    WHERE last_seen >= ?
  `).get(fiveMinutesAgo) as { count: number };

  // Get daily goal from environment or default to 150
  const dailyGoal = parseInt(process.env.VITE_DAILY_GOAL || '150', 10);

  return {
    todayUniques: todayUniques.count,
    todayPageviews: todayPageViews.count,
    todayClicks: todayTicketClicks.count,
    todayPurchases: todayPurchases.count,
    liveVisitors: liveVisitors.count,
    dailyGoal,
    yesterdayUniques: yesterdayUniques.count,
    last7DaysUniques: last7DaysUniques.count,
  };
}

export function getFunnel(range: 'today' | '7d' = 'today') {
  const now = Date.now();
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const rangeStart = range === 'today' ? startOfToday : now - 7 * 24 * 60 * 60 * 1000;

  const visitors = db.prepare(`
    SELECT COUNT(DISTINCT vid) as count
    FROM hits
    WHERE ts >= ?
  `).get(rangeStart) as { count: number };

  const ticketClicks = db.prepare(`
    SELECT COUNT(DISTINCT vid) as count
    FROM hits
    WHERE ts >= ? AND event = 'click_ticket'
  `).get(rangeStart) as { count: number };

  const purchases = db.prepare(`
    SELECT COUNT(DISTINCT vid) as count
    FROM purchases
    WHERE ts >= ? AND vid IS NOT NULL
  `).get(rangeStart) as { count: number };

  return {
    visitors: visitors.count,
    clicks: ticketClicks.count,
    purchases: purchases.count
  };
}

export function getDailyUniques(days: number = 30) {
  const results: { date: string; uniques: number }[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayStart = new Date(date).setHours(0, 0, 0, 0);
    const dayEnd = new Date(date).setHours(23, 59, 59, 999);

    const uniques = db.prepare(`
      SELECT COUNT(DISTINCT vid) as count
      FROM hits
      WHERE ts >= ? AND ts <= ?
    `).get(dayStart, dayEnd) as { count: number };

    const dateStr = date.toISOString().split('T')[0];
    results.push({ date: dateStr, uniques: uniques.count });
  }

  return results;
}

export function getTopReferrers(days: number = 7) {
  const now = Date.now();
  const rangeStart = now - days * 24 * 60 * 60 * 1000;

  const referrers = db.prepare(`
    SELECT s.referrer, COUNT(DISTINCT h.vid) as visitors
    FROM hits h
    JOIN sessions s ON h.sid = s.id
    WHERE h.ts >= ? AND s.referrer IS NOT NULL AND s.referrer != ''
    GROUP BY s.referrer
    ORDER BY visitors DESC
    LIMIT 10
  `).all(rangeStart) as { referrer: string; visitors: number }[];

  return referrers.map(r => ({
    referrer: extractDomain(r.referrer),
    visitors: r.visitors
  }));
}

export function getSources(days: number = 7) {
  const now = Date.now();
  const rangeStart = now - days * 24 * 60 * 60 * 1000;

  // Get all sessions in range with their sources
  const sessions = db.prepare(`
    SELECT DISTINCT
      s.id,
      s.visitor_id,
      COALESCE(s.utm_source, s.referrer) as source
    FROM sessions s
    JOIN hits h ON h.sid = s.id
    WHERE h.ts >= ?
  `).all(rangeStart) as { id: string; visitor_id: string; source: string }[];

  // Group by source
  const sourceMap = new Map<string, { visitors: Set<string>; ticket_clicks: number; purchases: number }>();

  sessions.forEach(session => {
    const source = extractDomain(session.source || 'direct');
    if (!sourceMap.has(source)) {
      sourceMap.set(source, { visitors: new Set(), ticket_clicks: 0, purchases: 0 });
    }
    sourceMap.get(source)!.visitors.add(session.visitor_id);
  });

  // Count ticket clicks by source
  const ticketClicks = db.prepare(`
    SELECT s.id, COALESCE(s.utm_source, s.referrer) as source
    FROM hits h
    JOIN sessions s ON h.sid = s.id
    WHERE h.ts >= ? AND h.event = 'click_ticket'
  `).all(rangeStart) as { id: string; source: string }[];

  ticketClicks.forEach(({ source }) => {
    const src = extractDomain(source || 'direct');
    if (sourceMap.has(src)) {
      sourceMap.get(src)!.ticket_clicks++;
    }
  });

  // Count purchases by source
  const purchases = db.prepare(`
    SELECT p.source
    FROM purchases p
    WHERE p.ts >= ?
  `).all(rangeStart) as { source: string }[];

  purchases.forEach(({ source }) => {
    const src = extractDomain(source || 'direct');
    if (sourceMap.has(src)) {
      sourceMap.get(src)!.purchases++;
    }
  });

  // Convert to array and calculate rates
  const results = Array.from(sourceMap.entries()).map(([source, data]) => {
    const visitors = data.visitors.size;
    const conversionRate = visitors > 0 ? (data.purchases / visitors) * 100 : 0;

    return {
      source,
      visitors,
      clicks: data.ticket_clicks,
      purchases: data.purchases,
      conversionRate: Math.round(conversionRate * 10) / 10
    };
  });

  return results.sort((a, b) => b.visitors - a.visitors);
}

export function getRecentHits(limit: number = 25) {
  const hits = db.prepare(`
    SELECT h.ts, h.event, h.path, h.vid, s.utm_source, s.referrer
    FROM hits h
    LEFT JOIN sessions s ON h.sid = s.id
    ORDER BY h.ts DESC
    LIMIT ?
  `).all(limit) as { ts: number; event: string; path: string; vid: string; utm_source: string | null; referrer: string | null }[];

  return hits.map(h => ({
    timestamp: new Date(h.ts).toISOString(),
    event: h.event,
    path: h.path,
    referrer: h.referrer || undefined,
    source: h.utm_source || extractDomain(h.referrer || 'direct')
  }));
}

export { db };
