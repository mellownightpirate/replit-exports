import { useEffect } from "react";
import NavBar from "@/components/landing/NavBar";
import HeroSection from "@/components/landing/HeroSection";
import WhoIsThisForSection from "@/components/landing/WhoIsThisForSection";
import BlueprintSection from "@/components/landing/BlueprintSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import QuizSection from "@/components/landing/QuizSection";
// PricingSection removed to focus on free strategy calls
import FAQSection from "@/components/landing/FAQSection";
import BookCallSection from "@/components/landing/BookCallSection";
import WaitlistSection from "@/components/landing/WaitlistSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  useEffect(() => {
    document.title = "NextChapter - Tech Mentoring Program";

    // Add scroll animation functionality
    const animatedElements = document.querySelectorAll('.scroll-animation');
      
    function checkScroll() {
      const triggerBottom = window.innerHeight * 0.9;
      
      animatedElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < triggerBottom) {
          element.classList.add('active');
        }
      });
    }
    
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Check on initial load
    
    return () => {
      window.removeEventListener('scroll', checkScroll);
    };
  }, []);

  return (
    <div className="bg-gray-900 text-white">
      <NavBar />
      <HeroSection />
      <WhoIsThisForSection />
      <BlueprintSection />
      <FeaturesSection />
      <TestimonialsSection />
      <QuizSection />
      <FAQSection />
      <BookCallSection />
      <WaitlistSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
