import { ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-12 border-t border-foreground pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo & Info */}
          <div className="md:col-span-4">
            <div className="flex items-center mb-4">
              <div className="px-3 py-1 border border-foreground">
                <span className="font-mono text-xl">AMIN/HASAN</span>
              </div>
            </div>
            <p className="font-mono text-xs leading-relaxed mb-6 opacity-70">
              Independent consultant specializing in Business Intelligence and Analytics solutions. 
              Helping organizations transform data into actionable insights.
            </p>
            
            <a 
              href="https://calendly.com/amin-hasan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-xs flex items-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="mr-2">BOOK A DISCOVERY CALL</span>
              <ArrowRight size={12} />
            </a>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-mono mb-4 opacity-70">SITEMAP</h3>
            <nav className="flex flex-col space-y-3">
              <a href="#" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">HOME</a>
              <a href="#about" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">ABOUT</a>
              <a href="#services" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">SERVICES</a>
              <a href="#experience" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">CASE STUDIES</a>
              <a href="#contact" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">CONTACT</a>
            </nav>
          </div>
          
          {/* Services */}
          <div className="md:col-span-3">
            <h3 className="text-sm font-mono mb-4 opacity-70">SERVICES</h3>
            <nav className="flex flex-col space-y-3">
              <a href="#services" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">BI TOOL SELECTION</a>
              <a href="#services" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">SEMANTIC LAYER DESIGN</a>
              <a href="#services" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">EMBEDDED ANALYTICS</a>
              <a href="#services" className="font-mono text-xs hover:opacity-100 opacity-70 transition-opacity">REAL-TIME ARCHITECTURES</a>
            </nav>
          </div>
          
          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-mono mb-4 opacity-70">CONTACT</h3>
            <div className="space-y-3">
              <a 
                href="mailto:a@hasan.co" 
                className="font-mono text-xs block hover:opacity-100 opacity-70 transition-opacity"
              >
                a@hasan.co
              </a>
              <span className="font-mono text-xs block opacity-70">
                London, United Kingdom
              </span>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-16 pt-6 border-t border-foreground/30 flex flex-col md:flex-row justify-between items-center">
          <div className="eink-divider mb-6 md:hidden"></div>
          <p className="font-mono text-xs opacity-70 mb-4 md:mb-0">
            © {currentYear} Amin Hasan. All rights reserved.
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:gap-10 items-center">
            <span className="font-mono text-xs opacity-70">
              Analytics Consultant
            </span>
            <div className="w-20 h-[1px] hidden md:block bg-foreground/30"></div>
            <span className="font-mono text-xs opacity-70">
              Data Strategy Specialist
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}