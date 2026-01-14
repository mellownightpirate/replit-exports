/**
 * Layla Analytics Tracker
 * 
 * Features:
 * - Automatic page view tracking
 * - Session and visitor ID management via cookies
 * - UTM parameter capture and persistence
 * - Click tracking for ticket links
 * - No-JS fallback via tracking pixel
 */

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const COOKIE_VID = 'layla_vid';
const COOKIE_SID = 'layla_sid';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Cookie helpers
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${value};max-age=${maxAge};path=/;samesite=lax`;
}

// Get or create visitor ID (1 year)
function getVisitorID(): string {
  let vid = getCookie(COOKIE_VID);
  if (!vid) {
    vid = uuidv4();
    setCookie(COOKIE_VID, vid, 365 * 24 * 60 * 60); // 1 year
  }
  return vid;
}

// Get or create session ID (30 minutes idle timeout)
function getSessionID(): string {
  let sid: string | null = getCookie(COOKIE_SID);
  const lastActivity = localStorage.getItem('layla_last_activity');
  const now = Date.now();

  // Check if session expired (30 minutes idle)
  if (sid && lastActivity) {
    const timeSinceActivity = now - parseInt(lastActivity, 10);
    if (timeSinceActivity > SESSION_TIMEOUT) {
      sid = null; // Expire session
    }
  }

  if (!sid) {
    sid = uuidv4();
  }
  
  setCookie(COOKIE_SID, sid, SESSION_TIMEOUT / 1000); // 30 minutes
  localStorage.setItem('layla_last_activity', now.toString());
  return sid;
}

// Capture and persist UTM parameters
function captureUTMs(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    const value = params.get(key);
    if (value) {
      utms[key] = value;
      localStorage.setItem(key, value);
    } else {
      // Try to get from localStorage
      const stored = localStorage.getItem(key);
      if (stored) {
        utms[key] = stored;
      }
    }
  });

  return utms;
}

// Get referrer (only capture on first page of session)
function getReferrer(): string | undefined {
  const sessionReferrer = sessionStorage.getItem('layla_referrer');
  if (sessionReferrer) {
    return sessionReferrer;
  }

  const referrer = document.referrer;
  if (referrer && !referrer.includes(window.location.hostname)) {
    sessionStorage.setItem('layla_referrer', referrer);
    return referrer;
  }

  return undefined;
}

// Track event
async function trackEvent(event: string, path: string, meta?: any) {
  try {
    const vid = getVisitorID();
    const sid = getSessionID();
    const utms = captureUTMs();
    const referrer = getReferrer();

    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        path,
        vid,
        sid,
        utms: Object.keys(utms).length > 0 ? utms : undefined,
        referrer,
        userAgent: navigator.userAgent,
        meta,
      }),
      keepalive: true, // Important for page unload events
    });
  } catch (error) {
    // Silent failure - don't break user experience
    console.error('Tracking error:', error);
  }
}

// Track page view
export function trackPageView(path?: string) {
  const currentPath = path || window.location.pathname;
  trackEvent('page_view', currentPath);
}

// Track ticket click
export function trackTicketClick() {
  trackEvent('click_ticket', '/out/tickets');
}

// Initialize tracker
export function initializeTracker() {
  // Track initial page view
  trackPageView();

  // Track page views on navigation (for SPAs)
  let lastPath = window.location.pathname;
  const checkPathChange = () => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackPageView(currentPath);
    }
  };

  // Monitor for navigation changes
  window.addEventListener('popstate', checkPathChange);
  
  // Also check periodically (handles pushState/replaceState)
  setInterval(checkPathChange, 1000);

  // Add click listener for ticket links to append tracking params
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a[data-ticket-link]') as HTMLAnchorElement;
    
    if (link) {
      e.preventDefault();
      
      // Build redirect URL with tracking params
      // The /out/tickets endpoint will handle the actual click tracking
      const vid = getVisitorID();
      const sid = getSessionID();
      const utms = captureUTMs();
      
      const params = new URLSearchParams({
        vid,
        sid,
        ...utms,
      });

      // Navigate to /out/tickets with params - server will track click
      window.location.href = `/out/tickets?${params.toString()}`;
    }
  });

  // Track before page unload
  window.addEventListener('beforeunload', () => {
    // Update session cookie on unload to keep session alive
    const sid = getSessionID();
    if (sid) {
      setCookie(COOKIE_SID, sid, SESSION_TIMEOUT / 1000);
    }
  });
}

// Export for manual use if needed
export { trackEvent };
