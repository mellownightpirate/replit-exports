import React, { useState } from 'react';
import { trackEvent, trackConversion } from '@/lib/analytics';

export default function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Track the conversion
      trackConversion('waitlist_signup', { email });
      
      // Submit to our backend API
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName: '',
          source: 'waitlist_section'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit to waitlist');
      }
      
      setSuccess(true);
      setEmail('');
      
      console.log('Email submitted successfully to waitlist:', email);
    } catch (err) {
      console.error('Error submitting to waitlist:', err);
      setError('There was an error submitting your email. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="waitlist" className="bg-gray-800 text-white py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 scroll-animation">
            Join Our Tech Mentorship Waitlist
          </h2>
          <p className="text-lg mb-8 scroll-animation">
            Get early access to resources, special discounts, and be the first to know when spots open in our mentorship program.
          </p>
          
          <div className="max-w-lg mx-auto mb-8 scroll-animation">
            {success ? (
              <div className="bg-green-800 text-white p-4 rounded-lg">
                <p className="font-bold text-lg">Thank you for joining our waitlist!</p>
                <p className="mt-2">We'll send you personalized resources and updates.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-grow px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-[#06D6A0] hover:bg-[#05c090] rounded-full font-bold text-[#333333] transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
                </button>
              </form>
            )}
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>
          
          <p className="text-sm text-gray-400 scroll-animation">
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
}