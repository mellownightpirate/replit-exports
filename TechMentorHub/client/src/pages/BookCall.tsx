import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// This page simply redirects to Calendly
export default function BookCall() {
  useEffect(() => {
    // Track the redirect
    trackEvent('conversion', 'booking', 'calendly_redirect', 'redirect_page');
    
    // Redirect to Calendly
    window.location.href = "https://calendly.com/amin-hasan/strategy-call";
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Redirecting to booking page...</h1>
        <p className="text-gray-400 mb-6">You'll be redirected to Calendly in a moment</p>
        <div className="animate-spin w-8 h-8 border-4 border-[#06D6A0] border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-400 mt-6">
          If you're not redirected,{" "}
          <a 
            href="https://calendly.com/amin-hasan/strategy-call" 
            className="text-[#06D6A0] underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
}