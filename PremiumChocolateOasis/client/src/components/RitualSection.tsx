import React from "react";
import { motion } from "framer-motion";

export const RitualSection: React.FC = () => {
  const features = [
    {
      number: 1,
      title: "Unique Flavors",
      description: "Distinctive Mediterranean-inspired flavor combinations that create a truly unique chocolate experience.",
      icon: "🍫"
    },
    {
      number: 2,
      title: "Premium Ingredients",
      description: "We use only high-quality ingredients selected for their distinctive taste profiles.",
      icon: "✨"
    },
    {
      number: 3,
      title: "Artisanal Process",
      description: "Carefully crafted in small batches to ensure consistent quality and exceptional taste.",
      icon: "🔍"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="ritual" className="py-16 bg-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="appear-animation"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl heading text-center mb-4 text-watermelon">
            <span className="uneven-text inline-block">OUR PROCESS</span>
          </h2>
          <p className="text-center text-dark/80 max-w-2xl mx-auto mb-16">
            Creating exceptional chocolate requires attention to detail at every step of the process.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 appear-animation"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.number}
              className="relative bg-offwhite p-8 rounded-xl text-center border border-watermelon/20 shadow-xl overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-watermelon/5 rounded-full -mt-10 -mr-10 z-0"></div>
              <div className={`relative z-10 w-16 h-16 flex items-center justify-center ${feature.number === 2 ? 'bg-green' : 'bg-watermelon'} rounded-xl text-offwhite mx-auto mb-6 transform -rotate-3 shadow-lg`}>
                <span className="text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-dark uppercase tracking-wider">{feature.title}</h3>
              <p className="text-dark/80 mb-4">{feature.description}</p>
              <div className="w-16 h-1 bg-gold mx-auto"></div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="mt-16 bg-dark/5 rounded-xl p-8 max-w-4xl mx-auto appear-animation"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="rounded-xl overflow-hidden relative aspect-video">
                <img 
                  src="https://images.unsplash.com/photo-1606312619070-d48b4c652a52?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&h=562" 
                  alt="Chocolate making process" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 text-left">
              <h3 className="text-2xl font-bold mb-4 text-dark">Crafted With Care</h3>
              <p className="text-dark/80 mb-6">
                Our chocolate making process combines traditional techniques with innovative flavor combinations to create something truly special.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green rounded-full flex items-center justify-center mr-3 text-offwhite font-bold">✓</div>
                  <span className="text-dark/80">Distinctive flavor profiles</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green rounded-full flex items-center justify-center mr-3 text-offwhite font-bold">✓</div>
                  <span className="text-dark/80">Meticulous quality control</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green rounded-full flex items-center justify-center mr-3 text-offwhite font-bold">✓</div>
                  <span className="text-dark/80">Small batch production</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
