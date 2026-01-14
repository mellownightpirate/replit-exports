import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const handleDemoClick = () => {
    const demoSection = document.querySelector("#dashboard");
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="about" className="pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden relative">
      {/* Decorative grid pattern in background - inspired by Sigma's data aesthetic */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
      </div>
      
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Small announcement banner - like Sigma's */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium bg-black text-white rounded-full monospace">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            New content available
            <a href="#" className="underline ml-1">Watch now</a>
          </div>
          
          {/* Bold headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
            Tech SME.<br/>Content Creator.
          </h1>
          
          {/* Concise subheading */}
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Sharing expertise in Data Analytics, AI/ML, and Solutions Engineering to help you advance your tech career.
          </p>
          
          {/* Clear CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              onClick={handleDemoClick}
              className="bg-black text-white hover:bg-gray-800 rounded-md px-8 py-6 h-auto text-base"
            >
              Watch My Videos
            </Button>
            <Button 
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 rounded-md px-8 py-6 h-auto text-base"
            >
              Join My Community <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
        
        {/* Dashboard-style graphic/visualization - Sigma-inspired */}
        <div className="relative mx-auto max-w-5xl">
          <div className="sigma-card bg-white p-0.5 md:p-1 rounded-xl border border-gray-200 shadow-md overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center bg-gray-50 border-b border-gray-200 p-2 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              </div>
              <div className="text-xs monospace text-gray-500 px-2 py-1 bg-white border border-gray-200 rounded flex-1 mx-2">
                content/analytics/overview
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded bg-gray-200"></div>
                <div className="w-6 h-6 rounded bg-gray-200"></div>
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="p-4 md:p-6 grid grid-cols-6 gap-4 bg-gray-50">
              {/* Stats row */}
              <div className="col-span-6 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {['Video Views', 'Subscriber Growth', 'Audience Engagement'].map((title, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
                    <p className="text-2xl font-bold monospace">{i === 0 ? '124K' : i === 1 ? '+32.7%' : '87.1%'}</p>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${i === 0 ? 'bg-blue-400' : i === 1 ? 'bg-green-400' : 'bg-purple-400'}`} 
                        style={{ width: i === 0 ? '60%' : i === 1 ? '80%' : '40%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Chart area */}
              <div className="col-span-4 bg-white p-4 rounded-lg border border-gray-200 h-72 relative overflow-hidden">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Channel Growth Over Time</h3>
                
                {/* Simple chart representation */}
                <div className="absolute inset-0 pt-10 px-4 pb-4">
                  <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                    <path 
                      d="M0,180 C40,160 80,100 120,120 C160,140 200,60 240,40 C280,20 320,60 360,40 L360,200 L0,200 Z" 
                      fill="rgba(59, 130, 246, 0.1)" 
                    />
                    <path 
                      d="M0,180 C40,160 80,100 120,120 C160,140 200,60 240,40 C280,20 320,60 360,40" 
                      fill="none" 
                      stroke="#3B82F6" 
                      strokeWidth="2" 
                    />
                    {/* Data points */}
                    {[180, 160, 100, 120, 140, 60, 40, 20, 60, 40].map((val, i) => (
                      <circle key={i} cx={i * 40} cy={val} r="4" fill="white" stroke="#3B82F6" strokeWidth="2" />
                    ))}
                  </svg>
                </div>
              </div>
              
              {/* Table/Data section */}
              <div className="col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 p-3">
                  <h3 className="text-sm font-medium text-gray-500">Recent Videos</h3>
                </div>
                <div className="p-2">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="p-2 text-left font-medium text-gray-500">Title</th>
                        <th className="p-2 text-right font-medium text-gray-500">Views</th>
                      </tr>
                    </thead>
                    <tbody className="monospace">
                      {[
                        {title: "Data Lake vs Data Warehouse", views: "24.3K"},
                        {title: "ML Models Explained", views: "18.7K"},
                        {title: "SQL for Data Analysts", views: "31.2K"},
                        {title: "Tableau Dashboard Tips", views: "15.5K"},
                        {title: "AI Ethics in Business", views: "22.1K"}
                      ].map((video, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="p-2 text-gray-600">{video.title}</td>
                          <td className="p-2 text-right text-gray-900">{video.views}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notion-style hand-drawn illustrations */}
          <div className="absolute -right-16 -top-10 hidden lg:block">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30,50 C30,20 90,20 90,50" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
              <circle cx="90" cy="50" r="8" fill="white" stroke="black" strokeWidth="1.5" />
              <path d="M91,43 L94,40 M89,43 L86,40" stroke="black" strokeWidth="1" />
              <path d="M86,52 L94,52" stroke="black" strokeWidth="1" />
              <path d="M86,55 C88,58 92,58 94,55" stroke="black" strokeWidth="1" />
            </svg>
          </div>
          
          <div className="absolute -left-16 -bottom-10 hidden lg:block">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M80,60 C110,60 110,20 80,20" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
              <circle cx="80" cy="20" r="8" fill="white" stroke="black" strokeWidth="1.5" />
              <path d="M76,18 L76,22" stroke="black" strokeWidth="1" />
              <path d="M80,18 L80,22" stroke="black" strokeWidth="1" />
              <path d="M84,18 L84,22" stroke="black" strokeWidth="1" />
              <path d="M76,25 C78,28 82,28 84,25" stroke="black" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
