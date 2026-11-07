import { motion, AnimatePresence } from "framer-motion";
import { X, Github, ExternalLink, ArrowRight } from "lucide-react";
import { useEffect } from "react";

interface Project {
  title: string;
  category: string;
  desc: string;
  tech: string[];
  link: string | null;
  github: string | null;
  details?: {
    problem: string;
    solution: string;
    impact: string;
  };
}

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal = ({ project, isOpen, onClose }: ProjectModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && project && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl relative"
            >
              {/* Header Image / Gradient */}
              <div className="h-48 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:1rem_1rem]" />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/20 rounded-full transition-colors text-white"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-6 left-8">
                  <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-2 py-1 rounded border border-primary/20 mb-2 inline-block">
                    {project.category}
                  </span>
                  <h2 className="text-4xl font-bold text-white">{project.title}</h2>
                </div>
              </div>

              <div className="p-8">
                {/* Links */}
                <div className="flex gap-4 mb-8 border-b border-white/5 pb-8">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      <Github size={16} />
                      View Source
                    </a>
                  )}
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors border border-primary/20"
                    >
                      <ExternalLink size={16} />
                      Visit website
                    </a>
                  )}
                </div>

                {/* Extended Details */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                       <ArrowRight size={18} className="text-primary" /> Project focus
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {project.details?.problem || "Complex challenges requiring scalable architectural solutions and high-performance engineering."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                       <ArrowRight size={18} className="text-primary" /> Implementation
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {project.details?.solution || "Implemented using modern distributed systems patterns, ensuring low latency and high availability."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                       <ArrowRight size={18} className="text-primary" /> Additional work
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {project.details?.impact || "Optimized performance, reduced operational overhead, and delivered seamless user experiences."}
                    </p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="mt-10 pt-8 border-t border-white/5">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Technologies Used</h4>
                    <div className="flex flex-wrap gap-2">
                        {project.tech.map((t, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-primary/80">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
