import { useState } from 'react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Who is this program for?",
      answer: "This program is designed for professionals seeking to transition into tech roles or advance their existing tech careers. It's especially beneficial for mid-career changers, working professionals looking to upskill, and those who want personalized guidance rather than just another online course."
    },
    {
      question: "Who is this NOT for?",
      answer: "This isn't for people looking for a quick fix or those unwilling to put in consistent effort. It's also not ideal for complete beginners with zero interest in technology fundamentals or those expecting success without active participation in their own career development."
    },
    {
      question: "How much time do I need to commit?",
      answer: "For best results, allocate 5-10 hours per week for learning, assignments, and implementation. The program is flexible and designed to accommodate busy professionals, but your progress will directly correlate with your time investment."
    },
    {
      question: "What results can I expect?",
      answer: "Most clients experience increased confidence in their tech skills, a clear career transition roadmap, improved job application materials, and better interview performance. While results vary based on individual effort and market conditions, our 'Until You're Hired' guarantee ensures continued support throughout your journey."
    },
    {
      question: "Do I need prior tech experience?",
      answer: "No prior tech experience is required, though some basic computer proficiency helps. We'll assess your current skills and tailor the program to your specific starting point and goals. The program builds fundamentals for complete beginners and accelerates progress for those with some background."
    },
    {
      question: "How is this different from online courses?",
      answer: "Unlike pre-recorded courses, we provide personalized 1:1 mentoring tailored to your specific career goals and challenges. You get direct feedback on your work, customized advice for your situation, and accountability to keep moving forward - elements missing from self-paced online courses."
    }
  ];

  const idealCandidates = [
    {
      title: "Career Changers",
      description: "Professionals from non-tech backgrounds looking to leverage their existing skills while transitioning into technology roles.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    {
      title: "Tech Beginners",
      description: "Those with interest but limited experience who need a structured approach to building technical skills with guidance.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Mid-Career Professionals",
      description: "Experienced workers seeking to future-proof their careers by adding technical skills to their existing professional experience.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <section id="faq" className="py-16 md:py-20 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-12 text-center scroll-animation">
            Is This Program Right For You?
          </h2>
          
          {/* Ideal Candidate Profiles */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 scroll-animation">
            {idealCandidates.map((candidate, index) => (
              <div key={index} className="bg-gray-900 rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  {candidate.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{candidate.title}</h3>
                <p className="text-gray-300">{candidate.description}</p>
              </div>
            ))}
          </div>
          
          {/* FAQ Accordion */}
          <div className="rounded-xl overflow-hidden scroll-animation">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`border-b border-gray-700 ${index === 0 ? 'rounded-t-xl' : ''} ${index === faqs.length - 1 ? 'rounded-b-xl border-b-0' : ''}`}
              >
                <button
                  className="flex justify-between items-center w-full p-5 text-left bg-gray-900 text-white focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-lg font-semibold">{faq.question}</span>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="p-5 bg-gray-900 text-gray-300">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="mt-12 text-center scroll-animation">
            <p className="text-lg text-white mb-6">
              Ready to take the next step in your tech career journey?
            </p>
            <a 
              href="#book-call" 
              className="inline-block px-8 py-4 bg-[#06D6A0] text-[#333333] rounded-full text-lg font-bold hover:bg-[#05c090] transition-colors"
            >
              Book Your Free Strategy Call
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}