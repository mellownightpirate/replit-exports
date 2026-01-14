import { ArrowRight, BarChart, Database, Layers, BrainCircuit } from "lucide-react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  items: string[];
}

function ServiceCard({ icon, title, description, items }: ServiceCardProps) {
  return (
    <div className="eink-card p-0 relative overflow-hidden group">
      {/* Top Border and Icon */}
      <div className="p-6">
        <div className="flex items-center justify-center w-12 h-12 border border-foreground mb-6">
          {icon}
        </div>
        
        <h3 className="text-xl mb-4">{title}</h3>
        
        <p className="font-mono text-sm mb-6">
          {description}
        </p>
        
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-start">
              <span className="inline-block w-3 h-3 border border-foreground mt-1 mr-3 flex-shrink-0"></span>
              <span className="font-mono text-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Link */}
      <div className="p-4 border-t border-foreground/20 flex justify-end">
        <a 
          href="https://calendly.com/amin-hasan" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-mono text-xs flex items-center opacity-70 hover:opacity-100 transition-opacity"
        >
          <span className="mr-1">EXPLORE SERVICE</span>
          <ArrowRight size={12} />
        </a>
      </div>
    </div>
  );
}

export default function Services() {
  const services = [
    {
      icon: <BarChart className="h-5 w-5" />,
      title: "SELF-SERVICE BI ENABLEMENT",
      description: "Empowering your organization with intuitive self-service analytics capabilities that reduce reliance on technical teams.",
      items: [
        "Tableau/Looker/Qlik/Metabase implementation",
        "User adoption strategy",
        "Dashboard design and best practices",
        "Training and documentation"
      ]
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "MODERN DATA STACK STRATEGY",
      description: "Building a robust data foundation that enables reliable analytics and scales with your business needs.",
      items: [
        "dbt implementation and optimization",
        "Warehouse architecture design",
        "ETL/ELT pipeline development",
        "Data governance frameworks"
      ]
    },
    {
      icon: <BrainCircuit className="h-5 w-5" />,
      title: "AI-POWERED ANALYTICS",
      description: "Leveraging artificial intelligence to uncover deeper insights and automate analytical processes.",
      items: [
        "LLM integration with analytics platforms",
        "Natural language querying",
        "Predictive analytics implementation",
        "Automated insight generation"
      ]
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "CUSTOM DASHBOARDS & EMBEDDED INSIGHTS",
      description: "Creating tailored visualization solutions that integrate directly into your applications and workflows.",
      items: [
        "Logi Symphony implementation",
        "Apache Superset customization",
        "White-labeled analytics solutions",
        "API-driven dashboard development"
      ]
    }
  ];

  return (
    <section id="services" className="py-20 border-b border-foreground pixel-grid">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 eink-container">
        <div className="grid grid-cols-1 gap-16">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block border border-foreground px-3 py-1 mb-4">
              <span className="text-xs font-mono">03. SERVICES</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-6">HOW I CAN HELP</h2>
            <div className="eink-divider w-16 mx-auto mb-6"></div>
            <p className="font-mono">
              Specialized consulting services designed to transform how your organization leverages data for strategic decision-making.
            </p>
          </div>
          
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                icon={service.icon}
                title={service.title}
                description={service.description}
                items={service.items}
              />
            ))}
          </div>
          
          {/* CTA Section */}
          <div className="eink-card text-center max-w-3xl mx-auto p-8">
            <h3 className="text-xl mb-4">NOT SURE WHICH SERVICE YOU NEED?</h3>
            <p className="font-mono text-sm mb-6">
              Let's start with a conversation about your goals. I'll help you identify the right approach for your specific situation.
            </p>
            
            <a 
              href="https://calendly.com/amin-hasan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="eink-btn eink-btn-primary inline-flex items-center gap-2"
            >
              LET'S CHAT – NO PITCH, JUST ADVICE
              <ArrowRight className="h-4 w-4" />
            </a>
            <p className="font-mono text-xs mt-4 opacity-70">
              I'll help you figure out your next step — whether we work together or not.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}