import { Reveal } from "../components/ui/Reveal";
import { useSectionView } from "../hooks/useSectionView";

const experiences = [
  {
    company: "Thermo Fisher Scientific",
    role: "Senior Backend Engineer",
    period: "Feb 2026 - Present",
    location: "Bengaluru, Karnataka, India (Hybrid)",
    points: [
      "Build Python/FastAPI services for high-reliability e-commerce checkout and order-processing workflows on Kubernetes.",
      "Implemented Kafka-based acknowledgement processing, validation and status updates across asynchronous order workflows.",
      "Improved reliability through structured error handling, retries, observability and integration testing."
    ],
    tech: ["Python", "FastAPI", "Kubernetes", "Kafka", "Grafana", "Microservices"]
  },
  {
    company: "Zolnoi Innovations",
    role: "Backend Engineer",
    period: "Oct 2024 - Present",
    location: "Bengaluru",
    points: [
      "Built industrial IoT analytics APIs using FastAPI, PostgreSQL, Redis and MongoDB, processing 10,000+ daily requests.",
      "Integrated rule-based and ML-generated anomaly insights into production, energy and cycle-time analytics workflows.",
      "Designed a multi-channel alerting system with retries and failure handling, processing 5,000+ notifications daily."
    ],
    tech: ["FastAPI", "PostgreSQL", "Redis", "MongoDB", "AWS", "Docker"]
  },
  {
    company: "JustPoll (Streetlab Internet Pvt Ltd)",
    role: "Founder & CTO",
    period: "Jul 2021 - Aug 2024",
    location: "Bengaluru",
    points: [
      "Founded and scaled a social media platform to 1,500+ Android and 600+ iOS users; architected TypeScript backend and Flutter mobile application.",
      "Boosted query performance by 40% via schema optimization; cut deployment time by 60% with ECS autoscaling and CI/CD pipelines.",
      "Deployed comprehensive monitoring with Grafana and Redis task queues, maintaining sub-200ms P95 latency and reducing production incidents by 45%.",
      "Led 5-member engineering team through 20+ production releases; improved user retention by 65% through mentoring and architecture reviews."
    ],
    tech: ["Node.js", "TypeScript", "PostgreSQL", "Redis", "AWS (ECS, S3)", "Flutter", "CI/CD"]
  }
];

export const Experience = () => {
  const sectionRef = useSectionView({
    sectionName: "Experience",
    sectionId: "experience",
  });

  return (
    <section ref={sectionRef} id="experience" className="py-32 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        <Reveal>
            <div className="flex items-center gap-4 mb-20">
                <div className="h-px w-20 bg-white/20"></div>
                <span className="text-white/40 font-mono tracking-widest uppercase text-sm">
                    System Logs
                </span>
            </div>
        </Reveal>

        <div className="relative border-l-2 border-white/5 ml-4 md:ml-20 space-y-20">
            {experiences.map((exp, index) => (
                <div key={index} className="relative pl-8 md:pl-20">
                    {/* Commits Node Marker */}
                    <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-black border-4 border-white/10 group-hover:border-primary transition-colors z-10" />
                    
                    <Reveal delay={index * 0.1}>
                        <div className="grid md:grid-cols-[1fr_3fr] gap-4 md:gap-10">
                            
                            {/* Metadata Column */}
                            <div className="text-white/30 font-mono text-sm pt-1">
                                <div>{exp.period}</div>
                                <div className="mt-1 text-primary/80">{exp.location}</div>
                            </div>

                            {/* Content Column */}
                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2">
                                    {exp.company}
                                </h3>
                                <div className="text-lg text-white/50 mb-6 font-medium tracking-wide">
                                    {exp.role}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {exp.points.map((point, i) => (
                                        <li key={i} className="text-gray-400 text-lg leading-relaxed pl-4 border-l border-white/10">
                                            {point}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex flex-wrap gap-2">
                                    {exp.tech.map((t, i) => (
                                        <span key={i} className="text-xs font-mono text-white/30 border border-white/5 px-2 py-1 rounded hover:text-primary hover:border-primary/20 transition-colors cursor-default">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
