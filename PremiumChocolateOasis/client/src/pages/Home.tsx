import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Home() {
  const [showPopupBanner, setShowPopupBanner] = useState(true);

  useEffect(() => {
    // Set page title and meta description
    document.title = "FREE BAR | Fund Premium Chocolate";
    const metaDescription = document.querySelector("meta[name='description']");
    if (metaDescription) {
      metaDescription.setAttribute("content", "Help fund the first batch of FREE BAR - premium dark chocolate with Palestinian-inspired flavors.");
    } else {
      const newMetaDescription = document.createElement("meta");
      newMetaDescription.name = "description";
      newMetaDescription.content = "Help fund the first batch of FREE BAR - premium dark chocolate with Palestinian-inspired flavors.";
      document.head.appendChild(newMetaDescription);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: "og:title", content: "FREE BAR | Fund Premium Chocolate" },
      { property: "og:description", content: "A bold statement in chocolate form. Pre-order or contribute to fund our first production run." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: window.location.href },
    ];

    ogTags.forEach(tag => {
      const existingTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (existingTag) {
        existingTag.setAttribute("content", tag.content);
      } else {
        const newTag = document.createElement("meta");
        newTag.setAttribute("property", tag.property);
        newTag.setAttribute("content", tag.content);
        document.head.appendChild(newTag);
      }
    });

    // Animation on scroll functionality
    const handleScroll = () => {
      const elements = document.querySelectorAll(".appear-animation");
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        
        if (rect.top <= windowHeight * 0.85) {
          el.classList.add("appear-visible");
        }
      });
    };

    // Initial check and add event listener
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    
    // Clean up event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Smooth scroll functionality
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Popup Event Banner */}
      {showPopupBanner && (
        <motion.div 
          className="fixed top-0 left-0 w-full bg-watermelon z-50 text-offwhite py-3 px-4 flex items-center justify-center"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex-1"></div>
            <p className="text-center font-bold flex-auto">
              🍫 Help fund our premium chocolate production! <Link href="/checkout" className="underline ml-2 font-bold">Contribute now!</Link>
            </p>
            <button 
              onClick={() => setShowPopupBanner(false)}
              className="flex-1 flex justify-end"
              aria-label="Close banner"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}

      <div className={`${showPopupBanner ? 'pt-12' : ''}`}>
        <Navbar scrollToSection={scrollToSection} />
        <Hero scrollToSection={scrollToSection} />
        
        {/* Fund the First Batch Section */}
        <section id="fund-chocolate" className="py-16 bg-offwhite">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-watermelon mb-6 heading">
                <span className="uneven-text inline-block">🍫 Fund the First Batch of FREE BAR</span>
              </h2>
              <p className="text-xl text-dark mb-6">
                A bold, premium dark chocolate inspired by Palestine.
              </p>
              <div className="bg-watermelon/10 p-6 rounded-xl mb-10">
                <p className="text-lg font-bold">This is not a donation.<br/>It's a pre-sale to fund our first production run.</p>
              </div>
              <div className="flex justify-center">
                <Link href="/checkout">
                  <button className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-8 text-lg">
                    Fund the Chocolate →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why We're Raising Funds Section */}
        <section id="why-funding" className="py-16 bg-paper">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-green mb-6 heading">
                <span className="uneven-text inline-block">❗ Why We're Raising Funds</span>
              </h2>
              <p className="text-center text-dark mb-8 text-lg">
                We've developed something special:<br/>
                Dark chocolate infused with ingredients from Palestine and the Mediterranean – almonds, olive oil, sea salt, dates, and more.
              </p>
              
              {/* Image Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="/attached_assets/image_1746805689034.png" 
                    alt="Olive grove in Palestine" 
                    className="w-full h-32 object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="/attached_assets/image_1746805711311.png" 
                    alt="Date palm harvest" 
                    className="w-full h-32 object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="/attached_assets/image_1746805561664.png" 
                    alt="Chocolate maker" 
                    className="w-full h-32 object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img 
                    src="/attached_assets/image_1746805702471.png" 
                    alt="Mediterranean sea salt" 
                    className="w-full h-32 object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              
              <p className="text-center text-dark mb-8 text-lg">
                Now we need your help to produce the first bars.
              </p>
              <div className="bg-green/10 p-6 rounded-xl text-center mb-10">
                <p className="text-lg font-bold mb-2">Your support covers production.</p>
                <p className="text-lg">You're not buying a product that exists — you're helping make it real.</p>
              </div>
              <div className="flex justify-center">
                <Link href="/checkout">
                  <button className="chunky-btn bg-green hover:bg-green/90 text-offwhite py-3 px-8 text-lg">
                    Fund the Chocolate →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* The Flavours Section */}
        <section id="flavours" className="py-16 bg-offwhite">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gold mb-6 heading">
                <span className="uneven-text inline-block">💥 The Flavours</span>
              </h2>
              <div className="text-center mb-8">
                <p className="text-xl font-bold mb-2">Each bar: £21.99</p>
                <p className="text-lg mb-8">Each purchase = one step closer to launch.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-offwhite p-6 rounded-xl shadow-md border-t-4 border-green">
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img 
                      src="/attached_assets/image_1747692983704.png" 
                      alt="Olive Branch chocolate" 
                      className="w-full h-auto transform hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-green">Olive Branch</h3>
                  <p className="text-dark">Almond & olive oil with premium dark chocolate, featuring a beautiful olive branch design and sea salt highlights.</p>
                </div>
                
                <div className="bg-offwhite p-6 rounded-xl shadow-md border-t-4 border-gold">
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img 
                      src="/attached_assets/image_1747692978510.png" 
                      alt="Citrus Gold chocolate" 
                      className="w-full h-auto transform hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gold">Citrus Gold</h3>
                  <p className="text-dark">Dark chocolate squares with almonds and crystallized sea salt, featuring a rich glossy finish and golden highlights.</p>
                </div>
                
                <div className="bg-offwhite p-6 rounded-xl shadow-md border-t-4 border-watermelon">
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img 
                      src="/attached_assets/image_1747693019196.png" 
                      alt="Sweet Delight chocolate" 
                      className="w-full h-auto transform hover:scale-105 transition-transform"
                    />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-watermelon">Sweet Delight</h3>
                  <p className="text-dark">Date, fig & tahini swirl with luxurious marbling and traditional Palestinian patterns embossed on each square.</p>
                </div>
              </div>
              
              <p className="text-center text-dark mb-8 text-lg font-bold">
                All made with bold, premium 75% dark chocolate.
              </p>
              
              <div className="flex justify-center">
                <Link href="/checkout">
                  <button className="chunky-btn bg-gold hover:bg-gold/90 text-dark py-3 px-8 text-lg">
                    Pre-Order Now →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* What Your Contribution Covers Section */}
        <section id="contribution-covers" className="py-16 bg-paper">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-watermelon mb-6 heading">
                <span className="uneven-text inline-block">🧱 What Your Contribution Covers</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-offwhite p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-bold mb-2 text-dark">Small-batch manufacturing</h3>
                </div>
                
                <div className="bg-offwhite p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-bold mb-2 text-dark">Ingredient sourcing</h3>
                </div>
                
                <div className="bg-offwhite p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-bold mb-2 text-dark">Packaging & shipping</h3>
                </div>
                
                <div className="bg-offwhite p-6 rounded-xl shadow-md">
                  <h3 className="text-lg font-bold mb-2 text-dark">Production setup costs</h3>
                </div>
              </div>
              
              <p className="text-center text-dark mb-8 text-lg font-bold">
                This is about craft, not mass production.
              </p>
              
              <div className="flex justify-center">
                <Link href="/checkout">
                  <button className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-8 text-lg">
                    Fund the Chocolate →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why It Matters Section */}
        <section id="why-matters" className="py-16 bg-offwhite">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-green mb-6 heading">
                <span className="uneven-text inline-block">🕊️ Why It Matters</span>
              </h2>
              
              <div className="bg-green/10 p-6 rounded-xl text-center mb-8">
                <p className="text-lg font-bold mb-2">FREE BAR is a statement, not a slogan.</p>
                <p className="text-lg">The bar carries the message — through its name, flavour, and origin.</p>
              </div>
              
              <p className="text-center text-dark mb-10 text-lg font-bold">
                This isn't a charity product.<br/>
                It's a bold chocolate bar with something to say.
              </p>
              
              <div className="flex justify-center">
                <Link href="/checkout">
                  <button className="chunky-btn bg-green hover:bg-green/90 text-offwhite py-3 px-8 text-lg">
                    Support the Message →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Pre-Order or Contribute Now Section */}
        <section id="pre-order" className="py-16 bg-paper">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-gold mb-6 heading">
                <span className="uneven-text inline-block">✅ Pre-Order or Contribute Now</span>
              </h2>
              
              <p className="text-center text-dark mb-8 text-lg">
                Support starts at £5.<br/>
                Pre-order a bar for £21.99 and help us make it happen.
              </p>
              
              <div className="flex justify-center">
                <Link href="/checkout">
                  <button className="chunky-btn bg-gold hover:bg-gold/90 text-dark py-4 px-10 text-xl">
                    Fund the Chocolate →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    </div>
  );
}