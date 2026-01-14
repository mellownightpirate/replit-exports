# Layla Event Landing Page

## Overview

Layla is an invitation-only data and AI salon event in Marylebone, London. This is a single-page landing site with a dark, cinematic aesthetic inspired by art galleries and private exhibition invitations. The site targets senior data leaders, product professionals, and artists working with data, emphasizing an intimate, candlelit atmosphere rather than typical corporate networking events.

The application is built as a full-stack web application with React frontend, Express backend, and includes a comprehensive first-party analytics system for tracking visitor behavior without external services.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (alternative to React Router)
- TailwindCSS for styling with custom dark mode theme
- Radix UI components for accessible UI primitives

**Design Philosophy**
- Dark, atmospheric aesthetic with amber/gold accents
- Mobile-first responsive design
- Component-based architecture with clear separation of concerns
- Multi-page application with navigation (landing, past events, analytics dashboard)

**Pages & Routes**
- `/` - Landing page with video hero background
- `/past-events` - Past events page with Salon 001 write-up and 24-image gallery
- `/layla-analytics-aurora-741` - Private analytics dashboard

**Key Components**
- `LandingPage`: Main event page with video hero background
- `Hero`: Video background with autoplay, muted, loop; poster fallback for reduced-motion or autoplay failure
- `Navigation`: Fixed header with links to Home and Past Events
- `PastEvents`: Event write-up with responsive image gallery and lightbox
- Section components: AtmosphereSection, WhoSection, EventDetails, HostsSection, InvitationForm, Footer
- `AnalyticsDashboardV3`: Goal-oriented analytics dashboard with funnel tracking
- Tracking system initializes on app mount via `useEffect` hook

**Media Assets**
- Hero video: `public/assets/hero/layla-hero.mp4` (75MB MP4)
- Hero poster: `public/assets/hero/layla-hero-poster.png`
- Gallery images: `public/assets/past-events/layla-salon-001/image-01.jpg` through `image-24.jpg`
- Configurable video URL via `VITE_HERO_VIDEO_URL` environment variable

### Backend Architecture

**Server Framework**
- Express.js (Node.js) with TypeScript
- Cookie-parser middleware for session management
- Trust proxy enabled for accurate IP detection behind reverse proxies

**Routing Structure**
- `/api/submit-invitation` - POST endpoint for invitation form submissions
- `/api/submissions` - GET endpoint to retrieve all submissions (unprotected)
- `/api/track` - POST endpoint for analytics event tracking
- `/api/analytics/summary` - GET endpoint for analytics dashboard data (token-protected)
- `/api/analytics/recent` - GET endpoint for recent visitor hits (token-protected)
- `/api/analytics/stream` - SSE endpoint for real-time analytics updates (token-protected)

**Authentication & Security**
- Token-based authentication for analytics routes via `ANALYTICS_TOKEN` environment variable
- Bearer token in Authorization header or query parameter for SSE endpoints
- Basic password protection pattern exists but is secondary to token auth
- No authentication on submission viewing endpoint (security gap)

### Data Storage Solutions

**Analytics Database (SQLite)**
- File: `data/analytics.sqlite`
- WAL mode enabled for better concurrency
- Schema includes:
  - `visitors` table: tracks unique visitors with first/last seen timestamps
  - `hits` table: logs every page view with path, referrer, user agent, bot detection, UTM parameters
- Indexes on timestamp, path, and visitor_id for query performance

**Visitor Identification**
- Unique visitor ID generated as SHA-256 hash of: `ANALYTICS_SALT + IP + User-Agent + Cookie`
- First-party cookie `LAYLA_VID` stored with HttpOnly=false, SameSite=Lax
- Bot filtering based on user agent patterns (bot, spider, crawler, headlesschrome)
- Daily unique visitor deduplication by date + visitor_id combination

**Invitation Submissions (In-Memory)**
- `MemStorage` class implements in-memory storage
- Data stored in JavaScript Map objects
- **Critical limitation**: All data lost on server restart
- No persistence mechanism currently implemented
- Schema defined in `shared/schema.ts` using Drizzle ORM patterns (PostgreSQL schema exists but not used)

### Analytics System Architecture

**Tracking Mechanism**
- Client-side beacon sends POST requests to `/api/track` on:
  - Initial page load
  - SPA navigation (path changes)
- Tracks: page path, referrer, user agent, screen dimensions, UTM parameters
- Silent failure model: errors don't break user experience

**Metrics Calculated**
- All-time unique visitors
- Today's unique visitors with progress toward daily goal (default: 150)
- 60-day historical trend data
- Top pages by unique visitors (7-day window)
- Top referrers by pageviews (7-day window)
- Live visitor count (concurrent sessions)

**Real-Time Updates**
- Server-Sent Events (SSE) stream for live dashboard updates
- Pushes new visitor count whenever non-bot hit is recorded
- Client automatically reconnects on connection loss

**Referrer Tracking**
- Full referrer URL captured from `document.referrer`
- Domain extraction and normalization (removes www. prefix)
- "Direct" label when referrer is empty or unavailable
- Aggregated reporting by source domain

### External Dependencies

**Third-Party Services**
- **Luma**: External event registration platform (luma.com/ty04bhmg) - linked from invitation form
- **LinkedIn**: Social integration for event host profiles

**NPM Packages (Key Dependencies)**
- `better-sqlite3`: SQLite database driver
- `express`: Web server framework
- `@tanstack/react-query`: Data fetching and caching for React
- `recharts`: Chart library for analytics dashboard visualizations
- `@radix-ui/*`: Headless UI component primitives
- `tailwindcss`: Utility-first CSS framework
- `wouter`: Lightweight routing
- `zod`: Schema validation for API requests
- `drizzle-orm` + `@neondatabase/serverless`: Database ORM (configured but not actively used)

**Environment Variables Required**
- `ANALYTICS_TOKEN`: Protects analytics admin routes (optional, commented out by default)
- `ANALYTICS_SALT`: Salt for visitor ID hashing (required for privacy)
- `VITE_DAILY_GOAL`: Daily unique visitor goal for dashboard (default: 150)
- `VITE_ENABLE_ANALYTICS`: Enable tracking in development mode (optional)
- `LUMA_WEBHOOK_SECRET`: Secret for validating Luma purchase webhooks (recommended for production)
- `LUMA_REDIRECT_TOKEN`: Optional token for validating /thank-you page access (additional security)
- `DATABASE_URL`: PostgreSQL connection (configured but unused, SQLite is primary DB)

**Security Notes**
- Purchase webhook (`/webhooks/luma`) validates `x-luma-signature` or `Authorization` header against `LUMA_WEBHOOK_SECRET`
- If `LUMA_WEBHOOK_SECRET` is not set, webhook logs a warning but accepts requests (development mode)
- Thank-you page (`/thank-you`) optionally validates `token` query parameter against `LUMA_REDIRECT_TOKEN`
- Without these secrets, purchase tracking can be spoofed - recommended to set in production

**Hosting & Deployment**
- Designed for Replit deployment
- Vite plugins specific to Replit environment (cartographer, dev-banner, runtime-error-modal)
- Build process: Vite builds client, esbuild bundles server
- Production server serves static files from `dist/public`