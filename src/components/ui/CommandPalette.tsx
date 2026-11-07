import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Terminal, Zap, Bug, Cpu, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { TerminalMode } from "./TerminalMode";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  // Use activeMode to silence lint
  useEffect(() => {
      if (activeMode) {
          console.log(`[GOD MODE] Active: ${activeMode}`);
      }
  }, [activeMode]);

  // Toggle open state on Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // --- MODES ---

  // 1. Debug Mode: Wireframe
  const toggleDebug = () => {
    document.body.classList.toggle("debug-screens");
    if (document.body.classList.contains("debug-screens")) {
        const style = document.createElement('style');
        style.id = 'debug-mode';
        style.innerHTML = `* { outline: 1px solid #0f0 !important; }`;
        document.head.appendChild(style);
        setActiveMode('debug');
    } else {
        document.getElementById('debug-mode')?.remove();
        setActiveMode(null);
    }
    setOpen(false);
  };

  // 2. Matrix Mode: Cyberpunk
  const toggleMatrix = () => {
      const id = 'matrix-mode';
      if (document.getElementById(id)) {
          document.getElementById(id)?.remove();
          setActiveMode(null);
      } else {
        const style = document.createElement('style');
        style.id = id;
        style.innerHTML = `
            html { filter: invert(1) hue-rotate(180deg) !important; }
            img { filter: invert(1) hue-rotate(180deg) !important; }
        `;
        document.head.appendChild(style);
        setActiveMode('matrix');
      }
      setOpen(false);
  };
  
  // 3. Gravity Mode: Chaos
  const triggerGravity = () => {
    // Exclude the system root button by ID
    const elements = document.querySelectorAll('section, h1, h2, h3, p, img, a, button:not(#system-root-trigger)');
    elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const randomRotation = Math.random() * 60 - 30;
        const randomX = Math.random() * 100 - 50;
        const randomY = Math.random() * 100 + 100;
        
        htmlEl.style.transition = 'transform 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        htmlEl.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotation}deg)`;
        htmlEl.style.pointerEvents = 'none';
    });
    setActiveMode('gravity');
    setOpen(false);
  };

  // 4. CRT Mode: Retro Monitor
  const toggleCRT = () => {
      const id = 'crt-mode';
      if (document.getElementById(id)) {
          document.getElementById(id)?.remove();
          setActiveMode(null);
      } else {
          const style = document.createElement('style');
          style.id = id;
          style.innerHTML = `
            html::before {
                content: " ";
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
                z-index: 9998;
                background-size: 100% 2px, 3px 100%;
                pointer-events: none;
            }
            body {
                text-shadow: 2px 0px 1px rgba(255,0,0,0.5), -2px 0px 1px rgba(0,0,255,0.5);
            }
          `;
          document.head.appendChild(style);
          setActiveMode('crt');
      }
      setOpen(false);
  };

  // 5. Void Mode: Minimalism (Fixed Visibility)
  const toggleVoid = () => {
      const id = 'void-mode';
      if (document.getElementById(id)) {
          document.getElementById(id)?.remove();
          setActiveMode(null);
      } else {
          const style = document.createElement('style');
          style.id = id;
          style.innerHTML = `
            header, main, footer, .custom-cursor { opacity: 0 !important; pointer-events: none !important; transition: opacity 2s ease-in-out; }
            body { background-color: #000 !important; overflow: hidden !important; }
            /* Keep Command Palette Button visible */
            #system-root-trigger { opacity: 1 !important; pointer-events: auto !important; z-index: 100000 !important; }
            
            /* Blinking cursor for void */
            body::after {
                content: "_";
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 2rem;
                font-family: monospace;
                animation: blink 1s infinite;
                z-index: 100000;
                pointer-events: none;
            }
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
          `;
          document.head.appendChild(style);
          setActiveMode('void');
      }
      setOpen(false);
  };

  // 6. Terminal Mode
  const toggleTerminal = () => {
    setActiveMode('terminal');
    setOpen(false);
  }

  const resetAll = () => {
      document.getElementById('debug-mode')?.remove();
      document.getElementById('matrix-mode')?.remove();
      document.getElementById('crt-mode')?.remove();
      document.getElementById('void-mode')?.remove();
      
      const elements = document.querySelectorAll('*');
      elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.transform = '';
          htmlEl.style.pointerEvents = '';
      });
      setActiveMode(null);
      setOpen(false);
  };

  return (
    <>
      {/* Terminal Mode Overlay */}
      <AnimatePresence>
        {activeMode === 'terminal' && (
            <TerminalMode onExit={() => setActiveMode(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
              
              {/* Backdrop */}
              <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Dialog */}
              <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
              >
              <Command className="w-full h-full bg-transparent flex flex-col">
                  <div className="flex items-center border-b border-white/10 px-4 py-3 shrink-0">
                      <Terminal className="w-5 h-5 text-white/40 mr-3" />
                      <Command.Input 
                          placeholder="Type a command..." 
                          className="w-full bg-transparent text-white placeholder:text-white/20 outline-none font-mono text-sm"
                      />
                      <div className="text-[10px] text-white/20 font-mono border border-white/10 px-2 py-1 rounded">ESC</div>
                  </div>

                  <Command.List className="p-2 overflow-y-auto flex-1">
                      <Command.Empty className="py-6 text-center text-white/30 font-mono text-sm">
                          Unknown command.
                      </Command.Empty>

                      <Command.Group heading="Visuals" className="text-xs text-white/30 font-mono mb-2 px-2 uppercase tracking-widest">
                          
                          <Command.Item 
                              onSelect={toggleCRT}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                          >
                              <div className="p-2 rounded bg-purple-500/10 text-purple-500"><Terminal size={16} /></div>
                              <div className="flex flex-col">
                                  <span className="font-bold">CRT Monitor</span>
                                  <span className="text-xs text-white/40">Enable retro scanlines & aberration</span>
                              </div>
                          </Command.Item>

                          <Command.Item 
                                onSelect={toggleTerminal}
                                className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                            >
                                <div className="p-2 rounded bg-yellow-500/10 text-yellow-500"><Terminal size={16} /></div>
                                <div className="flex flex-col">
                                    <span className="font-bold">Terminal Mode</span>
                                    <span className="text-xs text-white/40">Interactive CLI Environment</span>
                                </div>
                            </Command.Item>

                          <Command.Item 
                              onSelect={toggleDebug}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                          >
                              <div className="p-2 rounded bg-green-500/10 text-green-500"><Bug size={16} /></div>
                              <div className="flex flex-col">
                                  <span className="font-bold">Debug Mode</span>
                                  <span className="text-xs text-white/40">Toggle wireframe visuals</span>
                              </div>
                          </Command.Item>

                          <Command.Item 
                              onSelect={toggleMatrix}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                          >
                              <div className="p-2 rounded bg-blue-500/10 text-blue-500"><Cpu size={16} /></div>
                              <div className="flex flex-col">
                                  <span className="font-bold">Invert Matrix</span>
                                  <span className="text-xs text-white/40">Toggle high-contrast simulation</span>
                              </div>
                          </Command.Item>
                          
                      </Command.Group>

                      <Command.Separator className="h-px bg-white/10 my-2" />
                      
                      <Command.Group heading="Reality Modifiers" className="text-xs text-white/30 font-mono mb-2 px-2 uppercase tracking-widest">
                          
                          <Command.Item 
                              onSelect={triggerGravity}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                          >
                              <div className="p-2 rounded bg-red-500/10 text-red-500"><Zap size={16} /></div>
                              <div className="flex flex-col">
                                  <span className="font-bold">System Failure</span>
                                  <span className="text-xs text-white/40">Initiate gravitational collapse</span>
                              </div>
                          </Command.Item>

                           <Command.Item 
                              onSelect={toggleVoid}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                          >
                              <div className="p-2 rounded bg-gray-500/10 text-gray-500"><Zap size={16} /></div>
                              <div className="flex flex-col">
                                  <span className="font-bold">Enter Void</span>
                                  <span className="text-xs text-white/40">Delete reality</span>
                              </div>
                          </Command.Item>

                          <Command.Item 
                              onSelect={resetAll}
                              className="flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/5 hover:text-white cursor-pointer transition-colors aria-selected:bg-white/10 aria-selected:text-white"
                          >
                               <div className="p-2 rounded bg-white/10 text-white"><Trash2 size={16} /></div>
                               <span>Reset Simulation</span>
                          </Command.Item>
                      </Command.Group>

                  </Command.List>

                  <div className="border-t border-white/10 px-4 py-2 flex justify-between items-center bg-black/40 shrink-0">
                      <span className="text-[10px] text-white/30 font-mono">RAMITH_OS // KERNEL_ACCESS</span>
                      <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] text-green-500 font-mono">ONLINE</span>
                      </div>
                  </div>
              </Command>

              </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Visible Trigger Button */}
      <button 
          id="system-root-trigger"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open System Root"
          className="relative flex items-center justify-center mx-auto mb-6 sm:fixed sm:bottom-10 sm:right-10 z-[50] p-4 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 group"
      >
          <Terminal size={20} />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap ml-0 group-hover:ml-2">
              System Root
          </span>
      </button>
    </>
  );
};
