/**
 * Reddit Pixel integration
 * 
 * This module provides functions for initializing and tracking events with the Reddit Pixel.
 * Documentation: https://ads.reddit.com/help/#en/setting-up-your-reddit-pixel
 */

interface Window {
  rdt?: {
    pixelId?: string;
    callQueue?: any[];
    track?: (event: string, data?: any) => void;
    trackCustom?: (event: string, data?: any) => void;
    init?: (pixelId: string) => void;
  };
}

/**
 * Initialize the Reddit Pixel
 * @param pixelId The Reddit Pixel ID to initialize
 */
export const initializeRedditPixel = (pixelId: string): void => {
  if (!pixelId) {
    console.warn('Reddit Pixel ID is required but was not provided');
    return;
  }

  console.log(`Initializing Reddit Pixel with ID: ${pixelId}`);
  
  // Initialize the Reddit Pixel code
  const w = window as any;
  const d = document;
  
  if (!w.rdt) {
    // Create a basic stub that will collect calls until the script loads
    w.rdt = {
      callQueue: [],
      pixelId: pixelId,
      cmd: function() {
        w.rdt.callQueue.push(arguments);
      }
    };
    
    // Load the Reddit pixel script
    const script = d.createElement('script');
    script.async = true;
    script.src = 'https://www.redditstatic.com/ads/pixel.js';
    
    if (d.head) d.head.appendChild(script);
  }
  
  window.rdt = window.rdt || { pixelId, callQueue: [] };
  window.rdt.init = window.rdt.init || ((pixelId: string, options?: any) => {
    console.log(`Reddit Pixel initialized with ID: ${pixelId}`, options || {});
  });
  
  // Initialize the pixel with domain information
  const domain = window.location.hostname;
  window.rdt.init(pixelId, {
    domain: domain,
    source_url: window.location.href
  });
  
  console.log('Reddit Pixel initialized with ID:', pixelId, 'on domain:', domain);
};

/**
 * Track a standard event with the Reddit Pixel
 * @param eventName The name of the event to track
 * @param params Additional parameters to send with the event
 */
export const trackRedditPixelEvent = (eventName: string, params?: Record<string, any>): void => {
  if (window.rdt && window.rdt.track) {
    try {
      // Add domain information to every event
      const domain = window.location.hostname;
      const enhancedParams = {
        ...params,
        domain: domain,
        source_url: window.location.href,
        path: window.location.pathname
      };
      
      window.rdt.track(eventName, enhancedParams);
      console.log(`Reddit Pixel event tracked: ${eventName}`, enhancedParams);
    } catch (error) {
      console.error('Error tracking Reddit Pixel event:', error);
    }
  } else {
    console.warn('Reddit Pixel not available to track event:', eventName);
  }
};

/**
 * Track a page view event
 * @param path The path being viewed
 */
export const trackRedditPageView = (path: string): void => {
  // Create a conversion ID that will be used for both client and server tracking
  const conversionId = `pageview___${Date.now()}`;
  trackRedditPixelEvent('PageVisit', { 
    content_name: path,
    conversion_id: conversionId // Add conversion ID for deduplication
  });
};

/**
 * Track a lead event (e.g., call booking, form signup)
 * @param value Optional monetary value of the lead
 * @param currency Optional currency code (default: GBP)
 * @param params Additional parameters to send with the event
 */
export function trackRedditLead(params: Record<string, any>): void;
export function trackRedditLead(value?: number, currency?: string, params?: Record<string, any>): void;
export function trackRedditLead(valueOrParams?: number | Record<string, any>, currencyOrUndefined?: string, extraParams?: Record<string, any>): void {
  // Create a conversion ID that will be used for both client and server tracking
  const conversionId = `lead___${Date.now()}`;
  
  // Handle overloaded function
  if (typeof valueOrParams === 'object') {
    // First overload: Single params object
    const enrichedParams = {
      ...valueOrParams,
      conversion_id: conversionId // Add the same conversion ID for deduplication
    };
    trackRedditPixelEvent('Lead', enrichedParams);
  } else {
    // Second overload: value, currency, params
    const value = valueOrParams;
    const currency = currencyOrUndefined || 'GBP';
    
    trackRedditPixelEvent('Lead', {
      value,
      currency,
      conversion_id: conversionId, // Add the same conversion ID for deduplication
      ...extraParams
    });
  }
};

/**
 * Track a purchase completion event
 * @param value The monetary value of the purchase
 * @param currency The currency code (default: GBP)
 * @param transactionId Optional transaction ID for deduplication
 * @param params Additional parameters to send with the event
 */
export function trackRedditPurchase(params: Record<string, any>): void;
export function trackRedditPurchase(
  value: number,
  currency?: string,
  transactionId?: string,
  params?: Record<string, any>
): void;
export function trackRedditPurchase(
  valueOrParams: number | Record<string, any>,
  currencyOrUndefined?: string,
  transactionIdOrUndefined?: string,
  extraParams?: Record<string, any>
): void {
  // For purchases, we use the transaction ID as the conversion ID,
  // or generate a new one if not provided
  const conversionId = (typeof valueOrParams === 'object' && valueOrParams.transaction_id) ? 
    valueOrParams.transaction_id : 
    (transactionIdOrUndefined || `purchase___${Date.now()}`);
  
  // Handle overloaded function
  if (typeof valueOrParams === 'object') {
    // First overload: Single params object
    const enrichedParams = {
      ...valueOrParams,
      conversion_id: conversionId // Add conversion ID for deduplication
    };
    trackRedditPixelEvent('Purchase', enrichedParams);
  } else {
    // Second overload: value, currency, transactionId, params
    const value = valueOrParams;
    const currency = currencyOrUndefined || 'GBP';
    
    trackRedditPixelEvent('Purchase', {
      value,
      currency,
      transaction_id: conversionId,
      conversion_id: conversionId, // Use the same ID for deduplication
      ...extraParams
    });
  }
};

/**
 * Track a custom event with the Reddit Pixel
 * @param eventName The name of the custom event
 * @param params Additional parameters to send with the event
 */
export const trackRedditCustomEvent = (eventName: string, params?: Record<string, any>): void => {
  // Create a unique conversion ID for this event
  const conversionId = params?.conversion_id || `custom_${eventName.replace(/\s+/g, '_').toLowerCase()}___${Date.now()}`;
  
  if (window.rdt && window.rdt.track) {
    try {
      window.rdt.track('Custom', {
        customEventName: eventName,
        conversion_id: conversionId, // Add conversion ID for deduplication
        ...params
      });
      console.log(`Reddit Pixel custom event tracked: ${eventName}`, {
        conversion_id: conversionId,
        ...(params || {})
      });
    } catch (error) {
      console.error('Error tracking Reddit Pixel custom event:', error);
    }
  } else {
    console.warn('Reddit Pixel not available to track custom event:', eventName);
  }
};

/**
 * Track a quiz completion event
 * @param result The result of the quiz (if applicable)
 */
export const trackRedditQuizCompleted = (result?: string): void => {
  trackRedditCustomEvent('quiz_completed', { quiz_result: result });
};

/**
 * Track when user books a call
 */
export const trackRedditBookCall = (): void => {
  trackRedditLead(undefined, 'GBP', { lead_type: 'call_booking' });
};

/**
 * Track when checkout is initiated
 * @param value The monetary value of the cart
 * @param currency The currency code (default: GBP)
 */
export const trackRedditInitiateCheckout = (value: number, currency: string = 'GBP'): void => {
  trackRedditCustomEvent('checkout_started', { value, currency });
};

/**
 * Track signup event
 * @param email Optional email for improved tracking
 */
export const trackRedditSignup = (email?: string): void => {
  const params: Record<string, any> = { lead_type: 'registration' };
  if (email) params.email = email;
  trackRedditLead(params);
};

/**
 * Track qualification check event
 * @param result Optional qualification result
 */
export const trackRedditQualificationCheck = (result?: string): void => {
  trackRedditCustomEvent('qualification_check', { qualification_result: result });
};

/**
 * Track try demo event
 * @param demoType Optional type of demo being tried
 */
export const trackRedditTryDemo = (demoType?: string): void => {
  trackRedditCustomEvent('try_demo', { demo_type: demoType });
};

/**
 * Test the Reddit Conversions API (server-side tracking)
 * This will call the endpoint that tests all conversion types
 * @returns Promise<Response> the API response
 */
export const testRedditConversionsApi = async (): Promise<Response> => {
  try {
    console.log('Testing Reddit Conversions API...');
    return await fetch('/api/test/reddit');
  } catch (error) {
    console.error('Error testing Reddit Conversions API:', error);
    throw error;
  }
};