import { useLocation } from 'wouter';

export default function PricingSection() {
  const [, navigate] = useLocation();

  const pricingPlans = [
    {
      name: "Starter",
      price: 197,
      originalPrice: 297,
      description: "Perfect for beginners looking to explore tech careers with professional guidance.",
      isPrimary: false,
      features: [
        "<strong>2 Mentoring Sessions</strong> (1 hour each)",
        "Career Transition Templates",
        "Lifetime Community Access",
        "Tech Skills Assessment"
      ],
      callToAction: "Choose Starter",
      badge: "Early-Bird"
    },
    {
      name: "Pro",
      price: 497,
      originalPrice: 597,
      description: "Comprehensive support for those serious about breaking into tech.",
      isPrimary: true,
      features: [
        "<strong>4 Mentoring Sessions</strong> (1 hour each)",
        "CV & LinkedIn Profile Review",
        "Monthly Group Coaching Calls",
        "All Starter Features",
        "Tech Career Roadmap"
      ],
      callToAction: "Choose Pro",
      badge: "Most Popular"
    },
    {
      name: "Premium",
      price: 747,
      originalPrice: null,
      description: "Complete transformation journey with maximum support and accountability.",
      isPrimary: false,
      features: [
        "<strong>6 Mentoring Sessions</strong> (1 hour each)",
        "Project & Portfolio Feedback",
        "Job Search Strategy Sessions",
        "Interview Preparation",
        "All Pro Features"
      ],
      callToAction: "Choose Premium",
      badge: "Limited (5 Spots)"
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white scroll-animation">
          Early-Bird Pricing Plans
        </h2>
        <p className="text-lg text-center max-w-2xl mx-auto mb-4 text-gray-300 scroll-animation">
          Choose the plan that fits your needs and budget
        </p>
        <p className="text-md text-center max-w-2xl mx-auto mb-12 text-[#06D6A0] font-semibold scroll-animation">
          ⚡ Founding member pricing available until April 30, 2025 or until spots are filled
        </p>
        
        <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`flex-1 bg-gray-800 rounded-2xl ${plan.isPrimary ? 'shadow-xl border-2 border-[#06D6A0] relative' : 'shadow-md'} overflow-hidden pricing-card transition-all duration-300 scroll-animation`}
            >
              {plan.badge && (
                <div className="absolute top-0 right-0 bg-[#06D6A0] text-[#333333] font-bold py-1 px-4 rounded-bl-lg rounded-tr-lg">
                  {plan.badge}
                </div>
              )}
              <div className={`p-6 md:p-8 ${plan.badge ? 'pt-12' : ''}`}>
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl md:text-4xl font-extrabold text-white">£{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-gray-400 ml-2 line-through">£{plan.originalPrice}</span>
                  )}
                  <span className="text-gray-300 ml-2">one-time</span>
                </div>
                <p className="text-gray-300 mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#06D6A0] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300" dangerouslySetInnerHTML={{ __html: feature }}></span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => {
                    navigate(`/checkout?plan=${encodeURIComponent(plan.name)}&price=${plan.price}&description=${encodeURIComponent(plan.description)}`);
                  }}
                  className={`block w-full py-3 text-center ${plan.isPrimary ? 'bg-[#06D6A0] hover:bg-[#05c090] text-[#333333]' : 'bg-gray-700 hover:bg-gray-600 text-white'} rounded-full font-bold transition-colors`}
                >
                  {plan.callToAction}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Guarantees & Refund Policy */}
        <div className="max-w-4xl mx-auto mt-16 grid md:grid-cols-2 gap-8 scroll-animation">
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-md border border-gray-700">
            <div className="flex items-start mb-4">
              <div className="text-[#06D6A0] mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">"Until You're Hired" Guarantee</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#06D6A0] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Clients can stay in the programme for as long as they need — until they land a job</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#06D6A0] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">No expiry, no time pressure</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-md border border-gray-700">
            <div className="flex items-start mb-4">
              <div className="text-[#06D6A0] mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-white">Risk-Free: 2-Week Full Refund Policy</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#06D6A0] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">If you decide within 14 days it's not a fit, you get your money back</span>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#06D6A0] mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">No questions asked — our focus is on real transformation, not hard selling</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center">
          <p className="text-lg font-medium mb-4 text-white">Not sure which plan is right for you?</p>
          <a 
            href="#quiz" 
            className="inline-block px-8 py-3 bg-[#06D6A0] text-[#333333] rounded-full font-bold hover:bg-[#05c090] transition-colors"
          >
            Take the Readiness Quiz
          </a>
        </div>
      </div>
    </section>
  );
}
