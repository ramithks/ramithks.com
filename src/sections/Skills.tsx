import { Reveal } from "../components/ui/Reveal";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { Code2, Database, Server, Activity, Brain, Layers } from "lucide-react";
import { useSectionView } from "../hooks/useSectionView";

const skillCategories = [
  {
    icon: Code2,
    title: "Backend & Languages",
    skills: [
      "Python",
      "FastAPI",
      "AsyncIO",
      "REST APIs",
      "Node.js",
      "TypeScript",
    ],
  },
  {
    icon: Brain,
    title: "Generative AI & Machine Learning",
    skills: [
      "LangChain",
      "LangGraph",
      "LLM API Integration",
      "RAG",
      "Prompt Engineering",
      "Structured Outputs",
      "Embeddings",
      "scikit-learn",
      "Model Serving",
    ],
  },
  {
    icon: Database,
    title: "AI Data & Storage",
    skills: [
      "pgvector",
      "Vector Search",
      "PostgreSQL",
      "Redis",
      "MongoDB",
      "Pandas",
      "NumPy",
    ],
  },
  {
    icon: Server,
    title: "Systems & Cloud",
    skills: [
      "Microservices",
      "Kafka",
      "Event-Driven Architecture",
      "Kubernetes",
      "Docker",
      "AWS",
      "GitHub Actions",
      "CI/CD",
      "Observability",
    ],
  },
  {
    icon: Activity,
    title: "Testing & Reliability",
    skills: [
      "Pytest",
      "Integration Testing",
      "Retry and Fallback Workflows",
      "Root Cause Analysis",
    ],
  },
  {
    icon: Layers,
    title: "Additional",
    skills: [
      "React",
      "Flutter",
    ],
  },
];

export const Skills = () => {
  const sectionRef = useSectionView({
    sectionName: "Skills",
    sectionId: "skills",
  });

  return (
    <section ref={sectionRef} id="skills" className="py-32 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="flex items-center gap-4 mb-20">
            <div className="h-px w-20 bg-white/20"></div>
            <span className="text-white/40 font-mono tracking-widest uppercase text-sm">
              Technical Stack
            </span>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillCategories.map((category, idx) => (
            <Reveal key={idx} delay={idx * 0.1}>
              <SpotlightCard className="p-6 bg-white/5 border-white/10 h-full">
                {/* Icon */}
                <div className="mb-4 inline-flex p-3 rounded-xl bg-primary/10">
                  <category.icon className="text-primary" size={24} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4">{category.title}</h3>

                {/* Skills List */}
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, skillIdx) => (
                    <span
                      key={skillIdx}
                      className="px-2.5 py-1 text-xs font-mono bg-white/5 text-gray-300 rounded border border-white/10 hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
