export default function FeaturesSection() {
  const features = [
    {
      title: "1:1 Mentoring Sessions",
      description: "Personalized guidance from industry experts who understand your unique situation and goals.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Group Coaching Calls",
      description: "Learn from peers, expand your network, and get accountability through regular group sessions.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "CV & LinkedIn Overhaul",
      description: "Transform your professional brand to highlight your tech skills and attract the right opportunities.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Templates & Resources",
      description: "Get access to proven templates for job applications, portfolio sites, and networking outreach.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      )
    },
    {
      title: "Project Feedback",
      description: "Get expert review of your portfolio projects and coding work to ensure quality and improvement.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: "Lifetime Community",
      description: "Join our private network of tech professionals for ongoing support, opportunities, and networking.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#06D6A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5v-1.965A2.5 2.5 0 0017.5 1h-5A2.5 2.5 0 0010 3.5v.435a2.5 2.5 0 01-2.5 2.5H7a2 2 0 00-2 2v1.5a2.5 2.5 0 01-2.5 2.5H2a1 1 0 000 2h.5A4.5 4.5 0 007 14.5v-1A2.5 2.5 0 019.5 11H12a2 2 0 002-2 2 2 0 004 0 2 2 0 00-2-2h-.5A2.5 2.5 0 0010 4.5v-1" />
        </svg>
      )
    }
  ];

  return (
    <section id="features" className="py-16 md:py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white scroll-animation">
          What You Get
        </h2>
        <p className="text-lg text-center max-w-2xl mx-auto mb-12 text-gray-300 scroll-animation">
          Everything you need to successfully transition into a tech career
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow scroll-animation">
              <div className="bg-[#06D6A0]/20 h-14 w-14 rounded-full flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
