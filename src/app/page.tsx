"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "framer-motion";
import Lenis from "lenis";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { ElectricText } from "@/components/electric-text";
import { ElectricStrokeText } from "@/components/electric-stroke-text";
import { ElectricBorder } from "@/components/electric-border";
import { GradientBorder } from "@/components/gradient-border";
import { ChainedText } from "@/components/chained-text";

/* ============================================================
   CONSTANTS
   ============================================================ */
const cinematicEase = [0.16, 1, 0.3, 1] as const;

/* ============================================================
   1. SOUND EFFECTS (SFX) UTILITY
   ============================================================ */
const playSciFiSound = (type: "click" | "hover" | "purchase") => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "hover") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === "click") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === "purchase") {
      osc.type = "square";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    // Ignore audio context restrictions before user interaction
  }
};

/* ============================================================
   INTERACTIVE CURSOR TRAIL / GLOW EFFECT
   ============================================================ */
const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest(".cursor-pointer")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <div
      className={`fixed pointer-events-none z-[9999] rounded-full transition-transform duration-100 ease-out hidden md:block ${
        isHovered
          ? "w-12 h-12 bg-cyan-400/20 border-2 border-cyan-400 scale-125 blur-[1px]"
          : "w-6 h-6 bg-cyan-400/40 border border-cyan-300 blur-[2px]"
      }`}
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};

/* ============================================================
   LIVE CRYPTOCURRENCY / DIGITAL BALANCE TICKER
   ============================================================ */
const LiveTickerBar = () => {
  const tickerItems = [
    "⚡ BTC/USDT: $88,450.20 (+3.4%)",
    "💎 ETH/USDT: $35.50 (+1.8%)",
    "🎮 STEAM GTA V: 5 LEFT IN STOCK",
    "🔥 FIFA 25: 2 LEFT IN STOCK",
    "🚀 INSTANT DELIVERY: ACTIVE",
    "🛡️ SPOOFER UNDETECTED",
  ];

  return (
    <div className="w-full fixed top-0 left-0 bg-cyan-950/90 border-b border-cyan-500/30 overflow-hidden py-1.5 text-[11px] font-mono text-cyan-300 z-50 backdrop-blur-md">
      {/* ប្តូរមកប្រើ CSS Animation ជំនួស Framer Motion ដើម្បីកុំឱ្យញាក់ ឬ Glitch */}
      <div className="flex whitespace-nowrap w-max animate-marquee">
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
          <span key={idx} className="flex items-center gap-2 mx-6">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   3D TILT PERSPECTIVE WRAPPER
   ============================================================ */
const TiltCard = ({ children }: { children: React.ReactNode }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className="relative w-full h-full"
    >
      {children}
    </motion.div>
  );
};

/* ============================================================
   CYBERPUNK GLITCH EFFECT ON HOVER
   ============================================================ */
const GlitchHoverText = ({ text }: { text: string }) => {
  return (
    <span className="relative inline-block group cursor-pointer">
      <span className="relative z-10 group-hover:opacity-0 transition-opacity duration-100">
        {text}
      </span>
      <span className="absolute inset-0 text-cyan-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-[2px] transition-all duration-75">
        {text}
      </span>
      <span className="absolute inset-0 text-purple-500 opacity-0 group-hover:opacity-100 group-hover:-translate-x-[2px] transition-all duration-75">
        {text}
      </span>
    </span>
  );
};

/* ============================================================
   SMOOTH SCROLL
   ============================================================ */
function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, smoothWheel: true, autoRaf: true });
    return () => lenis.destroy();
  }, []);
  return <>{children}</>;
}

/* ============================================================
   2. MATRIX RAIN BACKGROUND ANIMATION
   ============================================================ */
const MatrixRainBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    const letters = "01LMTMARKET<>[]{}#/\\XYZ@*";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00bfff";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", updateSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-20"
    />
  );
};

/* ============================================================
   SITE GRID + SCANLINES
   ============================================================ */
const SiteGrid = () => (
  <div
    className="fixed inset-0 pointer-events-none z-0"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
      backgroundSize: "70px 70px",
      maskImage: "linear-gradient(to bottom, black, transparent 85%)",
      WebkitMaskImage: "linear-gradient(to bottom, black, transparent 85%)",
    }}
  />
);

const Scanlines = () => (
  <div
    className="fixed inset-0 pointer-events-none z-[999] opacity-[0.025]"
    style={{
      background:
        "repeating-linear-gradient(to bottom, transparent 0, transparent 3px, rgba(255,255,255,0.5) 4px)",
    }}
  />
);

/* ============================================================
   3. LIVE PURCHASE POPUP TOAST NOTIFICATION
   ============================================================ */
const PURCHASE_MESSAGES = [
  { user: "A3rian", item: "Steam Account - GTA V" },
  { user: "Ahmet", item: "Steam Account - FIFA 25" },
  { user: "DynastyEU", item: "ATR SAMPLE PACK" },
  { user: "Coffee", item: "Steam Account - RDR2" },
  { user: "ADAMKEV", item: "FiveM Cheat Ambani" },
  { user: "Shuwang", item: "Steam Account - SpiderMan" },
];

const LivePurchaseToast = () => {
  const [currentToast, setCurrentToast] = useState<{ user: string; item: string } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsg = PURCHASE_MESSAGES[Math.floor(Math.random() * PURCHASE_MESSAGES.length)];
      setCurrentToast(randomMsg);
      setVisible(true);
      playSciFiSound("purchase");

      setTimeout(() => {
        setVisible(false);
      }, 4000);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {visible && currentToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: -20 }}
          className="fixed bottom-6 left-6 z-50 glass-card p-4 rounded-2xl border border-cyan-400/40 bg-black/80 backdrop-blur-xl shadow-2xl flex items-center gap-3 font-mono text-xs max-w-sm"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping flex-shrink-0" />
          <div>
            <p className="text-cyan-400 font-bold">{currentToast.user} just purchased</p>
            <p className="text-gray-300">{currentToast.item}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================================
   GLOW BORDER
   ============================================================ */
const GlowBorder = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`relative group ${className}`}>
    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-70 blur-md glow-spin group-hover:opacity-100 transition-opacity duration-500" />
    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-60 blur-xl glow-spin-reverse group-hover:blur-2xl transition-all duration-500" />
    <div className="relative rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 overflow-hidden z-10">
      {children}
    </div>
  </div>
);

/* ============================================================
   3D TEXT
   ============================================================ */
type TextVariant = "shimmer" | "outline" | "floating" | "kinetic";

interface ThreeDTextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

const ThreeDText = ({
  children,
  variant = "shimmer",
  className = "",
  as = "h2",
}: ThreeDTextProps) => {
  const MotionTag = useMemo(() => {
    const tag = (motion as any)[as];
    return (tag || motion.div) as React.ComponentType<any>;
  }, [as]);

  const variants: Record<
    TextVariant,
    { animate?: any; transition?: any; extraClass?: string }
  > = {
    shimmer: { animate: {}, transition: {}, extraClass: "text-shimmer inline-block" },
    outline: { animate: {}, transition: {}, extraClass: "text-outline inline-block" },
    floating: {
      animate: { y: [0, -15, 0] },
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      extraClass: "inline-block",
    },
    kinetic: {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
      extraClass: "inline-block",
    },
  };

  const config = variants[variant];
  const combined = `${className} ${config.extraClass || ""}`.trim();

  return (
    <MotionTag
      className={combined}
      animate={config.animate}
      transition={config.transition}
    >
      {children}
    </MotionTag>
  );
};

/* ============================================================
   PARALLAX BLUR REVEAL
   ============================================================ */
const ParallaxBlurReveal = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const blur = useTransform(scrollYProgress, [0, 0.5, 1], ["8px", "0px", "8px"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.4, 1, 1, 0.4]);

  return (
    <motion.div ref={ref} style={{ filter: blur, opacity }} className={className}>
      {children}
    </motion.div>
  );
};

/* ============================================================
   SCROLL-LINKED COUNTER
   ============================================================ */
const sectionsMap = [
  { label: "JUNIOR", threshold: 0 },
  { label: "Work Video", threshold: 0.1 },
  { label: "Live Development", threshold: 0.25 },
  { label: "Dashboard", threshold: 0.4 },
  { label: "Activity", threshold: 0.55 },
  { label: "Reviews", threshold: 0.7 },
];

const ScrollLinkedCounter = () => {
  const { scrollYProgress } = useScroll();
  const [current, setCurrent] = useState("JUNIOR");

  useEffect(() => {
    const unsub = scrollYProgress.on("change", (v) => {
      const match = [...sectionsMap].reverse().find((s) => v >= s.threshold);
      if (match && match.label !== current) setCurrent(match.label);
    });
    return () => unsub();
  }, [scrollYProgress, current]);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 glass-card px-4 py-2 rounded-full text-xs font-mono border border-cyan-400/30 backdrop-blur-xl"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 }}
    >
      <span className="text-cyan-400">Now viewing:</span> {current}
    </motion.div>
  );
};

/* ============================================================
   COMMAND MENU (CTRL+K)
   ============================================================ */
const CommandMenu = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((p) => !p);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-50" />
        <Dialog.Content className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 bg-[#0a0a0c]/95 backdrop-blur-2xl rounded-3xl border border-cyan-500/40 shadow-2xl focus:outline-none font-mono">
          <Command className="rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-cyan-500/20 text-xs text-cyan-400 flex justify-between items-center">
              <span>SYSTEM COMMAND CONSOLE v2.0 (CTRL+K)</span>
              <span className="bg-cyan-500/20 px-2 py-0.5 rounded">ESC to close</span>
            </div>
            <Command.Input
              className="w-full p-5 bg-transparent text-white text-lg border-b border-white/10 outline-none placeholder:text-gray-500 font-mono"
              placeholder="Search products, type command..."
            />
            <Command.List className="p-3 max-h-96 overflow-y-auto">
              <Command.Group heading="Pages Navigation" className="text-xs text-cyan-400 mb-3 tracking-wide">
                {["🏠 Home", "📖 About", "🛒 Store"].map((x) => (
                  <Command.Item
                    key={x}
                    onSelect={() => {
                      playSciFiSound("click");
                      setOpen(false);
                    }}
                    className="p-3 rounded-xl hover:bg-cyan-400/10 hover:text-cyan-400 cursor-pointer text-sm text-gray-300 transition-colors"
                  >
                    {x}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/* ============================================================
   CODE BACKGROUND
   ============================================================ */
const CodeBackground = () => {
  const leftCode = `> initializing environment...
> loading modules...
> connecting database...
> websocket connected...
> API routes registered...
> build completed successfully.
`.repeat(8);

  const rightCode = `const app = createApp();
app.use(router);
app.use(auth);
app.listen(PORT, () => {
  console.log('Server ready');
});
`.repeat(8);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-[0.04] font-mono text-[10px] leading-6">
      <div
        className="absolute inset-0 z-10"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, #050505 85%)",
        }}
      />
      <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
        <pre className="text-cyan-400/60 whitespace-pre-wrap p-10 animate-[scrollCode_60s_linear_infinite]">
          {leftCode}
        </pre>
      </div>
      <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden">
        <pre className="text-purple-400/50 whitespace-pre-wrap p-10 animate-[scrollCode_70s_linear_infinite]">
          {rightCode}
        </pre>
      </div>
    </div>
  );
};

/* ============================================================
   HOC — scroll reveal
   ============================================================ */
const withScrollAnimation = <P extends object>(Wrapped: React.ComponentType<P>) => {
  return function Animated(props: P) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      if (!ref.current) return;
      const obs = new IntersectionObserver(
        ([e]) => e.isIntersecting && setVisible(true),
        { threshold: 0.15 }
      );
      obs.observe(ref.current);
      return () => obs.disconnect();
    }, []);

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: cinematicEase }}
        className="w-full"
      >
        <Wrapped {...props} />
      </motion.div>
    );
  };
};

/* ============================================================
   AUTH MODAL
   ============================================================ */
type AuthMode = "login" | "register";

const AuthModal = ({
  open,
  onClose,
  mode: initialMode = "login",
}: {
  open: boolean;
  onClose: () => void;
  mode?: AuthMode;
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, open]);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md z-[60] rounded-3xl border border-cyan-500/30 bg-[#0a0a0c]/95 backdrop-blur-2xl p-8 shadow-2xl focus:outline-none font-mono">
          <Dialog.Close asChild>
            <button
              onMouseEnter={() => playSciFiSound("hover")}
              onClick={() => playSciFiSound("click")}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-400/40 transition-colors"
            >
              ✕
            </button>
          </Dialog.Close>

          <div className="text-center mb-8">
            <img
              src="/images/products/LMTMARKET.jpg"
              alt="LMTMARKET"
              className="w-14 h-14 mx-auto rounded-2xl object-cover shadow-lg shadow-cyan-500/20 mb-4 ring-1 ring-white/10"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <h2 className="font-display text-2xl font-bold">
              <span className="text-cyan-400">LMT</span>
              <span className="text-white">MARKET</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {mode === "login"
                ? "Welcome back, sign in to continue"
                : "Create your account to start shopping"}
            </p>
          </div>

          <div className="flex gap-2 p-1 rounded-full bg-white/5 border border-white/10 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onMouseEnter={() => playSciFiSound("hover")}
                onClick={() => {
                  playSciFiSound("click");
                  setMode(m);
                }}
                className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === m ? "bg-cyan-400 text-black font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              playSciFiSound("click");
              onClose();
            }}
          >
            {mode === "register" && (
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="yourname"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                  <input type="checkbox" className="accent-cyan-400" />
                  Remember me
                </label>
                <a href="#" className="text-cyan-400 hover:text-cyan-300">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              onMouseEnter={() => playSciFiSound("hover")}
              className="w-full py-3 rounded-full bg-cyan-400 text-black font-semibold text-sm hover:bg-cyan-300 transition-colors mt-2 font-mono uppercase tracking-wider"
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-[1px] bg-white/10" />
              <span className="text-xs text-gray-500">or continue with</span>
              <div className="flex-1 h-[1px] bg-white/10" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { img: "/images/products/tl.jpg", label: "Telegram" },
                { img: "/images/products/fb.jpg", label: "Facebook" },
                { img: "/images/products/dc.jpg", label: "Discord" },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onMouseEnter={() => playSciFiSound("hover")}
                  onClick={() => playSciFiSound("click")}
                  className="py-3 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all flex items-center justify-center overflow-hidden"
                  title={s.label}
                >
                  <img
                    src={s.img}
                    alt={s.label}
                    className="w-8 h-8 object-cover rounded-md"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </button>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/* ============================================================
   MORPHING NAVBAR
   ============================================================ */
const MorphingNavbar = ({
  setActivePage,
  activePage,
  onOpenAuth,
}: {
  setActivePage: (p: string) => void;
  activePage: string;
  onOpenAuth: (mode: AuthMode) => void;
}) => {
  const { scrollY } = useScroll();
  const navbarWidth = useTransform(scrollY, [0, 100], ["90%", "auto"]);
  const navbarPadding = useTransform(scrollY, [0, 100], ["0.75rem 2rem", "0.5rem 1.5rem"]);
  const navbarBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0.02)", "rgba(0,0,0,0.85)"]
  );
  const navbarBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0.1)", "rgba(0,191,255,0.5)"]
  );
  const navbarRadius = useTransform(scrollY, [0, 100], ["2rem", "3rem"]);
  const navbarShadow = useTransform(
    scrollY,
    [0, 100],
    ["0 0 0 rgba(0,0,0,0)", "0 8px 32px rgba(0,191,255,0.25)"]
  );

  const handleClick = (page: string) => {
    playSciFiSound("click");
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const navItems = ["home", "about", "store"];

  return (
    <motion.nav
      style={{
        width: navbarWidth,
        padding: navbarPadding,
        backgroundColor: navbarBg,
        borderColor: navbarBorder,
        borderRadius: navbarRadius,
        boxShadow: navbarShadow,
        left: "50%",
        x: "-50%",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-10 z-50 flex items-center justify-between gap-4 md:gap-8 rounded-full border backdrop-blur-xl font-mono"
    >
      <div
        className="flex items-center gap-2 cursor-pointer"
        onMouseEnter={() => playSciFiSound("hover")}
        onClick={() => handleClick("home")}
      >
        <img
          src="/images/products/LMTMARKET.jpg"
          alt="LMTMARKET"
          className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
        <span className="text-lg font-bold tracking-tight font-display hidden sm:inline">
          <span className="text-cyan-400">LMT</span>
          <span className="text-white">MARKET</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item}
            onMouseEnter={() => playSciFiSound("hover")}
            onClick={() => handleClick(item)}
            className={`relative text-sm font-medium transition-colors ${
              activePage === item ? "text-cyan-400 font-bold" : "text-gray-300 hover:text-cyan-400"
            }`}
          >
            <GlitchHoverText text={item.charAt(0).toUpperCase() + item.slice(1)} />
            {activePage === item && (
              <motion.span
                layoutId="activeNav"
                className="absolute -bottom-2 left-0 w-full h-[2px] bg-cyan-400 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onMouseEnter={() => playSciFiSound("hover")}
          onClick={() => {
            playSciFiSound("click");
            onOpenAuth("login");
          }}
          className="px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Login
        </button>
        <button
          onMouseEnter={() => playSciFiSound("hover")}
          onClick={() => {
            playSciFiSound("click");
            onOpenAuth("register");
          }}
          className="px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-cyan-400 text-black hover:bg-cyan-300 transition-colors"
        >
          Register
        </button>
      </div>
    </motion.nav>
  );
};

/* ============================================================
   STATUS BADGE
   ============================================================ */
const StatusBadge = ({ label = "Store online" }: { label?: string }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-[10px] md:text-xs font-mono tracking-[0.25em] uppercase text-cyan-300 shadow-[0_0_12px_rgba(0,191,255,0.2)]">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" />
    </span>
    {label}
  </span>
);

/* ============================================================
   HERO — LANDING
   ============================================================ */
const HeroSectionLanding = ({ onStart }: { onStart: () => void }) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 font-mono">
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background: `radial-gradient(800px at ${mouse.x}px ${mouse.y}px, rgba(0,191,255,0.15), transparent 70%)`,
        }}
      />
      <div className="relative z-10 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: cinematicEase }}
        >
          <StatusBadge label="Store online · Welcome to" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: cinematicEase }}
          className="mt-6 flex justify-center"
        >
          <ElectricStrokeText
            text="LMTMARKET"
            fontSize="140"
            strokeWidth={2.5}
            className="text-center"
          />
        </motion.div>

        <motion.p
          className="hero-description mt-6 font-mono text-gray-400 text-sm md:text-base max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Premium digital products. Instant delivery. The best price on the market.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hero-buttons mt-8 flex justify-center gap-4 flex-wrap"
        >
          <ElectricBorder>
            <button
              onMouseEnter={() => playSciFiSound("hover")}
              onClick={() => {
                playSciFiSound("click");
                onStart();
              }}
              className="button-primary px-8 py-4 rounded-xl font-mono uppercase tracking-wider font-bold cursor-pointer"
            >
              Start Shopping <span aria-hidden>→</span>
            </button>
          </ElectricBorder>
          <ElectricBorder>
            <button
              onMouseEnter={() => playSciFiSound("hover")}
              onClick={() => playSciFiSound("click")}
              className="button-ghost px-8 py-4 rounded-xl font-mono uppercase tracking-wider cursor-pointer"
            >
              View Store
            </button>
          </ElectricBorder>
        </motion.div>

        <motion.div
          className="hero-meta mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <ElectricBorder>
            <div className="p-6 glass-card rounded-2xl border border-cyan-500/20 text-center">
              <strong className="text-3xl text-cyan-400 font-display block mb-1">10+</strong>
              <span className="text-xs text-gray-400 font-mono tracking-wider">TOTAL ORDERS</span>
            </div>
          </ElectricBorder>

          <ElectricBorder>
            <div className="p-6 glass-card rounded-2xl border border-cyan-500/20 text-center">
              <strong className="text-3xl text-purple-400 font-display block mb-1">100+</strong>
              <span className="text-xs text-gray-400 font-mono tracking-wider">HAPPY USERS</span>
            </div>
          </ElectricBorder>

          <ElectricBorder>
            <div className="p-6 glass-card rounded-2xl border border-cyan-500/20 text-center">
              <strong className="text-3xl text-emerald-400 font-display block mb-1">Instant</strong>
              <span className="text-xs text-gray-400 font-mono tracking-wider">DELIVERY</span>
            </div>
          </ElectricBorder>
        </motion.div>
      </div>
    </section>
  );
};

/* ============================================================
   HERO — FULL
   ============================================================ */
const HeroSectionFull = ({ onStart }: { onStart: () => void }) => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.15]);
  const blur = useTransform(scrollYProgress, [0, 0.5], ["0px", "6px"]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 font-mono">
      <div
        className="pointer-events-none fixed inset-0 z-30"
        style={{
          background: `radial-gradient(800px at ${mouse.x}px ${mouse.y}px, rgba(0,191,255,0.12), transparent 70%)`,
        }}
      />
      <motion.div style={{ y, scale, filter: blur }} className="relative z-10 text-center max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: cinematicEase }}
        >
          <StatusBadge label="Building scalable JUNIOR experiences" />
        </motion.div>

        <div className="flex flex-col items-center gap-2 py-8">
          <ElectricStrokeText text="JUNIOR" fontSize="120" strokeWidth={3.5} />
          <ElectricStrokeText text="DEVELOPER" fontSize="100" strokeWidth={1.5} />
        </div>

        <motion.p
          className="hero-description mt-6 font-mono text-gray-400 text-sm md:text-base max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          The premium product and best price. Instant delivery. Secure checkout.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="hero-buttons flex justify-center gap-4 mt-8"
        >
          <ElectricBorder>
            <button
              onMouseEnter={() => playSciFiSound("hover")}
              onClick={() => {
                playSciFiSound("click");
                onStart();
              }}
              className="button-primary px-8 py-4 rounded-xl font-mono uppercase tracking-wider font-bold cursor-pointer"
            >
              Browse Products →
            </button>
          </ElectricBorder>
          <ElectricBorder>
            <button
              onMouseEnter={() => playSciFiSound("hover")}
              onClick={() => playSciFiSound("click")}
              className="button-ghost px-8 py-4 rounded-xl font-mono uppercase tracking-wider cursor-pointer"
            >
              Explore Work
            </button>
          </ElectricBorder>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-wrap justify-center gap-6 mt-12 text-xs text-gray-500 font-mono uppercase tracking-wider"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#22c55e]" /> Instant delivery
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00bfff]" /> Secure checkout
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" /> 24/7 Support
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
};

/* ============================================================
   WORK VIDEO SECTION
   ============================================================ */
const WorkVideoSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const videoScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const videoBlur = useTransform(scrollYProgress, [0, 0.5, 1], ["5px", "0px", "5px"]);

  return (
    <section className="section font-mono">
      <div className="container">
        <div className="text-center mb-12">
          <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
            Our Work in Action
          </ThreeDText>
          <p className="section-subtitle font-mono text-gray-400">Watch how LMTMARKET transforms ideas into reality</p>
        </div>
        <motion.div
          ref={ref}
          style={{ scale: videoScale, filter: videoBlur }}
          className="relative rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20"
        >
          <ElectricBorder>
            <video
              src="/video/work.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-auto rounded-2xl"
              poster="/images/products/gtav.jpg"
            />
          </ElectricBorder>
        </motion.div>
      </div>
    </section>
  );
};

/* ============================================================
   INTERACTIVE TERMINAL
   ============================================================ */
const TERMINAL_COMMANDS: Record<string, { lines: string[]; response: string[] }> = {
  help: {
    lines: ["$ help"],
    response: [
      "Available commands:",
      "  scan     — Scan available products",
      "  stock    — Check stock levels",
      "  verify   — Verify account integrity",
      "  status   — System status",
      "  clear    — Clear terminal",
    ],
  },
  scan: {
    lines: ["$ scan"],
    response: [
      "→ Scanning marketplace...",
      "✓ 21 products found",
      "✓ 15 Steam accounts available",
      "✓ 6 ZIP files available",
      "→ Scan completed in 0.8s",
    ],
  },
  stock: {
    lines: ["$ stock"],
    response: [
      "→ Checking stock...",
      "✓ GTA V: 5 units",
      "✓ FIFA 25: 3 units",
      "✓ SpiderMan: 2 units",
      "→ All items in stock",
    ],
  },
  verify: {
    lines: ["$ verify"],
    response: [
      "→ Verifying account integrity...",
      "✓ All accounts active",
      "✓ No bans detected",
      "✓ Email verified",
      "→ Integrity check passed",
    ],
  },
  status: {
    lines: ["$ status"],
    response: [
      "→ System status:",
      "✓ API: online",
      "✓ Database: connected",
      "✓ Payment: active",
      "✓ Delivery: instant",
    ],
  },
};

const TerminalSection = () => {
  const [lines, setLines] = useState<Array<{ type: string; text: string }>>([
    { type: "info", text: "LMTMARKET Terminal v1.0.0" },
    { type: "info", text: "Type a command or click an option below" },
    { type: "info", text: "" },
  ]);
  const [showCursor, setShowCursor] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursorInterval = setInterval(() => setShowCursor((p) => !p), 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const runCommand = (cmd: string) => {
    playSciFiSound("click");
    const command = TERMINAL_COMMANDS[cmd];
    if (!command) return;
    setLines((prev) => [
      ...prev,
      ...command.lines.map((t) => ({ type: "cmd", text: t })),
      ...command.response.map((t) => ({
        type: t.startsWith("✓") ? "success" : t.startsWith("→") ? "info" : "default",
        text: t,
      })),
      { type: "info", text: "" },
    ]);
  };

  const getLineColor = (type: string) => {
    switch (type) {
      case "cmd": return "text-white";
      case "success": return "text-emerald-400";
      case "info": return "text-cyan-400";
      default: return "text-gray-400";
    }
  };

  return (
    <section className="section font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
            Live Development
          </ThreeDText>
          <p className="section-subtitle font-mono text-gray-400">Interactive terminal — try clicking commands below</p>
        </div>

        <ElectricBorder>
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0c]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-gray-500 font-mono">lmtmarket — terminal</span>
            </div>

            <div ref={scrollRef} className="p-6 h-[380px] overflow-y-auto font-mono text-sm leading-relaxed">
              {lines.map((line, i) => (
                <div key={i} className={`leading-7 ${getLineColor(line.type)}`}>
                  {line.text || "\u00A0"}
                </div>
              ))}
              <span className={`inline-block w-2 h-4 bg-cyan-400 ${showCursor ? "opacity-100" : "opacity-0"}`} />
            </div>

            <div className="border-t border-white/5 p-4 flex flex-wrap gap-2">
              {["help", "scan", "stock", "verify", "status"].map((cmd) => (
                <button
                  key={cmd}
                  onMouseEnter={() => playSciFiSound("hover")}
                  onClick={() => runCommand(cmd)}
                  className="px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 bg-white/5 hover:border-cyan-400/40 hover:bg-cyan-400/10 text-gray-300 hover:text-cyan-400 transition-all cursor-pointer"
                >
                  ${cmd}
                </button>
              ))}
              <button
                onMouseEnter={() => playSciFiSound("hover")}
                onClick={() => {
                  playSciFiSound("click");
                  setLines([{ type: "info", text: "Terminal cleared." }]);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-mono border border-white/10 bg-white/5 hover:border-red-400/40 hover:bg-red-400/10 text-gray-300 hover:text-red-400 transition-all ml-auto cursor-pointer"
              >
                clear
              </button>
            </div>
          </div>
        </ElectricBorder>
      </div>
    </section>
  );
};

/* ============================================================
   DASHBOARD STATS SECTION ( ORIGINAL STRUCTURE + SOFT GLOW ANIMATION )
   ============================================================ */
const DashboardSection = () => {
  const stats = [
    { value: "10", label: "Total Orders", sub: "9+ orders", glow: "bg-cyan-500/10" },
    { value: "128", label: "Total Users", sub: "99+ users", glow: "bg-purple-500/10" },
    { value: "3", label: "Weekly Activity", sub: "orders this week", glow: "bg-emerald-500/10" },
  ];

  return (
    <section className="section dark-section font-mono">
      <div className="container">
        <div className="text-center mb-12">
          <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
            LMTMARKET · Dashboard
          </ThreeDText>
          <p className="section-subtitle font-mono text-gray-400">Real-time marketplace statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: cinematicEase }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="h-full cursor-pointer"
              onMouseEnter={() => playSciFiSound("hover")}
            >
              <ElectricBorder>
                <div className="glass-card p-8 rounded-2xl relative overflow-hidden group h-full border border-cyan-500/10 bg-black/60 backdrop-blur-xl">
                  {/* Glowing Ambient Light on Hover */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${s.glow} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500`} />
                  
                  <div className="relative z-10">
                    <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3 font-mono">{s.label}</p>
                    <p className="font-display text-5xl font-black text-white mb-2 group-hover:text-cyan-300 transition-colors">{s.value}</p>
                    <p className="text-sm text-gray-400 font-mono">{s.sub}</p>
                  </div>
                </div>
              </ElectricBorder>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   TRADING CHART — Cyberpunk Edition with Scanlines & Advanced Laser
   ============================================================ */
const WEEKLY_DATA = [
  { day: "Mon", value: 12 },
  { day: "Tue", value: 18 },
  { day: "Wed", value: 15 },
  { day: "Thu", value: 22 },
  { day: "Fri", value: 30 },
  { day: "Sat", value: 26 },
  { day: "Sun", value: 20 },
];

const TradingChart = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [livePrice, setLivePrice] = useState(30);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentDayIndex = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  }, []);

  const maxValue = Math.max(...WEEKLY_DATA.map((d) => d.value));
  const minValue = Math.min(...WEEKLY_DATA.map((d) => d.value));
  const peakDay = WEEKLY_DATA.reduce((max, d) => (d.value > max.value ? d : max), WEEKLY_DATA[0]);
  const totalOrders = WEEKLY_DATA.reduce((sum, d) => sum + d.value, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const change = (Math.random() - 0.5) * 2;
        return Math.max(15, Math.min(35, prev + change));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= currentDayIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 1400);

    return () => clearInterval(animationInterval);
  }, [currentDayIndex]);

  const width = 800;
  const height = 300;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const points = WEEKLY_DATA.map((d, i) => {
    const x = paddingX + (i / (WEEKLY_DATA.length - 1)) * chartWidth;
    const y = paddingY + chartHeight - ((d.value - minValue) / (maxValue - minValue || 1)) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const currentIndexToShow = hoveredIndex !== null ? hoveredIndex : activeIndex;
  const currentPoint = points[currentIndexToShow];
  const isAtDestination = currentIndexToShow === currentDayIndex;

  return (
    <section className="section font-mono">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
              Weekly Activity
            </ThreeDText>
            <p className="section-subtitle !mx-0 !text-left font-mono text-gray-400">
              {totalOrders} orders this week · Peak day:{" "}
              <span className="text-cyan-400 font-semibold">{peakDay.day}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">Live Orders</p>
              <p className="font-display text-3xl font-black text-cyan-400">
                {livePrice.toFixed(1)}
                <span className="text-sm text-emerald-400 ml-2 font-mono">
                  +{((livePrice - 30) / 30 * 100).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        </div>

        <ElectricBorder>
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-cyan-500/20">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40 z-0" />

            <div className="absolute inset-0 pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-cyan-500/10"
                  style={{ top: `${(i / 4) * 100}%` }}
                />
              ))}
            </div>

            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto relative z-10 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ffff" stopOpacity={isAtDestination ? "0.7" : "0.35"} />
                  <stop offset="100%" stopColor="#00bfff" stopOpacity="0" />
                </linearGradient>

                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00bfff" />
                  <stop offset="50%" stopColor="#00ffff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>

                <linearGradient id="laserBeam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ffff" stopOpacity="1" />
                  <stop offset="50%" stopColor="#00bfff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>

                <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <motion.path
                d={areaPath}
                fill="url(#areaGradient)"
                animate={{ opacity: isAtDestination ? [0.4, 0.9, 0.4] : 0.4 }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />

              <motion.path
                d={linePath}
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#lineGlow)"
              />

              {points.map((p, i) => (
                <circle
                  key={p.day}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#00bfff"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    playSciFiSound("hover");
                    setHoveredIndex(i);
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}

              <motion.g
                animate={{ x: currentPoint.x, y: currentPoint.y }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
              >
                {isAtDestination && (
                  <motion.line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2={height - paddingY - currentPoint.y}
                    stroke="url(#laserBeam)"
                    strokeWidth="3.5"
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: [0, 1, 0.9], scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                    filter="url(#lineGlow)"
                  />
                )}

                <motion.g
                  animate={{ opacity: isAtDestination ? 0 : 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <circle r="9" fill="#00ffff" fillOpacity="0.35" className="animate-ping" />
                  <circle r="5" fill="#00ffff" stroke="#ffffff" strokeWidth="2" />
                </motion.g>

                <motion.g 
                  transform="translate(0, -35)"
                  animate={{ opacity: isAtDestination ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <rect
                    x="-28"
                    y="-12"
                    width="56"
                    height="22"
                    rx="6"
                    fill="#050505"
                    stroke="#00ffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#00ffff"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {currentPoint.value} orders
                  </text>
                </motion.g>
              </motion.g>
            </svg>

            <div className="flex justify-between mt-2 px-2 relative z-10">
              {WEEKLY_DATA.map((d, i) => {
                const isCurrent = currentIndexToShow === i;
                const isToday = i === currentDayIndex;

                return (
                  <span
                    key={d.day}
                    className={`text-xs font-mono transition-all ${
                      isCurrent && !isAtDestination
                        ? "text-cyan-400 font-bold scale-110 drop-shadow-[0_0_8px_rgba(0,191,255,1)]"
                        : isToday
                        ? "text-emerald-400 font-bold border-b border-emerald-400"
                        : "text-gray-500"
                    }`}
                  >
                    {d.day} {isToday && "(Today)"}
                  </span>
                );
              })}
            </div>
          </div>
        </ElectricBorder>
      </div>
    </section>
  );
};

/* ============================================================
   FEEDBACK SECTION
   ============================================================ */
const FEEDBACK_REVIEWS = [
  { name: "ប្រុសស្មោះគឺបង", text: "Fast delivery, legit seller. Got my GTA V account in 2 minutes.", rating: 5, tag: "Steam", time: "5d ago" },
  { name: "កូនឆ្មា", text: "Best prices I've found. Support is very responsive too.", rating: 5, tag: "FIFA", time: "19d ago" },
  { name: "អាកុយ", text: "Smooth checkout and the account works perfectly.", rating: 5, tag: "Steam", time: "25d ago" },
  { name: "សុខា", text: "Been buying here for months. Never disappointed.", rating: 5, tag: "Sound Pack", time: "49d ago" },
  { name: "កុមារទេព", text: "Instant delivery is no joke. 30 seconds after payment.", rating: 5, tag: "ZIP", time: "52d ago" },
];

const FeedbackSection = () => {
  const duplicatedReviews = [...FEEDBACK_REVIEWS, ...FEEDBACK_REVIEWS, ...FEEDBACK_REVIEWS];

  return (
    <section className="section dark-section overflow-hidden font-mono py-28 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[180px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16 relative z-10 container"
      >
        <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
          Feedback
        </ThreeDText>
        <p className="section-subtitle font-mono text-cyan-400 mt-2">What Our Users Say</p>
        <p className="text-gray-400 text-sm mt-1 font-mono">Trusted by thousands of customers worldwide.</p>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-3 mt-6 px-6 py-2.5 rounded-full bg-cyan-950/70 border border-cyan-400/50 backdrop-blur-xl shadow-[0_0_25px_rgba(0,191,255,0.3)] cursor-default"
        >
          <span className="text-yellow-400 text-lg tracking-widest animate-pulse">★★★★★</span>
          <span className="text-white font-bold font-mono">4.9 / 5.0</span>
          <span className="text-cyan-400 text-xs">· 100+ Verified Reviews</span>
        </motion.div>
      </motion.div>

      <div className="relative overflow-hidden w-full py-6">
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

        <motion.div
          className="flex gap-8 whitespace-nowrap w-max"
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
        >
          {duplicatedReviews.map((review, idx) => (
            <motion.div 
              key={idx} 
              className="w-[390px] flex-shrink-0 cursor-pointer"
              onMouseEnter={() => playSciFiSound("hover")}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <ElectricBorder>
                <div className="glass-card p-8 rounded-2xl border border-cyan-500/30 relative overflow-hidden group hover:border-cyan-400 transition-all duration-500 bg-black/60 backdrop-blur-xl h-full flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,191,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyan-400/15 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all" />

                  <div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <div className="flex text-amber-400 text-sm tracking-wider">
                        {"★".repeat(review.rating)}
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 rounded-full font-mono flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Verified
                      </span>
                    </div>

                    <p className="text-gray-200 text-sm mb-6 font-mono whitespace-normal leading-relaxed relative z-10">
                      &quot;{review.text}&quot;
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10 relative z-10 mt-auto">
                    <div>
                      <p className="text-white font-bold text-sm font-display group-hover:text-cyan-300 transition-colors">
                        {review.name}
                      </p>
                      <span className="text-xs text-cyan-400 font-mono">Platform: {review.tag}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                      {review.time}
                    </span>
                  </div>

                </div>
              </ElectricBorder>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ============================================================
   EXPERIENCE SECTION
   ============================================================ */
const ExperienceSection = () => {
  const experiences = [
    { 
      year: "2025 - PRESENT", 
      title: "Junior Developer & Full-Stack Creator", 
      company: "FreeLance / LMTMARKET", 
      desc: "Architecting modern web applications, high-performance UI/UX dashboards, and custom digital asset solutions.",
      tags: ["Next.js", "Tailwind", "Three.js", "Node.js"],
      status: "AVAILABLE FOR HIRE",
      action: "Request Project"
    },
    { 
      year: "2025", 
      title: "FiveM Script & Anti-Cheat Developer", 
      company: "PPRP ReamAngkor", 
      desc: "Engineered custom administrative panels, secure networking protocols, and optimized game-mode architectures for servers.",
      tags: ["Lua", "JavaScript", "SQL", "Security"],
      status: "COMPLETED",
      action: "View Archive"
    },
    { 
      year: "2026", 
      title: "UI/UX & E-commerce System Architect", 
      company: "FreeLance Digital", 
      desc: "Designed and deployed responsive, high-conversion e-commerce storefronts with automated payment integrations.",
      tags: ["Figma", "React", "Stripe API", "UI/UX"],
      status: "SUCCESSFUL",
      action: "View Demos"
    },
    { 
      year: "2026", 
      title: "Software & Security Engineer", 
      company: "Norton University", 
      desc: "Advanced research in system vulnerability assessments, reverse engineering, and defensive script analysis.",
      tags: ["C++", "Cyber Security", "System Architecture"],
      status: "ACADEMIC CORE",
      action: "Research Log"
    },
  ];

  return (
    <section className="section font-mono relative overflow-hidden py-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-600/20 blur-[200px] rounded-full pointer-events-none" />

      <div className="container relative z-10 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: cinematicEase }}
          className="text-center mb-20"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 mb-4 px-5 py-2 rounded-full bg-cyan-950/40 border border-cyan-400/40 text-cyan-300 text-xs backdrop-blur-xl shadow-[0_0_20px_rgba(0,191,255,0.2)] cursor-default"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>SYSTEM STATUS: READY FOR NEW PROJECTS</span>
          </motion.div>

          <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
            Work Experience & Milestones
          </ThreeDText>
          <p className="section-subtitle font-mono text-cyan-300/80 mt-3 max-w-xl mx-auto">
            Professional journey, technical engineering, and verified digital developments.
          </p>
        </motion.div>

        <div className="relative border-l-2 border-cyan-400/40 ml-6 md:ml-12 space-y-16">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              className="relative pl-8 md:pl-14"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.7, ease: cinematicEase }}
            >
              <div className="absolute -left-[9px] top-3 w-4 h-4 bg-cyan-400 rounded-full border-2 border-cyan-950 shadow-[0_0_20px_#00bfff] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>

              <motion.div
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="perspective-1000 cursor-pointer"
                onMouseEnter={() => playSciFiSound("hover")}
              >
                <div className="relative group">
                  <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 opacity-0 group-hover:opacity-100 blur-md transition-all duration-500 pointer-events-none" />

                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-cyan-400 z-30 pointer-events-none group-hover:scale-125 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-cyan-400 z-30 pointer-events-none group-hover:scale-125 transition-transform" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-cyan-400 z-30 pointer-events-none group-hover:scale-125 transition-transform" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-cyan-400 z-30 pointer-events-none group-hover:scale-125 transition-transform" />

                  <div className="p-8 md:p-10 rounded-2xl border border-cyan-500/30 relative overflow-hidden group-hover:border-cyan-300 transition-all duration-500 bg-cyan-950/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,100,150,0.15)] z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,191,255,0.08)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                    <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl group-hover:bg-cyan-400/40 transition-all z-0" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-300 text-xs font-mono bg-cyan-900/40 border border-cyan-400/40 px-3.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_12px_rgba(0,191,255,0.3)]">
                          {exp.year}
                        </span>
                        <span className="text-[10px] bg-teal-950/60 text-teal-300 px-3 py-1 rounded-full border border-teal-400/40 font-mono shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                          {exp.status}
                        </span>
                      </div>
                      <span className="text-cyan-200/70 text-xs font-mono">
                        Organization: <strong className="text-white">{exp.company}</strong>
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold mb-3 font-display text-white group-hover:text-cyan-300 transition-colors relative z-10">
                      {exp.title}
                    </h3>

                    <p className="text-cyan-100/80 text-sm md:text-base font-mono leading-relaxed mb-6 relative z-10">
                      {exp.desc}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-cyan-500/20 relative z-10 mt-auto">
                      <div className="flex flex-wrap gap-2">
                        {exp.tags.map((tag, i) => (
                          <span key={i} className="text-xs bg-cyan-950/50 text-cyan-200 border border-cyan-400/30 px-3.5 py-1 rounded-md font-mono shadow">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => playSciFiSound("click")}
                        className="inline-flex items-center gap-2 bg-cyan-400 text-black hover:bg-cyan-300 px-6 py-2.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,191,255,0.4)] cursor-pointer"
                      >
                        <span>{exp.action}</span>
                        <span>→</span>
                      </motion.button>
                    </div>

                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ============================================================
   FEATURED PROJECTS SECTION
   ============================================================ */
const ProjectsSection = () => {
  const projects = [
    {
      title: "LMTStore Company",
      desc: "Next.js, Stripe, Tailwind E-commerce platform with high performance.",
      videos: ["/video/comingsoon.mp4"],
      tech: ["Next.js", "Tailwind", "Framer Motion"],
    },
    {
      title: "Cheat Menu",
      desc: "Lua, React, WebSockets custom gaming overlay and control panel.",
      videos: ["/video/comingsoon.mp4"],
      tech: ["Lua", "HTML/CSS", "JavaScript"],
    },
    {
      title: "Website Products",
      desc: "Three.js, React Three Fiber immersive 3D interactive portfolio.",
      videos: ["/video/comingsoon.mp4"],
      tech: ["Three.js", "React", "Tailwind"],
    },
  ];

  return (
    <section className="section font-mono relative overflow-hidden py-32">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[180px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: cinematicEase }}
          className="text-center mb-20"
        >
          <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
            Featured Projects
          </ThreeDText>
          <p className="section-subtitle font-mono text-cyan-400 mt-2">
            Interactive previews · Live demos with high-tech execution
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((p, idx) => (
            <ProjectCard key={p.title} project={p} delayIndex={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

const ProjectCard = ({ project, delayIndex }: { project: any; delayIndex: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delayIndex * 0.15, duration: 0.7, ease: cinematicEase }}
      whileHover={{ y: -10, scale: 1.02, rotateX: 2, rotateY: -2 }}
      className="h-full perspective-1000 cursor-pointer"
      onMouseEnter={() => playSciFiSound("hover")}
    >
      <ElectricBorder>
        <div className="group p-8 rounded-3xl h-full border border-teal-500/30 bg-black/60 backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden electric-outline min-h-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:border-cyan-400 transition-all duration-500">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,191,255,0.08)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20" />
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-cyan-400/15 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all z-0" />

          <div className="absolute inset-0 z-0 opacity-75 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none">
            <video
              src={project.videos[0]}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover absolute inset-0"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-2xl font-bold mb-3 font-display text-teal-200/90 group-hover:text-cyan-300 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              <GlitchHoverText text={project.title} />
            </h3>
            
            <p className="text-teal-100/80 mb-6 text-sm font-mono leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
              {project.desc}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tech.map((t: string, i: number) => (
                <span key={i} className="text-xs bg-teal-950/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-400/30 font-mono text-teal-200 shadow group-hover:border-cyan-400/50 transition-colors">
                  {t}
                </span>
              ))}
            </div>

            <button
              onMouseEnter={() => playSciFiSound("hover")}
              onClick={() => playSciFiSound("click")}
              className="text-teal-300 text-sm flex items-center gap-1 group-hover:gap-3 transition-all duration-300 font-mono cursor-pointer mt-auto pt-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-bold group-hover:text-cyan-300"
            >
              Live Preview <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

        </div>
      </ElectricBorder>
    </motion.div>
  );
};

/* ============================================================
   TESTIMONIALS SECTION
   ============================================================ */
const TestimonialsSection = () => {
  const reviews = [
    {
      name: "ប៉ាឈ្មោះអី?",
      platform: "Steam",
      rating: 5,
      comment: "Fast delivery, legit seller. Got my GTA V account in 2 minutes.",
      time: "7 days ago",
      verified: true,
    },
    {
      name: "អាកុយ",
      platform: "FIFA / EA Sports",
      rating: 5,
      comment: "Best prices I've found. Support is very responsive too.",
      time: "10 days",
      verified: true,
    },
    {
      name: "CGTeam",
      platform: "Steam / Sound Packs",
      rating: 5,
      comment: "Smooth checkout and the account works perfectly. Trusted!",
      time: "35 days ago",
      verified: true,
    },
  ];

  return (
    <section className="section font-mono relative overflow-hidden py-32">
      <div className="container relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: cinematicEase }}
          className="text-center mb-20"
        >
          <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
            What Our Users Say
          </ThreeDText>
          <p className="section-subtitle font-mono text-cyan-400 mt-3">
            Trusted by thousands of customers worldwide.
          </p>
          
          <div className="inline-flex items-center gap-3 mt-6 px-6 py-2.5 rounded-full bg-black/60 border border-cyan-500/30 backdrop-blur-md">
            <div className="flex text-amber-400 text-sm tracking-widest">★★★★★</div>
            <span className="text-cyan-300 text-xs font-bold font-mono">4.9/5</span>
            <span className="text-gray-400 text-xs">· 100+ Verified Reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.7, ease: cinematicEase }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="h-full cursor-pointer perspective-1000"
              onMouseEnter={() => playSciFiSound("hover")}
            >
              <div className="relative group h-full">
                <div className="absolute -top-1 -left-1 w-3 h-3 border-t border-l border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 border-t border-r border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />
                <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b border-l border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b border-r border-cyan-400/60 z-30 pointer-events-none group-hover:border-cyan-400 transition-colors" />

                <div className="p-8 rounded-2xl h-full border border-cyan-500/20 flex flex-col justify-between relative overflow-hidden group-hover:border-cyan-400/60 transition-all duration-300 min-h-[260px] bg-black/90 backdrop-blur-xl shadow-xl z-10">
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,191,255,0.03)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                  <div className="absolute top-4 right-6 text-cyan-500/10 text-6xl font-display font-black pointer-events-none select-none group-hover:text-cyan-500/20 transition-colors">
                    “
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex text-amber-400 text-sm tracking-wider">
                        {[...Array(rev.rating)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      {rev.verified && (
                        <span className="text-[10px] bg-emerald-950/40 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                          🟢 Verified Buyer
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed mb-6 font-mono">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10 mt-auto">
                    <div>
                      <h4 className="text-white font-bold text-sm font-display flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                        {rev.name}
                      </h4>
                      <p className="text-xs text-cyan-400/80 font-mono">Platform: {rev.platform}</p>
                    </div>
                    <span className="text-[11px] text-gray-500 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                      {rev.time}
                    </span>
                  </div>

                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ============================================================
   TERMS & POLICIES
   ============================================================ */
const TermsSection = () => {
  const policies = [
    {
      title: "Terms of Service",
      desc: "Agreement to Terms – Welcome to LMTMARKET. By accessing or using our digital marketplace, you agree to be bound by these terms. All accounts and keys are verified and tested prior to instant delivery.",
      tag: "Service Agreement",
    },
    {
      title: "What You Can (and Can't) Do",
      can: [
        "Use the software and accounts for personal use",
        "Access instant updates during your active license",
        "Contact our 24/7 support team for technical assistance",
        "Use on your primary machine securely",
      ],
      cant: [
        "Reverse engineer, crack, or decompile any files",
        "Resell, trade, or transfer your license keys",
        "Use purchased assets for illegal commercial purposes",
        "Share files or exploits with anti-cheat developers",
      ],
      warning: "LMTMARKET is not liable for third-party in-game bans.",
      tag: "Usage Rules",
    },
    {
      title: "Refund Policy",
      desc: "All digital purchases, software keys, and account credentials are final and non-refundable due to the instant delivery nature. Any unauthorized chargebacks or fraud attempts will result in a permanent blacklist and ban.",
      tag: "No Refund Policy",
    },
    {
      title: "Privacy Policy",
      desc: "We collect only necessary operational data (account info, secure payment processing via Stripe, and technical telemetry). We strictly protect your data and never sell or share your personal information with anyone.",
      tag: "Data Protection",
    },
  ];

  return (
    <section className="section dark-section font-mono relative overflow-hidden py-32">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-cyan-500/10 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: cinematicEase }}
          className="text-center mb-20"
        >
          <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
            Terms & Policies
          </ThreeDText>
          <p className="section-subtitle font-mono text-cyan-400 mt-3">
            Everything you need to know about using LMTMARKET safely.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {["🔒 2026 Secured", "⚡ Guaranteed Protection", "👥 200+ Active Users", "🛡️ Terms of Service", "💎 Refund Policy", "🔐 Privacy Policy"].map((t, idx) => (
              <motion.span 
                key={t}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.08, borderColor: "rgba(0,191,255,0.8)" }}
                className="bg-cyan-950/40 text-cyan-300 px-4 py-2 rounded-full border border-cyan-500/30 font-mono text-xs backdrop-blur-md cursor-default shadow-[0_0_15px_rgba(0,191,255,0.15)]"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <div className="space-y-10">
          {policies.map((policy, idx) => (
            <motion.div
              key={policy.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.7, ease: cinematicEase }}
              whileHover={{ y: -6, scale: 1.015 }}
              className="perspective-1000 cursor-pointer"
              onMouseEnter={() => playSciFiSound("hover")}
            >
              <ElectricBorder>
                <div className="glass-card p-8 md:p-10 rounded-3xl border border-cyan-500/25 relative overflow-hidden group hover:border-cyan-400 transition-all duration-500 bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,191,255,0.06)_50%)] bg-[length:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute -right-16 -top-16 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl group-hover:bg-cyan-400/30 transition-all" />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 border-b border-white/10 pb-4">
                    <h3 className="text-2xl md:text-3xl font-bold font-display text-white group-hover:text-cyan-300 transition-colors flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00bfff]" />
                      {policy.title}
                    </h3>
                    <span className="text-xs bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 px-3.5 py-1.5 rounded-full font-mono uppercase tracking-wider w-fit">
                      {policy.tag}
                    </span>
                  </div>

                  {policy.desc && (
                    <p className="text-gray-300 text-sm md:text-base leading-relaxed font-mono relative z-10">
                      {policy.desc}
                    </p>
                  )}

                  {policy.can && policy.cant && (
                    <div className="grid md:grid-cols-2 gap-8 text-sm relative z-10 mt-4">
                      <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/30 backdrop-blur-md">
                        <p className="text-emerald-400 font-bold mb-3 flex items-center gap-2 font-display text-base">
                          <span>✓</span> You Can Do
                        </p>
                        <ul className="space-y-2 text-gray-300 font-mono text-xs md:text-sm">
                          {policy.can.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-400">›</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-950/20 p-5 rounded-2xl border border-red-500/30 backdrop-blur-md">
                        <p className="text-red-400 font-bold mb-3 flex items-center gap-2 font-display text-base">
                          <span>✕</span> You Cannot Do
                        </p>
                        <ul className="space-y-2 text-gray-300 font-mono text-xs md:text-sm">
                          {policy.cant.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-red-400">›</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {policy.warning && (
                    <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
                      <p className="text-amber-400/90 text-xs font-mono flex items-center gap-2 bg-amber-950/30 px-4 py-2.5 rounded-xl border border-amber-500/30 w-fit">
                        <span>⚠️</span> {policy.warning}
                      </p>
                    </div>
                  )}

                </div>
              </ElectricBorder>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

/* ============================================================
   STORE DATA & COMPONENTS
   ============================================================ */
const productsImages = [
  "500+.jpg", "anticheat.jpg", "ark.jpg", "forza5.jpg", "godofwar.jpg",
  "gtav.jpg", "horizon.jpg", "naruto.jpg", "pesfodball.jpg", "Sekiro.jpg",
  "spider.jpg", "theforest.jpg", "witcher.jpg", "chatgptpro", "dcacc", "dcboost", "esign", "FiveMacc",
  "FiveMsetup", "geminipro18month", "IPVanishVPN", "NitroDC",
  "NordVPN", "Rockstarativation"
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((p) => (p + 1) % productsImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="relative w-full h-96 overflow-hidden rounded-2xl mb-12 border border-cyan-500/20">
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
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </AnimatePresence>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {productsImages.map((_, idx) => (
          <button
            key={idx}
            onMouseEnter={() => playSciFiSound("hover")}
            onClick={() => {
              playSciFiSound("click");
              setCurrent(idx);
            }}
            className={`h-2 rounded-full transition-all cursor-pointer ${idx === current ? "bg-cyan-400 w-6" : "bg-white/50 w-2"}`}
          />
        ))}
      </div>
    </div>
  );
};

const InfiniteSlider = ({ direction = "left", speed = 20 }: { direction?: "left" | "right"; speed?: number }) => {
  const duplicated = [...productsImages, ...productsImages];
  return (
    <div className="relative overflow-hidden py-4">
      <motion.div
        className="flex gap-4"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ repeat: Infinity, duration: speed, ease: "linear" }}
      >
        {duplicated.map((img, idx) => (
          <img
            key={idx}
            src={`/images/products/${img}`}
            className="w-48 h-32 object-cover rounded-xl border border-cyan-500/25"
            alt="product"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ))}
      </motion.div>
    </div>
  );
};

type ProductFeature = { label: string; count: number };
type ProductReview = { name: string; text: string; rating: number; tag: string; date: string };
type DurationOption = { label: string; days: number; price: number; originalPrice: number; save?: string };

type Product = {
  id: number;
  slug: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  description: string;
  longDescription: string;
  type: "account" | "zip";
  image: string;
  images?: string[];
  gamesCount?: number;
  level?: number;
  fileSize?: string;
  stockCount?: number;
  features?: ProductFeature[];
  systemRequirements?: string[];
  durationOptions?: DurationOption[];
  reviews?: ProductReview[];
};

const storeProducts: Product[] = [
  {
    id: 101,
    slug: "discord-account",
    title: "Discord Account",
    category: "Discord",
    price: 0.30,
    originalPrice: 2.00,
    description: "Discord account ready to use (0.30$ - 10$).",
    longDescription: "High-quality Discord accounts suitable for various utilities, fully functional and verified.",
    type: "account",
    image: "/images/products/dcacc.jpg",
    stockCount: 10,
  },
  {
    id: 102,
    slug: "discord-nitro-3month",
    title: "Nitro Discord 3 Month",
    category: "Discord",
    price: 4.00,
    originalPrice: 29.99,
    description: "Discord Nitro 3 Months subscription gift link or login.",
    longDescription: "Enjoy all Discord Nitro perks for 3 full months including HD streaming, custom emojis, and big uploads.",
    type: "account",
    image: "/images/products/NitroDC.jpg",
    stockCount: 1,
  },
  {
    id: 103,
    slug: "discord-server-boosts-14x",
    title: "14x 1 Month Server Boosts",
    category: "Discord",
    price: 0.10,
    originalPrice: 20.00,
    description: "Boost your Discord server to Level 3 instantly (14 boosts for 1 month).",
    longDescription: "Instant Level 3 server boost package for 30 days to unlock all community perks.",
    type: "account",
    image: "/images/products/dcboost.jpg",
    stockCount: 0,
  },
  {
    id: 104,
    slug: "rockstar-activation-code",
    title: "Rockstar Activation Code",
    category: "Gaming",
    price: 0.50,
    originalPrice: 29.99,
    description: "Rockstar Games activation key / code.",
    longDescription: "Valid Rockstar activation code for game activation and launcher integration.",
    type: "account",
    image: "/images/products/Rockstarativation.jpg",
    stockCount: 5,
  },
  {
    id: 105,
    slug: "fivem-account-ready",
    title: "FiveM Account Ready",
    category: "FiveM",
    price: 1.00,
    originalPrice: 10.00,
    description: "FiveM ready account with GTA V linked.",
    longDescription: "Fully prepared account ready to join any FiveM roleplay server instantly.",
    type: "account",
    image: "/images/products/FiveMacc.jpg",
    stockCount: 10,
  },
  {
    id: 106,
    slug: "fivem-full-setup",
    title: "FiveM Full Setup",
    category: "FiveM",
    price: 3.00,
    originalPrice: 15.00,
    description: "Complete FiveM full setup service and configuration.",
    longDescription: "Professional full setup for FiveM including necessary files, optimizations, and configurations.",
    type: "zip",
    image: "/images/products/FiveMsetup.jpg",
    fileSize: "500 MB",
    stockCount: 19,
  },
  {
    id: 107,
    slug: "gemini-pro-18month",
    title: "Gemini Pro 18 Month",
    category: "AI Tools",
    price: 2.00,
    originalPrice: 350.00,
    description: "Google Gemini Pro account access for 18 months.",
    longDescription: "Unlock powerful AI capabilities with Gemini Pro subscription for 18 months.",
    type: "account",
    image: "/images/products/geminipro18month.jpg",
    stockCount: 0,
  },
  {
    id: 108,
    slug: "chatgpt-pro-1y",
    title: "ChatGPT Pro 1 Year",
    category: "AI Tools",
    price: 1.00,
    originalPrice: 240.00,
    description: "ChatGPT Pro / Plus account access for 1 year.",
    longDescription: "Advanced AI assistance with ChatGPT Pro access for a full year.",
    type: "account",
    image: "/images/products/chatgptpro.jpg",
    stockCount: 0,
  },
  {
    id: 109,
    slug: "nord-vpn-lifetime",
    title: "Nord VPN Lifetime",
    category: "VPN",
    price: 2.00,
    originalPrice: 99.00,
    description: "Nord VPN lifetime warranty / account access.",
    longDescription: "Secure your connection with premium NordVPN lifetime account access.",
    type: "account",
    image: "/images/products/NordVPN.jpg",
    stockCount: 0,
  },
  {
    id: 110,
    slug: "ip-vanish-vpn-1-year",
    title: "IP Vanish VPN 1 Year",
    category: "VPN",
    price: 1.00,
    originalPrice: 45.00,
    description: "IP Vanish VPN subscription for 1 year.",
    longDescription: "High-speed secure VPN connection for 1 year.",
    type: "account",
    image: "/images/products/IPVanishVPN.jpg",
    stockCount: 0,
  },
  {
    id: 111,
    slug: "esign",
    title: "Esign",
    category: "Tools",
    price: 7.25,
    originalPrice: 25.00,
    description: "Esign signing utility and certificate service (7$ - 25$).",
    longDescription: "Reliable Esign solution for applications and digital documents.",
    type: "zip",
    image: "/images/products/esign.png",
    fileSize: "50 MB",
    stockCount: 10,
  },
  {
    id: 1,
    slug: "steam-gta-v",
    title: "Steam Account - GTA V",
    category: "Steam Account",
    price: 5.25,
    originalPrice: 59.99,
    description: "Grand Theft Auto V - Online & Offline. FiveM Ready.",
    longDescription: "Experience the award-winning Grand Theft Auto V with full online access. Ready for FiveM roleplay servers. Account comes with verified email and no bans.",
    type: "account",
    image: "/images/products/gtav.jpg",
    images: ["/images/products/gtav.jpg"],
    gamesCount: 2,
    level: 25,
    stockCount: 1,
    systemRequirements: ["Windows 10/11", "Intel/AMD", "Steam/Epic", "8GB RAM"],
    features: [
      { label: "Combat", count: 11 },
      { label: "ESP (Player)", count: 14 },
      { label: "ESP (Vehicle)", count: 9 },
      { label: "Miscellaneous", count: 7 },
      { label: "Settings", count: 4 },
    ],
    durationOptions: [
      { label: "1 Day", days: 1, price: 7.5, originalPrice: 7.5 },
      { label: "7 Days", days: 7, price: 17.5, originalPrice: 17.5, save: "Save 67%" },
      { label: "30 Days", days: 30, price: 34.99, originalPrice: 34.99, save: "Save 84%" },
    ],
    reviews: [
      { name: "Ashura", text: "ESP works perfectly, can see every turret and player. Zero bans.", rating: 5, tag: "ARK Evolved", date: "2 weeks ago" },
      { name: "A3rian", text: "Silent aim is crazy good. Vehicle spawner saves so much time.", rating: 5, tag: "FiveM", date: "5 days ago" },
    ],
  },
  { id: 2, slug: "steam-fifa-25", title: "Steam Account - FIFA 25", category: "Steam Account", price: 0.02, originalPrice: 69.99, description: "FIFA 25 Ultimate Team, Career Mode, Online Access", longDescription: "FIFA 25 with full online access. Build your ultimate team and compete worldwide.", type: "account", image: "/images/products/fifa.jpg", gamesCount: 1, level: 18, stockCount: 1 },
  { id: 3, slug: "steam-spiderman", title: "Steam Account - SpiderMan", category: "Steam Account", price: 0.03, originalPrice: 59.99, description: "Marvel's Spider-Man Remastered + Miles Morales", longDescription: "Both Spider-Man games included. Full access.", type: "account", image: "/images/products/spider.jpg", gamesCount: 2, level: 12, stockCount: 1 },
  { id: 4, slug: "steam-rdr2", title: "Steam Account - RDR2", category: "Steam Account", price: 0.03, originalPrice: 69.99, description: "Red Dead Redemption 2 - Story + Online", longDescription: "Complete Red Dead Redemption 2 experience.", type: "account", image: "/images/products/rdr2.jpg", gamesCount: 2, level: 20, stockCount: 1 },
  { id: 5, slug: "steam-god-of-war", title: "Steam Account - God Of War", category: "Steam Account", price: 0.02, originalPrice: 59.99, description: "God of War (2018) + Ragnarok", longDescription: "Both God of War titles.", type: "account", image: "/images/products/godofwar.jpg", gamesCount: 2, level: 15, stockCount: 2 },
  { id: 6, slug: "steam-horizon", title: "Steam Account - Horizon", category: "Steam Account", price: 0.03, originalPrice: 59.99, description: "Horizon Zero Dawn + Forbidden West", longDescription: "Both Horizon games.", type: "account", image: "/images/products/horizon.jpg", gamesCount: 2, level: 14, stockCount: 1 },
  { id: 7, slug: "steam-the-forest", title: "Steam Account - The Forest", category: "Steam Account", price: 0.01, originalPrice: 19.99, description: "The Forest + Sons of The Forest", longDescription: "Both survival games.", type: "account", image: "/images/products/theforest.jpg", gamesCount: 2, level: 10, stockCount: 1 },
  { id: 8, slug: "steam-witcher-3", title: "Steam Account - Witcher 3", category: "Steam Account", price: 0.01, originalPrice: 39.99, description: "The Witcher 3: Wild Hunt Complete Edition", longDescription: "Complete edition with all DLCs.", type: "account", image: "/images/products/witcher.jpg", gamesCount: 2, level: 22, stockCount: 1 },
  { id: 9, slug: "steam-football-26", title: "Steam Account - Football 26", category: "Steam Account", price: 0.01, originalPrice: 59.99, description: "Football 26 - Ultimate Team, Career Mode", longDescription: "Latest football game.", type: "account", image: "/images/products/pesfodball.jpg", gamesCount: 1, level: 16, stockCount: 1 },
  { id: 10, slug: "steam-forza-5", title: "Steam Account - Forza 5", category: "Steam Account", price: 0.02, originalPrice: 59.99, description: "Forza Horizon 5 - Premium Edition", longDescription: "Premium edition with all cars.", type: "account", image: "/images/products/forza5.jpg", gamesCount: 1, level: 30, stockCount: 1 },
  { id: 11, slug: "steam-black-myth-wukong", title: "Steam Account - Black Myth Wukong", category: "Steam Account", price: 0.01, originalPrice: 59.99, description: "Black Myth: Wukong - Full Game", longDescription: "Full game.", type: "account", image: "/images/products/blackwukong.jpg", gamesCount: 1, level: 8, stockCount: 1 },
  { id: 12, slug: "steam-naruto", title: "Steam Account - Naruto", category: "Steam Account", price: 0.02, originalPrice: 49.99, description: "Naruto Ultimate Ninja Storm Series", longDescription: "All Naruto Storm games.", type: "account", image: "/images/products/naruto.jpg", gamesCount: 1, level: 35, stockCount: 1 },
  { id: 13, slug: "steam-ark", title: "Steam Account - ARK", category: "Steam Account", price: 0.01, originalPrice: 49.99, description: "ARK Survival Evolved + All DLCs", longDescription: "Complete ARK experience.", type: "account", image: "/images/products/ark.jpg", gamesCount: 2, level: 50, stockCount: 1 },
  { id: 14, slug: "steam-sekiro", title: "Steam Account - Sekiro", category: "Steam Account", price: 0.01, originalPrice: 59.99, description: "Sekiro: Shadows Die Twice - GOTY", longDescription: "Game of the Year edition.", type: "account", image: "/images/products/sekiro.jpg", gamesCount: 1, level: 12, stockCount: 1 },
  { id: 15, slug: "steam-500-games", title: "Steam Account - 500+ Games Bundle", category: "Steam Account", price: 0.1, originalPrice: 499.99, description: "Mega Bundle - 500+ Premium Steam Games!", longDescription: "Huge library of games.", type: "account", image: "/images/products/500+.jpg", gamesCount: 2, level: 99, stockCount: 1 },
  { id: 16, slug: "atr-sample-pack", title: "ATR SAMPLE PACK", category: "ZIP File", price: 0.02, originalPrice: 19.99, description: "1000+ Items - Professional Sound Effects", longDescription: "Professional sound effects pack.", type: "zip", image: "/images/products/atrsample.jpg", fileSize: "2.5 GB", stockCount: 0 },
  { id: 17, slug: "atr-stup-super", title: "ATR STUP SUPER", category: "ZIP File", price: 0.03, originalPrice: 29.99, description: "Premium Studio Stup Super Pack", longDescription: "Premium studio pack.", type: "zip", image: "/images/products/atrstup.jpg", fileSize: "3.2 GB", stockCount: 2 },
  { id: 18, slug: "hso-sample-recording", title: "HSO Sample Recording", category: "ZIP File", price: 0.01, originalPrice: 14.99, description: "HSO Studio Quality Sample Recordings", longDescription: "High quality recordings.", type: "zip", image: "/images/products/hso_sample.jpg", fileSize: "1.8 GB", stockCount: 0 },
  { id: 19, slug: "roblox-menu", title: "Roblox Menu", category: "ZIP File", price: 0.01, originalPrice: 4.99, description: "Roblox Custom Menu UI - Scripts", longDescription: "Custom menu scripts.", type: "zip", image: "/images/products/robloxmenu.jpg", fileSize: "50 MB", stockCount: 1 },
  { id: 20, slug: "anticheat-roblox-server", title: "AntiCheat Roblox Server", category: "ZIP File", price: 0.05, originalPrice: 19.99, description: "Advanced Anticheat for Roblox", longDescription: "Advanced anticheat.", type: "zip", image: "/images/products/anticheat.jpg", fileSize: "15 MB", stockCount: 0 },
  { id: 21, slug: "fivem-cheat-ambani", title: "FiveM Cheat Ambani", category: "ZIP File", price: 0.03, originalPrice: 29.99, description: "Premium FiveM Cheat Menu - Aimbot, ESP", longDescription: "Premium cheat menu.", type: "zip", image: "/images/products/ambanicheat.jpg", fileSize: "120 MB", stockCount: 0 },
];

/* ============================================================
   QUICK VIEW MODAL COMPONENT
   ============================================================ */
const QuickViewModal = ({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) => {
  if (!product) return null;

  return (
    <Dialog.Root open={!!product} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl z-[100] rounded-3xl border border-cyan-500/40 bg-[#0a0a0c]/95 backdrop-blur-2xl p-6 md:p-8 shadow-2xl focus:outline-none font-mono">
          <Dialog.Close asChild>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:border-cyan-400/40 transition-colors"
            >
              ✕
            </button>
          </Dialog.Close>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border border-cyan-500/20 bg-black/50 aspect-square">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>

            <div className="flex flex-col relative">
              <span className="text-xs text-cyan-400 uppercase tracking-widest mb-1">
                {product.category}
              </span>
              <h2 className="text-2xl font-bold text-white mb-2 font-display">
                {product.title}
              </h2>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                {product.longDescription}
              </p>

              {/* REAL-TIME LOW STOCK BADGE */}
              {product.stockCount === 0 ? (
                <span className="bg-gray-900/90 text-red-400 border border-red-500/50 text-[10px] px-3 py-1 rounded-full font-mono uppercase tracking-wider font-bold w-fit mb-4">
                  🚫 Out of Stock
                </span>
              ) : product.stockCount && product.stockCount <= 3 ? (
                <span className="bg-red-600/90 text-white text-[10px] px-3 py-1 rounded-full font-mono animate-pulse font-bold w-fit mb-4">
                  LOW STOCK: {product.stockCount} LEFT
                </span>
              ) : (
                <div className="flex items-center gap-2 bg-black/80 backdrop-blur text-white text-[10px] px-3 py-1 rounded-full border border-white/20 font-mono w-fit mb-4">
                  <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Updating</span>
                  <span className="text-emerald-400">Undetected</span>
                </div>
              )}

              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-3xl font-bold text-cyan-400 font-display">
                    ${product.price}
                  </span>
                  <span className="text-gray-500 line-through text-sm ml-2">
                    ${product.originalPrice}
                  </span>
                </div>
                <button
                  onClick={() => playSciFiSound("purchase")}
                  className="bg-cyan-400 text-black hover:bg-cyan-300 px-6 py-3 rounded-full text-sm font-bold transition-colors uppercase tracking-wider cursor-pointer font-mono"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/* ============================================================
   PRODUCT CARD COMPONENT
   ============================================================ */
const ProductCard = ({
  product,
  onSelect,
  onQuickView,
}: {
  product: Product;
  onSelect: () => void;
  onQuickView: (e: React.MouseEvent, p: Product) => void;
}) => {
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <TiltCard>
      <ElectricBorder>
        <GlowBorder>
          <div
            onMouseEnter={() => playSciFiSound("hover")}
            className="glass-card rounded-2xl overflow-hidden group cursor-pointer hover:-translate-y-2 transition-all duration-300 h-full flex flex-col font-mono"
            onClick={() => {
              playSciFiSound("click");
              onSelect();
            }}
          >
            <div className="relative h-48">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-mono">
                -{discountPercent}%
              </span>
              <span className="absolute top-3 left-3 bg-black/70 backdrop-blur text-cyan-400 text-xs px-2 py-1 rounded-full font-mono border border-cyan-400/30">
                {product.category}
              </span>

              {/* REAL-TIME LOW STOCK BADGE */}
              {product.stockCount && product.stockCount <= 3 ? (
                <span className="absolute bottom-3 right-3 bg-red-600/90 text-white text-[10px] px-2 py-1 rounded-full font-mono animate-pulse">
                  LOW STOCK: {product.stockCount} LEFT
                </span>
              ) : (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/80 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full border border-white/20 font-mono">
                  <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Updating</span>
                  <span className="text-emerald-400">Undetected</span>
                </div>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col font-mono">
              <h3 className="text-lg font-bold mb-1 font-display text-white">
                <GlitchHoverText text={product.title} />
              </h3>
              <p className="text-gray-400 text-xs mb-3 leading-relaxed">
                {product.description.substring(0, 80)}...
              </p>
              {product.type === "account" && (
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  <span className="bg-white/10 px-2 py-1 rounded-full text-cyan-300">
                    🎮 {product.gamesCount} Games
                  </span>
                  <span className="bg-white/10 px-2 py-1 rounded-full text-purple-300">
                    Level {product.level}
                  </span>
                </div>
              )}
              {product.type === "zip" && (
                <div className="mb-3 text-xs text-gray-400">
                  📦 Size: {product.fileSize}
                </div>
              )}
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10 gap-2">
                <div>
                  <span className="text-xl font-bold text-cyan-400 font-display">
                    ${product.price}
                  </span>
                  <span className="text-gray-500 line-through text-xs ml-1 font-mono">
                    ${product.originalPrice}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => onQuickView(e, product)}
                    className="bg-white/10 hover:bg-cyan-400/20 text-cyan-400 border border-cyan-400/40 px-3 py-2 rounded-full text-xs font-bold transition-all font-mono"
                  >
                    Quick View
                  </button>
                  <button
                    onMouseEnter={() => playSciFiSound("hover")}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSciFiSound("purchase");
                    }}
                    className="bg-cyan-400 text-black hover:bg-cyan-300 px-4 py-2 rounded-full text-xs font-bold transition-colors font-mono cursor-pointer"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </GlowBorder>
      </ElectricBorder>
    </TiltCard>
  );
};

/* ============================================================
   PRODUCT DETAIL PAGE
   ============================================================ */
const ProductDetailPage = ({
  product,
  onBack,
  onPurchase,
}: {
  product: Product;
  onBack: () => void;
  onPurchase: (product: Product, duration?: number) => void;
}) => {
  const [selectedDuration, setSelectedDuration] = useState(
    product.durationOptions?.[0] || null
  );

  const displayPrice = selectedDuration ? selectedDuration.price : product.price;
  const displayOriginal = selectedDuration
    ? selectedDuration.originalPrice
    : product.originalPrice;

  return (
    <main className="relative z-0 min-h-screen pt-32 pb-32 font-mono">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10 opacity-20"
        src="/video/vdoback.mp4"
        poster="/images/products/gtav.jpg"
      />
      <div className="max-w-7xl mx-auto px-6">
        <button
          onMouseEnter={() => playSciFiSound("hover")}
          onClick={() => {
            playSciFiSound("click");
            onBack();
          }}
          className="mb-8 inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors text-sm font-mono cursor-pointer"
        >
          ← Back to Store
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <ElectricBorder>
              <div className="relative rounded-2xl overflow-hidden bg-black/40 aspect-video lg:aspect-square">
                <img
                  src={product.images?.[0] || product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <div className="absolute top-4 left-4 flex gap-2 font-mono">
                  {product.type === "account" && (
                    <span className="bg-cyan-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Steam
                    </span>
                  )}
                  {product.type === "zip" && (
                    <span className="bg-purple-500/90 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      ZIP
                    </span>
                  )}
                </div>
              </div>
            </ElectricBorder>
          </div>

          <div className="flex flex-col font-mono">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider">
                ✓ Undetected
              </span>
              <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 text-xs px-3 py-1 rounded-full font-mono uppercase tracking-wider">
                Spoofer Included
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-black text-white leading-tight mb-2">
              <GlitchHoverText text={product.title} />
            </h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {product.longDescription}
            </p>

            <div className="mb-8 font-mono">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-black text-cyan-400 font-display">
                  ${displayPrice}
                </span>
                {displayOriginal > displayPrice && (
                  <span className="text-gray-500 line-through text-lg">
                    ${displayOriginal}
                  </span>
                )}
              </div>
            </div>

            <button
              onMouseEnter={() => playSciFiSound("hover")}
              onClick={() => {
                playSciFiSound("purchase");
                onPurchase(product, selectedDuration?.days);
              }}
              className="w-full py-4 rounded-full bg-cyan-400 text-black font-bold text-lg hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/20 mb-4 font-mono uppercase tracking-wider cursor-pointer"
            >
              Purchase Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ============================================================
   STORE PAGE
   ============================================================ */
const StorePage = ({
  onSelectProduct,
  onQuickView,
}: {
  onSelectProduct: (p: Product) => void;
  onQuickView: (e: React.MouseEvent, p: Product) => void;
}) => {
  const [filter, setFilter] = useState<"all" | "account" | "zip">("all");
  const [search, setSearch] = useState("");

  const filtered = storeProducts.filter((p) => {
    const matchFilter = filter === "all" || p.type === filter;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <main className="relative z-0 min-h-screen pt-32 pb-32 font-mono">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
        src="/video/vdoback.mp4"
        poster="/images/products/gtav.jpg"
      />
      <div className="max-w-7xl mx-auto px-6">
        <HeroCarousel />
        <InfiniteSlider direction="left" speed={25} />

        <div className="mt-16">
          <div className="text-center mb-12">
            <ThreeDText variant="shimmer" as="h2" className="section-title-text font-display">
              Store
            </ThreeDText>
            <p className="section-subtitle font-mono text-gray-400">
              Choose the perfect solution for your needs.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-10 font-mono">
            {(["all", "account", "zip"] as const).map((f) => (
              <button
                key={f}
                onMouseEnter={() => playSciFiSound("hover")}
                onClick={() => {
                  playSciFiSound("click");
                  setFilter(f);
                }}
                className={`px-5 py-2 rounded-full text-sm border transition-all cursor-pointer ${
                  filter === f
                    ? "bg-cyan-400 text-black font-bold border-cyan-400"
                    : "bg-white/5 border-white/10 text-white hover:border-cyan-400/40"
                }`}
              >
                {f === "all" ? "All" : f === "account" ? "Products" : "Products Developer"}
              </button>
            ))}
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={() => onSelectProduct(p)}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

/* ============================================================
   ABOUT SECTION — Clean Transparent (No Background Box)
   ============================================================ */
const AboutSection = () => {
  return (
    <section className="section font-mono relative overflow-hidden py-32">
      {/* Background Cyber Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-cyan-500/10 blur-[200px] rounded-full pointer-events-none" />

      <div className="container relative z-10 max-w-5xl mx-auto">
        
        {/* Header Title */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: cinematicEase }}
          className="text-center mb-16 flex flex-col items-center gap-2"
        >
          <ElectricStrokeText
            text="ABOUT ME"
            fontSize="90"
            strokeWidth={2.5}
            className="text-center"
          />
          
          <p className="font-mono text-cyan-400 text-sm md:text-base tracking-widest uppercase mt-2">
            Passionate Junior Developer, Game Asset Creator & Malware Analysis.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: cinematicEase }}
          className="p-4 md:p-8 relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
            
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-48 h-48 rounded-2xl border-2 border-cyan-400/80 overflow-hidden shadow-[0_0_35px_rgba(0,191,255,0.4)] bg-black/40 relative cursor-pointer"
              >
                <img
                  src="/images/products/LMTMARKET.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </motion.div>
            </div>

            <div className="md:col-span-2 space-y-5 font-mono">
              <h3 className="text-2xl md:text-3xl font-bold font-display text-white relative group cursor-pointer inline-block overflow-hidden">
                <span className="group-hover:text-cyan-300 transition-colors duration-300">LMT MARKET</span>
                <span className="text-cyan-400 text-lg ml-2">(LoseMarTeam)</span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
                />
              </h3>

              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                I operate <strong className="text-cyan-300">LMT Market</strong>, focusing on game assets, modifications, software scripts, and high-performance digital utilities. With deep expertise in Next.js, Tailwind, Lua, and Security Engineering at DiGit4 Cyb3r APT, I build secure and responsive platforms.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  whileHover={{ scale: 1.08, x: 3 }}
                  className="text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-400/40 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.2)] backdrop-blur-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  ⚡ Full-Stack Developer
                </motion.span>

                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.2 }}
                  whileHover={{ scale: 1.08, x: 3 }}
                  className="text-xs bg-teal-950/60 text-teal-300 border border-teal-400/40 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.2)] backdrop-blur-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                  🎮 FiveM & Game Modder
                </motion.span>

                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.4 }}
                  whileHover={{ scale: 1.08, x: 3 }}
                  className="text-xs bg-blue-950/60 text-blue-300 border border-blue-400/40 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)] backdrop-blur-md cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  🛡️ Security Enthusiast
                </motion.span>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};

/* ============================================================
   HIGHLIGHTS SECTION — Ocean Theme with Wave Animation (No Icons)
   ============================================================ */
const HighlightsSection = () => {
  const highlights = [
    {
      title: "FULLSTACK DEVELOPER",
      desc: "End-to-end web solutions with Next.js, Node.js, PostgreSQL, and modern cloud infrastructure.",
      tags: ["Next.js", "Node.js", "PostgreSQL", "Docker"],
      video: "/video/react.mp4",
    },
    {
      title: "LMT MARKET",
      desc: "Premium digital marketplace for Steam accounts, sound packs, cheat engines, and more.",
      tags: ["E-commerce", "Steam", "Instant Delivery", "Secure"],
      video: "/video/steam1.mp4",
    },
    {
      title: "Terms & Policies",
      desc: "Clear, fair, and transparent policies to protect your usage and our services.",
      tags: ["Privacy", "Refund", "Security", "Legal"],
      video: "/video/term-poli.mp4",
    },
  ];

  return (
    <section className="section font-mono relative overflow-hidden py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-600/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="container relative z-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6, ease: cinematicEase }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative p-8 rounded-2xl border border-cyan-400/40 bg-cyan-950/20 backdrop-blur-xl shadow-[0_15px_35px_rgba(0,191,255,0.15)] flex flex-col justify-between group overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 z-0 opacity-30 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/90 via-black/50 to-transparent z-10" />
                <video
                  src={item.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover filter brightness-90 contrast-110"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>

              <div className="relative z-10">
                <motion.h4 
                  className="text-xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-teal-300 to-cyan-400 mb-3 transition-all duration-300 group-hover:tracking-wider"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  {item.title}
                </motion.h4>

                <p className="text-cyan-100/80 text-xs md:text-sm font-mono leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="relative z-10 flex flex-wrap gap-2 pt-4 border-t border-cyan-500/30">
                {item.tags.map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-[10px] bg-cyan-950/80 text-cyan-200 px-2.5 py-1 rounded border border-cyan-400/40 font-mono shadow-[0_0_10px_rgba(0,191,255,0.1)] group-hover:border-cyan-300 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ============================================================
   COMBINED ABOUT PAGE
   ============================================================ */
const CombinedAboutPage = () => (
  <main className="relative z-10 pt-20 font-mono">
    <ParallaxBlurReveal><AboutSection /></ParallaxBlurReveal>
    <ParallaxBlurReveal><HighlightsSection /></ParallaxBlurReveal>
    <ParallaxBlurReveal><ExperienceSection /></ParallaxBlurReveal>
    <ParallaxBlurReveal><ProjectsSection /></ParallaxBlurReveal>
    <ParallaxBlurReveal><TerminalSection /></ParallaxBlurReveal>
    <ParallaxBlurReveal><TestimonialsSection /></ParallaxBlurReveal>
    <ParallaxBlurReveal><TermsSection /></ParallaxBlurReveal>
  </main>
);

const AnimatedWorkVideo = withScrollAnimation(WorkVideoSection);
const AnimatedTerminal = withScrollAnimation(TerminalSection);
const AnimatedDashboard = withScrollAnimation(DashboardSection);
const AnimatedWeeklyActivity = withScrollAnimation(TradingChart);
const AnimatedFeedback = withScrollAnimation(FeedbackSection);

const FullHomePage = ({ onStart }: { onStart: () => void }) => (
  <>
    <HeroSectionFull onStart={onStart} />
    <AnimatedWorkVideo />
    <ParallaxBlurReveal><AnimatedTerminal /></ParallaxBlurReveal>
    <ParallaxBlurReveal><AnimatedDashboard /></ParallaxBlurReveal>
    <ParallaxBlurReveal><AnimatedWeeklyActivity /></ParallaxBlurReveal>
    <ParallaxBlurReveal><AnimatedFeedback /></ParallaxBlurReveal>
  </>
);

/* ============================================================
   BACKGROUND EFFECTS & UTILITIES
   ============================================================ */
const GlowOrbs = () => (
  <>
    <div className="fixed top-[-20%] left-[10%] w-[800px] h-[800px] bg-cyan-500/30 blur-[200px] rounded-full pointer-events-none z-0" />
    <div className="fixed bottom-[-20%] right-[10%] w-[800px] h-[800px] bg-purple-500/30 blur-[200px] rounded-full pointer-events-none z-0" />
  </>
);

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 origin-left z-50"
      style={{ scaleX: scrollYProgress }}
    />
  );
};

/* ============================================================
   FOOTER
   ============================================================ */
const Footer = () => {
  const quickLinks = [
    "Home", "Products", "Cart", "Customer", "FAQ",
    "Support", "Terms", "Privacy Policy", "Contact",
  ];

  return (
    <footer className="relative mt-24 border-t border-cyan-500/20 bg-black/60 backdrop-blur-xl font-mono">
      <div className="container px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="/images/products/LMTMARKET.jpg"
                alt="LMTMARKET"
                className="w-11 h-11 rounded-xl object-cover shadow-lg shadow-cyan-500/20 ring-1 ring-white/10"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span className="font-display text-2xl font-bold tracking-tight">
                <span className="text-cyan-400">LMT</span>
                <span className="text-white">MARKET</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-mono">
              LMTMARKET is a legit digital marketplace for accounts and digital keys.
            </p>
          </div>

          <div>
            <h4 className="font-display text-cyan-400 font-semibold text-xs uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs font-mono">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    onMouseEnter={() => playSciFiSound("hover")}
                    onClick={() => playSciFiSound("click")}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-cyan-400 font-semibold text-xs uppercase tracking-widest mb-5">
              Contact
            </h4>
            <ul className="space-y-4 text-xs font-mono">
              <li>
                <a
                  href="mailto:lmtmarketcambodia@gmail.com"
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  ✉️ lmtmarketcambodia@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+855999777168"
                  className="text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  📞 +855 999 777 168
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-cyan-400 font-semibold text-xs uppercase tracking-widest mb-5">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {[
                { img: "/images/products/tl.jpg", href: "https://t.me/nhr_trey", label: "Telegram" },
                { img: "/images/products/fb.jpg", href: "https://www.facebook.com/share/1CBcPKM1nd/", label: "Facebook" },
                { img: "/images/products/dc.jpg", href: "https://discord.gg/ppRPW6yF", label: "Discord" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  onMouseEnter={() => playSciFiSound("hover")}
                  onClick={() => playSciFiSound("click")}
                  className="w-10 h-10 rounded-full border border-cyan-500/30 bg-white/5 flex items-center justify-center overflow-hidden hover:border-cyan-400 transition-all"
                >
                  <img
                    src={s.img}
                    alt={s.label}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 text-center text-gray-500 text-xs font-mono">
          © 2026 LMTMARKET. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

/* ============================================================
   MAIN HOMEPAGE EXPORT
   ============================================================ */
type PageKey = "landing" | "home" | "about" | "store" | "product";

export default function HomePage() {
  const [activePage, setActivePage] = useState<PageKey>("landing");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setActivePage("product");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuickView = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    playSciFiSound("click");
    setQuickViewProduct(p);
  };

  const handleBackToStore = () => {
    setSelectedProduct(null);
    setActivePage("store");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SmoothScrollProvider>
      <div className="relative">
        <CustomCursor />
        <LiveTickerBar />
        <MatrixRainBackground />
        <SiteGrid />
        <CodeBackground />
        <GlowOrbs />
        <Scanlines />
        <ScrollProgress />
        <CommandMenu />
        <LivePurchaseToast />

        {/* 1. LANDING PAGE */}
        {activePage === "landing" && (
          <HeroSectionLanding onStart={() => setActivePage("home")} />
        )}

        {/* 2. NAVBAR & MAIN PAGES */}
        {activePage !== "landing" && (
          <>
            <MorphingNavbar
              setActivePage={(p) => setActivePage(p as PageKey)}
              activePage={activePage}
              onOpenAuth={openAuth}
            />

            {/* HOME PAGE */}
            {activePage === "home" && (
              <FullHomePage onStart={() => setActivePage("store")} />
            )}

            {/* ABOUT PAGE */}
            {activePage === "about" && <CombinedAboutPage />}

            {/* STORE PAGE */}
            {activePage === "store" && (
              <StorePage
                onSelectProduct={handleSelectProduct}
                onQuickView={handleQuickView}
              />
            )}

            {/* PRODUCT DETAIL PAGE */}
            {activePage === "product" && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                onBack={handleBackToStore}
                onPurchase={() => playSciFiSound("purchase")}
              />
            )}

            <ScrollLinkedCounter />
            <Footer />
          </>
        )}

        {/* Modals */}
        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          mode={authMode}
        />
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      </div>
    </SmoothScrollProvider>
  );
}