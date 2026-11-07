import { Reveal } from "../components/ui/Reveal";
import { ArrowUpRight } from "lucide-react";
import { useSectionView } from "../hooks/useSectionView";
import { trackEmailClick, trackLinkClick } from "../lib/analytics";

export const Contact = () => {
  const sectionRef = useSectionView({
    sectionName: "Contact",
    sectionId: "contact",
  });

  const handleEmailClick = () => {
    trackEmailClick("ramithgowdakundoor123@gmail.com", "contact_section");
  };

  const handleSocialLinkClick = (platform: string, url: string) => {
    trackLinkClick(url, platform, "social");
  };

  return (
    <section ref={sectionRef} id="contact" className="min-h-[80vh] bg-black text-white flex flex-col justify-between pt-32 pb-12 px-4 md:px-20 relative overflow-hidden">
      
      {/* Background Noise */}
       <div className="absolute inset-0 bg-[noise] opacity-5 pointer-events-none" />

       <Reveal width="100%">
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex flex-col gap-6 mb-20">
                    <span className="text-primary font-mono tracking-widest uppercase text-sm">
                        Available for Opportunities
                    </span>
                    <h2 className="text-[12vw] leading-[0.85] font-black tracking-tighter uppercase text-white mix-blend-exclusion">
                        GET IN<br/>TOUCH
                    </h2>
                </div>

                <div className="group relative inline-block max-w-full">
                    <a 
                        href="mailto:ramithgowdakundoor123@gmail.com" 
                        onClick={handleEmailClick}
                        className="relative z-10 inline-block max-w-full break-all text-base sm:text-2xl md:text-5xl font-bold text-white/60 group-hover:text-white transition-colors duration-300 border-b border-white/20 pb-2 group-hover:border-white"
                    >
                        ramithgowdakundoor123@gmail.com
                    </a>
                </div>
            </div>
       </Reveal>

       <footer className="w-full max-w-7xl mx-auto border-t border-white/10 pt-10 mt-auto grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="flex flex-col gap-4">
                <span className="text-xs text-white/30 uppercase tracking-widest">Socials</span>
                <div className="flex flex-col gap-2">
                    <a 
                        href="https://linkedin.com/in/ramith-k-s" 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={() => handleSocialLinkClick("LinkedIn", "https://linkedin.com/in/ramith-k-s")}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        LinkedIn <ArrowUpRight size={14} />
                    </a>
                    <a 
                        href="https://github.com/ramithks" 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={() => handleSocialLinkClick("GitHub", "https://github.com/ramithks")}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        GitHub <ArrowUpRight size={14} />
                    </a>
                </div>
            </div>
            
            <div className="flex flex-col gap-4">
                 <span className="text-xs text-white/30 uppercase tracking-widest">Location</span>
                 <span className="text-white/60">Bengaluru, India</span>
            </div>

            <div className="flex flex-col gap-4">
                 <span className="text-xs text-white/30 uppercase tracking-widest">Time</span>
                 <span className="text-white/60">{new Date().getFullYear()} © Edition</span>
            </div>

            <div className="flex flex-col gap-4 justify-end">
                 <span className="text-[10rem] leading-none font-black text-white/5 absolute bottom-[-2rem] right-0 pointer-events-none select-none">
                     R9
                 </span>
            </div>
       </footer>

    </section>
  );
};
