"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import Lenis from "lenis";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

// ========== CINEMATIC EASING ==========
const cinematicEase = [0.16, 1, 0.3, 1];

// ========== SMOOTH SCROLL ==========
function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
  return <>{children}</>;
}

// ========== ANIMATED GLOW BORDER ==========
const GlowBorder = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-75 blur-md animate-glow-spin group-hover:opacity-100 transition duration-500" />
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-100 blur-md animate-glow-spin-reverse group-hover:blur-xl transition duration-500" style={{ filter: "blur(12px)" }} />
      <div className="relative rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden z-10">
        {children}
      </div>
      <style jsx>{`
        @keyframes glow-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes glow-spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-glow-spin {
          animation: glow-spin 4s linear infinite;
        }
        .animate-glow-spin-reverse {
          animation: glow-spin-reverse 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

// ========== 3D TEXT COMPONENT ==========
const ThreeDText = ({ 
  children, 
  variant = "extrude", 
  className = "",
  as: Component = "h2"
}: { 
  children: React.ReactNode; 
  variant?: "extrude" | "neon" | "floating" | "rotating" | "kinetic";
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) => {
  const MotionComponent = motion(Component);
  
  const variants = {
    extrude: {
      style: {
        textShadow: "0 1px 0 #000, 0 2px 0 #000, 0 3px 0 #000, 0 4px 0 #000, 0 5px 0 #000, 0 6px 0 #000, 0 7px 0 #000, 0 8px 0 #000",
        transform: "translateY(-2px)",
      },
      animate: { y: [0, -2, 0] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    neon: {
      style: {
        textShadow: "0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00bfff",
        animation: "pulse 2s ease-in-out infinite",
      },
      animate: { opacity: [0.9, 1, 0.9] },
      transition: { duration: 1.5, repeat: Infinity }
    },
    floating: {
      animate: { y: [0, -15, 0] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      style: { display: "inline-block" }
    },
    rotating: {
      animate: { rotateX: [0, 15, 0], rotateY: [0, 360, 0] },
      transition: { duration: 8, repeat: Infinity, ease: "linear" },
      style: { display: "inline-block", transformStyle: "preserve-3d" }
    },
    kinetic: {
      animate: { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      style: { display: "inline-block" }
    }
  };
  
  const config = variants[variant] || variants.extrude;
  
  return (
    <MotionComponent
      className={`font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent ${className}`}
      animate={config.animate}
      transition={config.transition}
      style={config.style}
    >
      {children}
    </MotionComponent>
  );
};

// ========== PARALLAX BLUR REVEAL ==========
const ParallaxBlurReveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-100px 0px -100px 0px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], [8, 0, 8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3]);
  
  return (
    <motion.div
      ref={ref}
      style={{ filter: isInView ? `blur(0px)` : `blur(${blur.get()}px)`, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ========== SCROLL LINKED ANIMATION ==========
const ScrollLinkedCounter = () => {
  const { scrollYProgress } = useScroll();
  const [section, setSection] = useState("Hero");
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.1) setSection("FULLSTACK");
      else if (latest < 0.25) setSection("About");
      else if (latest < 0.4) setSection("Tech Stack");
      else if (latest < 0.55) setSection("Experience");
      else if (latest < 0.7) setSection("Projects");
      else if (latest < 0.85) setSection("Reviews");
      else setSection("Contact");
    });
    return () => unsubscribe();
  }, [scrollYProgress]);
  
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-50 glass-card px-4 py-2 rounded-full text-sm font-mono border border-cyan-400/30 backdrop-blur-xl"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <span className="text-cyan-400">Currently viewing:</span> {section}
    </motion.div>
  );
};

// ========== APPLE STYLE SCROLL CARD ==========
const AppleStyleCard = ({ children, index }: { children: React.ReactNode; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [50, 0, -50]);
  
  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity, y }}
      transition={{ type: "spring", stiffness: 100 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

// ========== COMMAND MENU ==========
const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 transition-all duration-500" />
        <Dialog.Content className="fixed top-[25vh] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl focus:outline-none transition-all duration-500">
          <Command className="rounded-3xl overflow-hidden">
            <Command.Input className="w-full p-5 bg-transparent text-white text-lg border-b border-white/10 outline-none placeholder:text-gray-500" placeholder="Search projects, tools, or pages..." />
            <Command.List className="p-3 max-h-96 overflow-y-auto">
              <Command.Group heading="Pages" className="text-xs text-gray-400 mb-3 tracking-wide">
                <Command.Item className="p-3 rounded-xl hover:bg-white/10 cursor-pointer">🏠 Home</Command.Item>
                <Command.Item className="p-3 rounded-xl hover:bg-white/10 cursor-pointer">💼 Work</Command.Item>
                <Command.Item className="p-3 rounded-xl hover:bg-white/10 cursor-pointer">📞 Contact</Command.Item>
              </Command.Group>
              <Command.Group heading="Projects" className="text-xs text-gray-400 mb-3 tracking-wide">
                <Command.Item className="p-3 rounded-xl hover:bg-white/10 cursor-pointer">✨ LMTSTORE E‑commerce</Command.Item>
                <Command.Item className="p-3 rounded-xl hover:bg-white/10 cursor-pointer">🎮 FiveM Admin Menu</Command.Item>
                <Command.Item className="p-3 rounded-xl hover:bg-white/10 cursor-pointer">🖥️ 3D Portfolio</Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// ========== CODE RUNNING BACKGROUND ==========
const CodeBackground = () => {
  const greenCode = `> initializing system...
> bypassing firewall...
> connecting database...
> access granted...
> deploying API...
> websocket connected...
> scanning ports...
> loading modules...
> system ready.
`.repeat(6);
  const redCode = `> WARNING: intrusion detected
> bypassing kernel
> malware injection
> backdoor established
> trojan deployed
> keylogger active
> rootkit installed
`.repeat(6);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.08] font-mono text-xs leading-5">
      <div className="absolute top-0 left-0 w-1/2">
        <pre className="animate-[scrollCode_40s_linear_infinite] text-green-500 whitespace-pre-wrap p-10">{greenCode}</pre>
      </div>
      <div className="absolute top-0 right-0 w-1/2">
        <pre className="animate-[scrollCode_50s_linear_infinite] text-red-500 whitespace-pre-wrap p-10">{redCode}</pre>
      </div>
    </div>
  );
};

// ========== HIGHER ORDER COMPONENT ==========
const withScrollAnimation = (WrappedComponent: React.ComponentType<any>) => {
  return function AnimatedComponent(props: any) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsVisible(true);
        },
        { threshold: 0.2 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, []);
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: cinematicEase }}
        className="w-full"
      >
        <WrappedComponent {...props} />
      </motion.div>
    );
  };
};

// ========== MORPHING NAVBAR ==========
const MorphingNavbar = ({ setActivePage, activePage }: { setActivePage: (page: string) => void; activePage: string }) => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [clickEffect, setClickEffect] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => setScrolled(latest > 20));
    return () => unsubscribe();
  }, [scrollY]);

  const navbarWidth = useTransform(scrollY, [0, 100], ["90%", "auto"]);
  const navbarPadding = useTransform(scrollY, [0, 100], ["0.75rem 2rem", "0.5rem 1.5rem"]);
  const navbarBg = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0.02)", "rgba(0, 0, 0, 0.8)"]);
  const navbarBorder = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0.1)", "rgba(0, 191, 255, 0.5)"]);
  const navbarRadius = useTransform(scrollY, [0, 100], ["2rem", "3rem"]);
  const navbarY = useTransform(scrollY, [0, 200], [0, -5]);
  const navbarShadow = useTransform(scrollY, [0, 100], ["0 0 0 rgba(0,0,0,0)", "0 8px 32px rgba(0,191,255,0.3)"]);

  const handleClick = (page: string) => {
    setClickEffect(page);
    setTimeout(() => setClickEffect(null), 300);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const navItems = ["home", "about", "store", "work", "contact"];

  return (
    <motion.nav
      style={{
        width: navbarWidth,
        padding: navbarPadding,
        backgroundColor: navbarBg,
        borderColor: navbarBorder,
        borderRadius: navbarRadius,
        y: navbarY,
        left: "50%",
        x: "-50%",
        boxShadow: navbarShadow,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-6 z-50 flex items-center justify-between gap-6 md:gap-8 rounded-full border backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleClick("home")}>
        <video src="/video/logovdo.mp4" autoPlay loop muted playsInline className="w-8 h-8 rounded-lg object-cover" />
        <span className="text-xl font-bold tracking-tight">
          <span className="text-cyan-400">LMT</span>
          <span className="text-white">STORE</span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <motion.button
            key={item}
            whileHover={{ y: -2, color: "#0ea5e9" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => handleClick(item)}
            className={`relative text-sm font-medium transition-colors duration-300 ${
              activePage === item ? "text-cyan-400" : "text-gray-300 hover:text-cyan-400"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
            {activePage === item && (
              <motion.span
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 w-full h-[2px] bg-cyan-400 rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {clickEffect === item && (
              <motion.span
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 0, scale: 2 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white rounded-full pointer-events-none"
              />
            )}
          </motion.button>
        ))}
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/40 hover:shadow-lg hover:shadow-cyan-500/20"
        onClick={() => handleClick("contact")}
      >
        Dashboard
      </motion.button>
    </motion.nav>
  );
};

// ========== SPLASH HERO (LANDING) ==========
const HeroSectionLanding = ({ onStart }: { onStart: () => void }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-500"
        style={{ background: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,191,255,0.15), transparent 70%)` }}
      />
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: cinematicEase }}>
          <span className="text-cyan-400 text-sm md:text-base font-mono tracking-wider">✦ WELCOME TO ✦</span>
        </motion.div>
        <motion.h1
          className="text-7xl md:text-8xl lg:text-9xl font-black mt-4 leading-[1.05] tracking-tight"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: cinematicEase }}
        >
          <span className="bg-gradient-to-r from-blue-500 via-white to-red-600 bg-clip-text text-transparent">LMT</span>
          <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">STORE</span>
        </motion.h1>
        <motion.p className="text-gray-300 max-w-2xl mx-auto mt-6 text-lg md:text-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
          The premium product and best price
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-10">
          <button onClick={onStart} className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.05] px-10 py-4 text-lg font-semibold backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/30">
            Start Dominating →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

// ========== FULL HERO (AFTER LANDING) ==========
const HeroSectionFull = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scaleParallax = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  const blurParallax = useTransform(scrollYProgress, [0, 0.5], [0, 5]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-500"
        style={{ background: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0,191,255,0.15), transparent 70%)` }}
      />
      <motion.div style={{ y: yParallax, scale: scaleParallax, filter: blurParallax }} className="relative z-10 text-center max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: cinematicEase }}>
          <span className="text-cyan-400 text-sm md:text-base font-mono tracking-wider">✦ BUILDING SCALABLE FULLSTACK EXPERIENCES</span>
        </motion.div>
        <ThreeDText variant="rotating" as="h1" className="text-7xl md:text-8xl lg:text-9xl font-black mt-4 leading-[1.05] tracking-tight">
          FULLSTACK
          <br />
          <span className="text-white">DEVELOPER</span>
        </ThreeDText>
        <motion.p className="text-gray-300 max-w-2xl mx-auto mt-6 text-lg md:text-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}>
          The premium product and best price
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-10">
          <button className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.05] px-10 py-4 text-lg font-semibold backdrop-blur-xl transition-all duration-500 hover:scale-105 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-500/30">
            Explore Work →
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

// ========== ABOUT SECTION (CARDS + CREDIT TEAM) ==========
const AboutSection = () => {
  const items = [
    { title: "Steam Accounts", video: "/video/Steam.mp4", desc: "Premium accounts with top games at affordable prices", color: "text-cyan-400" },
    { title: "Music Sample Pack", video: "/video/Pack.mp4", desc: "Best Sound packs, Smote pack, Top producer", color: "text-cyan-400" },
    { title: "Instant Delivery", video: "/video/delivery.mp4", desc: "Get your products immediately after purchase", color: "text-cyan-400" },
    { title: "Resource Code", video: "/video/code.mp4", desc: "Malware Development, FullStack Dev, Hacking, Cyber Attack, Cheat Engine", color: "text-red-500" },
  ];
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <ThreeDText variant="floating" as="h2" className="text-5xl md:text-6xl font-black tracking-tight">About LMTSTORE</ThreeDText>
          <p className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg">Premium digital marketplace for Steam accounts and gaming assets.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <AppleStyleCard key={idx} index={idx}>
              <motion.div
                className="glass-card p-6 text-center cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6, ease: cinematicEase }}
                viewport={{ once: true }}
                whileHover={{ y: -8, borderColor: "rgba(0,191,255,0.4)" }}
              >
                <video src={item.video} autoPlay loop muted playsInline className="w-20 h-20 mx-auto mb-4 rounded-full object-cover" />
                <h3 className={`text-xl font-bold mb-2 ${item.color}`}>{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </motion.div>
            </AppleStyleCard>
          ))}
        </div>

        {/* Credit Team Work */}
        <div className="mt-24 glass-card p-8 rounded-2xl">
          <h3 className="text-3xl font-bold text-center fire-heading mb-8">Credit Team Work</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <div><span className="text-cyan-400 font-bold">Founder</span><br />ATR STUP</div>
            <div><span className="text-cyan-400 font-bold">Web Developer</span><br />LMTDEV</div>
            <div><span className="text-cyan-400 font-bold">Producer</span><br />HSO Remix, ATR Remix</div>
            <div><span className="text-cyan-400 font-bold">Resaler</span><br />Shuwang</div>
            <div><span className="text-cyan-400 font-bold">Crack Beginner</span><br />Caom</div>
            <div><span className="text-cyan-400 font-bold">Cheat Engineer</span><br />N.TREY</div>
            <div><span className="text-cyan-400 font-bold">Botnet Service</span><br />Coanh</div>
            <div><span className="text-cyan-400 font-bold">FIveM Developer</span><br />KytaHochi</div>
            <div><span className="text-cyan-400 font-bold">Boster</span><br />S.LAY</div>
            <div><span className="text-cyan-400 font-bold">Cyber Attack</span><br />N.TREY</div>
            <div><span className="text-cyan-400 font-bold">Malware Develoment</span><br />N.TREY</div>
            <div><span className="text-cyan-400 font-bold">Work Suppourt</span><br />Meng</div>
          </div>
          <div className="text-center mt-8 text-gray-500 text-sm">Last update: 27.05.2026</div>
        </div>
      </div>
    </section>
  );
};

// ========== EXPERIENCE SECTION ==========
const ExperienceSection = () => {
  const experiences = [
    { year: "2024 - Present", title: "Full Stack Developer", company: "LMTSTORE", desc: "Developing modern web applications with Next.js, Tailwind CSS, and Three.js." },
    { year: "2024 - 2025", title: "FiveM Script Developer", company: "Freelance", desc: "Created custom admin menus, anti-cheat systems, and game modes for FiveM servers." },
    { year: "2025 - 2026", title: "UI/UX Designer", company: "Creative Agency", desc: "Designed responsive and interactive user interfaces for e-commerce platforms." },
    { year: "2026", title: "Coder", company: "Cyber Security", desc: "Hacking, Cyber Attack, Cheat Engine, Malware Development, Backdoor, Trojan, Rootkit" },
  ];
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <ThreeDText variant="kinetic" as="h2" className="text-5xl md:text-6xl font-black tracking-tight">Work Experience</ThreeDText>
          <p className="text-gray-400 text-lg mt-4">My journey as a developer</p>
        </div>
        <div className="relative border-l-2 border-cyan-400/30 ml-6 md:ml-0">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              className="mb-16 ml-8"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: cinematicEase }}
            >
              <div className="absolute w-4 h-4 bg-cyan-400 rounded-full -left-[9px] mt-2 border-2 border-white" />
              <div className="glass-card p-8 rounded-2xl hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
                <span className="text-cyan-400 text-sm font-mono">{exp.year}</span>
                <h3 className="text-2xl font-bold mt-2">{exp.title}</h3>
                <p className="text-gray-400">{exp.company}</p>
                <p className="text-gray-500 mt-3">{exp.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== TECH STACK MARQUEE (2 ROWS) ==========
const TechStackMarquee = () => {
  const techs = ["React", "Next.js", "Node.js", "PostgreSQL", "Docker", "TypeScript", "Tailwind", "Three.js"];
  const duplicated = [...techs, ...techs];
  return (
    <section className="py-32 bg-black/40 overflow-hidden">
      <div className="text-center mb-12">
        <ThreeDText variant="neon" as="h2" className="text-5xl md:text-6xl font-black tracking-tight">Tech Stack</ThreeDText>
      </div>
      <div className="relative">
        <div className="overflow-hidden py-4">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            {duplicated.map((tech, idx) => (
              <div key={idx} className="glass-card px-8 py-4 rounded-full border border-white/10 inline-block">
                <span className="text-white font-medium text-lg">{tech}</span>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="overflow-hidden py-4 mt-4">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            {duplicated.map((tech, idx) => (
              <div key={idx} className="glass-card px-8 py-4 rounded-full border border-white/10 inline-block">
                <span className="text-white font-medium text-lg">{tech}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ========== PROJECTS SECTION ==========
const ProjectsSection = () => {
  const projects = [
    { title: "LMTSTORE E‑commerce", desc: "Next.js, Stripe, Tailwind", icon: "🛒", tech: ["Next.js", "Tailwind", "Framer Motion"] },
    { title: "Cheat Menu", desc: "Lua, React, WebSockets", icon: "🎮", tech: ["Lua", "HTML/CSS", "JavaScript"] },
    { title: "Website Portfolio", desc: "Three.js, React Three Fiber", icon: "🌐", tech: ["Three.js", "React", "Tailwind"] },
  ];
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <ThreeDText variant="extrude" as="h2" className="text-5xl md:text-6xl font-black tracking-tight">Featured Projects</ThreeDText>
          <p className="text-gray-400 text-lg mt-4">Interactive previews · Live demos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p, idx) => (
            <motion.div
              key={p.title}
              className="glass-card p-8 rounded-2xl cursor-pointer"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: cinematicEase }}
              whileHover={{ y: -8, borderColor: "rgba(0,191,255,0.4)" }}
            >
              <div className="text-6xl mb-5">{p.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{p.title}</h3>
              <p className="text-gray-400 mb-4">{p.desc}</p>
              <div className="flex flex-wrap gap-2 mb-5">{p.tech.map((t, i) => <span key={i} className="text-xs bg-white/5 px-3 py-1 rounded-full border border-white/10">{t}</span>)}</div>
              <button className="text-cyan-400 text-sm flex items-center gap-1 group transition-all duration-300 hover:gap-2">Live Preview →</button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ========== TERMINAL SECTION ==========
const TerminalSection = () => {
  const logs = [
    "$ npm run dev",
    "✓ Next.js ready",
    "✓ PostgreSQL connected",
    "✓ API initialized",
    "✓ Websocket connected",
    "✓ Deployment successful",
    "> Nmap scan complete: 3 open ports found",
    "> Exploiting vulnerable port 445...",
    "> Meterpreter session opened",
    "> Dumping SAM hashes...",
    "> Credentials harvested",
    "> Installing backdoor",
    "> Persistence established",
    "> Encrypting target files (ransomware simulation)",
    "> Attack detected from IP 192.168.1.104",
    "> Firewall bypassed",
    "> Rootkit deployed",
    "> Keylogger active",
    "> Admin access granted",
    "> Port 4444 opened for reverse shell",
    "> System ready for commands...",
  ];
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (index < logs.length) {
        setVisibleLogs((prev) => [...prev, logs[index]]);
        setIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          setVisibleLogs([]);
          setIndex(0);
        }, 3000);
        clearInterval(interval);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [index, logs]);
  return (
    <section className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-2xl">
          <div className="flex gap-2 mb-6"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
          <pre className="text-green-400 text-sm overflow-hidden font-mono">
            {visibleLogs.map((log, idx) => <div key={idx} className="leading-7">{log}</div>)}
            {visibleLogs.length < logs.length && <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />}
          </pre>
        </div>
      </div>
    </section>
  );
};

// ========== TESTIMONIALS SECTION ==========
const TestimonialsSection = () => {
  const reviews = [
    { name: "A3rian", text: "Silent aim is crazy good. Vehicle spawner saves so much time.", rating: 5, game: "FiveM" },
    { name: "Ahmet", text: "Aimbot is smooth af. InstaLocker never fails.", rating: 5, game: "Valorant" },
    { name: "DynastyEU", text: "Dino ESP and combat featuring effortless.", rating: 4, game: "ARK Evolved" },
    { name: "Coffee", text: "Resource ESP saves hours of farming. Best ARK tool!", rating: 4, game: "ARK Evolved" },
    { name: "ADAMKEV", text: "Teleportation and weapon spawner are insane. Must have!", rating: 4, game: "FiveM" },
  ];
  const duplicated = [...reviews, ...reviews];
  return (
    <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-950 overflow-hidden">
      <div className="text-center mb-20">
        <ThreeDText variant="floating" as="h2" className="text-5xl md:text-6xl font-black tracking-tight">Customer Reviews</ThreeDText>
        <div className="flex justify-center gap-2 mt-6"><span className="text-yellow-400 text-3xl">★★★★★</span><span className="text-white text-lg ml-3">4.9/5 based on 100+ reviews</span></div>
      </div>
      <div className="relative overflow-hidden">
        <motion.div className="flex gap-6" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}>
          {duplicated.map((review, idx) => (
            <div key={idx} className="w-96 flex-shrink-0 glass-card p-6 rounded-2xl hover:border-cyan-400 transition-all duration-300 hover:-translate-y-1">
              <div className="flex text-yellow-400 text-xl mb-3">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              <p className="text-gray-300 text-sm mb-4">&quot;{review.text}&quot;</p>
              <div className="flex justify-between items-center"><p className="text-white font-semibold">{review.name}</p><span className="text-cyan-400 text-xs border border-cyan-400/30 rounded-full px-3 py-1">{review.game}</span></div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ========== TERMS & POLICIES ==========
const TermsSection = () => (
  <section className="py-32 px-6 bg-gradient-to-b from-black to-gray-950">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <ThreeDText variant="rotating" as="h2" className="text-5xl md:text-6xl font-black tracking-tight">Terms & Policies</ThreeDText>
        <p className="text-gray-400 text-lg mt-4">Everything you need to know about using Ambani.</p>
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400"><span className="bg-white/5 px-4 py-2 rounded-full">2026-02-06</span><span className="bg-white/5 px-4 py-2 rounded-full">Guaranteed Protection</span><span className="bg-white/5 px-4 py-2 rounded-full">200+ Users</span><span className="bg-white/5 px-4 py-2 rounded-full">Terms of Service</span><span className="bg-white/5 px-4 py-2 rounded-full">Refund Policy</span><span className="bg-white/5 px-4 py-2 rounded-full">Privacy Policy</span></div>
      </div>
      <div className="space-y-12">
        <div className="glass-card p-8 rounded-2xl"><h3 className="text-2xl font-bold mb-4">Terms of Service</h3><p className="text-gray-400">Agreement to Terms – Welcome to Ambani...</p></div>
        <div className="glass-card p-8 rounded-2xl"><h3 className="text-2xl font-bold mb-4">What You Can (and Can&rsquo;t) Do</h3><div className="grid md:grid-cols-2 gap-6"><div><p className="text-cyan-400 font-semibold">You Can</p><ul className="list-disc list-inside text-gray-400"><li>Use the software for personal use</li><li>Access updates during your license</li><li>Contact support for assistance</li><li>Use on your own machine</li></ul></div><div><p className="text-red-400 font-semibold">You Can&rsquo;t</p><ul className="list-disc list-inside text-gray-400"><li>Reverse engineer or decompile</li><li>Resell or transfer your license</li><li>Use for commercial purposes</li><li>Share with anti-cheat developers</li></ul></div></div><p className="text-gray-500 text-sm mt-4">Ambani is not liable for in-game bans or suspensions.</p></div>
        <div className="glass-card p-8 rounded-2xl"><h3 className="text-2xl font-bold mb-4">Refund Policy</h3><p className="text-gray-400">All purchases are final and non-refundable. Chargebacks result in permanent ban.</p></div>
        <div className="glass-card p-8 rounded-2xl"><h3 className="text-2xl font-bold mb-4">Privacy Policy</h3><p className="text-gray-400">We collect only necessary data (account, payment via Stripe, technical data). We never sell your data.</p></div>
      </div>
    </div>
  </section>
);

// ========== CONTACT SECTION ==========
const ContactSection = () => (
  <section id="contact" className="py-32 px-6">
    <div className="max-w-4xl mx-auto text-center">
      <ThreeDText variant="neon" as="h2" className="text-5xl md:text-6xl font-black tracking-tight mb-6">Contact Us</ThreeDText>
      <p className="text-gray-400 text-lg mb-12">Have questions? Reach out to us!</p>
      <div className="glass-card p-10 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"><input type="text" placeholder="Your Name" className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400" /><input type="email" placeholder="Your Email" className="px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400" /></div>
        <textarea rows={5} placeholder="Your Message" className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-400 mb-8" />
        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 px-10 py-4 rounded-full text-lg font-semibold shadow-2xl shadow-cyan-500/20 transition-all duration-500 hover:scale-105 hover:shadow-cyan-500/40">Send Message</button>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap justify-center gap-8 text-sm">
          <a href="https://t.me/Shuwangcoder" target="_blank" className="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><span className="text-2xl">📱</span> Telegram: @shuwangcoder</a>
          <a href="https://www.facebook.com/share/1CBcPKM1nd/?mibextid=wwXIfr" target="_blank" className="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><span className="text-2xl">📘</span> Facebook: Shuwang</a>
          <a href="https://discord.gg/ppRPW6yF" target="_blank" className="text-gray-400 hover:text-cyan-400 transition flex items-center gap-2"><span className="text-2xl">🎮</span> Discord: MYSEFT</a>
        </div>
      </div>
    </div>
  </section>
);

// ========== STORE PAGE COMPONENTS ==========
const productsImages = [
  "500+.jpg", "anticheat.jpg", "ark.jpg", "forza5.jpg", "godofwar.jpg", "gtav.jpg", "horizon.jpg", "naruto.jpg", "pesfodball.jpg", "Sekiro.jpg", "spider.jpg", "theforest.jpg", "witcher.jpg"
];
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % productsImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl mb-12">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={`/images/products/${productsImages[current]}`}
          alt="banner"
          className="absolute w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {productsImages.map((_, idx) => <button key={idx} onClick={() => setCurrent(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === current ? "bg-cyan-400 w-6" : "bg-white/50"}`} />)}
      </div>
    </div>
  );
};
const InfiniteSlider = ({ direction = "left", speed = 20 }) => {
  const duplicated = [...productsImages, ...productsImages];
  return (
    <div className="relative overflow-hidden py-4">
      <motion.div className="flex gap-4" animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }} transition={{ repeat: Infinity, duration: speed, ease: "linear" }}>
        {duplicated.map((img, idx) => <img key={idx} src={`/images/products/${img}`} className="w-48 h-32 object-cover rounded-xl" alt="product" />)}
      </motion.div>
    </div>
  );
};

// Full product list (21 items)
const storeProducts = [
  { id: 1, title: "Steam Account - GTA V", category: "Steam Account", price: 0.01, originalPrice: 59.99, description: "Grand Theft Auto V - Online & Offline. FiveM Ready.", type: "account", gamesCount: 2, level: 25, image: "/images/products/gtav.jpg", discount: 97 },
  { id: 2, title: "Steam Account - FIFA 25", category: "Steam Account", price: 0.02, originalPrice: 69.99, description: "FIFA 25 Ultimate Team, Career Mode, Online Access", type: "account", gamesCount: 1, level: 18, image: "/images/products/fifa.jpg", discount: 97 },
  { id: 3, title: "Steam Account - SpiderMan", category: "Steam Account", price: 0.03, originalPrice: 59.99, description: "Marvel's Spider-Man Remastered + Miles Morales", type: "account", gamesCount: 2, level: 12, image: "/images/products/spider.jpg", discount: 97 },
  { id: 4, title: "Steam Account - RDR2", category: "Steam Account", price: 0.03, originalPrice: 69.99, description: "Red Dead Redemption 2 - Story + Online", type: "account", gamesCount: 2, level: 20, image: "/images/products/rdr2.jpg", discount: 97 },
  { id: 5, title: "Steam Account - God Of War", category: "Steam Account", price: 0.02, originalPrice: 59.99, description: "God of War (2018) + Ragnarok", type: "account", gamesCount: 2, level: 15, image: "/images/products/godofwar.jpg", discount: 97 },
  { id: 6, title: "Steam Account - Horizon", category: "Steam Account", price: 0.03, originalPrice: 59.99, description: "Horizon Zero Dawn + Forbidden West", type: "account", gamesCount: 2, level: 14, image: "/images/products/horizon.jpg", discount: 97 },
  { id: 7, title: "Steam Account - The Forest", category: "Steam Account", price: 0.01, originalPrice: 19.99, description: "The Forest + Sons of The Forest", type: "account", gamesCount: 2, level: 10, image: "/images/products/theforest.jpg", discount: 93 },
  { id: 8, title: "Steam Account - Witcher 3", category: "Steam Account", price: 0.01, originalPrice: 39.99, description: "The Witcher 3: Wild Hunt Complete Edition", type: "account", gamesCount: 2, level: 22, image: "/images/products/witcher.jpg", discount: 95 },
  { id: 9, title: "Steam Account - Football 26", category: "Steam Account", price: 0.01, originalPrice: 59.99, description: "Football 26 - Ultimate Team, Career Mode", type: "account", gamesCount: 1, level: 16, image: "/images/products/pesfodball.jpg", discount: 97 },
  { id: 10, title: "Steam Account - Forza 5", category: "Steam Account", price: 0.02, originalPrice: 59.99, description: "Forza Horizon 5 - Premium Edition", type: "account", gamesCount: 1, level: 30, image: "/images/products/forza5.jpg", discount: 97 },
  { id: 11, title: "Steam Account - Black Myth Wukong", category: "Steam Account", price: 0.01, originalPrice: 59.99, description: "Black Myth: Wukong - Full Game", type: "account", gamesCount: 1, level: 8, image: "/images/products/blackwukong.jpg", discount: 95 },
  { id: 12, title: "Steam Account - Naruto", category: "Steam Account", price: 0.02, originalPrice: 49.99, description: "Naruto Ultimate Ninja Storm Series", type: "account", gamesCount: 1, level: 35, image: "/images/products/naruto.jpg", discount: 97 },
  { id: 13, title: "Steam Account - ARK", category: "Steam Account", price: 0.01, originalPrice: 49.99, description: "ARK Survival Evolved + All DLCs", type: "account", gamesCount: 2, level: 50, image: "/images/products/ark.jpg", discount: 96 },
  { id: 14, title: "Steam Account - Sekiro", category: "Steam Account", price: 0.01, originalPrice: 59.99, description: "Sekiro: Shadows Die Twice - GOTY", type: "account", gamesCount: 1, level: 12, image: "/images/products/sekiro.jpg", discount: 97 },
  { id: 15, title: "Steam Account - 500+ Games Bundle", category: "Steam Account", price: 0.10, originalPrice: 499.99, description: "Mega Bundle - 500+ Premium Steam Games!", type: "account", gamesCount: 2, level: 99, image: "/images/products/500plus.jpg", discount: 98 },
  { id: 16, title: "ATR SAMPLE PACK", category: "ZIP File", price: 0.02, originalPrice: 19.99, description: "1000+ Items - Professional Sound Effects", type: "zip", fileSize: "2.5 GB", image: "/images/products/atrsample.jpg", discount: 90 },
  { id: 17, title: "ATR STUP SUPER", category: "ZIP File", price: 0.03, originalPrice: 29.99, description: "Premium Studio Stup Super Pack", type: "zip", fileSize: "3.2 GB", image: "/images/products/atrstup.jpg", discount: 90 },
  { id: 18, title: "HSO Sample Recording", category: "ZIP File", price: 0.01, originalPrice: 14.99, description: "HSO Studio Quality Sample Recordings", type: "zip", fileSize: "1.8 GB", image: "/images/products/hso_sample.jpg", discount: 90 },
  { id: 19, title: "Roblox Menu", category: "ZIP File", price: 0.01, originalPrice: 4.99, description: "Roblox Custom Menu UI - Scripts", type: "zip", fileSize: "50 MB", image: "/images/products/robloxmenu.jpg", discount: 80 },
  { id: 20, title: "AntiCheat Roblox Server", category: "ZIP File", price: 0.05, originalPrice: 19.99, description: "Advanced Anticheat for Roblox", type: "zip", fileSize: "15 MB", image: "/images/products/anticheat.jpg", discount: 75 },
  { id: 21, title: "FiveM Cheat Ambani", category: "ZIP File", price: 0.03, originalPrice: 29.99, description: "Premium FiveM Cheat Menu - Aimbot, ESP", type: "zip", fileSize: "120 MB", image: "/images/products/ambanicheat.jpg", discount: 80 },
];

const RotatingProductCard = ({ children }: { children: React.ReactNode }) => {
  const [rotate, setRotate] = useState(0);
  const [direction, setDirection] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => {
      setRotate((prev) => {
        let next = prev + direction * 0.2;
        if (next >= 25) {
          setDirection(-1);
          return 25;
        } else if (next <= -25) {
          setDirection(1);
          return -25;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [direction]);
  return (
    <motion.div
      style={{ transform: `perspective(800px) rotateY(${rotate}deg)`, transition: "transform 0.03s linear" }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

// ========== VERTICAL MARQUEE (SEAMLESS LOOP) ==========
const VerticalMarquee = ({ children, direction = "up", speed = 30 }: { children: React.ReactNode; direction?: "up" | "down"; speed?: number }) => {
  const [singleHeight, setSingleHeight] = useState(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      setSingleHeight(measureRef.current.clientHeight);
    }
  }, [children]);

  return (
    <div ref={containerRef} className="relative overflow-hidden h-[600px]">
      {singleHeight > 0 ? (
        <motion.div
          className="flex flex-col gap-6"
          animate={{ y: direction === "up" ? [0, -singleHeight] : [-singleHeight, 0] }}
          transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
        >
          <div ref={measureRef}>{children}</div>
          {children}
        </motion.div>
      ) : (
        <div className="absolute opacity-0 pointer-events-none">
          <div ref={measureRef} className="flex flex-col gap-6">{children}</div>
        </div>
      )}
    </div>
  );
};

// ========== UPDATED STORE PAGE ==========
const StorePage = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = storeProducts.filter(p => {
    const matchFilter = filter === "all" || (filter === "account" && p.type === "account") || (filter === "zip" && p.type === "zip");
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const leftProducts = filtered.filter((_, idx) => idx % 2 === 0);
  const rightProducts = filtered.filter((_, idx) => idx % 2 === 1);

  const renderProduct = (p: any) => {
    const discountPercent = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    return (
      <RotatingProductCard key={p.id}>
        <GlowBorder>
          <div className="glass-card rounded-2xl overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
            <div className="relative h-48">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">-{discountPercent}%</span>
              <span className="absolute top-3 left-3 bg-cyan-400/80 text-white text-xs px-2 py-1 rounded-full">{p.category}</span>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold mb-1">{p.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{p.description.substring(0, 80)}...</p>
              {p.type === "account" && (
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  <span className="bg-white/10 px-2 py-1 rounded-full">🎮 {p.gamesCount} Games</span>
                  <span className="bg-white/10 px-2 py-1 rounded-full">Level {p.level}</span>
                </div>
              )}
              {p.type === "zip" && <div className="mb-3 text-xs text-gray-400">📦 Size: {p.fileSize}</div>}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                <div>
                  <span className="text-2xl font-bold text-cyan-400">${p.price}</span>
                  <span className="text-gray-500 line-through text-sm ml-2">${p.originalPrice}</span>
                </div>
                <button onClick={() => window.open("https://t.me/Shuwangcoder", "_blank")} className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-full text-sm">Buy Now 🛒</button>
              </div>
            </div>
          </div>
        </GlowBorder>
      </RotatingProductCard>
    );
  };

  return (
    <main className="relative z-0 bg-primary min-h-screen pt-32">
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover -z-10 opacity-40" src="/video/vdoback.mp4" />
      <div className="max-w-7xl mx-auto px-6">
        <HeroCarousel />
        <InfiniteSlider direction="left" speed={25} />
        <InfiniteSlider direction="right" speed={30} />

        <div className="mt-16">
          <div className="text-center mb-12">
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <button onClick={() => setFilter("all")} className={`px-5 py-2 rounded-full ${filter === "all" ? "bg-cyan-500" : "bg-white/5"} text-white`}>All</button>
              <button onClick={() => setFilter("account")} className={`px-5 py-2 rounded-full ${filter === "account" ? "bg-cyan-500" : "bg-white/5"} text-white`}>Steam Games</button>
              <button onClick={() => setFilter("zip")} className={`px-5 py-2 rounded-full ${filter === "zip" ? "bg-cyan-500" : "bg-white/5"} text-white`}>ZIP Files</button>
              <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400" />
            </div>
          </div>

          {/* Two-column vertical marquee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VerticalMarquee direction="up" speed={80}>
              {leftProducts.map(p => renderProduct(p))}
            </VerticalMarquee>
            <VerticalMarquee direction="down" speed={80}>
              {rightProducts.map(p => renderProduct(p))}
            </VerticalMarquee>
          </div>

          {/* Spacer to allow page scrolling */}
          <div className="h-96"></div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-500">No products found.</div>
          )}
        </div>
      </div>
    </main>
  );
};

// ========== COMBINED PAGES ==========
const CombinedAboutPage = () => {
  return (
    <>
      <ParallaxBlurReveal><AboutSection /></ParallaxBlurReveal>
      <ParallaxBlurReveal><ExperienceSection /></ParallaxBlurReveal>
      <ParallaxBlurReveal><TermsSection /></ParallaxBlurReveal>
    </>
  );
};

const CombinedWorkPage = () => {
  return (
    <>
      <ParallaxBlurReveal><TechStackMarquee /></ParallaxBlurReveal>
      <ParallaxBlurReveal><TestimonialsSection /></ParallaxBlurReveal>
      <ParallaxBlurReveal><TerminalSection /></ParallaxBlurReveal>
    </>
  );
};

// ========== ANIMATED SECTIONS (for home page) ==========
const AnimatedAbout = withScrollAnimation(AboutSection);
const AnimatedTechStack = withScrollAnimation(TechStackMarquee);
const AnimatedExperience = withScrollAnimation(ExperienceSection);
const AnimatedProjects = withScrollAnimation(ProjectsSection);
const AnimatedTerminal = withScrollAnimation(TerminalSection);
const AnimatedTestimonials = withScrollAnimation(TestimonialsSection);
const AnimatedContact = withScrollAnimation(ContactSection);
const AnimatedTerms = withScrollAnimation(TermsSection);

const FullHomePage = () => {
  return (
    <>
      <HeroSectionFull />
      <ParallaxBlurReveal><AnimatedAbout /></ParallaxBlurReveal>
      <ParallaxBlurReveal><AnimatedTechStack /></ParallaxBlurReveal>
      <ParallaxBlurReveal><AnimatedExperience /></ParallaxBlurReveal>
      <ParallaxBlurReveal><AnimatedProjects /></ParallaxBlurReveal>
      <ParallaxBlurReveal><AnimatedTerminal /></ParallaxBlurReveal>
      <ParallaxBlurReveal><AnimatedTestimonials /></ParallaxBlurReveal>
      <ParallaxBlurReveal><AnimatedTerms /></ParallaxBlurReveal>
      <ParallaxBlurReveal><AnimatedContact /></ParallaxBlurReveal>
    </>
  );
};

// ========== BACKGROUND EFFECTS ==========
const GlowOrbs = () => (<><div className="fixed top-[-20%] left-[10%] w-[800px] h-[800px] bg-cyan-500/30 blur-[200px] rounded-full pointer-events-none z-0" /><div className="fixed bottom-[-20%] right-[10%] w-[800px] h-[800px] bg-purple-500/30 blur-[200px] rounded-full pointer-events-none z-0" /><div className="fixed top-1/3 left-1/2 w-[600px] h-[600px] bg-red-500/15 blur-[150px] rounded-full pointer-events-none z-0" /></>);
const ScrollProgress = () => { const { scrollYProgress } = useScroll(); return <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500 origin-left z-50" style={{ scaleX: scrollYProgress }} />; };
const ParticleBackground = () => {
  const particlesInit = async (engine: any) => { await loadSlim(engine); };
  return <Particles id="tsparticles" particlesInit={particlesInit} className="fixed inset-0 -z-10" options={{ fpsLimit: 60, particles: { number: { value: 80, density: { enable: true, width: 1920, height: 1080 } }, color: { value: ["#00BFFF","#FF69B4","#ff0000"] }, links: { color: "#ffffff", opacity: 0.05, distance: 200 }, move: { enable: true, speed: 1.2, direction: "none", random: false, straight: false }, opacity: { value: 0.4 }, size: { value: 2 } }, interactivity: { events: { onHover: { enable: true, mode: "repulse" } } } }} />;
};

// ========== MAIN HOME PAGE ==========
export default function HomePage() {
  const [activePage, setActivePage] = useState<"landing" | "home" | "about" | "store" | "work" | "contact">("landing");

  if (activePage === "landing") {
    return (
      <SmoothScrollProvider>
        <div className="bg-layered noise relative">
          <CodeBackground />
          <GlowOrbs />
          <ScrollProgress />
          <ParticleBackground />
          <CommandMenu />
          <HeroSectionLanding onStart={() => setActivePage("home")} />
        </div>
      </SmoothScrollProvider>
    );
  }

  if (activePage === "about") {
    return (
      <SmoothScrollProvider>
        <div className="bg-layered noise relative">
          <CodeBackground />
          <GlowOrbs />
          <ScrollProgress />
          <ParticleBackground />
          <CommandMenu />
          <MorphingNavbar setActivePage={(p) => setActivePage(p as any)} activePage={activePage} />
          <CombinedAboutPage />
          <ScrollLinkedCounter />
          <footer className="py-12 text-center text-gray-500 text-sm border-t border-white/5">© 2025 LMTSTORE · Built with Next.js & Framer Motion · <kbd className="px-2 py-1 bg-white/5 rounded-md">⌘</kbd>+<kbd className="px-2 py-1 bg-white/5 rounded-md">K</kbd> to search</footer>
        </div>
      </SmoothScrollProvider>
    );
  }

  if (activePage === "work") {
    return (
      <SmoothScrollProvider>
        <div className="bg-layered noise relative">
          <CodeBackground />
          <GlowOrbs />
          <ScrollProgress />
          <ParticleBackground />
          <CommandMenu />
          <MorphingNavbar setActivePage={(p) => setActivePage(p as any)} activePage={activePage} />
          <CombinedWorkPage />
          <ScrollLinkedCounter />
          <footer className="py-12 text-center text-gray-500 text-sm border-t border-white/5">© 2025 LMTSTORE · Built with Next.js & Framer Motion · <kbd className="px-2 py-1 bg-white/5 rounded-md">⌘</kbd>+<kbd className="px-2 py-1 bg-white/5 rounded-md">K</kbd> to search</footer>
        </div>
      </SmoothScrollProvider>
    );
  }

  if (activePage === "store") {
    return (
      <SmoothScrollProvider>
        <CommandMenu />
        <MorphingNavbar setActivePage={(p) => setActivePage(p as any)} activePage={activePage} />
        <StorePage />
        <ScrollLinkedCounter />
      </SmoothScrollProvider>
    );
  }

  if (activePage === "contact") {
    return (
      <SmoothScrollProvider>
        <div className="bg-layered noise relative">
          <CodeBackground />
          <GlowOrbs />
          <ScrollProgress />
          <ParticleBackground />
          <CommandMenu />
          <MorphingNavbar setActivePage={(p) => setActivePage(p as any)} activePage={activePage} />
          <ContactSection />
          <ScrollLinkedCounter />
          <footer className="py-12 text-center text-gray-500 text-sm border-t border-white/5">© 2025 LMTSTORE · Built with Next.js & Framer Motion · <kbd className="px-2 py-1 bg-white/5 rounded-md">⌘</kbd>+<kbd className="px-2 py-1 bg-white/5 rounded-md">K</kbd> to search</footer>
        </div>
      </SmoothScrollProvider>
    );
  }

  // Default home page (activePage === "home")
  return (
    <SmoothScrollProvider>
      <div className="bg-layered noise relative">
        <CodeBackground />
        <GlowOrbs />
        <ScrollProgress />
        <ParticleBackground />
        <CommandMenu />
        <MorphingNavbar setActivePage={(p) => setActivePage(p as any)} activePage={activePage} />
        <FullHomePage />
        <ScrollLinkedCounter />
        <footer className="py-12 text-center text-gray-500 text-sm border-t border-white/5">© 2025 LMTSTORE · Built with Next.js & Framer Motion · <kbd className="px-2 py-1 bg-white/5 rounded-md">⌘</kbd>+<kbd className="px-2 py-1 bg-white/5 rounded-md">K</kbd> to search</footer>
      </div>
    </SmoothScrollProvider>
  );
}