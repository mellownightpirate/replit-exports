import React from "react";
import { motion } from "framer-motion";

export const ValueProposition: React.FC = () => {
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
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-16 bg-watermelon/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl heading text-center mb-4 text-watermelon appear-animation">
            <span className="uneven-text inline-block">CHOCOLATE WITH A MESSAGE</span>
          </h2>
          <p className="max-w-2xl mx-auto text-dark/80">
            More than just chocolate - Free Bar is our way of supporting Palestine through a unique taste experience with a powerful message in every bite.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.div 
            className="bg-offwhite p-8 rounded-xl flex flex-col items-center text-center shadow-lg border-t-4 border-watermelon"
            variants={itemVariants}
          >
            <div className="w-20 h-20 flex items-center justify-center bg-watermelon rounded-xl text-offwhite mb-6 shadow-lg transform -rotate-3">
              <span className="text-3xl">🫒</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-dark uppercase tracking-wider">Palestinian Inspired</h3>
            <p className="text-dark/80">
              Premium dark chocolate infused with distinctive Palestinian flavors - olive oil, za'atar, and almonds that create a unique taste experience celebrating Palestinian culture.
            </p>
          </motion.div>

          <motion.div 
            className="bg-offwhite p-8 rounded-xl flex flex-col items-center text-center shadow-lg border-t-4 border-green"
            variants={itemVariants}
          >
            <div className="w-20 h-20 flex items-center justify-center bg-green rounded-xl text-offwhite mb-6 shadow-lg transform -rotate-3">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-dark uppercase tracking-wider">A Chocolate Protest</h3>
            <p className="text-dark/80">
              Every bar is designed as a statement, from the bold packaging to the distinctive flavors. Our chocolate is a delicious form of advocacy for Palestinian recognition.
            </p>
          </motion.div>

          <motion.div 
            className="bg-offwhite p-8 rounded-xl flex flex-col items-center text-center shadow-lg border-t-4 border-gold"
            variants={itemVariants}
          >
            <div className="w-20 h-20 flex items-center justify-center bg-gold rounded-xl text-dark mb-6 shadow-lg transform -rotate-3">
              <span className="text-3xl">🍫</span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-dark uppercase tracking-wider">Message in Every Bite</h3>
            <p className="text-dark/80">
              Our chocolate carries the message of Palestine in every bite. When you share Free Bar chocolate, you're helping spread awareness through a delicious medium.
            </p>
          </motion.div>
        </motion.div>
        
        <div className="mt-16 text-center">
          <div className="inline-block bg-watermelon/10 rounded-xl px-6 py-4 max-w-2xl">
            <p className="text-watermelon font-bold text-lg">
              "Every bite is a stand. Free Palestine through the universal language of chocolate."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
