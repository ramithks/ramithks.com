import { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { 
  Globe, 
  ArrowRight, 
  Play, 
  Heart, 
  MessageSquare, 
  Repeat, 
  Clock, 
  Music, 
  CheckCircle2, 
  ExternalLink,
  ThumbsUp,
  Layers,
  Quote
} from "lucide-react";
import { trackLinkClick } from "../../lib/analytics";

// Custom SVG Brand Icons
const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const YoutubeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export const PersonalHub = () => {
  const links = useQuery(api.links.get);
  const posts = useQuery(api.posts.get);
  const status = useQuery(api.hubStatus.get);

  const incrementLinkClicks = useMutation(api.links.incrementClicks);
  const incrementPostClicks = useMutation(api.posts.incrementClicks);
  
  const profilePhoto = status?.profilePhoto || "/dp.png";
  const profileName = status?.profileName || "Ramith K S";
  const profileSubtitle = status?.profileSubtitle || "Vlogger & Creator";
  const profileBio = status?.profileBio || "Building products, writing code, and riding motorbikes. Sharing daily life, startup insights, and travel vlogs.";
  
  // Real-time IST Clock
  const [istTime, setIstTime] = useState<string>("");
  
  // Infinite Scroll State
  const [visiblePostsCount, setVisiblePostsCount] = useState<number>(5);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force standard pointer cursor outside portfolio scroll context
    document.body.style.cursor = "default";
    const interactive = document.querySelectorAll("a, button");
    interactive.forEach((el) => {
      (el as HTMLElement).style.cursor = "pointer";
    });

    // Clock Interval
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      const formatter = new Intl.DateTimeFormat([], options);
      setIstTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Infinite Scroll Hook (for both desktop container scroll and mobile fallback)
  useEffect(() => {
    if (!posts) return;
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        if (scrollHeight - scrollTop - clientHeight < 150) {
          setVisiblePostsCount((prev) => Math.min(prev + 3, posts.length));
        }
      }
      
      const threshold = 150;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - threshold) {
        setVisiblePostsCount((prev) => Math.min(prev + 3, posts.length));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [posts]);

  if (links === undefined || posts === undefined || status === undefined) {
    return (
      <div className="bg-[#000000] text-[#FFFFFF] min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span className="text-xs text-[#8E8E93] tracking-widest uppercase">Loading Digital Hub...</span>
        </div>
      </div>
    );
  }

  const handleLinkClick = (link: any) => {
    incrementLinkClicks({ id: link._id }).catch(console.error);
    trackLinkClick(link.url, link.label, "social");
  };

  const handlePostClick = (post: any) => {
    incrementPostClicks({ id: post._id }).catch(console.error);
    trackLinkClick(post.url, post.title, "external");
  };



  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "instagram":
        return <InstagramIcon />;
      case "x":
        return <XIcon />;
      case "linkedin":
        return <LinkedInIcon />;
      case "facebook":
        return <FacebookIcon />;
      case "youtube":
        return <YoutubeIcon />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };



  // --- SUB-WIDGET RENDERERS FOR FLEXIBLE RESPONSIVE LAYOUTS ---
  
  const renderProfileCard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl relative overflow-hidden w-full"
    >
      {/* Glossy top border effect */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFFFFF]/10 to-transparent" />

      {/* Avatar squircle border */}
      <div className="relative group">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFFFFF]/10 to-transparent blur-md opacity-70" />
        <img 
          src={profilePhoto} 
          alt={profileName} 
          className="w-20 h-20 rounded-full border border-[#3A3A3C] object-cover bg-black relative z-10 p-0.5"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop";
          }}
        />
        {/* Active Pulse Dot (Apple Green for Online Indicator) */}
        <div className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-[#30D158] border-2 border-[#1C1C1E] z-20 flex items-center justify-center">
          <span className="absolute w-full h-full rounded-full bg-[#30D158] animate-ping opacity-75" />
        </div>
      </div>

      <h1 className="text-xl font-bold tracking-tight mt-4 text-[#FFFFFF]">
        {profileName}
      </h1>
      
      <p className="text-[#8E8E93] font-semibold text-[9px] tracking-widest uppercase mt-1">
        {profileSubtitle}
      </p>

      <p className="text-[#AEAEB2] text-xs mt-3 leading-relaxed font-normal max-w-xs">
        {profileBio}
      </p>

      {/* Explore Portfolio Link Button */}
      <motion.a
        href="/portfolio"
        whileHover={{ scale: 1.03, backgroundColor: "rgba(255, 255, 255, 0.08)", borderColor: "rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.98 }}
        className="mt-5 w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer"
      >
        <span>Explore Portfolio</span>
        <ArrowRight className="w-3.5 h-3.5 text-[#8E8E93]" />
      </motion.a>

      {/* High-Contrast Social Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 w-full border-t border-[#2C2C2E] pt-5">
        {links.map((link) => (
          <motion.a
            key={link._id}
            href={link.openInApp ? `/open?url=${encodeURIComponent(link.url)}` : link.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => handleLinkClick(link)}
            whileHover={{ scale: 1.06, backgroundColor: "#FFFFFF", color: "#000000" }}
            whileTap={{ scale: 0.98 }}
            className="p-2.5 rounded-full bg-[#2C2C2E] text-[#FFFFFF] border border-[#3A3A3C] transition-all duration-200"
            title={link.label}
          >
            {getSocialIcon(link.icon)}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );

  const renderStatusWidget = () => {
    if (!status) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-3.5 flex items-center gap-3 shadow-md w-full"
      >
        <div className="w-9 h-9 rounded-xl bg-black/40 border border-[#2C2C2E] flex items-center justify-center text-base shadow-inner">
          {status.statusEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
            <p className="text-[8px] font-bold text-[#8E8E93] uppercase tracking-wider">CURRENT ACTIVITY</p>
          </div>
          <p className="text-xs font-semibold text-white truncate mt-0.5">{status.statusText}</p>
        </div>
      </motion.div>
    );
  };

  const renderMusicWidget = () => {
    if (!status || !status.spotifyActive) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-lg relative overflow-hidden group w-full music-card-group hover:border-[#FA2356]/30 hover:shadow-[0_0_20px_rgba(250,35,86,0.04)] hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-300 ease-out"
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-1.5 text-[#FA2356]">
            <Music className="w-3.5 h-3.5 text-[#FA2356]" />
            <span className="text-[8px] font-bold tracking-wider uppercase">MUSIC</span>
          </div>
          {/* Simulated Audio Bars */}
          <div className="flex items-end gap-[2px] h-3.5">
            <span className="w-[2.5px] bg-gradient-to-t from-[#FA2356] to-[#FC3C62] audio-bar-anim delay-1" />
            <span className="w-[2.5px] bg-gradient-to-t from-[#FA2356] to-[#FC3C62] audio-bar-anim delay-2" />
            <span className="w-[2.5px] bg-gradient-to-t from-[#FA2356] to-[#FC3C62] audio-bar-anim" />
            <span className="w-[2.5px] bg-gradient-to-t from-[#FA2356] to-[#FC3C62] audio-bar-anim delay-3" />
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Vinyl Spinner */}
          <div className="relative w-12 h-12 shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#111112] border-2 border-[#2C2C2E] flex items-center justify-center vinyl-spinner">
              {/* Vinyl grooves */}
              <div className="w-8 h-8 rounded-full border border-dashed border-[#ffffff]/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#FA2356] border-2 border-black" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#FFFFFF] truncate group-hover:text-[#FA2356] transition-colors">
              {status.spotifyTrack}
            </p>
            <p className="text-[10px] text-[#8E8E93] truncate mt-0.5">
              {status.spotifyArtist}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderQuoteWidget = () => {
    if (!status || !status.quoteText || status.quoteText.trim() === "") return null;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-5 shadow-lg relative overflow-hidden group w-full hover:border-[#BF5AF2]/30 hover:shadow-[0_0_20px_rgba(191,90,242,0.04)] hover:-translate-y-0.5 transition-all duration-300 ease-out"
      >
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <Quote className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10">
          <Quote className="w-5 h-5 text-[#BF5AF2] mb-3" />
          <p className="text-sm md:text-base font-medium text-white/90 italic leading-relaxed">
            "{status.quoteText}"
          </p>
        </div>
      </motion.div>
    );
  };

  const renderClockWidget = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-lg w-full"
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[8px] font-bold text-[#8E8E93] uppercase tracking-wider">LOCAL TIME (IST)</span>
        <span className="text-[9px] text-[#8E8E93] font-mono">BENGALURU, IN</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-bold font-mono tracking-tight text-white">{istTime || "00:00:00 AM"}</p>
        <span className="text-[9px] text-[#FA2356] font-semibold bg-[#FA2356]/10 px-1.5 py-0.5 rounded border border-[#FA2356]/15">
          GMT +5:30
        </span>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#000000] text-[#FFFFFF] min-h-screen lg:h-screen lg:overflow-hidden relative overflow-x-hidden font-sans selection:bg-[#FFFFFF]/20 selection:text-[#000000] pb-24 lg:pb-6 pt-12 lg:pt-6 flex flex-col">
      {/* Dynamic inline styles for font override, audio bounce, and custom feed scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }

        @keyframes audioBounce {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .audio-bar-anim {
          animation: audioBounce 1.2s ease-in-out infinite;
          animation-play-state: paused;
        }
        .music-card-group:hover .audio-bar-anim {
          animation-play-state: running !important;
        }
        .delay-1 { animation-delay: 0.15s; }
        .delay-2 { animation-delay: 0.3s; }
        .delay-3 { animation-delay: 0.45s; }

        @keyframes vinylRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .vinyl-spinner {
          animation: vinylRotate 8s linear infinite;
          animation-play-state: paused;
        }
        .music-card-group:hover .vinyl-spinner {
          animation-play-state: running;
        }

        /* Sleek scrollbar for desktop posts column */
        .feed-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .feed-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .feed-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          transition: background 0.2s;
        }
        .feed-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.18);
        }
      `}} />

      <Helmet>
        <title>Ramith K S | Digital Hub</title>
        <meta name="description" content="Personal space, link hub, and latest updates by Ramith K S, Vlogger & Creator." />
        <meta property="og:title" content="Ramith K S | Digital Hub" />
        <meta property="og:description" content="Personal space, link hub, and latest updates." />
        <meta property="og:image" content="/dp.png" />
      </Helmet>

      {/* Subtle Apple Monochrome Gradients */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#FFFFFF]/3 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-[#FFFFFF]/2 blur-[120px] pointer-events-none" />

      {/* 3-Column Bento Grid Layout: Profile & Status on left (lg:col-span-4), Feed in middle (lg:col-span-5), Widgets on right (lg:col-span-3) */}
      <div className="max-w-6xl mx-auto px-6 mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start lg:items-stretch relative w-full lg:flex-1 lg:min-h-0">
        
        {/* LEFT COLUMN: Profile, Status, Music */}
        <div className="lg:col-span-4 space-y-5 lg:h-full lg:flex lg:flex-col lg:min-h-0 lg:overflow-y-auto feed-scrollbar px-1.5 py-1">
          {renderProfileCard()}
          {renderStatusWidget()}
          {renderMusicWidget()}
        </div>

        {/* MIDDLE COLUMN: Social Feed */}
        <div className="lg:col-span-5 space-y-5 w-full lg:h-full lg:flex lg:flex-col lg:min-h-0">
          
          {/* Social Stream Header */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center justify-between border-b border-[#2C2C2E] pb-2.5 shrink-0"
          >
            <h2 className="text-[9px] font-bold tracking-widest text-[#8E8E93] uppercase">
              SOCIAL STREAM & TIMELINE
            </h2>
            <span className="text-[9px] font-mono text-[#8E8E93] bg-[#1C1C1E] px-2 py-0.5 rounded border border-[#2C2C2E]">
              {posts.length} posts
            </span>
          </motion.div>

          <div 
            ref={containerRef}
            className="space-y-4 lg:flex-1 lg:overflow-y-auto pr-1 lg:pr-2 feed-scrollbar"
          >
            {/* Vertical Chronological Timeline Feed */}
            <div className="relative pl-10 md:pl-12 space-y-6">
              {/* Timeline Axis Line */}
              <div className="absolute left-[15px] md:left-[20px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[#2C2C2E] via-[#2C2C2E] to-transparent pointer-events-none" />

              {posts.slice(0, visiblePostsCount).map((post, index) => {
                const urlToGo = post.openInApp ? `/open?url=${encodeURIComponent(post.url)}` : post.url;
                
                // Set platform-specific color for the dot and glow
                const getPlatformColor = (type: string) => {
                  switch (type) {
                    case 'youtube': return '#FF453A';     // Red
                    case 'instagram': return '#FF2D55';   // Pink
                    case 'twitter': return '#FFFFFF';     // White
                    case 'linkedin': return '#0A84FF';    // Blue
                    default: return '#8E8E93';            // Gray
                  }
                };

                const dotColor = getPlatformColor(post.type);

                // We wrap each post in a relative container to align the dot
                return (
                  <div key={post._id} className="relative group">
                    {/* Timeline Dot Indicator */}
                    <div 
                      className="absolute left-[-29px] md:left-[-33px] top-[22px] w-2.5 h-2.5 rounded-full border border-black z-10 transition-all duration-300 group-hover:scale-150"
                      style={{
                        backgroundColor: dotColor,
                        boxShadow: `0 0 10px ${dotColor}`,
                      }}
                    />

                    {/* RENDER SPECIFIC PLATFORM CARD */}
                    {(() => {
                      switch (post.type) {
                        
                        // 1. YOUTUBE VIDEO CARD
                        case 'youtube':
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + (index * 0.05), duration: 0.3 }}
                              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl relative overflow-hidden group/card hover:border-[#FF453A]/30 hover:shadow-[0_0_20px_rgba(255,69,58,0.04)] hover:scale-[1.01] transition-all duration-300 ease-out w-full"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                {post.thumbnail && (
                                  <a 
                                    href={urlToGo} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    onClick={() => handlePostClick(post)} 
                                    className="block relative w-full sm:w-56 aspect-video shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black group-hover/card:border-[#FF453A]/20 transition-colors"
                                  >
                                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover/card:scale-[1.02] transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover/card:bg-black/20 transition-colors">
                                      <div className="w-10 h-10 rounded-full bg-[#FF453A] flex items-center justify-center text-white shadow-lg group-hover/card:scale-105 transition-transform duration-200">
                                        <Play className="w-4 h-4 fill-white ml-0.5" />
                                      </div>
                                    </div>
                                    {post.duration && (
                                      <span className="absolute bottom-2 right-2 text-[9px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded border border-white/10 text-white">
                                        {post.duration}
                                      </span>
                                    )}
                                  </a>
                                )}

                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                  <div>
                                    <div className="flex items-center justify-between mb-2 text-xs">
                                      <span className="text-[9px] font-bold text-[#FF453A] bg-[#FF453A]/10 px-2 py-0.5 rounded border border-[#FF453A]/15 flex items-center gap-1">
                                        <YoutubeIcon />
                                        YouTube Video
                                      </span>
                                      <span className="text-[9px] text-[#8E8E93] font-mono">{post.date}</span>
                                    </div>

                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="block group/title">
                                      <h3 className="text-sm font-bold text-white group-hover/title:text-[#FF453A] transition-colors leading-snug line-clamp-2">
                                        {post.title}
                                      </h3>
                                    </a>
                                    <p className="text-xs text-[#AEAEB2] mt-1.5 leading-relaxed line-clamp-2">{post.description}</p>
                                  </div>

                                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#2C2C2E] text-xs">
                                    <span className="text-[#8E8E93] font-mono text-[10px]">{post.views ? `${post.views.toLocaleString()} views` : 'Live'}</span>
                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="text-[#FF453A] font-semibold text-[11px] flex items-center gap-1 hover:underline">
                                      <span>Watch Video</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );

                        // 2. INSTAGRAM POST CARD
                        case 'instagram':
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + (index * 0.05), duration: 0.3 }}
                              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl relative overflow-hidden group/card hover:border-[#FF2D55]/30 hover:shadow-[0_0_20px_rgba(255,45,85,0.04)] hover:scale-[1.01] transition-all duration-300 ease-out w-full"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                {post.thumbnail && (
                                  <a 
                                    href={urlToGo} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    onClick={() => handlePostClick(post)} 
                                    className="block relative w-full sm:w-44 aspect-square shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black group-hover/card:border-[#FF2D55]/20 transition-colors"
                                  >
                                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/10 group-hover/card:bg-transparent transition-colors" />
                                    <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover/card:opacity-100 transition-opacity">
                                      <Heart className="w-3.5 h-3.5 fill-[#FF2D55] stroke-[#FF2D55]" />
                                    </div>
                                  </a>
                                )}

                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                  <div>
                                    <div className="flex items-center justify-between mb-2 text-xs">
                                      <span className="text-[9px] font-bold text-[#FF2D55] bg-[#FF2D55]/10 px-2 py-0.5 rounded border border-[#FF2D55]/15 flex items-center gap-1">
                                        <InstagramIcon />
                                        Instagram
                                      </span>
                                      <span className="text-[9px] text-[#8E8E93] font-mono">{post.date}</span>
                                    </div>

                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="block group/title">
                                      <h3 className="text-sm font-bold text-white group-hover/title:text-[#FF2D55] transition-colors leading-snug line-clamp-2">
                                        {post.title}
                                      </h3>
                                    </a>
                                    <p className="text-xs text-[#AEAEB2] mt-1.5 leading-relaxed line-clamp-2">{post.description}</p>
                                  </div>

                                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#2C2C2E] text-xs">
                                    <div className="flex items-center gap-3 text-[#8E8E93] text-[10px]">
                                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 fill-[#FF2D55]/20 stroke-[#8E8E93]" /> {post.likes || 0}</span>
                                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments || 0}</span>
                                    </div>
                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="text-[#FF2D55] font-semibold text-[11px] flex items-center gap-1 hover:underline">
                                      <span>View Photo</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );

                        // 3. TWITTER/X TWEET CARD
                        case 'twitter':
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + (index * 0.05), duration: 0.3 }}
                              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl relative overflow-hidden group/card hover:border-white/15 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:scale-[1.01] transition-all duration-300 ease-out w-full"
                            >
                              <div className="flex flex-col justify-between h-full">
                                <div>
                                  <div className="flex items-center justify-between mb-3">
                                    {/* Profile header */}
                                    <div className="flex items-center gap-2">
                                      <img src={profilePhoto} alt={profileName} className="w-8 h-8 rounded-full object-cover border border-[#2C2C2E]" />
                                      <div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs font-bold text-white leading-none">{profileName}</span>
                                          <CheckCircle2 className="w-3 h-3 fill-[#0A84FF] stroke-black" />
                                        </div>
                                        <span className="text-[9px] text-[#8E8E93] font-mono leading-none">@{post.author || 'ramithks'}</span>
                                      </div>
                                    </div>
                                    <span className="text-[9px] text-[#8E8E93] font-mono">{post.date}</span>
                                  </div>

                                  <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="block">
                                    <p className="text-xs font-semibold text-white leading-relaxed whitespace-pre-line group-hover/card:text-[#0A84FF] transition-colors line-clamp-4">
                                      {post.description}
                                    </p>
                                  </a>
                                </div>

                                <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#2C2C2E] text-xs text-[#8E8E93]">
                                  <div className="flex items-center gap-3.5 text-[10px]">
                                    <span className="flex items-center gap-1 hover:text-[#0A84FF] transition-colors"><MessageSquare className="w-3 h-3" /> {post.comments || 0}</span>
                                    <span className="flex items-center gap-1 hover:text-[#30D158] transition-colors"><Repeat className="w-3 h-3" /> {post.reposts || 0}</span>
                                    <span className="flex items-center gap-1 hover:text-[#FF2D55] transition-colors"><Heart className="w-3 h-3" /> {post.likes || 0}</span>
                                  </div>
                                  <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="text-[#FFFFFF] font-semibold text-[11px] flex items-center gap-1 hover:underline">
                                    <span>View on X</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </motion.div>
                          );

                        // 4. LINKEDIN POST CARD
                        case 'linkedin':
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + (index * 0.05), duration: 0.3 }}
                              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl relative overflow-hidden group/card hover:border-[#0A84FF]/30 hover:shadow-[0_0_20px_rgba(10,132,255,0.04)] hover:scale-[1.01] transition-all duration-300 ease-out w-full"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                {post.thumbnail && (
                                  <a 
                                    href={urlToGo} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    onClick={() => handlePostClick(post)} 
                                    className="block relative w-full sm:w-44 aspect-video shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black group-hover/card:border-[#0A84FF]/20 transition-colors"
                                  >
                                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                                  </a>
                                )}

                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                  <div>
                                    <div className="flex items-center justify-between mb-2.5">
                                      <div className="flex items-center gap-2">
                                        <img src={profilePhoto} alt={profileName} className="w-8 h-8 rounded-full object-cover border border-[#2C2C2E]" />
                                        <div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-xs font-bold text-white">{post.author || profileName}</span>
                                            <span className="text-[9px] text-[#8E8E93]">• 1st</span>
                                          </div>
                                          <span className="text-[8px] text-[#8E8E93] tracking-wide block uppercase font-medium leading-none mt-0.5">Content Creator & Traveler</span>
                                        </div>
                                      </div>
                                      <span className="text-[9px] text-[#8E8E93] font-mono">{post.date}</span>
                                    </div>

                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="block group/title">
                                      <h3 className="text-sm font-bold text-white group-hover/title:text-[#0A84FF] transition-colors leading-snug line-clamp-2">
                                        {post.title}
                                      </h3>
                                    </a>
                                    <p className="text-xs text-[#AEAEB2] mt-1.5 leading-relaxed line-clamp-2">{post.description}</p>
                                  </div>

                                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#2C2C2E] text-xs">
                                    <span className="text-[#8E8E93] flex items-center gap-1 text-[10px]">
                                      <ThumbsUp className="w-3 h-3 text-[#0A84FF] fill-[#0A84FF]/20" /> {post.likes || 0} reactions
                                    </span>
                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="text-[#0A84FF] font-semibold text-[11px] flex items-center gap-1 hover:underline">
                                      <span>Read Post</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );

                        // 5. STANDARD EDITORIAL BLOG CARD
                        case 'blog':
                        default:
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + (index * 0.05), duration: 0.3 }}
                              className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl p-4 shadow-xl relative overflow-hidden group/card hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:scale-[1.01] transition-all duration-300 ease-out w-full"
                            >
                              <div className="flex flex-col sm:flex-row gap-4">
                                {post.thumbnail && (
                                  <a 
                                    href={urlToGo} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    onClick={() => handlePostClick(post)} 
                                    className="block relative w-full sm:w-44 aspect-video shrink-0 rounded-xl overflow-hidden border border-[#2C2C2E] bg-black group-hover/card:border-white/20 transition-colors"
                                  >
                                    <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover/card:scale-[1.02] transition-transform duration-300" />
                                  </a>
                                )}

                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                  <div>
                                    <div className="flex items-center justify-between mb-2 text-xs">
                                      <span className="text-[9px] font-bold text-[#8E8E93] bg-[#2C2C2E] px-2.5 py-0.5 rounded border border-[#3A3A3C] flex items-center gap-1">
                                        <Layers className="w-3 h-3" />
                                        {post.tag}
                                      </span>
                                      <span className="text-[9px] text-[#8E8E93] font-mono">{post.date}</span>
                                    </div>

                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="block group/title">
                                      <h3 className="text-sm font-bold text-white group-hover/title:text-[#FFFFFF] group-hover/title:underline transition-all leading-snug line-clamp-2">
                                        {post.title}
                                      </h3>
                                    </a>
                                    <p className="text-xs text-[#AEAEB2] mt-1.5 leading-relaxed line-clamp-2">{post.description}</p>
                                  </div>

                                  <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-[#2C2C2E] text-xs">
                                    <span className="text-[#8E8E93] flex items-center gap-1 text-[10px]">
                                      <Clock className="w-3 h-3" /> 5 min read
                                    </span>
                                    <a href={urlToGo} target="_blank" rel="noreferrer" onClick={() => handlePostClick(post)} className="text-[#FFFFFF] font-semibold text-[11px] flex items-center gap-1 group-hover:underline">
                                      <span>Read Thought</span>
                                      <ArrowRight className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                      }
                    })()}
                  </div>
                );
              })}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-20 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl text-[#8E8E93] text-xs shadow-inner">
                No articles or stream updates loaded yet. Create updates in /admin.
              </div>
            )}
            
            {visiblePostsCount < posts.length && (
              <div className="text-center py-4">
                <span className="text-[10px] text-[#8E8E93] animate-pulse">Loading more updates...</span>
              </div>
            )}

            {/* Desktop-only footer inside scroll container */}
            <footer className="hidden lg:block pt-10 pb-4 text-center text-xs text-[#8E8E93]/40 border-t border-[#1C1C1E]/60 mt-8 shrink-0">
              <p>© {new Date().getFullYear()} Ramith K S. All rights reserved.</p>
            </footer>
          </div>
        </div>

        {/* RIGHT COLUMN: Quote & Local Clock */}
        <div className="lg:col-span-3 space-y-5 lg:h-full lg:flex lg:flex-col lg:min-h-0 lg:overflow-y-auto feed-scrollbar px-1.5 py-1">
          {renderQuoteWidget()}
          {renderClockWidget()}
        </div>

      </div>

      {/* Mobile/Tablet fallback footer */}
      <footer className="lg:hidden max-w-5xl mx-auto mt-16 text-center text-xs text-[#8E8E93]/40 border-t border-[#1C1C1E] pt-8 px-6 pb-12">
        <p>© {new Date().getFullYear()} Ramith K S. All rights reserved.</p>
      </footer>
    </div>
  );
};
