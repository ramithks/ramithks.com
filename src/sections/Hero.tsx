import { motion } from "framer-motion";
import profileImg from "../assets/profile_alt.jpg";
import { ArrowRight, Download } from "lucide-react";
import { useSectionView } from "../hooks/useSectionView";
import { trackButtonClick, trackResumeDownload } from "../lib/analytics";

export const Hero = () => {
    const sectionRef = useSectionView({
        sectionName: "Hero",
        sectionId: "hero",
    });

    const handleExploreClick = () => {
        trackButtonClick("Explore Work", "hero_section");
    };

    const handleResumeDownload = () => {
        trackResumeDownload("2-ramithks_cv.pdf", "hero_section");
    };

    return (
        <section ref={sectionRef} id="hero" className="relative min-h-screen flex items-center px-4 md:px-20 overflow-hidden bg-black pt-20">
            {/* Background Texture */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                
                {/* Left Content: Typography */}
                <div className="md:col-span-7 flex flex-col justify-center">
                    
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-px w-12 bg-primary"></div>
                            <span className="text-primary font-mono tracking-widest uppercase text-sm">
                                System Architect
                            </span>
                        </div>
                        
                        <h1 className="text-8xl md:text-[10rem] font-black leading-[0.85] tracking-tighter text-white mb-6">
                            RAMITH <br/>
                            <span className="text-white/20">K S.</span>
                        </h1>
                        
                        <div className="flex flex-col gap-2 mb-12 border-l-2 border-white/20 pl-6">
                            <div className="text-xl md:text-2xl font-light text-white/80">
                                Backend & Applied AI Engineer
                            </div>
                            <div className="text-sm font-mono text-white/40 tracking-wider">
                                BACKEND ENGINEERING // HIGH-PERFORMANCE APIs // DISTRIBUTED SYSTEMS
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <a 
                                href="#experience" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleExploreClick();
                                    document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-primary transition-colors cursor-pointer"
                            >
                                Explore Work 
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </a>
                            <a 
                                href="2-ramithks_cv.pdf" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={handleResumeDownload}
                                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                            >
                                <Download size={18} />
                                Resume
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Right Content: Architectural Image Cut */}
                <div className="md:col-span-5 relative h-[50vh] md:h-[80vh] w-full hidden md:block">
                     <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative h-full w-full"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                        <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-transparent z-10" />
                        
                        {/* Image Frame */}
                        <div className="h-full w-full relative overflow-hidden contrast-125 grayscale hover:grayscale-0 transition-all duration-700 ease-in-out block">
                            <img 
                                src={profileImg} 
                                alt="Ramith K S" 
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                        
                        {/* Decorative HUD Elements */}
                        <div className="absolute bottom-10 right-10 z-20 text-right">
                            <div className="text-4xl font-black text-white/10">01</div>
                            <div className="text-xs font-mono text-primary">PORTFOLIO // V9</div>
                        </div>
                    </motion.div>
                </div>

            </div>

            {/* Mobile Image (Visible only on small screens) */}
            <div className="md:hidden absolute top-0 right-0 w-1/2 h-1/2 opacity-20 z-0 pointer-events-none">
                 <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
                 <img src={profileImg} alt="bg" className="w-full h-full object-cover grayscale" />
            </div>
            
        </section>
    );
};
