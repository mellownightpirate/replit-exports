import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Link } from 'wouter';

interface HelpFormProps {
  className?: string;
}

export const HelpForm: React.FC<HelpFormProps> = ({ className }) => {
  useEffect(() => {
    // Load Gumroad script
    const script = document.createElement('script');
    script.src = 'https://gumroad.com/js/gumroad.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <motion.div
      className={`w-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-t-4 border-green overflow-hidden shadow-md">
          <CardHeader className="bg-green/10 pb-4">
            <CardTitle className="text-xl md:text-2xl text-green">Join Our Team</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Google Form Embed */}
            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSdWv3bAYHEVkNtbSZTJ7bsGIE-wZ_GMqj0l02nDCJnDVlp5nQ/viewform?embedded=true" 
              width="100%" 
              height="500" 
              frameBorder="0" 
              marginHeight={0} 
              marginWidth={0}
              title="Help Form"
            >
              Loading form...
            </iframe>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-watermelon overflow-hidden shadow-md">
          <CardHeader className="bg-watermelon/10 pb-4">
            <CardTitle className="text-xl md:text-2xl text-watermelon">Fund Our Chocolate Production</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-6 text-dark/80">
              Help us bring Free Bar to life by funding our chocolate production. Your contribution will directly support the creation of our premium chocolate bar!
            </p>
            
            {/* Direct funding via Stripe */}
            <Link href="/checkout">
              <button className="w-full chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-6 mb-6">
                CONTRIBUTE NOW
              </button>
            </Link>
            
            <div className="mt-6 p-4 bg-gold/10 rounded-md">
              <h4 className="font-bold text-gold mb-2">What your funding supports:</h4>
              <ul className="list-disc pl-5 space-y-2 text-dark/80">
                <li>Premium ingredient sourcing</li>
                <li>Production equipment and facilities</li>
                <li>Recipe testing and refinement</li>
                <li>Bringing our concept to market</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};