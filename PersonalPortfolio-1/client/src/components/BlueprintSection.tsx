import { motion } from "framer-motion";
import { 
  BarChart3, 
  Brain, 
  Database, 
  PresentationIcon,
  Code,
  MessagesSquare,
  FileSpreadsheet,
  HandHelping
} from "lucide-react";

export default function ProductOverviewSection() {
  const expertise = [
    {
      icon: <Database className="h-5 w-5" />,
      title: "Data Analytics",
      description: "Expertise in transforming raw data into actionable insights using SQL, Python, and modern visualization tools."
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI/ML Solutions",
      description: "Implementing practical machine learning models that solve real business problems and deliver ROI."
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Solutions Engineering",
      description: "Bridging the gap between business requirements and technical implementation with scalable architectures."
    },
    {
      icon: <PresentationIcon className="h-5 w-5" />,
      title: "Technical Training",
      description: "Delivering engaging workshops and courses that make complex technical concepts accessible to all."
    }
  ];
  
  const services = [
    {
      icon: <MessagesSquare className="h-5 w-5" />,
      title: "Technical Consulting",
      description: "Strategic guidance on data platforms, AI integration, and technology selection tailored to your business goals."
    },
    {
      icon: <FileSpreadsheet className="h-5 w-5" />,
      title: "Data Workflow Optimization",
      description: "Streamlining data processes for greater efficiency, accuracy, and insights that drive better decisions."
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Custom Analytics Solutions",
      description: "Building dashboards and reporting systems that make critical business data accessible and actionable."
    },
    {
      icon: <HandHelping className="h-5 w-5" />,
      title: "Team Enablement",
      description: "Upskilling your team with the technical knowledge and tools they need to succeed in data-driven roles."
    }
  ];

  return (
    <section id="dashboard" className="py-20 bg-white relative">
      {/* Decorative grid pattern - Sigma-inspired */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
      </div>

      <div className="container relative">
        <div className="max-w-2xl mx-auto mb-16 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">My Expertise</h2>
          <p className="text-xl text-gray-600">
            Specialized knowledge in data analytics, AI/ML, and technical solutions
          </p>
        </div>

        {/* Tech expertise visualization */}
        <motion.div 
          className="mx-auto max-w-4xl mb-20 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-12 gap-6">
            {/* Left side - skill category breakdown */}
            <div className="col-span-12 md:col-span-5">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full">
                <h3 className="text-lg font-medium mb-6">Technical Proficiency</h3>
                
                {/* Skill bars with Sigma-inspired clean design */}
                <div className="space-y-6">
                  {[
                    { label: "Data Analytics", value: 95 },
                    { label: "AI/ML", value: 85 },
                    { label: "Data Engineering", value: 90 },
                    { label: "Solutions Architecture", value: 88 },
                    { label: "Technical Leadership", value: 92 }
                  ].map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.label}</span>
                        <span className="text-xs text-gray-500 monospace">{skill.value}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            i === 0 ? 'bg-blue-500' : 
                            i === 1 ? 'bg-purple-500' : 
                            i === 2 ? 'bg-green-500' : 
                            i === 3 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${skill.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right side - technologies breakdown */}
            <div className="col-span-12 md:col-span-7">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium mb-6">Technology Stack</h3>
                
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { category: "Languages", items: ["Python", "SQL", "R", "JavaScript"] },
                    { category: "Data Tools", items: ["Tableau", "PowerBI", "Looker", "Databricks"] },
                    { category: "ML/AI", items: ["TensorFlow", "PyTorch", "scikit-learn", "NLP"] },
                    { category: "Cloud", items: ["AWS", "Azure", "GCP", "Snowflake"] }
                  ].map((category, i) => (
                    <div key={i} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{category.category}</h4>
                      <ul className="space-y-1">
                        {category.items.map((item, j) => (
                          <li key={j} className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              i === 0 ? 'bg-blue-500' : 
                              i === 1 ? 'bg-purple-500' : 
                              i === 2 ? 'bg-green-500' : 'bg-amber-500'
                            }`}></div>
                            <span className="text-sm text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Notion-style hand-drawn annotation */}
          <div className="absolute -right-10 top-20 hidden lg:block">
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20,40 C20,10 60,30 100,10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
              <path d="M104,10 L112,18 M104,18 L112,10" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          
          <div className="absolute -left-10 top-40 hidden lg:block">
            <svg width="100" height="80" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M80,40 C80,10 40,30 20,10" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
              <circle cx="20" cy="10" r="6" fill="white" stroke="black" strokeWidth="1.5" />
              <path d="M18,8 C18,12 22,12 22,8" stroke="black" strokeWidth="1" />
            </svg>
          </div>
        </motion.div>

        {/* Expertise grid - in Sigma's clean, modular style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {expertise.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="h-10 w-10 bg-gray-50 rounded-md flex items-center justify-center mb-4 text-gray-800">
                {item.icon}
              </div>
              
              <h3 className="text-lg font-medium mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Services section */}
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">Services Offered</h2>
          <p className="text-xl text-gray-600">
            How I can help your organization succeed
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <div className="h-10 w-10 bg-gray-50 rounded-md flex items-center justify-center mb-4 text-gray-800">
                {service.icon}
              </div>
              
              <h3 className="text-lg font-medium mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
