import React from "react";
import { motion } from "framer-motion";
import { oliveGrove } from "@/lib/images";

export const EthicalSourcing: React.FC = () => {
  return (
    <section className="py-16 bg-green text-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 mb-8 md:mb-0 order-2 md:order-1">
            <motion.div 
              className="appear-animation relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="blister-pack bg-offwhite/10 border-green/30">
                <img 
                  src={oliveGrove} 
                  alt="Olive grove with chocolate ingredients" 
                  className="w-full h-auto"
                />
                <div className="absolute top-4 right-4 px-4 py-1 font-bold shadow-md transform rotate-[3deg]">
                  PREMIUM QUALITY
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-offwhite/10 p-4 rounded-xl flex items-center">
                  <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mr-3 shadow-md text-xl">
                    🌱
                  </div>
                  <span className="text-sm font-bold">
                    Organic Certified
                  </span>
                </div>
                <div className="bg-offwhite/10 p-4 rounded-xl flex items-center">
                  <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mr-3 shadow-md text-xl">
                    💰
                  </div>
                  <span className="text-sm font-bold">
                    40% Above Market
                  </span>
                </div>
                <div className="bg-offwhite/10 p-4 rounded-xl flex items-center">
                  <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mr-3 shadow-md text-xl">
                    ♻️
                  </div>
                  <span className="text-sm font-bold">
                    Plastic-Free
                  </span>
                </div>
                <div className="bg-offwhite/10 p-4 rounded-xl flex items-center">
                  <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center mr-3 shadow-md text-xl">
                    🌍
                  </div>
                  <span className="text-sm font-bold">
                    Carbon Neutral
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="md:w-1/2 order-1 md:order-2">
            <motion.div 
              className="appear-animation"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl heading mb-6">
                <span className="uneven-text inline-block">QUALITY INGREDIENTS</span>
              </h2>
              <p className="text-offwhite/90 mb-4">
                We're passionate about creating exceptional chocolate using the finest ingredients from around the Mediterranean region.
              </p>
              <p className="text-offwhite/90 mb-4">
                Our cocoa is selected for its exceptional quality and distinctive character. We combine this with Mediterranean olive oil, almonds, and sea salt to create unique flavor combinations.
              </p>
              <p className="text-offwhite/90 mb-8">
                Every ingredient is chosen specifically for its flavor profile and quality, ensuring that each bar delivers an exceptional taste experience.
              </p>
              <motion.button 
                className="chunky-btn bg-offwhite hover:bg-offwhite/90 text-green py-3 px-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                OUR INGREDIENTS
              </motion.button>
              <div className="mt-6 bg-offwhite/10 p-4 rounded-xl">
                <div className="flex items-center">
                  <div className="w-12 h-12 text-3xl mr-4">✦</div>
                  <p className="handwritten text-xl">
                    "Quality ingredients create exceptional chocolate"
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
