import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

type Testimonial = {
  id: number;
  initial: string;
  name: string;
  location: string;
  text: string;
  bgColor: string;
};

export const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      initial: "S",
      name: "Sarah K.",
      location: "New York, USA",
      text: "It's rare to find a product that tastes amazing AND makes a meaningful difference. The Olive Branch bar is simply incredible, and knowing 100% of profits support Palestinian relief makes it even sweeter.",
      bgColor: "bg-watermelon"
    },
    {
      id: 2,
      initial: "A",
      name: "Ahmed M.",
      location: "Toronto, Canada",
      text: "As a Palestinian, seeing a brand boldly stand with our cause while creating such delicious chocolate is inspiring. The Gaza Gold flavor reminds me of childhood treats with orange blossoms.",
      bgColor: "bg-green"
    },
    {
      id: 3,
      initial: "R",
      name: "Rachel T.",
      location: "London, UK",
      text: "FREE BAR isn't just about taste—it's about action. I've tried all three flavors and each one is exceptional. The packaging makes a great conversation starter about Palestinian rights and humanitarian issues.",
      bgColor: "bg-watermelon"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
    <section id="testimonials" className="py-16 bg-offwhite">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="appear-animation"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="arabic-detail mb-2 text-center">ما يقوله عملاؤنا</div>
          <h2 className="text-3xl md:text-5xl heading text-center mb-4 text-watermelon">
            <span className="uneven-text inline-block">CUSTOMER REVIEWS</span>
          </h2>
          <p className="text-center text-dark/80 max-w-2xl mx-auto mb-16">
            Hear from chocolate lovers who support our mission for a free Palestine through every delicious bite.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {testimonials.map((testimonial) => (
            <motion.div 
              key={testimonial.id}
              className="relative bg-offwhite p-8 rounded-xl appear-animation shadow-xl border border-watermelon/10"
              variants={itemVariants}
            >
              <div className="absolute -top-5 right-8">
                <div className="text-gold text-6xl">"</div>
              </div>
              <div className="mb-12 pt-6">
                <p className="text-dark/80">{testimonial.text}</p>
              </div>
              <div className="flex items-center">
                <div className={`w-14 h-14 ${testimonial.bgColor} rounded-xl -rotate-3 flex items-center justify-center text-offwhite font-bold shadow-md`}>
                  {testimonial.initial}
                </div>
                <div className="ml-4">
                  <div className="font-bold text-dark">{testimonial.name}</div>
                  <div className="text-sm text-dark/60">{testimonial.location}</div>
                </div>
                <div className="flex ml-auto">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold fill-current" />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1">
                <div className={`${testimonial.bgColor} h-full w-24 rounded-bl-xl`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="text-center mt-12">
          <motion.button
            className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-6 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            READ MORE REVIEWS
          </motion.button>
        </div>
      </div>
    </section>
  );
};
