import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

export default function NFT() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Set page title and meta description
    document.title = "NFT Fundraiser | Free Bar";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Support the first activist Palestinian chocolate bar by minting a limited-edition digital artwork. All proceeds help fund our launch and production.');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Support the first activist Palestinian chocolate bar by minting a limited-edition digital artwork. All proceeds help fund our launch and production.';
      document.head.appendChild(newMetaDescription);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: 'NFT Fundraiser | Free Bar' },
      { property: 'og:description', content: 'Own a piece of chocolate history. Support Free Bar by minting a limited-edition digital artwork.' },
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

  // For demonstration purposes - would be replaced with wallet connection logic
  const handleConnectWallet = () => {
    toast({
      title: "Wallet Connection",
      description: "Wallet connection feature coming soon!",
    });
  };

  // For waitlist functionality
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest(
        'POST',
        '/api/subscribe',
        { email }
      );

      const data = await response.json();
      toast({
        title: "Success!",
        description: "You've been added to our NFT waitlist. We'll notify you when minting is available!",
      });
      setEmail('');
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to join waitlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-green">FREE BAR</h1>
          </Link>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-watermelon heading">
              <span className="uneven-text block">OWN A PIECE OF</span>
              <span className="uneven-text block">CHOCOLATE HISTORY</span>
            </h2>
            <p className="text-xl mb-6 text-dark/80 max-w-xl mx-auto">
              Support the first activist Palestinian chocolate bar by minting a limited-edition digital artwork. All proceeds help fund our launch and production.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-offwhite p-6 rounded-md shadow-md">
                <div className="border-4 border-dashed border-watermelon p-4 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-watermelon mb-4 uneven-text">THIS BAR IS A PROTEST</h3>
                    <div className="w-48 h-64 mx-auto bg-paper border-4 border-watermelon flex items-center justify-center">
                      <p className="text-green font-bold text-sm">NFT Artwork Preview</p>
                    </div>
                    <p className="mt-4 text-sm text-dark/70">Limited Edition NFT #1 of 50</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-green mb-4 uneven-text">MINT YOUR FREE BAR NFT</h3>
                  <p className="mb-6 text-dark/80">
                    Each NFT directly supports our mission to create activist chocolate that funds Palestinian relief efforts.
                  </p>
                  
                  <div className="space-y-4">
                    <Button 
                      onClick={handleConnectWallet}
                      className="w-full chunky-btn bg-watermelon hover:bg-watermelon/90 text-offwhite py-3 px-6"
                    >
                      CONNECT WALLET
                    </Button>
                    <p className="text-center text-dark/60 text-sm">
                      Powered by <span className="font-bold">Zora</span>
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-dark/20 pt-6">
                  <h4 className="text-xl font-bold text-dark mb-3">New to NFTs? Join our waitlist:</h4>
                  <form onSubmit={handleJoinWaitlist} className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      className="w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      className="w-full chunky-btn bg-green hover:bg-green/90 text-offwhite py-3 px-6"
                      disabled={submitting}
                    >
                      {submitting ? 'SUBMITTING...' : 'JOIN WAITLIST'}
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-3xl mx-auto mb-16"
          >
            <h3 className="text-2xl font-bold text-green mb-6 uneven-text">FREQUENTLY ASKED QUESTIONS</h3>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-dark font-bold">
                  What is an NFT and how does it support Free Bar?
                </AccordionTrigger>
                <AccordionContent className="text-dark/80">
                  NFTs (Non-Fungible Tokens) are unique digital assets that represent ownership of a specific item. 
                  By purchasing a Free Bar NFT, you're directly funding our production, distribution, and activism efforts. 
                  100% of proceeds go toward launching our Palestinian chocolate initiative.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-dark font-bold">
                  How do I purchase an NFT?
                </AccordionTrigger>
                <AccordionContent className="text-dark/80">
                  To purchase an NFT, you'll need a cryptocurrency wallet (like MetaMask) and some Ethereum. 
                  Click "Connect Wallet" above, and the minting platform will guide you through the process. 
                  If you're new to NFTs, join our waitlist for step-by-step assistance.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-dark font-bold">
                  Why are you using NFTs for fundraising?
                </AccordionTrigger>
                <AccordionContent className="text-dark/80">
                  NFTs allow us to raise funds while giving supporters something meaningful in return. 
                  They provide transparent tracking of contributions, create a community of supporters, 
                  and align with our values of decentralization and direct support.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-dark font-bold">
                  What benefits do NFT holders receive?
                </AccordionTrigger>
                <AccordionContent className="text-dark/80">
                  NFT holders receive: (1) The limited edition digital artwork, (2) Early access to new chocolate releases, 
                  (3) Voting rights on certain project decisions, and (4) Special recognition in our community. 
                  You'll be a founding supporter of a movement for change.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="max-w-3xl mx-auto bg-offwhite p-6 rounded-md"
          >
            <h3 className="text-xl font-bold text-dark mb-4">Legal Disclaimer</h3>
            <p className="text-sm text-dark/70">
              NFT purchases are final and non-refundable. Free Bar NFTs are collectible digital items with no inherent monetary value. 
              NFTs are not investments and we make no promises regarding future value. You are responsible for understanding 
              the risks of blockchain technology and cryptocurrency. By purchasing, you agree to comply with all applicable laws 
              and regulations. All proceeds support the Free Bar project and Palestinian relief initiatives as described.
            </p>
          </motion.div>
          
          <div className="mt-8 text-center">
            <Link href="/" className="text-dark/80 hover:text-green">
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}