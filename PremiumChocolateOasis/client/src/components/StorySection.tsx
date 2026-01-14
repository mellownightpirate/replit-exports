import React from "react";
import { motion } from "framer-motion";
import { chocolateMaker } from "@/lib/images";

export const StorySection: React.FC = () => {
  return (
    <section id="story" className="py-16 bg-watermelon text-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <motion.div 
              className="appear-animation"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl heading mb-6">
                <span className="uneven-text inline-block">OUR MISSION</span>
              </h2>
              <p className="text-offwhite/90 mb-4">
                FREE BAR was born from a simple idea: extraordinary chocolate can create extraordinary experiences. We're passionate about crafting premium chocolate that stands out from the crowd.
              </p>
              <p className="text-offwhite/90 mb-4">
                We're a team of food enthusiasts, chocolatiers, and flavor innovators who believe that pleasure and quality can—and should—exist together. Every aspect of our chocolate bars is designed with intention.
              </p>
              <p className="text-offwhite/90 mb-4">
                From sourcing premium Mediterranean ingredients directly from farmers to creating unique flavor combinations, FREE BAR transforms a simple pleasure into a memorable experience.
              </p>
              <p className="text-offwhite/90 mb-8">
                We believe that quality should be accessible, and that small pleasures—like enjoying a chocolate bar—can bring joy to everyday life.
              </p>
              <div className="flex items-center">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Founder" 
                  className="w-12 h-12 rounded-full mr-4 border-2 border-offwhite"
                />
                <div>
                  <div className="text-xl font-bold">Ahmed Al-Khalidi</div>
                  <div className="text-offwhite/80 text-sm">Founder & Chocolatier</div>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="md:w-1/2">
            <motion.div 
              className="appear-animation relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="blister-pack bg-offwhite/10 border-watermelon/30">
                <img 
                  src={chocolateMaker} 
                  alt="Expert chocolatier crafting FREE BAR chocolate" 
                  className="w-full h-auto"
                />
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 font-bold shadow-lg rotate-[-2deg] text-center">
                  <span className="text-offwhite tracking-wider uppercase text-sm">
                    CRAFTED WITH PASSION
                  </span>
                </div>
              </div>
              <div className="mt-16 bg-offwhite/10 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green rounded-full flex items-center justify-center mr-4">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div>
                    <div className="font-bold">500+ Recipes Tested</div>
                    <div className="text-offwhite/80 text-sm">To create our perfect chocolate bars</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
