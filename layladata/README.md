# Layla - Data & AI Salon Event

An elegant, atmospheric single-page landing site for Layla, an invitation-only data & AI salon event in Marylebone, London.

## Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQLite (first-party analytics)
- **Hosting**: Replit

## Features

- Cinematic, art gallery-inspired design
- Dark mode optimized
- Custom ethereal data constellation favicon
- LinkedIn integration for hosts
- External registration via Luma platform
- Comprehensive first-party analytics

---

## Analytics

This project includes a complete first-party analytics system with real-time tracking, daily goals, and live verification.

### Features

- **Unique Visitor Tracking**: Uses salted SHA-256 hash of (IP, User-Agent, First-party cookie)
- **Bot Filtering**: Automatically excludes common bots and crawlers
- **Daily Goals**: Track progress toward daily unique visitor goals (default: 150)
- **Live Updates**: Server-Sent Events (SSE) for real-time dashboard updates
- **60-Day History**: Historical charts showing trends over time
- **Privacy-Focused**: First-party only, no external trackers, no fingerprinting

### Setup

#### 1. Environment Variables

Set these in your Replit Secrets or `.env` file:

```bash
# Required
ANALYTICS_SALT=your-random-salt-here      # Used for visitor ID hashing

# Optional
VITE_DAILY_GOAL=150                       # Daily unique visitor goal (frontend)
```

**Note**: The `VITE_` prefix is required for environment variables that need to be accessible in the frontend.

#### 2. Access the Dashboard

Visit: `https://your-repl.replit.app/layla-analytics-aurora-741`

**Security**: This URL is intentionally obscure and not linked from the public site. It can be secured later by adding token authentication (see comments in `server/analytics-routes-v2.ts`).

- Dashboard shows real-time stats, charts, and top pages/referrers
- Includes `<meta name="robots">` tag to prevent search engine indexing
- Listed in `robots.txt` to discourage crawlers

### API Endpoints

#### Public Endpoints

```bash
# Track a page view (called automatically by client beacon)
POST /api/track
Content-Type: application/json

{
  "path": "/",
  "referrer": "https://example.com",
  "ua": "Mozilla/5.0...",
  "screen": { "width": 1920, "height": 1080 },
  "utm_source": "twitter",    // optional
  "utm_medium": "social",     // optional
  "utm_campaign": "launch"    // optional
}

# Health check
GET /api/health
```

#### Analytics Endpoints (Currently Unprotected)

```bash
# Get analytics summary
GET /api/analytics/summary

# Get recent hits (for debugging)
GET /api/analytics/recent?limit=50

# Live SSE stream (for real-time updates)
GET /api/analytics/stream
```

**Note**: These endpoints are currently open but can be secured later by uncommenting the `requireToken` middleware in `server/analytics-routes-v2.ts` and setting the `ANALYTICS_TOKEN` environment variable.

### Testing Analytics

#### In Browser Console

Test the tracking beacon:

```javascript
fetch('/api/track', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: '/test',
    referrer: document.referrer,
    ua: navigator.userAgent
  })
})
```

#### Via cURL

```bash
# Track a test page view
curl -X POST https://your-repl.replit.app/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/test",
    "referrer": "https://example.com",
    "ua": "curl/7.68.0"
  }'

# Get analytics summary (requires token)
curl -X GET https://your-repl.replit.app/api/analytics/summary \
  -H "Authorization: Bearer your-token-here"

# Get recent hits (requires token)
curl -X GET "https://your-repl.replit.app/api/analytics/recent?limit=10" \
  -H "Authorization: Bearer your-token-here"
```

### Dashboard Features

- **All-Time Uniques**: Total unique visitors since tracking began
- **Today's Uniques**: Unique visitors today with progress bar to daily goal
- **Today's Page Views**: Total page views today
- **Live Visitors**: Active visitors in the last 5 minutes
- **60-Day Chart**: Daily uniques trend with goal reference line
- **Top Pages**: Most visited pages in last 7 days
- **Top Referrers**: Traffic sources in last 7 days
- **Live Indicator**: Shows "LIVE" when SSE connection is active
- **Debug Panel**: Recent hits with visitor IDs, paths, and referrers

### Data Schema

#### Visitors Table
```sql
CREATE TABLE visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen DATETIME NOT NULL,
  last_seen DATETIME NOT NULL
);
```

#### Hits Table
```sql
CREATE TABLE hits (
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
```

### Privacy & Security

- **First-Party Only**: No external analytics services or trackers
- **No Fingerprinting**: Uses standard cookies and headers only
- **Bot Filtering**: Automatically excludes bot traffic from metrics
- **Token Protection**: Admin routes require bearer token authentication
- **Salted Hashing**: Visitor IDs are salted SHA-256 hashes (not reversible)
- **Cookie Expiry**: LAYLA_VID cookie expires after 365 days

### Database Location

Analytics data is stored in: `data/analytics.sqlite`

The database persists across restarts and includes:
- All visitor records
- All hit records with timestamps
- Automatic cleanup of old data (handled by SQLite)

---

## Development

```bash
npm install
npm run dev
```

Visit: `http://localhost:5000`

## Environment Variables

```bash
SESSION_SECRET=your-session-secret
ANALYTICS_SALT=your-analytics-salt          # For visitor ID hashing (required)
VITE_DAILY_GOAL=150                         # Daily unique visitor goal (optional)
```

## Deployment

This project is designed to run on Replit. Simply push changes and the deployment will update automatically.

## License

Private event site - All rights reserved.
