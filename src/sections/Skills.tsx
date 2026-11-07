import { Reveal } from "../components/ui/Reveal";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { Code2, Database, Server, Activity, Brain } from "lucide-react";
import { useSectionView } from "../hooks/useSectionView";

const skillCategories = [
{ icon: Code2, title: "API engineering", skills: ["Python", "FastAPI", "TypeScript", "Node.js / Express", "REST APIs", "validation", "access control"] },
{ icon: Server, title: "Async systems", skills: ["Kafka", "retries", "scheduled jobs", "persistent state", "session authentication"] },
{ icon: Database, title: "Data & storage", skills: ["PostgreSQL", "Redis", "D1 / SQLite", "CSV ingestion", "data-quality checks", "evidence-linked rules"] },
{ icon: Activity, title: "Delivery & testing", skills: ["Kubernetes", "Docker", "AWS", "Cloudflare Workers", "CI/CD", "Pytest", "integration tests"] },
{ icon: Brain, title: "Applied AI", skills: ["Retrieval-augmented generation (RAG)", "vector search", "OpenRouter LLM APIs", "prompts", "response parsing", "caching and fallbacks"] }
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
