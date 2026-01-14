export default function Download() {
  return (
    <section id="download" className="py-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-['VT323'] uppercase mb-2">Download CV</h2>
            <div className="e-ink-divider w-16 mb-6"></div>
            
            <div className="space-y-6 font-['JetBrains_Mono'] font-extralight">
              <p>
                Want to learn more about my experience and qualifications?
                Download my CV in PDF format for a detailed overview of my
                professional background, skills, and achievements.
              </p>
              
              <div className="flex">
                <button className="pixel-btn">
                  DOWNLOAD CV
                </button>
              </div>
            </div>
          </div>
          
          <div className="order-first md:order-last">
            <div className="border border-foreground p-8 relative">
              <div className="font-['VT323'] text-lg uppercase mb-6 text-center">CV Preview</div>
              
              <div className="aspect-[3/4] border border-dashed border-foreground flex flex-col items-center justify-center p-6 text-center">
                <div className="font-['VT323'] text-3xl uppercase mb-4">Amin Hasan</div>
                <div className="font-['JetBrains_Mono'] font-extralight text-sm mb-6">BI & Analytics Consultant</div>
                
                <div className="grid grid-cols-3 w-full mb-8">
                  {[...Array(9)].map((_, index) => (
                    <div key={index} className="aspect-square border border-foreground"></div>
                  ))}
                </div>
                
                <div className="font-['JetBrains_Mono'] font-extralight text-xs">
                  Scan to view digital version
                </div>
              </div>
              
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-background">
                <div className="font-['JetBrains_Mono'] text-xs">01/01/2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}