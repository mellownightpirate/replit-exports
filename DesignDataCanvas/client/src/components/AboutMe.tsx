import { ArrowRight, Briefcase } from "lucide-react";

export default function AboutMe() {
  return (
    <section id="about-me" className="py-20 border-b border-foreground pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-foreground px-3 py-1 mb-4">
              <span className="text-xs font-mono">04. ABOUT ME</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">WHY ME</h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono">
              Senior Solutions Engineer with 10+ years' experience across enterprise BI, embedded analytics, and AI workflows.
            </p>
          </div>
          
          {/* Bio & Credibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column - Bio */}
            <div className="eink-card h-full">
              <div className="flex items-center justify-center w-12 h-12 border border-foreground mb-6">
                <Briefcase className="h-5 w-5" />
              </div>
              
              <h3 className="text-xl mb-6">PROFESSIONAL BACKGROUND</h3>
              
              <div className="space-y-6 mb-6">
                <p className="font-mono text-sm leading-relaxed">
                  With a decade of experience in the analytics industry, I've helped organizations of all sizes transform their data practices and build effective BI strategies.
                </p>
                
                <p className="font-mono text-sm leading-relaxed">
                  My approach is vendor-neutral, focused on practical solutions that deliver measurable business impact. I bridge the gap between technical capabilities and business objectives.
                </p>
                
                <p className="font-mono text-sm leading-relaxed">
                  I've led teams at both startups and enterprise organizations, giving me perspective on the unique challenges at each stage of the analytics maturity journey.
                </p>
              </div>
              
              <div className="eink-divider mb-6"></div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="font-mono text-xs opacity-70 mb-1">SPECIALIZATIONS</div>
                  <ul className="space-y-1">
                    <li className="font-mono text-xs">BI Strategy</li>
                    <li className="font-mono text-xs">Data Architecture</li>
                    <li className="font-mono text-xs">Embedded Analytics</li>
                  </ul>
                </div>
                
                <div>
                  <div className="font-mono text-xs opacity-70 mb-1">INDUSTRIES</div>
                  <ul className="space-y-1">
                    <li className="font-mono text-xs">Financial Services</li>
                    <li className="font-mono text-xs">Technology</li>
                    <li className="font-mono text-xs">Healthcare</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Right Column - Testimonials */}
            <div className="space-y-6">
              <div className="eink-card p-6">
                <div className="font-mono text-xs opacity-70 mb-4">WHAT CLIENTS SAY</div>
                
                <blockquote className="font-mono text-sm italic mb-4">
                  "Amin bridged our technical and business teams, translating complex data needs into actionable solutions. His expertise was instrumental in our analytics transformation."
                </blockquote>
                
                <div className="flex justify-between items-center">
                  <div className="font-bold">Director of BI</div>
                  <div className="font-mono text-xs opacity-70">Financial Services Firm</div>
                </div>
              </div>
              
              <div className="eink-card p-6">
                <div className="font-mono text-xs opacity-70 mb-4">WHAT CLIENTS SAY</div>
                
                <blockquote className="font-mono text-sm italic mb-4">
                  "The self-service analytics environment Amin designed has reduced our reporting backlog by 80% and empowered our business teams to answer their own questions."
                </blockquote>
                
                <div className="flex justify-between items-center">
                  <div className="font-bold">VP of Product</div>
                  <div className="font-mono text-xs opacity-70">SaaS Platform</div>
                </div>
              </div>
              
              <div className="text-center pt-4">
                <a 
                  href="https://calendly.com/amin-hasan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="eink-btn inline-flex items-center justify-center gap-2"
                >
                  LET'S DISCUSS YOUR PROJECT
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}