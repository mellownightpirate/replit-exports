import type { Express, Request, Response } from "express";
import { 
  trackHit, 
  recordPurchase,
  addIgnoreIP,
  addIgnoreUA,
  hashIP,
  getSummary,
  getFunnel,
  getDailyUniques,
  getTopReferrers,
  getSources,
  getRecentHits
} from "./analytics-v3";
import { z } from "zod";

// Validation schema for tracking
const trackSchema = z.object({
  event: z.string(),
  path: z.string(),
  vid: z.string(),
  sid: z.string(),
  utms: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_content: z.string().optional(),
    utm_term: z.string().optional(),
  }).optional(),
  referrer: z.string().optional(),
  userAgent: z.string(),
  meta: z.any().optional(),
});

// Luma ticket URL
const LUMA_TICKET_URL = 'https://luma.com/ty04bhmg';

export function registerAnalyticsRoutesV3(app: Express) {
  
  // POST /api/track - Main tracking endpoint
  app.post('/api/track', (req: Request, res: Response) => {
    try {
      const data = trackSchema.parse(req.body);
      
      // Get client IP
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
      const host = req.headers.host;
      
      const result = trackHit({
        event: data.event,
        path: data.path,
        vid: data.vid,
        sid: data.sid,
        utms: data.utms,
        referrer: data.referrer,
        userAgent: data.userAgent,
        ip,
        host,
        meta: data.meta,
      });

      if (result.ok) {
        res.json({ ok: true });
      } else {
        // Return 204 for filtered requests (bots, blocked paths, etc.)
        res.status(204).send();
      }
    } catch (error) {
      console.error('Track error:', error);
      res.status(400).json({ error: 'Invalid request' });
    }
  });

  // GET /p.gif - 1x1 tracking pixel (no-JS fallback)
  app.get('/p.gif', (req: Request, res: Response) => {
    try {
      const { path, vid, sid, ref } = req.query;
      
      if (vid && sid) {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
        const host = req.headers.host;
        const userAgent = req.headers['user-agent'] || '';
        
        trackHit({
          event: 'page_view',
          path: (path as string) || '/',
          vid: vid as string,
          sid: sid as string,
          referrer: ref as string,
          userAgent,
          ip,
          host,
        });
      }
    } catch (error) {
      console.error('Pixel track error:', error);
    }

    // Return 1x1 transparent GIF
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': gif.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(gif);
  });

  // GET /out/tickets - Track ticket click and redirect to Luma
  app.get('/out/tickets', (req: Request, res: Response) => {
    try {
      const { vid, sid, utm_source, utm_medium, utm_campaign } = req.query;
      
      if (vid && sid) {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
        const host = req.headers.host;
        const userAgent = req.headers['user-agent'] || '';
        
        trackHit({
          event: 'click_ticket',
          path: '/out/tickets',
          vid: vid as string,
          sid: sid as string,
          utms: utm_source ? {
            utm_source: utm_source as string,
            utm_medium: utm_medium as string,
            utm_campaign: utm_campaign as string,
          } : undefined,
          userAgent,
          ip,
          host,
        });
      }

      // Redirect to Luma with UTM params preserved
      const targetUrl = new URL(LUMA_TICKET_URL);
      if (utm_source) targetUrl.searchParams.set('utm_source', utm_source as string);
      if (utm_medium) targetUrl.searchParams.set('utm_medium', utm_medium as string);
      if (utm_campaign) targetUrl.searchParams.set('utm_campaign', utm_campaign as string);
      
      res.redirect(302, targetUrl.toString());
    } catch (error) {
      console.error('Ticket redirect error:', error);
      res.redirect(302, LUMA_TICKET_URL);
    }
  });

  // POST /webhooks/luma - Purchase webhook from Luma (optional)
  // SECURITY: Requires LUMA_WEBHOOK_SECRET environment variable
  app.post('/webhooks/luma', (req: Request, res: Response) => {
    try {
      // Validate webhook secret to prevent unauthorized purchase recording
      const providedSecret = req.headers['x-luma-signature'] || req.headers['authorization']?.replace('Bearer ', '');
      const expectedSecret = process.env.LUMA_WEBHOOK_SECRET;
      
      // If secret is configured, enforce it
      if (expectedSecret) {
        if (!providedSecret || providedSecret !== expectedSecret) {
          console.warn('Webhook rejected: invalid or missing secret');
          return res.status(401).json({ error: 'Unauthorized' });
        }
      } else {
        // Log warning if webhook is used without secret configuration
        console.warn('⚠️  SECURITY WARNING: LUMA_WEBHOOK_SECRET not set - webhook is unprotected!');
        console.warn('⚠️  Anyone can POST fake purchase data to this endpoint.');
        console.warn('⚠️  Set LUMA_WEBHOOK_SECRET environment variable before deploying to production.');
      }
      
      const { order_ref, amount_cents, vid, sid, utm_source, referrer } = req.body;
      
      recordPurchase({
        sid,
        vid,
        source: utm_source || referrer,
        amount_cents,
        order_ref,
      });

      res.json({ ok: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Failed to record purchase' });
    }
  });

  // GET /thank-you - Fallback purchase capture
  // SECURITY WARNING: This endpoint accepts purchases via URL params without strong validation
  // It's intended for Luma redirect after purchase: lu.ma redirects to /thank-you?order=X&vid=Y&token=SECRET
  // PRODUCTION: Set LUMA_REDIRECT_TOKEN to prevent purchase spoofing via URL manipulation
  app.get('/thank-you', (req: Request, res: Response) => {
    try {
      const { order, amount, vid, sid, utm_source, token } = req.query;
      
      // Optional token validation (if LUMA_REDIRECT_TOKEN is set)
      const expectedToken = process.env.LUMA_REDIRECT_TOKEN;
      if (expectedToken) {
        if (token !== expectedToken) {
          console.warn('Thank-you page rejected: invalid token');
          return res.status(401).send('Unauthorized');
        }
      } else {
        console.warn('⚠️  LUMA_REDIRECT_TOKEN not set - thank-you page is unprotected!');
      }
      
      if (order) {
        const amountCents = amount ? Math.round(parseFloat(amount as string) * 100) : undefined;
        
        recordPurchase({
          sid: sid as string,
          vid: vid as string,
          source: utm_source as string,
          amount_cents: amountCents,
          order_ref: order as string,
        });
      }

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Thank you - Layla</title>
            <meta name="robots" content="noindex, nofollow">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: #0f172a;
                color: #e2e8f0;
                padding: 60px 20px;
                text-align: center;
              }
              h1 { font-size: 2.5rem; font-weight: 300; margin-bottom: 1rem; }
              p { font-size: 1.1rem; color: #94a3b8; }
            </style>
          </head>
          <body>
            <h1>Thank You!</h1>
            <p>Your purchase has been recorded. We look forward to seeing you at Layla.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Thank you page error:', error);
      res.status(500).send('Error processing request');
    }
  });

  // GET /api/stats/summary - Summary stats
  app.get('/api/stats/summary', (req: Request, res: Response) => {
    try {
      const range = (req.query.range as 'today' | '7d' | '30d') || 'today';
      const summary = getSummary(range);
      res.json(summary);
    } catch (error) {
      console.error('Summary error:', error);
      res.status(500).json({ error: 'Failed to get summary' });
    }
  });

  // GET /api/stats/funnel - Funnel stats
  app.get('/api/stats/funnel', (req: Request, res: Response) => {
    try {
      const todayFunnel = getFunnel('today');
      const last7DaysFunnel = getFunnel('7d');
      
      res.json({
        todayFunnel,
        last7DaysFunnel
      });
    } catch (error) {
      console.error('Funnel error:', error);
      res.status(500).json({ error: 'Failed to get funnel' });
    }
  });

  // GET /api/stats/daily-uniques - Daily unique visitors chart
  app.get('/api/stats/daily-uniques', (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = getDailyUniques(days);
      res.json(data);
    } catch (error) {
      console.error('Daily uniques error:', error);
      res.status(500).json({ error: 'Failed to get daily uniques' });
    }
  });

  // GET /api/stats/top-referrers - Top referrers
  app.get('/api/stats/top-referrers', (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = getTopReferrers(days);
      res.json(data);
    } catch (error) {
      console.error('Top referrers error:', error);
      res.status(500).json({ error: 'Failed to get top referrers' });
    }
  });

  // GET /api/stats/sources - Source performance
  app.get('/api/stats/sources', (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = getSources(days);
      res.json(data);
    } catch (error) {
      console.error('Sources error:', error);
      res.status(500).json({ error: 'Failed to get sources' });
    }
  });

  // GET /api/stats/recent - Recent activity
  app.get('/api/stats/recent', (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 25;
      const data = getRecentHits(limit);
      res.json(data);
    } catch (error) {
      console.error('Recent hits error:', error);
      res.status(500).json({ error: 'Failed to get recent hits' });
    }
  });

  // POST /api/ignore/ip - Add current IP to ignore list
  app.post('/api/ignore/ip', (req: Request, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown';
      const ipHash = hashIP(ip);
      addIgnoreIP(ipHash);
      res.json({ ok: true, ip_hash: ipHash });
    } catch (error) {
      console.error('Ignore IP error:', error);
      res.status(500).json({ error: 'Failed to add IP to ignore list' });
    }
  });

  // POST /api/ignore/ua - Add UA pattern to ignore list
  app.post('/api/ignore/ua', (req: Request, res: Response) => {
    try {
      const { pattern } = req.body;
      if (!pattern) {
        return res.status(400).json({ error: 'Pattern required' });
      }
      addIgnoreUA(pattern);
      res.json({ ok: true });
    } catch (error) {
      console.error('Ignore UA error:', error);
      res.status(500).json({ error: 'Failed to add UA to ignore list' });
    }
  });
}

export { LUMA_TICKET_URL };
