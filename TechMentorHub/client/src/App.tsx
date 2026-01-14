import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Checkout from "@/pages/Checkout";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Analytics from "@/pages/Analytics";
import BookCall from "@/pages/BookCall";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import ContactUs from "@/pages/ContactUs";
import { useEffect } from "react";
import { initAdvancedAnalytics } from "./lib/mouseTracking";
import { TrackingProvider, useTracking } from "./contexts/TrackingContext";

function RouterWithTracking() {
  const [location] = useLocation();
  const { trackPageView } = useTracking();
  
  // Track page views when location changes
  useEffect(() => {
    trackPageView(location);
  }, [location, trackPageView]);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/book-call" component={BookCall} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/contact-us" component={ContactUs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize advanced analytics
  useEffect(() => {
    // Start advanced analytics tracking (mouse movements, clicks, etc.)
    const cleanup = initAdvancedAnalytics();
    
    // Clean up event listeners on unmount
    return () => {
      cleanup();
    };
  }, []);
  
  // TEMPORARY: Hardcode tracking IDs for development testing
  // These should come from environment variables in production
  const metaPixelId = '3001128470051596'; // Facebook Pixel ID
  const googleAdsId = 'AW-16998722263'; // From the Google Ads code you provided
  const ga4MeasurementId = 'G-76JSY8HVVT'; // From the environment variable
  const redditPixelId = 'a2_gtxp2aek62bn'; // Reddit Pixel ID
  
  // Debug tracking IDs
  console.log('App.tsx - Tracking IDs:', {
    ga4MeasurementId,
    googleAdsId,
    metaPixelId,
    redditPixelId
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <TrackingProvider 
        metaPixelId={metaPixelId}
        googleAdsId={googleAdsId}
        ga4MeasurementId={ga4MeasurementId}
        redditPixelId={redditPixelId}
        conversions={{
          quiz: { googleAdsLabel: import.meta.env.VITE_GOOGLE_ADS_QUIZ_LABEL },
          call: { googleAdsLabel: import.meta.env.VITE_GOOGLE_ADS_CALL_LABEL },
          purchase: { googleAdsLabel: import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL }
        }}
      >
        <RouterWithTracking />
        <Toaster />
      </TrackingProvider>
    </QueryClientProvider>
  );
}

export default App;
