/**
 * Client-side tracking beacon for first-party analytics
 * Automatically tracks page views on load and SPA navigation
 */

// Extract UTM parameters from URL
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}

// Track a page view
export async function trackPageView(path?: string) {
  try {
    const currentPath = path || window.location.pathname;
    const utm = getUTMParams();
    
    await fetch('/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: currentPath,
        referrer: document.referrer,
        ua: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
        },
        ...utm,
      }),
    });
  } catch (error) {
    // Silently fail - don't break the page
    console.error('Tracking error:', error);
  }
}

// Initialize tracking
export function initializeTracking() {
  // Track initial page view
  trackPageView();

  // Track SPA navigation (for wouter or other client-side routing)
  let lastPath = window.location.pathname;
  
  setInterval(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      lastPath = currentPath;
      trackPageView(currentPath);
    }
  }, 500);

  // Also listen for popstate (back/forward buttons)
  window.addEventListener('popstate', () => {
    trackPageView();
  });
}
