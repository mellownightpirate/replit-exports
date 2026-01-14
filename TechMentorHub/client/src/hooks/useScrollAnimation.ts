import { useEffect } from 'react';

/**
 * Hook to initialize and handle scroll animations
 * Adds the 'active' class to elements with 'scroll-animation' class when they enter the viewport
 */
export default function useScrollAnimation() {
  useEffect(() => {
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
}
