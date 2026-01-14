/**
 * Analytics API routes
 * 
 * /analytics/event - POST endpoint to track events
 * /analytics/stats - GET endpoint to retrieve statistics (protected)
 */

import type { Express, Request, Response, NextFunction } from "express";
import { insertEvent, getStats } from "./analytics-db";
import { z } from "zod";

// Validation schema for analytics events
const eventSchema = z.object({
  session_id: z.string(),
  event_type: z.enum(['page_view', 'click', 'heartbeat']),
  url: z.string(),
  referrer: z.string().optional(),
  user_agent: z.string().optional(),
  element_id: z.string().optional(),
  element_text: z.string().optional(),
  timestamp: z.number(),
});

/**
 * Basic auth middleware for analytics dashboard
 * Password is set via ANALYTICS_PASSWORD environment variable
 */
function requireAnalyticsAuth(req: Request, res: Response, next: NextFunction) {
  const password = process.env.ANALYTICS_PASSWORD;
  
  // If no password is set, allow access (development mode)
  if (!password) {
    return next();
  }
  
  // Check for Basic Auth header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Analytics Dashboard"');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, providedPassword] = credentials.split(':');
    
    if (providedPassword === password) {
      return next();
    }
  } catch (error) {
    // Invalid auth header format
  }
  
  res.setHeader('WWW-Authenticate', 'Basic realm="Analytics Dashboard"');
  return res.status(401).json({ error: 'Invalid credentials' });
}

export function registerAnalyticsRoutes(app: Express) {
  /**
   * POST /analytics/event
   * Track an analytics event (page view, click, heartbeat)
   */
  app.post('/analytics/event', (req, res) => {
    try {
      // Validate request body
      const event = eventSchema.parse(req.body);
      
      // Insert event into database
      insertEvent(event);
      
      // Return success (no body needed, fire-and-forget)
      res.status(204).send();
    } catch (error) {
      // Silently fail - don't expose errors to client
      console.error('Analytics event error:', error);
      res.status(204).send(); // Return 204 even on error to not break client
    }
  });
  
  /**
   * GET /analytics/stats
   * Get analytics statistics (protected by basic auth)
   */
  app.get('/analytics/stats', requireAnalyticsAuth, (req, res) => {
    try {
      const stats = getStats();
      res.json(stats);
    } catch (error) {
      console.error('Analytics stats error:', error);
      res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
  });
}
