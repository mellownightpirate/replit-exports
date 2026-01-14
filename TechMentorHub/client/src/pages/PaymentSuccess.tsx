import { useLocation, useSearch } from 'wouter';
import { useEffect } from 'react';
import { trackEvent as trackAnalyticsEvent } from '@/lib/analytics';
import { useTracking } from '@/contexts/TrackingContext';
import { trackPurchaseWithCallback } from '@/lib/googleAds';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  
  // Get tracking from context
  const { trackConversion, trackEvent } = useTracking();
  
  // Track successful payment completion
  useEffect(() => {
    // Get payment_intent from URL if available
    const params = new URLSearchParams(search);
    const paymentIntentId = params.get('payment_intent');
    
    // Calculate a default purchase price (can be replaced with actual price from state/store)
    const purchaseValue = 497; // Default value in GBP
    const transactionId = paymentIntentId || `order_${Date.now()}`;
    
    // Track the conversion using our tracking context for third-party services
    trackConversion('purchase', {
      value: purchaseValue,
      transactionId: transactionId,
      planName: 'NextChapter Tech Mentoring Program',
      currency: 'GBP'
    });
    
    // Track using our internal analytics for backend storage
    trackAnalyticsEvent(
      'conversion', 
      'purchase', 
      'purchase_completed',
      transactionId,
      purchaseValue
    );
    
    // Also track using the specialized Google Ads conversion script
    // This uses the exact Google Ads conversion tag format
    trackPurchaseWithCallback(
      undefined, // No redirect URL needed on success page
      purchaseValue,
      transactionId
    );
    
    console.log('Purchase conversion tracked on success page with transaction ID:', transactionId);
  }, [search, trackConversion]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="py-6 px-4 bg-gray-800 shadow-md">
        <div className="container mx-auto">
          <a href="/" className="text-2xl font-bold text-white">
            NextChapter <span className="text-[#06D6A0]">Tech</span>
          </a>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-[#06D6A0]/20 p-4">
                <svg className="h-16 w-16 text-[#06D6A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-xl text-gray-300 mb-8">
              Thank you for your purchase. Your NextChapter journey begins now!
            </p>
            
            <div className="bg-gray-800 p-6 rounded-lg mb-8 max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-white mb-4">What happens next?</h2>
              <ul className="text-left space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-[#06D6A0] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300">
                    Check your email for a welcome message with further instructions.
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-[#06D6A0] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-300">
                    Your mentor will reach out to schedule your first onboarding session within 24 hours.
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-[#06D6A0] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-gray-300">
                    You'll gain access to our private community and resource library.
                  </span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => {
                // Track with context-based tracking
                trackEvent('post_purchase_return_home', { 
                  action_type: 'navigation',
                  location: 'success_page'
                });
                
                // Also track with our internal analytics system
                trackAnalyticsEvent(
                  'click',
                  'navigation',
                  'post_purchase_return_home',
                  'success_page'
                );
                
                setLocation('/');
              }}
              className="px-8 py-3 bg-[#06D6A0] hover:bg-[#05c090] text-gray-900 font-bold rounded-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>

      <div className="py-6 px-4 bg-gray-800">
        <div className="container mx-auto text-center text-gray-400">
          <p>© {new Date().getFullYear()} NextChapter Tech. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}