import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Github, Linkedin } from "lucide-react";
import { trackNavigationClick, trackLinkClick, trackButtonClick } from "../../lib/analytics";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const navLinks = [
    { name: "About", href: "#about", id: "about" },
    { name: "Skills", href: "#skills", id: "skills" },
    { name: "Experience", href: "#experience", id: "experience" },
    { name: "Work", href: "#work", id: "work" },
    { name: "Contact", href: "#contact", id: "contact" },
    { name: "Social Hub 🌊", href: "/", id: "social" },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-300 pointer-events-none px-6",
        scrolled ? "py-4" : "py-6"
      )}
    >
      <div 
        className={cn(
          "max-w-7xl mx-auto rounded-full border border-transparent transition-all duration-300 pointer-events-auto",
          scrolled && "bg-black/50 border-white/10 backdrop-blur-md shadow-lg pr-4 py-1.5 pl-4 sm:pl-6"
        )}
      >
        <div className="flex items-center justify-between">
            
            {/* 1. Identity Zone */}
            <a href="/" className="hidden lg:flex items-center gap-3 group/logo cursor-pointer">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden group-hover/logo:border-white/30 transition-colors">
                    <span className="text-[10px] font-black font-mono text-primary group-hover/logo:scale-110 transition-transform">RKS</span>
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-sm tracking-tight text-white leading-none mb-1">RAMITH K S</span>
                    <span className="text-[9px] text-white/40 tracking-[0.2em] uppercase leading-none">Senior Engineer</span>
                </div>
            </a>

            {/* 2. Navigation Zone (Center) - Responsive */}
            <nav className="flex items-center gap-0.5 sm:gap-1 p-1 bg-white/5 rounded-full border border-white/5 mx-auto lg:mx-0 overflow-x-auto no-scrollbar max-w-[90vw] sm:max-w-none">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setActiveTab(link.id);
                    trackNavigationClick(link.id);
                  }}
                  className={cn(
                    "relative px-2.5 sm:px-3 md:px-4 py-1.5 text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-medium transition-colors rounded-full shrink-0",
                    activeTab === link.id ? "text-black" : "text-white/70 hover:text-white"
                  )}
                >
                  {activeTab === link.id && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </a>
              ))}
            </nav>

            {/* 3. Connect Zone (Right) - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-3">
                <a 
                    href="https://github.com/ramithks" 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => trackLinkClick("https://github.com/ramithks", "GitHub", "social")}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <Github size={18} />
                </a>
                <a 
                    href="https://linkedin.com/in/ramith-k-s" 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={() => trackLinkClick("https://linkedin.com/in/ramith-k-s", "LinkedIn", "social")}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <Linkedin size={18} />
                </a>
                <a 
                    href="#contact"
                    onClick={() => {
                        trackNavigationClick("contact");
                        trackButtonClick("Let's Talk", "navbar");
                    }}
                    className="ml-2 px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-200 transition-colors"
                >
                    LET'S TALK
                </a>
            </div>
        </div>
      </div>
    </motion.header>
  );
};
