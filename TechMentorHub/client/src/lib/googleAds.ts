/**
 * Google Ads conversion tracking utilities
 * More info: https://support.google.com/google-ads/answer/6095821
 */

// Initialize Google Ads conversion tracking
export const initializeGoogleAdsTracking = (conversionId: string): void => {
  if (!conversionId) {
    console.warn('Google Ads conversion ID is missing');
    return;
  }

  // Only initialize once
  if ((window as any).gtag) return;

  // Add Google Ads global site tag (gtag.js)
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
  document.head.appendChild(script);

  // Initialize the gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    (window.dataLayer as any).push(arguments);
  }
  (window as any).gtag = gtag;

  gtag('js', new Date());
  gtag('config', conversionId);

  console.log(`Google Ads tracking initialized with ID: ${conversionId}`);
};

// Track a Google Ads conversion
export const trackGoogleAdsConversion = (
  conversionId: string,
  conversionLabel: string,
  value?: number,
  currency?: string,
  transactionId?: string
): void => {
  if (!(window as any).gtag) {
    console.warn('Google Ads tracking is not initialized');
    return;
  }

  const params: Record<string, any> = {
    'send_to': `${conversionId}/${conversionLabel}`,
  };

  if (value !== undefined) {
    params.value = value;
    params.currency = currency || 'GBP';
  }
  
  if (transactionId) {
    params.transaction_id = transactionId;
  }

  (window as any).gtag('event', 'conversion', params);
  console.log(`Google Ads conversion tracked: ${conversionLabel}`, params);
};

// Helper functions for specific conversions
export const trackQuizCompletion = (
  conversionId: string,
  conversionLabel: string
): void => {
  trackGoogleAdsConversion(conversionId, conversionLabel);
};

export const trackCallBooking = (
  conversionId: string,
  conversionLabel: string
): void => {
  trackGoogleAdsConversion(conversionId, conversionLabel);
};

export const trackPurchase = (
  conversionId: string,
  conversionLabel: string,
  value: number,
  currency?: string,
  transactionId?: string
): void => {
  trackGoogleAdsConversion(conversionId, conversionLabel, value, currency, transactionId);
};

/**
 * Special Google Ads Purchase Conversion function that uses the exact conversion code provided
 * This implements the exact snippet provided by Google Ads
 */
export const trackPurchaseWithCallback = (url?: string, value: number = 1.0, transactionId: string = ''): void => {
  if (!(window as any).gtag) {
    console.warn('Google Ads tracking is not initialized');
    return;
  }

  // Log the conversion tracking for debugging
  console.log('Tracking Purchase Conversion with callback:', { value, transactionId, url });

  // Define the callback function for redirection
  const callback = function() {
    if (typeof url !== 'undefined') {
      window.location.href = url;
    }
  };

  // Use the exact conversion tag format provided by Google Ads
  (window as any).gtag('event', 'conversion', {
    'send_to': 'AW-16998722263/PCc2CKKwj7caENfVz6k_',
    'value': value,
    'currency': 'GBP',
    'transaction_id': transactionId,
    'event_callback': callback
  });
};

// Type declarations for window object
declare global {
  interface Window {
    dataLayer: any[];
  }
}