import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Content", href: "#dashboard" },
    { name: "Expertise", href: "#resources" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
  ];

  const scrollToSection = (href: string) => {
    if (href === "#") return;
    
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const top = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
      
      // Close mobile menu if open
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed w-full top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="#" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-black">
                <span className="text-white font-bold text-xs monospace">TS</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">TechSME</span>
            </a>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="text-sm text-gray-700 hover:text-black transition-colors monospace"
              >
                {link.name}
              </a>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#about" className="text-sm font-medium hover:text-gray-900">
              Contact
            </a>
            <Button 
              className="bg-black text-white hover:bg-gray-800 transition-colors rounded-md" 
              size="sm"
              onClick={() => scrollToSection("#about")}
            >
              Connect
            </Button>
          </div>
          
          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen ? "true" : "false"}
            >
              <span className="sr-only">Toggle menu</span>
              {mobileMenuOpen ? 
                <X className="h-5 w-5" /> : 
                <Menu className="h-5 w-5" />
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden fixed inset-x-0 top-16 z-40 border-b border-t border-gray-200 bg-white transform transition-all duration-200 ease-in-out ${
          mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="container py-4">
          <nav className="grid gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="flex items-center py-2 text-sm monospace"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="mt-6 grid gap-3">
            <a 
              href="#about" 
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#about");
              }}
              className="text-sm text-center py-2.5 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Contact
            </a>
            <a 
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#about");
              }}
              className="text-sm text-center py-2.5 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Connect
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
