import { useState } from "react";
import { motion } from "framer-motion";
import { contentItems } from "@/lib/data";
import { ContentItem, Platform, Topic } from "@/lib/types";

export default function ContentHub() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [filteredContent, setFilteredContent] = useState(contentItems);

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    
    if (filter === "all") {
      setFilteredContent(contentItems);
    } else {
      const filtered = contentItems.filter(item => 
        item.platform === filter || item.topics.includes(filter as Topic)
      );
      setFilteredContent(filtered);
    }
  };

  const getPlatformClass = (platform: Platform) => {
    switch (platform) {
      case "youtube": return "bg-primary-600";
      case "linkedin": return "bg-blue-600";
      case "tiktok": return "bg-rose-600";
      default: return "bg-primary-600";
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "youtube": return "youtube";
      case "linkedin": return "linkedin";
      case "tiktok": return "tiktok";
      default: return "video";
    }
  };

  return (
    <section id="content" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">Content Hub</h2>
          <p className="mt-4 text-lg text-neutral-600">Explore my latest videos, livestreams, and educational content</p>
        </div>

        <div className="mt-8">
          <div className="flex justify-center flex-wrap gap-4 mb-8">
            <button 
              onClick={() => handleFilterClick("all")}
              className={`px-4 py-2 rounded-md transition-colors ${activeFilter === "all" ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
            >
              All Content
            </button>
            <button 
              onClick={() => handleFilterClick("youtube")}
              className={`px-4 py-2 rounded-md transition-colors ${activeFilter === "youtube" ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
            >
              YouTube
            </button>
            <button 
              onClick={() => handleFilterClick("linkedin")}
              className={`px-4 py-2 rounded-md transition-colors ${activeFilter === "linkedin" ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
            >
              LinkedIn
            </button>
            <button 
              onClick={() => handleFilterClick("tiktok")}
              className={`px-4 py-2 rounded-md transition-colors ${activeFilter === "tiktok" ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
            >
              TikTok
            </button>
            <button 
              onClick={() => handleFilterClick("data-analytics")}
              className={`px-4 py-2 rounded-md transition-colors ${activeFilter === "data-analytics" ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
            >
              Data Analytics
            </button>
            <button 
              onClick={() => handleFilterClick("ai-ml")}
              className={`px-4 py-2 rounded-md transition-colors ${activeFilter === "ai-ml" ? "bg-primary-600 text-white" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"}`}
            >
              AI/ML
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item, index) => (
              <motion.div 
                key={index}
                className="content-card bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img 
                    src={item.thumbnailUrl} 
                    alt={item.title} 
                    className="object-cover w-full h-full"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-neutral-900/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <a 
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-500 transition-colors"
                    >
                      <i className={`fab fa-${getPlatformIcon(item.platform)}`}></i>
                    </a>
                  </div>
                  <div className={`absolute top-2 right-2 ${getPlatformClass(item.platform)} text-white text-xs px-2 py-1 rounded`}>
                    {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg text-neutral-900 line-clamp-2">{item.title}</h3>
                  <p className="text-neutral-600 text-sm mt-2 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-neutral-500">{item.views} views • {item.publishedDate}</span>
                    <div className="flex space-x-2">
                      {item.topics.map((topic, i) => (
                        <span key={i} className="text-xs bg-neutral-100 px-2 py-1 rounded-full">
                          {topic.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a 
              href="#"
              className="inline-flex items-center px-4 py-2 border border-primary-600 rounded-md shadow-sm text-base font-medium text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              View All Content
              <i className="fas fa-arrow-right ml-2"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
