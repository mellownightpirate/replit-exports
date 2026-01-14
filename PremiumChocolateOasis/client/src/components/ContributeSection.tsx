import React from 'react';
import { motion } from 'framer-motion';
import { ParticipationForm } from './ParticipationForm';

interface ContributeSectionProps {
  scrollToSection?: (id: string) => void;
}

export const ContributeSection: React.FC<ContributeSectionProps> = ({ scrollToSection }) => {
  return (
    <section id="join" className="bg-offwhite py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="max-w-lg"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-green heading">
                <span className="uneven-text block">JOIN THE</span>
                <span className="uneven-text block text-watermelon">MOVEMENT</span>
              </h2>
              
              <div className="mb-8 space-y-4">
                <p className="text-xl font-medium text-dark">
                  Want to help, but not ready to buy?
                </p>
                <p className="text-lg text-dark/80">
                  Give us feedback, share your skills, or join our crew.
                </p>
                <p className="text-lg text-dark/80">
                  We're a movement, not a company.
                </p>
                
                <div className="md:hidden mt-6">
                  <motion.button
                    onClick={() => scrollToSection && scrollToSection('join-form')}
                    className="chunky-btn bg-green hover:bg-green/90 text-offwhite py-3 px-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    JOIN US →
                  </motion.button>
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="mt-6 text-dark/70 space-y-2">
                  <div className="flex items-center">
                    <span className="bg-green w-3 h-3 rounded-full mr-2"></span>
                    <span>Give feedback on products</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-watermelon w-3 h-3 rounded-full mr-2"></span>
                    <span>Help make chocolate</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-yellow w-3 h-3 rounded-full mr-2"></span>
                    <span>Share on socials</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-green w-3 h-3 rounded-full mr-2"></span>
                    <span>Sell or distribute Free Bar</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            id="join-form"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <ParticipationForm />
          </motion.div>
        </div>
      </div>
    </section>
  );
};