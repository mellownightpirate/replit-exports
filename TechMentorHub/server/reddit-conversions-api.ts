import fetch from 'node-fetch';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Reddit Conversions API endpoint from documentation
const REDDIT_API_ENDPOINT = 'https://ads-api.reddit.com/api/v2.0/conversions/events';
const REDDIT_PIXEL_ID = process.env.VITE_REDDIT_PIXEL_ID || 'a2_gtxp2aek62bn';
const REDDIT_API_TOKEN = process.env.REDDIT_CONVERSIONS_API_TOKEN;

// Interface matching Reddit's exact API spec from the documentation with enhanced parameters
// Simplest possible Reddit event definition that works with their API
interface RedditConversionEvent {
  event_at: string; // ISO 8601 date and time (must be within the last 7 days)
  event_type: {
    tracking_type: string; // Standard event type or "Custom"
    custom_event_name?: string; // Only required for Custom events
  };
  user?: {
    ip_address?: string; // User's IP address
    user_agent?: string; // User's browser agent
    external_id?: string; // Your CRM ID for the user
    email?: string; // Hashed email address
  };
  event_metadata?: {
    value_decimal?: number; // Value of the transaction
    currency?: string; // ISO 4217 3-letter currency code
  };
  click_id?: string; // Reddit click ID for attribution
}

/**
 * Hash an email address for secure transmission
 * @param email The email address to hash
 * @returns SHA256 hash of the lowercased, trimmed email
 */
function hashEmail(email: string): string {
  if (!email) return '';
  const normalizedEmail = email.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalizedEmail).digest('hex');
}

/**
 * Send a conversion event to Reddit Conversions API
 * 
 * @param eventType The event type (e.g. 'PageVisit', 'Lead', 'Purchase')
 * @param conversionId A unique identifier for this conversion to prevent duplicates
 * @param userIp The user's IP address (optional but recommended)
 * @param userAgent The user's browser agent (optional but recommended)
 * @param customProperties Any additional properties to include with the event
 * @returns Promise<Response>
 */
export async function sendRedditConversion(
  eventType: string,
  conversionId: string,
  userIp?: string,
  userAgent?: string,
  customProperties?: Record<string, any>,
  domain?: string // New parameter to specify the domain
): Promise<any> {
  if (!REDDIT_PIXEL_ID) {
    console.error('Reddit Pixel ID is missing');
    return null;
  }

  const websiteDomain = domain || process.env.WEBSITE_DOMAIN || 'nextchapter-mentoring.replit.app';

  // Create the event object with the absolute bare minimum required fields
  const event: RedditConversionEvent = {
    event_at: new Date().toISOString(), // ISO 8601 date format as required
    event_type: {
      tracking_type: eventType === 'Custom' ? 'Custom' : eventType
    },
    click_id: customProperties?.click_id || undefined,
  };
  
  // Store domain/URL information in properties since we can't put it in the CAPI event
  const source = {
    domain: websiteDomain,
    path: customProperties?.path || '/',
    convId: conversionId
  };
  console.log('Event source info (not sent to Reddit API):', source);

  // For custom events, add the custom_event_name property
  if (eventType === 'Custom' && customProperties?.customEventName) {
    event.event_type.custom_event_name = customProperties.customEventName;
  }

  // Only add user data if we have IP or user agent
  if (userIp || userAgent || customProperties?.email) {
    event.user = {};
    if (userIp) event.user.ip_address = userIp;
    if (userAgent) event.user.user_agent = userAgent;
    
    // Only add email if provided (hashed for privacy)
    if (customProperties?.email) {
      event.user.email = hashEmail(customProperties.email);
    }
    
    // Only add user ID if provided
    if (customProperties?.userId) {
      event.user.external_id = customProperties.userId;
    }
  }
  
  // Add value and currency to event_metadata for Purchase events
  if (eventType === 'Purchase' && customProperties?.value) {
    // Initialize event_metadata if needed
    if (!event.event_metadata) {
      event.event_metadata = {};
    }
    
    // Add value in the correct format
    if (typeof customProperties.value === 'number') {
      event.event_metadata.value_decimal = customProperties.value;
    } else if (typeof customProperties.value === 'string') {
      event.event_metadata.value_decimal = parseFloat(customProperties.value);
    }
    
    // Add currency if provided, otherwise use GBP
    event.event_metadata.currency = customProperties?.currency || 'GBP';
  }

  // Format the event payload according to Reddit's API requirements
  const payload = {
    test_mode: false, // Set to false to make events appear in Reddit's dashboard
    events: [event]
  };

  try {
    // Always log the event details for debugging
    console.log('Reddit Conversions API event sending:', {
      eventType,
      conversionId,
      userInfo: { 
        ip: userIp ? '(redacted for privacy)' : 'not provided',
        userAgent: userAgent ? 'provided' : 'not provided'
      },
      pixelId: REDDIT_PIXEL_ID
    });
    
    // Make the actual API request if token is available
    if (REDDIT_API_TOKEN) {
      try {
        // Make the API request
        const response = await fetch(`${REDDIT_API_ENDPOINT}/${REDDIT_PIXEL_ID}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': REDDIT_API_TOKEN.startsWith('Bearer ') ? REDDIT_API_TOKEN : `Bearer ${REDDIT_API_TOKEN}`
          },
          body: JSON.stringify(payload)
        });
        
        // Parse the response data
        let data;
        try {
          data = await response.json();
        } catch (e) {
          // If not valid JSON, get text
          data = await response.text();
        }
        
        if (!response.ok) {
          console.error('Reddit Conversions API error:', {
            status: response.status,
            statusText: response.statusText,
            data
          });
        } else {
          console.log('Reddit Conversions API success for event:', conversionId);
        }
        
        return { 
          success: response.ok, 
          status: response.status,
          data,
          event: {
            type: eventType,
            id: conversionId,
            timestamp: new Date().toISOString()
          }
        };
      } catch (apiError) {
        console.error('Reddit Conversions API request failed:', apiError);
        throw apiError;
      }
    } else {
      console.warn('Reddit Conversions API token not configured, event not sent');
      return { 
        success: false, 
        message: 'Event not sent - API token missing',
        event: {
          type: eventType,
          id: conversionId,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    console.error('Failed to send Reddit conversion event:', error);
    return null;
  }
}

/**
 * Track a page view conversion
 */
export async function trackRedditPageView(
  path: string,
  userIp?: string,
  userAgent?: string
): Promise<any> {
  const conversionId = `pageview___${Date.now()}`;
  return sendRedditConversion('PageVisit', conversionId, userIp, userAgent, {
    content_name: path
  });
}

/**
 * Track a lead conversion (e.g. call booking)
 */
export async function trackRedditLead(
  leadSource: string,
  userIp?: string,
  userAgent?: string,
  customProperties?: Record<string, any>
): Promise<any> {
  const conversionId = `lead___${Date.now()}`;
  return sendRedditConversion('Lead', conversionId, userIp, userAgent, {
    content_name: leadSource,
    ...customProperties
  });
}

/**
 * Track a purchase conversion with enhanced data
 * @param transactionId Unique transaction ID for deduplication
 * @param value The monetary value of the purchase
 * @param currency The currency code (default: GBP)
 * @param userIp The user's IP address
 * @param userAgent The user's browser agent
 * @param options Additional options including:
 *   - email: User's email (will be hashed)
 *   - userId: User's ID in your system
 *   - products: Array of product details
 *   - clickId: Reddit click ID for attribution
 *   - screenWidth: User's screen width
 *   - screenHeight: User's screen height
 * @returns Promise with the result
 */
export async function trackRedditPurchase(
  transactionId: string,
  value: number,
  currency: string = 'GBP',
  userIp?: string,
  userAgent?: string,
  options?: {
    email?: string;
    userId?: string;
    products?: Array<{id: string; name: string; category?: string}>;
    clickId?: string;
    screenWidth?: number;
    screenHeight?: number;
    [key: string]: any;
  }
): Promise<any> {
  // Use the transaction ID as the conversion ID to avoid duplicates
  const conversionId = transactionId || `purchase___${Date.now()}`;
  
  // Create enriched properties object
  const enrichedProperties = {
    value,
    currency,
    ...(options || {})
  };
  
  // Add products details if available
  if (options?.products?.length) {
    enrichedProperties.products = options.products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category || 'Other'
    }));
    // Add item count as a separate property
    (enrichedProperties as any).itemCount = options.products.length;
  }
  
  return sendRedditConversion('Purchase', conversionId, userIp, userAgent, enrichedProperties);
}

/**
 * Track a custom conversion
 */
export async function trackRedditCustomConversion(
  eventName: string,
  conversionId: string,
  userIp?: string,
  userAgent?: string,
  customProperties?: Record<string, any>
): Promise<any> {
  return sendRedditConversion('Custom', conversionId || `custom___${Date.now()}`, userIp, userAgent, {
    customEventName: eventName,
    ...customProperties
  });
}