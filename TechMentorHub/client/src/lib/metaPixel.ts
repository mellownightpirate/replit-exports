/**
 * Meta Pixel (Facebook/Instagram) tracking utilities
 * More info: https://developers.facebook.com/docs/meta-pixel/
 */

// Initialize Meta Pixel
export const initializeMetaPixel = (pixelId: string): void => {
  if (!pixelId) {
    console.warn('Meta Pixel ID is missing');
    return;
  }

  // Only initialize once
  if ((window as any).fbq) return;

  // Add Meta Pixel base code (standard Meta script with proper TypeScript typing)
  // This is Meta's standard tracking code with TypeScript adjustments
  const f = window as any;
  const b = document;
  
  if (f.fbq) return;
  
  f.fbq = function() {
    const callMethod = f.fbq.callMethod;
    if (callMethod) {
      callMethod.apply(f.fbq, arguments);
    } else {
      f.fbq.queue.push(arguments);
    }
  };
  
  if (!f._fbq) f._fbq = f.fbq;
  f.fbq.push = f.fbq;
  f.fbq.loaded = true;
  f.fbq.version = '2.0';
  f.fbq.queue = [];
  
  const t = document.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const s = document.getElementsByTagName('script')[0];
  if (s && s.parentNode) {
    s.parentNode.insertBefore(t, s);
  }

  // Initialize with the pixel ID
  (window as any).fbq('init', pixelId);
  
  // Track page view when initialized
  (window as any).fbq('track', 'PageView');
  
  console.log(`Meta Pixel initialized with ID: ${pixelId}`);
};

// Track standard Meta Pixel events
export const trackMetaPixelEvent = (eventName: string, params?: Record<string, any>): void => {
  if (!(window as any).fbq) {
    console.warn('Meta Pixel is not initialized');
    return;
  }
  
  if (params) {
    (window as any).fbq('track', eventName, params);
  } else {
    (window as any).fbq('track', eventName);
  }
  
  console.log(`Meta Pixel event tracked: ${eventName}`, params || '');
};

// Track custom Meta Pixel events
export const trackMetaPixelCustomEvent = (eventName: string, params?: Record<string, any>): void => {
  if (!(window as any).fbq) {
    console.warn('Meta Pixel is not initialized');
    return;
  }
  
  if (params) {
    (window as any).fbq('trackCustom', eventName, params);
  } else {
    (window as any).fbq('trackCustom', eventName);
  }
  
  console.log(`Meta Pixel custom event tracked: ${eventName}`, params || '');
};

// Standard event helpers
export const trackMetaPixelConversion = (value?: number, currency?: string): void => {
  trackMetaPixelEvent('CompleteRegistration', { 
    value: value || 0, 
    currency: currency || 'USD',
    content_name: 'conversion'
  });
};

export const trackMetaPixelLead = (value?: number, currency?: string): void => {
  trackMetaPixelEvent('Lead', { 
    value: value || 0, 
    currency: currency || 'USD',
    content_name: 'lead'
  });
};

export const trackMetaPixelQuizCompleted = (): void => {
  trackMetaPixelCustomEvent('QuizCompleted');
};

export const trackMetaPixelBookCall = (): void => {
  trackMetaPixelCustomEvent('BookCall');
};

export const trackMetaPixelInitiateCheckout = (value?: number, currency?: string): void => {
  trackMetaPixelEvent('InitiateCheckout', {
    value: value || 0,
    currency: currency || 'USD'
  });
};

export const trackMetaPixelPurchase = (value: number, currency?: string): void => {
  trackMetaPixelEvent('Purchase', {
    value,
    currency: currency || 'USD'
  });
};