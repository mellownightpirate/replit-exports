import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav id="main-nav" className={`fixed top-0 left-0 right-0 bg-gray-900 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold text-white">
          <span className="text-[#06D6A0]">Next</span>Chapter
        </Link>
        <div className="hidden md:flex space-x-8">
          <a href="#who-this-is-for" className="font-medium text-gray-300 hover:text-[#06D6A0] transition-colors">Who It's For</a>
          <a href="#blueprint" className="font-medium text-gray-300 hover:text-[#06D6A0] transition-colors">The Blueprint</a>
          <a href="#features" className="font-medium text-gray-300 hover:text-[#06D6A0] transition-colors">Features</a>
          <a href="#book-call" className="font-medium text-gray-300 hover:text-[#06D6A0] transition-colors">Book a Call</a>
        </div>
        <a href="#quiz" className="hidden md:block bg-[#06D6A0] hover:bg-[#05c090] px-6 py-2 rounded-full font-bold text-[#333333] transition-colors">
          Take the Quiz
        </a>
        <button 
          className="md:hidden text-gray-300" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-gray-800 px-4 py-3 shadow-lg`}>
        <div className="flex flex-col space-y-3">
          <a 
            href="#who-this-is-for" 
            className="font-medium py-2 hover:text-[#06D6A0] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Who It's For
          </a>
          <a 
            href="#blueprint" 
            className="font-medium py-2 hover:text-[#06D6A0] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            The Blueprint
          </a>
          <a 
            href="#features" 
            className="font-medium py-2 hover:text-[#06D6A0] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#book-call" 
            className="font-medium py-2 hover:text-[#06D6A0] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Book a Call
          </a>
          <a 
            href="#quiz" 
            className="bg-[#06D6A0] hover:bg-[#05c090] px-6 py-2 rounded-full font-bold text-center text-[#333333] transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Take the Quiz
          </a>
        </div>
      </div>
    </nav>
  );
}
