export default function WhoIsThisForSection() {
  const checklistItems = [
    "Feeling stuck in your current job with limited growth potential",
    "Curious about tech but overwhelmed by where to start",
    "Want to earn more but need the skills to command higher salary",
    "Worried about AI making your current skills obsolete",
    "Ready to invest in yourself but need a structured path forward",
    "Seeking personalized guidance rather than generic online courses"
  ];

  return (
    <section id="who-this-is-for" className="pt-20 pb-16 md:pt-24 md:pb-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 scroll-animation">
            Who This Program Is For
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-12 scroll-animation">
            {checklistItems.map((item, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="bg-[#06D6A0] rounded-full p-1 mr-3 mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">{item}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-[#06D6A0] text-white p-8 md:p-10 rounded-xl text-center scroll-animation shadow-[0_0_15px_rgba(6,214,160,0.3)] overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-[#06D6A0]/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#06D6A0]/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
            
            <p className="relative text-xl md:text-2xl font-bold mb-2 text-[#06D6A0]">Did you know?</p>
            <p className="relative text-3xl md:text-5xl font-extrabold mb-3">
              <span className="text-[#06D6A0] inline-block animate-pulse">59%</span>
              <span> of the workforce</span>
            </p>
            <p className="relative text-lg md:text-2xl mb-2">will need reskilling by 2030</p>
            <p className="relative text-sm md:text-base text-gray-400">– World Economic Forum</p>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="font-medium text-lg">Don't get left behind. Start your transition into tech today.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
