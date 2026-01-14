/**
 * First-party analytics tracker
 * 
 * Privacy-friendly, no external services, no cookies, just a session ID in sessionStorage
 */

// Only track in production or if explicitly enabled
const isDev = import.meta.env.DEV;
const trackingEnabled = !isDev || import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

/**
 * Get or create anonymous session ID
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Send event to analytics backend
 */
async function sendEvent(event: {
  event_type: 'page_view' | 'click' | 'heartbeat';
  url: string;
  referrer?: string;
  element_id?: string;
  element_text?: string;
}) {
  if (!trackingEnabled) return;
  
  try {
    await fetch('/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        timestamp: Date.now(),
      }),
      // Don't wait for response, fire-and-forget
      keepalive: true,
    });
  } catch (error) {
    // Silently fail - don't break the user experience
    console.debug('Analytics event failed:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView() {
  sendEvent({
    event_type: 'page_view',
    url: window.location.pathname + window.location.search,
    referrer: document.referrer || undefined,
  });
}

/**
 * Track click on element
 */
export function trackClick(element: HTMLElement) {
  const elementId = element.id || element.getAttribute('data-track') || undefined;
  const elementText = element.textContent?.trim().substring(0, 100) || undefined;
  
  sendEvent({
    event_type: 'click',
    url: window.location.pathname + window.location.search,
    element_id: elementId,
    element_text: elementText,
  });
}

/**
 * Track time on page with heartbeat
 */
let heartbeatInterval: number | undefined;

export function startHeartbeat() {
  // Send heartbeat every 30 seconds to track time on page
  heartbeatInterval = window.setInterval(() => {
    sendEvent({
      event_type: 'heartbeat',
      url: window.location.pathname + window.location.search,
    });
  }, 30000); // 30 seconds
}

export function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
}

/**
 * Initialize analytics tracking
 */
export function initAnalytics() {
  if (!trackingEnabled) {
    console.debug('Analytics disabled in development mode');
    return;
  }
  
  // Track initial page view
  trackPageView();
  
  // Start heartbeat
  startHeartbeat();
  
  // Track clicks on elements with data-track attribute or key interactive elements
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    
    // Track if element has data-track attribute
    if (target.hasAttribute('data-track')) {
      trackClick(target);
      return;
    }
    
    // Track clicks on links and buttons
    const clickableElement = target.closest('a, button');
    if (clickableElement) {
      trackClick(clickableElement as HTMLElement);
    }
  });
  
  // Track when user leaves page
  window.addEventListener('beforeunload', () => {
    stopHeartbeat();
  });
  
  // Track visibility changes (when user switches tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopHeartbeat();
    } else {
      startHeartbeat();
    }
  });
}
