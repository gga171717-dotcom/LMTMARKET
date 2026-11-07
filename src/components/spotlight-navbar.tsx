"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, FolderGit2, Library, Users, Settings } from "lucide-react";

interface NavBarProps {
  setActivePage?: (page: string) => void;
  activePage?: string;
}

export const NavBar = ({ setActivePage, activePage = "home" }: NavBarProps) => {
  const [active, setActive] = useState(activePage);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const navItems = [
    { name: "Overview", page: "home", icon: LayoutDashboard },
    { name: "Projects", page: "work", icon: FolderGit2 },
    { name: "Library", page: "store", icon: Library },
    { name: "Team", page: "about", icon: Users },
    { name: "Settings", page: "contact", icon: Settings },
  ];

  const handlePageChange = (page: string) => {
    setActive(page);
    if (setActivePage) setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Canvas Spotlight Beam & Dust Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let T = 0;

    const DUST = Array.from({ length: 30 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.4 + Math.random() * 1.2,
      v: 0.03 + Math.random() * 0.07,
      p: Math.random() * 6,
    }));

    const render = () => {
      T += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = "lighter";

      const W = canvas.width;
      const H = canvas.height;

      // Draw Cone Body Gradient
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, "rgba(220,255,246,0)");
      gr.addColorStop(0.5, "rgba(220,255,246,0.06)");
      gr.addColorStop(1, "rgba(240,255,252,0.3)");

      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 10, 0);
      ctx.lineTo(W / 2 + 10, 0);
      ctx.lineTo(W / 2 + 70, H);
      ctx.lineTo(W / 2 - 70, H);
      ctx.closePath();
      ctx.fill();

      // Dust Motes
      ctx.globalCompositeOperation = "source-over";
      DUST.forEach((d) => {
        const yy = (((d.y - T * d.v) % 1) + 1) % 1;
        ctx.fillStyle = `rgba(235,255,250,${0.35 * yy})`;
        ctx.beginPath();
        ctx.arc(W / 2 + (d.x - 0.5) * 90, yy * H, d.s, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center font-mono">
      {/* Spotlight Beam Canvas positioned right above the navbar */}
      <div className="pointer-events-none absolute -top-[130px] w-[320px] h-[150px] mix-blend-screen blur-[4px]">
        <canvas ref={canvasRef} width={320} height={150} className="w-full h-full" />
      </div>

      {/* Frosted Glass Navbar with Mint & Lilac Rim */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex items-center justify-between gap-4 px-4 py-2 rounded-full backdrop-blur-2xl bg-black/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10"
        style={{
          borderImage:
            "linear-gradient(100deg, rgba(150,255,222,0.4), rgba(255,255,255,0.1) 18%, rgba(255,255,255,0.04) 50%, rgba(180,170,255,0.3)) 1",
        }}
      >
        {/* Logo ខាងឆ្វេង */}
        <div
          className="flex items-center gap-2 cursor-pointer px-2"
          onClick={() => handlePageChange("home")}
        >
          <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-lg rotate-45 shadow-[0_0_10px_rgba(0,191,255,0.5)]" />
          <span className="text-xl font-bold tracking-tight font-display hidden sm:inline">
            <span className="text-cyan-400">LMT</span>
            <span className="text-white">STORE</span>
          </span>
        </div>

        {/* Desktop Nav Links with Spotlight Spring Pills */}
        <div className="flex items-center gap-1.5 relative">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = active === item.page;
            const isHovered = hoveredTab === item.page;

            return (
              <button
                key={item.name}
                onClick={() => handlePageChange(item.page)}
                onMouseEnter={() => setHoveredTab(item.page)}
                onMouseLeave={() => setHoveredTab(null)}
                className={`relative px-4 py-2.5 rounded-full text-xs font-medium transition-colors duration-300 flex items-center gap-2 cursor-pointer ${
                  isActive ? "text-[#f6f7f6]" : "text-gray-400 hover:text-white"
                }`}
              >
                {/* Active Raised Glass Pill with Mint Glow */}
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 rounded-full bg-white/[0.13] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_-8px_rgba(0,0,0,0.9),0_0_24px_-6px_rgba(190,255,236,0.3)] border border-white/30 backdrop-blur-md"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="absolute top-0 left-[18%] right-[18%] h-[2px] bg-emerald-200/90 blur-[0.5px] rounded-full" />
                  </motion.div>
                )}

                {/* Hover Faint Pill */}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="hoverPill"
                    className="absolute inset-0 rounded-full bg-white/[0.04] border border-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                <IconComponent
                  className={`w-4 h-4 relative z-10 transition-colors ${
                    isActive ? "text-[#c4ffe8] drop-shadow-[0_0_8px_rgba(150,255,220,0.8)]" : "text-gray-400"
                  }`}
                />
                <span className="relative z-10 hidden md:inline">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dashboard / CTA Button ខាងស្តាំ */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative overflow-hidden rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300 backdrop-blur-xl transition-all duration-300 hover:bg-cyan-400/20 hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,191,255,0.3)] cursor-pointer"
          onClick={() => handlePageChange("contact")}
        >
          Dashboard
        </motion.button>
      </motion.nav>
    </div>
  );
};