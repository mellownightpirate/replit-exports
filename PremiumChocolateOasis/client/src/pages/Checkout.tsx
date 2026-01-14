import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Check } from 'lucide-react';

// Import Free Bar chocolate image
import chocolateBarImage from "@assets/founder_bar_2.png";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Checkout form component that uses Stripe Elements
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`,
          receipt_email: email,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
      // On success, the user will be redirected to the return_url
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <Label htmlFor="name">Name & full price</Label>
        <Input 
          id="name" 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name" 
          required
          className="mt-1"
        />
      </div>
      
      <div className="mb-4">
        <Label htmlFor="email">E-mail</Label>
        <Input 
          id="email" 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com" 
          required
          className="mt-1"
        />
      </div>
      
      <div className="mb-4">
        <PaymentElement options={{
          paymentMethodOrder: ['card'],
          defaultValues: {
            billingDetails: {
              email: email
            }
          }
        }} />
      </div>
      
      <Button 
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 font-bold"
      >
        {isLoading ? 'Processing...' : 'Become a Founding Supporter'}
      </Button>
      
      <div className="text-center mt-2">
        <a href="#" className="text-sm text-blue-600 hover:underline">or make a custom amount</a>
      </div>
      
      <div className="text-center">
        <a href="#" className="text-sm text-gray-500 hover:underline">No refunds allowed</a>
      </div>
    </form>
  );
};

// Main Checkout Component
export default function Checkout() {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Create PaymentIntent on component mount
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 10 // Default amount
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [toast]);

  useEffect(() => {
    // Set page title and meta description
    document.title = "Founding Supporter | Free Bar Chocolate";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Become a Founding Supporter of Free Bar - Mediterranean-inspired premium chocolate.');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Become a Founding Supporter of Free Bar - Mediterranean-inspired premium chocolate.';
      document.head.appendChild(newMetaDescription);
    }
  }, []);

  return (
    <div className="min-h-screen bg-watermelon/10 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image and Info Column */}
            <div>
              <div className="mb-6">
                <div className="blister-pack relative max-w-md mx-auto">
                  <img 
                    src={chocolateBarImage} 
                    alt="Free Bar Chocolate" 
                    className="w-full h-auto mb-4 shadow-lg"
                  />
                  <div className="absolute -bottom-3 -left-3 bg-gold text-dark px-4 py-2 rounded-lg font-bold shadow-lg transform rotate-[-3deg] z-10">
                    FOR PALESTINE
                  </div>
                  <div className="flex gap-2 mt-4 justify-center">
                    <div className="w-8 h-8 rounded-full bg-green border-2 border-offwhite shadow-md"></div>
                    <div className="w-8 h-8 rounded-full bg-watermelon border-2 border-offwhite shadow-md"></div>
                    <div className="w-8 h-8 rounded-full bg-gold border-2 border-offwhite shadow-md"></div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h1 className="text-xl font-bold">Free Bar - Founding Supporter Badge</h1>

              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h2 className="font-semibold mb-3">🍫 This bar is a protest.</h2>
                <p className="text-sm text-gray-600 mb-3">
                  Free Bar is the world's first chocolate brand built like a movement — bold, handmade, and rooted in justice.
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  We're sweet. We're fair. We're for Palestine.
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  But more than that: we're not waiting for perfection or permission. We're making something real — with your help.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h2 className="font-semibold mb-3">🎟️ Your Support Gets You:</h2>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>A digital <strong>Founding Supporter Badge</strong> — share it proudly</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span><strong>15% off</strong> your first chocolate bar when we launch</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Your <strong>name included in our founding drop credits</strong></span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>That feeling of <em>doing something</em>, not scrolling past</span>
                  </li>
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <h2 className="font-semibold mb-3">💥 What You're Funding:</h2>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Small-batch production of our first Free Bars</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Ethical packaging with a kefiyah-inspired design</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <span>Distribution to real people — not just digital hype</span>
                  </li>
                </ul>
              </div>
              
              <div className="text-sm text-gray-600 space-y-3 border-t border-gray-200 pt-4">
                <p>This isn't a traditional brand. We don't have angel investors.</p>
                <p>We have <em>you</em> — people who believe that even a chocolate bar can carry a message.</p>
                <p>Be one of our first 100 supporters. Help us wrap, fund, and fight for something bigger — one bite at a time.</p>
                
                <p className="pt-4 font-semibold">🎫 Price: Pay what you want (£5+ suggested)</p>
                <p>🎯 Goal: Get Free Bar into hands and hearts by summer</p>
                <p>📦 Launch: Bars in production now — supporters get early access</p>
                
                <p className="pt-4 font-semibold">Every bite is a stand.</p>
                <p>This badge is your place in that story.</p>
              </div>
            </div>
            
            {/* Checkout Form Column */}
            <div>
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ 
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#ff6b6b'
                    }
                  }
                }}>
                  <Card>
                    <CardContent className="p-6">
                      <CheckoutForm />
                    </CardContent>
                  </Card>
                </Elements>
              ) : (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-pink-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}