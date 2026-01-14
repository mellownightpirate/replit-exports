import { useEffect, useRef, useState } from "react";
import heroImage from "@assets/generated_images/Candlelit_gallery_hero_image_51dfca7c.png";

const HERO_VIDEO_URL = "https://res.cloudinary.com/dedxqeznh/video/upload/v1765817027/layla-hero-faststart_adyafa.mp4";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      setVideoLoaded(true);
      video.play().catch(() => {
        // Autoplay blocked, but video still loaded - keep showing it
      });
    };

    const handleError = () => {
      setVideoError(true);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    // If already loaded
    if (video.readyState >= 3) {
      handleCanPlay();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Always render video, hide if error */}
      {!videoError && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          data-testid="hero-video"
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}
      
      {/* Poster image - always visible until video loads */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${videoLoaded && !videoError ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${heroImage})` }}
        data-testid="hero-poster"
      />
      
      <div className="absolute inset-0 bg-black/60" />
      
      <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-left">
        <p className="text-amber-400/60 text-xs uppercase tracking-[0.3em] font-light whitespace-nowrap" data-testid="text-vertical-date">
          Thursday 22 January 2026
        </p>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-20 md:px-32 py-32">
        <h1 className="text-6xl md:text-8xl font-light text-slate-100 mb-12 leading-[0.95] tracking-tight" data-testid="text-title">
          Layla
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 font-light mb-8 max-w-xl leading-relaxed" data-testid="text-subtitle">
          For the people behind the models, dashboards and decisions, who speak in stories.
        </p>
        
        <p className="text-sm text-amber-400/80 uppercase tracking-wider font-light" data-testid="text-location">
          Marylebone, London · Thursday 22 January 2026
        </p>
      </div>
    </section>
  );
}
