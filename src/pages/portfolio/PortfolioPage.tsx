import { Hero } from "../../sections/Hero";
import { About } from "../../sections/About";
import { Skills } from "../../sections/Skills";
import { Experience } from "../../sections/Experience";
import { Projects } from "../../sections/Projects";
import { Contact } from "../../sections/Contact";

import { SmoothScroll } from "../../components/ui/SmoothScroll";
import { CustomCursor } from "../../components/ui/CustomCursor";
import { Navbar } from "../../components/layout/Navbar";
import { CommandPalette } from "../../components/ui/CommandPalette";
import { Helmet } from "react-helmet-async";

export const PortfolioPage = () => {
  return (
    <div className="bg-black min-h-screen text-white cursor-none selection:bg-primary/30">
      <Helmet>
        <title>Ramith K S | Senior Backend Engineer</title>
        <meta name="description" content="Portfolio of Ramith K S, a Senior Backend Engineer specializing in scalable distributed systems." />
        <meta property="og:title" content="Ramith K S | Senior Backend Engineer" />
        <meta property="og:description" content="Building scalable systems and high-performance APIs." />
        <meta property="og:image" content="/profile_alt.jpg" />
      </Helmet>
      
      <Navbar />
      <CommandPalette />
      <CustomCursor />
      
      <SmoothScroll>
        <main className="bg-background min-h-screen text-text-primary selection:bg-primary/30">
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Contact />
        </main>
      </SmoothScroll>
    </div>
  );
};
