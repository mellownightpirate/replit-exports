import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { heroPackagedChocolate, fairTradeLogo } from "@/lib/images";

interface HeroProps {
  scrollToSection: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ scrollToSection }) => {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-watermelon/5 z-[-2]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.div 
        className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl z-[-1]"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-56 h-56 bg-green/10 rounded-full blur-3xl z-[-1]"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <motion.div 
            className="md:w-1/2 mb-8 md:mb-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="blister-pack relative max-w-md mx-auto">
              <img 
                src={heroPackagedChocolate} 
                alt="FREE BAR - Premium Chocolate in collectible packaging" 
                className="w-full h-auto mb-4"
              />
              <div className="absolute -bottom-3 -left-3 bg-gold text-dark px-4 py-2 rounded-lg font-bold shadow-lg transform rotate-[-3deg] z-10">
                FOR PALESTINE
              </div>
              <div className="flex gap-2 mt-4 justify-center">
                <div className="w-8 h-8 rounded-full bg-green border-2 border-offwhite shadow-md"></div>
                <div className="w-8 h-8 rounded-full bg-watermelon border-2 border-offwhite shadow-md"></div>
                <div className="w-8 h-8 rounded-full bg-gold border-2 border-offwhite shadow-md"></div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 text-center md:text-left"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-watermelon mb-4 heading leading-none">
              <span className="uneven-text inline-block">FUND THE</span> <br/>
              <span className="uneven-text inline-block">FIRST BATCH</span> <br/>
              <span className="uneven-text inline-block">OF FREE BAR</span>
            </h1>
            <p className="text-xl mb-6 text-dark/80 font-medium">
              Bold, premium dark chocolate inspired by Palestine. <br/>
              This is not a donation. It's a pre-sale to fund our first production run.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-start justify-center mb-6">
              <Link href="/checkout">
                <motion.button
                  className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-8 text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  PRE-ORDER £21.99
                </motion.button>
              </Link>
              <motion.button
                onClick={() => scrollToSection('fund-chocolate')}
                className="chunky-btn bg-green hover:bg-green/90 text-offwhite py-3 px-8 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                LEARN MORE
              </motion.button>
            </div>
            
            <div className="mb-6 bg-paper p-5 border-2 border-dashed border-dark/30 max-w-lg">
              <h4 className="text-lg font-bold text-watermelon mb-2">Why we need your support:</h4>
              <p className="text-dark/80 mb-4">
                Your contribution helps us produce our first batch of premium Palestinian-inspired chocolate. 
                Each bar is a statement through its name, flavor, and origin.
              </p>
              <motion.button
                onClick={() => scrollToSection('why-matters')}
                className="chunky-btn bg-gold hover:bg-gold/90 text-dark py-3 px-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                WHY IT MATTERS →
              </motion.button>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};
