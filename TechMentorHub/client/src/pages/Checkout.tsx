import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { trackConversion, trackEvent } from "@/lib/analytics";
import { useTracking } from "@/contexts/TrackingContext";

// Make sure to call loadStripe outside of a component's render to avoid recreating the Stripe object
// on every render
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  planDetails: {
    name: string;
    price: number;
    description: string;
  };
  customerEmail: string;
}

function CheckoutForm({ planDetails, customerEmail }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { trackEvent: trackExternalEvent } = useTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    
    // Track payment attempt in our internal analytics
    trackEvent('submit', 'checkout', 'payment_attempt');
    
    // Track in external platforms
    trackExternalEvent('payment_form_submit', {
      value: planDetails.price,
      currency: 'GBP',
      plan_name: planDetails.name,
      customer_email: customerEmail
    });

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-success',
        receipt_email: customerEmail,
      },
    });

    if (error) {
      // Track payment failure in internal analytics
      trackEvent('error', 'checkout', 'payment_failure', error.message);
      
      // Track in external platforms
      trackExternalEvent('payment_error', {
        value: planDetails.price,
        currency: 'GBP',
        error_message: error.message || 'Unknown error',
        error_type: error.type || 'unknown'
      });
      
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred during payment processing.",
        variant: "destructive",
      });
    } else {
      // Note: successful payments are tracked on the success page
      // as the user is redirected there by Stripe
      toast({
        title: "Payment Processing",
        description: "Your payment is being processed.",
      });
    }

    setIsProcessing(false);
  };

  return (
    <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
      <div className="mb-6 pb-6 border-b border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{planDetails.name}</h3>
          <span className="text-2xl font-bold text-[#06D6A0]">£{planDetails.price}</span>
        </div>
        <p className="text-gray-300">{planDetails.description}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={customerEmail}
            readOnly
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-[#06D6A0] focus:border-[#06D6A0] opacity-70"
            required
          />
          <p className="mt-1 text-xs text-gray-400">Your receipt will be sent to this email address</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Details
          </label>
          <PaymentElement />
        </div>
        
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full py-3 px-4 bg-[#06D6A0] hover:bg-[#05c090] text-gray-900 font-bold rounded-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : `Pay £${planDetails.price}`}
        </button>
        
        <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path>
          </svg>
          <span>Secure payment via Stripe</span>
        </div>
      </form>
    </div>
  );
}

export default function Checkout() {
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [planDetails, setPlanDetails] = useState({
    name: searchParams.get('plan') || 'NextChapter Plan',
    price: Number(searchParams.get('price')) || 997,
    description: searchParams.get('description') || 'Complete mentoring package',
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { trackEvent: trackExternalEvent, trackConversion: trackExternalConversion } = useTracking();

  // Initialize payment intent after entering email
  const initializePayment = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        amount: planDetails.price,
        planName: planDetails.name,
        customerEmail: email,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.message || 'Something went wrong');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Call this initially but only to set loading to false as we need email first
  useEffect(() => {
    // Track checkout page view as a conversion in our internal analytics
    trackConversion('checkout_started', {
      planId: planDetails.name,
      planName: planDetails.name,
      planPrice: planDetails.price
    });
    
    // Track in external platforms (Google Ads, Meta Pixel, GA4)
    trackExternalEvent('begin_checkout', {
      plan_name: planDetails.name,
      value: planDetails.price,
      currency: 'GBP',
      items: [{
        item_id: planDetails.name,
        item_name: planDetails.name,
        price: planDetails.price,
        quantity: 1
      }]
    });
    
    setIsLoading(false);
  }, []);

  const options = {
    clientSecret,
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#06D6A0',
        colorBackground: '#1f2937',
        colorText: '#ffffff',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="py-6 px-4 bg-gray-800 shadow-md">
        <div className="container mx-auto">
          <a href="/" className="text-2xl font-bold text-white">
            NextChapter <span className="text-[#06D6A0]">Tech</span>
          </a>
        </div>
      </div>

      <div className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8">Complete Your Purchase</h1>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin h-12 w-12 border-4 border-[#06D6A0] border-t-transparent rounded-full"></div>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={options}>
                <CheckoutForm planDetails={planDetails} customerEmail={email} />
              </Elements>
            ) : (
              <div className="bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                <div className="mb-6 pb-6 border-b border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">{planDetails.name}</h3>
                    <span className="text-2xl font-bold text-[#06D6A0]">£{planDetails.price}</span>
                  </div>
                  <p className="text-gray-300">{planDetails.description}</p>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">Enter Your Details</h3>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (email) {
                    // Email validation using simple regex
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(email)) {
                      // Track email collection event
                      trackEvent('submit', 'checkout', 'email_provided');
                      initializePayment(email);
                    } else {
                      toast({
                        title: "Invalid Email",
                        description: "Please enter a valid email address.",
                        variant: "destructive",
                      });
                    }
                  } else {
                    toast({
                      title: "Email Required",
                      description: "Please enter your email address to continue.",
                      variant: "destructive",
                    });
                  }
                }}>
                  <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-[#06D6A0] focus:border-[#06D6A0]"
                      placeholder="yourname@example.com"
                      required
                    />
                    <p className="mt-2 text-sm text-gray-400">
                      We'll send your receipt and order confirmation to this address.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setLocation('/')}
                      className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-[#06D6A0] hover:bg-[#05c090] text-gray-900 font-bold rounded-lg transform hover:-translate-y-1 transition-all duration-300"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}
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