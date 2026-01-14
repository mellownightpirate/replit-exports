import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeMetaPixel, trackMetaPixelEvent, trackMetaPixelCustomEvent } from '@/lib/metaPixel';
import { initializeGoogleAdsTracking, trackGoogleAdsConversion, trackPurchaseWithCallback } from '@/lib/googleAds';
import { initializeGA4, trackGA4Event, trackGA4PageView } from '@/lib/googleAnalytics';
import { 
  initializeRedditPixel, 
  trackRedditPixelEvent, 
  trackRedditPageView, 
  trackRedditLead, 
  trackRedditPurchase,
  trackRedditCustomEvent,
  trackRedditSignup,
  trackRedditQualificationCheck,
  trackRedditTryDemo
} from '@/lib/redditPixel';

// Define gtag and other tracking pixels globally
declare global {
  interface Window {
    gtag: Function;
    dataLayer: any[];
    fbq?: any;
    rdt?: any;
  }
}

interface TrackingContextType {
  isInitialized: boolean;
  trackEvent: (eventName: string, params?: any) => void;
  trackPageView: (path: string, title?: string) => void;
  trackConversion: (type: 'quiz_completion' | 'call_booking' | 'purchase' | 'signup' | 'qualification' | 'try_demo', params?: any) => void;
}

const TrackingContext = createContext<TrackingContextType>({
  isInitialized: false,
  trackEvent: () => {},
  trackPageView: () => {},
  trackConversion: () => {},
});

// Use a named constant function instead of an exported function declaration
// This helps with React's hot reloading
const useTracking = () => {
  return useContext(TrackingContext);
};

export { useTracking };

interface TrackingProviderProps {
  children: React.ReactNode;
  metaPixelId?: string;
  googleAdsId?: string;
  ga4MeasurementId?: string;
  redditPixelId?: string;
  conversions?: {
    quiz?: {
      googleAdsLabel?: string;
    };
    call?: {
      googleAdsLabel?: string;
    };
    purchase?: {
      googleAdsLabel?: string;
    };
  };
}

export function TrackingProvider({
  children,
  metaPixelId,
  googleAdsId,
  ga4MeasurementId,
  redditPixelId,
  conversions = {},
}: TrackingProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize all tracking services
  useEffect(() => {
    // Only run in browser, not during SSR
    if (typeof window === 'undefined') return;

    console.log('TrackingContext - Initializing tracking services');
    console.log('Available tracking IDs:', {
      metaPixelId: metaPixelId || 'Not provided',
      googleAdsId: googleAdsId || 'Not provided',
      ga4MeasurementId: ga4MeasurementId || 'Not provided',
      redditPixelId: redditPixelId || 'Not provided'
    });

    // Manual script injection for Google Analytics 4
    if (ga4MeasurementId) {
      try {
        // Add GA4 script directly to the head
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`;
        document.head.appendChild(gaScript);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        // Use a traditional function to properly access 'arguments'
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', ga4MeasurementId);
        
        console.log(`Google Analytics 4 script injected manually with ID: ${ga4MeasurementId}`);
        
        // Also try the module-based approach as a fallback
        initializeGA4(ga4MeasurementId);
      } catch (error) {
        console.error('Error initializing GA4 manually:', error);
      }
    }

    // Manual script injection for Google Ads
    if (googleAdsId) {
      try {
        // Add Google Ads script directly to the head
        const adsScript = document.createElement('script');
        adsScript.async = true;
        adsScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
        document.head.appendChild(adsScript);
        
        // Initialize gtag for Google Ads
        window.dataLayer = window.dataLayer || [];
        // We already set up gtag for GA4, so we don't need to redefine it
        window.gtag('js', new Date());
        window.gtag('config', googleAdsId);
        
        console.log(`Google Ads script injected manually with ID: ${googleAdsId}`);
        
        // Also try the module-based approach as a fallback
        initializeGoogleAdsTracking(googleAdsId);
      } catch (error) {
        console.error('Error initializing Google Ads manually:', error);
      }
    } else {
      console.log('Google Ads ID not provided, skipping initialization');
    }

    if (metaPixelId) {
      try {
        // Manual script injection for Meta Pixel based on Facebook's exact recommended implementation
        const f = window as any;
        if (f.fbq) return; // Only initialize once
        
        // Add Meta Pixel base code - using Facebook's exact recommended implementation
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
        
        // Initialize the pixel ID and track page view
        f.fbq('init', metaPixelId);
        f.fbq('track', 'PageView');
        
        console.log(`Meta Pixel initialized with ID: ${metaPixelId}`);
        
        // Also use the module-based approach as a fallback/alternative
        initializeMetaPixel(metaPixelId);
      } catch (error) {
        console.error('Error initializing Meta Pixel:', error);
      }
    } else {
      console.log('Meta Pixel ID not provided, skipping initialization');
    }

    // Initialize Reddit Pixel
    if (redditPixelId) {
      try {
        // Use the module-based initialization
        initializeRedditPixel(redditPixelId);
        console.log(`Reddit Pixel initialized with ID: ${redditPixelId}`);
      } catch (error) {
        console.error('Error initializing Reddit Pixel:', error);
      }
    } else {
      console.log('Reddit Pixel ID not provided, skipping initialization');
    }

    // Mark as initialized if at least one service was initialized
    if (metaPixelId || googleAdsId || ga4MeasurementId || redditPixelId) {
      setIsInitialized(true);
      console.log('TrackingContext - Initialization complete');
    } else {
      console.warn('TrackingContext - No tracking services were initialized');
    }
    
    // Debug helper
    console.log('Current window.gtag availability:', typeof window.gtag !== 'undefined' ? 'Available' : 'Not available');
    
    // Add validation check that runs after a short delay to ensure scripts have loaded
    setTimeout(() => {
      console.log('Validation check for tracking scripts:');
      console.log('- Google Analytics (window.gtag):', typeof window.gtag !== 'undefined' ? 'LOADED' : 'NOT LOADED');
      console.log('- Google Analytics script:', !!document.querySelector(`script[src*="${ga4MeasurementId}"]`) ? 'FOUND' : 'NOT FOUND');
      console.log('- Google Ads script:', !!document.querySelector(`script[src*="${googleAdsId}"]`) ? 'FOUND' : 'NOT FOUND');
      console.log('- Meta Pixel (window.fbq):', typeof (window as any).fbq !== 'undefined' ? 'LOADED' : 'NOT LOADED');
      console.log('- Reddit Pixel (window.rdt):', typeof (window as any).rdt !== 'undefined' ? 'LOADED' : 'NOT LOADED');
    }, 2000);
    
  }, [metaPixelId, googleAdsId, ga4MeasurementId, redditPixelId]);

  // Track a generic event across all services
  const trackEvent = (eventName: string, params?: any) => {
    if (!isInitialized) return;

    // Track in Meta Pixel (Facebook)
    if (metaPixelId) {
      trackMetaPixelCustomEvent(eventName, params);
    }

    // Track in GA4
    if (ga4MeasurementId) {
      trackGA4Event(eventName, params);
    }
    
    // Track in Reddit Pixel
    if (redditPixelId) {
      trackRedditCustomEvent(eventName, params);
    }
  };

  // Track page view across all services
  const trackPageView = (path: string, title?: string) => {
    if (!isInitialized) return;

    // GA4 page view
    if (ga4MeasurementId) {
      trackGA4PageView(path, title);
    }

    // Meta Pixel page view - uses standard PageView event
    if (metaPixelId) {
      trackMetaPixelEvent('PageView');
    }
    
    // Reddit Pixel page view
    if (redditPixelId) {
      trackRedditPageView(path);
    }
  };

  // Track specific conversion types across all services
  const trackConversion = (
    type: 'quiz_completion' | 'call_booking' | 'purchase' | 'signup' | 'qualification' | 'try_demo',
    params?: any
  ) => {
    if (!isInitialized) return;

    // Different handling based on conversion type
    switch (type) {
      case 'quiz_completion':
        // Meta Pixel
        if (metaPixelId) {
          trackMetaPixelCustomEvent('QuizCompleted', params);
        }
        
        // Google Ads
        if (googleAdsId && conversions.quiz?.googleAdsLabel) {
          trackGoogleAdsConversion(
            googleAdsId,
            conversions.quiz.googleAdsLabel
          );
        }
        
        // GA4
        if (ga4MeasurementId) {
          trackGA4Event('quiz_completed', params);
        }
        
        // Reddit Pixel
        if (redditPixelId) {
          trackRedditCustomEvent('quiz_completed', params);
        }
        break;

      case 'call_booking':
        // Meta Pixel
        if (metaPixelId) {
          trackMetaPixelEvent('Lead', { 
            content_name: 'call_booking',
            ...params 
          });
        }
        
        // Google Ads
        if (googleAdsId && conversions.call?.googleAdsLabel) {
          trackGoogleAdsConversion(
            googleAdsId,
            conversions.call.googleAdsLabel
          );
        }
        
        // GA4
        if (ga4MeasurementId) {
          trackGA4Event('call_booked', params);
        }
        
        // Reddit Pixel
        if (redditPixelId) {
          trackRedditLead({
            content_name: 'call_booking',
            ...params
          });
        }
        break;

      case 'purchase':
        const { value = 0, transactionId = '', planName = '', redirectUrl = '' } = params || {};
        
        // Meta Pixel
        if (metaPixelId) {
          trackMetaPixelEvent('Purchase', {
            currency: 'GBP',
            value,
            ...params
          });
        }
        
        // Google Ads - Use the exact conversion code from Google Ads
        if (googleAdsId) {
          // Use the specialized purchase tracking function with the exact conversion tag
          trackPurchaseWithCallback(
            redirectUrl as string | undefined, 
            value, 
            transactionId as string
          );
          
          console.log('Google Ads purchase conversion tracked with conversion tag AW-16998722263/PCc2CKKwj7caENfVz6k_');
        }
        
        // GA4
        if (ga4MeasurementId) {
          trackGA4Event('purchase', {
            transaction_id: transactionId,
            currency: 'GBP',  // Changed to GBP to match Google Ads
            value,
            items: [
              {
                item_id: planName,
                item_name: planName,
                price: value,
                quantity: 1,
              },
            ],
            ...params
          });
        }
        
        // Reddit Pixel
        if (redditPixelId) {
          trackRedditPurchase({
            currency: 'GBP',
            value,
            transaction_id: transactionId,
            content_name: planName,
            ...params
          });
        }
        break;
        
      case 'signup':
        // Meta Pixel
        if (metaPixelId) {
          trackMetaPixelEvent('CompleteRegistration', { 
            content_name: 'signup',
            ...params 
          });
        }
        
        // GA4
        if (ga4MeasurementId) {
          trackGA4Event('sign_up', params);
        }
        
        // Reddit Pixel
        if (redditPixelId) {
          trackRedditSignup(params?.email as string);
        }
        break;
        
      case 'qualification':
        // Meta Pixel
        if (metaPixelId) {
          trackMetaPixelEvent('Custom', { 
            content_name: 'qualification_check',
            ...params 
          });
        }
        
        // GA4
        if (ga4MeasurementId) {
          trackGA4Event('qualification_check', params);
        }
        
        // Reddit Pixel
        if (redditPixelId) {
          trackRedditQualificationCheck(params?.result as string);
        }
        break;
        
      case 'try_demo':
        // Meta Pixel
        if (metaPixelId) {
          trackMetaPixelEvent('Custom', { 
            content_name: 'try_demo',
            ...params 
          });
        }
        
        // GA4
        if (ga4MeasurementId) {
          trackGA4Event('try_demo', params);
        }
        
        // Reddit Pixel
        if (redditPixelId) {
          trackRedditTryDemo(params?.demoType as string);
        }
        break;
    }
  };

  return (
    <TrackingContext.Provider value={{ isInitialized, trackEvent, trackPageView, trackConversion }}>
      {children}
    </TrackingContext.Provider>
  );
}