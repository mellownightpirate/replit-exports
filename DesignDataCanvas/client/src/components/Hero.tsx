import { useState, useEffect } from 'react';
import { ArrowRight, ArrowDown, Database, ChevronRight } from "lucide-react";

export default function Hero() {
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentPhase, setCurrentPhase] = useState(0);
  
  const fullText = "UNLOCK CLARITY FROM YOUR DATA. FAST.";
  
  // Typing animation effect
  useEffect(() => {
    if (currentPhase === 0) {
      if (typedText.length < fullText.length) {
        const timeout = setTimeout(() => {
          setTypedText(fullText.substring(0, typedText.length + 1));
        }, 100);
        
        return () => clearTimeout(timeout);
      } else {
        // Move to the next phase after text is fully typed
        setTimeout(() => {
          setCurrentPhase(1);
        }, 500);
      }
    }
  }, [typedText, currentPhase]);
  
  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center border-b border-foreground pixel-grid relative overflow-hidden">
      {/* Main content centered */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24 eink-container relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Hero Content */}
          <div className="space-y-8">
            {/* Animated Terminal-style Header */}
            <div className="eink-card p-0 border-2 border-foreground mx-auto max-w-4xl">
              {/* Terminal Top Bar */}
              <div className="border-b-2 border-foreground bg-foreground/5 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-foreground rounded-full"></div>
                  <div className="w-3 h-3 border-2 border-foreground rounded-full"></div>
                  <div className="w-3 h-3 border-2 border-foreground rounded-full"></div>
                </div>
                <div className="font-mono text-xs">data-insights.sh</div>
                <div></div>
              </div>
              
              {/* Animated Text Area */}
              <div className="p-8 md:p-12">
                {currentPhase === 0 && (
                  <div className="flex items-start">
                    <div className="font-mono opacity-70 mr-3">$</div>
                    <div>
                      <div className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                        {typedText}
                        {showCursor && <span className="inline-block w-[0.5em] h-[1em] bg-foreground ml-1"></span>}
                      </div>
                    </div>
                  </div>
                )}
                
                {currentPhase >= 1 && (
                  <>
                    <div className="flex items-start mb-8">
                      <div className="font-mono opacity-70 mr-3">$</div>
                      <div>
                        <div className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                          {fullText}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start mb-6">
                      <div className="font-mono opacity-70 mr-3">$</div>
                      <div className="flex items-center">
                        <span className="font-mono mr-2">cat</span>
                        <span className="font-mono">mission.txt</span>
                        {showCursor && <span className="inline-block w-[0.5em] h-[1em] bg-foreground ml-1"></span>}
                      </div>
                    </div>
                    
                    <div className="ml-6 font-mono text-lg mb-8">
                      I help teams design self-service dashboards, modernise BI stacks, and accelerate time-to-insight using AI and analytics.
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ml-6 mb-8">
                      <div className="border-l-2 border-foreground pl-4">
                        <div className="font-mono text-sm mb-2 opacity-70">FOUNDERS & EXECS</div>
                        <p className="font-mono text-sm">Want better visibility into metrics that matter.</p>
                      </div>
                      
                      <div className="border-l-2 border-foreground pl-4">
                        <div className="font-mono text-sm mb-2 opacity-70">BI / DATA TEAMS</div>
                        <p className="font-mono text-sm">Overwhelmed by ad-hoc requests or clunky legacy tools.</p>
                      </div>
                      
                      <div className="border-l-2 border-foreground pl-4">
                        <div className="font-mono text-sm mb-2 opacity-70">OPS & PRODUCT MANAGERS</div>
                        <p className="font-mono text-sm">Need actionable dashboards without relying on engineers.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* CTA Area */}
            <div className="text-center mt-8">
              <a 
                href="https://calendly.com/amin-hasan" 
                target="_blank" 
                rel="noopener noreferrer"
                className="eink-btn eink-btn-primary inline-flex items-center gap-2 text-lg px-8 py-4 mb-4"
              >
                BOOK A FREE STRATEGY CALL
                <ArrowRight className="h-5 w-5" />
              </a>
              
              <p className="font-mono text-sm opacity-70">
                No pitch, just advice — I'll help you figure out your next step
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-transparent"></div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
        <span className="text-xs mb-2 font-mono">EXPLORE INTERACTIVE DASHBOARD</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </div>
    </section>
  );
}