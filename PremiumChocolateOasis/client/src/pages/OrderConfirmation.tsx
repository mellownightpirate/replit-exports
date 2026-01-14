import React, { useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { heroPackagedChocolate } from '@/lib/images';

export default function OrderConfirmation() {
  useEffect(() => {
    // Set page title and meta description
    document.title = "Contribution Confirmed | Free Bar";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Thank you for funding Free Bar chocolate production.');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Thank you for funding Free Bar chocolate production.';
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper pt-24 pb-16 flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex flex-col items-center justify-center max-w-lg">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="bg-green text-offwhite inline-flex items-center justify-center w-20 h-20 rounded-full mb-6">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-10 w-10" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
          <p className="text-lg text-dark/80 mb-8">
            Your contribution to Free Bar chocolate production has been received and is greatly appreciated.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-offwhite p-6 rounded-md shadow-md w-full mb-8"
        >
          <div className="flex items-center mb-4">
            <img 
              src={heroPackagedChocolate} 
              alt="Free Bar Chocolate" 
              className="w-20 h-auto mr-4"
            />
            <div>
              <h2 className="font-bold">Free Bar Chocolate</h2>
              <p className="text-sm text-dark/70">Premium Mediterranean-inspired Chocolate</p>
              <p className="mt-1 font-bold">Production Funding</p>
            </div>
          </div>
          
          <div className="border-t border-dark/10 pt-4 mt-4">
            <p className="text-sm text-dark/70 mb-1">
              A confirmation email has been sent with your contribution details.
            </p>
            <p className="text-sm text-dark/70">
              If you have any questions, please contact us at info@freebar.com
            </p>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Button asChild className="chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite px-6 mb-4">
            <Link href="/">
              Return to Homepage
            </Link>
          </Button>
          <p className="text-sm text-dark/60">
            Your contribution helps bring our premium chocolate to life.
          </p>
        </motion.div>
      </div>
    </div>
  );
}