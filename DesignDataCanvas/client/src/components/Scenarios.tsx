import { useState } from 'react';
import { ArrowRight, BarChart3, Database, Layers, BrainCircuit } from "lucide-react";

interface ScenarioCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
}

function ScenarioCard({ icon, title, description, expanded, onToggle }: ScenarioCardProps) {
  return (
    <div 
      className={`eink-card p-6 cursor-pointer transition-all ${expanded ? 'border-foreground' : 'border-foreground/50'}`}
      onClick={onToggle}
    >
      <div className="flex items-start mb-4">
        <div className="w-10 h-10 border border-foreground flex items-center justify-center mr-4 flex-shrink-0">
          {icon}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
      
      <div className={`space-y-4 overflow-hidden transition-all ${expanded ? 'max-h-96' : 'max-h-0 hidden'}`}>
        <div className="eink-divider"></div>
        <p className="font-mono text-sm leading-relaxed">
          {description}
        </p>
        
        <a 
          href="https://calendly.com/amin-hasan" 
          target="_blank" 
          rel="noopener noreferrer"
          className="eink-btn flex items-center justify-center gap-2 w-full mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          LET'S TALK - FREE 20-MIN CONSULT
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default function Scenarios() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const scenarios = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "We're stuck with Tableau/Power BI and want to modernise",
      description: "I'll help you evaluate your current BI landscape, identify bottlenecks, and create a strategic roadmap to modernize your analytics capabilities while maximizing your existing investments. This includes optimizing performance, enhancing self-service capabilities, and potentially integrating complementary tools."
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "We need to build a self-service BI setup",
      description: "I'll guide you through creating a robust self-service analytics environment that empowers business users while maintaining data governance. This includes designing semantic layers, implementing the right tools, establishing data literacy programs, and creating reusable templates and components."
    },
    {
      icon: <BrainCircuit className="h-5 w-5" />,
      title: "We want to explore AI-powered insights",
      description: "I'll help you identify high-value use cases for AI in your analytics environment, from natural language querying to predictive analytics and automated insights. We'll explore practical implementation strategies that complement your existing stack and create measurable business impact without requiring massive infrastructure changes."
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Not sure where to start — we just want faster answers",
      description: "I'll work with you to understand your current challenges, audit your existing processes and tools, and develop a prioritized roadmap for improvement. This assessment will identify quick wins to deliver immediate value, while outlining a strategic approach to building sustainable analytics capabilities."
    }
  ];

  const handleToggle = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <section id="scenarios" className="py-20 border-b border-foreground pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-foreground px-3 py-1 mb-4">
              <span className="text-xs font-mono">01. SCENARIOS</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">WHERE ARE YOU RIGHT NOW?</h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono">
              Select the scenario that best describes your current situation to explore targeted solutions.
            </p>
          </div>
          
          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scenarios.map((scenario, index) => (
              <ScenarioCard
                key={index}
                icon={scenario.icon}
                title={scenario.title}
                description={scenario.description}
                expanded={expandedIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
          
          {/* CTA Section */}
          <div className="text-center">
            <p className="font-mono text-sm mb-6 max-w-2xl mx-auto">
              Not seeing your exact situation? Every organization's analytics challenges are unique. 
              Let's discuss your specific needs in a personalized consultation.
            </p>
            
            <a 
              href="https://calendly.com/amin-hasan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="eink-btn eink-btn-primary inline-flex items-center gap-2"
            >
              SCHEDULE A FREE STRATEGY CALL
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}