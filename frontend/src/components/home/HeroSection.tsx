import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Eye, Bell, Sprout, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onSignInClick?: (tab: "login" | "signup") => void;
}

const ease = [0.16, 1, 0.3, 1] as const;

function FloatingCard({
  icon: Icon,
  label,
  sublabel,
  color,
  bg,
  className,
  delay,
}: {
  icon: typeof Shield;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  className: string;
  delay: number;
}) {
  return (
    <motion.div
      className={cn("absolute z-20", className)}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease }}
    >
      <motion.div
        className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/5 dark:shadow-black/20"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
            <Icon className={cn("h-[18px] w-[18px]", color)} />
          </div>
          <div className="pr-1">
            <p className="text-[13px] font-semibold leading-tight">{label}</p>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{sublabel}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SproutOrb() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer glow rings */}
      <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" style={{ animationDuration: "3s" }} />
      <div className="absolute inset-8 rounded-full bg-primary/8 animate-pulse" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
      <div className="absolute inset-16 rounded-full bg-primary/12 animate-pulse" style={{ animationDuration: "5s", animationDelay: "1s" }} />

      {/* Center orb */}
      <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-2xl shadow-primary/20">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/40">
          <Sprout className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Orbiting dots */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute h-2.5 w-2.5 rounded-full bg-primary/60"
          style={{
            top: "50%",
            left: "50%",
            transformOrigin: "0 0",
          }}
          animate={{ rotate: [deg, deg + 360] }}
          transition={{ duration: 12 + i * 2, repeat: Infinity, ease: "linear" }}
          initial={{ x: Math.cos((deg * Math.PI) / 180) * 120 - 5, y: Math.sin((deg * Math.PI) / 180) * 120 - 5 }}
        />
      ))}
    </div>
  );
}

const trustBadges = [
  "No keylogging",
  "COPPA compliant",
  "End-to-end encrypted",
];

export function HeroSection({ onSignInClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const orbScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center pt-20 pb-16 md:pt-28 md:pb-24 px-6 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.3] dark:opacity-[0.1]"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--primary)/0.15) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          {/* Left column */}
          <div className="flex-1 max-w-[640px] text-center lg:text-left">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <Sprout className="h-3.5 w-3.5" />
              Trusted by 10,000+ families
            </motion.div>

            <motion.h1
              className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4rem] font-bold tracking-[-0.02em] mb-6 leading-[1.08]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease }}
            >
              <span className="block">Help your kids</span>
              <span className="block mt-1 sprout-gradient-text">grow safely online.</span>
            </motion.h1>

            <motion.p
              className="text-[17px] md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-[500px] mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease }}
            >
              CyberNest monitors browsing, blocks harmful content, and alerts you instantly — without spying on your child or invading their privacy.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease }}
            >
              <Button
                size="lg"
                className="group text-[15px] h-12 px-7 shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all"
                onClick={() => onSignInClick?.("signup")}
              >
                Start for Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-[15px] h-12 px-7 border-border/60 hover:border-primary/30 hover:bg-primary/5 transition-all"
                onClick={() => onSignInClick?.("login")}
              >
                Sign In
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4, ease }}
            >
              {trustBadges.map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  {badge}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column - Orb + floating cards */}
          <motion.div
            className="flex-1 relative w-full max-w-[480px] aspect-square"
            style={{ scale: orbScale, opacity: orbOpacity }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <SproutOrb />
            </div>

            <FloatingCard
              icon={Shield}
              label="Threat Blocked"
              sublabel="adult-content.example.com"
              color="text-primary"
              bg="bg-primary/10"
              className="top-[12%] -right-2 md:right-2"
              delay={0.8}
            />
            <FloatingCard
              icon={Eye}
              label="Incognito Detected"
              sublabel="Private window opened at 3:42 PM"
              color="text-amber-500"
              bg="bg-amber-500/10"
              className="bottom-[22%] -left-4 md:left-0"
              delay={1.1}
            />
            <FloatingCard
              icon={Bell}
              label="Content Filtered"
              sublabel="Inappropriate image blurred"
              color="text-emerald-500"
              bg="bg-emerald-500/10"
              className="bottom-[6%] right-[8%]"
              delay={1.4}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

