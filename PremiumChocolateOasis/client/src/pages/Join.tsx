import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ParticipationForm } from "@/components/ParticipationForm";
import { Link } from "wouter";
import { heroPackagedChocolate } from "@/lib/images";

export default function Join() {
  useEffect(() => {
    // Set page title and meta description
    document.title = "Join the Movement | Free Bar";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join the Free Bar movement. Support Palestinian justice through activism and community participation.');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Join the Free Bar movement. Support Palestinian justice through activism and community participation.';
      document.head.appendChild(newMetaDescription);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'Join the Movement | Free Bar' },
      { property: 'og:description', content: 'Join our community of activists supporting Palestinian justice through chocolate with purpose.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: window.location.href },
    ];

    ogTags.forEach(tag => {
      const existingTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', tag.content);
      } else {
        const newTag = document.createElement('meta');
        newTag.setAttribute('property', tag.property);
        newTag.setAttribute('content', tag.content);
        document.head.appendChild(newTag);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* Mobile-first join page */}
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-4"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-green">FREE BAR</h1>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-watermelon heading">
            <span className="uneven-text block">THIS BAR</span>
            <span className="uneven-text block">IS A PROTEST</span>
          </h2>
          <p className="text-xl mb-6 text-dark/80">
            Join our movement to support our chocolate activism.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <img 
            src={heroPackagedChocolate}
            alt="Free Bar Chocolate" 
            className="w-full h-auto rounded-md object-cover mx-auto max-w-xs shadow-lg"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-green mb-4 text-center uneven-text">JOIN THE MOVEMENT</h3>
          <ParticipationForm />
        </motion.div>
        
        <div className="mt-8 text-center">
          <Link href="/" className="text-dark/80 hover:text-green">
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}