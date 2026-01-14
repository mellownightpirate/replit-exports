import profileImage from "@assets/ah-profile-pic.jpg";
import { useTracking } from "@/contexts/TrackingContext";

export default function FinalCTA() {
  const { trackEvent, trackConversion } = useTracking();
  
  const handleTrackQuizClick = () => {
    trackEvent('click_quiz_final_cta', {
      section: 'final_cta',
      action: 'quiz_click'
    });
  };
  
  const handleTrackCallClick = () => {
    trackEvent('click_call_final_cta', {
      section: 'final_cta',
      action: 'call_booking_click'
    });
    
    trackConversion('try_demo', {
      demo_type: 'strategy_call',
      location: 'final_cta'
    });
  };
  
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-800 to-gray-900"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#06D6A0]/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Stats bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 scroll-animation">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">3-6<span className="text-sm font-normal text-gray-400 ml-1">months</span></h3>
              <p className="text-gray-400">Average career transition time with mentoring</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">40%<span className="text-sm font-normal text-gray-400 ml-1">↑</span></h3>
              <p className="text-gray-400">Average salary increase after program completion</p>
            </div>
            
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#06D6A0]/10 text-[#06D6A0] mb-4">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">100%<span className="text-sm font-normal text-gray-400 ml-1">support</span></h3>
              <p className="text-gray-400">Until You're Hired Guarantee</p>
            </div>
          </div>
          
          {/* Enhanced testimonial with background */}
          <div className="mb-20 overflow-hidden relative rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900/90 scroll-animation">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#06D6A0]/40 rounded-full filter blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/40 rounded-full filter blur-xl"></div>
            </div>
            
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 relative">
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="relative w-36 h-36 md:w-48 md:h-48 rounded-xl border-2 border-[#06D6A0] overflow-hidden flex-shrink-0 shadow-xl">
                  <img 
                    src={profileImage} 
                    alt="NextChapter Mentor" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-20"></div>
                </div>
                <div className="text-center mt-4">
                  <p className="font-bold text-white text-xl">Amin Hasan</p>
                  <div className="flex items-center justify-center mt-1">
                    <p className="text-[#06D6A0] font-medium">Founder, NextChapter</p>
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <svg className="w-16 h-16 text-[#06D6A0]/20 mb-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.583 17.321C8.553 16.227 8 15.101 8 13.281c0-3.099 2.198-5.504 5.041-5.898v-1.382h-2.323c-2.839 0-4.74 2.417-4.731 5.129 0 1.282.458 2.6 1.304 3.673.761.961 1.048 1.771 1.073 2.486l.002.138a.5.5 0 0 0 .5.5h2.344a.5.5 0 0 0 .5-.5c0-.43-.174-1.647-2.127-3.025Z" />
                  <path d="M16.832 17.321c-1.03-1.094-1.583-2.22-1.583-4.04 0-3.099 2.198-5.504 5.041-5.898v-1.382h-2.323c-2.839 0-4.74 2.417-4.731 5.129 0 1.282.458 2.6 1.304 3.673.761.961 1.048 1.771 1.073 2.486l.002.138a.5.5 0 0 0 .5.5h2.344a.5.5 0 0 0 .5-.5c0-.43-.174-1.647-2.127-3.025Z" />
                </svg>
                <p className="text-xl md:text-2xl text-white mb-6 italic leading-relaxed">
                  "I've built this program specifically for career changers who need more than just theoretical knowledge. The tech industry has changed dramatically with AI, and my methodology gives you both the technical skills <span className="text-[#06D6A0]">and</span> the strategic approach needed to stand out in today's competitive job market."
                </p>
                
                <div className="mt-6 bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-[#06D6A0] mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-gray-200 font-medium">
                      The <span className="text-[#06D6A0] font-bold">"Until You're Hired"</span> guarantee means you can stay in the program until you land a tech role - I'm committed to your success.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Final call to action */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 font-medium text-sm mb-6 scroll-animation">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Don't wait until it's too late
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white leading-tight scroll-animation">
              Secure Your Place in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06D6A0] to-[#06f0b2]">Tech's Future</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto scroll-animation">
              AI is transforming the industry faster than ever before. Those with the right skills and mentorship will thrive — everyone else risks being left behind.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-4 scroll-animation">
              <a 
                href="#quiz" 
                onClick={handleTrackQuizClick}
                className="flex flex-col p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700/60 hover:border-[#06D6A0]/40 transition-all duration-300 group hover:shadow-lg"
              >
                <div className="flex items-center mb-3">
                  <div className="bg-[#06D6A0]/10 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Take the Tech Readiness Quiz</h3>
                </div>
                <p className="text-gray-400 mb-4">Find out if you have what it takes to make the transition and get personalized recommendations.</p>
                <span className="mt-auto inline-flex items-center text-[#06D6A0] font-medium group-hover:underline">
                  Take the 60-second quiz
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
              
              <a 
                href="#book-call" 
                onClick={handleTrackCallClick}
                className="flex flex-col p-6 bg-gradient-to-br from-[#06D6A0]/20 to-gray-800 rounded-xl border border-[#06D6A0]/30 hover:border-[#06D6A0]/60 transition-all duration-300 group hover:shadow-lg"
              >
                <div className="flex items-center mb-3">
                  <div className="bg-[#06D6A0]/20 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Book Your Free Strategy Call</h3>
                </div>
                <p className="text-gray-300 mb-4">Get personalized guidance on your tech career path with our expert advisor (no commitment).</p>
                <span className="mt-auto inline-flex items-center text-[#06D6A0] font-medium group-hover:underline">
                  Schedule your call now
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </a>
            </div>
            
            <p className="text-gray-500 italic mt-6 text-sm max-w-xl mx-auto scroll-animation">
              "The single biggest factor in successful career transitions is having someone who's been there to guide you through the process."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
