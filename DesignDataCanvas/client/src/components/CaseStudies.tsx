import { ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";

interface CaseStudyProps {
  logo: string;
  company: string;
  metric: string;
  description: string;
}

function CaseStudyCard({ logo, company, metric, description }: CaseStudyProps) {
  return (
    <div className="eink-card p-0 overflow-hidden">
      {/* Header with Logo */}
      <div className="p-5 border-b border-foreground flex justify-between items-center">
        <div className="font-mono text-xs">{company}</div>
        <div className="w-8 h-8 border border-foreground flex items-center justify-center">
          <span className="font-mono text-xs">{logo}</span>
        </div>
      </div>
      
      {/* Metric */}
      <div className="p-5 border-b border-foreground bg-foreground/5">
        <div className="font-mono text-xs mb-2 opacity-70">RESULT</div>
        <div className="text-xl font-bold">{metric}</div>
      </div>
      
      {/* Description */}
      <div className="p-5">
        <p className="font-mono text-xs leading-relaxed">{description}</p>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-foreground/20 flex justify-end">
        <a href="#contact" className="font-mono text-xs flex items-center opacity-70 hover:opacity-100 transition-opacity">
          <span>VIEW CASE STUDY</span>
          <ArrowUpRight size={12} className="ml-1" />
        </a>
      </div>
    </div>
  );
}

export default function CaseStudies() {
  const caseStudies = [
    {
      logo: "BoE",
      company: "Bank of England",
      metric: "Reduced insight discovery time by 50%",
      description: "Implemented a self-service analytics platform with natural language querying that enabled financial analysts to explore and visualize regulatory data without technical assistance."
    },
    {
      logo: "F",
      company: "FAANG Client",
      metric: "200% increase in analytics adoption",
      description: "Designed and delivered embedded dashboards within their customer-facing platform that drove higher engagement and provided immediate, contextual insights."
    },
    {
      logo: "FT",
      company: "FinTech Startup",
      metric: "90% reduction in report development time",
      description: "Architected a scalable semantic layer and visualization framework that allowed the team to create new dashboards in hours instead of weeks."
    },
    {
      logo: "HC",
      company: "Healthcare Provider",
      metric: "Enabled real-time operational decisions",
      description: "Implemented a streaming analytics solution that processed patient data in real-time, improving resource allocation and reducing wait times."
    }
  ];

  return (
    <section id="case-studies" className="py-20 border-b border-foreground pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-foreground px-3 py-1 mb-4">
              <span className="text-xs font-mono">02. CASE STUDIES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">REAL RESULTS FROM REAL TEAMS</h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono">
              A selection of projects showcasing measurable outcomes achieved for clients across industries.
            </p>
          </div>
          
          {/* Case Studies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {caseStudies.map((study, index) => (
              <CaseStudyCard
                key={index}
                logo={study.logo}
                company={study.company}
                metric={study.metric}
                description={study.description}
              />
            ))}
          </div>
          
          {/* Outcomes Section */}
          <div className="eink-card max-w-3xl mx-auto">
            <h3 className="text-xl mb-6">CONSISTENT CLIENT OUTCOMES</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 opacity-70" />
                  <div>
                    <h4 className="font-bold mb-1">Accelerated Time to Insight</h4>
                    <p className="font-mono text-xs">Reduced dashboard development cycles from weeks to days through optimized data architecture and reusable components.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 opacity-70" />
                  <div>
                    <h4 className="font-bold mb-1">Increased User Adoption</h4>
                    <p className="font-mono text-xs">Consistently achieved 80%+ user adoption rates through intuitive design and strategic implementation.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 opacity-70" />
                  <div>
                    <h4 className="font-bold mb-1">Reduced Technical Debt</h4>
                    <p className="font-mono text-xs">Eliminated legacy systems and simplified architecture to create sustainable, maintainable analytics environments.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-3 mt-0.5 opacity-70" />
                  <div>
                    <h4 className="font-bold mb-1">Data-Driven Culture</h4>
                    <p className="font-mono text-xs">Fostered organization-wide data literacy and analytical thinking through strategic implementation and training.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-foreground/30 text-center">
              <a 
                href="https://calendly.com/amin-hasan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="eink-btn inline-flex items-center gap-2"
              >
                DISCUSS YOUR PROJECT GOALS
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}