import { ArrowRight, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  // Footer navigation groups - in Sigma's clean, minimalist style
  const footerGroups = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#dashboard" },
        { label: "Pricing", href: "#" },
        { label: "Integrations", href: "#" },
        { label: "Changelog", href: "#" },
        { label: "Roadmap", href: "#" }
      ]
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Academy", href: "#" },
        { label: "Community", href: "#" },
        { label: "Support", href: "#" },
        { label: "FAQ", href: "#faq" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: "Contact", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Security", href: "#" },
        { label: "Cookies", href: "#" }
      ]
    }
  ];

  // Scroll to section function
  const scrollToSection = (href: string) => {
    if (href === "#") return;
    
    const targetElement = document.querySelector(href);
    if (targetElement) {
      const top = targetElement.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };

  return (
    <footer className="border-t border-gray-200 bg-white pt-16 pb-12">
      <div className="container">
        {/* Newsletter section - in clean Sigma style */}
        <div className="mb-12 pb-12 border-b border-gray-200">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-medium mb-3">Stay updated</h3>
              <p className="text-gray-600">Get product updates, company news, and more.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-2.5 border border-gray-300 rounded-md flex-1"
              />
              <button className="bg-black text-white px-5 py-2.5 rounded-md whitespace-nowrap hover:bg-gray-800 transition-colors flex items-center justify-center">
                Subscribe <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Links section - clean, organized grid layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Logo and company info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-black">
                <span className="text-white font-bold text-xs monospace">TS</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">TechSME</span>
            </div>
            
            <p className="text-gray-500 mb-4">
              The modern platform that combines the power of a BI tool with the familiarity of a spreadsheet.
            </p>
            
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Navigation groups */}
          {footerGroups.map((group, index) => (
            <div key={index}>
              <h4 className="text-sm font-medium text-gray-900 mb-4">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Copyright - simple and clean */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} TechSME. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
