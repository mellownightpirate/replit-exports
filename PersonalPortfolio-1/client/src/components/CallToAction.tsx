import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Show CTA when user has scrolled past 70% of the page
      const scrollPosition = window.scrollY;
      const pageHeight = document.body.scrollHeight - window.innerHeight;
      const scrollThreshold = pageHeight * 0.7;
      
      setIsVisible(scrollPosition > scrollThreshold);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleCtaClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 z-50 py-4 bg-white border-t border-gray-200"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium">Want to accelerate your tech career?</h3>
              <p className="text-sm text-gray-600">Join my community for exclusive content on data analytics, AI/ML, and tech solutions.</p>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleCtaClick}
                variant="outline"
                className="border-gray-300 bg-white"
              >
                View content library
              </Button>
              <Button 
                onClick={handleCtaClick}
                className="bg-black text-white hover:bg-gray-800"
              >
                Subscribe <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}