import { apiRequest } from './queryClient';

/**
 * Generates a unique session ID for the current browser session
 */
function getSessionId(): string {
  // Check if session ID already exists in sessionStorage
  let sessionId = sessionStorage.getItem('sessionId');
  
  // If not, create a new one
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  
  return sessionId;
}

/**
 * Track a page view
 */
export async function trackPageView(path: string): Promise<void> {
  try {
    const sessionId = getSessionId();
    const referrer = document.referrer;
    const userAgent = navigator.userAgent;
    
    await apiRequest('POST', '/api/analytics/page-view', {
      path,
      referrer,
      userAgent,
      sessionId
    });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

/**
 * Track a user event (button click, form submission, etc.)
 */
export async function trackEvent(
  eventType: string,
  eventCategory: string,
  eventAction: string,
  eventLabel?: string,
  eventValue?: number
): Promise<void> {
  try {
    const sessionId = getSessionId();
    const path = window.location.pathname;
    
    await apiRequest('POST', '/api/analytics/event', {
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      path,
      sessionId
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

/**
 * Track a conversion (quiz completion, waitlist signup, checkout, etc.)
 */
export async function trackConversion(
  conversionType: string,
  data?: {
    email?: string;
    planId?: string;
    planName?: string;
    planPrice?: number;
    completed?: boolean;
    customData?: any; // Allow any custom data to be passed
  }
): Promise<void> {
  try {
    const sessionId = getSessionId();
    
    await apiRequest('POST', '/api/analytics/conversion', {
      conversionType,
      ...data,
      sessionId
    });
  } catch (error) {
    console.error('Failed to track conversion:', error);
  }
}

/**
 * Update a conversion's status (e.g. mark checkout as completed)
 */
export async function updateConversionStatus(
  conversionId: number,
  completed: boolean
): Promise<void> {
  try {
    await apiRequest('PATCH', `/api/analytics/conversion/${conversionId}`, {
      completed
    });
  } catch (error) {
    console.error('Failed to update conversion status:', error);
  }
}

/**
 * Helper to track CTA button clicks
 */
export function trackCTAClick(buttonName: string, buttonLocation: string): void {
  trackEvent('click', 'cta', buttonName, buttonLocation);
}

/**
 * Utility to add tracking to an onClick handler
 */
export function withTracking(
  eventCategory: string,
  eventAction: string,
  eventLabel?: string,
  callback?: (...args: any[]) => any
): (...args: any[]) => any {
  return (...args: any[]) => {
    trackEvent('click', eventCategory, eventAction, eventLabel);
    if (callback) {
      return callback(...args);
    }
  };
}