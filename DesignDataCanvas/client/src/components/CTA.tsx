import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-neutral/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="notion-card p-12 md:p-16 text-center bg-white border border-neutral-subtle relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/5 rounded-full"></div>
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-mono font-bold tracking-tight mb-6">
                Ready to transform your analytics?
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                Book a complimentary 30-minute discovery call to discuss your analytics challenges and explore how we can work together.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 shadow-md">
                  <a 
                    href="https://calendly.com/amin-hasan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Try free
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <p className="text-sm text-muted-foreground">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
