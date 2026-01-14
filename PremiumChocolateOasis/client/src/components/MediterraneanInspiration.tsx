import React from "react";
import { motion } from "framer-motion";
import { oliveTreesField, gazaCoast, dateFarm } from "@/lib/images";

export const MediterraneanInspiration: React.FC = () => {
  const images = [
    {
      id: 1,
      src: oliveTreesField,
      alt: "Ancient olive groves in the Mediterranean",
      caption: "Olive Groves",
      description: "Centuries-old olive trees that provide the oil for our chocolate"
    },
    {
      id: 2,
      src: gazaCoast,
      alt: "Mediterranean coast with sea salt",
      caption: "Mediterranean Coast",
      description: "Where we source our natural sea salt, adding a touch of the Mediterranean"
    },
    {
      id: 3,
      src: dateFarm,
      alt: "Mediterranean date palms with dates and chocolate",
      caption: "Date Farms",
      description: "Sweet Medjool dates for our date & tahini bar"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-16 bg-watermelon/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl md:text-5xl heading text-center mb-4 text-watermelon appear-animation"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="uneven-text inline-block">MEDITERRANEAN INSPIRATION</span>
          </motion.h2>
          <p className="text-center text-dark/80 max-w-2xl mx-auto">
            Our flavors celebrate the rich culinary heritage and agricultural traditions of the Mediterranean region.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {images.map((image) => (
            <motion.div 
              key={image.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <div className="relative rounded-xl overflow-hidden shadow-xl">
                <img 
                  src={image.src} 
                  alt={image.alt} 
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent opacity-80"></div>
                <div className="absolute bottom-0 left-0 p-6 text-offwhite">
                  <h3 className="text-xl font-bold mb-1">{image.caption}</h3>
                  <p className="text-sm opacity-90">{image.description}</p>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-watermelon text-offwhite px-3 py-1 rounded-lg text-sm shadow-md transform rotate-3">
                    AUTHENTIC
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 py-8 px-6 bg-offwhite rounded-xl shadow-md max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/4 flex justify-center">
              <div className="w-24 h-24 bg-watermelon rounded-full flex items-center justify-center text-offwhite text-4xl shadow-lg">
                🫒
              </div>
            </div>
            <div className="md:w-3/4 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2 text-dark">Sustainable Agriculture</h3>
              <p className="text-dark/80">
                FREE BAR is committed to working with farming cooperatives, providing sustainable income opportunities while preserving traditional farming practices. Our ingredient sourcing program supports family farms and traditional agricultural methods across the Mediterranean region.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
