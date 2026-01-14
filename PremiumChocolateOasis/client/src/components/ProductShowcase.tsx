import React from "react";
import { motion } from "framer-motion";
import { chocolateCloseup, oliveChocolate, chocolateSquares } from "@/lib/images";

export const ProductShowcase: React.FC = () => {
  return (
    <section className="py-16 bg-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <motion.div
              className="appear-animation relative"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.5 }}
            >
              <div className="blister-pack">
                <img 
                  src={chocolateSquares} 
                  alt="Premium Palestinian chocolate squares with almonds and sea salt" 
                  className="w-full h-auto mx-auto"
                />
                <div className="absolute bottom-6 left-6 transform rotate-[-5deg] palestinan-badge px-3 py-1 font-bold text-dark text-sm shadow-md">
                  OLIVE BRANCH
                </div>
                <div className="absolute top-6 right-6 bg-watermelon text-offwhite text-xs rounded-full h-16 w-16 flex items-center justify-center shadow-lg font-bold">
                  <div className="text-center leading-tight">
                    <div className="text-lg">75%</div>
                    <div className="text-xs">COCOA</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <span className="bg-green/10 text-green px-3 py-1 rounded-full text-sm font-bold">Olive Oil</span>
                <span className="bg-watermelon/10 text-watermelon px-3 py-1 rounded-full text-sm font-bold">Mediterranean Sea Salt</span>
                <span className="bg-gold/10 text-dark px-3 py-1 rounded-full text-sm font-bold">Palestinian Almonds</span>
              </div>
            </motion.div>
          </div>
          <div className="md:w-1/2">
            <motion.div className="appear-animation">
              <div className="arabic-detail mb-2">مذاق الحرية</div>
              <h2 className="text-3xl md:text-5xl heading mb-6 text-watermelon">
                <span className="uneven-text inline-block">QUALITY.</span> <br/>
                <span className="uneven-text inline-block">CAUSE.</span> <br/>
                <span className="uneven-text inline-block">IMPACT.</span>
              </h2>
              <p className="text-lg text-dark/80 mb-6">
                This isn't just chocolate – it's a statement. Every FREE BAR delivers exceptional taste while supporting the Palestinian cause through direct action and awareness.
              </p>
              <div className="bg-green/10 p-4 rounded-xl mb-8">
                <div className="text-green handwritten text-xl italic mb-2">
                  "Every package we produce provides on-the-ground support"
                </div>
                <p className="text-dark/80 text-sm">
                  100% of our profits fund medical aid, community rebuilding, and educational programs.
                </p>
              </div>
              <motion.button
                className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                EXPLORE OUR FLAVOURS
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
