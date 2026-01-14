import { ArrowRight, CheckCircle2, Calendar, Briefcase } from "lucide-react";

// Case study type
interface CaseStudy {
  title: string;
  client: string;
  description: string;
  outcomes: string[];
}

export default function Experience() {
  const caseStudies: CaseStudy[] = [
    {
      title: "AI-POWERED ANALYTICS SOLUTION",
      client: "Bank of England",
      description: "Implemented an advanced search and analytics platform via Squirro, enabling natural language processing of financial documents and regulatory filings to extract actionable insights.",
      outcomes: [
        "50% reduction in insight discovery time",
        "Cross-departmental data visibility",
        "Automated trend monitoring and alerts",
        "Regulatory compliance improvement"
      ]
    },
    {
      title: "EMBEDDED ANALYTICS PLATFORM",
      client: "FAANG Technology Company",
      description: "Designed and delivered high-performance embedded dashboards integrated within the client's SaaS platform using Simba connectors and Logi Symphony.",
      outcomes: [
        "In-app analytics with zero context switching",
        "Real-time visualization of customer behavior",
        "200% increase in analytics feature usage",
        "White-labeled solution for diverse client base"
      ]
    }
  ];

  return (
    <section id="experience" className="py-20 border-b border-foreground pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-foreground px-3 py-1 mb-4">
              <span className="text-xs font-mono">03. EXPERIENCE</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">CASE STUDIES</h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono">
              Real-world projects that demonstrate how my expertise translates into measurable business outcomes.
            </p>
          </div>
        
          {/* Timeline and Case Studies */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Professional Timeline */}
            <div className="md:col-span-4">
              <div className="eink-card p-6">
                <h3 className="text-xl mb-6">PROFESSIONAL TIMELINE</h3>
                
                <div className="relative pl-8 before:absolute before:left-3 before:top-1 before:bottom-0 before:w-[1px] before:border-l before:border-dashed before:border-foreground/50">
                  <div className="mb-8 relative">
                    <div className="absolute left-[-28px] top-0 w-6 h-6 border border-foreground bg-background flex items-center justify-center">
                      <Calendar size={14} />
                    </div>
                    <div className="font-mono text-xs mb-1 opacity-70">2020-PRESENT</div>
                    <div className="font-bold text-lg mb-1">Analytics Consultant</div>
                    <div className="font-mono text-xs">Independent Practice</div>
                    <p className="mt-2 text-sm font-mono opacity-70">
                      Advising enterprises and startups on analytics strategy and implementation
                    </p>
                  </div>
                  
                  <div className="mb-8 relative">
                    <div className="absolute left-[-28px] top-0 w-6 h-6 border border-foreground bg-background flex items-center justify-center">
                      <Briefcase size={14} />
                    </div>
                    <div className="font-mono text-xs mb-1 opacity-70">2018-2020</div>
                    <div className="font-bold text-lg mb-1">Lead Data Strategist</div>
                    <div className="font-mono text-xs">insightsoftware</div>
                    <p className="mt-2 text-sm font-mono opacity-70">
                      Led analytics product strategy and technical consulting team
                    </p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-[-28px] top-0 w-6 h-6 border border-foreground bg-background flex items-center justify-center">
                      <Briefcase size={14} />
                    </div>
                    <div className="font-mono text-xs mb-1 opacity-70">2015-2018</div>
                    <div className="font-bold text-lg mb-1">BI Solutions Architect</div>
                    <div className="font-mono text-xs">Squirro</div>
                    <p className="mt-2 text-sm font-mono opacity-70">
                      Designed AI-powered analytics solutions for finance sector
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-foreground/30">
                  <a 
                    href="https://calendly.com/amin-hasan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="eink-btn w-full flex items-center justify-center gap-2"
                  >
                    DISCUSS YOUR PROJECT
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Case Studies */}
            <div className="md:col-span-8">
              <div className="space-y-6">
                {caseStudies.map((study, index) => (
                  <div key={index} className="eink-card p-0">
                    {/* Case Study Header */}
                    <div className="border-b border-foreground p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="font-mono text-xs opacity-70">CASE STUDY/{index + 1}</div>
                        <div className="px-3 py-1 border border-foreground font-mono text-xs">
                          CLIENT: {study.client}
                        </div>
                      </div>
                      <h3 className="text-xl mb-3">{study.title}</h3>
                      <p className="font-mono text-sm">
                        {study.description}
                      </p>
                    </div>
                    
                    {/* Case Study Outcomes */}
                    <div className="p-6">
                      <div className="font-mono text-xs mb-4 opacity-70">KEY OUTCOMES:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {study.outcomes.map((outcome, i) => (
                          <div key={i} className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 opacity-70" />
                            <p className="font-mono text-xs">{outcome}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* View Details Link */}
                    <div className="border-t border-foreground/20 p-4 flex justify-end">
                      <a href="#contact" className="font-mono text-xs flex items-center opacity-50 hover:opacity-100 transition-opacity">
                        <span className="mr-1">REQUEST DETAILED CASE STUDY</span>
                        <ArrowRight size={12} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}