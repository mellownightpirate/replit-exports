import { ArrowRight } from "lucide-react";

interface QuoteProps {
  text: string;
  topic: string;
}

function Quote({ text, topic }: QuoteProps) {
  return (
    <div className="notion-card group border-l-4 border-l-primary p-0">
      <div className="p-6">
        <p className="text-lg mb-4 text-foreground leading-relaxed">"{text}"</p>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wide">On {topic}</p>
      </div>
    </div>
  );
}

export default function ThoughtLeadership() {
  const quotes = [
    {
      text: "Start with a 2x2 framework: analytical literacy vs analytical need. This helps identify which teams need training, which need tools, and which need both.",
      topic: "Analytics Strategy"
    },
    {
      text: "Self-service begins with clear definitions and stakeholder alignment, not tools. A properly defined semantic layer is what makes self-service analytics scalable.",
      topic: "Self-Service Analytics"
    },
    {
      text: "The best embedded analytics solution is the one that disappears into your application's user experience, not the one with the most features.",
      topic: "Embedded Analytics"
    }
  ];

  return (
    <section id="thought-leadership" className="py-20 bg-neutral/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-4">Thought Leadership</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Insights from years of hands-on experience in the field
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {quotes.map((quote, index) => (
              <Quote 
                key={index} 
                text={quote.text} 
                topic={quote.topic} 
              />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <a href="#" className="inline-flex items-center text-primary font-medium group">
              <span className="group-hover:underline">View more insights</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
