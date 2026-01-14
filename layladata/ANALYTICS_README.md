# First-Party Analytics System

## Overview

This project includes a privacy-friendly, first-party analytics system that tracks visitor behavior **without using any external services** like Google Analytics, Plausible, or other third-party tools.

## How It Works

### Frontend Tracking

The analytics system automatically tracks:

1. **Page Views**: Every time a page loads, including URL, referrer, and timestamp
2. **Click Events**: Clicks on links, buttons, and elements with `data-track` attribute
3. **Time on Page**: Heartbeat pings every 30 seconds to measure engagement
4. **Referrer Sources**: Where visitors came from (e.g., linkedin.com, twitter.com, google.com, or "Direct")

The tracking code:
- Generates an anonymous session ID stored in `sessionStorage`
- Does NOT use cookies
- Does NOT collect personally identifiable information
- Sends events via `fetch()` API to `/analytics/event`
- Automatically disabled in development mode (unless `VITE_ENABLE_ANALYTICS=true`)

### Backend Storage

Events are stored in **SQLite database** (`analytics.db`) with the following schema:

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,        -- 'page_view', 'click', 'heartbeat'
  url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  element_id TEXT,                  -- For click events
  element_text TEXT,                -- For click events
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Setup

### 1. Enable Analytics (Production)

Analytics are automatically enabled in production mode. No configuration needed!

### 2. Enable Analytics (Development)

To test analytics in development mode, set environment variable:

```bash
VITE_ENABLE_ANALYTICS=true
```

### 3. Set Analytics Dashboard Password

To protect the `/analytics` dashboard with a password:

```bash
ANALYTICS_PASSWORD=your_secure_password_here
```

Add this to your Replit Secrets or `.env` file.

**Without a password**, the dashboard is publicly accessible (not recommended for production).

## Viewing Analytics

### Access the Dashboard

Visit: `https://your-domain.com/analytics`

If you set `ANALYTICS_PASSWORD`, you'll be prompted for Basic Authentication:
- Username: (leave blank or any value)
- Password: Your `ANALYTICS_PASSWORD` value

### Dashboard Features

The analytics dashboard shows:

- **Total Views**: All-time page views
- **Unique Sessions**: Count of unique visitors (by session ID)
- **Last 24 Hours**: Views in the past day
- **Last 7 Days**: Weekly view count
- **Top Pages**: Most visited pages with view counts
- **Top Referrers**: Traffic sources ranked by views (e.g., linkedin.com, twitter.com, Direct)
- **Recent Events**: Live feed of latest tracked activity
- **Event Details Table**: Full event log with referrer column and filter box

### Referrer Tracking

The dashboard includes comprehensive referrer tracking to show you where your visitors are coming from:

**Top Referrers Card**: Shows the top 10 traffic sources, such as:
- `linkedin.com` - Visitors from LinkedIn (posts, DMs, profiles)
- `twitter.com` - Visitors from Twitter/X links
- `google.com` - Visitors from Google search results
- `Direct` - Visitors who typed URL directly or had no referrer

**Event Details Table**: 
- Shows a "Referrer" column with the normalized domain for each event
- Includes a filter box where you can type a domain (e.g., "linkedin") to filter events
- External referrers show with a link icon
- "Direct" traffic has no icon

**How Referrers Work**:
- When someone clicks a link from LinkedIn, the referrer will show as `linkedin.com`
- When someone types your URL directly or uses a bookmark, it shows as `Direct`
- Some browsers/apps strip referrers for privacy, these appear as `Direct`
- LinkedIn DMs typically show as `linkedin.com`
- The system automatically normalizes URLs (removes `www.`, extracts domain)

### API Access

You can also access raw statistics via API:

```bash
# Get analytics stats (requires auth if ANALYTICS_PASSWORD is set)
curl -u :your_password https://your-domain.com/analytics/stats
```

## Data Storage Location

All analytics data is stored in:

```
analytics.db
```

This SQLite database file is created automatically in the project root when the first event is tracked.

**Backup**: To preserve analytics data, make sure to backup `analytics.db` file regularly.

## Privacy & GDPR Compliance

This analytics system is designed to be privacy-friendly:

✅ **No external services** - All data stays on your server  
✅ **No cookies** - Uses sessionStorage only  
✅ **Anonymous sessions** - No personally identifiable information  
✅ **No tracking across sites** - Only tracks your domain  
✅ **No IP addresses** - User agent string is stored but not IPs  
✅ **Session-based** - Session IDs reset when browser is closed  
✅ **Referrer tracking** - Uses standard `document.referrer` (browser-provided, no fingerprinting)
✅ **No per-user tracking** - Only aggregate traffic sources, no personalized URLs

**Important Notes About Referrers**:
- Referrers are provided by the browser using the standard `document.referrer` property
- Some browsers block or strip referrers for privacy reasons - these appear as "Direct"
- Private/incognito mode may not send referrers
- HTTPS → HTTP transitions typically strip referrers
- This is NOT user tracking - just showing which websites send traffic to you

**Note**: Depending on your jurisdiction, you may still need to inform users about analytics in your privacy policy.

## Customizing Tracking

### Track Custom Elements

Add `data-track` attribute to any element you want to track:

```html
<button data-track="cta-hero">Request Invitation</button>
<a href="/about" data-track="nav-about">About</a>
```

These clicks will be logged with the element ID or data-track value.

### Disable Tracking for Specific Elements

Analytics automatically tracks all `<a>` and `<button>` clicks. To disable for a specific element, you can handle this in your code by stopping event propagation if needed.

## Testing Analytics

### 1. Visit Your Site

Open your deployed site in a browser (or development with `VITE_ENABLE_ANALYTICS=true`).

### 2. Navigate & Click

- Visit different pages
- Click on links and buttons
- Wait 30+ seconds on a page (to trigger heartbeat)

### 3. Check the Dashboard

Visit `/analytics` to see your tracked events appear in real-time.

### 4. Check Server Logs

When events are received, the server logs will show:
```
POST /analytics/event 204 in Xms
```

## Troubleshooting

### Analytics not tracking?

1. Check if you're in development mode - analytics are disabled by default
2. Set `VITE_ENABLE_ANALYTICS=true` in development
3. Check browser console for any errors
4. Verify `/analytics/event` endpoint is responding (204 status)

### Can't access dashboard?

1. If you set `ANALYTICS_PASSWORD`, make sure you're entering it correctly
2. Try accessing `/analytics/stats` directly via curl with auth
3. Check server logs for authentication errors

### Data not persisting?

1. Check that `analytics.db` file exists in project root
2. Verify SQLite write permissions
3. Check server logs for database errors

## Architecture

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │ 1. Track events (page views, clicks, heartbeats)
       │
       ▼
┌─────────────────────┐
│  /analytics/event   │  ← POST endpoint
│   (Backend API)     │
└──────┬──────────────┘
       │ 2. Store in SQLite
       │
       ▼
┌─────────────────────┐
│   analytics.db      │
│   (SQLite DB)       │
└──────┬──────────────┘
       │ 3. Query for stats
       │
       ▼
┌─────────────────────┐
│  /analytics/stats   │  ← GET endpoint (protected)
│   (Backend API)     │
└──────┬──────────────┘
       │ 4. Display dashboard
       │
       ▼
┌─────────────────────┐
│ /analytics          │
│  (Dashboard UI)     │
└─────────────────────┘
```

## Files Added

- `server/analytics-db.ts` - SQLite database setup and queries
- `server/analytics-routes.ts` - Express routes for tracking and stats
- `client/src/lib/analytics.ts` - Frontend tracking script
- `client/src/pages/AnalyticsDashboard.tsx` - Analytics dashboard UI
- `analytics.db` - SQLite database (created automatically)
- `ANALYTICS_README.md` - This documentation

## Files Modified

- `server/routes.ts` - Registered analytics routes
- `client/src/App.tsx` - Added `/analytics` route and initialized tracking

## Future Enhancements

Potential improvements you could add:

- Email alerts for daily/weekly reports
- Export analytics to CSV
- Funnel tracking for conversion flows
- Geographic data (if you add IP geolocation)
- Device/browser breakdown charts
- Real-time visitor counter
- Custom event tracking API for specific actions
