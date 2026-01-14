import profileImage from "@assets/ah-profile-pic.jpg";
import { trackCTAClick } from "@/lib/analytics";
import { useState, useEffect } from "react";
import { useTracking } from "@/contexts/TrackingContext";

export default function HeroSection() {
  const [showVideo, setShowVideo] = useState(false);
  const { trackConversion } = useTracking();
  
  // YouTube embed with your actual video
  const youtubeVideoId = "OprIR2nu_wQ"; // Tech Mentoring Intro Video
  
  const handleShowVideo = () => {
    setShowVideo(true);
    trackCTAClick('play_intro_video', 'hero_section');
    console.log("Showing YouTube embed");
  };
  
  useEffect(() => {
    // Log what's showing to help debug
    console.log("HeroSection rendered, showVideo:", showVideo);
  }, [showVideo]);
  
  return (
    <section id="hero" className="bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 pt-24 md:pt-28 pb-16 md:pb-20 overflow-hidden">
      {/* Decorative bg elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-20 left-5 w-72 h-72 bg-[#06D6A0]/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-80 h-80 bg-indigo-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Two-column hero layout on medium screens and up */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-6">
            <div className="md:w-3/5 text-left md:pr-8">
              <div className="inline-block bg-gradient-to-r from-[#06D6A0]/20 to-[#06D6A0]/10 rounded-full px-4 py-1 mb-6 border border-[#06D6A0]/20 scroll-animation">
                <span className="text-[#06D6A0] font-semibold text-sm">No Tech Experience Required</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black leading-tight text-white mb-6 tracking-tight scroll-animation">
                <span className="block">Transform Your Career</span> 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#06D6A0] to-[#06f0b2]">
                  In The AI Revolution
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 scroll-animation leading-relaxed">
                Expert-guided mentoring to help you build <strong>relevant skills</strong>, land <strong>high-paying jobs</strong>, and secure your future in the tech industry—even if you're starting from zero.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6 scroll-animation">
                <a 
                  href="#book-call" 
                  className="inline-block px-8 py-4 bg-[#06D6A0] text-gray-900 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl hover:bg-[#05c090] transform hover:-translate-y-1 transition-all duration-300 text-center relative overflow-hidden group"
                  onClick={() => trackCTAClick('book_strategy_call', 'hero_section')}
                >
                  <span className="relative z-10">Book Free Strategy Call</span>
                  <span className="absolute top-0 left-0 w-0 h-full bg-white/10 transform -skew-x-12 transition-all group-hover:w-full duration-300"></span>
                </a>
                
                <a 
                  href="#quiz" 
                  className="inline-block px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg text-lg font-bold hover:bg-white/20 transition-all duration-300 text-center"
                  onClick={() => trackCTAClick('take_quiz', 'hero_section')}
                >
                  Take 60-Second Quiz
                </a>
              </div>
              
              <div className="flex items-center gap-3 scroll-animation">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#06D6A0] text-gray-800 font-bold flex items-center justify-center border-2 border-gray-900">✓</div>
                  <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center border-2 border-gray-700">2w</div>
                  <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center border-2 border-gray-700">AI</div>
                </div>
                <p className="text-sm text-gray-400">
                  <span className="text-white">Risk-free 2-week refund</span> • AI-ready skills
                </p>
              </div>
            </div>
            
            <div className="md:w-2/5 relative">
              {/* Video card with floating effect */}
              <div className="relative transform md:rotate-2 md:hover:rotate-0 transition-all duration-700 z-10 scroll-animation">
                <div className="absolute inset-0 bg-gradient-to-br from-[#06D6A0]/30 to-purple-500/30 rounded-2xl blur-md transform scale-105"></div>
                <div className="relative bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
                  {!showVideo ? (
                    <div 
                      className="aspect-video cursor-pointer flex items-center justify-center relative"
                      onClick={handleShowVideo}
                    >
                      <img 
                        src="/images/thumbnail.png"
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="Video thumbnail"
                        onLoad={() => console.log("Thumbnail image loaded successfully")}
                        onError={(e) => {
                          console.error("Failed to load thumbnail image:", e);
                        }}
                      />
                      
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10"></div>
                      
                      {/* Play button with animation */}
                      <div className="w-20 h-20 rounded-full bg-[#06D6A0] flex items-center justify-center z-20 shadow-lg relative animate-pulse">
                        <div className="absolute inset-0 bg-[#06D6A0]/30 rounded-full animate-ping"></div>
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" />
                        </svg>
                      </div>
                      
                      {/* Label text */}
                      <div className="absolute bottom-4 left-0 right-0 text-center text-white font-semibold z-20">
                        Watch success stories (2 min)
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                        title="NextChapter Introduction Video"
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Credibility banner */}
      <div className="container mx-auto px-4 mt-16 relative z-10">
        <div className="bg-gradient-to-r from-gray-800/80 via-gray-800 to-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8 max-w-4xl mx-auto border border-gray-700/50 scroll-animation">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full ring-2 ring-[#06D6A0] ring-offset-2 ring-offset-gray-800 flex-shrink-0 overflow-hidden shadow-lg">
                <img 
                  src={profileImage} 
                  alt="Program Mentor" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center mb-1 gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <p className="text-white font-semibold">Industry Expert & Tech Lead</p>
                </div>
                <p className="text-xl font-bold text-white">Amin Hasan, <span className="text-[#06D6A0]">NextChapter</span></p>
              </div>
            </div>
            <a 
              href="#quiz" 
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center gap-2"
              onClick={() => {
                trackCTAClick('see_if_qualify', 'hero_banner');
                trackConversion('qualification', {
                  location: 'hero_banner',
                  action: 'qualification_check'
                });
              }}
            >
              See If You Qualify
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}