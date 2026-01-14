/**
 * Google Analytics 4 (GA4) utilities
 * More info: https://developers.google.com/analytics/devguides/collection/ga4
 */

// Initialize Google Analytics 4
export const initializeGA4 = (measurementId: string): void => {
  if (!measurementId) {
    console.warn('Google Analytics 4 measurement ID is missing');
    return;
  }

  // Check if gtag is already defined (might be from Google Ads)
  const isGtagDefined = !!(window as any).gtag;

  // Add GA4 global site tag (gtag.js) if not already loaded
  if (!isGtagDefined) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize the gtag function
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    const gtag = function(...args: any[]) {
      (window.dataLayer as any).push(arguments);
    };
    
    (window as any).gtag = gtag;
    gtag('js', new Date());
  }

  // Configure GA4 with the measurement ID
  (window as any).gtag('config', measurementId, {
    send_page_view: true,
    cookie_flags: 'samesite=none;secure',
  });

  console.log(`Google Analytics 4 initialized with measurement ID: ${measurementId}`);
};

// Track a custom event in GA4
export const trackGA4Event = (
  eventName: string,
  params?: Record<string, any>
): void => {
  if (!(window as any).gtag) {
    console.warn('Google Analytics 4 is not initialized');
    return;
  }

  (window as any).gtag('event', eventName, params || {});
  console.log(`GA4 event tracked: ${eventName}`, params || '');
};

// Track page view manually (useful for SPA navigation)
export const trackGA4PageView = (
  pagePath: string,
  pageTitle?: string
): void => {
  trackGA4Event('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
};

// Helper functions for specific events
export const trackQuizCompletion = (quizResult?: string): void => {
  trackGA4Event('quiz_completed', { quiz_result: quizResult });
};

export const trackCallBooking = (): void => {
  trackGA4Event('call_booked', { source: 'calendly' });
};

export const trackCheckoutStarted = (planName: string, price: number): void => {
  trackGA4Event('begin_checkout', {
    currency: 'USD',
    value: price,
    items: [
      {
        item_id: planName,
        item_name: planName,
        price: price,
        quantity: 1,
      },
    ],
  });
};

export const trackPurchase = (
  transactionId: string,
  planName: string,
  price: number
): void => {
  trackGA4Event('purchase', {
    transaction_id: transactionId,
    currency: 'USD',
    value: price,
    items: [
      {
        item_id: planName,
        item_name: planName,
        price: price,
        quantity: 1,
      },
    ],
  });
};