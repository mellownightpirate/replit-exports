import { useState } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Minus, HelpCircle } from "lucide-react";

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<string>("item-0");
  
  // FAQ items in a clean, minimal style similar to Sigma
  const faqItems = [
    {
      question: "What makes this platform different from traditional BI tools?",
      answer: "Our platform combines the power of a traditional BI tool with the familiarity of a spreadsheet interface. This means business users can leverage advanced analytics without a steep learning curve, while data teams can implement complex models and ensure data governance."
    },
    {
      question: "Do I need to move my data to use this platform?",
      answer: "No. Our platform connects directly to your existing data warehouse through a live connection. There's no need for ETL or data duplication, meaning you're always working with the most current data available."
    },
    {
      question: "Is it possible to collaborate with team members?",
      answer: "Absolutely. The platform is built for collaboration, allowing multiple users to work on the same analysis simultaneously. You can share workbooks, dashboards, and individual analyses with specific colleagues or teams, and set appropriate permissions."
    },
    {
      question: "How does the pricing structure work?",
      answer: "We offer flexible pricing based on your organization's needs. Plans start with a free tier for individuals and small teams, with premium options for enterprises requiring advanced features, dedicated support, and custom integrations. Contact our sales team for a tailored quote."
    },
    {
      question: "What kind of support is available?",
      answer: "All plans include access to our comprehensive documentation and community forums. Premium plans feature dedicated support with guaranteed response times, training sessions, and a dedicated account manager to ensure your success."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-white relative">
      {/* Notion-style decorative elements */}
      <div className="absolute top-40 right-20 w-40 h-40 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      <div className="absolute top-20 left-20 w-40 h-40 bg-green-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      
      <div className="container relative">
        <div className="max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">Frequently asked questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about the platform
            </p>
          </motion.div>
        </div>

        {/* Hand-drawn style illustration - Notion-inspired */}
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute -top-16 -left-16 hidden lg:block">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <HelpCircle className="absolute top-5 left-5 h-8 w-8 text-blue-400" />
              <path d="M30,30 C60,10 90,50 60,80" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
            </svg>
          </div>
          
          {/* Questions in clean Sigma style with Notion touches */}
          <Accordion 
            type="single" 
            collapsible 
            value={openItem} 
            onValueChange={setOpenItem} 
            className="space-y-4"
          >
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:no-underline flex justify-between items-center">
                    <span>{item.question}</span>
                    <div className="flex-shrink-0 ml-4">
                      {openItem === `item-${index}` ? (
                        <Minus className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Plus className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2 text-gray-600">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
          
          {/* Support banner in Sigma's clean style */}
          <div className="mt-16 bg-gray-50 border border-gray-200 rounded-lg p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div>
              <h3 className="text-lg font-medium mb-2">Still have questions?</h3>
              <p className="text-gray-600">We're here to help. Contact our support team for personalized assistance.</p>
            </div>
            <button className="px-6 py-3 bg-black text-white rounded-md whitespace-nowrap hover:bg-gray-800 transition-colors">
              Contact support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
