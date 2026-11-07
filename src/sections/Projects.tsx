import { SpotlightCard } from "../components/ui/SpotlightCard";
import { Github, ExternalLink, Code2 } from "lucide-react";
import { Reveal } from "../components/ui/Reveal";
import { TiltCard } from "../components/ui/TiltCard";
import { useState } from "react";
import { ProjectModal } from "../components/ui/ProjectModal";
import { useSectionView } from "../hooks/useSectionView";
import { trackLinkClick, trackButtonClick } from "../lib/analytics";

const projects = [
  {
    "title": "AlgoHabit",
    "category": "AI-assisted learning companion",
    "desc": "Integrated OpenRouter chat completions for learning recommendations and personalised feedback, with prompt templates and JSON response parsing.",
    "tech": [
      "TypeScript",
      "React",
      "OpenRouter API"
    ],
    "link": null,
    "github": null,
    "details": {
      "problem": "AI-assisted learning companion",
      "solution": "Integrated OpenRouter chat completions for learning recommendations and personalised feedback, with prompt templates and JSON response parsing.",
      "impact": "Added recommendation caching, client-side request checks and static fallbacks so core learning flows work without AI."
    }
  },
  {
    "title": "Berthbell",
    "category": "Shipment exception desk",
    "desc": "Developed shipment CSV ingestion and workspace-scoped exception APIs with input validation, access checks and upload quotas.",
    "tech": [
      "TypeScript",
      "Cloudflare Workers",
      "D1",
      "React",
      "Python"
    ],
    "link": "https://berthbell.com",
    "github": null,
    "details": {
      "problem": "Shipment exception desk",
      "solution": "Developed shipment CSV ingestion and workspace-scoped exception APIs with input validation, access checks and upload quotas.",
      "impact": "Built deterministic status rules with source timestamps and evidence, separating missing or stale coverage from reported schedule changes. Connected a React workspace to the API for reviewing shipment exceptions. Current maritime source coverage is regional, not global tracking."
    }
  },
  {
    "title": "Gundi",
    "category": "Road reporting and measurement research",
    "desc": "Built a reporting interface with map-based location selection, official ward-boundary context and source-linked repair guidance.",
    "tech": [
      "Python",
      "NumPy",
      "SciPy",
      "JavaScript",
      "MapLibre"
    ],
    "link": "https://gundi.in",
    "github": null,
    "details": {
      "problem": "Road reporting and measurement research",
      "solution": "Built a reporting interface with map-based location selection, official ward-boundary context and source-linked repair guidance.",
      "impact": "Implemented a Python geometry core for road-surface fitting, pothole dimensions, uncertainty propagation and repair comparison. Tested measurement logic on synthetic cavity cases and added abstention gates when scale or geometry evidence is insufficient."
    }
  },
  {
    "title": "Meanwhile",
    "category": "Persistent shared-world simulation",
    "desc": "Built a persistent simulation backend with scheduled world updates, shared state and character interaction workflows.",
    "tech": [
      "JavaScript",
      "Cloudflare Workers",
      "D1",
      "OAuth"
    ],
    "link": null,
    "github": null,
    "details": {
      "problem": "Persistent shared-world simulation",
      "solution": "Built a persistent simulation backend with scheduled world updates, shared state and character interaction workflows.",
      "impact": "Implemented email/password and Google/GitHub sign-in, expiring revocable sessions and transactional account-recovery flows."
    }
  },
  {
    "title": "HelpMyBuddy",
    "category": "Team-built emergency-help application",
    "desc": "Developed the TypeScript/Express backend and PostgreSQL integration for a team-built mobile emergency-help application.",
    "tech": [
      "Node.js",
      "Express",
      "TypeScript",
      "PostgreSQL"
    ],
    "link": null,
    "github": "https://github.com/SiliconNinjas/HelpMyBuddy",
    "details": {
      "problem": "Team-built emergency-help application",
      "solution": "Developed the TypeScript/Express backend and PostgreSQL integration for a team-built mobile emergency-help application.",
      "impact": "Worked alongside dedicated frontend and ML contributors to connect mobile workflows with backend services."
    }
  }
,
  {
    title: "Ledgerly",
    category: "FINTECH // CLASSICAL ML",
    desc: "Smart finance tracker with scikit-learn transaction classification, spending trend forecasting, and MAD anomaly detection.",
    tech: ["FastAPI", "React", "scikit-learn", "MLflow", "PostgreSQL", "Pytest"],
    link: null,
    github: null,
    details: {
        problem: "Managing multiple subscriptions and accurately categorizing transactions and anomalies.",
        solution: "Built scikit-learn pipelines using TF-IDF and Logistic Regression for classification, statistical forecasting for spending trends, and MAD-based anomaly detection served through FastAPI endpoints with Pydantic validation.",
        impact: "Used MLflow for experiment tracking and model metrics. Achieved 92% code coverage with Pytest across 40+ endpoints."
    }
  },
  {
    title: "AG-WALLET",
    category: "SUPPLY CHAIN // AGRI",
    desc: "Supply chain platform connecting farmers and distributors with real-time price monitoring and Google Maps API.",
    tech: ["Android (Java)", "MySQL", "Google Maps API"],
    link: null,
    github: null,
    details: {
        problem: "Lack of transparency in agricultural supply chains leads to poor pricing for farmers.",
        solution: "Built a direct-access platform for location-based distributor discovery and quality rating systems.",
        impact: "Enabled transparent pricing and improved downstream visibility for agricultural producers."
    }
  }
];

export const Projects = () => {
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);
  const sectionRef = useSectionView({
    sectionName: "Projects",
    sectionId: "work",
  });

  const handleProjectClick = (project: typeof projects[0]) => {
    trackButtonClick(`Project: ${project.title}`, "projects_section");
    setSelectedProject(project);
  };

  const handleProjectLinkClick = (url: string, type: 'github' | 'external') => {
    trackLinkClick(url, type === 'github' ? 'GitHub' : 'External Link', type === 'github' ? 'social' : 'external');
  };

  return (
    <section ref={sectionRef} id="work" className="py-24 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto">
         <Reveal>
             <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
                Key Projects
             </h2>
         </Reveal>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
                <Reveal key={index} delay={index * 0.1}>
                    <div onClick={() => handleProjectClick(project)} className="cursor-pointer h-full"> 
                        <TiltCard>
                            <SpotlightCard className="group relative overflow-hidden flex flex-col justify-between h-full min-h-[300px] p-8 hover:border-primary/50 transition-all">
                                
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-1 rounded">
                                            {project.category}
                                        </span>
                                        <div className="flex gap-2">
                                            {project.github && (
                                                <a
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProjectLinkClick(project.github!, 'github');
                                                    }}
                                                    className="text-text-secondary hover:text-white transition-colors"
                                                >
                                                    <Github size={20} />
                                                </a>
                                            )}
                                            {project.link && (
                                                <a
                                                    href={project.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProjectLinkClick(project.link!, 'external');
                                                    }}
                                                    className="text-text-secondary hover:text-white transition-colors"
                                                >
                                                    <ExternalLink size={20} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                                        {project.title}
                                    </h3>
                                    
                                    <p className="text-text-secondary leading-relaxed mb-6 text-sm">
                                        {project.desc}
                                    </p>
                                </div>

                                <div className="relative z-10 border-t border-white/5 pt-4 mt-auto">
                                    <div className="flex flex-wrap gap-4 items-center">
                                        <Code2 size={14} className="text-primary" />
                                        {project.tech.map((t, i) => (
                                            <span key={i} className="text-xs font-medium text-text-secondary">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </SpotlightCard>
                        </TiltCard>
                    </div>
                </Reveal>
            ))}
         </div>

         <ProjectModal 
            project={selectedProject} 
            isOpen={!!selectedProject} 
            onClose={() => setSelectedProject(null)} 
         />
      </div>
    </section>
  );
};
