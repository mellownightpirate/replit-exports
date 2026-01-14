import { trackEvent } from "@/lib/analytics";
import { useState } from "react";
import { useTracking } from "@/contexts/TrackingContext";

export default function BookCallSection() {
  // Direct link approach without any fancy functionality
  const [linkClicked, setLinkClicked] = useState(false);
  const calendlyUrl = "https://calendly.com/amin-hasan";
  const { trackConversion, trackEvent: trackExternalEvent } = useTracking();
  
  // Open Calendly in a separate window/tab
  const handleOpenCalendly = () => {
    console.log("Handling button click - opening window");
    
    // Track the event in our internal analytics system
    trackEvent('click', 'cta', 'book_call_button', 'book_call_section');
    
    // Track the event in external platforms (Google Ads, Meta Pixel, GA4)
    trackExternalEvent('calendly_booking_clicked', {
      location: 'book_call_section',
      url: calendlyUrl
    });
    
    // Track as a call booking conversion (higher-value action)
    trackConversion('call_booking', {
      source: 'calendly',
      intent: 'strategy_call'
    });
    
    // Also track as a try_demo conversion for Reddit's additional requirements
    trackConversion('try_demo', {
      demo_type: 'strategy_call',
      location: 'book_call_section'
    });
    
    // Mark as clicked to show help message
    setLinkClicked(true);
    
    // Open in a new tab
    window.open(calendlyUrl, "_blank", "noopener");
  };
  
  return (
    <section id="book-call" className="py-20 md:py-28 relative">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-0"></div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 z-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#06D6A0]/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#06D6A0]/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Section pre-heading */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-1.5 bg-[#06D6A0]/10 border border-[#06D6A0]/20 rounded-full text-[#06D6A0] font-medium text-sm mb-4 scroll-animation">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Limited Free Strategy Call Spots Available
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-5 text-white scroll-animation">
              Get Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06D6A0] to-[#06f0b2]">Personalized Roadmap</span> To Tech
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto scroll-animation">
              Book your complimentary 30-minute strategy call and leave with clarity on exactly what you need to do next to succeed in tech.
            </p>
          </div>
          
          {/* Two column layout */}
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
            {/* Left column: Benefits */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/60 flex flex-col h-full scroll-animation relative overflow-hidden">
              {/* Corner accent */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#06D6A0]/10 rounded-full blur-xl"></div>
              
              <h3 className="text-2xl font-bold text-white mb-6 relative">
                <span className="flex items-center">
                  <span className="inline-block w-10 h-10 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] flex items-center justify-center mr-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  In This Free 30-Minute Call, You'll Get:
                </span>
              </h3>
              
              <ul className="space-y-5 mb-8">
                <li className="flex items-start">
                  <div className="bg-[#06D6A0]/10 p-1 rounded-full mr-3 mt-0.5">
                    <svg className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Personalized Career Blueprint</h4>
                    <p className="text-gray-300">A custom roadmap based on your background, goals and timeline - with specific steps to build your tech career.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-[#06D6A0]/10 p-1 rounded-full mr-3 mt-0.5">
                    <svg className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Skill Gap Analysis</h4>
                    <p className="text-gray-300">Identify exactly which skills you need to develop for your target role, and which ones you can skip to save time.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-[#06D6A0]/10 p-1 rounded-full mr-3 mt-0.5">
                    <svg className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">Realistic Timeline & Milestones</h4>
                    <p className="text-gray-300">Get a clear understanding of how long your transition will take and the key milestones to track progress.</p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-auto">
                <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/30">
                  <h4 className="font-semibold text-white mb-2 flex items-center">
                    <svg className="w-5 h-5 text-[#06D6A0] mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Included Guarantee
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Even if you decide not to join our program, you'll still walk away with valuable insights and actionable next steps for your tech career transition.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right column: Booking form */}
            <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-800/80 rounded-2xl p-8 border border-gray-700/60 flex flex-col scroll-animation relative overflow-hidden">
              {/* Visual decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#06D6A0]/5 rounded-full filter blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/5 rounded-full filter blur-xl"></div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Book Your Free Strategy Call</h3>
                <p className="text-gray-300">No sales pitch. No commitment. Just actionable advice.</p>
              </div>
              
              <div className="flex flex-col items-center mb-6 relative">
                <div className="w-full max-w-md">
                  <button
                    onClick={handleOpenCalendly}
                    className="w-full py-4 px-6 bg-[#06D6A0] hover:bg-[#05c090] text-gray-900 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 text-center flex items-center justify-center relative overflow-hidden group"
                  >
                    <span className="absolute top-0 right-full w-full h-full bg-white/20 transform skew-x-12 group-hover:right-0 transition-all duration-700"></span>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="relative z-10">Schedule Your Free Strategy Call</span>
                  </button>
                </div>
                
                {/* Show this message after the button is clicked, in case of popup blockers */}
                {linkClicked && (
                  <div className="p-4 mt-4 bg-gray-900 border border-[#06D6A0]/30 rounded-xl text-white text-sm w-full">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-[#06D6A0] mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="mb-2 font-medium">
                          If a new window didn't open, your browser may have blocked the popup.
                        </p>
                        <p>
                          Please visit{" "}
                          <a href={calendlyUrl} target="_blank" rel="noopener noreferrer" className="text-[#06D6A0] underline">
                            {calendlyUrl}
                          </a>{" "}
                          manually.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/30 text-center">
                  <div className="text-2xl font-bold text-[#06D6A0] mb-1">30<span className="text-sm font-normal text-white">min</span></div>
                  <div className="text-xs text-gray-400">Duration</div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/30 text-center">
                  <div className="text-2xl font-bold text-[#06D6A0] mb-1">1:1</div>
                  <div className="text-xs text-gray-400">Personal Call</div>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-700/30 text-center">
                  <div className="text-2xl font-bold text-[#06D6A0] mb-1">$0</div>
                  <div className="text-xs text-gray-400">Completely Free</div>
                </div>
              </div>
              
              <div className="mt-auto space-y-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-5 h-5 text-[#06D6A0]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-5 h-5 text-[#06D6A0]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Zero sales pressure</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <svg className="w-5 h-5 text-[#06D6A0]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Actionable advice guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}