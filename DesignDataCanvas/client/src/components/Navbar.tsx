import { useState, useEffect } from "react";
import { Menu, X, Terminal, BarChart2 } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event for navbar border
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
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

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-all ${isScrolled ? 'bg-background/95 border-b border-foreground' : 'bg-background/50'}`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8 flex justify-between items-center py-3">
        <a href="#" className="flex items-center">
          <div className="flex items-center border-2 border-foreground p-1">
            <Terminal size={16} className="mr-2" />
            <span className="font-mono font-bold text-sm">AMIN.HASAN</span>
          </div>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center">
          <a href="#" className="px-4 py-2 text-xs font-mono hover:bg-foreground hover:text-background transition-colors">HOME</a>
          <a href="#interactive-dashboard" className="px-4 py-2 text-xs font-mono hover:bg-foreground hover:text-background transition-colors">DEMO</a>
          <a href="#scenarios" className="px-4 py-2 text-xs font-mono hover:bg-foreground hover:text-background transition-colors">SOLUTIONS</a>
          <a href="#case-studies" className="px-4 py-2 text-xs font-mono hover:bg-foreground hover:text-background transition-colors">RESULTS</a>
          <a href="#services" className="px-4 py-2 text-xs font-mono hover:bg-foreground hover:text-background transition-colors">SERVICES</a>
          <a href="#contact" className="px-4 py-2 text-xs font-mono hover:bg-foreground hover:text-background transition-colors">CONTACT</a>
          
          <a 
            href="https://calendly.com/amin-hasan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="eink-btn-accent text-sm py-2 px-4 ml-4 border-2 flex items-center"
          >
            <BarChart2 size={16} className="mr-2" />
            FREE STRATEGY CALL
          </a>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 border border-foreground focus:outline-none" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-foreground">
          <div className="container mx-auto px-4 py-2 flex flex-col bg-background">
            <a href="#" className="py-3 border-b border-foreground/20 text-xs font-mono" onClick={closeMenu}>HOME</a>
            <a href="#interactive-dashboard" className="py-3 border-b border-foreground/20 text-xs font-mono" onClick={closeMenu}>INTERACTIVE DEMO</a>
            <a href="#scenarios" className="py-3 border-b border-foreground/20 text-xs font-mono" onClick={closeMenu}>SOLUTIONS</a>
            <a href="#case-studies" className="py-3 border-b border-foreground/20 text-xs font-mono" onClick={closeMenu}>RESULTS</a>
            <a href="#services" className="py-3 border-b border-foreground/20 text-xs font-mono" onClick={closeMenu}>SERVICES</a>
            <a href="#contact" className="py-3 border-b border-foreground/20 text-xs font-mono" onClick={closeMenu}>CONTACT</a>
            
            <div className="py-4">
              <a 
                href="https://calendly.com/amin-hasan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="eink-btn eink-btn-primary w-full py-3 flex items-center justify-center text-sm"
                onClick={closeMenu}
              >
                <BarChart2 size={16} className="mr-2" />
                BOOK FREE STRATEGY CALL
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
