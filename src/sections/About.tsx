import { SpotlightCard } from "../components/ui/SpotlightCard";
import { GraduationCap } from "lucide-react";
import { Reveal } from "../components/ui/Reveal";
import { useSectionView } from "../hooks/useSectionView";

const education = [
    {
        school: "Christ University, Bangalore",
        degree: "Bachelor's degree, Computer Science",
        year: "2018 – 2021",
        grade: "CGPA: 3.3/4.0"
    },
    {
        school: "Excellent PU College",
        degree: "Senior Secondary (XII), Commerce",
        year: "2016 – 2018",
        grade: "83.33%",
        activity: "Rover/Ranger, Business Quizzes"
    },
    {
        school: "Jaycees School, Sringeri",
        degree: "Secondary (X)",
        year: "2016",
        grade: "79.00%"
    }
];

const achievements = [
    { year: "2024", title: "HackBangalore Winner" },
    { year: "2024", title: "AWS Cloud Foundations Certified" },
    { year: "2023", title: "Open Source Contributor" }
];

const languages = [
    { name: "English", level: "Professional" },
    { name: "Hindi", level: "Working" },
    { name: "Kannada", level: "Native" }
];

export const About = () => {
  const sectionRef = useSectionView({
    sectionName: "About",
    sectionId: "about",
  });

  return (
    <section ref={sectionRef} id="about" className="py-32 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto">
            
            {/* Intro */}
            <Reveal>
                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    <div>
                        <h2 className="text-6xl font-bold mb-8 leading-tight">
                            Engineered for <br/>
                            <span className="text-primary">Scale.</span>
                        </h2>
                    </div>
                    <div className="prose prose-invert prose-lg text-gray-300">
                        <p>
                            Senior Backend Engineer with 5+ years of experience building scalable Python/FastAPI services, distributed systems and cloud-native applications.
                        </p>
                        <p>
                            Experienced in developing AI-enabled backend features using LangChain, LLM APIs, RAG pipelines and lightweight machine-learning models.
                        </p>
                    </div>
                </div>
            </Reveal>

            {/* Education Grid */}
            <Reveal delay={0.2}>
                <div className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <GraduationCap className="text-primary" />
                    Academic Timeline
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-24">
                    {education.map((edu, idx) => (
                        <SpotlightCard key={idx} className="p-8 bg-white/5 border-white/10">
                            <div className="text-sm font-mono text-primary mb-2">{edu.year}</div>
                            <h3 className="text-xl font-bold mb-1">{edu.school}</h3>
                            <div className="text-gray-400 mb-4">{edu.degree}</div>
                            <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold">
                                {edu.grade}
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </Reveal>
            
            <div className="grid md:grid-cols-2 gap-12 border-t border-white/10 pt-12">
                 
                 {/* Honors & Awards - Minimal List */}
                 <Reveal delay={0.3}>
                    <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-widest">
                        Recognition
                    </h3>
                    <div className="space-y-4">
                        {achievements.map((item, idx) => (
                            <div key={idx} className="flex items-baseline gap-4 group">
                                <span className="font-mono text-primary text-sm">{item.year}</span>
                                <span className="text-lg font-medium text-white/80 group-hover:text-white transition-colors">
                                    {item.title}
                                </span>
                            </div>
                        ))}
                    </div>
                 </Reveal>

                 {/* Languages - Minimal Badges */}
                 <Reveal delay={0.4}>
                    <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-widest">
                        Languages
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {languages.map((lang, idx) => (
                            <div key={idx} className="px-4 py-2 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors cursor-default">
                                <span className="text-white font-medium">{lang.name}</span>
                                <span className="text-white/40 ml-2">/ {lang.level}</span>
                            </div>
                        ))}
                    </div>
                 </Reveal>

            </div>

        </div>
    </section>
  );
};

