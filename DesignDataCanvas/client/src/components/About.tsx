import { ChevronRight, Shield, Settings, Database } from "lucide-react";

export default function About() {
  const skills = [
    "BI STRATEGY", 
    "ANALYTICS ARCHITECTURE", 
    "DATA VISUALIZATION", 
    "SEMANTIC MODELING",
    "ETL PROCESSES"
  ];

  return (
    <section id="about" className="py-20 border-b border-foreground pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-foreground px-3 py-1 mb-4">
              <span className="text-xs font-mono">01. ABOUT</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">THE CONSULTANT</h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono">
              Helping organizations unlock the full potential of their data through expert guidance and practical solutions.
            </p>
          </div>
          
          {/* Bio & Skills */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Image Column */}
            <div className="md:col-span-4 order-2 md:order-1">
              <div className="eink-card h-full p-0 overflow-hidden">
                <div className="aspect-[5/6] relative">
                  <div className="absolute inset-0 border border-foreground flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="font-mono text-xs mb-3 opacity-70">SCAN FOR CV</div>
                      <div className="w-32 h-32 mx-auto border border-foreground mb-3">
                        {/* QR code placeholder */}
                        <div className="w-full h-full p-2">
                          <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-1">
                            {Array(25).fill(0).map((_, i) => (
                              <div 
                                key={i} 
                                className={`${Math.random() > 0.5 ? 'bg-foreground' : 'bg-transparent'}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="font-mono text-xs opacity-70">OR VISIT</div>
                      <div className="font-bold">AMINHASAN.COM/CV</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-foreground">
                  <div className="flex justify-between items-center">
                    <div className="text-xs font-mono opacity-70">LOCATION</div>
                    <div className="font-bold">LONDON, UK</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bio Column */}
            <div className="md:col-span-8 order-1 md:order-2">
              <div className="space-y-8">
                <div className="eink-card">
                  <div className="font-mono text-xs mb-4 opacity-70">CAREER SYNOPSIS</div>
                  <p className="mb-4">
                    With 10+ years in Business Intelligence and analytics consulting, I've guided organizations 
                    across industries in transforming their data practices. My expertise spans the full analytics 
                    lifecycle from data strategy to implementation.
                  </p>
                  <p>
                    Having led analytics initiatives at insightsoftware, Squirro, and other technology leaders, 
                    I bring practical experience in solving complex data challenges with a vendor-neutral approach 
                    focused on your specific business requirements.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mt-6">
                    {skills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="border border-foreground px-3 py-1 text-xs font-mono"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="eink-card">
                    <div className="flex items-center justify-center w-10 h-10 border border-foreground mb-4">
                      <Shield size={20} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Vendor-Neutral Expertise</h3>
                    <p className="font-mono text-sm">
                      Recommendations based solely on your needs, not influenced by vendor relationships.
                    </p>
                  </div>
                  
                  <div className="eink-card">
                    <div className="flex items-center justify-center w-10 h-10 border border-foreground mb-4">
                      <Settings size={20} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Implementation Focus</h3>
                    <p className="font-mono text-sm">
                      Practical solutions you can immediately apply, not theoretical frameworks.
                    </p>
                  </div>
                  
                  <div className="eink-card">
                    <div className="flex items-center justify-center w-10 h-10 border border-foreground mb-4">
                      <Database size={20} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">End-to-End Knowledge</h3>
                    <p className="font-mono text-sm">
                      Experience across the entire analytics stack from data engineering to visualization.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <a 
                  href="https://calendly.com/amin-hasan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="eink-btn flex items-center gap-2"
                >
                  SCHEDULE A CONSULTATION
                  <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}