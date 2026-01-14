export default function Projects() {
  const projects = [
    {
      title: "Bank of England Analytics",
      type: "Case Study",
      year: "2022",
      description: "Implemented an AI-powered search and analytics solution via Squirro, reducing manual insight discovery across departments and enabling faster data-driven decisions.",
      technologies: ["AI Analytics", "Squirro", "Search Optimization"]
    },
    {
      title: "FAANG Embedded Dashboards",
      type: "Case Study",
      year: "2021",
      description: "Delivered high-performing embedded dashboards with Simba connectors and Logi Symphony, creating seamless analytics experiences within existing applications.",
      technologies: ["Embedded Analytics", "Logi Symphony", "Simba Connectors"]
    },
    {
      title: "Healthcare BI Strategy",
      type: "Case Study",
      year: "2020",
      description: "Guided dashboard strategy to align with finance and treatment education rollout, enabling better patient outcomes through improved data visibility.",
      technologies: ["Dashboard Strategy", "Healthcare Analytics", "Education Integration"]
    }
  ];

  return (
    <section id="projects" className="py-20 border-b border-foreground">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10">
          <header>
            <h2 className="text-3xl font-['VT323'] uppercase mb-2">Projects</h2>
            <div className="e-ink-divider w-16"></div>
          </header>

          <div className="grid grid-cols-1 gap-8">
            {projects.map((project, index) => (
              <div 
                key={index}
                className="border border-foreground grid grid-cols-1 md:grid-cols-12"
              >
                <div className="md:col-span-3 border-b md:border-b-0 md:border-r border-foreground p-6">
                  <div className="font-['JetBrains_Mono'] font-extralight">
                    <p className="font-normal uppercase font-['VT323'] text-lg">{project.title}</p>
                    <p className="text-sm mb-2">{project.type}</p>
                    <p className="text-sm">{project.year}</p>
                  </div>
                </div>
                
                <div className="md:col-span-9 p-6">
                  <div className="font-['JetBrains_Mono'] font-extralight mb-4">
                    <p>{project.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span 
                        key={techIndex}
                        className="border border-foreground px-2 py-1 text-xs font-['JetBrains_Mono'] font-extralight"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}