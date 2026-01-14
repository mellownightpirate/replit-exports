import { ArrowRight, Calendar, Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-foreground px-3 py-1 mb-4">
              <span className="text-xs font-mono">05. CONTACT</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">LET'S CHAT – NO PITCH, JUST ADVICE</h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono">
              I'll help you figure out your next step — whether we work together or not.
            </p>
          </div>
          
          {/* Main Contact Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 max-w-5xl mx-auto">
            {/* Left Column - CTA */}
            <div className="md:col-span-5 flex flex-col">
              <div className="eink-card p-0 h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-foreground">
                  <div className="w-12 h-12 border border-foreground flex items-center justify-center mb-4">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl mb-4">30-MINUTE FREE CONSULTATION</h3>
                  <p className="font-mono text-sm leading-relaxed">
                    No obligation, no sales pressure – just a focused conversation about your analytics challenges and potential solutions.
                  </p>
                </div>
                
                {/* Benefits */}
                <div className="p-6 flex-grow">
                  <div className="font-mono text-xs mb-4 opacity-70">DURING YOUR CALL, WE'LL DISCUSS:</div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-4 h-4 border border-foreground flex-shrink-0 mr-3 mt-0.5"></div>
                      <p className="font-mono text-xs">Your current analytics challenges and pain points</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-4 h-4 border border-foreground flex-shrink-0 mr-3 mt-0.5"></div>
                      <p className="font-mono text-xs">Opportunities to enhance your data strategy and technology stack</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-4 h-4 border border-foreground flex-shrink-0 mr-3 mt-0.5"></div>
                      <p className="font-mono text-xs">Potential roadmap for implementation and optimization</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-4 h-4 border border-foreground flex-shrink-0 mr-3 mt-0.5"></div>
                      <p className="font-mono text-xs">Initial recommendations based on your specific situation</p>
                    </div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <div className="p-6 border-t border-foreground/30 bg-foreground/5">
                  <a 
                    href="https://calendly.com/amin-hasan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="eink-btn eink-btn-primary w-full flex items-center justify-center gap-2"
                  >
                    BOOK YOUR FREE CALL NOW
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Right Column - Process */}
            <div className="md:col-span-7">
              <div className="space-y-8">
                <div className="eink-card">
                  <h3 className="text-xl mb-6">THE CONSULTATION PROCESS</h3>
                  
                  <div className="space-y-8">
                    <div className="flex">
                      <div className="mr-6">
                        <div className="w-10 h-10 border border-foreground flex items-center justify-center">
                          <span className="font-mono">01</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Discovery Call</h4>
                        <p className="font-mono text-xs leading-relaxed">
                          A focused 30-minute conversation to understand your current analytics landscape, challenges, and objectives. I'll listen more than I speak to gain a comprehensive understanding of your situation.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mr-6">
                        <div className="w-10 h-10 border border-foreground flex items-center justify-center">
                          <span className="font-mono">02</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Initial Assessment</h4>
                        <p className="font-mono text-xs leading-relaxed">
                          Following our call, I'll develop a brief assessment outlining potential approaches and recommendations tailored to your specific needs and technology environment.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex">
                      <div className="mr-6">
                        <div className="w-10 h-10 border border-foreground flex items-center justify-center">
                          <span className="font-mono">03</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2">Engagement Proposal</h4>
                        <p className="font-mono text-xs leading-relaxed">
                          If there's a mutual fit, I'll provide a detailed proposal with clear deliverables, timeline, and investment required. No surprises, just transparent value-based pricing.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Alternative Contact Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a href="mailto:a@hasan.co" className="eink-card p-4 flex items-center hover:border-foreground transition-colors">
                    <div className="w-8 h-8 border border-foreground flex items-center justify-center mr-3">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-xs opacity-70">EMAIL DIRECTLY</div>
                      <div className="font-bold">a@hasan.co</div>
                    </div>
                  </a>
                  
                  <div className="eink-card p-4 flex items-center">
                    <div className="w-8 h-8 border border-foreground flex items-center justify-center mr-3">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-mono text-xs opacity-70">BASED IN</div>
                      <div className="font-bold">London, United Kingdom</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}