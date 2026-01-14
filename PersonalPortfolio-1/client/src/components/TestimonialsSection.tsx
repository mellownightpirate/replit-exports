import { motion } from "framer-motion";
import { CheckCircle, Laptop, ShoppingCart, Building, LucideProps } from "lucide-react";

export default function TestimonialsSection() {
  // Simple letter logos in a subdued style
  const CompanyLogo = ({ letter, ...props }: { letter: string } & LucideProps) => (
    <div className="h-8 w-8 md:h-10 md:w-10 rounded-md border border-gray-200 flex items-center justify-center bg-white text-gray-400">
      <span className="text-sm font-medium monospace">{letter}</span>
    </div>
  );
  
  const companies = [
    { icon: <CompanyLogo letter="M" className="h-6 w-6 md:h-8 md:w-8" />, name: "Microsoft" },
    { icon: <CompanyLogo letter="A" className="h-6 w-6 md:h-8 md:w-8" />, name: "Amazon" },
    { icon: <CompanyLogo letter="G" className="h-6 w-6 md:h-8 md:w-8" />, name: "Google" },
    { icon: <CompanyLogo letter="S" className="h-6 w-6 md:h-8 md:w-8" />, name: "Slack" },
    { icon: <CompanyLogo letter="A" className="h-6 w-6 md:h-8 md:w-8" />, name: "Airbnb" },
    { icon: <CompanyLogo letter="D" className="h-6 w-6 md:h-8 md:w-8" />, name: "Dropbox" },
    { icon: <CompanyLogo letter="N" className="h-6 w-6 md:h-8 md:w-8" />, name: "Netflix" },
    { icon: <CompanyLogo letter="S" className="h-6 w-6 md:h-8 md:w-8" />, name: "Shopify" }
  ];
  
  // Testimonial quotes in a clean, minimal style
  const testimonials = [
    {
      quote: "Their expertise in data analytics has transformed our approach to customer insights. The training sessions were practical and immediately applicable to our business needs.",
      name: "Sarah Johnson",
      title: "Data Analytics Director",
      company: "Global Retail Inc."
    },
    {
      quote: "The AI/ML workshop series was outstanding. They have a gift for making complex technical concepts accessible and engaging for both technical and non-technical team members.",
      name: "Michael Chen",
      title: "VP of Product",
      company: "TechForward"
    },
    {
      quote: "Their deep understanding of solutions engineering helped us bridge the gap between our technical team and business stakeholders. A true tech SME who communicates effectively across departments.",
      name: "Jessica Williams",
      title: "Business Intelligence Lead",
      company: "FinTech Solutions"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container">
        {/* Companies band - Sigma-inspired clean layout */}
        <div className="text-center mb-20">
          <h2 className="text-sm font-medium tracking-wider text-gray-500 uppercase mb-10 monospace">
            Worked with teams at
          </h2>
          
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8 justify-items-center">
            {companies.map((company, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title={company.name}
              >
                {company.icon}
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* 'From our customers' section - mixing Sigma's clean style with Notion's humanistic elements */}
        <div className="max-w-3xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">What clients say</h2>
            <p className="text-xl text-gray-600">
              Sharing expertise in data analytics, AI/ML, and solutions engineering
            </p>
          </div>
          
          <div className="space-y-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg border border-gray-200 relative"
              >
                {/* Notion-style decorator */}
                <div className="absolute -top-3 -left-3">
                  <CheckCircle className="h-6 w-6 text-green-500 bg-white rounded-full" />
                </div>
                
                <blockquote>
                  <p className="text-lg mb-4">
                    "{testimonial.quote}"
                  </p>
                  <footer className="flex items-center pt-4 border-t border-gray-100">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.name}</div>
                      <div className="text-gray-500 text-xs">{testimonial.title}, {testimonial.company}</div>
                    </div>
                  </footer>
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Stats in the clean modular style like Sigma */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { number: "150+", label: "Workshop sessions" },
            { number: "98%", label: "Client satisfaction" },
            { number: "5,000+", label: "Professionals trained" },
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center p-6 bg-white rounded-lg border border-gray-200"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2 monospace">{stat.number}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
