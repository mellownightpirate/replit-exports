import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";

interface NavbarProps {
  scrollToSection: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
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

  const handleNavItemClick = (id: string) => {
    scrollToSection(id);
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-offwhite/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-watermelon heading tracking-wider drop-shadow-sm">
              <span className="uneven-text">FREE BAR</span>
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <button 
              onClick={() => handleNavItemClick('why-funding')} 
              className="text-dark hover:text-watermelon font-bold transition-colors duration-300 tracking-wider uppercase text-sm"
            >
              Why Fund
            </button>
            <button 
              onClick={() => handleNavItemClick('flavours')} 
              className="text-dark hover:text-watermelon font-bold transition-colors duration-300 tracking-wider uppercase text-sm"
            >
              Flavours
            </button>
            <button 
              onClick={() => handleNavItemClick('why-matters')} 
              className="text-dark hover:text-green font-bold transition-colors duration-300 tracking-wider uppercase text-sm"
            >
              Why It Matters
            </button>
          </div>
          
          <div className="hidden md:block">
            <Link href="/checkout">
              <button className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-5">
                FUND THE CHOCOLATE
              </button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-dark"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-offwhite shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <button
              onClick={() => handleNavItemClick('why-funding')}
              className="block w-full text-left py-2 text-dark hover:text-watermelon font-bold uppercase tracking-wide"
            >
              Why Fund
            </button>
            <button
              onClick={() => handleNavItemClick('flavours')}
              className="block w-full text-left py-2 text-dark hover:text-watermelon font-bold uppercase tracking-wide"
            >
              Flavours
            </button>
            <button
              onClick={() => handleNavItemClick('why-matters')}
              className="block w-full text-left py-2 text-dark hover:text-green font-bold uppercase tracking-wide"
            >
              Why It Matters
            </button>
            <Link 
              href="/checkout" 
              className="w-full block"
              onClick={() => setIsOpen(false)}
            >
              <button className="w-full chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-4">
                FUND THE CHOCOLATE
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
