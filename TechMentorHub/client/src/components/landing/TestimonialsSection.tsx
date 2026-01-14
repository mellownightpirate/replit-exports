import { useState, useEffect } from 'react';

export default function TestimonialsSection() {
  // Create a placeholder image for "This Could Be You" testimonial
  const [futurePlaceholder, setFuturePlaceholder] = useState('');

  useEffect(() => {
    // Generate a simple SVG placeholder for the "This Could Be You" image
    const placeholderSvg = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#333" />
        <circle cx="50" cy="35" r="15" fill="#06D6A0" />
        <rect x="35" y="55" width="30" height="20" fill="#06D6A0" />
        <text x="50" y="85" font-family="Arial" font-size="12" text-anchor="middle" fill="white">YOU</text>
        <text x="50" y="15" font-family="Arial" font-size="10" text-anchor="middle" fill="#06D6A0">NextChapter</text>
      </svg>
    `;
    
    // Convert SVG to a data URL
    const dataUrl = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
    setFuturePlaceholder(dataUrl);
  }, []);

  const testimonials = [
    {
      id: 1,
      name: "Maryam K.",
      role: "Hairdresser → UX Designer",
      image: "/images/maryam.JPG",
      quote: "NextChapter gave me the technical skills and confidence to transition from hairdressing to UX design. The personalized roadmap and mentorship were exactly what I needed.",
      rating: 5
    },
    {
      id: 2,
      name: "James L.",
      role: "Retail Manager → Frontend Developer",
      image: "/images/james.JPG",
      quote: "After 10 years in retail, I was worried it was too late to start a tech career. NextChapter proved me wrong. Within 7 months, I landed my first developer role!",
      rating: 5
    },
    {
      id: 3,
      name: "Yasmine R.",
      role: "Customer Service Rep → Data Analyst",
      image: "/images/yasmine.jpeg",
      quote: "The hands-on projects and real-world scenarios in the NextChapter program prepared me perfectly for my interviews. Their negotiation coaching helped me secure a salary 35% higher than my previous job.",
      rating: 5
    },
    {
      id: 4,
      name: "Sara T.",
      role: "Artist → Product Manager",
      image: "/images/sara.jpeg",
      quote: "I was skeptical about online mentorship, but the NextChapter community and personalized guidance exceeded my expectations. I'm now working at my dream company.",
      rating: 5
    },
    {
      id: 5,
      name: "Shanice M.",
      role: "Call Centre Agent → QA Engineer",
      image: "/images/shanice.jpeg",
      quote: "What sets NextChapter apart is their focus on both technical and soft skills. The blueprint approach helped me identify my strengths and build a career path that truly fits me.",
      rating: 5
    },
    {
      id: 6,
      name: "This Could Be You!",
      role: "Your Current Job → Your Dream Tech Role",
      image: futurePlaceholder || '#', // Use the generated placeholder
      quote: "Imagine yourself here, sharing your success story after working with NextChapter. No matter your background, we've helped people like you transition into rewarding tech careers.",
      rating: 5,
      highlight: true
    }
  ];

  return (
    <section id="testimonials" className="bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white scroll-animation">
          Success Stories
        </h2>
        <p className="text-lg text-center max-w-2xl mx-auto mb-12 text-gray-300 scroll-animation">
          Real people, real results. See how NextChapter has transformed careers.
        </p>

        {/* Desktop Testimonials - Grid Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 scroll-animation">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className={`${
                testimonial.highlight 
                  ? 'bg-gradient-to-br from-gray-800 to-[#06D6A0]/10 rounded-xl p-6 flex flex-col h-full shadow-lg border-2 border-[#06D6A0] transition-all duration-300' 
                  : 'bg-gray-800 rounded-xl p-6 flex flex-col h-full shadow-lg border border-gray-700 hover:border-[#06D6A0] transition-all duration-300'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="relative w-14 h-14 rounded-full border-2 border-[#06D6A0] overflow-hidden flex-shrink-0">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-white">{testimonial.name}</h3>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#06D6A0]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 flex-grow italic mb-3">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>

        {/* Mobile Testimonials - Carousel with navigation */}
        <div className="md:hidden relative pb-14">
          {/* Navigation Arrows */}
          <button 
            className="absolute top-1/2 transform -translate-y-1/2 left-0 z-20 w-12 h-12 bg-gray-800/80 hover:bg-[#06D6A0] rounded-full flex items-center justify-center text-white shadow-lg focus:outline-none transition-colors border border-gray-700"
            aria-label="Previous testimonial"
            onClick={() => {
              const carousel = document.querySelector('.scroll-animation.flex');
              if (carousel) {
                carousel.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className="absolute top-1/2 transform -translate-y-1/2 right-0 z-20 w-12 h-12 bg-gray-800/80 hover:bg-[#06D6A0] rounded-full flex items-center justify-center text-white shadow-lg focus:outline-none transition-colors border border-gray-700"
            aria-label="Next testimonial"
            onClick={() => {
              const carousel = document.querySelector('.scroll-animation.flex');
              if (carousel) {
                carousel.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Carousel container */}
          <div className="overflow-x-auto pb-6 flex snap-x snap-mandatory gap-4 scroll-animation hide-scrollbar">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                id={`testimonial-${testimonial.id}`}
                className={`${
                  testimonial.highlight 
                    ? 'bg-gradient-to-br from-gray-800 to-[#06D6A0]/10 rounded-xl p-6 flex-shrink-0 w-[85vw] snap-center shadow-lg border-2 border-[#06D6A0]' 
                    : 'bg-gray-800 rounded-xl p-6 flex-shrink-0 w-[85vw] snap-center shadow-lg border border-gray-700'
                }`}
              >
                <div className="flex items-center mb-4">
                  <div className="relative w-14 h-14 rounded-full border-2 border-[#06D6A0] overflow-hidden flex-shrink-0">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-white">{testimonial.name}</h3>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#06D6A0]" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-4 absolute bottom-0 left-0 right-0">
            {testimonials.map((testimonial) => (
              <a 
                key={testimonial.id} 
                href={`#testimonial-${testimonial.id}`}
                className="w-3 h-3 rounded-full bg-gray-600 hover:bg-[#06D6A0] transition-colors duration-300"
                aria-label={`View testimonial from ${testimonial.name}`}
              />
            ))}
          </div>

          {/* Navigation instructions */}
          <div className="text-center text-sm text-gray-400 mt-2 flex items-center justify-center">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7m-7 7h14" />
            </svg>
            Use arrows or swipe to navigate testimonials
          </div>
        </div>

        <div className="text-center mt-10">
          <a 
            href="#quiz" 
            className="inline-block px-8 py-4 bg-[#06D6A0] text-gray-900 rounded-full text-lg font-bold shadow-lg hover:shadow-xl hover:bg-[#05c090] transform hover:-translate-y-1 transition-all duration-300 scroll-animation"
          >
            Start Your NextChapter Today
          </a>
        </div>
      </div>
    </section>
  );
}