import type { Express, Request, Response, NextFunction } from "express";
import { 
  trackHit, 
  getAnalyticsSummary, 
  getRecentHits, 
  getTodayUniques,
  getLiveVisitors 
} from "./analytics-v2";
import { z } from "zod";

const ANALYTICS_TOKEN = process.env.ANALYTICS_TOKEN;

// Validation schema for tracking
const trackSchema = z.object({
  path: z.string(),
  referrer: z.string().optional(),
  ua: z.string(),
  screen: z.object({
    width: z.number(),
    height: z.number(),
  }).optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

// Token authentication middleware
function requireToken(req: Request, res: Response, next: NextFunction) {
  if (!ANALYTICS_TOKEN) {
    return next(); // No token required in development
  }

  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === ANALYTICS_TOKEN) {
      return next();
    }
  }

  // For SSE, also check query parameter (EventSource doesn't support custom headers)
  const tokenParam = req.query.token as string;
  if (tokenParam === ANALYTICS_TOKEN) {
    return next();
  }

  return res.status(401).json({ error: 'Authorization required' });
}

// SSE clients for live updates
const sseClients = new Set<Response>();

// Broadcast update to all SSE clients
export function broadcastUpdate(todayUniques: number) {
  const data = JSON.stringify({ ts: new Date().toISOString(), today_uniques: todayUniques });
  sseClients.forEach(client => {
    client.write(`data: ${data}\n\n`);
  });
}

export function registerAnalyticsRoutes(app: Express) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  // Tracking endpoint
  app.post('/api/track', (req, res) => {
    try {
      const data = trackSchema.parse(req.body);
      
      // Get client IP
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
      
      // Get or set LAYLA_VID cookie
      let cookieValue = req.cookies?.LAYLA_VID;
      if (!cookieValue) {
        cookieValue = Math.random().toString(36).substring(2) + Date.now().toString(36);
        res.cookie('LAYLA_VID', cookieValue, {
          maxAge: 365 * 24 * 60 * 60 * 1000, // 365 days
          httpOnly: false,
          sameSite: 'lax',
        });
      }

      // Track the hit
      const result = trackHit({
        path: data.path,
        referrer: data.referrer,
        ua: data.ua,
        ip,
        cookieValue,
        utm_source: data.utm_source,
        utm_medium: data.utm_medium,
        utm_campaign: data.utm_campaign,
      });

      // Broadcast update to SSE clients
      const todayUniques = getTodayUniques();
      broadcastUpdate(todayUniques);

      res.json({ ok: true, visitor_id: result.visitor_id });
    } catch (error) {
      console.error('Track error:', error);
      res.status(400).json({ error: 'Invalid request' });
    }
  });

  // Analytics summary
  // TODO: When ready to secure this endpoint, add requireToken middleware here:
  // app.get('/api/analytics/summary', requireToken, (req, res) => {
  app.get('/api/analytics/summary', (req, res) => {
    try {
      const summary = getAnalyticsSummary();
      const liveVisitors = getLiveVisitors();
      res.json({ ...summary, live_visitors: liveVisitors });
    } catch (error) {
      console.error('Summary error:', error);
      res.status(500).json({ error: 'Failed to get summary' });
    }
  });

  // Recent hits (for debugging)
  // TODO: When ready to secure this endpoint, add requireToken middleware here:
  // app.get('/api/analytics/recent', requireToken, (req, res) => {
  app.get('/api/analytics/recent', (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const hits = getRecentHits(limit);
      res.json({ hits });
    } catch (error) {
      console.error('Recent hits error:', error);
      res.status(500).json({ error: 'Failed to get recent hits' });
    }
  });

  // SSE stream for live updates
  // TODO: When ready to secure this endpoint, add requireToken middleware here:
  // app.get('/api/analytics/stream', requireToken, (req, res) => {
  app.get('/api/analytics/stream', (req, res) => {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add client to set
    sseClients.add(res);

    // Send initial data
    const todayUniques = getTodayUniques();
    res.write(`data: ${JSON.stringify({ ts: new Date().toISOString(), today_uniques: todayUniques })}\n\n`);

    // Remove client on disconnect
    req.on('close', () => {
      sseClients.delete(res);
    });
  });
}
