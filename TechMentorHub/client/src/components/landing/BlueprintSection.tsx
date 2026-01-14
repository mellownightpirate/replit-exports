import { useState, useRef } from 'react';

export default function BlueprintSection() {
  const [activeStep, setActiveStep] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const blueprintSteps = [
    {
      number: 1,
      title: "Discover",
      description: "Identify your natural tech strengths, market opportunities, and create your personalized roadmap.",
      features: ["Skills assessment", "Market analysis", "Learning style mapping"]
    },
    {
      number: 2,
      title: "Build",
      description: "Acquire the technical and soft skills needed through structured learning and hands-on practice.",
      features: ["Guided learning path", "Project development", "Accountability system"]
    },
    {
      number: 3,
      title: "Optimize",
      description: "Refine your professional brand, portfolio, and interview skills to stand out in the tech market.",
      features: ["CV and LinkedIn overhaul", "Portfolio development", "Interview preparation"]
    },
    {
      number: 4,
      title: "Launch",
      description: "Break into the tech industry with confidence and continue growing with community support.",
      features: ["Job search strategy", "Negotiation coaching", "Ongoing support"]
    }
  ];

  // Desktop view uses a grid layout, mobile view uses a simple scroll with nav buttons
  const handlePrev = () => {
    setActiveStep(prev => Math.max(0, prev - 1));
    
    if (carouselRef.current && activeStep > 0) {
      const newPos = (activeStep - 1) * 280; // 280px is card width
      carouselRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
    }
  };
  
  const handleNext = () => {
    setActiveStep(prev => Math.min(blueprintSteps.length - 1, prev + 1));
    
    if (carouselRef.current && activeStep < blueprintSteps.length - 1) {
      const newPos = (activeStep + 1) * 280; // 280px is card width
      carouselRef.current.scrollTo({ left: newPos, behavior: 'smooth' });
    }
  };

  return (
    <section id="blueprint" className="bg-gray-900 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white scroll-animation">
          The 4-Step Blueprint
        </h2>
        <p className="text-lg text-center max-w-2xl mx-auto mb-6 text-gray-300 scroll-animation">
          Our proven framework to help you transition into tech and future-proof your career
        </p>
        
        {/* Desktop: Grid layout (visible on md screens and up) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {blueprintSteps.map((step, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-md flex flex-col">
              <div className="bg-[#06D6A0] h-16 w-16 rounded-full flex items-center justify-center mb-4">
                <span className="text-[#1A1A1A] text-2xl font-bold">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
              <p className="text-gray-300 flex-grow break-words">
                {step.description}
              </p>
              <ul className="mt-4 space-y-2">
                {step.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#06D6A0] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300 break-words">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile: Single card with navigation (visible below md screens) */}
        <div className="md:hidden relative">
          {/* The active card */}
          <div className="w-full bg-gray-800 p-6 rounded-xl shadow-md">
            <div className="bg-[#06D6A0] h-16 w-16 rounded-full flex items-center justify-center mb-4">
              <span className="text-[#1A1A1A] text-2xl font-bold">{blueprintSteps[activeStep].number}</span>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{blueprintSteps[activeStep].title}</h3>
            <p className="text-gray-300 break-words">
              {blueprintSteps[activeStep].description}
            </p>
            <ul className="mt-4 space-y-2">
              {blueprintSteps[activeStep].features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#06D6A0] mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-300 break-words">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-4">
            <button 
              onClick={handlePrev}
              disabled={activeStep === 0}
              className={`p-2 rounded-full bg-gray-800 text-white ${activeStep === 0 ? 'opacity-50' : 'hover:bg-gray-700'}`}
              aria-label="Previous step"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Indicator dots */}
            <div className="flex space-x-2 items-center">
              {blueprintSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-3 h-3 rounded-full ${activeStep === index ? 'bg-[#06D6A0]' : 'bg-gray-600'}`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={handleNext}
              disabled={activeStep === blueprintSteps.length - 1}
              className={`p-2 rounded-full bg-gray-800 text-white ${activeStep === blueprintSteps.length - 1 ? 'opacity-50' : 'hover:bg-gray-700'}`}
              aria-label="Next step"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="text-center mt-8">
          <a 
            href="#quiz" 
            className="inline-block px-8 py-4 bg-[#06D6A0] text-gray-900 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:bg-[#05c090] transform hover:-translate-y-1 transition-all duration-300 scroll-animation"
          >
            Find Out Where You Stand →
          </a>
        </div>
      </div>
    </section>
  );
}
